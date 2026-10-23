import { z } from 'zod';
export const loginSchema = z.object({
  usuario: z.string().trim().regex(/^[\p{L}\p{N}_.-]{3,40}$/u),
  clave: z.string().min(8).max(256)
});
export const roles = ['superadmin', 'admin', 'empleado'];
