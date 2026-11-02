/**
 * `SelectorModo`: control visual principal para alternar entre el modo
 * "Centros de acopio" (Modo_Acopio) y "Reporte de puntos críticos"
 * (Modo_Riesgo).
 *
 * Implementa el patrón ARIA de pestañas (`role="tablist"` con botones
 * `role="tab"` y `aria-selected`) para que la selección sea comprensible por
 * lectores de pantalla y operable por teclado:
 *
 * - Flechas Izquierda/Derecha (y Arriba/Abajo) mueven el foco entre opciones.
 * - Inicio/Fin saltan a la primera/última opción.
 * - Al mover el foco con las flechas se activa el modo correspondiente (patrón
 *   de "activación automática", adecuado porque cambiar de modo no es costoso).
 * - Solo la pestaña activa queda en el orden de tabulación (`tabIndex=0`); las
 *   demás usan `tabIndex=-1`, como recomienda el patrón de tablist.
 *
 * El modo activo se distingue por MÚLTIPLES señales, no solo por color
 * (Req. 1.6, 14.1): peso de fuente, borde y fondo propios, y un indicador con
 * icono relleno más una barra inferior. Cada opción combina etiqueta textual e
 * icono (Req. 1.1). Las áreas táctiles son de al menos 44px y el foco es
 * visible, para su uso con una mano desde 360px de ancho (Req. 1.2, 14.2).
 *
 * Nota: este componente solo emite el cambio de modo mediante `onCambiarModo`;
 * no monta ni desmonta el mapa, de modo que el mapa permanece visible durante
 * la transición (Req. 1.3–1.5) cuando el estado superior reacciona al cambio.
 */

import { useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { PackageOpen, TriangleAlert } from 'lucide-react';
import type { ModoApp } from '@/types/domain';

export interface SelectorModoProps {
  /** Modo actualmente activo. */
  modo: ModoApp;
  /** Callback invocado al seleccionar un modo distinto (o el mismo). */
  onCambiarModo: (modo: ModoApp) => void;
}

/** Descripción de cada opción del selector. */
interface OpcionModo {
  modo: ModoApp;
  /** Etiqueta completa (escritorio y lectores de pantalla). */
  etiqueta: string;
  /** Etiqueta corta para móvil, para no truncar en pantallas estrechas. */
  etiquetaCorta: string;
  /** Icono para el estado activo (relleno/sólido). */
  iconoActivo: ReactNode;
  /** Icono para el estado inactivo (contorno). */
  iconoInactivo: ReactNode;
}

/**
 * Opciones del selector en orden de presentación. Se usan iconos de
 * `lucide-react` con un relleno sutil en el estado activo para reforzar la
 * selección sin depender del color.
 */
const OPCIONES: readonly OpcionModo[] = [
  {
    modo: 'acopio',
    etiqueta: 'Centros de acopio',
    etiquetaCorta: 'Acopio',
    iconoActivo: (
      <PackageOpen className="h-5 w-5 fill-current/20" aria-hidden="true" />
    ),
    iconoInactivo: <PackageOpen className="h-5 w-5" aria-hidden="true" />,
  },
  {
    modo: 'riesgo',
    etiqueta: 'Reporte de puntos críticos',
    etiquetaCorta: 'Riesgo',
    iconoActivo: (
      <TriangleAlert className="h-5 w-5 fill-current/20" aria-hidden="true" />
    ),
    iconoInactivo: <TriangleAlert className="h-5 w-5" aria-hidden="true" />,
  },
];

/** Clases base compartidas por cada pestaña (área táctil ≥44px, foco visible). */
const CLASES_TAB_BASE =
  'relative inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 ' +
  'rounded-pill px-3 py-2 text-sm transition-colors duration-150 ease-cr select-none ' +
  'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 ' +
  'focus-visible:ring-accent focus-visible:ring-offset-brand';

/**
 * Clases de la pestaña activa: píldora turquesa (acento de energía) con texto
 * verde oscuro (cumple AA), peso fuerte y sombra. Se distingue por múltiples
 * señales, no solo por color.
 */
const CLASES_TAB_ACTIVA = 'bg-accent-soft text-title font-bold shadow-sm';

/** Clases aplicadas a las pestañas inactivas (sobre la banda morada). */
const CLASES_TAB_INACTIVA =
  'bg-transparent text-white/85 font-medium hover:text-white hover:bg-white/10';

/**
 * Selector de modo con patrón de pestañas accesible y navegación por teclado.
 */
export function SelectorModo({ modo, onCambiarModo }: SelectorModoProps) {
  // Referencias a cada botón para poder mover el foco con el teclado.
  const refsTabs = useRef<(HTMLButtonElement | null)[]>([]);

  const indiceActivo = OPCIONES.findIndex((opcion) => opcion.modo === modo);

  /**
   * Enfoca y activa la opción en el índice dado (con envolvente circular).
   */
  function activarPorIndice(indice: number) {
    const total = OPCIONES.length;
    const normalizado = ((indice % total) + total) % total;
    const opcion = OPCIONES[normalizado];
    refsTabs.current[normalizado]?.focus();
    onCambiarModo(opcion.modo);
  }

  /**
   * Maneja la navegación por teclado dentro del grupo de pestañas, siguiendo
   * el patrón ARIA de tablist (flechas, Inicio y Fin).
   */
  function manejarTeclado(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    switch (evento.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        evento.preventDefault();
        activarPorIndice(indice + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        evento.preventDefault();
        activarPorIndice(indice - 1);
        break;
      case 'Home':
        evento.preventDefault();
        activarPorIndice(0);
        break;
      case 'End':
        evento.preventDefault();
        activarPorIndice(OPCIONES.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Modo de la plataforma"
      aria-orientation="horizontal"
      className="flex w-full items-stretch gap-1 rounded-pill bg-white/10 p-1"
    >
      {OPCIONES.map((opcion, indice) => {
        const activa = opcion.modo === modo;
        const clases = [
          CLASES_TAB_BASE,
          activa ? CLASES_TAB_ACTIVA : CLASES_TAB_INACTIVA,
        ].join(' ');

        return (
          <button
            key={opcion.modo}
            ref={(elemento) => {
              refsTabs.current[indice] = elemento;
            }}
            type="button"
            role="tab"
            id={`selector-modo-tab-${opcion.modo}`}
            aria-selected={activa}
            // El `aria-label` siempre lleva la etiqueta completa, aunque en
            // móvil se muestre la versión corta para no truncar.
            aria-label={opcion.etiqueta}
            // Solo la pestaña activa participa en el orden de tabulación.
            tabIndex={activa ? 0 : -1}
            className={clases}
            onClick={() => onCambiarModo(opcion.modo)}
            onKeyDown={(evento) => manejarTeclado(evento, indice)}
          >
            {activa ? opcion.iconoActivo : opcion.iconoInactivo}
            {/* Etiqueta corta en móvil, completa desde sm; sin truncar. */}
            <span className="sm:hidden">{opcion.etiquetaCorta}</span>
            <span className="hidden truncate sm:inline">{opcion.etiqueta}</span>
            {/* Indicador textual accesible del estado activo (no solo color). */}
            {activa && <span className="sr-only">(modo activo)</span>}
            {/* Barra inferior como señal visual adicional de selección. */}
            {activa && (
              <span
                aria-hidden="true"
                className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-title"
              />
            )}
          </button>
        );
      })}
      {/* `indiceActivo` se expone para herramientas de depuración/pruebas. */}
      <span className="sr-only">Opción activa: {indiceActivo + 1}</span>
    </div>
  );
}
