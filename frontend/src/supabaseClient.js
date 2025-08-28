// Initialise the Supabase client.  Import this module wherever you need
// to interact with the database or authentication.  The URL and
// anonymous key are pulled from environment variables defined in
// `.env`.
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)