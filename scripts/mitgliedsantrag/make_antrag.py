# Baut den Mitgliedsantrag als PDF (A4, am Rechner ausfuellbar und zum Ausdrucken).
# Keine Beitraege oder Preise im Formular.
# Aufruf aus dem Projektordner: py scripts/mitgliedsantrag/make_antrag.py
# Ergebnis: public/downloads/mitgliedsantrag.pdf (verlinkt auf /mitgliedsantrag)
import os
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.pdfgen import canvas

b = os.path.dirname(os.path.abspath(__file__))
out = os.path.normpath(os.path.join(b, '..', '..', 'public', 'downloads', 'mitgliedsantrag.pdf'))
png = os.path.join(b, 'logo-trim.png')
im = Image.open(os.path.join(b, 'logo-trim.webp')).convert('RGBA'); im.thumbnail((640, 640)); im.save(png, optimize=True)

GREEN = HexColor('#028565'); INK = HexColor('#0f2e27'); SOFT = HexColor('#3e5a52'); RULE = HexColor('#9db8ad')
W, H = A4
M = 50
c = canvas.Canvas(out, pagesize=A4)
c.setTitle('Mitgliedsantrag – Volksfestverein Bakum e.V.')
c.setAuthor('Volksfestverein Bakum e.V.')
form = c.acroForm

# Kopf
lw = 150; lh = lw * 464 / 1134
c.drawImage(png, M, H - M - lh, lw, lh, mask='auto')
c.setFillColor(INK); c.setFont('Helvetica-Bold', 22)
c.drawRightString(W - M, H - M - 26, 'Mitgliedsantrag')
c.setFont('Helvetica', 10); c.setFillColor(SOFT)
c.drawRightString(W - M, H - M - 42, 'Volksfestverein Bakum e.V.')
y = H - M - lh - 14
c.setStrokeColor(GREEN); c.setLineWidth(2); c.line(M, y, W - M, y)

c.setFont('Helvetica', 10.5); c.setFillColor(INK)
y -= 28
c.drawString(M, y, 'Hiermit beantrage ich die Aufnahme in den Volksfestverein Bakum e.V.')

def field(name, label, x, y, w, tip=None):
    c.setFont('Helvetica-Bold', 8.5); c.setFillColor(SOFT)
    c.drawString(x, y + 22, label.upper())
    form.textfield(name=name, tooltip=tip or label, x=x, y=y, width=w, height=18,
                   borderWidth=0, fillColor=white, textColor=INK, fontName='Helvetica', fontSize=11)
    c.setStrokeColor(RULE); c.setLineWidth(.8); c.line(x, y, x + w, y)

cw = W - 2 * M; half = (cw - 20) / 2
y -= 52; field('vorname', 'Vorname', M, y, half); field('nachname', 'Nachname', M + half + 20, y, half)
y -= 46; field('strasse', 'Straße und Hausnummer', M, y, cw)
y -= 46; field('ort', 'PLZ und Ort', M, y, half); field('geburtsdatum', 'Geburtsdatum', M + half + 20, y, half)
y -= 46; field('email', 'E-Mail', M, y, half); field('telefon', 'Telefon', M + half + 20, y, half)

# Art der Mitgliedschaft
y -= 34
c.setFont('Helvetica-Bold', 8.5); c.setFillColor(SOFT); c.drawString(M, y, 'ART DER MITGLIEDSCHAFT')
y -= 24
for i, (val, txt) in enumerate([('aktiv', 'Aktives Mitglied'), ('foerdernd', 'Fördermitglied')]):
    x = M + i * (half + 20)
    form.radio(name='art', value=val, tooltip=txt, x=x, y=y - 3, size=14, buttonStyle='circle',
               borderColor=INK, fillColor=white, textColor=GREEN, borderWidth=1, selected=False)
    c.setFont('Helvetica', 11); c.setFillColor(INK); c.drawString(x + 22, y, txt)

# Erklaerung
y -= 40
c.setFont('Helvetica', 9.5); c.setFillColor(SOFT)
t = c.beginText(M, y); t.setLeading(13.5)
for line in ['Mit meiner Unterschrift erkenne ich die Satzung des Vereins an. Ich bin einverstanden, dass der Verein',
             'meine Angaben zur Mitgliederverwaltung speichert. Lorem ipsum dolor sit amet, consectetur adipiscing',
             'elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.']:
    t.textLine(line)
c.drawText(t)

# Unterschriften
y -= 86
field('ort_datum', 'Ort, Datum', M, y, half)
c.setFont('Helvetica-Bold', 8.5); c.setFillColor(SOFT); c.drawString(M + half + 20, y + 22, 'UNTERSCHRIFT')
c.setStrokeColor(INK); c.setLineWidth(.8); c.line(M + half + 20, y, W - M, y)
y -= 50
c.setFont('Helvetica-Bold', 8.5); c.setFillColor(SOFT)
c.drawString(M, y + 22, 'BEI MINDERJÄHRIGEN: UNTERSCHRIFT DER ERZIEHUNGSBERECHTIGTEN')
c.setStrokeColor(INK); c.line(M, y, W - M, y)

# Abgabe
y -= 52
c.setFillColor(HexColor('#f1f7f4')); c.setStrokeColor(HexColor('#f1f7f4'))
c.roundRect(M, y - 44, cw, 62, 6, fill=1, stroke=0)
c.setFillColor(INK); c.setFont('Helvetica-Bold', 10.5)
c.drawString(M + 16, y, 'Ausgefüllt und unterschrieben abgeben bei:')
c.setFont('Helvetica', 10.5); c.setFillColor(SOFT)
c.drawString(M + 16, y - 16, 'Volksfestverein Bakum e.V. · Lorem ipsum 12 · 49456 Bakum')
c.drawString(M + 16, y - 31, 'oder eingescannt per E-Mail an lorem@ipsum.de')

# Vom Verein auszufuellen
y -= 90
c.setStrokeColor(RULE); c.setDash(3, 3); c.line(M, y, W - M, y); c.setDash()
c.setFont('Helvetica-Bold', 8.5); c.setFillColor(SOFT); c.drawString(M, y - 18, 'VOM VEREIN AUSZUFÜLLEN')
c.setFont('Helvetica', 10); c.drawString(M, y - 40, 'Aufgenommen am: ______________    Mitgliedsnummer: ______________    Kürzel Vorstand: ________')

c.setFont('Helvetica', 8); c.setFillColor(SOFT)
c.drawString(M, 30, 'Entwurf · Texte teilweise Platzhalter')
c.drawRightString(W - M, 30, 'Volksfestverein Bakum e.V.')
c.save()
os.remove(png)
print(out, os.path.getsize(out) // 1024, 'KB')
