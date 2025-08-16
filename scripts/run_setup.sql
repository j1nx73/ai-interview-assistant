-- Master setup script for AI Interview Assistant
-- Run this script in your Supabase SQL editor

-- First, create the tables
\i 01_create_tables.sql

-- Then, create the functions and triggers
\i 02_create_functions.sql

-- Verify the setup
SELECT 'Setup completed successfully!' as status;

-- Check detailed setup status
SELECT * FROM public.check_setup_status();
