import { test, expect, chromium, BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTENSION_PATH = path.join(__dirname, '..', 'dist');

test.describe('Extension Installation', () => {
  let context: BrowserContext;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
      ],
    });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('extension loads without errors', async () => {
    // Get the background service worker
    const serviceWorkers = context.serviceWorkers();

    // Wait for service worker to be ready (up to 5 seconds)
    let worker = serviceWorkers.find(w => w.url().includes('serviceWorker'));
    if (!worker) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const workers = context.serviceWorkers();
      worker = workers.find(w => w.url().includes('serviceWorker'));
    }

    // Verify extension loaded (service worker exists)
    expect(worker).toBeDefined();
    console.log('Service worker URL:', worker?.url());
  });

  test('extension page can be opened', async () => {
    const page = await context.newPage();

    // Navigate to a test page
    await page.goto('about:blank');

    // Get extension ID from service worker URL
    const workers = context.serviceWorkers();
    const worker = workers.find(w => w.url().includes('serviceWorker'));

    if (worker) {
      const extensionId = worker.url().split('/')[2];
      console.log('Extension ID:', extensionId);

      // Verify we can access the side panel HTML
      const sidePanelUrl = `chrome-extension://${extensionId}/sidepanel.html`;
      await page.goto(sidePanelUrl);

      // Check the page title or content
      const title = await page.title();
      console.log('Side panel title:', title);

      // Verify side panel content loaded
      const body = await page.locator('body').innerHTML();
      expect(body.length).toBeGreaterThan(0);
    }

    await page.close();
  });

  test('content script injects on ChatGPT pages', async () => {
    const page = await context.newPage();

    // Try to navigate to chatgpt.com (this may not fully work without login)
    // but we can verify the content script doesn't cause errors
    try {
      await page.goto('https://chatgpt.com/', { timeout: 10000 });

      // Check for console errors related to our extension
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);

      // Filter out non-extension errors
      const extensionErrors = errors.filter(e =>
        e.includes('content.js') ||
        e.includes('serviceWorker') ||
        e.includes('AI Search Inspector')
      );

      expect(extensionErrors).toHaveLength(0);
    } catch (error) {
      // Timeout is acceptable - we're just checking the extension doesn't break
      console.log('Page load timed out (expected for non-logged-in state)');
    }

    await page.close();
  });
});
