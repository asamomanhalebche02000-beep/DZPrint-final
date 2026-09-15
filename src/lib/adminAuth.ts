import { supabase } from './supabase';

/**
 * Retrieves the current Supabase access token directly from the authenticated session.
 * Never generates or returns mock or fake tokens.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Dedicated fetch helper for admin & authenticated API routes.
 * Obtains the current Supabase access token from the authenticated session
 * and securely attaches Bearer authorization. Never uses fake tokens.
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = await getAuthToken();
  const options = init || {};
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(input, {
    ...options,
    headers,
  });
}
