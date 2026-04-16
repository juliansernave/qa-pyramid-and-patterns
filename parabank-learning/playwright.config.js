// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  // Stop after first failure to keep noise low during learning
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,

  reporter: [['html', { open: 'never' }], ['line']],

  use: {
    baseURL: 'https://parabank.parasoft.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'tests/ui/**/*.spec.js',
    },
    {
      // API tests: no browser needed — Playwright's request context is used
      name: 'api',
      use: {},
      testMatch: 'tests/api/**/*.spec.js',
    },
  ],
});
