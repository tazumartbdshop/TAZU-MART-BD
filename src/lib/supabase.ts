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

    // 1. Try fetching from Cloud Firestore (Master Dynamic Persistent Synchronization source)
    try {
      console.log("[Supabase Config] Fetching live parameters from persistent Cloud Firestore...");
      const { db } = await import('./firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'settings', 'supabase');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.url && data.key) {
          (window as any).__supabase_url = data.url;
          (window as any).__supabase_key = data.key;
          (window as any).__SUPABASE_URL = data.url;
          (window as any).__SUPABASE_KEY = data.key;
          console.log("[Supabase Config] SUCCESS: Retrieved and applied live credentials from Cloud Firestore:", data.url);
          return true;
        }
      } else {
        console.log("[Supabase Config] No credentials record found in settings/supabase in Firestore.");
      }
    } catch (firestoreErr) {
      console.warn("[Supabase Config] Cloud Firestore connection test bypass/fallback:", firestoreErr);
    }

    // 2. Fallback to /api/supabase-config server endpoint
    console.log("[Supabase Config] Fetching from /api/supabase-config (cache: no-store)...");
    const res = await fetch('/api/supabase-config', { cache: 'no-store' });
    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
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
        console.log("[Supabase Config] API response content type is not JSON (possibly static host fallback). Bypassing server lookup.");
      }
    } else {
      console.warn("[Supabase Config] Server API fetch failed with status:", res.status);
    }
  } catch (err) {
    console.error("[Supabase Config] Network error while fetching config:", err);
  }
  return false;
};

