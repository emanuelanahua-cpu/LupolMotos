import { z } from 'zod';

const slideSchema = z.object({
  id: z.string().min(1).max(80),
  modelo: z.string().trim().min(1).max(90),
  cilindrada: z.string().trim().min(1).max(30),
  texto: z.string().trim().max(240).default(''),
  imagen: z.string().min(1).max(3_400_000),
  activo: z.boolean().default(true)
});

export const carruselSchema = z.object({
  slides: z.array(slideSchema).max(8).refine(
    slides => new Set(slides.map(slide => slide.id)).size === slides.length,
    'Hay diapositivas repetidas'
  )
});
