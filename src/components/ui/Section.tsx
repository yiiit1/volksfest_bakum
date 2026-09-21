import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

/**
 * Vertikaler Rhythmus. Die Werte stehen als `--section-space-*` in
 * globals.css und skalieren stufenlos mit der Viewport-Breite.
 *
 *   sm  dichte Abschnitte, die zusammengehoeren
 *   md  Standard
 *   lg  Auftritt - Hero, Schlussband, alles was Luft braucht
 */
export type SectionSpace = 'sm' | 'md' | 'lg'

/**
 * Flaechenwirkung. Der Wechsel zwischen `default` und `muted` ist das, was
 * eine Seite in Abschnitte gliedert, ohne dass ueberall Linien noetig sind.
 */
export type SectionTone = 'default' | 'muted' | 'accent' | 'inverted'

const spaces: Record<SectionSpace, string> = {
  // Arbitrary Values statt Tailwind-Spacing: die Tokens duerfen nicht im
  // `--spacing-*`-Namensraum liegen, sonst kapern sie die max-w-Klassen
  // (siehe Kommentar in globals.css).
  sm: 'py-[var(--section-space-sm)]',
  md: 'py-[var(--section-space-md)]',
  lg: 'py-[var(--section-space-lg)]',
}

const tones: Record<SectionTone, string> = {
  default: 'bg-background text-foreground',
  muted: 'bg-muted text-foreground',
  accent: 'bg-accent text-accent-foreground',
  inverted: 'bg-foreground text-background',
}

type SectionProps = {
  children: ReactNode
  id?: string
  space?: SectionSpace
  tone?: SectionTone
  /** Trennlinie unten. Nur sinnvoll, wenn beide Nachbarn denselben Ton haben. */
  bordered?: boolean
  className?: string
}

/**
 * Aeusserer Rahmen jeder Sektion: Rhythmus, Flaeche, optionale Trennlinie.
 *
 * Bewusst ohne Container - wie breit der Inhalt liegt, entscheidet die
 * einzelne Sektion (eine Galerie darf breiter sein als ein Zitat).
 */
export function Section({
  children,
  id,
  space = 'md',
  tone = 'default',
  bordered = false,
  className,
}: SectionProps): React.ReactElement {
  return (
    <section
      id={id}
      // scroll-mt: Sprungziele (#id) landen sonst unter der Navigation.
      className={cn(
        'scroll-mt-24',
        spaces[space],
        tones[tone],
        bordered && 'border-border border-b',
        className,
      )}
    >
      {children}
    </section>
  )
}
