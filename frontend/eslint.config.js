// Configuración mínima de ESLint (flat config) para el frontend.
// Cubre TypeScript + React (hooks y fast-refresh) sin reglas de estilo
// excesivas. El objetivo es detectar errores reales sin bloquear la entrega
// por cuestiones de formato (eso lo cubre el type-check y el build).
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  // Ignorar artefactos de build y dependencias.
  {
    ignores: ['dist', 'node_modules', 'coverage'],
  },
  // Bases recomendadas de JS y TypeScript.
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Reglas específicas para el código fuente TS/TSX de la app.
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
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
  // Archivos de configuración que corren en Node (fuera del tsconfig de la app).
  {
    files: ['*.config.{js,ts}', 'vite.config.ts', 'postcss.config.js', 'tailwind.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // La directiva triple-slash de `vitest/config` es el patrón oficial
      // recomendado por Vitest para tipar la sección `test`; se permite aquí.
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
);
