'use client'

import { MotionConfig, motion, type Variants } from 'motion/react'
import { Children, type ReactNode } from 'react'
import { DURATION, EASE, REVEAL_DISTANCE, STAGGER_STEP } from './tokens'

/**
 * Der Container animiert selbst nichts - er gibt nur den Takt vor. Die
 * Kinder erben den Variantennamen ("hidden"/"visible") automatisch.
 */
const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_STEP, delayChildren: 0.05 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: REVEAL_DISTANCE },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
}

type StaggerProps = {
  children: ReactNode
  /** Klassen fuer den Container - typischerweise das Grid selbst. */
  className?: string
}

/**
 * Blendet die direkten Kinder nacheinander ein - fuer Karten-Grids und
 * Galerien, wo alles gleichzeitig aufzupoppen unruhig wirkt.
 *
 * Jedes Kind wird in ein eigenes <motion.div> gepackt. Das ist Absicht: der
 * Aufrufer schreibt sein Grid wie gewohnt, und der Wrapper wird zum
 * Grid-Element. Wer die Huelle nicht will, nimmt <Reveal> mit `delay`.
 *
 * Zu `MotionConfig` und `data-motion` siehe Reveal.tsx.
 */
export function Stagger({ children, className }: StaggerProps): React.ReactElement {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15, margin: '0px 0px -10% 0px' }}
      >
        {Children.map(children, (child) => (
          <motion.div data-motion="stagger" variants={item}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </MotionConfig>
  )
}
