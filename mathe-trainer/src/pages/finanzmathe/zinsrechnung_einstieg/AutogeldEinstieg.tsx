import { useState, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, McCard, TrackedCheck, TrackedMc } from '../../lineare_funktionen/lernsituation_kit/kit'
import { SeitenLernsituation, type Seite, type Thema } from '../../lineare_funktionen/lernsituation_kit/seiten'
import { GegebenGesucht, Kriterien, VideoAufklappen, Vermutung, Zitat, euro, type Festlegung } from '../zins_kit/zins_kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'

// Lernsituation Zinsrechnung 1 „Lenas Autogeld“: Zinsen für einige Tage berechnen (ca. 45 bis 60 min).
// Format Rollenspiel / Beratungsauftrag: Die SuS sind Azubis in der Bank und beraten Lena. Lernprodukt analog (Antwort an Lena im Heft).
// Instruktionsreihenfolge im ruhigen Grunddesign: Aufgabe → Rechenbeispiel (Jonas, andere Zahlen) → eigene Rechnung (Lena).
// Es wird immer tagesgenau gerechnet (Bankregel: jeder Monat 30 Zinstage, das Jahr 360), nie mit Monaten.
// Aha: Der höhere Zinssatz (Festgeld) bringt weniger, weil das Geld kürzer verzinst wird, und „3 % p.a.“ heißt nicht 3 % vom Betrag.
// Identität: Themenfarbe Petrol, Symbol Auto, Titelbild Auto mit Kalenderblatt, Leitobjekt die Zinstage-Leiste (A 148 Tage, B 90 Tage).
// Die Festlegung bleibt nur im Seitenzustand.

export const VIDEO_ZINSEN = 'https://www.youtube.com/watch?v=bCjboGGTRGs'

/* ── Situation ───────────────────────────────────────────────────────────── */

// Lena legt am 16.05. 4.800 € an und braucht das Geld am 14.10.: 148 Zinstage.
// A: Tagesgeld 2,4 % p.a. → 148 Tage → 47,36 €. B: Festgeld 3,0 % p.a., 90 Tage, danach ohne Zinsen → 36,00 €.
// Erweiterung: 90 Tage Festgeld, dann 58 Tage Tagesgeld → 36,00 € + 18,56 € = 54,56 €.
const K = 4800
const T_GESAMT = 148
const ZINS_A = (K * 2.4 * T_GESAMT) / 36000
const ZINS_B = (K * 3 * 90) / 36000

type Wahl = 'A' | 'B' | 'gleich'
const WAHL: Record<Wahl, string> = {
  A: 'Angebot A (Tagesgeld) bringt mehr',
  B: 'Angebot B (Festgeld) bringt mehr',
  gleich: 'Beide bringen ungefähr gleich viel',
}

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: Lenas erstes Auto, daneben das Kalenderblatt des Autokaufs und ihr Erspartes */
function Titelbild() {
  return (
    <svg viewBox="0 0 720 252" role="img" aria-label="Ein kleines Auto, daneben ein Kalenderblatt mit dem 14.10. und ein Stapel Münzen mit 4.800 Euro.">
      <rect x="0" y="206" width="720" height="46" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="206" y2="206" stroke="var(--ink)" strokeWidth="2" />
      {[60, 180, 300, 420, 540, 660].map((x) => (
        <rect key={x} x={x} y="226" width="56" height="6" rx="3" fill="var(--surface)" />
      ))}
      {/* Auto */}
      <path d="M150 196 L150 158 Q150 146 162 144 L214 138 L250 104 Q256 98 266 98 L352 98 Q362 98 368 106 L398 140 L440 146 Q456 149 456 164 L456 196 Z" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M232 138 L262 110 L304 110 L304 138 Z" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M318 110 L354 110 L380 138 L318 138 Z" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="222" cy="198" r="24" fill="var(--ink)" />
      <circle cx="222" cy="198" r="10" fill="var(--surface)" />
      <circle cx="390" cy="198" r="24" fill="var(--ink)" />
      <circle cx="390" cy="198" r="10" fill="var(--surface)" />
      <rect x="440" y="156" width="14" height="10" rx="2" fill="var(--highlight)" />
      {/* Kalenderblatt */}
      <rect x="520" y="44" width="132" height="128" rx="10" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="520" y="44" width="132" height="34" rx="10" fill="var(--primary)" />
      <rect x="520" y="66" width="132" height="12" fill="var(--primary)" />
      <text x="586" y="68" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">
        Oktober
      </text>
      <text x="586" y="140" textAnchor="middle" fontSize="50" fontWeight="800" fill="var(--ink)">
        14
      </text>
      {/* Erspartes */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx="70" cy={192 - i * 14} rx="38" ry="10" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      ))}
      <text x="70" y="128" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
        4.800 €
      </text>
    </svg>
  )
}

const THEMA: Thema = { name: 'Lenas Autogeld', farbe: 'petrol', icon: 'fa-car-side', bild: <Titelbild /> }

/* ── Leitobjekt: die Zinstage-Leiste ────────────────────────────────────── */

const L = { x0: 24, x1: 656 }
const lx = (tage: number) => L.x0 + (tage / T_GESAMT) * (L.x1 - L.x0)

/** Zeitraum vom 16.05. bis zum 14.10.: Wie lange bekommt Lenas Geld bei A und bei B Zinsen? tage = Zinstage anzeigen */
function ZinstageLeiste({ tage = false }: { tage?: boolean }) {
  return (
    <div className="zk-bild">
      <svg viewBox="0 0 680 236" role="img" aria-label="Zeitleiste vom 16.05. bis zum 14.10. Angebot A verzinst das Geld die ganze Zeit, Angebot B nur die ersten 90 Tage, danach liegt es ohne Zinsen auf dem Girokonto.">
        <text x={L.x0} y="22" fontSize="18" fontWeight="700" fill="var(--ink)">
          16.05. Geld anlegen
        </text>
        <text x={L.x1} y="22" textAnchor="end" fontSize="18" fontWeight="700" fill="var(--ink)">
          14.10. Autokauf
        </text>
        {[30, 60, 90, 120].map((d, i) => (
          <g key={d}>
            <line x1={lx(d)} x2={lx(d)} y1="34" y2="206" stroke="var(--grid)" strokeWidth="2" />
            <text x={lx(d)} y="226" textAnchor="middle" fontSize="16" fill="var(--ink-muted)">
              16.{String(6 + i).padStart(2, '0')}.
            </text>
          </g>
        ))}
        <text x={L.x0} y="58" fontSize="17" fontWeight="700" fill="var(--ink)">
          A: Tagesgeld, 2,4 % p.a.
        </text>
        <rect x={L.x0} y="66" width={L.x1 - L.x0} height="40" rx="8" fill="var(--primary)" />
        <text x={(L.x0 + L.x1) / 2} y="93" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">
          {tage ? '148 Zinstage' : 'Zinsen bis zum Autokauf'}
        </text>
        <text x={L.x0} y="140" fontSize="17" fontWeight="700" fill="var(--ink)">
          B: Festgeld, 3,0 % p.a.
        </text>
        <rect x={L.x0} y="148" width={lx(90) - L.x0} height="40" rx="8" fill="var(--primary)" />
        <text x={(L.x0 + lx(90)) / 2} y="175" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">
          90 Zinstage
        </text>
        <rect x={lx(90) + 4} y="148" width={L.x1 - lx(90) - 4} height="40" rx="8" fill="var(--surface-sunken)" stroke="var(--line-strong)" strokeDasharray="6 4" />
        <text x={(lx(90) + L.x1) / 2} y="175" textAnchor="middle" fontSize="16" fill="var(--ink-muted)">
          Girokonto, keine Zinsen
        </text>
      </svg>
    </div>
  )
}

/* ── Rechenbeispiel: Jonas ──────────────────────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Lenas Bruder Jonas legt <strong>2.700 €</strong> vom <strong>01.03.</strong> bis zum <strong>20.07.</strong> auf ein Tagesgeldkonto mit 2,4 % p.a. Wie viel Zinsen bekommt er?
  </p>
)
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Zinstage nach der Bankregel zählen',
    body: (
      <>
        <p>Vom 01.03. bis zum 01.07. sind es 4 volle Monate zu je 30 Tagen. Bis zum 20.07. kommen 19 Tage dazu.</p>
        <MB>{'t = 4 \\cdot 30 + 19 = 139 \\text{ Tage}'}</MB>
      </>
    ),
  },
  {
    title: 'Zinsen für ein ganzes Jahr',
    body: <MB>{'\\frac{2\\,700 \\cdot 2{,}4}{100} = 64{,}80 \\text{ €}'}</MB>,
  },
  {
    title: 'Zinsen für einen Tag',
    body: (
      <>
        <p>Das Bankjahr hat 360 Tage:</p>
        <MB>{'64{,}80 \\text{ €} : 360 = 0{,}18 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: 'Zinsen für alle Zinstage',
    body: (
      <>
        <MB>{'0{,}18 \\text{ €} \\cdot 139 = 25{,}02 \\text{ €}'}</MB>
        <p>Jonas bekommt 25,02 € Zinsen.</p>
      </>
    ),
  },
  {
    title: 'Alles in einer Formel',
    body: (
      <>
        <p>Jahreszinsen, durch 360, mal die Zinstage: Das lässt sich in einen Bruch schreiben.</p>
        <MB>{'Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360} = \\frac{2\\,700 \\cdot 2{,}4 \\cdot 139}{100 \\cdot 360} = 25{,}02 \\text{ €}'}</MB>
      </>
    ),
  },
]

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function AutogeldEinstieg({ onBack, onPractice, onNext }: { onBack: () => void; onPractice: () => void; onNext: () => void }) {
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 100, fest: false })

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen 1: Zinsen für ein Jahr',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="a) Zinsen für ein Jahr"
          prompt={<p>Ein Sparkonto zahlt 2 % Zinsen pro Jahr. Wie viel Zinsen bringen 3.500 € in einem Jahr?</p>}
          fields={[{ kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 70, unit: '€' }]}
          solution={<MB>{'Z = \\frac{3\\,500 \\cdot 2}{100} = 70 \\text{ €}'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 2: Vom Jahr auf den Tag',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="b) Vom Jahr auf den Tag"
          prompt={<p>Ein Jahresabo für einen Streamingdienst kostet 108 €. Rechne das Jahr mit 360 Tagen. Was kostet ein Tag? Was kosten 50 Tage?</p>}
          fieldsRow
          fields={[
            { kind: 'num', key: 'tag', label: '1 Tag:', expected: 0.3, unit: '€' },
            { kind: 'num', key: 't50', label: '50 Tage:', expected: 15, unit: '€' },
          ]}
          solution={<MB>{'108 \\text{ €} : 360 = 0{,}30 \\text{ €} \\qquad 0{,}30 \\text{ €} \\cdot 50 = 15 \\text{ €}'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 3: Tage zählen wie eine Bank',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="c) Zinstage"
          prompt={
            <>
              <p>
                <strong>Bankregel:</strong> Banken rechnen jeden Monat mit 30 Tagen und das Jahr mit 360 Tagen. Ein 31. zählt wie der 30. Die Tage, für die es Zinsen gibt,
                heißen <strong>Zinstage</strong>.
              </p>
              <p>Wie viele Zinstage liegen zwischen dem 05.03. und dem 05.06.? Und zwischen dem 05.03. und dem 20.06.?</p>
            </>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 'a', label: 'bis 05.06.:', expected: 90, unit: 'Tage' },
            { kind: 'num', key: 'b', label: 'bis 20.06.:', expected: 105, unit: 'Tage' },
          ]}
          solution={
            <>
              <MB>{'3 \\cdot 30 = 90 \\text{ Tage}'}</MB>
              <p>Bis zum 20.06. kommen noch 15 Tage dazu (vom 5. bis zum 20.):</p>
              <MB>{'90 + 15 = 105 \\text{ Tage}'}</MB>
            </>
          }
        />
      ),
    },
    {
      art: 'problem',
      titel: 'Lenas Anfrage',
      bedingung: 'Halte deine Vermutung fest, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Du machst eine Ausbildung in einer Bank. Heute bekommst du diese Anfrage einer Kundin:</p>
          <Zitat wer="Lena, 18 Jahre">
            <p>
              Hallo, ich habe 4.800 € gespart. Am 14.10. kaufe ich mein erstes Auto, bis dahin soll das Geld Zinsen bringen. Heute ist der 16.05. Das Festgeld hat den höheren
              Zinssatz. Dann bekomme ich doch 3 % von 4.800 €, also 144 €, oder? Welches Angebot soll ich nehmen?
            </p>
          </Zitat>
          <ZinstageLeiste />
          <p className="sl-hinweis">„p.a.“ heißt „pro Jahr“ (lateinisch: per annum). Nach den 90 Tagen kommt das Festgeld auf Lenas Girokonto, dort gibt es keine Zinsen.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Lege dich fest, ohne zu rechnen</p>
            <p>Welches Angebot bringt Lena bis zum Autokauf mehr Zinsen? Und wie viel Zinsen bekommt sie ungefähr mit Angebot A?</p>
          </div>
          <Vermutung
            optionen={WAHL}
            regler={{ min: 0, max: 200, step: 5, text: (v) => <>Mit Angebot A bekommt Lena etwa <span className="ls-slider-value">{v} €</span> Zinsen.</> }}
            wert={fest}
            onChange={setFest}
            onFest={fertig}
            gespeichert={(w) => (
              <>
                Deine Vermutung: <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong>, mit Angebot A etwa <strong>{w.wert} €</strong>.
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
            <p className="sl-fokus-titel">Berechne die Zinsen für beide Angebote</p>
            <p>
              Der Zinssatz gilt für ein ganzes Jahr. Lenas Geld liegt aber nur einige Tage auf dem Konto. Berechne, wie viel Zinsen sie mit A und mit B bekommt, und gib ihr eine
              Empfehlung.
            </p>
          </div>
          <GegebenGesucht
            gegeben={<>4.800 €, angelegt vom 16.05. bis zum 14.10., A: 2,4 % p.a. bis zum Schluss, B: 3,0 % p.a. für 90 Tage</>}
            gesucht={<>die Zinsen mit A und mit B</>}
          />
          <ZinstageLeiste />
          <p className="sl-hinweis">Wie das geht, siehst du auf der nächsten Seite an einem Rechenbeispiel. Danach rechnest du selbst.</p>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: "So geht's: Rechenbeispiel",
      frei: true,
      inhalt: () => (
        <>
          <Beispiel offen title="Wie viel Zinsen bekommt Jonas?" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          <VideoAufklappen src={VIDEO_ZINSEN} title="Erklärvideo: Zinsen berechnen" />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Jetzt du: Berechne Lenas Zinsen',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Lenas Zinsen"
          prompt={
            <p>
              Berechne in deinem Heft die Zinstage von Lenas Geld und die Zinsen, die sie mit Angebot A und mit Angebot B bekommt. Trage deine Ergebnisse ein und prüfe sie.
            </p>
          }
          fields={[
            { kind: 'num', key: 't', label: 'Zinstage bis zum Autokauf:', expected: T_GESAMT, unit: 'Tage' },
            { kind: 'num', key: 'a', label: 'Zinsen mit Angebot A:', expected: ZINS_A, unit: '€' },
            { kind: 'num', key: 'b', label: 'Zinsen mit Angebot B:', expected: ZINS_B, unit: '€' },
          ]}
        />
      ),
    },
    {
      art: 'loesen',
      titel: 'Deine Empfehlung für Lena',
      inhalt: (fertig) => (
        <McCard
          onSolved={fertig}
          title="Empfehlung"
          prompt={<p>Welche Empfehlung gibst du Lena?</p>}
          options={[
            {
              text: 'Angebot B: 3 % sind mehr als 2,4 %, also bringt das Festgeld mehr.',
              feedback: 'Der Zinssatz allein entscheidet nicht. Es kommt auch darauf an, wie viele Tage das Geld Zinsen bekommt: 148 Tage bei A, nur 90 Tage bei B.',
            },
            {
              text: 'Angebot B: Lena bekommt 144 € Zinsen.',
              feedback: '144 € gäbe es nur, wenn das Geld ein ganzes Jahr fest liegt. „3 % p.a.“ heißt 3 % pro Jahr, für 90 Tage gibt es nur einen Teil davon.',
            },
            {
              text: 'Angebot A: Mit dem Tagesgeld bekommt sie 47,36 €, mit dem Festgeld nur 36,00 €.',
              correct: true,
              feedback: 'Der Zinssatz ist zwar niedriger, aber das Geld bekommt 148 statt nur 90 Tage lang Zinsen.',
            },
            {
              text: 'Egal: Beide bringen ungefähr gleich viel.',
              feedback: 'Vergleiche deine Ergebnisse: 47,36 € gegen 36,00 €. Das sind über 11 € Unterschied.',
            },
          ]}
        />
      ),
    },
    {
      art: 'loesen',
      titel: 'Für Profis: Geht es noch besser?',
      frei: true,
      inhalt: () => (
        <CheckCard
          title="Festgeld und Tagesgeld kombinieren"
          level="erweiterung"
          prompt={
            <p>
              Lena könnte zuerst 90 Tage das Festgeld nutzen und das Geld danach für die restlichen Tage bis zum 14.10. auf das Tagesgeld legen. Die Festgeld-Zinsen kommen auf
              ihr Girokonto, auf dem Tagesgeld liegen also wieder 4.800 €. Wie viele Tage bleiben für das Tagesgeld, und wie viel Zinsen bekommt sie insgesamt?
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 't', label: 'Tage Tagesgeld:', expected: 58, unit: 'Tage' },
            { kind: 'num', key: 'z', label: 'Zinsen insgesamt:', expected: 54.56, unit: '€' },
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
          <Merke title="Zinsen für einen Teil des Jahres (Tageszinsen)">
            <MB>{'Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360}'}</MB>
            <ul>
              <li>
                <M>K</M> = Kapital in €, <M>p</M> = Zinssatz in % p.a. (pro Jahr), <M>t</M> = Zinstage, <M>Z</M> = Zinsen in €
              </li>
              <li>Gerechnet wird immer tagesgenau: Jeder Monat hat 30 Zinstage, das Jahr 360.</li>
              <li>
                Der Zinssatz gilt pro Jahr. Liegt das Geld kürzer, gibt es nur den Teil <M>{'\\frac{t}{360}'}</M> der Jahreszinsen.
              </li>
              <li>Ein höherer Zinssatz bringt nicht automatisch mehr Zinsen. Es kommt auch auf die Zahl der Zinstage an.</li>
            </ul>
          </Merke>
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Deine Antwort an Lena (Lernprodukt)',
      bedingung: 'Hake alle Punkte ab, die dein Brief enthält.',
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Schreibe Lena eine kurze Antwort in dein Heft</p>
            <p>Gib ihr eine klare Empfehlung und erkläre sie mit deinen Rechnungen. Hake ab, was dein Brief schon enthält.</p>
          </div>
          <Kriterien
            onAlle={fertig}
            items={[
              'Eine klare Empfehlung: Welches Angebot soll Lena nehmen?',
              'Die Zinstage und die Rechnung für beide Angebote',
              'Eine Erklärung, warum Lenas 144 € nicht stimmen',
              'Eine Erklärung, warum der höhere Zinssatz hier weniger bringt',
            ]}
          />
          <p className="sl-hinweis">Satzanfänge, wenn du Hilfe brauchst:</p>
          <ul className="zk-liste">
            <li>„Liebe Lena, vielen Dank für deine Anfrage. Ich empfehle dir …“</li>
            <li>„Dein Geld liegt vom 16.05. bis zum 14.10. auf dem Konto, das sind … Zinstage.“</li>
            <li>„Mit dem Tagesgeld bekommst du …, mit dem Festgeld nur …, weil …“</li>
            <li>„Die 144 € würdest du nur bekommen, wenn …“</li>
          </ul>
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 1: Wie viel Zinsen?',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Zinsrechnung-Einstieg: Tageszinsen (Basis)"
          title="Check 1"
          rechnen
          level="basis"
          prompt={<p>6.000 € werden 60 Tage lang zu 3 % p.a. angelegt. Wie viel Zinsen gibt es?</p>}
          options={[
            { text: '180,00 €', feedback: '180 € sind die Zinsen für ein ganzes Jahr. Das Geld liegt aber nur 60 Tage, also gibt es nur 60/360 davon.' },
            { text: '30,00 €', correct: true, feedback: 'Z = 6.000 · 3 · 60 / (100 · 360) = 30 €.' },
            { text: '1,00 €', feedback: 'Hier wurde t = 2 (Monate) eingesetzt. In die Formel gehören die Zinstage: t = 60.' },
            { text: '29,59 €', feedback: 'Hier wurde mit 365 Tagen gerechnet. Die Bank rechnet das Jahr mit 360 Zinstagen.' },
          ]}
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 2: Wer hat recht?',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Zinsrechnung-Einstieg: Zinstage (Standard)"
          title="Check 2"
          rechnen
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
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 3: Zinstage und Zinsen ganz allein',
      inhalt: (fertig) => (
        <TrackedCheck
          onSolved={fertig}
          topic="Zinsrechnung-Einstieg: Zinstage und Zinsen (Erweiterung)"
          title="Check 3"
          level="erweiterung"
          prompt={
            <p>
              Tim legt am 31.01. 3.000 € zu 2,2 % p.a. auf ein Tagesgeldkonto und hebt das Geld am 15.06. wieder ab. Bestimme die Zinstage nach der Bankregel und berechne die
              Zinsen.
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 135, unit: 'Tage' },
            { kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 24.75, unit: '€' },
          ]}
          solution={
            <>
              <p>Der 31.01. zählt wie der 30.01. Vom 30.01. bis zum 30.06. wären es 5 Monate, der 15.06. liegt 15 Tage davor:</p>
              <MB>{'t = 5 \\cdot 30 - 15 = 135 \\qquad Z = \\frac{3\\,000 \\cdot 2{,}2 \\cdot 135}{100 \\cdot 360} = 24{,}75 \\text{ €}'}</MB>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Erst die Zinstage, dann die Formel. Denk an die Bankregel: Wie zählt ein 31.?</>,
                <>Der 31.01. zählt wie der 30.01. Zähle die vollen Monate bis zum 30.06. und ziehe dann die Tage bis zum 15.06. ab.</>,
                <>
                  <M>{'t = 5 \\cdot 30 - 15 = 135'}</M>. Setze ein: <M>{'Z = \\frac{3\\,000 \\cdot 2{,}2 \\cdot 135}{100 \\cdot 360}'}</M>
                </>,
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
          <p>Du kannst jetzt Zinsen für einige Tage berechnen. In der nächsten Lernsituation drehst du die Formel um und berechnest Kapital, Zinssatz und Zinstage.</p>
          <div className="bk-actions">
            <button type="button" className="bk-btn" onClick={onBack}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
            </button>
            <button type="button" className="bk-btn" onClick={onPractice}>
              Weiter üben: Zinsrechnung
            </button>
            <button type="button" className="bk-btn bk-btn-primary" onClick={onNext}>
              Lernsituation 2: Die Abschlussfahrt-Kasse <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <TaskShell title="Zinsrechnung: Lenas Autogeld" width="wide" kompakt parent={{ to: '/finanzmathe/zinsrechnung', label: 'Zinsrechnung' }}>
      <SeitenLernsituation
        ruhig
        thema={THEMA}
        ziel={<>In dieser Lernsituation berätst du eine Kundin. Du lernst, wie du Zinsen berechnest, wenn Geld nicht ein ganzes Jahr, sondern nur einige Tage angelegt ist.</>}
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Vermutung aus Phase 2 */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  if (!fest.fest || !fest.wahl) return null
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {WAHL[fest.wahl]}, mit Angebot A etwa {fest.wert} €.{' '}
        {fest.wahl === 'A' ? (
          <>Das stimmt: Das Tagesgeld bringt {euro(ZINS_A)}, das Festgeld nur {euro(ZINS_B)}.</>
        ) : (
          <>Tatsächlich bringt das Tagesgeld mehr: {euro(ZINS_A)} statt {euro(ZINS_B)}. Beim Festgeld bekommt das Geld nur 90 Tage lang Zinsen.</>
        )}{' '}
        {fest.wert >= 100 ? 'Mehr als 100 € gäbe es nur für ein ganzes Jahr (115,20 €). „p.a.“ heißt aber pro Jahr.' : `Deine Schätzung lag ${euro(Math.abs(fest.wert - ZINS_A))} daneben.`}
      </p>
    </div>
  )
}
