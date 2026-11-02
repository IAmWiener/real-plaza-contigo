/**
 * `FlujoReporteRiesgo`: panel de controles del flujo para marcar una zona de
 * riesgo sobre el mapa.
 *
 * Este componente vive en el overlay de UI (NO dentro del `MapContainer`). Los
 * componentes que sí van dentro del mapa son `PreviewRadio` (el `Circle` de
 * vista previa) y `CapturadorUbicacion` (el manejador de clics), definidos en
 * `./PreviewRadio`.
 *
 * Responsabilidades (tarea 12.1):
 * - Presentar una máquina de pasos simple y usable con una mano desde 360px
 *   (Req. 9.4): inactivo → ubicar → ajustar radio → detallar → confirmar.
 * - Gestionar únicamente la UI y la validación del borrador. La persistencia y
 *   el estado del borrador los maneja el consumidor (`App`), que pasa el
 *   `borrador`, lo actualiza con `onCambiarBorrador` y, al confirmar, persiste
 *   vía la Capa de Servicios en `onConfirmar` (Req. 9.5, 9.7).
 *
 * El color de la severidad siempre se acompaña de etiqueta textual; el flujo no
 * depende solo del color para comunicar estados (Req. 14.1). Todos los reportes
 * son ficticios y de demostración.
 */

import { useMemo } from 'react';
import {
  MapPin,
  CircleDot,
  ClipboardList,
  CheckCircle2,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';

import type {
  SeveridadRiesgo,
  TipoIncidente,
} from '@/types/domain';
import type { BorradorReporte } from '@/types/ui';
import { etiquetaSeveridad, etiquetaTipoIncidente } from '@/utils/format';
import {
  ORDEN_TIPO_INCIDENTE,
  estiloTipo,
  COLOR_SEVERIDAD,
} from '@/utils/riesgo';
import { Boton, Campo } from '@/components/ui';

/** Radio mínimo permitido para el área perimetral (en metros). */
export const RADIO_MIN = 50;
/** Radio máximo permitido para el área perimetral (en metros). */
export const RADIO_MAX = 5000;

/** Opciones de severidad, derivadas de las etiquetas legibles. */
const SEVERIDADES = Object.keys(etiquetaSeveridad) as SeveridadRiesgo[];

/** Clases compartidas por los `<textarea>`/controles de texto del panel. */
const CLASES_CONTROL =
  'min-h-[44px] w-full rounded-xl border border-surface-border bg-surface ' +
  'px-3 text-sm text-ink placeholder:text-ink-muted ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-brand focus-visible:ring-offset-surface';

export interface FlujoReporteRiesgoProps {
  /** Si el flujo está activo (ya iniciado por el usuario). */
  activo: boolean;
  /** Borrador del reporte en construcción (fuente de verdad en el consumidor). */
  borrador: BorradorReporte;
  /** Actualiza el borrador en el consumidor. */
  onCambiarBorrador: (borrador: BorradorReporte) => void;
  /** Confirma y persiste el reporte (lo decide el consumidor). */
  onConfirmar: () => void;
  /** Cancela el flujo y resetea (lo decide el consumidor). */
  onCancelar: () => void;
  /** Inicia el flujo (paso inactivo → ubicar). */
  onIniciar: () => void;
}

/**
 * Determina el paso actual del flujo a partir del estado del borrador. La
 * máquina de pasos es derivada (sin estado interno adicional) para mantener la
 * coherencia con el borrador que gestiona el consumidor.
 *
 * - `ubicar`: aún no hay coordenada central.
 * - `detallar`: ya hay coordenada; se ajusta el radio y se completan los datos.
 */
type Paso = 'ubicar' | 'detallar';

function pasoActual(borrador: BorradorReporte): Paso {
  return borrador.coordenada ? 'detallar' : 'ubicar';
}

/**
 * Valida el borrador. Devuelve el primer mensaje de error aplicable, o `null`
 * si el reporte está completo y puede confirmarse (Req. 9.6).
 */
function validar(borrador: BorradorReporte): string | null {
  if (!borrador.coordenada) {
    return 'Toca el mapa para ubicar la zona de riesgo.';
  }
  if (!(borrador.radioMetros > 0)) {
    return 'Ajusta un radio mayor a 0 metros.';
  }
  if (!borrador.tipo) {
    return 'Selecciona el tipo de incidente.';
  }
  if (!borrador.severidad) {
    return 'Selecciona el nivel de severidad.';
  }
  if (borrador.descripcion.trim().length === 0) {
    return 'Describe brevemente el incidente.';
  }
  return null;
}

/**
 * Panel de controles del flujo de reporte de riesgo. Renderiza el paso actual
 * según el estado del borrador y expone acciones para iniciar, confirmar y
 * cancelar.
 */
export function FlujoReporteRiesgo({
  activo,
  borrador,
  onCambiarBorrador,
  onConfirmar,
  onCancelar,
  onIniciar,
}: FlujoReporteRiesgoProps) {
  const paso = pasoActual(borrador);
  const error = useMemo(() => validar(borrador), [borrador]);
  const puedeConfirmar = error === null;

  // Helper para emitir un cambio parcial del borrador conservando el resto.
  function cambiar<K extends keyof BorradorReporte>(
    campo: K,
    valor: BorradorReporte[K],
  ) {
    onCambiarBorrador({ ...borrador, [campo]: valor });
  }

  // Paso 0 (inactivo): solo el botón para iniciar el flujo. El consumidor (App)
  // decide montar este componente únicamente en Modo_Riesgo (Req. 9.1).
  if (!activo) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface/95 p-3 shadow-float backdrop-blur-sm sm:p-4">
        <Boton
          variante="primario"
          bloque
          icono={<AlertTriangle className="h-4 w-4" />}
          onClick={onIniciar}
        >
          Reportar zona de riesgo
        </Boton>
        <p className="mt-2 text-center text-[11px] italic text-ink-muted">
          Reporte ciudadano de demostración.
        </p>
      </div>
    );
  }

  return (
    <section
      className="flex animate-slide-up flex-col gap-4 rounded-2xl border border-surface-border bg-surface/95 p-4 shadow-float backdrop-blur-sm"
      aria-label="Reportar zona de riesgo"
    >
      {/* Encabezado con el paso activo y acción de cerrar/cancelar. */}
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <AlertTriangle className="h-4 w-4 text-brand" aria-hidden="true" />
            Reportar zona de riesgo
          </h2>
          <p className="mt-0.5 text-[11px] italic text-ink-muted">
            Reporte ciudadano de demostración.
          </p>
        </div>
        <Boton
          variante="fantasma"
          tamano="sm"
          icono={<X className="h-4 w-4" />}
          aria-label="Cancelar reporte"
          onClick={onCancelar}
        />
      </header>

      {/* Indicador de progreso de la máquina de pasos (icono + texto). */}
      <ol className="flex items-center gap-2 text-xs" aria-label="Pasos del reporte">
        <PasoIndicador
          icono={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />}
          texto="Ubicar"
          activo={paso === 'ubicar'}
          completado={Boolean(borrador.coordenada)}
        />
        <span className="h-px flex-1 bg-surface-border" aria-hidden="true" />
        <PasoIndicador
          icono={<CircleDot className="h-3.5 w-3.5" aria-hidden="true" />}
          texto="Radio"
          activo={paso === 'detallar'}
          completado={paso === 'detallar' && borrador.radioMetros > 0}
        />
        <span className="h-px flex-1 bg-surface-border" aria-hidden="true" />
        <PasoIndicador
          icono={<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />}
          texto="Detallar"
          activo={paso === 'detallar'}
          completado={Boolean(borrador.tipo && borrador.severidad)}
        />
      </ol>

      {paso === 'ubicar' ? (
        // Paso ubicar: instrucción para tocar el mapa. `CapturadorUbicacion`
        // (dentro del mapa) registra la coordenada y hace avanzar el flujo.
        <div className="rounded-xl border border-dashed border-surface-border bg-surface-subtle p-4 text-center">
          <MapPin className="mx-auto h-6 w-6 text-brand" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-ink">
            Toca el mapa para ubicar la zona
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Elige el centro del área afectada por el incidente.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Paso ajustar radio: slider en vivo reflejado por `PreviewRadio`. */}
          <Campo
            id="riesgo-radio"
            label="Radio del área perimetral"
            hint={`Entre ${RADIO_MIN} y ${RADIO_MAX} metros.`}
          >
            {(props) => (
              <div className="flex flex-col gap-1">
                <input
                  {...props}
                  type="range"
                  min={RADIO_MIN}
                  max={RADIO_MAX}
                  step={10}
                  value={borrador.radioMetros}
                  onChange={(e) =>
                    cambiar('radioMetros', Number(e.target.value))
                  }
                  className="w-full accent-brand"
                />
                <output
                  htmlFor="riesgo-radio"
                  className="text-sm font-semibold text-ink"
                >
                  {borrador.radioMetros} m
                </output>
              </div>
            )}
          </Campo>

          {/* Paso detallar: tipo (selector de iconos), severidad y descripción. */}
          <SelectorTipoIncidente
            valor={borrador.tipo}
            onCambiar={(tipo) => cambiar('tipo', tipo)}
          />

          <SelectorSeveridad
            valor={borrador.severidad}
            onCambiar={(sev) => cambiar('severidad', sev)}
          />

          <Campo id="riesgo-descripcion-nuevo" label="Descripción" required>
            {(props) => (
              <textarea
                {...props}
                rows={3}
                className={CLASES_CONTROL + ' resize-y py-2'}
                placeholder="Describe brevemente el incidente"
                value={borrador.descripcion}
                onChange={(e) => cambiar('descripcion', e.target.value)}
              />
            )}
          </Campo>
        </div>
      )}

      {/* Mensaje de validación: impide confirmar mientras falte algo (Req. 9.6). */}
      {error && (
        <p role="status" className="text-xs font-medium text-brand">
          {error}
        </p>
      )}

      {/* Acciones del flujo. */}
      <div className="flex gap-2">
        <Boton variante="secundario" bloque onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton
          variante="primario"
          bloque
          icono={<CheckCircle2 className="h-4 w-4" />}
          disabled={!puedeConfirmar}
          onClick={() => {
            if (puedeConfirmar) onConfirmar();
          }}
        >
          Confirmar
        </Boton>
      </div>
    </section>
  );
}

interface PasoIndicadorProps {
  icono: React.ReactNode;
  texto: string;
  activo: boolean;
  completado: boolean;
}

/**
 * Píldora de un paso del flujo. Comunica el estado con icono + texto + peso,
 * sin depender únicamente del color (Req. 14.1).
 */
function PasoIndicador({ icono, texto, activo, completado }: PasoIndicadorProps) {
  const clases = [
    'inline-flex items-center gap-1 rounded-full px-2 py-1',
    activo
      ? 'bg-brand/10 font-semibold text-brand'
      : completado
        ? 'font-medium text-ink'
        : 'text-ink-muted',
  ].join(' ');

  return (
    <li className={clases} aria-current={activo ? 'step' : undefined}>
      {icono}
      <span>{texto}</span>
    </li>
  );
}

interface SelectorTipoIncidenteProps {
  valor: TipoIncidente | null;
  onCambiar: (tipo: TipoIncidente) => void;
}

/**
 * Selector del tipo de incidente con una cuadrícula de pastillas circulares con
 * icono y color (estilo inspirado en apps de reportes de mapa). Es un grupo de
 * radios accesible: navegable con teclado, con `aria-checked` y etiquetas de
 * texto siempre visibles (el color nunca es el único indicador; Req. 14.1).
 */
function SelectorTipoIncidente({ valor, onCambiar }: SelectorTipoIncidenteProps) {
  const descripcion = valor ? estiloTipo(valor).descripcion : null;

  return (
    <fieldset>
      <legend className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink">
        Tipo de incidente
        <span className="text-brand" aria-hidden="true">
          *
        </span>
      </legend>
      <div
        role="radiogroup"
        aria-label="Tipo de incidente"
        className="grid grid-cols-3 gap-2 sm:grid-cols-6"
      >
        {ORDEN_TIPO_INCIDENTE.map((tipo) => {
          const { icono: Icono, color } = estiloTipo(tipo);
          const activo = valor === tipo;
          return (
            <button
              key={tipo}
              type="button"
              role="radio"
              aria-checked={activo}
              aria-label={etiquetaTipoIncidente[tipo]}
              onClick={() => onCambiar(tipo)}
              className={[
                'group flex flex-col items-center gap-1 rounded-2xl p-1.5',
                'transition-colors focus:outline-none focus-visible:ring-2',
                'focus-visible:ring-brand focus-visible:ring-offset-2',
                'focus-visible:ring-offset-surface',
                activo ? 'bg-surface-subtle' : 'hover:bg-surface-subtle',
              ].join(' ')}
            >
              <span
                className={[
                  'relative flex h-12 w-12 items-center justify-center rounded-full',
                  'text-white shadow-sm transition-transform',
                  activo ? 'scale-105' : 'group-hover:scale-105',
                ].join(' ')}
                style={{
                  backgroundColor: color,
                  boxShadow: activo ? `0 0 0 3px ${color}40` : undefined,
                }}
              >
                <Icono className="h-6 w-6" aria-hidden="true" strokeWidth={2.2} />
                {activo && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow"
                    aria-hidden="true"
                  >
                    <Check
                      className="h-3 w-3"
                      style={{ color }}
                      strokeWidth={3}
                    />
                  </span>
                )}
              </span>
              <span
                className={[
                  'text-center text-[11px] leading-tight',
                  activo ? 'font-semibold text-ink' : 'text-ink-soft',
                ].join(' ')}
              >
                {etiquetaTipoIncidente[tipo]}
              </span>
            </button>
          );
        })}
      </div>
      {descripcion && (
        <p className="mt-1.5 text-xs text-ink-muted">{descripcion}</p>
      )}
    </fieldset>
  );
}

interface SelectorSeveridadProps {
  valor: SeveridadRiesgo | null;
  onCambiar: (sev: SeveridadRiesgo) => void;
}

/**
 * Selector de severidad como control segmentado de pastillas. Cada opción
 * muestra texto + color + un indicador de "barras" de nivel para no depender
 * solo del color (Req. 14.1). Es un grupo de radios accesible por teclado.
 */
function SelectorSeveridad({ valor, onCambiar }: SelectorSeveridadProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink">
        Severidad
        <span className="text-brand" aria-hidden="true">
          *
        </span>
      </legend>
      <div
        role="radiogroup"
        aria-label="Severidad"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {SEVERIDADES.map((sev, idx) => {
          const color = COLOR_SEVERIDAD[sev];
          const activo = valor === sev;
          return (
            <button
              key={sev}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onCambiar(sev)}
              className={[
                'flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2',
                'text-sm font-medium transition-colors focus:outline-none',
                'focus-visible:ring-2 focus-visible:ring-brand',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                activo
                  ? 'text-white'
                  : 'border-surface-border bg-surface text-ink-soft hover:bg-surface-subtle',
              ].join(' ')}
              style={
                activo
                  ? { backgroundColor: color, borderColor: color }
                  : undefined
              }
            >
              <span
                className="flex items-end gap-0.5"
                aria-hidden="true"
                style={{ height: 14 }}
              >
                {Array.from({ length: 4 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 3,
                      height: 5 + i * 3,
                      borderRadius: 1,
                      backgroundColor: activo
                        ? 'rgba(255,255,255,0.9)'
                        : i <= idx
                          ? color
                          : 'rgba(148,163,184,0.4)',
                    }}
                  />
                ))}
              </span>
              {etiquetaSeveridad[sev]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
