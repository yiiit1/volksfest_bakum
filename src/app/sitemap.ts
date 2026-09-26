import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site-config'
import { MAINTENANCE_MODE } from '@/lib/maintenance'

// Fuer den statischen Export (Cloudflare Pages) noetig: ohne diese Angabe
// behandelt Next die Route als dynamisch und bricht den Export ab.
export const dynamic = 'force-static'

/**
 * Seiten der Website.
 *
 * `lastModified` steht hier bewusst NICHT drin. Im statischen Export gibt es
 * nur einen Zeitpunkt, den die Sitemap kennen koennte: den des Builds. Jede
 * Aenderung an einer einzigen Seite - oder auch nur ein erneutes Deployment
 * ohne inhaltliche Aenderung - haette also allen URLs ein neues Datum
 * gegeben. Genau das bringt Suchmaschinen dazu, die Angabe dauerhaft zu
 * ignorieren; ein fehlendes Datum ist besser als ein nachweislich falsches.
 *
 * Wenn ein Projekt echte Aenderungsdaten hat (Blog, Referenzen), gehoert das
 * Datum an die Inhaltsdaten und wird hier durchgereicht:
 *
 *   { path: '/blog/mein-beitrag', lastModified: post.updatedAt }
 */
const ROUTES = [
  '',
  '/verein',
  '/wer-wir-sind',
  '/mitgliedsantrag',
  '/kontakt',
  '/impressum',
  '/datenschutz',
] as const

/**
 * Waehrend der Wartung zeigen alle Inhaltsseiten denselben Text wie die
 * Startseite. Sie gehoeren deshalb nicht in die Sitemap - nur die drei Seiten
 * mit eigenem Inhalt.
 */
const MAINTENANCE_ROUTES = ['', '/impressum', '/datenschutz'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  if (MAINTENANCE_MODE) {
    return MAINTENANCE_ROUTES.map((route) => ({
      url: `${siteConfig.url}${route}`,
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.3,
    }))
  }

  return ROUTES.map((route) => ({
    url: `${siteConfig.url}${route}`,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.7,
  }))
}
