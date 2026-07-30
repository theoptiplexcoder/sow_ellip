import { test, expect, type Page } from '@playwright/test';

async function stubPrint(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __printCalls: number }).__printCalls = 0;
    window.print = () => {
      (window as unknown as { __printCalls: number }).__printCalls += 1;
    };
  });
}

async function printCallCount(page: Page) {
  return page.evaluate(() => (window as unknown as { __printCalls: number }).__printCalls);
}

test.describe('Export to PDF', () => {
  test('admin SOW detail triggers the browser print dialog', async ({ page }) => {
    await stubPrint(page);
    await page.goto('/tenantSlug/admin/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1042' }).click();

    await expect(page.getByRole('button', { name: 'Export to PDF' })).toBeVisible();
    await page.getByRole('button', { name: 'Export to PDF' }).click();

    await expect.poll(() => printCallCount(page)).toBe(1);
  });

  test('participant SOW detail triggers the browser print dialog', async ({ page }) => {
    await stubPrint(page);
    await page.goto('/tenantSlug/participant/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1042' }).click();

    await page.getByRole('button', { name: 'Export to PDF' }).click();

    await expect.poll(() => printCallCount(page)).toBe(1);
  });

  test('participant SOW yard detail triggers the browser print dialog', async ({ page }) => {
    await stubPrint(page);
    await page.goto('/tenantSlug/participant/sows/yard');

    const row = page.locator('tr').first();
    await row.click();

    await page.getByRole('button', { name: 'Export to PDF' }).click();

    await expect.poll(() => printCallCount(page)).toBe(1);
  });

  test('client SOW detail triggers the browser print dialog', async ({ page }) => {
    await stubPrint(page);
    await page.goto('/tenantSlug/client/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1042' }).click();

    await page.getByRole('button', { name: 'Export to PDF' }).click();

    await expect.poll(() => printCallCount(page)).toBe(1);
  });

  test('admin print output shows form values instead of the interactive Form Preview', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1042' }).click();
    await expect(page.getByRole('heading', { name: 'Form Preview' })).toBeVisible();

    await page.emulateMedia({ media: 'print' });

    await expect(page.getByRole('heading', { name: 'Form Values' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Form Preview' })).toBeHidden();
  });

  test('participant SOW print output shows the filled-in form values', async ({ page }) => {
    await page.goto('/tenantSlug/participant/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1042' }).click();
    await expect(page.getByRole('heading', { name: 'Form Preview' })).toBeVisible();

    await page.emulateMedia({ media: 'print' });

    await expect(page.getByRole('heading', { name: 'Form Values' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Form Preview' })).toBeHidden();
    await expect(page.getByText('Overview content for Website revamp')).toBeVisible();
  });

  test('participant SOW yard print output shows form values instead of the interactive Form Preview', async ({ page }) => {
    await page.goto('/tenantSlug/participant/sows/yard');
    await page.locator('tr').first().click();
    await expect(page.getByRole('heading', { name: 'Form Preview' })).toBeVisible();

    await page.emulateMedia({ media: 'print' });

    await expect(page.getByRole('heading', { name: 'Form Values' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Form Preview' })).toBeHidden();
  });
});
