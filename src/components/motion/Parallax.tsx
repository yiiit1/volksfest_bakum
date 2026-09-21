'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { PARALLAX_DISTANCE } from './tokens'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type ParallaxProps = {
  children: ReactNode
  /** Weg nach oben bzw. unten in px. Kleine Werte wirken teurer als grosse. */
  distance?: number
  /** Klassen fuer den aeusseren Rahmen (Groesse, Rundung, overflow-hidden). */
  className?: string
}

/**
 * Verschiebt seinen Inhalt beim Scrollen leicht gegen die Seite - fuer Bilder,
 * die dadurch Tiefe bekommen.
 *
 * Anders als <Reveal> nicht ueber <MotionConfig> abgesichert: Parallax ist
 * keine Animation, sondern ein an den Scrollstand gebundener Wert, und dort
 * greift MotionConfig nicht. Wer Bewegung reduziert haben will, bekommt hier
 * deshalb gar keine - der Hook liefert bis zum Ende der Hydration ohnehin
 * "reduziert", weshalb der erste Client-Render exakt dem HTML entspricht
 * (siehe usePrefersReducedMotion).
 *
 * Ohne JavaScript bleibt schlicht das unbewegte Bild stehen.
 */
export function Parallax({
  children,
  distance = PARALLAX_DISTANCE,
  className,
}: ParallaxProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  // 'start end' → 0, sobald die Oberkante des Elements die Unterkante des
  // Fensters erreicht; 'end start' → 1, wenn es oben herauslaeuft.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  return (
    <div ref={ref} className={className}>
      <motion.div
        data-motion="parallax"
        className="relative h-full w-full will-change-transform"
        style={reduced ? undefined : { y }}
      >
        {children}
      </motion.div>
    </div>
  )
}
