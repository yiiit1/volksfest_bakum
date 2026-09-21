import { describe, expect, it } from 'vitest'
import { validateContactInput, validateContactRequest } from './schema'

const valid = {
  name: 'Erika Mustermann',
  email: 'erika@example.com',
  message: 'Guten Tag, ich hätte gerne einen Termin.',
  consent: true,
}

describe('validateContactInput', () => {
  it('nimmt eine vollstaendige Eingabe an', () => {
    const result = validateContactInput(valid)
    expect(result.success).toBe(true)
  })

  it('trimmt Name und Nachricht', () => {
    const result = validateContactInput({ ...valid, name: '  Erika Mustermann  ' })
    expect(result.success && result.data.name).toBe('Erika Mustermann')
  })

  it('lehnt eine Eingabe ohne Einwilligung ab', () => {
    const result = validateContactInput({ ...valid, consent: false })
    expect(result.success).toBe(false)
    expect(result.success === false && result.fieldErrors.consent).toBeDefined()
  })

  it('lehnt eine ungueltige E-Mail-Adresse ab', () => {
    const result = validateContactInput({ ...valid, email: 'keine-adresse' })
    expect(result.success === false && result.fieldErrors.email).toBeDefined()
  })

  it('lehnt eine zu kurze Nachricht ab', () => {
    const result = validateContactInput({ ...valid, message: 'Hallo' })
    expect(result.success === false && result.fieldErrors.message).toBeDefined()
  })

  it('lehnt eine Nachricht ueber 5000 Zeichen ab', () => {
    const result = validateContactInput({ ...valid, message: 'a'.repeat(5001) })
    expect(result.success === false && result.fieldErrors.message).toBeDefined()
  })
})

describe('validateContactRequest', () => {
  it('nimmt einen leeren Honeypot an', () => {
    const result = validateContactRequest({ ...valid, website: '' })
    expect(result.success).toBe(true)
  })

  it('reicht einen befuellten Honeypot durch, statt ihn als Eingabefehler zu melden', () => {
    // Das Verwerfen uebernimmt die Function - sie antwortet dem Bot mit "ok".
    // Eine Fehlermeldung waere hier eine Ruecksprache mit dem Angreifer.
    const result = validateContactRequest({ ...valid, website: 'http://spam.example' })
    expect(result.success).toBe(true)
    expect(result.success && result.data.website).toBe('http://spam.example')
  })

  it('kommt ohne Turnstile-Token aus', () => {
    const result = validateContactRequest(valid)
    expect(result.success).toBe(true)
  })
})
