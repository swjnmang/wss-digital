import { Link } from 'react-router-dom'

const items = [
  { title: '1. Proportionale Zusammenhänge (Einstieg)', desc: 'Fülle Wertetabellen zu Alltagsbeispielen aus und zeichne die passende Ursprungsgerade - der ideale Einstieg vor den linearen Funktionen.', href: 'proportionale_zusammenhaenge', icon: 'fa-solid fa-compass' },
  { title: '2. Was ist eine lineare Funktion?', desc: 'Verstehe, wie Wertetabelle, Graph und Gleichung zusammengehören, und ordne sie einander zu.', href: 'was_ist_linear', icon: 'fa-solid fa-lightbulb' },
  { title: '3. Wertetabelle erstellen und vervollständigen', desc: 'Erstelle Wertetabellen für lineare Funktionen und löse fehlende Werte.', href: 'wertetabelle', icon: 'fa-solid fa-table' },
  { title: '4. Graph zeichnen', desc: 'Übe das Zeichnen von linearen Funktionen im Koordinatensystem.', href: 'zeichnen', icon: 'fa-solid fa-pencil' },
  { title: '5. Die Steigung m', desc: 'Lies die Steigung einer Geraden mit dem Steigungsdreieck ab oder berechne sie aus zwei Punkten.', href: 'steigung', icon: 'fa-solid fa-chart-line' },
  { title: '6. y-Achsenabschnitt', desc: 'Lerne Funktionen der Form y = m·x + t kennen: Der y-Achsenabschnitt t verschiebt die Gerade entlang der y-Achse.', href: 'y_achsenabschnitt', icon: 'fa-solid fa-arrows-up-down' },
  { title: '7. Funktionsgleichung ablesen', desc: 'Lese die Funktionsgleichung direkt aus einem Graphen ab.', href: 'ablesen', icon: 'fa-solid fa-eye' },
  { title: '8. Funktionsgleichung aufstellen', desc: 'Stelle die Gleichung einer Geraden aus gegebenen Informationen auf.', href: 'funktionsgleichung', icon: 'fa-solid fa-pen-ruler' },
  { title: '9. Punkt auf Gerade prüfen', desc: 'Überprüfe rechnerisch, ob ein Punkt auf einer Geraden liegt.', href: 'punkt_gerade', icon: 'fa-solid fa-magnifying-glass-chart' },
  { title: '10. Parallele und senkrechte Geraden', desc: 'Erkenne parallele und senkrechte Geraden anhand ihrer Steigung.', href: 'parallel_senkrecht', icon: 'fa-solid fa-lines-leaning' },
  { title: '11. Nullstellen berechnen', desc: 'Finde den Schnittpunkt einer Geraden mit der x-Achse.', href: 'nullstellen', icon: 'fa-solid fa-arrows-down-to-line' },
  { title: '12. Schnittpunkt zweier Geraden', desc: 'Berechne den gemeinsamen Schnittpunkt von zwei Geraden.', href: 'schnittpunkt', icon: 'fa-solid fa-arrows-turn-to-dots' },
  { title: '13. Lineare Gleichungssysteme', desc: 'Löse Gleichungssysteme mit dem Einsetzungs-, Gleichsetzungs- und Additionsverfahren.', href: 'gleichungssysteme', icon: 'fa-solid fa-equals' },
  { title: '14. Gemischte Übungsaufgaben', desc: 'Gemischte Aufgaben zu allen Themen der linearen Funktionen.', href: 'gemischte-aufgaben', icon: 'fa-solid fa-shuffle' },
  { title: '15. Spiel: Münzen sammeln', desc: 'Eine spielerische Anwendung zum Thema lineare Funktionen.', href: 'spiel_muenzen', icon: 'fa-solid fa-gamepad' },
  { title: '16. Anwendungsaufgaben', desc: 'Realistische Aufgaben mit linearen Funktionen aus dem Alltag.', href: 'anwendungsaufgaben', icon: 'fa-solid fa-lightbulb' },
  { title: '17. Abschlusstest', desc: 'Teste dein Wissen über lineare Funktionen.', href: 'test', icon: 'fa-solid fa-graduation-cap' },
  { title: '18. Übungsblatt-Generator', desc: 'Stelle dir ein personalisiertes Übungsblatt zusammen und lade es als PDF herunter.', href: 'ubungsblatt-generator', icon: 'fa-solid fa-file-pdf' },
  { title: '19. Wer wird Millionär?', desc: 'Das Quiz zu allen Themen der linearen Funktionen - mit 50:50-, Publikums- und Telefonjoker.', href: 'wer_wird_millionaer', icon: 'fa-solid fa-sack-dollar' }
]

export default function LineareIndex() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Lineare Funktionen</h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
            Wähle eine Aufgabe aus der folgenden Liste aus.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {items.map((it) => (
            <Link
              key={it.title}
              to={`/lineare_funktionen/${it.href}`}
              className="bg-white rounded-2xl p-4 sm:p-5 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 flex items-center justify-center text-lg sm:text-xl text-[var(--accent)] mb-3">
                <i className={it.icon}></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 text-slate-800">{it.title}</h3>
              <p className="text-slate-500 leading-snug text-sm">{it.desc}</p>
              <div className="mt-auto" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
