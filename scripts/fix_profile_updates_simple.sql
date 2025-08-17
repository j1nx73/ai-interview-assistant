-- Simple Fix for Profile Update Issues
-- Run this in your Supabase SQL Editor to fix profile update problems

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate user_profiles table with correct structure
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'premium', 'admin')),
    subscription_tier TEXT,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS on_user_profiles_updated ON public.user_profiles;
CREATE TRIGGER on_user_profiles_updated
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user creation (simplified)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    first_name_val TEXT := NULL;
    last_name_val TEXT := NULL;
    full_name_val TEXT := NULL;
BEGIN
    -- Safely extract metadata if it exists and is valid JSON
    BEGIN
        IF NEW.raw_user_meta_data IS NOT NULL THEN
            first_name_val := NEW.raw_user_meta_data->>'first_name';
            last_name_val := NEW.raw_user_meta_data->>'last_name';
            
            -- Only create full_name if both first and last names exist
            IF first_name_val IS NOT NULL AND last_name_val IS NOT NULL THEN
                full_name_val := first_name_val || ' ' || last_name_val;
            END IF;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            -- If metadata extraction fails, just use NULL values
            first_name_val := NULL;
            last_name_val := NULL;
            full_name_val := NULL;
    END;
    
    INSERT INTO public.user_profiles (id, email, first_name, last_name, full_name, role, timezone)
    VALUES (
        NEW.id,
        NEW.email,
        first_name_val,
        last_name_val,
        full_name_val,
        'user',
        'UTC'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create profiles for existing users (simplified approach)
INSERT INTO public.user_profiles (id, email, first_name, last_name, full_name, role, timezone)
SELECT 
    u.id,
    u.email,
    NULL, -- We'll set these manually if needed
    NULL,
    NULL,
    'user',
    'UTC'
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
);

-- Test the setup
SELECT 'Setup completed successfully!' as status;
SELECT COUNT(*) as user_profiles_count FROM public.user_profiles;
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
