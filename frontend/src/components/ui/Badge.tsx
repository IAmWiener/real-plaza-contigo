/**
 * `Badge`: etiqueta compacta que comunica un estado o nivel combinando un icono
 * (ReactNode de lucide) con una etiqueta textual. El color acompaña, pero nunca
 * sustituye, al texto: la información crítica siempre es legible sin depender
 * del color (Req. 14.1).
 *
 * Tonos disponibles:
 * - Estado operativo de acopio: `operativo`, `limitado`, `saturado`, `cerrado`.
 * - Severidad de riesgo: `bajo`, `medio`, `alto`, `critico`.
 * - Neutro: `neutro` (informativo).
 *
 * Para mapear directamente desde los enums del dominio se exportan dos
 * helpers (`tonoDesdeEstado`, `tonoDesdeSeveridad`).
 */

/*
 * Este módulo co-exporta el componente `Badge` junto con dos helpers de mapeo
 * (`tonoDesdeEstado`, `tonoDesdeSeveridad`) muy acoplados a él. Se desactiva la
 * regla de fast-refresh en este archivo de forma deliberada: los helpers son
 * funciones puras sin estado y no afectan al refresco en caliente en la práctica.
 */
/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import type { EstadoOperativo, SeveridadRiesgo } from '@/types/domain';

/** Tono visual del badge. */
export type TonoBadge =
  | 'operativo'
  | 'limitado'
  | 'saturado'
  | 'cerrado'
  | 'bajo'
  | 'medio'
  | 'alto'
  | 'critico'
  | 'neutro';

export interface BadgeProps {
  /** Tono/color del badge según estado o severidad. */
  tono: TonoBadge;
  /** Icono opcional (ReactNode de lucide) mostrado antes del texto. */
  icono?: ReactNode;
  /** Etiqueta textual (obligatoria: el texto siempre comunica el estado). */
  children: ReactNode;
  /** Clases adicionales. */
  className?: string;
}

/**
 * Clases de color por tono. Cada tono usa un fondo suave y un texto de alto
 * contraste del mismo color de estado/severidad definido en el tema de
 * Tailwind (`status.*`, `risk.*`).
 */
const CLASES_TONO: Record<TonoBadge, string> = {
  operativo: 'bg-status-operativo/10 text-status-operativo',
  limitado: 'bg-status-limitado/10 text-status-limitado',
  saturado: 'bg-status-saturado/10 text-status-saturado',
  cerrado: 'bg-status-cerrado/10 text-status-cerrado',
  bajo: 'bg-risk-bajo/10 text-risk-bajo',
  medio: 'bg-risk-medio/10 text-risk-medio',
  alto: 'bg-risk-alto/10 text-risk-alto',
  critico: 'bg-risk-critico/10 text-risk-critico',
  neutro: 'bg-surface-subtle text-ink-soft',
};

/** Mapea un `EstadoOperativo` del dominio al tono de badge correspondiente. */
export function tonoDesdeEstado(estado: EstadoOperativo): TonoBadge {
  switch (estado) {
    case 'operativo':
      return 'operativo';
    case 'capacidad_limitada':
      return 'limitado';
    case 'saturado':
      return 'saturado';
    case 'cerrado':
      return 'cerrado';
  }
}

/** Mapea una `SeveridadRiesgo` del dominio al tono de badge correspondiente. */
export function tonoDesdeSeveridad(severidad: SeveridadRiesgo): TonoBadge {
  return severidad;
}

/**
 * Badge de estado/severidad con icono + texto. El contenido textual es
 * obligatorio para no depender solo del color.
 */
export function Badge({ tono, icono, children, className }: BadgeProps) {
  const clases = [
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
    'text-xs font-medium whitespace-nowrap',
    CLASES_TONO[tono],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={clases}>
      {icono && (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {icono}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
