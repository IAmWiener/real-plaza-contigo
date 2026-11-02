/**
 * Logging HTTP mínimo: registra método, ruta, código de estado y duración de
 * cada petición. Suficiente para observabilidad básica tanto en local como en
 * CloudWatch (Lambda).
 */
import type { RequestHandler } from 'express';

export const requestLogger: RequestHandler = (req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
};
