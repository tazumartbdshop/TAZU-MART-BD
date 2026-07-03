import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price to BDT
export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(price);
}

export async function safeFetchJSON<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      if (contentType?.includes("application/json")) {
        const errJson = await response.json();
        errMsg = errJson.message || errJson.error || errMsg;
      } else {
        const text = await response.text();
        errMsg = text.slice(0, 200) || errMsg;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }

  if (!contentType?.includes("application/json")) {
    throw new Error("Server returned HTML instead of JSON. Check backend endpoints.");
  }

  return response.json() as Promise<T>;
}

