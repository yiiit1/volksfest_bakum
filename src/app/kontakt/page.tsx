import type { Metadata } from 'next'
import kontakt from '@/content/kontakt.json'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { PageHeader, PageHeading } from '@/components/ui/PageHeader'
import { ContactForm } from '@/features/contact/components/ContactForm'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenancePage } from '@/features/maintenance/components/MaintenancePage'

// Im Wartungsmodus kein eigener Titel - dann gilt der Default aus dem Layout.
export const metadata: Metadata = MAINTENANCE_MODE
  ? {
      // Waehrend der Wartung zeigt diese Route denselben Inhalt wie die
      // Startseite. Der Canonical buendelt die Duplikate dort.
      alternates: { canonical: '/' },
    }
  : {
      title: kontakt.meta.title,
      description: kontakt.meta.description,
      alternates: { canonical: '/kontakt' },
    }

export default function KontaktPage(): React.ReactElement {
  if (MAINTENANCE_MODE) return <MaintenancePage />

  return (
    <>
      <PageHeader title={kontakt.hero.title} lead={kontakt.hero.lead} />

      <Section space="md">
        <Container className="grid gap-[var(--block-gap)] md:grid-cols-[1.2fr_1fr] md:gap-12">
          <ContactForm />
          <aside className="grid gap-6 self-start">
            <div className="grid gap-2">
              <PageHeading>{kontakt.address.label}</PageHeading>
              <address className="text-muted-foreground not-italic">
                {kontakt.address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  )
}
