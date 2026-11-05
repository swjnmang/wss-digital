import type { ReactNode } from 'react'
import { M, fmt } from '../../daten_und_zufall/lernpfad/kit'
import MuenzSpiel, { mischen, type SpielOption, type SpielRunde } from './MuenzSpiel'
import { eur } from './shared'

// Die beiden Bonus-Spiele der Zinseszins-Lernsituationen, beide auf dem Gerüst MuenzSpiel (4 Runden à 2 Punkte = 8 Punkte):
// „Münzturm-Duell“ (Die Münztürme: Endkapital) und „Sanduhr-Check“ (Miras drei Fragen: K₀, p oder n gesucht).

const RUNDEN = 4
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const r2 = (v: number) => Math.round(v * 100) / 100
const pTex = (p: number) => `p = ${String(p).replace('.', '{,}')}\\,\\%`
/** Alle Optionen deutlich verschieden (ganze Euro bzw. Text verschieden) */
const verschieden = (o: SpielOption[]) => new Set(o.map((x) => x.text)).size === o.length

/* ── Münzturm-Duell: Endkapital ──────────────────────────────────────────── */

function endkapitalRunde(): SpielRunde {
  for (;;) {
    const k0 = pick([1000, 2000, 2500, 4000, 6000, 8000])
    const p = pick([2, 2.5, 3, 4, 5])
    const n = pick([4, 5, 6, 8, 10, 12])
    const q = 1 + p / 100
    const kn = k0 * q ** n
    const optionen: SpielOption[] = [
      { text: eur(r2(kn)), richtig: true, grund: '' },
      { text: eur(r2(k0 * (1 + (p / 100) * n))), richtig: false, grund: 'So viel wäre es, wenn die Zinsen jedes Jahr ausgezahlt würden. Hier werden sie mitverzinst.' },
      { text: eur(r2(k0 * q ** (n - 1))), richtig: false, grund: 'Hier fehlt ein Jahr: Die Hochzahl ist die Anzahl der Jahre.' },
      { text: eur(r2(kn - k0)), richtig: false, grund: 'Das sind nur die Zinsen. Das Anfangskapital gehört zum Endkapital dazu.' },
    ]
    if (!verschieden(optionen)) continue
    return {
      frage: (
        <p>
          <strong>{eur(k0)}</strong> werden zu <M>{pTex(p)}</M> angelegt, die Zinsen bleiben auf dem Konto. Wie viel Geld ist nach <strong>{n} Jahren</strong> auf dem
          Konto?
        </p>
      ),
      optionen: mischen(optionen),
    }
  }
}

/** Spielbrett: Miras Münzturm wächst mit jeder richtigen Münze */
function Turm({ muenzen, gesamt }: { muenzen: number; gesamt: number }) {
  const anzahl = 4 + muenzen * 2
  return (
    <svg viewBox="0 0 720 230" className="zz-spiel-bild" role="img" aria-label={`Münzturm mit ${anzahl} Münzen, ${muenzen} von ${gesamt} Runden richtig.`}>
      <path d="M140 200 L360 150 L580 200 L360 228 Z" fill="#dcae72" stroke="#a06d3a" strokeWidth="2" />
      {Array.from({ length: anzahl }, (_, i) => (
        <g key={i}>
          <ellipse cx="360" cy={186 - i * 11} rx="44" ry="15" fill="#b8861f" />
          <ellipse cx="360" cy={180 - i * 11} rx="44" ry="15" fill={i >= 4 ? 'var(--primary)' : '#e9b949'} stroke="#7a4f22" strokeWidth="1.5" />
        </g>
      ))}
      <text x="470" y="80" fontSize="20" fontWeight="700" fill="var(--ink)">
        Zinsen bleiben im Turm
      </text>
    </svg>
  )
}

export function MuenzturmDuell() {
  return (
    <MuenzSpiel
      runden={() => Array.from({ length: RUNDEN }, endkapitalRunde)}
      bild={(m, g) => <Turm muenzen={m} gesamt={g} />}
      treffer="Richtig! Dein Münzturm wächst."
      lob={(m, g) =>
        m === g ? 'Alle Münzen richtig: Du rechnest das Endkapital sicher aus.' : m >= g - 1 ? `Stark: ${m} von ${g} Münzen.` : `${m} von ${g} Münzen. Lies die Erklärungen noch einmal und spiele erneut.`
      }
    />
  )
}

/* ── Sanduhr-Check: K₀, p oder n gesucht ─────────────────────────────────── */

type Art = 'K0' | 'p' | 'n'

function sanduhrRunde(art: Art): SpielRunde {
  for (;;) {
    const p = pick([2, 2.5, 3, 4, 5, 6])
    const q = 1 + p / 100
    const n = pick([5, 6, 8, 10, 12])
    const k0 = pick([2000, 3000, 4000, 5000, 8000])
    let frage: ReactNode
    let optionen: SpielOption[]
    if (art === 'K0') {
      const kn = pick([5000, 6000, 8000, 10000, 12000])
      frage = (
        <p>
          In <strong>{n} Jahren</strong> sollen <strong>{eur(kn)}</strong> auf dem Konto sein, <M>{pTex(p)}</M>. Wie viel muss heute angelegt werden?
        </p>
      )
      optionen = [
        { text: eur(r2(kn / q ** n)), richtig: true, grund: '' },
        { text: eur(r2(kn * q ** n)), richtig: false, grund: <>Hier wurde mal <M>{'q^n'}</M> gerechnet. Rückwärts teilst du durch <M>{'q^n'}</M>.</> },
        { text: eur(r2(kn / (1 + (p / 100) * n))), richtig: false, grund: 'So rechnet man ohne Zinseszins. Hier werden die Zinsen mitverzinst.' },
        { text: eur(r2(kn / (q * n))), richtig: false, grund: <>Hier wurde durch <M>{'q \\cdot n'}</M> geteilt. Die Jahre stehen als Hochzahl: <M>{'q^n'}</M>.</> },
      ]
    } else if (art === 'p') {
      const kn = r2(k0 * q ** n)
      const v = kn / k0
      frage = (
        <p>
          Aus <strong>{eur(k0)}</strong> werden in <strong>{n} Jahren</strong> <strong>{eur(kn)}</strong>. Welcher Zinssatz steckt dahinter?
        </p>
      )
      const pr = (x: number) => `${fmt(x, 2)} %`
      optionen = [
        { text: pr((v ** (1 / n) - 1) * 100), richtig: true, grund: '' },
        { text: pr(((v - 1) / n) * 100), richtig: false, grund: 'Der Zuwachs wurde einfach durch die Jahre geteilt. Beim Zinseszins brauchst du die n-te Wurzel.' },
        { text: pr((v - 1) * 100), richtig: false, grund: 'Das ist der Zuwachs über alle Jahre zusammen, nicht der Zinssatz pro Jahr.' },
        { text: pr(v ** (1 / n) - 1), richtig: false, grund: <>Hier fehlt das Mal 100: Aus <M>{'q - 1'}</M> wird erst mit 100 der Zinssatz in Prozent.</> },
      ]
    } else {
      const faktor = pick([1.5, 2])
      const kn = k0 * faktor
      const genau = Math.log(faktor) / Math.log(q)
      const jahre = (x: number) => `nach ${fmt(x, 0)} Jahren`
      frage = (
        <p>
          <strong>{eur(k0)}</strong> werden zu <M>{pTex(p)}</M> angelegt. Nach wie vielen vollen Jahren sind es zum ersten Mal mindestens <strong>{eur(kn)}</strong>?
        </p>
      )
      optionen = [
        { text: jahre(Math.ceil(genau)), richtig: true, grund: '' },
        { text: jahre(Math.floor(genau)), richtig: false, grund: <>Abgerundet: Nach {fmt(Math.floor(genau), 0)} Jahren fehlt noch etwas. Zinsen gibt es erst am Jahresende, also aufrunden.</> },
        { text: jahre(Math.round(((faktor - 1) * 100) / p)), richtig: false, grund: 'So rechnet man ohne Zinseszins. Mit Zinseszins geht es schneller.' },
        { text: jahre(Math.ceil(Math.log(kn) / Math.log(q))), richtig: false, grund: <>Hier wurde nicht durch <M>{'K_0'}</M> geteilt. Erst den Faktor <M>{'\\frac{K_n}{K_0}'}</M> bilden, dann den Logarithmus.</> },
      ]
    }
    if (!verschieden(optionen)) continue
    return { frage, optionen: mischen(optionen) }
  }
}

/** Sanduhr: Mit jeder richtigen Münze rieselt mehr Sand nach unten */
function Sanduhr({ muenzen, gesamt }: { muenzen: number; gesamt: number }) {
  const anteil = muenzen / gesamt
  const glas = 'M312 24 L408 24 Q408 86 366 116 Q408 146 408 206 L312 206 Q312 146 354 116 Q312 86 312 24 Z'
  return (
    <svg viewBox="0 0 720 230" className="zz-spiel-bild" role="img" aria-label={`Sanduhr: ${muenzen} von ${gesamt} Runden richtig.`}>
      <defs>
        <clipPath id="zz-sanduhr-glas">
          <path d={glas} />
        </clipPath>
      </defs>
      <g clipPath="url(#zz-sanduhr-glas)">
        <rect x="300" y={40 + 76 * anteil} width="120" height={76 - 76 * anteil} fill="var(--primary)" opacity="0.85" />
        <rect x="300" y={206 - 80 * anteil} width="120" height={80 * anteil} fill="var(--primary)" />
      </g>
      <path d={glas} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
      <rect x="300" y="12" width="120" height="12" rx="4" fill="var(--ink)" />
      <rect x="300" y="206" width="120" height="12" rx="4" fill="var(--ink)" />
      <text x="470" y="124" fontSize="22" fontWeight="700" fill="var(--ink)">
        {muenzen} von {gesamt} richtig
      </text>
    </svg>
  )
}

export function SanduhrCheck() {
  return (
    <MuenzSpiel
      runden={() => (['K0', 'p', 'n', (['K0', 'p', 'n'] as Art[])[Math.floor(Math.random() * 3)]] as Art[]).sort(() => Math.random() - 0.5).map(sanduhrRunde)}
      bild={(m, g) => <Sanduhr muenzen={m} gesamt={g} />}
      treffer="Richtig! Die Sanduhr läuft weiter."
      lob={(m, g) =>
        m === g ? 'Alle Münzen richtig: Du stellst die Zinseszinsformel nach jeder Größe um.' : m >= g - 1 ? `Stark: ${m} von ${g} Münzen.` : `${m} von ${g} Münzen. Lies die Erklärungen noch einmal und spiele erneut.`
      }
    />
  )
}
