import type { Metadata } from 'next'
import about from '@/content/about.json'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { PageHeader, PageHeading } from '@/components/ui/PageHeader'
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
      title: about.meta.title,
      description: about.meta.description,
      alternates: { canonical: '/about' },
    }

/**
 * Bewusst handgeschriebenes JSX statt Sektionsliste (siehe
 * @/features/sections/schema): die Liste ist eine Abkuerzung fuer Seiten, die
 * sich aus Standardbloecken zusammensetzen - wo eine Seite eine eigene Form
 * hat, wird sie direkt gebaut. Beides darf im selben Projekt nebeneinander
 * stehen.
 *
 * Auch die freie Seite benutzt aber die Bausteine aus components/ui und die
 * Tokens aus globals.css: `Section` fuer den Rhythmus, `Container` fuer die
 * Breite, `text-title`/`text-heading` fuer die Groessen. Feste Werte wie
 * `py-20` oder `text-4xl` waeren hier ein Fehler - sie wuerden beim
 * naechsten Kundenprojekt nicht mitwandern (AGENTS.md, Design-System).
 */
export default function AboutPage(): React.ReactElement {
  if (MAINTENANCE_MODE) return <MaintenancePage />

  return (
    <>
      <PageHeader title={about.hero.title} lead={about.hero.lead} />

      <Section space="md">
        <Container className="grid gap-[var(--block-gap)] md:grid-cols-2">
          {about.sections.map((section) => (
            <article key={section.title} className="grid gap-3">
              <PageHeading>{section.title}</PageHeading>
              <p className="text-muted-foreground leading-relaxed">{section.body}</p>
            </article>
          ))}
        </Container>
      </Section>
    </>
  )
}
