/**
 * `ControlUbicacion`: control flotante sobre el mapa que centra la vista en la
 * ubicación actual del usuario.
 *
 * Debe renderizarse como hijo de un `MapContainer` de react-leaflet, ya que usa
 * `useMap()` para obtener la instancia del mapa y llamar a `setView`. El botón
 * se posiciona de forma absoluta sobre el mapa y cumple el área táctil mínima
 * de 44px.
 *
 * Responsabilidades:
 * - Al pulsarlo, solicita la ubicación mediante el hook `useGeolocalizacion`.
 * - Cuando llega una posición válida (estado `'ok'`), centra el mapa en ella
 *   con un zoom cercano (15) y, opcionalmente, pinta un marcador discreto en la
 *   posición del usuario mediante un `CircleMarker` (evita lidiar con iconos).
 * - Si la solicitud falla o se deniega, NO muestra ningún toast directamente:
 *   invoca el callback opcional `onError(mensaje)` para que el consumidor
 *   (p. ej. mostrando un toast "Ubicación no disponible") decida qué hacer. La
 *   vista actual del mapa se conserva en caso de error.
 */

import { useEffect, useRef } from 'react';
import { CircleMarker, useMap } from 'react-leaflet';
import { LocateFixed } from 'lucide-react';

import { useGeolocalizacion } from '@/hooks/useGeolocalizacion';
import { aTupla } from '@/utils/geo';

export interface ControlUbicacionProps {
  /**
   * Callback opcional invocado cuando la solicitud de ubicación falla o es
   * denegada. Recibe un mensaje legible para que el consumidor muestre un toast
   * (p. ej. "Ubicación no disponible"). Este componente NO muestra el toast.
   */
  onError?: (mensaje: string) => void;
  /** Clases adicionales opcionales para ajustar la posición del control. */
  className?: string;
  /**
   * "Señal" numérica opcional para disparar la solicitud de ubicación desde
   * fuera del mapa (p. ej. el botón de ubicación del `Header`). Cada vez que su
   * valor cambia (típicamente un contador que se incrementa), el control vuelve
   * a solicitar la ubicación, igual que si se pulsara su botón flotante. El
   * valor inicial no dispara ninguna solicitud. Añadido de forma
   * retrocompatible: omitirlo mantiene el comportamiento anterior.
   */
  disparo?: number;
}

/** Zoom aplicado al centrar el mapa en la ubicación del usuario (rango 14-16). */
const ZOOM_UBICACION = 15;

/**
 * Botón accesible que solicita la ubicación del usuario y centra el mapa en
 * ella cuando se obtiene una posición válida.
 */
export function ControlUbicacion({
  onError,
  className,
  disparo,
}: ControlUbicacionProps) {
  const map = useMap();
  const { solicitar, posicion, estado, error } = useGeolocalizacion();

  // Marca de agua para no reaccionar dos veces a la misma posición/estado. Se
  // guarda la referencia al último objeto `posicion` ya aplicado.
  const ultimaPosicionRef = useRef<typeof posicion>(null);
  // Guarda el último mensaje de error ya notificado para no repetir el callback.
  const ultimoErrorRef = useRef<string | null>(null);
  // Último valor de `disparo` observado, para solicitar solo cuando cambia (y
  // nunca en el primer render, donde se inicializa con el valor recibido).
  const ultimoDisparoRef = useRef<number | undefined>(disparo);

  // Cuando llega una posición válida, centra el mapa en ella.
  useEffect(() => {
    if (estado === 'ok' && posicion && posicion !== ultimaPosicionRef.current) {
      ultimaPosicionRef.current = posicion;
      map.setView(aTupla(posicion), ZOOM_UBICACION);
    }
  }, [estado, posicion, map]);

  // Cuando la solicitud falla, notifica al consumidor mediante `onError`.
  useEffect(() => {
    if (estado === 'error' && error && error !== ultimoErrorRef.current) {
      ultimoErrorRef.current = error;
      onError?.(error);
    }
    // Permite volver a notificar un error idéntico tras una solicitud exitosa.
    if (estado === 'ok') {
      ultimoErrorRef.current = null;
    }
  }, [estado, error, onError]);

  // Dispara la solicitud de ubicación cuando `disparo` cambia (señal externa,
  // p. ej. el botón del Header). No se dispara en el montaje inicial.
  useEffect(() => {
    if (disparo === undefined) return;
    if (disparo === ultimoDisparoRef.current) return;
    ultimoDisparoRef.current = disparo;
    solicitar();
  }, [disparo, solicitar]);

  const cargando = estado === 'cargando';

  const clases = [
    // Posición flotante sobre el mapa, debajo del control de volver a inicio.
    // `z-[1000]` para quedar por encima de las teselas y paneles de Leaflet.
    'absolute right-3 top-32 z-[500]',
    // Área táctil mínima de 44px y estilo de control del mapa.
    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center',
    'rounded-xl border border-surface-border bg-surface text-ink shadow-md',
    'transition-colors duration-150 hover:bg-surface-subtle',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-brand focus-visible:ring-offset-surface',
    'disabled:cursor-progress disabled:opacity-70',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <button
        type="button"
        className={clases}
        onClick={() => solicitar()}
        disabled={cargando}
        aria-label="Centrar el mapa en mi ubicación actual"
        aria-busy={cargando}
        title="Mi ubicación"
      >
        <LocateFixed
          className={`h-5 w-5 ${cargando ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Marcador discreto de la ubicación del usuario (sin iconos externos). */}
      {estado === 'ok' && posicion && (
        <CircleMarker
          center={aTupla(posicion)}
          radius={8}
          pathOptions={{
            color: '#1d4ed8',
            fillColor: '#3b82f6',
            fillOpacity: 0.9,
            weight: 2,
          }}
        />
      )}
    </>
  );
}
