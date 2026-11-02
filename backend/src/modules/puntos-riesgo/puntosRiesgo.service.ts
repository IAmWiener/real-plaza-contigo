/**
 * Lógica de negocio de reportes de riesgo (reportes ciudadanos ficticios).
 *
 * Sincroniza la columna PostGIS `geom geography(Point,4326)` para permitir
 * consultas geoespaciales por cercanía. Los reportes nuevos nacen en estado
 * `'activo'` y `reportadoEn` con la hora del servidor.
 */
import { prisma } from '../../config/prisma';
import { HttpError } from '../../utils/httpError';
import { mapPuntoRiesgo } from '../shared/mappers';
import type { PuntoRiesgo } from '../../types/domain';
import type { PuntoRiesgoInputDTO, PuntoRiesgoPatchDTO } from './puntosRiesgo.schema';

function nuevoId(): string {
  return `pr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

async function sincronizarGeom(id: string, lat: number, lng: number): Promise<void> {
  await prisma.$executeRaw`
    UPDATE puntos_riesgo
    SET geom = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
    WHERE id = ${id}
  `;
}

export async function listar(): Promise<PuntoRiesgo[]> {
  const filas = await prisma.puntoRiesgo.findMany({ orderBy: { reportadoEn: 'desc' } });
  return filas.map(mapPuntoRiesgo);
}

export async function obtener(id: string): Promise<PuntoRiesgo> {
  const fila = await prisma.puntoRiesgo.findUnique({ where: { id } });
  if (!fila) throw HttpError.noEncontrado('Reporte de riesgo no encontrado.');
  return mapPuntoRiesgo(fila);
}

export async function crear(input: PuntoRiesgoInputDTO): Promise<PuntoRiesgo> {
  const id = nuevoId();
  const fila = await prisma.puntoRiesgo.create({
    data: {
      id,
      tipo: input.tipo,
      severidad: input.severidad,
      descripcion: input.descripcion,
      lat: input.coordenada.lat,
      lng: input.coordenada.lng,
      radioMetros: input.radioMetros,
      distrito: input.distrito,
      estado: 'activo',
      reportadoEn: new Date(),
    },
  });
  await sincronizarGeom(id, input.coordenada.lat, input.coordenada.lng);
  return mapPuntoRiesgo(fila);
}

export async function editar(id: string, cambios: PuntoRiesgoPatchDTO): Promise<PuntoRiesgo> {
  const existe = await prisma.puntoRiesgo.findUnique({ where: { id } });
  if (!existe) throw HttpError.noEncontrado('Reporte de riesgo no encontrado.');

  const fila = await prisma.puntoRiesgo.update({
    where: { id },
    data: {
      tipo: cambios.tipo,
      severidad: cambios.severidad,
      descripcion: cambios.descripcion,
      radioMetros: cambios.radioMetros,
      distrito: cambios.distrito,
      estado: cambios.estado,
      ...(cambios.coordenada
        ? { lat: cambios.coordenada.lat, lng: cambios.coordenada.lng }
        : {}),
    },
  });

  if (cambios.coordenada) {
    await sincronizarGeom(id, cambios.coordenada.lat, cambios.coordenada.lng);
  }
  return mapPuntoRiesgo(fila);
}

export async function resolver(id: string): Promise<PuntoRiesgo> {
  const existe = await prisma.puntoRiesgo.findUnique({ where: { id } });
  if (!existe) throw HttpError.noEncontrado('Reporte de riesgo no encontrado.');
  const fila = await prisma.puntoRiesgo.update({
    where: { id },
    data: { estado: 'resuelto' },
  });
  return mapPuntoRiesgo(fila);
}

export async function eliminar(id: string): Promise<void> {
  const existe = await prisma.puntoRiesgo.findUnique({ where: { id } });
  if (!existe) throw HttpError.noEncontrado('Reporte de riesgo no encontrado.');
  await prisma.puntoRiesgo.delete({ where: { id } });
}
