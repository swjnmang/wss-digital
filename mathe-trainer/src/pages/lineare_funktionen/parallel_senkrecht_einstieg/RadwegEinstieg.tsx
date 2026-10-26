import { useEffect, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, McCard, TrackedCheck, TrackedMc } from '../lernsituation_kit/kit'
import { Abschnitt, Aufklappbar, BeispielMitVideo, BonusSpiel, Fehlersuche, Handlungsprodukt, SeitenLernsituation, type Seite, type Thema } from '../lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../lernsituation_kit/punkte'
import { Kriterien } from '../../finanzmathe/zins_kit/zins_kit'
import { Koordinaten, winkelZwischen, type Linie } from './Koordinaten'
import BrueckenBauer from './BrueckenBauer'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './radweg.css'

// Lernsituation „Der neue Radweg“: parallele und senkrechte Geraden, grafisch gedeutet über das Steigungsdreieck (ca. 45 min).
// Format Experimentierlabor: Im Praktikum beim Bauamt planen die SuS am Planungstisch (Stadtplan als Koordinatensystem) einen Radweg
// parallel zur Bahnlinie y = 0,5x + 1 durch R(4 | −1) und eine Fußgängerbrücke senkrecht über die Gleise am Bahnhof B(2 | 2).
// Sie tippen Steigungen ein, der Plan zeichnet die Gerade sofort und meldet, ob der Radweg die Gleise kreuzt bzw. welchen Winkel
// die Brücke mit den Gleisen bildet. Aha: Weder −0,5 (nur Vorzeichen) noch 2 (nur Kehrwert) ergeben 90°, erst −2.
// Problem lösen: Problem → Beispielrechnung Stadtpark (ohne Lernvideo, dafür mit Skizzen: Steigungsdreieck verschieben bzw. um 90°
// drehen) → Ergebnisse abgleichen (beide Gleichungen) mit Fehlersuche → Entscheidung (Weg senkrecht zum Radweg) → Handlungsprodukt
// analog: beschriftete Planskizze im Heft mit Steigungsdreiecken und rechtem Winkel. Danach Rückbezug und Merke.
// Phase 4: Senkrechte wählen (Fehloptionen nur Vorzeichen, nur Kehrwert, parallel), Wer hat recht? (gedrehtes Dreieck), Senkrechte
// durch P eintippen, Senkrechte zu einer Geraden durch zwei Punkte, Profi waagrechte Gerade. Bonus-Spiel „Brückenbauer“.
// Punkte nach Aufwand: Warm-up 2/2/2/3/2, Ausprobieren Radweg 2 und Brücke 3, Kernaufgabe 15, Entscheidung 3, Skizze 5,
// Übungen 4/5/6/7, Profi 8, Bonus-Spiel 4 Runden à 2
// (Pflicht zusammen 61: Warm-up 11 = 18 %, Problem erkennen 5 = 8 %, Problem lösen 23 = 38 %, Übungen 22 = 36 %).
// Identität: Themenfarbe Blau, Symbol Fahrrad, Titelbild Bahnlinie mit Bahnhof, Radweg und Brücke, Leitobjekt der Planungstisch
// des Bauamts. Kontext Gesellschaft und Umwelt (Mobilität, Stadtplanung). Versuche bleiben im Seitenzustand.
// Es gibt kein Lernvideo zum Thema, deshalb ist die Beispielrechnung mit Skizzen zu jedem Schritt ausführlich erklärt.
// Ruhiges Grunddesign: eine Spalte, pro Seite ist nur der Auftrag hervorgehoben. Nach unten scrollen ist erlaubt, seitlich nie.

/* ── Situation ───────────────────────────────────────────────────────────── */

/** Bahnlinie im Stadtplan (1 Kästchen = 100 m) */
const BAHN = { m: 0.5, t: 1 }
/** Radweg: parallel zur Bahnlinie durch R */
const R = { x: 4, y: -1 }
/** Fußgängerbrücke: senkrecht zur Bahnlinie durch den Bahnhof B (liegt auf der Bahnlinie) */
const B = { x: 2, y: 2 }
const RADWEG = { m: BAHN.m, t: R.y - BAHN.m * R.x } // y = 0,5x − 3
const BRUECKE = { m: -1 / BAHN.m, t: B.y + (1 / BAHN.m) * B.x } // y = −2x + 6

const PLAN = { xMin: -4, xMax: 10, yMin: -3, yMax: 6 }

const zahl = (v: number) => String(Math.round(v * 100) / 100).replace('-', '−').replace('.', ',')
const zahlTex = (v: number) => String(Math.round(v * 100) / 100).replace('.', '{,}')
const gleichungTex = (m: number, t: number) => {
  const mt = m === 1 ? '' : m === -1 ? '-' : zahlTex(m)
  if (Math.abs(t) < 1e-9) return `y = ${mt}x`
  return `y = ${mt}x ${t < 0 ? '-' : '+'} ${zahlTex(Math.abs(t))}`
}

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: Bahnlinie mit Bahnhof, darunter der geplante Radweg (parallel), quer darüber die Brücke mit „90°?“ */
function Titelbild() {
  return (
    <svg viewBox="0 0 720 252" role="img" aria-label="Eine Bahnlinie läuft schräg durch die Stadt. Daneben steht ein Bahnhof. Gestrichelt ist ein geplanter Radweg parallel zu den Gleisen eingezeichnet, quer darüber eine geplante Fußgängerbrücke mit der Frage: rechter Winkel?">
      <rect x="0" y="0" width="720" height="252" fill="var(--surface)" />
      <circle cx="70" cy="50" r="24" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      <g transform="rotate(-14 360 140)">
        {/* Gleise mit Schwellen */}
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={-60 + i * 30} x2={-60 + i * 30} y1="122" y2="154" stroke="var(--ink)" strokeWidth="5" />
        ))}
        <line x1="-80" x2="820" y1="128" y2="128" stroke="var(--ink)" strokeWidth="4" />
        <line x1="-80" x2="820" y1="148" y2="148" stroke="var(--ink)" strokeWidth="4" />
        {/* geplanter Radweg parallel zu den Gleisen */}
        <rect x="-80" y="196" width="900" height="22" fill="var(--primary-soft)" />
        <line x1="-80" x2="820" y1="207" y2="207" stroke="var(--primary)" strokeWidth="3" strokeDasharray="16 10" />
        {/* geplante Brücke quer über die Gleise */}
        <rect x="430" y="58" width="34" height="172" rx="4" fill="var(--primary)" fillOpacity="0.85" stroke="var(--ink)" strokeWidth="2" />
        <polyline points="464,108 482,108 482,128" fill="none" stroke="var(--ink)" strokeWidth="2.5" />
        {/* Fahrrad auf dem Radweg */}
        <g transform="translate(150 196)">
          <circle cx="0" cy="0" r="14" fill="none" stroke="var(--ink)" strokeWidth="3" />
          <circle cx="44" cy="0" r="14" fill="none" stroke="var(--ink)" strokeWidth="3" />
          <polyline points="0,0 16,-22 36,-22 44,0" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
          <line x1="16" y1="-22" x2="22" y2="0" stroke="var(--ink)" strokeWidth="3" />
          <line x1="36" y1="-22" x2="38" y2="-32" stroke="var(--ink)" strokeWidth="3" />
        </g>
      </g>
      {/* Bahnhof */}
      <rect x="196" y="58" width="132" height="64" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <polygon points="186,58 262,22 338,58" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="246" y="84" width="32" height="38" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <text x="262" y="50" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--surface)">
        Bahnhof
      </text>
      {/* Frage an der Brücke */}
      <rect x="520" y="70" width="104" height="40" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <text x="572" y="97" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
        90° ?
      </text>
    </svg>
  )
}

const THEMA: Thema = { name: 'Der neue Radweg', farbe: 'blau', icon: 'fa-bicycle', bild: <Titelbild /> }

/** Leitobjekt: der Planungstisch, ein Stadtplan als Koordinatensystem mit Bahnlinie, Bahnhof B und Punkt R */
function Plan({ linien = [], winkel, kreuzung }: { linien?: Linie[]; winkel?: number; kreuzung?: { x: number; y: number } }) {
  return (
    <div className="bk-graph rw-plan">
      <Koordinaten
        {...PLAN}
        einheit={40}
        ariaLabel="Stadtplan als Koordinatensystem, ein Kästchen sind 100 Meter. Die Bahnlinie y = 0,5x + 1 läuft schräg nach oben. Eingezeichnet sind der Bahnhof B(2 | 2) auf der Bahnlinie und der Punkt R(4 | −1), durch den der Radweg führen soll."
        linien={[{ ...BAHN, farbe: 'var(--ink)', dicke: 7, bahn: true, name: 'Bahnlinie', nameX: 9.6 }, ...linien]}
        punkte={[
          { ...B, name: 'B (Bahnhof)', links: true },
          { ...R, name: 'R', unten: true },
        ]}
        winkel={winkel !== undefined ? [{ ...B, m1: BAHN.m, m2: winkel, text: true, farbe: 'var(--primary)' }] : []}
      >
        {kreuzung && <Kreuz {...kreuzung} />}
      </Koordinaten>
    </div>
  )
}

/** Rotes Kreuz an der Stelle, an der ein falsch geplanter Radweg die Gleise kreuzt */
function Kreuz({ x, y }: { x: number; y: number }) {
  if (x < PLAN.xMin || x > PLAN.xMax || y < PLAN.yMin || y > PLAN.yMax) return null
  const px = 28 + (x - PLAN.xMin) * 40
  const py = 28 + (PLAN.yMax - y) * 40
  return (
    <g stroke="var(--wrong)" strokeWidth="5" strokeLinecap="round">
      <line x1={px - 11} y1={py - 11} x2={px + 11} y2={py + 11} />
      <line x1={px - 11} y1={py + 11} x2={px + 11} y2={py - 11} />
    </g>
  )
}

/* ── Phase 2: Planungstisch zum Ausprobieren ─────────────────────────────── */

type Art = 'radweg' | 'bruecke'
const parallelOk = (m: number) => Math.abs(m - BAHN.m) < 1e-6
const senkrechtOk = (m: number) => Math.abs(winkelZwischen(m, BAHN.m) - 90) < 0.5

function Planungstisch({ art, versuche, onTesten }: { art: Art; versuche: number[]; onTesten: (m: number) => void }) {
  const [eingabe, setEingabe] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const punkt = art === 'radweg' ? R : B
  const ok = art === 'radweg' ? parallelOk : senkrechtOk
  const letzter = versuche.length ? versuche[versuche.length - 1] : null
  const treffer = versuche.some(ok)
  const frei = versuche.length >= 3 || treffer
  const pt = usePunkteAufgabe({ wert: art === 'radweg' ? 2 : PUNKTE.festlegung, serie: false })
  useEffect(() => {
    if (frei) pt.geloest()
  }, [frei, pt])

  const testen = () => {
    const p = parseInput(eingabe)
    if (!p || p.percent) return setFehler('Tippe nur eine Zahl für die Steigung ein, z. B. 1 oder −0,5 oder 1/3.')
    setFehler(null)
    onTesten(p.value)
  }

  const linien: Linie[] = versuche.map((m, i) => ({
    m,
    t: punkt.y - m * punkt.x,
    farbe: ok(m) ? 'var(--correct)' : i === versuche.length - 1 ? 'var(--primary)' : 'var(--line-strong)',
    blass: i !== versuche.length - 1 && !ok(m),
    name: i === versuche.length - 1 ? (art === 'radweg' ? 'Radweg' : 'Brücke') : undefined,
    nameX: art === 'radweg' ? 9.6 : undefined,
  }))
  // Kreuzt der Radweg die Gleise? Schnittstelle von y = 0,5x + 1 und y = mx + t
  const kreuzung =
    art === 'radweg' && letzter !== null && !parallelOk(letzter)
      ? (() => {
          const t = R.y - letzter * R.x
          const x = (t - BAHN.t) / (BAHN.m - letzter)
          return { x, y: BAHN.m * x + BAHN.t }
        })()
      : undefined

  return (
    <div className="rw-labor" data-no-autocheck>
      <Plan linien={linien} winkel={art === 'bruecke' && letzter !== null ? letzter : undefined} kreuzung={kreuzung} />
      <div className="rw-eingabe">
        <label htmlFor={`rw-${art}`}>
          Steigung {art === 'radweg' ? 'des Radwegs' : 'der Brücke'}: <M>{'m ='}</M>
        </label>
        <input
          id={`rw-${art}`}
          className="bk-input rw-feld"
          inputMode="decimal"
          autoComplete="off"
          value={eingabe}
          placeholder="z. B. 1"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setEingabe(e.target.value)
            setFehler(null)
          }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && eingabe.trim()) testen()
          }}
        />
        <button type="button" className="bk-btn bk-btn-primary" onClick={testen} disabled={eingabe.trim() === ''}>
          <i className="fa-solid fa-pen-ruler" aria-hidden="true" /> In den Plan zeichnen
        </button>
      </div>
      {fehler && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> {fehler}
        </div>
      )}
      {letzter !== null && (
        <div className={`rw-anzeige ${ok(letzter) ? 'rw-anzeige-ok' : ''}`} role="status">
          <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
          <div>
            <strong>Planungstisch, Versuch {versuche.length}:</strong> <M>{`m = ${zahlTex(letzter)}`}</M>
            <br />
            {art === 'radweg'
              ? parallelOk(letzter)
                ? 'Passt! Der Radweg hat überall denselben Abstand zu den Gleisen und kreuzt sie nie.'
                : kreuzung
                  ? `Der Radweg trifft bei x ≈ ${zahl(kreuzung.x)} auf die Gleise (rotes Kreuz${kreuzung.x > PLAN.xMax || kreuzung.x < PLAN.xMin ? ', außerhalb des Plans' : ''}). Das ist gefährlich, er soll neben den Gleisen bleiben.`
                  : ''
              : senkrechtOk(letzter)
                ? 'Rechter Winkel! Die Brücke führt auf dem kürzesten Weg über die Gleise.'
                : `Die Brücke bildet mit den Gleisen einen Winkel von ${Math.round(winkelZwischen(letzter, BAHN.m))}°. Für einen rechten Winkel braucht es 90°.`}
          </div>
        </div>
      )}
      {frei && art === 'radweg' && (
        <p className="sl-hinweis">
          {treffer
            ? 'Den Radweg hast du schnell gefunden. Jetzt wird es kniffliger: die Brücke.'
            : <>Tipp: Der Radweg soll in dieselbe Richtung laufen wie die Gleise. Probier die Steigung der Bahnlinie aus. Danach geht es mit der Brücke weiter.</>}
        </p>
      )}
      {frei && art === 'bruecke' && (
        <p className="sl-hinweis">
          {versuche.some((m) => Math.abs(m + BAHN.m) < 1e-6 || Math.abs(m - 1 / BAHN.m) < 1e-6)
            ? 'Hast du es mit −0,5 oder mit 2 probiert? Beides sieht fast richtig aus, ergibt aber keinen rechten Winkel. '
            : treffer
              ? 'Treffer! Aber warum gerade diese Steigung? Bei einer anderen Bahnlinie müsstest du wieder raten. '
              : 'Den rechten Winkel triffst du durch Probieren kaum. '}
          Gleich lernst du, wie du die Steigung einer senkrechten Geraden sicher findest.
        </p>
      )}
    </div>
  )
}

/* ── Warm-up-Grafik ──────────────────────────────────────────────────────── */

function WarmupGraph() {
  return (
    <div className="bk-graph rw-klein">
      <Koordinaten
        xMin={-1}
        xMax={6}
        yMin={-2}
        yMax={3}
        einheit={44}
        ariaLabel="Gerade mit Steigungsdreieck: von einem Punkt der Geraden aus 2 Kästchen nach rechts und 1 Kästchen nach oben."
        linien={[{ m: 0.5, t: -1 }]}
        dreiecke={[{ x: 0, y: -1, dx: 2, dy: 1, textDx: '2', textDy: '1', farbe: 'var(--ink)' }]}
      />
    </div>
  )
}

/* ── Phase 3: Bilder und Rechenbeispiel (Stadtpark) ──────────────────────── */

/** Beispiel: Hauptallee g: y = 1,5x − 0,5 */
const G_BSP = { m: 1.5, t: -0.5 }

function BeispielParallel() {
  return (
    <div className="bk-graph rw-klein">
      <Koordinaten
        xMin={-1}
        xMax={5}
        yMin={-2}
        yMax={8}
        einheit={34}
        ariaLabel="Die Allee g und der neue Weg h sind parallel. An beiden Geraden ist dasselbe Steigungsdreieck eingezeichnet: 2 nach rechts und 3 nach oben."
        linien={[
          { ...G_BSP, farbe: 'var(--ink)', name: 'g', nameX: 4.6 },
          { m: 1.5, t: 2.5, name: 'h', nameX: 2.6 },
        ]}
        dreiecke={[
          { x: 0, y: -0.5, dx: 2, dy: 3, farbe: 'var(--ink)', textDx: '2', textDy: '3' },
          { x: 1, y: 4, dx: 2, dy: 3, textDx: '2', textDy: '3' },
        ]}
        punkte={[{ x: 1, y: 4, name: 'P', links: true }]}
      />
    </div>
  )
}

function BeispielSenkrecht() {
  return (
    <div className="bk-graph rw-klein">
      <Koordinaten
        xMin={-1}
        xMax={8}
        yMin={-1}
        yMax={8}
        einheit={34}
        ariaLabel="An der Allee g ist ein Steigungsdreieck eingezeichnet, das in Q endet: 2 nach rechts, 3 nach oben. In Q beginnt das gedrehte Dreieck für den Steg s: 3 nach rechts, 2 nach unten. Im Punkt Q ist der rechte Winkel markiert."
        linien={[
          { ...G_BSP, farbe: 'var(--ink)', name: 'g', nameX: 5.6 },
          { m: -2 / 3, t: 6, name: 's', nameX: 7.8 },
        ]}
        dreiecke={[
          { x: 1, y: 1, dx: 2, dy: 3, farbe: 'var(--ink)', textDx: '2', textDy: '3' },
          { x: 3, y: 4, dx: 3, dy: -2, textDx: '3', textDy: '−2' },
        ]}
        punkte={[{ x: 3, y: 4, name: 'Q', links: true }]}
        winkel={[{ x: 3, y: 4, m1: 1.5, m2: -2 / 3 }]}
      />
    </div>
  )
}

/** Handlungsprodukt: Planskizze im Heft (kariertes Blatt mit drei Geraden, Steigungsdreiecken und rechtem Winkel) */
function SkizzeBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg viewBox="0 0 720 190" role="img" aria-label="Ein kariertes Heftblatt mit einer Planskizze: zwei parallele Geraden mit gleichen Steigungsdreiecken, eine dritte Gerade senkrecht dazu mit markiertem rechtem Winkel und Gleichungen daneben.">
        <rect x="170" y="10" width="380" height="172" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        {Array.from({ length: 18 }, (_, i) => (
          <line key={`v${i}`} x1={170 + (i + 1) * 20} x2={170 + (i + 1) * 20} y1="10" y2="182" stroke="var(--grid)" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`} x1="170" x2="550" y1={10 + (i + 1) * 20} y2={10 + (i + 1) * 20} stroke="var(--grid)" />
        ))}
        <line x1="190" y1="130" x2="450" y2="40" stroke="var(--ink)" strokeWidth="4" />
        <line x1="230" y1="170" x2="490" y2="80" stroke="var(--primary)" strokeWidth="4" />
        <line x1="312" y1="29.5" x2="364" y2="180" stroke="var(--primary)" strokeWidth="4" />
        <polygon points="250,109 310,109 310,88" fill="var(--primary)" fillOpacity="0.15" stroke="var(--ink)" strokeWidth="2" strokeDasharray="6 4" />
        <polygon points="370,124 430,124 430,103" fill="var(--primary)" fillOpacity="0.15" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 4" />
        <polyline points="341.3,77.6 345.3,88.9 333.9,92.8" fill="none" stroke="var(--ink)" strokeWidth="2" />
        {[0, 1, 2].map((i) => (
          <line key={i} x1="470" x2="540" y1={36 + i * 16} y2={36 + i * 16} stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" />
        ))}
      </svg>
    </div>
  )
}

const BSP_AUFGABE = (
  <p>
    Im Stadtpark verläuft die Hauptallee entlang der Geraden <M>{'g{:}\\; y = 1{,}5x - 0{,}5'}</M>. Ein neuer Weg <M>h</M> soll <strong>parallel</strong> zur Allee
    durch den Spielplatz <M>{'P(1 \\mid 4)'}</M> führen. Ein Holzsteg <M>s</M> soll <strong>senkrecht</strong> zur Allee am Brunnen <M>{'Q(3 \\mid 4)'}</M> beginnen
    (<M>Q</M> liegt auf der Allee). Wie lauten die Gleichungen von <M>h</M> und <M>s</M>?
  </p>
)
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: <>Die Steigung von <M>g</M> als Steigungsdreieck lesen</>,
    body: (
      <>
        <p>
          Schreibe die Steigung als Bruch: <M>{'m_g = 1{,}5 = \\dfrac{3}{2}'}</M>. Das heißt: Gehst du auf der Allee <strong>2 nach rechts</strong>, geht es{' '}
          <strong>3 nach oben</strong>. Unten im Bruch steht der Schritt nach rechts, oben der Schritt nach oben (bei einem Minus: nach unten).
        </p>
      </>
    ),
  },
  {
    title: <>Parallel: das Steigungsdreieck verschieben</>,
    body: (
      <>
        <p>
          Parallele Geraden laufen in dieselbe Richtung. Du kannst das Steigungsdreieck von <M>g</M> einfach an den Punkt <M>P</M> verschieben: Es passt genau an den neuen
          Weg <M>h</M>. Also hat <M>h</M> <strong>dieselbe Steigung</strong>:
        </p>
        <MB>{'m_h = m_g = 1{,}5'}</MB>
        <BeispielParallel />
        <p>Nur der y-Achsenabschnitt ist anders, denn <M>h</M> liegt weiter oben. Ihn berechnest du in Schritt 4.</p>
      </>
    ),
  },
  {
    title: <>Senkrecht: das Steigungsdreieck um 90° drehen</>,
    body: (
      <>
        <p>
          Drehst du das Steigungsdreieck von <M>g</M> um eine Vierteldrehung im Uhrzeigersinn und setzt es im Punkt <M>Q</M> an, zeigt es in die Richtung des Stegs.
          Dabei tauschen die beiden Seiten ihre Rollen:
        </p>
        <ul className="zk-liste">
          <li>
            Aus <strong>2 nach rechts</strong> wird <strong>2 nach unten</strong>.
          </li>
          <li>
            Aus <strong>3 nach oben</strong> wird <strong>3 nach rechts</strong>.
          </li>
        </ul>
        <BeispielSenkrecht />
        <p>
          Der Steg geht also 3 nach rechts und 2 nach unten. Seine Steigung ist <M>{'m_s = \\dfrac{-2}{3} = -\\dfrac{2}{3}'}</M>. Der Bruch wird umgedreht (Kehrwert), und das
          Vorzeichen wechselt, denn aus einer steigenden Geraden wird eine fallende.
        </p>
        <MB>{'m_s = -\\dfrac{1}{m_g} = -\\dfrac{1}{\\frac{3}{2}} = -\\dfrac{2}{3}'}</MB>
        <p>
          Probe: <M>{'m_g \\cdot m_s = \\dfrac{3}{2} \\cdot \\left(-\\dfrac{2}{3}\\right) = -1'}</M>. Bei senkrechten Geraden ergibt das Produkt der Steigungen immer{' '}
          <M>-1</M>.
        </p>
        <p className="sl-hinweis">
          Nur das Vorzeichen zu wechseln (<M>{'-1{,}5'}</M>) spiegelt die Gerade, das ergibt einen Winkel von etwa 67°. Nur den Kehrwert zu nehmen (<M>{'\\tfrac{2}{3}'}</M>)
          ergibt etwa 23°. Erst beides zusammen ergibt 90°.
        </p>
      </>
    ),
  },
  {
    title: <>Mit dem Punkt den y-Achsenabschnitt <M>t</M> berechnen</>,
    body: (
      <>
        <p>
          Setze jeweils die Steigung und den Punkt in <M>{'y = mx + t'}</M> ein und löse nach <M>t</M> auf. Das kennst du schon.
        </p>
        <p>
          Weg <M>h</M> mit <M>{'m = 1{,}5'}</M> und <M>{'P(1 \\mid 4)'}</M>:
        </p>
        <MB>{'\\begin{aligned} 4 &= 1{,}5 \\cdot 1 + t \\\\ 4 &= 1{,}5 + t && \\mid -1{,}5 \\\\ t &= 2{,}5 \\end{aligned}'}</MB>
        <p>
          Steg <M>s</M> mit <M>{'m = -\\tfrac{2}{3}'}</M> und <M>{'Q(3 \\mid 4)'}</M>:
        </p>
        <MB>{'\\begin{aligned} 4 &= -\\tfrac{2}{3} \\cdot 3 + t \\\\ 4 &= -2 + t && \\mid +2 \\\\ t &= 6 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: 'Die Gleichungen vollständig aufschreiben',
    body: (
      <>
        <MB>{'h{:}\\; y = 1{,}5x + 2{,}5 \\qquad s{:}\\; y = -\\tfrac{2}{3}x + 6'}</MB>
        <p>
          Kontrolle: <M>h</M> hat dieselbe Steigung wie <M>g</M>, aber ein anderes <M>t</M>, also sind <M>g</M> und <M>h</M> parallel und nicht dieselbe Gerade. Für{' '}
          <M>s</M> gilt <M>{'1{,}5 \\cdot \\left(-\\tfrac{2}{3}\\right) = -1'}</M>, also steht <M>s</M> senkrecht auf <M>g</M>.
        </p>
      </>
    ),
  },
]

/** Lösungsweg für Radweg und Brücke */
const LOESUNG = (
  <>
    <p>Radweg (parallel, gleiche Steigung wie die Bahnlinie) durch <M>{'R(4 \\mid -1)'}</M>:</p>
    <MB>{'m_R = 0{,}5 \\qquad \\begin{aligned} -1 &= 0{,}5 \\cdot 4 + t \\\\ -1 &= 2 + t && \\mid -2 \\\\ t &= -3 \\end{aligned} \\qquad y = 0{,}5x - 3'}</MB>
    <p>Brücke (senkrecht, Steigungsdreieck „2 nach rechts, 1 nach oben“ gedreht zu „1 nach rechts, 2 nach unten“) durch <M>{'B(2 \\mid 2)'}</M>:</p>
    <MB>{'m_B = -\\dfrac{1}{0{,}5} = -2 \\qquad \\begin{aligned} 2 &= -2 \\cdot 2 + t \\\\ 2 &= -4 + t && \\mid +4 \\\\ t &= 6 \\end{aligned} \\qquad y = -2x + 6'}</MB>
    <p>
      Probe: <M>{'0{,}5 \\cdot (-2) = -1'}</M>, die Brücke steht senkrecht auf den Gleisen.
    </p>
  </>
)

/* ── Phase 4: Wer hat recht? ─────────────────────────────────────────────── */

function ZweiGeraden() {
  return (
    <div className="bk-graph rw-klein">
      <Koordinaten
        xMin={-1}
        xMax={7}
        yMin={-1}
        yMax={7}
        einheit={38}
        ariaLabel="Zwei Geraden g und h. An g ist ein Steigungsdreieck eingezeichnet: 3 nach rechts, 2 nach oben. An h: 2 nach rechts, 3 nach unten."
        linien={[
          { m: 2 / 3, t: 1, farbe: 'var(--ink)', name: 'g', nameX: 6.8 },
          { m: -1.5, t: 7.5, name: 'h', nameX: 2 },
        ]}
        dreiecke={[
          { x: 0, y: 1, dx: 3, dy: 2, farbe: 'var(--ink)', textDx: '3', textDy: '2' },
          { x: 1, y: 6, dx: 2, dy: -3, textDx: '2', textDy: '−3' },
        ]}
      />
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function RadwegEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [radweg, setRadweg] = useState<number[]>([])
  const [bruecke, setBruecke] = useState<number[]>([])
  const [geloest, setGeloest] = useState(false)
  const [fehler, setFehler] = useState(false)
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
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 6 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            rechnen={false}
            title="a) Steigung am Steigungsdreieck ablesen"
            prompt={
              <>
                <p>Lies die Steigung der Geraden am eingezeichneten Steigungsdreieck ab.</p>
                <WarmupGraph />
              </>
            }
            fields={[{ kind: 'num', key: 'm', label: <M>{'m ='}</M>, expected: 0.5 }]}
            solution={<MB>{'m = \\dfrac{\\text{nach oben}}{\\text{nach rechts}} = \\dfrac{1}{2} = 0{,}5'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) Kehrwerte"
            prompt={<p>Berechne. Den Bruch umzudrehen heißt, den Kehrwert zu bilden.</p>}
            rechnung={[
              { l: ['\\dfrac{1}{4}'], r: [{ luecke: 'a' }] },
              { l: ['1 : \\dfrac{2}{3}'], r: ['\\dfrac{3}{2} =', { luecke: 'b' }] },
            ]}
            fields={[
              { kind: 'num', key: 'a', label: '1/4', expected: 0.25 },
              { kind: 'num', key: 'b', label: '3/2', expected: 1.5 },
            ]}
            solution={<p><M>{'\\dfrac{1}{4} = 0{,}25'}</M>. Durch einen Bruch teilst du, indem du mit dem Kehrwert malnimmst: <M>{'1 : \\dfrac{2}{3} = 1 \\cdot \\dfrac{3}{2} = 1{,}5'}</M>.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Mit Vorzeichen multiplizieren"
            prompt={<p>Berechne die beiden Produkte. Achte auf die Minuszeichen.</p>}
            rechnung={[
              { l: ['0{,}5 \\cdot (-2)'], r: [{ luecke: 'a' }] },
              { l: ['(-3) \\cdot \\dfrac{1}{3}'], r: [{ luecke: 'b' }] },
            ]}
            fields={[
              { kind: 'num', key: 'a', label: '0,5 · (−2)', expected: -1 },
              { kind: 'num', key: 'b', label: '(−3) · 1/3', expected: -1 },
            ]}
            solution={<p>Plus mal minus ergibt minus: <M>{'0{,}5 \\cdot (-2) = -1'}</M> und <M>{'(-3) \\cdot \\tfrac{1}{3} = -1'}</M>. Fällt dir etwas auf?</p>}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={3}
            title="d) Gerade durch einen Punkt"
            prompt={
              <p>
                Die Gerade <M>{'y = 2x + t'}</M> geht durch <M>{'P(3 \\mid 4)'}</M>. Setze den Punkt ein und berechne <M>t</M>.
              </p>
            }
            rechnung={[
              { l: ['4'], r: ['2 \\cdot 3 + t'] },
              { l: ['4'], r: [{ luecke: 'p' }, '+ t'] },
              { l: ['t'], r: [{ luecke: 't' }] },
            ]}
            fields={[
              { kind: 'num', key: 'p', label: '2 · 3', expected: 6 },
              { kind: 'num', key: 't', label: 't', expected: -2 },
            ]}
            solution={<MB>{'\\begin{aligned} 4 &= 2 \\cdot 3 + t \\\\ 4 &= 6 + t && \\mid -6 \\\\ t &= -2 \\end{aligned}'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Der Punkt verrät dir ein Paar: <M>{'x = 3'}</M> und <M>{'y = 4'}</M>.</>,
                  <>Setze beide Zahlen in die Gleichung ein. Dann bleibt nur noch <M>t</M> unbekannt.</>,
                  <>
                    <M>{'2 \\cdot 3 = 6'}</M>, also <M>{'4 = 6 + t'}</M>. Jetzt auf beiden Seiten 6 abziehen.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={2}
            rechnen={false}
            title="e) Ein Steigungsdreieck zeichnen"
            prompt={
              <p>
                Eine Gerade hat die Steigung <M>{'m = -\\dfrac{2}{3}'}</M>. Du zeichnest ihr Steigungsdreieck und gehst 3 Kästchen nach rechts. Wie viele Kästchen geht es dann
                nach oben? (Nach unten ist negativ.)
              </p>
            }
            fields={[{ kind: 'num', key: 'h', label: 'nach oben:', expected: -2, unit: 'Kästchen' }]}
            solution={<p>Unten im Bruch steht der Schritt nach rechts (3), oben der Schritt nach oben (−2). Es geht also 2 Kästchen nach unten: −2.</p>}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Der Radweg an der Bahnlinie',
      bedingung: 'Zeichne Radweg und Brücke jeweils mindestens dreimal (oder bis es passt) in den Plan, dann geht es weiter.',
      pflicht: ['radweg', 'bruecke'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du machst ein Praktikum im Bauamt deiner Stadt. Entlang der Bahnlinie soll ein neuer Radweg entstehen, und am Bahnhof soll eine Fußgängerbrücke über die Gleise
            führen. Am Planungstisch liegt der Stadtplan als Koordinatensystem (ein Kästchen sind 100&nbsp;m).
          </p>
          <p className="sl-text">
            Gegeben ist die Bahnlinie <M>{'y = 0{,}5x + 1'}</M>. Der Radweg soll durch <M>{'R(4 \\mid -1)'}</M> führen und <strong>parallel</strong> zu den Gleisen
            verlaufen. Die Brücke soll am Bahnhof <M>{'B(2 \\mid 2)'}</M> <strong>senkrecht</strong> über die Gleise führen, also auf dem kürzesten Weg. Gesucht ist jeweils
            die Steigung.
          </p>
          <Abschnitt titel="1. Der Radweg">
            <div className="sl-fokus">
              <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
              <p>
                Tippe eine Steigung für den Radweg ein und zeichne ihn in den Plan. Er geht automatisch durch <M>R</M>. Der Planungstisch zeigt dir, ob er die Gleise kreuzt.
                Danach planst du die Brücke.
              </p>
            </div>
            <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 8 Minuten für beide Teile.</p>
            <Planungstisch
              art="radweg"
              versuche={radweg}
              onTesten={(m) => {
                setRadweg((alt) => [...alt, m])
                if (radweg.length + 1 >= 3 || parallelOk(m)) fertig.teil('radweg')()
              }}
            />
          </Abschnitt>
          <Abschnitt titel="2. Die Brücke">
            <p className="sl-text">
              Tippe eine Steigung für die Brücke ein. Sie geht automatisch durch den Bahnhof <M>B</M>. Der Planungstisch misst den Winkel zwischen Brücke und Gleisen.
              Findest du den rechten Winkel?
            </p>
            <Planungstisch
              art="bruecke"
              versuche={bruecke}
              onTesten={(m) => {
                setBruecke((alt) => [...alt, m])
                if (bruecke.length + 1 >= 3 || senkrechtOk(m)) fertig.teil('bruecke')()
              }}
            />
          </Abschnitt>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Pläne für Radweg und Brücke',
      pflicht: ['ergebnis', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 18 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Stelle die Gleichungen für den Planungstisch auf</p>
            <p>
              Die Bahnlinie hat die Gleichung <M>{'y = 0{,}5x + 1'}</M>. Stelle in deinem Heft die Gleichung des <strong>Radwegs</strong> auf (parallel zur Bahnlinie, durch{' '}
              <M>{'R(4 \\mid -1)'}</M>) und die Gleichung der <strong>Brücke</strong> (senkrecht zur Bahnlinie, durch <M>{'B(2 \\mid 2)'}</M>). Gib beide in der Form{' '}
              <M>{'y = mx + t'}</M> an.
            </p>
          </div>
          <Plan />
          <BeispielMitVideo>
            <div className="rw-beispiel">
              <p className="sl-text">Zu diesem Thema gibt es kein Lernvideo. Das Beispiel erklärt dir deshalb jeden Schritt mit einer Skizze.</p>
              <Beispiel offen title="Weg und Steg im Stadtpark" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
            </div>
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('ergebnis')()
                setGeloest(true)
              }}
              punkte={15}
              onFehler={() => setFehler(true)}
              title="Die Pläne sind fertig"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Tippe die Gleichungen vollständig ein, mit „y =“. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'gleichung', key: 'radweg', label: 'Wie lautet die Gleichung des Radwegs?', m: RADWEG.m, t: RADWEG.t, tol: 0.001 },
                { kind: 'gleichung', key: 'bruecke', label: 'Wie lautet die Gleichung der Brücke?', m: BRUECKE.m, t: BRUECKE.t, tol: 0.001 },
              ]}
              loesungNachFehler
              solution={LOESUNG}
              help={
                <Hilfen
                  steps={[
                    <>Für beide Wege brauchst du zuerst die Steigung, dann den y-Achsenabschnitt <M>t</M>. Welche Steigung hat ein Weg, der in dieselbe Richtung läuft wie die Gleise?</>,
                    <>
                      Radweg: gleiche Steigung wie die Bahnlinie. Brücke: Steigungsdreieck der Bahnlinie (2 nach rechts, 1 nach oben) um 90° drehen, also{' '}
                      <M>{'m = -\\dfrac{1}{0{,}5}'}</M>. Dann jeweils den Punkt in <M>{'y = mx + t'}</M> einsetzen.
                    </>,
                    <>
                      Radweg: <M>{'-1 = 0{,}5 \\cdot 4 + t'}</M>. Brücke: <M>{'m = -2'}</M> und <M>{'2 = -2 \\cdot 2 + t'}</M>.
                    </>,
                  ]}
                />
              }
            />
            <Fehlersuche fehler={fehler}>
              <CheckCard
                title="Fehlersuche: Wo steckt der Fehler?"
                rechnen={false}
                ohnePunkte
                prompt={<p>Prüfe deine Zwischenergebnisse. Das erste rote Feld zeigt dir, in welchem Schritt du nachrechnen musst.</p>}
                rechnung={[
                  { l: ['m_R'], r: [{ luecke: 'mr' }], u: '\\text{① Steigung Radweg}' },
                  { l: ['-1'], r: [{ luecke: 'mx' }, '+ t'], u: '\\text{② } R \\text{ einsetzen}' },
                  { l: ['t_R'], r: [{ luecke: 'tr' }], u: '\\text{③ } t \\text{ Radweg}' },
                  { l: ['m_B'], r: [{ luecke: 'mb' }], u: '\\text{④ Steigung Brücke}' },
                  { l: ['2'], r: [{ luecke: 'mbx' }, '+ t'], u: '\\text{⑤ } B \\text{ einsetzen}' },
                  { l: ['t_B'], r: [{ luecke: 'tb' }], u: '\\text{⑥ } t \\text{ Brücke}' },
                ]}
                fields={[
                  { kind: 'num', key: 'mr', label: 'Steigung Radweg', expected: RADWEG.m },
                  { kind: 'num', key: 'mx', label: 'm · 4', expected: 2 },
                  { kind: 'num', key: 'tr', label: 't Radweg', expected: RADWEG.t },
                  { kind: 'num', key: 'mb', label: 'Steigung Brücke', expected: BRUECKE.m },
                  { kind: 'num', key: 'mbx', label: 'm · 2', expected: -4 },
                  { kind: 'num', key: 'tb', label: 't Brücke', expected: BRUECKE.t },
                ]}
              />
            </Fehlersuche>
          </Abschnitt>
          <Abschnitt titel="Noch eine Frage vom Bauamt">
            <McCard
              onSolved={fertig.teil('entscheidung')}
              punkte={3}
              title="Der Weg zum Fahrradparkhaus"
              prompt={<p>Vom Radweg soll ein kurzer Weg senkrecht zum Radweg zum Fahrradparkhaus abzweigen. Welche Steigung braucht dieser Weg?</p>}
              options={[
                { text: <M>{'m = 0{,}5'}</M>, feedback: 'Das ist die Steigung des Radwegs selbst. Ein Weg mit dieser Steigung wäre parallel, nicht senkrecht.' },
                {
                  text: <M>{'m = -2'}</M>,
                  correct: true,
                  feedback: 'Genau. Der Radweg ist parallel zur Bahnlinie. Was senkrecht zur Bahnlinie steht, steht deshalb auch senkrecht zum Radweg, wie die Brücke.',
                },
                { text: <M>{'m = 2'}</M>, feedback: 'Hier fehlt das Minus. Mit 2 steigt der Weg in dieselbe Richtung wie der Radweg, der Winkel ist nur etwa 37°.' },
                { text: <M>{'m = -0{,}5'}</M>, feedback: 'Hier wurde nur das Vorzeichen gewechselt. Das spiegelt den Radweg, der Winkel ist etwa 53°, nicht 90°.' },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Planskizze für das Bauamt">
            <SkizzeBild />
            <p className="sl-text">
              Zeichne in deinem Heft (kariert, ein Kästchen ist eine Einheit) die Planskizze für das Bauamt: die Bahnlinie, den Radweg und die Brücke mit ihren Gleichungen.
              Zeige mit Steigungsdreiecken, <strong>warum</strong> der Radweg parallel und die Brücke senkrecht ist.
            </p>
            <Aufklappbar label="Hinweise zum Zeichnen ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Die Bahnlinie beginnt bei t = 1 auf der y-Achse. Von dort gehe ich 2 nach rechts und 1 nach oben …“</li>
                <li>„Am Radweg zeichne ich dasselbe Steigungsdreieck. Es ist nur verschoben, deshalb …“</li>
                <li>„Für die Brücke drehe ich das Dreieck am Bahnhof B um 90°: Aus 2 nach rechts wird …, aus 1 nach oben wird …“</li>
                <li>„Den rechten Winkel bei B markiere ich mit einem Viertelkreis und Punkt. Probe: 0,5 · (−2) = …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Planskizze vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                <>Bahnlinie, Radweg und Brücke sind sauber eingezeichnet und mit ihren Gleichungen beschriftet, die Punkte <M>R</M> und <M>B</M> sind markiert.</>,
                <>An der Bahnlinie und am Radweg steht dasselbe Steigungsdreieck (2 nach rechts, 1 nach oben), daneben „parallel, weil <M>{'m_1 = m_2'}</M>“.</>,
                <>An der Brücke steht das um 90° gedrehte Steigungsdreieck, der rechte Winkel bei <M>B</M> ist markiert, daneben die Probe <M>{'m_1 \\cdot m_2 = -1'}</M>.</>,
                <>
                  Unter deiner Skizze steht, wofür die Abkürzungen stehen: <M>m</M> (Steigung), <M>t</M> (y-Achsenabschnitt), <M>{'m_1'}</M> und <M>{'m_2'}</M> (die
                  Steigungen der beiden Geraden), die Zeichen <M>{'\\parallel'}</M> (parallel) und <M>{'\\perp'}</M> (senkrecht). Außerdem erklärst du die Begriffe
                  „parallel“, „senkrecht“ (auch „orthogonal“), „Kehrwert“, „Steigungsdreieck“ und alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug radweg={radweg} bruecke={bruecke} />
              <Merke title="Parallele und senkrechte Geraden">
                <ul className="zk-liste">
                  <li>
                    <strong>Parallel:</strong> Die Geraden haben <strong>dieselbe Steigung</strong>, <M>{'m_1 = m_2'}</M> (und verschiedene <M>t</M>). Grafisch: Das
                    Steigungsdreieck wird nur verschoben.
                  </li>
                  <li>
                    <strong>Senkrecht:</strong> <M>{'m_1 \\cdot m_2 = -1'}</M>, also <M>{'m_2 = -\\dfrac{1}{m_1}'}</M>: Kehrwert und Vorzeichen wechseln. Grafisch: Das
                    Steigungsdreieck wird um 90° gedreht, „rechts“ und „oben“ tauschen die Rollen und eine Richtung kehrt sich um.
                  </li>
                  <li>
                    Zu einer waagrechten Geraden (<M>{'m = 0'}</M>) ist die Senkrechte eine senkrechte Linie wie <M>{'x = 2'}</M>. Sie hat keine Steigung.
                  </li>
                </ul>
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
            Einzelarbeit, ca. 12 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Welche Gerade steht senkrecht?">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Parallel/senkrecht-Einstieg: Senkrechte wählen (Basis)"
              title="Übung 1"
              rechnen
              level="basis"
              prompt={
                <p>
                  Gegeben ist die Gerade <M>{'g{:}\\; y = 4x - 1'}</M>. Welche Gerade steht senkrecht auf <M>g</M>?
                </p>
              }
              options={[
                { text: <M>{'y = -4x + 2'}</M>, feedback: 'Hier wurde nur das Vorzeichen gewechselt. Probe: 4 · (−4) = −16, nicht −1. Die Gerade ist nur gespiegelt.' },
                { text: <M>{'y = 0{,}25x + 3'}</M>, feedback: 'Hier wurde nur der Kehrwert genommen. Probe: 4 · 0,25 = 1, nicht −1. Beide Geraden steigen.' },
                { text: <M>{'y = 4x + 3'}</M>, feedback: 'Gleiche Steigung bedeutet parallel, nicht senkrecht.' },
                { text: <M>{'y = -0{,}25x + 5'}</M>, correct: true, feedback: 'Richtig: Kehrwert und Vorzeichen gewechselt. Probe: 4 · (−0,25) = −1.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={5}
              topic="Parallel/senkrecht-Einstieg: Gedrehtes Steigungsdreieck (Standard)"
              title="Übung 2"
              level="standard"
              prompt={
                <>
                  <p>Mia und Ben schauen sich die beiden Geraden mit ihren Steigungsdreiecken an.</p>
                  <ZweiGeraden />
                  <ul className="zk-liste">
                    <li>
                      <strong>Mia:</strong> „<M>h</M> steht senkrecht auf <M>g</M>. Das Dreieck von <M>g</M> wurde gedreht: Aus 3 nach rechts, 2 nach oben wird 2 nach rechts,
                      3 nach unten.“
                    </li>
                    <li>
                      <strong>Ben:</strong> „Nein. Senkrecht zu <M>{'m = \\tfrac{2}{3}'}</M> wäre <M>{'m = -\\tfrac{2}{3}'}</M>. Man muss nur das Vorzeichen umdrehen.“
                    </li>
                  </ul>
                </>
              }
              options={[
                { text: 'Ben hat recht.', feedback: 'Mit −2/3 wäre die Gerade nur gespiegelt. Probe: 2/3 · (−2/3) = −4/9, nicht −1.' },
                { text: 'Beide haben recht, es gibt zwei senkrechte Richtungen.', feedback: 'Zu einer Geraden gibt es nur eine senkrechte Richtung. −2/3 und −3/2 sind verschiedene Steigungen.' },
                {
                  text: (
                    <>
                      Mia hat recht: <M>{'m_h = -\\tfrac{3}{2}'}</M> und <M>{'\\tfrac{2}{3} \\cdot \\left(-\\tfrac{3}{2}\\right) = -1'}</M>.
                    </>
                  ),
                  correct: true,
                  feedback: 'Genau. Beim Drehen um 90° tauschen „rechts“ und „oben“ die Rollen, und eine Richtung kehrt sich um: Kehrwert und Vorzeichen wechseln.',
                },
                { text: 'Keiner, senkrecht kann man nur mit dem Geodreieck prüfen.', feedback: 'Das Geodreieck hilft beim Zeichnen. Rechnerisch prüfst du mit m₁ · m₂ = −1.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Eine Senkrechte durch einen Punkt">
            <TrackedCheck
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              topic="Parallel/senkrecht-Einstieg: Senkrechte durch einen Punkt (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Gegeben ist die Gerade <M>{'g{:}\\; y = 0{,}25x + 2'}</M>. Die Gerade <M>h</M> steht senkrecht auf <M>g</M> und geht durch <M>{'P(1 \\mid 1)'}</M>. Stelle
                  die Gleichung von <M>h</M> auf und tippe sie vollständig ein.
                </p>
              }
              fields={[{ kind: 'gleichung', key: 'gl', label: 'Gleichung von h:', m: -4, t: 5, tol: 0.001 }]}
              solution={
                <>
                  <MB>{'m_h = -\\dfrac{1}{0{,}25} = -4'}</MB>
                  <MB>{'\\begin{aligned} 1 &= -4 \\cdot 1 + t \\\\ 1 &= -4 + t && \\mid +4 \\\\ t &= 5 \\end{aligned}'}</MB>
                  <MB>{'h{:}\\; y = -4x + 5'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Schreibe <M>{'0{,}25'}</M> als Bruch: <M>{'\\tfrac{1}{4}'}</M>. Das Steigungsdreieck geht 4 nach rechts und 1 nach oben. Wie sieht es gedreht aus?</>,
                    <>Gedreht: 1 nach rechts, 4 nach unten, also <M>{'m_h = -4'}</M>. Dann <M>{'P(1 \\mid 1)'}</M> in <M>{'y = -4x + t'}</M> einsetzen.</>,
                    <>
                      <M>{'1 = -4 \\cdot 1 + t'}</M>, also <M>{'1 = -4 + t'}</M>. Jetzt auf beiden Seiten 4 addieren.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Der Fußweg an der Straße">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={7}
              topic="Parallel/senkrecht-Einstieg: Senkrechte zu einer Geraden durch zwei Punkte (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Auf dem Stadtplan führt eine gerade Straße von <M>{'A(-1 \\mid -3)'}</M> nach <M>{'B(2 \\mid 3)'}</M>. Im Punkt <M>B</M> zweigt ein Fußweg senkrecht von der
                  Straße ab. Berechne die Steigung der Straße und stelle die Gleichung des Fußwegs auf.
                </p>
              }
              fields={[
                { kind: 'num', key: 'm', label: 'Steigung der Straße:', expected: 2 },
                { kind: 'gleichung', key: 'gl', label: 'Gleichung des Fußwegs:', m: -0.5, t: 4, tol: 0.001 },
              ]}
              solution={
                <>
                  <MB>{'m_{\\text{Straße}} = \\dfrac{3 - (-3)}{2 - (-1)} = \\dfrac{6}{3} = 2 \\qquad m_{\\text{Fußweg}} = -\\dfrac{1}{2} = -0{,}5'}</MB>
                  <MB>{'\\begin{aligned} 3 &= -0{,}5 \\cdot 2 + t \\\\ 3 &= -1 + t && \\mid +1 \\\\ t &= 4 \\end{aligned} \\qquad y = -0{,}5x + 4'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Zuerst brauchst du die Steigung der Straße aus den zwei Punkten: <M>{'m = \\dfrac{y_2 - y_1}{x_2 - x_1}'}</M>.</>,
                    <>Die Straße hat <M>{'m = 2'}</M>. Drehe das Steigungsdreieck (1 nach rechts, 2 nach oben) um 90°: 2 nach rechts, 1 nach unten.</>,
                    <>
                      Fußweg: <M>{'m = -0{,}5'}</M>. Setze <M>{'B(2 \\mid 3)'}</M> ein: <M>{'3 = -0{,}5 \\cdot 2 + t'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Die waagrechte Straße">
            <McCard
              title="Übung 5"
              punkte={8}
              profi
              level="erweiterung"
              prompt={
                <p>
                  Eine Straße verläuft waagrecht entlang der Geraden <M>{'y = 3'}</M>. Ein Weg soll sie im Punkt <M>{'(2 \\mid 3)'}</M> senkrecht kreuzen. Welche Gleichung hat
                  der Weg?
                </p>
              }
              options={[
                { text: <M>{'y = -\\tfrac{1}{3}x + 3'}</M>, feedback: 'Die 3 in y = 3 ist nicht die Steigung, sondern t. Die Steigung der Straße ist 0.' },
                { text: <M>{'y = 0x + 3'}</M>, feedback: 'Das ist die Straße selbst: y = 0x + 3 = 3.' },
                { text: <M>{'y = -3'}</M>, feedback: 'Auch y = −3 ist waagrecht, also parallel zur Straße.' },
                {
                  text: <M>{'x = 2'}</M>,
                  correct: true,
                  feedback: 'Richtig. Zu m = 0 gibt es keinen Kehrwert. Die Senkrechte ist eine senkrechte Linie durch x = 2. Sie hat keine Steigung und ist keine Funktion y = mx + t.',
                },
              ]}
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Brückenbauer">
            <BrueckenBauer />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>Du kannst jetzt parallele und senkrechte Geraden an ihren Steigungen erkennen, grafisch mit dem Steigungsdreieck begründen und ihre Gleichungen aufstellen. In den Übungsaufgaben trainierst du das weiter.</p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Parallele und senkrechte Geraden <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell title="Parallel und senkrecht: Der neue Radweg" width="wide" kompakt parent={{ to: '/lineare_funktionen/parallel_senkrecht', label: 'Parallele und senkrechte Geraden' }}>
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={<>In dieser Lernsituation lernst du, woran du parallele und senkrechte Geraden an ihrer Steigung erkennst, wie du das mit dem Steigungsdreieck begründest und wie du ihre Gleichungen aufstellst.</>}
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Versuche am Planungstisch aus Phase 2 */
function Rueckbezug({ radweg, bruecke }: { radweg: number[]; bruecke: number[] }) {
  return (
    <div className="ls-back">
      {radweg.length > 0 && (
        <p>
          <strong>Radweg:</strong> Du hast {radweg.length === 1 ? 'eine Steigung' : `${radweg.length} Steigungen`} ausprobiert
          {radweg.some(parallelOk) ? ', und 0,5 hat gepasst' : ''}. Die Gleichung ist <M>{gleichungTex(RADWEG.m, RADWEG.t)}</M>: gleiche Steigung wie die Bahnlinie, nur
          verschoben.
        </p>
      )}
      {bruecke.length > 0 && (
        <p>
          <strong>Brücke:</strong> Deine Versuche am Planungstisch:{' '}
          {bruecke.map((m, i) => (
            <span key={i}>
              {i > 0 && ', '}
              <M>{`m = ${zahlTex(m)}`}</M> ({Math.round(winkelZwischen(m, BAHN.m))}°)
            </span>
          ))}
          . Richtig ist <M>{gleichungTex(BRUECKE.m, BRUECKE.t)}</M>: Das Steigungsdreieck „2 nach rechts, 1 nach oben“ wird gedreht zu „1 nach rechts, 2 nach unten“.
        </p>
      )}
    </div>
  )
}
