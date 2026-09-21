import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/motion/Reveal'
import type { QuoteContent } from '../schema'

type QuoteSectionProps = {
  section: QuoteContent
}

/**
 * Zitat oder Kundenstimme - der ruhige Moment zwischen zwei dichten
 * Abschnitten.
 *
 * <blockquote> + <figcaption> statt Absatz mit Anfuehrungszeichen: nur so
 * versteht ein Screenreader, dass hier jemand anderes spricht. Die
 * Anfuehrungszeichen selbst stehen im Text und nicht als CSS-Dekoration,
 * damit sie beim Kopieren mitgehen.
 */
export function QuoteSection({ section }: QuoteSectionProps): React.ReactElement {
  return (
    <Section
      id={section.id}
      space={section.space}
      tone={section.tone ?? 'muted'}
      bordered={section.bordered}
    >
      <Container width="narrow">
        <Reveal>
          <figure className="border-primary grid gap-5 border-l-[length:var(--line-accent)] pl-6 md:pl-10">
            <blockquote className="font-display text-quote text-balance">
              „{section.quote}“
            </blockquote>
            {section.author ? (
              <figcaption className="text-muted-foreground text-sm">
                <span className="text-foreground font-medium">{section.author}</span>
                {section.role ? <span> · {section.role}</span> : null}
              </figcaption>
            ) : null}
          </figure>
        </Reveal>
      </Container>
    </Section>
  )
}
