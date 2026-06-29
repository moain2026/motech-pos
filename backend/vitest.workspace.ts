import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'unit',
      include: ['test/unit/**/*.spec.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'golden',
      include: ['test/golden/**/*.spec.ts'],
      testTimeout: 60_000,
      hookTimeout: 60_000,
      fileParallelism: false,
    },
  },
]);
