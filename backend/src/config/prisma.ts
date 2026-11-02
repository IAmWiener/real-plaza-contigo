/**
 * Cliente Prisma único (singleton) para acceso a PostgreSQL/PostGIS.
 *
 * Se reutiliza una sola instancia por proceso. En entornos serverless (Lambda)
 * esto permite que las invocaciones que comparten contenedor reutilicen la
 * conexión en lugar de abrir una nueva en cada llamada.
 */
import { PrismaClient } from '@prisma/client';

const globalRef = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalRef.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalRef.prisma = prisma;
}
