/**
 * `FiltrosRiesgo`: controles de filtro para el modo de puntos de riesgo.
 *
 * Incluye un buscador de texto (descripción, tipo de incidente o distrito) y
 * selects para tipo de incidente, severidad y estado del reporte (Req. 6.1,
 * 6.2). Muestra un contador de resultados (Req. 6.4) y un botón para limpiar
 * los filtros (Req. 6.6).
 *
 * Es un componente controlado: recibe el estado `filtros` y notifica cada
 * cambio con `onCambiar`. Las etiquetas legibles se obtienen de
 * `utils/format.ts`, de modo que los selects nunca dependen solo del color ni
 * del valor crudo del enum.
 */

import { FilterX, Search } from 'lucide-react';

import type {
  EstadoReporte,
  SeveridadRiesgo,
  TipoIncidente,
} from '@/types/domain';
import type { FiltrosRiesgo as FiltrosRiesgoEstado } from '@/types/ui';
import { Boton, Campo } from '@/components/ui';
import {
  etiquetaEstadoReporte,
  etiquetaSeveridad,
  etiquetaTipoIncidente,
} from '@/utils/format';

/** Tipos de incidente disponibles, en orden de presentación. */
const TIPOS_INCIDENTE: readonly TipoIncidente[] = [
  'inundacion',
  'derrumbe',
  'incendio',
  'sismo',
  'via_bloqueada',
  'otro',
];

/** Niveles de severidad disponibles, de menor a mayor. */
const SEVERIDADES: readonly SeveridadRiesgo[] = [
  'bajo',
  'medio',
  'alto',
  'critico',
];

/** Estados del reporte disponibles. */
const ESTADOS_REPORTE: readonly EstadoReporte[] = [
  'activo',
  'en_verificacion',
  'resuelto',
];

export interface FiltrosRiesgoProps {
  /** Estado de filtrado actual (controlado). */
  filtros: FiltrosRiesgoEstado;
  /** Notifica un nuevo estado de filtrado completo. */
  onCambiar: (filtros: FiltrosRiesgoEstado) => void;
  /** Distritos disponibles (lista derivada de los datos). */
  distritos: string[];
  /** Cantidad de resultados tras aplicar los filtros. */
  total: number;
  /** Restablece los filtros a su valor inicial ("sin filtro"). */
  onLimpiar: () => void;
}

/** Clases compartidas por los `<select>` e `<input>` del panel. */
const CLASES_CONTROL =
  'min-h-[44px] w-full rounded-xl border border-surface-border bg-surface ' +
  'px-3 text-sm text-ink placeholder:text-ink-muted ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-brand focus-visible:ring-offset-surface';

/**
 * Panel de filtros de riesgo. Todos los cambios se propagan mediante
 * `onCambiar` preservando el resto del estado de filtros.
 */
export function FiltrosRiesgo({
  filtros,
  onCambiar,
  distritos,
  total,
  onLimpiar,
}: FiltrosRiesgoProps) {
  // Helper para emitir un cambio parcial conservando los demás campos.
  function cambiar<K extends keyof FiltrosRiesgoEstado>(
    campo: K,
    valor: FiltrosRiesgoEstado[K],
  ) {
    onCambiar({ ...filtros, [campo]: valor });
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Buscador de texto. */}
      <Campo id="riesgo-busqueda" label="Buscar">
        {(props) => (
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              {...props}
              type="search"
              inputMode="search"
              className={`${CLASES_CONTROL} pl-9`}
              placeholder="Descripción, tipo de incidente o distrito"
              value={filtros.texto}
              onChange={(evento) => cambiar('texto', evento.target.value)}
            />
          </div>
        )}
      </Campo>

      {/* Filtros por campo. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo id="riesgo-tipo" label="Tipo de incidente">
          {(props) => (
            <select
              {...props}
              className={CLASES_CONTROL}
              value={filtros.tipo ?? ''}
              onChange={(evento) =>
                cambiar(
                  'tipo',
                  (evento.target.value || null) as TipoIncidente | null,
                )
              }
            >
              <option value="">Todos los tipos</option>
              {TIPOS_INCIDENTE.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {etiquetaTipoIncidente[tipo]}
                </option>
              ))}
            </select>
          )}
        </Campo>

        <Campo id="riesgo-severidad" label="Severidad">
          {(props) => (
            <select
              {...props}
              className={CLASES_CONTROL}
              value={filtros.severidad ?? ''}
              onChange={(evento) =>
                cambiar(
                  'severidad',
                  (evento.target.value || null) as SeveridadRiesgo | null,
                )
              }
            >
              <option value="">Todas las severidades</option>
              {SEVERIDADES.map((severidad) => (
                <option key={severidad} value={severidad}>
                  {etiquetaSeveridad[severidad]}
                </option>
              ))}
            </select>
          )}
        </Campo>

        <Campo id="riesgo-estado" label="Estado del reporte">
          {(props) => (
            <select
              {...props}
              className={CLASES_CONTROL}
              value={filtros.estado ?? ''}
              onChange={(evento) =>
                cambiar(
                  'estado',
                  (evento.target.value || null) as EstadoReporte | null,
                )
              }
            >
              <option value="">Todos los estados</option>
              {ESTADOS_REPORTE.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstadoReporte[estado]}
                </option>
              ))}
            </select>
          )}
        </Campo>

        {/*
          Acceso rápido por distrito: el modelo de filtros de riesgo no tiene un
          campo `distrito` propio (el distrito se busca por texto, Req. 6.1), de
          modo que elegir un distrito rellena el buscador. Así se mantiene un
          único origen de verdad para el filtrado de texto.
        */}
        {distritos.length > 0 && (
          <Campo id="riesgo-distrito" label="Distrito">
            {(props) => (
              <select
                {...props}
                className={CLASES_CONTROL}
                value={distritos.includes(filtros.texto) ? filtros.texto : ''}
                onChange={(evento) => cambiar('texto', evento.target.value)}
              >
                <option value="">Todos los distritos</option>
                {distritos.map((distrito) => (
                  <option key={distrito} value={distrito}>
                    {distrito}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        )}
      </div>

      {/* Contador de resultados + acción de limpiar. */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-ink-soft" aria-live="polite">
          {total} {total === 1 ? 'resultado' : 'resultados'}
        </p>
        <Boton
          variante="fantasma"
          tamano="sm"
          icono={<FilterX className="h-4 w-4" aria-hidden="true" />}
          onClick={onLimpiar}
        >
          Limpiar filtros
        </Boton>
      </div>
    </div>
  );
}
