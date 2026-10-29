import { useState, type ReactNode } from 'react';
import { PUNKTE, usePunkteAufgabe } from '../../../lineare_funktionen/lernsituation_kit/punkte';
import { shuffle } from '../../lernpfad/kit';

// Bausteine der Lernsituation „Die Wundertüte“ (5.7 Mehrstufige Baumdiagramme):
// Titelbild, die Wundertüte als Leitobjekt (Lose in der Tüte, gezogene Lose), ein flexibles Baumdiagramm mit zwei Stufen
// und das Ausprobieren („Zwei Lose ziehen“) in „Problem erkennen“.

export type Los = 'H' | 'T' | 'N';

export const LOS_NAME: Record<Los, string> = { H: 'Hauptgewinn', T: 'Trostpreis', N: 'Niete' };

/** Die Wundertüte: 10 Lose, 2 Hauptgewinne, 3 Trostpreise, 5 Nieten (feste, gemischte Anordnung für das Bild) */
export const ANORDNUNG: Los[] = ['N', 'H', 'T', 'N', 'T', 'N', 'N', 'H', 'T', 'N'];
export const ZAHL: Record<Los, number> = { H: 2, T: 3, N: 5 };
export const N_LOSE = 10;

const losFarbe = (l: Los) => (l === 'H' ? 'var(--highlight)' : l === 'T' ? 'var(--primary-soft)' : 'var(--surface)');

/* ── Titelbild ───────────────────────────────────────────────────────────── */

/** Titelbild: Losstand beim Schulfest mit Girlande, Tisch und der Wundertüte voller Lose */
export function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Ein Losstand beim Schulfest: Über dem Tisch hängt eine Girlande mit Wimpeln, auf dem Tisch steht die Wundertüte mit zehn Losen und ein Schild mit der Aufschrift Zwei Lose ziehen."
    >
      <rect x="0" y="206" width="720" height="46" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="206" y2="206" stroke="var(--ink)" strokeWidth="2" />
      {/* Girlande */}
      <path d="M20 22 Q360 90 700 22" fill="none" stroke="var(--ink)" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        const t = (i + 0.5) / 11;
        const x = 20 + t * 680;
        const y = 22 + 4 * t * (1 - t) * 34;
        return (
          <polygon
            key={i}
            points={`${x - 16},${y + 1} ${x + 16},${y + 1} ${x},${y + 36}`}
            fill={i % 2 ? 'var(--primary)' : 'var(--highlight)'}
            stroke="var(--ink)"
            strokeWidth="1.5"
          />
        );
      })}
      {/* Tisch */}
      <rect x="90" y="160" width="540" height="22" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="110" y="182" width="16" height="24" fill="var(--ink)" />
      <rect x="594" y="182" width="16" height="24" fill="var(--ink)" />
      {/* Wundertüte */}
      <path d="M300 160 L284 92 L316 108 L340 84 L364 108 L388 84 L412 108 L436 92 L420 160 Z" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="290" y="112" width="140" height="14" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="360" y="148" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">
        Wundertüte
      </text>
      {/* Lose auf dem Tisch */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${110 + i * 58}, ${146 - (i % 2) * 6}) rotate(${i % 2 ? 8 : -6})`}>
          <rect width="46" height="30" rx="3" fill={i === 1 ? 'var(--highlight)' : 'var(--surface)'} stroke="var(--ink)" strokeWidth="1.5" />
          <text x="23" y="22" textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--ink)">
            {i === 1 ? 'H' : 'N'}
          </text>
        </g>
      ))}
      {/* Schild */}
      <rect x="480" y="106" width="130" height="50" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <text x="545" y="128" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--ink)">
        Zwei Lose
      </text>
      <text x="545" y="148" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--ink)">
        ziehen!
      </text>
    </svg>
  );
}

/* ── Die Wundertüte (Leitobjekt) ─────────────────────────────────────────── */

const SLOT_W = 62;
const SLOT_H = 44;

/**
 * Wundertüte mit Losen. lose: 10 Plätze, null = Platz leer (Los wurde gezogen). gezogen: die bereits gezogenen Lose rechts neben der Tüte.
 */
export function Tuete({ lose = ANORDNUNG, gezogen = [], verdeckt = false, label }: { lose?: (Los | null)[]; gezogen?: Los[]; verdeckt?: boolean; label?: string }) {
  const drin = lose.filter(Boolean) as Los[];
  const zaehl = (t: Los) => drin.filter((l) => l === t).length;
  const text =
    label ??
    `Die Wundertüte mit ${drin.length} Losen: ${zaehl('H')} Hauptgewinne, ${zaehl('T')} Trostpreise und ${zaehl('N')} Nieten.` +
      (gezogen.length ? ` Gezogen: ${gezogen.map((g) => LOS_NAME[g]).join(', ')}.` : '');
  return (
    <div className="zk-bild wt-bild">
      <svg viewBox="0 0 720 236" role="img" aria-label={text} className="wt-tuete">
        {/* Tüte */}
        <path d="M34 62 L50 34 L82 54 L106 30 L130 54 L154 30 L178 54 L202 30 L226 54 L250 30 L274 54 L298 30 L322 54 L346 30 L370 54 L394 30 L418 54 L434 34 L444 62 Z" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="34" y="62" width="410" height="162" rx="14" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="34" y="62" width="410" height="16" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
        {lose.map((l, i) => {
          const x = 62 + (i % 5) * (SLOT_W + 12);
          const y = 94 + Math.floor(i / 5) * (SLOT_H + 20);
          return l ? (
            <g key={i}>
              <rect x={x} y={y} width={SLOT_W} height={SLOT_H} rx="4" fill={verdeckt ? 'var(--surface)' : losFarbe(l)} stroke="var(--ink)" strokeWidth="2" />
              <text x={x + SLOT_W / 2} y={y + 29} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--ink)">
                {verdeckt ? '?' : l}
              </text>
            </g>
          ) : (
            <rect key={i} x={x} y={y} width={SLOT_W} height={SLOT_H} rx="4" fill="none" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="6 5" />
          );
        })}
        {/* Gezogene Lose */}
        <text x="486" y="48" fontSize="17" fontWeight="800" fill="var(--ink)">
          Gezogen:
        </text>
        {[0, 1].map((i) => {
          const g = gezogen[i];
          const x = 486 + i * (SLOT_W + 16);
          return g ? (
            <g key={i}>
              <rect x={x} y="60" width={SLOT_W} height={SLOT_H} rx="4" fill={losFarbe(g)} stroke="var(--ink)" strokeWidth="2" />
              <text x={x + SLOT_W / 2} y="89" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--ink)">
                {g}
              </text>
              <text x={x + SLOT_W / 2} y="124" textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
                {i + 1}. Los
              </text>
            </g>
          ) : (
            <g key={i}>
              <rect x={x} y="60" width={SLOT_W} height={SLOT_H} rx="4" fill="none" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="6 5" />
              <text x={x + SLOT_W / 2} y="124" textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
                {i + 1}. Los
              </text>
            </g>
          );
        })}
        {/* Legende */}
        {(['H', 'T', 'N'] as Los[]).map((t, i) => (
          <g key={t}>
            <rect x="486" y={146 + i * 26} width="26" height="20" rx="3" fill={losFarbe(t)} stroke="var(--ink)" strokeWidth="1.5" />
            <text x="522" y={162 + i * 26} fontSize="16" fill="var(--ink)">
              {t} = {LOS_NAME[t]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Baumdiagramm mit zwei Stufen ───────────────────────────────────────── */

export type Ast = { label: string; p: string };

const ROW = 40;
const BX0 = 22;
const BX1 = 214;
const BX2 = 392;
const BW = 590;

function ProbText({ x, y, text, hell }: { x: number; y: number; text: string; hell: boolean }) {
  const w = text.length * 9 + 12;
  return (
    <g>
      <rect x={x - w / 2} y={y - 12} width={w} height={23} rx="4" fill="var(--surface)" opacity="0.94" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={hell ? 'var(--primary)' : 'var(--ink)'}>
        {text}
      </text>
    </g>
  );
}

/**
 * Baumdiagramm von links nach rechts mit zwei Stufen. erste: Äste der 1. Stufe, zweite[i]: Äste der 2. Stufe unter dem i-ten Ast.
 * ende: Text am Pfadende (z. B. Pfadwahrscheinlichkeit). hi: hervorgehobene Pfade (z. B. 'HH'). fragen: Wahrscheinlichkeiten als „?“.
 */
export function BaumBild({
  erste,
  zweite,
  ende,
  hi = [],
  fragen = false,
  label,
}: {
  erste: Ast[];
  zweite: Ast[][];
  ende?: (i: number, j: number) => string;
  hi?: string[];
  fragen?: boolean;
  label: string;
}) {
  const rows = zweite.reduce((s, z) => s + z.length, 0);
  const H = rows * ROW + 28;
  let r = 0;
  const knoten = erste.map((a, i) => {
    const ys = zweite[i].map(() => 14 + ROW * r++ + ROW / 2);
    return { a, ys, y: (ys[0] + ys[ys.length - 1]) / 2 };
  });
  const y0 = (knoten[0].y + knoten[knoten.length - 1].y) / 2;
  const mitHi = hi.length > 0;
  const pText = (p: string) => (fragen ? '?' : p);
  return (
    <div className="zk-bild wt-bild">
      <svg viewBox={`0 0 ${BW} ${H}`} role="img" aria-label={label} className="wt-baum">
        <text x={BX1} y="13" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink-muted)">
          1. Los
        </text>
        <text x={BX2} y="13" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink-muted)">
          2. Los
        </text>
        {knoten.map((k, i) => {
          const hi1 = mitHi && hi.some((h) => h.startsWith(k.a.label));
          const mx = BX0 + (BX1 - 18 - BX0) * 0.55;
          const my = y0 + (k.y - y0) * 0.55;
          return (
            <g key={i}>
              <line x1={BX0 + 4} y1={y0} x2={BX1 - 18} y2={k.y} stroke={hi1 ? 'var(--primary)' : 'var(--ink)'} strokeWidth={hi1 ? 3.5 : 1.8} strokeLinecap="round" />
              <ProbText x={mx} y={my} text={pText(k.a.p)} hell={hi1} />
              <text x={BX1} y={k.y + 7} textAnchor="middle" fontSize="21" fontWeight="800" fill={hi1 ? 'var(--primary)' : 'var(--ink)'}>
                {k.a.label}
              </text>
              {zweite[i].map((b, j) => {
                const pfad = k.a.label + b.label;
                const hi2 = mitHi && hi.includes(pfad);
                const yy = k.ys[j];
                const qx = BX1 + 18 + (BX2 - 18 - BX1 - 18) * 0.55;
                const qy = k.y + (yy - k.y) * 0.55;
                return (
                  <g key={j}>
                    <line x1={BX1 + 18} y1={k.y} x2={BX2 - 18} y2={yy} stroke={hi2 ? 'var(--primary)' : 'var(--ink)'} strokeWidth={hi2 ? 3.5 : 1.8} strokeLinecap="round" />
                    <ProbText x={qx} y={qy} text={pText(b.p)} hell={hi2} />
                    <text x={BX2} y={yy + 7} textAnchor="middle" fontSize="21" fontWeight="800" fill={hi2 ? 'var(--primary)' : 'var(--ink)'}>
                      {b.label}
                    </text>
                    <text x={BX2 + 26} y={yy + 6} fontSize="15" fill="var(--ink-muted)">
                      {pfad}
                    </text>
                    {ende && (
                      <text x={BX2 + 64} y={yy + 6} fontSize="16" fontWeight="700" fill={hi2 ? 'var(--primary)' : 'var(--ink)'}>
                        {ende(i, j)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        <circle cx={BX0} cy={y0} r="5" fill="var(--ink)" />
      </svg>
    </div>
  );
}

/** Zweistufiger Baum der Wundertüte ohne Zurücklegen; mit werte = Pfadwahrscheinlichkeiten (Neuntel…Neunzigstel) am Ende */
export function TuetenBaum({ werte = false, fragen = false, hi = [], label }: { werte?: boolean; fragen?: boolean; hi?: string[]; label?: string }) {
  const typen: Los[] = ['H', 'T', 'N'];
  const erste = typen.map((t) => ({ label: t, p: `${ZAHL[t]}/10` }));
  const zweite = typen.map((t) => typen.map((u) => ({ label: u, p: `${ZAHL[u] - (t === u ? 1 : 0)}/9` })));
  return (
    <BaumBild
      erste={erste}
      zweite={zweite}
      fragen={fragen}
      hi={hi}
      ende={werte ? (i, j) => `${ZAHL[typen[i]] * (ZAHL[typen[j]] - (i === j ? 1 : 0))}/90` : undefined}
      label={
        label ??
        (fragen
          ? 'Baumdiagramm der Wundertüte mit zwei Zügen und je drei Ästen H, T und N. Die Wahrscheinlichkeiten an den Ästen sind noch leer.'
          : 'Baumdiagramm der Wundertüte ohne Zurücklegen: Im ersten Zug 2/10 H, 3/10 T und 5/10 N, im zweiten Zug ändern sich die Brüche auf Neuntel.')
      }
    />
  );
}

/* ── Ausprobieren: Zwei Lose ziehen ─────────────────────────────────────── */

type Ziehung = [Los, Los];

function ziehe(): { paar: Ziehung; lose: (Los | null)[] } {
  const idx = shuffle(ANORDNUNG.map((_, i) => i)).slice(0, 2);
  return {
    paar: [ANORDNUNG[idx[0]], ANORDNUNG[idx[1]]],
    lose: ANORDNUNG.map((l, i) => (idx.includes(i) ? null : l)),
  };
}

/** Die SuS ziehen selbst zwei Lose (ohne Zurücklegen) und sehen, wie oft zwei Hauptgewinne vorkommen. Ab 30 Doppelzügen ist das Ausprobieren erledigt. */
export function Ziehen({ onFertig, ziel = 30 }: { onFertig: () => void; ziel?: number }) {
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false });
  const [letzte, setLetzte] = useState<{ paar: Ziehung; lose: (Los | null)[] } | null>(null);
  const [anzahl, setAnzahl] = useState(0);
  const [hh, setHh] = useState(0);
  const [gewinn, setGewinn] = useState(0);
  const [fertig, setFertig] = useState(false);

  const ziehen = (k: number) => {
    let h = 0;
    let g = 0;
    let z: ReturnType<typeof ziehe> | null = null;
    for (let i = 0; i < k; i++) {
      z = ziehe();
      if (z.paar[0] === 'H' && z.paar[1] === 'H') h++;
      if (z.paar.some((l) => l !== 'N')) g++;
    }
    setLetzte(z);
    setHh((v) => v + h);
    setGewinn((v) => v + g);
    const neu = anzahl + k;
    setAnzahl(neu);
    if (neu >= ziel && !fertig) {
      setFertig(true);
      pt.geloest();
      onFertig();
    }
  };

  return (
    <div className="wt-ziehen" data-no-autocheck>
      <Tuete lose={letzte ? letzte.lose : ANORDNUNG} gezogen={letzte ? letzte.paar : []} />
      <div className="bk-actions">
        <button type="button" className="bk-btn bk-btn-primary" onClick={() => ziehen(1)}>
          <i className="fa-solid fa-hand" aria-hidden="true" /> Zwei Lose ziehen
        </button>
        <button type="button" className="bk-btn" onClick={() => ziehen(10)}>
          <i className="fa-solid fa-forward" aria-hidden="true" /> 10 Doppelzüge auf einmal
        </button>
      </div>
      <p className="wt-zaehler" role="status">
        Doppelzüge: <strong>{anzahl}</strong> · zwei Hauptgewinne: <strong>{hh}</strong> · mindestens ein Gewinn: <strong>{gewinn}</strong>
      </p>
      {fertig ? (
        <p className="ls-back">
          <strong>Schon gemerkt?</strong> Zwei Hauptgewinne kommen selten vor, und bei wenigen Ziehungen schwankt das Ergebnis stark. Wie wahrscheinlich es
          genau ist, rechnest du gleich mit einem Baumdiagramm aus.
        </p>
      ) : (
        <p className="sl-hinweis">Ziehe mindestens {ziel} Doppelzüge. Jedes gezogene Los bleibt draußen, bis die Tüte wieder gefüllt wird.</p>
      )}
    </div>
  );
}

/** Kleines Bild für das Handlungsprodukt: das Plakat mit dem Baum */
export function PlakatBild(): ReactNode {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Ein Plakat mit der Überschrift: So gewinnst du bei der Wundertüte. Darauf ein kleines Baumdiagramm mit zwei Zügen, eine Rechnung und der Kasten Pfadregeln."
      >
        <rect x="110" y="6" width="500" height="178" rx="8" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <text x="360" y="34" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--ink)">
          So gewinnst du bei der Wundertüte
        </text>
        <g stroke="var(--ink)" strokeWidth="2" fill="none">
          <line x1="140" y1="104" x2="200" y2="72" />
          <line x1="140" y1="104" x2="200" y2="136" />
          <line x1="200" y1="72" x2="260" y2="56" />
          <line x1="200" y1="72" x2="260" y2="88" />
          <line x1="200" y1="136" x2="260" y2="120" />
          <line x1="200" y1="136" x2="260" y2="152" />
        </g>
        <circle cx="140" cy="104" r="5" fill="var(--ink)" />
        {[56, 88, 120, 152].map((y) => (
          <circle key={y} cx="266" cy={y} r="6" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
        ))}
        <rect x="320" y="50" width="270" height="52" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <text x="332" y="73" fontSize="16" fill="var(--ink)">
          Produktregel: malnehmen
        </text>
        <text x="332" y="94" fontSize="16" fill="var(--ink)">
          Summenregel: addieren
        </text>
        <text x="320" y="132" fontSize="16" fontStyle="italic" fill="var(--ink)">
          Unsere Rechnung: …
        </text>
        <text x="320" y="158" fontSize="16" fontStyle="italic" fill="var(--ink)">
          Das bedeuten die Begriffe: …
        </text>
      </svg>
    </div>
  );
}
