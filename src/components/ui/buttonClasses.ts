import { cn } from '@/lib/cn'

/**
 * primary  weisser Knopf mit dunkelgruener Schrift - die eine Hauptaktion
 * quiet    weisse Kontur auf dem Blatt - die zweite Wahl daneben
 */
export type ButtonVariant = 'primary' | 'quiet'

const base =
  'inline-flex items-center gap-2.5 rounded-lg px-[22px] py-4 text-[17px] leading-none font-bold no-underline transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-white text-page hover:bg-field-hover',
  quiet:
    'bg-transparent text-white shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.55)] hover:bg-white/8',
}

export function buttonClasses(variant: ButtonVariant = 'primary', className?: string): string {
  return cn(base, variants[variant], className)
}
