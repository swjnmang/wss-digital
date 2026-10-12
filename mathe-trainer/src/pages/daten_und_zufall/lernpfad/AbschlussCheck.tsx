import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EXERCISES_BAUM } from './Baumdiagramme'
import { EXERCISES_DATEN_ORDNEN } from './DatenOrdnen'
import { EXERCISES_DIAGRAMME } from './Diagramme'
import { EXERCISES_HAEUFIGKEITEN } from './Haeufigkeiten'
import { EXERCISES_KENNWERTE } from './Kennwerte'
import { EXERCISES_BEWERTEN } from './KennwerteBewerten'
import { EXERCISES_PFADREGELN } from './Pfadregeln'
import { EXERCISES_ZUFALL } from './Zufallsexperimente'
import { Exercise, Lesson, Section, pick, type ExerciseDef } from './kit'
import { LESSONS, lessonPath } from './lessons'

// Schritt 9: gemischter Test aus allen Lernschritten (je Schritt eine zufällige Aufgabe)

const POOLS: { slug: string; defs: ExerciseDef[] }[] = [
  { slug: 'haeufigkeiten', defs: EXERCISES_HAEUFIGKEITEN.filter((d) => d.id !== 'welcher-wert') },
  { slug: 'diagramme', defs: EXERCISES_DIAGRAMME },
  { slug: 'kennwerte', defs: EXERCISES_KENNWERTE.filter((d) => d.level !== 1) },
  { slug: 'kennwerte-bewerten', defs: EXERCISES_BEWERTEN },
  { slug: 'zufallsexperimente', defs: EXERCISES_ZUFALL },
  { slug: 'baumdiagramme', defs: EXERCISES_BAUM.filter((d) => d.id !== 'drei') },
  { slug: 'pfadregeln', defs: EXERCISES_PFADREGELN },
  { slug: 'pfadregeln', defs: EXERCISES_PFADREGELN },
  { slug: 'daten-ordnen', defs: EXERCISES_DATEN_ORDNEN },
]

function zusammenstellen() {
  const used = new Set<string>()
  return POOLS.map((p) => {
    const def = pick(p.defs.filter((d) => !used.has(d.id)))
    used.add(def.id)
    return { slug: p.slug, def }
  })
}

export default function AbschlussCheck() {
  const [runde, setRunde] = useState(0)
  const [aufgaben, setAufgaben] = useState(zusammenstellen)

  const neu = () => {
    setAufgaben(zusammenstellen())
    setRunde((r) => r + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Lesson goal="Du prüfst, ob du alle Inhalte des Lernbereichs beherrschst. Jede Aufgabe stammt aus einem anderen Lernschritt. Was noch nicht klappt, wiederholst du im angegebenen Schritt.">
      <Section no="✓" title="So funktioniert der Check">
        <p>
          Löse die {aufgaben.length} Aufgaben ohne den Lösungsweg anzuschauen. Oben rechts siehst du, wie viele du schon richtig hast. Bei Fehlern hilft dir der Link „Wiederholen“
          zum passenden Lernschritt. Mit „Neuen Check zusammenstellen“ bekommst du andere Aufgaben.
        </p>
      </Section>
      <div className="lp-exlist" key={runde}>
        {aufgaben
          .map((a, i) => ({ ...a, i }))
          .sort((a, b) => LESSONS.findIndex((l) => l.slug === a.slug) - LESSONS.findIndex((l) => l.slug === b.slug) || a.i - b.i)
          .map((a, i) => {
            const lesson = LESSONS.find((l) => l.slug === a.slug)!
            return (
              <div key={`${runde}-${a.i}`}>
                <Exercise def={a.def} no={i + 1} />
                <p className="lp-hint" style={{ marginTop: 6 }}>
                  Wiederholen: <Link to={lessonPath(lesson.slug)}>Schritt {LESSONS.indexOf(lesson) + 1} – {lesson.title}</Link>
                </p>
              </div>
            )
          })}
      </div>
      <div className="bk-actions">
        <button type="button" className="bk-btn" onClick={neu}>
          <i className="fa-solid fa-shuffle" aria-hidden="true" /> Neuen Check zusammenstellen
        </button>
      </div>
    </Lesson>
  )
}
