/**
 * `FichaEvento`: ficha de detalle de un evento o desastre natural asociado a un
 * punto de acopio.
 *
 * Se presenta dentro de un `Drawer` (drawer lateral en escritorio / bottom
 * sheet en móvil, Req. 13.4) y muestra el nombre, el tipo de desastre, la
 * descripción, la fecha de inicio, el estado y la zona afectada del evento.
 *
 * IMPORTANTE: todos los datos mostrados son ficticios y de demostración; no
 * representan eventos, emergencias ni ubicaciones reales de Real Plaza
 * (Req. 15.2).
 */

import { Calendar, MapPin, Info, Activity } from 'lucide-react';
import type { ReactNode } from 'react';
import { Drawer, Badge } from '@/components/ui';
import type { Evento } from '@/types/domain';
import {
  etiquetaTipoDesastre,
  etiquetaEstadoEvento,
  formatearFecha,
} from '@/utils/format';

export interface FichaEventoProps {
  /** Evento a mostrar, o `null` si no hay evento seleccionado. */
  evento: Evento | null;
  /** Si la ficha está visible. */
  abierto: boolean;
  /** Cierra la ficha (el `Drawer` devuelve el foco). */
  onCerrar: () => void;
}

/** Fila etiqueta/valor para datos simples dentro de la ficha. */
function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">
        {etiqueta}
      </dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

/**
 * Ficha de detalle de un evento dentro de un `Drawer` responsive.
 */
export function FichaEvento({ evento, abierto, onCerrar }: FichaEventoProps) {
  const titulo = evento ? evento.nombre : 'Detalle del evento';

  return (
    <Drawer
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={titulo}
      etiquetaCerrar="Cerrar ficha del evento"
    >
      {evento && (
        <div className="flex flex-col gap-4">
          {/* Nota de datos ficticios de demostración (Req. 15.2). */}
          <p className="flex items-center gap-1.5 rounded-xl bg-surface-subtle px-3 py-2 text-xs text-ink-soft">
            <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
            Evento ficticio de demostración. No representa una emergencia real.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tono="neutro" icono={<Calendar className="h-3 w-3" />}>
              {etiquetaTipoDesastre[evento.tipo]}
            </Badge>
            <Badge tono="neutro" icono={<Activity className="h-3 w-3" />}>
              {etiquetaEstadoEvento[evento.estado]}
            </Badge>
          </div>

          <dl>
            <Dato etiqueta="Descripción">{evento.descripcion}</Dato>
            <Dato etiqueta="Fecha de inicio">
              {formatearFecha(evento.fechaInicio)}
            </Dato>
            <Dato etiqueta="Zona afectada">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                {evento.zonaAfectada}
              </span>
            </Dato>
          </dl>
        </div>
      )}
    </Drawer>
  );
}
