# Design: Entwurf C „Vereinsordner“

Gewählt am 2026-09-26 aus drei Entwürfen (A Gemeinde-Linie, B Schaukasten,
C Vereinsordner) – die Wahl des Volksfestvereins. Entwürfe und Briefing sind
nicht im Projekt, sie liegen im Second Brain unter
`raw/entwuerfe/volksfest-bakum-entwuerfe/` (Original von C: `entwurf-c.html`,
läuft per Doppelklick ohne Internet).

## Die Idee

Julian wünschte sich „eine Hauptseite mit Logo und vier Reitern“. Entwurf C
nimmt das wörtlich: Die Website ist ein Ordner auf einem grünen Tisch. Oben
stehen die Registerreiter, darunter liegt das aufgeschlagene Blatt. Das
Deckblatt zeigt das Logo groß in Weiß.

Hauptziel der Website ist **Mitgliederwerbung**, nicht das Volksfest selbst.
Deshalb steht „Mitglied werden“ als einziger weißer Knopf auf dem Deckblatt.

## Farben

| Rolle                             | Wert      | Token        |
| --------------------------------- | --------- | ------------ |
| Tisch (Seitengrund)               | `#028565` | `desk`       |
| Blatt                             | `#014f3c` | `page`       |
| Kästen auf dem Blatt, Platzhalter | `#015f48` | `page-2`     |
| Geschlossener Reiter              | `#026c52` | `tab`        |
| Schrift                           | `#ffffff` | `ink`        |
| Nebenschrift                      | `#cdebe0` | `ink-soft`   |
| Trennlinien                       | Weiß 20 % | `rule`       |
| Register Verein                   | `#6fdcb5` | `register-1` |
| Register Wer wir sind             | `#8fcfd6` | `register-2` |
| Register Mitgliedsantrag          | `#b7bbe0` | `register-3` |
| Register Kontakt                  | `#dcb4e4` | `register-4` |

Die vier Registerfarben sind die aufgehellten Stufen der Linie unter
„BAKUM“ im Logo (Grün → Petrol → Lila). Das offene Register färbt die
Oberkante des Blatts und die kurze Linie unter der Seitenüberschrift.

**Regel aus der Entwurfsphase:** Logofarben nur in erkennbarer Form verwenden,
nicht stark abgedunkelt. Ein früherer Entwurf mit dunklem Lila wurde verworfen,
weil es nicht mehr nach Logo aussah und das Logo klein unterging.

## Schrift

Schibsted Grotesk, eine variable Schrift (400–900), lokal eingebunden.
Grundschrift 18 px. Überschriften sehr fett (800), leicht enger gesetzt.

| Stufe          | Einsatz                                          |
| -------------- | ------------------------------------------------ |
| `text-title`   | nur die große Überschrift auf dem Deckblatt      |
| `text-section` | Überschrift jeder Unterseite (mit Registerlinie) |
| `text-heading` | Zwischenüberschriften im Blatt                   |
| `text-lead`    | Vorspann unter der Überschrift                   |
| `text-small`   | Nebeninfos (Dateiangaben, Hinweise)              |

## Bausteine

- **Reiter**: Auf großen Bildschirmen mit vollem Namen, auf dem Handy oben
  festgeklebt mit Kurzform („Vorstand“, „Antrag“). Kein Aufklappmenü.
- **Knöpfe**: `primary` weiß mit dunkelgrüner Schrift für die eine
  Hauptaktion, `quiet` mit weißer Kontur für die zweite Wahl.
- **Formularfelder**: weiß mit dunkler Schrift; Fokus zeigt eine grüne
  Unterkante, Fehler eine rote.
- **Mitgliedsantrag**: als PDF-Blatt gezeigt, das aus dem Ordner kommt – kein
  Online-Formular, weil der Antrag eine Unterschrift braucht.
- **Bewegung**: nur das kurze Umblättern beim Seitenwechsel; aus bei
  „Bewegung reduzieren“.

## Vorgaben von Johannes

- Nüchtern und praktikabel, **kein Schnickschnack** wie Luftballons oder
  Wimpelketten.
- Keine Preise oder Beiträge auf der Website und im Antrag.
