/**
 * Router raíz de la API. Monta cada módulo bajo su recurso REST, coherente con
 * las rutas que el frontend declara en `apiDataService.ts`.
 */
import { Router } from 'express';
import { empresasRouter } from './modules/empresas/empresas.routes';
import { categoriasRouter } from './modules/categorias/categorias.routes';
import { eventosRouter } from './modules/eventos/eventos.routes';
import { recursosRouter } from './modules/recursos/recursos.routes';
import { puntosAcopioRouter } from './modules/puntos-acopio/puntosAcopio.routes';
import { puntosRiesgoRouter } from './modules/puntos-riesgo/puntosRiesgo.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ estado: 'ok', servicio: 'real-plaza-contigo-api', demo: true });
});

apiRouter.use('/empresas', empresasRouter);
apiRouter.use('/categorias', categoriasRouter);
apiRouter.use('/eventos', eventosRouter);
apiRouter.use('/recursos', recursosRouter);
apiRouter.use('/puntos-acopio', puntosAcopioRouter);
apiRouter.use('/puntos-riesgo', puntosRiesgoRouter);
