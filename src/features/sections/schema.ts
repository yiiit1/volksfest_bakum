import { z } from 'zod'

/**
 * Schema der Abschnitts-Liste.
 *
 * Eine Seite ist eine geordnete Liste von Sektionen in JSON. Umordnen heisst
 * dann: zwei Bloecke tauschen - kein TSX anfassen. Damit das gefahrlos geht,
 * wird die Liste beim Build geprueft: `parseSections()` laeuft in einer
 * Server Component, also zur Build-Zeit. Ein Tippfehler im `type` oder ein
 * fehlender Titel bricht den Build ab, statt still eine leere Seite zu
 * erzeugen. Zod landet dabei nicht im Client-Bundle.
 *
 * Neue Sektionsart hinzufuegen:
 *   1. Schema hier ergaenzen und in `sectionSchema` aufnehmen
 *   2. Komponente unter components/ anlegen
 *   3. in components/SectionList.tsx eintragen (der switch ist erschoepfend,
 *      TypeScript meldet den fehlenden Fall von selbst)
 *
 * Die Liste ist eine Abkuerzung, kein Korsett: Seiten duerfen weiterhin
 * freies JSX schreiben (siehe src/app/about/page.tsx).
 */

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
})

const imageSchema = z.object({
  src: z.string().min(1),
  /**
   * Leerer Alt-Text ist erlaubt, aber nur fuer rein dekorative Bilder -
   * dann muss er wirklich leer sein, nicht "Bild" (CLAUDE.md §7).
   */
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

/** Rahmen-Eigenschaften, die jede Sektion hat (siehe components/ui/Section). */
const frame = {
  /** Ankerziel fuer Sprungmarken (#kontakt). Optional. */
  id: z.string().min(1).optional(),
  space: z.enum(['sm', 'md', 'lg']).optional(),
  tone: z.enum(['default', 'muted', 'accent', 'inverted']).optional(),
  bordered: z.boolean().optional(),
}

const heroSchema = z.object({
  type: z.literal('hero'),
  ...frame,
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  align: z.enum(['start', 'center']).optional(),
  primaryCta: linkSchema.optional(),
  secondaryCta: linkSchema.optional(),
  image: imageSchema.optional(),
})

const splitSchema = z.object({
  type: z.literal('split'),
  ...frame,
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  /** Absaetze - ein Eintrag je <p>. */
  body: z.array(z.string().min(1)).min(1),
  image: imageSchema,
  /** Auf welcher Seite das Bild steht. Standard: rechts. */
  mediaSide: z.enum(['left', 'right']).optional(),
  cta: linkSchema.optional(),
})

const featureGridSchema = z.object({
  type: z.literal('feature-grid'),
  ...frame,
  title: z.string().optional(),
  lead: z.string().optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .min(1),
})

const gallerySchema = z.object({
  type: z.literal('gallery'),
  ...frame,
  title: z.string().optional(),
  lead: z.string().optional(),
  columns: z.union([z.literal(2), z.literal(3)]).optional(),
  images: z.array(imageSchema).min(1),
})

const quoteSchema = z.object({
  type: z.literal('quote'),
  ...frame,
  quote: z.string().min(1),
  author: z.string().optional(),
  role: z.string().optional(),
})

const ctaSchema = z.object({
  type: z.literal('cta'),
  ...frame,
  title: z.string().min(1),
  body: z.string().optional(),
  primaryCta: linkSchema,
  secondaryCta: linkSchema.optional(),
})

export const sectionSchema = z.discriminatedUnion('type', [
  heroSchema,
  splitSchema,
  featureGridSchema,
  gallerySchema,
  quoteSchema,
  ctaSchema,
])

export const sectionsSchema = z.array(sectionSchema)

export type SectionLink = z.infer<typeof linkSchema>
export type SectionImage = z.infer<typeof imageSchema>
export type SectionContent = z.infer<typeof sectionSchema>
export type HeroContent = z.infer<typeof heroSchema>
export type SplitContent = z.infer<typeof splitSchema>
export type FeatureGridContent = z.infer<typeof featureGridSchema>
export type GalleryContent = z.infer<typeof gallerySchema>
export type QuoteContent = z.infer<typeof quoteSchema>
export type CtaContent = z.infer<typeof ctaSchema>

/**
 * Prueft die Sektionsliste einer Seite.
 *
 * Nur aus Server Components aufrufen. Der Fehler nennt Datei und Pfad, weil
 * ein Build-Abbruch ohne Ortsangabe bei einer JSON-Datei nichts hilft.
 *
 * @param input  der `sections`-Zweig aus dem Content-JSON
 * @param source Dateiname fuer die Fehlermeldung, z. B. 'content/home.json'
 */
export function parseSections(input: unknown, source: string): SectionContent[] {
  const result = sectionsSchema.safeParse(input)
  if (result.success) return result.data

  const details = result.error.issues
    .map((issue) => `  - sections.${issue.path.join('.') || '(Wurzel)'}: ${issue.message}`)
    .join('\n')

  throw new Error(`Ungueltige Sektionen in ${source}:\n${details}`)
}
