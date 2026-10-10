"""Trigonometrie: Sonderseiten (Anwendungsaufgaben, Prüfungsmodus, Gemischte Aufgaben, Nachverfolgungs-Bericht)."""
import re
from legacy import run, frame, skin, buttons, Page

T = 'pages/trigonometrie/'
BIG_CARD = [r'bg-white rounded-(?:xl|2xl) shadow-lg p-6 space-y-6', 'bk-panel space-y-6']


def card(p):
    p.s = re.sub(BIG_CARD[0], BIG_CARD[1], p.s)


for f in ['Bergbahn', 'Fussballfeld', 'OlympiaparkMuenchen', 'Stadion']:
    p = run(T + 'anwendungsaufgaben/' + f + '.tsx', 'wide')
    p = Page(T + 'anwendungsaufgaben/' + f + '.tsx')
    card(p)
    # „Zurück zur Übersicht“ steht schon im farbigen Kopf (Bereich) – Link bleibt als Abkürzung zur Aufgabenliste
    p.s = p.s.replace('className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 text-sm font-medium mb-4"',
                      'className="bk-btn bk-btn-ghost mb-3"')
    p.save()

p = run(T + 'Pruefungsmodus.tsx', 'wide')
p = Page(T + 'Pruefungsmodus.tsx')
card(p)
p.save()

# Nachverfolgungs-Bericht: Titel enthält den Bereich
p = Page(T + 'NachverfolgungBericht.tsx')
frame(p, 'wide', title='__BERICHT__', h1=False, all_returns='<h1 className="text-3xl font-bold text-teal-800">Deine Nachverfolgung')
p.rep('title="__BERICHT__"', 'title={`Deine Nachverfolgung – ${areaInfo.title}`}')
p.sub(r'\n[ \t]*<h1 className="text-3xl font-bold text-teal-800">Deine Nachverfolgung – \{areaInfo\.title\}</h1>', '', count=1)
card(p)
skin(p); buttons(p)
p.save()

# Gemischte Übungsaufgaben: eigener Kopf mit Zähler und „Alle neu“
p = Page(T + 'GemischteUebungsaufgaben.tsx')
p.sub(r'''        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold uppercase tracking-\[0\.2em\] text-slate-500">Trigonometrie</p>
                        <h1 className="text-3xl font-bold">Gemischte Übungsaufgaben</h1>
                        <p className="text-sm text-slate-600 max-w-2xl">
                            (.*?)
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold">
                            (\{correctCount\} / \{answeredCount\} richtig \(\{cards\.length\} Aufgaben\))
                        </span>
                        <button
                            onClick=\{regenerateAll\}
                            className="[^"]*"
                        >
                            🔄 Alle Aufgaben neu
                        </button>
                    </div>
                </div>
''', lambda m: f'''        <TaskShell
            title="Gemischte Übungsaufgaben"
            width="wide"
            subtitle={{<>{m.group(1)}</>}}
            actions={{
                <>
                    <span className="bk-chip !text-sm !py-2.5">{m.group(2)}</span>
                    <button onClick={{regenerateAll}} className="bk-btn">
                        <i className="fa-solid fa-rotate" aria-hidden="true" /> Alle Aufgaben neu
                    </button>
                </>
            }}
        >
            <div className="space-y-6">
''', count=1)
p.sub(r'''(\n                <div className="flex justify-center">
                    <Link to="/trigonometrie" className="[^"]*">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Zurück zur Übersicht
                    </Link>
                </div>
            </div>
)        </div>
    \);''', r'\1        </TaskShell>\n    );', count=1)
p.rep('<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">', '<div className="bk-panel space-y-4">')
p.rep('''                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-white font-semibold">
                        Aufgabe {index + 1}
                    </span>''', '''                    <span className="bk-num">{index + 1}</span>
                    <span className="font-display text-lg font-extrabold">Aufgabe</span>''')
p.rep('''<button onClick={onRegenerate} className="text-sm text-[var(--accent)] font-semibold hover:underline">
                    🔄 Aufgabe neu''', '''<button onClick={onRegenerate} className="bk-btn bk-btn-sm">
                    <i className="fa-solid fa-rotate" aria-hidden="true" /> Aufgabe neu''')
p.s = p.s.replace('className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"', 'className="bk-btn bk-btn-primary"')
p.s = p.s.replace('className="w-full sm:w-48 border border-slate-300 rounded-lg px-3 py-2 text-center"', 'className="bk-input w-full sm:w-48 text-center"')
p.s = p.s.replace("'bg-green-50 border-green-200 text-green-800'", "'bk-feedback-ok'").replace("'bg-red-50 border-red-200 text-red-800'", "'bk-feedback-no'")
p.s = p.s.replace('className={`rounded-lg border px-3 py-2 text-sm font-semibold ${feedbackClass}`}', 'className={`bk-feedback block ${feedbackClass}`}')
p.s = p.s.replace('<button onClick={onToggleSolution} className="text-sm text-slate-600 font-semibold hover:underline">', '<button onClick={onToggleSolution} className="bk-btn">')
p.imp_shell()
p.save()
