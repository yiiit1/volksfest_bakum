'use client'

import { useSyncExternalStore } from 'react'
import common from '@/content/common.json'
import { Button } from '@/components/ui/Button'

const STORAGE_KEY = 'cookie-consent-v1'
const CHANGE_EVENT = 'cookie-consent-change'

/**
 * Der Zustimmungsstatus liegt in localStorage - aus Sicht von React ein
 * externer Speicher. Deshalb useSyncExternalStore statt useEffect + setState:
 * das vermeidet den zusaetzlichen Renderdurchlauf und die Hydrations-Warnung.
 */
function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange)
  // Zustimmung in einem anderen Tab uebernehmen.
  window.addEventListener('storage', onStoreChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange)
    window.removeEventListener('storage', onStoreChange)
  }
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'accepted'
  } catch {
    // Privater Modus oder blockierter Speicher: dann lieber nicht nerven.
    return true
  }
}

// Server-Render und erster Hydrations-Durchlauf: Banner ausgeblendet. Erst
// danach entscheidet der echte localStorage-Wert - so gibt es keinen
// Unterschied zwischen serverseitig erzeugtem HTML und Client.
function getServerSnapshot(): boolean {
  return true
}

/**
 * Zustimmungsbanner - wird nur gerendert, wenn `siteConfig.features
 * .cookieConsent` auf true steht. Standard ist aus: ohne Tracker und ohne
 * externe Einbettung gibt es nichts, dem zugestimmt werden muesste.
 *
 * ACHTUNG (auch in CLAUDE.md §11 vermerkt): das hier ist reine Oberflaeche.
 * Der Klick auf "Verstanden" setzt einen Wert im localStorage - er blockiert
 * kein Script und trifft keine granulare Auswahl. Wer wirklich Tracking
 * einbindet, braucht entweder eine echte Blocking-Logik oder ein
 * Consent-Management-Werkzeug; dieser Banner allein macht die Einbindung
 * nicht zulaessig.
 */
export function CookieConsent(): React.ReactElement | null {
  const accepted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function accept(): void {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted')
    } catch {
      // Ohne Speicher bleibt die Zustimmung auf diesen Seitenaufruf beschraenkt.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  if (accepted) return null

  return (
    // role="region" + aria-label macht den Banner zu einem benannten
    // Landmark: Screenreader-Nutzung findet ihn ueber die Landmark-Liste, und
    // er laesst sich normal antabben.
    //
    // Vorher stand hier role="dialog" zusammen mit aria-live="polite" - beides
    // zusammen ist widerspruechlich. Ein Dialog wird angekuendigt, indem der
    // Fokus hineinwandert; eine Live-Region wird vorgelesen, ohne dass sich
    // der Fokus bewegt. Die Kombination liest der Screenreader je nach
    // Hersteller doppelt oder gar nicht vor. Dazu kam: als "dialog"
    // angekuendigt erwartet man, dass die Seite dahinter gesperrt ist und
    // Escape schliesst - beides trifft hier nicht zu.
    //
    // Soll der Banner die Seite wirklich blockieren, reicht role="dialog"
    // allein nicht: dann braucht er aria-modal="true", einen Fokus, der beim
    // Erscheinen hineingesetzt und beim Schliessen zurueckgegeben wird, eine
    // Fokusfalle und inert auf dem Rest der Seite (siehe die Umsetzung im
    // Mobile-Drawer in @/components/Navigation).
    <div
      role="region"
      aria-label={common.cookieConsent.settingsLabel}
      className="border-border bg-background max-w-narrow fixed inset-x-4 bottom-4 z-50 mx-auto rounded-[var(--radius-lg)] border p-4 shadow-lg sm:p-6"
    >
      <p className="text-foreground text-sm">{common.cookieConsent.message}</p>
      <div className="mt-4 flex justify-end">
        <Button onClick={accept}>{common.cookieConsent.accept}</Button>
      </div>
    </div>
  )
}
