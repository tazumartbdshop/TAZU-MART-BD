import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get fallback from env if available
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

/**
 * Helper to retrieve Supabase credentials from available sources:
 * 1. Window-injected variables (dynamic config from server)
 * 2. LocalStorage backup
 * 3. Environment variables (build-time)
 * 4. Hardcoded fallback (gaqyfj)
 */
export const getSupabaseCredentials = () => {
  let url = (window as any).__SUPABASE_URL || (window as any).__supabase_url;
  let key = (window as any).__SUPABASE_KEY || (window as any).__supabase_key;
  
  if (!url || !key) {
    const storedUrl = localStorage.getItem('sb_url_backup');
    const storedKey = localStorage.getItem('sb_key_backup');
    if (storedUrl && storedKey) {
      url = storedUrl;
      key = storedKey;
    }
  }

  if (!url || !key) {
    url = envUrl;
    key = envKey;
  }

  // Absolute fallback for production (gaqyfj)
  if (!url || !key) {
    url = "https://gaqyfjztpxvzijouiwwh.supabase.co";
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcXlmanp0cHh2emlqb3Vpd3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1OTM0NTIsImV4cCI6Mj9NMTY5NDUyM00.LdN6jVd5fYi_KsJnjridUl3Gr_RxahnXRvahb5dggsw";
  }

  return { url, key };
};

// Global for debugging
if (typeof window !== 'undefined') {
  (window as any).getSupabaseCredentials = getSupabaseCredentials;
}

/**
 * Returns a configured Supabase client instance. 
 * Re-initializes if credentials have changed.
 */
export const getSupabase = (): SupabaseClient | null => {
  const { url, key } = getSupabaseCredentials();
  
  if (!url || !key) {
    console.warn("[Supabase Lib] No credentials found.");
    return null;
  }
  
  // Return cached client if credentials haven't changed
  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }
  
  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
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

/**
 * A proxy object that always points to the correctly initialized Supabase client.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabase();
    if (!client) {
      console.warn(`[Supabase Proxy] Accessing '${String(prop)}' but Supabase client is not initialized.`);
      return undefined;
    }
    const val = Reflect.get(client, prop);
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
});

/**
 * Securely fetch Supabase configuration from the backend API.
 */
export const fetchSupabaseConfigFromServer = async (): Promise<boolean> => {
  try {
    // 1. Check for immediate injection
    if ((window as any).__SUPABASE_URL && (window as any).__SUPABASE_KEY) {
      return true;
    }

    // 2. Poll briefly for delayed HTML injection
    for (let attempt = 0; attempt < 5; attempt++) {
      if ((window as any).__SUPABASE_URL && (window as any).__SUPABASE_KEY) {
        return true;
      }
      await new Promise(r => setTimeout(r, 400));
    }

    // 3. Direct API fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/supabase-config', { 
      cache: 'no-store',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseKey) {
        const serverUrl = data.supabaseUrl;
        const serverKey = data.supabaseKey;

        (window as any).__SUPABASE_URL = serverUrl;
        (window as any).__SUPABASE_KEY = serverKey;

        localStorage.setItem('sb_url_backup', serverUrl);
        localStorage.setItem('sb_key_backup', serverKey);
        
        return true;
      }
    }
  } catch (err) {
    console.error("[Supabase Config] Network error while fetching config:", err);
  }
  return false;
};
