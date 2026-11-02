/**
 * `PanelResumen`: dashboard combinado de estadísticas (acopio + riesgo).
 *
 * Presenta una visión general de la plataforma con KPIs grandes y legibles y
 * barras de distribución simples (por estado operativo, severidad y tipo de
 * incidente). Diseño minimalista alineado con el sistema "Comunidad Real":
 * superficies blancas redondeadas sobre fondo celeste, acento turquesa,
 * tipografía display para las cifras y texto amplio pensado también para
 * personas mayores.
 *
 * Es un componente de presentación puro: recibe las colecciones por props y
 * deriva los agregados con `estadisticasResumen`. Todos los datos son ficticios
 * y de demostración.
 */

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  PackageOpen,
  CheckCircle2,
  Gauge,
  Boxes,
  TriangleAlert,
  ShieldAlert,
  ClipboardCheck,
} from 'lucide-react';

import type {
  EstadoOperativo,
  PuntoRiesgo,
  SeveridadRiesgo,
} from '@/types/domain';
import type { PuntoAcopioVista } from '@/types/ui';
import {
  etiquetaEstadoOperativo,
  etiquetaSeveridad,
  etiquetaTipoIncidente,
} from '@/utils/format';
import { COLOR_SEVERIDAD, estiloTipo } from '@/utils/riesgo';
import { estadisticasResumen } from '@/utils/estadisticas';

export interface PanelResumenProps {
  /** Centros de acopio enriquecidos (view-models). */
  acopio: PuntoAcopioVista[];
  /** Puntos de riesgo del dominio. */
  riesgo: PuntoRiesgo[];
}

/** Color (hex) por estado operativo, alineado con los tokens `status.*`. */
const COLOR_ESTADO: Record<EstadoOperativo, string> = {
  operativo: '#16A34A',
  capacidad_limitada: '#D97706',
  saturado: '#DC2626',
  cerrado: '#7A7A7A',
};

/**
 * Panel de resumen con KPIs de acopio y riesgo, y distribuciones visuales.
 */
export function PanelResumen({ acopio, riesgo }: PanelResumenProps) {
  const { acopio: ea, riesgo: er } = useMemo(
    () => estadisticasResumen(acopio, riesgo),
    [acopio, riesgo],
  );

  const sinDatos = ea.total === 0 && er.total === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-4 sm:py-6">
      {/* Encabezado de la vista. */}
      <header className="mb-5">
        <h1 className="cr-display text-2xl text-brand sm:text-3xl">
          Resumen general
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Una mirada rápida al estado de los centros de acopio y las zonas de
          riesgo. Datos ficticios de demostración.
        </p>
      </header>

      {sinDatos ? (
        <p
          role="status"
          className="rounded-2xl border border-surface-border bg-surface p-6 text-center text-ink-muted shadow-sm"
        >
          Aún no hay datos para mostrar.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Franja de titulares: lo más importante de un vistazo. */}
          <section
            aria-label="Indicadores principales"
            className="grid grid-cols-1 gap-3 rounded-3xl bg-brand-gradient p-4 text-white shadow-float sm:grid-cols-3 sm:p-5"
          >
            <Titular
              valor={ea.disponibles}
              etiqueta="Centros disponibles"
              detalle={`de ${ea.total} en total`}
            />
            <Titular
              valor={er.activos}
              etiqueta="Reportes de riesgo activos"
              detalle={`${er.resueltos} ya resueltos`}
            />
            <Titular
              valor={er.severosActivos}
              etiqueta="De alta gravedad activos"
              detalle="requieren atención urgente"
            />
          </section>

          {/* ===================== Centros de acopio ===================== */}
          <section aria-labelledby="resumen-acopio">
            <h2
              id="resumen-acopio"
              className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted"
            >
              <PackageOpen className="h-4 w-4 text-brand" aria-hidden="true" />
              Centros de acopio
            </h2>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <TarjetaKpi
                icono={<PackageOpen className="h-6 w-6" aria-hidden="true" />}
                valor={ea.total}
                etiqueta="Centros en total"
              />
              <TarjetaKpi
                icono={<CheckCircle2 className="h-6 w-6" aria-hidden="true" />}
                valor={ea.disponibles}
                etiqueta="Disponibles ahora"
                acento="#16A34A"
                sub={`${ea.noDisponibles} saturados o cerrados`}
              />
              <TarjetaKpi
                icono={<Gauge className="h-6 w-6" aria-hidden="true" />}
                valor={`${ea.ocupacionPromedio}%`}
                etiqueta="Ocupación promedio"
              />
              <TarjetaKpi
                icono={<Boxes className="h-6 w-6" aria-hidden="true" />}
                valor={ea.capacidadDisponible.toLocaleString('es-PE')}
                etiqueta="Capacidad disponible"
                sub="espacios libres para recibir ayuda"
              />
            </div>

            {/* Distribución por estado operativo. */}
            <Distribucion
              titulo="Centros por estado"
              tramos={ea.porEstado.map((t) => ({
                etiqueta: etiquetaEstadoOperativo[t.clave],
                cantidad: t.cantidad,
                color: COLOR_ESTADO[t.clave],
              }))}
              total={ea.total}
            />
          </section>

          {/* ===================== Zonas de riesgo ====================== */}
          <section aria-labelledby="resumen-riesgo">
            <h2
              id="resumen-riesgo"
              className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted"
            >
              <TriangleAlert className="h-4 w-4 text-brand" aria-hidden="true" />
              Zonas de riesgo
            </h2>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <TarjetaKpi
                icono={<TriangleAlert className="h-6 w-6" aria-hidden="true" />}
                valor={er.total}
                etiqueta="Reportes en total"
              />
              <TarjetaKpi
                icono={<ShieldAlert className="h-6 w-6" aria-hidden="true" />}
                valor={er.activos}
                etiqueta="Reportes activos"
                acento="#DC2626"
              />
              <TarjetaKpi
                icono={<ShieldAlert className="h-6 w-6" aria-hidden="true" />}
                valor={er.severosActivos}
                etiqueta="Alta gravedad activos"
                acento="#7F1D1D"
              />
              <TarjetaKpi
                icono={<ClipboardCheck className="h-6 w-6" aria-hidden="true" />}
                valor={er.resueltos}
                etiqueta="Ya resueltos"
                acento="#16A34A"
              />
            </div>

            {/* Distribución por severidad. */}
            <Distribucion
              titulo="Reportes por severidad"
              tramos={er.porSeveridad.map((t) => ({
                etiqueta: etiquetaSeveridad[t.clave],
                cantidad: t.cantidad,
                color: COLOR_SEVERIDAD[t.clave as SeveridadRiesgo],
              }))}
              total={er.total}
            />

            {/* Tipos de incidente con conteo (chips con icono + color). */}
            {er.porTipo.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Tipos de incidente reportados
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {er.porTipo.map((t) => {
                    const { icono: Icono, color } = estiloTipo(t.clave);
                    return (
                      <li
                        key={t.clave}
                        className="inline-flex items-center gap-2 rounded-pill border border-surface-border bg-surface py-1.5 pl-1.5 pr-3 shadow-sm"
                      >
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: color }}
                          aria-hidden="true"
                        >
                          <Icono className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                        <span className="text-sm font-medium text-ink">
                          {etiquetaTipoIncidente[t.clave]}
                        </span>
                        <span className="text-sm font-bold text-ink">
                          {t.cantidad}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

interface TitularProps {
  valor: ReactNode;
  etiqueta: string;
  detalle: string;
}

/**
 * Cifra protagonista de la franja superior: número grande en display sobre la
 * banda de marca, con etiqueta y un detalle secundario.
 */
function Titular({ valor, etiqueta, detalle }: TitularProps) {
  return (
    <div className="flex flex-col">
      <span className="cr-display text-4xl leading-none sm:text-5xl">
        {valor}
      </span>
      <span className="mt-1 text-sm font-semibold">{etiqueta}</span>
      <span className="text-xs text-white/75">{detalle}</span>
    </div>
  );
}

interface TarjetaKpiProps {
  icono: ReactNode;
  valor: ReactNode;
  etiqueta: string;
  /** Color de acento (hex) del icono; por defecto el morado de marca. */
  acento?: string;
  /** Texto secundario opcional bajo la etiqueta. */
  sub?: string;
}

/** Tarjeta de un indicador grande: icono circular, cifra display y etiqueta. */
function TarjetaKpi({ icono, valor, etiqueta, acento, sub }: TarjetaKpiProps) {
  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-surface-border bg-surface p-4 shadow-sm">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: acento ?? '#4F0090' }}
        aria-hidden="true"
      >
        {icono}
      </span>
      <span className="cr-display text-3xl leading-none text-title sm:text-4xl">
        {valor}
      </span>
      <span className="text-sm font-medium text-ink-soft">{etiqueta}</span>
      {sub && <span className="text-xs text-ink-muted">{sub}</span>}
    </article>
  );
}

interface DistribucionProps {
  titulo: string;
  tramos: { etiqueta: string; cantidad: number; color: string }[];
  total: number;
}

/**
 * Distribución horizontal simple: una fila por tramo con etiqueta, barra
 * proporcional (color + cantidad) y recuento. La información no depende solo
 * del color (siempre hay etiqueta y número).
 */
function Distribucion({ titulo, tramos, total }: DistribucionProps) {
  return (
    <div className="mt-4 rounded-2xl border border-surface-border bg-surface p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {titulo}
      </h3>
      <ul className="flex flex-col gap-3">
        {tramos.map((t) => {
          const pct = total > 0 ? Math.round((t.cantidad / total) * 100) : 0;
          return (
            <li key={t.etiqueta} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-ink">{t.etiqueta}</span>
                <span className="tabular-nums text-ink-soft">
                  {t.cantidad}
                  <span className="text-ink-muted"> · {pct}%</span>
                </span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-surface-subtle"
                role="img"
                aria-label={`${t.etiqueta}: ${t.cantidad} (${pct}%)`}
              >
                <span
                  className="block h-full rounded-full transition-[width] duration-500 ease-cr"
                  style={{ width: `${pct}%`, backgroundColor: t.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
