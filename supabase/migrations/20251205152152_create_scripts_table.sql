/*
  # Create Scripts Table

  ## Overview
  This migration creates the scripts table for storing generated content (hooks, scripts, topics)
  that users want to save for later reference.

  ## New Table

  ### `scripts`
  Stores saved generated content from AI interactions.
  - `id` (uuid, primary key) - Unique script identifier
  - `user_id` (text, not null) - Reference to Convex users table
  - `conversation_id` (uuid, nullable) - Optional link to source conversation
  - `type` (text, not null) - Content type: 'hook', 'script', 'topic', 'full_video'
  - `category` (text, nullable) - Hook category: 'educational', 'lifestyle', 'opinion', 'engagement'
  - `title` (text, not null) - User-provided or auto-generated title
  - `content` (text, not null) - The actual generated content
  - `metadata` (jsonb) - Additional data like target audience, niche, tone
  - `is_favorite` (boolean) - Whether user marked as favorite
  - `created_at` (timestamptz) - When script was saved
  - `updated_at` (timestamptz) - Last modification time

  ## Security
  - RLS enabled
  - Users can only access their own saved scripts
  - Authenticated users can create, read, update, and delete their own scripts

  ## Indexes
  - Index on user_id for fast user lookup
  - Index on type for filtering by content type
  - Index on is_favorite for quick favorites access
  - Index on created_at for chronological sorting
*/

-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('hook', 'script', 'topic', 'full_video')),
  category text CHECK (category IN ('educational', 'lifestyle', 'opinion', 'engagement', 'list', 'how_to')),
  title text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_scripts_type ON scripts(type);
CREATE INDEX IF NOT EXISTS idx_scripts_category ON scripts(category);
CREATE INDEX IF NOT EXISTS idx_scripts_is_favorite ON scripts(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_scripts_created_at ON scripts(created_at DESC);

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scripts
CREATE POLICY "Users can view own scripts"
  ON scripts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own scripts"
  ON scripts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own scripts"
  ON scripts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own scripts"
  ON scripts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);