/*
  # Fix RLS Policies for Public Access

  1. Changes
    - Update RLS policies to allow public (unauthenticated) users to insert and manage data
    - This allows the public anon key to perform CRUD operations on locations and routes
    - Maintains data integrity through constraints while removing auth requirement
  
  2. Updated Policies
    - Both locations and routes tables now allow public INSERT, UPDATE, and DELETE
    - SELECT remains public (read-only for unauthenticated users was already working)
*/

DROP POLICY IF EXISTS "Authenticated users can insert locations" ON locations;
DROP POLICY IF EXISTS "Authenticated users can update locations" ON locations;
DROP POLICY IF EXISTS "Authenticated users can delete locations" ON locations;

CREATE POLICY "Anyone can insert locations"
  ON locations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update locations"
  ON locations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete locations"
  ON locations FOR DELETE
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert routes" ON routes;
DROP POLICY IF EXISTS "Authenticated users can update routes" ON routes;
DROP POLICY IF EXISTS "Authenticated users can delete routes" ON routes;

CREATE POLICY "Anyone can insert routes"
  ON routes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update routes"
  ON routes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete routes"
  ON routes FOR DELETE
  TO public
  USING (true);
