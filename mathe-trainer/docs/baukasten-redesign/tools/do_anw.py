"""Anwendungsaufgaben (Lineare Funktionen): Darstellung auf Baukasten umstellen."""
import re
from bk import Page

EMOJI = r"(?:[☀-➿\U0001F300-\U0001FAFF]️?\s*)"


def anw(rel):
    p = Page(rel)
    report = {}

    def sub(name, pat, repl, flags=re.S):
        p.s, n = re.subn(pat, repl, p.s, flags=flags)
        report[name] = n

    # Kopf → TaskShell
    m = re.search(r'<div className="min-h-screen flex flex-col bg-gradient-to-br from-\w+-50 to-\w+-100(?: p-4)?">\s*'
                  r'<header className="[^"]*">\s*<h1 className="[^"]*">' + EMOJI + r'?([^<]+)</h1>\s*<p className="[^"]*">([^<]+)</p>\s*</header>', p.s)
    if not m:
        raise SystemExit('Kopf nicht gefunden: ' + rel)
    title, sub_ = m.group(1).strip(), m.group(2).strip()
    p.s = p.s[:m.start()] + f'<TaskShell title="{title}" subtitle="{sub_}" width="wide">' + p.s[m.end():]
    p.imp_shell()
    p.close_shell()

    sub('container', r'className="max-w-6xl mx-auto w-full bg-white rounded-lg shadow-lg p-6 mb-6"', 'className="bk-panel mb-6"')
    sub('wrapper', r'className="max-w-6xl mx-auto w-full"', 'className="w-full"')
    sub('panel', r'className="bg-white rounded-lg shadow-lg p-6 mb-6"', 'className="bk-panel mb-6"')
    sub('hinweis', r'<div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded-lg">\s*<p className="text-yellow-900 font-semibold">💡\s*',
        '<div className="mb-6 bk-feedback bk-feedback-info">\n          <p className="font-semibold"><i className="fa-solid fa-lightbulb" aria-hidden="true" /> ')
    sub('intro', r'className="mb-6 p-4 bg-blue-50 rounded-lg"', 'className="mb-6 bk-taskbox"')
    sub('bild', r'className="mb-6 p-4 bg-gray-100 rounded-lg"', 'className="mb-6 bk-graph"')
    sub('bildimg', r'h-auto rounded-lg shadow-md"', 'h-auto rounded-xl"')
    sub('aufgabe', r'className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-\w+-500"', 'className="mb-6 p-5 bg-sunken rounded-2xl"')
    sub('h2', r'className="text-2xl font-bold text-\w+-900 mb-3"', 'className="text-2xl font-extrabold text-ink mb-3 text-left"')
    sub('ok', r'className="p-3 bg-green-100 text-green-800 rounded-lg mb-4 font-semibold"', 'className="bk-feedback bk-feedback-ok mb-4"')
    sub('no', r'className="p-3 bg-red-100 text-red-800 rounded-lg mb-4 font-semibold"', 'className="bk-feedback bk-feedback-no mb-4"')
    sub('loesungbtn', r'className="mb-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition"', 'className="mb-4 bk-btn"')
    sub('hintbox', r'className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg mb-4"', 'className="bk-solution mb-4"')
    sub('hinttitle', r'className="font-semibold text-yellow-900 mb-2"', 'className="bk-solution-title"')
    sub('hinttext', r'className="text-yellow-800"', 'className="text-ink"')
    sub('pruefen', r"className=\{`w-full px-4 py-3 rounded-lg font-semibold text-white transition \$\{\s*feedbackState === 'correct'\s*\? 'bg-gray-400 cursor-not-allowed'\s*: 'bg-\w+-500 hover:bg-\w+-600 cursor-pointer'\s*\}`\}",
        'className="bk-btn bk-btn-primary w-full"')
    sub('nav', r"className=\{`px-6 py-2 rounded-lg font-semibold transition \$\{\s*currentTask === [^?]+\?\s*'bg-gray-300 text-gray-600 cursor-not-allowed'\s*: 'bg-\w+-500 hover:bg-\w+-600 text-white cursor-pointer'\s*\}`\}",
        'className="bk-btn"')
    sub('prog', r'className="mt-6 w-full bg-gray-200 rounded-full h-2"', 'className="mt-6 w-full bg-white border-2 border-edge rounded-full h-3 overflow-hidden"')
    sub('progbar', r'className="bg-\w+-500 h-2 rounded-full transition-all duration-300"', 'className="bg-primary h-full transition-all duration-300"')
    sub('input1', r'px-3 py-2 border-2 rounded-lg focus:outline-none transition', 'bk-input')
    sub('input2', r'px-4 py-3 border-2 rounded-lg focus:outline-none transition', 'bk-input')
    sub('inputneutral', r'border-gray-300 focus:border-\w+-500', 'border-edge')
    sub('label', r'className="block text-sm font-medium text-gray-700 mb-1"', 'className="block text-sm font-bold text-ink mb-1"')
    p.save()
    print('  ', title, {k: v for k, v in report.items() if v})


for f in ['Berg', 'Bruecke', 'Flughafen', 'Fussballplatz', 'Sonne', 'Tipi']:
    anw(f'pages/lineare_funktionen/{f}Aufgabe.tsx')

# Übersicht der Anwendungsaufgaben als Kacheln
p = Page('pages/lineare_funktionen/Anwendungsaufgaben.tsx')
for emo, icon in [("'⚽'", "'fa-solid fa-futbol'"), ("'⛺'", "'fa-solid fa-campground'"), ("'⛰️'", "'fa-solid fa-mountain'"),
                  ("'☀️'", "'fa-solid fa-sun'"), ("'🌉'", "'fa-solid fa-bridge'"), ("'✈️'", "'fa-solid fa-plane'")]:
    p.rep(f"icon: {emo}", f"icon: {icon}")
i = p.s.index('  return (')
p.s = p.s[:i] + '''  return (
    <TaskShell title="Anwendungsaufgaben - Lineare Funktionen" subtitle="Wähle eine Aufgabe aus der folgenden Liste aus." width="wide">
      <div className="bk-tiles">
        {aufgaben.map((a) => (
          <Link key={a.title} to={`/lineare_funktionen/anwendungsaufgaben/${a.href}`} className="bk-tile-ex">
            <span className="bk-tile-top">
              <b>{a.title.split('.')[0]}</b>
              <i className={a.icon} aria-hidden="true" style={{ fontSize: 24 }} />
            </span>
            <strong>{a.title.replace(/^\\d+\\.\\s*/, '')}</strong>
            <small>{a.desc}</small>
          </Link>
        ))}
      </div>
    </TaskShell>
  )
}
'''
p.imp_shell()
p.save()
