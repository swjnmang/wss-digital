import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, Vorgehen, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { Arbeitsweise, CardHead, CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, McCard, Phase, tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './werkstatt.css'

// Lernsituation 1 „Der Torbogen für die Hofeinfahrt“: Funktionsgleichung aus Scheitelpunkt und einem weiteren Punkt (Fall 1, 45 min).
// Format Experimentierlabor mit Fehlerdetektiv im Check, Look Werkstatt-Auftragsmappe (Metallbau), Lernprodukt analog (Spickzettel).
// Instruktionsreihenfolge: Problem zuerst. Die SuS kennen die Scheitelform y = a(x − x_S)² + y_S und können sie in die allgemeine
// Form umwandeln. Neu ist, a mit einem zweiten Punkt zu bestimmen: Sie setzen den Scheitel ein, suchen a erst am Regler und
// berechnen es dann, indem sie den Pfosten einsetzen. Erst danach fasst eine Infokarte das Vorgehen zusammen.
// Aha: Ist a über den linken Pfosten bestimmt, sitzt der Bogen automatisch auch auf dem rechten Pfosten (Symmetrie).
// Fehlerhafte Azubi-Pläne kommen erst im Check, wenn die SuS den Weg selbst gerechnet haben.
// Phasen: Aktivieren → Auftrag & Festlegung → Erkunden & Berechnen → Austausch → Sichern → Check.
// Die Festlegung bleibt nur im Seitenzustand (kein Speichern).

/* ── Situation ───────────────────────────────────────────────────────────── */

// Hofeinfahrt 4 m breit, Pfosten 2 m hoch bei x = 0 und x = 4, höchster Punkt des Bogens 3 m über der Mitte.
// Richtig: y = −0,25(x − 2)² + 3 = −0,25x² + x + 2
const A_SOLL = -0.25
const bogen = (a: number) => (x: number) => a * (x - 2) ** 2 + 3

type Choice = 'reicht' | 'punkt' | 'zwei'
type Prediction = { choice: Choice | null; a: number; saved: boolean }

const CHOICE_TEXT: Record<Choice, string> = {
  reicht: 'Der Scheitelpunkt reicht, damit liegt der Bogen fest',
  punkt: 'Man braucht zusätzlich einen Pfosten',
  zwei: 'Man braucht zusätzlich beide Pfosten',
}

/* ── Sachbild: Hofeinfahrt mit Torbogen ──────────────────────────────────── */

const S = { w: 640, h: 340, l: 44, r: 14, t: 12, b: 34, xMin: -1.5, xMax: 5.5, yMin: -0.6, yMax: 4.6 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)

const kurve = (f: (x: number) => number, von: number, bis: number) =>
  Array.from({ length: Math.round((bis - von) * 20) + 1 }, (_, i) => von + i / 20)
    .map((x) => `${bx(x)},${by(f(x))}`)
    .join(' ')

const SOLL_BOGEN = kurve(bogen(A_SOLL), 0, 4)

/** Skizze der Einfahrt; f = Parabel (z. B. vom Regler) über die gestrichelte Skizze legen */
function TorBild({ f, farbe = 'var(--primary)' }: { f?: (x: number) => number; farbe?: string }) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label="Skizze der Hofeinfahrt mit zwei Pfosten und einem parabelförmigen Torbogen im Koordinatensystem">
        <defs>
          <clipPath id={clip}>
            <rect x={bx(S.xMin)} y={S.t} width={bx(S.xMax) - bx(S.xMin)} height={by(S.yMin) - S.t} />
          </clipPath>
        </defs>
        {Array.from({ length: 6 }, (_, i) => i - 1).map((v) => (
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
        {[0, 4].map((x) => (
          <rect key={x} x={bx(x) - 7} y={by(2)} width="14" height={by(0) - by(2)} fill="var(--ink-muted)" stroke="var(--ink)" strokeWidth="2" />
        ))}
        <polyline points={SOLL_BOGEN} fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray="8 6" />
        {f && (
          <g clipPath={`url(#${clip})`}>
            <polyline points={kurve(f, S.xMin, S.xMax)} fill="none" stroke={farbe} strokeWidth="4.5" strokeLinecap="round" />
          </g>
        )}
        <circle cx={bx(2)} cy={by(3)} r="7" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
        <text x={bx(2)} y={by(3) - 14} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--ink)">
          S(2 | 3)
        </text>
        <circle cx={bx(0)} cy={by(2)} r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
        <text x={bx(0) - 12} y={by(2) - 22} textAnchor="end" fontSize="18" fontWeight="700" fill="var(--ink)">
          P(0 | 2)
        </text>
        <circle cx={bx(4)} cy={by(2)} r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
        <text x={bx(4) + 12} y={by(2) - 22} fontSize="18" fontWeight="700" fill="var(--ink)">
          Q(4 | 2)
        </text>
        <text x={bx(S.xMax) - 4} y={by(0) - 8} textAnchor="end" fontSize="14" fill="var(--ink-muted)">
          Boden (x in m)
        </text>
      </svg>
    </div>
  )
}

/** Regler für a: Bogen y = a(x − 2)² + 3 über die Skizze legen */
function ReglerA() {
  const sliderId = useId()
  const [a, setA] = useState(-1)
  const f = bogen(a)
  return (
    <div className="lp-ex bk-panel">
      <CardHead title="Schritt 2: a am Regler suchen" level="basis" />
      <div className="lp-ex-prompt">
        <p>
          Jetzt fehlt nur noch a. Probiert es erst aus: Der Regler verändert <M>a</M> in <M>{'y = a(x - 2)^2 + 3'}</M>. Der Scheitel bleibt dabei immer bei <M>{'S(2 \\mid 3)'}</M>. Sucht das <M>a</M>, bei dem der blaue Bogen
          genau auf der gestrichelten Skizze liegt.
        </p>
      </div>
      <TorBild f={f} />
      <div className="ls-slider">
        <label htmlFor={sliderId}>
          <M>a</M> = <span className="ls-slider-value">{fmt(a, 2)}</span>
        </label>
        <input id={sliderId} type="range" min={-1.5} max={1} step={0.05} value={a} onChange={(e: ChangeEvent<HTMLInputElement>) => setA(Number(e.target.value))} />
      </div>
      <div className="ls-readout">
        <div className="ls-readout-box ls-readout-a">
          <strong>Höhe am linken Pfosten (x = 0):</strong> <M>{`y = ${tx(f(0), 2)}`}</M>
        </div>
        <div className="ls-readout-box ls-readout-b">
          <strong>Höhe am rechten Pfosten (x = 4):</strong> <M>{`y = ${tx(f(4), 2)}`}</M>
        </div>
      </div>
    </div>
  )
}

/** Plan eines Azubis mit nummerierten Rechenschritten (für den Check) */
function Bericht({ name, cls, zeilen, ergebnis }: { name: string; cls: string; zeilen: string[][]; ergebnis: string }) {
  return (
    <div className={`wm-bericht ${cls}`}>
      <div className="wm-bericht-name">Plan von {name}</div>
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
        An die Biegemaschine: <M>{ergebnis}</M>
      </div>
    </div>
  )
}

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
  const [pred, setPred] = useState<Prediction>({ choice: null, a: -1, saved: false })

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
              <strong>Das lernst du hier:</strong> Du stellst die Funktionsgleichung einer Parabel auf, wenn du den Scheitelpunkt und einen weiteren Punkt kennst.
            </div>
          </div>
          <Arbeitsweise />

          {/* 1 Aktivieren */}
          <Phase no={1} title="Fit für den Start" social="EA" minutes={4}>
            <p>Diese drei kurzen Aufgaben brauchst du gleich. Löse sie allein.</p>
            <div className="lp-exlist">
              <McCard
                title="a) Scheitelpunkt ablesen"
                prompt={
                  <p>
                    Welchen Scheitelpunkt hat die Parabel <M>{'y = -2(x - 1)^2 + 4'}</M>?
                  </p>
                }
                options={[
                  { text: 'S(1 | 4)', correct: true, feedback: 'In der Scheitelform y = a(x − x_S)² + y_S steht x_S mit umgekehrtem Vorzeichen in der Klammer.' },
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
                title="c) Gleichung lösen"
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
                    Du machst eine Ausbildung im Metallbau. Familie Berger möchte über ihrer 4 m breiten Hofeinfahrt einen Bogen aus Stahlrohr. Er sitzt auf zwei Pfosten, die 2 m
                    hoch sind. In der Mitte soll der Bogen 3 m hoch sein.
                  </p>
                  <p>
                    Die Biegemaschine braucht die Form des Bogens als Funktionsgleichung in der allgemeinen Form <M>{'y = ax^2 + bx + c'}</M>. Der Nullpunkt liegt am Fuß des
                    linken Pfostens, 1 Kästchen = 1 m.
                  </p>
                </div>
                <TorBild />
              </div>
            </div>
            <div className="ls-question">
              <i className="fa-solid fa-circle-question" aria-hidden="true" />
              <span>Welche Gleichung gibst du in die Biegemaschine ein?</span>
            </div>

            <div className="lp-ex bk-panel" data-no-autocheck>
              <CardHead title="Deine Vermutung" />
              {pred.saved && pred.choice ? (
                <>
                  <div className="ls-saved" role="status">
                    <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: <strong>{CHOICE_TEXT[pred.choice]}</strong>. Deine Schätzung: <strong>a ≈ {fmt(pred.a, 2)}</strong>.
                    Am Ende schauen wir, ob du recht hattest.
                  </div>
                  <div>
                    <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setPred({ ...pred, saved: false })}>
                      Vermutung ändern
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Rechne noch nicht! Den Scheitelpunkt <M>{'S(2 \\mid 3)'}</M> kennst du. Reicht das, um die Gleichung aufzustellen? Entscheide spontan und schreibe einen Satz als
                    Begründung in dein Heft.
                  </p>
                  <div className="ls-options" role="radiogroup" aria-label="Vermutung">
                    {(['reicht', 'punkt', 'zwei'] as const).map((c) => (
                      <label key={c} className="bk-choice ls-option">
                        <input type="radio" name="tor-pred" checked={pred.choice === c} onChange={() => setPred({ ...pred, choice: c })} />
                        <span>{CHOICE_TEXT[c]}</span>
                      </label>
                    ))}
                  </div>
                  <div className="ls-slider">
                    <label htmlFor="tor-pred-a">
                      Ich schätze die Zahl vor der Klammer: <M>a</M> ≈ <span className="ls-slider-value">{fmt(pred.a, 2)}</span>
                    </label>
                    <input
                      id="tor-pred-a"
                      type="range"
                      min={-2}
                      max={2}
                      step={0.25}
                      value={pred.a}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPred({ ...pred, a: Number(e.target.value) })}
                    />
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

          {/* 3 Erkunden & Berechnen */}
          <Phase no={3} title="In der Werkstatt: Findet die Gleichung" social="PA" minutes={18}>
            <p>
              <strong>Auftrag:</strong> Arbeitet zu zweit Schritt für Schritt. Jede Person tippt auf dem eigenen Gerät, ihr besprecht jede Antwort kurz miteinander.
            </p>
            <div className="lp-exlist">
              <McCard
                title="Schritt 1: Den Scheitelpunkt einsetzen"
                level="basis"
                prompt={
                  <p>
                    Ihr kennt die Scheitelform <M>{'y = a(x - x_S)^2 + y_S'}</M>. Setzt den Scheitelpunkt <M>{'S(2 \\mid 3)'}</M> ein. Welcher Ansatz entsteht?
                  </p>
                }
                options={[
                  { text: 'y = a(x + 2)² + 3', feedback: 'Vorsicht mit dem Vorzeichen: x − x_S = x − 2. Mit x + 2 läge der Scheitel bei x = −2, links neben der Einfahrt.' },
                  { text: 'y = a(x − 2)² + 3', correct: true, feedback: 'Genau. Jetzt fehlt nur noch die Zahl a vor der Klammer.' },
                  { text: 'y = a(x − 3)² + 2', feedback: 'Die Koordinaten sind vertauscht. In die Klammer gehört der x-Wert 2, hinten steht der y-Wert 3.' },
                  { text: 'y = 2(x − 3)²', feedback: 'Der Scheitelpunkt liefert nicht a. In die Klammer kommt x_S = 2, hinten wird y_S = 3 addiert.' },
                ]}
              />

              <ReglerA />
              <CheckCard
                title="Was habt ihr am Regler gefunden?"
                rechnen={false}
                prompt={<p>Bei welchem a sitzt der Bogen auf dem linken Pfosten? Und was passiert dann am rechten Pfosten?</p>}
                fieldsRow
                fields={[
                  { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: A_SOLL },
                  { kind: 'select', key: 'q', label: 'Rechter Pfosten', options: ['passt dann auch', 'passt nicht'], expected: 0 },
                ]}
                solution={
                  <p>
                    Bei <M>{'a = -0{,}25'}</M> ist an beiden Pfosten (<M>{'x = 0'}</M> und <M>{'x = 4'}</M>) <M>{'y = 2'}</M>. Der Bogen sitzt auf beiden Pfosten, weil die Parabel symmetrisch zum Scheitel ist: Beide
                    Pfosten stehen 2 m von der Mitte entfernt.
                  </p>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Schaut auf die Anzeige „Höhe am linken Pfosten“. Der Pfosten ist 2 m hoch, dort muss also 2 stehen.</>,
                      <>Ist die Höhe am linken Pfosten zu groß, schiebt den Regler nach links (a kleiner), ist sie zu klein, nach rechts.</>,
                      <>Der passende Wert liegt zwischen −0,5 und 0. Geht in kleinen Schritten vor.</>,
                    ]}
                  />
                }
              />

              <CheckCard
                title="Schritt 3: a ohne Probieren berechnen"
                level="standard"
                prompt={
                  <>
                    <p>
                      Probieren dauert und ist bei krummen Zahlen ungenau. Es geht auch genau: Der Bogen muss durch den Pfosten <M>{'P(0 \\mid 2)'}</M> gehen. Also muss beim Einsetzen von{' '}
                      <M>{'x = 0'}</M> die Höhe 2 herauskommen.
                    </p>
                    <p>
                      Setzt <M>{'x = 0'}</M> und <M>{'y = 2'}</M> in <M>{'y = a(x - 2)^2 + 3'}</M> ein und löst nach <M>a</M> auf. Füllt die Lücken aus.
                    </p>
                  </>
                }
                rechnung={[
                  { l: ['2'], r: ['a \\cdot (0 - 2)^2 + 3'] },
                  { l: ['2'], r: [{ luecke: 'q' }, '\\cdot a + 3'] },
                  { l: ['a'], r: [{ luecke: 'a' }] },
                ]}
                fields={[
                  { kind: 'num', key: 'q', label: 'Zahl vor a', expected: 4 },
                  { kind: 'num', key: 'a', label: 'a', expected: A_SOLL },
                ]}
                solution={
                  <MB>{'\\begin{aligned} 2 &= a \\cdot (0 - 2)^2 + 3 \\\\ 2 &= 4a + 3 && \\mid -3 \\\\ -1 &= 4a && \\mid :4 \\\\ a &= -0{,}25 \\end{aligned}'}</MB>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Rechnet zuerst die Klammer aus: 0 − 2 = −2. Dann das Quadrat.</>,
                      <>
                        Ein Quadrat ist nie negativ: <M>{'(-2)^2 = 4'}</M>. Also steht da <M>{'2 = 4a + 3'}</M>.
                      </>,
                      <>Jetzt wie in der Aufwärmaufgabe c) lösen: erst − 3, dann durch 4 teilen.</>,
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
                    <strong>Scheitelpunkt einsetzen:</strong> <M>{'y = a(x - x_S)^2 + y_S'}</M>. Achtung beim Vorzeichen in der Klammer.
                  </>,
                  <>
                    <strong>Punkt einsetzen und a berechnen:</strong> x-Wert und y-Wert des zweiten Punkts einsetzen, erst das Quadrat ausrechnen, dann nach <M>a</M> auflösen.
                  </>,
                  <>
                    <strong>Umwandeln:</strong> Klammer mit der binomischen Formel auflösen, dann <strong>jeden</strong> Summanden mit <M>a</M> multiplizieren und zusammenfassen.
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
                  { title: 'Scheitelpunkt einsetzen', body: <MB>{'y = a(x - (-1))^2 + 5 = a(x + 1)^2 + 5'}</MB> },
                  {
                    title: 'Punkt einsetzen und a berechnen',
                    body: <MB>{'\\begin{aligned} 3 &= a(1 + 1)^2 + 5 \\\\ 3 &= 4a + 5 && \\mid -5 \\\\ -2 &= 4a && \\mid :4 \\\\ a &= -0{,}5 \\end{aligned}'}</MB>,
                  },
                  {
                    title: 'Umwandeln',
                    body: <MB>{'\\begin{aligned} y &= -0{,}5(x + 1)^2 + 5 \\\\ &= -0{,}5(x^2 + 2x + 1) + 5 \\\\ &= -0{,}5x^2 - x - 0{,}5 + 5 \\\\ &= -0{,}5x^2 - x + 4{,}5 \\end{aligned}'}</MB>,
                  },
                ]}
              />
              <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
            </div>

            <div className="lp-exlist">
              <CheckCard
                title="Schritt 4: Die Gleichung für die Biegemaschine"
                level="standard"
                prompt={
                  <p>
                    Ihr habt <M>{'y = -0{,}25(x - 2)^2 + 3'}</M>. Wandelt in die allgemeine Form <M>{'y = ax^2 + bx + c'}</M> um. Macht zum Schluss die Probe mit dem rechten
                    Pfosten <M>{'Q(4 \\mid 2)'}</M>.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: 1 },
                  { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 2 },
                ]}
                solution={
                  <>
                    <MB>{'\\begin{aligned} y &= -0{,}25(x - 2)^2 + 3 \\\\ &= -0{,}25(x^2 - 4x + 4) + 3 \\\\ &= -0{,}25x^2 + x - 1 + 3 \\\\ &= -0{,}25x^2 + x + 2 \\end{aligned}'}</MB>
                    <p>
                      Probe mit <M>{'x = 4'}</M>: <M>{'y = -0{,}25 \\cdot 16 + 4 + 2 = 2'}</M> ✓
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Wie im Beispiel der Infokarte: erst die Klammer, dann mal a, dann zusammenfassen.</>,
                      <>
                        <M>{'(x - 2)^2 = x^2 - 4x + 4'}</M>. Jetzt jeden der drei Summanden mit <M>{'-0{,}25'}</M> multiplizieren.
                      </>,
                      <>
                        <M>{'-0{,}25 \\cdot x^2 = -0{,}25x^2'}</M>, <M>{'-0{,}25 \\cdot (-4x) = +x'}</M>, <M>{'-0{,}25 \\cdot 4 = -1'}</M>. Dann noch + 3.
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
                    flacher? Begründet im Heft.
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
                      <>Der Scheitel liegt jetzt bei S(2 | 3,5), der Pfosten bleibt bei P(0 | 2).</>,
                      <>
                        Neuer Ansatz: <M>{'y = a(x - 2)^2 + 3{,}5'}</M>. Setzt P ein und löst nach a auf.
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
          <Phase no={4} title="Vergleicht eure Wege" social="Plenum" minutes={4}>
            <div className="ls-stop">
              <div className="ls-stop-title">
                <i className="fa-solid fa-hand" aria-hidden="true" /> Stopp: Besprecht eure Ergebnisse mit der Klasse.
              </div>
              <ul>
                <li>Warum reicht ein Pfosten, um a festzulegen? Warum passt der zweite Pfosten dann von selbst?</li>
                <li>Was ist besser: a am Regler suchen oder a berechnen?</li>
                <li>Woran erkennt man schon vor dem Rechnen, dass a beim Torbogen negativ sein muss?</li>
              </ul>
            </div>
            <p>
              <strong>Du arbeitest allein?</strong> So haben zwei andere Azubis gedacht. Klappe die Wege auf und vergleiche sie mit deinem.
            </p>
            <div className="ls-ways">
              <details className="ls-way">
                <summary>Leon hat nur den Regler benutzt</summary>
                <div className="ls-way-body">
                  <p>„Ich habe geschoben, bis der Bogen auf der Skizze lag. Bei −0,25 hat es gepasst.“</p>
                  <p>
                    <strong>Gut:</strong> Man sieht, was a mit dem Bogen macht. <strong>Aber:</strong> Bei einem Kunden mit krummen Maßen findet man a am Regler nicht genau, und eine
                    Biegemaschine braucht exakte Werte.
                  </p>
                </div>
              </details>
              <details className="ls-way">
                <summary>Sophie hat gerechnet</summary>
                <div className="ls-way-body">
                  <p>„Der Bogen muss durch P(0 | 2). Also habe ich x = 0 und y = 2 eingesetzt: 2 = 4a + 3, also a = −0,25. Die Probe mit Q(4 | 2) hat auch gepasst.“</p>
                  <p>
                    <strong>Gut:</strong> Genau und schnell, egal wie krumm die Zahlen sind. <strong>Aber:</strong> Man muss beim Quadrat aufpassen: <M>{'(-2)^2'}</M> ist 4, nicht −4.
                  </p>
                </div>
              </details>
            </div>
          </Phase>

          {/* 5 Sichern */}
          <Phase no={5} title="Das hältst du fest" social="EA" minutes={5}>
            <Rueckbezug pred={pred} />
            <div className="wm-mappe">
              <span className="wm-reiter">Auftragsmappe 2026-117</span>
              <div className="wm-blatt">
                <span className="wm-stempel">Freigegeben</span>
                <p>
                  An die Biegemaschine geht: <M>{'y = -0{,}25x^2 + x + 2'}</M>, in Scheitelform <M>{'y = -0{,}25(x - 2)^2 + 3'}</M>.
                </p>
              </div>
            </div>
            <Merke title="Funktionsgleichung aus Scheitelpunkt und einem Punkt (Fall 1)">
              <ol>
                <li>
                  Scheitelpunkt in die Scheitelform einsetzen: <M>{'y = a(x - x_S)^2 + y_S'}</M>.
                </li>
                <li>
                  Den zweiten Punkt für <M>x</M> und <M>y</M> einsetzen und nach <M>a</M> auflösen.
                </li>
                <li>
                  In die allgemeine Form <M>{'y = ax^2 + bx + c'}</M> umwandeln: binomische Formel, dann jeden Summanden mit <M>a</M> multiplizieren.
                </li>
              </ol>
            </Merke>
            <div className="lp-ex bk-panel">
              <CardHead title="Dein Spickzettel (Lernprodukt)" />
              <p>Gestalte eine Karteikarte „Gleichung aus dem Scheitelpunkt aufstellen“. Sie darf genau eine Karteikarte füllen. Hake ab, was du schon hast:</p>
              <div className="ls-criteria">
                {[
                  'Die drei Schritte in der richtigen Reihenfolge, jeder mit einem kurzen Merksatz',
                  'Bei jedem Schritt eine Warnung vor einem typischen Fehler',
                  'Ein eigenes Beispiel mit anderen Zahlen',
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
          <Phase no={6} title="Check: Hast du es verstanden?" social="EA" minutes={9}>
            <div className="lp-exlist">
              <div className="lp-ex bk-panel">
                <CardHead title="Check 1: Qualitätskontrolle" level="standard" />
                <p>Zwei Azubis haben den Torbogen auch berechnet. Beide Pläne sind falsch. Findest du die Fehler?</p>
                <div className="wm-berichte wm-berichte-2">
                  <Bericht
                    name="Jonas"
                    cls="wm-bericht-a"
                    zeilen={[
                      ['y = a(x + 2)^2 + 3'],
                      ['2 = a(0 + 2)^2 + 3', '2 = 4a + 3 \\;\\Rightarrow\\; a = -0{,}25'],
                      ['y = -0{,}25(x^2 + 4x + 4) + 3', '= -0{,}25x^2 - x + 2'],
                    ]}
                    ergebnis="y = -0{,}25x^2 - x + 2"
                  />
                  <Bericht
                    name="Mara"
                    cls="wm-bericht-c"
                    zeilen={[
                      ['y = a(x - 2)^2 + 3'],
                      ['2 = a(0 - 2)^2 + 3', '2 = 4a + 3 \\;\\Rightarrow\\; a = -0{,}25'],
                      ['y = -0{,}25x^2 - 4x + 4 + 3', '= -0{,}25x^2 - 4x + 7'],
                    ]}
                    ergebnis="y = -0{,}25x^2 - 4x + 7"
                  />
                </div>
              </div>
              <CheckCard
                title="Wo stecken die Fehler?"
                rechnen={false}
                prompt={<p>Wähle für jeden Plan den Schritt, in dem der Fehler steckt. Schreibe den Fehler mit einem Satz ins Heft.</p>}
                fieldsRow
                fields={[
                  { kind: 'select', key: 'j', label: 'Fehler bei Jonas', options: SCHRITTE, expected: 0 },
                  { kind: 'select', key: 'm', label: 'Fehler bei Mara', options: SCHRITTE, expected: 2 },
                ]}
                solution={
                  <>
                    <p>
                      <strong>Jonas, Schritt 1:</strong> Bei <M>{'S(2 \\mid 3)'}</M> heißt die Klammer <M>{'(x - 2)'}</M>, nicht <M>{'(x + 2)'}</M>. Seine Probe mit P stimmt trotzdem,
                      weil er P zum Rechnen benutzt hat. Die Probe mit Q deckt den Fehler auf: Bei <M>{'x = 4'}</M> ergibt sich <M>{'y = -6'}</M> statt 2.
                    </p>
                    <p>
                      <strong>Mara, Schritt 3:</strong> Sie hat nur <M>{'x^2'}</M> mit <M>{'-0{,}25'}</M> multipliziert. Richtig ist{' '}
                      <M>{'-0{,}25(x^2 - 4x + 4) + 3 = -0{,}25x^2 + x - 1 + 3'}</M>.
                    </p>
                  </>
                }
              />
              <CheckCard
                title="Check 2: Gleichung aufstellen"
                level="standard"
                prompt={
                  <p>
                    Eine Parabel hat den Scheitelpunkt <M>{'S(1 \\mid -2)'}</M> und geht durch <M>{'P(3 \\mid 6)'}</M>. Bestimme <M>a</M> und die allgemeine Form{' '}
                    <M>{'y = ax^2 + bx + c'}</M>.
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
                    <MB>{'\\begin{aligned} y &= 2(x - 1)^2 - 2 \\\\ &= 2(x^2 - 2x + 1) - 2 \\\\ &= 2x^2 - 4x \\end{aligned}'}</MB>
                    <p>
                      Es ist also <M>{'c = 0'}</M>.
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Gehe wie auf deinem Spickzettel vor: erst der Scheitelpunkt, dann der Punkt P, dann umwandeln.</>,
                      <>
                        Ansatz: <M>{'y = a(x - 1)^2 - 2'}</M>. Setze <M>{'x = 3'}</M> und <M>{'y = 6'}</M> ein.
                      </>,
                      <>
                        <M>{'6 = 4a - 2'}</M> ergibt <M>{'a = 2'}</M>. Danach <M>{'2(x^2 - 2x + 1) - 2'}</M> ausmultiplizieren.
                      </>,
                    ]}
                  />
                }
              />
              <McCard
                title="Check 3: Richtig umgewandelt?"
                level="standard"
                rechnen
                prompt={
                  <p>
                    Wandle <M>{'y = -0{,}5(x + 2)^2 + 1'}</M> in die allgemeine Form um.
                  </p>
                }
                options={[
                  { text: 'y = −0,5x² − 1', feedback: 'Hier wurde (x + 2)² = x² + 4 gerechnet. Es fehlt das Mittelglied: (x + 2)² = x² + 4x + 4.' },
                  { text: 'y = −0,5x² + 4x + 5', feedback: 'Nur x² wurde mit −0,5 multipliziert, so wie bei Mara. Jeder Summand in der Klammer muss mal −0,5 genommen werden.' },
                  { text: 'y = −0,5x² − 2x − 1', correct: true, feedback: '−0,5(x² + 4x + 4) + 1 = −0,5x² − 2x − 2 + 1 = −0,5x² − 2x − 1.' },
                  { text: 'y = −0,5x² − 2x + 3', feedback: 'Fast: −0,5 · 4 ist −2, nicht +2. Dann ergibt sich −2 + 1 = −1.' },
                ]}
              />
              <CheckCard
                title="Check 4: Passt der Transporter durch?"
                level="erweiterung"
                prompt={
                  <p>
                    Ein Transporter ist 1,8 m breit und 2,6 m hoch. Er fährt genau mittig durch den Torbogen <M>{'y = -0{,}25x^2 + x + 2'}</M>. Wie hoch ist der Bogen über den
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
                    <MB>{'x = 1{,}1: \\quad y = -0{,}25 \\cdot 1{,}1^2 + 1{,}1 + 2 = -0{,}3025 + 3{,}1 = 2{,}7975 \\approx 2{,}80'}</MB>
                    <p>Wegen der Symmetrie ist der Bogen bei x = 2,9 genauso hoch. 2,80 m &gt; 2,6 m, der Transporter passt mit etwa 20 cm Luft durch.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Zeichne den Transporter als Rechteck mittig unter den Bogen. An welchen Stellen x wird es am engsten?</>,
                      <>Am engsten ist es an den oberen Ecken des Transporters. Sie liegen eine halbe Breite links und rechts von der Mitte x = 2.</>,
                      <>
                        Die linke Ecke liegt bei <M>{'x = 2 - 0{,}9 = 1{,}1'}</M>. Setze <M>{'x = 1{,}1'}</M> ein, berechne y und vergleiche mit 2,6 m.
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
  const diff = Math.abs(pred.a - A_SOLL)
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {CHOICE_TEXT[pred.choice]}. Deine Schätzung: a ≈ {fmt(pred.a, 2)}.
      </p>
      <p>
        {pred.choice === 'punkt' && <>Das stimmt: Mit dem Scheitel und einem Pfosten liegt der Bogen fest. Gut gedacht!</>}
        {pred.choice === 'reicht' && <>Der Scheitel allein reicht nicht: Durch S(2 | 3) gehen viele Parabeln, breite und schmale. Erst ein weiterer Punkt legt a fest.</>}
        {pred.choice === 'zwei' && <>Ein Pfosten reicht schon. Der zweite passt wegen der Symmetrie von selbst, er ist eine gute Probe.</>}
      </p>
      <p>
        Richtig ist <strong>a = −0,25</strong>. {diff === 0 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${fmt(diff, 2)} daneben.`}{' '}
        {pred.a > 0 && 'Ein positives a würde den Bogen durchhängen lassen wie eine Schaukel.'}
      </p>
    </div>
  )
}
