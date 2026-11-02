/**
 * `ListaResultados`: lista genérica y deslizable (scroll vertical) usada por el
 * Panel_Filtros para mostrar los resultados filtrados de cualquier modo
 * (acopio o riesgo).
 *
 * Es agnóstica del tipo de elemento: recibe `items` y un render-prop
 * (`renderItem`) que decide cómo se pinta cada fila. Cada fila es un botón
 * accesible; al activarla invoca `onSeleccionar(id)` para que el estado
 * superior centre el mapa y abra la ficha correspondiente (Req. 5.6, 6.5).
 *
 * Cuando no hay resultados muestra un estado vacío bien diseñado (`vacio`), que
 * normalmente incluye un botón "Limpiar filtros" (Req. 5.8, 6.7). La lista
 * tiene scroll propio para no empujar los controles del panel ni ocultar el
 * mapa en móvil (Req. 13.3).
 */

import type { ReactNode } from 'react';

export interface ListaResultadosProps<T> {
  /** Elementos ya filtrados a renderizar, en orden de presentación. */
  items: T[];
  /** Obtiene el identificador estable de un elemento (clave y selección). */
  obtenerId: (item: T) => string;
  /** Render de cada elemento (contenido interno del botón de la fila). */
  renderItem: (item: T) => ReactNode;
  /** Invocado al seleccionar un elemento con su identificador. */
  onSeleccionar: (id: string) => void;
  /**
   * Nodo mostrado cuando `items` está vacío. Debe incluir una acción de
   * "Limpiar filtros" para que el estado vacío sea accionable (Req. 5.8, 6.7).
   */
  vacio: ReactNode;
  /** Identificador del elemento actualmente seleccionado (para realce). */
  seleccionId?: string | null;
  /** Etiqueta accesible de la lista (p. ej. "Centros de acopio"). */
  etiqueta: string;
  /** Clases adicionales para el contenedor deslizable. */
  className?: string;
}

/**
 * Lista deslizable de resultados con estado vacío accionable. Cada fila es un
 * botón; la selección se delega a `onSeleccionar`.
 */
export function ListaResultados<T>({
  items,
  obtenerId,
  renderItem,
  onSeleccionar,
  vacio,
  seleccionId,
  etiqueta,
  className,
}: ListaResultadosProps<T>) {
  // Estado vacío: mensaje y acción de limpiar provistos por el consumidor.
  if (items.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-1 items-center justify-center overflow-y-auto p-4"
      >
        {vacio}
      </div>
    );
  }

  const clases = [
    'scroll-sutil flex flex-col gap-2 overflow-y-auto overscroll-contain p-3',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ul aria-label={etiqueta} className={clases}>
      {items.map((item) => {
        const id = obtenerId(item);
        const seleccionado = seleccionId === id;

        const clasesItem = [
          'w-full rounded-xl border bg-surface p-3 text-left',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'focus-visible:ring-brand focus-visible:ring-offset-surface',
          'min-h-[44px]',
          seleccionado
            ? 'border-brand ring-1 ring-brand bg-brand/5'
            : 'border-surface-border hover:border-brand/40 hover:bg-surface-subtle',
        ].join(' ');

        return (
          <li key={id}>
            <button
              type="button"
              className={clasesItem}
              aria-current={seleccionado ? 'true' : undefined}
              onClick={() => onSeleccionar(id)}
            >
              {renderItem(item)}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
