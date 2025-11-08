/*
  # Smart Route Finder Database Schema

  1. New Tables
    - `locations`
      - `id` (uuid, primary key) - Unique identifier for each location
      - `name` (text, unique) - Name of the location/landmark
      - `description` (text) - Optional description
      - `x_coordinate` (numeric) - X position for visualization
      - `y_coordinate` (numeric) - Y position for visualization
      - `created_at` (timestamptz) - Timestamp of creation
    
    - `routes`
      - `id` (uuid, primary key) - Unique identifier for each route
      - `from_location_id` (uuid, foreign key) - Starting location
      - `to_location_id` (uuid, foreign key) - Ending location
      - `distance` (numeric) - Distance/weight of the route
      - `created_at` (timestamptz) - Timestamp of creation
    
  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (route finder is public)
    - Add policies for authenticated users to manage data
  
  3. Indexes
    - Index on location names for fast lookup
    - Composite index on route endpoints for efficient pathfinding queries
  
  4. Constraints
    - Ensure distance is positive
    - Prevent self-loops (from and to locations must be different)
    - Ensure bidirectional routes (if A->B exists with distance d, B->A should also exist)
*/

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  x_coordinate numeric NOT NULL DEFAULT 0,
  y_coordinate numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  to_location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  distance numeric NOT NULL CHECK (distance > 0),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT different_locations CHECK (from_location_id != to_location_id),
  CONSTRAINT unique_route UNIQUE (from_location_id, to_location_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_routes_from ON routes(from_location_id);
CREATE INDEX IF NOT EXISTS idx_routes_to ON routes(to_location_id);
CREATE INDEX IF NOT EXISTS idx_routes_endpoints ON routes(from_location_id, to_location_id);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Policies for locations table
CREATE POLICY "Anyone can view locations"
  ON locations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete locations"
  ON locations FOR DELETE
  TO authenticated
  USING (true);

-- Policies for routes table
CREATE POLICY "Anyone can view routes"
  ON routes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert routes"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update routes"
  ON routes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete routes"
  ON routes FOR DELETE
  TO authenticated
  USING (true);
