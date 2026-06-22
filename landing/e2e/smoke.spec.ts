import { expect, test } from '@playwright/test'

test('home renders the hero and reaches the download section', async ({ page }) => {
  await page.goto('/')

  // Hero headline (per-word spans live inside the single h1).
  await expect(page.locator('h1').first()).toBeVisible()

  // The hero download CTA scrolls to the final download section.
  const downloadCta = page.getByRole('link', { name: 'ดาวน์โหลด' }).first()
  await expect(downloadCta).toBeVisible()
  await downloadCta.click()
  await expect(page.locator('#download')).toBeVisible()
})

test('the English route renders its hero', async ({ page }) => {
  await page.goto('/en/')
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  await expect(page.getByText('Buy once. Own it forever.')).toBeVisible()
})
