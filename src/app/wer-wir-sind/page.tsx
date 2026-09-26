import type { Metadata } from 'next'
import vorstand from '@/content/vorstand.json'
import common from '@/content/common.json'
import { PageTitle, Lead } from '@/components/ui/PageTitle'
import { Placeholder } from '@/components/ui/Placeholder'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenancePage } from '@/features/maintenance/components/MaintenancePage'

export const metadata: Metadata = MAINTENANCE_MODE
  ? { alternates: { canonical: '/' } }
  : {
      title: vorstand.meta.title,
      description: vorstand.meta.description,
      alternates: { canonical: '/wer-wir-sind' },
    }

/** Register "Wer wir sind": der Vorstand mit Porträt, Aufgabe und Kontakt. */
export default function WerWirSindPage(): React.ReactElement {
  if (MAINTENANCE_MODE) return <MaintenancePage />

  return (
    <>
      <PageTitle>{vorstand.title}</PageTitle>
      <Lead>{vorstand.lead}</Lead>
      <div className="border-rule ordner:grid-cols-2 mt-9 grid gap-x-12 border-t">
        {vorstand.people.map((person) => (
          <article
            key={person.name}
            className="border-rule grid grid-cols-[88px_1fr] gap-4 border-b py-7 sm:grid-cols-[120px_1fr] sm:gap-6"
          >
            <Placeholder
              icon="user"
              label={`${common.placeholder.portrait}: ${person.name}`}
              showLabel={false}
              className="aspect-[4/5]"
            />
            <div>
              <h2 className="text-heading mb-1.5 font-bold">{person.name}</h2>
              <p className="text-register-2 mb-2 text-base font-bold">{person.role}</p>
              <p className="text-ink-soft mb-2 text-[17px]">{person.text}</p>
              <a href={`mailto:${person.email}`} className="text-white underline">
                {person.email}
              </a>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
