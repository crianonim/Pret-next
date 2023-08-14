import { createClient } from '@supabase/supabase-js'

let supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL || "TODO: Your Supabase URL"
let supabase_key = process.env.NEXT_PUBLIC_SUPABASE_KEY || "TODO: Your Supabase Key"

// Create a single supabase client for interacting with your database
const supabase = createClient(supabase_url,
    supabase_key)

export default supabase