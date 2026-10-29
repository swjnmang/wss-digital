import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useSpielPunkte } from '../../../lineare_funktionen/lernsituation_kit/punkte';
import { mean, median, sorted } from '../../lernpfad/stats';

// Bonus-Spiel „Ballon-Aufstieg“ am Ende der Lernsituation „Das Durchschnittsgehalt“: Drei Ballons steigen langsam auf, jeder trägt einen
// Wert. Die SuS wählen den Ballon mit dem passenden Kennwert: das typische Gehalt (Median) oder das Gehalt bei gerechter Verteilung
// (Mittelwert). Die falschen Ballons zeigen typische Verwechslungen: Mittelwert statt Median (oder umgekehrt), Spannweite, größter Wert.
// Vier Runden, jede richtige Wahl bringt eine Münze. Bedienung: Ballon antippen oder Pfeiltasten, dann bestätigen (Enter).

type Art = 'median' | 'mittel' | 'spannweite' | 'max';
type Frage = 'typisch' | 'gerecht';
type Ballon = { wert: number; art: Art };
type Runde = { frage: Frage; daten: number[]; ballons: Ballon[] };
type Phase = 'start' | 'fahrt' | 'ergebnis' | 'ende';

const RUNDEN = 4;
const DAUER = 60; // Sekunden, bis die Ballons oben ankommen (ohne „Schneller“)
const SCHNELL = 4;
const X = [100, 280, 460];
const Y0 = 215;
const Y1 = 85;

const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const euro = (v: number) => `${v.toLocaleString('de-DE')} €`;

const NAME: Record<Art, string> = {
  median: 'der Median',
  mittel: 'der Mittelwert',
  spannweite: 'die Spannweite (größtes minus kleinstes Gehalt)',
  max: 'das größte Gehalt',
};
const WARUM: Record<Frage, Partial<Record<Art, string>>> = {
  typisch: {
    median: 'Der Median ist das mittlere Gehalt der geordneten Liste und bleibt vom Ausreißer unberührt.',
    mittel: 'Der Ausreißer zieht den Mittelwert nach oben. Er beschreibt hier kein typisches Gehalt.',
    spannweite: 'Die Spannweite zeigt nur, wie weit die Gehälter auseinanderliegen.',
  },
  gerecht: {
    mittel: 'Der Mittelwert verteilt die Gehaltssumme gleichmäßig auf alle.',
    median: 'Der Median ist das mittlere Gehalt, nicht der Betrag bei gleichmäßiger Verteilung der Summe.',
    max: 'Das größte Gehalt ist der Ausreißer und viel zu hoch.',
  },
};

function neueRunde(): Runde {
  for (;;) {
    const basis = Array.from({ length: 5 }, () => rnd(18, 30) * 100);
    const daten = [...basis, rnd(9, 15) * 1000];
    const s = sorted(daten);
    const md = median(daten);
    const mw = Math.round(mean(daten));
    const frage: Frage = Math.random() < 0.5 ? 'typisch' : 'gerecht';
    const spann = s[s.length - 1] - s[0];
    const ballons: Ballon[] =
      frage === 'typisch'
        ? [
            { wert: md, art: 'median' },
            { wert: mw, art: 'mittel' },
            { wert: spann, art: 'spannweite' },
          ]
        : [
            { wert: mw, art: 'mittel' },
            { wert: md, art: 'median' },
            { wert: s[s.length - 1], art: 'max' },
          ];
    if (new Set(ballons.map((b) => b.wert)).size < 3) continue;
    const richtig: Art = frage === 'typisch' ? 'median' : 'mittel';
    let mix = [...ballons].sort(() => Math.random() - 0.5);
    if (mix[0].art === richtig) mix = [mix[1], mix[0], mix[2]];
    return { frage, daten: basis.concat(daten[5]).sort(() => Math.random() - 0.5), ballons: mix };
  }
}

function Ballons({ ballons, pos, gewaehlt, ergebnis, richtig, onWahl }: { ballons: Ballon[]; pos: number; gewaehlt: number; ergebnis: boolean; richtig: Art; onWahl: (i: number) => void }) {
  const y = Y0 - pos * (Y0 - Y1);
  return (
    <svg className="gh-spiel-bild" viewBox="0 0 560 300" role="img" aria-label="Drei Ballons steigen auf, jeder trägt einen Euro-Betrag. Wähle den passenden Ballon.">
      <rect x="0" y="262" width="560" height="38" fill="var(--surface-sunken)" />
      {ballons.map((b, i) => {
        const gut = ergebnis && b.art === richtig;
        const schlecht = ergebnis && i === gewaehlt && b.art !== richtig;
        const fill = gut ? 'var(--correct)' : schlecht ? 'var(--wrong)' : i === gewaehlt ? 'var(--highlight)' : 'var(--primary)';
        return (
          <g key={i} onClick={() => !ergebnis && onWahl(i)} style={{ cursor: ergebnis ? 'default' : 'pointer' }} data-testid={`ballon-${i}`}>
            <path d={`M${X[i]} ${y + 62} Q${X[i] - 14} ${y + 120} ${X[i]} ${y + 160}`} fill="none" stroke="var(--ink)" strokeWidth="2" />
            <ellipse cx={X[i]} cy={y} rx="68" ry="64" fill={fill} stroke="var(--ink)" strokeWidth={i === gewaehlt ? 4 : 2} />
            <polygon points={`${X[i] - 8},${y + 62} ${X[i] + 8},${y + 62} ${X[i]},${y + 74}`} fill={fill} stroke="var(--ink)" strokeWidth="2" />
            <text x={X[i]} y={y + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill={i === gewaehlt && !ergebnis ? 'var(--ink)' : '#fff'}>
              {euro(b.wert)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function BallonAufstieg() {
  const [phase, setPhase] = useState<Phase>('start');
  const [runde, setRunde] = useState(0);
  const [aufgabe, setAufgabe] = useState<Runde>(neueRunde);
  const [gewaehlt, setGewaehlt] = useState(1);
  const [pos, setPos] = useState(0);
  const [schnell, setSchnell] = useState(false);
  const [muenzen, setMuenzen] = useState(0);
  const [gewonnen, setGewonnen] = useState<boolean | null>(null);
  const frame = useRef<number | undefined>(undefined);
  const letzte = useRef<number | undefined>(undefined);
  const meldeSpiel = useSpielPunkte();

  useEffect(() => {
    if (phase === 'ende') meldeSpiel(muenzen, RUNDEN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'fahrt') return;
    const tick = (t: number) => {
      const dt = letzte.current === undefined ? 0 : (t - letzte.current) / 1000;
      letzte.current = t;
      setPos((p) => Math.min(1, p + (dt * (schnell ? SCHNELL : 1)) / DAUER));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      letzte.current = undefined;
    };
  }, [phase, schnell]);

  const richtig: Art = aufgabe.frage === 'typisch' ? 'median' : 'mittel';

  // Ballons oben angekommen, ohne dass bestätigt wurde: keine Münze
  useEffect(() => {
    if (phase === 'fahrt' && pos >= 1) {
      setGewonnen(false);
      setPhase('ergebnis');
    }
  }, [pos, phase]);

  const starte = () => {
    setPos(0);
    setSchnell(false);
    setGewaehlt(1);
    setGewonnen(null);
    setPhase('fahrt');
  };
  const bestaetige = () => {
    if (phase !== 'fahrt') return;
    const ok = aufgabe.ballons[gewaehlt].art === richtig;
    if (ok) setMuenzen((m) => m + 1);
    setGewonnen(ok);
    setPhase('ergebnis');
  };
  const weiter = () => {
    if (runde + 1 >= RUNDEN) return setPhase('ende');
    setRunde(runde + 1);
    setAufgabe(neueRunde());
    starte();
  };
  const nochmal = () => {
    setRunde(0);
    setMuenzen(0);
    setAufgabe(neueRunde());
    setPos(0);
    setPhase('start');
  };
  const taste = (e: KeyboardEvent) => {
    if (phase !== 'fahrt') return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setGewaehlt((g) => Math.max(0, g - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setGewaehlt((g) => Math.min(2, g + 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      bestaetige();
    }
  };

  const frageText =
    aufgabe.frage === 'typisch'
      ? 'Welcher Ballon trägt das typische Gehalt der Firma?'
      : 'Alle Gehälter werden zusammengezählt und gleichmäßig auf alle verteilt. Welcher Ballon trägt das neue Gehalt für jeden?';

  return (
    <div className="gh-spiel" onKeyDown={taste} tabIndex={0} aria-label="Ballon-Aufstieg, wählen mit den Pfeiltasten und Enter" data-no-autocheck>
      <div className="gh-spiel-kopf">
        <span>
          {phase === 'start' ? 'Bereit?' : `Runde ${Math.min(runde + 1, RUNDEN)} von ${RUNDEN}`}
        </span>
        <span className="gh-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' gh-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>

      {phase === 'start' && (
        <>
          <p className="gh-frage">
            Eine Firma hat sechs Beschäftigte, einer verdient viel mehr als die anderen. Drei Ballons tragen drei verschiedene Werte: Wähle den
            Ballon mit dem passenden Kennwert. Du darfst mit dem Taschenrechner rechnen, die Ballons steigen nur langsam.
          </p>
          <div>
            <button type="button" className="bk-btn bk-btn-primary" onClick={starte}>
              <i className="fa-solid fa-play" aria-hidden="true" /> Spiel starten
            </button>
          </div>
        </>
      )}

      {phase !== 'start' && phase !== 'ende' && (
        <>
          <p className="gh-daten">Gehälter: {aufgabe.daten.map(euro).join(' · ')}</p>
          <p className="gh-frage">{frageText}</p>
          <Ballons ballons={aufgabe.ballons} pos={pos} gewaehlt={gewaehlt} ergebnis={phase === 'ergebnis'} richtig={richtig} onWahl={setGewaehlt} />
        </>
      )}

      {phase === 'fahrt' && (
        <div className="gh-steuer">
          <button type="button" className="bk-btn" onClick={() => setGewaehlt((g) => Math.max(0, g - 1))} aria-label="Ballon links wählen">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </button>
          <button type="button" className="bk-btn" onClick={() => setGewaehlt((g) => Math.min(2, g + 1))} aria-label="Ballon rechts wählen">
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
          <button type="button" className="bk-btn bk-btn-primary" onClick={bestaetige}>
            <i className="fa-solid fa-hand-pointer" aria-hidden="true" /> Das ist mein Ballon: {euro(aufgabe.ballons[gewaehlt].wert)}
          </button>
          <button type="button" className="bk-btn bk-btn-ghost" onClick={() => setSchnell((s) => !s)} aria-pressed={schnell}>
            Schneller steigen
          </button>
        </div>
      )}

      {phase === 'ergebnis' && (
        <>
          <p className="gh-frage" role="status">
            <strong>{gewonnen ? 'Richtig, eine Münze!' : pos >= 1 ? 'Zu spät, die Ballons sind weg.' : 'Leider falsch.'}</strong>
          </p>
          <ul className="gh-erklaerung">
            {aufgabe.ballons.map((b) => (
              <li key={b.art} className={b.art === richtig ? 'gh-ok' : 'gh-no'}>
                {euro(b.wert)}: {NAME[b.art][0].toUpperCase() + NAME[b.art].slice(1)}. {WARUM[aufgabe.frage][b.art]}
              </li>
            ))}
          </ul>
          <div>
            <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
              {runde + 1 >= RUNDEN ? 'Ergebnis ansehen' : 'Nächste Runde'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </>
      )}

      {phase === 'ende' && (
        <>
          <p className="gh-spiel-ende">
            <i className="fa-solid fa-trophy" aria-hidden="true" />
            {muenzen === RUNDEN
              ? 'Alle Ballons richtig gewählt, du bist Kennwert-Profi!'
              : muenzen >= 2
                ? `${muenzen} von ${RUNDEN} Münzen. Gut gemacht!`
                : `${muenzen} von ${RUNDEN} Münzen. Versuch es gleich noch einmal.`}
          </p>
          <div>
            <button type="button" className="bk-btn" onClick={nochmal}>
              <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
