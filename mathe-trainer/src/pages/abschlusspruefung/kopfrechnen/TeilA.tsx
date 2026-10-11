import { useEffect, useMemo, useState } from 'react'
import AufgabeKarte from './AufgabeKarte'
import { BLOCK_TITEL, type Block } from './typen'
import { teilAZiehen } from './pool'

// Prüfungsblock wie Teil A der Abschlussprüfung: Block ohne Wahlmöglichkeit (7 Punkte) und zwei von drei
// Wahlblöcken (je 4 Punkte), 25 Minuten. Ausgewertet wird erst beim Abgeben.

const WAHL: { id: Block; nr: number; titel: string }[] = [
  { id: 'trigo', nr: 1, titel: 'Trigonometrie' },
  { id: 'daten', nr: 2, titel: 'Daten und Zufall' },
  { id: 'raum', nr: 3, titel: 'Raum und Form' },
]
const DAUER = 25 * 60

const uhr = (s: number) => `${Math.floor(Math.max(s, 0) / 60)}:${String(Math.max(s, 0) % 60).padStart(2, '0')}`

export default function TeilA({ onPunkte }: { onPunkte?: (punkte: number, offen: number) => void }) {
  const [wahl, setWahl] = useState<Block[]>([])
  const [bloecke, setBloecke] = useState<ReturnType<typeof teilAZiehen> | null>(null)
  const [start, setStart] = useState(0)
  const [jetzt, setJetzt] = useState(Date.now())
  const [abgegeben, setAbgegeben] = useState(false)
  const [punkte, setPunkte] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!bloecke || abgegeben) return
    const t = window.setInterval(() => setJetzt(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [bloecke, abgegeben])

  const alle = useMemo(() => (bloecke ?? []).flatMap((b) => b.aufgaben), [bloecke])
  const summe = Object.values(punkte).reduce((s, p) => s + p, 0)
  const offen = alle.filter((a) => a.type === 'self' && punkte[a.id] === undefined).length

  useEffect(() => {
    if (abgegeben) onPunkte?.(summe, offen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summe, offen, abgegeben])

  const toggle = (b: Block) =>
    setWahl((w) => (w.includes(b) ? w.filter((x) => x !== b) : w.length < 2 ? [...w, b] : w))

  const starten = () => {
    setBloecke(teilAZiehen(WAHL.filter((w) => wahl.includes(w.id)).map((w) => w.id)))
    setStart(Date.now())
    setJetzt(Date.now())
    setAbgegeben(false)
    setPunkte({})
  }

  const neu = () => {
    setBloecke(null)
    setWahl([])
    setAbgegeben(false)
    setPunkte({})
  }

  if (!bloecke) {
    return (
      <div className="bk-panel bk-stack">
        <h2 className="bk-section-title" style={{ margin: 0 }}>Teil A (ohne Taschenrechner)</h2>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          Arbeitszeit 25 Minuten · 15 Punkte · Hilfsmittel: Merkhilfe. Der Block ohne Wahlmöglichkeit (7 Punkte) ist Pflicht,
          dazu wählst du <strong>zwei</strong> der drei Wahlblöcke (je 4 Punkte).
        </p>
        <div className="bk-seg" role="group" aria-label="Wahlblöcke wählen">
          {WAHL.map((w) => (
            <button key={w.id} type="button" className={`bk-seg-btn${wahl.includes(w.id) ? ' bk-seg-btn-on' : ''}`} aria-pressed={wahl.includes(w.id)} onClick={() => toggle(w.id)}>
              Wahlblock {w.nr} – {w.titel}
            </button>
          ))}
        </div>
        <div className="bk-actions">
          <button type="button" className="bk-btn bk-btn-primary" disabled={wahl.length !== 2} onClick={starten}>
            <i className="fa-solid fa-stopwatch" aria-hidden="true" /> Teil A starten
          </button>
          {wahl.length !== 2 && <span style={{ color: 'var(--ink-muted)' }}>Bitte genau zwei Wahlblöcke wählen.</span>}
        </div>
      </div>
    )
  }

  const rest = DAUER - Math.floor((jetzt - start) / 1000)

  return (
    <div className="bk-stack">
      <div className="bk-ka-bar">
        <span className={`bk-chip${rest <= 0 && !abgegeben ? ' bk-field-no' : ''}`}>
          <i className="fa-solid fa-stopwatch" aria-hidden="true" /> {abgegeben ? 'abgegeben' : rest > 0 ? `noch ${uhr(rest)} min` : 'Zeit abgelaufen'}
        </span>
        <span className="bk-chip">15 Punkte</span>
      </div>

      {bloecke.map((b) => {
        const wnr = WAHL.find((w) => w.id === b.block)?.nr
        return (
          <section key={b.block} className="bk-stack" aria-label={BLOCK_TITEL[b.block]}>
            <h2 className="bk-section-title" style={{ margin: '8px 0 0' }}>{wnr ? `Wahlblock ${wnr} – ${WAHL.find((w) => w.id === b.block)?.titel}` : BLOCK_TITEL[b.block]}</h2>
            {b.aufgaben.map((a, i) => (
              <AufgabeKarte
                key={a.id}
                aufgabe={a}
                nr={wnr ? `${wnr}.${i + 1}` : String(i + 1)}
                modus="pruefung"
                abgegeben={abgegeben}
                onPunkte={(id, p) => setPunkte((alt) => ({ ...alt, [id]: p }))}
              />
            ))}
          </section>
        )
      })}

      {!abgegeben ? (
        <div className="bk-actions">
          <button type="button" className="bk-btn bk-btn-primary" onClick={() => setAbgegeben(true)}>
            <i className="fa-solid fa-flag-checkered" aria-hidden="true" /> Teil A abgeben und auswerten
          </button>
        </div>
      ) : (
        <div className="bk-panel bk-stack" role="status">
          <h2 className="bk-section-title" style={{ margin: 0 }}>Ergebnis Teil A</h2>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{String(summe).replace('.', ',')} von 15 Punkten</p>
          {offen > 0 && <p style={{ margin: 0, color: 'var(--ink-muted)' }}>Noch {offen} {offen === 1 ? 'Aufgabe' : 'Aufgaben'} mit der Musterlösung selbst einschätzen („stimmt“ / „stimmt nicht“).</p>}
          <div className="bk-actions">
            <button type="button" className="bk-btn" onClick={neu}><i className="fa-solid fa-rotate" aria-hidden="true" /> Neuen Teil A zusammenstellen</button>
          </div>
        </div>
      )}
    </div>
  )
}
