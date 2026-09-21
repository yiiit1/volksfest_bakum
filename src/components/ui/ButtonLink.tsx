import Link from 'next/link'
import type { ComponentProps } from 'react'
import { buttonClasses, type ButtonVariant } from './buttonClasses'

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant
}

export function ButtonLink({ className, variant, ...rest }: ButtonLinkProps): React.ReactElement {
  return <Link className={buttonClasses(variant, className)} {...rest} />
}
