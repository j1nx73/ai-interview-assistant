-- Test script to verify the database setup
-- Run this after the main setup to ensure everything is working

-- Test 1: Check if all tables exist
SELECT 
  'Tables Check' as test_name,
  COUNT(*) as table_count,
  CASE 
    WHEN COUNT(*) = 5 THEN 'PASS' 
    ELSE 'FAIL - Expected 5 tables' 
  END as result
FROM information_schema.tables 
WHERE table_name IN ('profiles', 'chat_history', 'speech_records', 'resume_analysis', 'user_settings')
  AND table_schema = 'public';

-- Test 2: Check if all functions exist
SELECT 
  'Functions Check' as test_name,
  COUNT(*) as function_count,
  CASE 
    WHEN COUNT(*) >= 4 THEN 'PASS' 
    ELSE 'FAIL - Expected at least 4 functions' 
  END as result
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'handle_updated_at', 'get_user_stats', 'search_chat_history', 'check_setup_status')
  AND routine_schema = 'public';

-- Test 3: Check if triggers exist
SELECT 
  'Triggers Check' as test_name,
  COUNT(*) as trigger_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN 'PASS' 
    ELSE 'FAIL - Expected at least 3 triggers' 
  END as result
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'profiles_updated_at', 'user_settings_updated_at')
  AND trigger_schema = 'public';

-- Test 4: Check RLS policies
SELECT 
  'RLS Policies Check' as test_name,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 15 THEN 'PASS' 
    ELSE 'FAIL - Expected at least 15 policies' 
  END as result
FROM pg_policies 
WHERE schemaname = 'public';

-- Test 5: Run the setup status function
SELECT 'Setup Status Check' as test_name;
SELECT * FROM public.check_setup_status();

-- Test 6: Test the user stats function (should return empty result for now)
SELECT 'User Stats Function Test' as test_name;
SELECT * FROM public.get_user_stats('00000000-0000-0000-0000-000000000000'::UUID);

-- Summary
SELECT 'All tests completed. Check results above.' as summary;
