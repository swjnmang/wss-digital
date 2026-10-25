import { useEffect, useId, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, ErklaerungCtx, Hilfen, McCard, TrackedCheck, TrackedMc, tx } from '../lernsituation_kit/kit'
import { Abschnitt, Aufklappbar, BeispielMitVideo, BonusSpiel, Fehlersuche, Handlungsprodukt, SeitenLernsituation, type Seite, type Thema } from '../lernsituation_kit/seiten'
import { Bilanz, usePunkteAufgabe } from '../lernsituation_kit/punkte'
import KugelTreffer from './KugelTreffer'
import { Kriterien } from '../../finanzmathe/zins_kit/zins_kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './lasershow.css'

// Lernsituation „Die Lasershow“: Schnittpunkt zweier Geraden mit dem Gleichsetzungsverfahren (ca. 90 min).
// Format Kundenauftrag / Maschine: Die SuS sind Azubis in der Veranstaltungstechnik. Für die Abschlussparty sollen sich zwei
// Bodenlaser genau in der Spiegelkugel treffen. Die Position der Kugel stellen sie am Laserpult ein.
// Problem erkennen: Die SuS probieren Positionen am Laserpult aus; jeder Versuch erscheint in der Skizze, das Pult meldet für
// beide Strahlen, wie hoch sie an dieser Stelle sind und ob sie die Kugel treffen. Auf den Zentimeter trifft man kaum.
// Problem lösen: Teil 1 Kreuzungspunkt S(1,6 | 2,8) durch Gleichsetzen (Rechenbeispiel Schultheater), Teil 2 (90 min) Strahl 3
// zuerst aus zwei Punkten aufstellen, dann gleichsetzen: S(2 | 3). Die Klasse ist beim Lösen von Gleichungen mit x auf beiden
// Seiten noch unsicher, deshalb zeigen Rechenbeispiel und Lösungsschema jede Umformung in einer eigenen Zeile.
// Handlungsprodukt analog: Spickzettel (Karteikarte) „Schnittpunkt berechnen“.
// Aha: Nur wo beide Strahlen gleich hoch sind, treffen sie sich. Diese Stelle findet man nicht durch Raten, sondern durch Gleichsetzen.
// Identität: Themenfarbe Indigo (Nacht, Party), Symbol fa-compact-disc, Titelbild Partyraum mit Lasern und Spiegelkugel,
// Leitobjekt das Laserpult mit der Spiegelkugel. Die Versuche bleiben nur im Seitenzustand (kein Speichern).
// Wird als Modus „Lernsituation“ auf der Seite „Schnittpunkt zweier Geraden“ angezeigt; der Infoteil (Erklärung mit
// Erklärvideo) kommt von dort und steht im Rechenbeispiel zum Aufklappen.

/** Lernvideo aus den Übungsaufgaben „Schnittpunkt zweier Geraden“ */
const VIDEO_SCHNITTPUNKT = 'https://www.youtube.com/watch?v=zbc5WmfLDiY'

/* ── Situation ───────────────────────────────────────────────────────────── */

// Seitenansicht des Partyraums, 1 LE = 1 m. y-Achse = Bühnenmitte (DJ-Pult), x-Achse = Boden, Decke in 4 m Höhe.
// Strahl 1 vom Bodenlaser bei (−4 | 0): y = 0,5x + 2. Strahl 2 vom Bodenlaser bei (4,4 | 0): y = −x + 4,4. Kreuzung S(1,6 | 2,8).
// Teil 2: Strahl 3 vom Bodenlaser R(5 | 0) zum Deckenspiegel D(1 | 4): y = −x + 5. Kreuzung mit Strahl 1: S(2 | 3).
const s1 = (x: number) => 0.5 * x + 2
const s2 = (x: number) => -x + 4.4
const s3 = (x: number) => -x + 5
const XS = 1.6
const YS = 2.8
const DECKE = 4
const PULT = { l: -0.5, r: 0.5, h: 1.1 }

type StrahlKey = 's1' | 's2' | 's3'
const STRAHL: Record<StrahlKey, { f: (x: number) => number; von: number; bis: number; name: string; haupt: boolean }> = {
  s1: { f: s1, von: -4, bis: 4, name: 'Strahl 1', haupt: true },
  s2: { f: s2, von: 0.4, bis: 4.4, name: 'Strahl 2', haupt: false },
  s3: { f: s3, von: 1, bis: 5, name: 'Strahl 3', haupt: false },
}

/** Eine Position der Spiegelkugel, die am Laserpult eingestellt wurde */
type Kugel = { x: number; y: number }
/** Die Kugel gilt als getroffen, wenn der Strahl auf 1 cm genau durch ihre Mitte geht */
const trifft = (f: (x: number) => number, k: Kugel) => Math.abs(f(k.x) - k.y) < 0.0051
const beideTreffen = (k: Kugel) => trifft(s1, k) && trifft(s2, k)
const abstand = (k: Kugel) => Math.hypot(k.x - XS, k.y - YS)
/** Länge in m als Text mit echtem Minuszeichen, z. B. „−1,5 m“ */
const meter = (v: number) => `${fmt(v, 2).replace('-', '−')} m`

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild der Startbox: Partyraum in der Seitenansicht, zwei Bodenlaser kreuzen sich in der Spiegelkugel über der Tanzfläche */
function Titelbild() {
  return (
    <svg viewBox="0 0 720 252" role="img" aria-label="Partyraum bei Nacht: Zwei Laser auf dem Boden strahlen schräg nach oben und kreuzen sich in einer Spiegelkugel, die an einem Seil von der Decke hängt. Links steht das DJ-Pult.">
      <rect x="0" y="0" width="720" height="22" fill="var(--primary)" />
      <rect x="0" y="212" width="720" height="40" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="212" y2="212" stroke="var(--ink)" strokeWidth="2" />
      {/* Strahlen */}
      <line x1="90" y1="206" x2="560" y2="22" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" />
      <line x1="650" y1="206" x2="350" y2="22" stroke="var(--ink)" strokeWidth="4" strokeDasharray="14 8" strokeLinecap="round" />
      {/* Bodenlaser */}
      <rect x="70" y="190" width="40" height="22" rx="4" fill="var(--ink)" />
      <rect x="630" y="190" width="40" height="22" rx="4" fill="var(--ink)" />
      {/* Spiegelkugel am Seil im Kreuzungspunkt */}
      <line x1="440" x2="440" y1="22" y2="98" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="440" cy="117" r="22" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
      <path d="M418 117 h44 M440 95 v44 M424 102 q16 15 32 0 M424 132 q16 -15 32 0" fill="none" stroke="var(--ink)" strokeWidth="1.5" opacity="0.6" />
      {/* DJ-Pult mit Plattenteller */}
      <rect x="200" y="150" width="120" height="62" rx="6" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <ellipse cx="236" cy="150" rx="22" ry="6" fill="var(--ink)" />
      <ellipse cx="286" cy="150" rx="22" ry="6" fill="var(--ink)" />
      <text x="260" y="190" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
        DJ
      </text>
      {/* Lichtpunkte auf dem Boden */}
      {[380, 470, 540].map((x) => (
        <ellipse key={x} cx={x} cy="230" rx="16" ry="5" fill="var(--primary-soft)" />
      ))}
    </svg>
  )
}

const THEMA: Thema = { name: 'Die Lasershow', farbe: 'indigo', icon: 'fa-compact-disc', bild: <Titelbild /> }

/* ── Leitobjekt: Seitenansicht des Partyraums mit Strahlen und Spiegelkugel ─ */

const B = { w: 680, h: 356, l: 42, r: 16, t: 14, b: 54, xMin: -5, xMax: 5.5, yMax: 4.5 }
const bx = (x: number) => B.l + ((x - B.xMin) / (B.xMax - B.xMin)) * (B.w - B.l - B.r)
const by = (y: number) => B.h - B.b - (y / B.yMax) * (B.h - B.t - B.b)

type KugelBild = Kugel & { art: 'alt' | 'aktuell' | 'treffer' }

/**
 * Seitenansicht: Boden, Decke, DJ-Pult, Bodenlaser und Strahlen.
 * kugeln: eingestellte Positionen der Spiegelkugel (alte blass, aktuelle kräftig, Treffer grün); punkte: beschriftete Punkte;
 * frage: Kreuzungsstelle mit Fragezeichen markieren (ohne das Ergebnis zu verraten)
 */
function RaumBild({
  strahlen,
  kugeln = [],
  punkte = [],
  frage = false,
  label,
}: {
  strahlen: StrahlKey[]
  kugeln?: KugelBild[]
  punkte?: { x: number; y: number; text: string; rechts?: boolean }[]
  frage?: boolean
  label: string
}) {
  const aktuell = kugeln[kugeln.length - 1]
  return (
    <div className="bk-graph ls-graph lz-bild">
      <svg viewBox={`0 0 ${B.w} ${B.h}`} role="img" aria-label={label}>
        {Array.from({ length: B.xMax - B.xMin + 0.5 }, (_, i) => B.xMin + i).map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(0)} y2={by(DECKE)} stroke="var(--grid)" />
            <text x={bx(v)} y={by(0) + 25} textAnchor="middle" fontSize="18" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {[1, 2, 3].map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(B.xMin)} x2={bx(B.xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            <text x={bx(0) - 7} y={by(v) + 6} textAnchor="end" fontSize="18" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {/* Decke und Boden */}
        <rect x={bx(B.xMin)} y={by(4.4)} width={bx(B.xMax) - bx(B.xMin)} height={by(DECKE) - by(4.4)} fill="var(--line-strong)" />
        <text x={bx(B.xMin) + 6} y={by(DECKE) + 20} fontSize="15" fill="var(--ink-muted)">
          Decke (4 m)
        </text>
        <line x1={bx(B.xMin)} x2={bx(B.xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="3" />
        <line x1={bx(0)} x2={bx(0)} y1={by(0)} y2={by(DECKE)} stroke="var(--ink)" strokeWidth="1.5" />
        <text x={bx(B.xMax) - 4} y={by(0) + 48} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
          Boden, x in m
        </text>
        {/* DJ-Pult */}
        <rect x={bx(PULT.l)} y={by(PULT.h)} width={bx(PULT.r) - bx(PULT.l)} height={by(0) - by(PULT.h)} fill="var(--surface-sunken)" stroke="var(--ink)" strokeWidth="2" />
        <text x={bx(0)} y={by(0.4)} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">
          DJ
        </text>
        {/* Strahlen mit Bodenlaser */}
        {strahlen.map((k) => {
          const s = STRAHL[k]
          const start = s.haupt ? s.von : s.bis
          const lx = s.haupt ? -2.4 : k === 's2' ? 3.75 : 3.1
          return (
            <g key={k}>
              <line
                x1={bx(s.von)}
                y1={by(s.f(s.von))}
                x2={bx(s.bis)}
                y2={by(s.f(s.bis))}
                stroke={s.haupt ? 'var(--primary)' : 'var(--ink)'}
                strokeWidth={s.haupt ? 4 : 3}
                strokeDasharray={s.haupt ? undefined : '12 6'}
              />
              <rect x={bx(start) - 13} y={by(0) - 14} width="26" height="14" rx="3" fill="var(--ink)" />
              <text
                x={bx(lx) + (s.haupt ? 4 : 10)}
                y={by(s.f(lx)) + (s.haupt ? 26 : 0)}
                textAnchor="start"
                fontSize="18"
                fontWeight="700"
                fill={s.haupt ? 'var(--primary)' : 'var(--ink)'}
              >
                {s.name}
              </text>
            </g>
          )
        })}
        {/* Messlinie an der Stelle der aktuellen Kugel: Höhe beider Strahlen */}
        {aktuell && (
          <g>
            <line x1={bx(aktuell.x)} x2={bx(aktuell.x)} y1={by(0)} y2={by(DECKE)} stroke="var(--ink-muted)" strokeDasharray="4 4" />
            {strahlen.map((k) => (
              <circle key={k} cx={bx(aktuell.x)} cy={by(STRAHL[k].f(aktuell.x))} r="5" fill={STRAHL[k].haupt ? 'var(--primary)' : 'var(--ink)'} />
            ))}
          </g>
        )}
        {/* Spiegelkugeln am Seil */}
        {kugeln.map((k, i) => (
          <g key={i} opacity={k.art === 'alt' ? 0.55 : 1}>
            <line x1={bx(k.x)} x2={bx(k.x)} y1={by(DECKE)} y2={by(k.y) - 11} stroke={k.art === 'alt' ? 'var(--line-strong)' : 'var(--ink)'} strokeWidth="1.5" />
            <circle
              cx={bx(k.x)}
              cy={by(k.y)}
              r={k.art === 'alt' ? 8 : 11}
              fill={k.art === 'treffer' ? 'var(--correct)' : k.art === 'aktuell' ? 'var(--highlight)' : 'var(--surface)'}
              stroke={k.art === 'alt' ? 'var(--line-strong)' : 'var(--ink)'}
              strokeWidth="2"
            />
          </g>
        ))}
        {frage && (
          <g>
            <circle cx={bx(XS)} cy={by(YS)} r="22" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="5 4" />
            <text x={bx(XS) + 30} y={by(YS) + 34} fontSize="22" fontWeight="800" fill="var(--ink)">
              S(? | ?)
            </text>
          </g>
        )}
        {punkte.map((p) => (
          <g key={p.text}>
            <circle cx={bx(p.x)} cy={by(p.y)} r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
            <text
              x={bx(p.x) + (p.rechts ? 14 : -30)}
              y={p.y >= DECKE ? by(4.2) + 6 : by(p.y) + (p.y === 0 ? -8 : -12)}
              textAnchor={p.rechts ? 'start' : 'end'}
              fontSize="18"
              fontWeight="700"
              fill={p.y >= DECKE ? '#fff' : 'var(--ink)'}
            >
              {p.text}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ── Phase 2: das Laserpult ──────────────────────────────────────────────── */

/** Laserpult: Position der Kugel eintippen, einstellen, die Kugel erscheint in der Skizze, das Pult meldet beide Strahlen */
function Laserpult({ versuche, onEinstellen }: { versuche: Kugel[]; onEinstellen: (k: Kugel) => void }) {
  const uid = useId()
  const [eingabe, setEingabe] = useState({ x: '', y: '' })
  const [fehlt, setFehlt] = useState(false)
  const letzter = versuche[versuche.length - 1]
  const treffer = versuche.some(beideTreffen)
  // Ausprobieren zählt wie eine Festlegung: 5 Punkte, sobald die Seite frei ist
  const pt = usePunkteAufgabe({ wert: 5, serie: false })
  const frei = versuche.length >= 3 || treffer
  useEffect(() => {
    if (frei) pt.geloest()
  }, [frei, pt])
  const kugeln: KugelBild[] = versuche.map((k, i) => ({
    ...k,
    art: beideTreffen(k) ? 'treffer' : i === versuche.length - 1 ? 'aktuell' : 'alt',
  }))

  const einstellen = () => {
    const x = parseInput(eingabe.x)
    const y = parseInput(eingabe.y)
    if (!x || !y) return setFehlt(true)
    setFehlt(false)
    onEinstellen({ x: Math.min(5, Math.max(-4.5, x.value)), y: Math.min(3.9, Math.max(0.2, y.value)) })
  }
  const feld = (k: 'x' | 'y', label: string) => (
    <input
      id={`${uid}-${k}`}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="?"
      aria-label={label}
      className="bk-input lp-input lp-input-sm ls-gap"
      value={eingabe[k]}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe({ ...eingabe, [k]: e.target.value })}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') einstellen()
      }}
    />
  )
  const meldung = (f: (x: number) => number, name: string, k: Kugel) => {
    const h = f(k.x)
    const ok = trifft(f, k)
    return (
      <li>
        <i className={`fa-solid ${ok ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" /> {name} ist bei <M>{`x = ${tx(k.x, 2)}`}</M> genau {meter(h)} hoch:{' '}
        {ok ? 'trifft die Kugel.' : <>verfehlt die Kugel, er läuft {meter(Math.abs(h - k.y))} {h > k.y ? 'darüber' : 'darunter'} vorbei.</>}
      </li>
    )
  }

  return (
    <div className="lz-pult" data-no-autocheck>
      <RaumBild
        strahlen={['s1', 's2']}
        kugeln={kugeln}
        label="Seitenansicht des Partyraums mit Strahl 1 und Strahl 2 und den eingestellten Positionen der Spiegelkugel"
      />
      <div className="lz-eingabe">
        <span>Spiegelkugel bei</span>
        <label htmlFor={`${uid}-x`}>
          <M>{'x ='}</M> {feld('x', 'Abstand zur Bühnenmitte x in m')} m,
        </label>
        <label htmlFor={`${uid}-y`}>
          Höhe <M>{'y ='}</M> {feld('y', 'Höhe y in m')} m
        </label>
        <button type="button" className="bk-btn bk-btn-primary" onClick={einstellen}>
          <i className="fa-solid fa-sliders" aria-hidden="true" /> Kugel einstellen
        </button>
      </div>
      {fehlt && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> Bitte trage für <M>x</M> und <M>y</M> eine Zahl ein, z. B. 1,5.
        </div>
      )}
      {letzter && (
        <div className={`lz-display ${beideTreffen(letzter) ? 'lz-display-ok' : ''}`} role="status">
          <div className="lz-display-head">
            <i className="fa-solid fa-compact-disc" aria-hidden="true" /> Laserpult, Versuch {versuche.length}: Kugel bei <M>{`(${tx(letzter.x, 2)} \\mid ${tx(letzter.y, 2)})`}</M>
          </div>
          <ul>
            {meldung(s1, 'Strahl 1', letzter)}
            {meldung(s2, 'Strahl 2', letzter)}
          </ul>
        </div>
      )}
      {frei && (
        <p className="sl-hinweis">
          {treffer ? 'Treffer! Aber bei der nächsten Show stehen die Laser anders.' : 'Raten bringt dich kaum ans Ziel, die Kugel muss auf den Zentimeter genau hängen.'} Ist dir
          aufgefallen, wann ein Strahl die Kugel trifft? Gleich lernst du, wie du die Stelle sicher berechnest.
        </p>
      )}
    </div>
  )
}

/* ── Phase 3: Bilder und Rechenbeispiele ─────────────────────────────────── */

/** Handlungsprodukt: Karteikarte „Schnittpunkt berechnen“ mit Stift */
function KarteikarteBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg viewBox="0 0 720 190" role="img" aria-label="Eine Karteikarte mit der Überschrift Schnittpunkt berechnen, darunter nummerierte Zeilen für die Schritte und eine kleine Skizze von zwei sich kreuzenden Geraden.">
        <rect x="150" y="14" width="420" height="168" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="150" y="14" width="420" height="40" rx="8" fill="var(--primary-soft)" />
        <line x1="150" x2="570" y1="54" y2="54" stroke="var(--primary)" strokeWidth="2" />
        <text x="172" y="42" fontSize="21" fontWeight="800" fill="var(--ink)">
          Schnittpunkt berechnen
        </text>
        {[1, 2, 3, 4].map((n, i) => (
          <g key={n}>
            <text x="172" y={84 + i * 26} fontSize="17" fontWeight="700" fill="var(--primary)">
              {n}.
            </text>
            <line x1="194" x2={i % 2 ? 380 : 420} y1={80 + i * 26} y2={80 + i * 26} stroke="var(--line-strong)" strokeWidth="2" />
          </g>
        ))}
        <line x1="450" y1="166" x2="548" y2="76" stroke="var(--primary)" strokeWidth="3" />
        <line x1="450" y1="86" x2="548" y2="160" stroke="var(--ink)" strokeWidth="2.5" strokeDasharray="8 4" />
        <circle cx="498" cy="122" r="6" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        <g transform="rotate(-35 640 120)">
          <rect x="590" y="110" width="110" height="18" rx="4" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
          <polygon points="590,110 574,119 590,128" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  )
}

const BSP1_AUFGABE = (
  <p>
    Im Schultheater leuchten zwei Scheinwerfer schräg über die Bühne. Scheinwerfer 1: <M>{'y = 0{,}5x + 1'}</M>, Scheinwerfer 2: <M>{'y = -2x + 6'}</M>. In welchem
    Punkt kreuzen sich die beiden Lichtstrahlen?
  </p>
)
const BSP1_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Die Terme gleichsetzen',
    body: (
      <>
        <p>Im Kreuzungspunkt sind beide Strahlen gleich hoch, ihre y-Werte sind gleich. Deshalb setzt du die beiden Terme gleich:</p>
        <MB>{'0{,}5x + 1 = -2x + 6'}</MB>
      </>
    ),
  },
  {
    title: <>Alle <M>x</M> auf eine Seite bringen</>,
    body: (
      <>
        <p>
          Rechts steht <M>{'-2x'}</M>. Mit <M>{'+2x'}</M> verschwindet es dort. Was du auf einer Seite rechnest, rechnest du auch auf der anderen (wie bei einer Waage):
        </p>
        <MB>{'\\begin{aligned} 0{,}5x + 1 &= -2x + 6 && \\mid +2x \\\\ 2{,}5x + 1 &= 6 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: 'Die Zahlen auf die andere Seite bringen',
    body: (
      <>
        <p>
          Links steht noch <M>{'+1'}</M>. Mit <M>{'-1'}</M> verschwindet es:
        </p>
        <MB>{'\\begin{aligned} 2{,}5x + 1 &= 6 && \\mid -1 \\\\ 2{,}5x &= 5 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: <>Durch die Zahl vor <M>x</M> teilen</>,
    body: (
      <>
        <MB>{'\\begin{aligned} 2{,}5x &= 5 && \\mid :2{,}5 \\\\ x_S &= 2 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: <><M>x_S</M> einsetzen, Probe machen und den Punkt angeben</>,
    body: (
      <>
        <p>
          Setze <M>{'x_S = 2'}</M> in eine der beiden Gleichungen ein. Mit der anderen machst du die Probe, dort muss dasselbe herauskommen:
        </p>
        <MB>{'\\begin{aligned} x = 2{:}\\quad y &= 0{,}5 \\cdot 2 + 1 = 2 \\\\ \\text{Probe: } y &= -2 \\cdot 2 + 6 = 2 \\;\\checkmark \\end{aligned}'}</MB>
        <p>
          Die Lichtstrahlen kreuzen sich in <M>{'S(2 \\mid 2)'}</M>: 2 m rechts der Bühnenmitte in 2 m Höhe.
        </p>
      </>
    ),
  },
]

const BSP2_AUFGABE = (
  <p>
    Ein Scheinwerfer steht bei <M>{'A(-2 \\mid 0)'}</M> und leuchtet durch den Punkt <M>{'B(2 \\mid 4)'}</M>. Ein zweiter Strahl hat die Gleichung <M>{'y = -2x + 8'}</M>. Wo
    kreuzen sich die Strahlen?
  </p>
)
const BSP2_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Steigung aus zwei Punkten',
    body: <MB>{'m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{4 - 0}{2 - (-2)} = \\frac{4}{4} = 1'}</MB>,
  },
  {
    title: <>Einen Punkt einsetzen und <M>t</M> berechnen</>,
    body: (
      <>
        <p>
          Setze <M>{'m = 1'}</M> und <M>{'A(-2 \\mid 0)'}</M> in <M>{'y = mx + t'}</M> ein:
        </p>
        <MB>{'\\begin{aligned} 0 &= 1 \\cdot (-2) + t \\\\ 0 &= -2 + t && \\mid +2 \\\\ t &= 2 \\end{aligned}'}</MB>
        <p>
          Der erste Strahl hat die Gleichung <M>{'y = x + 2'}</M>.
        </p>
      </>
    ),
  },
  {
    title: 'Die Terme gleichsetzen und lösen',
    body: <MB>{'\\begin{aligned} x + 2 &= -2x + 8 && \\mid +2x \\\\ 3x + 2 &= 8 && \\mid -2 \\\\ 3x &= 6 && \\mid :3 \\\\ x_S &= 2 \\end{aligned}'}</MB>,
  },
  {
    title: 'Einsetzen und den Punkt angeben',
    body: (
      <>
        <MB>{'x = 2{:}\\quad y = 2 + 2 = 4 \\qquad \\text{Probe: } y = -2 \\cdot 2 + 8 = 4 \\;\\checkmark'}</MB>
        <p>
          Die Strahlen kreuzen sich in <M>{'S(2 \\mid 4)'}</M>.
        </p>
      </>
    ),
  },
]

/** Lösungsweg Teil 1 (für beide Wege: selbst rechnen und Lösungsschema) */
const LOESUNG1 = (
  <>
    <MB>
      {
        '\\begin{aligned} 0{,}5x + 2 &= -x + 4{,}4 && \\mid +x \\\\ 1{,}5x + 2 &= 4{,}4 && \\mid -2 \\\\ 1{,}5x &= 2{,}4 && \\mid :1{,}5 \\\\ x_S &= 1{,}6 \\end{aligned}'
      }
    </MB>
    <MB>{'x = 1{,}6{:}\\quad y = 0{,}5 \\cdot 1{,}6 + 2 = 2{,}8 \\qquad \\text{Probe: } y = -1{,}6 + 4{,}4 = 2{,}8 \\;\\checkmark'}</MB>
    <p>
      Die Kugel muss bei <M>{'S(1{,}6 \\mid 2{,}8)'}</M> hängen: 1,6 m rechts der Bühnenmitte in 2,8 m Höhe.
    </p>
  </>
)

/** Lösungsweg Teil 2 */
const LOESUNG2 = (
  <>
    <MB>{'m = \\frac{4 - 0}{1 - 5} = \\frac{4}{-4} = -1 \\qquad 0 = -1 \\cdot 5 + t \\;\\Rightarrow\\; t = 5 \\qquad \\text{Strahl 3: } y = -x + 5'}</MB>
    <MB>{'\\begin{aligned} 0{,}5x + 2 &= -x + 5 && \\mid +x \\\\ 1{,}5x + 2 &= 5 && \\mid -2 \\\\ 1{,}5x &= 3 && \\mid :1{,}5 \\\\ x_S &= 2 \\end{aligned}'}</MB>
    <MB>{'x = 2{:}\\quad y = 0{,}5 \\cdot 2 + 2 = 3 \\qquad \\text{Probe: } y = -2 + 5 = 3 \\;\\checkmark'}</MB>
    <p>
      Für die zweite Show hängt die Kugel bei <M>{'S(2 \\mid 3)'}</M>.
    </p>
  </>
)

/* ── Phase 4: Wer hat recht? ─────────────────────────────────────────────── */

function Plan({ name, tex }: { name: string; tex: string }) {
  return (
    <div className="lz-plan">
      <div className="lz-plan-name">Rechnung von {name}</div>
      <MB>{tex}</MB>
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function LaserEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [versuche, setVersuche] = useState<Kugel[]>([])
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
            title="a) x einsetzen"
            prompt={
              <p>
                Ein Laserstrahl hat die Gleichung <M>{'y = 0{,}5x + 2'}</M>. Wie hoch ist er an der Stelle <M>{'x = -2'}</M>?
              </p>
            }
            fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 1, unit: 'm' }]}
            solution={<MB>{'x = -2{:}\\quad y = 0{,}5 \\cdot (-2) + 2 = -1 + 2 = 1'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            title="b) x-Terme zusammenfassen"
            prompt={<p>Fasse zusammen. Trage die Zahl vor <M>x</M> ein.</p>}
            rechnung={[
              { l: ['0{,}5x + x'], r: [{ luecke: 'k1' }, 'x'] },
              { l: ['2x - 0{,}5x'], r: [{ luecke: 'k2' }, 'x'] },
            ]}
            fields={[
              { kind: 'num', key: 'k1', label: 'Zahl vor x in der ersten Zeile', expected: 1.5 },
              { kind: 'num', key: 'k2', label: 'Zahl vor x in der zweiten Zeile', expected: 1.5 },
            ]}
            solution={<MB>{'0{,}5x + 1x = 1{,}5x \\qquad 2x - 0{,}5x = 1{,}5x'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            title="c) Gleichung lösen"
            prompt={
              <p>
                Löse die Gleichung nach <M>x</M> auf. Schreibe zu jeder Umformung dazu, was du rechnest, z. B. <M>{'\\mid -2'}</M>.
              </p>
            }
            lead={<M>{'1{,}5x + 2 = 5 \\qquad \\Rightarrow'}</M>}
            fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 2 }]}
            solution={<MB>{'\\begin{aligned} 1{,}5x + 2 &= 5 && \\mid -2 \\\\ 1{,}5x &= 3 && \\mid :1{,}5 \\\\ x &= 2 \\end{aligned}'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Ziel: Am Ende steht <M>x</M> allein auf einer Seite. Was stört dich links noch?</>,
                  <>Zuerst die Zahl ohne <M>x</M> wegbringen, dann durch die Zahl vor <M>x</M> teilen.</>,
                  <>
                    <M>{'1{,}5x + 2 = 5 \\;\\mid -2'}</M> ergibt <M>{'1{,}5x = 3'}</M>. Jetzt noch <M>{'\\mid :1{,}5'}</M>.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            title="d) Durch eine negative Zahl teilen"
            prompt={<p>Löse die Gleichung nach <M>x</M> auf. Achte beim Teilen auf das Vorzeichen.</p>}
            lead={<M>{'-2x + 7 = 1 \\qquad \\Rightarrow'}</M>}
            fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 3 }]}
            solution={<MB>{'\\begin{aligned} -2x + 7 &= 1 && \\mid -7 \\\\ -2x &= -6 && \\mid :(-2) \\\\ x &= 3 \\end{aligned}'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Wie in c): erst die Zahl ohne <M>x</M> wegbringen, dann teilen.</>,
                  <>
                    Nach <M>{'\\mid -7'}</M> steht <M>{'-2x = -6'}</M>. Jetzt teilst du durch <M>{'-2'}</M>, nicht durch 2.
                  </>,
                  <>Minus durch Minus ergibt Plus.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            title="e) Gleichung aus zwei Punkten"
            prompt={
              <p>
                Ein Bodenlaser steht bei <M>{'P(-4 \\mid 0)'}</M>. Sein Strahl geht durch <M>{'Q(0 \\mid 2)'}</M>. Bestimme die Gleichung <M>{'y = mx + t'}</M> des Strahls.
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'm', label: <M>{'m ='}</M>, expected: 0.5 },
              { kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 2 },
            ]}
            solution={
              <>
                <MB>{'m = \\frac{2 - 0}{0 - (-4)} = \\frac{2}{4} = 0{,}5'}</MB>
                <p>
                  <M>{'Q(0 \\mid 2)'}</M> liegt auf der y-Achse, also ist <M>{'t = 2'}</M>. Der Strahl hat die Gleichung <M>{'y = 0{,}5x + 2'}</M>.
                </p>
              </>
            }
            help={
              <Hilfen
                steps={[
                  <>Die Steigung bekommst du aus zwei Punkten. Für <M>t</M> hilft ein Blick auf <M>Q</M>.</>,
                  <>
                    <M>{'m = \\frac{y_2 - y_1}{x_2 - x_1}'}</M>. Achtung bei der negativen Zahl: <M>{'0 - (-4)'}</M>.
                  </>,
                  <>
                    <M>{'m = \\frac{2 - 0}{0 + 4}'}</M>. <M>Q</M> hat <M>{'x = 0'}</M>, liegt also auf der y-Achse: Dort liest du <M>t</M> direkt ab.
                  </>,
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Die Spiegelkugel für die Abschlussparty',
      bedingung: 'Nach drei Versuchen am Laserpult geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du machst eine Ausbildung zur Fachkraft für Veranstaltungstechnik. Für die Abschlussparty einer Schule baust du die Lasershow auf. Zwei Bodenlaser strahlen schräg nach oben
            durch den Raum. Die DJ wünscht sich: „Beide Strahlen sollen sich genau in der Spiegelkugel treffen!“
          </p>
          <p className="sl-text">
            Die Bühnenmitte ist die y-Achse, der Boden die x-Achse (in m). Strahl 1: <M>{'y = 0{,}5x + 2'}</M>, Strahl 2: <M>{'y = -x + 4{,}4'}</M>. Gesucht ist die Position{' '}
            <M>{'S(x \\mid y)'}</M>, an der die Spiegelkugel hängen muss. Am Laserpult stellst du ein, wie weit rechts der Bühnenmitte (<M>x</M>) und wie hoch (<M>y</M>) sie hängt.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
            <p>Stelle am Laserpult eine Position für die Kugel ein und schau, ob beide Strahlen sie treffen. Schaffst du es auf den Zentimeter genau?</p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 10 Minuten.</p>
          <Laserpult
            versuche={versuche}
            onEinstellen={(k) => {
              setVersuche((alt) => [...alt, k])
              if (versuche.length + 1 >= 3 || beideTreffen(k)) fertig()
            }}
          />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Position der Spiegelkugel berechnen',
      pflicht: ['teil1', 'teil2', 'produkt'],
      inhalt: (fertig) => {
        const teil1Melden = () => {
          fertig.teil('teil1')()
          setGeloest(true)
        }
        return (
          <>
            <p className="sl-hinweis">Einzelarbeit, Teil 2 auch in Partnerarbeit, ca. 45 Minuten.</p>
            <div className="sl-fokus">
              <p className="sl-fokus-titel">Deine Aufgabe: Berechne, wo sich die beiden Strahlen kreuzen</p>
              <p>
                Strahl 1: <M>{'y = 0{,}5x + 2'}</M>, Strahl 2: <M>{'y = -x + 4{,}4'}</M>. Im Kreuzungspunkt sind beide Strahlen gleich hoch. Berechne in deinem Heft den
                Schnittpunkt <M>{'S(x_S \\mid y_S)'}</M> der beiden Geraden. Dort muss die Spiegelkugel hängen.
              </p>
            </div>
            <RaumBild strahlen={['s1', 's2']} frage label="Seitenansicht mit Strahl 1 und Strahl 2. Die Kreuzungsstelle ist mit einem Fragezeichen markiert." />
            <BeispielMitVideo video={VIDEO_SCHNITTPUNKT} videoTitel="Lernvideo: Schnittpunkt zweier Geraden berechnen">
              <Beispiel offen title="Wo kreuzen sich die Scheinwerfer im Schultheater?" aufgabe={BSP1_AUFGABE} steps={BSP1_SCHRITTE} />
            </BeispielMitVideo>
            <Abschnitt titel="Teil 1: Vergleiche deine Ergebnisse">
              <CheckCard
                onSolved={teil1Melden}
                onFehler={() => setFehler1(true)}
                title="Position der Spiegelkugel"
                prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
                fields={[
                  { kind: 'num', key: 'x', label: <>Wie weit rechts der Bühnenmitte muss die Kugel hängen? <M>{'x_S ='}</M></>, expected: XS, unit: 'm' },
                  { kind: 'num', key: 'y', label: <>In welcher Höhe muss sie hängen? <M>{'y_S ='}</M></>, expected: YS, unit: 'm' },
                ]}
                loesungNachFehler
                solution={LOESUNG1}
                help={
                  <Hilfen
                    steps={[
                      <>An der gesuchten Stelle sind beide Strahlen gleich hoch. Was bedeutet das für die beiden Terme?</>,
                      <>
                        Setze die Terme gleich: <M>{'0{,}5x + 2 = -x + 4{,}4'}</M>. Bringe dann alle <M>x</M> auf eine Seite, danach die Zahlen auf die andere.
                      </>,
                      <>
                        <M>{'\\mid +x'}</M> ergibt <M>{'1{,}5x + 2 = 4{,}4'}</M>. Weiter mit <M>{'\\mid -2'}</M> und <M>{'\\mid :1{,}5'}</M>. Setze <M>{'x_S'}</M> zum Schluss in
                        Strahl 1 ein.
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
                    { l: ['0{,}5x + 2'], r: ['-x + 4{,}4'], u: '\\mid +x \\;\\; \\text{① gleichsetzen}' },
                    { l: [{ luecke: 'k' }, 'x + 2'], r: ['4{,}4'], u: '\\mid -2 \\;\\; \\text{② } x \\text{ links}' },
                    { l: [{ luecke: 'k2' }, 'x'], r: [{ luecke: 'z' }], u: '\\text{③ Zahlen rechts}' },
                  ]}
                  fields={[
                    { kind: 'num', key: 'k', label: 'Zahl vor x nach | +x', expected: 1.5 },
                    { kind: 'num', key: 'k2', label: 'Zahl vor x nach | −2', expected: 1.5 },
                    { kind: 'num', key: 'z', label: 'rechte Seite nach | −2', expected: 2.4 },
                  ]}
                />
              </Fehlersuche>
            </Abschnitt>
            <Abschnitt titel="Teil 2: Die zweite Show">
              <div className="sl-fokus">
                <p className="sl-fokus-titel">Deine Aufgabe: Wo hängt die Kugel bei der zweiten Show?</p>
                <p>
                  Für die zweite Show wird Strahl 2 durch einen neuen Strahl 3 ersetzt: Der Bodenlaser steht bei <M>{'R(5 \\mid 0)'}</M> und zielt auf den Deckenspiegel{' '}
                  <M>{'D(1 \\mid 4)'}</M>. Strahl 1 bleibt. Stelle zuerst die Gleichung von Strahl 3 auf und berechne dann den Schnittpunkt mit Strahl 1.
                </p>
              </div>
              <RaumBild
                strahlen={['s1', 's3']}
                punkte={[
                  { x: 5, y: 0, text: 'R(5 | 0)', rechts: false },
                  { x: 1, y: 4, text: 'D(1 | 4)', rechts: true },
                ]}
                label="Seitenansicht mit Strahl 1 und dem neuen Strahl 3 vom Bodenlaser R(5 | 0) zum Deckenspiegel D(1 | 4)."
              />
              <BeispielMitVideo>
                <Beispiel offen title="Erst die Gleichung, dann der Schnittpunkt" aufgabe={BSP2_AUFGABE} steps={BSP2_SCHRITTE} />
              </BeispielMitVideo>
              <CheckCard
                onSolved={fertig.teil('teil2')}
                onFehler={() => setFehler2(true)}
                title="Zweite Show"
                prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
                fields={[
                  { kind: 'num', key: 'x', label: <>Wie weit rechts der Bühnenmitte hängt die Kugel bei der zweiten Show? <M>{'x_S ='}</M></>, expected: 2, unit: 'm' },
                  { kind: 'num', key: 'y', label: <>In welcher Höhe hängt sie? <M>{'y_S ='}</M></>, expected: 3, unit: 'm' },
                ]}
                loesungNachFehler
                solution={LOESUNG2}
                help={
                  <Hilfen
                    steps={[
                      <>Wie im Rechenbeispiel: Zuerst brauchst du die Gleichung von Strahl 3, erst dann kannst du gleichsetzen.</>,
                      <>
                        Steigung aus <M>R</M> und <M>D</M>, dann <M>R</M> in <M>{'y = mx + t'}</M> einsetzen. Danach wie in Teil 1 gleichsetzen.
                      </>,
                      <>
                        <M>{'m = \\frac{4 - 0}{1 - 5}'}</M>. Mit <M>{'R(5 \\mid 0)'}</M>: <M>{'0 = m \\cdot 5 + t'}</M>. Dann <M>{'0{,}5x + 2 = mx + t'}</M>.
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
                    { l: ['m'], r: ['\\frac{4 - 0}{1 - 5} =', { luecke: 'm' }], u: '\\text{① Steigung}' },
                    { l: ['t'], r: [{ luecke: 't' }], u: '\\text{② } R \\text{ einsetzen}' },
                    { l: ['0{,}5x + 2'], r: [{ luecke: 'm2' }, 'x +', { luecke: 't2' }], u: '\\text{③ gleichsetzen}' },
                  ]}
                  fields={[
                    { kind: 'num', key: 'm', label: 'Steigung von Strahl 3', expected: -1 },
                    { kind: 'num', key: 't', label: 'y-Achsenabschnitt von Strahl 3', expected: 5 },
                    { kind: 'num', key: 'm2', label: 'Steigung im gleichgesetzten Term', expected: -1 },
                    { kind: 'num', key: 't2', label: 'y-Achsenabschnitt im gleichgesetzten Term', expected: 5 },
                  ]}
                />
              </Fehlersuche>
            </Abschnitt>
            <Handlungsprodukt titel="Spickzettel „Schnittpunkt berechnen“">
              <KarteikarteBild />
              <p className="sl-text">
                Gestalte in deinem Heft oder auf einer Karteikarte einen Spickzettel „Schnittpunkt berechnen“. Schreibe die Schritte auf und rechne darauf die Position der
                Spiegelkugel aus Teil 1 als Beispiel vor. Mit ihm kannst du später jede Schnittpunkt-Aufgabe lösen.
              </p>
              <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
                <ul className="zk-liste">
                  <li>„Im Schnittpunkt sind die y-Werte gleich, deshalb …“</li>
                  <li>„Schritt 1: … Schritt 2: alle x auf eine Seite … Schritt 3: …“</li>
                  <li>„Vorsicht: Wenn ich durch eine negative Zahl teile, …“</li>
                  <li>„Probe: Ich setze x in die andere Gleichung ein …“</li>
                  <li>
                    „Abkürzungen: <M>S</M> = …, <M>{'x_S'}</M> = …, <M>m</M> = Steigung, <M>t</M> = …“
                  </li>
                </ul>
              </Aufklappbar>
            </Handlungsprodukt>
            <Abschnitt titel="Ist dein Spickzettel vollständig?">
              <Kriterien
                onAlle={fertig.teil('produkt')}
                items={[
                  'Ein Satz, warum man die Terme gleichsetzt (im Schnittpunkt sind die y-Werte gleich)',
                  'Alle Schritte in der richtigen Reihenfolge, mit den Umformungen wie „| +x“ und „| −2“',
                  'Die Rechnung für die Spiegelkugel mit Probe und dem Schnittpunkt S',
                  'Eine Warnung vor einem typischen Fehler, z. B. Vorzeichen oder nur x angeben',
                  <>
                    Auf deinem Spickzettel steht, wofür die Abkürzungen stehen: <M>S</M> (Schnittpunkt), <M>{'x_S'}</M> und <M>{'y_S'}</M> (seine Koordinaten),{' '}
                    <M>m</M> (Steigung) und <M>t</M> (y-Achsenabschnitt). Außerdem erklärst du die Begriffe „Terme gleichsetzen“ und „Probe“ und alle anderen Wörter, die
                    für dich neu waren.
                  </>,
                ]}
              />
            </Abschnitt>
            {geloest && (
              <Abschnitt titel="Das hältst du fest">
                <Rueckbezug versuche={versuche} />
                <Merke title="Schnittpunkt zweier Geraden">
                  <p>
                    Im <strong>Schnittpunkt</strong> <M>{'S(x_S \\mid y_S)'}</M> haben beide Geraden denselben <M>x</M>-Wert <strong>und</strong> denselben <M>y</M>-Wert.
                  </p>
                  <ol className="zk-liste" style={{ listStyleType: 'decimal' }}>
                    <li>
                      Die Terme gleichsetzen: <M>{'m_1 x + t_1 = m_2 x + t_2'}</M>
                    </li>
                    <li>
                      Alle <M>x</M> auf eine Seite, die Zahlen auf die andere Seite bringen, durch die Zahl vor <M>x</M> teilen. Das ergibt <M>{'x_S'}</M>.
                    </li>
                    <li>
                      <M>{'x_S'}</M> in eine der beiden Gleichungen einsetzen. Das ergibt <M>{'y_S'}</M>. Probe mit der anderen Gleichung.
                    </li>
                    <li>
                      Den Schnittpunkt angeben, bei Sachaufgaben mit Antwortsatz: <M>{'S(1{,}6 \\mid 2{,}8)'}</M>, die Kugel hängt 1,6 m rechts der Bühnenmitte in 2,8 m Höhe.
                    </li>
                  </ol>
                  <p>Ist eine Gerade nur durch zwei Punkte gegeben, stellst du zuerst ihre Gleichung auf.</p>
                </Merke>
              </Abschnitt>
            )}
          </>
        )
      },
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      pflicht: ['1', '2', '3', '4'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die fünfte ist freiwillig für Profis. Wenn du die vier Pflichtaufgaben gelöst hast, wartet unten ein Spiel auf dich. Einzelarbeit, ca. 25 Minuten.</p>
          <Abschnitt titel="Übung 1: Welcher Schnittpunkt stimmt?">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              topic="Schnittpunkt-Einstieg: Schnittpunkt auswählen (Basis)"
              title="Übung 1"
              rechnen
              level="basis"
              prompt={
                <p>
                  Gerade 1: <M>{'y = 2x + 1'}</M>, Gerade 2: <M>{'y = -x + 7'}</M>. Berechne den Schnittpunkt.
                </p>
              }
              options={[
                { text: <M>{'x = 2'}</M>, feedback: 'Der x-Wert stimmt, aber ein Schnittpunkt hat zwei Koordinaten. Setze x = 2 noch in eine der beiden Gleichungen ein.' },
                { text: <M>{'S(5 \\mid 2)'}</M>, feedback: 'Die Zahlen stimmen, aber x und y sind vertauscht. Im Punkt steht zuerst der x-Wert.' },
                { text: <M>{'S(6 \\mid 13)'}</M>, feedback: 'Beim Umstellen ist ein Vorzeichen verloren gegangen: Mit | +x wird aus 2x + 1 = −x + 7 die Gleichung 3x + 1 = 7.' },
                { text: <M>{'S(2 \\mid 5)'}</M>, correct: true, feedback: '2x + 1 = −x + 7 ergibt 3x = 6, also x = 2 und y = 2 · 2 + 1 = 5.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              topic="Schnittpunkt-Einstieg: Fehler beim Umformen (Standard)"
              title="Übung 2"
              level="standard"
              prompt={
                <>
                  <p>
                    Zwei Azubis berechnen den Schnittpunkt von Strahl A: <M>{'y = 0{,}5x + 3'}</M> und Strahl B: <M>{'y = 2x - 3'}</M>. Wer hat recht?
                  </p>
                  <div className="lz-plaene">
                    <Plan
                      name="Mia"
                      tex={'\\begin{aligned} 0{,}5x + 3 &= 2x - 3 && \\mid -0{,}5x \\\\ 3 &= 1{,}5x - 3 && \\mid +3 \\\\ 6 &= 1{,}5x && \\mid :1{,}5 \\\\ x &= 4 \\end{aligned}'}
                    />
                    <Plan
                      name="Leon"
                      tex={'\\begin{aligned} 0{,}5x + 3 &= 2x - 3 && \\mid -2x \\\\ -1{,}5x + 3 &= -3 && \\mid -3 \\\\ -1{,}5x &= -6 && \\mid :(-1{,}5) \\\\ x &= -4 \\end{aligned}'}
                    />
                  </div>
                </>
              }
              options={[
                { text: 'Leon, denn man muss die x immer nach links bringen.', feedback: 'Auf welche Seite die x kommen, ist egal. Prüfe Leons letzte Zeile: Was ergibt −6 : (−1,5)?' },
                {
                  text: 'Mia. Leon hat beim Teilen durch −1,5 einen Vorzeichenfehler gemacht.',
                  correct: true,
                  feedback: 'Minus durch Minus ergibt Plus: −6 : (−1,5) = 4. Beide Wege führen zu x = 4, Leon hat sich nur am Ende verrechnet.',
                },
                { text: 'Beide, es gibt eben zwei Schnittpunkte.', feedback: 'Zwei Geraden mit verschiedener Steigung schneiden sich in genau einem Punkt. Einer der beiden hat sich verrechnet.' },
                { text: 'Keiner, man darf nicht mit Dezimalzahlen umformen.', feedback: 'Mit Dezimalzahlen rechnest du genauso wie mit ganzen Zahlen. Prüfe die einzelnen Zeilen.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Scheinwerfer im Schultheater">
            <TrackedCheck
              onSolved={uebung('3', fertig.teil('3'))}
              topic="Schnittpunkt-Einstieg: Schnittpunkt berechnen (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Scheinwerfer A: <M>{'y = -0{,}4x + 3{,}2'}</M>, Scheinwerfer B: <M>{'y = 0{,}6x + 0{,}7'}</M>. In welchem Punkt kreuzen sich die Lichtstrahlen?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'x', label: <M>{'x_S ='}</M>, expected: 2.5 },
                { kind: 'num', key: 'y', label: <M>{'y_S ='}</M>, expected: 2.2 },
              ]}
              solution={
                <>
                  <MB>{'\\begin{aligned} -0{,}4x + 3{,}2 &= 0{,}6x + 0{,}7 && \\mid +0{,}4x \\\\ 3{,}2 &= x + 0{,}7 && \\mid -0{,}7 \\\\ x_S &= 2{,}5 \\end{aligned}'}</MB>
                  <MB>{'x = 2{,}5{:}\\quad y = -0{,}4 \\cdot 2{,}5 + 3{,}2 = 2{,}2 \\qquad S(2{,}5 \\mid 2{,}2)'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Setze die Terme gleich. Auf welcher Seite ist es geschickter, die <M>x</M> zu sammeln?</>,
                    <>
                      Mit <M>{'\\mid +0{,}4x'}</M> stehen alle <M>x</M> rechts, und die Zahl vor <M>x</M> wird positiv.
                    </>,
                    <>
                      <M>{'3{,}2 = 0{,}6x + 0{,}4x + 0{,}7'}</M>, also <M>{'3{,}2 = x + 0{,}7'}</M>. Jetzt <M>{'\\mid -0{,}7'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Umgekehrt gedacht">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              topic="Schnittpunkt-Einstieg: Gerade durch den Schnittpunkt (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Bei der Zugabe soll die Spiegelkugel genau über der Bühnenmitte in <M>{'S(0 \\mid 2)'}</M> hängen. Strahl 1 (<M>{'y = 0{,}5x + 2'}</M>) trifft sie dort schon. Ein
                  Bodenlaser steht bei <M>{'(4 \\mid 0)'}</M>. Welche Gleichung muss sein Strahl haben, damit er die Kugel auch trifft?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'm', label: <M>{'m ='}</M>, expected: -0.5 },
                { kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 2 },
              ]}
              solution={
                <>
                  <MB>{'m = \\frac{2 - 0}{0 - 4} = -0{,}5 \\qquad t = 2 \\;\\; (S \\text{ liegt auf der y-Achse})'}</MB>
                  <p>
                    Der Strahl braucht die Gleichung <M>{'y = -0{,}5x + 2'}</M>. Er geht durch den Laser und durch <M>{'S(0 \\mid 2)'}</M>.
                  </p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Der neue Strahl muss durch zwei bekannte Punkte gehen. Welche sind das?</>,
                    <>
                      Er geht durch den Laser <M>{'(4 \\mid 0)'}</M> und durch die Kugel <M>{'S(0 \\mid 2)'}</M>. Berechne daraus die Steigung.
                    </>,
                    <>
                      <M>{'m = \\frac{2 - 0}{0 - 4}'}</M>. <M>S</M> liegt auf der y-Achse, dort liest du <M>t</M> ab.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Treffen sich die Strahlen überhaupt?">
            <McCard
              title="Übung 5"
              profi
              level="erweiterung"
              prompt={
                <>
                  <p>Für die letzte Show stellt ein Techniker die Laser neu ein.</p>
                  <p>
                    Strahl 1: <M>{'y = 0{,}5x + 2'}</M>, Strahl 2: <M>{'y = 0{,}5x - 1'}</M>. Wo muss die Spiegelkugel jetzt hängen?
                  </p>
                </>
              }
              options={[
                { text: <M>{'S(0 \\mid -1)'}</M>, feedback: 'Das ist nur der y-Achsenabschnitt von Strahl 2. Strahl 1 geht dort nicht durch.' },
                { text: <M>{'S(3 \\mid 3{,}5)'}</M>, feedback: 'Setze den Punkt in beide Gleichungen ein: Strahl 1 ergibt 3,5, Strahl 2 aber nur 0,5.' },
                {
                  text: 'Nirgends: Beide Strahlen haben dieselbe Steigung, sie verlaufen parallel.',
                  correct: true,
                  feedback: 'Gleichsetzen ergibt 0,5x + 2 = 0,5x − 1, also 2 = −1. Das stimmt nie: Die Strahlen sind parallel und treffen sich nicht.',
                },
                { text: <M>{'x = 0'}</M>, feedback: 'Beim Gleichsetzen fällt x ganz weg, und übrig bleibt 2 = −1. Das ist falsch, also gibt es keine Lösung.' },
              ]}
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Kugel-Treffer">
            <KugelTreffer />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt den Schnittpunkt zweier Geraden berechnen und im Sachzusammenhang deuten. In den Übungsaufgaben trainierst du das Gleichsetzen weiter, auch mit Brüchen
              und mit parallelen Geraden.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Schnittpunkt zweier Geraden <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell title="Schnittpunkt: Die Lasershow" width="wide" kompakt parent={{ to: '/lineare_funktionen/schnittpunkt', label: 'Schnittpunkt zweier Geraden' }}>
        <SeitenLernsituation
          ruhig
          punkte
          thema={THEMA}
          ziel={
            <>
              Du baust als Azubi in der Veranstaltungstechnik eine Lasershow auf. Du lernst, wie du den Schnittpunkt zweier Geraden berechnest, indem du die Terme gleichsetzt.
            </>
          }
          seiten={seiten}
        />
      </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Versuche am Laserpult aus Phase 2 */
function Rueckbezug({ versuche }: { versuche: Kugel[] }) {
  if (versuche.length === 0) return null
  const bester = versuche.reduce((a, b) => (abstand(b) < abstand(a) ? b : a))
  const d = Math.round(abstand(bester) * 100)
  return (
    <div className="ls-back">
      <p>
        <strong>Am Laserpult hattest du {versuche.length} Versuche.</strong> Dein bester lag bei <M>{`(${tx(bester.x, 2)} \\mid ${tx(bester.y, 2)})`}</M>
        {d === 0 ? ', ein Treffer!' : <>, etwa {d} cm neben dem Kreuzungspunkt.</>} Gerechnet weißt du es sicher: <M>{'S(1{,}6 \\mid 2{,}8)'}</M>. Treffen kann die Kugel nur, wer
        die Stelle findet, an der beide Strahlen gleich hoch sind. Genau das macht das Gleichsetzen.
      </p>
    </div>
  )
}
