import { Link, useNavigate } from 'react-router-dom'
import TaskShell from '../../components/layout/TaskShell'
import { LernsituationKarte } from './lernsituation_kit/seiten'

// Auswahl „Die Steigung m“ (Variante B): oben die Einstiegs-Lernsituation „Der Bikepark“, darunter die Übungsaufgaben.
const BASIS = '/lineare_funktionen/steigung'

const aufgaben = [
  {
    title: 'Die Steigung m ablesen',
    desc: 'Lies die Steigung einer Geraden mit einem Steigungsdreieck direkt aus dem Graphen ab.',
    path: `${BASIS}/ablesen`,
  },
  {
    title: 'Die Steigung m berechnen',
    desc: 'Berechne die Steigung einer Geraden aus zwei Punkten mit m = Δy : Δx.',
    path: `${BASIS}/berechnen`,
  },
]

export default function SteigungIndex() {
  const navigate = useNavigate()
  return (
    <TaskShell title="Die Steigung m" subtitle="Wähle die Lernsituation oder eine Übungsaufgabe aus." width="wide">
      <div className="flex flex-col gap-6">
        <div className="bk-panel text-center flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex">
              <LernsituationKarte
                className="w-full"
                thema={{ name: 'Der Bikepark', farbe: 'petrol', icon: 'fa-person-biking' }}
                beschreibung="Im Jugendrat vergleichst du drei Auffahrten für einen Bikepark. Dabei lernst du, was die Steigung m bedeutet und wie du sie mit einem Steigungsdreieck abliest."
                onClick={() => navigate(`${BASIS}/lernsituation-1`)}
              />
            </div>
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
