import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('skips falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })

  // Ohne die erweiterte Konfiguration in cn.ts haelt tailwind-merge die
  // eigenen Schriftgroessen-Tokens fuer Farben und wirft sie gegen
  // text-foreground raus - lautlos, mit gruenem Build.
  it('behaelt die eigenen Schriftgroessen-Tokens neben einer Textfarbe', () => {
    expect(cn('text-heading', 'text-foreground')).toBe('text-heading text-foreground')
    expect(cn('text-title', 'text-muted-foreground')).toBe('text-title text-muted-foreground')
  })

  it('laesst zwei Schriftgroessen-Tokens gegeneinander gewinnen', () => {
    expect(cn('text-title', 'text-heading')).toBe('text-heading')
    expect(cn('text-lg', 'text-lead')).toBe('text-lead')
  })

  it('loest Container-Breiten und Schatten gegeneinander auf', () => {
    expect(cn('max-w-binder', 'max-w-narrow')).toBe('max-w-narrow')
    expect(cn('shadow-page', 'shadow-leaf')).toBe('shadow-leaf')
  })

  it('behaelt die Blatt-Ueberschrift neben der Schriftfarbe', () => {
    expect(cn('text-section', 'text-white')).toBe('text-section text-white')
  })
})
