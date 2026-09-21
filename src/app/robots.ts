import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site-config'

// Fuer den statischen Export (Cloudflare Pages) noetig: ohne diese Angabe
// behandelt Next die Route als dynamisch und bricht den Export ab.
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  // Vorschau-Deployments (*.pages.dev eines Branches) sind oeffentlich
  // erreichbar. Sie duerfen nicht in den Index, sonst konkurrieren sie mit
  // der echten Domain um dieselben Inhalte.
  if (siteConfig.isPreview) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
