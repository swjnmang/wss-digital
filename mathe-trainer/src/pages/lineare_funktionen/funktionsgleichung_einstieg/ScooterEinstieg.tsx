import { useEffect, useState, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import GleichungEingabe from '../../../components/GleichungEingabe'
import { Beispiel, M, MB, Merke, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, McCard, TrackedCheck, TrackedMc } from '../lernsituation_kit/kit'
import { Abschnitt, Aufklappbar, BeispielMitVideo, BonusSpiel, Fehlersuche, Handlungsprodukt, SeitenLernsituation, type Seite, type Thema } from '../lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../lernsituation_kit/punkte'
import { Kriterien, Vermutung, type Festlegung } from '../../finanzmathe/zins_kit/zins_kit'
import { formatLinearEquation, parseLinearEquation, texLinearEquation } from '../../../utils/parseLinearEquation'
import ScooterRoute from './ScooterRoute'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './scooter.css'

// Lernsituation „Die Scooter-App“: Funktionsgleichung einer Geraden aus zwei Punkten aufstellen (ca. 60–90 min).
// Format Rätsel / Tarif knacken: Die App zeigt keinen Tarif, nur zwei Fahrten im Verlauf (8 min: 2,60 €, 20 min: 5,00 €).
// Die SuS legen sich fest, ob das Guthaben von 7,20 € für 30 Minuten zum Badesee reicht, und probieren dann Gleichungen
// im Tarif-Rechner aus (vollständig eingetippt, Live-Graph mit den beiden Fahrten). Aha: Der Dreisatz liefert aus Fahrt 1
// 9,75 €, aus Fahrt 2 aber 7,50 €. Beides kann nicht stimmen, weil die Entsperrgebühr bei jeder Fahrt gleich bleibt.
// Problem lösen: Problem → Beispielrechnung Fahrradverleih mit Lernvideo → Ergebnisse abgleichen (Gleichung vollständig
// eingetippt, Preis für 30 min) mit Fehlersuche → Entscheidung → Handlungsprodukt analog: Schritt-für-Schritt-Anleitung
// „Tarif knacken“ für Lina mit eigenem Beispiel. Danach Rückbezug und Merke.
// Phase 4: vier Übungen (Gleichung wählen, Wer hat recht?, Taxi-Tarif eintippen, fallender Akku eintippen), Profi-Aufgabe
// waagrechte Gerade, Bonus-Spiel „Scooter-Route“ (Gleichung durch zwei Münzen eintippen).
// Punkte nach Aufwand: Warm-up 3/2/3/2/2, Festlegung 3, Ausprobieren 3, Kernaufgabe 15, Entscheidung 4, Anleitung 5,
// Übungen 3/5/6/7, Profi 8, Bonus-Spiel 4 Runden à 2
// (Pflicht zusammen 63: Warm-up 12 = 19 %, Problem lösen 24 = 38 %, Übungen 21 = 33 %).
// Identität: Themenfarbe Petrol, Symbol Smartphone, Titelbild Weg zum Badesee mit E-Scooter, Leitobjekt die Scooter-App
// (Fahrtenverlauf und Tarif-Rechner). Kontext Privatleben (Freizeit, Mobilität). Festlegung und Versuche bleiben im Seitenzustand.
// Ruhiges Grunddesign: eine Spalte, pro Seite ist nur der Auftrag hervorgehoben. Nach unten scrollen ist erlaubt, seitlich nie.

/** Lernvideo aus den Übungsaufgaben „Funktionsgleichung aufstellen“ (ab 1:44) */
const VIDEO_FUNKTIONSGLEICHUNG = 'https://youtu.be/r8vCu72ojYw?t=104'

/* ── Situation ───────────────────────────────────────────────────────────── */

// Tarif der App: 1 € fürs Entsperren und 0,20 € pro Minute: y = 0,2x + 1
const M_TARIF = 0.2
const T_TARIF = 1
const FAHRTEN: { name: string; tag: string; x: number; y: number }[] = [
  { name: 'Fahrt 1', tag: 'Montag', x: 8, y: 2.6 },
  { name: 'Fahrt 2', tag: 'Mittwoch', x: 20, y: 5 },
]
const GUTHABEN = 7.2
const DAUER = 30
const preis = (x: number) => M_TARIF * x + T_TARIF

const euro = (v: number) => `${fmt(v, 2, true).replace('-', '−')} €`

/* ── Identität ───────────────────────────────────────────────────────────── */

/** E-Scooter als flache Zeichnung; (x, y) = Aufstandspunkt des Hinterrads */
function ScooterForm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y="-22" width="92" height="9" rx="4" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <line x1="84" y1="-18" x2="98" y2="-92" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
      <line x1="88" y1="-94" x2="112" y2="-90" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="4" cy="-12" r="12" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="90" cy="-12" r="12" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="60" y="-30" width="18" height="8" rx="2" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
    </g>
  )
}

/** Titelbild: Weg zum Badesee, E-Scooter, Wegweiser „Badesee 30 min“, Handy mit Guthaben */
function Titelbild() {
  return (
    <svg viewBox="0 0 720 252" role="img" aria-label="Ein E-Scooter auf einem Weg. Ein Wegweiser zeigt: Badesee, 30 Minuten. Auf dem Handy steht ein Guthaben von 7,20 Euro.">
      <circle cx="640" cy="54" r="26" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      {/* See */}
      <ellipse cx="590" cy="214" rx="150" ry="34" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${528 + i * 44} ${206 + (i % 2) * 14} q 9 -7 18 0 q 9 7 18 0`} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
      ))}
      {/* Baum */}
      <line x1="470" y1="196" x2="470" y2="128" stroke="var(--ink)" strokeWidth="4" />
      <circle cx="470" cy="112" r="34" fill="var(--primary)" />
      {/* Weg */}
      <path d="M 0 232 L 470 232 Q 500 232 520 220" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <line x1="0" x2="440" y1="252" y2="252" stroke="var(--ink)" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={30 + i * 72} x2={62 + i * 72} y1="242" y2="242" stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" />
      ))}
      <ScooterForm x={150} y={232} />
      {/* Wegweiser */}
      <line x1="380" y1="232" x2="380" y2="110" stroke="var(--ink)" strokeWidth="4" />
      <polygon points="330,92 452,92 470,112 452,132 330,132" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <text x="392" y="109" textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--ink)">
        Badesee
      </text>
      <text x="392" y="127" textAnchor="middle" fontSize="15" fill="var(--ink)">
        30 min
      </text>
      {/* Handy mit Guthaben */}
      <rect x="40" y="28" width="96" height="150" rx="14" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
      <rect x="50" y="44" width="76" height="22" rx="4" fill="var(--primary)" />
      <text x="88" y="60" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--surface)">
        Guthaben
      </text>
      <text x="88" y="96" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
        7,20 €
      </text>
      <text x="88" y="132" textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
        Tarif: ?
      </text>
    </svg>
  )
}

const THEMA: Thema = { name: 'Die Scooter-App', farbe: 'petrol', icon: 'fa-mobile-screen-button', bild: <Titelbild /> }

/** Leitobjekt: Fahrtenverlauf der Scooter-App (nur die gegebenen Fahrten, kein Tarif) */
function AppBild() {
  return (
    <div className="zk-bild">
      <svg viewBox="0 0 720 300" role="img" aria-label="Fahrtenverlauf der Scooter-App: Fahrt 1 am Montag, 8 Minuten, 2,60 Euro. Fahrt 2 am Mittwoch, 20 Minuten, 5,00 Euro. Guthaben 7,20 Euro. Der Tarif wird nicht angezeigt.">
        <rect x="200" y="10" width="320" height="282" rx="28" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
        <rect x="216" y="30" width="288" height="44" rx="10" fill="var(--primary)" />
        <text x="360" y="59" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--surface)">
          Meine Fahrten
        </text>
        {FAHRTEN.map((f, i) => (
          <g key={f.name} transform={`translate(0 ${88 + i * 66})`}>
            <rect x="216" y="0" width="288" height="56" rx="10" fill="var(--primary-soft)" />
            <text x="232" y="24" fontSize="17" fontWeight="700" fill="var(--ink)">
              {f.name}, {f.tag}
            </text>
            <text x="232" y="46" fontSize="16" fill="var(--ink-muted)">
              {f.x} Minuten
            </text>
            <text x="490" y="38" textAnchor="end" fontSize="21" fontWeight="800" fill="var(--ink)">
              {euro(f.y)}
            </text>
          </g>
        ))}
        <line x1="216" x2="504" y1="232" y2="232" stroke="var(--line)" strokeWidth="2" />
        <text x="232" y="262" fontSize="17" fill="var(--ink)">
          Guthaben
        </text>
        <text x="490" y="262" textAnchor="end" fontSize="19" fontWeight="800" fill="var(--ink)">
          {euro(GUTHABEN)}
        </text>
        <text x="232" y="284" fontSize="15" fill="var(--ink-muted)">
          Tarif: wird nicht angezeigt
        </text>
      </svg>
    </div>
  )
}

/* ── Graph: Preis über der Fahrzeit ─────────────────────────────────────── */

const G = { w: 680, h: 300, l: 54, r: 20, t: 16, b: 46, xMax: 35, yMax: 10 }
const gx = (x: number) => G.l + (x / G.xMax) * (G.w - G.l - G.r)
const gy = (y: number) => G.h - G.b - (y / G.yMax) * (G.h - G.t - G.b)

type Linie = { m: number; t: number; aktuell?: boolean; treffer?: boolean }

/** Preis in € über der Fahrzeit in Minuten: die beiden Fahrten als Punkte, ausprobierte Geraden, ggf. „?“ bei 30 Minuten */
function TarifGraph({ linien = [], frage = false }: { linien?: Linie[]; frage?: boolean }) {
  return (
    <div className="bk-graph ls-graph es-graph">
      <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label="Koordinatensystem: x ist die Fahrzeit in Minuten, y der Preis in Euro. Eingezeichnet sind Fahrt 1 bei 8 Minuten und 2,60 Euro und Fahrt 2 bei 20 Minuten und 5,00 Euro.">
        <defs>
          <clipPath id="es-clip">
            <rect x={gx(0)} y={gy(G.yMax)} width={gx(G.xMax) - gx(0)} height={gy(0) - gy(G.yMax)} />
          </clipPath>
        </defs>
        {Array.from({ length: 8 }, (_, i) => i * 5).map((v) => (
          <g key={`x${v}`}>
            <line x1={gx(v)} x2={gx(v)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--grid)" />
            <text x={gx(v)} y={gy(0) + 26} textAnchor="middle" fontSize="18" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {[2, 4, 6, 8, 10].map((v) => (
          <g key={`y${v}`}>
            <line x1={gx(0)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--grid)" />
            <text x={gx(0) - 10} y={gy(v) + 6} textAnchor="end" fontSize="18" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        <line x1={gx(0)} x2={gx(0)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="2" />
        <line x1={gx(0)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="2" />
        <text x={gx(G.xMax)} y={gy(0) - 10} textAnchor="end" fontSize="17" fill="var(--ink-muted)">
          x: Fahrzeit in Minuten
        </text>
        <text x={gx(0) + 10} y={gy(G.yMax) + 16} fontSize="17" fill="var(--ink-muted)">
          y: Preis in €
        </text>
        <g clipPath="url(#es-clip)">
          {linien.map((l, i) => (
            <line
              key={i}
              x1={gx(0)}
              y1={gy(l.t)}
              x2={gx(G.xMax)}
              y2={gy(l.m * G.xMax + l.t)}
              stroke={l.treffer ? 'var(--correct)' : l.aktuell ? 'var(--primary)' : 'var(--line-strong)'}
              strokeWidth={l.aktuell ? 4.5 : 2.5}
              strokeLinecap="round"
              opacity={l.aktuell || l.treffer ? 1 : 0.6}
            />
          ))}
        </g>
        {frage && (
          <>
            <line x1={gx(DAUER)} x2={gx(DAUER)} y1={gy(0)} y2={gy(8.6)} stroke="var(--ink)" strokeWidth="2" strokeDasharray="6 5" />
            <text x={gx(DAUER)} y={gy(9)} textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)">
              ?
            </text>
          </>
        )}
        {FAHRTEN.map((f) => (
          <g key={f.name}>
            <circle cx={gx(f.x)} cy={gy(f.y)} r="9" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
            <text x={gx(f.x) + 14} y={gy(f.y) + 24} fontSize="17" fontWeight="700" fill="var(--ink)">
              {f.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ── Phase 2: Tarif-Rechner zum Ausprobieren ─────────────────────────────── */

type Versuch = { m: number; t: number; text: string }
const trifft = (v: { m: number; t: number }) => FAHRTEN.every((f) => Math.abs(v.m * f.x + v.t - f.y) < 0.005)

function TarifRechner({ versuche, onTesten }: { versuche: Versuch[]; onTesten: (v: Versuch) => void }) {
  const [eingabe, setEingabe] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const letzter = versuche[versuche.length - 1]
  const treffer = versuche.some(trifft)
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const frei = versuche.length >= 3 || treffer
  useEffect(() => {
    if (frei) pt.geloest()
  }, [frei, pt])

  const testen = () => {
    const g = parseLinearEquation(eingabe)
    if (!g.ok) return setFehler(g.fehler)
    setFehler(null)
    onTesten({ m: g.m, t: g.t, text: formatLinearEquation(g.m, g.t) })
  }

  return (
    <div className="es-labor" data-no-autocheck>
      <TarifGraph linien={versuche.map((v, i) => ({ m: v.m, t: v.t, aktuell: i === versuche.length - 1, treffer: trifft(v) }))} />
      <div
        className="es-eingabe">
        <label htmlFor="es-tarif">Tarif-Rechner:</label>
        <GleichungEingabe onEnter={testen} id="es-tarif" value={eingabe} onChange={(v) => { setEingabe(v); setFehler(null) }} placeholder="z. B. y = 0,3x" ariaLabel="Gleichung für den Tarif-Rechner" />
        <button type="button" className="bk-btn bk-btn-primary" onClick={testen} disabled={eingabe.trim() === ''}>
          <i className="fa-solid fa-mobile-screen-button" aria-hidden="true" /> Tarif testen
        </button>
      </div>
      {fehler && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> {fehler}
        </div>
      )}
      {letzter && (
        <div className={`es-anzeige ${trifft(letzter) ? 'es-anzeige-ok' : ''}`} role="status">
          <i className="fa-solid fa-mobile-screen-button" aria-hidden="true" />
          <div>
            <strong>Scooter-App, Versuch {versuche.length}:</strong> <M>{texLinearEquation(letzter.m, letzter.t)}</M>
            <ul>
              {FAHRTEN.map((f) => {
                const y = letzter.m * f.x + letzter.t
                const ok = Math.abs(y - f.y) < 0.005
                return (
                  <li key={f.name}>
                    <i className={`fa-solid ${ok ? 'fa-check' : 'fa-xmark'}`} aria-hidden="true" /> {f.name} ({f.x} min): Deine Gleichung ergibt {euro(y)}
                    {ok ? ', passt.' : `, in der App stehen ${euro(f.y)}.`}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
      {frei && (
        <p className="sl-hinweis">
          {treffer ? 'Treffer! Bei anderen Fahrten klappt das Raten aber kaum.' : 'Durch Probieren triffst du beide Fahrten kaum gleichzeitig.'} Und der Dreisatz hilft
          auch nicht: Mit Fahrt 1 kostet eine halbe Stunde <M>{'2{,}60 : 8 \\cdot 30 = 9{,}75'}</M> €, mit Fahrt 2 aber <M>{'5{,}00 : 20 \\cdot 30 = 7{,}50'}</M> €. Beides
          kann nicht stimmen. Gleich lernst du, wie du den Tarif sicher knackst.
        </p>
      )}
    </div>
  )
}

/* ── Phase 3: Bilder und Rechenbeispiel (Fahrradverleih) ─────────────────── */

/** Handlungsprodukt: Karteikarte „Tarif knacken“ mit drei Schritten und kleiner Skizze */
function KarteBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg viewBox="0 0 720 190" role="img" aria-label="Eine Karteikarte mit der Überschrift Tarif knacken, darunter drei nummerierte Schritte und eine kleine Skizze einer Geraden durch zwei Punkte.">
        <rect x="150" y="12" width="420" height="170" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="150" y="12" width="420" height="40" rx="8" fill="var(--primary-soft)" />
        <line x1="150" x2="570" y1="52" y2="52" stroke="var(--primary)" strokeWidth="2" />
        <text x="172" y="40" fontSize="21" fontWeight="800" fill="var(--ink)">
          Tarif knacken
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx="182" cy={84 + i * 34} r="11" fill="var(--primary)" />
            <text x="182" y={89 + i * 34} textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--surface)">
              {i + 1}
            </text>
            <line x1="202" x2={i === 1 ? 380 : 410} y1={86 + i * 34} y2={86 + i * 34} stroke="var(--line-strong)" strokeWidth="2" />
          </g>
        ))}
        <line x1="444" x2="444" y1="70" y2="166" stroke="var(--ink)" strokeWidth="2" />
        <line x1="444" x2="552" y1="166" y2="166" stroke="var(--ink)" strokeWidth="2" />
        <line x1="444" y1="140" x2="552" y2="84" stroke="var(--primary)" strokeWidth="3.5" />
        <circle cx="470" cy="126" r="6" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        <circle cx="528" cy="96" r="6" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      </svg>
    </div>
  )
}

const BSP_AUFGABE = (
  <p>
    Ein Fahrradverleih am See verlangt eine feste Gebühr und einen Preis pro Stunde. Mia hat für 2 Stunden 9 € bezahlt, Tom für 5 Stunden 15 €. Wie lautet die
    Funktionsgleichung des Tarifs, und was kosten 3 Stunden?
  </p>
)
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Die beiden Fahrten als Punkte aufschreiben',
    body: (
      <>
        <p>
          <M>x</M> ist die Zeit in Stunden, <M>y</M> der Preis in €.
        </p>
        <MB>{'P_1(2 \\mid 9) \\qquad P_2(5 \\mid 15)'}</MB>
      </>
    ),
  },
  {
    title: <>Die Steigung <M>m</M> berechnen</>,
    body: (
      <>
        <MB>{'m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{15 - 9}{5 - 2} = \\dfrac{6}{3} = 2'}</MB>
        <p>Jede Stunde kostet 2 €.</p>
      </>
    ),
  },
  {
    title: <>Einen Punkt einsetzen und <M>t</M> berechnen</>,
    body: (
      <>
        <p>
          Setze <M>{'m = 2'}</M> und <M>{'P_1(2 \\mid 9)'}</M> in <M>{'y = mx + t'}</M> ein:
        </p>
        <MB>{'\\begin{aligned} 9 &= 2 \\cdot 2 + t \\\\ 9 &= 4 + t && \\mid -4 \\\\ t &= 5 \\end{aligned}'}</MB>
        <p>Die feste Gebühr ist 5 €.</p>
      </>
    ),
  },
  {
    title: 'Die Gleichung vollständig aufschreiben und die Probe machen',
    body: <MB>{'y = 2x + 5 \\qquad \\text{Probe mit } P_2{:}\\; x = 5{:}\\; y = 2 \\cdot 5 + 5 = 15 \\;\\checkmark'}</MB>,
  },
  {
    title: 'Die Gleichung nutzen',
    body: <MB>{'x = 3{:}\\quad y = 2 \\cdot 3 + 5 = 11 \\qquad \\text{3 Stunden kosten 11 €.}'}</MB>,
  },
]

/** Lösungsweg für den Scooter-Tarif */
const LOESUNG = (
  <>
    <MB>{'P_1(8 \\mid 2{,}6) \\qquad P_2(20 \\mid 5)'}</MB>
    <MB>{'m = \\dfrac{5 - 2{,}6}{20 - 8} = \\dfrac{2{,}4}{12} = 0{,}2'}</MB>
    <MB>{'\\begin{aligned} 2{,}6 &= 0{,}2 \\cdot 8 + t \\\\ 2{,}6 &= 1{,}6 + t && \\mid -1{,}6 \\\\ t &= 1 \\end{aligned}'}</MB>
    <MB>{'y = 0{,}2x + 1 \\qquad \\text{Probe: } x = 20{:}\\; y = 0{,}2 \\cdot 20 + 1 = 5 \\;\\checkmark'}</MB>
    <MB>{'x = 30{:}\\quad y = 0{,}2 \\cdot 30 + 1 = 7'}</MB>
    <p>Eine Fahrt von 30 Minuten kostet 7,00 €: 1 € fürs Entsperren und 0,20 € pro Minute.</p>
  </>
)

/* ── Phase 4: Wer hat recht? ─────────────────────────────────────────────── */

function Plan({ name, tex: t }: { name: string; tex: string }) {
  return (
    <div className="es-plan">
      <div className="es-plan-name">Rechnung von {name}</div>
      <MB>{t}</MB>
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

type Wahl = 'reicht' | 'reichtNicht'

export default function ScooterEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [vermutung, setVermutung] = useState<Festlegung<Wahl>>({ wahl: null, wert: 8, fest: false })
  const [versuche, setVersuche] = useState<Versuch[]>([])
  const [geloest, setGeloest] = useState(false)
  const [fehler, setFehler] = useState(false)
  /** in „Problem lösen“ eingetippte Gleichung, wird live in den Graphen gezeichnet */
  const [eigeneGleichung, setEigeneGleichung] = useState('')
  const eigene = parseLinearEquation(eigeneGleichung)
  const eigeneLinie: Linie[] = eigene.ok
    ? [{ m: eigene.m, t: eigene.t, aktuell: true, treffer: Math.abs(eigene.m - M_TARIF) < 0.001 && Math.abs(eigene.t - T_TARIF) < 0.001 }]
    : []
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
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 8 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={3}
            title="a) Steigung aus zwei Punkten"
            prompt={
              <p>
                Eine Gerade geht durch <M>{'P_1(1 \\mid 3)'}</M> und <M>{'P_2(4 \\mid 9)'}</M>. Berechne ihre Steigung.
              </p>
            }
            rechnung={[{ l: ['m'], r: ['\\dfrac{9 - 3}{4 - 1} =', { luecke: 'm' }] }]}
            fields={[{ kind: 'num', key: 'm', label: 'Steigung m', expected: 2 }]}
            solution={<MB>{'m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{9 - 3}{4 - 1} = \\dfrac{6}{3} = 2'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Die Steigung sagt, um wie viel <M>y</M> wächst, wenn <M>x</M> um 1 wächst.</>,
                  <>Teile den Unterschied der y-Werte durch den Unterschied der x-Werte.</>,
                  <>
                    Oben <M>{'9 - 3 = 6'}</M>, unten <M>{'4 - 1 = 3'}</M>. Jetzt <M>{'6 : 3'}</M> rechnen.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            rechnen={false}
            title="b) y-Achsenabschnitt ablesen"
            prompt={
              <p>
                Gerade: <M>{'y = 0{,}5x + 4'}</M>. An welcher Stelle schneidet sie die y-Achse? Gib den y-Wert an.
              </p>
            }
            fields={[{ kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 4 }]}
            solution={<p>In <M>{'y = mx + t'}</M> ist <M>t</M> die Zahl ohne <M>x</M>, hier <M>{'t = 4'}</M>. Der Schnittpunkt mit der y-Achse ist <M>{'(0 \\mid 4)'}</M>.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={3}
            title="c) Einen Punkt einsetzen"
            prompt={
              <p>
                Die Gerade <M>{'y = 3x + t'}</M> geht durch <M>{'P(2 \\mid 11)'}</M>. Setze den Punkt ein und berechne <M>t</M>.
              </p>
            }
            rechnung={[
              { l: ['11'], r: ['3 \\cdot 2 + t'] },
              { l: ['11'], r: [{ luecke: 'p' }, '+ t'] },
              { l: ['t'], r: [{ luecke: 't' }] },
            ]}
            fields={[
              { kind: 'num', key: 'p', label: '3 · 2', expected: 6 },
              { kind: 'num', key: 't', label: 't', expected: 5 },
            ]}
            solution={<MB>{'\\begin{aligned} 11 &= 3 \\cdot 2 + t \\\\ 11 &= 6 + t && \\mid -6 \\\\ t &= 5 \\end{aligned}'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Der Punkt verrät dir ein Paar: <M>{'x = 2'}</M> und <M>{'y = 11'}</M>.</>,
                  <>Setze beide Zahlen in die Gleichung ein. Dann bleibt nur noch <M>t</M> unbekannt.</>,
                  <>
                    <M>{'3 \\cdot 2 = 6'}</M>, also <M>{'11 = 6 + t'}</M>. Jetzt auf beiden Seiten 6 abziehen.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Vorzeichen"
            prompt={<p>Diese beiden Rechnungen kommen beim Aufstellen oft vor. Achte auf die Minuszeichen.</p>}
            rechnung={[
              { l: ['2 - (-3)'], r: [{ luecke: 'a' }] },
              { l: ['(-2) \\cdot (-2)'], r: [{ luecke: 'b' }] },
            ]}
            fields={[
              { kind: 'num', key: 'a', label: '2 − (−3)', expected: 5 },
              { kind: 'num', key: 'b', label: '(−2) · (−2)', expected: 4 },
            ]}
            solution={<p>Minus minus ergibt plus: <M>{'2 - (-3) = 2 + 3 = 5'}</M>. Minus mal minus ergibt plus: <M>{'(-2) \\cdot (-2) = 4'}</M>.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title={<>e) <M>x</M> einsetzen</>}
            prompt={
              <p>
                Gerade: <M>{'y = 0{,}4x + 1{,}5'}</M>. Welchen y-Wert hat sie bei <M>{'x = 10'}</M>?
              </p>
            }
            rechnung={[{ l: ['x = 10{:}\\quad y'], r: ['0{,}4 \\cdot 10 + 1{,}5 =', { luecke: 'y' }] }]}
            fields={[{ kind: 'num', key: 'y', label: 'y', expected: 5.5 }]}
            solution={<MB>{'x = 10{:}\\quad y = 0{,}4 \\cdot 10 + 1{,}5 = 4 + 1{,}5 = 5{,}5'}</MB>}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Reicht das Guthaben bis zum Badesee?',
      bedingung: 'Halte zuerst deine Vermutung fest. Nach drei Versuchen im Tarif-Rechner geht es weiter.',
      pflicht: ['vermutung', 'probieren'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Heute ist es heiß, du willst mit Freunden zum Badesee. Mit dem E-Scooter dauert die Fahrt etwa 30 Minuten. In deiner Scooter-App hast du noch 7,20&nbsp;€ Guthaben.
            Den Tarif zeigt die App nicht an, nur deine letzten beiden Fahrten.
          </p>
          <p className="sl-text">
            Gegeben sind die beiden Fahrten aus dem Verlauf. Gesucht ist der Preis für 30 Minuten, also die Gleichung, mit der die App den Preis <M>y</M> (in €) aus der
            Fahrzeit <M>x</M> (in Minuten) berechnet.
          </p>
          <AppBild />
          <Abschnitt titel="Deine Vermutung">
            <p className="sl-text">Schau dir die beiden Fahrten an. Was meinst du, ohne zu rechnen?</p>
            <Vermutung
              optionen={{ reicht: 'Das Guthaben von 7,20 € reicht für die 30 Minuten.', reichtNicht: 'Das Guthaben reicht nicht.' }}
              regler={{ text: (v) => <>Eine Fahrt von 30 Minuten kostet etwa <strong>{euro(v)}</strong></>, min: 4, max: 12, step: 0.25 }}
              wert={vermutung}
              onChange={setVermutung}
              onFest={fertig.teil('vermutung')}
              gespeichert={(w) => (
                <>
                  Deine Vermutung: 30 Minuten kosten etwa {euro(w.wert)}, das Guthaben {w.wahl === 'reicht' ? 'reicht' : 'reicht nicht'}.
                </>
              )}
            />
          </Abschnitt>
          <Abschnitt titel="Knacke den Tarif">
            <div className="sl-fokus">
              <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
              <p>
                Tippe eine vollständige Gleichung in den Tarif-Rechner, z. B. <M>{'y = 0{,}3x'}</M>, und teste sie. Die App zeigt dir, ob sie zu beiden Fahrten passt. Findest du
                den Tarif?
              </p>
            </div>
            <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 8 Minuten.</p>
            <TarifRechner
              versuche={versuche}
              onTesten={(v) => {
                setVersuche((alt) => [...alt, v])
                if (versuche.length + 1 >= 3 || trifft(v)) fertig.teil('probieren')()
              }}
            />
          </Abschnitt>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Der Tarif der Scooter-App',
      pflicht: ['ergebnis', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 25 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Knacke den Tarif der Scooter-App</p>
            <p>
              Gegeben sind die beiden Fahrten als Punkte <M>{'P_1(8 \\mid 2{,}6)'}</M> und <M>{'P_2(20 \\mid 5)'}</M> (<M>x</M> in Minuten, <M>y</M> in €). Stelle in deinem Heft
              die <strong>Funktionsgleichung</strong> <M>{'y = mx + t'}</M> des Tarifs auf. Berechne dann, was eine Fahrt von 30 Minuten kostet.
            </p>
          </div>
          <TarifGraph frage linien={eigeneLinie} />
          <BeispielMitVideo video={VIDEO_FUNKTIONSGLEICHUNG} videoTitel="Lernvideo: Funktionsgleichung aufstellen">
            <div className="es-beispiel">
              <Beispiel offen title="Der Tarif des Fahrradverleihs" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
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
              onEingabe={(w) => setEigeneGleichung(w.gl ?? '')}
              title="Der Tarif ist geknackt"
              prompt={
                <p>
                  Trage die Ergebnisse aus deinem Heft ein. Tippe die Gleichung vollständig ein, mit „y =“. Jedes Feld zeigt dir sofort, ob es stimmt, und deine Gerade
                  erscheint oben im Graphen: Geht sie durch beide Fahrten?
                </p>
              }
              fields={[
                { kind: 'gleichung', key: 'gl', label: <>Mit welcher Funktionsgleichung rechnet die App?</>, m: M_TARIF, t: T_TARIF, tol: 0.001 },
                { kind: 'num', key: 'y30', label: 'Was kostet eine Fahrt von 30 Minuten?', expected: preis(DAUER), unit: '€' },
              ]}
              loesungNachFehler
              solution={LOESUNG}
              help={
                <Hilfen
                  steps={[
                    <>Jede Fahrt ist ein Punkt: Fahrzeit als <M>x</M>, Preis als <M>y</M>. Was brauchst du zuerst, <M>m</M> oder <M>t</M>?</>,
                    <>
                      Erst die Steigung <M>{'m = \\dfrac{y_2 - y_1}{x_2 - x_1}'}</M>, dann <M>m</M> und einen Punkt in <M>{'y = mx + t'}</M> einsetzen und nach <M>t</M>{' '}
                      auflösen.
                    </>,
                    <>
                      <M>{'m = \\dfrac{5 - 2{,}6}{20 - 8} = \\dfrac{2{,}4}{12}'}</M>. Danach <M>{'2{,}6 = m \\cdot 8 + t'}</M>.
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
                  { l: ['m'], r: ['\\dfrac{5 - 2{,}6}{20 - 8} =', { luecke: 'm' }], u: '\\text{① Steigung}' },
                  { l: ['2{,}6'], r: [{ luecke: 'mx' }, '+ t'], u: '\\text{② } P_1 \\text{ einsetzen}' },
                  { l: ['t'], r: [{ luecke: 't' }], u: '\\text{③ } t' },
                  { l: ['x = 30{:}\\; y'], r: [{ luecke: 'y' }], u: '\\text{④ Preis}' },
                ]}
                fields={[
                  { kind: 'num', key: 'm', label: 'Steigung m', expected: M_TARIF },
                  { kind: 'num', key: 'mx', label: 'm · 8', expected: 1.6 },
                  { kind: 'num', key: 't', label: 't', expected: T_TARIF },
                  { kind: 'num', key: 'y', label: 'Preis für 30 Minuten', expected: preis(DAUER) },
                ]}
              />
            </Fehlersuche>
          </Abschnitt>
          <Abschnitt titel="Deine Entscheidung">
            <McCard
              onSolved={fertig.teil('entscheidung')}
              punkte={4}
              rechnen
              title="Reicht das Guthaben?"
              prompt={<p>Du hast 7,20&nbsp;€ Guthaben und fährst 30 Minuten zum Badesee. Entscheide mit deinem Ergebnis.</p>}
              options={[
                {
                  text: 'Nein, 30 Minuten kosten 9,75 €.',
                  feedback: 'Das ist der Dreisatz mit Fahrt 1. Er rechnet so, als wäre jede Minute gleich teuer, und verteilt den 1 € fürs Entsperren mit auf die Minuten.',
                },
                {
                  text: 'Nein, 30 Minuten kosten 7,50 €.',
                  feedback: 'Das ist der Dreisatz mit Fahrt 2. Die Entsperrgebühr kommt aber nur einmal dazu, egal wie lange du fährst.',
                },
                {
                  text: 'Ja: 30 Minuten kosten 7,00 €, es bleiben 0,20 € übrig.',
                  correct: true,
                  feedback: 'Genau: y = 0,2 · 30 + 1 = 7. Knapp, aber es reicht.',
                },
                {
                  text: 'Ja, 30 Minuten kosten nur 6,00 €.',
                  feedback: 'Hier fehlt der y-Achsenabschnitt t: 0,2 · 30 = 6, dazu kommt noch 1 € fürs Entsperren.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Anleitung: So knackst du einen Tarif">
            <KarteBild />
            <p className="sl-text">
              Deine Freundin Lina nutzt einen anderen Anbieter. In ihrer App stehen zwei Fahrten: 10 Minuten für 3,40&nbsp;€ und 25 Minuten für 7,90&nbsp;€. Schreibe ihr in deinem
              Heft (oder auf einer Karteikarte) eine Schritt-für-Schritt-Anleitung, wie sie aus zwei Fahrten die Gleichung des Tarifs aufstellt. Rechne jeden Schritt an ihren
              beiden Fahrten vor.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Schritt 1: Schreib deine Fahrten als Punkte auf. x ist …, y ist …“</li>
                <li>„Schritt 2: Berechne die Steigung m mit … Bei dir ergibt das …, also kostet jede Minute …“</li>
                <li>„Schritt 3: Setze m und einen Punkt in y = mx + t ein und löse nach t auf. t ist bei dir …, das ist …“</li>
                <li>„Schritt 4: Schreib die Gleichung vollständig auf: y = … Probe mit der anderen Fahrt: …“</li>
                <li>„Vorsicht, der Dreisatz klappt hier nicht, weil …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Anleitung vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                <>
                  Die Schritte stehen in der richtigen Reihenfolge: Punkte aufschreiben, <M>m</M> mit <M>{'\\dfrac{y_2 - y_1}{x_2 - x_1}'}</M> berechnen, <M>t</M> berechnen,
                  Gleichung aufschreiben
                </>,
                <>Jeder Schritt ist an Linas Fahrten vorgerechnet, am Ende steht ihre vollständige Gleichung <M>{'y = \\ldots'}</M></>,
                'Eine Probe mit der zweiten Fahrt und ein Satz, warum der Dreisatz bei diesem Tarif nicht klappt',
                <>
                  In deiner Anleitung steht, wofür die Abkürzungen stehen: <M>x</M> (Fahrzeit in Minuten), <M>y</M> (Preis in €), <M>m</M> (Steigung, hier der Preis pro
                  Minute), <M>t</M> (y-Achsenabschnitt, hier die Entsperrgebühr), <M>{'P_1(x_1 \\mid y_1)'}</M> und <M>{'P_2(x_2 \\mid y_2)'}</M> (die beiden Punkte).
                  Außerdem erklärst du die Begriffe „Funktionsgleichung“, „Steigung“, „y-Achsenabschnitt“ und alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug vermutung={vermutung} versuche={versuche} />
              <Merke title="Funktionsgleichung aus zwei Punkten aufstellen">
                <ol className="zk-liste" style={{ listStyleType: 'decimal' }}>
                  <li>
                    Steigung berechnen: <M>{'m = \\dfrac{y_2 - y_1}{x_2 - x_1}'}</M>
                  </li>
                  <li>
                    <M>m</M> und einen der beiden Punkte in <M>{'y = mx + t'}</M> einsetzen und nach <M>t</M> auflösen.
                  </li>
                  <li>
                    Die Gleichung vollständig aufschreiben, z. B. <M>{'y = 0{,}2x + 1'}</M>, und mit dem anderen Punkt die Probe machen.
                  </li>
                </ol>
                <p>
                  Ist <M>{'t \\neq 0'}</M> (z. B. eine Grundgebühr), ist die Zuordnung nicht proportional. Dann klappt der Dreisatz nicht.
                </p>
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
            Einzelarbeit, ca. 20 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Welche Gleichung passt?">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={3}
              topic="Funktionsgleichung-Einstieg: Gleichung wählen (Basis)"
              title="Übung 1"
              rechnen
              level="basis"
              prompt={
                <p>
                  Eine Gerade geht durch <M>{'P_1(1 \\mid 5)'}</M> und <M>{'P_2(3 \\mid 9)'}</M>. Stelle die Gleichung auf und wähle die richtige.
                </p>
              }
              options={[
                { text: <M>{'y = 0{,}5x + 4{,}5'}</M>, feedback: 'Hier wurde der Bruch umgedreht: m = Δy : Δx = 4 : 2 = 2, nicht 2 : 4.' },
                { text: <M>{'y = 2x + 5'}</M>, feedback: 'm = 2 stimmt. Aber t ist nicht der y-Wert von P₁: 5 = 2 · 1 + t ergibt t = 3.' },
                { text: <M>{'y = -2x + 7'}</M>, feedback: 'Vorzeichenfehler: Beide Werte wachsen, die Gerade steigt. m = (9 − 5) : (3 − 1) = +2.' },
                { text: <M>{'y = 2x + 3'}</M>, correct: true, feedback: 'm = (9 − 5) : (3 − 1) = 2 und 5 = 2 · 1 + t, also t = 3. Probe: 2 · 3 + 3 = 9.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={5}
              topic="Funktionsgleichung-Einstieg: Vorzeichen beim Einsetzen (Standard)"
              title="Übung 2"
              level="standard"
              prompt={
                <>
                  <p>
                    Lea und Ben stellen die Gleichung der Geraden durch <M>{'A(-2 \\mid 7)'}</M> und <M>{'B(4 \\mid -5)'}</M> auf. Die Steigung <M>{'m = -2'}</M> haben beide richtig.
                    Wer hat recht?
                  </p>
                  <div className="es-plaene">
                    <Plan name="Lea" tex={'\\begin{aligned} 7 &= -2 \\cdot (-2) + t \\\\ 7 &= -4 + t && \\mid +4 \\\\ t &= 11 \\\\ y &= -2x + 11 \\end{aligned}'} />
                    <Plan name="Ben" tex={'\\begin{aligned} 7 &= -2 \\cdot (-2) + t \\\\ 7 &= 4 + t && \\mid -4 \\\\ t &= 3 \\\\ y &= -2x + 3 \\end{aligned}'} />
                  </div>
                </>
              }
              options={[
                { text: 'Lea, denn bei einer fallenden Geraden ist das Produkt negativ.', feedback: 'Das Vorzeichen hängt von beiden Faktoren ab: (−2) · (−2) = +4.' },
                {
                  text: 'Ben. Lea hat (−2) · (−2) als −4 gerechnet, minus mal minus ergibt aber plus.',
                  correct: true,
                  feedback: 'Genau. Probe mit B: x = 4: y = −2 · 4 + 3 = −5. Bei Lea käme 3 heraus, nicht −5.',
                },
                { text: 'Beide, man darf sich den Punkt aussuchen.', feedback: 'Den Punkt darf man sich aussuchen, aber dann muss bei beiden dieselbe Gleichung herauskommen. Hier unterscheiden sie sich.' },
                { text: 'Keiner, t ist der y-Wert von A, also t = 7.', feedback: 't ist der y-Wert bei x = 0. A liegt bei x = −2, nicht auf der y-Achse.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Der Taxi-Tarif">
            <TrackedCheck
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              topic="Funktionsgleichung-Einstieg: Taxi-Tarif (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Nach der Party fahrt ihr Taxi. Eine Fahrt über 4&nbsp;km kostet 12,60&nbsp;€, eine über 10&nbsp;km 25,80&nbsp;€. Stelle die Funktionsgleichung des Tarifs auf (
                  <M>x</M> in km, <M>y</M> in €) und tippe sie vollständig ein.
                </p>
              }
              fields={[{ kind: 'gleichung', key: 'gl', label: 'Gleichung des Taxi-Tarifs:', m: 2.2, t: 3.8, tol: 0.001 }]}
              solution={
                <>
                  <MB>{'m = \\dfrac{25{,}8 - 12{,}6}{10 - 4} = \\dfrac{13{,}2}{6} = 2{,}2'}</MB>
                  <MB>{'\\begin{aligned} 12{,}6 &= 2{,}2 \\cdot 4 + t \\\\ 12{,}6 &= 8{,}8 + t && \\mid -8{,}8 \\\\ t &= 3{,}8 \\end{aligned}'}</MB>
                  <MB>{'y = 2{,}2x + 3{,}8'}</MB>
                  <p>Jeder Kilometer kostet 2,20 €, die Grundgebühr ist 3,80 €.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Schreibe die Fahrten als Punkte: <M>{'P_1(4 \\mid 12{,}6)'}</M> und <M>{'P_2(10 \\mid 25{,}8)'}</M>.</>,
                    <>Erst <M>m</M> berechnen, dann <M>m</M> und einen Punkt einsetzen und nach <M>t</M> auflösen.</>,
                    <>
                      <M>{'m = 13{,}2 : 6 = 2{,}2'}</M>. Dann <M>{'12{,}6 = 2{,}2 \\cdot 4 + t'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Der Akku des Scooters">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={7}
              topic="Funktionsgleichung-Einstieg: Fallende Gerade (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Während der Fahrt sinkt der Akkustand des Scooters gleichmäßig. Nach 10 Minuten zeigt er 80&nbsp;%, nach 25 Minuten 50&nbsp;%. Stelle die Gleichung auf (
                  <M>x</M> in Minuten, <M>y</M> in %) und berechne, wie viel Prozent der Akku nach 40 Minuten noch hat.
                </p>
              }
              fields={[
                { kind: 'gleichung', key: 'gl', label: 'Gleichung des Akkustands:', m: -2, t: 100, tol: 0.001 },
                { kind: 'num', key: 'y40', label: 'Akkustand nach 40 Minuten:', expected: 20, unit: '%' },
              ]}
              solution={
                <>
                  <MB>{'m = \\dfrac{50 - 80}{25 - 10} = \\dfrac{-30}{15} = -2'}</MB>
                  <MB>{'\\begin{aligned} 80 &= -2 \\cdot 10 + t \\\\ 80 &= -20 + t && \\mid +20 \\\\ t &= 100 \\end{aligned}'}</MB>
                  <MB>{'y = -2x + 100 \\qquad x = 40{:}\\; y = -2 \\cdot 40 + 100 = 20'}</MB>
                  <p>Der Akku startet mit 100 % und verliert 2 % pro Minute. Nach 40 Minuten sind noch 20 % übrig.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Der Akkustand sinkt. Welches Vorzeichen hat dann die Steigung?</>,
                    <>
                      Punkte: <M>{'P_1(10 \\mid 80)'}</M> und <M>{'P_2(25 \\mid 50)'}</M>. Oben im Bruch steht <M>{'50 - 80'}</M>, das ist negativ.
                    </>,
                    <>
                      <M>{'m = -30 : 15 = -2'}</M>. Dann <M>{'80 = -2 \\cdot 10 + t'}</M>, also <M>{'80 = -20 + t'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Gleiche Höhe">
            <McCard
              title="Übung 5"
              punkte={8}
              profi
              level="erweiterung"
              prompt={
                <p>
                  Eine Gerade geht durch <M>{'P_1(-3 \\mid 4)'}</M> und <M>{'P_2(5 \\mid 4)'}</M>. Wie lautet ihre Funktionsgleichung?
                </p>
              }
              options={[
                { text: <M>{'y = 4x'}</M>, feedback: 'Hier wurde 4 als Steigung genommen. Die y-Werte sind aber gleich, die Gerade steigt also gar nicht.' },
                { text: <M>{'y = 4'}</M>, correct: true, feedback: 'm = (4 − 4) : (5 − (−3)) = 0 : 8 = 0, also y = 0 · x + 4 = 4. Die Gerade verläuft waagrecht.' },
                { text: <M>{'x = 4'}</M>, feedback: 'x = 4 wäre eine senkrechte Linie. Hier haben beide Punkte denselben y-Wert, nicht denselben x-Wert.' },
                { text: 'Man kann keine Gleichung aufstellen, weil man durch 0 teilen müsste.', feedback: 'Unten steht 5 − (−3) = 8. Oben steht 0, und 0 : 8 = 0 ist erlaubt.' },
              ]}
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Scooter-Route">
            <ScooterRoute />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>Du kannst jetzt aus zwei Punkten die Funktionsgleichung einer Geraden aufstellen und in einer Situation deuten. In den Übungsaufgaben trainierst du das weiter, auch beim Ablesen aus einem Graphen.</p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Funktionsgleichung aufstellen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell title="Funktionsgleichung: Die Scooter-App" width="wide" kompakt parent={{ to: '/lineare_funktionen/funktionsgleichung', label: 'Funktionsgleichung aufstellen' }}>
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={<>In dieser Lernsituation lernst du, wie du aus zwei Punkten die Funktionsgleichung einer Geraden aufstellst und was <M>m</M> und <M>t</M> in einer Situation bedeuten.</>}
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf Vermutung und Versuche aus Phase 2 */
function Rueckbezug({ vermutung, versuche }: { vermutung: Festlegung<Wahl>; versuche: Versuch[] }) {
  const treffer = versuche.some(trifft)
  return (
    <div className="ls-back">
      {vermutung.fest && (
        <p>
          <strong>Deine Vermutung:</strong> 30 Minuten kosten etwa {euro(vermutung.wert)}, das Guthaben {vermutung.wahl === 'reicht' ? 'reicht' : 'reicht nicht'}.{' '}
          {vermutung.wahl === 'reicht' ? 'Das stimmt:' : 'Es reicht doch:'} Die Fahrt kostet genau {euro(preis(DAUER))}, von deinen {euro(GUTHABEN)} bleiben{' '}
          {euro(GUTHABEN - preis(DAUER))} übrig.
        </p>
      )}
      <p>
        {treffer ? (
          <>Im Tarif-Rechner hast du den Tarif getroffen. Mit der Rechnung klappt das jedes Mal, auch bei krummen Zahlen.</>
        ) : versuche.length ? (
          <>
            Im Tarif-Rechner hast du {versuche.length} Gleichungen getestet, zuletzt {versuche[versuche.length - 1].text}. Der Tarif ist {formatLinearEquation(M_TARIF, T_TARIF)}:
            1 € fürs Entsperren und 0,20 € pro Minute.
          </>
        ) : (
          <>Der Tarif ist {formatLinearEquation(M_TARIF, T_TARIF)}: 1 € fürs Entsperren und 0,20 € pro Minute.</>
        )}{' '}
        Der Dreisatz hat 9,75 € bzw. 7,50 € ergeben, weil er die Entsperrgebühr auf die Minuten verteilt.
      </p>
    </div>
  )
}
