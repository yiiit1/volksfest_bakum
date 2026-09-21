import type { SectionContent } from '../schema'
import { HeroSection } from './HeroSection'
import { SplitSection } from './SplitSection'
import { FeatureGridSection } from './FeatureGridSection'
import { GallerySection } from './GallerySection'
import { QuoteSection } from './QuoteSection'
import { CtaSection } from './CtaSection'

type SectionListProps = {
  sections: SectionContent[]
}

/**
 * Rendert die Abschnittsliste einer Seite in der Reihenfolge, in der sie im
 * JSON steht.
 *
 * Der `switch` ist erschoepfend: `never` am Ende sorgt dafuer, dass eine neue
 * Sektionsart im Schema sofort einen Typfehler erzeugt, solange sie hier
 * fehlt. Eine Registry als Objekt (`{ hero: HeroSection, … }`) waere kuerzer,
 * koennte die Props aber nicht je Variante typisieren.
 *
 * Server Component. Die Bewegung steckt in den einzelnen Sektionen, dort
 * jeweils in einer eigenen Client-Komponente.
 */
export function SectionList({ sections }: SectionListProps): React.ReactElement {
  return (
    <>
      {sections.map((section, index) => {
        // Der Index als Schluessel ist hier unbedenklich: die Liste ist zur
        // Build-Zeit fest, es wird nichts umsortiert oder eingefuegt.
        const key = section.id ?? `${section.type}-${index}`

        switch (section.type) {
          case 'hero':
            return <HeroSection key={key} section={section} />
          case 'split':
            return <SplitSection key={key} section={section} />
          case 'feature-grid':
            return <FeatureGridSection key={key} section={section} />
          case 'gallery':
            return <GallerySection key={key} section={section} />
          case 'quote':
            return <QuoteSection key={key} section={section} />
          case 'cta':
            return <CtaSection key={key} section={section} />
          default: {
            const _exhaustive: never = section
            return _exhaustive
          }
        }
      })}
    </>
  )
}
