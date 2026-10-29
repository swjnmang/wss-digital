import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskShell from '../../../../components/layout/TaskShell';
import { Beispiel, M, MB, Merke, QuerTabelle } from '../../lernpfad/kit';
import { CheckCard, Hilfen, McCard, TrackedCheck, TrackedMc } from '../../../lineare_funktionen/lernsituation_kit/kit';
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Handlungsprodukt,
  SeitenLernsituation,
  type Seite,
  type Thema,
} from '../../../lineare_funktionen/lernsituation_kit/seiten';
import { Bilanz } from '../../../lineare_funktionen/lernsituation_kit/punkte';
import { Kriterien, Vermutung, Zitat, type Festlegung } from '../../../finanzmathe/zins_kit/zins_kit';
import { metaFor } from '../meta';
import PizzaRallye from './PizzaRallye';
import '../../lernpfad/lernpfad.css';
import './pizzabote.css';

// Lernsituation 5.4 „Der Pizzabote“: statistische Kennwerte (Spannweite, Modalwert, Median, arithmetisches Mittel), ca. 45 bis 60 min.
// Format Entscheidungsfall: Zwei Pizzerien werben mit „Wir liefern in 20 Minuten!“. Die Klasse hat Lieferzeiten gestoppt (Blitz-Pizza 10,
// Mamma Mia 9). Wer wartet im Schnitt weniger lange? Mit dem Auge und den Extremwerten kommen die SuS nicht sicher weiter, die vier
// Kennwerte fassen die Daten zusammen. Aha: Die Pizzeria mit der schlimmsten Lieferung (44 min) ist im Schnitt die schnellere
// (Mittelwert 19 min gegen 20,2 min, Median 16,5 min gegen 20 min), dafür ist sie weniger zuverlässig (Spannweite 32 min gegen 5 min).
// Lernprodukt analog: Kennwerte-Steckbrief der Blitz-Pizza im Heft (Zahlengerade, vier Kennwerte, Urteil).
// Identität: Themenfarbe Beere, Symbol Pizzastück, Titelbild Roller mit Pizzakarton und Stoppuhr, Leitobjekt Pizzakarton mit Stoppuhr
// (die Lieferzeiten sind kleine Pizzen auf der Zahlengerade).
// Punkte (Pflicht): Warm-up 2+2+2+2+3 = 11 (19 %), Problem erkennen 3+2+2 = 7, Problem lösen 15+4+5 = 24 (41 %),
// Übungen 4+6+7 = 17 (29 %), zusammen 59. Profi-Aufgabe 9, Bonus-Spiel höchstens 4 · 2 = 8.

/** Lernvideo zu den statistischen Kennwerten (auch bei den Übungsaufgaben unter /daten-und-zufall/statistische-kennwerte verlinkt) */
export const VIDEO_KENNWERTE = 'https://www.youtube.com/watch?v=UxKgca3l1G4';

/* ── Situation ───────────────────────────────────────────────────────────── */

// Blitz-Pizza (n = 10, gerade): sortiert 12 14 15 15 16 17 18 19 20 44 → R = 32, x_mod = 15, x_med = 16,5, Mittel = 190 : 10 = 19
const BLITZ = [18, 15, 44, 12, 16, 15, 20, 17, 14, 19];
// Mamma Mia (n = 9, ungerade): sortiert 18 19 19 20 20 20 21 22 23 → R = 5, x_mod = 20, x_med = 20, Mittel = 182 : 9 ≈ 20,2
const MAMMA = [20, 22, 19, 21, 20, 18, 23, 19, 20];

const BLITZ_SORT = [...BLITZ].sort((a, b) => a - b);
const BLITZ_R = 32;
const BLITZ_MOD = 15;
const BLITZ_MED = 16.5;
const BLITZ_MITTEL = 19;
const MAMMA_MITTEL = 182 / 9;

type Wahl = 'mamma' | 'gleich' | 'blitz';
// Antwort A (die erste) ist nie die richtige
const WAHL: Record<Wahl, string> = {
  mamma: 'Bei Mamma Mia wartet man im Schnitt weniger lange.',
  gleich: 'Beide Pizzerien sind im Schnitt etwa gleich schnell.',
  blitz: 'Bei der Blitz-Pizza wartet man im Schnitt weniger lange.',
};

/* ── Identität ───────────────────────────────────────────────────────────── */

const META = metaFor('kennwerte');

/** Titelbild: Roller mit Pizzakarton, daneben ein offener Pizzakarton und die Stoppuhr mit dem Versprechen „20 min“ */
function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Ein Pizzabote auf einem Roller mit Pizzakarton auf dem Gepäckträger. Links ein offener Pizzakarton und eine Stoppuhr mit dem Versprechen 20 Minuten."
    >
      <rect x="0" y="206" width="720" height="46" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="206" y2="206" stroke="var(--ink)" strokeWidth="2" />
      {/* Stoppuhr */}
      <rect x="62" y="30" width="22" height="12" rx="3" fill="var(--ink)" />
      <rect x="54" y="40" width="38" height="8" rx="3" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="73" cy="104" r="54" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
      <path d="M73 104 L73 66 A38 38 0 0 1 106 85 Z" fill="var(--primary-soft)" />
      <line x1="73" x2="73" y1="104" y2="64" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="73" cy="104" r="5" fill="var(--ink)" />
      {[0, 1, 2, 3].map((k) => (
        <line key={k} x1="73" x2="73" y1="54" y2="62" stroke="var(--ink)" strokeWidth="3" transform={`rotate(${k * 90} 73 104)`} />
      ))}
      <text x="73" y="184" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
        20 min
      </text>
      {/* offener Pizzakarton */}
      <polygon points="160,120 300,120 316,86 176,86" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <polygon points="150,196 310,196 310,140 150,140" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <ellipse cx="230" cy="140" rx="86" ry="22" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <ellipse cx="230" cy="138" rx="66" ry="15" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      {[198, 222, 246, 266].map((x, i) => (
        <circle key={x} cx={x} cy={134 + (i % 2) * 6} r="5" fill="var(--primary)" stroke="var(--ink)" strokeWidth="1.5" />
      ))}
      <line x1="230" x2="230" y1="124" y2="152" stroke="var(--ink)" strokeWidth="2" />
      <line x1="196" x2="264" y1="132" y2="146" stroke="var(--ink)" strokeWidth="2" />
      {/* Roller mit Pizzabote */}
      <rect x="402" y="96" width="76" height="52" rx="6" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
      <circle cx="440" cy="122" r="16" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M440 110 L440 122 L450 122" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M420 202 L420 168 Q420 154 436 154 L560 154 Q584 154 590 172 L600 202 Z"
        fill="var(--primary)"
        stroke="var(--ink)"
        strokeWidth="2.5"
      />
      <path d="M560 154 L574 100 L612 100" fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="502" cy="108" r="15" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2.5" />
      <path d="M502 124 L508 154 M508 140 L560 128" fill="none" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="446" cy="204" r="22" fill="var(--ink)" />
      <circle cx="446" cy="204" r="8" fill="var(--surface)" />
      <circle cx="580" cy="204" r="22" fill="var(--ink)" />
      <circle cx="580" cy="204" r="8" fill="var(--surface)" />
      <line x1="650" x2="690" y1="150" y2="150" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <line x1="640" x2="700" y1="168" y2="168" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

const THEMA: Thema = { ...META.thema, bild: <Titelbild /> };

/* ── Leitobjekt: Zahlengerade mit Pizzen und Stoppuhr-Marke ─────────────── */

const AX0 = 44;
const AX1 = 676;
const VMIN = 10;
const VMAX = 46;
const PX = (v: number) => AX0 + ((v - VMIN) * (AX1 - AX0)) / (VMAX - VMIN);
const PR = 8;

/**
 * Punktdiagramm der Lieferzeiten: jede Lieferung ist eine kleine Pizza auf der Zahlengerade, gleiche Werte stapeln sich.
 * Die gestrichelte Marke bei 20 min ist das Versprechen der Pizzeria. Es sind nur die Daten zu sehen, keine Kennwerte.
 */
function Zahlengerade({ reihen }: { reihen: { name: string; daten: number[] }[] }) {
  const hoehen = reihen.map((r) => {
    const stapel = Math.max(...Object.values(r.daten.reduce<Record<number, number>>((a, v) => ({ ...a, [v]: (a[v] ?? 0) + 1 }), {})));
    return 38 + stapel * 2 * PR + 8;
  });
  const tops = hoehen.map((_, i) => hoehen.slice(0, i).reduce((s, h) => s + h + 62, 4));
  const gesamt = tops[tops.length - 1] + hoehen[hoehen.length - 1] + 58;
  const ticks = [10, 15, 20, 25, 30, 35, 40, 45];
  return (
    <svg
      viewBox={`0 0 720 ${gesamt}`}
      role="img"
      aria-label={`Zahlengerade der Lieferzeiten in Minuten von 10 bis 46. ${reihen
        .map((r) => `${r.name}: ${[...r.daten].sort((a, b) => a - b).join(', ')} Minuten`)
        .join('. ')}. Eine gestrichelte Marke zeigt das Versprechen von 20 Minuten.`}
    >
      {reihen.map((r, i) => {
        const achse = tops[i] + hoehen[i];
        const zaehler: Record<number, number> = {};
        return (
          <g key={r.name}>
            <text x={AX0 - 20} y={tops[i] + 20} fontSize="17" fontWeight="800" fill="var(--ink)">
              {r.name}
            </text>
            <line x1={PX(20)} x2={PX(20)} y1={tops[i] + 28} y2={achse} stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="6 5" />
            <text x={PX(20) + 8} y={tops[i] + 20} fontSize="15" fontWeight="700" fill="var(--primary)">
              Versprechen: 20 min
            </text>
            {r.daten.map((v, k) => {
              zaehler[v] = (zaehler[v] ?? 0) + 1;
              return (
                <g key={k}>
                  <circle cx={PX(v)} cy={achse - 2 - PR - (zaehler[v] - 1) * 2 * PR} r={PR} fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.8" />
                  <path
                    d={`M${PX(v)} ${achse - 2 - PR - (zaehler[v] - 1) * 2 * PR} l-3.5 -2 M${PX(v)} ${achse - 2 - PR - (zaehler[v] - 1) * 2 * PR} l3.5 -2 M${PX(v)} ${achse - 2 - PR - (zaehler[v] - 1) * 2 * PR} l0 4`}
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </g>
              );
            })}
            <line x1={AX0 - 12} x2={AX1 + 12} y1={achse} y2={achse} stroke="var(--ink)" strokeWidth="2" />
            {Array.from({ length: VMAX - VMIN + 1 }, (_, k) => VMIN + k).map((v) => (
              <line key={v} x1={PX(v)} x2={PX(v)} y1={achse} y2={achse + (ticks.includes(v) ? 8 : 4)} stroke="var(--ink)" strokeWidth="1.5" />
            ))}
            {ticks.map((v) => (
              <text key={v} x={PX(v)} y={achse + 26} textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
                {v}
              </text>
            ))}
            <text x={(AX0 + AX1) / 2} y={achse + 48} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink)">
              Lieferzeit in Minuten
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Handlungsprodukt: Steckbrief auf einer Karteikarte */
function SteckbriefBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Eine Karteikarte mit der Überschrift Steckbrief Blitz-Pizza. Oben eine kleine Zahlengerade mit Punkten, darunter vier Zeilen für Spannweite, Modalwert, Median und Mittelwert und eine Zeile für das Urteil."
      >
        <rect x="150" y="6" width="420" height="178" rx="10" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="150" y="6" width="420" height="34" rx="10" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <text x="170" y="30" fontSize="19" fontWeight="800" fill="var(--ink)">
          Steckbrief: Blitz-Pizza
        </text>
        <circle cx="540" cy="23" r="9" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        <line x1="176" x2="544" y1="70" y2="70" stroke="var(--ink)" strokeWidth="2" />
        {[190, 205, 213, 228, 246, 262, 270, 292, 336, 470].map((x, i) => (
          <circle key={i} cx={x} cy="62" r="5.5" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
        ))}
        <text x="176" y="102" fontSize="17" fill="var(--ink)">
          Spannweite: …  Modalwert: …
        </text>
        <text x="176" y="128" fontSize="17" fill="var(--ink)">
          Median: …  Mittelwert: …
        </text>
        <text x="176" y="160" fontSize="17" fill="var(--ink)">
          <tspan fontStyle="italic">Mein Urteil:</tspan> …
        </text>
      </svg>
    </div>
  );
}

/* ── Rechenbeispiel: Sushi-Lieferdienst ─────────────────────────────────── */

// 8 Lieferzeiten, sortiert 22 24 25 28 30 30 30 35: R = 13, x_mod = 30, x_med = (28 + 30) : 2 = 29, Summe 224, Mittel 28
const BSP_AUFGABE = (
  <p>
    Ein Sushi-Lieferdienst hat acht Lieferzeiten in Minuten notiert: <strong>25, 30, 22, 30, 28, 35, 30, 24</strong>. Bestimme die
    Spannweite, den Modalwert, den Median und das arithmetische Mittel.
  </p>
);
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Daten der Größe nach ordnen und zählen',
    body: (
      <>
        <MB>{'22 \\;\\; 24 \\;\\; 25 \\;\\; 28 \\;\\; 30 \\;\\; 30 \\;\\; 30 \\;\\; 35 \\qquad n = 8'}</MB>
      </>
    ),
  },
  {
    title: 'Spannweite: größter Wert minus kleinster Wert',
    body: <MB>{'R = x_{max} - x_{min} = 35 - 22 = 13 \\text{ min}'}</MB>,
  },
  {
    title: 'Modalwert: der Wert, der am häufigsten vorkommt',
    body: (
      <>
        <p>
          Die 30 kommt dreimal vor, alle anderen Werte höchstens einmal.
        </p>
        <MB>{'x_{mod} = 30 \\text{ min}'}</MB>
      </>
    ),
  },
  {
    title: 'Median: die Mitte der geordneten Liste',
    body: (
      <>
        <p>
          Bei 8 Werten gibt es keinen einzelnen mittleren Wert. Die beiden mittleren Werte sind der 4. und der 5. Wert: 28 und 30. Der Median ist
          ihr Mittelwert. (Bei einer ungeraden Anzahl, z. B. 9 Werten, ist es einfach der 5. Wert.)
        </p>
        <MB>{'x_{med} = \\frac{28 + 30}{2} = 29 \\text{ min}'}</MB>
      </>
    ),
  },
  {
    title: 'Arithmetisches Mittel: Summe aller Werte geteilt durch ihre Anzahl',
    body: (
      <MB>
        {'\\overline{x} = \\frac{22 + 24 + 25 + 28 + 30 + 30 + 30 + 35}{8} = \\frac{224}{8} = 28 \\text{ min}'}
      </MB>
    ),
  },
];

/** Lösungsweg für die Blitz-Pizza */
const LOESUNG = (
  <>
    <MB>{'12 \\;\\; 14 \\;\\; 15 \\;\\; 15 \\;\\; 16 \\;\\; 17 \\;\\; 18 \\;\\; 19 \\;\\; 20 \\;\\; 44 \\qquad n = 10'}</MB>
    <MB>{'R = 44 - 12 = 32 \\text{ min} \\qquad x_{mod} = 15 \\text{ min}'}</MB>
    <MB>{'x_{med} = \\frac{16 + 17}{2} = 16{,}5 \\text{ min}'}</MB>
    <MB>{'\\overline{x} = \\frac{12 + 14 + 15 + 15 + 16 + 17 + 18 + 19 + 20 + 44}{10} = \\frac{190}{10} = 19 \\text{ min}'}</MB>
  </>
);

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function PizzaboteEinstieg() {
  const navigate = useNavigate();
  const onBack = () => navigate('/daten-und-zufall/kennwerte');
  const onPractice = () => navigate('/daten-und-zufall/kennwerte/ueben');
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 28, fest: false });
  const [extrem, setExtrem] = useState<string[]>([]);
  const [geloest, setGeloest] = useState(false);
  const [uebungen, setUebungen] = useState<string[]>([]);
  const extremGeprueft = (k: string) => () => setExtrem((e) => (e.includes(k) ? e : [...e, k]));

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            title="a) Zahlen ordnen"
            rechnen={false}
            punkte={2}
            prompt={
              <p>
                Ordne die Zahlen <M>{'23,\\ 18,\\ 31,\\ 18,\\ 25'}</M> der Größe nach, die kleinste zuerst. Welche Zahl steht an 3. Stelle?
              </p>
            }
            fields={[{ kind: 'num', key: 'z', label: '3. Stelle:', expected: 23, tol: 0 }]}
            solution={<MB>{'18 \\;\\; 18 \\;\\; \\mathbf{23} \\;\\; 25 \\;\\; 31'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            title="b) Summe und Durchschnitt"
            punkte={2}
            prompt={<p>Addiere die Zahlen <M>{'14 + 9 + 21 + 12 + 19'}</M> und teile die Summe durch 5.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 's', label: 'Summe:', expected: 75, tol: 0 },
              { kind: 'num', key: 'q', label: 'Summe : 5 =', expected: 15, tol: 0 },
            ]}
            solution={<MB>{'14 + 9 + 21 + 12 + 19 = 75 \\qquad 75 : 5 = 15'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            title="c) Die Mitte zweier Zahlen"
            punkte={2}
            prompt={<p>Welche Zahl liegt genau in der Mitte zwischen den beiden Zahlen?</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'm1', label: <M>{'16 \\text{ und } 17\\colon'}</M>, expected: 16.5 },
              { kind: 'num', key: 'm2', label: <M>{'24 \\text{ und } 30\\colon'}</M>, expected: 27 },
            ]}
            solution={<MB>{'\\frac{16 + 17}{2} = 16{,}5 \\qquad \\frac{24 + 30}{2} = 27'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            title="d) Zählen"
            rechnen={false}
            punkte={2}
            prompt={
              <p>
                Wie oft kommt die Zahl 4 in dieser Liste vor? <M>{'3,\\ 4,\\ 4,\\ 5,\\ 4,\\ 2,\\ 4,\\ 3'}</M>
              </p>
            }
            fields={[{ kind: 'num', key: 'h', label: 'Anzahl der Vieren:', expected: 4, tol: 0 }]}
            solution={<p>Die 4 steht an 2., 3., 5. und 7. Stelle. Das sind vier Vieren.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            title="e) Unterschied und Runden"
            punkte={3}
            prompt={<p>Berechne den Unterschied und runde dann auf eine Nachkommastelle.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'u', label: <M>{'44 - 12 ='}</M>, expected: 32, tol: 0 },
              { kind: 'num', key: 'r', label: <M>{'182 : 9 \\approx'}</M>, expected: 20.2, tol: 0.0001 },
            ]}
            solution={<MB>{'44 - 12 = 32 \\qquad 182 : 9 = 20{,}222\\ldots \\approx 20{,}2'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Bei der zweiten Aufgabe teilst du mit dem Taschenrechner und schaust nur auf die erste Nachkommastelle.</>,
                  <>Ist die zweite Nachkommastelle kleiner als 5, wird abgerundet.</>,
                  <>
                    <M>{'182 : 9 = 20{,}2222\\ldots'}</M>, die zweite Nachkommastelle ist eine 2.
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
      titel: 'Wer liefert wirklich in 20 Minuten?',
      pflicht: ['fest', 'r1', 'r2'],
      bedingung: 'Halte deine Vermutung fest und lies die Extremwerte ab, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Freitag ist Klassenabend und die Klasse will Pizza bestellen. Zwei Pizzerien werben mit „Wir liefern in 20 Minuten!“: die
            Blitz-Pizza und Mamma Mia. Die Klasse hat bei früheren Bestellungen mit der Stoppuhr mitgemessen, bei der Blitz-Pizza 10-mal, bei
            Mamma Mia 9-mal.
          </p>
          <Zitat wer="Jonas">
            <p>„Bei der Blitz-Pizza haben wir mal 44 Minuten gewartet. Nie wieder!“</p>
          </Zitat>
          <Zitat wer="Lea">
            <p>„Bei mir kam die Pizza von der Blitz-Pizza nach 12 Minuten, noch heiß. Die ist doch viel schneller.“</p>
          </Zitat>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Bei welcher Pizzeria wartet man im Schnitt weniger lange?</p>
            <p>
              Gesucht ist die Pizzeria mit der kürzeren Lieferzeit, wenn man alle gemessenen Lieferzeiten berücksichtigt. Lege dich zuerst
              fest, ohne zu rechnen. Danach liest du aus der Zahlengerade ein paar Werte ab.
            </p>
          </div>
          <div className="zk-bild pb-bild">
            <Zahlengerade
              reihen={[
                { name: 'Blitz-Pizza', daten: BLITZ },
                { name: 'Mamma Mia', daten: MAMMA },
              ]}
            />
          </div>
          <Vermutung
            optionen={WAHL}
            regler={{
              min: 12,
              max: 44,
              step: 1,
              text: (v) => (
                <>
                  Eine <strong>typische</strong> Lieferung der Blitz-Pizza dauert etwa <span className="ls-slider-value">{v} Minuten</span>.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig.teil('fest')}
            gespeichert={(w) => (
              <>
                Deine Vermutung: <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong> Typische Lieferzeit der Blitz-Pizza: etwa{' '}
                <strong>{w.wert} Minuten</strong>.
              </>
            )}
          />
          {fest.fest && (
            <Abschnitt titel="Lies die Extremwerte ab">
              <p className="sl-text">Schau dir die Zahlengerade genau an. Wie weit streuen die Lieferzeiten?</p>
              <CheckCard
                onSolved={() => {
                  fertig.teil('r1')();
                  extremGeprueft('r1')();
                }}
                title="Blitz-Pizza"
                rechnen={false}
                punkte={2}
                prompt={<p>Wie lange dauerte die schnellste und wie lange die langsamste Lieferung der Blitz-Pizza?</p>}
                fieldsRow
                fields={[
                  { kind: 'num', key: 'min', label: 'Schnellste:', expected: 12, unit: 'min', tol: 0 },
                  { kind: 'num', key: 'max', label: 'Langsamste:', expected: 44, unit: 'min', tol: 0 },
                ]}
                solution={<p>Der linkste Punkt liegt bei 12 Minuten, der rechteste bei 44 Minuten.</p>}
              />
              <CheckCard
                onSolved={() => {
                  fertig.teil('r2')();
                  extremGeprueft('r2')();
                }}
                title="Mamma Mia"
                rechnen={false}
                punkte={2}
                prompt={<p>Wie lange dauerte die schnellste und wie lange die langsamste Lieferung von Mamma Mia?</p>}
                fieldsRow
                fields={[
                  { kind: 'num', key: 'min', label: 'Schnellste:', expected: 18, unit: 'min', tol: 0 },
                  { kind: 'num', key: 'max', label: 'Langsamste:', expected: 23, unit: 'min', tol: 0 },
                ]}
                solution={<p>Die Punkte reichen von 18 bis 23 Minuten.</p>}
              />
              {extrem.length === 2 && (
                <div className="ls-back">
                <p className="pb-erkenntnis">
                  <strong>Schon gemerkt?</strong> Die Blitz-Pizza hat die schnellste (12 min) <em>und</em> die langsamste Lieferung (44 min),
                  Mamma Mia liegt eng beieinander. Wer ist nun „im Schnitt“ schneller? Mit dem Auge und den Extremwerten allein kommst du nicht
                  sicher weiter, denn dabei zählen nur zwei Pizzen von 10 bzw. 9. Gleich lernst du Kennwerte, die <strong>alle</strong> Lieferzeiten
                  zu einer Zahl zusammenfassen.
                </p>
                </div>
              )}
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Kennwerte der Blitz-Pizza',
      pflicht: ['rechnung', 'entscheidung', 'produkt'],
      inhalt: (fertig) => {
        const geloestMelden = () => {
          fertig.teil('rechnung')();
          setGeloest(true);
        };
        return (
          <>
            <div className="sl-fokus">
              <p className="sl-fokus-titel">Deine Aufgabe: Fasse die Lieferzeiten der Blitz-Pizza in vier Kennwerten zusammen</p>
              <p>
                Die Klasse hat bei der Blitz-Pizza diese zehn Lieferzeiten in Minuten gemessen: <strong>{BLITZ.join(', ')}</strong>. Bestimme in
                deinem Heft die <strong>Spannweite</strong>, den <strong>Modalwert</strong>, den <strong>Median</strong> und das{' '}
                <strong>arithmetische Mittel</strong>. Danach vergleichst du mit Mamma Mia.
              </p>
            </div>
            <div className="zk-bild pb-bild">
              <Zahlengerade reihen={[{ name: 'Blitz-Pizza', daten: BLITZ }]} />
            </div>
            <BeispielMitVideo video={VIDEO_KENNWERTE} videoTitel="Lernvideo: statistische Kennwerte">
              <Beispiel offen title="Der Sushi-Lieferdienst" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
            </BeispielMitVideo>
            <Abschnitt titel="Vergleiche deine Ergebnisse">
              <CheckCard
                onSolved={geloestMelden}
                title="Kennwerte der Blitz-Pizza"
                punkte={15}
                prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
                fields={[
                  { kind: 'num', key: 'r', label: 'Wie groß ist der Unterschied zwischen der längsten und der kürzesten Lieferzeit (Spannweite)?', expected: BLITZ_R, unit: 'min', tol: 0 },
                  { kind: 'num', key: 'mod', label: 'Welche Lieferzeit kam am häufigsten vor (Modalwert)?', expected: BLITZ_MOD, unit: 'min', tol: 0 },
                  { kind: 'num', key: 'med', label: 'Welcher Wert liegt in der Mitte der geordneten Lieferzeiten (Median)?', expected: BLITZ_MED, unit: 'min', tol: 0.001 },
                  { kind: 'num', key: 'x', label: 'Wie lange dauert eine Lieferung im Durchschnitt (arithmetisches Mittel)?', expected: BLITZ_MITTEL, unit: 'min', tol: 0.001 },
                ]}
                loesungNachFehler
                solution={LOESUNG}
                help={
                  <Hilfen
                    steps={[
                      <>Rechne wie im Beispiel des Sushi-Lieferdienstes. Ordne die Lieferzeiten zuerst der Größe nach.</>,
                      <>
                        Es sind 10 Werte. Beim Median nimmst du die beiden mittleren Werte (5. und 6. Wert) und bildest ihren Mittelwert. Für das
                        Mittel brauchst du die Summe aller Werte.
                      </>,
                      <>
                        Geordnet: <M>{BLITZ_SORT.join('\\;\\; ')}</M>. Spannweite: <M>{'44 - 12'}</M>. Median: <M>{'\\frac{16 + 17}{2}'}</M>. Mittel:{' '}
                        <M>{'190 : 10'}</M>.
                      </>,
                    ]}
                  />
                }
              />
            </Abschnitt>
            <Abschnitt titel="Deine Entscheidung">
              <p className="pb-tabelle-hinweis">
                Die Klasse hat die Kennwerte von Mamma Mia schon ausgerechnet. Vergleiche sie mit deinen Ergebnissen für die Blitz-Pizza.
              </p>
              <QuerTabelle
                rows={[
                  { head: 'Kennwert', cells: ['Spannweite', 'Modalwert', 'Median', 'Mittelwert'] },
                  { head: 'Mamma Mia', cells: ['5 min', '20 min', '20 min', '20,2 min'] },
                  { head: 'Blitz-Pizza', cells: ['…', '…', '…', '…'] },
                ]}
              />
              <McCard
                onSolved={fertig.teil('entscheidung')}
                title="Welche Aussage passt zu den Kennwerten?"
                punkte={4}
                prompt={<p>Welche Aussage über die beiden Pizzerien ist richtig?</p>}
                options={[
                  {
                    text: 'Die Blitz-Pizza ist schlechter, weil sie einmal 44 Minuten gebraucht hat.',
                    feedback:
                      'Ein einzelner Ausreißer sagt nicht, wie schnell die Pizzeria meistens ist. Mittelwert und Median der Blitz-Pizza sind kleiner als bei Mamma Mia.',
                  },
                  {
                    text: (
                      <>
                        Die Blitz-Pizza ist meistens schneller (Median <M>{'16{,}5'}</M> min gegen <M>{'20'}</M> min), aber weniger zuverlässig
                        (Spannweite <M>{'32'}</M> min gegen <M>{'5'}</M> min).
                      </>
                    ),
                    correct: true,
                    feedback: 'Genau: Die Kennwerte der Mitte sprechen für die Blitz-Pizza, die Spannweite zeigt das Risiko eines Ausreißers.',
                  },
                  {
                    text: 'Beide sind gleich gut, denn die Mittelwerte liegen beide bei etwa 20 Minuten.',
                    feedback: 'Die Blitz-Pizza hat den Mittelwert 19 min, Mamma Mia 20,2 min. Außerdem unterscheiden sich Median und Spannweite deutlich.',
                  },
                  {
                    text: 'Mamma Mia ist besser, weil ihr Modalwert (20 min) größer ist als der der Blitz-Pizza (15 min).',
                    feedback: 'Ein größerer Modalwert heißt hier: Die häufigste Lieferzeit ist länger. Das ist für eine Pizzeria schlechter, nicht besser.',
                  },
                ]}
              />
            </Abschnitt>
            <Handlungsprodukt titel="Kennwerte-Steckbrief für die Klasse">
              <SteckbriefBild />
              <p className="sl-text">
                Gestalte in deinem Heft eine Karteikarte „Steckbrief: Blitz-Pizza“. Zeichne die zehn Lieferzeiten als Punkte auf eine
                Zahlengerade, schreibe deine vier Kennwerte mit Rechenweg auf und gib der Klasse ein klares Urteil.
              </p>
              <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
                <ul className="zk-liste">
                  <li>„Die Lieferzeiten der Blitz-Pizza liegen zwischen … und … Minuten, die Spannweite beträgt …“</li>
                  <li>„Am häufigsten kam die Lieferzeit … vor (Modalwert).“</li>
                  <li>„Der Median ist …, denn bei … Werten liegen die beiden mittleren Werte bei … und …“</li>
                  <li>„Im Durchschnitt dauert eine Lieferung … Minuten, weil die Summe … durch … geteilt wird.“</li>
                  <li>„Mein Urteil: Die Blitz-Pizza ist im Schnitt …, aber …“</li>
                </ul>
              </Aufklappbar>
            </Handlungsprodukt>
            <Abschnitt titel="Ist dein Steckbrief vollständig?">
              <Kriterien
                onAlle={fertig.teil('produkt')}
                items={[
                  'Eine Zahlengerade mit allen 10 Lieferzeiten als Punkten',
                  'Alle vier Kennwerte mit Rechenweg (geordnete Liste für den Median, Summe für das Mittel)',
                  'Ein klares Urteil, das mindestens zwei Kennwerte als Begründung nennt',
                  <>
                    Unter deinem Steckbrief steht, wofür die Begriffe und Abkürzungen stehen: <strong>Spannweite</strong> (<M>R</M>, größter
                    minus kleinster Wert), <strong>Modalwert</strong> (<M>{'x_{mod}'}</M>), <strong>Median</strong> (<M>{'x_{med}'}</M>),{' '}
                    <strong>arithmetisches Mittel</strong> (<M>{'\\overline{x}'}</M>) und <M>n</M> (Anzahl der Werte). Außerdem erklärst du alle
                    Wörter, die für dich neu waren.
                  </>,
                ]}
              />
            </Abschnitt>
            {geloest && (
              <Abschnitt titel="Das hältst du fest">
                <Rueckbezug fest={fest} />
                <Merke title="Statistische Kennwerte">
                  <ul>
                    <li>
                      <strong>Spannweite:</strong> <M>{'R = x_{max} - x_{min}'}</M>, wie weit die Daten auseinanderliegen.
                    </li>
                    <li>
                      <strong>Modalwert</strong> <M>{'x_{mod}'}</M>: der Wert, der am häufigsten vorkommt.
                    </li>
                    <li>
                      <strong>Median</strong> <M>{'x_{med}'}</M>: der mittlere Wert der <em>geordneten</em> Liste. Bei gerader Anzahl ist es der
                      Mittelwert der beiden mittleren Werte.
                    </li>
                    <li>
                      <strong>Arithmetisches Mittel:</strong> <M>{'\\overline{x} = \\frac{x_1 + x_2 + \\dots + x_n}{n}'}</M>, die Summe aller
                      Werte geteilt durch ihre Anzahl <M>n</M>.
                    </li>
                    <li>Median und Mittelwert sagen, was „typisch“ ist. Die Spannweite sagt, wie zuverlässig das ist.</li>
                  </ul>
                </Merke>
              </Abschnitt>
            )}
          </>
        );
      },
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die letzte ist für Profis. Hast du Übung 1 bis 3 gelöst, wird unten ein
            Spiel freigeschaltet.
          </p>
          <Abschnitt titel="Übung 1: Wie lange warten die Anrufer?">
            <TrackedMc
              onSolved={() => {
                fertig.teil('1')();
                setUebungen((u) => (u.includes('1') ? u : [...u, '1']));
              }}
              topic="Kennwerte-Einstieg: Median bei gerader Anzahl (Basis)"
              title="Übung 1"
              rechnen
              level="basis"
              punkte={4}
              prompt={
                <p>
                  Die Warteschleife einer Hotline wurde sechsmal gemessen (in Minuten): <M>{'7,\\ 2,\\ 11,\\ 4,\\ 3,\\ 5'}</M>. Wie groß ist der
                  Median?
                </p>
              }
              options={[
                {
                  text: '5,3 Minuten',
                  feedback: 'Das ist das arithmetische Mittel (32 : 6 ≈ 5,3). Der Median ist die Mitte der geordneten Liste.',
                },
                {
                  text: '7,5 Minuten',
                  feedback: 'Hier wurden die mittleren Werte der ungeordneten Liste (11 und 4) genommen. Ordne die Werte erst der Größe nach.',
                },
                {
                  text: '4,5 Minuten',
                  correct: true,
                  feedback: <M>{'2\\ 3\\ \\mathbf{4}\\ \\mathbf{5}\\ 7\\ 11 \\;\\Rightarrow\\; x_{med} = \\frac{4 + 5}{2} = 4{,}5'}</M>,
                },
                {
                  text: '4 Minuten',
                  feedback: 'Bei sechs Werten liegen zwei Werte in der Mitte (4 und 5). Der Median ist ihr Mittelwert, nicht nur der linke.',
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={() => {
                fertig.teil('2')();
                setUebungen((u) => (u.includes('2') ? u : [...u, '2']));
              }}
              topic="Kennwerte-Einstieg: Kennwerte unterscheiden (Standard)"
              title="Übung 2"
              rechnen={false}
              level="standard"
              punkte={6}
              prompt={
                <p>
                  Ein Pizzaladen hat acht Kundenbewertungen (Sterne): <M>{'5,\\ 3,\\ 4,\\ 5,\\ 2,\\ 5,\\ 4,\\ 3'}</M>. Vier Jugendliche bestimmen
                  einen Kennwert. Wer hat recht?
                </p>
              }
              options={[
                {
                  text: 'Tom: „Der Modalwert ist 3, so oft kommt die 5 vor.“',
                  feedback: 'Die 3 ist die Häufigkeit der 5. Der Modalwert ist der Wert selbst, der am häufigsten vorkommt.',
                },
                {
                  text: 'Lena: „Der Modalwert ist 4, denn 4 liegt in der Mitte.“',
                  feedback: 'Die Mitte der geordneten Liste ist der Median, nicht der Modalwert. Der Modalwert ist der häufigste Wert.',
                },
                {
                  text: 'Jan: „Die Spannweite ist 5, weil 5 der größte Wert ist.“',
                  feedback: 'Die Spannweite ist größter Wert minus kleinster Wert: 5 − 2 = 3.',
                },
                {
                  text: 'Mia: „Der Modalwert ist 5, denn 5 kommt dreimal vor, öfter als jeder andere Wert.“',
                  correct: true,
                  feedback: <M>{'x_{mod} = 5'}</M>,
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Die Fahrten von Tom">
            <TrackedCheck
              onSolved={() => {
                fertig.teil('3')();
                setUebungen((u) => (u.includes('3') ? u : [...u, '3']));
              }}
              topic="Kennwerte-Einstieg: alle Kennwerte berechnen (Standard)"
              title="Übung 3"
              level="standard"
              punkte={7}
              prompt={
                <p>
                  Der Pizzabote Tom hat an sieben Abenden die Dauer seiner Tour in Minuten notiert: <M>{'18,\\ 20,\\ 26,\\ 18,\\ 24,\\ 30,\\ 18'}</M>.
                  Bestimme die vier Kennwerte.
                </p>
              }
              fields={[
                { kind: 'num', key: 'r', label: 'Spannweite:', expected: 12, unit: 'min', tol: 0 },
                { kind: 'num', key: 'mod', label: 'Modalwert:', expected: 18, unit: 'min', tol: 0 },
                { kind: 'num', key: 'med', label: 'Median:', expected: 20, unit: 'min', tol: 0.001 },
                { kind: 'num', key: 'x', label: 'Mittelwert:', expected: 22, unit: 'min', tol: 0.001 },
              ]}
              solution={
                <>
                  <MB>{'18 \\;\\; 18 \\;\\; 18 \\;\\; \\mathbf{20} \\;\\; 24 \\;\\; 26 \\;\\; 30 \\qquad n = 7'}</MB>
                  <MB>{'R = 30 - 18 = 12 \\quad x_{mod} = 18 \\quad x_{med} = 20 \\quad \\overline{x} = \\frac{154}{7} = 22'}</MB>
                  <p>Bei 7 Werten ist der Median der 4. Wert der geordneten Liste.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Ordne die Werte zuerst der Größe nach. Es sind 7 Werte, also eine ungerade Anzahl.</>,
                    <>Der Median ist bei 7 Werten der 4. Wert. Für das Mittel addierst du alle 7 Werte und teilst durch 7.</>,
                    <>
                      <M>{'18 + 20 + 26 + 18 + 24 + 30 + 18 = 154'}</M> und <M>{'154 : 7'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Die siebte Lieferung">
            <CheckCard
              title="Welche Lieferzeit fehlt?"
              level="erweiterung"
              profi
              punkte={9}
              prompt={
                <p>
                  Für eine Woche sind sechs Lieferzeiten bekannt: <M>{'18,\\ 22,\\ 25,\\ 17,\\ 19,\\ 21'}</M> Minuten. Die siebte Lieferung ist noch
                  offen. Das Mittel aller sieben Lieferzeiten soll genau 20 Minuten betragen. Wie lange darf die siebte Lieferung dauern? Wie
                  groß ist dann der Median?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'x7', label: 'Siebte Lieferzeit:', expected: 18, unit: 'min', tol: 0 },
                { kind: 'num', key: 'med', label: 'Median:', expected: 19, unit: 'min', tol: 0.001 },
              ]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'\\frac{18 + 22 + 25 + 17 + 19 + 21 + x}{7} = 20 \\;\\Rightarrow\\; 122 + x = 140 \\;\\Rightarrow\\; x = 18'}</MB>
                  <MB>{'17 \\;\\; 18 \\;\\; 18 \\;\\; \\mathbf{19} \\;\\; 21 \\;\\; 22 \\;\\; 25 \\;\\Rightarrow\\; x_{med} = 19'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Wenn das Mittel von 7 Werten 20 ist, wie groß muss dann die Summe aller 7 Werte sein?</>,
                    <>
                      Die Summe ist <M>{'7 \\cdot 20 = 140'}</M>. Die sechs bekannten Werte ergeben zusammen 122.
                    </>,
                    <>
                      <M>{'x = 140 - 122'}</M>. Ordne dann alle sieben Werte und nimm den 4. Wert.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 3} titel="Pizza-Rallye">
            <PizzaRallye />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt Spannweite, Modalwert, Median und arithmetisches Mittel bestimmen und damit Daten beurteilen. Bei den
              Übungsaufgaben rechnest du mit größeren Datenreihen und Häufigkeitstabellen.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Kennwerte <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Statistische Kennwerte: Der Pizzabote"
      width="wide"
      kompakt
      parent={{ to: '/daten-und-zufall/kennwerte', label: 'Statistische Kennwerte' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={
          <>
            In dieser Lernsituation findest du heraus, welche Pizzeria im Schnitt schneller liefert. Du lernst, wie Spannweite, Modalwert,
            Median und arithmetisches Mittel viele Daten in wenigen Zahlen zusammenfassen.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Vermutung aus „Problem erkennen“ */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  if (!fest.fest || !fest.wahl) return null;
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest dich festgelegt:</strong> {WAHL[fest.wahl]} Die typische Lieferzeit der Blitz-Pizza hattest du auf etwa {fest.wert}{' '}
        Minuten geschätzt.{' '}
        {fest.wahl === 'blitz' ? 'Das stimmt: ' : 'Tatsächlich ist es die Blitz-Pizza: '}
        Ihr Median beträgt {String(BLITZ_MED).replace('.', ',')} min und ihr Mittelwert {BLITZ_MITTEL} min, bei Mamma Mia sind es 20 min und{' '}
        {MAMMA_MITTEL.toFixed(1).replace('.', ',')} min. Die Pizzeria mit der schlimmsten Lieferung (44 min) ist im Schnitt also die schnellere.
        Dafür verrät die Spannweite (32 min gegen 5 min), dass man bei ihr deutlich weniger sicher planen kann.
      </p>
    </div>
  );
}
