/**
 * `Dialogo`: diálogo de confirmación modal centrado. Se usa para acciones que
 * requieren confirmación explícita (eliminar, resolver, restaurar demo).
 *
 * Accesibilidad:
 * - `role="dialog"` con `aria-modal` y `aria-labelledby`/`aria-describedby`.
 * - El foco inicial se coloca en el botón de confirmar.
 * - La tecla Escape cancela el diálogo.
 * - Overlay que cancela al hacer clic fuera.
 *
 * Animación con framer-motion, desactivada cuando el usuario prefiere
 * movimiento reducido.
 */

import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Boton } from '@/components/ui/Boton';

export interface DialogoProps {
  /** Si el diálogo está visible. */
  abierto: boolean;
  /** Título del diálogo. */
  titulo: string;
  /** Mensaje explicativo de la acción a confirmar. */
  mensaje: string;
  /** Texto del botón de confirmación. Por defecto "Confirmar". */
  textoConfirmar?: string;
  /** Texto del botón de cancelación. Por defecto "Cancelar". */
  textoCancelar?: string;
  /** Tono de la acción; `peligro` resalta la confirmación como destructiva. */
  tono?: 'peligro' | 'normal';
  /** Callback al confirmar. */
  onConfirmar: () => void;
  /** Callback al cancelar (botón, overlay o Escape). */
  onCancelar: () => void;
}

/**
 * Diálogo modal de confirmación con foco inicial en confirmar y cierre con
 * Escape.
 */
export function Dialogo({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  tono = 'normal',
  onConfirmar,
  onCancelar,
}: DialogoProps) {
  const reducido = usePrefersReducedMotion();
  const tituloId = useId();
  const mensajeId = useId();
  const botonConfirmarRef = useRef<HTMLButtonElement>(null);

  // Cierra con Escape y enfoca el botón de confirmar al abrir.
  useEffect(() => {
    if (!abierto) return;

    const alTeclado = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.stopPropagation();
        onCancelar();
      }
    };

    document.addEventListener('keydown', alTeclado);

    const foco = window.setTimeout(() => {
      botonConfirmarRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', alTeclado);
      window.clearTimeout(foco);
    };
  }, [abierto, onCancelar]);

  const transicion = reducido ? { duration: 0 } : { duration: 0.2 };

  return (
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink/50"
            onClick={onCancelar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transicion}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            aria-describedby={mensajeId}
            className="relative z-10 w-full max-w-md rounded-2xl bg-surface p-5 shadow-panel"
            initial={reducido ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducido ? undefined : { opacity: 0, scale: 0.96 }}
            transition={transicion}
          >
            <h2 id={tituloId} className="text-lg font-semibold text-ink">
              {titulo}
            </h2>
            <p id={mensajeId} className="mt-2 text-sm text-ink-soft">
              {mensaje}
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Boton variante="secundario" onClick={onCancelar}>
                {textoCancelar}
              </Boton>
              <Boton
                ref={botonConfirmarRef}
                variante={tono === 'peligro' ? 'peligro' : 'primario'}
                onClick={onConfirmar}
              >
                {textoConfirmar}
              </Boton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
