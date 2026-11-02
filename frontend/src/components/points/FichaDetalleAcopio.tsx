/**
 * `FichaDetalleAcopio`: ficha de detalle de un centro de acopio.
 *
 * Se presenta dentro de un `Drawer` (drawer lateral en escritorio / bottom
 * sheet en móvil, Req. 13.4) y muestra TODA la información del punto resuelta
 * por ID (sede, aliados, categorías, evento y recursos ya vienen resueltos en
 * `PuntoAcopioVista`). La información se ordena con jerarquía
 * estado → ubicación → recursos → disponibilidad (Req. 7.1, 7.2).
 *
 * El RUC de la sede y el teléfono de contacto se marcan explícitamente como
 * datos ficticios de demostración (Req. 7.3, 15.2).
 *
 * Acciones disponibles (Req. 7.4–7.9):
 * - "Cómo llegar": abre Google Maps hacia las coordenadas del punto.
 * - "Copiar dirección": copia la dirección al portapapeles.
 * - "Compartir punto": usa la Web Share API o, como respaldo, copia un enlace.
 * - "Ver evento": abre la ficha del evento asociado (solo si existe).
 * - Cerrar: oculta la ficha; el `Drawer` devuelve el foco al cerrarse.
 *
 * El acceso al portapapeles y a la Web Share API se protege con `try/catch` y
 * se informa el resultado con un toast (Req. 7.5–7.7).
 *
 * IMPORTANTE: todos los datos mostrados son ficticios y de demostración; no
 * representan operaciones, sedes ni emergencias reales de Real Plaza.
 */

import {
  Navigation,
  Copy,
  Share2,
  Calendar,
  MapPin,
  Clock,
  Phone,
  User,
  Package,
  Building2,
  Users,
  Boxes,
  Info,
  CircleAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Drawer, Boton, Badge, tonoDesdeEstado } from '@/components/ui';
import type { PuntoAcopioVista } from '@/types/ui';
import type { EstadoDisponibilidad } from '@/types/domain';
import {
  etiquetaEstadoOperativo,
  etiquetaTipoDesastre,
  formatearFecha,
  urlComoLlegar,
} from '@/utils/format';

/** Tipo de toast que la ficha puede solicitar al contenedor. */
export type TipoToastFicha = 'exito' | 'error';

export interface FichaDetalleAcopioProps {
  /** Punto de acopio a mostrar (ya resuelto), o `null` si no hay selección. */
  punto: PuntoAcopioVista | null;
  /** Si la ficha está visible. */
  abierto: boolean;
  /** Cierra la ficha (el `Drawer` devuelve el foco). */
  onCerrar: () => void;
  /** Muestra un toast de éxito o error con un mensaje. */
  onMostrarToast: (tipo: TipoToastFicha, mensaje: string) => void;
  /** Abre la ficha del evento asociado por su identificador. */
  onVerEvento: (eventoId: string) => void;
}

/** Etiqueta legible para el estado de disponibilidad de un recurso. */
const etiquetaDisponibilidad: Record<EstadoDisponibilidad, string> = {
  disponible: 'Disponible',
  bajo: 'Nivel bajo',
  agotado: 'Agotado',
};

/** Tono de badge para el estado de disponibilidad de un recurso. */
function tonoDisponibilidad(
  estado: EstadoDisponibilidad,
): 'operativo' | 'limitado' | 'saturado' {
  switch (estado) {
    case 'disponible':
      return 'operativo';
    case 'bajo':
      return 'limitado';
    case 'agotado':
      return 'saturado';
  }
}

/**
 * Sección con título e icono. Agrupa visualmente los bloques de la ficha para
 * reforzar la jerarquía de la información.
 */
function Seccion({
  titulo,
  icono,
  children,
}: {
  titulo: string;
  icono: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-surface-border pt-4 first:border-t-0 first:pt-0">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="inline-flex shrink-0 text-ink-soft" aria-hidden="true">
          {icono}
        </span>
        {titulo}
      </h3>
      {children}
    </section>
  );
}

/** Fila etiqueta/valor para datos simples dentro de una sección. */
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

/** Nota que marca un dato como ficticio / de demostración (Req. 15.2). */
function MarcaFicticia({ children }: { children: ReactNode }) {
  return (
    <span className="ml-1 inline-flex items-center gap-1 text-[11px] text-ink-soft">
      <Info className="h-3 w-3" aria-hidden="true" />
      {children}
    </span>
  );
}

/**
 * Ficha de detalle de un centro de acopio dentro de un `Drawer` responsive.
 */
export function FichaDetalleAcopio({
  punto,
  abierto,
  onCerrar,
  onMostrarToast,
  onVerEvento,
}: FichaDetalleAcopioProps) {
  // El `Drawer` siempre se renderiza para manejar su animación de salida; sin
  // punto seleccionado no hay contenido que mostrar.
  const titulo = punto ? punto.nombre : 'Detalle del punto';

  /** Copia la dirección del punto al portapapeles con manejo de errores. */
  async function copiarDireccion() {
    if (!punto) return;
    try {
      if (!navigator.clipboard) {
        throw new Error('Portapapeles no soportado');
      }
      await navigator.clipboard.writeText(punto.direccion);
      onMostrarToast('exito', 'Dirección copiada al portapapeles');
    } catch {
      onMostrarToast('error', 'No se pudo copiar la dirección');
    }
  }

  /**
   * Comparte el punto con la Web Share API; si no está soportada o se rechaza,
   * cae al respaldo de copiar un enlace al portapapeles.
   */
  async function compartirPunto() {
    if (!punto) return;
    const enlace = `${location.origin}?acopio=${punto.id}`;
    const texto = `${punto.nombre} — ${punto.direccion}`;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: punto.nombre,
          text: texto,
          url: enlace,
        });
        return;
      } catch {
        // El usuario pudo cancelar el diálogo de compartir; se intenta el
        // respaldo de copiar el enlace para no dejar la acción sin efecto.
      }
    }

    try {
      if (!navigator.clipboard) {
        throw new Error('Portapapeles no soportado');
      }
      await navigator.clipboard.writeText(enlace);
      onMostrarToast('exito', 'Enlace del punto copiado al portapapeles');
    } catch {
      onMostrarToast('error', 'No se pudo compartir el punto');
    }
  }

  return (
    <Drawer
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={titulo}
      etiquetaCerrar="Cerrar ficha del punto de acopio"
    >
      {punto && (
        <div className="flex flex-col gap-4">
          {/* --- Jerarquía 1: Estado --- */}
          <Seccion titulo="Estado" icono={<CircleAlert className="h-4 w-4" />}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tono={tonoDesdeEstado(punto.estado)}>
                {etiquetaEstadoOperativo[punto.estado]}
              </Badge>
              <span className="text-xs text-ink-soft">
                Código: <span className="font-medium text-ink">{punto.codigo}</span>
              </span>
            </div>

            {punto.categorias.length > 0 && (
              <div className="mt-3">
                <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-soft">
                  Categorías atendidas
                </dt>
                <ul className="flex flex-wrap gap-1.5">
                  {punto.categorias.map((categoria) => (
                    <li key={categoria.id}>
                      <Badge tono="neutro" icono={<Package className="h-3 w-3" />}>
                        {categoria.nombre}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Seccion>

          {/* --- Responsables: sede y aliados --- */}
          <Seccion
            titulo="Responsables"
            icono={<Building2 className="h-4 w-4" />}
          >
            <dl>
              <Dato etiqueta="Sede responsable">
                {punto.sede ? (
                  <span className="flex flex-col">
                    <span>{punto.sede.nombre}</span>
                    <span className="text-xs text-ink-soft">
                      RUC {punto.sede.ruc}
                      <MarcaFicticia>dato ficticio de demostración</MarcaFicticia>
                    </span>
                  </span>
                ) : (
                  <span className="text-ink-soft">Sin sede asignada</span>
                )}
              </Dato>

              {punto.aliados.length > 0 && (
                <Dato etiqueta="Aliados participantes">
                  <ul className="flex flex-wrap gap-1.5">
                    {punto.aliados.map((aliado) => (
                      <li key={aliado.id}>
                        <Badge tono="neutro" icono={<Users className="h-3 w-3" />}>
                          {aliado.nombre}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </Dato>
              )}
            </dl>
          </Seccion>

          {/* Evento asociado + tipo de desastre */}
          {punto.evento && (
            <Seccion titulo="Evento asociado" icono={<Calendar className="h-4 w-4" />}>
              <dl>
                <Dato etiqueta="Evento">{punto.evento.nombre}</Dato>
                <Dato etiqueta="Tipo de desastre">
                  {etiquetaTipoDesastre[punto.evento.tipo]}
                </Dato>
              </dl>
              <Boton
                variante="secundario"
                tamano="sm"
                icono={<Calendar className="h-4 w-4" />}
                onClick={() => onVerEvento(punto.evento!.id)}
                className="mt-2"
              >
                Ver evento
              </Boton>
            </Seccion>
          )}

          {/* --- Jerarquía 2: Ubicación --- */}
          <Seccion titulo="Ubicación" icono={<MapPin className="h-4 w-4" />}>
            <dl>
              <Dato etiqueta="Dirección">{punto.direccion}</Dato>
              <Dato etiqueta="Distrito">{punto.distrito}</Dato>
              <Dato etiqueta="Coordenadas">
                {punto.coordenada.lat.toFixed(5)}, {punto.coordenada.lng.toFixed(5)}
              </Dato>
            </dl>
          </Seccion>

          {/* Horario y contacto */}
          <Seccion titulo="Horario y contacto" icono={<Clock className="h-4 w-4" />}>
            <dl>
              <Dato etiqueta="Horario de atención">{punto.horario}</Dato>
              <Dato etiqueta="Contacto">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                  {punto.contactoNombre}
                </span>
              </Dato>
              <Dato etiqueta="Teléfono">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                  {punto.contactoTelefono}
                  <MarcaFicticia>teléfono ficticio de demostración</MarcaFicticia>
                </span>
              </Dato>
            </dl>
          </Seccion>

          {/* --- Jerarquía 3: Recursos --- */}
          <Seccion titulo="Recursos disponibles" icono={<Boxes className="h-4 w-4" />}>
            {punto.recursos.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {punto.recursos.map((recurso) => (
                  <li
                    key={recurso.id}
                    className="rounded-xl border border-surface-border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-ink">
                        {recurso.nombre}
                      </span>
                      <Badge tono={tonoDisponibilidad(recurso.estado)}>
                        {etiquetaDisponibilidad[recurso.estado]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-soft">
                      Disponible: {recurso.cantidadDisponible} {recurso.unidad}
                      {recurso.cantidadComprometida > 0 && (
                        <>
                          {' · '}Comprometido: {recurso.cantidadComprometida}{' '}
                          {recurso.unidad}
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-soft">
                Sin recursos registrados para este punto.
              </p>
            )}
          </Seccion>

          {/* --- Jerarquía 4: Disponibilidad / ocupación --- */}
          <Seccion titulo="Disponibilidad" icono={<Info className="h-4 w-4" />}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">Nivel de ocupación</span>
              <span className="font-semibold text-ink">{punto.ocupacionPct}%</span>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-subtle"
              role="progressbar"
              aria-valuenow={punto.ocupacionPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Nivel de ocupación del punto de acopio"
            >
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${punto.ocupacionPct}%` }}
              />
            </div>
            <dl className="mt-3">
              <Dato etiqueta="Capacidad">
                {punto.ocupacion} / {punto.capacidad}
              </Dato>
              <Dato etiqueta="Última actualización">
                {formatearFecha(punto.actualizadoEn)}
                <MarcaFicticia>fecha simulada</MarcaFicticia>
              </Dato>
              {punto.observaciones && (
                <Dato etiqueta="Observaciones">{punto.observaciones}</Dato>
              )}
            </dl>
          </Seccion>

          {/* --- Acciones --- */}
          <div className="sticky bottom-0 -mx-4 -mb-4 flex flex-wrap gap-2 border-t border-surface-border bg-surface px-4 py-3">
            <Boton
              variante="primario"
              tamano="sm"
              icono={<Navigation className="h-4 w-4" />}
              onClick={() =>
                window.open(urlComoLlegar(punto.coordenada), '_blank', 'noopener')
              }
            >
              Cómo llegar
            </Boton>
            <Boton
              variante="secundario"
              tamano="sm"
              icono={<Copy className="h-4 w-4" />}
              onClick={copiarDireccion}
            >
              Copiar dirección
            </Boton>
            <Boton
              variante="secundario"
              tamano="sm"
              icono={<Share2 className="h-4 w-4" />}
              onClick={compartirPunto}
            >
              Compartir punto
            </Boton>
          </div>
        </div>
      )}
    </Drawer>
  );
}
