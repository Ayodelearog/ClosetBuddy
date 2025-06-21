# Fix Supabase RLS Policy Issue

## Problem
You're getting a "new row violates row-level security policy" error when trying to save user preferences. This happens because the `user_preferences` table doesn't have the proper Row Level Security (RLS) policies set up.

## Solution
You need to run the SQL script to add the missing RLS policies to your Supabase database.

## Steps to Fix

### Option 1: Run the Fix Script (Recommended)
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your ClosetBuddy project
3. Go to the **SQL Editor** in the left sidebar
4. Copy and paste the contents of `fix-user-preferences-rls.sql` into the SQL editor
5. Click **Run** to execute the script

### Option 2: Manual Setup
If you prefer to run the commands manually, execute these SQL commands in your Supabase SQL Editor:

```sql
-- Enable RLS on user_preferences table
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences table
CREATE POLICY "Users can view own preferences" ON user_preferences
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
FOR DELETE USING (auth.uid()::text = user_id);
```

## What This Does
- **Enables RLS**: Turns on Row Level Security for the user_preferences table
- **SELECT Policy**: Allows users to view only their own preferences
- **INSERT Policy**: Allows users to create only their own preferences
- **UPDATE Policy**: Allows users to update only their own preferences
- **DELETE Policy**: Allows users to delete only their own preferences

## Verification
After running the script:
1. Try saving your preferences again in the app
2. The error should be resolved and preferences should save successfully
3. You should see a success toast notification

## For Future Reference
The updated `database-setup.sql` file now includes these RLS policies, so if you set up a new Supabase project, this issue won't occur.

## Troubleshooting
If you still get errors after running the script:
1. Make sure you're logged in to the app (the policies require authentication)
2. Check that the user ID in the error logs matches your authenticated user ID
3. Verify the policies were created by running: `SELECT * FROM pg_policies WHERE tablename = 'user_preferences';`
