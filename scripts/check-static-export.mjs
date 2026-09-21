/**
 * Bauabnahme vor `next build`: verhindert Dinge, die im statischen Export
 * fuer Cloudflare Pages nicht funktionieren.
 *
 * Hintergrund: unter Next.js 15 lief ein Export-Build mit einer benutzten
 * Server Action fehlerfrei durch - das Formular war still tot. Next.js 16
 * bricht in diesem Fall selbst ab, aber nur wenn die Action von einer Seite
 * aus erreichbar ist. Eine Action, die gerade niemand importiert, faellt
 * weiterhin durch; und Middleware wird bis heute kommentarlos ignoriert.
 *
 * Aufruf: `node scripts/check-static-export.mjs` (haengt in `npm run build`).
 */
import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

/** Verzeichnisse, die nicht durchsucht werden. */
const SKIP_DIRS = new Set(['node_modules', '.next', 'out', '.git', 'coverage'])

/** Dateiendungen, in denen nach Direktiven gesucht wird. */
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']

/** @type {string[]} */
const problems = []

async function collectFiles(dir) {
  /** @type {string[]} */
  const found = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return found
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...(await collectFiles(full)))
    } else if (CODE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      found.push(full)
    }
  }
  return found
}

// ---------------------------------------------------------------------------
// 1. Server Actions
// ---------------------------------------------------------------------------
// Bewusst nur unter src/: functions/ enthaelt Cloudflare Pages Functions,
// die mit Next.js nichts zu tun haben und dort auch nichts zu suchen haben.
const files = await collectFiles(SRC)

for (const file of files) {
  const source = await readFile(file, 'utf8')
  // Direktive am Dateianfang oder in einer Funktion, mit beiden Anfuehrungszeichen.
  const match = source.match(/^\s*(['"])use server\1\s*;?\s*$/m)
  if (match) {
    const line = source.slice(0, match.index).split('\n').length
    problems.push(
      `Server Action gefunden: ${relative(ROOT, file)}:${line}\n` +
        `    'use server' braucht einen Node-Server. Im statischen Export laeuft\n` +
        `    die Funktion nie - das Formular waere still tot. Stattdessen eine\n` +
        `    Cloudflare Pages Function unter functions/ anlegen.`,
    )
  }
}

// ---------------------------------------------------------------------------
// 2. Middleware / Proxy
// ---------------------------------------------------------------------------
// Wird im Export kommentarlos ignoriert - kein Fehler, keine Warnung, die
// Umleitung oder Absicherung passiert einfach nicht.
for (const base of [ROOT, SRC]) {
  for (const name of ['middleware', 'proxy']) {
    for (const ext of ['.ts', '.js']) {
      const candidate = join(base, name + ext)
      if (existsSync(candidate)) {
        problems.push(
          `Middleware gefunden: ${relative(ROOT, candidate)}\n` +
            `    Wird im statischen Export ignoriert. Umleitungen gehoeren nach\n` +
            `    public/_redirects, Header nach public/_headers.`,
        )
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 3. redirects() / headers() in der Next-Konfiguration
// ---------------------------------------------------------------------------
// Gleiche Falle: der Build laeuft durch, die Regeln landen aber nirgends.
const configPath = ['next.config.ts', 'next.config.js', 'next.config.mjs']
  .map((name) => join(ROOT, name))
  .find((path) => existsSync(path))

if (configPath) {
  const config = await readFile(configPath, 'utf8')
  // Kommentierte Zeilen ignorieren - die Vorlage erklaert genau diese Fallen.
  const uncommented = config
    .split('\n')
    .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
    .join('\n')
  for (const fn of ['redirects', 'headers', 'rewrites']) {
    // Bewusst als einfache Textsuche: es geht um eine Warnung, nicht um
    // eine Parser-genaue Analyse.
    if (uncommented.includes(fn + '(') || uncommented.includes(fn + ' (')) {
      problems.push(
        `${fn}() in ${relative(ROOT, configPath)}
    Aus der Next-Konfiguration heraus im Export wirkungslos.
    Gehoert nach public/_redirects bzw. public/_headers.`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Die Cloudflare-Dateien muessen ueberhaupt existieren
// ---------------------------------------------------------------------------
for (const name of ['_headers', '_redirects']) {
  if (!existsSync(join(ROOT, 'public', name))) {
    problems.push(
      `public/${name} fehlt.\n` +
        `    Ohne diese Datei liefert Cloudflare Pages weder Sicherheits-Header\n` +
        `    noch Umleitungen aus.`,
    )
  }
}

// ---------------------------------------------------------------------------
if (problems.length > 0) {
  console.error('\n  Build abgebrochen - passt nicht zum statischen Export:\n')
  for (const problem of problems) console.error(`  - ${problem}\n`)
  console.error('  Hintergrund: AGENTS.md, Abschnitt "Projektspezifisches".\n')
  process.exit(1)
}

console.log(`  Export-Pruefung ok (${files.length} Dateien unter src${sep}).`)
