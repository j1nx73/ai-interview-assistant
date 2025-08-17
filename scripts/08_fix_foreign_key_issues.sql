-- Fix Foreign Key Constraint Issues
-- This script resolves the resume_analysis_user_id_fkey violation

-- Step 1: Check current state
SELECT 'Checking current database state...' as step;

-- Check if user_profiles table exists
SELECT 
    'user_profiles table check' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status;

-- Check if auth.users table exists
SELECT 
    'auth.users table check' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status;

-- Step 2: Create user_profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'Creating user_profiles table...';
        
        CREATE TABLE public.user_profiles (
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
        
        RAISE NOTICE 'user_profiles table created successfully';
    ELSE
        RAISE NOTICE 'user_profiles table already exists';
    END IF;
END $$;

-- Step 3: Create or recreate the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user profile already exists
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = NEW.id) THEN
        RAISE NOTICE 'User profile already exists for user %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Insert new user profile
    INSERT INTO public.user_profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    
    RAISE NOTICE 'Created user profile for user %', NEW.id;
    
    -- Initialize progress tracking for all categories
    INSERT INTO public.user_progress (user_id, category)
    VALUES 
        (NEW.id, 'behavioral'),
        (NEW.id, 'technical'),
        (NEW.id, 'leadership'),
        (NEW.id, 'general')
    ON CONFLICT (user_id, category) DO NOTHING;
    
    RAISE NOTICE 'Initialized progress tracking for user %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error creating user profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create or recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Create user_progress table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_progress' AND table_schema = 'public') THEN
        RAISE NOTICE 'Creating user_progress table...';
        
        CREATE TABLE public.user_progress (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
            category TEXT NOT NULL,
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
        
        RAISE NOTICE 'user_progress table created successfully';
    ELSE
        RAISE NOTICE 'user_progress table already exists';
    END IF;
END $$;

-- Step 6: Create resume_analysis table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resume_analysis' AND table_schema = 'public') THEN
        RAISE NOTICE 'Creating resume_analysis table...';
        
        CREATE TABLE public.resume_analysis (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
            resume_file_url TEXT,
            job_title TEXT,
            company TEXT,
            industry TEXT,
            level TEXT,
            analysis JSONB,
            match_score DECIMAL(5,2),
            overall_score DECIMAL(5,2),
            summary_score DECIMAL(5,2),
            experience_score DECIMAL(5,2),
            education_score DECIMAL(5,2),
            skills_score DECIMAL(5,2),
            achievements_score DECIMAL(5,2),
            strengths TEXT[],
            weaknesses TEXT[],
            suggestions TEXT[],
            keywords_found TEXT[],
            keywords_missing TEXT[],
            summary_feedback TEXT[],
            experience_feedback TEXT[],
            education_feedback TEXT[],
            skills_feedback TEXT[],
            achievements_feedback TEXT[],
            overall_feedback TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'resume_analysis table created successfully';
    ELSE
        RAISE NOTICE 'resume_analysis table already exists';
    END IF;
END $$;

-- Step 7: Create missing columns in existing resume_analysis table
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

-- Step 8: Create profiles for existing auth users that don't have profiles
DO $$
DECLARE
    auth_user RECORD;
    profile_count INTEGER;
BEGIN
    RAISE NOTICE 'Checking for existing auth users without profiles...';
    
    -- Count users without profiles
    SELECT COUNT(*) INTO profile_count
    FROM auth.users u
    LEFT JOIN public.user_profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    
    RAISE NOTICE 'Found % users without profiles', profile_count;
    
    -- Create profiles for users without them
    FOR auth_user IN 
        SELECT u.id, u.email, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN public.user_profiles p ON u.id = p.id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            INSERT INTO public.user_profiles (id, email, first_name, last_name)
            VALUES (
                auth_user.id,
                auth_user.email,
                COALESCE(auth_user.raw_user_meta_data->>'first_name', ''),
                COALESCE(auth_user.raw_user_meta_data->>'last_name', '')
            );
            
            RAISE NOTICE 'Created profile for user %', auth_user.id;
            
            -- Initialize progress tracking
            INSERT INTO public.user_progress (user_id, category)
            VALUES 
                (auth_user.id, 'behavioral'),
                (auth_user.id, 'technical'),
                (auth_user.id, 'leadership'),
                (auth_user.id, 'general')
            ON CONFLICT (user_id, category) DO NOTHING;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Error creating profile for user %: %', auth_user.id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Profile creation for existing users completed';
END $$;

-- Step 9: Enable RLS and create policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;

DROP POLICY IF EXISTS "Users can view own resume analysis" ON public.resume_analysis;
DROP POLICY IF EXISTS "Users can insert own resume analysis" ON public.resume_analysis;
DROP POLICY IF EXISTS "Users can update own resume analysis" ON public.resume_analysis;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resume analysis" ON public.resume_analysis
    FOR ALL USING (auth.uid() = user_id);

-- Step 10: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 11: Verify the fix
SELECT 'Verifying foreign key fix...' as step;

-- Check if we can now insert into resume_analysis
DO $$
DECLARE
    test_user_id UUID;
    test_result BOOLEAN;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user ID: %', test_user_id;
        
        -- Try to insert a test record
        BEGIN
            INSERT INTO public.resume_analysis (user_id, job_title, company)
            VALUES (test_user_id, 'Test Job', 'Test Company');
            
            RAISE NOTICE 'SUCCESS: Foreign key constraint is working';
            
            -- Clean up test record
            DELETE FROM public.resume_analysis WHERE user_id = test_user_id AND job_title = 'Test Job';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: Foreign key constraint still failing - %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;

-- Final status
SELECT 'Foreign key constraint fix completed!' as status;
