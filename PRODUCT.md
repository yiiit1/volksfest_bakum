# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Bürgerinnen und Bürger aus Bakum (Gemeinde Bakum, Landkreis Vechta) sowie der umliegenden Bauerschaften. Zielgruppe reicht von engagierten Jugendlichen und jungen Erwachsenen über Familien bis hin zu traditionsbewussten Dorfbewohnern und langjährigen Unterstützern, die sich im neu gegründeten Verein engagieren oder diesen durch ihre Mitgliedschaft unterstützen wollen.

## Product Purpose

Mitgliederakquise für den neu gegründeten Volksfestverein Bakum e.V. Die Website dient ausdrücklich der Gewinnung neuer aktiver und fördernder Vereinsmitglieder – nicht der Bewerbung des Volksfestes selbst (welches im Ort bereits allgemein bekannt und etabliert ist). Ziel ist es, Hemmschwellen abzubauen und den Vereinsbeitritt so unkompliziert, transparent und sympathisch wie möglich zu gestalten.

## Positioning

Ein herzlicher, authentischer und engagierter Dorfverein. Kein austauschbarer Eventveranstalter und kein unpersönliches Unternehmen, sondern ein lokales Gemeinschaftsprojekt von Nachbarn für Nachbarn, das das traditionsreiche Fest und das Dorfleben ehrenamtlich sichert und zukunftssicher aufstellt.

## Operating Context

Statische Webpräsenz, gehostet auf Cloudflare Pages. Aufruf überwiegend auf Smartphones (z.B. über WhatsApp-Weiterleitungen, Instagram, QR-Codes auf Flyern) sowie auf Desktop-Rechnern daheim beim Ausfüllen des Mitgliedsantrags.

## Capabilities and Constraints

- Feste inhaltliche Kernbereiche:
  1. Verein und was wir machen (Zweck, Gemeinschaft, Engagement)
  2. Wer wir sind (Vorstand mit Porträts, Ansprechpartner)
  3. Mitgliedsantrag (PDF zum Herunterladen, Ausfüllen und Unterschreiben – kein Online-Formular, Entscheidung 2026-09-23)
  4. Kontakt (direkter Draht zum Vorstand, mit Kontaktformular)
- Technischer Rahmen: Next.js (App Router), Tailwind CSS v4, statischer Cloudflare Pages Export (`output: 'export'`).
- Budget: Begrenzt (Dorfverein); langlebiges, wartungsarmes und leicht verständliches UI.
- Aktuelle Phase (2026-09-26): Entwurf C „Vereinsordner“ ist gewählt und als Website umgesetzt (siehe `DESIGN.md`). Texte, Fotos, Kontaktdaten und Rechtstexte sind noch Platzhalter und kommen vom Verein.

## Brand Commitments

- Name: Volksfestverein Bakum e.V.
- Logo: Schildwappen mit stilisiertem Festzelt, Ballons und modernem Schriftzug.
- Farbwelt: Frisches Grün / Smaragd / Petrol mit royalem Violett-/Magenta-Akzent aus dem Vereinslogo.
- Vorgabe des Kunden (Julian): Logo-Farben aufgreifen, aber nicht dominieren lassen (keine vollflächig grüne Wand); Anlehnung an die Gemeinde Bakum (modern, weißer Grund, gezielte grüne und farbliche Akzente, barrierearm und klar).

## Evidence on Hand

- `input/volksfest-bakum-briefing.md`: Umfassendes Auftrags- und Kontextbriefing aus dem Gespräch mit Vorstandsmitglied Julian.
- `input/Volksfest_Bakum_Logo_1zu1-3.pdf`: Vektorlogo des Vereins mit Festzelt, Ballons, Grün-Teal-Farbverlauf und Lila-/Violett-Akzentuierung.

## Product Principles

1. **Niedrigschwellige Einladung**: Jeder Bakumer soll sich sofort angesprochen fühlen. Keine formelle Behördensprache, keine elitäre Klub-Attitüde.
2. **Mitmachen im Mittelpunkt**: Die Interaktion zur Mitgliedschaft ist immer präsent, greifbar und in wenigen Schritten erfassbar.
3. **Dorf-Tradition trifft moderne Frische**: Bodenständig und heimatverbunden, aber mit modernem, responsivem und gepflegtem Webauftritt.
