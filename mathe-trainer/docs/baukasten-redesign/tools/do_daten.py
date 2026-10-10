"""Daten und Zufall: alle Übungsseiten auf den Baukasten umstellen."""
import re
from legacy import run, frame, skin, buttons, videos, Page

D = 'pages/daten_und_zufall/'

# Anwendungsaufgaben: klassischer Rahmen mit h1
for f in ['BioKiste', 'Elfmeterschiessen', 'Fahrradstation', 'MensaUmfrage', 'Sommerfest', 'Ticketkontrolle']:
    run(D + 'anwendungsaufgaben/' + f + '.tsx', 'wide')

# Absolute und relative Häufigkeit: eigener Kopf mit Zurück-Link
p = Page(D + 'RelativeAbsoluteHaeufigkeit.tsx')
p.sub(r'\n[ \t]*<header className="bg-white shadow-sm sticky top-0 z-10">.*?</header>\n', '\n', count=1)
frame(p, 'wide', title='Absolute und relative Häufigkeit', h1=False, all_returns=True)
p.rep('<main className="max-w-6xl mx-auto px-4 py-8">', '<main>')
skin(p); buttons(p)
p.save()

# Seiten mit Karten-Kopf (h2) im Container „container mx-auto p-4 space-y-6“
CARD = [('StatistischeKennwerte', 'Statistische Kennwerte'),
        ('Baumdiagramme', 'Wahrscheinlichkeiten mit Baumdiagrammen'),
        ('Baumdiagramme2', 'Interaktives Baumdiagramm-Training'),
        ('DiagrammeErstellen', 'Diagramme erstellen')]
for f, title in CARD:
    p = Page(D + f + '.tsx')
    frame(p, 'wide', title=title, h1=False, all_returns='className="container mx-auto p-4 space-y-6"')
    # Kartenkopf, der nur den Seitentitel (ggf. mit Symbol) enthält, entfällt
    p.s = re.sub(r'\n[ \t]*<div className="p-6 border-b border-gray-200(?: flex items-center gap-2)?">\s*(?:<\w+ className="w-6 h-6 text-blue-600" />\s*)?'
                 r'<h2 className="text-2xl font-bold text-gray-800">' + re.escape(title) + r'</h2>\s*</div>', '', p.s)
    p.s = p.s.replace(f'<h2 className="text-3xl font-bold text-gray-800 mb-8">{title}</h2>\n', '')
    p.s = p.s.replace('className="container mx-auto p-4 space-y-6"', 'className="space-y-6"')
    p.s = p.s.replace('bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden', 'bk-panel !p-0 overflow-hidden')
    p.s = p.s.replace('bg-white rounded-lg shadow-md p-8 text-center', 'bk-panel text-center')
    skin(p); buttons(p); videos(p)
    p.save()

# Wahrscheinlichkeiten: großer Kartenrahmen mit h1
p = Page(D + 'Wahrscheinlichkeiten.tsx')
frame(p, 'wide')
p.rep('bg-white rounded-2xl shadow-lg p-6 space-y-6', 'space-y-6')
skin(p); buttons(p)
p.save()
