import { z } from 'zod';

const slideSchema = z.object({
  id: z.string().min(1).max(80),
  imagen: z.string().min(1).max(3_400_000),
  moto_id: z.number().int().positive().nullable().default(null),
  activo: z.boolean().default(true)
});

export const carruselSchema = z.object({
  slides: z.array(slideSchema).max(8).refine(
    slides => new Set(slides.map(slide => slide.id)).size === slides.length,
    'Hay diapositivas repetidas'
  )
});
