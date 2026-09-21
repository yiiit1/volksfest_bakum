/**
 * Escaping fuer Werte, die in die Benachrichtigungs-Mail interpoliert werden.
 *
 * Hintergrund: die Vorlage aus `eiken-next` hat Name, E-Mail und Nachricht roh
 * in ein HTML-Template geschrieben. Wer dort `<img src=x onerror=...>` oder
 * einen fremden Link eintraegt, bekommt das im Postfach des Kunden gerendert -
 * das Formular ist ein oeffentliches Eingabefeld fuer beliebige Absender.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Macht einen Wert als HTML-Text ungefaehrlich. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character] ?? character)
}

/**
 * Wie `escapeHtml`, behaelt aber Zeilenumbrueche als `<br />`.
 * Fuer das Nachrichtenfeld, das mehrzeilig ist.
 */
export function escapeHtmlWithBreaks(value: string): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, '<br />')
}

/**
 * Reduziert einen Wert auf eine Zeile.
 *
 * Fuer Betreff und Anzeigenamen: Brevo nimmt JSON entgegen, ein klassischer
 * SMTP-Header-Injection-Angriff scheidet damit aus - ein Betreff mit
 * Zeilenumbruechen ist trotzdem unbrauchbar.
 */
export function singleLine(value: string): string {
  return value.replace(/[\r\n\t]+/g, ' ').trim()
}
