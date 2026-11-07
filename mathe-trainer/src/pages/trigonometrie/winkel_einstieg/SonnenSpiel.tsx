import { M } from '../../daten_und_zufall/lernpfad/kit';
import AuswahlSpiel, { mischen, zufall, type AuswahlRunde, type AuswahlZiel } from '../../lineare_funktionen/lernsituation_kit/AuswahlSpiel';
import Dreieck from '../sinus_kosinus_tangens_einstieg/Dreieck';

// Bonus-Spiel „Sonnenfänger“: Jede Runde zeigt ein Modul mit zwei bekannten Seiten. Drei Module stehen zur Wahl, nur eines hat den
// richtigen Winkel. Falsche Module: falsche Umkehrfunktion und der andere spitze Winkel (90° − α).
// 4 Runden à 2 Punkte = 8 Punkte (höchstens so viel wie die beste Übung mit 8 Punkten).

const deg = (x: number) => (x * 180) / Math.PI;
const z = (x: number) => x.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const m = (x: number) => x.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Fall = 'sin' | 'cos' | 'tan';

function runde(): AuswahlRunde {
  const fall = zufall<Fall>(['sin', 'cos', 'tan']);
  const alpha = 18 + Math.random() * 26;
  const L = zufall([1.6, 1.72, 1.8, 2.0, 2.1]);
  const ge = Math.round(L * Math.sin((alpha * Math.PI) / 180) * 100) / 100;
  const an = Math.round(L * Math.cos((alpha * Math.PI) / 180) * 100) / 100;
  const hy = L;
  const [a, b, fn, labels] =
    fall === 'sin'
      ? [ge, hy, '\\sin', { boden: '', ruecken: `${m(ge)} m`, schraeg: `${m(hy)} m` }]
      : fall === 'cos'
        ? [an, hy, '\\cos', { boden: `${m(an)} m`, ruecken: '', schraeg: `${m(hy)} m` }]
        : [ge, an, '\\tan', { boden: `${m(an)} m`, ruecken: `${m(ge)} m`, schraeg: '' }];
  const q = a / b;
  const richtig = deg(fall === 'sin' ? Math.asin(q) : fall === 'cos' ? Math.acos(q) : Math.atan(q));
  const falschFn = fall === 'tan' ? deg(Math.asin(q)) : deg(Math.atan(q));
  const falschFnName = fall === 'tan' ? '\\sin^{-1}' : '\\tan^{-1}';
  const kandidaten: AuswahlZiel[] = [
    {
      text: <>{z(richtig)}°</>,
      richtig: true,
      erklaerung: (
        <>
          Richtig: <M>{`\\alpha = ${fn}^{-1}\\left(\\dfrac{${m(a)}}{${m(b)}}\\right) \\approx ${z(richtig).replace(',', '{,}')}^\\circ`}</M>.
        </>
      ),
    },
    {
      text: <>{z(falschFn)}°</>,
      erklaerung: (
        <>
          Das ist <M>{`${falschFnName}`}</M> des Verhältnisses. Prüfe, welche Seiten bekannt sind: Daraus folgt die Winkelfunktion.
        </>
      ),
    },
    {
      text: <>{z(90 - richtig)}°</>,
      erklaerung: <>Das ist der andere spitze Winkel oben an der Stütze. Gesucht ist der Winkel unten zwischen Modul und Dach.</>,
    },
  ];
  const falsch = mischen(kandidaten.slice(1));
  const ziele = [falsch[0], ...(Math.random() < 0.5 ? [kandidaten[0], falsch[1]] : [falsch[1], kandidaten[0]])];
  return {
    frage: (
      <div className="bkw-spiel-frage">
        <Dreieck
          boden={an}
          ruecken={ge}
          labels={labels}
          breite={420}
          label={`Modul im rechtwinkligen Dreieck. Bekannt: ${fall === 'sin' ? 'Stütze und Modul' : fall === 'cos' ? 'waagrechter Abstand und Modul' : 'Stütze und waagrechter Abstand'}. Gesucht ist der Winkel Alpha.`}
        />
        <p>Welches Modul hat den richtigen Neigungswinkel <M>\alpha</M>?</p>
      </div>
    ),
    ziele,
  };
}

export default function SonnenSpiel() {
  return (
    <AuswahlSpiel
      neueRunden={() => [runde(), runde(), runde(), runde()]}
      symbol="fa-solar-panel"
      start={
        <p>
          Vier Module, jedes mit anderen Maßen. Berechne mit dem Taschenrechner den Neigungswinkel und tippe auf das Modul mit dem richtigen Wert.
          Jeder Treffer bringt eine Münze.
        </p>
      }
      tipp={
        <>
          Erst die Seiten vom Winkel aus benennen, dann die passende Umkehrfunktion: zwei Katheten <M>{'\\tan^{-1}'}</M>, mit Hypotenuse{' '}
          <M>{'\\sin^{-1}'}</M> oder <M>{'\\cos^{-1}'}</M>.
        </>
      }
    />
  );
}
