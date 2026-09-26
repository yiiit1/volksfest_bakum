import type { Metadata } from 'next'
import { PageTitle } from '@/components/ui/PageTitle'
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
    // Rechtstexte in schmaler Spalte: volle Blattbreite liest niemand.
    <div className="max-w-narrow">
      <PageTitle>{impressum.title}</PageTitle>
      <LegalContent blocks={blocks} variant="site" />
    </div>
  )
}
