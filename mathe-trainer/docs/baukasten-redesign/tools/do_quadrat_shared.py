"""Quadratische Funktionen: gemeinsame Bausteine (quadratischShared.tsx)."""
from bk import Page

p = Page('pages/quadratische_funktionen/quadratischShared.tsx')
p.rep("export const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors'",
      "export const btnPrimary = 'bk-btn bk-btn-primary'")
p.rep("export const btnSecondary = 'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors'",
      "export const btnSecondary = 'bk-btn'")
p.rep("export const panel = 'text-center bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200'",
      "export const panel = 'bk-panel text-center'")
p.rep("""      <div className="max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden border border-slate-200">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>""", """      <VideoEmbed src={`https://www.youtube.com/embed/${id}`} title={title} />""")
p.rep("""<h3 className="text-base font-bold text-slate-800 mt-5 mb-2 text-center">Erklärvideo</h3>""",
      """<h3 className="text-lg font-extrabold text-ink mt-5 mb-2 text-center">Erklärvideo</h3>""")
p.imp("import { VideoEmbed } from '../../components/VideoButton'")
p.save()
