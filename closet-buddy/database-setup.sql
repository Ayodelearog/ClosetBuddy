-- ClosetBuddy Database Setup Script
-- Run this in your Supabase SQL Editor to set up all required tables and policies

-- Create clothing_items table (if not exists)
CREATE TABLE IF NOT EXISTS clothing_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  colors TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  occasions TEXT[] NOT NULL DEFAULT '{}',
  seasons TEXT[] NOT NULL DEFAULT '{}',
  mood_tags TEXT[] NOT NULL DEFAULT '{}',
  brand TEXT,
  size TEXT,
  material TEXT,
  care_instructions TEXT,
  purchase_date TEXT,
  last_worn TIMESTAMP,
  wear_count INTEGER NOT NULL DEFAULT 0,
  favorite BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  favorite_colors TEXT[] NOT NULL DEFAULT '{}',
  style_preferences TEXT[] NOT NULL DEFAULT '{}',
  size_preferences JSONB NOT NULL DEFAULT '{}',
  brand_preferences TEXT[] NOT NULL DEFAULT '{}',
  budget_range JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create outfit_suggestions table (for future use)
CREATE TABLE IF NOT EXISTS outfit_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  occasion TEXT,
  weather_condition TEXT,
  temperature_range TEXT,
  suggested_items JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create storage bucket for images (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('clothing-images', 'clothing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'clothing-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'clothing-images');

CREATE POLICY "Users can update own images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'clothing-images');

CREATE POLICY "Users can delete own images" ON storage.objects 
FOR DELETE USING (bucket_id = 'clothing-images');

-- Enable Row Level Security on all tables
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clothing_items table
CREATE POLICY "Users can view own items" ON clothing_items
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own items" ON clothing_items
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own items" ON clothing_items
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own items" ON clothing_items
FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for user_preferences table
CREATE POLICY "Users can view own preferences" ON user_preferences
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for outfit_suggestions table
CREATE POLICY "Users can view own suggestions" ON outfit_suggestions
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own suggestions" ON outfit_suggestions
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own suggestions" ON outfit_suggestions
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own suggestions" ON outfit_suggestions
FOR DELETE USING (auth.uid()::text = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);
CREATE INDEX IF NOT EXISTS idx_clothing_items_created_at ON clothing_items(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_suggestions_user_id ON outfit_suggestions(user_id);

-- Add updated_at trigger for user_preferences
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at 
BEFORE UPDATE ON user_preferences 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clothing_items_updated_at 
BEFORE UPDATE ON clothing_items 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
