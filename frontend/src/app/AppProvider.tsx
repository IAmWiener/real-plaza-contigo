/**
 * Proveedor de estado global de Real Plaza Contigo.
 *
 * `AppProvider` conecta el reducer puro de `@/app/estado` con la Capa de
 * Servicios (`@/services/crearDataService`) y expone, a través de
 * `@/app/contexto`, el estado, las colecciones listas para presentación y todas
 * las acciones de navegación, selección, CRUD, modo demostración y toasts.
 *
 * Responsabilidades (que NO viven en el reducer):
 *  - Instanciar la Capa de Servicios una sola vez.
 *  - Ejecutar la carga inicial al montar (`cargarTodo`).
 *  - Ejecutar las mutaciones contra la Capa de Servicios y refrescar el estado
 *    tras resolver, mostrando toasts de éxito/error.
 *  - Derivar los view-models de acopio (`PuntoAcopioVista`) desde los datos.
 *
 * IMPORTANTE: todos los datos expuestos son ficticios y de demostración. No
 * representan operaciones, sedes, emergencias ni ubicaciones reales de Real
 * Plaza.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import { estadoInicial, reducer, type Toast } from '@/app/estado';
import { ContextoApp, type ValorContextoApp } from '@/app/contexto';
import { crearDataService } from '@/services/crearDataService';
import { ErrorDataService, type DataService } from '@/services/dataService';
import { derivarPuntoAcopioVista } from '@/utils/viewModels';
import type {
  ModoApp,
  PuntoAcopioInput,
  PuntoRiesgo,
  PuntoRiesgoInput,
} from '@/types/domain';
import type { DatosDominio, PuntoAcopioVista, Vista } from '@/types/ui';

/** Props del proveedor: los componentes hijos de la aplicación. */
export interface AppProviderProps {
  children: ReactNode;
}

/**
 * Genera un identificador para un toast. Usa `crypto.randomUUID` cuando está
 * disponible y recurre a un fallback basado en tiempo + aleatorio en entornos
 * que no lo exponen.
 */
function generarIdToast(): string {
  const cripto = (globalThis as { crypto?: Crypto }).crypto;
  if (cripto && typeof cripto.randomUUID === 'function') {
    return cripto.randomUUID();
  }
  return `toast-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

/**
 * Normaliza cualquier error a un mensaje legible. Prioriza el `.message` de
 * `ErrorDataService` y de cualquier `Error`; usa un texto genérico en otros
 * casos.
 */
function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorDataService) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
}

/**
 * Proveedor del contexto de la aplicación. Envuelve el árbol que necesita
 * acceso al estado global y a las acciones.
 */
export function AppProvider({ children }: AppProviderProps) {
  const [estado, despachar] = useReducer(reducer, estadoInicial);

  // La Capa de Servicios se instancia UNA sola vez por montaje. `useRef`
  // garantiza una referencia estable entre renders sin recrear el servicio.
  const servicioRef = useRef<DataService | null>(null);
  if (servicioRef.current === null) {
    servicioRef.current = crearDataService();
  }
  const servicio = servicioRef.current;

  // --- Toasts ---------------------------------------------------------------

  const mostrarToast = useCallback(
    (tipo: Toast['tipo'], mensaje: string) => {
      const toast: Toast = { id: generarIdToast(), tipo, mensaje };
      despachar({ tipo: 'TOAST_AGREGAR', toast });
    },
    [],
  );

  const quitarToast = useCallback((id: string) => {
    despachar({ tipo: 'TOAST_QUITAR', id });
  }, []);

  // --- Carga inicial --------------------------------------------------------

  useEffect(() => {
    let activo = true;

    async function cargar() {
      despachar({ tipo: 'CARGA_INICIO' });
      try {
        const datos = await servicio.cargarTodo();
        if (!activo) return;
        // `esDemo` puede volverse `true` DESPUÉS del fallback dentro de
        // `cargarTodo` (ApiDataService cae a mock ante fallo de red), por lo que
        // se lee aquí, una vez resuelta la promesa.
        despachar({ tipo: 'CARGA_EXITO', datos, esDemo: servicio.esDemo });
      } catch (error) {
        if (!activo) return;
        despachar({ tipo: 'CARGA_ERROR', error: mensajeDeError(error) });
        mostrarToast('error', 'No se pudieron cargar los datos.');
      }
    }

    void cargar();

    return () => {
      activo = false;
    };
    // El servicio y `mostrarToast` son estables; la carga se ejecuta una vez.
  }, [servicio, mostrarToast]);

  // --- Refresco tras mutaciones --------------------------------------------

  /**
   * Vuelve a cargar todas las colecciones desde la Capa de Servicios y las
   * publica en el estado mediante `SET_DATOS`. Se usa tras cada mutación con
   * éxito para que el mapa y las listas reflejen el cambio de inmediato.
   */
  const refrescarDatos = useCallback(async () => {
    const datos = await servicio.cargarTodo();
    despachar({ tipo: 'SET_DATOS', datos });
  }, [servicio]);

  /**
   * Ejecuta una operación de mutación: la corre contra la Capa de Servicios,
   * refresca los datos y muestra un toast de éxito. Ante error muestra un toast
   * de error y no modifica el estado.
   *
   * @param operacion Mutación a ejecutar sobre la Capa de Servicios.
   * @param mensajeExito Texto del toast de éxito.
   */
  const ejecutarMutacion = useCallback(
    async (operacion: () => Promise<unknown>, mensajeExito: string) => {
      try {
        await operacion();
        await refrescarDatos();
        mostrarToast('exito', mensajeExito);
      } catch (error) {
        mostrarToast('error', mensajeDeError(error));
      }
    },
    [refrescarDatos, mostrarToast],
  );

  // --- Acciones de navegación/selección ------------------------------------

  const cambiarModo = useCallback((modo: ModoApp) => {
    despachar({ tipo: 'CAMBIAR_MODO', modo });
  }, []);

  const cambiarVista = useCallback((vista: Vista) => {
    despachar({ tipo: 'CAMBIAR_VISTA', vista });
  }, []);

  const seleccionar = useCallback((id: string, tipo: ModoApp) => {
    despachar({ tipo: 'SELECCIONAR', id, tipoSel: tipo });
  }, []);

  const limpiarSeleccion = useCallback(() => {
    despachar({ tipo: 'LIMPIAR_SELECCION' });
  }, []);

  // --- Acciones CRUD de acopio ---------------------------------------------

  const crearAcopio = useCallback(
    (input: PuntoAcopioInput) =>
      ejecutarMutacion(
        () => servicio.crearAcopio(input),
        'Centro de acopio creado.',
      ),
    [ejecutarMutacion, servicio],
  );

  const editarAcopio = useCallback(
    (id: string, input: PuntoAcopioInput) =>
      ejecutarMutacion(
        () => servicio.editarAcopio(id, input),
        'Centro de acopio actualizado.',
      ),
    [ejecutarMutacion, servicio],
  );

  const eliminarAcopio = useCallback(
    (id: string) =>
      ejecutarMutacion(
        () => servicio.eliminarAcopio(id),
        'Centro de acopio eliminado.',
      ),
    [ejecutarMutacion, servicio],
  );

  // --- Acciones CRUD de riesgo ---------------------------------------------

  const crearRiesgo = useCallback(
    (input: PuntoRiesgoInput) =>
      ejecutarMutacion(
        () => servicio.crearRiesgo(input),
        'Reporte de riesgo creado.',
      ),
    [ejecutarMutacion, servicio],
  );

  const editarRiesgo = useCallback(
    (id: string, cambios: Partial<PuntoRiesgo>) =>
      ejecutarMutacion(
        () => servicio.editarRiesgo(id, cambios),
        'Reporte de riesgo actualizado.',
      ),
    [ejecutarMutacion, servicio],
  );

  const resolverRiesgo = useCallback(
    (id: string) =>
      ejecutarMutacion(
        () => servicio.resolverRiesgo(id),
        'Reporte de riesgo resuelto.',
      ),
    [ejecutarMutacion, servicio],
  );

  const eliminarRiesgo = useCallback(
    (id: string) =>
      ejecutarMutacion(
        () => servicio.eliminarRiesgo(id),
        'Reporte de riesgo eliminado.',
      ),
    [ejecutarMutacion, servicio],
  );

  // --- Modo demostración ----------------------------------------------------

  const restaurarDemo = useCallback(
    () =>
      ejecutarMutacion(
        () => servicio.restaurarDemo(),
        'Datos de demostración restaurados.',
      ),
    [ejecutarMutacion, servicio],
  );

  // --- Colecciones derivadas/crudas ----------------------------------------

  const datos: DatosDominio | null = estado.datos;

  // Los view-models de acopio se derivan con `useMemo` para no recalcular en
  // cada render, solo cuando cambian las colecciones base implicadas.
  const acopioVistas: PuntoAcopioVista[] = useMemo(() => {
    if (datos === null) return [];
    return datos.puntosAcopio.map((punto) =>
      derivarPuntoAcopioVista(punto, {
        empresas: datos.empresas,
        categorias: datos.categorias,
        eventos: datos.eventos,
        recursos: datos.recursos,
      }),
    );
  }, [datos]);

  // Se memoizan para evitar nuevas referencias de arreglo en cada render, que
  // invalidarían el `useMemo` del valor del contexto innecesariamente.
  const puntosRiesgo = useMemo(() => datos?.puntosRiesgo ?? [], [datos]);
  const empresas = useMemo(() => datos?.empresas ?? [], [datos]);
  const categorias = useMemo(() => datos?.categorias ?? [], [datos]);
  const eventos = useMemo(() => datos?.eventos ?? [], [datos]);
  const recursos = useMemo(() => datos?.recursos ?? [], [datos]);

  // --- Valor del contexto ---------------------------------------------------

  const valor: ValorContextoApp = useMemo(
    () => ({
      estado,
      acopioVistas,
      puntosRiesgo,
      empresas,
      categorias,
      eventos,
      recursos,
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
    }),
    [
      estado,
      acopioVistas,
      puntosRiesgo,
      empresas,
      categorias,
      eventos,
      recursos,
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
    ],
  );

  return <ContextoApp.Provider value={valor}>{children}</ContextoApp.Provider>;
}
