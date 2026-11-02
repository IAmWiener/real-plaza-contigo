/**
 * Bootstrap del servidor HTTP para desarrollo local.
 * En AWS no se usa este archivo: la app se expone vía `lambda.ts`.
 */
import { crearApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app = crearApp();

const server = app.listen(env.port, () => {
  console.log(
    `[real-plaza-contigo] API escuchando en http://localhost:${env.port} (${env.nodeEnv})`,
  );
});

// Cierre ordenado: libera la conexión de Prisma al terminar el proceso.
async function apagar(senal: string) {
  console.log(`\n[real-plaza-contigo] Recibida señal ${senal}, cerrando...`);
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
}

process.on('SIGINT', () => void apagar('SIGINT'));
process.on('SIGTERM', () => void apagar('SIGTERM'));
