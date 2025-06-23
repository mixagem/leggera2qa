import { test, expect, BrowserContext, Page, type TestInfo } from '@playwright/test';
import { secrets } from '../playwright.config';

test.describe('Leggera 2 Tests', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context: BrowserContext = await browser.newContext();
    page = await context.newPage();

    const url = process.env.ENVIRONMENT === 'prod' ? secrets.WEBPAGE_URL_PROD : secrets.WEBPAGE_URL

    await page.goto(url);
  });

  test('Check Page Title', async () => {
    await expect(page).toHaveTitle(/Leggera 2/);
  });

  test('Check Loading Logo Visibility', async ({ }, testInfo: TestInfo) => {
    await expect(page.locator('lg2-mi-infinity#startup-logo')).toBeVisible({ timeout: 1500 });
    await page.waitForTimeout(1500);  //animations delay

    let screenshotBuffer = await page.screenshot({ fullPage: false });
    await testInfo.attach('Startup logo', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });

    await expect(page.locator('lg2-mi-infinity#startup-logo')).toBeHidden({ timeout: 4000 });
  });

  test('Check For Login Form', async ({ }, testInfo: TestInfo) => {
    await expect(page.locator('#after-startup-container')).toBeVisible();
    await expect(page.locator('lg2-mi-infinity#login-logo')).toBeVisible();
    await expect(page.locator('lg2-login-card')).toBeVisible();
    await page.waitForTimeout(2000);  //fade in delay

    let screenshotBuffer = await page.screenshot({ fullPage: false });
    await testInfo.attach('Landing page - login form', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
  });

  test('Login button disabled logic', async ({ }, testInfo: TestInfo) => {
    // disabled login button by default
    expect(await page.locator('#login-button').getAttribute('disabled')).toBe('true');

    // form incomplete, still disabeld
    await page.locator('input[formcontrolname="username"]').fill('yeah');
    expect(await page.locator('#login-button').getAttribute('disabled')).toBe('true');

    // form incomplete, still disabeld 
    await page.locator('input[formcontrolname="username"]').fill('');
    await page.locator('input[formcontrolname="password"]').fill('yeah');
    expect(await page.locator('#login-button').getAttribute('disabled')).toBe('true');

    // form complete, button enabled 
    await page.locator('input[formcontrolname="username"]').fill('yeah');
    expect(await page.locator('#login-button').getAttribute('disabled')).toBeNull();
  });

  test('Show password logic', async ({ }, testInfo: TestInfo) => {
    // password hidden by default 
    expect(await page.locator('input[formcontrolname="password"]').getAttribute('type')).toBe('password');

    // show password
    await page.locator('#show-password-button').click();
    expect(await page.locator('input[formcontrolname="password"]').getAttribute('type')).not.toBe('password');

    // hide password
    await page.locator('#show-password-button').click();
    expect(await page.locator('input[formcontrolname="password"]').getAttribute('type')).toBe('password');
  });


  test('Anon Section', async ({ }, testInfo: TestInfo) => {
    // screenshot to check the background and images
    await page.locator('#anon-section-button').click();
    await page.waitForTimeout(1500);  //fade in delay

    await page.locator('#picture-frame').waitFor();

    let screenshotBuffer = await page.screenshot({ fullPage: false });
    await testInfo.attach('Landing page - anon form', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });

    // go back
    await page.locator('#actions>button:first-of-type').click();
    await expect(page.locator('lg2-anon-login')).toBeHidden();
  })

  test('Copy token to clipboard', async ({ }, testInfo: TestInfo) => {
    await page.locator('#anon-section-button').click();
    const token = await page.locator('#token > span:nth-of-type(2)').innerText();

    await page.locator('#token>button').click();
    await expect(page.locator('lg2-app-snack >> text=clipboard')).toBeVisible(); 

    // const clipboardContent = await page.evaluate(async () => {
    //   return await navigator.clipboard.readText();
    // });

    // expect(clipboardContent)
    //   .toBe(token);
  })

  test('Generate new anon user', async ({ }, testInfo: TestInfo) => {
    // button username matches generated username
    const currentUsername = await page.locator('#card-header> p > span:nth-of-type(2)').innerText();
    expect(await page.locator('#card-header> button .mdc-button__label').innerText())
      .toContain(currentUsername)

    // generate new username
    await page.locator('#actions>button:last-of-type').click();
    await expect(page.locator('lg2-app-snack >> text=anonymous')).toBeVisible(); 
    const newUsername = await page.locator('#card-header> p > span:nth-of-type(2)').innerText();
    expect(newUsername)
      .not.toBe(currentUsername)

    // check if button's label and new generated user's names match
    expect(await page.locator('#card-header> button .mdc-button__label').innerText())
      .toContain(newUsername)
  })

  test.afterAll(async () => {
    await page.close();
  });
});