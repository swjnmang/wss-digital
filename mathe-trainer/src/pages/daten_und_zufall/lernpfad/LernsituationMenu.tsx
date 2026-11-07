import TaskShell from '../../../components/layout/TaskShell'
import { ThemaStart } from '../../lineare_funktionen/lernsituation_kit/themastart'
import { metaFor } from '../lernsituationen/meta'
import { LESSONS } from './lessons'

// Auswahlseite eines Lernschritts (Variante B der Skill-Regeln): oben die Einstiegs-Lernsituation,
// darunter die bisherige Übungsseite des Lernschritts unter <Adresse>/ueben.
export default function LernsituationMenu({ slug }: { slug: string }) {
  const meta = metaFor(slug)
  const index = LESSONS.findIndex((l) => l.slug === slug)
  const lesson = LESSONS[index]
  const base = `/daten-und-zufall/${slug}`
  return (
    <TaskShell title={lesson.title} subtitle={`Schritt ${index + 1} von ${LESSONS.length} · Wähle die Lernsituation oder die Übungsaufgaben.`} width="wide" parent={{ to: '/daten-und-zufall', label: 'Daten und Zufall' }}>
      <ThemaStart
        lernsituationen={[{ thema: meta.thema, beschreibung: meta.desc, to: `${base}/lernsituation` }]}
        uebungen={[{ titel: lesson.title, beschreibung: lesson.desc, to: `${base}/ueben`, icon: `fa-${lesson.icon}` }]}
      />
    </TaskShell>
  )
}
