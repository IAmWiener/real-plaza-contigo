/**
 * Hook `useGeolocalizacion`: envuelve la API `navigator.geolocation` del
 * navegador y expone la posición actual o un error de forma segura, sin lanzar
 * excepciones.
 *
 * El hook NO centra ni manipula el mapa; se limita a resolver la ubicación. El
 * control del mapa (p. ej. `ControlUbicacion`) consume este hook y decide qué
 * hacer con la posición obtenida.
 */

import { useCallback, useRef, useState } from 'react';

import type { Coordenada } from '@/types/domain';

/** Estado del ciclo de vida de la solicitud de geolocalización. */
export type EstadoGeolocalizacion = 'inactivo' | 'cargando' | 'ok' | 'error';

/** Valor devuelto por `useGeolocalizacion`. */
export interface UsoGeolocalizacion {
  /** Dispara la solicitud de la ubicación actual al navegador. */
  solicitar: () => void;
  /** Última posición obtenida, o `null` si aún no hay una válida. */
  posicion: Coordenada | null;
  /** Estado actual de la solicitud. */
  estado: EstadoGeolocalizacion;
  /** Mensaje de error legible, o `null` si no hay error. */
  error: string | null;
}

/** Tiempo máximo de espera para obtener la ubicación (milisegundos). */
const TIMEOUT_MS = 10000;

/**
 * Traduce un `GeolocationPositionError` a un mensaje legible en español.
 */
function mensajeDeError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Permiso de ubicación denegado.';
    case error.POSITION_UNAVAILABLE:
      return 'Ubicación no disponible.';
    case error.TIMEOUT:
      return 'Se agotó el tiempo para obtener la ubicación.';
    default:
      return 'No se pudo obtener la ubicación.';
  }
}

/**
 * Hook que resuelve la ubicación del usuario mediante `navigator.geolocation`.
 *
 * - `solicitar()` invoca `getCurrentPosition` con un timeout de ~10s.
 * - Al éxito, guarda la posición `{ lat, lng }` y pasa a estado `'ok'`.
 * - Si se deniega el permiso, falla o se agota el tiempo, pasa a `'error'` con
 *   un mensaje descriptivo (nunca lanza una excepción).
 * - Si `navigator.geolocation` no existe, queda en estado `'error'`.
 */
export function useGeolocalizacion(): UsoGeolocalizacion {
  const [posicion, setPosicion] = useState<Coordenada | null>(null);
  const [estado, setEstado] = useState<EstadoGeolocalizacion>('inactivo');
  const [error, setError] = useState<string | null>(null);

  /** Evita solicitudes duplicadas mientras una está en curso. */
  const enCursoRef = useRef(false);

  const solicitar = useCallback(() => {
    if (enCursoRef.current) return;

    const soportado =
      typeof navigator !== 'undefined' &&
      typeof navigator.geolocation !== 'undefined' &&
      navigator.geolocation != null;

    if (!soportado) {
      setEstado('error');
      setError('La geolocalización no está disponible en este dispositivo.');
      return;
    }

    enCursoRef.current = true;
    setEstado('cargando');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        enCursoRef.current = false;
        setPosicion({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError(null);
        setEstado('ok');
      },
      (err) => {
        enCursoRef.current = false;
        setEstado('error');
        setError(mensajeDeError(err));
      },
      { timeout: TIMEOUT_MS, enableHighAccuracy: false, maximumAge: 0 },
    );
  }, []);

  return { solicitar, posicion, estado, error };
}
