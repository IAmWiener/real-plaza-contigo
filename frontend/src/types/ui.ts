/**
 * Tipos de UI de Real Plaza Contigo: view-models enriquecidos, modelos de
 * filtrado, borrador de reporte y agregados de datos del dominio.
 *
 * Estos tipos se construyen sobre las entidades y enums del dominio
 * (`types/domain.ts`) sin redefinirlos. Reutilizan sus definiciones para
 * mantener coherencia entre backend, servicios y presentación.
 *
 * IMPORTANTE: todos los datos basados en estos tipos son ficticios y de
 * demostración. No representan operaciones, sedes, emergencias ni ubicaciones
 * reales de Real Plaza.
 */

import type {
  Categoria,
  Coordenada,
  Empresa,
  EstadoOperativo,
  EstadoReporte,
  Evento,
  PuntoAcopio,
  PuntoRiesgo,
  Recurso,
  SeveridadRiesgo,
  TipoIncidente,
} from '@/types/domain';

/**
 * Punto de acopio enriquecido para presentación: resuelve las relaciones por ID
 * del `PuntoAcopio` (sede, aliados, categorías, evento y recursos) y agrega el
 * nivel de ocupación ya calculado.
 */
export interface PuntoAcopioVista extends PuntoAcopio {
  /** Sede de Real Plaza responsable, o `null` si no se pudo resolver. */
  sede: Empresa | null;
  /** Aliados participantes resueltos a partir de `aliadoIds`. */
  aliados: Empresa[];
  /** Categorías atendidas resueltas a partir de `categoriaIds`. */
  categorias: Categoria[];
  /** Evento asociado, o `null` si no aplica o no se pudo resolver. */
  evento: Evento | null;
  /** Recursos disponibles en este punto de acopio. */
  recursos: Recurso[];
  /**
   * Nivel de ocupación en porcentaje, acotado a `[0, 100]`. Se calcula con
   * `nivelOcupacion(capacidad, ocupacion)` de `utils/format.ts`.
   */
  ocupacionPct: number;
}

/**
 * Estado de filtrado para el modo de centros de acopio. Los valores por defecto
 * representan "sin filtro" (`texto: ''`, selects en `null`), de modo que el
 * conjunto filtrado por defecto es la colección completa.
 */
export interface FiltrosAcopio {
  /** Texto de búsqueda libre (nombre, sede, aliado, dirección o distrito). */
  texto: string;
  /** Categoría atendida a filtrar, o `null` para no filtrar por categoría. */
  categoriaId: string | null;
  /** Estado operativo a filtrar, o `null` para no filtrar por estado. */
  estado: EstadoOperativo | null;
  /** Evento asociado a filtrar, o `null` para no filtrar por evento. */
  eventoId: string | null;
  /** Distrito a filtrar, o `null` para no filtrar por distrito. */
  distrito: string | null;
}

/**
 * Estado de filtrado para el modo de puntos de riesgo. Los valores por defecto
 * representan "sin filtro" (`texto: ''`, selects en `null`).
 */
export interface FiltrosRiesgo {
  /** Texto de búsqueda libre (descripción, tipo de incidente o distrito). */
  texto: string;
  /** Tipo de incidente a filtrar, o `null` para no filtrar por tipo. */
  tipo: TipoIncidente | null;
  /** Nivel de severidad a filtrar, o `null` para no filtrar por severidad. */
  severidad: SeveridadRiesgo | null;
  /** Estado del reporte a filtrar, o `null` para no filtrar por estado. */
  estado: EstadoReporte | null;
}

/** Resultado de aplicar un conjunto de filtros sobre una colección. */
export interface ResultadoFiltro<T> {
  /** Elementos que pasan los filtros, en el orden de presentación. */
  items: T[];
  /** Cantidad total de elementos filtrados (longitud de `items`). */
  total: number;
}

/**
 * Reporte de riesgo en construcción durante el flujo de marcado sobre el mapa.
 * Se completa paso a paso (ubicar, ajustar radio, detallar) antes de confirmar.
 */
export interface BorradorReporte {
  /** Centro del área elegido en el mapa, o `null` si aún no se ubicó. */
  coordenada: Coordenada | null;
  /** Radio del área perimetral afectada, en metros. */
  radioMetros: number;
  /** Tipo de incidente, o `null` si aún no se eligió. */
  tipo: TipoIncidente | null;
  /** Nivel de severidad, o `null` si aún no se eligió. */
  severidad: SeveridadRiesgo | null;
  /** Descripción breve del incidente. */
  descripcion: string;
}

/** Vista activa de la aplicación: mapa, panel de administración o resumen. */
export type Vista = 'mapa' | 'administracion' | 'resumen';

/**
 * Agregado de todas las colecciones del dominio tal como las entrega la Capa de
 * Servicios (`cargarTodo`). Es el conjunto de datos del sistema en un instante.
 */
export interface DatosDominio {
  empresas: Empresa[];
  categorias: Categoria[];
  eventos: Evento[];
  recursos: Recurso[];
  puntosAcopio: PuntoAcopio[];
  puntosRiesgo: PuntoRiesgo[];
}
