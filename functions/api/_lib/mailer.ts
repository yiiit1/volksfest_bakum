/**
 * Schmale Schnittstelle fuer den Mailversand.
 *
 * Die Function kennt nur `Mailer` und `MailMessage`. Ein Anbieterwechsel
 * (Brevo -> Mailjet, Postmark, SMTP-Bridge, ...) beruehrt genau zwei Stellen:
 * eine neue Datei neben `brevo.ts` und die Zeile `createProviderMailer` unten.
 *
 * Auswahl des Anbieters, Stand PLAN.md: Brevo. Ausschlaggebend ist nicht der
 * Free Tier, sondern die Verarbeitung in der EU - bei Heilpraktiker- und
 * Schulkunden koennen Formularnachrichten besondere Kategorien nach Art. 9
 * DSGVO enthalten, ein Drittlandtransfer waere dann zu begruenden.
 */
import type { Env } from './types'
import { createBrevoMailer } from './brevo'

/** Eine fertig gerenderte Nachricht. Kein Feld enthaelt mehr Rohdaten. */
export type MailMessage = {
  subject: string
  /** Bereits escaptes HTML. */
  html: string
  /** Textfassung fuer Clients ohne HTML. */
  text: string
  /** Antwortadresse - der Absender des Formulars, nicht der Kunde. */
  replyTo?: { email: string; name?: string }
}

export type MailerConfig = {
  apiKey: string
  sender: { email: string; name: string }
  receiver: { email: string }
}

export type SendResult = { ok: true } | { ok: false; status: number }

export interface Mailer {
  send(message: MailMessage): Promise<SendResult>
}

/** Hier haengt der konkrete Anbieter. Einzige Stelle, die ihn kennt. */
const createProviderMailer = createBrevoMailer

/**
 * Baut den Mailer aus den Umgebungsvariablen - oder `null`, wenn die
 * Zugangsdaten fehlen.
 *
 * `null` ist der Normalfall in der Entwicklung und in jedem frischen Klon des
 * Templates: der Build laeuft, `npm run dev` startet, und das Formular sagt
 * dem Besucher offen, dass der Versand nicht eingerichtet ist (PLAN.md,
 * Phase 2). Die Schluessel kommen erst beim Deployment dazu.
 */
export function createMailer(env: Env): Mailer | null {
  const apiKey = env.BREVO_API_KEY?.trim()
  const senderEmail = env.CONTACT_SENDER_EMAIL?.trim()
  const receiverEmail = env.CONTACT_RECEIVER_EMAIL?.trim()

  if (!apiKey || !senderEmail || !receiverEmail) return null

  return createProviderMailer({
    apiKey,
    sender: { email: senderEmail, name: env.CONTACT_SENDER_NAME?.trim() || senderEmail },
    receiver: { email: receiverEmail },
  })
}
