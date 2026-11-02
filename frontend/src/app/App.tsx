/**
 * `App`: composición raíz de Real Plaza Contigo.
 *
 * Integra y cablea todas las piezas de la aplicación consumiendo el contexto
 * global (`useApp`): el `Header`, la vista activa (mapa o administración), los
 * overlays de filtros y flujo de reporte, las fichas de detalle (acopio,
 * riesgo, evento), los toasts y los estados de carga/error iniciales.
 *
 * Responsabilidades (tarea 15.2):
 * - Mantener el estado LOCAL de la interacción que NO pertenece al estado
 *   global: los filtros de ambos modos, el borrador del reporte de riesgo, la
 *   bandera de flujo de reporte activo, el evento abierto en su ficha y la
 *   "señal" de ubicación disparada desde el `Header`.
 * - Derivar los conjuntos filtrados del modo activo (con `useFiltrosAcopio` /
 *   `useFiltrosRiesgo`) para alimentar los marcadores/zonas y el encuadre del
 *   mapa de forma coherente con el panel de filtros.
 * - Cablear cada acción de la UI con la acción correspondiente del contexto
 *   (cambiar modo/vista, seleccionar, CRUD, resolver, restaurar demo, toasts).
 *
 * IMPORTANTE: todos los datos mostrados son ficticios y de demostración; no
 * representan operaciones, sedes, emergencias ni ubicaciones reales de Real
 * Plaza (Req. 15.1, 15.2, 15.3).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

import { useApp } from '@/app/contexto';
import type { Coordenada } from '@/types/domain';
import type {
  BorradorReporte,
  FiltrosAcopio,
  FiltrosRiesgo,
} from '@/types/ui';
import { useFiltrosAcopio } from '@/hooks/useFiltrosAcopio';
import { useFiltrosRiesgo } from '@/hooks/useFiltrosRiesgo';
import { useEsMobile } from '@/hooks/useEsMobile';

import { Header } from '@/components/layout/Header';
import { BandaMarca } from '@/components/layout/Logo';
import { PanelResumen } from '@/components/summary/PanelResumen';
import { Tour } from '@/components/onboarding/Tour';
import { MapaBase } from '@/components/map/MapaBase';
import { MarcadoresAcopio } from '@/components/map/MarcadoresAcopio';
import { ZonasRiesgo } from '@/components/map/ZonasRiesgo';
import { AjusteEncuadre } from '@/components/map/AjusteEncuadre';
import { ControlUbicacion } from '@/components/map/ControlUbicacion';
import { PanelFiltros } from '@/components/filters';
import { FlujoReporteRiesgo } from '@/components/risk/FlujoReporteRiesgo';
import { PreviewRadio, CapturadorUbicacion } from '@/components/risk/PreviewRadio';
import { FichaDetalleAcopio } from '@/components/points';
import { FichaDetalleRiesgo } from '@/components/risk/FichaDetalleRiesgo';
import { FichaEvento } from '@/components/events';
import { PanelAdministracion } from '@/components/administration';
import { Toasts } from '@/components/ui';

/** Estado inicial de los filtros de acopio ("sin filtro"). */
const FILTROS_ACOPIO_INICIAL: FiltrosAcopio = {
  texto: '',
  categoriaId: null,
  estado: null,
  eventoId: null,
  distrito: null,
};

/** Estado inicial de los filtros de riesgo ("sin filtro"). */
const FILTROS_RIESGO_INICIAL: FiltrosRiesgo = {
  texto: '',
  tipo: null,
  severidad: null,
  estado: null,
};

/** Borrador vacío de un reporte de riesgo (radio por defecto razonable). */
const BORRADOR_INICIAL: BorradorReporte = {
  coordenada: null,
  radioMetros: 250,
  tipo: null,
  severidad: null,
  descripcion: '',
};

/**
 * Distrito por defecto asignado a los reportes ciudadanos creados desde el mapa.
 * No hay geocodificación inversa en el MVP, por lo que se usa un valor genérico
 * de demostración. Dato ficticio (Req. 9.5, 15.3).
 */
const DISTRITO_POR_DEFECTO = 'Lima Metropolitana';

/** Clave de `localStorage` que marca si ya se mostró el onboarding. */
const CLAVE_ONBOARDING = 'rpc-onboarding-visto';

/**
 * Composición raíz de la aplicación. Consume el contexto global y orquesta la
 * vista activa, los overlays, las fichas y los toasts.
 */
export function App() {
  const {
    estado,
    acopioVistas,
    puntosRiesgo,
    empresas,
    categorias,
    eventos,
    cambiarModo,
    cambiarVista,
    seleccionar,
    limpiarSeleccion,
    crearAcopio,
    editarAcopio,
    eliminarAcopio,
    crearRiesgo,
    editarRiesgo,
    resolverRiesgo,
    eliminarRiesgo,
    restaurarDemo,
    mostrarToast,
    quitarToast,
  } = useApp();

  const { modo, vista, seleccionId, seleccionTipo, modoDemo } = estado;

  // --- Estado local de interacción -----------------------------------------

  const [filtrosAcopio, setFiltrosAcopio] =
    useState<FiltrosAcopio>(FILTROS_ACOPIO_INICIAL);
  const [filtrosRiesgo, setFiltrosRiesgo] =
    useState<FiltrosRiesgo>(FILTROS_RIESGO_INICIAL);
  const [borrador, setBorrador] = useState<BorradorReporte>(BORRADOR_INICIAL);
  const [reporteActivo, setReporteActivo] = useState(false);
  const [eventoAbiertoId, setEventoAbiertoId] = useState<string | null>(null);
  // Contador que actúa como "señal": al incrementarse (botón de ubicación del
  // Header) hace que el `ControlUbicacion` dentro del mapa solicite la posición.
  const [disparoUbicacion, setDisparoUbicacion] = useState(0);
  // Onboarding (coachmarks): se muestra automáticamente la primera vez y puede
  // relanzarse con el botón "¿Cómo funciona?" del Header.
  const [tourAbierto, setTourAbierto] = useState(false);

  // Detección de viewport móvil para orquestar los overlays del mapa (no puede
  // resolverse solo con CSS: en móvil se muestra un único panel a la vez).
  const esMobile = useEsMobile();

  // --- Conjuntos filtrados del modo activo ---------------------------------

  const acopioFiltrado = useFiltrosAcopio(acopioVistas, filtrosAcopio);
  const riesgoFiltrado = useFiltrosRiesgo(puntosRiesgo, filtrosRiesgo);

  // Coordenadas del conjunto filtrado del modo activo, para el encuadre.
  const coordenadasEncuadre: Coordenada[] = useMemo(() => {
    if (modo === 'acopio') {
      return acopioFiltrado.items.map((p) => p.coordenada);
    }
    return riesgoFiltrado.items.map((p) => p.coordenada);
  }, [modo, acopioFiltrado.items, riesgoFiltrado.items]);

  // --- Elementos seleccionados (resueltos desde las colecciones) -----------

  const acopioSeleccionado =
    seleccionTipo === 'acopio'
      ? acopioVistas.find((p) => p.id === seleccionId) ?? null
      : null;

  const riesgoSeleccionado =
    seleccionTipo === 'riesgo'
      ? puntosRiesgo.find((p) => p.id === seleccionId) ?? null
      : null;

  const eventoAbierto = eventoAbiertoId
    ? eventos.find((e) => e.id === eventoAbiertoId) ?? null
    : null;

  // --- Cableado de acciones ------------------------------------------------

  /** Restablece el borrador del reporte a su estado vacío. */
  const resetBorrador = useCallback(() => {
    setBorrador(BORRADOR_INICIAL);
  }, []);

  /** Restablece los filtros del modo activo a "sin filtro". */
  const limpiarFiltros = useCallback(() => {
    if (modo === 'acopio') {
      setFiltrosAcopio(FILTROS_ACOPIO_INICIAL);
    } else {
      setFiltrosRiesgo(FILTROS_RIESGO_INICIAL);
    }
  }, [modo]);

  /** El botón de ubicación del Header dispara la solicitud en el mapa. */
  const solicitarUbicacion = useCallback(() => {
    setDisparoUbicacion((n) => n + 1);
  }, []);

  /** Abre la guía de onboarding (botón "¿Cómo funciona?"). */
  const abrirAyuda = useCallback(() => setTourAbierto(true), []);

  /** Cierra la guía y recuerda que ya se vio (no se repite sola). */
  const cerrarAyuda = useCallback(() => {
    setTourAbierto(false);
    try {
      localStorage.setItem(CLAVE_ONBOARDING, '1');
    } catch {
      // Si localStorage no está disponible, simplemente no se persiste.
    }
  }, []);

  // Primer uso: muestra la guía automáticamente una sola vez, cuando ya hay
  // datos cargados (para que los controles a resaltar existan en el DOM).
  useEffect(() => {
    if (!estado.datos) return;
    let visto = false;
    try {
      visto = localStorage.getItem(CLAVE_ONBOARDING) === '1';
    } catch {
      visto = false;
    }
    if (!visto) setTourAbierto(true);
  }, [estado.datos]);

  /** Inicia el flujo de reporte de riesgo (paso ubicar). */
  const iniciarReporte = useCallback(() => {
    setReporteActivo(true);
  }, []);

  /** Cancela el flujo de reporte y limpia el borrador. */
  const cancelarReporte = useCallback(() => {
    setReporteActivo(false);
    resetBorrador();
  }, [resetBorrador]);

  /** Confirma y persiste el reporte de riesgo vía la Capa de Servicios. */
  const confirmarReporte = useCallback(async () => {
    // El `FlujoReporteRiesgo` valida y solo invoca esto cuando el borrador está
    // completo; aun así comprobamos los campos requeridos para satisfacer el
    // tipo `PuntoRiesgoInput` (sin `null`).
    if (!borrador.coordenada || !borrador.tipo || !borrador.severidad) {
      mostrarToast('error', 'Completa los datos del reporte antes de confirmar.');
      return;
    }

    await crearRiesgo({
      tipo: borrador.tipo,
      severidad: borrador.severidad,
      descripcion: borrador.descripcion.trim(),
      coordenada: borrador.coordenada,
      radioMetros: borrador.radioMetros,
      distrito: DISTRITO_POR_DEFECTO,
    });

    setReporteActivo(false);
    resetBorrador();
  }, [borrador, crearRiesgo, mostrarToast, resetBorrador]);

  /** Registra la coordenada elegida al tocar el mapa (paso ubicar). */
  const elegirUbicacion = useCallback((coordenada: Coordenada) => {
    setBorrador((prev) => ({ ...prev, coordenada }));
  }, []);

  // --- Estados de carga / error iniciales ----------------------------------

  // Pantalla de carga inicial: solo mientras no haya datos todavía.
  if (estado.cargando && !estado.datos) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-3 text-ink"
        >
          <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden="true" />
          <p className="text-sm font-medium">Cargando…</p>
        </div>
      </div>
    );
  }

  // Pantalla de error inicial: si la carga falló y no hay datos que mostrar.
  if (estado.error && !estado.datos) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface p-6">
        <div
          role="alert"
          className="flex max-w-md flex-col items-center gap-3 text-center text-ink"
        >
          <AlertTriangle
            className="h-8 w-8 text-status-saturado"
            aria-hidden="true"
          />
          <h1 className="text-lg font-semibold">No se pudieron cargar los datos</h1>
          <p className="text-sm text-ink-muted">{estado.error}</p>
        </div>
      </div>
    );
  }

  // --- Layout principal -----------------------------------------------------

  return (
    <div className="flex h-screen flex-col bg-surface-subtle">
      <Header
        modo={modo}
        onCambiarModo={cambiarModo}
        vista={vista}
        onCambiarVista={cambiarVista}
        onUbicacion={solicitarUbicacion}
        onAyuda={abrirAyuda}
      />

      <main className="relative flex-1 overflow-hidden">
        {vista === 'resumen' ? (
          /* Vista de resumen: dashboard combinado con scroll propio. */
          <div className="scroll-sutil absolute inset-0 overflow-y-auto overscroll-contain">
            <PanelResumen acopio={acopioVistas} riesgo={puntosRiesgo} />
            {/* Banda morada de cierre con el isotipo y wordmark de Real Plaza. */}
            <BandaMarca />
          </div>
        ) : vista === 'mapa' ? (
          <>
            {/* Mapa a pantalla completa con marcadores/zonas del modo activo. */}
            <div className="absolute inset-0 z-0">
              <MapaBase>
                {modo === 'acopio' && (
                  <MarcadoresAcopio
                    puntos={acopioFiltrado.items}
                    seleccionId={seleccionId}
                    onSeleccionar={(id) => seleccionar(id, 'acopio')}
                  />
                )}

                {modo === 'riesgo' && (
                  <ZonasRiesgo
                    puntos={riesgoFiltrado.items}
                    seleccionId={seleccionId}
                    onSeleccionar={(id) => seleccionar(id, 'riesgo')}
                  />
                )}

                <AjusteEncuadre coordenadas={coordenadasEncuadre} />

                <ControlUbicacion
                  disparo={disparoUbicacion}
                  onError={(mensaje) => mostrarToast('error', mensaje)}
                />

                {/* Previsualización y captura de ubicación del reporte. */}
                {modo === 'riesgo' && reporteActivo && (
                  <>
                    <PreviewRadio
                      coordenada={borrador.coordenada}
                      radioMetros={borrador.radioMetros}
                    />
                    <CapturadorUbicacion
                      activo={reporteActivo}
                      onElegir={elegirUbicacion}
                    />
                  </>
                )}
              </MapaBase>
            </div>

            {/* Overlay: panel de búsqueda y filtros (lateral en escritorio,
                inferior deslizable en móvil). En móvil se oculta mientras el
                flujo de reporte está activo, para no tapar el mapa ni competir
                por el espacio con el panel de reporte. */}
            <div
              className="pointer-events-none absolute inset-0 z-[600]"
              aria-hidden={false}
            >
              <div
                className={[
                  'pointer-events-auto absolute inset-x-2 bottom-2 max-h-[45vh] pb-[env(safe-area-inset-bottom)]',
                  'md:inset-x-auto md:bottom-auto md:left-3 md:top-3 md:max-h-[calc(100%-1.5rem)] md:w-96 md:pb-0',
                  // Oculto en móvil durante el reporte; siempre visible en md+.
                  esMobile && modo === 'riesgo' && reporteActivo
                    ? 'hidden md:block'
                    : '',
                ].join(' ')}
                data-tour="filtros"
              >
                <PanelFiltros
                  modo={modo}
                  acopioVistas={acopioVistas}
                  filtrosAcopio={filtrosAcopio}
                  onCambiarFiltrosAcopio={setFiltrosAcopio}
                  categorias={categorias}
                  eventos={eventos}
                  puntosRiesgo={puntosRiesgo}
                  filtrosRiesgo={filtrosRiesgo}
                  onCambiarFiltrosRiesgo={setFiltrosRiesgo}
                  onLimpiar={limpiarFiltros}
                  onSeleccionar={(id) => seleccionar(id, modo)}
                  seleccionId={seleccionId}
                  className="max-h-full"
                />
              </div>

              {/* Overlay: controles del flujo de reporte (solo en Modo_Riesgo).
                  Abajo a la derecha en escritorio. En móvil:
                  - inactivo: una barra compacta abajo (botón "Reportar"), sin
                    tapar el mapa, conviviendo con el panel de filtros;
                  - activo: hoja inferior con el formulario, con los botones al
                    alcance del pulgar y dejando visible la mitad superior del
                    mapa para poder tocarlo y ubicar la zona. */}
              {modo === 'riesgo' && (
                <div
                  className={[
                    'scroll-sutil pointer-events-auto absolute overflow-y-auto overscroll-contain',
                    // Móvil inactivo: barra compacta ARRIBA (no choca con los
                    // filtros de abajo). Móvil activo: hoja INFERIOR con el
                    // formulario, filtros ocultos, mapa visible arriba.
                    reporteActivo
                      ? 'inset-x-2 bottom-2 max-h-[58vh] pb-[env(safe-area-inset-bottom)]'
                      : 'inset-x-2 top-2 max-h-[30vh]',
                    'md:inset-x-auto md:bottom-3 md:right-3 md:top-auto md:max-h-[calc(100%-1.5rem)] md:w-80 md:pb-0',
                  ].join(' ')}
                >
                  <FlujoReporteRiesgo
                    activo={reporteActivo}
                    borrador={borrador}
                    onCambiarBorrador={setBorrador}
                    onIniciar={iniciarReporte}
                    onCancelar={cancelarReporte}
                    onConfirmar={confirmarReporte}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          /* Vista de administración: ancho completo con scroll propio y padding
             lateral cómodo en móvil (coherente con la vista de resumen). */
          <div className="scroll-sutil absolute inset-0 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
            <PanelAdministracion
              modo={modo}
              acopioVistas={acopioVistas}
              puntosRiesgo={puntosRiesgo}
              empresas={empresas}
              categorias={categorias}
              eventos={eventos}
              modoDemo={modoDemo}
              onCrearAcopio={crearAcopio}
              onEditarAcopio={editarAcopio}
              onEliminarAcopio={eliminarAcopio}
              onCrearRiesgo={crearRiesgo}
              onEditarRiesgo={editarRiesgo}
              onEliminarRiesgo={eliminarRiesgo}
              onRestaurarDemo={restaurarDemo}
            />
            {/* Banda morada de cierre con el isotipo y wordmark de Real Plaza. */}
            <BandaMarca />
          </div>
        )}
      </main>

      {/* Fichas de detalle, controladas por la selección global. */}
      <FichaDetalleAcopio
        punto={acopioSeleccionado}
        abierto={Boolean(acopioSeleccionado)}
        onCerrar={limpiarSeleccion}
        onMostrarToast={mostrarToast}
        onVerEvento={(id) => setEventoAbiertoId(id)}
      />

      <FichaDetalleRiesgo
        punto={riesgoSeleccionado}
        abierto={Boolean(riesgoSeleccionado)}
        onCerrar={limpiarSeleccion}
        onMostrarToast={mostrarToast}
        onResolver={resolverRiesgo}
        onEliminar={eliminarRiesgo}
      />

      <FichaEvento
        evento={eventoAbierto}
        abierto={Boolean(eventoAbierto)}
        onCerrar={() => setEventoAbiertoId(null)}
      />

      {/* Cola de toasts (siempre montada). */}
      <Toasts toasts={estado.toasts} onQuitar={quitarToast} />

      {/* Onboarding guiado (coachmarks): primera visita y acceso por ayuda. */}
      <Tour abierto={tourAbierto} onCerrar={cerrarAyuda} />
    </div>
  );
}
