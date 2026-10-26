import { useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, McCard, SchrittHilfen, TrackedCheck, TrackedMc } from '../lernsituation_kit/kit'
import { SeitenLernsituation, ZweiSpalten, type Seite } from '../lernsituation_kit/seiten'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './drohne.css'

// Lernsituation „Drohnen-Parcours“ zur Punktprobe: Liegt ein Punkt auf einer Geraden? (45 min)
// Format Rätsel / Escape-Room (Stationen öffnen den Code für das Hangar-Tor), Look Levelmap mit Code-Schloss, Lernprodukt handschriftliche Merkkarte (analog).
// Instruktionsreihenfolge: Problem zuerst. Die SuS können Wertetabellen und Geraden zeichnen und kennen y = mx + t. Neu ist die rechnerische Punktprobe.
// Problem erkennen: Auftrag und Festlegung auf einer Seite (Ampel je Ring: trifft / trifft nicht / unsicher). Ring C liegt nur 0,2 m neben der Flugbahn und ist im Graphen nicht eindeutig.
// Problem lösen: Rechenbeispiel (Ring A), Station 1 (Ring B, geführte Lückenrechnung), Station 2 (Ring D, freies Rechnen), Station 3 (Ring C, freies Rechnen, Aha: sieht nach Treffer aus, ist aber daneben).
// Festhalten und Prüfen: Rückbezug auf die Ampel, Merke, handschriftliche Merkkarte, drei Checks (Check 1 mit typischen Fehlern als Antwortoptionen).
// Die Festlegung bleibt nur im Seitenzustand (kein Speichern).

/* ── Situation ───────────────────────────────────────────────────────────── */

// Flugbahn der Drohne: y = 0,5x + 2 (x = Entfernung in m, y = Höhe in m). Ringe mit Mittelpunkt (x | y).
const bahn = (x: number) => 0.5 * x + 2

type RingId = 'A' | 'B' | 'C' | 'D'
type Ring = { id: RingId; x: number; y: number }
const RINGE: Ring[] = [
  { id: 'A', x: 2, y: 3 },
  { id: 'B', x: 5, y: 4.5 },
  { id: 'C', x: 6, y: 5.2 },
  { id: 'D', x: 8, y: 7 },
]
const trifft = (r: Ring) => Math.abs(bahn(r.x) - r.y) < 1e-9
const komma = (v: number) => String(v).replace('.', ',')

type Tipp = 'ja' | 'nein' | 'unsicher'
type Tipps = Partial<Record<RingId, Tipp>>
const TIPP_TEXT: Record<Tipp, string> = { ja: 'Trifft', nein: 'Trifft nicht', unsicher: 'Unsicher' }

/* ── Sachbild: Flugbahn und Ringe ────────────────────────────────────────── */

const S = { w: 640, h: 330, l: 44, r: 14, t: 12, b: 36, xMin: -0.5, xMax: 13.5, yMin: -0.5, yMax: 9.5 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)

/** ringe: welche Ringe gezeichnet werden */
function DrohnenBild({
  ringe = RINGE,
  fokus,
  rechenpunkt,
  linie = { m: 0.5, t: 2 },
  hoehe,
}: {
  ringe?: { id: string; x: number; y: number }[]
  /** Ring der aktuellen Station: hervorgehoben, mit senkrechter Hilfslinie bei seinem x-Wert */
  fokus?: string
  /** Flugbahn y = m·x + t (Standard: y = 0,5x + 2) */
  linie?: { m: number; t: number }
  /** gestrichelte Höhe für einen Ring, dessen x-Wert noch gesucht ist */
  hoehe?: { y: number; name: string }
  /** Ergebnis der Rechnung: der Punkt der Flugbahn bei x (erscheint erst nach dem Lösen) */
  rechenpunkt?: { x: number; y: number }
}) {
  const f = ringe.find((r) => r.id === fokus)
  const lf = (x: number) => linie.m * x + linie.t
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label="Koordinatensystem mit der geraden Flugbahn einer Drohne und mehreren Leuchtringen">
        {Array.from({ length: 14 }, (_, i) => i).map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(0)} y2={by(S.yMax)} stroke="var(--grid)" />
            {v % 2 === 0 && (
              <text x={bx(v)} y={by(0) + 22} textAnchor="middle" fontSize="16" fill="var(--ink-muted)">
                {v}
              </text>
            )}
          </g>
        ))}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            <text x={bx(0) - 8} y={by(v) + 5} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="2.5" />
        <line x1={bx(0)} x2={bx(0)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
        <text x={bx(S.xMax) - 4} y={by(0) - 8} textAnchor="end" fontSize="14" fill="var(--ink-muted)">
          Entfernung x (m)
        </text>
        <text x={bx(0) + 8} y={by(S.yMax) + 14} fontSize="14" fill="var(--ink-muted)">
          Höhe y (m)
        </text>
        <line x1={bx(0)} y1={by(lf(0))} x2={bx(13)} y2={by(lf(13))} stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
        <text x={bx(linie.m < 0 ? 2.5 : 9.6)} y={by(lf(linie.m < 0 ? 2.5 : 9.6)) + (linie.m < 0 ? -12 : 28)} fontSize="16" fontWeight="700" fill="var(--primary)">
          Flugbahn
        </text>
        <circle cx={bx(0)} cy={by(lf(0))} r="6" fill="var(--primary)" />
        {linie.m > 0 && (
          <text x={bx(0) + 10} y={by(lf(0)) + 20} fontSize="14" fill="var(--ink-muted)">
            Start
          </text>
        )}
        {hoehe && (
          <>
            <line x1={bx(0)} x2={bx(S.xMax)} y1={by(hoehe.y)} y2={by(hoehe.y)} stroke="var(--ink-muted)" strokeDasharray="6 5" />
            <text x={bx(S.xMax) - 4} y={by(hoehe.y) - 6} textAnchor="end" fontSize="15" fontWeight="700" fill="var(--ink)">
              Ring {hoehe.name} hängt in {hoehe.y} m Höhe
            </text>
          </>
        )}
        {f && <line x1={bx(f.x)} x2={bx(f.x)} y1={by(0)} y2={by(lf(f.x))} stroke="var(--ink-muted)" strokeWidth="2" strokeDasharray="5 4" />}
        {rechenpunkt && (
          <g>
            <rect x={bx(rechenpunkt.x) - 6} y={by(rechenpunkt.y) - 6} width="12" height="12" fill="var(--correct)" stroke="var(--ink)" strokeWidth="1.5" transform={`rotate(45 ${bx(rechenpunkt.x)} ${by(rechenpunkt.y)})`} />
            <text x={bx(rechenpunkt.x) + 14} y={by(rechenpunkt.y) + 22} fontSize="15" fontWeight="700" fill="var(--correct-ink)">
              Rechnung: y = {komma(rechenpunkt.y)}
            </text>
          </g>
        )}
        {ringe.map((r) => (
          <g key={r.id}>
            <circle cx={bx(r.x)} cy={by(r.y)} r="19" fill={r.id === fokus ? 'var(--highlight)' : 'var(--surface)'} fillOpacity={r.id === fokus ? 0.7 : 0.4} stroke="var(--ink)" strokeWidth={r.id === fokus ? 4.5 : 3} />
            <text x={bx(r.x)} y={r.id === 'B' ? by(r.y) + 40 : by(r.y) - 26} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">
              {r.id}({komma(r.x)} | {komma(r.y)})
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ── Levelmap und Code-Schloss ───────────────────────────────────────────── */

const STATIONEN = ['Ring B', 'Ring D', 'Ring C']
const CODE = ['4,5', '6', '5']

/** Levelmap mit drei Stationen; die Ziffern des Codes erscheinen, sobald eine Station gelöst ist */
function Levelmap({ geloest, aktuell, kompakt = false }: { geloest: boolean[]; aktuell?: number; kompakt?: boolean }) {
  const offen = geloest.every(Boolean)
  return (
    <ol className={`dr-map${kompakt ? ' dr-map-kompakt' : ''}`} aria-label="Levelmap mit drei Stationen und dem Hangar-Tor">
      {STATIONEN.map((s, i) => (
        <li key={s} className={geloest[i] ? 'is-done' : aktuell === i ? 'is-current' : ''}>
          <i className={`fa-solid ${geloest[i] ? 'fa-circle-check' : 'fa-location-dot'}`} aria-hidden="true" /> {kompakt ? s : `Station ${i + 1}: ${s}`}
        </li>
      ))}
      <li className={`is-tor ${offen ? 'is-done' : ''}`}>
        <i className={`fa-solid ${offen ? 'fa-lock-open' : 'fa-lock'}`} aria-hidden="true" /> {kompakt ? 'Tor' : 'Hangar-Tor'}
        <span className="dr-code" aria-label="Code">
          {CODE.map((c, i) => (
            <span key={i} className={`dr-digit ${geloest[i] ? 'is-on' : ''}`}>
              {geloest[i] ? c : '?'}
            </span>
          ))}
        </span>
      </li>
    </ol>
  )
}

/* ── Festlegung: Ampel ───────────────────────────────────────────────────── */

function Ampel({ tipps, onTipp }: { tipps: Tipps; onTipp: (id: RingId, t: Tipp) => void }) {
  return (
    <div className="dr-ampel" role="group" aria-label="Deine Vermutung für jeden Ring">
      {RINGE.map((r) => (
        <div key={r.id} className="dr-ampel-zeile">
          <div className="dr-ampel-name">
            Ring {r.id}
            <small>
              ({komma(r.x)} | {komma(r.y)})
            </small>
          </div>
          <div className="dr-ampel-opts">
            {(Object.keys(TIPP_TEXT) as Tipp[]).map((t) => (
              <button key={t} type="button" aria-pressed={tipps[r.id] === t} onClick={() => onTipp(r.id, t)}>
                {TIPP_TEXT[t]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Merkkarte (Lernprodukt, handschriftlich): erst wenn alle Kriterien abgehakt sind, geht es weiter ── */

function MerkkarteHeft({ onFertig }: { onFertig: () => void }) {
  const KRITERIEN = [
    'Die drei Schritte der Punktprobe in der richtigen Reihenfolge, jeder mit einem kurzen Merksatz',
    'Ein eigenes Beispiel mit anderer Geraden und anderem Punkt, vollständig vorgerechnet',
    'Eine Warnung vor einem typischen Fehler (z. B. x und y vertauschen oder Vorzeichen)',
    'Eine kleine Skizze: Gerade mit einem Punkt, der darauf liegt, und einem, der nicht darauf liegt',
  ]
  const [haken, setHaken] = useState<boolean[]>(KRITERIEN.map(() => false))
  return (
    <div className="lp-ex bk-panel">
      <p>
        Gestalte in deinem Heft eine Karteikarte „Punktprobe“. Sie darf genau eine Karteikarte füllen. Hake ab, was du schon hast:
      </p>
      <div className="ls-criteria">
        {KRITERIEN.map((c, i) => (
          <label key={i}>
            <input
              type="checkbox"
              checked={haken[i]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const neu = haken.map((v, j) => (j === i ? e.target.checked : v))
                setHaken(neu)
                if (neu.every(Boolean)) onFertig()
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

export default function DrohneEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [tipps, setTipps] = useState<Tipps>({})
  const [check3, setCheck3] = useState(false)
  const [geloest, setGeloest] = useState<boolean[]>([false, false, false])
  const markiere = (i: number) => () => setGeloest((g) => (g[i] ? g : g.map((v, j) => (j === i ? true : v))))

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen 1: Punkt lesen',
      inhalt: (fertig) => (
        <McCard
          onSolved={fertig}
          title="a) Koordinaten lesen"
          prompt={
            <p>
              Wo liegt der Punkt <M>{'P(4 \\mid 1)'}</M> im Koordinatensystem?
            </p>
          }
          options={[
            { text: '4 nach rechts und 1 nach oben', correct: true, feedback: <>Die erste Zahl ist der x-Wert (waagerecht), die zweite der y-Wert (senkrecht).</> },
            { text: '1 nach rechts und 4 nach oben', feedback: <>Die Koordinaten sind vertauscht. Zuerst kommt immer der x-Wert, dann der y-Wert.</> },
            { text: '4 nach links und 1 nach oben', feedback: <>Ein positiver x-Wert liegt rechts von der y-Achse.</> },
            { text: '4 nach rechts und 1 nach unten', feedback: <>Ein positiver y-Wert liegt oberhalb der x-Achse.</> },
          ]}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 2: x einsetzen',
      inhalt: (fertig) => (
        <CheckCard
          rechnen={false}
          onSolved={fertig}
          title={<>b) <M>x</M> einsetzen</>}
          prompt={
            <p>
              Gerade <M>{'y = 2x + 1'}</M>. Berechne den y-Wert für <M>{'x = 3'}</M>.
            </p>
          }
          fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 7 }]}
          solution={<MB>{'y = 2 \\cdot 3 + 1 = 6 + 1 = 7'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 3: negative Zahl einsetzen',
      inhalt: (fertig) => (
        <CheckCard
          rechnen={false}
          onSolved={fertig}
          title={<>c) negatives <M>x</M> einsetzen</>}
          prompt={
            <p>
              Gerade <M>{'y = -x + 5'}</M>. Berechne den y-Wert für <M>{'x = -2'}</M>.
            </p>
          }
          fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 7 }]}
          solution={<MB>{'y = -(-2) + 5 = 2 + 5 = 7'}</MB>}
          help={
            <Hilfen
              steps={[
                <>Setze die Zahl für <M>x</M> in Klammern ein.</>,
                <>
                  <M>{'-x'}</M> bedeutet „minus mal <M>x</M>“. Minus mal minus ergibt plus.
                </>,
                <>
                  <M>{'y = -(-2) + 5 = 2 + 5'}</M>
                </>,
              ]}
            />
          }
        />
      ),
    },
    {
      art: 'problem',
      titel: 'Der Auftrag: Drohnen-Show',
      bedingung: 'Lege dich für alle vier Ringe fest, dann geht es weiter.',
      inhalt: (fertig) => (
        <ZweiSpalten
          links={
            <div className="dr-links">
              <div className="dr-story">
                <p>
                  Lichtshow fürs Schulfest: Eine Drohne fliegt <strong>geradlinig</strong> auf <M>{'y = 0{,}5x + 2'}</M> (<M>x</M> Entfernung, <M>y</M> Höhe in m) durch vier Leuchtringe. Ein Treffer zählt
                  nur durch die <strong>Ringmitte</strong>.
                </p>
              </div>
              <div className="ls-question">
                <i className="fa-solid fa-lightbulb" aria-hidden="true" />
                <span>Welche Ringe trifft die Drohne? Lege dich fest.</span>
              </div>
              <Ampel
                tipps={tipps}
                onTipp={(id, t) => {
                  const neu = { ...tipps, [id]: t }
                  setTipps(neu)
                  if (RINGE.every((r) => neu[r.id])) fertig()
                }}
              />
            </div>
          }
          rechts={<DrohnenBild />}
        />
      ),
    },
    {
      art: 'loesen',
      titel: "So geht's: Rechenbeispiel Ring A",
      frei: true,
      inhalt: () => (
        <ZweiSpalten
          links={
            <Beispiel
              offen
              title={<>Liegt <M>{'A(2 \\mid 3)'}</M> auf der Flugbahn <M>{'y = 0{,}5x + 2'}</M>?</>}
              aufgabe={<p>Rechne, statt zu schätzen: Setze die x-Koordinate des Rings in die Gleichung ein.</p>}
              steps={[
                {
                  title: <>x-Koordinate einsetzen und <M>y</M> berechnen</>,
                  body: <MB>{'y = 0{,}5 \\cdot 2 + 2 = 1 + 2 = 3'}</MB>,
                },
                {
                  title: 'Vergleichen und antworten',
                  body: (
                    <p>
                      Berechnet: <M>{'3'}</M>. Ring A hängt bei <M>{'y = 3'}</M>. Gleich heißt: <M>A</M> liegt auf der Geraden, die Drohne trifft Ring A.
                    </p>
                  ),
                },
              ]}
            />
          }
          rechts={
            <>
              <DrohnenBild fokus="A" rechenpunkt={{ x: 2, y: 3 }} ringe={RINGE.filter((r) => r.id === 'A')} />
              <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
            </>
          }
        />
      ),
    },
    {
      art: 'loesen',
      titel: 'Station 1: Ring B',
      inhalt: (fertig) => (
        <div className="dr-stat">
          <div className="dr-zwei">
          <div>
          <CheckCard
            rechnen={false}
            onSolved={() => {
              markiere(0)()
              fertig()
            }}
            title="Station 1: Ring B"
            fieldsRow
            level="basis"
            prompt={
              <p>
                Flugbahn: <M>{'y = 0{,}5x + 2'}</M>. Trifft die Drohne <M>{'B(5 \\mid 4{,}5)'}</M>?
              </p>
            }
            rechnung={[
              { l: ['y'], r: ['0{,}5 \\cdot', { luecke: 'x' }, '+ 2'], u: '\\text{① } x \\text{ von } B \\text{ einsetzen}' },
              { l: ['y'], r: [{ luecke: 'y' }], u: '\\text{② ausrechnen}' },
            ]}
            fields={[
              { kind: 'num', key: 'x', label: 'x-Wert von B', expected: 5 },
              { kind: 'num', key: 'y', label: 'berechnete Höhe', expected: 4.5 },
              { kind: 'select', key: 'e', label: <>③ Die Drohne …</>, options: ['trifft Ring B', 'trifft B nicht'], expected: 0 },
            ]}
            solution={<MB>{'y = 0{,}5 \\cdot 5 + 2 = 2{,}5 + 2 = 4{,}5 \\quad \\Rightarrow \\quad 4{,}5 = 4{,}5 \\text{ (Treffer)}'}</MB>}
            help={
              <SchrittHilfen
                schritte={[
                  { kurz: '①', titel: 'x einsetzen', hilfe: <>Vom Punkt <M>{'B(5 \\mid 4{,}5)'}</M> brauchst du zuerst nur die x-Koordinate. Setze sie für <M>x</M> in <M>{'0{,}5x + 2'}</M> ein.</> },
                  { kurz: '②', titel: 'ausrechnen', hilfe: <>Punkt vor Strich: erst <M>{'0{,}5 \\cdot 5'}</M>, dann <M>{'+2'}</M>. Zur Kontrolle: Die Hälfte von 5 ist 2,5.</> },
                  { kurz: '③', titel: 'vergleichen', hilfe: <>Vergleiche die berechnete Höhe mit der y-Koordinate des Rings. Gleich bedeutet Treffer.</> },
                ]}
              />
            }
          />
          </div>
          <div>
          <Levelmap geloest={geloest} aktuell={0} kompakt />
          <DrohnenBild fokus="B" rechenpunkt={geloest[0] ? { x: 5, y: 4.5 } : undefined} />
          </div>
          </div>
        </div>
      ),
    },
    {
      art: 'loesen',
      titel: 'Station 2: Ring D',
      inhalt: (fertig) => (
        <div className="dr-stat">
          <div className="dr-zwei">
            <div>
              <CheckCard
                onSolved={() => {
                  markiere(1)()
                  fertig()
                }}
                title="Station 2: Ring D"
                fieldsRow
                rechnen={false}
                level="standard"
                prompt={
                  <p>
                    Flugbahn: <M>{'y = 0{,}5x + 2'}</M>. Trifft die Drohne die Mitte von <M>{'D(8 \\mid 7)'}</M>? Berechne selbst die Höhe der Flugbahn bei <M>{'x = 8'}</M> und entscheide.
                  </p>
                }
                fields={[
                  { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 6 },
                  { kind: 'select', key: 'e', label: <>Die Drohne …</>, options: ['trifft Ring D', 'trifft D nicht'], expected: 1 },
                ]}
                solution={<MB>{'y = 0{,}5 \\cdot 8 + 2 = 4 + 2 = 6 \\quad \\Rightarrow \\quad 6 \\neq 7 \\text{ (kein Treffer)}'}</MB>}
                help={
                  <SchrittHilfen
                    schritte={[
                      { kurz: '①', titel: 'x einsetzen', hilfe: <>Die x-Koordinate von <M>{'D(8 \\mid 7)'}</M> ist 8. Sie kommt für <M>x</M> in die Flugbahn.</> },
                      { kurz: '②', titel: 'ausrechnen', hilfe: <><M>{'0{,}5 \\cdot 8'}</M> ist die Hälfte von 8. Dann noch <M>{'+2'}</M> rechnen.</> },
                      { kurz: '③', titel: 'vergleichen', hilfe: <>Vergleiche das Ergebnis mit der y-Koordinate 7 des Rings. Sind die Werte gleich?</> },
                    ]}
                  />
                }
              />
            </div>
            <div>
              <Levelmap geloest={geloest} aktuell={1} kompakt />
              <DrohnenBild fokus="D" rechenpunkt={geloest[1] ? { x: 8, y: 6 } : undefined} />
            </div>
          </div>
        </div>
      ),
    },
    {
      art: 'loesen',
      titel: 'Station 3: Ring C',
      inhalt: (fertig) => (
        <div className="dr-stat">
          <div className="dr-zwei">
            <div>
              <CheckCard
                onSolved={() => {
                  markiere(2)()
                  fertig()
                }}
                title="Station 3: Ring C"
                fieldsRow
                rechnen={false}
                level="erweiterung"
                prompt={
                  <p>
                    Flugbahn: <M>{'y = 0{,}5x + 2'}</M>. Bei <M>{'C(6 \\mid 5{,}2)'}</M> ist es knapp. Trifft die Drohne die Ringmitte? Wie viele Meter daneben?
                  </p>
                }
                fields={[
                  { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 5 },
                  { kind: 'select', key: 'e', label: <>Die Drohne …</>, options: ['trifft Ring C', 'trifft C nicht'], expected: 1 },
                  { kind: 'num', key: 'd', label: 'Abstand', expected: 0.2, unit: 'm' },
                ]}
                solution={<MB>{'y = 0{,}5 \\cdot 6 + 2 = 3 + 2 = 5 \\quad \\Rightarrow \\quad 5 \\neq 5{,}2 \\text{ (kein Treffer, } 0{,}2\\,\\text{m daneben)}'}</MB>}
                help={
                  <SchrittHilfen
                    schritte={[
                      { kurz: '①', titel: 'x einsetzen', hilfe: <>Die x-Koordinate von <M>{'C(6 \\mid 5{,}2)'}</M> ist 6. Sie kommt für <M>x</M> in die Flugbahn.</> },
                      { kurz: '②', titel: 'ausrechnen', hilfe: <><M>{'0{,}5 \\cdot 6'}</M> ist die Hälfte von 6. Dann noch <M>{'+2'}</M> rechnen.</> },
                      { kurz: '③', titel: 'Abstand', hilfe: <>Der Abstand ist der Unterschied zwischen berechneter Höhe und y-Koordinate des Rings: <M>{'5{,}2 - 5'}</M>.</> },
                    ]}
                  />
                }
              />
            </div>
            <div>
              <Levelmap geloest={geloest} aktuell={2} kompakt />
              <DrohnenBild fokus="C" rechenpunkt={geloest[2] ? { x: 6, y: 5 } : undefined} />
              {geloest[2] && (
                <div className="ls-question">
                  <i className="fa-solid fa-lock-open" aria-hidden="true" />
                  <span>Aha: C sah nach Treffer aus, ist aber 0,2 m daneben. Code 4,5 – 6 – 5: Das Tor öffnet sich.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      art: 'sichern',
      titel: 'Das hältst du fest',
      frei: true,
      inhalt: () => (
        <ZweiSpalten
          links={<Rueckbezug tipps={tipps} />}
          rechts={
            <Merke title="Punktprobe: Liegt ein Punkt auf der Geraden?">
              <ol>
                <li>
                  Setze die <strong>x-Koordinate</strong> des Punkts in die Geradengleichung ein.
                </li>
                <li>
                  Berechne den <strong>y-Wert</strong>.
                </li>
                <li>
                  Vergleiche mit der <strong>y-Koordinate</strong> des Punkts: gleich → der Punkt liegt auf der Geraden, verschieden → er liegt nicht darauf.
                </li>
              </ol>
            </Merke>
          }
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Deine Merkkarte (Lernprodukt)',
      bedingung: 'Hake alle vier Punkte ab, sobald sie auf deiner Merkkarte stehen.',
      inhalt: (fertig) => <MerkkarteHeft onFertig={fertig} />,
    },
    {
      art: 'sichern',
      titel: 'Check 1: Welche Antwort stimmt?',
      inhalt: (fertig) => (
        <TrackedMc
          topic="Punkt auf Gerade prüfen (Lernsituation)"
          onSolved={fertig}
          title="Check 1"
          level="standard"
          prompt={
            <p>
              Liegt <M>{'P(-2 \\mid 7)'}</M> auf der Geraden <M>{'y = -2x + 3'}</M>? Rechne im Heft und wähle dann.
            </p>
          }
          options={[
            { text: <>Ja: <M>{'-2 \\cdot (-2) + 3 = 7'}</M></>, correct: true, feedback: <>Minus mal minus ergibt plus. Der berechnete y-Wert 7 passt zum Punkt.</> },
            { text: <>Nein: <M>{'-2 \\cdot (-2) + 3 = -1'}</M></>, feedback: <>Vorzeichenfehler: <M>{'-2 \\cdot (-2) = +4'}</M>, nicht <M>{'-4'}</M>.</> },
            { text: <>Nein: <M>{'-2 \\cdot 7 + 3 = -11'}</M></>, feedback: <>Hier wurde der y-Wert statt des x-Werts eingesetzt. Eingesetzt wird immer die x-Koordinate.</> },
            { text: <>Nein: 7 ist nicht gleich 3</>, feedback: <>Die 3 ist nur der y-Achsenabschnitt. Du musst den x-Wert einsetzen und erst das Ergebnis vergleichen.</> },
          ]}
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 2: Punktprobe selbst rechnen',
      inhalt: (fertig) => (
        <TrackedCheck
          rechnen={false}
          topic="Punkt auf Gerade prüfen (Lernsituation)"
          onSolved={fertig}
          title="Check 2"
          level="standard"
          prompt={
            <p>
              Gerade <M>{'y = -1{,}5x + 4'}</M> und Punkt <M>{'Q(4 \\mid -1)'}</M>. Berechne den y-Wert für <M>{'x = 4'}</M> und entscheide.
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: -2 },
            { kind: 'select', key: 'e', label: 'Q liegt …', options: ['auf der Geraden', 'nicht auf der Geraden'], expected: 1 },
          ]}
          solution={<MB>{'y = -1{,}5 \\cdot 4 + 4 = -6 + 4 = -2 \\neq -1'}</MB>}
          help={
            <Hilfen
              steps={[
                <>Setze nur die x-Koordinate 4 ein.</>,
                <><M>{'-1{,}5 \\cdot 4 = -6'}</M>. Dann <M>{'+4'}</M>.</>,
                <>Du erhältst <M>{'-2'}</M>. Der Punkt hat aber <M>{'y = -1'}</M>.</>,
              ]}
            />
          }
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 3: Zweite Drohne',
      inhalt: (fertig) => (
        <div className="dr-zwei dr-zwei-gleich">
        <TrackedCheck
          rechnen={false}
          topic="Punkt auf Gerade prüfen (Lernsituation)"
          onSolved={() => {
            setCheck3(true)
            fertig()
          }}
          title="Check 3"
          level="erweiterung"
          prompt={
            <p>
              Zweite Drohne: <M>{'y = -0{,}5x + 9'}</M>. Liegt <M>{'R(10 \\mid 4)'}</M> auf der Flugbahn? Wo muss <M>{'S(x \\mid 6)'}</M> hängen, damit sie trifft?
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'select', key: 'e', label: 'R liegt …', options: ['auf der Flugbahn', 'nicht auf der Flugbahn'], expected: 0 },
            { kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 6 },
          ]}
          solution={
            <>
              <MB>{'y = -0{,}5 \\cdot 10 + 9 = -5 + 9 = 4 \\quad \\Rightarrow \\quad \\text{Treffer}'}</MB>
              <MB>{'\\begin{aligned} 6 &= -0{,}5x + 9 && \\mid -9 \\\\ -3 &= -0{,}5x && \\mid :(-0{,}5) \\\\ x &= 6 \\end{aligned}'}</MB>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Für <M>R</M> setzt du <M>{'x = 10'}</M> ein, für <M>S</M> setzt du <M>{'y = 6'}</M> ein.</>,
                <><M>{'6 = -0{,}5x + 9'}</M>: Ziehe zuerst 9 ab.</>,
                <>Teile durch <M>{'-0{,}5'}</M>. Minus durch minus ergibt plus.</>,
              ]}
            />
          }
        />
        <DrohnenBild
          linie={{ m: -0.5, t: 9 }}
          ringe={[{ id: 'R', x: 10, y: 4 }, ...(check3 ? [{ id: 'S', x: 6, y: 6 }] : [])]}
          hoehe={check3 ? undefined : { y: 6, name: 'S' }}
        />
        </div>
      ),
    },
    {
      art: 'sichern',
      titel: 'Geschafft!',
      frei: true,
      inhalt: () => (
        <div className="sl-ende">
          <p>Du kannst jetzt rechnerisch prüfen, ob ein Punkt auf einer Geraden liegt, und eine fehlende Koordinate berechnen. Jetzt übst du mit den Übungsaufgaben.</p>
          <div className="bk-actions">
            <button type="button" className="bk-btn" onClick={onBack}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
            </button>
            <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
              Weiter zu den Übungsaufgaben <i className="fa-solid fa-dumbbell" aria-hidden="true" />
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell title="Punkt auf Gerade prüfen: Drohnen-Parcours" width="wide" kompakt parent={{ to: '/lineare_funktionen', label: 'Lineare Funktionen' }}>
        <SeitenLernsituation ziel={<>In dieser Lernsituation findest du heraus, wie du rechnerisch prüfst, ob ein Punkt auf einer Geraden liegt.</>} seiten={seiten} />
      </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Ampel aus Phase 2: Tipp, Rechnung und Ergebnis je Ring */
function Rueckbezug({ tipps }: { tipps: Tipps }) {
  return (
    <div className="ls-back">
      <p>
        <strong>Deine Vermutung gegen die Rechnung:</strong>
      </p>
      <table className="dr-tab">
        <thead>
          <tr>
            <th>Ring</th>
            <th>Dein Tipp</th>
            <th>Rechnung</th>
            <th>Ergebnis</th>
          </tr>
        </thead>
        <tbody>
          {RINGE.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{tipps[r.id] ? TIPP_TEXT[tipps[r.id]!] : 'kein Tipp'}</td>
              <td>
                <M>{`${komma(bahn(r.x))} ${trifft(r) ? '=' : '\\neq'} ${komma(r.y)}`}</M>
              </td>
              <td className={trifft(r) ? 'ist-ok' : 'ist-no'}>{trifft(r) ? 'Trifft' : 'Trifft nicht'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Bei Ring C sah es nach einem Treffer aus. Erst die Rechnung hat es sicher entschieden.</p>
    </div>
  )
}
