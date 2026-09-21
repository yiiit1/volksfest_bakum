import { cn } from '@/lib/cn'
import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Breiten aus den Design-Tokens (`--container-*` in globals.css). Tailwind v4
 * erzeugt daraus die `max-w-*`-Klassen. Wer die Seite insgesamt schmaler oder
 * breiter haben will, aendert den Token - nicht diese Datei.
 *
 *   card    einzelne Karte auf leerem Grund - 404, Fehlerseite (34rem)
 *   narrow  Fliesstext, Impressum, Formulare (42rem)
 *   page    Standard fuer Sektionen (72rem, entspricht dem alten max-w-6xl)
 *   wide    grosse Bildstrecken und Galerien (88rem)
 *   full    kein Limit - der Rand kommt trotzdem noch vom Padding
 */
export type ContainerWidth = 'card' | 'narrow' | 'page' | 'wide' | 'full'

const widths: Record<ContainerWidth, string> = {
  card: 'max-w-card',
  narrow: 'max-w-narrow',
  page: 'max-w-page',
  wide: 'max-w-wide',
  full: 'max-w-none',
}

type ContainerProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  as?: 'div' | 'section' | 'main' | 'article' | 'nav' | 'header' | 'footer'
  width?: ContainerWidth
}

export function Container({
  children,
  className,
  as: Tag = 'div',
  width = 'page',
  ...rest
}: ContainerProps): React.ReactElement {
  return (
    <Tag className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widths[width], className)} {...rest}>
      {children}
    </Tag>
  )
}
