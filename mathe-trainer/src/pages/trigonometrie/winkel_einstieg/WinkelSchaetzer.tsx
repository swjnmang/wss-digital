import { useEffect, useId, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { M } from '../../daten_und_zufall/lernpfad/kit';
import { PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte';
import { parseFlexibleNumber } from '../../../utils/parseFlexibleNumber';

// Problem erkennen: Winkel-Labor am Balkonkraftwerk. Das Modul ist 1,72 m lang, die Stütze 0,80 m hoch. Die SuS schätzen den
// Neigungswinkel; das Labor legt ihre Schätzung als gestrichelte Linie über das Modul (frühere Versuche blass). Auf ein halbes Grad genau
// trifft man durch Schätzen kaum. Freigabe nach drei Schätzungen oder einem Treffer.

export const MODUL = 1.72;
export const STUETZE = 0.8;
export const WINKEL = (Math.asin(STUETZE / MODUL) * 180) / Math.PI;
export const istTreffer = (g: number) => Math.abs(g - WINKEL) <= 0.5;
const zahl = (x: number, d = 1) => x.toLocaleString('de-DE', { maximumFractionDigits: d });
const rad = (g: number) => (g * Math.PI) / 180;

function Labor({ schaetzungen }: { schaetzungen: number[] }) {
  const W = 640;
  const H = 330;
  const s = 240; // Pixel pro Meter
  const A: [number, number] = [60, H - 70];
  const len = MODUL * s;
  const top: [number, number] = [A[0] + len * Math.cos(rad(WINKEL)), A[1] - len * Math.sin(rad(WINKEL))];
  const letzte = schaetzungen[schaetzungen.length - 1];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      className="bkw-labor-bild"
      aria-label={`Seitenansicht: Solarmodul 1,72 Meter lang auf dem Garagendach, hinten von einer 0,80 Meter hohen Stütze gehalten. Der Neigungswinkel Alpha ist gesucht.${
        letzte !== undefined ? ` Deine letzte Schätzung ${zahl(letzte)} Grad ist als gestrichelte Linie eingezeichnet.` : ''
      }`}
    >
      {/* Garagendach */}
      <rect x="20" y={A[1]} width={W - 40} height="34" rx="6" fill="#cfd8de" stroke="var(--di-tinte, #22313d)" strokeWidth="2.5" />
      {/* Stütze */}
      <rect x={top[0] - 7} y={top[1]} width="14" height={A[1] - top[1]} rx="3" fill="#8a96a0" stroke="var(--di-tinte, #22313d)" strokeWidth="2" />
      {/* Modul */}
      <line x1={A[0]} y1={A[1]} x2={top[0]} y2={top[1]} stroke="var(--di-tinte, #22313d)" strokeWidth="16" strokeLinecap="round" />
      <line x1={A[0]} y1={A[1]} x2={top[0]} y2={top[1]} stroke="var(--primary)" strokeWidth="11" strokeLinecap="round" />
      {/* Schätzungen */}
      {schaetzungen.map((g, i) => {
        if (g <= 0 || g >= 90) return null;
        const aktuell = i === schaetzungen.length - 1;
        const farbe = istTreffer(g) ? 'var(--correct)' : aktuell ? '#e07b00' : '#9aa3ab';
        const l = len * 1.12;
        const e: [number, number] = [A[0] + l * Math.cos(rad(g)), A[1] - l * Math.sin(rad(g))];
        return (
          <g key={i} opacity={aktuell ? 1 : 0.5}>
            <line x1={A[0]} y1={A[1]} x2={e[0]} y2={e[1]} stroke={farbe} strokeWidth={aktuell ? 4 : 2.5} strokeDasharray="12 7" />
            {aktuell && (
              <text x={e[0] + 8} y={e[1] - 4} fontSize="20" fontWeight="700" fill={farbe}>
                {zahl(g)}°
              </text>
            )}
          </g>
        );
      })}
      {/* Winkel */}
      <path
        d={`M${A[0]} ${A[1]} L${A[0] + 58} ${A[1]} A58 58 0 0 0 ${A[0] + 58 * Math.cos(rad(WINKEL))} ${A[1] - 58 * Math.sin(rad(WINKEL))} Z`}
        fill="#f6c445"
        fillOpacity=".6"
        stroke="var(--di-tinte, #22313d)"
        strokeWidth="2"
      />
      <text x={A[0] + 66} y={A[1] - 10} fontSize="22" fontWeight="700" fill="var(--di-tinte, #22313d)">
        α = ?
      </text>
      <text x={(A[0] + top[0]) / 2 - 30} y={(A[1] + top[1]) / 2 - 22} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--primary)">
        Modul 1,72 m
      </text>
      <text x={top[0] + 16} y={(A[1] + top[1]) / 2 + 8} fontSize="20" fontWeight="700" fill="var(--di-tinte, #22313d)">
        Stütze 0,80 m
      </text>
    </svg>
  );
}

export default function WinkelSchaetzer({ schaetzungen, onSchaetzen }: { schaetzungen: number[]; onSchaetzen: (g: number) => void }) {
  const uid = useId();
  const [eingabe, setEingabe] = useState('');
  const [fehler, setFehler] = useState<string | null>(null);
  const treffer = schaetzungen.some(istTreffer);
  const frei = schaetzungen.length >= 3 || treffer;
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false });
  useEffect(() => {
    if (frei) pt.geloest();
  }, [frei, pt]);

  const pruefen = () => {
    const g = parseFlexibleNumber(eingabe.replace(/°|grad/gi, '').trim());
    if (!Number.isFinite(g)) return setFehler('Gib einen Winkel in Grad ein, z. B. 30 oder 27,5.');
    if (g <= 0 || g >= 90) return setFehler('Der Winkel liegt zwischen 0° und 90°.');
    setFehler(null);
    onSchaetzen(g);
  };
  const enter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') pruefen();
  };
  const letzte = schaetzungen[schaetzungen.length - 1];

  return (
    <div className="bkw-labor" data-no-autocheck>
      <div className="bk-graph bkw-rahmen">
        <Labor schaetzungen={schaetzungen} />
      </div>
      <div className="bkw-eingabe">
        <label htmlFor={`${uid}-g`}>
          Meine Schätzung: <M>\alpha =</M>
        </label>
        <input
          id={`${uid}-g`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="bk-input lp-input lp-input-sm"
          value={eingabe}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe(e.target.value)}
          onKeyDown={enter}
        />
        <span>°</span>
        <button type="button" className="bk-btn bk-btn-primary" onClick={pruefen}>
          <i className="fa-solid fa-compass-drafting" aria-hidden="true" /> Schätzung einzeichnen
        </button>
      </div>
      {fehler && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> {fehler}
        </div>
      )}
      {letzte !== undefined && (
        <p className={`bkw-anzeige ${istTreffer(letzte) ? 'bkw-anzeige-ok' : ''}`} role="status">
          <i className="fa-solid fa-compass-drafting" aria-hidden="true" />
          <span>
            <strong>Schätzung {schaetzungen.length}:</strong>{' '}
            {istTreffer(letzte)
              ? `${zahl(letzte)}° liegt genau auf dem Modul. Treffer!`
              : letzte > WINKEL
                ? `${zahl(letzte)}° ist steiler als das Modul. Für die Entscheidung brauchst du den Winkel auf ein halbes Grad genau.`
                : `${zahl(letzte)}° ist flacher als das Modul. Für die Entscheidung brauchst du den Winkel auf ein halbes Grad genau.`}
          </span>
        </p>
      )}
      {frei && (
        <p className="sl-hinweis">
          {treffer ? 'Treffer! Für jede andere Stützenhöhe müsstest du aber wieder neu schätzen. ' : 'Auf ein halbes Grad genau triffst du durch Schätzen kaum. '}
          Du kennst zwei Seiten, das Modul und die Stütze. Daraus kannst du ein Seitenverhältnis bilden, zum Beispiel den Sinus. Aber welcher Winkel
          gehört zu diesem Verhältnis? Gleich lernst du, wie der Taschenrechner aus dem Verhältnis den Winkel macht.
        </p>
      )}
    </div>
  );
}
