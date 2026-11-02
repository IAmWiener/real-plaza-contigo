/**
 * Hook `useToasts`: gestiona una cola de mensajes efímeros (éxito, error,
 * información) que la UI muestra al usuario. Cada toast se auto-elimina tras un
 * tiempo o puede quitarse manualmente.
 *
 * El tipo `Toast` se define aquí y se exporta para que el resto de la app (por
 * ejemplo el reducer de estado) lo importe desde un lugar común, evitando
 * acoplar este hook con `app/estado.ts`.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/** Categoría visual y semántica de un toast. */
export type TipoToast = 'exito' | 'error' | 'info';

/** Mensaje efímero mostrado al usuario. */
export interface Toast {
  /** Identificador único del toast. */
  id: string;
  /** Tipo del mensaje. */
  tipo: TipoToast;
  /** Texto a mostrar. */
  mensaje: string;
}

/** Valor devuelto por `useToasts`. */
export interface UsoToasts {
  /** Cola actual de toasts visibles. */
  toasts: Toast[];
  /** Encola un nuevo toast del tipo indicado. */
  mostrar: (tipo: TipoToast, mensaje: string) => void;
  /** Quita manualmente un toast por su id. */
  quitar: (id: string) => void;
}

/** Tiempo de vida de un toast antes de auto-eliminarse (milisegundos). */
const DURACION_MS = 4000;

/**
 * Genera un identificador único para un toast. Usa `crypto.randomUUID()` cuando
 * está disponible y cae a una combinación de tiempo + aleatorio en caso
 * contrario.
 */
function generarIdToast(): string {
  try {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // Ignorar y caer al fallback.
  }
  return `toast-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/**
 * Hook de cola de toasts con auto-eliminación.
 *
 * - `mostrar(tipo, mensaje)` encola un toast con id autogenerado y programa su
 *   eliminación tras ~4000ms.
 * - `quitar(id)` lo elimina de inmediato y cancela su temporizador.
 * - Al desmontar, limpia todos los temporizadores pendientes.
 */
export function useToasts(): UsoToasts {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /** Temporizadores de auto-eliminación por id de toast. */
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const quitar = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((actuales) => actuales.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (tipo: TipoToast, mensaje: string) => {
      const id = generarIdToast();
      setToasts((actuales) => [...actuales, { id, tipo, mensaje }]);

      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        setToasts((actuales) => actuales.filter((t) => t.id !== id));
      }, DURACION_MS);

      timersRef.current.set(id, timer);
    },
    [],
  );

  // Limpia todos los temporizadores pendientes al desmontar.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return { toasts, mostrar, quitar };
}
