"""Trigonometrie-Engine (Practice.tsx) auf Baukasten umstellen – nur Darstellung."""
from bk import Page
from family import consts

p = Page('pages/trigonometrie/engine/Practice.tsx')
consts(p)
p.rep("""  mittel: 'bg-amber-500 hover:bg-amber-600',""", """  mittel: 'bg-amber-400 hover:bg-amber-300 !text-ink',""")
p.rep("""    : 'border-slate-300 bg-white';""", """    : 'border-edge bg-white';""")
p.rep("""      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">Aufgabe {number}</h2>""",
      """      <h2 className="flex items-center gap-3 text-xl font-extrabold text-ink mb-3 text-left">
        <span className="bk-num">{number}</span>Aufgabe
      </h2>""")
p.rep("""        <div className="text-slate-700 leading-relaxed">""", """        <div className="text-ink text-[17px] leading-relaxed text-left">""")
p.rep("""        <p className="text-center font-bold mt-3 text-green-600">Richtig! Super gemacht!</p>""",
      """        <p className="bk-feedback bk-feedback-ok mt-4 justify-center"><i className="fa-solid fa-check mt-1" aria-hidden="true" />Richtig! Super gemacht!</p>""")
p.rep("""        <p className="text-center font-bold mt-3 text-red-600">""", """        <p className="bk-feedback bk-feedback-no mt-4 justify-center">""")
p.rep("""        <div className="mt-4 border-l-4 border-amber-400 bg-amber-50 rounded p-3 text-left text-slate-700">""",
      """        <div className="mt-4 bk-feedback bk-feedback-info block font-normal">""")
p.rep("""      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={newTask} className={btnSecondary}>""", """      <div className="bk-actions justify-center mt-6">
        <button onClick={newTask} className={btnSecondary}>""")
p.rep("""        <p className="text-xs text-slate-500 mt-2 text-center">""", """        <p className="text-sm text-muted mt-2 text-center">""")
p.rep("""        <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50 text-slate-800">
          <h3 className="text-base font-bold text-center mb-2">Lösungsweg</h3>""", """        <div className="bk-solution">
          <h3 className="bk-solution-title">Lösungsweg</h3>""")
p.rep("""      <div className="flex items-center justify-center gap-2 text-lg text-slate-800">""", """      <div className="flex items-center justify-center gap-2 text-lg text-ink">""")
p.rep("""          className={`w-32 text-center border-2 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${statusBorder(""",
      """          className={`bk-input w-32 text-center ${statusBorder(""")
p.rep("""            : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700';""", """            : 'border-edge bg-white hover:bg-sunken text-ink';""")
p.rep("""              className={`min-w-[4rem] px-3 py-2 rounded-lg border-2 font-semibold transition-colors disabled:opacity-50 ${cls}`}""",
      """              className={`min-w-[4rem] min-h-[48px] px-4 py-2 rounded-xl border-2 font-bold shadow-hard-sm transition-colors disabled:opacity-50 ${cls}`}""")
# Erklärung: Video erst beim Klick laden
p.rep("""        <div className="max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden border border-slate-200 mb-5">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${cfg.videoId}`}
            title={`Erklärvideo: ${cfg.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>""", """        <div className="mb-5">
          <VideoEmbed src={`https://www.youtube.com/embed/${cfg.videoId}`} title={`Erklärvideo: ${cfg.title}`} />
        </div>""")
p.imp("import { VideoEmbed } from '../../../components/VideoButton';")
p.imp("import TaskShell from '../../../components/layout/TaskShell';")
p.rep("""    <div className={`${panel} text-slate-700`}>
      <h2 className="text-lg font-bold text-slate-800 mb-3 text-center">Erklärung</h2>""", """    <div className={`${panel} text-ink text-left`}>
      <h2 className="text-xl font-extrabold text-ink mb-3 text-left">Erklärung</h2>""")
p.rep("""            className="text-blue-600 hover:underline text-sm font-semibold"
          >""", """            className="bk-btn bk-btn-sm"
          >""")
# Rahmen
p.rep("""    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-8 max-w-4xl w-full flex flex-col gap-6">
        <div>
          <Link to="/trigonometrie" className="text-blue-600 hover:underline text-sm font-semibold">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 mb-2 text-center">
            {cfg.title}
          </h1>
          <p className="text-center text-slate-600">{cfg.subtitle}</p>
        </div>
""", """    <TaskShell title={cfg.title} subtitle={cfg.subtitle} width="narrow">
      <div className="flex flex-col gap-6">
""")
p.sub(r"\n      </div>\n    </div>\n  \);\n\}\s*$", "\n      </div>\n    </TaskShell>\n  );\n}\n", count=1)
p.rep("""          <h2 className="text-lg font-bold text-slate-800 mb-4">
            {level""", """          <h2 className="text-xl font-extrabold text-ink mb-4">
            {level""")
p.rep("""                className={`rounded-xl text-white p-4 shadow-sm transition-all ${""", """                className={`rounded-2xl text-white p-4 border-2 border-edge shadow-hard text-left transition-all hover:-translate-y-0.5 ${""")
p.rep("""                  level === l.id ? 'ring-4 ring-offset-2 ring-blue-300' : ''""", """                  level === l.id ? 'ring-4 ring-offset-2 ring-ink' : ''""")
p.rep("""<p className="text-lg font-bold mb-1 text-white">{LEVEL_LABEL[l.id]}</p>""", """<p className="text-lg font-bold mb-1 text-inherit">{LEVEL_LABEL[l.id]}</p>""")
p.rep("""<p className="text-base mb-1 text-white">""", """<p className="text-base mb-1 text-inherit">""")
p.rep("""<p className="text-sm text-white/90">""", """<p className="text-sm text-inherit opacity-90">""")
p.rep("""            <p className="text-sm text-slate-500 mt-4">{cfg.roundingNote}</p>""", """            <p className="text-sm text-muted mt-4">{cfg.roundingNote}</p>""")
p.rep("""          <div className="flex justify-center gap-3 flex-wrap">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
              Gelöst: {solvedCount} / {TOTAL_TASKS}
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
              Richtig in Folge: {streak}
            </div>""", """          <div className="bk-actions justify-center">
            <div className="bk-chip !text-base !py-2.5 !px-4">
              Gelöst: {solvedCount} / {TOTAL_TASKS}
            </div>
            <div className="bk-streak">
              <i className="fa-solid fa-fire" aria-hidden="true" /> Richtig in Folge: {streak}
            </div>""")
p.rep("""            className="bg-green-50 border-2 border-green-400 rounded-xl p-6 text-center"
          >""", """            className="bk-panel text-center !bg-[var(--correct-soft)]"
          >""")
p.rep("import { Link, useNavigate } from 'react-router-dom';", "import { useNavigate } from 'react-router-dom';")
p.save()
