import os
import json
import hashlib
from dotenv import load_dotenv
from supabase import create_client, Client

# Use the .env file from the App folder
load_dotenv('App/.env')

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
# Use Service Role Key for migration if available, otherwise fallback to Anon Key
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase credentials in App/.env")
    exit(1)

JSON_FILE = "Pinnacle_Railway_f7a7588e.json"
CONTEXT_NAME = "Pinnacle Railway Professional"

s_client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_content_hash(content, options):
    """Creates a unique hash for a question based on its text and options."""
    full_text = f"{content}|{json.dumps(options, sort_keys=True)}"
    return hashlib.md5(full_text.encode()).hexdigest()

def get_or_create_context():
    res = s_client.table('question_contexts').select('*').eq('name', CONTEXT_NAME).execute()
    if res.data:
        return res.data[0]['id']
    
    res = s_client.table('question_contexts').insert({
        'name': CONTEXT_NAME,
        'type': 'book',
        'description': 'Migrated from Pinnacle Railway MCQ JSON'
    }).execute()
    return res.data[0]['id']

def get_or_create_practice_session():
    # 1. Ensure 'General Practice' Exam exists
    res = s_client.table('exams').select('*').eq('name', 'General Practice').execute()
    if res.data:
        exam_id = res.data[0]['id']
    else:
        res = s_client.table('exams').insert({
            'name': 'General Practice',
            'category': 'practice',
            'description': 'Vast pool for subject-wise mastery'
        }).execute()
        exam_id = res.data[0]['id']
    
    # 2. Ensure active practice session exists
    res = s_client.table('exam_sessions').select('*').eq('exam_id', exam_id).execute()
    if res.data:
        return res.data[0]['id']
    
    res = s_client.table('exam_sessions').insert({
        'exam_id': exam_id,
        'year': 2024,
        'duration_minutes': 0, # Untimed
        'is_active': True
    }).execute()
    return res.data[0]['id']

def migrate():
    print(f"🚀 Starting migration from {JSON_FILE}...")
    
    if not os.path.exists(JSON_FILE):
        print(f"❌ Error: {JSON_FILE} not found!")
        return

    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    context_id = get_or_create_context()
    session_id = get_or_create_practice_session()
    
    content = data.get('content', {})
    
    for subject_name, topics in content.items():
        print(f"📚 Processing Subject: {subject_name}")
        
        # Ensure Subject exists for this session
        sub_res = s_client.table('subjects').select('*').eq('session_id', session_id).eq('name', subject_name).execute()
        if sub_res.data:
            subject_id = sub_res.data[0]['id']
        else:
            sub_res = s_client.table('subjects').insert({
                'session_id': session_id,
                'name': subject_name
            }).execute()
            subject_id = sub_res.data[0]['id']

        for topic_name, pages in topics.items():
            print(f"  🏷️ Topic: {topic_name}")
            
            for page_name, questions in pages.items():
                # Some have "Subtopic" as page_name, others just a number
                subtopic = page_name if not page_name.isdigit() else None
                
                print(f"    📄 Subtopic/Page: {page_name} ({len(questions)} q's)")
                
                for q in questions:
                    content = q.get('question')
                    options = q.get('options')
                    answer = q.get('answer')
                    explanation = q.get('explanation')
                    exam_info = q.get('exam_info')
                    
                    # Deduplication Logic
                    # We store the content_hash in metadata to check for duplicates efficiently
                    q_hash = get_content_hash(content, options)
                    
                    # Check if exists
                    check = s_client.table('questions').select('*').eq('subject_id', subject_id).filter('metadata->>content_hash', 'eq', q_hash).execute()
                    
                    if check.data:
                        # Already exists, skip or update? User said "cautious not to make duplicate"
                        continue
                    
                    # Insert new question
                    new_q = {
                        'subject_id': subject_id,
                        'content': content,
                        'options': options,
                        'correct_answer': answer,
                        'explanation': explanation,
                        'topic': topic_name,
                        'subtopic': subtopic,
                        'context_id': context_id,
                        'metadata': {
                            'content_hash': q_hash,
                            'exam_info': exam_info,
                            'book_page': page_name
                        }
                    }
                    
                    try:
                        s_client.table('questions').insert(new_q).execute()
                    except Exception as e:
                        print(f"      ⚠️ Failed to insert question: {e}")

    print("✅ Migration Complete!")

if __name__ == "__main__":
    migrate()
