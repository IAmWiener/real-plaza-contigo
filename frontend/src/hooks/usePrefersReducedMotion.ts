/**
 * Hook `usePrefersReducedMotion`: indica si el usuario ha solicitado reducir el
 * movimiento de la interfaz mediante la media query
 * `(prefers-reduced-motion: reduce)`.
 *
 * Reacciona a cambios en tiempo real y maneja entornos sin `matchMedia` (SSR o
 * navegadores antiguos) devolviendo `false`.
 */

import { useEffect, useState } from 'react';

/** Media query que indica preferencia por movimiento reducido. */
const CONSULTA = '(prefers-reduced-motion: reduce)';

/** Lee el valor actual de la preferencia de forma segura. */
function leerPreferencia(): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }
  return window.matchMedia(CONSULTA).matches;
}

/**
 * Devuelve `true` si el usuario prefiere movimiento reducido, `false` en caso
 * contrario o si la media query no está disponible.
 */
export function usePrefersReducedMotion(): boolean {
  const [reducido, setReducido] = useState<boolean>(leerPreferencia);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const mql = window.matchMedia(CONSULTA);

    const alCambiar = (evento: MediaQueryListEvent) => {
      setReducido(evento.matches);
    };

    // Sincroniza por si el valor cambió entre el render inicial y el efecto.
    setReducido(mql.matches);

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', alCambiar);
      return () => mql.removeEventListener('change', alCambiar);
    }

    // Fallback para navegadores antiguos (API obsoleta de MediaQueryList).
    mql.addListener(alCambiar);
    return () => mql.removeListener(alCambiar);
  }, []);

  return reducido;
}
