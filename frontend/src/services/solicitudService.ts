import { request } from './api';
import type { Cotizacion, Reserva, Contacto, RespuestaSolicitud } from '../types';

async function guardarSolicitud(ruta: string, datos: unknown): Promise<RespuestaSolicitud> {
  const result = await request<RespuestaSolicitud>(`/api/${ruta}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos),
  });
  if (!result.exito) throw new Error('No se pudo guardar tu solicitud. Inténtalo de nuevo.');
  return result;
}
export const enviarCotizacion = (datos: Cotizacion) => guardarSolicitud('cotizaciones', datos);
export const enviarReserva = (datos: Reserva) => guardarSolicitud('reservas', datos);
export const enviarMensajeContacto = (datos: Contacto) => guardarSolicitud('contacto', datos);
