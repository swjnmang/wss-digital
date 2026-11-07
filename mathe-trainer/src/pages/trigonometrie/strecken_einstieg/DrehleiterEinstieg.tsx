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
import LeiterSchaetzung, { ABSTAND, LEITER, istTreffer } from './LeiterSchaetzung';
import LeiterSpiel from './LeiterSpiel';
import titelBild from './bilder/drehleiter-titel.webp';
import uebungBild from './bilder/drehleiter-uebung.webp';
import einsatzBild from './bilder/drehleiter-einsatz.webp';
import karteBild from './bilder/drehleiter-karte.webp';
import '../../daten_und_zufall/lernpfad/lernpfad.css';
import './drehleiter.css';

// Lernsituation „Die Drehleiter“: Streckenlängen im rechtwinkligen Dreieck mit Sinus und Kosinus berechnen (ca. 60 bis 90 min).
// Format Entscheidungsfall: Bei der Übung der Jugendfeuerwehr wartet eine Übungspuppe an einem Fenster 26 m über dem Drehpunkt der Leiter.
// Die Leiter steht immer unter 70°. Wie weit muss sie ausgefahren werden, damit die Spitze genau am Fenster anliegt, und reicht die 30-m-Leiter?
// In „Problem erkennen“ tippen die SuS Leiterlängen ein; das Fahrzeug fährt so an die Wand, dass die Spitze an der Fassade anliegt, und die
// Skizze zeigt, ob sie unter, über oder am Fenster ankommt. Pythagoras hilft nicht: Bekannt ist nur eine Seite.
// Aha: Ein Winkel und eine Seite reichen. Leiter = 26 m : sin(70°) ≈ 27,67 m (die gesuchte Seite steht im Nenner), Abstand ≈ 9,46 m.
// Lernprodukt analog: Spickzettel (Karteikarte) „Fehlende Seite berechnen in drei Schritten“ mit Skizze und eigenem Beispiel.
// Identität: Themenfarbe Kupfer, Symbol Feuerlöscher, Titelbild Übungseinsatz mit Drehleiter, Leitobjekt die Drehleiter.
// Bildwelt Comic / Pop: Titelbild und Sachbilder sind gerenderte WebP-Dateien aus bilder-quelle/drehleiter-*.bild.html
// (Bausteine in bilder-quelle/_comic.js); Leiter-Skizze, Dreiecke und Spiel bleiben Inline-SVG.
// Punkte nach Aufwand (Pflicht 62): Warm-up 2/2/3/3/2 = 12 (19 %), Ausprobieren 3, Kernaufgabe 14, Entscheidung 4, Spickzettel 5
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
      alt="Comic in drei Bildern: Übung der Jugendfeuerwehr am Samstag. Ein Hochhaus, ein Drehleiterfahrzeug mit höchstens 30 Meter langer Leiter, um 70 Grad aufgerichtet, und ein Fenster 26 Meter hoch direkt an der Fassade mit der Frage: Wie weit muss die Leiter raus?"
    />
  ),
};
const BILDWELT: Bildwelt = { welt: 'comic', variante: 'pop' };

const LOESUNG_KERN = (
  <Loesungsweg
    schritte={[
      { titel: 'Seiten vom Winkel aus benennen', text: 'Höhe 26 m = Gegenkathete, Leiter L = Hypotenuse (gesucht), Abstand d = Ankathete (gesucht).' },
      { titel: 'Sinus aufschreiben', tex: '\\sin(70^\\circ) = \\dfrac{26\\,\\text{m}}{L}' },
      { titel: 'Beide Seiten mal L', tex: 'L \\cdot \\sin(70^\\circ) = 26\\,\\text{m}' },
      { titel: 'Beide Seiten durch sin(70°)', tex: ['L = \\dfrac{26\\,\\text{m}}{\\sin(70^\\circ)}', 'L \\approx 27{,}67\\,\\text{m}'] },
      { titel: 'Abstand mit dem Kosinus', tex: ['d = L \\cdot \\cos(70^\\circ)', 'd \\approx 9{,}46\\,\\text{m}'], text: 'Mit dem ungerundeten L weiterrechnen. Auch möglich: d = 26 m : tan(70°).' },
    ]}
  />
);

/* ── Rechenbeispiel: Anlegeleiter bis 5,80 m Höhe, 75° ─────────────────── */

const BSP_AUFGABE = (
  <p>
    Im Gerätehaus soll eine Anlegeleiter bis zu einer Luke in 5,80 m Höhe reichen. Sie wird um <M>{'75^\\circ'}</M> gegen den Boden geneigt
    aufgestellt. Wie lang muss die Leiter sein, und wie weit steht ihr Fuß von der Wand weg?
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
            labels={{ boden: 'Abstand ?', ruecken: 'Höhe 5,80 m', schraeg: 'Leiter ?' }}
            winkelText="75°"
            breite={460}
            label="Anlegeleiter um 75 Grad geneigt, sie soll 5,80 Meter hoch reichen. Gesucht sind die Länge der Leiter und der Abstand am Boden."
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
          Bekannt ist die Gegenkathete (Höhe), gesucht ist die Hypotenuse (Leiter). Beide kommen im Sinus vor. Der Sinus ist die Gegenkathete
          geteilt durch die Hypotenuse:
        </p>
        <MB>{'\\sin(75^\\circ) = \\dfrac{5{,}80\\,\\text{m}}{\\text{Leiter}}'}</MB>
      </>
    ),
  },
  {
    title: 'Nach der gesuchten Seite umstellen',
    body: (
      <>
        <p>Die gesuchte Leiter steht im Nenner. Multipliziere zuerst beide Seiten mit der Leiter:</p>
        <MB>{'\\text{Leiter} \\cdot \\sin(75^\\circ) = 5{,}80\\,\\text{m}'}</MB>
        <p>Teile dann beide Seiten durch <M>{'\\sin(75^\\circ)'}</M>:</p>
        <MB>{'\\text{Leiter} = \\dfrac{5{,}80\\,\\text{m}}{\\sin(75^\\circ)}'}</MB>
        <p>Tippe das in einem Zug in den Taschenrechner (auf Grad, DEG) und runde erst am Ende:</p>
        <MB>{'\\text{Leiter} \\approx 6{,}00\\,\\text{m}'}</MB>
        <p>Kurzer Check: Die Leiter ist länger als die Höhe. Das muss so sein, denn die Hypotenuse ist die längste Seite.</p>
      </>
    ),
  },
  {
    title: 'Den Abstand mit dem Kosinus berechnen',
    body: (
      <>
        <p>Jetzt kennst du die Leiter. Der Abstand ist die Ankathete. Der Kosinus ist die Ankathete geteilt durch die Hypotenuse:</p>
        <MB>{'\\cos(75^\\circ) = \\dfrac{\\text{Abstand}}{\\text{Leiter}}'}</MB>
        <p>Hier steht die gesuchte Seite im Zähler. Mal Leiter (ungerundet weiterrechnen):</p>
        <MB>{'\\text{Abstand} = \\text{Leiter} \\cdot \\cos(75^\\circ) \\approx 1{,}55\\,\\text{m}'}</MB>
      </>
    ),
  },
];

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function DrehleiterEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [schaetzungen, setSchaetzungen] = useSitzungState<number[]>('dl-versuche', []);
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
      titel: 'Wie weit muss die Leiter raus?',
      pflicht: ['schaetzen'],
      bedingung: 'Fahre die Leiter mindestens dreimal aus (oder triff die Länge auf 5 cm genau), dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du bist in der Jugendfeuerwehr. Am Samstag übt deine Gruppe mit der Drehleiter am Schulgebäude. Im obersten Stock wartet eine
            Übungspuppe an einem Fenster, das 26 m über dem Drehpunkt der Leiter liegt. Die Leiter wird um <M>{'70^\\circ'}</M> aufgerichtet, steiler
            darf sie bei dieser Übung nicht stehen. Ihre Spitze soll direkt am Fenster an der Hauswand anliegen. Ausfahren lässt sie sich höchstens 30 m.
          </p>
          <p className="sl-text">
            Gegeben sind also die Höhe des Fensters, 26 m über dem Drehpunkt, und der Winkel <M>{'70^\\circ'}</M>. Gesucht ist, wie weit die Leiter
            ausgefahren werden muss.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
            <p>
              Tippe ein, wie weit die Leiter ausgefahren werden soll. Das Fahrzeug fährt dann so an die Wand, dass die Spitze an der Fassade anliegt.
              Die Skizze zeigt, ob die Spitze unter, über oder genau am Fenster ankommt. Schaffst du die Länge auf 5 cm genau?
            </p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 8 Minuten.</p>
          <figure className="sl-foto">
            <img
              src={uebungBild}
              width={1200}
              height={600}
              alt="Comic in zwei Bildern: Links das Drehleiterfahrzeug vor dem Schulgebäude, die Leiter ist um 70 Grad aufgerichtet und liegt direkt am Fenster an der Fassade an. Das Fenster liegt 26 Meter über dem Drehpunkt, die Länge der Leiter ist mit einem Fragezeichen markiert. Rechts eine Sprechblase des Gruppenführers: Wie weit muss die Leiter raus? Auf 5 Zentimeter genau!"
            />
            <figcaption>Die Übung: Bekannt sind nur die Höhe des Fensters und der Winkel.</figcaption>
          </figure>
          <LeiterSchaetzung
            versuche={schaetzungen}
            onAusfahren={(h) => {
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
              Das Fenster liegt 26 m über dem Drehpunkt, die Leiter steht unter <M>{'70^\\circ'}</M>. Berechne, wie weit die Leiter ausgefahren werden
              muss (Länge <M>L</M>), damit ihre Spitze genau am Fenster anliegt, und wie weit der Drehpunkt dann von der Hauswand entfernt ist
              (Abstand <M>d</M>). Runde auf zwei Nachkommastellen.
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
              alt="Comic: Einsatzplan an einer Tafel im Feuerwehrauto. Ein rechtwinkliges Dreieck aus Leiter, Hauswand und Boden. Das Fenster an der Wand liegt 26 Meter hoch, der Winkel am Drehpunkt beträgt 70 Grad. Die Länge L der Leiter und der Abstand d sind mit Fragezeichen markiert."
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
                { kind: 'num', key: 'l', label: <>Wie weit muss die Leiter ausgefahren werden?</>, expected: LEITER, unit: 'm', tol: 0.011 },
                { kind: 'num', key: 'd', label: <>Wie weit ist der Drehpunkt dann von der Hauswand entfernt?</>, expected: ABSTAND, unit: 'm', tol: 0.011 },
              ]}
              loesungNachFehler
              solution={LOESUNG_KERN}
              help={
                <Hilfen
                  steps={[
                    <>Gehe vor wie im Beispiel: Benenne zuerst vom Winkel <M>{'70^\\circ'}</M> aus Hypotenuse, Gegenkathete und Ankathete.</>,
                    <>
                      Die Höhe (26 m) ist die Gegenkathete, die Leiter die Hypotenuse, der Abstand die Ankathete. Höhe und Leiter stehen im Sinus,
                      die Leiter steht dort im Nenner.
                    </>,
                    <>
                      <M>{'L = 26\\,\\text{m} : \\sin(70^\\circ)'}</M>, danach <M>{'d = L \\cdot \\cos(70^\\circ)'}</M>. Taschenrechner auf Grad (DEG) stellen.
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
              prompt={<p>Was meldest du dem Gruppenführer? Die Leiter lässt sich höchstens 30 m ausfahren.</p>}
              options={[
                {
                  text: 'Die Leiter auf 24,43 m ausfahren (26 m · sin(70°)), das reicht locker.',
                  feedback: 'Die Leiter kann nicht kürzer sein als die Höhe, denn sie ist die Hypotenuse. Die Leiter steht im Nenner: 26 m : sin(70°).',
                },
                {
                  text: 'Die Leiter auf etwa 27,67 m ausfahren, der Drehpunkt steht etwa 9,46 m vor der Wand. Die 30-m-Leiter reicht.',
                  correct: true,
                  feedback: 'Genau. 27,67 m sind weniger als 30 m. Mit dem richtigen Abstand liegt die Spitze genau am Fenster.',
                },
                {
                  text: 'Die Leiter auf genau 26 m ausfahren, denn das Fenster liegt 26 m hoch.',
                  feedback: 'Die Leiter steht schräg. Bei 26 m Länge bleibt ihre Spitze unter dem Fenster, erst eine senkrechte Leiter käme 26 m hoch.',
                },
                {
                  text: 'Die Leiter reicht nicht, denn 26 m : cos(70°) ≈ 76 m.',
                  feedback: 'Der Kosinus verbindet Ankathete und Hypotenuse. Die 26 m sind aber die Gegenkathete, also brauchst du den Sinus.',
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
                <li>„Meldung: Die Leiter muss auf … ausgefahren werden, das Fahrzeug steht …“</li>
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
                <p>Steht die gesuchte Seite im Zähler, multiplizierst du, zum Beispiel:</p>
                <MB>{'\\text{Gegenkathete} = \\text{Hypotenuse} \\cdot \\sin(\\alpha)'}</MB>
                <p>Steht die gesuchte Seite im Nenner, teilst du durch die Winkelfunktion, zum Beispiel:</p>
                <MB>{'\\text{Hypotenuse} = \\dfrac{\\text{Gegenkathete}}{\\sin(\\alpha)}'}</MB>
                <p>Die Hypotenuse ist immer die längste Seite. Damit kannst du dein Ergebnis prüfen.</p>
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
              topic="Strecken-Einstieg: gesuchte Seite im Zähler (Standard)"
              title="Übung 2"
              level="standard"
              prompt={
                <>
                  <div className="dl-skizze-klein">
                    <Dreieck
                      boden={Math.cos((70 * Math.PI) / 180)}
                      ruecken={Math.sin((70 * Math.PI) / 180)}
                      labels={{ boden: '', ruecken: 'Höhe ?', schraeg: 'Leiter 30 m' }}
                      winkelText="70°"
                      breite={420}
                      label="Drehleiter 30 Meter, um 70 Grad aufgerichtet. Gesucht ist die Höhe der Spitze über dem Drehpunkt."
                    />
                  </div>
                  <p>
                    Jetzt wird die Leiter ganz ausgefahren, auf 30 m, und wieder um <M>{'70^\\circ'}</M> aufgerichtet. Wie hoch über dem Drehpunkt liegt
                    die Spitze? Mia rechnet <M>{'30 \\cdot \\sin(70^\\circ) \\approx 28{,}19'}</M>, Tom rechnet <M>{'30 : \\sin(70^\\circ) \\approx 31{,}93'}</M>.
                  </p>
                </>
              }
              options={[
                { text: 'Tom, denn beim Sinus wird immer geteilt.', feedback: 'Hier ist die Höhe gesucht, sie steht im Zähler: sin(70°) = Höhe : 30 m. Dann wird mit 30 m multipliziert.' },
                { text: 'Keiner von beiden: Ohne zweite Seite braucht man den Satz des Pythagoras.', feedback: 'Ein Winkel und eine Seite reichen. Die Winkelfunktionen verbinden sie.' },
                {
                  text: 'Mia: Die Höhe steht im Zähler, also wird mit 30 m multipliziert. Sie muss kleiner als 30 m sein.',
                  correct: true,
                  feedback: 'Genau. Aus sin(70°) = Höhe : 30 m folgt Höhe = 30 m · sin(70°) ≈ 28,19 m. Toms Höhe wäre größer als die Leiter lang ist, das geht nicht.',
                },
                { text: 'Beide, es kommt auf den Taschenrechner an.', feedback: 'Fast 4 m Unterschied: Nur eine Rechnung passt zur Formel. Prüfe, ob die gesuchte Seite im Zähler oder im Nenner steht.' },
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
                { l: ['h'], r: [{ luecke: 'h', breit: true }] },
              ]}
              fields={[
                { kind: 'num', key: 'a', label: 'Ankathete', expected: 9 },
                { kind: 'num', key: 'h', label: 'h', unit: 'm', expected: 9 * Math.tan((68 * Math.PI) / 180), tol: 0.011 },
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
  const beste = schaetzungen.reduce((a, b) => (Math.abs(b - LEITER) < Math.abs(a - LEITER) ? b : a));
  const z = (x: number) => x.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest probiert:</strong> {schaetzungen.length} {schaetzungen.length === 1 ? 'Leiterlänge' : 'Leiterlängen'}, am nächsten dran war{' '}
        {z(beste)} m (daneben um {z(Math.abs(beste - LEITER))} m). {istTreffer(beste) ? 'Ein Treffer!' : ''} Mit dem Sinus bekommst du die genaue Länge
        mit einer einzigen Rechnung: <M>{'L = 26\\,\\text{m} : \\sin(70^\\circ) \\approx 27{,}67\\,\\text{m}'}</M>. Die 30-m-Leiter reicht also bis zum
        Fenster.
      </p>
    </div>
  );
}
