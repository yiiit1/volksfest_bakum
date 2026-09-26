'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Navigation } from '@/components/Navigation'
import { registerFor } from '@/components/binder/registers'

/**
 * Der Ordner: Registerreiter oben, darunter das aufgeschlagene Blatt.
 *
 * `data-register` setzt die Farbe des offenen Registers (globals.css) - sie
 * faerbt die Oberkante des Blatts und die Linie unter jeder Ueberschrift.
 * Der `key` am Blatt-Inhalt laesst die kurze Umblaetter-Bewegung bei jedem
 * Seitenwechsel neu anlaufen.
 */
export function Binder({ children }: { children: ReactNode }): React.ReactElement {
  const pathname = usePathname()
  const register = registerFor(pathname)

  return (
    <div
      data-register={register?.key ?? 'none'}
      className="max-w-binder ordner:px-6 ordner:pt-10 mx-auto w-full"
    >
      <Navigation activeKey={register?.key ?? null} />

      {/* tabIndex={-1}: Ziel des Sprunglinks aus dem Root-Layout. */}
      <main
        id="inhalt"
        tabIndex={-1}
        className="bg-page shadow-page ordner:rounded-[4px_14px_14px_14px] border-t-[5px] border-[var(--register)] p-[clamp(1.75rem,5vw,4rem)] transition-[border-color] duration-400 ease-(--ease-out-expo) focus:outline-none"
      >
        <div key={pathname} className="motion-safe:animate-turn">
          {children}
        </div>
      </main>
    </div>
  )
}
