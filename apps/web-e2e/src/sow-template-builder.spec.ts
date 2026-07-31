import { test, expect } from '@playwright/test';

test.describe('SOW template document editor', () => {
  test('types a heading and body text into the document', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.keyboard.type('Scope of Work');

    await page.getByLabel('Text style').selectOption('1');
    await expect(doc.locator('h1')).toHaveText('Scope of Work');

    await page.keyboard.press('Enter');
    await page.getByLabel('Text style').selectOption('0');
    await page.keyboard.type('This section describes the scope.');
    await expect(doc.locator('p')).toContainText('This section describes the scope.');
  });

  test('applies bold formatting from the toolbar', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.keyboard.type('Important term');
    await page.keyboard.press('Control+A');
    await page.getByRole('button', { name: 'Bold' }).click();

    await expect(doc.locator('strong')).toHaveText('Important term');
  });

  test('creating a template from the typed document redirects to the SOWs list', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    await page.getByLabel('Name').fill(`E2E Template ${Date.now()}`);

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.getByLabel('Text style').selectOption('1');
    await page.keyboard.type('Project Overview');
    await page.keyboard.press('Enter');
    await page.getByLabel('Text style').selectOption('0');
    await page.keyboard.type('Default overview text.');

    await page.getByRole('button', { name: 'Create template' }).click();
    await page.waitForURL(/\/admin\/sows$/);
  });
});
