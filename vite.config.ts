import { defineConfig } from 'vite-plus';

import { nodeLint } from './tooling/lint/node.ts';
import { reactLint } from './tooling/lint/react.ts';

export default defineConfig({
  lint: {
    plugins: ['typescript'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
    overrides: [
      {
        files: ['apps/web/**', 'packages/ui/**'],
        ...reactLint,
      },
      {
        files: ['apps/api/**'],
        ...nodeLint,
      },
      {
        files: ['**/*.test.ts', '**/*.spec.ts'],
        plugins: ['typescript', 'vitest'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
          'vitest/no-disabled-tests': 'error',
        },
      },
    ],
  },
  fmt: {
    printWidth: 100,
    semi: true,
    singleQuote: true,
    overrides: [
      {
        files: ['apps/api/**'],
        options: {
          printWidth: 120,
        },
      },
      {
        files: ['**/*.md'],
        options: {
          proseWrap: 'always',
        },
      },
    ],
  },
});
