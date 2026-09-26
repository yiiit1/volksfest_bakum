import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

/**
 * Ueberschrift eines Blatts (<h1>, eine pro Seite - CLAUDE.md §10).
 *
 * Darunter die kurze Linie in der Farbe des offenen Registers
 * (`--register`, gesetzt am Ordner). Sie ist das wiederkehrende Zeichen des
 * Entwurfs: jede Seite traegt die Farbe ihres Reiters.
 */
export function PageTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}): React.ReactElement {
  return (
    <h1
      className={cn(
        'text-section mb-5 font-extrabold text-balance text-white',
        "after:mt-[18px] after:block after:h-1 after:w-16 after:rounded-[2px] after:bg-[var(--register)] after:transition-colors after:duration-400 after:content-['']",
        className,
      )}
    >
      {children}
    </h1>
  )
}

/** Vorspann unter der Ueberschrift. */
export function Lead({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}): React.ReactElement {
  return <p className={cn('text-lead text-ink-soft mb-4 max-w-[64ch]', className)}>{children}</p>
}
