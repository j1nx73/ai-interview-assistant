-- Test Profile Update Functionality
-- Run this in your Supabase SQL Editor to diagnose profile update issues

-- Check if user_profiles table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') 
    THEN '✅ user_profiles table exists'
    ELSE '❌ user_profiles table does not exist'
  END as table_status;

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check if there are any users in auth.users
SELECT 
  COUNT(*) as auth_users_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ auth.users has data'
    ELSE '❌ auth.users is empty'
  END as auth_status
FROM auth.users;

-- Check if there are any user profiles
SELECT 
  COUNT(*) as user_profiles_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ user_profiles has data'
    ELSE '❌ user_profiles is empty'
  END as profiles_status
FROM user_profiles;

-- Check RLS policies
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

-- Test a simple update (this will help identify any constraint issues)
-- First, let's see what columns we can actually update
SELECT 
  'Available columns for update:' as info,
  string_agg(column_name, ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name NOT IN ('id', 'created_at', 'updated_at')
  AND is_updatable = 'YES';
