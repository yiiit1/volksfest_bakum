'use client'

import { useEffect } from 'react'
import common from '@/content/common.json'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): React.ReactElement {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-card mx-auto flex min-h-[40vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-heading font-extrabold text-balance">{common.error.title}</h1>
      <p className="text-ink-soft text-pretty">{common.error.body}</p>
      <Button onClick={reset}>{common.error.retry}</Button>
    </div>
  )
}
