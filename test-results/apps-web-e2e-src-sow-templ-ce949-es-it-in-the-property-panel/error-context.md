# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/web-e2e/src/sow-template-builder.spec.ts >> SOW template builder >> adds a field from the palette and configures it in the property panel
- Location: apps/web-e2e/src/sow-template-builder.spec.ts:4:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/tenantSlug/admin/sows/new", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('SOW template builder', () => {
  4  |   test('adds a field from the palette and configures it in the property panel', async ({ page }) => {
> 5  |     await page.goto('/tenantSlug/admin/sows/new');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  6  | 
  7  |     await page.getByRole('button', { name: 'Currency', exact: true }).click();
  8  | 
  9  |     const canvas = page.getByText('Canvas').locator('..');
  10 |     await expect(canvas.getByText('Currency', { exact: false }).first()).toBeVisible();
  11 | 
  12 |     await canvas.getByText('Currency', { exact: false }).first().click();
  13 |     const labelInput = page.getByLabel('Label');
  14 |     await expect(labelInput).toBeVisible();
  15 |     await labelInput.fill('Total Budget');
  16 | 
  17 |     await expect(canvas.getByText('Total Budget')).toBeVisible();
  18 |   });
  19 | 
  20 |   test('adds a Section container and nests a field inside it', async ({ page }) => {
  21 |     await page.goto('/tenantSlug/admin/sows/new');
  22 | 
  23 |     await page.getByRole('button', { name: 'Section', exact: true }).click();
  24 |     await expect(page.getByText(/Drop fields here to nest them inside/)).toBeVisible();
  25 |   });
  26 | 
  27 |   test('switches to the live preview and renders the generated form', async ({ page }) => {
  28 |     await page.goto('/tenantSlug/admin/sows/new');
  29 | 
  30 |     await page.getByRole('button', { name: 'Text', exact: true }).click();
  31 |     await page.getByRole('tab', { name: 'Live preview' }).click();
  32 | 
  33 |     await expect(page.locator('input[type="text"]').first()).toBeVisible();
  34 |   });
  35 | 
  36 |   test('shows the generated JSON Schema for a new field', async ({ page }) => {
  37 |     await page.goto('/tenantSlug/admin/sows/new');
  38 | 
  39 |     await page.getByRole('button', { name: 'Text', exact: true }).click();
  40 |     await page.getByRole('tab', { name: 'JSON Schema' }).click();
  41 | 
  42 |     const schemaText = page.locator('textarea');
  43 |     await expect(schemaText).toBeVisible();
  44 |     await expect(schemaText).toHaveValue(/"type": "object"/);
  45 |   });
  46 | });
  47 | 
```