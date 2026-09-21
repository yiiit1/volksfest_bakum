import type { Metadata, Viewport } from 'next'
// import localFont from 'next/font/local'
import { Navigation } from '@/components/Navigation'
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

// =====================================================================
// Fonts: Eigene .woff2-Dateien in public/fonts/ ablegen, dann
// localFont einkommentieren und auf <body className=…> setzen.
// CLAUDE.md §7: keine Verbindung zu fonts.googleapis.com (DSGVO).
// =====================================================================
//
// const display = localFont({
//   src: '../../public/fonts/display.woff2',
//   variable: '--font-display-loaded',
//   display: 'swap',
// })
//
// const body = localFont({
//   src: '../../public/fonts/body.woff2',
//   variable: '--font-body-loaded',
//   display: 'swap',
// })

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
      <head>
        {/* Ohne JavaScript laufen die Einblend-Animationen aus
            src/components/motion/ nie an - die Inhalte blieben dann auf
            opacity: 0 stehen und die Seite waere leer. Diese Regel greift
            nur, wenn wirklich kein Skript laeuft, und macht alles sichtbar. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: '[data-motion]{opacity:1!important;transform:none!important}',
            }}
          />
        </noscript>
      </head>
      {/* Beim Aktivieren der Fonts: className={`${display.variable} ${body.variable} flex …`} */}
      <body className="flex min-h-screen flex-col font-sans antialiased">
        {/* Sprunglink: fuer Tastatur- und Screenreader-Nutzung der einzige Weg,
            die Navigation zu ueberspringen. Bis zum Fokus unsichtbar, dann
            sichtbar oben links. Zielt auf <main id="inhalt"> - im Wartungs-
            modus liegt dieselbe id in MaintenanceShell. */}
        <a
          href="#inhalt"
          className="bg-primary text-primary-foreground sr-only rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          {common.a11y.skipToContent}
        </a>

        {/* Waehrend der Wartung liefert das Layout nur den Rahmen - was
            angezeigt wird, entscheidet jede Seite selbst beim Build (siehe
            @/lib/maintenance). Navigation, Footer und Cookie-Consent bleiben
            unveraendert und sind nach dem Umschalten sofort wieder aktiv. */}
        {MAINTENANCE_MODE ? (
          children
        ) : (
          <>
            <Navigation />
            {/* tabIndex={-1}: <main> ist von sich aus nicht fokussierbar. Ohne
                das Attribut springt der Sprunglink zwar sichtbar an die
                richtige Stelle, der Tastaturfokus bleibt aber in der
                Navigation haengen - der naechste Tab-Druck landet wieder im
                Menue. */}
            <main id="inhalt" tabIndex={-1} className="flex-1">
              {children}
            </main>
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
