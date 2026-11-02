// Configuración mínima de ESLint (flat config) para el backend.
// Usa typescript-eslint para poder analizar archivos .ts. El objetivo es
// detectar errores reales sin bloquear la entrega por cuestiones de formato
// (eso lo cubre el type-check y el build).
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'prisma/migrations/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'prisma/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Permitir variables/argumentos no usados con prefijo "_" (patrón común
      // en callbacks y descartes), coherente con tsconfig.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
);
