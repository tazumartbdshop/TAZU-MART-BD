import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get fallback from env if available
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

// Always create a dynamic getter so we can use the latest creds
export const getSupabase = (): SupabaseClient | null => {
  const localSettings = localStorage.getItem('supabase_config');
  let url = envUrl;
  let key = envKey;
  
  if (localSettings) {
    try {
      const parsed = JSON.parse(localSettings);
      if (parsed.supabaseUrl && parsed.supabaseKey) {
        url = parsed.supabaseUrl;
        key = parsed.supabaseKey;
      }
    } catch(e) {}
  }
  
  if (!url || !key) {
    return null; // Not configured
  }
  
  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }
  
  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    cachedUrl = url;
    cachedKey = key;
  } catch (err) {
    console.error("Failed to create Supabase client:", err);
    return null;
  }
  
  return cachedClient;
};

export const supabase = getSupabase();

