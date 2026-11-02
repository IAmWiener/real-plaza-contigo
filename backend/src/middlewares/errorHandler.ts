/**
 * Manejo centralizado de errores y rutas no encontradas.
 *
 * Todas las respuestas de error tienen un formato uniforme:
 *   { error: { codigo, mensaje, detalles? } }
 *
 * Normaliza:
 *  - `HttpError`            -> su status/código.
 *  - `ZodError`             -> 400 con el detalle de validación.
 *  - errores de Prisma P2025 (no encontrado) -> 404.
 *  - cualquier otro         -> 500 genérico (sin filtrar detalles internos).
 */
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/httpError';
import { env } from '../config/env';

/** Middleware para rutas inexistentes. */
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: {
      codigo: 'no_encontrado',
      mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
};

/** Middleware central de errores. Debe registrarse al final de la cadena. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { codigo: err.codigo, mensaje: err.message, detalles: err.detalles },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        codigo: 'validacion',
        mensaje: 'Los datos enviados no son válidos.',
        detalles: err.issues.map((i) => ({
          campo: i.path.join('.'),
          mensaje: i.message,
        })),
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      res.status(404).json({
        error: { codigo: 'no_encontrado', mensaje: 'Recurso no encontrado.' },
      });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({
        error: {
          codigo: 'referencia_invalida',
          mensaje: 'Una referencia (sede, evento, categoría o aliado) no existe.',
        },
      });
      return;
    }
  }

  // Error no previsto: log y respuesta genérica.
  console.error('[error-no-controlado]', err);
  res.status(500).json({
    error: {
      codigo: 'interno',
      mensaje: 'Ocurrió un error interno en el servidor.',
      ...(env.isProduction ? {} : { detalles: String(err) }),
    },
  });
};
