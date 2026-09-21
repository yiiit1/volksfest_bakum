'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onStoreChange: () => void): () => void {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

/**
 * Auf dem Server und waehrend der Hydration gilt: Bewegung reduziert.
 * Das ist der einzige Wert, der zum ausgelieferten HTML passt - die
 * Systemeinstellung des Besuchers kennt nur der Browser.
 */
function getServerSnapshot(): boolean {
  return true
}

/**
 * `prefers-reduced-motion` als React-Zustand.
 *
 * Warum nicht `useReducedMotion()` aus Motion? Das liest die Einstellung
 * beim ersten Client-Render sofort aus. Wer daraufhin verzweigt, rendert
 * etwas anderes als im HTML steht, und React meldet einen Hydrations-
 * Unterschied. `useSyncExternalStore` mit einem Server-Snapshot loest genau
 * das: waehrend der Hydration gilt der Server-Wert, danach der echte -
 * und Aenderungen der Systemeinstellung kommen weiterhin an.
 *
 * Fuer reine Animationen braucht man den Hook nicht;
 * `<MotionConfig reducedMotion="user">` erledigt das (siehe Reveal.tsx).
 * Noetig ist er bei Werten, die an den Scrollstand gebunden sind - dort
 * greift MotionConfig nicht (siehe Parallax.tsx).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
