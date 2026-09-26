import type { Metadata } from 'next'
import verein from '@/content/verein.json'
import { PageTitle, Lead } from '@/components/ui/PageTitle'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenancePage } from '@/features/maintenance/components/MaintenancePage'

export const metadata: Metadata = MAINTENANCE_MODE
  ? { alternates: { canonical: '/' } }
  : {
      title: verein.meta.title,
      description: verein.meta.description,
      alternates: { canonical: '/verein' },
    }

/** Register "Verein": Einleitung links, Eckpunkte als Liste rechts. */
export default function VereinPage(): React.ReactElement {
  if (MAINTENANCE_MODE) return <MaintenancePage />

  return (
    <div className="ordner:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] grid gap-[clamp(2rem,5vw,4.5rem)]">
      <div>
        <PageTitle>{verein.title}</PageTitle>
        <Lead>{verein.lead}</Lead>
        <p className="text-ink-soft max-w-[64ch]">{verein.body}</p>
      </div>
      <dl className="border-rule border-t">
        {verein.facts.map((fact) => (
          <div
            key={fact.term}
            className="border-rule grid gap-1 border-b py-5 sm:grid-cols-[minmax(140px,1fr)_2fr] sm:gap-6"
          >
            <dt className="font-bold">{fact.term}</dt>
            <dd className="text-ink-soft">{fact.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
