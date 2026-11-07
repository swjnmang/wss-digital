import type { ReactNode } from 'react';
import { M } from '../../daten_und_zufall/lernpfad/kit';
import AuswahlSpiel, { mischen, zufall, type AuswahlRunde, type AuswahlZiel } from '../../lineare_funktionen/lernsituation_kit/AuswahlSpiel';
import Dreieck from '../sinus_kosinus_tangens_einstieg/Dreieck';

// Bonus-Spiel „Leiter-Einsatz“: Jede Runde nennt eine Leiter (Länge und Winkel) und fragt nach Höhe oder Abstand, oder sie nennt die
// Höhe und fragt nach der Leiterlänge. Vier Fenster stehen
// zur Wahl, nur eines ist richtig. Falsche Fenster: Sinus und Kosinus vertauscht, durch statt mal, Tangens statt Sinus bzw. Kosinus.
// 4 Runden à 2 Punkte = 8 Punkte (höchstens so viel wie die beste Übung mit 8 Punkten).

const rad = (g: number) => (g * Math.PI) / 180;
const z = (x: number) => x.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function runde(): AuswahlRunde {
  const w = zufall([55, 58, 60, 62, 65, 68, 72, 75]);
  const art = zufall(['hoehe', 'abstand', 'leiter'] as const);
  const sin = Math.sin(rad(w));
  const cos = Math.cos(rad(w));
  let kandidaten: AuswahlZiel[];
  let labels: { boden: string; ruecken: string; schraeg: string };
  let gesucht: string;
  let gegeben: ReactNode;
  if (art === 'leiter') {
    const H = zufall([8, 10, 12, 15, 18, 20, 22, 25]);
    labels = { boden: '', ruecken: `Höhe ${H} m`, schraeg: 'Leiter ?' };
    gesucht = 'die Länge der Leiter';
    gegeben = <>Höhe <M>{`${H}\\,\\text{m}`}</M>, Winkel <M>{`${w}^\\circ`}</M>.</>;
    kandidaten = [
      { text: <>{z(H / sin)} m</>, richtig: true, erklaerung: <>Richtig: Die Leiter steht im Nenner, also <M>{`${H} : \\sin(${w}^\\circ)`}</M>.</> },
      { text: <>{z(H * sin)} m</>, erklaerung: <>Das ist <M>{`${H} \\cdot \\sin(${w}^\\circ)`}</M>. Die Leiter steht im Nenner, deshalb wird geteilt. Außerdem ist die Leiter länger als die Höhe.</> },
      { text: <>{z(H / cos)} m</>, erklaerung: <>Der Kosinus gehört zur Ankathete. Die Höhe liegt dem Winkel gegenüber, also brauchst du den Sinus.</> },
      { text: <>{z(H)} m</>, erklaerung: 'Die Leiter steht schräg. Sie muss länger sein als die Höhe, die sie erreichen soll.' },
    ];
  } else {
    const L = zufall([8, 10, 12, 15, 18, 20, 24, 26, 30]);
    const hoehe = art === 'hoehe';
    labels = { boden: hoehe ? '' : 'Abstand ?', ruecken: hoehe ? 'Höhe ?' : '', schraeg: `Leiter ${L} m` };
    gesucht = hoehe ? 'die Höhe der Spitze' : 'der Abstand zur Wand';
    gegeben = <>Leiter <M>{`${L}\\,\\text{m}`}</M>, Winkel <M>{`${w}^\\circ`}</M>.</>;
    const fn = hoehe ? '\\sin' : '\\cos';
    kandidaten = [
      { text: <>{z(L * (hoehe ? sin : cos))} m</>, richtig: true, erklaerung: <>Richtig: Die Leiter ist die Hypotenuse, also <M>{`${L} \\cdot ${fn}(${w}^\\circ)`}</M>.</> },
      { text: <>{z(L * (hoehe ? cos : sin))} m</>, erklaerung: <>Sinus und Kosinus sind vertauscht. Das ist {hoehe ? 'der Abstand' : 'die Höhe'}.</> },
      { text: <>{z(L / (hoehe ? sin : cos))} m</>, erklaerung: 'Hier wurde geteilt. Die gesuchte Seite steht im Zähler, also wird multipliziert. Keine Kathete ist länger als die Leiter.' },
      { text: <>{z(hoehe ? L * Math.tan(rad(w)) : L / Math.tan(rad(w)))} m</>, erklaerung: 'Der Tangens verbindet die beiden Katheten. Bekannt ist hier aber die Leiter, also die Hypotenuse.' },
    ];
  }
  // Fehloptionen mischen, die richtige Lösung nie an die erste Stelle
  const falsch = mischen(kandidaten.slice(1));
  const pos = 1 + Math.floor(Math.random() * 3);
  const ziele = [...falsch];
  ziele.splice(pos, 0, kandidaten[0]);
  return {
    frage: (
      <div className="dl-spiel-frage">
        <Dreieck
          boden={cos}
          ruecken={sin}
          labels={labels}
          winkelText={`${w}°`}
          breite={420}
          label={`Leiter um ${w} Grad aufgerichtet. Gesucht ist ${gesucht}.`}
        />
        <p>
          {gegeben} Hinter welchem Fenster steht {gesucht}?
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
          Die Leiter ist immer die Hypotenuse. Höhe = Leiter <M>\cdot \sin</M>, Abstand = Leiter <M>\cdot \cos</M>, Leiter = Höhe <M>: \sin</M>.
        </>
      }
    />
  );
}
