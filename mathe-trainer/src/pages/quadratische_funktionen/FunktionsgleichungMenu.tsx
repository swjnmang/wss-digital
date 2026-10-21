import { Link, useNavigate } from 'react-router-dom'
import { type MenuItem } from '../../components/layout/MenuPage'
import TaskShell from '../../components/layout/TaskShell'

export const BASIS = '/quadratische_funktionen/funktionsgleichung_aufstellen'

export const aufgaben: MenuItem[] = [
  { title: 'Funktionsgleichung aufstellen üben', desc: 'Fall 1, Fall 2 und gemischte Aufgaben mit Lösungsweg.', path: `${BASIS}/ueben`, icon: 'fa-solid fa-pen-ruler' },
  { title: 'Additionsverfahren üben', desc: 'Lineare Gleichungssysteme mit dem Additionsverfahren lösen.', path: '/lineare_funktionen/gleichungssysteme?verfahren=addieren', icon: 'fa-solid fa-plus-minus' },
]

const LERNSITUATIONEN = [
  {
    teil: 'Lernsituation 1 · Scheitelpunkt und ein Punkt',
    title: 'Der Torbogen für die Hofeinfahrt',
    icon: 'fa-solid fa-archway',
    path: `${BASIS}/lernsituation-1`,
    desc: 'Drei Azubis haben die Gleichung für einen Torbogen berechnet, aber passt eine davon wirklich? Finde die Fehler und lerne, wie du die Gleichung aus dem Scheitelpunkt aufstellst.',
  },
  {
    teil: 'Lernsituation 2 · Ein Wert und zwei Punkte',
    title: 'Lohnen sich 60 Hoodies?',
    icon: 'fa-solid fa-shirt',
    path: `${BASIS}/lernsituation-2`,
    desc: 'Die Schülerfirma will groß bestellen. Lerne das Additionsverfahren kennen, stelle die Gewinnfunktion auf und entscheide, ob sich die Bestellung lohnt.',
  },
]

// Auswahl mit den beiden Einstiegs-Lernsituationen (Fall 1 und Fall 2) und der bisherigen Seite als Übungsaufgaben
export default function FunktionsgleichungMenu() {
  const navigate = useNavigate()
  return (
    <TaskShell title="Funktionsgleichung aufstellen" subtitle="Wähle eine Lernsituation oder eine Übungsaufgabe aus." width="wide">
      <div className="flex flex-col gap-6">
        <div className="bk-panel text-center flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LERNSITUATIONEN.map((l) => (
              <button
                key={l.path}
                onClick={() => {
                  navigate(l.path)
                  window.scrollTo({ top: 0 })
                }}
                style={{ background: 'var(--primary)' }}
                className="rounded-2xl text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-sm font-bold mb-1 text-white/90">{l.teil}</p>
                <p className="text-lg font-bold mb-1 text-white">{l.title}</p>
                <p className="text-xl mb-2 text-white">
                  <i className={l.icon} aria-hidden="true" />
                </p>
                <p className="text-sm text-white/90">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="bk-panel">
          <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">Übungsaufgaben</h2>
          <div className="bk-topics">
            {aufgaben.map((it, i) => (
              <Link key={it.path} to={it.path} className="bk-topic">
                <span className="bk-topic-no">{i + 1}</span>
                <span className="bk-topic-text">
                  <strong>{it.title}</strong>
                  {it.desc && <small>{it.desc}</small>}
                </span>
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </TaskShell>
  )
}
