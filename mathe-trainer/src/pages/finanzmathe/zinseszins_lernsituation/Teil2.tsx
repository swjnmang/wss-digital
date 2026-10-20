import { useState } from 'react'
import CheckedNumberInput from '../../../components/CheckedNumberInput'
import { VideoEmbed } from '../../../components/VideoButton'
import { Beispiel, M, MB, Merke, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { CardHead, CheckCard, Hilfen, McCard, Phase } from '../../lineare_funktionen/lernsituation_kit/kit'
import { Chat, Festlegung, Frage, Kriterien, Msg, Stopp, Wege, eur, eurTex, faktor, kn, zt } from './shared'

// Teil 2 (ca. 90 min) der Lernsituation „Wer hat nach 10 Jahren mehr?“: die Umkehrungen K_0, q (p) und n.
// Format Kontrastierende Fälle (Fortsetzung), Look Messenger-Chat, Lernprodukt analog (Concept Map wird ergänzt).
// Festlegung: Wie lange dauert eine Verdopplung? (Gegenintuitiv: nicht 100 : p.) Die Festlegung bleibt nur im Seitenzustand.
// n wird auf zwei Wegen bestimmt: Probieren mit der Tabelle und Logarithmus.

const VIDEO_UMSTELLEN = 'https://www.youtube.com/watch?v=uz5l8_O1dxs&t=1s'
const VIDEO_K0 = 'https://youtu.be/vs0o8S9ksjg?list=PLI8kX0XEfSujoc5mrNv30D7mptBkAN3E8&t=130'
const VIDEO_P = 'https://youtu.be/BeJd9e5Qv-E?si=XokDQ8yfwluJy1IW'
const VIDEO_N = 'https://youtu.be/oUjYapq1AX8?si=lx02oGVSFGhtEVdA'

// Frage 1: K_0 gesucht
const ZIEL1 = 6000
const N1 = 8
const P1 = 3
const k0Mira = ZIEL1 / faktor(P1) ** N1

// Frage 2: q und p gesucht (5.000 € werden in 6 Jahren zu 6.000 €)
const QA = { k0: 5000, kn: 6000, n: 6 }
const qA = (QA.kn / QA.k0) ** (1 / QA.n)

// Frage 3: n gesucht (Verdopplung bei 3 %)
const PD = 3
const nD = Math.log(2) / Math.log(faktor(PD))
const nDvoll = Math.ceil(nD)

type Prediction = { n: number; saved: boolean }

function Feld({ expected }: { expected: number }) {
  return <CheckedNumberInput expected={expected} tolerance={0.05} className="bk-input lp-input lp-input-sm zz-in" placeholder="?" />
}

export default function Teil2() {
  const [pred, setPred] = useState<Prediction>({ n: 30, saved: false })

  return (
    <>
      <div className="lp-goal">
        <i className="fa-solid fa-bullseye" aria-hidden="true" />
        <div>
          <strong>Das lernst du in Teil 2:</strong> Du stellst die Zinseszinsformel um und berechnest das Anfangskapital <M>{'K_0'}</M>, den Zinsfaktor <M>q</M> (und damit den Zinssatz <M>p</M>) und die
          Laufzeit <M>n</M>.
        </div>
      </div>

      {/* 1 Aktivieren */}
      <Phase no={1} title="Fit für den Start" social="EA" minutes={10}>
        <p>Diese vier Aufgaben holen aus Teil 1 und aus dem Taschenrechner ab, was du gleich brauchst.</p>
        <details className="ls-way">
          <summary>Umstellen vergessen? Hier ist ein Erklärvideo: Zinsformel nach K, p und t auflösen</summary>
          <div className="ls-way-body">
            <VideoEmbed src={VIDEO_UMSTELLEN} title="Erklärvideo: Zinsformel nach K, p und t auflösen" />
          </div>
        </details>
        <div className="lp-exlist">
          <CheckCard
            title="a) Endkapital mit Zinseszins"
            level="basis"
            prompt={
              <p>
                <M>{'3000\\text{ €}'}</M> werden 4 Jahre lang mit <M>{'2\\,\\%'}</M> pro Jahr verzinst, die Zinsen bleiben auf dem Konto. Berechne das Endkapital.
              </p>
            }
            fields={[{ kind: 'num', key: 'k', label: <M>{'K_4 ='}</M>, expected: kn(3000, 2, 4), unit: '€', tol: 0.05 }]}
            solution={<MB>{`K_4 = 3000 \\cdot 1{,}02^4 = ${eurTex(kn(3000, 2, 4))}`}</MB>}
          />
          <CheckCard
            title="b) Zinsfaktor"
            level="basis"
            prompt={
              <p>
                Der Zinssatz beträgt <M>{'3{,}5\\,\\%'}</M>. Wie lautet der Zinsfaktor <M>q</M>?
              </p>
            }
            fields={[{ kind: 'num', key: 'q', label: <M>{'q ='}</M>, expected: 1.035, tol: 0.0001 }]}
            solution={<MB>{'q = 1 + \\frac{3{,}5}{100} = 1{,}035'}</MB>}
          />
          <CheckCard
            title="c) Wurzel mit dem Taschenrechner"
            level="standard"
            prompt={
              <p>
                Berechne die vierte Wurzel aus 81: <M>{'\\sqrt[4]{81}'}</M>. Am Taschenrechner nutzt du die Taste für die n-te Wurzel (oft <M>{'\\sqrt[x]{\\ }'}</M>) oder rechnest <M>{'81^{1/4}'}</M>.
              </p>
            }
            fields={[{ kind: 'num', key: 'w', label: <M>{'\\sqrt[4]{81} ='}</M>, expected: 3, tol: 0.0001 }]}
            solution={
              <>
                <MB>{'\\sqrt[4]{81} = 81^{\\frac{1}{4}} = 3 \\qquad \\text{denn } 3^4 = 81'}</MB>
              </>
            }
          />
          <McCard
            title="d) Formel umstellen"
            level="standard"
            prompt={
              <p>
                Du kennst <M>{'K_n = K_0 \\cdot q^n'}</M>. <M>{'K_n'}</M>, <M>q</M> und <M>n</M> sind gegeben, du suchst <M>{'K_0'}</M>. Wie stellst du um?
              </p>
            }
            options={[
              { text: 'K₀ = Kₙ : qⁿ', correct: true, feedback: 'Die Gleichung ist Produkt aus K₀ und qⁿ. Das Umkehren der Multiplikation ist das Dividieren durch qⁿ.' },
              { text: 'K₀ = Kₙ − qⁿ', feedback: 'K₀ und qⁿ sind multipliziert, nicht addiert. Also muss man dividieren, nicht subtrahieren.' },
              { text: 'K₀ = Kₙ · qⁿ', feedback: 'Dann würde das Kapital noch weiter wachsen. Wir suchen den kleineren Startwert, also dividieren wir.' },
              { text: 'K₀ = Kₙ : (q · n)', feedback: 'qⁿ ist q hoch n, nicht q mal n. Durch die ganze Potenz teilen.' },
            ]}
          />
        </div>
      </Phase>

      {/* 2 Neue Fragen */}
      <Phase no={2} title="Neue Fragen von Mira" social="EA" minutes={8}>
        <Chat>
          <Msg who="mira">
            <p>Ich habe noch drei Fragen an dich, bevor ich mein Geld anlege. 🙈</p>
            <ol>
              <li>Ich will in 8 Jahren 6.000 € für meinen Führerschein haben. Die Bank bietet 3 %. Wie viel muss ich heute anlegen?</li>
              <li>Ein anderes Angebot verspricht: Aus 5.000 € werden in 6 Jahren 6.000 €. Welcher Zinssatz steckt dahinter?</li>
              <li>Und: Wie lange dauert es bei 3 %, bis sich mein Geld verdoppelt hat?</li>
            </ol>
          </Msg>
          <Msg who="jonas">
            <p>Zu 3: Das ist einfach, 100 geteilt durch 3. Also etwa 33 Jahre. Oder? 😄</p>
          </Msg>
          <Msg who="mira">
            <p>Hmm, ich weiß nicht. Kannst du mir helfen? Mit der Formel von letzter Stunde ist das alles zu schaffen.</p>
          </Msg>
        </Chat>
        <Frage>Stimmt Jonas’ Faustregel? Wie lange dauert es, bis sich ein Guthaben bei 3 % Zinseszins verdoppelt?</Frage>
        <Festlegung
          frage={<>Lege dich fest, bevor du rechnest: Nach wie vielen Jahren hat sich ein Guthaben bei 3 % Zinseszins verdoppelt?</>}
          min={5}
          max={50}
          step={1}
          einheit="Jahre"
          value={pred.n}
          onChange={(v) => setPred({ ...pred, n: v })}
          saved={pred.saved}
          onSave={() => setPred({ ...pred, saved: true })}
          onReset={() => setPred({ ...pred, saved: false })}
          savedText={
            <>
              Gespeichert: Du schätzt, dass sich das Guthaben nach etwa <strong>{pred.n} Jahren</strong> verdoppelt. Am Ende schauen wir, ob du recht hattest.
            </>
          }
        />
      </Phase>

      {/* 3 K0 */}
      <Phase no={3} title="Frage 1: Wie viel muss Mira heute anlegen? (K₀)" social="PA" minutes={18}>
        <div className="lp-ex bk-panel">
          <CardHead title="Aufgabe 1: Rückwärts rechnen" level="basis" />
          <p>
            Mira möchte nach 8 Jahren <M>{'6000\\text{ €}'}</M> haben (3 %, Zinsen bleiben). Gehe gedanklich <strong>rückwärts</strong>: Am Ende des 8. Jahres sind es 6.000 €. Wie viel waren es ein Jahr vorher?
            Und noch ein Jahr früher? Das Kapital wurde ja jedes Jahr mit <M>{'1{,}03'}</M> multipliziert.
          </p>
          <div className="zz-table-wrap">
            <table className="lp-table">
              <thead>
                <tr>
                  <th>Zeitpunkt</th>
                  <th>Kapital</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ende Jahr 8</td>
                  <td>{eur(ZIEL1)}</td>
                </tr>
                <tr>
                  <td>Ende Jahr 7</td>
                  <td>
                    <Feld expected={ZIEL1 / faktor(P1)} />
                  </td>
                </tr>
                <tr>
                  <td>Ende Jahr 6</td>
                  <td>
                    <Feld expected={ZIEL1 / faktor(P1) ** 2} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Hilfen
            steps={[
              <>Wenn man mit 1,03 multipliziert hat, um von Jahr 7 nach Jahr 8 zu kommen: Was ist die Umkehrung?</>,
              <>Du musst durch 1,03 teilen. Dividiere die 6.000 € durch 1,03, dann das Ergebnis noch einmal.</>,
              <>
                Ende Jahr 7: <M>{`6000 : 1{,}03 = ${eurTex(ZIEL1 / faktor(P1))}`}</M>
              </>,
            ]}
          />
        </div>
        <p>Das Rückwärtsrechnen bis zum Start dauert bei 8 Jahren lang. Schau dir das Erklärvideo an. Es zeigt, wie das direkt geht.</p>
        <VideoEmbed src={VIDEO_K0} title="Erklärvideo: Anfangskapital K₀ berechnen" />
        <Merke title="Anfangskapital K₀ berechnen">
          <p>
            Aus <M>{'K_n = K_0 \\cdot q^n'}</M> folgt durch Dividieren durch <M>{'q^n'}</M>:
          </p>
          <p className="zz-merke-formel">
            <M>{'K_0 = \\frac{K_n}{q^n}'}</M>
          </p>
          <p>
            Beispiel Mira: <M>{`K_0 = \\frac{6000}{1{,}03^8} = ${eurTex(k0Mira)}`}</M>. Mira muss heute nur {eur(k0Mira)} anlegen, denn das Geld wächst in 8 Jahren um {eur(ZIEL1 - k0Mira)}.
          </p>
        </Merke>
        <CheckCard
          title="Aufgabe 2: Anfangskapital berechnen"
          level="standard"
          prompt={
            <p>
              Ein Sparer möchte nach 5 Jahren <M>{'8000\\text{ €}'}</M> für ein Motorrad haben. Die Bank zahlt <M>{'2{,}5\\,\\%'}</M> Zinseszins. Wie viel muss er heute anlegen? Halte deinen Rechenweg schriftlich fest.
            </p>
          }
          fields={[{ kind: 'num', key: 'k', label: <M>{'K_0 ='}</M>, expected: 8000 / faktor(2.5) ** 5, unit: '€', tol: 0.05 }]}
          solution={
            <>
              <MB>{'q = 1 + \\frac{2{,}5}{100} = 1{,}025'}</MB>
              <MB>{`K_0 = \\frac{K_n}{q^n} = \\frac{8000}{1{,}025^5} = ${eurTex(8000 / faktor(2.5) ** 5)}`}</MB>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Welche Größen sind gegeben, welche ist gesucht? Notiere <M>{'K_n'}</M>, <M>p</M> und <M>n</M>.</>,
                <>
                  Berechne zuerst <M>q</M>, dann teile <M>{'K_n'}</M> durch <M>{'q^n'}</M>.
                </>,
                <>
                  <M>{'q = 1{,}025'}</M>, also <M>{'K_0 = 8000 : 1{,}025^5'}</M>. Taschenrechner: erst <M>{'1{,}025^5'}</M> ausrechnen und dann durch das Ergebnis teilen.
                </>,
              ]}
            />
          }
        />
        <CheckCard
          title="Aufgabe 3: Was ändert der Zinssatz?"
          level="erweiterung"
          prompt={
            <p>
              Mira will weiterhin 6.000 € in 8 Jahren erreichen. Berechne, wie viel sie heute anlegen muss, wenn der Zinssatz <strong>2 %</strong> bzw. <strong>4 %</strong> beträgt. Warum muss sie bei einem
              höheren Zinssatz weniger anlegen? Schreibe deine Begründung in dein Heft.
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 'a', label: <>bei 2 %</>, expected: ZIEL1 / faktor(2) ** N1, unit: '€', tol: 0.05 },
            { kind: 'num', key: 'b', label: <>bei 4 %</>, expected: ZIEL1 / faktor(4) ** N1, unit: '€', tol: 0.05 },
          ]}
          solution={
            <>
              <MB>{`K_0 = \\frac{6000}{1{,}02^8} = ${eurTex(ZIEL1 / faktor(2) ** N1)} \\qquad K_0 = \\frac{6000}{1{,}04^8} = ${eurTex(ZIEL1 / faktor(4) ** N1)}`}</MB>
              <p>Bei höherem Zinssatz wächst das Geld schneller, also reicht ein kleinerer Startbetrag, um dasselbe Ziel zu erreichen.</p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Du rechnest dieselbe Aufgabe wie bei Mira, nur mit einem anderen Zinsfaktor.</>,
                <>
                  <M>{'q = 1{,}02'}</M> bzw. <M>{'q = 1{,}04'}</M>, <M>{'n = 8'}</M> und <M>{'K_n = 6000'}</M>.
                </>,
                <>
                  <M>{'K_0 = 6000 : 1{,}02^8'}</M> und <M>{'K_0 = 6000 : 1{,}04^8'}</M>.
                </>,
              ]}
            />
          }
        />
      </Phase>

      {/* 4 q und p */}
      <Phase no={4} title="Frage 2: Welcher Zinssatz steckt dahinter? (q und p)" social="PA" minutes={18}>
        <div className="lp-ex bk-panel">
          <CardHead title="Aufgabe 1: Zinssatz durch Probieren eingrenzen" level="basis" />
          <p>
            Das Angebot: Aus <M>{'5000\\text{ €}'}</M> werden in 6 Jahren <M>{'6000\\text{ €}'}</M>. Teste, welche Zinssätze infrage kommen, und rechne das Endkapital nach 6 Jahren für verschiedene Zinssätze aus.
          </p>
          <div className="zz-table-wrap">
            <table className="lp-table">
              <thead>
                <tr>
                  <th>Zinssatz</th>
                  <th>Zinsfaktor q</th>
                  <th>Endkapital nach 6 Jahren</th>
                </tr>
              </thead>
              <tbody>
                {[2, 3, 4].map((p) => (
                  <tr key={p}>
                    <td>{p} %</td>
                    <td>{fmt(faktor(p), 2)}</td>
                    <td>
                      <Feld expected={kn(QA.k0, p, QA.n)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CheckCard
            title="Wo liegt der gesuchte Zinssatz?"
            prompt={<p>Vergleiche deine Ergebnisse mit dem Ziel von 6.000 €.</p>}
            fields={[{ kind: 'select', key: 'z', label: 'Der Zinssatz liegt', options: ['unter 2 %', 'zwischen 2 % und 3 %', 'zwischen 3 % und 4 %', 'über 4 %'], expected: 2 }]}
            solution={
              <p>
                Bei 3 % sind es {eur(kn(QA.k0, 3, QA.n))}, bei 4 % schon {eur(kn(QA.k0, 4, QA.n))}. Das Ziel von 6.000 € liegt dazwischen, der gesuchte Zinssatz auch.
              </p>
            }
          />
          <Hilfen
            steps={[
              <>Rechne <M>{'5000 \\cdot q^6'}</M> mit den drei Zinsfaktoren aus.</>,
              <>
                Das Ziel ist <M>{'6000\\text{ €}'}</M>. Bei welchen Zinssätzen liegt das Ergebnis darunter, bei welchen darüber?
              </>,
              <>
                Mit 3 %: <M>{`5000 \\cdot 1{,}03^6 = ${eurTex(kn(QA.k0, 3, QA.n))}`}</M> ist noch zu wenig.
              </>,
            ]}
          />
        </div>
        <p>Probieren grenzt ein, aber genau wird es mit dem Rechenweg aus dem Erklärvideo.</p>
        <VideoEmbed src={VIDEO_P} title="Erklärvideo: Zinssatz p berechnen" />
        <Beispiel
          title="Zinssatz aus Anfangs- und Endkapital"
          aufgabe={
            <p>
              Aus <M>{'5000\\text{ €}'}</M> werden in 6 Jahren <M>{'6000\\text{ €}'}</M>. Welcher Zinssatz steckt dahinter?
            </p>
          }
          steps={[
            { title: 'Werte in die Formel einsetzen', body: <MB>{'6000 = 5000 \\cdot q^6'}</MB> },
            { title: 'Durch das Anfangskapital teilen', body: <MB>{'\\frac{6000}{5000} = q^6 \\quad\\Rightarrow\\quad 1{,}2 = q^6'}</MB> },
            {
              title: 'Wurzel ziehen',
              body: (
                <>
                  <MB>{`q = \\sqrt[6]{1{,}2} = 1{,}2^{\\frac{1}{6}} = ${zt(qA, 4)}`}</MB>
                  <p>
                    Am Taschenrechner: <M>{'1{,}2 \\,\\boxed{x^y}\\, (1 : 6)'}</M> oder mit der Taste <M>{'\\sqrt[x]{\\ }'}</M>.
                  </p>
                </>
              ),
            },
            {
              title: 'Zinssatz aus q berechnen',
              body: <MB>{`p = (q - 1) \\cdot 100 = (${zt(qA, 4)} - 1) \\cdot 100 \\approx ${zt((qA - 1) * 100, 2)}\\,\\%`}</MB>,
            },
            {
              title: 'Probe',
              body: (
                <p>
                  <M>{`5000 \\cdot ${zt(qA, 4)}^6 \\approx 6000`}</M> passt. Der Zinssatz liegt, wie geschätzt, zwischen 3 % und 4 %.
                </p>
              ),
            },
          ]}
        />
        <Merke title="Zinsfaktor q und Zinssatz p berechnen">
          <p className="zz-merke-formel">
            <M>{'q = \\sqrt[n]{\\frac{K_n}{K_0}} \\qquad p = (q - 1) \\cdot 100'}</M>
          </p>
          <p>Aus der Formel <M>{'K_n = K_0 \\cdot q^n'}</M> teilst du zuerst durch <M>{'K_0'}</M> und ziehst dann die <M>n</M>-te Wurzel. Aus <M>q</M> erhältst du den Zinssatz in Prozent.</p>
        </Merke>
        <CheckCard
          title="Aufgabe 2: Zinssatz berechnen"
          level="standard"
          prompt={
            <p>
              Aus <M>{'4000\\text{ €}'}</M> werden in 7 Jahren <M>{'5000\\text{ €}'}</M>. Berechne den Zinsfaktor und den Zinssatz in Prozent. Halte deinen Rechenweg schriftlich fest.
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 'q', label: <M>{'q ='}</M>, expected: (5000 / 4000) ** (1 / 7), tol: 0.0006 },
            { kind: 'num', key: 'p', label: <M>{'p ='}</M>, expected: ((5000 / 4000) ** (1 / 7) - 1) * 100, unit: '%', tol: 0.06 },
          ]}
          solution={
            <>
              <MB>{`q = \\sqrt[7]{\\frac{5000}{4000}} = 1{,}25^{\\frac{1}{7}} = ${zt((5000 / 4000) ** (1 / 7), 4)}`}</MB>
              <MB>{`p = (q - 1) \\cdot 100 = ${zt(((5000 / 4000) ** (1 / 7) - 1) * 100, 2)}\\,\\%`}</MB>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Setze in die Formel <M>{'K_n = K_0 \\cdot q^n'}</M> ein und stelle nach <M>q</M> um.</>,
                <>
                  Teile durch <M>{'K_0'}</M>, dann die 7. Wurzel ziehen: <M>{'q = \\sqrt[7]{K_n : K_0}'}</M>.
                </>,
                <>
                  <M>{'5000 : 4000 = 1{,}25'}</M>, also <M>{'q = 1{,}25^{\\frac{1}{7}}'}</M>. Danach <M>{'p = (q - 1) \\cdot 100'}</M>.
                </>,
              ]}
            />
          }
        />
        <CheckCard
          title="Aufgabe 3: Verdopplung in 10 Jahren"
          level="erweiterung"
          prompt={
            <p>
              Ein Anbieter wirbt: „Ihr Geld verdoppelt sich in 10 Jahren!“ Welcher Zinssatz (mit Zinseszins) steckt dahinter? Gib den Zinssatz auf zwei Nachkommastellen an. Tipp: Du brauchst keine
              konkrete Summe, nur das Verhältnis <M>{'K_n : K_0 = 2'}</M>.
            </p>
          }
          fields={[{ kind: 'num', key: 'p', label: <M>{'p ='}</M>, expected: (2 ** (1 / 10) - 1) * 100, unit: '%', tol: 0.02 }]}
          solution={
            <>
              <MB>{`q = \\sqrt[10]{2} = ${zt(2 ** (1 / 10), 4)} \\qquad p = (q - 1) \\cdot 100 = ${zt((2 ** (1 / 10) - 1) * 100, 2)}\\,\\%`}</MB>
              <p>Egal wie viel Geld angelegt wird: Bei etwa 7,18 % verdoppelt es sich in 10 Jahren.</p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Wenn sich das Geld verdoppelt, gilt <M>{'K_n = 2 \\cdot K_0'}</M>. Welche Zahl bleibt dann für <M>{'q^n'}</M>?</>,
                <>
                  <M>{'q^{10} = 2'}</M>. Ziehe die 10. Wurzel.
                </>,
                <>
                  <M>{'q = 2^{\\frac{1}{10}}'}</M> und dann <M>{'p = (q - 1) \\cdot 100'}</M>.
                </>,
              ]}
            />
          }
        />
      </Phase>

      {/* 5 n */}
      <Phase no={5} title="Frage 3: Wie lange dauert es? (n)" social="GA" minutes={20}>
        <div className="lp-ex bk-panel">
          <CardHead title="Aufgabe 1: Laufzeit durch Probieren" level="basis" />
          <p>
            Wann hat sich Miras Guthaben von <M>{'5000\\text{ €}'}</M> bei <M>{'3\\,\\%'}</M> auf mindestens <M>{'10000\\text{ €}'}</M> verdoppelt? Probiert in der Gruppe verschiedene Laufzeiten aus
            und tragt das Endkapital ein. Teilt die Laufzeiten untereinander auf.
          </p>
          <div className="zz-table-wrap">
            <table className="lp-table">
              <thead>
                <tr>
                  <th>Laufzeit n</th>
                  <th>Endkapital K₍ₙ₎</th>
                </tr>
              </thead>
              <tbody>
                {[10, 20, 23, 24].map((n) => (
                  <tr key={n}>
                    <td>{n} Jahre</td>
                    <td>
                      <Feld expected={kn(5000, PD, n)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CheckCard
            title="Wann sind es erstmals mehr als 10.000 €?"
            prompt={<p>Nach wie vielen vollen Jahren ist das Kapital zum ersten Mal mindestens 10.000 €?</p>}
            fields={[{ kind: 'num', key: 'n', label: <>nach</>, expected: nDvoll, unit: 'Jahren', tol: 0.01 }]}
            solution={
              <p>
                Nach 23 Jahren sind es {eur(kn(5000, PD, 23))}, nach 24 Jahren {eur(kn(5000, PD, 24))}. Also nach {nDvoll} Jahren.
              </p>
            }
          />
          <Hilfen
            steps={[
              <>Probiere zuerst einen Wert in der Mitte, zum Beispiel 20 Jahre, und schau, ob du über oder unter 10.000 € bist.</>,
              <>Wähle den nächsten Wert größer oder kleiner, je nachdem. So tastest du dich an die Grenze heran.</>,
              <>
                <M>{`5000 \\cdot 1{,}03^{20} = ${eurTex(kn(5000, PD, 20))}`}</M> ist noch zu wenig. Probiere 23 und 24.
              </>,
            ]}
          />
        </div>
        <Stopp
          title="Vergleicht eure Wege."
          items={[
            'Wie viele Rechnungen habt ihr gebraucht? Wie habt ihr entschieden, welche Laufzeit ihr als Nächstes probiert?',
            'Was wäre, wenn ihr 60 Jahre hättet? Gäbe es einen schnelleren Weg?',
          ]}
        />
        <p>
          <strong>Du arbeitest allein?</strong> So haben andere gedacht:
        </p>
        <Wege
          items={[
            {
              summary: 'Nora hat die Laufzeit schrittweise verdoppelt und halbiert',
              body: (
                <p>
                  „Ich habe mit 20 Jahren angefangen, das waren 9.030 €. Zu wenig, also 30: 12.136 €, zu viel. Dann 25, dann 23, dann 24. Nach 5 Rechnungen wusste ich, dass es 24 Jahre sind.“
                </p>
              ),
            },
            {
              summary: 'Kai hat den Logarithmus benutzt',
              body: (
                <p>
                  „Aus 10.000 = 5.000 · 1,03ⁿ wird 2 = 1,03ⁿ. Dann habe ich auf beiden Seiten den Logarithmus genommen und durch lg(1,03) geteilt: n ≈ 23,45. Das ging in einer Rechnung.“
                </p>
              ),
            },
          ]}
        />
        <p>Der Logarithmus ist eine Taste im Taschenrechner, die das Probieren überflüssig macht. Schau dir das Erklärvideo an.</p>
        <VideoEmbed src={VIDEO_N} title="Erklärvideo: Laufzeit n berechnen" />
        <Beispiel
          title="Laufzeit mit dem Logarithmus (Verdopplung bei 3 %)"
          aufgabe={
            <p>
              Nach wie vielen Jahren verdoppeln sich <M>{'5000\\text{ €}'}</M> bei <M>{'3\\,\\%'}</M> Zinseszins, also <M>{'K_n = 10000\\text{ €}'}</M>?
            </p>
          }
          steps={[
            { title: 'Werte einsetzen', body: <MB>{'10000 = 5000 \\cdot 1{,}03^n'}</MB> },
            { title: 'Durch das Anfangskapital teilen', body: <MB>{'2 = 1{,}03^n'}</MB> },
            {
              title: 'Logarithmus anwenden',
              body: (
                <>
                  <MB>{'\\lg 2 = n \\cdot \\lg 1{,}03'}</MB>
                  <p>
                    Das geht, weil nach der Logarithmusregel <M>{'\\lg(a^n) = n \\cdot \\lg a'}</M> gilt: Die Hochzahl wandert nach vorn.
                  </p>
                </>
              ),
            },
            {
              title: 'Nach n auflösen',
              body: <MB>{`n = \\frac{\\lg 2}{\\lg 1{,}03} = ${zt(nD, 2)}`}</MB>,
            },
            {
              title: 'Antwortsatz',
              body: (
                <p>
                  Nach {fmt(nD, 2)} Jahren wäre das Guthaben genau verdoppelt. Da Zinsen nur am Jahresende gutgeschrieben werden, sind es nach <strong>{nDvoll} Jahren</strong> erstmals über 10.000 €. Das passt zu
                  deinem Ergebnis aus dem Probieren.
                </p>
              ),
            },
          ]}
        />
        <Merke title="Laufzeit n berechnen">
          <p className="zz-merke-formel">
            <M>{'n = \\frac{\\lg\\left(\\frac{K_n}{K_0}\\right)}{\\lg q}'}</M>
          </p>
          <p>
            Zwei Wege führen zum Ziel: <strong>Probieren</strong> mit der Tabelle (immer möglich, aber langsam) oder den <strong>Logarithmus</strong> (schnell und genau). Das Ergebnis rundest du auf volle Jahre
            auf, wenn gefragt ist, wann ein Ziel erstmals erreicht ist.
          </p>
        </Merke>
        <CheckCard
          title="Aufgabe 2: Laufzeit berechnen"
          level="standard"
          prompt={
            <p>
              <M>{'3000\\text{ €}'}</M> werden mit <M>{'4\\,\\%'}</M> Zinseszins angelegt. Nach wie vielen Jahren sind daraus zum ersten Mal mindestens <M>{'4500\\text{ €}'}</M> geworden? Halte deinen Rechenweg
              schriftlich fest.
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 'n', label: <M>{'n ='}</M>, expected: Math.log(1.5) / Math.log(1.04), tol: 0.02 },
            { kind: 'num', key: 'v', label: <>erstmals nach</>, expected: Math.ceil(Math.log(1.5) / Math.log(1.04)), unit: 'vollen Jahren', tol: 0.01 },
          ]}
          solution={
            <>
              <MB>{'4500 = 3000 \\cdot 1{,}04^n \\quad\\Rightarrow\\quad 1{,}5 = 1{,}04^n'}</MB>
              <MB>{`n = \\frac{\\lg 1{,}5}{\\lg 1{,}04} = ${zt(Math.log(1.5) / Math.log(1.04), 2)}`}</MB>
              <p>Nach {Math.ceil(Math.log(1.5) / Math.log(1.04))} Jahren sind es erstmals mehr als 4.500 €.</p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Setze in <M>{'K_n = K_0 \\cdot q^n'}</M> ein. Welcher Wert steht für <M>q</M>?</>,
                <>
                  Teile durch <M>{'K_0'}</M> und wende den Logarithmus an. Du darfst auch durch Probieren mit einer Tabelle arbeiten.
                </>,
                <>
                  <M>{'1{,}5 = 1{,}04^n'}</M>, also <M>{'n = \\lg 1{,}5 : \\lg 1{,}04'}</M>.
                </>,
              ]}
            />
          }
        />
        <CheckCard
          title="Aufgabe 3: Verdopplung bei 6 %"
          level="erweiterung"
          prompt={
            <p>
              Wie lange dauert die Verdopplung bei <M>{'6\\,\\%'}</M> Zinseszins? Vergleiche mit der Faustregel „100 : p“. Wie groß ist die Abweichung in Jahren?
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 'n', label: <M>{'n ='}</M>, expected: Math.log(2) / Math.log(1.06), tol: 0.05, unit: 'Jahre' },
            { kind: 'num', key: 'd', label: <>Abweichung</>, expected: 100 / 6 - Math.log(2) / Math.log(1.06), tol: 0.08, unit: 'Jahre' },
          ]}
          solution={
            <>
              <MB>{`n = \\frac{\\lg 2}{\\lg 1{,}06} = ${zt(Math.log(2) / Math.log(1.06), 2)}`}</MB>
              <p>
                Die Faustregel liefert 100 : 6 = 16,67 Jahre, also {fmt(100 / 6 - Math.log(2) / Math.log(1.06), 2)} Jahre zu viel. Mit Zinseszins geht es deutlich schneller als bei „Zinsen ohne Mitverzinsung“.
              </p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Für eine Verdopplung ist <M>{'K_n : K_0 = 2'}</M>. Du brauchst keine konkreten Beträge.</>,
                <>
                  <M>{'2 = 1{,}06^n'}</M> und dann Logarithmus.
                </>,
                <>
                  <M>{'n = \\lg 2 : \\lg 1{,}06'}</M>. Die Faustregel liefert <M>{'100 : 6'}</M>.
                </>,
              ]}
            />
          }
        />
      </Phase>

      {/* 6 Check */}
      <Phase no={6} title="Check: Hast du es verstanden?" social="EA" minutes={10}>
        <div className="lp-exlist">
          <McCard
            title="Check 1: Wer hat recht?"
            level="basis"
            prompt={
              <p>
                Mira will in 8 Jahren <M>{'6000\\text{ €}'}</M> bei 3 % haben. Sie rechnet: „6000 · 1,03⁸ = 7.600,62 €. Ich muss also 7.600,62 € anlegen.“ Jonas sagt: „Das stimmt nicht.“ Was ist richtig?
              </p>
            }
            options={[
              { text: 'Mira hat recht, man muss multiplizieren.', feedback: 'Mit 1,03⁸ multiplizierst du, wie viel Geld in 8 Jahren daraus wird. Gesucht ist der Betrag heute, also muss man teilen.' },
              {
                text: `Jonas hat recht: K₀ = 6000 : 1,03⁸ = ${fmt(k0Mira, 2, true)} €.`,
                correct: true,
                feedback: 'Genau. Mira müsste sonst mehr anlegen, als sie am Ende bekommen will – das ergibt keinen Sinn.',
              },
              { text: 'Beide haben unrecht, man muss 6000 − 1,03⁸ rechnen.', feedback: 'Das Kapital wird mit 1,03⁸ multipliziert, also rechnet man umgekehrt durch 1,03⁸ geteilt, nicht minus.' },
              { text: 'Jonas hat recht: K₀ = 6000 : 1,03 · 8.', feedback: 'Die 8 gehört in die Hochzahl: 1,03⁸, nicht mal 8. Das ganze Potenz wird dividiert.' },
            ]}
          />
          <McCard
            title="Check 2: Zinssatz bestimmen"
            level="standard"
            prompt={
              <p>
                Aus <M>{'2000\\text{ €}'}</M> werden in 5 Jahren <M>{'2500\\text{ €}'}</M>. Welcher Zinssatz (mit Zinseszins) steckt dahinter?
              </p>
            }
            options={[
              { text: `${fmt(((2500 / 2000) ** (1 / 5) - 1) * 100, 2)} %`, correct: true, feedback: 'q = ⁵√1,25 ≈ 1,0456, also p ≈ 4,56 %.' },
              { text: '5 %', feedback: '25 % Wachstum in 5 Jahren wären ohne Zinseszins genau 5 % pro Jahr. Mit Zinseszins reicht ein kleinerer Zinssatz.' },
              { text: '1,0456 %', feedback: 'Das ist der Zinsfaktor q, noch nicht der Zinssatz. p = (q − 1) · 100.' },
              { text: '25 %', feedback: '25 % ist der Gesamtzuwachs nach 5 Jahren, nicht der Zinssatz pro Jahr.' },
            ]}
          />
          <McCard
            title="Check 3: Verdopplung bei 5 %"
            level="standard"
            prompt={
              <p>
                Ein Guthaben wird mit <M>{'5\\,\\%'}</M> Zinseszins angelegt. Wie lange dauert es, bis es sich erstmals verdoppelt hat?
              </p>
            }
            options={[
              { text: '20 Jahre (100 : 5)', feedback: 'Diese Faustregel gilt nur ohne Zinseszins, also wenn die Zinsen ausgezahlt werden. Mit Zinseszins geht es schneller.' },
              { text: '15 Jahre (n = lg 2 : lg 1,05 ≈ 14,2, aufgerundet)', correct: true, feedback: 'Nach 14 Jahren fehlt noch ein wenig, nach 15 Jahren ist das Guthaben erstmals verdoppelt.' },
              { text: '10 Jahre', feedback: 'Nach 10 Jahren hat man bei 5 % erst rund 63 % Zuwachs, nicht 100 %.' },
              { text: '5 Jahre', feedback: 'Die 5 ist der Zinssatz, nicht die Laufzeit.' },
            ]}
          />
          <CheckCard
            title="Check 4: Gemischte Aufgabe"
            level="erweiterung"
            prompt={
              <p>
                <M>{'2000\\text{ €}'}</M> werden mit <M>{'2{,}5\\,\\%'}</M> Zinseszins angelegt. Nach wie vielen Jahren sind es erstmals mehr als <M>{'2500\\text{ €}'}</M>?
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'n', label: <M>{'n ='}</M>, expected: Math.log(1.25) / Math.log(1.025), tol: 0.02 },
              { kind: 'num', key: 'v', label: <>erstmals nach</>, expected: Math.ceil(Math.log(1.25) / Math.log(1.025)), unit: 'vollen Jahren', tol: 0.01 },
            ]}
            solution={
              <>
                <MB>{'2500 = 2000 \\cdot 1{,}025^n \\quad\\Rightarrow\\quad 1{,}25 = 1{,}025^n'}</MB>
                <MB>{`n = \\frac{\\lg 1{,}25}{\\lg 1{,}025} = ${zt(Math.log(1.25) / Math.log(1.025), 2)}`}</MB>
                <p>Also erstmals nach {Math.ceil(Math.log(1.25) / Math.log(1.025))} Jahren.</p>
              </>
            }
            help={
              <Hilfen
                steps={[
                  <>Welche Größe ist gesucht? Notiere <M>{'K_0'}</M>, <M>{'K_n'}</M> und <M>q</M>.</>,
                  <>
                    Teile durch <M>{'K_0'}</M>: <M>{'1{,}25 = 1{,}025^n'}</M>. Wende dann den Logarithmus an.
                  </>,
                  <>
                    <M>{'n = \\lg 1{,}25 : \\lg 1{,}025'}</M>.
                  </>,
                ]}
              />
            }
          />
        </div>
      </Phase>

      {/* 7 Sicherung */}
      <Phase no={7} title="Rückblick und Concept Map vervollständigen" social="GA" minutes={6}>
        <div className="ls-back">
          <p>
            {pred.saved ? (
              <>
                <strong>Du hattest vermutet:</strong> Das Guthaben verdoppelt sich nach etwa {pred.n} Jahren (Jonas’ Faustregel sagte 33 Jahre).
              </>
            ) : (
              <>Du hast in Abschnitt 2 noch keine Vermutung festgehalten. Hole das kurz nach, dann siehst du hier, ob du richtig lagst.</>
            )}
          </p>
          <p>
            <strong>Das Ergebnis:</strong> Bei 3 % Zinseszins verdoppelt sich das Guthaben nach etwa <strong>{fmt(nD, 1)} Jahren</strong>, also nach {nDvoll} vollen Jahren – nicht erst nach 33. Die Faustregel „100 : p“
            gilt nur, wenn die Zinsen ausgezahlt werden.
            {pred.saved && (
              <>
                {' '}
                {Math.abs(pred.n - nD) <= 2 ? 'Deine Schätzung war sehr gut!' : `Deine Schätzung lag ${fmt(Math.abs(pred.n - nD), 0)} Jahre ${pred.n > nD ? 'zu hoch' : 'zu niedrig'}.`}
              </>
            )}
          </p>
          <p>
            Du kannst jetzt alle vier Größen der Zinseszinsformel berechnen:
          </p>
          <MB>{'K_n = K_0 \\cdot q^n \\quad K_0 = \\frac{K_n}{q^n} \\quad q = \\sqrt[n]{\\frac{K_n}{K_0}} \\quad n = \\frac{\\lg\\left(K_n : K_0\\right)}{\\lg q}'}</MB>
        </div>
        <Kriterien
          intro={<p>Ergänzt eure Concept Map aus Teil 1 um die drei Umkehrungen. Hake ab, was ihr jetzt habt:</p>}
          items={[
            'Zins und Zinseszins sind in eigenen Worten erklärt',
            'Mindestens zwei Darstellungen (Tabelle, Graph, Term) von Jonas und Mira',
            'Die Formel K_n = K_0 · q^n steht dort, q ist erklärt',
            'Alle vier gesuchten Größen (K_n, K_0, q bzw. p, n) sind mit einem Beispiel belegt',
          ]}
        />
        <Stopp
          title="Gallery Walk: Vergleicht eure Plakate."
          items={[
            'Geht in Gruppen von Plakat zu Plakat. Was hat die andere Gruppe anders dargestellt?',
            'Gebt jeder Gruppe ein Lob und einen Tipp auf einem Klebezettel.',
          ]}
        />
        <p>
          <strong>Du arbeitest allein?</strong> So könnte eine fertige Concept Map aufgebaut sein:
        </p>
        <Wege
          items={[
            {
              summary: 'Aufbau einer Concept Map „Zins und Zinseszins“',
              body: (
                <>
                  <p>
                    <strong>Mitte:</strong> Zinseszins (Zinsen bleiben auf dem Konto und werden mitverzinst).
                  </p>
                  <p>
                    <strong>Äste:</strong> (1) Vergleich Jonas/Mira mit Tabelle und Graph. (2) Formel <M>{'K_n = K_0 \\cdot q^n'}</M> und <M>{'q = 1 + p/100'}</M>. (3) Umkehrungen:{' '}
                    <M>{'K_0 = K_n : q^n'}</M>, Wurzel für <M>q</M>, Logarithmus oder Probieren für <M>n</M>. (4) Typische Fehler: <M>{'1{,}03'}</M> statt <M>{'3'}</M>, „100 : p“ als Verdopplungszeit.
                  </p>
                </>
              ),
            },
          ]}
        />
      </Phase>
    </>
  )
}
