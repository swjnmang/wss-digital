import type { Thema } from '../../lineare_funktionen/lernsituation_kit/seiten'

// Identität und Kartentext der Einstiegs-Lernsituationen zu den Lernschritten 5.1 bis 5.7 (Daten und Zufall).
// Die Auswahlseite eines Lernschritts (LernsituationMenu) und die Lernsituation selbst lesen diese Angaben.
export interface LernsituationMeta {
  /** Slug des Lernschritts, siehe lernpfad/lessons.ts */
  slug: string
  /** Nummer im Lehrplan, z. B. „5.1“ */
  nr: string
  thema: Pick<Thema, 'name' | 'farbe' | 'icon'>
  desc: string
}

export const LERNSITUATIONEN: LernsituationMeta[] = [
  { slug: 'daten-ordnen', nr: '5.1', thema: { name: 'Der Pausenkiosk', farbe: 'ocker', icon: 'fa-store' }, desc: 'Der Kiosk soll sein Sortiment anpassen. Du machst aus 40 wild notierten Antworten eine übersichtliche Häufigkeitstabelle.' },
  { slug: 'haeufigkeiten', nr: '5.2', thema: { name: 'Das Freiwurf-Duell', farbe: 'petrol', icon: 'fa-basketball' }, desc: 'Wer ist die bessere Werferin? 18 von 30 gegen 24 von 40: Du lernst, Trefferquoten mit relativer Häufigkeit fair zu vergleichen.' },
  { slug: 'diagramme', nr: '5.3', thema: { name: 'Die Schlagzeile', farbe: 'violett', icon: 'fa-newspaper' }, desc: 'Eine Zeitung zeigt ein Diagramm mit dramatischer Botschaft. Du entlarvst die Tricks und zeichnest ein ehrliches Diagramm.' },
  { slug: 'kennwerte', nr: '5.4', thema: { name: 'Der Pizzabote', farbe: 'beere', icon: 'fa-pizza-slice' }, desc: 'Zwei Pizzerien liefern angeblich schnell. Mit Spannweite, Modalwert, Median und Mittelwert entscheidest du, wem du glaubst.' },
  { slug: 'kennwerte-bewerten', nr: '5.5', thema: { name: 'Das Durchschnittsgehalt', farbe: 'kupfer', icon: 'fa-money-bill-wave' }, desc: 'Die Firma wirbt mit einem tollen Durchschnittsgehalt. Du erkennst Ausreißer und wählst den Kennwert, der ehrlich ist.' },
  { slug: 'zufallsexperimente', nr: '5.6', thema: { name: 'Das Glücksrad', farbe: 'indigo', icon: 'fa-dice' }, desc: 'Ist das Glücksrad am Schulfest fair? Du probierst aus, rechnest mit der Laplace-Wahrscheinlichkeit und baust ein faires Spiel.' },
  { slug: 'baumdiagramme', nr: '5.7', thema: { name: 'Die Wundertüte', farbe: 'blau', icon: 'fa-gift' }, desc: 'Zwei Mal ziehen aus der Wundertüte: Du zeichnest ein Baumdiagramm und berechnest, wie wahrscheinlich der Hauptgewinn ist.' },
]

export const metaFor = (slug: string) => LERNSITUATIONEN.find((l) => l.slug === slug)!
