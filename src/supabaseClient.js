import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project credentials
const SUPABASE_URL = "https://gaqyfjztpxvzijouiwwh.supabase.co";
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcXlmanp0cHh2emlqb3Vpd3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1OTM0NTIsImV4cCI6MjA5NTE2OTQ1Mn0.LdN6jVd5fYi_KsJnjridUl3Gr_RxahnXRvahb5dggsw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
