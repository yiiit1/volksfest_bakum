/**
 * Startet den Vorschau-Server fuer die End-to-End-Tests.
 *
 * Wie `npm run preview`, aber mit leergeraeumten Zugangsdaten. Der Grund ist
 * kein Detail: `wrangler pages dev` laedt `.env.local` von sich aus mit. In
 * einem Kundenprojekt stehen dort die produktiven Brevo-Schluessel - jeder
 * `npm run test:e2e` wuerde dann echte Mails an den Kunden schicken.
 * Nachgestellt und bestaetigt: ohne diese Bindings geht der Request
 * tatsaechlich bis zur Brevo-API raus.
 *
 * `--env-file` hilft hier nicht: `wrangler pages dev` ignoriert die Option
 * (Stand wrangler 4.129) und liest weiter `.env.local`. `--binding` wird
 * dagegen zuletzt angewendet und ueberschreibt die Datei - geprueft.
 *
 * Die Tests in tests/e2e/cloudflare.spec.ts pruefen genau diesen Zustand:
 * ohne Schluessel muss die Function ehrlich "unconfigured" melden statt
 * abzustuerzen (PLAN.md, Phase 2).
 */
import { spawn } from 'node:child_process'

/** Alles, woraus `functions/api/_lib/mailer.ts` und turnstile.ts lesen. */
const LEER = [
  'BREVO_API_KEY',
  'CONTACT_SENDER_EMAIL',
  'CONTACT_RECEIVER_EMAIL',
  'CONTACT_SENDER_NAME',
  'TURNSTILE_SECRET_KEY',
]

const args = ['wrangler', 'pages', 'dev', ...LEER.flatMap((name) => ['--binding', `${name}=`])]

const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
})

child.on('exit', (code) => process.exit(code ?? 1))
