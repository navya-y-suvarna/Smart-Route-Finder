import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Location {
  id: string;
  name: string;
  description: string;
  x_coordinate: number;
  y_coordinate: number;
  created_at: string;
}

export interface Route {
  id: string;
  from_location_id: string;
  to_location_id: string;
  distance: number;
  created_at: string;
}
