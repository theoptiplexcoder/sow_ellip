import { test, expect } from '@playwright/test';

test.describe('admin template builder', () => {
  test('New SOW opens a full-page document editor, not a modal', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.getByRole('button', { name: 'New SOW' }).click();

    await expect(page).toHaveURL(/\/sows\/new$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'New template' })).toBeVisible();
  });

  test('uploads an image into the document', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();

    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    });

    await expect(doc.locator('img')).toHaveCount(1);
  });

  test('inserts a table and adds a row and column', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.getByRole('button', { name: 'Insert table' }).click();

    const table = doc.locator('table');
    await expect(table).toBeVisible();
    await expect(table.locator('tr')).toHaveCount(3);
    await expect(table.locator('tr').first().locator('th, td')).toHaveCount(3);

    await page.getByRole('button', { name: 'Add row' }).click();
    await expect(table.locator('tr')).toHaveCount(4);

    await page.getByRole('button', { name: 'Add column' }).click();
    await expect(table.locator('tr').first().locator('th, td')).toHaveCount(4);
  });

  test('applies font family and font size to selected text', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.keyboard.type('Styled text');
    await page.keyboard.press('Control+A');

    await page.getByLabel('Font family').selectOption('Georgia, serif');
    await page.getByLabel('Font size').selectOption('24');

    const styled = doc.locator('span[style*="font-family"][style*="font-size"]');
    await expect(styled).toHaveText('Styled text');
  });

  test('creates a template from the typed document and saves it', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    await page.getByLabel('Name').fill('Playwright Test Template');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.getByLabel('Text style').selectOption('1');
    await page.keyboard.type('Client budget');
    await page.keyboard.press('Enter');
    await page.getByLabel('Text style').selectOption('0');
    await page.keyboard.type('Describe the budget here.');

    await page.getByRole('button', { name: 'Create template' }).click();
    await expect(page).toHaveURL(/\/sows$/);
  });
});
