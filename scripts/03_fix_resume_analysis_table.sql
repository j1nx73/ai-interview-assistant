-- Fix script for resume_analysis table
-- Add missing columns that the application needs

-- Add industry column
ALTER TABLE IF EXISTS public.resume_analysis 
ADD COLUMN IF NOT EXISTS industry TEXT;

-- Add level column  
ALTER TABLE IF EXISTS public.resume_analysis 
ADD COLUMN IF NOT EXISTS level TEXT;

-- Update existing records to have default values
UPDATE public.resume_analysis 
SET industry = 'General' 
WHERE industry IS NULL;

UPDATE public.resume_analysis 
SET level = 'Entry' 
WHERE level IS NULL;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'resume_analysis' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test insert to verify the fix
-- (This will be rolled back automatically in Supabase)
BEGIN;
  INSERT INTO public.resume_analysis (
    user_id, 
    industry, 
    level, 
    analysis, 
    match_score, 
    created_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Test Industry',
    'Test Level',
    '{"test": "data"}'::JSONB,
    85,
    NOW()
  );
ROLLBACK;

SELECT 'resume_analysis table fixed successfully!' as status;
