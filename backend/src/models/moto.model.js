import { z } from 'zod';
import { text } from '../utils/text.js';
export const PISTERAS = ['Naked', 'Racing / Sport', 'Chopper / Custom', 'Chacarera', 'Motocross', 'Scooter'];
export const ELECTRICAS = ['Moto Eléctrica', 'Bicimoto Eléctrica', 'Carguero Eléctrico', 'Trimoto Eléctrica', 'Monopatín Eléctrico'];
export const fields = ['motor', 'transmision', 'tanque', 'frenos', 'enfriamiento', 'suspension', 'neumaticos', 'bateria', 'autonomia', 'velocidad_maxima', 'carga_maxima', 'dimensiones', 'potencia', 'torque'];
export const motoSchema = z.object({
  categoria: z.enum([...PISTERAS, ...ELECTRICAS]),
  marca: z.string().trim().min(1).max(60),
  modelo: z.string().trim().min(1).max(80),
  precio: z.number().finite().min(0),
  stock: z.number().int().min(0),
  destacado: z.boolean().default(false),
  colores: z.array(z.object({
    nombre: z.string().trim().min(1).max(40),
    img_moto: z.string().max(3_400_000).default('')
  })).max(12).refine(items => new Set(items.map(c => c.nombre.toLocaleLowerCase('es'))).size === items.length, 'No repitas un color').optional(),
  detalle: z.string().max(800).default(''),
  specs: z.record(z.string(), z.string().max(120)).default({}),
  fotos: z.array(z.string().max(3_400_000)).max(5).default([]),
  imagenes_conservar: z.array(z.string().max(1000)).max(10).default([]),
  principal: z.string().max(1000).nullable().optional(),
  fotos_nuevas: z.array(z.string().max(3_400_000)).max(10).default([])
});
export function motoValues(d, previous = {}) {
  const electrica = ELECTRICAS.includes(d.categoria);
  const m = {
    ...previous,
    marca: d.marca,
    modelo: d.modelo,
    categoria: d.categoria,
    tipo: electrica ? 'Eléctricas' : 'Pisteras',
    precio: d.precio,
    stock_total: d.stock,
    destacado: d.destacado,
    detalle: d.detalle
  };
  for (const f of fields) if (f in d.specs) m[f] = text(d.specs[f]) || 'Consultar';
  return m;
}
