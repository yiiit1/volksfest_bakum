'use client'

import { MotionConfig, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { DURATION, EASE, REVEAL_DISTANCE } from './tokens'

/** Richtung, aus der eingeblendet wird. 'none' blendet nur die Deckkraft auf. */
export type RevealFrom = 'bottom' | 'top' | 'left' | 'right' | 'none'

const offsets: Record<RevealFrom, { x?: number; y?: number }> = {
  bottom: { y: REVEAL_DISTANCE },
  top: { y: -REVEAL_DISTANCE },
  left: { x: -REVEAL_DISTANCE },
  right: { x: REVEAL_DISTANCE },
  none: {},
}

type RevealProps = {
  children: ReactNode
  /** Verzoegerung in Sekunden - fuer bewusst gesetzte Reihenfolgen. */
  delay?: number
  from?: RevealFrom
  className?: string
}

/**
 * Blendet seinen Inhalt ein, sobald er ins Sichtfeld kommt. Einmalig - beim
 * Zurueckscrollen passiert nichts mehr, sonst zappelt die Seite.
 *
 * `<MotionConfig reducedMotion="user">` liegt bewusst IN der Komponente und
 * nicht im Layout: so respektiert jeder Einsatzort automatisch
 * `prefers-reduced-motion`, auch wenn jemand <Reveal> spaeter irgendwo ohne
 * Provider verwendet. Motion laesst dann die Bewegung weg und blendet nur
 * die Deckkraft auf - der Inhalt erscheint also weiterhin, er wandert nur
 * nicht. Der Provider erzeugt kein zusaetzliches DOM-Element.
 *
 * `data-motion` ist der Haken fuer den <noscript>-Rueckfall im Root-Layout:
 * ohne JavaScript blieben die Elemente sonst unsichtbar.
 */
export function Reveal({
  children,
  delay = 0,
  from = 'bottom',
  className,
}: RevealProps): React.ReactElement {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        data-motion="reveal"
        className={className}
        initial={{ opacity: 0, ...offsets[from] }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        // amount: 0.2 → ausloesen, sobald ein Fuenftel sichtbar ist. Bei hohen
        // Bloecken wuerde 1 nie erreicht und die Sektion bliebe leer.
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -10% 0px' }}
        transition={{ duration: DURATION.base, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}
