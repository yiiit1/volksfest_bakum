import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // Statischer Export fuer Cloudflare Pages: der Build erzeugt reine
  // HTML/CSS/JS-Dateien in out/ - kein Node-Server noetig.
  //
  // Was im Export NICHT funktioniert (siehe AGENTS.md):
  // Server Actions, Route Handlers, ISR, Middleware/Proxy sowie redirects()
  // und headers() aus dieser Datei. Ersatz: Cloudflare Pages Functions
  // (functions/), public/_redirects, public/_headers.
  output: 'export',

  // Explizit, weil der Wert sonst nur implizit gilt und Canonicals, Sitemap
  // und _redirects alle dieselbe Schreibweise brauchen: /about, nicht /about/.
  // Der Export legt trotzdem sowohl out/about.html als auch out/about/index.html
  // an - Cloudflare Pages liefert beide unter /about aus.
  trailingSlash: false,

  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Cloudflare Pages liefert nur Dateien aus; die Bildoptimierung von
    // Next.js braucht einen Server und ist im Export nicht verfuegbar.
    // Bilder werden also so ausgeliefert, wie sie in public/ liegen -
    // deshalb vorab auf sinnvolle Groesse und WebP/AVIF bringen.
    unoptimized: true,

    // Alternative: Cloudflare Images (kostenpflichtig, pro Projekt zu pruefen).
    // Dann `unoptimized` entfernen und stattdessen den Loader aktivieren:
    //
    // loader: 'custom',
    // loaderFile: './src/lib/cloudflare-image-loader.ts',
    //
    // src/lib/cloudflare-image-loader.ts:
    //   export default function cloudflareLoader({
    //     src, width, quality,
    //   }: { src: string; width: number; quality?: number }): string {
    //     const params = [`width=${width}`, `quality=${quality ?? 75}`, 'format=auto']
    //     return `/cdn-cgi/image/${params.join(',')}/${src.replace(/^\//, '')}`
    //   }
    //
    // Achtung: /cdn-cgi/image/ existiert nur auf der Cloudflare-Domain.
    // Lokal (npm run dev) laufen die URLs ins Leere - dort weiter unoptimized.
  },
}

export default withBundleAnalyzer(nextConfig)
