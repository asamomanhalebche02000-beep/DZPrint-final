let currentAdminToken: string | null = null;

export function setAdminToken(token: string | null) {
  currentAdminToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('dzprint_admin_token', token);
    } else {
      sessionStorage.removeItem('dzprint_admin_token');
    }
  }
}

export function getAdminToken(): string | null {
  if (currentAdminToken) return currentAdminToken;
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('dzprint_admin_token');
    if (stored) {
      currentAdminToken = stored;
      return stored;
    }
  }
  return null;
}

export function getAdminHeaders(customHeaders: HeadersInit = {}): HeadersInit {
  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return {
    ...headers,
    ...customHeaders,
  };
}

/**
 * Dedicated fetch helper for admin API routes that safely attaches Bearer authorization
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAdminToken();
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
