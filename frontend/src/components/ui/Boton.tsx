/**
 * `Boton`: botón reutilizable y accesible de Real Plaza Contigo.
 *
 * - Variantes de estilo: `primario`, `secundario`, `fantasma`, `peligro`.
 * - Tamaños: `sm`, `md`, `lg` (todos respetan un área táctil mínima de 44px).
 * - Extiende los atributos nativos de `<button>` (type, onClick, aria-*, etc.).
 * - Foco visible mediante `focus-visible` (anillo de enfoque).
 * - Soporta un icono opcional (ReactNode de lucide) a la izquierda.
 * - Estado `cargando` que deshabilita el botón y muestra un spinner accesible.
 *
 * El color nunca es el único medio de comunicar la acción: el texto del botón
 * (o un `aria-label`) siempre acompaña a la variante.
 */

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/** Variantes visuales disponibles para el botón. */
export type VarianteBoton =
  | 'primario'
  | 'secundario'
  | 'fantasma'
  | 'peligro'
  | 'acento'
  | 'turquesa'
  | 'inverso';

/** Tamaños disponibles para el botón. */
export type TamanoBoton = 'sm' | 'md' | 'lg';

export interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual. Por defecto `primario`. */
  variante?: VarianteBoton;
  /** Tamaño. Por defecto `md`. */
  tamano?: TamanoBoton;
  /** Icono opcional mostrado antes del texto. */
  icono?: ReactNode;
  /** Si `true`, muestra un spinner y deshabilita la interacción. */
  cargando?: boolean;
  /** Si `true`, el botón ocupa todo el ancho disponible. */
  bloque?: boolean;
}

/**
 * Clases base compartidas por todas las variantes y tamaños. Los botones son
 * "pill" (bordes totalmente redondeados) y el foco usa el anillo turquesa del
 * sistema de diseño (--cr-foco).
 */
const CLASES_BASE =
  'inline-flex items-center justify-center gap-2 rounded-pill font-bold ' +
  'transition-colors duration-150 ease-cr select-none ' +
  'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 ' +
  'focus-visible:ring-accent focus-visible:ring-offset-surface ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

/**
 * Clases por variante, alineadas con los botones del sistema "Comunidad Real":
 * - primario: morado 800 / blanco (acción principal).
 * - acento: morado 600 / blanco (acción destacada, chat).
 * - turquesa: turquesa 300 / verde 900 (sobre fondos claros, campañas).
 * - secundario: transparente con borde morado 800.
 * - inverso: transparente con borde blanco (sobre morado).
 */
const CLASES_VARIANTE: Record<VarianteBoton, string> = {
  primario: 'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark',
  acento: 'bg-brand-light text-white hover:bg-brand active:bg-brand',
  turquesa: 'bg-accent-soft text-title hover:bg-accent active:bg-accent',
  secundario:
    'bg-surface text-brand border border-brand hover:bg-brand-soft',
  fantasma: 'bg-transparent text-ink hover:bg-surface-subtle',
  inverso:
    'bg-transparent text-white border border-white/80 hover:bg-white/10',
  peligro: 'bg-status-saturado text-white hover:bg-brand-dark',
};

/**
 * Clases por tamaño. Todas garantizan un área táctil mínima de 44px (`min-h` y
 * `min-w`) conforme al requisito de accesibilidad 14.3.
 */
const CLASES_TAMANO: Record<TamanoBoton, string> = {
  sm: 'min-h-[44px] min-w-[44px] px-3 text-sm',
  md: 'min-h-[44px] min-w-[44px] px-4 text-sm',
  lg: 'min-h-[48px] min-w-[48px] px-5 text-base',
};

/**
 * Botón accesible con variantes, tamaños, icono opcional y estado de carga.
 * Reenvía la referencia al elemento `<button>` para integrarse con el manejo
 * de foco (p. ej. trampa de foco de diálogos y drawers).
 */
export const Boton = forwardRef<HTMLButtonElement, BotonProps>(function Boton(
  {
    variante = 'primario',
    tamano = 'md',
    icono,
    cargando = false,
    bloque = false,
    disabled,
    className,
    children,
    type,
    ...resto
  },
  ref,
) {
  const deshabilitado = disabled || cargando;

  const clases = [
    CLASES_BASE,
    CLASES_VARIANTE[variante],
    CLASES_TAMANO[tamano],
    bloque ? 'w-full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      // `type` por defecto `button` para no enviar formularios por accidente.
      type={type ?? 'button'}
      className={clases}
      disabled={deshabilitado}
      aria-busy={cargando || undefined}
      {...resto}
    >
      {cargando ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icono && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {icono}
          </span>
        )
      )}
      {children}
    </button>
  );
});
