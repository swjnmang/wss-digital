import TaskShell from '../../components/layout/TaskShell'
import { type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'
import { ThemaStart } from '../lineare_funktionen/lernsituation_kit/themastart'

// Kapitel 2.2 Zinseszins: Auswahl zwischen den beiden Einstiegs-Lernsituationen und dem Zinseszinsrechner (Übungsaufgaben).
// Aufbau wie bei Kapitel 2.1 Zinsrechnung.
const aufgaben = [
  { title: 'Zinseszinsrechner', desc: 'Berechne Endkapital, Anfangskapital, Zinssatz oder Laufzeit mit Erklärvideos.', path: '/finanzmathe/zinseszins/ueben', icon: 'fa-calculator' },
]

const LERNSITUATIONEN: { teil: string; thema: Pick<Thema, 'name' | 'farbe' | 'icon'>; path: string; desc: string }[] = [
  {
    teil: 'Lernsituation 1 · Endkapital',
    thema: { name: 'Die Münztürme', farbe: 'ocker', icon: 'fa-coins' },
    path: '/finanzmathe/zinseszins/lernsituation',
    desc: 'Mira lässt die Zinsen auf dem Konto, Jonas lässt sie auszahlen. Finde heraus, wie Zinseszins wirkt, und berechne das Endkapital.',
  },
  {
    teil: 'Lernsituation 2 · Anfangskapital, Zinssatz, Laufzeit',
    thema: { name: 'Miras drei Fragen', farbe: 'kupfer', icon: 'fa-hourglass-half' },
    path: '/finanzmathe/zinseszins/lernsituation-2',
    desc: 'Wie viel muss Mira anlegen, welcher Zinssatz steckt im Angebot, wann hat sich ihr Geld verdoppelt? Stelle die Zinseszinsformel um.',
  },
]

export default function ZinseszinsMenu() {
  return (
    <TaskShell title="Zinseszins" subtitle="Wähle eine Lernsituation oder eine Übungsaufgabe aus." width="wide">
      <ThemaStart
        lernsituationen={LERNSITUATIONEN.map((l) => ({ teil: l.teil, thema: l.thema, beschreibung: l.desc, to: l.path }))}
        uebungen={aufgaben.map((it) => ({ titel: it.title, beschreibung: it.desc, to: it.path, icon: it.icon }))}
      />
    </TaskShell>
  )
}
