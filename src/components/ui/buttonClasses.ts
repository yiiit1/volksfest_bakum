import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'

const base =
  'inline-flex items-center justify-center rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  secondary: 'bg-muted text-foreground hover:bg-border',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  // Nimmt Rahmen- und Schriftfarbe vom Umfeld (currentColor). Dadurch der
  // einzige Knopf, der auch auf einer eingefaerbten Flaeche sicher lesbar
  // bleibt - z. B. im CTA-Band mit tone="inverted".
  outline: 'border border-current bg-transparent text-current hover:opacity-80',
}

export function buttonClasses(variant: ButtonVariant = 'primary', className?: string): string {
  return cn(base, variants[variant], className)
}
