from bk import ROOT

LOESUNG = """
.lösungBox { composes: bk-solution from global; }
.lösungBox h4 { margin: 0 0 8px; font: 800 17px/1.2 var(--font-display); color: var(--correct); text-align: left; }
.lösungsDetails p { margin: 4px 0; text-align: left; color: var(--ink); }
"""
extra = {
    'GemischteAufgaben': LOESUNG,
    'ParallelSenkrecht': LOESUNG + """
.prüfenButton { composes: bk-btn bk-btn-primary from global; }
.lösungButton { composes: bk-btn from global; }
.answerInput { composes: bk-input from global; width: 160px; }
""",
    'Wertetabelle': LOESUNG + """
.lösungTabelle { overflow-x: auto; margin: 8px 0; }
.lösungTabelle table { border-collapse: separate; border-spacing: 0; border: 2px solid var(--edge); border-radius: 12px; overflow: hidden; }
.lösungTabelle th, .lösungTabelle td { padding: 8px 10px; border-right: 1px solid var(--line); border-top: 1px solid var(--line); text-align: center; font: 600 16px/1.2 var(--font-display); min-width: 52px; }
""",
}
for name, css in extra.items():
    path = ROOT + f'pages/lineare_funktionen/{name}.module.css'
    open(path, 'a', encoding='utf-8').write(css)
    print('ergänzt', name)
