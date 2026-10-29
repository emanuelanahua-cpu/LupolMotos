import { z } from 'zod';
export const customer = {
  nombre_cliente: z.string().trim().min(1).max(150),
  telefono_cliente: z.string().trim().min(6).max(30)
};
export const quoteSchema = z.object({
  ...customer,
  telefono_cliente: z.string().trim().regex(/^[0-9]{9}$/, 'El celular debe tener exactamente 9 dígitos'),
  id_moto: z.number().int().positive(),
  modelo_moto: z.string().min(1).max(150),
  modalidad: z.enum(['CONTADO', 'CREDITO']),
  color_seleccionado: z.string().max(100).nullable().optional(),
  precio_moto: z.number().finite().min(0),
  cuota_inicial: z.number().finite().min(0).default(0),
  numero_cuotas: z.number().int().min(0).max(120).default(12),
  cuota_mensual_estimada: z.number().finite().min(0).default(0),
  dni_cliente: z.string().regex(/^(?:[0-9]{8})?$/, 'El DNI debe tener 8 dígitos').nullable().optional(),
  email_cliente: z.union([
    z.literal(''),
    z.email().refine(
      (correo) => /@(gmail|hotmail|outlook)[.]com$/i.test(correo),
      { message: 'Usa un correo de Gmail, Hotmail u Outlook' }
    )
  ]).nullable().optional(),
  ciudad: z.string().max(150).optional(),
  comentarios: z.string().max(2000).nullable().optional()
});
export const reserveSchema = z.object({
  ...customer,
  id_moto: z.number().int().positive(),
  modelo_moto: z.string().min(1).max(150),
  color_seleccionado: z.string().max(100).nullable().optional(),
  monto_separacion: z.number().finite().min(0).default(200),
  dni_cliente: z.string().min(1).max(30),
  direccion_entrega: z.string().max(300).default('Tacna'),
  metodo_pago: z.string().max(100).optional()
});
export const contactSchema = z.object({
  nombre: z.string().trim().min(5).max(100).regex(/^\p{L}+(?:(?:-|')\p{L}+)*(?: +\p{L}+(?:(?:-|')\p{L}+)*)+$/u, 'Escribe un nombre y un apellido usando letras'),
  telefono: z.string().trim().regex(/^[0-9]{9}$/, 'El celular debe tener exactamente 9 dígitos'),
  email: z.string().max(254).nullable().optional(),
  asunto: z.string().min(1).max(200),
  mensaje: z.string().trim().min(10).max(1000)
});
