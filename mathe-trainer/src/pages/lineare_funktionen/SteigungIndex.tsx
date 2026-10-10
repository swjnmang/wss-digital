import { Link } from 'react-router-dom'
import TaskShell from '../../components/layout/TaskShell'

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
    <TaskShell title="Die Steigung m" subtitle="Wähle aus, was du üben möchtest." width="narrow">
      <div className="bk-tiles" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
        {items.map((it) => (
          <Link key={it.href} to={`/lineare_funktionen/steigung/${it.href}`} className="bk-tile-ex">
            <span className="bk-tile-top">
              <b>{it.title.split('.')[0]}</b>
              <i className={it.icon} aria-hidden="true" />
            </span>
            <strong>{it.title.replace(/^\d+\.\s*/, '')}</strong>
            <small>{it.desc}</small>
          </Link>
        ))}
      </div>
    </TaskShell>
  )
}
