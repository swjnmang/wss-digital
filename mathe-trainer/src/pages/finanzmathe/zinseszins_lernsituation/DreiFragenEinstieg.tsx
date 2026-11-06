import { useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { useSitzungState } from '../../../hooks/useSitzung'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, Loesungsweg, McCard } from '../../lineare_funktionen/lernsituation_kit/kit'
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
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien, Vermutung, standardKriterien, type Festlegung } from '../zins_kit/zins_kit'
import { eur, eurTex, faktor, kn, zt } from './shared'
import { SanduhrCheck } from './spiele'
import titelBild from './ls2/bilder/titel.webp'
import fragenBild from './ls2/bilder/fragen.webp'
import artikelBild from './ls2/bilder/artikel.webp'
import '../../daten_und_zufall/lernpfad/lernpfad.css'

// Lernsituation Zinseszins 2 „Miras drei Fragen“: die Zinseszinsformel nach K_0, q (p) und n umstellen (ca. 90 min).
// Format Schätzen & Fermi: Mira hat drei Fragen (Wie viel heute anlegen? Welcher Zinssatz steckt im Angebot? Wann ist das Geld verdoppelt?).
// Jonas schätzt mit einer Faustregel: 100 : 3 ≈ 33 Jahre bis zur Verdopplung. Die SuS schätzen selbst, probieren dann Laufzeiten aus
// (der Rechner zeigt den Kontostand): Nach 33 Jahren sind es schon über 13.000 €. Aha: Mit Zinseszins verdoppelt sich das Geld viel
// schneller (nach 23,45 Jahren, also nach 24 vollen Jahren), und für Frage 1 und 2 hilft Probieren kaum weiter.
// Problem lösen in drei Teilen (eine Seite je Teilproblem), je Problem → Beispielrechnung mit Lernvideo → Ergebnis abgleichen:
// Teil 1 K_0 = 6.000 : 1,03⁸ = 4.736,46 €, Teil 2 q = (6.000 : 5.000)^(1/6), p ≈ 3,09 %, Teil 3 n = log_1,03(2) ≈ 23,45 → 24 Jahre
// (Logarithmus mit der log-Taste des Taschenrechners, bei der die Basis q direkt eingegeben wird, nicht über lg … : lg …).
// Auf Teil 3 folgen Urteil über die Faustregel, Handlungsprodukt (Artikel für die Schülerzeitung, analog), Rückbezug und Merke.
// Punkte nach Aufwand: Warm-up 3/2/2/2/2 = 11, Schätzung 3, Ausprobieren 3, Kernaufgaben 3 × 10, Urteil 3, Artikel 5, Übungen 4/6/6/7,
// Profi 8 (Pflicht zusammen 78: Warm-up 11 = 14 %, Problem erkennen 6 = 8 %, Problem lösen 38 = 49 % wegen drei Teilproblemen,
// Übungen 23 = 29 %), Bonus-Spiel „Sanduhr-Check“ 4 Runden à 2 = 8.
// Identität: Themenfarbe Kupfer, Symbol fa-hourglass-half, Leitobjekt die Sanduhr mit Münzen und die Formel-Leiste, in der die gesuchte
// Größe markiert ist. Bildwelt Reportage / Duoton (Schwarz + Kupfer): Aufmacher, Fragen-Pinnwand und Artikel sind gerenderte WebP-Dateien
// aus ls2/bilder-quelle/*.bild.html (node scripts/bilder-rendern.cjs src/pages/finanzmathe/zinseszins_lernsituation/ls2).

/** Lernvideos aus dem Zinseszinsrechner (/finanzmathe/zinseszins/ueben) */
const VIDEO_K0 = 'https://youtu.be/vs0o8S9ksjg?list=PLI8kX0XEfSujoc5mrNv30D7mptBkAN3E8&t=130'
const VIDEO_P = 'https://youtu.be/BeJd9e5Qv-E?si=XokDQ8yfwluJy1IW'
const VIDEO_N = 'https://youtu.be/oUjYapq1AX8?si=lx02oGVSFGhtEVdA'

// Frage 1: K_0 gesucht (6.000 € in 8 Jahren bei 3 %)
const K0_MIRA = 6000 / faktor(3) ** 8
// Frage 2: q und p gesucht (5.000 € werden in 6 Jahren zu 6.000 €)
const Q_MIRA = (6000 / 5000) ** (1 / 6)
const P_MIRA = (Q_MIRA - 1) * 100
// Frage 3: n gesucht (Verdopplung bei 3 %)
const N_DOPPEL = Math.log(2) / Math.log(faktor(3))
const N_VOLL = Math.ceil(N_DOPPEL)
const FAUSTREGEL = 33

const THEMA: Thema = {
  name: 'Miras drei Fragen',
  farbe: 'kupfer',
  icon: 'fa-hourglass-half',
  kicker: 'Geld-Check der Schülerzeitung',
  bildzeile: 'Wann sind aus 5.000 € zehntausend geworden? Illustration: Mathe-Trainer',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Eine Sanduhr im Streiflicht auf einem dunklen Tisch, durch die kupferfarbene Münzen rieseln. Davor ein Zettel: 5.000 € · 3 %, verdoppelt nach ? Jahren."
    />
  ),
}
const BILDWELT: Bildwelt = { welt: 'reportage', variante: 'duoton' }

/* ── Leitobjekt: Formel-Leiste mit markierter gesuchter Größe ─────────────── */

type Groesse = 'K0' | 'q' | 'n'
const { farbe: KUPFER, soft: KUPFER_SOFT } = THEMEN.kupfer
const markiert = (t: string) => `\\fcolorbox{${KUPFER}}{${KUPFER_SOFT}}{$${t}$}`

/** Die Zinseszinsformel; die gesuchte Größe ist markiert */
function FormelLeiste({ ziel }: { ziel: Groesse }) {
  const k0 = ziel === 'K0' ? markiert('K_0') : 'K_0'
  const q = ziel === 'q' ? markiert('q') : 'q'
  const n = ziel === 'n' ? markiert('n') : 'n'
  return (
    <div className="zz-formel" aria-label={`Zinseszinsformel K n gleich K null mal q hoch n, gesucht ist ${ziel === 'K0' ? 'K null' : ziel}`}>
      <MB>{`K_n = ${k0} \\cdot ${q}^{${n}}`}</MB>
    </div>
  )
}

/* ── Problem erkennen: Laufzeiten ausprobieren ───────────────────────────── */

/** Die SuS tippen eine Laufzeit ein, der Rechner zeigt Miras Kontostand als Balken neben der Marke 10.000 € */
function LaufzeitProbe({ versuche, onVersuch }: { versuche: number[]; onVersuch: (n: number) => void }) {
  const [eingabe, setEingabe] = useState('')
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const n = parseInput(eingabe)?.value
  const gueltig = n !== undefined && Number.isInteger(n) && n >= 1 && n <= 50
  const senden = () => {
    if (!gueltig || n === undefined) return
    onVersuch(n)
    if (versuche.length === 2 && !versuche.includes(n)) pt.geloest()
    setEingabe('')
  }
  const liste = versuche.slice(-6)
  const yMax = 25000
  const H = 230
  const y = (v: number) => 20 + H - (v / yMax) * H
  return (
    <div className="zz-probe" data-no-autocheck>
      <div className="zz-probe-eingabe">
        <label htmlFor="zz-laufzeit">
          Laufzeit <M>n</M> =
        </label>
        <input
          id="zz-laufzeit"
          className="bk-input"
          inputMode="numeric"
          value={eingabe}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') senden()
          }}
          aria-label="Laufzeit in Jahren"
        />
        <span>Jahre</span>
        <button type="button" className="bk-btn bk-btn-primary" disabled={!gueltig} onClick={senden}>
          <i className="fa-solid fa-calculator" aria-hidden="true" /> Kontostand ansehen
        </button>
      </div>
      <div className="zz-probe-bild bk-graph">
        <svg viewBox="0 0 860 290" role="img" aria-label={`Kontostände bei 5.000 € und 3 %: ${liste.map((v) => `${v} Jahre: ${eur(kn(5000, 3, v))}`).join(', ') || 'noch kein Versuch'}. Ziel 10.000 €.`}>
          <line x1="70" x2="840" y1={y(0)} y2={y(0)} stroke="var(--ink)" strokeWidth="2" />
          {[5000, 10000, 15000, 20000].map((v) => (
            <g key={v}>
              <line x1="70" x2="840" y1={y(v)} y2={y(v)} stroke={v === 10000 ? 'var(--primary)' : 'var(--grid)'} strokeWidth={v === 10000 ? 3 : 1} strokeDasharray={v === 10000 ? '10 6' : undefined} />
              <text x="62" y={y(v) + 6} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
                {fmt(v, 0)}
              </text>
            </g>
          ))}
          <text x="836" y={y(10000) - 8} textAnchor="end" fontSize="17" fontWeight="700" fill="var(--primary)">
            Ziel: 10.000 € (verdoppelt)
          </text>
          {liste.map((v, i) => {
            const wert = kn(5000, 3, v)
            const x = 110 + i * 120
            const drueber = wert >= 10000
            return (
              <g key={`${v}-${i}`}>
                <rect x={x} y={y(Math.min(wert, yMax))} width="74" height={y(0) - y(Math.min(wert, yMax))} fill={drueber ? 'var(--primary)' : '#9b9590'} />
                <text x={x + 37} y={y(Math.min(wert, yMax)) - 8} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink)">
                  {fmt(wert, 0, true)} €
                </text>
                <text x={x + 37} y={y(0) + 22} textAnchor="middle" fontSize="16" fill="var(--ink)">
                  {v} J.
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ── Rechenbeispiele (andere Zahlen als Miras Fragen) ────────────────────── */

const BEISPIEL: Record<Groesse, { titel: string; aufgabe: ReactNode; steps: { title: ReactNode; body: ReactNode }[] }> = {
  K0: {
    titel: 'Wie viel muss Ben heute anlegen?',
    aufgabe: <p>Ben möchte in 5 Jahren 8.000 € für ein Motorrad haben. Die Bank zahlt 2,5 % mit Zinseszins. Wie viel muss er heute anlegen?</p>,
    steps: [
      { title: 'Bekannte Werte in die Formel einsetzen', body: <MB>{'8\\,000 = K_0 \\cdot 1{,}025^5'}</MB> },
      {
        title: <>Durch <M>{'q^n'}</M> teilen</>,
        body: (
          <>
            <p>
              <M>{'K_0'}</M> wird mit <M>{'1{,}025^5'}</M> malgenommen. Die Umkehrung ist Teilen:
            </p>
            <MB>{'K_0 = \\dfrac{8\\,000}{1{,}025^5}'}</MB>
            <MB>{`K_0 = ${eurTex(8000 / faktor(2.5) ** 5)}`}</MB>
          </>
        ),
      },
      {
        title: 'Antwort und Probe',
        body: <p>Ben muss heute {eur(8000 / faktor(2.5) ** 5)} anlegen. Probe: Dieser Betrag mal 1,025⁵ ergibt wieder 8.000 €.</p>,
      },
    ],
  },
  q: {
    titel: 'Welcher Zinssatz steckt im Angebot?',
    aufgabe: <p>Aus 4.000 € werden in 7 Jahren 5.000 €. Welcher Zinssatz (mit Zinseszins) steckt dahinter?</p>,
    steps: [
      { title: 'Bekannte Werte einsetzen', body: <MB>{'5\\,000 = 4\\,000 \\cdot q^7'}</MB> },
      { title: 'Durch das Anfangskapital teilen', body: <><MB>{'\\dfrac{5\\,000}{4\\,000} = q^7'}</MB><MB>{'1{,}25 = q^7'}</MB></> },
      {
        title: 'Die 7. Wurzel ziehen',
        body: (
          <>
            <MB>{'q = \\sqrt[7]{1{,}25}'}</MB>
            <MB>{`q = ${zt(1.25 ** (1 / 7), 6)}\\ldots`}</MB>
            <p>
              Am Taschenrechner: <M>{'1{,}25 \\,\\boxed{x^y}\\, (1 : 7)'}</M> oder mit der Wurzeltaste <M>{'\\sqrt[x]{\\ }'}</M>. Lass den Wert im Taschenrechner stehen.
            </p>
          </>
        ),
      },
      {
        title: <>Zinssatz aus <M>q</M> berechnen</>,
        body: <MB>{`p = (q - 1) \\cdot 100 \\approx ${zt((1.25 ** (1 / 7) - 1) * 100, 2)}\\,\\%`}</MB>,
      },
    ],
  },
  n: {
    titel: 'Wann sind es 4.500 €?',
    aufgabe: <p>3.000 € werden mit 4 % Zinseszins angelegt. Nach wie vielen Jahren sind daraus zum ersten Mal mindestens 4.500 € geworden?</p>,
    steps: [
      { title: 'Bekannte Werte einsetzen', body: <MB>{'4\\,500 = 3\\,000 \\cdot 1{,}04^n'}</MB> },
      { title: 'Durch das Anfangskapital teilen', body: <><MB>{'\\dfrac{4\\,500}{3\\,000} = 1{,}04^n'}</MB><MB>{'1{,}5 = 1{,}04^n'}</MB></> },
      {
        title: <>Mit dem Logarithmus nach <M>n</M> auflösen</>,
        body: (
          <>
            <p>
              <M>n</M> steht in der Hochzahl. Gesucht ist die Hochzahl, mit der aus <M>{'1{,}04'}</M> die Zahl <M>{'1{,}5'}</M> wird. Das ist der Logarithmus zur Basis{' '}
              <M>{'1{,}04'}</M>:
            </p>
            <MB>{'n = \\log_{1{,}04} 1{,}5'}</MB>
            <MB>{`n \\approx ${zt(Math.log(1.5) / Math.log(1.04), 2)}`}</MB>
            <p>
              Am Taschenrechner: Taste <M>{'\\log_{\\square}\\square'}</M>, unten die Basis <M>{'1{,}04'}</M> eintippen, dann <M>{'1{,}5'}</M>.
            </p>
          </>
        ),
      },
      {
        title: 'Auf volle Jahre aufrunden',
        body: <p>Zinsen gibt es am Jahresende. Nach 10 Jahren sind es erst {eur(kn(3000, 4, 10))}, nach 11 Jahren {eur(kn(3000, 4, 11))}. Also nach 11 vollen Jahren.</p>,
      },
    ],
  },
}

const LOESUNG: Record<Groesse, ReactNode> = {
  K0: (
    <Loesungsweg
      schritte={[
        { titel: 'Bekannte Werte einsetzen', tex: '6\\,000 = K_0 \\cdot 1{,}03^8' },
        { titel: <>Durch <M>{'q^n'}</M> teilen</>, tex: ['K_0 = \\dfrac{6\\,000}{1{,}03^8}', `K_0 = ${eurTex(K0_MIRA)}`] },
      ]}
    />
  ),
  q: (
    <Loesungsweg
      schritte={[
        { titel: 'Bekannte Werte einsetzen', tex: '6\\,000 = 5\\,000 \\cdot q^6' },
        { titel: 'Durch das Anfangskapital teilen', tex: ['\\dfrac{6\\,000}{5\\,000} = q^6', '1{,}2 = q^6'] },
        { titel: 'Die 6. Wurzel ziehen', tex: ['q = \\sqrt[6]{1{,}2}', `q = ${zt(Q_MIRA, 6)}\\ldots`] },
        { titel: 'Zinssatz berechnen', tex: `p = (q - 1) \\cdot 100 \\approx ${zt(P_MIRA, 2)}\\,\\%` },
      ]}
    />
  ),
  n: (
    <Loesungsweg
      schritte={[
        { titel: 'Bekannte Werte einsetzen', tex: '10\\,000 = 5\\,000 \\cdot 1{,}03^n' },
        { titel: 'Durch das Anfangskapital teilen', tex: '2 = 1{,}03^n' },
        { titel: <>Mit dem Logarithmus nach <M>n</M> auflösen</>, tex: ['n = \\log_{1{,}03} 2', `n \\approx ${zt(N_DOPPEL, 2)}`] },
        { titel: 'Auf volle Jahre aufrunden', text: <>Nach 23 Jahren sind es erst {eur(kn(5000, 3, 23))}, nach 24 Jahren {eur(kn(5000, 3, 24))}.</> },
      ]}
    />
  ),
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function DreiFragenEinstieg({ onBack, onPractice, onPrev }: { onBack: () => void; onPractice: () => void; onPrev: () => void }) {
  const [fest, setFest] = useSitzungState<Festlegung<never>>('df-fest', { wahl: null, wert: 30, fest: false })
  const [versuche, setVersuche] = useSitzungState<number[]>('df-versuche', [])
  const [geloest, setGeloest] = useSitzungState('df-geloest', false)
  const [uebungen, setUebungen] = useSitzungState<string[]>('df-uebungen', [])
  /** Pflicht-Übung melden: schaltet „Weiter“ und das Bonus-Spiel frei */
  const uebung = (k: string, fertig: () => void) => () => {
    fertig()
    setUebungen((u) => (u.includes(k) ? u : [...u, k]))
  }
  const verschieden = new Set(versuche).size

  /** Gemeinsamer Kopf jeder Teil-Seite: Problem, Formel-Leiste, Beispielrechnung mit Lernvideo */
  const teilKopf = (g: Groesse, auftrag: ReactNode, video: string, videoTitel: string) => (
    <>
      <p className="sl-hinweis">Einzelarbeit, ca. 15 Minuten.</p>
      <div className="sl-fokus">
        <p className="sl-fokus-titel">Deine Aufgabe</p>
        <p>{auftrag}</p>
      </div>
      <FormelLeiste ziel={g} />
      <BeispielMitVideo video={video} videoTitel={videoTitel}>
        <Beispiel offen title={BEISPIEL[g].titel} aufgabe={BEISPIEL[g].aufgabe} steps={BEISPIEL[g].steps} />
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
            title="a) Endkapital"
            prompt={
              <p>
                <M>{'3\\,000\\text{ €}'}</M> werden 4 Jahre zu <M>{'2\\,\\%'}</M> angelegt, die Zinsen bleiben auf dem Konto. Wie hoch ist das Endkapital?
              </p>
            }
            fields={[{ kind: 'num', key: 'k', label: <M>{'K_4 ='}</M>, expected: kn(3000, 2, 4), unit: '€', tol: 0.011 }]}
            solution={<Loesungsweg schritte={[{ titel: 'In die Formel einsetzen', tex: ['K_4 = 3\\,000 \\cdot 1{,}02^4', `K_4 = ${eurTex(kn(3000, 2, 4))}`] }]} />}
            help={
              <Hilfen
                steps={[
                  <>Du brauchst die Formel aus der Lernsituation „Die Münztürme“.</>,
                  <>
                    <M>{'K_n = K_0 \\cdot q^n'}</M> mit <M>{'q = 1{,}02'}</M>.
                  </>,
                  <>
                    <M>{'K_4 = 3\\,000 \\cdot 1{,}02^4'}</M>
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) Vom Zinssatz zum Zinsfaktor"
            rechnen={false}
            prompt={<p>Wie heißt der Zinsfaktor zu diesen Zinssätzen?</p>}
            rechnung={[
              { l: ['p = 3{,}5\\,\\%:\\quad q'], r: [{ luecke: 'b1' }] },
              { l: ['p = 0{,}8\\,\\%:\\quad q'], r: [{ luecke: 'b2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'b1', label: 'Zinsfaktor zu 3,5 Prozent', expected: 1.035, tol: 0.00001 },
              { kind: 'num', key: 'b2', label: 'Zinsfaktor zu 0,8 Prozent', expected: 1.008, tol: 0.00001 },
            ]}
            solution={<Loesungsweg schritte={[{ titel: <>Zinsfaktor: <M>{'q = 1 + \\frac{p}{100}'}</M></>, tex: ['q = 1 + \\dfrac{3{,}5}{100} = 1{,}035', 'q = 1 + \\dfrac{0{,}8}{100} = 1{,}008'] }]} />}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Vom Zinsfaktor zum Zinssatz"
            rechnen={false}
            prompt={<p>Welcher Zinssatz gehört zu diesen Zinsfaktoren?</p>}
            rechnung={[
              { l: ['q = 1{,}045:\\quad p'], r: [{ luecke: 'c1' }, '\\,\\%'] },
              { l: ['q = 1{,}0325:\\quad p'], r: [{ luecke: 'c2' }, '\\,\\%'] },
            ]}
            fields={[
              { kind: 'num', key: 'c1', label: 'Zinssatz zu 1,045', expected: 4.5, tol: 0.0001 },
              { kind: 'num', key: 'c2', label: 'Zinssatz zu 1,0325', expected: 3.25, tol: 0.0001 },
            ]}
            solution={<Loesungsweg schritte={[{ titel: <>Zinssatz: <M>{'p = (q - 1) \\cdot 100'}</M></>, tex: ['p = (1{,}045 - 1) \\cdot 100 = 4{,}5\\,\\%', 'p = (1{,}0325 - 1) \\cdot 100 = 3{,}25\\,\\%'] }]} />}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Wurzeln mit dem Taschenrechner"
            prompt={
              <p>
                Berechne mit der Wurzeltaste <M>{'\\sqrt[x]{\\ }'}</M> oder als Potenz mit Hochzahl <M>{'\\frac{1}{n}'}</M>.
              </p>
            }
            rechnung={[
              { l: ['\\sqrt[4]{81}'], r: [{ luecke: 'd1' }] },
              { l: ['32^{\\frac{1}{5}}'], r: [{ luecke: 'd2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'd1', label: 'vierte Wurzel aus 81', expected: 3, tol: 0.0001 },
              { kind: 'num', key: 'd2', label: '32 hoch ein Fünftel', expected: 2, tol: 0.0001 },
            ]}
            solution={<Loesungsweg schritte={[{ titel: 'Probe mit der Potenz', tex: ['\\sqrt[4]{81} = 3, \\text{ denn } 3^4 = 81', '32^{\\frac{1}{5}} = \\sqrt[5]{32} = 2, \\text{ denn } 2^5 = 32'] }]} />}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title="e) Gleichungen umstellen"
            prompt={<p>Löse die Gleichungen nach x auf.</p>}
            rechnung={[
              { l: ['1{,}25 \\cdot x = 30:\\quad x'], r: [{ luecke: 'e1' }] },
              { l: ['x^3 = 1{,}331:\\quad x'], r: [{ luecke: 'e2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'e1', label: 'x bei 1,25 mal x gleich 30', expected: 24, tol: 0.0001 },
              { kind: 'num', key: 'e2', label: 'x bei x hoch 3 gleich 1,331', expected: 1.1, tol: 0.0001 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Mal wird durch Teilen rückgängig gemacht', tex: 'x = \\dfrac{30}{1{,}25} = 24' },
                  { titel: 'Hoch 3 wird durch die 3. Wurzel rückgängig gemacht', tex: 'x = \\sqrt[3]{1{,}331} = 1{,}1' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Mache die Rechnung rückgängig, die mit x passiert.</>,
                  <>„Mal 1,25“ machst du mit „geteilt durch 1,25“ rückgängig, „hoch 3“ mit der 3. Wurzel.</>,
                  <>
                    <M>{'x = 30 : 1{,}25'}</M> und <M>{'x = \\sqrt[3]{1{,}331}'}</M>.
                  </>,
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Drei Fragen, eine Faustregel',
      pflicht: ['fest', 'probe'],
      bedingung: 'Halte deine Schätzung fest und probiere mindestens drei verschiedene Laufzeiten aus, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Mira legt ihren Gewinn von 5.000 € an und schreibt für die Schülerzeitung die Rubrik „Geld-Check“. Diesmal will sie drei Fragen beantworten, die viele in ihrer Klasse
            haben. Bei jeder Frage ist eine andere Größe der Zinseszinsformel gesucht.
          </p>
          <figure className="sl-foto">
            <img
              src={fragenBild}
              width={1200}
              height={600}
              alt="Drei Karteikarten an einer dunklen Pinnwand. Frage 1: K₀ = ?, in 8 Jahren 6.000 € haben bei 3 %. Frage 2: p = ?, aus 5.000 € werden 6.000 € in 6 Jahren. Frage 3: n = ?, 5.000 € bei 3 %, wann sind es 10.000 €?"
            />
            <figcaption>Miras drei Fragen für den Geld-Check: Gesucht sind das Anfangskapital, der Zinssatz und die Laufzeit.</figcaption>
          </figure>
          <blockquote className="sl-zitat">
            <p>„Frage 3 ist doch einfach: 100 geteilt durch 3 Prozent. Nach etwa 33 Jahren hat sich das Geld verdoppelt.“</p>
            <footer>Jonas, Miras Klassenkamerad</footer>
          </blockquote>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag</p>
            <p>
              Schätze zuerst ohne zu rechnen: Nach wie vielen Jahren sind aus 5.000 € bei 3 % Zinseszins 10.000 € geworden? Probiere danach im Rechner verschiedene Laufzeiten aus
              und prüfe Jonas’ Faustregel.
            </p>
          </div>
          <p className="sl-hinweis">Einzelarbeit, ca. 10 Minuten.</p>
          <Abschnitt titel="1. Deine Schätzung">
            <Vermutung
              regler={{
                min: 5,
                max: 50,
                step: 1,
                text: (v) => (
                  <>
                    Das Geld hat sich nach etwa <span className="ls-slider-value">{v} Jahren</span> verdoppelt.
                  </>
                ),
              }}
              wert={fest}
              onChange={setFest}
              onFest={fertig.teil('fest')}
              gespeichert={(w) => (
                <>
                  Deine Schätzung: verdoppelt nach etwa <strong>{w.wert} Jahren</strong>.
                </>
              )}
            />
          </Abschnitt>
          {fest.fest && (
            <Abschnitt titel="2. Probiere Laufzeiten aus">
              <p className="sl-text">Tippe eine Laufzeit ein. Der Rechner zeigt, wie viel Mira dann auf dem Konto hat. Probiere auch Jonas’ 33 Jahre.</p>
              <LaufzeitProbe
                versuche={versuche}
                onVersuch={(n) => {
                  const neu = versuche.includes(n) ? versuche : [...versuche, n]
                  setVersuche(neu)
                  if (new Set(neu).size >= 3) fertig.teil('probe')()
                }}
              />
              {verschieden >= 3 && (
                <p className="sl-text" role="status">
                  <strong>Was fällt dir auf?</strong> Nach 33 Jahren hat Mira schon {eur(kn(5000, 3, FAUSTREGEL))}, viel mehr als das Doppelte. Jonas’ Faustregel rechnet ohne
                  Zinseszins. Durch Probieren kommst du der Verdopplung zwar näher, aber nur mühsam. Und bei Frage 1 und Frage 2 hilft Probieren kaum: Dort ist nicht die Laufzeit
                  gesucht, sondern das Anfangskapital und der Zinssatz. Gleich stellst du die Formel nach jeder Größe um.
                </p>
              )}
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 1: Wie viel muss Mira heute anlegen?',
      pflicht: ['k0'],
      bedingung: 'Berechne das Anfangskapital richtig, dann geht es zu Teil 2.',
      inhalt: (fertig) => (
        <>
          {teilKopf(
            'K0',
            <>Mira möchte in 8 Jahren 6.000 € für ihren Führerschein haben. Die Bank zahlt 3 % mit Zinseszins. Berechne in deinem Heft, wie viel Geld sie heute anlegen muss.</>,
            VIDEO_K0,
            'Lernvideo: Anfangskapital berechnen',
          )}
          <Abschnitt titel="Vergleiche dein Ergebnis">
            <CheckCard
              onSolved={fertig.teil('k0')}
              punkte={10}
              title="Frage 1: Anfangskapital"
              prompt={<p>Trage das Ergebnis aus deinem Heft ein, auf Cent gerundet. Das Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[{ kind: 'num', key: 'k', label: 'Wie viel muss Mira heute anlegen, damit sie in 8 Jahren 6.000 € hat?', expected: K0_MIRA, unit: '€', tol: 0.011 }]}
              loesungNachFehler
              solution={LOESUNG.K0}
              help={
                <Hilfen
                  steps={[
                    <>Welche Größen der Formel kennst du? Notiere <M>{'K_n'}</M>, <M>q</M> und <M>n</M>.</>,
                    <>
                      <M>{'6\\,000 = K_0 \\cdot 1{,}03^8'}</M>. Wie im Beispiel: Das Malnehmen machst du durch Teilen rückgängig.
                    </>,
                    <>
                      <M>{'K_0 = 6\\,000 : 1{,}03^8'}</M>, in einem Zug in den Taschenrechner.
                    </>,
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
      titel: 'Teil 2: Welcher Zinssatz steckt im Angebot?',
      pflicht: ['p'],
      bedingung: 'Berechne den Zinssatz richtig, dann geht es zu Teil 3.',
      inhalt: (fertig) => (
        <>
          {teilKopf(
            'q',
            <>Ein Online-Angebot verspricht: „Aus 5.000 € werden in 6 Jahren 6.000 €.“ Berechne in deinem Heft, welcher Zinssatz mit Zinseszins dahintersteckt.</>,
            VIDEO_P,
            'Lernvideo: Zinssatz berechnen',
          )}
          <Abschnitt titel="Vergleiche dein Ergebnis">
            <CheckCard
              onSolved={fertig.teil('p')}
              punkte={10}
              title="Frage 2: Zinssatz"
              prompt={<p>Trage das Ergebnis aus deinem Heft ein, auf zwei Nachkommastellen gerundet. Das Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[{ kind: 'num', key: 'p', label: 'Welcher Zinssatz steckt im Angebot?', expected: P_MIRA, unit: '%', tol: 0.006 }]}
              loesungNachFehler
              solution={LOESUNG.q}
              help={
                <Hilfen
                  steps={[
                    <>
                      Gesucht ist zuerst der Zinsfaktor <M>q</M>. Setze <M>{'K_0'}</M>, <M>{'K_n'}</M> und <M>n</M> ein.
                    </>,
                    <>
                      <M>{'6\\,000 = 5\\,000 \\cdot q^6'}</M>. Teile durch 5.000, dann ziehst du die 6. Wurzel.
                    </>,
                    <>
                      <M>{'q = \\sqrt[6]{1{,}2}'}</M>, danach <M>{'p = (q - 1) \\cdot 100'}</M>. Lass <M>q</M> im Taschenrechner stehen.
                    </>,
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
      titel: 'Teil 3: Wann hat sich das Geld verdoppelt?',
      pflicht: ['n', 'urteil', 'produkt'],
      inhalt: (fertig) => (
        <>
          {teilKopf(
            'n',
            <>
              Mira legt 5.000 € zu 3 % mit Zinseszins an. Berechne in deinem Heft, nach wie vielen Jahren sich ihr Geld verdoppelt hat, also 10.000 € auf dem Konto sind, genau und
              in vollen Jahren.
            </>,
            VIDEO_N,
            'Lernvideo: Laufzeit berechnen',
          )}
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('n')()
                setGeloest(true)
              }}
              punkte={10}
              title="Frage 3: Laufzeit"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'n', label: <>Welchen Wert für <M>n</M> erhältst du mit dem Logarithmus (auf zwei Nachkommastellen)?</>, expected: N_DOPPEL, tol: 0.006 },
                { kind: 'num', key: 'v', label: 'Nach wie vielen vollen Jahren sind zum ersten Mal mindestens 10.000 € auf dem Konto?', expected: N_VOLL, unit: 'Jahren' },
              ]}
              loesungNachFehler
              solution={LOESUNG.n}
              help={
                <Hilfen
                  steps={[
                    <>Setze ein und teile zuerst durch das Anfangskapital. Dann steht nur noch <M>{'1{,}03^n'}</M> da.</>,
                    <>
                      <M>{'2 = 1{,}03^n'}</M>. Wie im Beispiel: Die Hochzahl bekommst du mit dem Logarithmus zur Basis <M>{'1{,}03'}</M>.
                    </>,
                    <>
                      <M>{'n = \\log_{1{,}03} 2'}</M> mit der log-Taste, Basis <M>{'1{,}03'}</M>. Zinsen gibt es am Jahresende, deshalb rundest du auf volle Jahre auf.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Dein Urteil">
            <McCard
              onSolved={fertig.teil('urteil')}
              punkte={3}
              title="Stimmt Jonas’ Faustregel?"
              prompt={<p>Jonas hat mit 100 : 3 ≈ 33 Jahren gerechnet. Was sagst du ihm?</p>}
              options={[
                { text: 'Die Faustregel stimmt, 33 Jahre ist nur etwas gerundet.', feedback: 'Nach 33 Jahren sind es schon über 13.000 €. Das ist viel mehr als das Doppelte.' },
                { text: 'Es dauert länger als 33 Jahre, weil 3 % wenig sind.', feedback: 'Mit Zinseszins geht es schneller, nicht langsamer: Die Zinsen werden mitverzinst.' },
                { text: 'Die Regel stimmt nur, wenn man mehr als 5.000 € anlegt.', feedback: <>Die Verdopplungszeit hängt nicht vom Betrag ab: <M>{'2 = 1{,}03^n'}</M> gilt für jedes Anfangskapital.</> },
                {
                  text: 'Die Regel rechnet ohne Zinseszins. Mit Zinseszins ist das Geld schon nach 24 Jahren verdoppelt.',
                  correct: true,
                  feedback: '100 : 3 heißt: jedes Jahr 3 % von 5.000 €. Mit Zinseszins wachsen die Zinsen, deshalb geht es fast zehn Jahre schneller.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Artikel für den Geld-Check der Schülerzeitung">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={artikelBild}
                width={1200}
                height={480}
                alt="Eine Zeitungsseite der Rubrik Schülerzeitung, Geld-Check, mit der Schlagzeile Miras drei Fragen, drei Spalten mit den Überschriften K₀ = ?, p = ? und n = ? sowie einem Kasten Antwort an Mira."
              />
              <figcaption>So ähnlich kann dein Artikel aussehen.</figcaption>
            </figure>
            <p className="sl-text">
              Schreibe in dein Heft einen kurzen Artikel für Miras Rubrik: zu jeder der drei Fragen eine Spalte mit der umgestellten Formel und deiner Rechnung, darunter deine Antwort an
              Mira und ein Satz zu Jonas’ Faustregel.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Wer in 8 Jahren 6.000 € haben will, muss heute … anlegen, denn …“</li>
                <li>„Hinter dem Angebot steckt ein Zinssatz von etwa …, weil …“</li>
                <li>„Bei 3 % verdoppelt sich das Geld nach … Jahren, nicht nach 33, weil …“</li>
                <li>„Liebe Mira, …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Artikel vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien('an Mira')} />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug fest={fest} />
              <Merke title="Die Zinseszinsformel umstellen">
                <MB>{'K_n = K_0 \\cdot q^n'}</MB>
                <ul className="zk-liste">
                  <li>
                    Anfangskapital gesucht: durch <M>{'q^n'}</M> teilen, <M>{'K_0 = \\dfrac{K_n}{q^n}'}</M>
                  </li>
                  <li>
                    Zinsfaktor gesucht: durch <M>{'K_0'}</M> teilen, dann die <M>n</M>-te Wurzel ziehen, <M>{'q = \\sqrt[n]{\\dfrac{K_n}{K_0}}'}</M>, danach{' '}
                    <M>{'p = (q - 1) \\cdot 100'}</M>
                  </li>
                  <li>
                    Laufzeit gesucht: durch <M>{'K_0'}</M> teilen, dann den Logarithmus zur Basis <M>q</M> nehmen, <M>{'n = \\log_{q} \\dfrac{K_n}{K_0}'}</M> (log-Taste, Basis <M>q</M> eintippen), auf volle Jahre
                    aufrunden
                  </li>
                  <li>Zwischenergebnisse im Taschenrechner stehen lassen, nur das Endergebnis runden.</li>
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
      pflicht: ['1', '2', '3', '4'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die fünfte ist freiwillig für Profis. Wenn du die vier Pflichtaufgaben gelöst hast, wartet unten ein Spiel auf dich.
            Einzelarbeit, ca. 15 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Wer hat recht?">
            <McCard
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              title="Übung 1"
              rechnen
              level="basis"
              prompt={
                <p>
                  Luca möchte in 5 Jahren 10.000 € haben, die Bank zahlt 4 %. Tim rechnet <M>{'10\\,000 \\cdot 1{,}04^5'}</M>, Sara rechnet <M>{'10\\,000 : (1 + 0{,}04 \\cdot 5)'}</M>, Ela
                  rechnet <M>{'10\\,000 : 1{,}04^5'}</M>. Wer hat recht?
                </p>
              }
              options={[
                { text: `Tim: ${eur(10000 * 1.04 ** 5)}`, feedback: 'Tim rechnet vorwärts. Gesucht ist aber der Betrag heute, also rückwärts: teilen statt malnehmen.' },
                { text: `Sara: ${eur(10000 / 1.2)}`, feedback: 'Sara rechnet ohne Zinseszins. Hier werden die Zinsen mitverzinst.' },
                { text: `Ela: ${eur(10000 / 1.04 ** 5)}`, correct: true, feedback: <>Genau: <M>{'K_0 = K_n : q^n'}</M>.</> },
                { text: 'Alle drei, die Ergebnisse liegen nah beieinander.', feedback: 'Die Ergebnisse unterscheiden sich um mehrere Tausend Euro. Nur eine Rechnung passt.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Ein Sparbrief">
            <CheckCard
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
              title="Übung 2"
              level="standard"
              prompt={<p>Ein Sparbrief macht aus 2.000 € in 5 Jahren 2.500 €. Welcher Zinssatz steckt dahinter? Runde auf zwei Nachkommastellen.</p>}
              fields={[{ kind: 'num', key: 'p', label: <M>{'p ='}</M>, expected: ((2500 / 2000) ** (1 / 5) - 1) * 100, unit: '%', tol: 0.006 }]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Einsetzen und durch das Anfangskapital teilen', tex: ['2\\,500 = 2\\,000 \\cdot q^5', '1{,}25 = q^5'] },
                    { titel: 'Die 5. Wurzel ziehen', tex: `q = \\sqrt[5]{1{,}25} = ${zt(1.25 ** 0.2, 6)}\\ldots` },
                    { titel: 'Zinssatz berechnen', tex: `p = (q - 1) \\cdot 100 \\approx ${zt((1.25 ** 0.2 - 1) * 100, 2)}\\,\\%` },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Gesucht ist der Zinsfaktor, dann der Zinssatz. Wie in Teil 2.</>,
                    <>
                      <M>{'1{,}25 = q^5'}</M>. Ziehe die 5. Wurzel.
                    </>,
                    <>
                      <M>{'q = \\sqrt[5]{1{,}25}'}</M>, dann <M>{'p = (q - 1) \\cdot 100'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Verdopplung bei 5 %">
            <CheckCard
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              title="Übung 3"
              level="standard"
              prompt={<p>Nach wie vielen vollen Jahren hat sich ein Guthaben bei 5 % Zinseszins zum ersten Mal verdoppelt?</p>}
              fields={[{ kind: 'num', key: 'n', label: 'nach', expected: Math.ceil(Math.log(2) / Math.log(1.05)), unit: 'Jahren' }]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: <>Verdoppeln heißt: <M>{'K_n : K_0 = 2'}</M></>, tex: '2 = 1{,}05^n' },
                    { titel: 'Logarithmus zur Basis q', tex: ['n = \\log_{1{,}05} 2', `n \\approx ${zt(Math.log(2) / Math.log(1.05), 2)}`] },
                    { titel: 'Auf volle Jahre aufrunden', text: 'Nach 15 vollen Jahren ist das Geld zum ersten Mal verdoppelt.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Du kennst kein Anfangskapital. Das brauchst du auch nicht: Verdoppeln heißt <M>{'\\frac{K_n}{K_0} = 2'}</M>.</>,
                    <>
                      <M>{'2 = 1{,}05^n'}</M>. Nimm den Logarithmus zur Basis <M>{'1{,}05'}</M>.
                    </>,
                    <>
                      <M>{'n = \\log_{1{,}05} 2'}</M>, dann aufrunden.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Ein Viertel mehr">
            <CheckCard
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={7}
              title="Übung 4"
              level="erweiterung"
              prompt={<p>Jonas legt Geld zu 2,5 % mit Zinseszins an. Nach wie vielen Jahren hat er ein Viertel mehr als am Anfang? Gib <M>n</M> genau und in vollen Jahren an.</p>}
              fields={[
                { kind: 'num', key: 'n', label: <>genau <M>{'n \\approx'}</M></>, expected: Math.log(1.25) / Math.log(1.025), tol: 0.006 },
                { kind: 'num', key: 'v', label: 'erstmals nach', expected: Math.ceil(Math.log(1.25) / Math.log(1.025)), unit: 'vollen Jahren' },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: <>Ein Viertel mehr heißt: <M>{'K_n : K_0 = 1{,}25'}</M></>, tex: '1{,}25 = 1{,}025^n' },
                    { titel: 'Logarithmus zur Basis q', tex: ['n = \\log_{1{,}025} 1{,}25', `n \\approx ${zt(Math.log(1.25) / Math.log(1.025), 2)}`] },
                    { titel: 'Auf volle Jahre aufrunden', text: 'Nach 9 Jahren fehlt noch ein kleines Stück, nach 10 vollen Jahren ist es geschafft.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Ein Viertel mehr: Das Endkapital ist das 1,25-Fache des Anfangskapitals.</>,
                    <>
                      <M>{'1{,}25 = 1{,}025^n'}</M>
                    </>,
                    <>
                      <M>{'n = \\log_{1{,}025} 1{,}25'}</M>, dann aufrunden.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Die 72er-Regel">
            <McCard
              title="Übung 5"
              profi
              punkte={8}
              level="erweiterung"
              rechnen
              prompt={
                <p>
                  Banker nutzen die Faustregel „72 geteilt durch den Zinssatz“ für die Verdopplungszeit. Prüfe sie bei 6 %: Wie gut passt sie zur genauen Rechnung mit dem Logarithmus?
                </p>
              }
              options={[
                { text: 'Sie ergibt 12 Jahre, genau ist es fast 17 Jahre.', feedback: <>17 Jahre wären 100 : 6, die Regel ohne Zinseszins. Rechne <M>{'\\log_{1{,}06} 2'}</M>.</> },
                { text: 'Sie ergibt 12 Jahre, genau sind es 11,90 Jahre. Sie passt sehr gut.', correct: true, feedback: <>Genau: <M>{'\\log_{1{,}06} 2 \\approx 11{,}90'}</M>. Die 72er-Regel berücksichtigt den Zinseszins.</> },
                { text: 'Sie ergibt 12 Jahre, genau sind es 6 Jahre.', feedback: <>In 6 Jahren wächst das Geld bei 6 % nur auf das <M>{'1{,}06^6 \\approx 1{,}42'}</M>-Fache.</> },
                { text: 'Man kann sie nicht prüfen, weil kein Betrag gegeben ist.', feedback: <>Für die Verdopplung brauchst du keinen Betrag: <M>{'2 = 1{,}06^n'}</M>.</> },
              ]}
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length >= 4} titel="Sanduhr-Check">
            <SanduhrCheck />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>Du kannst jetzt die Zinseszinsformel nach dem Anfangskapital, dem Zinssatz und der Laufzeit umstellen. Im Zinseszinsrechner übst du alle vier Größen.</p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn" onClick={onPrev}>
                Lernsituation 1: Die Münztürme
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Zinseszinsrechner <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell title="Zinseszins: Miras drei Fragen" width="wide" kompakt parent={{ to: '/finanzmathe/zinseszins', label: 'Zinseszins' }}>
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        bildwelt={BILDWELT}
        ziel={
          <>
            Mira hat für den Geld-Check der Schülerzeitung drei Fragen: Wie viel muss ich heute anlegen? Welcher Zinssatz steckt in einem Angebot? Wann hat sich mein Geld
            verdoppelt? Du stellst die Zinseszinsformel nach jeder Größe um und beantwortest alle drei.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Schätzung aus „Problem erkennen“ */
function Rueckbezug({ fest }: { fest: Festlegung<never> }) {
  if (!fest.fest) return null
  const diff = fest.wert - N_DOPPEL
  return (
    <div className="ls-back">
      <p>
        <strong>Deine Schätzung war:</strong> verdoppelt nach etwa {fest.wert} Jahren. Tatsächlich sind es <M>{`n \\approx ${zt(N_DOPPEL, 2)}`}</M>, also {N_VOLL} volle Jahre.{' '}
        {Math.abs(diff) <= 2
          ? 'Sehr gut geschätzt!'
          : diff > 0
            ? `Du lagst ${fmt(diff, 0)} Jahre zu hoch, wie viele, die ohne Zinseszins denken.`
            : `Du lagst ${fmt(-diff, 0)} Jahre zu niedrig.`}{' '}
        Jonas’ Faustregel (33 Jahre) rechnet ohne Zinseszins und liegt fast zehn Jahre daneben.
      </p>
    </div>
  )
}
