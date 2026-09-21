import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-End-Tests laufen gegen den fertigen Build, nicht gegen `next dev`.
 *
 * Grund: ausgeliefert wird spaeter der statische Export aus out/ - bedient
 * von Cloudflare Pages samt public/_headers, public/_redirects und den Pages
 * Functions unter functions/. `next dev` kennt von alldem nichts: dort gibt
 * es /api/contact gar nicht, die Sicherheits-Header fehlen, und Dinge, die
 * nur im Dev-Server funktionieren, faellt niemand auf.
 *
 * `npm run preview:test` startet deshalb `wrangler pages dev` - dieselbe
 * Runtime (workerd), dieselbe Datei-Zuordnung, nur mit leergeraeumten
 * Zugangsdaten statt der lokalen .env.local, damit aus einem Testlauf keine
 * echte Mail rausgeht (siehe scripts/preview-test.mjs).
 *
 * Der Build muss vorher gelaufen sein - `npm run test:e2e` erledigt beides
 * nacheinander.
 */
const PORT = 8788
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Eine Zeile pro Test im CI-Log, der HTML-Bericht als Artefakt daneben.
  // `open: 'never'`, weil ein Bericht, der einen Browser oeffnen will, den
  // CI-Lauf sonst haengen laesst.
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['html']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview:test',
    url: BASE_URL,
    // Lokal den schon laufenden Server weiterbenutzen; in der CI immer frisch,
    // sonst testet man gegen einen alten Build.
    reuseExistingServer: !process.env.CI,
    // workerd muss beim ersten Start entpackt werden - das dauert.
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      // Keine Telemetrie aus der CI heraus, und kein interaktiver Prompt,
      // der auf eine Antwort wartet, die dort niemand gibt.
      WRANGLER_SEND_METRICS: 'false',
      CI: '1',
    },
  },
})
