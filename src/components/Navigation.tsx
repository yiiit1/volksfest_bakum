'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import common from '@/content/common.json'
import { Container } from '@/components/ui/Container'

/** Alles, was im Drawer den Tastaturfokus erhalten kann. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Ab hier zeigt das Layout die Desktop-Navigation (Tailwind `md:`). */
const DESKTOP_QUERY = '(min-width: 48rem)'

export function Navigation(): React.ReactElement {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  // Escape schliesst den Drawer und gibt den Fokus an den Button zurueck -
  // sonst faellt er an den Anfang des Dokuments.
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
        return
      }

      // Fokusfalle: der offene Drawer verdeckt die Seite, der Fokus darf
      // deshalb nicht dahinter wandern. Tab am letzten Element springt an den
      // Anfang, Shift+Tab am ersten ans Ende. Der Toggle-Button gehoert mit
      // in den Kreis - er ist der Weg wieder heraus.
      if (e.key !== 'Tab') return

      const drawer = drawerRef.current
      if (!drawer) return

      const elements = [
        buttonRef.current,
        ...Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE)),
      ].filter((el): el is HTMLElement => el !== null)
      if (elements.length === 0) return

      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement

      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Scroll-Sperre: ohne sie scrollt bei offenem Drawer die Seite darunter
  // weiter - auf iOS besonders auffaellig. Die vorherige Einstellung wird
  // gemerkt und zurueckgesetzt, damit ein Projekt mit eigenem
  // `overflow`-Wert am <body> nicht ueberschrieben wird.
  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Wird das Fenster bei offenem Drawer auf Desktop-Breite gezogen, blendet
  // Tailwind sowohl den Drawer als auch den Schliessen-Button aus. Ohne diesen
  // Effekt bliebe die Scroll-Sperre bestehen und die Fokusfalle liefe gegen
  // unsichtbare Elemente - die Seite waere nicht mehr bedienbar.
  useEffect(() => {
    if (!open) return

    const media = window.matchMedia(DESKTOP_QUERY)
    const handleChange = (): void => {
      if (media.matches) setOpen(false)
    }

    handleChange()
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [open])

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-display text-foreground text-xl font-semibold tracking-tight"
        >
          {common.brand.name}
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-8 text-sm md:flex">
          {common.navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile-Toggle */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? common.a11y.menuClose : common.a11y.menuOpen}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className="bg-foreground block h-0.5 w-6" />
          <span className="bg-foreground block h-0.5 w-6" />
          <span className="bg-foreground block h-0.5 w-6" />
        </button>
      </Container>

      {/* Mobile-Drawer */}
      {open && (
        <nav ref={drawerRef} id="mobile-nav" className="border-border border-t md:hidden">
          <ul className="flex flex-col">
            {common.navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-foreground hover:bg-muted block px-6 py-4 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
