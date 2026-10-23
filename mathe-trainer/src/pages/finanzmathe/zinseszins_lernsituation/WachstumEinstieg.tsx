import { useState } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, McCard, TrackedCheck, TrackedMc } from '../../lineare_funktionen/lernsituation_kit/kit'
import { SeitenLernsituation, type Seite, type Thema } from '../../lineare_funktionen/lernsituation_kit/seiten'
import { GegebenGesucht, Kriterien, VideoAufklappen, Vermutung, Zitat, type Festlegung } from '../zins_kit/zins_kit'
import { WachstumGraph, eur, eurTex, kn, knEinfach } from './shared'
import '../../daten_und_zufall/lernpfad/lernpfad.css'

// Lernsituation Zinseszins 1 „Wer hat nach 10 Jahren mehr?“: das Endkapital K_n (ca. 90 min).
// Format Kontrastierende Fälle: Mira lässt die Zinsen auf dem Konto, Jonas lässt sie auszahlen. Lernprodukt analog (Concept Map, A3).
// Problem zuerst: Die SuS rechnen Jahr für Jahr nach (mit der Zinsrechnung schaffen sie das). Danach Aufgabe (10 Jahre) →
// Rechenbeispiel mit anderen Zahlen (Tim, 2.000 €, 4 %), aus dem der Zinsfaktor q und K_n = K_0 · q^n entstehen → eigene Rechnung.
// Identität: Themenfarbe Violett, Symbol Keimling, Titelbild zwei Sparkonten (Zinsen bleiben / Zinsen gehen raus), Leitobjekt dasselbe Bild
// und der Wachstumsgraph. Die Festlegung bleibt nur im Seitenzustand.

const VIDEO_KN = 'https://youtu.be/4A8DaY8-Mgw?si=L4IT09_79obIao_W'

const K0 = 5000
const P = 3
const N = 10
const mira = (j: number) => kn(K0, P, j)
const jonas = (j: number) => knEinfach(K0, P, j)
const VORSPRUNG = mira(N) - jonas(N)

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Zwei Sparkonten: Bei Mira fließen die Zinsen zurück ins Konto, bei Jonas gehen sie aufs Girokonto */
function ZweiKonten({ titel = false }: { titel?: boolean }) {
  const glas = (x: number, name: string, muenzen: number) => (
    <g>
      <path d={`M${x} 92 L${x} 196 Q${x} 208 ${x + 12} 208 L${x + 148} 208 Q${x + 160} 208 ${x + 160} 196 L${x + 160} 92`} fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
      {Array.from({ length: muenzen }, (_, i) => (
        <ellipse key={i} cx={x + 80} cy={196 - i * 13} rx="56" ry="9" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
      ))}
      <text x={x + 80} y="238" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
        {name}
      </text>
    </g>
  )
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Zwei Sparkonten mit je 5.000 Euro zu 3 Prozent. Bei Mira fließen die Zinsen zurück auf das Sparkonto, bei Jonas gehen sie auf das Girokonto."
    >
      <defs>
        <marker id="zz-pfeil" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--primary)" />
        </marker>
      </defs>
      {titel && <rect x="0" y="0" width="720" height="252" fill="var(--primary-soft)" />}
      {/* Mira */}
      {glas(70, 'Mira', 6)}
      <path d="M210 150 C 290 120, 290 40, 150 50 C 110 52, 140 70, 150 84" fill="none" stroke="var(--primary)" strokeWidth="4" markerEnd="url(#zz-pfeil)" />
      <text x="215" y="26" textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--primary)">
        Zinsen bleiben
      </text>
      {/* Jonas */}
      {glas(420, 'Jonas', 5)}
      <path d="M560 150 C 620 140, 640 120, 642 84" fill="none" stroke="var(--primary)" strokeWidth="4" markerEnd="url(#zz-pfeil)" />
      <rect x="590" y="34" width="104" height="44" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <text x="642" y="62" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">
        Girokonto
      </text>
      <text x="642" y="24" textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--primary)">
        Zinsen gehen raus
      </text>
      <text x="325" y="160" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--ink-muted)">
        je 5.000 €
      </text>
      <text x="325" y="184" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--ink-muted)">
        3 % pro Jahr
      </text>
    </svg>
  )
}

const THEMA: Thema = { name: 'Wer hat nach 10 Jahren mehr?', farbe: 'violett', icon: 'fa-seedling', bild: <ZweiKonten titel /> }

/* ── Rechenbeispiel: Tim ────────────────────────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Tim legt <M>{'2000\\text{ €}'}</M> zu <M>{'4\\,\\%'}</M> an. Die Zinsen bleiben auf dem Konto. Wie viel Geld hat er nach 1, 2 und 3 Jahren? Welches Muster steckt dahinter?
  </p>
)
const BSP_SCHRITTE = [
  {
    title: 'Nach 1 Jahr: Kapital mal Zinsfaktor',
    body: (
      <>
        <MB>{'K_1 = 2000 + 2000 \\cdot 0{,}04 = 2000 \\cdot (1 + 0{,}04) = 2000 \\cdot 1{,}04 = 2080'}</MB>
        <p>
          „Kapital plus 4 % davon“ ist dasselbe wie „Kapital mal <M>{'1{,}04'}</M>“. Diese Zahl heißt <strong>Zinsfaktor</strong> <M>q</M>:{' '}
          <M>{'q = 1 + \\frac{4}{100} = 1{,}04'}</M>.
        </p>
      </>
    ),
  },
  {
    title: 'Nach 2 Jahren: noch einmal mal q',
    body: (
      <>
        <p>Im 2. Jahr wird das neue Kapital wieder mit 1,04 malgenommen. Die Zinsen des 1. Jahres werden dabei mitverzinst.</p>
        <MB>{`K_2 = 2000 \\cdot 1{,}04 \\cdot 1{,}04 = 2000 \\cdot 1{,}04^2 = ${eurTex(kn(2000, 4, 2))}`}</MB>
      </>
    ),
  },
  {
    title: 'Nach 3 Jahren: das Muster',
    body: (
      <>
        <MB>{`K_3 = 2000 \\cdot 1{,}04^3 = ${eurTex(kn(2000, 4, 3))}`}</MB>
        <p>Jedes Jahr kommt ein Faktor 1,04 dazu. Die Hochzahl ist die Anzahl der Jahre.</p>
      </>
    ),
  },
  {
    title: 'Die Formel',
    body: (
      <>
        <MB>{'K_n = K_0 \\cdot q^n \\qquad \\text{mit } q = 1 + \\frac{p}{100}'}</MB>
        <p>
          <M>{'K_0'}</M> ist das Anfangskapital, <M>p</M> der Zinssatz, <M>n</M> die Anzahl der Jahre und <M>{'K_n'}</M> das Endkapital. Im Taschenrechner:{' '}
          <M>{'2000 \\cdot 1{,}04 \\,\\boxed{x^y}\\, 3'}</M>.
        </p>
      </>
    ),
  },
]

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function WachstumEinstieg({ onBack, onPractice, onNext }: { onBack: () => void; onPractice: () => void; onNext: () => void }) {
  const [fest, setFest] = useState<Festlegung<never>>({ wahl: null, wert: 100, fest: false })

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen 1: Zinsen für ein Jahr',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="a) Zinsen für ein Jahr"
          level="basis"
          prompt={
            <p>
              Ein Kapital von <M>{'5000\\text{ €}'}</M> wird mit <M>{'3\\,\\%'}</M> pro Jahr verzinst. Wie viel Zinsen gibt es für ein Jahr?
            </p>
          }
          fields={[{ kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 150, unit: '€' }]}
          solution={<MB>{'Z = 5000 \\cdot \\frac{3}{100} = 150\\text{ €}'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 2: Prozent als Dezimalzahl',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="b) Prozent als Dezimalzahl"
          level="basis"
          prompt={
            <p>
              Schreibe <M>{'3\\,\\%'}</M> als Dezimalzahl.
            </p>
          }
          fields={[{ kind: 'num', key: 'd', label: <M>{'3\\,\\% ='}</M>, expected: 0.03, tol: 0.0001 }]}
          solution={<MB>{'3\\,\\% = \\frac{3}{100} = 0{,}03'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 3: Zinsen über mehrere Jahre',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="c) Zinsen über mehrere Jahre"
          level="standard"
          prompt={
            <p>
              <M>{'2000\\text{ €}'}</M> werden mit <M>{'4\\,\\%'}</M> verzinst. Die Zinsen werden jedes Jahr ausgezahlt. Wie viel Zinsen sind das in 4 Jahren insgesamt?
            </p>
          }
          fields={[{ kind: 'num', key: 'z', label: <>Zinsen in 4 Jahren</>, expected: 320, unit: '€' }]}
          solution={<MB>{'2000 \\cdot \\frac{4}{100} = 80\\text{ €} \\qquad 4 \\cdot 80\\text{ €} = 320\\text{ €}'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 4: Kapital nach einem Jahr',
      inhalt: (fertig) => (
        <McCard
          onSolved={fertig}
          title="d) Kapital nach einem Jahr"
          rechnen
          level="standard"
          prompt={
            <p>
              <M>{'800\\text{ €}'}</M> werden ein Jahr lang mit <M>{'5\\,\\%'}</M> verzinst. Die Zinsen bleiben auf dem Konto. Wie viel Geld ist nach einem Jahr auf dem Konto?
            </p>
          }
          options={[
            { text: '40 €', feedback: 'Das sind nur die Zinsen. Das Kapital von 800 € ist ja noch auf dem Konto.' },
            { text: '840 €', correct: true, feedback: 'Zinsen 800 · 0,05 = 40 €, dazu das Kapital von 800 €.' },
            { text: '805 €', feedback: '5 % von 800 € sind nicht 5 €. 5 % bedeutet 5 von 100, also 0,05 · 800.' },
            { text: '1.200 €', feedback: 'Das wären 50 % Zinsen. 5 % sind 0,05 · 800 = 40 €.' },
          ]}
        />
      ),
    },
    {
      art: 'problem',
      titel: 'Zwei Gewinner, zwei Wege',
      bedingung: 'Halte deine Vermutung fest, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Mira und Jonas haben bei einem Gewinnspiel je 5.000 € gewonnen. Beide legen das Geld für 10 Jahre zu 3 % pro Jahr an.</p>
          <Zitat wer="Jonas">
            <p>Ich lasse mir die Zinsen jedes Jahr aufs Girokonto überweisen. Dort liegen sie dann einfach.</p>
          </Zitat>
          <Zitat wer="Mira">
            <p>Bei mir bleiben die Zinsen auf dem Sparkonto. Die Bank schreibt sie mir jedes Jahr gut.</p>
          </Zitat>
          <Zitat wer="Jonas">
            <p>Dann haben wir nach 10 Jahren doch gleich viel, oder?</p>
          </Zitat>
          <div className="zk-bild">
            <ZweiKonten />
          </div>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Lege dich fest, ohne zu rechnen</p>
            <p>Wie viel mehr Geld hat Mira nach 10 Jahren als Jonas? Wenn du denkst, dass beide gleich viel haben, stelle 0 € ein.</p>
          </div>
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
            onFest={fertig}
            gespeichert={(w) => (
              <>
                Deine Vermutung: Mira hat nach 10 Jahren etwa <strong>{fmt(w.wert, 0)} €</strong> mehr als Jonas.
              </>
            )}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Rechne die ersten Jahre nach',
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Rechne Jahr für Jahr</p>
            <p>Mit der Zinsrechnung schaffst du das schon. Bei Mira rechnest du die Zinsen immer vom neuen Kapital aus. Runde auf Cent.</p>
          </div>
          <CheckCard
            onSolved={fertig}
            title="Die ersten drei Jahre"
            prompt={<p>Jahr 1 ist schon ausgerechnet. Trage für Mira die Zinsen Z und das Kapital K am Jahresende ein, für Jonas sein Geld nach 3 Jahren.</p>}
            rechnung={[
              { l: ['Z_1'], r: ['5000 \\cdot 0{,}03 = 150'], u: '\\text{Mira, Jahr 1}' },
              { l: ['K_1'], r: ['5000 + 150 = 5150'] },
              { l: ['Z_2'], r: ['5150 \\cdot 0{,}03 =', { luecke: 'z2' }], u: '\\text{Mira, Jahr 2}' },
              { l: ['K_2'], r: ['5150 + Z_2 =', { luecke: 'k2', breit: true }] },
              { l: ['Z_3'], r: ['K_2 \\cdot 0{,}03 =', { luecke: 'z3' }], u: '\\text{Mira, Jahr 3}' },
              { l: ['K_3'], r: ['K_2 + Z_3 =', { luecke: 'k3', breit: true }] },
              { l: ['\\text{Jonas}'], r: ['5000 + 3 \\cdot 150 =', { luecke: 'j3', breit: true }], u: '\\text{nach 3 Jahren}' },
            ]}
            fields={[
              { kind: 'num', key: 'z2', label: 'Zinsen Jahr 2', expected: mira(1) * 0.03, tol: 0.05 },
              { kind: 'num', key: 'k2', label: 'Kapital Ende Jahr 2', expected: mira(2), tol: 0.05 },
              { kind: 'num', key: 'z3', label: 'Zinsen Jahr 3', expected: mira(2) * 0.03, tol: 0.05 },
              { kind: 'num', key: 'k3', label: 'Kapital Ende Jahr 3', expected: mira(3), tol: 0.05 },
              { kind: 'num', key: 'j3', label: 'Jonas insgesamt', expected: jonas(3), tol: 0.05 },
            ]}
            solution={
              <>
                <MB>{`Z_2 = 5150 \\cdot 0{,}03 = 154{,}50 \\qquad K_2 = ${eurTex(mira(2))}`}</MB>
                <MB>{`Z_3 = 5304{,}50 \\cdot 0{,}03 = ${eurTex(mira(2) * 0.03)} \\qquad K_3 = ${eurTex(mira(3))}`}</MB>
                <p>Jonas hat 5.450 €. Miras Zinsen werden jedes Jahr mehr, weil auch die Zinsen des Vorjahres verzinst werden.</p>
              </>
            }
            help={
              <Hilfen
                steps={[
                  <>Die Zinsen eines Jahres sind 3 % vom Kapital am Jahresanfang. Das Kapital am Jahresende ist Anfang plus Zinsen.</>,
                  <>
                    Jahr 2 beginnt mit 5.150 €. Zinsen: <M>{'5150 \\cdot 0{,}03'}</M>. Dann <M>{'K_2 = 5150 + Z_2'}</M>.
                  </>,
                  <>
                    <M>{'Z_2 = 154{,}50'}</M>, <M>{'K_2 = 5304{,}50'}</M>. Jahr 3 beginnt mit <M>{'5304{,}50'}</M> €. Jonas bekommt jedes Jahr gleich viel: 150 €.
                  </>,
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Deine Aufgabe',
      frei: true,
      inhalt: () => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Berechne, wie viel beide nach 10 Jahren haben</p>
            <p>Zehn Jahre Zeile für Zeile zu rechnen dauert lang. Finde einen schnellen Weg für Miras Kapital und berechne Miras Vorsprung vor Jonas.</p>
          </div>
          <GegebenGesucht
            gegeben={<>je 5.000 €, 3 % pro Jahr, 10 Jahre. Bei Mira bleiben die Zinsen auf dem Konto, bei Jonas nicht.</>}
            gesucht={<>Miras und Jonas’ Geld nach 10 Jahren und der Unterschied</>}
          />
          <div className="zk-bild">
            <ZweiKonten />
          </div>
          <p className="sl-hinweis">Den schnellen Weg siehst du auf der nächsten Seite an einem Rechenbeispiel. Danach rechnest du selbst.</p>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: "So geht's: Rechenbeispiel",
      frei: true,
      inhalt: () => (
        <>
          <Beispiel offen title="Wie wächst Tims Geld?" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          <VideoAufklappen src={VIDEO_KN} title="Erklärvideo: Endkapital berechnen" />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Jetzt du: Mira und Jonas nach 10 Jahren',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Endkapital berechnen"
          prompt={<p>Rechne wie im Beispiel. Fülle die Lücken aus.</p>}
          rechnung={[
            { l: ['q'], r: ['1 + \\frac{3}{100} =', { luecke: 'q' }] },
            { l: ['K_{10}'], r: ['5000 \\cdot q^{10} =', { luecke: 'm', breit: true }, '\\text{ €}'] },
            { l: ['\\text{Jonas}'], r: ['5000 + 10 \\cdot 150 =', { luecke: 'j', breit: true }, '\\text{ €}'] },
            { l: ['\\text{Vorsprung}'], r: ['K_{10} - \\text{Jonas} =', { luecke: 'v' }, '\\text{ €}'] },
          ]}
          fields={[
            { kind: 'num', key: 'q', label: 'Zinsfaktor', expected: 1.03, tol: 0.0001 },
            { kind: 'num', key: 'm', label: 'Mira nach 10 Jahren', expected: mira(N), tol: 0.1 },
            { kind: 'num', key: 'j', label: 'Jonas nach 10 Jahren', expected: jonas(N), tol: 0.05 },
            { kind: 'num', key: 'v', label: 'Vorsprung', expected: VORSPRUNG, tol: 0.1 },
          ]}
          solution={
            <>
              <MB>{`q = 1{,}03 \\qquad K_{10} = 5000 \\cdot 1{,}03^{10} = ${eurTex(mira(N))}`}</MB>
              <MB>{`\\text{Jonas: } 5000 + 10 \\cdot 150 = 6500\\text{ €} \\qquad \\text{Vorsprung: } ${eurTex(VORSPRUNG)}`}</MB>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Wie wird im Beispiel aus 4 % der Zinsfaktor? Mache dasselbe mit 3 %.</>,
                <>
                  <M>{'q = 1{,}03'}</M>. Rechne <M>{'5000 \\cdot 1{,}03^{10}'}</M> mit der Taste <M>{'\\boxed{x^y}'}</M>. Jonas bekommt jedes Jahr 150 €.
                </>,
                <>
                  <M>{`K_{10} \\approx ${eurTex(mira(N))}`}</M>. Ziehe davon Jonas’ 6.500 € ab.
                </>,
              ]}
            />
          }
        />
      ),
    },
    {
      art: 'loesen',
      titel: 'Für Profis: Wann sind es mehr als 200 € Zinsen?',
      frei: true,
      inhalt: () => (
        <CheckCard
          title="Mehr als 200 € Zinsen"
          level="erweiterung"
          prompt={<p>Mira bekommt im 1. Jahr 150 € Zinsen, danach jedes Jahr mehr. In welchem Jahr bekommt sie zum ersten Mal mehr als 200 € Zinsen für ein Jahr?</p>}
          fields={[{ kind: 'num', key: 'j', label: <>im Jahr</>, expected: 11, tol: 0.01 }]}
          solution={
            <>
              <p>Mehr als 200 € Zinsen gibt es, wenn das Kapital am Jahresanfang über 200 : 0,03 ≈ 6.666,67 € liegt.</p>
              <MB>{`K_9 = ${eurTex(mira(9))} \\to Z_{10} = ${eurTex(mira(9) * 0.03)} \\qquad K_{10} = ${eurTex(mira(10))} \\to Z_{11} = ${eurTex(mira(10) * 0.03)}`}</MB>
              <p>Im 11. Jahr bekommt Mira zum ersten Mal über 200 € Zinsen.</p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Die Zinsen eines Jahres hängen vom Kapital am Jahresanfang ab. Wie groß muss es sein, damit 3 % davon mehr als 200 € sind?</>,
                <>Kapital · 0,03 &gt; 200. Rechne aus, ab welchem Kapital das gilt, und suche dann das Jahr.</>,
                <>
                  Ab etwa <M>{'6666{,}67\\text{ €}'}</M>. Miras Kapital nach 10 Jahren ist <M>{eurTex(mira(10))}</M>.
                </>,
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
          <Rueckbezug fest={fest} />
          <Merke title="Zinseszins und Endkapital">
            <p>
              Bleiben die Zinsen auf dem Konto, werden sie im nächsten Jahr <strong>mitverzinst</strong>. Das nennt man <strong>Zinseszins</strong>.
            </p>
            <MB>{'K_n = K_0 \\cdot q^n \\quad\\text{mit}\\quad q = 1 + \\frac{p}{100}'}</MB>
            <ul>
              <li>
                Aus dem Zinssatz wird der Zinsfaktor: <M>{'3\\,\\% \\to q = 1{,}03'}</M>, <M>{'4{,}5\\,\\% \\to q = 1{,}045'}</M>.
              </li>
              <li>Die Anzahl der Jahre steht als Hochzahl über dem Zinsfaktor.</li>
              <li>
                Ohne Zinseszins (Zinsen werden ausgezahlt) wächst das Kapital jedes Jahr um den gleichen Betrag: <M>{'K_n = K_0 + n \\cdot Z'}</M>.
              </li>
            </ul>
          </Merke>
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Dieselbe Geschichte im Graph',
      inhalt: (fertig) => (
        <>
          <WachstumGraph k0={K0} p={P} />
          <McCard
            onSolved={fertig}
            title="Was zeigt der Graph?"
            prompt={<p>Schiebe den Regler. Wie entwickelt sich Miras Vorsprung, wenn die Laufzeit größer wird?</p>}
            options={[
              { text: 'Der Vorsprung bleibt immer gleich groß.', feedback: 'Schiebe den Regler: Nach 5 Jahren ist der Abstand kleiner als nach 10 Jahren.' },
              { text: 'Der Vorsprung wächst Jahr für Jahr gleichmäßig, wie bei einer Geraden.', feedback: 'Miras Linie ist keine Gerade. Der Abstand wächst erst langsam und dann immer schneller.' },
              {
                text: 'Der Vorsprung wächst immer schneller, weil Mira auch auf die Zinsen Zinsen bekommt.',
                correct: true,
                feedback: 'Die Kurve wird steiler: Je mehr Kapital, desto mehr Zinsen, und die werden wieder mitverzinst.',
              },
              { text: 'Der Vorsprung wird irgendwann wieder kleiner.', feedback: 'Mira bekommt immer mehr Zinsen als Jonas, der Abstand wird nie kleiner.' },
            ]}
          />
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Eure Concept Map (Lernprodukt)',
      bedingung: 'Hake alle Punkte ab, die eure Concept Map enthält.',
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Legt eine Concept Map „Zins und Zinseszins“ an</p>
            <p>Arbeitet in der Gruppe auf einem A3-Blatt. Lasst Platz: In der nächsten Lernsituation wächst die Concept Map weiter.</p>
          </div>
          <Kriterien
            onAlle={fertig}
            items={[
              'Zins (Auszahlung) und Zinseszins (Zinsen bleiben) sind in eigenen Worten erklärt',
              'Mindestens zwei Darstellungen (Rechnung, Graph, Formel) von Jonas und Mira',
              'Die Formel K_n = K_0 · q^n steht dort, q ist erklärt (3 % → q = 1,03)',
              'Ein eigenes Beispiel mit anderen Zahlen',
            ]}
          />
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 1: Welche Rechnung passt?',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Zinseszins-Einstieg 1: Rechnung wählen (Basis)"
          title="Check 1"
          level="basis"
          prompt={
            <p>
              <M>{'2000\\text{ €}'}</M> werden 5 Jahre lang zu <M>{'4\\,\\%'}</M> angelegt. Die Zinsen bleiben auf dem Konto. Welche Rechnung liefert das Endkapital?
            </p>
          }
          options={[
            { text: '2000 · (1 + 0,04 · 5)', feedback: 'Das ist die Rechnung ohne Zinseszins, bei der die Zinsen jedes Jahr gleich bleiben.' },
            { text: '2000 · 4^5', feedback: 'Der Zinsfaktor ist nicht 4, sondern 1 + 4/100 = 1,04.' },
            { text: '2000 · 1,04^5', correct: true, feedback: 'Zinsfaktor q = 1,04, Hochzahl = 5 Jahre.' },
            { text: '2000 · 1,4^5', feedback: '4 % sind 0,04, nicht 0,4. Der Zinsfaktor ist 1,04.' },
          ]}
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 2: Wer hat recht?',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Zinseszins-Einstieg 1: Zinseszins erkennen (Standard)"
          title="Check 2"
          rechnen
          level="standard"
          prompt={
            <p>
              Anna und Ben legen je <M>{'1000\\text{ €}'}</M> für 2 Jahre zu <M>{'6\\,\\%'}</M> an, die Zinsen bleiben auf dem Konto. Anna sagt: „Ich habe 1.120 €, denn 2 · 60 €
              Zinsen.“ Ben sagt: „Ich habe 1.123,60 €.“ Wer hat recht?
            </p>
          }
          options={[
            { text: 'Anna, denn die Zinsen sind in beiden Jahren gleich: 60 €.', feedback: 'Im 2. Jahr sind die Zinsen 6 % von 1.060 €, also 63,60 €.' },
            { text: 'Ben: 1000 · 1,06² = 1.123,60 €.', correct: true, feedback: 'Im 2. Jahr gibt es 3,60 € Zinsen auf die Zinsen des 1. Jahres.' },
            { text: 'Beide haben recht, es kommt auf die Rechenweise an.', feedback: 'Die Zinsen bleiben auf dem Konto. Dann gibt es nur ein richtiges Ergebnis: mit Zinseszins.' },
            { text: 'Keiner, denn das Ergebnis muss 1.060 € sein.', feedback: '1.060 € hätte man nach einem Jahr. Hier sind es 2 Jahre.' },
          ]}
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 3: Endkapital berechnen',
      inhalt: (fertig) => (
        <TrackedCheck
          onSolved={fertig}
          topic="Zinseszins-Einstieg 1: Endkapital (Standard)"
          title="Check 3"
          level="standard"
          prompt={
            <p>
              Lena legt <M>{'3500\\text{ €}'}</M> für 8 Jahre zu <M>{'2{,}5\\,\\%'}</M> an. Die Zinsen bleiben auf dem Konto. Wie viel Geld hat sie am Ende?
            </p>
          }
          fields={[{ kind: 'num', key: 'k', label: <M>{'K_8 ='}</M>, expected: kn(3500, 2.5, 8), unit: '€', tol: 0.05 }]}
          solution={<MB>{`q = 1{,}025 \\qquad K_8 = 3500 \\cdot 1{,}025^8 = ${eurTex(kn(3500, 2.5, 8))}`}</MB>}
          help={
            <Hilfen
              steps={[
                <>
                  Welche Größen sind gegeben? Notiere <M>{'K_0'}</M>, <M>p</M> und <M>n</M>.
                </>,
                <>
                  Berechne zuerst den Zinsfaktor <M>{'q = 1 + \\frac{p}{100}'}</M>, dann <M>{'K_n = K_0 \\cdot q^n'}</M>.
                </>,
                <>
                  <M>{'K_8 = 3500 \\cdot 1{,}025^8'}</M>
                </>,
              ]}
            />
          }
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 4: Zinsen insgesamt',
      inhalt: (fertig) => (
        <TrackedCheck
          onSolved={fertig}
          topic="Zinseszins-Einstieg 1: Zinsen insgesamt (Erweiterung)"
          title="Check 4"
          level="erweiterung"
          prompt={
            <p>
              <M>{'4000\\text{ €}'}</M> werden 6 Jahre zu <M>{'3{,}5\\,\\%'}</M> mit Zinseszins angelegt. Berechne das Endkapital und die Zinsen insgesamt. Wie viel weniger Zinsen
              wären es ohne Zinseszins?
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 'k', label: <M>{'K_6 ='}</M>, expected: kn(4000, 3.5, 6), unit: '€', tol: 0.05 },
            { kind: 'num', key: 'z', label: <>Zinsen</>, expected: kn(4000, 3.5, 6) - 4000, unit: '€', tol: 0.05 },
            { kind: 'num', key: 'd', label: <>Unterschied</>, expected: kn(4000, 3.5, 6) - knEinfach(4000, 3.5, 6), unit: '€', tol: 0.05 },
          ]}
          solution={
            <>
              <MB>{`K_6 = 4000 \\cdot 1{,}035^6 = ${eurTex(kn(4000, 3.5, 6))} \\qquad \\text{Zinsen: } ${eurTex(kn(4000, 3.5, 6) - 4000)}`}</MB>
              <p>Ohne Zinseszins wären es 6 · 140 € = 840 € Zinsen. Der Unterschied beträgt {eur(kn(4000, 3.5, 6) - knEinfach(4000, 3.5, 6))}.</p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Das Endkapital berechnest du mit der Zinseszinsformel. Die Zinsen sind Endkapital minus Anfangskapital.</>,
                <>Ohne Zinseszins sind die Zinsen jedes Jahr gleich: 3,5 % von 4.000 €. Nimm sie mal 6.</>,
                <>
                  <M>{'K_6 = 4000 \\cdot 1{,}035^6'}</M>. Zinsen pro Jahr ohne Zinseszins: <M>{'4000 \\cdot 0{,}035 = 140'}</M>.
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
      ),
    },
  ]

  return (
    <TaskShell title="Zinseszins: Wer hat nach 10 Jahren mehr?" width="wide" kompakt parent={{ to: '/finanzmathe/zinseszins', label: 'Zinseszins' }}>
      <SeitenLernsituation
        ruhig
        thema={THEMA}
        ziel={<>In dieser Lernsituation findest du heraus, warum Zinsen, die auf dem Konto bleiben, mehr bringen. Du berechnest das Endkapital mit der Zinseszinsformel.</>}
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Vermutung aus Phase 2 */
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
            ? 'Du hattest mit „gleich viel“ gerechnet. Der Grund für den Unterschied: Miras Zinsen werden selbst wieder verzinst.'
            : `Deine Schätzung lag ${fmt(diff, 0)} € ${fest.wert > VORSPRUNG ? 'zu hoch' : 'zu niedrig'}.`}
      </p>
    </div>
  )
}
