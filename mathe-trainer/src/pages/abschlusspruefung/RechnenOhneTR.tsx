import { useMemo, useState } from 'react'
import AufgabeKarte from './kopfrechnen/AufgabeKarte'
import TeilA from './kopfrechnen/TeilA'
import { POOL } from './kopfrechnen/pool'
import { mischen } from './kopfrechnen/pruefen'
import { THEMEN, type Thema } from './kopfrechnen/typen'
import { PruefungKopf } from './PruefungKopf'

// Rechnen ohne Taschenrechner: Üben (einzelne Aufgaben, nach Themen filterbar) oder Prüfungsblock wie Teil A.

export default function RechnenOhneTR() {
  const [modus, setModus] = useState<'ueben' | 'teilA'>('ueben')
  const [themen, setThemen] = useState<Thema[]>([])
  const [stapel, setStapel] = useState(() => mischen(POOL))
  const [pos, setPos] = useState(0)
  const [stats, setStats] = useState({ geprueft: 0, richtig: 0 })

  const gefiltert = useMemo(() => stapel.filter((a) => themen.length === 0 || themen.includes(a.thema)), [stapel, themen])
  const aufgabe = gefiltert[pos % Math.max(gefiltert.length, 1)]

  const toggleThema = (t: Thema) => {
    setThemen((alt) => (alt.includes(t) ? alt.filter((x) => x !== t) : [...alt, t]))
    setPos(0)
  }

  const weiter = () => {
    if (pos + 1 >= gefiltert.length) {
      setStapel(mischen(POOL))
      setPos(0)
    } else setPos(pos + 1)
  }

  return (
    <div className="bk-page bk-task bk-w-narrow">
      <PruefungKopf title="Rechnen ohne Taschenrechner" current sub={`${POOL.length} Aufgaben im Stil von Teil A der Abschlussprüfung – mit Merkhilfe, ohne Taschenrechner.`} />
      <div className="bk-task-body bk-stack">
        <div className="bk-seg" role="tablist" aria-label="Modus">
          <button type="button" role="tab" aria-selected={modus === 'ueben'} className={`bk-seg-btn${modus === 'ueben' ? ' bk-seg-btn-on' : ''}`} onClick={() => setModus('ueben')}>
            <i className="fa-solid fa-dumbbell" aria-hidden="true" /> Üben
          </button>
          <button type="button" role="tab" aria-selected={modus === 'teilA'} className={`bk-seg-btn${modus === 'teilA' ? ' bk-seg-btn-on' : ''}`} onClick={() => setModus('teilA')}>
            <i className="fa-solid fa-stopwatch" aria-hidden="true" /> Prüfungsblock (Teil A)
          </button>
        </div>

        {modus === 'ueben' ? (
          <>
            <div className="bk-stack" style={{ gap: 8 }}>
              <span className="bk-label">Themen (keine Auswahl = alle)</span>
              <div className="bk-seg" role="group" aria-label="Themen filtern">
                {THEMEN.map((t) => (
                  <button key={t.id} type="button" className={`bk-seg-btn${themen.includes(t.id) ? ' bk-seg-btn-on' : ''}`} aria-pressed={themen.includes(t.id)} onClick={() => toggleThema(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bk-ka-bar">
              <span className="bk-chip">Aufgabe {Math.min(pos + 1, gefiltert.length)} von {gefiltert.length}</span>
              <span className="bk-chip"><i className="fa-solid fa-check" aria-hidden="true" /> {stats.richtig} / {stats.geprueft} richtig</span>
            </div>

            {aufgabe && (
              <AufgabeKarte
                key={`${aufgabe.id}-${pos}`}
                aufgabe={aufgabe}
                nr={String(pos + 1)}
                modus="ueben"
                onPunkte={(_, __, richtig) => setStats((s) => ({ geprueft: s.geprueft + 1, richtig: s.richtig + (richtig ? 1 : 0) }))}
              />
            )}

            <div className="bk-actions">
              <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
                Nächste Aufgabe <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <TeilA />
        )}
      </div>
    </div>
  )
}
