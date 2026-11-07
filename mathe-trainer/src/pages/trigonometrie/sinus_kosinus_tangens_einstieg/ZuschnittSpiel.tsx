import { M } from '../../daten_und_zufall/lernpfad/kit';
import AuswahlSpiel, { mischen, zufall, type AuswahlRunde, type AuswahlZiel } from '../../lineare_funktionen/lernsituation_kit/AuswahlSpiel';
import Dreieck, { rolle, type Kante } from './Dreieck';

// Bonus-Spiel „Laser-Zuschnitt“: Jede Runde zeigt ein Seitenteil mit markiertem Winkel. Der Laser schneidet nur das Teil, dessen
// Bruch zur gefragten Winkelfunktion passt. Falsche Ziele: die beiden anderen Funktionen und der Kehrwert (typische Fehler).
// 3 Runden à 2 Punkte = 6 Punkte (höchstens so viel wie die beste Übung mit 7 Punkten).

const TRIPEL: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
];
const FN = ['sin', 'cos', 'tan'] as const;
type Fn = (typeof FN)[number];
const NAME: Record<Fn, string> = { sin: 'Sinus', cos: 'Kosinus', tan: 'Tangens' };

function runde(): AuswahlRunde {
  const [k1, k2, h] = zufall(TRIPEL);
  const tausch = Math.random() < 0.5;
  const len: Record<Kante, number> = { boden: tausch ? k2 : k1, ruecken: tausch ? k1 : k2, schraeg: h };
  const winkel = zufall(['alpha', 'beta'] as const);
  const fn = zufall(FN);
  const seite = (r: 'H' | 'GK' | 'AK') => (['boden', 'ruecken', 'schraeg'] as Kante[]).find((k) => rolle(k, winkel) === r)!;
  const paar: Record<Fn, [number, number]> = {
    sin: [len[seite('GK')], h],
    cos: [len[seite('AK')], h],
    tan: [len[seite('GK')], len[seite('AK')]],
  };
  const w = winkel === 'alpha' ? '\\alpha' : '\\beta';
  const bruch = ([z, n]: [number, number]) => <M>{`\\dfrac{${z}}{${n}}`}</M>;
  const richtig: AuswahlZiel = {
    text: bruch(paar[fn]),
    richtig: true,
    erklaerung: (
      <>
        Richtig: Der {NAME[fn]} ist {fn === 'sin' ? 'Gegenkathete durch Hypotenuse' : fn === 'cos' ? 'Ankathete durch Hypotenuse' : 'Gegenkathete durch Ankathete'}.
      </>
    ),
  };
  const andere: AuswahlZiel[] = FN.filter((f) => f !== fn).map((f) => ({
    text: bruch(paar[f]),
    erklaerung: (
      <>
        Das ist der {NAME[f]} von <M>{w}</M>, nicht der {NAME[fn]}.
      </>
    ),
  }));
  const kehrwert: AuswahlZiel = {
    text: bruch([paar[fn][1], paar[fn][0]]),
    erklaerung: <>Zähler und Nenner sind vertauscht. Das ist der Kehrwert.</>,
  };
  let ziele = mischen([richtig, ...andere, kehrwert]);
  // Das erste Ziel ist nie das richtige
  if (ziele[0].richtig) ziele = [...ziele.slice(1), ziele[0]];
  return {
    frage: (
      <div className="hs-spiel-frage">
        <Dreieck
          boden={len.boden}
          ruecken={len.ruecken}
          labels={{ boden: `${len.boden}`, ruecken: `${len.ruecken}`, schraeg: `${h}` }}
          winkel={winkel}
          breite={420}
          label={`Seitenteil mit Boden ${len.boden}, Rücken ${len.ruecken} und schräger Kante ${h}. Markiert ist der Winkel ${winkel === 'alpha' ? 'Alpha unten vorne' : 'Beta oben'}.`}
        />
        <p>
          Welcher Bruch ist <M>{`\\${fn}(${w})`}</M>? Tippe auf das passende Teil, dann schneidet der Laser.
        </p>
      </div>
    ),
    ziele,
  };
}

export default function ZuschnittSpiel() {
  return (
    <AuswahlSpiel
      neueRunden={() => [runde(), runde(), runde()]}
      symbol="fa-bolt"
      lob="Sauber geschnitten!"
      start={
        <p>
          Der Lasercutter hat drei neue Aufträge. Jedes Mal ist ein Winkel markiert und eine Winkelfunktion gefragt. Tippe auf den passenden
          Bruch. Jeder richtige Schnitt bringt eine Münze.
        </p>
      }
      tipp={
        <>
          Bestimme zuerst vom markierten Winkel aus die Gegenkathete (gegenüber) und die Ankathete (liegt am Winkel). Die Hypotenuse liegt dem
          rechten Winkel gegenüber.
        </>
      }
    />
  );
}
