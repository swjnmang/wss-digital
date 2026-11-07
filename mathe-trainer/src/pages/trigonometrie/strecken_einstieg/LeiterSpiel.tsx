import { M } from '../../daten_und_zufall/lernpfad/kit';
import AuswahlSpiel, { mischen, zufall, type AuswahlRunde, type AuswahlZiel } from '../../lineare_funktionen/lernsituation_kit/AuswahlSpiel';
import Dreieck from '../sinus_kosinus_tangens_einstieg/Dreieck';

// Bonus-Spiel „Leiter-Einsatz“: Jede Runde nennt eine Leiter (Länge und Winkel) und fragt nach Höhe oder Abstand. Vier Fenster stehen
// zur Wahl, nur eines ist richtig. Falsche Fenster: Sinus und Kosinus vertauscht, durch statt mal, Tangens statt Sinus bzw. Kosinus.
// 4 Runden à 2 Punkte = 8 Punkte (höchstens so viel wie die beste Übung mit 8 Punkten).

const rad = (g: number) => (g * Math.PI) / 180;
const z = (x: number) => x.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function runde(): AuswahlRunde {
  const L = zufall([8, 10, 12, 15, 18, 20, 24, 26, 30]);
  const w = zufall([55, 58, 60, 62, 65, 68, 72, 75]);
  const frageHoehe = Math.random() < 0.5;
  const sin = L * Math.sin(rad(w));
  const cos = L * Math.cos(rad(w));
  const richtigWert = frageHoehe ? sin : cos;
  const fn = frageHoehe ? '\\sin' : '\\cos';
  const andere = frageHoehe ? '\\cos' : '\\sin';
  const kandidaten: AuswahlZiel[] = [
    {
      text: <>{z(richtigWert)} m</>,
      richtig: true,
      erklaerung: (
        <>
          Richtig: Die Leiter ist die Hypotenuse, {frageHoehe ? 'die Höhe die Gegenkathete' : 'der Abstand die Ankathete'}. Also{' '}
          <M>{`${L} \\cdot ${fn}(${w}^\\circ)`}</M>.
        </>
      ),
    },
    {
      text: <>{z(frageHoehe ? cos : sin)} m</>,
      erklaerung: (
        <>
          Das ist <M>{`${L} \\cdot ${andere}(${w}^\\circ)`}</M>, also {frageHoehe ? 'der Abstand' : 'die Höhe'}. Sinus und Kosinus sind vertauscht.
        </>
      ),
    },
    {
      text: <>{z(L / (frageHoehe ? Math.sin(rad(w)) : Math.cos(rad(w))))} m</>,
      erklaerung: (
        <>
          Das ist <M>{`${L} : ${fn}(${w}^\\circ)`}</M>. Die Leiter steht im Nenner der Formel, deshalb wird mit ihr multipliziert. Außerdem kann keine
          Kathete länger als die Leiter sein.
        </>
      ),
    },
    {
      text: <>{z(frageHoehe ? L * Math.tan(rad(w)) : L / Math.tan(rad(w)))} m</>,
      erklaerung: <>Der Tangens verbindet die beiden Katheten. Bekannt ist hier aber die Leiter, also die Hypotenuse.</>,
    },
  ];
  // Fehloptionen mischen, die richtige Lösung nie an die erste Stelle
  const falsch = mischen(kandidaten.slice(1));
  const pos = 1 + Math.floor(Math.random() * 3);
  const ziele = [...falsch];
  ziele.splice(pos, 0, kandidaten[0]);
  return {
    frage: (
      <div className="dl-spiel-frage">
        <Dreieck
          boden={Math.cos(rad(w))}
          ruecken={Math.sin(rad(w))}
          labels={{ boden: frageHoehe ? '' : 'Abstand ?', ruecken: frageHoehe ? 'Höhe ?' : '', schraeg: `Leiter ${L} m` }}
          winkelText={`${w}°`}
          breite={420}
          label={`Leiter ${L} Meter, um ${w} Grad aufgerichtet. Gesucht ist ${frageHoehe ? 'die Höhe der Spitze' : 'der Abstand zur Wand'}.`}
        />
        <p>
          Leiter <M>{`${L}\\,\\text{m}`}</M>, Winkel <M>{`${w}^\\circ`}</M>. Hinter welchem Fenster steht {frageHoehe ? 'die Höhe der Spitze' : 'der Abstand zur Wand'}?
        </p>
      </div>
    ),
    ziele,
  };
}

export default function LeiterSpiel() {
  return (
    <AuswahlSpiel
      neueRunden={() => [runde(), runde(), runde(), runde()]}
      symbol="fa-fire-extinguisher"
      start={
        <p>
          Vier Einsätze, vier Leitern. Rechne mit dem Taschenrechner und tippe auf das Fenster mit dem richtigen Wert. Jeder Treffer bringt eine
          Münze.
        </p>
      }
      tipp={
        <>
          Die Leiter ist immer die Hypotenuse. Höhe = Leiter <M>\cdot \sin</M>, Abstand = Leiter <M>\cdot \cos</M>.
        </>
      }
    />
  );
}
