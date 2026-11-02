import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Config de la suite de pruebas (Vitest). Se declara aparte y se adjunta con un
// cast para NO importar desde 'vitest/config': así el build de producción
// (`vite build`) no depende de `vitest` (una devDependency). En entornos de
// despliegue que omiten devDependencies, importar 'vitest/config' haría fallar
// el type-check/compilación.
const test: Record<string, unknown> = {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.ts'],
  css: true,
  // Las pruebas reales se agregan en tareas posteriores; no fallar mientras la
  // suite aún no tiene archivos de test.
  passWithNoTests: true,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  // `test` no forma parte del tipo `UserConfig` de Vite; Vitest lo lee en
  // tiempo de ejecución. Se adjunta con un cast para mantener el tipado del
  // resto de la configuración.
  test,
} as UserConfig & { test: typeof test });
