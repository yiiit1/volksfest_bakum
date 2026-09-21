import { z } from 'zod'

/**
 * Schema der Kontaktformular-Eingaben.
 *
 * Eine Quelle fuer beide Seiten: die Komponente im Browser prueft damit vorab
 * (Komfort), die Cloudflare Pages Function unter `functions/api/contact.ts`
 * prueft damit verbindlich. Die Function importiert diese Datei ueber einen
 * relativen Pfad - der Alias `@/` existiert nur im Next-Build, nicht im
 * esbuild-Schritt von Cloudflare Pages.
 *
 * Obergrenzen sind kein Schikane-Wert, sondern Schutz: das Feld steht offen
 * im Netz, und eine Nachricht mit 10 MB waere sonst ein zulaessiger Request.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Bitte geben Sie Ihren Namen an.')
    .max(120, 'Bitte kürzen Sie Ihren Namen.'),
  email: z
    .email('Bitte geben Sie eine gültige E-Mail-Adresse an.')
    .max(254, 'Diese E-Mail-Adresse ist zu lang.'),
  message: z
    .string()
    .trim()
    .min(10, 'Bitte schreiben Sie eine etwas längere Nachricht.')
    .max(5000, 'Bitte kürzen Sie Ihre Nachricht auf 5000 Zeichen.'),
  /**
   * Einwilligung in die Verarbeitung (Art. 6 Abs. 1 lit. a DSGVO).
   * Muss aktiv gesetzt sein - ein vorangekreuztes Kaestchen waere keine
   * wirksame Einwilligung, deshalb prueft auch der Server auf `true`.
   */
  consent: z.literal(true, 'Bitte stimmen Sie der Verarbeitung Ihrer Daten zu.'),
})

/**
 * Was tatsaechlich ueber die Leitung geht.
 *
 * `website` ist der Honeypot: ein Feld, das im Layout versteckt ist und das
 * kein Mensch ausfuellt. Ist es befuellt, war es ein Bot.
 * `turnstileToken` liefert das Turnstile-Widget, sofern ein Site Key
 * konfiguriert ist.
 */
export const contactRequestSchema = contactSchema.extend({
  // Bewusst KEIN `.max(0)`: ein befuelltes Honeypot-Feld soll nicht als
  // Eingabefehler durchschlagen, sondern in `functions/api/contact.ts` still
  // verworfen werden - ein Bot, der eine Fehlermeldung sieht, probiert weiter.
  website: z.string().max(500).optional(),
  turnstileToken: z.string().max(4096).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ContactRequest = z.infer<typeof contactRequestSchema>

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string[]>>

/**
 * Antwort der Function. Absichtlich Codes statt Texte: die Formulierungen
 * stehen in `src/content/kontakt.json` und gehoeren nicht in den Server
 * (CLAUDE.md Paragraph 3).
 */
export type ContactErrorCode =
  /** Eingaben unvollstaendig oder ungueltig. */
  | 'invalid'
  /** Kein BREVO_API_KEY / Absender / Empfaenger hinterlegt. */
  | 'unconfigured'
  /** Turnstile-Token fehlt, abgelaufen oder abgelehnt. */
  | 'captcha'
  /** Anbieter hat den Versand abgelehnt oder war nicht erreichbar. */
  | 'send-failed'

export type ContactResponse =
  | { ok: true }
  | { ok: false; error: ContactErrorCode; fieldErrors?: ContactFieldErrors }

export function validateContactInput(
  data: unknown,
): { success: true; data: ContactInput } | { success: false; fieldErrors: ContactFieldErrors } {
  const parsed = contactSchema.safeParse(data)
  if (parsed.success) return { success: true, data: parsed.data }
  return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }
}

/** Serverseitige Pruefung des kompletten Requests (inkl. Honeypot-Feld). */
export function validateContactRequest(
  data: unknown,
): { success: true; data: ContactRequest } | { success: false; fieldErrors: ContactFieldErrors } {
  const parsed = contactRequestSchema.safeParse(data)
  if (parsed.success) return { success: true, data: parsed.data }
  const { fieldErrors } = z.flattenError(parsed.error)
  return { success: false, fieldErrors }
}
