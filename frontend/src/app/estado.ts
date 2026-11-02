/**
 * Estado transversal de la aplicación Real Plaza Contigo y su reducer puro.
 *
 * Define la forma del estado global (`EstadoApp`), las acciones que lo mutan
 * (`AccionApp`), el estado inicial (`estadoInicial`) y la función pura
 * `reducer`. Este módulo NO contiene lógica de servicios ni efectos
 * (carga de datos, mutaciones, persistencia): esa responsabilidad vive en el
 * `AppProvider`/hooks (tarea 6.2). Aquí todo es determinista y sin efectos
 * secundarios.
 *
 * Requisitos cubiertos: 1.3, 1.4 (cambio de modo), 3.5, 3.6 (selección),
 * 10.1 (vista inicial/activa).
 */

import type { ModoApp } from '@/types/domain';
import type { DatosDominio, Vista } from '@/types/ui';
import { VISTA_INICIAL } from '@/app/rutas';

/** Mensaje efímero de retroalimentación mostrado al usuario (Req. 14.5). */
export interface Toast {
  /** Identificador estable para añadir/quitar el toast de la cola. */
  id: string;
  /** Intención del mensaje; determina icono/estilo en la UI. */
  tipo: 'exito' | 'error' | 'info';
  /** Texto a mostrar. */
  mensaje: string;
}

/**
 * Estado global de la aplicación. Agrupa el modo y la vista activos, los datos
 * del dominio cargados, las banderas de carga/error, la selección actual, la
 * bandera de modo demostración y la cola de toasts.
 */
export interface EstadoApp {
  /** Modo activo de la plataforma: centros de acopio o puntos de riesgo. */
  modo: ModoApp;
  /** Vista activa: mapa o panel de administración. */
  vista: Vista;
  /** Colecciones del dominio; `null` mientras aún no se han cargado. */
  datos: DatosDominio | null;
  /** `true` mientras una carga inicial está en curso. */
  cargando: boolean;
  /** Mensaje de error de la carga, o `null` si no hay error. */
  error: string | null;
  /** ID del punto/zona seleccionada, o `null` si no hay selección. */
  seleccionId: string | null;
  /** Tipo del elemento seleccionado (acopio/riesgo), o `null` sin selección. */
  seleccionTipo: ModoApp | null;
  /** `true` si los datos provienen del respaldo de demostración (Req. 12.3). */
  modoDemo: boolean;
  /** Cola de mensajes efímeros de éxito/error/info. */
  toasts: Toast[];
}

/**
 * Acciones que el reducer sabe procesar, modeladas como unión discriminada por
 * el campo `tipo`.
 */
export type AccionApp =
  /** Cambia el modo activo; limpia la selección vigente. */
  | { tipo: 'CAMBIAR_MODO'; modo: ModoApp }
  /** Cambia la vista activa (mapa/administración). */
  | { tipo: 'CAMBIAR_VISTA'; vista: Vista }
  /** Marca el inicio de una carga de datos. */
  | { tipo: 'CARGA_INICIO' }
  /** Carga resuelta con éxito; indica si proviene del respaldo demo. */
  | { tipo: 'CARGA_EXITO'; datos: DatosDominio; esDemo: boolean }
  /** Carga fallida con el mensaje de error. */
  | { tipo: 'CARGA_ERROR'; error: string }
  /** Selecciona un punto/zona por ID y tipo. */
  | { tipo: 'SELECCIONAR'; id: string; tipoSel: ModoApp }
  /** Limpia la selección vigente. */
  | { tipo: 'LIMPIAR_SELECCION' }
  /** Reemplaza las colecciones del dominio (refresco tras mutaciones). */
  | { tipo: 'SET_DATOS'; datos: DatosDominio }
  /** Agrega un toast a la cola. */
  | { tipo: 'TOAST_AGREGAR'; toast: Toast }
  /** Quita un toast de la cola por su ID. */
  | { tipo: 'TOAST_QUITAR'; id: string };

/** Estado inicial de la aplicación antes de cargar datos. */
export const estadoInicial: EstadoApp = {
  modo: 'acopio',
  vista: VISTA_INICIAL,
  datos: null,
  cargando: false,
  error: null,
  seleccionId: null,
  seleccionTipo: null,
  modoDemo: false,
  toasts: [],
};

/**
 * Reducer puro de la aplicación: dado el estado actual y una acción, devuelve
 * el siguiente estado sin mutar el anterior ni producir efectos secundarios.
 */
export function reducer(estado: EstadoApp, accion: AccionApp): EstadoApp {
  switch (accion.tipo) {
    case 'CAMBIAR_MODO':
      // Al cambiar de modo se limpia la selección para evitar referencias a un
      // elemento que no pertenece al modo recién activado (Req. 1.3, 1.4).
      return {
        ...estado,
        modo: accion.modo,
        seleccionId: null,
        seleccionTipo: null,
      };

    case 'CAMBIAR_VISTA':
      return { ...estado, vista: accion.vista };

    case 'CARGA_INICIO':
      return { ...estado, cargando: true, error: null };

    case 'CARGA_EXITO':
      return {
        ...estado,
        datos: accion.datos,
        cargando: false,
        error: null,
        modoDemo: accion.esDemo,
      };

    case 'CARGA_ERROR':
      return { ...estado, cargando: false, error: accion.error };

    case 'SELECCIONAR':
      return {
        ...estado,
        seleccionId: accion.id,
        seleccionTipo: accion.tipoSel,
      };

    case 'LIMPIAR_SELECCION':
      return { ...estado, seleccionId: null, seleccionTipo: null };

    case 'SET_DATOS':
      return { ...estado, datos: accion.datos };

    case 'TOAST_AGREGAR':
      return { ...estado, toasts: [...estado.toasts, accion.toast] };

    case 'TOAST_QUITAR':
      return {
        ...estado,
        toasts: estado.toasts.filter((t) => t.id !== accion.id),
      };

    default:
      // Exhaustividad: si se añade una acción nueva sin manejarla, TypeScript
      // marcará error aquí.
      return estado;
  }
}
