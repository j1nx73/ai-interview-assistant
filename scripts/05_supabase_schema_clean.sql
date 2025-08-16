-- AI Interview Assistant Database Schema (Clean Version)
-- This script handles existing objects gracefully

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types (drop and recreate to avoid conflicts)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS question_category CASCADE;

CREATE TYPE user_role AS ENUM ('user', 'premium', 'admin');
CREATE TYPE session_status AS ENUM ('completed', 'in_progress', 'abandoned');
CREATE TYPE question_category AS ENUM ('behavioral', 'technical', 'leadership', 'general');

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_conversations CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.resume_analysis CASCADE;
DROP TABLE IF EXISTS public.speech_analysis CASCADE;
DROP TABLE IF EXISTS public.session_questions CASCADE;
DROP TABLE IF EXISTS public.interview_sessions CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    subscription_tier TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview sessions table
CREATE TABLE public.interview_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category question_category NOT NULL,
    status session_status DEFAULT 'in_progress',
    duration_minutes INTEGER DEFAULT 0,
    score_percentage DECIMAL(5,2),
    feedback_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    text TEXT NOT NULL,
    category question_category NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    tips TEXT[],
    sample_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session questions (many-to-many relationship)
CREATE TABLE public.session_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    user_answer TEXT,
    ai_feedback TEXT,
    score_percentage DECIMAL(5,2),
    response_time_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Speech analysis results
CREATE TABLE public.speech_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    audio_file_url TEXT,
    transcript TEXT,
    confidence_score DECIMAL(5,2),
    speaking_rate_wpm INTEGER,
    filler_words_count INTEGER,
    sentiment_analysis JSONB,
    improvement_suggestions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume analysis results
CREATE TABLE public.resume_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    resume_file_url TEXT,
    job_title TEXT,
    company TEXT,
    match_score DECIMAL(5,2),
    strengths TEXT[],
    weaknesses TEXT[],
    suggestions TEXT[],
    keywords_found TEXT[],
    keywords_missing TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    category question_category NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    best_score DECIMAL(5,2) DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    last_practiced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- User achievements
CREATE TABLE public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    icon_url TEXT,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat bot conversations
CREATE TABLE public.chat_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample questions
INSERT INTO public.questions (text, category, difficulty, tips, sample_answer) VALUES
-- Behavioral Questions
('Tell me about a time when you had to work with a difficult team member. How did you handle the situation?', 'behavioral', 'medium', 
 ARRAY['Use the STAR method', 'Focus on the positive outcome', 'Show your problem-solving skills'], 
 'I once worked with a team member who was consistently negative about our project...'),
('Describe a situation where you had to learn something new quickly. What was your approach?', 'behavioral', 'easy',
 ARRAY['Show your learning process', 'Demonstrate adaptability', 'Highlight quick results'],
 'When I was assigned to a new technology stack, I immediately...'),
('Give me an example of a time when you went above and beyond what was expected of you.', 'behavioral', 'medium',
 ARRAY['Be specific about the extra effort', 'Show initiative', 'Quantify the impact'],
 'During a critical project, I noticed we could improve efficiency by...'),

-- Technical Questions
('Explain the difference between REST and GraphQL APIs.', 'technical', 'medium',
 ARRAY['Compare use cases', 'Discuss pros and cons', 'Give real examples'],
 'REST and GraphQL are both API design approaches, but they differ in...'),
('What is the time complexity of binary search?', 'technical', 'easy',
 ARRAY['Explain the algorithm', 'Show the math', 'Discuss best/worst cases'],
 'Binary search has a time complexity of O(log n) because...'),
('How would you design a scalable database architecture?', 'technical', 'hard',
 ARRAY['Consider read/write patterns', 'Discuss partitioning', 'Mention caching strategies'],
 'For a scalable database, I would start by analyzing the access patterns...'),

-- Leadership Questions
('How do you motivate a team that is facing setbacks?', 'leadership', 'medium',
 ARRAY['Show empathy', 'Discuss communication', 'Highlight team building'],
 'When facing setbacks, I believe in transparent communication...'),
('Describe a time when you had to make a difficult decision that affected your team.', 'leadership', 'hard',
 ARRAY['Show decision-making process', 'Discuss stakeholder management', 'Highlight learning outcomes'],
 'I once had to restructure our team due to budget constraints...'),
('How do you handle conflicts between team members?', 'leadership', 'medium',
 ARRAY['Show mediation skills', 'Discuss conflict resolution', 'Highlight team harmony'],
 'I approach conflicts by first understanding both perspectives...');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_category ON public.interview_sessions(category);
CREATE INDEX IF NOT EXISTS idx_session_questions_session_id ON public.session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_speech_analysis_user_id ON public.speech_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_user_id ON public.resume_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_sessions_updated_at ON public.interview_sessions;
CREATE TRIGGER update_interview_sessions_updated_at BEFORE UPDATE ON public.interview_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resume_analysis_updated_at ON public.resume_analysis;
CREATE TRIGGER update_resume_analysis_updated_at BEFORE UPDATE ON public.resume_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speech_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.interview_sessions;

DROP POLICY IF EXISTS "Users can view own session questions" ON public.session_questions;
DROP POLICY IF EXISTS "Users can view own speech analysis" ON public.speech_analysis;
DROP POLICY IF EXISTS "Users can view own resume analysis" ON public.resume_analysis;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view own chat conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for interview_sessions
CREATE POLICY "Users can view own sessions" ON public.interview_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.interview_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.interview_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.interview_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for other tables (similar pattern)
CREATE POLICY "Users can view own session questions" ON public.session_questions
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM public.interview_sessions WHERE id = session_id
    ));

CREATE POLICY "Users can view own speech analysis" ON public.speech_analysis
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resume analysis" ON public.resume_analysis
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat conversations" ON public.chat_conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat messages" ON public.chat_messages
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM public.chat_conversations WHERE id = conversation_id
    ));

-- Questions table is public (read-only for all users)
CREATE POLICY "Anyone can view questions" ON public.questions
    FOR SELECT USING (true);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    
    -- Initialize progress tracking for all categories
    INSERT INTO public.user_progress (user_id, category)
    VALUES 
        (NEW.id, 'behavioral'),
        (NEW.id, 'technical'),
        (NEW.id, 'leadership'),
        (NEW.id, 'general');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database schema created successfully!' as status;
