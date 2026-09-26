import { test, expect } from '@playwright/test'

test.describe('Sprunglink', () => {
  test('ist der erste Tab-Stopp und setzt den Fokus in den Inhalt', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: /zum inhalt springen/i })

    // Bis zum Fokus ist er per sr-only unsichtbar - danach muss er wirklich
    // zu sehen sein, sonst hilft er sehenden Tastatur-Nutzern nicht.
    await expect(skipLink).toBeFocused()
    await expect(skipLink).toBeVisible()

    await page.keyboard.press('Enter')
    await expect(page.locator('main#inhalt')).toBeFocused()
  })
})

test.describe('Registerreiter', () => {
  test('sind nach dem Sprunglink der Reihe nach per Tab erreichbar', async ({ page }) => {
    await page.goto('/')
    const reiter = page.getByRole('navigation', { name: 'Bereiche' }).getByRole('link')

    // Erster Tab-Stopp ist der Sprunglink, danach die fuenf Reiter.
    await page.keyboard.press('Tab')
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await expect(reiter.nth(i)).toBeFocused()
    }
  })
})

test.describe('Metadaten und Icons', () => {
  test('liefert favicon.ico, Manifest und Vorschaubild aus', async ({ request }) => {
    for (const path of ['/favicon.ico', '/manifest.webmanifest', '/opengraph-image']) {
      const response = await request.get(path)
      expect(response.status(), `${path} muss erreichbar sein`).toBe(200)
    }
  })

  test('enthaelt gueltige strukturierte Daten', async ({ page }) => {
    await page.goto('/')

    const raw = await page.locator('script[type="application/ld+json"]').textContent()
    expect(raw).toBeTruthy()

    const data = JSON.parse(raw ?? '') as { '@graph'?: { '@type'?: string }[] }
    const types = (data['@graph'] ?? []).map((node) => node['@type'])
    expect(types).toContain('WebSite')
  })
})
