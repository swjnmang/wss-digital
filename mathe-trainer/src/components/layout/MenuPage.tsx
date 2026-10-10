import { Link } from 'react-router-dom'
import TaskShell from './TaskShell'

// Untermenü im Baukasten-Design (z. B. Terme, Brüche, Anwendungsaufgaben):
// Kopf in der Bereichsfarbe, darunter die Aufgaben als Nummern-Kacheln. Reihenfolge wie bisher.

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
      <div className="bk-tiles">
        {items.map((it, i) => (
          <Link key={it.path} to={it.path} className={`bk-tile-ex${i === 0 ? ' is-start' : ''}`}>
            <span className="bk-tile-top">
              <b>{i + 1}</b>
              {i === 0 ? <span className="bk-chip">Einstieg</span> : <i className={it.icon ?? 'fa-solid fa-pen'} aria-hidden="true" />}
            </span>
            <strong>{it.title.replace(/^\d+\.\s*/, '')}</strong>
            {it.desc && <small>{it.desc}</small>}
          </Link>
        ))}
      </div>
    </TaskShell>
  )
}
