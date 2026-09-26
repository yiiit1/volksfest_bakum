import type { Metadata } from 'next'
import Image from 'next/image'
import antrag from '@/content/mitgliedsantrag.json'
import { PageTitle, Lead } from '@/components/ui/PageTitle'
import { Icon } from '@/components/ui/Icon'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenancePage } from '@/features/maintenance/components/MaintenancePage'

export const metadata: Metadata = MAINTENANCE_MODE
  ? { alternates: { canonical: '/' } }
  : {
      title: antrag.meta.title,
      description: antrag.meta.description,
      alternates: { canonical: '/mitgliedsantrag' },
    }

/**
 * Register "Mitgliedsantrag": der Antrag als PDF, gezeigt als Blatt, das aus
 * dem Ordner kommt. Kein Online-Formular (Entscheidung 2026-09-23) - der
 * Antrag braucht eine Unterschrift, ggf. auch der Erziehungsberechtigten.
 * Das PDF baut scripts/mitgliedsantrag/make_antrag.py.
 */
export default function MitgliedsantragPage(): React.ReactElement {
  if (MAINTENANCE_MODE) return <MaintenancePage />

  const { document, steps } = antrag

  return (
    <>
      <PageTitle>{antrag.title}</PageTitle>
      <Lead>{antrag.lead}</Lead>
      <div className="ordner:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] mt-3 grid gap-[clamp(2rem,5vw,4rem)]">
        <div className="bg-page-2 grid items-center gap-[clamp(1.5rem,4vw,3rem)] rounded-lg p-[clamp(1.5rem,4vw,2.5rem)] sm:grid-cols-[auto_1fr]">
          <Leaf />
          <div>
            <h2 className="mb-1 text-[26px] leading-tight font-bold">{document.title}</h2>
            <p className="text-ink-soft text-small mb-[22px]">{document.meta}</p>
            <a href={document.href} download={document.filename} className={buttonClasses()}>
              {document.button} <Icon name="download" />
            </a>
          </div>
        </div>
        <aside className="bg-page-2 self-start rounded-lg p-7">
          <h2 className="text-heading mb-1.5 font-bold">{steps.title}</h2>
          <ul>
            {steps.items.map((item) => (
              <li
                key={item}
                className="text-ink-soft grid grid-cols-[22px_1fr] gap-3 py-2.5 text-[17px]"
              >
                <Icon name="check" className="text-register-3 mt-[3px]" />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  )
}

/** Stilisiertes A4-Blatt mit Lochung, Logo und Zeilen - reine Illustration. */
function Leaf(): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      className="shadow-leaf before:bg-page-2 relative grid aspect-[1/1.414] w-28 content-start gap-2 rounded-[3px] bg-white px-3.5 py-4 before:absolute before:top-[22%] before:left-2 before:size-[7px] before:rounded-full before:shadow-[0_70px_0_var(--color-page-2)] before:content-[''] sm:w-[150px]"
    >
      <Image
        src="/images/logo-farbig.webp"
        alt=""
        width={1134}
        height={464}
        className="mb-1.5 ml-2.5 h-auto w-[70%]"
      />
      {Array.from({ length: 7 }, (_, i) => (
        <i
          key={i}
          className="ml-2.5 block h-[5px] rounded-[3px] bg-[#dbe7e2] [&:nth-of-type(2n)]:w-[55%]"
        />
      ))}
    </div>
  )
}
