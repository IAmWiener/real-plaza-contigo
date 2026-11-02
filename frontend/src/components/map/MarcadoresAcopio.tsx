/**
 * `MarcadoresAcopio`: capa de marcadores de centros de acopio sobre el mapa.
 *
 * Se renderiza como hijo de un `MapContainer` de react-leaflet (dentro de
 * `MapaBase`). Por cada `PuntoAcopioVista` dibuja un `Marker` con un `divIcon`
 * de Leaflet cuyo HTML combina:
 *
 * 1. El icono/glifo de la categoría principal del punto (carácter legible, no
 *    un componente de lucide-react, porque el `divIcon` es HTML en texto plano).
 * 2. Una FORMA/decoración distinta según el `EstadoOperativo`, de modo que la
 *    información NO dependa únicamente del color (requisito de accesibilidad):
 *      - operativo          → anillo sólido (verde)
 *      - capacidad_limitada → anillo punteado (ámbar)
 *      - saturado           → disco relleno (rojo)
 *      - cerrado            → atenuado/gris con aspa diagonal
 *
 * Los marcadores se agrupan con `react-leaflet-cluster` (clustering automático
 * según el zoom). Cada `Marker` incluye un `Popup` con datos resumidos (nombre,
 * estado con etiqueta textual y distrito). Al hacer clic se invoca
 * `onSeleccionar(punto.id)`. El punto seleccionado (`punto.id === seleccionId`)
 * recibe un realce visual adicional (escala y anillo reforzado).
 *
 * IMPORTANTE: todos los datos mostrados son ficticios y de demostración.
 *
 * Requisitos: 3.1, 3.3, 3.4, 3.5, 3.6.
 */

import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';

import type { EstadoOperativo } from '@/types/domain';
import type { PuntoAcopioVista } from '@/types/ui';
import { etiquetaEstadoOperativo } from '@/utils/format';
import { aTupla } from '@/utils/geo';

export interface MarcadoresAcopioProps {
  /** Puntos de acopio (ya filtrados) a representar en el mapa. */
  puntos: PuntoAcopioVista[];
  /** Id del punto actualmente seleccionado, o `null` si no hay selección. */
  seleccionId: string | null;
  /** Callback invocado al hacer clic sobre un marcador. */
  onSeleccionar: (id: string) => void;
}

/**
 * Color de estado (tokens de marca, equivalentes a `theme.colors.status` de
 * Tailwind). Se usan como valores hex porque el HTML del `divIcon` lo inyecta
 * Leaflet fuera del árbol de React y las clases de Tailwind no se aplicarían.
 */
const COLOR_ESTADO: Record<EstadoOperativo, string> = {
  operativo: '#16A34A',
  capacidad_limitada: '#D97706',
  saturado: '#DC2626',
  cerrado: '#64748B',
};

/**
 * Glifo representativo para cada categoría principal, indexado por el nombre de
 * icono de lucide (`Categoria.icono`). Se usa un carácter/emoji legible porque
 * el `divIcon` es HTML en texto plano y no puede renderizar componentes React.
 */
const GLIFO_CATEGORIA: Record<string, string> = {
  Apple: '🍎',
  Droplets: '💧',
  HeartPulse: '➕',
  Shirt: '👕',
  Tent: '⛺',
  ShowerHead: '🚿',
  LifeBuoy: '🛟',
};

/** Glifo por defecto si la categoría no tiene un mapeo conocido. */
const GLIFO_POR_DEFECTO = '📦';

/**
 * Devuelve el fragmento de estilos de la FORMA del contenedor según el estado
 * operativo. Cada estado tiene una forma distinta (borde sólido, punteado,
 * relleno, atenuado) además del color, para no depender solo del color.
 */
function estilosForma(estado: EstadoOperativo): {
  borde: string;
  fondo: string;
  color: string;
  opacidad: string;
  aspa: boolean;
} {
  const color = COLOR_ESTADO[estado];
  switch (estado) {
    case 'operativo':
      // Anillo sólido.
      return {
        borde: `2.5px solid ${color}`,
        fondo: '#FFFFFF',
        color,
        opacidad: '1',
        aspa: false,
      };
    case 'capacidad_limitada':
      // Anillo punteado.
      return {
        borde: `2.5px dashed ${color}`,
        fondo: '#FFFFFF',
        color,
        opacidad: '1',
        aspa: false,
      };
    case 'saturado':
      // Disco relleno (glifo en blanco sobre el color de estado).
      return {
        borde: `2.5px solid ${color}`,
        fondo: color,
        color: '#FFFFFF',
        opacidad: '1',
        aspa: false,
      };
    case 'cerrado':
      // Atenuado/gris con aspa diagonal.
      return {
        borde: `2.5px solid ${color}`,
        fondo: '#F1F5F9',
        color,
        opacidad: '0.65',
        aspa: true,
      };
  }
}

/** Escapa texto para interpolarlo de forma segura dentro del HTML del divIcon. */
function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Construye el `L.divIcon` de un punto de acopio combinando glifo de categoría
 * y forma por estado. Si `seleccionado` es `true`, aplica un realce (escala y
 * anillo exterior reforzado).
 */
function crearIcono(
  punto: PuntoAcopioVista,
  seleccionado: boolean,
): L.DivIcon {
  const forma = estilosForma(punto.estado);
  const glifo = GLIFO_CATEGORIA[punto.categorias[0]?.icono ?? ''] ?? GLIFO_POR_DEFECTO;

  // Realce del seleccionado: escala mayor y anillo exterior adicional.
  const escala = seleccionado ? 'scale(1.18)' : 'scale(1)';
  const anilloRealce = seleccionado
    ? `box-shadow: 0 0 0 3px ${forma.color}55, 0 2px 6px rgba(15,23,42,0.35);`
    : 'box-shadow: 0 1px 3px rgba(15,23,42,0.3);';

  // Aspa diagonal para el estado "cerrado" (indicador de forma, no de color).
  const aspa = forma.aspa
    ? `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;color:${forma.color};">✕</span>`
    : '';

  const estadoLabel = escaparHtml(etiquetaEstadoOperativo[punto.estado]);

  const html = `
    <div
      role="img"
      aria-label="Centro de acopio: ${escaparHtml(punto.nombre)} (${estadoLabel})"
      style="
        position:relative;
        width:34px;height:34px;
        display:flex;align-items:center;justify-content:center;
        border-radius:9999px;
        border:${forma.borde};
        background:${forma.fondo};
        color:${forma.color};
        opacity:${forma.opacidad};
        ${anilloRealce}
        transform:${escala};
        transition:transform 120ms ease;
        font-size:16px;line-height:1;
      "
    >
      <span style="position:relative;z-index:1;">${glifo}</span>
      ${aspa}
    </div>
  `;

  return L.divIcon({
    html,
    className: `marcador-acopio${seleccionado ? ' marcador-acopio--activo' : ''}`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

/**
 * Capa de marcadores de centros de acopio con clustering, popups informativos y
 * realce del punto seleccionado.
 */
export function MarcadoresAcopio({
  puntos,
  seleccionId,
  onSeleccionar,
}: MarcadoresAcopioProps) {
  // Memoizamos los marcadores: el icono solo se recrea si cambian los puntos o
  // la selección, no en cada render.
  const marcadores = useMemo(
    () =>
      puntos.map((punto) => {
        const seleccionado = punto.id === seleccionId;
        return (
          <Marker
            key={punto.id}
            position={aTupla(punto.coordenada)}
            icon={crearIcono(punto, seleccionado)}
            // zIndexOffset eleva el marcador seleccionado por encima del resto.
            zIndexOffset={seleccionado ? 1000 : 0}
            eventHandlers={{
              click: () => onSeleccionar(punto.id),
            }}
          >
          </Marker>
        );
      }),
    [puntos, seleccionId, onSeleccionar],
  );

  // El cluster agrupa automáticamente según el zoom; con pocos puntos muestra
  // marcadores individuales. `chunkedLoading` evita bloquear el hilo con muchos
  // marcadores.
  return (
    <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
      {marcadores}
    </MarkerClusterGroup>
  );
}
