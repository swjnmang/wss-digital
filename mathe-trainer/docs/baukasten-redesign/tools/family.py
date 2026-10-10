"""Umstellung der „neuen“ Übungsseiten (Konstanten panel/btnPrimary/btnSecondary, Intro mit Video, sechs Aufgaben)."""
import re
from bk import Page

CONST = {
    'btnPrimary': "'bk-btn bk-btn-primary'",
    'btnSecondary': "'bk-btn'",
}


def consts(p):
    n = 0
    for name, val in CONST.items():
        p.s, k = re.subn(r"const %s\s*=\s*\n?\s*'[^']*'(;?)" % name, lambda m: f"const {name} = {val}{m.group(1)}", p.s, count=1); n += k
    def panel(m):
        center = 'text-center' in m.group(0)
        return f"const panel = '{'bk-panel text-center' if center else 'bk-panel'}'{m.group(1)}"
    p.s, k = re.subn(r"const panel\s*=\s*\n?\s*'[^']*'(;?)", panel, p.s, count=1); n += k
    # Eingabefelder: Breite behalten, Rahmen/Ecken aus dem Baukasten
    def inp(m):
        cls = m.group(2)
        keep = ' '.join(c for c in cls.split() if re.match(r'^(w-|min-w-|max-w-|text-center|text-right|text-left|flex-1|shrink-0)', c))
        return f"const {m.group(1)} = 'bk-input {keep}'{m.group(3)}"
    p.s, k = re.subn(r"const (\w*(?:input|Input|coord)\w*Cls|inputCls|coordCls)\s*=\s*\n?\s*'([^']*)'(;?)", inp, p.s); n += k
    return n


def videos(p):
    """Direkt eingebettete YouTube-iframes durch den Klick-Platzhalter ersetzen."""
    pat = (r'<div className="[^"]*aspect-video[^"]*">\s*<iframe\b(?:(?!/>).)*?src=(\{`[^`]+`\}|\{\w+\}|"[^"]+")'
           r'(?:(?!/>).)*?title="([^"]+)"(?:(?!/>).)*?/>\s*</div>')

    def repl(m):
        src = m.group(1)
        if src.startswith('"'):
            src = '{' + src + '}'
        return f'<VideoEmbed src={src} title="{m.group(2)}" />'
    p.s, n = re.subn(pat, repl, p.s, flags=re.S)
    if n:
        p.imp(f"import {{ VideoEmbed }} from '{p.up}components/VideoButton'")
    return n


def levels(p):
    # Schwierigkeits-Kacheln: Farben bleiben (Palette), dazu Baukasten-Kante und harter Schatten
    p.s, n = re.subn(r'className="rounded-xl (bg-\w+-\d00 hover:bg-\w+-\d00 text-white p-5) shadow-sm transition-colors"',
                     r'className="rounded-2xl \1 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"', p.s)
    return n


def wrappers(p, title, width):
    """min-h-screen-Rahmen + zentrierten Container durch TaskShell ersetzen (jeder return-Zweig)."""
    pat = re.compile(r'<div className="min-h-screen flex flex-col bg-slate-50">\s*<div className="mx-auto px-4 py-8 max-w-\w+ w-full(?P<rest>[^"]*)">')
    out, pos, count = '', 0, 0
    for m in pat.finditer(p.s):
        # Ende dieses return-Zweigs: schließende Klammer mit derselben Einrückung wie 'return ('
        ret = list(re.finditer(r'\n([ \t]*)return \(', p.s[:m.start()]))[-1]
        indent = ret.group(1)
        end = re.compile(r'\n' + indent + r'\);?[ \t]*(?=\n)').search(p.s, m.end())
        seg = p.s[m.end():end.start()]
        # die beiden letzten </div> (Container + Rahmen) ersetzen
        idx2 = seg.rfind('</div>')
        idx1 = seg.rfind('</div>', 0, idx2)
        seg = seg[:idx1] + '</div>' + seg[idx1 + 6:idx2] + '</TaskShell>' + seg[idx2 + 6:]
        rest = m.group('rest').strip()
        out += p.s[pos:m.start()] + f'<TaskShell title="{title}" width="{width}">\n        <div className="{rest}">' + seg
        pos = end.start()
        count += 1
    out += p.s[pos:]
    p.s = out
    if count:
        p.imp_shell()
    return count


def drop_h1(p):
    """Seitentitel-h1 entfernen (steht jetzt im farbigen Kopf)."""
    pat = r'\n\s*<h1 className="text-2xl font-bold text-slate-800 (?:mt-2 )?mb-2 text-center">\s*(?:(?!</h1>).)*?</h1>'
    p.s, n = re.subn(pat, '', p.s, flags=re.S)
    return n


SKIN = [
    # weiße Karten → Baukasten-Panel
    (r'bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200', 'bk-panel'),
    (r'bg-white rounded-xl shadow-md p-\d border border-slate-200', 'bk-panel'),
    (r'bg-white rounded-xl shadow-sm p-\d border border-slate-200', 'bk-panel'),
    # Lösungs-/Infokästen
    (r'border border-slate-200 rounded-lg p-4 bg-slate-50', 'bk-taskbox'),
    (r'rounded-lg border border-slate-200 bg-slate-50 p-4', 'bk-taskbox'),
    # Knöpfe
    (r'bg-blue-600 hover:bg-blue-700 (?:disabled:bg-slate-300 )?text-white font-bold py-2 px-\d rounded shadow(?:-sm)? transition-colors', 'bk-btn bk-btn-primary'),
    (r'bg-(?:gray|slate)-600 hover:bg-(?:gray|slate)-700 text-white font-bold py-2 px-\d rounded shadow(?:-sm)? transition-colors', 'bk-btn'),
    (r"px-4 py-1 rounded font-bold border \$\{([^?]+)\? 'bg-(?:blue-600|amber-400) (?:text-white border-blue-700|border-amber-500 text-white)' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'\}",
     r"bk-seg-btn ${\1? 'bk-seg-btn-on' : ''}"),
    # Rückmeldungen
    (r'bg-green-50 border border-green-300 text-green-800', 'bk-feedback bk-feedback-ok'),
    (r'bg-red-50 border border-red-300 text-red-800', 'bk-feedback bk-feedback-no'),
]


def skin(p):
    n = 0
    for pat, rep in SKIN:
        p.s, k = re.subn(pat, rep, p.s); n += k
    return n


def run(rel, title, width='narrow'):
    p = Page(rel)
    r = {'consts': consts(p), 'videos': videos(p), 'levels': levels(p), 'skin': skin(p), 'shell': wrappers(p, title, width), 'h1': drop_h1(p)}
    p.save()
    print('  ', r)
    return p


if __name__ == '__main__':
    LF = 'pages/lineare_funktionen/'
    run(LF + 'Ablesen.tsx', 'Funktionsgleichung ablesen')
    run(LF + 'Nullstellen.tsx', 'Nullstellen berechnen')
    run(LF + 'PunktGerade.tsx', 'Punkt auf Gerade prüfen')
    run(LF + 'Schnittpunkt.tsx', 'Schnittpunkt zweier Geraden')
    run(LF + 'SteigungAblesen.tsx', 'Die Steigung m ablesen')
    run(LF + 'SteigungBerechnen.tsx', 'Die Steigung m berechnen')
    run(LF + 'YAchsenabschnitt.tsx', 'y-Achsenabschnitt', 'wide')
    run(LF + 'Zeichnen.tsx', 'Lineare Funktionen zeichnen')
