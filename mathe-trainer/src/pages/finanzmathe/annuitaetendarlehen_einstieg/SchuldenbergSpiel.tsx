import { useEffect, useState, type ReactNode } from 'react'
import { M } from '../../daten_und_zufall/lernpfad/kit'
import { useSpielPunkte } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { euro } from '../zins_kit/zins_kit'

// Bonus-Spiel „Schuldenberg“ am Ende der Lernsituation „Die Solaranlage“: In jeder Runde gibt es ein neues Annuitätendarlehen und eine
// gesuchte Größe (A, T₁, Z₁, Schuld am Anfang des 2. Jahres, T₂ oder Z₂). Vier Münzen tragen Beträge; nur eine ist richtig, die anderen
// sind typische Fehler (T₁-Formel für T₂, ganze Annuität von der Schuld abgezogen, wie beim Ratendarlehen gerechnet …). Jede richtige
// Münze trägt einen Block vom Schuldenberg ab. 4 Runden, je Münze 2 Punkte (useSpielPunkte, nur das beste Ergebnis zählt).
// Bedienung: Münzen antippen (mindestens 48 px) oder Tasten 1 bis 4. Keine Zeitwertung.

const RUNDEN = 4
type Art = 'A' | 'T1' | 'Z1' | 'K1' | 'T2' | 'Z2'
type Option = { wert: number; richtig: boolean; grund: ReactNode }
type Aufgabe = { k0: number; p: number; n: number; art: Art; a: number; t1: number; optionen: Option[] }

const DARLEHEN: [number, number, number][] = [
  [20000, 4, 10],
  [12000, 3, 8],
  [30000, 5, 15],
  [16000, 4.5, 10],
  [25000, 3.5, 12],
  [9000, 6, 6],
  [40000, 4, 20],
]
const r2 = (v: number) => Math.round(v * 100) / 100
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]

const FRAGE: Record<Art, string> = {
  A: 'Wie hoch ist die Annuität A?',
  T1: 'Wie hoch ist die Tilgung im 1. Jahr?',
  Z1: 'Wie hoch sind die Zinsen im 1. Jahr?',
  K1: 'Wie hoch ist die Schuld am Anfang des 2. Jahres?',
  T2: 'Wie hoch ist die Tilgung im 2. Jahr?',
  Z2: 'Wie hoch sind die Zinsen im 2. Jahr?',
}

function neueAufgabe(art: Art): Aufgabe {
  for (;;) {
    const [k0, p, n] = pick(DARLEHEN)
    const q = 1 + p / 100
    const a = r2((k0 * q ** n * (q - 1)) / (q ** n - 1))
    const t1 = r2((k0 * (q - 1)) / (q ** n - 1))
    const z1 = r2(k0 * (q - 1))
    const k1 = r2(k0 - t1)
    const t2 = r2(t1 * q)
    const z2 = r2(k1 * (q - 1))
    const falsch: Record<Art, [number, ReactNode][]> = {
      A: [
        [t1, 'Das ist nur die Tilgung im 1. Jahr. Die Annuität enthält auch die Zinsen.'],
        [r2(k0 / n + z1), 'So rechnet man beim Ratendarlehen im 1. Jahr. Beim Annuitätendarlehen gilt die Formel für A.'],
        [z1, 'Das sind nur die Zinsen im 1. Jahr.'],
      ],
      T1: [
        [a, 'Das ist die ganze Annuität. Die Tilgung ist nur der Teil ohne Zinsen.'],
        [z1, 'Das sind die Zinsen im 1. Jahr.'],
        [r2(k0 / n), <><M>{'K_0 : n'}</M> ist die Tilgung beim Ratendarlehen.</>],
      ],
      Z1: [
        [r2(a * (q - 1)), 'Die Zinsen werden für die Schuld am Jahresanfang berechnet, nicht für die Annuität.'],
        [r2(t1 * (q - 1)), 'Die Zinsen gehören zur ganzen Schuld, nicht nur zur Tilgung.'],
        [r2(a - t2), <>Hier wurde die Tilgung des 2. Jahres abgezogen. Im 1. Jahr gilt <M>{'Z_1 = A - T_1'}</M>.</>],
      ],
      K1: [
        [r2(k0 - a), 'Von der Schuld wird nur die Tilgung abgezogen, nicht die ganze Annuität.'],
        [r2(k0 - z1), 'Die Zinsen verringern die Schuld nicht. Abgezogen wird die Tilgung.'],
        [r2(k0 + t1), 'Die Tilgung wird abgezogen, nicht dazugezählt.'],
      ],
      T2: [
        [r2((k1 * (q - 1)) / (q ** n - 1)), <>Das ist die Formel für <M>{'T_1'}</M> mit der neuen Schuld. Ab dem 2. Jahr gilt <M>{'T_2 = T_1 \\cdot q'}</M>.</>],
        [t1, <>Die Tilgung bleibt nicht gleich. Sie wächst jedes Jahr mit dem Faktor <M>q</M>.</>],
        [r2(t1 * q * q), <>Das ist schon die Tilgung im 3. Jahr: <M>{'T_3 = T_1 \\cdot q^2'}</M>.</>],
      ],
      Z2: [
        [z1, 'Das sind die Zinsen im 1. Jahr. Im 2. Jahr ist die Schuld kleiner.'],
        [r2((k0 - a) * (q - 1)), 'Hier wurde die ganze Annuität von der Schuld abgezogen. Abgezogen wird nur die Tilgung.'],
        [r2(a - t1 * q * q), <>Hier wurde die Tilgung des 3. Jahres abgezogen. Im 2. Jahr gilt <M>{'Z_2 = A - T_2'}</M>.</>],
      ],
    }
    const richtig: Record<Art, number> = { A: a, T1: t1, Z1: z1, K1: k1, T2: t2, Z2: z2 }
    const optionen: Option[] = [
      { wert: richtig[art], richtig: true, grund: 'Richtig gerechnet!' },
      ...falsch[art].map(([wert, grund]) => ({ wert, richtig: false, grund })),
    ]
    // Alle Beträge deutlich verschieden, sonst neues Darlehen
    const werte = optionen.map((o) => Math.round(o.wert))
    if (new Set(werte).size < 4 || optionen.some((o) => o.wert <= 0)) continue
    optionen.sort(() => Math.random() - 0.5)
    // Die erste Münze ist nie die richtige (Regel für Auswahlen)
    if (optionen[0].richtig) {
      const j = 1 + Math.floor(Math.random() * 3)
      ;[optionen[0], optionen[j]] = [optionen[j], optionen[0]]
    }
    return { k0, p, n, art, a, t1, optionen }
  }
}

/** Reihenfolge der Fragen: jede Runde eine andere Größe */
const neueRunden = (): Aufgabe[] => {
  const arten: Art[] = ['A', 'T1', 'Z1', 'K1', 'T2', 'Z2'].sort(() => Math.random() - 0.5) as Art[]
  return arten.slice(0, RUNDEN).map(neueAufgabe)
}

/** Schuldenberg: vier Blöcke Schuld neben dem Haus mit Solaranlage; jeder richtige Treffer trägt einen ab */
function Berg({ abgetragen }: { abgetragen: number }) {
  return (
    <svg viewBox="0 0 720 230" className="sa-spiel-bild" role="img" aria-label={`Schuldenberg: noch ${RUNDEN - abgetragen} von ${RUNDEN} Blöcken Schuld übrig.`}>
      <line x1="20" x2="700" y1="210" y2="210" stroke="var(--ink)" strokeWidth="2" />
      {/* Haus mit Solaranlage */}
      <path d="M470 210 V120 L560 60 L650 120 V210 Z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M572 70 L636 112 L616 124 L552 82 Z" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2" />
      <rect x="500" y="150" width="40" height="34" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="580" y="160" width="36" height="50" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="660" cy="40" r="18" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      {/* Blöcke des Schuldenbergs, der oberste zuerst weg */}
      {Array.from({ length: RUNDEN }, (_, i) => {
        const weg = i >= RUNDEN - abgetragen
        const w = 300 - i * 56
        const x = 60 + (300 - w) / 2
        const y = 210 - (i + 1) * 44
        return (
          <g key={i} opacity={weg ? 0.15 : 1}>
            <rect x={x} y={y} width={w} height="40" rx="4" fill={weg ? 'none' : 'var(--primary)'} stroke="var(--primary)" strokeWidth="2" strokeDasharray={weg ? '6 5' : undefined} />
            {!weg && (
              <text x={x + w / 2} y={y + 27} textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">
                Schuld
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function SchuldenbergSpiel() {
  const [runden, setRunden] = useState<Aufgabe[]>(neueRunden)
  const [nr, setNr] = useState(0)
  const [wahl, setWahl] = useState<number | null>(null)
  const [muenzen, setMuenzen] = useState(0)
  const [ende, setEnde] = useState(false)
  const melde = useSpielPunkte()
  const aufgabe = runden[nr]

  const waehle = (i: number) => {
    if (wahl !== null || ende) return
    setWahl(i)
    if (aufgabe.optionen[i].richtig) setMuenzen((m) => m + 1)
  }
  const weiter = () => {
    if (nr + 1 >= RUNDEN) {
      setEnde(true)
      melde(muenzen, RUNDEN)
      return
    }
    setNr(nr + 1)
    setWahl(null)
  }
  const nochmal = () => {
    setRunden(neueRunden())
    setNr(0)
    setWahl(null)
    setMuenzen(0)
    setEnde(false)
  }

  useEffect(() => {
    const taste = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      const z = Number(e.key)
      if (z >= 1 && z <= 4) waehle(z - 1)
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  })

  return (
    <div className="sa-spiel" data-no-autocheck>
      <div className="sa-spiel-kopf">
        <span>{ende ? 'Geschafft!' : `Runde ${nr + 1} von ${RUNDEN}`}</span>
        <span className="sa-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' sa-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      <Berg abgetragen={muenzen} />
      {ende ? (
        <>
          <p className="sa-spiel-ende">
            <i className="fa-solid fa-trophy" aria-hidden="true" />
            {muenzen === RUNDEN
              ? 'Schuldenfrei! Alle Münzen richtig, du beherrschst den Tilgungsplan.'
              : muenzen >= RUNDEN - 1
                ? `Stark: ${muenzen} von ${RUNDEN} Münzen. Fast der ganze Berg ist weg.`
                : `${muenzen} von ${RUNDEN} Münzen. Schau dir die Erklärungen noch einmal an und versuche es erneut.`}
          </p>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={nochmal}>
              <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="sa-spiel-frage">
            Darlehen <strong>{euro(aufgabe.k0)}</strong>, <M>{`p = ${String(aufgabe.p).replace('.', '{,}')}\\,\\%`}</M>, Laufzeit <strong>{aufgabe.n} Jahre</strong>
            {aufgabe.art !== 'A' && (
              <>
                , Annuität <strong>{euro(aufgabe.a)}</strong>
              </>
            )}
            {(aufgabe.art === 'K1' || aufgabe.art === 'T2' || aufgabe.art === 'Z2') && (
              <>
                , Tilgung im 1. Jahr <strong>{euro(aufgabe.t1)}</strong>
              </>
            )}
            . <strong>{FRAGE[aufgabe.art]}</strong>
          </p>
          <div className="sa-spiel-muenzen" role="group" aria-label="Wähle die richtige Münze">
            {aufgabe.optionen.map((o, i) => (
              <button
                key={i}
                type="button"
                className={`sa-muenze${wahl !== null && o.richtig ? ' sa-muenze-richtig' : ''}${wahl === i && !o.richtig ? ' sa-muenze-falsch' : ''}`}
                disabled={wahl !== null}
                onClick={() => waehle(i)}
              >
                <small>{i + 1}</small>
                {euro(o.wert)}
              </button>
            ))}
          </div>
          {wahl !== null && (
            <>
              <div className={`bk-feedback lp-feedback ${aufgabe.optionen[wahl].richtig ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
                <i className={`fa-solid ${aufgabe.optionen[wahl].richtig ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
                <span>
                  {aufgabe.optionen[wahl].richtig
                    ? 'Richtig! Ein Block vom Schuldenberg ist weg.'
                    : (
                      <>
                        Leider nicht. {aufgabe.optionen[wahl].grund} Richtig ist {euro(aufgabe.optionen.find((o) => o.richtig)!.wert)}.
                      </>
                    )}
                </span>
              </div>
              <div className="bk-actions">
                <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
                  {nr + 1 >= RUNDEN ? 'Ergebnis ansehen' : 'Nächste Runde'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
