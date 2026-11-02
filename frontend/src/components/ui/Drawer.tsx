/**
 * `Drawer`: panel deslizable responsive que actúa como drawer lateral en
 * escritorio (entra desde la derecha) y como bottom sheet en móvil (entra desde
 * abajo). Se usa para fichas de detalle y paneles auxiliares.
 *
 * Accesibilidad:
 * - `role="dialog"` con `aria-modal` y `aria-label`/`aria-labelledby`.
 * - Al abrir, mueve el foco al botón de cierre (trampa de foco básica).
 * - Cierra con la tecla Escape.
 * - Botón de cierre visible con `aria-label`.
 * - Overlay que cierra al hacer clic fuera del panel.
 *
 * Animación con framer-motion, respetando `prefers-reduced-motion`: cuando el
 * usuario prefiere movimiento reducido, las transiciones se desactivan.
 */

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Boton } from '@/components/ui/Boton';

export interface DrawerProps {
  /** Si el panel está visible. */
  abierto: boolean;
  /** Callback invocado al solicitar el cierre (botón, overlay o Escape). */
  onCerrar: () => void;
  /** Título mostrado en la cabecera del panel. */
  titulo: string;
  /** Contenido del panel. */
  children: ReactNode;
  /** `aria-label` del botón de cierre. Por defecto "Cerrar panel". */
  etiquetaCerrar?: string;
}

/**
 * Panel lateral (escritorio) / inferior (móvil) con animación, trampa de foco
 * básica y cierre con Escape u overlay.
 */
export function Drawer({
  abierto,
  onCerrar,
  titulo,
  children,
  etiquetaCerrar = 'Cerrar panel',
}: DrawerProps) {
  const reducido = usePrefersReducedMotion();
  const tituloId = useId();
  const botonCerrarRef = useRef<HTMLButtonElement>(null);

  // Cierra con Escape y mueve el foco al botón de cierre al abrir.
  useEffect(() => {
    if (!abierto) return;

    const alTeclado = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.stopPropagation();
        onCerrar();
      }
    };

    document.addEventListener('keydown', alTeclado);

    // Enfoca el botón de cierre tras montar el panel.
    const foco = window.setTimeout(() => {
      botonCerrarRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', alTeclado);
      window.clearTimeout(foco);
    };
  }, [abierto, onCerrar]);

  // Duración 0 cuando se prefiere movimiento reducido (transición mínima).
  const transicion = reducido ? { duration: 0 } : { duration: 0.25 };

  return (
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-[2000] flex justify-end">
          {/* Overlay: cierra al hacer clic fuera. */}
          <motion.div
            className="absolute inset-0 bg-ink/40"
            onClick={onCerrar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transicion}
            aria-hidden="true"
          />

          {/* Panel: bottom sheet en móvil, drawer lateral en escritorio. */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            className={[
              'relative z-10 flex w-full flex-col bg-surface shadow-panel',
              // Móvil: anclado abajo, ocupa el ancho, altura máxima parcial.
              'mt-auto max-h-[85vh] rounded-t-2xl',
              // Escritorio: panel lateral a altura completa.
              'md:mt-0 md:max-h-none md:h-full md:w-[420px] md:max-w-[90vw]',
              'md:rounded-t-none pb-[env(safe-area-inset-bottom)]',
            ].join(' ')}
            initial={reducido ? false : { y: '100%', x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={reducido ? undefined : { y: '100%' }}
            transition={transicion}
          >
            <header className="flex items-center justify-between gap-3 border-b border-surface-border px-4 py-3">
              <h2
                id={tituloId}
                className="text-base font-semibold text-ink truncate"
              >
                {titulo}
              </h2>
              <Boton
                ref={botonCerrarRef}
                variante="fantasma"
                tamano="sm"
                onClick={onCerrar}
                aria-label={etiquetaCerrar}
                className="!px-2"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Boton>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
