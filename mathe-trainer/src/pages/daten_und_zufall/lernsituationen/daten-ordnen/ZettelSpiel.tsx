import { useEffect, useState } from 'react';
import { useSpielPunkte } from '../../../lineare_funktionen/lernsituation_kit/punkte';

// Bonus-Spiel „Zettel-Zähler“ am Ende der Lernsituation „Der Pausenkiosk“: In jeder Runde liegt ein frischer Zettelstapel
// (24 Antworten einer Umfrage) auf dem Tresen. Die SuS zählen nach, wie oft ein Getränk vorkommt, oder finden das häufigste Getränk.
// Vier Runden, jede richtige Antwort bringt eine Münze. Die falschen Antworten sind typische Fehler: um einen Strich verzählt,
// das Nachbargetränk gezählt, nach den ersten Zetteln geurteilt. Keine Zeitnot, Taschenrechner und Heft sind erlaubt.

const RUNDEN = 4;
const SORTEN = [
  { k: 'W', name: 'Wasser' },
  { k: 'A', name: 'Apfelschorle' },
  { k: 'E', name: 'Eistee' },
  { k: 'K', name: 'Kakao' },
] as const;
type Kurz = (typeof SORTEN)[number]['k'];
const NAME: Record<Kurz, string> = { W: 'Wasser', A: 'Apfelschorle', E: 'Eistee', K: 'Kakao' };

type Option = { text: string; richtig: boolean; erklaerung: string };
type Runde = { zettel: Kurz[]; frage: string; optionen: Option[] };

const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const mischen = <T,>(a: T[]) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** 24 Zettel mit vier verschiedenen Häufigkeiten (also genau einem Spitzenreiter) */
function neueRunde(art: 'anzahl' | 'spitze'): Runde {
  const n = 24;
  let h: number[];
  do {
    const w = [rnd(2, 12), rnd(2, 12), rnd(2, 12)];
    h = [...w, n - w[0] - w[1] - w[2]];
  } while (h[3] < 2 || h[3] > 12 || new Set(h).size < 4);
  const zettel = mischen(SORTEN.flatMap((s, i) => Array<Kurz>(h[i]).fill(s.k)));
  const zaehle = (k: Kurz) => zettel.filter((z) => z === k).length;
  if (art === 'anzahl') {
    const s = SORTEN[rnd(0, 3)];
    const richtig = zaehle(s.k);
    const andere = SORTEN.filter((x) => x.k !== s.k);
    const nachbar = zaehle(andere[rnd(0, 2)].k);
    const daneben = Math.random() < 0.5 ? richtig + 1 : richtig - 1;
    const werte = new Set([richtig, daneben, nachbar]);
    let extra = richtig + 2;
    while (werte.size < 3) werte.add(extra++);
    const optionen: Option[] = mischen([...werte]).map((w) => ({
      text: String(w),
      richtig: w === richtig,
      erklaerung:
        w === richtig
          ? 'Richtig gezählt!'
          : w === daneben
            ? 'Knapp daneben: Du hast einen Zettel zu viel oder zu wenig gezählt. Streiche beim Zählen jeden Zettel ab.'
            : w === nachbar
              ? 'Das ist die Anzahl eines anderen Getränks. Achte darauf, welches Getränk gefragt ist.'
              : 'Diese Zahl passt nicht. Zähle noch einmal sauber mit einer Strichliste.',
    }));
    return { zettel, frage: `Wie oft kommt ${NAME[s.k]} (${s.k}) auf den 24 Zetteln vor?`, optionen };
  }
  const spitze = SORTEN[h.indexOf(Math.max(...h))].k;
  const ersteZehn = zettel.slice(0, 8);
  const vorne = SORTEN.map((s) => s.k)
    .filter((k) => k !== spitze)
    .sort((a, b) => ersteZehn.filter((z) => z === b).length - ersteZehn.filter((z) => z === a).length)[0];
  const zweite = SORTEN.map((s) => s.k)
    .filter((k) => k !== spitze && k !== vorne)
    .sort((a, b) => zaehle(b) - zaehle(a))[0];
  const optionen: Option[] = mischen([spitze, vorne, zweite]).map((k) => ({
    text: NAME[k],
    richtig: k === spitze,
    erklaerung:
      k === spitze
        ? `Richtig: ${NAME[k]} kommt ${zaehle(k)}-mal vor, öfter als jedes andere Getränk.`
        : k === vorne
          ? `${NAME[k]} kommt in den ersten Zetteln oft vor, insgesamt aber nur ${zaehle(k)}-mal. Die ersten Zettel täuschen.`
          : `${NAME[k]} kommt ${zaehle(k)}-mal vor. Ein anderes Getränk hat mehr Nennungen.`,
  }));
  return { zettel, frage: 'Welches Getränk wird am häufigsten genannt?', optionen };
}

const neueRunden = () => [neueRunde('anzahl'), neueRunde('spitze'), neueRunde('anzahl'), neueRunde('spitze')];

export default function ZettelSpiel() {
  const [runden, setRunden] = useState<Runde[]>(neueRunden);
  const [i, setI] = useState(0);
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [muenzen, setMuenzen] = useState(0);
  const [ende, setEnde] = useState(false);
  const [start, setStart] = useState(false);
  const meldeSpiel = useSpielPunkte();

  useEffect(() => {
    if (ende) meldeSpiel(muenzen, RUNDEN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ende]);

  const r = runden[i];
  const waehle = (o: number) => {
    if (gewaehlt !== null) return;
    setGewaehlt(o);
    if (r.optionen[o].richtig) setMuenzen((m) => m + 1);
  };
  const weiter = () => {
    if (i + 1 >= RUNDEN) return setEnde(true);
    setI(i + 1);
    setGewaehlt(null);
  };
  const nochmal = () => {
    setRunden(neueRunden());
    setI(0);
    setGewaehlt(null);
    setMuenzen(0);
    setEnde(false);
    setStart(false);
  };

  return (
    <div className="ki-spiel" data-no-autocheck>
      <div className="ki-spiel-kopf">
        <span>{ende ? 'Feierabend!' : `Runde ${i + 1} von ${RUNDEN}`}</span>
        <span className="ki-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, k) => (
            <i key={k} className={`fa-solid fa-coins${k < muenzen ? ' ki-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {!start && !ende && (
        <>
          <p className="sl-text">
            Frau Brandl legt dir vier frische Zettelstapel auf den Tresen. Zähle nach und wähle die richtige Antwort. Du darfst in Ruhe mit
            Strichliste und Heft arbeiten. Für jede richtige Antwort bekommst du eine Münze.
          </p>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={() => setStart(true)}>
              <i className="fa-solid fa-play" aria-hidden="true" /> Los geht’s
            </button>
          </div>
        </>
      )}
      {start && !ende && (
        <>
          <div className="ki-urliste">
            <div className="ki-chips" role="img" aria-label={`Urliste mit 24 Zetteln: ${r.zettel.map((z) => NAME[z]).join(', ')}`}>
              {r.zettel.map((z, k) => (
                <span key={k} className="ki-chip" aria-hidden="true">
                  <small>{k + 1}</small>
                  {z}
                </span>
              ))}
            </div>
            <p className="ki-legende">
              <strong>W</strong> Wasser · <strong>A</strong> Apfelschorle · <strong>E</strong> Eistee · <strong>K</strong> Kakao
            </p>
          </div>
          <p className="ki-spiel-frage">{r.frage}</p>
          <div className="ki-optionen">
            {r.optionen.map((o, k) => (
              <button
                key={k}
                type="button"
                className={`bk-btn${gewaehlt !== null && o.richtig ? ' ki-richtig' : ''}${gewaehlt === k && !o.richtig ? ' ki-falsch' : ''}`}
                onClick={() => waehle(k)}
                disabled={gewaehlt !== null && gewaehlt !== k && !o.richtig}
              >
                {o.text}
              </button>
            ))}
          </div>
          {gewaehlt !== null && (
            <>
              <div className={`bk-feedback lp-feedback ${r.optionen[gewaehlt].richtig ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
                <i className={`fa-solid ${r.optionen[gewaehlt].richtig ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
                <span>
                  {r.optionen[gewaehlt].richtig ? 'Münze eingesammelt! ' : ''}
                  {r.optionen[gewaehlt].erklaerung}
                </span>
              </div>
              <div className="bk-actions">
                <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
                  {i + 1 >= RUNDEN ? 'Zum Ergebnis' : 'Nächster Stapel'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </>
      )}
      {ende && (
        <>
          <p className="ki-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-store'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN} Münzen
            eingesammelt.{' '}
            {muenzen === RUNDEN ? 'Perfekt, der Kiosk ist bestens sortiert!' : muenzen >= 3 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
          </p>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={nochmal}>
              <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
