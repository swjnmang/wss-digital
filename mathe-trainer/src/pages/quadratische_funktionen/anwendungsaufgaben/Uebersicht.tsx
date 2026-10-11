import MenuPage from '../../../components/layout/MenuPage'
import { ANWENDUNGEN } from './aufgaben'

// Übersicht der Anwendungsaufgaben zu quadratischen Funktionen (nachgebaut nach Abschlussprüfungen).

export default function AnwendungsaufgabenQF() {
  return (
    <MenuPage
      title="Anwendungsaufgaben"
      subtitle="Prüfungsaufgaben „Funktionaler Zusammenhang“ im Stil der Abschlussprüfung – je 15 Punkte, mit Taschenrechner."
      items={ANWENDUNGEN.map((a) => ({ title: a.titel, desc: a.kurz, path: `/quadratische_funktionen/anwendungsaufgaben/${a.slug}` }))}
    />
  )
}
