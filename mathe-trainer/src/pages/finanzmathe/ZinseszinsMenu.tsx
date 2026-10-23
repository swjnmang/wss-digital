import { Link, useNavigate } from 'react-router-dom'
import TaskShell from '../../components/layout/TaskShell'
import { LernsituationKarte, type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'

// Kapitel 2.2 Zinseszins: Auswahl zwischen den beiden Einstiegs-Lernsituationen und dem Zinseszinsrechner (Übungsaufgaben).
// Aufbau wie bei Kapitel 2.1 Zinsrechnung.
const aufgaben = [
  { title: 'Zinseszinsrechner', desc: 'Berechne Endkapital, Anfangskapital, Zinssatz oder Laufzeit mit Erklärvideos.', path: '/finanzmathe/zinseszins/ueben' },
]

const LERNSITUATIONEN: { teil: string; thema: Pick<Thema, 'name' | 'farbe' | 'icon'>; path: string; desc: string }[] = [
  {
    teil: 'Lernsituation 1 · Endkapital',
    thema: { name: 'Wer hat nach 10 Jahren mehr?', farbe: 'violett', icon: 'fa-seedling' },
    path: '/finanzmathe/zinseszins/lernsituation',
    desc: 'Mira lässt die Zinsen auf dem Konto, Jonas lässt sie auszahlen. Finde heraus, wie Zinseszins wirkt, und berechne das Endkapital.',
  },
  {
    teil: 'Lernsituation 2 · Anfangskapital, Zinssatz, Laufzeit',
    thema: { name: 'Miras drei Fragen', farbe: 'ocker', icon: 'fa-hourglass-half' },
    path: '/finanzmathe/zinseszins/lernsituation-2',
    desc: 'Wie viel muss Mira anlegen, welcher Zinssatz steckt im Angebot, wann hat sich ihr Geld verdoppelt? Stelle die Zinseszinsformel um.',
  },
]

export default function ZinseszinsMenu() {
  const navigate = useNavigate()
  return (
    <TaskShell title="Zinseszins" subtitle="Wähle eine Lernsituation oder eine Übungsaufgabe aus." width="wide">
      <div className="flex flex-col gap-6">
        <div className="bk-panel text-center flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LERNSITUATIONEN.map((l) => (
              <div key={l.path} className="flex">
                <LernsituationKarte className="w-full" teil={l.teil} thema={l.thema} beschreibung={l.desc} onClick={() => navigate(l.path)} />
              </div>
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
