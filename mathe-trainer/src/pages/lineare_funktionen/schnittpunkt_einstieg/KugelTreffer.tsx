import { useEffect, useRef, useState } from 'react'
import { M, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { tx } from '../lernsituation_kit/kit'
import { useSpielPunkte } from '../lernsituation_kit/punkte'

// Bonus-Spiel „Kugel-Treffer“ am Ende der Lernsituation „Die Lasershow“: Gegeben sind die Gleichungen zweier Laserstrahlen.
// Vier Spiegelkugeln hängen im Raum, eine davon im Schnittpunkt. Die SuS rechnen den Schnittpunkt aus, wählen die Kugel
// und schalten die Laser an. Die Strahlen werden erst dann gezeichnet, damit man den Schnittpunkt nicht ablesen kann.
// Die falschen Kugeln sind typische Fehler: x und y vertauscht, Vorzeichenfehler beim Umstellen, y-Achsenabschnitt einer Geraden.
// Vier Runden, jede getroffene Kugel bringt eine Münze (je 2 Punkte, zusammen höchstens 8 wie die beste Übungsaufgabe). Bedienung: Kugel antippen oder Pfeiltasten, dann „Laser an!“ bzw. Enter.

type Fehler = 'richtig' | 'vertauscht' | 'vorzeichen' | 'achse1' | 'achse2'
type Ziel = { x: number; y: number; art: Fehler }
type Strahl = { m: number; t: number }
type Runde = { a: Strahl; b: Strahl; ziele: Ziel[] }
type Phase = 'start' | 'wahl' | 'laser' | 'ergebnis' | 'ende'

const RUNDEN = 4
const LASER_DAUER = 1.4 // Sekunden, bis die Strahlen ganz gezeichnet sind

const G = { w: 760, h: 340, l: 40, r: 16, t: 16, b: 40, xMin: -5, xMax: 5, yMax: 5 }
const gx = (x: number) => G.l + ((x - G.xMin) / (G.xMax - G.xMin)) * (G.w - G.l - G.r)
const gy = (y: number) => G.h - G.b - (y / G.yMax) * (G.h - G.t - G.b)

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
/** Zahl als Text mit Komma und echtem Minus, z. B. „−1,5“ */
const zahl = (v: number) => fmt(v).replace('-', '−')
const imRaum = (z: { x: number; y: number }) => z.x >= -4.5 && z.x <= 4.5 && z.y >= 0.5 && z.y <= 4.5

function neueRunde(): Runde {
  for (;;) {
    const xs = pick([-3, -2, -1, 1, 2, 3])
    const ys = pick([1, 2, 3, 4])
    const ma = pick([0.5, 1, 2])
    const mb = pick([-0.5, -1, -2])
    const a = { m: ma, t: ys - ma * xs }
    const b = { m: mb, t: ys - mb * xs }
    const kandidaten: Ziel[] = [
      { x: ys, y: xs, art: 'vertauscht' },
      { x: -xs, y: ma * -xs + a.t, art: 'vorzeichen' },
      { x: 0, y: a.t, art: 'achse1' },
      { x: 0, y: b.t, art: 'achse2' },
    ]
    const ziele: Ziel[] = [{ x: xs, y: ys, art: 'richtig' }]
    for (const k of mischen(kandidaten)) {
      if (ziele.length === 4) break
      if (imRaum(k) && ziele.every((z) => Math.hypot(z.x - k.x, z.y - k.y) > 0.9)) ziele.push(k)
    }
    if (ziele.length === 4) return { a, b, ziele: mischen(ziele) }
  }
}

const gleichung = (s: Strahl) => {
  const m = s.m === 1 ? '' : s.m === -1 ? '-' : tx(s.m)
  const t = s.t === 0 ? '' : s.t > 0 ? ` + ${tx(s.t)}` : ` - ${tx(-s.t)}`
  return `y = ${m}x${t}`
}

const ERKLAERUNG: Record<Fehler, string> = {
  richtig: 'Treffer! Beide Strahlen gehen genau durch die Kugel.',
  vertauscht: 'Hier sind x und y vertauscht. Im Punkt steht zuerst der x-Wert.',
  vorzeichen: 'Diese Kugel liegt nur auf Strahl 1, und zwar bei −x statt x. Beim Umstellen ist ein Vorzeichen verloren gegangen.',
  achse1: 'Das ist der y-Achsenabschnitt von Strahl 1. Dort ist Strahl 2 aber nicht.',
  achse2: 'Das ist der y-Achsenabschnitt von Strahl 2. Dort ist Strahl 1 aber nicht.',
}

/** Strahl vom Boden (bzw. Bildrand) nach oben, gekürzt auf den Anteil p (Animation beim Einschalten) */
function strahlLinie(s: Strahl, p: number) {
  const x0 = Math.max(G.xMin, Math.min(G.xMax, -s.t / s.m))
  const xEnde = Math.max(G.xMin, Math.min(G.xMax, (G.yMax - s.t) / s.m))
  const von = { x: x0, y: s.m * x0 + s.t }
  const bis = { x: xEnde, y: s.m * xEnde + s.t }
  return { x1: gx(von.x), y1: gy(von.y), x2: gx(von.x + (bis.x - von.x) * p), y2: gy(von.y + (bis.y - von.y) * p) }
}

export default function KugelTreffer() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(neueRunde)
  const [wahl, setWahl] = useState<number | null>(null)
  const [p, setP] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()

  // Laser einschalten: Strahlen wachsen vom Boden nach oben, danach Auswertung
  useEffect(() => {
    if (phase !== 'laser') return
    let start: number | undefined
    const tick = (t: number) => {
      start ??= t
      const neu = Math.min(1, (t - start) / 1000 / LASER_DAUER)
      setP(neu)
      if (neu < 1) frame.current = requestAnimationFrame(tick)
      else setPhase('ergebnis')
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [phase])

  const feuern = () => {
    if (phase !== 'wahl' || wahl === null) return
    if (runde.ziele[wahl].art === 'richtig') setMuenzen((m) => m + 1)
    setP(0)
    setPhase('laser')
  }
  const weiter = () => {
    if (nr + 1 >= RUNDEN) {
      // Ergebnis an die Punkte melden (nur das beste Ergebnis zählt)
      meldeSpiel(muenzen, RUNDEN)
      return setPhase('ende')
    }
    setNr(nr + 1)
    setRunde(neueRunde())
    setWahl(null)
    setP(0)
    setPhase('wahl')
  }
  const nochmal = () => {
    setNr(0)
    setMuenzen(0)
    setRunde(neueRunde())
    setWahl(null)
    setP(0)
    setPhase('start')
  }
  // Pfeiltasten wählen eine Kugel, Enter schaltet die Laser an (nur während der Wahl, nicht in Eingabefeldern)
  const feuernRef = useRef(feuern)
  feuernRef.current = feuern
  useEffect(() => {
    if (phase !== 'wahl') return
    const taste = (e: globalThis.KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setWahl((w) => (w === null ? 0 : (w + 1) % 4))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setWahl((w) => (w === null ? 3 : (w + 3) % 4))
      } else if (e.key === 'Enter' && !(e.target as HTMLElement | null)?.closest('button')) {
        e.preventDefault()
        feuernRef.current()
      }
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [phase])

  const zeigeStrahlen = phase === 'laser' || phase === 'ergebnis'
  const gewaehlt = wahl === null ? null : runde.ziele[wahl]
  const richtig = runde.ziele.find((z) => z.art === 'richtig')!

  return (
    <div className="lz-spiel" data-no-autocheck>
      <div className="lz-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : phase === 'start' ? 'Kugel-Treffer' : `Runde ${nr + 1} von ${RUNDEN}`}</span>
        <span className="lz-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' lz-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Vier Spiegelkugeln hängen im Raum, aber nur eine im Kreuzungspunkt der beiden Laser. Berechne den Schnittpunkt in deinem Heft, tippe die richtige Kugel
          oder ihren Punkt an und schalte die Laser an. Für jeden Treffer bekommst du eine Münze. Lass dir Zeit, es gibt keine Uhr.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <p className="lz-spiel-frage">
          Strahl 1: <M>{gleichung(runde.a)}</M>, Strahl 2: <M>{gleichung(runde.b)}</M>. In welcher Kugel treffen sie sich?
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label="Partyraum mit vier Spiegelkugeln an verschiedenen Punkten. Unter jeder Kugel stehen ihre Koordinaten." className="lz-spiel-bild">
          <rect x="0" y="0" width={G.w} height={G.h} rx="12" fill="var(--primary-soft)" />
          {Array.from({ length: G.xMax - G.xMin + 1 }, (_, i) => G.xMin + i).map((v) => (
            <g key={`x${v}`}>
              <line x1={gx(v)} x2={gx(v)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--surface)" strokeWidth="1.5" />
              <text x={gx(v)} y={gy(0) + 26} textAnchor="middle" fontSize="17" fill="var(--ink-muted)">
                {v}
              </text>
            </g>
          ))}
          {[1, 2, 3, 4, 5].map((v) => (
            <g key={`y${v}`}>
              <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--surface)" strokeWidth="1.5" />
              <text x={gx(0) - 7} y={gy(v) + 6} textAnchor="end" fontSize="17" fill="var(--ink-muted)">
                {v}
              </text>
            </g>
          ))}
          <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="3" />
          <line x1={gx(0)} x2={gx(0)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
          {zeigeStrahlen && (
            <g>
              <line {...strahlLinie(runde.a, p)} stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" />
              <line {...strahlLinie(runde.b, p)} stroke="var(--ink)" strokeWidth="4" strokeDasharray="12 6" strokeLinecap="round" />
            </g>
          )}
          {runde.ziele.map((z, i) => {
            const an = wahl === i
            const aus = phase === 'ergebnis'
            const fill = aus && z.art === 'richtig' ? 'var(--correct)' : aus && an ? 'var(--wrong)' : an ? 'var(--highlight)' : 'var(--surface)'
            return (
              <g key={i} onClick={() => phase === 'wahl' && setWahl(i)} style={{ cursor: phase === 'wahl' ? 'pointer' : 'default' }}>
                <line x1={gx(z.x)} x2={gx(z.x)} y1={G.t} y2={gy(z.y) - 16} stroke="var(--ink)" strokeWidth="1.5" />
                {/* große, unsichtbare Tippfläche (mindestens 44 px) */}
                <circle cx={gx(z.x)} cy={gy(z.y)} r="28" fill="transparent" />
                <circle cx={gx(z.x)} cy={gy(z.y)} r={an ? 17 : 14} fill={fill} stroke="var(--ink)" strokeWidth={an ? 3 : 2} />
                <text x={gx(z.x) + 22} y={gy(z.y) - 12} fontSize="17" fontWeight="700" fill="var(--ink)" pointerEvents="none">
                  ({zahl(z.x)} | {zahl(z.y)})
                </text>
              </g>
            )
          })}
        </svg>
      )}
      {phase === 'start' && (
        <div className="bk-actions">
          <button type="button" className="bk-btn bk-btn-primary" onClick={() => setPhase('wahl')}>
            <i className="fa-solid fa-play" aria-hidden="true" /> Spiel starten
          </button>
        </div>
      )}
      {phase === 'wahl' && (
        <>
          <div className="lz-wahl" role="radiogroup" aria-label="Welche Kugel hängt im Schnittpunkt?">
            {runde.ziele.map((z, i) => (
              <button key={i} type="button" role="radio" aria-checked={wahl === i} className={`bk-btn${wahl === i ? ' bk-btn-primary' : ''}`} onClick={() => setWahl(i)}>
                ({zahl(z.x)} | {zahl(z.y)})
              </button>
            ))}
          </div>
          <div className="bk-actions lz-steuer">
            <button type="button" className="bk-btn bk-btn-primary" onClick={feuern} disabled={wahl === null}>
              <i className="fa-solid fa-bolt" aria-hidden="true" /> Laser an!
            </button>
            <span className="sl-hinweis">{wahl === null ? 'Tippe eine Kugel oder einen Punkt an.' : `Gewählt: (${zahl(runde.ziele[wahl].x)} | ${zahl(runde.ziele[wahl].y)})`}</span>
          </div>
        </>
      )}
      {phase === 'ergebnis' && gewaehlt && (
        <>
          <div className={`bk-feedback lp-feedback ${gewaehlt.art === 'richtig' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${gewaehlt.art === 'richtig' ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {gewaehlt.art === 'richtig' ? 'Münze eingesammelt! ' : 'Daneben. '}
              {ERKLAERUNG[gewaehlt.art]} {gewaehlt.art !== 'richtig' && <>Richtig ist <M>{`S(${tx(richtig.x)} \\mid ${tx(richtig.y)})`}</M>.</>}
            </span>
          </div>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
              {nr + 1 >= RUNDEN ? 'Zum Ergebnis' : 'Nächste Runde'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
      {phase === 'ende' && (
        <>
          <p className="lz-spiel-ende">
            <i className={`fa-solid ${muenzen >= RUNDEN - 1 ? 'fa-trophy' : 'fa-compact-disc'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN} Kugeln getroffen.{' '}
            {muenzen === RUNDEN ? 'Perfekt, die Lasershow kann starten!' : muenzen >= RUNDEN - 1 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
          </p>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={nochmal}>
              <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
            </button>
          </div>
        </>
      )}
    </div>
  )
}
