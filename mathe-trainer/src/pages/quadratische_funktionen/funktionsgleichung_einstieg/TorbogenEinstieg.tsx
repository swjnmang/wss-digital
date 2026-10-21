import { useId, useState, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, Vorgehen } from '../../daten_und_zufall/lernpfad/kit'
import { Arbeitsweise, CardHead, CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, McCard, Phase } from '../../lineare_funktionen/lernsituation_kit/kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './werkstatt.css'

// Lernsituation 1 „Der Torbogen für die Hofeinfahrt“: Funktionsgleichung aus Scheitelpunkt und einem weiteren Punkt (Fall 1, 45 min).
// Format Fehlerdetektiv, Look Werkstatt-Auftragsmappe (Metallbau), Lernprodukt analog (Spickzettel in drei Schritten).
// Instruktionsreihenfolge: Fehlerbeispiele zuerst. Die SuS kennen die Scheitelform f(x) = a(x − x_S)² + y_S und können sie in die
// allgemeine Form umwandeln; neu ist, a mit einem zweiten Punkt zu bestimmen. Drei ausgearbeitete Lösungen mit je einem typischen
// Fehler (Vorzeichen von x_S, (−2)² = −4, a nicht mit allen Summanden multipliziert) zeigen das Verfahren und die Stolperstellen.
// Aha: Jonas’ Gleichung besteht die Punktprobe mit dem linken Pfosten und ist trotzdem falsch. Eine Probe mit einem Punkt reicht nicht.
// Phasen: Aktivieren → Auftrag & Festlegung → Fehlerdetektiv → Austausch → Sichern → Check.
// Die Festlegung bleibt nur im Seitenzustand (kein Speichern).

/* ── Situation ───────────────────────────────────────────────────────────── */

// Hofeinfahrt 4 m breit, Pfosten 2 m hoch bei x = 0 und x = 4, höchster Punkt des Bogens 3 m über der Mitte.
// Richtig: f(x) = −0,25(x − 2)² + 3 = −0,25x² + x + 2
type Azubi = 'jonas' | 'elif' | 'mara'
type Plan = Azubi | 'soll'

const PLAENE: Record<Plan, { name: string; f: (x: number) => number; tex: string; farbe: string }> = {
  jonas: { name: 'Jonas', f: (x) => -0.25 * x * x - x + 2, tex: 'f(x) = -0{,}25x^2 - x + 2', farbe: 'var(--primary)' },
  elif: { name: 'Elif', f: (x) => 0.25 * x * x - x + 4, tex: 'f(x) = 0{,}25x^2 - x + 4', farbe: 'var(--hint)' },
  mara: { name: 'Mara', f: (x) => -0.25 * x * x - 4 * x + 7, tex: 'f(x) = -0{,}25x^2 - 4x + 7', farbe: 'var(--accent)' },
  soll: { name: 'richtige Gleichung', f: (x) => -0.25 * x * x + x + 2, tex: 'f(x) = -0{,}25x^2 + x + 2', farbe: 'var(--correct)' },
}

type Choice = Azubi | 'keiner'
type Prediction = { choice: Choice | null; saved: boolean }

const CHOICE_TEXT: Record<Choice, string> = {
  jonas: 'Jonas hat richtig gerechnet',
  elif: 'Elif hat richtig gerechnet',
  mara: 'Mara hat richtig gerechnet',
  keiner: 'Keine der drei Gleichungen stimmt',
}

/* ── Sachbild: Hofeinfahrt mit Torbogen ──────────────────────────────────── */

const S = { w: 640, h: 340, l: 44, r: 14, t: 12, b: 34, xMin: -4.5, xMax: 6.5, yMin: -0.6, yMax: 4.6 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)

const kurve = (f: (x: number) => number, von: number, bis: number) =>
  Array.from({ length: Math.round((bis - von) * 20) + 1 }, (_, i) => von + i / 20)
    .map((x) => `${bx(x)},${by(f(x))}`)
    .join(' ')

const SOLL_BOGEN = kurve(PLAENE.soll.f, 0, 4)

/** Skizze der Einfahrt; plan = Graph eines Plans über die Skizze legen */
function TorBild({ plan, masse = true }: { plan?: Plan | null; masse?: boolean }) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label="Skizze der Hofeinfahrt mit zwei Pfosten und einem parabelförmigen Torbogen im Koordinatensystem">
        <defs>
          <clipPath id={clip}>
            <rect x={bx(S.xMin)} y={S.t} width={bx(S.xMax) - bx(S.xMin)} height={by(S.yMin) - S.t} />
          </clipPath>
        </defs>
        {Array.from({ length: 11 }, (_, i) => i - 4).map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(0)} y2={by(S.yMax)} stroke="var(--grid)" />
            <text x={bx(v)} y={by(0) + 24} textAnchor="middle" fontSize="18" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {[1, 2, 3, 4].map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            <text x={bx(0) - 8} y={by(v) + 6} textAnchor="end" fontSize="18" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        <rect x={bx(S.xMin)} y={by(0)} width={bx(S.xMax) - bx(S.xMin)} height={by(S.yMin) - by(0)} fill="var(--surface-sunken)" />
        <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="3" />
        <line x1={bx(0)} x2={bx(0)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
        {/* Pfosten */}
        {[0, 4].map((x) => (
          <rect key={x} x={bx(x) - 7} y={by(2)} width="14" height={by(0) - by(2)} fill="var(--ink-muted)" stroke="var(--ink)" strokeWidth="2" />
        ))}
        {/* Torbogen laut Kundenwunsch (Skizze, gestrichelt) */}
        <polyline points={SOLL_BOGEN} fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray="8 6" />
        {plan && (
          <g clipPath={`url(#${clip})`}>
            <polyline points={kurve(PLAENE[plan].f, S.xMin, S.xMax)} fill="none" stroke={PLAENE[plan].farbe} strokeWidth="4.5" strokeLinecap="round" />
          </g>
        )}
        {masse && (
          <>
            <circle cx={bx(2)} cy={by(3)} r="7" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
            <text x={bx(2)} y={by(3) - 14} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--ink)">
              S(2 | 3)
            </text>
            <circle cx={bx(0)} cy={by(2)} r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
            <text x={bx(0) - 12} y={by(2) - 22} textAnchor="end" fontSize="18" fontWeight="700" fill="var(--ink)">
              P(0 | 2)
            </text>
            <circle cx={bx(4)} cy={by(2)} r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
            <text x={bx(4) + 12} y={by(2) - 12} fontSize="18" fontWeight="700" fill="var(--ink)">
              Q(4 | 2)
            </text>
          </>
        )}
        <text x={bx(S.xMax) - 4} y={by(0) - 8} textAnchor="end" fontSize="14" fill="var(--ink-muted)">
          Boden (x in m)
        </text>
      </svg>
    </div>
  )
}

/** Prüfstand: Pläne der Azubis über die Skizze legen */
function Pruefstand() {
  const [plan, setPlan] = useState<Plan | null>(null)
  return (
    <div className="lp-ex bk-panel">
      <CardHead title="Prüfstand: Plan über die Skizze legen" />
      <p>Tippe auf einen Namen. Dann wird die Parabel aus dem Plan über die gestrichelte Skizze des Kunden gelegt.</p>
      <div className="wm-pruefstand">
        {(['jonas', 'elif', 'mara'] as const).map((a) => (
          <button key={a} type="button" className="bk-btn bk-btn-sm" aria-pressed={plan === a} onClick={() => setPlan(plan === a ? null : a)}>
            Plan von {PLAENE[a].name}
          </button>
        ))}
      </div>
      <TorBild plan={plan} />
      {plan && (
        <div className="ls-readout">
          <div className="ls-readout-box ls-readout-a">
            <strong>{PLAENE[plan].name}:</strong> <M>{PLAENE[plan].tex}</M>
          </div>
        </div>
      )}
    </div>
  )
}

/** Prüfbericht eines Azubis mit nummerierten Rechenschritten */
function Bericht({ azubi, cls, rolle, zeilen }: { azubi: Azubi; cls: string; rolle: string; zeilen: string[][] }) {
  return (
    <div className={`wm-bericht ${cls}`}>
      <div className="wm-bericht-name">
        Plan von {PLAENE[azubi].name}
        <small>{rolle}</small>
      </div>
      <ul className="wm-zeilen">
        {zeilen.map((z, i) => (
          <li key={i}>
            <b>{i + 1}</b>
            <span>
              {z.map((t, j) => (
                <div key={j}>
                  <MB>{t}</MB>
                </div>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className="wm-ergebnis">
        An die Biegemaschine: <M>{PLAENE[azubi].tex}</M>
      </div>
    </div>
  )
}

const JA_NEIN = ['ja', 'nein']
const SCHRITTE = ['Schritt 1 (Scheitel einsetzen)', 'Schritt 2 (a berechnen)', 'Schritt 3 (umwandeln)']

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function TorbogenEinstieg({
  erklaerung,
  onBack,
  onPractice,
  onNext,
}: {
  erklaerung: ReactNode
  onBack: () => void
  onPractice: () => void
  onNext: () => void
}) {
  const [pred, setPred] = useState<Prediction>({ choice: null, saved: false })

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell
        title="Funktionsgleichung aufstellen"
        subtitle="Lernsituation 1: Der Torbogen für die Hofeinfahrt"
        width="wide"
        parent={{ to: '/quadratische_funktionen/funktionsgleichung_aufstellen', label: 'Funktionsgleichung aufstellen' }}
      >
        <div className="lp">
          <div>
            <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={onBack}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
            </button>
          </div>
          <div className="lp-goal">
            <i className="fa-solid fa-bullseye" aria-hidden="true" />
            <div>
              <strong>Das lernst du hier:</strong> Du stellst die Funktionsgleichung einer Parabel auf, wenn du den Scheitelpunkt und einen weiteren Punkt kennst. Dabei lernst du
              die typischen Fehler kennen und wie du sie mit einer Probe aufdeckst.
            </div>
          </div>
          <Arbeitsweise />

          {/* 1 Aktivieren */}
          <Phase no={1} title="Fit für den Start" social="EA" minutes={5}>
            <p>Diese vier kurzen Aufgaben brauchst du gleich. Löse sie allein.</p>
            <div className="lp-exlist">
              <McCard
                title="a) Scheitelpunkt ablesen"
                prompt={
                  <p>
                    Welchen Scheitelpunkt hat die Parabel <M>{'f(x) = -2(x - 1)^2 + 4'}</M>?
                  </p>
                }
                options={[
                  { text: 'S(1 | 4)', correct: true, feedback: 'In der Scheitelform f(x) = a(x − x_S)² + y_S steht x_S mit umgekehrtem Vorzeichen in der Klammer.' },
                  { text: 'S(−1 | 4)', feedback: 'In der Klammer steht x − 1. Das Minus gehört zur Formel, der Scheitel liegt also bei x = 1.' },
                  { text: 'S(4 | 1)', feedback: 'Die Koordinaten sind vertauscht. Die Zahl in der Klammer gehört zum x-Wert, die Zahl hinten zum y-Wert.' },
                  { text: 'S(−2 | 4)', feedback: 'Die −2 vor der Klammer ist der Streckfaktor a. Sie sagt, wie steil die Parabel ist, nicht wo der Scheitel liegt.' },
                ]}
              />
              <CheckCard
                title="b) Klammer ausmultiplizieren"
                prompt={
                  <p>
                    Schreibe <M>{'(x - 3)^2'}</M> ohne Klammer als <M>{'x^2 + bx + c'}</M>.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -6 },
                  { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 9 },
                ]}
                solution={<MB>{'(x - 3)^2 = (x - 3)(x - 3) = x^2 - 3x - 3x + 9 = x^2 - 6x + 9'}</MB>}
              />
              <CheckCard
                title="c) Punktprobe"
                prompt={
                  <p>
                    Liegt der Punkt <M>{'P(3 \\mid 8)'}</M> auf der Parabel <M>{'f(x) = (x - 1)^2 + 4'}</M>?
                  </p>
                }
                fields={[{ kind: 'select', key: 'p', label: 'Antwort', options: ['Ja', 'Nein'], expected: 0 }]}
                solution={<MB>{'f(3) = (3 - 1)^2 + 4 = 4 + 4 = 8 \\;\\checkmark'}</MB>}
              />
              <CheckCard
                title="d) Gleichung lösen"
                prompt={
                  <p>
                    Löse die Gleichung <M>{'7 = 4a + 3'}</M>.
                  </p>
                }
                fields={[{ kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: 1 }]}
                solution={<MB>{'\\begin{aligned} 7 &= 4a + 3 && \\mid -3 \\\\ 4 &= 4a && \\mid :4 \\\\ a &= 1 \\end{aligned}'}</MB>}
              />
            </div>
          </Phase>

          {/* 2 Auftrag & Festlegung */}
          <Phase no={2} title="Der Auftrag: ein Torbogen aus Stahl" social="EA" minutes={5}>
            <div className="wm-mappe">
              <span className="wm-reiter">Auftragsmappe 2026-117</span>
              <div className="wm-blatt">
                <div className="wm-kopf">
                  <div>
                    <span>Betrieb</span>Metallbau, Schlosserei
                  </div>
                  <div>
                    <span>Kunde</span>Familie Berger
                  </div>
                  <div>
                    <span>Bauteil</span>Torbogen Hofeinfahrt
                  </div>
                </div>
                <div className="wm-notiz">
                  <p>
                    Du machst eine Ausbildung zur Metallbauerin oder zum Metallbauer. Familie Berger möchte über ihrer 4 m breiten Hofeinfahrt einen Bogen aus Stahlrohr. Er sitzt
                    auf zwei Pfosten, die 2 m hoch sind. In der Mitte soll der Bogen 3 m hoch sein.
                  </p>
                  <p>
                    Die Biegemaschine braucht die Form des Bogens als Funktionsgleichung in der allgemeinen Form <M>{'f(x) = ax^2 + bx + c'}</M>. Der Nullpunkt liegt am Fuß des
                    linken Pfostens, 1 Kästchen = 1 m.
                  </p>
                </div>
                <TorBild />
                <p>
                  Drei Azubis aus deinem Betrieb haben schon gerechnet und ihre Pläne in die Mappe gelegt. Die Meisterin will wissen, welcher Plan an die Maschine darf. Ein falscher
                  Plan kostet ein ganzes Stahlrohr.
                </p>
                <div className="wm-berichte">
                  {(['jonas', 'elif', 'mara'] as const).map((a, i) => (
                    <div key={a} className={`wm-bericht wm-bericht-${'abc'[i]}`}>
                      <div className="wm-bericht-name">Plan von {PLAENE[a].name}</div>
                      <div className="wm-ergebnis">
                        <M>{PLAENE[a].tex}</M>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="ls-question">
              <i className="fa-solid fa-circle-question" aria-hidden="true" />
              <span>Welcher Plan darf an die Biegemaschine? Und wie stellt man die Gleichung des Bogens sicher richtig auf?</span>
            </div>

            <div className="lp-ex bk-panel" data-no-autocheck>
              <CardHead title="Deine Vermutung" />
              {pred.saved && pred.choice ? (
                <>
                  <div className="ls-saved" role="status">
                    <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: <strong>{CHOICE_TEXT[pred.choice]}</strong>. Am Ende schauen wir, ob du recht hattest.
                  </div>
                  <div>
                    <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setPred({ ...pred, saved: false })}>
                      Vermutung ändern
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>Rechne noch nicht! Schau dir die drei Gleichungen an und entscheide spontan. Schreibe einen Satz als Begründung in dein Heft.</p>
                  <div className="ls-options" role="radiogroup" aria-label="Vermutung">
                    {(['jonas', 'elif', 'mara', 'keiner'] as const).map((c) => (
                      <label key={c} className="bk-choice ls-option">
                        <input type="radio" name="tor-pred" checked={pred.choice === c} onChange={() => setPred({ ...pred, choice: c })} />
                        <span>{CHOICE_TEXT[c]}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <button type="button" className="bk-btn bk-btn-primary" disabled={!pred.choice} onClick={() => setPred({ ...pred, saved: true })}>
                      <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festhalten
                    </button>
                  </div>
                </>
              )}
            </div>
          </Phase>

          {/* 3 Fehlerdetektiv */}
          <Phase no={3} title="Prüft die drei Pläne" social="PA" minutes={17}>
            <p>
              <strong>Auftrag:</strong> Ihr seid zu zweit die Qualitätskontrolle. Lest die Rechenwege der drei Azubis genau, prüft sie und findet die Fehler. Jede Person tippt auf dem
              eigenen Gerät, ihr besprecht jede Antwort kurz miteinander.
            </p>
            <div className="wm-berichte">
              <Bericht
                azubi="jonas"
                cls="wm-bericht-a"
                rolle="2. Lehrjahr"
                zeilen={[
                  ['f(x) = a(x - x_S)^2 + y_S', 'f(x) = a(x + 2)^2 + 3'],
                  ['P(0 \\mid 2):\\; 2 = a(0 + 2)^2 + 3', '2 = 4a + 3 \\;\\Rightarrow\\; a = -0{,}25'],
                  ['f(x) = -0{,}25(x + 2)^2 + 3', '= -0{,}25(x^2 + 4x + 4) + 3', '= -0{,}25x^2 - x + 2'],
                ]}
              />
              <Bericht
                azubi="elif"
                cls="wm-bericht-b"
                rolle="1. Lehrjahr"
                zeilen={[
                  ['f(x) = a(x - x_S)^2 + y_S', 'f(x) = a(x - 2)^2 + 3'],
                  ['P(0 \\mid 2):\\; 2 = a(0 - 2)^2 + 3', '2 = -4a + 3 \\;\\Rightarrow\\; a = 0{,}25'],
                  ['f(x) = 0{,}25(x - 2)^2 + 3', '= 0{,}25(x^2 - 4x + 4) + 3', '= 0{,}25x^2 - x + 4'],
                ]}
              />
              <Bericht
                azubi="mara"
                cls="wm-bericht-c"
                rolle="3. Lehrjahr"
                zeilen={[
                  ['f(x) = a(x - x_S)^2 + y_S', 'f(x) = a(x - 2)^2 + 3'],
                  ['P(0 \\mid 2):\\; 2 = a(0 - 2)^2 + 3', '2 = 4a + 3 \\;\\Rightarrow\\; a = -0{,}25'],
                  ['f(x) = -0{,}25(x - 2)^2 + 3', '= -0{,}25x^2 - 4x + 4 + 3', '= -0{,}25x^2 - 4x + 7'],
                ]}
              />
            </div>

            <div className="lp-exlist">
              <CheckCard
                title="Spur 1: Punktprobe an beiden Pfosten"
                level="basis"
                prompt={
                  <>
                    <p>
                      Der Bogen muss oben auf beiden Pfosten sitzen, also durch <M>{'P(0 \\mid 2)'}</M> und <M>{'Q(4 \\mid 2)'}</M> gehen. Setzt <M>{'x = 0'}</M> und <M>{'x = 4'}</M> in die
                      Gleichung jedes Plans ein und prüft, ob 2 herauskommt.
                    </p>
                  </>
                }
                fieldsRow
                fields={[
                  { kind: 'select', key: 'jp', label: 'Jonas: P passt?', options: JA_NEIN, expected: 0 },
                  { kind: 'select', key: 'jq', label: 'Jonas: Q passt?', options: JA_NEIN, expected: 1 },
                  { kind: 'select', key: 'ep', label: 'Elif: P passt?', options: JA_NEIN, expected: 1 },
                  { kind: 'select', key: 'eq', label: 'Elif: Q passt?', options: JA_NEIN, expected: 1 },
                  { kind: 'select', key: 'mp', label: 'Mara: P passt?', options: JA_NEIN, expected: 1 },
                  { kind: 'select', key: 'mq', label: 'Mara: Q passt?', options: JA_NEIN, expected: 1 },
                ]}
                solution={
                  <>
                    <MB>{'\\text{Jonas: } f(0) = 2 \\;\\checkmark \\qquad f(4) = -0{,}25 \\cdot 16 - 4 + 2 = -6 \\;\\times'}</MB>
                    <MB>{'\\text{Elif: } f(0) = 4 \\;\\times \\qquad f(4) = 0{,}25 \\cdot 16 - 4 + 4 = 4 \\;\\times'}</MB>
                    <MB>{'\\text{Mara: } f(0) = 7 \\;\\times \\qquad f(4) = -0{,}25 \\cdot 16 - 16 + 7 = -13 \\;\\times'}</MB>
                    <p>Kein Plan geht durch beide Pfosten. Jonas’ Plan passt nur am linken Pfosten.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Ein Punkt liegt auf der Parabel, wenn beim Einsetzen seines x-Werts genau sein y-Wert herauskommt.</>,
                      <>
                        Nehmt die Gleichung, die an die Biegemaschine gehen soll (die letzte Zeile), und rechnet <M>{'f(0)'}</M> und <M>{'f(4)'}</M> aus. Kommt 2 heraus, passt der Punkt.
                      </>,
                      <>
                        Bei Jonas: <M>{'f(0) = -0{,}25 \\cdot 0^2 - 0 + 2 = 2'}</M>, also passt P. Jetzt <M>{'f(4) = -0{,}25 \\cdot 4^2 - 4 + 2'}</M> ausrechnen.
                      </>,
                    ]}
                  />
                }
              />
              <Pruefstand />
              <McCard
                title="Moment mal: Jonas’ Plan"
                prompt={
                  <p>
                    Jonas sagt: „Ich habe die Probe mit dem Pfosten <M>{'P(0 \\mid 2)'}</M> gemacht, sie stimmt. Also ist mein Plan richtig.“ Schaut euch seinen Plan auf dem Prüfstand an. Was
                    stimmt?
                  </p>
                }
                options={[
                  {
                    text: 'Die Probe mit P reicht nicht. Durch einen Punkt gehen viele Parabeln. Jonas muss auch prüfen, ob der Scheitel stimmt oder ob Q passt.',
                    correct: true,
                    feedback: 'Genau. Jonas hat P selbst zum Berechnen von a benutzt, deshalb passt P automatisch. Sein Scheitel liegt aber bei (−2 | 3), also 4 m zu weit links.',
                  },
                  { text: 'Jonas hat recht, eine stimmende Probe beweist, dass die Gleichung richtig ist.', feedback: 'Auf dem Prüfstand seht ihr: Seine Parabel hat ihren höchsten Punkt links von der Einfahrt. Am rechten Pfosten liegt sie bei −6.' },
                  { text: 'Die Probe ist falsch, weil man immer mit dem Scheitelpunkt testen muss.', feedback: 'Die Probe mit P ist richtig gerechnet. Sie ist nur nicht genug, weil P schon zum Berechnen von a benutzt wurde.' },
                  { text: 'Der Plan ist richtig, nur der Bogen ist zu klein.', feedback: 'Der Bogen hat die richtige Höhe 3 m, aber an der falschen Stelle: bei x = −2 statt bei x = 2.' },
                ]}
              />
              <CheckCard
                title="Spur 2: Wo steckt der Fehler?"
                level="standard"
                rechnen={false}
                prompt={
                  <p>
                    Jeder Plan hat genau einen Fehler. Vergleicht die Rechenwege Zeile für Zeile. In welchem Schritt hat sich die Person verrechnet? Schreibt den Fehler mit einem Satz ins
                    Heft.
                  </p>
                }
                fields={[
                  { kind: 'select', key: 'j', label: 'Fehler bei Jonas', options: SCHRITTE, expected: 0 },
                  { kind: 'select', key: 'e', label: 'Fehler bei Elif', options: SCHRITTE, expected: 1 },
                  { kind: 'select', key: 'm', label: 'Fehler bei Mara', options: SCHRITTE, expected: 2 },
                ]}
                solution={
                  <>
                    <p>
                      <strong>Jonas, Schritt 1:</strong> Bei <M>{'S(2 \\mid 3)'}</M> heißt die Klammer <M>{'(x - 2)'}</M>, nicht <M>{'(x + 2)'}</M>. In der Scheitelform steht{' '}
                      <M>{'x - x_S'}</M>, das Minus gehört zur Formel.
                    </p>
                    <p>
                      <strong>Elif, Schritt 2:</strong> <M>{'(0 - 2)^2 = (-2)^2 = 4'}</M>, nicht <M>{'-4'}</M>. Ein Quadrat ist nie negativ. Darum kommt bei ihr ein positives a heraus, und
                      der Bogen hängt durch wie eine Schaukel.
                    </p>
                    <p>
                      <strong>Mara, Schritt 3:</strong> Sie hat nur <M>{'x^2'}</M> mit <M>{'-0{,}25'}</M> multipliziert. Richtig ist{' '}
                      <M>{'-0{,}25(x^2 - 4x + 4) + 3 = -0{,}25x^2 + x - 1 + 3'}</M>.
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Schaut zuerst in Schritt 1: Haben alle den Scheitelpunkt gleich eingesetzt? Wer weicht ab?</>,
                      <>
                        In Schritt 2 lohnt sich ein Blick auf das Quadrat: Was ergibt <M>{'(-2)^2'}</M>? In Schritt 3: Wird jeder Summand in der Klammer mit a multipliziert?
                      </>,
                      <>
                        Jonas schreibt <M>{'(x + 2)^2'}</M>, obwohl <M>{'x_S = 2'}</M> ist. Sein Fehler steckt also in Schritt 1. Sucht bei Elif und Mara genauso.
                      </>,
                    ]}
                  />
                }
              />
            </div>

            <div className="lp-ex bk-panel">
              <CardHead title="Infokarte: So stellst du die Gleichung aus dem Scheitelpunkt auf" />
              <Vorgehen
                title="So gehst du vor"
                steps={[
                  <>
                    <strong>Scheitelpunkt einsetzen:</strong> <M>{'x_S'}</M> und <M>{'y_S'}</M> in <M>{'f(x) = a(x - x_S)^2 + y_S'}</M> einsetzen. Achtung beim Vorzeichen in der Klammer.
                  </>,
                  <>
                    <strong>Punkt einsetzen und a berechnen:</strong> Den zweiten Punkt für <M>x</M> und <M>{'f(x)'}</M> einsetzen. Erst das Quadrat ausrechnen, dann nach <M>a</M> auflösen.
                  </>,
                  <>
                    <strong>Umwandeln:</strong> Die Klammer mit der binomischen Formel auflösen, dann <strong>jeden</strong> Summanden mit <M>a</M> multiplizieren und zusammenfassen.
                  </>,
                  <>
                    <strong>Probe:</strong> Mit einem Punkt prüfen, den du noch nicht zum Rechnen benutzt hast, z. B. dem Scheitelpunkt oder einem symmetrischen Punkt.
                  </>,
                ]}
              />
              <Beispiel
                title="Andere Zahlen: S(−1 | 5) und P(1 | 3)"
                aufgabe={
                  <p>
                    Eine Parabel hat den Scheitelpunkt <M>{'S(-1 \\mid 5)'}</M> und geht durch <M>{'P(1 \\mid 3)'}</M>. Bestimme die Gleichung in allgemeiner Form.
                  </p>
                }
                steps={[
                  { title: 'Scheitelpunkt einsetzen', body: <MB>{'f(x) = a(x - (-1))^2 + 5 = a(x + 1)^2 + 5'}</MB> },
                  {
                    title: 'Punkt einsetzen und a berechnen',
                    body: <MB>{'\\begin{aligned} 3 &= a(1 + 1)^2 + 5 \\\\ 3 &= 4a + 5 && \\mid -5 \\\\ -2 &= 4a && \\mid :4 \\\\ a &= -0{,}5 \\end{aligned}'}</MB>,
                  },
                  {
                    title: 'Umwandeln',
                    body: <MB>{'\\begin{aligned} f(x) &= -0{,}5(x + 1)^2 + 5 \\\\ &= -0{,}5(x^2 + 2x + 1) + 5 \\\\ &= -0{,}5x^2 - x - 0{,}5 + 5 \\\\ &= -0{,}5x^2 - x + 4{,}5 \\end{aligned}'}</MB>,
                  },
                  {
                    title: 'Probe mit einem neuen Punkt',
                    body: (
                      <p>
                        Symmetrisch zu P liegt <M>{'(-3 \\mid 3)'}</M>: <M>{'f(-3) = -0{,}5 \\cdot 9 + 3 + 4{,}5 = 3'}</M> ✓
                      </p>
                    ),
                  },
                ]}
              />
              <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
            </div>

            <div className="lp-exlist">
              <CheckCard
                title="Jetzt ihr: der richtige Plan"
                level="standard"
                prompt={
                  <p>
                    Stellt die Gleichung des Torbogens selbst richtig auf: Scheitelpunkt <M>{'S(2 \\mid 3)'}</M>, Pfosten <M>{'P(0 \\mid 2)'}</M>. Gebt erst <M>a</M> an und dann die
                    allgemeine Form <M>{'f(x) = ax^2 + bx + c'}</M>. Macht zum Schluss die Probe mit <M>{'Q(4 \\mid 2)'}</M>.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -0.25 },
                  { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: 1 },
                  { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 2 },
                ]}
                solution={
                  <>
                    <MB>{'f(x) = a(x - 2)^2 + 3'}</MB>
                    <MB>{'\\begin{aligned} 2 &= a(0 - 2)^2 + 3 \\\\ 2 &= 4a + 3 && \\mid -3 \\\\ -1 &= 4a && \\mid :4 \\\\ a &= -0{,}25 \\end{aligned}'}</MB>
                    <MB>{'\\begin{aligned} f(x) &= -0{,}25(x - 2)^2 + 3 \\\\ &= -0{,}25(x^2 - 4x + 4) + 3 \\\\ &= -0{,}25x^2 + x - 1 + 3 \\\\ &= -0{,}25x^2 + x + 2 \\end{aligned}'}</MB>
                    <p>
                      Probe: <M>{'f(4) = -0{,}25 \\cdot 16 + 4 + 2 = 2'}</M> ✓. Der Bogen sitzt auf beiden Pfosten.
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Ihr kennt die Fehler der drei Azubis. Macht es wie sie, aber vermeidet in jedem Schritt den Fehler, den ihr gefunden habt.</>,
                      <>
                        Schritt 1 und 2 hat Mara richtig gemacht. Rechnet ab <M>{'f(x) = -0{,}25(x - 2)^2 + 3'}</M> selbst weiter.
                      </>,
                      <>
                        <M>{'(x - 2)^2 = x^2 - 4x + 4'}</M>. Jetzt jeden Summanden mit <M>{'-0{,}25'}</M> multiplizieren: <M>{'-0{,}25 \\cdot x^2'}</M>, <M>{'-0{,}25 \\cdot (-4x)'}</M> und{' '}
                        <M>{'-0{,}25 \\cdot 4'}</M>.
                      </>,
                    ]}
                  />
                }
              />
              <CheckCard
                title="Sonderwunsch: Der Bogen soll höher werden"
                level="erweiterung"
                prompt={
                  <p>
                    Familie Berger ruft an: Der Bogen soll in der Mitte 3,5 m hoch sein, die Pfosten bleiben 2 m hoch. Berechnet das neue <M>a</M>. Wird der Bogen dadurch steiler oder
                    flacher? Begründet im Heft, wie sich <M>a</M> verändert hat.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -0.375 },
                  { kind: 'select', key: 's', label: 'Der Bogen wird …', options: ['steiler', 'flacher'], expected: 0 },
                ]}
                solution={
                  <>
                    <MB>{'\\begin{aligned} 2 &= a(0 - 2)^2 + 3{,}5 \\\\ 2 &= 4a + 3{,}5 && \\mid -3{,}5 \\\\ -1{,}5 &= 4a && \\mid :4 \\\\ a &= -0{,}375 \\end{aligned}'}</MB>
                    <p>
                      Vorher war <M>{'a = -0{,}25'}</M>. Der Betrag von <M>a</M> ist größer geworden, also ist die Parabel schmaler und steiler.
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Welcher Punkt ändert sich, welcher bleibt gleich? Der Scheitel liegt jetzt höher, der Pfosten bleibt bei P(0 | 2).</>,
                      <>
                        Neuer Ansatz: <M>{'f(x) = a(x - 2)^2 + 3{,}5'}</M>. Setzt P ein und löst nach a auf.
                      </>,
                      <>
                        <M>{'2 = 4a + 3{,}5'}</M>. Vergleicht danach den Betrag des neuen a mit 0,25: Größerer Betrag heißt schmalere Parabel.
                      </>,
                    ]}
                  />
                }
              />
            </div>
          </Phase>

          {/* 4 Austausch */}
          <Phase no={4} title="Vergleicht eure Prüfberichte" social="Plenum" minutes={4}>
            <div className="ls-stop">
              <div className="ls-stop-title">
                <i className="fa-solid fa-hand" aria-hidden="true" /> Stopp: Besprecht eure Ergebnisse mit der Klasse.
              </div>
              <ul>
                <li>Welcher Fehler war am schwersten zu finden? Warum?</li>
                <li>Warum hat Jonas’ Probe gestimmt, obwohl sein Plan falsch ist?</li>
                <li>Woran erkennt man schon vor dem Rechnen, dass a beim Torbogen negativ sein muss?</li>
              </ul>
            </div>
            <p>
              <strong>Du arbeitest allein?</strong> So haben zwei andere Azubis geprüft. Klappe die Wege auf und vergleiche sie mit deinem.
            </p>
            <div className="ls-ways">
              <details className="ls-way">
                <summary>Leon hat nur auf das Vorzeichen von a geschaut</summary>
                <div className="ls-way-body">
                  <p>„Der Bogen ist oben rund und hängt nicht durch, also muss a negativ sein. Elif hat a = 0,25, das kann nicht stimmen.“</p>
                  <p>
                    <strong>Gut:</strong> Ein schneller Plausibilitäts-Check ohne Rechnung. <strong>Aber:</strong> Jonas und Mara haben auch ein negatives a. Ihre Fehler findet Leon so
                    nicht.
                  </p>
                </div>
              </details>
              <details className="ls-way">
                <summary>Sophie hat beide Pfosten geprüft</summary>
                <div className="ls-way-body">
                  <p>„Ich habe f(0) und f(4) ausgerechnet. Da muss beide Male 2 herauskommen, weil der Bogen auf beiden Pfosten sitzt. Bei allen drei Plänen ging das schief.“</p>
                  <p>
                    <strong>Gut:</strong> Die Probe mit Q deckt auch Jonas’ Fehler auf, weil er Q nicht zum Rechnen benutzt hat. <strong>Aber:</strong> Man weiß dann noch nicht, in welchem
                    Schritt der Fehler steckt. Dafür muss man den Rechenweg lesen.
                  </p>
                </div>
              </details>
            </div>
            <p>
              Am sichersten ist beides: auf Vorzeichen und Scheitel achten <strong>und</strong> mit einem neuen Punkt die Probe machen.
            </p>
          </Phase>

          {/* 5 Sichern */}
          <Phase no={5} title="Das hältst du fest" social="EA" minutes={7}>
            <Rueckbezug pred={pred} />
            <div className="wm-mappe">
              <span className="wm-reiter">Auftragsmappe 2026-117</span>
              <div className="wm-blatt">
                <span className="wm-stempel">Freigegeben</span>
                <p>
                  An die Biegemaschine geht: <M>{'f(x) = -0{,}25x^2 + x + 2'}</M>, in Scheitelform <M>{'f(x) = -0{,}25(x - 2)^2 + 3'}</M>.
                </p>
                <TorBild plan="soll" />
              </div>
            </div>
            <Merke title="Funktionsgleichung aus Scheitelpunkt und einem Punkt (Fall 1)">
              <ol>
                <li>
                  Scheitelpunkt in die Scheitelform einsetzen: <M>{'f(x) = a(x - x_S)^2 + y_S'}</M>.
                </li>
                <li>
                  Den zweiten Punkt für <M>x</M> und <M>{'f(x)'}</M> einsetzen und nach <M>a</M> auflösen.
                </li>
                <li>
                  In die allgemeine Form <M>{'f(x) = ax^2 + bx + c'}</M> umwandeln: binomische Formel, dann jeden Summanden mit <M>a</M> multiplizieren.
                </li>
                <li>Probe mit einem Punkt, den du noch nicht benutzt hast.</li>
              </ol>
            </Merke>
            <div className="lp-ex bk-panel">
              <CardHead title="Dein Spickzettel (Lernprodukt)" />
              <p>Gestalte eine Karteikarte „Gleichung aus dem Scheitelpunkt aufstellen“. Sie darf genau eine Karteikarte füllen. Hake ab, was du schon hast:</p>
              <div className="ls-criteria">
                {[
                  'Die drei Schritte in der richtigen Reihenfolge, jeder mit einem kurzen Merksatz',
                  'Bei jedem Schritt eine Warnung vor dem typischen Fehler (Vorzeichen in der Klammer, Quadrat negativer Zahlen, a mal jeden Summanden)',
                  'Ein eigenes Beispiel mit anderen Zahlen und Probe',
                  'Eine kleine Skizze, an der man das Vorzeichen von a erkennt',
                ].map((c) => (
                  <label key={c}>
                    <input type="checkbox" /> <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
          </Phase>

          {/* 6 Check */}
          <Phase no={6} title="Check: Hast du es verstanden?" social="EA" minutes={7}>
            <div className="lp-exlist">
              <McCard
                title="Check 1: Der richtige Ansatz"
                level="basis"
                prompt={
                  <p>
                    Eine Parabel hat den Scheitelpunkt <M>{'S(-1 \\mid 4)'}</M>. Mit welchem Ansatz startest du?
                  </p>
                }
                options={[
                  { text: 'f(x) = a(x − 1)² + 4', feedback: 'Vorsicht mit dem Vorzeichen: x − x_S = x − (−1) = x + 1.' },
                  { text: 'f(x) = a(x + 1)² + 4', correct: true, feedback: 'x − (−1) wird zu x + 1. Der y-Wert 4 steht hinten.' },
                  { text: 'f(x) = a(x + 4)² − 1', feedback: 'Die Koordinaten sind vertauscht. In die Klammer gehört der x-Wert des Scheitels, hinten steht der y-Wert.' },
                  { text: 'f(x) = −1(x − 4)² + a', feedback: 'Der Scheitelpunkt ist kein Streckfaktor. a ist die unbekannte Zahl vor der Klammer.' },
                ]}
              />
              <CheckCard
                title="Check 2: Gleichung aufstellen"
                level="standard"
                prompt={
                  <p>
                    Eine Parabel hat den Scheitelpunkt <M>{'S(1 \\mid -2)'}</M> und geht durch <M>{'P(3 \\mid 6)'}</M>. Bestimme <M>a</M> und die allgemeine Form{' '}
                    <M>{'f(x) = ax^2 + bx + c'}</M>.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: 2 },
                  { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -4 },
                  { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 0 },
                ]}
                solution={
                  <>
                    <MB>{'\\begin{aligned} 6 &= a(3 - 1)^2 - 2 \\\\ 6 &= 4a - 2 && \\mid +2 \\\\ 8 &= 4a && \\mid :4 \\\\ a &= 2 \\end{aligned}'}</MB>
                    <MB>{'\\begin{aligned} f(x) &= 2(x - 1)^2 - 2 \\\\ &= 2(x^2 - 2x + 1) - 2 \\\\ &= 2x^2 - 4x + 2 - 2 \\\\ &= 2x^2 - 4x \\end{aligned}'}</MB>
                    <p>
                      Es ist also <M>{'c = 0'}</M>. Probe mit dem symmetrischen Punkt <M>{'(-1 \\mid 6)'}</M>: <M>{'f(-1) = 2 + 4 = 6'}</M> ✓
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Gehe wie auf deinem Spickzettel vor: erst der Scheitelpunkt, dann der Punkt P, dann umwandeln.</>,
                      <>
                        Ansatz: <M>{'f(x) = a(x - 1)^2 - 2'}</M>. Setze <M>{'x = 3'}</M> und <M>{'f(x) = 6'}</M> ein.
                      </>,
                      <>
                        <M>{'6 = 4a - 2'}</M> ergibt <M>{'a = 2'}</M>. Danach <M>{'2(x^2 - 2x + 1) - 2'}</M> ausmultiplizieren.
                      </>,
                    ]}
                  />
                }
              />
              <McCard
                title="Check 3: Wer hat richtig umgewandelt?"
                level="standard"
                rechnen
                prompt={
                  <p>
                    Wandle <M>{'f(x) = -0{,}5(x + 2)^2 + 1'}</M> in die allgemeine Form um.
                  </p>
                }
                options={[
                  { text: 'f(x) = −0,5x² − 1', feedback: 'Hier wurde (x + 2)² = x² + 4 gerechnet. Es fehlt das Mittelglied: (x + 2)² = x² + 4x + 4.' },
                  { text: 'f(x) = −0,5x² + 4x + 5', feedback: 'Nur x² wurde mit −0,5 multipliziert, so wie bei Mara. Jeder Summand in der Klammer muss mal −0,5 genommen werden.' },
                  { text: 'f(x) = −0,5x² − 2x − 1', correct: true, feedback: '−0,5(x² + 4x + 4) + 1 = −0,5x² − 2x − 2 + 1 = −0,5x² − 2x − 1.' },
                  { text: 'f(x) = −0,5x² − 2x + 3', feedback: 'Fast: −0,5 · 4 ist −2, nicht +2. Dann ergibt sich −2 + 1 = −1.' },
                ]}
              />
              <CheckCard
                title="Check 4: Passt der Transporter durch?"
                level="erweiterung"
                prompt={
                  <p>
                    Ein Transporter ist 1,8 m breit und 2,6 m hoch. Er fährt genau mittig durch den Torbogen <M>{'f(x) = -0{,}25x^2 + x + 2'}</M>. Wie hoch ist der Bogen über den
                    Außenkanten des Transporters? Passt er durch? Begründe im Heft mit einer Skizze.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'h', label: 'Höhe des Bogens', unit: 'm', expected: 2.7975, tol: 0.006 },
                  { kind: 'select', key: 'p', label: 'Passt er durch?', options: ['ja', 'nein'], expected: 0 },
                ]}
                solution={
                  <>
                    <p>
                      Die Mitte der Einfahrt ist bei <M>{'x = 2'}</M>. Die Außenkanten liegen 0,9 m links und rechts davon, bei <M>{'x = 1{,}1'}</M> und <M>{'x = 2{,}9'}</M>.
                    </p>
                    <MB>{'f(1{,}1) = -0{,}25 \\cdot 1{,}1^2 + 1{,}1 + 2 = -0{,}3025 + 3{,}1 = 2{,}7975 \\approx 2{,}80'}</MB>
                    <p>Wegen der Symmetrie ist der Bogen bei x = 2,9 genauso hoch. 2,80 m &gt; 2,6 m, der Transporter passt mit etwa 20 cm Luft durch.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Zeichne den Transporter als Rechteck mittig unter den Bogen. An welchen Stellen x wird es am engsten?</>,
                      <>Am engsten ist es an den oberen Ecken des Transporters. Sie liegen eine halbe Breite links und rechts von der Mitte x = 2.</>,
                      <>
                        Die linke Ecke liegt bei <M>{'x = 2 - 0{,}9 = 1{,}1'}</M>. Berechne <M>{'f(1{,}1)'}</M> und vergleiche mit 2,6 m.
                      </>,
                    ]}
                  />
                }
              />
            </div>
          </Phase>

          <nav className="lp-nav" aria-label="Weiter">
            <button type="button" className="bk-btn" onClick={onBack}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
            </button>
            <button type="button" className="bk-btn" onClick={onPractice}>
              Weiter üben: Fall 1 <i className="fa-solid fa-dumbbell" aria-hidden="true" />
            </button>
            <button type="button" className="bk-btn bk-btn-primary" onClick={onNext}>
              Zu Lernsituation 2 <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Vermutung aus Abschnitt 2 */
function Rueckbezug({ pred }: { pred: Prediction }) {
  if (!pred.saved || !pred.choice) {
    return (
      <div className="ls-back">
        <p>Du hast in Abschnitt 2 noch keine Vermutung festgehalten. Hole das kurz nach, dann siehst du hier, ob du richtig lagst.</p>
      </div>
    )
  }
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {CHOICE_TEXT[pred.choice]}.
      </p>
      <p>
        {pred.choice === 'keiner' ? (
          <>Das stimmt: Jeder der drei Pläne hatte einen Fehler. Gut aufgepasst!</>
        ) : (
          <>
            Tatsächlich hatte jeder Plan einen Fehler, auch der von {PLAENE[pred.choice].name}.{' '}
            {pred.choice === 'jonas' && 'Sein Plan wirkt richtig, weil er durch den linken Pfosten geht, aber der Scheitel liegt an der falschen Stelle.'}
            {pred.choice === 'elif' && 'Ihr Bogen hängt durch, weil (−2)² bei ihr negativ wurde.'}
            {pred.choice === 'mara' && 'Ihre Scheitelform stimmt, aber beim Umwandeln hat sie nicht jeden Summanden mit a multipliziert.'}
          </>
        )}
      </p>
      <p>Die Probe mit einem zweiten, noch nicht benutzten Punkt hätte jeden der drei Fehler aufgedeckt.</p>
    </div>
  )
}
