-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS engineers CASCADE;
DROP FUNCTION IF EXISTS generate_project_code() CASCADE;

-- Create engineers table
CREATE TABLE engineers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table with new fields
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT,
  service_type TEXT,
  start_date DATE,
  received_date DATE,
  result_date DATE,
  status TEXT DEFAULT 'pending',
  total_price NUMERIC DEFAULT 0,
  engineer_share NUMERIC DEFAULT 0,
  company_share NUMERIC DEFAULT 0,
  engineer_id UUID REFERENCES engineers(id),
  payment_status TEXT DEFAULT 'unpaid',
  notes TEXT,
  drawing_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create function to auto-generate project code and calculate shares
CREATE OR REPLACE FUNCTION generate_project_code()
RETURNS TRIGGER AS $$
DECLARE
  year TEXT;
  next_number INTEGER;
  new_code TEXT;
BEGIN
  year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Get the next number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 'BC-[0-9]+-([0-9]+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM projects
  WHERE code LIKE 'BC-' || year || '-%';
  
  -- Format: BC-YYYY-XXX
  new_code := 'BC-' || year || '-' || LPAD(next_number::TEXT, 3, '0');
  
  NEW.code := new_code;
  
  -- Calculate shares (20% for engineer, 80% for company)
  NEW.engineer_share := NEW.total_price * 0.2;
  NEW.company_share := NEW.total_price * 0.8;
  
  -- Set default start_date if not provided
  IF NEW.start_date IS NULL THEN
    NEW.start_date := CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating code and calculating shares
CREATE TRIGGER set_project_code_and_shares
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_code();

-- Create trigger for updating shares on update
CREATE OR REPLACE FUNCTION update_project_shares()
RETURNS TRIGGER AS $$
BEGIN
  NEW.engineer_share := NEW.total_price * 0.2;
  NEW.company_share := NEW.total_price * 0.8;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_shares_trigger
  BEFORE UPDATE OF total_price ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_shares();

-- RLS Policies for engineers
CREATE POLICY "Enable read access for all users" ON engineers
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON engineers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON engineers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON engineers
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for projects
CREATE POLICY "Enable read access for all users" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON projects
  FOR DELETE USING (auth.role() = 'authenticated');
