/**
 * Hook `useBloqueoScroll`: bloquea el scroll del documento de fondo mientras un
 * overlay modal (Drawer/ficha, Dialogo) está abierto, y lo restaura al cerrar.
 *
 * Motivación: al abrir una ficha o un diálogo sobre el mapa, el contenido de
 * fondo no debe desplazarse. En la práctica el `body` ya usa `overflow: hidden`
 * en el layout fijo de la app, pero este hook lo garantiza de forma explícita y
 * componible, incluso si en el futuro el documento permitiera scroll.
 *
 * Usa un CONTADOR de referencias a nivel de módulo: si hay varios overlays
 * abiertos a la vez (p. ej. un Drawer y un Dialogo encima), el scroll solo se
 * restaura cuando TODOS se han cerrado. Así evitamos que cerrar uno reactive el
 * scroll mientras otro sigue abierto.
 *
 * Es seguro en entornos sin `document` (SSR): simplemente no hace nada.
 */

import { useEffect } from 'react';

/** Clase aplicada al body mientras el scroll está bloqueado. */
const CLASE_BLOQUEO = 'scroll-bloqueado';

/** Número de overlays que actualmente solicitan el bloqueo. */
let contadorBloqueos = 0;

/** Activa el bloqueo (idempotente respecto a la clase del body). */
function activarBloqueo(): void {
  if (typeof document === 'undefined') return;
  contadorBloqueos += 1;
  document.body.classList.add(CLASE_BLOQUEO);
}

/** Libera un bloqueo; restaura el scroll solo cuando no quedan solicitudes. */
function liberarBloqueo(): void {
  if (typeof document === 'undefined') return;
  contadorBloqueos = Math.max(0, contadorBloqueos - 1);
  if (contadorBloqueos === 0) {
    document.body.classList.remove(CLASE_BLOQUEO);
  }
}

/**
 * Bloquea el scroll de fondo mientras `activo` sea `true`. Al desmontar o al
 * pasar a `false`, libera su solicitud de bloqueo.
 *
 * @param activo Si el overlay que usa el hook está abierto.
 */
export function useBloqueoScroll(activo: boolean): void {
  useEffect(() => {
    if (!activo) return;
    activarBloqueo();
    return liberarBloqueo;
  }, [activo]);
}
