import { getCustomerToken, clearCustomerToken } from './customerAuth';

export async function customerFetch(apiUrl, path, options = {}) {
  const token = getCustomerToken();

  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 || res.status === 403) {
    clearCustomerToken();
    throw new Error('UNAUTHORIZED');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data;
}
