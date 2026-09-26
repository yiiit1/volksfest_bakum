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

## Design-System (Entwurf C „Vereinsordner“)

- **Gestaltung und Regeln stehen in `DESIGN.md`**, die Tokens in
  `src/app/globals.css`. Entwuerfe, Briefings und Ausgangsmaterial gehoeren
  nicht ins Repository - sie liegen im Second Brain und sind per `.gitignore`
  (`input/`, `design/`, `entwuerfe/`, `PRODUCT.md`) ausgeschlossen.
- **Aufbau**: `src/components/binder/Binder.tsx` legt um jede Seite den Ordner -
  Registerreiter (`src/components/Navigation.tsx`) plus das Blatt
  (`<main id="inhalt">`). Die Reiter kommen aus `registers` in
  `src/content/common.json`; `data-register` am Ordner setzt die Farbe des
  offenen Registers (`--register`), die Oberkante des Blatts und die Linie
  unter der Ueberschrift uebernehmen sie.
- **Bausteine** in `src/components/ui/`: `PageTitle` + `Lead` (Kopf jeder
  Unterseite, genau ein `<h1>`), `ButtonLink`/`Button` (`primary` weiss,
  `quiet` Kontur), `Icon` (Strichsymbole aus dem Entwurf), `Placeholder`
  (Bildplatzhalter, bis der Verein Fotos liefert).
- **Schriftstufen**: `text-title` nur fuer die Ueberschrift des Deckblatts,
  `text-section` fuer die Ueberschrift jeder Unterseite, `text-heading` fuer
  `<h2>` im Blatt, `text-lead` fuer den Vorspann, `text-small` fuer Nebeninfos.
- **Eigene Tokens muessen in `src/lib/cn.ts` eingetragen sein.**
  tailwind-merge kennt nur die Standard-Skalen und haelt `text-title` sonst
  fuer eine Textfarbe: `cn('text-heading', 'text-foreground')` lieferte dann
  nur `text-foreground` - die Ueberschrift fiel lautlos auf 16 px, mit gruenem
  Build. Wer in globals.css einen `--text-*`, `--container-*` oder
  `--shadow-*`-Token ergaenzt, traegt ihn dort mit ein
  (Regressionstest: `src/lib/cn.test.ts`).
- **Nur ein Farbmodus.** Die Seite ist immer dunkelgruen; `color-scheme`
  steht bewusst auf `light`, damit Haekchenfeld und Formularfelder weiss
  bleiben (siehe Kommentar in globals.css).
- **Seiten**: `/` (Deckblatt), `/verein`, `/wer-wir-sind`, `/mitgliedsantrag`,
  `/kontakt`, dazu `/impressum` und `/datenschutz` (ohne Reiter, Blatt weiss
  gerandet). Jede Seite hat ein eigenes Content-JSON unter `src/content/`.
- **Neues Register** (sollte selten sein - vier Reiter sind Julians Vorgabe):
  Content-JSON, `src/app/<route>/page.tsx` (inklusive `MAINTENANCE_MODE`-Zweig),
  Eintrag in `registers` in `common.json`, Farbe in `TAB_COLOR` und
  `[data-register]` (globals.css), `ROUTES` in `src/app/sitemap.ts`, dann
  `npm run build && npm run preview`.
- **Mitgliedsantrag** ist ein PDF, kein Online-Formular:
  `public/downloads/mitgliedsantrag.pdf`, gebaut mit
  `py scripts/mitgliedsantrag/make_antrag.py` (braucht `reportlab` und
  `Pillow`). Texte darin sind noch teilweise Platzhalter.
- **Oberflaechentexte stehen in `src/content/common.json`**, nicht im TSX:
  `a11y`, `registers`, `footer`, `placeholder`, `notFound`, `error`,
  `cookieConsent`. Neue sichtbare Zeichenkette in einer Komponente heisst:
  erst einen Schluessel dort anlegen.
- **Bilder** laufen vor dem Einchecken durch `npm run images -- <dateien>`
  (skaliert, WebP, EXIF-Drehung, gibt den JSON-Block mit `width`/`height`
  aus). Grund: `images.unoptimized: true` - im Export verkleinert niemand
  etwas zur Laufzeit. Das Skript braucht `sharp` (devDependency) und laeuft
  bewusst nicht im Build mit.
- **Bewegung** gibt es nur eine: das kurze Umblaettern (`animate-turn`) beim
  Seitenwechsel, reine CSS-Animation, abgeschaltet bei
  `prefers-reduced-motion`. Die Motion-Bibliothek ist entfernt.

## Was vor dem Livegang noch ersetzt werden muss

- **Alle Texte sind Blindtext** (Lorem ipsum) - bewusst, damit nur das Design
  beurteilt wurde. Echte Texte vom Verein in `src/content/*.json`.
- **Fotos**: Festplatz (Deckblatt) und Vorstandsportraets sind `Placeholder`.
  Echte Bilder durch `npm run images -- <dateien>`, dann `<Image>` einsetzen.
- **Kontaktdaten** (Anschrift, E-Mail, Telefon) in `kontakt.json`,
  `vorstand.json`, `site-config.ts` (`organization`) und im Antrags-PDF.
- **Impressum und Datenschutz** (`impressum.json`, `datenschutz.json`) noch aus
  der Vorlage - Vereinsangaben (Vorstand, Registergericht, VR-Nummer) fehlen.
- `public/_redirects` - nur Kommentare; Regeln pro Projekt eintragen.
