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
import WinkelSchaetzer, { istTreffer, MODUL, WINKEL } from './WinkelSchaetzer';
import SonnenSpiel from './SonnenSpiel';
import titelBild from './bilder/balkonkraftwerk-titel.webp';
import dachBild from './bilder/balkonkraftwerk-dach.webp';
import stuetzeBild from './bilder/balkonkraftwerk-stuetze.webp';
import nachrichtBild from './bilder/balkonkraftwerk-nachricht.webp';
import '../../daten_und_zufall/lernpfad/lernpfad.css';
import './balkonkraftwerk.css';

// Lernsituation „Das Balkonkraftwerk“: Winkel im rechtwinkligen Dreieck mit sin⁻¹, cos⁻¹ und tan⁻¹ berechnen (ca. 60 bis 90 min).
// Format Experimentierlabor: Aylas Familie stellt ein Solarmodul (1,72 m) auf das flache Garagendach. Für viel Strom soll es 30° bis 35°
// geneigt sein. Ayla hat die Stütze auf 0,80 m gestellt und meint: „Das sind locker 30°.“ Im Winkel-Labor legen die SuS ihre Schätzungen
// über das Modul und treffen den Winkel auf ein halbes Grad kaum. In „Problem lösen“ lernen sie die Umkehrfunktion kennen.
// Aha: 0,80 m sieht steil aus, sind aber nur etwa 27,7°. Mit der zweiten Lochposition 0,95 m sind es etwa 33,5°.
// Lernprodukt analog: Nachricht an Aylas Familie mit Skizze, Rechnung und Empfehlung (Brief bzw. Chatnachricht im Heft).
// Identität: Themenfarbe Petrol (Umwelt, Energie), Symbol Solarmodul, Titelbild Garage mit Modul auf schwebender Insel, Leitobjekt das Solarmodul.
// Bildwelt Diorama / Sommerwiese: Titelbild und Sachbilder sind gerenderte WebP-Dateien aus bilder-quelle/balkonkraftwerk-*.bild.html
// (Bausteine in bilder-quelle/_iso.js); Winkel-Labor, Dreiecke und Spiel bleiben Inline-SVG.
// Punkte nach Aufwand (Pflicht 61): Warm-up 2/2/2/2/3 = 11 (18 %), Schätzen 3, Kernaufgabe 14, Entscheidung 4, Nachricht 5
// (Problem lösen 23 = 38 %), Übungen 4/6/6/8 = 24 (39 %); Profi 9; Bonus-Spiel „Sonnenfänger“ höchstens 8.

/** Lernvideo zum Thema (auch bei den Übungsaufgaben unter /trigonometrie/rechtwinklig-winkel verlinkt) */
export const VIDEO_WINKEL = 'https://www.youtube.com/watch?v=EsW65RuykZ8';

const STUETZE_2 = 0.95;
const WINKEL_2 = (Math.asin(STUETZE_2 / MODUL) * 180) / Math.PI;
const rad = (g: number) => (g * Math.PI) / 180;

/* ── Identität ───────────────────────────────────────────────────────────── */

export const THEMA_BALKONKRAFTWERK: Thema = {
  name: 'Das Balkonkraftwerk',
  farbe: 'petrol',
  icon: 'fa-solar-panel',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Kleine 3D-Welt auf einer schwebenden Wiese: ein Wohnhaus mit Garage, auf dem flachen Garagendach steht ein schräges Solarmodul, 1,72 Meter lang, hinten auf einer Stütze. Die Sonne scheint, ein Schild zeigt: Neigung ideal 30 bis 35 Grad."
    />
  ),
};
const BILDWELT: Bildwelt = { welt: 'diorama', variante: 'sommerwiese' };

const LOESUNG_KERN = (
  <Loesungsweg
    schritte={[
      { titel: 'Seiten vom Winkel aus benennen', text: 'Modul 1,72 m = Hypotenuse, Stütze = Gegenkathete. Gegenkathete und Hypotenuse: Sinus.' },
      { titel: 'Sinus für 0,80 m aufschreiben', tex: '\\sin(\\alpha) = \\dfrac{0{,}80\\,\\text{m}}{1{,}72\\,\\text{m}}' },
      { titel: 'Winkel mit der Umkehrfunktion', tex: ['\\alpha = \\sin^{-1}\\left(\\dfrac{0{,}80}{1{,}72}\\right)', '\\alpha \\approx 27{,}7^\\circ'] },
      { titel: 'Sinus für 0,95 m aufschreiben', tex: '\\sin(\\alpha) = \\dfrac{0{,}95\\,\\text{m}}{1{,}72\\,\\text{m}}' },
      { titel: 'Winkel mit der Umkehrfunktion', tex: ['\\alpha = \\sin^{-1}\\left(\\dfrac{0{,}95}{1{,}72}\\right)', '\\alpha \\approx 33{,}5^\\circ'] },
    ]}
  />
);

/* ── Rechenbeispiel: Modul auf dem Carport 2,00 m, Stütze 0,60 m ───────── */

const BSP_AUFGABE = (
  <p>
    Auf dem Carport der Nachbarn steht ein Solarmodul, das 2,00 m lang ist. Hinten hält es eine Stütze mit 0,60 m Höhe. Wie stark ist das Modul
    geneigt?
  </p>
);
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Die Seiten vom Winkel aus benennen',
    body: (
      <>
        <p>
          Modul, Stütze und Carportdach bilden ein rechtwinkliges Dreieck. Vom Neigungswinkel <M>\alpha</M> unten aus ist das Modul die Hypotenuse
          (es liegt dem rechten Winkel an der Stütze gegenüber). Die Stütze liegt <M>\alpha</M> gegenüber, sie ist die Gegenkathete.
        </p>
        <div className="bkw-skizze-klein">
          <Dreieck
            boden={Math.cos(Math.asin(0.3))}
            ruecken={0.3}
            labels={{ boden: '', ruecken: 'Stütze 0,60 m', schraeg: 'Modul 2,00 m' }}
            winkelText="α = ?"
            breite={520}
            label="Modul 2,00 Meter, Stütze 0,60 Meter, rechter Winkel an der Stütze. Gesucht ist der Neigungswinkel Alpha."
          />
        </div>
      </>
    ),
  },
  {
    title: 'Das passende Seitenverhältnis bilden',
    body: (
      <>
        <p>Gegenkathete und Hypotenuse kommen im Sinus vor. Der Sinus von <M>\alpha</M> ist die Gegenkathete geteilt durch die Hypotenuse:</p>
        <MB>{'\\sin(\\alpha) = \\dfrac{0{,}60\\,\\text{m}}{2{,}00\\,\\text{m}} = 0{,}3'}</MB>
        <p>Jetzt kennst du das Verhältnis, aber noch nicht den Winkel.</p>
      </>
    ),
  },
  {
    title: 'Den Winkel mit der Umkehrfunktion berechnen',
    body: (
      <>
        <p>
          Bisher hast du einen Winkel in den Taschenrechner eingegeben und ein Seitenverhältnis bekommen. Jetzt brauchst du den umgekehrten Weg:
          Verhältnis hinein, Winkel heraus. Das macht die <strong>Umkehrfunktion</strong> des Sinus. Man schreibt sie <M>{'\\sin^{-1}'}</M> und liest
          „Sinus hoch minus eins“ oder „Arkussinus“. Auf dem Taschenrechner erreichst du sie meist mit SHIFT (oder 2nd) und dann sin.
        </p>
        <MB>{'\\alpha = \\sin^{-1}(0{,}3)'}</MB>
        <p>Stelle den Taschenrechner auf Grad (DEG). Tippe den Bruch am besten gleich mit ein und runde erst am Ende:</p>
        <MB>{'\\alpha = \\sin^{-1}\\left(\\dfrac{0{,}60}{2{,}00}\\right) \\approx 17{,}5^\\circ'}</MB>
      </>
    ),
  },
  {
    title: 'Für die anderen Verhältnisse gilt dasselbe',
    body: (
      <>
        <p>
          Kennst du die Ankathete und die Hypotenuse, nimmst du die Umkehrfunktion des Kosinus, <M>{'\\cos^{-1}'}</M>. Kennst du beide Katheten,
          nimmst du die Umkehrfunktion des Tangens, <M>{'\\tan^{-1}'}</M>.
        </p>
        <p>
          Kurzer Check: <M>{'\\sin(17{,}5^\\circ) \\approx 0{,}30'}</M>. Das passt zum Verhältnis von Stütze und Modul.
        </p>
      </>
    ),
  },
];

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function BalkonkraftwerkEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [schaetzungen, setSchaetzungen] = useSitzungState<number[]>('bkw-schaetzungen', []);
  const [geloest, setGeloest] = useSitzungState('bkw-geloest', false);
  const [uebungen, setUebungen] = useSitzungState<string[]>('bkw-uebungen', []);
  const uebung = (nr: string, fertig: () => void) => () => {
    fertig();
    setUebungen((u) => (u.includes(nr) ? u : [...u, nr]));
  };

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen auf dem Garagendach',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 10 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Passende Winkelfunktion"
            rechnen={false}
            prompt={<p>Du kennst vom Winkel <M>\alpha</M> aus die Gegenkathete und die Hypotenuse. Welche Winkelfunktion verbindet die beiden?</p>}
            fields={[{ kind: 'select', key: 'f', label: 'Winkelfunktion:', options: ['Kosinus', 'Sinus', 'Tangens'], expected: 1 }]}
            solution={<p>Der Sinus ist Gegenkathete durch Hypotenuse.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) Sinus als Zahl"
            prompt={
              <>
                <div className="bkw-skizze-klein">
                  <Dreieck
                    boden={4}
                    ruecken={3}
                    labels={{ boden: '4 cm', ruecken: '3 cm', schraeg: '5 cm' }}
                    breite={380}
                    label="Rechtwinkliges Dreieck mit den Seiten 4 cm unten, 3 cm hinten und 5 cm schräg. Winkel Alpha unten vorne."
                  />
                </div>
                <p>Wie groß ist <M>{'\\sin(\\alpha)'}</M> in diesem Dreieck?</p>
              </>
            }
            fields={[{ kind: 'num', key: 's', label: <M>{'\\sin(\\alpha) ='}</M>, expected: 0.6, tol: 0.0051 }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Seiten benennen', text: 'Gegenkathete 3 cm, Hypotenuse 5 cm.' },
                  { titel: 'Sinus bilden', tex: '\\sin(\\alpha) = \\dfrac{3}{5} = 0{,}6' },
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Tangens als Zahl"
            prompt={
              <p>
                In einem rechtwinkligen Dreieck ist die Gegenkathete von <M>\alpha</M> 0,9 m und die Ankathete 1,5 m lang. Wie groß ist{' '}
                <M>{'\\tan(\\alpha)'}</M>?
              </p>
            }
            fields={[{ kind: 'num', key: 't', label: <M>{'\\tan(\\alpha) ='}</M>, expected: 0.6, tol: 0.0051 }]}
            solution={<Loesungsweg schritte={[{ titel: 'Tangens bilden', tex: '\\tan(\\alpha) = \\dfrac{0{,}9}{1{,}5} = 0{,}6' }]} />}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Welcher Winkel passt?"
            prompt={
              <p>
                Für welchen dieser Winkel ist der Sinus genau <M>{'0{,}5'}</M>? Probiere die Winkel mit dem Taschenrechner aus (auf DEG).
              </p>
            }
            fields={[{ kind: 'select', key: 'w', label: 'Winkel:', options: ['20°', '30°', '45°', '60°'], expected: 1 }]}
            solution={<p><M>{'\\sin(30^\\circ) = 0{,}5'}</M>. Für 20°, 45° und 60° kommen 0,34, 0,71 und 0,87 heraus.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={3}
            title="e) Der zweite spitze Winkel"
            prompt={
              <p>
                In einem rechtwinkligen Dreieck ist <M>{'\\alpha = 27{,}7^\\circ'}</M>. Wie groß ist der andere spitze Winkel <M>\beta</M>?
              </p>
            }
            rechnung={[{ l: ['\\beta'], r: [{ luecke: 'b' }] }]}
            fields={[{ kind: 'num', key: 'b', label: 'β', expected: 62.3, unit: '°', tol: 0.051 }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Winkelsumme im Dreieck', tex: '\\alpha + \\beta + 90^\\circ = 180^\\circ' },
                  { titel: 'Nach β auflösen', tex: '\\beta = 180^\\circ - 90^\\circ - 27{,}7^\\circ = 62{,}3^\\circ' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Alle drei Winkel eines Dreiecks ergeben zusammen <M>{'180^\\circ'}</M>.</>,
                  <>Einer der Winkel ist der rechte Winkel mit <M>{'90^\\circ'}</M>.</>,
                  <>
                    <M>{'\\beta = 90^\\circ - 27{,}7^\\circ'}</M>
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
      titel: 'Ist das Modul steil genug?',
      pflicht: ['schaetzen'],
      bedingung: 'Zeichne mindestens drei Schätzungen ein (oder triff auf ein halbes Grad genau), dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Deine Freundin Ayla und ihre Familie haben ein Balkonkraftwerk gekauft. Das Solarmodul kommt auf das flache Garagendach. Damit es übers
            Jahr möglichst viel Strom liefert, soll es nach Süden zeigen und zwischen <M>{'30^\\circ'}</M> und <M>{'35^\\circ'}</M> gegen das Dach
            geneigt sein.
          </p>
          <p className="sl-text">
            Das Modul ist 1,72 m lang. Hinten hält es eine Stütze mit Lochraster, die Ayla auf 0,80 m Höhe gestellt hat. „Das sind locker{' '}
            <M>{'30^\\circ'}</M>“, meint sie. Gegeben sind also die Modullänge 1,72 m und die Stützenhöhe 0,80 m. Gesucht ist der Neigungswinkel{' '}
            <M>\alpha</M>.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Schätze, ohne zu rechnen</p>
            <p>
              Gib im Winkel-Labor deine Schätzung für <M>\alpha</M> ein. Das Labor legt sie als Linie über das Modul. Schaffst du den Winkel auf ein
              halbes Grad genau? Hat Ayla recht?
            </p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 8 Minuten.</p>
          <figure className="sl-foto">
            <img
              src={dachBild}
              width={1200}
              height={600}
              alt="Kleine 3D-Welt: das flache Garagendach mit dem schräg aufgestellten Solarmodul. Beschriftet sind Modul 1,72 Meter und Stütze 0,80 Meter, der Neigungswinkel ist mit Alpha gleich Fragezeichen markiert. Ein Schild zeigt: ideal 30 bis 35 Grad."
            />
            <figcaption>Das Modul auf dem Garagendach: Zwei Seiten sind bekannt, der Winkel nicht.</figcaption>
          </figure>
          <WinkelSchaetzer
            schaetzungen={schaetzungen}
            onSchaetzen={(g) => {
              const neu = [...schaetzungen, g];
              setSchaetzungen(neu);
              if (neu.length >= 3 || neu.some(istTreffer)) fertig.teil('schaetzen')();
            }}
          />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die richtige Stützenhöhe für das Modul',
      pflicht: ['rechnung', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne den Neigungswinkel</p>
            <p>
              Das Modul ist 1,72 m lang. Die Stütze hat zwei Lochpositionen: 0,80 m (so hat Ayla sie gestellt) und 0,95 m. Berechne für beide
              Stützenhöhen den Neigungswinkel <M>\alpha</M> auf eine Nachkommastelle genau. Welche Position liegt zwischen <M>{'30^\\circ'}</M> und{' '}
              <M>{'35^\\circ'}</M>?
            </p>
            <p>
              Das Werkzeug dafür lernst du im Beispiel unten kennen: Mit der Umkehrfunktion macht der Taschenrechner aus einem Seitenverhältnis den
              Winkel.
            </p>
          </div>
          <figure className="sl-foto">
            <img
              src={stuetzeBild}
              width={1200}
              height={600}
              alt="Kleine 3D-Welt: Seitenansicht des Solarmoduls auf dem Garagendach. Das Modul ist 1,72 Meter lang, die Stütze hat zwei markierte Löcher bei 0,80 Meter und 0,95 Meter Höhe. Der Neigungswinkel Alpha ist mit Fragezeichen markiert."
            />
          </figure>
          <BeispielMitVideo video={VIDEO_WINKEL} videoTitel="Lernvideo: Winkel berechnen mit Sinus, Kosinus und Tangens">
            <Beispiel offen title="Das Modul auf dem Carport" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('rechnung')();
                setGeloest(true);
              }}
              punkte={14}
              title="Der Neigungswinkel"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'a1', label: <>Wie groß ist <M>\alpha</M>, wenn die Stütze 0,80 m hoch ist?</>, expected: WINKEL, unit: '°', tol: 0.051 },
                { kind: 'num', key: 'a2', label: <>Wie groß ist <M>\alpha</M>, wenn die Stütze 0,95 m hoch ist?</>, expected: WINKEL_2, unit: '°', tol: 0.051 },
              ]}
              loesungNachFehler
              solution={LOESUNG_KERN}
              help={
                <Hilfen
                  steps={[
                    <>Gehe vor wie im Beispiel: Benenne vom Winkel <M>\alpha</M> aus das Modul und die Stütze.</>,
                    <>
                      Das Modul ist die Hypotenuse, die Stütze die Gegenkathete. Bilde den Sinus und nutze dann die Umkehrfunktion <M>{'\\sin^{-1}'}</M>.
                    </>,
                    <>
                      <M>{'\\alpha = \\sin^{-1}(0{,}80 : 1{,}72)'}</M> und <M>{'\\alpha = \\sin^{-1}(0{,}95 : 1{,}72)'}</M>. Taschenrechner auf Grad (DEG).
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
              title="Empfehlung an Ayla"
              prompt={<p>Was empfiehlst du Ayla?</p>}
              options={[
                {
                  text: 'Die Stütze bleibt auf 0,80 m: 27,7° ist fast 30°, das reicht.',
                  feedback: '27,7° liegt unter dem empfohlenen Bereich von 30° bis 35°. Ayla hat sich verschätzt.',
                },
                {
                  text: 'Die Stütze auf 0,95 m stellen: Dann ist das Modul etwa 33,5° geneigt, das liegt zwischen 30° und 35°.',
                  correct: true,
                  feedback: 'Genau. Mit 0,95 m liegt der Winkel im empfohlenen Bereich.',
                },
                {
                  text: 'Die Stütze auf 0,95 m stellen, denn tan⁻¹(0,95 : 1,72) ≈ 28,9°.',
                  feedback: 'Das Modul ist die Hypotenuse. Stütze und Modul stehen im Sinus, nicht im Tangens.',
                },
                {
                  text: 'Ohne Winkelmesser lässt sich das nicht entscheiden.',
                  feedback: 'Doch: Aus zwei Seiten berechnet die Umkehrfunktion den Winkel.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Nachricht an Aylas Familie">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={nachrichtBild}
                width={800}
                height={400}
                alt="Kleine 3D-Welt: ein großes Smartphone auf der Wiese, auf dem Bildschirm eine angefangene Nachricht mit der Anrede Hallo Familie Yilmaz, einer kleinen Skizze eines Dreiecks und leeren Zeilen."
              />
            </figure>
            <p className="sl-text">
              Schreibe in dein Heft eine Nachricht an Aylas Familie. Zeichne das Modul mit Stütze als Dreieck, beschrifte die Seiten und den Winkel
              und rechne beide Stützenhöhen vor. Gib eine klare Empfehlung, auf welches Loch die Stütze gehört.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Hallo Familie Yilmaz, ich habe nachgerechnet, wie stark euer Modul geneigt ist.“</li>
                <li>„Das Modul ist die Hypotenuse, die Stütze ist …“</li>
                <li>„Mit der Umkehrfunktion des Sinus bekomme ich …“</li>
                <li>„Ich empfehle euch …, weil …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Nachricht vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien('an Aylas Familie')} />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug schaetzungen={schaetzungen} />
              <Merke title="Winkel im rechtwinkligen Dreieck berechnen">
                <ol>
                  <li>Seiten vom gesuchten Winkel aus benennen: Hypotenuse, Gegenkathete, Ankathete.</li>
                  <li>Mit den zwei bekannten Seiten das passende Seitenverhältnis bilden.</li>
                  <li>Mit der Umkehrfunktion den Winkel berechnen (Taschenrechner auf DEG, SHIFT + sin, cos oder tan).</li>
                </ol>
                <MB>{'\\alpha = \\sin^{-1}\\left(\\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}\\right)'}</MB>
                <MB>{'\\alpha = \\cos^{-1}\\left(\\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}\\right)'}</MB>
                <MB>{'\\alpha = \\tan^{-1}\\left(\\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}}\\right)'}</MB>
                <p>Den zweiten spitzen Winkel bekommst du über die Winkelsumme: <M>{'\\beta = 90^\\circ - \\alpha'}</M>.</p>
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
          <Abschnitt titel="Übung 1: Die richtige Eingabe">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Winkel-Einstieg: Umkehrfunktion wählen (Basis)"
              title="Übung 1"
              level="basis"
              prompt={
                <>
                  <div className="bkw-skizze-klein">
                    <Dreieck
                      boden={9}
                      ruecken={4}
                      labels={{ boden: '9 cm', ruecken: '4 cm', schraeg: '' }}
                      winkelText="α = ?"
                      breite={440}
                      label="Rechtwinkliges Dreieck: unten 9 cm, hinten 4 cm, die schräge Seite ist unbekannt. Gesucht ist der Winkel Alpha unten vorne."
                    />
                  </div>
                  <p>Mit welcher Eingabe bekommst du <M>\alpha</M>?</p>
                </>
              }
              options={[
                { text: <M>{'\\sin^{-1}\\left(\\dfrac{4}{9}\\right)'}</M>, feedback: '9 cm ist nicht die Hypotenuse, sondern die Ankathete. Zwei Katheten gehören in den Tangens.' },
                { text: <M>{'\\tan\\left(\\dfrac{4}{9}\\right)'}</M>, feedback: 'Ohne die Umkehrfunktion bekommst du keinen Winkel, sondern wieder ein Verhältnis.' },
                { text: <M>{'\\tan^{-1}\\left(\\dfrac{9}{4}\\right)'}</M>, feedback: 'Zähler und Nenner sind vertauscht. Das wäre der Winkel oben, also β.' },
                { text: <M>{'\\tan^{-1}\\left(\\dfrac{4}{9}\\right)'}</M>, correct: true, feedback: 'Richtig: Gegenkathete durch Ankathete, dann die Umkehrfunktion. Ergebnis etwa 24,0°.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
              topic="Winkel-Einstieg: Hypotenuse erkennen (Standard)"
              title="Übung 2"
              level="standard"
              prompt={
                <p>
                  Für den Rasenmäher bekommt die Garage eine Rampe. Sie überwindet 0,50 m Höhe, die schräge Rampenfläche ist 4,00 m lang. Mia
                  rechnet <M>{'\\tan^{-1}(0{,}50 : 4{,}00) \\approx 7{,}1^\\circ'}</M>, Tom rechnet <M>{'\\sin^{-1}(0{,}50 : 4{,}00) \\approx 7{,}2^\\circ'}</M>.
                </p>
              }
              options={[
                { text: 'Mia: Bei Rampen nimmt man immer den Tangens.', feedback: 'Der Tangens braucht beide Katheten. Die 4,00 m sind aber die schräge Fläche, also die Hypotenuse.' },
                { text: 'Beide: 7,1° und 7,2° sind praktisch gleich.', feedback: 'Bei flachen Rampen liegen die Werte nah beieinander, nur ein Ansatz ist aber richtig. Bei steileren Rampen wird der Unterschied groß.' },
                {
                  text: 'Tom: Die 4,00 m sind die schräge Fläche, also die Hypotenuse. Höhe durch Hypotenuse ist der Sinus.',
                  correct: true,
                  feedback: 'Genau. Erst die Seiten benennen, dann die Umkehrfunktion wählen.',
                },
                { text: 'Keiner: Man muss den Kosinus nehmen.', feedback: 'Die Höhe liegt dem Winkel gegenüber, sie ist die Gegenkathete. Der Kosinus bräuchte die Ankathete.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Das Hausdach">
            <TrackedCheck
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              topic="Winkel-Einstieg: Kosinus umkehren und zweiter Winkel (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <>
                  <p>
                    Auf das Hausdach sollen weitere Module. Ein Dachsparren ist 5,20 m lang (schräg), waagrecht überspannt er 4,50 m. Berechne die
                    Dachneigung <M>\alpha</M> und den Winkel <M>\beta</M> oben am First (je auf eine Nachkommastelle).
                  </p>
                  <div className="bkw-skizze-klein">
                    <Dreieck
                      boden={4.5}
                      ruecken={Math.sqrt(5.2 ** 2 - 4.5 ** 2)}
                      winkel="beide"
                      labels={{ boden: '4,50 m', ruecken: '', schraeg: '5,20 m' }}
                      breite={480}
                      label="Halbes Dachprofil als rechtwinkliges Dreieck: waagrecht 4,50 Meter, Sparren schräg 5,20 Meter. Markiert sind Alpha unten und Beta oben."
                    />
                  </div>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'a', label: <M>\alpha \approx</M>, expected: (Math.acos(4.5 / 5.2) * 180) / Math.PI, unit: '°', tol: 0.051 },
                { kind: 'num', key: 'b', label: <M>\beta \approx</M>, expected: 90 - (Math.acos(4.5 / 5.2) * 180) / Math.PI, unit: '°', tol: 0.051 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Seiten benennen', text: 'Sparren 5,20 m = Hypotenuse, waagrechte 4,50 m = Ankathete von α. Ankathete und Hypotenuse: Kosinus.' },
                    { titel: 'Winkel mit der Umkehrfunktion', tex: ['\\alpha = \\cos^{-1}\\left(\\dfrac{4{,}50}{5{,}20}\\right)', '\\alpha \\approx 30{,}1^\\circ'] },
                    { titel: 'Zweiten Winkel über die Winkelsumme', tex: '\\beta = 90^\\circ - 30{,}1^\\circ = 59{,}9^\\circ' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Welche Seite ist die Hypotenuse, welche liegt am Winkel <M>\alpha</M> an?</>,
                    <>Ankathete und Hypotenuse sind bekannt, also brauchst du <M>{'\\cos^{-1}'}</M>.</>,
                    <>
                      <M>{'\\alpha = \\cos^{-1}(4{,}50 : 5{,}20)'}</M>, dann <M>{'\\beta = 90^\\circ - \\alpha'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Genau 35°">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              topic="Winkel-Einstieg: umgekehrte Aufgabe (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Aylas Nachbar hat eine stufenlos verstellbare Stütze. Sein Modul ist ebenfalls 1,72 m lang und soll genau <M>{'35^\\circ'}</M> geneigt
                  sein. Wie hoch muss die Stütze sein? Wie weit ist der Fuß der Stütze waagrecht von der Unterkante des Moduls entfernt? Runde auf
                  zwei Nachkommastellen.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'h', label: 'Stütze:', expected: 1.72 * Math.sin(rad(35)), unit: 'm', tol: 0.0051 },
                { kind: 'num', key: 'w', label: 'waagrecht:', expected: 1.72 * Math.cos(rad(35)), unit: 'm', tol: 0.0051 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Stütze mit dem Sinus', tex: ['\\text{Stütze} = 1{,}72\\,\\text{m} \\cdot \\sin(35^\\circ)', '\\text{Stütze} \\approx 0{,}99\\,\\text{m}'] },
                    { titel: 'Waagrechten Abstand mit dem Kosinus', tex: ['\\text{waagrecht} = 1{,}72\\,\\text{m} \\cdot \\cos(35^\\circ)', '\\text{waagrecht} \\approx 1{,}41\\,\\text{m}'] },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Jetzt ist der Winkel bekannt und Seiten sind gesucht. Das kennst du schon: Seiten mit Sinus und Kosinus berechnen.</>,
                    <>Das Modul ist die Hypotenuse. Die Stütze ist die Gegenkathete, der waagrechte Abstand die Ankathete.</>,
                    <>
                      <M>{'1{,}72 \\cdot \\sin(35^\\circ)'}</M> und <M>{'1{,}72 \\cdot \\cos(35^\\circ)'}</M>
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Das selbstgebaute Gestell">
            <CheckCard
              title="Winkel und Modullänge"
              level="erweiterung"
              profi
              punkte={9}
              prompt={
                <p>
                  Ayla baut für ein zweites Modul ein Gestell aus Holz: Die Stütze ist 0,90 m hoch und steht waagrecht 1,50 m von der Unterkante
                  entfernt. Wie groß ist der Neigungswinkel (auf eine Nachkommastelle)? Wie lang darf das Modul höchstens sein, damit es nicht übersteht
                  (auf zwei Nachkommastellen)?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'a', label: <M>\alpha \approx</M>, expected: (Math.atan(0.6) * 180) / Math.PI, unit: '°', tol: 0.051 },
                { kind: 'num', key: 'l', label: 'Modul:', expected: Math.hypot(0.9, 1.5), unit: 'm', tol: 0.0051 },
              ]}
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Zwei Katheten: Tangens umkehren', tex: ['\\alpha = \\tan^{-1}\\left(\\dfrac{0{,}90}{1{,}50}\\right)', '\\alpha \\approx 31{,}0^\\circ'] },
                    { titel: 'Hypotenuse mit dem Satz des Pythagoras', tex: ['\\text{Modul} = \\sqrt{0{,}90^2 + 1{,}50^2}', '\\text{Modul} \\approx 1{,}75\\,\\text{m}'] },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Bekannt sind beide Katheten. Welche Umkehrfunktion passt?</>,
                    <><M>{'\\tan^{-1}(0{,}90 : 1{,}50)'}</M> liefert den Winkel.</>,
                    <>Für die Modullänge (Hypotenuse) hilft der Satz des Pythagoras: <M>{'\\sqrt{0{,}90^2 + 1{,}50^2}'}</M>.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={['1', '2', '3', '4'].every((n) => uebungen.includes(n))} titel="Sonnenfänger">
            <SonnenSpiel />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du berechnest jetzt Winkel im rechtwinkligen Dreieck aus zwei Seiten. Bei den Übungsaufgaben trainierst du das an vielen Dreiecken mit
              wechselnder Beschriftung.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Winkel berechnen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Winkel berechnen: Das Balkonkraftwerk"
      width="wide"
      kompakt
      parent={{ to: '/trigonometrie/rechtwinklig-winkel', label: 'Winkel berechnen mit Sinus, Kosinus und Tangens' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA_BALKONKRAFTWERK}
        bildwelt={BILDWELT}
        ziel={
          <>
            In dieser Lernsituation hilfst du Ayla, ihr Solarmodul richtig aufzustellen. Du lernst, wie du im rechtwinkligen Dreieck aus zwei Seiten
            einen Winkel berechnest.
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
  const beste = schaetzungen.reduce((a, b) => (Math.abs(b - WINKEL) < Math.abs(a - WINKEL) ? b : a));
  const z = (x: number) => x.toLocaleString('de-DE', { maximumFractionDigits: 1 });
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest geschätzt:</strong> {schaetzungen.length} {schaetzungen.length === 1 ? 'Schätzung' : 'Schätzungen'}, am nächsten dran war{' '}
        {z(beste)}° (daneben um {z(Math.abs(beste - WINKEL))}°). {istTreffer(beste) ? 'Ein Treffer!' : ''} Ayla meinte „locker 30°“. Die Rechnung zeigt:{' '}
        <M>{'\\alpha = \\sin^{-1}(0{,}80 : 1{,}72) \\approx 27{,}7^\\circ'}</M>, also zu flach. Erst mit 0,95 m liegt das Modul mit etwa{' '}
        <M>{'33{,}5^\\circ'}</M> im Zielbereich.
      </p>
    </div>
  );
}
