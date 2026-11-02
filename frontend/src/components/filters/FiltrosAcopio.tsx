/**
 * `FiltrosAcopio`: controles de filtro para el modo de centros de acopio.
 *
 * Incluye un buscador de texto (nombre, sede, aliado, dirección o distrito) y
 * selects para categoría, estado operativo, evento y distrito (Req. 5.1, 5.2).
 * Muestra un contador de resultados (Req. 5.4) y un botón para limpiar los
 * filtros (Req. 5.7).
 *
 * Es un componente controlado: recibe el estado `filtros` y notifica cada
 * cambio mediante `onCambiar`, de modo que el estado vive en el componente
 * superior (App / Panel_Filtros) y se comparte con el mapa y la lista.
 *
 * Accesibilidad: cada control va envuelto en `Campo`, que vincula su etiqueta
 * visible, y los selects muestran siempre una opción "Todos/Todas" para el
 * valor "sin filtro" (`null`).
 */

import { FilterX, Search } from 'lucide-react';

import type { Categoria, EstadoOperativo, Evento } from '@/types/domain';
import type { FiltrosAcopio as FiltrosAcopioEstado } from '@/types/ui';
import { Boton, Campo } from '@/components/ui';
import { etiquetaEstadoOperativo } from '@/utils/format';

/** Estados operativos disponibles, en orden de presentación. */
const ESTADOS_OPERATIVOS: readonly EstadoOperativo[] = [
  'operativo',
  'capacidad_limitada',
  'saturado',
  'cerrado',
];

export interface FiltrosAcopioProps {
  /** Estado de filtrado actual (controlado). */
  filtros: FiltrosAcopioEstado;
  /** Notifica un nuevo estado de filtrado completo. */
  onCambiar: (filtros: FiltrosAcopioEstado) => void;
  /** Catálogo de categorías para el select de categoría. */
  categorias: Categoria[];
  /** Catálogo de eventos para el select de evento. */
  eventos: Evento[];
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
 * Panel de filtros de acopio. Todos los cambios se propagan mediante
 * `onCambiar` preservando el resto del estado de filtros.
 */
export function FiltrosAcopio({
  filtros,
  onCambiar,
  categorias,
  eventos,
  distritos,
  total,
  onLimpiar,
}: FiltrosAcopioProps) {
  // Helper para emitir un cambio parcial conservando los demás campos.
  function cambiar<K extends keyof FiltrosAcopioEstado>(
    campo: K,
    valor: FiltrosAcopioEstado[K],
  ) {
    onCambiar({ ...filtros, [campo]: valor });
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Buscador de texto. */}
      <Campo id="acopio-busqueda" label="Buscar">
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
              placeholder="Nombre, sede, aliado, dirección o distrito"
              value={filtros.texto}
              onChange={(evento) => cambiar('texto', evento.target.value)}
            />
          </div>
        )}
      </Campo>

      {/* Filtros por campo. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo id="acopio-categoria" label="Categoría">
          {(props) => (
            <select
              {...props}
              className={CLASES_CONTROL}
              value={filtros.categoriaId ?? ''}
              onChange={(evento) =>
                cambiar('categoriaId', evento.target.value || null)
              }
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          )}
        </Campo>

        <Campo id="acopio-estado" label="Estado operativo">
          {(props) => (
            <select
              {...props}
              className={CLASES_CONTROL}
              value={filtros.estado ?? ''}
              onChange={(evento) =>
                cambiar(
                  'estado',
                  (evento.target.value || null) as EstadoOperativo | null,
                )
              }
            >
              <option value="">Todos los estados</option>
              {ESTADOS_OPERATIVOS.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstadoOperativo[estado]}
                </option>
              ))}
            </select>
          )}
        </Campo>

        <Campo id="acopio-evento" label="Evento">
          {(props) => (
            <select
              {...props}
              className={CLASES_CONTROL}
              value={filtros.eventoId ?? ''}
              onChange={(evento) =>
                cambiar('eventoId', evento.target.value || null)
              }
            >
              <option value="">Todos los eventos</option>
              {eventos.map((evento) => (
                <option key={evento.id} value={evento.id}>
                  {evento.nombre}
                </option>
              ))}
            </select>
          )}
        </Campo>

        <Campo id="acopio-distrito" label="Distrito">
          {(props) => (
            <select
              {...props}
              className={CLASES_CONTROL}
              value={filtros.distrito ?? ''}
              onChange={(evento) =>
                cambiar('distrito', evento.target.value || null)
              }
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
