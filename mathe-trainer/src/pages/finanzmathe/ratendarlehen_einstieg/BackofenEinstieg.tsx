import { useState, type ChangeEvent, type FocusEvent, type ReactNode } from 'react';
import TaskShell from '../../../components/layout/TaskShell';
import { Beispiel, M, MB, Merke, checkNumber } from '../../daten_und_zufall/lernpfad/kit';
import { fieldCheckClass } from '../../../utils/fieldCheck';
import {
  CardHead,
  CheckCard,
  Feedback,
  Hilfen,
  useLiveCheck,
  McCard,
  SchrittHilfen,
  TrackedCheck,
  TrackedMc,
} from '../../lineare_funktionen/lernsituation_kit/kit';
import {
  Abschnitt,
  Aufklappbar,
  Handlungsprodukt,
  SeitenLernsituation,
  WegWahl,
  type Seite,
  type Thema,
} from '../../lineare_funktionen/lernsituation_kit/seiten';
import { Kriterien, Vermutung, Zitat, euro, type Festlegung } from '../zins_kit/zins_kit';
import '../../daten_und_zufall/lernpfad/lernpfad.css';
import './ratendarlehen.css';

// Lernsituation Ratendarlehen „Der neue Backofen“: Tilgungsplan eines Ratendarlehens (ca. 60 bis 90 min).
// Format Entscheidungsfall: Die SuS sind Azubis in einer Bäckerei und prüfen, ob die Inhaberin sich den Kredit für einen
// sparsamen Ofen leisten kann. Lernprodukt analog: Tilgungsplan mit Balkendiagramm und Antwortsatz im Heft.
// Instruktionsreihenfolge im ruhigen Grunddesign: Aufgabe → Rechenbeispiel (Friseursalon, andere Zahlen) → eigene Rechnung.
// Teil 2: ein Jahr direkt mit den Formeln der Merkhilfe (15 Jahre Laufzeit, 10. Jahr).
// Aha: Frau Sommer rechnet mit 5 · 3.000 € = 15.000 € Zinsen. Weil die Schuld jedes Jahr kleiner wird, sind es nur 9.000 €,
// und die Rate sinkt: Nur im 1. Jahr (15.000 €) liegt sie über dem Budget von 14.500 €.
// Identität: Themenfarbe Kupfer, Symbol Brot, Titelbild Bäckerei mit neuem Ofen, Leitobjekt das Raten-Diagramm
// (in Phase 2 die Vermutung, in Phase 3 der echte Tilgungsplan gegen die Budget-Linie). Die Festlegung bleibt nur im Seitenzustand.

/* ── Situation ───────────────────────────────────────────────────────────── */

// Darlehen 60.000 €, 5 Jahre, 5 % p.a., Tilgung 12.000 € pro Jahr.
// Jahr:            1       2       3       4       5
// Schuld Anfang 60.000  48.000  36.000  24.000  12.000
// Zinsen         3.000   2.400   1.800   1.200     600   (zusammen 9.000)
// Annuität      15.000  14.400  13.800  13.200  12.600
const K0 = 60000;
const N = 5;
const P = 5;
const BUDGET = 14500;
const T = K0 / N;
const PLAN = Array.from({ length: N }, (_, i) => {
  const schuld = K0 - i * T;
  const zinsen = (schuld * P) / 100;
  return { jahr: i + 1, schuld, zinsen, annuitaet: T + zinsen, rest: schuld - T };
});
const Z_GES = PLAN.reduce((s, r) => s + r.zinsen, 0);

// Teil 2: gleiches Darlehen über 15 Jahre, 10. Jahr: T = 4.000, K_9 = 24.000, Z_10 = 1.200, A_10 = 5.200
const N2 = 15;
const V2 = 10;
const T2 = K0 / N2;
const K9 = T2 * (N2 - V2 + 1);
const Z10 = (K9 * P) / 100;
const A10 = T2 + Z10;

type Wahl = 'gleich' | 'steigt' | 'sinkt';
const WAHL: Record<Wahl, string> = {
  gleich: 'Die Jahresrate ist jedes Jahr gleich hoch.',
  steigt: 'Die Jahresrate wird von Jahr zu Jahr größer.',
  sinkt: 'Die Jahresrate wird von Jahr zu Jahr kleiner.',
};

const tausend = (v: number) => v.toLocaleString('de-DE');

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: die Bäckerei Sommer, daneben wird der neue Etagenofen mit Preisschild geliefert */
function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Eine kleine Bäckerei mit Markise und Broten im Schaufenster. Daneben steht ein neuer Backofen mit drei Ofentüren und einem Preisschild: 60.000 Euro, 5 Jahre, 5 Prozent pro Jahr."
    >
      <rect x="0" y="214" width="720" height="38" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="214" y2="214" stroke="var(--ink)" strokeWidth="2" />
      {/* Bäckerei */}
      <rect x="40" y="58" width="360" height="156" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="40" y="30" width="360" height="34" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <text x="220" y="54" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">
        Bäckerei Sommer
      </text>
      {/* Markise */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <path
          key={i}
          d={`M${40 + i * 40} 64 h40 v22 a20 12 0 0 1 -40 0 Z`}
          fill={i % 2 === 0 ? 'var(--primary)' : 'var(--primary-soft)'}
          stroke="var(--ink)"
          strokeWidth="2"
        />
      ))}
      {/* Schaufenster mit Broten */}
      <rect x="64" y="112" width="200" height="82" rx="4" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <line x1="64" x2="264" y1="168" y2="168" stroke="var(--ink)" strokeWidth="2" />
      {[100, 164, 228].map((x) => (
        <ellipse key={x} cx={x} cy="154" rx="26" ry="13" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      ))}
      {[124, 196].map((x) => (
        <circle key={x} cx={x} cy="182" r="9" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      ))}
      {/* Tür */}
      <rect x="296" y="112" width="74" height="102" rx="3" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="306" y="122" width="54" height="40" rx="2" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="358" cy="176" r="4" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
      {/* Neuer Etagenofen */}
      <rect x="452" y="64" width="176" height="140" rx="8" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      {[76, 118, 160].map((y) => (
        <g key={y}>
          <rect x="466" y={y} width="148" height="34" rx="4" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
          <rect x="500" y={y + 6} width="80" height="6" rx="3" fill="var(--ink)" />
        </g>
      ))}
      <rect x="462" y="204" width="16" height="10" fill="var(--ink)" />
      <rect x="602" y="204" width="16" height="10" fill="var(--ink)" />
      {/* Preisschild */}
      <line x1="610" y1="64" x2="640" y2="34" stroke="var(--ink)" strokeWidth="2" />
      <g transform="rotate(8 650 40)">
        <rect x="604" y="14" width="108" height="62" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <text x="658" y="42" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
          60.000 €
        </text>
        <text x="658" y="64" textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
          5 Jahre · 5 %
        </text>
      </g>
    </svg>
  );
}

const THEMA: Thema = {
  name: 'Der neue Backofen',
  farbe: 'kupfer',
  icon: 'fa-bread-slice',
  bild: <Titelbild />,
};

/* ── Bilder für „Problem erkennen“ und „Problem lösen“ ─────────────────── */

/** Das Kreditangebot der Bank und Frau Sommers Budget als Sachbild */
function AngebotBild() {
  return (
    <div className="zk-bild">
      <svg
        viewBox="0 0 720 230"
        role="img"
        aria-label="Links das Angebot der Bank: Ratendarlehen über 60.000 Euro, Laufzeit 5 Jahre, Zinssatz 5 Prozent pro Jahr, jedes Jahr gleich hohe Tilgung. Rechts Frau Sommers Budget: höchstens 14.500 Euro pro Jahr."
      >
        {/* Angebot */}
        <rect x="12" y="12" width="420" height="206" rx="16" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <rect x="12" y="12" width="420" height="44" rx="16" fill="var(--primary-soft)" />
        <rect x="12" y="40" width="420" height="16" fill="var(--primary-soft)" />
        <text x="32" y="42" fontSize="20" fontWeight="800" fill="var(--ink)">
          Angebot der Bank: Ratendarlehen
        </text>
        {[
          ['Darlehen', '60.000 €'],
          ['Laufzeit', '5 Jahre'],
          ['Zinssatz', '5 % p.a.'],
          ['Tilgung', 'jedes Jahr gleich hoch'],
        ].map(([a, b], i) => (
          <g key={a}>
            <text x="32" y={92 + i * 36} fontSize="18" fill="var(--ink-muted)">
              {a}
            </text>
            <text x="150" y={92 + i * 36} fontSize="18" fontWeight="700" fill="var(--ink)">
              {b}
            </text>
          </g>
        ))}
        {/* Budget */}
        <rect x="456" y="12" width="252" height="206" rx="16" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <rect x="456" y="12" width="252" height="44" rx="16" fill="var(--primary-soft)" />
        <rect x="456" y="40" width="252" height="16" fill="var(--primary-soft)" />
        <text x="476" y="42" fontSize="20" fontWeight="800" fill="var(--ink)">
          Budget pro Jahr
        </text>
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx="526" cy={190 - i * 14} rx="38" ry="10" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        ))}
        <text x="582" y="140" fontSize="17" fill="var(--ink-muted)">
          höchstens
        </text>
        <text x="582" y="170" fontSize="24" fontWeight="800" fill="var(--primary)">
          14.500 €
        </text>
      </svg>
    </div>
  );
}

/** Handlungsprodukt: Heftseite mit Tilgungsplan und Balkendiagramm */
function HeftBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Eine Heftseite mit der Überschrift Tilgungsplan Backofen, links eine Tabelle mit fünf Zeilen, rechts ein Balkendiagramm mit fünf Balken und einer gestrichelten Budget-Linie."
      >
        <rect x="60" y="10" width="600" height="172" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <text x="84" y="40" fontSize="18" fontWeight="700" fontStyle="italic" fill="var(--ink)">
          Tilgungsplan Backofen
        </text>
        {/* Tabelle */}
        {[56, 76, 96, 116, 136, 156].map((y) => (
          <line key={y} x1="84" x2="360" y1={y} y2={y} stroke="var(--line-strong)" strokeWidth="1.5" />
        ))}
        {[84, 124, 184, 244, 300, 360].map((x) => (
          <line key={x} x1={x} x2={x} y1="56" y2="156" stroke="var(--line-strong)" strokeWidth="1.5" />
        ))}
        <rect x="84" y="56" width="276" height="20" fill="var(--primary-soft)" />
        {/* Balken */}
        <line x1="400" x2="636" y1="156" y2="156" stroke="var(--ink)" strokeWidth="2" />
        <line x1="400" x2="400" y1="50" y2="156" stroke="var(--ink)" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={416 + i * 44} y={64 + i * 8} width="28" height={92 - i * 8} fill="var(--primary)" stroke="var(--ink)" strokeWidth="1.5" />
        ))}
        <line x1="400" x2="636" y1="70" y2="70" stroke="var(--ink)" strokeWidth="2" strokeDasharray="6 4" />
        <g transform="rotate(-35 660 120)">
          <rect x="610" y="150" width="110" height="16" rx="4" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
          <polygon points="610,150 594,158 610,166" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

/* ── Leitobjekt: das Raten-Diagramm ─────────────────────────────────────── */

const D = { x0: 92, x1: 704, y0: 292, y1: 52, max: 16000 };
const dy = (v: number) => D.y0 - (v / D.max) * (D.y0 - D.y1);
const BREITE = (D.x1 - D.x0) / N;
const VERMUTET: Record<Wahl, number[]> = {
  gleich: [12500, 12500, 12500, 12500, 12500],
  steigt: [10000, 11000, 12000, 13000, 14000],
  sinkt: [14000, 13000, 12000, 11000, 10000],
};

/**
 * Jahresraten der fünf Jahre gegen Frau Sommers Budget.
 * modus „leer“: nur Achsen und Budget, „vermutung“: Form der gewählten Vermutung ohne Zahlen, „plan“: der echte Tilgungsplan.
 */
function RatenDiagramm({ modus, wahl = null }: { modus: 'leer' | 'vermutung' | 'plan'; wahl?: Wahl | null }) {
  const beschreibung =
    modus === 'plan'
      ? 'Balkendiagramm der Jahresraten: 15.000, 14.400, 13.800, 13.200 und 12.600 Euro, jeweils 12.000 Euro Tilgung plus Zinsen. Nur der Balken im 1. Jahr liegt über der Budget-Linie bei 14.500 Euro.'
      : 'Leeres Balkendiagramm für die Jahresraten in den Jahren 1 bis 5 mit einer gestrichelten Budget-Linie bei 14.500 Euro.';
  return (
    <div className="zk-bild rd-diagramm">
      <svg viewBox="0 0 720 338" role="img" aria-label={beschreibung}>
        {[0, 4000, 8000, 12000].map((v) => (
          <g key={v}>
            <line x1={D.x0} x2={D.x1} y1={dy(v)} y2={dy(v)} stroke={v === 0 ? 'var(--ink)' : 'var(--grid)'} strokeWidth="2" />
            <text x={D.x0 - 10} y={dy(v) + 5} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
              {tausend(v)} €
            </text>
          </g>
        ))}
        {PLAN.map((r, i) => {
          const x = D.x0 + i * BREITE + BREITE * 0.2;
          const w = BREITE * 0.6;
          const mitte = x + w / 2;
          return (
            <g key={r.jahr}>
              <text x={mitte} y={D.y0 + 24} textAnchor="middle" fontSize="16" fill="var(--ink)">
                {r.jahr}. Jahr
              </text>
              {modus === 'leer' && (
                <text x={mitte} y={dy(6000)} textAnchor="middle" fontSize="28" fontWeight="800" fill="var(--line-strong)">
                  ?
                </text>
              )}
              {modus === 'vermutung' && wahl && (
                <rect
                  x={x}
                  y={dy(VERMUTET[wahl][i])}
                  width={w}
                  height={D.y0 - dy(VERMUTET[wahl][i])}
                  fill="var(--primary-soft)"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
              )}
              {modus === 'vermutung' && !wahl && (
                <text x={mitte} y={dy(6000)} textAnchor="middle" fontSize="28" fontWeight="800" fill="var(--line-strong)">
                  ?
                </text>
              )}
              {modus === 'plan' && (
                <>
                  <rect x={x} y={dy(T)} width={w} height={D.y0 - dy(T)} fill="var(--primary)" stroke="var(--ink)" strokeWidth="1.5" />
                  <rect
                    x={x}
                    y={dy(r.annuitaet)}
                    width={w}
                    height={dy(T) - dy(r.annuitaet)}
                    fill="var(--highlight)"
                    stroke="var(--ink)"
                    strokeWidth="1.5"
                  />
                  <text x={mitte} y={dy(T / 2)} textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">
                    {tausend(T)}
                  </text>
                  <text x={mitte} y="24" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--ink)">
                    {tausend(r.annuitaet)} €
                  </text>
                </>
              )}
            </g>
          );
        })}
        <line x1={D.x0} x2={D.x1} y1={dy(BUDGET)} y2={dy(BUDGET)} stroke="var(--ink)" strokeWidth="3" strokeDasharray="10 6" />
        <text x={D.x0 - 10} y={dy(BUDGET) + 5} textAnchor="end" fontSize="15" fontWeight="800" fill="var(--ink)">
          14.500 €
        </text>
        {modus === 'plan' && (
          <text x={D.x0} y="24" textAnchor="end" fontSize="15" fill="var(--ink-muted)">
            <tspan x={D.x0 - 10}>Annuität</tspan>
          </text>
        )}
        {modus === 'vermutung' && wahl && (
          <text x={D.x1} y="24" textAnchor="end" fontSize="16" fontStyle="italic" fill="var(--ink-muted)">
            deine Vermutung (ohne Zahlen)
          </text>
        )}
      </svg>
      <div className="rd-legende">
        {modus === 'plan' && (
          <>
            <span>
              <i className="rd-tilgung" aria-hidden="true" />
              Tilgung
            </span>
            <span>
              <i className="rd-zinsen" aria-hidden="true" />
              Zinsen
            </span>
          </>
        )}
        <span>
          <i className="rd-budget" aria-hidden="true" />
          Budget von Frau Sommer: höchstens 14.500 € pro Jahr
        </span>
      </div>
    </div>
  );
}

/** Tilgungsplan als Tabelle */
function PlanTabelle({
  zeilen,
  summe,
}: {
  zeilen: { jahr: number; schuld: number; zinsen: number; tilgung: number; annuitaet: number }[];
  summe?: { zinsen: number; tilgung: number; annuitaet: number };
}) {
  return (
    <div className="lp-table-wrap">
      <table className="lp-table rd-plan">
        <thead>
          <tr>
            <th>Jahr</th>
            <th>Schuld am Jahresanfang</th>
            <th>Tilgung</th>
            <th>Zinsen</th>
            <th>Annuität</th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z) => (
            <tr key={z.jahr}>
              <th>{z.jahr}</th>
              <td>{euro(z.schuld)}</td>
              <td>{euro(z.tilgung)}</td>
              <td>{euro(z.zinsen)}</td>
              <td>{euro(z.annuitaet)}</td>
            </tr>
          ))}
        </tbody>
        {summe && (
          <tfoot>
            <tr>
              <th>Summe</th>
              <td />
              <td>{euro(summe.tilgung)}</td>
              <td>{euro(summe.zinsen)}</td>
              <td>{euro(summe.annuitaet)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

const SPALTEN = [
  { key: 'schuld', titel: 'Schuld am Jahresanfang' },
  { key: 'tilgung', titel: 'Tilgung' },
  { key: 'zinsen', titel: 'Zinsen' },
  { key: 'annuitaet', titel: 'Annuität' },
] as const;
type Spalte = (typeof SPALTEN)[number]['key'];

/**
 * Tilgungsplan zum Ausfüllen wie in der Übung „Tilgungsplan ausfüllen“: eine Zeile pro Jahr, optional eine Summenzeile.
 * Jedes Feld prüft sich selbst (richtig sofort grün, falsch nach kurzer Pause rot), „Lösungsweg zeigen“ erst nach einem Fehlversuch.
 */
function TilgungsplanCheck({
  title,
  prompt,
  zeilen,
  summe,
  solution,
  help,
  onSolved,
}: {
  title: ReactNode;
  prompt: ReactNode;
  zeilen: ({ jahr: number } & Record<Spalte, number>)[];
  summe?: Partial<Record<Spalte, number>>;
  solution: ReactNode;
  help: ReactNode;
  onSolved: () => void;
}) {
  const felder = [
    ...zeilen.flatMap((z) => SPALTEN.map((sp) => ({ key: `${z.jahr}-${sp.key}`, expected: z[sp.key] }))),
    ...SPALTEN.flatMap((sp) => (summe?.[sp.key] !== undefined ? [{ key: `summe-${sp.key}`, expected: summe[sp.key] as number }] : [])),
  ];
  const { values, marks, status, praise, malFalsch, setValue, blur } = useLiveCheck(
    felder.map((f) => ({ key: f.key, pruefe: (v: string) => checkNumber(v, f.expected) })),
    { onSolved },
  );
  const [zeigen, setZeigen] = useState(false);

  const feld = (key: string, label: string) => (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="?"
      aria-label={label}
      className={`bk-input rd-feld ${fieldCheckClass(marks[key])}`}
      value={values[key] ?? ''}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(key, e.target.value)}
      onBlur={(e: FocusEvent<HTMLInputElement>) => blur(key, e.currentTarget.value)}
    />
  );

  return (
    <div className="lp-ex bk-panel">
      <CardHead title={title} />
      <div className="lp-ex-prompt">{prompt}</div>
      <div className="lp-table-wrap">
        <table className="lp-table rd-plan rd-plan-eingabe">
          <thead>
            <tr>
              <th>Jahr</th>
              {SPALTEN.map((sp) => (
                <th key={sp.key}>{sp.titel} in €</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zeilen.map((z) => (
              <tr key={z.jahr}>
                <th>{z.jahr}</th>
                {SPALTEN.map((sp) => (
                  <td key={sp.key}>{feld(`${z.jahr}-${sp.key}`, `${sp.titel}, Jahr ${z.jahr}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
          {summe && (
            <tfoot>
              <tr>
                <th>Summe</th>
                {SPALTEN.map((sp) => (
                  <td key={sp.key}>{summe[sp.key] !== undefined && feld(`summe-${sp.key}`, `${sp.titel}, Summe`)}</td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {(malFalsch || status === 'ok') && (
        <div className="bk-actions lp-ex-actions">
          <button type="button" className="bk-btn" onClick={() => setZeigen((z) => !z)}>
            <i className="fa-solid fa-route" aria-hidden="true" /> {zeigen ? 'Lösungsweg ausblenden' : 'Lösungsweg zeigen'}
          </button>
        </div>
      )}
      <Feedback status={status} praise={praise} />
      {help}
      {zeigen && (
        <div className="bk-solution lp-solution">
          <div className="bk-solution-title">Lösungsweg</div>
          {solution}
        </div>
      )}
    </div>
  );
}

/* ── Rechenbeispiel 1: Friseursalon ─────────────────────────────────────── */

// 24.000 €, 4 Jahre, 6 % p.a.: T = 6.000; Zinsen 1.440, 1.080, 720, 360 (zusammen 3.600)
const BSP1 = [24000, 18000, 12000, 6000].map((schuld, i) => ({
  jahr: i + 1,
  schuld,
  zinsen: schuld * 0.06,
  tilgung: 6000,
  annuitaet: 6000 + schuld * 0.06,
}));

const BSP1_AUFGABE = (
  <p>
    Ein Friseursalon nimmt für eine neue Einrichtung ein Ratendarlehen über <strong>24.000 €</strong> auf. Laufzeit{' '}
    <strong>4 Jahre</strong>, Zinssatz <strong>6 % p.a.</strong> Wie hoch ist die Annuität (Jahresrate) in jedem Jahr?
  </p>
);
const BSP1_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Tilgung berechnen',
    body: (
      <>
        <p>Beim Ratendarlehen wird die Schuld in gleich großen Teilen zurückgezahlt. Die Tilgung ist jedes Jahr gleich:</p>
        <MB>{'T = \\frac{K_0}{n} = \\frac{24\\,000 \\text{ €}}{4} = 6\\,000 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: '1. Jahr: Zinsen, Annuität, Restschuld',
    body: (
      <>
        <p>Die Zinsen werden für die Schuld am Jahresanfang berechnet. Die Annuität ist Tilgung plus Zinsen.</p>
        <MB>{'Z_1 = 24\\,000 \\text{ €} \\cdot 0{,}06 = 1\\,440 \\text{ €} \\qquad A_1 = 6\\,000 \\text{ €} + 1\\,440 \\text{ €} = 7\\,440 \\text{ €}'}</MB>
        <MB>{'K_1 = 24\\,000 \\text{ €} - 6\\,000 \\text{ €} = 18\\,000 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: '2. Jahr: mit der kleineren Schuld weiterrechnen',
    body: (
      <>
        <p>Im 2. Jahr gibt es nur noch Zinsen für die Restschuld von 18.000 €:</p>
        <MB>{'Z_2 = 18\\,000 \\text{ €} \\cdot 0{,}06 = 1\\,080 \\text{ €} \\qquad A_2 = 6\\,000 \\text{ €} + 1\\,080 \\text{ €} = 7\\,080 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: 'Tilgungsplan bis zum Schluss',
    body: (
      <>
        <p>So geht es weiter, bis die Schuld 0 € ist. In der Summenzeile stehen die Zinsen insgesamt.</p>
        <PlanTabelle zeilen={BSP1} summe={{ zinsen: 3600, tilgung: 24000, annuitaet: 27600 }} />
        <p>
          Die Zinsen sinken jedes Jahr um <M>{'6\\,000 \\text{ €} \\cdot 0{,}06 = 360 \\text{ €}'}</M>, also sinkt auch die Annuität.
        </p>
      </>
    ),
  },
];

/* ── Rechenbeispiel 2: ein Jahr direkt ──────────────────────────────────── */

const BSP2_AUFGABE = (
  <p>
    Eine Fahrradwerkstatt zahlt ein Ratendarlehen über <strong>36.000 €</strong> in <strong>12 Jahren</strong> zurück, Zinssatz{' '}
    <strong>4 % p.a.</strong> Wie hoch sind die Zinsen und die Annuität im <strong>8. Jahr</strong>?
  </p>
);
const BSP2_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Tilgung',
    body: <MB>{'T = \\frac{K_0}{n} = \\frac{36\\,000 \\text{ €}}{12} = 3\\,000 \\text{ €}'}</MB>,
  },
  {
    title: 'Schuld zu Beginn des 8. Jahres',
    body: (
      <>
        <p>
          Nach 7 Jahren sind 7 Tilgungen bezahlt, es fehlen noch <M>{'n - 7 = 5'}</M>. Die Schuld zu Beginn des 8. Jahres ist die Restschuld am
          Ende des 7. Jahres:
        </p>
        <MB>{'K_7 = T \\cdot (n - 7) = 3\\,000 \\text{ €} \\cdot 5 = 15\\,000 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: 'Zinsen und Annuität im 8. Jahr',
    body: (
      <>
        <p>
          Die Formel aus der Merkhilfe macht beides in einem Schritt: <M>{'n - v + 1 = 12 - 8 + 1 = 5'}</M> Tilgungen sind zu Beginn des 8. Jahres noch offen.
        </p>
        <MB>{'Z_8 = T \\cdot (q - 1) \\cdot (n - v + 1) = 3\\,000 \\text{ €} \\cdot 0{,}04 \\cdot 5 = 600 \\text{ €}'}</MB>
        <MB>{'A_8 = T + Z_8 = 3\\,000 \\text{ €} + 600 \\text{ €} = 3\\,600 \\text{ €}'}</MB>
      </>
    ),
  },
];

/* ── Lösungswege ─────────────────────────────────────────────────────────── */

const LOESUNG_PLAN = (
  <>
    <MB>{'T = \\frac{60\\,000 \\text{ €}}{5} = 12\\,000 \\text{ €}'}</MB>
    <MB>{'Z_1 = 60\\,000 \\text{ €} \\cdot 0{,}05 = 3\\,000 \\text{ €} \\qquad A_1 = 12\\,000 \\text{ €} + 3\\,000 \\text{ €} = 15\\,000 \\text{ €}'}</MB>
    <MB>{'K_1 = 60\\,000 \\text{ €} - 12\\,000 \\text{ €} = 48\\,000 \\text{ €} \\qquad Z_2 = 48\\,000 \\text{ €} \\cdot 0{,}05 = 2\\,400 \\text{ €}'}</MB>
    <PlanTabelle
      zeilen={PLAN.map((r) => ({ ...r, tilgung: T }))}
      summe={{ zinsen: Z_GES, tilgung: K0, annuitaet: K0 + Z_GES }}
    />
    <p>
      Die Zinsen sinken jedes Jahr um 600 €. Zusammen sind es 9.000 €, nicht 15.000 €: Die 5 % gibt es nur auf die Schuld, die noch übrig ist.
    </p>
  </>
);

const LOESUNG_JAHR10 = (
  <>
    <MB>{'T = \\frac{60\\,000 \\text{ €}}{15} = 4\\,000 \\text{ €} \\qquad K_9 = T \\cdot (n - 9) = 4\\,000 \\text{ €} \\cdot 6 = 24\\,000 \\text{ €}'}</MB>
    <MB>{'Z_{10} = 4\\,000 \\text{ €} \\cdot 0{,}05 \\cdot (15 - 10 + 1) = 1\\,200 \\text{ €} \\qquad A_{10} = 4\\,000 \\text{ €} + 1\\,200 \\text{ €} = 5\\,200 \\text{ €}'}</MB>
  </>
);

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function BackofenEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 5000, fest: false });
  const [planGeloest, setPlanGeloest] = useState(false);
  const [jahrGeloest, setJahrGeloest] = useState(false);

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese drei kurzen Aufgaben brauchst du gleich.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            title="a) Zinsen für ein Jahr"
            prompt={<p>Ein Kredit über 25.000 € kostet 4 % Zinsen pro Jahr. Wie viel Zinsen fallen in einem Jahr an?</p>}
            fields={[{ kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 1000, unit: '€' }]}
            solution={<MB>{'Z = 25\\,000 \\text{ €} \\cdot 0{,}04 = 1\\,000 \\text{ €}'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            title="b) In gleichen Teilen zurückzahlen"
            prompt={
              <p>
                Lina hat sich von ihrem Bruder 1.800 € für einen Laptop geliehen. Sie zahlt in 6 gleich großen Teilen zurück. Wie groß ist ein Teil?
                Wie viel schuldet sie nach 2 Teilen noch?
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'teil', label: 'Ein Teil:', expected: 300, unit: '€' },
              { kind: 'num', key: 'rest', label: 'Rest nach 2 Teilen:', expected: 1200, unit: '€' },
            ]}
            solution={<MB>{'1\\,800 \\text{ €} : 6 = 300 \\text{ €} \\qquad 1\\,800 \\text{ €} - 2 \\cdot 300 \\text{ €} = 1\\,200 \\text{ €}'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            title="c) Zinssatz und Zinsfaktor"
            prompt={
              <p>
                Schreibe den Zinssatz <M>{'p = 3{,}5\\,\\%'}</M> als Dezimalzahl und gib den Zinsfaktor <M>{'q = 1 + \\frac{p}{100}'}</M> an.
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'd', label: <M>{'\\frac{p}{100} ='}</M>, expected: 0.035, tol: 0.00001 },
              { kind: 'num', key: 'q', label: <M>{'q ='}</M>, expected: 1.035, tol: 0.00001 },
            ]}
            solution={<MB>{'\\frac{3{,}5}{100} = 0{,}035 \\qquad q = 1 + 0{,}035 = 1{,}035'}</MB>}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Kann sich Frau Sommer den Ofen leisten?',
      bedingung: 'Halte deine Vermutung fest, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du machst eine Ausbildung zur Kauffrau oder zum Kaufmann für Büromanagement in der Bäckerei Sommer. Der alte Backofen ist kaputt und
            verbraucht viel Strom. Ein neuer, sparsamer Etagenofen kostet 60.000 €. Die Inhaberin bittet dich um Hilfe:
          </p>
          <Zitat wer="Frau Sommer, Inhaberin">
            <p>
              Die Bank bietet mir ein Ratendarlehen an: 60.000 € für 5 Jahre zu 5 % Zinsen pro Jahr. Ich zahle jedes Jahr den gleichen Teil der
              Schuld zurück, dazu kommen die Zinsen. Mehr als 14.500 € im Jahr kann ich dafür aber nicht ausgeben.
            </p>
            <p>5 % von 60.000 € sind 3.000 € Zinsen, in 5 Jahren also 15.000 €. Das ist doch viel zu teuer, oder?</p>
          </Zitat>
          <AngebotBild />
          <p className="sl-text">
            Gegeben sind das Darlehen <M>{'K_0 = 60\\,000'}</M> €, die Laufzeit <M>{'n = 5'}</M> Jahre und der Zinssatz <M>{'p = 5\\,\\%'}</M>. Gesucht
            ist, wie viel Frau Sommer in jedem Jahr an die Bank zahlt (Tilgung plus Zinsen) und wie viel Zinsen sie insgesamt zahlt.
          </p>
          <p className="sl-hinweis">
            <strong>Tilgung</strong> heißt Rückzahlung eines Teils der Schuld. Die Zinsen berechnet die Bank jedes Jahr für die Schuld am Jahresanfang.
            Die Jahresrate aus Tilgung und Zinsen heißt <strong>Annuität</strong>.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Lege dich fest, ohne zu rechnen</p>
            <p>Wie entwickelt sich Frau Sommers Jahresrate in den 5 Jahren? Und wie viel Zinsen zahlt sie insgesamt ungefähr?</p>
          </div>
          <RatenDiagramm modus="vermutung" wahl={fest.wahl} />
          <Vermutung
            optionen={WAHL}
            regler={{
              min: 0,
              max: 20000,
              step: 500,
              text: (v) => (
                <>
                  Zinsen insgesamt etwa <span className="ls-slider-value">{tausend(v)} €</span>
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig}
            gespeichert={(w) => (
              <>
                Deine Vermutung: <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong> Zinsen insgesamt etwa <strong>{tausend(w.wert)} €</strong>.
              </>
            )}
          />
          {fest.fest && (
            <p className="sl-text">
              Ob deine Vermutung stimmt und ob das Budget in jedem Jahr reicht, kannst du ohne Rechnung nicht sicher sagen. Gleich erstellst du dafür
              einen Tilgungsplan.
            </p>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Der Tilgungsplan für den Ofen',
      pflicht: ['plan', 'entscheidung', 'produkt', 'jahr10'],
      inhalt: (fertig) => {
        const planMelden = () => {
          fertig.teil('plan')();
          setPlanGeloest(true);
        };
        const jahrMelden = () => {
          fertig.teil('jahr10')();
          setJahrGeloest(true);
        };
        return (
          <>
            <div className="sl-fokus">
              <p className="sl-fokus-titel">Deine Aufgabe: Erstelle den Tilgungsplan und beantworte Frau Sommers Frage</p>
              <p>
                Das Ratendarlehen über 60.000 € läuft 5 Jahre zu 5 % p.a., die Tilgung ist jedes Jahr gleich hoch. Berechne für jedes Jahr die Schuld
                am Jahresanfang, die Zinsen, die Tilgung und die Annuität. Prüfe, ob das Budget von 14.500 € in jedem Jahr reicht, und berechne die
                Zinsen insgesamt.
              </p>
            </div>
            <RatenDiagramm modus={planGeloest ? 'plan' : 'leer'} />
            <Aufklappbar label="Rechenbeispiel ansehen">
              <Beispiel offen title="Der Kredit des Friseursalons" aufgabe={BSP1_AUFGABE} steps={BSP1_SCHRITTE} />
            </Aufklappbar>
            <Handlungsprodukt titel="Tilgungsplan für Frau Sommer">
              <HeftBild />
              <p className="sl-text">
                Lege in deinem Heft den Tilgungsplan für den Ofen-Kredit an: eine Tabelle mit allen 5 Jahren und einer Summenzeile, darunter ein
                Balkendiagramm der Annuitäten mit der Budget-Linie bei 14.500 €. Schreibe zum Schluss einen Antwortsatz an Frau Sommer. Übertrage deinen
                Tilgungsplan danach unten in die Tabelle.
              </p>
            </Handlungsprodukt>
            <Abschnitt titel="Deine Ergebnisse prüfen">
              <WegWahl
                selbst={
                  <TilgungsplanCheck
                    onSolved={planMelden}
                    title="Tilgungsplan für den Ofen"
                    prompt={<p>Übertrage deinen Tilgungsplan aus dem Heft in die Tabelle und prüfe ihn.</p>}
                    zeilen={PLAN.map((r) => ({ jahr: r.jahr, schuld: r.schuld, tilgung: T, zinsen: r.zinsen, annuitaet: r.annuitaet }))}
                    summe={{ tilgung: K0, zinsen: Z_GES, annuitaet: K0 + Z_GES }}
                    solution={LOESUNG_PLAN}
                    help={
                      <Hilfen
                        steps={[
                          <>Beim Ratendarlehen ist die Tilgung jedes Jahr gleich. Die Zinsen gibt es nur auf die Schuld, die am Jahresanfang noch übrig ist.</>,
                          <>
                            Wie beim Friseursalon: erst <M>{'T = \\frac{K_0}{n}'}</M>, dann Jahr für Jahr Zinsen von der Schuld am Jahresanfang, Annuität = Tilgung
                            + Zinsen, neue Schuld = alte Schuld − Tilgung.
                          </>,
                          <>
                            <M>{'T = 60\\,000 : 5'}</M>. 1. Jahr: <M>{'Z_1 = 60\\,000 \\cdot 0{,}05'}</M>. 2. Jahr: Die Schuld ist um <M>T</M> kleiner, also{' '}
                            <M>{'Z_2 = (60\\,000 - T) \\cdot 0{,}05'}</M>. Für die Zinsen insgesamt addierst du alle 5 Zinsbeträge.
                          </>,
                        ]}
                      />
                    }
                  />
                }
                schema={
                  <CheckCard
                    onSolved={planMelden}
                    title="Tilgungsplan mit Lösungsschema"
                    prompt={<p>Rechne in deinem Heft nach diesem Schema wie im Beispiel und trage die Ergebnisse ein.</p>}
                    rechnung={[
                      { l: ['T'], r: ['\\frac{K_0}{n} =', { luecke: 't', breit: true }, '\\text{ €}'], u: '\\text{① Tilgung}' },
                      { l: ['Z_1'], r: ['K_0 \\cdot 0{,}05 =', { luecke: 'z1', breit: true }, '\\text{ €}'], u: '\\text{② Zinsen Jahr 1}' },
                      { l: ['A_1'], r: ['T + Z_1 =', { luecke: 'a1', breit: true }, '\\text{ €}'], u: '\\text{③ Annuität Jahr 1}' },
                      { l: ['K_1'], r: ['K_0 - T =', { luecke: 'k1', breit: true }, '\\text{ €}'], u: '\\text{④ Restschuld}' },
                      { l: ['Z_2'], r: ['K_1 \\cdot 0{,}05 =', { luecke: 'z2', breit: true }, '\\text{ €}'], u: '\\text{⑤ Zinsen Jahr 2}' },
                      { l: ['A_2'], r: ['T + Z_2 =', { luecke: 'a2', breit: true }, '\\text{ €}'], u: '\\text{⑥ Annuität Jahr 2}' },
                      { l: ['A_5'], r: ['T + K_4 \\cdot 0{,}05 =', { luecke: 'a5', breit: true }, '\\text{ €}'], u: '\\text{⑦ Annuität Jahr 5}' },
                      { l: ['Z_{ges}'], r: ['Z_1 + Z_2 + Z_3 + Z_4 + Z_5 =', { luecke: 'zg', breit: true }, '\\text{ €}'], u: '\\text{⑧ Zinsen insgesamt}' },
                    ]}
                    fields={[
                      { kind: 'num', key: 't', label: 'Tilgung', expected: T },
                      { kind: 'num', key: 'z1', label: 'Zinsen Jahr 1', expected: PLAN[0].zinsen },
                      { kind: 'num', key: 'a1', label: 'Annuität Jahr 1', expected: PLAN[0].annuitaet },
                      { kind: 'num', key: 'k1', label: 'Restschuld', expected: PLAN[0].rest },
                      { kind: 'num', key: 'z2', label: 'Zinsen Jahr 2', expected: PLAN[1].zinsen },
                      { kind: 'num', key: 'a2', label: 'Annuität Jahr 2', expected: PLAN[1].annuitaet },
                      { kind: 'num', key: 'a5', label: 'Annuität Jahr 5', expected: PLAN[4].annuitaet },
                      { kind: 'num', key: 'zg', label: 'Zinsen insgesamt', expected: Z_GES },
                    ]}
                    loesungNachFehler
                    solution={LOESUNG_PLAN}
                    help={
                      <SchrittHilfen
                        schritte={[
                          { kurz: '①', titel: 'Tilgung', hilfe: <>Teile das Darlehen durch die Laufzeit: <M>{'60\\,000 \\text{ €} : 5'}</M>.</> },
                          { kurz: '②', titel: 'Zinsen Jahr 1', hilfe: <>Im 1. Jahr ist noch die ganze Schuld da: <M>{'60\\,000 \\text{ €} \\cdot 0{,}05'}</M>.</> },
                          { kurz: '③', titel: 'Annuität Jahr 1', hilfe: <>Addiere die Tilgung aus ① und die Zinsen aus ②.</> },
                          { kurz: '④', titel: 'Restschuld', hilfe: <>Nach dem 1. Jahr ist die Schuld um eine Tilgung kleiner: 60.000 € minus das Ergebnis aus ①.</> },
                          { kurz: '⑤', titel: 'Zinsen Jahr 2', hilfe: <>Rechne 5 % von der Restschuld aus ④, nicht mehr von 60.000 €.</> },
                          { kurz: '⑥', titel: 'Annuität Jahr 2', hilfe: <>Tilgung aus ① plus Zinsen aus ⑤.</> },
                          {
                            kurz: '⑦',
                            titel: 'Annuität Jahr 5',
                            hilfe: (
                              <>
                                Vor dem 5. Jahr sind 4 Tilgungen bezahlt, es bleibt <M>{'K_4 = 60\\,000 \\text{ €} - 4 \\cdot T'}</M>. Davon 5 % Zinsen, dazu die Tilgung.
                              </>
                            ),
                          },
                          {
                            kurz: '⑧',
                            titel: 'Zinsen insgesamt',
                            hilfe: <>Rechne in deiner Tabelle die Zinsen aller 5 Jahre aus und addiere sie. Sie werden jedes Jahr um 600 € kleiner.</>,
                          },
                        ]}
                      />
                    }
                  />
                }
              />
            </Abschnitt>
            <Abschnitt titel="Deine Antwort an Frau Sommer">
              <McCard
                onSolved={fertig.teil('entscheidung')}
                title="Reicht das Budget?"
                prompt={<p>Frau Sommer kann pro Jahr höchstens 14.500 € zahlen. Was sagst du ihr?</p>}
                options={[
                  {
                    text: (
                      <>
                        Nein, in keinem Jahr: Sie zahlt jedes Jahr <M>{'12\\,000 \\text{ €} + 3\\,000 \\text{ €} = 15\\,000 \\text{ €}'}</M>.
                      </>
                    ),
                    feedback:
                      '3.000 € Zinsen gibt es nur im 1. Jahr. Danach ist die Schuld kleiner, also auch die Zinsen. Schau in deinen Tilgungsplan.',
                  },
                  {
                    text: 'Ja, in jedem Jahr: Die Annuität liegt immer unter 14.500 €.',
                    feedback: 'Schau dir das 1. Jahr an: 12.000 € Tilgung plus 3.000 € Zinsen sind 15.000 €. Das ist mehr als 14.500 €.',
                  },
                  {
                    text: 'Nur im 1. Jahr fehlen 500 €. Ab dem 2. Jahr reicht das Budget, weil die Annuität jedes Jahr um 600 € sinkt.',
                    correct: true,
                    feedback:
                      'Genau. Im 1. Jahr sind es 15.000 €, im 2. Jahr nur noch 14.400 €. Die 500 € für das 1. Jahr könnte Frau Sommer zum Beispiel aus ihren Rücklagen nehmen.',
                  },
                  {
                    text: 'Erst ab dem 3. Jahr reicht das Budget.',
                    feedback: (
                      <>
                        Im 2. Jahr beträgt die Annuität <M>{'12\\,000 \\text{ €} + 2\\,400 \\text{ €} = 14\\,400 \\text{ €}'}</M>. Das liegt schon unter 14.500 €.
                      </>
                    ),
                  },
                ]}
              />
            </Abschnitt>
            <Abschnitt titel="Ist dein Tilgungsplan vollständig?">
              <Kriterien
                onAlle={fertig.teil('produkt')}
                items={[
                  'Die Tabelle hat alle 5 Jahre: Schuld am Jahresanfang, Zinsen, Tilgung und Annuität',
                  'Eine Summenzeile mit den Zinsen und den Annuitäten insgesamt',
                  'Ein Balkendiagramm der Annuitäten (Tilgung und Zinsen) mit der Budget-Linie bei 14.500 €',
                  'Ein Antwortsatz an Frau Sommer: Reicht das Budget, und warum sind es nicht 15.000 € Zinsen?',
                ]}
              />
            </Abschnitt>
            <Abschnitt titel="Teil 2: Direkt ins 10. Jahr">
              <Zitat wer="Frau Sommer">
                <p>Und wenn ich die Laufzeit auf 15 Jahre verlängere? Wie viel zahle ich dann zum Beispiel im 10. Jahr?</p>
              </Zitat>
              <p className="sl-text">
                Ein Tilgungsplan über 15 Jahre dauert lange. Mit den Formeln aus der Merkhilfe berechnest du ein Jahr direkt. Gegeben sind{' '}
                <M>{'K_0 = 60\\,000'}</M> €, <M>{'n = 15'}</M>, <M>{'p = 5\\,\\%'}</M> und das Jahr <M>{'v = 10'}</M>. Gesucht sind die Tilgung, die Schuld
                zu Beginn des 10. Jahres, die Zinsen und die Annuität im 10. Jahr.
              </p>
              <Aufklappbar label="Rechenbeispiel ansehen">
                <Beispiel offen title="Ein Jahr direkt berechnen" aufgabe={BSP2_AUFGABE} steps={BSP2_SCHRITTE} />
              </Aufklappbar>
              <WegWahl
                selbst={
                  <TilgungsplanCheck
                    onSolved={jahrMelden}
                    title="Das 10. Jahr"
                    prompt={<p>Trage die Werte für das 10. Jahr aus deinem Heft in die Zeile des Tilgungsplans ein und prüfe sie.</p>}
                    zeilen={[{ jahr: V2, schuld: K9, tilgung: T2, zinsen: Z10, annuitaet: A10 }]}
                    solution={LOESUNG_JAHR10}
                    help={
                      <Hilfen
                        steps={[
                          <>Zu Beginn des 10. Jahres sind 9 Tilgungen bezahlt. Wie viele sind noch offen?</>,
                          <>
                            Wie im Beispiel: <M>{'T = \\frac{K_0}{n}'}</M>, <M>{'K_9 = T \\cdot (n - 9)'}</M>, <M>{'Z_v = T \\cdot (q - 1) \\cdot (n - v + 1)'}</M>,{' '}
                            <M>{'A_v = T + Z_v'}</M>.
                          </>,
                          <>
                            <M>{'T = 60\\,000 : 15 = 4\\,000'}</M>. Es sind noch <M>{'15 - 10 + 1 = 6'}</M> Tilgungen offen:{' '}
                            <M>{'Z_{10} = 4\\,000 \\cdot 0{,}05 \\cdot 6'}</M>.
                          </>,
                        ]}
                      />
                    }
                  />
                }
                schema={
                  <CheckCard
                    onSolved={jahrMelden}
                    title="Das 10. Jahr mit Lösungsschema"
                    prompt={<p>Rechne in deinem Heft nach diesem Schema und trage die Ergebnisse ein.</p>}
                    rechnung={[
                      { l: ['T'], r: ['\\frac{K_0}{n} =', { luecke: 't', breit: true }, '\\text{ €}'], u: '\\text{① Tilgung}' },
                      { l: ['K_9'], r: ['T \\cdot (n - 9) =', { luecke: 'k9', breit: true }, '\\text{ €}'], u: '\\text{② Schuld Anfang Jahr 10}' },
                      { l: ['Z_{10}'], r: ['T \\cdot (q - 1) \\cdot (n - v + 1) =', { luecke: 'z10', breit: true }, '\\text{ €}'], u: '\\text{③ Zinsen}' },
                      { l: ['A_{10}'], r: ['T + Z_{10} =', { luecke: 'a10', breit: true }, '\\text{ €}'], u: '\\text{④ Annuität}' },
                    ]}
                    fields={[
                      { kind: 'num', key: 't', label: 'Tilgung', expected: T2 },
                      { kind: 'num', key: 'k9', label: 'Schuld Anfang Jahr 10', expected: K9 },
                      { kind: 'num', key: 'z10', label: 'Zinsen Jahr 10', expected: Z10 },
                      { kind: 'num', key: 'a10', label: 'Annuität Jahr 10', expected: A10 },
                    ]}
                    loesungNachFehler
                    solution={LOESUNG_JAHR10}
                    help={
                      <SchrittHilfen
                        schritte={[
                          { kurz: '①', titel: 'Tilgung', hilfe: <>Jetzt sind es 15 Jahre: <M>{'60\\,000 \\text{ €} : 15'}</M>.</> },
                          {
                            kurz: '②',
                            titel: 'Schuld Anfang Jahr 10',
                            hilfe: <>Nach 9 Jahren sind 9 Tilgungen bezahlt, offen sind <M>{'15 - 9 = 6'}</M>. Rechne <M>{'T \\cdot 6'}</M>.</>,
                          },
                          {
                            kurz: '③',
                            titel: 'Zinsen',
                            hilfe: (
                              <>
                                <M>{'q - 1 = 0{,}05'}</M> und <M>{'n - v + 1 = 15 - 10 + 1 = 6'}</M>. Rechne <M>{'T \\cdot 0{,}05 \\cdot 6'}</M>. Das sind 5 % der
                                Schuld aus ②.
                              </>
                            ),
                          },
                          { kurz: '④', titel: 'Annuität', hilfe: <>Addiere die Tilgung aus ① und die Zinsen aus ③.</> },
                        ]}
                      />
                    }
                  />
                }
              />
            </Abschnitt>
            {planGeloest && jahrGeloest && (
              <Abschnitt titel="Das hältst du fest">
                <Rueckbezug fest={fest} />
                <Merke title="Ratendarlehen">
                  <ul>
                    <li>
                      Die <strong>Tilgung</strong> ist jedes Jahr gleich: <M>{'T = \\frac{K_0}{n}'}</M>
                    </li>
                    <li>
                      Die <strong>Zinsen</strong> gibt es nur auf die Schuld am Jahresanfang. Diese Schuld wird jedes Jahr um <M>T</M> kleiner, also
                      sinken die Zinsen jedes Jahr um denselben Betrag.
                    </li>
                    <li>
                      Die <strong>Annuität</strong> ist Tilgung plus Zinsen: <M>{'A_v = T + Z_v'}</M>. Beim Ratendarlehen ist sie im 1. Jahr am höchsten
                      und sinkt dann.
                    </li>
                    <li>
                      Die Zinsen insgesamt sind kleiner als <M>{'K_0 \\cdot \\frac{p}{100} \\cdot n'}</M>, weil die Schuld nicht die ganze Zeit gleich hoch ist.
                    </li>
                  </ul>
                  <p>Formeln aus der Merkhilfe für ein beliebiges Jahr <M>v</M>:</p>
                  <MB>{'K_v = T \\cdot (n - v) \\qquad Z_v = T \\cdot (q - 1) \\cdot (n - v + 1) \\qquad A_v = T + Z_v'}</MB>
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
      pflicht: ['1', '2', '3'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die letzte ist für Profis.</p>
          <Abschnitt titel="Übung 1: Die erste Annuität">
            <TrackedMc
              onSolved={fertig.teil('1')}
              topic="Ratendarlehen-Einstieg: Annuität im 1. Jahr (Basis)"
              title="Übung 1"
              rechnen
              level="basis"
              prompt={<p>Ein Ratendarlehen über 40.000 € läuft 8 Jahre zu 4 % p.a. Wie hoch ist die Annuität im 1. Jahr?</p>}
              options={[
                {
                  text: '1.600 €',
                  feedback: (
                    <>
                      1.600 € sind nur die Zinsen. Zur Annuität gehört auch die Tilgung: <M>{'40\\,000 \\text{ €} : 8 = 5\\,000 \\text{ €}'}</M>.
                    </>
                  ),
                },
                {
                  text: '6.600 €',
                  correct: true,
                  feedback: (
                    <>
                      <M>{'T = 40\\,000 \\text{ €} : 8 = 5\\,000 \\text{ €}'}</M>, <M>{'Z_1 = 40\\,000 \\text{ €} \\cdot 0{,}04 = 1\\,600 \\text{ €}'}</M>,{' '}
                      <M>{'A_1 = 5\\,000 \\text{ €} + 1\\,600 \\text{ €} = 6\\,600 \\text{ €}'}</M>.
                    </>
                  ),
                },
                {
                  text: '6.400 €',
                  feedback: 'Hier wurden die Zinsen von 35.000 € berechnet. Im 1. Jahr gibt es Zinsen auf die ganze Schuld am Jahresanfang, also auf 40.000 €.',
                },
                { text: '5.000 €', feedback: '5.000 € sind nur die Tilgung. Dazu kommen die Zinsen von 1.600 €.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={fertig.teil('2')}
              topic="Ratendarlehen-Einstieg: Zinsen im Jahr v (Standard)"
              title="Übung 2"
              rechnen
              level="standard"
              prompt={<p>Ein Ratendarlehen über 30.000 € läuft 5 Jahre zu 6 % p.a. Wie viel Zinsen fallen im 3. Jahr an?</p>}
              options={[
                {
                  text: (
                    <>
                      Tom: „Die Zinsen bleiben gleich: <M>{'30\\,000 \\text{ €} \\cdot 0{,}06 = 1\\,800 \\text{ €}'}</M>.“
                    </>
                  ),
                  feedback: 'So rechnet Frau Sommer am Anfang. Die Schuld ist im 3. Jahr aber schon um zwei Tilgungen kleiner.',
                },
                {
                  text: (
                    <>
                      Lea: „<M>{'6\\,000 \\text{ €} \\cdot 0{,}06 \\cdot (5 - 3) = 720 \\text{ €}'}</M>.“
                    </>
                  ),
                  feedback: (
                    <>
                      Zu Beginn des 3. Jahres sind erst 2 Tilgungen bezahlt, 3 sind noch offen: <M>{'n - v + 1 = 3'}</M>, nicht <M>{'n - v = 2'}</M>.
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      Max: „<M>{'24\\,000 \\text{ €} \\cdot 0{,}06 = 1\\,440 \\text{ €}'}</M>.“
                    </>
                  ),
                  feedback: '24.000 € ist die Schuld zu Beginn des 2. Jahres. Zu Beginn des 3. Jahres sind es nur noch 18.000 €.',
                },
                {
                  text: (
                    <>
                      Ayla: „<M>{'6\\,000 \\text{ €} \\cdot 0{,}06 \\cdot (5 - 3 + 1) = 1\\,080 \\text{ €}'}</M>.“
                    </>
                  ),
                  correct: true,
                  feedback: 'Genau: T = 6.000 €, noch 3 Tilgungen offen, also 18.000 € Schuld. Davon 6 % sind 1.080 €.',
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Mitten im Kredit">
            <TrackedCheck
              onSolved={fertig.teil('3')}
              topic="Ratendarlehen-Einstieg: Schuld, Zinsen und Annuität im Jahr v (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Für ein Elektro-Lieferauto nimmt ein Getränkehandel ein Ratendarlehen über 50.000 € auf, Laufzeit 10 Jahre, Zinssatz 4,5 % p.a.
                  Berechne die Schuld zu Beginn des 7. Jahres, die Zinsen und die Annuität im 7. Jahr.
                </p>
              }
              fields={[
                { kind: 'num', key: 'k6', label: <M>{'K_6 ='}</M>, expected: 20000, unit: '€' },
                { kind: 'num', key: 'z7', label: <M>{'Z_7 ='}</M>, expected: 900, unit: '€' },
                { kind: 'num', key: 'a7', label: <M>{'A_7 ='}</M>, expected: 5900, unit: '€' },
              ]}
              solution={
                <>
                  <MB>{'T = \\frac{50\\,000 \\text{ €}}{10} = 5\\,000 \\text{ €} \\qquad K_6 = 5\\,000 \\text{ €} \\cdot (10 - 6) = 20\\,000 \\text{ €}'}</MB>
                  <MB>{'Z_7 = 5\\,000 \\text{ €} \\cdot 0{,}045 \\cdot (10 - 7 + 1) = 900 \\text{ €} \\qquad A_7 = 5\\,000 \\text{ €} + 900 \\text{ €} = 5\\,900 \\text{ €}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Erst die Tilgung, dann die Schuld, die zu Beginn des 7. Jahres noch übrig ist.</>,
                    <>
                      Nach 6 Jahren sind 6 Tilgungen bezahlt: <M>{'K_6 = T \\cdot (n - 6)'}</M>. Dann <M>{'Z_7 = K_6 \\cdot 0{,}045'}</M> und{' '}
                      <M>{'A_7 = T + Z_7'}</M>.
                    </>,
                    <>
                      <M>{'T = 50\\,000 : 10 = 5\\,000'}</M>, <M>{'K_6 = 5\\,000 \\cdot 4'}</M>, <M>{'Z_7 = 20\\,000 \\cdot 0{,}045'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Rückwärts gedacht">
            <CheckCard
              title="Kredit und Zinssatz finden"
              level="erweiterung"
              prompt={
                <p>
                  Eine Gärtnerei hat ein Ratendarlehen mit 8 Jahren Laufzeit. Im Kontoauszug steht nur: Annuität im 1. Jahr 5.850 €, davon 1.350 € Zinsen.
                  Wie hoch war das Darlehen, und wie hoch ist der Zinssatz?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'k0', label: <M>{'K_0 ='}</M>, expected: 36000, unit: '€' },
                { kind: 'num', key: 'p', label: <M>{'p ='}</M>, expected: 3.75, unit: '%' },
              ]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'T = 5\\,850 \\text{ €} - 1\\,350 \\text{ €} = 4\\,500 \\text{ €} \\qquad K_0 = T \\cdot n = 4\\,500 \\text{ €} \\cdot 8 = 36\\,000 \\text{ €}'}</MB>
                  <MB>{'p = \\frac{1\\,350 \\text{ €}}{36\\,000 \\text{ €}} \\cdot 100 = 3{,}75\\,\\%'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Die Annuität besteht aus Tilgung und Zinsen. Was bleibt für die Tilgung übrig?</>,
                    <>Die Tilgung ist jedes Jahr gleich, also ist das Darlehen <M>{'T \\cdot n'}</M>. Im 1. Jahr gibt es Zinsen auf das ganze Darlehen.</>,
                    <>
                      <M>{'T = 5\\,850 - 1\\,350'}</M>, <M>{'K_0 = T \\cdot 8'}</M>, <M>{'p = \\frac{1\\,350}{K_0} \\cdot 100'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <div className="sl-ende">
            <p>
              Du kannst jetzt einen Tilgungsplan für ein Ratendarlehen aufstellen und ein Jahr direkt mit den Formeln berechnen. Bei den Übungsaufgaben
              füllst du Tilgungspläne mit immer neuen Zahlen aus.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Tilgungsplan <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Ratendarlehen: Der neue Backofen"
      width="wide"
      kompakt
      parent={{ to: '/finanzmathe/ratendarlehen', label: 'Ratendarlehen' }}
    >
      <SeitenLernsituation
        ruhig
        thema={THEMA}
        ziel={
          <>
            In dieser Lernsituation hilfst du einer Bäckerei bei der Finanzierung eines neuen Ofens. Du lernst, wie ein Ratendarlehen zurückgezahlt
            wird, und stellst einen Tilgungsplan auf.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Vermutung aus Phase 2 */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  if (!fest.fest || !fest.wahl) return null;
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {WAHL[fest.wahl]} Zinsen insgesamt etwa {tausend(fest.wert)} €.{' '}
        {fest.wahl === 'sinkt'
          ? 'Das stimmt: Die Annuität sinkt jedes Jahr um 600 €, von 15.000 € auf 12.600 €.'
          : 'Tatsächlich sinkt die Annuität jedes Jahr um 600 €, von 15.000 € auf 12.600 €. Die Tilgung bleibt gleich, aber die Zinsen werden kleiner.'}{' '}
        {fest.wert >= 14000
          ? 'Frau Sommers 15.000 € Zinsen gäbe es nur, wenn die ganze Schuld 5 Jahre lang stehen bliebe. Weil sie jedes Jahr kleiner wird, sind es nur 9.000 €.'
          : `Insgesamt sind es 9.000 € Zinsen, deine Schätzung lag ${tausend(Math.abs(fest.wert - Z_GES))} € daneben.`}
      </p>
    </div>
  );
}
