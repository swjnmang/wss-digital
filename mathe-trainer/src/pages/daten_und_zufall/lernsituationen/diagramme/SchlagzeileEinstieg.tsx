import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskShell from '../../../../components/layout/TaskShell';
import { Beispiel, M, MB, Merke } from '../../lernpfad/kit';
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
import { metaFor } from '../meta';
import LuegenCheck from './LuegenCheck';
import { KreisBild, LeserbriefBild, MiniSaeulen, Titelbild, UmfrageBild, Zeitung } from './schlagzeile_bilder';
import './schlagzeile.css';

// Lernsituation 5.3 „Die Schlagzeile“: Diagramme lesen, erstellen und hinterfragen (ca. 45 min).
// Format Fehlerdetektiv: Der „Stadtbote“ druckt ein Säulendiagramm mit abgeschnittener Achse und der Schlagzeile „Kosten explodieren“.
// Die SuS legen sich auf den wahren Anstieg fest, decken die Achse auf und merken: gleiche Daten, andere Wirkung. In „Problem lösen“
// zeichnen sie für die Redaktion ein ehrliches Kreisdiagramm (Winkel = h · 360°). Lernprodukt analog: Richtigstellung an den Stadtboten
// mit eigenen Skizzen im Heft. Identität: Violett, fa-newspaper, Leitobjekt die Zeitungsseite mit der Lupe.
// Instruktionsreihenfolge: Aufgabe → Rechenbeispiel (Lieblingsgetränk, andere Zahlen) → eigene Rechnung. Ein Lernvideo zu Diagrammen
// gibt es in den Übungsaufgaben des Themas nicht (offener Punkt).
//
// Punkte (Pflicht): Warm-up 5 × 2 = 10 (19 %) · Problem erkennen 3 + 3 = 6 · Problem lösen 14 + 3 + 5 = 22 (41 %) ·
// Übungen 4 + 5 + 6 = 15 · Profi 9 (zählt nicht zu den Sternen) · Bonus-Spiel 4 Runden × 2 = 8. Pflicht insgesamt 53.

const THEMA: Thema = { ...metaFor('diagramme').thema, bild: <Titelbild /> };

/* ── Situation ───────────────────────────────────────────────────────────── */

// Stromkosten einer Familie pro Monat: 100 €, 102 €, 105 €, 108 €. Anstieg 2021 → 2024: 8 %.
const ANSTIEG = 8;

type Wahl = 'explodiert' | 'halb' | 'wenig';
const WAHL: Record<Wahl, string> = {
  explodiert: 'Die Kosten haben sich mehr als verdoppelt, sie sind regelrecht explodiert.',
  halb: 'Die Kosten sind deutlich gestiegen, etwa um die Hälfte.',
  wenig: 'Die Kosten sind nur wenig gestiegen, deutlich weniger als ein Viertel.',
};

// Umfrage „Wie kommst du zur Schule?“: 120 Jugendliche. Winkel 162°, 90°, 72°, 36°.
const UMFRAGE = { labels: ['Bus', 'Fahrrad', 'zu Fuß', 'Elterntaxi'], H: [54, 30, 24, 12], n: 120 };
const WINKEL = UMFRAGE.H.map((h) => (h / UMFRAGE.n) * 360);

/* ── Rechenbeispiel: Lieblingsgetränk ───────────────────────────────────── */

const BSP_AUFGABE = (
  <p>
    Der Schülersprecher fragt 80 Jugendliche nach ihrem Lieblingsgetränk: <strong>Wasser 40</strong>, <strong>Saft 20</strong>,{' '}
    <strong>Cola 16</strong>, <strong>Tee 4</strong>. Für die Schülerzeitung soll ein Kreisdiagramm entstehen. Berechne die Winkel der
    Sektoren.
  </p>
);
const BSP_SCHRITTE = [
  {
    title: 'Gesamtzahl bestimmen',
    body: <MB>{'n = 40 + 20 + 16 + 4 = 80'}</MB>,
  },
  {
    title: 'Relative Häufigkeit jedes Getränks',
    body: (
      <>
        <p>Teile die absolute Häufigkeit <M>H</M> durch die Gesamtzahl <M>n</M>:</p>
        <MB>{'h = \\frac{H}{n}: \\quad \\frac{40}{80} = 0{,}5 \\quad \\frac{20}{80} = 0{,}25 \\quad \\frac{16}{80} = 0{,}2 \\quad \\frac{4}{80} = 0{,}05'}</MB>
      </>
    ),
  },
  {
    title: 'Winkel berechnen',
    body: (
      <>
        <p>Der ganze Kreis hat <M>{'360^\\circ'}</M>. Jeder Sektor bekommt den Anteil <M>h</M> davon:</p>
        <MB>{'\\alpha = h \\cdot 360^\\circ'}</MB>
        <MB>{'\\text{Wasser: } 0{,}5 \\cdot 360^\\circ = 180^\\circ \\quad \\text{Saft: } 0{,}25 \\cdot 360^\\circ = 90^\\circ'}</MB>
        <MB>{'\\text{Cola: } 0{,}2 \\cdot 360^\\circ = 72^\\circ \\quad \\text{Tee: } 0{,}05 \\cdot 360^\\circ = 18^\\circ'}</MB>
      </>
    ),
  },
  {
    title: 'Kontrolle und Zeichnen',
    body: (
      <>
        <p><M>{'180^\\circ + 90^\\circ + 72^\\circ + 18^\\circ = 360^\\circ'}</M> ✓ Mit dem Geodreieck zeichnest du die Sektoren nacheinander ein.</p>
        <KreisBild labels={['Wasser', 'Saft', 'Cola', 'Tee']} werte={[40, 20, 16, 4]} winkel titel="Kreisdiagramm: Wasser 180 Grad, Saft 90 Grad, Cola 72 Grad, Tee 18 Grad." />
      </>
    ),
  },
];

const LOESUNG = (
  <>
    <MB>{'n = 54 + 30 + 24 + 12 = 120'}</MB>
    <MB>{'\\text{Bus: } \\tfrac{54}{120} \\cdot 360^\\circ = 162^\\circ \\qquad \\text{Fahrrad: } \\tfrac{30}{120} \\cdot 360^\\circ = 90^\\circ'}</MB>
    <MB>{'\\text{zu Fuß: } \\tfrac{24}{120} \\cdot 360^\\circ = 72^\\circ \\qquad \\text{Elterntaxi: } \\tfrac{12}{120} \\cdot 360^\\circ = 36^\\circ'}</MB>
    <p>Kontrolle: <M>{'162^\\circ + 90^\\circ + 72^\\circ + 36^\\circ = 360^\\circ'}</M>.</p>
  </>
);

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function SchlagzeileEinstieg() {
  const navigate = useNavigate();
  const [fest, setFest] = useState<Festlegung<Wahl>>({ wahl: null, wert: 100, fest: false });
  const [ehrlich, setEhrlich] = useState(false);
  const [geloest, setGeloest] = useState(false);
  const [uebungen, setUebungen] = useState<string[]>([]);
  const uebungFertig = (key: string, fertig: (k: string) => () => void) => () => {
    fertig(key)();
    setUebungen((u) => (u.includes(key) ? u : [...u, key]));
  };

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
            title="a) Relative Häufigkeit"
            punkte={2}
            prompt={<p>Von 60 Befragten fahren 18 mit dem Fahrrad zur Schule. Wie groß ist die relative Häufigkeit <M>h</M>?</p>}
            fields={[{ kind: 'num', key: 'h', label: <M>{'h ='}</M>, expected: 0.3, tol: 0.001 }]}
            solution={<MB>{'h = \\frac{H}{n} = \\frac{18}{60} = 0{,}3 = 30\\,\\%'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            title="b) Anteil vom Kreis"
            punkte={2}
            prompt={<p>Ein Kreis hat <M>{'360^\\circ'}</M>. Wie viel Grad sind ein Viertel und ein Zehntel des Kreises?</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'v', label: 'Ein Viertel:', expected: 90, unit: '°', tol: 0.01 },
              { kind: 'num', key: 'z', label: 'Ein Zehntel:', expected: 36, unit: '°', tol: 0.01 },
            ]}
            solution={<MB>{'\\tfrac{1}{4} \\cdot 360^\\circ = 90^\\circ \\qquad \\tfrac{1}{10} \\cdot 360^\\circ = 36^\\circ'}</MB>}
          />
          <div>
            <MiniSaeulen
              labels={['Mo', 'Di', 'Mi', 'Do']}
              werte={[12, 18, 9, 15]}
              yMax={20}
              schritt={5}
              beschriftung={false}
              titel="Säulendiagramm der verkauften Pausenbrote von Montag bis Donnerstag. Montag 12, Dienstag 18, Mittwoch 9, Donnerstag 15. Die Achse beginnt bei 0."
            />
          </div>
          <CheckCard
            onSolved={fertig.teil('c')}
            title="c) Säulendiagramm ablesen"
            punkte={2}
            rechnen={false}
            prompt={<p>Wie viele Pausenbrote wurden am Dienstag und am Mittwoch verkauft?</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'di', label: 'Dienstag:', expected: 18, tol: 0.01 },
              { kind: 'num', key: 'mi', label: 'Mittwoch:', expected: 9, tol: 0.01 },
            ]}
            solution={<p>Die Säule für Dienstag reicht bis 18, die für Mittwoch bis 9. Die Achse beginnt bei 0, also kannst du direkt ablesen.</p>}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            title="d) Winkelsumme"
            punkte={2}
            prompt={<p>Ein Kreisdiagramm hat drei Sektoren mit <M>{'150^\\circ'}</M>, <M>{'110^\\circ'}</M> und <M>{'60^\\circ'}</M>. Wie groß ist der vierte Sektor?</p>}
            fields={[{ kind: 'num', key: 'w', label: 'Vierter Sektor:', expected: 40, unit: '°', tol: 0.01 }]}
            solution={<MB>{'360^\\circ - 150^\\circ - 110^\\circ - 60^\\circ = 40^\\circ'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            title="e) Winkel in Prozent"
            punkte={2}
            prompt={<p>Ein Sektor hat <M>{'72^\\circ'}</M>. Wie viel Prozent des Kreises sind das?</p>}
            fields={[{ kind: 'num', key: 'p', label: 'Anteil:', expected: 20, unit: '%', tol: 0.01 }]}
            solution={<MB>{'\\frac{72^\\circ}{360^\\circ} = 0{,}2 = 20\\,\\%'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Wie viele Grad entsprechen 100 % des Kreises?</>,
                  <>Teile den Sektor durch den ganzen Kreis.</>,
                  <>
                    <M>{'72 : 360 = 0{,}2'}</M>. Wandle in Prozent um.
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
      titel: 'Explodieren die Stromkosten?',
      pflicht: ['fest', 'achse', 'abl'],
      bedingung: 'Lege dich fest, decke die Achse auf und berechne den echten Anstieg, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du machst ein Praktikum in der Redaktion des „Stadtboten“. Heute liegt die Titelseite zur Kontrolle auf deinem Tisch. Mit der
            Lupe prüfst du, ob alles stimmt.
          </p>
          <p className="sl-text">
            Das Diagramm zeigt die monatlichen Stromkosten einer Familie von 2021 bis 2024. Gesucht ist, um wie viel Prozent die Kosten von
            2021 bis 2024 wirklich gestiegen sind.
          </p>
          <Zitat wer="Die Chefredakteurin">
            <p>„Seht euch die Säulen an: 2024 ist ein Vielfaches von 2021. Das ist unsere Schlagzeile!“</p>
          </Zitat>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst schätzen, dann die Lupe benutzen</p>
            <p>
              Lege dich zuerst fest, ohne zu rechnen: Wie stark sind die Kosten von 2021 bis 2024 gestiegen? Danach deckst du die Achse auf
              und prüfst, ob die Schlagzeile stimmt.
            </p>
          </div>
          <Zeitung ehrlich={ehrlich} />
          <Vermutung
            optionen={WAHL}
            regler={{
              min: 0,
              max: 300,
              step: 5,
              text: (v) => (
                <>
                  Von 2021 bis 2024 sind die Kosten um etwa <span className="ls-slider-value">{v} %</span> gestiegen.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig.teil('fest')}
            gespeichert={(w) => (
              <>
                Deine Schätzung: etwa <strong>{w.wert} %</strong>. <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong>
              </>
            )}
          />
          {fest.fest && (
            <Abschnitt titel="Setze die Lupe an: Wo beginnt die Achse?">
              <div className="sh-umschalten">
                <button
                  type="button"
                  className={`bk-btn${ehrlich ? ' bk-btn-primary' : ''}`}
                  aria-pressed={ehrlich}
                  onClick={() => {
                    setEhrlich((e) => !e);
                    fertig.teil('achse')();
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> {ehrlich ? 'Zeitungsversion zeigen' : 'Achse ab 0 zeigen'}
                </button>
              </div>
              <p className="sl-text">
                Schalte hin und her. Die Zahlen über den Säulen bleiben gleich, nur der Anfang der senkrechten Achse ändert sich.
              </p>
              <CheckCard
                onSolved={fertig.teil('abl')}
                title="Der echte Anstieg"
                punkte={3}
                prompt={<p>Lies die Werte für 2021 und 2024 ab. Um wie viel Prozent sind die Stromkosten von 2021 bis 2024 gestiegen?</p>}
                fields={[{ kind: 'num', key: 'p', label: 'Anstieg:', expected: ANSTIEG, unit: '%', tol: 0.01 }]}
                loesungNachFehler
                solution={
                  <>
                    <MB>{'108 - 100 = 8 \\qquad \\frac{8}{100} = 0{,}08 = 8\\,\\%'}</MB>
                    <p>Die Kosten sind um 8 % gestiegen.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Lies die Zahlen über den Säulen ab, nicht die Höhe der Säulen.</>,
                      <>Rechne den Unterschied aus und teile durch den alten Wert von 2021.</>,
                      <>
                        <M>{'108 - 100 = 8'}</M>, danach <M>{'8 : 100'}</M>.
                      </>,
                    ]}
                  />
                }
              />
              {ehrlich && (
                <p className="sh-erkenntnis ls-back">
                  <strong>Schon gemerkt?</strong> Es sind dieselben Daten, aber ein ganz anderer Eindruck. In der Zeitungsversion beginnt die
                  Achse bei 98 €: Die Säule für 2021 ist nur 2 Kästchen hoch, die für 2024 dagegen 10. Das sieht nach „fünfmal so viel“ aus.
                  In Wirklichkeit sind es nur 8 %. Gleich lernst du, wie du ehrliche Diagramme zeichnest.
                </p>
              )}
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die ehrliche Titelseite',
      pflicht: ['winkel', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Zeichne das Kreisdiagramm für die Redaktion</p>
            <p>
              Der Stadtbote druckt eine Umfrage: 120 Jugendliche wurden gefragt, wie sie zur Schule kommen. Berechne für jede Antwort den
              Winkel des Sektors, damit die Grafikerin den Kreis ehrlich zeichnen kann. Die Winkel müssen zusammen{' '}
              <M>{'360^\\circ'}</M> ergeben.
            </p>
          </div>
          <UmfrageBild />
          <BeispielMitVideo videoTitel="Lernvideo: Kreisdiagramm zeichnen">
            <Beispiel offen title="Das Lieblingsgetränk" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('winkel')();
                setGeloest(true);
              }}
              title="Die Winkel der Sektoren"
              punkte={14}
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'bus', label: 'Welchen Winkel bekommt der Sektor „Bus“?', expected: WINKEL[0], unit: '°', tol: 0.5 },
                { kind: 'num', key: 'rad', label: 'Welchen Winkel bekommt der Sektor „Fahrrad“?', expected: WINKEL[1], unit: '°', tol: 0.5 },
                { kind: 'num', key: 'fuss', label: 'Welchen Winkel bekommt der Sektor „zu Fuß“?', expected: WINKEL[2], unit: '°', tol: 0.5 },
                { kind: 'num', key: 'taxi', label: 'Welchen Winkel bekommt der Sektor „Elterntaxi“?', expected: WINKEL[3], unit: '°', tol: 0.5 },
              ]}
              loesungNachFehler
              solution={LOESUNG}
              help={
                <Hilfen
                  steps={[
                    <>Rechne wie im Beispiel mit dem Lieblingsgetränk: erst die relative Häufigkeit, dann den Winkel.</>,
                    <>
                      Für jeden Sektor gilt <M>{'\\alpha = h \\cdot 360^\\circ'}</M> mit <M>{'h = H : n'}</M>. Hier ist <M>{'n = 120'}</M>.
                    </>,
                    <>
                      Bus: <M>{'h = \\frac{54}{120} = 0{,}45'}</M>, also <M>{'0{,}45 \\cdot 360^\\circ'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Deine Entscheidung">
            <McCard
              onSolved={fertig.teil('entscheidung')}
              title="Welche Titelseite ist ehrlich?"
              punkte={3}
              prompt={<p>Zur Strom-Meldung liegen vier Entwürfe auf dem Tisch. Welchen druckst du?</p>}
              options={[
                {
                  text: 'Säulen ab 98 €, damit man den Anstieg gut sieht, Schlagzeile „Kosten explodieren“.',
                  feedback: 'Eine abgeschnittene Achse lässt den Anstieg riesig wirken. Das ist genau der Trick, den du aufgedeckt hast.',
                },
                {
                  text: 'Ein Kreisdiagramm mit vier Sektoren für 2021, 2022, 2023 und 2024.',
                  feedback: 'Ein Kreisdiagramm zeigt Anteile an einem Ganzen. Eine Entwicklung über die Jahre gehört in ein Säulen- oder Liniendiagramm.',
                },
                {
                  text: 'Säulen mit einer Achse ab 0 und der Schlagzeile „Strom 8 % teurer als 2021“.',
                  correct: true,
                  feedback: 'Die Achse beginnt bei 0, die Säulen sind im richtigen Verhältnis und die Schlagzeile nennt die echte Zahl.',
                },
                {
                  text: 'Nur die Säule für 2024, groß gezeichnet, damit die Leser den Betrag sehen.',
                  feedback: 'Ohne Vergleichswerte lässt sich kein Anstieg erkennen. Die Leser können nicht prüfen, ob die Aussage stimmt.',
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Richtigstellung an den Stadtboten">
            <LeserbriefBild />
            <p className="sl-text">
              Schreibe in deinem Heft eine kurze Richtigstellung an die Chefredakteurin. Zeichne dazu ein ehrliches Säulendiagramm der
              Stromkosten (Achse ab 0) und das Kreisdiagramm der Schulwege mit deinen berechneten Winkeln. Erkläre, welchen Trick die erste
              Titelseite benutzt hat.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Sehr geehrte Frau Chefredakteurin, Ihre Schlagzeile stimmt nicht, weil …“</li>
                <li>„Die senkrechte Achse beginnt bei …, deshalb wirkt die Säule für 2024 …“</li>
                <li>„Rechnet man nach, sind die Kosten nur um … % gestiegen, nämlich von … € auf … €.“</li>
                <li>„Im Kreisdiagramm gehört zum Bus der Winkel …, weil …“</li>
                <li>
                  „Abkürzungen: <M>H</M> = …, <M>h</M> = …, <M>n</M> = …, <M>{'\\alpha'}</M> = …“
                </li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Richtigstellung vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                'Ein Säulendiagramm der Stromkosten, dessen Achse bei 0 beginnt und das beschriftet ist',
                'Ein Kreisdiagramm der Schulwege mit allen vier Winkeln, deren Summe 360° ergibt',
                'Eine Erklärung, welchen Trick die erste Titelseite benutzt hat und wie groß der echte Anstieg ist',
                'Eine klare Forderung an die Redaktion: Wie soll die Schlagzeile lauten?',
                <>
                  Unter deiner Richtigstellung steht, wofür die Abkürzungen stehen: <M>H</M> (absolute Häufigkeit), <M>h</M> (relative
                  Häufigkeit), <M>n</M> (Gesamtzahl der Befragten) und <M>{'\\alpha'}</M> (Winkel des Sektors). Außerdem erklärst du die
                  Begriffe Säulendiagramm, Kreisdiagramm, Sektor und Achse und alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug fest={fest} />
              <Merke title="Kreisdiagramme zeichnen und Diagramme hinterfragen">
                <MB>{'h = \\frac{H}{n} \\qquad \\alpha = h \\cdot 360^\\circ'}</MB>
                <ul>
                  <li>
                    <M>H</M> = absolute Häufigkeit, <M>n</M> = Gesamtzahl, <M>h</M> = relative Häufigkeit, <M>{'\\alpha'}</M> = Winkel des
                    Sektors. Alle Winkel zusammen ergeben <M>{'360^\\circ'}</M>.
                  </li>
                  <li>Ein Säulendiagramm ist nur ehrlich, wenn die senkrechte Achse bei 0 beginnt. Ein Zickzack zeigt, dass die Achse abgeschnitten ist.</li>
                  <li>Ein Kreisdiagramm zeigt Anteile an einem Ganzen, ein Säulendiagramm einen Vergleich oder eine Entwicklung.</li>
                  <li>Vor dem Urteilen: Zahlen ablesen, Achse prüfen und den Anstieg selbst in Prozent ausrechnen.</li>
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
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die letzte ist für Profis. Hast du Übung 1 bis 3 gelöst, wird unten ein Spiel
            freigeschaltet.
          </p>
          <Abschnitt titel="Übung 1: Welcher Trick?">
            <TrackedMc
              onSolved={uebungFertig('1', fertig.teil)}
              topic="Diagramme-Einstieg: Trick erkennen (Basis)"
              title="Übung 1"
              level="basis"
              punkte={4}
              prompt={
                <p>
                  Ein Säulendiagramm zeigt zwei Säulen mit den Werten 40 und 44. Die senkrechte Achse beginnt bei 38. Die zweite Säule sieht
                  dreimal so hoch aus wie die erste. Was ist der Trick?
                </p>
              }
              options={[
                { text: 'Die Säulen sind unterschiedlich breit gezeichnet.', feedback: 'Die Breite spielt hier keine Rolle. Es geht um die Höhe der Säulen.' },
                {
                  text: 'Die Achse beginnt nicht bei 0. Dadurch wirkt ein kleiner Unterschied riesig.',
                  correct: true,
                  feedback: 'Die Säulenhöhen sind nur 2 und 6 Kästchen. Der echte Unterschied ist 4 von 40, also 10 %.',
                },
                { text: 'Die Zahlen wurden falsch abgelesen.', feedback: 'Die Zahlen stimmen. Nur die Achse verfälscht den Eindruck.' },
                { text: 'Ein Kreisdiagramm wäre immer ehrlicher.', feedback: 'Auch Kreisdiagramme können täuschen. Entscheidend ist, dass die Darstellung zu den Daten passt.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={uebungFertig('2', fertig.teil)}
              topic="Diagramme-Einstieg: Winkel bestimmen (Standard)"
              title="Übung 2"
              rechnen
              level="standard"
              punkte={5}
              prompt={
                <p>
                  In einer Klasse mit 40 Jugendlichen nutzen 10 täglich mehr als drei Stunden das Handy. Für das Kreisdiagramm braucht der
                  Sektor „mehr als drei Stunden“ einen Winkel. Wer hat recht?
                </p>
              }
              options={[
                { text: 'Mia: 10°, weil es 10 Jugendliche sind.', feedback: 'Die absolute Häufigkeit ist noch kein Winkel. Du musst erst durch n teilen und dann mal 360° nehmen.' },
                {
                  text: 'Leon: 90°, weil 10 : 40 = 0,25 und 0,25 · 360° = 90°.',
                  correct: true,
                  feedback: <M>{'\\alpha = \\frac{10}{40} \\cdot 360^\\circ = 0{,}25 \\cdot 360^\\circ = 90^\\circ'}</M>,
                },
                { text: 'Jonas: 25°, weil 25 % gleich 25 Grad sind.', feedback: 'Prozent und Grad sind verschiedene Einheiten. 25 % von 360° sind 90°.' },
                { text: 'Lea: 144°, weil 40 Jugendliche 40 % von 100 sind.', feedback: 'Die 40 ist die Gesamtzahl n und kein Prozentwert. Der Anteil ist 10 von 40.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Die Klassensprecherwahl">
            <TrackedCheck
              onSolved={uebungFertig('3', fertig.teil)}
              topic="Diagramme-Einstieg: Kreisdiagramm Winkel (Standard)"
              title="Übung 3"
              level="standard"
              punkte={6}
              prompt={
                <p>
                  Bei der Klassensprecherwahl geben 30 Jugendliche ihre Stimme ab: Ayla 12, Ben 9, Cem 6, Dana 3. Berechne die Winkel für
                  das Kreisdiagramm der Schülerzeitung.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'a', label: 'Ayla:', expected: 144, unit: '°', tol: 0.5 },
                { kind: 'num', key: 'b', label: 'Ben:', expected: 108, unit: '°', tol: 0.5 },
                { kind: 'num', key: 'c', label: 'Cem:', expected: 72, unit: '°', tol: 0.5 },
                { kind: 'num', key: 'd', label: 'Dana:', expected: 36, unit: '°', tol: 0.5 },
              ]}
              solution={
                <>
                  <MB>{'\\tfrac{12}{30} \\cdot 360^\\circ = 144^\\circ \\quad \\tfrac{9}{30} \\cdot 360^\\circ = 108^\\circ \\quad \\tfrac{6}{30} \\cdot 360^\\circ = 72^\\circ \\quad \\tfrac{3}{30} \\cdot 360^\\circ = 36^\\circ'}</MB>
                  <p>Kontrolle: Alle vier Winkel ergeben zusammen 360°.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Wie viele Stimmen wurden insgesamt abgegeben? Das ist <M>n</M>.</>,
                    <>
                      Für jede Person gilt <M>{'\\alpha = \\frac{H}{n} \\cdot 360^\\circ'}</M>.
                    </>,
                    <>
                      Ayla: <M>{'\\frac{12}{30} \\cdot 360^\\circ'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Rückwärts gerechnet">
            <CheckCard
              title="Wie viele wurden befragt?"
              level="erweiterung"
              profi
              punkte={9}
              prompt={
                <p>
                  Im Kreisdiagramm einer Umfrage unter 240 Jugendlichen hat der Sektor „Fahrrad“ einen Winkel von <M>{'54^\\circ'}</M>. Wie
                  viel Prozent der Befragten und wie viele Jugendliche fahren mit dem Rad?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'p', label: 'Anteil:', expected: 15, unit: '%', tol: 0.01 },
                { kind: 'num', key: 'h', label: 'Anzahl:', expected: 36, tol: 0.01 },
              ]}
              loesungNachFehler
              solution={
                <>
                  <MB>{'h = \\frac{54^\\circ}{360^\\circ} = 0{,}15 = 15\\,\\%'}</MB>
                  <MB>{'H = h \\cdot n = 0{,}15 \\cdot 240 = 36'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Diesmal ist der Winkel bekannt und der Anteil gesucht. Rechne die Formel rückwärts.</>,
                    <>
                      <M>{'h = \\alpha : 360^\\circ'}</M>. Mit <M>h</M> und <M>n</M> findest du dann <M>H</M>.
                    </>,
                    <>
                      <M>{'h = 54 : 360'}</M>, danach <M>{'H = h \\cdot 240'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 3} titel="Lügen-Check">
            <LuegenCheck />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt Säulendiagramme kritisch lesen und ein Kreisdiagramm mit richtigen Winkeln zeichnen. Bei den Übungsaufgaben
              erstellst du Diagramme selbst und achtest auf Täuschungen.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={() => navigate('/daten-und-zufall/diagramme')}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={() => navigate('/daten-und-zufall/diagramme/ueben')}>
                Weiter üben: Diagramme <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <TaskShell
      title="Diagramme: Die Schlagzeile"
      width="wide"
      kompakt
      parent={{ to: '/daten-und-zufall/diagramme', label: 'Diagramme' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={
          <>
            In dieser Lernsituation prüfst du als Praktikantin oder Praktikant beim „Stadtboten“, ob ein Diagramm die Wahrheit sagt. Du
            lernst, Diagramme kritisch zu lesen und ein Kreisdiagramm mit den richtigen Winkeln zu zeichnen.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  );
}

/** Rückbezug auf die Festlegung aus „Problem erkennen“ */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  if (!fest.fest || !fest.wahl) return null;
  const diff = Math.abs(fest.wert - ANSTIEG);
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest geschätzt:</strong> etwa {fest.wert} %. {WAHL[fest.wahl]}{' '}
        {fest.wahl === 'wenig' ? 'Das stimmt: ' : 'Tatsächlich sind es nur '}
        {ANSTIEG} % (von 100 € auf 108 €). {diff <= 10 ? 'Deine Schätzung war sehr nah dran.' : `Deine Schätzung lag ${diff} Prozentpunkte daneben.`} Die
        Zeitung hat mit der abgeschnittenen Achse einen viel größeren Anstieg vorgetäuscht.
      </p>
    </div>
  );
}
