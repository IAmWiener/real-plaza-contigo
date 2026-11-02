/**
 * Hook `useEsMobile`: indica si el viewport está por debajo del breakpoint de
 * escritorio (por defecto 768px, el `md` de Tailwind).
 *
 * Reacciona a cambios de tamaño en tiempo real mediante `matchMedia` y maneja
 * entornos sin `matchMedia` (SSR o navegadores antiguos) devolviendo `false`
 * (asume escritorio para no romper el render inicial en servidor).
 *
 * Se usa para orquestar, solo en móvil, comportamientos que no pueden
 * resolverse con clases CSS (p. ej. mostrar un único panel flotante a la vez).
 */

import { useEffect, useState } from 'react';

/** Ancho máximo (px) considerado "móvil"; coincide con el breakpoint `md`. */
const ANCHO_MOVIL = 767;

/** Media query de móvil derivada del ancho máximo. */
const CONSULTA = `(max-width: ${ANCHO_MOVIL}px)`;

/** Lee el valor actual de la media query de forma segura. */
function leer(): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }
  return window.matchMedia(CONSULTA).matches;
}

/**
 * Devuelve `true` si el viewport es de ancho móvil (< 768px), `false` en caso
 * contrario o si `matchMedia` no está disponible.
 */
export function useEsMobile(): boolean {
  const [esMobile, setEsMobile] = useState<boolean>(leer);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const mql = window.matchMedia(CONSULTA);
    const alCambiar = (evento: MediaQueryListEvent) => setEsMobile(evento.matches);

    // Sincroniza por si cambió entre el render inicial y el efecto.
    setEsMobile(mql.matches);

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', alCambiar);
      return () => mql.removeEventListener('change', alCambiar);
    }

    // Fallback para navegadores antiguos (API obsoleta de MediaQueryList).
    mql.addListener(alCambiar);
    return () => mql.removeListener(alCambiar);
  }, []);

  return esMobile;
}
