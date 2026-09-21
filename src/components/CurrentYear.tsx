'use client'

import { useSyncExternalStore } from 'react'

type CurrentYearProps = {
  /**
   * Jahr, das im ausgelieferten HTML steht. Muss von einer Server Component
   * kommen (`new Date().getFullYear()`), damit hier wirklich der Zeitpunkt
   * des Builds ankommt - in dieser Datei liefe `new Date()` sonst auch im
   * Browser und waere gar nicht das Build-Jahr.
   */
  buildYear: number
}

/** Die Uhr des Browsers, aus Sicht von React ein externer Speicher. */
function subscribe(): () => void {
  // Es gibt nichts zu abonnieren: dass jemand ueber den Jahreswechsel hinweg
  // dieselbe Seite offen haelt, ist kein Fall, fuer den sich ein Timer lohnt.
  return () => {}
}

function getSnapshot(): number {
  return new Date().getFullYear()
}

/**
 * Aktuelles Jahr fuer die Copyright-Zeile.
 *
 * Im statischen Export laeuft `new Date()` genau einmal: beim Build. Eine
 * Website, die im Dezember gebaut und danach ein Jahr lang nicht angefasst
 * wird, zeigt sonst bis zum naechsten Deployment die falsche Jahreszahl.
 *
 * Deshalb zwei Stufen: das HTML traegt das Build-Jahr - auch ohne JavaScript
 * steht also eine plausible Zahl da -, und nach der Hydration korrigiert der
 * Browser sie auf das echte Jahr.
 *
 * useSyncExternalStore statt useEffect + setState: React kennt damit von
 * vornherein zwei Werte (Server und Client) und braucht keinen zweiten
 * Renderdurchlauf, um den richtigen einzusetzen.
 */
export function CurrentYear({ buildYear }: CurrentYearProps): React.ReactElement {
  const year = useSyncExternalStore(subscribe, getSnapshot, () => buildYear)

  return <>{year}</>
}
