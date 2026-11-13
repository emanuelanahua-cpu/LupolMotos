import { z } from 'zod';

export const accesorioSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  descripcion: z.string().max(500).default(''),
  colores: z.array(z.object({
    nombre: z.string().trim().min(1).max(40),
    img_accesorio: z.string().max(3_400_000).default('')
  })).min(1, 'Agrega al menos un color con su foto').max(12).refine(
    items => new Set(items.map(c => c.nombre.toLocaleLowerCase('es'))).size === items.length,
    'No repitas un color'
  )
});
