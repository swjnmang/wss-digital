import { Link } from 'react-router-dom'
import TaskShell from './TaskShell'

// Untermenü im Heft-Design (z. B. Terme, Brüche, Anwendungsaufgaben):
// Kopf mit Pfad und Titel, darunter die Aufgaben als nummerierte Zeilen. Reihenfolge wie bisher.

export interface MenuItem {
  title: string
  desc?: string
  path: string
  icon?: string
}

interface Props {
  title: string
  subtitle?: string
  items: MenuItem[]
}

export default function MenuPage({ title, subtitle = 'Wähle eine Aufgabe aus der folgenden Liste aus.', items }: Props) {
  return (
    <TaskShell title={title} subtitle={subtitle} width="wide">
      <div className="bk-topics">
        {items.map((it, i) => (
          <Link key={it.path} to={it.path} className="bk-topic">
            <span className="bk-topic-no">{i + 1}</span>
            <span className="bk-topic-text">
              <strong>{it.title.replace(/^\d+\.\s*/, '')}</strong>
              {it.desc && <small>{it.desc}</small>}
            </span>
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </TaskShell>
  )
}
