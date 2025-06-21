-- Fix Row Level Security policies for user_preferences table
-- Run this in your Supabase SQL Editor to fix the RLS policy issue
-- This version is for authenticated users only (no demo users)

-- Enable RLS on user_preferences table
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- Create RLS policies for user_preferences table
-- Allow users to view their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
FOR SELECT USING (auth.uid()::text = user_id);

-- Allow users to insert their own preferences
CREATE POLICY "Users can insert own preferences" ON user_preferences
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
FOR UPDATE USING (auth.uid()::text = user_id);

-- Allow users to delete their own preferences
CREATE POLICY "Users can delete own preferences" ON user_preferences
FOR DELETE USING (auth.uid()::text = user_id);

-- Also enable RLS on clothing_items table if not already enabled
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist for clothing_items
DROP POLICY IF EXISTS "Users can view own items" ON clothing_items;
DROP POLICY IF EXISTS "Users can insert own items" ON clothing_items;
DROP POLICY IF EXISTS "Users can update own items" ON clothing_items;
DROP POLICY IF EXISTS "Users can delete own items" ON clothing_items;

-- Create RLS policies for clothing_items table
-- Allow users to view their own items
CREATE POLICY "Users can view own items" ON clothing_items
FOR SELECT USING (auth.uid()::text = user_id);

-- Allow users to insert their own items
CREATE POLICY "Users can insert own items" ON clothing_items
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own items
CREATE POLICY "Users can update own items" ON clothing_items
FOR UPDATE USING (auth.uid()::text = user_id);

-- Allow users to delete their own items
CREATE POLICY "Users can delete own items" ON clothing_items
FOR DELETE USING (auth.uid()::text = user_id);

-- Enable RLS on outfit_suggestions table if not already enabled
ALTER TABLE outfit_suggestions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist for outfit_suggestions
DROP POLICY IF EXISTS "Users can view own suggestions" ON outfit_suggestions;
DROP POLICY IF EXISTS "Users can insert own suggestions" ON outfit_suggestions;
DROP POLICY IF EXISTS "Users can update own suggestions" ON outfit_suggestions;
DROP POLICY IF EXISTS "Users can delete own suggestions" ON outfit_suggestions;

-- Create RLS policies for outfit_suggestions table
-- Allow users to view their own suggestions
CREATE POLICY "Users can view own suggestions" ON outfit_suggestions
FOR SELECT USING (auth.uid()::text = user_id);

-- Allow users to insert their own suggestions
CREATE POLICY "Users can insert own suggestions" ON outfit_suggestions
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own suggestions
CREATE POLICY "Users can update own suggestions" ON outfit_suggestions
FOR UPDATE USING (auth.uid()::text = user_id);

-- Allow users to delete their own suggestions
CREATE POLICY "Users can delete own suggestions" ON outfit_suggestions
FOR DELETE USING (auth.uid()::text = user_id);
