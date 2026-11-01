import { Link } from 'react-router-dom'
import { AUFGABEN_JE_BEREICH, BEREICHE, DAUER_MINUTEN } from './aufgaben'
import './einstufungstest.css'

// Hinweiskarte oben auf der Seite „Rechnen lernen“: erst einstufen, dann gezielt üben.
export const EINSTUFUNGSTEST_PFAD = '/rechnen_lernen/einstufungstest'

export default function EinstufungstestKarte() {
  return (
    <Link to={EINSTUFUNGSTEST_PFAD} className="et-teaser">
      <i className="fa-solid fa-clipboard-check et-teaser-icon" aria-hidden="true" />
      <span className="et-teaser-text">
        <strong>Starte mit dem Einstufungstest</strong>
        <small>
          {BEREICHE.length * AUFGABEN_JE_BEREICH} Aufgaben aus allen Bereichen, {DAUER_MINUTEN} Minuten. Danach weißt du genau, welche Themen du schon kannst und
          wo du üben solltest.
        </small>
      </span>
      <span className="et-teaser-los">
        Test starten <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </span>
    </Link>
  )
}
