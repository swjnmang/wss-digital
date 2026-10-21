import { Link, useNavigate } from 'react-router-dom'
import { type MenuItem } from '../../components/layout/MenuPage';
import TaskShell from '../../components/layout/TaskShell'

export const aufgaben: MenuItem[] = [
  { title: 'Zinsrechnung üben', desc: 'Berechne Zinsen, Kapital, Zinssatz oder Laufzeit.', path: '/finanzmathe/zinsrechnung/ueben', icon: 'fa-solid fa-percent' },
  { title: 'Zinstage aus Datum berechnen', desc: 'Bestimme die Zinstage t zwischen zwei Kalenderdaten.', path: '/finanzmathe/zinsrechnung/tage', icon: 'fa-solid fa-calendar-days' },
  { title: 'Test: Zinsrechnung', desc: 'Teste dein Wissen unter Prüfungsbedingungen.', path: '/finanzmathe/zinsen_test', icon: 'fa-solid fa-graduation-cap' },
];

const LERNSITUATIONEN = [
  {
    teil: 'Teil 1 · Zinsen berechnen',
    title: 'Wohin mit Lenas Autogeld?',
    icon: 'fa-solid fa-building-columns',
    path: '/finanzmathe/zinsrechnung/lernsituation',
    desc: 'Neu beim Thema? Berate als Azubi in der Bank eine Kundin und finde heraus, wie du Zinsen für einige Tage statt für ein ganzes Jahr berechnest.',
  },
  {
    teil: 'Teil 2 · K, p und t berechnen',
    title: 'Die Abschlussfahrt-Kasse',
    icon: 'fa-solid fa-thumbtack',
    path: '/finanzmathe/zinsrechnung/lernsituation-2',
    desc: 'Gruppenpuzzle: Werde Expertin oder Experte für Kapital, Zinssatz oder Zinstage und hilf der Klasse 10b, ihr Abschlussgrillen zu finanzieren.',
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
              <button
                key={l.path}
                onClick={() => {
                  navigate(l.path)
                  window.scrollTo({ top: 0 })
                }}
                style={{ background: 'var(--primary)' }}
                className="rounded-2xl text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-sm font-bold mb-1 text-white/90">{l.teil}</p>
                <p className="text-lg font-bold mb-1 text-white">{l.title}</p>
                <p className="text-xl mb-2 text-white">
                  <i className={l.icon} aria-hidden="true" />
                </p>
                <p className="text-sm text-white/90">{l.desc}</p>
              </button>
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
