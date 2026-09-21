import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/motion/Parallax'
import { cn } from '@/lib/cn'
import type { HeroContent } from '../schema'

type HeroSectionProps = {
  section: HeroContent
}

/**
 * Auftakt der Seite. Traegt die <h1> - deshalb gehoert pro Seite hoechstens
 * eine Hero-Sektion in die Liste (CLAUDE.md §10).
 *
 * Mit `image` wird daraus ein zweispaltiges Layout, ohne bleibt es eine
 * breite Textflaeche. Die Bewegung ist bewusst eine einzige, gestaffelte
 * Einblendung statt vieler kleiner Effekte.
 */
export function HeroSection({ section }: HeroSectionProps): React.ReactElement {
  const centered = section.align === 'center' && !section.image

  return (
    <Section
      id={section.id}
      space={section.space ?? 'lg'}
      tone={section.tone ?? 'muted'}
      bordered={section.bordered ?? true}
    >
      <Container
        className={cn(
          'grid items-center gap-[var(--block-gap)]',
          section.image && 'md:grid-cols-2 md:gap-12',
        )}
      >
        <div
          className={cn(
            'grid gap-5',
            centered && 'max-w-narrow mx-auto justify-items-center text-center',
          )}
        >
          {section.eyebrow ? (
            <Reveal from="none">
              <p className="text-primary text-eyebrow uppercase">{section.eyebrow}</p>
            </Reveal>
          ) : null}

          <Reveal delay={0.05}>
            <h1 className="font-display text-display font-semibold text-balance">
              {section.title}
            </h1>
          </Reveal>

          {section.subtitle ? (
            <Reveal delay={0.12}>
              <p className="text-muted-foreground text-lead max-w-narrow">{section.subtitle}</p>
            </Reveal>
          ) : null}

          {section.primaryCta || section.secondaryCta ? (
            <Reveal delay={0.18} className="mt-2">
              <div className={cn('flex flex-wrap gap-3', centered && 'justify-center')}>
                {section.primaryCta ? (
                  <ButtonLink href={section.primaryCta.href}>{section.primaryCta.label}</ButtonLink>
                ) : null}
                {section.secondaryCta ? (
                  <ButtonLink href={section.secondaryCta.href} variant="secondary">
                    {section.secondaryCta.label}
                  </ButtonLink>
                ) : null}
              </div>
            </Reveal>
          ) : null}
        </div>

        {section.image ? (
          <Parallax
            distance={32}
            className="border-border shadow-lifted relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border"
          >
            {/* width/height statt `fill`: der Export laeuft mit
                images.unoptimized, es gibt also kein srcset zu waehlen.
                Die echten Masse verhindern trotzdem Layout-Shift (CLS).
                priority, weil das Hero-Bild fast immer das LCP-Element ist. */}
            <Image
              src={section.image.src}
              alt={section.image.alt}
              width={section.image.width}
              height={section.image.height}
              priority
              className="h-full w-full object-cover"
            />
          </Parallax>
        ) : null}
      </Container>
    </Section>
  )
}
