/**
 * Carga y validación de variables de entorno.
 *
 * Centraliza el acceso a `process.env` para que el resto del código use una
 * configuración ya validada y tipada. Nunca se hardcodean credenciales: todo
 * proviene del entorno (`.env` en local, gestor de secretos en AWS).
 */
import 'dotenv/config';
import { z } from 'zod';

const esquema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  PORT: z.coerce.number().int().positive().default(4000),
  // Lista de orígenes permitidos por CORS, separados por comas.
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const parsed = esquema.safeParse(process.env);

if (!parsed.success) {
  // Fallo temprano y claro si falta configuración esencial.
  const detalle = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`Configuración de entorno inválida:\n${detalle}`);
}

const valores = parsed.data;

export const env = {
  databaseUrl: valores.DATABASE_URL,
  port: valores.PORT,
  nodeEnv: valores.NODE_ENV,
  /** Orígenes permitidos por CORS, ya normalizados a un arreglo. */
  corsOrigins: valores.CORS_ORIGIN.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  isProduction: valores.NODE_ENV === 'production',
};
