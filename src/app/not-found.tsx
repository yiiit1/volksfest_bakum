import common from '@/content/common.json'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenancePage } from '@/features/maintenance/components/MaintenancePage'

export default function NotFound(): React.ReactElement {
  // Waehrend der Wartung gibt es keine Unterseiten, auf die ein 404 verweisen
  // koennte - unbekannte Pfade landen auf der Wartungsseite.
  if (MAINTENANCE_MODE) return <MaintenancePage />

  return (
    <div className="max-w-card mx-auto flex min-h-[40vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-title text-ink-soft font-extrabold">{common.notFound.code}</p>
      <h1 className="text-heading font-extrabold text-balance">{common.notFound.title}</h1>
      <p className="text-ink-soft text-pretty">{common.notFound.body}</p>
      <ButtonLink href="/">{common.notFound.cta}</ButtonLink>
    </div>
  )
}
