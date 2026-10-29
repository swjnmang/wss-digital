import { Link, useNavigate } from 'react-router-dom'
import TaskShell from '../../../components/layout/TaskShell'
import { LernsituationKarte } from '../../lineare_funktionen/lernsituation_kit/seiten'
import { metaFor } from '../lernsituationen/meta'
import { LESSONS } from './lessons'

// Auswahlseite eines Lernschritts (Variante B der Skill-Regeln): oben die Einstiegs-Lernsituation,
// darunter die bisherige Übungsseite des Lernschritts unter <Adresse>/ueben.
export default function LernsituationMenu({ slug }: { slug: string }) {
  const navigate = useNavigate()
  const meta = metaFor(slug)
  const index = LESSONS.findIndex((l) => l.slug === slug)
  const lesson = LESSONS[index]
  const base = `/daten-und-zufall/${slug}`
  return (
    <TaskShell title={lesson.title} subtitle={`Schritt ${index + 1} von ${LESSONS.length} · Wähle die Lernsituation oder die Übungsaufgaben.`} width="wide" parent={{ to: '/daten-und-zufall', label: 'Daten und Zufall' }}>
      <div className="flex flex-col gap-6">
        <div className="bk-panel text-center flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
          <div className="flex">
            <LernsituationKarte className="w-full" thema={meta.thema} beschreibung={meta.desc} onClick={() => navigate(`${base}/lernsituation`)} />
          </div>
        </div>
        <div className="bk-panel">
          <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">Übungsaufgaben</h2>
          <div className="bk-topics">
            <Link to={`${base}/ueben`} className="bk-topic">
              <span className="bk-topic-no">1</span>
              <span className="bk-topic-text">
                <strong>{lesson.title}</strong>
                <small>{lesson.desc}</small>
              </span>
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </TaskShell>
  )
}
