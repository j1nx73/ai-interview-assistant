-- Creating database schema for AI Interview Assistant
-- This script creates all necessary tables and security policies for the AI Interview Assistant

-- Note: Supabase handles JWT secrets automatically, so we don't need to set them manually

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  job_title TEXT,
  company TEXT,
  experience_level TEXT,
  target_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID DEFAULT gen_random_uuid()
);

-- Create speech_records table
CREATE TABLE IF NOT EXISTS speech_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  analysis JSONB,
  feedback TEXT,
  score INTEGER,
  duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resume_analysis table
CREATE TABLE IF NOT EXISTS resume_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_url TEXT,
  job_description TEXT,
  analysis JSONB,
  questions JSONB,
  recommendations TEXT,
  match_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT true,
  notifications_marketing BOOLEAN DEFAULT false,
  privacy_profile_visible BOOLEAN DEFAULT true,
  privacy_data_sharing BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Chat history policies
CREATE POLICY "Users can view own chat history" ON chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat history" ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat history" ON chat_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat history" ON chat_history FOR DELETE USING (auth.uid() = user_id);

-- Speech records policies
CREATE POLICY "Users can view own speech records" ON speech_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own speech records" ON speech_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own speech records" ON speech_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own speech records" ON speech_records FOR DELETE USING (auth.uid() = user_id);

-- Resume analysis policies
CREATE POLICY "Users can view own resume analysis" ON resume_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resume analysis" ON resume_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resume analysis" ON resume_analysis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resume analysis" ON resume_analysis FOR DELETE USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
