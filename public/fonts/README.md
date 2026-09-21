# Fonts

Hier die projektspezifischen Schriftdateien als `.woff2` ablegen.

Empfohlene Konvention:

- `display.woff2` – Display-/Headline-Font
- `body.woff2` – Body-/Lesefont

Im Anschluss in `src/app/layout.tsx` die `localFont`-Aufrufe einkommentieren und Pfade ggf. anpassen. Die CSS-Variablen `--font-display-loaded` und `--font-body-loaded` werden in `src/app/globals.css` (`@theme`) bereits referenziert – damit greifen die Fonts automatisch in `font-sans` / `font-display`.

**DSGVO**: Keine Verbindung zu `fonts.googleapis.com` – nur lokale Fonts via `next/font/local`.
