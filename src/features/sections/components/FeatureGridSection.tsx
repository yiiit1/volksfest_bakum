import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Stagger } from '@/components/motion/Stagger'
import { SectionHeader } from './SectionHeader'
import type { FeatureGridContent } from '../schema'

/** Spaltenzahl als feste Klassen - Tailwind kann keine zusammengesetzten Namen erkennen. */
const columnClasses: Record<2 | 3 | 4, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

type FeatureGridSectionProps = {
  section: FeatureGridContent
}

/**
 * Leistungen, Schwerpunkte, Ablaufschritte - kurze Karten in einem Raster.
 *
 * Die Karten stehen als <article> mit <h3>: sie haengen unter der <h2> der
 * Sektion und behalten damit eine saubere Rangfolge. Ohne Sektionstitel
 * waere <h3> ein Sprung - dann bekommt die Sektion besser einen `title`.
 */
export function FeatureGridSection({ section }: FeatureGridSectionProps): React.ReactElement {
  const columns = section.columns ?? 3

  return (
    <Section id={section.id} space={section.space} tone={section.tone} bordered={section.bordered}>
      <Container className="grid gap-[var(--block-gap)]">
        <SectionHeader title={section.title} lead={section.lead} />

        <Stagger className={`grid gap-8 ${columnClasses[columns]}`}>
          {section.items.map((item) => (
            <article key={item.title} className="grid content-start gap-2">
              <h3 className="font-display text-heading font-semibold">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </article>
          ))}
        </Stagger>
      </Container>
    </Section>
  )
}
