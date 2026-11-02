/**
 * Construcción de la instancia Express.
 *
 * El mismo `app` se usa en local (servidor HTTP en `server.ts`) y en AWS
 * (envuelto por `@codegenie/serverless-express` en `lambda.ts`), de modo que
 * el código de la API es idéntico en ambos entornos.
 */
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { apiRouter } from './routes';
import { requestLogger } from './middlewares/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

export function crearApp() {
  const app = express();

  // CORS restringido a los orígenes configurados (el del frontend).
  app.use(
    cors({
      origin: (origin, callback) => {
        // Permite herramientas sin origin (curl, health checks) y los orígenes
        // explícitamente configurados.
        if (!origin || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origen no permitido por CORS: ${origin}`));
      },
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.use('/', apiRouter);

  // 404 y manejo central de errores al final de la cadena.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
