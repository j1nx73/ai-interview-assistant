# 🔧 Fix Profile Update Error

## ❌ **Error Description**
```
Error: Error updating user profile: {}
at DatabaseServiceClient.updateUserProfile
```

## 🔍 **Root Cause**
The error occurs because:
1. **Database Schema Issue**: The `user_profiles` table might not exist or have incorrect structure
2. **RLS Policy Issue**: Row Level Security policies might be blocking updates
3. **Column Mismatch**: The table structure might not match what the code expects
4. **Missing Triggers**: The `handle_new_user` trigger might not be working

## 🚀 **Quick Fix (Recommended)**

### **Step 1: Run the Fix Script**
1. **Open Supabase SQL Editor** in your project dashboard
2. **Copy and paste** the entire contents of `scripts/fix_profile_updates.sql`
3. **Click Run** to execute the script
4. **Verify success** - you should see "Setup completed successfully!"

### **Step 2: Test the Fix**
1. **Refresh your app** (or restart `npm run dev`)
2. **Navigate to** `/settings` or `/profile`
3. **Try updating** your profile information
4. **Check console** for any remaining errors

## 🔍 **Diagnostic Steps (If Quick Fix Doesn't Work)**

### **Step 1: Check Database Status**
Run this in Supabase SQL Editor:
```sql
-- Check if user_profiles table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') 
    THEN '✅ user_profiles table exists'
    ELSE '❌ user_profiles table does not exist'
  END as table_status;
```

### **Step 2: Check Table Structure**
```sql
-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

### **Step 3: Check RLS Policies**
```sql
-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

### **Step 4: Check User Data**
```sql
-- Check if there are any users
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Check if there are any user profiles
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
```

## 🛠️ **Manual Fix (If Scripts Don't Work)**

### **Step 1: Create Table Manually**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'premium', 'admin')),
    subscription_tier TEXT,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Step 2: Enable RLS and Create Policies**
```sql
-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### **Step 3: Grant Permissions**
```sql
-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
```

### **Step 4: Create Profile for Current User**
```sql
-- Insert profile for current user (replace USER_ID with actual user ID)
INSERT INTO public.user_profiles (id, email, first_name, last_name, full_name, role, timezone)
VALUES (
    'YOUR_USER_ID_HERE',
    'your-email@example.com',
    'Your',
    'Name',
    'Your Name',
    'user',
    'UTC'
);
```

## 🧪 **Testing the Fix**

### **Step 1: Check Console Logs**
1. **Open browser console** (F12)
2. **Navigate to** `/settings` or `/profile`
3. **Try updating** profile information
4. **Look for** detailed error messages

### **Step 2: Verify Database Connection**
1. **Check Supabase dashboard** for connection status
2. **Verify environment variables** in `.env.local`
3. **Check network tab** for API calls

### **Step 3: Test Profile Update**
1. **Fill out** profile form
2. **Click Save** button
3. **Check for** success message
4. **Verify data** is saved in database

## 🚨 **Common Issues and Solutions**

### **Issue 1: "Table does not exist"**
**Solution**: Run the fix script or create table manually

### **Issue 2: "Permission denied"**
**Solution**: Check RLS policies and user authentication

### **Issue 3: "Column not found"**
**Solution**: Verify table structure matches expected schema

### **Issue 4: "Foreign key violation"**
**Solution**: Ensure user exists in `auth.users` table

## 📋 **Expected Results After Fix**

### **Database Status**
- ✅ `user_profiles` table exists
- ✅ RLS policies are active
- ✅ User profile data is accessible
- ✅ Profile updates work correctly

### **App Functionality**
- ✅ Settings page loads without errors
- ✅ Profile updates save successfully
- ✅ Success messages appear
- ✅ Data persists between sessions

## 🔄 **If Still Having Issues**

### **Step 1: Check Environment Variables**
```bash
# .env.local should contain:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### **Step 2: Restart Development Server**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### **Step 3: Clear Browser Cache**
- **Hard refresh** (Ctrl+Shift+R)
- **Clear localStorage** and **sessionStorage**
- **Check console** for new error messages

### **Step 4: Contact Support**
If issues persist, provide:
- **Error messages** from console
- **Database status** from diagnostic queries
- **Environment setup** details
- **Steps to reproduce** the issue

## 🎯 **Summary**

The profile update error is typically caused by:
1. **Missing database table** or incorrect structure
2. **RLS policy issues** blocking updates
3. **Authentication problems** or missing user data

**Quick Fix**: Run `scripts/fix_profile_updates.sql` in Supabase SQL Editor
**Manual Fix**: Create table, policies, and permissions manually
**Testing**: Verify database connection and profile update functionality

After applying the fix, profile updates should work correctly with proper error handling and user feedback.
