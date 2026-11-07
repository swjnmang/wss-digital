import { type MenuItem } from '../../components/layout/MenuPage';
import TaskShell from '../../components/layout/TaskShell'
import { type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'
import { ThemaStart } from '../lineare_funktionen/lernsituation_kit/themastart'

export const aufgaben: MenuItem[] = [
  { title: 'Endwert, Rate oder Laufzeit', desc: 'Regelmäßige Einzahlungen ohne Startkapital, vorschüssig und nachschüssig.', path: '/finanzmathe/endwert/ueben', icon: 'fa-solid fa-piggy-bank' },
];

const LERNSITUATION: { thema: Pick<Thema, 'name' | 'farbe' | 'icon'>; path: string; desc: string } = {
  thema: { name: 'Der Vereinsbus', farbe: 'schiefer', icon: 'fa-van-shuttle' },
  path: '/finanzmathe/endwert/lernsituation',
  desc: 'Hilf deinem Sportverein beim Sparplan für einen Kleinbus und finde heraus, wie viel regelmäßige Einzahlungen mit Zinseszins am Ende wert sind.',
}

// Auswahl mit der Einstiegs-Lernsituation und der bisherigen Seite als Übungsaufgabe
export default function EndwertMenu() {
  return (
    <TaskShell title="Rentenrechnung: Endwert" subtitle="Wähle die Lernsituation oder die Übungsaufgaben aus." width="wide">
      <ThemaStart
        lernsituationen={[{ thema: LERNSITUATION.thema, beschreibung: LERNSITUATION.desc, to: LERNSITUATION.path }]}
        uebungen={aufgaben.map((it) => ({ titel: it.title, beschreibung: it.desc, to: it.path, icon: it.icon }))}
      />
    </TaskShell>
  );
}
