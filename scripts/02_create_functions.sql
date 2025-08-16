-- Creating database functions and triggers

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with error handling
  BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
        'User'
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the trigger
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Create user settings with error handling
  BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the trigger
    RAISE WARNING 'Failed to create user settings for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE(
  total_chat_messages INTEGER,
  total_speech_sessions INTEGER,
  total_resume_analyses INTEGER,
  average_speech_score NUMERIC,
  total_practice_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(chat.count, 0)::INTEGER as total_chat_messages,
    COALESCE(speech.count, 0)::INTEGER as total_speech_sessions,
    COALESCE(resume.count, 0)::INTEGER as total_resume_analyses,
    COALESCE(speech.avg_score, 0)::NUMERIC as average_speech_score,
    COALESCE(speech.total_duration, 0)::INTEGER as total_practice_time
  FROM 
    (SELECT COUNT(*) as count FROM chat_history WHERE user_id = user_uuid) chat,
    (SELECT 
       COUNT(*) as count,
       AVG(score) as avg_score,
       SUM(duration) as total_duration
     FROM speech_records 
     WHERE user_id = user_uuid) speech,
    (SELECT COUNT(*) as count FROM resume_analysis WHERE user_id = user_uuid) resume;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search chat history
CREATE OR REPLACE FUNCTION public.search_chat_history(
  user_uuid UUID,
  search_term TEXT,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  message TEXT,
  response TEXT,
  "timestamp" TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ch.id,
    ch.message,
    ch.response,
    ch."timestamp"
  FROM chat_history ch
  WHERE ch.user_id = user_uuid
    AND (
      ch.message ILIKE '%' || search_term || '%' OR
      ch.response ILIKE '%' || search_term || '%'
    )
  ORDER BY ch."timestamp" DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if setup is complete
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
