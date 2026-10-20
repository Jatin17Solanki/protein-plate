import { defineConfig } from 'vitest/config';

// Track B data-tool tests. Run: npx vitest run --config scripts/data/vitest.config.ts
export default defineConfig({
  test: { include: ['scripts/data/**/*.test.ts'] },
});
