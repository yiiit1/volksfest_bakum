import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import start from '@/content/start.json'
import common from '@/content/common.json'
import { REGISTERS } from '@/components/binder/registers'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Icon } from '@/components/ui/Icon'
import { Placeholder } from '@/components/ui/Placeholder'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenancePage } from '@/features/maintenance/components/MaintenancePage'

// `title.absolute` gewinnt immer gegen die Layout-Vorlage - im Wartungsmodus
// deshalb zuruecknehmen, sonst zeigt der Tab weiter den Startseiten-Titel.
export const metadata: Metadata = MAINTENANCE_MODE
  ? { alternates: { canonical: '/' } }
  : {
      title: { absolute: start.meta.title },
      description: start.meta.description,
      alternates: { canonical: '/' },
    }

/** Farbe des Kaestchens vor jedem Inhaltseintrag = Farbe seines Reiters. */
const CHIP: Record<string, string> = {
  verein: 'bg-register-1',
  vorstand: 'bg-register-2',
  antrag: 'bg-register-3',
  kontakt: 'bg-register-4',
}

/** Das Deckblatt des Ordners: Logo gross, Einladung, Inhaltsverzeichnis. */
export default function HomePage(): React.ReactElement {
  if (MAINTENANCE_MODE) return <MaintenancePage />

  const { cover, index } = start

  return (
    <>
      <div className="ordner:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] grid items-center gap-[clamp(2rem,5vw,4.5rem)]">
        <div>
          <Image
            src="/images/logo-weiss.webp"
            alt={common.brand.logoAlt}
            width={1134}
            height={464}
            priority
            className="mb-9 -ml-2.5 h-auto w-[min(540px,100%)]"
          />
          <h1 className="text-title mb-5 font-extrabold text-balance">{cover.title}</h1>
          <p className="text-lead text-ink-soft mb-6 max-w-[64ch]">{cover.lead}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={cover.primary.href}>
              {cover.primary.label} <Icon name="arrow" />
            </ButtonLink>
            <ButtonLink href={cover.secondary.href} variant="quiet">
              {cover.secondary.label}
            </ButtonLink>
          </div>
        </div>
        <Placeholder
          icon="photo"
          label={common.placeholder.photo}
          className="ordner:aspect-[4/5] aspect-[16/10]"
        />
      </div>

      <nav
        aria-labelledby="inhalt-titel"
        className="mt-[clamp(2.5rem,6vw,4.5rem)] border-t-[1.5px] border-white/70"
      >
        <h2 id="inhalt-titel" className="text-heading mt-[18px] mb-1.5 font-extrabold">
          {index.title}
        </h2>
        <ol>
          {index.entries.map((entry) => {
            const register = REGISTERS.find((r) => r.key === entry.key)
            if (!register) return null
            return (
              <li key={entry.key}>
                <Link
                  href={register.href}
                  className="group border-rule ordner:grid-cols-[18px_minmax(160px,1.2fr)_3fr_24px] grid grid-cols-[14px_1fr_20px] items-center gap-[18px] border-b px-1 py-[18px] text-white no-underline transition-colors hover:bg-white/6"
                >
                  <i className={`size-3.5 rounded-[3px] ${CHIP[entry.key]}`} aria-hidden="true" />
                  <b className="font-bold">{register.label}</b>
                  <span className="text-ink-soft ordner:inline hidden text-[17px]">
                    {entry.text}
                  </span>
                  <Icon
                    name="arrow"
                    className="text-ink-soft transition-transform duration-300 ease-(--ease-out-expo) group-hover:translate-x-1"
                  />
                </Link>
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
