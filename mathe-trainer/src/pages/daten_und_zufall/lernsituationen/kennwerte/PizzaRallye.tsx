import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useSpielPunkte } from '../../../lineare_funktionen/lernsituation_kit/punkte';
import { fmt, pick, rnd, shuffle } from '../../lernpfad/kit';
import { median, modes, sorted } from '../../lernpfad/stats';
import './pizzabote.css';

// Bonus-Spiel „Pizza-Rallye“ am Ende der Lernsituation „Der Pizzabote“: Der Roller des Pizzaboten fährt auf drei Spuren auf Schilder zu.
// In jeder Runde steht eine kurze Datenreihe (Lieferzeiten) und ein Kennwert (Spannweite, Modalwert, Median, Mittelwert). Die SuS
// lenken den Roller auf die Spur mit dem richtigen Wert. Vier Runden, jede richtige Spur bringt eine Münze. Die falschen Schilder
// sind typische Fehler (größter Wert statt Spannweite, Häufigkeit statt Modalwert, Mitte der ungeordneten Liste, nur die Summe …).
// Bedienung: Tippen auf eine Spur, Knöpfe hoch/runter oder Pfeiltasten. „Vollgas“ beendet die Fahrt sofort.

type Kennwert = 'spannweite' | 'modalwert' | 'median' | 'mittelwert';
type Art =
  | 'richtig'
  | 'groessterWert'
  | 'mitteMinMax'
  | 'haeufigkeit'
  | 'medianStattModal'
  | 'mittelStattMedian'
  | 'unsortiert'
  | 'medianStattMittel'
  | 'summe';
type Schild = { wert: number; art: Art };
type Aufgabe = { kennwert: Kennwert; daten: number[]; schilder: Schild[] };
type Phase = 'start' | 'fahrt' | 'ergebnis' | 'ende';

const RUNDEN = 4;
const DAUER = 60; // Sekunden für eine Fahrt ohne Vollgas
const VOLLGAS = 1.2;
const SPUR_Y = [20, 110, 200];
const SPUR_H = 90;
const X0 = 20;
const X1 = 470;

const NAME: Record<Kennwert, string> = {
  spannweite: 'die Spannweite',
  modalwert: 'der Modalwert',
  median: 'der Median',
  mittelwert: 'das arithmetische Mittel',
};

const ERKLAERUNG: Record<Art, string> = {
  richtig: 'Richtig gerechnet!',
  groessterWert: 'Das ist nur der größte Wert. Die Spannweite ist größter Wert minus kleinster Wert.',
  mitteMinMax: 'Das ist die Mitte aus kleinstem und größtem Wert. Für die Spannweite rechnest du größter Wert minus kleinster Wert.',
  haeufigkeit: 'Das ist die Häufigkeit. Der Modalwert ist der Wert selbst, der am häufigsten vorkommt.',
  medianStattModal: 'Das ist der Median. Der Modalwert ist der Wert, der am häufigsten vorkommt.',
  mittelStattMedian: 'Das ist das arithmetische Mittel. Der Median ist der mittlere Wert der geordneten Liste.',
  unsortiert: 'Hier wurde die Mitte der ungeordneten Liste genommen. Ordne die Werte erst der Größe nach.',
  medianStattMittel: 'Das ist der Median. Für das arithmetische Mittel addierst du alle Werte und teilst durch die Anzahl.',
  summe: 'Das ist nur die Summe. Teile sie noch durch die Anzahl der Werte.',
};

const ARTEN: Record<Kennwert, [Art, Art]> = {
  spannweite: ['groessterWert', 'mitteMinMax'],
  modalwert: ['haeufigkeit', 'medianStattModal'],
  median: ['mittelStattMedian', 'unsortiert'],
  mittelwert: ['medianStattMittel', 'summe'],
};

function neueAufgabe(kennwert: Kennwert): Aufgabe {
  for (let versuch = 0; versuch < 5000; versuch++) {
    const n = pick([5, 6, 7]);
    const daten = Array.from({ length: n }, () => rnd(12, 40));
    daten[rnd(1, n - 1)] = daten[0];
    if (modes(daten).length !== 1) continue;
    const summe = daten.reduce((s, x) => s + x, 0);
    if (summe % n !== 0) continue;
    const s = sorted(daten);
    const mod = modes(daten)[0];
    const werte: Record<Art, number> = {
      richtig: 0,
      groessterWert: s[n - 1],
      mitteMinMax: (s[0] + s[n - 1]) / 2,
      haeufigkeit: daten.filter((x) => x === mod).length,
      medianStattModal: median(daten),
      mittelStattMedian: summe / n,
      unsortiert: n % 2 ? daten[(n - 1) / 2] : (daten[n / 2 - 1] + daten[n / 2]) / 2,
      medianStattMittel: median(daten),
      summe,
    };
    werte.richtig = { spannweite: s[n - 1] - s[0], modalwert: mod, median: median(daten), mittelwert: summe / n }[kennwert];
    const [f1, f2] = ARTEN[kennwert];
    const schilder: Schild[] = [
      { wert: werte.richtig, art: 'richtig' },
      { wert: werte[f1], art: f1 },
      { wert: werte[f2], art: f2 },
    ];
    if (new Set(schilder.map((x) => x.wert)).size < 3) continue;
    return { kennwert, daten, schilder: shuffle(schilder) };
  }
  throw new Error('Keine Spielaufgabe gefunden');
}

/** Der Lieferroller mit Pizzakarton von der Seite, Blick nach rechts */
function Roller() {
  return (
    <g>
      <rect x="0" y="14" width="40" height="30" rx="3" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="20" cy="29" r="9" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" />
      <path d="M40 46 L40 38 Q40 30 48 30 L78 30 L86 14 L94 14" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 56 L8 46 Q8 42 14 42 L80 42 Q90 42 92 52 L92 56 Z" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="22" cy="60" r="11" fill="var(--ink)" />
      <circle cx="22" cy="60" r="4" fill="var(--surface)" />
      <circle cx="82" cy="60" r="11" fill="var(--ink)" />
      <circle cx="82" cy="60" r="4" fill="var(--surface)" />
    </g>
  );
}

export default function PizzaRallye() {
  const [phase, setPhase] = useState<Phase>('start');
  const [reihenfolge, setReihenfolge] = useState<Kennwert[]>(() => shuffle<Kennwert>(['spannweite', 'modalwert', 'median', 'mittelwert']));
  const [runde, setRunde] = useState(0);
  const [aufgabe, setAufgabe] = useState<Aufgabe>(() => neueAufgabe(reihenfolge[0]));
  const [spur, setSpur] = useState(1);
  const [pos, setPos] = useState(0);
  const [muenzen, setMuenzen] = useState(0);
  const [vollgas, setVollgas] = useState(false);
  const frame = useRef<number | undefined>(undefined);
  const letzte = useRef<number | undefined>(undefined);
  const spurRef = useRef(spur);
  spurRef.current = spur;
  const meldeSpiel = useSpielPunkte();

  // Am Ende das Ergebnis an die Punkte melden (nur das beste Ergebnis zählt)
  useEffect(() => {
    if (phase === 'ende') meldeSpiel(muenzen, RUNDEN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'fahrt') return;
    const tick = (t: number) => {
      const dt = letzte.current === undefined ? 0 : (t - letzte.current) / 1000;
      letzte.current = t;
      setPos((p) => Math.min(1, p + dt / (vollgas ? VOLLGAS : DAUER)));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      letzte.current = undefined;
    };
  }, [phase, vollgas]);

  useEffect(() => {
    if (phase !== 'fahrt' || pos < 1) return;
    if (aufgabe.schilder[spurRef.current].art === 'richtig') setMuenzen((m) => m + 1);
    setPhase('ergebnis');
  }, [pos, phase, aufgabe]);

  const starte = () => {
    setPos(0);
    setVollgas(false);
    setSpur(1);
    setPhase('fahrt');
  };
  const weiter = () => {
    if (runde + 1 >= RUNDEN) return setPhase('ende');
    setRunde(runde + 1);
    setAufgabe(neueAufgabe(reihenfolge[runde + 1]));
    starte();
  };
  const nochmal = () => {
    const neu = shuffle<Kennwert>(['spannweite', 'modalwert', 'median', 'mittelwert']);
    setReihenfolge(neu);
    setRunde(0);
    setMuenzen(0);
    setAufgabe(neueAufgabe(neu[0]));
    setPhase('start');
    setPos(0);
  };
  const lenke = (s: number) => phase === 'fahrt' && setSpur(Math.max(0, Math.min(2, s)));
  const taste = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      lenke(spur - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      lenke(spur + 1);
    }
  };

  const richtigeSpur = aufgabe.schilder.findIndex((s) => s.art === 'richtig');
  const gewaehlt = aufgabe.schilder[spur];
  const x = X0 + pos * (X1 - X0);

  return (
    <div className="pb-spiel" onKeyDown={taste} tabIndex={0} aria-label="Pizza-Rallye, lenken mit den Pfeiltasten" data-no-autocheck>
      <div className="pb-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : `Runde ${runde + 1} von ${RUNDEN}`}</span>
        <span className="pb-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' pb-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Du fährst als Pizzabote durch die Stadt. Am Ende der Straße hängen drei Schilder. Rechne den gefragten Kennwert aus der Datenreihe
          aus (Taschenrechner erlaubt) und lenke den Roller auf die Spur mit dem richtigen Schild. Tippe dazu auf eine Spur oder nutze die
          Pfeile. Für jede richtige Spur bekommst du eine Münze.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <p className="pb-spiel-frage">
          Lieferzeiten in Minuten: <strong>{aufgabe.daten.join(', ')}</strong>. Wie groß ist {NAME[aufgabe.kennwert]}?
        </p>
      )}
      {phase !== 'ende' && (
        <svg
          viewBox="0 0 760 310"
          role="img"
          aria-label="Straße mit drei Spuren. Am Ende jeder Spur hängt ein Schild mit einer Zahl in Minuten."
          className="pb-spiel-bild"
        >
          <rect x="0" y="10" width="760" height="290" rx="12" fill="var(--surface-sunken)" />
          {[110, 200].map((y) => (
            <line key={y} x1="10" x2="590" y1={y} y2={y} stroke="var(--line-strong)" strokeWidth="3" strokeDasharray="18 14" />
          ))}
          {SPUR_Y.map((y, i) => (
            <g key={i}>
              <rect
                x="600"
                y={y + 12}
                width="150"
                height={SPUR_H - 24}
                rx="10"
                fill={phase === 'ergebnis' && i === richtigeSpur ? 'var(--correct-soft)' : 'var(--surface)'}
                stroke={phase === 'ergebnis' && i === richtigeSpur ? 'var(--correct)' : 'var(--ink)'}
                strokeWidth="2"
              />
              <text x="675" y={y + SPUR_H / 2 + 7} textAnchor="middle" fontSize="21" fontWeight="800" fill="var(--ink)">
                {phase === 'start' ? '? min' : `${fmt(aufgabe.schilder[i].wert, 2)} min`}
              </text>
              <rect
                x="0"
                y={y}
                width="760"
                height={SPUR_H}
                fill="transparent"
                style={{ cursor: phase === 'fahrt' ? 'pointer' : 'default' }}
                onClick={() => lenke(i)}
              />
            </g>
          ))}
          <g style={{ transform: `translate(${x}px, 0)` }} pointerEvents="none">
            <g style={{ transform: `translate(0, ${SPUR_Y[spur] + 6}px)`, transition: 'transform 0.25s ease' }}>
              <Roller />
            </g>
          </g>
        </svg>
      )}
      {phase === 'start' && (
        <div className="bk-actions">
          <button type="button" className="bk-btn bk-btn-primary" onClick={starte}>
            <i className="fa-solid fa-flag-checkered" aria-hidden="true" /> Losfahren
          </button>
        </div>
      )}
      {phase === 'fahrt' && (
        <div className="bk-actions pb-steuer">
          <button type="button" className="bk-btn" onClick={() => lenke(spur - 1)} disabled={spur === 0} aria-label="Spur nach oben">
            <i className="fa-solid fa-arrow-up" aria-hidden="true" /> Hoch
          </button>
          <button type="button" className="bk-btn" onClick={() => lenke(spur + 1)} disabled={spur === 2} aria-label="Spur nach unten">
            <i className="fa-solid fa-arrow-down" aria-hidden="true" /> Runter
          </button>
          <button type="button" className="bk-btn bk-btn-primary" onClick={() => setVollgas(true)}>
            <i className="fa-solid fa-gauge-high" aria-hidden="true" /> Vollgas
          </button>
        </div>
      )}
      {phase === 'ergebnis' && (
        <>
          <div className={`bk-feedback lp-feedback ${gewaehlt.art === 'richtig' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${gewaehlt.art === 'richtig' ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {gewaehlt.art === 'richtig' ? 'Münze eingesammelt! ' : `Leider falsch. ${ERKLAERUNG[gewaehlt.art]} `}
              Richtig ist {fmt(aufgabe.schilder[richtigeSpur].wert, 2)} min.
            </span>
          </div>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
              {runde + 1 >= RUNDEN ? 'Zum Ergebnis' : 'Nächste Runde'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
      {phase === 'ende' && (
        <>
          <p className="pb-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-pizza-slice'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN}{' '}
            Münzen eingesammelt.{' '}
            {muenzen === RUNDEN
              ? 'Perfekt, alle Pizzen sind pünktlich da!'
              : muenzen >= 3
                ? 'Stark, fast alles richtig!'
                : 'Probier es noch einmal, du schaffst mehr!'}
          </p>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={nochmal}>
              <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
