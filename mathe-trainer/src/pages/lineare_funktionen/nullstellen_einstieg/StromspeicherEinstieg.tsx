import { useId, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, McCard, SchrittHilfen, TrackedCheck, TrackedMc } from '../lernsituation_kit/kit'
import { SeitenLernsituation, type Seite, type Thema } from '../lernsituation_kit/seiten'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './stromspeicher.css'

// Lernsituation „Der Stromspeicher“: Nullstellen linearer Funktionen (ca. 45 min).
// Format Experimentierlabor: Die SuS probieren Uhrzeiten aus und beobachten den Ladestand des Speichers. Den genauen Zeitpunkt,
// an dem der Speicher leer ist (2:15 Uhr), treffen sie durch Probieren kaum. Danach: Aufgabe → Rechenbeispiel (E-Bike-Akku) →
// eigene Rechnung. Lernprodukt digital: eine eigene Speicher-Aufgabe erstellen und mit einer Partnerin oder einem Partner tauschen.
// Identität: Themenfarbe Indigo (Nacht), Symbol Batterie, Titelbild Haus mit Solaranlage bei Nacht, Leitobjekt der Stromspeicher.
// Kontext Gesellschaft und Umwelt (Energie). Versuche bleiben nur im Seitenzustand.
// Ruhiges Grunddesign: eine Spalte, pro Seite ist nur der Auftrag hervorgehoben. Nach unten scrollen ist erlaubt, seitlich nie.

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
      {(versuche.length >= 3 || treffer) && (
        <p className="sl-hinweis">
          {treffer ? 'Treffer! Bei anderen Werten klappt das Raten aber kaum.' : 'Ganz genau triffst du den Zeitpunkt durch Probieren kaum.'} Gleich lernst du, wie du ihn ausrechnest.
        </p>
      )}
    </div>
  )
}

/* ── Phase 3: Rechenbeispiel (E-Bike-Akku) ──────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Der Akku eines E-Bikes hat beim Losfahren <M>{'0{,}6'}</M> kWh. Ladestand nach <M>x</M> Stunden Fahrt: <M>{'y = -0{,}15x + 0{,}6'}</M>. Wann ist der Akku leer?
  </p>
)
const BSP_SCHRITTE = [
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
    title: 'Nullstelle angeben und deuten',
    body: (
      <>
        <MB>{'N(4 \\mid 0)'}</MB>
        <p>
          Nach 4 Stunden Fahrt ist der Akku leer. Probe mit <M>{'x = 4'}</M>: <M>{'y = -0{,}15 \\cdot 4 + 0{,}6 = 0'}</M> ✓
        </p>
      </>
    ),
  },
]

/* ── Phase 4: Lernprodukt ───────────────────────────────────────────────── */

/** Eigene Speicher-Aufgabe erstellen: Startwert und Verbrauch wählen, Nullstelle selbst berechnen, dann mit Partner tauschen */
function EigeneAufgabe({ onFertig }: { onFertig: () => void }) {
  const uid = useId()
  const [w, setW] = useState({ start: '', verbrauch: '', x: '' })
  const [status, setStatus] = useState<'idle' | 'ok' | 'falsch' | 'leer'>('idle')
  const [haken, setHaken] = useState([false, false])
  const s = parseInput(w.start)
  const v = parseInput(w.verbrauch)
  const loesung = s && v && v.value > 0 ? s.value / v.value : null

  const pruefen = () => {
    const x = parseInput(w.x)
    if (!s || !v || !x || s.value <= 0 || v.value <= 0) return setStatus('leer')
    const ok = Math.abs(x.value - s.value / v.value) < 0.01
    setStatus(ok ? 'ok' : 'falsch')
    if (ok && haken.every(Boolean)) onFertig()
  }
  const feld = (k: 'start' | 'verbrauch' | 'x', label: ReactNode, einheit: string) => (
    <label className="ss-feld" htmlFor={`${uid}-${k}`}>
      <span>{label}</span>
      <input
        id={`${uid}-${k}`}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className={`bk-input lp-input lp-input-sm`}
        value={w[k]}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setW({ ...w, [k]: e.target.value })
          setStatus('idle')
        }}
      />
      <span>{einheit}</span>
    </label>
  )
  return (
    <div className="ss-produkt" data-no-autocheck>
      <div className="sl-fokus">
        <p className="sl-fokus-titel">Erfinde eine Speicher-Aufgabe für deine Partnerin oder deinen Partner</p>
        <p>Wähle einen Ladestand um 20 Uhr und einen Verbrauch pro Stunde. Berechne im Heft, wann dein Speicher leer ist, und lass es hier prüfen.</p>
      </div>
      <div className="ss-felder">
        {feld('start', 'Ladestand um 20 Uhr', 'kWh')}
        {feld('verbrauch', 'Verbrauch pro Stunde', 'kWh')}
        {feld('x', <>Leer nach <M>{'x_N'}</M> =</>, 'Stunden')}
        <button type="button" className="bk-btn bk-btn-primary" onClick={pruefen}>
          Prüfen
        </button>
      </div>
      {status === 'leer' && <p className="sl-hinweis">Trage drei positive Zahlen ein.</p>}
      {status === 'falsch' && loesung !== null && (
        <div className="bk-feedback bk-feedback-no lp-feedback" role="status">
          <span>
          Das passt noch nicht. Stelle die Gleichung <M>{`y = -${tex(v!.value)}x + ${tex(s!.value)}`}</M> auf und setze sie gleich 0.
          </span>
        </div>
      )}
      {status === 'ok' && loesung !== null && (
        <div className="bk-feedback bk-feedback-ok lp-feedback" role="status">
          <i className="fa-solid fa-circle-check" aria-hidden="true" /> Stimmt: Dein Speicher ist um {uhrzeit(loesung)} leer. Schreib die Aufgabe ohne Lösung auf und tausche sie.
        </div>
      )}
      <div className="ls-criteria">
        {['Aufgabe mit Funktionsgleichung im Heft notiert, Lösung auf der Rückseite', 'Aufgabe mit Partnerin oder Partner getauscht und die Lösungen verglichen'].map((c, i) => (
          <label key={c}>
            <input
              type="checkbox"
              checked={haken[i]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const neu = haken.map((h, j) => (j === i ? e.target.checked : h))
                setHaken(neu)
                if (status === 'ok' && neu.every(Boolean)) onFertig()
              }}
            />{' '}
            <span>{c}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function StromspeicherEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [versuche, setVersuche] = useState<number[]>([])

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen 1: Ladestand berechnen',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="a) y-Wert berechnen"
          prompt={
            <p>
              Ein Speicher hat den Ladestand <M>{'y = -0{,}4x + 2{,}5'}</M>. Wie viel ist nach <M>{'x = 5'}</M> Stunden noch drin?
            </p>
          }
          fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 0.5 }]}
          solution={<MB>{'x = 5: \\quad y = -0{,}4 \\cdot 5 + 2{,}5 = -2 + 2{,}5 = 0{,}5'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 2: Gleichung lösen',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="b) Gleichung lösen"
          prompt={<p>Löse die Gleichung nach <M>x</M> auf.</p>}
          lead={<M>{'-2x + 10 = 4 \\qquad \\Rightarrow'}</M>}
          fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 3 }]}
          solution={<MB>{'\\begin{aligned} -2x + 10 &= 4 && \\mid -10 \\\\ -2x &= -6 && \\mid :(-2) \\\\ x &= 3 \\end{aligned}'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: <>Aufwärmen 3: Punkte mit <M>{'y = 0'}</M></>,
      inhalt: (fertig) => (
        <McCard
          onSolved={fertig}
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
      ),
    },
    {
      art: 'problem',
      titel: 'Der Stromspeicher in der Nacht',
      bedingung: 'Nach drei Versuchen geht es weiter.',
      inhalt: (fertig) => (
        <Ausprobieren
          auftrag={
            <>
              <p className="sl-text">
                Familie Demir hat eine Solaranlage mit Stromspeicher. Nach einem bewölkten Tag sind um 20 Uhr noch 2,5&nbsp;kWh im Speicher. Über Nacht verbraucht das Haus
                gleichmäßig 0,4&nbsp;kWh pro Stunde.
              </p>
              <p className="sl-text">
                Der Ladestand nach <M>x</M> Stunden ist <M>{'y = -0{,}4x + 2{,}5'}</M> (in kWh). Gesucht ist die Uhrzeit, zu der der Speicher leer ist.
              </p>
              <div className="sl-fokus">
                <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
                <p>Gib eine Stundenzahl ein und frag den Speicher ab. Wann ist er genau leer?</p>
              </div>
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
      titel: 'Deine Aufgabe',
      frei: true,
      inhalt: () => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Berechne, wann der Speicher leer ist</p>
            <p>
              Gegeben ist der Ladestand <M>{'y = -0{,}4x + 2{,}5'}</M>. Gesucht ist die <strong>Nullstelle</strong> <M>{'x_N'}</M>: die Stelle, an der der Graph die x-Achse
              schneidet, also <M>{'y = 0'}</M>. Gib sie als Punkt <M>{'N(x_N \\mid 0)'}</M> und als Uhrzeit an.
            </p>
          </div>
          <div className="ss-bild-klein">
            <LadeGraph frage />
          </div>
          <p className="sl-hinweis">Wie das geht, siehst du auf der nächsten Seite an einem Rechenbeispiel. Danach rechnest du selbst.</p>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: "So geht's: Rechenbeispiel (Schritte 1 und 2)",
      frei: true,
      inhalt: () => <Beispiel offen title="Wann ist der E-Bike-Akku leer?" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE.slice(0, 2)} />,
    },
    {
      art: 'loesen',
      titel: "So geht's: Rechenbeispiel (Schritte 3 und 4)",
      frei: true,
      inhalt: () => (
        <>
          <Beispiel offen title="Fortsetzung: E-Bike-Akku" aufgabe={<p>Aus Schritt 2 kennst du schon <M>{'-0{,}15x = -0{,}6'}</M>.</p>} steps={BSP_SCHRITTE.slice(2)} ab={3} />
          <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Jetzt du: Wann ist der Stromspeicher leer?',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Nullstelle berechnen"
          prompt={
            <p>
              Ladestand: <M>{'y = -0{,}4x + 2{,}5'}</M>. Rechne in den Schritten des Rechenbeispiels und fülle die Lücken aus.
            </p>
          }
          rechnung={[
            { l: ['-0{,}4x + 2{,}5'], r: ['0'], u: '\\text{① } y = 0 \\quad \\mid -2{,}5' },
            { l: ['-0{,}4x'], r: [{ luecke: 'rechts' }], u: '\\text{②} \\quad \\mid :(-0{,}4)' },
            { l: ['x_N'], r: [{ luecke: 'xn' }], u: '\\text{③ Nullstelle}' },
            { l: ['N'], r: ['(', { luecke: 'n1' }, '\\mid', { luecke: 'n2' }, ')'], u: '\\text{④ Punkt}' },
            { l: ['\\text{Uhrzeit}'], r: [{ luecke: 'h' }, ':', { luecke: 'min' }, '\\;\\text{Uhr}'], u: '\\text{⑤ Uhrzeit}' },
          ]}
          fields={[
            { kind: 'num', key: 'rechts', label: 'rechte Seite', expected: -2.5 },
            { kind: 'num', key: 'xn', label: 'Nullstelle', expected: X_LEER },
            { kind: 'num', key: 'n1', label: 'x-Koordinate von N', expected: X_LEER },
            { kind: 'num', key: 'n2', label: 'y-Koordinate von N', expected: 0 },
            { kind: 'num', key: 'h', label: 'Stunde', expected: 2 },
            { kind: 'num', key: 'min', label: 'Minuten', expected: 15 },
          ]}
          solution={
            <>
              <MB>{'\\begin{aligned} -0{,}4x + 2{,}5 &= 0 && \\mid -2{,}5 \\\\ -0{,}4x &= -2{,}5 && \\mid :(-0{,}4) \\\\ x_N &= 6{,}25 \\end{aligned}'}</MB>
              <p>
                <M>{'N(6{,}25 \\mid 0)'}</M>. 6,25 Stunden sind 6 Stunden und 15 Minuten. 20 Uhr plus 6 h 15 min ergibt 2:15 Uhr.
              </p>
            </>
          }
          help={
            <SchrittHilfen
              schritte={[
                {
                  kurz: '①',
                  titel: <>Gleich 0 setzen und <M>{'2{,}5'}</M> abziehen</>,
                  hilfe: (
                    <>
                      Leer heißt <M>{'y = 0'}</M>. Ziehe auf beiden Seiten <M>{'2{,}5'}</M> ab. Rechts steht dann <M>{'0 - 2{,}5'}</M>.
                    </>
                  ),
                },
                {
                  kurz: '②',
                  titel: <>Durch <M>{'-0{,}4'}</M> teilen</>,
                  hilfe: (
                    <>
                      Teile <M>{'-2{,}5'}</M> durch <M>{'-0{,}4'}</M>. Minus durch Minus ergibt Plus. Tipp: <M>{'2{,}5 : 0{,}4 = 25 : 4'}</M>.
                    </>
                  ),
                },
                {
                  kurz: '③',
                  titel: 'Nullstelle',
                  hilfe: <>Das Ergebnis aus Schritt ② ist die Nullstelle <M>{'x_N'}</M>. Sie muss positiv sein, denn der Speicher wird erst nach 20 Uhr leer.</>,
                },
                {
                  kurz: '④',
                  titel: 'Punkt N',
                  hilfe: (
                    <>
                      Eine Nullstelle liegt auf der x-Achse. Vorne steht <M>{'x_N'}</M>, hinten der y-Wert, und der ist auf der x-Achse immer 0.
                    </>
                  ),
                },
                {
                  kurz: '⑤',
                  titel: 'Uhrzeit',
                  hilfe: (
                    <>
                      <M>{'0{,}25'}</M> Stunden sind 15 Minuten. Zähle von 20 Uhr aus 6 Stunden weiter (über Mitternacht) und dann noch 15 Minuten.
                    </>
                  ),
                },
              ]}
            />
          }
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Das hältst du fest',
      frei: true,
      inhalt: () => (
        <>
          <Rueckbezug versuche={versuche} />
          <Merke title="Nullstelle einer linearen Funktion">
            <p>
              Die <strong>Nullstelle</strong> <M>{'x_N'}</M> ist die Stelle, an der der Graph die x-Achse schneidet. Dort gilt <M>{'y = 0'}</M>, der Punkt heißt{' '}
              <M>{'N(x_N \\mid 0)'}</M>.
            </p>
            <ol>
              <li>
                Funktionsterm gleich 0 setzen: <M>{'mx + t = 0'}</M>
              </li>
              <li>
                Nach <M>x</M> auflösen: erst <M>t</M> abziehen, dann durch <M>m</M> teilen.
              </li>
              <li>Nullstelle als Punkt angeben und in der Situation deuten.</li>
            </ol>
          </Merke>
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Deine eigene Speicher-Aufgabe (Lernprodukt, Partnerarbeit)',
      bedingung: 'Aufgabe prüfen lassen und beide Punkte abhaken.',
      inhalt: (fertig) => <EigeneAufgabe onFertig={fertig} />,
    },
    {
      art: 'sichern',
      titel: 'Check 1: Was bedeutet die Nullstelle?',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Nullstellen-Einstieg: Bedeutung (Basis)"
          title="Check 1"
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
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 2: Nullstelle berechnen',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Nullstellen-Einstieg: Berechnen (Standard)"
          title="Check 2"
          rechnen
          level="standard"
          prompt={
            <>
              <p>Berechne die Nullstelle der Geraden. Wähle dann die richtige Antwort.</p>
              <MB>{'y = -3x + 12'}</MB>
            </>
          }
          options={[
            { text: <M>{'x_N = -4'}</M>, feedback: 'Vorzeichenfehler: Aus −3x + 12 = 0 folgt −3x = −12, also x = (−12) : (−3) = 4.' },
            { text: <M>{'x_N = 12'}</M>, feedback: 'Die 12 ist der y-Achsenabschnitt t, nicht die Nullstelle. Setze den Term gleich 0 und löse nach x auf.' },
            { text: <M>{'N(0 \\mid 4)'}</M>, feedback: 'Die Zahl stimmt, aber die Koordinaten sind vertauscht. Die Nullstelle liegt auf der x-Achse: N(4 | 0).' },
            { text: <M>{'N(4 \\mid 0)'}</M>, correct: true, feedback: '−3x + 12 = 0 ergibt −3x = −12, also x = 4. Probe: y = −12 + 12 = 0.' },
          ]}
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 3: Reicht es bis 6 Uhr?',
      inhalt: (fertig) => (
        <TrackedCheck
          onSolved={fertig}
          topic="Nullstellen-Einstieg: Umgekehrt (Erweiterung)"
          title="Check 3"
          level="erweiterung"
          prompt={
            <p>
              Familie Demir möchte, dass der Speicher bis 6 Uhr morgens reicht, also <M>{'x_N = 10'}</M>. Der Verbrauch bleibt bei 0,4&nbsp;kWh pro Stunde:{' '}
              <M>{'y = -0{,}4x + t'}</M>. Wie viel muss um 20 Uhr mindestens im Speicher sein?
            </p>
          }
          fields={[{ kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 4 }]}
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
      ),
    },
    {
      art: 'sichern',
      titel: 'Geschafft!',
      frei: true,
      inhalt: () => (
        <div className="sl-ende">
          <p>Du kannst jetzt die Nullstelle einer linearen Funktion berechnen und in einer Situation deuten. Übe das Verfahren mit weiteren Aufgaben.</p>
          <div className="bk-actions">
            <button type="button" className="bk-btn" onClick={onBack}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
            </button>
            <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
              Weiter üben: Nullstellen (Einfach) <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell title="Nullstellen: Der Stromspeicher" width="wide" kompakt parent={{ to: '/lineare_funktionen/nullstellen', label: 'Nullstellen berechnen' }}>
        <SeitenLernsituation
          ruhig
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
