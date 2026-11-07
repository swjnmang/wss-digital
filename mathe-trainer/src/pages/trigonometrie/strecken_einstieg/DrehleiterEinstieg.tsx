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
import LeiterSchaetzung, { ABSTAND, HOEHE, istTreffer } from './LeiterSchaetzung';
import LeiterSpiel from './LeiterSpiel';
import titelBild from './bilder/drehleiter-titel.webp';
import uebungBild from './bilder/drehleiter-uebung.webp';
import einsatzBild from './bilder/drehleiter-einsatz.webp';
import karteBild from './bilder/drehleiter-karte.webp';
import '../../daten_und_zufall/lernpfad/lernpfad.css';
import './drehleiter.css';

// Lernsituation „Die Drehleiter“: Streckenlängen im rechtwinkligen Dreieck mit Sinus und Kosinus berechnen (ca. 60 bis 90 min).
// Format Entscheidungsfall: Bei der Übung der Jugendfeuerwehr wird die Drehleiter 30 m ausgefahren und um 70° aufgerichtet. Reicht sie bis
// zum Fenster 26 m über dem Drehpunkt, und wie weit vor der Wand muss der Drehpunkt stehen? In „Problem erkennen“ schätzen die SuS die
// Höhe der Leiterspitze, der Gruppenführer meldet nur „zu hoch“ oder „zu niedrig“. Pythagoras hilft nicht: Bekannt ist nur eine Seite.
// Aha: Ein Winkel und eine Seite reichen. Höhe = 30 m · sin(70°) ≈ 28,19 m, Abstand = 30 m · cos(70°) ≈ 10,26 m.
// Lernprodukt analog: Spickzettel (Karteikarte) „Fehlende Seite berechnen in drei Schritten“ mit Skizze und eigenem Beispiel.
// Identität: Themenfarbe Kupfer, Symbol Feuerlöscher, Titelbild Übungseinsatz mit Drehleiter, Leitobjekt die Drehleiter.
// Bildwelt Comic / Pop: Titelbild und Sachbilder sind gerenderte WebP-Dateien aus bilder-quelle/drehleiter-*.bild.html
// (Bausteine in bilder-quelle/_comic.js); Skizze zum Schätzen, Dreiecke und Spiel bleiben Inline-SVG.
// Punkte nach Aufwand (Pflicht 62): Warm-up 2/2/3/3/2 = 12 (19 %), Schätzen 3, Kernaufgabe 14, Entscheidung 4, Spickzettel 5
// (Problem lösen 23 = 37 %), Übungen 4/6/6/8 = 24 (39 %); Profi 9; Bonus-Spiel „Leiter-Einsatz“ höchstens 8.

/** Lernvideo zum Thema (auch bei den Übungsaufgaben unter /trigonometrie/rechtwinklig-strecken verlinkt) */
export const VIDEO_STRECKEN = 'https://www.youtube.com/watch?v=HfiouXm2n3E';

/* ── Identität ───────────────────────────────────────────────────────────── */

export const THEMA_DREHLEITER: Thema = {
  name: 'Die Drehleiter',
  farbe: 'kupfer',
  icon: 'fa-fire-extinguisher',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Comic in drei Bildern: Übung der Jugendfeuerwehr am Samstag. Ein Hochhaus mit einem markierten Fenster, ein Drehleiterfahrzeug mit 30 Meter langer Leiter, um 70 Grad aufgerichtet, und die Frage: Reicht die Leiter bis zum Fenster?"
    />
  ),
};
const BILDWELT: Bildwelt = { welt: 'comic', variante: 'pop' };

const LOESUNG_KERN = (
  <Loesungsweg
    schritte={[
      { titel: 'Seiten vom Winkel aus benennen', text: 'Leiter 30 m = Hypotenuse, Höhe h = Gegenkathete, Abstand d = Ankathete.' },
      { titel: 'Sinus für die Höhe aufschreiben', tex: '\\sin(70^\\circ) = \\dfrac{h}{30\\,\\text{m}}' },
      { titel: 'Nach h umstellen (mal 30 m)', tex: ['h = 30\\,\\text{m} \\cdot \\sin(70^\\circ)', 'h \\approx 28{,}19\\,\\text{m}'] },
      { titel: 'Kosinus für den Abstand aufschreiben', tex: '\\cos(70^\\circ) = \\dfrac{d}{30\\,\\text{m}}' },
      { titel: 'Nach d umstellen (mal 30 m)', tex: ['d = 30\\,\\text{m} \\cdot \\cos(70^\\circ)', 'd \\approx 10{,}26\\,\\text{m}'] },
    ]}
  />
);

/* ── Rechenbeispiel: Anlegeleiter 6 m, 75° ─────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Im Gerätehaus lehnt eine 6 m lange Anlegeleiter an der Wand. Sie ist um <M>{'75^\\circ'}</M> gegen den Boden geneigt. Wie hoch reicht sie,
    und wie weit steht ihr Fuß von der Wand weg?
  </p>
);
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Die Seiten vom Winkel aus benennen',
    body: (
      <>
        <p>
          Leiter, Wand und Boden bilden ein rechtwinkliges Dreieck. Von dem Winkel <M>{'75^\\circ'}</M> am Boden aus gesehen ist die Leiter die
          Hypotenuse (sie liegt dem rechten Winkel gegenüber). Die Höhe an der Wand liegt dem Winkel gegenüber, sie ist die Gegenkathete. Der
          Abstand am Boden liegt am Winkel an, er ist die Ankathete.
        </p>
        <div className="dl-skizze-klein">
          <Dreieck
            boden={Math.cos((75 * Math.PI) / 180)}
            ruecken={Math.sin((75 * Math.PI) / 180)}
            labels={{ boden: 'Abstand ?', ruecken: 'Höhe ?', schraeg: 'Leiter 6 m' }}
            winkelText="75°"
            breite={460}
            label="Anlegeleiter 6 Meter, um 75 Grad geneigt. Gesucht sind die Höhe an der Wand und der Abstand am Boden."
          />
        </div>
      </>
    ),
  },
  {
    title: 'Die passende Winkelfunktion wählen',
    body: (
      <>
        <p>
          Bekannt ist die Hypotenuse, gesucht ist die Gegenkathete. Beide kommen im Sinus vor. Der Sinus ist die Gegenkathete geteilt durch die
          Hypotenuse:
        </p>
        <MB>{'\\sin(75^\\circ) = \\dfrac{\\text{Höhe}}{6\\,\\text{m}}'}</MB>
      </>
    ),
  },
  {
    title: 'Nach der gesuchten Seite umstellen',
    body: (
      <>
        <p>Die Höhe steht im Zähler. Multipliziere beide Seiten der Gleichung mit 6 m:</p>
        <MB>{'\\text{Höhe} = 6\\,\\text{m} \\cdot \\sin(75^\\circ)'}</MB>
        <p>
          Tippe das in einem Zug in den Taschenrechner (auf Grad, DEG) und runde erst am Ende:
        </p>
        <MB>{'\\text{Höhe} \\approx 5{,}80\\,\\text{m}'}</MB>
      </>
    ),
  },
  {
    title: 'Den Abstand mit dem Kosinus berechnen',
    body: (
      <>
        <p>Der Abstand ist die Ankathete. Der Kosinus ist die Ankathete geteilt durch die Hypotenuse:</p>
        <MB>{'\\cos(75^\\circ) = \\dfrac{\\text{Abstand}}{6\\,\\text{m}}'}</MB>
        <p>Wieder mal 6 m:</p>
        <MB>{'\\text{Abstand} = 6\\,\\text{m} \\cdot \\cos(75^\\circ) \\approx 1{,}55\\,\\text{m}'}</MB>
        <p>
          Kurzer Check: Beide Katheten sind kürzer als die Leiter. Das muss so sein, denn die Hypotenuse ist die längste Seite.
        </p>
      </>
    ),
  },
];

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function DrehleiterEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [schaetzungen, setSchaetzungen] = useSitzungState<number[]>('dl-schaetzungen', []);
  const [geloest, setGeloest] = useSitzungState('dl-geloest', false);
  const [uebungen, setUebungen] = useSitzungState<string[]>('dl-uebungen', []);
  const uebung = (nr: string, fertig: () => void) => () => {
    fertig();
    setUebungen((u) => (u.includes(nr) ? u : [...u, nr]));
  };

  const SEITEN = ['Seite a', 'Seite b', 'Seite c'];

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen im Gerätehaus',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 10 Minuten.</p>
          <div className="dl-skizze-klein">
            <Dreieck
              boden={4}
              ruecken={3}
              ecken={['A', 'C', 'B']}
              labels={{ boden: 'b', ruecken: 'a', schraeg: 'c' }}
              label="Rechtwinkliges Dreieck ABC mit dem rechten Winkel bei C. Winkel Alpha bei A. Seite a liegt gegenüber von A, b gegenüber von B, c gegenüber von C."
            />
          </div>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Seiten benennen"
            rechnen={false}
            prompt={<p>Im Dreieck <M>ABC</M> oben ist der rechte Winkel bei <M>C</M>. Benenne die Seiten vom Winkel <M>\alpha</M> aus.</p>}
            fieldsRow
            fields={[
              { kind: 'select', key: 'h', label: 'Hypotenuse:', options: SEITEN, expected: 2 },
              { kind: 'select', key: 'gk', label: 'Gegenkathete:', options: SEITEN, expected: 0 },
            ]}
            solution={
              <p>
                Die Hypotenuse liegt dem rechten Winkel gegenüber: <M>c</M>. Die Gegenkathete liegt dem Winkel <M>\alpha</M> gegenüber: <M>a</M>.
              </p>
            }
          />
          <McCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) Der Sinus"
            prompt={<p>Welcher Bruch ist im Dreieck oben <M>{'\\sin(\\alpha)'}</M>?</p>}
            options={[
              { text: <M>{'\\dfrac{b}{c}'}</M>, feedback: <>Das ist Ankathete durch Hypotenuse, also <M>{'\\cos(\\alpha)'}</M>.</> },
              { text: <M>{'\\dfrac{a}{b}'}</M>, feedback: <>Das ist Gegenkathete durch Ankathete, also <M>{'\\tan(\\alpha)'}</M>.</> },
              { text: <M>{'\\dfrac{a}{c}'}</M>, correct: true, feedback: <>Richtig: Gegenkathete <M>a</M> durch Hypotenuse <M>c</M>.</> },
              { text: <M>{'\\dfrac{c}{a}'}</M>, feedback: 'Zähler und Nenner sind vertauscht. Beim Sinus steht die Hypotenuse im Nenner.' },
            ]}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={3}
            title="c) Unbekannte im Zähler"
            prompt={<p>Löse die Gleichung nach <M>x</M> auf.</p>}
            rechnung={[
              { l: ['\\dfrac{x}{8}'], r: ['0{,}6'] },
              { l: ['x'], r: [{ luecke: 'x' }] },
            ]}
            fields={[{ kind: 'num', key: 'x', label: 'x', expected: 4.8 }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Beide Seiten mal 8', tex: ['\\dfrac{x}{8} = 0{,}6 \\quad \\mid \\cdot 8', 'x = 0{,}6 \\cdot 8'] },
                  { titel: 'Ausrechnen', tex: 'x = 4{,}8' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Das <M>x</M> wird durch 8 geteilt. Welche Rechnung macht das rückgängig?</>,
                  <>Multipliziere beide Seiten mit 8. Links bleibt dann nur <M>x</M>.</>,
                  <>
                    <M>{'x = 0{,}6 \\cdot 8'}</M>
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={3}
            title="d) Unbekannte im Nenner"
            prompt={<p>Jetzt steht <M>x</M> im Nenner. Löse nach <M>x</M> auf.</p>}
            rechnung={[
              { l: ['\\dfrac{12}{x}'], r: ['0{,}4'] },
              { l: ['x'], r: [{ luecke: 'x' }] },
            ]}
            fields={[{ kind: 'num', key: 'x', label: 'x', expected: 30 }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Beide Seiten mal x', tex: ['\\dfrac{12}{x} = 0{,}4 \\quad \\mid \\cdot x', '12 = 0{,}4 \\cdot x'] },
                  { titel: 'Beide Seiten durch 0,4', tex: ['12 = 0{,}4 \\cdot x \\quad \\mid : 0{,}4', 'x = \\dfrac{12}{0{,}4} = 30'] },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Hol das <M>x</M> zuerst aus dem Nenner, indem du mit <M>x</M> multiplizierst.</>,
                  <>Dann steht da <M>{'12 = 0{,}4 \\cdot x'}</M>. Jetzt teilst du durch die Zahl vor dem <M>x</M>.</>,
                  <>
                    <M>{'x = 12 : 0{,}4'}</M>
                  </>,
                ]}
              />
            }
          />
          <McCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title="e) Taschenrechner einstellen"
            prompt={
              <p>
                Lukas tippt <M>{'\\sin(30)'}</M> in seinen Taschenrechner und bekommt <M>{'-0{,}988'}</M>. Er weiß aber, dass{' '}
                <M>{'\\sin(30^\\circ) = 0{,}5'}</M> ist. Was ist los?
              </p>
            }
            options={[
              { text: 'Der Taschenrechner ist kaputt.', feedback: 'Er rechnet richtig, nur in einer anderen Winkeleinheit.' },
              { text: 'Lukas muss 30 in Klammern setzen.', feedback: 'Die Klammer ändert hier nichts. Es liegt an der Winkeleinheit.' },
              {
                text: 'Der Taschenrechner rechnet im Bogenmaß (RAD). Lukas muss ihn auf Grad (DEG) stellen.',
                correct: true,
                feedback: 'Genau. Im Bogenmaß ist 30 ein ganz anderer Winkel. In der Anzeige muss D oder DEG stehen.',
              },
              { text: 'Der Sinus kann auch negativ sein, das Ergebnis stimmt.', feedback: 'Für 30° ist der Sinus 0,5. Der Taschenrechner rechnet hier im Bogenmaß.' },
            ]}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Reicht die Leiter bis zum Fenster?',
      pflicht: ['schaetzen'],
      bedingung: 'Funke mindestens drei Schätzungen an den Gruppenführer (oder triff auf 5 cm genau), dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du bist in der Jugendfeuerwehr. Am Samstag übt deine Gruppe mit der Drehleiter am Schulgebäude. Die Leiter ist 30 m ausgefahren und
            um <M>{'70^\\circ'}</M> aufgerichtet, steiler darf sie bei dieser Übung nicht stehen. Ihre Spitze soll an der Hauswand anliegen.
          </p>
          <p className="sl-text">
            Im obersten Stock wartet eine Übungspuppe an einem Fenster, das 26 m über dem Drehpunkt der Leiter liegt. Gegeben sind also die
            Leiterlänge 30 m und der Winkel <M>{'70^\\circ'}</M>. Gesucht ist, wie hoch die Leiterspitze über dem Drehpunkt liegt.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Schätze, ohne zu rechnen</p>
            <p>
              Funke dem Gruppenführer deine Schätzung für die Höhe <M>h</M> der Leiterspitze. Er sagt dir nur, ob sie zu hoch oder zu niedrig ist.
              Schaffst du den Wert auf 5 cm genau?
            </p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 8 Minuten.</p>
          <figure className="sl-foto">
            <img
              src={uebungBild}
              width={1200}
              height={600}
              alt="Comic in zwei Bildern: Links das Drehleiterfahrzeug vor dem Schulgebäude, die Leiter ist 30 Meter lang und um 70 Grad aufgerichtet, die Höhe der Spitze ist mit einem Fragezeichen markiert. Rechts eine Sprechblase des Gruppenführers: Ich brauche die Höhe auf 5 Zentimeter genau. Das Fenster liegt 26 Meter über dem Drehpunkt."
            />
            <figcaption>Die Übung: Bekannt sind nur die Leiterlänge und der Winkel.</figcaption>
          </figure>
          <LeiterSchaetzung
            schaetzungen={schaetzungen}
            onSchaetzen={(h) => {
              const neu = [...schaetzungen, h];
              setSchaetzungen(neu);
              if (neu.length >= 3 || neu.some(istTreffer)) fertig.teil('schaetzen')();
            }}
          />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Der Einsatzplan für die Drehleiter',
      pflicht: ['rechnung', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne den Einsatzplan</p>
            <p>
              Die Drehleiter ist 30 m lang und um <M>{'70^\\circ'}</M> aufgerichtet. Berechne, wie hoch die Leiterspitze über dem Drehpunkt liegt
              (Höhe <M>h</M>) und wie weit der Drehpunkt von der Hauswand entfernt sein muss (Abstand <M>d</M>), damit die Spitze an der Wand anliegt.
              Runde auf zwei Nachkommastellen.
            </p>
            <p>
              Das Werkzeug dafür lernst du im Beispiel unten kennen: Mit Sinus und Kosinus berechnest du aus einer Seite und einem Winkel die
              fehlenden Seiten.
            </p>
          </div>
          <figure className="sl-foto">
            <img
              src={einsatzBild}
              width={1200}
              height={600}
              alt="Comic: Einsatzplan an einer Tafel im Feuerwehrauto. Ein rechtwinkliges Dreieck aus Leiter, Hauswand und Boden. Die Leiter ist 30 Meter lang, der Winkel am Drehpunkt beträgt 70 Grad. Die Höhe h und der Abstand d sind mit Fragezeichen markiert."
            />
          </figure>
          <BeispielMitVideo video={VIDEO_STRECKEN} videoTitel="Lernvideo: Streckenlänge mit Sinus, Kosinus und Tangens">
            <Beispiel offen title="Die Anlegeleiter im Gerätehaus" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('rechnung')();
                setGeloest(true);
              }}
              punkte={14}
              title="Der Einsatzplan"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'h', label: <>Wie hoch liegt die Leiterspitze über dem Drehpunkt?</>, expected: HOEHE, unit: 'm', tol: 0.011 },
                { kind: 'num', key: 'd', label: <>Wie weit muss der Drehpunkt von der Hauswand entfernt sein?</>, expected: ABSTAND, unit: 'm', tol: 0.011 },
              ]}
              loesungNachFehler
              solution={LOESUNG_KERN}
              help={
                <Hilfen
                  steps={[
                    <>Gehe vor wie im Beispiel: Benenne zuerst vom Winkel <M>{'70^\\circ'}</M> aus Hypotenuse, Gegenkathete und Ankathete.</>,
                    <>
                      Die Leiter (30 m) ist die Hypotenuse, die Höhe ist die Gegenkathete, der Abstand die Ankathete. Für die Höhe brauchst du den
                      Sinus, für den Abstand den Kosinus.
                    </>,
                    <>
                      <M>{'h = 30\\,\\text{m} \\cdot \\sin(70^\\circ)'}</M> und <M>{'d = 30\\,\\text{m} \\cdot \\cos(70^\\circ)'}</M>. Taschenrechner auf Grad (DEG) stellen.
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
              title="Meldung an den Gruppenführer"
              prompt={<p>Was meldest du dem Gruppenführer? Das Fenster liegt 26 m über dem Drehpunkt.</p>}
              options={[
                {
                  text: 'Reicht nicht: 30 m · cos(70°) ≈ 10,26 m, das ist viel weniger als 26 m.',
                  feedback: '10,26 m ist der Abstand am Boden (Ankathete). Die Höhe ist die Gegenkathete, dafür brauchst du den Sinus.',
                },
                {
                  text: 'Reicht: Die Spitze liegt etwa 28,19 m über dem Drehpunkt. Der Drehpunkt muss etwa 10,26 m vor der Wand stehen.',
                  correct: true,
                  feedback: 'Genau. 28,19 m sind mehr als 26 m. Die Leiter reicht, wenn das Fahrzeug im richtigen Abstand steht.',
                },
                {
                  text: 'Reicht immer: 30 m sind mehr als 26 m, der Winkel spielt keine Rolle.',
                  feedback: 'Die Leiter steht schräg. Je flacher sie steht, desto niedriger kommt die Spitze. Der Winkel entscheidet mit.',
                },
                {
                  text: 'Reicht: Der Drehpunkt muss etwa 28,19 m vor der Wand stehen.',
                  feedback: '28,19 m ist die Höhe. Der Abstand ist die Ankathete: 30 m · cos(70°) ≈ 10,26 m.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Spickzettel für die Jugendfeuerwehr">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={karteBild}
                width={800}
                height={400}
                alt="Comic: eine Karteikarte mit der Überschrift Fehlende Seite berechnen. Links eine kleine Skizze von Leiter, Wand und Boden, rechts drei nummerierte, noch leere Zeilen für die Schritte."
              />
            </figure>
            <p className="sl-text">
              Gestalte in deinem Heft oder auf einer Karteikarte einen Spickzettel für deine Gruppe: „Fehlende Seite berechnen in drei Schritten“.
              Zeichne Leiter, Wand und Boden als Dreieck, beschrifte Hypotenuse, Gegenkathete und Ankathete und schreibe die drei Schritte auf.
              Rechne als Beispiel den Einsatzplan der Drehleiter vor und schreibe die Meldung an den Gruppenführer dazu.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Schritt 1: Ich benenne die Seiten vom Winkel aus: …“</li>
                <li>„Schritt 2: Ich wähle die Winkelfunktion, in der die bekannte und die gesuchte Seite vorkommen: …“</li>
                <li>„Schritt 3: Ich stelle nach der gesuchten Seite um und rechne: …“</li>
                <li>„Meldung: Die Leiterspitze liegt … über dem Drehpunkt, das Fahrzeug muss …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Spickzettel vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien('an den Gruppenführer')} />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug schaetzungen={schaetzungen} />
              <Merke title="Fehlende Seiten im rechtwinkligen Dreieck berechnen">
                <ol>
                  <li>Seiten vom bekannten Winkel aus benennen: Hypotenuse, Gegenkathete, Ankathete.</li>
                  <li>Die Winkelfunktion wählen, in der die bekannte und die gesuchte Seite vorkommen.</li>
                  <li>Nach der gesuchten Seite umstellen, einsetzen und mit dem Taschenrechner (auf DEG) ausrechnen.</li>
                </ol>
                <p>Ist die Hypotenuse bekannt, gilt:</p>
                <MB>{'\\text{Gegenkathete} = \\text{Hypotenuse} \\cdot \\sin(\\alpha)'}</MB>
                <MB>{'\\text{Ankathete} = \\text{Hypotenuse} \\cdot \\cos(\\alpha)'}</MB>
                <p>Steht die gesuchte Seite im Nenner, teilst du am Ende durch die Winkelfunktion. Die Hypotenuse ist immer die längste Seite.</p>
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
          <Abschnitt titel="Übung 1: Der Fuß der Anlegeleiter">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Strecken-Einstieg: passende Rechnung wählen (Basis)"
              title="Übung 1"
              level="basis"
              prompt={
                <>
                  <div className="dl-skizze-klein">
                    <Dreieck
                      boden={Math.cos((72 * Math.PI) / 180)}
                      ruecken={Math.sin((72 * Math.PI) / 180)}
                      labels={{ boden: 'Abstand ?', ruecken: '', schraeg: 'Leiter 8 m' }}
                      winkelText="72°"
                      breite={420}
                      label="Anlegeleiter 8 Meter, um 72 Grad geneigt. Gesucht ist der Abstand des Fußes von der Wand."
                    />
                  </div>
                  <p>Eine 8 m lange Anlegeleiter steht unter <M>{'72^\\circ'}</M>. Mit welcher Rechnung bekommst du den Abstand ihres Fußes von der Wand?</p>
                </>
              }
              options={[
                { text: <M>{'8\\,\\text{m} \\cdot \\sin(72^\\circ)'}</M>, feedback: 'Damit berechnest du die Gegenkathete, also die Höhe an der Wand.' },
                { text: <M>{'8\\,\\text{m} \\cdot \\tan(72^\\circ)'}</M>, feedback: 'Der Tangens verbindet die beiden Katheten. Bekannt ist aber die Hypotenuse.' },
                { text: <M>{'8\\,\\text{m} \\cdot \\cos(72^\\circ)'}</M>, correct: true, feedback: 'Richtig: Der Abstand ist die Ankathete, die Leiter die Hypotenuse. Ergebnis etwa 2,47 m.' },
                { text: <M>{'\\dfrac{8\\,\\text{m}}{\\cos(72^\\circ)}'}</M>, feedback: 'Das wären fast 26 m, mehr als die Leiter lang ist. Die gesuchte Seite steht im Zähler, also wird multipliziert.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
              topic="Strecken-Einstieg: gesuchte Seite im Nenner (Standard)"
              title="Übung 2"
              level="standard"
              prompt={
                <>
                  <div className="dl-skizze-klein">
                    <Dreieck
                      boden={Math.cos((75 * Math.PI) / 180)}
                      ruecken={Math.sin((75 * Math.PI) / 180)}
                      labels={{ boden: '', ruecken: '18 m', schraeg: 'Leiter ?' }}
                      winkelText="75°"
                      breite={420}
                      label="Drehleiter um 75 Grad aufgerichtet, die Spitze soll 18 Meter über dem Drehpunkt liegen. Gesucht ist die Leiterlänge."
                    />
                  </div>
                  <p>
                    Die Spitze der Drehleiter soll bei <M>{'75^\\circ'}</M> genau 18 m über dem Drehpunkt liegen. Wie weit muss die Leiter ausgefahren
                    werden? Mia rechnet <M>{'18 \\cdot \\sin(75^\\circ) \\approx 17{,}39'}</M>, Tom rechnet <M>{'18 : \\sin(75^\\circ) \\approx 18{,}64'}</M>.
                  </p>
                </>
              }
              options={[
                { text: 'Mia, denn bei Sinus wird immer multipliziert.', feedback: 'Hier ist die Leiter gesucht, sie steht im Nenner: sin(75°) = 18 m : Leiter. Dann wird geteilt.' },
                { text: 'Keiner von beiden: Ohne zweite Seite braucht man den Satz des Pythagoras.', feedback: 'Ein Winkel und eine Seite reichen. Die Winkelfunktionen verbinden sie.' },
                {
                  text: 'Tom: Die Leiter steht im Nenner, also wird durch sin(75°) geteilt. Sie muss länger als 18 m sein.',
                  correct: true,
                  feedback: 'Genau. Aus sin(75°) = 18 m : Leiter folgt Leiter = 18 m : sin(75°) ≈ 18,64 m. Mias Leiter wäre kürzer als die Höhe, das geht nicht.',
                },
                { text: 'Beide, die Ergebnisse unterscheiden sich kaum.', feedback: 'Fast 1,30 m Unterschied sind bei einer Rettung viel. Nur eine Rechnung ist richtig.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Die Leiter ohne Längenanzeige">
            <TrackedCheck
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              topic="Strecken-Einstieg: Höhe mit dem Tangens (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <>
                  <p>
                    Der Drehpunkt steht 9 m vor der Hauswand, die Leiter ist um <M>{'68^\\circ'}</M> aufgerichtet. Wie hoch über dem Drehpunkt
                    trifft die Spitze die Wand? Ergänze den Ansatz und runde auf zwei Nachkommastellen.
                  </p>
                  <div className="dl-skizze-klein">
                    <Dreieck
                      boden={Math.cos((68 * Math.PI) / 180)}
                      ruecken={Math.sin((68 * Math.PI) / 180)}
                      labels={{ boden: '9 m', ruecken: 'h = ?', schraeg: 'Leiter' }}
                      winkelText="68°"
                      breite={420}
                      label="Drehleiter um 68 Grad aufgerichtet, Drehpunkt 9 Meter vor der Wand. Gesucht ist die Höhe h."
                    />
                  </div>
                </>
              }
              rechnung={[
                { l: ['h'], r: [{ luecke: 'a' }, '\\,\\text{m} \\cdot \\tan(68^\\circ)'] },
                { l: ['h'], r: [{ luecke: 'h', breit: true }, '\\,\\text{m}'] },
              ]}
              fields={[
                { kind: 'num', key: 'a', label: 'Ankathete', expected: 9 },
                { kind: 'num', key: 'h', label: 'h', expected: 9 * Math.tan((68 * Math.PI) / 180), tol: 0.011 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Seiten benennen', text: 'Abstand 9 m = Ankathete, gesuchte Höhe h = Gegenkathete. Beide Katheten: Tangens.' },
                    { titel: 'Tangens aufschreiben', tex: '\\tan(68^\\circ) = \\dfrac{h}{9\\,\\text{m}}' },
                    { titel: 'Nach h umstellen', tex: ['h = 9\\,\\text{m} \\cdot \\tan(68^\\circ)', 'h \\approx 22{,}28\\,\\text{m}'] },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Bekannt ist der Abstand am Boden, gesucht die Höhe an der Wand. Welche Seiten sind das vom Winkel aus?</>,
                    <>Abstand = Ankathete, Höhe = Gegenkathete. Der Tangens ist Gegenkathete durch Ankathete.</>,
                    <>
                      <M>{'h = 9\\,\\text{m} \\cdot \\tan(68^\\circ)'}</M>
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Reicht die 30-m-Leiter?">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              topic="Strecken-Einstieg: Hypotenuse berechnen (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Wegen geparkter Autos kann das Fahrzeug nur so stehen, dass der Drehpunkt 12 m vor der Hauswand liegt. Die Leiter soll unter{' '}
                  <M>{'65^\\circ'}</M> an der Wand anliegen. Wie lang muss sie ausgefahren werden? Reicht die 30 m lange Leiter?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'l', label: 'Leiterlänge:', expected: 12 / Math.cos((65 * Math.PI) / 180), unit: 'm', tol: 0.011 },
                { kind: 'select', key: 'r', label: 'Reicht die 30-m-Leiter?', options: ['Nein', 'Ja'], expected: 1 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Seiten benennen', text: 'Abstand 12 m = Ankathete, Leiter = Hypotenuse (gesucht). Ankathete und Hypotenuse: Kosinus.' },
                    { titel: 'Kosinus aufschreiben', tex: '\\cos(65^\\circ) = \\dfrac{12\\,\\text{m}}{\\text{Leiter}}' },
                    { titel: 'Nach der Leiter umstellen', tex: ['\\text{Leiter} = \\dfrac{12\\,\\text{m}}{\\cos(65^\\circ)}', '\\text{Leiter} \\approx 28{,}39\\,\\text{m}'] },
                    { titel: 'Antwort', text: '28,39 m < 30 m: Die Leiter reicht.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Welche Seite ist bekannt, welche gesucht? Benenne sie vom Winkel <M>{'65^\\circ'}</M> aus.</>,
                    <>Der Abstand ist die Ankathete, die Leiter die Hypotenuse. Beide stehen im Kosinus, die Leiter im Nenner.</>,
                    <>
                      <M>{'\\text{Leiter} = 12\\,\\text{m} : \\cos(65^\\circ)'}</M>. Vergleiche dann mit 30 m.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Höhe über der Straße">
            <CheckCard
              title="Wie hoch über der Straße?"
              level="erweiterung"
              profi
              punkte={9}
              prompt={
                <p>
                  Bei einem anderen Fahrzeug liegt der Drehpunkt der Leiter 3,20 m über der Straße. Die Leiter ist 25 m ausgefahren und um{' '}
                  <M>{'72^\\circ'}</M> aufgerichtet. Wie hoch über der Straße liegt die Leiterspitze? Runde auf zwei Nachkommastellen.
                </p>
              }
              fields={[{ kind: 'num', key: 'h', label: 'Höhe über der Straße:', expected: 3.2 + 25 * Math.sin((72 * Math.PI) / 180), unit: 'm', tol: 0.011 }]}
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Höhe über dem Drehpunkt', tex: ['h = 25\\,\\text{m} \\cdot \\sin(72^\\circ)', 'h \\approx 23{,}78\\,\\text{m}'] },
                    { titel: 'Höhe des Drehpunkts addieren', tex: '23{,}78\\,\\text{m} + 3{,}20\\,\\text{m} \\approx 26{,}98\\,\\text{m}' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Das Dreieck beginnt am Drehpunkt, nicht auf der Straße. Berechne zuerst die Höhe über dem Drehpunkt.</>,
                    <>Die Leiter ist die Hypotenuse, die Höhe die Gegenkathete: Sinus.</>,
                    <>
                      <M>{'25\\,\\text{m} \\cdot \\sin(72^\\circ) + 3{,}20\\,\\text{m}'}</M>
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={['1', '2', '3', '4'].every((n) => uebungen.includes(n))} titel="Leiter-Einsatz">
            <LeiterSpiel />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du berechnest jetzt fehlende Seiten im rechtwinkligen Dreieck mit Sinus, Kosinus und Tangens. Bei den Übungsaufgaben trainierst du das
              an vielen Dreiecken mit wechselnder Beschriftung.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Streckenlänge berechnen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Streckenlänge berechnen: Die Drehleiter"
      width="wide"
      kompakt
      parent={{ to: '/trigonometrie/rechtwinklig-strecken', label: 'Streckenlänge mit Sinus, Kosinus und Tangens' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA_DREHLEITER}
        bildwelt={BILDWELT}
        ziel={
          <>
            In dieser Lernsituation planst du mit der Jugendfeuerwehr einen Einsatz mit der Drehleiter. Du lernst, wie du im rechtwinkligen Dreieck
            aus einem Winkel und einer Seite die fehlenden Seiten berechnest.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Schätzungen aus Phase 2 */
function Rueckbezug({ schaetzungen }: { schaetzungen: number[] }) {
  if (!schaetzungen.length) return null;
  const beste = schaetzungen.reduce((a, b) => (Math.abs(b - HOEHE) < Math.abs(a - HOEHE) ? b : a));
  const z = (x: number) => x.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest geschätzt:</strong> {schaetzungen.length} {schaetzungen.length === 1 ? 'Schätzung' : 'Schätzungen'}, am nächsten dran war{' '}
        {z(beste)} m (daneben um {z(Math.abs(beste - HOEHE))} m). {istTreffer(beste) ? 'Ein Treffer!' : ''} Mit dem Sinus bekommst du den genauen Wert
        mit einer einzigen Rechnung: <M>{'h = 30\\,\\text{m} \\cdot \\sin(70^\\circ) \\approx 28{,}19\\,\\text{m}'}</M>. Die Leiter reicht also bis zum
        Fenster in 26 m Höhe.
      </p>
    </div>
  );
}
