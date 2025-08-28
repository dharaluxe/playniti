# Backend – Supabase Setup

This directory contains database definitions and serverless functions used by Playniti.  Supabase provides a hosted PostgreSQL database, authentication, storage and an edge function runtime.  To set up the backend properly you will need to:

1. **Create tables:**  Run the SQL statements found in `schema.sql` in the Supabase SQL editor.  These tables store users, events, matches, subscriptions, transactions and other metadata.

2. **Configure Row Level Security (RLS):**  For each table, enable RLS and create policies that allow only authorised users to read or write rows.  For example, users should only be able to read their own matches, and admin users should be able to view all records.  See the Supabase documentation for details.

3. **Deploy edge functions:**  The `functions` directory contains example edge functions.  Each file represents a serverless function.  Use the Supabase CLI (`supabase functions deploy`) to upload them to your project.  These functions run on demand, for example to compute rewards after an event ends.

4. **Environment variables:**  Supabase edge functions rely on environment variables to connect to your project.  The Service Role key is required in order to update data securely from the server side.  Store it in the environment where you deploy functions and never expose it in the client.
