import { Fragment } from 'react'

export type LegalBlock =
  | { type: 'address'; lines: string[] }
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; text: string }

type Variant = 'site' | 'wartung'

type VariantStyles = {
  wrapper: string
  heading: string
  subheading: string
  list: string
  note: string
}

/**
 * Klassen je Darstellung. Die Rechtstexte liegen als JSON vor und werden
 * sowohl von der normalen Website als auch vom Wartungs-Design gerendert -
 * so gibt es nur eine Quelle fuer denselben Rechtstext.
 *
 * Ueberschriften-Hierarchie: die Seite liefert das <h1>, `heading` ist <h2>,
 * `subheading` ist <h3> (CLAUDE.md Paragraph 10).
 */
const styles: Record<Variant, VariantStyles> = {
  site: {
    wrapper: 'mt-8 grid gap-4 text-muted-foreground',
    heading: 'mt-6 font-display text-heading font-semibold text-foreground',
    subheading: 'mt-3 font-display text-base font-semibold text-foreground',
    list: 'ml-5 grid list-disc gap-2',
    note: 'text-sm',
  },
  wartung: {
    wrapper: 'relative grid gap-4 text-base leading-relaxed text-muted-foreground',
    // Bewusst `text-lg` und nicht `text-heading` wie in der site-Variante:
    // die <h1> steht hier in einer schmalen Karte und ist selbst nur
    // `text-heading`. Beide auf derselben Stufe waeren keine Hierarchie mehr.
    heading: 'mt-5 font-display text-lg font-semibold text-foreground',
    subheading: 'mt-2 font-display text-base font-semibold text-foreground',
    list: 'ml-5 grid list-disc gap-2',
    note: 'text-sm text-muted-foreground',
  },
}

export function LegalContent({
  blocks,
  variant,
}: {
  blocks: LegalBlock[]
  variant: Variant
}): React.ReactElement {
  const style = styles[variant]

  return (
    <div className={style.wrapper}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={index} className={style.heading}>
                {block.text}
              </h2>
            )
          case 'subheading':
            return (
              <h3 key={index} className={style.subheading}>
                {block.text}
              </h3>
            )
          case 'list':
            return (
              <ul key={index} className={style.list}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            )
          case 'note':
            return (
              <p key={index} className={style.note}>
                {block.text}
              </p>
            )
          case 'address':
            return (
              <p key={index}>
                {block.lines.map((line, lineIndex) => (
                  <Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </p>
            )
          default:
            return <p key={index}>{block.text}</p>
        }
      })}
    </div>
  )
}
