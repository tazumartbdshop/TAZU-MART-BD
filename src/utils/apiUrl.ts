/**
 * Utility to resolve the correct API URL depending on the running host environment.
 * Helps statically exported builds (e.g. on Hostinger shared hosting at tazumartbd.com)
 * securely communicate with the active Node.js backend container on Cloud Run.
 */
export function getApiUrl(path: string): string {
  const hostname = window.location.hostname;
  
  // If we are in the development container, preview environment, or local environment,
  // we use a relative path so it hits the co-located server.
  if (
    hostname.includes('run.app') || 
    hostname.includes('localhost') || 
    hostname.includes('127.0.0.1') ||
    hostname === ''
  ) {
    return path;
  }
  
  // Production Cloud Run active server domain.
  // This server maintains direct, secure connection with Hostinger MySQL backend.
  // Users can easily override this at build-time by setting VITE_API_BASE_URL in their .env
  const prodBackend = import.meta.env.VITE_API_BASE_URL || 'https://ais-dev-bprxi4s6ojh56gigyoabm3-918145641738.asia-southeast1.run.app';
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const finalUrl = `${prodBackend}${cleanPath}`;
  console.log(`[API URL Resolver] Resolving ${path} -> ${finalUrl}`);
  return finalUrl;
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

