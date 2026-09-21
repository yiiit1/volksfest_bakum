import type { JsonLd as JsonLdObject } from '@/lib/structured-data'

type JsonLdProps = {
  data: JsonLdObject
}

/**
 * Schreibt strukturierte Daten als <script type="application/ld+json">.
 *
 * Der Inhalt eines solchen Blocks wird nicht ausgefuehrt, sondern nur gelesen -
 * trotzdem muss `<` maskiert werden: ein `</script` irgendwo in den Daten (aus
 * einem Kundentext, einer URL) wuerde den HTML-Parser das Tag vorzeitig
 * schliessen lassen und den Rest der Seite zerlegen. < ist innerhalb von
 * JSON-Strings gueltig und aendert am geparsten Wert nichts.
 *
 * Nur aus Server Components verwenden (siehe @/lib/structured-data).
 */
export function JsonLd({ data }: JsonLdProps): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
