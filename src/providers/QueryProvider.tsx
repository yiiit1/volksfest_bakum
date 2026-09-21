'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'

/**
 * TanStack Query - bewusst NICHT im Root-Layout.
 *
 * Vorher hing dieser Provider um jede Seite. Das kostete rund 15 kB auf jedem
 * einzelnen Seitenaufruf, ohne dass irgendwo eine Query lief: eine Website aus
 * statisch exportierten Seiten holt ihre Daten zur Build-Zeit, nicht im
 * Browser. Im statischen Export gibt es ausserdem keinen Server, gegen den
 * eine Query laufen koennte - nur externe APIs und die eigenen Pages
 * Functions unter /api/.
 *
 * Einsetzen, sobald ein Teil der Seite wirklich im Browser Daten nachlaedt -
 * dann so eng wie moeglich um genau diesen Teil:
 *
 *   // src/app/verfuegbarkeit/page.tsx (Server Component)
 *   <QueryProvider>
 *     <Suspense fallback={<Skeleton />}>
 *       <Verfuegbarkeit />   // 'use client', useSuspenseQuery
 *     </Suspense>
 *   </QueryProvider>
 *
 * Die <Suspense>-Grenze ist bei useSuspenseQuery Pflicht (CLAUDE.md §5).
 */
export function QueryProvider({ children }: { children: ReactNode }): React.ReactElement {
  // useState mit Initialisierungsfunktion: der Client wird pro Mount genau
  // einmal erzeugt. Ein Client auf Modulebene wuerde den Cache zwischen
  // Besuchern teilen, sobald das Projekt doch einmal serverseitig rendert.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
