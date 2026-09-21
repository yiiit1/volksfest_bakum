import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/motion/Reveal'
import type { CtaContent } from '../schema'

type CtaSectionProps = {
  section: CtaContent
}

/**
 * Schlussband mit Handlungsaufforderung. Standardmaessig `tone="inverted"`,
 * damit es sich klar vom Rest der Seite abhebt.
 *
 * Zur Knopf-Wahl: auf eingefaerbtem Grund ist `variant="primary"` riskant -
 * Primaerfarbe auf Akzentflaeche reisst schnell den Kontrast (CLAUDE.md §12:
 * ≥ 4,5:1). `secondary` bringt seine eigene helle Flaeche mit, `outline`
 * nimmt die Schriftfarbe des Umfelds. Beides bleibt in jedem Ton lesbar.
 */
export function CtaSection({ section }: CtaSectionProps): React.ReactElement {
  return (
    <Section
      id={section.id}
      space={section.space ?? 'lg'}
      tone={section.tone ?? 'inverted'}
      bordered={section.bordered}
    >
      <Container width="narrow" className="grid justify-items-center gap-5 text-center">
        <Reveal>
          <h2 className="font-display text-title font-semibold text-balance">{section.title}</h2>
        </Reveal>

        {section.body ? (
          <Reveal delay={0.08}>
            <p className="text-lead opacity-80">{section.body}</p>
          </Reveal>
        ) : null}

        <Reveal delay={0.14} className="mt-2">
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href={section.primaryCta.href} variant="secondary">
              {section.primaryCta.label}
            </ButtonLink>
            {section.secondaryCta ? (
              <ButtonLink href={section.secondaryCta.href} variant="outline">
                {section.secondaryCta.label}
              </ButtonLink>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
