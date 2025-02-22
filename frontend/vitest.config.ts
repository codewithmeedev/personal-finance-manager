import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    silent: true,
    // Optionally, add a setupFiles property if you need to run any global setup.
    // setupFiles: ['./tests/setupTests.ts'],
  },
});
