# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `ai-interview-assistant` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

## 4. Set Up Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your site URL: `http://localhost:3000`
3. Add redirect URLs:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/auth/callback`

## 5. Create Database Tables

**Option A: Run the master script (Recommended)**
1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `scripts/run_setup.sql`
3. Click "Run" to execute all scripts at once

**Option B: Run scripts individually**
1. In Supabase dashboard, go to **SQL Editor**
2. Run `scripts/01_create_tables.sql` first
3. Then run `scripts/02_create_functions.sql`

**Option C: If you encounter errors**
1. Run `scripts/01_create_tables.sql` first
2. Then run `scripts/02_create_functions.sql`
3. If the `check_setup_status` function is missing, run `scripts/fix_check_setup.sql`
4. Use `scripts/simple_verification.sql` to verify the setup

**Note:** The scripts will automatically:
- Create all necessary tables
- Set up Row Level Security (RLS)
- Create security policies
- Set up triggers for automatic profile creation
- Add utility functions for user statistics and search

## 6. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3001/login`
3. Try creating a new account
4. Check your email for confirmation
5. Sign in with your credentials

## 7. Enable Row Level Security (RLS)

The SQL scripts include RLS policies, but make sure they're enabled:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

## Troubleshooting

### Common Issues:

1. **"Supabase not configured" error**: Check your `.env.local` file
2. **Authentication errors**: Verify redirect URLs in Supabase settings
3. **Database connection issues**: Check your project URL and API key
4. **Email not sending**: Check Supabase email settings and SMTP configuration
5. **"permission denied to set parameter" error**: This has been fixed in the updated scripts - Supabase handles JWT secrets automatically
6. **RLS policy errors**: Make sure you're running the scripts in the correct order (tables first, then functions)

### Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
