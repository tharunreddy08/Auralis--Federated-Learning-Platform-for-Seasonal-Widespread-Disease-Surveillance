-- Fix RLS Policies for Federated Learning Tables
-- Run this in Supabase SQL Editor to fix the "violates row-level security policy" error

-- Add DELETE policy for global_models (required for cleanup/re-running rounds)
CREATE POLICY IF NOT EXISTS "Allow public delete to global_models"
  ON global_models FOR DELETE
  USING (true);

-- Add DELETE policy for model_updates (required for cleanup)
CREATE POLICY IF NOT EXISTS "Allow public delete to model_updates"
  ON model_updates FOR DELETE
  USING (true);

-- Add UPDATE policy for global_models (optional, for future use)
CREATE POLICY IF NOT EXISTS "Allow public update to global_models"
  ON global_models FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Add UPDATE policy for model_updates (optional, for future use)  
CREATE POLICY IF NOT EXISTS "Allow public update to model_updates"
  ON model_updates FOR UPDATE
  USING (true)
  WITH CHECK (true);
