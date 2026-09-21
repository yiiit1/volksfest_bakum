import { Container, type ContainerWidth } from '@/components/ui/Container'
import { Section, type SectionSpace, type SectionTone } from '@/components/ui/Section'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  lead?: string
  eyebrow?: string
  /** Frei gestaltbarer Zusatz unter dem Vorspann (Buttons, Kontaktzeile, …). */
  children?: ReactNode
  width?: ContainerWidth
  space?: SectionSpace
  tone?: SectionTone
  bordered?: boolean
  className?: string
}

/**
 * Kopf einer handgeschriebenen Seite: <h1>, Vorspann, gleicher Rahmen wie
 * eine Sektion.
 *
 * Gegenstueck zur Hero-Sektion aus der Sektionsliste - fuer Seiten, die nicht
 * aus JSON-Bloecken bestehen (/about, /kontakt, Rechtstexte, 404). Dass beide
 * denselben `Section`-Rahmen und dieselben Typo-Tokens benutzen, ist der
 * Punkt: eine Aenderung an `--section-space-lg` oder `--text-title` in
 * globals.css erreicht damit jede Seite, nicht nur die Startseite.
 *
 * Ueberschriftsebene ist fest <h1> - eine pro Seite (CLAUDE.md §10). Eine
 * Stufe kleiner als der Hero (`text-title` statt `text-display`): der Auftakt
 * der Startseite darf lauter sein als der Kopf einer Unterseite.
 *
 * Faustregel fuer die Stufen, weil die Skala mit dem VIEWPORT waechst und
 * nicht mit dem Kasten, in dem sie steht:
 *
 *   text-display  Hero der Startseite, ueber die volle Breite
 *   text-title    Kopf einer Unterseite, ueber die volle Breite
 *   text-heading  Ueberschrift in einer schmalen Karte (Wartungsseite, 404,
 *                 Fehlerseite) und jede <h2> im Fliesstext
 *
 * `text-title` in einer 34-rem-Karte ergibt auf dem Desktop 52 px in einem
 * 544 px breiten Kasten - vier Zeilen Ueberschrift. Deshalb dort eine Stufe
 * tiefer.
 *
 * Bewusst ohne <Reveal>: die Motion-Bausteine ziehen den motion-Chunk
 * (~48 kB gzip) auf jede Route, die sie benutzt. Ein Seitenkopf, der beim
 * Laden schon im Sichtbereich steht, gewinnt dadurch nichts (AGENTS.md,
 * Abschnitt Design-System).
 */
export function PageHeader({
  title,
  lead,
  eyebrow,
  children,
  width = 'page',
  space = 'lg',
  tone = 'muted',
  bordered = true,
  className,
}: PageHeaderProps): React.ReactElement {
  return (
    <Section space={space} tone={tone} bordered={bordered} className={className}>
      <Container width={width} className="grid gap-5">
        {eyebrow ? <p className="text-primary text-eyebrow uppercase">{eyebrow}</p> : null}
        <h1 className="font-display text-title font-semibold text-balance">{title}</h1>
        {lead ? <p className="text-muted-foreground text-lead max-w-narrow">{lead}</p> : null}
        {children}
      </Container>
    </Section>
  )
}

/**
 * Ueberschrift innerhalb einer handgeschriebenen Seite (<h2>).
 *
 * Fuer Sektionen aus der JSON-Liste gibt es das Gegenstueck mit Einblend-
 * Animation unter @/features/sections/components/SectionHeader.
 */
export function PageHeading({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}): React.ReactElement {
  return (
    <h2 className={cn('font-display text-heading text-foreground font-semibold', className)}>
      {children}
    </h2>
  )
}
