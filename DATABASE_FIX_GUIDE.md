# Database Fix Guide

## Issue
The application is getting this error:
```
Failed to save analysis: Database error: Could not find the 'industry' column of 'resume_analysis' in the schema cache
```

## Root Cause
The `resume_analysis` table is missing the `industry` and `level` columns that the application needs.

## Solution

### Step 1: Run the Database Fix Script

1. **Go to your Supabase Dashboard**
   - Navigate to [supabase.com](https://supabase.com)
   - Sign in and select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste this SQL script:**
   ```sql
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
   ```

4. **Click "Run" to execute the script**

### Step 2: Verify the Fix

After running the script, you should see:
- A list of all columns in the `resume_analysis` table
- The `industry` and `level` columns should now be present

### Step 3: Test the Application

1. **Restart your application** (if needed)
2. **Try uploading a resume again**
3. **The analysis should now save successfully**

## Alternative: Run the Complete Setup

If you prefer to run the complete database setup:

1. **Run the master setup script** (`scripts/run_setup.sql`)
2. **This will create all tables with the correct schema**

## File Upload Issue Also Fixed

I've also fixed the file upload issue where Word documents were showing unreadable symbols:

- **Before**: Word docs showed XML content like `PKrDVword/numbering.xml`
- **After**: Clear guidance to copy-paste text content
- **Supported**: Only `.txt` files for direct upload
- **Guidance**: Helpful messages for PDFs and Word documents

## Need Help?

If you still encounter issues:

1. **Check the Supabase logs** for any SQL errors
2. **Verify the table structure** using the verification query above
3. **Ensure RLS policies** are properly set up
4. **Check authentication** is working correctly

The application should now work perfectly for both resume analysis and file uploads! 🎉
