"""Umstellung der „klassischen“ Übungsseiten (Rechnen lernen, Finanzmathe, Quadratische Funktionen,
Daten und Zufall, Trigonometrie-Sonderseiten) auf den Baukasten – nur Darstellung.

- frame():   äußeren Seitenrahmen (min-h-screen/Verlauf/zentrierte Karte) durch <TaskShell> ersetzen,
             die Seiten-h1 wandert in den farbigen Kopf.
- skin():    häufige Tailwind-Muster (Karten, Knöpfe, Rückmeldungen) auf bk-Bausteine abbilden.
- videos():  YouTube-iframes → <VideoEmbed> (lädt erst beim Klick), window.open-Knöpfe → <VideoButton>.

Jede Ersetzung arbeitet nur auf Klassen/Rahmen-Elementen; Texte, Zustände, Prüflogik bleiben unberührt.
"""
import re
import sys
from bk import Page
from family import videos as family_videos

DROP_OUTER = re.compile(
    r'^(min-h-screen|min-h-\[[^\]]+\]|bg-[\w\[\]\(\)\-\./#]+|from-\S+|via-\S+|to-\S+|p[xytblr]?-\S+|sm:p[xytblr]?-\S+|md:p[xytblr]?-\S+|'
    r'lg:p[xytblr]?-\S+|xl:p[xytblr]?-\S+|mx-auto|max-w-\S+|sm:max-w-\S+|md:max-w-\S+|lg:max-w-\S+|w-full|flex-1|'
    r'container|justify-center|text-slate-900|text-gray-900|shadow\S*|rounded\S*|border|border-\S+|overflow-hidden)$'
)


DROP_INNER = re.compile(r'^((sm:|md:|lg:|xl:)?p[xytblr]?-\S+|flex-1|min-h-\S+|justify-center|mt-12)$')


def clean_outer(cls: str) -> str:
    return ' '.join(c for c in cls.split() if not DROP_OUTER.match(c))


def _return_block(s, pos):
    """(start, ende) des return(...)-Blocks, der pos enthält; ende zeigt auf die schließende ')'-Zeile."""
    rets = [m for m in re.finditer(r'\n([ \t]*)return \(\s*\n', s[:pos])]
    for ret in reversed(rets):
        indent = ret.group(1)
        end = re.compile(r'\n' + re.escape(indent) + r'\);?[ \t]*(?=\n)').search(s, ret.end())
        if end and end.start() > pos:
            return ret, end
    return None, None


def frame(p: Page, width='wide', title=None, h1=True, all_returns=False, subtitle=None):
    """Ersetzt den äußersten Rahmen im return-Block um die h1 durch TaskShell."""
    s = p.s
    m = re.search(r'\n[ \t]*<h1\b[^>]*>\s*([^<{]+?)\s*</h1>[ \t]*', s) if h1 else None
    if title is None:
        if not m:
            raise SystemExit(f'keine h1 in {p.rel}')
        title = m.group(1).strip()
    anchor = m.start() if m else None
    blocks = []
    if isinstance(all_returns, str):
        # alle return-Blöcke, die den Marker enthalten (z. B. '{ueberschrift}')
        for r in re.finditer(re.escape(all_returns), s):
            blocks.append(r.start())
    elif all_returns:
        # alle return-Blöcke der Default-Komponente, deren erstes Element ein min-h-screen-Rahmen ist
        for r in re.finditer(r'\n([ \t]*)return \(\s*\n[ \t]*<div className="[^"]*min-h-screen[^"]*">', s):
            blocks.append(r.end() - 1)
    else:
        blocks.append(anchor)
    out = s
    done = 0
    for pos in sorted(blocks, reverse=True):
        ret, end = _return_block(out, pos)
        if not ret:
            raise SystemExit(f'kein return-Block in {p.rel}')
        body = out[ret.end():end.start()]
        om = re.match(r'([ \t]*)<div className="([^"]*)">', body)
        if not om:
            raise SystemExit(f'Rahmen nicht erkannt in {p.rel}: {body[:120]!r}')
        ind = om.group(1)
        inner = clean_outer(om.group(2))
        last = body.rstrip().rfind('</div>')
        sub = f' subtitle="{subtitle}"' if subtitle else ''
        rest = body[om.end():last]
        # zweite Ebene (zentrierender Container): nur Abstände/Höhe entfernen, Breite und Ausrichtung bleiben
        im = re.match(r'(\s*<div className=")([^"]*)(">)', rest)
        if im and re.search(r'(^| )(mx-auto|flex-1)( |$)', im.group(2)):
            cls2 = ' '.join(c for c in im.group(2).split() if not DROP_INNER.match(c))
            rest = im.group(1) + cls2 + im.group(3) + rest[im.end():]
        new_body = (f'{ind}<TaskShell title="{title}" width="{width}"{sub}>\n{ind}<div className="{inner}">'
                    + rest + '</div>\n' + ind + '</TaskShell>' + body[last + 6:])
        out = out[:ret.end()] + new_body + out[end.start():]
        done += 1
    p.s = out
    if h1 and m:
        p.s = p.s.replace(m.group(0), '', 1)
    p.imp_shell()
    return done


# ── Klassen ──────────────────────────────────────────────────────────────────
PRIMARY_BG = re.compile(r'^bg-(blue|sky|indigo)-[5-8]00$')
BTN_DROP = re.compile(r'^(bg-\S+|hover:\S+|text-white|font-\S+|py-\S+|px-\S+|p-\d+|rounded\S*|shadow\S*|transition\S*|duration-\d+|'
                      r'focus:\S+|text-(xs|sm|base|lg)|border|border-\S+|active:\S+|ease-\S+|transform|generator-button)$')


def _btn_classes(cls):
    toks = cls.split()
    if 'text-white' not in toks:
        return None
    # Schwierigkeits-/Auswahlkacheln (farbig, großer Innenabstand, mehrzeiliger Inhalt) bleiben farbig
    if any(re.match(r'^(p-[3-9]|border-edge|shadow-hard|text-left)$', t) for t in toks):
        return None
    bgs = [t for t in toks if re.match(r'^bg-[a-z]+-\d00$', t)]
    if not bgs or not any(t.startswith('hover:bg-') for t in toks):
        return None
    primary = any(PRIMARY_BG.match(t) for t in bgs) or bgs[0].startswith(('bg-green-', 'bg-emerald-'))
    keep = [t for t in toks if not BTN_DROP.match(t)]
    return ' '.join(['bk-btn'] + (['bk-btn-primary'] if primary else []) + keep)


def buttons(p: Page):
    """Statische className-Strings an <button>/<Link>/<a> mit farbigem Hintergrund → bk-btn."""
    n = 0

    def repl(m):
        nonlocal n
        new = _btn_classes(m.group(3))
        if new is None:
            return m.group(0)
        n += 1
        return f'{m.group(1)}{m.group(2)}className="{new}"'
    p.s = re.sub(r'(<(?:button|Link|a)\b)((?:=>|[^">]|"[^"]*")*?\s)className="([^"]*)"', repl, p.s, flags=re.S)
    return n


SKIN = [
    # weiße Karten → Panel
    (r'bg-white rounded-(?:2xl|xl|lg) shadow(?:-md|-lg|-sm)? border border-(?:slate|gray)-(?:100|200)', 'bk-panel'),
    (r'bg-white rounded-(?:2xl|xl|lg) border border-(?:slate|gray)-(?:100|200) shadow(?:-md|-lg|-sm)?', 'bk-panel'),
    (r'bg-white rounded-(?:2xl|xl|lg) shadow(?:-md|-lg)?(?= )', 'bk-panel'),
    (r'bg-white p-6 md:p-10 rounded-xl shadow-lg', 'bk-panel'),
    (r'bg-white rounded-(?:lg|xl|2xl) shadow-2xl(?: p-8)?', 'bk-panel'),
    (r'bg-white rounded-(?:lg|xl) shadow-lg p-8', 'bk-panel'),
    (r'bg-white p-6 sm:p-8 rounded-xl shadow-lg', 'bk-panel'),
    (r' ?p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24', ''),
    (r' ?min-h-\[400px\]', ''),
    (r'(bk-panel) p-8 (max-w-\w+ w-full) mt-12', r'\1 \2'),
    # Aufgabenkästen
    (r'bg-slate-100 border border-slate-200 rounded-lg p-6', 'bk-taskbox'),
    (r'bg-slate-50 border border-slate-200 rounded-(?:lg|xl) p-4', 'bk-taskbox'),
    # Rückmeldungen (in Template-Strings)
    (r'bg-green-100 text-green-800 border border-green-300', 'bk-feedback bk-feedback-ok block'),
    (r'bg-red-100 text-red-800 border border-red-300', 'bk-feedback bk-feedback-no block'),
    (r'bg-green-50 border border-green-(?:200|300) text-green-800', 'bk-feedback bk-feedback-ok block'),
    (r'bg-red-50 border border-red-(?:200|300) text-red-800', 'bk-feedback bk-feedback-no block'),
    (r'bg-green-50 border-green-200 text-green-800', 'bk-feedback-ok'),
    (r'bg-red-50 border-red-200 text-red-800', 'bk-feedback-no'),
    (r'bg-yellow-50 border border-yellow-200 text-yellow-900', 'bk-feedback bk-feedback-info block'),
]


def seg(p: Page):
    """Umschalter (Schwierigkeit/Modus) mit bedingter Farbe → bk-seg-btn."""
    pat = (r"className=\{`(?:px-\d+ py-\d+ |py-\d+ px-\d+ )?rounded(?:-\w+)? (?:font-\w+ )?(?:transition\S* )?"
           r"\$\{([^?{}`]+)\? '(?:bg-\w+-\d00 text-white|text-white bg-\w+-\d00)[^']*' : '(?:bg-(?:gray|slate)-(?:100|200|300) [^']*)'\}`\}")
    p.s, n = re.subn(pat, r"className={`bk-seg-btn ${\1? 'bk-seg-btn-on' : ''}`}", p.s)
    return n


def skin(p: Page):
    n = seg(p)
    for pat, rep in SKIN:
        p.s, k = re.subn(pat, rep, p.s)
        n += k
    return n


def videos(p: Page):
    n = family_videos(p)
    n += p.video_buttons()
    # einfache iframes ohne aspect-video-Hülle
    pat = (r'<iframe\b(?:(?!/>|</iframe>).)*?src=(\{`[^`]+`\}|\{\w+\}|"https://www\.youtube[^"]+")'
           r'(?:(?!/>|</iframe>).)*?title=("[^"]+"|\{`[^`]+`\})(?:(?!/>|</iframe>).)*?(?:/>|></iframe>)')

    def repl(m):
        src = m.group(1)
        if src.startswith('"'):
            src = '{' + src + '}'
        return f'<VideoEmbed src={src} title={m.group(2)} />'
    p.s, k = re.subn(pat, repl, p.s, flags=re.S)
    if k:
        p.imp(f"import {{ VideoEmbed }} from '{p.up}components/VideoButton'")
    return n + k


def run(rel, width='wide', **kw):
    p = Page(rel)
    r = {'frame': frame(p, width, **kw), 'skin': skin(p), 'btn': buttons(p), 'video': videos(p)}
    p.save()
    print('  ', r)
    return p


if __name__ == '__main__':
    for arg in sys.argv[1:]:
        run(arg)
