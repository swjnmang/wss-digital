import { type MenuItem } from '../../components/layout/MenuPage';
import TaskShell from '../../components/layout/TaskShell'
import { type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'
import { ThemaStart } from '../lineare_funktionen/lernsituation_kit/themastart'

export const aufgaben: MenuItem[] = [
  { title: 'Tilgungsplan ausfüllen', desc: 'Fülle den Tilgungsplan für die ersten beiden Jahre und ein weiteres Jahr aus.', path: '/finanzmathe/ratendarlehen/ueben', icon: 'fa-solid fa-file-invoice-dollar' },
];

const LERNSITUATION: { thema: Pick<Thema, 'name' | 'farbe' | 'icon'>; path: string; desc: string } = {
  thema: { name: 'Der neue Backofen', farbe: 'kupfer', icon: 'fa-bread-slice' },
  path: '/finanzmathe/ratendarlehen/lernsituation',
  desc: 'Hilf als Azubi einer Bäckerei bei der Finanzierung eines neuen Ofens und finde heraus, wie ein Ratendarlehen zurückgezahlt wird.',
}

// Auswahl mit der Einstiegs-Lernsituation und der bisherigen Seite als Übungsaufgabe
export default function RatendarlehenMenu() {
  return (
    <TaskShell title="Ratendarlehen" subtitle="Wähle die Lernsituation oder die Übungsaufgaben aus." width="wide">
      <ThemaStart
        lernsituationen={[{ thema: LERNSITUATION.thema, beschreibung: LERNSITUATION.desc, to: LERNSITUATION.path }]}
        uebungen={aufgaben.map((it) => ({ titel: it.title, beschreibung: it.desc, to: it.path, icon: it.icon }))}
      />
    </TaskShell>
  );
}
