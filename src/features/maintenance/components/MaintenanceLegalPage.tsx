import Link from 'next/link'
import content from '@/content/wartung.json'
import { MaintenanceShell } from './MaintenanceShell'
import { LegalContent, type LegalBlock } from '@/components/LegalContent'

type MaintenanceLegalPageProps = {
  title: string
  blocks: LegalBlock[]
}

/**
 * Impressum / Datenschutz im Wartungs-Design.
 *
 * Waehrend der Wartung muessen diese Seiten erreichbar bleiben (Paragraph 5
 * DDG, Art. 13 DSGVO), sollen aber nicht die noch unfertige Website zeigen.
 */
export function MaintenanceLegalPage({
  title,
  blocks,
}: MaintenanceLegalPageProps): React.ReactElement {
  return (
    <MaintenanceShell wide>
      <h1 className="font-display text-foreground text-heading mb-6 font-semibold text-pretty">
        {title}
      </h1>

      <LegalContent blocks={blocks} variant="wartung" />

      <Link
        href="/"
        className="text-primary mt-8 inline-flex items-center gap-3 font-medium hover:underline"
      >
        <span aria-hidden="true">&larr;</span>
        {content.legal.back}
      </Link>
    </MaintenanceShell>
  )
}
