import { request } from './api';
import type { Usuario, SolicitudRecibida } from '../types';

export function api<T = unknown>(metodo: string, url: string, cuerpo?: unknown): Promise<T> {
  return request<T>(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
}
export const obtenerSesion = () => api<Usuario>('GET', '/api/admin/yo');
export const obtenerSolicitudes = () => api<SolicitudRecibida[]>('GET', '/api/admin/solicitudes');
