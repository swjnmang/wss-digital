import { AREAS, type Area, type AreaId } from './areas'
import { TOPICS } from '../pages/raum_und_form/registry'
import type { MenuItem } from '../components/layout/MenuPage'
import { aufgaben as terme } from '../pages/rechnen_lernen/Terme'
import { aufgaben as brueche } from '../pages/rechnen_lernen/Brueche'
import { aufgaben as potenzen } from '../pages/rechnen_lernen/Potenzen'
import { aufgaben as wurzeln } from '../pages/rechnen_lernen/Wurzeln'
import { aufgaben as prozent } from '../pages/rechnen_lernen/Prozentrechnung'
import { aufgaben as gleichungen } from '../pages/rechnen_lernen/Gleichungen'
import { aufgaben as zinsrechnung } from '../pages/finanzmathe/ZinsrechnungMenu'
import { aufgaben as finanzAnwendung } from '../pages/finanzmathe/Anwendungsaufgaben'
import { tasks as trigoAnwendung } from '../pages/trigonometrie/AnwendungsaufgabenMenu'
import { tasks as datenAnwendung } from '../pages/daten_und_zufall/anwendungsaufgaben/index'

// Gemischtes Training: Pool aller einzelnen Übungen (Untermenüs werden durch ihre Übungen ersetzt).
// Tests, Prüfungsmodi, Spiele und Platzhalter sind ausgenommen.

export interface TrainingItem {
  title: string
  desc: string
  path: string
  area: Area
}

const LF_STEIGUNG: MenuItem[] = [
  { title: 'Die Steigung m ablesen', desc: 'Steigung mit dem Steigungsdreieck ablesen.', path: '/lineare_funktionen/steigung/ablesen' },
  { title: 'Die Steigung m berechnen', desc: 'Steigung aus zwei Punkten berechnen.', path: '/lineare_funktionen/steigung/berechnen' },
]
const LF_ANWENDUNG: MenuItem[] = [
  { title: 'Der Fußballplatz', desc: 'Ein Pass auf dem Fußballfeld mit linearen Funktionen.', path: '/lineare_funktionen/anwendungsaufgaben/fussballplatz' },
  { title: 'Das Tipi', desc: 'Maße eines Tipis aus zwei Geradengleichungen.', path: '/lineare_funktionen/anwendungsaufgaben/tipi' },
  { title: 'Der Berg', desc: 'Funktionsgleichungen und Schnittpunkte von Bergliften.', path: '/lineare_funktionen/anwendungsaufgaben/berg' },
  { title: 'Die Sonne', desc: 'Sonnenstrahlen mit linearen Funktionen untersuchen.', path: '/lineare_funktionen/anwendungsaufgaben/sonne' },
  { title: 'Die Schrägseilbrücke', desc: 'Tragseile einer Brücke als Geraden.', path: '/lineare_funktionen/anwendungsaufgaben/bruecke' },
  { title: 'Der Flughafen', desc: 'Zwei sich kreuzende Start- und Landebahnen.', path: '/lineare_funktionen/anwendungsaufgaben/flughafen' },
]

/** Menü-Pfad → seine einzelnen Übungen */
const SUBMENUS: Record<string, MenuItem[]> = {
  '/rechnen_lernen/terme': terme,
  '/rechnen_lernen/brueche': brueche,
  '/rechnen_lernen/potenzen': potenzen,
  '/rechnen_lernen/wurzeln': wurzeln,
  '/rechnen_lernen/prozentrechnung': prozent,
  '/rechnen_lernen/gleichungen': gleichungen,
  '/finanzmathe/zinsrechnung': zinsrechnung,
  '/finanzmathe/anwendungsaufgaben': finanzAnwendung,
  '/trigonometrie/anwendungsaufgaben': trigoAnwendung,
  '/daten-und-zufall/anwendungsaufgaben': datenAnwendung,
  '/lineare_funktionen/steigung': LF_STEIGUNG,
  '/lineare_funktionen/anwendungsaufgaben': LF_ANWENDUNG,
}
for (const t of TOPICS) {
  SUBMENUS[`/raum-und-form/${t.slug}`] = t.pages.map((p) => ({ title: `${t.title}: ${p.title}`, desc: p.description, path: `/raum-und-form/${t.slug}/${p.slug}` }))
}

const EXCLUDE = /Prüfung|Abschlusstest|Test|Spiel|Millionär|Übungsblatt|Escape/i

const clean = (t: string) => t.replace(/^\d+\.\s*/, '')

export function trainingPool(): Record<AreaId, TrainingItem[]> {
  const pool = {} as Record<AreaId, TrainingItem[]>
  for (const area of AREAS) {
    const items: TrainingItem[] = []
    for (const s of area.sections) {
      for (const it of s.items) {
        const children = SUBMENUS[it.path] ?? [it]
        for (const c of children) {
          if (EXCLUDE.test(c.title) || EXCLUDE.test(c.path)) continue
          if (items.some((x) => x.path === c.path)) continue
          items.push({ title: clean(c.title), desc: c.desc ?? '', path: c.path, area })
        }
      }
    }
    pool[area.id] = items
  }
  return pool
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** n Übungen, reihum aus den gewählten Bereichen gezogen, damit alle Bereiche vorkommen. */
export function drawTraining(n: number, areas: AreaId[]): TrainingItem[] {
  const pool = trainingPool()
  const queues = shuffle(areas).map((id) => shuffle(pool[id] ?? [])).filter((q) => q.length > 0)
  const out: TrainingItem[] = []
  while (out.length < n && queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      const next = q.shift()
      if (next && out.length < n) out.push(next)
    }
  }
  return shuffle(out)
}
