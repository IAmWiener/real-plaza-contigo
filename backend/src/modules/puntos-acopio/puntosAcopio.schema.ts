/**
 * Esquemas de validación (zod) para puntos de acopio. El input corresponde a
 * `PuntoAcopioInput` del contrato (sin `id` ni `actualizadoEn`, que genera el
 * servidor).
 */
import { z } from 'zod';

const coordenadaSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const puntoAcopioInputSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  estado: z.enum(['operativo', 'capacidad_limitada', 'saturado', 'cerrado']),
  categoriaIds: z.array(z.string().min(1)).default([]),
  sedeId: z.string().min(1),
  aliadoIds: z.array(z.string().min(1)).default([]),
  eventoId: z.string().min(1).nullable(),
  direccion: z.string().min(1),
  distrito: z.string().min(1),
  coordenada: coordenadaSchema,
  horario: z.string().min(1),
  contactoNombre: z.string().min(1),
  contactoTelefono: z.string().min(1),
  capacidad: z.number().int().min(0),
  ocupacion: z.number().int().min(0),
  observaciones: z.string().default(''),
});

export type PuntoAcopioInputDTO = z.infer<typeof puntoAcopioInputSchema>;

/** Parámetros de la consulta geoespacial por cercanía (radio en metros). */
export const cercaQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radio: z.coerce.number().positive().max(100_000),
});

export type CercaQueryDTO = z.infer<typeof cercaQuerySchema>;
