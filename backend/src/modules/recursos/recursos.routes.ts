/**
 * Rutas de Recursos. Solo lectura (listado global; el frontend los agrupa por
 * punto de acopio mediante `puntoAcopioId`).
 * GET /recursos
 */
import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { mapRecurso } from '../shared/mappers';

export const recursosRouter = Router();

recursosRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const filas = await prisma.recurso.findMany({ orderBy: { id: 'asc' } });
    res.json(filas.map(mapRecurso));
  }),
);
