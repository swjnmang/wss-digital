import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import TaskShell from '../../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt } from '../../lernpfad/kit'
import { CheckCard, Hilfen, McCard } from '../../../lineare_funktionen/lernsituation_kit/kit'
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Handlungsprodukt,
  SeitenLernsituation,
  type Seite,
  type Thema,
} from '../../../lineare_funktionen/lernsituation_kit/seiten'
import { Bilanz } from '../../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien, Vermutung, Zitat, type Festlegung } from '../../../finanzmathe/zins_kit/zins_kit'
import { metaFor } from '../meta'
import '../../lernpfad/lernpfad.css'
import { AushangBild, Gluecksrad, Titelbild } from './GluecksradBilder'
import GluecksradLabor, { type Zaehlung } from './GluecksradLabor'
import GluecksradSpiel from './GluecksradSpiel'
import './gluecksrad.css'

// Lernsituation 5.6 „Das Glücksrad“: Zufallsexperimente, Ergebnismenge Ω, Ereignisse, Laplace-Wahrscheinlichkeit und Gegenereignis (ca. 45 min).
// Format Experimentierlabor: Die SMV bietet am Schulfest ein Glücksrad (12 gleich große Felder: 1 Hauptgewinn, 3 Trostpreise, 8 Nieten)
// an und wirbt: „Bei uns gewinnt jeder Vierte!“ Die SuS drehen das Rad selbst, sehen Strichliste und Graph der relativen Häufigkeit
// und legen sich fest. Aha: Die relativen Häufigkeiten schwanken nach 10 oder 50 Drehungen stark; sicher wird die Chance erst durch
// Rechnen: P(Gewinn) = 4/12 = 1/3, also jeder Dritte, nicht jeder Vierte.
// Lernprodukt analog: Aushang „Unser faires Glücksrad“ (Rad, Wahrscheinlichkeiten, korrigierter Werbespruch) im Heft.
// Punkte nach Aufwand (Pflicht 60): Warm-up 2+2+2+3+3 = 12 (20 %), Problem erkennen 3+3 = 6, Problem lösen 15 (Ergebnisse) + 4 (Empfehlung)
// + 5 (Kriterien) = 24 (40 %), Übungen 4 + 6 + 8 = 18 (30 %), Profi 9; Bonus-Spiel 4 Runden à 2 = 8 (höchstens so viel wie die beste Übung).
// Identität: Indigo, fa-dice, Titelbild Stand der SMV mit Glücksrad, Leitobjekt das Glücksrad. Die Versuche bleiben nur im Seitenzustand.
// Lernvideo: keines zu diesem Lernschritt bei den Übungsaufgaben verlinkt (offener Punkt), deshalb nur die Beispielrechnung.

const META = metaFor('zufallsexperimente')
const THEMA: Thema = { ...META.thema, bild: <Titelbild /> }

type Wahl = 'weniger' | 'vier' | 'mehr'
const WAHL: Record<Wahl, string> = {
  weniger: 'Es gewinnt seltener als jeder Vierte.',
  vier: 'Es gewinnt etwa jeder Vierte, die SMV hat recht.',
  mehr: 'Es gewinnt häufiger als jeder Vierte.',
}

const prozent = (p: number) => `${fmt(p * 100, 1)} %`

/* ── Rechenbeispiel: Zahlenrad der Klasse 10b ────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Die Klasse 10b hat ein Rad mit <strong>10 gleich großen Feldern</strong>, die mit den Zahlen 1 bis 10 beschriftet sind. Das Rad wird
    einmal gedreht. Wie wahrscheinlich ist das Ereignis E: „Es kommt eine Primzahl“? Und wie wahrscheinlich ist das Gegenereignis?
  </p>
)
const BSP_SCHRITTE: { title: string; body: ReactNode }[] = [
  {
    title: 'Ergebnismenge Ω aufschreiben',
    body: (
      <>
        <MB>{'\\Omega = \\{1;\\,2;\\,3;\\,4;\\,5;\\,6;\\,7;\\,8;\\,9;\\,10\\}'}</MB>
        <p>
          Es gibt 10 mögliche Ergebnisse, also <M>{'|\\Omega| = 10'}</M>. Alle Felder sind gleich groß, deshalb ist jedes Ergebnis gleich
          wahrscheinlich (Laplace-Experiment).
        </p>
      </>
    ),
  },
  {
    title: 'Günstige Ergebnisse zählen',
    body: (
      <>
        <MB>{'E = \\{2;\\,3;\\,5;\\,7\\}'}</MB>
        <p>
          Vier Zahlen sind Primzahlen: <M>{'|E| = 4'}</M>.
        </p>
      </>
    ),
  },
  {
    title: 'Laplace-Formel anwenden',
    body: <MB>{'P(E) = \\frac{|E|}{|\\Omega|} = \\frac{4}{10} = \\frac{2}{5} = 40\\,\\%'}</MB>,
  },
  {
    title: 'Gegenereignis berechnen',
    body: (
      <>
        <p>
          Das Gegenereignis <M>{'\\overline{E}'}</M> heißt „keine Primzahl“. Es tritt genau dann ein, wenn E nicht eintritt:
        </p>
        <MB>{'P(\\overline{E}) = 1 - P(E) = 1 - \\frac{2}{5} = \\frac{3}{5} = 60\\,\\%'}</MB>
        <p>Kontrolle: Sechs Felder (1, 4, 6, 8, 9, 10) sind keine Primzahlen, und <M>{'\\frac{6}{10} = \\frac{3}{5}'}</M> ✓</p>
      </>
    ),
  },
]

const LOESUNG = (
  <>
    <MB>{'|\\Omega| = 12'}</MB>
    <MB>{'P(\\text{Hauptgewinn}) = \\frac{1}{12} \\approx 8{,}3\\,\\%'}</MB>
    <MB>{'P(\\text{Gewinn}) = \\frac{1 + 3}{12} = \\frac{4}{12} = \\frac{1}{3} \\approx 33{,}3\\,\\%'}</MB>
    <MB>{'P(\\text{Niete}) = 1 - P(\\text{Gewinn}) = 1 - \\frac{1}{3} = \\frac{2}{3} \\approx 66{,}7\\,\\%'}</MB>
    <p>Es gewinnt also jeder Dritte, nicht jeder Vierte.</p>
  </>
)

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function GluecksradEinstieg() {
  const navigate = useNavigate()
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 25, fest: false })
  const [labor, setLabor] = useState<Zaehlung>({ n: 0, gewinne: 0 })
  const [genug, setGenug] = useState(false)
  const [geloest, setGeloest] = useState(false)
  const [uebungen, setUebungen] = useState<string[]>([])
  const uebung = (key: string, fertig: (key: string) => () => void) => () => {
    fertig(key)()
    setUebungen((u) => (u.includes(key) ? u : [...u, key]))
  }

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            title="a) Bruch als Dezimalzahl"
            punkte={2}
            prompt={<p>Schreibe als Dezimalzahl.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'a1', label: <M>{'\\frac{3}{4} ='}</M>, expected: 0.75, tol: 0.0005 },
              { kind: 'num', key: 'a2', label: <M>{'\\frac{1}{8} ='}</M>, expected: 0.125, tol: 0.0005 },
            ]}
            solution={<MB>{'\\frac{3}{4} = 3 : 4 = 0{,}75 \\qquad \\frac{1}{8} = 1 : 8 = 0{,}125'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            title="b) Prozent als Dezimalzahl"
            punkte={2}
            prompt={<p>Schreibe als Dezimalzahl.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'b1', label: <M>{'35\\,\\% ='}</M>, expected: 0.35, tol: 0.0005 },
              { kind: 'num', key: 'b2', label: <M>{'12{,}5\\,\\% ='}</M>, expected: 0.125, tol: 0.0005 },
            ]}
            solution={<MB>{'35\\,\\% = \\frac{35}{100} = 0{,}35 \\qquad 12{,}5\\,\\% = \\frac{12{,}5}{100} = 0{,}125'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            title="c) Ergebnisse zählen"
            punkte={2}
            rechnen={false}
            prompt={
              <p>
                Ein Würfel wird einmal geworfen. Wie viele Ergebnisse sind insgesamt möglich? Bei wie vielen davon kommt eine Primzahl
                (2, 3, 5)?
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'alle', label: 'mögliche Ergebnisse:', expected: 6 },
              { kind: 'num', key: 'prim', label: 'Primzahl:', expected: 3 },
            ]}
            solution={<p>Es gibt die sechs Ergebnisse 1, 2, 3, 4, 5, 6. Davon sind 2, 3 und 5 Primzahlen, also drei.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            title="d) Ergänzen zu 1"
            punkte={3}
            prompt={<p>Berechne. Du darfst Dezimalzahlen oder Brüche eingeben.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'd1', label: <M>{'1 - 0{,}35 ='}</M>, expected: 0.65, tol: 0.0005 },
              { kind: 'num', key: 'd2', label: <M>{'1 - \\frac{3}{8} ='}</M>, expected: 0.625, tol: 0.0005 },
            ]}
            solution={<MB>{'1 - 0{,}35 = 0{,}65 \\qquad 1 - \\frac{3}{8} = \\frac{8}{8} - \\frac{3}{8} = \\frac{5}{8} = 0{,}625'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Du suchst die Zahl, die zu 1 noch fehlt.</>,
                  <>
                    Schreibe die 1 bei einem Bruch als <M>{'\\frac{8}{8}'}</M>.
                  </>,
                  <>
                    <M>{'\\frac{8}{8} - \\frac{3}{8}'}</M>: Subtrahiere nur die Zähler.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            title="e) Relative Häufigkeit"
            punkte={3}
            prompt={
              <p>
                Ein Rad wurde 40-mal gedreht. Dabei kam 6-mal „Rot“. Wie groß ist die relative Häufigkeit <M>h</M> von „Rot“? Gib sie als
                Dezimalzahl oder in Prozent an.
              </p>
            }
            fields={[{ kind: 'num', key: 'h', label: <M>{'h ='}</M>, expected: 0.15, tol: 0.0005 }]}
            solution={<MB>{'h = \\frac{H}{n} = \\frac{6}{40} = 0{,}15 = 15\\,\\%'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Die relative Häufigkeit setzt die Treffer ins Verhältnis zu allen Drehungen.</>,
                  <>
                    <M>{'h = H : n'}</M> mit <M>{'H = 6'}</M> und <M>{'n = 40'}</M>.
                  </>,
                  <>
                    <M>{'6 : 40 = 0{,}15'}</M>
                  </>,
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Gewinnt wirklich jeder Vierte?',
      pflicht: ['dreh', 'fest'],
      bedingung: 'Dreh das Rad mindestens 50-mal und lege dich fest, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du bist in der SMV deiner Schule. Auf dem Schulfest betreibt ihr ein Glücksrad. Es hat <strong>12 gleich große Felder</strong>:
            ein goldenes Feld mit Stern (Hauptgewinn), drei Felder mit Punkt (Trostpreis) und acht leere Felder (Niete). Ein Dreh kostet 1 €.
          </p>
          <p className="sl-text">
            Gesucht ist, wie oft jemand etwas gewinnt, also entweder den Hauptgewinn oder einen Trostpreis. Auf dem Werbeplakat steht:
          </p>
          <Zitat wer="Das Plakat der SMV">
            <p>„Bei uns gewinnt jeder Vierte!“</p>
          </Zitat>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Probier das Rad aus und lege dich fest</p>
            <p>
              Dreh das Rad mindestens 50-mal, ohne zu rechnen. Schau dir die Strichliste und den Graphen an. Entscheide dann, ob der
              Werbespruch stimmt.
            </p>
          </div>
          <GluecksradLabor onZaehlung={setLabor} onGenug={() => { setGenug(true); fertig.teil('dreh')() }} />
          {genug && (
            <Abschnitt titel="Lege dich fest">
              <p className="sl-text">
                Auf dem Graphen siehst du, wie sich der Anteil der Gewinne entwickelt hat. Stimmt der Werbespruch? Wie viele Gewinne gibt es
                deiner Meinung nach bei 100 Drehungen?
              </p>
              <Vermutung
                optionen={WAHL}
                regler={{
                  min: 5,
                  max: 60,
                  step: 1,
                  text: (v) => (
                    <>
                      Bei 100 Drehungen gewinnen etwa <span className="ls-slider-value">{v}</span>.
                    </>
                  ),
                }}
                wert={fest}
                onChange={setFest}
                onFest={fertig.teil('fest')}
                gespeichert={(w) => (
                  <>
                    Deine Vermutung: <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong> Bei 100 Drehungen erwartest du etwa{' '}
                    <strong>{w.wert}</strong> Gewinne.
                  </>
                )}
              />
              <p className="gr-erkenntnis ls-back">
                <strong>Schon gemerkt?</strong> Nach wenigen Drehungen ist der Anteil der Gewinne mal weit oben, mal weit unten. Erst bei
                vielen Drehungen wird die Linie ruhiger, und trotzdem bleibt sie ein bisschen unsicher. Ob die Chance bei einem Viertel, bei
                einem Drittel oder woanders liegt, kannst du nur durch Ausprobieren nicht sicher sagen. Gleich lernst du, wie du sie
                berechnest.
              </p>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Chancen am Glücksrad',
      pflicht: ['rechnung', 'empfehlung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne die Gewinnchancen des SMV-Glücksrads</p>
            <p>
              Das Rad hat 12 gleich große Felder: 1 Hauptgewinn, 3 Trostpreise und 8 Nieten. Berechne in deinem Heft die Wahrscheinlichkeit
              für den Hauptgewinn, für einen Gewinn (Hauptgewinn oder Trostpreis) und für eine Niete. Für die Niete nutzt du das
              Gegenereignis.
            </p>
          </div>
          <div className="zk-bild gr-rad">
            <Gluecksrad />
          </div>
          <BeispielMitVideo>
            <Beispiel offen title="Das Zahlenrad der Klasse 10b" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('rechnung')()
                setGeloest(true)
              }}
              title="Wahrscheinlichkeiten am Glücksrad"
              punkte={15}
              prompt={
                <p>
                  Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt. Wahrscheinlichkeiten darfst du als
                  Bruch, Dezimalzahl oder in Prozent angeben (auf eine Nachkommastelle genau).
                </p>
              }
              fields={[
                { kind: 'num', key: 'n', label: 'Wie viele mögliche Ergebnisse hat ein Dreh?', expected: 12 },
                { kind: 'num', key: 'hg', label: 'Wie wahrscheinlich ist der Hauptgewinn?', expected: 1 / 12, tol: 0.004 },
                { kind: 'num', key: 'gew', label: 'Wie wahrscheinlich ist ein Gewinn (Hauptgewinn oder Trostpreis)?', expected: 1 / 3, tol: 0.004 },
                { kind: 'num', key: 'niete', label: 'Wie wahrscheinlich ist eine Niete? Nutze das Gegenereignis von „Gewinn“.', expected: 2 / 3, tol: 0.004 },
              ]}
              loesungNachFehler
              solution={LOESUNG}
              help={
                <Hilfen
                  steps={[
                    <>Rechne wie im Beispiel der Klasse 10b: erst alle möglichen Ergebnisse zählen, dann die günstigen.</>,
                    <>
                      Laplace-Formel: <M>{'P(E) = \\frac{|E|}{|\\Omega|}'}</M>. Für „Gewinn“ zählen der Hauptgewinn und die Trostpreise
                      zusammen.
                    </>,
                    <>
                      <M>{'P(\\text{Gewinn}) = \\frac{1 + 3}{12}'}</M>. Die Niete ist das Gegenereignis: <M>{'P(\\text{Niete}) = 1 - P(\\text{Gewinn})'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Deine Empfehlung">
            <McCard
              onSolved={fertig.teil('empfehlung')}
              title="Der Werbespruch der SMV"
              punkte={4}
              prompt={<p>Auf dem Plakat steht „Bei uns gewinnt jeder Vierte!“. Was empfiehlst du der SMV?</p>}
              options={[
                {
                  text: 'Der Spruch stimmt: Es gibt 4 Gewinnfelder, also gewinnt jeder Vierte.',
                  feedback: 'Vier Gewinnfelder sind nicht „jeder Vierte“. Die vier Felder muss man ins Verhältnis zu allen 12 Feldern setzen.',
                },
                {
                  text: 'Der Spruch ist zu bescheiden: Es gewinnt jeder Dritte, denn 4 von 12 Feldern gewinnen.',
                  correct: true,
                  feedback: 'Richtig: 4 von 12 ist ein Drittel. Besser wirbt die SMV mit „Bei uns gewinnt jeder Dritte!“.',
                },
                {
                  text: 'Der Spruch stimmt nicht: Es gewinnt nur jeder Zwölfte.',
                  feedback: 'Jeder Zwölfte gewinnt den Hauptgewinn. Mit den drei Trostpreisen gewinnen aber 4 von 12 Feldern.',
                },
                {
                  text: 'Der Spruch kann gar nicht geprüft werden, weil das Rad Zufall ist.',
                  feedback: 'Zufall heißt nicht, dass man nichts sagen kann. Bei gleich großen Feldern lässt sich die Wahrscheinlichkeit berechnen.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Aushang „Unser faires Glücksrad“">
            <AushangBild />
            <p className="sl-text">
              Gestalte in deinem Heft einen Aushang für den Stand der SMV. Zeichne das Rad mit seinen 12 Feldern, schreibe die
              Wahrscheinlichkeiten als Bruch und in Prozent auf und verbessere den Werbespruch.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Unser Rad hat … gleich große Felder, deshalb ist jedes Ergebnis gleich wahrscheinlich.“</li>
                <li>„Die Wahrscheinlichkeit für den Hauptgewinn ist …“</li>
                <li>„Gewonnen hat, wer … oder … dreht. Das sind … von … Feldern.“</li>
                <li>„Das Gegenereignis von „Gewinn“ ist „Niete“, denn …“</li>
                <li>
                  „Abkürzungen: <M>{'\\Omega'}</M> = …, <M>E</M> = …, <M>{'P(E)'}</M> = …, <M>{'\\overline{E}'}</M> = …“
                </li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Aushang vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                'Das Rad ist mit 12 gleich großen Feldern gezeichnet und die Felder sind beschriftet',
                'P(Hauptgewinn), P(Trostpreis), P(Gewinn) und P(Niete) stehen als Bruch und in Prozent da',
                'Der Werbespruch ist mit einer Rechnung richtiggestellt („Jeder Dritte gewinnt“)',
                <>
                  Unter deinem Aushang steht, was <M>{'\\Omega'}</M> (Ergebnismenge, alle möglichen Ergebnisse), <M>E</M> (Ereignis),{' '}
                  <M>{'P(E)'}</M> (Wahrscheinlichkeit von E) und <M>{'\\overline{E}'}</M> (Gegenereignis) bedeuten. Außerdem erklärst du den
                  Begriff Laplace-Experiment und alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug fest={fest} labor={labor} />
              <Merke title="Laplace-Wahrscheinlichkeit und Gegenereignis">
                <p>Sind alle Ergebnisse eines Zufallsexperiments gleich wahrscheinlich (Laplace-Experiment), gilt:</p>
                <MB>{'P(E) = \\frac{\\text{Anzahl der günstigen Ergebnisse}}{\\text{Anzahl aller möglichen Ergebnisse}} = \\frac{|E|}{|\\Omega|}'}</MB>
                <p>Das Gegenereignis tritt ein, wenn E nicht eintritt:</p>
                <MB>{'P(\\overline{E}) = 1 - P(E)'}</MB>
                <ul>
                  <li>
                    <M>{'\\Omega'}</M> ist die Ergebnismenge mit allen möglichen Ergebnissen, <M>E</M> ein Ereignis (eine Auswahl davon).
                  </li>
                  <li>
                    Die Wahrscheinlichkeit liegt immer zwischen <M>0</M> und <M>1</M> (0 % und 100 %).
                  </li>
                  <li>Relative Häufigkeiten schwanken bei wenigen Versuchen stark. Die berechnete Wahrscheinlichkeit gibt an, wo sie sich bei sehr vielen Versuchen einpendeln.</li>
                </ul>
              </Merke>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die letzte ist für Profis. Hast du Übung 1 bis 3 gelöst, wird unten ein Spiel
            freigeschaltet.
          </p>
          <Abschnitt titel="Übung 1: Der Würfel">
            <McCard
              onSolved={uebung('1', fertig.teil)}
              title="Übung 1"
              level="basis"
              punkte={4}
              prompt={
                <p>
                  Ein Würfel wird einmal geworfen. Wie wahrscheinlich ist das Ereignis „Die Augenzahl ist größer als 4“?
                </p>
              }
              options={[
                { text: <M>{'\\frac{1}{6}'}</M>, feedback: 'Das ist die Wahrscheinlichkeit für eine einzige Augenzahl. Größer als 4 sind aber zwei Zahlen: 5 und 6.' },
                { text: <M>{'\\frac{1}{3}'}</M>, correct: true, feedback: <M>{'P(E) = \\frac{|E|}{|\\Omega|} = \\frac{2}{6} = \\frac{1}{3}'}</M> },
                { text: <M>{'\\frac{2}{4}'}</M>, feedback: 'Hier wurden die günstigen mit den ungünstigen Ergebnissen verglichen. Im Nenner stehen alle 6 möglichen Ergebnisse.' },
                { text: <M>{'\\frac{2}{3}'}</M>, feedback: 'Das ist die Wahrscheinlichkeit des Gegenereignisses „höchstens 4“.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <McCard
              onSolved={uebung('2', fertig.teil)}
              title="Übung 2"
              level="standard"
              punkte={6}
              prompt={
                <p>
                  Ein Rad hat 8 gleich große Felder, davon sind 3 rot und 5 blau. Jonas sagt: „Die Wahrscheinlichkeit für Rot ist{' '}
                  <M>{'\\frac{3}{5}'}</M>.“ Mia sagt: „Sie ist <M>{'\\frac{3}{8}'}</M>.“ Wer hat recht?
                </p>
              }
              options={[
                { text: 'Jonas, denn 3 rote Felder stehen 5 blauen Feldern gegenüber.', feedback: 'So vergleicht man günstige mit ungünstigen Feldern. Die Laplace-Formel teilt durch alle Felder.' },
                { text: 'Mia, denn 3 von 8 Feldern sind rot: P = 3/8 = 37,5 %.', correct: true, feedback: <M>{'P(\\text{rot}) = \\frac{3}{8} = 0{,}375 = 37{,}5\\,\\%'}</M> },
                { text: 'Beide, denn der Bruch lässt sich so oder so schreiben.', feedback: '3/5 und 3/8 sind verschiedene Zahlen: 60 % gegen 37,5 %.' },
                { text: 'Keiner, die Wahrscheinlichkeit für Rot ist 1/2, weil es nur zwei Farben gibt.', feedback: 'Die Farben sind nicht gleich häufig. 1/2 gilt nur, wenn beide Farben gleich viele Felder haben.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Ein faires Rad bauen">
            <CheckCard
              onSolved={uebung('3', fertig.teil)}
              title="Übung 3"
              level="erweiterung"
              punkte={8}
              prompt={
                <p>
                  Die SMV baut ein neues Rad mit <strong>20 gleich großen Feldern</strong>. Die Wahrscheinlichkeit für einen Gewinn soll
                  genau <strong>30 %</strong> betragen. Wie viele Felder sind Gewinnfelder und wie viele sind Nieten?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'g', label: 'Gewinnfelder:', expected: 6 },
                { kind: 'num', key: 'n', label: 'Nieten:', expected: 14 },
              ]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'P(\\text{Gewinn}) = \\frac{g}{20} = 0{,}3 \\quad \\mid \\cdot 20 \\qquad g = 6'}</MB>
                  <p>Die übrigen Felder sind Nieten: 20 − 6 = 14.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Diesmal ist die Wahrscheinlichkeit bekannt und die Anzahl der günstigen Felder gesucht.</>,
                    <>
                      Setze in die Laplace-Formel ein: <M>{'\\frac{g}{20} = 0{,}3'}</M>.
                    </>,
                    <>
                      Multipliziere mit 20. Die Nieten sind alle übrigen Felder.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Das Rad für den Hauptpreis">
            <CheckCard
              title="Wie sieht das Rad aus?"
              level="erweiterung"
              profi
              punkte={9}
              prompt={
                <p>
                  Ein Rad hat 20 gleich große Felder. Die Wahrscheinlichkeit für den Hauptgewinn soll <M>{'5\\,\\%'}</M> betragen, die für
                  eine Niete <M>{'65\\,\\%'}</M>. Alle übrigen Felder sind Trostpreise. Wie viele Felder gehören zu welchem Ergebnis?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'h', label: 'Hauptgewinn:', expected: 1 },
                { kind: 'num', key: 'n', label: 'Nieten:', expected: 13 },
                { kind: 'num', key: 't', label: 'Trostpreise:', expected: 6 },
              ]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'\\text{Hauptgewinn: } 0{,}05 \\cdot 20 = 1 \\qquad \\text{Niete: } 0{,}65 \\cdot 20 = 13'}</MB>
                  <p>Trostpreise: 20 − 1 − 13 = 6 Felder, das sind 30 %.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Rechne die Prozentangaben in Felder um: Wie viele von 20 Feldern sind 5 %?</>,
                    <>
                      Anzahl der Felder = Wahrscheinlichkeit mal 20, also <M>{'0{,}05 \\cdot 20'}</M> und <M>{'0{,}65 \\cdot 20'}</M>.
                    </>,
                    <>Die Trostpreise sind die Felder, die übrig bleiben.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 3} titel="Rad-Casino">
            <GluecksradSpiel />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt die Wahrscheinlichkeit bei einem Zufallsexperiment mit gleich wahrscheinlichen Ergebnissen berechnen und das
              Gegenereignis nutzen. Bei den Übungsaufgaben arbeitest du mit Würfel, Glücksrad und Urne weiter.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={() => navigate('/daten-und-zufall/zufallsexperimente')}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={() => navigate('/daten-und-zufall/zufallsexperimente/ueben')}>
                Weiter üben: Zufallsexperimente <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell
      title="Zufallsexperimente: Das Glücksrad"
      width="wide"
      kompakt
      parent={{ to: '/daten-und-zufall/zufallsexperimente', label: 'Zufallsexperimente' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={
          <>
            In dieser Lernsituation prüfst du das Glücksrad der SMV am Schulfest. Du lernst, wie du die Wahrscheinlichkeit eines Ereignisses
            berechnest, statt nur auszuprobieren.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Festlegung und die Drehungen aus „Problem erkennen“ */
function Rueckbezug({ fest, labor }: { fest: Festlegung<Wahl>; labor: Zaehlung }) {
  if (!fest.fest || !fest.wahl) return null
  const h = labor.n ? labor.gewinne / labor.n : 0
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {WAHL[fest.wahl]} Bei 100 Drehungen hast du etwa {fest.wert} Gewinne erwartet.{' '}
        {fest.wahl === 'mehr' ? 'Das stimmt: ' : 'Tatsächlich gewinnt aber mehr als jeder Vierte: '}
        Berechnet sind es <M>{'\\frac{4}{12} = \\frac{1}{3}'}</M>, also etwa 33 Gewinne bei 100 Drehungen. Bei deinen {labor.n} Drehungen
        waren {labor.gewinne} Gewinne, das sind {prozent(h)}. Die Drehungen kommen der berechneten Wahrscheinlichkeit
        {Math.abs(h - 1 / 3) <= 0.05 ? ' diesmal ziemlich nah.' : ' diesmal nicht besonders nah.'} Nach wenigen Drehungen schwanken die
        Anteile stark, erst die Rechnung liefert die sichere Antwort.
      </p>
    </div>
  )
}
