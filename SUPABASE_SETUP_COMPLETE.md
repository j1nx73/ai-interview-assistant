# 🚀 Complete Supabase Setup Guide for AI Interview Assistant

This guide will walk you through setting up Supabase for your AI Interview Assistant application, including authentication, database, and storage.

## 📋 Prerequisites

- A Supabase account (free tier available)
- Node.js and npm installed
- Basic knowledge of SQL

## 🎯 Step 1: Create a Supabase Project

### 1.1 Sign Up/Login
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**

### 1.2 Project Configuration
1. **Organization**: Select your organization
2. **Name**: `ai-interview-assistant` (or your preferred name)
3. **Database Password**: Create a strong password (save this!)
4. **Region**: Choose the closest region to your users
5. Click **"Create new project"**

### 1.3 Wait for Setup
- Project setup takes 2-3 minutes
- You'll receive an email when it's ready

## 🔑 Step 2: Get Your API Keys

### 2.1 Access Project Settings
1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### 2.2 Environment Variables
1. Create `.env.local` file in your project root
2. Add your Supabase credentials:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🗄️ Step 3: Set Up Database Schema

### 3.1 Access SQL Editor
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**

### 3.2 Run the Schema Script
1. Copy the entire content from `scripts/04_supabase_schema.sql`
2. Paste it into the SQL editor
3. Click **"Run"**

### 3.3 Verify Tables
Go to **Table Editor** and verify these tables were created:
- `user_profiles`
- `interview_sessions`
- `questions`
- `session_questions`
- `speech_analysis`
- `resume_analysis`
- `user_progress`
- `user_achievements`
- `chat_conversations`
- `chat_messages`

## 🔐 Step 4: Configure Authentication

### 4.1 Email Settings
1. Go to **Authentication** → **Settings**
2. **Site URL**: Set to `http://localhost:3000` (development)
3. **Redirect URLs**: Add `http://localhost:3000/dashboard`

### 4.2 Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and reset password emails
3. Update branding and messaging

### 4.3 Social Providers (Optional)
1. Go to **Authentication** → **Providers**
2. Enable Google, GitHub, or other providers
3. Configure OAuth credentials

## 🛡️ Step 5: Set Up Row Level Security (RLS)

### 5.1 Verify RLS Policies
The schema script automatically creates RLS policies. Verify in **Authentication** → **Policies**:

- Users can only access their own data
- Questions are publicly readable
- All other tables are user-scoped

### 5.2 Test RLS
1. Create a test user account
2. Try to access data from different accounts
3. Verify isolation works correctly

## 📁 Step 6: Configure Storage (Optional)

### 6.1 Create Storage Buckets
1. Go to **Storage** → **Buckets**
2. Create these buckets:
   - `audio-files` (for speech recordings)
   - `resume-files` (for resume uploads)
   - `avatars` (for user profile pictures)

### 6.2 Set Storage Policies
```sql
-- Allow users to upload their own files
CREATE POLICY "Users can upload own files" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own files
CREATE POLICY "Users can view own files" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 🧪 Step 7: Test Your Setup

### 7.1 Test Authentication
1. Start your development server: `npm run dev`
2. Go to `/login`
3. Try creating a new account
4. Verify email confirmation works

### 7.2 Test Database Operations
1. Sign in to your account
2. Navigate to different pages
3. Verify data is being saved/retrieved

### 7.3 Check Console for Errors
1. Open browser developer tools
2. Check console for any Supabase errors
3. Verify network requests to Supabase

## 🚨 Troubleshooting

### Common Issues

#### 1. "Supabase not configured" Error
- Check your `.env.local` file exists
- Verify environment variable names are correct
- Restart your development server

#### 2. Authentication Errors
- Check redirect URLs in Supabase settings
- Verify email templates are configured
- Check browser console for detailed errors

#### 3. Database Permission Errors
- Verify RLS policies are enabled
- Check if tables exist in the correct schema
- Ensure user is authenticated

#### 4. CORS Errors
- Add your domain to Supabase allowed origins
- Check if you're using the correct API keys

### Debug Steps
1. **Check Environment Variables**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Verify Supabase Client**:
   ```typescript
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
   console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
   ```

3. **Check Network Tab**:
   - Look for failed requests to Supabase
   - Verify request headers and payloads

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development/production
- Rotate keys regularly

### 2. RLS Policies
- Always enable RLS on user data tables
- Test policies thoroughly
- Use least privilege principle

### 3. API Keys
- Use anon key for client-side operations
- Use service role key only for server-side operations
- Never expose service role key in client code

## 🚀 Production Deployment

### 1. Update Environment Variables
```bash
# Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXTAUTH_URL=https://yourdomain.com
```

### 2. Update Supabase Settings
1. **Site URL**: Your production domain
2. **Redirect URLs**: Your production dashboard URL
3. **CORS Origins**: Add your production domain

### 3. Database Backups
1. Enable automatic backups in Supabase
2. Set up point-in-time recovery
3. Test restore procedures

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## 🎉 Congratulations!

Your AI Interview Assistant now has a fully functional backend with:
- ✅ User authentication and profiles
- ✅ Secure database with RLS
- ✅ Interview session tracking
- ✅ Speech analysis storage
- ✅ Resume analysis storage
- ✅ Progress tracking
- ✅ Achievement system
- ✅ Chat conversations

You can now build features that persist data and provide personalized experiences for your users!
