/**
 * Mapeadores de entidades Prisma al contrato serializado que consume el
 * frontend. Centralizan la forma de salida (fechas ISO, coordenada {lat,lng},
 * relaciones por ID) para que todos los módulos devuelvan estructuras idénticas.
 */
import type {
  Empresa,
  Categoria,
  Evento,
  Recurso,
  PuntoAcopio,
  PuntoRiesgo,
  EstadoOperativo,
  EstadoDisponibilidad,
  EstadoEvento,
  EstadoReporte,
  SeveridadRiesgo,
  TipoDesastre,
  TipoIncidente,
} from '../../types/domain';

// Tipos laxos de las filas de Prisma (evita acoplar a los tipos generados).
type FilaEmpresa = {
  id: string;
  nombre: string;
  tipo: string;
  ruc: string;
  distrito: string;
  telefono: string;
};

type FilaCategoria = {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
};

type FilaEvento = {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  fechaInicio: Date;
  estado: string;
  zonaAfectada: string;
};

type FilaRecurso = {
  id: string;
  puntoAcopioId: string;
  nombre: string;
  unidad: string;
  cantidadDisponible: number;
  cantidadComprometida: number;
  estado: string;
};

type FilaPuntoAcopio = {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
  sedeId: string;
  eventoId: string | null;
  direccion: string;
  distrito: string;
  lat: number;
  lng: number;
  horario: string;
  contactoNombre: string;
  contactoTelefono: string;
  capacidad: number;
  ocupacion: number;
  actualizadoEn: Date;
  observaciones: string;
  categorias?: { categoriaId: string }[];
  aliados?: { empresaId: string }[];
};

type FilaPuntoRiesgo = {
  id: string;
  tipo: string;
  severidad: string;
  descripcion: string;
  lat: number;
  lng: number;
  radioMetros: number;
  distrito: string;
  estado: string;
  reportadoEn: Date;
};

export function mapEmpresa(f: FilaEmpresa): Empresa {
  return {
    id: f.id,
    nombre: f.nombre,
    tipo: f.tipo as Empresa['tipo'],
    ruc: f.ruc,
    distrito: f.distrito,
    telefono: f.telefono,
  };
}

export function mapCategoria(f: FilaCategoria): Categoria {
  return {
    id: f.id,
    nombre: f.nombre,
    icono: f.icono,
    descripcion: f.descripcion,
  };
}

export function mapEvento(f: FilaEvento): Evento {
  return {
    id: f.id,
    nombre: f.nombre,
    tipo: f.tipo as TipoDesastre,
    descripcion: f.descripcion,
    fechaInicio: f.fechaInicio.toISOString(),
    estado: f.estado as EstadoEvento,
    zonaAfectada: f.zonaAfectada,
  };
}

export function mapRecurso(f: FilaRecurso): Recurso {
  return {
    id: f.id,
    puntoAcopioId: f.puntoAcopioId,
    nombre: f.nombre,
    unidad: f.unidad,
    cantidadDisponible: f.cantidadDisponible,
    cantidadComprometida: f.cantidadComprometida,
    estado: f.estado as EstadoDisponibilidad,
  };
}

export function mapPuntoAcopio(f: FilaPuntoAcopio): PuntoAcopio {
  return {
    id: f.id,
    codigo: f.codigo,
    nombre: f.nombre,
    estado: f.estado as EstadoOperativo,
    categoriaIds: (f.categorias ?? []).map((c) => c.categoriaId),
    sedeId: f.sedeId,
    aliadoIds: (f.aliados ?? []).map((a) => a.empresaId),
    eventoId: f.eventoId,
    direccion: f.direccion,
    distrito: f.distrito,
    coordenada: { lat: f.lat, lng: f.lng },
    horario: f.horario,
    contactoNombre: f.contactoNombre,
    contactoTelefono: f.contactoTelefono,
    capacidad: f.capacidad,
    ocupacion: f.ocupacion,
    actualizadoEn: f.actualizadoEn.toISOString(),
    observaciones: f.observaciones,
  };
}

export function mapPuntoRiesgo(f: FilaPuntoRiesgo): PuntoRiesgo {
  return {
    id: f.id,
    tipo: f.tipo as TipoIncidente,
    severidad: f.severidad as SeveridadRiesgo,
    descripcion: f.descripcion,
    coordenada: { lat: f.lat, lng: f.lng },
    radioMetros: f.radioMetros,
    distrito: f.distrito,
    estado: f.estado as EstadoReporte,
    reportadoEn: f.reportadoEn.toISOString(),
  };
}
