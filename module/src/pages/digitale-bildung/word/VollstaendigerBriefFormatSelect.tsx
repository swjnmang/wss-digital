import { Link } from 'react-router-dom';

export default function VollstaendigerBriefFormatSelect() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-8 px-4 text-center relative">
        <Link
          to="/digitale-bildung/word/geschaeftsbrief"
          className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Geschäftsbrief
        </Link>
        <h1 className="text-2xl font-bold">📄 Vollständiger Geschäftsbrief</h1>
        <p className="text-slate-300 text-sm mt-1">Wähle, in welcher Übungsform du den kompletten Brief üben möchtest.</p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-4">
        <Link
          to="/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief"
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="text-3xl">🧩</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Eingabefelder (Boxen)</h2>
            <p className="text-sm text-slate-500">
              Jedes Element (Anschriftenfeld, Infoblock, Betreff, Anrede, Grußformel) hat ein eigenes,
              beschriftetes Eingabefeld direkt im Briefbogen.
            </p>
          </div>
        </Link>

        <Link
          to="/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief-doc"
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="text-3xl">📝</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Word-Editor</h2>
            <p className="text-sm text-slate-500">
              Ein echter, frei editierbarer Texteditor wie in Word – ohne vorgegebene Beschriftungen. Du musst
              selbst erkennen, welche Elemente fehlen und wie sie aufgebaut werden.
            </p>
          </div>
        </Link>
      </main>
    </div>
  );
}
