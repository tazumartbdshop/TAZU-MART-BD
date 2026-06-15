import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

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
    cachedClient = createBrowserClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        fetch: (fetchUrl, fetchOptions) => {
          return fetch(fetchUrl, {
            ...fetchOptions,
            cache: 'no-store'
          });
        }
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

    // Fetch from /api/supabase-config server endpoint
    console.log(`%c[Supabase Config] Fetching from /api/supabase-config @ ${new Date().toISOString()}`, "color: #3b82f6; font-weight: bold;");
    
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

