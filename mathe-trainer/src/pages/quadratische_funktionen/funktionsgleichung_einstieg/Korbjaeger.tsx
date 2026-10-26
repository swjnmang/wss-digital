import { useEffect, useRef, useState } from 'react'
import { M, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import { useSpielPunkte } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { KORB_H, Spielfeld, bahnPunkte, hoehe, type Bahn } from './Spielfeld'

// Bonus-Spiel „Korbjäger“ am Ende der Lernsituation „Trifft der Korbwurf?“: Jede Runde ein neuer Freiwurf aus einer anderen
// Entfernung. Bekannt sind ein Wert (Krümmung a oder Abwurfhöhe c), ein Messpunkt P und die Korbmitte K. Die SuS stellen die Bahn auf
// (oder machen mit den vier Angeboten die Punktprobe) und wählen die richtige. Erst beim Wurf wird die Bahn gezeichnet.
// Falsche Angebote sind typische Fehler: Vorzeichen von a oder b verdreht, b und c vertauscht. Vier Runden, jeder Treffer bringt eine Münze.
// Bedienung: Bahn antippen oder Pfeiltasten, dann „Werfen!“ bzw. Enter.

type Fehler = 'richtig' | 'vorzeichenA' | 'vorzeichenB' | 'vertauscht'
type Angebot = Bahn & { art: Fehler }
type Runde = { bekannt: 'a' | 'c'; richtig: Bahn; p: { x: number; y: number }; korb: number; angebote: Angebot[] }
type Phase = 'start' | 'wahl' | 'flug' | 'ergebnis' | 'ende'

const RUNDEN = 4 // 4 Münzen à 2 Punkte: das Spiel bringt nicht mehr als die größte Übungsaufgabe (8)
const FLUG_DAUER = 2 // Sekunden für den ganzen Flug

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
const zahl = (v: number) => fmt(v, 2).replace('-', '−')
const rund = (v: number) => Math.round(v * 100) / 100

// Alle Würfe mit glatten Zahlen (b und c auf 5 cm), die genau durch die Korbmitte gehen und vor dem Korb schon wieder fallen
const WUERFE: { bahn: Bahn; korb: number }[] = (() => {
  const liste: { bahn: Bahn; korb: number }[] = []
  for (const a of [-0.3, -0.4, -0.5, -0.6])
    for (let k = 37; k <= 49; k++)
      for (const korb of [3.5, 4, 4.5]) {
        const c = k / 20
        const b = (KORB_H - c - a * korb * korb) / korb
        if (Math.abs(Math.round(b * 20) - b * 20) > 1e-6) continue
        const bahn = { a, b: rund(b), c: rund(c) }
        const xs = -bahn.b / (2 * a)
        if (xs >= korb - 0.4 || hoehe(bahn, xs) > 5.3) continue
        liste.push({ bahn, korb })
      }
  return liste
})()

function neueRunde(): Runde {
  const { bahn, korb } = pick(WUERFE)
  const bekannt = pick(['a', 'c'] as const)
  const angebote: Angebot[] = mischen([
    { ...bahn, art: 'richtig' },
    { ...bahn, a: -bahn.a, art: 'vorzeichenA' },
    { ...bahn, b: -bahn.b, art: 'vorzeichenB' },
    { a: bahn.a, b: bahn.c, c: bahn.b, art: 'vertauscht' },
  ])
  return { bekannt, richtig: bahn, p: { x: 1, y: rund(hoehe(bahn, 1)) }, korb, angebote }
}

/** Bahn als TeX, z. B. „y = −0,5x² + 2,25x + 2,05“ */
const gleichung = (k: Bahn) => `y = ${tx(k.a)}x^2 ${k.b < 0 ? '-' : '+'} ${tx(Math.abs(k.b))}x + ${tx(k.c)}`

const TIPP: Record<Fehler, string> = {
  richtig: 'Korb! Die Bahn geht durch P und genau durch die Korbmitte.',
  vorzeichenA: 'Hier hat a das falsche Vorzeichen. Mit a > 0 ist die Parabel nach oben geöffnet, der Ball fliegt davon.',
  vorzeichenB: 'Hier hat b das falsche Vorzeichen. Achte beim Subtrahieren auf jedes Minus.',
  vertauscht: 'Hier sind b und c vertauscht. b steht vor x, c ist die Abwurfhöhe bei x = 0.',
}

export default function Korbjaeger() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(neueRunde)
  const [wahl, setWahl] = useState<number | null>(null)
  const [p, setP] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()

  // Wurf: Der Ball fliegt die gewählte Bahn entlang, danach Auswertung
  useEffect(() => {
    if (phase !== 'flug') return
    let start: number | undefined
    const tick = (t: number) => {
      start ??= t
      const neu = Math.min(1, (t - start) / 1000 / FLUG_DAUER)
      setP(neu)
      if (neu < 1) frame.current = requestAnimationFrame(tick)
      else setPhase('ergebnis')
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [phase])

  const werfen = () => {
    if (phase !== 'wahl' || wahl === null) return
    if (runde.angebote[wahl].art === 'richtig') setMuenzen((m) => m + 1)
    setP(0)
    setPhase('flug')
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
  // Pfeiltasten wählen eine Bahn, Enter wirft (nur während der Wahl, nicht in Eingabefeldern)
  const werfenRef = useRef(werfen)
  werfenRef.current = werfen
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
        werfenRef.current()
      }
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [phase])

  const gewaehlt = wahl === null ? null : runde.angebote[wahl]
  // Ein Treffer endet in der Korbmitte, ein Fehlwurf fliegt weiter bis zum Boden
  const flug = gewaehlt && (phase === 'flug' || phase === 'ergebnis') ? bahnPunkte(gewaehlt, gewaehlt.art === 'richtig' ? runde.korb : undefined) : []
  const n = Math.max(1, Math.round(flug.length * p))
  const kopf = flug[n - 1]
  const bis = kopf?.x
  const bekanntTex = runde.bekannt === 'a' ? `a = ${tx(runde.richtig.a)}` : `c = ${tx(runde.richtig.c)}`

  return (
    <div className="kw-spiel" data-no-autocheck>
      <div className="kw-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : phase === 'start' ? 'Korbjäger' : `Wurf ${nr + 1} von ${RUNDEN}`}</span>
        <span className="kw-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' kw-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Jede Runde wirft jemand aus einer anderen Entfernung. Du kennst einen Wert der Bahn, einen Messpunkt P und die Korbmitte K. Stelle die Bahn auf (oder prüfe die Angebote
          mit P und K), wähle die richtige Gleichung und wirf. Für jeden Treffer bekommst du eine Münze. Lass dir Zeit, es gibt keine Uhr.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <>
          <p className="kw-spiel-frage">
            Bekannt: <M>{bekanntTex}</M>{runde.bekannt === 'c' ? ' (Abwurfhöhe)' : ' (Krümmung)'}, Messpunkt <M>{`P(1 \\mid ${tx(runde.p.y)})`}</M>, Korbmitte{' '}
            <M>{`K(${tx(runde.korb)} \\mid 3{,}05)`}</M>. Welche Bahn trifft?
          </p>
          <div className="bk-graph kw-bild">
            <Spielfeld
              korb={runde.korb}
              punkte={[
                { ...runde.p, text: `P(1 | ${zahl(runde.p.y)})` },
                { x: runde.korb, y: KORB_H, text: 'K', unten: true },
              ]}
              bahnen={gewaehlt && bis !== undefined ? [{ ...gewaehlt, art: phase === 'ergebnis' && gewaehlt.art === 'richtig' ? 'treffer' : 'aktuell', bis }] : []}
              ball={kopf ? { x: kopf.x, y: Math.max(0.13, Math.min(5.5, kopf.y)) } : undefined}
              label={`Spielfeld mit dem Korb bei x = ${zahl(runde.korb)} in 3,05 m Höhe und dem Messpunkt P(1 | ${zahl(runde.p.y)}).`}
            />
          </div>
        </>
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
          <div className="kw-wahl" role="radiogroup" aria-label="Welche Bahn geht durch P und die Korbmitte?">
            {runde.angebote.map((b, i) => (
              <button key={i} type="button" role="radio" aria-checked={wahl === i} className={`bk-btn${wahl === i ? ' bk-btn-primary' : ''}`} onClick={() => setWahl(i)}>
                <M>{gleichung(b)}</M>
              </button>
            ))}
          </div>
          <div className="bk-actions kw-steuer">
            <button type="button" className="bk-btn bk-btn-primary" onClick={werfen} disabled={wahl === null}>
              <i className="fa-solid fa-basketball" aria-hidden="true" /> Werfen!
            </button>
            <span className="sl-hinweis">{wahl === null ? 'Tippe eine Bahn an.' : 'Bahn gewählt. Bereit?'}</span>
          </div>
        </>
      )}
      {phase === 'ergebnis' && gewaehlt && (
        <>
          <div className={`bk-feedback lp-feedback ${gewaehlt.art === 'richtig' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${gewaehlt.art === 'richtig' ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {gewaehlt.art === 'richtig' ? 'Münze eingesammelt! ' : 'Daneben. '}
              {TIPP[gewaehlt.art]}{' '}
              {gewaehlt.art !== 'richtig' && (
                <>
                  Probe mit K: <M>{`x = ${tx(runde.korb)}{:}\\; y = ${tx(rund(hoehe(gewaehlt, runde.korb)))}`}</M> statt <M>{'3{,}05'}</M>. Richtig ist <M>{gleichung(runde.richtig)}</M>.
                </>
              )}
            </span>
          </div>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
              {nr + 1 >= RUNDEN ? 'Zum Ergebnis' : 'Nächster Wurf'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
      {phase === 'ende' && (
        <>
          <p className="kw-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-basketball'}`} aria-hidden="true" /> {muenzen} von {RUNDEN} Würfen waren Treffer.{' '}
            {muenzen === RUNDEN ? 'Perfekt, die ganze Halle jubelt!' : muenzen >= 3 ? 'Stark, fast alles getroffen!' : 'Probier es noch einmal, du schaffst mehr!'}
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
