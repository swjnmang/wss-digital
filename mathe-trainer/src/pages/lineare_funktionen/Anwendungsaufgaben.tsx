import React from 'react'
import { Link } from 'react-router-dom'
import TaskShell from '../../components/layout/TaskShell'

export default function Anwendungsaufgaben() {
  const aufgaben = [
    { title: '1. Der Fußballplatz', desc: 'Löse Aufgaben rund um einen Pass auf einem Fußballfeld mit linearen Funktionen.', href: 'fussballplatz', icon: 'fa-solid fa-futbol' },
    { title: '2. Das Tipi', desc: 'Berechne die Maße eines Tipis anhand von zwei linearen Funktionsgleichungen.', href: 'tipi', icon: 'fa-solid fa-campground' },
    { title: '3. Der Berg', desc: 'Berechne Funktionsgleichungen und Schnittpunkte von Bergliften anhand eines Bergmassivs.', href: 'berg', icon: 'fa-solid fa-mountain' },
    { title: '4. Die Sonne', desc: 'Untersuche die Eigenschaften von Sonnenstrahlen mit Hilfe linearer Funktionen.', href: 'sonne', icon: 'fa-solid fa-sun' },
    { title: '5. Die Schrägseilbrücke', desc: 'Berechne Funktionsgleichungen und Schnittpunkte der Tragseile einer Brücke.', href: 'bruecke', icon: 'fa-solid fa-bridge' },
    { title: '6. Der Flughafen', desc: 'Untersuche zwei sich kreuzende Start- und Landebahnen mit linearen Funktionen.', href: 'flughafen', icon: 'fa-solid fa-plane' },
  ]

  return (
    <TaskShell title="Anwendungsaufgaben - Lineare Funktionen" subtitle="Wähle eine Aufgabe aus der folgenden Liste aus." width="wide">
      <div className="bk-tiles">
        {aufgaben.map((a) => (
          <Link key={a.title} to={`/lineare_funktionen/anwendungsaufgaben/${a.href}`} className="bk-tile-ex">
            <span className="bk-tile-top">
              <b>{a.title.split('.')[0]}</b>
              <i className={a.icon} aria-hidden="true" style={{ fontSize: 24 }} />
            </span>
            <strong>{a.title.replace(/^\d+\.\s*/, '')}</strong>
            <small>{a.desc}</small>
          </Link>
        ))}
      </div>
    </TaskShell>
  )
}
