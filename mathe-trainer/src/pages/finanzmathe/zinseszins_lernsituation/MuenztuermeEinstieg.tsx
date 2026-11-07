import { useState, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { useSitzungState } from '../../../hooks/useSitzung'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, Loesungsweg, McCard } from '../../lineare_funktionen/lernsituation_kit/kit'
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Handlungsprodukt,
  SeitenLernsituation,
  type Bildwelt,
  type Seite,
  type Thema,
} from '../../lineare_funktionen/lernsituation_kit/seiten'
import { Bilanz } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien, Vermutung, Zitat, standardKriterien, type Festlegung } from '../zins_kit/zins_kit'
import { WachstumGraph, eur, eurTex, kn, knEinfach } from './shared'
import { MuenzturmDuell } from './spiele'
import titelBild from './bilder/titel.webp'
import brettBild from './bilder/brett.webp'
import karteBild from './bilder/karte.webp'
import '../../daten_und_zufall/lernpfad/lernpfad.css'

// Lernsituation Zinseszins 1 „Die Münztürme“: das Endkapital K_n = K_0 · q^n (ca. 60–90 min).
// Format Experimentierlabor: Mira und Jonas haben je 5.000 € gewonnen und legen sie 10 Jahre zu 3 % an. Bei Mira bleiben die Zinsen auf dem
// Konto, Jonas lässt sie aufs Girokonto auszahlen. Hypothese (Vorsprung schätzen), dann im Münzturm-Labor die ersten drei Jahre rechnen:
// Miras Zinsmünze wird jedes Jahr größer (150 € → 154,50 € → 159,14 €). Aha: Zinsen bringen selbst Zinsen, und Jahr für Jahr zu rechnen
// dauert zu lang. Problem lösen: Problem → Beispielrechnung Tim (2.000 €, 4 %, aus der der Zinsfaktor q und K_n = K_0 · q^n entstehen) mit
// Lernvideo → Ergebnisse abgleichen (Mira 6.719,58 €, Jonas 6.500 €, Vorsprung 219,58 €) → Entscheidung → Concept Map → Merke mit Graph.
// Handlungsprodukt analog: Concept Map „Zins oder Zinseszins?“ im Heft (Begriff und Zusammenhang).
// Punkte nach Aufwand: Warm-up 2/2/2/3/2 = 11, Festlegung 3, Münzturm-Labor 4, Kernaufgabe 15, Entscheidung 3, Concept Map 5,
// Übungen 4/5/6/7, Profi 8 (Pflicht zusammen 63: Warm-up 11 = 17 %, Problem erkennen 7 = 11 %, Problem lösen 23 = 37 %, Übungen 22 = 35 %),
// Bonus-Spiel „Münzturm-Duell“ 4 Runden à 2 = 8.
// Identität: Themenfarbe Ocker, Symbol fa-coins, Leitobjekt die beiden Münztürme von Mira und Jonas.
// Bildwelt Diorama / Holzspielzeug: Titelbild, Spielbrett und Concept Map sind gerenderte WebP-Dateien aus bilder-quelle/*.bild.html
// (node scripts/bilder-rendern.cjs src/pages/finanzmathe/zinseszins_lernsituation); Zinsmünzen-Leiste und Graph bleiben Inline-SVG.

/** Lernvideo „Endkapital berechnen“ (auch beim Zinseszinsrechner unter /finanzmathe/zinseszins/ueben verlinkt) */
const VIDEO_KN = 'https://youtu.be/4A8DaY8-Mgw?si=L4IT09_79obIao_W'

const K0 = 5000
const P = 3
const N = 10
const mira = (j: number) => kn(K0, P, j)
const jonas = (j: number) => knEinfach(K0, P, j)
const VORSPRUNG = mira(N) - jonas(N)
// Münzturm-Labor: die Bank schreibt Zinsen auf Cent gerundet gut
const Z2 = 154.5
const K2 = 5304.5
const Z3 = 159.14
const K3 = 5463.64

const THEMA: Thema = {
  name: 'Die Münztürme',
  farbe: 'ocker',
  icon: 'fa-coins',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Spielbrett aus Holz mit zwei gleich hohen Münztürmen. Schilder: Mira 5.000 €, Jonas 5.000 €. Ein Würfel zeigt 3 %, ein Block 10 Jahre. Über beiden Türmen steht ein Fragezeichen."
    />
  ),
}
const BILDWELT: Bildwelt = { welt: 'diorama', variante: 'holzspielzeug' }

/* ── Leitobjekt im Labor: die Zinsmünzen Jahr für Jahr ─────────────────── */

/** Eingabe als Zahl, wenn sie (bis auf tol) stimmt, sonst null */
const wennRichtig = (v: string | undefined, soll: number, tol = 0.011) => {
  const p = v ? parseInput(v) : null
  return p && Math.abs(p.value - soll) <= tol ? soll : null
}

/** Zinsmünzen der ersten drei Jahre: Miras Münze wächst, Jonas’ Münze bleibt gleich (Größe passend zum Betrag, etwas verstärkt) */
function ZinsLeiste({ miraZ }: { miraZ: (number | null)[] }) {
  const r = (z: number) => 60 + (z - 150) * 2.6
  const reihe = (y: number, name: string, werte: (number | null)[]) => (
    <g>
      <text x="20" y={y + 8} fontSize="22" fontWeight="700" fill="var(--ink)">
        {name}
      </text>
      {werte.map((z, i) => {
        const cx = 260 + i * 200
        const rad = z === null ? 60 : r(z)
        return (
          <g key={i}>
            <ellipse cx={cx} cy={y + 6} rx={rad} ry={rad * 0.62} fill="#b8861f" />
            <ellipse cx={cx} cy={y} rx={rad} ry={rad * 0.62} fill={z === null ? '#fff' : name === 'Mira' ? 'var(--primary-soft)' : '#f6d77a'} stroke={z === null ? 'var(--line-strong)' : '#7a4f22'} strokeWidth="2" strokeDasharray={z === null ? '6 5' : undefined} />
            <text x={cx} y={y + 7} textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--ink)">
              {z === null ? '?' : `${fmt(z, 2, true)} €`}
            </text>
          </g>
        )
      })}
    </g>
  )
  return (
    <div className="zz-leiste">
      <svg viewBox="0 0 820 310" role="img" aria-label={`Zinsen in den Jahren 1 bis 3. Jonas: jedes Jahr 150 €. Mira: ${miraZ.map((z) => (z === null ? 'noch offen' : eur(z))).join(', ')}.`}>
        {[1, 2, 3].map((j, i) => (
          <text key={j} x={260 + i * 200} y="30" textAnchor="middle" fontSize="19" fontWeight="700" fill="var(--ink-muted)">
            Zinsen Jahr {j}
          </text>
        ))}
        {reihe(110, 'Mira', miraZ)}
        {reihe(240, 'Jonas', [150, 150, 150])}
      </svg>
    </div>
  )
}

/* ── Problem lösen: Beispielrechnung Tim ─────────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Tim legt <M>{'2\\,000\\text{ €}'}</M> zu <M>{'4\\,\\%'}</M> an. Die Zinsen bleiben auf dem Konto. Wie viel Geld hat er nach 3 Jahren?
  </p>
)
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Nach 1 Jahr: Kapital mal Zinsfaktor',
    body: (
      <>
        <MB>{'K_1 = 2\\,000 + 2\\,000 \\cdot 0{,}04'}</MB>
        <MB>{'K_1 = 2\\,000 \\cdot (1 + 0{,}04) = 2\\,000 \\cdot 1{,}04'}</MB>
        <MB>{'K_1 = 2\\,080\\text{ €}'}</MB>
        <p>
          „Kapital plus 4 % davon“ ist dasselbe wie „Kapital mal <M>{'1{,}04'}</M>“. Diese Zahl heißt <strong>Zinsfaktor</strong>{' '}
          <M>{'q = 1 + \\dfrac{p}{100} = 1 + \\dfrac{4}{100} = 1{,}04'}</M>.
        </p>
      </>
    ),
  },
  {
    title: 'Jedes weitere Jahr: noch einmal mal q',
    body: (
      <>
        <p>Im 2. Jahr wird das neue Kapital wieder mit 1,04 malgenommen. Die Zinsen des 1. Jahres werden dabei mitverzinst.</p>
        <MB>{`K_2 = 2\\,000 \\cdot 1{,}04 \\cdot 1{,}04 = 2\\,000 \\cdot 1{,}04^2`}</MB>
        <MB>{`K_3 = 2\\,000 \\cdot 1{,}04^3`}</MB>
        <p>Jedes Jahr kommt ein Faktor 1,04 dazu. Die Hochzahl ist die Anzahl der Jahre.</p>
      </>
    ),
  },
  {
    title: 'Die Formel',
    body: (
      <>
        <MB>{'K_n = K_0 \\cdot q^n'}</MB>
        <p>
          <M>{'K_0'}</M> ist das Anfangskapital, <M>q</M> der Zinsfaktor, <M>n</M> die Anzahl der Jahre und <M>{'K_n'}</M> das Endkapital nach <M>n</M> Jahren.
        </p>
      </>
    ),
  },
  {
    title: 'In einem Zug in den Taschenrechner',
    body: (
      <>
        <MB>{`K_3 = 2\\,000 \\cdot 1{,}04^3 = ${eurTex(kn(2000, 4, 3))}`}</MB>
        <p>
          Tippe den ganzen Term ein: <M>{'2000 \\cdot 1{,}04 \\,\\boxed{x^y}\\, 3'}</M>. Gerundet wird nur das Ergebnis, auf Cent.
        </p>
      </>
    ),
  },
]

const LOESUNG_KERN = (
  <Loesungsweg
    schritte={[
      { titel: 'Zinsfaktor bestimmen', tex: 'q = 1 + \\dfrac{3}{100} = 1{,}03' },
      { titel: 'Miras Endkapital mit der Formel', tex: [`K_{10} = 5\\,000 \\cdot 1{,}03^{10}`, `K_{10} = ${eurTex(mira(N))}`] },
      { titel: 'Jonas: jedes Jahr 150 € Zinsen', tex: ['Z = 5\\,000 \\cdot 0{,}03 = 150\\text{ €}', '5\\,000 + 10 \\cdot 150 = 6\\,500{,}00\\text{ €}'] },
      { titel: 'Vorsprung berechnen', tex: `${eurTex(mira(N)).replace('\\text{ €}', '')} - 6\\,500 = ${eurTex(VORSPRUNG)}` },
    ]}
  />
)

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function MuenztuermeEinstieg({ onBack, onPractice, onNext }: { onBack: () => void; onPractice: () => void; onNext: () => void }) {
  const [fest, setFest] = useSitzungState<Festlegung<never>>('mt-fest', { wahl: null, wert: 100, fest: false })
  const [labor, setLabor] = useSitzungState('mt-labor', false)
  const [laborEingabe, setLaborEingabe] = useState<Record<string, string>>({})
  const [geloest, setGeloest] = useSitzungState('mt-geloest', false)
  const [uebungen, setUebungen] = useSitzungState<string[]>('mt-uebungen', [])
  /** Pflicht-Übung melden: schaltet „Weiter“ und das Bonus-Spiel frei */
  const uebung = (k: string, fertig: () => void) => () => {
    fertig()
    setUebungen((u) => (u.includes(k) ? u : [...u, k]))
  }
  const miraZ = labor ? [150, Z2, Z3] : [150, wennRichtig(laborEingabe.z2, Z2), wennRichtig(laborEingabe.z3, Z3)]

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
            title="a) Prozent als Dezimalzahl"
            rechnen={false}
            prompt={<p>Schreibe die Zinssätze als Dezimalzahl.</p>}
            rechnung={[
              { l: ['3\\,\\%'], r: [{ luecke: 'a1' }] },
              { l: ['4{,}5\\,\\%'], r: [{ luecke: 'a2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'a1', label: '3 Prozent als Dezimalzahl', expected: 0.03, tol: 0.00001 },
              { kind: 'num', key: 'a2', label: '4,5 Prozent als Dezimalzahl', expected: 0.045, tol: 0.00001 },
            ]}
            solution={<Loesungsweg schritte={[{ titel: 'Prozent heißt „von hundert“', tex: ['3\\,\\% = \\dfrac{3}{100} = 0{,}03', '4{,}5\\,\\% = \\dfrac{4{,}5}{100} = 0{,}045'] }]} />}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) Zinsen für ein Jahr"
            prompt={
              <p>
                Ein Kapital von <M>{'5\\,000\\text{ €}'}</M> wird ein Jahr lang mit <M>{'3\\,\\%'}</M> verzinst. Wie viel Zinsen gibt es?
              </p>
            }
            fields={[{ kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 150, unit: '€' }]}
            solution={<Loesungsweg schritte={[{ titel: 'Kapital mal Zinssatz', tex: 'Z = 5\\,000 \\cdot 0{,}03 = 150\\text{ €}' }]} />}
          />
          <McCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Kapital nach einem Jahr"
            rechnen
            prompt={
              <p>
                <M>{'800\\text{ €}'}</M> werden ein Jahr lang mit <M>{'5\\,\\%'}</M> verzinst. Die Zinsen bleiben auf dem Konto. Wie viel Geld ist nach einem Jahr auf dem Konto?
              </p>
            }
            options={[
              { text: '40 €', feedback: 'Das sind nur die Zinsen. Die 800 € sind ja noch auf dem Konto.' },
              { text: '805 €', feedback: '5 % von 800 € sind nicht 5 €. 5 % bedeutet 0,05 · 800 = 40 €.' },
              { text: '840 €', correct: true, feedback: 'Zinsen 800 · 0,05 = 40 €, dazu das Kapital von 800 €.' },
              { text: '1.200 €', feedback: 'Das wären 50 % Zinsen. 5 % sind 0,05 · 800 = 40 €.' },
            ]}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={3}
            title="d) Zinsen über mehrere Jahre"
            prompt={
              <p>
                <M>{'2\\,000\\text{ €}'}</M> werden mit <M>{'4\\,\\%'}</M> verzinst. Die Zinsen werden jedes Jahr ausgezahlt. Wie viel Zinsen sind das in 4 Jahren zusammen?
              </p>
            }
            fields={[{ kind: 'num', key: 'z', label: 'Zinsen in 4 Jahren:', expected: 320, unit: '€' }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Zinsen für ein Jahr', tex: 'Z = 2\\,000 \\cdot 0{,}04 = 80\\text{ €}' },
                  { titel: 'Vier Jahre lang gleich viel', tex: '4 \\cdot 80 = 320\\text{ €}' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Die Zinsen werden ausgezahlt. Das Kapital bleibt also jedes Jahr bei 2.000 €.</>,
                  <>Berechne die Zinsen für ein Jahr und nimm sie mal 4.</>,
                  <>
                    <M>{'2\\,000 \\cdot 0{,}04 = 80'}</M> € pro Jahr.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title="e) Ganzer Term in den Taschenrechner"
            prompt={<p>Tippe jeden Term in einem Zug in den Taschenrechner, mit der Potenztaste (z. B. ^ oder xʸ).</p>}
            rechnung={[
              { l: ['400 \\cdot 1{,}1^3'], r: [{ luecke: 'e1', breit: true }] },
              { l: ['50 \\cdot 1{,}2^4'], r: [{ luecke: 'e2', breit: true }] },
            ]}
            fields={[
              { kind: 'num', key: 'e1', label: '400 mal 1,1 hoch 3', expected: 532.4, tol: 0.001 },
              { kind: 'num', key: 'e2', label: '50 mal 1,2 hoch 4', expected: 103.68, tol: 0.001 },
            ]}
            solution={<Loesungsweg schritte={[{ titel: 'Potenz zuerst, dann mal', tex: ['400 \\cdot 1{,}1^3 = 400 \\cdot 1{,}331 = 532{,}4', '50 \\cdot 1{,}2^4 = 50 \\cdot 2{,}0736 = 103{,}68'] }]} />}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Zwei Gewinner, zwei Münztürme',
      pflicht: ['fest', 'labor'],
      bedingung: 'Halte deine Vermutung fest und rechne im Münzturm-Labor die ersten drei Jahre, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Mira und Jonas haben bei einem Gewinnspiel je 5.000 € gewonnen. Beide legen das Geld für 10 Jahre zu 3 % pro Jahr an. Jonas lässt sich die Zinsen jedes Jahr aufs
            Girokonto überweisen. Bei Mira bleiben die Zinsen auf dem Sparkonto.
          </p>
          <Zitat wer="Jonas">
            <p>„Wir bekommen beide 3 %. Dann haben wir nach 10 Jahren doch gleich viel, oder?“</p>
          </Zitat>
          <p className="sl-text">Gesucht ist, wie viel Geld beide nach 10 Jahren haben und wie groß Miras Vorsprung ist.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst vermuten, dann im Labor nachrechnen</p>
            <p>Lege dich fest, wie viel mehr Mira nach 10 Jahren hat, ohne zu rechnen. Rechne danach im Münzturm-Labor die ersten drei Jahre nach.</p>
          </div>
          <p className="sl-hinweis">Einzelarbeit, ca. 10 Minuten.</p>
          <figure className="sl-foto">
            <img
              src={brettBild}
              width={1200}
              height={600}
              alt="Spielbrett mit den Münztürmen von Mira und Jonas, je 5.000 €. Bei Mira fällt die Zinsmünze zurück auf ihren Turm: Zinsen bleiben im Turm. Bei Jonas wandert die Zinsmünze in eine Kiste mit der Aufschrift Girokonto: Zinsen gehen raus."
            />
          </figure>
          <Abschnitt titel="1. Deine Vermutung">
            <Vermutung
              regler={{
                min: 0,
                max: 1000,
                step: 10,
                text: (v) => (
                  <>
                    Mira hat nach 10 Jahren etwa <span className="ls-slider-value">{fmt(v, 0)} €</span> mehr als Jonas.
                  </>
                ),
              }}
              wert={fest}
              onChange={setFest}
              onFest={fertig.teil('fest')}
              gespeichert={(w) => (
                <>
                  Deine Vermutung: Mira hat nach 10 Jahren etwa <strong>{fmt(w.wert, 0)} €</strong> mehr als Jonas.
                </>
              )}
            />
          </Abschnitt>
          {fest.fest && (
            <Abschnitt titel="2. Das Münzturm-Labor">
              <p className="sl-text">
                Mit der Zinsrechnung kannst du das schon. Bei Mira rechnest du die Zinsen jedes Jahr vom neuen Kapital aus, die Bank rundet auf Cent. Jede richtige Zinsmünze
                erscheint unten in der Leiste.
              </p>
              <CheckCard
                onSolved={() => {
                  setLabor(true)
                  fertig.teil('labor')()
                }}
                punkte={4}
                title="Miras Konto Jahr für Jahr"
                prompt={<p>Jahr 1 ist schon ausgerechnet. Trage für Mira die Zinsen und das Kapital am Ende von Jahr 2 und Jahr 3 ein.</p>}
                rechnung={[
                  { l: ['Z_1'], r: ['5\\,000 \\cdot 0{,}03 = 150'] },
                  { l: ['K_1'], r: ['5\\,000 + 150 = 5\\,150'] },
                  { l: ['Z_2'], r: ['5\\,150 \\cdot 0{,}03 =', { luecke: 'z2' }] },
                  { l: ['K_2'], r: ['5\\,150 + Z_2 =', { luecke: 'k2', breit: true }] },
                  { l: ['Z_3'], r: ['K_2 \\cdot 0{,}03 =', { luecke: 'z3' }] },
                  { l: ['K_3'], r: ['K_2 + Z_3 =', { luecke: 'k3', breit: true }] },
                ]}
                fields={[
                  { kind: 'num', key: 'z2', label: 'Zinsen im Jahr 2', expected: Z2, unit: '€', tol: 0.011 },
                  { kind: 'num', key: 'k2', label: 'Kapital am Ende von Jahr 2', expected: K2, unit: '€', tol: 0.011 },
                  { kind: 'num', key: 'z3', label: 'Zinsen im Jahr 3', expected: Z3, unit: '€', tol: 0.011 },
                  { kind: 'num', key: 'k3', label: 'Kapital am Ende von Jahr 3', expected: K3, unit: '€', tol: 0.011 },
                ]}
                onEingabe={setLaborEingabe}
                solution={
                  <Loesungsweg
                    schritte={[
                      { titel: 'Jahr 2: Zinsen vom neuen Kapital', tex: ['Z_2 = 5\\,150 \\cdot 0{,}03 = 154{,}50\\text{ €}', 'K_2 = 5\\,150 + 154{,}50 = 5\\,304{,}50\\text{ €}'] },
                      { titel: 'Jahr 3: wieder vom neuen Kapital', tex: ['Z_3 = 5\\,304{,}50 \\cdot 0{,}03 \\approx 159{,}14\\text{ €}', 'K_3 = 5\\,304{,}50 + 159{,}14 = 5\\,463{,}64\\text{ €}'] },
                    ]}
                  />
                }
                help={
                  <Hilfen
                    steps={[
                      <>Die Zinsen eines Jahres sind 3 % vom Kapital am Jahresanfang. Das Kapital am Jahresende ist Anfang plus Zinsen.</>,
                      <>
                        Jahr 2 beginnt mit 5.150 €. Zinsen: <M>{'5\\,150 \\cdot 0{,}03'}</M>. Dann <M>{'K_2 = 5\\,150 + Z_2'}</M>.
                      </>,
                      <>
                        <M>{'Z_2 = 154{,}50'}</M> und <M>{'K_2 = 5\\,304{,}50'}</M>. Jahr 3 beginnt mit <M>{'5\\,304{,}50'}</M> €.
                      </>,
                    ]}
                  />
                }
              />
              <ZinsLeiste miraZ={miraZ} />
              {labor && (
                <p className="sl-text zz-erkenntnis" role="status">
                  <strong>Schon gemerkt?</strong> Jonas bekommt jedes Jahr 150 €. Miras Zinsmünze wird jedes Jahr größer: 150 €, 154,50 €, 159,14 €. Ihre Zinsen bringen im
                  nächsten Jahr selbst wieder Zinsen. Für 10 Jahre müsstest du jetzt noch sieben Jahre so weiterrechnen, bei 30 Jahren dreißigmal. Gleich lernst du einen
                  schnellen Weg.
                </p>
              )}
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Münztürme nach 10 Jahren',
      pflicht: ['kern', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 20 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Wer hat nach 10 Jahren mehr, und wie viel?</p>
            <p>
              Mira und Jonas legen je 5.000 € für 10 Jahre zu 3 % pro Jahr an. Bei Mira bleiben die Zinsen auf dem Konto, Jonas lässt sie auszahlen. Berechne in deinem Heft, wie
              viel Geld beide nach 10 Jahren haben (bei Jonas mit den ausgezahlten Zinsen) und wie groß Miras Vorsprung ist. Finde für Mira einen schnellen Weg statt zehn
              einzelner Jahre.
            </p>
          </div>
          <figure className="sl-foto">
            <img
              src={brettBild}
              width={1200}
              height={600}
              alt="Spielbrett mit den Münztürmen von Mira und Jonas, je 5.000 €. Bei Mira bleiben die Zinsen im Turm, bei Jonas gehen sie aufs Girokonto."
            />
          </figure>
          <BeispielMitVideo video={VIDEO_KN} videoTitel="Lernvideo: Endkapital mit Zinseszins berechnen">
            <Beispiel offen title="Wie wächst Tims Geld?" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('kern')()
                setGeloest(true)
              }}
              punkte={15}
              title="Mira und Jonas nach 10 Jahren"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein, auf Cent gerundet. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'm', label: 'Wie viel Geld hat Mira nach 10 Jahren auf ihrem Sparkonto?', expected: mira(N), unit: '€', tol: 0.011 },
                { kind: 'num', key: 'j', label: 'Wie viel Geld hat Jonas nach 10 Jahren, Sparkonto und ausgezahlte Zinsen zusammen?', expected: jonas(N), unit: '€', tol: 0.011 },
                { kind: 'num', key: 'v', label: 'Wie viel mehr hat Mira?', expected: VORSPRUNG, unit: '€', tol: 0.011 },
              ]}
              loesungNachFehler
              solution={LOESUNG_KERN}
              help={
                <Hilfen
                  steps={[
                    <>Wie wird im Beispiel aus 4 % der Zinsfaktor? Mache dasselbe mit 3 % und setze in die Formel ein.</>,
                    <>
                      <M>{'q = 1{,}03'}</M>, <M>{'K_0 = 5\\,000'}</M>, <M>{'n = 10'}</M>. Jonas bekommt jedes Jahr gleich viel Zinsen: 150 €.
                    </>,
                    <>
                      Mira: <M>{'K_{10} = 5\\,000 \\cdot 1{,}03^{10}'}</M> in einem Zug in den Taschenrechner. Jonas: <M>{'5\\,000 + 10 \\cdot 150'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Deine Entscheidung">
            <McCard
              onSolved={fertig.teil('entscheidung')}
              punkte={3}
              title="Was sagst du Jonas?"
              prompt={<p>Jonas überlegt, die Zinsen in Zukunft auch auf dem Konto zu lassen. Was stimmt?</p>}
              options={[
                { text: 'Das bringt nichts, beide bekommen ja 3 %.', feedback: 'Der Zinssatz ist gleich, aber bei Mira werden auch die Zinsen verzinst. Deshalb hat sie mehr.' },
                { text: 'Das bringt jedes Jahr genau 150 € mehr.', feedback: 'Der Unterschied wächst nicht gleichmäßig. Im 1. Jahr gibt es noch gar keinen Unterschied.' },
                {
                  text: 'Es lohnt sich: Die Zinsen werden mitverzinst, und der Vorsprung wird mit jedem Jahr größer.',
                  correct: true,
                  feedback: 'Nach 10 Jahren sind es 219,58 €, und der Vorsprung wächst danach immer schneller.',
                },
                { text: 'Es lohnt sich nur, wenn er mehr als 5.000 € anlegt.', feedback: 'Zinseszins wirkt bei jedem Betrag. Auch bei kleinen Beträgen werden die Zinsen mitverzinst.' },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Concept Map „Zins oder Zinseszins?“">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={karteBild}
                width={1200}
                height={480}
                alt="Ein Blatt auf dem Holztisch mit einer Concept Map: in der Mitte Zins oder Zinseszins?, verbunden mit den Kärtchen Zins, Zinseszins, Formel, Graph und Beispiel. Daneben liegen Münzen und ein Stift."
              />
            </figure>
            <p className="sl-text">
              Lege in deinem Heft eine Concept Map an: In der Mitte steht „Zins oder Zinseszins?“. Erkläre beide Wege mit Mira und Jonas, schreibe deine Rechnung und die Formel
              dazu und verbinde, was zusammengehört. Lass Platz: In der nächsten Lernsituation wächst sie weiter.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Zins: Die Zinsen werden ausgezahlt, deshalb …“</li>
                <li>„Zinseszins: Die Zinsen bleiben auf dem Konto und …“</li>
                <li>„Aus dem Zinssatz wird der Zinsfaktor: 3 % → q = …“</li>
                <li>„Jonas, nach 10 Jahren hat Mira … mehr als du, weil …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Concept Map vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien('an Jonas')} />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug fest={fest} />
              <Merke title="Zinseszins und Endkapital">
                <p>
                  Bleiben die Zinsen auf dem Konto, werden sie im nächsten Jahr <strong>mitverzinst</strong>. Das nennt man <strong>Zinseszins</strong>.
                </p>
                <MB>{'K_n = K_0 \\cdot q^n \\qquad q = 1 + \\dfrac{p}{100}'}</MB>
                <ul className="zk-liste">
                  <li>
                    <M>{'K_0'}</M> = Anfangskapital, <M>{'K_n'}</M> = Endkapital nach <M>n</M> Jahren, <M>p</M> = Zinssatz, <M>q</M> = Zinsfaktor, <M>n</M> = Anzahl der Jahre
                  </li>
                  <li>
                    Aus dem Zinssatz wird der Zinsfaktor: <M>{'3\\,\\% \\to q = 1{,}03'}</M>, <M>{'4{,}5\\,\\% \\to q = 1{,}045'}</M>.
                  </li>
                  <li>Den ganzen Term in einem Zug in den Taschenrechner tippen, nur das Ergebnis runden.</li>
                  <li>Ohne Zinseszins (Zinsen werden ausgezahlt) wächst das Geld jedes Jahr um denselben Betrag, mit Zinseszins immer schneller.</li>
                </ul>
              </Merke>
              <p className="sl-text">Im Graphen siehst du beide Münztürme über 30 Jahre. Schiebe den Regler.</p>
              <WachstumGraph k0={K0} p={P} />
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
          <Abschnitt titel="Übung 1: Welche Rechnung passt?">
            <McCard
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              title="Übung 1"
              level="basis"
              prompt={
                <p>
                  <M>{'2\\,000\\text{ €}'}</M> werden 5 Jahre lang zu <M>{'4\\,\\%'}</M> angelegt. Die Zinsen bleiben auf dem Konto. Welche Rechnung liefert das Endkapital?
                </p>
              }
              options={[
                { text: <M>{'2\\,000 \\cdot (1 + 0{,}04 \\cdot 5)'}</M>, feedback: 'Das ist die Rechnung ohne Zinseszins: Die Zinsen wären jedes Jahr gleich.' },
                { text: <M>{'2\\,000 \\cdot 4^5'}</M>, feedback: 'Der Zinsfaktor ist nicht 4, sondern 1 + 4/100 = 1,04.' },
                { text: <M>{'2\\,000 \\cdot 1{,}4^5'}</M>, feedback: '4 % sind 0,04, nicht 0,4. Der Zinsfaktor ist 1,04.' },
                { text: <M>{'2\\,000 \\cdot 1{,}04^5'}</M>, correct: true, feedback: 'Zinsfaktor q = 1,04, Hochzahl 5 für 5 Jahre.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <McCard
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={5}
              title="Übung 2"
              rechnen
              level="standard"
              prompt={
                <p>
                  Anna und Ben legen je <M>{'1\\,000\\text{ €}'}</M> für 2 Jahre zu <M>{'6\\,\\%'}</M> an, die Zinsen bleiben auf dem Konto. Anna sagt: „Ich habe 1.120 €, denn
                  2 · 60 € Zinsen.“ Ben sagt: „Ich habe 1.123,60 €.“ Wer hat recht?
                </p>
              }
              options={[
                { text: 'Anna, denn die Zinsen sind in beiden Jahren gleich: 60 €.', feedback: 'Im 2. Jahr sind die Zinsen 6 % von 1.060 €, also 63,60 €.' },
                { text: <>Ben: <M>{'1\\,000 \\cdot 1{,}06^2 = 1\\,123{,}60'}</M> €</>, correct: true, feedback: 'Im 2. Jahr gibt es 3,60 € Zinsen auf die Zinsen des 1. Jahres.' },
                { text: 'Beide, es kommt auf die Rechenweise an.', feedback: 'Die Zinsen bleiben auf dem Konto. Dann gibt es nur ein richtiges Ergebnis: mit Zinseszins.' },
                { text: 'Keiner, das Ergebnis muss 1.060 € sein.', feedback: '1.060 € hätte man nach einem Jahr. Hier sind es 2 Jahre.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Lenas Ausbildungsgeld">
            <CheckCard
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Lena legt <M>{'3\\,500\\text{ €}'}</M> für 8 Jahre zu <M>{'2{,}5\\,\\%'}</M> an. Die Zinsen bleiben auf dem Konto. Wie viel Geld hat sie am Ende?
                </p>
              }
              fields={[{ kind: 'num', key: 'k', label: <M>{'K_8 ='}</M>, expected: kn(3500, 2.5, 8), unit: '€', tol: 0.011 }]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Zinsfaktor bestimmen', tex: 'q = 1 + \\dfrac{2{,}5}{100} = 1{,}025' },
                    { titel: 'In die Formel einsetzen', tex: ['K_8 = 3\\,500 \\cdot 1{,}025^8', `K_8 = ${eurTex(kn(3500, 2.5, 8))}`] },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>
                      Notiere <M>{'K_0'}</M>, <M>p</M> und <M>n</M>.
                    </>,
                    <>
                      Berechne zuerst den Zinsfaktor <M>{'q = 1 + \\frac{p}{100}'}</M>, dann <M>{'K_n = K_0 \\cdot q^n'}</M>.
                    </>,
                    <>
                      <M>{'K_8 = 3\\,500 \\cdot 1{,}025^8'}</M>
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Was bringt der Zinseszins?">
            <CheckCard
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={7}
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  <M>{'4\\,000\\text{ €}'}</M> werden 6 Jahre zu <M>{'3{,}5\\,\\%'}</M> angelegt, die Zinsen bleiben auf dem Konto. Wie viel Zinsen sind das insgesamt? Und wie viel
                  mehr ist das als ohne Zinseszins?
                </p>
              }
              fields={[
                { kind: 'num', key: 'z', label: 'Zinsen insgesamt mit Zinseszins:', expected: kn(4000, 3.5, 6) - 4000, unit: '€', tol: 0.011 },
                { kind: 'num', key: 'd', label: 'So viel mehr als ohne Zinseszins:', expected: kn(4000, 3.5, 6) - knEinfach(4000, 3.5, 6), unit: '€', tol: 0.011 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Endkapital mit Zinseszins', tex: `K_6 = 4\\,000 \\cdot 1{,}035^6 = ${eurTex(kn(4000, 3.5, 6))}` },
                    { titel: 'Zinsen sind Endkapital minus Anfangskapital', tex: `${eurTex(kn(4000, 3.5, 6)).replace('\\text{ €}', '')} - 4\\,000 = ${eurTex(kn(4000, 3.5, 6) - 4000)}` },
                    { titel: 'Ohne Zinseszins: jedes Jahr gleich viel', tex: ['4\\,000 \\cdot 0{,}035 = 140\\text{ €}', '6 \\cdot 140 = 840\\text{ €}'] },
                    { titel: 'Unterschied', tex: `${eurTex(kn(4000, 3.5, 6) - 4000).replace('\\text{ €}', '')} - 840 = ${eurTex(kn(4000, 3.5, 6) - 4000 - 840)}` },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Berechne das Endkapital mit der Formel. Die Zinsen sind Endkapital minus Anfangskapital.</>,
                    <>Ohne Zinseszins sind die Zinsen jedes Jahr gleich: 3,5 % von 4.000 €. Nimm sie mal 6.</>,
                    <>
                      <M>{'K_6 = 4\\,000 \\cdot 1{,}035^6'}</M>, ohne Zinseszins <M>{'6 \\cdot 140 = 840'}</M> €.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Mehr als 200 € Zinsen">
            <CheckCard
              title="Übung 5"
              profi
              punkte={8}
              level="erweiterung"
              prompt={<p>Mira bekommt im 1. Jahr 150 € Zinsen, danach jedes Jahr mehr. In welchem Jahr bekommt sie zum ersten Mal mehr als 200 € Zinsen?</p>}
              fields={[{ kind: 'num', key: 'j', label: 'im Jahr', expected: 11 }]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Ab welchem Kapital gibt es mehr als 200 € Zinsen?', tex: '\\dfrac{200}{0{,}03} \\approx 6\\,666{,}67\\text{ €}' },
                    { titel: 'Kapital am Anfang von Jahr 10 und Jahr 11', tex: [`K_9 = ${eurTex(mira(9))}`, `K_{10} = ${eurTex(mira(10))}`] },
                    { titel: 'Zinsen in Jahr 11', tex: `Z_{11} = ${eurTex(mira(10)).replace('\\text{ €}', '')} \\cdot 0{,}03 \\approx ${eurTex(mira(10) * 0.03)}`, text: 'Im 10. Jahr sind es erst 195,72 €.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Die Zinsen eines Jahres hängen vom Kapital am Jahresanfang ab. Wie groß muss es sein, damit 3 % davon mehr als 200 € sind?</>,
                    <>Kapital · 0,03 &gt; 200. Rechne aus, ab welchem Kapital das gilt, und suche das Jahr.</>,
                    <>
                      Ab etwa <M>{'6\\,666{,}67'}</M> €. Miras Kapital nach 10 Jahren ist <M>{eurTex(mira(10))}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length >= 4} titel="Münzturm-Duell">
            <MuenzturmDuell />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>Du kannst jetzt das Endkapital mit Zinseszins berechnen. In der nächsten Lernsituation stellst du die Formel um und beantwortest Miras drei Fragen.</p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn" onClick={onPractice}>
                Weiter üben: Zinseszins
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onNext}>
                Lernsituation 2: Miras drei Fragen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell title="Zinseszins: Die Münztürme" width="wide" kompakt parent={{ to: '/finanzmathe/zinseszins', label: 'Zinseszins' }}>
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        bildwelt={BILDWELT}
        ziel={
          <>
            Mira und Jonas haben gleich viel Geld gewonnen und legen es gleich lang an. Du findest heraus, warum Zinsen, die auf dem Konto bleiben, mehr bringen, und berechnest
            das Endkapital mit der Zinseszinsformel.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Vermutung aus „Problem erkennen“ */
function Rueckbezug({ fest }: { fest: Festlegung<never> }) {
  if (!fest.fest) return null
  const diff = Math.abs(fest.wert - VORSPRUNG)
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> Mira hat etwa {fmt(fest.wert, 0)} € mehr. Tatsächlich hat Mira {eur(mira(N))}, Jonas {eur(jonas(N))}, der Vorsprung beträgt{' '}
        {eur(VORSPRUNG)}.{' '}
        {diff <= 25
          ? 'Deine Schätzung war sehr nah dran!'
          : fest.wert === 0
            ? 'Du hattest wie Jonas mit „gleich viel“ gerechnet. Der Grund für den Unterschied: Miras Zinsen werden selbst wieder verzinst.'
            : `Deine Schätzung lag ${fmt(diff, 0)} € ${fest.wert > VORSPRUNG ? 'zu hoch' : 'zu niedrig'}.`}{' '}
        Nach 30 Jahren wären es schon {eur(mira(30) - jonas(30))} Vorsprung.
      </p>
    </div>
  )
}
