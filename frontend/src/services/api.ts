export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE}${path}`, { credentials: 'include', ...options });
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try { response = await apiFetch(path, options); }
  catch { throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.'); }
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) {
    throw new Error(typeof data?.detail === 'string' ? data.detail : 'El servidor no pudo completar la solicitud.');
  }
  return data as T;
}
