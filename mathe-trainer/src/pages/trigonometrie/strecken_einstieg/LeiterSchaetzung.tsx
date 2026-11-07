import { useEffect, useId, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte';
import { parseFlexibleNumber } from '../../../utils/parseFlexibleNumber';

// Problem erkennen: Leiter ausfahren. Das Fenster liegt 26 m über dem Drehpunkt, die Leiter steht immer unter 70°. Die SuS tippen eine
// Leiterlänge ein; das Fahrzeug fährt so weit an die Wand, dass die Spitze an der Fassade anliegt, und die Skizze zeigt, ob die Spitze
// unter, über oder genau am Fenster ankommt. Auf 5 cm genau trifft man die Länge durch Probieren kaum. Freigabe nach drei Versuchen
// oder einem Treffer.

export const FENSTER = 26;
export const WINKEL = 70;
const rad = (WINKEL * Math.PI) / 180;
/** gesuchte Leiterlänge: Fensterhöhe geteilt durch sin(70°) */
export const LEITER = FENSTER / Math.sin(rad);
/** Abstand des Drehpunkts von der Hauswand bei dieser Leiterlänge */
export const ABSTAND = LEITER * Math.cos(rad);
export const MAX_LEITER = 30;
export const istTreffer = (l: number) => Math.abs(l - LEITER) <= 0.05;
const zahl = (x: number, d = 2) => x.toLocaleString('de-DE', { maximumFractionDigits: d });

function Skizze({ versuche }: { versuche: number[] }) {
  const W = 560;
  const H = 410;
  const s = 11.5; // Pixel pro Meter
  const boden = H - 50;
  const wandX = 330; // Hausfassade (fest)
  const y = (h: number) => boden - h * s;
  const letzte = versuche[versuche.length - 1];
  const tusche = 'var(--co-tusche, #141414)';
  // Das Fahrzeug steht so, dass die Spitze an der Fassade anliegt: Drehpunkt um L · cos(70°) vor der Wand
  const L = letzte !== undefined ? Math.min(letzte, 34) : null;
  const D: [number, number] | null = L !== null ? [wandX - L * Math.cos(rad) * s, boden] : null;
  const spitzeY = L !== null ? y(L * Math.sin(rad)) : 0;
  const treffer = letzte !== undefined && istTreffer(letzte);
  const farbe = treffer ? 'var(--correct)' : 'var(--primary)';
  const r = 40;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      className="dl-skizze"
      aria-label={`Skizze: Hauswand mit dem Fenster 26 Meter über dem Drehpunkt. ${
        letzte !== undefined
          ? `Deine Leiter ist ${zahl(letzte)} Meter lang und um 70 Grad aufgerichtet. Ihre Spitze liegt ${
              treffer ? 'genau am Fenster' : letzte < LEITER ? 'unter dem Fenster' : 'über dem Fenster'
            }.`
          : 'Noch keine Leiter ausgefahren.'
      }`}
    >
      {/* Hauswand; das Fenster sitzt direkt an der Fassade, wo die Leiter anliegt */}
      <rect x={wandX} y={12} width={W - wandX - 10} height={boden - 12 + 30} fill="var(--primary-soft)" stroke={tusche} strokeWidth="4" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={wandX + 110} y={boden - 30 - i * 44} width="44" height="26" fill="#fff" stroke={tusche} strokeWidth="3" />
      ))}
      <rect x={wandX + 2} y={y(FENSTER) - 18} width="56" height="36" fill="#f5c400" stroke={tusche} strokeWidth="3" />
      <line x1={wandX + 58} y1={y(FENSTER)} x2={W - 10} y2={y(FENSTER)} stroke={tusche} strokeWidth="2" strokeDasharray="6 6" />
      <text x={wandX + 68} y={y(FENSTER) - 8} fontSize="20" fontWeight="700" fill={tusche}>
        Fenster 26 m
      </text>
      {/* Boden */}
      <line x1="0" y1={boden + 30} x2={W} y2={boden + 30} stroke={tusche} strokeWidth="4" />
      {D === null ? (
        <text x={wandX / 2} y={boden - 40} textAnchor="middle" fontSize="19" fill="var(--ink-muted)">
          Gib eine Leiterlänge ein.
        </text>
      ) : (
        <>
          {/* frühere Versuche blass: nur die Höhe der Spitze an der Wand */}
          {versuche.slice(0, -1).map((v, i) => {
            const h = Math.min(v, 34) * Math.sin(rad);
            return <circle key={i} cx={wandX} cy={y(h)} r="6" fill="#9aa3ab" opacity=".7" />;
          })}
          <rect x={D[0] - 140} y={D[1] - 6} width="170" height="30" rx="6" fill="var(--primary)" stroke={tusche} strokeWidth="4" />
          <path
            d={`M${D[0]} ${D[1]} L${D[0] + r} ${D[1]} A${r} ${r} 0 0 0 ${D[0] + r * Math.cos(rad)} ${D[1] - r * Math.sin(rad)} Z`}
            fill="#f5c400"
            fillOpacity=".6"
            stroke={tusche}
            strokeWidth="2.5"
          />
          <text x={D[0] + r + 6} y={D[1] - 10} fontSize="20" fontWeight="700" fill={tusche}>
            70°
          </text>
          <line x1={D[0]} y1={D[1]} x2={wandX} y2={spitzeY} stroke={tusche} strokeWidth="12" strokeLinecap="round" />
          <line x1={D[0]} y1={D[1]} x2={wandX} y2={spitzeY} stroke={treffer ? '#bfe8cc' : '#e9e3d2'} strokeWidth="6" strokeLinecap="round" strokeDasharray="4 10" />
          <circle cx={wandX} cy={spitzeY} r="7" fill={farbe} stroke={tusche} strokeWidth="2" />
          <text x={(D[0] + wandX) / 2 - 22} y={(D[1] + spitzeY) / 2} textAnchor="end" fontSize="21" fontWeight="700" fill={farbe}>
            Leiter {zahl(letzte!)} m
          </text>
          <circle cx={D[0]} cy={D[1]} r="6" fill="#fff" stroke={tusche} strokeWidth="3" />
        </>
      )}
    </svg>
  );
}

export default function LeiterSchaetzung({ versuche, onAusfahren }: { versuche: number[]; onAusfahren: (l: number) => void }) {
  const uid = useId();
  const [eingabe, setEingabe] = useState('');
  const [fehler, setFehler] = useState<string | null>(null);
  const treffer = versuche.some(istTreffer);
  const frei = versuche.length >= 3 || treffer;
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false });
  useEffect(() => {
    if (frei) pt.geloest();
  }, [frei, pt]);

  const ausfahren = () => {
    const l = parseFlexibleNumber(eingabe.replace(/m/i, '').trim());
    if (!Number.isFinite(l)) return setFehler('Gib eine Länge in Metern ein, z. B. 25 oder 27,5.');
    if (l <= 0) return setFehler('Die Leiter muss ein Stück ausgefahren werden.');
    if (l > MAX_LEITER) return setFehler('Die Drehleiter lässt sich höchstens 30 m weit ausfahren.');
    setFehler(null);
    onAusfahren(l);
  };
  const enter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') ausfahren();
  };
  const letzte = versuche[versuche.length - 1];

  return (
    <div className="dl-labor" data-no-autocheck>
      <div className="bk-graph dl-rahmen">
        <Skizze versuche={versuche} />
      </div>
      <div className="dl-eingabe">
        <label htmlFor={`${uid}-l`}>Leiter ausfahren auf</label>
        <input
          id={`${uid}-l`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="bk-input lp-input lp-input-sm"
          value={eingabe}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe(e.target.value)}
          onKeyDown={enter}
        />
        <span>m</span>
        <button type="button" className="bk-btn bk-btn-primary" onClick={ausfahren}>
          <i className="fa-solid fa-arrows-up-to-line" aria-hidden="true" /> Leiter ausfahren
        </button>
      </div>
      {fehler && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> {fehler}
        </div>
      )}
      {letzte !== undefined && (
        <p className={`dl-anzeige ${istTreffer(letzte) ? 'dl-anzeige-ok' : ''}`} role="status">
          <i className="fa-solid fa-tower-broadcast" aria-hidden="true" />
          <span>
            <strong>Gruppenführer, Versuch {versuche.length}:</strong>{' '}
            {istTreffer(letzte)
              ? `„${zahl(letzte)} m, die Spitze liegt genau am Fenster. Treffer!“`
              : letzte < LEITER
                ? `„Mit ${zahl(letzte)} m bleibt die Spitze unter dem Fenster. Ich brauche die Länge auf 5 cm genau.“`
                : `„Mit ${zahl(letzte)} m liegt die Spitze über dem Fenster. Ich brauche die Länge auf 5 cm genau.“`}
          </span>
        </p>
      )}
      {frei && (
        <p className="sl-hinweis">
          {treffer ? 'Treffer! Für das nächste Fenster müsstest du aber wieder lange probieren. ' : 'Auf 5 cm genau triffst du die Länge durch Probieren kaum. '}
          Mit dem Satz des Pythagoras kommst du auch nicht weiter: Du kennst nur eine Seite des Dreiecks, die Höhe von 26 m. Dafür kennst du den
          Winkel. Gleich lernst du, wie du mit dem Sinus aus einer Seite und einem Winkel die Länge der Leiter berechnest.
        </p>
      )}
    </div>
  );
}
