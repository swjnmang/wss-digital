import { useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { VideoEmbed } from '../../../components/VideoButton'
import { Beispiel, M, MB, Merke, Vorgehen, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { CardHead, CheckCard, Hilfen, LevelTag, McCard, Phase } from '../../lineare_funktionen/lernsituation_kit/kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './intranet.css'

// Einstiegs-Lernsituation „Kundenauftrag: Wohin mit Lenas Autogeld?“ zur unterjährigen Zinsrechnung (Tageszinsen).
// Format Rollenspiel / Beratungsauftrag, Look Bank-Intranet (Dashboard mit Ticket), Lernprodukt analog (Kundenbrief).
// Instruktionsreihenfolge: Problem zuerst. Die SuS können Prozentrechnung, Jahreszinsen (Z = K · p / 100) und den Dreisatz;
// die Tageszinsformel Z = K · p · t / (100 · 360) ist neu und wird aus dem Dreisatz Jahr → Tag → t Tage selbst entwickelt.
// Es wird immer tagesgenau gerechnet (Zinstage nach der Bankregel: jeder Monat 30 Tage, das Jahr 360 Tage), nie mit Monaten.
// Aha: Der höhere Zinssatz (Festgeld) bringt weniger, weil das Geld kürzer verzinst wird, und „2,4 %“ heißt nicht 2,4 % vom Betrag.
// Phasen: Aktivieren → Auftrag & Festlegung → Bearbeiten → Austausch → Sichern (Kundenbrief) → Check.
// Die Festlegung bleibt nur im Seitenzustand (kein Speichern).
// Wird über /finanzmathe/zinsrechnung/lernsituation aus dem Menü „Zinsrechnung“ geöffnet (Teil 1, Teil 2: K, p und t berechnen).

export const VIDEO_ZINSEN = 'https://www.youtube.com/watch?v=bCjboGGTRGs'

/* ── Situation ───────────────────────────────────────────────────────────── */

// Lena legt am 16.05. 4.800 € an und braucht das Geld am 14.10. für ihr erstes Auto: 148 Zinstage.
// A: Tagesgeld 2,4 % p.a., jederzeit verfügbar → 148 Tage → 47,36 €
// B: Festgeld 3,0 % p.a., 90 Tage fest, danach Auszahlung aufs Girokonto ohne Zinsen → 36,00 €
// Erweiterung: erst 90 Tage Festgeld, dann 58 Tage Tagesgeld → 36,00 € + 18,56 € = 54,56 €
const K = 4800
const T_GESAMT = 148
const ZINS_A = (K * 2.4 * T_GESAMT) / 36000
const ZINS_B = (K * 3 * 90) / 36000

type Choice = 'A' | 'B' | 'gleich'
type Prediction = { choice: Choice | null; schaetzung: number; saved: boolean }

const CHOICE_TEXT: Record<Choice, string> = {
  A: 'Angebot A (Tagesgeld) bringt mehr Zinsen',
  B: 'Angebot B (Festgeld) bringt mehr Zinsen',
  gleich: 'Beide bringen ungefähr gleich viel',
}

const euro = (v: number) => `${fmt(v, 2, true)} €`

/** Arbeitsschritt im Intranet-Look */
function Schritt({ no, title, level, children }: { no: number; title: string; level?: 'basis' | 'standard' | 'erweiterung'; children: ReactNode }) {
  return (
    <div className="ib-step">
      <div className="ib-step-head">
        <span className="ib-step-tag">Schritt {no}</span>
        {level && <LevelTag level={level} />}
      </div>
      <h3 className="ib-step-title">{title}</h3>
      {children}
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function BankEinstieg({ onBack, onPractice, onNext }: { onBack: () => void; onPractice: () => void; onNext: () => void }) {
  const [pred, setPred] = useState<Prediction>({ choice: null, schaetzung: 100, saved: false })

  return (
    <TaskShell title="Zinsrechnung" subtitle="Lernsituation Teil 1: Wohin mit Lenas Autogeld?" width="wide">
      <div className="lp">
        <div>
          <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
          </button>
        </div>
        <div className="lp-goal">
          <i className="fa-solid fa-bullseye" aria-hidden="true" />
          <div>
            <strong>Das lernst du hier:</strong> Du berechnest Zinsen, wenn Geld nicht ein ganzes Jahr, sondern nur einige Tage angelegt ist. Dabei entwickelst du die
            Formel für die Tageszinsen selbst.
          </div>
        </div>

        {/* 1 Aktivieren */}
        <Phase no={1} title="Fit für den Start" social="EA" minutes={5}>
          <p>Diese drei kurzen Aufgaben brauchst du gleich. Löse sie allein.</p>
          <div className="lp-exlist">
            <CheckCard
              title="a) Zinsen für ein Jahr"
              prompt={
                <p>
                  Ein Sparkonto zahlt <strong>2 % Zinsen pro Jahr</strong>. Wie viel Zinsen bringen 3.500 € in einem Jahr? Halte deinen Rechenweg schriftlich fest.
                </p>
              }
              fields={[{ kind: 'num', key: 'z', label: 'Zinsen:', expected: 70, unit: '€' }]}
              solution={<MB>{'Z = \\frac{3\\,500 \\cdot 2}{100} = 70 \\text{ €}'}</MB>}
            />
            <CheckCard
              title="b) Vom Jahr auf den Tag"
              prompt={
                <p>
                  Ein Jahresabo für einen Streamingdienst kostet 108 €. Rechne das Jahr mit <strong>360 Tagen</strong>. Was kostet ein Tag? Was kosten 50 Tage?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'tag', label: '1 Tag:', expected: 0.3, unit: '€' },
                { kind: 'num', key: 't50', label: '50 Tage:', expected: 15, unit: '€' },
              ]}
              solution={<MB>{'108 \\text{ €} : 360 = 0{,}30 \\text{ €} \\qquad 0{,}30 \\text{ €} \\cdot 50 = 15 \\text{ €}'}</MB>}
            />
            <CheckCard
              title="c) Tage zählen wie eine Bank"
              prompt={
                <>
                  <p className="ib-note">
                    <strong>Bankregel:</strong> Banken rechnen jeden Monat mit <strong>30 Tagen</strong> und das Jahr mit <strong>360 Tagen</strong>. Ein 31. zählt wie der 30.
                    Die Tage, für die Zinsen bezahlt werden, heißen <strong>Zinstage</strong>.
                  </p>
                  <p>Wie viele Zinstage liegen nach der Bankregel zwischen dem 05.03. und dem 05.06.? Und zwischen dem 05.03. und dem 20.06.?</p>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'a', label: '05.03. bis 05.06.:', expected: 90, unit: 'Tage' },
                { kind: 'num', key: 'b', label: '05.03. bis 20.06.:', expected: 105, unit: 'Tage' },
              ]}
              solution={
                <>
                  <p>Vom 05.03. bis zum 05.06. sind es 3 volle Monate:</p>
                  <MB>{'3 \\cdot 30 = 90 \\text{ Tage}'}</MB>
                  <p>Bis zum 20.06. kommen noch 15 Tage dazu (vom 5. bis zum 20.):</p>
                  <MB>{'90 + 15 = 105 \\text{ Tage}'}</MB>
                </>
              }
            />
          </div>
        </Phase>

        {/* 2 Auftrag & Festlegung */}
        <Phase no={2} title="Dein Auftrag: Ein Ticket im Bank-Intranet" social="EA" minutes={5}>
          <p>Du machst eine Ausbildung zur Bankkauffrau oder zum Bankkaufmann. Heute landet dieses Ticket in deinem Postfach:</p>
          <div>
            <div className="ib-bar">
              <span>
                <i className="fa-solid fa-building-columns" aria-hidden="true" /> Bank-Intranet · Kundenservice
              </span>
              <small>Ticket #2417 · neu</small>
            </div>
            <div className="ib-ticket">
              <div className="ib-meta">
                <div>
                  <span>Kundin</span>Lena K., 18 Jahre, Azubi
                </div>
                <div>
                  <span>Betrag</span>4.800,00 €
                </div>
                <div>
                  <span>Zeitraum</span>16.05. bis 14.10.
                </div>
              </div>
              <div className="ib-msg">
                <p>„Hallo, ich habe 4.800 € gespart. Am 14.10. kaufe ich mein erstes Auto, bis dahin soll das Geld Zinsen bringen. Heute ist der 16.05.</p>
                <p>
                  Ich habe zwei Angebote von euch gesehen. Das Festgeld hat ja den höheren Zinssatz, oder? Dann bekomme ich doch 3 % von 4.800 €, also 144 €. Welches Angebot
                  soll ich nehmen?“
                </p>
              </div>
              <div className="ib-products">
                <div className="ib-product ib-product-a">
                  <div className="ib-product-name">A · Tagesgeld</div>
                  <div className="ib-product-rate">
                    2,4 % <small>p.a.</small>
                  </div>
                  <ul>
                    <li>jederzeit verfügbar</li>
                    <li>Lena lässt das Geld bis zum 14.10. liegen</li>
                  </ul>
                </div>
                <div className="ib-product ib-product-b">
                  <div className="ib-product-name">B · Festgeld 90 Tage</div>
                  <div className="ib-product-rate">
                    3,0 % <small>p.a.</small>
                  </div>
                  <ul>
                    <li>Geld ist 90 Tage fest angelegt</li>
                    <li>danach kommt es auf das Girokonto (ohne Zinsen)</li>
                  </ul>
                </div>
              </div>
              <p className="lp-hint">„p.a.“ heißt „pro Jahr“ (lateinisch: per annum).</p>
            </div>
          </div>
          <div className="ls-question">
            <i className="fa-solid fa-circle-question" aria-hidden="true" />
            <span>Mit welchem Angebot bekommt Lena bis zum Autokauf mehr Zinsen, und wie viel genau?</span>
          </div>

          <div className="lp-ex bk-panel" data-no-autocheck>
            <CardHead title="Deine Vermutung" />
            {pred.saved && pred.choice ? (
              <>
                <div className="ls-saved" role="status">
                  <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: <strong>{CHOICE_TEXT[pred.choice]}</strong>. Deine Schätzung für die Zinsen mit Angebot A:{' '}
                  <strong>etwa {pred.schaetzung} €</strong>. Am Ende schauen wir, ob du recht hattest.
                </div>
                <div>
                  <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setPred({ ...pred, saved: false })}>
                    Vermutung ändern
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>Rechne noch nicht! Entscheide spontan und schreibe einen Satz als Begründung in dein Heft.</p>
                <div className="ls-options" role="radiogroup" aria-label="Welches Angebot bringt mehr?">
                  {(['A', 'B', 'gleich'] as const).map((c) => (
                    <label key={c} className="bk-choice ls-option">
                      <input type="radio" name="bank-pred" checked={pred.choice === c} onChange={() => setPred({ ...pred, choice: c })} />
                      <span>{CHOICE_TEXT[c]}</span>
                    </label>
                  ))}
                </div>
                <div className="ls-slider">
                  <label htmlFor="bank-pred-z">
                    Ich schätze: Mit Angebot A bekommt Lena bis zum 14.10. etwa <span className="ls-slider-value">{pred.schaetzung} €</span> Zinsen.
                  </label>
                  <input
                    id="bank-pred-z"
                    type="range"
                    min={0}
                    max={200}
                    step={5}
                    value={pred.schaetzung}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPred({ ...pred, schaetzung: Number(e.target.value) })}
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
        </Phase>

        {/* 3 Bearbeiten */}
        <Phase no={3} title="Das Ticket bearbeiten" social="PA" minutes={17}>
          <p>
            <strong>Auftrag:</strong> Bearbeitet das Ticket zu zweit Schritt für Schritt. Jede Person tippt auf dem eigenen Gerät, ihr besprecht jede Antwort kurz miteinander.
            Rechnet immer <strong>tagesgenau</strong>, so wie eine Bank.
          </p>

          <Schritt no={1} title="Wie viele Tage bekommt Lena Zinsen?" level="basis">
            <CheckCard
              title="Zinstage bis zum Autokauf"
              prompt={
                <p>
                  Lena legt das Geld am <strong>16.05.</strong> an und hebt es am <strong>14.10.</strong> ab. Wie viele Zinstage sind das nach der Bankregel (jeder Monat 30 Tage)?
                </p>
              }
              fields={[{ kind: 'num', key: 't', label: 'Zinstage:', expected: T_GESAMT, unit: 'Tage' }]}
              solution={
                <>
                  <p>Vom 16.05. bis zum 16.10. wären es 5 volle Monate. Der 14.10. liegt 2 Tage davor:</p>
                  <MB>{'5 \\cdot 30 - 2 = 150 - 2 = 148 \\text{ Tage}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Zählt zuerst die vollen Monate. Wie viele Monate liegen zwischen dem 16.05. und dem 16.10.?</>,
                    <>Jeder volle Monat zählt 30 Tage. Danach korrigiert ihr die Tage: Der 14.10. liegt vor dem 16.10.</>,
                    <>
                      Mai → Juni → Juli → August → September → Oktober sind 5 Monate, also <M>{'5 \\cdot 30 = 150'}</M> Tage bis zum 16.10. Wie viele Tage müsst ihr abziehen?
                    </>,
                  ]}
                />
              }
            />
          </Schritt>

          <Schritt no={2} title="Zinsen für Angebot A und Angebot B" level="basis">
            <p className="ib-note">
              Ihr kennt schon die Zinsen für ein ganzes Jahr. Lenas Geld liegt aber nur einen Teil des Jahres auf dem Konto. Geht deshalb über einen Tag: Jahr → 1 Tag → alle Tage.
            </p>
            <CheckCard
              title="Angebot A: Tagesgeld, 2,4 % p.a., 148 Tage"
              prompt={<p>Berechnet die Zinsen für ein ganzes Jahr, dann für einen Tag (360 Tage pro Jahr) und dann für Lenas 148 Tage. Haltet den Rechenweg im Heft fest.</p>}
              fieldsRow
              fields={[
                { kind: 'num', key: 'j', label: '1 Jahr:', expected: 115.2, unit: '€' },
                { kind: 'num', key: 'd', label: '1 Tag:', expected: 0.32, unit: '€' },
                { kind: 'num', key: 't', label: '148 Tage:', expected: ZINS_A, unit: '€' },
              ]}
              solution={
                <>
                  <MB>{'\\text{1 Jahr: } \\frac{4\\,800 \\cdot 2{,}4}{100} = 115{,}20 \\text{ €}'}</MB>
                  <MB>{'\\text{1 Tag: } 115{,}20 \\text{ €} : 360 = 0{,}32 \\text{ €}'}</MB>
                  <MB>{'\\text{148 Tage: } 0{,}32 \\text{ €} \\cdot 148 = 47{,}36 \\text{ €}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Wie in Aufgabe a) aus „Fit für den Start“: Wie viel Zinsen gäbe es, wenn Lena das Geld ein ganzes Jahr liegen lässt?</>,
                    <>Wie beim Streaming-Abo in Aufgabe b): Teilt die Jahreszinsen durch 360, dann habt ihr die Zinsen für einen Tag. Diese nehmt ihr mal die Zinstage.</>,
                    <>
                      Jahreszinsen: <M>{'\\frac{4\\,800 \\cdot 2{,}4}{100} = 115{,}20'}</M> €. Für einen Tag: <M>{'115{,}20 : 360'}</M>. Das Ergebnis nehmt ihr mal 148.
                    </>,
                  ]}
                />
              }
            />
            <CheckCard
              title="Angebot B: Festgeld, 3,0 % p.a., 90 Tage"
              prompt={<p>Rechnet genauso. Das Geld bekommt nur 90 Tage lang Zinsen, danach liegt es ohne Zinsen auf dem Girokonto.</p>}
              fieldsRow
              fields={[
                { kind: 'num', key: 'j', label: '1 Jahr:', expected: 144, unit: '€' },
                { kind: 'num', key: 'd', label: '1 Tag:', expected: 0.4, unit: '€' },
                { kind: 'num', key: 't', label: '90 Tage:', expected: ZINS_B, unit: '€' },
              ]}
              solution={
                <>
                  <MB>{'\\text{1 Jahr: } \\frac{4\\,800 \\cdot 3}{100} = 144{,}00 \\text{ €}'}</MB>
                  <MB>{'\\text{1 Tag: } 144{,}00 \\text{ €} : 360 = 0{,}40 \\text{ €}'}</MB>
                  <MB>{'\\text{90 Tage: } 0{,}40 \\text{ €} \\cdot 90 = 36{,}00 \\text{ €}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Lena hat mit 144 € schon die Zinsen für ein ganzes Jahr ausgerechnet. Das Geld liegt aber nicht ein ganzes Jahr fest.</>,
                    <>Teilt die Jahreszinsen durch 360 und nehmt das Ergebnis mal 90.</>,
                    <>
                      <M>{'144 : 360 = 0{,}40'}</M> €. Jetzt noch <M>{'0{,}40 \\cdot 90'}</M> rechnen.
                    </>,
                  ]}
                />
              }
            />
            <McCard
              title="Entscheidung"
              prompt={<p>Welche Empfehlung gebt ihr Lena?</p>}
              options={[
                {
                  text: 'Angebot A: Mit dem Tagesgeld bekommt sie 47,36 €, mit dem Festgeld nur 36,00 €.',
                  correct: true,
                  feedback: 'Der Zinssatz ist zwar niedriger, aber das Geld bekommt 148 statt nur 90 Tage lang Zinsen.',
                },
                {
                  text: 'Angebot B: 3 % sind mehr als 2,4 %, also bringt das Festgeld mehr.',
                  feedback: 'Der Zinssatz allein entscheidet nicht. Es kommt auch darauf an, wie viele Tage das Geld Zinsen bekommt: 148 Tage bei A, nur 90 Tage bei B.',
                },
                {
                  text: 'Angebot B: Lena bekommt 144 € Zinsen.',
                  feedback: '144 € gäbe es nur, wenn das Geld ein ganzes Jahr fest liegt. „3 % p.a.“ heißt 3 % pro Jahr, für 90 Tage gibt es nur einen Teil davon.',
                },
                {
                  text: 'Egal: Beide bringen ungefähr gleich viel.',
                  feedback: 'Vergleicht eure Ergebnisse: 47,36 € gegen 36,00 €. Das sind über 11 € Unterschied.',
                },
              ]}
            />
          </Schritt>

          <div className="lp-ex bk-panel">
            <CardHead title="Infokarte: Die Formel für Tageszinsen" />
            <p>Ihr habt dreimal dasselbe gemacht: Jahreszinsen berechnen, durch 360 teilen, mal die Zinstage nehmen. Schreibt man das in einen Bruch, entsteht eine Formel:</p>
            <MB>{'Z = \\underbrace{\\frac{K \\cdot p}{100}}_{\\text{Jahreszinsen}} \\cdot \\frac{t}{360} = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360}'}</MB>
            <p>
              Dabei ist <M>K</M> das Kapital in €, <M>p</M> der Zinssatz in % p.a., <M>t</M> die Anzahl der Zinstage und <M>Z</M> die Zinsen in €. Das Jahr hat 360 Zinstage, jeder Monat
              30.
            </p>
            <Vorgehen
              title="So gehst du vor"
              steps={[
                <>
                  <strong>Zinstage bestimmen:</strong> volle Monate mal 30, dann die restlichen Tage dazuzählen oder abziehen.
                </>,
                <>
                  <strong>Einsetzen:</strong> <M>K</M>, <M>p</M> und <M>t</M> in die Formel einsetzen.
                </>,
                <>
                  <strong>Ausrechnen</strong> und auf Cent runden.
                </>,
              ]}
            />
            <Beispiel
              title="Lenas Angebot A mit der Formel"
              aufgabe={<p>4.800 € auf dem Tagesgeld zu 2,4 % p.a. vom 16.05. bis zum 14.10.</p>}
              steps={[
                { title: 'Zinstage', body: <MB>{'t = 5 \\cdot 30 - 2 = 148'}</MB> },
                { title: 'Einsetzen', body: <MB>{'Z = \\frac{4\\,800 \\cdot 2{,}4 \\cdot 148}{100 \\cdot 360}'}</MB> },
                { title: 'Ausrechnen', body: <MB>{'Z = \\frac{1\\,704\\,960}{36\\,000} = 47{,}36 \\text{ €}'}</MB> },
              ]}
            />
            <p>Im Erklärvideo siehst du noch einmal, wie du die Zinsen mit der Formel berechnest:</p>
            <VideoEmbed src={VIDEO_ZINSEN} title="Erklärvideo: Zinsen berechnen" />
          </div>

          <Schritt no={3} title="Ein zweiter Kunde: Lenas Bruder Jonas" level="standard">
            <CheckCard
              title="Jetzt mit der Formel"
              prompt={
                <p>
                  Jonas legt <strong>2.700 €</strong> vom <strong>01.03.</strong> bis zum <strong>20.07.</strong> auf das Tagesgeld (2,4 % p.a.). Bestimmt die Zinstage und berechnet
                  die Zinsen mit der Formel. Haltet den Rechenweg im Heft fest.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 't', label: 'Zinstage:', expected: 139, unit: 'Tage' },
                { kind: 'num', key: 'z', label: 'Zinsen:', expected: 25.02, unit: '€' },
              ]}
              solution={
                <>
                  <p>Vom 01.03. bis zum 01.07. sind es 4 volle Monate, bis zum 20.07. kommen 19 Tage dazu:</p>
                  <MB>{'t = 4 \\cdot 30 + 19 = 139'}</MB>
                  <MB>{'Z = \\frac{2\\,700 \\cdot 2{,}4 \\cdot 139}{100 \\cdot 360} = \\frac{900\\,720}{36\\,000} = 25{,}02 \\text{ €}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Erst die Zinstage, dann die Formel aus der Infokarte. Welche drei Größen setzt ihr ein?</>,
                    <>Zählt die vollen Monate vom 01.03. bis zum 01.07. Vom 1. bis zum 20. sind es noch 19 Tage.</>,
                    <>
                      <M>{'t = 4 \\cdot 30 + 19 = 139'}</M>. Setzt ein: <M>{'Z = \\frac{2\\,700 \\cdot 2{,}4 \\cdot 139}{100 \\cdot 360}'}</M>
                    </>,
                  ]}
                />
              }
            />
          </Schritt>

          <Schritt no={4} title="Geht es noch besser für Lena?" level="erweiterung">
            <CheckCard
              title="Festgeld und Tagesgeld kombinieren"
              prompt={
                <p>
                  Lena könnte zuerst 90 Tage das Festgeld nutzen und das Geld danach für die restlichen Tage bis zum 14.10. auf das Tagesgeld legen. Die Festgeld-Zinsen werden auf ihr
                  Girokonto gezahlt, auf dem Tagesgeld liegen also wieder 4.800 €. Wie viele Tage bleiben für das Tagesgeld, und wie viel Zinsen bekommt sie insgesamt? Begründet im
                  Heft, ob sich der Aufwand lohnt.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 't', label: 'Tage Tagesgeld:', expected: 58, unit: 'Tage' },
                { kind: 'num', key: 'z', label: 'Zinsen insgesamt:', expected: 54.56, unit: '€' },
              ]}
              solution={
                <>
                  <MB>{'148 - 90 = 58 \\text{ Tage}'}</MB>
                  <MB>{'Z_{\\text{Tagesgeld}} = \\frac{4\\,800 \\cdot 2{,}4 \\cdot 58}{100 \\cdot 360} = 18{,}56 \\text{ €}'}</MB>
                  <MB>{'Z_{\\text{gesamt}} = 36{,}00 \\text{ €} + 18{,}56 \\text{ €} = 54{,}56 \\text{ €}'}</MB>
                  <p>Das sind 7,20 € mehr als nur mit dem Tagesgeld. Lena muss dafür das Geld nach 90 Tagen selbst umbuchen.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Insgesamt hat Lena 148 Zinstage. Wie viele davon sind schon durch das Festgeld belegt?</>,
                    <>Berechnet die Tagesgeld-Zinsen für die restlichen Tage mit der Formel und addiert die 36,00 € vom Festgeld.</>,
                    <>
                      <M>{'148 - 90 = 58'}</M> Tage. <M>{'Z = \\frac{4\\,800 \\cdot 2{,}4 \\cdot 58}{100 \\cdot 360}'}</M>, dazu kommen 36,00 €.
                    </>,
                  ]}
                />
              }
            />
          </Schritt>
        </Phase>

        {/* 4 Austausch */}
        <Phase no={4} title="Vergleicht eure Wege" social="Plenum" minutes={4}>
          <div className="ls-stop">
            <div className="ls-stop-title">
              <i className="fa-solid fa-hand" aria-hidden="true" /> Stopp: Besprecht eure Ergebnisse mit der Klasse.
            </div>
            <ul>
              <li>Warum stimmt Lenas Rechnung „3 % von 4.800 € = 144 €“ nicht?</li>
              <li>Warum bringt das Festgeld trotz des höheren Zinssatzes weniger?</li>
              <li>Woher kommen die 100 und die 360 in der Formel?</li>
            </ul>
          </div>
          <p>
            <strong>Du arbeitest allein?</strong> So haben drei andere Azubis gerechnet. Klappe die Wege auf und vergleiche sie mit deinem.
          </p>
          <div className="ls-ways">
            <details className="ls-way">
              <summary>Ben hat einfach den Zinssatz genommen</summary>
              <div className="ls-way-body">
                <p>„2,4 % von 4.800 € sind 115,20 €. Das bekommt Lena beim Tagesgeld.“</p>
                <p>
                  <strong>Problem:</strong> 115,20 € sind die Zinsen für ein <strong>ganzes Jahr</strong>. Lenas Geld liegt aber nur 148 Tage auf dem Konto. Ben hat die Zeit
                  vergessen.
                </p>
              </div>
            </details>
            <details className="ls-way">
              <summary>Can hat mit Monaten gerechnet</summary>
              <div className="ls-way-body">
                <p>„Mai bis Oktober sind ungefähr 5 Monate. 115,20 € durch 12 mal 5 sind 48 €.“</p>
                <p>
                  <strong>Problem:</strong> Lena hebt das Geld schon am 14.10. ab, nicht am 16.10. Banken rechnen <strong>tagesgenau</strong>: 148 Tage, nicht 150. Darum
                  stimmen Cans 48 € nicht, richtig sind 47,36 €. Rechne deshalb immer mit Tagen, nie mit Monaten.
                </p>
              </div>
            </details>
            <details className="ls-way">
              <summary>Aylin ist über einen Tag gegangen</summary>
              <div className="ls-way-body">
                <p>„Ein Jahr bringt 115,20 €. Ein Tag ist der 360. Teil davon, also 0,32 €. Für 148 Tage sind das 0,32 € · 148 = 47,36 €.“</p>
                <p>
                  <strong>Gut:</strong> Genau so rechnet die Bank. Fasst man Aylins drei Schritte zusammen, entsteht die Formel <M>{'Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360}'}</M>.
                </p>
              </div>
            </details>
          </div>
        </Phase>

        {/* 5 Sichern */}
        <Phase no={5} title="Das hältst du fest" social="EA" minutes={8}>
          <Rueckbezug pred={pred} />
          <Merke title="Zinsen für einen Teil des Jahres (Tageszinsen)">
            <MB>{'Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360}'}</MB>
            <ul>
              <li>
                <M>K</M> = Kapital in €, <M>p</M> = Zinssatz in % p.a. (pro Jahr), <M>t</M> = Zinstage, <M>Z</M> = Zinsen in €
              </li>
              <li>Gerechnet wird immer tagesgenau: jeder Monat hat 30 Zinstage, das Jahr 360.</li>
              <li>
                Der Zinssatz gilt <strong>pro Jahr</strong>. Liegt das Geld kürzer, gibt es nur den Teil <M>{'\\frac{t}{360}'}</M> der Jahreszinsen.
              </li>
              <li>Ein höherer Zinssatz bringt nicht automatisch mehr Zinsen. Es kommt auch auf die Zahl der Zinstage an.</li>
            </ul>
          </Merke>
          <div className="lp-ex bk-panel">
            <CardHead title="Deine Antwort an Lena (Lernprodukt)" />
            <p>Schließe das Ticket: Schreibe Lena in deinem Heft eine kurze Antwort mit deiner Empfehlung. Hake ab, was dein Brief schon enthält:</p>
            <div className="ls-criteria">
              {[
                'Eine klare Empfehlung: Welches Angebot soll Lena nehmen?',
                'Die Zinstage und die Rechnung für beide Angebote mit der Formel',
                'Eine Erklärung, warum Lenas 144 € nicht stimmen',
                'Eine Erklärung, warum der höhere Zinssatz hier weniger bringt',
              ].map((c) => (
                <label key={c}>
                  <input type="checkbox" /> <span>{c}</span>
                </label>
              ))}
            </div>
            <p className="lp-hint">Satzanfänge, wenn du Hilfe brauchst:</p>
            <ul className="ib-starters">
              <li>„Liebe Lena, vielen Dank für deine Anfrage. Ich empfehle dir …“</li>
              <li>„Dein Geld liegt vom 16.05. bis zum 14.10. auf dem Konto, das sind … Zinstage.“</li>
              <li>„Mit dem Tagesgeld bekommst du …, mit dem Festgeld nur …, weil …“</li>
              <li>„Die 144 € würdest du nur bekommen, wenn …“</li>
            </ul>
          </div>
        </Phase>

        {/* 6 Check */}
        <Phase no={6} title="Check: Hast du es verstanden?" social="EA" minutes={6}>
          <div className="lp-exlist">
            <McCard
              title="Check 1: Wie viel Zinsen?"
              level="basis"
              prompt={<p>6.000 € werden 60 Tage lang zu 3 % p.a. angelegt. Wie viel Zinsen gibt es?</p>}
              options={[
                { text: '180,00 €', feedback: '180 € sind die Zinsen für ein ganzes Jahr. Das Geld liegt aber nur 60 Tage, also gibt es nur 60/360 davon.' },
                { text: '30,00 €', correct: true, feedback: 'Z = 6.000 · 3 · 60 / (100 · 360) = 30 €.' },
                { text: '1,00 €', feedback: 'Hier wurde t = 2 (Monate) eingesetzt. In die Formel gehören die Zinstage: t = 60.' },
                { text: '29,59 €', feedback: 'Hier wurde mit 365 Tagen gerechnet. Die Bank rechnet das Jahr mit 360 Zinstagen.' },
              ]}
            />
            <McCard
              title="Check 2: Wer hat recht?"
              level="standard"
              prompt={
                <p>
                  Geld liegt vom 10.04. bis zum 25.06. auf dem Konto. Mia sagt: „April hat 30 Tage, Mai 31. Das sind 20 + 31 + 25 = 76 Zinstage.“ Leon sagt: „Es sind 75 Zinstage.“
                  Wer hat recht?
                </p>
              }
              options={[
                { text: 'Mia, denn der Mai hat wirklich 31 Tage.', feedback: 'Im Kalender stimmt das, aber die Bank zählt jeden Monat mit 30 Tagen.' },
                { text: 'Leon, denn nach der Bankregel sind es 2 · 30 + 15 = 75 Tage.', correct: true, feedback: '10.04. bis 10.06. sind 2 Monate = 60 Tage, bis zum 25.06. kommen 15 Tage dazu.' },
                { text: 'Keiner, es sind 2 Monate, also t = 2.', feedback: 'In die Formel gehören Tage, nicht Monate. Gerechnet wird immer tagesgenau.' },
                { text: 'Beide, das macht keinen Unterschied.', feedback: 'Ein Tag mehr oder weniger ändert die Zinsen. Die Bank rechnet nach der Regel „jeder Monat 30 Tage“.' },
              ]}
            />
            <CheckCard
              title="Check 3: Andersherum gefragt"
              level="erweiterung"
              prompt={
                <p>
                  Ein Kunde hatte 3.600 € für 200 Tage angelegt und 50 € Zinsen bekommen. Wie hoch war der Zinssatz? Stelle die Formel um und halte deinen Rechenweg schriftlich fest.
                </p>
              }
              fields={[{ kind: 'num', key: 'p', label: <M>{'p ='}</M>, expected: 2.5, unit: '% p.a.' }]}
              solution={
                <>
                  <MB>{'50 = \\frac{3\\,600 \\cdot p \\cdot 200}{100 \\cdot 360} \\quad\\Rightarrow\\quad p = \\frac{50 \\cdot 100 \\cdot 360}{3\\,600 \\cdot 200} = \\frac{1\\,800\\,000}{720\\,000} = 2{,}5'}</MB>
                  <p>Der Zinssatz war 2,5 % p.a.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Schreibe die Formel auf und setze alles ein, was du kennst. Welche Größe fehlt?</>,
                    <>Multipliziere beide Seiten mit 100 · 360 und teile dann durch 3.600 · 200.</>,
                    <>
                      <M>{'p = \\frac{50 \\cdot 100 \\cdot 360}{3\\,600 \\cdot 200}'}</M>
                    </>,
                  ]}
                />
              }
            />
          </div>
        </Phase>

        <nav className="lp-nav" aria-label="Weiter">
          <button type="button" className="bk-btn" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
          </button>
          <button type="button" className="bk-btn" onClick={onPractice}>
            Weiter üben: Zinsrechnung <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
          <button type="button" className="bk-btn bk-btn-primary" onClick={onNext}>
            Weiter mit Teil 2: K, p und t berechnen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
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
        <p>Du hast in Abschnitt 2 noch keine Vermutung festgehalten. Hole das kurz nach, dann siehst du hier, ob du richtig lagst.</p>
      </div>
    )
  }
  const diff = Math.abs(pred.schaetzung - ZINS_A)
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {CHOICE_TEXT[pred.choice]}. Mit Angebot A bekommt Lena etwa {pred.schaetzung} € Zinsen.
      </p>
      <p>
        {pred.choice === 'A' ? (
          <>Das stimmt: Das Tagesgeld bringt mehr ({euro(ZINS_A)} statt {euro(ZINS_B)}). Gut eingeschätzt!</>
        ) : (
          <>
            Tatsächlich bringt das Tagesgeld mehr: {euro(ZINS_A)} statt {euro(ZINS_B)}. Der höhere Zinssatz des Festgelds hat dich in die Irre geführt, das Geld bekommt dort nur 90
            Tage Zinsen.
          </>
        )}
      </p>
      <p>
        Genau sind es <strong>{euro(ZINS_A)}</strong>. Deine Schätzung lag {euro(diff)} daneben.{' '}
        {pred.schaetzung >= 100 ? 'Wahrscheinlich hast du an die Zinsen für ein ganzes Jahr gedacht (115,20 €). „p.a.“ heißt aber pro Jahr.' : ''}
      </p>
    </div>
  )
}
