/**
 * Rutas/vistas de la aplicación Real Plaza Contigo.
 *
 * El tipo `Vista` ya está definido en `@/types/ui` ('mapa' | 'administracion').
 * Para evitar duplicarlo, aquí se reexporta como punto único de acceso desde la
 * capa de aplicación (`app/`) y se añaden las constantes útiles asociadas a la
 * navegación entre vistas.
 */

import type { Vista } from '@/types/ui';

// Reexporta el tipo de vista sin duplicar su definición.
export type { Vista };

/** Vista con la que arranca la aplicación: el mapa interactivo (Req. 10.1). */
export const VISTA_INICIAL: Vista = 'mapa';

/** Lista de todas las vistas disponibles, útil para recorrer o validar. */
export const VISTAS: readonly Vista[] = [
  'mapa',
  'resumen',
  'administracion',
] as const;

/**
 * Comprueba si un valor corresponde a una `Vista` válida. Útil para validar
 * entradas externas (p. ej. parámetros de URL o almacenamiento) antes de
 * usarlas como vista activa.
 */
export function esVista(valor: unknown): valor is Vista {
  return valor === 'mapa' || valor === 'administracion' || valor === 'resumen';
}
