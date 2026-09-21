import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Klassen zusammenfuehren - clsx fuer die Bedingungen, tailwind-merge fuer
 * die Konflikte (`p-2 p-4` -> `p-4`).
 *
 * Warum `extendTailwindMerge` und nicht das nackte `twMerge`:
 * tailwind-merge kennt nur die Standard-Skalen von Tailwind. Die eigenen
 * Tokens aus globals.css (`text-title`, `max-w-narrow`, `shadow-lifted`, …)
 * ordnet es deshalb falsch ein - `text-title` haelt es fuer eine Textfarbe,
 * weil `text-<wort>` in der Standardkonfiguration die Farbgruppe ist.
 *
 * Die Folge war real und lautlos: `cn('text-heading', 'text-foreground')`
 * lieferte nur `text-foreground` zurueck. Die Ueberschrift fiel auf 16 px,
 * ohne Fehler, ohne Warnung - der Build war gruen und die Seite falsch.
 *
 * Wer in globals.css einen Token in einem dieser Namensraeume ergaenzt
 * (`--text-*`, `--container-*`, `--shadow-*`, `--radius-*`), traegt ihn hier
 * mit ein. Sonst gilt wieder die falsche Einordnung.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // --text-* aus @theme. Ohne diesen Eintrag landen sie in der
      // Farbgruppe und heben sich gegenseitig mit text-foreground auf.
      'font-size': [{ text: ['display', 'title', 'heading', 'lead', 'quote', 'eyebrow'] }],
      // --container-* aus @theme. Damit gewinnt bei
      // `max-w-page max-w-narrow` wirklich die letzte Angabe.
      'max-w': [{ 'max-w': ['card', 'narrow', 'page', 'wide'] }],
      // --shadow-* aus @theme.
      shadow: [{ shadow: ['soft', 'lifted'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
