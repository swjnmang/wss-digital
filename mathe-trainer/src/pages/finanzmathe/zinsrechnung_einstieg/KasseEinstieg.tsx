import { useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { VideoEmbed } from '../../../components/VideoButton'
import { Beispiel, M, MB, Merke, Vorgehen, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { Arbeitsweise, CardHead, CheckCard, Hilfen, McCard } from '../../lineare_funktionen/lernsituation_kit/kit'
import { Etappe, Fortschritt, Teil } from '../../lineare_funktionen/lernsituation_kit/phasen'
import { VIDEO_ZINSEN } from './BankEinstieg'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './pinnwand.css'

// Lernsituation Zinsrechnung Teil 2 „Die Abschlussfahrt-Kasse“: Kapital, Zinssatz und Zinstage berechnen (90 min).
// Format Gruppenpuzzle, Look Klassen-Pinnwand mit Kacheln (Expertengruppen frei wählbar), Lernprodukt digital (eigene Aufgabe erstellen).
// Instruktionsreihenfolge: Beispiel zuerst. Die SuS kennen aus Teil 1 die Formel Z = K · p · t / (100 · 360), sind beim Umstellen
// von Gleichungen aber unsicher. Darum bekommt jede Expertengruppe ein ausgearbeitetes Beispiel mit demselben Umstell-Trick
// (erst · 100 · 360, dann durch die beiden anderen Größen teilen) und rechnet danach selbst.
// Es wird immer tagesgenau gerechnet (jeder Monat 30 Zinstage, das Jahr 360).
// Aha: 3.600 € zu 3 % p.a. bringen in 180 Tagen nicht 108 €, sondern nur 54 €. Für 72 € braucht die Klasse 4.800 €.
// Phasen: Aktivieren → Pinnwand & Festlegung → Expertenphase → Stammgruppe → Austausch → Sichern & Lernprodukt → Check.
// Die Festlegung bleibt nur im Seitenzustand (kein Speichern).

export const VIDEO_KPT = 'https://www.youtube.com/watch?v=uz5l8_O1dxs'

/* ── Situation ───────────────────────────────────────────────────────────── */

// Klasse 10b, 24 SuS. Geld liegt vom 01.02. bis zum 01.08. auf dem Tagesgeld: 180 Zinstage, 3 % p.a.
// In der Kasse sind schon 3.600 € (150 € pro Person). Ziel: 72 € Zinsen für das Abschlussgrillen.
// 3.600 € bringen nur 54 €. Für 72 € braucht man 4.800 € (200 € pro Person) oder 240 Tage oder 4 % p.a.
const T = 180
const ZIEL = 72
const KASSE = 3600
const ZINS_KASSE = (KASSE * 3 * T) / 36000
const K_NOETIG = (ZIEL * 36000) / (3 * T)

type Choice = 'ja' | 'nein'
type Prediction = { choice: Choice | null; kapital: number; saved: boolean }

const CHOICE_TEXT: Record<Choice, string> = {
  ja: 'Ja, die 3.600 € in der Kasse reichen für 72 € Zinsen',
  nein: 'Nein, die 3.600 € reichen nicht',
}

const euro = (v: number) => `${fmt(v, 2, true)} €`

/* ── Expertengruppen ─────────────────────────────────────────────────────── */

type Gesucht = 'K' | 'p' | 't'

const EXPERTEN: Record<Gesucht, { name: string; frage: string; teiler: string; formel: string; einheit: string }> = {
  K: { name: 'Kapital K', frage: 'Wie viel Geld muss angelegt werden?', teiler: 'p \\cdot t', formel: 'K = \\frac{Z \\cdot 100 \\cdot 360}{p \\cdot t}', einheit: '€' },
  p: { name: 'Zinssatz p', frage: 'Welcher Zinssatz steckt dahinter?', teiler: 'K \\cdot t', formel: 'p = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot t}', einheit: '% p.a.' },
  t: { name: 'Zinstage t', frage: 'Wie lange muss das Geld liegen?', teiler: 'K \\cdot p', formel: 't = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot p}', einheit: 'Tage' },
}

/** Ausgearbeitetes Beispiel für eine Expertengruppe */
function ExpertenBeispiel({ g }: { g: Gesucht }) {
  const e = EXPERTEN[g]
  const daten: Record<Gesucht, { aufgabe: ReactNode; einsetzen: string; ergebnis: string; antwort: string }> = {
    K: {
      aufgabe: <p>Ein Sparkonto zahlt 2 % p.a. Wie viel Geld muss man anlegen, damit es in 120 Tagen 30 € Zinsen gibt?</p>,
      einsetzen: 'K = \\frac{30 \\cdot 100 \\cdot 360}{2 \\cdot 120}',
      ergebnis: 'K = \\frac{1\\,080\\,000}{240} = 4\\,500',
      antwort: 'Man muss 4.500 € anlegen.',
    },
    p: {
      aufgabe: <p>3.000 € liegen 90 Tage auf einem Konto und bringen 15 € Zinsen. Wie hoch ist der Zinssatz?</p>,
      einsetzen: 'p = \\frac{15 \\cdot 100 \\cdot 360}{3\\,000 \\cdot 90}',
      ergebnis: 'p = \\frac{540\\,000}{270\\,000} = 2',
      antwort: 'Der Zinssatz beträgt 2 % p.a.',
    },
    t: {
      aufgabe: <p>6.000 € werden zu 2 % p.a. angelegt. Nach wie vielen Tagen gibt es 20 € Zinsen?</p>,
      einsetzen: 't = \\frac{20 \\cdot 100 \\cdot 360}{6\\,000 \\cdot 2}',
      ergebnis: 't = \\frac{720\\,000}{12\\,000} = 60',
      antwort: 'Nach 60 Tagen gibt es 20 € Zinsen.',
    },
  }
  const d = daten[g]
  return (
    <Beispiel
      title={`${e.name} berechnen`}
      aufgabe={d.aufgabe}
      steps={[
        { title: 'Formel aufschreiben', body: <MB>{'Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360}'}</MB> },
        {
          title: 'Bruch loswerden',
          body: (
            <>
              <p>Beide Seiten mal 100 · 360 nehmen. Dann steht auf der rechten Seite kein Bruch mehr:</p>
              <MB>{'Z \\cdot 100 \\cdot 360 = K \\cdot p \\cdot t'}</MB>
            </>
          ),
        },
        {
          title: `Nach ${g} auflösen`,
          body: (
            <>
              <p>
                Rechts steht <M>{g}</M> mal <M>{e.teiler}</M>. Teile beide Seiten durch <M>{e.teiler}</M>:
              </p>
              <MB>{e.formel}</MB>
            </>
          ),
        },
        { title: 'Einsetzen', body: <MB>{d.einsetzen}</MB> },
        {
          title: 'Ausrechnen und Antwort',
          body: (
            <>
              <MB>{d.ergebnis}</MB>
              <p>{d.antwort}</p>
            </>
          ),
        },
      ]}
    />
  )
}

/** Eigene Aufgabe einer Expertengruppe */
function ExpertenAufgabe({ g }: { g: Gesucht }) {
  if (g === 'K')
    return (
      <CheckCard
        title="Jetzt ihr: Kapital berechnen"
        level="basis"
        prompt={
          <p>
            Der Sportverein möchte in 150 Tagen 45 € Zinsen für neue Bälle bekommen. Das Tagesgeld zahlt 2,5 % p.a. Wie viel Geld muss der Verein anlegen?
          </p>
        }
        fields={[{ kind: 'num', key: 'k', label: <M>{'K ='}</M>, expected: 4320, unit: '€' }]}
        solution={
          <>
            <MB>{'K = \\frac{Z \\cdot 100 \\cdot 360}{p \\cdot t} = \\frac{45 \\cdot 100 \\cdot 360}{2{,}5 \\cdot 150} = \\frac{1\\,620\\,000}{375} = 4\\,320'}</MB>
            <p>Der Verein muss 4.320 € anlegen.</p>
          </>
        }
        help={
          <Hilfen
            steps={[
              <>Welche Größen sind gegeben? Schreibt sie auf: Z = …, p = …, t = … Gesucht ist K.</>,
              <>Nehmt die Formel für K aus dem Beispiel: Oben steht Z · 100 · 360, unten p · t.</>,
              <>
                <M>{'K = \\frac{45 \\cdot 100 \\cdot 360}{2{,}5 \\cdot 150}'}</M>. Rechnet erst oben und unten getrennt aus, dann teilt ihr.
              </>,
            ]}
          />
        }
      />
    )
  if (g === 'p')
    return (
      <CheckCard
        title="Jetzt ihr: Zinssatz berechnen"
        level="basis"
        prompt={
          <p>
            Der Sportverein hat 4.320 € für 150 Tage angelegt und 54 € Zinsen bekommen. Welcher Zinssatz war das?
          </p>
        }
        fields={[{ kind: 'num', key: 'p', label: <M>{'p ='}</M>, expected: 3, unit: '% p.a.' }]}
        solution={
          <>
            <MB>{'p = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot t} = \\frac{54 \\cdot 100 \\cdot 360}{4\\,320 \\cdot 150} = \\frac{1\\,944\\,000}{648\\,000} = 3'}</MB>
            <p>Der Zinssatz war 3 % p.a.</p>
          </>
        }
        help={
          <Hilfen
            steps={[
              <>Welche Größen sind gegeben? Schreibt sie auf: K = …, t = …, Z = … Gesucht ist p.</>,
              <>Nehmt die Formel für p aus dem Beispiel: Oben steht Z · 100 · 360, unten K · t.</>,
              <>
                <M>{'p = \\frac{54 \\cdot 100 \\cdot 360}{4\\,320 \\cdot 150}'}</M>. Rechnet erst oben und unten getrennt aus, dann teilt ihr.
              </>,
            ]}
          />
        }
      />
    )
  return (
    <CheckCard
      title="Jetzt ihr: Zinstage berechnen"
      level="basis"
      prompt={
        <p>
          Der Sportverein legt 4.320 € zu 2,5 % p.a. an. Nach wie vielen Tagen hat er 60 € Zinsen?
        </p>
      }
      fields={[{ kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 200, unit: 'Tage' }]}
      solution={
        <>
          <MB>{'t = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot p} = \\frac{60 \\cdot 100 \\cdot 360}{4\\,320 \\cdot 2{,}5} = \\frac{2\\,160\\,000}{10\\,800} = 200'}</MB>
          <p>Nach 200 Tagen hat der Verein 60 € Zinsen.</p>
        </>
      }
      help={
        <Hilfen
          steps={[
            <>Welche Größen sind gegeben? Schreibt sie auf: K = …, p = …, Z = … Gesucht ist t.</>,
            <>Nehmt die Formel für t aus dem Beispiel: Oben steht Z · 100 · 360, unten K · p.</>,
            <>
              <M>{'t = \\frac{60 \\cdot 100 \\cdot 360}{4\\,320 \\cdot 2{,}5}'}</M>. Rechnet erst oben und unten getrennt aus, dann teilt ihr.
            </>,
          ]}
        />
      }
    />
  )
}

function Expertenphase() {
  const [g, setG] = useState<Gesucht>('K')
  const e = EXPERTEN[g]
  return (
    <>
      <div className="pw-tiles" role="group" aria-label="Expertengruppe wählen">
        {(['K', 'p', 't'] as const).map((x) => (
          <button key={x} type="button" className="pw-tile" aria-pressed={g === x} onClick={() => setG(x)}>
            <span className="pw-tile-letter">{x}</span>
            <strong>Gruppe {EXPERTEN[x].name}</strong>
            <small>{EXPERTEN[x].frage}</small>
          </button>
        ))}
      </div>
      <div className="pw-expert">
        <h3 className="pw-expert-title">
          Expertengruppe {e.name}: {e.frage}
        </h3>
        <p>
          <strong>1. Video ansehen:</strong> Im Erklärvideo seht ihr, wie man die Zinsformel nach K, p und t umstellt. Achtet besonders auf <M>{g}</M>.
        </p>
        <VideoEmbed src={VIDEO_KPT} title="Erklärvideo: Kapital, Zinssatz und Zinstage berechnen" />
        <p>
          <strong>2. Beispiel nachvollziehen:</strong> Deckt die Schritte nacheinander auf. Erklärt euch gegenseitig jeden Schritt, bevor ihr den nächsten öffnet.
        </p>
        <ExpertenBeispiel g={g} />
        <p>
          <strong>3. Selbst rechnen:</strong>
        </p>
        <ExpertenAufgabe g={g} />
        <div className="pw-tell">
          <strong>4. Das erklärst du gleich deiner Stammgruppe:</strong>
          <ul>
            <li>
              Die Formel für <M>{g}</M>: <M>{e.formel}</M>
            </li>
            <li>Wie man vom Ausgangspunkt dorthin kommt: erst mal 100 · 360, dann durch die beiden anderen Größen teilen.</li>
            <li>
              Eine Probe: Setzt euer Ergebnis in die Zinsformel ein. Kommen wieder die Zinsen heraus?
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}

/* ── Aufgaben-Baukasten (Lernprodukt) ───────────────────────────────────── */

function Baukasten() {
  const [text, setText] = useState('')
  const [g, setG] = useState<Gesucht>('K')
  const [werte, setWerte] = useState<Record<'Z' | Gesucht, string>>({ Z: '', K: '', p: '', t: '' })
  const [loesungAuf, setLoesungAuf] = useState(false)

  const gegeben = (['Z', 'K', 'p', 't'] as const).filter((x) => x !== g)
  const zahl = (x: 'Z' | Gesucht) => parseInput(werte[x])?.value
  const vals = gegeben.map(zahl)
  const vollstaendig = vals.every((v) => v !== undefined && v > 0)
  let ergebnis: number | null = null
  if (vollstaendig) {
    const Z = zahl('Z')!
    if (g === 'K') ergebnis = (Z * 36000) / (zahl('p')! * zahl('t')!)
    if (g === 'p') ergebnis = (Z * 36000) / (zahl('K')! * zahl('t')!)
    if (g === 't') ergebnis = (Z * 36000) / (zahl('K')! * zahl('p')!)
  }
  const p = g === 'p' ? ergebnis : zahl('p')
  const t = g === 't' ? ergebnis : zahl('t')
  const warnungen: string[] = []
  if (vollstaendig && p !== undefined && p !== null && p > 6) warnungen.push('Der Zinssatz ist höher als 6 % p.a. Das ist für ein Sparkonto unrealistisch.')
  if (vollstaendig && t !== undefined && t !== null && t > 360) warnungen.push('Die Laufzeit ist länger als ein Jahr. Für diese Formel sollten es höchstens 360 Tage sein.')

  const label: Record<'Z' | Gesucht, string> = { Z: 'Zinsen Z in €', K: 'Kapital K in €', p: 'Zinssatz p in % p.a.', t: 'Zinstage t' }

  return (
    <div className="pw-builder" data-no-autocheck>
      <div className="ls-field">
        <label className="ls-label" htmlFor="pw-gesucht">
          Gesucht ist:
        </label>
        <select
          id="pw-gesucht"
          className="bk-input lp-select"
          value={g}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setG(e.target.value as Gesucht)
            setLoesungAuf(false)
          }}
        >
          <option value="K">das Kapital K</option>
          <option value="p">der Zinssatz p</option>
          <option value="t">die Zinstage t</option>
        </select>
      </div>
      <div className="pw-builder-row">
        {gegeben.map((x) => (
          <div key={x} className="ls-field">
            <label className="ls-label" htmlFor={`pw-${x}`}>
              {label[x]}:
            </label>
            <input
              id={`pw-${x}`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              className="bk-input lp-input lp-input-md"
              value={werte[x]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setWerte({ ...werte, [x]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="ls-label" htmlFor="pw-text">
          Dein Aufgabentext (mit einer kleinen Geschichte und einer klaren Frage):
        </label>
        <textarea id="pw-text" className="bk-input" value={text} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)} placeholder="Zum Beispiel: Mira spart für ein Festival-Ticket …" />
      </div>
      <div className="pw-preview">
        <strong>So sieht deine Aufgabe aus:</strong>
        <p>{text.trim() || 'Hier erscheint dein Aufgabentext.'}</p>
        {warnungen.map((w) => (
          <p key={w} className="pw-warn">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> {w}
          </p>
        ))}
        {ergebnis !== null && (
          <div>
            <button type="button" className="bk-btn bk-btn-sm" onClick={() => setLoesungAuf((o) => !o)}>
              <i className="fa-solid fa-key" aria-hidden="true" /> {loesungAuf ? 'Lösung verbergen' : 'Lösung für dich anzeigen'}
            </button>
          </div>
        )}
        {loesungAuf && ergebnis !== null && (
          <p>
            <M>{EXPERTEN[g].formel}</M> ergibt <strong>
              {g === 'K' ? euro(ergebnis) : `${fmt(ergebnis, 2)} ${EXPERTEN[g].einheit}`}
            </strong>
            .{' '}
            {g === 't' && Math.abs(ergebnis - Math.round(ergebnis)) > 1e-9 ? 'Tipp: Wähle die Zahlen so, dass ganze Tage herauskommen.' : ''}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function KasseEinstieg({ onBack, onPractice, onPrev }: { onBack: () => void; onPractice: () => void; onPrev: () => void }) {
  const [pred, setPred] = useState<Prediction>({ choice: null, kapital: 4000, saved: false })

  return (
    <TaskShell title="Zinsrechnung" subtitle="Lernsituation Teil 2: Die Abschlussfahrt-Kasse" width="wide">
      <div className="lp">
        <div>
          <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
          </button>
        </div>
        <div className="lp-goal">
          <i className="fa-solid fa-bullseye" aria-hidden="true" />
          <div>
            <strong>Das lernst du hier:</strong> Du stellst die Zinsformel um und berechnest damit das Kapital <M>K</M>, den Zinssatz <M>p</M> und die Zinstage <M>t</M>.
            Ihr arbeitet als Gruppenpuzzle: Erst wirst du Expertin oder Experte für eine Größe, dann löst ihr in der Stammgruppe gemeinsam einen echten Fall.
          </div>
        </div>
        <Arbeitsweise />

        {/* 1 Aktivieren */}
        <Fortschritt prefix="kasse" />

        <Etappe
          prefix="kasse"
          art="start"
          social="EA"
          minutes={8}
          was={<>Kurze Aufgaben allein lösen.</>}
          wozu={<>Du frischst auf, was du gleich zum Lösen des Problems brauchst.</>}
        >
          <p>Diese Aufgaben brauchst du gleich. Löse sie allein.</p>
          <div className="lp-exlist">
            <CheckCard
              title="a) Zinsen berechnen (aus Teil 1)"
              prompt={<p>2.400 € liegen 90 Tage zu 2 % p.a. auf einem Konto. Wie viel Zinsen gibt es?</p>}
              fields={[{ kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 12, unit: '€' }]}
              solution={<MB>{'Z = \\frac{2\\,400 \\cdot 2 \\cdot 90}{100 \\cdot 360} = \\frac{432\\,000}{36\\,000} = 12 \\text{ €}'}</MB>}
              help={
                <div className="ls-help">
                  <p className="lp-hint">Unsicher? Im Video aus Teil 1 siehst du noch einmal, wie du die Zinsen berechnest.</p>
                  <VideoEmbed src={VIDEO_ZINSEN} title="Erklärvideo: Zinsen berechnen" />
                </div>
              }
            />
            <CheckCard
              title="b) Gleichungen umstellen"
              prompt={
                <p>
                  Löse beide Gleichungen nach <M>x</M> auf: <M>{'4 \\cdot x = 120'}</M> und <M>{'\\frac{x \\cdot 5}{10} = 4'}</M>.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'a', label: <>erste: <M>{'x ='}</M></>, expected: 30 },
                { kind: 'num', key: 'b', label: <>zweite: <M>{'x ='}</M></>, expected: 8 },
              ]}
              solution={
                <>
                  <MB>{'4 \\cdot x = 120 \\quad \\mid :4 \\qquad x = 30'}</MB>
                  <MB>{'\\frac{x \\cdot 5}{10} = 4 \\quad \\mid \\cdot 10 \\qquad x \\cdot 5 = 40 \\quad \\mid :5 \\qquad x = 8'}</MB>
                  <p>Merke: Einen Bruch wirst du los, indem du mit dem Nenner malnimmst. Danach teilst du durch die Zahl, die bei x steht.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Was passiert mit x? Bei der ersten Gleichung wird x mit 4 malgenommen. Was ist die Umkehrung davon?</>,
                    <>Bei der zweiten Gleichung: Zuerst den Bruch loswerden (beide Seiten mal 10), dann durch 5 teilen.</>,
                    <>
                      <M>{'x \\cdot 5 = 4 \\cdot 10 = 40'}</M>. Jetzt noch durch 5 teilen.
                    </>,
                  ]}
                />
              }
            />
            <CheckCard
              title="c) Zinstage"
              prompt={<p>Wie viele Zinstage liegen zwischen dem 01.02. und dem 01.08.? (Bankregel: jeder Monat 30 Tage)</p>}
              fields={[{ kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 180, unit: 'Tage' }]}
              solution={<MB>{'6 \\cdot 30 = 180 \\text{ Tage}'}</MB>}
            />
          </div>
        </Etappe>

        {/* 2 Pinnwand & Festlegung */}
        <Etappe
          prefix="kasse"
          art="problem"
          social="Plenum"
          minutes={7}
          was={<>Die Situation lesen und deine Vermutung festhalten. Noch nicht rechnen.</>}
          wozu={<>Du weißt genau, welche Frage du in Phase 3 beantwortest.</>}
        >
          <Teil title="Die Pinnwand der Klasse 10b">
            <p>
              Die Klasse 10b (24 Schülerinnen und Schüler) fährt im Sommer auf Abschlussfahrt. Das Geld dafür liegt vom <strong>01.02.</strong> bis zum <strong>01.08.</strong> auf einem
              Tagesgeldkonto mit <strong>3 % p.a.</strong> Von den Zinsen soll das Abschlussgrillen bezahlt werden: <strong>72 €</strong>. An der Pinnwand hängen drei Fragen.
            </p>
            <div className="pw-board">
              <h3 className="pw-board-title">
                <i className="fa-solid fa-thumbtack" aria-hidden="true" /> Abschlussfahrt 10b
              </h3>
              <div className="pw-notes">
                <div className="pw-note pw-note-K">
                  <span className="pw-note-from">Emma, Klassensprecherin</span>
                  <p>„Wie viel Geld muss in der Kasse liegen, damit bis zum 01.08. genau 72 € Zinsen zusammenkommen? Wie viel muss dann jede und jeder einzahlen?“</p>
                </div>
                <div className="pw-note pw-note-p">
                  <span className="pw-note-from">Noah, Kassenwart</span>
                  <p>„Eine andere Bank verspricht: 4.800 € bringen in 180 Tagen 84 € Zinsen. Welcher Zinssatz ist das?“</p>
                </div>
                <div className="pw-note pw-note-t">
                  <span className="pw-note-from">Frau Yilmaz, Klassenleitung</span>
                  <p>„In der Kasse liegen schon 3.600 €. Wie lange müssten die bei 3 % liegen, bis 72 € Zinsen zusammen sind?“</p>
                </div>
              </div>
            </div>
            <div className="ls-question">
              <i className="fa-solid fa-circle-question" aria-hidden="true" />
              <span>Reicht das Geld in der Kasse für das Abschlussgrillen, und wenn nicht, was muss die Klasse tun?</span>
            </div>

            <div className="lp-ex bk-panel" data-no-autocheck>
              <CardHead title="Deine Vermutung" />
              {pred.saved && pred.choice ? (
                <>
                  <div className="ls-saved" role="status">
                    <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: <strong>{CHOICE_TEXT[pred.choice]}</strong>. Deine Schätzung: Für 72 € Zinsen braucht die Klasse
                    etwa <strong>{fmt(pred.kapital, 0)} €</strong>. Am Ende schauen wir, ob du recht hattest.
                  </div>
                  <div>
                    <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setPred({ ...pred, saved: false })}>
                      Vermutung ändern
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>Rechne noch nicht! Entscheide spontan. Die Klasse stimmt kurz per Handzeichen ab.</p>
                  <div className="ls-options" role="radiogroup" aria-label="Reichen die 3.600 €?">
                    {(['ja', 'nein'] as const).map((c) => (
                      <label key={c} className="bk-choice ls-option">
                        <input type="radio" name="kasse-pred" checked={pred.choice === c} onChange={() => setPred({ ...pred, choice: c })} />
                        <span>{CHOICE_TEXT[c]}</span>
                      </label>
                    ))}
                  </div>
                  <div className="ls-slider">
                    <label htmlFor="kasse-pred-k">
                      Ich schätze: Für 72 € Zinsen bis zum 01.08. braucht die Klasse insgesamt etwa <span className="ls-slider-value">{fmt(pred.kapital, 0)} €</span>.
                    </label>
                    <input
                      id="kasse-pred-k"
                      type="range"
                      min={500}
                      max={10000}
                      step={100}
                      value={pred.kapital}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPred({ ...pred, kapital: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <button type="button" className="bk-btn bk-btn-primary" disabled={!pred.choice} onClick={() => setPred({ ...pred, saved: true })}>
                      <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festhalten
                    </button>
                  </div>
                </>
              )}
            </div>
          </Teil>
        </Etappe>

        {/* 3 Expertenphase */}
        <Etappe
          prefix="kasse"
          art="loesen"
          minutes={45}
          was={<>In der Expertengruppe eine Größe erarbeiten, dann in der Stammgruppe die Fragen der Pinnwand lösen.</>}
          wozu={<>So berechnest du Kapital, Zinssatz oder Zinstage, wenn die anderen Größen bekannt sind.</>}
        >
          <Teil title="Expertenphase: Werdet Profis für eine Größe" social="GA" minutes={25}>
            <div className="lp-ex bk-panel">
              <CardHead title="So läuft das Gruppenpuzzle" />
              <ol>
                <li>
                  Bildet <strong>Stammgruppen</strong> zu dritt. Jede Person wählt eine andere Kachel: <M>K</M>, <M>p</M> oder <M>t</M>.
                </li>
                <li>
                  Alle mit derselben Kachel setzen sich zu einer <strong>Expertengruppe</strong> zusammen (2 bis 4 Personen) und arbeiten die Schritte 1 bis 4 durch.
                </li>
                <li>Danach geht jede Person zurück in ihre Stammgruppe und erklärt dort ihre Größe (Abschnitt 4).</li>
              </ol>
              <p className="lp-hint">Du arbeitest allein? Dann bearbeite nacheinander alle drei Kacheln.</p>
            </div>
            <div className="lp-ex bk-panel">
              <CardHead title="Infokarte für alle: Der Umstell-Trick" />
              <p>Egal, ob ihr K, p oder t sucht: Ihr geht immer gleich vor.</p>
              <Vorgehen
                steps={[
                  <>
                    <strong>Bruch loswerden:</strong> Beide Seiten der Zinsformel mal 100 · 360 nehmen. Es entsteht <M>{'Z \\cdot 100 \\cdot 360 = K \\cdot p \\cdot t'}</M>.
                  </>,
                  <>
                    <strong>Gesuchte Größe freistellen:</strong> Durch die beiden anderen Größen auf der rechten Seite teilen.
                  </>,
                  <>
                    <strong>Einsetzen, ausrechnen, Probe:</strong> Ergebnis in die Zinsformel einsetzen. Es müssen wieder die Zinsen herauskommen.
                  </>,
                ]}
              />
            </div>
            <Expertenphase />
          </Teil>


        {/* 4 Stammgruppe */}
          <Teil title="Stammgruppe: Löst die Fragen an der Pinnwand" social="GA" minutes={20}>
            <p>
              <strong>Auftrag:</strong> Ihr seid wieder in eurer Stammgruppe. Jede Frage gehört einer Expertin oder einem Experten: Sie oder er erklärt den Rechenweg, die anderen
              rechnen mit und tragen das Ergebnis ein.
            </p>
            <div className="lp-exlist">
              <CheckCard
                title="Emmas Frage · Expertin oder Experte K erklärt"
                level="standard"
                prompt={
                  <p>
                    Wie viel Geld muss in der Kasse liegen, damit es vom 01.02. bis zum 01.08. (180 Tage) bei 3 % p.a. genau 72 € Zinsen gibt? Wie viel muss dann jede der 24
                    Personen einzahlen?
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'k', label: <M>{'K ='}</M>, expected: K_NOETIG, unit: '€' },
                  { kind: 'num', key: 'pp', label: 'pro Person:', expected: K_NOETIG / 24, unit: '€' },
                ]}
                solution={
                  <>
                    <MB>{'K = \\frac{72 \\cdot 100 \\cdot 360}{3 \\cdot 180} = \\frac{2\\,592\\,000}{540} = 4\\,800'}</MB>
                    <MB>{'4\\,800 \\text{ €} : 24 = 200 \\text{ €}'}</MB>
                    <p>Probe: <M>{'\\frac{4\\,800 \\cdot 3 \\cdot 180}{36\\,000} = 72'}</M> ✓</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Gesucht ist das Kapital. Welche Werte kennt ihr? Z = 72 €, p = 3, t = 180.</>,
                      <>Nehmt die Formel für K aus der Expertenphase und setzt ein. Danach teilt ihr das Kapital durch 24.</>,
                      <>
                        <M>{'K = \\frac{72 \\cdot 100 \\cdot 360}{3 \\cdot 180}'}</M>
                      </>,
                    ]}
                  />
                }
              />
              <CheckCard
                title="Noahs Frage · Expertin oder Experte p erklärt"
                level="standard"
                prompt={<p>Eine andere Bank verspricht: 4.800 € bringen in 180 Tagen 84 € Zinsen. Welcher Zinssatz steckt dahinter?</p>}
                fields={[{ kind: 'num', key: 'p', label: <M>{'p ='}</M>, expected: 3.5, unit: '% p.a.' }]}
                solution={
                  <>
                    <MB>{'p = \\frac{84 \\cdot 100 \\cdot 360}{4\\,800 \\cdot 180} = \\frac{3\\,024\\,000}{864\\,000} = 3{,}5'}</MB>
                    <p>Die andere Bank zahlt 3,5 % p.a.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Gesucht ist der Zinssatz. Welche Werte kennt ihr? K = 4.800 €, t = 180, Z = 84 €.</>,
                      <>Nehmt die Formel für p: oben Z · 100 · 360, unten K · t.</>,
                      <>
                        <M>{'p = \\frac{84 \\cdot 100 \\cdot 360}{4\\,800 \\cdot 180}'}</M>
                      </>,
                    ]}
                  />
                }
              />
              <CheckCard
                title="Frau Yilmaz’ Frage · Expertin oder Experte t erklärt"
                level="standard"
                prompt={<p>In der Kasse liegen schon 3.600 € zu 3 % p.a. Wie viele Tage müssten sie liegen, bis 72 € Zinsen zusammen sind? Reicht die Zeit bis zum 01.08.?</p>}
                fieldsRow
                fields={[
                  { kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 240, unit: 'Tage' },
                  { kind: 'select', key: 'r', label: 'Reicht die Zeit?', options: ['Ja, 180 Tage genügen', 'Nein, 180 Tage sind zu wenig'], expected: 1 },
                ]}
                solution={
                  <>
                    <MB>{'t = \\frac{72 \\cdot 100 \\cdot 360}{3\\,600 \\cdot 3} = \\frac{2\\,592\\,000}{10\\,800} = 240'}</MB>
                    <p>Das Geld müsste 240 Tage liegen, bis zum 01.08. sind es aber nur 180 Tage. In 180 Tagen bringen die 3.600 € nur 54 €.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Gesucht sind die Zinstage. Welche Werte kennt ihr? K = 3.600 €, p = 3, Z = 72 €.</>,
                      <>Nehmt die Formel für t: oben Z · 100 · 360, unten K · p. Vergleicht das Ergebnis mit den 180 Tagen bis zum 01.08.</>,
                      <>
                        <M>{'t = \\frac{72 \\cdot 100 \\cdot 360}{3\\,600 \\cdot 3}'}</M>
                      </>,
                    ]}
                  />
                }
              />
              <McCard
                title="Eure Empfehlung für die Klasse"
                prompt={<p>Was empfehlt ihr der Klasse 10b, damit das Abschlussgrillen bis zum 01.08. bezahlt ist?</p>}
                options={[
                  {
                    text: 'Jede Person zahlt 200 € statt 150 € ein. Dann liegen 4.800 € in der Kasse, und es gibt genau 72 € Zinsen. Bei der anderen Bank wären es sogar 84 €.',
                    correct: true,
                    feedback: 'Mit 4.800 € reicht es: bei 3 % genau 72 €, bei 3,5 % sogar 84 €.',
                  },
                  {
                    text: 'Nichts ändern: 3 % von 3.600 € sind 108 €, das reicht locker.',
                    feedback: '108 € gäbe es nur für ein ganzes Jahr. Das Geld liegt aber nur 180 Tage, das bringt 54 €.',
                  },
                  {
                    text: 'Das Geld einfach bis zum 01.08. liegen lassen, denn 240 Tage sind weniger als ein halbes Jahr.',
                    feedback: '240 Tage sind 8 Monate, also mehr als ein halbes Jahr. Bis zum 01.08. sind es nur 180 Tage.',
                  },
                  {
                    text: 'Jede Person zahlt 1 € mehr ein, das reicht für die fehlenden 18 €.',
                    feedback: '24 € mehr Kapital bringen in 180 Tagen nur wenige Cent Zinsen. Für 18 € mehr Zinsen braucht man 1.200 € mehr Kapital.',
                  },
                ]}
              />
              <CheckCard
                title="Für Profis: Welcher Zinssatz würde reichen?"
                level="erweiterung"
                prompt={
                  <p>
                    Die Klasse will nicht mehr einzahlen. Welchen Zinssatz bräuchten die 3.600 €, damit sie in 180 Tagen 72 € Zinsen bringen? Begründet im Heft, ob so ein Angebot
                    realistisch ist.
                  </p>
                }
                fields={[{ kind: 'num', key: 'p', label: <M>{'p ='}</M>, expected: 4, unit: '% p.a.' }]}
                solution={
                  <>
                    <MB>{'p = \\frac{72 \\cdot 100 \\cdot 360}{3\\,600 \\cdot 180} = \\frac{2\\,592\\,000}{648\\,000} = 4'}</MB>
                    <p>Es bräuchte 4 % p.a. Das bieten Tagesgeldkonten derzeit kaum an, darum ist mehr Kapital der sicherere Weg.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Diesmal ist p gesucht. Welche drei Werte kennt ihr?</>,
                      <>K = 3.600 €, t = 180, Z = 72 €. Nehmt die Formel für p.</>,
                      <>
                        <M>{'p = \\frac{72 \\cdot 100 \\cdot 360}{3\\,600 \\cdot 180}'}</M>
                      </>,
                    ]}
                  />
                }
              />
            </div>
          </Teil>


        </Etappe>

        {/* 6 Sichern & Lernprodukt */}
        <Etappe
          prefix="kasse"
          art="sichern"
          social="EA"
          minutes={22}
          was={<>Das Wichtigste in deinem Heft festhalten und dann allein prüfen, ob du es kannst.</>}
          wozu={<>Dein Hefteintrag hilft dir bei allen Aufgaben dieser Art. Der Check zeigt dir, wo du noch unsicher bist.</>}
        >
          <Teil title="Das hältst du fest" social="EA" minutes={12}>
            <Rueckbezug pred={pred} />
            <Merke title="Die Zinsformel umstellen">
              <p>Aus der Zinsformel wird durch „mal 100 · 360“ eine Gleichung ohne Bruch. Teilst du dann durch die beiden anderen Größen, erhältst du:</p>
              <div className="pw-formulas">
                <div>
                  <MB>{'Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360}'}</MB>
                </div>
                <div>
                  <MB>{'K = \\frac{Z \\cdot 100 \\cdot 360}{p \\cdot t}'}</MB>
                </div>
                <div>
                  <MB>{'p = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot t}'}</MB>
                </div>
                <div>
                  <MB>{'t = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot p}'}</MB>
                </div>
              </div>
              <ul>
                <li>Immer tagesgenau rechnen: t in Tagen, jeder Monat 30 Tage, das Jahr 360 Tage.</li>
                <li>Probe: Ergebnis in die Zinsformel einsetzen. Es müssen wieder die Zinsen herauskommen.</li>
                <li>Größenordnung prüfen: Für wenige Euro Zinsen braucht man viel Kapital oder viel Zeit.</li>
              </ul>
            </Merke>
            <div className="lp-ex bk-panel">
              <CardHead title="Dein Lernprodukt: Erfinde eine Aufgabe für die Pinnwand" />
              <p>
                Erfinde eine eigene Zinsaufgabe, bei der <M>K</M>, <M>p</M> oder <M>t</M> gesucht ist. Der Baukasten rechnet die Lösung für dich aus. Tauscht danach eure Aufgaben in der
                Stammgruppe und löst sie im Heft. Hake ab, was deine Aufgabe erfüllt:
              </p>
              <div className="ls-criteria">
                {[
                  'Eine kleine Geschichte aus deinem Alltag und eine klare Frage',
                  'Genau eine gesuchte Größe, die anderen drei sind gegeben',
                  'Realistische Zahlen: Zinssatz höchstens 6 % p.a., höchstens 360 Tage',
                  'Du kannst den Rechenweg deiner Aufgabe Schritt für Schritt erklären',
                ].map((c) => (
                  <label key={c}>
                    <input type="checkbox" /> <span>{c}</span>
                  </label>
                ))}
              </div>
              <Baukasten />
            </div>
          </Teil>


        {/* 7 Check */}
          <Teil title="Check: Hast du es verstanden?" social="EA" minutes={10}>
            <div className="lp-exlist">
              <McCard
                title="Check 1: Die richtige Formel"
                level="basis"
                prompt={<p>Welche Formel berechnet die Zinstage t?</p>}
                options={[
                  { text: <M>{'t = \\frac{K \\cdot p \\cdot 100 \\cdot 360}{Z}'}</M>, feedback: 'Hier sind Zähler und Nenner vertauscht. Z gehört nach oben, K und p nach unten.' },
                  { text: <M>{'t = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot p}'}</M>, correct: true, feedback: 'Erst mal 100 · 360, dann durch K · p teilen.' },
                  { text: <M>{'t = \\frac{Z \\cdot K \\cdot p}{100 \\cdot 360}'}</M>, feedback: 'Das ist die Zinsformel mit Z an der falschen Stelle. Beim Umstellen wandern 100 · 360 nach oben.' },
                  { text: <M>{'t = \\frac{Z}{K \\cdot p}'}</M>, feedback: 'Hier fehlt 100 · 360 im Zähler. Ohne diese Zahlen wird t viel zu klein.' },
                ]}
              />
              <CheckCard
                title="Check 2: Kapital berechnen"
                level="standard"
                prompt={<p>Wie viel Geld muss man zu 2,4 % p.a. anlegen, damit es in 75 Tagen 18 € Zinsen gibt?</p>}
                fields={[{ kind: 'num', key: 'k', label: <M>{'K ='}</M>, expected: 3600, unit: '€' }]}
                solution={<MB>{'K = \\frac{18 \\cdot 100 \\cdot 360}{2{,}4 \\cdot 75} = \\frac{648\\,000}{180} = 3\\,600'}</MB>}
                help={
                  <Hilfen
                    steps={[
                      <>Welche Größe ist gesucht, welche sind gegeben?</>,
                      <>Gesucht ist K. Oben steht Z · 100 · 360, unten p · t.</>,
                      <>
                        <M>{'K = \\frac{18 \\cdot 100 \\cdot 360}{2{,}4 \\cdot 75}'}</M>
                      </>,
                    ]}
                  />
                }
              />
              <McCard
                title="Check 3: Wer hat recht?"
                rechnen
                level="standard"
                prompt={
                  <p>
                    2.000 € liegen 90 Tage auf einem Konto und bringen 10 € Zinsen. Ben rechnet p = 0,02. Lea rechnet p = 2. Ali rechnet p = 0,5. Wer hat recht?
                  </p>
                }
                options={[
                  { text: 'Ben: 0,02 % p.a.', feedback: 'Ben hat die 100 vergessen: 10 · 360 / (2.000 · 90) = 0,02. Richtig ist 10 · 100 · 360 / (2.000 · 90).' },
                  { text: 'Lea: 2 % p.a.', correct: true, feedback: 'p = 10 · 100 · 360 / (2.000 · 90) = 360.000 / 180.000 = 2.' },
                  { text: 'Ali: 0,5 % p.a.', feedback: 'Ali hat den Bruch auf den Kopf gestellt: 2.000 · 90 / (10 · 100 · 360) = 0,5. Z · 100 · 360 gehört nach oben.' },
                  { text: 'Niemand, man kann p aus diesen Angaben nicht berechnen.', feedback: 'K, t und Z sind gegeben. Damit lässt sich p mit der umgestellten Formel berechnen.' },
                ]}
              />
              <CheckCard
                title="Check 4: Wann ist das Ziel erreicht?"
                level="erweiterung"
                prompt={
                  <p>
                    Mira legt am 10.03. 5.000 € zu 2,4 % p.a. an. Sie möchte 25 € Zinsen für ein Konzertticket. Wie viele Zinstage braucht sie, und an welchem Tag hat sie die 25 €
                    zusammen? (Bankregel: jeder Monat 30 Tage)
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 75, unit: 'Tage' },
                  { kind: 'num', key: 'd', label: 'Datum: Tag', expected: 25 },
                  { kind: 'num', key: 'm', label: 'Monat', expected: 5 },
                ]}
                solution={
                  <>
                    <MB>{'t = \\frac{25 \\cdot 100 \\cdot 360}{5\\,000 \\cdot 2{,}4} = \\frac{900\\,000}{12\\,000} = 75'}</MB>
                    <p>Vom 10.03. sind 60 Tage bis zum 10.05., dazu 15 Tage: Am 25.05. hat Mira die 25 € zusammen.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Zuerst t mit der umgestellten Formel berechnen. Dann vom 10.03. aus weiterzählen.</>,
                      <>75 Tage sind 2 Monate (60 Tage) und noch 15 Tage.</>,
                      <>Vom 10.03. zwei Monate weiter ist der 10.05. Dazu kommen 15 Tage.</>,
                    ]}
                  />
                }
              />
            </div>
          </Teil>
        </Etappe>

        <nav className="lp-nav" aria-label="Weiter">
          <button type="button" className="bk-btn" onClick={onPrev}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zu Teil 1
          </button>
          <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
            Weiter üben: Zinsrechnung <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </TaskShell>
  )
}

/** Rückbezug auf die Vermutung aus Phase 2 */
function Rueckbezug({ pred }: { pred: Prediction }) {
  if (!pred.saved || !pred.choice) {
    return (
      <div className="ls-back">
        <p>Du hast in Phase 2 noch keine Vermutung festgehalten. Hole das kurz nach, dann siehst du hier, ob du richtig lagst.</p>
      </div>
    )
  }
  const diff = Math.abs(pred.kapital - K_NOETIG)
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {CHOICE_TEXT[pred.choice]}. Für 72 € braucht die Klasse etwa {fmt(pred.kapital, 0)} €.
      </p>
      <p>
        {pred.choice === 'nein' ? (
          <>Das stimmt: Die 3.600 € bringen bis zum 01.08. nur {euro(ZINS_KASSE)}. Gut eingeschätzt!</>
        ) : (
          <>
            Die 3.600 € bringen bis zum 01.08. nur {euro(ZINS_KASSE)}, nicht 108 €. „3 % p.a.“ gilt für ein ganzes Jahr, das Geld liegt aber nur 180 Tage.
          </>
        )}
      </p>
      <p>
        Für 72 € braucht die Klasse <strong>{euro(K_NOETIG)}</strong>, also 200 € pro Person. {diff < 1e-9 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${fmt(diff, 0)} € daneben.`}
      </p>
    </div>
  )
}
