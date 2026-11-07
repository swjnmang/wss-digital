import { type MenuItem } from '../../components/layout/MenuPage';
import TaskShell from '../../components/layout/TaskShell'
import { type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'
import { ThemaStart } from '../lineare_funktionen/lernsituation_kit/themastart'

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
  return (
    <TaskShell title="Zinsrechnung" subtitle="Wähle die Lernsituation oder eine Übungsaufgabe aus." width="wide">
      <ThemaStart
        lernsituationen={LERNSITUATIONEN.map((l) => ({ teil: l.teil, thema: l.thema, beschreibung: l.desc, to: l.path }))}
        uebungen={aufgaben.map((it) => ({ titel: it.title, beschreibung: it.desc, to: it.path, icon: it.icon }))}
      />
    </TaskShell>
  );
}
