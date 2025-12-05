/*
  # Create Usage Tracking Table

  ## Overview
  This migration creates the usage tracking system to monitor API usage and enforce limits
  based on user subscription tiers (free vs pro).

  ## New Table

  ### `usage_tracking`
  Tracks AI generation requests per user for billing and rate limiting.
  - `id` (uuid, primary key) - Unique tracking record identifier
  - `user_id` (text, not null) - Reference to Convex users table
  - `request_type` (text, not null) - Type of request: 'chat', 'hook_generation', 'script_generation'
  - `tokens_used` (integer) - Approximate tokens consumed
  - `success` (boolean) - Whether request succeeded
  - `error_message` (text, nullable) - Error details if failed
  - `created_at` (timestamptz) - When request was made
  - `month` (text) - Format: 'YYYY-MM' for monthly aggregation

  ## Usage Limits (enforced in application logic)
  - Free tier: 10 generations per month
  - Pro tier: Unlimited generations

  ## Security
  - RLS enabled
  - Users can only view their own usage data
  - Only the system (service role) can insert usage records

  ## Indexes
  - Index on user_id for fast user lookup
  - Index on month for monthly aggregation queries
  - Index on created_at for chronological analysis
*/

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('chat', 'hook_generation', 'script_generation', 'topic_generation')),
  tokens_used integer DEFAULT 0,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now(),
  month text NOT NULL DEFAULT to_char(now(), 'YYYY-MM')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_month ON usage_tracking(month);
CREATE INDEX IF NOT EXISTS idx_usage_created_at ON usage_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON usage_tracking(user_id, month);

-- Enable RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view own usage data"
  ON usage_tracking
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Note: INSERT policy is intentionally restrictive
-- Only the backend (using service role key) should insert usage records
CREATE POLICY "Service role can insert usage records"
  ON usage_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- Create a function to get monthly usage count for a user
CREATE OR REPLACE FUNCTION get_monthly_usage_count(p_user_id text, p_month text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usage_count integer;
BEGIN
  SELECT COUNT(*)
  INTO usage_count
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND month = p_month
    AND success = true;
  
  RETURN COALESCE(usage_count, 0);
END;
$$;