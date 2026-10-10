"""Rechnen lernen: alle Übungsseiten auf den Baukasten umstellen."""
import re
from legacy import run, frame, skin, buttons, Page

R = 'pages/rechnen_lernen/'
NARROW = ['potenzen/Schreibweise', 'potenzen/Zehnerpotenzen', 'potenzen/Addierensubtrahieren',
          'potenzen/Multiplizierendividieren', 'potenzen/Potenzieren', 'potenzen/Gemischt',
          'brueche/Addierensubtrahieren', 'brueche/Gemischt', 'brueche/Kuerzenerweitern',
          'brueche/Multiplizierendividieren', 'gleichungen/Abschlusstest', 'prozentrechnung/Prozentrechnung',
          'terme/Zusammenfassen', 'terme/Zusammenfassenpotenz', 'wurzeln/Wurzeln']
WIDE = ['gleichungen/Generator_Bruchgleichungen', 'gleichungen/Generator_Quadratisch', 'gleichungen/Generator_lineare',
        'prozentrechnung/Bezugskalkulation', 'prozentrechnung/Handelskalkdif', 'prozentrechnung/Handelskalkrw',
        'prozentrechnung/Handelskalkvw', 'TermeZusammenfassen', 'TermeMitPotenzen']

for f in NARROW:
    run(R + f + '.tsx', 'narrow')
for f in WIDE:
    run(R + f + '.tsx', 'wide')

# doppelte Überschriften (gab es zweimal untereinander)
for f in ['brueche/Kuerzenerweitern', 'potenzen/Gemischt']:
    p = Page(R + f + '.tsx')
    p.sub(r'\n[ \t]*<h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">[^<]*</h1>', '', count=1)
    p.save()

# Terme ohne Variablen: Überschrift war ein h2 in der Karte
p = Page(R + 'terme/Ohnevariablen.tsx')
frame(p, 'narrow', title='Terme ohne Variablen', h1=False, all_returns=True)
p.rep('        <h2 className="text-2xl font-bold text-blue-900 mb-2">Terme zusammenfassen</h2>\n', '')
skin(p)
buttons(p)
p.save()
