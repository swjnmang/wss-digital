import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import TaskShell from '../../../components/layout/TaskShell'
import { useSitzungState } from '../../../hooks/useSitzung'
import { Beispiel, M, MB, Merke, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, Loesungsweg, McCard, TrackedCheck, TrackedMc } from '../lernsituation_kit/kit'
import { Abschnitt, Aufklappbar, BeispielMitVideo, BonusSpiel, Handlungsprodukt, SeitenLernsituation, type Bildwelt, type Seite, type Thema } from '../lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../lernsituation_kit/punkte'
import { Kriterien, standardKriterien } from '../../finanzmathe/zins_kit/zins_kit'
import { FARBE, Plan, type Rampe } from './grafik'
import RampenRallye from './RampenRallye'
import titelBild from './bilder/titel.webp'
import rampenBild from './bilder/rampen.webp'
import bauplanBild from './bilder/bauplan.webp'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './bikepark.css'

// Lernsituation „Der Bikepark“: Einstieg in die Steigung m, nur Ursprungsgeraden y = m · x (ca. 30–45 min).
// Fokus: m verstehen und mit einem Steigungsdreieck ablesen, m = Δy : Δx. Keine Berechnung aus zwei beliebigen Punkten
// (das kommt erst in „Die Steigung m berechnen“), kein + t.
// Format Kontrastierende Fälle (Schwartz & Bransford): Drei Holz-Auffahrten zum Starthügel, A 6 m lang und 3 m hoch, B 4 m lang und 3 m hoch,
// C 4 m lang und 2 m hoch. A und B sind gleich hoch (die Länge macht den Unterschied), B und C gleich lang (die Höhe macht den Unterschied),
// A und C verschieden groß, aber gleich steil (m = 0,5). Aha: Die größte Auffahrt A ist nicht die steilste, und A und C liegen im Plan
// genau aufeinander. Einsteiger-Regel des Jugendrats: höchstens 0,6 m nach oben pro 1 m nach rechts → B (m = 0,75) ist zu steil.
// Problem erkennen: Festlegung (steilste Auffahrt, A gegen C), dann die drei Auffahrten im Plan übereinanderlegen.
// Problem lösen: m für A, B, C mit Steigungsdreieck ablesen (Live-Linien im Plan), Beispielrechnung Auffahrt Z (5 m lang, 2 m hoch, m = 0,4)
// mit Lernvideo „Steigung ablesen“, dazu eine Abfahrt mit m = −0,5. Entscheidung, welche Auffahrt die Regel verletzt.
// Handlungsprodukt analog: Bauplan-Skizze für den Jugendrat (Skizze mit Beschriftung: Steigungsdreiecke, Δx, Δy, m, Empfehlung).
// Punkte nach Aufwand: Warm-up 5 × 2 = 10, Festlegung 3, Übereinanderlegen 3, Kernaufgabe 15, Entscheidung 4, Bauplan 5, Übungen 4/5/6/8,
// Profi 8 (Pflicht zusammen 63: Warm-up 10 = 16 %, Problem lösen 24 = 38 %, Übungen 23 = 37 %), Bonus-Spiel 4 Runden à 2 = 8 wie die beste Übung.
// Identität: Themenfarbe Petrol, Symbol fa-person-biking, Titelbild Bikepark-Insel mit den Auffahrten A, B, C, Leitobjekt die Auffahrten.
// Bildwelt Diorama / Sommerwiese: Titelbild, Auffahrten und Bauplan sind gerenderte WebP-Dateien aus bilder-quelle/*.bild.html
// (node scripts/bilder-rendern.cjs src/pages/lineare_funktionen/steigung_einstieg); Graphen bleiben Inline-SVG (grafik.tsx).

const THEMA: Thema = {
  name: 'Der Bikepark',
  farbe: 'petrol',
  icon: 'fa-person-biking',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Kleine schwebende Wiese als Spielwelt: ein Starthügel mit Fahne, davor drei Holz-Auffahrten mit den Buchstaben A, B und C, ein Fahrrad auf dem Weg und ein Schild „Bikepark in Planung“."
    />
  ),
}
const BILDWELT: Bildwelt = { welt: 'diorama', variante: 'sommerwiese' }

/* ── Die drei Auffahrten (Leitobjekt) ────────────────────────────────────── */

type Name = 'A' | 'B' | 'C'
const AUFFAHRTEN: Record<Name, { lang: number; hoch: number }> = {
  A: { lang: 6, hoch: 3 },
  B: { lang: 4, hoch: 3 },
  C: { lang: 4, hoch: 2 },
}
const NAMEN: Name[] = ['A', 'B', 'C']
const rampe = (n: Name, extra: Partial<Rampe> = {}): Rampe => ({
  m: AUFFAHRTEN[n].hoch / AUFFAHRTEN[n].lang,
  bis: AUFFAHRTEN[n].lang,
  name: n,
  farbe: FARBE[n],
  keil: true,
  ...extra,
})

const STEIL_WAHL: { wert: string; text: string }[] = [
  { wert: 'A', text: 'Auffahrt A' },
  { wert: 'B', text: 'Auffahrt B' },
  { wert: 'C', text: 'Auffahrt C' },
  { wert: 'gleich', text: 'Alle gleich steil' },
]
const AC_WAHL: { wert: string; text: string }[] = [
  { wert: 'A', text: 'A ist steiler' },
  { wert: 'C', text: 'C ist steiler' },
  { wert: 'gleich', text: 'A und C sind gleich steil' },
]

/** Festlegung vor dem Ausprobieren: Welche Auffahrt ist am steilsten? Wie stehen A und C zueinander? */
function Festlegung({
  steil,
  ac,
  fest,
  onSteil,
  onAc,
  onFest,
}: {
  steil: string | null
  ac: string | null
  fest: boolean
  onSteil: (v: string) => void
  onAc: (v: string) => void
  onFest: () => void
}) {
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  if (fest) {
    return (
      <p className="ls-saved" role="status">
        <i className="fa-solid fa-lock" aria-hidden="true" /> Deine Vermutung: Am steilsten ist{' '}
        <strong>{STEIL_WAHL.find((w) => w.wert === steil)?.text}</strong>. Zu A und C: <strong>{AC_WAHL.find((w) => w.wert === ac)?.text}</strong>. Gleich prüfst du sie im
        Plan.
      </p>
    )
  }
  return (
    <div className="bp-wahl-block" data-no-autocheck>
      <p className="sl-text">Welche Auffahrt ist am steilsten?</p>
      <div className="bp-wahl" role="radiogroup" aria-label="Welche Auffahrt ist am steilsten?">
        {STEIL_WAHL.map((w) => (
          <button key={w.wert} type="button" role="radio" aria-checked={steil === w.wert} className={`bk-btn${steil === w.wert ? ' bk-btn-primary' : ''}`} onClick={() => onSteil(w.wert)}>
            {w.text}
          </button>
        ))}
      </div>
      <p className="sl-text">A ist größer als C. Was meinst du?</p>
      <div className="bp-wahl bp-wahl-3" role="radiogroup" aria-label="Vergleich von Auffahrt A und Auffahrt C">
        {AC_WAHL.map((w) => (
          <button key={w.wert} type="button" role="radio" aria-checked={ac === w.wert} className={`bk-btn${ac === w.wert ? ' bk-btn-primary' : ''}`} onClick={() => onAc(w.wert)}>
            {w.text}
          </button>
        ))}
      </div>
      <div>
        <button
          type="button"
          className="bk-btn bk-btn-primary"
          disabled={steil === null || ac === null}
          onClick={() => {
            pt.geloest()
            onFest()
          }}
        >
          <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festhalten
        </button>
      </div>
    </div>
  )
}

/** Ausprobieren: Die Auffahrten werden im Plan vom Ursprung aus übereinandergelegt */
function Uebereinander({ frei, gelegt, onLegen, onFertig }: { frei: boolean; gelegt: Name[]; onLegen: (n: Name) => void; onFertig: () => void }) {
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  return (
    <div className="bp-wahl-block" data-no-autocheck>
      <p className="sl-text">
        {frei
          ? 'Tippe eine Auffahrt an. Sie wird so in den Plan gelegt, dass sie unten links im Ursprung beginnt.'
          : 'Halte zuerst oben deine Vermutung fest. Dann kannst du die Auffahrten in den Plan legen.'}
      </p>
      <div className="bp-wahl bp-wahl-3" role="group" aria-label="Auffahrten in den Plan legen">
        {NAMEN.map((n) => (
          <button
            key={n}
            type="button"
            className={`bk-btn${gelegt.includes(n) ? ' bk-btn-primary' : ''}`}
            disabled={!frei || gelegt.includes(n)}
            aria-pressed={gelegt.includes(n)}
            onClick={() => {
              onLegen(n)
              if (gelegt.length === 2) {
                pt.geloest()
                onFertig()
              }
            }}
          >
            <span className="bp-punkt" style={{ background: FARBE[n] }} aria-hidden="true" /> Auffahrt {n}{' '}
            <i className={`fa-solid ${gelegt.includes(n) ? 'fa-check' : 'fa-plus'}`} aria-hidden="true" />
            <span className="sr-only">{gelegt.includes(n) ? ' liegt im Plan' : ' auflegen'}</span>
          </button>
        ))}
      </div>
      <div className="bk-graph bp-bild">
        <Plan
          xMax={7}
          yMax={4}
          einheit={56}
          meter
          rampen={NAMEN.filter((n) => gelegt.includes(n)).map((n) => rampe(n))}
          label={`Plan mit Raster, x und y in Metern. Im Plan liegen: ${gelegt.length ? gelegt.map((n) => `Auffahrt ${n}`).join(', ') : 'noch keine Auffahrt'}.`}
        />
      </div>
    </div>
  )
}

/** Was die SuS beim Übereinanderlegen sehen, mit Bezug auf ihre Vermutung */
function Erkenntnis({ steil, ac }: { steil: string | null; ac: string | null }) {
  return (
    <>
      <p className="sl-text" role="status">
        <strong>Auffahrt B liegt über den anderen: Sie ist am steilsten,</strong> obwohl sie nicht höher ist als A.{' '}
        {steil === 'B' ? 'Das hattest du richtig vermutet.' : steil === 'A' ? 'Viele tippen auf A, weil sie am größten ist. Größe allein sagt aber nichts über die Steilheit.' : 'Deine Vermutung war eine andere.'}
      </p>
      <p className="sl-text">
        <strong>A und C liegen genau aufeinander: Sie sind gleich steil,</strong> obwohl A länger und höher ist.{' '}
        {ac === 'gleich' ? 'Stark, das hattest du richtig!' : 'Das überrascht viele. C ist wie ein kleineres Stück von A.'}
      </p>
      <p className="sl-text">
        Ob B die Einsteiger-Regel einhält, siehst du im Plan aber nicht sicher: Geht es bei B pro 1 m nach rechts mehr oder weniger als <M>{'0{,}6'}</M> m nach oben? Dafür
        brauchst du <strong>eine Zahl, die sagt, wie steil eine Auffahrt ist</strong>. Diese Zahl heißt Steigung. Wie du sie abliest, lernst du auf der nächsten Seite.
      </p>
    </>
  )
}

/* ── Problem lösen: Beispielrechnung Auffahrt Z ──────────────────────────── */

const BSP_AUFGABE = (
  <>
    <p>
      Die Nachbargemeinde hat eine Auffahrt Z gebaut: 5 m lang, 2 m hoch. Lies ihre Steigung <M>m</M> mit einem Steigungsdreieck ab.
    </p>
  </>
)
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Ein Steigungsdreieck zeichnen',
    body: (
      <>
        <p>
          Starte auf der Geraden, hier im Ursprung <M>{'(0 \\mid 0)'}</M>. Gehe <strong>waagrecht nach rechts</strong> bis unter das Ende der Auffahrt, dann{' '}
          <strong>senkrecht nach oben</strong> bis zur Geraden.
        </p>
        <div className="bk-graph bp-bild bp-bild-klein">
          <Plan xMax={6} yMax={3} einheit={50} meter rampen={[{ m: 0.4, bis: 5, keil: true }]} dreiecke={[{ x0: 0, dx: 5, m: 0.4, dxText: 'Δx = 5', dyText: 'Δy = 2' }]} label="Auffahrt Z als Strecke vom Ursprung bis (5 | 2). Das Steigungsdreieck geht 5 nach rechts und 2 nach oben." />
        </div>
      </>
    ),
  },
  {
    title: <>Was heißen <M>{'\\Delta x'}</M> und <M>{'\\Delta y'}</M>?</>,
    body: (
      <p>
        <M>{'\\Delta'}</M> (Delta) ist das griechische D. Es steht für Differenz, also den Unterschied. <M>{'\\Delta x = 5'}</M> heißt: 5 m nach rechts.{' '}
        <M>{'\\Delta y = 2'}</M> heißt: 2 m nach oben. Geht es nach unten, ist <M>{'\\Delta y'}</M> negativ.
      </p>
    ),
  },
  {
    title: <>Steigung = <M>{'\\Delta y'}</M> durch <M>{'\\Delta x'}</M></>,
    body: (
      <>
        <MB>{'m = \\frac{\\Delta y}{\\Delta x} = \\frac{2}{5} = 0{,}4'}</MB>
        <p>
          Das bedeutet: <strong>Pro 1 m nach rechts geht es 0,4 m nach oben.</strong> Je größer <M>m</M>, desto steiler die Auffahrt.
        </p>
      </>
    ),
  },
  {
    title: 'Jedes Steigungsdreieck ergibt dieselbe Steigung',
    body: (
      <>
        <p>
          Ein kleineres Dreieck an einer anderen Stelle der Geraden: <M>{'\\Delta x = 2{,}5'}</M> und <M>{'\\Delta y = 1'}</M>, also{' '}
          <M>{'m = \\frac{1}{2{,}5} = 0{,}4'}</M>. Größe und Lage des Dreiecks sind egal. Wähle es so, dass du gut ablesen kannst, also mit Ecken auf den Kästchen.
        </p>
        <div className="bk-graph bp-bild bp-bild-klein">
          <Plan
            xMax={6}
            yMax={3}
            einheit={50}
            meter
            rampen={[{ m: 0.4, bis: 5, keil: true }]}
            dreiecke={[
              { x0: 0, dx: 2.5, m: 0.4, dxText: '2,5', dyText: '1' },
              { x0: 2.5, dx: 2.5, m: 0.4, dxText: '2,5', dyText: '1' },
            ]}
            label="Dieselbe Auffahrt Z mit zwei kleinen Steigungsdreiecken: jeweils 2,5 nach rechts und 1 nach oben."
          />
        </div>
      </>
    ),
  },
  {
    title: 'Und wenn es bergab geht?',
    body: (
      <>
        <p>
          Bei einer Abfahrt gehst du nach rechts und dann <strong>nach unten</strong>: <M>{'\\Delta x = 4'}</M>, <M>{'\\Delta y = -2'}</M>, also{' '}
          <M>{'m = \\frac{-2}{4} = -0{,}5'}</M>. Eine negative Steigung heißt: Die Gerade fällt.
        </p>
        <div className="bk-graph bp-bild bp-bild-klein">
          <Plan xMax={6} yMin={-3} yMax={1} einheit={50} rampen={[{ m: -0.5 }]} dreiecke={[{ x0: 0, dx: 4, m: -0.5, dxText: 'Δx = 4', dyText: 'Δy = −2' }]} label="Fallende Gerade durch den Ursprung. Das Steigungsdreieck geht 4 nach rechts und 2 nach unten." />
        </div>
      </>
    ),
  },
  {
    title: 'Die Steigung steht in der Gleichung',
    body: (
      <p>
        Auffahrt Z liegt auf der Ursprungsgeraden <M>{'y = 0{,}4x'}</M>, die Abfahrt auf <M>{'y = -0{,}5x'}</M>. Bei <M>{'y = m \\cdot x'}</M> ist die Zahl vor dem <M>x</M>{' '}
        genau die Steigung <M>m</M>.
      </p>
    ),
  },
]

const LOESUNG_KERN = (
  <>
    <p>Jede Auffahrt ist selbst ein Steigungsdreieck: Die Länge ist <M>{'\\Delta x'}</M>, die Höhe ist <M>{'\\Delta y'}</M>.</p>
    <Loesungsweg
      schritte={[
        { titel: 'Auffahrt A', tex: 'm_A = \\dfrac{3}{6} = 0{,}5' },
        { titel: 'Auffahrt B', tex: 'm_B = \\dfrac{3}{4} = 0{,}75' },
        { titel: 'Auffahrt C', tex: 'm_C = \\dfrac{2}{4} = 0{,}5' },
      ]}
    />
  </>
)

/** Eingetippte Steigung als Zahl (auch als Bruch wie 3/4), sonst null */
const alsZahl = (v?: string) => {
  const p = v ? parseInput(v) : null
  return p && Math.abs(p.value) <= 10 ? p.value : null
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function BikeparkEinstieg() {
  const navigate = useNavigate()
  const onBack = () => navigate('/lineare_funktionen/steigung')
  const onPractice = () => navigate('/lineare_funktionen/steigung/ablesen')
  const [steil, setSteil] = useSitzungState<string | null>('bp-steil', null)
  const [ac, setAc] = useSitzungState<string | null>('bp-ac', null)
  const [fest, setFest] = useSitzungState('bp-fest', false)
  const [gelegt, setGelegt] = useSitzungState<Name[]>('bp-gelegt', [])
  const [live, setLive] = useState<Record<Name, number | null>>({ A: null, B: null, C: null })
  const [geloest, setGeloest] = useSitzungState('bp-geloest', false)
  const [uebungen, setUebungen] = useSitzungState<string[]>('bp-uebungen', [])
  /** Pflicht-Übung melden: schaltet „Weiter“ und das Bonus-Spiel frei */
  const uebung = (k: string, fertig: () => void) => () => {
    fertig()
    setUebungen((u) => (u.includes(k) ? u : [...u, k]))
  }
  const alleGelegt = gelegt.length === 3

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 6 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Punkt ablesen"
            prompt={
              <>
                <p>
                  Lies die Koordinaten von Punkt <M>P</M> ab.
                </p>
                <div className="bk-graph bp-bild bp-bild-klein">
                  <Plan xMax={6} yMax={4} einheit={44} punkte={[{ x: 5, y: 3, text: 'P' }]} label="Koordinatensystem mit dem Punkt P rechts oben" />
                </div>
              </>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 5 },
              { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 3 },
            ]}
            solution={<p>Erst nach rechts (x), dann nach oben (y): <M>{'P(5 \\mid 3)'}</M>.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) Wie weit nach rechts?"
            prompt={
              <p>
                Du gehst auf der x-Achse von <M>{'x = 2'}</M> bis <M>{'x = 6'}</M>. Wie weit ist das?
              </p>
            }
            rechnung={[{ l: ['6 - 2'], r: [{ luecke: 'b' }] }]}
            fields={[{ kind: 'num', key: 'b', label: 'Abstand von 2 bis 6', expected: 4 }]}
            solution={<MB>{'6 - 2 = 4'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Zähle die Kästchen von 2 bis 6 auf der x-Achse.</>,
                  <>Den Abstand bekommst du auch mit Minus: Ende minus Anfang.</>,
                  <><M>{'6 - 2'}</M>, also 4 Schritte nach rechts.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Rauf oder runter?"
            prompt={
              <p>
                Ein Punkt liegt erst bei <M>{'y = 5'}</M>, dann bei <M>{'y = 2'}</M>. Um wie viel hat sich <M>y</M> verändert? Geht es nach unten, ist die Änderung negativ.
              </p>
            }
            rechnung={[{ l: ['2 - 5'], r: [{ luecke: 'c' }] }]}
            fields={[{ kind: 'num', key: 'c', label: 'Änderung von 5 auf 2', expected: -3 }]}
            solution={<p><M>{'2 - 5 = -3'}</M>, also 3 nach unten.</p>}
            help={
              <Hilfen
                steps={[
                  <>Von 5 nach 2: Geht es nach oben oder nach unten?</>,
                  <>Rechne neuer Wert minus alter Wert. Nach unten kommt eine negative Zahl heraus.</>,
                  <><M>{'2 - 5'}</M>: 3 nach unten, also <M>{'-3'}</M>.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Bruch als Dezimalzahl"
            prompt={<p>Schreibe die Brüche als Dezimalzahl.</p>}
            rechnung={[
              { l: ['\\frac{1}{2}'], r: [{ luecke: 'd1' }] },
              { l: ['\\frac{3}{4}'], r: [{ luecke: 'd2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'd1', label: 'ein Halb als Dezimalzahl', expected: 0.5 },
              { kind: 'num', key: 'd2', label: 'drei Viertel als Dezimalzahl', expected: 0.75 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Erster Bruch', tex: '\\dfrac{1}{2} = 1 : 2 = 0{,}5' },
                  { titel: 'Zweiter Bruch', tex: '\\dfrac{3}{4} = 3 : 4 = 0{,}75' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Ein Bruchstrich bedeutet „geteilt durch“.</>,
                  <><M>{'\\frac{3}{4} = 3 : 4'}</M>. Denk an Geld: drei Viertel von 1 €.</>,
                  <><M>{'1 : 2 = 0{,}5'}</M> und <M>{'3 : 4 = 0{,}75'}</M>.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title={<>e) Die Zahl vor dem <M>x</M></>}
            prompt={
              <p>
                Jede Ursprungsgerade hat eine Gleichung <M>{'y = m \\cdot x'}</M>. Welche Zahl ist jeweils <M>m</M>?
              </p>
            }
            rechnung={[
              { l: ['y = 0{,}4x:\\quad m'], r: [{ luecke: 'e1' }] },
              { l: ['y = -3x:\\quad m'], r: [{ luecke: 'e2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'e1', label: 'm bei y gleich 0,4 x', expected: 0.4 },
              { kind: 'num', key: 'e2', label: 'm bei y gleich minus 3 x', expected: -3 },
            ]}
            solution={<p><M>m</M> ist die Zahl vor dem <M>x</M>, mit Vorzeichen: <M>{'m = 0{,}4'}</M> und <M>{'m = -3'}</M>.</p>}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Drei Auffahrten für den Bikepark',
      bedingung: 'Halte deine Vermutung fest und lege alle drei Auffahrten in den Plan.',
      pflicht: ['fest', 'legen'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Eure Gemeinde baut auf einer Wiese einen kleinen Bikepark. Du sitzt für deine Klasse im Jugendrat. Der Planer schlägt drei Auffahrten aus Holz vor, über die man zum
            Starthügel kommt.
          </p>
          <p className="sl-text">
            Auffahrt A ist 6 m lang und 3 m hoch, B ist 4 m lang und 3 m hoch, C ist 4 m lang und 2 m hoch. Für Einsteiger hat der Jugendrat eine Regel: Fährt man 1 m waagrecht
            nach vorn, darf es <strong>höchstens 0,6 m nach oben</strong> gehen. Gesucht ist, welche Auffahrt am steilsten ist und welche die Regel einhält.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Vergleiche, ohne zu rechnen</p>
            <p>Lege dich zuerst fest, welche Auffahrt am steilsten ist. Lege die drei Auffahrten dann im Plan übereinander und vergleiche.</p>
          </div>
          <p className="sl-hinweis">Einzelarbeit, ca. 8 Minuten.</p>
          <figure className="sl-foto">
            <img
              src={rampenBild}
              width={1200}
              height={600}
              alt="Drei Holz-Auffahrten auf einer Wiese, von der Seite als Dreiecke zu sehen. Auffahrt A: 6 m lang, 3 m hoch. Auffahrt B: 4 m lang, 3 m hoch. Auffahrt C: 4 m lang, 2 m hoch."
            />
          </figure>
          <Abschnitt titel="1. Deine Vermutung">
            <Festlegung
              steil={steil}
              ac={ac}
              fest={fest}
              onSteil={setSteil}
              onAc={setAc}
              onFest={() => {
                setFest(true)
                fertig.teil('fest')()
              }}
            />
          </Abschnitt>
          <Abschnitt titel="2. Lege die Auffahrten übereinander">
            <Uebereinander frei={fest} gelegt={gelegt} onLegen={(n) => setGelegt((g) => (g.includes(n) ? g : [...g, n]))} onFertig={fertig.teil('legen')} />
            {alleGelegt && <Erkenntnis steil={steil} ac={ac} />}
          </Abschnitt>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Steigung der Auffahrten ablesen',
      pflicht: ['kern', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 15 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Gib für jede Auffahrt die Steigung an</p>
            <p>
              Der Planer hat die drei Auffahrten in ein Koordinatensystem gezeichnet, <M>x</M> und <M>y</M> in Metern. Jede beginnt im Ursprung <M>{'(0 \\mid 0)'}</M>. Zeichne für
              jede Auffahrt ein Steigungsdreieck in dein Heft, lies <M>{'\\Delta x'}</M> und <M>{'\\Delta y'}</M> ab und gib die Steigung <M>m</M> an. Entscheide dann, welche
              Auffahrt die Einsteiger-Regel (höchstens <M>{'0{,}6'}</M> m nach oben pro 1 m nach rechts) nicht einhält.
            </p>
          </div>
          <div className="bk-graph bp-bild">
            <Plan
              xMax={7}
              yMax={4}
              einheit={56}
              meter
              rampen={[
                ...NAMEN.map((n) => rampe(n)),
                ...NAMEN.filter((n) => live[n] !== null).map((n) => ({ m: live[n]!, farbe: FARBE[n], art: 'live' as const })),
              ]}
              label="Plan der drei Auffahrten im Koordinatensystem: A vom Ursprung bis (6 | 3), B bis (4 | 3), C bis (4 | 2). Gestrichelt: Geraden zu deinen eingetippten Steigungen."
            />
          </div>
          <BeispielMitVideo video="https://www.youtube.com/embed/fN52WXY_72g" videoTitel="Lernvideo: Steigung ablesen">
            <Beispiel offen title="Die Steigung von Auffahrt Z ablesen" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('kern')()
                setGeloest(true)
              }}
              punkte={15}
              title="Steigung der Auffahrten"
              prompt={
                <p>
                  Trage die Ergebnisse aus deinem Heft ein, als Dezimalzahl oder als Bruch (z. B. <M>{'3/4'}</M>). Jedes Feld zeigt dir sofort, ob es stimmt. Deine Steigung wird
                  gestrichelt in den Plan oben gezeichnet.
                </p>
              }
              fields={[
                { kind: 'num', key: 'mA', label: <>Wie viele Meter geht es bei Auffahrt A nach oben, wenn du 1 m nach rechts fährst? <M>{'m_A ='}</M></>, expected: 0.5, tol: 0.001 },
                { kind: 'num', key: 'mB', label: <>Wie viele Meter sind es bei Auffahrt B? <M>{'m_B ='}</M></>, expected: 0.75, tol: 0.001 },
                { kind: 'num', key: 'mC', label: <>Wie viele Meter sind es bei Auffahrt C? <M>{'m_C ='}</M></>, expected: 0.5, tol: 0.001 },
              ]}
              onEingabe={(w) => setLive({ A: alsZahl(w.mA), B: alsZahl(w.mB), C: alsZahl(w.mC) })}
              loesungNachFehler
              solution={LOESUNG_KERN}
              help={
                <Hilfen
                  steps={[
                    <>Jede Auffahrt ist selbst schon ein Steigungsdreieck: Ihre Länge ist <M>{'\\Delta x'}</M>, ihre Höhe ist <M>{'\\Delta y'}</M>.</>,
                    <>
                      Wie im Beispiel: <M>{'m = \\frac{\\Delta y}{\\Delta x}'}</M>. Bei Auffahrt A ist <M>{'\\Delta x = 6'}</M> und <M>{'\\Delta y = 3'}</M>.
                    </>,
                    <>
                      <M>{'m_A = \\frac{3}{6} = 0{,}5'}</M>. Bei B rechnest du <M>{'\\frac{3}{4}'}</M>, bei C <M>{'\\frac{2}{4}'}</M>. Du darfst auch den Bruch eintragen.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Deine Entscheidung">
            <McCard
              onSolved={fertig.teil('entscheidung')}
              punkte={4}
              title="Einsteiger-Regel"
              prompt={
                <p>
                  Erlaubt sind höchstens <M>{'0{,}6'}</M> m nach oben pro 1 m nach rechts. Welche Auffahrt hält die Regel <strong>nicht</strong> ein?
                </p>
              }
              options={[
                { text: 'Auffahrt A, weil sie am höchsten und am längsten ist.', feedback: 'A hat m = 0,5. Groß heißt nicht steil: Pro 1 m geht es nur 0,5 m nach oben.' },
                { text: 'Auffahrt C, weil sie kürzer ist als A.', feedback: 'C hat dieselbe Steigung wie A: m = 0,5. Sie ist nur ein kleineres Stück derselben Geraden.' },
                { text: 'Keine, denn alle Auffahrten sind höchstens 3 m hoch.', feedback: 'Die Regel sagt nichts über die Höhe, sondern über die Steigung: höchstens 0,6 m pro 1 m nach rechts.' },
                { text: 'Auffahrt B, denn ihre Steigung 0,75 ist größer als 0,6.', correct: true, feedback: 'Genau: Bei B geht es pro 1 m nach rechts 0,75 m nach oben. A und C mit m = 0,5 sind erlaubt.' },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Bauplan-Skizze für den Jugendrat">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={bauplanBild}
                width={1200}
                height={480}
                alt="Blatt mit der Überschrift Bauplan-Skizze für den Jugendrat: ein Koordinatensystem mit x in m und y in m, drei Geraden vom Ursprung, an einer davon ein gelbes Steigungsdreieck mit den Beschriftungen Δx = ?, Δy = ? und m = ?. Daneben liegt ein Bleistift."
              />
            </figure>
            <p className="sl-text">
              Der Jugendrat entscheidet nächste Woche. Zeichne für ihn eine Bauplan-Skizze in dein Heft: alle drei Auffahrten in einem Koordinatensystem, an jeder ein beschriftetes
              Steigungsdreieck und darunter deine Empfehlung in einem Satz.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Bei Auffahrt A geht es 6 m nach rechts und … m nach oben, also ist m = …“</li>
                <li>„Pro 1 m nach rechts geht es bei Auffahrt B … m nach oben.“</li>
                <li>„A und C sind gleich steil, weil …“</li>
                <li>„Ich empfehle dem Jugendrat …, weil die Steigung … ist.“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Bauplan-Skizze vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien('an den Jugendrat')} />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug steil={steil} ac={ac} />
              <Merke title="Die Steigung m">
                <p>
                  Ein <strong>Steigungsdreieck</strong> zeichnest du so: Von einem Punkt der Geraden gehst du waagrecht nach rechts (<M>{'\\Delta x'}</M>) und dann senkrecht bis
                  zur Geraden (<M>{'\\Delta y'}</M>, nach unten negativ).
                </p>
                <MB>{'m = \\frac{\\Delta y}{\\Delta x}'}</MB>
                <ul className="zk-liste">
                  <li>
                    <M>m</M> sagt, wie viel es nach oben geht, wenn du 1 nach rechts gehst.
                  </li>
                  <li>Größe und Lage des Steigungsdreiecks sind egal, es kommt immer dieselbe Steigung heraus.</li>
                  <li>
                    <M>{'m > 0'}</M>: Die Gerade steigt. <M>{'m < 0'}</M>: Die Gerade fällt. Je weiter <M>m</M> von 0 entfernt ist, desto steiler.
                  </li>
                  <li>
                    Bei der Ursprungsgeraden <M>{'y = m \\cdot x'}</M> ist die Zahl vor dem <M>x</M> die Steigung, z. B. Auffahrt B: <M>{'y = 0{,}75x'}</M>.
                  </li>
                </ul>
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
            Einzelarbeit, ca. 12 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Steigung ablesen">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Bikepark: Steigung ablesen (Basis)"
              title="Übung 1"
              level="basis"
              prompt={
                <>
                  <p>Welche Steigung hat die Gerade? Das Steigungsdreieck ist schon eingezeichnet.</p>
                  <div className="bk-graph bp-bild bp-bild-klein">
                    <Plan xMax={5} yMax={6} einheit={40} rampen={[{ m: 1.5 }]} dreiecke={[{ x0: 0, dx: 2, m: 1.5, dxText: '2', dyText: '3' }]} label="Steigende Gerade durch den Ursprung mit Steigungsdreieck: 2 nach rechts, 3 nach oben." />
                  </div>
                </>
              }
              options={[
                { text: <M>{'m = \\frac{2}{3}'}</M>, feedback: 'Hier wurde Δx durch Δy gerechnet. Die Steigung ist Δy durch Δx: nach oben geteilt durch nach rechts.' },
                { text: <M>{'m = 1{,}5'}</M>, correct: true, feedback: 'Genau: m = 3 : 2 = 1,5. Pro 1 nach rechts geht es 1,5 nach oben.' },
                { text: <M>{'m = 3'}</M>, feedback: '3 ist nur Δy. Du musst noch durch Δx = 2 teilen.' },
                { text: <M>{'m = -1{,}5'}</M>, feedback: 'Die Gerade steigt, also ist m positiv. Ein Minus gibt es nur, wenn die Gerade fällt.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Die Abfahrt">
            <TrackedCheck
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={5}
              topic="Bikepark: negative Steigung ablesen (Standard)"
              title="Übung 2"
              level="standard"
              prompt={
                <>
                  <p>
                    Vom Starthügel führt eine Abfahrt nach unten. Zeichne im Heft ein Steigungsdreieck ab dem Ursprung: zuerst 2 nach rechts, dann senkrecht bis zur Geraden. Lies ab
                    und gib die Steigung an.
                  </p>
                  <div className="bk-graph bp-bild bp-bild-klein">
                    <Plan xMax={6} yMin={-3} yMax={1} einheit={48} rampen={[{ m: -0.5 }]} label="Fallende Gerade durch den Ursprung, sie geht durch die Punkte (2 | −1) und (4 | −2)." />
                  </div>
                </>
              }
              rechnung={[
                { l: ['\\Delta x'], r: [{ luecke: 'dx' }] },
                { l: ['\\Delta y'], r: [{ luecke: 'dy' }] },
                { l: ['m'], r: [{ luecke: 'm' }] },
              ]}
              fields={[
                { kind: 'num', key: 'dx', label: 'Delta x', expected: 2 },
                { kind: 'num', key: 'dy', label: 'Delta y', expected: -1 },
                { kind: 'num', key: 'm', label: 'Steigung m', expected: -0.5, tol: 0.001 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Steigungsdreieck ablesen', text: 'Δx = 2 nach rechts, Δy = −1 (1 nach unten)' },
                    { titel: 'Steigung', tex: 'm = \\dfrac{-1}{2} = -0{,}5' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Von <M>{'(0 \\mid 0)'}</M> aus 2 nach rechts. Wo ist die Gerade bei <M>{'x = 2'}</M>?</>,
                    <>Es geht 1 nach unten. Nach unten heißt: <M>{'\\Delta y'}</M> ist negativ.</>,
                    <><M>{'m = \\frac{\\Delta y}{\\Delta x} = \\frac{-1}{2}'}</M>.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              topic="Bikepark: Steigungsdreiecke verschiedener Größe (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <>
                  <p>
                    Drei Leute lesen die Steigung derselben Geraden ab. Lena zeichnet ein kleines Dreieck (1 nach rechts, 2 nach oben) und sagt: „<M>{'m = 2'}</M>.“ Tom zeichnet ein
                    großes (3 nach rechts, 6 nach oben) und sagt: „Mein Dreieck ist größer, also <M>{'m = 6'}</M>.“ Mia nimmt Toms Dreieck und rechnet <M>{'3 : 6 = 0{,}5'}</M>.
                  </p>
                  <div className="bk-graph bp-bild bp-bild-klein">
                    <Plan
                      xMax={5}
                      yMax={7}
                      einheit={36}
                      rampen={[{ m: 2 }]}
                      dreiecke={[
                        { x0: 0, dx: 1, m: 2, dxText: '1', dyText: '2' },
                        { x0: 0, dx: 3, m: 2 },
                      ]}
                      label="Gerade durch den Ursprung mit zwei Steigungsdreiecken: klein 1 nach rechts und 2 nach oben, groß 3 nach rechts und 6 nach oben."
                    />
                  </div>
                </>
              }
              options={[
                { text: 'Tom, denn ein größeres Dreieck ergibt eine größere Steigung.', feedback: 'Tom hat nur Δy genommen. Bei seinem Dreieck ist m = 6 : 3 = 2, also genauso viel wie bei Lena.' },
                { text: 'Mia, denn man teilt die waagrechte durch die senkrechte Seite.', feedback: 'Mia hat Δx durch Δy gerechnet. Richtig ist Δy durch Δx: 6 : 3 = 2.' },
                { text: 'Lena: Jedes Steigungsdreieck ergibt hier m = 2, auch Toms mit 6 : 3.', correct: true, feedback: 'Genau: Die Größe des Dreiecks ist egal. 2 : 1 = 6 : 3 = 2.' },
                { text: 'Alle drei, jedes Dreieck hat seine eigene Steigung.', feedback: 'Eine Gerade hat überall dieselbe Steigung. Es kann nur einen richtigen Wert geben.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Umgekehrt gedacht">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              topic="Bikepark: Steigungsdreieck zu gegebenem m (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Eine Ursprungsgerade hat die Steigung <M>{'m = \\frac{2}{3}'}</M>. Wie weit geht es nach oben, wenn du 3 bzw. 6 nach rechts gehst? Und wo liegt die Gerade bei{' '}
                  <M>{'x = -3'}</M>? Zeichne sie dazu im Heft.
                </p>
              }
              rechnung={[
                { l: ['\\Delta x = 3:\\quad \\Delta y'], r: [{ luecke: 'a' }] },
                { l: ['\\Delta x = 6:\\quad \\Delta y'], r: [{ luecke: 'b' }] },
                { l: ['x = -3:\\quad y'], r: [{ luecke: 'c' }] },
              ]}
              fields={[
                { kind: 'num', key: 'a', label: 'Delta y bei 3 nach rechts', expected: 2 },
                { kind: 'num', key: 'b', label: 'Delta y bei 6 nach rechts', expected: 4 },
                { kind: 'num', key: 'c', label: 'y bei x gleich minus 3', expected: -2 },
              ]}
              solution={
                <>
                  <p>
                    <M>{'m = \\frac{2}{3}'}</M> heißt: 3 nach rechts, 2 nach oben. Bei 6 nach rechts ist es doppelt so viel, also 4 nach oben. Gehst du vom Ursprung 3 nach{' '}
                    <strong>links</strong>, geht es 2 nach <strong>unten</strong>: <M>{'y = -2'}</M>, also der Punkt <M>{'(-3 \\mid -2)'}</M>.
                  </p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Lies den Bruch als Steigungsdreieck: <M>{'\\frac{\\Delta y}{\\Delta x} = \\frac{2}{3}'}</M>.</>,
                    <>Doppelt so weit nach rechts heißt doppelt so weit nach oben.</>,
                    <>Nach links ist das Dreieck gespiegelt: 3 nach links, also 2 nach unten.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Welche ist am steilsten?">
            <McCard
              title="Übung 5"
              profi
              punkte={8}
              level="erweiterung"
              prompt={
                <p>
                  Vier Ursprungsgeraden: <M>{'y = 1{,}5x'}</M>, <M>{'y = 0{,}5x'}</M>, <M>{'y = -0{,}25x'}</M> und <M>{'y = -2x'}</M>. Welche ist am steilsten?
                </p>
              }
              options={[
                { text: <><M>{'y = 1{,}5x'}</M>, weil 1,5 die größte Zahl ist</>, feedback: 'Steil heißt: Pro 1 nach rechts geht es viel nach oben oder unten. Bei y = −2x sind es 2 nach unten, das ist mehr als 1,5.' },
                { text: <><M>{'y = -0{,}25x'}</M>, weil sie fällt</>, feedback: 'Sie fällt, aber nur 0,25 pro 1 nach rechts. Das ist die flachste der vier Geraden.' },
                { text: 'Alle gleich, denn alle gehen durch den Ursprung.', feedback: 'Durch den Ursprung gehen alle, aber die Steigungen sind verschieden.' },
                { text: <><M>{'y = -2x'}</M>: Sie fällt pro 1 nach rechts um 2, das ist am meisten.</>, correct: true, feedback: 'Genau: Je weiter m von 0 entfernt ist, desto steiler, egal ob die Gerade steigt oder fällt.' },
              ]}
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Rampen-Check">
            <RampenRallye />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt die Steigung <M>m</M> einer Ursprungsgeraden mit einem Steigungsdreieck ablesen. In den Übungsaufgaben liest du die Steigung an vielen Geraden ab,
              danach lernst du, wie man sie aus zwei Punkten berechnet.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Die Steigung m ablesen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell title="Die Steigung m: Der Bikepark" width="wide" kompakt parent={{ to: '/lineare_funktionen/steigung', label: 'Die Steigung m' }}>
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        bildwelt={BILDWELT}
        ziel={
          <>
            Du planst im Jugendrat die Auffahrten für einen Bikepark. Dabei lernst du, was die Steigung <M>m</M> einer Geraden bedeutet und wie du sie mit einem
            Steigungsdreieck als <M>{'\\frac{\\Delta y}{\\Delta x}'}</M> abliest.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Vermutung aus „Problem erkennen“ */
function Rueckbezug({ steil, ac }: { steil: string | null; ac: string | null }) {
  if (steil === null) return null
  return (
    <div className="ls-back">
      <p>
        <strong>
          Deine Vermutung war: Am steilsten ist „{STEIL_WAHL.find((w) => w.wert === steil)?.text}“, und zu A und C: „{AC_WAHL.find((w) => w.wert === ac)?.text}“.
        </strong>{' '}
        Mit der Steigung ist es jetzt eindeutig: <M>{'m_A = 0{,}5'}</M>, <M>{'m_B = 0{,}75'}</M>, <M>{'m_C = 0{,}5'}</M>. Auffahrt B ist am steilsten. A und C sind gleich steil,
        obwohl A anderthalbmal so lang und hoch ist wie C. Für den Jugendrat heißt das: B ist für Einsteiger zu steil, A und C sind erlaubt.
      </p>
    </div>
  )
}
