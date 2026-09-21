import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site-config'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import common from '@/content/common.json'
import maintenance from '@/content/wartung.json'

// Fuer den statischen Export (Cloudflare Pages) noetig: ohne diese Angabe
// behandelt Next die Route als dynamisch und bricht den Export ab.
export const dynamic = 'force-static'

/**
 * Web-App-Manifest (/manifest.webmanifest).
 *
 * Damit bekommt die Seite beim "Zum Startbildschirm hinzufuegen" auf iOS und
 * Android einen richtigen Namen und ein Icon statt eines Screenshots mit
 * Domainnamen. Fuer eine klassische Website reicht `display: 'browser'` -
 * 'standalone' wuerde die Adresszeile ausblenden und damit auch den Weg
 * zurueck; das ergibt nur bei einer echten App Sinn.
 *
 * Die Icons kommen aus src/app/icon.png und src/app/apple-icon.png, die Next
 * beim Build nach /icon.png bzw. /apple-icon.png legt. Ein eigenes Maskable-
 * Icon (Android schneidet frei zu) lohnt erst, wenn das Logo bis an den Rand
 * geht - dann eine Variante mit Rand als /icons/maskable.png ergaenzen und
 * hier mit `purpose: 'maskable'` eintragen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: MAINTENANCE_MODE ? maintenance.brand : siteConfig.name,
    short_name: siteConfig.shortName,
    description: MAINTENANCE_MODE ? maintenance.meta.description : common.meta.description,
    lang: siteConfig.locale,
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: siteConfig.themeColor,
    theme_color: siteConfig.themeColor,
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
