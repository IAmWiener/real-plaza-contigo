/**
 * `AjusteEncuadre`: componente sin interfaz visible que ajusta el encuadre del
 * mapa (`fitBounds`) al conjunto de coordenadas que recibe.
 *
 * Debe renderizarse como hijo de un `MapContainer` de react-leaflet, ya que usa
 * `useMap()` para obtener la instancia del mapa. Cada vez que cambia el conjunto
 * de coordenadas (p. ej. al filtrar o cambiar de modo), recalcula los límites
 * con `calcularLimites` y encuadra el mapa para que se vean todos los puntos.
 *
 * Reglas:
 * - Si `calcularLimites` devuelve `null` (conjunto vacío), NO hace nada y
 *   conserva la vista válida actual del mapa.
 * - Usa un `padding` razonable y un `maxZoom` para evitar un acercamiento
 *   excesivo cuando solo hay un punto (las esquinas del bounding box coinciden).
 */

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

import type { Coordenada } from '@/types/domain';
import { calcularLimites } from '@/utils/geo';

export interface AjusteEncuadreProps {
  /** Conjunto de coordenadas a encuadrar en el mapa. */
  coordenadas: Coordenada[];
}

/** Opciones de encuadre: margen y zoom máximo para un solo punto. */
const OPCIONES_ENCUADRE = { padding: [40, 40] as [number, number], maxZoom: 16 };

/**
 * Serializa el conjunto de coordenadas a una clave estable, de modo que el
 * `useEffect` solo reaccione cuando cambia el contenido (no la identidad del
 * arreglo recibido en cada render).
 */
function claveCoordenadas(coordenadas: Coordenada[]): string {
  return coordenadas.map(({ lat, lng }) => `${lat},${lng}`).join('|');
}

/**
 * Componente sin UI que ejecuta `map.fitBounds` sobre los límites del conjunto
 * de coordenadas cada vez que este cambia. Conserva la vista actual si el
 * conjunto está vacío.
 */
export function AjusteEncuadre({ coordenadas }: AjusteEncuadreProps) {
  const map = useMap();
  const clave = claveCoordenadas(coordenadas);

  useEffect(() => {
    const limites = calcularLimites(coordenadas);
    // Conjunto vacío: no tocar la vista actual del mapa.
    if (!limites) return;

    map.fitBounds(limites, OPCIONES_ENCUADRE);
    // `clave` es la dependencia real (contenido serializado); `coordenadas` se
    // deriva de ella en el mismo render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, map]);

  return null;
}
