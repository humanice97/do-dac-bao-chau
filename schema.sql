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

CREATE POLICY "Enable insert for admins only" ON engineers
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );

CREATE POLICY "Enable update for admins only" ON engineers
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );

CREATE POLICY "Enable delete for admins only" ON engineers
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );

-- RLS Policies for projects
CREATE POLICY "Enable read for admins or assigned engineers" ON projects
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR
    (engineer_id IN (SELECT id FROM engineers WHERE user_id = auth.uid()))
  );

CREATE POLICY "Enable insert for admins only" ON projects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );

CREATE POLICY "Enable update for admins or assigned engineers" ON projects
  FOR UPDATE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR
    (engineer_id IN (SELECT id FROM engineers WHERE user_id = auth.uid()))
  );

CREATE POLICY "Enable delete for admins only" ON projects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );

-- Create land_parcels table
CREATE TABLE IF NOT EXISTS land_parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parcel_number TEXT,
  map_sheet_number TEXT,
  area NUMERIC,
  land_type TEXT,
  address_commune_ward TEXT,
  address_district_city TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for land_parcels
ALTER TABLE land_parcels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for land_parcels
CREATE POLICY "Enable read for admins or assigned engineers" ON land_parcels
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR
    (project_id IN (
      SELECT id FROM projects WHERE engineer_id IN (
        SELECT id FROM engineers WHERE user_id = auth.uid()
      )
    ))
  );

CREATE POLICY "Enable insert for admins or assigned engineers" ON land_parcels
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR
      (project_id IN (
        SELECT id FROM projects WHERE engineer_id IN (
          SELECT id FROM engineers WHERE user_id = auth.uid()
        )
      ))
    )
  );

CREATE POLICY "Enable update for admins or assigned engineers" ON land_parcels
  FOR UPDATE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR
    (project_id IN (
      SELECT id FROM projects WHERE engineer_id IN (
        SELECT id FROM engineers WHERE user_id = auth.uid()
      )
    ))
  );

CREATE POLICY "Enable delete for admins only" ON land_parcels
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );

-- ==============================================================================
-- Storage Policies for project-drawings bucket
-- ==============================================================================

-- 1. Drop existing storage policies
DROP POLICY IF EXISTS "Cho phép Upload bản vẽ PDF DGN" ON storage.objects;
DROP POLICY IF EXISTS "Cho phép Xem bản vẽ" ON storage.objects;
DROP POLICY IF EXISTS "Cho phép Update bản vẽ" ON storage.objects;
DROP POLICY IF EXISTS "Cho phép Delete bản vẽ" ON storage.objects;

-- 2. Read access for all users (public can view drawings if URL is shared)
CREATE POLICY "Cho phép Xem bản vẽ"
ON storage.objects FOR SELECT
USING ( bucket_id = 'project-drawings' );

-- 3. Insert access for authenticated users (Admins/Engineers)
CREATE POLICY "Cho phép Upload bản vẽ PDF DGN"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'project-drawings' );

-- 4. Update/Delete access for authenticated users (to override or remove old files)
CREATE POLICY "Cho phép Update bản vẽ"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'project-drawings' );

CREATE POLICY "Cho phép Delete bản vẽ"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'project-drawings' );
