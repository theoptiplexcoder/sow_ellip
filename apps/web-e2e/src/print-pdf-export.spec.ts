import { test, expect } from '@playwright/test';

test('print route resolves', async ({ page }) => {
  const response = await page.goto('/sows/demo/print');
  expect(response?.status()).toBeLessThan(500);
});
