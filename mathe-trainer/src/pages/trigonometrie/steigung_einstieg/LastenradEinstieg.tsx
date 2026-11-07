import type { ReactNode } from 'react';
import TaskShell from '../../../components/layout/TaskShell';
import { useSitzungState } from '../../../hooks/useSitzung';
import { Beispiel, M, MB, Merke } from '../../daten_und_zufall/lernpfad/kit';
import { CheckCard, Hilfen, Loesungsweg, McCard, TrackedCheck, TrackedMc } from '../../lineare_funktionen/lernsituation_kit/kit';
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
} from '../../lineare_funktionen/lernsituation_kit/seiten';
import { Bilanz } from '../../lineare_funktionen/lernsituation_kit/punkte';
import { Kriterien, standardKriterien } from '../../finanzmathe/zins_kit/zins_kit';
import Dreieck from '../sinus_kosinus_tangens_einstieg/Dreieck';
import RampenTest, { GRENZE_PROZENT, istTreffer } from './RampenTest';
import SchilderSpiel from './SchilderSpiel';
import titelBild from './bilder/lastenrad-titel.webp';
import schilderBild from './bilder/lastenrad-schilder.webp';
import dreieckBild from './bilder/lastenrad-dreieck.webp';
import aushangBild from './bilder/lastenrad-aushang.webp';
import '../../daten_und_zufall/lernpfad/lernpfad.css';
import './lastenrad.css';

// Lernsituation „Das Lastenrad“: Steigung in Prozent und Steigungswinkel in Grad mit dem Tangens umrechnen (ca. 60 bis 90 min).
// Format Rollenspiel / Beratungsauftrag: Du bist Azubi im Fahrradladen. Frau Brandl will ein Lastenrad kaufen, das laut Datenblatt
// Steigungen bis 12° schafft. Auf ihrem Weg zur Kita liegt die Kirchbergstraße mit dem Schild 18 %, am Bahnhof eine Rampe mit 25 %.
// „18 ist doch mehr als 12, schafft das Rad das überhaupt?“ Auf der Testrampe suchen die SuS die Prozentzahl, die 12° entspricht.
// Aha: 18 % sind nur etwa 10,2°, also flacher als 12°. Die Rampe mit 25 % hat etwa 14,0° und ist zu steil. Prozent ist nicht gleich Grad.
// Lernprodukt analog: Aushang (Plakat) für den Laden „Prozent oder Grad?“ mit Steigungsdreieck, Umrechnung und Antwort an Frau Brandl.
// Identität: Themenfarbe Indigo, Symbol Fahrrad, Titelbild Plakat „18 % oder 12°?“ mit Lastenrad am Hang, Leitobjekt das Lastenrad.
// Bildwelt Siebdruck / zweifarbig (Indigo + Leuchtpink): Titelbild und Sachbilder sind gerenderte WebP-Dateien aus
// bilder-quelle/lastenrad-*.bild.html (Bausteine in bilder-quelle/_siebdruck.js); Testrampe, Dreiecke und Spiel bleiben Inline-SVG.
// Punkte nach Aufwand (Pflicht 60): Warm-up 2/3/2/2/2 = 11 (18 %), Rampen-Test 3, Kernaufgabe 13, Entscheidung 4, Aushang 5
// (Problem lösen 22 = 37 %), Übungen 4/6/6/8 = 24 (40 %); Profi 9; Bonus-Spiel „Schilderwald“ höchstens 8.
// Offener Punkt: Zu Steigungswinkel in Prozent und Grad gibt es noch kein Lernvideo, deshalb steht nur die Beispielrechnung zum Aufklappen.

const rad = (g: number) => (g * Math.PI) / 180;
const deg = (x: number) => (x * 180) / Math.PI;
const W18 = deg(Math.atan(0.18));
const W25 = deg(Math.atan(0.25));

/* ── Identität ───────────────────────────────────────────────────────────── */

export const THEMA_LASTENRAD: Thema = {
  name: 'Das Lastenrad',
  farbe: 'indigo',
  icon: 'fa-bicycle',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Siebdruck-Plakat in Indigo und Pink: Ein Lastenrad fährt einen Hang hinauf. Daneben groß die Frage 18 Prozent oder 12 Grad? Darunter: Datenblatt bis 12 Grad, Schild Kirchbergstraße 18 Prozent."
    />
  ),
};
const BILDWELT: Bildwelt = { welt: 'siebdruck', variante: 'zweifarbig' };

const LOESUNG_KERN = (
  <Loesungsweg
    schritte={[
      { titel: 'Prozent als Steigungsdreieck deuten', text: '18 % heißt: 18 m Höhe auf 100 m waagrechte Strecke. Höhe = Gegenkathete, waagrecht = Ankathete.' },
      { titel: 'Tangens aufschreiben', tex: '\\tan(\\alpha) = \\dfrac{18}{100} = 0{,}18' },
      { titel: 'Winkel mit der Umkehrfunktion', tex: ['\\alpha = \\tan^{-1}(0{,}18)', '\\alpha \\approx 10{,}2^\\circ'] },
      { titel: 'Dasselbe für 25 %', tex: ['\\alpha = \\tan^{-1}(0{,}25)', '\\alpha \\approx 14{,}0^\\circ'] },
    ]}
  />
);

/* ── Rechenbeispiel: Passstraße 8 % und Skipiste 15° ──────────────────── */

const BSP_AUFGABE = (
  <p>
    Eine Passstraße hat ein Schild mit 8 % Steigung. Wie groß ist ihr Steigungswinkel? Und umgekehrt: Eine Skipiste ist <M>{'15^\\circ'}</M> steil.
    Wie viel Prozent Steigung sind das?
  </p>
);
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Was die Prozentangabe bedeutet',
    body: (
      <>
        <p>
          Die <strong>Steigung in Prozent</strong> gibt an, wie viele Meter es auf 100 m <strong>waagrechter</strong> Strecke nach oben geht. 8 %
          heißt also: Auf 100 m waagrecht steigt die Straße um 8 m. Höhe und waagrechte Strecke bilden ein rechtwinkliges Dreieck, das{' '}
          <strong>Steigungsdreieck</strong>.
        </p>
        <div className="lr-skizze-klein">
          <Dreieck
            boden={100}
            ruecken={24}
            labels={{ boden: '100 m waagrecht', ruecken: '8 m', schraeg: 'Straße' }}
            winkelText="α = ?"
            breite={560}
            label="Steigungsdreieck: 100 Meter waagrecht, 8 Meter Höhe, die Straße ist die schräge Seite. Gesucht ist der Steigungswinkel Alpha. Zur besseren Sichtbarkeit ist die Höhe überhöht gezeichnet."
          />
        </div>
        <p className="lr-klein">Die Höhe ist zur besseren Sichtbarkeit überhöht gezeichnet.</p>
      </>
    ),
  },
  {
    title: 'Prozent in Grad: den Tangens umkehren',
    body: (
      <>
        <p>
          Der <strong>Steigungswinkel</strong> <M>\alpha</M> ist der Winkel zwischen Straße und Waagrechter. Von ihm aus ist die Höhe die
          Gegenkathete und die waagrechte Strecke die Ankathete. Beide stehen im Tangens:
        </p>
        <MB>{'\\tan(\\alpha) = \\dfrac{8}{100} = 0{,}08'}</MB>
        <p>Die Prozentzahl geteilt durch 100 ist also genau der Tangens. Den Winkel liefert die Umkehrfunktion:</p>
        <MB>{'\\alpha = \\tan^{-1}(0{,}08) \\approx 4{,}6^\\circ'}</MB>
      </>
    ),
  },
  {
    title: 'Grad in Prozent: den Tangens nehmen',
    body: (
      <>
        <p>Für die Skipiste ist der Winkel bekannt. Der Tangens liefert das Verhältnis Höhe durch waagrechte Strecke:</p>
        <MB>{'\\tan(15^\\circ) \\approx 0{,}268'}</MB>
        <p>Mal 100 ergibt die Steigung in Prozent. Tippe es in einem Zug ein und runde am Ende:</p>
        <MB>{'p = \\tan(15^\\circ) \\cdot 100\\,\\% \\approx 26{,}8\\,\\%'}</MB>
        <p>
          Achtung: Die Zahlen sind verschieden. <M>{'15^\\circ'}</M> sind fast 27 %, und 8 % sind weniger als <M>{'5^\\circ'}</M>.
        </p>
      </>
    ),
  },
];

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function LastenradEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [versuche, setVersuche] = useSitzungState<number[]>('lr-versuche', []);
  const [geloest, setGeloest] = useSitzungState('lr-geloest', false);
  const [uebungen, setUebungen] = useSitzungState<string[]>('lr-uebungen', []);
  const uebung = (nr: string, fertig: () => void) => () => {
    fertig();
    setUebungen((u) => (u.includes(nr) ? u : [...u, nr]));
  };

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen in der Werkstatt',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 10 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Prozentwert"
            prompt={<p>Eine Radtour führt 250 m weit. 18 % davon geht es bergauf. Wie viele Meter sind das?</p>}
            fields={[{ kind: 'num', key: 'w', label: '18 % von 250 m =', expected: 45, unit: 'm' }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Prozentsatz als Dezimalzahl', tex: '18\\,\\% = 0{,}18' },
                  { titel: 'Mit dem Grundwert multiplizieren', tex: '0{,}18 \\cdot 250\\,\\text{m} = 45\\,\\text{m}' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Prozent heißt „von hundert“. 18 % ist also 18 : 100.</>,
                  <>Rechne mit dem Taschenrechner 250 · 0,18 (nicht 250 · 18).</>,
                  <>
                    <M>{'250 \\cdot 0{,}18'}</M>
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={3}
            title="b) Prozentsatz"
            prompt={<p>Ein Feldweg steigt auf 300 m waagrechter Strecke um 45 m. Wie viel Prozent sind 45 m von 300 m?</p>}
            fields={[{ kind: 'num', key: 'p', label: 'Prozentsatz:', expected: 15, unit: '%' }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Anteil bilden', tex: '\\dfrac{45}{300} = 0{,}15' },
                  { titel: 'In Prozent umwandeln', tex: '0{,}15 = 15\\,\\%' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Der Prozentsatz ist der Anteil: Teil geteilt durch Ganzes.</>,
                  <>Rechne 45 : 300 und schreibe das Ergebnis in Prozent.</>,
                  <>
                    <M>{'45 : 300 = 0{,}15'}</M>, also …
                  </>,
                ]}
              />
            }
          />
          <McCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Der Tangens im Steigungsdreieck"
            prompt={
              <>
                <div className="lr-skizze-klein">
                  <Dreieck
                    boden={10}
                    ruecken={4}
                    labels={{ boden: 'waagrecht', ruecken: 'Höhe', schraeg: 'Weg' }}
                    breite={460}
                    label="Steigungsdreieck: waagrechte Strecke unten, Höhe hinten, schräger Weg. Winkel Alpha unten vorne."
                  />
                </div>
                <p>Welcher Bruch ist <M>{'\\tan(\\alpha)'}</M>?</p>
              </>
            }
            options={[
              { text: <M>{'\\dfrac{\\text{Höhe}}{\\text{Weg}}'}</M>, feedback: 'Das ist Gegenkathete durch Hypotenuse, also der Sinus.' },
              { text: <M>{'\\dfrac{\\text{waagrecht}}{\\text{Höhe}}'}</M>, feedback: 'Zähler und Nenner sind vertauscht.' },
              { text: <M>{'\\dfrac{\\text{Höhe}}{\\text{waagrecht}}'}</M>, correct: true, feedback: 'Richtig: Gegenkathete durch Ankathete.' },
              { text: <M>{'\\dfrac{\\text{waagrecht}}{\\text{Weg}}'}</M>, feedback: 'Das ist Ankathete durch Hypotenuse, also der Kosinus.' },
            ]}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Steigung einer Geraden"
            rechnen={false}
            prompt={
              <p>
                Die Gerade <M>{'y = 0{,}25x'}</M> steigt pro Schritt nach rechts um <M>{'0{,}25'}</M> nach oben. Wie viel Prozent Steigung sind das?
              </p>
            }
            fields={[{ kind: 'select', key: 'p', label: 'Steigung:', options: ['0,25 %', '2,5 %', '25 %', '250 %'], expected: 2 }]}
            solution={<p><M>{'0{,}25 = \\frac{25}{100} = 25\\,\\%'}</M>: Auf 100 nach rechts geht es 25 nach oben.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title="e) Winkel aus dem Tangens"
            prompt={
              <p>
                In einem rechtwinkligen Dreieck ist <M>{'\\tan(\\alpha) = 0{,}5'}</M>. Wie groß ist <M>\alpha</M>? Runde auf eine Nachkommastelle.
              </p>
            }
            fields={[{ kind: 'num', key: 'a', label: <M>{'\\alpha \\approx'}</M>, expected: deg(Math.atan(0.5)), unit: '°', tol: 0.051 }]}
            solution={<Loesungsweg schritte={[{ titel: 'Umkehrfunktion des Tangens', tex: '\\alpha = \\tan^{-1}(0{,}5) \\approx 26{,}6^\\circ' }]} />}
            help={
              <Hilfen
                steps={[
                  <>Vom Verhältnis zum Winkel kommst du mit der Umkehrfunktion.</>,
                  <>Auf dem Taschenrechner: SHIFT (oder 2nd), dann tan, dann 0,5. Modus DEG.</>,
                  <>
                    <M>{'\\tan^{-1}(0{,}5)'}</M>
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
      titel: '18 % oder 12°: Schafft das Lastenrad den Berg?',
      pflicht: ['testen'],
      bedingung: 'Stelle die Testrampe mindestens dreimal ein (oder triff die 12°-Grenze), dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du machst eine Ausbildung im Fahrradladen „Rad und Tat“. Frau Brandl möchte ein Lastenrad kaufen, um ihre Kinder in die Kita zu bringen.
            Im Datenblatt steht: „Steigfähigkeit voll beladen bis <M>{'12^\\circ'}</M>“.
          </p>
          <p className="sl-text">
            Auf ihrem Weg liegt die Kirchbergstraße mit dem Schild 18 %, am Bahnhof eine Rampe mit 25 %. Frau Brandl ist unsicher: „18 ist doch mehr
            als 12. Schafft das Rad das überhaupt?“ Gegeben sind also die Steigungen in Prozent und die Grenze in Grad. Gesucht ist, ob die beiden
            Steigungen flacher oder steiler als <M>{'12^\\circ'}</M> sind.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Probier es auf der Testrampe aus, ohne zu rechnen</p>
            <p>
              Stelle die Testrampe auf eine Steigung in Prozent ein. Die Anzeige vergleicht sie mit der 12°-Grenze des Lastenrads. Findest du die
              Prozentzahl, die genau <M>{'12^\\circ'}</M> entspricht?
            </p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 8 Minuten.</p>
          <figure className="sl-foto">
            <img
              src={schilderBild}
              width={1200}
              height={600}
              alt="Siebdruck-Plakat: links ein Verkehrsschild Steigung 18 Prozent mit der Aufschrift Kirchbergstraße, in der Mitte ein Schild 25 Prozent mit der Aufschrift Bahnhofsrampe, rechts das Datenblatt des Lastenrads mit Steigfähigkeit bis 12 Grad."
            />
            <figcaption>Zwei Schilder in Prozent, ein Datenblatt in Grad.</figcaption>
          </figure>
          <RampenTest
            versuche={versuche}
            onTesten={(p) => {
              const neu = [...versuche, p];
              setVersuche(neu);
              if (neu.length >= 3 || neu.some(istTreffer)) fertig.teil('testen')();
            }}
          />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Beratung für Frau Brandl',
      pflicht: ['rechnung', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Rechne die Schilder in Grad um</p>
            <p>
              Berechne die Steigungswinkel der Kirchbergstraße (18 %) und der Bahnhofsrampe (25 %) auf eine Nachkommastelle genau. Vergleiche sie mit
              der Grenze des Lastenrads von <M>{'12^\\circ'}</M>.
            </p>
            <p>
              Das Werkzeug dafür lernst du im Beispiel unten kennen: Mit dem Tangens rechnest du Prozent und Grad ineinander um.
            </p>
          </div>
          <figure className="sl-foto">
            <img
              src={dreieckBild}
              width={1200}
              height={600}
              alt="Siebdruck-Plakat: zwei Steigungsdreiecke nebeneinander. Links Kirchbergstraße mit 100 Meter waagrecht und 18 Meter Höhe, rechts Bahnhofsrampe mit 100 Meter waagrecht und 25 Meter Höhe. Bei beiden ist der Winkel Alpha mit Fragezeichen markiert."
            />
          </figure>
          <BeispielMitVideo>
            <Beispiel offen title="Passstraße und Skipiste" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('rechnung')();
                setGeloest(true);
              }}
              punkte={13}
              title="Die Steigungswinkel"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'k', label: <>Wie groß ist der Steigungswinkel der Kirchbergstraße (18 %)?</>, expected: W18, unit: '°', tol: 0.051 },
                { kind: 'num', key: 'b', label: <>Wie groß ist der Steigungswinkel der Bahnhofsrampe (25 %)?</>, expected: W25, unit: '°', tol: 0.051 },
              ]}
              loesungNachFehler
              solution={LOESUNG_KERN}
              help={
                <Hilfen
                  steps={[
                    <>Gehe vor wie im Beispiel: Was bedeutet 18 % im Steigungsdreieck?</>,
                    <>18 % heißt 18 m Höhe auf 100 m waagrecht. Höhe durch waagrechte Strecke ist der Tangens von <M>\alpha</M>.</>,
                    <>
                      <M>{'\\alpha = \\tan^{-1}(0{,}18)'}</M> und <M>{'\\alpha = \\tan^{-1}(0{,}25)'}</M>. Taschenrechner auf Grad (DEG).
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Deine Entscheidung">
            <McCard
              onSolved={fertig.teil('entscheidung')}
              punkte={4}
              rechnen
              title="Beratung"
              prompt={<p>Was sagst du Frau Brandl?</p>}
              options={[
                {
                  text: 'Das Rad schafft keine der beiden Strecken: 18 und 25 sind beide mehr als 12.',
                  feedback: 'Prozent und Grad sind verschiedene Einheiten. Erst umrechnen, dann vergleichen.',
                },
                {
                  text: 'Das Rad schafft beide Strecken, denn 25 % sind nur 2,5°.',
                  feedback: '25 % bedeutet tan(α) = 0,25, nicht 2,5°. Mit der Umkehrfunktion sind das etwa 14,0°.',
                },
                {
                  text: 'Die Kirchbergstraße schafft es (etwa 10,2° < 12°), die Bahnhofsrampe nicht (etwa 14,0° > 12°).',
                  correct: true,
                  feedback: 'Genau. Trotz der größeren Zahl ist die Kirchbergstraße flacher als die Grenze. Für die Bahnhofsrampe braucht Frau Brandl einen anderen Weg.',
                },
                {
                  text: 'Die Kirchbergstraße schafft es nicht, weil 18 % genau 18° sind.',
                  feedback: '18 % sind etwa 10,2°. Prozent und Grad lassen sich nicht einfach gleichsetzen.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Aushang für den Laden: Prozent oder Grad?">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={aushangBild}
                width={800}
                height={400}
                alt="Siebdruck-Plakat als Aushang: Überschrift Prozent oder Grad?, darunter ein leeres Steigungsdreieck und eine leere Tabelle mit den Spalten Prozent und Grad."
              />
            </figure>
            <p className="sl-text">
              Gestalte in deinem Heft oder auf einem DIN-A4-Blatt einen Aushang für den Laden, damit auch andere Kundinnen und Kunden Bescheid wissen.
              Zeichne ein Steigungsdreieck und beschrifte es, schreibe die Umrechnung von Prozent in Grad und von Grad in Prozent auf und rechne
              Frau Brandls zwei Strecken vor. Notiere unten die Antwort an Frau Brandl.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Die Steigung in Prozent gibt an, …“</li>
                <li>„Von Prozent zu Grad kommst du so: …“</li>
                <li>„Von Grad zu Prozent kommst du so: …“</li>
                <li>„Liebe Frau Brandl, die Kirchbergstraße hat …, die Bahnhofsrampe hat …, deshalb …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Aushang vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien('an Frau Brandl')} />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug versuche={versuche} />
              <Merke title="Steigung in Prozent und Steigungswinkel in Grad">
                <p>
                  Die Steigung in Prozent gibt an, wie viele Meter es auf 100 m waagrechter Strecke nach oben geht. Höhe durch waagrechte Strecke ist der
                  Tangens des Steigungswinkels:
                </p>
                <MB>{'\\tan(\\alpha) = \\dfrac{\\text{Höhenunterschied}}{\\text{waagrechte Strecke}} = \\dfrac{p}{100}'}</MB>
                <p>Prozent in Grad:</p>
                <MB>{'\\alpha = \\tan^{-1}\\left(\\dfrac{p}{100}\\right)'}</MB>
                <p>Grad in Prozent:</p>
                <MB>{'p = \\tan(\\alpha) \\cdot 100\\,\\%'}</MB>
                <p>Prozent und Grad sind nicht dasselbe: 100 % Steigung sind <M>{'45^\\circ'}</M>, nicht <M>{'90^\\circ'}</M>.</p>
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
            Prüfe und vertiefe dein Wissen mit vier Aufgaben, die fünfte ist für Profis. Wenn du die vier Pflichtaufgaben gelöst hast, wartet unten
            ein Spiel auf dich. Einzelarbeit, ca. 20 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Das Schild mit 10 %">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Steigung-Einstieg: Prozent in Grad (Basis)"
              title="Übung 1"
              level="basis"
              prompt={<p>Ein Schild zeigt eine Steigung von 10 %. Wie groß ist der Steigungswinkel?</p>}
              options={[
                { text: <M>{'10^\\circ'}</M>, feedback: 'Prozent und Grad sind nicht dasselbe. 10 % bedeutet tan(α) = 0,1.' },
                { text: <M>{'84{,}3^\\circ'}</M>, feedback: <>Das ist <M>{'\\tan^{-1}(10)'}</M> bzw. der Winkel oben. Die Prozentzahl muss erst durch 100 geteilt werden.</> },
                { text: <M>{'5{,}7^\\circ'}</M>, correct: true, feedback: <>Richtig: <M>{'\\alpha = \\tan^{-1}(0{,}1) \\approx 5{,}7^\\circ'}</M>.</> },
                { text: <M>{'0{,}1^\\circ'}</M>, feedback: '0,1 ist der Tangens, also ein Verhältnis und noch kein Winkel. Es fehlt die Umkehrfunktion.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
              topic="Steigung-Einstieg: 100 % Steigung (Standard)"
              title="Übung 2"
              level="standard"
              prompt={
                <p>
                  Im Laden diskutieren zwei Azubis über eine Mountainbike-Strecke mit 100 % Steigung. Mia sagt: „100 % ist das Maximum, das ist senkrecht,
                  also <M>{'90^\\circ'}</M>.“ Tom sagt: „100 % heißt 100 m hoch auf 100 m waagrecht, das sind <M>{'45^\\circ'}</M>.“
                </p>
              }
              options={[
                { text: 'Mia: Mehr als 100 % gibt es nicht.', feedback: 'Steigungen über 100 % gibt es, z. B. 150 % bei sehr steilen Rampen. Senkrecht wäre unendlich viel Prozent.' },
                { text: 'Keiner: 100 % sind 100°.', feedback: 'Ein Steigungswinkel liegt immer unter 90°.' },
                { text: 'Beide: Es kommt darauf an, wie man misst.', feedback: 'Die Prozentangabe ist eindeutig festgelegt: Höhe durch waagrechte Strecke mal 100 %.' },
                {
                  text: 'Tom: Höhe und waagrechte Strecke sind gleich lang, also tan(α) = 1 und α = 45°.',
                  correct: true,
                  feedback: <>Genau. <M>{'\\tan^{-1}(1) = 45^\\circ'}</M>. Senkrecht wäre eine Höhe ohne waagrechte Strecke, dafür gibt es keine Prozentzahl.</>,
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Die Grenze des Lastenrads in Prozent">
            <TrackedCheck
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              topic="Steigung-Einstieg: Grad in Prozent (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Der Laden will ins Datenblatt auch die Prozentangabe schreiben: Wie viel Prozent Steigung entsprechen der Grenze von <M>{'12^\\circ'}</M>?
                  Ergänze die Rechnung. Runde den Tangens auf vier und die Steigung auf eine Nachkommastelle.
                </p>
              }
              rechnung={[
                { l: ['\\tan(12^\\circ)'], r: [{ luecke: 'q', breit: true }] },
                { l: ['p'], r: [{ luecke: 'p' }] },
              ]}
              fields={[
                { kind: 'num', key: 'q', label: 'tan(12°)', expected: Math.tan(rad(12)), tol: 0.00051 },
                { kind: 'num', key: 'p', label: 'p', expected: GRENZE_PROZENT, unit: '%', tol: 0.051 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Tangens des Winkels', tex: '\\tan(12^\\circ) \\approx 0{,}2126' },
                    { titel: 'In Prozent umrechnen', tex: 'p = \\tan(12^\\circ) \\cdot 100\\,\\% \\approx 21{,}3\\,\\%' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Der Tangens des Steigungswinkels ist Höhe durch waagrechte Strecke.</>,
                    <>Dieses Verhältnis mal 100 ergibt die Steigung in Prozent.</>,
                    <>
                      <M>{'p = \\tan(12^\\circ) \\cdot 100\\,\\%'}</M>
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Die Strecke laut Navi">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              topic="Steigung-Einstieg: Weg entlang der Straße (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <>
                  <p>
                    Ein Kunde zeigt dir sein Navi: Auf 400 m Fahrstrecke (gemessen <strong>entlang der Straße</strong>) geht es 80 m nach oben. Er
                    meint: „Das sind 80 : 400 = 20 %.“ Berechne den Steigungswinkel und die richtige Steigung in Prozent (je auf zwei Nachkommastellen).
                  </p>
                  <div className="lr-skizze-klein">
                    <Dreieck
                      boden={Math.sqrt(400 ** 2 - 80 ** 2)}
                      ruecken={80}
                      labels={{ boden: 'waagrecht ?', ruecken: '80 m', schraeg: '400 m Straße' }}
                      winkelText="α = ?"
                      breite={540}
                      label="Steigungsdreieck: Die Straße ist 400 Meter lang, die Höhe 80 Meter, die waagrechte Strecke ist unbekannt. Gesucht ist der Winkel Alpha."
                    />
                  </div>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'a', label: <M>{'\\alpha \\approx'}</M>, expected: deg(Math.asin(0.2)), unit: '°', tol: 0.0051 },
                { kind: 'num', key: 'p', label: 'Steigung:', expected: Math.tan(Math.asin(0.2)) * 100, unit: '%', tol: 0.0051 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Seiten benennen', text: 'Die 400 m entlang der Straße sind die Hypotenuse, die 80 m die Gegenkathete: Sinus.' },
                    { titel: 'Winkel mit der Umkehrfunktion', tex: ['\\alpha = \\sin^{-1}\\left(\\dfrac{80}{400}\\right)', '\\alpha \\approx 11{,}54^\\circ'] },
                    { titel: 'Steigung in Prozent', tex: 'p = \\tan(11{,}54^\\circ) \\cdot 100\\,\\% \\approx 20{,}41\\,\\%' },
                    { titel: 'Deutung', text: '80 : 400 teilt durch die Straße, nicht durch die waagrechte Strecke. Die Steigung ist deshalb etwas größer als 20 %.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Die Prozentangabe bezieht sich auf die waagrechte Strecke. Hier ist aber die Strecke entlang der Straße bekannt. Welche Seite ist das?</>,
                    <>Die Straße ist die Hypotenuse. Höhe und Hypotenuse stehen im Sinus: <M>{'\\alpha = \\sin^{-1}(80 : 400)'}</M>.</>,
                    <>Mit dem Winkel rechnest du dann in Prozent um: <M>{'p = \\tan(\\alpha) \\cdot 100\\,\\%'}</M>. Rechne mit dem ungerundeten Winkel weiter.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Die Rampe zum Laden">
            <CheckCard
              title="Rampe nach Norm"
              level="erweiterung"
              profi
              punkte={9}
              prompt={
                <p>
                  Damit auch Rollstühle und Kinderwagen in den Laden kommen, plant der Chef eine Rampe. Sie muss 0,48 m Höhe überwinden und darf höchstens
                  6 % steil sein. Wie lang muss die Rampe waagrecht mindestens sein? Wie groß ist dann ihr Steigungswinkel (auf eine Nachkommastelle)?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'w', label: 'waagrecht:', expected: 8, unit: 'm', tol: 0.011 },
                { kind: 'num', key: 'a', label: <M>{'\\alpha \\approx'}</M>, expected: deg(Math.atan(0.06)), unit: '°', tol: 0.051 },
              ]}
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Prozent bedeutet Höhe durch waagrecht', tex: '\\dfrac{0{,}48\\,\\text{m}}{\\text{waagrecht}} = 0{,}06' },
                    { titel: 'Nach der waagrechten Strecke umstellen', tex: '\\text{waagrecht} = \\dfrac{0{,}48\\,\\text{m}}{0{,}06} = 8\\,\\text{m}' },
                    { titel: 'Steigungswinkel', tex: '\\alpha = \\tan^{-1}(0{,}06) \\approx 3{,}4^\\circ' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>6 % heißt: 6 cm Höhe auf 1 m waagrecht. Wie viele Meter braucht man für 48 cm?</>,
                    <><M>{'0{,}48 : 0{,}06'}</M> ergibt die waagrechte Länge.</>,
                    <>Der Winkel: <M>{'\\tan^{-1}(0{,}06)'}</M>.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={['1', '2', '3', '4'].every((n) => uebungen.includes(n))} titel="Schilderwald">
            <SchilderSpiel />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du rechnest jetzt Steigungen zwischen Prozent und Grad um. Bei den Übungsaufgaben trainierst du das mit Straßen, Rampen und Wanderkarten.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Steigungswinkel in Prozent und Grad <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Steigungswinkel: Das Lastenrad"
      width="wide"
      kompakt
      parent={{ to: '/trigonometrie/steigungswinkel-prozent-grad', label: 'Steigungswinkel in Prozent und Grad' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA_LASTENRAD}
        bildwelt={BILDWELT}
        ziel={
          <>
            In dieser Lernsituation berätst du als Azubi im Fahrradladen eine Kundin beim Kauf eines Lastenrads. Du lernst, wie du eine Steigung in
            Prozent in einen Steigungswinkel in Grad umrechnest und umgekehrt.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Tests an der Testrampe aus Phase 2 */
function Rueckbezug({ versuche }: { versuche: number[] }) {
  if (!versuche.length) return null;
  const beste = versuche.reduce((a, b) => (Math.abs(b - GRENZE_PROZENT) < Math.abs(a - GRENZE_PROZENT) ? b : a));
  const z = (x: number) => x.toLocaleString('de-DE', { maximumFractionDigits: 1 });
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest getestet:</strong> {versuche.length} {versuche.length === 1 ? 'Rampe' : 'Rampen'}, am nächsten an der 12°-Grenze war {z(beste)} %.{' '}
        {istTreffer(beste) ? 'Ein Treffer!' : ''} Die Rechnung liefert den genauen Wert: <M>{'\\tan(12^\\circ) \\cdot 100\\,\\% \\approx 21{,}3\\,\\%'}</M>. Die
        Kirchbergstraße mit 18 % liegt darunter, die Bahnhofsrampe mit 25 % darüber, genau wie die Winkel 10,2° und 14,0° zeigen.
      </p>
    </div>
  );
}
