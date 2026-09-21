import type { ButtonHTMLAttributes } from 'react'
import { buttonClasses, type ButtonVariant } from './buttonClasses'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({ className, variant, ...rest }: ButtonProps): React.ReactElement {
  return <button className={buttonClasses(variant, className)} {...rest} />
}
