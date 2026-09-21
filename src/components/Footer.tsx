import Link from 'next/link'
import common from '@/content/common.json'
import { Container } from '@/components/ui/Container'
import { CurrentYear } from '@/components/CurrentYear'

export function Footer(): React.ReactElement {
  return (
    <footer className="border-border bg-muted/40 mt-auto border-t">
      <Container className="text-muted-foreground flex flex-col items-center justify-between gap-4 py-8 text-sm md:flex-row">
        <p>
          {common.footer.copyright} · <CurrentYear buildYear={new Date().getFullYear()} />
        </p>
        <ul className="flex gap-6">
          {common.footer.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  )
}
