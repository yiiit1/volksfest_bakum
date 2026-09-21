'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Cloudflare Turnstile - das Widget im Browser.
 *
 * Turnstile ersetzt reCAPTCHA und ist einwilligungsfrei: keine Cookies zu
 * Werbe- oder Analysezwecken, Verarbeitung durch den Hoster der Seite, kein
 * Consent-Banner noetig (CLAUDE.md Paragraph 11). Das Widget erzeugt ein
 * Token; verbindlich geprueft wird es in `functions/api/contact.ts`.
 *
 * Ohne `NEXT_PUBLIC_TURNSTILE_SITE_KEY` passiert hier gar nichts: kein
 * Script, kein Widget, keine externe Verbindung. Das Template muss sich ohne
 * Schluessel bauen und bedienen lassen (PLAN.md, Phase 2).
 *
 * Damit das Script laedt, braucht `public/_headers` in der CSP
 * `https://challenges.cloudflare.com` bei `script-src` und `frame-src`.
 *
 * Bewusst eine Komponente und kein Hook: so bleibt der Ref auf den Container
 * innerhalb einer Komponente. Ueber eine Hook-Grenze gereicht, beanstandet
 * ihn `react-hooks/refs` zu Recht.
 */

/** Ausschnitt der Turnstile-API, den diese Komponente benutzt. */
type TurnstileApi = {
  render(
    container: HTMLElement,
    options: {
      sitekey: string
      callback?: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
      'timeout-callback'?: () => void
      theme?: 'auto' | 'light' | 'dark'
      language?: string
    },
  ): string
  reset(widgetId?: string): void
  remove(widgetId?: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/** Wird beim Build eingesetzt; leer, solange kein Key hinterlegt ist. */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || ''

/** Ob das Formular ein Token erwarten darf. */
export const TURNSTILE_ENABLED = SITE_KEY.length > 0

/** Das Script wird hoechstens einmal pro Seite geladen, auch bei mehreren Widgets. */
let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    const script = existing ?? document.createElement('script')

    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Turnstile nicht erreichbar')), {
      once: true,
    })

    if (!existing) {
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })

  return scriptPromise
}

type TurnstileProps = {
  /** Neues Token oder `null`, sobald keins mehr gilt. */
  onToken: (token: string | null) => void
  /**
   * Zaehler. Jede Erhoehung fordert ein frisches Token an - noetig nach jedem
   * Absendeversuch, denn ein Token gilt genau einmal.
   */
  resetSignal: number
}

export function Turnstile({ onToken, resetSignal }: TurnstileProps): React.ReactElement | null {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  // Der Callback kann sich bei jedem Render des Formulars aendern; das Widget
  // soll deswegen nicht neu aufgebaut werden. Deshalb liegt immer die
  // aktuelle Fassung in einem Ref - nachgezogen im Effekt, nicht im Render.
  const onTokenRef = useRef(onToken)
  useEffect(() => {
    onTokenRef.current = onToken
  })

  useEffect(() => {
    if (!TURNSTILE_ENABLED || !container) return

    let cancelled = false

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile || widgetIdRef.current) return
        widgetIdRef.current = window.turnstile.render(container, {
          sitekey: SITE_KEY,
          callback: (value) => onTokenRef.current(value),
          // Ein Token verfaellt nach einigen Minuten. Der Besucher muss dann
          // nichts tun - Turnstile holt selbst ein neues; bis dahin ist das
          // Formular ohne Token und meldet die Pruefung als offen.
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
          'timeout-callback': () => onTokenRef.current(null),
          theme: 'auto',
          language: 'de',
        })
      })
      .catch(() => {
        // Script blockiert, offline oder von der CSP abgewiesen: es bleibt
        // beim fehlenden Token, das Formular zeigt den Captcha-Hinweis statt
        // stumm zu scheitern.
        onTokenRef.current(null)
      })

    return () => {
      cancelled = true
      const widgetId = widgetIdRef.current
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId)
        widgetIdRef.current = null
      }
    }
  }, [container])

  useEffect(() => {
    if (resetSignal === 0) return
    const widgetId = widgetIdRef.current
    if (widgetId && window.turnstile) window.turnstile.reset(widgetId)
  }, [resetSignal])

  if (!TURNSTILE_ENABLED) return null

  return <div ref={setContainer} />
}
