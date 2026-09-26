import common from '@/content/common.json'

export type Register = (typeof common.registers)[number]

export const REGISTERS: readonly Register[] = common.registers

/**
 * Welches Register gehoert zu diesem Pfad? Unterseiten ohne eigenen Reiter
 * (Impressum, Datenschutz, 404) liefern null - das Blatt bleibt dann weiss
 * gerandet und kein Reiter ist aktiv.
 */
export function registerFor(pathname: string): Register | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  return REGISTERS.find((register) => register.href === path) ?? null
}
