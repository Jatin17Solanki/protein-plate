import { defineConfig } from 'vitest/config';

// Unit tests only; tests/e2e is run by Playwright.
export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'] },
});
