import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project credentials
const SUPABASE_URL = "https://gaqyfjztpxvzijouiwwh.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_r-JPV56712gCVSERVfYfvw_EMofJPVU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
