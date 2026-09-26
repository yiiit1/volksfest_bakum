import Link from 'next/link'
import common from '@/content/common.json'
import { CurrentYear } from '@/components/CurrentYear'

/**
 * Fusszeile unter dem Ordner. Der Hinweis auf Heitmann Software gehoert zur
 * Vereinbarung mit dem Verein (Sichtbarkeit statt vollem Preis).
 */
export function Footer(): React.ReactElement {
  const { footer } = common

  return (
    <footer className="max-w-binder mx-auto flex w-full flex-wrap justify-between gap-4 px-6 pt-[26px] pb-10 text-base text-white">
      <span>
        © <CurrentYear buildYear={new Date().getFullYear()} /> {footer.copyright}
      </span>
      <ul className="flex gap-5">
        {footer.links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-white underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <span>
        {footer.credit.before}
        <a href={footer.credit.href} className="text-white underline">
          {footer.credit.label}
        </a>
      </span>
    </footer>
  )
}
