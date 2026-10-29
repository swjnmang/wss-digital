import { useEffect, useState, type ReactNode } from 'react';
import { useSpielPunkte } from '../../../lineare_funktionen/lernsituation_kit/punkte';
import { M, fmt, rnd, shuffle } from '../../lernpfad/kit';
import { BaumBild } from './Tueten';

// Bonus-Spiel „Pfade-Jagd“ am Ende der Lernsituation „Die Wundertüte“: In einer Tüte liegen Lakritz (L) und Zitrone (Z). Zwei Bonbons werden
// ohne Zurücklegen gezogen. Der Baum zeigt die Äste. Die SuS wählen aus drei Werten die richtige Wahrscheinlichkeit für ein Ereignis
// (Produktregel, Summenregel, Gegenereignis). Die falschen Werte sind typische Fehler. Vier Runden, jede richtige Antwort bringt eine Münze.

const RUNDEN = 4;
type Art = 'LL' | 'LZ' | 'verschieden' | 'mind';
type Option = { wert: number; richtig: boolean; grund: string };
type Runde = { l: number; z: number; art: Art; optionen: Option[] };

const FRAGE: Record<Art, string> = {
  LL: 'Wie wahrscheinlich ist es, zwei Lakritz zu ziehen?',
  LZ: 'Wie wahrscheinlich ist es, erst Lakritz und dann Zitrone zu ziehen?',
  verschieden: 'Wie wahrscheinlich ist es, zwei verschiedene Sorten zu ziehen?',
  mind: 'Wie wahrscheinlich ist es, mindestens ein Lakritz zu ziehen?',
};
const HI: Record<Art, string[]> = { LL: ['LL'], LZ: ['LZ'], verschieden: ['LZ', 'ZL'], mind: ['LL', 'LZ', 'ZL'] };

function neueRunde(): Runde {
  for (;;) {
    const l = rnd(3, 5);
    const z = rnd(3, 5);
    const n = l + z;
    const art = shuffle<Art>(['LL', 'LZ', 'verschieden', 'mind'])[0];
    const nn = n * (n - 1);
    let richtig: number;
    let falsch: { wert: number; grund: string }[];
    if (art === 'LL') {
      richtig = (l * (l - 1)) / nn;
      falsch = [
        { wert: (l / n) ** 2, grund: 'Das wäre mit Zurücklegen. Im 2. Zug sind aber nur noch n − 1 Bonbons in der Tüte.' },
        { wert: l / n, grund: 'Das ist nur die Wahrscheinlichkeit für den 1. Zug.' },
        { wert: (l - 1) / (n - 1), grund: 'Das ist nur die Wahrscheinlichkeit für den 2. Zug. Beide Äste des Pfades musst du malnehmen.' },
      ];
    } else if (art === 'LZ') {
      richtig = (l * z) / nn;
      falsch = [
        { wert: (l * z) / n ** 2, grund: 'Das wäre mit Zurücklegen. Im 2. Zug sind nur noch n − 1 Bonbons in der Tüte.' },
        { wert: z / (n - 1), grund: 'Das ist nur die Wahrscheinlichkeit für den 2. Zug.' },
        { wert: (2 * l * z) / nn, grund: 'Das ist die Wahrscheinlichkeit für zwei verschiedene Sorten. Hier ist nur ein Pfad gefragt: erst L, dann Z.' },
      ];
    } else if (art === 'verschieden') {
      richtig = (2 * l * z) / nn;
      falsch = [
        { wert: (l * z) / nn, grund: 'Das ist nur der Pfad LZ. Der Pfad ZL gehört dazu, die beiden Pfade werden addiert.' },
        { wert: (2 * l * z) / n ** 2, grund: 'Das wäre mit Zurücklegen. Im 2. Zug sind nur noch n − 1 Bonbons in der Tüte.' },
        { wert: 1 - (2 * l * z) / nn, grund: 'Das ist die Wahrscheinlichkeit für zwei gleiche Sorten, also das Gegenereignis.' },
      ];
    } else {
      richtig = 1 - (z * (z - 1)) / nn;
      falsch = [
        { wert: (z * (z - 1)) / nn, grund: 'Das ist die Wahrscheinlichkeit für kein Lakritz (zwei Zitronen). Du musst sie noch von 1 abziehen.' },
        { wert: 1 - (z / n) ** 2, grund: 'Das wäre mit Zurücklegen. Im 2. Zug sind nur noch n − 1 Bonbons in der Tüte.' },
        { wert: l / n, grund: 'Das ist nur die Wahrscheinlichkeit für ein Lakritz im 1. Zug.' },
      ];
    }
    const werte = [richtig, ...falsch.map((f) => f.wert)].map((w) => Math.round(w * 1000));
    if (new Set(werte).size < 4) continue;
    const optionen = shuffle<Option>([
      { wert: richtig, richtig: true, grund: '' },
      ...shuffle(falsch)
        .slice(0, 2)
        .map((f) => ({ ...f, richtig: false })),
    ]);
    // Antwort A ist nie die richtige
    if (optionen[0].richtig) [optionen[0], optionen[1]] = [optionen[1], optionen[0]];
    return { l, z, art, optionen };
  }
}

const prozent = (p: number) => `${fmt(p * 100, 1)} %`;

function Erklaerung({ r }: { r: Runde }): ReactNode {
  const n = r.l + r.z;
  switch (r.art) {
    case 'LL':
      return <M>{`P(LL) = \\frac{${r.l}}{${n}} \\cdot \\frac{${r.l - 1}}{${n - 1}} = \\frac{${r.l * (r.l - 1)}}{${n * (n - 1)}}`}</M>;
    case 'LZ':
      return <M>{`P(LZ) = \\frac{${r.l}}{${n}} \\cdot \\frac{${r.z}}{${n - 1}} = \\frac{${r.l * r.z}}{${n * (n - 1)}}`}</M>;
    case 'verschieden':
      return <M>{`P = \\frac{${r.l}}{${n}} \\cdot \\frac{${r.z}}{${n - 1}} + \\frac{${r.z}}{${n}} \\cdot \\frac{${r.l}}{${n - 1}} = \\frac{${2 * r.l * r.z}}{${n * (n - 1)}}`}</M>;
    default:
      return <M>{`P = 1 - P(ZZ) = 1 - \\frac{${r.z}}{${n}} \\cdot \\frac{${r.z - 1}}{${n - 1}} = \\frac{${n * (n - 1) - r.z * (r.z - 1)}}{${n * (n - 1)}}`}</M>;
  }
}

export default function PfadeJagd() {
  const [runde, setRunde] = useState(0);
  const [r, setR] = useState<Runde>(neueRunde);
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [muenzen, setMuenzen] = useState(0);
  const [ende, setEnde] = useState(false);
  const meldeSpiel = useSpielPunkte();

  useEffect(() => {
    if (ende) meldeSpiel(muenzen, RUNDEN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ende]);

  const n = r.l + r.z;
  const waehle = (i: number) => {
    if (gewaehlt !== null) return;
    setGewaehlt(i);
    if (r.optionen[i].richtig) setMuenzen((m) => m + 1);
  };
  const weiter = () => {
    if (runde + 1 >= RUNDEN) return setEnde(true);
    setRunde(runde + 1);
    setR(neueRunde());
    setGewaehlt(null);
  };
  const nochmal = () => {
    setRunde(0);
    setR(neueRunde());
    setGewaehlt(null);
    setMuenzen(0);
    setEnde(false);
  };

  return (
    <div className="wt-spiel" data-no-autocheck>
      <div className="wt-spiel-kopf">
        <span>{ende ? 'Geschafft!' : `Runde ${runde + 1} von ${RUNDEN}`}</span>
        <span className="wt-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' wt-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {ende ? (
        <>
          <p className="wt-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-gift'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN} Münzen eingesammelt.{' '}
            {muenzen === RUNDEN ? 'Perfekt, du bist der Pfadfinder des Schulfests!' : muenzen >= 3 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
          </p>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={nochmal}>
              <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="wt-spiel-frage">
            In der Tüte sind <strong>{r.l} Lakritz (L)</strong> und <strong>{r.z} Zitrone (Z)</strong>. Du ziehst zwei Bonbons ohne Zurücklegen.{' '}
            <strong>{FRAGE[r.art]}</strong>
          </p>
          <BaumBild
            erste={[
              { label: 'L', p: `${r.l}/${n}` },
              { label: 'Z', p: `${r.z}/${n}` },
            ]}
            zweite={[
              [
                { label: 'L', p: `${r.l - 1}/${n - 1}` },
                { label: 'Z', p: `${r.z}/${n - 1}` },
              ],
              [
                { label: 'L', p: `${r.l}/${n - 1}` },
                { label: 'Z', p: `${r.z - 1}/${n - 1}` },
              ],
            ]}
            hi={gewaehlt === null ? [] : HI[r.art]}
            label={`Baumdiagramm: Im ersten Zug ${r.l} von ${n} Lakritz und ${r.z} von ${n} Zitrone. Im zweiten Zug ändern sich die Brüche, weil ein Bonbon fehlt.`}
          />
          <div className="wt-optionen" role="group" aria-label="Wähle die richtige Wahrscheinlichkeit">
            {r.optionen.map((o, i) => (
              <button
                key={i}
                type="button"
                className={`bk-btn wt-option${gewaehlt === i ? (o.richtig ? ' wt-richtig' : ' wt-falsch') : gewaehlt !== null && o.richtig ? ' wt-richtig' : ''}`}
                disabled={gewaehlt !== null}
                onClick={() => waehle(i)}
              >
                {prozent(o.wert)}
              </button>
            ))}
          </div>
          {gewaehlt !== null && (
            <>
              <div className={`bk-feedback lp-feedback ${r.optionen[gewaehlt].richtig ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
                <i className={`fa-solid ${r.optionen[gewaehlt].richtig ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
                <span>
                  {r.optionen[gewaehlt].richtig ? 'Münze eingesammelt! ' : `Leider falsch. ${r.optionen[gewaehlt].grund} `}
                  Richtig ist <Erklaerung r={r} /> = {prozent(r.optionen.find((o) => o.richtig)!.wert)}.
                </span>
              </div>
              <div className="bk-actions">
                <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
                  {runde + 1 >= RUNDEN ? 'Zum Ergebnis' : 'Nächste Runde'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
