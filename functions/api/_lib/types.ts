/**
 * Minimale Typen fuer Cloudflare Pages Functions.
 *
 * Bewusst selbst geschrieben statt `@cloudflare/workers-types`: gebraucht wird
 * hier nur der Zuschnitt des Kontext-Objekts, und ein zusaetzliches Paket, das
 * globale Typen ueberschreibt (`Request`, `Response`, `fetch`), wuerde die
 * Typpruefung des Next-Builds beeinflussen. Diese Dateien werden von
 * tsconfig.json miterfasst und laufen bei `npm run build` mit durch `tsc`.
 */

/**
 * Umgebungsvariablen der Function.
 *
 * Alle optional: das Template muss sich ohne Schluessel bauen und starten
 * lassen (PLAN.md, Phase 2). Fehlen sie, antwortet die Function mit
 * `unconfigured` statt zu crashen.
 *
 * Gesetzt werden sie im Cloudflare-Dashboard unter Settings > Environment
 * variables (Production und Preview getrennt), lokal in `.dev.vars`.
 */
export type Env = {
  /** Brevo API-Key (v3). Server-only, nie mit NEXT_PUBLIC_ praefixen. */
  BREVO_API_KEY?: string
  /** Verifizierter Absender im Brevo-Konto. */
  CONTACT_SENDER_EMAIL?: string
  /** Postfach, das die Anfragen empfaengt. */
  CONTACT_RECEIVER_EMAIL?: string
  /** Anzeigename des Absenders. Ohne Angabe wird CONTACT_SENDER_EMAIL genutzt. */
  CONTACT_SENDER_NAME?: string
  /** Turnstile Secret Key. Fehlt er, entfaellt die Captcha-Pruefung. */
  TURNSTILE_SECRET_KEY?: string
}

/** Ausschnitt aus `EventContext`, den diese Function tatsaechlich benutzt. */
export type FunctionContext<E = Env> = {
  request: Request
  env: E
  waitUntil(promise: Promise<unknown>): void
}
