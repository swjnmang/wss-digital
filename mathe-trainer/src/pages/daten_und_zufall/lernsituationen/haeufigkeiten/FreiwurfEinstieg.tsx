import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskShell from '../../../../components/layout/TaskShell';
import { Beispiel, M, MB, Merke } from '../../lernpfad/kit';
import { CheckCard, Hilfen, McCard } from '../../../lineare_funktionen/lernsituation_kit/kit';
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
import '../../lernpfad/lernpfad.css';
import KorbwurfSpiel from './KorbwurfSpiel';
import './freiwurf.css';

// Lernsituation 5.2 „Das Freiwurf-Duell“: absolute und relative Häufigkeit, h = H : n (ca. 45 bis 60 min).
// Format Kontrastierende Fälle (Schwartz & Bransford): Der Trainer will genau eine Spielerin bzw. einen Spieler für das
// Schulturnier nominieren. Mia (18 von 24), Jonas (21 von 30) und Lena (27 von 40) haben unterschiedlich oft geworfen. Wer die
// meisten Treffer hat (Lena), hat die schlechteste Quote (67,5 %). Mia ist mit 75 % die Beste.
// Problem erkennen: Festlegung (Auswahl + Schätzregler für die beste Quote), dann Mia und Jonas auf 120 Würfe hochrechnen
// (90 gegen 84 Treffer). Das klappt, wird aber mit krummen Zahlen mühsam: Dafür gibt es die relative Häufigkeit.
// Problem lösen: Rechenbeispiel Elfmeter-Training (Ali 14 von 20, Bo 22 von 40) mit Lernvideo, h für alle drei, Empfehlung.
// Handlungsprodukt analog: Spickzettel (Karteikarte) „So vergleiche ich fair“.
// Aha: Die meisten Treffer sind nicht die beste Quote.
// Punkte nach Aufwand: Warm-up 2/2/3/2/2 = 11, Problem erkennen 3 + 4 = 7, Problem lösen 14 + 4 + 5 = 23, Übungen 4/6/7 = 17,
// Profi 8 (Pflicht zusammen 58: Warm-up 19 %, Problem lösen 40 %, Übungen 29 %), Bonus-Spiel 4 Runden à 2 = 8 (wie die Profi-Übung).
// Identität: Themenfarbe Petrol, Symbol fa-basketball, Titelbild Sporthalle mit Korb und Anzeigetafel, Leitobjekt der Basketballkorb
// mit Trefferanzeige (Treffer H von Würfen n). Die Festlegung bleibt nur im Seitenzustand.

/** Lernvideo „absolute und relative Häufigkeit“ */
export const VIDEO_HAEUFIGKEIT = 'https://www.youtube.com/watch?v=PBRoDcPymec';

/* ── Situation ───────────────────────────────────────────────────────────── */

// Mia 18 von 24 = 75 %, Jonas 21 von 30 = 70 %, Lena 27 von 40 = 67,5 %. Auf 120 Würfe hochgerechnet: 90, 84, 81 Treffer.
const SPIELER = [
  { name: 'Mia', H: 18, n: 24 },
  { name: 'Jonas', H: 21, n: 30 },
  { name: 'Lena', H: 27, n: 40 },
] as const;
const H_MIA = 18 / 24;

type Wahl = 'lena' | 'jonas' | 'mia' | 'gleich';
const WAHL: Record<Wahl, string> = {
  lena: 'Lena, denn sie hat die meisten Treffer.',
  jonas: 'Jonas, denn er liegt in der Mitte und hat gleichmäßig getroffen.',
  mia: 'Mia, denn sie trifft im Verhältnis zu ihren Würfen am häufigsten.',
  gleich: 'Man kann sie nicht vergleichen, weil alle unterschiedlich oft geworfen haben.',
};

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: Sporthalle mit Korb, Ball im Flug und Anzeigetafel */
function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Eine Sporthalle. Rechts ein Basketballkorb am Brett, ein Ball fliegt in hohem Bogen darauf zu. Links eine Anzeigetafel mit der Aufschrift: Treffer 18, Würfe 24."
    >
      <rect x="0" y="206" width="720" height="46" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="206" y2="206" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="300" cy="206" r="46" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
      {/* Anzeigetafel */}
      <rect x="40" y="30" width="230" height="124" rx="10" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="54" y="44" width="202" height="96" rx="6" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="100" y="72" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">Treffer</text>
      <text x="210" y="72" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">Würfe</text>
      <text x="100" y="124" textAnchor="middle" fontSize="44" fontWeight="800" fill="var(--primary)">18</text>
      <text x="210" y="124" textAnchor="middle" fontSize="44" fontWeight="800" fill="var(--primary)">24</text>
      <line x1="155" x2="155" y1="56" y2="130" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="120" x2="120" y1="154" y2="206" stroke="var(--ink)" strokeWidth="5" />
      <line x1="190" x2="190" y1="154" y2="206" stroke="var(--ink)" strokeWidth="5" />
      {/* Korb */}
      <line x1="640" x2="640" y1="60" y2="206" stroke="var(--ink)" strokeWidth="6" />
      <rect x="610" y="30" width="62" height="74" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
      <rect x="626" y="62" width="30" height="24" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <line x1="610" x2="560" y1="92" y2="92" stroke="var(--highlight)" strokeWidth="6" strokeLinecap="round" />
      <path d="M562 92 L572 134 M576 92 L580 138 M592 92 L590 138 M606 92 L598 134 M562 108 Q584 118 606 108 M566 122 Q584 130 602 122" stroke="var(--ink)" strokeWidth="1.5" fill="none" />
      {/* Ball im Flug */}
      <path d="M340 190 Q440 -10 560 80" stroke="var(--ink)" strokeWidth="2" strokeDasharray="6 8" fill="none" />
      <circle cx="470" cy="46" r="20" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M450 46 H490 M470 26 V66" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="338" cy="190" r="14" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
    </svg>
  );
}

const THEMA: Thema = {
  name: 'Das Freiwurf-Duell',
  farbe: 'petrol',
  icon: 'fa-basketball',
  bild: <Titelbild />,
};

/* ── Leitobjekt: der Basketballkorb mit Trefferanzeige ───────────────────── */

/** Drei Körbe mit Trefferanzeige (H von n). Mit ergebnis steht unter jeder Anzeige „h = ?“ als Aufgabe. */
function Trefferkoerbe({ ergebnis = false }: { ergebnis?: boolean }) {
  return (
    <div className="zk-bild">
      <svg
        viewBox="0 0 720 250"
        role="img"
        aria-label={`Drei Basketballkörbe mit Anzeigetafeln: ${SPIELER.map((s) => `${s.name} hat von ${s.n} Würfen ${s.H} getroffen`).join('. ')}.`}
      >
        {SPIELER.map((s, i) => {
          const x = 120 + i * 240;
          return (
            <g key={s.name}>
              <text x={x} y="24" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--primary)">
                {s.name}
              </text>
              <rect x={x - 34} y="34" width="68" height="46" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
              <rect x={x - 14} y="52" width="28" height="20" fill="none" stroke="var(--ink)" strokeWidth="2" />
              <ellipse cx={x} cy="84" rx="28" ry="7" fill="none" stroke="var(--highlight)" strokeWidth="5" />
              <path
                d={`M${x - 28} 84 L${x - 17} 124 M${x - 14} 87 L${x - 6} 128 M${x} 91 L${x} 130 M${x + 14} 87 L${x + 6} 128 M${x + 28} 84 L${x + 17} 124 M${x - 24} 100 Q${x} 110 ${x + 24} 100 M${x - 20} 114 Q${x} 123 ${x + 20} 114`}
                stroke="var(--ink)"
                strokeWidth="1.5"
                fill="none"
              />
              <rect x={x - 80} y="138" width="160" height={ergebnis ? 98 : 78} rx="8" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
              <text x={x} y="170" textAnchor="middle" fontSize="28" fontWeight="800" fill="var(--ink)">
                {s.H} von {s.n}
              </text>
              <text x={x} y="198" textAnchor="middle" fontSize="16" fill="var(--ink-muted)">
                Treffer von Würfen
              </text>
              {ergebnis && (
                <text x={x} y="224" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--primary)">
                  h = ?
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Handlungsprodukt: Karteikarte */
function KarteBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Eine Karteikarte mit der Überschrift: So vergleiche ich fair. Darunter drei Zeilen für Formel, Beispiel und Merksatz."
      >
        <rect x="150" y="10" width="420" height="170" rx="10" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="150" y="10" width="420" height="40" rx="10" fill="var(--primary)" />
        <text x="360" y="38" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">
          So vergleiche ich fair
        </text>
        {[78, 108, 138, 166].map((y) => (
          <line key={y} x1="172" x2="548" y1={y} y2={y} stroke="var(--line-strong)" strokeWidth="1.5" />
        ))}
        <text x="176" y="72" fontSize="17" fill="var(--ink)">
          <tspan fontStyle="italic">Formel:</tspan> h = …
        </text>
        <text x="176" y="102" fontSize="17" fill="var(--ink)">
          <tspan fontStyle="italic">Beispiel:</tspan> …
        </text>
        <text x="176" y="132" fontSize="17" fill="var(--ink)">
          <tspan fontStyle="italic">Merke:</tspan> …
        </text>
      </svg>
    </div>
  );
}

/* ── Rechenbeispiel: Elfmeter-Training ───────────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Beim Elfmeter-Training im Fußball schießt Ali <strong>20-mal</strong> und trifft <strong>14-mal</strong>. Bo schießt{' '}
    <strong>40-mal</strong> und trifft <strong>22-mal</strong>. Bo hat mehr Treffer. Wer ist der bessere Schütze?
  </p>
);
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'H und n ablesen',
    body: (
      <>
        <p>
          <M>H</M> ist die <strong>absolute Häufigkeit</strong> (Anzahl der Treffer), <M>n</M> ist die Anzahl aller Schüsse.
        </p>
        <MB>{'\\text{Ali: } H = 14,\\ n = 20 \\qquad \\text{Bo: } H = 22,\\ n = 40'}</MB>
      </>
    ),
  },
  {
    title: 'Relative Häufigkeit berechnen: Treffer durch alle Schüsse',
    body: (
      <>
        <MB>{'h = \\frac{H}{n}'}</MB>
        <MB>{'\\text{Ali: } h = \\frac{14}{20} = 0{,}7 \\qquad \\text{Bo: } h = \\frac{22}{40} = 0{,}55'}</MB>
      </>
    ),
  },
  {
    title: 'In Prozent schreiben',
    body: <MB>{'0{,}7 = 70\\,\\% \\qquad 0{,}55 = 55\\,\\%'}</MB>,
  },
  {
    title: 'Vergleichen und antworten',
    body: (
      <p>
        Ali trifft 70 % seiner Schüsse, Bo nur 55 %. <strong>Ali ist der bessere Schütze</strong>, obwohl Bo mehr Treffer hat. Bo hat
        einfach doppelt so oft geschossen.
      </p>
    ),
  },
];

const LOESUNG = (
  <>
    <MB>{'\\text{Mia: } h = \\frac{18}{24} = 0{,}75 = 75\\,\\%'}</MB>
    <MB>{'\\text{Jonas: } h = \\frac{21}{30} = 0{,}7 = 70\\,\\%'}</MB>
    <MB>{'\\text{Lena: } h = \\frac{27}{40} = 0{,}675 = 67{,}5\\,\\%'}</MB>
    <p>Mia hat die beste Trefferquote, obwohl Lena die meisten Treffer hat.</p>
  </>
);

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function FreiwurfEinstieg() {
  const navigate = useNavigate();
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 65, fest: false });
  const [geloest, setGeloest] = useState(false);
  const [uebungen, setUebungen] = useState<string[]>([]);
  const uebungFertig = (key: string) => () => setUebungen((u) => (u.includes(key) ? u : [...u, key]));

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
            title="a) Bruch in Dezimalzahl"
            punkte={2}
            prompt={<p>Wandle die Brüche in Dezimalzahlen um.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'a1', label: <M>{'\\frac{3}{4} ='}</M>, expected: 0.75, tol: 0.0001 },
              { kind: 'num', key: 'a2', label: <M>{'\\frac{9}{20} ='}</M>, expected: 0.45, tol: 0.0001 },
            ]}
            solution={<MB>{'\\frac{3}{4} = 3 : 4 = 0{,}75 \\qquad \\frac{9}{20} = 9 : 20 = 0{,}45'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            title="b) Dezimalzahl in Prozent"
            punkte={2}
            prompt={<p>Schreibe als Prozentangabe.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'b1', label: <M>{'0{,}35 ='}</M>, expected: 35, unit: '%', tol: 0.0001 },
              { kind: 'num', key: 'b2', label: <M>{'0{,}6 ='}</M>, expected: 60, unit: '%', tol: 0.0001 },
            ]}
            solution={<MB>{'0{,}35 = 35\\,\\% \\qquad 0{,}6 = 0{,}60 = 60\\,\\%'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            title="c) Prozentwert"
            punkte={3}
            prompt={<p>Berechne den Prozentwert.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'c1', label: <M>{'25\\,\\% \\text{ von } 80 ='}</M>, expected: 20, tol: 0.0001 },
              { kind: 'num', key: 'c2', label: <M>{'10\\,\\% \\text{ von } 350 ='}</M>, expected: 35, tol: 0.0001 },
            ]}
            solution={<MB>{'25\\,\\% \\text{ von } 80 = 80 : 4 = 20 \\qquad 10\\,\\% \\text{ von } 350 = 350 : 10 = 35'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            title="d) Hochrechnen"
            punkte={2}
            prompt={<p>Eine Spielerin trifft 5 von 8 Würfen. Wie viele Treffer wären es bei 40 Würfen mit der gleichen Quote?</p>}
            fields={[{ kind: 'num', key: 'd', label: 'Treffer bei 40 Würfen:', expected: 25, tol: 0.0001 }]}
            solution={<MB>{'40 : 8 = 5 \\qquad 5 \\cdot 5 = 25 \\text{ Treffer}'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>40 Würfe sind ein Vielfaches von 8 Würfen. Wie oft passen 8 in 40?</>,
                  <>
                    <M>{'40 : 8 = 5'}</M>. Die Trefferzahl wird mit demselben Faktor mal genommen.
                  </>,
                  <>
                    <M>{'5 \\cdot 5 = 25'}</M>
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            title="e) Gesamtzahl bestimmen"
            punkte={2}
            rechnen={false}
            prompt={
              <p>
                Bei einer Umfrage zum Lieblings-Eis nennen 5 Personen „Schoko“, 8 Personen „Vanille“ und 7 Personen „Erdbeere“. Wie viele
                Personen haben insgesamt geantwortet?
              </p>
            }
            fields={[{ kind: 'num', key: 'e', label: 'Gesamtzahl:', expected: 20, tol: 0.0001 }]}
            solution={<MB>{'5 + 8 + 7 = 20'}</MB>}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Wer fährt zum Turnier?',
      pflicht: ['fest', 'hoch'],
      bedingung: 'Lege dich fest und rechne Mia und Jonas auf 120 Würfe hoch, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du bist Sportsprecherin oder Sportsprecher deiner Klasse. Für das Basketballturnier der Schulen darf nur{' '}
            <strong>eine Person</strong> den Freiwurf-Wettbewerb bestreiten. Trainer Kern hat im Training mitgezählt, wie oft jede von
            drei Spielern Freiwürfe geworfen und wie oft sie getroffen hat.
          </p>
          <p className="sl-text">
            Mia hat 24-mal geworfen und 18-mal getroffen, Jonas 30-mal und 21-mal, Lena 40-mal und 27-mal. Gesucht ist, wer am besten trifft.
          </p>
          <Zitat wer="Trainer Kern">
            <p>
              „Das ist doch klar: Lena hat <M>{'27'}</M> Treffer, Jonas nur <M>{'21'}</M> und Mia sogar nur <M>{'18'}</M>. Lena fährt zum
              Turnier.“
            </p>
          </Zitat>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst festlegen, dann fair vergleichen</p>
            <p>
              Wer ist die beste Werferin oder der beste Werfer? Lege dich zuerst fest, ohne zu rechnen. Prüfe danach, ob Trainer Kern
              recht hat.
            </p>
          </div>
          <Trefferkoerbe />
          <Vermutung
            optionen={WAHL}
            regler={{
              min: 50,
              max: 90,
              step: 1,
              text: (v) => (
                <>
                  Die beste Spielerin trifft etwa <span className="ls-slider-value">{v} %</span> ihrer Würfe.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig.teil('fest')}
            gespeichert={(w) => (
              <>
                Deine Wahl: <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong> Deine Schätzung für die beste Quote:{' '}
                <strong>{w.wert} %</strong>.
              </>
            )}
          />
          {fest.fest && (
            <Abschnitt titel="Alle werfen gleich oft">
              <p className="sl-text">
                Fair wäre ein Vergleich, bei dem alle gleich oft geworfen haben. Rechne Mia und Jonas auf <strong>120 Würfe</strong> hoch:
                Wie viele Treffer hätten sie dann jeweils, wenn sie genauso gut weiterwerfen?
              </p>
              <CheckCard
                onSolved={fertig.teil('hoch')}
                title="Auf 120 Würfe hochrechnen"
                punkte={4}
                prompt={<p>Mia: 18 Treffer bei 24 Würfen. Jonas: 21 Treffer bei 30 Würfen. Gleiche Quote, aber 120 Würfe.</p>}
                fieldsRow
                fields={[
                  { kind: 'num', key: 'mia', label: 'Mia bei 120 Würfen:', expected: 90, unit: 'Treffer', tol: 0.0001 },
                  { kind: 'num', key: 'jonas', label: 'Jonas bei 120 Würfen:', expected: 84, unit: 'Treffer', tol: 0.0001 },
                ]}
                solution={<MB>{'120 : 24 = 5,\\ 18 \\cdot 5 = 90 \\qquad 120 : 30 = 4,\\ 21 \\cdot 4 = 84'}</MB>}
                help={
                  <Hilfen
                    steps={[
                      <>Wie oft passen 24 Würfe in 120 Würfe? Und wie oft passen 30 Würfe hinein?</>,
                      <>
                        Mia: <M>{'120 : 24 = 5'}</M>, Jonas: <M>{'120 : 30 = 4'}</M>. Mit diesem Faktor multiplizierst du die Treffer.
                      </>,
                      <>
                        Mia: <M>{'18 \\cdot 5'}</M>, Jonas: <M>{'21 \\cdot 4'}</M>.
                      </>,
                    ]}
                  />
                }
              />
              <p className="fw-erkenntnis ls-back">
                <strong>Schon gemerkt?</strong> Mia würde 90 von 120 Würfen treffen, Jonas nur 84. Obwohl Mia weniger Treffer hat, ist sie
                die bessere Werferin. Das Hochrechnen auf 120 ging nur so glatt, weil die Zahlen gut zusammenpassen. Bei 17 von 26 Würfen
                oder bei drei Spielern wird es mühsam. Gleich lernst du einen Vergleich, der immer klappt.
              </p>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Wer trifft am besten?',
      pflicht: ['rechnung', 'empfehlung', 'produkt'],
      inhalt: (fertig) => {
        const geloestMelden = () => {
          fertig.teil('rechnung')();
          setGeloest(true);
        };
        return (
          <>
            <div className="sl-fokus">
              <p className="sl-fokus-titel">Deine Aufgabe: Berechne die Trefferquoten und berate den Trainer</p>
              <p>
                Mia hat 18 von 24 Würfen getroffen, Jonas 21 von 30 und Lena 27 von 40. Berechne in deinem Heft für jede Spielerin die{' '}
                <strong>relative Häufigkeit</strong> <M>h</M> der Treffer und gib sie in Prozent an. Wen nominiert der Trainer?
              </p>
            </div>
            <Trefferkoerbe ergebnis />
            <BeispielMitVideo video={VIDEO_HAEUFIGKEIT} videoTitel="Lernvideo: absolute und relative Häufigkeit">
              <Beispiel offen title="Das Elfmeter-Training" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
            </BeispielMitVideo>
            <Abschnitt titel="Vergleiche deine Ergebnisse">
              <CheckCard
                onSolved={geloestMelden}
                title="Trefferquoten der drei Spieler"
                punkte={14}
                prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
                fields={[
                  { kind: 'num', key: 'mia', label: 'Wie hoch ist die relative Häufigkeit der Treffer bei Mia (in Prozent)?', expected: 75, unit: '%', tol: 0.0051 },
                  { kind: 'num', key: 'jonas', label: 'Wie hoch ist sie bei Jonas (in Prozent)?', expected: 70, unit: '%', tol: 0.0051 },
                  { kind: 'num', key: 'lena', label: 'Wie hoch ist sie bei Lena (in Prozent)?', expected: 67.5, unit: '%', tol: 0.0051 },
                ]}
                loesungNachFehler
                solution={LOESUNG}
                help={
                  <Hilfen
                    steps={[
                      <>Rechne wie im Beispiel der Fußballer: Was ist <M>H</M>, was ist <M>n</M>?</>,
                      <>
                        Teile die Treffer durch alle Würfe: <M>{'h = \\frac{H}{n}'}</M>. Schreibe das Ergebnis danach als Prozent.
                      </>,
                      <>
                        Mia: <M>{'h = \\frac{18}{24}'}</M>, Jonas: <M>{'h = \\frac{21}{30}'}</M>, Lena: <M>{'h = \\frac{27}{40}'}</M>.
                      </>,
                    ]}
                  />
                }
              />
            </Abschnitt>
            <Abschnitt titel="Deine Empfehlung">
              <McCard
                onSolved={fertig.teil('empfehlung')}
                title="Empfehlung an den Trainer"
                punkte={4}
                prompt={<p>Wen sollte Trainer Kern für den Freiwurf-Wettbewerb nominieren?</p>}
                options={[
                  {
                    text: 'Lena, denn sie hat mit 27 die meisten Treffer.',
                    feedback:
                      'Lena hat zwar die meisten Treffer, aber auch die meisten Würfe. Im Verhältnis trifft sie mit 67,5 % am schlechtesten.',
                  },
                  {
                    text: 'Jonas, denn er hat 70 % und liegt damit vor Mia.',
                    feedback: 'Vergleiche noch einmal: Mia hat 75 %, Jonas nur 70 %.',
                  },
                  {
                    text: 'Mia, denn sie trifft mit 75 % den größten Anteil ihrer Würfe.',
                    correct: true,
                    feedback: 'Die relative Häufigkeit vergleicht die Anteile, deshalb ist Mia trotz der wenigsten Treffer die Beste.',
                  },
                  {
                    text: 'Das lässt sich nicht entscheiden, weil sie unterschiedlich oft geworfen haben.',
                    feedback: 'Doch: Mit der relativen Häufigkeit sind unterschiedlich große Gruppen fair vergleichbar.',
                  },
                ]}
              />
            </Abschnitt>
            <Handlungsprodukt titel="Spickzettel „So vergleiche ich fair“">
              <KarteBild />
              <p className="sl-text">
                Gestalte in deinem Heft eine Karteikarte (Spickzettel) „So vergleiche ich fair“. Schreibe die Formel für die relative
                Häufigkeit auf, rechne ein eigenes Beispiel mit zwei Spielern vor und erkläre in einem Merksatz, warum die meisten Treffer
                nicht reichen.
              </p>
              <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
                <ul className="zk-liste">
                  <li>„Um Gruppen mit unterschiedlicher Größe zu vergleichen, berechne ich …“</li>
                  <li>„Die relative Häufigkeit ist …, sie berechnet sich so: …“</li>
                  <li>„Mein Beispiel: … hat … von … getroffen, also ist …“</li>
                  <li>„Mehr Treffer heißt nicht bessere Quote, weil …“</li>
                  <li>
                    „Abkürzungen: <M>H</M> = …, <M>h</M> = …, <M>n</M> = …“
                  </li>
                </ul>
              </Aufklappbar>
            </Handlungsprodukt>
            <Abschnitt titel="Ist dein Spickzettel vollständig?">
              <Kriterien
                onAlle={fertig.teil('produkt')}
                items={[
                  <>
                    Die Formel <M>{'h = \\frac{H}{n}'}</M> steht auf der Karte
                  </>,
                  'Ein eigenes Beispiel mit zwei Spielern und der Rechnung in Prozent',
                  'Ein Merksatz, warum die meisten Treffer nicht die beste Quote bedeuten',
                  <>
                    Auf der Karte steht, wofür die Abkürzungen stehen: <M>H</M> (absolute Häufigkeit, Anzahl der Treffer), <M>h</M>{' '}
                    (relative Häufigkeit, Anteil der Treffer) und <M>n</M> (Anzahl aller Würfe). Außerdem erklärst du die Wörter
                    „absolut“, „relativ“ und „Trefferquote“ und alle anderen Begriffe, die für dich neu waren.
                  </>,
                ]}
              />
            </Abschnitt>
            {geloest && (
              <Abschnitt titel="Das hältst du fest">
                <Rueckbezug fest={fest} />
                <Merke title="Absolute und relative Häufigkeit">
                  <ul>
                    <li>
                      <M>H</M> = <strong>absolute Häufigkeit</strong>: Wie oft kommt etwas vor (Anzahl der Treffer)?
                    </li>
                    <li>
                      <M>n</M> = Anzahl aller Versuche bzw. aller Daten.
                    </li>
                    <li>
                      <M>h</M> = <strong>relative Häufigkeit</strong>: Welcher Anteil ist das?
                    </li>
                  </ul>
                  <MB>{'h = \\frac{H}{n}'}</MB>
                  <ul>
                    <li>
                      Schreibweisen: Bruch, Dezimalzahl oder Prozent, zum Beispiel <M>{'\\frac{18}{24} = 0{,}75 = 75\\,\\%'}</M>.
                    </li>
                    <li>Unterschiedlich große Gruppen vergleichst du immer mit der relativen Häufigkeit, nicht mit den absoluten Zahlen.</li>
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
      pflicht: ['1', '2', '3'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die letzte ist für Profis. Hast du Übung 1 bis 3 gelöst, wird unten ein
            Spiel freigeschaltet.
          </p>
          <Abschnitt titel="Übung 1: Haustiere in der Klasse">
            <McCard
              onSolved={() => {
                fertig.teil('1')();
                uebungFertig('1')();
              }}
              title="Übung 1"
              rechnen
              level="basis"
              punkte={4}
              prompt={
                <p>
                  In einer Klasse mit 25 Schülerinnen und Schülern haben 10 ein Haustier. Wie groß ist die relative Häufigkeit der
                  Haustierbesitzer?
                </p>
              }
              options={[
                {
                  text: '10 %',
                  feedback: 'Das ist nur die absolute Häufigkeit H = 10 mit einem Prozentzeichen. Du musst durch n = 25 teilen.',
                },
                {
                  text: '250 %',
                  feedback: <>Hier wurde <M>{'n : H = 25 : 10'}</M> gerechnet. Richtig ist Teil durch Ganzes: H durch n.</>,
                },
                {
                  text: '40 %',
                  correct: true,
                  feedback: <M>{'h = \\frac{10}{25} = 0{,}4 = 40\\,\\%'}</M>,
                },
                {
                  text: '0,4 %',
                  feedback: <>Die Dezimalzahl <M>{'0{,}4'}</M> entspricht 40 %. Beim Umwandeln in Prozent verschiebt sich das Komma um zwei Stellen.</>,
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <McCard
              onSolved={() => {
                fertig.teil('2')();
                uebungFertig('2')();
              }}
              title="Übung 2"
              rechnen
              level="standard"
              punkte={6}
              prompt={
                <p>
                  Die Handballmannschaft Rot hat 15 von 20 Spielen gewonnen, die Mannschaft Blau 18 von 30 Spielen. Kim sagt: „Blau hat 18
                  Siege und Rot nur 15. Also ist Blau besser.“ Wer hat recht?
                </p>
              }
              options={[
                {
                  text: 'Kim, denn 18 Siege sind mehr als 15 Siege.',
                  feedback: 'Blau hat auch 10 Spiele mehr gespielt. Die absolute Zahl der Siege sagt nichts über die Siegquote.',
                },
                {
                  text: 'Rot ist besser, denn 20 Spiele sind weniger als 30 Spiele.',
                  feedback: 'Die Anzahl der Spiele allein entscheidet nichts. Vergleiche die Anteile der gewonnenen Spiele.',
                },
                {
                  text: 'Rot ist besser: 75 % der Spiele gewonnen gegen 60 % bei Blau.',
                  correct: true,
                  feedback: <M>{'\\frac{15}{20} = 75\\,\\% \\quad \\text{und} \\quad \\frac{18}{30} = 60\\,\\%'}</M>,
                },
                {
                  text: 'Man kann die Mannschaften nicht vergleichen, weil sie verschieden viele Spiele hatten.',
                  feedback: 'Doch, genau dafür gibt es die relative Häufigkeit. Sie macht unterschiedlich große Gruppen vergleichbar.',
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Verkehrszählung">
            <CheckCard
              onSolved={() => {
                fertig.teil('3')();
                uebungFertig('3')();
              }}
              title="Übung 3"
              level="standard"
              punkte={7}
              prompt={
                <p>
                  An einer Straße fahren in einer Stunde 150 Fahrzeuge vorbei, davon 36 Lkw. Bestimme die relative Häufigkeit der Lkw und
                  die relative Häufigkeit der Fahrzeuge, die kein Lkw sind (jeweils in Prozent).
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'lkw', label: 'Lkw:', expected: 24, unit: '%', tol: 0.0051 },
                { kind: 'num', key: 'rest', label: 'kein Lkw:', expected: 76, unit: '%', tol: 0.0051 },
              ]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'h_{\\text{Lkw}} = \\frac{36}{150} = 0{,}24 = 24\\,\\%'}</MB>
                  <MB>{'h_{\\text{kein Lkw}} = \\frac{150 - 36}{150} = \\frac{114}{150} = 0{,}76 = 76\\,\\% \\quad \\text{oder} \\quad 100\\,\\% - 24\\,\\% = 76\\,\\%'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Die Gesamtzahl ist <M>n = 150</M>. Wie viele Fahrzeuge sind keine Lkw?</>,
                    <>
                      Lkw: <M>{'h = H : n'}</M>. Für „kein Lkw“ nimmst du die restlichen Fahrzeuge als <M>H</M> oder rechnest{' '}
                      <M>{'100\\,\\% - h'}</M>.
                    </>,
                    <>
                      <M>{'36 : 150 = 0{,}24'}</M> und <M>{'114 : 150 = 0{,}76'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Jonas will aufholen">
            <CheckCard
              title="Welche Quote braucht Jonas?"
              level="erweiterung"
              profi
              punkte={8}
              prompt={
                <p>
                  Jonas hat bisher 21 von 30 Würfen getroffen. Er darf noch 10 Würfe machen, also insgesamt 40. Er möchte am Ende eine
                  Trefferquote von mindestens 75 % haben. Wie viele Treffer braucht er insgesamt, und wie viele davon in den letzten 10
                  Würfen?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'ges', label: 'Treffer insgesamt:', expected: 30, tol: 0.0001 },
                { kind: 'num', key: 'rest', label: 'davon in den letzten 10 Würfen:', expected: 9, tol: 0.0001 },
              ]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'H = h \\cdot n = 0{,}75 \\cdot 40 = 30'}</MB>
                  <MB>{'30 - 21 = 9'}</MB>
                  <p>Jonas muss 9 der letzten 10 Würfe treffen.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Diesmal ist die relative Häufigkeit bekannt und die absolute gesucht. Stelle die Formel um.</>,
                    <>
                      Aus <M>{'h = H : n'}</M> wird <M>{'H = h \\cdot n'}</M>. Insgesamt sind es <M>{'n = 40'}</M> Würfe.
                    </>,
                    <>
                      <M>{'H = 0{,}75 \\cdot 40'}</M>. Davon hat Jonas schon 21 getroffen.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 3} titel="Korbwurf-Duell">
            <KorbwurfSpiel />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt die relative Häufigkeit berechnen und damit Gruppen fair vergleichen, auch wenn sie unterschiedlich groß sind. In
              den Übungsaufgaben rechnest du weiter mit H, h und n.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={() => navigate('/daten-und-zufall/haeufigkeiten')}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={() => navigate('/daten-und-zufall/haeufigkeiten/ueben')}>
                Weiter üben: Häufigkeiten <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Absolute und relative Häufigkeit: Das Freiwurf-Duell"
      width="wide"
      kompakt
      parent={{ to: '/daten-und-zufall/haeufigkeiten', label: 'Absolute und relative Häufigkeit' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={
          <>
            In dieser Lernsituation hilfst du Trainer Kern bei einer Nominierung. Du lernst, wie du mit der relativen Häufigkeit Gruppen
            fair vergleichst, auch wenn sie unterschiedlich groß sind.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Festlegung aus Phase 2 */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  if (!fest.fest || !fest.wahl) return null;
  const diff = Math.abs(fest.wert - H_MIA * 100);
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest festgelegt:</strong> {WAHL[fest.wahl]}{' '}
        {fest.wahl === 'mia' ? (
          <>Das stimmt: Mia hat zwar die wenigsten Treffer, aber mit 75 % die beste Quote.</>
        ) : (
          <>Tatsächlich ist es Mia: Sie hat zwar die wenigsten Treffer, aber mit 75 % die beste Quote.</>
        )}{' '}
        {diff <= 3 ? 'Deine Schätzung der besten Quote war sehr nah dran.' : `Deine Schätzung der besten Quote lag ${Math.round(diff)} Prozentpunkte daneben.`}{' '}
        Die meisten Treffer (Lena) bedeuten nicht die beste Quote, weil Lena auch am häufigsten geworfen hat.
      </p>
    </div>
  );
}
