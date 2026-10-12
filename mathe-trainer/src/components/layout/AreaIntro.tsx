import type { ReactNode } from 'react'
import type { AreaId } from '../../data/areas'

// Einführung oben auf jeder Bereichsseite (Heft-Design „Heftnotiz“): links ein kurzer Text,
// rechts ein eingeklebter Merkzettel mit Formel, zwei handschriftlichen Randnotizen und einer Skizze.
// Die Skizzen sind maßstabsgetreu: 1 Einheit = 20 px, sofern nicht anders angegeben.

interface Intro {
  heading: string
  text: ReactNode[]
  formula: ReactNode
  /** Randnotiz unten links (Farbe A) und oben rechts (Farbe B) */
  noteA: ReactNode
  noteB: ReactNode
  sketch: ReactNode
  sketchLabel: string
}

const A = '#1d3f9e' // Füller-Blau
const B = '#8a5a00' // Ocker
const RED = '#b8322a'
const HAND = 'Caveat, cursive'

const Frac = ({ top, bottom }: { top: ReactNode; bottom: ReactNode }) => (
  <span className="ai-frac">
    <span>{top}</span>
    <span>{bottom}</span>
  </span>
)

const KaroDefs = ({ id }: { id: string }) => (
  <defs>
    <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M20 0H0V20" fill="none" stroke="#e6ebf2" />
    </pattern>
  </defs>
)

const INTROS: Record<AreaId, Intro> = {
  rechnen: {
    heading: 'Darum geht’s in diesem Kapitel',
    text: [
      <>Brüche, Prozente, Potenzen, Wurzeln, Terme und Gleichungen sind das <strong>Handwerkszeug</strong> für alle anderen Kapitel – vom Zinsrechnen bis zur Parabel.</>,
      <>Wer die <strong>Rechenreihenfolge</strong> sicher beherrscht, macht die wenigsten Flüchtigkeitsfehler.</>,
    ],
    formula: <>( ) → x² → · : → + −</>,
    noteA: <>zuerst<br />die Klammer</>,
    noteB: <>· und : vor<br />+ und −</>,
    sketchLabel: 'Rechenbeispiel: 3 + 2 · (4 − 1)² = 21, Schritt für Schritt',
    sketch: (
      <svg viewBox="0 0 440 200" role="img" aria-label="Rechenbeispiel: 3 + 2 · (4 − 1)² = 21, Schritt für Schritt">
        <KaroDefs id="ai-k-rechnen" />
        <rect width="440" height="200" fill="url(#ai-k-rechnen)" />
        <g fontFamily={HAND} fontSize="28" fill="#1b2433">
          <text x="30" y="40">3 + 2 · (4 − 1)²</text>
          <text x="30" y="80">= 3 + 2 · 3²</text>
          <text x="30" y="120">= 3 + 2 · 9</text>
          <text x="30" y="160">= 3 + 18</text>
          <text x="30" y="196" fontWeight="700" fill={A}>= 21</text>
        </g>
        <g fontFamily={HAND} fontSize="22" fill={RED}>
          <text x="250" y="80">Klammer</text>
          <text x="250" y="120">Potenz</text>
          <text x="250" y="160">Punkt</text>
          <text x="250" y="196">Strich</text>
        </g>
      </svg>
    ),
  },

  finanz: {
    heading: 'Darum geht’s in diesem Kapitel',
    text: [
      <>Sparen, Kredite, Ratenkauf: Überall wird Geld <strong>verzinst</strong>. Beim Zinseszins bekommst du im nächsten Jahr auch Zinsen auf die Zinsen – das Kapital wächst jedes Jahr ein bisschen schneller.</>,
      <>Mit einer einzigen Formel berechnest du, wie viel aus deinem Geld wird.</>,
    ],
    formula: <>K<sub>n</sub> = <span style={{ color: B }}>K<sub>0</sub></span> · <span style={{ color: A }}>q</span><sup>n</sup></>,
    noteA: <>Zinsfaktor:<br />q = 1 + p : 100</>,
    noteB: <>Startkapital</>,
    sketchLabel: '1.000 € zu 5 % Zinsen: Kapital nach 0 bis 5 Jahren als Säulen',
    sketch: (
      <svg viewBox="0 0 440 200" role="img" aria-label="1.000 € zu 5 % Zinsen: Kapital nach 0 bis 5 Jahren als Säulen">
        <KaroDefs id="ai-k-finanz" />
        <rect width="440" height="200" fill="url(#ai-k-finanz)" />
        <path d="M30 170H300" stroke="#1b2433" strokeWidth="1.5" />
        {/* Säulenhöhe: 0,1 px pro Euro (1000 € = 100 px) */}
        {[1000, 1050, 1102.5, 1157.63, 1215.51, 1276.28].map((k, i) => (
          <g key={i}>
            <rect x={40 + i * 44} y={170 - k / 10} width="30" height={k / 10} fill={A} opacity={0.35 + i * 0.13} />
            <text x={55 + i * 44} y="188" fontSize="13" textAnchor="middle" fill="#5b6472">{i}</text>
          </g>
        ))}
        <text x="300" y="188" fontSize="12" textAnchor="end" fill="#5b6472">Jahre</text>
        <text x="40" y="26" fontFamily={HAND} fontSize="22" fill={RED}>K₅ = 1000 € · 1,05⁵ ≈ 1276,28 €</text>
      </svg>
    ),
  },

  linear: {
    heading: 'Darum geht’s in diesem Kapitel',
    text: [
      <>Eine lineare Funktion beschreibt alles, was <strong>gleichmäßig wächst oder fällt</strong> – ein Handytarif mit Grundgebühr, eine Kerze, die jede Stunde gleich viel kürzer wird, oder ein Taxi mit Kilometerpreis. Ihr Graph ist immer eine <strong>Gerade</strong>.</>,
      <>Wenn du verstehst, was <em>m</em> und <em>t</em> bedeuten, kannst du jede Aufgabe in diesem Kapitel lösen.</>,
    ],
    formula: <>y = <u style={{ color: A }}>m</u> · x + <u style={{ color: B }}>t</u></>,
    noteA: <>Steigung:<br />1 nach rechts, m nach oben</>,
    noteB: <>y-Achsenabschnitt:<br />hier startet die Gerade</>,
    sketchLabel: 'Gerade y = 0,5x + 1 mit Steigungsdreieck und markiertem y-Achsenabschnitt',
    sketch: (
      <svg viewBox="0 0 440 200" role="img" aria-label="Gerade y = 0,5x + 1 mit Steigungsdreieck und markiertem y-Achsenabschnitt">
        <KaroDefs id="ai-k-linear" />
        <rect width="440" height="200" fill="url(#ai-k-linear)" />
        <path d="M10 160H430M80 196V6" stroke="#1b2433" strokeWidth="1.5" />
        <path d="M424 156l7 4-7 4M76 12l4-7 4 7" fill="none" stroke="#1b2433" strokeWidth="1.5" />
        <path d="M40 160 L420 -30" stroke={A} strokeWidth="3" strokeLinecap="round" />
        <path d="M160 100H240V60" fill="none" stroke={A} strokeWidth="2" strokeDasharray="5 4" />
        <text x="192" y="118" fontSize="14" fontWeight="700" fill={A}>4</text>
        <text x="248" y="85" fontSize="14" fontWeight="700" fill={A}>2</text>
        <text x="268" y="100" fontFamily={HAND} fontSize="22" fill={A}>m = 2 : 4 = 0,5</text>
        <circle cx="80" cy="140" r="5" fill={B} />
        <text x="90" y="156" fontFamily={HAND} fontSize="22" fill={B}>t = 1</text>
      </svg>
    ),
  },

  quadrat: {
    heading: 'Darum geht’s in diesem Kapitel',
    text: [
      <>Ein geworfener Ball, der Strahl eines Springbrunnens oder ein Brückenbogen: Diese Kurven heißen <strong>Parabeln</strong>. Sie gehören zu quadratischen Funktionen.</>,
      <>Der wichtigste Punkt ist der <strong>Scheitelpunkt</strong> – der höchste oder tiefste Punkt der Parabel. In der Scheitelform kannst du ihn direkt ablesen.</>,
    ],
    formula: <>f(x) = <u style={{ color: A }}>a</u> · (x − <span style={{ color: B }}>d</span>)² + <span style={{ color: B }}>e</span></>,
    noteA: <>a &gt; 0: nach oben offen<br />a &lt; 0: nach unten offen</>,
    noteB: <>Scheitelpunkt<br />S(d | e)</>,
    sketchLabel: 'Parabel f(x) = 0,5 · (x − 3)² − 2 mit Scheitelpunkt S(3 | −2) und Nullstellen bei 1 und 5',
    sketch: (
      <svg viewBox="0 0 440 200" role="img" aria-label="Parabel f(x) = 0,5 · (x − 3)² − 2 mit Scheitelpunkt S(3 | −2) und Nullstellen bei 1 und 5">
        <KaroDefs id="ai-k-quadrat" />
        <rect width="440" height="200" fill="url(#ai-k-quadrat)" />
        <path d="M10 120H430M100 196V6" stroke="#1b2433" strokeWidth="1.5" />
        <path d="M424 116l7 4-7 4M96 12l4-7 4 7" fill="none" stroke="#1b2433" strokeWidth="1.5" />
        {/* Ursprung (100|120); Parabel exakt als quadratische Bézierkurve von x = −1 bis x = 7 */}
        <path d="M80 0 Q160 320 240 0" fill="none" stroke={A} strokeWidth="3" strokeLinecap="round" />
        <circle cx="160" cy="160" r="5" fill={B} />
        <circle cx="120" cy="120" r="4" fill={RED} />
        <circle cx="200" cy="120" r="4" fill={RED} />
        <text x="172" y="182" fontFamily={HAND} fontSize="22" fill={B}>S(3 | −2)</text>
        <text x="250" y="110" fontFamily={HAND} fontSize="22" fill={RED}>x₁ = 1, x₂ = 5</text>
        <text x="238" y="40" fontFamily={HAND} fontSize="20" fill={A}>f(x) = 0,5 · (x − 3)² − 2</text>
      </svg>
    ),
  },

  daten: {
    heading: 'Darum geht’s in diesem Kapitel',
    text: [
      <>Wie wahrscheinlich ist ein Sechser beim Würfeln, ein Gewinn beim Glücksrad oder zweimal Kopf beim Münzwurf? Wahrscheinlichkeiten beschreiben, wie oft ein Ergebnis <strong>auf lange Sicht</strong> eintritt.</>,
      <>Bei mehrstufigen Versuchen hilft dir das <strong>Baumdiagramm</strong>: Entlang eines Pfades wird multipliziert.</>,
    ],
    formula: <>P(E) = <Frac top={<span style={{ color: A }}>günstige</span>} bottom={<span style={{ color: B }}>mögliche</span>} /></>,
    noteA: <>Ergebnisse,<br />die zu E passen</>,
    noteB: <>alle Ergebnisse,<br />gleich wahrscheinlich</>,
    sketchLabel: 'Baumdiagramm für zwei Münzwürfe: P(Kopf, Kopf) = 1/2 · 1/2 = 1/4',
    sketch: (
      <svg viewBox="0 0 440 200" role="img" aria-label="Baumdiagramm für zwei Münzwürfe: P(Kopf, Kopf) = 1/2 · 1/2 = 1/4">
        <KaroDefs id="ai-k-daten" />
        <rect width="440" height="200" fill="url(#ai-k-daten)" />
        <g stroke="#1b2433" strokeWidth="1.5">
          <path d="M30 100L130 50M30 100L130 150" />
          <path d="M150 50L250 25M150 50L250 75M150 150L250 125M150 150L250 175" />
        </g>
        <path d="M30 100L130 50M150 50L250 25" stroke={A} strokeWidth="4" strokeLinecap="round" />
        <g fontSize="16" fontWeight="700" fill="#1b2433" textAnchor="middle">
          <text x="140" y="55">K</text><text x="140" y="155">Z</text>
          <text x="262" y="30">K</text><text x="262" y="80">Z</text><text x="262" y="130">K</text><text x="262" y="180">Z</text>
        </g>
        <g fontFamily={HAND} fontSize="20" fill="#5b6472">
          <text x="62" y="66">½</text><text x="62" y="146">½</text>
          <text x="190" y="30">½</text><text x="190" y="78">½</text>
        </g>
        <text x="285" y="104" fontFamily={HAND} fontSize="22" fill={A}>P(KK) = ½ · ½ = ¼</text>
      </svg>
    ),
  },

  raum: {
    heading: 'Darum geht’s in diesem Kapitel',
    text: [
      <>Wie viel Farbe braucht man für eine Wand, wie viel Wasser passt in einen Pool, wie viel Blech steckt in einer Dose? Dafür berechnest du <strong>Flächen</strong> und <strong>Volumen</strong>.</>,
      <>Für alle Säulen – Quader, Prisma und Zylinder – gilt dieselbe Grundidee: Grundfläche mal Höhe.</>,
    ],
    formula: <>V = <u style={{ color: A }}>G</u> · <u style={{ color: B }}>h</u></>,
    noteA: <>Grundfläche:<br />beim Zylinder ein Kreis</>,
    noteB: <>Höhe: senkrecht<br />zur Grundfläche</>,
    sketchLabel: 'Zylinder mit r = 3 cm und h = 5 cm: V = π · 3² · 5 ≈ 141,37 cm³',
    sketch: (
      <svg viewBox="0 0 440 200" role="img" aria-label="Zylinder mit r = 3 cm und h = 5 cm: V = π · 3² · 5 ≈ 141,37 cm³">
        <KaroDefs id="ai-k-raum" />
        <rect width="440" height="200" fill="url(#ai-k-raum)" />
        <path d="M60 40V160M180 40V160" stroke="#1b2433" strokeWidth="2" />
        <ellipse cx="120" cy="40" rx="60" ry="16" fill="#ffffff" stroke="#1b2433" strokeWidth="2" />
        <path d="M60 160A60 16 0 0 0 180 160" fill="none" stroke="#1b2433" strokeWidth="2" />
        <path d="M60 160A60 16 0 0 1 180 160" fill="none" stroke="#1b2433" strokeWidth="1.5" strokeDasharray="5 4" />
        <ellipse cx="120" cy="160" rx="60" ry="16" fill={A} opacity="0.15" />
        <path d="M120 160H180" stroke={A} strokeWidth="2" />
        <text x="140" y="154" fontFamily={HAND} fontSize="20" fill={A}>r = 3</text>
        <path d="M200 40V160" stroke={B} strokeWidth="2" />
        <path d="M195 40h10M195 160h10" stroke={B} strokeWidth="2" />
        <text x="210" y="106" fontFamily={HAND} fontSize="22" fill={B}>h = 5</text>
        <g fontFamily={HAND} fontSize="22" fill={RED}>
          <text x="262" y="74">V = π · 3² · 5</text>
          <text x="262" y="104">≈ 141,37 cm³</text>
        </g>
      </svg>
    ),
  },

  trigo: {
    heading: 'Darum geht’s in diesem Kapitel',
    text: [
      <>Wie hoch ist ein Turm, wie steil eine Rampe, wie lang eine Leiter? Mit <strong>Sinus, Kosinus und Tangens</strong> berechnest du fehlende Seiten und Winkel im rechtwinkligen Dreieck.</>,
      <>Entscheidend ist, welche Seite <strong>gegenüber</strong> und welche <strong>an</strong> dem Winkel liegt.</>,
    ],
    formula: <>sin α = <Frac top={<span style={{ color: A }}>Gegenkathete</span>} bottom={<span style={{ color: B }}>Hypotenuse</span>} /></>,
    noteA: <>liegt dem Winkel α<br />gegenüber</>,
    noteB: <>längste Seite,<br />gegenüber vom rechten Winkel</>,
    sketchLabel: 'Rechtwinkliges Dreieck mit Seiten 3, 4 und 5: sin α = 3 : 5 = 0,6',
    sketch: (
      <svg viewBox="0 0 440 200" role="img" aria-label="Rechtwinkliges Dreieck mit Seiten 3, 4 und 5: sin α = 3 : 5 = 0,6">
        <KaroDefs id="ai-k-trigo" />
        <rect width="440" height="200" fill="url(#ai-k-trigo)" />
        {/* 1 Einheit = 40 px: Ankathete 4, Gegenkathete 3, Hypotenuse 5 */}
        <path d="M40 180H200" stroke="#1b2433" strokeWidth="2.5" />
        <path d="M200 180V60" stroke={A} strokeWidth="3.5" />
        <path d="M40 180L200 60" stroke={B} strokeWidth="3.5" />
        <path d="M184 180V164H200" fill="none" stroke="#1b2433" strokeWidth="1.5" />
        <path d="M76 180A36 36 0 0 0 69 158" fill="none" stroke={RED} strokeWidth="2" />
        <text x="82" y="172" fontSize="16" fontWeight="700" fill={RED}>α</text>
        <text x="112" y="198" fontSize="14" fill="#5b6472">4</text>
        <text x="210" y="126" fontSize="15" fontWeight="700" fill={A}>3</text>
        <text x="104" y="108" fontSize="15" fontWeight="700" fill={B}>5</text>
        <text x="250" y="110" fontFamily={HAND} fontSize="24" fill={RED}>sin α = 3 : 5 = 0,6</text>
      </svg>
    ),
  },
}

export default function AreaIntro({ id }: { id: AreaId }) {
  const intro = INTROS[id]
  if (!intro) return null
  return (
    <section className="ai" aria-labelledby={`ai-${id}`}>
      <div className="ai-text">
        <h2 id={`ai-${id}`}>{intro.heading}</h2>
        {intro.text.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>
      <figure className="ai-note">
        <span className="ai-tape" aria-hidden="true" />
        <div className="ai-sheet">
          <figcaption className="ai-merke">Merke:</figcaption>
          <div className="ai-formula-box">
            <span className="ai-formula">{intro.formula}</span>
            <span className="ai-hand ai-hand-a">{intro.noteA}</span>
            <span className="ai-hand ai-hand-b">{intro.noteB}</span>
          </div>
          <div className="ai-sketch">{intro.sketch}</div>
        </div>
      </figure>
    </section>
  )
}
