-- Fix script for missing check_setup_status function
-- Run this if the main setup script failed to create the function

-- Drop the function if it exists (to avoid conflicts)
DROP FUNCTION IF EXISTS public.check_setup_status();

-- Create the check_setup_status function
CREATE OR REPLACE FUNCTION public.check_setup_status()
RETURNS TABLE(
  component TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check if tables exist
  RETURN QUERY
  SELECT 
    'Tables'::TEXT as component,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_history')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'speech_records')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resume_analysis')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings')
      THEN 'OK'::TEXT
      ELSE 'Missing Tables'::TEXT
    END as status,
    'All required tables are present'::TEXT as details;
  
  -- Check if functions exist
  RETURN QUERY
  SELECT 
    'Functions'::TEXT as component,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user')
        AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_stats')
      THEN 'OK'::TEXT
      ELSE 'Missing Functions'::TEXT
    END as status,
    'All required functions are present'::TEXT as details;
  
  -- Check if triggers exist
  RETURN QUERY
  SELECT 
    'Triggers'::TEXT as component,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created')
      THEN 'OK'::TEXT
      ELSE 'Missing Triggers'::TEXT
    END as status,
    'User creation trigger is present'::TEXT as details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT 'Function created successfully!' as message;
SELECT * FROM public.check_setup_status();
