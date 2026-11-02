/**
 * Handler para AWS Lambda + API Gateway.
 *
 * Envuelve la misma instancia Express (`crearApp`) con
 * `@codegenie/serverless-express`, de modo que el código de la API corre sin
 * cambios en local (servidor HTTP) y en AWS (Lambda). El handler se cachea
 * entre invocaciones que comparten contenedor.
 */
import serverlessExpress from '@codegenie/serverless-express';
import type { Handler } from 'aws-lambda';
import { crearApp } from './app';

let cached: ReturnType<typeof serverlessExpress> | undefined;

export const handler: Handler = (event, context, callback) => {
  if (!cached) {
    cached = serverlessExpress({ app: crearApp() });
  }
  return cached(event, context, callback);
};
