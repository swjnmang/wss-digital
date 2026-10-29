import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskShell from '../../../../components/layout/TaskShell';
import { Beispiel, M, MB, Merke, QuerTabelle, Reihe } from '../../lernpfad/kit';
import { Striche } from '../../lernpfad/DatenOrdnen';
import { CheckCard, Hilfen, McCard, TrackedCheck, TrackedMc } from '../../../lineare_funktionen/lernsituation_kit/kit';
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Handlungsprodukt,
  SeitenLernsituation,
  type Seite,
  type Thema,
} from '../../../lineare_funktionen/lernsituation_kit/seiten';
import { Bilanz } from '../../../lineare_funktionen/lernsituation_kit/punkte';
import { Kriterien, Vermutung, Zitat, type Festlegung } from '../../../finanzmathe/zins_kit/zins_kit';
import '../../lernpfad/lernpfad.css';
import ZettelSpiel from './ZettelSpiel';
import './kiosk.css';

// Lernsituation 5.1 „Der Pausenkiosk“: Urliste, Strichliste, Häufigkeitstabelle und Rangfolge (ca. 45 min).
// Format Rollenspiel/Beratungsauftrag: Die SuS sind Azubis im Schulkiosk und beraten die Kioskleiterin, welches Getränk sie mehr bestellt.
// Auf 40 Zetteln steht je ein Lieblingsgetränk. Beim Durchblättern wirkt Wasser am häufigsten (die ersten Zettel täuschen), in Wahrheit
// führt Eistee knapp (12 gegen 11). Aha: Erst die Strichliste und die Häufigkeitstabelle zeigen den Spitzenreiter sicher.
// Handlungsprodukt analog: Plakat „Kiosk-Umfrage“ mit Strichliste, Häufigkeitstabelle und Empfehlung im Heft.
// Identität: Themenfarbe Ocker, Symbol fa-store, Titelbild Schulkiosk mit Zettelstapel, Leitobjekt der Zettelstapel bzw. die Strichliste.
// Punkte (Pflicht): Warm-up 2+2+2+2+3 = 11, Problem erkennen 3+3+3 = 9, Problem lösen 14+4+5 = 23, Übungen 4+6+7 = 17, gesamt 60.
// Profi 8, Bonus-Spiel höchstens 4 Runden · 2 = 8. Kein passendes Lernvideo zu Urliste und Häufigkeitstabelle bekannt: Beispiel ohne Video.

/* ── Daten ───────────────────────────────────────────────────────────────── */

type Kurz = 'W' | 'A' | 'E' | 'K';
const SORTEN: { k: Kurz; name: string }[] = [
  { k: 'W', name: 'Wasser' },
  { k: 'A', name: 'Apfelschorle' },
  { k: 'E', name: 'Eistee' },
  { k: 'K', name: 'Kakao' },
];

// Die ersten Zettel sind überwiegend Wasser (6 von 10): Das Bauchgefühl täuscht.
const URLISTE = 'WWEWAWKWEWAEKAEWAEEAEKAWEEKAEAKEWAKWEKAW'.split('') as Kurz[];
const N = URLISTE.length;
const H: Record<Kurz, number> = {
  W: URLISTE.filter((z) => z === 'W').length,
  A: URLISTE.filter((z) => z === 'A').length,
  E: URLISTE.filter((z) => z === 'E').length,
  K: URLISTE.filter((z) => z === 'K').length,
};
// W 11, A 10, E 12, K 7 (zusammen 40)

type Wahl = 'wasser' | 'apfel' | 'eistee' | 'kakao';
const WAHL: Record<Wahl, string> = {
  wasser: 'Wasser ist am häufigsten.',
  apfel: 'Apfelschorle ist am häufigsten.',
  eistee: 'Eistee ist am häufigsten.',
  kakao: 'Kakao ist am häufigsten.',
};

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: der Schulkiosk mit Markise, vier Getränken auf dem Tresen und dem Zettelstapel mit den Antworten */
function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Ein Schulkiosk mit gestreifter Markise. Auf dem Tresen stehen vier Getränke, rechts davon liegt ein hoher Zettelstapel mit der Aufschrift 40 Zettel."
    >
      <rect x="0" y="206" width="720" height="46" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="206" y2="206" stroke="var(--ink)" strokeWidth="2" />
      {/* Kiosk */}
      <rect x="60" y="64" width="420" height="142" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="84" y="108" width="372" height="98" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M${48 + i * 48} 26 L${96 + i * 48} 26 L${100 + i * 48} 70 Q${72 + i * 48} 84 ${44 + i * 48} 70 Z`}
          fill={i % 2 === 0 ? 'var(--primary)' : 'var(--surface)'}
          stroke="var(--ink)"
          strokeWidth="2"
        />
      ))}
      <rect x="60" y="176" width="420" height="30" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
      {/* Getränke auf dem Tresen */}
      <g stroke="var(--ink)" strokeWidth="2">
        <rect x="116" y="130" width="30" height="46" rx="6" fill="var(--primary-soft)" />
        <rect x="124" y="120" width="14" height="12" fill="var(--surface)" />
        <rect x="200" y="136" width="36" height="40" rx="4" fill="var(--highlight)" />
        <rect x="290" y="126" width="30" height="50" rx="6" fill="var(--surface)" />
        <rect x="298" y="116" width="14" height="12" fill="var(--primary)" />
        <rect x="380" y="140" width="34" height="36" rx="4" fill="var(--primary)" />
      </g>
      <text x="270" y="198" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">
        PAUSENKIOSK
      </text>
      {/* Zettelstapel */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={540 - (i % 2) * 4}
          y={190 - i * 9}
          width="120"
          height="9"
          rx="1.5"
          fill="var(--surface)"
          stroke="var(--ink)"
          strokeWidth="1.5"
        />
      ))}
      <rect x="548" y="124" width="104" height="14" rx="1.5" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="600" y="108" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--ink)">
        40 Zettel
      </text>
    </svg>
  );
}

const THEMA: Thema = {
  name: 'Der Pausenkiosk',
  farbe: 'ocker',
  icon: 'fa-store',
  bild: <Titelbild />,
};

/** Leitobjekt: der Zettelstapel mit den 40 Antworten */
function ZettelstapelBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Ein hoher Stapel Zettel mit der Frage: Welches Getränk kaufst du in der Pause am liebsten? Daneben die Zahl 40 und ein Fragezeichen."
      >
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            x={210 - (i % 3) * 5}
            y={150 - i * 14}
            width="170"
            height="14"
            rx="2"
            fill="var(--surface)"
            stroke="var(--ink)"
            strokeWidth="2"
          />
        ))}
        <rect x="218" y="32" width="150" height="16" rx="2" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="1.5" />
        <text x="293" y="26" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--ink)">
          Dein Lieblingsgetränk?
        </text>
        <text x="410" y="108" fontSize="40" fontWeight="800" fill="var(--primary)">
          40
        </text>
        <text x="410" y="136" fontSize="18" fill="var(--ink)">
          Antworten
        </text>
        <text x="540" y="116" fontSize="56" fontWeight="800" fill="var(--primary)">
          ?
        </text>
      </svg>
    </div>
  );
}

/** Die Urliste: 40 Zettel in der Reihenfolge, in der sie auf dem Stapel liegen */
function Urliste() {
  return (
    <div className="zk-bild ki-urliste">
      <div className="ki-chips" role="img" aria-label={`Urliste mit ${N} Zetteln in der Reihenfolge des Stapels.`}>
        {URLISTE.map((z, i) => (
          <span key={i} className="ki-chip" aria-hidden="true">
            <small>{i + 1}</small>
            {z}
          </span>
        ))}
      </div>
      <p className="ki-legende">
        <strong>W</strong> Wasser · <strong>A</strong> Apfelschorle · <strong>E</strong> Eistee · <strong>K</strong> Kakao
      </p>
    </div>
  );
}

/** Tafel des Kiosks: die Tabelle ist noch leer */
function TafelBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Eine Kreidetafel des Kiosks mit einer leeren Tabelle. Spalten: Getränk, Strichliste, Anzahl. Zeilen: Wasser, Apfelschorle, Eistee, Kakao. Die Zellen für Striche und Anzahl sind noch leer."
      >
        <rect x="110" y="6" width="500" height="178" rx="10" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="126" y="18" width="468" height="154" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        {['Getränk', 'Strichliste', 'Anzahl H'].map((t, i) => (
          <text key={t} x={[142, 300, 500][i]} y="46" fontSize="17" fontWeight="800" fill="var(--primary)">
            {t}
          </text>
        ))}
        <line x1="126" x2="594" y1="56" y2="56" stroke="var(--ink)" strokeWidth="2" />
        {SORTEN.map((s, i) => (
          <g key={s.k}>
            <text x="142" y={82 + i * 28} fontSize="17" fill="var(--ink)">
              {s.name}
            </text>
            <text x="300" y={82 + i * 28} fontSize="17" fill="var(--ink-muted)">
              …
            </text>
            <text x="520" y={82 + i * 28} fontSize="17" fontWeight="800" fill="var(--primary)">
              ?
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Handlungsprodukt: Plakat für die Pinnwand im Kiosk */
function PlakatBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Ein Plakat mit der Überschrift Kiosk-Umfrage. Darauf eine Strichliste, eine Häufigkeitstabelle mit vier Zeilen und ein Kasten für die Empfehlung."
      >
        <rect x="150" y="6" width="420" height="178" rx="10" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="170" y="16" width="380" height="160" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <text x="360" y="44" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
          Kiosk-Umfrage
        </text>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="190" y={56 + i * 22} width="70" height="18" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="1.5" />
            <rect x="260" y={56 + i * 22} width="110" height="18" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" />
            <rect x="370" y={56 + i * 22} width="30" height="18" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" />
          </g>
        ))}
        <rect x="416" y="56" width="120" height="84" rx="6" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
        <text x="476" y="86" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--ink)">
          Empfehlung:
        </text>
        <text x="476" y="108" textAnchor="middle" fontSize="16" fill="var(--ink)">
          …
        </text>
      </svg>
    </div>
  );
}

/* ── Rechenbeispiel: Eisverkauf beim Sommerfest ──────────────────────────── */

const EIS = 'SVSESVVSESVSVESVSEVS'.split('');
const EIS_NAMEN: Record<string, string> = { S: 'Schoko', V: 'Vanille', E: 'Erdbeere' };
const eisH = (k: string) => EIS.filter((z) => z === k).length;
const EIS_REIHENFOLGE = ['S', 'V', 'E'];

const BSP_AUFGABE = (
  <>
    <p>
      Beim Sommerfest der Parallelklasse wurden 20 Besucher gefragt: „Welche Eissorte magst du am liebsten?“ Die Antworten (S = Schoko, V =
      Vanille, E = Erdbeere):
    </p>
    <p style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 3, wordBreak: 'break-all' }}>{EIS.join(' ')}</p>
    <p>Lege eine Strichliste und eine Häufigkeitstabelle an. Welche Sorte ist am beliebtesten?</p>
  </>
);
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Merkmal, Ausprägungen und n bestimmen',
    body: (
      <p>
        Gefragt war die Lieblingseissorte. Es kommen drei Sorten vor: S, V und E. Es wurden {EIS.length} Antworten gesammelt, also{' '}
        <M>{`n = ${EIS.length}`}</M>.
      </p>
    ),
  },
  {
    title: 'Strichliste anlegen',
    body: (
      <>
        <p>
          Gehe die Urliste von links nach rechts durch und mache für jede Antwort einen Strich in die passende Zeile. Der fünfte Strich
          kommt quer durch die vier anderen. Streiche in der Urliste jede Antwort ab, die du schon erfasst hast.
        </p>
        <QuerTabelle
          rows={[
            { head: 'Sorte', cells: EIS_REIHENFOLGE.map((k) => EIS_NAMEN[k]) },
            { head: 'Strichliste', cells: EIS_REIHENFOLGE.map((k) => <span key={k}><Striche n={eisH(k)} /></span>) },
          ]}
        />
      </>
    ),
  },
  {
    title: 'Häufigkeitstabelle: die Striche zählen',
    body: (
      <>
        <QuerTabelle
          rows={[
            { head: 'Sorte', cells: EIS_REIHENFOLGE.map((k) => EIS_NAMEN[k]) },
            { head: <M>H</M>, cells: EIS_REIHENFOLGE.map((k) => String(eisH(k))) },
          ]}
        />
        <p>
          <M>H</M> ist die <strong>absolute Häufigkeit</strong>: Sie sagt, wie oft eine Sorte genannt wurde.
        </p>
      </>
    ),
  },
  {
    title: 'Kontrolle und Antwort',
    body: (
      <>
        <MB>{`${EIS_REIHENFOLGE.map((k) => eisH(k)).join(' + ')} = ${EIS.length} = n`}</MB>
        <p>
          Die Summe stimmt, es wurde keine Antwort vergessen. Die beliebteste Sorte ist <strong>Schoko</strong> mit {eisH('S')} Nennungen,
          danach Vanille ({eisH('V')}) und Erdbeere ({eisH('E')}).
        </p>
      </>
    ),
  },
];

/** Lösungsweg für den Pausenkiosk */
const LOESUNG = (
  <>
    <QuerTabelle
      rows={[
        { head: 'Getränk', cells: SORTEN.map((s) => s.name) },
        { head: 'Strichliste', cells: SORTEN.map((s) => <span key={s.k}><Striche n={H[s.k]} /></span>) },
        { head: <M>H</M>, cells: SORTEN.map((s) => String(H[s.k])) },
      ]}
    />
    <MB>{`${H.W} + ${H.A} + ${H.E} + ${H.K} = ${N} = n`}</MB>
    <p>
      Rangfolge: Platz 1 Eistee ({H.E}), Platz 2 Wasser ({H.W}), Platz 3 Apfelschorle ({H.A}), Platz 4 Kakao ({H.K}).
    </p>
  </>
);

/* ── Übungsdaten ─────────────────────────────────────────────────────────── */

const FEHLTAGE = [1, 0, 2, 1, 3, 0, 1, 2, 1, 0, 2, 1, 3, 1, 0, 2, 1, 0, 1, 2];
const fehlH = (t: number) => FEHLTAGE.filter((v) => v === t).length;

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function KioskEinstieg() {
  const navigate = useNavigate();
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 15, fest: false });
  const [gezaehlt, setGezaehlt] = useState<string[]>([]);
  const [geloest, setGeloest] = useState(false);
  const [uebungen, setUebungen] = useState<string[]>([]);
  const gez = (k: string) => () => setGezaehlt((g) => (g.includes(k) ? g : [...g, k]));

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            title="a) Strichliste lesen"
            punkte={2}
            rechnen={false}
            prompt={
              <>
              <p>
                Wie viele Striche sind es jeweils? Jeder fünfte Strich wird quer durch die vier anderen gezogen.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
                <Striche n={7} />
                <Striche n={12} />
              </div>
              </>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'a1', label: 'Links:', expected: 7 },
              { kind: 'num', key: 'a2', label: 'Rechts:', expected: 12 },
            ]}
            solution={<p>Ein Bündel mit Querstrich sind 5 Striche. Links: 5 + 2 = 7. Rechts: 5 + 5 + 2 = 12.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            title="b) Zahlen der Größe nach"
            punkte={2}
            rechnen={false}
            prompt={
              <>
                <p>Ordne diese Anzahlen der Größe nach. Wie heißen der kleinste und der größte Wert?</p>
                <Reihe values={[7, 3, 9, 3, 5, 8]} d={0} />
              </>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'min', label: 'Kleinster Wert:', expected: 3 },
              { kind: 'num', key: 'max', label: 'Größter Wert:', expected: 9 },
            ]}
            solution={<p>Geordnet: 3, 3, 5, 7, 8, 9. Der kleinste Wert ist 3, der größte ist 9.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            title="c) Wie oft kommt der Wert vor?"
            punkte={2}
            rechnen={false}
            prompt={
              <>
                <p>Wie oft kommt die Zahl 4 in dieser Liste vor?</p>
                <Reihe values={[2, 4, 4, 1, 3, 4, 2, 4, 5]} d={0} />
              </>
            }
            fields={[{ kind: 'num', key: 'c', label: 'Die 4 kommt vor:', expected: 4, unit: 'mal' }]}
            solution={<p>Die 4 steht an Platz 2, 3, 6 und 8. Das sind 4 Treffer.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            title="d) Gesamtzahl bestimmen"
            punkte={2}
            prompt={
              <p>
                Bei einer Umfrage zur Lieblingspizza haben 9 Personen Salami, 6 Personen Margherita und 4 Personen Funghi gewählt. Wie viele
                Personen wurden befragt?
              </p>
            }
            fields={[{ kind: 'num', key: 'd', label: <M>n =</M>, expected: 19 }]}
            solution={<MB>{'9 + 6 + 4 = 19'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            title="e) Fehlende Anzahl ergänzen"
            punkte={3}
            prompt={
              <p>
                Eine Klasse mit 25 Schülerinnen und Schülern wurde nach dem Lieblingsfach gefragt: Sport 9, Mathe 6, Englisch 7, Kunst ?
                Wie viele haben Kunst gewählt?
              </p>
            }
            fields={[{ kind: 'num', key: 'e', label: 'Kunst:', expected: 3 }]}
            solution={<MB>{'25 - (9 + 6 + 7) = 25 - 22 = 3'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Alle Anzahlen zusammen ergeben die Gesamtzahl der Befragten.</>,
                  <>Zähle zuerst die bekannten Anzahlen zusammen.</>,
                  <>
                    <M>{'9 + 6 + 7 = 22'}</M>. Wie viele fehlen bis 25?
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
      titel: 'Welches Getränk soll der Kiosk mehr bestellen?',
      pflicht: ['fest', 'z1', 'z2'],
      bedingung: 'Lege dich fest und zähle dann zwei Getränke in der Urliste nach, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du machst ein Praktikum im Pausenkiosk deiner Schule. Frau Brandl, die Kioskleiterin, hat in der letzten Woche 40 Schülerinnen und
            Schüler gefragt: „Welches Getränk kaufst du in der Pause am liebsten?“ Jede Antwort steht auf einem Zettel. Nun liegt der
            Zettelstapel vor dir.
          </p>
          <p className="sl-text">
            Im Kühlschrank ist nur Platz für <strong>eine</strong> zusätzliche Getränkekiste. Gesucht ist das Getränk, das am häufigsten
            genannt wurde.
          </p>
          <Zitat wer="Frau Brandl, Kioskleiterin">
            <p>
              „Ich habe die Zettel schon einmal durchgeblättert. Gefühlt stand bei jedem zweiten Zettel Wasser drauf. Ich bestelle eine Kiste
              Wasser mehr.“
            </p>
          </Zitat>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst festlegen, dann nachzählen</p>
            <p>
              Welches Getränk wurde am häufigsten genannt? Lege dich zuerst fest, indem du dir die Urliste ansiehst. Zähle danach selbst
              nach, wie oft Wasser und Eistee vorkommen.
            </p>
          </div>
          <ZettelstapelBild />
          <Urliste />
          <Vermutung
            optionen={WAHL}
            regler={{
              min: 5,
              max: 30,
              step: 1,
              text: (v) => (
                <>
                  Das häufigste Getränk steht auf etwa <span className="ls-slider-value">{v}</span> von 40 Zetteln.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig.teil('fest')}
            gespeichert={(w) => (
              <>
                Deine Festlegung: <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong> Etwa <strong>{w.wert}</strong> von 40 Zetteln.
              </>
            )}
          />
          {fest.fest && (
            <Abschnitt titel="Zähle zwei Getränke nach">
              <p className="sl-text">
                Fahre mit dem Finger oder dem Stift an der Urliste entlang und zähle. Die Zahl unter jedem Kästchen ist die Nummer des Zettels.
              </p>
              <CheckCard
                onSolved={() => {
                  fertig.teil('z1')();
                  gez('z1')();
                }}
                title="Wie oft kommt Wasser vor?"
                punkte={3}
                rechnen={false}
                prompt={
                  <p>
                    Wie oft steht <strong>W</strong> (Wasser) in der Urliste?
                  </p>
                }
                fields={[{ kind: 'num', key: 'w', label: 'Wasser:', expected: H.W, unit: 'mal' }]}
                solution={<p>Wasser steht {H.W}-mal in der Urliste. Wer genau gezählt hat, kommt auf {H.W}.</p>}
                help={
                  <Hilfen
                    steps={[
                      <>Gehe die Urliste Zettel für Zettel von links nach rechts durch.</>,
                      <>Zähle in jeder Zeile der Urliste getrennt und addiere die Zeilen am Ende.</>,
                      <>
                        Jede Zeile hat 10 Zettel. Notiere für jede Zeile, wie oft ein W vorkommt, und zähle die vier Zeilen zusammen.
                      </>,
                    ]}
                  />
                }
              />
              <CheckCard
                onSolved={() => {
                  fertig.teil('z2')();
                  gez('z2')();
                }}
                title="Wie oft kommt Eistee vor?"
                punkte={3}
                rechnen={false}
                prompt={
                  <p>
                    Wie oft steht <strong>E</strong> (Eistee) in der Urliste?
                  </p>
                }
                fields={[{ kind: 'num', key: 'e', label: 'Eistee:', expected: H.E, unit: 'mal' }]}
                solution={<p>Eistee steht {H.E}-mal in der Urliste.</p>}
                help={
                  <Hilfen
                    steps={[
                      <>Gehe die Urliste Zettel für Zettel von links nach rechts durch.</>,
                      <>Zähle in jeder Zeile der Urliste getrennt und addiere die Zeilen am Ende.</>,
                      <>Notiere für jede der vier Zeilen, wie oft ein E vorkommt, und zähle zusammen.</>,
                    ]}
                  />
                }
              />
              {gezaehlt.length === 2 && (
                <p className="ki-erkenntnis ls-back">
                  <strong>Schon gemerkt?</strong> Zwei Getränke liegen fast gleichauf, und beim Zählen mit den Augen verzählt man sich
                  schnell. Die ersten Zettel zeigen außerdem ein ganz anderes Bild als der ganze Stapel. Und für Apfelschorle und Kakao hast du
                  noch gar nicht gezählt. Gleich lernst du, wie du Ordnung in die Urliste bringst: mit einer Strichliste und
                  einer Häufigkeitstabelle.
                </p>
              )}
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Umfrage des Pausenkiosks auswerten',
      pflicht: ['tabelle', 'empfehlung', 'produkt'],
      inhalt: (fertig) => {
        const geloestMelden = () => {
          fertig.teil('tabelle')();
          setGeloest(true);
        };
        return (
          <>
            <div className="sl-fokus">
              <p className="sl-fokus-titel">Deine Aufgabe: Ordne die Urliste und berate Frau Brandl</p>
              <p>
                Die Urliste unten enthält die 40 Antworten der Umfrage. Erstelle in deinem Heft eine <strong>Strichliste</strong> und eine{' '}
                <strong>Häufigkeitstabelle</strong> mit der absoluten Häufigkeit <M>H</M> jedes Getränks. Kontrolliere, dass die Anzahlen
                zusammen <M>{'n = 40'}</M> ergeben, und lege die Rangfolge der Getränke fest.
              </p>
            </div>
            <Urliste />
            <TafelBild />
            <BeispielMitVideo>
              <Beispiel offen title="Die Lieblingseissorte beim Sommerfest" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
            </BeispielMitVideo>
            <Abschnitt titel="Vergleiche deine Ergebnisse">
              <CheckCard
                onSolved={geloestMelden}
                title="Häufigkeiten der Getränke"
                punkte={14}
                prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
                fields={[
                  { kind: 'num', key: 'w', label: 'Wie oft wurde Wasser genannt?', expected: H.W },
                  { kind: 'num', key: 'a', label: 'Wie oft wurde Apfelschorle genannt?', expected: H.A },
                  { kind: 'num', key: 'e', label: 'Wie oft wurde Eistee genannt?', expected: H.E },
                  { kind: 'num', key: 'k', label: 'Wie oft wurde Kakao genannt?', expected: H.K },
                  {
                    kind: 'select',
                    key: 'platz',
                    label: 'Auf welchem Platz der Rangfolge steht Apfelschorle?',
                    options: ['Bitte wählen', 'Platz 1', 'Platz 2', 'Platz 3', 'Platz 4'],
                    expected: 3,
                  },
                ]}
                loesungNachFehler
                solution={LOESUNG}
                help={
                  <Hilfen
                    steps={[
                      <>Arbeite wie im Beispiel mit dem Eis: Gehe die Urliste Zettel für Zettel durch und mache für jede Antwort einen Strich.</>,
                      <>
                        Bündle die Striche in Fünfergruppen, das ist schneller zu zählen. Streiche in der Urliste jeden erfassten Zettel ab, damit
                        keiner doppelt oder gar nicht gezählt wird.
                      </>,
                      <>
                        Kontrolle: Die vier Anzahlen ergeben zusammen genau <M>{'n = 40'}</M>. Stimmt die Summe nicht, hast du einen Zettel
                        verzählt. Die Rangfolge richtet sich nach der Größe von <M>H</M>.
                      </>,
                    ]}
                  />
                }
              />
            </Abschnitt>
            <Abschnitt titel="Deine Empfehlung">
              <McCard
                onSolved={fertig.teil('empfehlung')}
                title="Empfehlung an Frau Brandl"
                punkte={4}
                prompt={<p>Welches Getränk empfiehlst du Frau Brandl für die zusätzliche Kiste?</p>}
                options={[
                  {
                    text: 'Wasser, denn beim Durchblättern stand es am häufigsten auf den Zetteln.',
                    feedback: `Die ersten Zettel täuschen. Zählt man alle 40, hat Wasser ${H.W} Nennungen, Eistee ${H.E}. Das Bauchgefühl reicht nicht, die Strichliste zeigt es genau.`,
                  },
                  {
                    text: 'Kakao, denn er wurde am seltensten genannt und muss deshalb stärker beworben werden.',
                    feedback: `Gefragt war, welches Getränk am häufigsten genannt wird, nicht am seltensten. Kakao steht mit ${H.K} Nennungen auf dem letzten Platz.`,
                  },
                  {
                    text: `Eistee: Er hat mit ${H.E} von 40 Nennungen die meisten, liegt aber nur knapp vor Wasser (${H.W}).`,
                    correct: true,
                    feedback: 'Genau: Die Häufigkeitstabelle zeigt den Spitzenreiter. Weil der Abstand nur 1 beträgt, solltest du Frau Brandl sagen, dass es knapp ist.',
                  },
                  {
                    text: 'Alle vier Getränke gleich, denn es sind ja überall ungefähr 10 Nennungen.',
                    feedback: `Die Anzahlen sind verschieden: ${H.E}, ${H.W}, ${H.A} und ${H.K}. Kakao liegt deutlich hinten.`,
                  },
                ]}
              />
            </Abschnitt>
            <Handlungsprodukt titel="Plakat „Kiosk-Umfrage“">
              <PlakatBild />
              <p className="sl-text">
                Gestalte in deinem Heft ein Plakat für die Pinnwand im Kiosk. Zeige, wie du die 40 Zettel geordnet hast: mit Strichliste und
                Häufigkeitstabelle. Schreibe darunter deine Empfehlung an Frau Brandl.
              </p>
              <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
                <ul className="zk-liste">
                  <li>„Wir haben … Schülerinnen und Schüler befragt. Das Merkmal war …“</li>
                  <li>„Am häufigsten wurde … genannt, nämlich …-mal. Am seltensten …“</li>
                  <li>„Die Summe aller Anzahlen ist …, das passt zu n = …“</li>
                  <li>„Unsere Empfehlung: … Der Abstand zum zweiten Platz beträgt nur …“</li>
                  <li>
                    „Wörter erklärt: Urliste = …, Strichliste = …, Häufigkeitstabelle = …, absolute Häufigkeit <M>H</M> = …, <M>n</M> = …“
                  </li>
                </ul>
              </Aufklappbar>
            </Handlungsprodukt>
            <Abschnitt titel="Ist dein Plakat vollständig?">
              <Kriterien
                onAlle={fertig.teil('produkt')}
                items={[
                  'Eine Strichliste mit Fünferbündeln, in der alle 40 Zettel erfasst sind',
                  <>
                    Eine Häufigkeitstabelle mit allen vier Getränken und ihrer Anzahl <M>H</M>, dazu die Kontrolle, dass die Summe 40 ergibt
                  </>,
                  'Eine klare Empfehlung an Frau Brandl mit Begründung und dem Hinweis, wie knapp es ist',
                  <>
                    Unter deinem Plakat steht, was die Wörter Urliste, Strichliste, Häufigkeitstabelle und Rangfolge bedeuten und wofür die
                    Abkürzungen <M>n</M> (Anzahl aller Daten) und <M>H</M> (absolute Häufigkeit) stehen. Außerdem erklärst du alle anderen
                    Wörter, die für dich neu waren.
                  </>,
                ]}
              />
            </Abschnitt>
            {geloest && (
              <Abschnitt titel="Das hältst du fest">
                <Rueckbezug fest={fest} />
                <Merke title="Daten ordnen: Urliste, Strichliste, Häufigkeitstabelle">
                  <ul>
                    <li>
                      Die <strong>Urliste</strong> enthält die Daten so, wie sie erhoben wurden, ungeordnet. <M>n</M> ist die Anzahl aller Daten.
                    </li>
                    <li>
                      In der <strong>Strichliste</strong> bekommt jeder Wert für jede Nennung einen Strich. Der fünfte Strich wird quer durch
                      die vier anderen gezogen.
                    </li>
                    <li>
                      Die <strong>absolute Häufigkeit</strong> <M>H</M> ist die Anzahl der Striche. Sie steht in der{' '}
                      <strong>Häufigkeitstabelle</strong>.
                    </li>
                    <li>
                      Kontrolle: Alle Häufigkeiten zusammen ergeben wieder <M>n</M>. Bei Zahlenwerten ordnet die{' '}
                      <strong>Rangliste</strong> die Daten der Größe nach.
                    </li>
                  </ul>
                </Merke>
              </Abschnitt>
            )}
          </>
        );
      },
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die letzte ist für Profis. Hast du Übung 1 bis 3 gelöst, wird unten ein Spiel
            freigeschaltet.
          </p>
          <Abschnitt titel="Übung 1: Stimmt die Tabelle?">
            <TrackedMc
              onSolved={() => {
                fertig.teil('1')();
                setUebungen((u) => (u.includes('1') ? u : [...u, '1']));
              }}
              topic="Daten ordnen-Einstieg: Kontrolle der Summe (Basis)"
              title="Übung 1"
              level="basis"
              punkte={4}
              prompt={
                <>
                  <p>Lara hat die 40 Zettel des Kiosks ausgewertet und diese Tabelle erstellt:</p>
                  <QuerTabelle
                    rows={[
                      { head: 'Getränk', cells: ['Wasser', 'Apfelschorle', 'Eistee', 'Kakao'] },
                      { head: <M>H</M>, cells: ['11', '10', '12', '6'] },
                    ]}
                  />
                  <p>Was fällt dir auf?</p>
                </>
              }
              options={[
                {
                  text: 'Alles stimmt: Eistee hat die meisten Nennungen, mehr muss man nicht prüfen.',
                  feedback: 'Eine Kontrolle fehlt: Die Anzahlen müssen zusammen genau n ergeben.',
                },
                {
                  text: 'Die Summe ist 39, es fehlt ein Zettel. Lara hat sich verzählt oder einen Zettel vergessen.',
                  correct: true,
                  feedback: <M>{'11 + 10 + 12 + 6 = 39 \\neq 40'}</M>,
                },
                {
                  text: 'Kakao muss 7 haben, weil jedes Getränk mindestens 7-mal genannt wird.',
                  feedback: 'Es gibt keine solche Regel. Die Summe zeigt nur, dass irgendwo ein Zettel fehlt, nicht wo.',
                },
                {
                  text: 'Die Tabelle ist falsch, weil die Häufigkeiten der Größe nach stehen müssen.',
                  feedback: 'In einer Häufigkeitstabelle darf die Reihenfolge der Getränke frei gewählt werden.',
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={() => {
                fertig.teil('2')();
                setUebungen((u) => (u.includes('2') ? u : [...u, '2']));
              }}
              topic="Daten ordnen-Einstieg: Rangliste (Standard)"
              title="Übung 2"
              level="standard"
              punkte={6}
              prompt={
                <>
                  <p>Die Schuhgrößen von 10 Personen (Urliste):</p>
                  <Reihe values={[41, 39, 40, 42, 39, 41, 40, 39, 43, 40]} d={0} />
                  <p>
                    Mia schreibt als Rangliste: 39, 39, 39, 40, 40, 40, 41, 41, 42, 43. Ben schreibt als Rangliste: 39, 40, 41, 42, 43. Wer
                    hat recht?
                  </p>
                </>
              }
              options={[
                {
                  text: 'Ben, denn in einer Rangliste steht jeder Wert nur einmal.',
                  feedback: 'Dann würden Daten fehlen: Bens Liste hat nur 5 Werte, aber es wurden n = 10 Personen gefragt.',
                },
                {
                  text: 'Beide, denn es ist egal, ob gleiche Werte mehrfach vorkommen.',
                  feedback: 'Es ist nicht egal. Die Rangliste enthält alle n Daten, nur der Größe nach geordnet.',
                },
                {
                  text: 'Keiner, denn eine Rangliste zeigt, wie oft jeder Wert vorkommt.',
                  feedback: 'Das ist die Aufgabe der Häufigkeitstabelle. Die Rangliste ordnet alle Daten der Größe nach.',
                },
                {
                  text: 'Mia, denn in der Rangliste stehen alle 10 Daten der Größe nach, gleiche Werte auch mehrfach.',
                  correct: true,
                  feedback: 'Ben hat die Häufigkeitstabelle ohne Anzahlen aufgeschrieben. Mias Rangliste hat alle 10 Werte.',
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Fehltage in der Klasse">
            <TrackedCheck
              onSolved={() => {
                fertig.teil('3')();
                setUebungen((u) => (u.includes('3') ? u : [...u, '3']));
              }}
              topic="Daten ordnen-Einstieg: Häufigkeitstabelle (Standard)"
              title="Übung 3"
              level="standard"
              punkte={7}
              prompt={
                <>
                  <p>Eine Klassenlehrerin notiert, wie viele Tage 20 Schülerinnen und Schüler im letzten Monat gefehlt haben (Urliste):</p>
                  <Reihe values={FEHLTAGE} d={0} />
                  <p>Erstelle die Häufigkeitstabelle und beantworte die Frage darunter.</p>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'h0', label: <M>{'H(0) ='}</M>, expected: fehlH(0) },
                { kind: 'num', key: 'h1', label: <M>{'H(1) ='}</M>, expected: fehlH(1) },
                { kind: 'num', key: 'h2', label: <M>{'H(2) ='}</M>, expected: fehlH(2) },
                { kind: 'num', key: 'h3', label: <M>{'H(3) ='}</M>, expected: fehlH(3) },
                { kind: 'num', key: 'mind', label: 'Wie viele fehlten mindestens 2 Tage?', expected: fehlH(2) + fehlH(3) },
              ]}
              loesungNachFehler
              solution={
                <>
                  <QuerTabelle
                    rows={[
                      { head: 'Fehltage', cells: ['0', '1', '2', '3'] },
                      { head: 'Strichliste', cells: [0, 1, 2, 3].map((t) => <span key={t}><Striche n={fehlH(t)} /></span>) },
                      { head: <M>H</M>, cells: [0, 1, 2, 3].map((t) => String(fehlH(t))) },
                    ]}
                  />
                  <MB>{`${fehlH(0)} + ${fehlH(1)} + ${fehlH(2)} + ${fehlH(3)} = 20 = n`}</MB>
                  <p>
                    Mindestens 2 Tage fehlten {fehlH(2)} + {fehlH(3)} = {fehlH(2) + fehlH(3)} Personen.
                  </p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Mache für jeden Wert der Urliste einen Strich in die passende Spalte der Strichliste.</>,
                    <>Zähle die Striche jeder Spalte. Die vier Anzahlen müssen zusammen 20 ergeben.</>,
                    <>
                      „Mindestens 2 Tage“ bedeutet: 2 Tage <em>oder</em> 3 Tage. Addiere also die Anzahlen der beiden Spalten.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Die neue Umfrage">
            <CheckCard
              title="Fehlende Häufigkeiten bestimmen"
              level="erweiterung"
              profi
              punkte={8}
              prompt={
                <p>
                  Bei einer neuen Umfrage des Kiosks wurden 45 Personen befragt. Eistee wurde 12-mal genannt, Apfelschorle 9-mal. Wasser wurde
                  doppelt so oft genannt wie Kakao. Wie oft wurden Kakao und Wasser genannt?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'k', label: 'Kakao:', expected: 8 },
                { kind: 'num', key: 'w', label: 'Wasser:', expected: 16 },
              ]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'45 - 12 - 9 = 24'}</MB>
                  <p>
                    Auf Wasser und Kakao zusammen entfallen 24 Nennungen. Wasser ist doppelt so groß wie Kakao, also drei gleiche Teile:{' '}
                    <M>{'24 : 3 = 8'}</M>.
                  </p>
                  <p>Kakao: 8, Wasser: 16. Kontrolle: 12 + 9 + 16 + 8 = 45 ✓</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Alle Anzahlen zusammen ergeben die Gesamtzahl der Befragten.</>,
                    <>Berechne zuerst, wie viele Nennungen auf Wasser und Kakao zusammen entfallen.</>,
                    <>
                      Kakao ist ein Teil, Wasser sind zwei Teile. Zusammen sind es drei Teile. Wie viele Nennungen hat ein Teil?
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 3} titel="Zettel-Zähler">
            <ZettelSpiel />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt eine Urliste mit Strichliste und Häufigkeitstabelle ordnen, die Anzahlen kontrollieren und eine Rangfolge
              bilden. In den Übungsaufgaben ordnest du auch Zahlenwerte in einer Rangliste.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={() => navigate('/daten-und-zufall/daten-ordnen')}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={() => navigate('/daten-und-zufall/daten-ordnen/ueben')}>
                Weiter üben: Daten ordnen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Daten ordnen: Der Pausenkiosk"
      width="wide"
      kompakt
      parent={{ to: '/daten-und-zufall/daten-ordnen', label: 'Daten ordnen' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={
          <>
            In dieser Lernsituation wertest du als Praktikant im Pausenkiosk eine Umfrage aus. Du lernst, wie du aus einer ungeordneten
            Urliste mit Strichliste und Häufigkeitstabelle sicher erkennst, was am häufigsten vorkommt.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Festlegung aus Phase 2 */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  if (!fest.fest || !fest.wahl) return null;
  const richtig = fest.wahl === 'eistee';
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest dich festgelegt:</strong> {WAHL[fest.wahl]} Etwa {fest.wert} von 40 Zetteln.{' '}
        {richtig ? (
          <>Das stimmt: Eistee steht {H.E}-mal auf den Zetteln.</>
        ) : (
          <>
            Tatsächlich ist es Eistee mit {H.E} Nennungen. Dein Tipp ({WAHL[fest.wahl].replace(' ist am häufigsten.', '')}) hat {H[(fest.wahl === 'wasser' ? 'W' : fest.wahl === 'apfel' ? 'A' : 'K') as Kurz]}.
          </>
        )}{' '}
        {Math.abs(fest.wert - H.E) <= 2 ? 'Deine Schätzung der Zahl war sehr nah dran.' : `Die häufigste Antwort steht auf ${H.E} Zetteln, du hattest ${fest.wert} geschätzt.`}{' '}
        Erst die Strichliste zeigt, dass Eistee ({H.E}) nur knapp vor Wasser ({H.W}) liegt. Das Durchblättern der ersten Zettel hätte dich
        getäuscht.
      </p>
    </div>
  );
}
