import { test, expect } from '@playwright/test'

test('Startseite zeigt H1', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('Startseite rendert die Sektionsliste aus dem Content-JSON', async ({ page }) => {
  await page.goto('/')

  // Sechs Eintraege in content/home.json → sechs <section> direkt unter <main>.
  // Faengt den Fall ab, dass eine Sektionsart still gar nichts ausgibt.
  await expect(page.locator('main > section')).toHaveCount(6)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.locator('#leistungen')).toBeVisible()
})

test.describe('Bewegung reduziert', () => {
  // Seit Playwright 1.5x nur noch ueber contextOptions erreichbar - als
  // eigene Test-Option gibt es reducedMotion nicht (mehr).
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('verschiebt beim Scrollen nichts', async ({ page }) => {
    await page.goto('/')

    // Parallax haengt am Scrollstand und wird von <MotionConfig> nicht
    // erfasst - es muss selbst abschalten (siehe usePrefersReducedMotion).
    await expect(page.locator('[data-motion="parallax"]').first()).toHaveCSS('transform', 'none')
  })

  test('blendet die Inhalte trotzdem ein', async ({ page }) => {
    await page.goto('/')

    // Reduzierte Bewegung heisst nicht "unsichtbar": die Deckkraft darf
    // weiterlaufen, sonst bliebe die Seite leer. Geprueft wird die Huelle -
    // sie traegt die Deckkraft, nicht die Ueberschrift selbst.
    await expect(page.locator('[data-motion="reveal"]').first()).toHaveCSS('opacity', '1')
  })
})

test('Navigation enthält Links zu allen Hauptseiten', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /über uns/i }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /kontakt/i }).first()).toBeVisible()
})

test('Kontaktformular validiert leere Eingaben', async ({ page }) => {
  await page.goto('/kontakt')
  await page.getByRole('button', { name: /senden/i }).click()
  await expect(page.getByText(/Namen an/i)).toBeVisible()
})
