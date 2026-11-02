/**
 * `MapaBase`: contenedor del mapa interactivo de Real Plaza Contigo.
 *
 * Renderiza un `MapContainer` de react-leaflet centrado en Lima Metropolitana
 * usando `CENTRO_LIMA` y `ZOOM_INICIAL` de `@/utils/geo`, con teselas de
 * OpenStreetMap (sin API key) y la atribución visible exigida por su licencia.
 *
 * Responsabilidades de esta tarea (8.1):
 * - Encuadre inicial (centro/zoom) y límites de zoom.
 * - Estados de carga y error de las teselas (overlay y banner accesibles, con
 *   texto además de color).
 * - Control flotante para volver a la vista inicial (`ControlVolverInicio`).
 * - Aceptar `children` para que marcadores, zonas y otros controles (tareas
 *   8.2/8.3/8.4) se rendericen dentro del `MapContainer`.
 *
 * El componente ocupa el 100% del alto/ancho de su contenedor; es el consumidor
 * quien debe darle tamaño (p. ej. un `div` con altura definida).
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { AlertTriangle, Loader2 } from 'lucide-react';
// El CSS de Leaflet es imprescindible para que el mapa y sus controles se
// rendericen correctamente. Vite resuelve esta importación en el bundle.
// (También se importará globalmente en `index.css` en la tarea 15.1.)
import 'leaflet/dist/leaflet.css';

import { CENTRO_LIMA, ZOOM_INICIAL } from '@/utils/geo';
import { ControlVolverInicio } from './ControlVolverInicio';

/**
 * Clave de los basemaps de CARTO (opcional), leída de las variables de entorno
 * de Vite. Si está presente, el mapa usa el estilo CARTO Positron; si no, cae
 * a OpenStreetMap estándar para no quedar con la marca de agua "API KEY
 * REQUIRED". La clave vive en `.env` (ignorado por git), no en el código.
 */
const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY ?? '';

/**
 * Proveedor de cartografía.
 *
 * - Con clave CARTO: estilo **Voyager** (`voyager`), claro y equilibrado, con
 *   toques de color suaves y tipografía elegante; combina bien con la marca sin
 *   competir con los marcadores. `{r}` añade el sufijo "@2x" en pantallas
 *   retina para teselas nítidas.
 * - Sin clave: OpenStreetMap estándar como respaldo (sin key).
 *
 * Nota: el endpoint raster de CARTO ya no usa subdominios `{s}`; se consulta
 * directamente `basemaps.cartocdn.com`.
 */
const URL_TESELAS = CARTO_API_KEY
  ? `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

/**
 * Atribución visible exigida por las licencias. Con CARTO se cita también a
 * CARTO (estilo de las teselas) además de OpenStreetMap (datos).
 */
const ATRIBUCION_OSM = CARTO_API_KEY
  ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export interface MapaBaseProps {
  /**
   * Contenido a renderizar dentro del `MapContainer` (marcadores, zonas,
   * controles adicionales). Estos elementos tienen acceso a la instancia del
   * mapa vía `useMap()`.
   */
  children?: ReactNode;
  /** Clases adicionales opcionales para el `MapContainer`. */
  className?: string;
}

/**
 * Mapa base con teselas OSM, estados de carga/error y control de inicio.
 */
export function MapaBase({ children, className }: MapaBaseProps) {
  // Banderas locales de estado de las teselas. `cargando` se activa mientras el
  // `TileLayer` descarga teselas; `error` se activa si alguna tesela falla.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={CENTRO_LIMA}
        zoom={ZOOM_INICIAL}
        minZoom={3}
        maxZoom={18}
        scrollWheelZoom
        // El mapa ocupa todo el alto/ancho del contenedor que lo envuelve.
        style={{ height: '100%', width: '100%' }}
        className={className}
        // Evita que Leaflet anuncie la atribución por defecto; la nuestra va en
        // el `TileLayer`.
        attributionControl
      >
        <TileLayer
          url={URL_TESELAS}
          attribution={ATRIBUCION_OSM}
          // CARTO sirve teselas retina (@2x) vía el placeholder {r}.
          detectRetina
          maxZoom={20}
          // Suscripción a los eventos de carga/error de las teselas. Actualizan
          // las banderas de estado locales de React.
          eventHandlers={{
            loading: () => {
              setCargando(true);
            },
            load: () => {
              setCargando(false);
            },
            tileerror: () => {
              // Conservamos el último estado renderizado del mapa y mostramos un
              // banner de error; no limpiamos las teselas ya cargadas.
              setError(true);
            },
          }}
        />

        {/* Control flotante para volver al encuadre inicial. */}
        <ControlVolverInicio />

        {/* Marcadores, zonas y controles aportados por el consumidor. */}
        {children}
      </MapContainer>

      {/* Overlay de CARGA: visible mientras se descargan teselas. */}
      {cargando && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute left-1/2 top-4 z-[500] -translate-x-1/2"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm text-ink shadow-md">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Cargando mapa…</span>
          </div>
        </div>
      )}

      {/* Banner de ERROR: visible si falla la carga de alguna tesela. */}
      {error && (
        <div
          role="alert"
          className="absolute inset-x-3 top-4 z-[500] mx-auto max-w-md"
        >
          <div className="flex items-start gap-2 rounded-xl border border-status-saturado bg-surface px-4 py-3 text-sm text-ink shadow-md">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-status-saturado"
              aria-hidden="true"
            />
            <span>
              No se pudieron cargar algunas teselas del mapa. Revisa tu conexión
              a internet; se mantiene la última vista disponible.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
