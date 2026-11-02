/**
 * `FormAcopio`: formulario para crear o editar un centro de acopio dentro del
 * Panel_Administracion (Req. 10.4, 10.5, 10.7, 10.8).
 *
 * - Modo creación cuando `inicial` es `null`/`undefined`; modo edición cuando
 *   se recibe un `PuntoAcopio` existente (sus valores precargan el formulario).
 * - Selectores de sede (empresas tipo `sede`), aliados (empresas tipo
 *   `aliado`), evento (opcional) y categorías (multiselección con checkboxes),
 *   más dirección, coordenadas, capacidad, estado operativo y contacto.
 * - Validación por campo (Req. 10.7): marca los controles con
 *   `aria-invalid`/`aria-describedby` mediante `Campo` e impide guardar si hay
 *   errores.
 * - Al enviar con datos válidos construye un `PuntoAcopioInput`
 *   (`Omit<PuntoAcopio, 'id' | 'actualizadoEn'>`) y lo entrega a `onGuardar`,
 *   que es quien persiste en la Capa de Servicios.
 *
 * Es un componente controlado por estado local: el estado vive aquí y solo se
 * comunica hacia afuera al guardar o cancelar. Layout de una columna, usable en
 * móvil.
 */

import { useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';

import type {
  Categoria,
  Empresa,
  EstadoOperativo,
  Evento,
  PuntoAcopio,
  PuntoAcopioInput,
} from '@/types/domain';
import { Boton, Campo } from '@/components/ui';
import { etiquetaEstadoOperativo } from '@/utils/format';

/** Estados operativos disponibles, en orden de presentación. */
const ESTADOS_OPERATIVOS: readonly EstadoOperativo[] = [
  'operativo',
  'capacidad_limitada',
  'saturado',
  'cerrado',
];

/** Clases compartidas por los `<input>`, `<select>` y `<textarea>`. */
const CLASES_CONTROL =
  'min-h-[44px] w-full rounded-xl border border-surface-border bg-surface ' +
  'px-3 text-sm text-ink placeholder:text-ink-muted ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-brand focus-visible:ring-offset-surface';

export interface FormAcopioProps {
  /** Punto a editar. Si es `null`/`undefined`, el formulario es de creación. */
  inicial?: PuntoAcopio | null;
  /** Catálogo de empresas (se separan sedes y aliados por su campo `tipo`). */
  empresas: Empresa[];
  /** Catálogo de categorías para la multiselección. */
  categorias: Categoria[];
  /** Catálogo de eventos para el select (opcional/`null`). */
  eventos: Evento[];
  /** Persiste el punto construido (crear o editar). */
  onGuardar: (input: PuntoAcopioInput) => void | Promise<void>;
  /** Cancela la edición/creación sin guardar. */
  onCancelar: () => void;
}

/** Estado interno del formulario (todos los campos como texto editable). */
interface EstadoFormAcopio {
  nombre: string;
  codigo: string;
  estado: EstadoOperativo;
  categoriaIds: string[];
  sedeId: string;
  aliadoIds: string[];
  eventoId: string | null;
  direccion: string;
  distrito: string;
  lat: string;
  lng: string;
  horario: string;
  contactoNombre: string;
  contactoTelefono: string;
  capacidad: string;
  ocupacion: string;
  observaciones: string;
}

/** Errores por campo; la clave es el nombre del campo. */
type ErroresAcopio = Partial<Record<string, string>>;

/** Construye el estado inicial del formulario a partir de un punto existente. */
function estadoDesde(inicial?: PuntoAcopio | null): EstadoFormAcopio {
  return {
    nombre: inicial?.nombre ?? '',
    codigo: inicial?.codigo ?? '',
    estado: inicial?.estado ?? 'operativo',
    categoriaIds: inicial?.categoriaIds ?? [],
    sedeId: inicial?.sedeId ?? '',
    aliadoIds: inicial?.aliadoIds ?? [],
    eventoId: inicial?.eventoId ?? null,
    direccion: inicial?.direccion ?? '',
    distrito: inicial?.distrito ?? '',
    lat: inicial ? String(inicial.coordenada.lat) : '',
    lng: inicial ? String(inicial.coordenada.lng) : '',
    horario: inicial?.horario ?? '',
    contactoNombre: inicial?.contactoNombre ?? '',
    contactoTelefono: inicial?.contactoTelefono ?? '',
    capacidad: inicial ? String(inicial.capacidad) : '0',
    ocupacion: inicial ? String(inicial.ocupacion) : '0',
    observaciones: inicial?.observaciones ?? '',
  };
}

/**
 * Valida el estado del formulario y devuelve un mapa de errores por campo.
 * Un mapa vacío significa que el formulario es válido (Req. 10.7).
 */
function validar(estado: EstadoFormAcopio): ErroresAcopio {
  const errores: ErroresAcopio = {};

  if (!estado.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
  if (!estado.codigo.trim()) errores.codigo = 'El código es obligatorio.';
  if (!estado.sedeId) errores.sedeId = 'Selecciona una sede responsable.';
  if (!estado.direccion.trim())
    errores.direccion = 'La dirección es obligatoria.';
  if (!estado.distrito.trim())
    errores.distrito = 'El distrito es obligatorio.';
  if (estado.categoriaIds.length === 0)
    errores.categoriaIds = 'Selecciona al menos una categoría.';

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

  const capacidad = Number(estado.capacidad);
  if (estado.capacidad.trim() === '' || Number.isNaN(capacidad)) {
    errores.capacidad = 'Ingresa una capacidad válida.';
  } else if (capacidad < 0) {
    errores.capacidad = 'La capacidad no puede ser negativa.';
  }

  const ocupacion = Number(estado.ocupacion);
  if (estado.ocupacion.trim() === '' || Number.isNaN(ocupacion)) {
    errores.ocupacion = 'Ingresa una ocupación válida.';
  } else if (ocupacion < 0) {
    errores.ocupacion = 'La ocupación no puede ser negativa.';
  } else if (!Number.isNaN(capacidad) && ocupacion > capacidad) {
    errores.ocupacion = 'La ocupación no puede superar la capacidad.';
  }

  return errores;
}

/**
 * Formulario de creación/edición de un centro de acopio con validación por
 * campo. El layout es de una sola columna para ser usable en móvil.
 */
export function FormAcopio({
  inicial,
  empresas,
  categorias,
  eventos,
  onGuardar,
  onCancelar,
}: FormAcopioProps) {
  const [estado, setEstado] = useState<EstadoFormAcopio>(() =>
    estadoDesde(inicial),
  );
  const [errores, setErrores] = useState<ErroresAcopio>({});
  const [guardando, setGuardando] = useState(false);

  const esEdicion = Boolean(inicial);

  // Separa empresas por tipo para los selects de sede y aliados.
  const sedes = useMemo(
    () => empresas.filter((empresa) => empresa.tipo === 'sede'),
    [empresas],
  );
  const aliados = useMemo(
    () => empresas.filter((empresa) => empresa.tipo === 'aliado'),
    [empresas],
  );

  // Helper para actualizar un campo conservando el resto del estado.
  function cambiar<K extends keyof EstadoFormAcopio>(
    campo: K,
    valor: EstadoFormAcopio[K],
  ) {
    setEstado((previo) => ({ ...previo, [campo]: valor }));
  }

  // Alterna la pertenencia de un ID en una lista (categorías o aliados).
  function alternarEnLista(lista: string[], id: string): string[] {
    return lista.includes(id)
      ? lista.filter((valor) => valor !== id)
      : [...lista, id];
  }

  async function manejarEnvio(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const erroresValidacion = validar(estado);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) return;

    const input: PuntoAcopioInput = {
      nombre: estado.nombre.trim(),
      codigo: estado.codigo.trim(),
      estado: estado.estado,
      categoriaIds: estado.categoriaIds,
      sedeId: estado.sedeId,
      aliadoIds: estado.aliadoIds,
      eventoId: estado.eventoId,
      direccion: estado.direccion.trim(),
      distrito: estado.distrito.trim(),
      coordenada: { lat: Number(estado.lat), lng: Number(estado.lng) },
      horario: estado.horario.trim(),
      contactoNombre: estado.contactoNombre.trim(),
      contactoTelefono: estado.contactoTelefono.trim(),
      capacidad: Number(estado.capacidad),
      ocupacion: Number(estado.ocupacion),
      observaciones: estado.observaciones.trim(),
    };

    try {
      setGuardando(true);
      await onGuardar(input);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={manejarEnvio} noValidate>
      <Campo id="acopio-form-nombre" label="Nombre" error={errores.nombre} required>
        {(props) => (
          <input
            {...props}
            type="text"
            className={CLASES_CONTROL}
            placeholder="Nombre del centro de acopio"
            value={estado.nombre}
            onChange={(evento) => cambiar('nombre', evento.target.value)}
          />
        )}
      </Campo>

      <Campo id="acopio-form-codigo" label="Código" error={errores.codigo} required>
        {(props) => (
          <input
            {...props}
            type="text"
            className={CLASES_CONTROL}
            placeholder="Código identificador"
            value={estado.codigo}
            onChange={(evento) => cambiar('codigo', evento.target.value)}
          />
        )}
      </Campo>

      <Campo id="acopio-form-estado" label="Estado operativo">
        {(props) => (
          <select
            {...props}
            className={CLASES_CONTROL}
            value={estado.estado}
            onChange={(evento) =>
              cambiar('estado', evento.target.value as EstadoOperativo)
            }
          >
            {ESTADOS_OPERATIVOS.map((valor) => (
              <option key={valor} value={valor}>
                {etiquetaEstadoOperativo[valor]}
              </option>
            ))}
          </select>
        )}
      </Campo>

      {/* Multiselección de categorías mediante checkboxes (una por categoría). */}
      <Campo
        id="acopio-form-categorias"
        label="Categorías atendidas"
        error={errores.categoriaIds}
        required
      >
        {(props) => (
          <fieldset
            className="flex flex-col gap-2 rounded-xl border border-surface-border p-3"
            aria-invalid={props['aria-invalid']}
            aria-describedby={props['aria-describedby']}
          >
            {categorias.length === 0 ? (
              <p className="text-sm text-ink-muted">
                No hay categorías disponibles.
              </p>
            ) : (
              categorias.map((categoria) => (
                <label
                  key={categoria.id}
                  className="flex items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-surface-border text-brand focus-visible:ring-2 focus-visible:ring-brand"
                    checked={estado.categoriaIds.includes(categoria.id)}
                    onChange={() =>
                      cambiar(
                        'categoriaIds',
                        alternarEnLista(estado.categoriaIds, categoria.id),
                      )
                    }
                  />
                  {categoria.nombre}
                </label>
              ))
            )}
          </fieldset>
        )}
      </Campo>

      <Campo id="acopio-form-sede" label="Sede responsable" error={errores.sedeId} required>
        {(props) => (
          <select
            {...props}
            className={CLASES_CONTROL}
            value={estado.sedeId}
            onChange={(evento) => cambiar('sedeId', evento.target.value)}
          >
            <option value="">Selecciona una sede</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>

      {/* Multiselección de aliados mediante checkboxes (opcional). */}
      <Campo id="acopio-form-aliados" label="Aliados participantes">
        {(props) => (
          <fieldset
            className="flex flex-col gap-2 rounded-xl border border-surface-border p-3"
            aria-describedby={props['aria-describedby']}
          >
            {aliados.length === 0 ? (
              <p className="text-sm text-ink-muted">
                No hay aliados disponibles.
              </p>
            ) : (
              aliados.map((aliado) => (
                <label
                  key={aliado.id}
                  className="flex items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-surface-border text-brand focus-visible:ring-2 focus-visible:ring-brand"
                    checked={estado.aliadoIds.includes(aliado.id)}
                    onChange={() =>
                      cambiar(
                        'aliadoIds',
                        alternarEnLista(estado.aliadoIds, aliado.id),
                      )
                    }
                  />
                  {aliado.nombre}
                </label>
              ))
            )}
          </fieldset>
        )}
      </Campo>

      <Campo id="acopio-form-evento" label="Evento asociado">
        {(props) => (
          <select
            {...props}
            className={CLASES_CONTROL}
            value={estado.eventoId ?? ''}
            onChange={(evento) =>
              cambiar('eventoId', evento.target.value || null)
            }
          >
            <option value="">Sin evento asociado</option>
            {eventos.map((evento) => (
              <option key={evento.id} value={evento.id}>
                {evento.nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>

      <Campo
        id="acopio-form-direccion"
        label="Dirección"
        error={errores.direccion}
        required
      >
        {(props) => (
          <input
            {...props}
            type="text"
            className={CLASES_CONTROL}
            placeholder="Dirección del punto"
            value={estado.direccion}
            onChange={(evento) => cambiar('direccion', evento.target.value)}
          />
        )}
      </Campo>

      <Campo
        id="acopio-form-distrito"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="acopio-form-lat" label="Latitud" error={errores.lat} required>
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

        <Campo id="acopio-form-lng" label="Longitud" error={errores.lng} required>
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

      <Campo id="acopio-form-horario" label="Horario de atención">
        {(props) => (
          <input
            {...props}
            type="text"
            className={CLASES_CONTROL}
            placeholder="Lun a Vie, 8:00 a 18:00"
            value={estado.horario}
            onChange={(evento) => cambiar('horario', evento.target.value)}
          />
        )}
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="acopio-form-contacto-nombre" label="Persona de contacto">
          {(props) => (
            <input
              {...props}
              type="text"
              className={CLASES_CONTROL}
              placeholder="Nombre de contacto"
              value={estado.contactoNombre}
              onChange={(evento) =>
                cambiar('contactoNombre', evento.target.value)
              }
            />
          )}
        </Campo>

        <Campo
          id="acopio-form-contacto-telefono"
          label="Teléfono de contacto (ficticio)"
        >
          {(props) => (
            <input
              {...props}
              type="tel"
              className={CLASES_CONTROL}
              placeholder="999 999 999"
              value={estado.contactoTelefono}
              onChange={(evento) =>
                cambiar('contactoTelefono', evento.target.value)
              }
            />
          )}
        </Campo>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          id="acopio-form-capacidad"
          label="Capacidad"
          error={errores.capacidad}
        >
          {(props) => (
            <input
              {...props}
              type="number"
              inputMode="numeric"
              min={0}
              className={CLASES_CONTROL}
              value={estado.capacidad}
              onChange={(evento) => cambiar('capacidad', evento.target.value)}
            />
          )}
        </Campo>

        <Campo
          id="acopio-form-ocupacion"
          label="Ocupación"
          error={errores.ocupacion}
        >
          {(props) => (
            <input
              {...props}
              type="number"
              inputMode="numeric"
              min={0}
              className={CLASES_CONTROL}
              value={estado.ocupacion}
              onChange={(evento) => cambiar('ocupacion', evento.target.value)}
            />
          )}
        </Campo>
      </div>

      <Campo id="acopio-form-observaciones" label="Observaciones">
        {(props) => (
          <textarea
            {...props}
            rows={3}
            className={`${CLASES_CONTROL} min-h-[88px] resize-y py-2`}
            placeholder="Observaciones operativas"
            value={estado.observaciones}
            onChange={(evento) => cambiar('observaciones', evento.target.value)}
          />
        )}
      </Campo>

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
          {esEdicion ? 'Guardar cambios' : 'Crear punto'}
        </Boton>
      </div>
    </form>
  );
}
