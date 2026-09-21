import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/motion/Parallax'
import { cn } from '@/lib/cn'
import type { SplitContent } from '../schema'

type SplitSectionProps = {
  section: SplitContent
}

/**
 * Text und Bild nebeneinander. Die Arbeitspferd-Sektion fuer alles
 * Erzaehlende.
 *
 * `mediaSide: 'left'` dreht die Spalten nur optisch um (order-Klassen) - im
 * Quelltext bleibt der Text vorn. Das ist fuer Screenreader und die
 * Tab-Reihenfolge die richtige Reihenfolge, unabhaengig vom Layout.
 * Auf schmalen Bildschirmen steht das Bild deshalb immer unter dem Text.
 */
export function SplitSection({ section }: SplitSectionProps): React.ReactElement {
  const mediaLeft = section.mediaSide === 'left'

  return (
    <Section id={section.id} space={section.space} tone={section.tone} bordered={section.bordered}>
      <Container className="grid items-center gap-[var(--block-gap)] md:grid-cols-2 md:gap-12">
        <div className={cn('grid gap-4', mediaLeft && 'md:order-2')}>
          {section.eyebrow ? (
            <Reveal from="none">
              <p className="text-primary text-eyebrow uppercase">{section.eyebrow}</p>
            </Reveal>
          ) : null}

          <Reveal>
            <h2 className="font-display text-title font-semibold text-balance">{section.title}</h2>
          </Reveal>

          <Reveal delay={0.08} className="text-muted-foreground grid gap-4 leading-relaxed">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>

          {section.cta ? (
            <Reveal delay={0.14} className="mt-2">
              <ButtonLink href={section.cta.href}>{section.cta.label}</ButtonLink>
            </Reveal>
          ) : null}
        </div>

        <Parallax
          className={cn(
            'border-border shadow-soft aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border',
            mediaLeft && 'md:order-1',
          )}
        >
          <Image
            src={section.image.src}
            alt={section.image.alt}
            width={section.image.width}
            height={section.image.height}
            className="h-full w-full object-cover"
          />
        </Parallax>
      </Container>
    </Section>
  )
}
