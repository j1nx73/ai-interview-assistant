# Database Fix for AI Interview Assistant

## 🚨 Issue Description

The application is encountering several database errors:

### 1. Missing Column Error
```
Error: Database error: Could not find the 'analysis' column of 'resume_analysis' in the schema cache
```

### 2. Foreign Key Constraint Error
```
Failed to save analysis: Database error: insert or update on table "resume_analysis" violates foreign key constraint "resume_analysis_user_id_fkey"
```

### 3. Table Not Found Error
```
GET https://[project].supabase.co/rest/v1/profiles?select=*&id=[user-id] 406 (Not Acceptable)
```

## 🔍 Root Causes

1. **Missing Columns**: The `resume_analysis` table is missing required columns
2. **Foreign Key Issues**: The `user_profiles` table doesn't exist or user profiles aren't being created
3. **Table Name Mismatch**: Code is trying to query `profiles` instead of `user_profiles`
4. **Missing Triggers**: User profile creation trigger isn't working properly

## 🛠️ Solutions

### Option 1: Quick Manual Fix (Recommended for immediate use)
Run this SQL directly in your Supabase SQL Editor:

```sql
-- Copy and paste this into your Supabase SQL Editor
\i scripts/quick_fix_manual.sql
```

### Option 2: Automated Fix Script
```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Run the comprehensive fix
./scripts/run_database_fix.sh
```

### Option 3: Step-by-Step Manual Fix
1. **Fix table names** in the code (already done)
2. **Create missing tables** and columns
3. **Set up RLS policies**
4. **Create user profiles** for existing users

## 📋 Prerequisites

1. **PostgreSQL Client**: Install `psql` command-line tool
   - **macOS**: `brew install postgresql`
   - **Ubuntu/Debian**: `sudo apt-get install postgresql-client`
   - **Windows**: Download from PostgreSQL website

2. **Database Connection**: Get your Supabase database connection string
   - Go to your Supabase project dashboard
   - Navigate to Settings → Database
   - Copy the connection string

## 🔧 What the Fixes Do

### Schema Fix (`06_fix_resume_analysis_schema.sql`)
- Adds missing columns to `resume_analysis` table
- Updates data types for existing columns
- Creates indexes for better performance

### Foreign Key Fix (`08_fix_foreign_key_issues.sql`)
- Creates `user_profiles` table if missing
- Sets up user profile creation triggers
- Creates profiles for existing users
- Configures proper RLS policies
- Tests foreign key constraints

### Quick Manual Fix (`quick_fix_manual.sql`)
- Minimal fix for immediate use
- Creates essential tables and columns
- Sets up basic RLS policies
- Can be run directly in Supabase SQL Editor

## ✅ Verification Steps

After running the fix, verify that:

1. **Database Connection**: No more 406 errors
2. **Resume Analysis**: Can save analysis results
3. **User Profiles**: User profiles are created automatically
4. **Export Works**: PDF, JSON, TXT export functions
5. **Authentication**: Login/logout works properly

## 🚀 New Features Added

With these fixes, you also get:

- **PDF Export**: Professional formatted reports
- **JSON Export**: Structured data format
- **TXT Export**: Simple text summaries
- **Enhanced Analysis**: More detailed scoring and feedback
- **Proper Database Structure**: Robust, scalable schema

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Foreign Key Constraints**: Data integrity protection
- **User Isolation**: Secure multi-tenant architecture
- **Audit Trails**: Created/updated timestamps on all records

## 📞 Troubleshooting

### Common Issues:

1. **"psql: command not found"**
   - Install PostgreSQL client tools
   - Add to your PATH

2. **"Connection refused"**
   - Check your DATABASE_URL
   - Verify Supabase project is active
   - Check firewall settings

3. **"Permission denied"**
   - Ensure you have database access
   - Check RLS policies
   - Verify user authentication

4. **"Table doesn't exist"**
   - Run the complete database setup
   - Check if tables were created
   - Verify schema names

### Debug Commands:

```bash
# Test database connection
psql "$DATABASE_URL" -c "SELECT version();"

# Check table existence
psql "$DATABASE_URL" -c "\dt public.*"

# Test RLS policies
psql "$DATABASE_URL" -f scripts/test_database_connection.sql
```

## 📝 File Structure

```
scripts/
├── 06_fix_resume_analysis_schema.sql    # Schema column fixes
├── 07_complete_database_setup.sql       # Complete database setup
├── 08_fix_foreign_key_issues.sql        # Foreign key fixes
├── quick_fix_manual.sql                 # Quick manual fix
├── test_database_connection.sql         # Connection testing
└── run_database_fix.sh                  # Automated fix script

lib/
├── pdf-export.ts                        # PDF export service
└── ...

components/
├── export-button.tsx                    # Export functionality
└── ...
```

## 🎯 Next Steps

After fixing the database:

1. **Test resume analysis** functionality
2. **Try the new export features** (PDF, JSON, TXT)
3. **Explore other analysis features** (speech, job matching)
4. **Check the dashboard** for new features
5. **Verify user authentication** and profile creation

## 🆘 Emergency Fix

If you need an immediate fix and can't run scripts:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and paste** the contents of `scripts/quick_fix_manual.sql`
3. **Run the SQL** directly
4. **Test the application**

---

**Note**: These fixes are backward compatible and won't affect existing data or functionality. The automated scripts are safe to run multiple times.
