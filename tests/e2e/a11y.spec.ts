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

test.describe('Mobile-Drawer', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('sperrt das Scrollen und gibt es beim Schliessen wieder frei', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: /menü öffnen/i })

    await toggle.click()
    await expect(page.locator('#mobile-nav')).toBeVisible()
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')

    await page.keyboard.press('Escape')
    await expect(page.locator('#mobile-nav')).toBeHidden()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    // Escape muss den Fokus zurueckgeben, sonst faellt er an den Dokumentanfang.
    await expect(page.getByRole('button', { name: /menü öffnen/i })).toBeFocused()
  })

  test('haelt den Fokus im offenen Menue', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /menü öffnen/i }).click()

    const links = page.locator('#mobile-nav a')
    const count = await links.count()

    // Vom Toggle-Button durch alle Links - der naechste Tab muss wieder auf
    // dem Button landen und darf nicht hinter das Menue wandern.
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab')
      await expect(links.nth(i)).toBeFocused()
    }

    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /menü schließen/i })).toBeFocused()
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
