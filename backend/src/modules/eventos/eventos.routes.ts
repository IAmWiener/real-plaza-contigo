/**
 * Rutas de Eventos / desastres. Solo lectura.
 * GET /eventos
 */
import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { mapEvento } from '../shared/mappers';

export const eventosRouter = Router();

eventosRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const filas = await prisma.evento.findMany({ orderBy: { fechaInicio: 'desc' } });
    res.json(filas.map(mapEvento));
  }),
);
