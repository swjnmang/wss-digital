import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { euro } from '../zins_kit/zins_kit';

// Bonus-Spiel „Vereinsbus-Rallye“ am Ende der Lernsituation „Der Vereinsbus“: Der Bus fährt auf drei Spuren auf Schilder mit
// Kontoständen zu. Die SuS lenken ihn auf die Spur mit dem richtigen Endwert des Sparplans. Fünf Runden, jede richtige Spur bringt
// eine Münze. Die falschen Schilder sind typische Fehler: anderer Einzahlungstermin, ohne Zinsen, alles n Jahre verzinst.
// Bedienung: Tippen auf eine Spur, Knöpfe hoch/runter oder Pfeiltasten. „Vollgas“ beendet die Fahrt sofort.

type Termin = 'vor' | 'nach';
type Fehler = 'richtig' | 'termin' | 'ohneZinsen' | 'allesVerzinst';
type Schild = { wert: number; art: Fehler };
type Aufgabe = { r: number; n: number; p: number; termin: Termin; schilder: Schild[] };
type Phase = 'start' | 'fahrt' | 'ergebnis' | 'ende';

const RUNDEN = 5;
const DAUER = 45; // Sekunden für eine Fahrt ohne Vollgas
const VOLLGAS = 1.2;
const SPUR_Y = [20, 110, 200];
const SPUR_H = 90;
const BUS_X0 = 20;
const BUS_X1 = 470;

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

const endwert = (r: number, n: number, p: number, termin: Termin) => {
  const q = 1 + p / 100;
  return r * (termin === 'vor' ? q : 1) * ((q ** n - 1) / (q - 1));
};

function neueAufgabe(): Aufgabe {
  for (;;) {
    const r = pick([500, 800, 1000, 1500, 2000]);
    const n = pick([2, 3, 4, 5]);
    const p = pick([1, 2, 3, 4]);
    const termin = pick(['vor', 'nach'] as const);
    const q = 1 + p / 100;
    const schilder: Schild[] = [
      { wert: endwert(r, n, p, termin), art: 'richtig' },
      { wert: endwert(r, n, p, termin === 'vor' ? 'nach' : 'vor'), art: 'termin' },
      Math.random() < 0.5 ? { wert: n * r, art: 'ohneZinsen' } : { wert: n * r * q ** n, art: 'allesVerzinst' },
    ];
    const werte = schilder.map((s) => Math.round(s.wert * 100));
    if (new Set(werte).size < 3) continue;
    return { r, n, p, termin, schilder: schilder.sort(() => Math.random() - 0.5) };
  }
}

const ERKLAERUNG: Record<Fehler, string> = {
  richtig: 'Richtig gerechnet!',
  termin: 'Das wäre der Kontostand beim anderen Einzahlungstermin. Am Jahresanfang kommt der Faktor q dazu, am Jahresende nicht.',
  ohneZinsen: 'Das sind nur die Einzahlungen ohne Zinsen.',
  allesVerzinst: 'Hier wurden alle Raten n Jahre lang verzinst. Die späteren Raten liegen aber kürzer auf dem Konto.',
};

/** Der Bus von der Seite, Blick nach rechts */
function Bus() {
  return (
    <g>
      <path d="M0 62 L0 12 Q0 4 8 4 L80 4 Q92 4 98 16 L110 40 Q112 44 112 50 L112 62 Z" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      {[10, 34, 58].map((x) => (
        <rect key={x} x={x} y="12" width="18" height="18" rx="3" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="1.5" />
      ))}
      <path d="M82 12 L92 12 L104 34 L82 34 Z" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="24" cy="64" r="11" fill="var(--ink)" />
      <circle cx="24" cy="64" r="4" fill="var(--surface)" />
      <circle cx="90" cy="64" r="11" fill="var(--ink)" />
      <circle cx="90" cy="64" r="4" fill="var(--surface)" />
    </g>
  );
}

export default function BusRallye() {
  const [phase, setPhase] = useState<Phase>('start');
  const [runde, setRunde] = useState(0);
  const [aufgabe, setAufgabe] = useState<Aufgabe>(neueAufgabe);
  const [spur, setSpur] = useState(1);
  const [pos, setPos] = useState(0);
  const [muenzen, setMuenzen] = useState(0);
  const [vollgas, setVollgas] = useState(false);
  const frame = useRef<number | undefined>(undefined);
  const letzte = useRef<number | undefined>(undefined);
  const spurRef = useRef(spur);
  spurRef.current = spur;

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
    setAufgabe(neueAufgabe());
    starte();
  };
  const nochmal = () => {
    setRunde(0);
    setMuenzen(0);
    setAufgabe(neueAufgabe());
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
  const busX = BUS_X0 + pos * (BUS_X1 - BUS_X0);

  return (
    <div className="rr-spiel" onKeyDown={taste} tabIndex={0} aria-label="Vereinsbus-Rallye, lenken mit den Pfeiltasten" data-no-autocheck>
      <div className="rr-spiel-kopf">
        <span>
          {phase === 'ende' ? 'Geschafft!' : `Runde ${runde + 1} von ${RUNDEN}`}
        </span>
        <span className="rr-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' rr-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Der Vereinsbus fährt auf drei Schilder mit Kontoständen zu. Rechne mit dem Taschenrechner und lenke den Bus auf die Spur mit dem
          richtigen Kontostand. Tippe dazu auf eine Spur oder nutze die Pfeile. Für jede richtige Spur bekommst du eine Münze.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <p className="rr-spiel-frage">
          {aufgabe.n} Jahre lang jedes Jahr <strong>{aufgabe.r.toLocaleString('de-DE')} €</strong> am{' '}
          <strong>{aufgabe.termin === 'vor' ? 'Jahresanfang' : 'Jahresende'}</strong>, Zinssatz {aufgabe.p}&nbsp;% p.a. Wie hoch ist der
          Kontostand nach {aufgabe.n} Jahren?
        </p>
      )}
      {phase !== 'ende' && (
        <svg viewBox="0 0 760 310" role="img" aria-label="Straße mit drei Spuren. Am Ende jeder Spur steht ein Schild mit einem Kontostand." className="rr-spiel-bild">
          <rect x="0" y="10" width="760" height="290" rx="12" fill="var(--surface-sunken)" />
          {[110, 200].map((y) => (
            <line key={y} x1="10" x2="590" y1={y} y2={y} stroke="var(--line-strong)" strokeWidth="3" strokeDasharray="18 14" />
          ))}
          {SPUR_Y.map((y, i) => (
            <g key={i}>
              <rect x="600" y={y + 12} width="150" height={SPUR_H - 24} rx="10" fill={phase === 'ergebnis' && i === richtigeSpur ? 'var(--correct-soft)' : 'var(--surface)'} stroke={phase === 'ergebnis' && i === richtigeSpur ? 'var(--correct)' : 'var(--ink)'} strokeWidth="2" />
              <text x="675" y={y + SPUR_H / 2 + 7} textAnchor="middle" fontSize="21" fontWeight="800" fill="var(--ink)">
                {phase === 'start' ? '? €' : euro(aufgabe.schilder[i].wert)}
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
          <g style={{ transform: `translate(${busX}px, 0)` }} pointerEvents="none">
            <g style={{ transform: `translate(0, ${SPUR_Y[spur] + 6}px)`, transition: 'transform 0.25s ease' }}>
              <Bus />
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
        <div className="bk-actions rr-steuer">
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
              Richtig ist {euro(aufgabe.schilder[richtigeSpur].wert)}.
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
          <p className="rr-spiel-ende">
            <i className={`fa-solid ${muenzen >= 4 ? 'fa-trophy' : 'fa-van-shuttle'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN}{' '}
            Münzen eingesammelt.{' '}
            {muenzen === RUNDEN
              ? 'Perfekt, der Vereinsbus ist voll bezahlt!'
              : muenzen >= 4
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
