/**
 * `PanelAdministracion`: contenedor del panel de administración (demostración)
 * de Real Plaza Contigo (Req. 10.1–10.6, 10.10, 10.11, 13.7).
 *
 * Gestiona, según el `modo` activo, el listado de centros de acopio o de
 * reportes de zona de riesgo, cada uno con su propia búsqueda y filtros:
 * - Acopio: búsqueda + filtros por categoría y estado operativo
 *   (reutilizando `useFiltrosAcopio`).
 * - Riesgo: búsqueda + filtros por tipo de incidente, severidad y estado
 *   del reporte (reutilizando `useFiltrosRiesgo`).
 *
 * El listado se presenta como tarjetas apiladas responsive (utilizables en
 * móvil, Req. 10.1–10.3, 13.7), con acciones por fila:
 * - Editar: abre `FormAcopio`/`FormRiesgo` precargado dentro de un `Drawer`.
 * - Eliminar: pide confirmación con `Dialogo` y llama al handler correspondiente.
 * - Crear: abre el formulario vacío en el `Drawer`.
 *
 * El componente es de presentación pura: no conoce la Capa de Servicios ni el
 * contexto global. Recibe los datos y los handlers por props explícitas; la
 * persistencia y el refresco del mapa/lista los realiza el componente padre.
 *
 * IMPORTANTE: todos los datos gestionados son ficticios y de demostración; no
 * representan operaciones, sedes ni emergencias reales de Real Plaza.
 */

import { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';

import type {
  Categoria,
  Empresa,
  EstadoOperativo,
  EstadoReporte,
  Evento,
  ModoApp,
  PuntoAcopio,
  PuntoAcopioInput,
  PuntoRiesgo,
  PuntoRiesgoInput,
  SeveridadRiesgo,
  TipoIncidente,
} from '@/types/domain';
import type {
  FiltrosAcopio,
  FiltrosRiesgo,
  PuntoAcopioVista,
} from '@/types/ui';
import { useFiltrosAcopio } from '@/hooks/useFiltrosAcopio';
import { useFiltrosRiesgo } from '@/hooks/useFiltrosRiesgo';
import {
  Badge,
  Boton,
  Campo,
  Dialogo,
  Drawer,
  tonoDesdeEstado,
  tonoDesdeSeveridad,
} from '@/components/ui';
import {
  etiquetaEstadoOperativo,
  etiquetaEstadoReporte,
  etiquetaSeveridad,
  etiquetaTipoIncidente,
} from '@/utils/format';
import { FormAcopio } from '@/components/administration/FormAcopio';
import { FormRiesgo } from '@/components/administration/FormRiesgo';
import type { CambiosRiesgo } from '@/components/administration/FormRiesgo';

/** Estados operativos disponibles para el filtro de acopio. */
const ESTADOS_OPERATIVOS: readonly EstadoOperativo[] = [
  'operativo',
  'capacidad_limitada',
  'saturado',
  'cerrado',
];

/** Tipos de incidente disponibles para el filtro de riesgo. */
const TIPOS_INCIDENTE: readonly TipoIncidente[] = [
  'inundacion',
  'derrumbe',
  'incendio',
  'sismo',
  'via_bloqueada',
  'otro',
];

/** Niveles de severidad disponibles para el filtro de riesgo. */
const SEVERIDADES: readonly SeveridadRiesgo[] = [
  'bajo',
  'medio',
  'alto',
  'critico',
];

/** Estados de reporte disponibles para el filtro de riesgo. */
const ESTADOS_REPORTE: readonly EstadoReporte[] = [
  'activo',
  'en_verificacion',
  'resuelto',
];

/** Clases compartidas por los controles de búsqueda y los `<select>`. */
const CLASES_CONTROL =
  'min-h-[44px] w-full rounded-xl border border-surface-border bg-surface ' +
  'px-3 text-sm text-ink placeholder:text-ink-muted ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-brand focus-visible:ring-offset-surface';

/** Valores iniciales de los filtros de acopio ("sin filtro"). */
const FILTROS_ACOPIO_INICIAL: FiltrosAcopio = {
  texto: '',
  categoriaId: null,
  estado: null,
  eventoId: null,
  distrito: null,
};

/** Valores iniciales de los filtros de riesgo ("sin filtro"). */
const FILTROS_RIESGO_INICIAL: FiltrosRiesgo = {
  texto: '',
  tipo: null,
  severidad: null,
  estado: null,
};

export interface PanelAdministracionProps {
  /** Modo activo: determina qué colección se administra (acopio o riesgo). */
  modo: ModoApp;
  /** Centros de acopio enriquecidos (view-models) del sistema. */
  acopioVistas: PuntoAcopioVista[];
  /** Reportes de zona de riesgo del sistema. */
  puntosRiesgo: PuntoRiesgo[];
  /** Catálogo de empresas (sedes y aliados) para los formularios. */
  empresas: Empresa[];
  /** Catálogo de categorías para filtros y formularios. */
  categorias: Categoria[];
  /** Catálogo de eventos para los formularios de acopio. */
  eventos: Evento[];
  /** Si la app corre en modo demo (habilita "Restaurar datos de demostración"). */
  modoDemo: boolean;
  /** Crea un nuevo centro de acopio. */
  onCrearAcopio: (input: PuntoAcopioInput) => void | Promise<void>;
  /** Edita un centro de acopio existente. */
  onEditarAcopio: (id: string, input: PuntoAcopioInput) => void | Promise<void>;
  /** Elimina un centro de acopio. */
  onEliminarAcopio: (id: string) => void | Promise<void>;
  /** Crea un nuevo reporte de zona de riesgo. */
  onCrearRiesgo: (input: PuntoRiesgoInput) => void | Promise<void>;
  /** Edita un reporte de zona de riesgo (incluye su estado). */
  onEditarRiesgo: (id: string, cambios: CambiosRiesgo) => void | Promise<void>;
  /** Elimina un reporte de zona de riesgo. */
  onEliminarRiesgo: (id: string) => void | Promise<void>;
  /** Restaura los datos iniciales de demostración. */
  onRestaurarDemo: () => void | Promise<void>;
}

/** Estado del formulario abierto en el drawer: crear o editar un item. */
type EstadoFormulario =
  | { tipo: 'cerrado' }
  | { tipo: 'crear' }
  | { tipo: 'editarAcopio'; punto: PuntoAcopio }
  | { tipo: 'editarRiesgo'; punto: PuntoRiesgo };

/** Objetivo de una eliminación pendiente de confirmación. */
type EliminacionPendiente =
  | { modo: 'acopio'; id: string; nombre: string }
  | { modo: 'riesgo'; id: string; nombre: string };

/**
 * Panel de administración (demostración) con listado por modo, búsqueda,
 * filtros y acciones de crear/editar/eliminar más restaurar demo.
 */
export function PanelAdministracion({
  modo,
  acopioVistas,
  puntosRiesgo,
  empresas,
  categorias,
  eventos,
  modoDemo,
  onCrearAcopio,
  onEditarAcopio,
  onEliminarAcopio,
  onCrearRiesgo,
  onEditarRiesgo,
  onEliminarRiesgo,
  onRestaurarDemo,
}: PanelAdministracionProps) {
  // Estado local de filtros por modo.
  const [filtrosAcopio, setFiltrosAcopio] = useState<FiltrosAcopio>(
    FILTROS_ACOPIO_INICIAL,
  );
  const [filtrosRiesgo, setFiltrosRiesgo] = useState<FiltrosRiesgo>(
    FILTROS_RIESGO_INICIAL,
  );

  // Estado del drawer de formulario y del diálogo de confirmación.
  const [formulario, setFormulario] = useState<EstadoFormulario>({
    tipo: 'cerrado',
  });
  const [eliminacion, setEliminacion] = useState<EliminacionPendiente | null>(
    null,
  );
  const [mostrarRestaurar, setMostrarRestaurar] = useState(false);
  const [restaurando, setRestaurando] = useState(false);

  // Resultados filtrados (memoizados por los hooks de filtrado reutilizables).
  const resultadoAcopio = useFiltrosAcopio(acopioVistas, filtrosAcopio);
  const resultadoRiesgo = useFiltrosRiesgo(puntosRiesgo, filtrosRiesgo);

  const esAcopio = modo === 'acopio';

  // --- Handlers de guardado (crear/editar) ---

  async function guardarAcopio(input: PuntoAcopioInput) {
    if (formulario.tipo === 'editarAcopio') {
      await onEditarAcopio(formulario.punto.id, input);
    } else {
      await onCrearAcopio(input);
    }
    setFormulario({ tipo: 'cerrado' });
  }

  async function guardarRiesgo(cambios: CambiosRiesgo) {
    if (formulario.tipo === 'editarRiesgo') {
      // En edición el payload incluye el estado del reporte.
      await onEditarRiesgo(formulario.punto.id, cambios);
    } else {
      // En creación el payload es un `PuntoRiesgoInput` (sin estado).
      await onCrearRiesgo(cambios as PuntoRiesgoInput);
    }
    setFormulario({ tipo: 'cerrado' });
  }

  // --- Handler de confirmación de eliminación ---

  async function confirmarEliminacion() {
    if (!eliminacion) return;
    if (eliminacion.modo === 'acopio') {
      await onEliminarAcopio(eliminacion.id);
    } else {
      await onEliminarRiesgo(eliminacion.id);
    }
    setEliminacion(null);
  }

  // --- Handler de restaurar demo ---

  async function confirmarRestaurar() {
    try {
      setRestaurando(true);
      await onRestaurarDemo();
    } finally {
      setRestaurando(false);
      setMostrarRestaurar(false);
    }
  }

  // Título del drawer según la acción y el modo.
  const tituloDrawer = (() => {
    switch (formulario.tipo) {
      case 'crear':
        return esAcopio ? 'Crear centro de acopio' : 'Crear reporte de riesgo';
      case 'editarAcopio':
        return 'Editar centro de acopio';
      case 'editarRiesgo':
        return 'Editar reporte de riesgo';
      default:
        return '';
    }
  })();

  const totalVisible = esAcopio
    ? resultadoAcopio.total
    : resultadoRiesgo.total;

  return (
    <section className="flex flex-col gap-4" aria-label="Panel de administración">
      {/* Nota de demostración. */}
      <p className="rounded-xl bg-surface-subtle px-3 py-2 text-xs text-ink-soft">
        Panel de administración de demostración. Todos los datos son ficticios y
        no representan operaciones ni emergencias reales de Real Plaza.
      </p>

      {/* Barra de acciones principales. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">
          {esAcopio ? 'Centros de acopio' : 'Reportes de riesgo'}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {modoDemo && (
            <Boton
              variante="secundario"
              icono={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
              onClick={() => setMostrarRestaurar(true)}
            >
              Restaurar datos de demostración
            </Boton>
          )}
          <Boton
            icono={<Plus className="h-4 w-4" aria-hidden="true" />}
            onClick={() => setFormulario({ tipo: 'crear' })}
          >
            {esAcopio ? 'Crear punto' : 'Crear reporte'}
          </Boton>
        </div>
      </div>

      {/* Búsqueda y filtros según el modo activo. */}
      {esAcopio ? (
        <FiltrosAcopioControles
          filtros={filtrosAcopio}
          categorias={categorias}
          onCambiar={setFiltrosAcopio}
        />
      ) : (
        <FiltrosRiesgoControles
          filtros={filtrosRiesgo}
          onCambiar={setFiltrosRiesgo}
        />
      )}

      {/* Contador de resultados. */}
      <p className="text-sm text-ink-soft" aria-live="polite">
        {totalVisible} {totalVisible === 1 ? 'resultado' : 'resultados'}
      </p>

      {/* Listado de tarjetas responsive. */}
      {esAcopio ? (
        <ListaAcopio
          puntos={resultadoAcopio.items}
          onLimpiar={() => setFiltrosAcopio(FILTROS_ACOPIO_INICIAL)}
          onEditar={(punto) =>
            setFormulario({ tipo: 'editarAcopio', punto })
          }
          onEliminar={(punto) =>
            setEliminacion({
              modo: 'acopio',
              id: punto.id,
              nombre: punto.nombre,
            })
          }
        />
      ) : (
        <ListaRiesgo
          puntos={resultadoRiesgo.items}
          onLimpiar={() => setFiltrosRiesgo(FILTROS_RIESGO_INICIAL)}
          onEditar={(punto) =>
            setFormulario({ tipo: 'editarRiesgo', punto })
          }
          onEliminar={(punto) =>
            setEliminacion({
              modo: 'riesgo',
              id: punto.id,
              nombre: etiquetaTipoIncidente[punto.tipo],
            })
          }
        />
      )}

      {/* Drawer con el formulario de creación/edición. */}
      <Drawer
        abierto={formulario.tipo !== 'cerrado'}
        onCerrar={() => setFormulario({ tipo: 'cerrado' })}
        titulo={tituloDrawer}
        etiquetaCerrar="Cerrar formulario"
      >
        {esAcopio ? (
          <FormAcopio
            inicial={
              formulario.tipo === 'editarAcopio' ? formulario.punto : null
            }
            empresas={empresas}
            categorias={categorias}
            eventos={eventos}
            onGuardar={guardarAcopio}
            onCancelar={() => setFormulario({ tipo: 'cerrado' })}
          />
        ) : (
          <FormRiesgo
            inicial={
              formulario.tipo === 'editarRiesgo' ? formulario.punto : null
            }
            onGuardar={guardarRiesgo}
            onCancelar={() => setFormulario({ tipo: 'cerrado' })}
          />
        )}
      </Drawer>

      {/* Diálogo de confirmación de eliminación. */}
      <Dialogo
        abierto={eliminacion !== null}
        titulo={
          eliminacion?.modo === 'riesgo'
            ? 'Eliminar reporte de riesgo'
            : 'Eliminar centro de acopio'
        }
        mensaje={
          eliminacion
            ? `¿Seguro que deseas eliminar "${eliminacion.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        textoConfirmar="Eliminar"
        tono="peligro"
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setEliminacion(null)}
      />

      {/* Diálogo de confirmación de restaurar demo (solo en modo demo). */}
      <Dialogo
        abierto={mostrarRestaurar}
        titulo="Restaurar datos de demostración"
        mensaje="Se descartarán los cambios locales y se repoblarán los datos iniciales de demostración. ¿Deseas continuar?"
        textoConfirmar={restaurando ? 'Restaurando…' : 'Restaurar'}
        onConfirmar={confirmarRestaurar}
        onCancelar={() => setMostrarRestaurar(false)}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Controles de filtros por modo                                       */
/* ------------------------------------------------------------------ */

interface FiltrosAcopioControlesProps {
  filtros: FiltrosAcopio;
  categorias: Categoria[];
  onCambiar: (filtros: FiltrosAcopio) => void;
}

/** Búsqueda + filtros por categoría y estado para el listado de acopio. */
function FiltrosAcopioControles({
  filtros,
  categorias,
  onCambiar,
}: FiltrosAcopioControlesProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Campo id="admin-acopio-buscar" label="Buscar">
        {(props) => (
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              {...props}
              type="search"
              className={`${CLASES_CONTROL} pl-9`}
              placeholder="Nombre, sede, dirección, distrito"
              value={filtros.texto}
              onChange={(evento) =>
                onCambiar({ ...filtros, texto: evento.target.value })
              }
            />
          </div>
        )}
      </Campo>

      <Campo id="admin-acopio-categoria" label="Categoría">
        {(props) => (
          <select
            {...props}
            className={CLASES_CONTROL}
            value={filtros.categoriaId ?? ''}
            onChange={(evento) =>
              onCambiar({
                ...filtros,
                categoriaId: evento.target.value || null,
              })
            }
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>

      <Campo id="admin-acopio-estado" label="Estado">
        {(props) => (
          <select
            {...props}
            className={CLASES_CONTROL}
            value={filtros.estado ?? ''}
            onChange={(evento) =>
              onCambiar({
                ...filtros,
                estado: (evento.target.value as EstadoOperativo) || null,
              })
            }
          >
            <option value="">Todos los estados</option>
            {ESTADOS_OPERATIVOS.map((estado) => (
              <option key={estado} value={estado}>
                {etiquetaEstadoOperativo[estado]}
              </option>
            ))}
          </select>
        )}
      </Campo>
    </div>
  );
}

interface FiltrosRiesgoControlesProps {
  filtros: FiltrosRiesgo;
  onCambiar: (filtros: FiltrosRiesgo) => void;
}

/** Búsqueda + filtros por tipo, severidad y estado para el listado de riesgo. */
function FiltrosRiesgoControles({
  filtros,
  onCambiar,
}: FiltrosRiesgoControlesProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Campo id="admin-riesgo-buscar" label="Buscar">
        {(props) => (
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              {...props}
              type="search"
              className={`${CLASES_CONTROL} pl-9`}
              placeholder="Descripción, tipo o distrito"
              value={filtros.texto}
              onChange={(evento) =>
                onCambiar({ ...filtros, texto: evento.target.value })
              }
            />
          </div>
        )}
      </Campo>

      <Campo id="admin-riesgo-tipo" label="Tipo de incidente">
        {(props) => (
          <select
            {...props}
            className={CLASES_CONTROL}
            value={filtros.tipo ?? ''}
            onChange={(evento) =>
              onCambiar({
                ...filtros,
                tipo: (evento.target.value as TipoIncidente) || null,
              })
            }
          >
            <option value="">Todos los tipos</option>
            {TIPOS_INCIDENTE.map((tipo) => (
              <option key={tipo} value={tipo}>
                {etiquetaTipoIncidente[tipo]}
              </option>
            ))}
          </select>
        )}
      </Campo>

      <Campo id="admin-riesgo-severidad" label="Severidad">
        {(props) => (
          <select
            {...props}
            className={CLASES_CONTROL}
            value={filtros.severidad ?? ''}
            onChange={(evento) =>
              onCambiar({
                ...filtros,
                severidad: (evento.target.value as SeveridadRiesgo) || null,
              })
            }
          >
            <option value="">Todas las severidades</option>
            {SEVERIDADES.map((severidad) => (
              <option key={severidad} value={severidad}>
                {etiquetaSeveridad[severidad]}
              </option>
            ))}
          </select>
        )}
      </Campo>

      <Campo id="admin-riesgo-estado" label="Estado del reporte">
        {(props) => (
          <select
            {...props}
            className={CLASES_CONTROL}
            value={filtros.estado ?? ''}
            onChange={(evento) =>
              onCambiar({
                ...filtros,
                estado: (evento.target.value as EstadoReporte) || null,
              })
            }
          >
            <option value="">Todos los estados</option>
            {ESTADOS_REPORTE.map((estado) => (
              <option key={estado} value={estado}>
                {etiquetaEstadoReporte[estado]}
              </option>
            ))}
          </select>
        )}
      </Campo>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Listados de tarjetas por modo                                       */
/* ------------------------------------------------------------------ */

interface ListaAcopioProps {
  puntos: PuntoAcopioVista[];
  onLimpiar: () => void;
  onEditar: (punto: PuntoAcopio) => void;
  onEliminar: (punto: PuntoAcopioVista) => void;
}

/** Lista de tarjetas de centros de acopio con acciones por fila. */
function ListaAcopio({ puntos, onLimpiar, onEditar, onEliminar }: ListaAcopioProps) {
  if (puntos.length === 0) {
    return <EstadoVacio onLimpiar={onLimpiar} />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {puntos.map((punto) => (
        <li
          key={punto.id}
          className="rounded-2xl border border-surface-border bg-surface p-4 shadow-card"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">
                  {punto.nombre}
                </h3>
                <Badge
                  tono={tonoDesdeEstado(punto.estado)}
                  icono={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  {etiquetaEstadoOperativo[punto.estado]}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {punto.codigo} · {punto.distrito}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                {punto.sede?.nombre ?? 'Sin sede asignada'} ·{' '}
                {punto.ocupacionPct}% de ocupación
              </p>
            </div>
            <AccionesFila
              etiqueta={punto.nombre}
              onEditar={() => onEditar(punto)}
              onEliminar={() => onEliminar(punto)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

interface ListaRiesgoProps {
  puntos: PuntoRiesgo[];
  onLimpiar: () => void;
  onEditar: (punto: PuntoRiesgo) => void;
  onEliminar: (punto: PuntoRiesgo) => void;
}

/** Lista de tarjetas de reportes de riesgo con acciones por fila. */
function ListaRiesgo({ puntos, onLimpiar, onEditar, onEliminar }: ListaRiesgoProps) {
  if (puntos.length === 0) {
    return <EstadoVacio onLimpiar={onLimpiar} />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {puntos.map((punto) => (
        <li
          key={punto.id}
          className="rounded-2xl border border-surface-border bg-surface p-4 shadow-card"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">
                  {etiquetaTipoIncidente[punto.tipo]}
                </h3>
                <Badge
                  tono={tonoDesdeSeveridad(punto.severidad)}
                  icono={
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  }
                >
                  {etiquetaSeveridad[punto.severidad]}
                </Badge>
                <Badge tono="neutro">
                  {etiquetaEstadoReporte[punto.estado]}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {punto.distrito} · radio {punto.radioMetros} m
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-ink-soft">
                {punto.descripcion}
              </p>
            </div>
            <AccionesFila
              etiqueta={etiquetaTipoIncidente[punto.tipo]}
              onEditar={() => onEditar(punto)}
              onEliminar={() => onEliminar(punto)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponentes compartidos                                          */
/* ------------------------------------------------------------------ */

interface AccionesFilaProps {
  etiqueta: string;
  onEditar: () => void;
  onEliminar: () => void;
}

/** Botones de editar y eliminar para una fila del listado. */
function AccionesFila({ etiqueta, onEditar, onEliminar }: AccionesFilaProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Boton
        variante="secundario"
        tamano="sm"
        icono={<Pencil className="h-4 w-4" aria-hidden="true" />}
        onClick={onEditar}
        aria-label={`Editar ${etiqueta}`}
        className="!px-2"
      />
      <Boton
        variante="peligro"
        tamano="sm"
        icono={<Trash2 className="h-4 w-4" aria-hidden="true" />}
        onClick={onEliminar}
        aria-label={`Eliminar ${etiqueta}`}
        className="!px-2"
      />
    </div>
  );
}

interface EstadoVacioProps {
  onLimpiar: () => void;
}

/** Estado vacío cuando ningún elemento satisface los filtros. */
function EstadoVacio({ onLimpiar }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border bg-surface-subtle px-4 py-10 text-center">
      <p className="text-sm font-medium text-ink">No hay resultados</p>
      <p className="max-w-sm text-xs text-ink-soft">
        No encontramos elementos que coincidan con la búsqueda y los filtros
        actuales.
      </p>
      <Boton variante="secundario" tamano="sm" onClick={onLimpiar}>
        Limpiar filtros
      </Boton>
    </div>
  );
}
