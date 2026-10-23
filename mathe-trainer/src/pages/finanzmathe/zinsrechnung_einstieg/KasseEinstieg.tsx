import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, McCard, TrackedCheck, TrackedMc } from '../../lineare_funktionen/lernsituation_kit/kit'
import { SeitenLernsituation, type Seite, type Thema } from '../../lineare_funktionen/lernsituation_kit/seiten'
import { GegebenGesucht, Kriterien, VideoAufklappen, Vermutung, euro, type Festlegung } from '../zins_kit/zins_kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'

// Lernsituation Zinsrechnung 2 „Die Abschlussfahrt-Kasse“: Kapital, Zinssatz und Zinstage berechnen (ca. 90 min).
// Früher ein Gruppenpuzzle, jetzt drei Fragen nacheinander (Partnerarbeit erlaubt): K, dann p, dann t.
// Jede Frage: Aufgabe → Rechenbeispiel mit anderen Zahlen → eigene Rechnung. Der Umstell-Trick ist immer gleich:
// erst · 100 · 360, dann durch die beiden anderen Größen teilen. Lernprodukt digital: eigene Aufgabe mit dem Baukasten erstellen.
// Aha: 3.600 € zu 3 % p.a. bringen in 180 Tagen nicht 108 €, sondern nur 54 €. Für 72 € braucht die Klasse 4.800 €.
// Identität: Themenfarbe Beere, Symbol Bus, Titelbild Reisebus mit Klassenkasse, Leitobjekt der Zielbalken (Zinsen bis zum 01.08. gegen 72 €).
// Die Festlegung bleibt nur im Seitenzustand.

export const VIDEO_KPT = 'https://www.youtube.com/watch?v=uz5l8_O1dxs'

/* ── Situation ───────────────────────────────────────────────────────────── */

// Klasse 10b, 24 SuS. Tagesgeld vom 01.02. bis zum 01.08.: 180 Zinstage, 3 % p.a. In der Kasse: 3.600 € (150 € pro Person).
// Ziel 72 € Zinsen fürs Abschlussgrillen. 3.600 € bringen nur 54 €. Für 72 € braucht man 4.800 € (200 € pro Person), 240 Tage oder 4 % p.a.
const T = 180
const ZIEL = 72
const KASSE = 3600
const ZINS_KASSE = (KASSE * 3 * T) / 36000
const K_NOETIG = (ZIEL * 36000) / (3 * T)

type Wahl = 'ja' | 'nein'
const WAHL: Record<Wahl, string> = { ja: 'Ja, die 3.600 € reichen für 72 € Zinsen', nein: 'Nein, die 3.600 € reichen nicht' }

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: Reisebus der Klasse 10b, daneben die Klassenkasse */
function Titelbild() {
  return (
    <svg viewBox="0 0 720 252" role="img" aria-label="Ein Reisebus mit der Aufschrift Abschlussfahrt 10b und eine Geldkassette mit 3.600 Euro.">
      <rect x="0" y="206" width="720" height="46" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="206" y2="206" stroke="var(--ink)" strokeWidth="2" />
      {/* Bus */}
      <rect x="70" y="72" width="390" height="122" rx="18" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={92 + i * 64} y="88" width="52" height="40" rx="6" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      ))}
      <rect x="412" y="88" width="34" height="80" rx="6" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <text x="230" y="164" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">
        Abschlussfahrt 10b
      </text>
      <circle cx="140" cy="196" r="22" fill="var(--ink)" />
      <circle cx="140" cy="196" r="9" fill="var(--surface)" />
      <circle cx="390" cy="196" r="22" fill="var(--ink)" />
      <circle cx="390" cy="196" r="9" fill="var(--surface)" />
      {/* Klassenkasse */}
      <rect x="530" y="112" width="140" height="82" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M530 130 Q600 96 670 130" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <rect x="586" y="124" width="28" height="12" rx="3" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      <text x="600" y="174" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--ink)">
        3.600 €
      </text>
      <text x="600" y="92" textAnchor="middle" fontSize="17" fill="var(--ink-muted)">
        Klassenkasse
      </text>
    </svg>
  )
}

const THEMA: Thema = { name: 'Die Abschlussfahrt-Kasse', farbe: 'beere', icon: 'fa-bus', bild: <Titelbild /> }

/* ── Leitobjekt: Zielbalken ─────────────────────────────────────────────── */

const B = { x0: 20, x1: 660, max: 90 }
const bx = (v: number) => B.x0 + (v / B.max) * (B.x1 - B.x0)

/** Zinsen bis zum 01.08. im Vergleich zum Ziel von 72 €. ist = Zinsen der Kasse (sonst „?“) */
function ZielBalken({ ist }: { ist?: number }) {
  return (
    <div className="zk-bild">
      <svg viewBox="0 0 680 150" role="img" aria-label={`Balken: Ziel sind 72 Euro Zinsen bis zum 01.08. ${ist === undefined ? 'Wie viel die Kasse bringt, ist noch offen.' : `Die Kasse bringt ${fmt(ist, 2)} Euro.`}`}>
        <text x={B.x0} y="24" fontSize="18" fontWeight="700" fill="var(--ink)">
          Zinsen der Kasse bis zum 01.08.
        </text>
        <rect x={B.x0} y="40" width={B.x1 - B.x0} height="44" rx="8" fill="var(--surface-sunken)" />
        {ist !== undefined ? (
          <>
            <rect x={B.x0} y="40" width={bx(ist) - B.x0} height="44" rx="8" fill="var(--primary)" />
            <text x={bx(ist) - 12} y="69" textAnchor="end" fontSize="19" fontWeight="800" fill="#fff">
              {euro(ist)}
            </text>
          </>
        ) : (
          <text x={B.x0 + 16} y="69" fontSize="22" fontWeight="800" fill="var(--ink-muted)">
            ?
          </text>
        )}
        <line x1={bx(ZIEL)} x2={bx(ZIEL)} y1="32" y2="96" stroke="var(--ink)" strokeWidth="3" />
        <text x={bx(ZIEL)} y="118" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--ink)">
          Ziel: 72 €
        </text>
        <text x={bx(ZIEL)} y="140" textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
          Abschlussgrillen
        </text>
        {[0, 30, 90].map((v) => (
          <text key={v} x={bx(v)} y="118" textAnchor={v === 0 ? 'start' : v === 90 ? 'end' : 'middle'} fontSize="15" fill="var(--ink-muted)">
            {v} €
          </text>
        ))}
      </svg>
    </div>
  )
}

/* ── Rechenbeispiele: eine Formel, dreimal umgestellt ──────────────────── */

type Gesucht = 'K' | 'p' | 't'

const UMSTELLEN: Record<Gesucht, { teiler: string; formel: string }> = {
  K: { teiler: 'p \\cdot t', formel: 'K = \\frac{Z \\cdot 100 \\cdot 360}{p \\cdot t}' },
  p: { teiler: 'K \\cdot t', formel: 'p = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot t}' },
  t: { teiler: 'K \\cdot p', formel: 't = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot p}' },
}

const BEISPIEL: Record<Gesucht, { titel: string; aufgabe: ReactNode; einsetzen: string; ergebnis: string; antwort: string }> = {
  K: {
    titel: 'Wie viel Geld braucht der Sportverein?',
    aufgabe: <p>Der Sportverein möchte in 120 Tagen 30 € Zinsen für neue Bälle bekommen. Das Sparkonto zahlt 2 % p.a. Wie viel Geld muss er anlegen?</p>,
    einsetzen: 'K = \\frac{30 \\cdot 100 \\cdot 360}{2 \\cdot 120}',
    ergebnis: 'K = \\frac{1\\,080\\,000}{240} = 4\\,500',
    antwort: 'Der Verein muss 4.500 € anlegen.',
  },
  p: {
    titel: 'Welchen Zinssatz zahlt das Konto?',
    aufgabe: <p>3.000 € liegen 90 Tage auf einem Konto und bringen 15 € Zinsen. Wie hoch ist der Zinssatz?</p>,
    einsetzen: 'p = \\frac{15 \\cdot 100 \\cdot 360}{3\\,000 \\cdot 90}',
    ergebnis: 'p = \\frac{540\\,000}{270\\,000} = 2',
    antwort: 'Der Zinssatz beträgt 2 % p.a.',
  },
  t: {
    titel: 'Wie lange muss das Geld liegen?',
    aufgabe: <p>6.000 € werden zu 2 % p.a. angelegt. Nach wie vielen Tagen gibt es 20 € Zinsen?</p>,
    einsetzen: 't = \\frac{20 \\cdot 100 \\cdot 360}{6\\,000 \\cdot 2}',
    ergebnis: 't = \\frac{720\\,000}{12\\,000} = 60',
    antwort: 'Nach 60 Tagen gibt es 20 € Zinsen.',
  },
}

function UmstellBeispiel({ g }: { g: Gesucht }) {
  const b = BEISPIEL[g]
  const u = UMSTELLEN[g]
  return (
    <Beispiel
      offen
      title={b.titel}
      aufgabe={b.aufgabe}
      steps={[
        {
          title: 'Bruch loswerden',
          body: (
            <>
              <p>Beide Seiten der Zinsformel mal 100 · 360 nehmen:</p>
              <MB>{'Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360} \\quad \\Rightarrow \\quad Z \\cdot 100 \\cdot 360 = K \\cdot p \\cdot t'}</MB>
            </>
          ),
        },
        {
          title: (
            <>
              Durch <M>{u.teiler}</M> teilen
            </>
          ),
          body: (
            <>
              <p>
                Rechts steht <M>{g}</M> mal <M>{u.teiler}</M>. Teile beide Seiten durch <M>{u.teiler}</M>:
              </p>
              <MB>{u.formel}</MB>
            </>
          ),
        },
        { title: 'Einsetzen und ausrechnen', body: <MB>{`${b.einsetzen} \\qquad ${b.ergebnis}`}</MB> },
        { title: 'Antwort', body: <p>{b.antwort} Probe: Setze das Ergebnis in die Zinsformel ein. Es müssen wieder die Zinsen herauskommen.</p> },
      ]}
    />
  )
}

/* ── Lernprodukt: Aufgaben-Baukasten ───────────────────────────────────── */

function Baukasten({ onFertig }: { onFertig: () => void }) {
  const uid = useId()
  const [g, setG] = useState<Gesucht>('K')
  const [werte, setWerte] = useState<Record<'Z' | Gesucht, string>>({ Z: '', K: '', p: '', t: '' })
  const [loesungAuf, setLoesungAuf] = useState(false)

  const gegeben = (['Z', 'K', 'p', 't'] as const).filter((x) => x !== g)
  const zahl = (x: 'Z' | Gesucht) => parseInput(werte[x])?.value
  const vollstaendig = gegeben.every((x) => (zahl(x) ?? 0) > 0)
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
  if (vollstaendig && p != null && p > 6) warnungen.push('Der Zinssatz ist höher als 6 % p.a. Das ist für ein Sparkonto unrealistisch.')
  if (vollstaendig && t != null && t > 360) warnungen.push('Die Laufzeit ist länger als ein Jahr. Für diese Formel sollten es höchstens 360 Tage sein.')

  const label: Record<'Z' | Gesucht, string> = { Z: 'Zinsen Z in €', K: 'Kapital K in €', p: 'Zinssatz p in % p.a.', t: 'Zinstage t' }
  const einheit: Record<Gesucht, string> = { K: '€', p: '% p.a.', t: 'Tage' }

  return (
    <div className="zk-bau" data-no-autocheck>
      <label className="zk-bau-feld" htmlFor={`${uid}-g`}>
        <span>Gesucht ist</span>
        <select
          id={`${uid}-g`}
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
      </label>
      {gegeben.map((x) => (
        <label key={x} className="zk-bau-feld" htmlFor={`${uid}-${x}`}>
          <span>{label[x]}</span>
          <input
            id={`${uid}-${x}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className="bk-input lp-input lp-input-md"
            value={werte[x]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setWerte({ ...werte, [x]: e.target.value })
              setLoesungAuf(false)
            }}
          />
        </label>
      ))}
      {warnungen.map((w) => (
        <p key={w} className="sl-hinweis">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> {w}
        </p>
      ))}
      {ergebnis !== null && (
        <div>
          <button
            type="button"
            className="bk-btn bk-btn-sm"
            onClick={() => {
              setLoesungAuf((o) => !o)
              onFertig()
            }}
          >
            <i className="fa-solid fa-key" aria-hidden="true" /> {loesungAuf ? 'Lösung verbergen' : 'Lösung für dich anzeigen'}
          </button>
        </div>
      )}
      {loesungAuf && ergebnis !== null && (
        <p className="sl-text">
          <M>{UMSTELLEN[g].formel}</M> ergibt <strong>{g === 'K' ? euro(ergebnis) : `${fmt(ergebnis, 2)} ${einheit[g]}`}</strong>.
          {g === 't' && Math.abs(ergebnis - Math.round(ergebnis)) > 1e-9 ? ' Tipp: Wähle die Zahlen so, dass ganze Tage herauskommen.' : ''}
        </p>
      )}
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function KasseEinstieg({ onBack, onPractice, onPrev }: { onBack: () => void; onPractice: () => void; onPrev: () => void }) {
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 4000, fest: false })
  const [produkt, setProdukt] = useState({ bau: false, haken: false })

  const fragePage = (g: Gesucht, titel: ReactNode, frage: ReactNode, gegeben: ReactNode, gesucht: ReactNode, video = false): Seite => ({
    art: 'loesen',
    titel,
    frei: true,
    inhalt: () => (
      <>
        <div className="sl-fokus">
          <p className="sl-fokus-titel">Eure Aufgabe</p>
          <p>{frage}</p>
        </div>
        <GegebenGesucht gegeben={gegeben} gesucht={gesucht} />
        <p className="sl-hinweis">So stellst du die Zinsformel um, an einem Beispiel mit anderen Zahlen:</p>
        <UmstellBeispiel g={g} />
        {video && <VideoAufklappen src={VIDEO_KPT} title="Erklärvideo: Kapital, Zinssatz und Zinstage berechnen" />}
      </>
    ),
  })

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen 1: Zinsen berechnen',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="a) Zinsen berechnen"
          prompt={<p>2.400 € liegen 90 Tage zu 2 % p.a. auf einem Konto. Wie viel Zinsen gibt es?</p>}
          fields={[{ kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 12, unit: '€' }]}
          solution={<MB>{'Z = \\frac{2\\,400 \\cdot 2 \\cdot 90}{100 \\cdot 360} = \\frac{432\\,000}{36\\,000} = 12 \\text{ €}'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 2: Gleichungen umstellen',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
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
              <p>Einen Bruch wirst du los, indem du mit dem Nenner malnimmst. Danach teilst du durch die Zahl, die bei x steht.</p>
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
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 3: Zinstage',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="c) Zinstage"
          prompt={<p>Wie viele Zinstage liegen zwischen dem 01.02. und dem 01.08.? (Bankregel: jeder Monat 30 Tage)</p>}
          fields={[{ kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 180, unit: 'Tage' }]}
          solution={<MB>{'6 \\cdot 30 = 180 \\text{ Tage}'}</MB>}
        />
      ),
    },
    {
      art: 'problem',
      titel: 'Reicht das Geld fürs Abschlussgrillen?',
      bedingung: 'Halte deine Vermutung fest, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Die Klasse 10b (24 Schülerinnen und Schüler) fährt im Sommer auf Abschlussfahrt. In der Klassenkasse liegen schon <strong>3.600 €</strong>. Das Geld liegt vom{' '}
            <strong>01.02.</strong> bis zum <strong>01.08.</strong> auf einem Tagesgeldkonto mit <strong>3 % p.a.</strong> Von den Zinsen soll das Abschlussgrillen bezahlt werden:{' '}
            <strong>72 €</strong>.
          </p>
          <ZielBalken />
          <p className="sl-text">An der Pinnwand der Klasse hängen drei Fragen:</p>
          <ol className="zk-liste">
            <li>
              <strong>Emma, Klassensprecherin:</strong> „Wie viel Geld muss in der Kasse liegen, damit bis zum 01.08. genau 72 € Zinsen zusammenkommen?“
            </li>
            <li>
              <strong>Noah, Kassenwart:</strong> „Eine andere Bank verspricht: 4.800 € bringen in 180 Tagen 84 € Zinsen. Welcher Zinssatz ist das?“
            </li>
            <li>
              <strong>Frau Yilmaz, Klassenleitung:</strong> „Wie lange müssten unsere 3.600 € bei 3 % liegen, bis 72 € Zinsen zusammen sind?“
            </li>
          </ol>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Lege dich fest, ohne zu rechnen</p>
            <p>Reichen die 3.600 € in der Kasse für 72 € Zinsen? Wie viel Geld bräuchte die Klasse dafür ungefähr?</p>
          </div>
          <Vermutung
            optionen={WAHL}
            regler={{
              min: 500,
              max: 10000,
              step: 100,
              text: (v) => (
                <>
                  Für 72 € Zinsen braucht die Klasse etwa <span className="ls-slider-value">{fmt(v, 0)} €</span>.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig}
            gespeichert={(w) => (
              <>
                Deine Vermutung: <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong>. Nötig sind etwa <strong>{fmt(w.wert, 0)} €</strong>.
              </>
            )}
          />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Deine Aufgabe',
      frei: true,
      inhalt: () => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Beantwortet die drei Fragen von der Pinnwand</p>
            <p>
              Diesmal sind die Zinsen bekannt. Gesucht sind einmal das Kapital <M>K</M>, einmal der Zinssatz <M>p</M> und einmal die Zinstage <M>t</M>. Dafür stellt ihr die
              Zinsformel um.
            </p>
          </div>
          <MB>{'Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360}'}</MB>
          <p className="sl-text">
            Arbeitet zu zweit. Bei jeder Frage erklärt abwechselnd eine Person den Rechenweg, die andere rechnet mit. Ihr löst die Fragen nacheinander: Bei jeder seht ihr zuerst ein
            Rechenbeispiel, dann rechnet ihr selbst.
          </p>
        </>
      ),
    },
    fragePage(
      'K',
      'Emmas Frage: Wie viel Kapital?',
      <>Wie viel Geld muss in der Kasse liegen, damit es vom 01.02. bis zum 01.08. bei 3 % p.a. genau 72 € Zinsen gibt?</>,
      <>
        <M>{'Z = 72'}</M> €, <M>{'p = 3'}</M>, <M>{'t = 180'}</M> Tage
      </>,
      <>
        das Kapital <M>K</M>
      </>,
      true,
    ),
    {
      art: 'loesen',
      titel: 'Jetzt ihr: Emmas Frage',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Kapital berechnen"
          level="standard"
          prompt={<p>Berechnet in eurem Heft, wie viel Geld in der Kasse liegen muss, damit es bis zum 01.08. genau 72 € Zinsen gibt, und wie viel dann jede der 24 Personen einzahlen muss. Tragt eure Ergebnisse ein und prüft sie.</p>}
          fields={[
            { kind: 'num', key: 'k', label: 'Nötiges Kapital:', expected: K_NOETIG, unit: '€' },
            { kind: 'num', key: 'pp', label: 'Pro Person:', expected: K_NOETIG / 24, unit: '€' },
          ]}
          loesungNachFehler
          solution={
            <>
              <MB>{'K = \\frac{72 \\cdot 100 \\cdot 360}{3 \\cdot 180} = \\frac{2\\,592\\,000}{540} = 4\\,800 \\qquad 4\\,800 \\text{ €} : 24 = 200 \\text{ €}'}</MB>
              <p>
                Probe: <M>{'\\frac{4\\,800 \\cdot 3 \\cdot 180}{36\\,000} = 72'}</M> ✓
              </p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Gesucht ist das Kapital. Ihr kennt Z = 72 €, p = 3 und t = 180.</>,
                <>Nehmt die Formel für K aus dem Beispiel: oben Z · 100 · 360, unten p · t. Danach teilt ihr das Kapital durch 24.</>,
                <>
                  Oben: <M>{'72 \\cdot 100 \\cdot 360 = 2\\,592\\,000'}</M>, unten: <M>{'3 \\cdot 180 = 540'}</M>. Jetzt teilen.
                </>,
              ]}
            />
          }
        />
      ),
    },
    fragePage(
      'p',
      'Noahs Frage: Welcher Zinssatz?',
      <>Eine andere Bank verspricht: 4.800 € bringen in 180 Tagen 84 € Zinsen. Welcher Zinssatz steckt dahinter?</>,
      <>
        <M>{'K = 4\\,800'}</M> €, <M>{'t = 180'}</M> Tage, <M>{'Z = 84'}</M> €
      </>,
      <>
        der Zinssatz <M>p</M>
      </>,
    ),
    {
      art: 'loesen',
      titel: 'Jetzt ihr: Noahs Frage',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Zinssatz berechnen"
          level="standard"
          prompt={<p>Berechnet in eurem Heft den Zinssatz, den Noahs Bank zahlt. Tragt euer Ergebnis ein und prüft es.</p>}
          fields={[
            { kind: 'num', key: 'p', label: 'Zinssatz:', expected: 3.5, unit: '% p.a.' },
          ]}
          loesungNachFehler
          solution={
            <>
              <MB>{'p = \\frac{84 \\cdot 100 \\cdot 360}{4\\,800 \\cdot 180} = \\frac{3\\,024\\,000}{864\\,000} = 3{,}5'}</MB>
              <p>Noahs Bank zahlt 3,5 % p.a.</p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Gesucht ist der Zinssatz. Ihr kennt K = 4.800 €, t = 180 und Z = 84 €.</>,
                <>Nehmt die Formel für p: oben Z · 100 · 360, unten K · t.</>,
                <>
                  Oben: <M>{'84 \\cdot 100 \\cdot 360 = 3\\,024\\,000'}</M>, unten: <M>{'4\\,800 \\cdot 180 = 864\\,000'}</M>.
                </>,
              ]}
            />
          }
        />
      ),
    },
    fragePage(
      't',
      'Frau Yilmaz’ Frage: Wie viele Tage?',
      <>Wie lange müssten die 3.600 € bei 3 % p.a. liegen, bis 72 € Zinsen zusammen sind? Reicht die Zeit bis zum 01.08.?</>,
      <>
        <M>{'K = 3\\,600'}</M> €, <M>{'p = 3'}</M>, <M>{'Z = 72'}</M> €
      </>,
      <>
        die Zinstage <M>t</M>
      </>,
    ),
    {
      art: 'loesen',
      titel: 'Jetzt ihr: Frau Yilmaz’ Frage',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Zinstage berechnen"
          level="standard"
          prompt={<p>Berechnet in eurem Heft, wie viele Tage die 3.600 € bei 3 % p.a. liegen müssten, bis 72 € Zinsen zusammen sind. Tragt euer Ergebnis ein und entscheidet, ob die Zeit bis zum 01.08. reicht.</p>}
          fields={[
            { kind: 'num', key: 't', label: 'Zinstage:', expected: 240, unit: 'Tage' },
            { kind: 'select', key: 'r', label: 'Reicht die Zeit bis zum 01.08.?', options: ['Ja, 180 Tage genügen', 'Nein, 180 Tage sind zu wenig'], expected: 1 },
          ]}
          loesungNachFehler
          solution={
            <>
              <MB>{'t = \\frac{72 \\cdot 100 \\cdot 360}{3\\,600 \\cdot 3} = \\frac{2\\,592\\,000}{10\\,800} = 240'}</MB>
              <p>Das Geld müsste 240 Tage liegen, bis zum 01.08. sind es aber nur 180 Tage.</p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Gesucht sind die Zinstage. Ihr kennt K = 3.600 €, p = 3 und Z = 72 €.</>,
                <>Nehmt die Formel für t: oben Z · 100 · 360, unten K · p.</>,
                <>
                  Oben: <M>{'2\\,592\\,000'}</M>, unten: <M>{'3\\,600 \\cdot 3 = 10\\,800'}</M>. Vergleicht das Ergebnis mit 180.
                </>,
              ]}
            />
          }
        />
      ),
    },
    {
      art: 'loesen',
      titel: 'Eure Empfehlung für die Klasse',
      inhalt: (fertig) => (
        <McCard
          onSolved={fertig}
          title="Empfehlung"
          prompt={<p>Was empfehlt ihr der Klasse 10b, damit das Abschlussgrillen bis zum 01.08. bezahlt ist?</p>}
          options={[
            { text: 'Nichts ändern: 3 % von 3.600 € sind 108 €, das reicht locker.', feedback: '108 € gäbe es nur für ein ganzes Jahr. Das Geld liegt aber nur 180 Tage, das bringt 54 €.' },
            {
              text: 'Jede Person zahlt 200 € statt 150 € ein. Dann liegen 4.800 € in der Kasse, und es gibt genau 72 € Zinsen.',
              correct: true,
              feedback: 'Mit 4.800 € reicht es: bei 3 % genau 72 €, bei Noahs Bank mit 3,5 % sogar 84 €.',
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
      ),
    },
    {
      art: 'sichern',
      titel: 'Das hältst du fest',
      frei: true,
      inhalt: () => (
        <>
          <Rueckbezug fest={fest} />
          <ZielBalken ist={ZINS_KASSE} />
          <Merke title="Die Zinsformel umstellen">
            <p>Mit „mal 100 · 360“ wird aus der Zinsformel eine Gleichung ohne Bruch. Dann teilst du durch die beiden anderen Größen:</p>
            <MB>{'K = \\frac{Z \\cdot 100 \\cdot 360}{p \\cdot t} \\qquad p = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot t} \\qquad t = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot p}'}</MB>
            <ul>
              <li>Immer tagesgenau rechnen: t in Tagen, jeder Monat 30 Tage, das Jahr 360 Tage.</li>
              <li>Probe: Ergebnis in die Zinsformel einsetzen. Es müssen wieder die Zinsen herauskommen.</li>
              <li>Größenordnung prüfen: Für wenige Euro Zinsen braucht man viel Kapital oder viel Zeit.</li>
            </ul>
          </Merke>
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Erfinde eine Aufgabe für die Pinnwand (Lernprodukt)',
      bedingung: 'Lass dir die Lösung anzeigen und hake alle Punkte ab.',
      inhalt: (fertig) => {
        const pruefe = (neu: typeof produkt) => {
          setProdukt(neu)
          if (neu.bau && neu.haken) fertig()
        }
        return (
          <>
            <div className="sl-fokus">
              <p className="sl-fokus-titel">Erfinde eine eigene Zinsaufgabe</p>
              <p>
                Gesucht ist <M>K</M>, <M>p</M> oder <M>t</M>. Schreibe die Aufgabe mit einer kleinen Geschichte in dein Heft. Der Baukasten rechnet die Lösung für dich aus. Tauscht
                danach eure Aufgaben und löst sie im Heft.
              </p>
            </div>
            <Baukasten onFertig={() => pruefe({ ...produkt, bau: true })} />
            <Kriterien
              onAlle={() => pruefe({ ...produkt, haken: true })}
              items={[
                'Eine kleine Geschichte aus deinem Alltag und eine klare Frage',
                'Genau eine gesuchte Größe, die anderen drei sind gegeben',
                'Realistische Zahlen: Zinssatz höchstens 6 % p.a., höchstens 360 Tage',
                'Aufgabe mit einer Partnerin oder einem Partner getauscht und gelöst',
              ]}
            />
          </>
        )
      },
    },
    {
      art: 'sichern',
      titel: 'Check 1: Die richtige Formel',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Zinsrechnung-Einstieg 2: Formel umstellen (Basis)"
          title="Check 1"
          level="basis"
          prompt={<p>Welche Formel berechnet die Zinstage t?</p>}
          options={[
            { text: <M>{'t = \\frac{K \\cdot p \\cdot 100 \\cdot 360}{Z}'}</M>, feedback: 'Hier sind Zähler und Nenner vertauscht. Z gehört nach oben, K und p nach unten.' },
            { text: <M>{'t = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot p}'}</M>, correct: true, feedback: 'Erst mal 100 · 360, dann durch K · p teilen.' },
            { text: <M>{'t = \\frac{Z \\cdot K \\cdot p}{100 \\cdot 360}'}</M>, feedback: 'Das ist die Zinsformel mit Z an der falschen Stelle. Beim Umstellen wandern 100 · 360 nach oben.' },
            { text: <M>{'t = \\frac{Z}{K \\cdot p}'}</M>, feedback: 'Hier fehlt 100 · 360 im Zähler. Ohne diese Zahlen wird t viel zu klein.' },
          ]}
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 2: Kapital berechnen',
      inhalt: (fertig) => (
        <TrackedCheck
          onSolved={fertig}
          topic="Zinsrechnung-Einstieg 2: Kapital (Standard)"
          title="Check 2"
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
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 3: Wer hat recht?',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Zinsrechnung-Einstieg 2: Zinssatz (Standard)"
          title="Check 3"
          rechnen
          level="standard"
          prompt={<p>2.000 € liegen 90 Tage auf einem Konto und bringen 10 € Zinsen. Ben rechnet p = 0,02. Lea rechnet p = 2. Ali rechnet p = 0,5. Wer hat recht?</p>}
          options={[
            { text: 'Ben: 0,02 % p.a.', feedback: 'Ben hat die 100 vergessen: 10 · 360 / (2.000 · 90) = 0,02. Richtig ist 10 · 100 · 360 / (2.000 · 90).' },
            { text: 'Lea: 2 % p.a.', correct: true, feedback: 'p = 10 · 100 · 360 / (2.000 · 90) = 360.000 / 180.000 = 2.' },
            { text: 'Ali: 0,5 % p.a.', feedback: 'Ali hat den Bruch auf den Kopf gestellt: 2.000 · 90 / (10 · 100 · 360) = 0,5. Z · 100 · 360 gehört nach oben.' },
            { text: 'Niemand, man kann p aus diesen Angaben nicht berechnen.', feedback: 'K, t und Z sind gegeben. Damit lässt sich p mit der umgestellten Formel berechnen.' },
          ]}
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 4: Wann ist das Ziel erreicht?',
      inhalt: (fertig) => (
        <TrackedCheck
          onSolved={fertig}
          topic="Zinsrechnung-Einstieg 2: Zinstage und Datum (Erweiterung)"
          title="Check 4"
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
              <p>Vom 10.03. sind es 60 Tage bis zum 10.05., dazu 15 Tage: Am 25.05. hat Mira die 25 € zusammen.</p>
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
      ),
    },
    {
      art: 'sichern',
      titel: 'Geschafft!',
      frei: true,
      inhalt: () => (
        <div className="sl-ende">
          <p>Du kannst jetzt die Zinsformel umstellen und Kapital, Zinssatz und Zinstage berechnen. Übe das mit weiteren Aufgaben.</p>
          <div className="bk-actions">
            <button type="button" className="bk-btn" onClick={onPrev}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Lernsituation 1: Lenas Autogeld
            </button>
            <button type="button" className="bk-btn" onClick={onBack}>
              Zurück zur Auswahl
            </button>
            <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
              Weiter üben: Zinsrechnung <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <TaskShell title="Zinsrechnung: Die Abschlussfahrt-Kasse" width="wide" kompakt parent={{ to: '/finanzmathe/zinsrechnung', label: 'Zinsrechnung' }}>
      <SeitenLernsituation
        ruhig
        thema={THEMA}
        ziel={<>In dieser Lernsituation hilfst du der Klasse 10b. Du stellst die Zinsformel um und berechnest damit das Kapital, den Zinssatz und die Zinstage.</>}
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Vermutung aus Phase 2 */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  if (!fest.fest || !fest.wahl) return null
  const diff = Math.abs(fest.wert - K_NOETIG)
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {WAHL[fest.wahl]}, nötig sind etwa {fmt(fest.wert, 0)} €.{' '}
        {fest.wahl === 'nein' ? (
          <>Das stimmt: Die 3.600 € bringen bis zum 01.08. nur {euro(ZINS_KASSE)}.</>
        ) : (
          <>Die 3.600 € bringen bis zum 01.08. nur {euro(ZINS_KASSE)}, nicht 108 €. „3 % p.a.“ gilt für ein ganzes Jahr, das Geld liegt aber nur 180 Tage.</>
        )}{' '}
        Für 72 € braucht die Klasse {euro(K_NOETIG)}, also 200 € pro Person. {diff < 1e-9 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${fmt(diff, 0)} € daneben.`}
      </p>
    </div>
  )
}
