/*
  # Create Auralis Federated Learning Platform Schema

  ## Overview
  This migration creates the complete database schema for Auralis, a federated learning platform
  for disease surveillance. The system simulates multiple hospitals training models locally
  and aggregating results centrally without sharing raw patient data.

  ## New Tables

  ### 1. `hospitals`
  Stores information about participating hospitals in the federated network.
  - `id` (uuid, primary key)
  - `name` (text) - Hospital name
  - `location` (text) - Geographic location
  - `trust_score` (numeric) - Trust/reliability score (0-1)
  - `total_cases` (integer) - Total cases processed
  - `created_at` (timestamptz)

  ### 2. `disease_cases`
  Stores disease case records from all hospitals (for simulation purposes).
  - `id` (uuid, primary key)
  - `hospital_id` (uuid, foreign key)
  - `disease` (text) - Disease name (flu, dengue, malaria, covid, etc.)
  - `symptoms` (jsonb) - Array of symptoms
  - `temperature` (numeric) - Temperature in Celsius
  - `humidity` (numeric) - Humidity percentage
  - `date` (date) - Case date
  - `patient_age` (integer)
  - `patient_gender` (text)
  - `created_at` (timestamptz)

  ### 3. `predictions`
  Stores prediction results from the AI model.
  - `id` (uuid, primary key)
  - `symptoms` (jsonb) - Input symptoms
  - `temperature` (numeric)
  - `humidity` (numeric)
  - `location` (text)
  - `predicted_disease` (text)
  - `risk_score` (numeric) - Probability score (0-1)
  - `confidence` (numeric)
  - `explanation` (jsonb) - SHAP values or feature importance
  - `created_at` (timestamptz)

  ### 4. `alerts`
  Stores outbreak alerts and warnings.
  - `id` (uuid, primary key)
  - `hospital_id` (uuid, foreign key, nullable)
  - `location` (text)
  - `disease` (text)
  - `case_count` (integer)
  - `threshold` (integer)
  - `severity` (text) - low, medium, high, critical
  - `status` (text) - active, resolved
  - `alert_date` (date)
  - `created_at` (timestamptz)

  ### 5. `model_updates`
  Tracks federated learning model updates from each hospital.
  - `id` (uuid, primary key)
  - `hospital_id` (uuid, foreign key)
  - `round_number` (integer) - Federated learning round
  - `model_weights` (jsonb) - Serialized model parameters
  - `accuracy` (numeric)
  - `loss` (numeric)
  - `samples_trained` (integer)
  - `created_at` (timestamptz)

  ### 6. `global_models`
  Stores aggregated global model after federated learning rounds.
  - `id` (uuid, primary key)
  - `round_number` (integer)
  - `model_weights` (jsonb)
  - `accuracy` (numeric)
  - `participating_hospitals` (integer)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated access (for demo, allowing broad access)
*/

-- Create hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  trust_score numeric DEFAULT 0.85 CHECK (trust_score >= 0 AND trust_score <= 1),
  total_cases integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create disease_cases table
CREATE TABLE IF NOT EXISTS disease_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  disease text NOT NULL,
  symptoms jsonb NOT NULL,
  temperature numeric NOT NULL,
  humidity numeric NOT NULL,
  date date NOT NULL,
  patient_age integer,
  patient_gender text,
  created_at timestamptz DEFAULT now()
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptoms jsonb NOT NULL,
  temperature numeric NOT NULL,
  humidity numeric NOT NULL,
  location text NOT NULL,
  predicted_disease text NOT NULL,
  risk_score numeric NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  explanation jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL,
  location text NOT NULL,
  disease text NOT NULL,
  case_count integer NOT NULL,
  threshold integer NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  alert_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create model_updates table
CREATE TABLE IF NOT EXISTS model_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  model_weights jsonb NOT NULL,
  accuracy numeric,
  loss numeric,
  samples_trained integer,
  created_at timestamptz DEFAULT now()
);

-- Create global_models table
CREATE TABLE IF NOT EXISTS global_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number integer NOT NULL UNIQUE,
  model_weights jsonb NOT NULL,
  accuracy numeric,
  participating_hospitals integer,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_disease_cases_hospital ON disease_cases(hospital_id);
CREATE INDEX IF NOT EXISTS idx_disease_cases_date ON disease_cases(date);
CREATE INDEX IF NOT EXISTS idx_disease_cases_disease ON disease_cases(disease);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_date ON alerts(alert_date);
CREATE INDEX IF NOT EXISTS idx_model_updates_round ON model_updates(round_number);

-- Enable Row Level Security
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allowing public access for demo purposes)
CREATE POLICY "Allow public read access to hospitals"
  ON hospitals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to hospitals"
  ON hospitals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read access to disease_cases"
  ON disease_cases FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to disease_cases"
  ON disease_cases FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read access to predictions"
  ON predictions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to predictions"
  ON predictions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read access to alerts"
  ON alerts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to alerts"
  ON alerts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to alerts"
  ON alerts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to model_updates"
  ON model_updates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to model_updates"
  ON model_updates FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read access to global_models"
  ON global_models FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to global_models"
  ON global_models FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to global_models"
  ON global_models FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public update to model_updates"
  ON model_updates FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to model_updates"
  ON model_updates FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public delete to global_models"
  ON global_models FOR DELETE
  TO anon, authenticated
  USING (true);