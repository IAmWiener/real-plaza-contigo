/**
 * Hook de filtrado para el modo de centros de acopio.
 *
 * Configura el núcleo genérico `aplicarFiltros` con los campos propios del
 * acopio y devuelve un `ResultadoFiltro<PuntoAcopioVista>` memoizado. El mismo
 * resultado alimenta la lista, el contador y los marcadores del mapa.
 *
 * Criterios con lógica AND entre sí:
 * - `texto`: búsqueda parcial (case/accent-insensitive) en nombre, sede,
 *   aliados, dirección y distrito.
 * - `categoriaId`: el punto debe atender esa categoría (OR interno entre las
 *   categorías del punto).
 * - `estado`: estado operativo exacto.
 * - `eventoId`: evento asociado exacto.
 * - `distrito`: distrito exacto.
 */

import { useMemo } from 'react';

import type { PuntoAcopioVista, FiltrosAcopio, ResultadoFiltro } from '@/types/ui';
import { aplicarFiltros, coincideTexto, igualA } from '@/hooks/aplicarFiltros';

/**
 * Filtra una colección de puntos de acopio (view-models) según el estado de
 * filtros. El cálculo se memoiza sobre `(puntos, filtros)`.
 *
 * @param puntos Puntos de acopio enriquecidos del modo activo.
 * @param filtros Estado de filtrado del panel de acopio.
 * @returns `{ items, total }` con los puntos que satisfacen todos los criterios.
 */
export function useFiltrosAcopio(
  puntos: PuntoAcopioVista[],
  filtros: FiltrosAcopio,
): ResultadoFiltro<PuntoAcopioVista> {
  return useMemo(() => {
    const coincide = coincideTexto(filtros.texto);

    return aplicarFiltros<PuntoAcopioVista>(puntos, [
      // Búsqueda de texto sobre nombre, sede, aliados, dirección y distrito.
      (punto) =>
        coincide([
          punto.nombre,
          punto.sede?.nombre ?? '',
          ...punto.aliados.map((aliado) => aliado.nombre),
          punto.direccion,
          punto.distrito,
        ]),
      // Categoría: true si el punto atiende la categoría filtrada (OR interno).
      (punto) =>
        filtros.categoriaId === null
          ? true
          : punto.categoriaIds.includes(filtros.categoriaId) ||
            punto.categorias.some((categoria) => categoria.id === filtros.categoriaId),
      // Estado operativo exacto.
      (punto) => igualA(punto.estado, filtros.estado),
      // Evento asociado exacto.
      (punto) => igualA(punto.eventoId, filtros.eventoId),
      // Distrito exacto.
      (punto) => igualA(punto.distrito, filtros.distrito),
    ]);
  }, [puntos, filtros]);
}
