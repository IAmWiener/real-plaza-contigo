/**
 * Hook de filtrado para el modo de puntos de riesgo.
 *
 * Configura el núcleo genérico `aplicarFiltros` con los campos propios del
 * riesgo y devuelve un `ResultadoFiltro<PuntoRiesgo>` memoizado. El mismo
 * resultado alimenta la lista, el contador y las zonas del mapa.
 *
 * Criterios con lógica AND entre sí:
 * - `texto`: búsqueda parcial (case/accent-insensitive) en descripción, tipo de
 *   incidente (su etiqueta legible y su valor crudo) y distrito.
 * - `tipo`: tipo de incidente exacto.
 * - `severidad`: nivel de severidad exacto.
 * - `estado`: estado del reporte exacto.
 */

import { useMemo } from 'react';

import type { PuntoRiesgo } from '@/types/domain';
import type { FiltrosRiesgo, ResultadoFiltro } from '@/types/ui';
import { aplicarFiltros, coincideTexto, igualA } from '@/hooks/aplicarFiltros';
import { etiquetaTipoIncidente } from '@/utils/format';

/**
 * Filtra una colección de puntos de riesgo según el estado de filtros. El
 * cálculo se memoiza sobre `(puntos, filtros)`.
 *
 * @param puntos Puntos de riesgo del modo activo.
 * @param filtros Estado de filtrado del panel de riesgo.
 * @returns `{ items, total }` con los puntos que satisfacen todos los criterios.
 */
export function useFiltrosRiesgo(
  puntos: PuntoRiesgo[],
  filtros: FiltrosRiesgo,
): ResultadoFiltro<PuntoRiesgo> {
  return useMemo(() => {
    const coincide = coincideTexto(filtros.texto);

    return aplicarFiltros<PuntoRiesgo>(puntos, [
      // Búsqueda de texto sobre descripción, tipo (etiqueta + valor) y distrito.
      (punto) =>
        coincide([
          punto.descripcion,
          etiquetaTipoIncidente[punto.tipo],
          punto.tipo,
          punto.distrito,
        ]),
      // Tipo de incidente exacto.
      (punto) => igualA(punto.tipo, filtros.tipo),
      // Nivel de severidad exacto.
      (punto) => igualA(punto.severidad, filtros.severidad),
      // Estado del reporte exacto.
      (punto) => igualA(punto.estado, filtros.estado),
    ]);
  }, [puntos, filtros]);
}
