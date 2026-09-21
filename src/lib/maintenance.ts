/**
 * Globales Wartungs-Flag.
 *
 * TRUE  -> Es wird ausschliesslich die Wartungsseite ausgeliefert. Impressum
 *          und Datenschutz bleiben erreichbar, erscheinen aber ebenfalls im
 *          Wartungs-Design (rechtlich noetig: Paragraph 5 DDG, Art. 13 DSGVO).
 * FALSE -> Die Website verhaelt sich exakt wie ohne dieses Feature.
 *
 * Der Wert laesst sich pro Deployment ueber NEXT_PUBLIC_MAINTENANCE_MODE
 * ("true" / "false") uebersteuern. Ist die Variable nicht gesetzt oder
 * unlesbar, gilt MAINTENANCE_MODE_DEFAULT.
 *
 * Bewusst eine Compile-Zeit-Konstante: das Flag wird nicht zur Laufzeit
 * umgelegt, ein Umschalten erfordert ohnehin einen neuen Build. Deshalb
 * entscheidet jede Seite schon beim Build, was sie rendert - die Website
 * bleibt dadurch vollstaendig statisch exportierbar (kein headers(), keine
 * Middleware, kein Server-Rendering pro Request).
 *
 * Hinweis: NEXT_PUBLIC_-Praefix ist korrekt und unbedenklich - kein Secret,
 * und der Wert muss auch im Client-Bundle bekannt sein (CLAUDE.md Par. 9).
 *
 * Template-Voreinstellung ist FALSE, damit ein frisches Projekt sofort die
 * echte Website zeigt. Fuer einen Kunden, dessen Seite erst im Aufbau ist,
 * hier auf true stellen und src/content/wartung.json ausfuellen.
 *
 * ACHTUNG bei der Env-Variable: sie muss dort stehen, wo BEIDE Welten sie
 * sehen. `.env.local` wird von `next dev` und `next build` gelesen - das ist
 * in Ordnung. Eine `.env.production` liest nur `next build`, und eine
 * Angabe allein im Cloudflare-Dashboard sieht der Entwicklungsrechner nie:
 * `npm run dev` faellt dann auf den Default hier zurueck und zeigt die
 * unfertige Website, waehrend das Deployment korrekt die Wartungsseite
 * ausliefert. Dieselbe Frage, zwei Antworten, keine Fehlermeldung dazwischen
 * (im Kundenprojekt linnemann genau so passiert).
 *
 * Am wenigsten kann schiefgehen, wenn der Wert fuer ein Projekt, das laenger
 * im Wartungsmodus bleibt, hier als Konstante steht und in keiner .env-Datei
 * daneben - eine Quelle statt zweier.
 */
const MAINTENANCE_MODE_DEFAULT = false

function resolveMaintenanceMode(): boolean {
  const raw = process.env.NEXT_PUBLIC_MAINTENANCE_MODE?.trim().toLowerCase()
  if (raw === 'true' || raw === '1') return true
  if (raw === 'false' || raw === '0') return false
  return MAINTENANCE_MODE_DEFAULT
}

export const MAINTENANCE_MODE: boolean = resolveMaintenanceMode()
