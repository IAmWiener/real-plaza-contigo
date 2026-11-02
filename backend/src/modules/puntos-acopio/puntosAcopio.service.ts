/**
 * Lógica de negocio de puntos de acopio.
 *
 * Mantiene las relaciones (categorías y aliados) mediante las tablas puente y
 * sincroniza la columna PostGIS `geom geography(Point,4326)` en cada
 * creación/edición para que las consultas geoespaciales (`buscarCerca`) usen un
 * índice espacial real (`ST_DWithin`).
 *
 * Todos los datos son ficticios y de demostración.
 */
import { prisma } from '../../config/prisma';
import { HttpError } from '../../utils/httpError';
import { mapPuntoAcopio } from '../shared/mappers';
import type { PuntoAcopio } from '../../types/domain';
import type { PuntoAcopioInputDTO } from './puntosAcopio.schema';

const includeRelaciones = {
  categorias: { select: { categoriaId: true } },
  aliados: { select: { empresaId: true } },
} as const;

/** Genera un ID estable para nuevos puntos creados desde la API. */
function nuevoId(): string {
  return `pa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Actualiza la columna PostGIS `geom` a partir de lat/lng. */
async function sincronizarGeom(id: string, lat: number, lng: number): Promise<void> {
  // $executeRaw con parámetros evita inyección SQL.
  await prisma.$executeRaw`
    UPDATE puntos_acopio
    SET geom = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
    WHERE id = ${id}
  `;
}

export async function listar(): Promise<PuntoAcopio[]> {
  const filas = await prisma.puntoAcopio.findMany({
    include: includeRelaciones,
    orderBy: { nombre: 'asc' },
  });
  return filas.map(mapPuntoAcopio);
}

export async function obtener(id: string): Promise<PuntoAcopio> {
  const fila = await prisma.puntoAcopio.findUnique({
    where: { id },
    include: includeRelaciones,
  });
  if (!fila) throw HttpError.noEncontrado('Punto de acopio no encontrado.');
  return mapPuntoAcopio(fila);
}

export async function crear(input: PuntoAcopioInputDTO): Promise<PuntoAcopio> {
  const id = nuevoId();
  await prisma.puntoAcopio.create({
    data: {
      id,
      codigo: input.codigo,
      nombre: input.nombre,
      estado: input.estado,
      sedeId: input.sedeId,
      eventoId: input.eventoId,
      direccion: input.direccion,
      distrito: input.distrito,
      lat: input.coordenada.lat,
      lng: input.coordenada.lng,
      horario: input.horario,
      contactoNombre: input.contactoNombre,
      contactoTelefono: input.contactoTelefono,
      capacidad: input.capacidad,
      ocupacion: input.ocupacion,
      observaciones: input.observaciones,
      actualizadoEn: new Date(),
      categorias: { create: input.categoriaIds.map((categoriaId) => ({ categoriaId })) },
      aliados: { create: input.aliadoIds.map((empresaId) => ({ empresaId })) },
    },
  });
  await sincronizarGeom(id, input.coordenada.lat, input.coordenada.lng);
  return obtener(id);
}

export async function editar(id: string, input: PuntoAcopioInputDTO): Promise<PuntoAcopio> {
  const existe = await prisma.puntoAcopio.findUnique({ where: { id } });
  if (!existe) throw HttpError.noEncontrado('Punto de acopio no encontrado.');

  // Reemplazo total de relaciones de unión dentro de una transacción.
  await prisma.$transaction([
    prisma.categoriaPunto.deleteMany({ where: { puntoAcopioId: id } }),
    prisma.aliadoPunto.deleteMany({ where: { puntoAcopioId: id } }),
    prisma.puntoAcopio.update({
      where: { id },
      data: {
        codigo: input.codigo,
        nombre: input.nombre,
        estado: input.estado,
        sedeId: input.sedeId,
        eventoId: input.eventoId,
        direccion: input.direccion,
        distrito: input.distrito,
        lat: input.coordenada.lat,
        lng: input.coordenada.lng,
        horario: input.horario,
        contactoNombre: input.contactoNombre,
        contactoTelefono: input.contactoTelefono,
        capacidad: input.capacidad,
        ocupacion: input.ocupacion,
        observaciones: input.observaciones,
        actualizadoEn: new Date(),
        categorias: { create: input.categoriaIds.map((categoriaId) => ({ categoriaId })) },
        aliados: { create: input.aliadoIds.map((empresaId) => ({ empresaId })) },
      },
    }),
  ]);
  await sincronizarGeom(id, input.coordenada.lat, input.coordenada.lng);
  return obtener(id);
}

export async function eliminar(id: string): Promise<void> {
  const existe = await prisma.puntoAcopio.findUnique({ where: { id } });
  if (!existe) throw HttpError.noEncontrado('Punto de acopio no encontrado.');
  // Las relaciones y recursos se borran en cascada (onDelete: Cascade).
  await prisma.puntoAcopio.delete({ where: { id } });
}

/**
 * Búsqueda geoespacial: puntos cuyo `geom` está a `radio` metros o menos del
 * punto (lat,lng), usando el índice espacial de PostGIS (`ST_DWithin`).
 */
export async function buscarCerca(
  lat: number,
  lng: number,
  radio: number,
): Promise<PuntoAcopio[]> {
  const filas = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM puntos_acopio
    WHERE geom IS NOT NULL
      AND ST_DWithin(
        geom,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radio}
      )
    ORDER BY ST_Distance(
      geom,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
    ) ASC
  `;
  const ids = filas.map((f) => f.id);
  if (ids.length === 0) return [];

  const puntos = await prisma.puntoAcopio.findMany({
    where: { id: { in: ids } },
    include: includeRelaciones,
  });
  // Preservamos el orden por distancia devuelto por PostGIS.
  const porId = new Map(puntos.map((p) => [p.id, mapPuntoAcopio(p)]));
  return ids.map((id) => porId.get(id)).filter((p): p is PuntoAcopio => Boolean(p));
}
