import { useEffect, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, McCard, TrackedCheck, TrackedMc } from '../lernsituation_kit/kit'
import { Abschnitt, Aufklappbar, BeispielMitVideo, BonusSpiel, Handlungsprodukt, SeitenLernsituation, type Seite, type Thema } from '../lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../lernsituation_kit/punkte'
import { Kriterien } from '../../finanzmathe/zins_kit/zins_kit'
import { parseLinearEquation } from '../../../utils/parseLinearEquation'
import { KoSystem, MaschinenBild, Protokoll, SteckbriefBild, Titelbild, zahl, type Linie } from './bilder'
import ZeichenRoboter from './ZeichenRoboter'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './funktionsmaschine.css'

// Lernsituation „Die Funktionsmaschine“: Einstieg in die linearen Funktionen, nur y = m · x (ca. 45–60 min).
// Die Klasse hat große Schwierigkeiten mit dem Einstieg. Deshalb bewusst ohne Sachkontext (Alltagsbeispiele mit y = m · x wären
// für die SuS nur der bekannte Dreisatz) und mit einem Bild, das durch alle Phasen trägt: Eingabe x → Regel → Ausgabe y.
// Jeder Begriff hängt an der Maschine: Wertetabelle = Protokoll, Funktionsgraph = alle Paare als Punkte, Funktionsgleichung = Bauplan.
// In Phase 2 und 3 ist m ganzzahlig (3 und −2), Kommazahlen erst in der Profi-Aufgabe.
// Format Rätsel / Code knacken. Problem erkennen: Tipp für x = −4 bei Maschine A (y = 3x), dann selbst Zahlen von −5 bis 5
// einwerfen (Protokoll und Punkte live), Punkte verbinden, große Zahl einwerfen → Fehler. Aha: „Mal 3 macht größer“ stimmt bei
// negativen Zahlen nicht (−12 statt 12), und alle Punkte liegen auf einer Geraden durch (0 | 0).
// Problem lösen: Maschine B zeigt nur ihr Protokoll (−2 | 4), (1 | −2), (3 | −6). Regel über y : x knacken (Quotientengleichheit
// aus den proportionalen Zuordnungen), Gleichung y = −2x, Werte für x = 10 und x = −7, passenden Graphen wählen.
// Rechenbeispiel Maschine Z (y = 0,5x), noch ohne Lernvideo (offener Punkt).
// Handlungsprodukt analog: Maschinen-Steckbrief (Karteikarte) mit Regel in Worten, Wertetabelle, Graph und Gleichung.
// Punkte nach Aufwand: Warm-up 6 × 2 = 12, Tipp 3, Kernaufgabe 15, Graph wählen 4, Steckbrief 5, Übungen 4/4/5/8, Profi 8
// (Pflicht zusammen 60: Warm-up 12 = 20 %, Problem lösen 24 = 40 %, Übungen 21 = 35 %), Bonus-Spiel 4 Runden à 2 = 8 wie die beste Übung.
// Identität: Themenfarbe Schiefer, Symbol fa-gears, Titelbild Funktionsmaschine mit Zahlenkärtchen, Leitobjekt die Funktionsmaschine.
// Wird als Modus „Lernsituation“ auf der Seite „Was ist eine lineare Funktion?“ angezeigt.

const THEMA: Thema = { name: 'Die Funktionsmaschine', farbe: 'schiefer', icon: 'fa-gears', bild: <Titelbild /> }

/* ── Maschine A (Problem erkennen): y = 3x ───────────────────────────────── */

const M_A = 3
/** Diese drei Paare stehen schon im Protokoll */
const START_A = [1, 2, 4]
const TIPPS = [12, -12, 1, -1]
const TASTEN = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]

/** Protokoll aus x-Werten: jeder x-Wert nur einmal, aufsteigend sortiert */
const paareAus = (xs: number[], m: number) => [...new Set(xs)].sort((a, b) => a - b).map((x) => ({ x, y: m * x }))

/** Festlegung vor dem Ausprobieren: Was gibt Maschine A bei x = −4 aus? */
function Tipp({ tipp, fest, onTipp, onFest }: { tipp: number | null; fest: boolean; onTipp: (v: number) => void; onFest: () => void }) {
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  if (fest) {
    return (
      <p className="ls-saved" role="status">
        <i className="fa-solid fa-lock" aria-hidden="true" /> Dein Tipp: Bei <M>{'x = -4'}</M> kommt <M>{`y = ${zahl(tipp ?? 0)}`}</M> heraus. Gleich prüfst du ihn an der Maschine.
      </p>
    )
  }
  return (
    <div className="fm-tipp" data-no-autocheck>
      <div className="fm-tipp-wahl" role="radiogroup" aria-label="Dein Tipp für x = −4">
        {TIPPS.map((v) => (
          <button key={v} type="button" role="radio" aria-checked={tipp === v} className={`bk-btn${tipp === v ? ' bk-btn-primary' : ''}`} onClick={() => onTipp(v)}>
            <M>{`y = ${zahl(v)}`}</M>
          </button>
        ))}
      </div>
      <div>
        <button
          type="button"
          className="bk-btn bk-btn-primary"
          disabled={tipp === null}
          onClick={() => {
            pt.geloest()
            onFest()
          }}
        >
          <i className="fa-solid fa-lock" aria-hidden="true" /> Tipp festhalten
        </button>
      </div>
    </div>
  )
}

/** Maschine A ausprobieren: Zahl antippen, die Maschine rechnet, Protokoll und Koordinatensystem füllen sich */
function MaschineA({
  frei,
  tipp,
  wuerfe,
  onWurf,
  verbunden,
  onVerbinden,
  onFertig,
}: {
  frei: boolean
  tipp: number | null
  wuerfe: number[]
  onWurf: (x: number) => void
  verbunden: boolean
  onVerbinden: () => void
  onFertig: () => void
}) {
  const letzter = wuerfe[wuerfe.length - 1]
  const verschiedene = new Set(wuerfe).size
  const minus4 = wuerfe.includes(-4)
  const fertig = verschiedene >= 5 && minus4
  useEffect(() => {
    if (fertig) onFertig()
  }, [fertig])

  const paare = paareAus([...START_A, ...wuerfe], M_A)
  return (
    <div className="fm-tipp" data-no-autocheck>
      <div className="fm-maschine">
        <MaschinenBild
          name="Maschine A"
          ein={letzter === undefined ? undefined : zahl(letzter)}
          aus={letzter === undefined ? undefined : zahl(M_A * letzter)}
          label={
            letzter === undefined
              ? 'Maschine A mit geheimer Regel. Es wurde noch keine Zahl eingeworfen.'
              : `Maschine A: Eingabe x = ${zahl(letzter)}, Ausgabe y = ${zahl(M_A * letzter)}. Die Regel bleibt geheim.`
          }
        />
      </div>
      <p className="sl-text">{frei ? 'Tippe eine Zahl an, um sie in die Maschine zu werfen:' : 'Halte zuerst oben deinen Tipp fest. Dann kannst du Zahlen einwerfen.'}</p>
      <div className="fm-tasten" role="group" aria-label="Zahl einwerfen">
        {TASTEN.map((x) => (
          <button key={x} type="button" className={`bk-btn${x === letzter ? ' bk-btn-primary' : ''}`} disabled={!frei} onClick={() => onWurf(x)} aria-label={`${zahl(x)} einwerfen`}>
            {zahl(x)}
          </button>
        ))}
      </div>
      <p className="sl-hinweis">
        {fertig
          ? 'Prima, genug Zahlen eingeworfen. Du kannst gern weiter probieren.'
          : `Wirf mindestens fünf verschiedene Zahlen ein, auch die −4. Bisher: ${verschiedene} von 5${minus4 ? '' : ', die −4 fehlt noch'}.`}
      </p>
      <Abschnitt titel="Das Protokoll der Maschine">
        <Protokoll paare={paare} neu={letzter} label="Protokoll von Maschine A: eingeworfene Zahlen x und Ausgaben y" />
      </Abschnitt>
      <div className="bk-graph fm-bild">
        <KoSystem
          yMax={15}
          yStep={3}
          punkte={paare.map((p) => ({ ...p, art: p.x === letzter ? 'neu' : START_A.includes(p.x) && !wuerfe.includes(p.x) ? 'fest' : 'alt' }))}
          linien={verbunden ? [{ m: M_A, art: 'haupt' }] : []}
          label={`Koordinatensystem mit den Punkten aus dem Protokoll von Maschine A${verbunden ? ', verbunden durch eine Gerade durch den Ursprung' : ''}.`}
        />
      </div>
      {minus4 && tipp !== null && (
        <p className="sl-text" role="status">
          <strong>
            Dein Tipp war <M>{`y = ${zahl(tipp)}`}</M>. Die Maschine gibt bei <M>{'x = -4'}</M> aber <M>{'y = -12'}</M> aus.
          </strong>{' '}
          {tipp === -12 ? 'Stark, das hattest du richtig!' : <>Viele denken: „Mal 3 macht die Zahl größer.“ Bei negativen Zahlen stimmt das nicht: <M>{'3 \\cdot (-4) = -12'}</M>.</>}
        </p>
      )}
      {fertig && !verbunden && (
        <div>
          <button type="button" className="bk-btn bk-btn-primary" onClick={onVerbinden}>
            <i className="fa-solid fa-ruler" aria-hidden="true" /> Punkte mit dem Lineal verbinden
          </button>
        </div>
      )}
      {verbunden && (
        <p className="sl-text">
          Alle Punkte liegen auf <strong>einer Geraden</strong>. Sie geht durch den Ursprung <M>{'(0 \\mid 0)'}</M>, denn <M>{'3 \\cdot 0 = 0'}</M>. Auch die Punkte für negative
          Zahlen liegen darauf, unten links.
        </p>
      )}
    </div>
  )
}

/** Große Zahl einwerfen: Die Maschine nimmt nur ganze Zahlen von −5 bis 5 */
function Grenze({ onWurf, onFehler, fehlerZahl }: { onWurf: (x: number) => void; onFehler: (z: string) => void; fehlerZahl: string | null }) {
  const [eingabe, setEingabe] = useState('')
  const [leer, setLeer] = useState(false)
  const einwerfen = () => {
    const p = parseInput(eingabe)
    if (!p) return setLeer(true)
    setLeer(false)
    if (Number.isInteger(p.value) && Math.abs(p.value) <= 5) onWurf(p.value)
    else onFehler(zahl(p.value))
  }
  return (
    <div className="fm-tipp" data-no-autocheck>
      <div className="fm-eingabe">
        <label>
          <M>{'x ='}</M>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="z. B. 40"
            aria-label="Zahl, die du einwerfen willst"
            className="bk-input lp-input lp-input-md"
            value={eingabe}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') einwerfen()
            }}
          />
        </label>
        <button type="button" className="bk-btn bk-btn-primary" onClick={einwerfen}>
          <i className="fa-solid fa-arrow-down" aria-hidden="true" /> Einwerfen
        </button>
      </div>
      {leer && <p className="sl-hinweis">Trage eine Zahl ein, z. B. 40.</p>}
      {fehlerZahl !== null && (
        <>
          <div className="fm-maschine">
            <MaschinenBild name="Maschine A" ein={fehlerZahl} fehler label={`Maschine A: Eingabe x = ${fehlerZahl}, die Anzeige meldet einen Fehler.`} />
          </div>
          <p className="fm-fehler" role="status">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Fehler: Ich nehme nur ganze Zahlen von −5 bis 5.
          </p>
          <p className="sl-text">
            <strong>Die Maschine hilft dir hier nicht weiter.</strong> Wenn du aber ihre Regel kennst, rechnest du jede Zahl selbst aus, auch 40, −100 oder 7,5. Dann brauchst du die
            Maschine gar nicht mehr. Auf der nächsten Seite knackst du die Regel einer Maschine und schreibst sie als Gleichung auf.
          </p>
        </>
      )}
    </div>
  )
}

/* ── Maschine B (Problem lösen): y = −2x ─────────────────────────────────── */

const PROTOKOLL_B = [
  { x: -2, y: 4 },
  { x: 1, y: -2 },
  { x: 3, y: -6 },
]

const BSP_AUFGABE = (
  <>
    <p>Maschine Z zeigt nur ihr Protokoll. Knacke ihre Regel, schreibe die Funktionsgleichung auf und berechne, was sie bei <M>{'x = 10'}</M> und <M>{'x = -8'}</M> ausgibt.</p>
    <Protokoll
      paare={[
        { x: -6, y: -3 },
        { x: 2, y: 1 },
        { x: 4, y: 2 },
      ]}
      label="Protokoll von Maschine Z"
    />
  </>
)
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: <>Die Regel finden: bei jedem Paar <M>y : x</M> rechnen</>,
    body: (
      <>
        <MB>{'1 : 2 = 0{,}5 \\qquad 2 : 4 = 0{,}5 \\qquad (-3) : (-6) = 0{,}5'}</MB>
        <p>
          Es kommt immer dieselbe Zahl heraus. Die Maschine nimmt also jedes <M>x</M> mal <M>{'0{,}5'}</M>. Diese Zahl heißt <M>m</M>: <M>{'m = 0{,}5'}</M>.
        </p>
      </>
    ),
  },
  {
    title: 'Die Funktionsgleichung aufschreiben',
    body: (
      <>
        <p>
          Der Bauplan der Maschine lautet <M>{'y = m \\cdot x'}</M>. Mit <M>{'m = 0{,}5'}</M>:
        </p>
        <MB>{'y = 0{,}5x'}</MB>
      </>
    ),
  },
  {
    title: <><M>x</M> einsetzen und ausrechnen</>,
    body: (
      <>
        <MB>{'x = 10{:}\\quad y = 0{,}5 \\cdot 10 = 5 \\qquad x = -8{:}\\quad y = 0{,}5 \\cdot (-8) = -4'}</MB>
        <p>Plus mal Minus ergibt Minus. Maschine Z gibt bei 10 also 5 aus, bei −8 gibt sie −4 aus.</p>
      </>
    ),
  },
  {
    title: 'Den Funktionsgraphen zeichnen',
    body: (
      <>
        <p>
          Jedes Paar aus dem Protokoll ist ein Punkt <M>{'(x \\mid y)'}</M>. Trage die Punkte ins Koordinatensystem ein und verbinde sie mit dem Lineal. Die Gerade geht durch den
          Ursprung <M>{'(0 \\mid 0)'}</M>.
        </p>
        <div className="bk-graph fm-bild fm-bild-klein">
          <KoSystem
            yMax={4}
            yStep={1}
            w={520}
            h={300}
            punkte={[
              { x: -6, y: -3, art: 'alt' },
              { x: 2, y: 1, art: 'alt' },
              { x: 4, y: 2, art: 'alt' },
            ]}
            linien={[{ m: 0.5, art: 'haupt' }]}
            label="Graph von Maschine Z: Die Punkte (−6 | −3), (2 | 1) und (4 | 2) liegen auf einer Geraden durch den Ursprung."
          />
        </div>
      </>
    ),
  },
]

const LOESUNG_B = (
  <>
    <MB>{'4 : (-2) = -2 \\qquad (-2) : 1 = -2 \\qquad (-6) : 3 = -2 \\qquad \\Rightarrow\\; m = -2'}</MB>
    <p>
      Maschine B nimmt jedes <M>x</M> mal <M>{'-2'}</M>. Ihre Funktionsgleichung lautet <M>{'y = -2x'}</M>.
    </p>
    <MB>{'x = 10{:}\\quad y = -2 \\cdot 10 = -20 \\qquad x = -7{:}\\quad y = -2 \\cdot (-7) = 14'}</MB>
  </>
)

/** Kleiner Graph für eine Antwortmöglichkeit */
function MiniGraph({ linie, label }: { linie: Linie; label: string }) {
  return (
    <span className="fm-mini">
      <KoSystem yMax={6} yStep={2} w={340} h={240} xMax={4} linien={[linie]} label={label} />
    </span>
  )
}

/** Mini-Protokoll für Übung 2 */
function MiniProtokoll({ name, paare }: { name: string; paare: [number, number][] }) {
  return (
    <div className="fm-protokoll">
      <span className="fm-protokoll-name">{name}</span>
      <Protokoll paare={paare.map(([x, y]) => ({ x, y }))} label={`Protokoll von ${name}`} />
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function FunktionsmaschineEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [tipp, setTipp] = useState<number | null>(null)
  const [tippFest, setTippFest] = useState(false)
  const [wuerfe, setWuerfe] = useState<number[]>([])
  const [verbunden, setVerbunden] = useState(false)
  const [fehlerZahl, setFehlerZahl] = useState<string | null>(null)
  const [liveB, setLiveB] = useState<Linie | null>(null)
  const [geloest, setGeloest] = useState(false)
  const [uebungen, setUebungen] = useState<string[]>([])
  /** Pflicht-Übung melden: schaltet „Weiter“ und das Bonus-Spiel frei */
  const uebung = (k: string, fertig: () => void) => () => {
    fertig()
    setUebungen((u) => (u.includes(k) ? u : [...u, k]))
  }

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e', 'f'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese sechs kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 8 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Mal mit Minuszahlen"
            prompt={<p>Rechne aus.</p>}
            rechnung={[
              { l: ['5 \\cdot (-2)'], r: [{ luecke: 'a1' }] },
              { l: ['(-2) \\cdot (-3)'], r: [{ luecke: 'a2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'a1', label: 'Ergebnis von 5 mal minus 2', expected: -10 },
              { kind: 'num', key: 'a2', label: 'Ergebnis von minus 2 mal minus 3', expected: 6 },
            ]}
            solution={<MB>{'5 \\cdot (-2) = -10 \\qquad (-2) \\cdot (-3) = 6'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Rechne zuerst ohne Vorzeichen: <M>{'5 \\cdot 2'}</M> und <M>{'2 \\cdot 3'}</M>. Kümmere dich dann um das Vorzeichen.</>,
                  <>Plus mal Minus ergibt Minus. Minus mal Minus ergibt Plus.</>,
                  <><M>{'5 \\cdot 2 = 10'}</M>, ein Minus ist dabei, also <M>{'-10'}</M>. Bei <M>{'(-2) \\cdot (-3)'}</M> sind es zwei Minus, also Plus.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title={<>b) Zahl für <M>x</M> einsetzen</>}
            prompt={
              <p>
                Setze <M>{'x = -3'}</M> in den Term <M>{'2 \\cdot x'}</M> ein und rechne aus.
              </p>
            }
            rechnung={[{ l: ['2 \\cdot (', { luecke: 'e' }, ')'], r: [{ luecke: 'w' }] }]}
            fields={[
              { kind: 'num', key: 'e', label: 'eingesetzte Zahl', expected: -3 },
              { kind: 'num', key: 'w', label: 'Ergebnis', expected: -6 },
            ]}
            solution={<MB>{'2 \\cdot (-3) = -6'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Proportionale Zuordnung"
            prompt={
              <>
                <p>Die Zuordnung ist proportional. Was gehört zu 5?</p>
                <Protokoll
                  paare={[
                    { x: 1, y: 4 },
                    { x: 2, y: 8 },
                  ]}
                  label="Wertetabelle: zu 1 gehört 4, zu 2 gehört 8"
                />
              </>
            }
            fields={[{ kind: 'num', key: 'y', label: <>Zu 5 gehört <M>{'y ='}</M></>, expected: 20 }]}
            solution={<p>Zu 1 gehört 4, also wird immer mal 4 gerechnet: <M>{'5 \\cdot 4 = 20'}</M>.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Teilen"
            prompt={<p>Rechne aus.</p>}
            rechnung={[
              { l: ['18 : 6'], r: [{ luecke: 'd1' }] },
              { l: ['(-8) : 4'], r: [{ luecke: 'd2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'd1', label: 'Ergebnis von 18 geteilt durch 6', expected: 3 },
              { kind: 'num', key: 'd2', label: 'Ergebnis von minus 8 geteilt durch 4', expected: -2 },
            ]}
            solution={<MB>{'18 : 6 = 3 \\qquad (-8) : 4 = -2'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Beim Teilen gelten dieselben Vorzeichenregeln wie beim Malnehmen.</>,
                  <>Minus durch Plus ergibt Minus.</>,
                  <><M>{'8 : 4 = 2'}</M>, mit dem Minus also <M>{'-2'}</M>.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title="e) Punkt ablesen"
            prompt={
              <>
                <p>
                  Lies die Koordinaten von Punkt <M>P</M> ab.
                </p>
                <div className="bk-graph fm-bild fm-bild-klein">
                  <KoSystem yMax={5} yStep={1} w={520} h={320} punkte={[{ x: -3, y: 2, art: 'alt', text: 'P' }]} label="Koordinatensystem mit dem Punkt P links oberhalb der x-Achse" />
                </div>
              </>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: -3 },
              { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 2 },
            ]}
            solution={<p>Erst nach links oder rechts (x), dann nach oben oder unten (y): <M>{'P(-3 \\mid 2)'}</M>.</p>}
          />
          <McCard
            onSolved={fertig.teil('f')}
            punkte={2}
            title="f) Punkt finden"
            prompt={
              <>
                <p>
                  Welcher Punkt ist <M>{'(3 \\mid -1)'}</M>?
                </p>
                <div className="bk-graph fm-bild fm-bild-klein">
                  <KoSystem
                    yMax={4}
                    yStep={1}
                    w={520}
                    h={300}
                    punkte={[
                      { x: -1, y: 3, art: 'alt', text: 'A' },
                      { x: 3, y: -1, art: 'alt', text: 'B', unten: true },
                      { x: -3, y: 1, art: 'alt', text: 'C' },
                      { x: 3, y: 1, art: 'alt', text: 'D' },
                    ]}
                    label="Koordinatensystem mit den Punkten A, B, C und D"
                  />
                </div>
              </>
            }
            options={[
              { text: 'Punkt A', feedback: 'Bei A sind x und y vertauscht: A ist (−1 | 3). Zuerst kommt immer der x-Wert.' },
              { text: 'Punkt B', correct: true, feedback: 'Genau: 3 nach rechts, 1 nach unten.' },
              { text: 'Punkt C', feedback: 'C ist (−3 | 1): Hier sind beide Vorzeichen vertauscht.' },
              { text: 'Punkt D', feedback: 'D ist (3 | 1). Bei −1 geht es nach unten, nicht nach oben.' },
            ]}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Die geheime Regel der Funktionsmaschine',
      bedingung: 'Halte deinen Tipp fest, wirf mindestens fünf Zahlen ein (auch die −4) und probiere eine große Zahl aus.',
      pflicht: ['tipp', 'probieren', 'grenze'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Im Mathe-Labor steht eine Funktionsmaschine. Oben wirfst du eine Zahl <M>x</M> hinein. Die Maschine rechnet nach einer geheimen Regel und gibt unten eine Zahl{' '}
            <M>y</M> aus.
          </p>
          <p className="sl-text">
            Das Protokoll von Maschine A zeigt schon drei Würfe: Aus 1 wird 3, aus 2 wird 6, aus 4 wird 12. Gesucht ist, was die Maschine bei <M>{'x = -4'}</M> ausgibt, und am Ende
            bei ganz großen Zahlen wie 40.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
            <p>Gib zuerst einen Tipp ab. Wirf dann selbst Zahlen in die Maschine und beobachte, was herauskommt.</p>
          </div>
          <p className="sl-hinweis">Einzelarbeit, ca. 10 Minuten.</p>
          <Abschnitt titel={<>1. Dein Tipp: Was kommt bei <M>{'x = -4'}</M> heraus?</>}>
            <Tipp
              tipp={tipp}
              fest={tippFest}
              onTipp={setTipp}
              onFest={() => {
                setTippFest(true)
                fertig.teil('tipp')()
              }}
            />
          </Abschnitt>
          <Abschnitt titel="2. Wirf Zahlen in die Maschine">
            <MaschineA
              frei={tippFest}
              tipp={tippFest ? tipp : null}
              wuerfe={wuerfe}
              onWurf={(x) => setWuerfe((w) => [...w, x])}
              verbunden={verbunden}
              onVerbinden={() => setVerbunden(true)}
              onFertig={fertig.teil('probieren')}
            />
          </Abschnitt>
          {new Set(wuerfe).size >= 5 && wuerfe.includes(-4) && (
            <Abschnitt titel={<>3. Und bei <M>{'x = 40'}</M>?</>}>
              <p className="sl-text">Wirf eine große Zahl ein, zum Beispiel 40 oder −100.</p>
              <Grenze
                onWurf={(x) => setWuerfe((w) => [...w, x])}
                fehlerZahl={fehlerZahl}
                onFehler={(z) => {
                  setFehlerZahl(z)
                  fertig.teil('grenze')()
                }}
              />
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Regel von Maschine B knacken',
      pflicht: ['kern', 'graph', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 20 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Knacke die Regel von Maschine B</p>
            <p>
              Maschine B ist kaputt. Sie zeigt nur noch ihr Protokoll. Finde heraus, mit welcher Zahl sie jedes <M>x</M> malnimmt, und schreibe ihre Funktionsgleichung{' '}
              <M>{'y = m \\cdot x'}</M> auf. Berechne damit, was sie bei <M>{'x = 10'}</M> und bei <M>{'x = -7'}</M> ausgeben würde. Zeichne ihren Graphen in dein Heft.
            </p>
          </div>
          <Protokoll paare={PROTOKOLL_B} label="Protokoll von Maschine B: aus −2 wird 4, aus 1 wird −2, aus 3 wird −6" />
          <div className="bk-graph fm-bild">
            <KoSystem
              yMax={10}
              yStep={2}
              punkte={PROTOKOLL_B.map((p) => ({ ...p, art: 'alt' as const, text: `(${zahl(p.x)} | ${zahl(p.y)})` }))}
              linien={liveB ? [{ ...liveB, art: geloest ? 'haupt' : 'live' }] : []}
              label={`Koordinatensystem mit den drei Punkten aus dem Protokoll von Maschine B${liveB ? ' und der Geraden zu deiner eingetippten Gleichung' : ''}.`}
            />
          </div>
          <BeispielMitVideo>
            <Beispiel offen title="Die Regel von Maschine Z knacken" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('kern')()
                setGeloest(true)
              }}
              punkte={15}
              title="Maschine B"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt. Deine Gleichung wird gleich in das Koordinatensystem oben gezeichnet.</p>}
              fields={[
                { kind: 'num', key: 'm', label: <>Mit welcher Zahl nimmt Maschine B jedes <M>x</M> mal? <M>{'m ='}</M></>, expected: -2 },
                { kind: 'gleichung', key: 'gl', label: 'Wie lautet die Funktionsgleichung von Maschine B?', m: -2, t: 0 },
                { kind: 'num', key: 'y10', label: <>Was gibt Maschine B bei <M>{'x = 10'}</M> aus? <M>{'y ='}</M></>, expected: -20 },
                { kind: 'num', key: 'y7', label: <>Was gibt Maschine B bei <M>{'x = -7'}</M> aus? <M>{'y ='}</M></>, expected: 14 },
              ]}
              onEingabe={(w) => {
                const g = parseLinearEquation(w.gl ?? '')
                setLiveB(g.ok ? { m: g.m, t: g.t } : null)
              }}
              loesungNachFehler
              solution={LOESUNG_B}
              help={
                <Hilfen
                  steps={[
                    <>Wie im Beispiel: Teile bei jedem Paar <M>y</M> durch <M>x</M>. Was fällt dir auf?</>,
                    <>
                      <M>{'4 : (-2) = -2'}</M>. Rechne auch <M>{'(-2) : 1'}</M> und <M>{'(-6) : 3'}</M>. Kommt immer dieselbe Zahl heraus, ist das <M>m</M>. Die Gleichung heißt dann{' '}
                      <M>{'y = m \\cdot x'}</M>.
                    </>,
                    <>
                      <M>{'m = -2'}</M>, also <M>{'y = -2x'}</M>. Für <M>{'x = 10'}</M> rechnest du <M>{'-2 \\cdot 10'}</M>. Achtung bei <M>{'x = -7'}</M>: Minus mal Minus ergibt Plus.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Welcher Graph gehört zu Maschine B?">
            <McCard
              onSolved={fertig.teil('graph')}
              punkte={4}
              title="Graph wählen"
              prompt={<p>Nur einer der Graphen zeigt Maschine B. Tipp: Prüfe einen Punkt aus dem Protokoll, zum Beispiel <M>{'(1 \\mid -2)'}</M>.</p>}
              options={[
                {
                  text: <MiniGraph linie={{ m: 2 }} label="Gerade durch den Ursprung, die nach rechts steigt" />,
                  feedback: 'Diese Gerade steigt. Bei x = 1 ist sie bei 2, Maschine B gibt aber −2 aus. Das Vorzeichen von m stimmt nicht.',
                },
                {
                  text: <MiniGraph linie={{ m: -0.5 }} label="Gerade durch den Ursprung, die flach nach rechts fällt" />,
                  feedback: 'Diese Gerade ist zu flach: Bei x = 2 ist sie erst bei −1. Hier wurde x : y statt y : x gerechnet, das ergibt −0,5.',
                },
                {
                  text: <MiniGraph linie={{ m: -2 }} label="Gerade durch den Ursprung, die steil nach rechts fällt" />,
                  correct: true,
                  feedback: 'Genau: Bei x = 1 ist die Gerade bei −2, bei x = −2 bei 4. Alle Punkte aus dem Protokoll liegen darauf.',
                },
                {
                  text: <MiniGraph linie={{ m: 0, t: -2 }} label="Waagrechte Gerade, die die y-Achse bei −2 schneidet" />,
                  feedback: 'Bei dieser waagrechten Geraden kommt für jedes x −2 heraus. Das wäre die Gleichung y = −2, nicht y = −2x.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Maschinen-Steckbrief für Maschine B">
            <div className="zk-bild zk-bild-klein">
              <SteckbriefBild />
            </div>
            <p className="sl-text">
              Gestalte auf einer Karteikarte oder im Heft einen Steckbrief für Maschine B. Teile ihn in vier Felder: Regel in Worten, Wertetabelle für <M>x</M> von −2 bis 2, Graph
              und Funktionsgleichung. Schreibe darunter einen Satz, warum Maschine B eine Funktion ist.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Maschine B nimmt jede Zahl mal …“</li>
                <li>„Wertetabelle: Für x = −2, −1, 0, 1, 2 kommt … heraus.“</li>
                <li>„Die Funktionsgleichung heißt y = …“</li>
                <li>„Der Graph ist eine Gerade, die durch … geht.“</li>
                <li>„Maschine B ist eine Funktion, weil zu jedem x …“</li>
              </ul>
            </Aufklappbar>
            <Aufklappbar label="Wortspeicher ansehen" icon="fa-book">
              <ul className="zk-liste">
                <li>
                  <strong>Funktion:</strong> ordnet jedem <M>x</M> genau ein <M>y</M> zu, wie die Maschine.
                </li>
                <li>
                  <strong>Wertetabelle:</strong> das Protokoll der Maschine.
                </li>
                <li>
                  <strong>Funktionsgraph:</strong> alle Paare <M>{'(x \\mid y)'}</M> als Punkte im Koordinatensystem.
                </li>
                <li>
                  <strong>Funktionsgleichung:</strong> der Bauplan der Maschine, z. B. <M>{'y = 3x'}</M>.
                </li>
                <li>
                  <strong>Ursprung:</strong> der Punkt <M>{'(0 \\mid 0)'}</M>, wo sich die Achsen kreuzen.
                </li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Steckbrief vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                'Alle vier Felder zeigen dieselbe Maschine: Jede Spalte deiner Wertetabelle ist ein Punkt in deinem Graphen.',
                <>
                  Der Graph ist eine Gerade durch den Ursprung <M>{'(0 \\mid 0)'}</M>, die Achsen sind mit <M>x</M> und <M>y</M> beschriftet.
                </>,
                'Unter dem Steckbrief steht: „Maschine B ist eine Funktion, weil zu jedem x genau ein y gehört.“',
                <>
                  Auf deinem Steckbrief steht, was die Begriffe bedeuten: Funktion, Wertetabelle, Funktionsgraph, Funktionsgleichung, Ursprung. Außerdem steht dort, wofür die
                  Buchstaben stehen: <M>x</M> (die Zahl, die du einwirfst), <M>y</M> (die Zahl, die herauskommt) und <M>m</M> (die Zahl, mit der <M>x</M> malgenommen wird). Erkläre
                  auch alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug tipp={tipp} wuerfe={wuerfe} />
              <Merke title="Funktion">
                <p>
                  Eine <strong>Funktion</strong> ordnet jedem <M>x</M> genau ein <M>y</M> zu. Wie bei der Maschine: Wirfst du dieselbe Zahl ein, kommt immer dasselbe heraus.
                </p>
                <p>Dieselbe Funktion kannst du auf drei Arten darstellen:</p>
                <ul className="zk-liste">
                  <li>
                    <strong>Wertetabelle:</strong> einige Paare <M>x</M> und <M>y</M>, wie das Protokoll der Maschine.
                  </li>
                  <li>
                    <strong>Funktionsgraph:</strong> alle Paare als Punkte <M>{'(x \\mid y)'}</M> im Koordinatensystem.
                  </li>
                  <li>
                    <strong>Funktionsgleichung:</strong> der Bauplan, mit dem du jedes <M>y</M> ausrechnest, z. B. <M>{'y = -2x'}</M>.
                  </li>
                </ul>
                <p>
                  Bei <M>{'y = m \\cdot x'}</M> ist der Graph eine <strong>Gerade durch den Ursprung</strong> <M>{'(0 \\mid 0)'}</M>. Das ist eine <strong>lineare Funktion</strong>. Die
                  Zahl <M>m</M> bekommst du, wenn du bei einem Punkt <M>y : x</M> rechnest.
                </p>
                <p>
                  Proportionale Zuordnungen kennst du schon. <M>{'y = m \\cdot x'}</M> beschreibt sie mathematisch, jetzt aber auch für negative Zahlen und Kommazahlen.
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
            Einzelarbeit, ca. 15 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Welche Gleichung passt?">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Funktionsmaschine: Gleichung zur Tabelle (Basis)"
              title="Übung 1"
              level="basis"
              prompt={
                <>
                  <p>Welche Funktionsgleichung passt zu diesem Protokoll?</p>
                  <Protokoll
                    paare={[
                      { x: 1, y: 3 },
                      { x: 2, y: 6 },
                      { x: 3, y: 9 },
                    ]}
                    label="Protokoll: aus 1 wird 3, aus 2 wird 6, aus 3 wird 9"
                  />
                </>
              }
              options={[
                { text: <M>{'y = x + 2'}</M>, feedback: 'Das passt nur zum ersten Paar: 1 + 2 = 3. Prüfe das zweite Paar: 2 + 2 = 4, nicht 6.' },
                { text: <M>{'y = x + 3'}</M>, feedback: 'Hier wird 3 addiert. Dann käme bei x = 1 aber 4 heraus. Prüfe mit y : x, mit welcher Zahl malgenommen wird.' },
                { text: <M>{'y = 3x'}</M>, correct: true, feedback: '3 : 1 = 3, 6 : 2 = 3, 9 : 3 = 3. Immer mal 3, also y = 3x.' },
                { text: <M>{'y = 9x'}</M>, feedback: 'Bei x = 1 käme dann 9 heraus, nicht 3. Die 9 ist nur der letzte y-Wert.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Welche Maschine ist keine Funktion?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={4}
              topic="Funktionsmaschine: Funktion erkennen (Basis)"
              title="Übung 2"
              level="basis"
              prompt={
                <>
                  <p>Vier Maschinen haben ein Protokoll geschrieben. Eine davon ist keine Funktion. Welche?</p>
                  <div className="fm-protokolle">
                    <MiniProtokoll
                      name="Maschine 1"
                      paare={[
                        [1, 2],
                        [2, 4],
                        [3, 6],
                      ]}
                    />
                    <MiniProtokoll
                      name="Maschine 2"
                      paare={[
                        [-1, 3],
                        [0, 0],
                        [1, -3],
                      ]}
                    />
                    <MiniProtokoll
                      name="Maschine 3"
                      paare={[
                        [1, 5],
                        [2, 5],
                        [3, 5],
                      ]}
                    />
                    <MiniProtokoll
                      name="Maschine 4"
                      paare={[
                        [2, 4],
                        [2, -4],
                        [3, 6],
                      ]}
                    />
                  </div>
                </>
              }
              options={[
                { text: 'Maschine 1', feedback: 'Maschine 1 nimmt jedes x mal 2. Zu jedem x gehört genau ein y, sie ist eine Funktion.' },
                { text: 'Maschine 2', feedback: 'Maschine 2 nimmt jedes x mal −3. Negative Zahlen sind erlaubt, sie ist eine Funktion.' },
                {
                  text: 'Maschine 3',
                  feedback: 'Bei Maschine 3 kommt immer 5 heraus. Das ist erlaubt: Verschiedene x dürfen dasselbe y haben. Verboten ist nur, dass ein x zwei verschiedene y bekommt.',
                },
                { text: 'Maschine 4', correct: true, feedback: 'Genau: Für x = 2 kommt einmal 4 und einmal −4 heraus. Zu einem x gehören zwei y, das ist keine Funktion.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={5}
              topic="Funktionsmaschine: x einsetzen mit Minus (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Eine Maschine hat die Regel <M>{'y = 3x'}</M>. Lea sagt: „Bei <M>{'x = -2'}</M> kommt 6 heraus.“ Tom sagt: „Nein, es kommt −6 heraus.“ Wer hat recht?
                </p>
              }
              options={[
                { text: 'Lea, denn mal 3 macht die Zahl immer größer.', feedback: 'Bei negativen Zahlen stimmt das nicht. Rechne genau: 3 · (−2) = ?' },
                { text: 'Tom, denn 3 · (−2) = −6.', correct: true, feedback: 'Plus mal Minus ergibt Minus. Lea hat das Minus von x = −2 vergessen.' },
                { text: 'Beide, je nachdem, wie man rechnet.', feedback: 'Eine Funktion gibt zu jedem x genau ein y aus. Es kann nur eine Antwort richtig sein.' },
                { text: 'Keiner, man darf keine negativen Zahlen einsetzen.', feedback: 'Doch: In y = 3x darfst du jede Zahl einsetzen, auch negative. Der Graph geht auch nach links unten weiter.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Umgekehrt gedacht">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              topic="Funktionsmaschine: x zu gegebenem y (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Maschine C hat die Regel <M>{'y = 4x'}</M>. Sie gibt <M>{'y = -20'}</M> aus. Welche Zahl wurde eingeworfen? Trage sie in die Gleichung ein.
                </p>
              }
              rechnung={[{ l: ['-20'], r: ['4 \\cdot (', { luecke: 'x' }, ')'] }]}
              fields={[{ kind: 'num', key: 'x', label: 'eingeworfene Zahl x', expected: -5 }]}
              solution={<MB>{'\\begin{aligned} -20 &= 4x && \\mid :4 \\\\ x &= -5 \\end{aligned} \\qquad \\text{Probe: } 4 \\cdot (-5) = -20 \\;\\checkmark'}</MB>}
              help={
                <Hilfen
                  steps={[
                    <>Welche Zahl musst du mit 4 malnehmen, damit −20 herauskommt?</>,
                    <>Rechne rückwärts: Statt mal 4 rechnest du geteilt durch 4.</>,
                    <><M>{'(-20) : 4'}</M>. Minus durch Plus ergibt Minus.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Gleichung aus dem Graphen">
            <CheckCard
              title="Übung 5"
              profi
              punkte={8}
              level="erweiterung"
              prompt={
                <>
                  <p>
                    Hier ist der Graph einer Maschine. Lies zwei Punkte ab und gib ihre Funktionsgleichung <M>{'y = m \\cdot x'}</M> an.
                  </p>
                  <div className="bk-graph fm-bild fm-bild-klein">
                    <KoSystem
                      yMax={4}
                      yStep={1}
                      w={520}
                      h={300}
                      punkte={[
                        { x: -4, y: 2, art: 'alt' },
                        { x: 2, y: -1, art: 'alt' },
                      ]}
                      linien={[{ m: -0.5, art: 'haupt' }]}
                      label="Gerade durch den Ursprung, die nach rechts fällt. Markiert sind die Punkte (−4 | 2) und (2 | −1)."
                    />
                  </div>
                </>
              }
              fields={[{ kind: 'gleichung', key: 'gl', label: 'Funktionsgleichung', m: -0.5, t: 0 }]}
              solution={
                <>
                  <MB>{'(-1) : 2 = -0{,}5 \\qquad 2 : (-4) = -0{,}5 \\qquad \\Rightarrow\\; y = -0{,}5x'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Lies einen Punkt ab, der genau auf einer Kreuzung der Kästchen liegt.</>,
                    <>Bei <M>{'(2 \\mid -1)'}</M> rechnest du <M>{'y : x = (-1) : 2'}</M>.</>,
                    <><M>{'m = -0{,}5'}</M>. Schreibe die Gleichung als <M>{'y = -0{,}5x'}</M>.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Zeichenroboter">
            <ZeichenRoboter />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du weißt jetzt, was eine Funktion ist, und kannst <M>{'y = m \\cdot x'}</M> als Wertetabelle, Graph und Gleichung darstellen. In den Übungsaufgaben ordnest du die
              Darstellungen einander zu.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Was gehört zusammen? <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell
      title="Lineare Funktion: Die Funktionsmaschine"
      width="wide"
      kompakt
      parent={{ to: '/lineare_funktionen/was_ist_linear', label: 'Was ist eine lineare Funktion?' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={
          <>
            Du knackst die geheimen Regeln von Funktionsmaschinen. Dabei lernst du, was eine Funktion ist und wie du sie als Wertetabelle, Funktionsgraph und Funktionsgleichung{' '}
            <M>{'y = m \\cdot x'}</M> darstellst.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf den Tipp und die Würfe aus „Problem erkennen“ */
function Rueckbezug({ tipp, wuerfe }: { tipp: number | null; wuerfe: number[] }) {
  if (tipp === null) return null
  return (
    <div className="ls-back">
      <p>
        <strong>Bei Maschine A hattest du für <M>{'x = -4'}</M> den Wert {zahl(tipp)} getippt.</strong> Die Maschine gab <M>{'-12'}</M> aus, denn ihre Funktionsgleichung ist{' '}
        <M>{'y = 3x'}</M> und <M>{'3 \\cdot (-4) = -12'}</M>. Du hast {new Set(wuerfe).size} verschiedene Zahlen eingeworfen. Mit der Gleichung brauchst du die Maschine nicht mehr:{' '}
        <M>{'x = 40{:}\\; y = 3 \\cdot 40 = 120'}</M>.
      </p>
    </div>
  )
}
