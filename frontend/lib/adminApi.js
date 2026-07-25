import { getAdminToken, clearAdminToken } from './adminAuth';

// Отдельно от adminFetch: нельзя ставить Content-Type: application/json на
// multipart-запрос — браузер сам выставит правильный boundary для FormData.
export async function adminUpload(apiUrl, path, file) {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (res.status === 401) {
    clearAdminToken();
    throw new Error('UNAUTHORIZED');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Upload failed: ${res.status}`);
  }
  return data;
}

export async function adminFetch(apiUrl, path, options = {}) {
  const token = getAdminToken();

  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearAdminToken();
    throw new Error('UNAUTHORIZED');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data;
}
