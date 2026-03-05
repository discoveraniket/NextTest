-- NexTest Foundational Database Schema
-- Designed for PostgreSQL (Supabase)
-- Updated: includes RLS Policies

-- 1. Create Tables
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 180,
  correct_marks NUMERIC DEFAULT 4.0,
  negative_marks NUMERIC DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  UNIQUE(session_id, name)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- The question text
  options JSONB NOT NULL, -- { "A": "...", "B": "...", ... }
  correct_answer TEXT NOT NULL, -- 'A', 'B', etc.
  explanation TEXT, 
  difficulty_level TEXT DEFAULT 'medium', 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE,
  total_score NUMERIC DEFAULT 0.0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE attempt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT, -- 'A', 'B', 'C', 'D' or NULL
  is_correct BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_responses ENABLE ROW LEVEL SECURITY;

-- 3. Create Basic Policies
-- Everyone (even visitors) can see exams and questions
CREATE POLICY "Allow public read access on exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Allow public insert on exams" ON exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on exams" ON exams FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on sessions" ON exam_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on sessions" ON exam_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow public insert on subjects" ON subjects FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on questions" ON questions FOR INSERT WITH CHECK (true);

-- Users can only see and edit their own profile and attempts
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own attempts" ON attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own responses" ON attempt_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM attempts WHERE attempts.id = attempt_responses.attempt_id AND attempts.user_id = auth.uid())
);
CREATE POLICY "Users can insert own responses" ON attempt_responses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM attempts WHERE attempts.id = attempt_responses.attempt_id AND attempts.user_id = auth.uid())
);

--------------------------------------------------------------------------------
-- 🚨 MISSING UPDATES (Run these if your tables already exist) 🚨
--------------------------------------------------------------------------------

-- 1. Create the missing response table
CREATE TABLE IF NOT EXISTS attempt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT, -- 'A', 'B', 'C', 'D' or NULL
  is_correct BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- 2. Enable Security for the new table
ALTER TABLE attempt_responses ENABLE ROW LEVEL SECURITY;

-- 4. Remove roll_no from profiles (Run this if your profiles table has it)
ALTER TABLE profiles DROP COLUMN IF EXISTS roll_no;

-- 3. Add Security Policies for the new table
-- Run these as separate queries if you get an error that the policy already exists.

-- Check if the response belongs to an attempt owned by the current user
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own responses') THEN
        CREATE POLICY "Users can view own responses" ON attempt_responses FOR SELECT USING (
          EXISTS (SELECT 1 FROM attempts WHERE attempts.id = attempt_responses.attempt_id AND attempts.user_id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own responses') THEN
        CREATE POLICY "Users can insert own responses" ON attempt_responses FOR INSERT WITH CHECK (
          EXISTS (SELECT 1 FROM attempts WHERE attempts.id = attempt_responses.attempt_id AND attempts.user_id = auth.uid())
        );
    END IF;
END $$;
