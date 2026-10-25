import { useEffect, useId, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, Tabelle, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, McCard, tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Fehlersuche,
  Handlungsprodukt,
  SeitenLernsituation,
  type Seite,
  type Thema,
} from '../../lineare_funktionen/lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien, Vermutung, Zitat, type Festlegung } from '../../finanzmathe/zins_kit/zins_kit'
import { LERNVIDEO_FALL2 } from '../FunktionsgleichungAufstellen'
import HoodieKanone from './HoodieKanone'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './hoodie.css'

// Lernsituation 2 „Die Hoodie-Bestellung“: Funktionsgleichung aus einem bekannten Wert und zwei Punkten (Fall 2), Additionsverfahren neu (ca. 90 min).
// Format Rollenspiel / Beratungsauftrag: Die SuS sind in der Schülerfirma für die Finanzen zuständig. Finn aus dem Vorstand will 60 Hoodies
// bestellen („mehr Hoodies, mehr Gewinn“). Bekannt sind die Fixkosten (c = −200) und zwei Vorjahre: 20 und 40 Hoodies brachten je 200 € Gewinn.
// Problem erkennen: Festlegung zu 60 Hoodies, dann im Gewinn-Rechner a und b ausprobieren; jede Kurve wird sofort gezeichnet, der Rechner
// meldet, ob sie zu den Vorjahren passt. Durch Raten trifft man die Gewinnkurve kaum.
// Problem lösen: Teil 1 zwei Gleichungen aufstellen (Rechenbeispiel Jutebeutel), Teil 2 das Gleichungssystem mit dem Additionsverfahren lösen
// (Rechenbeispiel Jutebeutel weiter, mit Lernvideo zu Fall 2), dann Gewinn bei 60 Hoodies und Empfehlung an Finn.
// Handlungsprodukt analog: Gewinn-Steckbrief im Heft mit Tabelle, Gleichung, Skizze und Antwort an Finn (mehrere Darstellungen).
// Aha: 20 und 40 Hoodies bringen beide 200 € Gewinn, 60 Hoodies bringen 200 € Verlust. Mehr verkaufen heißt nicht mehr Gewinn.
// Identität: Themenfarbe Beere, Symbol fa-shirt, Titelbild Verkaufsstand am Sommerfest mit Hoodies und Bestellkarton, Leitobjekt der
// Gewinn-Rechner der Schülerfirma. Festlegung und Versuche bleiben nur im Seitenzustand (kein Speichern).
// Punkte nach Aufwand: Warm-up 2/2/3/2/2, Festlegung und Gewinn-Rechner je 3, Teil 1 10, Teil 2 14, Empfehlung 3, Steckbrief 5,
// Übungen 4/5/6/8, Profi 9, Bonus-Spiel 4 Münzen à 2 (Pflicht zusammen 72: Warm-up 15 %, Problem erkennen 8 %, Problem lösen 44 %, Übungen 32 %).

/** Lernvideo zu Fall 2 (auch bei den Übungsaufgaben unter /funktionsgleichung_aufstellen/ueben verlinkt) */
const VIDEO_FALL2 = `https://www.youtube.com/watch?v=${LERNVIDEO_FALL2}`

/* ── Situation ───────────────────────────────────────────────────────────── */

// Gewinn y in € bei x verkauften Hoodies: y = −0,5x² + 30x − 200 (Fixkosten 200 €, bei 20 und 40 Hoodies 200 €, bei 60 Hoodies −200 €, Maximum 250 € bei 30)
const A = -0.5
const B = 30
const C = -200
const G = (x: number, a = A, b = B) => a * x * x + b * x + C
const BEKANNT = [
  { x: 0, y: -200 },
  { x: 20, y: 200 },
  { x: 40, y: 200 },
]

type Wahl = 'mehr' | 'gleich' | 'weniger' | 'verlust'
const WAHL: Record<Wahl, string> = {
  mehr: 'Mit 60 Hoodies machen wir deutlich mehr als 200 € Gewinn.',
  gleich: 'Der Gewinn bleibt ungefähr bei 200 €.',
  weniger: 'Der Gewinn sinkt unter 200 €, aber wir verdienen noch etwas.',
  verlust: 'Mit 60 Hoodies machen wir Verlust.',
}

/** Ein Versuch im Gewinn-Rechner: a und b, c = −200 ist fest */
type Kurve = { a: number; b: number }
const passt = (k: Kurve, x: number, y: number) => Math.abs(G(x, k.a, k.b) - y) < 0.5
const treffer = (k: Kurve) => passt(k, 20, 200) && passt(k, 40, 200)
/** Wie weit liegt die Kurve an beiden Stellen daneben (in €)? */
const daneben = (k: Kurve) => Math.abs(G(20, k.a, k.b) - 200) + Math.abs(G(40, k.a, k.b) - 200)
/** Betrag in € als Text mit echtem Minuszeichen, z. B. „−200 €“ */
const euro = (v: number) => `${fmt(v, 1).replace('-', '−')} €`

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Hoodie als flache Form (Mittelpunkt x, y), Fläche in Themenfarbe */
function HoodieForm({ x, y, s = 1, farbe = 'var(--primary)' }: { x: number; y: number; s?: number; farbe?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-30 -34 L-12 -42 Q0 -56 12 -42 L30 -34 L46 -4 L32 3 L24 -12 L24 38 L-24 38 L-24 -12 L-32 3 L-46 -4 Z"
        fill={farbe}
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M-12 -42 Q0 -26 12 -42" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <rect x="-14" y="12" width="28" height="14" rx="3" fill="none" stroke="var(--ink)" strokeWidth="2" />
    </g>
  )
}

/** Titelbild der Startbox: Verkaufsstand der Schülerfirma am Sommerfest mit Hoodies an der Kleiderstange und dem Bestellkarton „60?“ */
function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Verkaufsstand der Schülerfirma am Sommerfest: Unter einem Vordach hängen drei Hoodies an einer Kleiderstange, auf dem Tisch steht ein Schild mit dem Preis, daneben ein großer Karton mit der Aufschrift 60?"
    >
      <rect x="0" y="214" width="720" height="38" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="214" y2="214" stroke="var(--ink)" strokeWidth="2" />
      {/* Vordach mit Streifen */}
      <rect x="70" y="20" width="440" height="34" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <path key={i} d={`M${70 + i * 40} 54 q20 22 40 0`} fill={i % 2 ? 'var(--primary)' : 'var(--primary-soft)'} stroke="var(--ink)" strokeWidth="2" />
      ))}
      <text x="290" y="44" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">
        SCHÜLERFIRMA
      </text>
      <line x1="80" x2="80" y1="54" y2="214" stroke="var(--ink)" strokeWidth="4" />
      <line x1="500" x2="500" y1="54" y2="214" stroke="var(--ink)" strokeWidth="4" />
      {/* Kleiderstange mit Hoodies */}
      <line x1="110" x2="330" y1="92" y2="92" stroke="var(--ink)" strokeWidth="3" />
      {[150, 220, 290].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 92 v8`} stroke="var(--ink)" strokeWidth="2" />
          <HoodieForm x={x} y={140} s={0.85} farbe={i === 1 ? 'var(--primary-soft)' : 'var(--primary)'} />
        </g>
      ))}
      {/* Tisch mit Preisschild */}
      <rect x="350" y="150" width="140" height="64" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="372" y="112" width="96" height="38" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <text x="420" y="138" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--ink)">
        Hoodies
      </text>
      {/* Bestellkarton */}
      <rect x="560" y="120" width="120" height="94" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
      <path d="M560 120 l20 -22 h120 l-20 22 Z M680 120 l20 -22 v94 l-20 22 Z" fill="var(--surface-sunken)" stroke="var(--ink)" strokeWidth="2" />
      <text x="620" y="180" textAnchor="middle" fontSize="34" fontWeight="800" fill="var(--ink)">
        60?
      </text>
    </svg>
  )
}

const THEMA: Thema = { name: 'Die Hoodie-Bestellung', farbe: 'beere', icon: 'fa-shirt', bild: <Titelbild /> }

/* ── Leitobjekt: Gewinn-Rechner mit Gewinnkurve ──────────────────────────── */

const S = { w: 680, h: 360, l: 64, r: 16, t: 16, b: 46, yMin: -400, yMax: 400 }

type KurveBild = Kurve & { art: 'alt' | 'aktuell' | 'treffer' }

/**
 * Koordinatensystem der Gewinnkurve: bekannte Punkte (0 | −200), (20 | 200), (40 | 200).
 * kurven: Versuche aus dem Gewinn-Rechner (alte blass, aktuelle kräftig, Treffer grün); frage: Stelle x = 60 mit Fragezeichen markieren
 */
function GewinnBild({ xMax, kurven = [], frage = false, label }: { xMax: number; kurven?: KurveBild[]; frage?: boolean; label: string }) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
  const bx = (x: number) => S.l + (x / xMax) * (S.w - S.l - S.r)
  const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)
  const xs = Array.from({ length: xMax / 10 + 1 }, (_, i) => i * 10)
  return (
    <div className="bk-graph ls-graph hb-bild">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label={label}>
        <defs>
          <clipPath id={clip}>
            <rect x={bx(0)} y={by(S.yMax)} width={bx(xMax) - bx(0)} height={by(S.yMin) - by(S.yMax)} />
          </clipPath>
        </defs>
        <rect x={bx(0)} y={by(0)} width={bx(xMax) - bx(0)} height={by(S.yMin) - by(0)} fill="var(--wrong-soft)" opacity="0.45" />
        {xs.map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--grid)" />
            {v > 0 && (
              <text x={bx(v)} y={by(0) + 22} textAnchor="middle" fontSize="17" fill="var(--ink-muted)">
                {v}
              </text>
            )}
          </g>
        ))}
        {[-400, -200, 200, 400].map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(0)} x2={bx(xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            <text x={bx(0) - 8} y={by(v) + 6} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
              {String(v).replace('-', '−')}
            </text>
          </g>
        ))}
        <line x1={bx(0)} x2={bx(xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="2" />
        <line x1={bx(0)} x2={bx(0)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--ink)" strokeWidth="2" />
        <text x={bx(xMax) - 4} y={by(0) + 42} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
          verkaufte Hoodies x
        </text>
        <text x={bx(0) + 8} y={by(S.yMax) + 18} fontSize="15" fill="var(--ink-muted)">
          Gewinn y in €
        </text>
        <text x={bx(xMax) - 8} y={by(-330)} textAnchor="end" fontSize="16" fontWeight="700" fill="var(--wrong-ink)">
          Verlust
        </text>
        <g clipPath={`url(#${clip})`}>
          {kurven.map((k, i) => {
            const pts = Array.from({ length: 121 }, (_, j) => (j / 120) * xMax)
              .map((x) => `${bx(x)},${by(Math.max(S.yMin - 50, Math.min(S.yMax + 50, G(x, k.a, k.b))))}`)
              .join(' ')
            return (
              <polyline
                key={i}
                points={pts}
                fill="none"
                stroke={k.art === 'treffer' ? 'var(--correct)' : k.art === 'aktuell' ? 'var(--primary)' : 'var(--line-strong)'}
                strokeWidth={k.art === 'alt' ? 2 : 4}
                strokeLinecap="round"
                opacity={k.art === 'alt' ? 0.7 : 1}
              />
            )
          })}
        </g>
        {frage && (
          <g>
            <line x1={bx(60)} x2={bx(60)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--ink)" strokeWidth="2" strokeDasharray="6 5" />
            <text x={bx(60) - 10} y={by(300)} textAnchor="end" fontSize="20" fontWeight="800" fill="var(--ink)">
              60 Hoodies: y = ?
            </text>
          </g>
        )}
        {BEKANNT.map((p) => (
          <g key={p.x}>
            <circle cx={bx(p.x)} cy={by(p.y)} r="7" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
            <text x={bx(p.x) + 12} y={by(p.y) + (p.x === 0 ? 24 : -14)} fontSize="17" fontWeight="700" fill="var(--ink)">
              ({p.x} | {String(p.y).replace('-', '−')})
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ── Phase 2: der Gewinn-Rechner ─────────────────────────────────────────── */

/** Gewinn-Rechner: a und b eintippen, die Kurve erscheint sofort in der Skizze, der Rechner vergleicht mit den Vorjahren */
function GewinnRechner({ versuche, onZeichnen }: { versuche: Kurve[]; onZeichnen: (k: Kurve) => void }) {
  const uid = useId()
  const [eingabe, setEingabe] = useState({ a: '', b: '' })
  const [fehlt, setFehlt] = useState(false)
  const letzter = versuche[versuche.length - 1]
  const getroffen = versuche.some(treffer)
  // Ausprobieren zählt wie eine Festlegung (PUNKTE.festlegung), sobald die Seite frei ist
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const frei = versuche.length >= 3 || getroffen
  useEffect(() => {
    if (frei) pt.geloest()
  }, [frei, pt])
  const kurven: KurveBild[] = versuche.map((k, i) => ({ ...k, art: treffer(k) ? 'treffer' : i === versuche.length - 1 ? 'aktuell' : 'alt' }))

  const zeichnen = () => {
    const a = parseInput(eingabe.a)
    const b = parseInput(eingabe.b)
    if (!a || !b) return setFehlt(true)
    setFehlt(false)
    onZeichnen({ a: a.value, b: b.value })
  }
  const feld = (k: 'a' | 'b', label: string) => (
    <input
      id={`${uid}-${k}`}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={k}
      aria-label={label}
      className="bk-input lp-input lp-input-sm ls-gap"
      value={eingabe[k]}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe({ ...eingabe, [k]: e.target.value })}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') zeichnen()
      }}
    />
  )
  const meldung = (k: Kurve, x: number) => {
    const y = G(x, k.a, k.b)
    const ok = passt(k, x, 200)
    return (
      <li>
        <i className={`fa-solid ${ok ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" /> {x} Hoodies: Deine Kurve zeigt {euro(y)} Gewinn
        {ok ? ', genau wie im Vorjahr.' : <>, im Vorjahr waren es 200 €.</>}
      </li>
    )
  }

  return (
    <div className="hb-rechner" data-no-autocheck>
      <GewinnBild
        xMax={50}
        kurven={kurven}
        label="Koordinatensystem mit den bekannten Punkten (0 | −200), (20 | 200) und (40 | 200) und den Gewinnkurven aus deinen Versuchen"
      />
      <div className="hb-eingabe">
        <span className="hb-gleichung">
          <M>{'y ='}</M> {feld('a', 'Wert für a')} <M>{'x^2 +'}</M> {feld('b', 'Wert für b')} <M>{'x - 200'}</M>
        </span>
        <button type="button" className="bk-btn bk-btn-primary" onClick={zeichnen}>
          <i className="fa-solid fa-chart-line" aria-hidden="true" /> Kurve zeichnen
        </button>
      </div>
      {fehlt && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> Bitte trage für <M>a</M> und <M>b</M> eine Zahl ein, z. B. −1 oder 2,5.
        </div>
      )}
      {letzter && (
        <div className={`hb-display ${treffer(letzter) ? 'hb-display-ok' : ''}`} role="status">
          <div className="hb-display-head">
            <i className="fa-solid fa-shirt" aria-hidden="true" /> Gewinn-Rechner, Versuch {versuche.length}: <M>{`y = ${tx(letzter.a)}x^2 + ${tx(letzter.b)}x - 200`.replace('+ -', '- ')}</M>
          </div>
          <ul>
            {meldung(letzter, 20)}
            {meldung(letzter, 40)}
          </ul>
        </div>
      )}
      {frei && (
        <p className="sl-hinweis">
          {getroffen ? 'Treffer! Aber nächstes Jahr ändern sich die Zahlen, und dann?' : 'Raten bringt dich kaum ans Ziel: Die Kurve muss bei 20 und bei 40 Hoodies gleichzeitig passen.'}{' '}
          Gleich lernst du, wie du <M>a</M> und <M>b</M> sicher berechnest.
        </p>
      )}
    </div>
  )
}

/* ── Phase 3: Bilder und Rechenbeispiele ─────────────────────────────────── */

/** Handlungsprodukt: Heftseite „Gewinn-Steckbrief“ mit vier Feldern (Tabelle, Gleichung, Skizze, Antwort an Finn) */
function SteckbriefBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Eine karierte Heftseite mit der Überschrift Gewinn-Steckbrief Hoodies und vier Feldern: Tabelle, Gleichung, Skizze der Gewinnkurve und Antwort an Finn."
      >
        <rect x="130" y="10" width="460" height="172" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        {Array.from({ length: 22 }, (_, i) => (
          <line key={`v${i}`} x1={140 + i * 20} x2={140 + i * 20} y1="46" y2="176" stroke="var(--grid)" />
        ))}
        <text x="150" y="36" fontSize="20" fontWeight="800" fill="var(--ink)">
          Gewinn-Steckbrief Hoodies
        </text>
        <line x1="150" x2="440" y1="42" y2="42" stroke="var(--primary)" strokeWidth="3" />
        {/* vier Felder */}
        <rect x="150" y="52" width="200" height="56" rx="4" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <text x="160" y="72" fontSize="15" fontWeight="700" fill="var(--primary)">
          Tabelle
        </text>
        <path d="M160 84 h180 M160 98 h180 M205 78 v26 M250 78 v26 M295 78 v26" stroke="var(--ink)" strokeWidth="1.5" />
        <rect x="370" y="52" width="200" height="56" rx="4" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <text x="380" y="72" fontSize="15" fontWeight="700" fill="var(--primary)">
          Gleichung
        </text>
        <text x="380" y="96" fontSize="16" fill="var(--ink)">
          y = ▢x² + ▢x − 200
        </text>
        <rect x="150" y="116" width="200" height="60" rx="4" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <text x="160" y="134" fontSize="15" fontWeight="700" fill="var(--primary)">
          Skizze
        </text>
        <path d="M230 170 Q275 100 320 170" fill="none" stroke="var(--primary)" strokeWidth="3" />
        <line x1="225" x2="335" y1="160" y2="160" stroke="var(--ink)" strokeWidth="1.5" />
        <rect x="370" y="116" width="200" height="60" rx="4" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <text x="380" y="134" fontSize="15" fontWeight="700" fill="var(--primary)">
          Antwort an Finn
        </text>
        <path d="M380 150 h170 M380 166 h120" stroke="var(--line-strong)" strokeWidth="2" />
        <g transform="rotate(-35 650 110)">
          <rect x="600" y="100" width="110" height="18" rx="4" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
          <polygon points="600,100 584,109 600,118" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  )
}

const BSP1_AUFGABE = (
  <p>
    Die Schülerfirma einer Nachbarschule verkauft Jutebeutel. Die Fixkosten sind 100 €. Bei 10 verkauften Beuteln blieben 25 € Gewinn, bei 20 Beuteln 100 €. Stelle die zwei
    Gleichungen für die Gewinnparabel <M>{'y = ax^2 + bx + c'}</M> auf.
  </p>
)
const BSP1_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: <>Den bekannten Wert <M>c</M> einsetzen</>,
    body: (
      <>
        <p>
          Ohne Verkauf (<M>{'x = 0'}</M>) bleiben nur die Fixkosten als Verlust: <M>{'y = -100'}</M>. Bei <M>{'x = 0'}</M> fallen <M>{'a \\cdot 0^2'}</M> und{' '}
          <M>{'b \\cdot 0'}</M> weg, übrig bleibt <M>c</M>. Also ist <M>{'c = -100'}</M>:
        </p>
        <MB>{'y = ax^2 + bx - 100'}</MB>
      </>
    ),
  },
  {
    title: <>Den ersten Punkt <M>{'(10 \\mid 25)'}</M> einsetzen</>,
    body: (
      <>
        <p>
          Für <M>x</M> setzt du 10 ein, für <M>y</M> den Gewinn 25. Dann bringst du die Zahl ohne <M>a</M> und <M>b</M> auf die linke Seite:
        </p>
        <MB>{'\\begin{aligned} 25 &= a \\cdot 10^2 + b \\cdot 10 - 100 \\\\ 25 &= 100a + 10b - 100 && \\mid +100 \\\\ \\text{I: } 125 &= 100a + 10b \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: <>Den zweiten Punkt <M>{'(20 \\mid 100)'}</M> einsetzen</>,
    body: (
      <MB>{'\\begin{aligned} 100 &= a \\cdot 20^2 + b \\cdot 20 - 100 \\\\ 100 &= 400a + 20b - 100 && \\mid +100 \\\\ \\text{II: } 200 &= 400a + 20b \\end{aligned}'}</MB>
    ),
  },
]

const BSP2_AUFGABE = (
  <>
    <p>Die Gleichungen der Jutebeutel-Firma aus Teil 1:</p>
    <MB>{'\\begin{aligned} \\text{I: } 125 &= 100a + 10b \\\\ \\text{II: } 200 &= 400a + 20b \\end{aligned}'}</MB>
    <p>
      Berechne <M>a</M> und <M>b</M> mit dem Additionsverfahren.
    </p>
  </>
)
const BSP2_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Ziel festlegen und passend machen',
    body: (
      <>
        <p>
          Eine Unbekannte soll wegfallen, hier <M>b</M>. Dafür muss vor <M>b</M> in beiden Gleichungen dieselbe Zahl stehen. Vor <M>b</M> stehen 10 und 20. Multipliziere
          Gleichung I auf <strong>beiden</strong> Seiten mit 2:
        </p>
        <MB>{'\\text{I} \\cdot 2{:}\\quad 250 = 200a + 20b'}</MB>
      </>
    ),
  },
  {
    title: 'Die Gleichungen subtrahieren',
    body: (
      <>
        <p>
          Rechne Seite für Seite <M>{'\\text{II} - \\text{I} \\cdot 2'}</M>. Links <M>{'200 - 250'}</M>, rechts <M>{'400a - 200a'}</M> und <M>{'20b - 20b = 0'}</M>. So fällt{' '}
          <M>b</M> weg:
        </p>
        <MB>{'\\begin{aligned} \\text{II: } 200 &= 400a + 20b \\\\ \\text{I} \\cdot 2{:}\\; 250 &= 200a + 20b \\\\ \\hline \\text{II} - \\text{I} \\cdot 2{:}\\; -50 &= 200a \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: <>Nach <M>a</M> auflösen</>,
    body: <MB>{'\\begin{aligned} -50 &= 200a && \\mid :200 \\\\ a &= -0{,}25 \\end{aligned}'}</MB>,
  },
  {
    title: <>
      <M>a</M> in Gleichung I einsetzen und <M>b</M> berechnen
    </>,
    body: <MB>{'\\begin{aligned} 125 &= 100 \\cdot (-0{,}25) + 10b \\\\ 125 &= -25 + 10b && \\mid +25 \\\\ 150 &= 10b && \\mid :10 \\\\ b &= 15 \\end{aligned}'}</MB>,
  },
  {
    title: 'Gleichung angeben und Probe machen',
    body: (
      <>
        <MB>{'y = -0{,}25x^2 + 15x - 100'}</MB>
        <p>
          Probe mit dem zweiten Punkt: <M>{'x = 20{:}\\; y = -0{,}25 \\cdot 400 + 15 \\cdot 20 - 100 = -100 + 300 - 100 = 100 \\;\\checkmark'}</M>
        </p>
      </>
    ),
  },
]

const LOESUNG1 = (
  <>
    <MB>{'\\begin{aligned} 200 &= a \\cdot 20^2 + b \\cdot 20 - 200 \\\\ 200 &= 400a + 20b - 200 && \\mid +200 \\\\ \\text{I: } 400 &= 400a + 20b \\end{aligned}'}</MB>
    <MB>{'\\begin{aligned} 200 &= a \\cdot 40^2 + b \\cdot 40 - 200 \\\\ 200 &= 1600a + 40b - 200 && \\mid +200 \\\\ \\text{II: } 400 &= 1600a + 40b \\end{aligned}'}</MB>
  </>
)

const LOESUNG2 = (
  <>
    <p>
      Vor <M>b</M> stehen 20 und 40. Gleichung I mal 2, dann steht in beiden Gleichungen <M>{'40b'}</M>:
    </p>
    <MB>{'\\begin{aligned} \\text{I} \\cdot 2{:}\\; 800 &= 800a + 40b \\\\ \\text{II} - \\text{I} \\cdot 2{:}\\; 400 - 800 &= 1600a - 800a \\\\ -400 &= 800a && \\mid :800 \\\\ a &= -0{,}5 \\end{aligned}'}</MB>
    <MB>{'\\begin{aligned} \\text{in I: } 400 &= 400 \\cdot (-0{,}5) + 20b \\\\ 400 &= -200 + 20b && \\mid +200 \\\\ 600 &= 20b && \\mid :20 \\\\ b &= 30 \\end{aligned}'}</MB>
    <MB>{'y = -0{,}5x^2 + 30x - 200'}</MB>
    <MB>{'x = 60{:}\\quad y = -0{,}5 \\cdot 60^2 + 30 \\cdot 60 - 200 = -1800 + 1800 - 200 = -200'}</MB>
    <p>Bei 60 Hoodies macht die Schülerfirma 200 € Verlust.</p>
  </>
)

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function SchuelerfirmaEinstieg({ onBack, onPractice, onPrev }: { onBack: () => void; onPractice: () => void; onPrev: () => void }) {
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 400, fest: false })
  const [versuche, setVersuche] = useState<Kurve[]>([])
  const [geloest, setGeloest] = useState(false)
  const [fehler1, setFehler1] = useState(false)
  const [fehler2, setFehler2] = useState(false)
  const [uebungen, setUebungen] = useState<string[]>([])
  /** Pflicht-Übung melden: schaltet „Weiter“ und das Bonus-Spiel frei */
  const uebung = (k: string, fertig: () => void) => () => {
    fertig()
    setUebungen((u) => (u.includes(k) ? u : [...u, k]))
  }

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 10 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) x einsetzen"
            prompt={
              <p>
                Setze <M>{'x = -2'}</M> in <M>{'y = 2x^2 - 3x + 1'}</M> ein. Welchen Wert hat <M>y</M>?
              </p>
            }
            fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 15 }]}
            solution={<MB>{'x = -2{:}\\quad y = 2 \\cdot (-2)^2 - 3 \\cdot (-2) + 1 = 8 + 6 + 1 = 15'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Setze überall, wo <M>x</M> steht, <M>{'(-2)'}</M> mit Klammer ein.</>,
                  <>Erst das Quadrat: <M>{'(-2)^2 = 4'}</M>, also <M>{'2 \\cdot 4 = 8'}</M>.</>,
                  <>
                    <M>{'-3 \\cdot (-2) = +6'}</M>. Zusammen: <M>{'8 + 6 + 1'}</M>.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) Einen Punkt einsetzen"
            prompt={
              <p>
                Die Parabel <M>{'y = ax^2 + bx + 2'}</M> geht durch <M>{'P(3 \\mid 20)'}</M>. Setze P ein. Welche Zahlen stehen vor <M>a</M> und <M>b</M>?
              </p>
            }
            rechnung={[{ l: ['20'], r: [{ luecke: 'q' }, 'a +', { luecke: 'k' }, 'b + 2'] }]}
            fields={[
              { kind: 'num', key: 'q', label: 'Zahl vor a', expected: 9 },
              { kind: 'num', key: 'k', label: 'Zahl vor b', expected: 3 },
            ]}
            solution={<MB>{'20 = a \\cdot 3^2 + b \\cdot 3 + 2 = 9a + 3b + 2'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Für <M>x</M> setzt du die erste Koordinate ein, für <M>y</M> die zweite.</>,
                  <>
                    <M>{'20 = a \\cdot 3^2 + b \\cdot 3 + 2'}</M>
                  </>,
                  <>
                    <M>{'3^2 = 9'}</M>, nicht 6.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={3}
            title="c) Gleichung lösen"
            prompt={
              <p>
                Löse die Gleichung nach <M>a</M> auf. Achte auf das Vorzeichen.
              </p>
            }
            lead={<M>{'-300 = 600a \\qquad \\Rightarrow'}</M>}
            fields={[{ kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -0.5 }]}
            solution={<MB>{'\\begin{aligned} -300 &= 600a && \\mid :600 \\\\ a &= -0{,}5 \\end{aligned}'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Vor <M>a</M> steht 600. Durch welche Zahl teilst du?</>,
                  <>
                    <M>{'\\mid :600'}</M> auf beiden Seiten.
                  </>,
                  <>
                    <M>{'-300 : 600 = -0{,}5'}</M>. Minus durch Plus ergibt Minus.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Minus vor der Klammer"
            prompt={<p>Vereinfache. Trage die Zahl vor <M>b</M> ein.</p>}
            rechnung={[{ l: ['(5a + 3b) - (5a - b)'], r: [{ luecke: 'k' }, 'b'] }]}
            fields={[{ kind: 'num', key: 'k', label: 'Zahl vor b', expected: 4 }]}
            solution={<MB>{'(5a + 3b) - (5a - b) = 5a + 3b - 5a + b = 4b'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Das Minus vor der Klammer dreht jedes Vorzeichen in der Klammer um.</>,
                  <>
                    <M>{'-(5a - b) = -5a + b'}</M>
                  </>,
                  <>
                    <M>{'5a - 5a = 0'}</M>, die <M>a</M> fallen weg. Übrig: <M>{'3b + b'}</M>.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title="e) Eine Gleichung multiplizieren"
            prompt={<p>Multipliziere die Gleichung auf beiden Seiten mit 2.</p>}
            rechnung={[
              { l: ['300'], r: ['100a + 10b'], u: '\\mid \\cdot 2' },
              { l: [{ luecke: 'l' }], r: [{ luecke: 'a', breit: true }, 'a +', { luecke: 'b' }, 'b'] },
            ]}
            fields={[
              { kind: 'num', key: 'l', label: 'linke Seite', expected: 600 },
              { kind: 'num', key: 'a', label: 'Zahl vor a', expected: 200 },
              { kind: 'num', key: 'b', label: 'Zahl vor b', expected: 20 },
            ]}
            solution={<MB>{'300 \\cdot 2 = 100a \\cdot 2 + 10b \\cdot 2 \\quad\\Rightarrow\\quad 600 = 200a + 20b'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Jeder Summand auf beiden Seiten wird mal 2 genommen.</>,
                  <>Links: <M>{'300 \\cdot 2'}</M>. Rechts: <M>{'100a \\cdot 2'}</M> und <M>{'10b \\cdot 2'}</M>.</>,
                  <>Vergiss die linke Seite nicht, sonst stimmt die Gleichung nicht mehr.</>,
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Lohnen sich 60 Hoodies?',
      pflicht: ['fest', 'probieren'],
      bedingung: 'Halte deine Vermutung fest und probiere dreimal im Gewinn-Rechner, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du bist in der Schülerfirma deiner Schule für die Finanzen zuständig. Ihr bedruckt Hoodies mit dem Schullogo und verkauft sie am Sommerfest. Finn aus dem Vorstand will
            dieses Jahr 60 Hoodies bestellen, weil der Lieferant dann Rabatt gibt.
          </p>
          <Zitat wer="Finn im Team-Chat">
            <p>„60 Hoodies auf einmal! Mehr Hoodies, mehr Gewinn, oder? Ich brauche bis Freitag deine Empfehlung.“</p>
          </Zitat>
          <p className="sl-text">
            Aus den letzten Jahren weißt du: Bei 20 verkauften Hoodies blieben 200 € Gewinn, bei 40 Hoodies ebenfalls 200 €. Die Fixkosten für Siebdruckrahmen und Standmiete sind
            200 €, ohne Verkauf macht ihr also 200 € Verlust. Wer mehr Hoodies verkaufen will, muss sie billiger anbieten. Darum beschreibt eine Parabel{' '}
            <M>{'y = ax^2 + bx + c'}</M> den Gewinn (<M>x</M> = verkaufte Hoodies, <M>y</M> = Gewinn in €). Gesucht ist ihre Gleichung und damit der Gewinn bei 60 Hoodies.
          </p>
          <Tabelle head={['verkaufte Hoodies x', '0', '20', '40', '60']} rows={[['Gewinn y in €', '−200', '200', '200', '?']]} />
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst festlegen, dann im Gewinn-Rechner ausprobieren</p>
            <p>
              Was passiert mit dem Gewinn bei 60 Hoodies? Lege dich zuerst fest, ohne zu rechnen. Probier dann im Gewinn-Rechner Werte für <M>a</M> und <M>b</M> aus, bis die Kurve
              zu den Vorjahren passt.
            </p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 10 Minuten.</p>
          <Vermutung
            optionen={WAHL}
            regler={{
              min: -400,
              max: 800,
              step: 50,
              text: (v) => (
                <>
                  Ich schätze den Gewinn bei 60 Hoodies auf <span className="ls-slider-value">{euro(v)}</span>.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig.teil('fest')}
            gespeichert={(w) => (
              <>
                Deine Schätzung für 60 Hoodies: <strong>{euro(w.wert)}</strong>. <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong>
              </>
            )}
          />
          {fest.fest && (
            <Abschnitt titel="Der Gewinn-Rechner der Schülerfirma">
              <p className="sl-text">
                Aylin hat die Fixkosten schon eingetragen: <M>{'c = -200'}</M>. Tippe Werte für <M>a</M> und <M>b</M> ein. Der Rechner zeichnet die Kurve und vergleicht sie mit den
                Vorjahren. Probier es aus, ohne zu rechnen.
              </p>
              <GewinnRechner
                versuche={versuche}
                onZeichnen={(k) => {
                  setVersuche((alt) => [...alt, k])
                  if (versuche.length + 1 >= 3 || treffer(k)) fertig.teil('probieren')()
                }}
              />
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Gewinnfunktion für Finn berechnen',
      pflicht: ['teil1', 'teil2', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, Teil 2 auch in Partnerarbeit, ca. 50 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Stelle die Gewinnfunktion auf und berechne den Gewinn bei 60 Hoodies</p>
            <p>
              Die Gewinnparabel <M>{'y = ax^2 + bx + c'}</M> hat <M>{'c = -200'}</M> (Fixkosten) und geht durch <M>{'(20 \\mid 200)'}</M> und <M>{'(40 \\mid 200)'}</M>. Den
              Scheitelpunkt kennst du nicht. Berechne in deinem Heft <M>a</M> und <M>b</M>, gib die Gleichung in allgemeiner Form an und berechne den Gewinn bei 60 Hoodies.
            </p>
          </div>
          <GewinnBild xMax={70} frage label="Koordinatensystem mit den bekannten Punkten (0 | −200), (20 | 200) und (40 | 200). Bei 60 Hoodies ist der Gewinn mit einem Fragezeichen markiert." />
          <Abschnitt titel="Teil 1: Zwei Gleichungen aufstellen">
            <BeispielMitVideo>
              <Beispiel offen title="Die Jutebeutel der Nachbarschule" aufgabe={BSP1_AUFGABE} steps={BSP1_SCHRITTE} />
            </BeispielMitVideo>
            <CheckCard
              onSolved={fertig.teil('teil1')}
              onFehler={() => setFehler1(true)}
              punkte={10}
              title="Gleichung I und Gleichung II"
              prompt={
                <p>
                  Trage die beiden Gleichungen aus deinem Heft ein. Setze <M>{'c = -200'}</M> und die Punkte ein und bringe die −200 auf die linke Seite. Jedes Feld zeigt dir sofort,
                  ob es stimmt.
                </p>
              }
              rechnung={[
                { l: ['\\text{I: }', { luecke: 'l1' }], r: [{ luecke: 'a1', breit: true }, 'a +', { luecke: 'b1' }, 'b'], u: '\\text{aus } (20 \\mid 200)' },
                { l: ['\\text{II: }', { luecke: 'l2' }], r: [{ luecke: 'a2', breit: true }, 'a +', { luecke: 'b2' }, 'b'], u: '\\text{aus } (40 \\mid 200)' },
              ]}
              fields={[
                { kind: 'num', key: 'l1', label: 'linke Seite von Gleichung I', expected: 400 },
                { kind: 'num', key: 'a1', label: 'Zahl vor a in Gleichung I', expected: 400 },
                { kind: 'num', key: 'b1', label: 'Zahl vor b in Gleichung I', expected: 20 },
                { kind: 'num', key: 'l2', label: 'linke Seite von Gleichung II', expected: 400 },
                { kind: 'num', key: 'a2', label: 'Zahl vor a in Gleichung II', expected: 1600 },
                { kind: 'num', key: 'b2', label: 'Zahl vor b in Gleichung II', expected: 40 },
              ]}
              loesungNachFehler
              solution={LOESUNG1}
              help={
                <Hilfen
                  steps={[
                    <>Wie im Rechenbeispiel: Erst <M>c</M> einsetzen, dann für jeden Punkt <M>x</M> und <M>y</M> einsetzen.</>,
                    <>
                      Punkt <M>{'(20 \\mid 200)'}</M>: <M>{'200 = a \\cdot 20^2 + b \\cdot 20 - 200'}</M>. Rechne <M>{'20^2'}</M> aus.
                    </>,
                    <>
                      <M>{'200 = 400a + 20b - 200'}</M>. Mit <M>{'\\mid +200'}</M> steht links 400. Für <M>{'(40 \\mid 200)'}</M> genauso mit <M>{'40^2 = 1600'}</M>.
                    </>,
                  ]}
                />
              }
            />
            <Fehlersuche fehler={fehler1}>
              <CheckCard
                title="Fehlersuche: Wo steckt der Fehler?"
                rechnen={false}
                ohnePunkte
                prompt={<p>Prüfe deine Zwischenergebnisse. Das erste rote Feld zeigt dir, in welchem Schritt du nachrechnen musst.</p>}
                rechnung={[
                  { l: ['200'], r: ['a \\cdot', { luecke: 'q1', breit: true }, '+ b \\cdot 20 - 200'], u: '\\text{① } 20^2' },
                  { l: [{ luecke: 'z' }], r: ['400a + 20b'], u: '\\text{② } \\mid +200' },
                  { l: ['200'], r: ['a \\cdot', { luecke: 'q2', breit: true }, '+ b \\cdot 40 - 200'], u: '\\text{③ } 40^2' },
                ]}
                fields={[
                  { kind: 'num', key: 'q1', label: '20 zum Quadrat', expected: 400 },
                  { kind: 'num', key: 'z', label: 'linke Seite nach | +200', expected: 400 },
                  { kind: 'num', key: 'q2', label: '40 zum Quadrat', expected: 1600 },
                ]}
              />
            </Fehlersuche>
          </Abschnitt>
          <Abschnitt titel="Teil 2: Das Gleichungssystem lösen">
            <p className="sl-text">
              In beiden Gleichungen stecken zwei Unbekannte. Finn meint: „Aus Gleichung I rechne ich einfach <M>a</M> aus.“ Das klappt nicht: <M>{'400 = 400a + 20b'}</M> passt zu
              vielen Paaren, zum Beispiel <M>{'a = 1, b = 0'}</M> oder <M>{'a = 0, b = 20'}</M>. Du brauchst ein Werkzeug, das beide Gleichungen zusammen nutzt: das{' '}
              <strong>Additionsverfahren</strong>. Damit fällt eine Unbekannte weg.
            </p>
            <BeispielMitVideo video={VIDEO_FALL2} videoTitel="Lernvideo: Funktionsgleichung aufstellen – Fall 2">
              <Beispiel offen ab={4} title="Die Jutebeutel: das Additionsverfahren" aufgabe={BSP2_AUFGABE} steps={BSP2_SCHRITTE} />
            </BeispielMitVideo>
            <CheckCard
              onSolved={() => {
                fertig.teil('teil2')()
                setGeloest(true)
              }}
              onFehler={() => setFehler2(true)}
              punkte={14}
              title="Die Gewinnfunktion"
              prompt={
                <>
                  <MB>{'\\begin{aligned} \\text{I: } 400 &= 400a + 20b \\\\ \\text{II: } 400 &= 1600a + 40b \\end{aligned}'}</MB>
                  <p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>
                </>
              }
              fields={[
                { kind: 'num', key: 'a', label: <>Welchen Wert hat <M>a</M>? <M>{'a ='}</M></>, expected: A },
                { kind: 'num', key: 'b', label: <>Welchen Wert hat <M>b</M>? <M>{'b ='}</M></>, expected: B },
                { kind: 'num', key: 'g', label: <>Wie viel Gewinn macht die Schülerfirma mit 60 Hoodies? <M>{'y ='}</M></>, expected: G(60), unit: '€' },
              ]}
              loesungNachFehler
              solution={LOESUNG2}
              help={
                <Hilfen
                  steps={[
                    <>Welche Unbekannte lässt sich leichter loswerden? Schau auf die Zahlen vor <M>b</M>: 20 und 40.</>,
                    <>
                      Multipliziere Gleichung I mit 2. Dann steht vor <M>b</M> in beiden Gleichungen 40, und beim Subtrahieren fällt <M>b</M> weg.
                    </>,
                    <>
                      <M>{'\\text{I} \\cdot 2{:}\\; 800 = 800a + 40b'}</M>. Rechne <M>{'\\text{II} - \\text{I} \\cdot 2'}</M>: links <M>{'400 - 800'}</M>, rechts{' '}
                      <M>{'1600a - 800a'}</M>. Setze <M>a</M> danach in Gleichung I ein.
                    </>,
                  ]}
                />
              }
            />
            <Fehlersuche fehler={fehler2}>
              <CheckCard
                title="Fehlersuche: Wo steckt der Fehler?"
                rechnen={false}
                ohnePunkte
                prompt={<p>Prüfe deine Zwischenergebnisse. Das erste rote Feld zeigt dir, in welchem Schritt du nachrechnen musst.</p>}
                rechnung={[
                  { l: ['\\text{I} \\cdot 2{:}\\;', { luecke: 'l', breit: true }], r: [{ luecke: 'k', breit: true }, 'a + 40b'], u: '\\text{① mal 2}' },
                  { l: ['\\text{II} - \\text{I} \\cdot 2{:}\\;', { luecke: 'd', breit: true }], r: [{ luecke: 'k2', breit: true }, 'a'], u: '\\text{② subtrahieren}' },
                  { l: ['400'], r: [{ luecke: 'm', breit: true }, '+ 20b'], u: '\\text{③ } 400 \\cdot a \\text{ in I}' },
                  { l: ['-0{,}5 \\cdot 60^2'], r: [{ luecke: 'q', breit: true }], u: '\\text{④ } x = 60' },
                ]}
                fields={[
                  { kind: 'num', key: 'l', label: 'linke Seite von I mal 2', expected: 800 },
                  { kind: 'num', key: 'k', label: 'Zahl vor a in I mal 2', expected: 800 },
                  { kind: 'num', key: 'd', label: 'linke Seite nach dem Subtrahieren', expected: -400 },
                  { kind: 'num', key: 'k2', label: 'Zahl vor a nach dem Subtrahieren', expected: 800 },
                  { kind: 'num', key: 'm', label: '400 mal a nach dem Einsetzen', expected: -200 },
                  { kind: 'num', key: 'q', label: '−0,5 mal 60 zum Quadrat', expected: -1800 },
                ]}
              />
            </Fehlersuche>
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Deine Empfehlung an Finn">
              <McCard
                onSolved={fertig.teil('entscheidung')}
                punkte={3}
                title="Was empfiehlst du?"
                prompt={<p>Finn wartet auf deine Antwort. Was schreibst du ihm?</p>}
                options={[
                  { text: 'Bestellen! Mehr Hoodies bringen mehr Gewinn.', feedback: 'Deine Rechnung zeigt etwas anderes: Bei 60 Hoodies ist y negativ.' },
                  { text: 'Bestellen, der Gewinn bleibt wie bisher bei 200 €.', feedback: 'Bei 20 und 40 Hoodies waren es 200 €. Bei 60 Hoodies hast du y = −200 berechnet.' },
                  {
                    text: 'Nicht bestellen: Mit 60 Hoodies macht die Schülerfirma 200 € Verlust.',
                    correct: true,
                    feedback: 'Genau. Wer 60 Hoodies loswerden will, muss so billig werden, dass sich das Geschäft nicht mehr lohnt.',
                  },
                  { text: 'Egal, bei 60 Hoodies ist der Gewinn genau 0 €.', feedback: 'Bei y = 0 wäre weder Gewinn noch Verlust. Du hast aber y = −200 berechnet, also Verlust.' },
                ]}
              />
            </Abschnitt>
          )}
          <Handlungsprodukt titel="Gewinn-Steckbrief für Finn">
            <SteckbriefBild />
            <p className="sl-text">
              Gestalte in deinem Heft einen Gewinn-Steckbrief für die Hoodies mit vier Feldern: eine Tabelle, die Gleichung mit deiner Rechnung, eine Skizze der Gewinnkurve und deine
              Antwort an Finn. So sieht Finn auf einen Blick, warum du ihm abrätst.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Ohne Verkauf haben wir 200 € Verlust, deshalb ist c = …“</li>
                <li>„Mit den Vorjahren bekomme ich zwei Gleichungen: I: … und II: …“</li>
                <li>„Ich nehme Gleichung I mal 2, damit beim Subtrahieren … wegfällt.“</li>
                <li>„Hallo Finn, bei 60 Hoodies machen wir …, weil …“</li>
                <li>
                  „Abkürzungen: <M>x</M> = …, <M>y</M> = …, <M>c</M> = …, I und II = …“
                </li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Steckbrief vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                'Eine Tabelle mit dem Gewinn bei 0, 20, 40 und 60 Hoodies',
                'Die Gleichungen I und II und das Additionsverfahren mit den Umformungen (z. B. „I · 2“ und „II − I · 2“) bis zur Gewinnfunktion',
                'Eine Skizze der Gewinnkurve mit den vier Punkten aus der Tabelle und dem Verlustbereich unter der x-Achse',
                'Deine Antwort an Finn mit Empfehlung und Begründung',
                <>
                  Im Steckbrief steht, wofür die Abkürzungen stehen: <M>x</M> (verkaufte Hoodies), <M>y</M> (Gewinn in €), <M>a</M>, <M>b</M> und <M>c</M> (die Werte der
                  Parabel, <M>c</M> = Gewinn ohne Verkauf, also minus die Fixkosten) und I, II (die beiden Gleichungen). Außerdem erklärst du die Begriffe „Fixkosten“,
                  „Gleichungssystem“ und „Additionsverfahren“ und alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug fest={fest} versuche={versuche} />
              <Merke title="Das Additionsverfahren">
                <p>Zwei Gleichungen mit zwei Unbekannten löst du, indem du sie so addierst oder subtrahierst, dass eine Unbekannte wegfällt.</p>
                <ul className="zk-liste">
                  <li>Gleiche Zahl vor der Unbekannten: Gleichungen subtrahieren.</li>
                  <li>Gegenzahlen vor der Unbekannten (z. B. +2b und −2b): Gleichungen addieren.</li>
                  <li>Sonst vorher eine Gleichung auf beiden Seiten mit einer passenden Zahl multiplizieren.</li>
                </ul>
                <p>Danach die eine Unbekannte berechnen, in eine Ausgangsgleichung einsetzen und die zweite Unbekannte berechnen.</p>
              </Merke>
              <Merke title="Funktionsgleichung aus einem Wert und zwei Punkten (Fall 2)">
                <ol className="zk-liste" style={{ listStyleType: 'decimal' }}>
                  <li>
                    Den bekannten Wert (<M>a</M>, <M>b</M> oder <M>c</M>) in <M>{'y = ax^2 + bx + c'}</M> einsetzen.
                  </li>
                  <li>Beide Punkte einsetzen. Es entstehen Gleichung I und Gleichung II mit den zwei fehlenden Werten.</li>
                  <li>Das Gleichungssystem mit dem Additionsverfahren lösen.</li>
                  <li>Alle drei Werte in die allgemeine Form einsetzen und mit einem Punkt die Probe machen.</li>
                </ol>
                <Tabelle
                  head={['bekannt', 'beim Subtrahieren fällt weg', 'zuerst berechnen']}
                  rows={[
                    ['a (z. B. verschobene Normalparabel a = 1)', 'c', 'b, dann c'],
                    ['b', 'c', 'a, dann c'],
                    ['c (y-Achsenabschnitt)', 'b (vorher multiplizieren)', 'a, dann b'],
                  ]}
                />
              </Merke>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      pflicht: ['1', '2', '3', '4'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die fünfte ist freiwillig für Profis. Wenn du die vier Pflichtaufgaben gelöst hast, wartet unten ein Spiel auf dich.
            Einzelarbeit, ca. 25 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Punkt einsetzen">
            <McCard
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              title="Übung 1"
              level="basis"
              rechnen
              prompt={
                <p>
                  Eine Parabel hat die Gleichung <M>{'y = ax^2 + bx + 4'}</M> und geht durch <M>{'P(2 \\mid 10)'}</M>. Welche Gleichung entsteht beim Einsetzen von P?
                </p>
              }
              options={[
                { text: <M>{'10 = 2a + 2b + 4'}</M>, feedback: 'Vor a steht x², also 2² = 4, nicht 2.' },
                { text: <M>{'10 = 4a + 2b + 4'}</M>, correct: true, feedback: 'a · 2² + b · 2 + 4 = 4a + 2b + 4. Nach −4 auf beiden Seiten: 6 = 4a + 2b.' },
                { text: <M>{'2 = 100a + 10b + 4'}</M>, feedback: 'x und y sind vertauscht. Für x wird 2 eingesetzt, für y die 10.' },
                { text: <M>{'10 = 4a + 2b'}</M>, feedback: 'Das c = 4 darf nicht verloren gehen. Es gehört mit in die Gleichung.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <McCard
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={5}
              title="Übung 2"
              level="standard"
              rechnen
              prompt={
                <>
                  <MB>{'\\begin{aligned} \\text{I: } 2a + 3b &= 12 \\\\ \\text{II: } 2a - b &= 4 \\end{aligned}'}</MB>
                  <p>Lena rechnet I − II und schreibt: „2b = 8, also b = 4.“ Rechne selbst nach. Was stimmt?</p>
                </>
              }
              options={[
                { text: 'Lena hat recht: b = 4.', feedback: 'Probe in II: Mit b = 4 wäre 2a = 8, also a = 4. In I: 8 + 12 = 20 ≠ 12. Lena hat 3b − (−b) falsch gerechnet.' },
                { text: 'Falsch, man darf hier nicht subtrahieren, sondern muss addieren.', feedback: 'Subtrahieren ist richtig, denn vor a steht in beiden Gleichungen 2a. Lena hat sich nur beim Vorzeichen verrechnet.' },
                { text: 'Falsch, richtig ist 4b = 16, also b = 4.', feedback: 'Rechts gilt 12 − 4 = 8, nicht 16. Links stimmt 4b.' },
                { text: 'Falsch, richtig ist 4b = 8, also b = 2 und a = 3.', correct: true, feedback: '3b − (−b) = 3b + b = 4b. Das Minus vor dem −b macht ein Plus. Also b = 2, dann 2a − 2 = 4 und a = 3.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Verschobene Normalparabel">
            <CheckCard
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Eine verschobene Normalparabel (<M>{'a = 1'}</M>) geht durch <M>{'P(1 \\mid 2)'}</M> und <M>{'Q(3 \\mid 6)'}</M>. Bestimme <M>b</M> und <M>c</M>.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -2 },
                { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 3 },
              ]}
              solution={
                <>
                  <MB>{'\\begin{aligned} \\text{I: } 2 &= 1 + b + c &&\\Rightarrow\\; 1 = b + c \\\\ \\text{II: } 6 &= 9 + 3b + c &&\\Rightarrow\\; -3 = 3b + c \\end{aligned}'}</MB>
                  <MB>{'\\text{I} - \\text{II}{:}\\quad 4 = -2b \\;\\Rightarrow\\; b = -2 \\qquad \\text{in I: } 1 = -2 + c \\;\\Rightarrow\\; c = 3'}</MB>
                  <p>
                    <M>{'y = x^2 - 2x + 3'}</M>. Probe mit <M>{'x = 3{:}\\; y = 9 - 6 + 3 = 6 \\;\\checkmark'}</M>
                  </p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Setze <M>{'a = 1'}</M> ein: <M>{'y = x^2 + bx + c'}</M>. Dann beide Punkte einsetzen.</>,
                    <>Bring die Zahl, die aus <M>{'x^2'}</M> entsteht, auf die linke Seite. Vor <M>c</M> steht dann in beiden Gleichungen 1.</>,
                    <>
                      <M>{'\\text{I: } 1 = b + c'}</M> und <M>{'\\text{II: } -3 = 3b + c'}</M>. Rechne I − II, dann fällt <M>c</M> weg.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Die Cap-Kalkulation">
            <CheckCard
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Die Schülerfirma verkauft auch Caps. Fixkosten: 60 €. Bei 10 verkauften Caps blieben 40 € Gewinn, bei 30 Caps 120 €. Stelle die Gewinnfunktion{' '}
                  <M>{'y = ax^2 + bx + c'}</M> auf. Erkläre im Heft, welche Unbekannte du wegfallen lässt und womit du dafür multiplizierst.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -0.2 },
                { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: 12 },
                { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: -60 },
              ]}
              solution={
                <>
                  <p>
                    Ohne Verkauf bleiben 60 € Verlust, also <M>{'c = -60'}</M>.
                  </p>
                  <MB>{'\\begin{aligned} \\text{I: } 40 &= 100a + 10b - 60 &&\\Rightarrow\\; 100 = 100a + 10b \\\\ \\text{II: } 120 &= 900a + 30b - 60 &&\\Rightarrow\\; 180 = 900a + 30b \\end{aligned}'}</MB>
                  <MB>{'\\text{I} \\cdot 3{:}\\; 300 = 300a + 30b \\qquad \\text{II} - \\text{I} \\cdot 3{:}\\; -120 = 600a \\;\\Rightarrow\\; a = -0{,}2'}</MB>
                  <MB>{'\\text{in I: } 100 = 100 \\cdot (-0{,}2) + 10b = -20 + 10b \\;\\Rightarrow\\; b = 12'}</MB>
                  <p>
                    <M>{'y = -0{,}2x^2 + 12x - 60'}</M>. Probe mit <M>{'x = 30{:}\\; y = -180 + 360 - 60 = 120 \\;\\checkmark'}</M>
                  </p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Die Fixkosten liefern <M>c</M>. Dann beide Punkte einsetzen und die −60 nach links bringen.</>,
                    <>
                      <M>{'\\text{I: } 100 = 100a + 10b'}</M>, <M>{'\\text{II: } 180 = 900a + 30b'}</M>. Vor <M>b</M> stehen 10 und 30.
                    </>,
                    <>Multipliziere Gleichung I mit 3 und rechne II − I · 3.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Wie viele Hoodies sind ideal?">
            <CheckCard
              punkte={9}
              title="Übung 5"
              profi
              level="erweiterung"
              prompt={
                <p>
                  Finn fragt: „Okay, keine 60. Aber wie viele Hoodies sollen wir verkaufen?“ Bestimme den Scheitelpunkt der Gewinnparabel <M>{'y = -0{,}5x^2 + 30x - 200'}</M>.
                  Tipp: Die Punkte <M>{'(20 \\mid 200)'}</M> und <M>{'(40 \\mid 200)'}</M> haben denselben y-Wert. Begründe im Heft, warum das hilft.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'x', label: <>Anzahl <M>{'x_S ='}</M></>, expected: 30 },
                { kind: 'num', key: 'y', label: <>Gewinn <M>{'y_S ='}</M></>, unit: '€', expected: 250 },
              ]}
              solution={
                <>
                  <p>Eine Parabel ist symmetrisch. Zwei Punkte mit demselben y-Wert liegen gleich weit links und rechts vom Scheitel, der also genau in der Mitte liegt:</p>
                  <MB>{'x_S = \\frac{20 + 40}{2} = 30 \\qquad x = 30{:}\\; y_S = -0{,}5 \\cdot 30^2 + 30 \\cdot 30 - 200 = 250'}</MB>
                  <p>Bei 30 verkauften Hoodies ist der Gewinn mit 250 € am größten.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Der Scheitelpunkt ist hier der höchste Punkt der Parabel.</>,
                    <>Wegen der Symmetrie liegt der Scheitel genau in der Mitte zwischen zwei Punkten mit demselben y-Wert.</>,
                    <>
                      Die Mitte zwischen 20 und 40 ist 30. Setze <M>{'x = 30'}</M> ein und berechne den Gewinn.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Hoodie-Kanone">
            <HoodieKanone />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt das Additionsverfahren anwenden und die Gleichung einer Parabel aus einem Wert und zwei Punkten aufstellen. In den Übungsaufgaben trainierst du Fall 2
              weiter, auch gemischt mit Fall 1.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onPrev}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zu Lernsituation 1
              </button>
              <button type="button" className="bk-btn" onClick={onBack}>
                Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Fall 2 <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell
      title="Funktionsgleichung aufstellen: Die Hoodie-Bestellung"
      width="wide"
      kompakt
      parent={{ to: '/quadratische_funktionen/funktionsgleichung_aufstellen', label: 'Funktionsgleichung aufstellen' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={
          <>
            Du berätst als Finanzchefin oder Finanzchef deine Schülerfirma. Du lernst das Additionsverfahren kennen und stellst damit die Gleichung einer Parabel auf, wenn ein Wert
            (<M>a</M>, <M>b</M> oder <M>c</M>) und zwei Punkte bekannt sind.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Festlegung und die Versuche im Gewinn-Rechner aus Phase 2 */
function Rueckbezug({ fest, versuche }: { fest: Festlegung<Wahl>; versuche: Kurve[] }) {
  const bester = versuche.length ? versuche.reduce((x, y) => (daneben(y) < daneben(x) ? y : x)) : null
  const diff = Math.abs(fest.wert - G(60))
  return (
    <div className="ls-back">
      {fest.fest && fest.wahl && (
        <p>
          <strong>Du hattest vermutet:</strong> {WAHL[fest.wahl]} Deine Schätzung: {euro(fest.wert)}.{' '}
          {fest.wahl === 'verlust' ? 'Das stimmt, gut eingeschätzt!' : 'Tatsächlich macht die Schülerfirma bei 60 Hoodies 200 € Verlust.'}{' '}
          {diff === 0 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${fmt(diff, 0)} € daneben.`}
        </p>
      )}
      {bester && (
        <p>
          Im Gewinn-Rechner hattest du {versuche.length} Versuche. Dein bester war <M>{`y = ${tx(bester.a)}x^2 + ${tx(bester.b)}x - 200`.replace('+ -', '- ')}</M>
          {treffer(bester) ? ', ein Treffer!' : <>, zusammen {euro(daneben(bester))} neben den Vorjahren.</>} Gerechnet weißt du es sicher:{' '}
          <M>{'y = -0{,}5x^2 + 30x - 200'}</M>. Mehr Hoodies heißt nicht mehr Gewinn: Bei 20 und 40 Hoodies sind es je 200 €, bei 60 Hoodies 200 € Verlust.
        </p>
      )}
    </div>
  )
}
