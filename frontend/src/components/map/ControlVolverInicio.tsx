/**
 * `ControlVolverInicio`: control flotante sobre el mapa que restablece la vista
 * inicial (Lima Metropolitana) al pulsarlo.
 *
 * Debe renderizarse como hijo de un `MapContainer` de react-leaflet, ya que usa
 * `useMap()` para obtener la instancia del mapa y llamar a `setView`. El botón
 * se posiciona de forma absoluta sobre el mapa (esquina superior derecha, por
 * debajo de los controles de zoom) y cumple el área táctil mínima de 44px.
 */

import { useMap } from 'react-leaflet';
import { Home } from 'lucide-react';
import { CENTRO_LIMA, ZOOM_INICIAL } from '@/utils/geo';

export interface ControlVolverInicioProps {
  /** Clases adicionales opcionales para ajustar la posición del control. */
  className?: string;
}

/**
 * Botón accesible que devuelve el mapa a su encuadre inicial
 * (`CENTRO_LIMA` / `ZOOM_INICIAL`).
 */
export function ControlVolverInicio({ className }: ControlVolverInicioProps) {
  const map = useMap();

  const volverAInicio = () => {
    map.setView(CENTRO_LIMA, ZOOM_INICIAL);
  };

  const clases = [
    // Posición flotante sobre el mapa. `z-[1000]` para quedar por encima de las
    // teselas y por encima de los paneles de Leaflet.
    'absolute right-3 top-20 z-[500]',
    // Área táctil mínima de 44px y estilo de control del mapa.
    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center',
    'rounded-xl border border-surface-border bg-surface text-ink shadow-md',
    'transition-colors duration-150 hover:bg-surface-subtle',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-brand focus-visible:ring-offset-surface',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={clases}
      onClick={volverAInicio}
      aria-label="Volver a la vista inicial del mapa (Lima Metropolitana)"
      title="Volver a la vista inicial"
    >
      <Home className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
