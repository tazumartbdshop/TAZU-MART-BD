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
  let url = (window as any).__supabase_url || envUrl;
  let key = (window as any).__supabase_key || envKey;
  
  if (localSettings) {
    try {
      const parsed = JSON.parse(localSettings);
      if (parsed.supabaseUrl && parsed.supabaseKey) {
        if (!(window as any).__supabase_url) url = parsed.supabaseUrl;
        if (!(window as any).__supabase_key) key = parsed.supabaseKey;
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

// Create a dynamic proxy to avoid stale reference issues across different origins
const supabaseProxy = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabase();
    if (!client) {
      console.warn(`[Supabase Proxy] Accessing property '${String(prop)}' but Supabase client is not initialized yet.`);
      return undefined;
    }
    const val = Reflect.get(client, prop);
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
});

export const supabase = supabaseProxy;

// Secure helper to load configuration from backend
export const fetchSupabaseConfigFromServer = async (): Promise<boolean> => {
  try {
    console.log("[Supabase Config] Fetching credentials from backend /api/supabase-config...");
    const res = await fetch('/api/supabase-config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseKey) {
        (window as any).__supabase_url = data.supabaseUrl;
        (window as any).__supabase_key = data.supabaseKey;
        
        // Update localStorage as fallback
        const stored = localStorage.getItem('supabase_config');
        let parsed = {};
        if (stored) {
          try { parsed = JSON.parse(stored); } catch(e) {}
        }
        localStorage.setItem('supabase_config', JSON.stringify({
          ...parsed,
          supabaseUrl: data.supabaseUrl,
          supabaseKey: data.supabaseKey
        }));
        
        console.log("[Supabase Config] Successfully obtained credentials from server. URL:", data.supabaseUrl);
        return true;
      }
    } else {
      console.warn("[Supabase Config] /api/supabase-config endpoint returned status:", res.status);
    }
  } catch (err) {
    console.error("[Supabase Config] Error fetching credentials from server:", err);
  }
  return false;
};

