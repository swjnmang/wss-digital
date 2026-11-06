import { type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { useSitzungState } from '../../../hooks/useSitzung'
import { Beispiel, M, MB, Merke, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, Loesungsweg, McCard, TrackedCheck, TrackedMc } from '../../lineare_funktionen/lernsituation_kit/kit'
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Handlungsprodukt,
  SeitenLernsituation,
  THEMEN,
  type Bildwelt,
  type Seite,
  type Thema,
} from '../../lineare_funktionen/lernsituation_kit/seiten'
import { Bilanz } from '../../lineare_funktionen/lernsituation_kit/punkte'
import AuswahlSpiel, { mischen, zufall, type AuswahlRunde } from '../../lineare_funktionen/lernsituation_kit/AuswahlSpiel'
import { GegebenGesucht, Kriterien, Vermutung, euro, standardKriterien, type Festlegung } from '../zins_kit/zins_kit'
import titelBild from './bilder/kasse-titel.webp'
import pinnwandBild from './bilder/kasse-pinnwand.webp'
import aushangBild from './bilder/kasse-aushang.webp'
import '../../daten_und_zufall/lernpfad/lernpfad.css'

// Lernsituation Zinsrechnung 2 „Die Abschlussfahrt-Kasse“: Kapital, Zinssatz und Zinstage berechnen (ca. 90 min).
// Format: drei Fragen von der Pinnwand der Klasse nacheinander (Einzel- oder Partnerarbeit): K, dann p, dann t, jede auf einer eigenen Seite.
// Jede Frage: Aufgabe → Rechenbeispiel mit anderen Zahlen und Lernvideo → Ergebnisse abgleichen. Der Umstell-Trick ist immer gleich:
// erst · 100 · 360, dann durch die beiden anderen Größen teilen. Handlungsprodukt analog: Aushang an die Klasse im Heft.
// Aha: 3.600 € zu 3 % p.a. bringen in 180 Tagen nicht 108 €, sondern nur 54 €. Für 72 € braucht die Klasse 4.800 €.
// Identität: Themenfarbe Beere, Symbol Bus, Titelbild Reisebus mit Klassenkasse, Leitobjekt der Zielbalken (Zinsen bis zum 01.08. gegen 72 €).
// Punkte nach Aufwand: Warm-up 3/3/2/2/3 = 13, Festlegung, Teil 1 12, Teil 2 8, Teil 3 8, Empfehlung 4, Aushang, Übungen 4/6/8, Profi 9;
// Bonus-Spiel „Geldsack-Jagd“ 4 Runden à 2.
// Bildwelt Siebdruck / schwarz (Beere + Schwarz): Titelbild, Pinnwand und Aushang sind gerenderte WebP-Dateien aus bilder-quelle/kasse-*.bild.html
// (Bausteine in bilder-quelle/_siebdruck.js); Zielbalken und Zinsformel bleiben live.

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

const THEMA: Thema = {
  name: 'Die Abschlussfahrt-Kasse',
  farbe: 'beere',
  icon: 'fa-bus',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Siebdruck-Plakat in Beere und Schwarz: Abschlussfahrt 10b, 01.02. bis 01.08., 3 % p.a. Ein Reisebus der Klasse 10b, daneben die Klassenkasse mit 3.600 € und ein runder Stempel: 72 € fürs Grillen?"
    />
  ),
}
const BILDWELT: Bildwelt = { welt: 'siebdruck', variante: 'schwarz' }

/* ── Leitobjekt: Zielbalken ─────────────────────────────────────────────── */

const B = { x0: 20, x1: 660, max: 90 }
const bx = (v: number) => B.x0 + (v / B.max) * (B.x1 - B.x0)

/** Zinsen bis zum 01.08. im Vergleich zum Ziel von 72 €. ist = Zinsen der Kasse (sonst „?“) */
function ZielBalken({ ist }: { ist?: number }) {
  return (
    <div className="zk-bild">
      <svg
        viewBox="0 0 680 150"
        role="img"
        aria-label={`Balken: Ziel sind 72 Euro Zinsen bis zum 01.08. ${ist === undefined ? 'Wie viel die Kasse bringt, ist noch offen.' : `Die Kasse bringt ${fmt(ist, 2)} Euro.`}`}
      >
        <text x={B.x0} y="24" fontSize="18" fontWeight="700" fill="var(--ink)">
          Zinsen der Kasse bis zum 01.08.
        </text>
        <rect x={B.x0} y="40" width={B.x1 - B.x0} height="44" fill="var(--surface-sunken)" />
        {ist !== undefined ? (
          <>
            <rect x={B.x0} y="40" width={bx(ist) - B.x0} height="44" fill="var(--primary)" />
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
  K: { teiler: 'p \\cdot t', formel: 'K = \\dfrac{Z \\cdot 100 \\cdot 360}{p \\cdot t}' },
  p: { teiler: 'K \\cdot t', formel: 'p = \\dfrac{Z \\cdot 100 \\cdot 360}{K \\cdot t}' },
  t: { teiler: 'K \\cdot p', formel: 't = \\dfrac{Z \\cdot 100 \\cdot 360}{K \\cdot p}' },
}

const BEISPIEL: Record<Gesucht, { titel: string; aufgabe: ReactNode; einsetzen: string; ergebnis: string; antwort: string }> = {
  K: {
    titel: 'Wie viel Geld braucht der Sportverein?',
    aufgabe: <p>Der Sportverein möchte in 120 Tagen 30 € Zinsen für neue Bälle bekommen. Das Sparkonto zahlt 2 % p.a. Wie viel Geld muss er anlegen?</p>,
    einsetzen: 'K = \\dfrac{30 \\cdot 100 \\cdot 360}{2 \\cdot 120}',
    ergebnis: 'K = \\dfrac{1\\,080\\,000}{240} = 4\\,500',
    antwort: 'Der Verein muss 4.500 € anlegen.',
  },
  p: {
    titel: 'Welchen Zinssatz zahlt das Konto?',
    aufgabe: <p>3.000 € liegen 90 Tage auf einem Konto und bringen 15 € Zinsen. Wie hoch ist der Zinssatz?</p>,
    einsetzen: 'p = \\dfrac{15 \\cdot 100 \\cdot 360}{3\\,000 \\cdot 90}',
    ergebnis: 'p = \\dfrac{540\\,000}{270\\,000} = 2',
    antwort: 'Der Zinssatz beträgt 2 % p.a.',
  },
  t: {
    titel: 'Wie lange muss das Geld liegen?',
    aufgabe: <p>6.000 € werden zu 2 % p.a. angelegt. Nach wie vielen Tagen gibt es 20 € Zinsen?</p>,
    einsetzen: 't = \\dfrac{20 \\cdot 100 \\cdot 360}{6\\,000 \\cdot 2}',
    ergebnis: 't = \\dfrac{720\\,000}{12\\,000} = 60',
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
              <MB>{'Z = \\dfrac{K \\cdot p \\cdot t}{100 \\cdot 360}'}</MB>
              <MB>{'Z \\cdot 100 \\cdot 360 = K \\cdot p \\cdot t'}</MB>
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
        {
          title: 'Einsetzen und ausrechnen',
          body: (
            <>
              <MB>{b.einsetzen}</MB>
              <MB>{b.ergebnis}</MB>
            </>
          ),
        },
        { title: 'Antwort', body: <p>{b.antwort} Probe: Setze das Ergebnis in die Zinsformel ein. Es müssen wieder die Zinsen herauskommen.</p> },
      ]}
    />
  )
}

const { farbe: BEERE, soft: BEERE_SOFT } = THEMEN.beere
const markiert = (t: string) => `\\fcolorbox{${BEERE}}{${BEERE_SOFT}}{$${t}$}`

/** Die Zinsformel; die gesuchte Größe ist markiert (Leitbild in „Problem lösen“) */
function FormelBild({ ziel }: { ziel?: Gesucht }) {
  const g = (x: Gesucht) => (ziel === x ? markiert(x) : x)
  return (
    <div className="zk-formel" aria-label={ziel ? `Zinsformel, gesucht ist ${ziel}` : 'Zinsformel'}>
      <MB>{`Z = \\frac{${g('K')} \\cdot ${g('p')} \\cdot ${g('t')}}{100 \\cdot 360}`}</MB>
    </div>
  )
}

/* ── Bonus-Spiel: Geldsack-Jagd ─────────────────────────────────────────── */

const zahlDe = (v: number) => v.toLocaleString('de-DE', { maximumFractionDigits: 2 })
const texZahl = (v: number) => zahlDe(v).replace(/\./g, '.').replace(',', '{,}')
const EINHEIT: Record<Gesucht, (v: number) => string> = {
  K: (v) => `${zahlDe(v)} €`,
  p: (v) => `${zahlDe(v)} % p.a.`,
  t: (v) => `${zahlDe(v)} Tage`,
}
const NAME: Record<Gesucht, string> = { K: 'das Kapital K', p: 'den Zinssatz p', t: 'die Zinstage t' }

/** Eine Runde: drei Größen gegeben, die vierte gesucht. Falsch: 100 vergessen, 360 vergessen, Zinsformel nicht umgestellt */
function umstellRunden(): AuswahlRunde[] {
  const arten: Gesucht[] = mischen(['K', 'p', 't', zufall(['K', 'p', 't'] as const)])
  return arten.map((g) => {
    for (;;) {
      const K = zufall([1200, 1800, 2400, 3600, 4800, 6000])
      const p = zufall([1.5, 2, 2.4, 3, 4])
      const t = zufall([60, 90, 120, 150, 180, 240])
      const Z = (K * p * t) / 36000
      if (Math.abs(Z * 100 - Math.round(Z * 100)) > 1e-9) continue
      const wert = { K, p, t }[g]
      const nenner = (g === 'K' ? p * t : g === 'p' ? K * t : K * p)
      const werte = [wert, (Z * 360) / nenner, (Z * 100) / nenner, (Z * nenner) / 36000].map((v) => Math.round(v * 100) / 100)
      if (new Set(werte).size < 4 || werte.some((v) => v <= 0)) continue
      const gegeben = [
        `Z = ${texZahl(Z)} \\text{ €}`,
        g !== 'K' && `K = ${texZahl(K)} \\text{ €}`,
        g !== 'p' && `p = ${texZahl(p)}\\,\\%`,
        g !== 't' && `t = ${t}`,
      ].filter(Boolean) as string[]
      return {
        frage: (
          <p>
            Gegeben: <M>{gegeben.join(',\\; ')}</M>. Gesucht ist {NAME[g]}. Welcher Sack ist der richtige?
          </p>
        ),
        ziele: mischen([
          { text: EINHEIT[g](werte[0]), richtig: true, erklaerung: <>Richtig: <M>{UMSTELLEN[g].formel}</M>.</> },
          { text: EINHEIT[g](werte[1]), erklaerung: 'Hier fehlt die 100 im Zähler. Oben steht Z · 100 · 360.' },
          { text: EINHEIT[g](werte[2]), erklaerung: 'Hier fehlt die 360 im Zähler. Oben steht Z · 100 · 360.' },
          { text: EINHEIT[g](werte[3]), erklaerung: 'Hier wurde die Zinsformel gar nicht umgestellt. Z · 100 · 360 gehört nach oben, die beiden anderen Größen nach unten.' },
        ]),
      }
    }
  })
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function KasseEinstieg({ onBack, onPractice, onPrev }: { onBack: () => void; onPractice: () => void; onPrev: () => void }) {
  const [fest, setFest] = useSitzungState<Festlegung<Wahl>>('ka-fest', { wahl: null, wert: 4000, fest: false })
  const [geloest, setGeloest] = useSitzungState('ka-geloest', false)
  const [uebungen, setUebungen] = useSitzungState<string[]>('ka-uebungen', [])
  const uebung = (k: string, fertig: () => void) => () => {
    fertig()
    setUebungen((u) => (u.includes(k) ? u : [...u, k]))
  }

  /** Kopf jeder Teil-Seite: Auftrag, Zinsformel mit markierter Größe, gegeben/gesucht, Rechenbeispiel mit Lernvideo */
  const teilKopf = (g: Gesucht, frage: ReactNode, gegeben: ReactNode, gesucht: ReactNode) => (
    <>
      <div className="sl-fokus">
        <p className="sl-fokus-titel">Deine Aufgabe</p>
        <p>{frage}</p>
      </div>
      <FormelBild ziel={g} />
      <GegebenGesucht gegeben={gegeben} gesucht={gesucht} />
      <BeispielMitVideo video={VIDEO_KPT} videoTitel="Lernvideo: Kapital, Zinssatz und Zinstage berechnen">
        <UmstellBeispiel g={g} />
      </BeispielMitVideo>
    </>
  )

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 10 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={3}
            title="a) Zinsen berechnen"
            prompt={<p>2.400 € liegen 90 Tage zu 2 % p.a. auf einem Konto. Wie viel Zinsen gibt es?</p>}
            fields={[{ kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 12, unit: '€' }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Einsetzen', tex: 'Z = \\dfrac{2\\,400 \\cdot 2 \\cdot 90}{100 \\cdot 360}' },
                  { titel: 'Ausrechnen', tex: 'Z = \\dfrac{432\\,000}{36\\,000} = 12 \\text{ €}' },
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={3}
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
              <Loesungsweg
                schritte={[
                  { titel: 'Erste Gleichung durch 4 teilen', tex: 'x = 120 : 4 = 30' },
                  { titel: 'Zweite Gleichung: Bruch loswerden (mal 10)', tex: 'x \\cdot 5 = 40' },
                  { titel: 'Durch 5 teilen', tex: 'x = 8' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Bei der ersten Gleichung wird x mit 4 malgenommen. Die Umkehrung ist: durch 4 teilen.</>,
                  <>Bei der zweiten Gleichung zuerst den Bruch loswerden (beide Seiten mal 10), dann durch 5 teilen.</>,
                  <>Zweite Gleichung: <M>{'x \\cdot 5 = 4 \\cdot 10 = 40'}</M>. Jetzt noch durch 5 teilen.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Zinstage"
            prompt={<p>Wie viele Zinstage liegen zwischen dem 01.02. und dem 01.08.? (Bankregel: jeder Monat 30 Tage)</p>}
            fields={[{ kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 180, unit: 'Tage' }]}
            solution={<MB>{'6 \\cdot 30 = 180 \\text{ Tage}'}</MB>}
          />
          <McCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Was ist gesucht?"
            prompt={<p>Ein Konto zahlt 2 % p.a. In 90 Tagen kommen 15 € Zinsen zusammen. Wie viel Geld liegt auf dem Konto? Welche Größe der Zinsformel ist hier gesucht?</p>}
            options={[
              { text: <>die Zinsen <M>Z</M></>, feedback: 'Die Zinsen sind gegeben: 15 €.' },
              { text: <>der Zinssatz <M>p</M></>, feedback: 'Der Zinssatz ist gegeben: 2 % p.a.' },
              { text: <>das Kapital <M>K</M></>, correct: true, feedback: 'Gefragt ist, wie viel Geld auf dem Konto liegt, also das Kapital K.' },
              { text: <>die Zinstage <M>t</M></>, feedback: 'Die Zinstage sind gegeben: 90 Tage.' },
            ]}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={3}
            title="e) Jahr oder halbes Jahr?"
            prompt={<p>3.600 € liegen zu 1 % p.a. auf einem Konto. Wie viel Zinsen gibt es in einem ganzen Jahr, wie viel in einem halben Jahr (180 Tage)?</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'j', label: 'ganzes Jahr:', expected: 36, unit: '€' },
              { kind: 'num', key: 'h', label: 'halbes Jahr:', expected: 18, unit: '€' },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Ein Prozent von 3.600 €', tex: '3\\,600 \\text{ €} : 100 = 36 \\text{ €}' },
                  { titel: 'Halbes Jahr: nur die Hälfte', tex: '36 \\text{ €} : 2 = 18 \\text{ €}' },
                ]}
              />
            }
          />
        </>
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
          <figure className="sl-foto">
            <img
              src={pinnwandBild}
              width={1200}
              height={600}
              alt="Siebdruck in Beere und Schwarz: die Pinnwand der Klasse 10b mit drei Zetteln. Emma: K gleich ?, wie viel Geld? Noah: p gleich ?, welcher Zinssatz? Frau Yilmaz: t gleich ?, wie viele Tage?"
            />
          </figure>
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
      titel: 'Teil 1: Emmas Frage',
      pflicht: ['t1'],
      bedingung: 'Berechne Emmas Frage richtig, dann geht es zu Teil 2.',
      inhalt: (fertig) => (
        <>
          {teilKopf(
            'K',
            <>Wie viel Geld muss in der Kasse liegen, damit es vom 01.02. bis zum 01.08. bei 3 % p.a. genau 72 € Zinsen gibt? Wie viel muss dann jede der 24 Personen einzahlen?</>,
            <>
              <M>{'Z = 72'}</M> €, <M>{'p = 3'}</M>, <M>{'t = 180'}</M> Tage
            </>,
            <>
              das Kapital <M>K</M> und der Betrag pro Person
            </>,
          )}
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={fertig.teil('t1')}
              punkte={12}
              title="Emmas Frage"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'k', label: 'Nötiges Kapital:', expected: K_NOETIG, unit: '€' },
                { kind: 'num', key: 'pp', label: 'Pro Person:', expected: K_NOETIG / 24, unit: '€' },
              ]}
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Formel für K', tex: 'K = \\dfrac{Z \\cdot 100 \\cdot 360}{p \\cdot t}' },
                    { titel: 'Einsetzen', tex: 'K = \\dfrac{72 \\cdot 100 \\cdot 360}{3 \\cdot 180}' },
                    { titel: 'Ausrechnen', tex: 'K = \\dfrac{2\\,592\\,000}{540} = 4\\,800 \\text{ €}' },
                    { titel: 'Pro Person', tex: '4\\,800 \\text{ €} : 24 = 200 \\text{ €}' },
                    { titel: 'Probe', tex: 'Z = \\dfrac{4\\,800 \\cdot 3 \\cdot 180}{36\\,000} = 72 \\text{ €}' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Gesucht ist das Kapital. Du kennst Z = 72 €, p = 3 und t = 180. Nimm die Formel für K aus dem Beispiel.</>,
                    <>
                      Oben: <M>{'72 \\cdot 100 \\cdot 360 = 2\\,592\\,000'}</M>, unten: <M>{'3 \\cdot 180 = 540'}</M>. Danach teilst du das Kapital durch 24.
                    </>,
                    <>Rechne <M>{'2\\,592\\,000 : 540'}</M>. Das Ergebnis teilst du durch 24 Personen.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 2: Noahs Frage',
      pflicht: ['t2'],
      bedingung: 'Berechne Noahs Frage richtig, dann geht es zu Teil 3.',
      inhalt: (fertig) => (
        <>
          {teilKopf(
            'p',
            <>Eine andere Bank verspricht: 4.800 € bringen in 180 Tagen 84 € Zinsen. Welcher Zinssatz steckt dahinter?</>,
            <>
              <M>{'K = 4\\,800'}</M> €, <M>{'t = 180'}</M> Tage, <M>{'Z = 84'}</M> €
            </>,
            <>
              der Zinssatz <M>p</M>
            </>,
          )}
          <Abschnitt titel="Vergleiche dein Ergebnis">
            <CheckCard
              onSolved={fertig.teil('t2')}
              punkte={8}
              title="Noahs Frage"
              prompt={<p>Trage das Ergebnis aus deinem Heft ein.</p>}
              fields={[{ kind: 'num', key: 'p', label: 'Zinssatz:', expected: 3.5, unit: '% p.a.' }]}
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Formel für p', tex: 'p = \\dfrac{Z \\cdot 100 \\cdot 360}{K \\cdot t}' },
                    { titel: 'Einsetzen', tex: 'p = \\dfrac{84 \\cdot 100 \\cdot 360}{4\\,800 \\cdot 180}' },
                    { titel: 'Ausrechnen', tex: 'p = \\dfrac{3\\,024\\,000}{864\\,000} = 3{,}5', text: 'Noahs Bank zahlt 3,5 % p.a.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Gesucht ist der Zinssatz. Du kennst K = 4.800 €, t = 180 und Z = 84 €. Oben steht Z · 100 · 360, unten K · t.</>,
                    <>
                      Oben: <M>{'84 \\cdot 100 \\cdot 360 = 3\\,024\\,000'}</M>, unten: <M>{'4\\,800 \\cdot 180 = 864\\,000'}</M>.
                    </>,
                    <>Rechne <M>{'3\\,024\\,000 : 864\\,000'}</M>. Das Ergebnis ist p in % p.a.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 3: Frau Yilmaz’ Frage',
      pflicht: ['t3', 'empfehlung', 'produkt'],
      inhalt: (fertig) => (
        <>
          {teilKopf(
            't',
            <>Wie lange müssten die 3.600 € bei 3 % p.a. liegen, bis 72 € Zinsen zusammen sind? Reicht die Zeit bis zum 01.08.?</>,
            <>
              <M>{'K = 3\\,600'}</M> €, <M>{'p = 3'}</M>, <M>{'Z = 72'}</M> €
            </>,
            <>
              die Zinstage <M>t</M>
            </>,
          )}
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('t3')()
                setGeloest(true)
              }}
              punkte={8}
              title="Frau Yilmaz’ Frage"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein.</p>}
              fields={[
                { kind: 'num', key: 't', label: 'Zinstage:', expected: 240, unit: 'Tage' },
                { kind: 'select', key: 'r', label: 'Reicht die Zeit bis zum 01.08.?', options: ['Ja, 180 Tage genügen', 'Nein, 180 Tage sind zu wenig'], expected: 1 },
              ]}
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Formel für t', tex: 't = \\dfrac{Z \\cdot 100 \\cdot 360}{K \\cdot p}' },
                    { titel: 'Einsetzen', tex: 't = \\dfrac{72 \\cdot 100 \\cdot 360}{3\\,600 \\cdot 3}' },
                    { titel: 'Ausrechnen', tex: 't = \\dfrac{2\\,592\\,000}{10\\,800} = 240 \\text{ Tage}' },
                    { titel: 'Vergleichen', text: 'Das Geld müsste 240 Tage liegen, bis zum 01.08. sind es aber nur 180 Tage. Die Zeit reicht nicht.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Gesucht sind die Zinstage. Du kennst K = 3.600 €, p = 3 und Z = 72 €. Oben steht Z · 100 · 360, unten K · p.</>,
                    <>
                      Oben: <M>{'2\\,592\\,000'}</M>, unten: <M>{'3\\,600 \\cdot 3 = 10\\,800'}</M>. Vergleiche das Ergebnis mit 180.
                    </>,
                    <>Rechne <M>{'2\\,592\\,000 : 10\\,800'}</M>. Sind das mehr oder weniger als 180 Tage?</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Deine Empfehlung">
            <McCard
              onSolved={fertig.teil('empfehlung')}
              punkte={4}
              rechnen
              title="Empfehlung"
              prompt={<p>Was empfiehlst du der Klasse 10b, damit das Abschlussgrillen bis zum 01.08. bezahlt ist?</p>}
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
          </Abschnitt>
          <Handlungsprodukt titel="Aushang an die Klasse 10b">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={aushangBild}
                width={800}
                height={400}
                alt="Siebdruck-Aushang in Beere und Schwarz: An alle in der 10b! So reicht es fürs Grillen, darunter leere Zeilen und ein Stempel mit 72 €."
              />
            </figure>
            <p className="sl-text">
              Schreibe in dein Heft einen Aushang für die Pinnwand. Beantworte darin die drei Fragen von Emma, Noah und Frau Yilmaz mit Rechnung und gib der Klasse eine klare
              Empfehlung.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Liebe 10b, mit unseren 3.600 € bekommen wir bis zum 01.08. nur …“</li>
                <li>„Für 72 € Zinsen bräuchten wir … in der Kasse, das sind … pro Person.“</li>
                <li>„Noahs Bank zahlt … % p.a.“</li>
                <li>„Bei 3 % müsste unser Geld … Tage liegen, deshalb …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Aushang vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien('an die Klasse')} />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug fest={fest} />
              <ZielBalken ist={ZINS_KASSE} />
              <Merke title="Die Zinsformel umstellen">
                <p>Mit „mal 100 · 360“ wird aus der Zinsformel eine Gleichung ohne Bruch. Dann teilst du durch die beiden anderen Größen:</p>
                <MB>{'K = \\dfrac{Z \\cdot 100 \\cdot 360}{p \\cdot t}'}</MB>
                <MB>{'p = \\dfrac{Z \\cdot 100 \\cdot 360}{K \\cdot t}'}</MB>
                <MB>{'t = \\dfrac{Z \\cdot 100 \\cdot 360}{K \\cdot p}'}</MB>
                <ul>
                  <li>Immer tagesgenau rechnen: t in Tagen, jeder Monat 30 Tage, das Jahr 360 Tage.</li>
                  <li>Probe: Ergebnis in die Zinsformel einsetzen. Es müssen wieder die Zinsen herauskommen.</li>
                  <li>Größenordnung prüfen: Für wenige Euro Zinsen braucht man viel Kapital oder viel Zeit.</li>
                </ul>
              </Merke>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      pflicht: ['1', '2', '3'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit drei Aufgaben, die vierte ist für Profis. Wenn du die drei Pflichtaufgaben gelöst hast, wartet unten ein Spiel auf dich. Einzelarbeit, ca.
            20 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Die richtige Formel">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Zinsrechnung-Einstieg 2: Formel umstellen (Basis)"
              title="Übung 1"
              level="basis"
              prompt={<p>Welche Formel berechnet die Zinstage t?</p>}
              options={[
                { text: <M>{'t = \\frac{K \\cdot p \\cdot 100 \\cdot 360}{Z}'}</M>, feedback: 'Hier sind Zähler und Nenner vertauscht. Z gehört nach oben, K und p nach unten.' },
                { text: <M>{'t = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot p}'}</M>, correct: true, feedback: 'Erst mal 100 · 360, dann durch K · p teilen.' },
                { text: <M>{'t = \\frac{Z \\cdot K \\cdot p}{100 \\cdot 360}'}</M>, feedback: 'Das ist die Zinsformel mit Z an der falschen Stelle. Beim Umstellen wandern 100 · 360 nach oben.' },
                { text: <M>{'t = \\frac{Z}{K \\cdot p}'}</M>, feedback: 'Hier fehlt 100 · 360 im Zähler. Ohne diese Zahlen wird t viel zu klein.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Kapital berechnen">
            <TrackedCheck
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
              topic="Zinsrechnung-Einstieg 2: Kapital (Standard)"
              title="Übung 2"
              level="standard"
              prompt={<p>Wie viel Geld muss man zu 2,4 % p.a. anlegen, damit es in 75 Tagen 18 € Zinsen gibt?</p>}
              fields={[{ kind: 'num', key: 'k', label: <M>{'K ='}</M>, expected: 3600, unit: '€' }]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Einsetzen', tex: 'K = \\dfrac{18 \\cdot 100 \\cdot 360}{2{,}4 \\cdot 75}' },
                    { titel: 'Ausrechnen', tex: 'K = \\dfrac{648\\,000}{180} = 3\\,600 \\text{ €}' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Gesucht ist K. Oben steht Z · 100 · 360, unten p · t.</>,
                    <>
                      <M>{'K = \\frac{18 \\cdot 100 \\cdot 360}{2{,}4 \\cdot 75}'}</M>
                    </>,
                    <>Oben: <M>{'18 \\cdot 100 \\cdot 360 = 648\\,000'}</M>, unten: <M>{'2{,}4 \\cdot 75 = 180'}</M>. Jetzt teilen.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={8}
              topic="Zinsrechnung-Einstieg 2: Zinssatz (Standard)"
              title="Übung 3"
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
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Wann ist das Ziel erreicht?">
            <TrackedCheck
              profi
              punkte={9}
              topic="Zinsrechnung-Einstieg 2: Zinstage und Datum (Erweiterung)"
              title="Übung 4"
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
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Zinstage berechnen', tex: 't = \\dfrac{25 \\cdot 100 \\cdot 360}{5\\,000 \\cdot 2{,}4}' },
                    { titel: 'Ausrechnen', tex: 't = \\dfrac{900\\,000}{12\\,000} = 75 \\text{ Tage}' },
                    { titel: 'Datum bestimmen', text: 'Vom 10.03. sind es 60 Tage bis zum 10.05., dazu 15 Tage: Am 25.05. hat Mira die 25 € zusammen.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Zuerst t mit der umgestellten Formel berechnen. Dann vom 10.03. aus weiterzählen.</>,
                    <>75 Tage sind 2 Monate (60 Tage) und noch 15 Tage. Vom 10.03. zwei Monate weiter ist der 10.05.</>,
                    <>Vom 10.05. noch 15 Tage weiter zählen: Welcher Tag ist das?</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 3} titel="Geldsack-Jagd">
            <AuswahlSpiel
              neueRunden={umstellRunden}
              symbol="fa-sack-dollar"
              start={<p>In jeder Runde sind drei Größen der Zinsformel gegeben, die vierte ist gesucht. Nur ein Geldsack enthält das richtige Ergebnis. Stelle um, rechne und tippe ihn an.</p>}
              tipp="Tipp: Oben steht immer Z · 100 · 360, unten die beiden anderen gegebenen Größen."
            />
          </BonusSpiel>
          <Bilanz />
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
        </>
      ),
    },
  ]

  return (
    <TaskShell title="Zinsrechnung: Die Abschlussfahrt-Kasse" width="wide" kompakt parent={{ to: '/finanzmathe/zinsrechnung', label: 'Zinsrechnung' }}>
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        bildwelt={BILDWELT}
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
