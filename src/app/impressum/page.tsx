import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { LegalContent, type LegalBlock } from '@/components/LegalContent'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenanceLegalPage } from '@/features/maintenance/components/MaintenanceLegalPage'
import impressum from '@/content/impressum.json'

const blocks = impressum.blocks as LegalBlock[]

export const metadata: Metadata = {
  title: impressum.meta.title,
  description: impressum.meta.description,
  alternates: { canonical: '/impressum' },
}

export default function ImpressumPage(): React.ReactElement {
  // Waehrend der Wartung erreichbar (Paragraph 5 DDG), aber im Wartungs-Design.
  if (MAINTENANCE_MODE) {
    return <MaintenanceLegalPage title={impressum.title} blocks={blocks} />
  }

  return (
    // Rechtstexte im schmalen Container: 72rem Zeilenlaenge liest niemand.
    <Section space="md">
      <Container width="narrow">
        <h1 className="font-display text-title text-foreground font-semibold text-balance">
          {impressum.title}
        </h1>
        <LegalContent blocks={blocks} variant="site" />
      </Container>
    </Section>
  )
}
