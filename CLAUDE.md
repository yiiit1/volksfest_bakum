# CLAUDE.md – Next.js / React Projekt

## Wie diese Datei verwenden

Diese CLAUDE.md ist die generische Basis für alle Next.js/React-Projekte (App Router, TypeScript, Tailwind CSS v4) auf Cloudflare Pages.

**Bei jedem neuen Projekt ausfüllen:**
- Abschnitt 1 → Projektvorgaben (Design, Farben, Fonts)
- Abschnitt 9 → Umgebungsvariablen eintragen

Alle anderen Abschnitte gelten unverändert für jedes Projekt.

**Zuerst lesen: Abschnitt 14.** Ausgeliefert wird ein statischer Export – das
schließt Server Actions, Route Handlers, ISR und Middleware aus und färbt auf
die Abschnitte 4, 5, 9 und 13 ab.

Die praktischen Schritte (neues Projekt aufsetzen, Deployment-Checkliste)
stehen in der README, die Eigenheiten dieses Repos in `AGENTS.md`.

---

## 1. Design & Ästhetik

### Grundprinzipien

- **Klare Designrichtung**: Vor dem Coden eine bewusste ästhetische Entscheidung treffen (minimal, editorial, organic, brutal, luxuriös, verspielt, …). Die Wahl konsequent durchhalten.
- **Typografie**: Keine generischen Systemfonts (Arial, Roboto, Inter) als alleinige Wahl. Einen charakterstarken Display-Font mit einem lesefreundlichen Body-Font kombinieren.
- **Farb- & Themenkonsistenz**: CSS-Variablen für alle Designtokens. Bevorzugt OKLCH-Farbraum für wahrnehmungsgerechte Abstufungen.
- **Motion**: Animationen gezielt einsetzen – lieber eine gut orchestrierte Seitenlade-Animation als viele zerstreute Micro-Interactions. Motion-Library für React nutzen.
- **Spatial Composition**: Bewusste Kompositionen – Asymmetrie, Überlappungen, großzügiger Negativraum oder kontrollierte Dichte.
- **Backgrounds & Visual Details**: Tiefe und Atmosphäre erzeugen statt reiner Volltonhintergründe (Texturen, Gradienten, Schatten, Grain-Overlays – passend zum Stil).

### Projektvorgaben (hier ergänzen)

```
Primäre Farben:    Tisch #028565 (Logo-Grün), Blatt #014f3c, Kästen #015f48,
                   Schrift weiß / #cdebe0; Registerfarben #6fdcb5 · #8fcfd6 ·
                   #b7bbe0 · #dcb4e4 (die vier Stufen der Logo-Linie)
Typografie:        Schibsted Grotesk (variabel 400–900) für alles, lokal
Bildstil:          Fotos vom Festplatz und Vorstand (folgen), Strichsymbole
Ästhetik:          Entwurf C „Vereinsordner“ – Julians „Hauptseite mit vier
                   Reitern“ wörtlich: Registerreiter über einem grünen Blatt,
                   Logo in Weiß groß auf dem Deckblatt. Nüchtern, kein
                   Festzelt-Schnickschnack.
```

Details und Regeln: `DESIGN.md`. Hex statt OKLCH, weil das die im Entwurf
abgenommenen Werte sind. Entwürfe und Briefings gehören nicht ins Repository
(liegen im Second Brain, siehe `.gitignore`).

---

## 2. Komponenten & Architektur

### Dateiorganisation

```
src/
├── app/                        # Next.js App Router (Routen, Layouts)
│   ├── (routes)/
│   │   └── {seite}/
│   │       ├── page.tsx        # Server Component
│   │       ├── loading.tsx     # Automatischer Loading-State
│   │       └── error.tsx       # Automatischer Error-State
│   └── layout.tsx
├── components/                 # Wirklich wiederverwendbare Komponenten
├── features/                   # Feature-Slices
│   └── {feature}/
│       ├── components/
│       ├── hooks/
│       ├── schema.ts           # Zod-Schema (teilbar mit functions/)
│       └── types/
├── content/                    # Alle Texte als JSON (siehe Abschnitt 3)
└── lib/                        # Utilities, Helpers

functions/                      # Cloudflare Pages Functions – außerhalb von src/,
└── api/                        # kein @/-Alias, relative Importe (siehe §5, §14)
```

### Komponenten-Regeln

- `React.FC<Props>` mit TypeScript, kein `any`, explizite Return-Types.
- Schwere Komponenten mit `next/dynamic` lazy laden (kein `React.lazy` – Next.js-Standard).
- Import-Alias ausschließlich `@/` (via `tsconfig.json` konfiguriert):
  - `@/components/…`, `@/features/…`, `@/lib/…`, `@/content/…`

### Styling

- **Tailwind-first**: Keine Inline-Styles, kein `sx`-Prop. Alles via Tailwind-Klassen.
- Bei komplexen dynamischen Styles: `clsx` oder `tailwind-merge` nutzen.
- Keine Style-Attribute direkt am Element außer für CSS-Variablen (`style={{ '--color': value }}`).

### State-Management-Hierarchie

Client-State in dieser Reihenfolge wählen – von einfach nach komplex:

1. **URL / Search Params** – für Filter, Sortierung, Pagination (SEO-freundlich, teilbar):
   ```tsx
   const searchParams = useSearchParams()
   const sort = searchParams.get('sort') ?? 'newest'
   ```
2. **`useState`** – für lokalen Komponenten-State (Modals, Toggles, Formularfelder).
3. **`zustand`** – für globalen Client-State (z.B. Warenkorb, Auth-Status) – nur einsetzen, wenn `useState` + Props-Drilling nachweislich zu komplex wird.

TanStack Query ist kein State-Manager, sondern ein **Server-State-Cache** – es ersetzt `zustand` nicht für UI-State.

---

## 3. Code/Content-Trennung

Alle Texte, Überschriften, Beschreibungen und statische Metadaten in JSON-Dateien auslagern – **nie hartcodiert in Komponenten**:

```json
// content/home.json
{
  "hero": {
    "title": "…",
    "subtitle": "…"
  },
  "meta": {
    "title": "… | Seitenname",
    "description": "…"
  }
}
```

Komponenten importieren Inhalte via `import content from '@/content/home.json'`.

**Vorteile**: Content-Updates ohne Code-Änderung, einfache spätere i18n-Integration.

---

## 4. Server vs. Client Components

### Entscheidungsregel

| Bedarf | Lösung |
|--------|--------|
| Datenabruf, Layout, statischer Inhalt | **Server Component** (Standard) |
| `useState`, `useEffect`, Event-Handler, Browser-APIs | **Client Component** (`'use client'`) |
| Beides in einer Route | **Split-Pattern**: Server-Parent + Client-Child |

### Wichtige Regeln

- **Kein `'use server'`.** Server Actions brauchen einen Node-Server; im statischen Export gibt es keinen (§14). `npm run build` bricht ab, sobald die Direktive unter `src/` auftaucht. Mutationen laufen über eine Cloudflare Pages Function unter `functions/`.
- Keine direkten Datenbankzugriffe in Client Components.
- Keine async Client Components.
- Keine sensitiven Daten (API-Keys, DB-Credentials) in Client Components – nur `NEXT_PUBLIC_`-Variablen sind dort erlaubt.

### Native Next.js Convention Files nutzen

Statt manueller Loading/Error-Logik die App-Router-Konventionen verwenden:

```
loading.tsx   →  automatisch bei Suspense-Grenzen (Server Components)
error.tsx     →  automatisch bei unbehandelten Fehlern (Client Component mit 'use client')
not-found.tsx →  automatisch bei notFound()
```

---

## 5. Datenabfrage & Mutationen

Grundlage ist der statische Export (§14): **alle Daten werden zur Build-Zeit
geholt.** Ein Deployment ist eine Momentaufnahme – neue Daten heißt neuer Build.

### Lesen (Server Components, Build-Zeit)

```typescript
// Standard: JSON aus src/content/ importieren (§3)
import content from '@/content/home.json'

// Externe Quelle: normales fetch in einer Server Component – läuft beim Build
const data = await fetch(url).then((r) => r.json())
```

- **Kein ISR** (`next: { revalidate }`) und **kein** `cache: 'no-store'` – beides
  braucht einen Server zur Laufzeit und wird im Export wirkungslos oder bricht
  den Build ab. Frische Daten kommen über einen erneuten Build (Deploy-Hook).
- `Promise.all()` für unabhängige Requests – keine sequenziellen Waterfalls.
- `React.cache()` für Deduplication innerhalb eines Build-Durchlaufs.

### Mutationen: Pages Function statt Server Action

Formulare und alles Schreibende laufen über `functions/` (Cloudflare Pages
Functions, Dateistruktur = Route). Vorlage: `functions/api/contact.ts`.

```typescript
// functions/api/kontakt.ts  ->  POST /api/kontakt
import { z } from 'zod'

const schema = z.object({ email: z.email(), message: z.string().min(1) })

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return Response.json({ error: 'invalid' }, { status: 400 })
  // … weiterverarbeiten, env.* liest die Secrets
}
```

- **Jeden Input mit Zod validieren** – das ist ein öffentlicher POST-Endpunkt,
  dem Client niemals vertrauen. Dasselbe Schema darf der Client mitbenutzen
  (`src/features/contact/schema.ts`), die Prüfung dort ist aber nur Komfort.
- Antworten roher Nutzereingaben immer escapen (HTML-Mails!), Secrets nur über
  `env`, **keine personenbezogenen Daten loggen**.
- Kein `revalidatePath()` / `revalidateTag()` – es gibt keinen Cache, der
  invalidiert werden könnte.
- `functions/` ist kein Next.js-Code: kein `@/`-Alias, relative Importe,
  `_lib/`-Verzeichnisse werden nicht als Route veröffentlicht.
- Lokal sichtbar nur über `npm run build && npm run preview` (wrangler), nicht
  unter `npm run dev`.

### Client-seitiges Fetching

Die Ausnahme, nicht der Normalfall: eine statisch exportierte Seite holt ihre
Daten beim Build. Erst wenn ein Teil der Seite wirklich im Browser nachladen
muss (eigene Pages Function, externe API), kommt TanStack Query dazu – und dann
`<QueryProvider>` so eng wie möglich um genau diesen Teil, nicht ins Root-Layout
(sonst zahlt jede Seite ~15 kB für nichts).

- `useSuspenseQuery` als primäres Pattern.
- Keine `isLoading`-Checks mit frühen Returns (vermeidet Layout-Shift).
- **Wichtig**: `useSuspenseQuery` erfordert zwingend eine `<Suspense>`-Grenze im Parent – sonst bricht die Hydration ab. Entweder explizit im Parent-Component oder via `loading.tsx` der Route:

```tsx
// Parent oder page.tsx
<Suspense fallback={<Skeleton />}>
  <MeineKomponenteMitSuspenseQuery />
</Suspense>
```

- `Promise.all()` für unabhängige parallele Requests – keine sequenziellen Waterfalls.

---

## 6. Routing

- **Ausschließlich Next.js App Router** – kein TanStack Router, keine Hash-Routes (`#`).
- Saubere URLs: `/about`, `/products/[slug]`, `/blog/[year]/[slug]`.
- Dynamische Segmente: `[slug]` für einzelne, `[...slug]` für catch-all, `(group)` für Layout-Gruppen ohne URL-Segment.
- `<Link href="…">` statt `<a>` für Client-seitige Navigation.

---

## 7. Bilder & Fonts

### Bilder – immer `next/image`

```tsx
// Niemals: <img src="…" />
// Immer:
import Image from 'next/image'
<Image src="…" alt="Beschreibung" width={800} height={600} />
// oder für fluid/fill-Layouts:
<Image src="…" alt="…" fill className="object-cover" />
```

- Liefert automatisch WebP, optimierte Größen, Lazy Loading und verhindert CLS.
- Deskriptive Dateinamen und immer `alt`-Text (nie leer außer bei rein dekorativen Bildern).

### Fonts – lokal, kein externes CDN

```typescript
// app/layout.tsx
import localFont from 'next/font/local'

const myFont = localFont({ src: '../public/fonts/font.woff2', variable: '--font-display' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${myFont.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
```

- Die `variable` **muss** via `className` an `<body>` (oder das Root-Element) übergeben werden – nur so erkennt Tailwind die CSS-Variable und fällt nicht auf den Fallback-Font zurück.
- Font-Dateien in `public/fonts/` ablegen.
- **Keine** Verbindung zu `fonts.googleapis.com` – DSGVO-Konformität.
- `next/font` übernimmt automatisch `font-display: swap` und Self-Hosting.

---

## 8. Tailwind CSS v4

### Konfiguration

- **CSS-first**: Theme-Definition via `@theme`-Direktive in CSS – keine `tailwind.config.js`.
- **Design-Tokens**: Semantische Namen (`--color-primary`, `--color-surface`, `--color-text`).
- **Spacing-Scale**: Standard Tailwind-Skala nutzen (`--spacing: 0.25rem`) – keine benutzerdefinierten `--spacing-sm` / `--spacing-xl` in `@theme` definieren, da diese sonst `max-w-*`-Klassen überschreiben.

### Layout-Patterns

- **Flexbox**: `flex items-center justify-center`, `flex flex-col gap-4`.
- **Grid**: `grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]` für responsive Kacheln.
- **Container Queries**: `@container`, `@sm:`, `@md:` für komponenten-interne Responsiveness (statt nur Viewport-Breakpoints).
- **Mobile-First**: Basis-Styles ohne Prefix, dann `md:`, `lg:`-Overrides.

### Dark Mode

- `.dark`-Klasse (manueller Theme-Switcher) oder `media` (System-Preference) – projektspezifisch wählen und konsequent durchhalten.
- Farb-Mapping für Hintergrund, Text und Borders in beiden Modi vollständig definieren.

---

## 9. Umgebungsvariablen & Secrets

### Konventionen

```bash
# .env.local – Build-Zeit-Variablen für Next.js (nie ins Git committen)
NEXT_PUBLIC_SITE_URL=…       # Auch client-seitig verfügbar (kein Secret!)

# .dev.vars – Laufzeit-Variablen der Pages Functions (nie ins Git committen)
BREVO_API_KEY=…              # Secret, liest nur functions/
```

- **Regel**: Alles ohne `NEXT_PUBLIC_`-Präfix bleibt ausschließlich server-seitig.
- **Zwei getrennte Welten**: `NEXT_PUBLIC_*` wird beim Build ins HTML/Bundle
  eingesetzt (`.env.local`, im Dashboard als Build-Variable). Die Secrets der
  Pages Functions liest erst die Laufzeit über `env` (`.dev.vars`, im Dashboard
  als Environment Variable). Ein Secret in `.env.local` erreicht `functions/`
  nicht – und umgekehrt.
- Secrets **niemals** in Client Components, `'use client'`-Dateien oder ins
  `env`-Objekt von `next.config.ts`.
- `.env.local` und `.dev.vars` in `.gitignore`. Beispieldatei `.env.example`
  (nur Platzhalter, nie echte Werte) ins Git committen.

### Projekt-Variablen

Beschreibung jeder Variablen steht in `.env.example`, Zuordnung zu Production
und Preview in der Deployment-Checkliste der README.

```
# Build-Zeit (öffentlich)
NEXT_PUBLIC_SITE_URL=             <z.B. https://example.com>
NEXT_PUBLIC_MAINTENANCE_MODE=     <true = nur Wartungsseite ausliefern>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=   <Captcha, Site Key>
NEXT_PUBLIC_CF_BEACON_TOKEN=      <optional: Cloudflare Web Analytics>

# Laufzeit der Pages Functions (Secrets)
BREVO_API_KEY=                    <Mailversand>
CONTACT_SENDER_EMAIL=             <in Brevo verifizierter Absender>
CONTACT_SENDER_NAME=              <optional>
CONTACT_RECEIVER_EMAIL=           <Empfängerpostfach>
TURNSTILE_SECRET_KEY=             <Captcha, serverseitige Prüfung>
```

Ohne diese Werte laufen `npm run dev` und der Build weiterhin durch – das
Formular meldet dann „nicht eingerichtet". Das ist Absicht: ein frisches
Projekt muss ohne Schlüssel startklar sein.

---

## 10. SEO & Metadata API

### `generateMetadata()` – der Next.js-Weg

```typescript
// app/about/page.tsx
import type { Metadata } from 'next'
import content from '@/content/about.json'

export const metadata: Metadata = {
  title: content.meta.title,              // 50–60 Zeichen, Keyword zuerst
  description: content.meta.description, // 150–160 Zeichen
  alternates: { canonical: '/about' },
  openGraph: { … },
}
```

- Statische Seiten: `export const metadata = { … }`.
- Dynamische Seiten (z.B. Blog-Posts): `export async function generateMetadata({ params })`.
- **Keine** manuellen `<meta>`-Tags im JSX – immer die Metadata API nutzen.

### Technisches SEO

- `robots.txt` und XML-Sitemap via `app/robots.ts` und `app/sitemap.ts` generieren.
- Canonical-Tags via `alternates.canonical` in der Metadata API setzen.
- Wichtige Seiten ≤ 3 Klicks erreichbar, HTTPS ohne gemischte Inhalte.

### Core Web Vitals

- LCP < 2,5 s · INP < 200 ms · CLS < 0,1.
- CLS vermeiden: `width`/`height` bei `<Image>`, keine dynamisch eingefügten Elemente über dem Fold.
- Responsive Design, Tap-Target-Größen ≥ 44 × 44 px, kein horizontaler Scroll.

### On-Page SEO

- Eine H1 pro Seite, logische Hierarchie (H1 → H2 → H3).
- Keyword in den ersten 100 Wörtern, Suchintent erfüllen.
- Bilder: deskriptive Dateinamen, Alt-Text, WebP (automatisch via `next/image`).

### E-E-A-T

- **Trustworthiness**: HTTPS, Impressum, Datenschutzerklärung, Kontaktinformationen.
- **Experience**: Eigene Einblicke, Fallstudien, originale Beispiele.
- **Authoritativeness**: Backlinks, Erwähnungen in der Branche.

---

## 11. Datenschutz & Privatsphäre (DSGVO)

1. **Lokale Fonts**: Via `next/font/local` – keine Verbindung zu `fonts.googleapis.com`.
2. **Kein Tailwind-CDN**: Build-Prozess mit PostCSS/Tailwind CLI – nie `cdn.tailwindcss.com`.
3. **Keine externen Tracker** (Analytics, Pixel) ohne explizite Nutzereinwilligung (Cookie-Consent-Banner). **Wichtig:** Das im Template enthaltene `CookieConsent.tsx` ist nur eine Basis-UI (Speicherung in localStorage). Es enthält standardmäßig kein Skript-Blocking oder granulare Auswahl. Bei echtem Bedarf an Tracking muss ein vollständiges Tag-Management (z. B. Cookiebot, Usercentrics oder eigene Blocking-Logik) integriert werden.
4. **Kontaktformular**: HTTPS, keine unnötige Datenspeicherung, Versand über die eigene Pages Function (§5) – kein fremder Formulardienst. Nutzereingaben serverseitig escapen, keine personenbezogenen Daten ins Log. Der Auftragsverarbeiter des Mailversands gehört in die Datenschutzerklärung.
5. **Karten (z. B. Google Maps) – Zwei-Klick-Lösung**:

```tsx
// features/map/components/Map.tsx
'use client'
export function Map() {
  const [showMap, setShowMap] = useState(false)
  if (!showMap) return (
    <div>
      <Image src="/map-preview.webp" alt="Kartenvorschau: Standort Musterstraße 1" fill />
      <p>Mit Klick auf „Karte anzeigen" werden Daten an Google übertragen.</p>
      <button onClick={() => setShowMap(true)}>Karte anzeigen</button>
    </div>
  )
  return <iframe src="https://maps.google.com/…" />
}
```

---

## 12. UI-Patterns & Accessibility

### Lade-/Fehlerzustände

- **Server Components**: `loading.tsx` und `error.tsx` Convention Files nutzen (automatisch, kein manueller Code).
- **Client Components**: Loading nur zeigen wenn keine Daten vorhanden (`loading && !data`). Skeleton bei bekannter Content-Form, Spinner bei unbekannter.
- **Fehler immer zeigen**: Toast für behebbare, Error-Banner für seitenbezogene, Full-Error-Screen für nicht behebbare Fehler.
- **Empty-State** für jede Liste mit kontextueller Handlungsaufforderung.

### Buttons & Formulare

- Buttons während async-Operationen deaktivieren (`disabled`) und Loading-Indicator zeigen.
- Validierung vor Absendung im Client, verbindlich aber erst in der Pages Function – dasselbe Zod-Schema auf beiden Seiten (§5).
- User-Feedback nach jeder Aktion via Toast-Notification.

### Accessibility

- **Semantisches HTML**: Korrekte Heading-Rangfolge, `alt`-Texte, ARIA-Labels wo nötig.
- **Farbkontrast**: ≥ 4,5:1 für normalen Text, ≥ 3:1 für große Texte (≥ 18 pt oder 14 pt bold).
- **Tastatur-Navigation**: Logische Fokus-Reihenfolge, sichtbare Focus-Styles (nie `outline: none` ohne Alternative).
- **Screen-Reader**: Aussagekräftige Link-Texte, keine leeren Buttons, `aria-live` für dynamische Inhalte.

---

## 13. Entwicklungsworkflow

### Code-Standards

- **TypeScript strict**: Kein `any`. Explizite Return-Types bei allen Funktionen.
- **ESLint/Prettier** konfiguriert und im CI erzwungen (kein Merge ohne grünen Check).
- **Commit-Messages**: Konventionell (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- **Tests**: Unit-Tests für Hooks/Utils (Vitest), Integrationstests für Komponenten (Testing Library), E2E für kritische User-Flows (Playwright).

### Build & Deployment

- **Framework**: Next.js mit App Router – kein Pages Router, kein Vite.
- **Ziel ist der Export-Build**, nicht `next dev`: geprüft wird `npm run build`
  plus `npm run preview` (wrangler). Die CI macht es genauso, siehe §14.
- **Bundle-Analyse** bei jedem Build: `@next/bundle-analyzer`.
- **Statische Assets**: Selbst gehostet in `public/` – kein unkontrolliertes externes CDN.
- **Performance-Budget**: Bundle-Größe monitoren, `next/dynamic` für schwere Drittanbieter-Komponenten.

---

## 14. Deployment: Cloudflare Pages

Ausgeliefert wird ein **statischer Export**: `output: 'export'` in
`next.config.ts`, Ergebnis in `out/`, gehostet auf Cloudflare Pages. Es gibt
**keinen Node-Server zur Laufzeit** – nur Dateien plus Cloudflare Pages
Functions (`functions/`, V8-Runtime, kein Node).

### Was dadurch nicht funktioniert

| Next.js-Feature                            | Ersatz                                             |
| ------------------------------------------ | -------------------------------------------------- |
| Server Actions (`'use server'`)             | Pages Function unter `functions/` (§5)             |
| Route Handlers (`app/api/**/route.ts`)      | dieselbe Pages Function                            |
| ISR / `revalidate` / `cache: 'no-store'`    | neuer Build (Deploy-Hook)                          |
| `redirects()` / `headers()` in der Config   | `public/_redirects` / `public/_headers`            |
| Middleware, `proxy.ts`                      | entfällt – wird kommentarlos ignoriert             |
| `next/image`-Optimierung                    | `images.unoptimized: true`; Bilder vorab aufbereiten (Cloudflare-Loader liegt auskommentiert bereit) |
| Dynamische Routen ohne `generateStaticParams` | Parameterliste zur Build-Zeit erzeugen           |

**Der Export warnt nicht zuverlässig.** Unter Next.js 15 lief ein Build mit
benutzter Server Action fehlerfrei durch – das Formular war still tot. Deshalb
hängt vor jedem `next build` die Prüfung `scripts/check-static-export.mjs` und
bricht bei `'use server'` unter `src/` ab.

### Regeln daraus

- **Neue Dynamik immer als Pages Function** (`functions/api/…`), nie als Route
  Handler oder Server Action.
- **Alles, was der Server sonst pro Request entscheiden würde, wird zur
  Build-Zeit entschieden** – Wartungsmodus, `noindex` für Vorschauen und
  Feature-Flags sind Compile-Zeit-Konstanten (`src/lib/maintenance.ts`,
  `src/lib/site-config.ts`).
- **Header und Weiterleitungen gehören nach `public/`.** Sie sind im
  Dev-Server unsichtbar; wer sie ändert, prüft mit `npm run preview`.
- **Vor „geht bei mir" steht `npm run preview`**: `npm run dev` kennt weder
  `/api/*` noch `_headers` noch `_redirects`.
- Vorschau-Deployments (`*.pages.dev`) sind öffentlich und liefern deshalb
  `noindex` (`CF_PAGES_BRANCH !== 'main'`).

**Für das Deployment selbst gibt es den Skill `cloudflare-pages-deploy`.** Er
liest das Projekt aus und baut daraus eine Anleitung zum Abhaken — mit den
Fallstricken, die bei Cloudflare Pages still versagen (Dashboard-Variablen, die
wegen `wrangler.toml` nicht ankommen; ein Produktions-Deployment ohne Domain, das
trotzdem indexierbar ist; `npx next build`, das die Export-Prüfung überspringt).
Vor dem ersten Deployment eines Projekts aufrufen.

Die Schritte zum Einrichten eines Cloudflare-Projekts (Build-Command,
Output-Dir, `NODE_VERSION`, Env-Vars, Domain) stehen in der README, Teil 2.

---

## 15. Prioritäten-Übersicht

| Priorität | Thema | Kernregel |
|-----------|-------|-----------|
| 0 | Hosting | Statischer Export – keine Server Actions, kein ISR, keine Middleware (§14) |
| 1 | Datenschutz | Lokale Fonts via `next/font`, Zwei-Klick-Maps, Cookie-Consent |
| 2 | Architektur | Code/Content trennen (JSON), Server- vs. Client Components korrekt splitten |
| 3 | Secrets | Kein Secret im Client-Bundle, `.env.local` nie committen |
| 4 | Routing | Nur App Router, keine Hash-Routes, `<Link>` statt `<a>` |
| 5 | Bilder | Immer `next/image`, nie `<img>` |
| 6 | Design | Klare Ästhetik, OKLCH-Palette, Tailwind-first, keine Inline-Styles |
| 7 | Performance | Waterfalls vermeiden, `Promise.all()`, `next/dynamic`, Bundle-Analyse |
| 8 | SEO | Metadata API, Core Web Vitals, Convention Files |
| 9 | Accessibility | Semantisches HTML, Kontrast, Tastatur-Navigation |

---

*Stack: Next.js (App Router, statischer Export) · React · TypeScript (strict) · Tailwind CSS v4 · Zod · Motion · Cloudflare Pages + Pages Functions · TanStack Query (optional)*
