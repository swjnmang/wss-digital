import type { ReactNode } from 'react';

// Bilder der Lernsituation „Die Schlagzeile“ (flache Inline-SVGs in Themenfarbe, Linien in --ink, ohne Verläufe).
// Leitobjekt ist die Zeitungsseite mit der Lupe.

const de = (v: number) => v.toLocaleString('de-DE');

/** Säulen als <g>: Ursprung (x, y), Plotbreite b, Plothöhe h. Die y-Achse beginnt bei yStart (≠ 0 = abgeschnitten, mit Zickzack). */
export function SaeulenG({
  x = 0,
  y = 0,
  b,
  h,
  labels,
  werte,
  yStart,
  yMax,
  schritt,
  einheit = '',
  beschriftung = true,
  schrift = 15,
}: {
  x?: number;
  y?: number;
  b: number;
  h: number;
  labels: string[];
  werte: number[];
  yStart: number;
  yMax: number;
  schritt: number;
  einheit?: string;
  beschriftung?: boolean;
  schrift?: number;
}) {
  const links = 52;
  const px = (v: number) => h - ((v - yStart) / (yMax - yStart)) * h;
  const ticks: number[] = [];
  for (let t = yStart; t <= yMax + 1e-9; t += schritt) ticks.push(t);
  const slot = (b - links) / werte.length;
  const sb = Math.min(70, slot * 0.6);
  return (
    <g transform={`translate(${x} ${y})`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={links} x2={b} y1={px(t)} y2={px(t)} stroke="var(--line)" />
          <text x={links - 8} y={px(t) + 5} textAnchor="end" fontSize={schrift} fill="var(--ink-muted)">
            {de(t)}
          </text>
        </g>
      ))}
      <line x1={links} x2={links} y1={-8} y2={h} stroke="var(--ink)" strokeWidth="2" />
      <line x1={links} x2={b} y1={h} y2={h} stroke="var(--ink)" strokeWidth="2" />
      {yStart !== 0 && (
        <path
          d={`M${links - 7} ${h - 22} l14 -6 M${links - 7} ${h - 14} l14 -6`}
          stroke="var(--wrong)"
          strokeWidth="2.5"
          fill="none"
        />
      )}
      {werte.map((v, i) => {
        const cx = links + slot * i + slot / 2;
        return (
          <g key={i}>
            <rect x={cx - sb / 2} y={px(v)} width={sb} height={h - px(v)} fill="var(--primary)" />
            {beschriftung && (
              <text x={cx} y={px(v) - 6} textAnchor="middle" fontSize={schrift} fontWeight="800" fill="var(--ink)">
                {de(v)}
                {einheit}
              </text>
            )}
            <text x={cx} y={h + 21} textAnchor="middle" fontSize={schrift} fill="var(--ink)">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export const STROM = { labels: ['2021', '2022', '2023', '2024'], werte: [100, 102, 105, 108] };

/** Die Zeitungsseite des „Stadtboten“ mit Schlagzeile und Säulendiagramm. ehrlich: Achse ab 0 und sachliche Schlagzeile. */
export function Zeitung({ ehrlich = false }: { ehrlich?: boolean }) {
  return (
    <div className="zk-bild sh-zeitung">
      <svg
        viewBox="0 0 720 400"
        role="img"
        aria-label={
          ehrlich
            ? 'Zeitungsseite des Stadtboten. Schlagzeile: Strom 8 Prozent teurer als 2021. Säulendiagramm der Stromkosten 2021 bis 2024 mit einer Achse, die bei 0 beginnt. Die Säulen sind fast gleich hoch.'
            : 'Zeitungsseite des Stadtboten. Schlagzeile: Strom-Schock, Kosten explodieren. Säulendiagramm der Stromkosten 2021 bis 2024 in Euro pro Monat. Die Achse beginnt bei 98 Euro, die Säule für 2024 wirkt viel höher als die für 2021.'
        }
      >
        <rect x="6" y="6" width="708" height="388" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <text x="360" y="44" textAnchor="middle" fontSize="28" fontWeight="800" fill="var(--ink)" fontFamily="Georgia, serif">
          Der Stadtbote
        </text>
        <line x1="24" x2="696" y1="56" y2="56" stroke="var(--ink)" strokeWidth="3" />
        <rect x="24" y="68" width="672" height="46" fill="var(--primary)" />
        <text x="360" y="100" textAnchor="middle" fontSize={ehrlich ? 22 : 25} fontWeight="800" fill="#fff">
          {ehrlich ? 'Strom: 8 % teurer als 2021' : 'STROM-SCHOCK: KOSTEN EXPLODIEREN!'}
        </text>
        <text x="36" y="144" fontSize="16" fill="var(--ink-muted)">
          Stromkosten einer Familie in Euro pro Monat
        </text>
        <SaeulenG
          x={36}
          y={168}
          b={650}
          h={176}
          labels={STROM.labels}
          werte={STROM.werte}
          yStart={ehrlich ? 0 : 98}
          yMax={ehrlich ? 120 : 110}
          schritt={ehrlich ? 40 : 4}
          einheit=" €"
        />
      </svg>
    </div>
  );
}

/** Titelbild der Startbox: Zeitungsseite mit Lupe über der abgeschnittenen Achse */
export function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Eine Zeitungsseite mit Schlagzeile und Säulendiagramm. Eine große Lupe liegt über dem unteren Ende der senkrechten Achse, die einen Zickzack-Knick hat."
    >
      <rect x="0" y="222" width="720" height="30" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="222" y2="222" stroke="var(--ink)" strokeWidth="2" />
      <g transform="rotate(-4 300 120)">
        <rect x="110" y="14" width="360" height="206" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <line x1="128" x2="452" y1="52" y2="52" stroke="var(--ink)" strokeWidth="3" />
        <text x="290" y="42" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--ink)" fontFamily="Georgia, serif">
          Der Stadtbote
        </text>
        <rect x="128" y="62" width="324" height="30" fill="var(--primary)" />
        <text x="290" y="84" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">
          STROM-SCHOCK!
        </text>
        <line x1="170" x2="170" y1="104" y2="204" stroke="var(--ink)" strokeWidth="2" />
        <line x1="170" x2="440" y1="204" y2="204" stroke="var(--ink)" strokeWidth="2" />
        <path d="M163 188 l14 -6 M163 196 l14 -6" stroke="var(--wrong)" strokeWidth="3" fill="none" />
        {[28, 44, 70, 104].map((hh, i) => (
          <rect key={i} x={192 + i * 64} y={204 - hh - 12} width="40" height={hh + 12} fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        ))}
      </g>
      {/* Lupe */}
      <circle cx="170" cy="168" r="44" fill="none" stroke="var(--ink)" strokeWidth="8" />
      <circle cx="170" cy="168" r="40" fill="var(--highlight)" opacity="0.25" />
      <line x1="204" x2="246" y1="202" y2="244" stroke="var(--ink)" strokeWidth="14" strokeLinecap="round" />
      {/* Zeitung rechts: Kreisdiagramm */}
      <g transform="translate(500 30)">
        <rect x="0" y="0" width="190" height="182" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <circle cx="95" cy="92" r="64" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <path d="M95 92 L95 28 A64 64 0 1 1 41 126 Z" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
        <path d="M95 92 L41 126" stroke="var(--ink)" strokeWidth="2" />
      </g>
    </svg>
  );
}

/** Kreisdiagramm mit Legende; winkel: Winkel in den Sektoren anzeigen */
export function KreisBild({
  labels,
  werte,
  winkel = false,
  titel,
}: {
  labels: string[];
  werte: number[];
  winkel?: boolean;
  titel: string;
}) {
  const sum = werte.reduce((s, v) => s + v, 0);
  const fills = ['var(--primary)', 'var(--highlight)', 'var(--primary-soft)', 'var(--surface-sunken)'];
  const cx = 130;
  const cy = 130;
  const r = 110;
  let a = -90;
  const pt = (deg: number, rr: number) => [cx + rr * Math.cos((deg * Math.PI) / 180), cy + rr * Math.sin((deg * Math.PI) / 180)];
  return (
    <div className="zk-bild">
      <svg viewBox="0 0 560 260" role="img" aria-label={titel}>
        {werte.map((v, i) => {
          const sw = (v / sum) * 360;
          const [x1, y1] = pt(a, r);
          const [x2, y2] = pt(a + sw, r);
          const [lx, ly] = pt(a + sw / 2, r * 0.66);
          const d = `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${sw > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
          a += sw;
          return (
            <g key={i}>
              <path d={d} fill={fills[i % fills.length]} stroke="var(--ink)" strokeWidth="2" />
              {winkel && (
                <text x={lx} y={ly + 5} textAnchor="middle" fontSize="16" fontWeight="800" fill={i === 0 ? '#fff' : 'var(--ink)'}>
                  {Math.round(sw)}°
                </text>
              )}
            </g>
          );
        })}
        {labels.map((l, i) => (
          <g key={l}>
            <rect x="290" y={46 + i * 44} width="24" height="24" fill={fills[i % fills.length]} stroke="var(--ink)" strokeWidth="2" />
            <text x="326" y={65 + i * 44} fontSize="18" fill="var(--ink)">
              {l}: {werte[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Problem lösen: Umfragezettel und ein leerer Kreis, in den die Sektoren noch eingezeichnet werden müssen */
export function UmfrageBild() {
  const zeilen: [string, number][] = [
    ['Bus', 54],
    ['Fahrrad', 30],
    ['zu Fuß', 24],
    ['Elterntaxi', 12],
  ];
  return (
    <div className="zk-bild">
      <svg
        viewBox="0 0 720 250"
        role="img"
        aria-label="Links ein Umfragezettel: 120 Jugendliche befragt, Bus 54, Fahrrad 30, zu Fuß 24, Elterntaxi 12. Rechts ein leerer Kreis mit Fragezeichen für die Winkel."
      >
        <rect x="40" y="14" width="330" height="222" rx="8" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <text x="205" y="46" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--ink)">
          Wie kommst du zur Schule?
        </text>
        <text x="205" y="70" textAnchor="middle" fontSize="16" fill="var(--ink-muted)">
          120 Jugendliche befragt
        </text>
        {zeilen.map(([l, h], i) => (
          <g key={l}>
            <text x="64" y={108 + i * 30} fontSize="18" fill="var(--ink)">
              {l}
            </text>
            <text x="346" y={108 + i * 30} textAnchor="end" fontSize="18" fontWeight="800" fill="var(--ink)">
              {h}
            </text>
            <line x1="64" x2="346" y1={116 + i * 30} y2={116 + i * 30} stroke="var(--line)" />
          </g>
        ))}
        <circle cx="560" cy="125" r="96" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" strokeDasharray="8 6" />
        <line x1="560" x2="560" y1="125" y2="29" stroke="var(--ink)" strokeWidth="2" />
        <text x="560" y="140" textAnchor="middle" fontSize="40" fontWeight="800" fill="var(--primary)">
          ?°
        </text>
      </svg>
    </div>
  );
}

/** Handlungsprodukt: Seite im Heft mit Leserbrief, Säulen und Kreis */
export function LeserbriefBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Eine Heftseite mit der Überschrift Richtigstellung an den Stadtboten. Links eine kleine Skizze mit Säulen, rechts ein kleiner Kreis, darunter Schreiblinien."
      >
        <rect x="150" y="6" width="420" height="178" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <text x="170" y="34" fontSize="18" fontWeight="800" fill="var(--ink)">
          Richtigstellung an den Stadtboten
        </text>
        <line x1="180" x2="180" y1="52" y2="120" stroke="var(--ink)" strokeWidth="2" />
        <line x1="180" x2="300" y1="120" y2="120" stroke="var(--ink)" strokeWidth="2" />
        {[50, 52, 54, 56].map((h, i) => (
          <rect key={i} x={192 + i * 26} y={120 - h} width="16" height={h} fill="var(--primary)" />
        ))}
        <circle cx="400" cy="86" r="34" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <path d="M400 86 L400 52 A34 34 0 0 1 434 86 Z" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
        {[140, 158].map((y) => (
          <line key={y} x1="170" x2="550" y1={y} y2={y} stroke="var(--line-strong)" strokeWidth="2" />
        ))}
        <line x1="170" x2="420" y1="174" y2="174" stroke="var(--line-strong)" strokeWidth="2" />
      </svg>
    </div>
  );
}

/** Kleines Säulendiagramm für das Warm-up und die Spiel-Runden */
export function MiniSaeulen({
  labels,
  werte,
  yStart = 0,
  yMax,
  schritt,
  titel,
  einheit,
  beschriftung = true,
}: {
  labels: string[];
  werte: number[];
  yStart?: number;
  yMax: number;
  schritt: number;
  titel: string;
  einheit?: string;
  beschriftung?: boolean;
}): ReactNode {
  return (
    <div className="zk-bild">
      <svg viewBox="0 0 560 250" role="img" aria-label={titel}>
        <SaeulenG x={20} y={26} b={530} h={170} labels={labels} werte={werte} yStart={yStart} yMax={yMax} schritt={schritt} einheit={einheit} beschriftung={beschriftung} />
      </svg>
    </div>
  );
}
