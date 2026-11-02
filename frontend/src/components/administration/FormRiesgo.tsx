/**
 * `FormRiesgo`: formulario para crear o editar un reporte de zona de riesgo
 * dentro del Panel_Administracion (Req. 10.5, 10.7, 10.9).
 *
 * - Modo creación cuando `inicial` es `null`/`undefined`; en ese caso produce
 *   un `PuntoRiesgoInput` (`Omit<PuntoRiesgo, 'id' | 'reportadoEn' | 'estado'>`),
 *   sin el campo `estado` (lo asigna la Capa de Servicios al crear).
 * - Modo edición cuando se recibe un `PuntoRiesgo`; además de los campos de
 *   creación permite editar el `estado` (EstadoReporte) y entrega un objeto que
 *   incluye `estado`.
 * - Validación por campo (Req. 10.7): marca los controles con
 *   `aria-invalid`/`aria-describedby` mediante `Campo` e impide guardar si hay
 *   errores. El componente decide la forma del objeto según `inicial`.
 *
 * Es un componente controlado por estado local y de una sola columna, usable
 * en móvil.
 */

import { useState } from 'react';
import { Save, X } from 'lucide-react';

import type {
  EstadoReporte,
  PuntoRiesgo,
  PuntoRiesgoInput,
  SeveridadRiesgo,
  TipoIncidente,
} from '@/types/domain';
import { Boton, Campo } from '@/components/ui';
import {
  etiquetaEstadoReporte,
  etiquetaSeveridad,
  etiquetaTipoIncidente,
} from '@/utils/format';

/** Radio perimetral permitido para un reporte, en metros. */
const RADIO_MIN = 50;
const RADIO_MAX = 5000;

/** Tipos de incidente disponibles, en orden de presentación. */
const TIPOS_INCIDENTE: readonly TipoIncidente[] = [
  'inundacion',
  'derrumbe',
  'incendio',
  'sismo',
  'via_bloqueada',
  'otro',
];

/** Niveles de severidad disponibles, en orden de presentación. */
const SEVERIDADES: readonly SeveridadRiesgo[] = [
  'bajo',
  'medio',
  'alto',
  'critico',
];

/** Estados de reporte disponibles, en orden de presentación. */
const ESTADOS_REPORTE: readonly EstadoReporte[] = [
  'activo',
  'en_verificacion',
  'resuelto',
];

/** Clases compartidas por los `<input>`, `<select>` y `<textarea>`. */
const CLASES_CONTROL =
  'min-h-[44px] w-full rounded-xl border border-surface-border bg-surface ' +
  'px-3 text-sm text-ink placeholder:text-ink-muted ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-brand focus-visible:ring-offset-surface';

/**
 * Objeto que entrega `FormRiesgo` al guardar. En creación es un
 * `PuntoRiesgoInput`; en edición el mismo payload con `estado` incluido.
 */
export type CambiosRiesgo = PuntoRiesgoInput | (PuntoRiesgoInput & { estado: EstadoReporte });

export interface FormRiesgoProps {
  /** Reporte a editar. Si es `null`/`undefined`, el formulario es de creación. */
  inicial?: PuntoRiesgo | null;
  /** Persiste el reporte construido (crear o editar). */
  onGuardar: (cambios: CambiosRiesgo) => void | Promise<void>;
  /** Cancela la edición/creación sin guardar. */
  onCancelar: () => void;
}

/** Estado interno del formulario (campos editables como texto). */
interface EstadoFormRiesgo {
  tipo: TipoIncidente;
  severidad: SeveridadRiesgo;
  descripcion: string;
  lat: string;
  lng: string;
  radioMetros: string;
  distrito: string;
  estado: EstadoReporte;
}

/** Errores por campo; la clave es el nombre del campo. */
type ErroresRiesgo = Partial<Record<string, string>>;

/** Construye el estado inicial a partir de un reporte existente. */
function estadoDesde(inicial?: PuntoRiesgo | null): EstadoFormRiesgo {
  return {
    tipo: inicial?.tipo ?? 'inundacion',
    severidad: inicial?.severidad ?? 'medio',
    descripcion: inicial?.descripcion ?? '',
    lat: inicial ? String(inicial.coordenada.lat) : '',
    lng: inicial ? String(inicial.coordenada.lng) : '',
    radioMetros: inicial ? String(inicial.radioMetros) : '500',
    distrito: inicial?.distrito ?? '',
    estado: inicial?.estado ?? 'activo',
  };
}

/**
 * Valida el estado del formulario y devuelve un mapa de errores por campo.
 * Un mapa vacío significa que el formulario es válido (Req. 10.7).
 */
function validar(estado: EstadoFormRiesgo): ErroresRiesgo {
  const errores: ErroresRiesgo = {};

  if (!estado.descripcion.trim())
    errores.descripcion = 'La descripción es obligatoria.';
  if (!estado.distrito.trim())
    errores.distrito = 'El distrito es obligatorio.';

  const lat = Number(estado.lat);
  if (estado.lat.trim() === '' || Number.isNaN(lat)) {
    errores.lat = 'Ingresa una latitud válida.';
  } else if (lat < -90 || lat > 90) {
    errores.lat = 'La latitud debe estar entre -90 y 90.';
  }

  const lng = Number(estado.lng);
  if (estado.lng.trim() === '' || Number.isNaN(lng)) {
    errores.lng = 'Ingresa una longitud válida.';
  } else if (lng < -180 || lng > 180) {
    errores.lng = 'La longitud debe estar entre -180 y 180.';
  }

  const radio = Number(estado.radioMetros);
  if (estado.radioMetros.trim() === '' || Number.isNaN(radio)) {
    errores.radioMetros = 'Ingresa un radio válido.';
  } else if (radio < RADIO_MIN || radio > RADIO_MAX) {
    errores.radioMetros = `El radio debe estar entre ${RADIO_MIN} y ${RADIO_MAX} metros.`;
  }

  return errores;
}

/**
 * Formulario de creación/edición de un reporte de zona de riesgo con validación
 * por campo. El layout es de una sola columna para ser usable en móvil.
 */
export function FormRiesgo({ inicial, onGuardar, onCancelar }: FormRiesgoProps) {
  const [estado, setEstado] = useState<EstadoFormRiesgo>(() =>
    estadoDesde(inicial),
  );
  const [errores, setErrores] = useState<ErroresRiesgo>({});
  const [guardando, setGuardando] = useState(false);

  const esEdicion = Boolean(inicial);

  // Helper para actualizar un campo conservando el resto del estado.
  function cambiar<K extends keyof EstadoFormRiesgo>(
    campo: K,
    valor: EstadoFormRiesgo[K],
  ) {
    setEstado((previo) => ({ ...previo, [campo]: valor }));
  }

  async function manejarEnvio(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const erroresValidacion = validar(estado);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) return;

    const base: PuntoRiesgoInput = {
      tipo: estado.tipo,
      severidad: estado.severidad,
      descripcion: estado.descripcion.trim(),
      coordenada: { lat: Number(estado.lat), lng: Number(estado.lng) },
      radioMetros: Number(estado.radioMetros),
      distrito: estado.distrito.trim(),
    };

    // En edición se incluye el estado del reporte; en creación lo asigna el
    // servicio.
    const cambios: CambiosRiesgo = esEdicion
      ? { ...base, estado: estado.estado }
      : base;

    try {
      setGuardando(true);
      await onGuardar(cambios);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={manejarEnvio} noValidate>
      <Campo id="riesgo-form-tipo" label="Tipo de incidente">
        {(props) => (
          <select
            {...props}
            className={CLASES_CONTROL}
            value={estado.tipo}
            onChange={(evento) =>
              cambiar('tipo', evento.target.value as TipoIncidente)
            }
          >
            {TIPOS_INCIDENTE.map((valor) => (
              <option key={valor} value={valor}>
                {etiquetaTipoIncidente[valor]}
              </option>
            ))}
          </select>
        )}
      </Campo>

      <Campo id="riesgo-form-severidad" label="Severidad">
        {(props) => (
          <select
            {...props}
            className={CLASES_CONTROL}
            value={estado.severidad}
            onChange={(evento) =>
              cambiar('severidad', evento.target.value as SeveridadRiesgo)
            }
          >
            {SEVERIDADES.map((valor) => (
              <option key={valor} value={valor}>
                {etiquetaSeveridad[valor]}
              </option>
            ))}
          </select>
        )}
      </Campo>

      <Campo
        id="riesgo-form-descripcion"
        label="Descripción del incidente"
        error={errores.descripcion}
        required
      >
        {(props) => (
          <textarea
            {...props}
            rows={3}
            className={`${CLASES_CONTROL} min-h-[88px] resize-y py-2`}
            placeholder="Describe el incidente reportado"
            value={estado.descripcion}
            onChange={(evento) => cambiar('descripcion', evento.target.value)}
          />
        )}
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="riesgo-form-lat" label="Latitud" error={errores.lat} required>
          {(props) => (
            <input
              {...props}
              type="number"
              inputMode="decimal"
              step="any"
              className={CLASES_CONTROL}
              placeholder="-12.0464"
              value={estado.lat}
              onChange={(evento) => cambiar('lat', evento.target.value)}
            />
          )}
        </Campo>

        <Campo id="riesgo-form-lng" label="Longitud" error={errores.lng} required>
          {(props) => (
            <input
              {...props}
              type="number"
              inputMode="decimal"
              step="any"
              className={CLASES_CONTROL}
              placeholder="-77.0428"
              value={estado.lng}
              onChange={(evento) => cambiar('lng', evento.target.value)}
            />
          )}
        </Campo>
      </div>

      <Campo
        id="riesgo-form-radio"
        label="Radio perimetral (metros)"
        error={errores.radioMetros}
        hint={`Entre ${RADIO_MIN} y ${RADIO_MAX} metros.`}
        required
      >
        {(props) => (
          <input
            {...props}
            type="number"
            inputMode="numeric"
            min={RADIO_MIN}
            max={RADIO_MAX}
            className={CLASES_CONTROL}
            value={estado.radioMetros}
            onChange={(evento) => cambiar('radioMetros', evento.target.value)}
          />
        )}
      </Campo>

      <Campo
        id="riesgo-form-distrito"
        label="Distrito"
        error={errores.distrito}
        required
      >
        {(props) => (
          <input
            {...props}
            type="text"
            className={CLASES_CONTROL}
            placeholder="Distrito"
            value={estado.distrito}
            onChange={(evento) => cambiar('distrito', evento.target.value)}
          />
        )}
      </Campo>

      {/* El estado del reporte solo es editable en modo edición (Req. 10.9). */}
      {esEdicion && (
        <Campo id="riesgo-form-estado" label="Estado del reporte">
          {(props) => (
            <select
              {...props}
              className={CLASES_CONTROL}
              value={estado.estado}
              onChange={(evento) =>
                cambiar('estado', evento.target.value as EstadoReporte)
              }
            >
              {ESTADOS_REPORTE.map((valor) => (
                <option key={valor} value={valor}>
                  {etiquetaEstadoReporte[valor]}
                </option>
              ))}
            </select>
          )}
        </Campo>
      )}

      {/* Acciones del formulario. */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Boton
          variante="secundario"
          icono={<X className="h-4 w-4" aria-hidden="true" />}
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </Boton>
        <Boton
          type="submit"
          icono={<Save className="h-4 w-4" aria-hidden="true" />}
          cargando={guardando}
        >
          {esEdicion ? 'Guardar cambios' : 'Crear reporte'}
        </Boton>
      </div>
    </form>
  );
}
