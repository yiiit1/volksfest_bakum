import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Binder } from '@/components/binder/Binder'
import { Footer } from '@/components/Footer'
import { CookieConsent } from '@/components/CookieConsent'
import { CloudflareAnalytics } from '@/components/CloudflareAnalytics'
import { JsonLd } from '@/components/JsonLd'
import { siteConfig } from '@/lib/site-config'
import { siteJsonLd } from '@/lib/structured-data'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import common from '@/content/common.json'
import maintenance from '@/content/wartung.json'
import './globals.css'

// Schibsted Grotesk, variable Schrift 400-900, lateinischer Zeichensatz.
// Lokal ausgeliefert - keine Verbindung zu fonts.googleapis.com (CLAUDE.md §7).
const schibsted = localFont({
  src: '../../public/fonts/schibsted-grotesk.woff2',
  variable: '--font-schibsted',
  weight: '400 900',
  display: 'swap',
})

// Vorschau-Deployments werden komplett aus dem Index gehalten - sonst
// konkurriert die *.pages.dev-Adresse mit der echten Domain (siehe
// @/lib/site-config). Der Wert steht zur Build-Zeit fest.
const ROBOTS: Metadata['robots'] = siteConfig.isPreview
  ? { index: false, follow: false, nocache: true }
  : { index: true, follow: true }

/**
 * Farbe der Browser-Oberflaeche auf Mobilgeraeten und Farbraum-Hinweis.
 *
 * Beides folgt `siteConfig.features.colorScheme` - derselbe Schalter, der
 * unten als `data-theme` an <html> geht und in globals.css entscheidet,
 * welchen Zweig die `light-dark()`-Tokens nehmen. Bei 'auto' muss
 * themeColor eine Liste mit `media`-Bedingungen sein, sonst behaelt die
 * Statusleiste im dunklen Modus die helle Farbe.
 */
const COLOR_SCHEME = {
  light: 'light',
  auto: 'light dark',
  dark: 'dark',
} as const satisfies Record<typeof siteConfig.features.colorScheme, Viewport['colorScheme']>

function resolveThemeColor(): Viewport['themeColor'] {
  switch (siteConfig.features.colorScheme) {
    case 'dark':
      return siteConfig.themeColorDark
    case 'auto':
      return [
        { media: '(prefers-color-scheme: light)', color: siteConfig.themeColor },
        { media: '(prefers-color-scheme: dark)', color: siteConfig.themeColorDark },
      ]
    default:
      return siteConfig.themeColor
  }
}

export const viewport: Viewport = {
  themeColor: resolveThemeColor(),
  colorScheme: COLOR_SCHEME[siteConfig.features.colorScheme],
}

// Statisches metadata-Objekt: MAINTENANCE_MODE steht zur Compile-Zeit fest,
// es muss zur Laufzeit nichts entschieden werden. Waehrend der Wartung setzt
// das Layout nur den Default-Titel und die Marke der Wartungsseite - Impressum
// und Datenschutz behalten dadurch ihren eigenen Seitentitel.
export const metadata: Metadata = MAINTENANCE_MODE
  ? {
      metadataBase: new URL(siteConfig.url),
      title: {
        default: maintenance.meta.title,
        template: `%s | ${maintenance.brand}`,
      },
      description: maintenance.meta.description,
      openGraph: {
        type: 'website',
        locale: 'de_DE',
        siteName: maintenance.brand,
        title: maintenance.meta.title,
        description: maintenance.meta.description,
      },
      // Bewusst indexierbar: die Wartungsseite traegt Markennamen und
      // Kontaktdaten. Bliebe sie auf noindex, verschwaende die Domain
      // waehrend der Wartung komplett aus den Suchergebnissen.
      robots: ROBOTS,
    }
  : {
      metadataBase: new URL(siteConfig.url),
      title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
      },
      description: common.meta.description,
      openGraph: {
        type: 'website',
        locale: 'de_DE',
        siteName: siteConfig.name,
      },
      robots: ROBOTS,
    }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang={siteConfig.locale} data-theme={siteConfig.features.colorScheme}>
      <body className={`${schibsted.variable} flex min-h-screen flex-col font-sans antialiased`}>
        {/* Sprunglink: fuer Tastatur- und Screenreader-Nutzung der einzige Weg,
            die Reiter zu ueberspringen. Bis zum Fokus unsichtbar, dann
            sichtbar oben links. Zielt auf <main id="inhalt"> im Ordner - im
            Wartungsmodus liegt dieselbe id in MaintenanceShell. */}
        <a
          href="#inhalt"
          className="text-page sr-only z-50 rounded-lg bg-white px-4 py-2 font-bold focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
        >
          {common.a11y.skipToContent}
        </a>

        {/* Waehrend der Wartung liefert das Layout nur den Rahmen - was
            angezeigt wird, entscheidet jede Seite selbst beim Build (siehe
            @/lib/maintenance). Ordner, Footer und Cookie-Consent bleiben
            unveraendert und sind nach dem Umschalten sofort wieder aktiv. */}
        {MAINTENANCE_MODE ? (
          children
        ) : (
          <>
            {/* Der Ordner bringt Reiter und <main id="inhalt"> mit. */}
            <Binder>{children}</Binder>
            <Footer />
            {siteConfig.features.cookieConsent && <CookieConsent />}
          </>
        )}

        {/* Strukturierte Daten und Reichweitenmessung stehen ausserhalb des
            Wartungs-Zweigs: beides gilt fuer jede Seite. */}
        <JsonLd data={siteJsonLd()} />
        <CloudflareAnalytics />
      </body>
    </html>
  )
}
