/**
 * POST /api/contact - Cloudflare Pages Function fuer das Kontaktformular.
 *
 * Warum keine Server Action: die Website wird statisch exportiert
 * (`output: 'export'`). Eine Server Action braucht einen Node-Server, der auf
 * Cloudflare Pages nicht existiert - sie waere still tot. Pages Functions
 * laufen dagegen als Worker neben den statischen Dateien und werden von der
 * Datei-Struktur unter `functions/` geroutet.
 *
 * Dateien mit fuehrendem Unterstrich (`_lib/`) exportieren keinen
 * `onRequest`-Handler und werden deshalb nicht als Route veroeffentlicht.
 *
 * Lokal (`npm run dev`) gibt es diese Route nicht - Next.js kennt sie nicht.
 * Das Formular faengt das ab und meldet "nicht eingerichtet". Wer sie lokal
 * testen will: `npx wrangler pages dev out` nach `npm run build`, Secrets in
 * `.dev.vars`.
 */
import { validateContactRequest, type ContactResponse } from '../../src/features/contact/schema'
import type { FunctionContext } from './_lib/types'
import { escapeHtml, escapeHtmlWithBreaks, singleLine } from './_lib/html'
import { createMailer, type MailMessage } from './_lib/mailer'
import { verifyTurnstile } from './_lib/turnstile'

/** Grosszuegig, aber endlich - ein Request soll kein Speicherfresser sein. */
const MAX_BODY_BYTES = 64 * 1024

function json(body: ContactResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Die Antwort ist pro Absender verschieden und darf nirgends liegen
      // bleiben - weder im Browser noch am Cloudflare-Rand.
      'cache-control': 'no-store',
    },
  })
}

export const onRequestPost = async (context: FunctionContext): Promise<Response> => {
  const { request, env } = context

  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'invalid' }, 413)
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return json({ ok: false, error: 'invalid' }, 400)
  }

  const parsed = validateContactRequest(payload)
  if (!parsed.success) {
    return json({ ok: false, error: 'invalid', fieldErrors: parsed.fieldErrors }, 422)
  }

  const { name, email, message, website, turnstileToken } = parsed.data

  // Honeypot: das Feld ist im Layout versteckt. Wer es ausfuellt, ist ein Bot.
  // Antwort bewusst 200/ok - ein Bot, der einen Fehler sieht, probiert weiter.
  if (website) return json({ ok: true }, 200)

  const captcha = await verifyTurnstile(
    turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    request.headers.get('CF-Connecting-IP'),
  )
  if (captcha.status === 'failed') {
    return json({ ok: false, error: 'captcha' }, 403)
  }

  const mailer = createMailer(env)
  if (!mailer) {
    // Kein Schluessel hinterlegt. Kein Fehler im Code, sondern eine noch
    // offene Zeile der Deployment-Checkliste - das Formular sagt es ehrlich.
    console.warn('Kontaktformular: Mailversand nicht konfiguriert (BREVO_API_KEY fehlt).')
    return json({ ok: false, error: 'unconfigured' }, 503)
  }

  const result = await mailer.send(buildMessage({ name, email, message }))
  if (!result.ok) {
    return json({ ok: false, error: 'send-failed' }, 502)
  }

  return json({ ok: true }, 200)
}

/** Alles ausser POST. Ohne diesen Handler faellt die Route auf ein 404 zurueck. */
export const onRequest = async (): Promise<Response> =>
  new Response(null, { status: 405, headers: { allow: 'POST' } })

/**
 * Rendert die Benachrichtigung.
 *
 * Jeder eingesetzte Wert laeuft durch `escapeHtml` - die Felder stammen von
 * einem unbekannten Absender aus dem offenen Netz.
 */
function buildMessage(input: { name: string; email: string; message: string }): MailMessage {
  const name = singleLine(input.name)
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(input.email)
  const safeMessage = escapeHtmlWithBreaks(input.message)

  const html = `<!doctype html>
<html lang="de">
  <body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1a1a1a;">
    <h1 style="font-size: 18px;">Neue Nachricht über das Kontaktformular</h1>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>E-Mail:</strong> ${safeEmail}</p>
    <p><strong>Nachricht:</strong></p>
    <div style="border-left: 3px solid #ddd; padding-left: 12px;">${safeMessage}</div>
    <p style="font-size: 12px; color: #666; margin-top: 24px;">
      Automatisch erzeugt. Antworten geht direkt an den Absender.
    </p>
  </body>
</html>`

  const text = [
    'Neue Nachricht über das Kontaktformular',
    '',
    `Name:   ${name}`,
    `E-Mail: ${input.email}`,
    '',
    input.message,
  ].join('\n')

  return {
    subject: singleLine(`Kontaktformular: Nachricht von ${name}`),
    html,
    text,
    replyTo: { email: input.email, name },
  }
}
