#!/usr/bin/env node
/**
 * Bereitet Bilder fuer den statischen Export auf.
 *
 * Warum das noetig ist: `next.config.ts` setzt `images.unoptimized: true` -
 * auf Cloudflare Pages gibt es keinen Server, der Bilder zur Laufzeit
 * verkleinert. `<Image>` liefert die Datei also genau so aus, wie sie in
 * public/ liegt. Ein Kamerafoto mit 4,2 MB bleibt ein Kamerafoto mit 4,2 MB
 * und ruiniert den LCP-Wert (CLAUDE.md §10, Core Web Vitals).
 *
 * Dieses Skript nimmt Rohdateien entgegen, skaliert sie auf eine sinnvolle
 * Maximalbreite, schreibt WebP nach public/images/ und gibt am Ende den
 * fertigen JSON-Block aus, der in src/content/*.json gehoert - inklusive der
 * echten `width`/`height`, die Layout-Shift verhindern.
 *
 * Aufruf:
 *   npm run images -- fotos/*.jpg
 *   npm run images -- --width 2000 fotos/hero.png
 *   npm run images -- --format avif --quality 55 fotos/galerie
 *
 * Optionen:
 *   --width <px>     Maximale Kantenlaenge in der Breite (Standard 1600).
 *                    Kleinere Bilder werden nie hochskaliert.
 *   --format <fmt>   webp (Standard) oder avif. AVIF ist ~20 % kleiner,
 *                    braucht aber deutlich laenger beim Kodieren.
 *   --quality <1-100>  Standard 78 (webp) bzw. 50 (avif).
 *   --out <pfad>     Zielverzeichnis (Standard public/images).
 *
 * Verzeichnisse werden eine Ebene tief eingelesen. Vorhandene Zieldateien
 * werden ueberschrieben - das Ergebnis soll reproduzierbar sein.
 *
 * Bewusst NICHT Teil von `npm run build`: die Rohdateien liegen in der Regel
 * gar nicht im Repository, und ein Build soll nichts erzeugen, was danach
 * committet werden muesste. Einmal aufrufen, Ergebnis einchecken.
 */
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { basename, extname, join, relative, resolve, sep } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')

/** Was sharp zuverlaessig lesen kann. SVG bleibt aussen vor - siehe unten. */
const INPUT_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff'])

const DEFAULTS = {
  width: 1600,
  format: 'webp',
  out: 'public/images',
}

const QUALITY_DEFAULTS = { webp: 78, avif: 50 }

// ---------------------------------------------------------------------------
// Argumente
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const options = { ...DEFAULTS, quality: null }
  const inputs = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '--width':
        options.width = Number(argv[++i])
        break
      case '--format':
        options.format = String(argv[++i]).toLowerCase()
        break
      case '--quality':
        options.quality = Number(argv[++i])
        break
      case '--out':
        options.out = String(argv[++i])
        break
      case '--help':
      case '-h':
        options.help = true
        break
      default:
        if (arg.startsWith('-')) throw new Error(`Unbekannte Option: ${arg}`)
        inputs.push(arg)
    }
  }

  if (!Number.isFinite(options.width) || options.width < 1) {
    throw new Error('--width braucht eine positive Zahl.')
  }
  if (!['webp', 'avif'].includes(options.format)) {
    throw new Error(`--format kennt nur webp und avif, nicht "${options.format}".`)
  }
  if (options.quality === null) options.quality = QUALITY_DEFAULTS[options.format]
  if (!Number.isFinite(options.quality) || options.quality < 1 || options.quality > 100) {
    throw new Error('--quality braucht eine Zahl zwischen 1 und 100.')
  }

  return { options, inputs }
}

const USAGE = `
  Bilder fuer den statischen Export aufbereiten.

    npm run images -- <datei|verzeichnis> [...]

  Optionen:
    --width <px>       maximale Breite, Standard ${DEFAULTS.width}
    --format <fmt>     webp (Standard) oder avif
    --quality <1-100>  Standard ${QUALITY_DEFAULTS.webp} (webp) / ${QUALITY_DEFAULTS.avif} (avif)
    --out <pfad>       Zielverzeichnis, Standard ${DEFAULTS.out}

  Beispiel:
    npm run images -- --width 2000 ~/Downloads/praxis-*.jpg
`

// ---------------------------------------------------------------------------
// Dateien einsammeln
// ---------------------------------------------------------------------------

async function collect(inputs) {
  const files = []

  for (const input of inputs) {
    const path = resolve(ROOT, input)
    let info
    try {
      info = await stat(path)
    } catch {
      console.warn(`  uebersprungen (nicht gefunden): ${input}`)
      continue
    }

    if (info.isDirectory()) {
      for (const entry of await readdir(path, { withFileTypes: true })) {
        if (entry.isFile() && INPUT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
          files.push(join(path, entry.name))
        }
      }
      continue
    }

    const ext = extname(path).toLowerCase()
    if (ext === '.svg') {
      // SVG ist bereits vektoriell und beliebig skalierbar. Durch sharp
      // gejagt wuerde daraus ein Pixelbild - eine Verschlechterung.
      console.warn(`  uebersprungen (SVG braucht keine Aufbereitung): ${input}`)
      continue
    }
    if (!INPUT_EXTENSIONS.has(ext)) {
      console.warn(`  uebersprungen (unbekanntes Format ${ext || '?'}): ${input}`)
      continue
    }
    files.push(path)
  }

  return files
}

// ---------------------------------------------------------------------------

/** Aus "Praxis Foto 01.JPG" wird "praxis-foto-01" - Dateinamen sind URLs. */
function slugify(name) {
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u00df/g, 'ss')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'bild'
  )
}

/** "-72 %" wenn die Datei kleiner wurde, "+13 %" wenn sie gewachsen ist. */
function formatDelta(before, after) {
  const percent = Math.round((1 - after / before) * 100)
  return `${percent >= 0 ? '-' : '+'}${Math.abs(percent)} %`
}

function formatBytes(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} kB`
}

async function loadSharp() {
  try {
    return (await import('sharp')).default
  } catch {
    console.error('\n  FEHLER: sharp ist nicht installiert.\n')
    console.error('    npm install --save-dev sharp\n')
    console.error('  sharp bringt vorkompilierte Binaerdateien mit; ein Compiler ist')
    console.error('  nicht noetig. Es wird nur lokal gebraucht - weder der Build auf')
    console.error('  Cloudflare noch die CI rufen dieses Skript auf.\n')
    process.exit(1)
  }
}

async function main() {
  let parsed
  try {
    parsed = parseArgs(process.argv.slice(2))
  } catch (error) {
    console.error(`\n  ${error.message}`)
    console.error(USAGE)
    process.exit(1)
  }

  const { options, inputs } = parsed

  if (options.help || inputs.length === 0) {
    console.log(USAGE)
    process.exit(inputs.length === 0 && !options.help ? 1 : 0)
  }

  const files = await collect(inputs)
  if (files.length === 0) {
    console.error('\n  Keine verwertbaren Bilder gefunden.\n')
    process.exit(1)
  }

  const sharp = await loadSharp()
  const outDir = resolve(ROOT, options.out)
  await mkdir(outDir, { recursive: true })

  // Der Pfad im JSON ist der oeffentliche, nicht der auf der Platte:
  // public/images/foto.webp wird zu /images/foto.webp. Liegt das
  // Zielverzeichnis ausserhalb von public/, kann es keinen solchen Pfad
  // geben - dann sagt das Skript unten, dass die Dateien noch dorthin
  // gehoeren, statt einen erfundenen Pfad auszugeben.
  const publicDir = resolve(ROOT, 'public')
  const insidePublic = outDir === publicDir || outDir.startsWith(publicDir + sep)
  // split/join statt Regex: unter Windows ist der Trenner ein Backslash, der
  // im JSON-Pfad nichts zu suchen hat. Liegt das Ziel direkt in public/,
  // bleibt der Prefix leer - aus "" + "/foto.webp" wird der richtige Pfad.
  const publicPrefix = insidePublic
    ? relative(publicDir, outDir)
        .split(sep)
        .filter(Boolean)
        .map((segment) => `/${segment}`)
        .join('')
    : null

  /** Fuer den JSON-Block am Ende. */
  const results = []
  let bytesBefore = 0
  let bytesAfter = 0

  console.log(
    `\n  ${files.length} Bild(er) -> ${options.format.toUpperCase()}, ` +
      `max. ${options.width} px, Qualitaet ${options.quality}\n`,
  )

  for (const file of files) {
    const source = await readFile(file)
    const name = `${slugify(basename(file, extname(file)))}.${options.format}`
    const target = join(outDir, name)

    const pipeline = sharp(source)
      // withoutEnlargement: ein 900-px-Foto wird nicht auf 1600 aufgeblasen -
      // das kostet Bytes und bringt kein Pixel Detail dazu.
      .resize({ width: options.width, withoutEnlargement: true })
      // rotate() ohne Argument wertet das EXIF-Orientation-Flag aus. Ohne das
      // liegen Handyfotos im Browser auf der Seite: der Rotationshinweis geht
      // beim Neukodieren verloren.
      .rotate()

    const buffer = await (
      options.format === 'avif'
        ? pipeline.avif({ quality: options.quality })
        : pipeline.webp({ quality: options.quality })
    ).toBuffer()

    await writeFile(target, buffer)

    // Die Masse aus dem Ergebnis lesen, nicht aus der Quelle rechnen -
    // Rundung und EXIF-Drehung wuerden sonst um ein Pixel danebenliegen.
    const { width, height } = await sharp(buffer).metadata()

    bytesBefore += source.length
    bytesAfter += buffer.length
    results.push({
      src: publicPrefix === null ? `/${name}` : `${publicPrefix}/${name}`,
      width,
      height,
    })

    console.log(
      `  ${relative(ROOT, target).split(sep).join('/')}  ${width}x${height}  ` +
        `${formatBytes(buffer.length)}  (vorher ${formatBytes(source.length)}, ` +
        `${formatDelta(source.length, buffer.length)})`,
    )
  }

  console.log(
    `\n  Summe: ${formatBytes(bytesBefore)} -> ${formatBytes(bytesAfter)} ` +
      `(${formatDelta(bytesBefore, bytesAfter)})\n`,
  )

  if (publicPrefix === null) {
    console.log(`  Hinweis: ${options.out} liegt ausserhalb von public/.`)
    console.log('  Die Dateien dorthin verschieben und "src" entsprechend anpassen.\n')
  }

  // Fertiger Block fuer src/content/*.json. `alt` bleibt leer - den Text
  // kann nur ein Mensch schreiben, und ein automatisch erfundener waere
  // schlimmer als keiner (CLAUDE.md §7).
  console.log('  Fuer src/content/*.json (alt-Texte noch ergaenzen):\n')
  for (const entry of results) {
    console.log(
      `    { "src": "${entry.src}", "alt": "", ` +
        `"width": ${entry.width}, "height": ${entry.height} },`,
    )
  }
  console.log('')
}

await main()
