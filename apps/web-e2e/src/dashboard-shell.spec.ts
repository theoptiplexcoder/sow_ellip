import { test, expect } from '@playwright/test';

test.describe('dashboard shell', () => {
  test('shows the role-specific nav and highlights the active link', async ({ page }) => {
    await page.goto('/tenantSlug/admin');
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Audit Log' })).toBeVisible();

    await expect(page.getByText('/ Organization Admin')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveClass(/bg-accent/);
  });

  test('renders the approver-specific nav on the approver dashboard', async ({ page }) => {
    await page.goto('/tenantSlug/approver');
    await expect(page.getByText('/ Approver')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Approvals' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Users' })).toBeHidden();
  });

  test('collapses the sidebar to icons only on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/tenantSlug/admin');

    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/md:w-60/);

    await page.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(sidebar).toHaveClass(/md:w-16/);
    await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible();

    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(sidebar).toHaveClass(/md:w-60/);
  });

  test('toggles the sidebar as a drawer on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/tenantSlug/admin');

    const dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).not.toBeInViewport();

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await expect(dashboardLink).toBeInViewport();

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await expect(dashboardLink).not.toBeInViewport();
  });
});
