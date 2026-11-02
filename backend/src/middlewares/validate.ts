/**
 * Middleware de validación con zod. Valida el `body` de la petición contra un
 * esquema y reemplaza `req.body` por los datos ya parseados y tipados. Un fallo
 * de validación produce un `ZodError` que el errorHandler traduce a 400.
 */
import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

export function validateBody<T>(esquema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const resultado = esquema.safeParse(req.body);
    if (!resultado.success) {
      next(resultado.error);
      return;
    }
    req.body = resultado.data;
    next();
  };
}
