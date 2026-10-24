import { Link, useNavigate } from 'react-router-dom'
import { type MenuItem } from '../../components/layout/MenuPage';
import TaskShell from '../../components/layout/TaskShell'
import { LernsituationKarte, type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'

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
  const navigate = useNavigate()
  return (
    <TaskShell title="Ratendarlehen" subtitle="Wähle die Lernsituation oder die Übungsaufgaben aus." width="wide">
      <div className="flex flex-col gap-6">
        <div className="bk-panel text-center flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
          <div className="flex justify-center">
            <LernsituationKarte className="w-full sm:max-w-md" thema={LERNSITUATION.thema} beschreibung={LERNSITUATION.desc} onClick={() => navigate(LERNSITUATION.path)} />
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
                  {it.desc && <small>{it.desc}</small>}
                </span>
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </TaskShell>
  );
}
