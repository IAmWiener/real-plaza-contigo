/**
 * Rutas de Categorías. Solo lectura.
 * GET /categorias
 */
import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { mapCategoria } from '../shared/mappers';

export const categoriasRouter = Router();

categoriasRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const filas = await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
    res.json(filas.map(mapCategoria));
  }),
);
