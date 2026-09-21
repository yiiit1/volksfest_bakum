/**
 * Motion-Tokens.
 *
 * Bewegung ist Teil des Designs, nicht Beiwerk - deshalb liegen ihre Werte
 * genauso zentral wie Farben und Schriftgroessen. Wer das Tempo einer Website
 * aendern will, aendert diese Datei, nicht zwoelf Komponenten.
 *
 * CLAUDE.md §1: lieber eine gut orchestrierte Bewegung als viele zerstreute
 * Micro-Interactions.
 */

/**
 * Weiche Ausklang-Kurve ("ease out expo"-artig): schneller Start, langes
 * Auslaufen. Wirkt bei Einblendungen ruhiger als das lineare Standard-Easing.
 *
 * Explizit als Tupel typisiert - ein `number[]` waere fuer Motion kein
 * gueltiger Bezier.
 */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Dauern in Sekunden (Motion rechnet nicht in Millisekunden). */
export const DURATION = {
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
} as const

/** Wie weit ein Element beim Einblenden wandert (px). */
export const REVEAL_DISTANCE = 24

/** Versatz zwischen zwei Geschwistern in <Stagger> (Sekunden). */
export const STAGGER_STEP = 0.09

/** Maximaler Parallax-Weg nach oben bzw. unten (px). */
export const PARALLAX_DISTANCE = 48
