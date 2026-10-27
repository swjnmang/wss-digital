import { useEffect, useId, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, ErklaerungCtx, Hilfen, McCard, TrackedCheck, TrackedMc } from '../lernsituation_kit/kit'
import { Abschnitt, Aufklappbar, BeispielMitVideo, BonusSpiel, Handlungsprodukt, SeitenLernsituation, type Seite, type Thema } from '../lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../lernsituation_kit/punkte'
import { Kriterien } from '../../finanzmathe/zins_kit/zins_kit'
import AkkuCountdown from './AkkuCountdown'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './stromspeicher.css'

// Lernsituation „Der Stromspeicher“: Nullstellen linearer Funktionen (ca. 45–60 min).
// Format Experimentierlabor: Die SuS probieren Uhrzeiten aus und beobachten den Ladestand des Speichers. Den genauen Zeitpunkt,
// an dem der Speicher leer ist (2:15 Uhr), treffen sie durch Probieren kaum.
// Problem lösen: Problem → Beispielrechnung E-Bike-Akku mit Lernvideo → Ergebnisse aus dem Heft abgleichen →
// Handlungsprodukt analog: Nachricht an Familie Demir mit Rechnung, Skizze und Uhrzeit. Danach Rückbezug und Merke.
// Phase 4: vier Übungen (Bedeutung, Berechnen, Wer hat recht?, umgekehrt), Profi-Aufgabe ohne Nullstelle, Bonus-Spiel „Akku-Countdown“.
// Punkte nach Aufwand: Warm-up 2/3/2/2/3, Ausprobieren 3, Kernaufgabe 15, Entscheidung 4, Nachricht 5, Übungen 4/5/5/8, Profi 8,
// Bonus-Spiel 4 Runden à 2 (Pflicht zusammen 61: Warm-up 12 = 20 %, Problem lösen 24 = 39 %, Übungen 22 = 36 %).
// Identität: Themenfarbe Indigo (Nacht), Symbol Batterie, Titelbild Haus mit Solaranlage bei Nacht, Leitobjekt der Stromspeicher.
// Kontext Gesellschaft und Umwelt (Energie). Versuche bleiben nur im Seitenzustand.
// Ruhiges Grunddesign: eine Spalte, pro Seite ist nur der Auftrag hervorgehoben. Nach unten scrollen ist erlaubt, seitlich nie.

/** Lernvideo aus den Übungsaufgaben „Nullstellen berechnen“ */
const VIDEO_NULLSTELLEN = 'https://www.youtube.com/watch?v=yIaIp8YaZp4'

/* ── Situation ───────────────────────────────────────────────────────────── */

// Um 20 Uhr (x = 0) sind 2,5 kWh im Speicher, das Haus verbraucht 0,4 kWh pro Stunde: y = −0,4x + 2,5, leer bei x = 6,25 (2:15 Uhr).
const START = 2.5
const VERBRAUCH = 0.4
const X_LEER = START / VERBRAUCH
const ladung = (x: number) => START - VERBRAUCH * x

/** x Stunden nach 20 Uhr als Uhrzeit, z. B. 6,25 → „2:15 Uhr“ */
function uhrzeit(x: number) {
  const minuten = Math.round((20 * 60 + x * 60) % (24 * 60))
  return `${Math.floor(minuten / 60)}:${String(minuten % 60).padStart(2, '0')} Uhr`
}
/** Zahl für KaTeX mit Dezimalkomma */
const tex = (v: number) => fmt(v, 2).replace(',', '{,}').replace('.', '{,}')
const kwh = (v: number) => `${fmt(v, 2).replace('-', '−')} kWh`

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: Haus mit Solaranlage bei Nacht, Stromspeicher mit Ladestand im Keller */
function Titelbild() {
  return (
    <svg viewBox="0 0 720 252" role="img" aria-label="Haus mit Solaranlage bei Nacht. Der Stromspeicher im Keller zeigt um 20 Uhr einen Ladestand von 2,5 kWh.">
      <circle cx="96" cy="62" r="30" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="110" cy="54" r="26" fill="var(--primary-soft)" />
      {[
        [190, 40],
        [600, 34],
        [655, 92],
        [540, 70],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="var(--primary)" />
      ))}
      <rect x="0" y="212" width="720" height="40" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="212" y2="212" stroke="var(--ink)" strokeWidth="2" />
      {/* Haus */}
      <rect x="250" y="112" width="230" height="100" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <polygon points="236,114 365,40 494,114" fill="var(--primary)" />
      {[0, 1, 2].map((i) => (
        <polygon
          key={i}
          points={`${300 + i * 44},${90 - i * 0} ${336 + i * 44},${70} ${356 + i * 44},${81} ${320 + i * 44},${101}`}
          fill="var(--ink)"
          opacity="0.75"
        />
      ))}
      <rect x="282" y="138" width="44" height="40" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="400" y="148" width="40" height="64" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      {/* Stromspeicher mit Ladestand */}
      <rect x="540" y="128" width="74" height="84" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="566" y="120" width="22" height="9" rx="2" fill="var(--ink)" />
      <rect x="550" y="174" width="54" height="28" rx="4" fill="var(--primary)" />
      <rect x="550" y="138" width="54" height="36" rx="4" fill="none" stroke="var(--line)" strokeDasharray="4 3" />
      <text x="577" y="111" textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--ink)">
        2,5 kWh
      </text>
      <line x1="482" x2="540" y1="190" y2="190" stroke="var(--ink)" strokeWidth="2" strokeDasharray="6 4" />
      <text x="640" y="160" fontSize="17" fontWeight="700" fill="var(--ink)">
        20:00
      </text>
      <text x="640" y="182" fontSize="15" fill="var(--ink-muted)">
        −0,4 kWh/h
      </text>
    </svg>
  )
}

const THEMA: Thema = { name: 'Der Stromspeicher', farbe: 'indigo', icon: 'fa-battery-half', bild: <Titelbild /> }

/* ── Graph: Ladestand über der Zeit ─────────────────────────────────────── */

const G = { w: 680, h: 260, l: 52, r: 18, t: 14, b: 42, xMin: 0, xMax: 10, yMin: -1.5, yMax: 3 }
const gx = (x: number) => G.l + ((x - G.xMin) / (G.xMax - G.xMin)) * (G.w - G.l - G.r)
const gy = (y: number) => G.h - G.b - ((y - G.yMin) / (G.yMax - G.yMin)) * (G.h - G.t - G.b)

type Punkt = { x: number; aktuell?: boolean; treffer?: boolean }

/** Ladestand des Speichers: Gerade y = −0,4x + 2,5; punkte = Versuche; frage = Nullstelle als „?“ markieren */
function LadeGraph({ punkte = [], frage = false }: { punkte?: Punkt[]; frage?: boolean }) {
  return (
    <div className="bk-graph ls-graph ss-graph">
      <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label="Graph des Ladestands: Er fällt von 2,5 kWh um 20 Uhr gleichmäßig ab und schneidet die x-Achse.">
        <rect x={gx(G.xMin)} y={gy(0)} width={gx(G.xMax) - gx(G.xMin)} height={gy(G.yMin) - gy(0)} fill="var(--surface-sunken)" />
        {Array.from({ length: 11 }, (_, i) => i).map((v) => (
          <g key={`x${v}`}>
            <line x1={gx(v)} x2={gx(v)} y1={gy(G.yMin)} y2={gy(G.yMax)} stroke="var(--grid)" />
            {v % 2 === 0 && (
              <text x={gx(v)} y={gy(G.yMin) + 28} textAnchor="middle" fontSize="20" fill="var(--ink-muted)">
                {v}
              </text>
            )}
          </g>
        ))}
        {[-1, 1, 2, 3].map((v) => (
          <g key={`y${v}`}>
            <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--grid)" />
            <text x={gx(0) - 10} y={gy(v) + 8} textAnchor="end" fontSize="20" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        <line x1={gx(0)} x2={gx(0)} y1={gy(G.yMin)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
        <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="3" />
        <text x={gx(0.15)} y={gy(-0.85)} fontSize="18" fill="var(--ink-muted)">
          x in Stunden ab 20 Uhr
        </text>
        <text x={gx(0) + 10} y={gy(G.yMax) + 18} fontSize="18" fill="var(--ink-muted)">
          y in kWh
        </text>
        <line x1={gx(0)} y1={gy(ladung(0))} x2={gx(9)} y2={gy(ladung(9))} stroke="var(--primary)" strokeWidth="4.5" strokeLinecap="round" />
        {frage && (
          <>
            <circle cx={gx(X_LEER)} cy={gy(0)} r="9" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
            <text x={gx(X_LEER)} y={gy(0) + 40} textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--ink)">
              ?
            </text>
          </>
        )}
        {punkte.map((p, i) => (
          <circle
            key={i}
            cx={gx(p.x)}
            cy={gy(ladung(p.x))}
            r={p.aktuell ? 10 : 7}
            fill={p.treffer ? 'var(--correct)' : p.aktuell ? 'var(--primary)' : 'var(--line-strong)'}
            stroke="var(--surface)"
            strokeWidth="2.5"
          />
        ))}
      </svg>
    </div>
  )
}

/* ── Phase 2: Ausprobieren am Speicher ──────────────────────────────────── */

function Ausprobieren({ auftrag, versuche, onTesten }: { auftrag: ReactNode; versuche: number[]; onTesten: (x: number) => void }) {
  const uid = useId()
  const [eingabe, setEingabe] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const letzter = versuche[versuche.length - 1]
  const treffer = versuche.some((x) => Math.abs(x - X_LEER) < 1e-9)
  // Ausprobieren zählt wie eine Festlegung (PUNKTE.festlegung), sobald die Seite frei ist
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const frei = versuche.length >= 3 || treffer
  useEffect(() => {
    if (frei) pt.geloest()
  }, [frei, pt])

  const testen = () => {
    const p = parseInput(eingabe)
    if (!p) return setFehler('Bitte gib eine Zahl ein, z. B. 5 oder 5,5.')
    if (p.value < 0 || p.value > 10) return setFehler('Probiere eine Zahl zwischen 0 und 10 Stunden.')
    setFehler(null)
    onTesten(p.value)
  }

  const stand = letzter === undefined ? null : ladung(letzter)
  return (
    <div className="ss-labor" data-no-autocheck>
      {auftrag}
      <LadeGraph punkte={versuche.map((x, i) => ({ x, aktuell: i === versuche.length - 1, treffer: Math.abs(x - X_LEER) < 1e-9 }))} />
      <div className="ss-eingabe">
        <label htmlFor={`${uid}-x`}>
          Nach <M>x</M> =
        </label>
        <input
          id={`${uid}-x`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="?"
          className="bk-input lp-input lp-input-sm ls-gap"
          value={eingabe}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') testen()
          }}
        />
        <span>Stunden</span>
        <button type="button" className="bk-btn bk-btn-primary" onClick={testen}>
          <i className="fa-solid fa-battery-half" aria-hidden="true" /> Speicher abfragen
        </button>
      </div>
      {fehler && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> {fehler}
        </div>
      )}
      {letzter !== undefined && stand !== null && (
        <div className={`ss-anzeige ${treffer && Math.abs(letzter - X_LEER) < 1e-9 ? 'ss-anzeige-ok' : ''}`} role="status">
          <i className="fa-solid fa-battery-half" aria-hidden="true" />
          <span>
            <strong>Stromspeicher, Versuch {versuche.length}:</strong> um {uhrzeit(letzter)} (<M>{`x = ${tex(letzter)}`}</M>){' '}
            {Math.abs(stand) < 1e-9
              ? 'ist der Speicher genau leer. Treffer!'
              : stand > 0
                ? `sind noch ${kwh(stand)} im Speicher.`
                : `wäre der Ladestand ${kwh(stand)}. Der Speicher war also schon vorher leer.`}
          </span>
        </div>
      )}
      {frei && (
        <p className="sl-hinweis">
          {treffer ? 'Treffer! Bei anderen Werten klappt das Raten aber kaum.' : 'Ganz genau triffst du den Zeitpunkt durch Probieren kaum.'} Gleich lernst du, wie du ihn ausrechnest.
        </p>
      )}
    </div>
  )
}

/* ── Phase 3: Bilder und Rechenbeispiel (E-Bike-Akku) ───────────────────── */

/** Handlungsprodukt: Nachricht an Familie Demir mit kleiner Skizze des Ladestands */
function NachrichtBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg viewBox="0 0 720 190" role="img" aria-label="Ein Notizzettel mit der Überschrift Liebe Familie Demir, darunter Zeilen für die Rechnung und eine kleine Skizze einer fallenden Geraden, daneben ein Stift.">
        <rect x="150" y="14" width="420" height="168" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="150" y="14" width="420" height="40" rx="8" fill="var(--primary-soft)" />
        <line x1="150" x2="570" y1="54" y2="54" stroke="var(--primary)" strokeWidth="2" />
        <text x="172" y="42" fontSize="21" fontWeight="800" fill="var(--ink)">
          Liebe Familie Demir,
        </text>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="172" x2={i % 2 ? 380 : 420} y1={82 + i * 26} y2={82 + i * 26} stroke="var(--line-strong)" strokeWidth="2" />
        ))}
        <line x1="450" x2="450" y1="72" y2="164" stroke="var(--ink)" strokeWidth="2" />
        <line x1="450" x2="552" y1="152" y2="152" stroke="var(--ink)" strokeWidth="2" />
        <line x1="450" y1="84" x2="530" y2="152" stroke="var(--primary)" strokeWidth="3.5" />
        <circle cx="530" cy="152" r="6" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        <g transform="rotate(-35 640 120)">
          <rect x="590" y="110" width="110" height="18" rx="4" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
          <polygon points="590,110 574,119 590,128" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  )
}

const BSP_AUFGABE = (
  <p>
    Der Akku eines E-Bikes hat beim Losfahren <M>{'0{,}6'}</M> kWh. Ladestand nach <M>x</M> Stunden Fahrt: <M>{'y = -0{,}15x + 0{,}6'}</M>. Lena fährt um 9 Uhr los. Wann ist
    der Akku leer?
  </p>
)
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: <>Ansatz: <M>{'y = 0'}</M> setzen</>,
    body: (
      <>
        <p>Leer heißt: Der Ladestand ist 0. Setze den Funktionsterm gleich 0:</p>
        <MB>{'-0{,}15x + 0{,}6 = 0'}</MB>
      </>
    ),
  },
  {
    title: <>Die Zahl ohne <M>x</M> auf die andere Seite bringen</>,
    body: <MB>{'\\begin{aligned} -0{,}15x + 0{,}6 &= 0 && \\mid -0{,}6 \\\\ -0{,}15x &= -0{,}6 \\end{aligned}'}</MB>,
  },
  {
    title: <>Durch die Zahl vor <M>x</M> teilen</>,
    body: (
      <>
        <MB>{'\\begin{aligned} -0{,}15x &= -0{,}6 && \\mid :(-0{,}15) \\\\ x_N &= 4 \\end{aligned}'}</MB>
        <p>Minus durch Minus ergibt Plus.</p>
      </>
    ),
  },
  {
    title: 'Nullstelle angeben, Probe machen und deuten',
    body: (
      <>
        <MB>{'N(4 \\mid 0) \\qquad \\text{Probe: } x = 4{:}\\; y = -0{,}15 \\cdot 4 + 0{,}6 = 0 \\;\\checkmark'}</MB>
        <p>Nach 4 Stunden Fahrt ist der Akku leer. Lena ist um 9 Uhr losgefahren, also ist der Akku um 13 Uhr leer.</p>
      </>
    ),
  },
]

/** Lösungsweg für den Stromspeicher */
const LOESUNG = (
  <>
    <MB>{'\\begin{aligned} -0{,}4x + 2{,}5 &= 0 && \\mid -2{,}5 \\\\ -0{,}4x &= -2{,}5 && \\mid :(-0{,}4) \\\\ x_N &= 6{,}25 \\end{aligned}'}</MB>
    <MB>{'N(6{,}25 \\mid 0) \\qquad \\text{Probe: } x = 6{,}25{:}\\; y = -0{,}4 \\cdot 6{,}25 + 2{,}5 = 0 \\;\\checkmark'}</MB>
    <p>
      <M>{'6{,}25'}</M> Stunden sind 6 Stunden und <M>{'0{,}25 \\cdot 60 = 15'}</M> Minuten. 20 Uhr plus 6 h 15 min ergibt 2:15 Uhr.
    </p>
  </>
)

/* ── Phase 4: Wer hat recht? ─────────────────────────────────────────────── */

function Plan({ name, tex: t }: { name: string; tex: string }) {
  return (
    <div className="ss-plan">
      <div className="ss-plan-name">Rechnung von {name}</div>
      <MB>{t}</MB>
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function StromspeicherEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [versuche, setVersuche] = useState<number[]>([])
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
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 8 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title={<>a) <M>x</M> einsetzen</>}
            prompt={
              <p>
                Ein Speicher hat den Ladestand <M>{'y = -0{,}4x + 2{,}5'}</M> (in kWh). Wie viel ist nach <M>{'x = 5'}</M> Stunden noch drin?
              </p>
            }
            fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 0.5, unit: 'kWh' }]}
            solution={<MB>{'x = 5{:}\\quad y = -0{,}4 \\cdot 5 + 2{,}5 = -2 + 2{,}5 = 0{,}5'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={3}
            title="b) Gleichung lösen"
            prompt={
              <p>
                Löse die Gleichung nach <M>x</M> auf. Schreibe zu jeder Umformung dazu, was du rechnest, z. B. <M>{'\\mid -10'}</M>.
              </p>
            }
            lead={<M>{'-2x + 10 = 4 \\qquad \\Rightarrow'}</M>}
            fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 3 }]}
            solution={<MB>{'\\begin{aligned} -2x + 10 &= 4 && \\mid -10 \\\\ -2x &= -6 && \\mid :(-2) \\\\ x &= 3 \\end{aligned}'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Ziel: Am Ende steht <M>x</M> allein auf einer Seite. Was stört dich links noch?</>,
                  <>Zuerst die Zahl ohne <M>x</M> wegbringen, dann durch die Zahl vor <M>x</M> teilen.</>,
                  <>
                    <M>{'\\mid -10'}</M> ergibt <M>{'-2x = -6'}</M>. Jetzt <M>{'\\mid :(-2)'}</M>: Minus durch Minus ergibt Plus.
                  </>,
                ]}
              />
            }
          />
          <McCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Wo liegt der Punkt?"
            prompt={
              <p>
                Der Punkt <M>{'P(5 \\mid 0)'}</M> hat die y-Koordinate 0. Wo liegt er im Koordinatensystem?
              </p>
            }
            options={[
              { text: 'Auf der y-Achse.', feedback: 'Auf der y-Achse liegen Punkte mit x = 0, nicht mit y = 0.' },
              { text: 'Auf der x-Achse.', correct: true, feedback: 'Alle Punkte mit y = 0 liegen auf der x-Achse.' },
              { text: 'Im Ursprung.', feedback: 'Der Ursprung ist O(0 | 0). Hier ist aber x = 5, der Punkt liegt rechts davon.' },
              { text: 'Unterhalb der x-Achse.', feedback: 'Unterhalb der x-Achse ist y negativ. Bei y = 0 liegt der Punkt genau auf der Achse.' },
            ]}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Durch eine negative Dezimalzahl teilen"
            prompt={<p>Löse die Gleichung. Achte beim Teilen auf das Vorzeichen.</p>}
            lead={<M>{'-0{,}5x = -3 \\qquad \\Rightarrow'}</M>}
            fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 6 }]}
            solution={<MB>{'\\begin{aligned} -0{,}5x &= -3 && \\mid :(-0{,}5) \\\\ x &= 6 \\end{aligned}'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Teile beide Seiten durch die Zahl vor <M>x</M>, also durch <M>{'-0{,}5'}</M>.</>,
                  <>Minus durch Minus ergibt Plus. Das Ergebnis ist also positiv.</>,
                  <>
                    Durch <M>{'0{,}5'}</M> teilen heißt mal 2 rechnen: <M>{'3 : 0{,}5 = 6'}</M>.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={3}
            title="e) Stunden in eine Uhrzeit umrechnen"
            prompt={
              <p>
                Es ist 20 Uhr. Wie spät ist es <M>{'3{,}5'}</M> Stunden später?
              </p>
            }
            rechnung={[{ l: ['\\text{Uhrzeit}'], r: [{ luecke: 'h' }, ':', { luecke: 'min' }, '\\;\\text{Uhr}'] }]}
            fields={[
              { kind: 'num', key: 'h', label: 'Stunde', expected: 23 },
              { kind: 'num', key: 'min', label: 'Minuten', expected: 30 },
            ]}
            solution={
              <p>
                <M>{'3{,}5'}</M> Stunden sind 3 Stunden und <M>{'0{,}5 \\cdot 60 = 30'}</M> Minuten. 20 Uhr plus 3 h 30 min ergibt 23:30 Uhr.
              </p>
            }
            help={
              <Hilfen
                steps={[
                  <>Teile die Stunden in ganze Stunden und den Rest auf.</>,
                  <>
                    <M>{'0{,}5'}</M> Stunden sind eine halbe Stunde, also <M>{'0{,}5 \\cdot 60'}</M> Minuten.
                  </>,
                  <>Rechne von 20 Uhr aus 3 Stunden weiter und dann noch 30 Minuten.</>,
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Der Stromspeicher in der Nacht',
      bedingung: 'Nach drei Versuchen am Speicher geht es weiter.',
      inhalt: (fertig) => (
        <Ausprobieren
          auftrag={
            <>
              <p className="sl-text">
                Familie Demir hat eine Solaranlage mit Stromspeicher. Nach einem bewölkten Tag sind um 20 Uhr noch 2,5&nbsp;kWh im Speicher. Über Nacht verbraucht das Haus
                gleichmäßig 0,4&nbsp;kWh pro Stunde. Ist der Speicher leer, muss die Familie Strom aus dem Netz kaufen. Ab 2 Uhr nachts gilt dafür ein günstiger Nachttarif.
              </p>
              <p className="sl-text">
                Der Ladestand nach <M>x</M> Stunden ist <M>{'y = -0{,}4x + 2{,}5'}</M> (in kWh). Gesucht ist die Uhrzeit, zu der der Speicher leer ist.
              </p>
              <div className="sl-fokus">
                <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
                <p>Gib eine Stundenzahl ein und frag den Speicher ab. Schaffst du es, den Zeitpunkt zu finden, an dem er genau leer ist?</p>
              </div>
              <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 7 Minuten.</p>
            </>
          }
          versuche={versuche}
          onTesten={(x) => {
            setVersuche((alt) => [...alt, x])
            if (versuche.length + 1 >= 3 || Math.abs(x - X_LEER) < 1e-9) fertig()
          }}
        />
      ),
    },
    {
      art: 'loesen',
      titel: 'Wann ist der Stromspeicher leer?',
      pflicht: ['ergebnis', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 20 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne, wann der Stromspeicher leer ist</p>
            <p>
              Gegeben ist der Ladestand <M>{'y = -0{,}4x + 2{,}5'}</M> (<M>x</M> in Stunden ab 20 Uhr). Gesucht ist die <strong>Nullstelle</strong> <M>{'x_N'}</M>: die
              Stelle, an der der Graph die x-Achse schneidet, also <M>{'y = 0'}</M>. Berechne sie in deinem Heft, gib sie als Punkt <M>{'N(x_N \\mid 0)'}</M> an und rechne sie
              in eine Uhrzeit um.
            </p>
          </div>
          <LadeGraph frage />
          <BeispielMitVideo video={VIDEO_NULLSTELLEN} videoTitel="Lernvideo: Nullstellen berechnen">
            <div className="ss-beispiel">
              <Beispiel offen title="Wann ist der E-Bike-Akku leer?" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
            </div>
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('ergebnis')()
                setGeloest(true)
              }}
              punkte={15}
              title="Der Stromspeicher ist leer"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'xn', label: <>Nach wie vielen Stunden ist der Speicher leer? <M>{'x_N ='}</M></>, expected: X_LEER, unit: 'h' },
                { kind: 'num', key: 'h', label: 'Um wie viel Uhr ist er leer? Stunde:', expected: 2 },
                { kind: 'num', key: 'min', label: 'Minuten:', expected: 15 },
              ]}
              loesungNachFehler
              solution={LOESUNG}
              help={
                <Hilfen
                  steps={[
                    <>Leer heißt: Der Ladestand ist 0. Was bedeutet das für den Funktionsterm?</>,
                    <>
                      Setze den Term gleich 0: <M>{'-0{,}4x + 2{,}5 = 0'}</M>. Bringe dann die Zahl ohne <M>x</M> auf die andere Seite und teile durch die Zahl vor <M>x</M>.
                    </>,
                    <>
                      <M>{'\\mid -2{,}5'}</M> ergibt <M>{'-0{,}4x = -2{,}5'}</M>. Teile durch <M>{'-0{,}4'}</M>. Für die Uhrzeit: <M>{'0{,}25'}</M> Stunden sind
                      15 Minuten.
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
              title="Teurer Strom in dieser Nacht?"
              prompt={
                <p>
                  Vor 2 Uhr ist Strom aus dem Netz teuer, ab 2 Uhr gilt der günstige Nachttarif. Muss Familie Demir in dieser Nacht teuren Strom kaufen? Entscheide mit deinem
                  Ergebnis.
                </p>
              }
              options={[
                {
                  text: 'Ja, ab 2:15 Uhr kauft sie teuren Strom.',
                  feedback: 'Ab 2:15 Uhr kauft sie zwar Strom aus dem Netz, aber ab 2 Uhr gilt schon der günstige Nachttarif.',
                },
                {
                  text: 'Ja, denn der Speicher ist schon um 22:30 Uhr leer.',
                  feedback: 'Hier wurde 2,5 kWh als 2,5 Stunden gelesen. Der Startwert t ist der Ladestand, nicht die Zeit bis zum Leerwerden.',
                },
                {
                  text: 'Nein: Der Speicher reicht bis 2:15 Uhr, danach gilt schon der Nachttarif.',
                  correct: true,
                  feedback: 'Genau, knapp, aber es reicht: Der Speicher ist erst eine Viertelstunde nach Beginn des Nachttarifs leer.',
                },
                {
                  text: 'Nein, der Speicher wird in dieser Nacht gar nicht leer.',
                  feedback: 'Die Gerade fällt und schneidet die x-Achse bei x = 6,25. Der Speicher wird also leer, nur eben erst um 2:15 Uhr.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Nachricht an Familie Demir">
            <NachrichtBild />
            <p className="sl-text">
              Familie Demir möchte wissen, ab wann sie in dieser Nacht Strom aus dem Netz kaufen muss. Schreibe ihr in deinem Heft eine kurze Nachricht mit deiner Rechnung, einer
              Skizze des Ladestands und der Uhrzeit.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Liebe Familie Demir, euer Speicher ist leer, wenn der Ladestand …“</li>
                <li>„Deshalb setze ich den Term gleich 0: …“</li>
                <li>„Die Nullstelle ist … Das bedeutet: Nach … Stunden, also um … Uhr, …“</li>
                <li>„In der Skizze seht ihr: Der Graph schneidet die x-Achse bei …“</li>
                <li>„Teuren Strom müsst ihr …, weil der Nachttarif um 2 Uhr beginnt.“</li>
                <li>
                  „Abkürzungen: <M>{'x_N'}</M> = …, <M>N</M> = …, <M>m</M> = …, <M>t</M> = …“
                </li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Nachricht vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                <>Ein Satz, warum man den Term gleich 0 setzt (leer heißt <M>{'y = 0'}</M>)</>,
                <>Die Rechnung mit allen Umformungen wie <M>{'\\mid -2{,}5'}</M> und <M>{'\\mid :(-0{,}4)'}</M>, dazu die Probe</>,
                'Eine Skizze des Graphen mit beschrifteten Achsen, in der die Nullstelle N markiert ist',
                'Ein Antwortsatz mit der Uhrzeit, zu der der Speicher leer ist',
                <>
                  In deiner Nachricht steht, wofür die Abkürzungen stehen: <M>{'x_N'}</M> (Nullstelle), <M>{'N(x_N \\mid 0)'}</M> (Schnittpunkt mit der x-Achse), <M>m</M>{' '}
                  (Steigung, hier der Verbrauch pro Stunde) und <M>t</M> (y-Achsenabschnitt, hier der Ladestand um 20 Uhr). Außerdem erklärst du den Begriff „Nullstelle“ und
                  alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug versuche={versuche} />
              <Merke title="Nullstelle einer linearen Funktion">
                <p>
                  Die <strong>Nullstelle</strong> <M>{'x_N'}</M> ist die Stelle, an der der Graph die x-Achse schneidet. Dort gilt <M>{'y = 0'}</M>, der Punkt heißt{' '}
                  <M>{'N(x_N \\mid 0)'}</M>.
                </p>
                <ol className="zk-liste" style={{ listStyleType: 'decimal' }}>
                  <li>
                    Funktionsterm gleich 0 setzen: <M>{'mx + t = 0'}</M>
                  </li>
                  <li>
                    Nach <M>x</M> auflösen: erst <M>t</M> abziehen, dann durch <M>m</M> teilen. Bei negativem <M>m</M> auf das Vorzeichen achten.
                  </li>
                  <li>
                    Nullstelle als Punkt angeben und in der Situation deuten: <M>{'N(6{,}25 \\mid 0)'}</M>, der Speicher ist um 2:15 Uhr leer.
                  </li>
                </ol>
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
          <Abschnitt titel="Übung 1: Was bedeutet die Nullstelle?">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Nullstellen-Einstieg: Bedeutung (Basis)"
              title="Übung 1"
              level="basis"
              prompt={
                <p>
                  Für den Ladestand eines Speichers gilt <M>{'N(5 \\mid 0)'}</M>. Was bedeutet das?
                </p>
              }
              options={[
                { text: 'Nach 5 Stunden sind noch 5 kWh im Speicher.', feedback: 'Bei N(5 | 0) ist der y-Wert 0. Es ist also nichts mehr im Speicher.' },
                { text: 'Am Anfang sind 5 kWh im Speicher.', feedback: 'Der Anfangswert ist der y-Achsenabschnitt t. Die Nullstelle liegt auf der x-Achse, dort ist y = 0.' },
                { text: 'Nach 5 Stunden ist der Speicher leer.', correct: true, feedback: 'N(5 | 0): Bei x = 5 Stunden ist der Ladestand y = 0.' },
                { text: 'Der Speicher verliert 5 kWh pro Stunde.', feedback: 'Wie viel pro Stunde verloren geht, sagt die Steigung m, nicht die Nullstelle.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Welche Nullstelle stimmt?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={5}
              topic="Nullstellen-Einstieg: Berechnen (Standard)"
              title="Übung 2"
              rechnen
              level="standard"
              prompt={
                <p>
                  Gerade: <M>{'y = -3x + 12'}</M>. Berechne die Nullstelle und wähle die richtige Antwort.
                </p>
              }
              options={[
                { text: <M>{'x_N = -4'}</M>, feedback: 'Vorzeichenfehler: Aus −3x + 12 = 0 folgt −3x = −12, also x = (−12) : (−3) = 4.' },
                { text: <M>{'x_N = 12'}</M>, feedback: 'Die 12 ist der y-Achsenabschnitt t, nicht die Nullstelle. Setze den Term gleich 0 und löse nach x auf.' },
                { text: <M>{'N(0 \\mid 4)'}</M>, feedback: 'Die Zahl stimmt, aber die Koordinaten sind vertauscht. Die Nullstelle liegt auf der x-Achse: N(4 | 0).' },
                { text: <M>{'N(4 \\mid 0)'}</M>, correct: true, feedback: '−3x + 12 = 0 ergibt −3x = −12, also x = 4. Probe: y = −12 + 12 = 0.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={5}
              topic="Nullstellen-Einstieg: Fehler beim Umformen (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <>
                  <p>
                    Zwei Azubis berechnen die Nullstelle der Geraden <M>{'y = 0{,}5x + 3'}</M>. Wer hat recht?
                  </p>
                  <div className="ss-plaene">
                    <Plan name="Leon" tex={'\\begin{aligned} 0{,}5x + 3 &= 0 && \\mid -3 \\\\ 0{,}5x &= 3 && \\mid :0{,}5 \\\\ x_N &= 6 \\end{aligned}'} />
                    <Plan name="Mia" tex={'\\begin{aligned} 0{,}5x + 3 &= 0 && \\mid -3 \\\\ 0{,}5x &= -3 && \\mid :0{,}5 \\\\ x_N &= -6 \\end{aligned}'} />
                  </div>
                </>
              }
              options={[
                { text: 'Leon, denn eine Nullstelle ist immer positiv.', feedback: 'Nullstellen können auch negativ sein. Prüfe Leons zweite Zeile: Was ergibt 0 − 3?' },
                {
                  text: 'Mia. Leon hat beim Abziehen von 3 das Minus vergessen.',
                  correct: true,
                  feedback: '0 − 3 = −3, also 0,5x = −3 und x = −6. Probe: y = 0,5 · (−6) + 3 = 0. Die Gerade steigt und schneidet die x-Achse links vom Ursprung.',
                },
                { text: 'Beide, eine Gerade hat zwei Nullstellen.', feedback: 'Eine steigende oder fallende Gerade schneidet die x-Achse genau einmal. Einer der beiden hat sich verrechnet.' },
                { text: 'Keiner, die Nullstelle ist x = 3.', feedback: 'Die 3 ist der y-Achsenabschnitt t. Setze x = 3 ein: y = 1,5 + 3 = 4,5, nicht 0.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Reicht es bis 6 Uhr?">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              topic="Nullstellen-Einstieg: Umgekehrt (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Familie Demir möchte, dass der Speicher bis 6 Uhr morgens reicht, also <M>{'x_N = 10'}</M>. Der Verbrauch bleibt bei 0,4&nbsp;kWh pro Stunde:{' '}
                  <M>{'y = -0{,}4x + t'}</M>. Wie viel muss um 20 Uhr mindestens im Speicher sein?
                </p>
              }
              fields={[{ kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 4, unit: 'kWh' }]}
              solution={
                <>
                  <p>
                    Bei <M>{'x = 10'}</M> muss <M>{'y = 0'}</M> sein:
                  </p>
                  <MB>{'\\begin{aligned} -0{,}4 \\cdot 10 + t &= 0 \\\\ -4 + t &= 0 && \\mid +4 \\\\ t &= 4 \\end{aligned}'}</MB>
                  <p>Um 20 Uhr müssen mindestens 4 kWh im Speicher sein.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Diesmal kennst du die Nullstelle schon: <M>{'x_N = 10'}</M>. Welcher y-Wert gehört dazu?</>,
                    <>
                      Setze <M>{'x = 10'}</M> ein und den Term gleich 0. Unbekannt ist jetzt <M>t</M>.
                    </>,
                    <>
                      <M>{'-0{,}4 \\cdot 10 + t = 0'}</M>, also <M>{'-4 + t = 0'}</M>. Jetzt nach <M>t</M> auflösen.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Wird der Speicher überhaupt leer?">
            <McCard
              title="Übung 5"
              punkte={8}
              profi
              level="erweiterung"
              prompt={
                <p>
                  In einer Sommernacht läuft im Haus nur der Kühlschrank, und der Speicher wird zusätzlich von einem kleinen Windrad gleich schnell nachgeladen. Der Ladestand
                  bleibt die ganze Nacht bei <M>{'y = 3'}</M>. Wo liegt die Nullstelle?
                </p>
              }
              options={[
                { text: <M>{'N(3 \\mid 0)'}</M>, feedback: 'Setze x = 3 ein: y ist auch dort 3, nicht 0. Die 3 ist der y-Achsenabschnitt.' },
                { text: <M>{'N(0 \\mid 3)'}</M>, feedback: 'Das ist der Schnittpunkt mit der y-Achse. Eine Nullstelle hat immer den y-Wert 0.' },
                {
                  text: 'Es gibt keine: Die Gerade verläuft parallel zur x-Achse.',
                  correct: true,
                  feedback: 'Gleich 0 setzen ergibt 3 = 0. Das stimmt nie: Die Gerade hat die Steigung 0 und schneidet die x-Achse nicht. Der Speicher wird nicht leer.',
                },
                { text: <M>{'x_N = 0'}</M>, feedback: 'Bei x = 0 ist y = 3, nicht 0. Gleich 0 setzen ergibt 3 = 0, und das stimmt nie.' },
              ]}
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Akku-Countdown">
            <AkkuCountdown />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>Du kannst jetzt die Nullstelle einer linearen Funktion berechnen und in einer Situation deuten. In den Übungsaufgaben trainierst du das Verfahren weiter, auch mit Dezimalzahlen.</p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Nullstellen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell title="Nullstellen: Der Stromspeicher" width="wide" kompakt parent={{ to: '/lineare_funktionen/nullstellen', label: 'Nullstellen berechnen' }}>
        <SeitenLernsituation
          ruhig
          punkte
          thema={THEMA}
          ziel={<>In dieser Lernsituation lernst du, wie du die Nullstelle einer linearen Funktion berechnest und was sie in einer Situation bedeutet.</>}
          seiten={seiten}
        />
      </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Versuche am Speicher aus Phase 2 */
function Rueckbezug({ versuche }: { versuche: number[] }) {
  const treffer = versuche.some((x) => Math.abs(x - X_LEER) < 1e-9)
  const naechster = versuche.length ? versuche.reduce((a, b) => (Math.abs(b - X_LEER) < Math.abs(a - X_LEER) ? b : a)) : null
  return (
    <div className="ls-back">
      <p>
        {naechster === null ? (
          <>Du hast in Phase 2 den Speicher nicht abgefragt.</>
        ) : treffer ? (
          <>
            <strong>Du hast in Phase 2 den Zeitpunkt getroffen.</strong> Mit Rechnen klappt das jedes Mal, auch bei krummen Zahlen.
          </>
        ) : (
          <>
            <strong>Du hast den Speicher {versuche.length}-mal abgefragt.</strong> Am nächsten warst du mit {fmt(naechster, 2)} Stunden ({uhrzeit(naechster)}). Genau leer ist er
            nach 6,25 Stunden, also um 2:15 Uhr.
          </>
        )}
      </p>
    </div>
  )
}
