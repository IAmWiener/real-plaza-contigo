/**
 * Tipos del dominio de Real Plaza Contigo.
 *
 * IMPORTANTE: todos los datos basados en estos tipos son ficticios y de
 * demostración. No representan operaciones, sedes, emergencias ni ubicaciones
 * reales de Real Plaza.
 */

/** Coordenada geográfica (WGS84). */
export interface Coordenada {
  lat: number;
  lng: number;
}

/** Estado operativo de un centro de acopio. */
export type EstadoOperativo =
  | 'operativo'
  | 'capacidad_limitada'
  | 'saturado'
  | 'cerrado';

/** Tipo de desastre / evento. */
export type TipoDesastre =
  | 'inundacion'
  | 'sismo'
  | 'deslizamiento'
  | 'lluvias_intensas';

/** Estado del ciclo de vida de un evento. */
export type EstadoEvento = 'activo' | 'monitoreo' | 'cerrado';

/** Tipo de incidente para un punto de riesgo reportado. */
export type TipoIncidente =
  | 'inundacion'
  | 'derrumbe'
  | 'incendio'
  | 'sismo'
  | 'via_bloqueada'
  | 'otro';

/** Nivel de severidad de un punto de riesgo. */
export type SeveridadRiesgo = 'bajo' | 'medio' | 'alto' | 'critico';

/** Estado de verificación de un reporte de riesgo. */
export type EstadoReporte = 'activo' | 'en_verificacion' | 'resuelto';

/** Estado de disponibilidad de un recurso. */
export type EstadoDisponibilidad = 'disponible' | 'bajo' | 'agotado';

/**
 * Empresa / sede. Representa un centro comercial de Real Plaza o un aliado
 * participante. Datos ficticios de demostración.
 */
export interface Empresa {
  id: string;
  nombre: string;
  /** Si es una sede propia de Real Plaza o un aliado participante. */
  tipo: 'sede' | 'aliado';
  /** RUC ficticio, solo para demostración. */
  ruc: string;
  distrito: string;
  telefono: string;
}

/** Categoría de recursos atendidos por un punto de acopio. */
export interface Categoria {
  id: string;
  nombre: string;
  /** Nombre del icono de lucide-react asociado. */
  icono: string;
  descripcion: string;
}

/** Evento o desastre natural (ficticio). */
export interface Evento {
  id: string;
  nombre: string;
  tipo: TipoDesastre;
  descripcion: string;
  /** Fecha de inicio en formato ISO 8601. */
  fechaInicio: string;
  estado: EstadoEvento;
  zonaAfectada: string;
}

/** Recurso disponible en un punto de acopio. */
export interface Recurso {
  id: string;
  puntoAcopioId: string;
  nombre: string;
  unidad: string;
  cantidadDisponible: number;
  cantidadComprometida: number;
  estado: EstadoDisponibilidad;
}

/** Centro / punto de acopio (ficticio). */
export interface PuntoAcopio {
  id: string;
  codigo: string;
  nombre: string;
  estado: EstadoOperativo;
  /** IDs de las categorías atendidas. */
  categoriaIds: string[];
  /** Sede de Real Plaza responsable. */
  sedeId: string;
  /** IDs de aliados participantes (opcional). */
  aliadoIds: string[];
  /** Evento asociado (opcional). */
  eventoId: string | null;
  direccion: string;
  distrito: string;
  coordenada: Coordenada;
  horario: string;
  contactoNombre: string;
  contactoTelefono: string;
  /** Capacidad total (unidades/personas) usada para el nivel de ocupación. */
  capacidad: number;
  /** Ocupación actual, base del cálculo de disponibilidad. */
  ocupacion: number;
  /** Última actualización simulada en formato ISO 8601. */
  actualizadoEn: string;
  observaciones: string;
}

/**
 * Punto de riesgo reportado por un usuario. Zona perimetral que advierte de un
 * incidente en curso. Reporte ciudadano ficticio de demostración.
 */
export interface PuntoRiesgo {
  id: string;
  tipo: TipoIncidente;
  severidad: SeveridadRiesgo;
  descripcion: string;
  coordenada: Coordenada;
  /** Radio del área perimetral afectada, en metros. */
  radioMetros: number;
  distrito: string;
  estado: EstadoReporte;
  /** Fecha y hora del reporte en formato ISO 8601. */
  reportadoEn: string;
}

/** Modo activo de la plataforma. */
export type ModoApp = 'acopio' | 'riesgo';

/** Payloads para crear/editar (sin campos autogenerados). */
export type PuntoAcopioInput = Omit<PuntoAcopio, 'id' | 'actualizadoEn'>;
export type PuntoRiesgoInput = Omit<PuntoRiesgo, 'id' | 'reportadoEn' | 'estado'>;
