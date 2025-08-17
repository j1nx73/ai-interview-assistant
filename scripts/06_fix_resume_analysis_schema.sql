-- Fix Resume Analysis Table Schema
-- This script adds missing columns to the resume_analysis table

-- Add missing columns to resume_analysis table
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

-- Update existing columns to match the expected schema
ALTER TABLE public.resume_analysis 
ALTER COLUMN match_score TYPE DECIMAL(5,2),
ALTER COLUMN strengths TYPE TEXT[],
ALTER COLUMN weaknesses TYPE TEXT[],
ALTER COLUMN suggestions TYPE TEXT[],
ALTER COLUMN keywords_found TYPE TEXT[],
ALTER COLUMN keywords_missing TYPE TEXT[];

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resume_analysis_user_id_created_at ON public.resume_analysis(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_industry ON public.resume_analysis(industry);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_level ON public.resume_analysis(level);

-- Add comments to document the table structure
COMMENT ON TABLE public.resume_analysis IS 'Stores resume analysis results with detailed scoring and feedback';
COMMENT ON COLUMN public.resume_analysis.industry IS 'Industry for which the resume was analyzed';
COMMENT ON COLUMN public.resume_analysis.level IS 'Experience level (entry, mid, senior)';
COMMENT ON COLUMN public.resume_analysis.analysis IS 'Complete analysis data in JSON format';
COMMENT ON COLUMN public.resume_analysis.overall_score IS 'Overall resume score (0-100)';
COMMENT ON COLUMN public.resume_analysis.summary_score IS 'Summary section score (0-100)';
COMMENT ON COLUMN public.resume_analysis.experience_score IS 'Experience section score (0-100)';
COMMENT ON COLUMN public.resume_analysis.education_score IS 'Education section score (0-100)';
COMMENT ON COLUMN public.resume_analysis.skills_score IS 'Skills section score (0-100)';
COMMENT ON COLUMN public.resume_analysis.achievements_score IS 'Achievements section score (0-100)';

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'resume_analysis' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'Resume analysis table schema updated successfully!' as status;
