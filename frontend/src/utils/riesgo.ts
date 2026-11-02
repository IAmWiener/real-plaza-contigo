/**
 * Catálogo visual de los tipos de incidente de riesgo.
 *
 * Centraliza, por cada `TipoIncidente`, su identidad visual: icono de
 * `lucide-react` (para la UI en React), color de acento, un glifo/emoji de
 * respaldo (para los `divIcon` de Leaflet, que son HTML plano y no pueden
 * renderizar componentes React) y una descripción corta de ayuda.
 *
 * Este módulo es la fuente única para el selector de tipo con iconos (estilo
 * cuadrícula de pastillas circulares), el marcador del mapa y la ficha de
 * detalle, de modo que el tipo se comunique siempre con icono + color + texto
 * (nunca solo color; Req. 14.1).
 *
 * Todos los reportes son ficticios y de demostración.
 */

import {
  Waves,
  Mountain,
  Flame,
  Activity,
  Construction,
  CircleHelp,
  type LucideIcon,
} from 'lucide-react';

import type { TipoIncidente, SeveridadRiesgo } from '@/types/domain';

/** Identidad visual de un tipo de incidente. */
export interface EstiloTipoIncidente {
  /** Componente de icono de lucide-react para la UI. */
  icono: LucideIcon;
  /** Color de acento (hex) del tipo. Usado en pastillas, marcador y ficha. */
  color: string;
  /** Glifo/emoji de respaldo para contextos de HTML plano (divIcon Leaflet). */
  glifo: string;
  /** Descripción breve de apoyo mostrada bajo el selector. */
  descripcion: string;
}

/**
 * Mapa de identidad visual por tipo de incidente. Los colores se eligieron para
 * ser distinguibles entre sí y con buen contraste sobre blanco; no sustituyen a
 * la etiqueta textual, que siempre acompaña al icono.
 */
export const ESTILO_TIPO_INCIDENTE: Record<TipoIncidente, EstiloTipoIncidente> = {
  inundacion: {
    icono: Waves,
    color: '#2563EB',
    glifo: '🌊',
    descripcion: 'Desborde o acumulación de agua.',
  },
  derrumbe: {
    icono: Mountain,
    color: '#92400E',
    glifo: '⛰️',
    descripcion: 'Deslizamiento de tierra o colapso.',
  },
  incendio: {
    icono: Flame,
    color: '#EA580C',
    glifo: '🔥',
    descripcion: 'Fuego activo o riesgo de propagación.',
  },
  sismo: {
    icono: Activity,
    color: '#7C3AED',
    glifo: '〰️',
    descripcion: 'Movimiento sísmico o estructura dañada.',
  },
  via_bloqueada: {
    icono: Construction,
    color: '#CA8A04',
    glifo: '🚧',
    descripcion: 'Camino cerrado o intransitable.',
  },
  otro: {
    icono: CircleHelp,
    color: '#64748B',
    glifo: '❓',
    descripcion: 'Incidente no listado en las categorías.',
  },
};

/** Orden de presentación de los tipos en el selector y listados. */
export const ORDEN_TIPO_INCIDENTE: TipoIncidente[] = [
  'inundacion',
  'incendio',
  'derrumbe',
  'sismo',
  'via_bloqueada',
  'otro',
];

/** Acceso cómodo al estilo de un tipo, con respaldo en `otro`. */
export function estiloTipo(tipo: TipoIncidente): EstiloTipoIncidente {
  return ESTILO_TIPO_INCIDENTE[tipo] ?? ESTILO_TIPO_INCIDENTE.otro;
}

/**
 * Color (hex) asociado a cada nivel de severidad. Replica los tokens `risk.*`
 * de Tailwind para contextos que necesitan el valor crudo (p. ej. estilos
 * inline de los `divIcon` de Leaflet).
 */
export const COLOR_SEVERIDAD: Record<SeveridadRiesgo, string> = {
  bajo: '#2563EB',
  medio: '#D97706',
  alto: '#DC2626',
  critico: '#7F1D1D',
};

/**
 * Peso visual (1-4) asociado a la severidad. Permite comunicar el nivel con una
 * cantidad/forma además del color (accesibilidad).
 */
export const PESO_SEVERIDAD: Record<SeveridadRiesgo, number> = {
  bajo: 1,
  medio: 2,
  alto: 3,
  critico: 4,
};
