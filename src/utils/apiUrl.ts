/**
 * Utility to resolve the correct API URL depending on the running host environment.
 * Helps statically exported builds (e.g. on Hostinger shared hosting at tazumartbd.com)
 * securely communicate with the active Node.js backend container on Cloud Run.
 */
export function getApiUrl(path: string): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // 1. If we are on AI Studio / Cloud Run containers (contains 'run.app')
    // OR on localhost/127.0.0.1 (local dev)
    // OR if the current hostname matches a known custom domain like tazumartbd.com
    // We should ALWAYS prefer relative paths for the unified container backend.
    if (
      hostname.includes('run.app') || 
      hostname.includes('localhost') || 
      hostname.includes('127.0.0.1') ||
      hostname.includes('web-') ||
      hostname.includes('preview') ||
      hostname.includes('tazumartbd.com')
    ) {
      return path;
    }
  }

  // 2. Production Cloud Run active server domain fallback for TRULY external static hosting
  // (e.g. if the user is hosting the frontend on Vercel/Netlify but backend on Cloud Run).
  const prodBackend = import.meta.env.VITE_API_BASE_URL || 'https://ais-dev-bprxi4s6ojh56gigyoabm3-918145641738.asia-southeast1.run.app';
  
  if (!prodBackend) return path;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${prodBackend}${cleanPath}`;
}

/**
 * A safe fetch wrapper that automatically replaces relative /api/ endpoints with absolute paths
 * pointing to the live production server if run from an external custom domain like tazumartbd.com.
 */
export function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    input = getApiUrl(input);
  }
  return fetch(input, init);
}

/**
 * Utility to resolve relative image paths (e.g., starting with /uploads/)
 * to the absolute URL pointing to our Cloud Run backend.
 * This ensures uploaded images display perfectly on custom domains like tazumartbd.com.
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('/uploads/')) {
    return getApiUrl(trimmed);
  }
  return trimmed;
}

