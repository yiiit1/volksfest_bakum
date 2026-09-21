/**
 * Cloudflare Turnstile - serverseitige Pruefung des Tokens.
 *
 * Turnstile ist der einwilligungsfreie Ersatz fuer reCAPTCHA: kein Cookie,
 * keine Uebermittlung in die USA, kein Consent-Banner noetig. Das Widget im
 * Browser erzeugt ein einmalig gueltiges Token, das hier gegen die Siteverify-
 * API geprueft wird. Ohne diesen Schritt ist das Widget wertlos - ein Bot
 * spricht direkt mit der Function.
 *
 * Site Key (oeffentlich) und Secret Key werden im Cloudflare-Dashboard unter
 * Turnstile erzeugt.
 */

const SITEVERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

const TIMEOUT_MS = 10_000

export type TurnstileResult =
  /** Secret Key nicht gesetzt - Pruefung uebersprungen. */
  { status: 'skipped' } | { status: 'passed' } | { status: 'failed' }

/**
 * Prueft das Token. `skipped`, solange kein Secret hinterlegt ist.
 *
 * Das Ueberspringen ist Absicht und der Preis dafuer, dass das Template ohne
 * Schluessel lauffaehig bleibt (PLAN.md, Phase 2). Vor dem Livegang gehoert
 * `TURNSTILE_SECRET_KEY` gesetzt - die Deployment-Checkliste in der README
 * fuehrt ihn auf. Der Honeypot in `contact.ts` greift unabhaengig davon.
 */
export async function verifyTurnstile(
  token: string | undefined,
  secret: string | undefined,
  remoteIp: string | null,
): Promise<TurnstileResult> {
  const secretKey = secret?.trim()
  if (!secretKey) {
    console.warn('Turnstile: TURNSTILE_SECRET_KEY fehlt - Spam-Pruefung uebersprungen.')
    return { status: 'skipped' }
  }

  if (!token) return { status: 'failed' }

  const body = new FormData()
  body.append('secret', secretKey)
  body.append('response', token)
  // Optional, verbessert aber die Trefferquote der Bot-Erkennung.
  if (remoteIp) body.append('remoteip', remoteIp)

  try {
    const response = await fetch(SITEVERIFY_ENDPOINT, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!response.ok) {
      console.error(`Turnstile: Siteverify nicht erreichbar (HTTP ${response.status})`)
      return { status: 'failed' }
    }

    const result = (await response.json()) as { success?: boolean }
    return result.success === true ? { status: 'passed' } : { status: 'failed' }
  } catch {
    // Netzwerkfehler oder Timeout. Bewusst als Fehlschlag gewertet:
    // im Zweifel lieber eine Nachricht zu wenig als Spam im Postfach.
    console.error('Turnstile: Siteverify fehlgeschlagen.')
    return { status: 'failed' }
  }
}
