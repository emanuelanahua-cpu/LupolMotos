import { z } from "zod";
const telefono = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s()+-]/g, ""))
  .pipe(z.string().regex(/^\d{7,15}$/));
export const clienteSchema = z.object({
  nombre: z.string().trim().min(3).max(120),
  telefono,
  email: z.union([z.literal(""), z.email().max(180)]).default(""),
  direccion: z.string().trim().max(400).default(""),
});
export const pedidoSchema = z
  .object({
    clave: z.uuid(),
    cliente: clienteSchema,
    items: z
      .array(
        z.object({
          moto_id: z.number().int().positive(),
          cantidad: z.number().int().min(1).max(20),
        }),
      )
      .min(1)
      .max(30),
    total_centimos: z.number().int().positive().max(100_000_000_000),
    notas: z.string().trim().max(800).default(""),
  })
  .refine(
    (d) => new Set(d.items.map((i) => i.moto_id)).size === d.items.length,
    "No repitas productos",
  );
export const estadoSchema = z
  .object({
    estado: z.enum(["confirmado", "pagado", "cancelado"]),
    metodo: z
      .enum(["efectivo", "transferencia", "yape", "plin", "tarjeta_presencial"])
      .optional(),
    referencia: z.string().trim().max(120).default(""),
  })
  .refine(
    (d) => d.estado !== "pagado" || !!d.metodo,
    "Indica el método de pago",
  );
export const ajusteSchema = z.object({
  cantidad: z
    .number()
    .int()
    .min(-100000)
    .max(100000)
    .refine((n) => n !== 0),
  motivo: z.string().trim().min(3).max(300),
});
