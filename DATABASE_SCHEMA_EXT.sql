-- NexTest Extended Schema: Practice & Mastery Module
-- Designed for High-Fidelity Learning Analytics and AI Integration
-- Author: Antigravity

--------------------------------------------------------------------------------
-- 1. Metadata Enhancement (The "Context" Framework)
--------------------------------------------------------------------------------

-- Define where questions come from (Books, Specific Exams, General Banks)
CREATE TABLE IF NOT EXISTS question_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g. 'Pinnacle Railway 2024', 'SSC CGL PYQ'
  type TEXT CHECK (type IN ('book', 'exam', 'general', 'custom')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update the main questions table with Taxonomy Tags
-- These columns are indexed for high-performance filtering in Practice Mode
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS subtopic TEXT,
ADD COLUMN IF NOT EXISTS context_id UUID REFERENCES question_contexts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id), -- For future "Create Your Own" features
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'; -- For any additional data (page numbers, etc.)

-- Indexed for fast "Tag" filtering
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_subtopic ON questions(subtopic);
CREATE INDEX IF NOT EXISTS idx_questions_context ON questions(context_id);

--------------------------------------------------------------------------------
-- 2. Granular Telemetry (The "Analytics" Engine)
--------------------------------------------------------------------------------

-- Every practice interaction is a unique log entry (Big-Data READY)
-- This table allows AI models to analyze user speed, hesitation, and patterns
CREATE TABLE IF NOT EXISTS practice_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  context_id UUID REFERENCES question_contexts(id) ON DELETE SET NULL,
  
  is_correct BOOLEAN NOT NULL,
  selected_option TEXT, -- 'A', 'B', 'C', 'D'
  
  time_on_question_ms INTEGER,    -- How long the user spent thinking
  time_on_explanation_ms INTEGER, -- How long the user spent reading the explanation
  interaction_type TEXT DEFAULT 'answer' CHECK (interaction_type IN ('answer', 'skip', 'first_reveal')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for User-specific analysis
CREATE INDEX IF NOT EXISTS idx_telemetry_user_question ON practice_telemetry(user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON practice_telemetry(created_at DESC);

--------------------------------------------------------------------------------
-- 3. Mastery Aggregation (The "Weakness Report" Data)
--------------------------------------------------------------------------------

-- Pre-aggregated mastery stats for fast "Strength vs. Weakness" dashboarding
-- This table can be updated via a Postgres Trigger or scheduled worker
CREATE TABLE IF NOT EXISTS user_mastery_stats (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE, -- Optional: aggregated by subject first
  topic TEXT,
  subtopic TEXT,
  
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  avg_time_ms NUMERIC DEFAULT 0,
  mastery_score NUMERIC DEFAULT 0.0 CHECK (mastery_score >= 0.0 AND mastery_score <= 1.0),
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic, subtopic)
);

--------------------------------------------------------------------------------
-- 4. Security & Access Control (RLS)
--------------------------------------------------------------------------------

ALTER TABLE question_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mastery_stats ENABLE ROW LEVEL SECURITY;

-- Public can read contexts
CREATE POLICY "Allow public read contexts" ON question_contexts FOR SELECT USING (true);

-- Telemetry is Private to User
CREATE POLICY "Users can only view own telemetry" ON practice_telemetry FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own telemetry" ON practice_telemetry FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mastery stats are Private to User
CREATE POLICY "Users can view own mastery" ON user_mastery_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can update mastery" ON user_mastery_stats FOR ALL USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 5. Audit Logging (Optional)
--------------------------------------------------------------------------------
COMMENT ON TABLE practice_telemetry IS 'Granular interaction data for AI strength/weakness analysis.';
COMMENT ON TABLE user_mastery_stats IS 'Aggregated user accuracy and speed ratings per topic/subtopic.';