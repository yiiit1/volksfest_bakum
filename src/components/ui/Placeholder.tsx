import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/Icon'

/**
 * Platzhalter fuer Fotos, die der Verein noch liefert (Festplatz,
 * Vorstandsportraets). Wird ersetzt durch <Image> in derselben Form.
 */
export function Placeholder({
  icon,
  label,
  showLabel = true,
  className,
}: {
  icon: IconName
  label: string
  /** false = Beschriftung nur fuer Screenreader (kleine Portraets). */
  showLabel?: boolean
  className?: string
}): React.ReactElement {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'bg-page-2 text-ink-soft text-small grid place-items-center content-center gap-2.5 rounded-lg text-center font-semibold',
        className,
      )}
    >
      <Icon name={icon} className="size-8 stroke-[1.5]" />
      {showLabel ? label : null}
    </div>
  )
}
