/**
 * Rutas de puntos de acopio (CRUD + consulta geoespacial).
 *   GET    /puntos-acopio            -> listado (o ?lat&lng&radio para cercanía)
 *   GET    /puntos-acopio/:id        -> detalle
 *   POST   /puntos-acopio            -> crear
 *   PUT    /puntos-acopio/:id        -> editar
 *   DELETE /puntos-acopio/:id        -> eliminar
 */
import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateBody } from '../../middlewares/validate';
import { puntoAcopioInputSchema } from './puntosAcopio.schema';
import * as ctrl from './puntosAcopio.controller';

export const puntosAcopioRouter = Router();

puntosAcopioRouter.get('/', asyncHandler(ctrl.listar));
puntosAcopioRouter.get('/:id', asyncHandler(ctrl.obtener));
puntosAcopioRouter.post('/', validateBody(puntoAcopioInputSchema), asyncHandler(ctrl.crear));
puntosAcopioRouter.put('/:id', validateBody(puntoAcopioInputSchema), asyncHandler(ctrl.editar));
puntosAcopioRouter.delete('/:id', asyncHandler(ctrl.eliminar));
