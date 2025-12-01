import { test, expect, chromium, BrowserContext } from '@playwright/test';

// Test installing from the extracted zip location (simulates user download)
const EXTRACTED_ZIP_PATH = '/tmp/ai-search-inspector-test';

test.describe('Zip Installation Test', () => {
  let context: BrowserContext;

  test.beforeAll(async () => {
    // Launch Chrome with the extension loaded from extracted zip
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTRACTED_ZIP_PATH}`,
        `--load-extension=${EXTRACTED_ZIP_PATH}`,
        '--no-sandbox',
      ],
    });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('extension from zip loads service worker', async () => {
    // Wait for service worker to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    const serviceWorkers = context.serviceWorkers();
    const worker = serviceWorkers.find(w => w.url().includes('serviceWorker'));

    expect(worker).toBeDefined();
    console.log('✓ Service worker loaded:', worker?.url());
  });

  test('extension from zip loads side panel', async () => {
    const workers = context.serviceWorkers();
    const worker = workers.find(w => w.url().includes('serviceWorker'));
    expect(worker).toBeDefined();

    const extensionId = worker!.url().split('/')[2];
    console.log('Extension ID:', extensionId);

    const page = await context.newPage();
    const sidePanelUrl = `chrome-extension://${extensionId}/sidepanel.html`;

    await page.goto(sidePanelUrl);

    // Verify page loaded
    const title = await page.title();
    expect(title).toBe('AI Search Inspector');
    console.log('✓ Side panel title:', title);

    // Verify content rendered
    const body = await page.locator('body').innerHTML();
    expect(body.length).toBeGreaterThan(100);
    console.log('✓ Side panel content length:', body.length);

    await page.close();
  });

  test('content script loads on ChatGPT without errors', async () => {
    const page = await context.newPage();

    // Collect console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Also catch page errors
    const pageErrors: string[] = [];
    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });

    try {
      await page.goto('https://chatgpt.com/', { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
    } catch (e) {
      // Timeout is OK - we just need to verify no extension errors
      console.log('Page navigation completed or timed out');
    }

    // Check for extension-related errors
    const extensionErrors = [...errors, ...pageErrors].filter(e =>
      e.toLowerCase().includes('content.js') ||
      e.toLowerCase().includes('serviceworker') ||
      e.toLowerCase().includes('extension') ||
      e.toLowerCase().includes('manifest')
    );

    console.log('Total console errors:', errors.length);
    console.log('Total page errors:', pageErrors.length);
    console.log('Extension-related errors:', extensionErrors.length);

    if (extensionErrors.length > 0) {
      console.log('Extension errors found:', extensionErrors);
    }

    expect(extensionErrors).toHaveLength(0);
    console.log('✓ No extension errors on ChatGPT');

    await page.close();
  });

  test('manifest.json is valid', async () => {
    const workers = context.serviceWorkers();
    const worker = workers.find(w => w.url().includes('serviceWorker'));
    expect(worker).toBeDefined();

    const extensionId = worker!.url().split('/')[2];
    const page = await context.newPage();

    // Fetch manifest.json
    const manifestUrl = `chrome-extension://${extensionId}/manifest.json`;
    const response = await page.goto(manifestUrl);
    expect(response?.status()).toBe(200);

    const manifestText = await page.locator('body').innerText();
    const manifest = JSON.parse(manifestText);

    expect(manifest.name).toBe('AI Search Inspector by Franz Enzenhofer');
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.content_scripts).toBeDefined();
    expect(manifest.content_scripts[0].js).toContain('content.js');
    expect(manifest.background.service_worker).toBe('serviceWorker.js');

    console.log('✓ Manifest valid - name:', manifest.name);
    console.log('✓ Manifest version:', manifest.version);

    await page.close();
  });
});
