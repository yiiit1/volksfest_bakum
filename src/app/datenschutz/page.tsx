import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { LegalContent, type LegalBlock } from '@/components/LegalContent'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenanceLegalPage } from '@/features/maintenance/components/MaintenanceLegalPage'
import datenschutz from '@/content/datenschutz.json'

const blocks = datenschutz.blocks as LegalBlock[]

export const metadata: Metadata = {
  title: datenschutz.meta.title,
  description: datenschutz.meta.description,
  alternates: { canonical: '/datenschutz' },
}

export default function DatenschutzPage(): React.ReactElement {
  // Waehrend der Wartung erreichbar (Art. 13 DSGVO), aber im Wartungs-Design.
  if (MAINTENANCE_MODE) {
    return <MaintenanceLegalPage title={datenschutz.title} blocks={blocks} />
  }

  return (
    // Rechtstexte im schmalen Container: 72rem Zeilenlaenge liest niemand.
    <Section space="md">
      <Container width="narrow">
        <h1 className="font-display text-title text-foreground font-semibold text-balance">
          {datenschutz.title}
        </h1>
        <LegalContent blocks={blocks} variant="site" />
      </Container>
    </Section>
  )
}
