import { siteConfig } from '@/lib/site-config'
import common from '@/content/common.json'

/**
 * Strukturierte Daten (JSON-LD) fuer die gesamte Website.
 *
 * Suchmaschinen lesen daraus, wer hinter der Domain steckt: Name, Anschrift,
 * Kontaktwege, verknuepfte Profile. Das ist die Grundlage fuer Knowledge
 * Panel und lokale Suchergebnisse und zahlt auf den Trustworthiness-Teil von
 * E-E-A-T ein (CLAUDE.md Paragraph 10).
 *
 * Alle Werte kommen aus @/lib/site-config und @/content/common.json - es gibt
 * keine zweite Stelle, an der dieselben Angaben gepflegt werden muessten. Die
 * Angaben MUESSEN mit dem Impressum uebereinstimmen.
 *
 * Pruefen nach dem Deployment:
 *   https://search.google.com/test/rich-results
 *   https://validator.schema.org/
 *
 * ACHTUNG: nur aus Server Components aufrufen - siteConfig liest Umgebungs-
 * variablen ohne NEXT_PUBLIC_-Praefix.
 */

/** Minimaler Typ fuer ein JSON-LD-Objekt. */
export type JsonLd = Record<string, unknown>

/**
 * Entfernt leere Felder. Schema.org verlangt keine Vollstaendigkeit, aber ein
 * `"telephone": ""` ist eine falsche Angabe, kein fehlendes Feld.
 */
function compact(input: JsonLd): JsonLd {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }),
  )
}

/** Die Einrichtung selbst - Organization bzw. LocalBusiness. */
export function organizationJsonLd(): JsonLd {
  const org = siteConfig.organization
  // Bewusst auf string verbreitert: siteConfig ist `as const`, ohne das hier
  // haelt TypeScript den Vergleich zweier Literale fuer einen Fehler - obwohl
  // genau er die Frage beantwortet, ob das Projekt ueberhaupt eine vom
  // Markennamen abweichende Firmierung hat.
  const legalName: string = org.legalName
  const name: string = siteConfig.name

  return compact({
    '@context': 'https://schema.org',
    '@type': org.type,
    // Stabile ID, damit andere Knoten (WebSite, WebPage) darauf verweisen
    // koennen, statt die Angaben zu wiederholen.
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: legalName !== name ? legalName : undefined,
    url: siteConfig.url,
    description: common.meta.description,
    // Next legt src/app/icon.png beim Build unter /icon.png ab.
    logo: `${siteConfig.url}/icon.png`,
    // Ohne Dateiendung - genau so heisst die Datei, die Next aus
    // src/app/opengraph-image.tsx erzeugt. Den passenden Content-Type setzt
    // public/_headers, sonst liefert Cloudflare Pages sie als
    // application/octet-stream aus und kein Dienst erkennt das Bild.
    image: `${siteConfig.url}/opengraph-image`,
    email: org.email,
    telephone: org.telephone,
    address: compact({
      '@type': 'PostalAddress',
      streetAddress: org.address.streetAddress,
      postalCode: org.address.postalCode,
      addressLocality: org.address.addressLocality,
      addressRegion: org.address.addressRegion,
      addressCountry: org.address.addressCountry,
    }),
    geo: org.geo
      ? {
          '@type': 'GeoCoordinates',
          latitude: org.geo.latitude,
          longitude: org.geo.longitude,
        }
      : undefined,
    openingHoursSpecification: org.openingHours.map((entry) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: entry.days,
      opens: entry.opens,
      closes: entry.closes,
    })),
    sameAs: [...org.sameAs],
  })
}

/** Die Website als solche, verknuepft mit der Einrichtung. */
export function websiteJsonLd(): JsonLd {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: common.meta.description,
    inLanguage: siteConfig.locale,
    publisher: { '@id': `${siteConfig.url}/#organization` },
  })
}

/**
 * Alle Website-weiten Knoten in einem Graph.
 *
 * Ein einziges <script>-Tag mit @graph ist einer Handvoll einzelner Tags
 * vorzuziehen: die Knoten koennen sich ueber @id gegenseitig referenzieren,
 * ohne dieselben Daten mehrfach auszuliefern.
 */
export function siteJsonLd(): JsonLd {
  const [organization, website] = [organizationJsonLd(), websiteJsonLd()]

  // @context steht einmal am Graph, nicht an jedem Knoten.
  delete organization['@context']
  delete website['@context']

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website],
  }
}
