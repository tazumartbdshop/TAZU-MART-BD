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

    let serverUrl = "";
    let serverKey = "";

    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        console.log("[Supabase Config] Received JSON response from server:", data);
        if (data.supabaseUrl && data.supabaseKey) {
          serverUrl = data.supabaseUrl;
          serverKey = data.supabaseKey;
        }
      }
    }

    // If server API returned valid credentials, use them and save them as backup to Firestore
    if (serverUrl && serverKey) {
      (window as any).__supabase_url = serverUrl;
      (window as any).__supabase_key = serverKey;
      (window as any).__SUPABASE_URL = serverUrl;
      (window as any).__SUPABASE_KEY = serverKey;

      // Backup to localStorage
      localStorage.setItem('sb_url_backup', serverUrl);
      localStorage.setItem('sb_key_backup', serverKey);
      
      // Auto-replicate to Firestore so it persists across container restarts/scale-to-zero
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        if (db) {
          const docRef = doc(db, 'settings', 'supabase_credential');
          await setDoc(docRef, {
            supabaseUrl: serverUrl,
            supabaseKey: serverKey,
            updatedAt: Date.now()
          }, { merge: true });
          console.log("%c[Supabase Config] SUCCESS: Replicated server-side credentials to Firestore persistent node.", "color: #10b981; font-weight: bold;");
        }
      } catch (err) {
        console.warn("[Supabase Config] Non-blocking Firestore write safeguard skipped:", err);
      }

      console.log(`%c[Supabase Config] SUCCESS: Connected to ${serverUrl}`, "color: #10b981; font-weight: bold;");
      return true;
    }

    // If server returned empty, fall back to reading from Firestore settings collection
    console.log("%c[Supabase Config] Server config empty. Searching Firestore settings fallback...", "color: #eab308; font-weight: bold;");
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      if (db) {
        const docRef = doc(db, 'settings', 'supabase_credential');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          if (firestoreData.supabaseUrl && firestoreData.supabaseKey) {
            console.log("%c[Supabase Config] SUCCESS: Retrieved persistent credentials from Firestore settings collection!", "color: #10b981; font-weight: bold;");
            
            const finalUrl = firestoreData.supabaseUrl;
            const finalKey = firestoreData.supabaseKey;

            (window as any).__supabase_url = finalUrl;
            (window as any).__supabase_key = finalKey;
            (window as any).__SUPABASE_URL = finalUrl;
            (window as any).__SUPABASE_KEY = finalKey;

            localStorage.setItem('sb_url_backup', finalUrl);
            localStorage.setItem('sb_key_backup', finalKey);
            return true;
          }
        }
      }
    } catch (fsErr) {
      console.warn("[Supabase Config] Firestore retrieval failed or bypassed:", fsErr);
    }

  } catch (err) {
    console.error("[Supabase Config] Network error while fetching config:", err);
  }
  return false;
};

