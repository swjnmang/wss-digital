import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, Tabelle, Vorgehen, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { Arbeitsweise, CardHead, CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, McCard, Phase } from '../../lineare_funktionen/lernsituation_kit/kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './teamchat.css'

// Lernsituation 2 „Lohnen sich 60 Hoodies?“: Funktionsgleichung aus einem bekannten Wert und zwei Punkten (Fall 2, ca. 95 min).
// Format Entscheidungsfall, Look Team-Chat der Schülerfirma mit Lieferanten-Rechnungen, Lernprodukt digital (Sprachnachricht oder Erklärvideo).
// Instruktionsreihenfolge: Problem zuerst. Die SuS stellen aus c = −200 und zwei Punkten selbst zwei Gleichungen auf und merken, dass
// sie mit zwei Unbekannten nicht weiterkommen. Das Additionsverfahren ist neu: Es wird an zwei Rechnungen entdeckt (Rechnungen
// vergleichen, Differenz bilden), dann mit Infokarte und Beispiel gesichert und geübt. Danach geht es zurück zur Gewinnfunktion.
// Aha: 20 und 40 verkaufte Hoodies bringen beide 200 € Gewinn, 60 Hoodies bringen 200 € Verlust. Mehr verkaufen heißt nicht mehr Gewinn.
// Phasen: Aktivieren → Team-Chat & Festlegung → Gleichungen aufstellen → Werkzeug Additionsverfahren → Entscheidung →
// Austausch → Sichern & Lernprodukt → Check. Die Festlegung bleibt nur im Seitenzustand (kein Speichern).

/* ── Situation ───────────────────────────────────────────────────────────── */

// Gewinn y in € bei x verkauften Hoodies: y = −0,5x² + 30x − 200 (Fixkosten 200 €, bei 20 und 40 Hoodies 200 €, bei 60 Hoodies −200 €, Maximum 250 € bei 30)
const G = (x: number) => -0.5 * x * x + 30 * x - 200
const G60 = G(60)

type Choice = 'mehr' | 'gleich' | 'weniger' | 'verlust'
type Prediction = { choice: Choice | null; gewinn: number; saved: boolean }

const CHOICE_TEXT: Record<Choice, string> = {
  mehr: 'Mit 60 Hoodies machen wir deutlich mehr als 200 € Gewinn',
  gleich: 'Der Gewinn bleibt ungefähr bei 200 €',
  weniger: 'Der Gewinn sinkt unter 200 €, aber wir verdienen noch etwas',
  verlust: 'Mit 60 Hoodies machen wir Verlust',
}

/* ── Team-Chat ───────────────────────────────────────────────────────────── */

function Chat({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="tc-chat">
      <div className="tc-head">
        <span className="tc-avatar">
          <i className="fa-solid fa-shirt" aria-hidden="true" />
        </span>
        <div>
          {titel}
          <small>Finn, Aylin, Frau Kaya, du</small>
        </div>
      </div>
      <div className="tc-body">{children}</div>
    </div>
  )
}

function Nachricht({ von, zeit, ich = false, children }: { von: string; zeit: string; ich?: boolean; children: ReactNode }) {
  return (
    <div className={`tc-msg ${ich ? 'tc-msg-me' : ''}`}>
      <div className="tc-name">{von}</div>
      {children}
      <span className="tc-time">{zeit}</span>
    </div>
  )
}

function Bon({ titel, zeilen, summe }: { titel: string; zeilen: [string, string][]; summe: string }) {
  return (
    <div className="tc-bon">
      <div className="tc-bon-title">{titel}</div>
      {zeilen.map(([l, r]) => (
        <div key={l} className="tc-bon-row">
          <span>{l}</span>
          <span>{r}</span>
        </div>
      ))}
      <div className="tc-bon-row tc-bon-sum">
        <span>Summe</span>
        <span>{summe}</span>
      </div>
    </div>
  )
}

/* ── Graph der Gewinnfunktion ────────────────────────────────────────────── */

const S = { w: 640, h: 340, l: 56, r: 14, t: 14, b: 34, xMin: -2, xMax: 70, yMin: -650, yMax: 400 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)
const GEWINN_KURVE = Array.from({ length: 141 }, (_, i) => i / 2)
  .map((x) => `${bx(x)},${by(G(x))}`)
  .join(' ')

function GewinnGraph() {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
  const punkte: { x: number; label: string }[] = [
    { x: 20, label: '(20 | 200)' },
    { x: 40, label: '(40 | 200)' },
    { x: 60, label: '(60 | −200)' },
  ]
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label="Graph der Gewinnfunktion: eine nach unten geöffnete Parabel mit dem höchsten Punkt bei 30 Hoodies">
        <defs>
          <clipPath id={clip}>
            <rect x={bx(0)} y={S.t} width={bx(S.xMax) - bx(0)} height={by(S.yMin) - S.t} />
          </clipPath>
        </defs>
        {[10, 20, 30, 40, 50, 60, 70].map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--grid)" />
            <text x={bx(v)} y={by(0) + 22} textAnchor="middle" fontSize="16" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {[-600, -400, -200, 200, 400].map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(0)} x2={bx(S.xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            <text x={bx(0) - 8} y={by(v) + 5} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
              {fmt(v, 0).replace('-', '−')}
            </text>
          </g>
        ))}
        <rect x={bx(0)} y={by(0)} width={bx(S.xMax) - bx(0)} height={by(S.yMin) - by(0)} fill="var(--wrong-soft)" opacity="0.5" />
        <line x1={bx(0)} x2={bx(S.xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="2" />
        <line x1={bx(0)} x2={bx(0)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--ink)" strokeWidth="2" />
        <text x={bx(S.xMax) - 4} y={by(0) - 8} textAnchor="end" fontSize="14" fill="var(--ink-muted)">
          verkaufte Hoodies x
        </text>
        <text x={bx(0) + 8} y={by(S.yMax) + 14} fontSize="14" fill="var(--ink-muted)">
          Gewinn in €
        </text>
        <text x={bx(52)} y={by(-520)} fontSize="15" fontWeight="700" fill="var(--wrong-ink)">
          Verlust
        </text>
        <g clipPath={`url(#${clip})`}>
          <polyline points={GEWINN_KURVE} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
        </g>
        {punkte.map((p) => (
          <g key={p.x}>
            <circle cx={bx(p.x)} cy={by(G(p.x))} r="7" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
            <text x={bx(p.x) + (p.x === 60 ? -10 : 10)} y={by(G(p.x)) + (p.x === 60 ? 24 : -14)} textAnchor={p.x === 60 ? 'end' : 'start'} fontSize="15" fontWeight="700" fill="var(--ink)">
              {p.label}
            </text>
          </g>
        ))}
        <circle cx={bx(0)} cy={by(-200)} r="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
        <text x={bx(0) + 10} y={by(-200) + 5} fontSize="15" fontWeight="700" fill="var(--ink)">
          c = −200
        </text>
      </svg>
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function SchuelerfirmaEinstieg({
  erklaerung,
  onBack,
  onPractice,
  onPrev,
}: {
  erklaerung: ReactNode
  onBack: () => void
  onPractice: () => void
  onPrev: () => void
}) {
  const [pred, setPred] = useState<Prediction>({ choice: null, gewinn: 400, saved: false })
  const [skript, setSkript] = useState('')
  const [gesendet, setGesendet] = useState<string[]>([])

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell
        title="Funktionsgleichung aufstellen"
        subtitle="Lernsituation 2: Lohnen sich 60 Hoodies?"
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
              <strong>Das lernst du hier:</strong> Du lernst das Additionsverfahren kennen, mit dem du zwei Gleichungen mit zwei Unbekannten löst. Damit stellst du die Gleichung
              einer Parabel auf, wenn ein Wert (a, b oder c) und zwei Punkte bekannt sind, aber nicht der Scheitelpunkt.
            </div>
          </div>
          <Arbeitsweise />

          {/* 1 Aktivieren */}
          <Phase no={1} title="Fit für den Start" social="EA" minutes={6}>
            <p>Diese drei kurzen Aufgaben brauchst du gleich. Löse sie allein.</p>
            <div className="lp-exlist">
              <CheckCard
                title="a) Gleichung lösen"
                prompt={
                  <p>
                    Löse die Gleichung <M>{'400 = 20b - 200'}</M>.
                  </p>
                }
                fields={[{ kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: 30 }]}
                solution={<MB>{'\\begin{aligned} 400 &= 20b - 200 && \\mid +200 \\\\ 600 &= 20b && \\mid :20 \\\\ b &= 30 \\end{aligned}'}</MB>}
              />
              <McCard
                title="b) Minus vor der Klammer"
                prompt={
                  <p>
                    Vereinfache <M>{'(3x + 2y) - (3x - 4y)'}</M>.
                  </p>
                }
                options={[
                  { text: '6y', correct: true, feedback: 'Das Minus vor der Klammer dreht jedes Vorzeichen um: 3x + 2y − 3x + 4y = 6y.' },
                  { text: '−2y', feedback: 'Das Minus vor der Klammer gilt für beide Summanden: − (−4y) = + 4y. Also 2y + 4y = 6y.' },
                  { text: '6x − 2y', feedback: '3x − 3x = 0, die x fallen weg. Und − (−4y) ergibt + 4y.' },
                  { text: '6x + 6y', feedback: 'Beim Abziehen fällt 3x − 3x = 0 weg. Nur die y bleiben übrig.' },
                ]}
              />
              <CheckCard
                title="c) Gewinn berechnen"
                prompt={<p>Eine Firma nimmt mit dem Verkauf 900 € ein (Erlös). Die Kosten betragen 650 €. Wie hoch ist der Gewinn?</p>}
                fields={[{ kind: 'num', key: 'g', label: 'Gewinn', unit: '€', expected: 250 }]}
                solution={<MB>{'\\text{Gewinn} = \\text{Erlös} - \\text{Kosten} = 900 - 650 = 250\\ €'}</MB>}
              />
            </div>
          </Phase>

          {/* 2 Team-Chat & Festlegung */}
          <Phase no={2} title="Die Situation: großer Auftrag für die Schülerfirma" social="EA" minutes={7}>
            <p>
              Du bist in der Schülerfirma deiner Schule. Ihr bedruckt Hoodies mit dem Schullogo und verkauft sie am Sommerfest. In eurem Team-Chat geht es gerade heiß her:
            </p>
            <Chat titel="Schülerfirma Druckwerk">
              <Nachricht von="Finn (Vorstand)" zeit="14:02">
                <p>Leute! Der Lieferant gibt uns Rabatt, wenn wir dieses Jahr 60 Hoodies auf einmal nehmen 🔥 Dann machen wir richtig Gewinn, oder?</p>
              </Nachricht>
              <Nachricht von="Aylin (Finanzen)" zeit="14:05">
                <p>Hm. Vorletztes Jahr: 20 Hoodies verkauft, 200 € Gewinn. Letztes Jahr: 40 Hoodies, wieder nur 200 € Gewinn 🤔</p>
              </Nachricht>
              <Nachricht von="Frau Kaya (Betreuung)" zeit="14:11">
                <p>
                  Wer mehr Hoodies verkaufen will, muss sie billiger anbieten. Darum steigt der Gewinn nicht einfach immer weiter. Man kann ihn mit einer Parabel beschreiben:
                </p>
                <p>
                  <M>{'y = ax^2 + bx + c'}</M> mit <M>x</M> = Anzahl verkaufter Hoodies und <M>y</M> = Gewinn in €.
                </p>
                <p>Die Fixkosten für Siebdruckrahmen und Standmiete sind jedes Jahr 200 €. Die fallen auch an, wenn ihr keinen einzigen Hoodie verkauft.</p>
              </Nachricht>
              <Nachricht von="Finn (Vorstand)" zeit="14:12">
                <p>Und? Bestellen wir die 60? Ich brauch bis Freitag eine Antwort 🙏</p>
              </Nachricht>
            </Chat>
            <Tabelle
              head={['verkaufte Hoodies x', '0', '20', '40', '60']}
              rows={[['Gewinn y in €', '−200', '200', '200', '?']]}
            />
            <div className="ls-question">
              <i className="fa-solid fa-circle-question" aria-hidden="true" />
              <span>Lohnt es sich für die Schülerfirma, 60 Hoodies zu bestellen und zu verkaufen?</span>
            </div>

            <div className="lp-ex bk-panel" data-no-autocheck>
              <CardHead title="Deine Vermutung" />
              {pred.saved && pred.choice ? (
                <>
                  <div className="ls-saved" role="status">
                    <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: <strong>{CHOICE_TEXT[pred.choice]}</strong>. Deine Schätzung für 60 Hoodies:{' '}
                    <strong>{fmt(pred.gewinn, 0)} €</strong>. Am Ende schauen wir, ob du recht hattest.
                  </div>
                  <div>
                    <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setPred({ ...pred, saved: false })}>
                      Vermutung ändern
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>Rechne noch nicht! Entscheide spontan und schreibe einen Satz als Begründung in dein Heft.</p>
                  <div className="ls-options" role="radiogroup" aria-label="Vermutung">
                    {(['mehr', 'gleich', 'weniger', 'verlust'] as const).map((c) => (
                      <label key={c} className="bk-choice ls-option">
                        <input type="radio" name="sf-pred" checked={pred.choice === c} onChange={() => setPred({ ...pred, choice: c })} />
                        <span>{CHOICE_TEXT[c]}</span>
                      </label>
                    ))}
                  </div>
                  <div className="ls-slider">
                    <label htmlFor="sf-pred-g">
                      Ich schätze den Gewinn bei 60 Hoodies auf <span className="ls-slider-value">{fmt(pred.gewinn, 0)}</span> €.
                    </label>
                    <input
                      id="sf-pred-g"
                      type="range"
                      min={-400}
                      max={800}
                      step={50}
                      value={pred.gewinn}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPred({ ...pred, gewinn: Number(e.target.value) })}
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

          {/* 3 Gleichungen aufstellen */}
          <Phase no={3} title="Was wissen wir über die Parabel?" social="PA" minutes={10}>
            <p>
              <strong>Auftrag:</strong> Um den Gewinn bei 60 Hoodies auszurechnen, braucht ihr die Gleichung der Parabel. Den Scheitelpunkt kennt ihr diesmal nicht. Ihr wisst aber: Bei 0
              Hoodies bleibt nur der Verlust der Fixkosten, also ist bei <M>{'x = 0'}</M> der Gewinn <M>{'y = -200'}</M>. Und ihr kennt zwei Punkte der Parabel: <M>{'(20 \\mid 200)'}</M> und <M>{'(40 \\mid 200)'}</M>.
            </p>
            <div className="lp-exlist">
              <McCard
                title="Schritt 1: Was ist c?"
                level="basis"
                prompt={
                  <p>
                    Setzt <M>{'x = 0'}</M> in <M>{'y = ax^2 + bx + c'}</M> ein. Was folgt daraus, dass dann <M>{'y = -200'}</M> herauskommt?
                  </p>
                }
                options={[
                  { text: 'c = −200', correct: true, feedback: 'Mit x = 0 wird y = a · 0 + b · 0 + c = c. Die Gleichung heißt also y = ax² + bx − 200.' },
                  { text: 'c = 200', feedback: 'Die 200 € sind Kosten. Ohne verkauften Hoodie ist der Gewinn negativ: −200 €.' },
                  { text: 'a = −200', feedback: 'Bei x = 0 fallen a · 0² und b · 0 weg. Übrig bleibt nur c.' },
                  { text: 'Man kann c noch nicht bestimmen.', feedback: 'Doch: Setzt man x = 0 ein, bleibt nur c übrig, also c = −200.' },
                ]}
              />
              <McCard
                title="Schritt 2: Gleichung I aus dem Punkt (20 | 200)"
                level="basis"
                rechnen
                prompt={
                  <p>
                    Setzt den Punkt <M>{'(20 \\mid 200)'}</M> in <M>{'y = ax^2 + bx - 200'}</M> ein und bringt die −200 auf die linke Seite. Welche Gleichung entsteht?
                  </p>
                }
                options={[
                  { text: 'I: 400 = 20a + 20b', feedback: 'Vor a steht x², also 20² = 400, nicht 20.' },
                  { text: 'I: 400 = 400a + 20b', correct: true, feedback: '200 = a · 20² + b · 20 − 200 = 400a + 20b − 200. Mit + 200 auf beiden Seiten: 400 = 400a + 20b.' },
                  { text: 'I: 200 = 400a + 20b', feedback: 'Die −200 muss auf die andere Seite: 200 + 200 = 400.' },
                  { text: 'I: 20 = 40 000a + 200b − 200', feedback: 'x und y sind vertauscht. Für x wird 20 eingesetzt, für y der Gewinn 200.' },
                ]}
              />
              <CheckCard
                title="Schritt 3: Gleichung II aus dem Punkt (40 | 200)"
                level="standard"
                prompt={
                  <p>
                    Setzt genauso <M>{'(40 \\mid 200)'}</M> ein und bringt die −200 auf die linke Seite. Füllt die Lücken in Gleichung II aus.
                  </p>
                }
                rechnung={[
                  { l: ['200'], r: ['a \\cdot 40^2 + b \\cdot 40 - 200'], u: '\\mid +200' },
                  { l: ['\\text{II: }', { luecke: 'l' }], r: [{ luecke: 'a', breit: true }, '\\cdot a \\, +', { luecke: 'b' }, '\\cdot b'] },
                ]}
                fields={[
                  { kind: 'num', key: 'l', label: 'linke Seite', expected: 400 },
                  { kind: 'num', key: 'a', label: 'Zahl vor a', expected: 1600 },
                  { kind: 'num', key: 'b', label: 'Zahl vor b', expected: 40 },
                ]}
                solution={<MB>{'\\begin{aligned} 200 &= a \\cdot 40^2 + b \\cdot 40 - 200 \\\\ 200 &= 1600a + 40b - 200 && \\mid +200 \\\\ \\text{II: } 400 &= 1600a + 40b \\end{aligned}'}</MB>}
                help={
                  <Hilfen
                    steps={[
                      <>Macht es genauso wie bei Gleichung I, nur mit x = 40.</>,
                      <>
                        <M>{'40^2 = 1600'}</M>. Setzt ein: <M>{'200 = 1600a + 40b - 200'}</M>.
                      </>,
                      <>Jetzt auf beiden Seiten + 200 rechnen. Links steht dann 400.</>,
                    ]}
                  />
                }
              />
              <McCard
                title="Und jetzt?"
                prompt={
                  <>
                    <MB>{'\\begin{aligned} \\text{I: } 400 &= 400a + 20b \\\\ \\text{II: } 400 &= 1600a + 40b \\end{aligned}'}</MB>
                    <p>Finn schreibt: „Easy, aus Gleichung I rechne ich a aus.“ Geht das?</p>
                  </>
                }
                options={[
                  {
                    text: 'Nein. In jeder Gleichung stecken zwei Unbekannte. Man muss beide Gleichungen gemeinsam benutzen.',
                    correct: true,
                    feedback: 'Genau. Gleichung I allein passt zu vielen Paaren (a, b). Ein Werkzeug, das beide Gleichungen zusammen löst, lernt ihr jetzt kennen.',
                  },
                  { text: 'Ja, a = 1, weil 400 = 400a.', feedback: 'Das stimmt nur, wenn b = 0 wäre. Das wisst ihr aber nicht, denn 20b steht auch noch da.' },
                  { text: 'Ja, man muss nur durch 400 teilen.', feedback: 'Durch 400 teilen ergibt 1 = a + 0,05b. Da steht immer noch b. Mit einer Gleichung bekommt man zwei Unbekannte nicht heraus.' },
                  { text: 'Nein, die Aufgabe ist nicht lösbar.', feedback: 'Sie ist lösbar, weil ihr zwei Gleichungen für zwei Unbekannte habt. Ihr braucht nur das passende Verfahren.' },
                ]}
              />
            </div>
          </Phase>

          {/* 4 Werkzeug */}
          <Phase no={4} title="Werkzeug-Werkstatt: das Additionsverfahren" social="PA" minutes={25}>
            <p>
              Aylin hat in der Buchhaltung zwei alte Rechnungen für die Rohlinge gefunden. Die Einzelpreise stehen nicht drauf, nur die Summen. Findet zu zweit heraus, was ein T-Shirt
              und was ein Hoodie kostet. Probiert ruhig erst einmal, bevor ihr die Hilfen nutzt.
            </p>
            <div className="tc-bons">
              <Bon titel="Rechnung I" zeilen={[['4 Hoodies', '?'], ['5 T-Shirts', '?']]} summe="85,00 €" />
              <Bon titel="Rechnung II" zeilen={[['4 Hoodies', '?'], ['2 T-Shirts', '?']]} summe="70,00 €" />
            </div>
            <div className="lp-exlist">
              <CheckCard
                title="Rechnungen vergleichen"
                level="basis"
                prompt={<p>Was kostet ein T-Shirt, was kostet ein Hoodie? Schreibt im Heft auf, wie ihr darauf gekommen seid.</p>}
                fieldsRow
                fields={[
                  { kind: 'num', key: 't', label: '1 T-Shirt', unit: '€', expected: 5 },
                  { kind: 'num', key: 'h', label: '1 Hoodie', unit: '€', expected: 15 },
                ]}
                solution={
                  <>
                    <p>Beide Rechnungen enthalten 4 Hoodies. Der Unterschied kommt nur von den 3 zusätzlichen T-Shirts auf Rechnung I:</p>
                    <MB>{'85\\ € - 70\\ € = 15\\ € \\quad \\Rightarrow \\quad 3 \\text{ T-Shirts kosten } 15\\ €, \\text{ eins kostet } 5\\ €'}</MB>
                    <MB>{'4 \\text{ Hoodies} = 70\\ € - 2 \\cdot 5\\ € = 60\\ € \\quad \\Rightarrow \\quad 1 \\text{ Hoodie kostet } 15\\ €'}</MB>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Legt die Rechnungen nebeneinander. Was ist auf beiden Rechnungen gleich, was ist anders?</>,
                      <>Die 4 Hoodies sind auf beiden Rechnungen. Rechnung I ist teurer, weil 3 T-Shirts mehr drauf sind. Wie viel teurer ist sie?</>,
                      <>85 € − 70 € = 15 €. Das kosten die 3 zusätzlichen T-Shirts. Damit kennt ihr den T-Shirt-Preis und könnt in Rechnung II den Hoodie-Preis ausrechnen.</>,
                    ]}
                  />
                }
              />
            </div>

            <div className="lp-ex bk-panel">
              <CardHead title="Infokarte: Das Additionsverfahren" />
              <p>
                Genau diesen Trick nutzt das <strong>Additionsverfahren</strong>. Mit <M>x</M> = Preis eines Hoodies und <M>y</M> = Preis eines T-Shirts werden die Rechnungen zu einem
                Gleichungssystem. Zieht man eine Gleichung von der anderen ab, <strong>fällt eine Unbekannte weg</strong>:
              </p>
              <MB>{'\\begin{aligned} \\text{I: } 4x + 5y &= 85 \\\\ \\text{II: } 4x + 2y &= 70 \\\\ \\hline \\text{I} - \\text{II: } \\quad 3y &= 15 \\;\\Rightarrow\\; y = 5 \\end{aligned}'}</MB>
              <Vorgehen
                title="So gehst du vor"
                steps={[
                  <>
                    <strong>Ziel festlegen:</strong> Welche Unbekannte soll wegfallen? Vor ihr muss in beiden Gleichungen dieselbe Zahl stehen (dann <strong>subtrahieren</strong>) oder die Gegenzahl
                    (dann <strong>addieren</strong>).
                  </>,
                  <>
                    <strong>Wenn nötig, multiplizieren:</strong> Passen die Zahlen nicht, multiplizierst du eine Gleichung (oder beide) auf beiden Seiten mit einer passenden Zahl.
                  </>,
                  <>
                    <strong>Addieren oder subtrahieren:</strong> Die Gleichungen Seite für Seite verrechnen. Achtung bei Minuszeichen: Es wird jeder Summand abgezogen.
                  </>,
                  <>
                    <strong>Lösen und einsetzen:</strong> Die Gleichung mit einer Unbekannten lösen. Das Ergebnis in eine der Ausgangsgleichungen einsetzen und die zweite Unbekannte
                    berechnen. Zur Probe beide Werte in die andere Gleichung einsetzen.
                  </>,
                ]}
              />
              <Beispiel
                title="Mit Multiplizieren"
                aufgabe={<MB>{'\\begin{aligned} \\text{I: } 2x + 3y &= 13 \\\\ \\text{II: } x + 2y &= 8 \\end{aligned}'}</MB>}
                steps={[
                  {
                    title: 'Passend machen',
                    body: (
                      <>
                        <p>
                          Vor <M>x</M> stehen 2 und 1. Multipliziere Gleichung II mit 2, dann steht in beiden Gleichungen <M>{'2x'}</M>:
                        </p>
                        <MB>{'\\text{II} \\cdot 2: \\quad 2x + 4y = 16'}</MB>
                      </>
                    ),
                  },
                  {
                    title: 'Subtrahieren',
                    body: <MB>{'\\text{II} \\cdot 2 - \\text{I}: \\quad (2x + 4y) - (2x + 3y) = 16 - 13 \\;\\Rightarrow\\; y = 3'}</MB>,
                  },
                  {
                    title: 'Einsetzen',
                    body: <MB>{'\\text{in II: } x + 2 \\cdot 3 = 8 \\;\\Rightarrow\\; x = 2'}</MB>,
                  },
                  {
                    title: 'Probe in I',
                    body: <MB>{'2 \\cdot 2 + 3 \\cdot 3 = 4 + 9 = 13 \\;\\checkmark'}</MB>,
                  },
                ]}
              />
              <ErklaerungAufklappen label="Erklärung zu Fall 2 mit Video ansehen" />
            </div>

            <div className="lp-exlist">
              <CheckCard
                title="Übung A: Gegenzahlen"
                level="basis"
                prompt={
                  <>
                    <MB>{'\\begin{aligned} \\text{I: } x + y &= 10 \\\\ \\text{II: } x - y &= 4 \\end{aligned}'}</MB>
                    <p>
                      Vor <M>y</M> stehen <M>{'+1'}</M> und <M>{'-1'}</M>. Addiere die Gleichungen und berechne <M>x</M> und <M>y</M>.
                    </p>
                  </>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 7 },
                  { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 3 },
                ]}
                solution={
                  <>
                    <MB>{'\\text{I} + \\text{II}: \\quad 2x = 14 \\;\\Rightarrow\\; x = 7'}</MB>
                    <MB>{'\\text{in I: } 7 + y = 10 \\;\\Rightarrow\\; y = 3'}</MB>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Was passiert mit y, wenn du die beiden Gleichungen addierst?</>,
                      <>Linke Seiten addieren, rechte Seiten addieren: (x + y) + (x − y) = 10 + 4.</>,
                      <>
                        Es bleibt <M>{'2x = 14'}</M>. Teile durch 2 und setze x in Gleichung I ein.
                      </>,
                    ]}
                  />
                }
              />
              <CheckCard
                title="Übung B: Tassen und Caps"
                level="standard"
                prompt={
                  <>
                    <p>Die Schülerfirma verkauft auch bedruckte Tassen (x € pro Stück) und Caps (y € pro Stück). Zwei Bestellungen:</p>
                    <MB>{'\\begin{aligned} \\text{I: } 3x + 2y &= 34 \\\\ \\text{II: } x + 4y &= 28 \\end{aligned}'}</MB>
                    <p>Was kostet eine Tasse, was kostet ein Cap?</p>
                  </>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'x', label: <>Tasse <M>{'x ='}</M></>, unit: '€', expected: 8 },
                  { kind: 'num', key: 'y', label: <>Cap <M>{'y ='}</M></>, unit: '€', expected: 5 },
                ]}
                solution={
                  <>
                    <MB>{'\\text{II} \\cdot 3: \\quad 3x + 12y = 84'}</MB>
                    <MB>{'\\text{II} \\cdot 3 - \\text{I}: \\quad 10y = 50 \\;\\Rightarrow\\; y = 5'}</MB>
                    <MB>{'\\text{in II: } x + 4 \\cdot 5 = 28 \\;\\Rightarrow\\; x = 8'}</MB>
                    <p>
                      Probe in I: <M>{'3 \\cdot 8 + 2 \\cdot 5 = 34'}</M> ✓. Eine Tasse kostet 8 €, ein Cap 5 €.
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Vor x stehen 3 und 1. Mit welcher Zahl musst du Gleichung II multiplizieren, damit vor x auch 3 steht?</>,
                      <>
                        Multipliziere Gleichung II mit 3: <M>{'3x + 12y = 84'}</M>. Jeder Summand und die rechte Seite werden mal 3 genommen.
                      </>,
                      <>
                        Ziehe I davon ab: <M>{'(3x + 12y) - (3x + 2y) = 84 - 34'}</M>. Die x fallen weg.
                      </>,
                    ]}
                  />
                }
              />
              <McCard
                title="Übung C: Wer hat recht?"
                level="standard"
                rechnen
                prompt={
                  <>
                    <MB>{'\\begin{aligned} \\text{I: } 2x + 3y &= 12 \\\\ \\text{II: } 2x - y &= 4 \\end{aligned}'}</MB>
                    <p>Lena rechnet I − II und schreibt: „2y = 8, also y = 4.“ Rechne selbst nach. Was stimmt?</p>
                  </>
                }
                options={[
                  { text: 'Lena hat recht: y = 4.', feedback: 'Probe in II: Mit y = 4 wäre 2x = 8, also x = 4. In I: 8 + 12 = 20 ≠ 12. Lena hat 3y − (−y) falsch gerechnet.' },
                  { text: 'Falsch, richtig ist 4y = 8, also y = 2 und x = 3.', correct: true, feedback: '3y − (−y) = 3y + y = 4y. Das Minus vor dem −y macht ein Plus. Also y = 2, dann 2x − 2 = 4 und x = 3.' },
                  { text: 'Falsch, man darf hier nicht subtrahieren, sondern muss addieren.', feedback: 'Subtrahieren ist richtig, denn vor x steht in beiden Gleichungen 2x. Lena hat sich nur beim Vorzeichen verrechnet.' },
                  { text: 'Falsch, richtig ist 4y = 16, also y = 4.', feedback: 'Rechts gilt 12 − 4 = 8, nicht 16. Links stimmt 4y.' },
                ]}
              />
            </div>
          </Phase>

          {/* 5 Entscheidung */}
          <Phase no={5} title="Zurück in den Team-Chat: Was antwortet ihr Finn?" social="PA" minutes={15}>
            <p>Mit dem Additionsverfahren könnt ihr jetzt das Gleichungssystem der Schülerfirma lösen.</p>
            <div className="lp-exlist">
              <CheckCard
                title="Die Gewinnfunktion"
                level="standard"
                prompt={
                  <>
                    <MB>{'\\begin{aligned} \\text{I: } 400 &= 400a + 20b \\\\ \\text{II: } 400 &= 1600a + 40b \\end{aligned}'}</MB>
                    <p>
                      Löst das Gleichungssystem mit dem Additionsverfahren und gebt die Gewinnfunktion an: <M>{'y = ax^2 + bx - 200'}</M>.
                    </p>
                  </>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -0.5 },
                  { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: 30 },
                ]}
                solution={
                  <>
                    <p>Vor b stehen 20 und 40. Gleichung I mal 2, dann steht in beiden Gleichungen 40b:</p>
                    <MB>{'\\text{I} \\cdot 2: \\quad 800 = 800a + 40b'}</MB>
                    <MB>{'\\text{II} - \\text{I} \\cdot 2: \\quad 400 - 800 = 1600a - 800a \\;\\Rightarrow\\; -400 = 800a \\;\\Rightarrow\\; a = -0{,}5'}</MB>
                    <MB>{'\\text{in I: } 400 = 400 \\cdot (-0{,}5) + 20b = -200 + 20b \\;\\Rightarrow\\; 600 = 20b \\;\\Rightarrow\\; b = 30'}</MB>
                    <MB>{'y = -0{,}5x^2 + 30x - 200'}</MB>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Welche Unbekannte lässt sich leichter loswerden? Schaut auf die Zahlen vor b: 20 und 40.</>,
                      <>Multipliziert Gleichung I mit 2. Dann steht vor b in beiden Gleichungen 40, und beim Subtrahieren fällt b weg.</>,
                      <>
                        <M>{'\\text{I} \\cdot 2: 800 = 800a + 40b'}</M>. Rechnet II minus diese Gleichung: links <M>{'400 - 800'}</M>, rechts <M>{'1600a - 800a'}</M>.
                      </>,
                    ]}
                  />
                }
              />
              <CheckCard
                title="Die Entscheidung"
                level="standard"
                prompt={
                  <p>
                    Berechnet mit <M>{'y = -0{,}5x^2 + 30x - 200'}</M> den Gewinn bei 60 verkauften Hoodies. Lohnt sich die große Bestellung?
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'g', label: <>Gewinn bei <M>{'x = 60'}</M>: <M>{'y ='}</M></>, unit: '€', expected: G60 },
                  { kind: 'select', key: 'l', label: 'Lohnt sich das?', options: ['ja', 'nein'], expected: 1 },
                ]}
                solution={
                  <>
                    <MB>{'x = 60: \\quad y = -0{,}5 \\cdot 60^2 + 30 \\cdot 60 - 200 = -1800 + 1800 - 200 = -200'}</MB>
                    <p>Bei 60 Hoodies macht die Schülerfirma 200 € Verlust. Die große Bestellung lohnt sich nicht.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Setzt x = 60 in die Gewinnfunktion ein.</>,
                      <>
                        Erst das Quadrat: <M>{'60^2 = 3600'}</M>. Dann <M>{'-0{,}5 \\cdot 3600'}</M> und <M>{'30 \\cdot 60'}</M>.
                      </>,
                      <>
                        <M>{'-1800 + 1800 - 200'}</M>. Ist das Ergebnis negativ, ist es ein Verlust.
                      </>,
                    ]}
                  />
                }
              />
              <div className="lp-ex bk-panel">
                <CardHead title="So sieht die Gewinnfunktion aus" />
                <p>
                  Die Parabel ist nach unten geöffnet (<M>{'a < 0'}</M>). Bis zu einer bestimmten Menge steigt der Gewinn, danach sinkt er wieder. Bei 60 Hoodies liegt der Punkt schon im
                  roten Bereich: Verlust.
                </p>
                <GewinnGraph />
              </div>
              <CheckCard
                title="Und wie viele Hoodies sind ideal?"
                level="erweiterung"
                prompt={
                  <p>
                    Finn fragt: „Okay, keine 60. Aber wie viele sollen wir dann verkaufen?“ Bestimmt den Scheitelpunkt der Gewinnparabel. Tipp: Die Punkte <M>{'(20 \\mid 200)'}</M> und{' '}
                    <M>{'(40 \\mid 200)'}</M> haben denselben y-Wert. Begründet im Heft, warum das hilft.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'x', label: <>Anzahl <M>{'x_S ='}</M></>, expected: 30 },
                  { kind: 'num', key: 'y', label: <>Gewinn <M>{'y_S ='}</M></>, unit: '€', expected: 250 },
                ]}
                solution={
                  <>
                    <p>Eine Parabel ist symmetrisch. Zwei Punkte mit demselben y-Wert liegen gleich weit links und rechts vom Scheitel, der also genau in der Mitte liegt:</p>
                    <MB>{'x_S = \\frac{20 + 40}{2} = 30 \\qquad \\text{oder} \\qquad x_S = -\\frac{b}{2a} = -\\frac{30}{2 \\cdot (-0{,}5)} = 30'}</MB>
                    <MB>{'x = 30: \\quad y_S = -0{,}5 \\cdot 30^2 + 30 \\cdot 30 - 200 = 250'}</MB>
                    <p>Bei 30 verkauften Hoodies ist der Gewinn mit 250 € am größten.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Der Scheitelpunkt ist hier der höchste Punkt der Parabel. Wo liegt er im Graphen ungefähr?</>,
                      <>Wegen der Symmetrie liegt der Scheitel genau in der Mitte zwischen zwei Punkten mit demselben y-Wert.</>,
                      <>
                        Die Mitte zwischen 20 und 40 ist 30. Setzt <M>{'x = 30'}</M> ein und berechnet den Gewinn.
                      </>,
                    ]}
                  />
                }
              />
            </div>
          </Phase>

          {/* 6 Austausch */}
          <Phase no={6} title="Vergleicht eure Wege" social="Plenum" minutes={8}>
            <div className="ls-stop">
              <div className="ls-stop-title">
                <i className="fa-solid fa-hand" aria-hidden="true" /> Stopp: Besprecht eure Ergebnisse mit der Klasse.
              </div>
              <ul>
                <li>Warum bringt ein größerer Verkauf nicht automatisch mehr Gewinn?</li>
                <li>Welche Unbekannte habt ihr beim Additionsverfahren zuerst wegfallen lassen? Wie seid ihr darauf gekommen?</li>
                <li>Wozu braucht man drei Angaben (c und zwei Punkte), um die Parabel festzulegen?</li>
              </ul>
            </div>
            <p>
              <strong>Du arbeitest allein?</strong> So haben zwei andere Teams das Gleichungssystem gelöst. Klappe die Wege auf und vergleiche sie mit deinem.
            </p>
            <div className="ls-ways">
              <details className="ls-way">
                <summary>Team A hat zuerst b wegfallen lassen</summary>
                <div className="ls-way-body">
                  <p>„Wir haben Gleichung I mal 2 genommen, dann stand in beiden 40b. II minus I · 2 ergab −400 = 800a, also a = −0,5. Dann a in I eingesetzt: b = 30.“</p>
                  <p>
                    <strong>Gut:</strong> Man muss nur mit 2 multiplizieren, die Zahlen bleiben klein. <strong>Aber:</strong> Beim Subtrahieren aufpassen: 400 − 800 ist negativ.
                  </p>
                </div>
              </details>
              <details className="ls-way">
                <summary>Team B hat zuerst a wegfallen lassen</summary>
                <div className="ls-way-body">
                  <p>„Wir haben I mal 4 genommen: 1600 = 1600a + 80b. Dann minus II: 1200 = 40b, also b = 30. Danach b in I eingesetzt: a = −0,5.“</p>
                  <p>
                    <strong>Gut:</strong> Funktioniert genauso, das Ergebnis ist gleich. <strong>Aber:</strong> Die Zahlen werden größer. Es lohnt sich, vorher kurz zu schauen, welche
                    Unbekannte leichter wegfällt.
                  </p>
                </div>
              </details>
            </div>
            <p>Beide Wege sind richtig. Beim Additionsverfahren darfst du selbst wählen, welche Unbekannte zuerst wegfällt.</p>
          </Phase>

          {/* 7 Sichern & Lernprodukt */}
          <Phase no={7} title="Das hältst du fest" social="EA" minutes={12}>
            <Rueckbezug pred={pred} />
            <Merke title="Das Additionsverfahren">
              <p>Zwei Gleichungen mit zwei Unbekannten löst du, indem du sie so addierst oder subtrahierst, dass eine Unbekannte wegfällt.</p>
              <ul>
                <li>Gleiche Zahl vor der Unbekannten: Gleichungen subtrahieren.</li>
                <li>Gegenzahlen vor der Unbekannten: Gleichungen addieren.</li>
                <li>Sonst vorher eine oder beide Gleichungen mit einer passenden Zahl multiplizieren.</li>
              </ul>
              <p>Danach die eine Unbekannte berechnen, in eine Ausgangsgleichung einsetzen und die zweite Unbekannte berechnen.</p>
            </Merke>
            <Merke title="Funktionsgleichung aus einem Wert und zwei Punkten (Fall 2)">
              <ol>
                <li>
                  Den bekannten Wert (<M>a</M>, <M>b</M> oder <M>c</M>) in <M>{'y = ax^2 + bx + c'}</M> einsetzen.
                </li>
                <li>Beide Punkte einsetzen. Es entstehen Gleichung I und Gleichung II mit den zwei fehlenden Werten.</li>
                <li>Das Gleichungssystem mit dem Additionsverfahren lösen.</li>
                <li>Alle drei Werte in die allgemeine Form einsetzen und mit einem Punkt die Probe machen.</li>
              </ol>
              <Tabelle
                head={['bekannt', 'beim Subtrahieren fällt weg', 'zuerst berechnen']}
                rows={[
                  ['a (z. B. verschobene Normalparabel a = 1)', 'c', 'b, dann c'],
                  ['b', 'c', 'a, dann c'],
                  ['c (y-Achsenabschnitt)', 'b (vorher multiplizieren)', 'a, dann b'],
                ]}
              />
            </Merke>
            <div className="lp-ex bk-panel" data-no-autocheck>
              <CardHead title="Deine Sprachnachricht an Finn (Lernprodukt)" />
              <p>
                Finn braucht bis Freitag eine Antwort. Nimm eine Sprachnachricht oder ein kurzes Erklärvideo (60 bis 90 Sekunden) mit deinem Tablet auf. Schreib dir vorher hier Stichpunkte
                auf und schick sie zum Üben in den Chat. Hake ab, was in deiner Nachricht vorkommt:
              </p>
              <div className="ls-criteria">
                {[
                  'Deine Entscheidung mit dem berechneten Gewinn bei 60 Hoodies',
                  'Wie du die Gleichung aufgestellt hast: c = −200 und zwei Punkte ergeben Gleichung I und II',
                  'Wie das Additionsverfahren funktioniert und warum dabei eine Unbekannte wegfällt',
                  'Eine Empfehlung, wie viele Hoodies die Schülerfirma verkaufen sollte (Erweiterung)',
                ].map((c) => (
                  <label key={c}>
                    <input type="checkbox" /> <span>{c}</span>
                  </label>
                ))}
              </div>
              <label className="ls-label" htmlFor="sf-skript">
                Deine Stichpunkte
              </label>
              <textarea
                id="sf-skript"
                className="bk-input tc-skript"
                placeholder="Hey Finn, ich habe nachgerechnet …"
                value={skript}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSkript(e.target.value)}
              />
              <div>
                <button
                  type="button"
                  className="bk-btn bk-btn-primary"
                  disabled={!skript.trim()}
                  onClick={() => {
                    setGesendet((g) => [...g, skript.trim()])
                    setSkript('')
                  }}
                >
                  <i className="fa-solid fa-paper-plane" aria-hidden="true" /> In den Chat schicken
                </button>
              </div>
              {gesendet.length > 0 && (
                <Chat titel="Schülerfirma Druckwerk">
                  <Nachricht von="Finn (Vorstand)" zeit="14:12">
                    <p>Und? Bestellen wir die 60? Ich brauch bis Freitag eine Antwort 🙏</p>
                  </Nachricht>
                  {gesendet.map((t, i) => (
                    <div key={i} style={{ display: 'contents' }}>
                      <Nachricht von="Du" zeit="gerade eben" ich>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{t}</p>
                      </Nachricht>
                    </div>
                  ))}
                </Chat>
              )}
            </div>
          </Phase>

          {/* 8 Check */}
          <Phase no={8} title="Check: Hast du es verstanden?" social="EA" minutes={10}>
            <div className="lp-exlist">
              <McCard
                title="Check 1: Punkt einsetzen"
                level="basis"
                rechnen
                prompt={
                  <p>
                    Eine Parabel hat die Gleichung <M>{'y = ax^2 + bx + 4'}</M> und geht durch <M>{'P(2 \\mid 10)'}</M>. Welche Gleichung entsteht beim Einsetzen von P?
                  </p>
                }
                options={[
                  { text: '10 = 2a + 2b + 4', feedback: 'Vor a steht x², also 2² = 4.' },
                  { text: '2 = 100a + 10b + 4', feedback: 'x und y sind vertauscht. Für x wird 2 eingesetzt, für y die 10.' },
                  { text: '10 = 4a + 2b + 4', correct: true, feedback: 'a · 2² + b · 2 + 4 = 4a + 2b + 4. Nach − 4 auf beiden Seiten: 6 = 4a + 2b.' },
                  { text: '10 = 4a + 2b', feedback: 'Das c = 4 darf nicht verloren gehen. Es gehört mit in die Gleichung.' },
                ]}
              />
              <McCard
                title="Check 2: Additionsverfahren"
                level="standard"
                rechnen
                prompt={
                  <>
                    <MB>{'\\begin{aligned} \\text{I: } 4a + 2b &= 6 \\\\ \\text{II: } 4a - 2b &= 10 \\end{aligned}'}</MB>
                    <p>Was ergibt I − II?</p>
                  </>
                }
                options={[
                  { text: '0 = −4', feedback: '2b − (−2b) ist nicht 0, sondern 4b. Das Minus vor −2b macht ein Plus.' },
                  { text: '4b = −4, also b = −1', correct: true, feedback: '4a − 4a = 0, 2b − (−2b) = 4b und 6 − 10 = −4. Also b = −1.' },
                  { text: '8a = 16, also a = 2', feedback: 'Das ist I + II. Auch ein guter Weg, aber gefragt war I − II.' },
                  { text: '4b = 4, also b = 1', feedback: 'Rechts gilt 6 − 10 = −4. Also 4b = −4 und b = −1.' },
                ]}
              />
              <CheckCard
                title="Check 3: Verschobene Normalparabel"
                level="standard"
                prompt={
                  <p>
                    Eine verschobene Normalparabel (<M>{'a = 1'}</M>) geht durch <M>{'P(1 \\mid 2)'}</M> und <M>{'Q(3 \\mid 6)'}</M>. Bestimme <M>b</M> und <M>c</M>.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -2 },
                  { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 3 },
                ]}
                solution={
                  <>
                    <MB>{'\\begin{aligned} \\text{I: } 2 &= 1 + b + c &&\\Rightarrow\\; 1 = b + c \\\\ \\text{II: } 6 &= 9 + 3b + c &&\\Rightarrow\\; -3 = 3b + c \\end{aligned}'}</MB>
                    <MB>{'\\text{I} - \\text{II}: \\quad 4 = -2b \\;\\Rightarrow\\; b = -2 \\qquad \\text{in I: } 1 = -2 + c \\;\\Rightarrow\\; c = 3'}</MB>
                    <p>
                      <M>{'y = x^2 - 2x + 3'}</M>. Probe mit <M>{'x = 3'}</M>: <M>{'y = 9 - 6 + 3 = 6'}</M> ✓
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Setze a = 1 ein: y = x² + bx + c. Dann beide Punkte einsetzen.</>,
                      <>Bring die Zahl, die aus x² entsteht, auf die linke Seite. Vor c steht dann in beiden Gleichungen 1.</>,
                      <>
                        <M>{'\\text{I: } 1 = b + c'}</M> und <M>{'\\text{II: } -3 = 3b + c'}</M>. Rechne I − II, dann fällt c weg.
                      </>,
                    ]}
                  />
                }
              />
              <CheckCard
                title="Check 4: Diesmal ist b bekannt"
                level="erweiterung"
                prompt={
                  <p>
                    Für die Parabel <M>{'y = ax^2 + bx + c'}</M> gilt <M>{'b = 2'}</M>. Sie geht durch <M>{'P(1 \\mid 1)'}</M> und <M>{'Q(-2 \\mid -8)'}</M>. Bestimme <M>a</M> und{' '}
                    <M>c</M>. Erkläre im Heft, welche Unbekannte du wegfallen lässt und warum.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -1 },
                  { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 0 },
                ]}
                solution={
                  <>
                    <MB>{'\\begin{aligned} \\text{I: } 1 &= a + 2 + c &&\\Rightarrow\\; -1 = a + c \\\\ \\text{II: } -8 &= 4a - 4 + c &&\\Rightarrow\\; -4 = 4a + c \\end{aligned}'}</MB>
                    <MB>{'\\text{II} - \\text{I}: \\quad -3 = 3a \\;\\Rightarrow\\; a = -1 \\qquad \\text{in I: } -1 = -1 + c \\;\\Rightarrow\\; c = 0'}</MB>
                    <p>
                      <M>{'y = -x^2 + 2x'}</M>. Vor c steht in beiden Gleichungen 1, darum fällt c beim Subtrahieren direkt weg.
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Setze b = 2 ein und dann beide Punkte. Achte bei Q auf die Vorzeichen: (−2)² = 4 und 2 · (−2) = −4.</>,
                      <>
                        Bring die Zahlen ohne a und c auf die linke Seite: <M>{'\\text{I: } -1 = a + c'}</M>.
                      </>,
                      <>
                        <M>{'\\text{II: } -4 = 4a + c'}</M>. Jetzt II − I rechnen.
                      </>,
                    ]}
                  />
                }
              />
            </div>
          </Phase>

          <nav className="lp-nav" aria-label="Weiter">
            <button type="button" className="bk-btn" onClick={onPrev}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zu Lernsituation 1
            </button>
            <button type="button" className="bk-btn" onClick={onBack}>
              Zurück zur Auswahl
            </button>
            <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
              Weiter üben: Fall 2 <i className="fa-solid fa-arrow-right" aria-hidden="true" />
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
  const diff = Math.abs(pred.gewinn - G60)
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {CHOICE_TEXT[pred.choice]}. Deine Schätzung für 60 Hoodies: {fmt(pred.gewinn, 0)} €.
      </p>
      <p>
        {pred.choice === 'verlust' ? (
          <>Das stimmt: Bei 60 Hoodies macht die Schülerfirma 200 € Verlust. Gut eingeschätzt!</>
        ) : (
          <>Tatsächlich macht die Schülerfirma bei 60 Hoodies 200 € Verlust. Wer mehr verkaufen will, muss so billig werden, dass sich das Geschäft nicht mehr lohnt.</>
        )}{' '}
        {diff === 0 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${fmt(diff, 0)} € daneben.`}
      </p>
      <p>Den besten Gewinn gibt es bei 30 Hoodies: 250 €.</p>
    </div>
  )
}
