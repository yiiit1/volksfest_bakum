import type { Metadata } from 'next'
import home from '@/content/home.json'
import { parseSections } from '@/features/sections/schema'
import { SectionList } from '@/features/sections/components/SectionList'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenancePage } from '@/features/maintenance/components/MaintenancePage'

// `title.absolute` gewinnt in Next.js immer gegen die Layout-Vorlage. Im
// Wartungsmodus muss der Titel daher hier zurueckgenommen werden, sonst zeigt
// der Browser-Tab auf "/" weiterhin den Startseiten-Titel. Bei
// MAINTENANCE_MODE === false gilt unveraendert die urspruengliche Metadata.
export const metadata: Metadata = MAINTENANCE_MODE
  ? { alternates: { canonical: '/' } }
  : {
      title: { absolute: home.meta.title },
      description: home.meta.description,
      alternates: { canonical: '/' },
    }

export default function HomePage(): React.ReactElement {
  if (MAINTENANCE_MODE) return <MaintenancePage />

  // Geprueft wird beim Build, nicht beim Aufruf: diese Server Component
  // laeuft im statischen Export genau einmal, waehrend `next build`. Ein
  // falscher `type` oder eine fehlende Ueberschrift bricht damit den Build
  // ab, statt still eine halbe Seite auszuliefern.
  const sections = parseSections(home.sections, 'content/home.json')

  return <SectionList sections={sections} />
}
