import { type ReactNode } from 'react';
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
import AuswahlSpiel, { mischen, zufall, type AuswahlRunde } from '../../lineare_funktionen/lernsituation_kit/AuswahlSpiel';
import { Kriterien, Vermutung, euro, standardKriterien, type Festlegung } from '../zins_kit/zins_kit';
import titelBild from './bilder/backofen-titel.webp';
import angebotBild from './bilder/backofen-angebot.webp';
import heftBild from './bilder/backofen-heft.webp';
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
// (in Phase 2 die Vermutung, in Phase 3 der echte Tilgungsplan gegen die Budget-Linie).
// Problem lösen in zwei Teilen (Teil 1 Tilgungsplan und Budget, Teil 2 das 10. Jahr direkt mit der Merkhilfe), Teil 2 erst nach Teil 1.
// Punkte nach Aufwand: Warm-up 3/3/3/2/2 = 13, Festlegung, Teil 1 14, Entscheidung 4, Teil 2 10, Tilgungsplan im Heft, Übungen 4/6/8, Profi 9;
// Bonus-Spiel „Raten-Bäckerei“ 4 Runden à 2.
// Bildwelt Reportage / Abendlicht: Titelbild, Angebot und Heftseite sind gerenderte WebP-Dateien aus bilder-quelle/backofen-*.bild.html;
// das Raten-Diagramm bleibt Inline-SVG.

export const VIDEO_RATENDARLEHEN = 'https://youtu.be/w_UjVYwD_Xo';

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

const THEMA: Thema = {
  name: 'Der neue Backofen',
  farbe: 'kupfer',
  icon: 'fa-bread-slice',
  kicker: 'Aus der Bäckerei Sommer',
  bildzeile: 'Der neue Etagenofen steht schon vor der Tür, bezahlt ist er noch nicht. Illustration: Mathe-Trainer',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Die Bäckerei Sommer am frühen Abend, im Schaufenster leuchten Brote. Vor der Tür steht ein neuer Etagenofen mit drei Ofentüren auf einer Palette, am Preisschild: 60.000 €, 5 Jahre, 5 %."
    />
  ),
};
const BILDWELT: Bildwelt = { welt: 'reportage', variante: 'abendlicht' };

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
        <MB>{'Z_1 = 24\\,000 \\text{ €} \\cdot 0{,}06 = 1\\,440 \\text{ €}'}</MB>
        <MB>{'A_1 = 6\\,000 \\text{ €} + 1\\,440 \\text{ €} = 7\\,440 \\text{ €}'}</MB>
        <MB>{'K_1 = 24\\,000 \\text{ €} - 6\\,000 \\text{ €} = 18\\,000 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: '2. Jahr: mit der kleineren Schuld weiterrechnen',
    body: (
      <>
        <p>Im 2. Jahr gibt es nur noch Zinsen für die Restschuld von 18.000 €:</p>
        <MB>{'Z_2 = 18\\,000 \\text{ €} \\cdot 0{,}06 = 1\\,080 \\text{ €}'}</MB>
        <MB>{'A_2 = 6\\,000 \\text{ €} + 1\\,080 \\text{ €} = 7\\,080 \\text{ €}'}</MB>
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
    <Loesungsweg
      schritte={[
        { titel: 'Tilgung', tex: 'T = \\dfrac{60\\,000 \\text{ €}}{5} = 12\\,000 \\text{ €}' },
        { titel: 'Zinsen im 1. Jahr', tex: 'Z_1 = 60\\,000 \\text{ €} \\cdot 0{,}05 = 3\\,000 \\text{ €}' },
        { titel: 'Annuität im 1. Jahr', tex: 'A_1 = 12\\,000 \\text{ €} + 3\\,000 \\text{ €} = 15\\,000 \\text{ €}' },
        { titel: 'Restschuld nach dem 1. Jahr', tex: 'K_1 = 60\\,000 \\text{ €} - 12\\,000 \\text{ €} = 48\\,000 \\text{ €}' },
        { titel: 'Zinsen und Annuität im 2. Jahr', tex: 'Z_2 = 48\\,000 \\text{ €} \\cdot 0{,}05 = 2\\,400 \\text{ €}', text: 'A₂ = 12.000 € + 2.400 € = 14.400 €. So geht es weiter bis zum 5. Jahr.' },
        { titel: 'Annuität im 5. Jahr', tex: 'A_5 = 12\\,000 \\text{ €} + 12\\,000 \\text{ €} \\cdot 0{,}05 = 12\\,600 \\text{ €}' },
        { titel: 'Zinsen insgesamt', tex: 'Z = 3\\,000 + 2\\,400 + 1\\,800 + 1\\,200 + 600 = 9\\,000 \\text{ €}' },
      ]}
    />
    <PlanTabelle zeilen={PLAN.map((r) => ({ ...r, tilgung: T }))} summe={{ zinsen: Z_GES, tilgung: K0, annuitaet: K0 + Z_GES }} />
    <p>Die Zinsen sinken jedes Jahr um 600 €. Zusammen sind es 9.000 €, nicht 15.000 €: Die 5 % gibt es nur auf die Schuld, die noch übrig ist.</p>
  </>
);

const LOESUNG_JAHR10 = (
  <Loesungsweg
    schritte={[
      { titel: 'Tilgung', tex: 'T = \\dfrac{60\\,000 \\text{ €}}{15} = 4\\,000 \\text{ €}' },
      { titel: 'Schuld zu Beginn des 10. Jahres', tex: 'K_9 = 4\\,000 \\text{ €} \\cdot (15 - 9) = 24\\,000 \\text{ €}' },
      { titel: 'Zinsen im 10. Jahr', tex: 'Z_{10} = 4\\,000 \\text{ €} \\cdot 0{,}05 \\cdot (15 - 10 + 1) = 1\\,200 \\text{ €}' },
      { titel: 'Annuität im 10. Jahr', tex: 'A_{10} = 4\\,000 \\text{ €} + 1\\,200 \\text{ €} = 5\\,200 \\text{ €}' },
    ]}
  />
);

/* ── Bonus-Spiel: Raten-Bäckerei ─────────────────────────────────────────── */

/** Eine Runde: Ratendarlehen K0, n, p, Jahr v; gesucht ist die Annuität A_v. Falsch: Zinsen auf K0, n − v statt n − v + 1, nur die Zinsen */
function ratenRunden(): AuswahlRunde[] {
  return Array.from({ length: 4 }, () => {
    for (;;) {
      const n = zufall([4, 5, 8, 10]);
      const k0 = n * zufall([2000, 3000, 4000, 5000, 6000]);
      const p = zufall([3, 4, 5, 6]);
      const v = zufall([2, 3, 4]);
      const t = k0 / n;
      const z = (t * (n - v + 1) * p) / 100;
      const werte = [t + z, t + (k0 * p) / 100, t + (t * (n - v) * p) / 100, z];
      if (new Set(werte).size < 4) continue;
      return {
        frage: (
          <p>
            Ratendarlehen: <M>{`K_0 = ${tausend(k0).replace('.', '.')} \\text{ €},\; n = ${n},\; p = ${p}\\,\\%`}</M>. Wie hoch ist die Annuität im {v}. Jahr?
          </p>
        ),
        ziele: mischen([
          { text: euro(werte[0]), richtig: true, erklaerung: <>Richtig: <M>{'A_v = T + T \\cdot (q - 1) \\cdot (n - v + 1)'}</M>.</> },
          { text: euro(werte[1]), erklaerung: 'Hier wurden die Zinsen vom ganzen Darlehen berechnet. Im Jahr v ist die Schuld schon kleiner.' },
          { text: euro(werte[2]), erklaerung: 'Hier wurde mit n − v gerechnet. Zu Beginn des Jahres v sind noch n − v + 1 Tilgungen offen.' },
          { text: euro(werte[3]), erklaerung: 'Das sind nur die Zinsen. Zur Annuität gehört auch die Tilgung.' },
        ]),
      };
    }
  });
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function BackofenEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [fest, setFest] = useSitzungState<Festlegung<Wahl>>('bo-fest', { wahl: null, wert: 5000, fest: false });
  const [planGeloest, setPlanGeloest] = useSitzungState('bo-plan', false);
  const [jahrGeloest, setJahrGeloest] = useSitzungState('bo-jahr', false);
  const [uebungen, setUebungen] = useSitzungState<string[]>('bo-uebungen', []);
  const uebung = (k: string, fertig: () => void) => () => {
    fertig();
    setUebungen((u) => (u.includes(k) ? u : [...u, k]));
  };

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 10 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Zinsen für ein Jahr"
            prompt={<p>Ein Kredit über 25.000 € kostet 4 % Zinsen pro Jahr. Wie viel Zinsen fallen in einem Jahr an?</p>}
            fields={[{ kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 1000, unit: '€' }]}
            solution={<MB>{'Z = 25\\,000 \\text{ €} \\cdot 0{,}04 = 1\\,000 \\text{ €}'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={3}
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
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Ein Teil', tex: '1\\,800 \\text{ €} : 6 = 300 \\text{ €}' },
                  { titel: 'Rest nach 2 Teilen', tex: '1\\,800 \\text{ €} - 2 \\cdot 300 \\text{ €} = 1\\,200 \\text{ €}' },
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={3}
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
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Als Dezimalzahl', tex: '\\dfrac{3{,}5}{100} = 0{,}035' },
                  { titel: 'Zinsfaktor', tex: 'q = 1 + 0{,}035 = 1{,}035' },
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={3}
            title="d) Die Schuld wird kleiner"
            prompt={<p>Ein Kredit über 20.000 € kostet 5 % Zinsen pro Jahr. Nach einem Jahr sind 4.000 € zurückgezahlt. Wie viel Zinsen fallen im 2. Jahr an?</p>}
            fields={[{ kind: 'num', key: 'z', label: <M>{'Z_2 ='}</M>, expected: 800, unit: '€' }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Schuld zu Beginn des 2. Jahres', tex: '20\\,000 \\text{ €} - 4\\,000 \\text{ €} = 16\\,000 \\text{ €}' },
                  { titel: 'Zinsen im 2. Jahr', tex: '16\\,000 \\text{ €} \\cdot 0{,}05 = 800 \\text{ €}' },
                ]}
              />
            }
          />
          <McCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title="e) Was ist eine Annuität?"
            prompt={<p>Ein Kreditnehmer zahlt in einem Jahr 3.000 € Tilgung und 450 € Zinsen an die Bank. Welche Aussage stimmt?</p>}
            options={[
              { text: 'Die Annuität sind die 450 € Zinsen.', feedback: 'Die Zinsen sind nur ein Teil der Jahresrate.' },
              { text: 'Die Annuität sind die 3.000 € Tilgung.', feedback: 'Die Tilgung ist nur ein Teil der Jahresrate.' },
              { text: 'Die Annuität ist die Jahresrate: 3.000 € + 450 € = 3.450 €.', correct: true, feedback: 'Genau: Annuität = Tilgung + Zinsen.' },
              { text: 'Die Annuität ist die Restschuld nach dem Jahr.', feedback: 'Die Restschuld ist das, was nach der Tilgung noch übrig ist. Die Annuität ist die Zahlung im Jahr.' },
            ]}
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
          <blockquote className="sl-zitat">
            <p>
              „Die Bank bietet mir ein Ratendarlehen an: 60.000 € für 5 Jahre zu 5 % Zinsen pro Jahr. Ich zahle jedes Jahr den gleichen Teil der Schuld
              zurück, dazu kommen die Zinsen. Mehr als 14.500 € im Jahr kann ich dafür aber nicht ausgeben. 5 % von 60.000 € sind 3.000 € Zinsen, in 5
              Jahren also 15.000 €. Das ist doch viel zu teuer, oder?“
            </p>
            <footer>Frau Sommer, Inhaberin der Bäckerei</footer>
          </blockquote>
          <figure className="sl-foto">
            <img
              src={angebotBild}
              width={1200}
              height={600}
              alt="Auf dem Tisch in der Backstube liegt das Angebot der Bank: Ratendarlehen, 60.000 €, 5 Jahre, 5 % p.a., Tilgung jedes Jahr gleich hoch. Daneben Frau Sommers Zettel: Mein Budget, höchstens 14.500 € pro Jahr."
            />
          </figure>
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
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 1: Der Tilgungsplan für den Ofen',
      pflicht: ['plan', 'entscheidung'],
      bedingung: 'Löse Teil 1 richtig, dann geht es zu Teil 2.',
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Erstelle den Tilgungsplan und beantworte Frau Sommers Frage</p>
            <p>
              Das Ratendarlehen über 60.000 € läuft 5 Jahre zu 5 % p.a., die Tilgung ist jedes Jahr gleich hoch. Lege in deinem Heft den Tilgungsplan an:
              für jedes Jahr die Schuld am Jahresanfang, die Zinsen, die Tilgung und die Annuität, dazu eine Summenzeile. Prüfe, ob das Budget von
              14.500 € in jedem Jahr reicht.
            </p>
          </div>
          <RatenDiagramm modus={planGeloest ? 'plan' : 'leer'} />
          <BeispielMitVideo video={VIDEO_RATENDARLEHEN} videoTitel="Lernvideo: Ratendarlehen und Tilgungsplan">
            <Beispiel offen title="Der Kredit des Friseursalons" aufgabe={BSP1_AUFGABE} steps={BSP1_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('plan')();
                setPlanGeloest(true);
              }}
              punkte={14}
              title="Tilgungsplan für den Ofen"
              prompt={<p>Trage die Ergebnisse aus deinem Tilgungsplan ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 't', label: 'Tilgung pro Jahr:', expected: T, unit: '€' },
                { kind: 'num', key: 'a1', label: 'Annuität im 1. Jahr:', expected: PLAN[0].annuitaet, unit: '€' },
                { kind: 'num', key: 'a2', label: 'Annuität im 2. Jahr:', expected: PLAN[1].annuitaet, unit: '€' },
                { kind: 'num', key: 'a5', label: 'Annuität im 5. Jahr:', expected: PLAN[4].annuitaet, unit: '€' },
                { kind: 'num', key: 'zg', label: 'Zinsen insgesamt:', expected: Z_GES, unit: '€' },
              ]}
              loesungNachFehler
              solution={LOESUNG_PLAN}
              help={
                <Hilfen
                  steps={[
                    <>Beim Ratendarlehen ist die Tilgung jedes Jahr gleich. Die Zinsen gibt es nur auf die Schuld, die am Jahresanfang noch übrig ist.</>,
                    <>
                      Wie beim Friseursalon: erst <M>{'T = \\frac{K_0}{n}'}</M>, dann Jahr für Jahr Zinsen von der Schuld am Jahresanfang, Annuität = Tilgung +
                      Zinsen, neue Schuld = alte Schuld − Tilgung.
                    </>,
                    <>
                      <M>{'T = 60\\,000 : 5'}</M>. 1. Jahr: <M>{'Z_1 = 60\\,000 \\cdot 0{,}05'}</M>. 2. Jahr: <M>{'Z_2 = (60\\,000 - T) \\cdot 0{,}05'}</M>. Für die
                      Zinsen insgesamt addierst du alle 5 Zinsbeträge.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Deine Antwort an Frau Sommer">
            <McCard
              onSolved={fertig.teil('entscheidung')}
              punkte={4}
              rechnen
              title="Reicht das Budget?"
              prompt={<p>Frau Sommer kann pro Jahr höchstens 14.500 € zahlen. Was sagst du ihr?</p>}
              options={[
                {
                  text: (
                    <>
                      Nein, in keinem Jahr: Sie zahlt jedes Jahr <M>{'12\\,000 \\text{ €} + 3\\,000 \\text{ €} = 15\\,000 \\text{ €}'}</M>.
                    </>
                  ),
                  feedback: '3.000 € Zinsen gibt es nur im 1. Jahr. Danach ist die Schuld kleiner, also auch die Zinsen. Schau in deinen Tilgungsplan.',
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
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 2: Direkt ins 10. Jahr',
      pflicht: ['jahr10', 'produkt'],
      inhalt: (fertig) => (
        <>
          <blockquote className="sl-zitat">
            <p>„Und wenn ich die Laufzeit auf 15 Jahre verlängere? Wie viel zahle ich dann zum Beispiel im 10. Jahr?“</p>
            <footer>Frau Sommer</footer>
          </blockquote>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne das 10. Jahr direkt</p>
            <p>
              Ein Tilgungsplan über 15 Jahre dauert lange. Mit den Formeln aus der Merkhilfe berechnest du ein Jahr direkt. Gegeben sind{' '}
              <M>{'K_0 = 60\\,000'}</M> €, <M>{'n = 15'}</M>, <M>{'p = 5\\,\\%'}</M> und das Jahr <M>{'v = 10'}</M>. Gesucht sind die Tilgung, die Schuld zu
              Beginn des 10. Jahres, die Zinsen und die Annuität im 10. Jahr.
            </p>
          </div>
          <BeispielMitVideo video={VIDEO_RATENDARLEHEN} videoTitel="Lernvideo: Ratendarlehen und Tilgungsplan">
            <Beispiel offen title="Ein Jahr direkt berechnen" aufgabe={BSP2_AUFGABE} steps={BSP2_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('jahr10')();
                setJahrGeloest(true);
              }}
              punkte={10}
              title="Das 10. Jahr"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein.</p>}
              fieldsRow
              fields={[
                { kind: 'num', key: 't', label: <M>{'T ='}</M>, expected: T2, unit: '€' },
                { kind: 'num', key: 'k9', label: <M>{'K_9 ='}</M>, expected: K9, unit: '€' },
                { kind: 'num', key: 'z10', label: <M>{'Z_{10} ='}</M>, expected: Z10, unit: '€' },
                { kind: 'num', key: 'a10', label: <M>{'A_{10} ='}</M>, expected: A10, unit: '€' },
              ]}
              loesungNachFehler
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
                      <M>{'T = 60\\,000 : 15 = 4\\,000'}</M>. Es sind noch <M>{'15 - 10 + 1 = 6'}</M> Tilgungen offen: <M>{'Z_{10} = 4\\,000 \\cdot 0{,}05 \\cdot 6'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Handlungsprodukt titel="Tilgungsplan für Frau Sommer">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={heftBild}
                width={800}
                height={400}
                alt="Eine karierte Heftseite mit der Überschrift Tilgungsplan Backofen: links eine Tabelle, rechts ein Balkendiagramm mit fünf sinkenden Balken und einer gestrichelten Budget-Linie bei 14.500 €."
              />
            </figure>
            <p className="sl-text">
              Ergänze deinen Tilgungsplan im Heft um ein Balkendiagramm der Annuitäten mit der Budget-Linie bei 14.500 €. Schreibe darunter eine Antwort an
              Frau Sommer: Reicht ihr Budget, warum sind es nicht 15.000 € Zinsen, und wie viel zahlt sie im 10. Jahr, wenn sie 15 Jahre wählt?
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Liebe Frau Sommer, im 1. Jahr zahlen Sie … €, danach …“</li>
                <li>„Insgesamt zahlen Sie nur … € Zinsen, weil …“</li>
                <li>„Bei 15 Jahren Laufzeit zahlen Sie im 10. Jahr …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Tilgungsplan vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien('an Frau Sommer')} />
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
                    Die <strong>Zinsen</strong> gibt es nur auf die Schuld am Jahresanfang. Diese Schuld wird jedes Jahr um <M>T</M> kleiner, also sinken die
                    Zinsen jedes Jahr um denselben Betrag.
                  </li>
                  <li>
                    Die <strong>Annuität</strong> ist Tilgung plus Zinsen: <M>{'A_v = T + Z_v'}</M>. Beim Ratendarlehen ist sie im 1. Jahr am höchsten und
                    sinkt dann.
                  </li>
                  <li>
                    Die Zinsen insgesamt sind kleiner als <M>{'K_0 \\cdot \\frac{p}{100} \\cdot n'}</M>, weil die Schuld nicht die ganze Zeit gleich hoch ist.
                  </li>
                </ul>
                <p>Formeln aus der Merkhilfe für ein beliebiges Jahr <M>v</M>:</p>
                <MB>{'K_v = T \\cdot (n - v)'}</MB>
                <MB>{'Z_v = T \\cdot (q - 1) \\cdot (n - v + 1)'}</MB>
                <MB>{'A_v = T + Z_v'}</MB>
              </Merke>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      pflicht: ['1', '2', '3'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit drei Aufgaben, die vierte ist für Profis. Wenn du die drei Pflichtaufgaben gelöst hast, wartet unten ein Spiel
            auf dich. Einzelarbeit, ca. 20 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Die erste Annuität">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
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
                  feedback: 'T = 40.000 € : 8 = 5.000 €, Z₁ = 40.000 € · 0,04 = 1.600 €, A₁ = 5.000 € + 1.600 € = 6.600 €.',
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
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
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
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={8}
              topic="Ratendarlehen-Einstieg: Schuld, Zinsen und Annuität im Jahr v (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Für ein Elektro-Lieferauto nimmt ein Getränkehandel ein Ratendarlehen über 50.000 € auf, Laufzeit 10 Jahre, Zinssatz 4,5 % p.a. Berechne
                  die Schuld zu Beginn des 7. Jahres, die Zinsen und die Annuität im 7. Jahr.
                </p>
              }
              fields={[
                { kind: 'num', key: 'k6', label: <M>{'K_6 ='}</M>, expected: 20000, unit: '€' },
                { kind: 'num', key: 'z7', label: <M>{'Z_7 ='}</M>, expected: 900, unit: '€' },
                { kind: 'num', key: 'a7', label: <M>{'A_7 ='}</M>, expected: 5900, unit: '€' },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Tilgung', tex: 'T = \\dfrac{50\\,000 \\text{ €}}{10} = 5\\,000 \\text{ €}' },
                    { titel: 'Schuld zu Beginn des 7. Jahres', tex: 'K_6 = 5\\,000 \\text{ €} \\cdot (10 - 6) = 20\\,000 \\text{ €}' },
                    { titel: 'Zinsen im 7. Jahr', tex: 'Z_7 = 5\\,000 \\text{ €} \\cdot 0{,}045 \\cdot (10 - 7 + 1) = 900 \\text{ €}' },
                    { titel: 'Annuität im 7. Jahr', tex: 'A_7 = 5\\,000 \\text{ €} + 900 \\text{ €} = 5\\,900 \\text{ €}' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Erst die Tilgung, dann die Schuld, die zu Beginn des 7. Jahres noch übrig ist.</>,
                    <>
                      Nach 6 Jahren sind 6 Tilgungen bezahlt: <M>{'K_6 = T \\cdot (n - 6)'}</M>. Dann <M>{'Z_7 = K_6 \\cdot 0{,}045'}</M> und <M>{'A_7 = T + Z_7'}</M>.
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
              profi
              punkte={9}
              level="erweiterung"
              prompt={
                <p>
                  Eine Gärtnerei hat ein Ratendarlehen mit 8 Jahren Laufzeit. Im Kontoauszug steht nur: Annuität im 1. Jahr 5.850 €, davon 1.350 € Zinsen. Wie
                  hoch war das Darlehen, und wie hoch ist der Zinssatz?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'k0', label: <M>{'K_0 ='}</M>, expected: 36000, unit: '€' },
                { kind: 'num', key: 'p', label: <M>{'p ='}</M>, expected: 3.75, unit: '%' },
              ]}
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Tilgung', tex: 'T = 5\\,850 \\text{ €} - 1\\,350 \\text{ €} = 4\\,500 \\text{ €}' },
                    { titel: 'Darlehen', tex: 'K_0 = T \\cdot n = 4\\,500 \\text{ €} \\cdot 8 = 36\\,000 \\text{ €}' },
                    { titel: 'Zinssatz', tex: 'p = \\dfrac{1\\,350 \\text{ €}}{36\\,000 \\text{ €}} \\cdot 100 = 3{,}75\\,\\%' },
                  ]}
                />
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
          <BonusSpiel frei={uebungen.length === 3} titel="Raten-Bäckerei">
            <AuswahlSpiel
              neueRunden={ratenRunden}
              symbol="fa-bread-slice"
              start={<p>In jeder Runde siehst du ein Ratendarlehen und ein Jahr. Nur ein Brotkorb enthält die richtige Annuität für dieses Jahr. Rechne und tippe ihn an.</p>}
              tipp="Tipp: Erst T = K₀ : n, dann die Zinsen auf die Schuld zu Beginn des Jahres (noch n − v + 1 Tilgungen offen), dann A = T + Z."
            />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt einen Tilgungsplan für ein Ratendarlehen aufstellen und ein Jahr direkt mit den Formeln berechnen. Bei den Übungsaufgaben füllst du
              Tilgungspläne mit immer neuen Zahlen aus.
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
    <TaskShell title="Ratendarlehen: Der neue Backofen" width="wide" kompakt parent={{ to: '/finanzmathe/ratendarlehen', label: 'Ratendarlehen' }}>
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        bildwelt={BILDWELT}
        ziel={
          <>
            In dieser Lernsituation hilfst du einer Bäckerei bei der Finanzierung eines neuen Ofens. Du lernst, wie ein Ratendarlehen zurückgezahlt wird, und
            stellst einen Tilgungsplan auf.
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
