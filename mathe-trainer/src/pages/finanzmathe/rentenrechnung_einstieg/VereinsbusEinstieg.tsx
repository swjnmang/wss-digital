import { useState, type ReactNode } from 'react';
import TaskShell from '../../../components/layout/TaskShell';
import { Beispiel, M, MB, Merke } from '../../daten_und_zufall/lernpfad/kit';
import {
  CheckCard,
  Hilfen,
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
import './rentenrechnung.css';

// Lernsituation Rentenrechnung „Der Vereinsbus“: Endwert regelmäßiger Einzahlungen, vorschüssig und nachschüssig (ca. 60 bis 90 min).
// Format Schätzen & Fermi: Die SuS schätzen den Kontostand eines Sparplans, prüfen zwei der sechs Raten mit der Zinseszinsformel
// (Vorwissen) und merken, dass Rate für Rate zu mühsam wird. Danach präzisieren sie mit der Rentenformel.
// Lernprodukt analog: Aushang für die Mitgliederversammlung (Zeitstrahl, Rechnung, Empfehlung) im Heft.
// Instruktionsreihenfolge im ruhigen Grunddesign: Aufgabe → Rechenbeispiel (Tischtennisabteilung, andere Zahlen) → eigene Rechnung.
// Aha: Der Vorstand rechnet mit 30.000 € plus rund 900 € Zinsen. Allein die erste Rate bringt schon 970,26 € Zinsen, insgesamt
// sind es 3.312,31 €. Am Jahresanfang eingezahlt reicht es für den Bus (33.312,31 €), am Jahresende nicht (32.342,05 €).
// Identität: Themenfarbe Schiefer, Symbol Kleinbus, Titelbild Vereinsheim mit Kleinbus, Leitobjekt der Raten-Zeitstrahl
// (wie lange jede Rate verzinst wird). Die Festlegung bleibt nur im Seitenzustand.

/* ── Situation ───────────────────────────────────────────────────────────── */

// 6 Raten zu 5.000 €, 3 % p.a., Bus 33.000 €.
// Faktor (1,03^6 − 1) / 0,03 = 6,4684 → nachschüssig 32.342,05 €, vorschüssig 33.312,31 €.
const R = 5000;
const N = 6;
const P = 3;
const Q = 1 + P / 100;
const BUS = 33000;
const FAKTOR = (Q ** N - 1) / (Q - 1);
const KN_NACH = R * FAKTOR;
const KN_VOR = R * Q * FAKTOR;
const RATE1 = R * Q ** N;
const RATE6 = R * Q;

type Wahl = 'reicht' | 'knapp' | 'nicht';
const WAHL: Record<Wahl, string> = {
  nicht: 'Es reicht nicht für den Bus, der Vorstand hat recht.',
  knapp: 'Es fehlt nur noch wenig.',
  reicht: 'Es reicht für den Bus.',
};

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: das Vereinsheim am Sportplatz, davor der Elektro-Kleinbus mit Preisschild und die sechs Raten als Münzstapel */
function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Ein Vereinsheim mit Fahne am Sportplatz, davor ein Kleinbus mit Preisschild 33.000 Euro. Links sechs gleich hohe Münzstapel für sechs Einzahlungen."
    >
      <rect x="0" y="206" width="720" height="46" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="206" y2="206" stroke="var(--ink)" strokeWidth="2" />
      {/* Sechs Raten */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          {[0, 1, 2].map((k) => (
            <ellipse
              key={k}
              cx={40 + i * 42}
              cy={194 - k * 12}
              rx="17"
              ry="6"
              fill="var(--highlight)"
              stroke="var(--ink)"
              strokeWidth="1.5"
            />
          ))}
        </g>
      ))}
      <text x="145" y="150" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--ink)">
        6 × 5.000 €
      </text>
      {/* Vereinsheim */}
      <rect x="300" y="96" width="190" height="110" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <polygon points="288,98 395,46 502,98" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="330" y="124" width="40" height="34" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="420" y="124" width="40" height="34" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="378" y="150" width="34" height="56" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <line x1="470" x2="470" y1="20" y2="70" stroke="var(--ink)" strokeWidth="3" />
      <polygon points="470,20 506,30 470,40" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
      {/* Kleinbus */}
      <path
        d="M512 196 L512 120 Q512 108 524 108 L640 108 Q660 108 670 126 L692 160 Q698 168 698 178 L698 196 Z"
        fill="var(--primary)"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      {[528, 566, 604].map((x) => (
        <rect key={x} x={x} y="120" width="30" height="30" rx="4" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      ))}
      <path d="M642 120 L660 120 L680 152 L642 152 Z" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="548" cy="198" r="18" fill="var(--ink)" />
      <circle cx="548" cy="198" r="7" fill="var(--surface)" />
      <circle cx="664" cy="198" r="18" fill="var(--ink)" />
      <circle cx="664" cy="198" r="7" fill="var(--surface)" />
      <path d="M594 166 l-8 14 h8 l-6 12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Preisschild */}
      <line x1="610" x2="610" y1="108" y2="78" stroke="var(--ink)" strokeWidth="2" />
      <rect x="560" y="48" width="104" height="32" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <text x="612" y="70" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--ink)">
        33.000 €
      </text>
    </svg>
  );
}

const THEMA: Thema = {
  name: 'Der Vereinsbus',
  farbe: 'schiefer',
  icon: 'fa-van-shuttle',
  bild: <Titelbild />,
};

/* ── Leitobjekt: der Raten-Zeitstrahl ───────────────────────────────────── */

type Termin = 'vor' | 'nach';
const ZX0 = 70;
const ZX1 = 650;

/**
 * Zeitstrahl eines Sparplans: n gleiche Raten am Jahresanfang (vor) oder am Jahresende (nach). Darunter für jede Rate ein Balken
 * bis zum Ende des letzten Jahres: so lange wird sie verzinst. werte: Rate i zeigt ihren Wert am Ende (nur das, was schon gerechnet ist).
 */
function Zeitstrahl({
  n = N,
  r = R,
  q = Q,
  termin,
  ende,
  werte = [],
}: {
  n?: number;
  r?: number;
  q?: number;
  termin: Termin;
  ende: string;
  werte?: number[];
}) {
  const x = (t: number) => ZX0 + (t * (ZX1 - ZX0)) / n;
  const yA = 112;
  const zeile = (i: number) => 150 + i * 28;
  const hoehe = zeile(n) + 6;
  const raten = Array.from({ length: n }, (_, i) => {
    const t = termin === 'vor' ? i : i + 1;
    return { i, t, jahre: n - t };
  });
  return (
    <svg
      viewBox={`0 0 720 ${hoehe}`}
      role="img"
      aria-label={`Zeitstrahl über ${n} Jahre. ${n} Einzahlungen von je ${euro(r)} am ${
        termin === 'vor' ? 'Anfang' : 'Ende'
      } jedes Jahres. Die erste Rate wird ${raten[0].jahre} Jahre verzinst, die letzte ${raten[n - 1].jahre} ${
        raten[n - 1].jahre === 1 ? 'Jahr' : 'Jahre'
      }.`}
    >
      <text x={ZX1 + 8} y="22" textAnchor="end" fontSize="16" fontWeight="700" fill="var(--ink)">
        {ende}
      </text>
      {/* Raten als Münzstapel */}
      {raten.map(({ i, t }) => (
        <g key={i}>
          {[0, 1, 2].map((k) => (
            <ellipse
              key={k}
              cx={x(t)}
              cy={yA - 10 - k * 9}
              rx="20"
              ry="6"
              fill="var(--highlight)"
              stroke="var(--ink)"
              strokeWidth="1.5"
            />
          ))}
          <text x={x(t)} y={yA - 42} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink)">
            {r.toLocaleString('de-DE')} €
          </text>
        </g>
      ))}
      {/* Achse mit Jahren */}
      <line x1={ZX0 - 20} x2={ZX1 + 20} y1={yA} y2={yA} stroke="var(--ink)" strokeWidth="2" />
      <polygon points={`${ZX1 + 28},${yA} ${ZX1 + 16},${yA - 6} ${ZX1 + 16},${yA + 6}`} fill="var(--ink)" />
      {Array.from({ length: n + 1 }, (_, t) => (
        <line key={t} x1={x(t)} x2={x(t)} y1={yA - 6} y2={yA + 6} stroke="var(--ink)" strokeWidth="2" />
      ))}
      {Array.from({ length: n }, (_, k) => (
        <text key={k} x={(x(k) + x(k + 1)) / 2} y={yA + 22} textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
          Jahr {k + 1}
        </text>
      ))}
      {/* Wie lange jede Rate verzinst wird */}
      {raten.map(({ i, t, jahre }) => {
        const y = zeile(i);
        const wert = werte.includes(i) ? `: ${euro(r * q ** jahre)}` : '';
        const text = jahre === 0 ? `keine Zinsen${wert}` : `${jahre} ${jahre === 1 ? 'Jahr' : 'Jahre'} verzinst${wert}`;
        const breite = x(n) - x(t);
        const passt = breite >= text.length * 8.6 + 20;
        return (
          <g key={i}>
            {jahre > 0 ? (
              <rect x={x(t)} y={y} width={breite} height="22" rx="6" fill="var(--primary)" />
            ) : (
              <circle cx={x(t)} cy={y + 11} r="6" fill="var(--primary)" />
            )}
            <text
              x={passt ? x(t) + 10 : x(t) - 12}
              y={y + 16}
              textAnchor={passt ? 'start' : 'end'}
              fontSize="15"
              fontWeight="700"
              fill={passt ? '#fff' : 'var(--ink)'}
            >
              {i + 1}. Rate: {text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Zeitstrahl mit Umschalter Jahresanfang / Jahresende (Problem lösen) */
function ZeitstrahlUmschalten({ werte }: { werte?: number[] }) {
  const [termin, setTermin] = useState<Termin>('vor');
  return (
    <div className="zk-bild rr-zeitstrahl">
      <div className="rr-umschalten" role="group" aria-label="Wann wird eingezahlt?">
        <span>Einzahlung am</span>
        <button
          type="button"
          className={`bk-btn bk-btn-sm${termin === 'vor' ? ' bk-btn-primary' : ''}`}
          aria-pressed={termin === 'vor'}
          onClick={() => setTermin('vor')}
        >
          Jahresanfang
        </button>
        <button
          type="button"
          className={`bk-btn bk-btn-sm${termin === 'nach' ? ' bk-btn-primary' : ''}`}
          aria-pressed={termin === 'nach'}
          onClick={() => setTermin('nach')}
        >
          Jahresende
        </button>
      </div>
      <Zeitstrahl termin={termin} ende="Ende Jahr 6: Bus kaufen" werte={termin === 'vor' ? werte : []} />
    </div>
  );
}

/** Handlungsprodukt: Aushang an der Pinnwand des Vereinsheims */
function AushangBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Ein Aushang an der Pinnwand mit der Überschrift: Reicht es für den Vereinsbus? Darauf ein kleiner Zeitstrahl mit sechs Münzstapeln, eine Rechnung und eine Empfehlung."
      >
        <rect x="150" y="6" width="420" height="178" rx="10" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="186" y="18" width="348" height="160" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <circle cx="360" cy="18" r="8" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        <text x="360" y="52" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
          Reicht es für den Vereinsbus?
        </text>
        <line x1="214" x2="506" y1="96" y2="96" stroke="var(--ink)" strokeWidth="2" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx={222 + i * 44} cy="86" rx="12" ry="5" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
        ))}
        <text x="214" y="126" fontSize="17" fill="var(--ink)">
          <tspan fontStyle="italic">Unsere Rechnung:</tspan> …
        </text>
        <text x="214" y="156" fontSize="17" fill="var(--ink)">
          <tspan fontStyle="italic">Unsere Empfehlung:</tspan> …
        </text>
      </svg>
    </div>
  );
}

/* ── Rechenbeispiel: Tischtennisabteilung ───────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Die Tischtennisabteilung des Nachbarvereins zahlt 4 Jahre lang jedes Jahr <strong>am Jahresende</strong>{' '}
    <strong>2.000 €</strong> auf einen Sparplan mit 2 % p.a. ein. Wie viel Geld ist am Ende des 4. Jahres auf dem Konto? Und wie viel
    wäre es, wenn sie immer <strong>am Jahresanfang</strong> einzahlen würde?
  </p>
);
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Zinsfaktor bestimmen',
    body: <MB>{'q = 1 + \\frac{p}{100} = 1 + \\frac{2}{100} = 1{,}02'}</MB>,
  },
  {
    title: 'Am Jahresende (nachschüssig): alle Raten zusammenzählen',
    body: (
      <>
        <div className="zk-bild">
          <Zeitstrahl n={4} r={2000} q={1.02} termin="nach" ende="Ende Jahr 4" werte={[0, 1, 2, 3]} />
        </div>
        <p>
          Die erste Rate wird 3 Jahre verzinst, die letzte gar nicht. Der Kontostand ist die Summe aller Raten mit ihren Zinseszinsen:
        </p>
        <MB>{'K_4 = 2\\,000 \\cdot 1{,}02^3 + 2\\,000 \\cdot 1{,}02^2 + 2\\,000 \\cdot 1{,}02 + 2\\,000'}</MB>
        <p>
          Diese Summe fasst die <strong>Rentenformel</strong> in einem Schritt zusammen (<M>r</M> = Rate, <M>n</M> = Anzahl der Jahre):
        </p>
        <MB>
          {
            'K_n = r \\cdot \\frac{q^n - 1}{q - 1} = 2\\,000 \\cdot \\frac{1{,}02^4 - 1}{1{,}02 - 1} = 2\\,000 \\cdot 4{,}121608 = 8\\,243{,}22 \\text{ €}'
          }
        </MB>
      </>
    ),
  },
  {
    title: 'Am Jahresanfang (vorschüssig): jede Rate ein Jahr länger',
    body: (
      <>
        <p>
          Wird am Jahresanfang eingezahlt, liegt jede Rate ein Jahr länger auf dem Konto. Jede Rate bekommt also einmal mehr den Faktor{' '}
          <M>q</M>:
        </p>
        <MB>
          {
            'K_n = r \\cdot q \\cdot \\frac{q^n - 1}{q - 1} = 2\\,000 \\cdot 1{,}02 \\cdot \\frac{1{,}02^4 - 1}{1{,}02 - 1} = 8\\,408{,}08 \\text{ €}'
          }
        </MB>
        <p>Am Jahresende eingezahlt sind es 8.243,22 €, am Jahresanfang eingezahlt 8.408,08 €.</p>
      </>
    ),
  },
];

/** Lösungsweg für den Vereinsbus (für beide Wege: selbst rechnen und Lösungsschema) */
const LOESUNG = (
  <>
    <MB>{'q = 1 + \\frac{3}{100} = 1{,}03 \\qquad \\frac{1{,}03^6 - 1}{1{,}03 - 1} = 6{,}468410'}</MB>
    <MB>{'\\text{Jahresende: } K_6 = 5\\,000 \\cdot 6{,}468410 = 32\\,342{,}05 \\text{ €}'}</MB>
    <MB>{'\\text{Jahresanfang: } K_6 = 5\\,000 \\cdot 1{,}03 \\cdot 6{,}468410 = 33\\,312{,}31 \\text{ €}'}</MB>
    <p>
      Am Jahresanfang eingezahlt reicht es für den Bus (33.000 €). Am Jahresende eingezahlt fehlen 657,95 €.
    </p>
  </>
);

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function VereinsbusEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 31000, fest: false });
  const [raten, setRaten] = useState<number[]>([]);
  const [geloest, setGeloest] = useState(false);
  const rateGeprueft = (i: number) => () => setRaten((r) => (r.includes(i) ? r : [...r, i]));

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
            title="a) Zinsfaktor"
            rechnen={false}
            prompt={<p>Wie heißt der Zinsfaktor <M>q</M> zu diesen Zinssätzen?</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'q3', label: <M>{'p = 3\\,\\%\\colon\\ q ='}</M>, expected: 1.03, tol: 0.0001 },
              { kind: 'num', key: 'q25', label: <M>{'p = 2{,}5\\,\\%\\colon\\ q ='}</M>, expected: 1.025, tol: 0.0001 },
            ]}
            solution={<MB>{'q = 1 + \\frac{3}{100} = 1{,}03 \\qquad q = 1 + \\frac{2{,}5}{100} = 1{,}025'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            title="b) Zinseszins"
            prompt={
              <p>
                2.000 € liegen 4 Jahre lang auf einem Konto mit 3 % p.a. Die Zinsen werden mitverzinst. Wie hoch ist der Kontostand nach 4
                Jahren?
              </p>
            }
            fields={[{ kind: 'num', key: 'k', label: <M>{'K_4 ='}</M>, expected: 2000 * 1.03 ** 4, unit: '€', tol: 0.02 }]}
            solution={<MB>{'K_4 = K_0 \\cdot q^n = 2\\,000 \\cdot 1{,}03^4 = 2\\,251{,}02 \\text{ €}'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            title="c) Wie lange liegt das Geld?"
            rechnen={false}
            prompt={
              <p>
                Ein Konto wird am 31.12.2029 aufgelöst. Wie viele volle Jahre wird Geld verzinst, das am 01.01.2027 eingezahlt wurde? Und Geld,
                das erst am 31.12.2027 eingezahlt wurde?
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'a', label: 'ab 01.01.2027:', expected: 3, unit: 'Jahre' },
              { kind: 'num', key: 'b', label: 'ab 31.12.2027:', expected: 2, unit: 'Jahre' },
            ]}
            solution={
              <p>
                Vom 01.01.2027 bis zum 31.12.2029 sind es die drei Jahre 2027, 2028 und 2029. Geld vom 31.12.2027 bekommt erst ab 2028 Zinsen,
                also nur 2 Jahre.
              </p>
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            title="d) Potenz mit dem Taschenrechner"
            prompt={<p>Berechne mit dem Taschenrechner und runde auf 4 Nachkommastellen.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'p6', label: <M>{'1{,}03^6 \\approx'}</M>, expected: 1.03 ** 6, tol: 0.0001 },
              { kind: 'num', key: 'p10', label: <M>{'1{,}02^{10} \\approx'}</M>, expected: 1.02 ** 10, tol: 0.0001 },
            ]}
            solution={
              <>
                <MB>{'1{,}03^6 \\approx 1{,}1941 \\qquad 1{,}02^{10} \\approx 1{,}2190'}</MB>
                <p>Am Taschenrechner: Basis eingeben, dann die Potenztaste (z. B. ^ oder xʸ), dann den Exponenten.</p>
              </>
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            title="e) Bruch mit Klammern"
            prompt={
              <p>
                Berechne mit dem Taschenrechner. Achte darauf, Zähler und Nenner jeweils in Klammern einzugeben.
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'b1', label: <M>{'\\dfrac{1{,}2 - 1}{1{,}04 - 1} ='}</M>, expected: 5 },
              { kind: 'num', key: 'b2', label: <M>{'\\dfrac{1{,}5^2 - 1}{1{,}5 - 1} ='}</M>, expected: 2.5 },
            ]}
            solution={
              <MB>{'\\frac{1{,}2 - 1}{1{,}04 - 1} = \\frac{0{,}2}{0{,}04} = 5 \\qquad \\frac{1{,}5^2 - 1}{1{,}5 - 1} = \\frac{2{,}25 - 1}{0{,}5} = \\frac{1{,}25}{0{,}5} = 2{,}5'}</MB>
            }
            help={
              <Hilfen
                steps={[
                  <>Der Bruchstrich wirkt wie eine Klammer um Zähler und Nenner.</>,
                  <>Rechne zuerst den Zähler aus, dann den Nenner, und teile danach.</>,
                  <>
                    <M>{'1{,}2 - 1 = 0{,}2'}</M> und <M>{'1{,}04 - 1 = 0{,}04'}</M>, also <M>{'0{,}2 : 0{,}04'}</M>.
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
      titel: 'Reicht es für den Vereinsbus?',
      pflicht: ['fest', 'r1', 'r6'],
      bedingung: 'Halte deine Schätzung fest und prüfe die erste und die letzte Rate, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du bist Jugendsprecherin oder Jugendsprecher im Sportverein. Die Jugendmannschaften fahren jedes Wochenende zu Auswärtsspielen,
            bisher mit vielen einzelnen Elterntaxis. In 6 Jahren möchte der Verein einen gebrauchten Elektro-Kleinbus mit 9 Sitzen kaufen. Er
            kostet etwa 33.000 €.
          </p>
          <p className="sl-text">
            Dafür zahlt der Verein 6 Jahre lang jedes Jahr <strong>am Jahresanfang 5.000 €</strong> auf einen Sparplan mit <strong>3 % p.a.</strong> ein. Die Zinsen bleiben auf dem Konto und werden mitverzinst. Gesucht ist der Kontostand am Ende des
            6. Jahres.
          </p>
          <Zitat wer="Der Vorstand in der Sitzung">
            <p>
              „<M>{'6 \\cdot 5\\,000'}</M> € sind 30.000 €. Dazu kommen vielleicht 3 % Zinsen, also rund 900 €. Das reicht nie für den Bus,
              wir brauchen einen Kredit.“
            </p>
          </Zitat>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst schätzen, dann zwei Raten prüfen</p>
            <p>
              Wie viel Geld ist am Ende des 6. Jahres auf dem Konto? Reicht es für den Bus? Lege dich zuerst fest, ohne zu rechnen. Prüfe
              danach, was aus der ersten und aus der letzten Rate wird.
            </p>
          </div>
          <div className="zk-bild">
            <Zeitstrahl termin="vor" ende="Ende Jahr 6: Bus kaufen" werte={raten} />
          </div>
          <Vermutung
            optionen={WAHL}
            regler={{
              min: 30000,
              max: 36000,
              step: 100,
              text: (v) => (
                <>
                  Am Ende des 6. Jahres sind etwa <span className="ls-slider-value">{v.toLocaleString('de-DE')} €</span> auf dem Konto.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig.teil('fest')}
            gespeichert={(w) => (
              <>
                Deine Schätzung: <strong>{w.wert.toLocaleString('de-DE')} €</strong>. <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong>
              </>
            )}
          />
          {fest.fest && (
            <Abschnitt titel="Prüfe zwei der sechs Raten">
              <p className="sl-text">
                Jede Rate wächst mit Zinseszins bis zum Ende des 6. Jahres. Das kannst du schon berechnen. Im Zeitstrahl siehst du, wie
                lange jede Rate verzinst wird.
              </p>
              <CheckCard
                onSolved={() => {
                  fertig.teil('r1')();
                  rateGeprueft(0)();
                }}
                title="Die 1. Rate"
                prompt={<p>Wie viel sind die 5.000 € vom Anfang des 1. Jahres am Ende des 6. Jahres wert?</p>}
                fields={[{ kind: 'num', key: 'k', label: '1. Rate am Ende:', expected: RATE1, unit: '€', tol: 0.02 }]}
                solution={<MB>{'K_6 = 5\\,000 \\cdot 1{,}03^6 = 5\\,970{,}26 \\text{ €}'}</MB>}
                help={
                  <Hilfen
                    steps={[
                      <>Die 1. Rate liegt vom Anfang des 1. Jahres bis zum Ende des 6. Jahres auf dem Konto. Wie viele Jahre sind das?</>,
                      <>Es sind 6 Jahre. Nutze die Zinseszinsformel aus dem Warm-up.</>,
                      <>
                        <M>{'K_6 = 5\\,000 \\cdot 1{,}03^6'}</M>
                      </>,
                    ]}
                  />
                }
              />
              <CheckCard
                onSolved={() => {
                  fertig.teil('r6')();
                  rateGeprueft(5)();
                }}
                title="Die 6. Rate"
                prompt={<p>Wie viel sind die 5.000 € vom Anfang des 6. Jahres am Ende des 6. Jahres wert?</p>}
                fields={[{ kind: 'num', key: 'k', label: '6. Rate am Ende:', expected: RATE6, unit: '€', tol: 0.02 }]}
                solution={<MB>{'K_1 = 5\\,000 \\cdot 1{,}03^1 = 5\\,150{,}00 \\text{ €}'}</MB>}
                help={
                  <Hilfen
                    steps={[
                      <>Die 6. Rate kommt erst am Anfang des letzten Jahres auf das Konto. Wie lange wird sie verzinst?</>,
                      <>Nur 1 Jahr. Setze <M>{'n = 1'}</M> in die Zinseszinsformel ein.</>,
                      <>
                        <M>{'K_1 = 5\\,000 \\cdot 1{,}03'}</M>
                      </>,
                    ]}
                  />
                }
              />
              {raten.length === 2 && (
                <p className="rr-erkenntnis ls-back">
                  <strong>Schon gemerkt?</strong> Allein die 1. Rate bringt {euro(RATE1 - R)} Zinsen, mehr als die 900 €, mit denen der
                  Vorstand für alle sechs Raten rechnet. Für den ganzen Kontostand müsstest du jetzt noch die anderen vier Raten einzeln
                  berechnen und alles addieren. Bei einem Sparplan über 30 Jahre wären das 30 Rechnungen. Gleich lernst du eine Formel, die
                  alle Raten auf einmal zusammenzählt.
                </p>
              )}
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Der Kontostand für den Vereinsbus',
      pflicht: ['rechnung', 'empfehlung', 'produkt'],
      inhalt: (fertig) => {
        const geloestMelden = () => {
          fertig.teil('rechnung')();
          setGeloest(true);
        };
        return (
          <>
            <div className="sl-fokus">
              <p className="sl-fokus-titel">Deine Aufgabe: Berechne den Kontostand und berate den Vorstand</p>
              <p>
                Der Verein zahlt 6 Jahre lang jedes Jahr 5.000 € auf den Sparplan mit 3 % p.a. ein. Der Kassenwart möchte lieber erst am
                Jahresende einzahlen, wenn alle Mitgliedsbeiträge da sind. Berechne den Kontostand am Ende des 6. Jahres für beide Fälle:
                Einzahlung am <strong>Jahresanfang</strong> (vorschüssig) und am <strong>Jahresende</strong> (nachschüssig). Reicht es für
                den Bus mit 33.000 €?
              </p>
            </div>
            <ZeitstrahlUmschalten werte={raten} />
            <Aufklappbar label="Rechenbeispiel ansehen">
              <Beispiel offen title="Der Sparplan der Tischtennisabteilung" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
            </Aufklappbar>
            <Handlungsprodukt titel="Aushang für die Mitgliederversammlung">
              <AushangBild />
              <p className="sl-text">
                Gestalte in deinem Heft einen Aushang für die Pinnwand im Vereinsheim. Zeichne den Zeitstrahl der sechs Raten, rechne den
                Kontostand für beide Einzahlungstermine vor und gib dem Vorstand eine klare Empfehlung. Trage deine Ergebnisse danach unten
                ein und prüfe sie.
              </p>
              <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
                <ul className="zk-liste">
                  <li>„Reicht es für den Vereinsbus? Ja, wenn …“</li>
                  <li>„Die 1. Rate wird … Jahre verzinst, die letzte nur …“</li>
                  <li>„Zahlen wir am Jahresanfang ein, haben wir am Ende …, am Jahresende nur …“</li>
                  <li>„Der Vorstand hat nur mit 900 € Zinsen gerechnet. In Wirklichkeit sind es …, weil …“</li>
                  <li>
                    „Abkürzungen: <M>{'K_n'}</M> = …, <M>r</M> = Rate (Rente), <M>q</M> = …, <M>n</M> = … Vorschüssig heißt …“
                  </li>
                </ul>
              </Aufklappbar>
            </Handlungsprodukt>
            <Abschnitt titel="Deine Ergebnisse prüfen">
              <WegWahl
                selbst={
                  <CheckCard
                    onSolved={geloestMelden}
                    title="Kontostand am Ende des 6. Jahres"
                    prompt={<p>Trage die Ergebnisse aus deinem Heft ein und prüfe sie.</p>}
                    fields={[
                      { kind: 'num', key: 'vor', label: 'Wie viel Geld ist am Ende des 6. Jahres auf dem Konto, wenn die Sparrate immer am Jahresanfang eingezahlt wird?', expected: KN_VOR, unit: '€', tol: 0.5 },
                      { kind: 'num', key: 'nach', label: 'Wie hoch wäre der Kontostand, wenn die Einzahlung immer am Jahresende stattfindet?', expected: KN_NACH, unit: '€', tol: 0.5 },
                    ]}
                    loesungNachFehler
                    solution={LOESUNG}
                    help={
                      <Hilfen
                        steps={[
                          <>Rechne wie im Beispiel der Tischtennisabteilung: erst den Zinsfaktor, dann die Rentenformel.</>,
                          <>
                            Am Jahresende gilt <M>{'K_n = r \\cdot \\frac{q^n - 1}{q - 1}'}</M>. Am Jahresanfang kommt noch einmal der Faktor{' '}
                            <M>q</M> dazu.
                          </>,
                          <>
                            Jahresende: <M>{'K_6 = 5\\,000 \\cdot \\frac{1{,}03^6 - 1}{1{,}03 - 1}'}</M>. Jahresanfang:{' '}
                            <M>{'K_6 = 5\\,000 \\cdot 1{,}03 \\cdot \\frac{1{,}03^6 - 1}{1{,}03 - 1}'}</M>.
                          </>,
                        ]}
                      />
                    }
                  />
                }
                schema={
                  <CheckCard
                    onSolved={geloestMelden}
                    title="Kontostand mit Lösungsschema"
                    prompt={<p>Rechne in deinem Heft nach diesem Schema wie im Beispiel und trage die Ergebnisse ein.</p>}
                    rechnung={[
                      { l: ['q'], r: ['1 + \\frac{p}{100} =', { luecke: 'q' }], u: '\\text{① Zinsfaktor}' },
                      {
                        l: ['\\frac{q^6 - 1}{q - 1}'],
                        r: [{ luecke: 'f', breit: true }],
                        u: '\\text{② Bruch}',
                      },
                      {
                        l: ['K_6'],
                        r: ['r \\cdot \\frac{q^6 - 1}{q - 1} =', { luecke: 'nach', breit: true }, '\\text{ €}'],
                        u: '\\text{③ Jahresende}',
                      },
                      {
                        l: ['K_6'],
                        r: ['r \\cdot q \\cdot \\frac{q^6 - 1}{q - 1} =', { luecke: 'vor', breit: true }, '\\text{ €}'],
                        u: '\\text{④ Jahresanfang}',
                      },
                    ]}
                    fields={[
                      { kind: 'num', key: 'q', label: 'Zinsfaktor', expected: Q, tol: 0.0001 },
                      { kind: 'num', key: 'f', label: 'Bruch', expected: FAKTOR, tol: 0.0005 },
                      { kind: 'num', key: 'nach', label: 'Kontostand Jahresende', expected: KN_NACH, tol: 0.5 },
                      { kind: 'num', key: 'vor', label: 'Kontostand Jahresanfang', expected: KN_VOR, tol: 0.5 },
                    ]}
                    loesungNachFehler
                    solution={LOESUNG}
                    help={
                      <SchrittHilfen
                        schritte={[
                          {
                            kurz: '①',
                            titel: 'Zinsfaktor',
                            hilfe: (
                              <>
                                Setze <M>{'p = 3'}</M> ein: <M>{'q = 1 + \\frac{3}{100}'}</M>.
                              </>
                            ),
                          },
                          {
                            kurz: '②',
                            titel: 'Bruch',
                            hilfe: (
                              <>
                                Rechne zuerst <M>{'1{,}03^6'}</M> mit dem Taschenrechner, ziehe 1 ab und teile durch <M>{'1{,}03 - 1 = 0{,}03'}</M>.
                                Runde auf 4 Nachkommastellen.
                              </>
                            ),
                          },
                          {
                            kurz: '③',
                            titel: 'Jahresende',
                            hilfe: (
                              <>
                                Multipliziere die Rate <M>{'r = 5\\,000'}</M> mit dem Bruch aus ②.
                              </>
                            ),
                          },
                          {
                            kurz: '④',
                            titel: 'Jahresanfang',
                            hilfe: (
                              <>
                                Jede Rate liegt ein Jahr länger auf dem Konto. Multipliziere das Ergebnis aus ③ noch mit <M>{'q = 1{,}03'}</M>.
                              </>
                            ),
                          },
                        ]}
                      />
                    }
                  />
                }
              />
            </Abschnitt>
            <Abschnitt titel="Deine Empfehlung">
              <McCard
                onSolved={fertig.teil('empfehlung')}
                title="Empfehlung an den Vorstand"
                prompt={<p>Welche Empfehlung gibst du dem Vorstand?</p>}
                options={[
                  {
                    text: 'Einen Kredit aufnehmen: 30.000 € plus etwa 900 € Zinsen reichen nicht für den Bus.',
                    feedback:
                      'Die 900 € sind viel zu wenig. Jede Rate wird mit Zinseszins verzinst, die erste sogar 6 Jahre lang. Zusammen sind es mehr als 3.000 € Zinsen.',
                  },
                  {
                    text: 'Am Jahresende einzahlen, wie der Kassenwart möchte: Es reicht trotzdem.',
                    feedback: 'Vergleiche mit deinem Ergebnis: Am Jahresende eingezahlt sind es nur 32.342,05 €. Das ist weniger als 33.000 €.',
                  },
                  {
                    text: 'Es ist egal, wann eingezahlt wird. Es sind ja immer dieselben 6 Raten.',
                    feedback:
                      'Die Raten sind gleich, aber am Jahresanfang liegt jede Rate ein Jahr länger auf dem Konto. Das macht fast 1.000 € Unterschied.',
                  },
                  {
                    text: 'Am Jahresanfang einzahlen: Dann sind es 33.312,31 € und es reicht für den Bus. Am Jahresende wären es nur 32.342,05 €.',
                    correct: true,
                    feedback: 'Weil jede Rate ein Jahr länger verzinst wird, reicht es nur bei der Einzahlung am Jahresanfang.',
                  },
                ]}
              />
            </Abschnitt>
            <Abschnitt titel="Ist dein Aushang vollständig?">
              <Kriterien
                onAlle={fertig.teil('produkt')}
                items={[
                  'Ein Zeitstrahl mit allen 6 Raten und wie lange jede verzinst wird',
                  'Die Rechnung mit der Rentenformel für den Jahresanfang und das Jahresende',
                  'Eine klare Empfehlung: Wann soll der Verein einzahlen?',
                  'Eine Erklärung, warum die Rechnung des Vorstands (30.900 €) zu niedrig ist',
                  <>
                    Unter deinem Aushang steht, wofür die Abkürzungen der Formel stehen: <M>{'K_n'}</M> (Endwert, Kontostand nach{' '}
                    <M>n</M> Jahren), <M>r</M> (Rate, auch Rente genannt), <M>q</M> (Zinsfaktor), <M>p</M> (Zinssatz) und <M>n</M> (Anzahl
                    der Jahre). Außerdem erklärst du die Begriffe vorschüssig und nachschüssig und alle anderen Wörter, die für dich neu
                    waren.
                  </>,
                ]}
              />
            </Abschnitt>
            {geloest && (
              <Abschnitt titel="Das hältst du fest">
                <Rueckbezug fest={fest} />
                <Merke title="Endwert regelmäßiger Einzahlungen (Rentenrechnung)">
                  <p>Einzahlung am Jahresende (nachschüssig):</p>
                  <MB>{'K_n = r \\cdot \\frac{q^n - 1}{q - 1}'}</MB>
                  <p>Einzahlung am Jahresanfang (vorschüssig):</p>
                  <MB>{'K_n = r \\cdot q \\cdot \\frac{q^n - 1}{q - 1}'}</MB>
                  <ul>
                    <li>
                      <M>r</M> = jährliche Rate in €, <M>{'q = 1 + \\frac{p}{100}'}</M> = Zinsfaktor, <M>n</M> = Anzahl der Jahre,{' '}
                      <M>{'K_n'}</M> = Kontostand (Endwert) nach <M>n</M> Jahren
                    </li>
                    <li>Die Formel zählt alle Raten mit ihren Zinseszinsen auf einmal zusammen.</li>
                    <li>
                      Am Jahresanfang eingezahlt liegt jede Rate ein Jahr länger auf dem Konto, deshalb kommt der Faktor <M>q</M> dazu.
                    </li>
                    <li>
                      Die Zinsen insgesamt sind der Endwert minus alle Einzahlungen: <M>{'K_n - n \\cdot r'}</M>.
                    </li>
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
          <p className="sl-text">Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die letzte ist für Profis.</p>
          <Abschnitt titel="Übung 1: Wie viel ist auf dem Konto?">
            <TrackedMc
              onSolved={fertig.teil('1')}
              topic="Rentenrechnung-Einstieg: Endwert nachschüssig (Basis)"
              title="Übung 1"
              rechnen
              level="basis"
              prompt={
                <p>
                  Jemand zahlt 10 Jahre lang jedes Jahr am Jahresende 1.200 € auf ein Sparkonto mit 2 % p.a. ein. Wie hoch ist der Kontostand
                  nach 10 Jahren?
                </p>
              }
              options={[
                {
                  text: '12.000,00 €',
                  feedback: 'Das sind nur die Einzahlungen ohne Zinsen: 10 · 1.200 €. Die Raten werden aber verzinst.',
                },
                {
                  text: '13.402,46 €',
                  feedback:
                    <>So viel wäre es bei Einzahlung am Jahresanfang. Am Jahresende eingezahlt fehlt der zusätzliche Faktor <M>q</M>.</>,
                },
                {
                  text: '13.139,67 €',
                  correct: true,
                  feedback: <M>{'K_{10} = 1\\,200 \\cdot \\frac{1{,}02^{10} - 1}{1{,}02 - 1} = 13\\,139{,}67 \\text{ €}'}</M>,
                },
                {
                  text: '14.627,93 €',
                  feedback:
                    'Hier wurden alle 12.000 € 10 Jahre lang verzinst. Die späteren Raten liegen aber kürzer auf dem Konto, die letzte gar nicht.',
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={fertig.teil('2')}
              topic="Rentenrechnung-Einstieg: vorschüssig oder nachschüssig (Standard)"
              title="Übung 2"
              rechnen
              level="standard"
              prompt={
                <p>
                  Ayla und Ben sparen 5 Jahre lang je 800 € pro Jahr zu 2,5 % p.a. Ayla zahlt immer am 01.01. ein, Ben immer am 31.12. Ben
                  sagt: „Wir zahlen beide 4.000 € ein, also haben wir am Ende gleich viel.“ Wer hat recht?
                </p>
              }
              options={[
                {
                  text: 'Ben: Beide zahlen gleich viel ein, also haben beide gleich viel.',
                  feedback: 'Die Einzahlungen sind gleich, aber Aylas Raten liegen jeweils ein Jahr länger auf dem Konto.',
                },
                {
                  text: 'Ayla hat mehr: 4.310,19 € statt 4.205,06 €, weil jede ihrer Raten ein Jahr länger verzinst wird.',
                  correct: true,
                  feedback: (
                    <>
                      Aylas Endwert ist genau das <M>q</M>-Fache von Bens Endwert: <M>{'4\\,205{,}06 \\cdot 1{,}025 = 4\\,310{,}19'}</M> €.
                    </>
                  ),
                },
                {
                  text: 'Ayla hat genau 800 € mehr, weil sie eine Rate mehr einzahlt.',
                  feedback: 'Beide zahlen genau 5 Raten ein. Der Unterschied entsteht nur durch die Zinsen.',
                },
                {
                  text: 'Ben hat mehr, weil seine letzte Rate am längsten verzinst wird.',
                  feedback: 'Bens letzte Rate kommt am 31.12. des letzten Jahres und wird gar nicht mehr verzinst.',
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Leonies Sparplan">
            <TrackedCheck
              onSolved={fertig.teil('3')}
              topic="Rentenrechnung-Einstieg: Endwert vorschüssig (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Leonie macht eine Ausbildung. Sie legt 8 Jahre lang jedes Jahr am Jahresanfang 600 € auf einen Sparplan mit 3 % p.a. Wie
                  hoch ist ihr Kontostand nach 8 Jahren? Wie viel davon sind Zinsen?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'k', label: <M>{'K_8 ='}</M>, expected: 600 * 1.03 * ((1.03 ** 8 - 1) / 0.03), unit: '€', tol: 0.5 },
                { kind: 'num', key: 'z', label: 'Zinsen:', expected: 600 * 1.03 * ((1.03 ** 8 - 1) / 0.03) - 4800, unit: '€', tol: 0.5 },
              ]}
              solution={
                <>
                  <MB>{'K_8 = 600 \\cdot 1{,}03 \\cdot \\frac{1{,}03^8 - 1}{1{,}03 - 1} = 5\\,495{,}46 \\text{ €}'}</MB>
                  <MB>{'\\text{Zinsen} = 5\\,495{,}46 - 8 \\cdot 600 = 695{,}46 \\text{ €}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Am Jahresanfang eingezahlt: Welche der beiden Formeln brauchst du?</>,
                    <>
                      <M>{'K_n = r \\cdot q \\cdot \\frac{q^n - 1}{q - 1}'}</M>. Die Zinsen sind der Kontostand minus alle Einzahlungen.
                    </>,
                    <>
                      <M>{'K_8 = 600 \\cdot 1{,}03 \\cdot \\frac{1{,}03^8 - 1}{0{,}03}'}</M>, Einzahlungen: <M>{'8 \\cdot 600 = 4\\,800'}</M> €.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Der Kassenwart bleibt dabei">
            <CheckCard
              title="Welche Rate braucht der Verein?"
              level="erweiterung"
              prompt={
                <p>
                  Der Kassenwart bleibt dabei: Der Verein zahlt erst am Jahresende ein. Wie hoch muss die jährliche Rate mindestens sein,
                  damit nach 6 Jahren bei 3 % p.a. genau 33.000 € für den Bus auf dem Konto sind?
                </p>
              }
              fields={[{ kind: 'num', key: 'r', label: <M>{'r ='}</M>, expected: BUS / FAKTOR, unit: '€', tol: 0.5 }]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'33\\,000 = r \\cdot \\frac{1{,}03^6 - 1}{1{,}03 - 1} = r \\cdot 6{,}468410 \\quad \\mid : 6{,}468410'}</MB>
                  <MB>{'r = \\frac{33\\,000}{6{,}468410} = 5\\,101{,}72 \\text{ €}'}</MB>
                  <p>Bei Einzahlung am Jahresende braucht der Verein also rund 102 € mehr pro Jahr.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Diesmal ist der Endwert bekannt und die Rate gesucht.</>,
                    <>
                      Setze <M>{'K_6 = 33\\,000'}</M> in die Formel für das Jahresende ein und stelle nach <M>r</M> um.
                    </>,
                    <>
                      <M>{'33\\,000 = r \\cdot 6{,}468410'}</M>. Teile durch den Bruch.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <div className="sl-ende">
            <p>
              Du kannst jetzt den Endwert regelmäßiger Einzahlungen berechnen, am Jahresanfang und am Jahresende. Bei den Übungsaufgaben
              berechnest du auch die Rate und die Laufzeit.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Endwert <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Rentenrechnung: Der Vereinsbus"
      width="wide"
      kompakt
      parent={{ to: '/finanzmathe/endwert', label: 'Rentenrechnung: Endwert' }}
    >
      <SeitenLernsituation
        ruhig
        thema={THEMA}
        ziel={
          <>
            In dieser Lernsituation hilfst du deinem Sportverein beim Sparen für einen Kleinbus. Du lernst, wie viel regelmäßige
            Einzahlungen mit Zinseszins am Ende wert sind.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Schätzung aus Phase 2 */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  if (!fest.fest || !fest.wahl) return null;
  const diff = Math.abs(fest.wert - KN_VOR);
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest geschätzt:</strong> etwa {fest.wert.toLocaleString('de-DE')} €. {WAHL[fest.wahl]}{' '}
        {fest.wahl === 'reicht' ? (
          <>Das stimmt: Am Jahresanfang eingezahlt sind es {euro(KN_VOR)}.</>
        ) : (
          <>
            Tatsächlich reicht es: Am Jahresanfang eingezahlt sind es {euro(KN_VOR)}, also mehr als {BUS.toLocaleString('de-DE')} €.
          </>
        )}{' '}
        {diff <= 300 ? 'Deine Schätzung war sehr nah dran.' : `Deine Schätzung lag ${euro(diff)} daneben.`} Die Zinsen betragen{' '}
        {euro(KN_VOR - N * R)}, nicht nur 900 €, weil jede Rate mit Zinseszins wächst.
      </p>
    </div>
  );
}
