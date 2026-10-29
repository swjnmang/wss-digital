import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useSpielPunkte } from '../../../lineare_funktionen/lernsituation_kit/punkte';
import './freiwurf.css';

// Bonus-Spiel „Korbwurf-Duell“ am Ende der Lernsituation „Das Freiwurf-Duell“: Eine Spielerin hat H von n Würfen getroffen.
// Über drei Körben stehen Trefferquoten. Die SuS rechnen die relative Häufigkeit in Prozent aus, wählen den Korb mit dem richtigen
// Wert und werfen den Ball. Vier Runden, jeder Treffer bringt eine Münze. Die falschen Körbe sind typische Fehler:
// Treffer als Prozent, Quote der Fehlwürfe, Kehrwert n : H.
// Bedienung: Tippen auf einen Korb bzw. Pfeiltasten links/rechts, dann „Werfen“. Ohne Zeitdruck.

type Fehler = 'richtig' | 'nurTreffer' | 'fehlwuerfe' | 'kehrwert';
type Korb = { prozent: number; art: Fehler };
type Aufgabe = { name: string; H: number; n: number; koerbe: Korb[] };
type Phase = 'start' | 'zielen' | 'flug' | 'ergebnis' | 'ende';

const RUNDEN = 4;
const NAMEN = ['Mia', 'Jonas', 'Lena', 'Ben', 'Aylin', 'Tom', 'Sara', 'Luis'];
const WURF_MS = 900;

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function neueAufgabe(vorher?: string): Aufgabe {
  for (;;) {
    const n = pick([20, 25, 50]);
    const H = rnd(Math.ceil(n * 0.2), Math.floor(n * 0.9));
    const h = (H / n) * 100;
    if (h === 50) continue;
    const korbe: Korb[] = [
      { prozent: h, art: 'richtig' },
      { prozent: H, art: 'nurTreffer' },
      { prozent: 100 - h, art: 'fehlwuerfe' },
      { prozent: Math.round((n / H) * 100), art: 'kehrwert' },
    ];
    if (new Set(korbe.map((k) => k.prozent)).size < 4) continue;
    // richtiger Korb plus zwei zufällige falsche, gemischt
    const falsche = korbe.slice(1).sort(() => Math.random() - 0.5).slice(0, 2);
    const name = pick(NAMEN.filter((x) => x !== vorher));
    return { name, H, n, koerbe: [korbe[0], ...falsche].sort(() => Math.random() - 0.5) };
  }
}

const ERKLAERUNG: Record<Fehler, string> = {
  richtig: 'Richtig gerechnet!',
  nurTreffer: 'Das ist nur die Zahl der Treffer H. Für die Quote musst du H durch die Zahl aller Würfe n teilen.',
  fehlwuerfe: 'Das ist die Quote der Fehlwürfe, also das Gegenteil. Gefragt ist die Quote der Treffer.',
  kehrwert: 'Hier wurde n : H gerechnet. Richtig ist die Treffer H geteilt durch alle Würfe n.',
};

const pct = (p: number) => `${p.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`;

// Position der drei Körbe im SVG (Mittelpunkt des Rings)
const KX = [150, 380, 610];
const KY = 96;
const BALL0 = { x: 380, y: 262 };

export default function KorbwurfSpiel() {
  const [phase, setPhase] = useState<Phase>('start');
  const [runde, setRunde] = useState(0);
  const [aufgabe, setAufgabe] = useState<Aufgabe>(() => neueAufgabe());
  const [wahl, setWahl] = useState(1);
  const [t, setT] = useState(0);
  const [muenzen, setMuenzen] = useState(0);
  const frame = useRef<number | undefined>(undefined);
  const meldeSpiel = useSpielPunkte();

  useEffect(() => {
    if (phase === 'ende') meldeSpiel(muenzen, RUNDEN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'flug') return;
    const reduziert = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduziert) {
      setT(1);
      setPhase('ergebnis');
      return;
    }
    let start: number | undefined;
    const tick = (now: number) => {
      start ??= now;
      const f = Math.min(1, (now - start) / WURF_MS);
      setT(f);
      if (f < 1) frame.current = requestAnimationFrame(tick);
      else setPhase('ergebnis');
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [phase]);

  const gewaehlt = aufgabe.koerbe[wahl];
  const treffer = gewaehlt.art === 'richtig';
  const richtig = aufgabe.koerbe.find((k) => k.art === 'richtig')!;

  const werfen = () => {
    setT(0);
    setPhase('flug');
  };
  const starte = () => {
    setWahl(1);
    setT(0);
    setPhase('zielen');
  };
  const weiter = () => {
    if (treffer) setMuenzen((m) => m + 1);
    if (runde + 1 >= RUNDEN) {
      setPhase('ende');
      return;
    }
    setRunde(runde + 1);
    setAufgabe(neueAufgabe(aufgabe.name));
    starte();
  };
  const nochmal = () => {
    setRunde(0);
    setMuenzen(0);
    setAufgabe(neueAufgabe());
    setPhase('start');
    setT(0);
  };
  const ziele = (i: number) => phase === 'zielen' && setWahl(Math.max(0, Math.min(2, i)));
  const taste = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      ziele(wahl - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      ziele(wahl + 1);
    } else if (e.key === 'Enter' && phase === 'zielen' && (e.target as HTMLElement).tagName !== 'BUTTON') {
      e.preventDefault();
      werfen();
    }
  };

  // Flugbahn: Parabel vom Startpunkt zum gewählten Korb
  const ziel = { x: KX[wahl], y: KY + 6 };
  const bx = BALL0.x + (ziel.x - BALL0.x) * t;
  const by = BALL0.y + (ziel.y - BALL0.y) * t - Math.sin(Math.PI * t) * 70;
  const zeigeBall = phase === 'flug' || phase === 'ergebnis';
  const ballX = zeigeBall ? bx : BALL0.x;
  const ballY = zeigeBall ? by : BALL0.y;

  return (
    <div className="fw-spiel" onKeyDown={taste} tabIndex={0} aria-label="Korbwurf-Duell, zielen mit den Pfeiltasten links und rechts" data-no-autocheck>
      <div className="fw-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : `Runde ${Math.min(runde + 1, RUNDEN)} von ${RUNDEN}`}</span>
        <span className="fw-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' fw-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Über jedem Korb steht eine Trefferquote. Rechne mit dem Taschenrechner die relative Häufigkeit der Treffer aus, tippe auf den
          Korb mit dem richtigen Wert und wirf den Ball. Für jeden Treffer bekommst du eine Münze.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <p className="fw-spiel-frage">
          {aufgabe.name} hat von <strong>{aufgabe.n}</strong> Freiwürfen <strong>{aufgabe.H}</strong> getroffen. Wie hoch ist die Trefferquote
          (relative Häufigkeit <span className="fw-h">h</span>)?
        </p>
      )}
      {phase !== 'ende' && (
        <svg viewBox="0 0 760 300" role="img" aria-label="Halle mit drei Körben, über jedem Korb steht eine Trefferquote. Unten liegt der Ball." className="fw-spiel-bild">
          <rect x="0" y="0" width="760" height="300" rx="12" fill="var(--surface-sunken)" />
          <rect x="0" y="270" width="760" height="30" fill="var(--primary-soft)" />
          <line x1="0" x2="760" y1="270" y2="270" stroke="var(--ink)" strokeWidth="2" />
          {KX.map((x, i) => {
            const k = aufgabe.koerbe[i];
            const an = i === wahl && phase !== 'start';
            const zeigRichtig = phase === 'ergebnis' && k.art === 'richtig';
            const zeigFalsch = phase === 'ergebnis' && i === wahl && !treffer;
            return (
              <g key={i}>
                <rect
                  x={x - 90}
                  y="8"
                  width="180"
                  height="190"
                  rx="14"
                  fill={zeigRichtig ? 'var(--correct-soft)' : zeigFalsch ? 'var(--wrong-soft)' : an ? 'var(--primary-soft)' : 'transparent'}
                  stroke={zeigRichtig ? 'var(--correct)' : zeigFalsch ? 'var(--wrong)' : an ? 'var(--primary)' : 'none'}
                  strokeWidth="3"
                />
                <rect x={x - 38} y="20" width="76" height="50" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
                <rect x={x - 16} y="40" width="32" height="22" fill="none" stroke="var(--ink)" strokeWidth="2" />
                <ellipse cx={x} cy={KY} rx="30" ry="8" fill="none" stroke="var(--highlight)" strokeWidth="5" />
                <path d={`M${x - 30} ${KY} L${x - 18} ${KY + 46} M${x - 15} ${KY + 4} L${x - 6} ${KY + 50} M${x} ${KY + 7} L${x} ${KY + 52} M${x + 15} ${KY + 4} L${x + 6} ${KY + 50} M${x + 30} ${KY} L${x + 18} ${KY + 46}`} stroke="var(--ink)" strokeWidth="1.5" fill="none" />
                <path d={`M${x - 26} ${KY + 18} Q${x} ${KY + 28} ${x + 26} ${KY + 18} M${x - 22} ${KY + 34} Q${x} ${KY + 44} ${x + 22} ${KY + 34}`} stroke="var(--ink)" strokeWidth="1.5" fill="none" />
                <text x={x} y="186" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)">
                  {phase === 'start' ? '? %' : pct(k.prozent)}
                </text>
                <rect
                  x={x - 90}
                  y="8"
                  width="180"
                  height="190"
                  fill="transparent"
                  style={{ cursor: phase === 'zielen' ? 'pointer' : 'default' }}
                  onClick={() => ziele(i)}
                />
              </g>
            );
          })}
          <g pointerEvents="none">
            <circle cx={ballX} cy={ballY} r="16" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
            <path d={`M${ballX - 16} ${ballY} H${ballX + 16} M${ballX} ${ballY - 16} V${ballY + 16}`} stroke="var(--ink)" strokeWidth="1.5" />
          </g>
        </svg>
      )}
      {phase === 'start' && (
        <div className="bk-actions">
          <button type="button" className="bk-btn bk-btn-primary" onClick={starte}>
            <i className="fa-solid fa-basketball" aria-hidden="true" /> Spiel starten
          </button>
        </div>
      )}
      {phase === 'zielen' && (
        <div className="bk-actions fw-steuer">
          {aufgabe.koerbe.map((k, i) => (
            <button
              key={i}
              type="button"
              className={`bk-btn${i === wahl ? ' bk-btn-primary' : ''}`}
              aria-pressed={i === wahl}
              onClick={() => ziele(i)}
            >
              Korb {i + 1}: {pct(k.prozent)}
            </button>
          ))}
          <button type="button" className="bk-btn bk-btn-primary fw-werfen" onClick={werfen}>
            <i className="fa-solid fa-basketball" aria-hidden="true" /> Werfen
          </button>
        </div>
      )}
      {phase === 'ergebnis' && (
        <>
          <div className={`bk-feedback lp-feedback ${treffer ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${treffer ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {treffer ? 'Treffer! Münze eingesammelt. ' : `Daneben. ${ERKLAERUNG[gewaehlt.art]} `}
              Richtig ist {pct(richtig.prozent)}: {aufgabe.H} : {aufgabe.n} = {(aufgabe.H / aufgabe.n).toLocaleString('de-DE')} ={' '}
              {pct(richtig.prozent)}.
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
          <p className="fw-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-basketball'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN} Körben
            getroffen.{' '}
            {muenzen === RUNDEN
              ? 'Perfekt, du bist ein Profi bei der relativen Häufigkeit!'
              : muenzen >= 3
                ? 'Stark, fast alles getroffen!'
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
