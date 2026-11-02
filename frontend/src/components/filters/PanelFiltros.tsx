/**
 * `PanelFiltros`: contenedor del panel de búsqueda, filtros y resultados que
 * convive con el mapa.
 *
 * Según el modo activo renderiza `FiltrosAcopio` o `FiltrosRiesgo` seguido de
 * `ListaResultados` (Req. 1.3, 1.4, 5, 6). Recibe las colecciones completas del
 * modo y el estado de filtros (controlado por App), y usa internamente los
 * hooks `useFiltrosAcopio` / `useFiltrosRiesgo` para derivar los `items` y el
 * `total` que alimentan la lista y el contador. Seleccionar un resultado invoca
 * `onSeleccionar`, que App usa para centrar el mapa y abrir la ficha (Req. 5.6,
 * 6.5).
 *
 * Layout responsive interno (Req. 13.3): en escritorio (md+) es un panel
 * lateral de altura completa; en móvil es un panel inferior compacto cuya lista
 * tiene scroll propio para no ocultar el mapa. El posicionamiento real sobre el
 * mapa lo coordina `App`; aquí se define el layout interno (cabecera fija de
 * filtros + lista deslizable que ocupa el espacio restante).
 *
 * Decisión de diseño: se usan props explícitas (no contexto) para desacoplar el
 * panel del `AppProvider` y facilitar su prueba y reutilización.
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Inbox, MapPinOff, SlidersHorizontal, ChevronUp } from 'lucide-react';

import type { Categoria, Evento, ModoApp, PuntoRiesgo } from '@/types/domain';
import type {
  FiltrosAcopio as FiltrosAcopioEstado,
  FiltrosRiesgo as FiltrosRiesgoEstado,
  PuntoAcopioVista,
} from '@/types/ui';
import { useFiltrosAcopio } from '@/hooks/useFiltrosAcopio';
import { useFiltrosRiesgo } from '@/hooks/useFiltrosRiesgo';
import { useEsMobile } from '@/hooks/useEsMobile';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Badge, Boton, tonoDesdeEstado, tonoDesdeSeveridad } from '@/components/ui';
import {
  etiquetaEstadoOperativo,
  etiquetaEstadoReporte,
  etiquetaSeveridad,
  etiquetaTipoIncidente,
} from '@/utils/format';
import { estiloTipo } from '@/utils/riesgo';

import { FiltrosAcopio } from './FiltrosAcopio';
import { FiltrosRiesgo } from './FiltrosRiesgo';
import { ListaResultados } from './ListaResultados';

export interface PanelFiltrosProps {
  /** Modo activo: determina qué filtros y qué colección se muestran. */
  modo: ModoApp;

  // --- Datos del modo acopio ---
  /** Colección completa de puntos de acopio (view-models) del sistema. */
  acopioVistas: PuntoAcopioVista[];
  /** Estado de filtros de acopio (controlado por App). */
  filtrosAcopio: FiltrosAcopioEstado;
  /** Notifica un nuevo estado de filtros de acopio. */
  onCambiarFiltrosAcopio: (filtros: FiltrosAcopioEstado) => void;
  /** Catálogo de categorías para los selects de acopio. */
  categorias: Categoria[];
  /** Catálogo de eventos para los selects de acopio. */
  eventos: Evento[];

  // --- Datos del modo riesgo ---
  /** Colección completa de puntos de riesgo del sistema. */
  puntosRiesgo: PuntoRiesgo[];
  /** Estado de filtros de riesgo (controlado por App). */
  filtrosRiesgo: FiltrosRiesgoEstado;
  /** Notifica un nuevo estado de filtros de riesgo. */
  onCambiarFiltrosRiesgo: (filtros: FiltrosRiesgoEstado) => void;

  // --- Acciones comunes ---
  /** Restablece los filtros del modo activo a "sin filtro". */
  onLimpiar: () => void;
  /** Selecciona un resultado por ID (App centra el mapa y abre la ficha). */
  onSeleccionar: (id: string) => void;
  /** ID del elemento seleccionado, para realzarlo en la lista. */
  seleccionId?: string | null;

  /** Clases adicionales para el contenedor del panel. */
  className?: string;
}

/**
 * Deriva la lista ordenada y única de distritos presentes en una colección.
 * Se usa para poblar los selects de distrito de ambos modos.
 */
function derivarDistritos(valores: Array<{ distrito: string }>): string[] {
  const unicos = new Set<string>();
  for (const valor of valores) {
    if (valor.distrito) unicos.add(valor.distrito);
  }
  return Array.from(unicos).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Panel de filtros y resultados para el modo activo. Internamente aplica los
 * hooks de filtrado y compone la cabecera de filtros con la lista deslizable.
 */
export function PanelFiltros({
  modo,
  acopioVistas,
  filtrosAcopio,
  onCambiarFiltrosAcopio,
  categorias,
  eventos,
  puntosRiesgo,
  filtrosRiesgo,
  onCambiarFiltrosRiesgo,
  onLimpiar,
  onSeleccionar,
  seleccionId,
  className,
}: PanelFiltrosProps) {
  // Filtrado memoizado de ambos modos; solo se muestra el del modo activo.
  const resultadoAcopio = useFiltrosAcopio(acopioVistas, filtrosAcopio);
  const resultadoRiesgo = useFiltrosRiesgo(puntosRiesgo, filtrosRiesgo);

  // En móvil la cabecera de filtros va colapsada por defecto, para que la lista
  // de resultados tenga altura útil real; se abre con el botón "Filtros". En
  // escritorio (md+) los filtros están siempre visibles (clase `md:block`).
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Hoja inferior deslizable: SOLO en móvil. El asidero (grabber) permite
  // arrastrar el panel entre posiciones (min / medio / expandido) con el dedo.
  const esMobile = useEsMobile();
  const reducido = usePrefersReducedMotion();
  const sheet = useBottomSheet(esMobile, 'medio');

  const total = modo === 'acopio' ? resultadoAcopio.total : resultadoRiesgo.total;

  const clasesPanel = [
    'flex min-h-0 flex-col overflow-hidden rounded-2xl',
    'border border-surface-border bg-surface/95 shadow-float backdrop-blur-sm',
    // En escritorio la altura la limita el contenedor; en móvil la controla el
    // bottom sheet vía `style`.
    esMobile ? '' : 'max-h-full',
    // Transición suave de altura al soltar el arrastre (respeta reduced-motion).
    !sheet.arrastrando && !reducido ? 'transition-[height] duration-200 ease-out' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  // Altura dinámica del panel en móvil (bottom sheet). En escritorio, `null`.
  const stylePanel =
    esMobile && sheet.alturaPx != null
      ? { height: `${sheet.alturaPx}px` }
      : undefined;

  // Clases de la sección de filtros: oculta en móvil cuando está colapsada,
  // siempre visible desde `md`.
  const clasesFiltros = [
    'shrink-0 border-b border-surface-border',
    filtrosAbiertos ? 'block' : 'hidden',
    'md:block',
  ].join(' ');

  return (
    <section
      aria-label={
        modo === 'acopio'
          ? 'Filtros y resultados de centros de acopio'
          : 'Filtros y resultados de puntos de riesgo'
      }
      className={clasesPanel}
      style={stylePanel}
    >
      {/* Asidero (grabber) arrastrable en móvil: permite deslizar el panel entre
          posiciones (min / medio / expandido). Tocarlo alterna minimizado/medio.
          `touch-none` evita que el gesto haga scroll de la página al arrastrar. */}
      <div
        className="flex shrink-0 cursor-grab touch-none select-none justify-center py-2.5 active:cursor-grabbing md:hidden"
        onPointerDown={sheet.onPointerDown}
        role="button"
        tabIndex={0}
        aria-label="Arrastra para ajustar el alto del panel; toca para minimizar o expandir"
        onKeyDown={(evento) => {
          if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            sheet.alternar();
          }
        }}
      >
        <span className="grabber" aria-hidden="true" />
      </div>

      {/* Barra de control (solo móvil): alterna los filtros y muestra el total.
          Mantiene la lista con altura útil mientras los filtros están ocultos. */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-2 pt-1 md:hidden">
        <Boton
          variante="secundario"
          tamano="sm"
          aria-expanded={filtrosAbiertos}
          icono={
            filtrosAbiertos ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            )
          }
          onClick={() => setFiltrosAbiertos((v) => !v)}
        >
          {filtrosAbiertos ? 'Ocultar filtros' : 'Filtros'}
        </Boton>
        <span className="text-sm font-medium text-ink-soft" aria-live="polite">
          {total} {total === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {modo === 'acopio' ? (
        <>
          {/* Cabecera de filtros (colapsable en móvil, fija en escritorio). */}
          <div className={clasesFiltros}>
            <FiltrosAcopio
              filtros={filtrosAcopio}
              onCambiar={onCambiarFiltrosAcopio}
              categorias={categorias}
              eventos={eventos}
              distritos={derivarDistritos(acopioVistas)}
              total={resultadoAcopio.total}
              onLimpiar={onLimpiar}
            />
          </div>

          {/* Lista deslizable de resultados (ocupa el espacio restante). */}
          <ListaResultados
            className="min-h-0 flex-1"
            etiqueta="Centros de acopio"
            items={resultadoAcopio.items}
            obtenerId={(punto) => punto.id}
            onSeleccionar={onSeleccionar}
            seleccionId={seleccionId}
            vacio={
              <EstadoVacio
                icono={<Inbox className="h-8 w-8" aria-hidden="true" />}
                titulo="Sin centros de acopio"
                descripcion="No hay centros que coincidan con los filtros actuales."
                onLimpiar={onLimpiar}
              />
            }
            renderItem={(punto) => (
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-ink">{punto.nombre}</span>
                  <Badge tono={tonoDesdeEstado(punto.estado)}>
                    {etiquetaEstadoOperativo[punto.estado]}
                  </Badge>
                </div>
                <span className="text-sm text-ink-muted">{punto.distrito}</span>
              </div>
            )}
          />
        </>
      ) : (
        <>
          <div className={clasesFiltros}>
            <FiltrosRiesgo
              filtros={filtrosRiesgo}
              onCambiar={onCambiarFiltrosRiesgo}
              distritos={derivarDistritos(puntosRiesgo)}
              total={resultadoRiesgo.total}
              onLimpiar={onLimpiar}
            />
          </div>

          <ListaResultados
            className="min-h-0 flex-1"
            etiqueta="Puntos de riesgo"
            items={resultadoRiesgo.items}
            obtenerId={(punto) => punto.id}
            onSeleccionar={onSeleccionar}
            seleccionId={seleccionId}
            vacio={
              <EstadoVacio
                icono={<MapPinOff className="h-8 w-8" aria-hidden="true" />}
                titulo="Sin puntos de riesgo"
                descripcion="No hay reportes que coincidan con los filtros actuales."
                onLimpiar={onLimpiar}
              />
            }
            renderItem={(punto) => {
              const { icono: IconoTipo, color } = estiloTipo(punto.tipo);
              return (
                <div className="flex items-start gap-2.5">
                  {/* Icono circular del tipo de incidente (identidad visual). */}
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  >
                    <IconoTipo className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-ink">
                        {etiquetaTipoIncidente[punto.tipo]}
                      </span>
                      <Badge tono={tonoDesdeSeveridad(punto.severidad)}>
                        {etiquetaSeveridad[punto.severidad]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-ink-muted">
                        {punto.distrito}
                      </span>
                      <span className="text-xs text-ink-soft">
                        {etiquetaEstadoReporte[punto.estado]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </>
      )}
    </section>
  );
}

/** Props del estado vacío interno del panel. */
interface EstadoVacioProps {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
  onLimpiar: () => void;
}

/**
 * Estado vacío reutilizable del panel: icono, mensaje y acción para limpiar los
 * filtros (Req. 5.8, 6.7).
 */
function EstadoVacio({ icono, titulo, descripcion, onLimpiar }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-ink-muted" aria-hidden="true">
        {icono}
      </span>
      <p className="font-medium text-ink">{titulo}</p>
      <p className="max-w-xs text-sm text-ink-muted">{descripcion}</p>
      <Boton variante="secundario" tamano="sm" onClick={onLimpiar}>
        Limpiar filtros
      </Boton>
    </div>
  );
}
