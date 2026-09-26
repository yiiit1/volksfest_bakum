import Link from 'next/link'
import common from '@/content/common.json'
import { cn } from '@/lib/cn'
import { REGISTERS } from '@/components/binder/registers'

/**
 * Farbe der Oberkante je Reiter: Start weiss, dann die vier Stufen der
 * Logo-Linie. Als CSS-Variable, damit Tailwind die Klasse statisch sieht.
 */
const TAB_COLOR: Record<string, string> = {
  start: 'var(--color-ink)',
  verein: 'var(--color-register-1)',
  vorstand: 'var(--color-register-2)',
  antrag: 'var(--color-register-3)',
  kontakt: 'var(--color-register-4)',
}

/**
 * Die Registerreiter des Ordners - Julians "Hauptseite mit vier Reitern".
 *
 * Echte Links auf echte Seiten (CLAUDE.md §6: keine Hash-Routen), der
 * aktive Reiter traegt aria-current. Auf schmalen Bildschirmen kleben die
 * Reiter oben und zeigen die Kurzform ("Vorstand", "Antrag") - ein
 * Aufklappmenue braucht es dadurch nicht.
 */
export function Navigation({ activeKey }: { activeKey: string | null }): React.ReactElement {
  return (
    <nav
      aria-label={common.a11y.registerNav}
      // min-h: gleiche Hoehe auch ohne aktiven (hoeheren) Reiter, z. B. im
      // Impressum - sonst rutscht das Blatt dort um 4 px nach oben.
      className="bg-desk ordner:min-h-[58px] ordner:static ordner:gap-1.5 ordner:bg-transparent ordner:pt-0 ordner:pr-0 ordner:pl-7 sticky top-0 z-10 flex min-h-14 items-end gap-1 px-2 pt-2.5"
    >
      {REGISTERS.map((register) => {
        const active = register.key === activeKey
        return (
          <Link
            key={register.key}
            href={register.href}
            aria-current={active ? 'page' : undefined}
            style={{ '--tab': TAB_COLOR[register.key] } as React.CSSProperties}
            className={cn(
              'flex flex-1 items-center justify-center rounded-t-lg px-1 pt-4 pb-[13px] text-[15px] leading-none font-semibold text-white no-underline shadow-[inset_0_4px_0_var(--tab)] transition-[background-color,padding] duration-200',
              'ordner:flex-none ordner:rounded-t-[10px] ordner:px-6 ordner:pt-5 ordner:pb-[17px] ordner:text-[17px]',
              active ? 'bg-page ordner:pt-6 pt-[18px] font-extrabold' : 'bg-tab hover:bg-page-2',
            )}
          >
            <span className="ordner:inline hidden">{register.label}</span>
            <span className="ordner:hidden">{register.short}</span>
          </Link>
        )
      })}
    </nav>
  )
}
