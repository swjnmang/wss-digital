"""Finanzmathematik: Sonderfälle nach legacy.py (Videolinks, Seiten ohne einfache h1)."""
import re
from legacy import frame, skin, buttons, Page

F = 'pages/finanzmathe/'


def video_links(p):
    """<a href="youtu…" target="_blank">Lernvideo</a> → <VideoButton> (öffnet eingebettet)."""
    pat = r'<a href=(\{[^}]+\}|"https://youtu[^"]+") target="_blank" rel="noopener noreferrer" className="bk-btn([^"]*)">\s*([^<]+?)\s*</a>'

    def repl(m):
        url = m.group(1) if m.group(1).startswith('{') else '"' + m.group(1).strip('"') + '"'
        cls = ('bk-btn' + m.group(2)).replace(' flex items-center justify-center', '').replace(' flex items-center', '')
        return f'<VideoButton url={url} label="{m.group(3)}" className="{cls}" />'
    p.s, n = re.subn(pat, repl, p.s)
    if n:
        p.imp_video()
    return n


for f in ['Zinseszins', 'Annuitaetendarlehen', 'Ratendarlehen']:
    p = Page(F + f + '.tsx')
    print(f, video_links(p))
    p.save()

# Zinstage: Titel hängt vom Modus ab → bleibt als Zwischenüberschrift, Kopf zeigt den Menütitel
p = Page(F + 'Zinstage.tsx')
frame(p, 'narrow', title='Zinstage aus Datum berechnen', h1=False, all_returns=True)
p.rep('<h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-2 text-center">',
      '<h2 className="text-2xl font-extrabold text-ink mb-2 text-center">')
p.sub(r"(\{mode === 'practice' \? 'Zinstage berechnen üben' : 'Zinstage Rechner'\}\s*)</h1>", r'\1</h2>', count=1)
skin(p); buttons(p)
p.save()

# Escape Room
p = Page(F + 'EscapeRoomZinseszins.tsx')
frame(p, 'wide', title='Digitaler Escape Room', h1=False, all_returns=True)
p.sub(r'\n[ \t]*<h1 className="text-3xl font-bold text-purple-600 mb-2">\s*<i className="fa-solid fa-door-open mr-2"></i>Digitaler Escape Room\s*</h1>', '', count=1)
p.sub(r'\n[ \t]*<button\s+onClick=\{\(\) => navigate\(\'/finanzmathe/anwendungsaufgaben\'\)\}.*?</button>', '', count=1)
p.rep("import { useNavigate } from 'react-router-dom'\n", '')
p.rep("  const navigate = useNavigate()\n\n", '')
p.rep('bg-white rounded-lg shadow-lg p-8', 'bk-panel')
p.rep('text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6', 'bk-feedback bk-feedback-info block text-sm mb-6')
p.save()

# Prüfungsmodus: drei Ansichten (Start, Prüfung, Ergebnis)
p = Page(F + 'PruefungsModus.tsx')
frame(p, 'wide', title='Prüfungsmodus', h1=False, all_returns=True)
p.rep('        <h1 className="text-3xl font-bold text-center mb-2 text-blue-900">Prüfungsmodus</h1>\n', '')
p.s = re.sub(r'<h1 className="([^"]*)">', r'<h2 className="\1">', p.s)
p.s = p.s.replace('</h1>', '</h2>')
skin(p); buttons(p)
p.save()
