import { defineConfig, devices } from '@playwright/test';

// e2e runs against a production build made from the fixtures (VITE_FIXTURES=1), served by `vite preview`.
const PORT = 4173;
export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results/e2e',
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}/`, ...devices['Desktop Chrome'] },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    env: { VITE_FIXTURES: '1', BASE_PATH: '/' },
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
