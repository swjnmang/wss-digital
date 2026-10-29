import { useEffect, useState } from 'react';
import { useSpielPunkte } from '../../../lineare_funktionen/lernsituation_kit/punkte';
import { MiniSaeulen } from './schlagzeile_bilder';

// Bonus-Spiel „Lügen-Check“ am Ende der Lernsituation „Die Schlagzeile“: Eine Zeitung zeigt zwei Säulen mit abgeschnittener
// Achse. Die SuS entscheiden, um wie viel Prozent der Wert wirklich gestiegen ist. Die falschen Antworten sind typische Fehler:
// der Eindruck aus den Säulenhöhen und die Differenz der Werte, als Prozent gelesen. Vier Runden, jede richtige Antwort eine Münze.

const RUNDEN = 4;
type Art = 'richtig' | 'optisch' | 'differenz';
type Aufgabe = { v1: number; v2: number; start: number; antworten: { wert: number; art: Art }[]; text: string };

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

const THEMEN = [
  { was: 'Die Monatsmiete im Studentenwohnheim' },
  { was: 'Der Preis für ein Fahrradschloss' },
  { was: 'Die Zahl der Besucher im Freibad pro Tag' },
  { was: 'Der Preis für eine Kinokarte in Cent' },
];

function neueAufgabe(): Aufgabe {
  for (;;) {
    const v1 = pick([50, 80, 100, 120, 200, 250]);
    const prozent = pick([5, 10, 15, 20, 25]);
    const v2 = (v1 * (100 + prozent)) / 100;
    const d = v2 - v1;
    if (!Number.isInteger(v2) || d < 3) continue;
    const k = pick([1, 2]);
    const start = v1 - k * d;
    if (start < 0) continue;
    const optisch = Math.round(((v2 - start) / (v1 - start) - 1) * 100);
    const antworten = [
      { wert: prozent, art: 'richtig' as Art },
      { wert: optisch, art: 'optisch' as Art },
      { wert: d, art: 'differenz' as Art },
    ];
    if (new Set(antworten.map((a) => a.wert)).size < 3) continue;
    const t = pick(THEMEN);
    return { v1, v2, start, antworten: antworten.sort(() => Math.random() - 0.5), text: t.was };
  }
}

const ERKLAERUNG: Record<Art, string> = {
  richtig: 'Richtig gerechnet!',
  optisch: 'Das ist der Eindruck aus den Säulenhöhen. Die Achse beginnt aber nicht bei 0, deshalb täuscht das Bild.',
  differenz: 'Das ist der Unterschied der beiden Werte, aber noch nicht in Prozent. Teile ihn durch den alten Wert.',
};

export default function LuegenCheck() {
  const [aufgabe, setAufgabe] = useState(neueAufgabe);
  const [runde, setRunde] = useState(0);
  const [muenzen, setMuenzen] = useState(0);
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [ende, setEnde] = useState(false);
  const melde = useSpielPunkte();

  useEffect(() => {
    if (ende) melde(muenzen, RUNDEN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ende]);

  const richtig = aufgabe.antworten.findIndex((a) => a.art === 'richtig');
  const antwort = (i: number) => {
    if (gewaehlt !== null) return;
    setGewaehlt(i);
    if (i === richtig) setMuenzen((m) => m + 1);
  };
  const weiter = () => {
    if (runde + 1 >= RUNDEN) return setEnde(true);
    setRunde(runde + 1);
    setAufgabe(neueAufgabe());
    setGewaehlt(null);
  };
  const nochmal = () => {
    setRunde(0);
    setMuenzen(0);
    setGewaehlt(null);
    setEnde(false);
    setAufgabe(neueAufgabe());
  };

  const yMax = aufgabe.start + (aufgabe.v2 - aufgabe.start) * 1.25;
  const schritt = Math.max(1, Math.round((yMax - aufgabe.start) / 4));

  return (
    <div className="sh-spiel" data-no-autocheck>
      <div className="sh-spiel-kopf">
        <span>{ende ? 'Geschafft!' : `Runde ${runde + 1} von ${RUNDEN}`}</span>
        <span className="sh-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' sh-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {!ende && (
        <>
          <p className="sh-spiel-frage">
            {aufgabe.text} steht im Stadtboten so da: <strong>{aufgabe.v1}</strong> im letzten Jahr, <strong>{aufgabe.v2}</strong> in diesem
            Jahr. Rechne mit dem Taschenrechner: Um wie viel Prozent ist der Wert wirklich gestiegen?
          </p>
          <MiniSaeulen
            labels={['letztes Jahr', 'dieses Jahr']}
            werte={[aufgabe.v1, aufgabe.v2]}
            yStart={Math.max(0, aufgabe.start)}
            yMax={Math.round(yMax)}
            schritt={schritt}
            titel={`Zwei Säulen: ${aufgabe.v1} und ${aufgabe.v2}. Die senkrechte Achse beginnt bei ${aufgabe.start}.`}
          />
          <div className="sh-antworten" role="group" aria-label="Antworten">
            {aufgabe.antworten.map((a, i) => {
              const stil =
                gewaehlt === null ? '' : i === richtig ? ' bk-btn-primary' : i === gewaehlt ? ' sh-falsch' : '';
              return (
                <button key={i} type="button" className={`bk-btn${stil}`} disabled={gewaehlt !== null && i !== gewaehlt && i !== richtig} onClick={() => antwort(i)}>
                  {a.wert} %
                </button>
              );
            })}
          </div>
          {gewaehlt !== null && (
            <>
              <div className={`bk-feedback lp-feedback ${gewaehlt === richtig ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
                <i className={`fa-solid ${gewaehlt === richtig ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
                <span>
                  {gewaehlt === richtig ? 'Münze eingesammelt! ' : `Leider falsch. ${ERKLAERUNG[aufgabe.antworten[gewaehlt].art]} `}
                  Richtig ist {aufgabe.antworten[richtig].wert} %: {aufgabe.v2 - aufgabe.v1} : {aufgabe.v1} ={' '}
                  {String(aufgabe.antworten[richtig].wert / 100).replace('.', ',')}.
                </span>
              </div>
              <div className="bk-actions">
                <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
                  {runde + 1 >= RUNDEN ? 'Zum Ergebnis' : 'Nächste Runde'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </>
      )}
      {ende && (
        <>
          <p className="sh-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-magnifying-glass'}`} aria-hidden="true" /> Du hast {muenzen} von{' '}
            {RUNDEN} Münzen eingesammelt.{' '}
            {muenzen === RUNDEN
              ? 'Perfekt, dir macht kein Diagramm mehr etwas vor!'
              : muenzen >= 3
                ? 'Stark, fast alles durchschaut!'
                : 'Probier es noch einmal, du schaffst mehr!'}
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
