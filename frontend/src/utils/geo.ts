/**
 * Utilidades geográficas puras para Real Plaza Contigo.
 *
 * Este módulo NO depende de Leaflet: trabaja con estructuras planas (tuplas y
 * objetos `Coordenada`) para que sea fácilmente testeable y reutilizable. La
 * capa del mapa es responsable de convertir estas estructuras a tipos de
 * Leaflet (p. ej. `LatLngBounds`) cuando lo necesite.
 */

import type { Coordenada } from '@/types/domain';

/**
 * Centro inicial del mapa: Lima Metropolitana, Perú. Tupla `[lat, lng]`
 * compatible con el `center` de Leaflet.
 */
export const CENTRO_LIMA: [number, number] = [-12.0464, -77.0428];

/** Zoom inicial del mapa al abrir la aplicación. */
export const ZOOM_INICIAL = 11;

/**
 * Límites geográficos tipo `LatLngBounds` expresados como estructura plana:
 * `[[sur, oeste], [norte, este]]`. Las esquinas son suroeste y noreste.
 */
export type Limites = [[number, number], [number, number]];

/**
 * Indica si existe al menos una coordenada en el conjunto. Útil para decidir si
 * tiene sentido ajustar el encuadre (`fitBounds`) o conservar la vista actual.
 */
export function hayCoordenadas(coordenadas: Coordenada[]): boolean {
  return coordenadas.length > 0;
}

/**
 * Calcula los límites (bounding box) que contienen todas las coordenadas dadas,
 * en el formato `[[sur, oeste], [norte, este]]` apto para `fitBounds`.
 *
 * Devuelve `null` cuando el conjunto está vacío, de modo que quien llame pueda
 * conservar la vista actual del mapa en lugar de forzar un encuadre inválido.
 *
 * @param coordenadas Conjunto de coordenadas a encuadrar.
 * @returns Los límites, o `null` si no hay coordenadas.
 */
export function calcularLimites(coordenadas: Coordenada[]): Limites | null {
  if (!hayCoordenadas(coordenadas)) return null;

  let sur = coordenadas[0].lat;
  let norte = coordenadas[0].lat;
  let oeste = coordenadas[0].lng;
  let este = coordenadas[0].lng;

  for (const { lat, lng } of coordenadas) {
    if (lat < sur) sur = lat;
    if (lat > norte) norte = lat;
    if (lng < oeste) oeste = lng;
    if (lng > este) este = lng;
  }

  return [
    [sur, oeste],
    [norte, este],
  ];
}

/**
 * Convierte una `Coordenada` a la tupla `[lat, lng]` que usan las primitivas de
 * Leaflet (`center`, `position`, etc.).
 */
export function aTupla({ lat, lng }: Coordenada): [number, number] {
  return [lat, lng];
}
