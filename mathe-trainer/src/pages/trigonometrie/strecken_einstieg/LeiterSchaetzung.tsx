import { useEffect, useId, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { M } from '../../daten_und_zufall/lernpfad/kit';
import { PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte';
import { parseFlexibleNumber } from '../../../utils/parseFlexibleNumber';

// Problem erkennen: Schätzduell an der Drehleiter. Die Leiter ist 30 m ausgefahren und um 70° aufgerichtet. Die SuS schätzen, wie hoch
// die Leiterspitze über dem Drehpunkt liegt. Der Gruppenführer meldet nur „zu hoch“ oder „zu niedrig“, die Skizze zeichnet die Schätzung
// als Linie an die Wand. Auf 5 cm genau trifft man durch Schätzen kaum. Freigabe nach drei Schätzungen oder einem Treffer.

export const LEITER = 30;
export const WINKEL = 70;
export const HOEHE = LEITER * Math.sin((WINKEL * Math.PI) / 180);
export const ABSTAND = LEITER * Math.cos((WINKEL * Math.PI) / 180);
export const istTreffer = (h: number) => Math.abs(h - HOEHE) <= 0.05;
const zahl = (x: number, d = 2) => x.toLocaleString('de-DE', { maximumFractionDigits: d });

function Skizze({ schaetzungen }: { schaetzungen: number[] }) {
  const W = 560;
  const H = 400;
  const s = 11; // Pixel pro Meter
  const D: [number, number] = [150, H - 50]; // Drehpunkt
  const wandX = D[0] + ABSTAND * s;
  const spitze: [number, number] = [wandX, D[1] - HOEHE * s];
  const y = (h: number) => D[1] - h * s;
  const letzte = schaetzungen[schaetzungen.length - 1];
  const r = 46;
  const w = (WINKEL * Math.PI) / 180;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      className="dl-skizze"
      aria-label={`Skizze: Drehleiter 30 Meter lang, um 70 Grad aufgerichtet, die Spitze lehnt an der Hauswand. Die Höhe der Spitze über dem Drehpunkt ist gesucht.${
        letzte !== undefined ? ` Deine letzte Schätzung ${zahl(letzte)} Meter ist als Linie an der Wand eingezeichnet.` : ''
      }`}
    >
      {/* Hauswand mit Fenstern */}
      <rect x={wandX} y={20} width={W - wandX - 10} height={D[1] - 20 + 30} fill="var(--primary-soft)" stroke="var(--co-tusche, #141414)" strokeWidth="4" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={wandX + 40} y={D[1] - 18 - i * 40} width="44" height="26" fill="#fff" stroke="var(--co-tusche, #141414)" strokeWidth="3" />
      ))}
      {/* Boden und Fahrzeug */}
      <line x1="0" y1={D[1] + 30} x2={W} y2={D[1] + 30} stroke="var(--co-tusche, #141414)" strokeWidth="4" />
      <rect x={D[0] - 120} y={D[1] - 6} width="170" height="30" rx="6" fill="var(--primary)" stroke="var(--co-tusche, #141414)" strokeWidth="4" />
      {/* Winkel */}
      <path
        d={`M${D[0]} ${D[1]} L${D[0] + r} ${D[1]} A${r} ${r} 0 0 0 ${D[0] + r * Math.cos(w)} ${D[1] - r * Math.sin(w)} Z`}
        fill="#f5c400"
        fillOpacity=".55"
        stroke="var(--co-tusche, #141414)"
        strokeWidth="2.5"
      />
      <line x1={D[0]} y1={D[1]} x2={wandX} y2={D[1]} stroke="var(--co-tusche, #141414)" strokeWidth="2" strokeDasharray="8 6" />
      <text x={D[0] + r + 8} y={D[1] - 12} fontSize="22" fontWeight="700" fill="var(--co-tusche, #141414)">
        70°
      </text>
      {/* Leiter mit Sprossen */}
      <line x1={D[0]} y1={D[1]} x2={spitze[0]} y2={spitze[1]} stroke="var(--co-tusche, #141414)" strokeWidth="12" strokeLinecap="round" />
      <line x1={D[0]} y1={D[1]} x2={spitze[0]} y2={spitze[1]} stroke="#e9e3d2" strokeWidth="6" strokeLinecap="round" strokeDasharray="4 10" />
      <text
        x={(D[0] + spitze[0]) / 2 - 18}
        y={(D[1] + spitze[1]) / 2}
        textAnchor="end"
        fontSize="22"
        fontWeight="700"
        fill="var(--co-tusche, #141414)"
      >
        Leiter 30 m
      </text>
      <circle cx={D[0]} cy={D[1]} r="7" fill="#fff" stroke="var(--co-tusche, #141414)" strokeWidth="3" />
      <text x={D[0] - 12} y={D[1] - 14} textAnchor="end" fontSize="18" fontWeight="700" fill="var(--co-tusche, #141414)">
        Drehpunkt
      </text>
      {/* gesuchte Höhe */}
      <line x1={wandX - 14} y1={D[1]} x2={wandX - 14} y2={spitze[1]} stroke="var(--primary)" strokeWidth="3" />
      <text x={wandX - 22} y={D[1] - 40} textAnchor="end" fontSize="26" fontWeight="800" fill="var(--primary)">
        h = ?
      </text>
      {/* Fenster mit der Übungspuppe in 26 m Höhe */}
      <rect x={wandX + 110} y={y(26) - 14} width="56" height="30" fill="#f5c400" stroke="var(--co-tusche, #141414)" strokeWidth="3" />
      <text x={wandX + 174} y={y(26) + 8} fontSize="18" fontWeight="700" fill="var(--co-tusche, #141414)">
        26 m
      </text>
      {/* frühere Schätzungen blass, aktuelle kräftig */}
      {schaetzungen.map((h, i) => {
        const aktuell = i === schaetzungen.length - 1;
        if (h > 34 || h < 0) return null;
        const farbe = istTreffer(h) ? 'var(--correct)' : aktuell ? 'var(--primary)' : '#9aa3ab';
        return (
          <g key={i} opacity={aktuell ? 1 : 0.55}>
            <line x1={wandX} y1={y(h)} x2={W - 10} y2={y(h)} stroke={farbe} strokeWidth={aktuell ? 4 : 2} strokeDasharray="10 6" />
            {aktuell && (
              <text x={W - 16} y={y(h) - 8} textAnchor="end" fontSize="20" fontWeight="800" fill={farbe}>
                {zahl(h)} m
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function LeiterSchaetzung({ schaetzungen, onSchaetzen }: { schaetzungen: number[]; onSchaetzen: (h: number) => void }) {
  const uid = useId();
  const [eingabe, setEingabe] = useState('');
  const [fehler, setFehler] = useState<string | null>(null);
  const treffer = schaetzungen.some(istTreffer);
  const frei = schaetzungen.length >= 3 || treffer;
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false });
  useEffect(() => {
    if (frei) pt.geloest();
  }, [frei, pt]);

  const melden = () => {
    const h = parseFlexibleNumber(eingabe.replace(/m/i, '').trim());
    if (!Number.isFinite(h)) return setFehler('Gib eine Zahl in Metern ein, z. B. 25 oder 27,5.');
    if (h <= 0 || h > 60) return setFehler('Die Spitze liegt irgendwo zwischen 0 m und 30 m über dem Drehpunkt.');
    setFehler(null);
    onSchaetzen(h);
  };
  const enter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') melden();
  };
  const letzte = schaetzungen[schaetzungen.length - 1];

  return (
    <div className="dl-labor" data-no-autocheck>
      <div className="bk-graph dl-rahmen">
        <Skizze schaetzungen={schaetzungen} />
      </div>
      <div className="dl-eingabe">
        <label htmlFor={`${uid}-h`}>
          Meine Schätzung: <M>h =</M>
        </label>
        <input
          id={`${uid}-h`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="bk-input lp-input lp-input-sm"
          value={eingabe}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe(e.target.value)}
          onKeyDown={enter}
        />
        <span>m</span>
        <button type="button" className="bk-btn bk-btn-primary" onClick={melden}>
          <i className="fa-solid fa-tower-broadcast" aria-hidden="true" /> An den Gruppenführer funken
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
            <strong>Gruppenführer, Schätzung {schaetzungen.length}:</strong>{' '}
            {istTreffer(letzte)
              ? `„${zahl(letzte)} m, das stimmt auf 5 cm genau. Treffer!“`
              : letzte > HOEHE
                ? `„${zahl(letzte)} m ist zu hoch. Ich brauche den Wert auf 5 cm genau.“`
                : `„${zahl(letzte)} m ist zu niedrig. Ich brauche den Wert auf 5 cm genau.“`}
          </span>
        </p>
      )}
      {frei && (
        <p className="sl-hinweis">
          {treffer ? 'Treffer! Für die nächste Leiterstellung müsstest du aber wieder lange schätzen. ' : 'Auf 5 cm genau triffst du durch Schätzen kaum. '}
          Mit dem Satz des Pythagoras kommst du auch nicht weiter: Du kennst nur eine Seite des Dreiecks, die Leiter mit 30 m. Dafür kennst du
          den Winkel. Gleich lernst du, wie du mit Sinus und Kosinus aus einer Seite und einem Winkel die fehlenden Seiten berechnest.
        </p>
      )}
    </div>
  );
}
