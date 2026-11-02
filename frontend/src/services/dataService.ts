/**
 * Capa de Servicios de Real Plaza Contigo: contrato de acceso a datos.
 *
 * Este módulo define ÚNICAMENTE la interfaz `DataService` y el tipo de error
 * uniforme que comparten sus implementaciones. Es la única puerta de acceso a
 * los datos del dominio desde la UI (nunca se hacen llamadas dispersas a la API
 * ni a `localStorage` fuera de aquí).
 *
 * La fuente de verdad es la API del backend (PostgreSQL + PostGIS). En
 * desarrollo, o cuando `VITE_API_BASE_URL` no está configurada o la API no
 * responde, se usa una implementación mock con `localStorage` como respaldo
 * (Modo_Demo), identificada por `esDemo = true`.
 *
 * Las implementaciones concretas se definen en archivos separados y llegan en
 * tareas posteriores:
 *  - `MockDataService`  (tarea 3.2) — mocks + `storage.ts`, Modo_Demo.
 *  - `ApiDataService`   (tarea 3.3) — cliente `fetch` con fallback a mock.
 *  - `crearDataService` (tarea 3.4) — fábrica que selecciona según el entorno.
 *
 * IMPORTANTE: todos los datos expuestos por esta capa son ficticios y de
 * demostración. No representan operaciones, sedes, emergencias ni ubicaciones
 * reales de Real Plaza.
 */

import type {
  PuntoAcopio,
  PuntoAcopioInput,
  PuntoRiesgo,
  PuntoRiesgoInput,
} from '@/types/domain';
import type { DatosDominio } from '@/types/ui';

/**
 * Agregado de todas las colecciones del dominio devuelto por `cargarTodo`.
 *
 * Se reexporta desde `@/types/ui` (no se redefine aquí) para que los
 * consumidores de la Capa de Servicios puedan importarlo junto al contrato,
 * manteniendo una única definición del tipo.
 */
export type { DatosDominio };

/**
 * Error uniforme de la Capa de Servicios. Las implementaciones normalizan los
 * fallos (red, validación, no encontrado, etc.) a esta forma para que la UI
 * pueda mostrar mensajes claros sin depender del origen del error.
 */
export class ErrorDataService extends Error {
  /** Código HTTP cuando el error proviene de la API (opcional). */
  readonly estado?: number;
  /** Identificador estable del tipo de error para lógica de UI (opcional). */
  readonly codigo?: string;
  /** Causa original del error, si la hay (opcional). */
  readonly causa?: unknown;

  constructor(
    mensaje: string,
    opciones: { estado?: number; codigo?: string; causa?: unknown } = {},
  ) {
    super(mensaje);
    this.name = 'ErrorDataService';
    this.estado = opciones.estado;
    this.codigo = opciones.codigo;
    this.causa = opciones.causa;
  }
}

/**
 * Contrato de la Capa de Servicios. Define la carga inicial de datos y las
 * operaciones CRUD de centros de acopio y reportes de riesgo.
 *
 * Toda mutación devuelve la entidad resultante (o `void` al eliminar) para que
 * el estado global pueda refrescar las colecciones y reflejar los cambios de
 * inmediato en el mapa y las listas.
 */
export interface DataService {
  /**
   * `true` cuando la instancia opera en Modo_Demo (datos mock + `localStorage`)
   * en lugar de la API real. Permite a la UI señalar claramente el modo
   * demostración.
   */
  readonly esDemo: boolean;

  /**
   * Carga todas las colecciones del dominio: empresas, categorías, eventos,
   * recursos, puntos de acopio y puntos de riesgo.
   */
  cargarTodo(): Promise<DatosDominio>;

  /** Crea un centro de acopio y devuelve la entidad con su ID generado. */
  crearAcopio(input: PuntoAcopioInput): Promise<PuntoAcopio>;

  /** Edita un centro de acopio existente identificado por `id`. */
  editarAcopio(id: string, input: PuntoAcopioInput): Promise<PuntoAcopio>;

  /** Elimina un centro de acopio identificado por `id`. */
  eliminarAcopio(id: string): Promise<void>;

  /** Crea un reporte de riesgo y devuelve la entidad con su ID generado. */
  crearRiesgo(input: PuntoRiesgoInput): Promise<PuntoRiesgo>;

  /** Edita parcialmente un reporte de riesgo existente identificado por `id`. */
  editarRiesgo(id: string, cambios: Partial<PuntoRiesgo>): Promise<PuntoRiesgo>;

  /** Marca un reporte de riesgo como resuelto (estado → `'resuelto'`). */
  resolverRiesgo(id: string): Promise<PuntoRiesgo>;

  /** Elimina un reporte de riesgo identificado por `id`. */
  eliminarRiesgo(id: string): Promise<void>;

  /**
   * Restaura los datos iniciales de demostración. Solo tiene efecto en
   * Modo_Demo; en una implementación respaldada por API es una operación no
   * aplicable.
   */
  restaurarDemo(): Promise<void>;
}
