import { type MenuItem } from '../../components/layout/MenuPage'
import TaskShell from '../../components/layout/TaskShell'
import { type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'
import { ThemaStart } from '../lineare_funktionen/lernsituation_kit/themastart'

export const aufgaben: MenuItem[] = [
  { title: 'Tilgungsplan ausfüllen', desc: 'Fülle den Tilgungsplan für die ersten beiden Jahre und ein weiteres Jahr aus.', path: '/finanzmathe/annuitaetendarlehen/ueben', icon: 'fa-solid fa-hand-holding-dollar' },
]

const LERNSITUATION: { thema: Pick<Thema, 'name' | 'farbe' | 'icon'>; path: string; desc: string } = {
  thema: { name: 'Die Solaranlage', farbe: 'indigo', icon: 'fa-solar-panel' },
  path: '/finanzmathe/annuitaetendarlehen/lernsituation',
  desc: 'Berate als Azubi in der Bank Frau Lorenz bei der Finanzierung ihrer Solaranlage und stelle den Tilgungsplan für die ersten zwei Jahre auf.',
}

// Auswahl mit der Einstiegs-Lernsituation und der bisherigen Seite als Übungsaufgabe
export default function AnnuitaetendarlehenMenu() {
  return (
    <TaskShell title="Annuitätendarlehen" subtitle="Wähle die Lernsituation oder die Übungsaufgaben aus." width="wide">
      <ThemaStart
        lernsituationen={[{ thema: LERNSITUATION.thema, beschreibung: LERNSITUATION.desc, to: LERNSITUATION.path }]}
        uebungen={aufgaben.map((it) => ({ titel: it.title, beschreibung: it.desc, to: it.path, icon: it.icon }))}
      />
    </TaskShell>
  )
}
