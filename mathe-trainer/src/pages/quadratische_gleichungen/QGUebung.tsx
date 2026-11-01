import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import './qg.css'
import { Link } from 'react-router-dom'
import TaskShell from '../../components/layout/TaskShell'
import { useSitzungState } from '../../hooks/useSitzung'
import { fieldCheckClass } from '../../utils/fieldCheck'
import { gleich, leseZahl, wahl, type Aufgabe } from './aufgaben'

// Gemeinsame Übungsseite für alle Themen „Quadratische Gleichungen“ (nur reinquadratische Gleichungen):
// Erklärung mit Merke und Beispiel, Stufen, mehrere Aufgaben, Eingabe mit grün/rot, Lob und Lösungsweg mit Äquivalenzumformungen.

export interface Stufe {
  id: number
  name: string
  beschreibung: string
}

interface Props {
  titel: string
  erklaerungTitel: string
  erklaerung: ReactNode
  stufen: Stufe[]
  erzeuge: (stufe: number) => Aufgabe
  anzahl?: number
  /** nächstes Thema (Link am Ende, wenn alles richtig ist) */
  weiter?: { to: string; label: string }
}

const LOB = [
  'Super, richtig! 🎉',
  'Klasse gemacht!',
  'Stark – genau so! 💪',
  'Perfekt gelöst! ⭐',
  'Richtig – du hast den Dreh raus!',
  'Ausgezeichnet, weiter so!',
]

type Feld = 'anzahl' | 'x1' | 'x2'

interface Antwort {
  anzahl: string
  x1: string
  x2: string
  geprueft: boolean
  ok: boolean
  felder: Partial<Record<Feld, boolean>>
  meldung: string
}

const LEER: Antwort = { anzahl: '', x1: '', x2: '', geprueft: false, ok: false, felder: {}, meldung: '' }

/** Wie viele Lösungsfelder gezeigt werden */
function feldAnzahl(a: Aufgabe, ant: Antwort): number {
  if (a.modus === 'zwei') return 2
  return ant.anzahl === '' ? 0 : Number(ant.anzahl)
}

function pruefe(a: Aufgabe, ant: Antwort): Antwort {
  const felder: Partial<Record<Feld, boolean>> = {}
  const soll = a.loesungen

  if (a.modus === 'anzahl') {
    felder.anzahl = Number(ant.anzahl) === soll.length
    if (!felder.anzahl) {
      return {
        ...ant, geprueft: true, ok: false, felder,
        meldung: `Die Anzahl der Lösungen stimmt noch nicht. Forme zuerst nach ${a.v ?? 'x'}² um: Ist die Zahl rechts positiv, 0 oder negativ?`,
      }
    }
    if (soll.length === 0) return { ...ant, geprueft: true, ok: true, felder, meldung: wahl(LOB) }
  }

  const n = feldAnzahl(a, ant)
  const werte = (['x1', 'x2'] as const).slice(0, n).map((k) => leseZahl(ant[k]))
  if (werte.some((w) => w === null)) {
    return { ...ant, geprueft: false, ok: false, felder: {}, meldung: 'Bitte gib nur Zahlen ein, z. B. 4 oder −2,5.' }
  }

  // Jede Lösung darf nur einmal „verbraucht“ werden (x₁ = 3 und x₂ = 3 ist falsch)
  const offen = [...soll]
  werte.forEach((w, i) => {
    const j = offen.findIndex((s) => gleich(s, w as number, a.runden))
    felder[i === 0 ? 'x1' : 'x2'] = j >= 0
    if (j >= 0) offen.splice(j, 1)
  })
  const ok = Object.values(felder).every(Boolean)
  if (ok) return { ...ant, geprueft: true, ok, felder, meldung: wahl(LOB) }

  let meldung = 'Leider noch nicht richtig. Rechne noch einmal nach oder schau dir den Lösungsweg an.'
  const einRichtig = felder.x1 || felder.x2
  const w = werte as number[]
  const nullprodukt = soll.length === 2 && soll.includes(0)
  if (nullprodukt) {
    const nullDa = w.some((x) => x === 0)
    const v = a.v ?? 'x'
    if (nullDa && einRichtig) meldung = `${v} = 0 stimmt. Setze jetzt die Klammer gleich 0 und löse nach ${v} auf.`
    else if (!nullDa) meldung = `Denk an die Lösung ${v} = 0: Nach dem Ausklammern ist der Faktor ${v} selbst gleich 0.`
  } else if (n === 2 && einRichtig) {
    meldung = gleich(w[0], w[1], a.runden) || gleich(Math.abs(w[0]), Math.abs(w[1]), a.runden)
      ? 'Eine Lösung stimmt. Beim Wurzelziehen gibt es zwei Lösungen: eine positive und eine negative.'
      : 'Eine Lösung stimmt. Denk an die zweite Lösung mit umgekehrtem Vorzeichen.'
  } else if (a.runden) {
    meldung = 'Leider noch nicht richtig. Runde auf zwei Nachkommastellen.'
  }
  return { ...ant, geprueft: true, ok: false, felder, meldung }
}

function Rechenweg({ a }: { a: Aufgabe }) {
  const zeilen = a.weg.map((z) => `${z.l} &= ${z.r}${z.u ? ` && ${z.u}` : ''}`).join(' \\\\ ')
  return (
    <div className="mt-2 p-3 bg-blue-50 rounded border-l-2 border-blue-400 text-sm overflow-x-auto qg-weg">
      {a.ansatz && <p className="mb-1 text-gray-800">{a.ansatz}</p>}
      <BlockMath math={`\\begin{aligned} ${zeilen} \\end{aligned}`} />
      {a.schluss.map((s, i) =>
        s.tex ? (
          <div key={i} className="font-semibold text-blue-900"><InlineMath math={s.tex} /></div>
        ) : (
          <p key={i} className="mt-1 text-gray-800">{s.text}</p>
        ),
      )}
    </div>
  )
}

export default function QGUebung({ titel, erklaerungTitel, erklaerung, stufen, erzeuge, anzahl = 6, weiter }: Props) {
  // Neues Set: möglichst lauter verschiedene Schemata (Zahlen und Variable egal), auf keinen Fall doppelte Gleichungen
  const neuesSet = useCallback(
    (s: number) => {
      const schema = (a: Aufgabe) => a.tex.replace(/\{,\}/g, '').replace(/\d+/g, '#').split(a.v ?? 'x').join('□')
      const set: Aufgabe[] = []
      for (let versuch = 0; set.length < anzahl && versuch < anzahl * 40; versuch++) {
        const a = erzeuge(s)
        if (!set.some((b) => schema(b) === schema(a))) set.push(a)
      }
      for (let versuch = 0; set.length < anzahl && versuch < anzahl * 30; versuch++) {
        const a = erzeuge(s)
        if (!set.some((b) => b.tex === a.tex)) set.push(a)
      }
      while (set.length < anzahl) set.push(erzeuge(s))
      return set
    },
    [anzahl, erzeuge],
  )
  const [stufe, setStufe] = useSitzungState<number>('stufe', stufen[0].id)
  const [aufgaben, setAufgaben] = useSitzungState<Aufgabe[]>('aufgaben', () => neuesSet(stufen[0].id))
  const [antworten, setAntworten] = useSitzungState<Record<string, Antwort>>('antworten', {})
  const [loesungAuf, setLoesungAuf] = useSitzungState<Record<string, boolean>>('loesung', {})
  const [zeigeErklaerung, setZeigeErklaerung] = useState(true)
  const letzteStufe = useRef(stufe)

  const neueAufgaben = useCallback(
    (s: number) => {
      setAufgaben(neuesSet(s))
      setAntworten({})
      setLoesungAuf({})
    },
    [neuesSet, setAufgaben, setAntworten, setLoesungAuf],
  )

  // Neue Aufgaben nur bei einem echten Stufenwechsel (sonst würde der gespeicherte Stand überschrieben)
  useEffect(() => {
    if (letzteStufe.current === stufe) return
    letzteStufe.current = stufe
    neueAufgaben(stufe)
  }, [stufe, neueAufgaben])

  const aendern = (id: string, feld: Feld, wert: string) => {
    setAntworten((prev) => {
      const alt = prev[id] ?? LEER
      const neu = { ...alt, [feld]: wert, geprueft: false, ok: false, felder: {}, meldung: '' }
      if (feld === 'anzahl') {
        neu.x1 = ''
        neu.x2 = ''
      }
      return { ...prev, [id]: neu }
    })
  }

  const pruefen = (a: Aufgabe) => {
    const ant = antworten[a.id] ?? LEER
    if (a.modus === 'anzahl' && ant.anzahl === '') return
    const n = feldAnzahl(a, ant)
    if ((['x1', 'x2'] as const).slice(0, n).some((k) => !ant[k].trim())) return
    setAntworten((prev) => ({ ...prev, [a.id]: pruefe(a, ant) }))
  }

  const richtig = aufgaben.filter((a) => antworten[a.id]?.ok).length
  const alleRichtig = aufgaben.length > 0 && richtig === aufgaben.length
  const stufeInfo = stufen.find((s) => s.id === stufe) ?? stufen[0]
  const naechste = stufen.find((s) => s.id === stufe + 1)
  const feldKlasse = 'w-28 px-2 py-1 rounded border-2 border-gray-300 text-base text-center'

  return (
    <TaskShell title={titel} width="wide">
      <div className="max-w-5xl mx-auto">
        {/* Erklärung */}
        <div className="mb-4 bg-white rounded-lg shadow border border-gray-200">
          <button
            type="button"
            onClick={() => setZeigeErklaerung((v) => !v)}
            className="w-full text-left px-4 py-2 font-semibold text-gray-800 flex justify-between items-center"
          >
            <span>{erklaerungTitel}</span>
            <span className="text-gray-500 text-sm">{zeigeErklaerung ? '▲ ausblenden' : '▼ einblenden'}</span>
          </button>
          {zeigeErklaerung && <div className="px-4 pb-4 text-sm text-gray-700 space-y-2">{erklaerung}</div>}
        </div>

        {/* Stufen */}
        {stufen.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {stufen.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStufe(s.id)}
                className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                  stufe === s.id ? 'bg-blue-600 text-white shadow' : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-sm text-gray-700">{stufeInfo.beschreibung}</p>
          <button type="button" onClick={() => neueAufgaben(stufe)} className="bk-btn">
            Neue Aufgaben
          </button>
        </div>

        {/* Aufgaben */}
        <div className="space-y-2">
          {aufgaben.map((a, index) => {
            const ant = antworten[a.id] ?? LEER
            const n = feldAnzahl(a, ant)
            const v = a.v ?? 'x'
            return (
              <div key={a.id} className="bg-white rounded p-3 shadow border-l-2 border-blue-300">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-600 whitespace-nowrap pt-1">{index + 1})</span>
                  <div className="flex-1 min-w-[14rem]">
                    {a.text ? (
                      <p className="text-base text-gray-800">
                        {a.text} {a.frage && <strong>{a.frage}</strong>}
                        {a.runden && <span className="text-gray-500"> (Runde auf zwei Nachkommastellen.)</span>}
                      </p>
                    ) : (
                      <div className="inline-block text-lg px-2 py-1 bg-gray-50 rounded border border-gray-200">
                        <InlineMath math={a.tex} />
                        {a.runden && <span className="ml-2 text-xs text-gray-500">(auf zwei Nachkommastellen runden)</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {a.modus === 'anzahl' && (
                    <label className="flex items-center gap-2 text-sm">
                      Anzahl der Lösungen:
                      <select
                        value={ant.anzahl}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => aendern(a.id, 'anzahl', e.target.value)}
                        className={`px-2 py-1 rounded border-2 border-gray-300 ${fieldCheckClass(ant.felder.anzahl)}`}
                      >
                        <option value="">wählen …</option>
                        <option value="2">zwei Lösungen</option>
                        <option value="1">eine Lösung</option>
                        <option value="0">keine Lösung</option>
                      </select>
                    </label>
                  )}
                  {(['x1', 'x2'] as const).slice(0, n).map((k, i) => (
                    <label key={k} className="flex items-center gap-1">
                      <InlineMath math={n === 1 ? `${v} =` : `${v}_${i + 1} =`} />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={ant[k]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => aendern(a.id, k, e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') pruefen(a)
                        }}
                        aria-label={`${v}${i + 1}`}
                        className={`${feldKlasse} ${fieldCheckClass(ant.felder[k])}`}
                      />
                      {a.einheit && <span className="text-sm">{a.einheit}</span>}
                    </label>
                  ))}
                  {a.modus === 'anzahl' && ant.anzahl === '0' && (
                    <span className="text-sm text-gray-600">
                      <InlineMath math={'\\mathbb{L} = \\{\\,\\}'} />
                    </span>
                  )}
                  <button type="button" onClick={() => pruefen(a)} className="bk-btn whitespace-nowrap">
                    Prüfen
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoesungAuf((p) => ({ ...p, [a.id]: !p[a.id] }))}
                    className="bk-btn whitespace-nowrap"
                  >
                    {loesungAuf[a.id] ? 'Lösungsweg ✕' : 'Lösungsweg'}
                  </button>
                </div>

                {ant.meldung && (
                  <p className={`mt-2 text-sm font-semibold ${ant.ok ? 'text-green-700' : ant.geprueft ? 'text-red-700' : 'text-gray-700'}`}>
                    {ant.ok ? `✓ ${ant.meldung}` : ant.geprueft ? `✗ ${ant.meldung}` : ant.meldung}
                  </p>
                )}

                {loesungAuf[a.id] && <Rechenweg a={a} />}
              </div>
            )
          })}
        </div>

        {/* Fortschritt */}
        <div className="mt-4 p-3 bg-white rounded shadow border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">
            Fortschritt: {richtig} / {aufgaben.length} richtig
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${aufgaben.length ? (richtig / aufgaben.length) * 100 : 0}%` }}
            />
          </div>
          {alleRichtig && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-green-700">
                🎉 Alle Aufgaben richtig – stark!{!naechste && stufen.length > 1 && ' Du hast die höchste Stufe geschafft.'}
              </p>
              {naechste && (
                <button type="button" onClick={() => setStufe(naechste.id)} className="bk-btn">
                  Weiter zu „{naechste.name}“
                </button>
              )}
              <button type="button" onClick={() => neueAufgaben(stufe)} className="bk-btn">
                Nochmal üben
              </button>
              {!naechste && weiter && (
                <Link to={weiter.to} className="bk-btn bk-btn-primary">
                  Weiter zum nächsten Thema: {weiter.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </TaskShell>
  )
}

/** Kleiner Merke-Kasten für die Erklärungen */
export function Merke({ children }: { children: ReactNode }) {
  return <div className="bg-yellow-50 rounded p-2 border border-yellow-300"><span className="font-semibold">Merke: </span>{children}</div>
}

/** Beispielrechnung mit Äquivalenzumformungen */
export function Beispiel({ titel, zeilen, schluss }: { titel?: string; zeilen: [string, string, string?][]; schluss?: string }) {
  const tex = zeilen.map(([l, r, u]) => `${l} &= ${r}${u ? ` && ${u}` : ''}`).join(' \\\\ ')
  return (
    <div className="bg-gray-50 rounded p-2 border border-gray-200 overflow-x-auto qg-weg">
      <span className="font-semibold">{titel ?? 'Beispiel'}:</span>
      <BlockMath math={`\\begin{aligned} ${tex} \\end{aligned}`} />
      {schluss && <div className="font-semibold"><InlineMath math={schluss} /></div>}
    </div>
  )
}

