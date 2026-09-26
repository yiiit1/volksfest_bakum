import { test, expect } from '@playwright/test'

const REGISTER = [
  { path: '/verein', name: /^verein$/i },
  { path: '/wer-wir-sind', name: /wer wir sind/i },
  { path: '/mitgliedsantrag', name: /mitgliedsantrag/i },
  { path: '/kontakt', name: /kontakt/i },
] as const

test('Startseite zeigt Logo und genau eine H1', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('img', { name: /volksfest bakum/i })).toBeVisible()
})

test('Reiter fuehren auf die vier Register und markieren das offene', async ({ page }) => {
  await page.goto('/')
  const reiter = page.getByRole('navigation', { name: 'Bereiche' })

  for (const register of REGISTER) {
    await reiter.getByRole('link', { name: register.name }).click()
    await expect(page).toHaveURL(new RegExp(`${register.path}$`))
    await expect(reiter.getByRole('link', { name: register.name })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  }
})

test('Blatt traegt die Farbe des offenen Registers', async ({ page }) => {
  await page.goto('/mitgliedsantrag')
  // Registerfarbe 3 (#b7bbe0) als Oberkante des Blatts.
  await expect(page.locator('main#inhalt')).toHaveCSS('border-top-color', 'rgb(183, 187, 224)')
})

test('Mitgliedsantrag ist als PDF erreichbar', async ({ page, request }) => {
  await page.goto('/mitgliedsantrag')
  const link = page.getByRole('link', { name: /antrag herunterladen/i })
  await expect(link).toHaveAttribute('download', /\.pdf$/)

  const response = await request.get((await link.getAttribute('href')) ?? '')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')
})

test('Kontaktformular validiert leere Eingaben', async ({ page }) => {
  await page.goto('/kontakt')
  await page.getByRole('button', { name: /senden/i }).click()
  await expect(page.getByText(/Namen an/i)).toBeVisible()
})

test.describe('Handy', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('zeigt die Kurzform der Reiter und kein Querscrollen', async ({ page }) => {
    await page.goto('/')
    const reiter = page.getByRole('navigation', { name: 'Bereiche' })
    await expect(reiter.getByRole('link', { name: 'Vorstand' })).toBeVisible()
    await expect(reiter.getByRole('link', { name: 'Antrag' })).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
