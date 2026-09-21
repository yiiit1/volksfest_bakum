import Link from 'next/link'
import content from '@/content/wartung.json'
import { CurrentYear } from '@/components/CurrentYear'

type MaintenanceShellProps = {
  /** Inhalt der Karte. */
  children: React.ReactNode
  /** Optionale Zeile unter der Karte (nur auf der Wartungsseite selbst). */
  signature?: string
  /** Breitere Karte fuer Fliesstext wie Impressum / Datenschutz. */
  wide?: boolean
}

/**
 * Gemeinsame Huelle des Wartungs-Designs: zentrierte Karte auf ruhigem Grund,
 * darunter ein schmaler Footer mit den Pflichtlinks.
 *
 * Wird von der Wartungsseite und von den waehrend der Wartung erreichbaren
 * Rechtstexten genutzt, damit beide dieselbe Gestaltung teilen.
 *
 * Bewusst nur mit den Design-Tokens aus globals.css gebaut: pro Kundenprojekt
 * traegt die Wartungsseite dadurch automatisch die Projektfarben. Wer ein
 * eigenstaendiges Wartungs-Design will, ersetzt diese Datei - MaintenancePage
 * und MaintenanceLegalPage bleiben unveraendert.
 */
export function MaintenanceShell({
  children,
  signature,
  wide = false,
}: MaintenanceShellProps): React.ReactElement {
  const { footer } = content

  return (
    <div className="bg-muted/40 flex min-h-screen flex-1 flex-col">
      {/* id + tabIndex: Ziel des Sprunglinks aus dem Root-Layout. */}
      <main
        id="inhalt"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-4 py-[var(--section-space-md)] sm:px-6"
      >
        <div
          className={`flex w-full flex-col items-center gap-8 ${wide ? 'max-w-narrow' : 'max-w-card'}`}
        >
          <div className="border-border bg-background w-full rounded-[var(--radius-xl)] border px-6 py-10 shadow-sm sm:px-10 sm:py-12">
            {children}
          </div>

          {signature && <p className="text-muted-foreground text-center text-sm">{signature}</p>}
        </div>
      </main>

      <footer className="border-border text-muted-foreground flex flex-none flex-wrap justify-center gap-x-6 gap-y-2 border-t px-6 py-6 text-sm">
        <span>
          &copy; {footer.copyright} <CurrentYear buildYear={new Date().getFullYear()} />
        </span>
        {footer.links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-foreground">
            {link.label}
          </Link>
        ))}
      </footer>
    </div>
  )
}
