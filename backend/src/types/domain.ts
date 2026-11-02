/**
 * Tipos del dominio de Real Plaza Contigo (backend).
 *
 * Alineados 1:1 con `frontend/src/types/domain.ts`: la API serializa las
 * entidades con estos nombres y relaciones por ID para que el frontend las
 * consuma sin transformaciones adicionales.
 *
 * IMPORTANTE: todos los datos son ficticios y de demostración.
 */

export interface Coordenada {
  lat: number;
  lng: number;
}

export type EstadoOperativo =
  | 'operativo'
  | 'capacidad_limitada'
  | 'saturado'
  | 'cerrado';

export type TipoDesastre =
  | 'inundacion'
  | 'sismo'
  | 'deslizamiento'
  | 'lluvias_intensas';

export type EstadoEvento = 'activo' | 'monitoreo' | 'cerrado';

export type TipoIncidente =
  | 'inundacion'
  | 'derrumbe'
  | 'incendio'
  | 'sismo'
  | 'via_bloqueada'
  | 'otro';

export type SeveridadRiesgo = 'bajo' | 'medio' | 'alto' | 'critico';

export type EstadoReporte = 'activo' | 'en_verificacion' | 'resuelto';

export type EstadoDisponibilidad = 'disponible' | 'bajo' | 'agotado';

export interface Empresa {
  id: string;
  nombre: string;
  tipo: 'sede' | 'aliado';
  ruc: string;
  distrito: string;
  telefono: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
}

export interface Evento {
  id: string;
  nombre: string;
  tipo: TipoDesastre;
  descripcion: string;
  fechaInicio: string;
  estado: EstadoEvento;
  zonaAfectada: string;
}

export interface Recurso {
  id: string;
  puntoAcopioId: string;
  nombre: string;
  unidad: string;
  cantidadDisponible: number;
  cantidadComprometida: number;
  estado: EstadoDisponibilidad;
}

export interface PuntoAcopio {
  id: string;
  codigo: string;
  nombre: string;
  estado: EstadoOperativo;
  categoriaIds: string[];
  sedeId: string;
  aliadoIds: string[];
  eventoId: string | null;
  direccion: string;
  distrito: string;
  coordenada: Coordenada;
  horario: string;
  contactoNombre: string;
  contactoTelefono: string;
  capacidad: number;
  ocupacion: number;
  actualizadoEn: string;
  observaciones: string;
}

export interface PuntoRiesgo {
  id: string;
  tipo: TipoIncidente;
  severidad: SeveridadRiesgo;
  descripcion: string;
  coordenada: Coordenada;
  radioMetros: number;
  distrito: string;
  estado: EstadoReporte;
  reportadoEn: string;
}

export type PuntoAcopioInput = Omit<PuntoAcopio, 'id' | 'actualizadoEn'>;
export type PuntoRiesgoInput = Omit<PuntoRiesgo, 'id' | 'reportadoEn' | 'estado'>;
