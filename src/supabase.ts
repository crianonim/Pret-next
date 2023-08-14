import { createClient } from '@supabase/supabase-js'

let supabase_url = (process.env.NODE_ENV == "production") ? (process.env.NEXT_PUBLIC_SUPABASE_URL || "") : (process.env.NEXT_PUBLIC_DEV_SUPABASE_URL || "")
let supabase_key = (process.env.NODE_ENV == "production") ? (process.env.NEXT_PUBLIC_SUPABASE_KEY || "") : (process.env.NEXT_PUBLIC_DEV_SUPABASE_KEY || "")

// Create a single supabase client for interacting with your database
const supabase = createClient(supabase_url,
    supabase_key)

export default supabase