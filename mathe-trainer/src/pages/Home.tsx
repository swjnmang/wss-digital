import { Link } from 'react-router-dom'
import ContentIndex from '../components/layout/ContentIndex'
import { EXAM, FOS } from '../data/areas'

// Startseite im Heft-Design: Begrüßung mit Heftskizze, Inhaltsverzeichnis, weitere Themen, kurze Anleitung und FAQ.
// Die FAQ-Texte stehen zusätzlich als FAQPage-Daten in index.html (für Suchmaschinen) – bei Änderungen beide anpassen.

const FAQ = [
  {
    q: 'Ist der Mathe-Trainer kostenlos?',
    a: 'Ja. Alle Übungen sind kostenlos und ohne Anmeldung nutzbar. Es werden keine persönlichen Daten gespeichert.',
  },
  {
    q: 'Für welche Schulart ist er gedacht?',
    a: 'Für die Wirtschaftsschule und die Vorbereitung auf die Abschlussprüfung – außerdem für die Vorklasse der FOS/BOS.',
  },
  {
    q: 'Funktioniert er auf dem Tablet?',
    a: 'Ja, mit eigener Mathe-Tastatur, damit die Aufgabe beim Tippen sichtbar bleibt.',
  },
]

const STEPS = [
  { title: 'Thema wählen', text: 'aus dem Inhalt oder über die Suche.' },
  { title: 'Rechnen und prüfen', text: 'Rückmeldung nach jeder Aufgabe.' },
  { title: 'Stufe steigern', text: 'bis zu Aufgaben im Stil der Abschlussprüfung.' },
]

const TEIL_A = EXAM.parts.find((p) => p.slug === 'rechnen-ohne-taschenrechner')

export default function Home() {
  return (
    <div className="bk-page bk-home">
      <section className="hm-hero" aria-labelledby="hm-title">
        <div className="hm-hero-text">
          <p className="hm-hello">Hallo! Schön, dass du da bist.</p>
          <h1 id="hm-title" className="hm-title">
            Mathe üben wie im Heft – nur mit <mark>sofortiger Rückmeldung</mark>
          </h1>
          <p className="hm-lead">
            Der kostenlose Mathe-Trainer für die Wirtschaftsschule: interaktive Übungen zu Brüchen, Prozentrechnung,
            Finanzmathematik, linearen und quadratischen Funktionen, Trigonometrie, Raum &amp; Form sowie Daten und
            Zufall. Ohne Anmeldung – einfach loslegen.
          </p>
          <div className="hm-actions">
            <a href="#inhalt" className="bk-btn bk-btn-primary">
              Jetzt üben <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </a>
            <a href="#weitere-themen" className="bk-btn">
              Abschlussprüfung vorbereiten
            </a>
          </div>
          <ul className="hm-checks">
            <li><i className="fa-solid fa-check" aria-hidden="true" />kostenlos</li>
            <li><i className="fa-solid fa-check" aria-hidden="true" />ohne Konto</li>
            <li><i className="fa-solid fa-check" aria-hidden="true" />Tablet, Handy und PC</li>
          </ul>
        </div>

        <figure className="hm-sketch">
          <div className="hm-sketch-sheet">
            <svg viewBox="0 0 400 320" role="img" aria-label="Skizze: Parabel mit Scheitelpunkt und eine Gerade im Koordinatensystem">
              <defs>
                <pattern id="hm-karo" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M20 0H0V20" fill="none" stroke="#e6ebf2" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="400" height="320" fill="url(#hm-karo)" />
              <path d="M20 200H390M100 310V10" stroke="#1b2433" strokeWidth="1.6" />
              <path d="M384 196l8 4-8 4M96 16l4-8 4 8" fill="none" stroke="#1b2433" strokeWidth="1.6" />
              <path d="M40 40 Q180 440 320 40" fill="none" stroke="#1d3f9e" strokeWidth="3" strokeLinecap="round" />
              <path d="M40 220 L370 0" stroke="#1e6b3d" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="180" cy="240" r="5" fill="#b8322a" />
              <text x="196" y="268" className="hm-hand" fontSize="24" fill="#b8322a">Scheitelpunkt S(4 | −2)</text>
              <text x="230" y="36" className="hm-hand" fontSize="26" fill="#1d3f9e">f(x) = (x − 4)² − 2</text>
              <text x="236" y="120" className="hm-hand" fontSize="24" fill="#1e6b3d">g(x) = ⅔x + 1</text>
            </svg>
          </div>
          <figcaption className="hm-note">Sehr gut – weiter so!</figcaption>
        </figure>
      </section>

      <section id="inhalt" className="hm-section" aria-labelledby="hm-inhalt">
        <div className="hm-head">
          <h2 id="hm-inhalt">Inhalt</h2>
          <span className="hm-hand-note">such dir ein Kapitel aus</span>
        </div>
        <ContentIndex showShort home />
      </section>

      <section id="weitere-themen" className="hm-section" aria-labelledby="hm-weitere">
        <h2 id="hm-weitere" className="hm-h2">Weitere Themen</h2>
        <div className="hm-cards">
          <Link to={EXAM.path} className="hm-card">
            <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
            <strong>{EXAM.title}</strong>
            <span>Alle Prüfungsteile, sortiert nach Bereich – von „Rechnen ohne Taschenrechner“ bis Trigonometrie.</span>
          </Link>
          <Link to={FOS.path} className="hm-card">
            <i className="fa-solid fa-school" aria-hidden="true" />
            <strong>{FOS.title}</strong>
            <span>Alle Themen der Vorklasse: Logik, Gleichungen, Funktionen, Geometrie, Stochastik.</span>
          </Link>
          {TEIL_A?.path && (
            <Link to={TEIL_A.path} className="hm-card">
              <i className="fa-solid fa-calculator" aria-hidden="true" />
              <strong>{TEIL_A.title}</strong>
              <span>Kopfrechnen für Teil A – als lockere Übung oder als Prüfungsblock.</span>
            </Link>
          )}
        </div>
      </section>

      <section className="hm-section hm-how" aria-labelledby="hm-so">
        <div>
          <h2 id="hm-so" className="hm-h2">So übst du hier</h2>
          <p className="hm-text">
            Jede Übung erzeugt neue Aufgaben. Du rechnest im Heft oder im Kopf, gibst dein Ergebnis ein und siehst
            sofort, ob es stimmt – mit Tipp und vollständigem Rechenweg, wenn es noch nicht klappt.
          </p>
        </div>
        <ol className="hm-steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="hm-step-no" aria-hidden="true">{i + 1}</span>
              <span><strong>{s.title}</strong> – {s.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="hm-section hm-faq" aria-labelledby="hm-faq">
        <h2 id="hm-faq" className="hm-h2">Häufige Fragen</h2>
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <footer className="bk-footer">
        © 2025 Mathenkik. Alle Rechte vorbehalten. · <Link to="/impressum">Impressum</Link>
      </footer>
    </div>
  )
}
