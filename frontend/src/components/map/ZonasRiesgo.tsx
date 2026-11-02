/**
 * `ZonasRiesgo`: capa del mapa que dibuja las zonas de riesgo reportadas.
 *
 * Debe renderizarse como hijo de un `MapContainer` de react-leaflet (p. ej.
 * dentro de `MapaBase`), ya que usa primitivas de react-leaflet (`Circle`,
 * `Marker`, `Popup`) que dependen del contexto del mapa.
 *
 * Responsabilidades de esta tarea (8.4):
 * - Por cada punto de riesgo pinta un `Circle` perimetral centrado en su
 *   coordenada con `radius={radioMetros}`, coloreado según la severidad
 *   (tokens `risk.*`: bajo azul, medio ámbar, alto rojo, crítico rojo oscuro).
 * - Añade un `Marker` central con un `L.divIcon` claramente DIFERENCIADO del
 *   marcador de acopio: un triángulo de advertencia (SVG inline) que, además
 *   del color de severidad, comunica el nivel con forma/etiqueta textual.
 * - Muestra un `Popup` con datos resumidos (tipo de incidente, severidad,
 *   distrito y estado del reporte), todos con etiquetas legibles.
 * - Al hacer clic en el círculo o el marcador, invoca `onSeleccionar(id)`.
 * - La zona seleccionada (`id === seleccionId`) recibe un realce visual
 *   (borde reforzado, mayor opacidad de relleno y mayor peso de línea).
 *
 * Importante: todos los reportes de riesgo son ficticios y de demostración; no
 * representan emergencias reales.
 */

import { Fragment, useMemo } from 'react';
import { Circle, Marker } from 'react-leaflet';
import L from 'leaflet';

import type { PuntoRiesgo } from '@/types/domain';
import { etiquetaSeveridad, etiquetaTipoIncidente } from '@/utils/format';
import { COLOR_SEVERIDAD, PESO_SEVERIDAD, estiloTipo } from '@/utils/riesgo';

export interface ZonasRiesgoProps {
  /** Puntos de riesgo a dibujar sobre el mapa. */
  puntos: PuntoRiesgo[];
  /** Id de la zona seleccionada, o `null` si no hay selección. */
  seleccionId: string | null;
  /** Callback invocado al seleccionar una zona (clic en círculo o marcador). */
  onSeleccionar: (id: string) => void;
}

/**
 * Color asociado a cada nivel de severidad. Coincide con los tokens `risk.*`
 * definidos en `tailwind.config.js` para mantener coherencia con el resto de la
 * interfaz.
 */
// Nota: `COLOR_SEVERIDAD` y `PESO_SEVERIDAD` se importan de `@/utils/riesgo`
// (fuente única), para mantener coherencia con el resto de la interfaz.

/**
 * Construye el HTML del `divIcon` del marcador de riesgo: un pin circular con
 * el GLIFO del tipo de incidente (emoji, porque el divIcon es HTML plano), un
 * anillo con el color de la severidad y un pequeño indicador de severidad
 * (barras) para no depender solo del color. El glifo del tipo + el anillo de
 * color + las barras lo diferencian del marcador de acopio y comunican tipo y
 * nivel con forma y texto, no solo con color (Req. 14.1).
 */
function htmlMarcadorRiesgo(punto: PuntoRiesgo, seleccionada: boolean): string {
  const color = COLOR_SEVERIDAD[punto.severidad];
  const peso = PESO_SEVERIDAD[punto.severidad];
  const etiquetaSev = etiquetaSeveridad[punto.severidad];
  const etiquetaTipo = etiquetaTipoIncidente[punto.tipo];
  const glifo = estiloTipo(punto.tipo).glifo;

  // Barras de severidad (1-4) para comunicar el nivel con forma + cantidad.
  const barras = Array.from({ length: 4 }, (_, i) => {
    const activa = i < peso;
    return `<span style="
      width:3px;height:${6 + i * 2}px;border-radius:1px;
      background:${activa ? color : 'rgba(148,163,184,0.5)'};
    "></span>`;
  }).join('');

  // Realce del marcador seleccionado: anillo reforzado y mayor escala.
  const realce = seleccionada
    ? 'transform:scale(1.18);'
    : '';
  const sombra = seleccionada
    ? 'filter:drop-shadow(0 6px 8px rgba(15,23,42,0.4));'
    : 'filter:drop-shadow(0 3px 4px rgba(15,23,42,0.3));';
  const anillo = seleccionada ? '4px' : '3px';

  return `
    <div style="position:relative;width:40px;height:48px;${realce}${sombra}"
         role="img"
         aria-label="Zona de riesgo: ${etiquetaTipo}, severidad ${etiquetaSev}">
      <!-- Cuerpo del pin: círculo con cola, coloreado por severidad. -->
      <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);
                  width:34px;height:34px;border-radius:50% 50% 50% 0;
                  transform-origin:center;
                  transform:translateX(-50%) rotate(-45deg);
                  background:#FFFFFF;border:${anillo} solid ${color};
                  box-sizing:border-box;"></div>
      <!-- Glifo del tipo, centrado y sin rotar sobre el pin. -->
      <div style="position:absolute;top:5px;left:50%;transform:translateX(-50%);
                  width:24px;height:24px;display:flex;align-items:center;
                  justify-content:center;font-size:16px;line-height:1;">
        ${glifo}
      </div>
      <!-- Barras de severidad sobre una etiqueta blanca, en la base del pin. -->
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);
                  display:flex;align-items:flex-end;gap:1px;height:13px;
                  padding:1px 3px;border-radius:4px;background:rgba(255,255,255,0.95);
                  box-shadow:0 1px 2px rgba(15,23,42,0.25);">
        ${barras}
      </div>
    </div>
  `;
}

/**
 * Crea un `L.divIcon` para la zona de riesgo. Se memoiza por punto y estado de
 * selección en el componente para no recrear iconos innecesariamente.
 */
function crearIcono(punto: PuntoRiesgo, seleccionada: boolean): L.DivIcon {
  return L.divIcon({
    html: htmlMarcadorRiesgo(punto, seleccionada),
    // Clase vacía para evitar los estilos por defecto de `leaflet-div-icon`.
    className: 'rpc-marcador-riesgo',
    iconSize: [40, 48],
    // La punta del pin (cola inferior) coincide con la coordenada/centro del Circle.
    iconAnchor: [20, 36],
    popupAnchor: [0, -34],
  });
}

/**
 * Renderiza la capa de zonas de riesgo: un `Circle` perimetral y un `Marker`
 * central por cada punto, con popup resumido y selección por clic.
 */
export function ZonasRiesgo({
  puntos,
  seleccionId,
  onSeleccionar,
}: ZonasRiesgoProps) {
  // Memoiza los iconos por combinación de puntos + selección. Evita recrearlos
  // en cada render cuando no cambian los datos ni la selección.
  const iconos = useMemo(() => {
    const mapa = new Map<string, L.DivIcon>();
    for (const punto of puntos) {
      mapa.set(punto.id, crearIcono(punto, punto.id === seleccionId));
    }
    return mapa;
  }, [puntos, seleccionId]);

  return (
    <>
      {puntos.map((punto) => {
        const seleccionada = punto.id === seleccionId;
        const color = COLOR_SEVERIDAD[punto.severidad];
        const centro: [number, number] = [
          punto.coordenada.lat,
          punto.coordenada.lng,
        ];

        return (
          // Agrupamos el círculo perimetral y el marcador central como
          // hermanos (patrón estándar de react-leaflet): ambos se adjuntan
          // directamente al mapa y comparten la misma selección.
          <Fragment key={punto.id}>
            <Circle
              center={centro}
              radius={punto.radioMetros}
              pathOptions={{
                color,
                // Realce de la zona seleccionada: borde más grueso y relleno
                // más opaco para distinguirla sin depender solo del color.
                weight: seleccionada ? 4 : 2,
                opacity: 1,
                fillColor: color,
                fillOpacity: seleccionada ? 0.35 : 0.18,
                // Línea discontinua para la zona NO seleccionada: refuerza la
                // diferencia por forma además de por opacidad/peso.
                dashArray: seleccionada ? undefined : '6 6',
              }}
              eventHandlers={{
                click: () => onSeleccionar(punto.id),
              }}
            />

            {/* Marcador central diferenciado (triángulo de advertencia). */}
            <Marker
              position={centro}
              icon={iconos.get(punto.id)}
              keyboard
              eventHandlers={{
                click: () => onSeleccionar(punto.id),
              }}
            >
            </Marker>
          </Fragment>
        );
      })}
    </>
  );
}
