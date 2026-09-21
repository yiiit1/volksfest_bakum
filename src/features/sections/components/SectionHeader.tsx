import { cn } from '@/lib/cn'
import { Reveal } from '@/components/motion/Reveal'

type SectionHeaderProps = {
  title?: string
  lead?: string
  eyebrow?: string
  align?: 'start' | 'center'
  className?: string
}

/**
 * Kopf einer Sektion: Ueberschrift und Vorspann.
 *
 * Ueberschriftsebene ist fest <h2> - die <h1> gehoert der Hero-Sektion bzw.
 * der Seite selbst (CLAUDE.md §10: eine H1 pro Seite).
 *
 * Gibt null zurueck, wenn nichts zu zeigen ist: Titel und Vorspann sind in
 * den meisten Sektionen optional.
 */
export function SectionHeader({
  title,
  lead,
  eyebrow,
  align = 'start',
  className,
}: SectionHeaderProps): React.ReactElement | null {
  if (!title && !lead && !eyebrow) return null

  return (
    <Reveal
      className={cn(
        'grid gap-3',
        align === 'center' ? 'max-w-narrow mx-auto justify-items-center text-center' : '',
        className,
      )}
    >
      {eyebrow ? <p className="text-primary text-eyebrow uppercase">{eyebrow}</p> : null}
      {title ? (
        <h2 className="font-display text-title font-semibold text-balance">{title}</h2>
      ) : null}
      {lead ? <p className="text-muted-foreground text-lead max-w-narrow">{lead}</p> : null}
    </Reveal>
  )
}
