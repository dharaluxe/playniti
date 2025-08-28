// Initialise the Supabase client.
// The URL and anonymous key are injected directly here so the app can run
// without relying on build-time environment variables. If you wish to
// keep the keys out of your source code, consider using Netlify
// environment variables instead.
import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
const SUPABASE_URL = 'https://rwxqrrfeyohjgbifpepp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3eHFycmZleW9oamdiaWZwZXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODgzMDYsImV4cCI6MjA3MTE2NDMwNn0.iy9ABbi7mBA8iKzaFug9WhdICSHqYHI5qU1gEMUK-jM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)