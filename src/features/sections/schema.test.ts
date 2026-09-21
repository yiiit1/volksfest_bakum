import { describe, it, expect } from 'vitest'
import home from '@/content/home.json'
import { parseSections } from './schema'

describe('parseSections', () => {
  it('akzeptiert die Sektionen der Startseite', () => {
    // Haelt Schema und ausgeliefertes Content-JSON zusammen: wer eine Sektion
    // umbaut, ohne home.json nachzuziehen, merkt es hier statt im Build.
    expect(() => parseSections(home.sections, 'content/home.json')).not.toThrow()
  })

  it('nennt Datei und Pfad, wenn ein Pflichtfeld fehlt', () => {
    const broken = [{ type: 'hero' }]

    expect(() => parseSections(broken, 'content/test.json')).toThrow(/content\/test\.json/)
    expect(() => parseSections(broken, 'content/test.json')).toThrow(/sections\.0\.title/)
  })

  it('lehnt eine unbekannte Sektionsart ab', () => {
    const broken = [{ type: 'karussell', title: 'Lorem' }]

    expect(() => parseSections(broken, 'content/test.json')).toThrow()
  })

  it('faellt nicht auf eine Bildangabe ohne Masse herein', () => {
    // Ohne width/height gaebe es Layout-Shift (CLAUDE.md §10, CLS).
    const broken = [
      {
        type: 'gallery',
        images: [{ src: '/bild.webp', alt: 'Beschreibung' }],
      },
    ]

    expect(() => parseSections(broken, 'content/test.json')).toThrow(/width/)
  })

  it('gibt die geprueften Sektionen in der Reihenfolge des JSON zurueck', () => {
    const sections = parseSections(home.sections, 'content/home.json')

    expect(sections[0]?.type).toBe('hero')
    expect(sections.at(-1)?.type).toBe('cta')
  })
})
