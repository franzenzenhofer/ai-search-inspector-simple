import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*install.test.ts',
  timeout: 60000,
  use: {
    headless: false,
  },
  reporter: 'list',
});
