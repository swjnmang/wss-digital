import { Link, useNavigate } from 'react-router-dom'
import TaskShell from '../../components/layout/TaskShell'

// Kapitel 2.2 Zinseszins: Auswahl zwischen der Einstiegs-Lernsituation „Wer hat nach 10 Jahren mehr?“
// und dem Zinseszinsrechner (Übungsaufgaben). Aufbau wie bei Kapitel 2.1 Zinsrechnung.
const aufgaben = [
  { title: 'Zinseszinsrechner', desc: 'Berechne Endkapital, Anfangskapital, Zinssatz oder Laufzeit mit Erklärvideos.', path: '/finanzmathe/zinseszins/ueben' },
]

export default function ZinseszinsMenu() {
  const navigate = useNavigate()
  return (
    <TaskShell title="Zinseszins" subtitle="Wähle die Lernsituation oder eine Übungsaufgabe aus." width="wide">
      <div className="flex flex-col gap-6">
        <div className="bk-panel text-center flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
          <button
            onClick={() => {
              navigate('/finanzmathe/zinseszins/lernsituation')
              window.scrollTo({ top: 0 })
            }}
            style={{ background: 'var(--primary)' }}
            className="rounded-2xl text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
          >
            <p className="text-lg font-bold mb-1 text-white">Wer hat nach 10 Jahren mehr?</p>
            <p className="text-xl mb-2 text-white">
              <i className="fa-solid fa-comments-dollar" aria-hidden="true" />
            </p>
            <p className="text-sm text-white/90">
              Neu beim Thema? Vergleiche im Chat zwei Sparkonten und entdecke, wie Zinseszins wirkt. Teil 1: Endkapital, Teil 2: Anfangskapital, Zinssatz und Laufzeit (2 × 90 min).
            </p>
          </button>
        </div>
        <div className="bk-panel">
          <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">Übungsaufgaben</h2>
          <div className="bk-topics">
            {aufgaben.map((it, i) => (
              <Link key={it.path} to={it.path} className="bk-topic">
                <span className="bk-topic-no">{i + 1}</span>
                <span className="bk-topic-text">
                  <strong>{it.title}</strong>
                  <small>{it.desc}</small>
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
