import { useState } from 'react'
import TaskShell from '../../components/layout/TaskShell'
import { THEMEN, type Thema } from '../lineare_funktionen/lernsituation_kit/seiten'
import './themastart.css'

// Entwurfsseite (nicht verlinkt): drei Varianten einer einheitlichen Startseite für Themen mit Lernsituation,
// jeweils an drei echten Themen gezeigt. Nach der Entscheidung wird daraus ein gemeinsamer Baustein.

type Karte = {
  art: 'lernsituation' | 'uebung'
  kicker: string
  titel: string
  formel?: string
  text: string
  icon: string
  farbe?: Thema['farbe']
}

type Beispiel = { titel: string; untertitel: string; karten: Karte[] }

const UEBUNG_ICON = 'fa-pencil'

const BEISPIELE: Record<string, Beispiel> = {
  nullstellen: {
    titel: 'Nullstellen berechnen',
    untertitel: 'Die Nullstelle ist der Punkt, an dem die Gerade die x-Achse schneidet. Dort gilt y = 0.',
    karten: [
      { art: 'lernsituation', kicker: 'Lernsituation', titel: 'Der Stromspeicher', icon: 'fa-battery-half', farbe: 'indigo', text: 'Finde heraus, wann der Stromspeicher einer Solaranlage in der Nacht leer ist, und lerne dabei, wie man die Nullstelle berechnet.' },
      { art: 'uebung', kicker: 'Stufe 1', titel: 'Einfach', formel: 'y = 2x − 6', icon: UEBUNG_ICON, text: 'Ganzzahlige Steigungen – die Nullstelle ist immer eine ganze Zahl.' },
      { art: 'uebung', kicker: 'Stufe 2', titel: 'Fortgeschritten', formel: 'y = 3 − 2,5x', icon: UEBUNG_ICON, text: 'Dezimalzahlen, wechselnde Schreibweise – die Nullstelle ist keine ganze Zahl.' },
    ],
  },
  ratendarlehen: {
    titel: 'Ratendarlehen',
    untertitel: 'Beim Ratendarlehen wird jedes Jahr der gleiche Betrag getilgt.',
    karten: [
      { art: 'lernsituation', kicker: 'Lernsituation', titel: 'Der neue Backofen', icon: 'fa-bread-slice', farbe: 'kupfer', text: 'Hilf als Azubi einer Bäckerei bei der Finanzierung eines neuen Ofens und finde heraus, wie ein Ratendarlehen zurückgezahlt wird.' },
      { art: 'uebung', kicker: 'Übung 1', titel: 'Tilgungsplan ausfüllen', icon: 'fa-file-invoice-dollar', text: 'Fülle den Tilgungsplan für die ersten beiden Jahre und ein weiteres Jahr aus.' },
    ],
  },
  funktionsgleichung: {
    titel: 'Funktionsgleichung aufstellen',
    untertitel: 'Stelle die Gleichung einer Parabel aus dem Scheitelpunkt oder aus mehreren Punkten auf.',
    karten: [
      { art: 'lernsituation', kicker: 'Lernsituation 1 · Scheitelpunkt und ein Punkt', titel: 'Der Torbogen', icon: 'fa-archway', farbe: 'kupfer', text: 'Eine Biegemaschine braucht die Gleichung für einen Torbogen. Stelle sie aus dem Scheitelpunkt und einem Pfosten auf.' },
      { art: 'lernsituation', kicker: 'Lernsituation 2 · Additionsverfahren', titel: 'Das Gleichungs-Labor', icon: 'fa-flask', farbe: 'violett', text: 'Addiere oder subtrahiere zwei Gleichungen, bis eine Variable verschwindet. Das brauchst du für Lernsituation 3.' },
      { art: 'lernsituation', kicker: 'Lernsituation 3 · Ein Wert und zwei Punkte', titel: 'Der Korbwurf', icon: 'fa-basketball', farbe: 'ocker', text: 'Die Videoanalyse hat nur den Anfang eines Freiwurfs gefilmt. Stelle die Gleichung der Wurfbahn auf: Trifft der Ball?' },
      { art: 'uebung', kicker: 'Übung 1', titel: 'Funktionsgleichung aufstellen üben', icon: 'fa-pen-ruler', text: 'Fall 1, Fall 2 und gemischte Aufgaben mit Lösungsweg.' },
      { art: 'uebung', kicker: 'Übung 2', titel: 'Additions- und Subtraktionsverfahren üben', icon: 'fa-plus-minus', text: 'Lineare Gleichungssysteme mit dem Additions- und Subtraktionsverfahren lösen.' },
    ],
  },
}

type Variante = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6'
const VARIANTEN: { id: Variante; name: string; info: string }[] = [
  { id: 'v1', name: 'Variante 1 · Ruhig', info: 'Alle Kästen weiß und gleich gebaut. Farbe nur als Kante oben und im Symbol: Lernsituationen in ihrer Themenfarbe, Übungsaufgaben immer in Füller-Blau.' },
  { id: 'v2', name: 'Variante 2 · Farbflächen', info: 'Lernsituationen als Farbfläche in ihrer Themenfarbe, alle Übungsaufgaben einheitlich in Schiefergrau (kein Grün/Rot mehr). Kräftig, aber nur zwei Farbrollen.' },
  { id: 'v3', name: 'Variante 3 · Liste', info: 'Gleich hohe Zeilen wie im Inhaltsverzeichnis, links ein Symbolfeld (Lernsituation farbig gefüllt, Übung hellblau). Am kompaktesten, viel Platz für viele Übungen.' },
  { id: 'v4', name: 'Variante 4 · Kleine Kacheln', info: 'Kleine weiße Kacheln, vier nebeneinander. Symbol und Titel in einer Zeile, Farbe nur als schmale Kante links (Lernsituation in Themenfarbe, Übung in Füller-Blau). Kein „Starten“-Text, die ganze Kachel ist der Knopf.' },
  { id: 'v5', name: 'Variante 5 · Schmale Zeilen', info: 'Sehr flache Zeilen, drei nebeneinander: kleines farbiges Symbol, Titel und eine Zeile Beschreibung. Am platzsparendsten, alles auf einen Blick.' },
  { id: 'v6', name: 'Variante 6 · Kleine Farbkacheln', info: 'Kleine Kacheln, vier nebeneinander: Lernsituationen in ihrer Themenfarbe gefüllt, Übungen hellblau mit blauer Schrift. Farbig, aber kompakt und ruhig.' },
]

function KarteView({ k, variante, onClick }: { k: Karte; variante: Variante; onClick: () => void }) {
  const style =
    k.art === 'lernsituation' && k.farbe
      ? ({ '--c': THEMEN[k.farbe].farbe, '--c-soft': THEMEN[k.farbe].soft } as React.CSSProperties)
      : undefined
  const go = k.art === 'lernsituation' ? 'Lernsituation starten' : 'Üben'
  const inhalt = (
    <>
      {k.formel && <p className="ts-formel">{k.formel}</p>}
      <p className="ts-desc">{k.text}</p>
    </>
  )
  return (
    <button type="button" className={`ts-card ts-${k.art}`} style={style} onClick={onClick}>
      {variante === 'v3' || variante === 'v5' ? (
        <>
          <span className="ts-icon" aria-hidden="true"><i className={`fa-solid ${k.icon}`} /></span>
          <span className="ts-body">
            <span className="ts-kicker">{k.kicker}</span>
            <span className="ts-title">{k.titel}</span>
            {inhalt}
          </span>
          <i className="fa-solid fa-chevron-right ts-chev" aria-hidden="true" />
        </>
      ) : variante === 'v4' || variante === 'v6' ? (
        <>
          <span className="ts-top">
            <span className="ts-icon" aria-hidden="true"><i className={`fa-solid ${k.icon}`} /></span>
            <span className="ts-tt">
              <span className="ts-kicker">{k.kicker}</span>
              <span className="ts-title">{k.titel}</span>
            </span>
          </span>
          <p className="ts-desc">
            {k.formel && <span className="ts-formel-inline">{k.formel}</span>}
            {k.text}
          </p>
        </>
      ) : (
        <>
          <span className="ts-kicker">
            <span className="ts-icon" aria-hidden="true"><i className={`fa-solid ${k.icon}`} /></span>
            {k.kicker}
          </span>
          <span className="ts-title">{k.titel}</span>
          {inhalt}
          <span className="ts-go">{go} <i className="fa-solid fa-arrow-right" aria-hidden="true" /></span>
        </>
      )}
    </button>
  )
}

export function ThemaStartEntwurf({ beispiel, variante }: { beispiel: Beispiel; variante: Variante }) {
  const [geklickt, setGeklickt] = useState<string | null>(null)
  const ls = beispiel.karten.filter((k) => k.art === 'lernsituation')
  const ue = beispiel.karten.filter((k) => k.art === 'uebung')
  return (
    <div className={`ts ts-${variante}`}>
      <section className="ts-section">
        <div className="ts-head">
          <h2>{ls.length > 1 ? 'Lernsituationen' : 'Lernsituation'}</h2>
          <p>Neu beim Thema? Hier steigst du ein.</p>
        </div>
        <div className="ts-grid">
          {ls.map((k) => <KarteView key={k.titel} k={k} variante={variante} onClick={() => setGeklickt(k.titel)} />)}
        </div>
      </section>
      <section className="ts-section">
        <div className="ts-head">
          <h2>Übungsaufgaben</h2>
          <p>Schon fit? Hier trainierst du.</p>
        </div>
        <div className="ts-grid">
          {ue.map((k) => <KarteView key={k.titel} k={k} variante={variante} onClick={() => setGeklickt(k.titel)} />)}
        </div>
      </section>
      {geklickt && <p className="ts-demo-note">Entwurf: Hier würde „{geklickt}“ geöffnet.</p>}
    </div>
  )
}

export default function StartseitenEntwurf() {
  const params = new URLSearchParams(window.location.search)
  const [variante, setVariante] = useState<Variante>((params.get('v') as Variante) || 'v1')
  const [thema, setThema] = useState<string>(params.get('t') || 'nullstellen')
  const b = BEISPIELE[thema] ?? BEISPIELE.nullstellen
  const v = VARIANTEN.find((x) => x.id === variante)!
  return (
    <TaskShell title={b.titel} subtitle={b.untertitel} width="wide">
      <div className="flex flex-col gap-6">
        <div className="ts-demo-bar">
          <div className="bk-seg" role="group" aria-label="Variante">
            <b>Entwurf:</b>
            {VARIANTEN.map((x) => (
              <button key={x.id} type="button" className={`bk-seg-btn${variante === x.id ? ' bk-seg-btn-on' : ''}`} onClick={() => setVariante(x.id)}>{x.name}</button>
            ))}
          </div>
          <div className="bk-seg" role="group" aria-label="Thema">
            <b>Thema:</b>
            {Object.entries(BEISPIELE).map(([id, x]) => (
              <button key={id} type="button" className={`bk-seg-btn${thema === id ? ' bk-seg-btn-on' : ''}`} onClick={() => setThema(id)}>{x.titel}</button>
            ))}
          </div>
          <p className="ts-demo-note">{v.info}</p>
        </div>
        <ThemaStartEntwurf beispiel={b} variante={variante} />
      </div>
    </TaskShell>
  )
}
