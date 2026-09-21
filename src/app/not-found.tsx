import common from '@/content/common.json'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenancePage } from '@/features/maintenance/components/MaintenancePage'

export default function NotFound(): React.ReactElement {
  // Waehrend der Wartung gibt es keine Unterseiten, auf die ein 404 verweisen
  // koennte - unbekannte Pfade landen auf der Wartungsseite.
  if (MAINTENANCE_MODE) return <MaintenancePage />

  return (
    <Section space="lg">
      <Container
        width="card"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center"
      >
        <p className="font-display text-primary text-display font-semibold">
          {common.notFound.code}
        </p>
        <h1 className="font-display text-foreground text-heading font-semibold text-balance">
          {common.notFound.title}
        </h1>
        <p className="text-muted-foreground text-pretty">{common.notFound.body}</p>
        <ButtonLink href="/">{common.notFound.cta}</ButtonLink>
      </Container>
    </Section>
  )
}
