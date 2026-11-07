import { type MenuItem } from '../../components/layout/MenuPage'
import TaskShell from '../../components/layout/TaskShell'
import { type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'
import { ThemaStart } from '../lineare_funktionen/lernsituation_kit/themastart'

export const BASIS = '/quadratische_funktionen/funktionsgleichung_aufstellen'

export const aufgaben: MenuItem[] = [
  { title: 'Funktionsgleichung aufstellen üben', desc: 'Fall 1, Fall 2 und gemischte Aufgaben mit Lösungsweg.', path: `${BASIS}/ueben`, icon: 'fa-solid fa-pen-ruler' },
  { title: 'Additions- und Subtraktionsverfahren üben', desc: 'Lineare Gleichungssysteme mit dem Additions- und Subtraktionsverfahren lösen.', path: '/lineare_funktionen/gleichungssysteme?verfahren=addieren', icon: 'fa-solid fa-plus-minus' },
]

const LERNSITUATIONEN: { teil: string; thema: Pick<Thema, 'name' | 'farbe' | 'icon'>; path: string; desc: string }[] = [
  {
    teil: 'Lernsituation 1 · Scheitelpunkt und ein Punkt',
    thema: { name: 'Der Torbogen', farbe: 'kupfer', icon: 'fa-archway' },
    path: `${BASIS}/lernsituation-1`,
    desc: 'Eine Biegemaschine braucht die Gleichung für einen Torbogen. Finde heraus, wie du aus dem Scheitelpunkt und einem Pfosten die Funktionsgleichung aufstellst.',
  },
  {
    teil: 'Lernsituation 2 · Additions- und Subtraktionsverfahren',
    thema: { name: 'Das Gleichungs-Labor', farbe: 'violett', icon: 'fa-flask' },
    path: `${BASIS}/lernsituation-2`,
    desc: 'Lerne im Gleichungs-Labor, wie du zwei Gleichungen addierst oder subtrahierst, bis eine Variable verschwindet. Das brauchst du für Lernsituation 3.',
  },
  {
    teil: 'Lernsituation 3 · Ein Wert und zwei Punkte',
    thema: { name: 'Der Korbwurf', farbe: 'ocker', icon: 'fa-basketball' },
    path: `${BASIS}/lernsituation-3`,
    desc: 'Baut auf Lernsituation 2 auf. Die Videoanalyse hat nur den Anfang eines Freiwurfs gefilmt. Stelle die Gleichung der Wurfbahn auf und finde heraus, ob der Ball trifft.',
  },
]

// Auswahl mit den drei Einstiegs-Lernsituationen (Fall 1, Additions- und Subtraktionsverfahren, Fall 2) und der bisherigen Seite als Übungsaufgaben
export default function FunktionsgleichungMenu() {
  return (
    <TaskShell title="Funktionsgleichung aufstellen" subtitle="Wähle eine Lernsituation oder eine Übungsaufgabe aus." width="wide">
      <ThemaStart
        lernsituationen={LERNSITUATIONEN.map((l) => ({ teil: l.teil, thema: l.thema, beschreibung: l.desc, to: l.path }))}
        uebungen={aufgaben.map((it) => ({ titel: it.title, beschreibung: it.desc, to: it.path, icon: it.icon }))}
      />
    </TaskShell>
  )
}
