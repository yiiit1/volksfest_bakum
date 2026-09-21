/**
 * Brevo-Umsetzung der `Mailer`-Schnittstelle.
 *
 * Bewusst die HTTP-API und kein SMTP-Paket: Cloudflare Workers haben keine
 * rohen TCP-Sockets fuer SMTP, `nodemailer` und Verwandte laufen dort nicht.
 * `fetch` gibt es dagegen nativ - deshalb ist diese Datei komplett
 * abhaengigkeitsfrei.
 *
 * API-Referenz: POST https://api.brevo.com/v3/smtp/email
 * Der Absender muss im Brevo-Konto verifiziert sein, sonst antwortet die API
 * mit 400 und der Versand scheitert stumm fuer den Besucher.
 */
import type { Mailer, MailerConfig, MailMessage, SendResult } from './mailer'

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'

/** Abbruch, falls Brevo nicht antwortet - der Besucher wartet sonst ewig. */
const TIMEOUT_MS = 10_000

export function createBrevoMailer(config: MailerConfig): Mailer {
  return {
    async send(message: MailMessage): Promise<SendResult> {
      const response = await fetch(BREVO_ENDPOINT, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': config.apiKey,
        },
        body: JSON.stringify({
          sender: config.sender,
          to: [{ email: config.receiver.email }],
          replyTo: message.replyTo,
          subject: message.subject,
          htmlContent: message.html,
          textContent: message.text,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!response.ok) {
        // Bewusst ohne Antwort-Body und ohne Formularinhalte: die Logs von
        // Cloudflare sind kein Ort fuer personenbezogene Daten (PLAN.md).
        console.error(`Brevo: Versand abgelehnt (HTTP ${response.status})`)
        return { ok: false, status: response.status }
      }

      return { ok: true }
    },
  }
}
