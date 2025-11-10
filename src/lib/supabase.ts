// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Step 1: Make sure these are set in your .env file
// VITE_SUPABASE_URL=https://your-project-id.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Step 2: Verify environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables.')
  console.log('supabaseUrl:', supabaseUrl)
  console.log('supabaseAnonKey:', supabaseAnonKey)
}

// Step 3: Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Step 4: Optional test function to verify connection
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...')
  const { data, error } = await supabase
    .from('routes') // Replace with any existing table in your project
    .select('*')
    .limit(1)

  if (error) {
    console.error('Supabase connection error:', error.message)
  } else {
    console.log('✅ Supabase connection successful. Sample data:', data)
  }
}

// Step 5: Type definitions for your tables

export type Location = {
  id: string
  name: string
  description?: string
  x_coordinate: number
  y_coordinate: number
  created_at?: string
}

export type Route = {
  id: string
  from_location_id: string
  to_location_id: string
  distance: number
  created_at?: string
}
