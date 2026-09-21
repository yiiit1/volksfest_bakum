'use client'

import { useEffect } from 'react'
import common from '@/content/common.json'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

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
    <Section space="lg">
      <Container
        width="card"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center"
      >
        <h1 className="font-display text-foreground text-heading font-semibold text-balance">
          {common.error.title}
        </h1>
        <p className="text-muted-foreground text-pretty">{common.error.body}</p>
        <Button onClick={reset}>{common.error.retry}</Button>
      </Container>
    </Section>
  )
}
