import { useState } from 'react'
import CheckedNumberInput from '../../../components/CheckedNumberInput'
import { VideoEmbed } from '../../../components/VideoButton'
import { Beispiel, M, MB, Merke, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { Arbeitsweise, CardHead, CheckCard, HeftHinweis, Hilfen, McCard } from '../../lineare_funktionen/lernsituation_kit/kit'
import { Etappe, Fortschritt, Teil } from '../../lineare_funktionen/lernsituation_kit/phasen'
import { Chat, Festlegung, Frage, Kriterien, Msg, WachstumGraph, eur, eurTex, kn, knEinfach } from './shared'

// Teil 1 (ca. 90 min) der Einstiegs-Lernsituation „Wer hat nach 10 Jahren mehr?“ zum Zinseszins: das Endkapital K_n.
// Format Kontrastierende Fälle, Look Messenger-Chat, Lernprodukt analog (Concept Map).
// Instruktionsreihenfolge: Problem zuerst. Die SuS kennen nur die Zinsrechnung, die Jahr-für-Jahr-Tabelle schaffen sie damit.
// Den Wachstumsfaktor q und die Formel erfahren sie erst danach über ein ausgearbeitetes Beispiel und das Erklärvideo.
// Die Festlegung bleibt nur im Seitenzustand (kein Speichern).

const VIDEO_KN = 'https://youtu.be/4A8DaY8-Mgw?si=L4IT09_79obIao_W'

const K0 = 5000
const P = 3
const N = 10
const Z = (K0 * P) / 100 // Jahreszins im ersten Jahr: 150 €

const mira = (j: number) => kn(K0, P, j)
const jonas = (j: number) => knEinfach(K0, P, j)
const VORSPRUNG = mira(N) - jonas(N)

type Prediction = { diff: number; saved: boolean }

/** Eingabefeld für die Jahrestabellen */
function Feld({ expected }: { expected: number }) {
  return <CheckedNumberInput expected={expected} tolerance={0.05} className="bk-input lp-input lp-input-sm zz-in" placeholder="?" />
}

function TabellenKarte() {
  const jahre = [1, 2, 3, 4, 5]
  return (
    <div className="zz-tables">
      <div>
        <h4 className="zz-table-title">Mira (Zinsen bleiben auf dem Sparkonto)</h4>
        <div className="zz-table-wrap">
          <table className="lp-table">
            <thead>
              <tr>
                <th>Jahr</th>
                <th>Kapital am Jahresanfang</th>
                <th>Zinsen (3 %)</th>
                <th>Kapital am Jahresende</th>
              </tr>
            </thead>
            <tbody>
              {jahre.map((j) => (
                <tr key={j}>
                  <td>{j}</td>
                  <td>{j === 1 ? eur(K0) : <Feld expected={mira(j - 1)} />}</td>
                  <td>
                    <Feld expected={mira(j - 1) * 0.03} />
                  </td>
                  <td>
                    <Feld expected={mira(j)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h4 className="zz-table-title">Jonas (Zinsen gehen aufs Girokonto)</h4>
        <div className="zz-table-wrap">
          <table className="lp-table">
            <thead>
              <tr>
                <th>Jahr</th>
                <th>Sparkonto</th>
                <th>Zinsen auf dem Girokonto (gesamt)</th>
                <th>Vermögen insgesamt</th>
              </tr>
            </thead>
            <tbody>
              {jahre.map((j) => (
                <tr key={j}>
                  <td>{j}</td>
                  <td>{j === 1 ? eur(K0) : <Feld expected={K0} />}</td>
                  <td>
                    <Feld expected={Z * j} />
                  </td>
                  <td>
                    <Feld expected={jonas(j)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function Teil1() {
  const [pred, setPred] = useState<Prediction>({ diff: 100, saved: false })

  return (
    <>
      <div className="lp-goal">
        <i className="fa-solid fa-bullseye" aria-hidden="true" />
        <div>
          <strong>Das lernst du in Teil 1:</strong> Du findest heraus, warum Zinsen, die auf dem Konto bleiben, mehr bringen als ausgezahlte Zinsen. Du berechnest das Endkapital{' '}
          <M>{'K_n'}</M> mit der Zinseszinsformel.
        </div>
      </div>
      <Arbeitsweise />

      {/* 1 Aktivieren */}
      <Fortschritt prefix="zz1" />

      <Etappe
        prefix="zz1"
        art="start"
        social="EA"
        minutes={10}
        was={<>Kurze Aufgaben allein lösen.</>}
        wozu={<>Du frischst auf, was du gleich zum Lösen des Problems brauchst.</>}
      >
        <p>Diese vier kurzen Aufgaben zur Zinsrechnung brauchst du gleich. Löse sie allein.</p>
        <div className="lp-exlist">
          <CheckCard
            title="a) Zinsen für ein Jahr"
            level="basis"
            prompt={
              <p>
                Ein Kapital von <M>{'5000\\text{ €}'}</M> wird mit <M>{'3\\,\\%'}</M> pro Jahr verzinst. Wie viel Zinsen gibt es für ein Jahr?
              </p>
            }
            fields={[{ kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 150, unit: '€' }]}
            solution={<MB>{'Z = K \\cdot \\frac{p}{100} = 5000 \\cdot \\frac{3}{100} = 150\\text{ €}'}</MB>}
          />
          <CheckCard
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
          <CheckCard
            title="c) Zinsen über mehrere Jahre"
            level="standard"
            prompt={
              <p>
                <M>{'2000\\text{ €}'}</M> werden mit <M>{'4\\,\\%'}</M> verzinst. Die Zinsen werden jedes Jahr ausgezahlt. Wie viel Zinsen sind das in 4 Jahren insgesamt?
              </p>
            }
            fields={[{ kind: 'num', key: 'z', label: <>Zinsen in 4 Jahren</>, expected: 320, unit: '€' }]}
            solution={
              <>
                <p>Zinsen für ein Jahr:</p>
                <MB>{'Z = 2000 \\cdot \\frac{4}{100} = 80\\text{ €}'}</MB>
                <p>
                  In 4 Jahren: <M>{'4 \\cdot 80\\text{ €} = 320\\text{ €}'}</M>
                </p>
              </>
            }
          />
          <McCard
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
        </div>
      </Etappe>

      {/* 2 Situation & Festlegung */}
      <Etappe
        prefix="zz1"
        art="problem"
        social="EA"
        minutes={10}
        was={<>Die Situation lesen und deine Vermutung festhalten. Noch nicht rechnen.</>}
        wozu={<>Du weißt genau, welche Frage du in Phase 3 beantwortest.</>}
      >
        <Teil title="Die Situation: Zwei Konten, ein Zinssatz">
          <Chat>
            <Msg who="mira">
              <p>Hey, wir haben beim Gewinnspiel beide 5.000 € gewonnen! 🎉</p>
            </Msg>
            <Msg who="jonas">
              <p>
                Ich lege meine 5.000 € für 10 Jahre zu 3 % an. Die Zinsen lasse ich mir jedes Jahr aufs Girokonto überweisen. Dort liegen sie dann einfach.
              </p>
            </Msg>
            <Msg who="mira">
              <p>Ich lege auch 10 Jahre zu 3 % an. Bei mir bleiben die Zinsen auf dem Sparkonto. Die Bank schreibt sie mir jedes Jahr gut.</p>
            </Msg>
            <Msg who="jonas">
              <p>Dann haben wir nach 10 Jahren doch gleich viel, oder? 😄</p>
            </Msg>
            <Msg who="mira">
              <p>Hmm, da bin ich mir nicht so sicher … Schreib mal, was du denkst!</p>
            </Msg>
          </Chat>
          <Frage>Hat Mira nach 10 Jahren mehr als Jonas? Und wenn ja, wie viel mehr?</Frage>
          <Festlegung
            frage={
              <>
                Lege dich fest, bevor du rechnest: Wie viel mehr Geld hat Mira nach 10 Jahren als Jonas? Wenn du denkst, dass beide gleich viel haben, stelle <strong>0 €</strong> ein.
              </>
            }
            min={0}
            max={1000}
            step={10}
            einheit="€"
            value={pred.diff}
            onChange={(v) => setPred({ ...pred, diff: v })}
            saved={pred.saved}
            onSave={() => setPred({ ...pred, saved: true })}
            onReset={() => setPred({ ...pred, saved: false })}
            savedText={
              <>
                Gespeichert: Du schätzt, dass Mira nach 10 Jahren etwa <strong>{eur(pred.diff)}</strong> mehr hat als Jonas. Am Ende schauen wir, ob du recht hattest.
              </>
            }
          />
        </Teil>
      </Etappe>

      {/* 3 Eigene Denkarbeit */}
      <Etappe
        prefix="zz1"
        art="loesen"
        minutes={40}
        was={<>Jahr für Jahr nachrechnen, wie die beiden Konten wachsen und die Formel kennenlernen.</>}
        wozu={<>So berechnest du, wie Kapital mit Zinseszins wächst.</>}
      >
        <Teil title="Jahr für Jahr nachrechnen" social="EA" minutes={20}>
          <p>
            Rechne zuerst allein. Beide haben <M>{'5000\\text{ €}'}</M> bei <M>{'3\\,\\%'}</M>. Miras Zinsen werden im Folgejahr mitverzinst, Jonas’ Zinsen nicht. Nur das Startkapital ist vorgegeben. Rechne die Zinsen jedes Jahres aus
            und trage alle Werte selbst ein. Die Felder werden grün, wenn sie stimmen (Rundung auf Cent).
          </p>
          <div className="lp-ex bk-panel">
            <CardHead title="Aufgabe 1: Die ersten 5 Jahre" level="basis" />
            <HeftHinweis><strong>Im Heft:</strong> Rechne die Tabellenwerte mit Rechenweg in deinem Heft aus. Trage dann nur die Ergebnisse ein.</HeftHinweis>
            <TabellenKarte />
            <Hilfen
              steps={[
                <>Mira: Wie viel Geld ist am Anfang des zweiten Jahres auf dem Konto? Mit diesem Betrag rechnest du die Zinsen aus.</>,
                <>
                  Mira: Zinsen = Kapital am Jahresanfang · 0,03. Das Kapital am Jahresende ist Anfang plus Zinsen. Jonas: Jedes Jahr kommen die gleichen 150 € aufs Girokonto dazu.
                </>,
                <>
                  Mira, Jahr 1: <M>{'5000 \\cdot 0{,}03 = 150'}</M>, Ende <M>{'5000 + 150 = 5150'}</M>. Jahr 2 beginnt mit <M>{'5150\\text{ €}'}</M>.
                </>,
              ]}
            />
          </div>
          <CheckCard
            title="Aufgabe 2: Nach 10 Jahren"
            level="standard"
            prompt={
              <>
                <p>
                  Wie viel Geld haben Jonas und Mira nach <strong>10 Jahren</strong> jeweils insgesamt? Rechne mit dem Taschenrechner weiter, aber überlege dir einen möglichst schnellen Weg.
                </p>
              </>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'j', label: <>Jonas insgesamt</>, expected: jonas(N), unit: '€', tol: 0.05 },
              { kind: 'num', key: 'm', label: <>Mira insgesamt</>, expected: mira(N), unit: '€', tol: 0.1 },
            ]}
            solution={
              <>
                <p>
                  Jonas: Das Sparkonto bleibt bei <M>{'5000\\text{ €}'}</M>, dazu kommen 10 Jahre mal <M>{'150\\text{ €}'}</M> Zinsen:
                </p>
                <MB>{`5000 + 10 \\cdot 150 = ${eurTex(jonas(N))}`}</MB>
                <p>
                  Mira: Jedes Jahr wird das Kapital mit <M>{'1{,}03'}</M> malgenommen (Kapital plus 3 % davon). Zehnmal hintereinander:
                </p>
                <MB>{`5000 \\cdot 1{,}03 \\cdot 1{,}03 \\cdot \\ldots \\cdot 1{,}03 = ${eurTex(mira(N))}`}</MB>
              </>
            }
            help={
              <Hilfen
                steps={[
                  <>Was passiert in jedem Jahr mit Miras Kapital? Mit welcher einen Zahl musst du es jedes Mal multiplizieren, um direkt das neue Kapital zu bekommen?</>,
                  <>Kapital plus 3 % davon ist dasselbe wie das Kapital mal einer Zahl. Überlege, welche Zahl das ist, und rechne damit 10-mal weiter.</>,
                  <>
                    <M>{'5000 \\cdot 1{,}03 = 5150'}</M>, <M>{'5150 \\cdot 1{,}03 = 5304{,}50'}</M>, und so weiter. Du kannst auch 1,03 mehrmals hintereinander malnehmen.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            title="Aufgabe 3: Wann sind es mehr als 200 € Zinsen?"
            level="erweiterung"
            prompt={
              <p>
                Mira bekommt im 1. Jahr 150 € Zinsen. Die Zinsen werden von Jahr zu Jahr mehr. In welchem Jahr bekommt Mira zum ersten Mal <strong>mehr als 200 € Zinsen</strong> für ein Jahr?
                Setze die Rechnung über die 10 Jahre hinaus fort.
              </p>
            }
            fields={[{ kind: 'num', key: 'j', label: <>im Jahr</>, expected: 11, tol: 0.01 }]}
            solution={
              <>
                <p>
                  Die Zinsen eines Jahres sind <M>{'0{,}03'}</M> mal das Kapital vom Jahresanfang. Mehr als <M>{'200\\text{ €}'}</M> gibt es, wenn das Kapital über <M>{'6666{,}67\\text{ €}'}</M> liegt.
                </p>
                <MB>{`K_9 = ${eurTex(mira(9))}\\ \\to\\ Z_{10} = ${eurTex(mira(9) * 0.03)} \\qquad K_{10} = ${eurTex(mira(10))}\\ \\to\\ Z_{11} = ${eurTex(mira(10) * 0.03)}`}</MB>
                <p>Im 11. Jahr bekommt Mira zum ersten Mal über 200 € Zinsen.</p>
              </>
            }
            help={
              <Hilfen
                steps={[
                  <>Die Zinsen eines Jahres hängen vom Kapital am Jahresanfang ab. Wie groß muss dieses Kapital mindestens sein, damit 3 % davon mehr als 200 € sind?</>,
                  <>Mehr als 200 € Zinsen bedeuten: Kapital · 0,03 &gt; 200. Rechne aus, ab welchem Kapital das gilt, und suche dann das Jahr in deiner Tabelle.</>,
                  <>
                    Ab einem Kapital von über <M>{'200 : 0{,}03 \\approx 6666{,}67\\text{ €}'}</M>. Miras Kapital nach 10 Jahren ist <M>{`${eurTex(mira(10))}`}</M>.
                  </>,
                ]}
              />
            }
          />
        </Teil>




      {/* 5 Information */}
        <Teil title="Information: So wächst Kapital mit Zinseszins" social="EA" minutes={20}>
          <p>Schau dir zuerst das Erklärvideo an. Danach verfolgst du am Beispiel von Mira, wie die Formel entsteht.</p>
          <VideoEmbed src={VIDEO_KN} title="Erklärvideo: Endkapital K_n berechnen" />
          <Beispiel
            title="Wie entsteht die Zinseszinsformel? (Mira, 5.000 €, 3 %)"
            aufgabe={
              <p>
                Mira legt <M>{'5000\\text{ €}'}</M> zu <M>{'3\\,\\%'}</M> an. Wie viel Geld hat sie nach 1, 2 und 3 Jahren? Welches Muster erkennst du?
              </p>
            }
            steps={[
              {
                title: 'Nach 1 Jahr',
                body: (
                  <>
                    <MB>{'K_1 = 5000 + 5000 \\cdot 0{,}03 = 5000 \\cdot (1 + 0{,}03) = 5000 \\cdot 1{,}03'}</MB>
                    <p>
                      „Kapital plus 3 % davon“ ist dasselbe wie „Kapital mal <M>{'1{,}03'}</M>“. Diese Zahl heißt <strong>Zinsfaktor</strong> <M>q</M>. Für 3 % ist <M>{'q = 1 + \\frac{3}{100} = 1{,}03'}</M>.
                    </p>
                  </>
                ),
              },
              {
                title: 'Nach 2 Jahren',
                body: (
                  <>
                    <p>
                      Im 2. Jahr wird <M>{'K_1'}</M> wieder mit <M>{'1{,}03'}</M> multipliziert, die Zinsen des 1. Jahres werden also mitverzinst:
                    </p>
                    <MB>{`K_2 = K_1 \\cdot 1{,}03 = 5000 \\cdot 1{,}03 \\cdot 1{,}03 = 5000 \\cdot 1{,}03^2 = ${eurTex(mira(2))}`}</MB>
                  </>
                ),
              },
              {
                title: 'Nach 3 Jahren: das Muster',
                body: (
                  <>
                    <MB>{`K_3 = 5000 \\cdot 1{,}03^3 = ${eurTex(mira(3))}`}</MB>
                    <p>
                      In jedem Jahr kommt ein Faktor <M>{'1{,}03'}</M> dazu. Die <strong>Hochzahl</strong> ist die Anzahl der Jahre.
                    </p>
                  </>
                ),
              },
              {
                title: 'Die Formel',
                body: (
                  <>
                    <MB>{'K_n = K_0 \\cdot q^n \\qquad \\text{mit } q = 1 + \\frac{p}{100}'}</MB>
                    <p>
                      <M>{'K_0'}</M> ist das Anfangskapital, <M>p</M> der Zinssatz in Prozent, <M>n</M> die Anzahl der Jahre und <M>{'K_n'}</M> das Endkapital.
                    </p>
                  </>
                ),
              },
              {
                title: 'Mira nach 10 Jahren',
                body: (
                  <>
                    <MB>{`K_{10} = 5000 \\cdot 1{,}03^{10} = ${eurTex(mira(10))}`}</MB>
                    <p>
                      Im Taschenrechner: <M>{'5000 \\cdot 1{,}03 \\,\\boxed{x^y}\\, 10'}</M>. Jonas hat nur <M>{`${eurTex(jonas(10))}`}</M>. Das sind <strong>{eur(VORSPRUNG)}</strong> weniger.
                    </p>
                  </>
                ),
              },
            ]}
          />
          <Merke title="Zinseszins und Endkapital">
            <p>
              Bleiben die Zinsen auf dem Konto, werden sie im nächsten Jahr <strong>mitverzinst</strong>. Das nennt man <strong>Zinseszins</strong>.
            </p>
            <p className="zz-merke-formel">
              <M>{'K_n = K_0 \\cdot q^n \\quad\\text{mit}\\quad q = 1 + \\frac{p}{100}'}</M>
            </p>
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
          <CheckCard
            title="Jetzt du: Beispiel mit Lücken"
            level="basis"
            prompt={
              <>
                <p>
                  Tim legt <M>{'2000\\text{ €}'}</M> zu <M>{'4\\,\\%'}</M> für 3 Jahre an. Die Zinsen bleiben auf dem Konto. Ergänze die Lücken: erst den Zinsfaktor, dann das Endkapital.
                </p>
              </>
            }
            rechnung={[{ l: ['K_3'], r: ['2000 \\cdot', { luecke: 'q' }, '{}^{3} =', { luecke: 'k', breit: true }, '\\text{€}'] }]}
            fields={[
              { kind: 'num', key: 'q', label: 'Zinsfaktor q', expected: 1.04, tol: 0.0001 },
              { kind: 'num', key: 'k', label: 'K_3 in €', expected: kn(2000, 4, 3), tol: 0.05 },
            ]}
            solution={
              <>
                <MB>{'q = 1 + \\frac{4}{100} = 1{,}04'}</MB>
                <MB>{`K_3 = 2000 \\cdot 1{,}04^3 = ${eurTex(kn(2000, 4, 3))}`}</MB>
              </>
            }
            help={
              <Hilfen
                steps={[
                  <>Wie wird aus dem Zinssatz 4 % der Zinsfaktor? Schau in den Merkkasten.</>,
                  <>
                    <M>{'q = 1 + \\frac{p}{100}'}</M>. Setze <M>{'p = 4'}</M> ein. Dann rechnest du <M>{'2000 \\cdot q^3'}</M>.
                  </>,
                  <>
                    <M>{'q = 1{,}04'}</M>. Taschenrechner: <M>{'2000 \\cdot 1{,}04 \\,\\boxed{x^y}\\, 3'}</M>.
                  </>,
                ]}
              />
            }
          />
          <p>
            <strong>Dieselbe Geschichte im Graph:</strong> Jonas’ Konto wächst jedes Jahr um den gleichen Betrag (Gerade). Miras Konto wächst jedes Jahr um einen größeren Betrag (Kurve).
          </p>
          <WachstumGraph k0={K0} p={P} />
          <McCard
            title="Was zeigt der Graph?"
            level="standard"
            prompt={<p>Wie entwickelt sich der Vorsprung von Mira vor Jonas, wenn du die Laufzeit größer stellst?</p>}
            options={[
              { text: 'Der Vorsprung bleibt immer gleich groß.', feedback: 'Nein. Schiebe den Regler: Nach 5 Jahren ist der Abstand kleiner als nach 10 Jahren.' },
              { text: 'Der Vorsprung wächst Jahr für Jahr gleichmäßig, wie bei einer Geraden.', feedback: 'Fast, aber Miras Linie ist keine Gerade. Der Abstand wächst erst langsam und dann immer schneller.' },
              { text: 'Der Vorsprung wächst immer schneller, weil Mira auch auf die Zinsen Zinsen bekommt.', correct: true, feedback: 'Genau. Die Kurve wird steiler: Je mehr Kapital, desto mehr Zinsen, und die werden wieder mitverzinst.' },
              { text: 'Der Vorsprung wird irgendwann wieder kleiner.', feedback: 'Nein. Mira bekommt immer mehr Zinsen als Jonas, der Abstand wird nie kleiner.' },
            ]}
          />
        </Teil>
      </Etappe>

      {/* 6 Check */}
      <Etappe
        prefix="zz1"
        art="sichern"
        minutes={20}
        was={<>Das Wichtigste in deinem Heft festhalten und dann allein prüfen, ob du es kannst.</>}
        wozu={<>Dein Hefteintrag hilft dir bei allen Aufgaben dieser Art. Der Check zeigt dir, wo du noch unsicher bist.</>}
      >
        <Teil title="Check: Hast du es verstanden?" social="EA" minutes={12}>
          <div className="lp-exlist">
            <McCard
              title="Check 1: Welche Rechnung passt?"
              level="basis"
              prompt={
                <p>
                  <M>{'2000\\text{ €}'}</M> werden 5 Jahre lang zu <M>{'4\\,\\%'}</M> angelegt. Die Zinsen bleiben auf dem Konto (Zinseszins). Welche Rechnung liefert das Endkapital?
                </p>
              }
              options={[
                { text: '2000 · 1,04^5', correct: true, feedback: 'Zinsfaktor q = 1,04, Hochzahl = 5 Jahre.' },
                { text: '2000 · (1 + 0,04 · 5)', feedback: 'Das ist die Rechnung ohne Zinseszins, bei der die Zinsen jedes Jahr gleich bleiben. Bei Zinseszins wird das Kapital immer wieder mit q multipliziert.' },
                { text: '2000 · 4^5', feedback: 'Der Zinsfaktor ist nicht 4, sondern 1 + 4/100 = 1,04.' },
                { text: '2000 · 1,4^5', feedback: '4 % sind 0,04, nicht 0,4. Der Zinsfaktor ist 1,04.' },
              ]}
            />
            <McCard
              title="Check 2: Wer hat recht?"
              rechnen
              level="standard"
              prompt={
                <p>
                  Anna und Ben legen je <M>{'1000\\text{ €}'}</M> für 2 Jahre zu <M>{'6\\,\\%'}</M> an, die Zinsen bleiben auf dem Konto. Anna sagt: „Ich habe <strong>1.120 €</strong>, denn 2 · 60 € Zinsen.“ Ben sagt: „Ich habe{' '}
                  <strong>1.123,60 €</strong>.“ Wer hat recht?
                </p>
              }
              options={[
                { text: 'Anna, denn die Zinsen sind in beiden Jahren gleich: 60 €.', feedback: 'Im 2. Jahr sind die Zinsen 6 % von 1.060 €, also 63,60 €. Die Zinsen des 1. Jahres werden mitverzinst.' },
                { text: 'Ben: 1000 · 1,06² = 1.123,60 €.', correct: true, feedback: 'Genau. Im 2. Jahr gibt es 3,60 € Zinsen auf die Zinsen des 1. Jahres.' },
                { text: 'Beide haben recht, es kommt auf die Rechenweise an.', feedback: 'Die Aufgabe sagt, dass die Zinsen auf dem Konto bleiben. Dann gibt es nur ein richtiges Ergebnis: mit Zinseszins.' },
                { text: 'Keiner, denn das Ergebnis muss 1.060 € sein.', feedback: '1.060 € hätte man nach einem Jahr. Hier sind es 2 Jahre.' },
              ]}
            />
            <CheckCard
              title="Check 3: Endkapital berechnen"
              level="standard"
              prompt={
                <p>
                  Lena legt <M>{'3500\\text{ €}'}</M> für 8 Jahre zu <M>{'2{,}5\\,\\%'}</M> an. Die Zinsen bleiben auf dem Konto. Wie viel Geld hat sie am Ende?
                </p>
              }
              fields={[{ kind: 'num', key: 'k', label: <M>{'K_8 ='}</M>, expected: kn(3500, 2.5, 8), unit: '€', tol: 0.05 }]}
              solution={
                <>
                  <MB>{'q = 1 + \\frac{2{,}5}{100} = 1{,}025'}</MB>
                  <MB>{`K_8 = 3500 \\cdot 1{,}025^8 = ${eurTex(kn(3500, 2.5, 8))}`}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Welche Größen sind gegeben? Notiere <M>{'K_0'}</M>, <M>p</M> und <M>n</M>.</>,
                    <>
                      Berechne zuerst den Zinsfaktor <M>{'q = 1 + \\frac{p}{100}'}</M>, dann <M>{'K_n = K_0 \\cdot q^n'}</M>.
                    </>,
                    <>
                      <M>{'q = 1{,}025'}</M>, also <M>{'K_8 = 3500 \\cdot 1{,}025^8'}</M>.
                    </>,
                  ]}
                />
              }
            />
            <CheckCard
              title="Check 4: Zinsen insgesamt"
              level="erweiterung"
              prompt={
                <p>
                  Aus <M>{'4000\\text{ €}'}</M> werden bei <M>{'3{,}5\\,\\%'}</M> in 6 Jahren (mit Zinseszins) ein Endkapital. Berechne das Endkapital und wie viel <strong>Zinsen</strong> insgesamt dabei
                  herauskommen. Wie viel weniger Zinsen wären es ohne Zinseszins (Zinsen jedes Jahr ausgezahlt)?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'k', label: <M>{'K_6 ='}</M>, expected: kn(4000, 3.5, 6), unit: '€', tol: 0.05 },
                { kind: 'num', key: 'z', label: <>Zinsen insgesamt</>, expected: kn(4000, 3.5, 6) - 4000, unit: '€', tol: 0.05 },
                { kind: 'num', key: 'd', label: <>Unterschied</>, expected: kn(4000, 3.5, 6) - knEinfach(4000, 3.5, 6), unit: '€', tol: 0.05 },
              ]}
              solution={
                <>
                  <MB>{`K_6 = 4000 \\cdot 1{,}035^6 = ${eurTex(kn(4000, 3.5, 6))}`}</MB>
                  <MB>{`\\text{Zinsen} = ${eurTex(kn(4000, 3.5, 6))} - 4000\\text{ €} = ${eurTex(kn(4000, 3.5, 6) - 4000)}`}</MB>
                  <p>
                    Ohne Zinseszins wären es 6 · 140 € = 840 € Zinsen. Der Unterschied beträgt {eur(kn(4000, 3.5, 6) - knEinfach(4000, 3.5, 6))}.
                  </p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Das Endkapital berechnest du mit der Zinseszinsformel. Die Zinsen sind Endkapital minus Anfangskapital.</>,
                    <>Ohne Zinseszins sind die Zinsen jedes Jahr gleich: 3,5 % von 4000 €. Multipliziere sie mit 6 Jahren.</>,
                    <>
                      <M>{'q = 1{,}035'}</M>, <M>{'K_6 = 4000 \\cdot 1{,}035^6'}</M>. Zinsen pro Jahr ohne Zinseszins: <M>{'4000 \\cdot 0{,}035 = 140'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </div>
        </Teil>


      {/* 7 Sicherung */}
        <Teil title="Das hältst du fest" social="GA" minutes={8}>
          <div className="ls-back">
            <p>
              {pred.saved ? (
                <>
                  <strong>Du hattest vermutet:</strong> Mira hat nach 10 Jahren etwa {eur(pred.diff)} mehr als Jonas.
                </>
              ) : (
                <>Du hast in Phase 2 noch keine Vermutung festgehalten. Hole das kurz nach, dann siehst du hier, ob du richtig lagst.</>
              )}
            </p>
            <p>
              <strong>Das Ergebnis:</strong> Mira hat <M>{`${eurTex(mira(N))}`}</M>, Jonas <M>{`${eurTex(jonas(N))}`}</M>. Der Vorsprung beträgt {eur(VORSPRUNG)}.
              {pred.saved && (
                <>
                  {' '}
                  {Math.abs(pred.diff - VORSPRUNG) <= 25
                    ? 'Deine Schätzung war sehr nah dran!'
                    : pred.diff === 0
                      ? 'Du hattest mit „gleich viel“ gerechnet. Der Grund für den Unterschied: Miras Zinsen werden selbst wieder verzinst.'
                      : `Deine Schätzung lag ${fmt(Math.abs(pred.diff - VORSPRUNG), 0)} € ${pred.diff > VORSPRUNG ? 'zu hoch' : 'zu niedrig'}.`}
                </>
              )}
            </p>
            <p>
              Der Grund: Die Zinsen jedes Jahres werden bei Mira im nächsten Jahr mitverzinst. Der Vorsprung wächst deshalb nicht gleichmäßig, sondern immer schneller. Mit{' '}
              <M>{'K_n = K_0 \\cdot q^n'}</M> rechnest du das Endkapital direkt aus, ohne Tabelle.
            </p>
          </div>
          <Kriterien
            intro={
              <p>
                Legt in der Gruppe auf einem A3-Blatt eine <strong>Concept Map „Zins und Zinseszins“</strong> an. Sie wächst in Teil 2 weiter. Hake ab, was ihr schon habt:
              </p>
            }
            items={[
              'Zins (Auszahlung) und Zinseszins (Zinsen bleiben) sind in eigenen Worten erklärt',
              'Mindestens zwei Darstellungen (Tabelle, Graph, Term) von Jonas und Mira',
              'Die Formel K_n = K_0 · q^n steht dort, q ist erklärt (3 % → q = 1,03)',
              'Ein eigenes Beispiel mit anderen Zahlen (Platz für weitere Größen lassen!)',
            ]}
          />
        </Teil>
      </Etappe>
    </>
  )
}
