/**
 * `FichaDetalleRiesgo`: ficha de detalle de un punto/zona de riesgo reportado.
 *
 * Se muestra dentro del `Drawer` compartido (drawer lateral en escritorio,
 * bottom sheet en móvil). Presenta la información del reporte priorizando
 * severidad → ubicación → estado, y deja claro que es un **reporte ciudadano de
 * demostración** (Req. 8.2, 15.2).
 *
 * Información mostrada (Req. 8.1):
 * - Tipo de incidente (`etiquetaTipoIncidente`).
 * - Severidad con etiqueta textual + icono mediante `Badge` (`tonoDesdeSeveridad`
 *   + `etiquetaSeveridad`), sin depender solo del color (Req. 14.1).
 * - Descripción del incidente.
 * - Distrito y coordenadas del centro del área.
 * - Radio perimetral afectado (`radioMetros`, formateado en metros/km).
 * - Fecha y hora del reporte (`formatearFecha`).
 * - Estado del reporte (`etiquetaEstadoReporte`) con `Badge`.
 *
 * Acciones (Req. 8.3–8.7):
 * - "Cómo llegar": abre Google Maps con las coordenadas (`urlComoLlegar`).
 * - "Compartir": usa `navigator.share` si existe; si no, copia el enlace al
 *   portapapeles (`${origin}?riesgo=${id}`) y muestra un toast.
 * - "Resolver" y "Eliminar reporte": cada una confirma con el `Dialogo` antes de
 *   invocar el handler correspondiente, que llama a la Capa de Servicios y
 *   refresca mapa y lista.
 * - Cerrar: devuelve el control al mapa (`onCerrar`).
 */

import { useState } from 'react';
import {
  Navigation,
  Share2,
  CheckCircle2,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import type { PuntoRiesgo } from '@/types/domain';
import {
  etiquetaTipoIncidente,
  etiquetaSeveridad,
  etiquetaEstadoReporte,
  formatearFecha,
  urlComoLlegar,
} from '@/utils/format';
import { estiloTipo } from '@/utils/riesgo';
import type { TipoToast } from '@/hooks/useToasts';
import { Drawer, Boton, Badge, tonoDesdeSeveridad, Dialogo } from '@/components/ui';

/** Acción destructiva pendiente de confirmación en el `Dialogo`. */
type AccionPendiente = 'resolver' | 'eliminar' | null;

export interface FichaDetalleRiesgoProps {
  /** Punto de riesgo a mostrar; `null` cuando no hay selección. */
  punto: PuntoRiesgo | null;
  /** Si la ficha está visible. */
  abierto: boolean;
  /** Cierra la ficha y devuelve el foco al mapa. */
  onCerrar: () => void;
  /** Muestra un toast de éxito/error/información. */
  onMostrarToast: (tipo: TipoToast, mensaje: string) => void;
  /** Resuelve el reporte (lo marca como `resuelto`) vía la Capa de Servicios. */
  onResolver: (id: string) => void | Promise<void>;
  /** Elimina el reporte vía la Capa de Servicios. */
  onEliminar: (id: string) => void | Promise<void>;
}

/** Formatea el radio perimetral en metros o kilómetros según su magnitud. */
function formatearRadio(radioMetros: number): string {
  if (radioMetros >= 1000) {
    const km = radioMetros / 1000;
    // Hasta un decimal, sin ceros innecesarios (p. ej. "1.5 km", "2 km").
    const texto = km
      .toFixed(1)
      .replace(/\.0$/, '')
      .replace('.', ',');
    return `${texto} km`;
  }
  return `${Math.round(radioMetros)} m`;
}

/** Formatea una coordenada a una cadena legible con 5 decimales. */
function formatearCoordenada(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/**
 * Ficha de detalle de un punto de riesgo con información jerarquizada y acciones
 * de "Cómo llegar", "Compartir" y "Resolver/Eliminar" (con confirmación).
 */
export function FichaDetalleRiesgo({
  punto,
  abierto,
  onCerrar,
  onMostrarToast,
  onResolver,
  onEliminar,
}: FichaDetalleRiesgoProps) {
  /** Acción que espera confirmación en el diálogo (o `null`). */
  const [accionPendiente, setAccionPendiente] = useState<AccionPendiente>(null);
  /** Indica si una acción destructiva está en curso (deshabilita botones). */
  const [procesando, setProcesando] = useState(false);

  // Sin punto seleccionado no se renderiza nada perceptible.
  if (!punto) return null;

  const {
    id,
    tipo,
    severidad,
    descripcion,
    coordenada,
    radioMetros,
    distrito,
    estado,
    reportadoEn,
  } = punto;

  /** Abre Google Maps para llegar a la coordenada del centro del área. */
  const alComoLlegar = () => {
    window.open(urlComoLlegar(coordenada), '_blank', 'noopener,noreferrer');
  };

  /** Comparte el reporte con Web Share API o, en su defecto, copiando el enlace. */
  const alCompartir = async () => {
    const enlace = `${window.location.origin}?riesgo=${id}`;
    const titulo = `Reporte de riesgo: ${etiquetaTipoIncidente[tipo]}`;
    const texto = `${etiquetaTipoIncidente[tipo]} en ${distrito} (reporte de demostración).`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: titulo, text: texto, url: enlace });
        return;
      } catch {
        // Si el usuario cancela o falla, se cae al fallback de copiar enlace.
      }
    }

    try {
      await navigator.clipboard.writeText(enlace);
      onMostrarToast('exito', 'Enlace copiado al portapapeles');
    } catch {
      onMostrarToast('error', 'No se pudo compartir el reporte');
    }
  };

  /** Ejecuta la acción confirmada (resolver o eliminar) sobre el reporte. */
  const confirmarAccion = async () => {
    if (!accionPendiente) return;

    setProcesando(true);
    try {
      if (accionPendiente === 'resolver') {
        await onResolver(id);
        onMostrarToast('exito', 'Reporte marcado como resuelto');
      } else {
        await onEliminar(id);
        onMostrarToast('exito', 'Reporte eliminado');
      }
      setAccionPendiente(null);
      onCerrar();
    } catch {
      onMostrarToast(
        'error',
        accionPendiente === 'resolver'
          ? 'No se pudo resolver el reporte'
          : 'No se pudo eliminar el reporte',
      );
    } finally {
      setProcesando(false);
    }
  };

  const tituloDialogo =
    accionPendiente === 'resolver' ? 'Resolver reporte' : 'Eliminar reporte';
  const mensajeDialogo =
    accionPendiente === 'resolver'
      ? 'El reporte se marcará como resuelto y dejará de mostrarse como advertencia activa. ¿Deseas continuar?'
      : 'El reporte se eliminará de forma permanente. Esta acción no se puede deshacer. ¿Deseas continuar?';

  return (
    <>
      <Drawer
        abierto={abierto}
        onCerrar={onCerrar}
        titulo="Detalle del punto de riesgo"
        etiquetaCerrar="Cerrar detalle del punto de riesgo"
      >
        <div className="flex flex-col gap-5">
          {/* Aviso: reporte ciudadano de demostración (Req. 8.2, 15.2). */}
          <p
            className="flex items-start gap-2 rounded-lg bg-surface-subtle px-3 py-2 text-xs text-ink-soft"
            role="note"
          >
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-risk-alto"
              aria-hidden="true"
            />
            <span>
              Reporte ciudadano de demostración. No representa una emergencia
              real.
            </span>
          </p>

          {/* Cabecera: icono del tipo de incidente + severidad destacada. */}
          <section
            aria-labelledby={`riesgo-severidad-${id}`}
            className="flex items-center gap-3"
          >
            {(() => {
              const { icono: IconoTipo, color } = estiloTipo(tipo);
              return (
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-soft"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  <IconoTipo className="h-7 w-7" strokeWidth={2.2} />
                </span>
              );
            })()}
            <div className="min-w-0">
              <h3
                id={`riesgo-severidad-${id}`}
                className="text-lg font-semibold leading-tight text-ink"
              >
                {etiquetaTipoIncidente[tipo]}
              </h3>
              <div className="mt-1.5">
                <Badge
                  tono={tonoDesdeSeveridad(severidad)}
                  icono={<TriangleAlert className="h-3.5 w-3.5" />}
                >
                  Severidad {etiquetaSeveridad[severidad].toLowerCase()}
                </Badge>
              </div>
            </div>
          </section>

          {/* Descripción del incidente. */}
          <section aria-labelledby={`riesgo-descripcion-${id}`}>
            <h3
              id={`riesgo-descripcion-${id}`}
              className="text-xs font-semibold uppercase tracking-wide text-ink-muted"
            >
              Descripción
            </h3>
            <p className="mt-1 text-sm text-ink">{descripcion}</p>
          </section>

          {/* Ubicación (prioridad 2): distrito, coordenadas y radio. */}
          <section aria-labelledby={`riesgo-ubicacion-${id}`}>
            <h3
              id={`riesgo-ubicacion-${id}`}
              className="text-xs font-semibold uppercase tracking-wide text-ink-muted"
            >
              Ubicación
            </h3>
            <dl className="mt-1 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Distrito</dt>
                <dd className="text-right font-medium text-ink">{distrito}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Coordenadas</dt>
                <dd className="text-right font-medium text-ink">
                  {formatearCoordenada(coordenada.lat, coordenada.lng)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Rango perimetral</dt>
                <dd className="text-right font-medium text-ink">
                  {formatearRadio(radioMetros)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Estado del reporte (prioridad 3) y fecha/hora. */}
          <section aria-labelledby={`riesgo-estado-${id}`}>
            <h3
              id={`riesgo-estado-${id}`}
              className="text-xs font-semibold uppercase tracking-wide text-ink-muted"
            >
              Estado del reporte
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tono="neutro">{etiquetaEstadoReporte[estado]}</Badge>
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Reportado el {formatearFecha(reportadoEn)}
            </p>
          </section>

          {/* Acciones principales. */}
          <section className="flex flex-col gap-2 border-t border-surface-border pt-4">
            <div className="flex flex-wrap gap-2">
              <Boton
                variante="secundario"
                tamano="sm"
                icono={<Navigation className="h-4 w-4" />}
                onClick={alComoLlegar}
              >
                Cómo llegar
              </Boton>
              <Boton
                variante="secundario"
                tamano="sm"
                icono={<Share2 className="h-4 w-4" />}
                onClick={() => void alCompartir()}
              >
                Compartir
              </Boton>
            </div>

            <div className="flex flex-wrap gap-2">
              <Boton
                variante="primario"
                tamano="sm"
                icono={<CheckCircle2 className="h-4 w-4" />}
                disabled={estado === 'resuelto' || procesando}
                onClick={() => setAccionPendiente('resolver')}
              >
                Resolver
              </Boton>
              <Boton
                variante="peligro"
                tamano="sm"
                icono={<Trash2 className="h-4 w-4" />}
                disabled={procesando}
                onClick={() => setAccionPendiente('eliminar')}
              >
                Eliminar reporte
              </Boton>
            </div>
          </section>
        </div>
      </Drawer>

      {/* Confirmación de la acción destructiva (resolver o eliminar). */}
      <Dialogo
        abierto={accionPendiente !== null}
        titulo={tituloDialogo}
        mensaje={mensajeDialogo}
        textoConfirmar={accionPendiente === 'resolver' ? 'Resolver' : 'Eliminar'}
        tono={accionPendiente === 'eliminar' ? 'peligro' : 'normal'}
        onConfirmar={() => void confirmarAccion()}
        onCancelar={() => setAccionPendiente(null)}
      />
    </>
  );
}
