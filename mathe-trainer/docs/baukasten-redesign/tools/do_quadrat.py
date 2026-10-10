"""Quadratische Funktionen: Sonderfälle (Überschrift als Konstante, Videolinks)."""
import re
from legacy import frame, skin, buttons, Page

Q = 'pages/quadratische_funktionen/'

# Seiten mit `const ueberschrift = <h1>…</h1>` in mehreren return-Zweigen
for f, width in [('GraphZeichnen', 'wide'), ('ScheitelInAllgForm', 'wide'), ('Scheitelform', 'wide')]:
    p = Page(Q + f + '.tsx')
    m = re.search(r'\n[ \t]*const ueberschrift = <h1[^>]*>([^<]+)</h1>;', p.s)
    title = m.group(1)
    frame(p, width, title=title, h1=False, all_returns='{ueberschrift}')
    p.s = p.s.replace(m.group(0), '')
    p.s = re.sub(r'\n[ \t]*<div className="mb-6">\{ueberschrift\}</div>', '', p.s)
    p.s = re.sub(r'\n[ \t]*\{ueberschrift\}', '', p.s)
    assert 'ueberschrift' not in p.s, f
    skin(p); buttons(p)
    p.save()

# eingebettete Lernvideos (GraphZeichnen, ScheitelInAllgForm): erst beim Klick laden
for f, t in [('GraphZeichnen', 'Lernvideo: Graph einer Parabel zeichnen'), ('ScheitelInAllgForm', None)]:
    p = Page(Q + f + '.tsx')
    p.sub(r'<div className="relative w-full" style=\{\{ paddingTop: \'56\.25%\' \}\}>\s*<iframe\s+className="[^"]*"\s+src=\{LERNVIDEO_EMBED_URL\}\s+title=("[^"]+")[^/]*/>\s*</div>',
          r'<VideoEmbed src={LERNVIDEO_EMBED_URL} title=\1 />', count=1)
    p.imp("import { VideoEmbed } from '../../components/VideoButton'")
    p.save()

# Video-Links → VideoButton (eingebettetes Fenster)
p = Page(Q + 'ScheitelformRechnerisch.tsx')
p.sub(r'<a href=\{VIDEO_URL\} target="_blank" rel="noopener noreferrer"\s+className="bk-btn flex-1 flex items-center justify-center gap-2">.*?</a>',
      '<VideoButton url={VIDEO_URL} label="Video" className="bk-btn flex-1" />', count=1)
p.imp_video()
p.save()

p = Page(Q + 'ScheitelpunktAblesen.tsx')
p.sub(r'<a\s+href=\{VIDEO_URL\}\s+target="_blank"\s+rel="noopener noreferrer"\s+className="[^"]*"\s*>\s*▶ Erklärvideo ansehen\s*</a>',
      '<VideoButton url={VIDEO_URL} label="Erklärvideo ansehen" />', count=1)
p.imp_video()
p.save()
