import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get fallback from env if available
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

// Always create a dynamic getter so we can use the latest creds
export const getSupabase = (): SupabaseClient | null => {
  // Priority order for credentials:
  // 1. Primary window variables (Injected via server.ts synchronously into <head>)
  // 2. Legacy window variables (Lower-case aliases)
  // 3. LocalStorage persistence (User-set via Admin UI)
  // 4. Build-time environment variables (VITE_SUPABASE_URL)
  
  let url = (window as any).__SUPABASE_URL || (window as any).__supabase_url;
  let key = (window as any).__SUPABASE_KEY || (window as any).__supabase_key;
  
  // Final fallback to build-time env vars
  if (!url || !key) {
    url = envUrl;
    key = envKey;
    if (url && key) {
      console.debug("[Supabase Lib] Using build-time environment variables (envUrl).");
    }
  }
  
  if (!url || !key) {
    console.warn("[Supabase Lib] No credentials found. Supabase services will be disabled.");
    return null; // Not configured
  }
  
  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }
  
  try {
    console.log(`[Supabase Lib] Initializing new client with URL: ${url}`);
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    cachedUrl = url;
    cachedKey = key;
  } catch (err) {
    console.error("[Supabase Lib] Failed to create Supabase client:", err);
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
    // If already have window vars from HTML injection, no need to fetch again
    if (((window as any).__SUPABASE_URL && (window as any).__SUPABASE_KEY) || 
        ((window as any).__supabase_url && (window as any).__supabase_key)) {
      console.log("[Supabase Config] Using credentials already present in window/head.");
      return true;
    }

    console.log("[Supabase Config] No pre-injected variables found. Fetching from /api/supabase-config (cache: no-store)...");
    const res = await fetch('/api/supabase-config', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseKey) {
        (window as any).__supabase_url = data.supabaseUrl;
        (window as any).__supabase_key = data.supabaseKey;
        
        // Also update the __SUPABASE_URL/KEY aliases just in case
        (window as any).__SUPABASE_URL = data.supabaseUrl;
        (window as any).__SUPABASE_KEY = data.supabaseKey;
        
        console.log("[Supabase Config] Successfully obtained credentials from server API.");
        return true;
      } else {
        console.warn("[Supabase Config] Server API returned empty credentials. Falling back to build defaults.");
      }
    } else {
      console.warn("[Supabase Config] Server API fetch failed with status:", res.status);
    }
  } catch (err) {
    console.error("[Supabase Config] Network error while fetching config:", err);
  }
  return false;
};

