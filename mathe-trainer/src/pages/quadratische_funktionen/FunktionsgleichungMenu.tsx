import { Link, useNavigate } from 'react-router-dom'
import { type MenuItem } from '../../components/layout/MenuPage'
import TaskShell from '../../components/layout/TaskShell'
import { LernsituationKarte, type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'

export const BASIS = '/quadratische_funktionen/funktionsgleichung_aufstellen'

export const aufgaben: MenuItem[] = [
  { title: 'Funktionsgleichung aufstellen üben', desc: 'Fall 1, Fall 2 und gemischte Aufgaben mit Lösungsweg.', path: `${BASIS}/ueben`, icon: 'fa-solid fa-pen-ruler' },
  { title: 'Additions- und Subtraktionsverfahren üben', desc: 'Lineare Gleichungssysteme mit dem Additions- und Subtraktionsverfahren lösen.', path: '/lineare_funktionen/gleichungssysteme?verfahren=addieren', icon: 'fa-solid fa-plus-minus' },
]

const LERNSITUATIONEN: { teil: string; thema: Pick<Thema, 'name' | 'farbe' | 'icon'>; path: string; desc: string }[] = [
  {
    teil: 'Lernsituation 1 · Scheitelpunkt und ein Punkt',
    thema: { name: 'Der Torbogen', farbe: 'kupfer', icon: 'fa-archway' },
    path: `${BASIS}/lernsituation-1`,
    desc: 'Eine Biegemaschine braucht die Gleichung für einen Torbogen. Finde heraus, wie du aus dem Scheitelpunkt und einem Pfosten die Funktionsgleichung aufstellst.',
  },
  {
    teil: 'Lernsituation 2 · Additions- und Subtraktionsverfahren',
    thema: { name: 'Das Gleichungs-Labor', farbe: 'violett', icon: 'fa-flask' },
    path: `${BASIS}/lernsituation-2`,
    desc: 'Lerne im Gleichungs-Labor, wie du zwei Gleichungen addierst oder subtrahierst, bis eine Variable verschwindet. Das brauchst du für Lernsituation 3.',
  },
  {
    teil: 'Lernsituation 3 · Ein Wert und zwei Punkte',
    thema: { name: 'Der Korbwurf', farbe: 'ocker', icon: 'fa-basketball' },
    path: `${BASIS}/lernsituation-3`,
    desc: 'Baut auf Lernsituation 2 auf. Die Videoanalyse hat nur den Anfang eines Freiwurfs gefilmt. Stelle die Gleichung der Wurfbahn auf und finde heraus, ob der Ball trifft.',
  },
]

// Auswahl mit den drei Einstiegs-Lernsituationen (Fall 1, Additions- und Subtraktionsverfahren, Fall 2) und der bisherigen Seite als Übungsaufgaben
export default function FunktionsgleichungMenu() {
  const navigate = useNavigate()
  return (
    <TaskShell title="Funktionsgleichung aufstellen" subtitle="Wähle eine Lernsituation oder eine Übungsaufgabe aus." width="wide">
      <div className="flex flex-col gap-6">
        <div className="bk-panel text-center flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
