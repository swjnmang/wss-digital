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
import Dreieck from './Dreieck';
import LaserVorschau, { istTreffer, winkelVon, type Versuch } from './LaserVorschau';
import ZuschnittSpiel from './ZuschnittSpiel';
import titelBild from './bilder/handystaender-titel.webp';
import wunschBild from './bilder/handystaender-wunsch.webp';
import prototypBild from './bilder/handystaender-prototyp.webp';
import karteBild from './bilder/handystaender-karte.webp';
import '../../daten_und_zufall/lernpfad/lernpfad.css';
import './handystaender.css';

// Lernsituation „Der Handyständer“: Sinus, Kosinus und Tangens als Seitenverhältnisse im rechtwinkligen Dreieck (ca. 60 bis 90 min).
// Format Kundenauftrag / Maschine: Jule möchte einen Tablet-Ständer mit genau 70° Neigung. In der Lasercutter-Vorschau probieren die
// SuS Boden und Rücken aus und treffen 70° kaum. Die Tabelle zeigt: Gleiche Winkel haben dasselbe Verhältnis Rücken : Boden.
// In „Problem lösen“ prüfen sie Jules Prototyp ohne Geodreieck: drei Seitenverhältnisse bilden, benennen und mit dem Taschenrechner vergleichen.
// Aha: Nicht die Größe bestimmt den Winkel, sondern das Seitenverhältnis. Genau dieses Verhältnis liefert der Taschenrechner:
// tan(70°) ≈ 2,75 ist das Verhältnis Rücken : Boden, das in der Vorschau gesucht war.
// Lernprodukt analog: Werkstatt-Karte im Heft (beschriftete Skizze des Seitenteils mit Hypotenuse, Gegenkathete, Ankathete, drei Verhältnissen und Antwort an Jule).
// Identität: Themenfarbe Ocker (Sperrholz), Symbol Tablet, Titelbild Handyständer mit Bauteilen, Leitobjekt das Seitenteil des Ständers.
// Bildwelt Bauplan / Lasercut: Titelbild und Sachbilder sind gerenderte WebP-Dateien aus bilder-quelle/handystaender-*.bild.html
// (Bausteine in bilder-quelle/_lasercut.js); Vorschau, Skizzen und Spiel bleiben Inline-SVG.
// Punkte nach Aufwand (Pflicht 60): Warm-up 2/2/2/2/3 = 11 (18 %), Ausprobieren 3, Kernaufgabe 14, Entscheidung 4, Werkstatt-Karte 5
// (Problem lösen 23 = 38 %), Übungen 4/6/6/7 = 23 (38 %); Profi 9; Bonus-Spiel „Laser-Zuschnitt“ höchstens 6.

/** Lernvideo zum Thema (auch bei den Übungsaufgaben unter /trigonometrie/sinus-kosinus-tangens-erkennen verlinkt) */
export const VIDEO_SIN_COS_TAN = 'https://www.youtube.com/watch?v=0qxNk-ZcW-8';

/* ── Identität ───────────────────────────────────────────────────────────── */

export const THEMA_HANDYSTAENDER: Thema = {
  name: 'Der Handyständer',
  farbe: 'ocker',
  icon: 'fa-tablet-screen-button',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Bauplan auf Sperrholz: ein Handyständer von der Seite mit dem Seitenteil Boden 8 cm, Rücken 15 cm und Auflage 17 cm, der Winkel Alpha ist markiert. Daneben ausgeschnittene Bauteile und ein Schriftfeld: Neuer Auftrag von Jule, Tablet, Neigung 70 Grad, Maße unbekannt."
    />
  ),
};
const BILDWELT: Bildwelt = { welt: 'bauplan', variante: 'lasercut' };

/* ── Jules Prototyp ──────────────────────────────────────────────────────── */

const P_BODEN = 6;
const P_RUECKEN = 16.5;
const P_SCHRAEG = 17.6;

/* ── Rechenbeispiel: mein Handyständer 8 cm, 15 cm, 17 cm ───────────────── */

const BSP_AUFGABE = (
  <p>
    Das Seitenteil deines eigenen Handyständers hat den Boden 8 cm, den Rücken 15 cm und die Auflage 17 cm. Bilde die drei
    Seitenverhältnisse zum Winkel <M>\alpha</M> und finde mit dem Taschenrechner heraus, wie groß <M>\alpha</M> ungefähr ist.
  </p>
);
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: (
      <>
        Die Seiten vom Winkel <M>\alpha</M> aus benennen
      </>
    ),
    body: (
      <>
        <p>
          In einem rechtwinkligen Dreieck haben die Seiten feste Namen. Welche Seite welchen Namen bekommt, hängt davon ab, von welchem
          Winkel aus du schaust. Hier schaust du vom Winkel <M>\alpha</M> unten vorne aus:
        </p>
        <div className="hs-skizze hs-skizze-klein">
          <Dreieck
            boden={8}
            ruecken={15}
            rollen
            labels={{ boden: 'Ankathete 8 cm', ruecken: 'Gegenkathete 15 cm', schraeg: 'Hypotenuse 17 cm' }}
            breite={620}
            label="Seitenteil 8 cm, 15 cm, 17 cm. Vom Winkel Alpha aus: Hypotenuse 17 cm, Gegenkathete 15 cm, Ankathete 8 cm."
          />
        </div>
        <ul className="hs-begriffe">
          <li>
            Die <strong>Hypotenuse</strong> ist die längste Seite. Sie liegt dem rechten Winkel gegenüber: die Auflage mit 17 cm.
          </li>
          <li>
            Die <strong>Gegenkathete</strong> liegt dem Winkel <M>\alpha</M> gegenüber: der Rücken mit 15 cm.
          </li>
          <li>
            Die <strong>Ankathete</strong> liegt direkt am Winkel <M>\alpha</M> an, ist aber nicht die Hypotenuse: der Boden mit 8 cm.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Drei Seiten durcheinander teilen',
    body: (
      <>
        <p>
          Teilst du zwei Seiten durcheinander, bekommst du ein Seitenverhältnis. In der Vorschau hast du schon eines benutzt: Rücken durch
          Boden. Im rechtwinkligen Dreieck sind drei Verhältnisse so wichtig, dass sie eigene Namen haben:{' '}
          <strong>Sinus</strong>, <strong>Kosinus</strong> und <strong>Tangens</strong>. Man schreibt sie kurz <M>{'\\sin'}</M>,{' '}
          <M>{'\\cos'}</M> und <M>{'\\tan'}</M>. <M>{'\\sin(\\alpha)'}</M> liest man „Sinus von Alpha“.
        </p>
        <p>
          Der <strong>Sinus</strong> von <M>\alpha</M> ist die Gegenkathete geteilt durch die Hypotenuse:
        </p>
        <MB>{'\\sin(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}} = \\dfrac{15}{17} \\approx 0{,}88'}</MB>
        <p>
          Der <strong>Kosinus</strong> von <M>\alpha</M> ist die Ankathete geteilt durch die Hypotenuse:
        </p>
        <MB>{'\\cos(\\alpha) = \\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}} = \\dfrac{8}{17} \\approx 0{,}47'}</MB>
        <p>
          Der <strong>Tangens</strong> von <M>\alpha</M> ist die Gegenkathete geteilt durch die Ankathete. Das ist genau dein Verhältnis
          Rücken durch Boden aus der Vorschau:
        </p>
        <MB>{'\\tan(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}} = \\dfrac{15}{8} \\approx 1{,}88'}</MB>
      </>
    ),
  },
  {
    title: 'Mit dem Taschenrechner vergleichen',
    body: (
      <>
        <p>
          Der Taschenrechner kennt diese drei Verhältnisse für jeden Winkel. Stelle ihn auf Grad (Anzeige D oder DEG). Tippe dann zum
          Beispiel die Taste sin und danach 62 ein. Für <M>{'62^\\circ'}</M> zeigt er:
        </p>
        <MB>{'\\sin(62^\\circ) \\approx 0{,}88'}</MB>
        <MB>{'\\cos(62^\\circ) \\approx 0{,}47'}</MB>
        <MB>{'\\tan(62^\\circ) \\approx 1{,}88'}</MB>
        <p>
          Alle drei Werte passen zu deinem Seitenteil. Dein Handyständer hat also eine Neigung von ungefähr <M>{'62^\\circ'}</M>. Bei{' '}
          <M>{'60^\\circ'}</M> wäre zum Beispiel <M>{'\\tan(60^\\circ) \\approx 1{,}73'}</M>, das passt nicht.
        </p>
      </>
    ),
  },
];

/** Lösungsweg für Jules Prototyp */
const LOESUNG_KERN = (
  <Loesungsweg
    schritte={[
      { titel: 'Seiten von α aus benennen', text: 'Hypotenuse 17,6 cm (Auflage), Gegenkathete 16,5 cm (Rücken), Ankathete 6 cm (Boden).' },
      { titel: 'Sinus bilden', tex: '\\sin(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}} = \\dfrac{16{,}5}{17{,}6} \\approx 0{,}94' },
      { titel: 'Kosinus bilden', tex: '\\cos(\\alpha) = \\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}} = \\dfrac{6}{17{,}6} \\approx 0{,}34' },
      { titel: 'Tangens bilden', tex: '\\tan(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}} = \\dfrac{16{,}5}{6} = 2{,}75' },
      { titel: 'Mit dem Taschenrechner vergleichen', tex: '\\tan(70^\\circ) \\approx 2{,}75', text: 'Auch sin(70°) ≈ 0,94 und cos(70°) ≈ 0,34 passen. Der Prototyp hat also 70°.' },
    ]}
  />
);

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function HandystaenderEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [versuche, setVersuche] = useSitzungState<Versuch[]>('hs-versuche', []);
  const [geloest, setGeloest] = useSitzungState('hs-geloest', false);
  const [uebungen, setUebungen] = useSitzungState<string[]>('hs-uebungen', []);
  const uebung = (nr: string, fertig: () => void) => () => {
    fertig();
    setUebungen((u) => (u.includes(nr) ? u : [...u, nr]));
  };

  const warmDreieck = (winkel: 'alpha' | 'beta' | 'beide') => (
    <div className="hs-skizze hs-skizze-klein">
      <Dreieck
        boden={4}
        ruecken={3}
        winkel={winkel}
        ecken={['A', 'C', 'B']}
        labels={{ boden: 'b', ruecken: 'a', schraeg: 'c' }}
        label="Rechtwinkliges Dreieck ABC mit dem rechten Winkel bei C. Winkel Alpha bei A, Winkel Beta bei B. Seite a liegt gegenüber von A, b gegenüber von B, c gegenüber von C."
      />
    </div>
  );
  const SEITEN = ['Seite a', 'Seite b', 'Seite c'];

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen in der Werkstatt',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 10 Minuten.</p>
          {warmDreieck('beide')}
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Hypotenuse"
            rechnen={false}
            prompt={<p>Im Dreieck <M>ABC</M> oben ist der rechte Winkel bei <M>C</M>. Welche Seite ist die Hypotenuse?</p>}
            fields={[{ kind: 'select', key: 'h', label: 'Hypotenuse:', options: SEITEN, expected: 2 }]}
            solution={<p>Die Hypotenuse liegt dem rechten Winkel gegenüber. Der rechte Winkel ist bei <M>C</M>, also ist <M>c</M> die Hypotenuse.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title={<>b) Katheten zu α</>}
            rechnen={false}
            prompt={<p>Welche Seite ist vom Winkel <M>\alpha</M> aus die Gegenkathete, welche die Ankathete?</p>}
            fieldsRow
            fields={[
              { kind: 'select', key: 'gk', label: 'Gegenkathete:', options: SEITEN, expected: 0 },
              { kind: 'select', key: 'ak', label: 'Ankathete:', options: SEITEN, expected: 1 },
            ]}
            solution={
              <p>
                Die Gegenkathete liegt <M>\alpha</M> gegenüber: <M>a</M>. Die Ankathete ist die Kathete, die am Winkel <M>\alpha</M> anliegt: <M>b</M>.
              </p>
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title={<>c) Katheten zu β</>}
            rechnen={false}
            prompt={<p>Und vom Winkel <M>\beta</M> aus?</p>}
            fieldsRow
            fields={[
              { kind: 'select', key: 'gk', label: 'Gegenkathete:', options: SEITEN, expected: 1 },
              { kind: 'select', key: 'ak', label: 'Ankathete:', options: SEITEN, expected: 0 },
            ]}
            solution={
              <p>
                Von <M>\beta</M> aus tauschen die Katheten ihre Rollen: Gegenkathete ist <M>b</M>, Ankathete ist <M>a</M>. Die Hypotenuse bleibt{' '}
                <M>c</M>.
              </p>
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Bruch als Dezimalzahl"
            prompt={<p>Berechne mit dem Taschenrechner und runde auf zwei Nachkommastellen.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'q1', label: <M>{'\\dfrac{12}{13} \\approx'}</M>, expected: 0.92, tol: 0.0051 },
              { kind: 'num', key: 'q2', label: <M>{'\\dfrac{13}{5} ='}</M>, expected: 2.6, tol: 0.0051 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Erster Bruch', tex: '\\dfrac{12}{13} = 12 : 13 \\approx 0{,}92' },
                  { titel: 'Zweiter Bruch', tex: '\\dfrac{13}{5} = 13 : 5 = 2{,}6' },
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={3}
            title="e) Gleiches Verhältnis"
            prompt={
              <p>
                Ein kleines Seitenteil hat den Boden 4 cm und den Rücken 11 cm. Ein großes soll genauso geformt sein, nur doppelt bzw. dreimal so
                groß. Ergänze, sodass das Verhältnis Rücken : Boden gleich bleibt.
              </p>
            }
            rechnung={[
              { l: ['11 : 4'], r: [{ luecke: 'x1' }, ' : 8'] },
              { l: ['11 : 4'], r: ['33 : ', { luecke: 'x2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'x1', label: 'Rücken', expected: 22 },
              { kind: 'num', key: 'x2', label: 'Boden', expected: 12 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Boden verdoppelt', tex: '4 \\cdot 2 = 8 \\quad\\Rightarrow\\quad 11 \\cdot 2 = 22', text: 'Beide Seiten werden mit demselben Faktor multipliziert.' },
                  { titel: 'Rücken verdreifacht', tex: '11 \\cdot 3 = 33 \\quad\\Rightarrow\\quad 4 \\cdot 3 = 12' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Ein Verhältnis bleibt gleich, wenn du beide Zahlen mit derselben Zahl multiplizierst.</>,
                  <>Von 4 auf 8 ist mal 2. Dann muss auch 11 mal 2 genommen werden.</>,
                  <>Von 11 auf 33 ist mal 3. Rechne also auch 4 mal 3.</>,
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Ein Tablet-Ständer mit genau 70°',
      pflicht: ['probieren'],
      bedingung: 'Lass den Lasercutter mindestens drei Seitenteile zeichnen (oder triff genau 70°), dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Im Makerspace der Stadtbücherei schneidest du mit dem Lasercutter Handyständer aus 4 mm Sperrholz. Das Herzstück ist das
            Seitenteil: ein rechtwinkliges Dreieck aus Boden, Rücken und der schrägen Auflage, an der das Gerät lehnt.
          </p>
          <p className="sl-text">
            Deine Freundin Jule möchte einen Ständer für ihr Tablet. Ihre Bedingung: Die Auflage soll genau <M>{'70^\\circ'}</M> gegen den Boden
            geneigt sein. Gegeben ist also nur der Winkel <M>{'\\alpha = 70^\\circ'}</M>. Gesucht sind passende Längen für Boden und Rücken, denn
            der Lasercutter braucht Maße in Zentimetern.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
            <p>
              Gib in der Vorschau des Lasercutters Längen für Boden und Rücken ein. Die Vorschau misst den Winkel. Schaffst du genau{' '}
              <M>{'70^\\circ'}</M>?
            </p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 8 Minuten.</p>
          <figure className="sl-foto">
            <img
              src={wunschBild}
              width={1200}
              height={600}
              alt="Bauplan auf Sperrholz: ein Tablet lehnt an einem gestrichelten Seitenteil. Der Winkel zwischen Boden und Auflage ist mit 70 Grad markiert, die Längen von Boden und Rücken sind mit Fragezeichen beschriftet. Daneben Jules Wunsch: Neigung genau 70 Grad."
            />
            <figcaption>Jules Wunsch: Nur der Winkel ist bekannt, die Maße fehlen.</figcaption>
          </figure>
          <LaserVorschau
            versuche={versuche}
            onTesten={(v) => {
              const neu = [...versuche, v];
              setVersuche(neu);
              if (neu.length >= 3 || neu.some(istTreffer)) fertig.teil('probieren')();
            }}
          />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Hat Jules Prototyp wirklich 70°?',
      pflicht: ['rechnung', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Prüfe den Prototyp ohne Geodreieck</p>
            <p>
              Jule hat selbst ein Seitenteil geschnitten: Boden 6 cm, Rücken 16,5 cm, Auflage 17,6 cm. Ein Geodreieck gibt es in der Werkstatt
              nicht. Finde trotzdem heraus, ob das Seitenteil die gewünschten <M>{'70^\\circ'}</M> hat.
            </p>
            <p>
              Das Werkzeug dafür lernst du im Beispiel unten kennen: drei Seitenverhältnisse mit den Namen Sinus, Kosinus und Tangens. Berechne
              sie in deinem Heft für Jules Prototyp (auf zwei Nachkommastellen) und vergleiche sie mit den Werten, die der Taschenrechner für{' '}
              <M>{'70^\\circ'}</M> anzeigt.
            </p>
          </div>
          <figure className="sl-foto">
            <img
              src={prototypBild}
              width={1200}
              height={600}
              alt="Bauplan auf Sperrholz: Jules Prototyp als rechtwinkliges Seitenteil mit Boden 6 cm, Rücken 16,5 cm und Auflage 17,6 cm. Der Winkel Alpha unten vorne ist markiert. Schriftfeld: Soll Alpha gleich 70 Grad, Ist Alpha unbekannt, Werkzeug Bauplan und Taschenrechner."
            />
          </figure>
          <BeispielMitVideo video={VIDEO_SIN_COS_TAN} videoTitel="Lernvideo: Sinus, Kosinus und Tangens erkennen">
            <Beispiel offen title="Mein eigener Handyständer" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('rechnung')();
                setGeloest(true);
              }}
              punkte={14}
              title="Jules Prototyp"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'sin', label: <>Wie groß ist <M>{'\\sin(\\alpha)'}</M> beim Prototyp?</>, expected: P_RUECKEN / P_SCHRAEG, tol: 0.0051 },
                { kind: 'num', key: 'cos', label: <>Wie groß ist <M>{'\\cos(\\alpha)'}</M> beim Prototyp?</>, expected: P_BODEN / P_SCHRAEG, tol: 0.0051 },
                { kind: 'num', key: 'tan', label: <>Wie groß ist <M>{'\\tan(\\alpha)'}</M> beim Prototyp?</>, expected: P_RUECKEN / P_BODEN, tol: 0.0051 },
                { kind: 'num', key: 't70', label: <>Welchen Wert zeigt der Taschenrechner für <M>{'\\tan(70^\\circ)'}</M>?</>, expected: Math.tan((70 * Math.PI) / 180), tol: 0.0051 },
              ]}
              loesungNachFehler
              solution={LOESUNG_KERN}
              help={
                <Hilfen
                  steps={[
                    <>Gehe vor wie im Beispiel: Benenne zuerst vom Winkel <M>\alpha</M> aus Hypotenuse, Gegenkathete und Ankathete.</>,
                    <>
                      Die Auflage (17,6 cm) ist die Hypotenuse, der Rücken (16,5 cm) liegt <M>\alpha</M> gegenüber, der Boden (6 cm) liegt an{' '}
                      <M>\alpha</M> an. Sinus ist Gegenkathete durch Hypotenuse, Kosinus ist Ankathete durch Hypotenuse, Tangens ist
                      Gegenkathete durch Ankathete.
                    </>,
                    <>
                      <M>{'\\sin(\\alpha) = \\frac{16{,}5}{17{,}6}'}</M>, <M>{'\\cos(\\alpha) = \\frac{6}{17{,}6}'}</M>,{' '}
                      <M>{'\\tan(\\alpha) = \\frac{16{,}5}{6}'}</M>. Für <M>{'\\tan(70^\\circ)'}</M>: Taschenrechner auf Grad (DEG), dann tan 70 eingeben.
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
              title="Antwort an Jule"
              prompt={<p>Was sagst du Jule zu ihrem Prototyp?</p>}
              options={[
                {
                  text: 'Ohne Geodreieck kann man den Winkel nicht prüfen. Wir müssen ein neues Teil schneiden.',
                  feedback: 'Doch: Die Seitenverhältnisse verraten den Winkel. Genau das hast du gerade mit dem Taschenrechner verglichen.',
                },
                {
                  text: 'Der Winkel stimmt nur, wenn das Teil genau 4 cm × 11 cm groß ist wie in der Vorschau.',
                  feedback: 'Die Größe spielt keine Rolle. Es kommt nur auf das Verhältnis der Seiten an: 16,5 : 6 = 2,75 = 11 : 4.',
                },
                {
                  text: 'Ja, der Prototyp hat 70°: tan(α) = 16,5 : 6 = 2,75 und tan(70°) ≈ 2,75. Auch Sinus und Kosinus passen.',
                  correct: true,
                  feedback: 'Genau. Alle drei Seitenverhältnisse stimmen mit den Werten für 70° überein.',
                },
                {
                  text: 'Nein: sin(α) = 6 : 17,6 ≈ 0,34, aber sin(70°) ≈ 0,94. Das passt nicht.',
                  feedback: '6 cm ist der Boden, also die Ankathete von α. 6 : 17,6 ist der Kosinus, nicht der Sinus.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Werkstatt-Karte für das Seitenteil">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={karteBild}
                width={800}
                height={400}
                alt="Eine Werkstatt-Karte aus Holz: links die Skizze eines rechtwinkligen Dreiecks mit Winkel Alpha und den farbig beschrifteten Seiten Hypotenuse, Gegenkathete und Ankathete, rechts angefangene Zeilen sin Alpha gleich, cos Alpha gleich, tan Alpha gleich und Antwort an Jule."
              />
            </figure>
            <p className="sl-text">
              Gestalte in deinem Heft eine Werkstatt-Karte zu Jules Prototyp. Zeichne das Seitenteil, markiere <M>\alpha</M> und beschrifte Hypotenuse,
              Gegenkathete und Ankathete in drei Farben. Schreibe Sinus, Kosinus und Tangens als Bruch und als Dezimalzahl dazu, daneben die Werte des Taschenrechners
              für <M>{'70^\\circ'}</M>, und beantworte Jules Frage.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Vom Winkel α aus ist … die Hypotenuse, … die Gegenkathete und … die Ankathete.“</li>
                <li>„Der Tangens von α ist Gegenkathete durch Ankathete, also …“</li>
                <li>„Der Taschenrechner zeigt für 70° …“</li>
                <li>„Liebe Jule, dein Prototyp hat …, weil …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Werkstatt-Karte vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien('an Jule')} />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug versuche={versuche} />
              <Merke title="Sinus, Kosinus und Tangens im rechtwinkligen Dreieck">
                <div className="hs-skizze hs-skizze-klein">
                  <Dreieck
                    boden={4}
                    ruecken={3}
                    rollen
                    labels={{ boden: 'Ankathete', ruecken: 'Gegenkathete', schraeg: 'Hypotenuse' }}
                    breite={520}
                    label="Rechtwinkliges Dreieck mit Winkel Alpha: Hypotenuse gegenüber dem rechten Winkel, Gegenkathete gegenüber Alpha, Ankathete an Alpha."
                  />
                </div>
                <MB>{'\\sin(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}'}</MB>
                <MB>{'\\cos(\\alpha) = \\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}'}</MB>
                <MB>{'\\tan(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}}'}</MB>
                <ul>
                  <li>Sinus, Kosinus und Tangens sind Seitenverhältnisse. Sie hängen nur vom Winkel ab, nicht von der Größe des Dreiecks.</li>
                  <li>Welche Kathete Gegen- oder Ankathete ist, hängt vom Winkel ab. Vom anderen spitzen Winkel aus tauschen sie die Rollen.</li>
                  <li>Der Taschenrechner (auf Grad, DEG) liefert die Verhältnisse für jeden Winkel, z. B. <M>{'\\tan(70^\\circ) \\approx 2{,}75'}</M>.</li>
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
      pflicht: ['1', '2', '3', '4'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben, die fünfte ist für Profis. Wenn du die vier Pflichtaufgaben gelöst hast, wartet unten
            ein Spiel auf dich. Einzelarbeit, ca. 20 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Welcher Bruch ist der Kosinus?">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Sinus-Kosinus-Tangens-Einstieg: Kosinus erkennen (Basis)"
              title="Übung 1"
              level="basis"
              prompt={
                <>
                  <div className="hs-skizze hs-skizze-klein">
                    <Dreieck
                      boden={5}
                      ruecken={3.5}
                      labels={{ boden: 'r', ruecken: 's', schraeg: 't' }}
                      label="Rechtwinkliges Seitenteil: Boden r, Rücken s, schräge Kante t. Markiert ist der Winkel Alpha unten vorne."
                    />
                  </div>
                  <p>
                    Welcher Bruch ist <M>{'\\cos(\\alpha)'}</M>?
                  </p>
                </>
              }
              options={[
                { text: <M>{'\\dfrac{s}{t}'}</M>, feedback: <>Das ist Gegenkathete durch Hypotenuse, also <M>{'\\sin(\\alpha)'}</M>.</> },
                { text: <M>{'\\dfrac{r}{t}'}</M>, correct: true, feedback: <>Richtig: Ankathete <M>r</M> durch Hypotenuse <M>t</M>.</> },
                { text: <M>{'\\dfrac{s}{r}'}</M>, feedback: <>Das ist Gegenkathete durch Ankathete, also <M>{'\\tan(\\alpha)'}</M>.</> },
                { text: <M>{'\\dfrac{t}{r}'}</M>, feedback: 'Zähler und Nenner sind vertauscht. Beim Kosinus steht die Hypotenuse im Nenner.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
              topic="Sinus-Kosinus-Tangens-Einstieg: Rollen beim anderen Winkel (Standard)"
              title="Übung 2"
              level="standard"
              prompt={
                <>
                  <div className="hs-skizze hs-skizze-klein">
                    <Dreieck
                      boden={P_BODEN}
                      ruecken={P_RUECKEN}
                      winkel="beta"
                      labels={{ boden: '6 cm', ruecken: '16,5 cm', schraeg: '17,6 cm' }}
                      label="Jules Prototyp: Boden 6 cm, Rücken 16,5 cm, Auflage 17,6 cm. Markiert ist der Winkel Beta oben."
                    />
                  </div>
                  <p>
                    Jetzt geht es um den Winkel <M>\beta</M> oben am Prototyp. Mia sagt: „<M>{'\\sin(\\beta) = \\frac{16{,}5}{17{,}6}'}</M>, genau wie
                    bei <M>\alpha</M>.“ Tom sagt: „<M>{'\\sin(\\beta) = \\frac{6}{17{,}6}'}</M>.“ Wer hat recht?
                  </p>
                </>
              }
              options={[
                { text: 'Mia: Der Rücken ist immer die Gegenkathete.', feedback: 'Der Rücken liegt an β an. Von β aus ist er die Ankathete.' },
                { text: 'Beide: Im selben Dreieck ist der Sinus immer gleich.', feedback: 'α und β sind verschieden groß, also sind auch ihre Sinuswerte verschieden.' },
                { text: 'Keiner: Den Sinus von β kann man nur mit dem Geodreieck bestimmen.', feedback: 'Auch für β ist der Sinus ein Seitenverhältnis: Gegenkathete durch Hypotenuse.' },
                {
                  text: 'Tom: Von β aus liegt der Boden (6 cm) gegenüber, er ist jetzt die Gegenkathete.',
                  correct: true,
                  feedback: (
                    <>
                      Genau. Vom anderen Winkel aus tauschen die Katheten die Rollen. Darum gilt <M>{'\\sin(\\beta) = \\cos(\\alpha)'}</M>.
                    </>
                  ),
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Der Laptopständer">
            <TrackedCheck
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              topic="Sinus-Kosinus-Tangens-Einstieg: Verhältnisse berechnen (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <>
                  <p>
                    Ein flacher Laptopständer hat ein Seitenteil mit Boden 24 cm, Rücken 7 cm und Auflage 25 cm. Berechne die drei
                    Seitenverhältnisse zum Winkel <M>\alpha</M> unten vorne (auf zwei Nachkommastellen).
                  </p>
                  <div className="hs-skizze hs-skizze-klein">
                    <Dreieck
                      boden={24}
                      ruecken={7}
                      labels={{ boden: '24 cm', ruecken: '7 cm', schraeg: '25 cm' }}
                      label="Flaches Seitenteil: Boden 24 cm, Rücken 7 cm, Auflage 25 cm. Winkel Alpha unten vorne."
                    />
                  </div>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 's', label: <M>{'\\sin(\\alpha) \\approx'}</M>, expected: 7 / 25, tol: 0.0051 },
                { kind: 'num', key: 'c', label: <M>{'\\cos(\\alpha) \\approx'}</M>, expected: 24 / 25, tol: 0.0051 },
                { kind: 'num', key: 't', label: <M>{'\\tan(\\alpha) \\approx'}</M>, expected: 7 / 24, tol: 0.0051 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Seiten von α aus benennen', text: 'Hypotenuse 25 cm, Gegenkathete 7 cm (Rücken), Ankathete 24 cm (Boden).' },
                    { titel: 'Sinus', tex: '\\sin(\\alpha) = \\dfrac{7}{25} = 0{,}28' },
                    { titel: 'Kosinus', tex: '\\cos(\\alpha) = \\dfrac{24}{25} = 0{,}96' },
                    { titel: 'Tangens', tex: '\\tan(\\alpha) = \\dfrac{7}{24} \\approx 0{,}29' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Benenne zuerst die Seiten: Welche liegt dem rechten Winkel gegenüber, welche <M>\alpha</M>?</>,
                    <>Hypotenuse 25 cm, Gegenkathete 7 cm, Ankathete 24 cm.</>,
                    <>
                      <M>{'\\sin(\\alpha) = \\frac{7}{25}'}</M>, <M>{'\\cos(\\alpha) = \\frac{24}{25}'}</M>, <M>{'\\tan(\\alpha) = \\frac{7}{24}'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Der Notenständer">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={7}
              topic="Sinus-Kosinus-Tangens-Einstieg: Verhältnis umgekehrt nutzen (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Für das Seitenteil eines Notenständers gilt <M>{'\\tan(\\alpha) = 0{,}75'}</M>. Der Boden ist 20 cm lang, die schräge Auflage
                  25 cm. Wie lang ist der Rücken? Wie groß ist <M>{'\\sin(\\alpha)'}</M>?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'r', label: 'Rücken:', expected: 15, unit: 'cm' },
                { kind: 'num', key: 's', label: <M>{'\\sin(\\alpha) ='}</M>, expected: 0.6, tol: 0.0051 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Tangens aufschreiben', tex: '\\tan(\\alpha) = \\dfrac{\\text{Rücken}}{\\text{Boden}} = \\dfrac{\\text{Rücken}}{20} = 0{,}75' },
                    { titel: 'Rücken berechnen', tex: '\\text{Rücken} = 0{,}75 \\cdot 20 = 15 \\text{ cm}' },
                    { titel: 'Sinus bilden', tex: '\\sin(\\alpha) = \\dfrac{15}{25} = 0{,}6' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Der Tangens ist Gegenkathete durch Ankathete. Welche Seite ist hier bekannt, welche gesucht?</>,
                    <>
                      <M>{'\\frac{\\text{Rücken}}{20} = 0{,}75'}</M>. Der Rücken ist also das <M>{'0{,}75'}</M>-Fache des Bodens.
                    </>,
                    <>
                      Rücken <M>{'= 0{,}75 \\cdot 20'}</M>. Danach: Sinus = Rücken durch Auflage.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Ein Ständer mit 60°">
            <CheckCard
              title="Wie lang muss der Rücken sein?"
              level="erweiterung"
              profi
              punkte={9}
              prompt={
                <p>
                  Ein Kochbuch-Ständer soll eine Neigung von genau <M>{'60^\\circ'}</M> haben, der Boden ist 10 cm lang. Wie lang muss der Rücken
                  sein? Runde auf zwei Nachkommastellen. Tipp: Welches Verhältnis liefert dir der Taschenrechner?
                </p>
              }
              fields={[{ kind: 'num', key: 'r', label: 'Rücken:', expected: 10 * Math.tan(Math.PI / 3), unit: 'cm', tol: 0.011 }]}
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Passendes Verhältnis wählen', tex: '\\tan(60^\\circ) = \\dfrac{\\text{Rücken}}{\\text{Boden}}', text: 'Rücken ist die Gegenkathete, Boden die Ankathete.' },
                    { titel: 'Wert aus dem Taschenrechner', tex: '\\tan(60^\\circ) \\approx 1{,}732' },
                    { titel: 'Rücken berechnen', tex: '\\text{Rücken} = 10 \\cdot \\tan(60^\\circ) \\approx 17{,}32 \\text{ cm}' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Bekannt sind der Winkel und der Boden (Ankathete), gesucht der Rücken (Gegenkathete).</>,
                    <>Gegenkathete und Ankathete stehen im Tangens.</>,
                    <>
                      Rücken <M>{'= 10 \\cdot \\tan(60^\\circ)'}</M>. Tippe das in einem Zug in den Taschenrechner ein.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={['1', '2', '3', '4'].every((n) => uebungen.includes(n))} titel="Laser-Zuschnitt">
            <ZuschnittSpiel />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du erkennst jetzt Sinus, Kosinus und Tangens als Seitenverhältnisse im rechtwinkligen Dreieck. Bei den Übungsaufgaben trainierst du
              das an vielen Dreiecken mit wechselnder Beschriftung.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Sinus, Kosinus und Tangens erkennen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Sinus, Kosinus, Tangens: Der Handyständer"
      width="wide"
      kompakt
      parent={{ to: '/trigonometrie/sinus-kosinus-tangens-erkennen', label: 'Sinus, Kosinus und Tangens erkennen' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA_HANDYSTAENDER}
        bildwelt={BILDWELT}
        ziel={
          <>
            In dieser Lernsituation baust du mit dem Lasercutter einen Tablet-Ständer für Jule. Du lernst, was Sinus, Kosinus und Tangens im
            rechtwinkligen Dreieck bedeuten und wie du sie erkennst.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Versuche in der Lasercutter-Vorschau aus Phase 2 */
function Rueckbezug({ versuche }: { versuche: Versuch[] }) {
  if (!versuche.length) return null;
  const bester = versuche.reduce((a, b) => (Math.abs(winkelVon(b) - 70) < Math.abs(winkelVon(a) - 70) ? b : a));
  const z = (x: number, d = 1) => x.toLocaleString('de-DE', { maximumFractionDigits: d });
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest probiert:</strong> {versuche.length} {versuche.length === 1 ? 'Seitenteil' : 'Seitenteile'} in der Vorschau. Am
        nächsten an 70° war Boden {z(bester.boden)} cm und Rücken {z(bester.ruecken)} cm mit {z(winkelVon(bester))}° (Verhältnis Rücken : Boden{' '}
        {z(bester.ruecken / bester.boden, 3)}). {istTreffer(bester) ? 'Ein Treffer!' : ''} Gesucht war das Verhältnis{' '}
        <M>{'\\tan(70^\\circ) \\approx 2{,}75'}</M>: Jeder Ständer mit Rücken : Boden <M>{'\\approx 2{,}75'}</M> hat 70°, egal wie groß er ist,
        zum Beispiel 4 cm und 11 cm oder Jules 6 cm und 16,5 cm.
      </p>
    </div>
  );
}

