export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE}${path}`, { credentials: 'include', ...options });
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try { response = await apiFetch(path, options); }
  catch { throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté activo.'); }
  if ([502, 503, 504].includes(response.status)) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) {
    throw new Error(
      typeof data?.detail === 'string'
        ? data.detail
        : response.ok
          ? 'El servidor no pudo completar la solicitud.'
          : 'No se pudo conectar con el servidor. Verifica que el backend esté activo.'
    );
  }
  return data as T;
}
