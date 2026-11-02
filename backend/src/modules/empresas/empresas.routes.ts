/**
 * Rutas de Empresas (sedes de Real Plaza y aliados). Solo lectura.
 * GET /empresas
 */
import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { mapEmpresa } from '../shared/mappers';

export const empresasRouter = Router();

empresasRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const filas = await prisma.empresa.findMany({ orderBy: { nombre: 'asc' } });
    res.json(filas.map(mapEmpresa));
  }),
);
