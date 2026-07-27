import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Production Supabase Credentials
const DEFAULT_SUPABASE_URL = "https://gaqyfjztpxvzijouiwwh.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcXlmanp0cHh2emlqb3Vpd3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1OTM0NTIsImV4cCI6MjA5NTE2OTQ1Mn0.LdN6jVd5fYi_KsJnjridUl3Gr_RxahnXRvahb5dggsw";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const getSupabaseCredentials = () => {
  return { url: supabaseUrl, key: supabaseAnonKey };
};

export const getSupabase = (): SupabaseClient => {
  return supabase;
};

export const fetchSupabaseConfigFromServer = async (): Promise<boolean> => {
  return true;
};
