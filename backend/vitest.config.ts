import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// Base config shared by all projects (see vitest.workspace.ts).
export default defineConfig({
  plugins: [swc.vite()],
  test: {
    globals: true,
    environment: 'node',
  },
});
