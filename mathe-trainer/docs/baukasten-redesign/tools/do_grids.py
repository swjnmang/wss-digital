"""Gemischte Übungsaufgaben, Parallel/senkrecht, Wertetabelle: Kachel-Aufgabenseiten auf Baukasten umstellen."""
from bk import Page, ROOT

BASE = """/* Baukasten-Design – Klassennamen unverändert, nur Darstellung neu */
.container { max-width: 1440px; margin: 0 auto; }
.header { display: none; }
.title { font: 800 28px/1.15 var(--font-display); text-align: left; margin: 0; }
.subtitle { margin: 6px 0 0; color: var(--ink-muted); text-align: left; }
.newButton { composes: bk-btn from global; margin: 0 0 20px; }
.aufgabenContainer { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr)); gap: 20px; align-items: start; }
.aufgabeCard { background: var(--surface); border: 2px solid var(--edge); border-radius: 20px; box-shadow: var(--shadow-hard); overflow: hidden; text-align: left; }
.cardCorrect { outline: 3px solid var(--correct); outline-offset: -6px; }
.aufgabeHeader { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px; background: var(--surface-sunken); border-bottom: 2px solid var(--edge); }
.aufgabenNummer, .aufgabennummer { font: 800 17px/1.2 var(--font-display); color: var(--ink); }
.themaLabel { composes: bk-chip from global; font-size: 12px; }
.content { padding: 16px; color: var(--ink); }
.frage { margin: 0 0 14px; font-size: 17px; line-height: 1.55; color: var(--ink); text-align: left; }
.mathDisplay { overflow-x: auto; margin: 6px 0; }
.buttonGroup { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.checkBtn { composes: bk-btn bk-btn-primary from global; }
.solutionBtn { composes: bk-btn from global; }
.feedbackBox { composes: bk-feedback bk-feedback-ok from global; margin-top: 14px; }
.feedbackBoxError { composes: bk-feedback bk-feedback-no from global; margin-top: 14px; }
.graphContainer { composes: bk-graph from global; display: flex; flex-direction: column; align-items: center; margin: 0 0 14px; }
.inputCorrect { border-color: var(--correct) !important; background: var(--correct-soft) !important; }
.inputIncorrect, .inputError { border-color: var(--wrong) !important; background: var(--wrong-soft) !important; }
.correct { border-color: var(--correct) !important; background: var(--correct-soft) !important; }
.incorrect { border-color: var(--wrong) !important; background: var(--wrong-soft) !important; }
"""

GEMISCHT = BASE + """
.roundingNote { composes: bk-feedback bk-feedback-info from global; display: inline-flex; margin: 0 0 16px; }
.hint { margin: 6px 0 0; font-size: 14px; color: var(--ink-muted); text-align: left; }
.inputSection { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 8px 0; font: 700 20px/1.2 var(--font-display); }
.standardInput { composes: bk-input from global; width: 160px; }
.yesNoButtons { display: flex; gap: 10px; margin: 8px 0; }
.yesNoBtn { composes: bk-btn from global; flex: 1; }
.selected { background: var(--primary) !important; color: var(--on-primary) !important; }
.livePreview { margin-top: 10px; padding: 8px 12px; border-radius: 12px; background: var(--surface-sunken); overflow-x: auto; }
.mtSection, .xySection { margin: 8px 0; }
.mtInputs, .xyInputs { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.mtGroup, .xyGroup { display: inline-flex; align-items: center; gap: 8px; font: 700 20px/1.2 var(--font-display); }
.mtInput, .xyInput { composes: bk-input from global; width: 110px; text-align: center; }
.zuordnungSection { display: flex; flex-direction: column; gap: 10px; margin: 8px 0; }
.zuordnungRow { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.zuordnungSelect { composes: bk-input from global; font-size: 16px; min-width: 140px; }
.graphLabel { font: 700 14px/1.2 var(--font-body); color: var(--ink-muted); margin-bottom: 6px; }
.wertetabelleContainer, .wertetabelleWrapper { overflow-x: auto; margin: 8px 0; }
.wertetabelle { border-collapse: separate; border-spacing: 0; border: 2px solid var(--edge); border-radius: 12px; overflow: hidden; }
.tableHeader { background: var(--surface-sunken); font: 800 16px/1 var(--font-display); padding: 10px 12px; border-right: 1px solid var(--line); text-align: center; }
.tableCell { padding: 6px; border-right: 1px solid var(--line); border-top: 1px solid var(--line); text-align: center; font: 600 16px/1.2 var(--font-display); }
.tableInput { composes: bk-input from global; width: 72px; min-height: 44px; text-align: center; font-size: 17px; }
"""

PARALLEL = BASE + """
.inputGroup { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 8px 0; font: 700 20px/1.2 var(--font-display); }
.inputLabel { font: 700 16px/1.3 var(--font-body); color: var(--ink); }
.mcOptions { display: flex; flex-direction: column; gap: 8px; margin: 8px 0; }
.mcOption { display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 8px 14px; border: 2px solid var(--edge); border-radius: 12px; background: var(--surface); cursor: pointer; font-weight: 600; }
.mcOption:has(input:checked) { background: var(--primary-soft); outline: 3px solid var(--edge); outline-offset: -5px; }
.mcOption input { width: 20px; height: 20px; accent-color: var(--ink); }
.mcLabel { font-size: 16px; }
.zuordnungContainer { display: flex; flex-direction: column; gap: 10px; margin: 8px 0; }
.zuordnungItem { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.zuordnungLabel { font: 700 17px/1.3 var(--font-display); }
.zuordnungSelect { composes: bk-input from global; font-size: 16px; min-width: 160px; }
.pr { margin: 0; }
"""

WERTE = BASE + """
.header { display: none; }
.scoreBox { display: none; }
.score { composes: bk-streak from global; }
.scoreLabel { font-size: 14px; font-weight: 700; }
.difficultySelector { composes: bk-panel from global; }
.difficultyTitle { font: 800 20px/1.2 var(--font-display); margin: 0 0 14px; text-align: left; }
.difficultyButtonGroup { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.difficultyButton { composes: bk-btn from global; flex-direction: column; align-items: flex-start; text-align: left; min-height: 84px; padding: 12px 16px; }
.einfach, .mittel, .schwer { }
.difficultyLabel { font: 800 18px/1.2 var(--font-display); }
.difficultyDescription { font: 500 14px/1.3 var(--font-body); color: var(--ink-muted); }
.actionBar { composes: bk-actions from global; margin-bottom: 20px; }
.difficultyChangeButton { composes: bk-btn from global; }
.tableSection { overflow-x: auto; margin: 8px 0; }
.xCell { background: var(--surface-sunken); font-weight: 800; }
.yRow td { background: var(--surface); }
.givenValue { font: 700 17px/1 var(--font-display); }
.tableInput { composes: bk-input from global; width: 72px; min-height: 44px; text-align: center; font-size: 17px; }
.wertetabelle { border-collapse: separate; border-spacing: 0; border: 2px solid var(--edge); border-radius: 12px; overflow: hidden; }
.wertetabelle th, .wertetabelle td { padding: 8px 10px; border-right: 1px solid var(--line); border-top: 1px solid var(--line); text-align: center; font: 600 16px/1.2 var(--font-display); min-width: 52px; }
.wertetabelle tr:first-child th, .wertetabelle tr:first-child td { border-top: 0; }
.graphBtn { composes: bk-btn from global; }
.graphBox { composes: bk-graph from global; margin-top: 14px; display: flex; justify-content: center; }
.sollution { color: var(--correct); font-weight: 800; }
.rechenbeispiele { composes: bk-solution from global; }
.beispiel { margin: 8px 0; padding: 10px 12px; border-radius: 12px; background: var(--surface-sunken); }
.beispielText, .beispielErklaerung { margin: 0 0 4px; text-align: left; color: var(--ink); }
.berechnung { margin: 0; font: 700 17px/1.4 var(--font-display); text-align: left; color: var(--ink); }
.xWertRot { color: var(--wrong); font-weight: 800; }
"""

# ── Gemischte Übungsaufgaben ──
p = Page('pages/lineare_funktionen/GemischteAufgaben.tsx')
print('polyfill', p.no_polyfill())
p.imp_shell()
p.rep("""    <div className={`prose ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Übungsaufgaben</h1>
        <p className={styles.subtitle}>Löse die Aufgaben und überprüfe deine Ergebnisse</p>
        <p className={styles.roundingNote}>💡 Wichtig: Runde deine Ergebnisse auf 2 Stellen nach dem Komma!</p>
      </div>
""", """    <TaskShell title="Übungsaufgaben" subtitle="Löse die Aufgaben und überprüfe deine Ergebnisse" width="full">
      <p className={styles.roundingNote}><i className="fa-solid fa-lightbulb" aria-hidden="true" /> Wichtig: Runde deine Ergebnisse auf 2 Stellen nach dem Komma!</p>
""")
p.rep("🔄 Neue Aufgaben", '<i className="fa-solid fa-rotate" aria-hidden="true" /> Neue Aufgaben')
p.close_shell()
p.save()
open(ROOT + 'pages/lineare_funktionen/GemischteAufgaben.module.css', 'w', encoding='utf-8').write(GEMISCHT)

# ── Parallele und senkrechte Geraden ──
p = Page('pages/lineare_funktionen/ParallelSenkrecht.tsx')
p.imp_shell()
p.rep("""    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Parallele und senkrechte Geraden</h1>
        <p className={styles.subtitle}>
          Untersuche die Beziehungen zwischen Geraden rechnerisch (Multiple Choice)
        </p>
      </div>
""", """    <TaskShell title="Parallele und senkrechte Geraden" subtitle="Untersuche die Beziehungen zwischen Geraden rechnerisch (Multiple Choice)" width="full">
""")
p.s = p.s.replace("style={{ color: '#10b981' }}", "style={{ color: 'var(--correct)' }}").replace("style={{ marginTop: '1rem', color: '#10b981', fontWeight: 'bold' }}", "style={{ marginTop: '1rem', color: 'var(--correct)', fontWeight: 'bold' }}")
p.close_shell()
p.save()
open(ROOT + 'pages/lineare_funktionen/ParallelSenkrecht.module.css', 'w', encoding='utf-8').write(PARALLEL)

# ── Wertetabelle ──
p = Page('pages/lineare_funktionen/Wertetabelle.tsx')
print('polyfill', p.no_polyfill())
p.imp_shell()
p.rep("""    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Wertetabellen</h1>
          <p className={styles.subtitle}>Erstelle oder vervollständige Wertetabellen für lineare Funktionen</p>
        </div>
        <div className={styles.scoreBox}>
          <div className={styles.score}>
            ⭐ {punkte} <span className={styles.scoreLabel}>Punkte</span>
          </div>
        </div>
      </div>
""", """    <TaskShell
      title="Wertetabellen"
      subtitle="Erstelle oder vervollständige Wertetabellen für lineare Funktionen"
      width="full"
      actions={<div className={styles.score}><i className="fa-solid fa-star" aria-hidden="true" /> {punkte} <span className={styles.scoreLabel}>Punkte</span></div>}
    >
""")
p.close_shell()
p.save()
open(ROOT + 'pages/lineare_funktionen/Wertetabelle.module.css', 'w', encoding='utf-8').write(WERTE)
print('fertig')
