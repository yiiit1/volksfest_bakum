# Volksfestverein Bakum e.V. – Website

Website des Volksfestvereins Bakum, gebaut nach Entwurf C „Vereinsordner“
(Gestaltung: `DESIGN.md`, Stand und offene Punkte: `AGENTS.md`).

> Der Rest dieser Datei ist die Anleitung aus der Vorlage. Teil 1 (neues
> Projekt einrichten) ist für dieses Projekt erledigt; Hinweise dort auf die
> Sektionsliste, `/about`, die Karte und die Motion-Bausteine beziehen sich
> auf die Vorlage – diese Teile sind hier entfernt. Teil 2 (Deployment) gilt
> unverändert.

## Aus der Vorlage: Website-Template (Next.js 16 + Tailwind v4, Cloudflare Pages)

Blaupause für neue Kundenprojekte. Ein neues Projekt braucht im Normalfall nur
noch Design-Tokens, Schriften, Texte und die Pflichtseiten — kein Code-Umbau.

Ausgeliefert wird ein **statischer Export** (`out/`) auf **Cloudflare Pages**.
Alles Dynamische läuft über **Pages Functions** (`functions/`), nicht über einen
Node-Server. Was das ausschließt, steht in `CLAUDE.md` §14.

## Setup

```bash
nvm use          # Node 22 (.nvmrc) – wrangler startet unter älteren Versionen nicht
npm install
cp .env.example .env.local
npm run dev
```

Dev-Server auf `http://localhost:3000`. Formular, Sicherheits-Header und
Weiterleitungen gibt es dort nicht — dafür `npm run build && npm run preview`
(wrangler auf `http://localhost:8788`, dieselbe Runtime wie Cloudflare).

---

# Teil 1 — Neues Projekt in fünf Schritten

### 1. Design-Tokens — `src/app/globals.css`

Der `@theme`-Block ist der Stellhebel: Farben (OKLCH, hell und dunkel in einer
Zeile über `light-dark()`), typografische Skala (`text-display`, `text-title`,
`text-heading`, `text-lead`, `text-quote`, `text-eyebrow`), Container-Breiten
(`max-w-narrow|page|wide`), Radien und Schatten. Darunter in `:root` der
Abschnitts-Rhythmus (`--section-space-*`) und die Linienstärken.

Feste Größen in Komponenten sind ein Fehler — Token benutzen oder einen neuen
anlegen. Keine eigenen `--spacing-*`-Tokens in `@theme` (die überschreiben still
die `max-w-*`-Utilities).

Das gilt für handgeschriebene Seiten genauso wie für die Sektionen: Rhythmus
über `<Section space="…">`, Breite über `<Container width="…">`, Überschriften
über `<PageHeader>` / `<PageHeading>` aus `components/ui`. Ein `py-20` oder
`text-4xl` direkt am Element wandert beim nächsten Projekt nicht mit — genau
das soll die Tokendatei ja leisten.

Hell/Dunkel wird **nicht** hier entschieden, sondern über
`siteConfig.features.colorScheme` (`'light' | 'auto' | 'dark'`). Bei einer
Farbänderung `themeColor` / `themeColorDark` in `site-config.ts` mitziehen — die
Werte hängen nicht automatisch zusammen.

### 2. Fonts — `public/fonts/` + `src/app/layout.tsx`

Eigene `.woff2`-Dateien nach `public/fonts/`, dann in `layout.tsx` die beiden
`localFont`-Aufrufe einkommentieren und die Variablen an `<body className=…>`
hängen. Ohne diesen Schritt greift der Fallback (Georgia / System-Sans) —
brauchbar, aber kein Endzustand.

Keine Google Fonts über das CDN (DSGVO, `CLAUDE.md` §7). Die Variablen heißen
`--font-display-loaded` / `--font-body-loaded`; `--font-display` und
`--font-sans` in `globals.css` lesen sie mit Fallback aus.

### 3. Texte & Sektionen — `src/content/*.json`

Kein Text gehört ins TSX (`CLAUDE.md` §3). `common.json` trägt Marke, Navigation
und Footer, dazu je Seite eine eigene Datei. Auch die Oberflächentexte stehen
dort: `a11y` (Sprunglink, Menü, Ladeanzeige), `notFound`, `error`, `map`,
`cookieConsent` — für eine Seite auf Englisch oder Plattdeutsch reicht diese
eine Datei.

Eine Seite ist eine geordnete **Sektionsliste** im JSON:

```jsonc
{ "sections": [{ "type": "hero", "title": "…", "space": "lg" }, …] }
```

Sechs Arten: `hero`, `split`, `feature-grid`, `gallery`, `quote`, `cta`. Jede
kennt `id`, `space`, `tone`, `bordered`. Umordnen heißt: Blöcke im JSON tauschen.
Die Liste wird beim Build gegen `src/features/sections/schema.ts` geprüft — ein
Tippfehler bricht den Build ab, statt still eine leere Seite zu erzeugen.

Neue Sektionsart: Schema ergänzen, Komponente anlegen, in `SectionList.tsx`
eintragen (der `switch` ist erschöpfend, TypeScript meldet den fehlenden Fall).
Freies JSX bleibt erlaubt — `src/app/about/page.tsx` ist absichtlich
handgeschrieben.

### 4. Site-Config — `src/lib/site-config.ts` + `.env.local`

`name`, `shortName`, `locale`, `themeColor`, `features` und der
`organization`-Block für die strukturierten Daten (JSON-LD). Die Angaben dort
müssen mit dem Impressum übereinstimmen — widersprüchliche Daten sind schlechter
als gar keine.

Die URL kommt nicht aus dieser Datei, sondern aus `NEXT_PUBLIC_SITE_URL` →
`CF_PAGES_URL` → `localhost:3000`. Lokal in `.env.local`, live im
Cloudflare-Dashboard (siehe Teil 2).

### 5. Pflichtseiten — Impressum & Datenschutz

`src/content/impressum.json` und `src/content/datenschutz.json` mit echten
Inhalten füllen (gerendert über `LegalContent.tsx`). Der Datenschutztext enthält
bereits Bausteine zu Brevo, Turnstile und Cloudflare — nur die weglassen, deren
Dienst im Projekt wirklich nicht läuft.

## Neue Unterseite anlegen

Fünf Stellen, immer dieselben. Die Reihenfolge ist die praktische:

**1. Inhalt — `src/content/<route>.json`**

```jsonc
{
  "meta": { "title": "Leistungen | Lorem Ipsum", "description": "…" },
  "hero": { "title": "Leistungen", "lead": "…" },
  "sections": [{ "type": "feature-grid", "title": "…", "items": [] }],
}
```

Der `sections`-Zweig ist optional — nur für Seiten aus Standardblöcken.

**2. Route — `src/app/<route>/page.tsx`**

Kürzeste Fassung für eine Seite aus Sektionen (`src/app/page.tsx` ist die
Vorlage), für freies JSX ist es `src/app/about/page.tsx`:

```tsx
import type { Metadata } from 'next'
import leistungen from '@/content/leistungen.json'
import { PageHeader } from '@/components/ui/PageHeader'
import { parseSections } from '@/features/sections/schema'
import { SectionList } from '@/features/sections/components/SectionList'
import { MAINTENANCE_MODE } from '@/lib/maintenance'
import { MaintenancePage } from '@/features/maintenance/components/MaintenancePage'

export const metadata: Metadata = MAINTENANCE_MODE
  ? { alternates: { canonical: '/' } }
  : {
      title: leistungen.meta.title,
      description: leistungen.meta.description,
      alternates: { canonical: '/leistungen' },
    }

export default function LeistungenPage(): React.ReactElement {
  if (MAINTENANCE_MODE) return <MaintenancePage />

  const sections = parseSections(leistungen.sections, 'content/leistungen.json')

  return (
    <>
      <PageHeader title={leistungen.hero.title} lead={leistungen.hero.lead} />
      <SectionList sections={sections} />
    </>
  )
}
```

Der `MAINTENANCE_MODE`-Zweig gehört in **jede** Inhaltsseite. Fehlt er, zeigt
die Seite während der Wartung ihren echten Inhalt — der Wartungsmodus wäre
löchrig, ohne dass es auffällt.

**3. Navigation — `src/content/common.json`**

Eintrag in `navigation` ergänzen. Nur was in die Hauptnavigation soll;
Pflichtseiten stehen unter `footer.links`.

**4. Sitemap — `src/app/sitemap.ts`**

Route in `ROUTES` eintragen. Das ist die Stelle, die am ehesten vergessen wird:
die Seite ist dann live, steht aber in keiner Sitemap. Falls die Seite während
der Wartung erreichbar bleiben soll, zusätzlich in `MAINTENANCE_ROUTES`.

**5. Prüfen**

```bash
npm run build && npm run preview
```

Ein Tippfehler im `type` einer Sektion bricht den Build ab — gewollt. Danach
`/sitemap.xml` im Browser gegenlesen und den Link in der Navigation klicken.

Was **nicht** nötig ist: `loading.tsx`, `error.tsx` und `not-found.tsx` liegen
im Root und gelten für alle Routen; `generateStaticParams` braucht nur eine
dynamische Route (`[slug]`).

## Bilder einbauen

Der Export läuft mit `images.unoptimized: true` — auf Cloudflare Pages gibt es
keinen Server, der Bilder zur Laufzeit verkleinert. `<Image>` liefert genau die
Datei aus, die in `public/` liegt. Ein Handyfoto mit 4 MB bleibt also 4 MB groß
und ruiniert den LCP-Wert.

Deshalb einmal durch das Skript schicken:

```bash
npm run images -- ~/Downloads/praxis-*.jpg
```

Das skaliert auf max. 1600 px Breite, schreibt WebP nach `public/images/`,
räumt Dateinamen auf (`Praxis Foto 01.JPG` → `praxis-foto-01.webp`), dreht
Handyfotos anhand des EXIF-Flags richtig herum und gibt am Ende den Block aus,
der ins Content-JSON gehört:

```json
{ "src": "/images/praxis-foto-01.webp", "alt": "", "width": 1600, "height": 1067 }
```

Der `alt`-Text bleibt leer — den schreibt ein Mensch (`CLAUDE.md` §7). Die
Maße stehen dort, weil sie Layout-Shift verhindern; sie müssen zur Datei
passen, sonst verzerrt das Bild.

Optionen: `--width 2400` für ein großformatiges Hero, `--format avif` für rund
20 % weniger Bytes bei deutlich längerer Kodierzeit, `--quality`, `--out`.
SVGs werden übersprungen — die sind schon skalierbar.

`npm run images` läuft bewusst **nicht** im Build mit: die Rohdateien liegen
meist gar nicht im Repository, und ein Build soll nichts erzeugen, was danach
committet werden müsste. Einmal aufrufen, Ergebnis einchecken.

### Danach noch, wenn es das Projekt betrifft

| Was                             | Wo                                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Favicon / App-Icon              | `src/app/icon.png` (512²), `src/app/apple-icon.png` (180²), danach `npm run favicon`                       |
| Bilder                          | `npm run images -- <dateien>` — skaliert, wandelt in WebP und gibt den JSON-Block mit `width`/`height` aus |
| Weiterleitungen (Domain, Umzug) | `public/_redirects` — enthält nur Kommentare, Regeln pro Projekt eintragen                                 |
| Sicherheits-Header              | `public/_headers` — CSP erweitern, sobald ein externer Dienst dazukommt                                    |
| Sitemap                         | `src/app/sitemap.ts` — neue Routen eintragen                                                               |
| Kontaktformular                 | läuft ohne Code-Änderung; braucht nur die Env-Variablen aus Teil 2                                         |
| Wartungsmodus                   | `NEXT_PUBLIC_MAINTENANCE_MODE=true` + `src/content/wartung.json`                                           |
| Cookie-Banner                   | `siteConfig.features.cookieConsent` — nur einschalten, wenn wirklich ein Tracker oder eine Einbettung lädt |
| Karte                           | `src/features/map/components/Map.tsx` (Zwei-Klick-Lösung), CSP-Eintrag nicht vergessen                     |

## Befehle

| Skript              | Zweck                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| `npm run dev`       | Dev-Server (`http://localhost:3000`) – ohne `/api/*` und ohne `_headers`  |
| `npm run build`     | Export-Prüfung + Produktions-Build nach `out/`                            |
| `npm run preview`   | `out/` in wrangler servieren (`http://localhost:8788`) – wie Cloudflare   |
| `npm run lint`      | ESLint über das ganze Projekt (`src/`, `functions/`, `tests/`, Configs)   |
| `npm run typecheck` | `tsc --noEmit`                                                            |
| `npm run format`    | Prettier über das Projekt (`format:check` prüft nur)                      |
| `npm run test`      | Vitest (Unit-Tests, Watch-Mode); `test:run` für einen einmaligen Lauf     |
| `npm run test:e2e`  | Build + Playwright gegen die Vorschau (einmalig `npx playwright install`) |
| `npm run analyze`   | Bundle-Analyse (`@next/bundle-analyzer`)                                  |
| `npm run favicon`   | `favicon.ico` aus `src/app/icon.png` erzeugen                             |
| `npm run images`    | Bilder skalieren + nach WebP/AVIF wandeln (`-- <datei\|ordner>`)          |

Die CI (`.github/workflows/ci.yml`) prüft genau das, was ausgeliefert wird:
Lint, Typecheck, Unit-Tests, den Export-Build und Playwright gegen die
wrangler-Vorschau — nicht gegen `next dev`.

## Verzeichnisstruktur

```
src/
├── app/                # Routen, Layouts, Convention-Files
│   ├── about/, kontakt/, impressum/, datenschutz/
│   ├── layout.tsx, page.tsx
│   ├── loading.tsx, error.tsx, not-found.tsx
│   ├── robots.ts, sitemap.ts, manifest.ts, opengraph-image.tsx
│   ├── icon.png, apple-icon.png, favicon.ico
│   └── globals.css     # @theme – Design-Tokens
├── components/
│   ├── ui/             # Button, ButtonLink, Container, Section, PageHeader
│   ├── motion/         # Reveal, Stagger, Parallax + tokens.ts
│   ├── Navigation.tsx, Footer.tsx, JsonLd.tsx, LegalContent.tsx
│   └── CookieConsent.tsx, CloudflareAnalytics.tsx, CurrentYear.tsx
├── features/
│   ├── sections/       # Sektions-Schema + die sechs Sektionsarten
│   ├── contact/        # ContactForm + Turnstile + Zod-Schema (kein Server-Code)
│   ├── maintenance/    # Wartungsseite (Shell + Legal-Variante)
│   └── map/            # Two-Click-Map
├── content/            # Texte als JSON (CLAUDE.md §3)
├── lib/                # cn(), site-config, maintenance, structured-data
└── providers/          # QueryProvider – bewusst nicht im Root-Layout

functions/api/          # Cloudflare Pages Functions (contact.ts, _lib/)
scripts/                # check-static-export, make-favicon, optimize-images, preview-test
tests/e2e/              # Playwright-Specs (laufen gegen out/ in wrangler)
public/
├── _headers, _redirects
├── fonts/              # .woff2 (lokal, kein CDN)
└── images/
```

`functions/` ist **kein** Next.js-Code: der Alias `@/` existiert dort nicht,
gemeinsame Module werden relativ importiert. Unterverzeichnisse mit führendem
Unterstrich (`_lib/`) werden nicht als Route veröffentlicht.

---

# Teil 2 — Deployment-Checkliste (Cloudflare Pages)

Erst durchgehen, wenn die Website steht. Bis dahin ist nichts auf Cloudflare
angelegt und kein Schlüssel erzeugt.

### 1. Schlüssel und Konten vorbereiten

- [ ] **Brevo**: Konto vorhanden, Absenderadresse verifiziert (unverifiziert →
      HTTP 400 beim Versand), **AV-Vertrag abgeschlossen** (Voraussetzung für
      den DSGVO-konformen Betrieb), API-Key v3 erzeugt.
- [ ] **Turnstile**: im Cloudflare-Dashboard unter _Turnstile_ ein Widget für
      die Domain anlegen → Site Key (öffentlich) + Secret Key.
- [ ] Beide Schlüssel **nie** in `.env.example` oder ins Git. Dort nur
      Platzhalter, echte Werte in `.env.local` / `.dev.vars` / im Dashboard.

### 2. Pages-Projekt anlegen

Cloudflare-Dashboard → _Workers & Pages_ → _Create_ → _Pages_ → GitHub-Repo
verbinden.

| Einstellung            | Wert                         |
| ---------------------- | ---------------------------- |
| Framework preset       | Next.js (Static HTML Export) |
| Build command          | `npm run build`              |
| Build output directory | `out`                        |
| Root directory         | Projektordner im Repo        |
| Production branch      | `main`                       |

- [ ] **`NODE_VERSION` = `22`** als Umgebungsvariable setzen (muss zu `.nvmrc`
      passen; ohne die Angabe baut Cloudflare mit einer veralteten Node-Version).
- [ ] **Automatische Deployments aktivieren.** Bei Tina-Projekten zwingend:
      Kunde speichert → Commit → Rebuild → live. Stehen sie auf _Disabled_,
      passiert nach dem Speichern nie etwas. Alternativ ein Deploy-Hook.

### 3. Umgebungsvariablen eintragen

_Settings → Environment variables_, **Production und Preview getrennt**:

| Variable                         | Umgebung       | Anmerkung                                                                                                                                                              |
| -------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | nur Production | echte Domain. In Preview leer lassen, sonst bauen Vorschauen mit Produktions-Canonicals                                                                                |
| `NEXT_PUBLIC_MAINTENANCE_MODE`   | beide          | `true` = nur die Wartungsseite ausliefern. Steht der Wert schon in einer mitversionierten `.env.production`, hier weglassen — sonst gewinnt still die Dashboard-Angabe |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | beide          | öffentlich, landet im Bundle                                                                                                                                           |
| `TURNSTILE_SECRET_KEY`           | beide          | Secret, nur die Pages Function liest ihn                                                                                                                               |
| `BREVO_API_KEY`                  | beide          | Secret                                                                                                                                                                 |
| `CONTACT_SENDER_EMAIL`           | beide          | in Brevo verifizierter Absender                                                                                                                                        |
| `CONTACT_SENDER_NAME`            | optional       | ohne Angabe wird die Absenderadresse benutzt                                                                                                                           |
| `CONTACT_RECEIVER_EMAIL`         | beide          | Postfach für die Anfragen                                                                                                                                              |
| `NEXT_PUBLIC_CF_BEACON_TOKEN`    | nur Production | nur falls Web Analytics genutzt wird und der Beacon **nicht** automatisch eingespielt ist (sonst doppelte Zählung)                                                     |
| `NODE_VERSION`                   | beide          | `22`                                                                                                                                                                   |

Vollständige Beschreibung jeder Variablen: `.env.example`.

Fehlt eine der Server-Variablen, antwortet das Formular mit „nicht
eingerichtet" — Build und Seite laufen trotzdem. Das ist Absicht, aber vor dem
Livegang zu prüfen.

### 4. Domain

- [ ] Custom Domain in _Custom domains_ eintragen (Apex und/oder `www`).
- [ ] In `public/_redirects` die Regel www ↔ Apex einkommentieren und die
      Domain eintragen — sonst liefert Cloudflare beide Varianten aus
      (Duplicate Content).
- [ ] Beim Umzug von einer alten Website: alte URLs aus deren `sitemap.xml`
      bzw. der Search Console nach `_redirects` (301). Umlaut-URLs zusätzlich
      prozentkodiert eintragen.

### 5. Nach dem ersten Deployment prüfen

- [ ] `curl -sI https://<domain>/ | sort` — die Header aus `_headers` kommen an
      (CSP, HSTS, X-Frame-Options); Gegenprobe auf securityheaders.com.
- [ ] Formular real abschicken: Mail kommt an, Turnstile greift, Erfolgs- und
      Fehlerfall sehen sinnvoll aus.
- [ ] `https://<domain>/robots.txt` und `/sitemap.xml` erreichbar, mit der
      echten Domain darin (nicht `localhost`, nicht `*.pages.dev`).
- [ ] Ein Vorschau-Deployment aufrufen: muss `noindex` liefern.
- [ ] Weiterleitungen stichprobenartig testen (`curl -sI` auf alte URLs).
- [ ] Google Search Console: Domain verifizieren, Sitemap einreichen.

---

## Stack

Next.js 16 (App Router, `output: 'export'`) · React 19 · TypeScript strict ·
Tailwind CSS v4 · Zod 4 · Motion · Vitest · Playwright · Cloudflare Pages +
Pages Functions · Brevo · Turnstile

TanStack Query liegt bereit (`src/providers/QueryProvider.tsx`), hängt aber
bewusst nicht im Root-Layout — eine statisch exportierte Seite lädt im Normalfall
nichts im Browser nach.

Designprinzipien, Architekturregeln und die Grenzen des statischen Exports:
`CLAUDE.md`. Arbeitshinweise für Agenten: `AGENTS.md`. Umbauplan: `PLAN.md`.
