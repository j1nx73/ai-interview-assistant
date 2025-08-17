-- Test Database Connection and Table Existence
-- This script helps diagnose database connectivity issues

-- Test 1: Check if we can connect and see tables
SELECT 'Database connection test' as test_name;

-- Test 2: List all tables in public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Test 3: Check if user_profiles table exists and its structure
SELECT 
    'user_profiles table check' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as table_status;

-- Test 4: If user_profiles exists, show its structure
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'user_profiles table structure:';
        PERFORM format('Table: %I', table_name) 
        FROM information_schema.tables 
        WHERE table_name = 'user_profiles' AND table_schema = 'public';
    ELSE
        RAISE NOTICE 'user_profiles table does not exist';
    END IF;
END $$;

-- Test 5: Check RLS policies on user_profiles
SELECT 
    'RLS policies on user_profiles' as test_name,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Test 6: Check current user and permissions
SELECT 
    'Current user and permissions' as test_name,
    current_user as current_user,
    session_user as session_user,
    current_database() as current_database;

-- Test 7: Check if we can query the table (this will fail if RLS blocks it)
DO $$
BEGIN
    BEGIN
        PERFORM COUNT(*) FROM user_profiles LIMIT 1;
        RAISE NOTICE 'SUCCESS: Can query user_profiles table';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Cannot query user_profiles table - %', SQLERRM;
    END;
END $$;

-- Test 8: Check auth.users table (Supabase auth)
SELECT 
    'auth.users table check' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as table_status;

-- Test 9: Check if we can see auth.users
DO $$
BEGIN
    BEGIN
        PERFORM COUNT(*) FROM auth.users LIMIT 1;
        RAISE NOTICE 'SUCCESS: Can query auth.users table';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Cannot query auth.users table - %', SQLERRM;
    END;
END $$;

-- Summary
SELECT 'Database test completed' as status;
