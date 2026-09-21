import { test, expect } from '@playwright/test'

/**
 * Was nur der echte Build zeigt.
 *
 * Diese Datei prueft genau die Teile, die `next dev` gar nicht kennt:
 * public/_headers, public/_redirects und die Pages Function unter
 * functions/api/contact.ts. Sie laeuft deshalb erst, seit der Playwright-
 * webServer `wrangler pages dev` gegen out/ startet statt den Dev-Server
 * (PLAN.md, Phase 4).
 */

test.describe('Sicherheits-Header aus public/_headers', () => {
  test('liegen auf jeder HTML-Antwort', async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()

    expect(headers['content-security-policy']).toContain("default-src 'self'")
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['permissions-policy']).toContain('geolocation=()')
  })

  test('geben dem Vorschaubild einen Content-Type', async ({ request }) => {
    // Ohne Dateiendung liefert Cloudflare Pages sonst octet-stream aus und
    // die Linkvorschau bleibt leer - stillschweigend.
    const response = await request.get('/opengraph-image')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/png')
  })
})

test.describe('POST /api/contact', () => {
  const gueltig = {
    name: 'Erika Mustermann',
    email: 'erika@example.com',
    message: 'Eine Nachricht, die lang genug fuer die Mindestlaenge ist.',
    consent: true,
  }

  test('sagt ohne hinterlegte Schluessel offen, dass nichts eingerichtet ist', async ({
    request,
  }) => {
    // Der Normalfall in jedem frischen Klon: kein BREVO_API_KEY. Die Function
    // muss antworten statt abzustuerzen (PLAN.md, Phase 2).
    const response = await request.post('/api/contact', { data: gueltig })

    expect(response.status()).toBe(503)
    expect(await response.json()).toEqual({ ok: false, error: 'unconfigured' })
    expect(response.headers()['cache-control']).toBe('no-store')
  })

  test('weist unvollstaendige Eingaben mit Feldfehlern zurueck', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { ...gueltig, email: 'keine-adresse', consent: false },
    })

    expect(response.status()).toBe(422)
    const body = (await response.json()) as {
      error: string
      fieldErrors: Record<string, string[]>
    }
    expect(body.error).toBe('invalid')
    expect(Object.keys(body.fieldErrors)).toEqual(expect.arrayContaining(['email', 'consent']))
  })

  test('verwirft den Honeypot still mit ok', async ({ request }) => {
    // Ein Bot, der eine Fehlermeldung sieht, probiert weiter.
    const response = await request.post('/api/contact', {
      data: { ...gueltig, website: 'https://spam.example' },
    })

    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })

  test('beantwortet alles ausser POST mit 405', async ({ request }) => {
    const response = await request.get('/api/contact')
    expect(response.status()).toBe(405)
    expect(response.headers()['allow']).toBe('POST')
  })
})
