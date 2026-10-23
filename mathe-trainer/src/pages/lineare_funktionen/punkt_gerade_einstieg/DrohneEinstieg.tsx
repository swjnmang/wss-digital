import { useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, McCard, SchrittHilfen, TrackedCheck, TrackedMc } from '../lernsituation_kit/kit'
import { SeitenLernsituation, ZweiSpalten, type Seite } from '../lernsituation_kit/seiten'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './drohne.css'

// Lernsituation „Drohnen-Parcours“ zur Punktprobe: Liegt ein Punkt auf einer Geraden? (45 min)
// Format Rätsel / Escape-Room (Stationen öffnen den Code für das Hangar-Tor), Look Levelmap mit Code-Schloss, Lernprodukt digitale Merkkarte.
// Instruktionsreihenfolge: Problem zuerst. Die SuS können Wertetabellen und Geraden zeichnen und kennen y = mx + t. Neu ist die rechnerische Punktprobe.
// Problem erkennen: Auftrag und Festlegung (Ampel je Ring: trifft / trifft nicht / unsicher). Ring C liegt im Graphen scheinbar auf der Flugbahn.
// Problem lösen: Rechenbeispiel (Ring A), Station 1 (Ring B), Station 2 (Ring C, Aha: sieht nah aus, trifft aber nicht), Station 3 (fehlende Koordinate).
// Festhalten und Prüfen: Rückbezug auf die Ampel, Merke, digitale Merkkarte, drei Checks (Check 1 mit typischen Fehlern als Antwortoptionen).
// Die Festlegung bleibt nur im Seitenzustand (kein Speichern).

/* ── Situation ───────────────────────────────────────────────────────────── */

// Flugbahn der Drohne: y = 0,5x + 2 (x = Entfernung in m, y = Höhe in m). Ringe mit Mittelpunkt (x | y).
const bahn = (x: number) => 0.5 * x + 2

type RingId = 'A' | 'B' | 'C' | 'D'
type Ring = { id: RingId; x: number; y: number }
const RINGE: Ring[] = [
  { id: 'A', x: 2, y: 3 },
  { id: 'B', x: 5, y: 4.5 },
  { id: 'C', x: 6, y: 5.5 },
  { id: 'D', x: 8, y: 6 },
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

/** ringe: welche Ringe gezeichnet werden; letzterRing: gestrichelte Höhe 8 m für Ring F; fx: Position von Ring F */
function DrohnenBild({
  ringe = RINGE,
  letzterRing = false,
  fx,
  fokus,
  rechenpunkt,
}: {
  ringe?: Ring[]
  letzterRing?: boolean
  fx?: number
  /** Ring der aktuellen Station: hervorgehoben, mit senkrechter Hilfslinie bei seinem x-Wert */
  fokus?: RingId
  /** Ergebnis der Rechnung: der Punkt der Flugbahn bei x (erscheint erst nach dem Lösen) */
  rechenpunkt?: { x: number; y: number }
}) {
  const f = ringe.find((r) => r.id === fokus)
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
        <line x1={bx(0)} y1={by(bahn(0))} x2={bx(13)} y2={by(bahn(13))} stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
        <text x={bx(9.6)} y={by(bahn(9.6)) + 28} fontSize="16" fontWeight="700" fill="var(--primary)">
          Flugbahn
        </text>
        <circle cx={bx(0)} cy={by(2)} r="6" fill="var(--primary)" />
        <text x={bx(0) + 10} y={by(2) + 20} fontSize="14" fill="var(--ink-muted)">
          Start
        </text>
        {letzterRing && (
          <>
            <line x1={bx(0)} x2={bx(S.xMax)} y1={by(8)} y2={by(8)} stroke="var(--ink-muted)" strokeDasharray="6 5" />
            <text x={bx(0.3)} y={by(8) - 6} fontSize="15" fontWeight="700" fill="var(--ink)">
              Ring F hängt in 8 m Höhe
            </text>
            {fx !== undefined && (
              <>
                <circle cx={bx(fx)} cy={by(8)} r="15" fill="none" stroke="var(--correct)" strokeWidth="3.5" />
                <circle cx={bx(fx)} cy={by(8)} r="3.5" fill="var(--correct)" />
              </>
            )}
          </>
        )}
        {f && <line x1={bx(f.x)} x2={bx(f.x)} y1={by(0)} y2={by(bahn(f.x))} stroke="var(--ink-muted)" strokeWidth="2" strokeDasharray="5 4" />}
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

const STATIONEN = ['Ring B', 'Ring C', 'Ring F']
const CODE = ['4,5', '5', '12']

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

/* ── Digitale Merkkarte (Lernprodukt) ────────────────────────────────────── */

type KartenFeld = 's1' | 's2' | 's3' | 'bsp' | 'fehler'
const KARTE_FELDER: { key: KartenFeld; label: ReactNode; platzhalter: string }[] = [
  { key: 's1', label: 'Schritt 1', platzhalter: 'Was machst du zuerst?' },
  { key: 's2', label: 'Schritt 2', platzhalter: 'Was rechnest du dann?' },
  { key: 's3', label: 'Schritt 3', platzhalter: 'Womit vergleichst du, und was heißt das Ergebnis?' },
  { key: 'bsp', label: 'Eigenes Beispiel mit anderen Zahlen', platzhalter: 'z. B. Gerade, Punkt und Rechnung' },
  { key: 'fehler', label: 'Typischer Fehler, auf den du achten musst', platzhalter: 'Wo passieren die meisten Fehler?' },
]

function Merkkarte({ werte, setWerte, onFertig }: { werte: Record<KartenFeld, string>; setWerte: (w: Record<KartenFeld, string>) => void; onFertig: () => void }) {
  const fertig = KARTE_FELDER.every((f) => werte[f.key].trim().length >= 8)
  const aendern = (key: KartenFeld, v: string) => {
    const neu = { ...werte, [key]: v }
    setWerte(neu)
    if (KARTE_FELDER.every((f) => neu[f.key].trim().length >= 8)) onFertig()
  }
  return (
    <ZweiSpalten
      links={
    <div className="lp-ex bk-panel">
      <p>Baue deine Merkkarte in eigenen Worten (danach auch ins Heft).</p>
      <div className="dr-karte-form">
        {KARTE_FELDER.map((f) => (
          <label key={f.key}>
            {f.label}
            <textarea
              rows={1}
              className="bk-input"
              placeholder={f.platzhalter}
              value={werte[f.key]}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => aendern(f.key, e.target.value)}
            />
          </label>
        ))}
      </div>
    </div>
      }
      rechts={
      <>
      {fertig && (
        <div className="dr-karte">
          <h4 className="dr-karte-title">
            <i className="fa-solid fa-id-card" aria-hidden="true" /> Meine Merkkarte: Punktprobe
          </h4>
          <ol>
            <li>{werte.s1}</li>
            <li>{werte.s2}</li>
            <li>{werte.s3}</li>
          </ol>
          <p>
            <strong>Beispiel:</strong> {werte.bsp}
          </p>
          <p>
            <strong>Achtung:</strong> {werte.fehler}
          </p>
        </div>
      )}
      {!fertig && <p className="dr-hinweis">Kriterien: drei Schritte in der richtigen Reihenfolge, ein eigenes Beispiel, eine Warnung vor einem typischen Fehler. Hier erscheint deine fertige Karte.</p>}
      </>
      }
    />
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function DrohneEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [tipps, setTipps] = useState<Tipps>({})
  const [geloest, setGeloest] = useState<boolean[]>([false, false, false])
  const [karte, setKarte] = useState<Record<KartenFeld, string>>({ s1: '', s2: '', s3: '', bsp: '', fehler: '' })
  const markiere = (i: number) => () => setGeloest((g) => (g[i] ? g : g.map((v, j) => (j === i ? true : v))))
  const alleGetippt = RINGE.every((r) => tipps[r.id])

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
          onSolved={fertig}
          title="b) x einsetzen"
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
          onSolved={fertig}
          title="c) negatives x einsetzen"
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
      frei: true,
      inhalt: () => (
        <ZweiSpalten
          links={
            <>
              <div className="dr-story">
                <p>
                  Lichtshow fürs Schulfest: Eine Drohne fliegt <strong>geradlinig</strong> durch vier Leuchtringe. Flugbahn: <M>{'y = 0{,}5x + 2'}</M> (<M>x</M> Entfernung, <M>y</M> Höhe in m).
                </p>
                <p>
                  Ein Treffer zählt nur, wenn sie <strong>genau durch die Ringmitte</strong> fliegt. Der Hangar öffnet sich mit einem Code aus drei Stationen.
                </p>
              </div>
              <div className="ls-question">
                <i className="fa-solid fa-lightbulb" aria-hidden="true" />
                <span>Welche Ringe trifft die Drohne, und wo muss Ring F (8 m hoch) hängen?</span>
              </div>
            </>
          }
          rechts={<DrohnenBild />}
        />
      ),
    },
    {
      art: 'problem',
      titel: 'Deine Vermutung: Trifft die Drohne?',
      bedingung: 'Lege dich für alle vier Ringe fest, dann geht es weiter.',
      inhalt: (fertig) => (
        <ZweiSpalten
          links={<DrohnenBild />}
          rechts={
            <div className="lp-ex bk-panel">
              <p>Schau dir den Graphen an. Was meinst du: Fliegt die Drohne durch die Mitte des Rings? „Unsicher“ ist erlaubt.</p>
              <Ampel
                tipps={tipps}
                onTipp={(id, t) => {
                  const neu = { ...tipps, [id]: t }
                  setTipps(neu)
                  if (RINGE.every((r) => neu[r.id])) fertig()
                }}
              />
              {alleGetippt && <p className="dr-hinweis">Gespeichert. Am Ende vergleichst du mit der Rechnung.</p>}
            </div>
          }
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
            onSolved={() => {
              markiere(0)()
              fertig()
            }}
            title="Station 1: Ring B"
            fieldsRow
            level="basis"
            prompt={
              <p>
                Trifft die Drohne <M>{'B(5 \\mid 4{,}5)'}</M>?
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
      titel: 'Station 2: Ring C',
      inhalt: (fertig) => (
        <div className="dr-stat">
          <div className="dr-zwei">
          <div>
          <CheckCard
            onSolved={() => {
              markiere(1)()
              fertig()
            }}
            title="Station 2: Ring C"
            fieldsRow
            level="standard"
            prompt={
              <p>
                Trifft die Drohne die Mitte von <M>{'C(6 \\mid 5{,}5)'}</M>?
              </p>
            }
            rechnung={[
              { l: ['y'], r: ['0{,}5 \\cdot', { luecke: 'x' }, '+ 2'], u: '\\text{① } x \\text{ von } C \\text{ einsetzen}' },
              { l: ['y'], r: [{ luecke: 'y' }], u: '\\text{② ausrechnen}' },
            ]}
            fields={[
              { kind: 'num', key: 'x', label: 'x-Wert von C', expected: 6 },
              { kind: 'num', key: 'y', label: 'berechnete Höhe', expected: 5 },
              { kind: 'select', key: 'e', label: <>③ Die Drohne …</>, options: ['trifft Ring C', 'trifft C nicht'], expected: 1 },
            ]}
            solution={<MB>{'y = 0{,}5 \\cdot 6 + 2 = 3 + 2 = 5 \\quad \\Rightarrow \\quad 5 \\neq 5{,}5 \\text{ (kein Treffer)}'}</MB>}
            help={
              <SchrittHilfen
                schritte={[
                  { kurz: '①', titel: 'x einsetzen', hilfe: <>Die x-Koordinate von <M>{'C(6 \\mid 5{,}5)'}</M> ist 6. Sie kommt für <M>x</M> in die Flugbahn.</> },
                  { kurz: '②', titel: 'ausrechnen', hilfe: <><M>{'0{,}5 \\cdot 6'}</M> ist die Hälfte von 6. Dann noch <M>{'+2'}</M> rechnen.</> },
                  { kurz: '③', titel: 'vergleichen', hilfe: <>Die Flugbahn liegt bei 6 m Entfernung auf einer anderen Höhe als der Ringmittelpunkt. Sind 5 und 5,5 gleich?</> },
                ]}
              />
            }
          />
          </div>
          <div>
          <Levelmap geloest={geloest} aktuell={1} kompakt />
          <DrohnenBild fokus="C" rechenpunkt={geloest[1] ? { x: 6, y: 5 } : undefined} />
          {geloest[1] && (
            <div className="ls-question">
              <i className="fa-solid fa-bolt" aria-hidden="true" />
              <span>
                Aha: Ring C sah wie ein Treffer aus, ist aber 0,5 m daneben.
              </span>
            </div>
          )}
          </div>
          </div>
        </div>
      ),
    },
    {
      art: 'loesen',
      titel: 'Station 3: Wo hängt Ring F?',
      inhalt: (fertig) => (
        <div className="dr-stat">
          <div className="dr-zwei">
          <div>
          <CheckCard
            onSolved={() => {
              markiere(2)()
              fertig()
            }}
            title="Station 3: Ring F"
            level="erweiterung"
            prompt={
              <p>
                Bei welchem <M>x</M> hängt <M>{'F(x \\mid 8)'}</M>, damit die Drohne trifft? Setze <M>y</M> ein.</p>
            }
            rechnung={[
              { l: ['8'], r: ['0{,}5x + 2'], u: '\\text{① } y \\text{ von } F \\text{ einsetzen}' },
              { l: [{ luecke: 'a' }], r: ['0{,}5x'], u: '\\mid -2' },
              { l: ['x'], r: [{ luecke: 'b' }], u: '\\mid :0{,}5' },
            ]}
            fields={[
              { kind: 'num', key: 'a', label: 'Zahl links', expected: 6 },
              { kind: 'num', key: 'b', label: 'Entfernung x', expected: 12 },
            ]}
            solution={<MB>{'\\begin{aligned} 8 &= 0{,}5x + 2 && \\mid -2 \\\\ 6 &= 0{,}5x && \\mid :0{,}5 \\\\ x &= 12 \\end{aligned}'}</MB>}
            help={
              <SchrittHilfen
                schritte={[
                  { kurz: '①', titel: 'y einsetzen', hilfe: <>Diesmal ist <M>y = 8</M> bekannt und <M>x</M> gesucht. Die 8 steht links, <M>x</M> bleibt als Buchstabe stehen.</> },
                  { kurz: '②', titel: '−2 rechnen', hilfe: <>Ziehe auf beiden Seiten 2 ab: <M>{'8 - 2'}</M> ergibt die Zahl links.</> },
                  { kurz: '③', titel: 'durch 0,5 teilen', hilfe: <>Durch 0,5 teilen ist dasselbe wie mal 2 rechnen.</> },
                ]}
              />
            }
          />
          </div>
          <div>
          <Levelmap geloest={geloest} aktuell={2} kompakt />
          <DrohnenBild letzterRing fx={geloest[2] ? 12 : undefined} />
          {geloest[2] && (
            <>
              <div className="ls-question">
                <i className="fa-solid fa-lock-open" aria-hidden="true" />
                <span>Code geknackt: 4,5 – 5 – 12. Das Hangar-Tor öffnet sich, und die Show kann starten.</span>
              </div>
            </>
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
      bedingung: 'Fülle alle fünf Felder aus.',
      inhalt: (fertig) => <Merkkarte werte={karte} setWerte={setKarte} onFertig={fertig} />,
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
          rechnen
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
        <TrackedCheck
          topic="Punkt auf Gerade prüfen (Lernsituation)"
          onSolved={fertig}
          title="Check 3"
          level="erweiterung"
          prompt={
            <p>
              Eine zweite Drohne fliegt auf <M>{'y = -0{,}5x + 9'}</M>. Ring <M>{'R(10 \\mid 4)'}</M> hängt schon. Liegt er auf der Flugbahn? Ein weiterer Ring <M>{'S(x \\mid 6)'}</M> soll
              getroffen werden. Wo muss er hängen?
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
