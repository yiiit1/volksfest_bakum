<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Projektspezifisches

- Projektregeln stehen in `CLAUDE.md` (Design, Architektur, DSGVO, SEO);
  die Grenzen des statischen Exports in `CLAUDE.md` Abschnitt 14.
- Die `README.md` ist die Anleitung fuer Menschen: Teil 1 richtet ein neues
  Kundenprojekt ein (Tokens, Fonts, Texte, site-config, Pflichtseiten),
  Teil 2 ist die Deployment-Checkliste fuer Cloudflare. Wer hier etwas
  aendert, das einen dieser Schritte betrifft, zieht die README mit.
- Der Umbauplan steht in `PLAN.md`.
- Ziel-Hosting ist **Cloudflare Pages als statischer Export** (`output: 'export'`,
  Output-Verzeichnis `out/`). Alles, was einen Node-Server braucht, funktioniert
  dort nicht: Server Actions, Route Handlers, ISR, `next/image`-Optimierung,
  `redirects()`/`headers()` aus `next.config.ts`, Middleware/Proxy.
  Ersatz: Cloudflare Pages Functions (`functions/`), `public/_redirects`,
  `public/_headers`.
- **Pages Functions** liegen unter `functions/`, geroutet ueber die Dateistruktur
  (`functions/api/contact.ts` -> `POST /api/contact`). Unterverzeichnisse mit
  fuehrendem Unterstrich (`_lib/`) exportieren keinen `onRequest`-Handler und
  werden nicht veroeffentlicht. Sie sind kein Next.js-Code: der Alias `@/`
  existiert dort nicht, gemeinsame Module werden relativ importiert.
  Lokal testen: `npm run build`, dann `npm run preview` (startet wrangler auf
  Port 8788; Secrets aus `.env.local` bzw. `.dev.vars`). Unter `npm run dev`
  gibt es die Route nicht - das Kontaktformular meldet dann "noch nicht
  eingerichtet".
- **Tests** laufen gegen den Build, nicht gegen den Dev-Server: `npm run test:e2e`
  baut und startet dieselbe Vorschau. Deshalb pruefen die E2E-Tests auch
  `_headers` und `/api/contact` mit. `npm run lint` umfasst das ganze Projekt,
  `npm run typecheck` auch `tests/e2e`.

## Design-System

- **Alle Design-Tokens stehen in `src/app/globals.css`**: Farben, typografische
  Skala (`text-display`, `text-title`, `text-heading`, `text-lead`, `text-quote`,
  `text-eyebrow`), Container-Breiten (`max-w-card|narrow|page|wide`), Schatten,
  Radien, Abschnitts-Rhythmus (`--section-space-*`) und Linienstaerken.
  Feste Groessen in Komponenten sind ein Fehler - stattdessen den Token
  benutzen oder einen neuen anlegen. Konkret: senkrechter Rhythmus ueber
  `<Section space>`, Breite ueber `<Container width>`, Ueberschriften ueber
  `<PageHeader>` / `<PageHeading>` (components/ui) bzw. `<SectionHeader>`
  (features/sections). `py-20`, `text-4xl` oder `max-w-2xl` am Element sind
  der Fehlerfall - sie wandern beim naechsten Kundenprojekt nicht mit.
  `PageHeader` benutzt bewusst kein `<Reveal>`: ein Seitenkopf steht beim
  Laden schon im Sichtbereich und muesste sonst den motion-Chunk mitziehen.
- **Welche Schriftstufe wohin**: die Skala waechst mit dem Viewport, nicht mit
  dem Kasten. `text-display` nur im Hero der Startseite, `text-title` im Kopf
  einer Unterseite ueber die volle Breite, `text-heading` in einer schmalen
  Karte (Wartungsseite, 404, Fehlerseite) und fuer jede `<h2>` im Fliesstext.
  `text-title` in einer 34-rem-Karte sind auf dem Desktop 52 px in 544 px -
  vier Zeilen Ueberschrift.
- **Eigene Tokens muessen in `src/lib/cn.ts` eingetragen sein.**
  tailwind-merge kennt nur die Standard-Skalen und haelt `text-title` sonst
  fuer eine Textfarbe: `cn('text-heading', 'text-foreground')` lieferte dann
  nur `text-foreground` - die Ueberschrift fiel lautlos auf 16 px, mit gruenem
  Build. Wer in globals.css einen `--text-*`, `--container-*` oder
  `--shadow-*`-Token ergaenzt, traegt ihn dort mit ein
  (Regressionstest: `src/lib/cn.test.ts`).
- **Hell/Dunkel** ueber `siteConfig.features.colorScheme` ('light' | 'auto' |
  'dark'). Der Wert landet als `data-theme` auf `<html>`, setzt `color-scheme`
  und entscheidet damit, welchen Zweig die `light-dark()`-Tokens nehmen. Es
  gibt bewusst nur einen Token-Block fuer beide Modi und keinen Umschalter in
  der Oberflaeche.
- **Sektionen**: eine Seite ist eine geordnete Liste in JSON
  (`src/content/home.json` → `sections`), gerendert von
  `@/features/sections/components/SectionList`. Sechs Arten: `hero`, `split`,
  `feature-grid`, `gallery`, `quote`, `cta`. Jede hat `id`, `space`, `tone`,
  `bordered`. Umordnen = Bloecke im JSON tauschen.
  Die Liste wird beim Build gegen `@/features/sections/schema` geprueft - ein
  Tippfehler bricht den Build ab statt still eine leere Seite zu erzeugen.
  Neue Art: Schema ergaenzen, Komponente anlegen, in `SectionList` eintragen
  (der `switch` ist erschoepfend, TypeScript meldet den fehlenden Fall).
- **Freies JSX bleibt erlaubt.** Die Sektionsliste ist eine Abkuerzung, kein
  Korsett - `src/app/about/page.tsx` ist absichtlich handgeschrieben. Auch
  diese Seiten benutzen aber Section/Container/PageHeader und die Tokens.
- **Neue Unterseite**: fuenf Stellen - Content-JSON, `src/app/<route>/page.tsx`
  (inklusive `MAINTENANCE_MODE`-Zweig, sonst ist der Wartungsmodus loechrig),
  `navigation` in `common.json`, `ROUTES` in `src/app/sitemap.ts`, dann
  `npm run build && npm run preview`. Ausfuehrlich in der README, Teil 1.
- **Oberflaechentexte stehen in `src/content/common.json`**, nicht im TSX:
  `a11y` (Sprunglink, Menue, Ladeanzeige), `notFound`, `error`, `map`,
  `cookieConsent`. Neue sichtbare Zeichenkette in einer Komponente heisst:
  erst einen Schluessel dort anlegen.
- **Bilder** laufen vor dem Einchecken durch `npm run images -- <dateien>`
  (skaliert, WebP, EXIF-Drehung, gibt den JSON-Block mit `width`/`height`
  aus). Grund: `images.unoptimized: true` - im Export verkleinert niemand
  etwas zur Laufzeit. Das Skript braucht `sharp` (devDependency) und laeuft
  bewusst nicht im Build mit.
- **Motion** unter `src/components/motion/`: `<Reveal>`, `<Stagger>`,
  `<Parallax>`, Werte in `tokens.ts`. Reveal und Stagger sichern
  `prefers-reduced-motion` ueber `<MotionConfig reducedMotion="user">` selbst
  ab; Parallax haengt am Scrollstand, wo MotionConfig nicht greift, und nutzt
  dafuer `usePrefersReducedMotion`. Ohne JavaScript macht der
  `<noscript>`-Block im Root-Layout alles sichtbar (`[data-motion]`).
  Achtung: `motion` ist mit ~48 kB (gzip) die groesste Abhaengigkeit im
  Client-Bundle. Der Chunk laedt nur auf Routen, die eine der drei
  Komponenten benutzen - die Startseite zahlt ihn, `/about` nicht. Beim
  Einbauen also mitdenken, ob die Seite die Bewegung wirklich braucht.

## Platzhalter, die pro Kundenprojekt ersetzt werden

- `src/app/icon.png` / `src/app/apple-icon.png` — generische Platzhalter in der
  Primaerfarbe. Durch das Kundenlogo ersetzen (512 x 512 bzw. 180 x 180).
- `src/content/*.json` — alle Texte, inklusive `impressum.json`,
  `datenschutz.json` und `wartung.json`.
- `src/lib/site-config.ts` und `.env.local` — Name und URL der Website.
- `public/_redirects` — nur Kommentare; Regeln pro Projekt eintragen.
- `src/app/globals.css` — Design-Tokens (`@theme`), siehe oben.
- `public/images/platzhalter-*.svg` — graue Blindbilder fuer Hero, Split und
  Galerie. Durch echte Motive ersetzen - `npm run images` erledigt Groesse,
  Format und die `width`/`height`-Angabe fuer das JSON.
