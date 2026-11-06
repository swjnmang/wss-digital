import { useEffect, useId, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { useSitzungState } from '../../../hooks/useSitzung'
import { Beispiel, M, MB, Merke, Tabelle, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, Loesungsweg, McCard, tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Handlungsprodukt,
  SeitenLernsituation,
  type Bildwelt,
  type Seite,
  type Thema,
} from '../../lineare_funktionen/lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien, Vermutung, standardKriterien, type Festlegung } from '../../finanzmathe/zins_kit/zins_kit'
import titelBild from './bilder/korbwurf-titel.webp'
import notizBild from './bilder/korbwurf-notiz.webp'
import { LERNVIDEO_FALL2 } from '../FunktionsgleichungAufstellen'
import Korbjaeger from './Korbjaeger'
import { KORB_H, Spielfeld, hoehe, type Bahn, type BahnBild } from './Spielfeld'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './korbwurf.css'

// Lernsituation 3 „Trifft der Korbwurf?“: Funktionsgleichung aus einem bekannten Wert und zwei Punkten (Fall 2), graphisch gedeutet (ca. 90 min).
// Voraussetzung: das Additions- und Subtraktionsverfahren aus Lernsituation 2 („Das Gleichungs-Labor“).
// Format Entscheidungsfall: Die Basketball-AG filmt Freiwürfe mit einer Videoanalyse-App. Die Kamera hat nur den Anfang der Würfe aufgenommen,
// dann lief jemand durchs Bild. Trifft Linas Wurf? Und der von Jonas?
// Problem erkennen: Festlegung (Treffer, zu kurz, zu weit), dann in der App a, b und c ausprobieren (a = −0,5 ist aus der Abwurfgeschwindigkeit bekannt).
// Die Bahn wird sofort gezeichnet, die App vergleicht mit den Messpunkten P(1 | 3,8) und Q(2 | 4,55). Durch Raten trifft man beide kaum.
// Problem lösen in zwei Teilen auf je einer eigenen Seite (Teil 2 erst nach Teil 1), je Problem → Beispielrechnung mit Lernvideo Fall 2 → Ergebnisse abgleichen:
// Teil 1 a bekannt (Lina: II − I, c fällt weg): y = −0,5x² + 2,25x + 2,05, bei x = 4 genau 3,05 m → Treffer.
// Teil 2 c bekannt (Jonas, Abwurfhöhe 2,2 m: I · 2, dann subtrahieren): y = −0,4x² + 1,6x + 2,2, bei x = 4 nur 2,2 m → zu kurz.
// Aha: Jonas' Ball steigt am Anfang fast genauso wie Linas, ist bei x = 2 aber schon am höchsten Punkt und fliegt 85 cm unter dem Ring durch.
// Handlungsprodukt analog: Analyse-Notiz für die Trainerin mit beschrifteter Skizze beider Bahnen, Gleichungen, Rechnung und Urteil.
// Identität: Themenfarbe Ocker, Symbol fa-basketball, Titelbild Sporthalle mit Korb, gefilmter Bahn und „nicht gefilmt“-Bereich,
// Leitobjekt die Videoanalyse-App. Bildwelt Reportage / Hochglanz: Aufmacherbild (Sporthalle) und Analyse-Notiz sind gerenderte
// WebP-Dateien aus bilder-quelle/korbwurf-*.bild.html; das Spielfeld mit Live-Rückmeldung bleibt Inline-SVG.
// Punkte nach Aufwand: Warm-up 2/2/3/2/2, Festlegung 3, App 3, Teil 1 12, Teil 2 14, Entscheidung 3, Analyse-Notiz 5, Übungen 4/6/5/8, Profi 9,
// Bonus-Spiel 4 Münzen à 2 (Pflicht zusammen 74: Warm-up 15 %, Problem erkennen 8 %, Problem lösen 46 %, Übungen 31 %).

/** Lernvideo zu Fall 2 (auch bei den Übungsaufgaben unter /funktionsgleichung_aufstellen/ueben verlinkt) */
const VIDEO_FALL2 = `https://www.youtube.com/watch?v=${LERNVIDEO_FALL2}`

/* ── Situation ───────────────────────────────────────────────────────────── */

// x = Entfernung vom Abwurfpunkt in m, y = Höhe in m, Korbmitte K(4 | 3,05)
const KORB_X = 4
const LINA: Bahn = { a: -0.5, b: 2.25, c: 2.05 }
const P1 = { x: 1, y: 3.8 }
const Q1 = { x: 2, y: 4.55 }
const JONAS: Bahn = { a: -0.4, b: 1.6, c: 2.2 }
const P2 = { x: 1, y: 3.4 }
const Q2 = { x: 2, y: 3.8 }

type Wahl = 'kurz' | 'weit' | 'treffer'
const WAHL: Record<Wahl, string> = {
  kurz: 'Der Ball fliegt zu kurz oder zu flach und bleibt unter dem Ring.',
  weit: 'Der Ball fliegt zu hoch und über den Korb hinweg.',
  treffer: 'Der Ball geht in den Korb.',
}

/** Ein Versuch in der App: a, b und c */
type Versuch = Bahn
const passt = (v: Versuch, p: { x: number; y: number }) => Math.abs(hoehe(v, p.x) - p.y) < 0.0051
/** a muss stimmen (aus der Abwurfgeschwindigkeit bekannt), dann muss die Bahn durch P und Q gehen */
const aPasst = (v: Versuch) => Math.abs(v.a - LINA.a) < 0.0001
const treffer = (v: Versuch) => aPasst(v) && passt(v, P1) && passt(v, Q1)
const daneben = (v: Versuch) => Math.abs(hoehe(v, P1.x) - P1.y) + Math.abs(hoehe(v, Q1.x) - Q1.y)
/** Länge in m als Text mit Komma und echtem Minus */
const meter = (v: number) => `${fmt(v, 2).replace('-', '−')} m`
/** Bahn als TeX, z. B. „y = −0,5x² + 2,25x + 2,05“ */
const bahnTex = (k: Bahn) =>
  `y = ${tx(k.a)}x^2 ${k.b < 0 ? '-' : '+'} ${tx(Math.abs(k.b))}x ${k.c < 0 ? '-' : '+'} ${tx(Math.abs(k.c))}`

/* ── Identität ───────────────────────────────────────────────────────────── */

const THEMA: Thema = {
  name: 'Der Korbwurf',
  farbe: 'ocker',
  icon: 'fa-basketball',
  kicker: 'Aus der Basketball-AG',
  bildzeile: 'Die Videoanalyse bricht mitten im Wurf ab. Illustration: Mathe-Trainer',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Eine helle Sporthalle mit Basketballkorb rechts. Von links fliegt ein Ball auf einer gestrichelten Bahn mit den Messpunkten P und Q. Danach folgt ein grauer Bereich mit der Aufschrift nicht gefilmt und einem Fragezeichen. Vorne links steht ein Handy auf einem Stativ."
    />
  ),
}
const BILDWELT: Bildwelt = { welt: 'reportage', variante: 'hochglanz' }

/** Spielfeld in der Seitenbreite */
function Feld(props: Parameters<typeof Spielfeld>[0]) {
  return (
    <div className="bk-graph ls-graph kw-bild">
      <Spielfeld {...props} />
    </div>
  )
}

const PUNKTE_LINA = [
  { ...P1, text: 'P(1 | 3,8)' },
  { ...Q1, text: 'Q(2 | 4,55)' },
]
const PUNKTE_JONAS = [
  { ...P2, text: 'P(1 | 3,4)', unten: true },
  { ...Q2, text: 'Q(2 | 3,8)', unten: true },
]

/* ── Phase 2: die Videoanalyse-App ───────────────────────────────────────── */

/** Videoanalyse-App: a, b und c eintippen, die Bahn erscheint sofort im Spielfeld, die App vergleicht mit den Messpunkten */
function AnalyseApp({ versuche, onZeichnen }: { versuche: Versuch[]; onZeichnen: (v: Versuch) => void }) {
  const uid = useId()
  const [eingabe, setEingabe] = useState({ a: '', b: '', c: '' })
  const [fehlt, setFehlt] = useState(false)
  const letzter = versuche[versuche.length - 1]
  const getroffen = versuche.some(treffer)
  // Ausprobieren zählt wie eine Festlegung (PUNKTE.festlegung), sobald die Seite frei ist
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const frei = versuche.length >= 3 || getroffen
  useEffect(() => {
    if (frei) pt.geloest()
  }, [frei, pt])
  const bahnen: BahnBild[] = versuche.map((v, i) => ({
    ...v,
    art: treffer(v) ? 'treffer' : i === versuche.length - 1 ? 'aktuell' : 'alt',
  }))

  const zeichnen = () => {
    const a = parseInput(eingabe.a)
    const b = parseInput(eingabe.b)
    const c = parseInput(eingabe.c)
    if (!a || !b || !c) return setFehlt(true)
    setFehlt(false)
    onZeichnen({ a: a.value, b: b.value, c: c.value })
  }
  const feld = (k: 'a' | 'b' | 'c', label: string) => (
    <input
      id={`${uid}-${k}`}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={k}
      aria-label={label}
      className="bk-input lp-input lp-input-sm ls-gap"
      value={eingabe[k]}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe({ ...eingabe, [k]: e.target.value })}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') zeichnen()
      }}
    />
  )
  const meldung = (v: Versuch, p: { x: number; y: number }) => {
    const ok = passt(v, p)
    return (
      <li>
        <i className={`fa-solid ${ok ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" /> Bei <M>{`x = ${tx(p.x)}`}</M> ist deine Bahn{' '}
        {meter(hoehe(v, p.x))} hoch{ok ? ', genau wie im Video.' : <>, im Video waren es {meter(p.y)}.</>}
      </li>
    )
  }

  return (
    <div className="kw-app" data-no-autocheck>
      <Feld
        bahnen={bahnen}
        punkte={PUNKTE_LINA}
        label="Spielfeld mit den Messpunkten P(1 | 3,8) und Q(2 | 4,55), dem Korb bei x = 4 in 3,05 m Höhe und den Bahnen aus deinen Versuchen"
      />
      <div className="kw-eingabe">
        <span className="kw-gleichung">
          <M>{'y ='}</M> {feld('a', 'Wert für a')} <M>{'x^2 +'}</M> {feld('b', 'Wert für b')} <M>{'x +'}</M> {feld('c', 'Wert für c')}
        </span>
        <button type="button" className="bk-btn bk-btn-primary" onClick={zeichnen}>
          <i className="fa-solid fa-basketball" aria-hidden="true" /> Bahn zeichnen
        </button>
      </div>
      {fehlt && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> Bitte trage für <M>a</M>, <M>b</M> und <M>c</M> je eine Zahl ein, z. B. −0,5, 2 oder 1,5.
        </div>
      )}
      {letzter && (
        <div className={`kw-display ${treffer(letzter) ? 'kw-display-ok' : ''}`} role="status">
          <div className="kw-display-head">
            <i className="fa-solid fa-mobile-screen-button" aria-hidden="true" /> Analyse-App, Versuch {versuche.length}: <M>{bahnTex(letzter)}</M>
          </div>
          <ul>
            {!aPasst(letzter) && (
              <li>
                <i className="fa-solid fa-circle-xmark" aria-hidden="true" /> Die Krümmung ist aus der Abwurfgeschwindigkeit bekannt: <M>{'a = -0{,}5'}</M>.
              </li>
            )}
            {meldung(letzter, P1)}
            {meldung(letzter, Q1)}
          </ul>
        </div>
      )}
      {frei && (
        <p className="sl-hinweis">
          {getroffen
            ? 'Treffer! Aber beim nächsten Wurf sind die Zahlen anders, und dann?'
            : 'Raten bringt dich kaum ans Ziel: Die Bahn muss durch P und Q gleichzeitig gehen, und jede Änderung an b verschiebt beide Punkte.'}{' '}
          Gleich lernst du, wie du die fehlenden Werte mit dem Subtraktionsverfahren aus Lernsituation 2 sicher berechnest.
        </p>
      )}
    </div>
  )
}

/* ── Phase 3: Bilder und Rechenbeispiele ─────────────────────────────────── */

const BSP1_AUFGABE = (
  <p>
    Emil wirft mit derselben Krümmung <M>{'a = -0{,}5'}</M>. Die App misst <M>{'P(1 \\mid 3)'}</M> und <M>{'Q(2 \\mid 3{,}5)'}</M>. Stelle die Gleichung seiner Wurfbahn auf und
    prüfe, wie hoch der Ball bei der Korbmitte <M>{'x = 4'}</M> ist.
  </p>
)
const BSP1_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: <>Den bekannten Wert <M>a</M> einsetzen</>,
    body: <MB>{'y = -0{,}5x^2 + bx + c'}</MB>,
  },
  {
    title: <>Punkt <M>{'P(1 \\mid 3)'}</M> einsetzen: Gleichung I</>,
    body: (
      <>
        <p>
          Für <M>x</M> setzt du 1 ein, für <M>y</M> die 3. Die Zahl ohne <M>b</M> und <M>c</M> bringst du auf die rechte Seite:
        </p>
        <MB>{'\\begin{aligned} 3 &= -0{,}5 \\cdot 1^2 + b \\cdot 1 + c \\\\ 3 &= -0{,}5 + b + c && \\mid +0{,}5 \\\\ \\text{I: } b + c &= 3{,}5 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: <>Punkt <M>{'Q(2 \\mid 3{,}5)'}</M> einsetzen: Gleichung II</>,
    body: <MB>{'\\begin{aligned} 3{,}5 &= -0{,}5 \\cdot 2^2 + b \\cdot 2 + c \\\\ 3{,}5 &= -2 + 2b + c && \\mid +2 \\\\ \\text{II: } 2b + c &= 5{,}5 \\end{aligned}'}</MB>,
  },
  {
    title: 'Das Gleichungssystem mit dem Subtraktionsverfahren lösen',
    body: (
      <>
        <p>
          Vor <M>c</M> steht in beiden Gleichungen 1. Rechne II − I, dann fällt <M>c</M> weg:
        </p>
        <MB>{'\\begin{aligned} \\text{II: } 2b + c &= 5{,}5 \\\\ \\text{I: } b + c &= 3{,}5 \\\\ \\hline \\text{II} - \\text{I: } b &= 2 \\\\ \\text{in I: } 2 + c &= 3{,}5 && \\mid -2 \\\\ c &= 1{,}5 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: 'Gleichung angeben und deuten',
    body: (
      <>
        <MB>{'y = -0{,}5x^2 + 2x + 1{,}5'}</MB>
        <p>
          Höhe bei der Korbmitte: <M>{'x = 4{:}\\; y = -0{,}5 \\cdot 4^2 + 2 \\cdot 4 + 1{,}5 = -8 + 8 + 1{,}5 = 1{,}5'}</M>. Der Ball ist dort nur 1,5 m hoch, viel tiefer als der
          Ring (3,05 m): Emils Wurf ist zu kurz.
        </p>
      </>
    ),
  },
]

const BSP2_AUFGABE = (
  <p>
    Mia wirft aus <M>{'2'}</M> m Höhe ab, also ist <M>{'c = 2'}</M>. Ihre Krümmung <M>a</M> kennt die App nicht. Gemessen sind <M>{'P(1 \\mid 3)'}</M> und{' '}
    <M>{'Q(2 \\mid 3{,}6)'}</M>.
  </p>
)
const BSP2_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: <>
      <M>c</M> einsetzen, dann P und Q
    </>,
    body: (
      <>
        <MB>{'3 = a + b + 2 \\quad \\mid -2'}</MB>
        <MB>{'\\text{I: } a + b = 1'}</MB>
        <MB>{'3{,}6 = 4a + 2b + 2 \\quad \\mid -2'}</MB>
        <MB>{'\\text{II: } 4a + 2b = 1{,}6'}</MB>
      </>
    ),
  },
  {
    title: 'Gleichung I passend multiplizieren',
    body: (
      <>
        <p>
          Vor <M>b</M> stehen 1 und 2. Multipliziere I auf beiden Seiten mit 2, dann steht in beiden Gleichungen <M>{'2b'}</M>:
        </p>
        <MB>{'\\text{I} \\cdot 2{:}\\quad 2a + 2b = 2'}</MB>
      </>
    ),
  },
  {
    title: 'Subtrahieren und auflösen',
    body: (
      <MB>{'\\begin{aligned} \\text{II} - \\text{I} \\cdot 2{:}\\; 2a &= -0{,}4 && \\mid :2 \\\\ a &= -0{,}2 \\\\ \\text{in I: } -0{,}2 + b &= 1 && \\mid +0{,}2 \\\\ b &= 1{,}2 \\end{aligned}'}</MB>
    ),
  },
  {
    title: 'Gleichung angeben und deuten',
    body: (
      <>
        <MB>{'y = -0{,}2x^2 + 1{,}2x + 2'}</MB>
        <p>
          <M>{'x = 4{:}\\; y = -0{,}2 \\cdot 16 + 1{,}2 \\cdot 4 + 2 = 3{,}6'}</M>. Bei der Korbmitte ist der Ball 3,6 m hoch, also über dem Ring: Mias Wurf ist zu weit.
        </p>
      </>
    ),
  },
]

const LOESUNG1 = (
  <Loesungsweg
    schritte={[
      { titel: <>Den bekannten Wert <M>a</M> einsetzen</>, tex: 'y = -0{,}5x^2 + bx + c' },
      { titel: <>Punkt <M>{'P(1 \\mid 3{,}8)'}</M> einsetzen: Gleichung I</>, tex: ['3{,}8 = -0{,}5 \\cdot 1^2 + b \\cdot 1 + c', '3{,}8 = -0{,}5 + b + c \\quad \\mid +0{,}5', '\\text{I: } b + c = 4{,}3'] },
      { titel: <>Punkt <M>{'Q(2 \\mid 4{,}55)'}</M> einsetzen: Gleichung II</>, tex: ['4{,}55 = -0{,}5 \\cdot 2^2 + b \\cdot 2 + c', '4{,}55 = -2 + 2b + c \\quad \\mid +2', '\\text{II: } 2b + c = 6{,}55'] },
      { titel: <>II − I rechnen, <M>c</M> fällt weg</>, tex: '\\text{II} - \\text{I: } b = 2{,}25' },
      { titel: <><M>b</M> in I einsetzen</>, tex: ['2{,}25 + c = 4{,}3 \\quad \\mid -2{,}25', 'c = 2{,}05'] },
      { titel: 'Funktionsgleichung angeben', tex: 'y = -0{,}5x^2 + 2{,}25x + 2{,}05' },
      { titel: 'Höhe bei der Korbmitte', tex: ['x = 4{:}\\quad y = -0{,}5 \\cdot 4^2 + 2{,}25 \\cdot 4 + 2{,}05', 'y = -8 + 9 + 2{,}05 = 3{,}05'], text: 'Der Ball ist bei der Korbmitte genau auf Ringhöhe (3,05 m): Linas Wurf ist ein Treffer.' },
    ]}
  />
)
const LOESUNG2 = (
  <Loesungsweg
    schritte={[
      { titel: <>Den bekannten Wert <M>c</M> einsetzen</>, tex: 'y = ax^2 + bx + 2{,}2' },
      { titel: <>Punkt <M>{'P(1 \\mid 3{,}4)'}</M> einsetzen: Gleichung I</>, tex: ['3{,}4 = a \\cdot 1^2 + b \\cdot 1 + 2{,}2', '3{,}4 = a + b + 2{,}2 \\quad \\mid -2{,}2', '\\text{I: } a + b = 1{,}2'] },
      { titel: <>Punkt <M>{'Q(2 \\mid 3{,}8)'}</M> einsetzen: Gleichung II</>, tex: ['3{,}8 = a \\cdot 2^2 + b \\cdot 2 + 2{,}2', '3{,}8 = 4a + 2b + 2{,}2 \\quad \\mid -2{,}2', '\\text{II: } 4a + 2b = 1{,}6'] },
      { titel: 'Gleichung I mit 2 multiplizieren', tex: '\\text{I} \\cdot 2{:}\; 2a + 2b = 2{,}4' },
      { titel: <>II − I · 2 rechnen, <M>b</M> fällt weg</>, tex: ['2a = -0{,}8 \\quad \\mid :2', 'a = -0{,}4'] },
      { titel: <><M>a</M> in I einsetzen</>, tex: ['-0{,}4 + b = 1{,}2 \\quad \\mid +0{,}4', 'b = 1{,}6'] },
      { titel: 'Funktionsgleichung angeben', tex: 'y = -0{,}4x^2 + 1{,}6x + 2{,}2' },
      { titel: 'Höhe bei der Korbmitte', tex: ['x = 4{:}\\quad y = -0{,}4 \\cdot 4^2 + 1{,}6 \\cdot 4 + 2{,}2', 'y = -6{,}4 + 6{,}4 + 2{,}2 = 2{,}2'], text: 'Der Ball ist bei der Korbmitte nur 2,2 m hoch, 85 cm unter dem Ring: Jonas’ Wurf ist zu kurz.' },
    ]}
  />
)


/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function KorbwurfEinstieg({ onBack, onPractice, onPrev }: { onBack: () => void; onPractice: () => void; onPrev: () => void }) {
  const [fest, setFest] = useSitzungState<Festlegung<Wahl>>('kw-fest', { wahl: null, wert: 3, fest: false })
  const [versuche, setVersuche] = useSitzungState<Versuch[]>('kw-versuche', [])
  const [geloest, setGeloest] = useSitzungState<string[]>('kw-geloest', [])
  const [uebungen, setUebungen] = useSitzungState<string[]>('kw-uebungen', [])
  /** Pflicht-Übung melden: schaltet „Weiter“ und das Bonus-Spiel frei */
  const uebung = (k: string, fertig: () => void) => () => {
    fertig()
    setUebungen((u) => (u.includes(k) ? u : [...u, k]))
  }
  const teilGeloest = (k: string, fertig: () => void) => () => {
    fertig()
    setGeloest((g) => (g.includes(k) ? g : [...g, k]))
  }

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 10 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title={<>a) <M>x</M> einsetzen</>}
            prompt={
              <p>
                Ein Ball fliegt auf der Bahn <M>{'y = -0{,}5x^2 + 2x + 1'}</M>. Wie hoch ist er bei <M>{'x = 3'}</M>?
              </p>
            }
            fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 2.5, unit: 'm' }]}
            solution={<MB>{'x = 3{:}\\quad y = -0{,}5 \\cdot 3^2 + 2 \\cdot 3 + 1 = -4{,}5 + 6 + 1 = 2{,}5'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Setze überall, wo <M>x</M> steht, die 3 ein.</>,
                  <>Erst das Quadrat: <M>{'3^2 = 9'}</M>, dann <M>{'-0{,}5 \\cdot 9'}</M>.</>,
                  <>
                    <M>{'-4{,}5 + 6 + 1'}</M>
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) Einen Punkt einsetzen"
            prompt={
              <p>
                Die Bahn <M>{'y = -0{,}5x^2 + bx + c'}</M> geht durch <M>{'P(2 \\mid 5)'}</M>. Setze P ein und bringe die Zahl ohne <M>b</M> und <M>c</M> auf die rechte Seite.
              </p>
            }
            rechnung={[
              { l: ['5'], r: ['-0{,}5 \\cdot 2^2 + 2b + c'] },
              { l: [{ luecke: 'k' }, 'b + c'], r: [{ luecke: 'r' }], u: '\\mid +2' },
            ]}
            fields={[
              { kind: 'num', key: 'k', label: 'Zahl vor b', expected: 2 },
              { kind: 'num', key: 'r', label: 'rechte Seite', expected: 7 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Einsetzen', tex: ['5 = -0{,}5 \\cdot 2^2 + b \\cdot 2 + c', '5 = -2 + 2b + c'] },
                  { titel: 'Die Zahl auf die rechte Seite bringen', tex: ['5 = -2 + 2b + c \\quad \\mid +2', '2b + c = 7'] },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Für <M>x</M> setzt du 2 ein, für <M>y</M> die 5.</>,
                  <>
                    <M>{'-0{,}5 \\cdot 2^2 = -0{,}5 \\cdot 4 = -2'}</M>
                  </>,
                  <>
                    <M>{'5 = -2 + 2b + c'}</M>. Rechne auf beiden Seiten <M>{'+2'}</M>.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={3}
            title="c) Lineares Gleichungssystem lösen"
            prompt={
              <>
                <MB>{'\\begin{aligned} \\text{I: } 3b + c &= 8 \\\\ \\text{II: } b + c &= 2 \\end{aligned}'}</MB>
                <p>Löse das lineare Gleichungssystem.</p>
              </>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: 3 },
              { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: -1 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: <>I − II rechnen, <M>c</M> fällt weg</>, tex: ['2b = 6 \\quad \\mid :2', 'b = 3'] },
                  { titel: <><M>b</M> in II einsetzen</>, tex: ['3 + c = 2 \\quad \\mid -3', 'c = -1'] },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Vor <M>c</M> steht in beiden Gleichungen 1.</>,
                  <>
                    Rechne <M>{'\\text{I} - \\text{II}'}</M>, dann fällt <M>c</M> weg.
                  </>,
                  <>
                    <M>{'2b = 6'}</M>. Setze <M>b</M> danach in II ein.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Eine Gleichung multiplizieren"
            prompt={<p>Multipliziere die Gleichung auf beiden Seiten mit 2.</p>}
            rechnung={[
              { l: ['a + b'], r: ['1{,}5'], u: '\\mid \\cdot 2' },
              { l: [{ luecke: 'a' }, 'a +', { luecke: 'b' }, 'b'], r: [{ luecke: 'c' }] },
            ]}
            fields={[
              { kind: 'num', key: 'a', label: 'Zahl vor a', expected: 2 },
              { kind: 'num', key: 'b', label: 'Zahl vor b', expected: 2 },
              { kind: 'num', key: 'c', label: 'rechte Seite', expected: 3 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Beide Seiten mit 2 multiplizieren', tex: '(a + b) \\cdot 2 = 1{,}5 \\cdot 2' },
                  { titel: 'Ausmultiplizieren', tex: '2a + 2b = 3' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Jeder Summand auf beiden Seiten wird mal 2 genommen.</>,
                  <>
                    <M>{'a \\cdot 2 = 2a'}</M> und <M>{'b \\cdot 2 = 2b'}</M>.
                  </>,
                  <>Vergiss die rechte Seite nicht: <M>{'1{,}5 \\cdot 2'}</M>.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title="e) Am Graphen ablesen"
            rechnen={false}
            prompt={
              <>
                <p>Lies an der Wurfbahn ab.</p>
                <Feld
                  korb={null}
                  bahnen={[{ a: -0.5, b: 2, c: 2, art: 'aktuell' }]}
                  label="Spielfeld ohne Korb mit einer Wurfbahn, die bei 2 m Höhe startet, bei x = 2 mit 4 m am höchsten ist und bei x = 3 noch 3,5 m hoch ist."
                />
              </>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'h3', label: <>Höhe bei <M>{'x = 3'}</M>:</>, expected: 3.5, unit: 'm' },
              { kind: 'num', key: 'max', label: 'größte Höhe:', expected: 4, unit: 'm' },
            ]}
            solution={<p>Bei <M>{'x = 3'}</M> ist die Bahn 3,5 m hoch. Am höchsten ist sie bei <M>{'x = 2'}</M> mit 4 m (Scheitelpunkt <M>{'S(2 \\mid 4)'}</M>).</p>}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Trifft der Korbwurf?',
      pflicht: ['fest', 'probieren'],
      bedingung: 'Halte deine Vermutung fest und probiere dreimal in der Analyse-App, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du bist in der Basketball-AG für die Videoanalyse zuständig. Mit einer App filmt ihr Freiwürfe. Die App misst die Höhe des Balls an jeder Stelle (<M>x</M> = Entfernung vom
            Abwurfpunkt in m, <M>y</M> = Höhe in m). Die Korbmitte liegt bei <M>{'K(4 \\mid 3{,}05)'}</M>.
          </p>
          <blockquote className="sl-zitat">
            <p>„Bei Linas Wurf ist jemand durchs Bild gelaufen, das Ende fehlt. Ging der Ball rein oder nicht? Kannst du das aus dem Video herausfinden?“</p>
            <footer>Frau Okafor, Trainerin der Basketball-AG</footer>
          </blockquote>
          <p className="sl-text">
            Die Bahn eines Wurfs ist eine Parabel <M>{'y = ax^2 + bx + c'}</M>. Aus der Abwurfgeschwindigkeit ist die Krümmung bekannt: <M>{'a = -0{,}5'}</M>. Gemessen hat sie
            zwei Punkte: <M>{'P(1 \\mid 3{,}8)'}</M> und <M>{'Q(2 \\mid 4{,}55)'}</M>. Gesucht sind <M>b</M> und <M>c</M> und damit die Höhe des Balls bei der Korbmitte.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst festlegen, dann in der App ausprobieren</p>
            <p>
              Trifft Linas Wurf? Lege dich zuerst fest, ohne zu rechnen. Probier dann in der App Werte für <M>a</M>, <M>b</M> und <M>c</M> aus und lass die Bahn zeichnen, bis sie durch P und Q geht.
            </p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 10 Minuten.</p>
          <Feld
            punkte={PUNKTE_LINA}
            frage="Linas Bahn: y = ?"
            label="Spielfeld mit den Messpunkten P(1 | 3,8) und Q(2 | 4,55) und dem Korb bei x = 4 in 3,05 m Höhe. Die Bahn danach ist unbekannt."
          />
          <Vermutung
            optionen={WAHL}
            regler={{
              min: 2,
              max: 4.5,
              step: 0.05,
              text: (v) => (
                <>
                  Ich schätze: Bei der Korbmitte (<M>{'x = 4'}</M>) ist der Ball etwa <span className="ls-slider-value">{meter(v)}</span> hoch.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig.teil('fest')}
            gespeichert={(w) => (
              <>
                Deine Schätzung bei der Korbmitte: <strong>{meter(w.wert)}</strong>. <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong>
              </>
            )}
          />
          {fest.fest && (
            <Abschnitt titel="Die Videoanalyse-App">
              <p className="sl-text">
                Tippe Werte für <M>a</M>, <M>b</M> und <M>c</M> ein und tippe auf „Bahn zeichnen“. Die App zeichnet die Bahn und vergleicht sie mit den Messpunkten. Probier es aus, ohne zu rechnen.
              </p>
              <AnalyseApp
                versuche={versuche}
                onZeichnen={(v) => {
                  setVersuche((alt) => [...alt, v])
                  if (versuche.length + 1 >= 3 || treffer(v)) fertig.teil('probieren')()
                }}
              />
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 1: Linas Wurf, a ist bekannt',
      pflicht: ['t1'],
      bedingung: 'Berechne Linas Wurfbahn und die Wurfhöhe richtig, dann geht es zu Teil 2.',
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 20 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne Linas Wurfbahn und prüfe, ob der Ball trifft</p>
            <p>
              Die Wurfbahn geht durch die Punkte <M>{'P(1 \\mid 3{,}8)'}</M> und <M>{'Q(2 \\mid 4{,}55)'}</M>, und wir wissen, dass <M>{'a = -0{,}5'}</M> ist. Stelle die
              Funktionsgleichung in der allgemeinen Form <M>{'y = ax^2 + bx + c'}</M> auf. Informationen und Rechenbeispiele findest du weiter unten. Halte deine Rechenschritte
              schriftlich fest. Berechne anschließend die Wurfhöhe des Balls bei <M>{'x = 4'}</M>.
            </p>
          </div>
          <Feld
            punkte={PUNKTE_LINA}
            frage="Linas Bahn: y = −0,5x² + bx + c"
            label="Spielfeld mit P(1 | 3,8), Q(2 | 4,55) und dem Korb bei x = 4 in 3,05 m Höhe."
          />
          <Abschnitt titel="So geht es">
            <BeispielMitVideo video={VIDEO_FALL2} videoTitel="Lernvideo: Funktionsgleichung aufstellen – Fall 2">
              <Beispiel offen title="Emils Wurf" aufgabe={BSP1_AUFGABE} steps={BSP1_SCHRITTE} />
            </BeispielMitVideo>
            <CheckCard
              onSolved={teilGeloest('t1', fertig.teil('t1'))}
              punkte={12}
              title="Linas Wurfbahn"
              prompt={
                <p>
                  Trage die Ergebnisse aus deinem Heft ein: die vollständige Funktionsgleichung in der Form <M>{'y = ax^2 + bx + c'}</M> und die Wurfhöhe. Jedes Feld zeigt dir
                  sofort, ob es stimmt.
                </p>
              }
              fields={[
                { kind: 'parabel', key: 'gl', label: 'Linas Wurfbahn:', ...LINA },
                { kind: 'num', key: 'h', label: <>Wie hoch ist der Ball bei der Korbmitte (<M>{'x = 4'}</M>)? <M>{'y ='}</M></>, expected: hoehe(LINA, KORB_X), unit: 'm' },
              ]}
              loesungNachFehler
              solution={LOESUNG1}
              help={
                <Hilfen
                  steps={[
                    <>Wie bei Emil: P und Q in <M>{'y = -0{,}5x^2 + bx + c'}</M> einsetzen und die Zahl ohne <M>b</M> und <M>c</M> nach rechts bringen.</>,
                    <>
                      <M>{'\\text{I: } b + c = 4{,}3'}</M> und <M>{'\\text{II: } 2b + c = 6{,}55'}</M>. Vor <M>c</M> steht beide Male 1.
                    </>,
                    <>
                      <M>{'\\text{II} - \\text{I}'}</M> ergibt <M>b</M>. Setze <M>b</M> in I ein. Für die Höhe setzt du <M>{'x = 4'}</M> in die fertige Gleichung ein.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: "Teil 2: Jonas' Wurf, c ist bekannt",
      pflicht: ['t2', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 25 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne Jonas' Wurfbahn</p>
            <p>
              Auch bei Jonas fehlt das Ende des Videos. Jonas ist größer und wirft aus <strong>2,2 m Höhe</strong> ab, also ist <M>{'c = 2{,}2'}</M>. Er wirft flacher als Lina, deshalb
              kennt die App <M>a</M> diesmal nicht. Gemessen sind <M>{'P(1 \\mid 3{,}4)'}</M> und <M>{'Q(2 \\mid 3{,}8)'}</M>. Berechne die vollständige
              Funktionsgleichung der Wurfparabel und die Höhe bei der Korbmitte.
            </p>
          </div>
          <Feld
            punkte={PUNKTE_JONAS}
            frage="Jonas' Bahn: y = ax² + bx + 2,2"
            label="Spielfeld mit Jonas' Messpunkten P(1 | 3,4) und Q(2 | 3,8) und dem Korb bei x = 4 in 3,05 m Höhe."
          />
          <Abschnitt titel="So geht es">
            <BeispielMitVideo video={VIDEO_FALL2} videoTitel="Lernvideo: Funktionsgleichung aufstellen – Fall 2">
              <Beispiel offen title="Mias Wurf" aufgabe={BSP2_AUFGABE} steps={BSP2_SCHRITTE} />
            </BeispielMitVideo>
            <CheckCard
              onSolved={teilGeloest('t2', fertig.teil('t2'))}
              punkte={14}
              title="Jonas' Wurfbahn"
              prompt={
                <p>
                  Trage die Ergebnisse aus deinem Heft ein: die vollständige Funktionsgleichung in der Form <M>{'y = ax^2 + bx + c'}</M> und die Wurfhöhe.
                </p>
              }
              fields={[
                { kind: 'parabel', key: 'gl', label: "Jonas' Wurfbahn:", ...JONAS },
                { kind: 'num', key: 'h', label: <>Wie hoch ist der Ball bei der Korbmitte (<M>{'x = 4'}</M>)? <M>{'y ='}</M></>, expected: hoehe(JONAS, KORB_X), unit: 'm' },
              ]}
              loesungNachFehler
              solution={LOESUNG2}
              help={
                <Hilfen
                  steps={[
                    <>Setze <M>{'c = 2{,}2'}</M> ein, dann P und Q. Bringe die 2,2 jeweils nach rechts.</>,
                    <>
                      <M>{'\\text{I: } a + b = 1{,}2'}</M>, <M>{'\\text{II: } 4a + 2b = 1{,}6'}</M>. Vor <M>b</M> stehen 1 und 2: Multipliziere I mit 2.
                    </>,
                    <>
                      <M>{'\\text{I} \\cdot 2{:}\\; 2a + 2b = 2{,}4'}</M>. Rechne <M>{'\\text{II} - \\text{I} \\cdot 2'}</M> und setze <M>a</M> danach in I ein.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          {geloest.length === 2 && (
            <Abschnitt titel="Dein Urteil für die Trainerin">
              <McCard
                onSolved={fertig.teil('entscheidung')}
                punkte={3}
                title="Was schreibst du Frau Okafor?"
                prompt={<p>Frau Okafor wartet auf deine Analyse. Was stimmt?</p>}
                options={[
                  { text: 'Beide Würfe sind Treffer, beide Bälle steigen am Anfang steil an.', feedback: 'Am Anfang steigen beide, aber bei x = 4 ist Jonas’ Ball nur 2,2 m hoch. Das ist deutlich unter dem Ring.' },
                  {
                    text: 'Lina trifft, ihr Ball ist bei der Korbmitte genau auf 3,05 m. Jonas’ Wurf ist zu kurz, sein Ball ist dort nur 2,2 m hoch.',
                    correct: true,
                    feedback: 'Genau. Jonas wirft zu flach: Sein Ball ist schon bei x = 2 am höchsten Punkt (3,8 m) und fliegt bei der Korbmitte 85 cm unter dem Ring durch.',
                  },
                  { text: 'Jonas trifft, weil er aus größerer Höhe abwirft. Lina wirft zu weit.', feedback: 'Die Abwurfhöhe allein entscheidet nicht. Rechne nach: Bei x = 4 ist Linas Ball auf 3,05 m, Jonas’ Ball auf 2,2 m.' },
                  { text: 'Keiner trifft, denn beide Bälle fliegen über 3,05 m hinaus.', feedback: 'Linas Ball ist bei x = 4 genau auf Ringhöhe. Jonas’ Ball ist dort tiefer, nicht höher.' },
                ]}
              />
            </Abschnitt>
          )}
          <Handlungsprodukt titel="Analyse-Notiz für die Trainerin">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={notizBild}
                width={800}
                height={400}
                alt="Ein Notizblatt auf dem Hallenboden: Wurfanalyse für Frau Okafor, mit einer Skizze zweier Wurfbahnen und dem Korb sowie Zeilen für Linas und Jonas' Gleichung, die Höhe bei x = 4 und das Urteil."
              />
              <figcaption>So könnte deine Analyse-Notiz aussehen.</figcaption>
            </figure>
            <p className="sl-text">
              Schreibe in deinem Heft eine Analyse-Notiz für Frau Okafor. Zeichne ein Koordinatensystem mit Korb und beiden Wurfbahnen, schreibe die Gleichungen I und II und deine
              Rechnung für beide Würfe sauber auf und gib ein klares Urteil mit einem Tipp für Jonas.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Von Linas Wurf kennen wir a = −0,5. Mit P und Q erhalte ich I: … und II: …“</li>
                <li>„Ich rechne II − I, weil vor c beide Male … steht.“</li>
                <li>„Bei Jonas ist c = 2,2 bekannt. Ich multipliziere Gleichung I mit 2, damit …“</li>
                <li>„Bei der Korbmitte (x = 4) ist Linas Ball … m hoch, Jonas' Ball … m. Deshalb …“</li>
                <li>„Tipp für Jonas: …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Analyse-Notiz vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien('an Frau Okafor')}             />
          </Abschnitt>
          {geloest.length === 2 && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug fest={fest} versuche={versuche} />
              <Feld
                bahnen={[
                  { ...LINA, art: 'treffer', name: 'Lina' },
                  { ...JONAS, art: 'zweit', name: 'Jonas' },
                ]}
                label="Spielfeld mit beiden Wurfbahnen. Linas Bahn geht genau durch die Korbmitte, Jonas' Bahn ist bei x = 2 am höchsten und bleibt bei der Korbmitte unter dem Ring."
              />
              <Merke title="Funktionsgleichung aus einem Wert und zwei Punkten (Fall 2)">
                <ol className="zk-liste" style={{ listStyleType: 'decimal' }}>
                  <li>
                    Den bekannten Wert (<M>a</M>, <M>b</M> oder <M>c</M>) in <M>{'y = ax^2 + bx + c'}</M> einsetzen.
                  </li>
                  <li>Beide Punkte einsetzen und die Zahlen ohne Unbekannte nach rechts bringen. Es entstehen Gleichung I und Gleichung II.</li>
                  <li>Das Gleichungssystem mit dem Additions- und Subtraktionsverfahren lösen.</li>
                  <li>Alle drei Werte in die allgemeine Form einsetzen und mit einem Punkt die Probe machen.</li>
                </ol>
                <Tabelle
                  head={['bekannt', 'beim Subtrahieren fällt weg', 'zuerst berechnen']}
                  rows={[
                    ['a (z. B. verschobene Normalparabel a = 1)', 'c', 'b, dann c'],
                    ['b (z. B. b = 0: symmetrisch zur y-Achse)', 'c', 'a, dann c'],
                    ['c (y-Achsenabschnitt, z. B. Abwurfhöhe)', 'b (vorher multiplizieren)', 'a, dann b'],
                  ]}
                />
                <p>
                  Graphisch gedeutet: Die Höhe an einer Stelle bekommst du durch „x einsetzen“. <M>c</M> ist die Höhe bei <M>{'x = 0'}</M>, also der Startpunkt der Bahn.
                </p>
              </Merke>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      pflicht: ['1', '2', '3', '4'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die fünfte ist freiwillig für Profis. Wenn du die vier Pflichtaufgaben gelöst hast, wartet unten ein Spiel auf dich.
            Einzelarbeit, ca. 25 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Punkt einsetzen">
            <McCard
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              title="Übung 1"
              level="basis"
              rechnen
              prompt={
                <p>
                  Die Bahn <M>{'y = -0{,}5x^2 + bx + c'}</M> geht durch <M>{'P(2 \\mid 4{,}5)'}</M>. Welche Gleichung entsteht, wenn du P einsetzt und die Zahl ohne <M>b</M> und{' '}
                  <M>c</M> nach rechts bringst?
                </p>
              }
              options={[
                { text: <M>{'2b + c = 5{,}5'}</M>, feedback: <>Hier wurde <M>{'2^2'}</M> vergessen: <M>{'-0{,}5 \\cdot 2 = -1'}</M>. Richtig ist <M>{'-0{,}5 \\cdot 2^2 = -2'}</M>.</> },
                { text: <M>{'2b + c = 2{,}5'}</M>, feedback: <>Beim Umstellen wurde falsch gerechnet: Aus <M>{'4{,}5 = -2 + 2b + c'}</M> wird mit <M>{'+2'}</M> die 6,5, nicht 2,5.</> },
                { text: <M>{'4{,}5b + c = 0'}</M>, feedback: 'x und y sind vertauscht. Für x wird 2 eingesetzt, für y die 4,5.' },
                { text: <M>{'2b + c = 6{,}5'}</M>, correct: true, feedback: <><M>{'4{,}5 = -0{,}5 \\cdot 4 + 2b + c = -2 + 2b + c'}</M>, mit <M>{'+2'}</M>: <M>{'2b + c = 6{,}5'}</M>.</> },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Die Fontäne auf dem Schulhof">
            <CheckCard
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
              title="Übung 2"
              level="standard"
              prompt={
                <p>
                  Der Wasserstrahl einer Fontäne ist symmetrisch zur y-Achse, also ist <M>{'b = 0'}</M>. Er geht durch <M>{'P(1 \\mid 4)'}</M> und <M>{'Q(2 \\mid 1)'}</M>. Bestimme{' '}
                  <M>a</M> und <M>c</M> der Bahn <M>{'y = ax^2 + bx + c'}</M>. Wie hoch spritzt die Fontäne?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -1 },
                { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 5 },
                { kind: 'num', key: 'h', label: 'Höhe:', expected: 5, unit: 'm' },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: <>P und Q in <M>{'y = ax^2 + c'}</M> einsetzen</>, tex: ['\\text{I: } a + c = 4', '\\text{II: } 4a + c = 1'] },
                    { titel: <>II − I rechnen, <M>c</M> fällt weg</>, tex: ['3a = -3 \\quad \\mid :3', 'a = -1'] },
                    { titel: <><M>a</M> in I einsetzen</>, tex: ['-1 + c = 4 \\quad \\mid +1', 'c = 5'] },
                    { titel: 'Gleichung und Höhe', tex: 'y = -x^2 + 5', text: <>Der Scheitelpunkt liegt auf der y-Achse bei <M>{'S(0 \\mid 5)'}</M>: Die Fontäne spritzt 5 m hoch.</> },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Mit <M>{'b = 0'}</M> ist die Bahn <M>{'y = ax^2 + c'}</M>. Setze P und Q ein.</>,
                    <>
                      <M>{'\\text{I: } a + c = 4'}</M>, <M>{'\\text{II: } 4a + c = 1'}</M>. Vor <M>c</M> steht beide Male 1.
                    </>,
                    <>
                      Rechne <M>{'\\text{II} - \\text{I}'}</M>. Am höchsten ist die Fontäne bei <M>{'x = 0'}</M>, dort ist <M>{'y = c'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Wer hat recht?">
            <McCard
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={5}
              title="Übung 3"
              level="standard"
              rechnen
              prompt={
                <>
                  <MB>{'\\begin{aligned} \\text{I: } a + b &= 1{,}5 \\\\ \\text{II: } 4a + 2b &= 2 \\end{aligned}'}</MB>
                  <p>
                    Tim schreibt: „I · 2: 2a + 2b = 1,5. II − I · 2: 2a = 0,5, also a = 0,25.“ Mia hat <M>{'a = -0{,}5'}</M> heraus. Rechne selbst nach. Wer hat recht?
                  </p>
                </>
              }
              options={[
                { text: 'Tim: a = 0,25.', feedback: 'Prüfe Tims ersten Schritt: Beim Multiplizieren mit 2 muss auch die rechte Seite verdoppelt werden.' },
                { text: 'Beide falsch: Hier muss man I + II rechnen.', feedback: <>Addieren hilft hier nicht, dann bleiben <M>a</M> und <M>b</M> stehen. Nach I · 2 steht vor <M>b</M> beide Male 2, also subtrahieren.</> },
                {
                  text: 'Mia: a = −0,5 und b = 2. Tim hat bei I · 2 die rechte Seite 1,5 nicht verdoppelt.',
                  correct: true,
                  feedback: <><M>{'\\text{I} \\cdot 2{:}\\; 2a + 2b = 3'}</M>. <M>{'\\text{II} - \\text{I} \\cdot 2{:}\\; 2a = -1'}</M>, also <M>{'a = -0{,}5'}</M> und <M>{'b = 2'}</M>.</>,
                },
                { text: 'Tim, denn bei einem Wurf nach oben muss a positiv sein.', feedback: 'Umgekehrt: Eine Wurfbahn ist nach unten geöffnet, also ist a negativ.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Durch die Korbmitte">
            <CheckCard
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Ein Wurf mit <M>{'a = -0{,}5'}</M> geht durch <M>{'P(1 \\mid 3{,}95)'}</M> und genau durch die Korbmitte <M>{'K(4 \\mid 3{,}05)'}</M>. Bestimme <M>b</M> und <M>c</M>.
                  Aus welcher Höhe wurde abgeworfen?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: 2.2 },
                { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 2.25 },
                { kind: 'num', key: 'h', label: 'Abwurfhöhe:', expected: 2.25, unit: 'm' },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'P einsetzen: Gleichung I', tex: ['3{,}95 = -0{,}5 + b + c \\quad \\mid +0{,}5', '\\text{I: } b + c = 4{,}45'] },
                    { titel: 'K einsetzen: Gleichung II', tex: ['3{,}05 = -8 + 4b + c \\quad \\mid +8', '\\text{II: } 4b + c = 11{,}05'] },
                    { titel: <>II − I rechnen, <M>c</M> fällt weg</>, tex: ['3b = 6{,}6 \\quad \\mid :3', 'b = 2{,}2'] },
                    { titel: <><M>b</M> in I einsetzen</>, tex: ['2{,}2 + c = 4{,}45 \\quad \\mid -2{,}2', 'c = 2{,}25'], text: <>Abgeworfen wurde bei <M>{'x = 0'}</M> in der Höhe <M>{'y = c = 2{,}25'}</M> m.</> },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Die Korbmitte ist einfach ein zweiter Punkt der Bahn. Setze P und K ein.</>,
                    <>
                      <M>{'-0{,}5 \\cdot 4^2 = -8'}</M>. Also <M>{'\\text{II: } 4b + c = 11{,}05'}</M>.
                    </>,
                    <>
                      <M>{'\\text{II} - \\text{I}'}</M>: <M>{'3b = 6{,}6'}</M>. Die Abwurfhöhe ist die Höhe bei <M>{'x = 0'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Wie hoch fliegt Linas Ball?">
            <CheckCard
              punkte={9}
              title="Übung 5"
              profi
              level="erweiterung"
              prompt={
                <p>
                  Die Halle ist 7 m hoch. Bestimme den höchsten Punkt von Linas Bahn <M>{'y = -0{,}5x^2 + 2{,}25x + 2{,}05'}</M>. Begründe im Heft, warum der Ball nicht an die Decke
                  stößt.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'x', label: <M>{'x_S ='}</M>, expected: 2.25 },
                { kind: 'num', key: 'y', label: <M>{'y_S \\approx'}</M>, expected: 4.58, tol: 0.006, unit: 'm' },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: <><M>{'x_S'}</M> berechnen</>, tex: 'x_S = -\\dfrac{b}{2a} = -\\dfrac{2{,}25}{2 \\cdot (-0{,}5)} = 2{,}25' },
                    { titel: <><M>{'x_S'}</M> einsetzen</>, tex: 'y_S = -0{,}5 \\cdot 2{,}25^2 + 2{,}25 \\cdot 2{,}25 + 2{,}05 \\approx 4{,}58', text: 'Der Ball fliegt höchstens etwa 4,58 m hoch, also weit unter der Hallendecke.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Der höchste Punkt der Bahn ist der Scheitelpunkt.</>,
                    <>
                      Für die allgemeine Form gilt <M>{'x_S = -\\frac{b}{2a}'}</M>.
                    </>,
                    <>
                      <M>{'x_S = 2{,}25'}</M>. Setze <M>x_S</M> in die Gleichung ein, um <M>y_S</M> zu berechnen.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Korbjäger">
            <Korbjaeger />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt die Gleichung einer Parabel aus einem Wert und zwei Punkten aufstellen und sie im Graphen deuten. In den Übungsaufgaben trainierst du Fall 2 weiter, auch
              gemischt mit Fall 1.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onPrev}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zu Lernsituation 2
              </button>
              <button type="button" className="bk-btn" onClick={onBack}>
                Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Fall 2 <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell
      title="Funktionsgleichung aufstellen: Der Korbwurf"
      width="wide"
      kompakt
      parent={{ to: '/quadratische_funktionen/funktionsgleichung_aufstellen', label: 'Funktionsgleichung aufstellen' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        bildwelt={BILDWELT}
        ziel={
          <>
            Du wertest für die Basketball-AG Videos von Freiwürfen aus. Du stellst die Gleichung einer Wurfbahn auf, wenn ein Wert (<M>a</M>, <M>b</M> oder <M>c</M>) und zwei Punkte
            bekannt sind, und entscheidest am Graphen, ob der Ball trifft.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Festlegung und die Versuche in der App aus Phase 2 */
function Rueckbezug({ fest, versuche }: { fest: Festlegung<Wahl>; versuche: Versuch[] }) {
  const bester = versuche.length ? versuche.reduce((x, y) => (daneben(y) < daneben(x) ? y : x)) : null
  const diff = Math.abs(fest.wert - KORB_H)
  return (
    <div className="ls-back">
      {fest.fest && fest.wahl && (
        <p>
          <strong>Du hattest vermutet:</strong> {WAHL[fest.wahl]} Deine Schätzung: {meter(fest.wert)}.{' '}
          {fest.wahl === 'treffer' ? 'Das stimmt, gut eingeschätzt!' : 'Tatsächlich geht Linas Ball genau durch die Korbmitte.'}{' '}
          {diff < 0.01 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${meter(diff)} daneben.`}
        </p>
      )}
      {bester && (
        <p>
          In der App hattest du {versuche.length} Versuche. Dein bester war <M>{bahnTex(bester)}</M>
          {treffer(bester) ? ', ein Treffer!' : <>, zusammen {meter(daneben(bester))} neben den Messpunkten.</>} Gerechnet weißt du es sicher:{' '}
          <M>{bahnTex(LINA)}</M>.
        </p>
      )}
    </div>
  )
}
