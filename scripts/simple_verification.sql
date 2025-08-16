-- Simple verification script for database setup
-- This script checks if all components are present without relying on custom functions

-- Check 1: Tables
SELECT 
  'Tables Check' as check_type,
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM (
  SELECT 'profiles' as table_name
  UNION ALL SELECT 'chat_history'
  UNION ALL SELECT 'speech_records'
  UNION ALL SELECT 'resume_analysis'
  UNION ALL SELECT 'user_settings'
) expected_tables
LEFT JOIN information_schema.tables actual_tables 
  ON expected_tables.table_name = actual_tables.table_name 
  AND actual_tables.table_schema = 'public';

-- Check 2: Functions
SELECT 
  'Functions Check' as check_type,
  function_name,
  CASE 
    WHEN function_name IS NOT NULL THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM (
  SELECT 'handle_new_user' as function_name
  UNION ALL SELECT 'handle_updated_at'
  UNION ALL SELECT 'get_user_stats'
  UNION ALL SELECT 'search_chat_history'
) expected_functions
LEFT JOIN information_schema.routines actual_functions 
  ON expected_functions.function_name = actual_functions.routine_name 
  AND actual_functions.routine_schema = 'public';

-- Check 3: Triggers
SELECT 
  'Triggers Check' as check_type,
  trigger_name,
  CASE 
    WHEN trigger_name IS NOT NULL THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM (
  SELECT 'on_auth_user_created' as trigger_name
  UNION ALL SELECT 'profiles_updated_at'
  UNION ALL SELECT 'user_settings_updated_at'
) expected_triggers
LEFT JOIN information_schema.triggers actual_triggers 
  ON expected_triggers.trigger_name = actual_triggers.trigger_name 
  AND actual_triggers.trigger_schema = 'public';

-- Check 4: RLS Policies
SELECT 
  'RLS Policies Check' as check_type,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 15 THEN 'SUFFICIENT' 
    ELSE 'INSUFFICIENT - Expected at least 15' 
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- Summary
SELECT 'Verification completed. Check results above.' as summary;
