/**
 * Componentes del mapa para el flujo de reporte de zonas de riesgo.
 *
 * Ambos componentes DEBEN renderizarse como hijos de un `MapContainer` de
 * react-leaflet (p. ej. dentro de `MapaBase`), ya que dependen del contexto del
 * mapa (`Circle`, `useMapEvents`).
 *
 * - `PreviewRadio`: dibuja un `Circle` de vista previa en la coordenada elegida
 *   con el radio actual (en metros), con un estilo distinto al de las zonas de
 *   riesgo ya reportadas (línea discontinua y color de marca) para comunicar que
 *   es una previsualización en curso, no un reporte confirmado.
 * - `CapturadorUbicacion`: captura el clic del usuario sobre el mapa para elegir
 *   la ubicación central de la zona. Solo escucha cuando el flujo está activo.
 *
 * Importante: los reportes de riesgo son ficticios y de demostración; no
 * representan emergencias reales.
 */

import { Circle, useMapEvents } from 'react-leaflet';

import type { Coordenada } from '@/types/domain';

/** Color de marca de Real Plaza usado para la vista previa del radio. */
const COLOR_PREVIEW = '#6D2A8C'; // brand.DEFAULT

export interface PreviewRadioProps {
  /** Centro elegido en el mapa, o `null` si aún no se ha ubicado la zona. */
  coordenada: Coordenada | null;
  /** Radio del área perimetral de vista previa, en metros. */
  radioMetros: number;
}

/**
 * Dibuja el `Circle` de vista previa del área perimetral en construcción.
 *
 * No renderiza nada mientras no exista una coordenada central (el usuario aún
 * no ha tocado el mapa). El estilo discontinuo con color de marca lo diferencia
 * de las zonas de riesgo ya confirmadas que pinta `ZonasRiesgo`.
 */
export function PreviewRadio({ coordenada, radioMetros }: PreviewRadioProps) {
  if (!coordenada) return null;

  return (
    <Circle
      center={[coordenada.lat, coordenada.lng]}
      radius={radioMetros}
      pathOptions={{
        color: COLOR_PREVIEW,
        weight: 2,
        opacity: 1,
        // Línea discontinua: señala que es una previsualización, no un reporte.
        dashArray: '8 6',
        fillColor: COLOR_PREVIEW,
        fillOpacity: 0.12,
      }}
      // La vista previa no debe interceptar clics: así el usuario puede seguir
      // tocando el mapa para reubicar el centro mientras ajusta el radio.
      interactive={false}
    />
  );
}

export interface CapturadorUbicacionProps {
  /**
   * Si `true`, el componente escucha los clics del mapa para elegir la
   * ubicación. Cuando es `false`, no reacciona a los clics (permite que el flujo
   * quede inactivo sin desmontar el componente).
   */
  activo: boolean;
  /** Callback invocado con la coordenada del punto donde el usuario hizo clic. */
  onElegir: (coordenada: Coordenada) => void;
}

/**
 * Captura el clic del usuario sobre el mapa para elegir la ubicación central de
 * la zona de riesgo. Usa `useMapEvents` de react-leaflet; solo propaga el clic
 * cuando `activo` es `true`.
 *
 * No renderiza ningún elemento visible: su única función es registrar el
 * manejador de eventos del mapa.
 */
export function CapturadorUbicacion({
  activo,
  onElegir,
}: CapturadorUbicacionProps) {
  useMapEvents({
    click: (e) => {
      if (!activo) return;
      onElegir({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}
