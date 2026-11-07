import { useEffect, useId, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { M } from '../../daten_und_zufall/lernpfad/kit';
import { PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte';
import { parseFlexibleNumber } from '../../../utils/parseFlexibleNumber';

// Problem erkennen: Lasercutter-Vorschau. Die SuS geben Boden und Rücken eines Seitenteils ein, die Vorschau zeichnet das Teil und
// misst den Winkel α. Ziel: genau 70°. Jeder Versuch steht mit dem Verhältnis Rücken : Boden in der Tabelle (Darstellungswechsel).

export type Versuch = { boden: number; ruecken: number };

export const ZIEL = 70;
export const winkelVon = (v: Versuch) => (Math.atan2(v.ruecken, v.boden) * 180) / Math.PI;
export const istTreffer = (v: Versuch) => Math.abs(winkelVon(v) - ZIEL) < 0.05;
const zahl = (x: number, d = 1) => x.toLocaleString('de-DE', { maximumFractionDigits: d });

function Vorschau({ v }: { v: Versuch | null }) {
  const W = 560;
  const H = 300;
  const rand = 50;
  if (!v)
    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Leere Vorschau des Lasercutters" className="hs-vorschau">
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="20" fill="var(--ink-muted)">
          Gib Boden und Rücken ein, dann zeichnet der Lasercutter das Seitenteil.
        </text>
      </svg>
    );
  const s = Math.min((W - 2 * rand - 240) / v.boden, (H - 2 * rand) / v.ruecken);
  const bw = v.boden * s;
  const rh = v.ruecken * s;
  const A: [number, number] = [(W - bw) / 2, H - rand];
  const B: [number, number] = [A[0] + bw, A[1]];
  const C: [number, number] = [B[0], A[1] - rh];
  const a = winkelVon(v);
  const r = Math.min(52, bw * 0.6);
  const p = (w: number, rr: number) => [A[0] + rr * Math.cos((w * Math.PI) / 180), A[1] - rr * Math.sin((w * Math.PI) / 180)];
  const [bx, by] = p(a, r);
  const treffer = istTreffer(v);
  const farbe = treffer ? 'var(--correct)' : 'var(--primary)';
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Vorschau: Seitenteil mit Boden ${zahl(v.boden)} cm und Rücken ${zahl(v.ruecken)} cm. Gemessener Winkel ${zahl(a)} Grad.`}
      className="hs-vorschau"
    >
      <path d={`M${A} L${B} L${C} Z`} fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d={`M${A[0]} ${A[1]} L${A[0] + r} ${A[1]} A${r} ${r} 0 0 0 ${bx} ${by} Z`} fill={farbe} fillOpacity=".25" stroke={farbe} strokeWidth="2.5" />
      <path d={`M${B[0] - 16} ${B[1]} V${B[1] - 16} H${B[0]}`} fill="none" stroke="var(--ink)" strokeWidth="1.6" />
      <text x={(A[0] + B[0]) / 2} y={A[1] + 30} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--ink)">
        {zahl(v.boden)} cm
      </text>
      <text x={B[0] + 12} y={(B[1] + C[1]) / 2 + 7} fontSize="20" fontWeight="700" fill="var(--ink)">
        {zahl(v.ruecken)} cm
      </text>
      <text x={A[0] - 14} y={A[1] - 14} textAnchor="end" fontSize="24" fontWeight="700" fill={farbe}>
        α = {zahl(a)}°
      </text>
    </svg>
  );
}

export default function LaserVorschau({ versuche, onTesten }: { versuche: Versuch[]; onTesten: (v: Versuch) => void }) {
  const uid = useId();
  const [boden, setBoden] = useState('');
  const [ruecken, setRuecken] = useState('');
  const [fehler, setFehler] = useState<string | null>(null);
  const treffer = versuche.some(istTreffer);
  const frei = versuche.length >= 3 || treffer;
  // Ausprobieren zählt wie eine Festlegung (PUNKTE.festlegung), sobald die Seite frei ist
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false });
  useEffect(() => {
    if (frei) pt.geloest();
  }, [frei, pt]);

  const lesen = (s: string) => {
    const x = parseFlexibleNumber(s.replace(/cm/i, '').trim());
    return Number.isFinite(x) ? x : NaN;
  };
  const schneiden = () => {
    const b = lesen(boden);
    const r = lesen(ruecken);
    if (Number.isNaN(b) || Number.isNaN(r)) return setFehler('Gib für Boden und Rücken je eine Zahl ein, z. B. 6 oder 12,5.');
    if (b < 1 || r < 1 || b > 60 || r > 60) return setFehler('Der Lasercutter schneidet Teile zwischen 1 cm und 60 cm.');
    setFehler(null);
    onTesten({ boden: b, ruecken: r });
  };
  const enter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') schneiden();
  };
  const letzter = versuche[versuche.length - 1] ?? null;

  return (
    <div className="hs-labor" data-no-autocheck>
      <div className="bk-graph hs-vorschau-rahmen">
        <Vorschau v={letzter} />
      </div>
      <div className="hs-eingabe">
        <label htmlFor={`${uid}-b`}>Boden</label>
        <input
          id={`${uid}-b`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="bk-input lp-input lp-input-sm"
          value={boden}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBoden(e.target.value)}
          onKeyDown={enter}
        />
        <span>cm</span>
        <label htmlFor={`${uid}-r`}>Rücken</label>
        <input
          id={`${uid}-r`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="bk-input lp-input lp-input-sm"
          value={ruecken}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRuecken(e.target.value)}
          onKeyDown={enter}
        />
        <span>cm</span>
        <button type="button" className="bk-btn bk-btn-primary" onClick={schneiden}>
          <i className="fa-solid fa-bolt" aria-hidden="true" /> Vorschau zeichnen
        </button>
      </div>
      {fehler && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> {fehler}
        </div>
      )}
      {letzter && (
        <p className={`hs-anzeige ${istTreffer(letzter) ? 'hs-anzeige-ok' : ''}`} role="status">
          <i className="fa-solid fa-ruler-combined" aria-hidden="true" />
          <span>
            <strong>Vorschau, Versuch {versuche.length}:</strong> Der Winkel ist <M>{`\\alpha = ${zahl(winkelVon(letzter)).replace(',', '{,}')}^\\circ`}</M>.{' '}
            {istTreffer(letzter)
              ? 'Genau 70°, Treffer!'
              : winkelVon(letzter) > ZIEL
                ? 'Zu steil: Das Tablet würde fast senkrecht stehen.'
                : 'Zu flach: Das Tablet würde nach hinten kippen.'}
          </span>
        </p>
      )}
      {versuche.length > 0 && (
        <div className="hs-tabelle-rahmen">
          <table className="hs-tabelle">
            <caption>Deine Versuche</caption>
            <thead>
              <tr>
                <th scope="col">Versuch</th>
                <th scope="col">Boden</th>
                <th scope="col">Rücken</th>
                <th scope="col">Rücken : Boden</th>
                <th scope="col">
                  <M>\alpha</M>
                </th>
              </tr>
            </thead>
            <tbody>
              {versuche.map((v, i) => (
                <tr key={i} className={istTreffer(v) ? 'hs-treffer' : ''}>
                  <td>{i + 1}</td>
                  <td>{zahl(v.boden)} cm</td>
                  <td>{zahl(v.ruecken)} cm</td>
                  <td>{zahl(v.ruecken / v.boden, 3)}</td>
                  <td>{zahl(winkelVon(v))}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {frei && (
        <p className="sl-hinweis">
          {treffer
            ? 'Treffer! Für einen anderen Winkel müsstest du aber wieder lange probieren. '
            : 'Genau 70° triffst du durch Probieren kaum. '}
          Sieh dir die Spalte „Rücken : Boden“ an: Der Winkel hängt nur von diesem Verhältnis ab, nicht von der Größe des Teils. Aber
          welches Verhältnis gehört zu welchem Winkel? Gleich lernst du ein Werkzeug, das dir für jeden Winkel das passende Verhältnis
          liefert.
        </p>
      )}
    </div>
  );
}
