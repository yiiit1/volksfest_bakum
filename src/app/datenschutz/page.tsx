import type { Metadata } from 'next'
import { PageTitle } from '@/components/ui/PageTitle'
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
    // Rechtstexte in schmaler Spalte: volle Blattbreite liest niemand.
    <div className="max-w-narrow">
      <PageTitle>{datenschutz.title}</PageTitle>
      <LegalContent blocks={blocks} variant="site" />
    </div>
  )
}
