import { describe, expect, it } from 'vitest'
import { escapeHtml, escapeHtmlWithBreaks, singleLine } from './html'

describe('escapeHtml', () => {
  it('entschaerft HTML-Sonderzeichen', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
    )
  })

  it('escaped das kaufmaennische Und nur einmal', () => {
    expect(escapeHtml('Meier & Söhne')).toBe('Meier &amp; Söhne')
    expect(escapeHtml('&lt;')).toBe('&amp;lt;')
  })

  it('laesst harmlosen Text unveraendert', () => {
    expect(escapeHtml('Guten Tag, ich hätte eine Frage.')).toBe('Guten Tag, ich hätte eine Frage.')
  })
})

describe('escapeHtmlWithBreaks', () => {
  it('wandelt Zeilenumbrueche in <br /> um', () => {
    expect(escapeHtmlWithBreaks('Zeile 1\r\nZeile 2\nZeile 3')).toBe(
      'Zeile 1<br />Zeile 2<br />Zeile 3',
    )
  })

  it('escaped trotzdem', () => {
    expect(escapeHtmlWithBreaks('<b>\nx')).toBe('&lt;b&gt;<br />x')
  })
})

describe('singleLine', () => {
  it('faltet Umbrueche zu Leerzeichen', () => {
    expect(singleLine('Betreff\nBcc: opfer@example.com')).toBe('Betreff Bcc: opfer@example.com')
  })
})
