import { useEffect, useId, useState, type ChangeEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskShell from '../../../../components/layout/TaskShell';
import { Beispiel, M, MB, Merke, fmt } from '../../lernpfad/kit';
import { mean, median } from '../../lernpfad/stats';
import { CheckCard, Hilfen, McCard, TrackedMc } from '../../../lineare_funktionen/lernsituation_kit/kit';
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
import BallonAufstieg from './BallonAufstieg';
import './gehalt.css';

// Lernsituation 5.5 „Das Durchschnittsgehalt“: Kennwerte vergleichen und bewerten (Ausreißer, Mittelwert oder Median, fehlenden Wert
// aus dem Mittelwert berechnen), ca. 45 bis 60 min.
// Format Rätsel/Fehlerdetektiv: Die Stellenanzeige der Medienwerkstatt Pixelhof wirbt mit „Durchschnittsgehalt 4.200 €“. Die SuS probieren
// aus, welches Gehalt die Geschäftsführung haben muss, damit das stimmt, und sehen dabei, dass der Median gleich bleibt (Aha).
// Lernprodukt analog: Antwort an Mia (Brief) mit Rechnung, Ausreißer und ehrlichem Kennwert.
// Identität: Themenfarbe Kupfer, Symbol Geldscheine, Titelbild Bürohaus mit Stellenanzeige-Schild, Leitobjekt die Gehaltsliste (Balken).
// Punkte (Pflicht gesamt 61): Warm-up 12 (a 2, b 2, c 3, d 2, e 3), Problem erkennen 6 (Festlegung 3, Beobachtung 3),
// Problem lösen 26 (Ergebnisse 11, Rückwärtsrechnung 7, Empfehlung 3, Kriterien 5), Übungen 17 (Üb. 1: 4, Üb. 2: 6, Üb. 3: 7),
// dazu Profi-Aufgabe 9 und Bonus-Spiel höchstens 8 (4 Runden à 2).

/** Lernvideo zu den statistischen Kennwerten (bei den Übungsaufgaben des Themas verlinkt) */
export const VIDEO_KENNWERTE = 'https://www.youtube.com/watch?v=UxKgca3l1G4';

/* ── Situation ───────────────────────────────────────────────────────────── */

// Sieben Beschäftigte und die Geschäftsführung (GF): Summe 33.600 €, Mittelwert 4.200 €, Median (2.500 + 2.600) : 2 = 2.550 €.
const KOLLEGEN = [2100, 2300, 2400, 2500, 2600, 2700, 2800];
const CHEF = 16200;
const ALLE = [...KOLLEGEN, CHEF];
const MITTEL = mean(ALLE);
const MEDIAN = median(ALLE);
const OHNE = mean(KOLLEGEN);
const NEU_ZIEL = 4500;
const NEU_GEHALT = 9 * NEU_ZIEL - ALLE.reduce((s, v) => s + v, 0);
const eur = (v: number) => `${v.toLocaleString('de-DE')} €`;
const eurCent = (v: number) => `${fmt(v, 2, true)} €`;

type Wahl = 'ja' | 'unklar' | 'weniger';
const WAHL: Record<Wahl, string> = {
  ja: 'Ja, etwa 4.200 € ist ein typisches Gehalt dort.',
  unklar: 'Das kann ich ohne die Gehaltsliste nicht sagen.',
  weniger: 'Eher weniger: Die meisten verdienen dort weniger als 4.200 €.',
};

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: Bürohaus der Medienwerkstatt, davor ein Schild mit dem beworbenen Durchschnittsgehalt */
function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Ein Bürohaus mit Fenstern und einer Eingangstür. Davor steht ein Schild mit der Aufschrift: Wir suchen Verstärkung, Durchschnittsgehalt 4.200 Euro. Links liegen Geldscheine und Münzen."
    >
      <rect x="0" y="206" width="720" height="46" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="206" y2="206" stroke="var(--ink)" strokeWidth="2" />
      {/* Bürohaus */}
      <rect x="300" y="40" width="250" height="166" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect key={`${r}${c}`} x={322 + c * 56} y={60 + r * 42} width="34" height="28" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        )),
      )}
      <rect x="400" y="160" width="50" height="46" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <line x1="425" x2="425" y1="160" y2="206" stroke="var(--ink)" strokeWidth="2" />
      {/* Schild */}
      <line x1="140" x2="140" y1="110" y2="206" stroke="var(--ink)" strokeWidth="5" />
      <line x1="270" x2="270" y1="110" y2="206" stroke="var(--ink)" strokeWidth="5" />
      <rect x="110" y="30" width="190" height="104" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
      <text x="205" y="62" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--ink)">
        Wir suchen
      </text>
      <text x="205" y="84" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--ink)">
        Verstärkung!
      </text>
      <rect x="126" y="94" width="158" height="30" rx="6" fill="var(--primary)" />
      <text x="205" y="115" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">
        Ø 4.200 € Gehalt
      </text>
      {/* Geldscheine und Münzen */}
      <rect x="590" y="176" width="86" height="34" rx="4" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="633" cy="193" r="9" fill="none" stroke="var(--ink)" strokeWidth="2" />
      {[0, 1, 2].map((k) => (
        <ellipse key={k} cx="700" cy={198 - k * 10} rx="16" ry="6" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

const THEMA: Thema = {
  name: 'Das Durchschnittsgehalt',
  farbe: 'kupfer',
  icon: 'fa-money-bill-wave',
  bild: <Titelbild />,
};

/* ── Leitobjekt: die Gehaltsliste als Balken ─────────────────────────────── */

const X0 = 20;
const X1 = 676;
const BASIS = 262;
const MAXGEHALT = 20000;
const HOEHE = 230;
const yWert = (v: number) => BASIS - (v / MAXGEHALT) * HOEHE;

/**
 * Gehaltsliste der Medienwerkstatt als Balken: sieben Beschäftigte und die Geschäftsführung (GF). Optional mit Linien für den Mittelwert
 * (durchgezogen) und den Median (gestrichelt).
 */
function Gehaltsliste({ chef, linien }: { chef: number; linien: boolean }) {
  const daten = [...KOLLEGEN, chef];
  const slot = (X1 - X0) / daten.length;
  const mw = mean(daten);
  const md = median(daten);
  const yMw = yWert(mw);
  const yMd = yWert(md);
  const mwOben = yMw <= yMd;
  const beschreibung = `Balkendiagramm der Gehälter: Sieben Beschäftigte zwischen ${eur(2100)} und ${eur(2800)}, die Geschäftsführung ${eur(chef)}.${
    linien ? ` Mittelwert ${eur(mw)}, Median ${eur(md)}.` : ''
  }`;
  return (
    <svg className="gh-lab-bild" viewBox="0 0 720 316" role="img" aria-label={beschreibung}>
      <line x1={X0} x2={X1} y1={BASIS} y2={BASIS} stroke="var(--ink)" strokeWidth="2" />
      {daten.map((v, i) => {
        const gf = i === daten.length - 1;
        const x = X0 + i * slot + (slot - 54) / 2;
        const y = yWert(v);
        return (
          <g key={i}>
            <rect x={x} y={y} width="54" height={BASIS - y} fill={gf ? 'var(--primary)' : 'var(--primary-soft)'} stroke="var(--ink)" strokeWidth="2" />
            <text x={x + 27} y={BASIS + 22} textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
              {gf ? 'GF' : `Person ${i + 1}`}
            </text>
            <text x={x + 27} y={BASIS + 42} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink)">
              {v.toLocaleString('de-DE')} €
            </text>
          </g>
        );
      })}
      {linien && (
        <>
          <line x1={X0} x2={X1} y1={yMd} y2={yMd} stroke="var(--ink)" strokeWidth="3" strokeDasharray="10 6" />
          <line x1={X0} x2={X1} y1={yMw} y2={yMw} stroke="var(--highlight)" strokeWidth="4" />
          <text x={X1 + 6} y={mwOben ? yMw - 4 : yMw + 15} fontSize="15" fontWeight="800" fill="var(--ink)">
            x̄
          </text>
          <text x={X1 + 6} y={mwOben ? yMd + 15 : yMd - 4} fontSize="15" fontWeight="800" fill="var(--ink)">
            Md
          </text>
        </>
      )}
    </svg>
  );
}

/** Experiment aus „Problem erkennen“: Die SuS stellen das Gehalt der Geschäftsführung ein und sehen Mittelwert und Median live */
function GehaltLabor({ onTreffer }: { onTreffer: () => void }) {
  const uid = useId();
  const [chef, setChef] = useState(6000);
  const mw = mean([...KOLLEGEN, chef]);
  const md = median([...KOLLEGEN, chef]);
  const treffer = chef === CHEF;
  useEffect(() => {
    if (treffer) onTreffer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treffer]);
  return (
    <div className="gh-lab" data-no-autocheck>
      <div className="zk-bild">
        <Gehaltsliste chef={chef} linien />
      </div>
      <ul className="gh-legende">
        <li>
          <svg width="34" height="10" aria-hidden="true">
            <line x1="0" x2="34" y1="5" y2="5" stroke="var(--highlight)" strokeWidth="4" />
          </svg>
          x̄ = Mittelwert
        </li>
        <li>
          <svg width="34" height="10" aria-hidden="true">
            <line x1="0" x2="34" y1="5" y2="5" stroke="var(--ink)" strokeWidth="3" strokeDasharray="8 5" />
          </svg>
          Md = Median (mittleres Gehalt der geordneten Liste)
        </li>
      </ul>
      <div className="ls-slider">
        <label htmlFor={`${uid}-gf`}>
          Die Geschäftsführung (GF) verdient im Monat <span className="ls-slider-value">{eur(chef)}</span>.
        </label>
        <input
          id={`${uid}-gf`}
          type="range"
          min={2800}
          max={MAXGEHALT}
          step={200}
          value={chef}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setChef(Number(e.target.value))}
        />
      </div>
      <dl className="gh-readout" aria-live="polite">
        <div className="gh-mittel">
          <dt>Mittelwert</dt>
          <dd>{eur(mw)}</dd>
        </div>
        <div>
          <dt>Median</dt>
          <dd>{eur(md)}</dd>
        </div>
      </dl>
      {treffer && (
        <p className="gh-treffer ls-back">
          <strong>Treffer!</strong> Verdient die Geschäftsführung {eur(CHEF)}, stimmt der Mittelwert {eur(MITTEL)} aus der Anzeige. Schau dir jetzt den Median an.
        </p>
      )}
    </div>
  );
}

/** Die Stellenanzeige (Problem erkennen) */
function AnzeigeBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 200"
        role="img"
        aria-label="Stellenanzeige der Medienwerkstatt Pixelhof: Wir suchen Verstärkung für unser Team von 8 Beschäftigten. Durchschnittsgehalt 4.200 Euro brutto im Monat."
      >
        <rect x="150" y="8" width="420" height="184" rx="10" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
        <rect x="150" y="8" width="420" height="44" rx="10" fill="var(--primary)" />
        <text x="360" y="38" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">
          Medienwerkstatt Pixelhof
        </text>
        <text x="360" y="82" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
          Wir suchen Verstärkung!
        </text>
        <text x="360" y="112" textAnchor="middle" fontSize="17" fill="var(--ink)">
          Ein starkes Team mit 8 Beschäftigten
        </text>
        <rect x="200" y="128" width="320" height="46" rx="8" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <text x="360" y="158" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--ink)">
          Durchschnittsgehalt: 4.200 €
        </text>
      </svg>
    </div>
  );
}

/** Handlungsprodukt: Brief an Mia */
function BriefBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Ein Brief mit Umschlag. Auf dem Briefbogen steht: Liebe Mia, ist der Durchschnitt aussagekräftig? Darunter Linien für die Rechnung und die Empfehlung."
      >
        <rect x="170" y="30" width="400" height="150" rx="8" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <path d="M170 38 L370 120 L570 38" fill="none" stroke="var(--ink)" strokeWidth="2" />
        <rect x="210" y="8" width="320" height="130" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <text x="226" y="36" fontSize="17" fontWeight="800" fill="var(--ink)">
          Liebe Mia,
        </text>
        <text x="226" y="62" fontSize="16" fill="var(--ink)">
          Der Durchschnitt 4.200 € ist …
        </text>
        <line x1="226" x2="500" y1="84" y2="84" stroke="var(--ink)" strokeWidth="2" />
        <line x1="226" x2="500" y1="104" y2="104" stroke="var(--ink)" strokeWidth="2" />
        <line x1="226" x2="440" y1="124" y2="124" stroke="var(--ink)" strokeWidth="2" />
      </svg>
    </div>
  );
}

/* ── Rechenbeispiel: Kfz-Werkstatt ───────────────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    In einer Kfz-Werkstatt arbeiten 6 Personen. Ihre Monatsgehälter: 2.000 €, 2.200 €, 2.200 €, 2.400 €, 2.600 € und 9.000 € (Werkstattleitung).
    Berechne Mittelwert und Median und entscheide, welcher Kennwert das typische Gehalt besser beschreibt. Die Werkstatt stellt eine siebte Person ein:
    Welches Gehalt muss sie bekommen, damit der Mittelwert aller 7 genau 3.500 € beträgt?
  </p>
);
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Mittelwert berechnen',
    body: (
      <>
        <p>Alle Gehälter addieren und durch die Anzahl teilen:</p>
        <MB>{'\\bar{x} = \\frac{2\\,000 + 2\\,200 + 2\\,200 + 2\\,400 + 2\\,600 + 9\\,000}{6} = \\frac{20\\,400}{6} = 3\\,400 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: 'Median bestimmen',
    body: (
      <>
        <p>Die Liste ist schon der Größe nach geordnet. Bei 6 Werten (gerade Anzahl) liegt der Median zwischen dem 3. und dem 4. Wert:</p>
        <MB>{'\\text{Median} = \\frac{2\\,200 + 2\\,400}{2} = 2\\,300 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: 'Ausreißer benennen und Kennwert wählen',
    body: (
      <>
        <p>
          Die 9.000 € weichen stark von den anderen Gehältern ab: Das ist der <strong>Ausreißer</strong>. Er zieht den Mittelwert (3.400 €) weit
          nach oben, fünf von sechs Personen verdienen weniger. Der Median (2.300 €) beschreibt das typische Gehalt besser.
        </p>
      </>
    ),
  },
  {
    title: 'Rückwärts rechnen: das Gehalt der siebten Person',
    body: (
      <>
        <p>Summe aller 7 Gehälter bei Mittelwert 3.500 €: Mittelwert mal Anzahl. Davon zieht man die bisherige Summe ab.</p>
        <MB>{'7 \\cdot 3\\,500 = 24\\,500 \\text{ €} \\qquad 24\\,500 - 20\\,400 = 4\\,100 \\text{ €}'}</MB>
      </>
    ),
  },
];

const LOESUNG_KERN = (
  <>
    <MB>{'\\bar{x} = \\frac{2\\,100 + 2\\,300 + 2\\,400 + 2\\,500 + 2\\,600 + 2\\,700 + 2\\,800 + 16\\,200}{8} = \\frac{33\\,600}{8} = 4\\,200 \\text{ €}'}</MB>
    <MB>{'\\text{Median} = \\frac{2\\,500 + 2\\,600}{2} = 2\\,550 \\text{ €}'}</MB>
    <MB>{'\\text{ohne Geschäftsführung: } \\bar{x} = \\frac{17\\,400}{7} \\approx 2\\,485{,}71 \\text{ €}'}</MB>
    <p>Der Ausreißer ist das Gehalt der Geschäftsführung: 16.200 €.</p>
  </>
);

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function GehaltEinstieg() {
  const navigate = useNavigate();
  const onBack = () => navigate('/daten-und-zufall/kennwerte-bewerten');
  const onPractice = () => navigate('/daten-und-zufall/kennwerte-bewerten/ueben');
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 3500, fest: false });
  const [geloest, setGeloest] = useState(false);
  const [uebungen, setUebungen] = useState<string[]>([]);

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben zu Kennwerten brauchst du gleich.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            title="a) Mittelwert"
            punkte={2}
            prompt={<p>Vier Kolleginnen bekommen in einem Monat 4 €, 6 €, 9 € und 5 € Trinkgeld. Wie hoch ist der Mittelwert?</p>}
            fields={[{ kind: 'num', key: 'm', label: <M>{'\\bar{x} ='}</M>, expected: 6, unit: '€' }]}
            solution={<MB>{'\\bar{x} = \\frac{4 + 6 + 9 + 5}{4} = \\frac{24}{4} = 6 \\text{ €}'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            title="b) Median bei ungerader Anzahl"
            punkte={2}
            rechnen={false}
            prompt={<p>Bestimme den Median der Werte 7, 2, 9, 4, 5. Ordne sie zuerst der Größe nach.</p>}
            fields={[{ kind: 'num', key: 'md', label: 'Median =', expected: 5 }]}
            solution={<MB>{'2 \\;\\; 4 \\;\\; \\underline{5} \\;\\; 7 \\;\\; 9 \\quad\\Rightarrow\\quad \\text{Median} = 5'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            title="c) Median bei gerader Anzahl"
            punkte={3}
            prompt={<p>Bestimme den Median der Werte 3, 8, 5, 10. Bei einer geraden Anzahl liegt der Median zwischen den beiden mittleren Werten.</p>}
            fields={[{ kind: 'num', key: 'md', label: 'Median =', expected: 6.5 }]}
            solution={<MB>{'3 \\;\\; 5 \\;\\; 8 \\;\\; 10 \\quad\\Rightarrow\\quad \\text{Median} = \\frac{5 + 8}{2} = 6{,}5'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            title="d) Spannweite und Modalwert"
            punkte={2}
            rechnen={false}
            prompt={
              <p>
                Spannweite der Werte 12, 3, 17, 9 und Modalwert (häufigster Wert) der Werte 2, 5, 3, 5, 4, 5, 2.
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 's', label: 'Spannweite =', expected: 14 },
              { kind: 'num', key: 'mo', label: 'Modalwert =', expected: 5 },
            ]}
            solution={<MB>{'17 - 3 = 14 \\qquad \\text{Modalwert} = 5 \\text{ (kommt 3-mal vor)}'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            title="e) Summe aus dem Mittelwert"
            punkte={3}
            prompt={<p>Fünf Werte haben den Mittelwert 6. Wie groß ist die Summe aller fünf Werte?</p>}
            fields={[{ kind: 'num', key: 'sum', label: 'Summe =', expected: 30 }]}
            solution={<MB>{'\\bar{x} = \\frac{\\text{Summe}}{5} = 6 \\;\\Rightarrow\\; \\text{Summe} = 5 \\cdot 6 = 30'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Der Mittelwert entsteht aus Summe geteilt durch Anzahl. Hier ist die Summe gesucht.</>,
                  <>Rechne die Division rückwärts: Mittelwert mal Anzahl.</>,
                  <>
                    <M>{'5 \\cdot 6'}</M>
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
      titel: 'Stimmt der Durchschnitt?',
      pflicht: ['fest', 'labor', 'beob'],
      bedingung: 'Lege dich fest, finde mit dem Regler das Gehalt der Geschäftsführung und beantworte die Beobachtungsfrage, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du bist bald mit der Ausbildung fertig und suchst eine Stelle. Deine Freundin Mia zeigt dir eine Anzeige der Medienwerkstatt
            Pixelhof, einer kleinen Firma mit 8 Beschäftigten. Darin wirbt die Firma mit einem Durchschnittsgehalt von <strong>4.200 €</strong> im
            Monat.
          </p>
          <p className="sl-text">
            Gesucht ist: Was verdient dort eine typische Person wirklich? Das Gehalt der Geschäftsführung kennst du nicht. Die anderen sieben
            Beschäftigten verdienen zwischen 2.100 € und 2.800 €.
          </p>
          <Zitat wer="Mia">
            <p>„4.200 € im Durchschnitt! Da verdienst du dort bestimmt bald auch so viel.“</p>
          </Zitat>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst festlegen, dann ausprobieren</p>
            <p>
              Lege dich fest, ob 4.200 € für eine typische Person dort stimmen können. Probiere danach mit dem Regler aus, wie viel die
              Geschäftsführung verdienen muss, damit der Durchschnitt wirklich 4.200 € beträgt.
            </p>
          </div>
          <AnzeigeBild />
          <Vermutung
            optionen={WAHL}
            regler={{
              min: 2000,
              max: 4500,
              step: 100,
              text: (v) => (
                <>
                  Eine typische Person dort verdient etwa <span className="ls-slider-value">{eur(v)}</span> im Monat.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig.teil('fest')}
            gespeichert={(w) => (
              <>
                Deine Schätzung: <strong>{eur(w.wert)}</strong>. <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong>
              </>
            )}
          />
          {fest.fest && (
            <Abschnitt titel="Probiere es aus: Wie viel verdient die Geschäftsführung?">
              <p className="sl-text">
                Stelle den Regler so ein, dass der Mittelwert genau 4.200 € beträgt. Schau dabei auch auf den Median.
              </p>
              <GehaltLabor onTreffer={fertig.teil('labor')} />
              <CheckCard
                onSolved={fertig.teil('beob')}
                title="Was fällt dir auf?"
                punkte={3}
                rechnen={false}
                prompt={<p>Du hast den Regler hin und her bewegt. Was passiert, wenn die Geschäftsführung mehr verdient?</p>}
                fields={[
                  { kind: 'select', key: 'mw', label: 'Der Mittelwert', options: ['sinkt', 'steigt', 'bleibt gleich'], expected: 1 },
                  { kind: 'select', key: 'md', label: 'Der Median', options: ['sinkt', 'steigt', 'bleibt gleich'], expected: 2 },
                ]}
                fieldsRow
                solution={
                  <p>
                    Der Mittelwert steigt, der Median bleibt bei 2.550 €. Der Median ist das mittlere Gehalt der geordneten Liste, und die
                    Geschäftsführung steht immer ganz am Ende.
                  </p>
                }
              />
              <p className="gh-treffer ls-back">
                <strong>Schon gemerkt?</strong> Mit 16.200 € für die Geschäftsführung stimmt die Anzeige, aber nur eine einzige Person
                verdient mehr als 4.200 €. Ein einzelner sehr hoher Wert zieht den Mittelwert nach oben, den Median nicht. Gleich lernst du, wie du solche
                Ausreißer erkennst und den ehrlichen Kennwert wählst.
              </p>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Was verdient man bei Pixelhof wirklich?',
      pflicht: ['kern', 'rueck', 'empfehlung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Prüfe die Anzeige und berate Mia</p>
            <p>
              Die Geschäftsführung von Pixelhof verdient 16.200 € im Monat, die anderen sieben Beschäftigten verdienen 2.100 €, 2.300 €, 2.400 €, 2.500 €,
              2.600 €, 2.700 € und 2.800 €. Berechne in deinem Heft Mittelwert und Median aller 8 Gehälter und den Mittelwert ohne die Geschäftsführung.
              Welches Gehalt ist der Ausreißer? Wie hoch müsste das Gehalt einer neunten Person sein, damit der Mittelwert aller 9 auf 4.500 € steigt?
            </p>
          </div>
          <div className="zk-bild">
            <Gehaltsliste chef={CHEF} linien={false} />
          </div>
          <BeispielMitVideo video={VIDEO_KENNWERTE} videoTitel="Lernvideo: statistische Kennwerte">
            <Beispiel offen title="Die Kfz-Werkstatt" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('kern')();
                setGeloest(true);
              }}
              title="Mittelwert, Median und Ausreißer"
              punkte={11}
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'mw', label: 'Wie hoch ist der Mittelwert aller 8 Gehälter?', expected: MITTEL, unit: '€', tol: 0.5 },
                { kind: 'num', key: 'md', label: 'Wie hoch ist der Median der 8 Gehälter?', expected: MEDIAN, unit: '€', tol: 0.5 },
                { kind: 'num', key: 'out', label: 'Welches Gehalt ist der Ausreißer?', expected: CHEF, unit: '€', tol: 0.5 },
                { kind: 'num', key: 'oh', label: 'Wie hoch ist der Mittelwert ohne die Geschäftsführung (auf Cent gerundet)?', expected: OHNE, unit: '€', tol: 0.01 },
              ]}
              loesungNachFehler
              solution={LOESUNG_KERN}
              help={
                <Hilfen
                  steps={[
                    <>Rechne wie im Beispiel der Kfz-Werkstatt: Mittelwert und Median getrennt.</>,
                    <>
                      Mittelwert: alle Gehälter addieren und durch die Anzahl teilen. Median: ordnen, bei 8 Werten (gerade Anzahl) liegt er zwischen dem 4.
                      und 5. Wert.
                    </>,
                    <>
                      <M>{'\\bar{x} = \\frac{33\\,600}{8}'}</M>, Median: <M>{'\\frac{2\\,500 + 2\\,600}{2}'}</M>. Ohne Geschäftsführung bleiben 7 Gehälter mit der
                      Summe <M>{'17\\,400'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Rückwärts gerechnet: die neunte Person">
            <CheckCard
              onSolved={fertig.teil('rueck')}
              title="Gehalt der neunten Person"
              punkte={7}
              prompt={<p>Pixelhof stellt eine neunte Person ein. Der Mittelwert aller 9 Gehälter soll genau 4.500 € betragen.</p>}
              fields={[{ kind: 'num', key: 'neu', label: 'Welches Gehalt muss die neunte Person bekommen?', expected: NEU_GEHALT, unit: '€', tol: 0.5 }]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'9 \\cdot 4\\,500 = 40\\,500 \\text{ €}'}</MB>
                  <MB>{'40\\,500 - 33\\,600 = 6\\,900 \\text{ €}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Überlege: Wie groß muss die Summe aller 9 Gehälter sein, damit der Mittelwert 4.500 € ist?</>,
                    <>Summe = Mittelwert mal Anzahl. Davon ziehst du die Summe der 8 bisherigen Gehälter ab.</>,
                    <>
                      <M>{'9 \\cdot 4\\,500 - 33\\,600'}</M>
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Deine Empfehlung">
            <McCard
              onSolved={fertig.teil('empfehlung')}
              title="Antwort an Mia"
              punkte={3}
              prompt={<p>Was antwortest du Mia auf die Frage, was du dort verdienen würdest?</p>}
              options={[
                {
                  text: 'Mit 4.200 € kannst du fest rechnen, der Durchschnitt zeigt das typische Gehalt.',
                  feedback: 'Nur eine Person verdient mehr als 4.200 €. Der Ausreißer 16.200 € zieht den Mittelwert hoch, typisch sind die Gehälter zwischen 2.100 € und 2.800 €.',
                },
                {
                  text: 'Die Anzeige ist falsch gerechnet: Der Mittelwert ist nicht 4.200 €.',
                  feedback: 'Die Rechnung stimmt: 33.600 € : 8 = 4.200 €. Das Problem ist nicht die Rechnung, sondern dass der Mittelwert hier nichts Typisches zeigt.',
                },
                {
                  text: 'Rechnerisch stimmt der Mittelwert, aber der Ausreißer verzerrt ihn. Typisch sind etwa 2.550 € (Median). Ein Einstiegsgehalt liegt eher darunter.',
                  correct: true,
                  feedback: 'Bei Ausreißern beschreibt der Median das typische Gehalt besser. Ohne die Geschäftsführung wären es im Mittel nur 2.485,71 €.',
                },
                {
                  text: 'Der Median zählt nicht, weil er nur zwei Gehälter berücksichtigt.',
                  feedback: 'Der Median entsteht aus der ganzen geordneten Liste: Die Hälfte der Gehälter liegt darunter, die andere Hälfte darüber.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Antwortbrief an Mia">
            <BriefBild />
            <p className="sl-text">
              Schreibe in deinem Heft einen kurzen Brief an Mia. Erkläre ihr, wie aussagekräftig der Durchschnitt 4.200 € in der Stellenanzeige ist.
              Zeige deine Rechnung für Mittelwert und Median, nenne den Ausreißer und sage, welchen Kennwert die Firma ehrlicherweise in die Anzeige
              schreiben sollte.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Liebe Mia, der Durchschnitt von 4.200 € stimmt rechnerisch, aber …“</li>
                <li>„Der Ausreißer ist …, denn er liegt weit über den anderen Gehältern.“</li>
                <li>„Der Median ist …, das heißt: Die Hälfte der Beschäftigten verdient weniger als …“</li>
                <li>„Ehrlicher wäre in der Anzeige …“</li>
                <li>
                  „Abkürzungen und Begriffe: <M>{'\\bar{x}'}</M> bedeutet …, der Median ist …, ein Ausreißer ist …“
                </li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Brief vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                'Die Rechnung für den Mittelwert und den Median aller 8 Gehälter',
                'Der Ausreißer ist genannt und du erklärst, warum er den Mittelwert nach oben zieht',
                'Eine klare Empfehlung, welcher Kennwert das typische Gehalt ehrlich beschreibt',
                'Ein Satz, wie die Firma ihre Anzeige ehrlicher formulieren könnte',
                <>
                  Unter deinem Brief steht, was die Abkürzung <M>{'\\bar{x}'}</M> (Mittelwert, arithmetisches Mittel) bedeutet. Außerdem erklärst du die
                  Begriffe Median (Zentralwert), Ausreißer, Spannweite und alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug fest={fest} />
              <Merke title="Kennwerte bewerten: Mittelwert oder Median?">
                <ul>
                  <li>
                    <strong>Mittelwert</strong> <M>{'\\bar{x} = \\frac{\\text{Summe aller Werte}}{\\text{Anzahl}}'}</M>: berücksichtigt jeden Wert, wird aber von{' '}
                    <strong>Ausreißern</strong> stark verschoben.
                  </li>
                  <li>
                    <strong>Median</strong>: mittlerer Wert der geordneten Liste, bei gerader Anzahl der Mittelwert der beiden mittleren Werte. Ausreißer
                    ändern ihn kaum.
                  </li>
                  <li>Gibt es einen Ausreißer, beschreibt der Median das typische Gehalt besser. Der Mittelwert passt, wenn man eine Summe gleichmäßig verteilen will.</li>
                  <li>
                    Fehlender Wert bei bekanntem Mittelwert: <M>{'\\text{Summe} = \\bar{x} \\cdot \\text{Anzahl}'}</M>, dann die bekannte Summe abziehen.
                  </li>
                </ul>
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
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die letzte ist für Profis. Hast du Übung 1 bis 3 gelöst, wird unten ein Spiel
            freigeschaltet.
          </p>
          <Abschnitt titel="Übung 1: Die typische Miete">
            <TrackedMc
              onSolved={() => {
                fertig.teil('1')();
                setUebungen((u) => (u.includes('1') ? u : [...u, '1']));
              }}
              topic="Kennwerte bewerten-Einstieg: Kennwert wählen (Basis)"
              title="Übung 1"
              level="basis"
              punkte={4}
              rechnen
              prompt={
                <p>
                  In einer Straße kosten fünf Wohnungen im Monat 520 €, 540 €, 560 €, 580 € und 3.900 € (Penthouse). Ein Makler sagt: „Bei uns ist eine Wohnung typischerweise sehr günstig.“ Welcher
                  Kennwert passt zu seiner Aussage?
                </p>
              }
              options={[
                {
                  text: 'Der Mittelwert 1.220 €',
                  feedback: 'Das Penthouse zieht den Mittelwert nach oben. Vier von fünf Wohnungen kosten weniger als 600 €.',
                },
                {
                  text: 'Der Median 560 €',
                  correct: true,
                  feedback: <>Der Median ist der mittlere Wert der geordneten Liste: 520, 540, <strong>560</strong>, 580, 3.900. Das Penthouse ändert ihn nicht.</>,
                },
                {
                  text: 'Die Spannweite 3.380 €',
                  feedback: 'Die Spannweite (größter minus kleinster Wert) zeigt nur die Streuung, nicht, was typisch ist.',
                },
                {
                  text: 'Der kleinste Wert 520 €',
                  feedback: 'Der kleinste Wert ist kein Kennwert für „typisch“. Er beschreibt nur die günstigste Wohnung.',
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
              topic="Kennwerte bewerten-Einstieg: Mittelwert oder Median (Standard)"
              title="Übung 2"
              level="standard"
              punkte={6}
              rechnen
              prompt={
                <p>
                  Der Bus braucht an 8 Tagen für die Strecke zur Schule 12, 12, 13, 13, 14, 14, 15 und 59 Minuten (einmal gab es eine Panne). Ayla
                  sagt: „Im Durchschnitt braucht der Bus 19 Minuten, ich plane 19 Minuten ein.“ Ben sagt: „Der Median ist besser für die Planung.“ Wer hat recht?
                </p>
              }
              options={[
                {
                  text: 'Ayla: Der Mittelwert ist immer der beste Kennwert.',
                  feedback: 'Der Mittelwert wird hier durch die Panne (59 Minuten) stark nach oben gezogen. An 7 von 8 Tagen reicht viel weniger Zeit.',
                },
                {
                  text: 'Ben: Der Median beträgt 13,5 Minuten und wird von der Panne kaum beeinflusst.',
                  correct: true,
                  feedback: <>Der Median liegt zwischen dem 4. und 5. Wert: <M>{'\\frac{13 + 14}{2} = 13{,}5'}</M> Minuten. Der Ausreißer 59 Minuten verfälscht ihn nicht.</>,
                },
                {
                  text: 'Ben, aber der Median ist 14 Minuten.',
                  feedback: 'Bei 8 Werten (gerade Anzahl) liegt der Median zwischen dem 4. und dem 5. Wert: (13 + 14) : 2 = 13,5.',
                },
                {
                  text: 'Beide haben recht, denn Mittelwert und Median sind immer gleich.',
                  feedback: 'Sie sind nur bei gleichmäßig verteilten Werten ähnlich. Hier liegen 19 und 13,5 weit auseinander.',
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Das fehlende Gehalt in der Bäckerei">
            <CheckCard
              onSolved={() => {
                fertig.teil('3')();
                setUebungen((u) => (u.includes('3') ? u : [...u, '3']));
              }}
              title="Übung 3"
              level="standard"
              punkte={7}
              prompt={
                <p>
                  In einer Bäckerei arbeiten 5 Personen. Vier verdienen 2.200 €, 2.400 €, 2.600 € und 2.600 €. Das Gehalt der fünften Person
                  ist nicht bekannt. Der Mittelwert aller fünf Gehälter beträgt 2.800 €. Berechne das fehlende Gehalt und den Median aller fünf Gehälter.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'x', label: 'Fehlendes Gehalt:', expected: 4200, unit: '€', tol: 0.5 },
                { kind: 'num', key: 'md', label: 'Median:', expected: 2600, unit: '€', tol: 0.5 },
              ]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'5 \\cdot 2\\,800 = 14\\,000 \\qquad 14\\,000 - (2\\,200 + 2\\,400 + 2\\,600 + 2\\,600) = 14\\,000 - 9\\,800 = 4\\,200 \\text{ €}'}</MB>
                  <MB>{'2\\,200 \\;\\; 2\\,400 \\;\\; \\underline{2\\,600} \\;\\; 2\\,600 \\;\\; 4\\,200 \\quad\\Rightarrow\\quad \\text{Median} = 2\\,600 \\text{ €}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Zuerst brauchst du die Summe aller fünf Gehälter. Sie folgt aus dem Mittelwert.</>,
                    <>Summe = Mittelwert mal Anzahl. Ziehe davon die vier bekannten Gehälter ab.</>,
                    <>
                      <M>{'5 \\cdot 2\\,800 - 9\\,800'}</M>. Für den Median ordnest du alle fünf Gehälter und nimmst das mittlere.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Die Anzeige ehrlich machen">
            <CheckCard
              title="Wie viel müsste die Geschäftsführung verdienen?"
              level="erweiterung"
              profi
              punkte={9}
              prompt={
                <p>
                  Bei Pixelhof soll der Mittelwert aller 8 Gehälter genau <strong>doppelt so groß</strong> sein wie der Median (2.550 €). Die sieben anderen
                  Gehälter bleiben gleich (Summe 17.400 €). Wie viel müsste die Geschäftsführung dann verdienen?
                </p>
              }
              fields={[{ kind: 'num', key: 'gf', label: 'Gehalt der Geschäftsführung:', expected: 23400, unit: '€', tol: 0.5 }]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'\\bar{x} = 2 \\cdot 2\\,550 = 5\\,100 \\qquad 8 \\cdot 5\\,100 = 40\\,800 \\text{ €}'}</MB>
                  <MB>{'40\\,800 - 17\\,400 = 23\\,400 \\text{ €}'}</MB>
                  <p>Der Median bleibt bei 2.550 €, denn die Geschäftsführung steht weiterhin ganz am Ende der geordneten Liste.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Der Median ändert sich nicht, wenn die Geschäftsführung mehr verdient. Welcher Mittelwert ist also das Ziel?</>,
                    <>Ziel-Mittelwert mal 8 ergibt die Gesamtsumme. Davon ziehst du die sieben anderen Gehälter ab.</>,
                    <>
                      <M>{'8 \\cdot 5\\,100 - 17\\,400'}</M>
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 3} titel="Ballon-Aufstieg">
            <BallonAufstieg />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt Ausreißer erkennen, entscheiden, ob Mittelwert oder Median das Typische besser beschreibt, und einen fehlenden Wert aus dem
              Mittelwert berechnen. Bei den Übungsaufgaben trainierst du das mit weiteren Datenreihen.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Kennwerte bewerten <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Kennwerte bewerten: Das Durchschnittsgehalt"
      width="wide"
      kompakt
      parent={{ to: '/daten-und-zufall/kennwerte-bewerten', label: 'Kennwerte bewerten' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={
          <>
            In dieser Lernsituation prüfst du die Stellenanzeige einer Firma. Du lernst, wann der Mittelwert täuscht, wie ein Ausreißer wirkt und
            wann der Median das Typische besser beschreibt.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Festlegung aus „Problem erkennen“ */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  if (!fest.fest || !fest.wahl) return null;
  const diff = Math.abs(fest.wert - MEDIAN);
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest festgelegt:</strong> {WAHL[fest.wahl]} Du hattest geschätzt, dass eine typische Person etwa {eur(fest.wert)} verdient.{' '}
        {fest.wahl === 'weniger' ? 'Das stimmt: ' : 'Tatsächlich: '}
        Der Median beträgt {eur(MEDIAN)}, der Mittelwert {eur(MITTEL)} wird durch den Ausreißer {eur(CHEF)} nach oben gezogen.{' '}
        {diff <= 300 ? 'Deine Schätzung war sehr nah dran.' : `Deine Schätzung lag ${eur(diff)} daneben.`} Ohne die Geschäftsführung ist der Mittelwert nur {eurCent(OHNE)}.
      </p>
    </div>
  );
}
