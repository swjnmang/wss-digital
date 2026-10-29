import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskShell from '../../../../components/layout/TaskShell';
import { Beispiel, M, MB, Merke } from '../../lernpfad/kit';
import { CheckCard, Hilfen, McCard, TrackedCheck, TrackedMc } from '../../../lineare_funktionen/lernsituation_kit/kit';
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Handlungsprodukt,
  SeitenLernsituation,
  type Seite,
  type Thema,
} from '../../../lineare_funktionen/lernsituation_kit/seiten';
import { Bilanz } from '../../../lineare_funktionen/lernsituation_kit/punkte';
import { Kriterien, Vermutung, Zitat, type Festlegung } from '../../../finanzmathe/zins_kit/zins_kit';
import '../../lernpfad/lernpfad.css';
import { metaFor } from '../meta';
import { ANORDNUNG, BaumBild, PlakatBild, Titelbild, Tuete, TuetenBaum, Ziehen } from './Tueten';
import PfadeJagd from './PfadeJagd';
import './wundertuete.css';

// Lernsituation 5.7 „Die Wundertüte“: Mehrstufige Zufallsexperimente (Baumdiagramm ohne Zurücklegen, Pfadregeln) (ca. 60 bis 90 min).
// Format Rollenspiel / Beratungsauftrag mit Aha: Beim Schulfest ziehen Kundinnen zwei Lose aus der Wundertüte (10 Lose: 2 Hauptgewinne H,
// 3 Trostpreise T, 5 Nieten N, ohne Zurücklegen). Jonas rechnet „20 % von 20 % = 4 %“ für zwei Hauptgewinne. Aha: Nach einem Hauptgewinn
// bleibt nur noch 1 von 9 Losen (1/9 statt 2/10), richtig ist P(HH) = 2/90 = 1/45 ≈ 2,2 %.
// Lernprodukt analog: Plakat „So gewinnst du bei der Wundertüte“ (Baumdiagramm, Rechnung mit Produkt- und Summenregel, Begriffe) im Heft.
// Identität: Blau, fa-gift, Titelbild Losstand beim Schulfest, Leitobjekt die Wundertüte. Die Festlegung bleibt nur im Seitenzustand.
//
// Punkte (nur Pflichtaufgaben, ohne Bonus-Spiel und Profi): Warm-up 13 (a 2, b 2, c 3, d 3, e 3) = 20 %
// Problem erkennen 10 (Festlegung 3, Ausprobieren 3, Das 2. Los 4) = 15 %
// Problem lösen 24 (Ergebnisse 15, Entscheidung 4, Kriterien 5) = 37 %
// Wissen prüfen 18 (Übung 1 mit 4, Übung 2 mit 6, Übung 3 mit 8) = 28 %. Profi 9, Bonus-Spiel höchstens 8 (4 Runden à 2). Zusammen 65.

/** Lernvideo zu mehrstufigen Zufallsexperimenten */
export const VIDEO_BAUM = 'https://www.youtube.com/watch?v=PcKEXYJ4C-U';

/* ── Situation ───────────────────────────────────────────────────────────── */

// 10 Lose: 2 H, 3 T, 5 N, zwei Züge ohne Zurücklegen.
const P_HH = 2 / 90;
const P_EIN_H = 32 / 90;
const P_MIND = 70 / 90;
const TOL = 0.0006;

type Wahl = 'jonas' | 'mehr' | 'weniger';
const WAHL: Record<Wahl, string> = {
  jonas: 'Jonas hat recht: Es sind etwa 4 %.',
  mehr: 'Es ist mehr als 4 %.',
  weniger: 'Es ist weniger als 4 %.',
};

const THEMA: Thema = { ...metaFor('baumdiagramme').thema, bild: <Titelbild /> };

/** Pfadwahrscheinlichkeiten der Wundertüte als Nennerliste (Neunzigstel) */
const LOESUNG = (
  <>
    <TuetenBaum werte hi={['HH']} label="Baumdiagramm der Wundertüte mit allen neun Pfaden und ihren Wahrscheinlichkeiten in Neunzigsteln. Der Pfad HH ist hervorgehoben." />
    <MB>{'P(HH) = \\frac{2}{10} \\cdot \\frac{1}{9} = \\frac{2}{90} = \\frac{1}{45} \\approx 2{,}2\\,\\%'}</MB>
    <MB>{'P(\\text{genau ein H}) = P(HT) + P(HN) + P(TH) + P(NH) = \\frac{6 + 10 + 6 + 10}{90} = \\frac{32}{90} = \\frac{16}{45} \\approx 35{,}6\\,\\%'}</MB>
    <MB>{'P(\\text{mindestens ein Gewinn}) = 1 - P(NN) = 1 - \\frac{5}{10} \\cdot \\frac{4}{9} = 1 - \\frac{20}{90} = \\frac{70}{90} = \\frac{7}{9} \\approx 77{,}8\\,\\%'}</MB>
  </>
);

/* ── Rechenbeispiel: Tombola des Nachbarvereins ─────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Die Tombola des Nachbarvereins hat 8 Lose: <strong>2 Gewinne (G)</strong> und <strong>6 Nieten (N)</strong>. Wer zwei Lose nacheinander{' '}
    <strong>ohne Zurücklegen</strong> zieht, mit welcher Wahrscheinlichkeit bekommt er <strong>zwei Gewinne</strong>, mit welcher <strong>genau
    einen Gewinn</strong>?
  </p>
);
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Baumdiagramm zeichnen',
    body: (
      <>
        <BaumBild
          erste={[
            { label: 'G', p: '2/8' },
            { label: 'N', p: '6/8' },
          ]}
          zweite={[
            [
              { label: 'G', p: '1/7' },
              { label: 'N', p: '6/7' },
            ],
            [
              { label: 'G', p: '2/7' },
              { label: 'N', p: '5/7' },
            ],
          ]}
          ende={(i, j) => ['2/8·1/7', '2/8·6/7', '6/8·2/7', '6/8·5/7'][i * 2 + j]}
          label="Baumdiagramm der Tombola mit zwei Zügen ohne Zurücklegen. Erster Zug: G mit 2 Achteln, N mit 6 Achteln. Zweiter Zug nach G: 1 Siebtel G und 6 Siebtel N, nach N: 2 Siebtel G und 5 Siebtel N."
        />
        <p>
          Im 1. Zug sind 8 Lose in der Tüte. Wurde ein Gewinn gezogen, sind danach nur noch <strong>7 Lose</strong> und <strong>1 Gewinn</strong> übrig, wurde
          eine Niete gezogen, sind es 7 Lose und 2 Gewinne. Die Äste einer Verzweigung ergeben zusammen immer 1.
        </p>
      </>
    ),
  },
  {
    title: 'Produktregel: entlang des Pfades malnehmen',
    body: (
      <>
        <p>Die Wahrscheinlichkeit eines Pfades ist das Produkt der Wahrscheinlichkeiten an seinen Ästen:</p>
        <MB>{'P(GG) = \\frac{2}{8} \\cdot \\frac{1}{7} = \\frac{2}{56} = \\frac{1}{28} \\approx 3{,}6\\,\\%'}</MB>
      </>
    ),
  },
  {
    title: 'Summenregel: gehören mehrere Pfade zum Ereignis, addieren',
    body: (
      <>
        <p>„Genau ein Gewinn“ erreichst du auf zwei Pfaden: erst G, dann N, oder erst N, dann G.</p>
        <MB>{'P(GN) = \\frac{2}{8} \\cdot \\frac{6}{7} = \\frac{12}{56} \\qquad P(NG) = \\frac{6}{8} \\cdot \\frac{2}{7} = \\frac{12}{56}'}</MB>
        <MB>{'P(\\text{genau ein Gewinn}) = \\frac{12}{56} + \\frac{12}{56} = \\frac{24}{56} = \\frac{3}{7} \\approx 42{,}9\\,\\%'}</MB>
      </>
    ),
  },
  {
    title: 'Kontrolle',
    body: (
      <>
        <p>Alle Pfade zusammen müssen 1 ergeben:</p>
        <MB>{'\\frac{2 + 12 + 12 + 30}{56} = \\frac{56}{56} = 1 \\ \\checkmark'}</MB>
        <p>
          Zum Vergleich <strong>mit Zurücklegen</strong>: Dann bleiben die Brüche im 2. Zug gleich, <M>{'P(GG) = \\frac{2}{8} \\cdot \\frac{2}{8} = \\frac{1}{16}'}</M>.
        </p>
      </>
    ),
  },
];

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function WundertueteEinstieg() {
  const navigate = useNavigate();
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 4, fest: false });
  const [zugGeloest, setZugGeloest] = useState(false);
  const [geloest, setGeloest] = useState(false);
  const [uebungen, setUebungen] = useState<string[]>([]);

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Wahrscheinlichkeiten darfst du als Bruch, Dezimalzahl oder mit %-Zeichen eintragen.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            title="a) Laplace-Wahrscheinlichkeit"
            punkte={2}
            rechnen={false}
            prompt={<p>In einer Tüte liegen 10 Lose, davon 2 Hauptgewinne. Du ziehst ein Los. Wie wahrscheinlich ist ein Hauptgewinn?</p>}
            fields={[{ kind: 'num', key: 'p', label: <M>{'P(H) ='}</M>, expected: 0.2, tol: TOL }]}
            solution={<MB>{'P(H) = \\frac{\\text{günstige Ergebnisse}}{\\text{alle Ergebnisse}} = \\frac{2}{10} = 0{,}2 = 20\\,\\%'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            title="b) Gegenereignis"
            punkte={2}
            rechnen={false}
            prompt={<p>Die Wahrscheinlichkeit für einen Hauptgewinn ist 20 %. Wie wahrscheinlich ist es, <strong>keinen</strong> Hauptgewinn zu ziehen?</p>}
            fields={[{ kind: 'num', key: 'g', label: <M>{'P(\\overline{H}) ='}</M>, expected: 0.8, tol: TOL }]}
            solution={<MB>{'P(\\overline{H}) = 1 - P(H) = 1 - 0{,}2 = 0{,}8 = 80\\,\\%'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            title="c) Brüche multiplizieren"
            punkte={3}
            prompt={<p>Berechne und gib das Ergebnis als Bruch, Dezimalzahl oder in Prozent an.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'c1', label: <M>{'\\frac{3}{5} \\cdot \\frac{2}{3} ='}</M>, expected: 0.4, tol: TOL },
              { kind: 'num', key: 'c2', label: <M>{'\\frac{1}{4} \\cdot \\frac{2}{9} ='}</M>, expected: 1 / 18, tol: TOL },
            ]}
            solution={<MB>{'\\frac{3}{5} \\cdot \\frac{2}{3} = \\frac{6}{15} = \\frac{2}{5} = 0{,}4 \\qquad \\frac{1}{4} \\cdot \\frac{2}{9} = \\frac{2}{36} = \\frac{1}{18} \\approx 0{,}0556'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Brüche multiplizierst du, indem du Zähler mit Zähler und Nenner mit Nenner malnimmst.</>,
                  <>
                    Danach kannst du kürzen oder den Bruch mit dem Taschenrechner teilen: <M>{'\\frac{6}{15}'}</M>.
                  </>,
                  <>
                    <M>{'\\frac{6}{15} = \\frac{2}{5} = 0{,}4'}</M>
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            title="d) Brüche addieren"
            punkte={3}
            prompt={<p>Berechne. Für das Ergebnis darfst du einen Bruch oder eine Dezimalzahl eintragen.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'd1', label: <M>{'\\frac{1}{6} + \\frac{1}{3} ='}</M>, expected: 0.5, tol: TOL },
              { kind: 'num', key: 'd2', label: <M>{'\\frac{2}{15} + \\frac{1}{5} ='}</M>, expected: 1 / 3, tol: TOL },
            ]}
            solution={<MB>{'\\frac{1}{6} + \\frac{1}{3} = \\frac{1}{6} + \\frac{2}{6} = \\frac{3}{6} = \\frac{1}{2} \\qquad \\frac{2}{15} + \\frac{1}{5} = \\frac{2}{15} + \\frac{3}{15} = \\frac{5}{15} = \\frac{1}{3}'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Beim Addieren müssen die Nenner gleich sein. Bringe die Brüche auf den gemeinsamen Nenner.</>,
                  <>
                    Der gemeinsame Nenner von <M>{'\\frac{1}{6}'}</M> und <M>{'\\frac{1}{3}'}</M> ist 6.
                  </>,
                  <>
                    <M>{'\\frac{1}{3} = \\frac{2}{6}'}</M>, also <M>{'\\frac{1}{6} + \\frac{2}{6} = \\frac{3}{6}'}</M>.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            title="e) Eins minus Bruch"
            punkte={3}
            prompt={<p>Berechne. Das ist die Rechnung für ein Gegenereignis.</p>}
            fields={[{ kind: 'num', key: 'e', label: <M>{'1 - \\frac{20}{90} ='}</M>, expected: 7 / 9, tol: TOL }]}
            solution={<MB>{'1 - \\frac{20}{90} = \\frac{90}{90} - \\frac{20}{90} = \\frac{70}{90} = \\frac{7}{9} \\approx 0{,}7778'}</MB>}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Die Wundertüte beim Schulfest',
      pflicht: ['fest', 'sim', 'zug'],
      bedingung: 'Lege dich fest, ziehe mindestens 30 Doppelzüge und beantworte die Frage zum 2. Los, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Beim Schulfest betreust du mit deiner Klasse den Losstand. In der <strong>Wundertüte</strong> liegen 10 Lose: <strong>2 Hauptgewinne (H)</strong>,{' '}
            <strong>3 Trostpreise (T)</strong> und <strong>5 Nieten (N)</strong>. Wer mitspielt, zieht zwei Lose hintereinander. Das gezogene Los bleibt draußen,
            es wird also <strong>nicht zurückgelegt</strong>.
          </p>
          <p className="sl-text">
            Gesucht ist die Wahrscheinlichkeit für das Ereignis „<strong>zwei Hauptgewinne</strong>“. Wer das gewinnt, bekommt den großen Preis, deshalb will die
            Klasse wissen, wie oft das vorkommt.
          </p>
          <Zitat wer="Jonas aus deiner Klasse">
            <p>
              „Ein Hauptgewinn: 2 von 10, das sind 20 %. Zwei Hauptgewinne: 20 % von 20 %, also nur <M>{'0{,}2 \\cdot 0{,}2 = 0{,}04'}</M>, das sind 4 %.“
            </p>
          </Zitat>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst festlegen, dann ausprobieren</p>
            <p>
              Stimmt Jonas’ Rechnung? Lege dich fest, ohne zu rechnen. Ziehe danach selbst Lose aus der Wundertüte und finde heraus, was beim 2. Los passiert.
            </p>
          </div>
          <Tuete />
          <Vermutung
            optionen={WAHL}
            regler={{
              min: 0,
              max: 10,
              step: 0.5,
              text: (v) => (
                <>
                  Ich schätze: Zwei Hauptgewinne kommen mit etwa <span className="ls-slider-value">{v.toLocaleString('de-DE')} %</span> vor.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig.teil('fest')}
            gespeichert={(w) => (
              <>
                Deine Vermutung: <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong> Deine Schätzung: <strong>{w.wert.toLocaleString('de-DE')} %</strong>.
              </>
            )}
          />
          {fest.fest && (
            <>
              <Abschnitt titel="Probiere es aus: Zwei Lose ziehen">
                <p className="sl-text">
                  Ziehe jedes Mal zwei Lose ohne Zurücklegen. Der Zähler zeigt dir, wie oft zwei Hauptgewinne vorkommen.
                </p>
                <Ziehen onFertig={fertig.teil('sim')} />
              </Abschnitt>
              <Abschnitt titel="Das 2. Los">
                <p className="sl-text">
                  Beim ersten Zug hast du einen <strong>Hauptgewinn</strong> gezogen. Das Los bleibt draußen.
                </p>
                <Tuete lose={ANORDNUNG.map((l, i) => (i === 1 ? null : l))} gezogen={['H']} label="Die Wundertüte nach dem ersten Zug: Ein Hauptgewinn wurde gezogen und liegt neben der Tüte, in der Tüte fehlt ein Platz." />
                <CheckCard
                  onSolved={() => {
                    fertig.teil('zug')();
                    setZugGeloest(true);
                  }}
                  title="Wie sieht die Tüte jetzt aus?"
                  punkte={4}
                  rechnen={false}
                  prompt={<p>Zähle nach: Wie viele Lose sind jetzt in der Tüte, wie viele davon sind Hauptgewinne, und wie wahrscheinlich ist im 2. Zug wieder ein Hauptgewinn?</p>}
                  fields={[
                    { kind: 'num', key: 'lose', label: 'Lose in der Tüte:', expected: 9 },
                    { kind: 'num', key: 'h', label: 'davon Hauptgewinne:', expected: 1 },
                    { kind: 'num', key: 'p', label: 'Wahrscheinlichkeit für H im 2. Zug:', expected: 1 / 9, tol: TOL },
                  ]}
                  solution={
                    <>
                      <p>Es fehlt ein Los und ein Hauptgewinn: 9 Lose, davon 1 Hauptgewinn.</p>
                      <MB>{'P(H \\text{ im 2. Zug}) = \\frac{1}{9} \\approx 11{,}1\\,\\%'}</MB>
                    </>
                  }
                  help={
                    <Hilfen
                      steps={[
                        <>Das gezogene Los liegt nicht mehr in der Tüte. Wie viele Lose und wie viele Hauptgewinne sind übrig?</>,
                        <>Von den 10 Losen ist eins weg, von den 2 Hauptgewinnen ist einer weg.</>,
                        <>
                          Es bleibt 1 Hauptgewinn bei 9 Losen: <M>{'\\frac{1}{9}'}</M>.
                        </>,
                      ]}
                    />
                  }
                />
                {zugGeloest && (
                  <div className="wt-erkenntnis ls-back">
                  <p>
                    <strong>Das ist der Knackpunkt:</strong> Im 2. Zug ist die Chance auf einen Hauptgewinn nicht mehr <M>{'\\frac{2}{10} = 20\\,\\%'}</M>, sondern nur noch{' '}
                    <M>{'\\frac{1}{9} \\approx 11{,}1\\,\\%'}</M>. Jonas hat mit 20 % für beide Züge gerechnet. Das stimmt nur, wenn das 1. Los zurückgelegt würde.
                    Bei zwei Zügen hängt der 2. Zug vom 1. ab. Wie du das sauber berechnest, lernst du jetzt mit dem Baumdiagramm.
                  </p></div>
                )}
              </Abschnitt>
            </>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Chancen der Wundertüte',
      pflicht: ['rechnung', 'empfehlung', 'produkt'],
      inhalt: (fertig) => {
        const geloestMelden = () => {
          fertig.teil('rechnung')();
          setGeloest(true);
        };
        return (
          <>
            <div className="sl-fokus">
              <p className="sl-fokus-titel">Deine Aufgabe: Berechne die Chancen mit einem Baumdiagramm</p>
              <p>
                In der Wundertüte liegen 10 Lose: 2 Hauptgewinne (H), 3 Trostpreise (T) und 5 Nieten (N). Zwei Lose werden ohne Zurücklegen gezogen. Zeichne in
                deinem Heft das Baumdiagramm und berechne die Wahrscheinlichkeiten für diese drei Ereignisse: <strong>zwei Hauptgewinne</strong>,{' '}
                <strong>genau ein Hauptgewinn</strong> und <strong>mindestens ein Gewinn</strong> (Hauptgewinn oder Trostpreis).
              </p>
            </div>
            <TuetenBaum fragen />
            <BeispielMitVideo video={VIDEO_BAUM} videoTitel="Lernvideo: mehrstufige Zufallsexperimente">
              <Beispiel offen title="Die Tombola des Nachbarvereins" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
            </BeispielMitVideo>
            <Abschnitt titel="Vergleiche deine Ergebnisse">
              <CheckCard
                onSolved={geloestMelden}
                title="Chancen beim Doppelzug"
                punkte={15}
                prompt={<p>Trage die Ergebnisse aus deinem Heft ein (Bruch, Dezimalzahl oder Prozent). Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
                fields={[
                  { kind: 'num', key: 'hh', label: 'Wie wahrscheinlich ist es, dass beide gezogenen Lose Hauptgewinne sind?', expected: P_HH, tol: TOL },
                  { kind: 'num', key: 'ein', label: 'Wie wahrscheinlich ist es, dass genau eines der beiden Lose ein Hauptgewinn ist?', expected: P_EIN_H, tol: TOL },
                  { kind: 'num', key: 'mind', label: 'Wie wahrscheinlich ist es, dass mindestens ein Los ein Gewinn (Hauptgewinn oder Trostpreis) ist?', expected: P_MIND, tol: TOL },
                ]}
                loesungNachFehler
                solution={LOESUNG}
                help={
                  <Hilfen
                    steps={[
                      <>
                        Rechne wie im Beispiel der Tombola: erst das Baumdiagramm mit den Wahrscheinlichkeiten an den Ästen, dann entlang der Pfade malnehmen. Denke daran, dass im
                        2. Zug nur noch 9 Lose in der Tüte sind.
                      </>,
                      <>
                        Für „genau ein Hauptgewinn“ gehören vier Pfade dazu (HT, HN, TH, NH), die du addierst. Für „mindestens ein Gewinn“ ist das Gegenereignis „zwei Nieten“ am kürzesten.
                      </>,
                      <>
                        <M>{'P(HH) = \\frac{2}{10} \\cdot \\frac{1}{9}'}</M>, <M>{'P(NN) = \\frac{5}{10} \\cdot \\frac{4}{9}'}</M> und <M>{'P(\\text{mindestens ein Gewinn}) = 1 - P(NN)'}</M>.
                      </>,
                    ]}
                  />
                }
              />
            </Abschnitt>
            <Abschnitt titel="Deine Entscheidung">
              <McCard
                onSolved={fertig.teil('empfehlung')}
                title="Stimmt die Werbung?"
                punkte={4}
                rechnen
                prompt={
                  <p>
                    Die Klasse wirbt am Stand: „Mit zwei Losen hast du in fast 8 von 10 Fällen mindestens einen Gewinn!“ Stimmt das nach deiner Rechnung?
                  </p>
                }
                options={[
                  {
                    text: 'Nein. Jedes Los gewinnt nur mit 50 %, das gilt auch für zwei Lose.',
                    feedback: 'Die 50 % gelten für ein einzelnes Los. Mit zwei Losen hast du zwei Chancen, mindestens einmal zu gewinnen.',
                  },
                  {
                    text: 'Ja, denn 50 % + 50 % sind 100 %, mit zwei Losen gewinnt man immer.',
                    feedback: 'Die Wahrscheinlichkeiten darfst du nur addieren, wenn sich die Ereignisse ausschließen. Beide Lose können gleichzeitig Gewinne sein, und das 2. Los hängt vom 1. ab.',
                  },
                  {
                    text: 'Ja, fast: Es sind 70/90 = 7/9, also etwa 77,8 %. Das Gegenereignis „zwei Nieten“ hat nur 20/90.',
                    correct: true,
                    feedback: <M>{'P = 1 - \\frac{5}{10} \\cdot \\frac{4}{9} = 1 - \\frac{20}{90} = \\frac{7}{9} \\approx 77{,}8\\,\\%'}</M>,
                  },
                  {
                    text: 'Nein, es sind nur 55,6 %.',
                    feedback: '5/9 ≈ 55,6 % ist die Chance auf einen Gewinn im 2. Zug, wenn das 1. Los eine Niete war. Für das ganze Experiment brauchst du alle Pfade.',
                  },
                ]}
              />
            </Abschnitt>
            <Handlungsprodukt titel="Plakat „So gewinnst du bei der Wundertüte“">
              <PlakatBild />
              <p className="sl-text">
                Gestalte in deinem Heft ein Plakat für den Losstand. Zeichne das Baumdiagramm der Wundertüte mit allen Pfaden, schreibe deine Rechnung für die drei Ereignisse
                auf und erkläre, warum Jonas’ 4 % nicht stimmen.
              </p>
              <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
                <ul className="zk-liste">
                  <li>„Beim 1. Zug sind … Lose in der Tüte, beim 2. Zug nur noch …“</li>
                  <li>„Die Wahrscheinlichkeit eines Pfades berechne ich, indem ich …“</li>
                  <li>„Gehören mehrere Pfade zu einem Ereignis, dann …“</li>
                  <li>„Jonas hat 4 % gerechnet. Das stimmt nicht, weil …“</li>
                  <li>
                    „<M>{'P(E)'}</M> bedeutet …, ein Pfad ist …, ohne Zurücklegen heißt …“
                  </li>
                </ul>
              </Aufklappbar>
            </Handlungsprodukt>
            <Abschnitt titel="Ist dein Plakat vollständig?">
              <Kriterien
                onAlle={fertig.teil('produkt')}
                items={[
                  'Ein Baumdiagramm mit zwei Zügen, allen neun Pfaden und den Wahrscheinlichkeiten an jedem Ast (im 2. Zug mit 9 Losen im Nenner)',
                  'Die Rechnung für die drei Ereignisse mit Produktregel (Pfad malnehmen) und Summenregel bzw. Gegenereignis (Pfade addieren), dazu die Kontrolle: Alle Pfade ergeben zusammen 1',
                  'Eine Erklärung, warum Jonas mit 4 % falsch liegt und warum sich die Wahrscheinlichkeit im 2. Zug ändert',
                  <>
                    Auf dem Plakat steht, was die Begriffe und Abkürzungen bedeuten: <M>{'P(E)'}</M> (Wahrscheinlichkeit des Ereignisses <M>E</M>), <M>{'\\overline{E}'}</M> (Gegenereignis), Pfad, Pfadregeln (Produktregel und Summenregel),
                    mit Zurücklegen und ohne Zurücklegen sowie alle anderen Wörter, die für dich neu waren.
                  </>,
                ]}
              />
            </Abschnitt>
            {geloest && (
              <Abschnitt titel="Das hältst du fest">
                <Rueckbezug fest={fest} />
                <Merke title="Mehrstufige Zufallsexperimente mit dem Baumdiagramm">
                  <ul>
                    <li>Auf jeder Stufe zeichnest du alle möglichen Ausgänge als Äste. Die Wahrscheinlichkeiten an den Ästen einer Verzweigung ergeben zusammen 1.</li>
                    <li>
                      <strong>Ohne Zurücklegen</strong> ändert sich die Tüte nach jedem Zug, deshalb ändern sich die Wahrscheinlichkeiten im 2. Zug. <strong>Mit Zurücklegen</strong> bleiben sie gleich.
                    </li>
                  </ul>
                  <p><strong>1. Pfadregel (Produktregel):</strong> Die Wahrscheinlichkeit eines Pfades ist das Produkt der Wahrscheinlichkeiten entlang des Pfades.</p>
                  <MB>{'P(HH) = \\frac{2}{10} \\cdot \\frac{1}{9}'}</MB>
                  <p><strong>2. Pfadregel (Summenregel):</strong> Gehören mehrere Pfade zu einem Ereignis, addierst du ihre Wahrscheinlichkeiten.</p>
                  <MB>{'P(\\text{genau ein H}) = P(HT) + P(HN) + P(TH) + P(NH)'}</MB>
                  <p><strong>Gegenereignis:</strong> Bei „mindestens ein …“ ist oft der Weg über das Gegenereignis kürzer.</p>
                  <MB>{'P(\\text{mindestens ein Gewinn}) = 1 - P(NN)'}</MB>
                </Merke>
              </Abschnitt>
            )}
          </>
        );
      },
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      pflicht: ['1', '2', '3'],
      inhalt: (fertig) => {
        const erledigt = (k: string) => () => {
          fertig.teil(k)();
          setUebungen((u) => (u.includes(k) ? u : [...u, k]));
        };
        return (
          <>
            <p className="sl-text">
              Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die letzte ist für Profis. Hast du Übung 1 bis 3 gelöst, wird unten ein Spiel freigeschaltet.
            </p>
            <Abschnitt titel="Übung 1: Zwei rote Kugeln">
              <TrackedMc
                onSolved={erledigt('1')}
                topic="Baumdiagramme-Einstieg: Produktregel ohne Zurücklegen (Basis)"
                title="Übung 1"
                punkte={4}
                rechnen
                level="basis"
                prompt={
                  <p>
                    In einer Urne liegen 4 rote und 6 blaue Kugeln. Du ziehst zwei Kugeln nacheinander <strong>ohne Zurücklegen</strong>. Wie wahrscheinlich sind zwei rote Kugeln?
                  </p>
                }
                options={[
                  {
                    text: '16 %',
                    feedback: <>Das wäre mit Zurücklegen: <M>{'\\frac{4}{10} \\cdot \\frac{4}{10}'}</M>. Ohne Zurücklegen sind im 2. Zug nur noch 9 Kugeln in der Urne.</>,
                  },
                  {
                    text: '40 %',
                    feedback: 'Das ist nur die Wahrscheinlichkeit für eine rote Kugel im 1. Zug. Für beide Züge musst du die Äste des Pfades malnehmen.',
                  },
                  {
                    text: '12/90, also etwa 13,3 %',
                    correct: true,
                    feedback: <M>{'P(RR) = \\frac{4}{10} \\cdot \\frac{3}{9} = \\frac{12}{90} = \\frac{2}{15} \\approx 13{,}3\\,\\%'}</M>,
                  },
                  {
                    text: 'etwa 73,3 %',
                    feedback: <>Hier wurde addiert: <M>{'\\frac{4}{10} + \\frac{3}{9}'}</M>. Entlang eines Pfades wird multipliziert.</>,
                  },
                ]}
              />
            </Abschnitt>
            <Abschnitt titel="Übung 2: Wer hat recht?">
              <TrackedMc
                onSolved={erledigt('2')}
                topic="Baumdiagramme-Einstieg: zwei Nieten, Wer hat recht (Standard)"
                title="Übung 2"
                punkte={6}
                rechnen
                level="standard"
                prompt={
                  <p>
                    Lena und Tom rechnen die Wahrscheinlichkeit für <strong>zwei Nieten</strong> in der Wundertüte (5 Nieten bei 10 Losen, ohne Zurücklegen). Lena: „<M>{'\\frac{5}{10} \\cdot \\frac{5}{10} = 25\\,\\%'}</M>.“
                    Tom: „<M>{'\\frac{5}{10} \\cdot \\frac{4}{9} \\approx 22{,}2\\,\\%'}</M>.“ Wer hat recht?
                  </p>
                }
                options={[
                  {
                    text: 'Lena, weil die Hälfte der Lose Nieten sind und das auch beim 2. Zug gilt.',
                    feedback: 'Nach einer Niete sind nur noch 4 Nieten bei 9 Losen in der Tüte. Die Hälfte gilt nur beim 1. Zug.',
                  },
                  {
                    text: 'Beide haben unrecht, denn es sind nur 50 %.',
                    feedback: 'Die 50 % gelten für ein einzelnes Los. Für zwei Nieten hintereinander musst du die Wahrscheinlichkeiten entlang des Pfades malnehmen.',
                  },
                  {
                    text: 'Tom, weil nach der ersten Niete nur noch 4 Nieten bei 9 Losen übrig sind.',
                    correct: true,
                    feedback: 'Genau: Ohne Zurücklegen ändert sich die Tüte. Lena rechnet so, als würde die Niete zurückgelegt.',
                  },
                  {
                    text: 'Beide haben recht, es kommt nur auf die Rundung an.',
                    feedback: '25 % und 22,2 % sind kein Rundungsunterschied. Lena verwendet im 2. Zug die falsche Wahrscheinlichkeit.',
                  },
                ]}
              />
            </Abschnitt>
            <Abschnitt titel="Übung 3: Rote und gelbe Kugeln">
              <TrackedCheck
                onSolved={erledigt('3')}
                topic="Baumdiagramme-Einstieg: Summenregel und Gegenereignis (Erweiterung)"
                title="Übung 3"
                punkte={8}
                level="erweiterung"
                prompt={
                  <p>
                    In einer Urne liegen 3 rote und 2 gelbe Kugeln. Du ziehst zwei Kugeln nacheinander ohne Zurücklegen. Wie wahrscheinlich ist es, <strong>zwei verschiedene Farben</strong> zu
                    ziehen, und wie wahrscheinlich ist <strong>mindestens eine rote</strong> Kugel? (Bruch, Dezimalzahl oder Prozent)
                  </p>
                }
                fields={[
                  { kind: 'num', key: 'v', label: 'zwei verschiedene Farben:', expected: 0.6, tol: TOL },
                  { kind: 'num', key: 'm', label: 'mindestens eine rote Kugel:', expected: 0.9, tol: TOL },
                ]}
                loesungNachFehler
                solution={
                  <>
                    <MB>{'P(RG) + P(GR) = \\frac{3}{5} \\cdot \\frac{2}{4} + \\frac{2}{5} \\cdot \\frac{3}{4} = \\frac{6}{20} + \\frac{6}{20} = \\frac{12}{20} = 0{,}6'}</MB>
                    <MB>{'P(\\text{mindestens eine rote}) = 1 - P(GG) = 1 - \\frac{2}{5} \\cdot \\frac{1}{4} = 1 - \\frac{2}{20} = 0{,}9'}</MB>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Zeichne zuerst den Baum: Im 1. Zug 3 von 5 rot, im 2. Zug ändert sich die Urne auf 4 Kugeln.</>,
                      <>„Zwei verschiedene Farben“ gehören zu zwei Pfaden (RG und GR), die du addierst. „Mindestens eine rote“ rechnest du über das Gegenereignis „zwei gelbe“.</>,
                      <>
                        <M>{'P(GG) = \\frac{2}{5} \\cdot \\frac{1}{4}'}</M> und <M>{'P(RG) = \\frac{3}{5} \\cdot \\frac{2}{4}'}</M>.
                      </>,
                    ]}
                  />
                }
              />
            </Abschnitt>
            <Abschnitt titel="Übung 4 für Profis: Das Los wird zurückgelegt">
              <CheckCard
                title="Mit Zurücklegen"
                level="erweiterung"
                profi
                punkte={9}
                prompt={
                  <p>
                    Der Losstand ändert die Regel: Das 1. Los wird nach dem Ziehen <strong>zurückgelegt</strong>. Wie wahrscheinlich sind jetzt zwei Hauptgewinne? Und wie oft so wahrscheinlich wie ohne
                    Zurücklegen?
                  </p>
                }
                fields={[
                  { kind: 'num', key: 'p', label: <M>{'P(HH) ='}</M>, expected: 0.04, tol: TOL },
                  { kind: 'num', key: 'f', label: 'Faktor „so oft wahrscheinlich wie vorher“:', expected: 1.8, tol: 0.02 },
                ]}
                loesungNachFehler
                solution={
                  <>
                    <MB>{'P(HH) = \\frac{2}{10} \\cdot \\frac{2}{10} = 0{,}04 = 4\\,\\%'}</MB>
                    <MB>{'\\frac{0{,}04}{2/90} = \\frac{0{,}04}{0{,}0222} = 1{,}8'}</MB>
                    <p>Jonas’ 4 % wären also richtig gewesen, wenn die Lose zurückgelegt würden. Mit Zurücklegen ist es 1,8-mal so wahrscheinlich.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Mit Zurücklegen liegen im 2. Zug wieder alle 10 Lose in der Tüte.</>,
                      <>Beide Äste des Pfades HH haben dann die Wahrscheinlichkeit <M>{'\\frac{2}{10}'}</M>.</>,
                      <>Für den Faktor teilst du das neue Ergebnis durch das alte: <M>{'0{,}04 : \\frac{2}{90}'}</M>.</>,
                    ]}
                  />
                }
              />
            </Abschnitt>
            <BonusSpiel frei={uebungen.length === 3} titel="Pfade-Jagd">
              <PfadeJagd />
            </BonusSpiel>
            <Bilanz />
            <div className="sl-ende">
              <p>
                Du kannst jetzt mehrstufige Zufallsexperimente mit dem Baumdiagramm lösen, mit und ohne Zurücklegen. Bei den Übungsaufgaben wendest du die Pfadregeln auf weitere Aufgaben an.
              </p>
              <div className="bk-actions">
                <button type="button" className="bk-btn" onClick={() => navigate('/daten-und-zufall/baumdiagramme')}>
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
                </button>
                <button type="button" className="bk-btn bk-btn-primary" onClick={() => navigate('/daten-und-zufall/baumdiagramme/ueben')}>
                  Weiter üben: Baumdiagramme <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        );
      },
    },
  ];

  return (
    <TaskShell title="Mehrstufige Baumdiagramme: Die Wundertüte" width="wide" kompakt parent={{ to: '/daten-und-zufall/baumdiagramme', label: 'Mehrstufige Baumdiagramme' }}>
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={
          <>
            In dieser Lernsituation betreust du den Losstand beim Schulfest. Du lernst, mit einem Baumdiagramm Wahrscheinlichkeiten für zwei Züge hintereinander zu berechnen und die
            Pfadregeln zu nutzen.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Festlegung aus Phase 2 */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  if (!fest.fest || !fest.wahl) return null;
  const echt = (P_HH * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 });
  const diff = Math.abs(fest.wert - P_HH * 100);
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {WAHL[fest.wahl]} Du hast etwa {fest.wert.toLocaleString('de-DE')} % geschätzt.{' '}
        {fest.wahl === 'weniger' ? 'Das stimmt: ' : 'Tatsächlich sind es weniger: '}
        <M>{'P(HH) = \\frac{2}{10} \\cdot \\frac{1}{9} = \\frac{1}{45}'}</M>, also etwa {echt} %.{' '}
        {diff <= 1 ? 'Deine Schätzung war sehr nah dran.' : `Deine Schätzung lag ${diff.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Prozentpunkte daneben.`} Jonas’ 4 % passen nur zum Ziehen mit Zurücklegen, denn nach einem
        Hauptgewinn liegt nur noch 1 Hauptgewinn bei 9 Losen in der Tüte.
      </p>
    </div>
  );
}
