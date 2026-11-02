/**
 * Rutas de reportes de riesgo.
 *   GET    /puntos-riesgo             -> listado
 *   GET    /puntos-riesgo/:id         -> detalle
 *   POST   /puntos-riesgo             -> crear (estado inicial 'activo')
 *   PUT    /puntos-riesgo/:id         -> editar (parcial)
 *   POST   /puntos-riesgo/:id/resolver-> marcar como resuelto
 *   DELETE /puntos-riesgo/:id         -> eliminar
 */
import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateBody } from '../../middlewares/validate';
import { puntoRiesgoInputSchema, puntoRiesgoPatchSchema } from './puntosRiesgo.schema';
import * as ctrl from './puntosRiesgo.controller';

export const puntosRiesgoRouter = Router();

puntosRiesgoRouter.get('/', asyncHandler(ctrl.listar));
puntosRiesgoRouter.get('/:id', asyncHandler(ctrl.obtener));
puntosRiesgoRouter.post('/', validateBody(puntoRiesgoInputSchema), asyncHandler(ctrl.crear));
puntosRiesgoRouter.put('/:id', validateBody(puntoRiesgoPatchSchema), asyncHandler(ctrl.editar));
puntosRiesgoRouter.post('/:id/resolver', asyncHandler(ctrl.resolver));
puntosRiesgoRouter.delete('/:id', asyncHandler(ctrl.eliminar));
