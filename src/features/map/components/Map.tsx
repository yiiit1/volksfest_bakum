'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import common from '@/content/common.json'

type MapProps = {
  iframeSrc: string
  previewSrc?: string
  /** Nur setzen, wenn die Vorschau mehr zeigt als der Standardtext hergibt. */
  alt?: string
}

/**
 * Zwei-Klick-Lösung gemäß CLAUDE.md §11: Karte wird erst nach
 * expliziter Zustimmung geladen, vorher kein Datenabfluss an Google.
 */
export function Map({
  iframeSrc,
  previewSrc,
  alt = common.map.previewAlt,
}: MapProps): React.ReactElement {
  const [show, setShow] = useState(false)

  if (!show) {
    return (
      <div className="border-border bg-muted relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-lg)] border">
        {previewSrc && <Image src={previewSrc} alt={alt} fill className="object-cover" />}
        <div className="bg-background/70 absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center backdrop-blur-sm">
          <p className="text-foreground max-w-md text-sm">{common.map.consent}</p>
          <Button onClick={() => setShow(true)}>{common.map.button}</Button>
        </div>
      </div>
    )
  }

  return (
    <iframe
      src={iframeSrc}
      title={common.map.iframeTitle}
      loading="lazy"
      className="border-border aspect-[16/9] w-full rounded-[var(--radius-lg)] border"
    />
  )
}
