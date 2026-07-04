/* =========================================================================
   Public front-end configuration
   -------------------------------------------------------------------------
   Paste your Supabase project values below. Both of these are PUBLIC keys —
   the anon key is designed to be exposed in browser code. Your data stays
   safe because access is controlled by Row Level Security policies in
   supabase/schema.sql (the anon role may INSERT referrals but cannot read
   them back).

   Where to find these:
     Supabase dashboard  ->  Project Settings  ->  API
       • Project URL   -> SUPABASE_URL
       • anon public   -> SUPABASE_ANON_KEY

   Until you fill these in, the form runs in DEMO MODE: it validates and
   shows the success screen but does not save anything.
   ========================================================================= */
window.CHT_CONFIG = {
  SUPABASE_URL: 'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
};
