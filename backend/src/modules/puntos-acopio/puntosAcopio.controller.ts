/**
 * Controladores HTTP de puntos de acopio. Orquestan la petición/respuesta y
 * delegan la lógica en el servicio. Sin lógica de negocio aquí.
 */
import type { Request, Response } from 'express';
import * as servicio from './puntosAcopio.service';
import { cercaQuerySchema, type PuntoAcopioInputDTO } from './puntosAcopio.schema';

export async function listar(req: Request, res: Response): Promise<void> {
  // Si vienen parámetros de cercanía, delega a la consulta geoespacial.
  if (req.query.lat !== undefined || req.query.lng !== undefined || req.query.radio !== undefined) {
    const { lat, lng, radio } = cercaQuerySchema.parse(req.query);
    res.json(await servicio.buscarCerca(lat, lng, radio));
    return;
  }
  res.json(await servicio.listar());
}

export async function obtener(req: Request, res: Response): Promise<void> {
  res.json(await servicio.obtener(req.params.id));
}

export async function crear(req: Request, res: Response): Promise<void> {
  const punto = await servicio.crear(req.body as PuntoAcopioInputDTO);
  res.status(201).json(punto);
}

export async function editar(req: Request, res: Response): Promise<void> {
  const punto = await servicio.editar(req.params.id, req.body as PuntoAcopioInputDTO);
  res.json(punto);
}

export async function eliminar(req: Request, res: Response): Promise<void> {
  await servicio.eliminar(req.params.id);
  res.status(204).send();
}
