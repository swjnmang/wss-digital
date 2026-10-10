"""Hilfen für die Baukasten-Umstellung einzelner Seiten (nur Darstellung, keine Aufgabenlogik)."""
import re

ROOT = 'C:/Users/mailt/OneDrive/KI Programme/wss-digital/mathe-trainer/src/'


class Page:
    def __init__(self, rel):
        self.rel = rel
        self.path = ROOT + rel
        self.s = open(self.path, encoding='utf-8').read()
        depth = rel.count('/')
        self.up = '../' * depth  # relativer Weg nach src/

    def rep(self, a, b, count=1):
        n = self.s.count(a)
        if n == 0:
            raise SystemExit(f'NICHT GEFUNDEN in {self.rel}:\n{a[:300]}')
        if count and n != count:
            raise SystemExit(f'{n}x statt {count}x in {self.rel}:\n{a[:300]}')
        self.s = self.s.replace(a, b)
        return self

    def sub(self, pat, repl, count=None, flags=re.S):
        new, n = re.subn(pat, repl, self.s, flags=flags)
        if n == 0 or (count is not None and n != count):
            raise SystemExit(f'Muster {n}x (erwartet {count}) in {self.rel}:\n{pat[:300]}')
        self.s = new
        return self

    def imp(self, line):
        """Import nach dem letzten Import einfügen (falls noch nicht vorhanden)."""
        if line in self.s:
            return self
        idx = [m.end() for m in re.finditer(r"^import [^\n]*\n", self.s, flags=re.M)]
        pos = idx[-1] if idx else 0
        self.s = self.s[:pos] + line + '\n' + self.s[pos:]
        return self

    def imp_shell(self):
        return self.imp(f"import TaskShell from '{self.up}components/layout/TaskShell'")

    def imp_video(self):
        return self.imp(f"import VideoButton from '{self.up}components/VideoButton'")

    def no_polyfill(self):
        pat = (r"\n[ \t]*const script = document\.createElement\('script'\)\n"
               r"[ \t]*script\.src = 'https://polyfill\.io/v3/polyfill\.min\.js\?features=es6'\n"
               r"(?:[ \t]*script\.async = true\n)?"
               r"[ \t]*document\.(?:head|body)\.appendChild\(script\)\n")
        self.s, n = re.subn(pat, '\n', self.s)
        return n

    def video_buttons(self):
        """Inline gestylte '🎥 Erklärvideo'-Knöpfe (window.open) durch <VideoButton> ersetzen."""
        pat = r"<button(?:(?!</button>).)*?window\.open\('([^']+)',\s*'_blank'\)(?:(?!</button>).)*?Erklärvideo\s*</button>"
        self.s, n = re.subn(pat, r'<VideoButton url="\1" />', self.s, flags=re.S)
        if n:
            self.imp_video()
        return n

    def shell(self, title, width='narrow', extra=''):
        """Äußeren prose-Container samt Überschrift durch <TaskShell> ersetzen (Leerzeilen egal)."""
        pat = (r"<div className=\{`prose \$\{styles\.container\}`\}>\s*\n"
               r"(\s*)<div className=\{styles\.card\}>\s*\n"
               r"\s*<h[12][^>]*>[^<]*</h[12]>\n")

        def repl(m):
            return f'<TaskShell title="{title}" width="{width}"{extra}>\n{m.group(1)}<div className={{styles.card}}>\n'

        self.sub(pat, repl, count=1)
        self.imp_shell()
        return self

    def close_shell(self):
        """Letztes schließendes </div> vor dem Return-Ende durch </TaskShell> ersetzen."""
        self.sub(r"\n[ \t]*</div>\s*\n  \)\n\}\s*$", "\n    </TaskShell>\n  )\n}\n", count=1)
        return self

    def save(self):
        open(self.path, 'w', encoding='utf-8', newline='').write(self.s)
        print('gespeichert', self.rel)


def yt_modal(p, title='Erklärvideo'):
    """YouTube-IFrame-API-Modal (showVideoModal) durch <VideoButton> ersetzen. Gibt die Video-ID zurück."""
    m = re.search(r"videoId: '([\w-]{11})'", p.s)
    vid = m.group(1)
    p.sub(r"\n[ \t]*(?://[^\n]*\n[ \t]*)?useEffect\(\(\) => \{\n[ \t]*if \(!showVideoModal\) return.*?\}, \[showVideoModal\]\)\n", "\n", count=1)
    p.sub(r"\n([ \t]*)\{/\* Video Modal \*/\}\n[ \t]*\{showVideoModal && \(.*?\n\1\)\}\n", "\n", count=1)
    p.sub(r"<button(?:(?!</button>).)*?setShowVideoModal\(true\)(?:(?!</button>).)*?Erklärvideo\s*</button>",
          f'<VideoButton url="https://youtu.be/{vid}" title="{title}" />', count=1)
    p.sub(r"\n[ \t]*const \[showVideoModal, setShowVideoModal\] = useState\(false\)", "", count=1)
    p.sub(r"\n[ \t]*const youtubePlayerRef = useRef<any>\(null\)", "", count=1)
    p.imp_video()
    return vid


def common(p):
    """Wiederkehrende Tailwind-Muster der Trainer auf Baukasten-Bausteine umstellen."""
    n = 0
    p.s, k = re.subn(r"className=\{`px-4 py-2 rounded-md border \$\{(\w+) === '([\w-]+)' \? 'bg-blue-600 text-white' : 'bg-gray-100'\}`\}",
                     r"className={`bk-seg-btn ${\1 === '\2' ? 'bk-seg-btn-on' : ''}`}", p.s); n += k
    p.s, k = re.subn(r'className="generator-button[^"]*"', 'className="bk-btn"', p.s); n += k
    p.s, k = re.subn(r'className="border rounded px-3 py-2 text-lg (w-\d+) text-center"', r'className="bk-input \1 text-center"', p.s); n += k
    p.s, k = re.subn(r'className="bg-gray-100 border rounded-md p-6 mb-4 text-center', 'className="bk-taskbox mb-4', p.s); n += k
    p.s, k = re.subn(r'text-lg font-bold text-sky-800', 'text-xl font-bold text-ink', p.s); n += k
    p.s, k = re.subn(r"\s*onMouseEnter=\{\(e\) => \(e\.currentTarget\.style\.backgroundColor = '#[0-9a-f]+'\)\}\s*onMouseLeave=\{\(e\) => \(e\.currentTarget\.style\.backgroundColor = '#[0-9a-f]+'\)\}", "", p.s); n += k
    return n


def primary(p, label):
    """Den Knopf mit genau diesem Text zur Hauptaktion machen."""
    p.sub(r'className="bk-btn"(\s+onClick=\{[^}]*\}[^>]*>\s*' + re.escape(label) + r'\s*<)', r'className="bk-btn bk-btn-primary"\1', count=1)
