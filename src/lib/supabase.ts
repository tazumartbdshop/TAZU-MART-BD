import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get fallback from env if available
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

// Helper to get raw credentials from any available source
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
    console.warn("%c[Supabase Config] WARNING: No configuration found in Environment OR Server Injection. Using hardcoded production fallback (gaqyfj).", "color: #f59e0b; font-weight: bold;");
    url = "https://gaqyfjztpxvzijouiwwh.supabase.co";
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcXlmanp0cHh2emlqb3Vpd3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgzMzk3NjgsImV4cCI6MjAzMzkxNTc2OH0.C8R-JPV56712gCVSERVfYfvw_EMofJPVU";
  }

  return { url, key };
};

// Global for debugging
if (typeof window !== 'undefined') {
  (window as any).getSupabaseCredentials = getSupabaseCredentials;
}

// Always create a dynamic getter so we can use the latest creds
export const getSupabase = (): SupabaseClient | null => {
  const { url, key } = getSupabaseCredentials();
  
  if (!url || !key) {
    console.warn("[Supabase Lib] No credentials found.");
    return null;
  }
  
  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }
  
  try {
    console.log(`[Supabase Lib] Initializing standard client: ${url}`);
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
    // Check if injected via server-side script first (Production Sync)
    if ((window as any).__SUPABASE_URL && (window as any).__SUPABASE_KEY) {
      console.log("%c[Supabase Config] Using credentials injected into HTML by Live Server.", "color: #a855f7; font-weight: bold;");
      return true;
    }

    // Polling Mechanism: Wait up to 2 seconds for server-side injection if not immediately present
    // This handles races between HTML render and JS execution
    for (let attempt = 0; attempt < 5; attempt++) {
      if ((window as any).__SUPABASE_URL && (window as any).__SUPABASE_KEY) {
        console.log(`[Supabase Config] Found credentials after ${attempt * 400}ms poll.`);
        return true;
      }
      await new Promise(r => setTimeout(r, 400));
    }

    // Last Resort: Direct API fetch from backend
    console.log(`%c[Supabase Config] FETCHING from server API @ ${new Date().toISOString()}`, "color: #3b82f6; font-weight: bold;");
    
    // Add a timeout to the fetch to prevent hanging in production containers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/supabase-config', { 
      cache: 'no-store',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        console.log("[Supabase Config] Received JSON response from server:", data);
        
        if (data.supabaseUrl && data.supabaseKey) {
          (window as any).__supabase_url = data.supabaseUrl;
          (window as any).__supabase_key = data.supabaseKey;
          
          // Also update the __SUPABASE_URL/KEY aliases just in case
          (window as any).__SUPABASE_URL = data.supabaseUrl;
          (window as any).__SUPABASE_KEY = data.supabaseKey;

          // Backup to localStorage
          localStorage.setItem('sb_url_backup', data.supabaseUrl);
          localStorage.setItem('sb_key_backup', data.supabaseKey);
          
          console.log(`%c[Supabase Config] SUCCESS: Connected to ${data.supabaseUrl}`, "color: #10b981; font-weight: bold;");
          console.log("[Supabase Config] Root credentials synchronized. Future client calls will target this instance.");
          return true;
        } else {
          console.warn("[Supabase Config] WARNING: Server returned status OK but with empty/null credentials.", data);
        }
      } else {
        const text = await res.text();
        console.log("[Supabase Config] API response was not JSON. Recieved text preview:", text.substring(0, 100));
      }
    } else {
      console.warn(`%c[Supabase Config] ERROR: Server API returned ${res.status} ${res.statusText}`, "color: #ef4444; font-weight: bold;");
    }
  } catch (err) {
    console.error("[Supabase Config] Network error while fetching config:", err);
  }
  return false;
};

