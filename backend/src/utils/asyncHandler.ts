/**
 * Envuelve un manejador asíncrono de Express para capturar los rechazos de
 * promesas y delegarlos al middleware central de errores con `next(err)`.
 * Evita repetir try/catch en cada controlador.
 */
import type { NextFunction, Request, Response } from 'express';

type Manejador = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: Manejador) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
