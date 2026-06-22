import { defineConfig, devices } from '@playwright/test'

// Excluded from `astro check` (see tsconfig). Requires a one-time setup:
//   pnpm add -D @playwright/test && pnpm exec playwright install chromium
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  use: { baseURL: 'http://localhost:4321', trace: 'on-first-retry' },
  webServer: {
    command: 'pnpm build && pnpm preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
