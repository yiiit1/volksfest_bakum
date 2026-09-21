import content from '@/content/wartung.json'
import { MaintenanceShell } from './MaintenanceShell'

/**
 * Wartungsseite.
 *
 * Wird von jeder Route gerendert, solange MAINTENANCE_MODE === true ist -
 * ausgenommen Impressum und Datenschutz (siehe MaintenanceLegalPage).
 */
export function MaintenancePage(): React.ReactElement {
  const { hero, contact, signature } = content

  return (
    <MaintenanceShell signature={signature}>
      <h1 className="font-display text-foreground text-heading mb-4 font-semibold text-pretty">
        {hero.title}
      </h1>

      <p className="text-muted-foreground text-lead mb-8 text-pretty">{hero.lead}</p>

      <ul className="flex flex-col gap-3">
        {contact.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="text-primary text-lead inline-flex items-center gap-3 font-medium hover:underline"
            >
              <span aria-hidden="true">&rarr;</span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </MaintenanceShell>
  )
}
