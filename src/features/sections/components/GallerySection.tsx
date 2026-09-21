import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Stagger } from '@/components/motion/Stagger'
import { SectionHeader } from './SectionHeader'
import type { GalleryContent } from '../schema'

const columnClasses: Record<2 | 3, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

type GallerySectionProps = {
  section: GalleryContent
}

/**
 * Bildstrecke. Breiter als der Rest der Seite (`width="wide"`), weil Bilder
 * Flaeche brauchen, um zu wirken.
 *
 * Bewusst ohne Lightbox: die kostet Bundle und Bedienlogik (Fokusfalle,
 * Escape, Wischgesten) und wird in den wenigsten Projekten wirklich
 * gebraucht. Wenn doch, gehoert sie als eigene Client-Komponente hierher.
 */
export function GallerySection({ section }: GallerySectionProps): React.ReactElement {
  const columns = section.columns ?? 3

  return (
    <Section id={section.id} space={section.space} tone={section.tone} bordered={section.bordered}>
      <Container width="wide" className="grid gap-[var(--block-gap)]">
        <SectionHeader title={section.title} lead={section.lead} />

        <Stagger className={`grid gap-4 ${columnClasses[columns]}`}>
          {section.images.map((image) => (
            <figure
              key={image.src}
              className="border-border shadow-soft aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="h-full w-full object-cover"
              />
            </figure>
          ))}
        </Stagger>
      </Container>
    </Section>
  )
}
