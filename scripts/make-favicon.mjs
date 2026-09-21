#!/usr/bin/env node
/**
 * Erzeugt src/app/favicon.ico aus src/app/icon.png.
 *
 * Warum ueberhaupt eine .ico-Datei, wo doch src/app/icon.png existiert?
 * Next.js schreibt daraus ein <link rel="icon" href="/icon.png?…">. Das
 * reicht fuer Browser, aber nicht fuer alles andere: RSS-Reader, Link-
 * Vorschauen in Messengern, Suchmaschinen-Crawler und aeltere Clients fragen
 * stur /favicon.ico ab. Ohne die Datei ist das bei jedem Seitenaufruf ein 404.
 *
 * Liegt favicon.ico in src/app/, legt Next sie beim Build als out/favicon.ico
 * ab - genau dort, wo diese Clients suchen.
 *
 * Aufruf nach jedem Austausch des Logos:
 *   npm run favicon
 *
 * Bewusst ohne Abhaengigkeit (sharp, jimp, png-to-ico): das Skript laeuft im
 * CI und auf jedem Rechner, ohne dass eine native Bibliothek gebaut werden
 * muss. Es beherrscht dafuer nur den Fall, den next/font-freie Logos ohnehin
 * haben: 8 Bit pro Kanal, RGBA oder RGB, nicht interlaced.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(ROOT, 'src/app/icon.png')
const TARGET = resolve(ROOT, 'src/app/favicon.ico')

/** Groessen im ICO. 16/32 fuer Tabs und Lesezeichen, 48 fuer die Taskleiste. */
const SIZES = [16, 32, 48]

// ---------------------------------------------------------------------------
// PNG lesen
// ---------------------------------------------------------------------------

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/**
 * Entpackt ein PNG zu {width, height, data} mit 4 Byte (RGBA) pro Pixel.
 *
 * @param {Buffer} buffer
 * @returns {{ width: number, height: number, data: Buffer }}
 */
function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Keine PNG-Datei (Signatur passt nicht).')
  }

  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  let interlace = 0
  const idat = []

  // Chunks: laenge (4) + typ (4) + daten + crc (4).
  for (let offset = 8; offset < buffer.length; ) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const data = buffer.subarray(offset + 8, offset + 8 + length)

    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      interlace = data[12]
    } else if (type === 'IDAT') {
      idat.push(data)
    } else if (type === 'IEND') {
      break
    }

    offset += 12 + length
  }

  if (bitDepth !== 8 || interlace !== 0 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(
      `Nicht unterstuetztes PNG (bitDepth=${bitDepth}, colorType=${colorType}, ` +
        `interlace=${interlace}). Erwartet: 8 Bit, RGB oder RGBA, nicht interlaced. ` +
        'Das Logo einmal als solches PNG neu exportieren.',
    )
  }

  const channels = colorType === 6 ? 4 : 3
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const out = Buffer.alloc(width * height * 4)

  // Jede Bildzeile beginnt mit einem Filter-Byte; die Filter beziehen sich auf
  // das Pixel links (a), die Zeile darueber (b) und links darueber (c).
  const current = Buffer.alloc(stride)
  const previous = Buffer.alloc(stride)

  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1)
    const filter = raw[rowStart]
    raw.copy(current, 0, rowStart + 1, rowStart + 1 + stride)

    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? current[i - channels] : 0
      const b = previous[i]
      const c = i >= channels ? previous[i - channels] : 0
      let value = current[i]

      if (filter === 1) value += a
      else if (filter === 2) value += b
      else if (filter === 3) value += (a + b) >> 1
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      } else if (filter !== 0) {
        throw new Error(`Unbekannter PNG-Filter ${filter} in Zeile ${y}.`)
      }

      current[i] = value & 0xff
    }

    for (let x = 0; x < width; x++) {
      const src = x * channels
      const dst = (y * width + x) * 4
      out[dst] = current[src]
      out[dst + 1] = current[src + 1]
      out[dst + 2] = current[src + 2]
      out[dst + 3] = channels === 4 ? current[src + 3] : 0xff
    }

    current.copy(previous)
  }

  return { width, height, data: out }
}

// ---------------------------------------------------------------------------
// Verkleinern
// ---------------------------------------------------------------------------

/**
 * Box-Filter auf die Zielgroesse. Die Farbkanaele werden mit Alpha gewichtet
 * gemittelt - sonst zieht ein transparenter Rand (dessen RGB oft schwarz ist)
 * einen dunklen Saum ins verkleinerte Bild.
 *
 * @param {{ width: number, height: number, data: Buffer }} image
 * @param {number} size
 * @returns {Buffer} size*size Pixel als RGBA
 */
function resize(image, size) {
  const out = Buffer.alloc(size * size * 4)
  const scaleX = image.width / size
  const scaleY = image.height / size

  for (let y = 0; y < size; y++) {
    const y0 = Math.floor(y * scaleY)
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * scaleY))

    for (let x = 0; x < size; x++) {
      const x0 = Math.floor(x * scaleX)
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * scaleX))

      let r = 0
      let g = 0
      let b = 0
      let a = 0
      let count = 0

      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * image.width + sx) * 4
          const alpha = image.data[i + 3]
          r += image.data[i] * alpha
          g += image.data[i + 1] * alpha
          b += image.data[i + 2] * alpha
          a += alpha
          count++
        }
      }

      const dst = (y * size + x) * 4
      out[dst] = a === 0 ? 0 : Math.round(r / a)
      out[dst + 1] = a === 0 ? 0 : Math.round(g / a)
      out[dst + 2] = a === 0 ? 0 : Math.round(b / a)
      out[dst + 3] = Math.round(a / count)
    }
  }

  return out
}

// ---------------------------------------------------------------------------
// ICO schreiben
// ---------------------------------------------------------------------------

/**
 * Ein Einzelbild im ICO als 32-Bit-BMP (BITMAPINFOHEADER, unkomprimiert).
 *
 * Bewusst BMP und nicht ein eingebettetes PNG: PNG im ICO versteht erst
 * Windows Vista aufwaerts, BMP versteht jeder Client. Bei 16-48 Pixeln ist
 * der Groessenunterschied bedeutungslos.
 *
 * Eigenheiten des Formats: die Zeilen stehen von unten nach oben, die Kanaele
 * in der Reihenfolge BGRA, die Hoehe im Header ist doppelt so gross wie das
 * Bild (Farbdaten + AND-Maske), und die AND-Maske muss trotz Alphakanal
 * vorhanden sein - sie bleibt hier leer.
 *
 * @param {Buffer} rgba
 * @param {number} size
 * @returns {Buffer}
 */
function encodeBmp(rgba, size) {
  const xorSize = size * size * 4
  // AND-Maske: 1 Bit pro Pixel, jede Zeile auf 4 Byte aufgefuellt.
  const maskStride = Math.ceil(size / 32) * 4
  const andSize = maskStride * size

  const header = Buffer.alloc(40)
  header.writeUInt32LE(40, 0) // biSize
  header.writeInt32LE(size, 4) // biWidth
  header.writeInt32LE(size * 2, 8) // biHeight (Farbe + Maske)
  header.writeUInt16LE(1, 12) // biPlanes
  header.writeUInt16LE(32, 14) // biBitCount
  header.writeUInt32LE(0, 16) // biCompression = BI_RGB
  header.writeUInt32LE(xorSize + andSize, 20) // biSizeImage

  const xor = Buffer.alloc(xorSize)
  for (let y = 0; y < size; y++) {
    const source = size - 1 - y // BMP steht auf dem Kopf
    for (let x = 0; x < size; x++) {
      const src = (source * size + x) * 4
      const dst = (y * size + x) * 4
      xor[dst] = rgba[src + 2] // B
      xor[dst + 1] = rgba[src + 1] // G
      xor[dst + 2] = rgba[src] // R
      xor[dst + 3] = rgba[src + 3] // A
    }
  }

  return Buffer.concat([header, xor, Buffer.alloc(andSize)])
}

/**
 * @param {Array<{ size: number, data: Buffer }>} images
 * @returns {Buffer}
 */
function encodeIco(images) {
  const directory = Buffer.alloc(6)
  directory.writeUInt16LE(0, 0) // reserviert
  directory.writeUInt16LE(1, 2) // 1 = Icon
  directory.writeUInt16LE(images.length, 4)

  const entries = []
  const payloads = []
  let offset = 6 + images.length * 16

  for (const { size, data } of images) {
    const entry = Buffer.alloc(16)
    // 0 bedeutet 256 - groessere Kantenlaengen kann das Format nicht abbilden.
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2) // Farbpalette: keine
    entry.writeUInt8(0, 3) // reserviert
    entry.writeUInt16LE(1, 4) // Planes
    entry.writeUInt16LE(32, 6) // Bit pro Pixel
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)

    entries.push(entry)
    payloads.push(data)
    offset += data.length
  }

  return Buffer.concat([directory, ...entries, ...payloads])
}

// ---------------------------------------------------------------------------

function main() {
  let source
  try {
    source = readFileSync(SOURCE)
  } catch {
    console.error(`FEHLER: ${SOURCE} nicht gefunden.`)
    console.error('Das Projekt-Logo als 8-Bit-RGBA-PNG (moeglichst 512x512) dort ablegen.')
    process.exit(1)
  }

  const image = decodePng(source)
  const ico = encodeIco(SIZES.map((size) => ({ size, data: encodeBmp(resize(image, size), size) })))

  writeFileSync(TARGET, ico)
  console.log(
    `favicon.ico geschrieben: ${SIZES.join('/')} px aus ${image.width}x${image.height} ` +
      `(${(ico.length / 1024).toFixed(1)} kB)`,
  )
}

main()
