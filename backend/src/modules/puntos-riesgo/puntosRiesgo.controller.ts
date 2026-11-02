/**
 * Controladores HTTP de reportes de riesgo. Delegan en el servicio.
 */
import type { Request, Response } from 'express';
import * as servicio from './puntosRiesgo.service';
import type { PuntoRiesgoInputDTO, PuntoRiesgoPatchDTO } from './puntosRiesgo.schema';

export async function listar(_req: Request, res: Response): Promise<void> {
  res.json(await servicio.listar());
}

export async function obtener(req: Request, res: Response): Promise<void> {
  res.json(await servicio.obtener(req.params.id));
}

export async function crear(req: Request, res: Response): Promise<void> {
  const punto = await servicio.crear(req.body as PuntoRiesgoInputDTO);
  res.status(201).json(punto);
}

export async function editar(req: Request, res: Response): Promise<void> {
  const punto = await servicio.editar(req.params.id, req.body as PuntoRiesgoPatchDTO);
  res.json(punto);
}

export async function resolver(req: Request, res: Response): Promise<void> {
  const punto = await servicio.resolver(req.params.id);
  res.json(punto);
}

export async function eliminar(req: Request, res: Response): Promise<void> {
  await servicio.eliminar(req.params.id);
  res.status(204).send();
}
