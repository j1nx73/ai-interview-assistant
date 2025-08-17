-- Check Database State
-- Run this in your Supabase SQL Editor to diagnose current issues

-- Check if user_profiles table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') 
    THEN '✅ user_profiles table exists'
    ELSE '❌ user_profiles table does not exist'
  END as table_status;

-- Check auth.users table structure
SELECT 
  'auth.users structure:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Check if raw_user_meta_data column exists and its type
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'users' 
        AND table_schema = 'auth' 
        AND column_name = 'raw_user_meta_data'
    ) THEN '✅ raw_user_meta_data column exists'
    ELSE '❌ raw_user_meta_data column does not exist'
  END as metadata_column_status;

-- Check raw_user_meta_data type if it exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'auth' 
  AND column_name = 'raw_user_meta_data';

-- Check sample data from auth.users (first 3 users)
SELECT 
  id,
  email,
  CASE 
    WHEN raw_user_meta_data IS NOT NULL THEN 'Has metadata'
    ELSE 'No metadata'
  END as metadata_status,
  CASE 
    WHEN raw_user_meta_data IS NOT NULL THEN jsonb_typeof(raw_user_meta_data)
    ELSE 'N/A'
  END as metadata_type
FROM auth.users 
LIMIT 3;

-- Check if user_profiles table exists and its structure
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') 
    THEN '✅ user_profiles table exists'
    ELSE '❌ user_profiles table does not exist'
  END as profiles_table_status;

-- If user_profiles exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check RLS policies on user_profiles if table exists
SELECT 
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

-- Check triggers on user_profiles if table exists
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_profiles';

-- Check user counts
SELECT 
  COUNT(*) as auth_users_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ auth.users has data'
    ELSE '❌ auth.users is empty'
  END as auth_status
FROM auth.users;

-- Check user_profiles count if table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') 
    THEN (
      SELECT 
        COUNT(*) as user_profiles_count,
        CASE 
          WHEN COUNT(*) > 0 THEN '✅ user_profiles has data'
          ELSE '❌ user_profiles is empty'
        END as profiles_status
      FROM user_profiles
    )
    ELSE '❌ user_profiles table does not exist'
  END as profiles_info;
