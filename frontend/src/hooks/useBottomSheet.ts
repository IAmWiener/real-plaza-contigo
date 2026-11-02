/**
 * Hook `useBottomSheet`: convierte un panel en una "hoja inferior" (bottom
 * sheet) arrastrable con el dedo en móvil, con posiciones de anclaje
 * (min / medio / expandido).
 *
 * Devuelve la altura actual en píxeles (`alturaPx`) para aplicarla al panel, la
 * posición de anclaje activa, si se está arrastrando y los manejadores para el
 * asidero (grabber). En escritorio (`habilitado = false`) no interviene y
 * `alturaPx` es `null`, de modo que el panel conserva su layout de escritorio.
 *
 * Usa Pointer Events (funcionan para toque y ratón). Al soltar, ancla a la
 * posición más cercana; un gesto corto (toque) alterna entre minimizado y medio.
 * Es seguro en entornos sin `window` (SSR): no hace nada.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

/** Posiciones de anclaje de la hoja inferior. */
export type PosicionSheet = 'min' | 'medio' | 'expandido';

/** Orden de las posiciones, de menor a mayor altura. */
const ORDEN: PosicionSheet[] = ['min', 'medio', 'expandido'];

/** Fracción del alto del viewport que ocupa cada posición. */
const FRACCIONES: Record<PosicionSheet, number> = {
  min: 0.14,
  medio: 0.55,
  expandido: 0.92,
};

/** Desplazamiento mínimo (px) para considerar el gesto como arrastre y no toque. */
const UMBRAL_ARRASTRE = 40;

/** Valor devuelto por el hook. */
export interface UseBottomSheet {
  /** Altura actual en píxeles, o `null` en escritorio. */
  alturaPx: number | null;
  /** Posición de anclaje activa. */
  posicion: PosicionSheet;
  /** Si el usuario está arrastrando la hoja en este momento. */
  arrastrando: boolean;
  /** Ancla la hoja a una posición concreta. */
  irA: (posicion: PosicionSheet) => void;
  /** Alterna entre minimizado y medio (p. ej. al tocar el asidero). */
  alternar: () => void;
  /** Manejador `onPointerDown` para el asidero (grabber). */
  onPointerDown: (evento: ReactPointerEvent) => void;
}

/** Alto del viewport de forma segura (0 en SSR). */
function altoViewport(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight;
}

/** Altura en píxeles de una posición de anclaje para un viewport dado. */
function alturaDePosicion(posicion: PosicionSheet, vh: number): number {
  return Math.round(FRACCIONES[posicion] * vh);
}

/**
 * Gestiona el estado y los gestos de una hoja inferior arrastrable.
 *
 * @param habilitado Si la hoja está activa (normalmente, solo en móvil).
 * @param posicionInicial Posición de anclaje inicial.
 */
export function useBottomSheet(
  habilitado: boolean,
  posicionInicial: PosicionSheet = 'medio',
): UseBottomSheet {
  const [posicion, setPosicion] = useState<PosicionSheet>(posicionInicial);
  const [arrastrando, setArrastrando] = useState(false);
  const [alturaArrastre, setAlturaArrastre] = useState<number | null>(null);
  const [vh, setVh] = useState<number>(altoViewport);

  const inicioY = useRef(0);
  const alturaInicio = useRef(0);
  const ultimaAltura = useRef(0);

  // Mantiene el alto del viewport actualizado (rotación, barra de URL, resize).
  useEffect(() => {
    if (!habilitado) return;
    const alRedimensionar = () => setVh(altoViewport());
    alRedimensionar();
    window.addEventListener('resize', alRedimensionar);
    window.addEventListener('orientationchange', alRedimensionar);
    return () => {
      window.removeEventListener('resize', alRedimensionar);
      window.removeEventListener('orientationchange', alRedimensionar);
    };
  }, [habilitado]);

  const irA = useCallback((siguiente: PosicionSheet) => {
    setPosicion(siguiente);
    setAlturaArrastre(null);
  }, []);

  const alternar = useCallback(() => {
    setPosicion((actual) => (actual === 'min' ? 'medio' : 'min'));
    setAlturaArrastre(null);
  }, []);

  // Ancla a la posición cuya altura está más cerca de la altura dada.
  const anclarMasCercano = useCallback(
    (altura: number) => {
      let mejor: PosicionSheet = 'medio';
      let menorDist = Infinity;
      for (const p of ORDEN) {
        const dist = Math.abs(alturaDePosicion(p, vh) - altura);
        if (dist < menorDist) {
          menorDist = dist;
          mejor = p;
        }
      }
      irA(mejor);
    },
    [vh, irA],
  );

  const onPointerMove = useCallback(
    (evento: PointerEvent) => {
      // Arrastrar hacia arriba aumenta la altura (la hoja crece).
      const delta = inicioY.current - evento.clientY;
      const altoMax = alturaDePosicion('expandido', vh);
      const altoMin = alturaDePosicion('min', vh);
      const nueva = Math.max(
        altoMin,
        Math.min(altoMax, alturaInicio.current + delta),
      );
      ultimaAltura.current = nueva;
      setAlturaArrastre(nueva);
    },
    [vh],
  );

  const onPointerUp = useCallback(() => {
    setArrastrando(false);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    const recorrido = ultimaAltura.current - alturaInicio.current;
    // Gesto corto = toque: alterna entre minimizado y medio.
    if (Math.abs(recorrido) < UMBRAL_ARRASTRE) {
      setAlturaArrastre(null);
      setPosicion((actual) => (actual === 'min' ? 'medio' : 'min'));
      return;
    }
    anclarMasCercano(ultimaAltura.current);
  }, [onPointerMove, anclarMasCercano]);

  const onPointerDown = useCallback(
    (evento: ReactPointerEvent) => {
      if (!habilitado) return;
      evento.preventDefault();
      inicioY.current = evento.clientY;
      alturaInicio.current = alturaDePosicion(posicion, vh);
      ultimaAltura.current = alturaInicio.current;
      setArrastrando(true);
      setAlturaArrastre(alturaInicio.current);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [habilitado, posicion, vh, onPointerMove, onPointerUp],
  );

  // Limpieza defensiva de listeners al desmontar.
  useEffect(
    () => () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    },
    [onPointerMove, onPointerUp],
  );

  const alturaPx = useMemo(() => {
    if (!habilitado) return null;
    if (alturaArrastre != null) return alturaArrastre;
    return alturaDePosicion(posicion, vh);
  }, [habilitado, alturaArrastre, posicion, vh]);

  return { alturaPx, posicion, arrastrando, irA, alternar, onPointerDown };
}
