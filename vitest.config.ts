// ===== ISTQB CTFL v4.0.1 — Vitest Configuration =====

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/__tests__/**/*.test.{ts,tsx,js,jsx}'],
    exclude: ['node_modules', '.next'],
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/utils/**/*.ts', 'src/store/**/*.ts', 'src/lib/**/*.ts'],
      exclude: ['node_modules', '.next', 'src/__tests__'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
