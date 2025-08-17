# 🚀 Quick Setup Guide for AI Interview Assistant

## 🔧 **Step 1: Environment Variables**

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key

## 🗄️ **Step 2: Database Setup**

1. **Open Supabase SQL Editor:**
   - Go to your project dashboard
   - Click **SQL Editor** in the left sidebar

2. **Run the Setup Script:**
   - Copy the entire contents of `scripts/quick_setup.sql`
   - Paste it into the SQL Editor
   - Click **Run**

3. **Verify Setup:**
   - You should see "Setup completed successfully!"
   - Check that all table counts are 0 (empty tables)

## ✅ **Step 3: Test the System**

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Navigate to `/login`**

3. **Create a test account:**
   - Use the **Sign Up** tab
   - Fill in your details
   - Click "Create Account"

4. **Check the database status:**
   - Look for the green "Database Status: healthy" message
   - All tables should be listed as available

## 🐛 **Troubleshooting**

### **"Table does not exist" Error**
- Run the SQL setup script again
- Check that you're in the correct Supabase project
- Verify the script ran without errors

### **"Supabase not configured" Error**
- Check your `.env.local` file exists
- Verify the environment variables are correct
- Restart your development server

### **"Foreign key constraint violation"**
- Ensure the `auth.users` table exists (it should by default)
- Check that the setup script ran completely
- Verify RLS policies are enabled

### **"Permission denied" Error**
- Check that the SQL script granted proper permissions
- Verify your Supabase project is active
- Check that you're using the correct API keys

## 📋 **What the Setup Script Creates**

- ✅ `user_profiles` table for user data
- ✅ `chat_conversations` table for chat sessions
- ✅ `chat_messages` table for individual messages
- ✅ Row Level Security (RLS) policies
- ✅ Automatic user profile creation trigger
- ✅ Proper permissions for authenticated users

## 🎯 **Expected Results**

After successful setup, you should see:
- **Database Status: healthy** (green message)
- **Tables: user_profiles, chat_conversations, chat_messages**
- **No error messages**
- **Successful user registration**
- **Working login/logout functionality**

## 🆘 **Still Having Issues?**

1. **Check the browser console** for detailed error messages
2. **Verify your Supabase project** is active and accessible
3. **Check the SQL Editor** for any error messages when running the script
4. **Ensure your environment variables** are correctly set
5. **Restart your development server** after making changes

## 🎉 **Success!**

Once everything is working:
- Users can create accounts
- Profiles are automatically created
- Chat functionality works with persistence
- Logout properly clears sessions
- All features are fully functional

---

**Need more help?** Check the `LOGIN_SETUP_README.md` for detailed technical information.
