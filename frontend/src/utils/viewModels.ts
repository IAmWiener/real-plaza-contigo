/**
 * Derivación de view-models del dominio para la capa de presentación.
 *
 * Centraliza la resolución de relaciones por ID (sede, aliados, categorías,
 * evento y recursos) de un `PuntoAcopio` hacia el view-model enriquecido
 * `PuntoAcopioVista`, manteniendo coherentes las relaciones por ID del backend
 * y evitando llamadas dispersas desde los componentes.
 *
 * Las funciones de este módulo son puras: no mutan sus argumentos ni duplican
 * las entidades base; solo referencian las instancias ya existentes en los
 * datos del dominio.
 */

import type {
  Categoria,
  Empresa,
  Evento,
  PuntoAcopio,
  Recurso,
} from '@/types/domain';
import type { PuntoAcopioVista } from '@/types/ui';
import { nivelOcupacion } from '@/utils/format';

/** Colecciones base necesarias para resolver las relaciones de un punto. */
export interface DatosRelaciones {
  empresas: Empresa[];
  categorias: Categoria[];
  eventos: Evento[];
  recursos: Recurso[];
}

/**
 * Deriva el view-model `PuntoAcopioVista` de un `PuntoAcopio` resolviendo sus
 * relaciones por ID:
 *
 * - `sede`: empresa cuyo `id === punto.sedeId`, o `null` si no existe.
 * - `aliados`: empresas cuyos `id` están en `punto.aliadoIds` (sin duplicar).
 * - `categorias`: categorías cuyos `id` están en `punto.categoriaIds`.
 * - `evento`: evento cuyo `id === punto.eventoId`, o `null` si no aplica/no existe.
 * - `recursos`: recursos cuyo `puntoAcopioId === punto.id`.
 *
 * El nivel de ocupación (`ocupacionPct`) se calcula con
 * `nivelOcupacion(capacidad, ocupacion)` y queda acotado a `[0, 100]`.
 *
 * Es una función pura: devuelve `sede`/`evento` en `null` cuando el ID no se
 * encuentra y arrays vacíos cuando no hay coincidencias, referenciando las
 * entidades base sin clonarlas.
 *
 * @param punto Punto de acopio a enriquecer.
 * @param datos Colecciones base del dominio para resolver las relaciones.
 * @returns El view-model enriquecido para presentación.
 */
export function derivarPuntoAcopioVista(
  punto: PuntoAcopio,
  datos: DatosRelaciones,
): PuntoAcopioVista {
  const { empresas, categorias, eventos, recursos } = datos;

  const sede = empresas.find((e) => e.id === punto.sedeId) ?? null;

  const aliadoIds = new Set(punto.aliadoIds);
  const aliados = empresas.filter((e) => aliadoIds.has(e.id));

  const categoriaIds = new Set(punto.categoriaIds);
  const categoriasResueltas = categorias.filter((c) => categoriaIds.has(c.id));

  const evento =
    punto.eventoId === null
      ? null
      : eventos.find((ev) => ev.id === punto.eventoId) ?? null;

  const recursosDelPunto = recursos.filter(
    (r) => r.puntoAcopioId === punto.id,
  );

  return {
    ...punto,
    sede,
    aliados,
    categorias: categoriasResueltas,
    evento,
    recursos: recursosDelPunto,
    ocupacionPct: nivelOcupacion(punto.capacidad, punto.ocupacion),
  };
}
