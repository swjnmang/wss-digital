"""Untermenüs auf die gemeinsame MenuPage umstellen (Texte, Reihenfolge und Pfade bleiben)."""
import re
from bk import ROOT

ICONS = {
    '/rechnen_lernen/terme/ohnevariablen': 'calculator', '/rechnen_lernen/terme/zusammenfassen': 'layer-group',
    '/rechnen_lernen/terme/mitpotenzen': 'superscript',
    '/rechnen_lernen/brueche/addierensubtrahieren': 'plus-minus', '/rechnen_lernen/brueche/multiplizierendividieren': 'xmark',
    '/rechnen_lernen/brueche/gemischt': 'shuffle',
    '/rechnen_lernen/potenzen/zehnerpotenzen': 'superscript', '/rechnen_lernen/potenzen/addierensubtrahieren': 'plus-minus',
    '/rechnen_lernen/potenzen/multiplizierendividieren': 'xmark', '/rechnen_lernen/potenzen/potenzieren': 'layer-group',
    '/rechnen_lernen/potenzen/gemischt': 'shuffle',
    '/rechnen_lernen/prozentrechnung/bezugskalkulation': 'truck', '/rechnen_lernen/prozentrechnung/handelskalkvw': 'arrow-right',
    '/rechnen_lernen/prozentrechnung/handelskalkrw': 'arrow-left', '/rechnen_lernen/prozentrechnung/handelskalkdif': 'scale-balanced',
    '/rechnen_lernen/gleichungen/quadratisch': 'superscript', '/rechnen_lernen/gleichungen/bruchgleichungen': 'divide',
    '/rechnen_lernen/gleichungen/abschlusstest': 'graduation-cap',
}


def convert(rel, title, subtitle=None):
    path = ROOT + rel
    s = open(path, encoding='utf-8').read()
    m = re.search(r"const (\w+) = \[(.*?)\n\];", s, flags=re.S)
    arr, body = m.group(1), m.group(2)
    entries = re.findall(r"\{(.*?)\}", body, flags=re.S)
    items = []
    for e in entries:
        f = dict(re.findall(r"(\w+):\s*'([^']*)'", e))
        icon = f.get('icon') or (('fa-solid fa-' + ICONS[f['path']]) if f['path'] in ICONS else None)
        items.append((f['title'], f.get('description', ''), f['path'], icon))
    lines = []
    for t, d, p, ic in items:
        extra = f", icon: '{ic}'" if ic else ''
        lines.append(f"  {{ title: '{t}', desc: '{d}', path: '{p}'{extra} }},")
    sub = f' subtitle="{subtitle}"' if subtitle else ''
    out = ("import MenuPage, { type MenuItem } from '%scomponents/layout/MenuPage';\n\n" % ('../' * rel.count('/'))
           + f"const {arr}: MenuItem[] = [\n" + '\n'.join(lines) + "\n];\n\n")
    fn = re.search(r"export default function (\w+)", s).group(1)
    out += f"export default function {fn}() {{\n  return <MenuPage title=\"{title}\"{sub} items={{{arr}}} />;\n}}\n"
    open(path, 'w', encoding='utf-8', newline='').write(out)
    print('ok', rel, len(items))


if __name__ == '__main__':
    R = 'pages/rechnen_lernen/'
    convert(R + 'Terme.tsx', 'Terme')
    convert(R + 'Brueche.tsx', 'Bruchrechnung')
    convert(R + 'Potenzen.tsx', 'Potenzrechnung')
    convert(R + 'Wurzeln.tsx', 'Wurzelrechnung')
    convert(R + 'Prozentrechnung.tsx', 'Prozentrechnung & Kalkulation')
    convert(R + 'Gleichungen.tsx', 'Gleichungen lösen')
    convert('pages/trigonometrie/AnwendungsaufgabenMenu.tsx', 'Anwendungsaufgaben', 'Wähle eine Aufgabe aus, um sie Schritt für Schritt zu bearbeiten.')
    convert('pages/daten_und_zufall/anwendungsaufgaben/index.tsx', 'Anwendungsaufgaben', 'Prüfungsnahe Aufgaben zu Daten und Zufall – wähle eine Aufgabe aus, um sie Schritt für Schritt zu bearbeiten.')
