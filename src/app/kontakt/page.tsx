import type { Metadata } from 'next'
import kontakt from '@/content/kontakt.json'
import { PageTitle, Lead } from '@/components/ui/PageTitle'
import { Icon, type IconName } from '@/components/ui/Icon'
import { ContactForm } from '@/features/contact/components/ContactForm'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenancePage } from '@/features/maintenance/components/MaintenancePage'

export const metadata: Metadata = MAINTENANCE_MODE
  ? { alternates: { canonical: '/' } }
  : {
      title: kontakt.meta.title,
      description: kontakt.meta.description,
      alternates: { canonical: '/kontakt' },
    }

/** Register "Kontakt": Anschrift und Wege links, Kontaktformular rechts. */
export default function KontaktPage(): React.ReactElement {
  if (MAINTENANCE_MODE) return <MaintenancePage />

  return (
    <div className="ordner:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] grid gap-[clamp(2rem,5vw,4.5rem)]">
      <div>
        <PageTitle>{kontakt.title}</PageTitle>
        <Lead>{kontakt.lead}</Lead>
        <ul className="border-rule mt-6 border-t">
          {kontakt.rows.map((row) => (
            <li
              key={row.label}
              className="border-rule grid grid-cols-[24px_1fr] items-baseline gap-x-4 gap-y-1 border-b py-5 sm:grid-cols-[24px_140px_1fr]"
            >
              <Icon name={row.icon as IconName} className="text-register-4 self-center" />
              <span className="font-bold">{row.label}</span>
              <div className="col-start-2 sm:col-start-auto">
                {'href' in row && row.href ? (
                  <a href={row.href} className="text-white underline">
                    {row.text}
                  </a>
                ) : (
                  row.text
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-page-2 self-start rounded-lg p-[clamp(1.375rem,3.5vw,2.25rem)]">
        <ContactForm />
      </div>
    </div>
  )
}
