import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/site-config'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import common from '@/content/common.json'
import maintenance from '@/content/wartung.json'

/**
 * Vorschaubild fuer geteilte Links (WhatsApp, LinkedIn, Slack, Mastodon).
 *
 * Ohne diese Datei zeigen alle Dienste nur die nackte URL. Next erzeugt das
 * Bild beim Build einmal als PNG und traegt die passenden og:image- und
 * twitter:image-Tags automatisch in jede Seite ein - im statischen Export
 * laeuft dabei nichts zur Laufzeit.
 *
 * Ein eigener Entwurf pro Projekt ist willkommen. Zwei Regeln gelten aber
 * unabhaengig vom Design:
 *
 * - 1200x630 Pixel. Manche Dienste beschneiden auf 1.91:1, andere auf 1:1 -
 *   deshalb nichts Wichtiges an den Rand.
 * - Die Farben stehen hier als feste Werte, nicht als CSS-Variablen. Das Bild
 *   wird von satori gerendert, nicht vom Browser; globals.css ist dabei nicht
 *   geladen. Bei einem Farbwechsel im Projekt also auch hier nachziehen.
 *
 * Eigene Schrift statt der eingebauten: die .woff2 (nicht .woff) mit
 * readFileSync einlesen und ueber die `fonts`-Option uebergeben. Variable
 * Fonts versteht satori nicht - dann eine statische Schnittfassung nutzen.
 */

// Fuer den statischen Export noetig - wie bei robots.ts und sitemap.ts.
// Ohne die Angabe haelt Next die Bild-Route fuer dynamisch und bricht den
// Build mit "not configured on route /opengraph-image" ab.
export const dynamic = 'force-static'

export const alt = siteConfig.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Blatt, Schrift, erste Registerfarbe und Nebenschrift aus globals.css.
const BACKGROUND = '#014f3c'
const FOREGROUND = '#ffffff'
const PRIMARY = '#6fdcb5'
const MUTED = '#cdebe0'

export default function OpengraphImage(): Response {
  const title = MAINTENANCE_MODE ? maintenance.meta.title : siteConfig.name
  const subtitle = MAINTENANCE_MODE ? maintenance.hero.title : common.brand.tagline

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: BACKGROUND,
        padding: '80px',
        // Schmale Akzentkante links - erkennbar auch als Miniaturbild.
        borderLeft: `24px solid ${PRIMARY}`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div
          style={{
            fontSize: 28,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: PRIMARY,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            lineHeight: 1.15,
            color: FOREGROUND,
            // Lange Titel abschneiden statt das Layout sprengen zu lassen.
            display: 'block',
            lineClamp: 3,
          }}
        >
          {title}
        </div>
      </div>

      <div style={{ fontSize: 32, color: MUTED }}>{subtitle}</div>
    </div>,
    size,
  )
}
