import { Link, useNavigate } from 'react-router-dom'
import { type MenuItem } from '../../components/layout/MenuPage';
import TaskShell from '../../components/layout/TaskShell'
import { LernsituationKarte, type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'

export const aufgaben: MenuItem[] = [
  { title: 'Zinsrechnung üben', desc: 'Berechne Zinsen, Kapital, Zinssatz oder Laufzeit.', path: '/finanzmathe/zinsrechnung/ueben', icon: 'fa-solid fa-percent' },
  { title: 'Zinstage aus Datum berechnen', desc: 'Bestimme die Zinstage t zwischen zwei Kalenderdaten.', path: '/finanzmathe/zinsrechnung/tage', icon: 'fa-solid fa-calendar-days' },
  { title: 'Test: Zinsrechnung', desc: 'Teste dein Wissen unter Prüfungsbedingungen.', path: '/finanzmathe/zinsen_test', icon: 'fa-solid fa-graduation-cap' },
];

const LERNSITUATIONEN: { teil: string; thema: Pick<Thema, 'name' | 'farbe' | 'icon'>; path: string; desc: string }[] = [
  {
    teil: 'Lernsituation 1 · Zinsen berechnen',
    thema: { name: 'Lenas Autogeld', farbe: 'petrol', icon: 'fa-car-side' },
    path: '/finanzmathe/zinsrechnung/lernsituation',
    desc: 'Berate als Azubi in der Bank eine Kundin und finde heraus, wie du Zinsen für einige Tage statt für ein ganzes Jahr berechnest.',
  },
  {
    teil: 'Lernsituation 2 · K, p und t berechnen',
    thema: { name: 'Die Abschlussfahrt-Kasse', farbe: 'beere', icon: 'fa-bus' },
    path: '/finanzmathe/zinsrechnung/lernsituation-2',
    desc: 'Beantworte die drei Fragen der Klasse 10b: Wie viel Kapital, welcher Zinssatz, wie viele Tage? So stellst du die Zinsformel um.',
  },
]

// Auswahl mit den Einstiegs-Lernsituationen (Teil 1 und Teil 2) und den bisherigen Seiten als Übungsaufgaben
export default function ZinsrechnungMenu() {
  const navigate = useNavigate()
  return (
    <TaskShell title="Zinsrechnung" subtitle="Wähle die Lernsituation oder eine Übungsaufgabe aus." width="wide">
      <div className="flex flex-col gap-6">
        <div className="bk-panel text-center flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LERNSITUATIONEN.map((l) => (
              <div key={l.path} className="flex">
                <LernsituationKarte className="w-full" teil={l.teil} thema={l.thema} beschreibung={l.desc} onClick={() => navigate(l.path)} />
              </div>
            ))}
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
