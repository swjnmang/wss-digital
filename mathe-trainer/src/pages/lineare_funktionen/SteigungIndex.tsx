import { Link } from 'react-router-dom'

const items = [
  {
    title: '1. Die Steigung m ablesen',
    desc: 'Lies die Steigung einer Geraden mit einem Steigungsdreieck direkt aus dem Graphen ab.',
    href: 'ablesen',
    icon: 'fa-solid fa-eye',
  },
  {
    title: '2. Die Steigung m berechnen',
    desc: 'Berechne die Steigung einer Geraden aus zwei Punkten mit m = Δy : Δx.',
    href: 'berechnen',
    icon: 'fa-solid fa-calculator',
  },
]

export default function SteigungIndex() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Die Steigung m</h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">Wähle aus, was du üben möchtest.</p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map((it) => (
            <Link
              key={it.href}
              to={`/lineare_funktionen/steigung/${it.href}`}
              className="bg-white rounded-2xl p-6 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center border border-slate-100"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl text-[var(--accent)] mb-3">
                <i className={it.icon}></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-800">{it.title}</h3>
              <p className="text-slate-500 leading-snug text-sm">{it.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
