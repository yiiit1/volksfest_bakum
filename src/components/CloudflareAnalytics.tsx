import Script from 'next/script'

/**
 * Cloudflare Web Analytics - optional, standardmaessig aus.
 *
 * Warum ausgerechnet dieser Dienst: er setzt keine Cookies, legt keine
 * Kennung im Browser ab und bildet keine geraetuebergreifenden Profile. Damit
 * faellt er weder unter Paragraph 25 TDDDG (Zugriff auf Endgeraete-
 * informationen) noch braucht er ein Zustimmungsbanner - im Gegensatz zu
 * Google Analytics, das beides ausloest und zusaetzlich einen Drittland-
 * transfer begruendet.
 *
 * Einschalten:
 *
 * 1. Cloudflare-Dashboard > Analytics & Logs > Web Analytics > Add a site.
 *    (Bei einem Pages-Projekt laesst sich der Beacon dort auch automatisch
 *    einspielen - dann diese Komponente NICHT zusaetzlich verwenden, sonst
 *    zaehlt jeder Aufruf doppelt.)
 * 2. Den Token als NEXT_PUBLIC_CF_BEACON_TOKEN in den Umgebungsvariablen des
 *    Cloudflare-Projekts hinterlegen (Production, nicht Preview - sonst
 *    verfaelschen eigene Testaufrufe die Zahlen).
 * 3. In public/_headers die beiden Cloudflare-Insights-Eintraege in der CSP
 *    aktivieren, sonst blockiert der Browser das Script stillschweigend.
 * 4. In der Datenschutzerklaerung erwaehnen. Auch ohne Zustimmungspflicht
 *    besteht die Informationspflicht nach Art. 13 DSGVO.
 *
 * Ohne Token rendert die Komponente nichts - kein Netzwerkaufruf, kein
 * zusaetzliches Byte im Bundle.
 */
export function CloudflareAnalytics(): React.ReactElement | null {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN?.trim()
  if (!token) return null

  return (
    <Script
      id="cloudflare-web-analytics"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      // Der Beacon liest seine Konfiguration aus diesem Attribut, nicht aus
      // der URL - deshalb JSON und nicht ein Query-Parameter.
      data-cf-beacon={JSON.stringify({ token })}
    />
  )
}
