/**
 * Zentrale Eckdaten der Website.
 *
 * ACHTUNG: Diese Datei darf nur aus Server Components, `generateMetadata`,
 * `robots.ts` und `sitemap.ts` importiert werden. Sie liest Umgebungs-
 * variablen ohne `NEXT_PUBLIC_`-Praefix - im Browser waeren die undefiniert
 * und der Wert wuerde von dem abweichen, der beim Build ins HTML geschrieben
 * wurde (Hydrations-Unterschied).
 */

/** Branch, aus dem das Produktions-Deployment gebaut wird. */
const PRODUCTION_BRANCH = 'main'

/**
 * Basis-URL der Website. Reihenfolge:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` - die echte Domain. Im Cloudflare-Dashboard
 *    bewusst nur fuer die Umgebung *Production* setzen, damit Vorschau-
 *    Deployments nicht mit Produktions-Canonicals bauen.
 * 2. `CF_PAGES_URL` - setzt Cloudflare Pages bei jedem Build automatisch
 *    (die `*.pages.dev`-Adresse dieses Deployments).
 * 3. `http://localhost:3000` - lokale Entwicklung.
 *
 * Der Wert wird beim Build eingesetzt und landet als Absolutadresse in
 * Canonicals, Open Graph und Sitemap.
 */
function resolveSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.CF_PAGES_URL?.trim() ||
    'http://localhost:3000'

  // Ohne abschliessenden Schraegstrich, damit `${url}${route}` immer passt.
  return url.replace(/\/+$/, '')
}

/**
 * Vorschau-Deployment? Cloudflare Pages baut jeden Branch und jeden Pull
 * Request unter einer eigenen `*.pages.dev`-Adresse. Diese Adressen sind
 * oeffentlich erreichbar und wuerden sonst als Duplikat der echten Website
 * indexiert.
 *
 * Bewusst an `CF_PAGES` gekoppelt: ein lokaler `npm run build` soll sich wie
 * die Produktion verhalten, sonst testet man dauerhaft eine andere Ausgabe.
 * Zum Erzwingen: `NEXT_PUBLIC_NOINDEX=true`.
 */
function resolveIsPreview(): boolean {
  if (process.env.NEXT_PUBLIC_NOINDEX?.trim().toLowerCase() === 'true') return true
  if (process.env.CF_PAGES !== '1') return false
  return process.env.CF_PAGES_BRANCH !== PRODUCTION_BRANCH
}

export const siteConfig = {
  name: 'Lorem Ipsum',
  /** Kurzform fuer das Web-App-Manifest (Startbildschirm, max. ~12 Zeichen). */
  shortName: 'Lorem',
  url: resolveSiteUrl(),
  locale: 'de',

  /**
   * Farbe der Browser-Oberflaeche auf Mobilgeraeten (`<meta name="theme-color">`)
   * und Hintergrund beim Start als installierte Web-App.
   *
   * Als Hex-Wert, nicht als oklch(): aeltere Browser und einige App-Shells
   * verwerfen sonst die Angabe. Bei Farbwechsel im Projekt hier UND in
   * globals.css (--color-background) anpassen - die beiden Werte haengen
   * nicht automatisch zusammen.
   */
  themeColor: '#fcfcfc',

  /**
   * Gegenstueck fuer den dunklen Modus. Wird nur ausgewertet, wenn
   * `features.colorScheme` auf 'auto' oder 'dark' steht, und entspricht
   * dem dunklen Wert von `--color-background` in globals.css.
   */
  themeColorDark: '#14191f',

  /** true = Suchmaschinen aussperren (Vorschau-Deployment). */
  isPreview: resolveIsPreview(),

  /**
   * Bausteine, die nicht jedes Projekt braucht.
   *
   * `cookieConsent` steht bewusst auf false: solange die Website keinen
   * Tracker und keine externe Einbettung laedt, ist ein Zustimmungsbanner
   * rechtlich kein Schutz, sondern ein Versprechen, das die Seite gar nicht
   * einhalten muss - und es kostet jeden Besucher einen Klick. Kommt spaeter
   * Google Maps, ein eingebettetes Video oder Analytics dazu, hier auf true
   * stellen (siehe @/components/CookieConsent).
   */
  features: {
    cookieConsent: false,

    /**
     * Hell/Dunkel. Der einzige Schalter dafuer - er landet als
     * `data-theme` auf <html> und entscheidet ueber `color-scheme`,
     * welchen Zweig die `light-dark()`-Tokens in globals.css nehmen
     * (CLAUDE.md §8).
     *
     *   'light'  nur heller Modus (Standard)
     *   'auto'   folgt der Systemeinstellung des Besuchers
     *   'dark'   dauerhaft dunkel
     *
     * Bewusst kein Umschalter in der Oberflaeche: der braeuchte
     * localStorage plus ein blockierendes Inline-Skript im <head>, sonst
     * blitzt beim Laden der falsche Modus auf. Wenn ein Projekt das
     * wirklich braucht, ist es eine eigene Entscheidung - nicht der
     * Standard fuer jede Website.
     */
    colorScheme: 'light' as 'light' | 'auto' | 'dark',
  },

  /**
   * Stammdaten fuer die strukturierten Daten (JSON-LD, siehe
   * @/lib/structured-data). Suchmaschinen lesen daraus das Knowledge Panel
   * und die erweiterten Suchergebnisse.
   *
   * Muss mit dem Impressum uebereinstimmen - widerspruechliche Angaben sind
   * schlechter als gar keine.
   */
  organization: {
    /**
     * 'LocalBusiness' fuer alles mit Ladentheke, Praxis oder Werkstatt an
     * einer festen Adresse - dort zaehlen Anschrift und Oeffnungszeiten.
     * 'Organization' fuer Dienstleister ohne Publikumsverkehr.
     * Feinere Typen sind moeglich und besser, wenn sie passen, z. B.
     * 'MedicalBusiness', 'Dentist', 'Restaurant', 'School'.
     */
    type: 'LocalBusiness',
    /** Firmierung laut Impressum, falls sie vom Markennamen abweicht. */
    legalName: 'Lorem Ipsum GmbH',
    email: 'kontakt@example.com',
    telephone: '+49 000 0000000',
    address: {
      streetAddress: 'Musterstraße 1',
      postalCode: '00000',
      addressLocality: 'Musterstadt',
      addressRegion: 'Niedersachsen',
      addressCountry: 'DE',
    },
    /**
     * Geo-Koordinaten. Nur ausfuellen, wenn sie stimmen - eine falsche
     * Position auf der Karte ist schlimmer als keine. Sonst auf null lassen.
     */
    geo: null as { latitude: number; longitude: number } | null,
    /**
     * Oeffnungszeiten im Schema.org-Format, z. B.
     * [{ days: ['Monday', 'Tuesday'], opens: '09:00', closes: '17:00' }].
     * Leer lassen, wenn es keine gibt.
     */
    openingHours: [] as { days: string[]; opens: string; closes: string }[],
    /**
     * Profile derselben Einrichtung anderswo (Google-Unternehmensprofil,
     * LinkedIn, Instagram, Branchenverzeichnisse). Verknuepft die Identitaeten
     * miteinander. Nur echte, gepflegte Profile eintragen.
     */
    sameAs: [] as string[],
  },
} as const

export type SiteConfig = typeof siteConfig
