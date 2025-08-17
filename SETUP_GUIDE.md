# Authentication Setup Guide

## Issue Description
If you're experiencing an infinite loading spinner after entering correct login credentials, it's likely due to missing or incorrect Supabase configuration.

## Quick Fix Steps

### 1. Check Environment Variables
Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Get Your Supabase Credentials
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

### 3. Restart Your Development Server
After adding the environment variables:
```bash
npm run dev
# or
yarn dev
```

### 4. Test Authentication
Visit `/test-supabase` to verify your configuration is working.

## Common Issues

### Issue: "Supabase not configured" error
**Solution**: Ensure your `.env.local` file exists and contains the correct Supabase credentials.

### Issue: Environment variables not loading
**Solution**: 
- Make sure the file is named exactly `.env.local`
- Restart your development server
- Check that the variables start with `NEXT_PUBLIC_`

### Issue: Authentication works but no redirect
**Solution**: This is likely a race condition in the auth state. The fix has been implemented in the latest code.

## Verification Steps

1. **Check Environment Variables**: Visit `/test-supabase` and verify both Supabase variables show "✅ Set"

2. **Test Connection**: Click "Test Supabase Connection" - should show "✅ Connection successful!"

3. **Test Authentication**: Try logging in with valid credentials

4. **Check Console**: Open browser console and look for authentication logs

## Debug Information

The login page now includes debug information (in development mode) showing:
- Authentication status
- Loading state
- Supabase configuration status
- User and session information

## Still Having Issues?

1. Check the browser console for error messages
2. Verify your Supabase project has authentication enabled
3. Ensure your user account exists in Supabase
4. Check that your Supabase project is not paused or suspended

## Support

If you continue to experience issues:
1. Check the browser console for detailed error logs
2. Verify your Supabase project settings
3. Ensure your database is properly configured
4. Check the network tab for failed API requests
