'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import kontakt from '@/content/kontakt.json'
import { Button } from '@/components/ui/Button'
import { Turnstile, TURNSTILE_ENABLED } from '@/features/contact/components/Turnstile'
import {
  validateContactInput,
  type ContactErrorCode,
  type ContactFieldErrors,
  type ContactResponse,
} from '@/features/contact/schema'

/**
 * Kontaktformular.
 *
 * Der Versand laeuft ueber `POST /api/contact` - eine Cloudflare Pages
 * Function, kein Route Handler und keine Server Action: beide brauchen einen
 * Node-Server, den der statische Export nicht hat.
 *
 * Lokal (`npm run dev`) existiert diese Route nicht. Statt eines rohen
 * 404-Fehlers zeigt das Formular dann den Hinweis "noch nicht eingerichtet" -
 * derselbe Fall wie ein Deployment ohne hinterlegte Brevo-Schluessel.
 */

const ENDPOINT = '/api/contact'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm(): React.ReactElement {
  const [status, setStatus] = useState<Status>('idle')
  const [errorCode, setErrorCode] = useState<ContactErrorCode | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({})
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  // Jede Erhoehung laesst das Widget ein frisches Token holen.
  const [turnstileReset, setTurnstileReset] = useState(0)

  const handleToken = useCallback((token: string | null): void => {
    setTurnstileToken(token)
  }, [])

  const isSubmitting = status === 'submitting'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (isSubmitting) return

    const form = event.currentTarget
    const formData = new FormData(form)
    const input = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      message: String(formData.get('message') ?? ''),
      consent: formData.get('consent') === 'on',
    }

    // Vorabpruefung im Browser: nur Komfort. Verbindlich ist dieselbe
    // Pruefung in der Function - die Route ist ein offener POST-Endpunkt.
    const local = validateContactInput(input)
    if (!local.success) {
      setFieldErrors(local.fieldErrors)
      setErrorCode('invalid')
      setStatus('error')
      return
    }

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setFieldErrors({})
      setErrorCode('captcha')
      setStatus('error')
      return
    }

    setFieldErrors({})
    setErrorCode(null)
    setStatus('submitting')

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...input,
          website: String(formData.get('website') ?? ''),
          turnstileToken: turnstileToken ?? undefined,
        }),
      })

      const result = await readContactResponse(response)

      if (result.ok) {
        form.reset()
        setStatus('success')
        return
      }

      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      setErrorCode(result.error)
      setStatus('error')
    } catch {
      // Netzwerkfehler, Abbruch, offline. Kein `console.error` mit Formular-
      // inhalten - personenbezogene Daten gehoeren in kein Log.
      setErrorCode('send-failed')
      setStatus('error')
    } finally {
      // Ein Turnstile-Token gilt genau einmal. Nach jedem Versuch ein neues
      // holen, sonst schlaegt der zweite Anlauf mit `captcha` fehl.
      setTurnstileToken(null)
      setTurnstileReset((value) => value + 1)
    }
  }

  const message =
    status === 'success'
      ? kontakt.form.status.success
      : status === 'error' && errorCode
        ? kontakt.form.status[errorCode]
        : null

  return (
    <form onSubmit={handleSubmit} noValidate className="relative grid gap-4">
      <Field
        name="name"
        label={kontakt.form.name.label}
        placeholder={kontakt.form.name.placeholder}
        autoComplete="name"
        required
        errors={fieldErrors.name}
      />
      <Field
        name="email"
        type="email"
        label={kontakt.form.email.label}
        placeholder={kontakt.form.email.placeholder}
        autoComplete="email"
        required
        errors={fieldErrors.email}
      />
      <Field
        name="message"
        textarea
        label={kontakt.form.message.label}
        placeholder={kontakt.form.message.placeholder}
        required
        errors={fieldErrors.message}
      />

      {/*
        Honeypot: fuer Menschen unsichtbar und nicht fokussierbar, fuer
        Screenreader per aria-hidden ausgeblendet. Ein Bot fuellt es aus -
        die Function verwirft die Nachricht dann kommentarlos.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0">
        <label htmlFor="field-website">{kontakt.form.honeypot.label}</label>
        <input id="field-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Consent errors={fieldErrors.consent} />

      {/* Rendert nichts, solange kein NEXT_PUBLIC_TURNSTILE_SITE_KEY gesetzt ist. */}
      <Turnstile onToken={handleToken} resetSignal={turnstileReset} />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? kontakt.form.submitting : kontakt.form.submit}
        </Button>
      </div>

      {/*
        Immer im DOM, damit Screenreader die Aenderung ansagen - ein erst
        nachtraeglich eingefuegtes aria-live-Element wird nicht vorgelesen.
      */}
      <p
        role="status"
        aria-live="polite"
        className={
          status === 'error'
            ? 'text-sm text-[var(--color-danger)]'
            : 'text-muted-foreground text-sm'
        }
      >
        {message}
      </p>
    </form>
  )
}

/**
 * Liest die Antwort der Function.
 *
 * Kommt kein JSON zurueck, gibt es die Function nicht: lokal unter
 * `next dev`, in einer Vorschau ohne `functions/` oder bei einem Fehler in
 * der Cloudflare-Zustellung. Aus Sicht des Besuchers derselbe Fall wie
 * fehlende Schluessel - deshalb `unconfigured`.
 */
async function readContactResponse(response: Response): Promise<ContactResponse> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return { ok: false, error: 'unconfigured' }
  }
  try {
    return (await response.json()) as ContactResponse
  } catch {
    return { ok: false, error: 'send-failed' }
  }
}

function Consent({ errors }: { errors?: string[] }): React.ReactElement {
  const id = 'field-consent'
  const errorId = `${id}-error`
  const hasError = Boolean(errors && errors.length > 0)

  return (
    <div className="grid gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          name="consent"
          type="checkbox"
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className="border-border accent-primary focus-visible:outline-primary mt-1 size-4 shrink-0 rounded-[var(--radius-sm)] border focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <label htmlFor={id} className="text-muted-foreground text-sm">
          {kontakt.form.consent.before}
          <Link href={kontakt.form.consent.linkHref} className="text-foreground underline">
            {kontakt.form.consent.linkLabel}
          </Link>
          {kontakt.form.consent.after}
        </label>
      </div>
      {hasError && errors && (
        <p id={errorId} className="text-xs text-[var(--color-danger)]">
          {errors[0]}
        </p>
      )}
    </div>
  )
}

type FieldProps = {
  name: string
  label: string
  placeholder: string
  errors?: string[]
  textarea?: boolean
  type?: string
  required?: boolean
  autoComplete?: string
}

function Field({
  name,
  label,
  placeholder,
  errors,
  textarea,
  type = 'text',
  required,
  autoComplete,
}: FieldProps): React.ReactElement {
  const id = `field-${name}`
  const errorId = `${id}-error`
  const hasError = Boolean(errors && errors.length > 0)

  const sharedClass =
    'w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

  const sharedProps = {
    id,
    name,
    placeholder,
    required,
    autoComplete,
    'aria-invalid': hasError || undefined,
    'aria-describedby': hasError ? errorId : undefined,
    className: sharedClass,
  }

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-foreground text-sm font-medium">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-muted-foreground ml-1">
              *
            </span>
            <span className="sr-only"> ({kontakt.form.required})</span>
          </>
        )}
      </label>
      {textarea ? <textarea {...sharedProps} rows={5} /> : <input {...sharedProps} type={type} />}
      {hasError && errors && (
        <p id={errorId} className="text-xs text-[var(--color-danger)]">
          {errors[0]}
        </p>
      )}
    </div>
  )
}
