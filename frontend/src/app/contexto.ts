/**
 * Contexto React de la aplicación Real Plaza Contigo y su hook de consumo.
 *
 * Define la forma del valor expuesto por el `AppProvider` (`ValorContextoApp`),
 * el objeto de contexto (`ContextoApp`) y el hook `useApp()` que lo consume de
 * forma segura (lanza si se usa fuera del provider).
 *
 * Se separa del `AppProvider.tsx` para que los componentes puedan importar solo
 * el hook/el tipo sin arrastrar la lógica de efectos del provider, y para
 * mantener estable la referencia del contexto entre recargas de módulo.
 *
 * IMPORTANTE: todos los datos expuestos aquí son ficticios y de demostración.
 * No representan operaciones, sedes, emergencias ni ubicaciones reales de Real
 * Plaza.
 */

import { createContext, useContext } from 'react';

import type {
  Categoria,
  Empresa,
  Evento,
  ModoApp,
  PuntoAcopioInput,
  PuntoRiesgo,
  PuntoRiesgoInput,
  Recurso,
} from '@/types/domain';
import type { PuntoAcopioVista, Vista } from '@/types/ui';
import type { EstadoApp, Toast } from '@/app/estado';

/**
 * Valor expuesto por el `AppProvider`: el estado global, las colecciones
 * derivadas/crudas listas para la presentación y todas las acciones que mutan
 * el estado o llaman a la Capa de Servicios.
 */
export interface ValorContextoApp {
  /** Estado global de la aplicación (modo, vista, selección, toasts, etc.). */
  estado: EstadoApp;

  // --- Colecciones para la presentación ---
  /** Puntos de acopio enriquecidos (view-models) derivados de los datos. */
  acopioVistas: PuntoAcopioVista[];
  /** Puntos de riesgo crudos del dominio. */
  puntosRiesgo: PuntoRiesgo[];
  /** Sedes y aliados (empresas) del dominio. */
  empresas: Empresa[];
  /** Categorías atendidas. */
  categorias: Categoria[];
  /** Eventos/desastres de demostración. */
  eventos: Evento[];
  /** Recursos de todos los puntos de acopio. */
  recursos: Recurso[];

  // --- Acciones de navegación/selección ---
  /** Cambia el modo activo (acopio/riesgo); limpia la selección. */
  cambiarModo: (modo: ModoApp) => void;
  /** Cambia la vista activa (mapa/administración). */
  cambiarVista: (vista: Vista) => void;
  /** Selecciona un punto/zona por ID y tipo. */
  seleccionar: (id: string, tipo: ModoApp) => void;
  /** Limpia la selección vigente. */
  limpiarSeleccion: () => void;

  // --- Acciones CRUD de acopio ---
  /** Crea un centro de acopio y refresca las colecciones. */
  crearAcopio: (input: PuntoAcopioInput) => Promise<void>;
  /** Edita un centro de acopio existente y refresca las colecciones. */
  editarAcopio: (id: string, input: PuntoAcopioInput) => Promise<void>;
  /** Elimina un centro de acopio y refresca las colecciones. */
  eliminarAcopio: (id: string) => Promise<void>;

  // --- Acciones CRUD de riesgo ---
  /** Crea un reporte de riesgo y refresca las colecciones. */
  crearRiesgo: (input: PuntoRiesgoInput) => Promise<void>;
  /** Edita parcialmente un reporte de riesgo y refresca las colecciones. */
  editarRiesgo: (id: string, cambios: Partial<PuntoRiesgo>) => Promise<void>;
  /** Marca un reporte de riesgo como resuelto y refresca las colecciones. */
  resolverRiesgo: (id: string) => Promise<void>;
  /** Elimina un reporte de riesgo y refresca las colecciones. */
  eliminarRiesgo: (id: string) => Promise<void>;

  // --- Modo demostración ---
  /** Restaura los datos iniciales de demostración (solo Modo_Demo). */
  restaurarDemo: () => Promise<void>;

  // --- Toasts ---
  /** Muestra un toast; genera su ID internamente. */
  mostrarToast: (tipo: Toast['tipo'], mensaje: string) => void;
  /** Quita un toast de la cola por su ID. */
  quitarToast: (id: string) => void;
}

/**
 * Contexto de la aplicación. Su valor inicial es `null`: cualquier consumo
 * fuera del `AppProvider` se detecta en `useApp()` y lanza un error claro.
 */
export const ContextoApp = createContext<ValorContextoApp | null>(null);

ContextoApp.displayName = 'ContextoApp';

/**
 * Hook de consumo del contexto de la aplicación.
 *
 * @returns El valor del contexto (estado + colecciones + acciones).
 * @throws Error si se invoca fuera de un `AppProvider`.
 */
export function useApp(): ValorContextoApp {
  const valor = useContext(ContextoApp);
  if (valor === null) {
    throw new Error('useApp debe usarse dentro de un <AppProvider>.');
  }
  return valor;
}
