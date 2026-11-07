import TaskShell from '../../components/layout/TaskShell'
import { ThemaStart } from './lernsituation_kit/themastart'

// Auswahl „Die Steigung m“ (Variante B): oben die Einstiegs-Lernsituation „Der Bikepark“, darunter die Übungsaufgaben.
const BASIS = '/lineare_funktionen/steigung'

const aufgaben = [
  {
    title: 'Die Steigung m ablesen',
    desc: 'Lies die Steigung einer Geraden mit einem Steigungsdreieck direkt aus dem Graphen ab.',
    path: `${BASIS}/ablesen`,
    icon: 'fa-eye',
  },
  {
    title: 'Die Steigung m berechnen',
    desc: 'Berechne die Steigung einer Geraden aus zwei Punkten mit m = Δy : Δx.',
    path: `${BASIS}/berechnen`,
    icon: 'fa-calculator',
  },
]

export default function SteigungIndex() {
  return (
    <TaskShell title="Die Steigung m" subtitle="Wähle die Lernsituation oder eine Übungsaufgabe aus." width="wide">
      <ThemaStart
        lernsituationen={[
          {
            thema: { name: 'Der Bikepark', farbe: 'petrol', icon: 'fa-person-biking' },
            beschreibung: 'Im Jugendrat vergleichst du drei Auffahrten für einen Bikepark. Dabei lernst du, was die Steigung m bedeutet und wie du sie mit einem Steigungsdreieck abliest.',
            to: `${BASIS}/lernsituation-1`,
          },
        ]}
        uebungen={aufgaben.map((it) => ({ titel: it.title, beschreibung: it.desc, to: it.path, icon: it.icon }))}
      />
    </TaskShell>
  )
}
