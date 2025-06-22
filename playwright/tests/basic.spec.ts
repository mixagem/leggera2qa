import { test, expect, BrowserContext, Page, type TestInfo } from '@playwright/test';
import { secrets } from '../../playwright.config';

test.describe('Leggera 2 Tests', () => {
  const timestamp: string = new Date().toISOString().replace(/T/, '_').replace(/:/g, '').slice(0, 15).replace(/-/g, ''); // YYYYDDMM_HHMM 

  // screenshot folder
  // if (!fs.existsSync(`screenshots/${timestamp}`)) {
  //   fs.mkdirSync(`screenshots/${timestamp}`);
  // }

  let page: Page;
  let browserType: string;

  test.beforeAll(async ({ browser }) => {
    const context: BrowserContext = await browser.newContext();
    page = await context.newPage();
    browserType = page.context().browser()?.browserType().name() || 'unknownbrowser';

    const url = process.env.ENVIRONMENT === 'prod' ? secrets.WEBPAGE_URL_PROD : secrets.WEBPAGE_URL

    if(!url){
      return // stop the testing, url is blank
    }

    await page.goto(url);
  });

  test('Check Page Title', async () => {
    // Assert the page title
    await expect(page).toHaveTitle(/Leggera 2/);
  });

  test('Check Loading Logo Visibility', async ({}, testInfo: TestInfo) => {
    await expect(page.locator('lg2-mi-infinity#startup-logo')).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(1500);

    // await page.screenshot({ path: `screenshots/${timestamp}/before-fadding-${browserType}.png`, fullPage: false });

    let screenshotBuffer = await page.screenshot({fullPage: false });
    await testInfo.attach('b4 fadding', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });

    await page.waitForTimeout(1500);

    await expect(page.locator('lg2-mi-infinity#startup-logo')).toBeHidden({ timeout: 5000 });
  });

  test('Check For Login Form', async ({}, testInfo: TestInfo) => {
    await expect(page.locator('#after-startup-container')).toBeVisible();

    await page.waitForTimeout(1600); //animations delay
    await expect(page.locator('lg2-mi-infinity#login-logo')).toBeVisible();
    await expect(page.locator('lg2-login-card')).toBeVisible();

    // await page.screenshot({ path: `screenshots/${timestamp}/form-ready-${browserType}.png`, fullPage: false });

    let screenshotBuffer = await page.screenshot({fullPage: false });
    await testInfo.attach('b4 fadding', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
  });

  test.afterAll(async () => {
    await page.close(); // Clean up after the tests
  });
});