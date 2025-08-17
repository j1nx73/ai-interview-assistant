-- Quick Manual Fix for AI Interview Assistant
-- Run this in your Supabase SQL Editor to fix the main issues

-- 1. Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    subscription_tier TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns to resume_analysis table
ALTER TABLE public.resume_analysis 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS level TEXT,
ADD COLUMN IF NOT EXISTS analysis JSONB,
ADD COLUMN IF NOT EXISTS overall_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS summary_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS experience_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS education_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS skills_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS achievements_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS summary_feedback TEXT[],
ADD COLUMN IF NOT EXISTS experience_feedback TEXT[],
ADD COLUMN IF NOT EXISTS education_feedback TEXT[],
ADD COLUMN IF NOT EXISTS skills_feedback TEXT[],
ADD COLUMN IF NOT EXISTS achievements_feedback TEXT[],
ADD COLUMN IF NOT EXISTS overall_feedback TEXT[];

-- 3. Create user profile for current user (replace with your user ID)
-- You can find your user ID in the auth.users table or from the browser console
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current user ID from auth.users
    SELECT id INTO current_user_id FROM auth.users LIMIT 1;
    
    IF current_user_id IS NOT NULL THEN
        -- Create profile if it doesn't exist
        INSERT INTO public.user_profiles (id, email, first_name, last_name)
        SELECT 
            u.id,
            u.email,
            COALESCE(u.raw_user_meta_data->>'first_name', ''),
            COALESCE(u.raw_user_meta_data->>'last_name', '')
        FROM auth.users u
        WHERE u.id = current_user_id
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'User profile created/verified for user: %', current_user_id;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;

-- 4. Enable RLS and create basic policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own resume analysis" ON public.resume_analysis;
CREATE POLICY "Users can view own resume analysis" ON public.resume_analysis
    FOR ALL USING (auth.uid() = user_id);

-- 5. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- 6. Test the fix
SELECT 'Quick fix completed! Try running resume analysis again.' as status;
