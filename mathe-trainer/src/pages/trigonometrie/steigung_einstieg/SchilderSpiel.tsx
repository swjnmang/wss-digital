import { M } from '../../daten_und_zufall/lernpfad/kit';
import AuswahlSpiel, { mischen, zufall, type AuswahlRunde, type AuswahlZiel } from '../../lineare_funktionen/lernsituation_kit/AuswahlSpiel';

// Bonus-Spiel „Schilderwald“: Jede Runde zeigt ein Steigungsschild (Prozent) oder eine Angabe aus einem Datenblatt (Grad). Vier Schilder
// stehen zur Wahl, nur eines rechnet richtig um. Falsche Schilder: gleiche Zahl übernommen, Faktor 100 vergessen, der andere Winkel (90° − α).
// 4 Runden à 2 Punkte = 8 Punkte (höchstens so viel wie die beste Übung mit 8 Punkten).

const rad = (g: number) => (g * Math.PI) / 180;
const deg = (x: number) => (x * 180) / Math.PI;
const z = (x: number, d = 1) => x.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });

function runde(): AuswahlRunde {
  const prozentNachGrad = Math.random() < 0.5;
  let richtig: AuswahlZiel;
  let falsch: AuswahlZiel[];
  let frage: string;
  if (prozentNachGrad) {
    const p = zufall([6, 8, 10, 12, 15, 18, 20, 24, 30]);
    const a = deg(Math.atan(p / 100));
    frage = `Das Schild zeigt ${p} %. Wie groß ist der Steigungswinkel?`;
    richtig = { text: <>{z(a)}°</>, richtig: true, erklaerung: <>Richtig: <M>{`\\alpha = \\tan^{-1}(${p} : 100) \\approx ${z(a).replace(',', '{,}')}^\\circ`}</M>.</> };
    falsch = [
      { text: <>{p}°</>, erklaerung: 'Prozent und Grad sind verschiedene Einheiten. Die Zahl lässt sich nicht einfach übernehmen.' },
      { text: <>{z(deg(Math.atan(p)))}°</>, erklaerung: <>Hier wurde <M>{`\\tan^{-1}(${p})`}</M> gerechnet. Die Prozentzahl muss erst durch 100 geteilt werden.</> },
      { text: <>{z(90 - a)}°</>, erklaerung: 'Das ist der Winkel oben im Steigungsdreieck. Gesucht ist der Winkel zur Waagrechten.' },
    ];
  } else {
    const a = zufall([3, 5, 8, 10, 12, 15, 20]);
    const p = Math.tan(rad(a)) * 100;
    frage = `Das Datenblatt nennt ${a}°. Wie viel Prozent Steigung sind das?`;
    richtig = { text: <>{z(p)} %</>, richtig: true, erklaerung: <>Richtig: <M>{`\\tan(${a}^\\circ) \\cdot 100\\,\\% \\approx ${z(p).replace(',', '{,}')}\\,\\%`}</M>.</> };
    falsch = [
      { text: <>{a} %</>, erklaerung: 'Grad und Prozent sind verschiedene Einheiten. Die Zahl lässt sich nicht einfach übernehmen.' },
      { text: <>{z(p / 100, 2)} %</>, erklaerung: <>Das ist nur <M>{`\\tan(${a}^\\circ)`}</M>. Für Prozent musst du noch mit 100 multiplizieren.</> },
      { text: <>{z(Math.sin(rad(a)) * 100)} %</>, erklaerung: 'Das ist der Sinus. Die Steigung ist Höhe durch waagrechte Strecke, also der Tangens.' },
    ];
  }
  const f = mischen(falsch);
  const pos = 1 + Math.floor(Math.random() * 3);
  const ziele = [...f];
  ziele.splice(pos, 0, richtig);
  return { frage: <p className="lr-spiel-frage">{frage}</p>, ziele };
}

export default function SchilderSpiel() {
  return (
    <AuswahlSpiel
      neueRunden={() => [runde(), runde(), runde(), runde()]}
      symbol="fa-sign-hanging"
      start={
        <p>
          Vier Kundinnen und Kunden, vier Steigungen. Rechne mit dem Taschenrechner um und tippe auf das Schild mit dem richtigen Wert. Jeder
          Treffer bringt eine Münze.
        </p>
      }
      tipp={
        <>
          Prozent nach Grad: <M>{'\\alpha = \\tan^{-1}(p : 100)'}</M>. Grad nach Prozent: <M>{'p = \\tan(\\alpha) \\cdot 100\\,\\%'}</M>.
        </>
      }
    />
  );
}
