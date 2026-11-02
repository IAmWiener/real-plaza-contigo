/**
 * `Toasts`: contenedor fijo que renderiza una pila de mensajes efímeros (éxito,
 * error, información). Es un componente de presentación puro: recibe la lista de
 * toasts y el callback para quitarlos; la cola la gestiona el hook `useToasts`.
 *
 * Accesibilidad:
 * - La región usa `role="status"` y `aria-live="polite"` para anunciar los
 *   mensajes sin interrumpir al usuario.
 * - Cada toast combina icono + texto (no depende solo del color) y ofrece un
 *   botón de cierre con `aria-label`.
 *
 * Animación con framer-motion, respetando `prefers-reduced-motion`.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast, TipoToast } from '@/hooks/useToasts';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface ToastsProps {
  /** Lista de toasts a mostrar (de más antiguo a más reciente). */
  toasts: Toast[];
  /** Quita un toast por su id. */
  onQuitar: (id: string) => void;
  /** Posición vertical de la pila. Por defecto `abajo`. */
  posicion?: 'arriba' | 'abajo';
}

/** Icono y estilo por tipo de toast. */
const ESTILO_TIPO: Record<
  TipoToast,
  { icono: typeof Info; clase: string; etiqueta: string }
> = {
  exito: {
    icono: CheckCircle2,
    clase: 'border-l-status-operativo text-status-operativo',
    etiqueta: 'Éxito',
  },
  error: {
    icono: AlertTriangle,
    clase: 'border-l-status-saturado text-status-saturado',
    etiqueta: 'Error',
  },
  info: {
    icono: Info,
    clase: 'border-l-risk-bajo text-risk-bajo',
    etiqueta: 'Información',
  },
};

/**
 * Pila de toasts posicionada de forma fija sobre el contenido. Vacía cuando no
 * hay mensajes (no renderiza nada perceptible pero conserva la región viva).
 */
export function Toasts({ toasts, onQuitar, posicion = 'abajo' }: ToastsProps) {
  const reducido = usePrefersReducedMotion();
  const transicion = reducido ? { duration: 0 } : { duration: 0.2 };

  const clasesPosicion =
    posicion === 'arriba'
      ? 'top-0 pt-[env(safe-area-inset-top)]'
      : 'bottom-0 pb-[env(safe-area-inset-bottom)]';

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'pointer-events-none fixed inset-x-0 z-[2200] flex flex-col items-center gap-2 p-4',
        clasesPosicion,
      ].join(' ')}
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { icono: Icono, clase, etiqueta } = ESTILO_TIPO[toast.tipo];
          return (
            <motion.div
              key={toast.id}
              layout={!reducido}
              initial={reducido ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducido ? { opacity: 0 } : { opacity: 0, y: 12 }}
              transition={transicion}
              className={[
                'pointer-events-auto flex w-full max-w-sm items-start gap-3',
                'rounded-xl border border-surface-border border-l-4 bg-surface',
                'px-4 py-3 shadow-card',
                clase,
              ].join(' ')}
            >
              <Icono className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                {/* Etiqueta textual del tipo, para no depender solo del color. */}
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {etiqueta}
                </p>
                <p className="text-sm text-ink break-words">{toast.mensaje}</p>
              </div>
              <button
                type="button"
                onClick={() => onQuitar(toast.id)}
                aria-label="Cerrar notificación"
                className={[
                  'inline-flex h-11 w-11 shrink-0 items-center justify-center',
                  '-m-2 rounded-lg text-ink-muted hover:text-ink',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                ].join(' ')}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
