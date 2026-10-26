import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import './punkte.css'

// Gamification der Lernsituationen: Punkte für gelöste Aufgaben, weniger Punkte mit Hilfen, zwei Drittel Abzug für den Lösungsweg vor dem Lösen,
// Serien-Bonus, Abzeichen, Sterne und persönlicher Rekord. Aktiv nur innerhalb von <PunkteProvider> (SeitenLernsituation mit punkte).
// Die Aufgaben-Bausteine (CheckCard, McCard, Hilfen, SchrittHilfen, Vermutung, Kriterien) melden sich selbst über usePunkteAufgabe.
// Rechenbeispiel und Lernvideo sind kostenlos: Sie gehören zum Lernen. Hilfen und der Lösungsweg kosten Punkte.

/** Abzug für den Lösungsweg vor dem Lösen: zwei Drittel der Aufgabenpunkte (gerundet) */
export const loesungKosten = (max: number) => Math.round(max * PUNKTE.loesungAnteil)
/** Abzug je Hilfe und je Fehlversuch: ein Fünftel der Aufgabenpunkte, mindestens 1 (bei 10 Punkten −2, bei 3 Punkten −1) */
export const hilfeKosten = (max: number) => Math.max(1, Math.round(max * PUNKTE.abzugAnteil))
/**
 * So viel bringt eine selbst gelöste Aufgabe mindestens: genauso viel wie mit Lösungsweg (ein Drittel, mindestens 1).
 * Wer sich mit Hilfen und Fehlversuchen durchkämpft, steht so nie schlechter da als jemand, der sofort den Lösungsweg ansieht.
 */
export const mindestPunkte = (max: number) => Math.min(max, Math.max(1, max - loesungKosten(max)))

// Punkte nach Aufwand (Balancing, siehe docs/skills/lernsituationen/SKILL.md): Jede Aufgabe bekommt mit `punkte` ihren Wert,
// z. B. 2 für einen Abruf im Warm-up, 12 für die Kernaufgabe in „Problem lösen“. Ohne Angabe gilt PUNKTE.aufgabe.
export const PUNKTE = {
  aufgabe: 10, // Standardwert, wenn eine Aufgabe keinen eigenen Wert hat
  abzugAnteil: 1 / 5, // je angezeigter Hilfe und je Fehlversuch (höchstens 3 werden gezählt), mindestens 1 Punkt
  loesungAnteil: 2 / 3, // Lösungsweg vor dem Lösen angesehen: Abzug von 2/3 der Aufgabenpunkte (bei 10 Punkten bleiben 3)
  festlegung: 3, // Festlegung bzw. Ausprobieren in „Problem erkennen“
  kriterien: 5, // alle Kriterien des Handlungsprodukts abgehakt
  serie: 3, // so viele Aufgaben am Stück ohne Hilfe und ohne Fehler ergeben einen Serien-Bonus
  serienBonus: 3,
  muenze: 2, // je Münze im Bonus-Spiel (nur das beste Ergebnis zählt)
} as const

type Aufgabe = { max: number; hilfen: number; fehler: number; loesung: boolean; geloest: boolean; punkte: number; profi: boolean }
type Meldung = { id: number; text: string; plus: boolean }

type PunkteApi = {
  registriere: (id: string, max: number, profi: boolean) => void
  hilfe: (id: string) => void
  fehler: (id: string) => void
  loesung: (id: string) => void
  geloest: (id: string, wert?: number, serie?: boolean) => void
  spiel: (muenzen: number, runden: number) => void
}

type PunkteStand = {
  gesamt: number
  max: number
  aufgaben: Record<string, Aufgabe>
  besteSerie: number
  spielMuenzen: number
  spielRunden: number
  meldungen: Meldung[]
  rekord: number | null
}

const ApiCtx = createContext<PunkteApi | null>(null)
const StandCtx = createContext<PunkteStand | null>(null)
/** Gemeinsame Aufgaben-ID, z. B. für die beiden Wege in WegWahl (selbst rechnen / Lösungsschema zählen als eine Aufgabe) */
export const PunkteGruppeCtx = createContext<string | null>(null)

const leseRekord = (key: string) => {
  try {
    const v = localStorage.getItem(key)
    return v === null ? null : Number(v)
  } catch {
    return null
  }
}
const schreibeRekord = (key: string, v: number) => {
  try {
    localStorage.setItem(key, String(v))
  } catch {
    /* ohne Speicher kein Rekord */
  }
}

export function PunkteProvider({ name, children }: { name: string; children: ReactNode }) {
  const [aufgaben, setAufgaben] = useState<Record<string, Aufgabe>>({})
  const [bonus, setBonus] = useState(0)
  const [serie, setSerie] = useState(0)
  const [besteSerie, setBesteSerie] = useState(0)
  const [spielMuenzen, setSpielMuenzen] = useState(0)
  const [spielRunden, setSpielRunden] = useState(0)
  const [meldungen, setMeldungen] = useState<Meldung[]>([])
  const rekordKey = `lernsituation-punkte:${name}`
  const [rekord] = useState(() => leseRekord(rekordKey))
  const zaehler = useRef(0)
  const ref = useRef(aufgaben)
  const serieRef = useRef(serie)
  serieRef.current = serie
  const spielRef = useRef(0)

  const melde = useCallback((text: string, plus: boolean) => {
    const id = ++zaehler.current
    setMeldungen((m) => [...m.slice(-2), { id, text, plus }])
    window.setTimeout(() => setMeldungen((m) => m.filter((x) => x.id !== id)), 2200)
  }, [])

  // Der Stand liegt zusätzlich im Ref, damit schnell aufeinanderfolgende Meldungen (Fehler, dann gelöst) sich sofort sehen
  const setze = useCallback((neu: Record<string, Aufgabe>) => {
    ref.current = neu
    setAufgaben(neu)
  }, [])
  const aendere = useCallback(
    (id: string, f: (a: Aufgabe) => Aufgabe) => {
      const alle = ref.current
      if (alle[id]) setze({ ...alle, [id]: f(alle[id]) })
    },
    [setze]
  )

  const api = useMemo<PunkteApi>(
    () => ({
      registriere: (id, max, profi) => {
        const alle = ref.current
        setze(
          alle[id]
            ? { ...alle, [id]: { ...alle[id], max: Math.max(alle[id].max, max), profi: alle[id].profi || profi } }
            : { ...alle, [id]: { max, hilfen: 0, fehler: 0, loesung: false, geloest: false, punkte: 0, profi } }
        )
      },
      hilfe: (id) => {
        const a = ref.current[id]
        if (!a || a.geloest) return
        aendere(id, (x) => ({ ...x, hilfen: x.hilfen + 1 }))
        melde(`Hilfe: −${hilfeKosten(a.max)} ${hilfeKosten(a.max) === 1 ? 'Punkt' : 'Punkte'} für diese Aufgabe`, false)
      },
      fehler: (id) => {
        const a = ref.current[id]
        if (!a || a.geloest) return
        aendere(id, (x) => ({ ...x, fehler: x.fehler + 1 }))
      },
      loesung: (id) => {
        const a = ref.current[id]
        if (!a || a.geloest || a.loesung) return
        aendere(id, (x) => ({ ...x, loesung: true }))
        serieRef.current = 0
        setSerie(0)
        melde(`Lösungsweg angesehen: −${loesungKosten(a.max)} Punkte für diese Aufgabe`, false)
      },
      geloest: (id, wert, mitSerie = true) => {
        const a = ref.current[id]
        if (!a || a.geloest) return
        const max = wert ?? a.max
        // Mit Lösungsweg bleibt ein Drittel der Punkte (Hilfen und Fehlversuche werden dann nicht zusätzlich abgezogen)
        const punkte = a.loesung
          ? max - loesungKosten(max)
          : Math.max(mindestPunkte(max), max - hilfeKosten(max) * (a.hilfen + Math.min(a.fehler, 3)))
        aendere(id, (x) => ({ ...x, geloest: true, punkte }))
        if (punkte > 0) melde(`+${punkte} Punkte`, true)
        // Serie nur für echte Aufgaben (Festlegungen und Kriterien zählen nicht)
        if (!mitSerie) return
        if (!a.loesung && a.hilfen === 0 && a.fehler === 0) {
          const neu = serieRef.current + 1
          serieRef.current = neu
          setSerie(neu)
          setBesteSerie((b) => Math.max(b, neu))
          if (neu % PUNKTE.serie === 0) {
            setBonus((b) => b + PUNKTE.serienBonus)
            melde(`${neu} richtig am Stück! Serien-Bonus +${PUNKTE.serienBonus}`, true)
          }
        } else {
          serieRef.current = 0
          setSerie(0)
        }
      },
      spiel: (muenzen, runden) => {
        setSpielRunden(runden)
        const vorher = spielRef.current
        if (muenzen <= vorher) return
        spielRef.current = muenzen
        setSpielMuenzen(muenzen)
        setBonus((x) => x + (muenzen - vorher) * PUNKTE.muenze)
        melde(`Bonus-Spiel: +${(muenzen - vorher) * PUNKTE.muenze} Punkte`, true)
      },
    }),
    [aendere, melde, setze]
  )

  const liste = Object.values(aufgaben)
  const gesamt = Math.max(0, liste.reduce((s, a) => s + a.punkte, 0) + bonus)
  const max = liste.reduce((s, a) => s + a.max, 0)

  // Rekord: bisheriger Bestwert (beim Öffnen gelesen) wird überschrieben, sobald der aktuelle Stand höher ist
  useEffect(() => {
    if (gesamt > (leseRekord(rekordKey) ?? 0)) schreibeRekord(rekordKey, gesamt)
  }, [gesamt, rekordKey])

  const stand: PunkteStand = { gesamt, max, aufgaben, besteSerie, spielMuenzen, spielRunden, meldungen, rekord }
  return (
    <ApiCtx.Provider value={api}>
      <StandCtx.Provider value={stand}>{children}</StandCtx.Provider>
    </ApiCtx.Provider>
  )
}

/**
 * Meldung einer Aufgabe an die Punkte (ohne Provider passiert nichts). wert: Punkte der Aufgabe nach Aufwand, z. B. 2 für einen
 * Abruf im Warm-up oder 12 für die Kernaufgabe; Festlegung und Kriterien mit serie: false (zählen nicht zur Serie).
 * profi: freiwillige Erweiterung (zählt nicht zum Maximum der Sterne, bringt das Abzeichen „Profi“).
 * zaehlt: false für Aufgaben ohne Punkte, z. B. die Fehlersuche (sie soll nichts kosten und nichts bringen).
 */
export function usePunkteAufgabe({
  wert,
  profi = false,
  serie = true,
  zaehlt = true,
}: { wert?: number; profi?: boolean; serie?: boolean; zaehlt?: boolean } = {}) {
  const ctxApi = useContext(ApiCtx)
  const api = zaehlt ? ctxApi : null
  const gruppe = useContext(PunkteGruppeCtx)
  const eigene = useId()
  const id = gruppe ?? eigene
  const max = wert ?? PUNKTE.aufgabe
  useEffect(() => {
    api?.registriere(id, max, profi)
  }, [api, id, max, profi])
  return useMemo(
    () => ({
      aktiv: !!api,
      hilfe: () => api?.hilfe(id),
      fehler: () => api?.fehler(id),
      loesung: () => api?.loesung(id),
      loesungKosten: loesungKosten(max),
      hilfeKosten: hilfeKosten(max),
      geloest: () => api?.geloest(id, max, serie),
    }),
    [api, id, serie, max]
  )
}

/** Aktuelle Aufgabe für Hilfen innerhalb einer Karte (CheckCard/McCard stellen sie bereit); hilfeKosten für die Anzeige am Knopf */
export const AufgabePunkteCtx = createContext<{ hilfe: () => void; hilfeKosten: number } | null>(null)

/** „1 Punkt“ bzw. „3 Punkte“ */
export const punkteText = (n: number) => `${n} ${n === 1 ? 'Punkt' : 'Punkte'}`

/** Ergebnis eines Bonus-Spiels melden (nur das beste Ergebnis zählt) */
export function useSpielPunkte() {
  const api = useContext(ApiCtx)
  return (muenzen: number, runden: number) => api?.spiel(muenzen, runden)
}

/** Punktestand für die Phasenleiste, mit kurzen Meldungen (+10, Serien-Bonus, Abzug) */
export function PunkteAnzeige() {
  const stand = useContext(StandCtx)
  if (!stand) return null
  return (
    <span className="sl-punkte" title="Deine Punkte">
      <i className="fa-solid fa-star" aria-hidden="true" />
      <span aria-label={`${stand.gesamt} Punkte`}>{stand.gesamt}</span>
      <span className="sl-punkte-meldungen" aria-live="polite">
        {stand.meldungen.map((m) => (
          <span key={m.id} className={`sl-punkte-meldung ${m.plus ? 'sl-plus' : 'sl-minus'}`}>
            {m.text}
          </span>
        ))}
      </span>
    </span>
  )
}

type Abzeichen = { icon: string; name: string; text: string; erreicht: boolean }

/** Bilanz am Ende der Lernsituation: Punkte, Sterne, Rang, Abzeichen und persönlicher Rekord */
export function Bilanz() {
  const stand = useContext(StandCtx)
  if (!stand) return null
  const liste = Object.values(stand.aufgaben)
  const pflicht = liste.filter((a) => !a.profi)
  // Sterne nur aus den Aufgabenpunkten der Pflichtaufgaben (ohne Serien- und Spielbonus)
  const pflichtMax = pflicht.reduce((s, a) => s + a.max, 0)
  const anteil = pflichtMax ? pflicht.reduce((s, a) => s + a.punkte, 0) / pflichtMax : 0
  const sterne = anteil >= 0.9 ? 3 : anteil >= 0.7 ? 2 : anteil >= 0.4 ? 1 : 0
  const rang = ['Einsteiger', 'Bronze', 'Silber', 'Gold'][sterne]
  const geloest = liste.filter((a) => a.geloest)
  const abzeichen: Abzeichen[] = [
    {
      icon: 'fa-hand-fist',
      name: 'Ganz allein',
      text: 'Alle Pflichtaufgaben ohne Hilfe und ohne Lösungsweg',
      erreicht: pflicht.length > 0 && pflicht.every((a) => a.geloest && a.hilfen === 0 && !a.loesung),
    },
    { icon: 'fa-fire', name: 'Serienstar', text: '5 Aufgaben am Stück ohne Fehler und ohne Hilfe', erreicht: stand.besteSerie >= 5 },
    { icon: 'fa-graduation-cap', name: 'Profi', text: 'Die Profi-Aufgabe gelöst', erreicht: liste.some((a) => a.profi && a.geloest) },
    {
      icon: 'fa-gamepad',
      name: 'Spielchampion',
      text: 'Im Bonus-Spiel fast alle Münzen gesammelt',
      erreicht: stand.spielRunden > 0 && stand.spielMuenzen >= stand.spielRunden - 1,
    },
  ]
  return (
    <section className="sl-abschnitt sl-bilanz" aria-label="Deine Bilanz">
      <h3 className="sl-abschnitt-titel">
        <i className="fa-solid fa-medal" aria-hidden="true" /> Deine Bilanz
      </h3>
      <div className="sl-bilanz-kopf">
        <span className="sl-bilanz-punkte">
          <i className="fa-solid fa-star" aria-hidden="true" /> {stand.gesamt} Punkte
        </span>
        <span className="sl-bilanz-sterne" aria-label={`${sterne} von 3 Sternen, Rang ${rang}`}>
          {[0, 1, 2].map((i) => (
            <i key={i} className={`fa-solid fa-star${i < sterne ? ' sl-an' : ''}`} aria-hidden="true" />
          ))}
          <span>Rang: {rang}</span>
        </span>
      </div>
      <p className="sl-hinweis">
        {geloest.length} von {liste.length} Aufgaben gelöst.{' '}
        {stand.rekord !== null && stand.rekord > 0 ? `Dein bisheriger Rekord: ${stand.rekord} Punkte. ` : ''}
        Eine Hilfe kostet ein Fünftel, der Lösungsweg vor dem Lösen zwei Drittel der Punkte einer Aufgabe.
      </p>
      <ul className="sl-abzeichen">
        {abzeichen.map((a) => (
          <li key={a.name} className={a.erreicht ? 'sl-an' : ''}>
            <i className={`fa-solid ${a.erreicht ? a.icon : 'fa-lock'}`} aria-hidden="true" />
            <span>
              <strong>{a.name}</strong>
              <small>{a.text}</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Kurze Spielregeln für die Startbox */
export function PunkteRegeln() {
  const stand = useContext(StandCtx)
  if (!stand) return null
  return (
    <p className="sl-punkte-regeln">
      <i className="fa-solid fa-star" aria-hidden="true" /> <strong>Punkte sammeln:</strong> Jede richtig gelöste Aufgabe bringt Punkte, je
      aufwendiger, desto mehr: kurze Aufwärmaufgaben 2 bis 4, die großen Aufgaben bis zu 12. Jede Hilfe und jeder Fehlversuch kostet ein Fünftel der Punkte der
      Aufgabe (die Kosten stehen am Knopf). Wer sich vor dem Lösen den Lösungsweg anzeigen lässt, bekommt für diese Aufgabe nur noch ein Drittel der Punkte. Für{' '}
      {PUNKTE.serie} richtige Aufgaben am Stück ohne Hilfe gibt es einen Bonus. Am Ende warten Sterne, Abzeichen und ein Spiel.
    </p>
  )
}
