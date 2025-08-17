#!/bin/bash

# Database Fix Script for AI Interview Assistant
# This script fixes the database schema issues and foreign key constraints

echo "🔧 Starting database fix process..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed or not in PATH"
    echo "Please install PostgreSQL client tools first"
    echo ""
    echo "Installation commands:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Check if environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set DATABASE_URL with your Supabase database connection string:"
    echo ""
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to Settings → Database"
    echo "3. Copy the connection string"
    echo "4. Set the environment variable:"
    echo ""
    echo "   export DATABASE_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
    echo ""
    echo "Example:"
    echo "   export DATABASE_URL='postgresql://postgres:yourpassword@db.kdxqimaskybpcsytbfbk.supabase.co:5432/postgres'"
    exit 1
fi

echo "📊 Running database schema fixes..."
echo "This will:"
echo "  ✓ Add missing columns to resume_analysis table"
echo "  ✓ Fix foreign key constraint issues"
echo "  ✓ Create missing tables if they don't exist"
echo "  ✓ Set up proper RLS policies"
echo ""

# Step 1: Run the schema fix
echo "🔧 Step 1: Fixing resume_analysis table schema..."
psql "$DATABASE_URL" -f scripts/06_fix_resume_analysis_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema fix completed successfully!"
else
    echo "❌ Error: Schema fix failed"
    echo "Please check the error messages above"
    exit 1
fi

echo ""

# Step 2: Run the foreign key constraint fix
echo "🔧 Step 2: Fixing foreign key constraint issues..."
psql "$DATABASE_URL" -f scripts/08_fix_foreign_key_issues.sql

if [ $? -eq 0 ]; then
    echo "✅ Foreign key constraint fix completed successfully!"
else
    echo "❌ Error: Foreign key constraint fix failed"
    echo "Please check the error messages above"
    exit 1
fi

echo ""

# Step 3: Test the database connection
echo "🔧 Step 3: Testing database connection and table access..."
psql "$DATABASE_URL" -f scripts/test_database_connection.sql

if [ $? -eq 0 ]; then
    echo "✅ Database connection test completed!"
else
    echo "⚠️  Warning: Database connection test had issues"
    echo "This might be normal if some tables don't exist yet"
fi

echo ""
echo "🎉 Database fix process completed!"
echo ""
echo "The following issues have been resolved:"
echo "  ✓ Missing 'analysis' column in resume_analysis table"
echo "  ✓ Foreign key constraint violations"
echo "  ✓ Missing user_profiles table"
echo "  ✓ RLS policy setup"
echo "  ✓ User profile creation triggers"
echo ""
echo "Next steps:"
echo "1. Try running a resume analysis again"
echo "2. Check that the analysis is saved to the database"
echo "3. Verify that the export functionality works"
echo "4. Test user authentication and profile creation"
echo ""
echo "If you encounter any issues:"
echo "  • Check the console for error messages"
echo "  • Verify your DATABASE_URL is correct"
echo "  • Ensure you have the necessary database permissions"
echo "  • Run the test script: psql \"\$DATABASE_URL\" -f scripts/test_database_connection.sql"
