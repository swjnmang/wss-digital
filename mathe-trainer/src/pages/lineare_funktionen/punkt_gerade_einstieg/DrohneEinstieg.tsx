import { useEffect, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { useSitzungState } from '../../../hooks/useSitzung'
import { Beispiel, M, MB, Merke } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, ErklaerungCtx, Hilfen, Loesungsweg, McCard, TrackedCheck, TrackedMc } from '../lernsituation_kit/kit'
import { Abschnitt, Aufklappbar, BeispielMitVideo, BonusSpiel, Handlungsprodukt, SeitenLernsituation, type Bildwelt, type Seite, type Thema } from '../lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../lernsituation_kit/punkte'
import { Kriterien, standardKriterien } from '../../finanzmathe/zins_kit/zins_kit'
import RingCheck from './RingCheck'
import titelBild from './bilder/drohne-titel.webp'
import merkkarteBild from './bilder/drohne-merkkarte.webp'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './drohne.css'

// Lernsituation „Der Drohnen-Parcours“: Punktprobe, liegt ein Punkt auf einer Geraden? (ca. 45 min)
// Format Rätsel / Escape-Room: Die Ergebnisse der Punktprobe für drei Leuchtringe ergeben den Code für das Hangar-Tor.
// Vorwissen: Koordinaten, Wertetabelle, y = mx + t. Neu ist die rechnerische Punktprobe.
// Problem erkennen: Festlegung je Ring (trifft / trifft nicht / unsicher). Ring C liegt nur 0,2 m neben der Flugbahn und ist im
// Graphen nicht eindeutig (Aha: sieht nach Treffer aus, ist aber daneben).
// Problem lösen: Problem (Ringe B, D, C prüfen) → Beispielrechnung Ring A mit Lernvideo → Ergebnisse abgleichen (Höhe der Flugbahn
// und Treffer je Ring; die Höhen ergeben den Code 4,5 – 6 – 5) → Handlungsprodukt analog: Merkkarte „Punktprobe“ → Rückbezug und Merke.
// Phase 4: Auswahl mit typischen Fehlern, Wer hat recht? (y statt x eingesetzt), Punktprobe selbst rechnen, zweite Drohne (umgekehrt:
// fehlende Koordinate), Bonus-Spiel „Ring-Check“.
// Punkte nach Aufwand: Warm-up 2/2/2/2/3 = 11, Festlegung 3, Kernaufgabe 15, Merkkarte 5, Übungen 4/5/5/8
// (Pflicht zusammen 56: Warm-up 20 %, Problem lösen 20 = 36 %, Übungen 22 = 39 %), Bonus-Spiel 4 Runden à 2 = 8 wie die beste Übung.
// Identität: Themenfarbe Ocker, Symbol fa-plane-up, Titelbild Comic in drei Bildern (Plakat Lichtshow, Drohne vor den Ringen,
// Hangar-Tor mit Code-Schloss), Leitobjekt die Drohne mit dem Code-Schloss des Hangar-Tors.
// Bildwelt Comic / retro: Titelbild und Merkkarte sind gerenderte WebP-Dateien aus bilder-quelle/drohne-*.bild.html
// (Bausteine in bilder-quelle/_comic.js); das Koordinatensystem mit Flugbahn und Ringen bleibt Inline-SVG.

/** Lernvideo aus den Übungsaufgaben „Punkt auf Gerade prüfen“ */
const VIDEO_PUNKTPROBE = 'https://www.youtube-nocookie.com/embed/W14DzAUEMCA'

const THEMA: Thema = {
  name: 'Der Drohnen-Parcours',
  farbe: 'ocker',
  icon: 'fa-plane-up',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Comic in drei Bildern: Ein Plakat kündigt die Lichtshow beim Schulfest an. Eine Drohne fliegt auf der Flugbahn y = 0,5x + 2 auf die Leuchtringe A, B und C zu, eine Sprechblase fragt: Trifft sie jeden Ring in der Mitte? Daneben ein Hangar-Tor mit einem Code-Schloss mit drei Fragezeichen."
    />
  ),
}
const BILDWELT: Bildwelt = { welt: 'comic', variante: 'retro' }

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

/* ── Flugbahn und Ringe im Koordinatensystem ─────────────────────────────── */

const S = { w: 640, h: 330, l: 44, r: 14, t: 12, b: 36, xMin: -0.5, xMax: 13.5, yMin: -0.5, yMax: 9.5 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)

function DrohnenBild({
  ringe = RINGE,
  fokus,
  linie = { m: 0.5, t: 2 },
  hoehe,
  label = 'Koordinatensystem mit der geraden Flugbahn einer Drohne und mehreren Leuchtringen',
}: {
  ringe?: { id: string; x: number; y: number }[]
  /** Ring des Beispiels: hervorgehoben, mit senkrechter Hilfslinie bei seinem x-Wert */
  fokus?: string
  /** Flugbahn y = m·x + t (Standard: y = 0,5x + 2) */
  linie?: { m: number; t: number }
  /** gestrichelte Höhe für einen Ring, dessen x-Wert noch gesucht ist */
  hoehe?: { y: number; name: string }
  label?: string
}) {
  const f = ringe.find((r) => r.id === fokus)
  const lf = (x: number) => linie.m * x + linie.t
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label={label}>
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
        {hoehe && (
          <>
            <line x1={bx(0)} x2={bx(S.xMax)} y1={by(hoehe.y)} y2={by(hoehe.y)} stroke="var(--ink-muted)" strokeDasharray="6 5" />
            <text x={bx(S.xMax) - 4} y={by(hoehe.y) - 6} textAnchor="end" fontSize="15" fontWeight="700" fill="var(--ink)">
              Ring {hoehe.name} hängt in {hoehe.y} m Höhe
            </text>
          </>
        )}
        {f && <line x1={bx(f.x)} x2={bx(f.x)} y1={by(0)} y2={by(lf(f.x))} stroke="var(--ink-muted)" strokeWidth="2" strokeDasharray="5 4" />}
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

/* ── Code-Schloss des Hangar-Tors (Leitobjekt) ───────────────────────────── */

const CODE_RINGE: RingId[] = ['B', 'D', 'C']

/** Code-Schloss: Die Höhen der Flugbahn bei den Ringen B, D, C ergeben den Code; offen, sobald die Rechnung stimmt */
function CodeSchloss({ offen }: { offen: boolean }) {
  return (
    <div className="dr-code-zeile">
      <ol className="dr-map" aria-label="Code-Schloss des Hangar-Tors">
        {CODE_RINGE.map((id) => (
          <li key={id} className={offen ? 'is-done' : ''}>
            <i className={`fa-solid ${offen ? 'fa-circle-check' : 'fa-location-dot'}`} aria-hidden="true" /> Ring {id}
          </li>
        ))}
        <li className={`is-tor ${offen ? 'is-done' : ''}`}>
          <i className={`fa-solid ${offen ? 'fa-lock-open' : 'fa-lock'}`} aria-hidden="true" /> Hangar-Tor
          <span className="dr-code" aria-label="Code">
            {CODE_RINGE.map((id) => {
              const r = RINGE.find((x) => x.id === id)!
              return (
                <span key={id} className={`dr-digit ${offen ? 'is-on' : ''}`}>
                  {offen ? komma(bahn(r.x)) : '?'}
                </span>
              )
            })}
          </span>
        </li>
      </ol>
    </div>
  )
}

/* ── Festlegung: Ampel je Ring ───────────────────────────────────────────── */

function Ampel({ tipps, onTipp }: { tipps: Tipps; onTipp: (id: RingId, t: Tipp) => void }) {
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const alle = RINGE.every((r) => tipps[r.id])
  useEffect(() => {
    if (alle) pt.geloest()
  }, [alle, pt])
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

/* ── Rechenbeispiel Ring A und Lösungsweg ────────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Liegt der Ring <M>{'A(2 \\mid 3)'}</M> auf der Flugbahn <M>{'y = 0{,}5x + 2'}</M>? Rechne, statt zu schätzen.
  </p>
)
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: <>Die x-Koordinate des Rings einsetzen</>,
    body: (
      <>
        <p>
          Vom Punkt <M>{'A(2 \\mid 3)'}</M> brauchst du zuerst nur <M>{'x = 2'}</M>. Setze ihn in die Gleichung ein:
        </p>
        <MB>{'y = 0{,}5 \\cdot 2 + 2'}</MB>
      </>
    ),
  },
  {
    title: <>Den y-Wert ausrechnen</>,
    body: <MB>{'y = 1 + 2 = 3'}</MB>,
  },
  {
    title: 'Mit der y-Koordinate des Rings vergleichen',
    body: (
      <>
        <MB>{'3 = 3'}</MB>
        <p>
          Berechnet: 3. Ring A hängt in 3 m Höhe. Gleich heißt: <M>A</M> liegt auf der Geraden, die Drohne trifft Ring A.
        </p>
      </>
    ),
  },
]

const LOESUNG = (
  <Loesungsweg
    schritte={[
      { titel: <>Ring B: <M>{'x = 5'}</M> einsetzen und vergleichen</>, tex: ['y = 0{,}5 \\cdot 5 + 2 = 4{,}5', '4{,}5 = 4{,}5'], text: 'Treffer.' },
      { titel: <>Ring D: <M>{'x = 8'}</M> einsetzen und vergleichen</>, tex: ['y = 0{,}5 \\cdot 8 + 2 = 6', '6 \\neq 7'], text: 'Kein Treffer, die Drohne fliegt 1 m unter der Ringmitte durch.' },
      { titel: <>Ring C: <M>{'x = 6'}</M> einsetzen und vergleichen</>, tex: ['y = 0{,}5 \\cdot 6 + 2 = 5', '5 \\neq 5{,}2'], text: 'Kein Treffer, nur 0,2 m daneben.' },
      { titel: 'Code für das Hangar-Tor', text: 'Die berechneten Höhen der Flugbahn bei B, D und C: 4,5 – 6 – 5.' },
    ]}
  />
)

/* ── Phase 4: Wer hat recht? ─────────────────────────────────────────────── */

function Plan({ name, tex }: { name: string; tex: string }) {
  return (
    <div className="lz-plan">
      <div className="lz-plan-name">Rechnung von {name}</div>
      <MB>{tex}</MB>
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function DrohneEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [tipps, setTipps] = useSitzungState<Tipps>('dr-tipps', {})
  const [geloest, setGeloest] = useSitzungState('dr-geloest', false)
  const [check4, setCheck4] = useSitzungState('dr-check4', false)
  const [uebungen, setUebungen] = useSitzungState<string[]>('dr-uebungen', [])
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
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich für den Parcours. Einzelarbeit, ca. 8 Minuten.</p>
          <McCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Koordinaten lesen"
            prompt={
              <p>
                Wo liegt der Punkt <M>{'P(4 \\mid 1)'}</M> im Koordinatensystem?
              </p>
            }
            options={[
              { text: '1 nach rechts und 4 nach oben', feedback: <>Die Koordinaten sind vertauscht. Zuerst kommt immer der x-Wert, dann der y-Wert.</> },
              { text: '4 nach rechts und 1 nach oben', correct: true, feedback: <>Die erste Zahl ist der x-Wert (waagerecht), die zweite der y-Wert (senkrecht).</> },
              { text: '4 nach links und 1 nach oben', feedback: <>Ein positiver x-Wert liegt rechts von der y-Achse.</> },
              { text: '4 nach rechts und 1 nach unten', feedback: <>Ein positiver y-Wert liegt oberhalb der x-Achse.</> },
            ]}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title={<>b) <M>x</M> einsetzen</>}
            prompt={
              <p>
                Gerade <M>{'y = 2x + 1'}</M>. Berechne den y-Wert für <M>{'x = 3'}</M>.
              </p>
            }
            fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 7 }]}
            solution={<MB>{'x = 3{:}\\quad y = 2 \\cdot 3 + 1 = 7'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title={<>c) Negatives <M>x</M> einsetzen</>}
            prompt={
              <p>
                Gerade <M>{'y = -x + 5'}</M>. Berechne den y-Wert für <M>{'x = -2'}</M>.
              </p>
            }
            fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 7 }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'In Klammern einsetzen', tex: 'y = -(-2) + 5' },
                  { titel: 'Minus mal minus ergibt plus', tex: 'y = 2 + 5 = 7' },
                ]}
              />
            }
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
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Mit Dezimalzahl einsetzen"
            prompt={
              <p>
                Gerade <M>{'y = 0{,}5x - 1'}</M>. Berechne den y-Wert für <M>{'x = -4'}</M>.
              </p>
            }
            fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: -3 }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Einsetzen', tex: 'y = 0{,}5 \\cdot (-4) - 1' },
                  { titel: 'Ausrechnen', tex: 'y = -2 - 1 = -3' },
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={3}
            title="e) Gleichung lösen"
            prompt={
              <p>
                Löse die Gleichung nach <M>x</M> auf.
              </p>
            }
            lead={<M>{'5 = 2x + 1 \\qquad \\Rightarrow'}</M>}
            fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 2 }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Die 1 wegbringen', tex: ['5 = 2x + 1 \\quad \\mid -1', '4 = 2x'] },
                  { titel: 'Durch 2 teilen', tex: ['4 = 2x \\quad \\mid :2', 'x = 2'] },
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Die Lichtshow fürs Schulfest',
      bedingung: 'Lege dich für alle vier Ringe fest, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Für das Schulfest plant die Technik-AG eine Lichtshow: Eine Drohne fliegt geradlinig durch vier Leuchtringe. Ein Treffer zählt nur, wenn die Drohne genau
            durch die Ringmitte fliegt. Die Ergebnisse ergeben den Code für das Hangar-Tor, hinter dem die Drohne startet.
          </p>
          <p className="sl-text">
            Die Flugbahn hat die Gleichung <M>{'y = 0{,}5x + 2'}</M> (<M>x</M> Entfernung, <M>y</M> Höhe in m). Gegeben sind die Mittelpunkte der vier Ringe. Gesucht ist,
            welche Ringe die Drohne trifft.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Lege dich fest, ohne zu rechnen</p>
            <p>Schau dir die Flugbahn und die Ringe an. Welche Ringe trifft die Drohne? Wähle für jeden Ring.</p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 5 Minuten.</p>
          <DrohnenBild />
          <Ampel
            tipps={tipps}
            onTipp={(id, t) => {
              const neu = { ...tipps, [id]: t }
              setTipps(neu)
              if (RINGE.every((r) => neu[r.id])) fertig()
            }}
          />
          {RINGE.every((r) => tipps[r.id]) && (
            <p className="sl-hinweis">Bei manchen Ringen ist es im Bild knapp. Gleich lernst du, wie du es sicher entscheidest.</p>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Den Code für das Hangar-Tor knacken',
      pflicht: ['ergebnis', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 20 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Prüfe die Ringe B, D und C</p>
            <p>
              Flugbahn: <M>{'y = 0{,}5x + 2'}</M>. Prüfe in deinem Heft für die Ringe <M>{'B(5 \\mid 4{,}5)'}</M>, <M>{'D(8 \\mid 7)'}</M> und <M>{'C(6 \\mid 5{,}2)'}</M>,
              wie hoch die Flugbahn an der Stelle des Rings ist und ob die Drohne die Ringmitte trifft. Die drei Höhen der Flugbahn ergeben den Code für das Hangar-Tor.
            </p>
          </div>
          <DrohnenBild ringe={RINGE.filter((r) => r.id !== 'A')} label="Koordinatensystem mit der Flugbahn y = 0,5x + 2 und den Ringen B(5 | 4,5), C(6 | 5,2) und D(8 | 7)" />
          <CodeSchloss offen={geloest} />
          <BeispielMitVideo video={VIDEO_PUNKTPROBE} videoTitel="Lernvideo: Punkt auf Gerade prüfen">
            <Beispiel offen title={<>Liegt Ring <M>{'A(2 \\mid 3)'}</M> auf der Flugbahn?</>} aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('ergebnis')()
                setGeloest(true)
              }}
              punkte={15}
              title="Der Code für das Hangar-Tor"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'yb', label: <>Wie hoch ist die Flugbahn bei Ring B (<M>{'x = 5'}</M>)?</>, expected: 4.5, unit: 'm' },
                { kind: 'select', key: 'b', label: 'Ring B: Die Drohne …', options: ['trifft die Mitte', 'trifft die Mitte nicht'], expected: 0 },
                { kind: 'num', key: 'yd', label: <>Wie hoch ist die Flugbahn bei Ring D (<M>{'x = 8'}</M>)?</>, expected: 6, unit: 'm' },
                { kind: 'select', key: 'd', label: 'Ring D: Die Drohne …', options: ['trifft die Mitte', 'trifft die Mitte nicht'], expected: 1 },
                { kind: 'num', key: 'yc', label: <>Wie hoch ist die Flugbahn bei Ring C (<M>{'x = 6'}</M>)?</>, expected: 5, unit: 'm' },
                { kind: 'select', key: 'c', label: 'Ring C: Die Drohne …', options: ['trifft die Mitte', 'trifft die Mitte nicht'], expected: 1 },
              ]}
              loesungNachFehler
              solution={LOESUNG}
              help={
                <Hilfen
                  steps={[
                    <>Wie im Rechenbeispiel: Von jedem Ring brauchst du zuerst nur die x-Koordinate.</>,
                    <>
                      Setze die x-Koordinate in <M>{'0{,}5x + 2'}</M> ein und rechne den y-Wert aus. Vergleiche ihn danach mit der y-Koordinate des Rings.
                    </>,
                    <>
                      Ring B: <M>{'0{,}5 \\cdot 5 + 2 = 4{,}5'}</M>, Ring B hängt bei <M>{'4{,}5'}</M>. Rechne D und C genauso.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Handlungsprodukt titel="Merkkarte „Punktprobe“">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={merkkarteBild}
                width={800}
                height={400}
                alt="Comic-Bild einer Karteikarte: Punktprobe mit drei Schritten: x-Wert einsetzen, y-Wert ausrechnen, mit dem Punkt vergleichen. Daneben eine Gerade mit einem Punkt darauf und einem Punkt daneben."
              />
            </figure>
            <p className="sl-text">
              Gestalte in deinem Heft oder auf einer Karteikarte eine Merkkarte „Punktprobe“. Schreibe die drei Schritte auf und rechne darauf einen Ring aus dem Parcours
              als Beispiel vor: einen, den die Drohne trifft, und einen, den sie verfehlt.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Schritt 1: Ich setze den x-Wert des Punkts in die Gleichung ein …“</li>
                <li>„Schritt 2: Ich rechne den y-Wert aus: …“</li>
                <li>„Schritt 3: Ist der berechnete y-Wert gleich der y-Koordinate, dann …, sonst …“</li>
                <li>„Vorsicht: Eingesetzt wird immer …, nicht …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Merkkarte vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien()} />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug tipps={tipps} />
              <Merke title="Punktprobe: Liegt ein Punkt auf der Geraden?">
                <ol>
                  <li>
                    Setze die <strong>x-Koordinate</strong> des Punkts in die Geradengleichung ein.
                  </li>
                  <li>
                    Berechne den <strong>y-Wert</strong>.
                  </li>
                  <li>
                    Vergleiche mit der <strong>y-Koordinate</strong> des Punkts: gleich heißt, der Punkt liegt auf der Geraden; verschieden heißt, er liegt nicht darauf.
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
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Wenn du alle gelöst hast, wartet unten ein Spiel auf dich. Einzelarbeit, ca. 15 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Welche Antwort stimmt?">
            <TrackedMc
              topic="Punkt auf Gerade prüfen (Lernsituation, Basis)"
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              title="Übung 1"
              level="basis"
              rechnen
              prompt={
                <p>
                  Liegt <M>{'P(-2 \\mid 7)'}</M> auf der Geraden <M>{'y = -2x + 3'}</M>?
                </p>
              }
              options={[
                { text: <>Nein: <M>{'-2 \\cdot (-2) + 3 = -1'}</M></>, feedback: <>Vorzeichenfehler: <M>{'-2 \\cdot (-2) = +4'}</M>, nicht <M>{'-4'}</M>.</> },
                { text: <>Nein: <M>{'-2 \\cdot 7 + 3 = -11'}</M></>, feedback: <>Hier wurde der y-Wert statt des x-Werts eingesetzt. Eingesetzt wird immer die x-Koordinate.</> },
                { text: <>Ja: <M>{'-2 \\cdot (-2) + 3 = 7'}</M></>, correct: true, feedback: <>Minus mal minus ergibt plus. Der berechnete y-Wert 7 passt zum Punkt.</> },
                { text: <>Nein: 7 ist nicht gleich 3</>, feedback: <>Die 3 ist nur der y-Achsenabschnitt. Du musst den x-Wert einsetzen und erst das Ergebnis vergleichen.</> },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              topic="Punkt auf Gerade prüfen (Lernsituation, Standard)"
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={5}
              title="Übung 2"
              level="standard"
              prompt={
                <>
                  <p>
                    Mia und Leon prüfen, ob <M>{'Q(3 \\mid 1)'}</M> auf der Geraden <M>{'y = -2x + 7'}</M> liegt. Wer hat recht?
                  </p>
                  <div className="lz-plaene">
                    <Plan name="Mia" tex={'\\begin{aligned} y &= -2 \\cdot 3 + 7 \\\\ y &= 1 \\\\ 1 &= 1 \\end{aligned}'} />
                    <Plan name="Leon" tex={'\\begin{aligned} y &= -2 \\cdot 1 + 7 \\\\ y &= 5 \\\\ 5 &\\neq 3 \\end{aligned}'} />
                  </div>
                </>
              }
              options={[
                { text: 'Leon, denn bei ihm kommt etwas anderes heraus.', feedback: 'Prüfe, welche Zahl Leon eingesetzt hat: Die 1 ist die y-Koordinate von Q, nicht die x-Koordinate.' },
                { text: 'Beide, man darf x oder y einsetzen.', feedback: 'Eingesetzt wird immer der x-Wert. Dann vergleicht man das Ergebnis mit dem y-Wert.' },
                { text: 'Mia: Sie setzt x = 3 ein und erhält y = 1, Q liegt auf der Geraden.', correct: true, feedback: 'Genau. Leon hat die y-Koordinate eingesetzt und sie dann mit der x-Koordinate verglichen.' },
                { text: 'Keiner, man muss den Punkt zeichnen.', feedback: 'Zeichnen ist ungenau. Die Rechnung entscheidet sicher, wie bei Ring C.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Punktprobe selbst rechnen">
            <TrackedCheck
              topic="Punkt auf Gerade prüfen (Lernsituation, Standard)"
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={5}
              title="Übung 3"
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
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: <><M>{'x = 4'}</M> einsetzen</>, tex: 'y = -1{,}5 \\cdot 4 + 4 = -6 + 4 = -2' },
                    { titel: 'Vergleichen', tex: '-2 \\neq -1', text: 'Q liegt nicht auf der Geraden.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Setze nur die x-Koordinate 4 ein.</>,
                    <>
                      <M>{'-1{,}5 \\cdot 4 = -6'}</M>. Dann <M>{'+4'}</M>.
                    </>,
                    <>
                      Du erhältst <M>{'-2'}</M>. Der Punkt hat aber <M>{'y = -1'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Die zweite Drohne">
            <TrackedCheck
              topic="Punkt auf Gerade prüfen (Lernsituation, Erweiterung)"
              onSolved={() => {
                setCheck4(true)
                uebung('4', fertig.teil('4'))()
              }}
              punkte={8}
              title="Übung 4"
              level="erweiterung"
              prompt={
                <>
                  <p>
                    Zweite Drohne: <M>{'y = -0{,}5x + 9'}</M>. Liegt <M>{'R(10 \\mid 4)'}</M> auf der Flugbahn? An welcher Stelle <M>x</M> muss der Ring{' '}
                    <M>{'S(x \\mid 6)'}</M> hängen, damit die Drohne ihn trifft?
                  </p>
                  <DrohnenBild
                    linie={{ m: -0.5, t: 9 }}
                    ringe={[{ id: 'R', x: 10, y: 4 }, ...(check4 ? [{ id: 'S', x: 6, y: 6 }] : [])]}
                    hoehe={check4 ? undefined : { y: 6, name: 'S' }}
                    label="Koordinatensystem mit der fallenden Flugbahn y = −0,5x + 9, dem Ring R(10 | 4) und einer gestrichelten Linie in 6 m Höhe für Ring S"
                  />
                </>
              }
              fieldsRow
              fields={[
                { kind: 'select', key: 'e', label: 'R liegt …', options: ['nicht auf der Flugbahn', 'auf der Flugbahn'], expected: 1 },
                { kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 6 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: <>Punktprobe für <M>R</M></>, tex: ['y = -0{,}5 \\cdot 10 + 9 = 4', '4 = 4'], text: 'R liegt auf der Flugbahn.' },
                    { titel: <>Für <M>S</M>: <M>{'y = 6'}</M> einsetzen</>, tex: '6 = -0{,}5x + 9' },
                    { titel: <>Nach <M>x</M> auflösen</>, tex: ['6 = -0{,}5x + 9 \\quad \\mid -9', '-3 = -0{,}5x \\quad \\mid :(-0{,}5)', 'x = 6'] },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>
                      Für <M>R</M> setzt du <M>{'x = 10'}</M> ein. Bei <M>S</M> kennst du die Höhe, also setzt du <M>{'y = 6'}</M> ein.
                    </>,
                    <>
                      <M>{'6 = -0{,}5x + 9'}</M>: Ziehe zuerst 9 ab.
                    </>,
                    <>
                      Teile durch <M>{'-0{,}5'}</M>. Minus durch minus ergibt plus.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Ring-Check">
            <RingCheck />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>Du kannst jetzt rechnerisch prüfen, ob ein Punkt auf einer Geraden liegt, und eine fehlende Koordinate berechnen. In den Übungsaufgaben trainierst du das weiter.</p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Punkt auf Gerade prüfen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell title="Punkt auf Gerade prüfen: Der Drohnen-Parcours" width="wide" kompakt parent={{ to: '/lineare_funktionen/punkt_gerade', label: 'Punkt auf Gerade prüfen' }}>
        <SeitenLernsituation
          ruhig
          punkte
          thema={THEMA}
          bildwelt={BILDWELT}
          ziel={<>Du planst die Drohnen-Show fürs Schulfest. Du lernst, wie du rechnerisch prüfst, ob ein Punkt auf einer Geraden liegt.</>}
          seiten={seiten}
        />
      </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Festlegung aus Phase 2: Tipp, Rechnung und Ergebnis je Ring */
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
