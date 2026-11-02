/**
 * Esquemas de validación (zod) para reportes de riesgo.
 * - `puntoRiesgoInputSchema`: crear (sin `id`, `reportadoEn` ni `estado`).
 * - `puntoRiesgoPatchSchema`: edición parcial (incluye `estado`).
 */
import { z } from 'zod';

const coordenadaSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const tipoIncidente = z.enum([
  'inundacion',
  'derrumbe',
  'incendio',
  'sismo',
  'via_bloqueada',
  'otro',
]);

const severidad = z.enum(['bajo', 'medio', 'alto', 'critico']);
const estadoReporte = z.enum(['activo', 'en_verificacion', 'resuelto']);

export const puntoRiesgoInputSchema = z.object({
  tipo: tipoIncidente,
  severidad,
  descripcion: z.string().min(1),
  coordenada: coordenadaSchema,
  radioMetros: z.number().int().positive().max(100_000),
  distrito: z.string().min(1),
});

export type PuntoRiesgoInputDTO = z.infer<typeof puntoRiesgoInputSchema>;

export const puntoRiesgoPatchSchema = z
  .object({
    tipo: tipoIncidente.optional(),
    severidad: severidad.optional(),
    descripcion: z.string().min(1).optional(),
    coordenada: coordenadaSchema.optional(),
    radioMetros: z.number().int().positive().max(100_000).optional(),
    distrito: z.string().min(1).optional(),
    estado: estadoReporte.optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: 'Debe enviar al menos un campo para editar.',
  });

export type PuntoRiesgoPatchDTO = z.infer<typeof puntoRiesgoPatchSchema>;
