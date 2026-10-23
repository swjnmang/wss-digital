import { useState, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, McCard, TrackedCheck, TrackedMc } from '../../lineare_funktionen/lernsituation_kit/kit'
import { SeitenLernsituation, THEMEN, type Seite, type Thema } from '../../lineare_funktionen/lernsituation_kit/seiten'
import { GegebenGesucht, Kriterien, VideoAufklappen, Vermutung, Zitat, type Festlegung } from '../zins_kit/zins_kit'
import { eur, eurTex, faktor, kn, zt } from './shared'
import '../../daten_und_zufall/lernpfad/lernpfad.css'

// Lernsituation Zinseszins 2 „Miras drei Fragen“: K_0, q (p) und n berechnen (ca. 90 min).
// Format Kontrastierende Fälle (Fortsetzung von „Wer hat nach 10 Jahren mehr?“), Festlegung: Wie lange dauert eine Verdopplung?
// (Gegenintuitiv: nicht 100 : p.) Die drei Fragen werden nacheinander gelöst, jede mit Aufgabe → Rechenbeispiel (andere Zahlen) → eigene Rechnung.
// Lernprodukt analog: Die Concept Map aus Lernsituation 1 wird um die drei Umkehrungen ergänzt.
// Identität: Themenfarbe Ocker, Symbol Sanduhr, Titelbild Sanduhr mit Münzen (5.000 € → 10.000 €?), Leitobjekt die Formel-Leiste,
// in der die gesuchte Größe markiert ist. Die Festlegung bleibt nur im Seitenzustand.

const VIDEO_K0 = 'https://youtu.be/vs0o8S9ksjg?list=PLI8kX0XEfSujoc5mrNv30D7mptBkAN3E8&t=130'
const VIDEO_P = 'https://youtu.be/BeJd9e5Qv-E?si=XokDQ8yfwluJy1IW'
const VIDEO_N = 'https://youtu.be/oUjYapq1AX8?si=lx02oGVSFGhtEVdA'

// Frage 1: K_0 gesucht (6.000 € in 8 Jahren bei 3 %)
const K0_MIRA = 6000 / faktor(3) ** 8
// Frage 2: q und p gesucht (5.000 € werden in 6 Jahren zu 6.000 €)
const Q_MIRA = (6000 / 5000) ** (1 / 6)
// Frage 3: n gesucht (Verdopplung bei 3 %)
const N_DOPPEL = Math.log(2) / Math.log(faktor(3))
const N_DOPPEL_VOLL = Math.ceil(N_DOPPEL)

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: Sanduhr, durch die Münzen rieseln. Aus 5.000 € sollen 10.000 € werden. */
function Titelbild() {
  return (
    <svg viewBox="0 0 720 252" role="img" aria-label="Eine Sanduhr, durch die Münzen fallen. Links 5.000 Euro, rechts 10.000 Euro mit einem Fragezeichen: Wann ist das Geld verdoppelt?">
      <rect x="0" y="0" width="720" height="252" fill="var(--primary-soft)" />
      <rect x="300" y="22" width="120" height="14" rx="4" fill="var(--primary)" />
      <rect x="300" y="216" width="120" height="14" rx="4" fill="var(--primary)" />
      <path d="M312 36 L408 36 Q408 96 366 126 Q408 156 408 216 L312 216 Q312 156 354 126 Q312 96 312 36 Z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
      <path d="M326 60 L394 60 Q390 92 360 112 Q330 92 326 60 Z" fill="var(--highlight)" />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx="360" cy={204 - i * 12} rx={40 - i * 8} ry="7" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
      ))}
      <circle cx="360" cy="140" r="5" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="360" cy="160" r="5" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="170" y="120" textAnchor="middle" fontSize="40" fontWeight="800" fill="var(--ink)">
        5.000 €
      </text>
      <text x="170" y="152" textAnchor="middle" fontSize="18" fill="var(--ink-muted)">
        heute, 3 % pro Jahr
      </text>
      <text x="560" y="120" textAnchor="middle" fontSize="40" fontWeight="800" fill="var(--primary)">
        10.000 €
      </text>
      <text x="560" y="152" textAnchor="middle" fontSize="18" fill="var(--ink-muted)">
        nach ? Jahren
      </text>
    </svg>
  )
}

const THEMA: Thema = { name: 'Miras drei Fragen', farbe: 'ocker', icon: 'fa-hourglass-half', bild: <Titelbild /> }

/* ── Leitobjekt: Formel-Leiste ──────────────────────────────────────────── */

type Groesse = 'K0' | 'q' | 'n'
const { farbe: OCKER, soft: OCKER_SOFT } = THEMEN.ocker
const markiert = (t: string) => `\\fcolorbox{${OCKER}}{${OCKER_SOFT}}{$${t}$}`

/** Die Zinseszinsformel; die gesuchte Größe ist markiert */
function FormelLeiste({ ziel }: { ziel?: Groesse }) {
  const k0 = ziel === 'K0' ? markiert('K_0') : 'K_0'
  const q = ziel === 'q' ? markiert('q') : 'q'
  const n = ziel === 'n' ? markiert('n') : 'n'
  return (
    <div className="zz-formel" aria-label={ziel ? `Zinseszinsformel, gesucht ist ${ziel === 'K0' ? 'K null' : ziel}` : 'Zinseszinsformel'}>
      <MB>{`K_n = ${k0} \\cdot ${q}^{${n}}`}</MB>
    </div>
  )
}

/* ── Rechenbeispiele (andere Zahlen als Miras Fragen) ──────────────────── */

const BEISPIEL: Record<Groesse, { titel: string; aufgabe: ReactNode; steps: { title: ReactNode; body: ReactNode }[] }> = {
  K0: {
    titel: 'Wie viel muss Ben heute anlegen?',
    aufgabe: <p>Ben möchte in 5 Jahren 8.000 € für ein Motorrad haben. Die Bank zahlt 2,5 % mit Zinseszins. Wie viel muss er heute anlegen?</p>,
    steps: [
      { title: 'Werte in die Formel einsetzen', body: <MB>{'8000 = K_0 \\cdot 1{,}025^5'}</MB> },
      {
        title: 'Durch q hoch n teilen',
        body: (
          <>
            <p>
              <M>{'K_0'}</M> wird mit <M>{'1{,}025^5'}</M> malgenommen. Die Umkehrung ist Teilen:
            </p>
            <MB>{`K_0 = \\frac{8000}{1{,}025^5} = ${eurTex(8000 / faktor(2.5) ** 5)}`}</MB>
          </>
        ),
      },
      { title: 'Antwort', body: <p>Ben muss heute {eur(8000 / faktor(2.5) ** 5)} anlegen. Probe: Dieser Betrag mal 1,025⁵ ergibt wieder 8.000 €.</p> },
    ],
  },
  q: {
    titel: 'Welcher Zinssatz steckt im Angebot?',
    aufgabe: <p>Aus 4.000 € werden in 7 Jahren 5.000 €. Welcher Zinssatz (mit Zinseszins) steckt dahinter?</p>,
    steps: [
      { title: 'Werte einsetzen', body: <MB>{'5000 = 4000 \\cdot q^7'}</MB> },
      { title: 'Durch das Anfangskapital teilen', body: <MB>{'\\frac{5000}{4000} = q^7 \\quad\\Rightarrow\\quad 1{,}25 = q^7'}</MB> },
      {
        title: 'Die 7. Wurzel ziehen',
        body: (
          <>
            <MB>{`q = \\sqrt[7]{1{,}25} = 1{,}25^{\\frac{1}{7}} = ${zt(1.25 ** (1 / 7), 4)}`}</MB>
            <p>
              Am Taschenrechner: <M>{'1{,}25 \\,\\boxed{x^y}\\, (1 : 7)'}</M> oder mit der Taste <M>{'\\sqrt[x]{\\ }'}</M>.
            </p>
          </>
        ),
      },
      {
        title: 'Zinssatz aus q berechnen',
        body: <MB>{`p = (q - 1) \\cdot 100 = (${zt(1.25 ** (1 / 7), 4)} - 1) \\cdot 100 \\approx ${zt((1.25 ** (1 / 7) - 1) * 100, 2)}\\,\\%`}</MB>,
      },
    ],
  },
  n: {
    titel: 'Wann sind es 4.500 €?',
    aufgabe: <p>3.000 € werden mit 4 % Zinseszins angelegt. Nach wie vielen Jahren sind daraus zum ersten Mal mindestens 4.500 € geworden?</p>,
    steps: [
      { title: 'Werte einsetzen und durch K₀ teilen', body: <MB>{'4500 = 3000 \\cdot 1{,}04^n \\quad\\Rightarrow\\quad 1{,}5 = 1{,}04^n'}</MB> },
      {
        title: 'Logarithmus anwenden',
        body: (
          <>
            <MB>{'\\lg 1{,}5 = n \\cdot \\lg 1{,}04'}</MB>
            <p>
              Das geht, weil <M>{'\\lg(a^n) = n \\cdot \\lg a'}</M> gilt: Die Hochzahl wandert nach vorn.
            </p>
          </>
        ),
      },
      { title: 'Nach n auflösen', body: <MB>{`n = \\frac{\\lg 1{,}5}{\\lg 1{,}04} = ${zt(Math.log(1.5) / Math.log(1.04), 2)}`}</MB> },
      {
        title: 'Auf volle Jahre aufrunden',
        body: <p>Zinsen gibt es am Jahresende. Nach 10 Jahren fehlt noch etwas, nach 11 Jahren sind es erstmals mindestens 4.500 €.</p>,
      },
    ],
  },
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function VerdopplungEinstieg({ onBack, onPractice, onPrev }: { onBack: () => void; onPractice: () => void; onPrev: () => void }) {
  const [fest, setFest] = useState<Festlegung<never>>({ wahl: null, wert: 30, fest: false })

  const fragePage = (g: Groesse, titel: string, frage: ReactNode, gegeben: ReactNode, gesucht: ReactNode, video: { src: string; title: string }): Seite => ({
    art: 'loesen',
    titel,
    frei: true,
    inhalt: () => (
      <>
        <div className="sl-fokus">
          <p className="sl-fokus-titel">Deine Aufgabe</p>
          <p>{frage}</p>
        </div>
        <FormelLeiste ziel={g} />
        <GegebenGesucht gegeben={gegeben} gesucht={gesucht} />
        <p className="sl-hinweis">So stellst du die Formel um, an einem Beispiel mit anderen Zahlen:</p>
        <Beispiel offen title={BEISPIEL[g].titel} aufgabe={BEISPIEL[g].aufgabe} steps={BEISPIEL[g].steps} />
        <VideoAufklappen src={video.src} title={video.title} />
      </>
    ),
  })

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen 1: Endkapital',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="a) Endkapital mit Zinseszins"
          level="basis"
          prompt={
            <p>
              <M>{'3000\\text{ €}'}</M> werden 4 Jahre lang mit <M>{'2\\,\\%'}</M> pro Jahr verzinst, die Zinsen bleiben auf dem Konto. Berechne das Endkapital.
            </p>
          }
          fields={[{ kind: 'num', key: 'k', label: <M>{'K_4 ='}</M>, expected: kn(3000, 2, 4), unit: '€', tol: 0.05 }]}
          solution={<MB>{`K_4 = 3000 \\cdot 1{,}02^4 = ${eurTex(kn(3000, 2, 4))}`}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 2: Zinsfaktor',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="b) Zinsfaktor"
          level="basis"
          prompt={
            <p>
              Der Zinssatz beträgt <M>{'3{,}5\\,\\%'}</M>. Wie lautet der Zinsfaktor <M>q</M>?
            </p>
          }
          fields={[{ kind: 'num', key: 'q', label: <M>{'q ='}</M>, expected: 1.035, tol: 0.0001 }]}
          solution={<MB>{'q = 1 + \\frac{3{,}5}{100} = 1{,}035'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 3: Wurzel mit dem Taschenrechner',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="c) Wurzel"
          level="standard"
          prompt={
            <p>
              Berechne <M>{'\\sqrt[4]{81}'}</M>. Am Taschenrechner nutzt du die Taste für die n-te Wurzel (oft <M>{'\\sqrt[x]{\\ }'}</M>) oder rechnest <M>{'81^{1/4}'}</M>.
            </p>
          }
          fields={[{ kind: 'num', key: 'w', label: <M>{'\\sqrt[4]{81} ='}</M>, expected: 3, tol: 0.0001 }]}
          solution={<MB>{'\\sqrt[4]{81} = 81^{\\frac{1}{4}} = 3 \\qquad \\text{denn } 3^4 = 81'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 4: Formel umstellen',
      inhalt: (fertig) => (
        <McCard
          onSolved={fertig}
          title="d) Formel umstellen"
          level="standard"
          prompt={
            <p>
              Du kennst <M>{'K_n = K_0 \\cdot q^n'}</M>. <M>{'K_n'}</M>, <M>q</M> und <M>n</M> sind gegeben, du suchst <M>{'K_0'}</M>. Wie stellst du um?
            </p>
          }
          options={[
            { text: 'K₀ = Kₙ − qⁿ', feedback: 'K₀ und qⁿ sind multipliziert, nicht addiert. Also muss man dividieren, nicht subtrahieren.' },
            { text: 'K₀ = Kₙ : qⁿ', correct: true, feedback: 'K₀ wird mit qⁿ malgenommen. Die Umkehrung ist das Teilen durch qⁿ.' },
            { text: 'K₀ = Kₙ · qⁿ', feedback: 'Dann würde das Kapital noch weiter wachsen. Gesucht ist der kleinere Startwert, also teilst du.' },
            { text: 'K₀ = Kₙ : (q · n)', feedback: 'qⁿ ist q hoch n, nicht q mal n. Teile durch die ganze Potenz.' },
          ]}
        />
      ),
    },
    {
      art: 'problem',
      titel: 'Mira hat noch Fragen',
      bedingung: 'Halte deine Vermutung fest, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Mira will ihr Geld anlegen. Vorher hat sie drei Fragen:</p>
          <ol className="zk-liste">
            <li>Ich will in 8 Jahren 6.000 € für meinen Führerschein haben. Die Bank bietet 3 %. Wie viel muss ich heute anlegen?</li>
            <li>Ein anderes Angebot verspricht: Aus 5.000 € werden in 6 Jahren 6.000 €. Welcher Zinssatz steckt dahinter?</li>
            <li>Wie lange dauert es bei 3 %, bis sich mein Geld verdoppelt hat?</li>
          </ol>
          <Zitat wer="Jonas">
            <p>Frage 3 ist einfach: 100 geteilt durch 3. Also etwa 33 Jahre.</p>
          </Zitat>
          <FormelLeiste />
          <p className="sl-hinweis">Bei jeder Frage ist eine andere Größe der Formel gesucht.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Lege dich fest, ohne zu rechnen</p>
            <p>Stimmt Jonas’ Faustregel? Nach wie vielen Jahren hat sich ein Guthaben bei 3 % Zinseszins verdoppelt?</p>
          </div>
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
            onFest={fertig}
            gespeichert={(w) => (
              <>
                Deine Vermutung: Verdoppelt nach etwa <strong>{w.wert} Jahren</strong>.
              </>
            )}
          />
        </>
      ),
    },
    fragePage(
      'K0',
      'Frage 1: Wie viel muss Mira heute anlegen?',
      <>Mira möchte nach 8 Jahren 6.000 € haben. Die Bank zahlt 3 % mit Zinseszins. Wie viel muss sie heute anlegen?</>,
      <>
        <M>{'K_8 = 6000'}</M> €, <M>{'p = 3'}</M>, <M>{'n = 8'}</M>
      </>,
      <>
        das Anfangskapital <M>{'K_0'}</M>
      </>,
      { src: VIDEO_K0, title: 'Erklärvideo: Anfangskapital berechnen' },
    ),
    {
      art: 'loesen',
      titel: 'Jetzt du: Miras Anfangskapital',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Anfangskapital berechnen"
          prompt={<p>Rechne wie im Beispiel. Fülle die Lücken aus.</p>}
          rechnung={[
            { l: ['q'], r: ['1 + \\frac{3}{100} =', { luecke: 'q' }] },
            { l: ['K_0'], r: ['\\frac{6000}{q^8} =', { luecke: 'k', breit: true }, '\\text{ €}'] },
          ]}
          fields={[
            { kind: 'num', key: 'q', label: 'Zinsfaktor', expected: 1.03, tol: 0.0001 },
            { kind: 'num', key: 'k', label: 'Anfangskapital', expected: K0_MIRA, tol: 0.05 },
          ]}
          solution={
            <>
              <MB>{`K_0 = \\frac{6000}{1{,}03^8} = ${eurTex(K0_MIRA)}`}</MB>
              <p>Mira muss heute nur {eur(K0_MIRA)} anlegen. In 8 Jahren wächst das Geld um {eur(6000 - K0_MIRA)}.</p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Welche Größe ist gesucht? Schau auf die Formel-Leiste: Diesmal ist der Startwert gesucht.</>,
                <>
                  Teile <M>{'6000'}</M> durch <M>{'1{,}03^8'}</M>.
                </>,
                <>Taschenrechner: erst 1,03 hoch 8 ausrechnen, dann 6.000 durch das Ergebnis teilen.</>,
              ]}
            />
          }
        />
      ),
    },
    fragePage(
      'q',
      'Frage 2: Welcher Zinssatz steckt dahinter?',
      <>Aus 5.000 € werden in 6 Jahren 6.000 €. Berechne den Zinsfaktor q und den Zinssatz p.</>,
      <>
        <M>{'K_0 = 5000'}</M> €, <M>{'K_6 = 6000'}</M> €, <M>{'n = 6'}</M>
      </>,
      <>
        der Zinsfaktor <M>q</M> und der Zinssatz <M>p</M>
      </>,
      { src: VIDEO_P, title: 'Erklärvideo: Zinssatz berechnen' },
    ),
    {
      art: 'loesen',
      titel: 'Jetzt du: Der Zinssatz des Angebots',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Zinssatz berechnen"
          prompt={<p>Rechne wie im Beispiel. Runde q auf vier und p auf zwei Nachkommastellen.</p>}
          rechnung={[
            { l: ['q^6'], r: ['\\frac{6000}{5000} =', { luecke: 'v' }] },
            { l: ['q'], r: ['\\sqrt[6]{\\,q^6\\,} =', { luecke: 'q' }] },
            { l: ['p'], r: ['(q - 1) \\cdot 100 =', { luecke: 'p' }, '\\,\\%'] },
          ]}
          fields={[
            { kind: 'num', key: 'v', label: 'Verhältnis', expected: 1.2, tol: 0.0001 },
            { kind: 'num', key: 'q', label: 'Zinsfaktor', expected: Q_MIRA, tol: 0.0006 },
            { kind: 'num', key: 'p', label: 'Zinssatz', expected: (Q_MIRA - 1) * 100, tol: 0.06 },
          ]}
          solution={
            <MB>{`q^6 = 1{,}2 \\qquad q = \\sqrt[6]{1{,}2} = ${zt(Q_MIRA, 4)} \\qquad p = ${zt((Q_MIRA - 1) * 100, 2)}\\,\\%`}</MB>
          }
          help={
            <Hilfen
              steps={[
                <>Setze in die Formel ein: 6.000 = 5.000 · q⁶. Teile zuerst durch 5.000.</>,
                <>
                  <M>{'q^6 = 1{,}2'}</M>. Ziehe die 6. Wurzel: <M>{'1{,}2^{\\frac{1}{6}}'}</M>.
                </>,
                <>
                  <M>{`q \\approx ${zt(Q_MIRA, 4)}`}</M>. Dann <M>{'p = (q - 1) \\cdot 100'}</M>.
                </>,
              ]}
            />
          }
        />
      ),
    },
    fragePage(
      'n',
      'Frage 3: Wann hat sich das Geld verdoppelt?',
      <>Wie viele Jahre dauert es bei 3 % Zinseszins, bis sich 5.000 € zum ersten Mal auf mindestens 10.000 € verdoppelt haben?</>,
      <>
        <M>{'K_0 = 5000'}</M> €, <M>{'K_n = 10\\,000'}</M> €, <M>{'p = 3'}</M>
      </>,
      <>
        die Laufzeit <M>n</M>
      </>,
      { src: VIDEO_N, title: 'Erklärvideo: Laufzeit berechnen' },
    ),
    {
      art: 'loesen',
      titel: 'Jetzt du: Miras Verdopplungszeit',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Laufzeit berechnen"
          prompt={<p>Rechne wie im Beispiel. Runde n auf zwei Nachkommastellen. Gib dann an, nach wie vielen vollen Jahren das Geld erstmals verdoppelt ist.</p>}
          rechnung={[
            { l: ['1{,}03^n'], r: ['\\frac{10\\,000}{5000} =', { luecke: 'v' }] },
            { l: ['n'], r: ['\\frac{\\lg 2}{\\lg 1{,}03} =', { luecke: 'n' }] },
            { l: ['\\text{volle Jahre}'], r: [{ luecke: 'j' }] },
          ]}
          fields={[
            { kind: 'num', key: 'v', label: 'Verhältnis', expected: 2, tol: 0.0001 },
            { kind: 'num', key: 'n', label: 'Laufzeit n', expected: N_DOPPEL, tol: 0.02 },
            { kind: 'num', key: 'j', label: 'volle Jahre', expected: N_DOPPEL_VOLL, tol: 0.01 },
          ]}
          solution={
            <>
              <MB>{`2 = 1{,}03^n \\qquad n = \\frac{\\lg 2}{\\lg 1{,}03} = ${zt(N_DOPPEL, 2)}`}</MB>
              <p>
                Nach {N_DOPPEL_VOLL} Jahren sind es erstmals mehr als 10.000 € ({eur(kn(5000, 3, N_DOPPEL_VOLL))}). Nicht erst nach 33 Jahren, wie Jonas dachte.
              </p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Setze ein: 10.000 = 5.000 · 1,03ⁿ. Teile durch 5.000.</>,
                <>
                  <M>{'2 = 1{,}03^n'}</M>. Wende den Logarithmus an: <M>{'n = \\lg 2 : \\lg 1{,}03'}</M>.
                </>,
                <>Zinsen gibt es nur am Jahresende. Runde deshalb auf volle Jahre auf.</>,
              ]}
            />
          }
        />
      ),
    },
    {
      art: 'loesen',
      titel: 'Für Profis: Verdopplung bei 6 %',
      frei: true,
      inhalt: () => (
        <CheckCard
          title="Faustregel prüfen"
          level="erweiterung"
          prompt={<p>Wie lange dauert die Verdopplung bei 6 % Zinseszins? Vergleiche mit Jonas’ Faustregel „100 : p“. Wie groß ist die Abweichung in Jahren?</p>}
          fieldsRow
          fields={[
            { kind: 'num', key: 'n', label: <M>{'n ='}</M>, expected: Math.log(2) / Math.log(1.06), tol: 0.05, unit: 'Jahre' },
            { kind: 'num', key: 'd', label: <>Abweichung</>, expected: 100 / 6 - Math.log(2) / Math.log(1.06), tol: 0.08, unit: 'Jahre' },
          ]}
          solution={
            <>
              <MB>{`n = \\frac{\\lg 2}{\\lg 1{,}06} = ${zt(Math.log(2) / Math.log(1.06), 2)}`}</MB>
              <p>Die Faustregel liefert 100 : 6 = 16,67 Jahre, also {fmt(100 / 6 - Math.log(2) / Math.log(1.06), 2)} Jahre zu viel. Mit Zinseszins geht es deutlich schneller.</p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Für eine Verdopplung ist Kₙ : K₀ = 2. Du brauchst keine konkreten Beträge.</>,
                <>
                  <M>{'2 = 1{,}06^n'}</M>, dann den Logarithmus anwenden.
                </>,
                <>
                  <M>{'n = \\lg 2 : \\lg 1{,}06'}</M>. Die Faustregel liefert <M>{'100 : 6'}</M>.
                </>,
              ]}
            />
          }
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
          <Merke title="Die Zinseszinsformel umstellen">
            <MB>{'K_0 = \\frac{K_n}{q^n} \\qquad q = \\sqrt[n]{\\frac{K_n}{K_0}}, \\;\\; p = (q - 1) \\cdot 100 \\qquad n = \\frac{\\lg\\left(\\frac{K_n}{K_0}\\right)}{\\lg q}'}</MB>
            <ul>
              <li>
                Gesucht ist der Startwert: durch <M>{'q^n'}</M> teilen.
              </li>
              <li>
                Gesucht ist der Zinssatz: durch <M>{'K_0'}</M> teilen, die <M>n</M>-te Wurzel ziehen, dann <M>{'p = (q - 1) \\cdot 100'}</M>.
              </li>
              <li>Gesucht ist die Laufzeit: durch K₀ teilen, Logarithmus anwenden. Fragt die Aufgabe nach „erstmals“, rundest du auf volle Jahre auf.</li>
              <li>Die Faustregel „100 : p“ gilt nur ohne Zinseszins. Mit Zinseszins geht es schneller.</li>
            </ul>
          </Merke>
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Eure Concept Map ergänzen (Lernprodukt)',
      bedingung: 'Hake alle Punkte ab, die eure Concept Map enthält.',
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Ergänzt eure Concept Map „Zins und Zinseszins“</p>
            <p>Nehmt das A3-Blatt aus der ersten Lernsituation und ergänzt die drei Umkehrungen, jeweils mit einem Beispiel.</p>
          </div>
          <Kriterien
            onAlle={fertig}
            items={[
              'Startwert K₀: Formel und ein Beispiel',
              'Zinsfaktor q und Zinssatz p: Formel und ein Beispiel',
              'Laufzeit n: Logarithmus, Aufrunden auf volle Jahre und ein Beispiel',
              'Ein typischer Fehler, z. B. die Faustregel „100 : p“ oder 3 statt 1,03',
            ]}
          />
          <details className="ls-way">
            <summary>So könnte eine fertige Concept Map aufgebaut sein</summary>
            <div className="ls-way-body">
              <p>
                <strong>Mitte:</strong> Zinseszins (Zinsen bleiben auf dem Konto und werden mitverzinst). <strong>Äste:</strong> Vergleich Jonas und Mira mit Graph, die Formel{' '}
                <M>{'K_n = K_0 \\cdot q^n'}</M> mit <M>{'q = 1 + \\frac{p}{100}'}</M>, die drei Umkehrungen, typische Fehler.
              </p>
            </div>
          </details>
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 1: Wer hat recht?',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Zinseszins-Einstieg 2: Anfangskapital (Basis)"
          title="Check 1"
          rechnen
          level="basis"
          prompt={
            <p>
              Mira will in 8 Jahren 6.000 € bei 3 % haben. Sie rechnet: „6000 · 1,03⁸ = 7.600,62 €. Ich muss also 7.600,62 € anlegen.“ Jonas sagt: „Das stimmt nicht.“ Was ist
              richtig?
            </p>
          }
          options={[
            { text: 'Mira hat recht, man muss multiplizieren.', feedback: 'Mit 1,03⁸ malnehmen zeigt, was in 8 Jahren aus dem Geld wird. Gesucht ist der Betrag heute, also teilst du.' },
            { text: `Jonas hat recht: K₀ = 6000 : 1,03⁸ = ${fmt(K0_MIRA, 2, true)} €.`, correct: true, feedback: 'Mira müsste sonst mehr anlegen, als sie am Ende haben will.' },
            { text: 'Beide haben unrecht, man muss 6000 − 1,03⁸ rechnen.', feedback: 'Das Kapital wird mit 1,03⁸ malgenommen, also teilst du durch 1,03⁸.' },
            { text: 'Jonas hat recht: K₀ = 6000 : 1,03 · 8.', feedback: 'Die 8 gehört in die Hochzahl: 1,03⁸, nicht mal 8.' },
          ]}
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 2: Zinssatz bestimmen',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Zinseszins-Einstieg 2: Zinssatz (Standard)"
          title="Check 2"
          rechnen
          level="standard"
          prompt={<p>Aus 2.000 € werden in 5 Jahren 2.500 €. Welcher Zinssatz (mit Zinseszins) steckt dahinter?</p>}
          options={[
            { text: '5 %', feedback: '25 % Wachstum in 5 Jahren wären ohne Zinseszins 5 % pro Jahr. Mit Zinseszins reicht ein kleinerer Zinssatz.' },
            { text: '1,0456 %', feedback: 'Das ist der Zinsfaktor q, noch nicht der Zinssatz. p = (q − 1) · 100.' },
            { text: `${fmt((1.25 ** (1 / 5) - 1) * 100, 2)} %`, correct: true, feedback: 'q = ⁵√1,25 ≈ 1,0456, also p ≈ 4,56 %.' },
            { text: '25 %', feedback: '25 % ist der Zuwachs nach 5 Jahren, nicht der Zinssatz pro Jahr.' },
          ]}
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 3: Verdopplung bei 5 %',
      inhalt: (fertig) => (
        <TrackedMc
          onSolved={fertig}
          topic="Zinseszins-Einstieg 2: Laufzeit (Standard)"
          title="Check 3"
          rechnen
          level="standard"
          prompt={<p>Ein Guthaben wird mit 5 % Zinseszins angelegt. Wie lange dauert es, bis es sich erstmals verdoppelt hat?</p>}
          options={[
            { text: '20 Jahre (100 : 5)', feedback: 'Diese Faustregel gilt nur ohne Zinseszins. Mit Zinseszins geht es schneller.' },
            { text: '15 Jahre (n = lg 2 : lg 1,05 ≈ 14,2, aufgerundet)', correct: true, feedback: 'Nach 14 Jahren fehlt noch ein wenig, nach 15 Jahren ist das Guthaben erstmals verdoppelt.' },
            { text: '10 Jahre', feedback: 'Nach 10 Jahren hat man bei 5 % erst rund 63 % Zuwachs, nicht 100 %.' },
            { text: '5 Jahre', feedback: 'Die 5 ist der Zinssatz, nicht die Laufzeit.' },
          ]}
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 4: Gemischte Aufgabe',
      inhalt: (fertig) => (
        <TrackedCheck
          onSolved={fertig}
          topic="Zinseszins-Einstieg 2: Laufzeit (Erweiterung)"
          title="Check 4"
          level="erweiterung"
          prompt={<p>2.000 € werden mit 2,5 % Zinseszins angelegt. Nach wie vielen Jahren sind es erstmals mehr als 2.500 €?</p>}
          fieldsRow
          fields={[
            { kind: 'num', key: 'n', label: <M>{'n ='}</M>, expected: Math.log(1.25) / Math.log(1.025), tol: 0.02 },
            { kind: 'num', key: 'v', label: <>erstmals nach</>, expected: Math.ceil(Math.log(1.25) / Math.log(1.025)), unit: 'vollen Jahren', tol: 0.01 },
          ]}
          solution={
            <MB>{`1{,}25 = 1{,}025^n \\qquad n = \\frac{\\lg 1{,}25}{\\lg 1{,}025} = ${zt(Math.log(1.25) / Math.log(1.025), 2)} \\qquad \\text{also nach ${Math.ceil(Math.log(1.25) / Math.log(1.025))} Jahren}`}</MB>
          }
          help={
            <Hilfen
              steps={[
                <>Welche Größe ist gesucht? Notiere K₀, Kₙ und q.</>,
                <>
                  Teile durch K₀: <M>{'1{,}25 = 1{,}025^n'}</M>. Wende dann den Logarithmus an.
                </>,
                <>
                  <M>{'n = \\lg 1{,}25 : \\lg 1{,}025'}</M>, dann aufrunden.
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
          <p>Du kannst jetzt alle vier Größen der Zinseszinsformel berechnen. Übe das mit weiteren Aufgaben.</p>
          <div className="bk-actions">
            <button type="button" className="bk-btn" onClick={onPrev}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Lernsituation 1: Wer hat nach 10 Jahren mehr?
            </button>
            <button type="button" className="bk-btn" onClick={onBack}>
              Zurück zur Auswahl
            </button>
            <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
              Weiter üben: Zinseszins <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <TaskShell title="Zinseszins: Miras drei Fragen" width="wide" kompakt parent={{ to: '/finanzmathe/zinseszins', label: 'Zinseszins' }}>
      <SeitenLernsituation
        ruhig
        thema={THEMA}
        ziel={<>In dieser Lernsituation beantwortest du Miras drei Fragen. Du stellst die Zinseszinsformel um und berechnest Anfangskapital, Zinssatz und Laufzeit.</>}
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Vermutung aus Phase 2 */
function Rueckbezug({ fest }: { fest: Festlegung<never> }) {
  if (!fest.fest) return null
  const diff = Math.abs(fest.wert - N_DOPPEL)
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> verdoppelt nach etwa {fest.wert} Jahren. Tatsächlich sind es {fmt(N_DOPPEL, 1)} Jahre, also {N_DOPPEL_VOLL} volle Jahre. Jonas’
        Faustregel (33 Jahre) gilt nur ohne Zinseszins.{' '}
        {diff <= 2 ? 'Deine Schätzung war sehr gut!' : `Deine Schätzung lag ${fmt(diff, 0)} Jahre ${fest.wert > N_DOPPEL ? 'zu hoch' : 'zu niedrig'}.`}
      </p>
    </div>
  )
}
