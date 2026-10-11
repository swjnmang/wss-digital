import { useEffect, useState } from 'react'
import { PruefungKopf } from './PruefungKopf'
import TeilA from './kopfrechnen/TeilA'

// „Alles gemischt“: Probe-Abschlussprüfung als Prüfungsmappe.
// Teil A (ohne Taschenrechner) wird direkt hier gelöst; für Teil B wird je Bereich eine bestehende Anwendungsaufgabe
// gezogen, die in einem neuen Tab geöffnet, gelöst und hier abgehakt wird. Gespeichert wird nur für diese Sitzung.

interface Aufgabe { title: string; path: string }

const TEIL_B: { id: string; titel: string; aufgaben: Aufgabe[] }[] = [
  {
    id: 'finanz', titel: 'Finanzmathematik', aufgaben: [
      { title: 'Ardas Kapitalanlagen', path: '/finanzmathe/anwendungsaufgaben/ardas-kapitalanlagen' },
      { title: 'Sportladen Eröffnung', path: '/finanzmathe/anwendungsaufgaben/sportladen-eröffnung' },
      { title: 'Die Unfallversicherung', path: '/finanzmathe/anwendungsaufgaben/die-unfallversicherung' },
      { title: 'Ehepaar Tempel', path: '/finanzmathe/anwendungsaufgaben/ehepaar-tempel' },
      { title: 'Familie Kessler', path: '/finanzmathe/anwendungsaufgaben/familie-kessler' },
      { title: 'Der Autokauf', path: '/finanzmathe/anwendungsaufgaben/der-autokauf' },
      { title: 'Das Elektroauto', path: '/finanzmathe/anwendungsaufgaben/das-elektroauto' },
      { title: 'Der Foodtruck', path: '/finanzmathe/anwendungsaufgaben/der-foodtruck' },
      { title: 'Sarahs Finanzplanung', path: '/finanzmathe/anwendungsaufgaben/sarah-kapitalanlagen' },
    ],
  },
  {
    id: 'funktionen', titel: 'Funktionaler Zusammenhang', aufgaben: [
      { title: 'Der Fußballplatz', path: '/lineare_funktionen/anwendungsaufgaben/fussballplatz' },
      { title: 'Das Tipi', path: '/lineare_funktionen/anwendungsaufgaben/tipi' },
      { title: 'Der Berg', path: '/lineare_funktionen/anwendungsaufgaben/berg' },
      { title: 'Die Sonne', path: '/lineare_funktionen/anwendungsaufgaben/sonne' },
      { title: 'Die Schrägseilbrücke', path: '/lineare_funktionen/anwendungsaufgaben/bruecke' },
      { title: 'Der Flughafen', path: '/lineare_funktionen/anwendungsaufgaben/flughafen' },
    ],
  },
  {
    id: 'trigo', titel: 'Trigonometrie', aufgaben: [
      { title: 'Olympiapark München', path: '/trigonometrie/anwendungsaufgaben/olympiapark-muenchen' },
      { title: 'Stadionneubau', path: '/trigonometrie/anwendungsaufgaben/stadion' },
      { title: 'Das Fußballfeld', path: '/trigonometrie/anwendungsaufgaben/fussballfeld' },
      { title: 'Die Bergbahn', path: '/trigonometrie/anwendungsaufgaben/bergbahn' },
    ],
  },
  {
    id: 'daten', titel: 'Daten und Zufall', aufgaben: [
      { title: 'Die Mensa-Umfrage', path: '/daten-und-zufall/anwendungsaufgaben/mensa-umfrage' },
      { title: 'Die Ticketkontrolle', path: '/daten-und-zufall/anwendungsaufgaben/ticketkontrolle' },
      { title: 'Das Elfmeterschießen', path: '/daten-und-zufall/anwendungsaufgaben/elfmeterschiessen' },
      { title: 'Das Sommerfest', path: '/daten-und-zufall/anwendungsaufgaben/sommerfest' },
      { title: 'Die Fahrradstation', path: '/daten-und-zufall/anwendungsaufgaben/fahrradstation' },
      { title: 'Die Bio-Kiste', path: '/daten-und-zufall/anwendungsaufgaben/bio-kiste' },
    ],
  },
  { id: 'raum', titel: 'Raum und Form', aufgaben: [] },
]

const KEY = 'bk-probe-ap'
const DAUER = 150 * 60

interface Mappe {
  start: number
  teilB: Record<string, Aufgabe | null>
  erledigt: Record<string, boolean>
  punkte: Record<string, string>
}

const ziehen = (): Mappe => ({
  start: Date.now(),
  teilB: Object.fromEntries(TEIL_B.map((b) => [b.id, b.aufgaben.length ? b.aufgaben[Math.floor(Math.random() * b.aufgaben.length)] : null])),
  erledigt: {},
  punkte: {},
})

function laden(): Mappe | null {
  try {
    const s = sessionStorage.getItem(KEY)
    return s ? (JSON.parse(s) as Mappe) : null
  } catch {
    return null
  }
}

const uhr = (s: number) => {
  const v = Math.max(s, 0)
  return `${Math.floor(v / 3600)}:${String(Math.floor((v % 3600) / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`
}

export default function AllesGemischt() {
  const [mappe, setMappe] = useState<Mappe | null>(laden)
  const [jetzt, setJetzt] = useState(Date.now())
  const [teilA, setTeilA] = useState<{ punkte: number; offen: number } | null>(null)

  useEffect(() => {
    try {
      if (mappe) sessionStorage.setItem(KEY, JSON.stringify(mappe))
      else sessionStorage.removeItem(KEY)
    } catch { /* ohne Speicher weiter nur im Speicher der Seite */ }
  }, [mappe])

  useEffect(() => {
    if (!mappe) return
    const t = window.setInterval(() => setJetzt(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [mappe])

  if (!mappe) {
    return (
      <div className="bk-page bk-task bk-w-narrow">
        <PruefungKopf title="Alles gemischt" current sub="Komplette Probe-Abschlussprüfung aus allen Bereichen." />
        <div className="bk-task-body">
          <div className="bk-panel bk-stack">
            <p style={{ margin: 0, lineHeight: 1.55 }}>
              So läuft die Probe-Abschlussprüfung ab: <strong>Teil A</strong> (ohne Taschenrechner, 15 Punkte) löst du direkt auf dieser Seite.
              Für <strong>Teil B</strong> (mit Taschenrechner) wird aus jedem Bereich eine Anwendungsaufgabe gezogen (je 15 Punkte). Du öffnest sie in einem
              neuen Tab, löst sie, hakst sie hier ab und trägst deine Punkte ein.
            </p>
            <p style={{ margin: 0, color: 'var(--ink-muted)' }}>Arbeitszeit insgesamt 150 Minuten · Hilfsmittel: Merkhilfe, in Teil B Taschenrechner.</p>
            <div className="bk-actions">
              <button type="button" className="bk-btn bk-btn-primary" onClick={() => setMappe(ziehen())}>
                <i className="fa-solid fa-stopwatch" aria-hidden="true" /> Probe-Abschlussprüfung starten
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const rest = DAUER - Math.floor((jetzt - mappe.start) / 1000)
  const punkteB = Object.values(mappe.punkte).reduce((s, p) => s + (Number(p.replace(',', '.')) || 0), 0)
  const anzahlB = TEIL_B.filter((b) => mappe.teilB[b.id]).length
  const setzen = (f: (m: Mappe) => Mappe) => setMappe((m) => (m ? f(m) : m))

  return (
    <div className="bk-page bk-task bk-w-narrow">
      <PruefungKopf title="Alles gemischt" current sub="Probe-Abschlussprüfung – Teil A und Teil B aus allen Bereichen." />
      <div className="bk-task-body bk-stack">
        <div className="bk-ka-bar">
          <span className={`bk-chip${rest <= 0 ? ' bk-field-no' : ''}`}>
            <i className="fa-solid fa-stopwatch" aria-hidden="true" /> {rest > 0 ? `noch ${uhr(rest)}` : 'Zeit abgelaufen'}
          </span>
          <button type="button" className="bk-btn bk-btn-sm" onClick={() => { if (window.confirm('Neue Probe-Abschlussprüfung ziehen? Die bisherige wird verworfen.')) setMappe(ziehen()) }}>
            <i className="fa-solid fa-rotate" aria-hidden="true" /> Neu ziehen
          </button>
        </div>

        <section className="bk-stack" aria-labelledby="teil-a">
          <h2 id="teil-a" className="bk-area-title" style={{ fontSize: 24 }}>Teil A – ohne Taschenrechner</h2>
          <TeilA onPunkte={(punkte, offen) => setTeilA({ punkte, offen })} />
        </section>

        <section className="bk-stack" aria-labelledby="teil-b">
          <h2 id="teil-b" className="bk-area-title" style={{ fontSize: 24 }}>Teil B – mit Taschenrechner</h2>
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>Je Aufgabe 15 Punkte. Öffne die Aufgabe, löse sie und trage danach deine Punkte ein.</p>
          <div className="bk-stack" style={{ gap: 10 }}>
            {TEIL_B.map((b, i) => {
              const a = mappe.teilB[b.id]
              return (
                <div key={b.id} className="bk-topic bk-ka-teilb">
                  <span className="bk-topic-no">{i + 1}</span>
                  <span className="bk-topic-text">
                    <strong>{b.titel}</strong>
                    <small>{a ? a.title : 'Anwendungsaufgaben folgen'}</small>
                  </span>
                  {a && (
                    <span className="bk-actions" style={{ marginLeft: 'auto' }}>
                      <a className="bk-btn bk-btn-sm" href={a.path} target="_blank" rel="noopener">
                        Öffnen <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                      </a>
                      <label className="bk-ka-field">
                        <input
                          type="checkbox"
                          checked={!!mappe.erledigt[a.path]}
                          onChange={(e) => setzen((m) => ({ ...m, erledigt: { ...m.erledigt, [a.path]: e.target.checked } }))}
                          style={{ width: 22, height: 22, accentColor: 'var(--primary)' }}
                        />
                        erledigt
                      </label>
                      <label className="bk-ka-field">
                        <input
                          className="bk-input"
                          style={{ width: 80, minHeight: 44 }}
                          inputMode="decimal"
                          aria-label={`Punkte ${b.titel}`}
                          value={mappe.punkte[a.path] ?? ''}
                          onChange={(e) => setzen((m) => ({ ...m, punkte: { ...m.punkte, [a.path]: e.target.value } }))}
                        />
                        / 15
                      </label>
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="bk-panel bk-stack" aria-label="Gesamtergebnis">
          <h2 className="bk-section-title" style={{ margin: 0 }}>Gesamtergebnis</h2>
          <p style={{ margin: 0 }}>Teil A: {teilA ? `${String(teilA.punkte).replace('.', ',')} von 15 Punkten` : 'noch nicht abgegeben'}</p>
          <p style={{ margin: 0 }}>Teil B: {String(punkteB).replace('.', ',')} von {anzahlB * 15} Punkten</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            Gesamt: {String((teilA?.punkte ?? 0) + punkteB).replace('.', ',')} von {15 + anzahlB * 15} Punkten
          </p>
          {anzahlB < 5 && <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: 14 }}>In der echten Prüfung bearbeitest du in Teil B vier Aufgaben (60 Punkte). Raum und Form folgt noch.</p>}
        </section>
      </div>
    </div>
  )
}
