import { useEffect, useId, useState, type CSSProperties, type ChangeEvent, type ReactNode } from 'react';
import { HeftBestaetigtCtx } from './kit';
import { PHASEN, type PhaseArt } from './phasen';
import { PunkteAnzeige, PunkteGruppeCtx, PunkteProvider, PunkteRegeln } from './punkte';
import { VideoEmbed } from '../../../components/VideoButton';
import './phasen.css';
import './seiten.css';

// Seitenansicht einer Lernsituation: zuerst eine Startbox, in der die SuS bestätigen, dass sie alle Rechenschritte im Heft
// dokumentieren. Danach eine Seite pro Phase. „Weiter“ wird erst frei, wenn die Seite erledigt ist (fertig() bzw. alle fertig.teil() der pflicht wurden
// aufgerufen) oder die Seite als frei markiert ist (reine Info-Seiten). Alle Seiten bleiben eingehängt, damit Eingaben beim
// Zurückblättern erhalten bleiben. Nach unten scrollen ist erlaubt, seitlich nie.

/** Themenfarben für die Identität einer Lernsituation (alle mit weißer Schrift kontraststark, bewusst ohne Grün und Rot) */
export const THEMEN = {
  blau: { farbe: '#1d3f9e', soft: '#e8edf8' },
  petrol: { farbe: '#0e6670', soft: '#e2f1f2' },
  violett: { farbe: '#6a3d9a', soft: '#f1ebf8' },
  beere: { farbe: '#a0275e', soft: '#fae9f1' },
  ocker: { farbe: '#8a5800', soft: '#fbf0da' },
  schiefer: { farbe: '#3c5466', soft: '#e8eef2' },
  indigo: { farbe: '#4338a6', soft: '#ecebf9' },
  kupfer: { farbe: '#9a4515', soft: '#fbece3' },
} as const;

/** Identität einer Lernsituation: Name, Themenfarbe, Symbol (Font-Awesome-Klasse) und Titelbild für die Startbox */
export type Thema = { name: string; farbe: keyof typeof THEMEN; icon: string; bild?: ReactNode };

const themaStil = (t?: Thema) =>
  t
    ? ({
        '--primary': THEMEN[t.farbe].farbe,
        '--primary-ink': THEMEN[t.farbe].farbe,
        '--primary-soft': THEMEN[t.farbe].soft,
        '--accent': THEMEN[t.farbe].farbe,
      } as CSSProperties)
    : undefined;

/**
 * Freischalten einer Seite: fertig() schaltet die ganze Seite frei. Steht auf der Seite mehr als eine Pflichtaufgabe
 * (eine Seite pro Phase), meldet jede Aufgabe sich mit fertig.teil('schluessel') und die Seite nennt die Schlüssel in pflicht.
 */
export type Fertig = (() => void) & { teil: (key: string) => () => void };

export type Seite = {
  art: PhaseArt;
  /** Seitentitel, darf Formeln enthalten */
  titel: ReactNode;
  /** Info-Seite: „Weiter“ ist sofort frei */
  frei?: boolean;
  /** Hinweis, was zum Freischalten nötig ist (Standard: Aufgabe richtig lösen) */
  bedingung?: string;
  /** Schlüssel aller Pflichtaufgaben der Seite; „Weiter“ wird frei, wenn jede mit fertig.teil(schluessel) gemeldet ist */
  pflicht?: string[];
  inhalt: (fertig: Fertig) => ReactNode;
};

/**
 * ruhig: ruhiges Grunddesign (eine Spalte, eine Akzentfarbe, keine Farbstreifen), siehe docs/skills/lernsituationen/SKILL.md.
 * punkte: Gamification (Punkte in der Leiste, Abzüge für Hilfen und Lösungsweg, Serien-Bonus; Bilanz mit <Bilanz /> aus punkte.tsx).
 */
export function SeitenLernsituation(props: {
  ziel: ReactNode;
  seiten: Seite[];
  ruhig?: boolean;
  thema?: Thema;
  punkte?: boolean;
}) {
  if (!props.punkte) return <SeitenAnsicht {...props} />;
  return (
    <PunkteProvider name={props.thema?.name ?? 'Lernsituation'}>
      <SeitenAnsicht {...props} />
    </PunkteProvider>
  );
}

function SeitenAnsicht({
  ziel,
  seiten,
  ruhig = false,
  thema,
}: {
  ziel: ReactNode;
  seiten: Seite[];
  ruhig?: boolean;
  thema?: Thema;
}) {
  const [bestaetigt, setBestaetigt] = useState(false);
  const [haken, setHaken] = useState(false);
  const [nr, setNr] = useState(0);
  const [erledigt, setErledigt] = useState<boolean[]>(() => seiten.map((s) => !!s.frei));
  const [teile, setTeile] = useState<Record<number, string[]>>({});

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [nr, bestaetigt]);

  // Seiten mit mehreren Pflichtaufgaben: frei, sobald alle gemeldet sind
  useEffect(() => {
    setErledigt((e) => {
      const neu = e.map(
        (v, i) =>
          v ||
          (!!seiten[i].pflicht?.length && seiten[i].pflicht!.every((k) => teile[i]?.includes(k)))
      );
      return neu.some((v, i) => v !== e[i]) ? neu : e;
    });
  }, [teile, seiten]);

  if (!bestaetigt) {
    return (
      <div
        className={`sl-start${ruhig ? ' sl-ruhig' : ''}${thema ? ' sl-thema' : ''}`}
        style={themaStil(thema)}
      >
        {thema?.bild ? (
          <div className="sl-start-bild">{thema.bild}</div>
        ) : (
          <div className="sl-start-icon">
            <i className={`fa-solid ${thema?.icon ?? 'fa-pen-to-square'}`} aria-hidden="true" />
          </div>
        )}
        <h2>{thema ? thema.name : 'Bevor es losgeht'}</h2>
        <p className="sl-start-ziel">{ziel}</p>
        <div className="sl-start-regel">
          <strong>Deine Arbeitsweise:</strong> Bearbeite jede Aufgabe in deinem Heft und schreibe
          dabei <strong>alle Rechenschritte</strong> vollständig auf, nicht nur das Ergebnis. Erst
          dann trägst du das Ergebnis hier ein und prüfst es.
        </div>
        <PunkteRegeln />
        <label className="sl-start-check">
          <input
            type="checkbox"
            checked={haken}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setHaken(e.target.checked)}
          />
          <span>
            Ich dokumentiere bei jeder Aufgabe alle Rechenschritte schriftlich in meinem Heft.
          </span>
        </label>
        <button
          type="button"
          className="bk-btn bk-btn-primary"
          disabled={!haken}
          onClick={() => setBestaetigt(true)}
        >
          Bestätigen und starten <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    );
  }

  const seite = seiten[nr];
  const phaseIdx = PHASEN.findIndex((p) => p.art === seite.art);
  const frei = erledigt[nr];
  const fertig = (i: number): Fertig => {
    const f = (() =>
      setErledigt((e) => (e[i] ? e : e.map((v, j) => (j === i ? true : v))))) as Fertig;
    f.teil = (key: string) => () =>
      setTeile((t) => (t[i]?.includes(key) ? t : { ...t, [i]: [...(t[i] ?? []), key] }));
    return f;
  };
  const offen = (i: number) => {
    const p = seiten[i].pflicht;
    if (!p?.length) return null;
    return `${p.filter((k) => teile[i]?.includes(k)).length} von ${p.length} Aufgaben gelöst`;
  };

  return (
    <div
      className={`sl${ruhig ? ' sl-ruhig' : ''}${thema ? ' sl-thema' : ''}`}
      style={themaStil(thema)}
    >
      <div className="sl-bar">
        {thema && (
          <span className="sl-marke" title={thema.name}>
            <i className={`fa-solid ${thema.icon}`} aria-hidden="true" />
            <span className="sl-marke-name">{thema.name}</span>
          </span>
        )}
        <button
          type="button"
          className="bk-btn bk-btn-sm"
          disabled={nr === 0}
          onClick={() => setNr(nr - 1)}
          aria-label="Vorherige Seite"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        </button>
        <ol className="sl-phasen" aria-label="Phasen der Lernsituation">
          {PHASEN.map((p, i) => (
            <li
              key={p.art}
              className={`et-bar-${p.art}${i === phaseIdx ? ' sl-on' : ''}${
                i < phaseIdx ? ' sl-done' : ''
              }`}
              aria-current={i === phaseIdx ? 'step' : undefined}
            >
              <span className="sl-no">
                {i < phaseIdx ? <i className="fa-solid fa-check" aria-hidden="true" /> : i + 1}
              </span>
              <span className="sl-name">{p.title}</span>
            </li>
          ))}
        </ol>
        {!(ruhig && seiten.length === PHASEN.length) && (
          <span className="sl-zaehler" aria-label={`Seite ${nr + 1} von ${seiten.length}`}>
            {ruhig ? `${nr + 1} / ${seiten.length}` : `Seite ${nr + 1} von ${seiten.length}`}
          </span>
        )}
        <PunkteAnzeige />
        {nr < seiten.length - 1 && (
          <button
            type="button"
            className="bk-btn bk-btn-sm bk-btn-primary"
            disabled={!frei}
            title={frei ? undefined : seite.bedingung ?? 'Löse zuerst die Aufgabe richtig.'}
            onClick={() => setNr(nr + 1)}
          >
            Weiter <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        )}
      </div>
      <HeftBestaetigtCtx.Provider value={true}>
        {seiten.map((s, i) => (
          <section key={i} hidden={i !== nr} className={`sl-seite et-${s.art}`}>
            <div className="sl-kopf">
              <h2 className="sl-titel">
                <span className="sl-kicker">{PHASEN.find((p) => p.art === s.art)?.title}</span>
                {s.titel}
              </h2>
              {(s.bedingung || s.pflicht?.length) && !erledigt[i] && (
                <p className="sl-sperre">
                  {s.bedingung ?? 'Löse alle Aufgaben dieser Phase, dann geht es weiter.'}
                  {offen(i) && <> ({offen(i)})</>}
                </p>
              )}
            </div>
            {s.inhalt(fertig(i))}
          </section>
        ))}
      </HeftBestaetigtCtx.Provider>
    </div>
  );
}

/** Abschnitt innerhalb einer Phasen-Seite mit eigener Zwischenüberschrift */
export function Abschnitt({ titel, children }: { titel: ReactNode; children: ReactNode }) {
  return (
    <section className="sl-abschnitt">
      <h3 className="sl-abschnitt-titel">{titel}</h3>
      {children}
    </section>
  );
}

/** Inhalt erst auf Knopfdruck zeigen, z. B. das Rechenbeispiel in „Problem lösen“ */
export function Aufklappbar({
  label,
  icon = 'fa-lightbulb',
  breit = false,
  offen: offenVon,
  onToggle,
  children,
}: {
  label: string;
  icon?: string;
  /** Knopf so breit wie die übrigen Elemente der Seite */
  breit?: boolean;
  /** Von außen gesteuert (z. B. Fehlersuche, die sich nach einem Fehler öffnet) */
  offen?: boolean;
  onToggle?: (offen: boolean) => void;
  children: ReactNode;
}) {
  const [offenIntern, setOffenIntern] = useState(false);
  const offen = offenVon ?? offenIntern;
  const setOffen = (f: (o: boolean) => boolean) => {
    const neu = f(offen);
    setOffenIntern(neu);
    onToggle?.(neu);
  };
  return (
    <div className={`sl-aufklappbar${breit ? ' sl-aufklappbar-breit' : ''}`}>
      <div>
        <button
          type="button"
          className="bk-btn"
          aria-expanded={offen}
          onClick={() => setOffen((o) => !o)}
        >
          <i className={`fa-solid ${offen ? 'fa-chevron-up' : icon}`} aria-hidden="true" />{' '}
          {offen ? `${label.replace(/ ansehen$/, '')} schließen` : label}
        </button>
      </div>
      {offen && <div className="sl-aufklappbar-inhalt">{children}</div>}
    </div>
  );
}

/**
 * Wahl in „Problem lösen“: selbstständig rechnen (nur Ergebnisfelder) oder mit Lösungsschema (Lückenrechnung).
 * Beide Wege prüfen dieselben Ergebnisse; beide bleiben eingehängt, damit Eingaben beim Wechseln erhalten bleiben.
 */
export function WegWahl({ selbst, schema }: { selbst: ReactNode; schema: ReactNode }) {
  const [weg, setWeg] = useState<'selbst' | 'schema'>('selbst');
  // Beide Wege zählen bei den Punkten als eine Aufgabe
  const gruppe = useId();
  return (
    <PunkteGruppeCtx.Provider value={gruppe}>
    <div className="sl-wegwahl">
      <div className="sl-wegwahl-knoepfe" role="group" aria-label="Wie möchtest du rechnen?">
        <button
          type="button"
          className={`bk-btn${weg === 'selbst' ? ' bk-btn-primary' : ''}`}
          aria-pressed={weg === 'selbst'}
          onClick={() => setWeg('selbst')}
        >
          <i className="fa-solid fa-pen" aria-hidden="true" /> Selbst rechnen
        </button>
        <button
          type="button"
          className={`bk-btn${weg === 'schema' ? ' bk-btn-primary' : ''}`}
          aria-pressed={weg === 'schema'}
          onClick={() => setWeg('schema')}
        >
          <i className="fa-solid fa-list-ol" aria-hidden="true" /> Mit Lösungsschema
        </button>
      </div>
      <div hidden={weg !== 'selbst'}>{selbst}</div>
      <div hidden={weg !== 'schema'}>{schema}</div>
    </div>
    </PunkteGruppeCtx.Provider>
  );
}

/** Auftrag zum Handlungsprodukt (meist analog im Heft) mit optionalen Kriterien zum Abhaken */
export function Handlungsprodukt({ titel, children }: { titel: ReactNode; children: ReactNode }) {
  return (
    <section className="sl-produkt">
      <h3 className="sl-abschnitt-titel">
        <i className="fa-solid fa-pen-ruler" aria-hidden="true" /> Dein Handlungsprodukt: {titel}
      </h3>
      {children}
    </section>
  );
}

/** Zwei Spalten nebeneinander (ab Tablet-Breite), z. B. Grafik links und Aufgabe rechts */
export function ZweiSpalten({ links, rechts }: { links: ReactNode; rechts: ReactNode }) {
  return (
    <div className="sl-zwei">
      <div>{links}</div>
      <div>{rechts}</div>
    </div>
  );
}

/** Karte für die Auswahlseite eines Themas: führt in eine Lernsituation, in deren Themenfarbe, mit Symbol und Name */
export function LernsituationKarte({
  thema,
  teil,
  beschreibung,
  onClick,
  className = '',
}: {
  thema: Pick<Thema, 'name' | 'farbe' | 'icon'>;
  /** z. B. „Lernsituation 1 · Scheitelpunkt und ein Punkt“ */
  teil?: string;
  beschreibung: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick();
        window.scrollTo({ top: 0 });
      }}
      style={{ background: THEMEN[thema.farbe].farbe }}
      className={`rounded-2xl text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5 ${className}`}
    >
      {teil && <p className="text-sm font-bold mb-1 text-white/90">{teil}</p>}
      <p className="text-lg font-bold mb-1 text-white">{thema.name}</p>
      <p className="text-xl mb-2 text-white">
        <i className={`fa-solid ${thema.icon}`} aria-hidden="true" />
      </p>
      <p className="text-sm text-white/90">{beschreibung}</p>
    </button>
  );
}

/**
 * Bonus-Spiel am Ende der Lernsituation (unter den Übungsaufgaben): gesperrt, bis alle Pflichtaufgaben der letzten Seite gelöst sind,
 * dann frei. Das Spiel selbst (children) passt zum Thema und prüft das Wissen noch einmal spielerisch.
 */
export function BonusSpiel({
  frei,
  titel,
  children,
}: {
  frei: boolean;
  titel: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="sl-abschnitt sl-bonus">
      <h3 className="sl-abschnitt-titel">
        <i className={`fa-solid ${frei ? 'fa-gamepad' : 'fa-lock'}`} aria-hidden="true" /> Bonus-Spiel: {titel}
      </h3>
      {frei ? (
        children
      ) : (
        <p className="sl-hinweis">Löse alle Übungsaufgaben oben, dann wird hier ein Spiel freigeschaltet.</p>
      )}
    </section>
  );
}

/**
 * „Problem lösen“: Beispielrechnung mit Lernvideo hinter einem breiten Knopf. Aufgeklappt steht oben das Lernvideo (falls es eines gibt),
 * darunter die Beispielrechnung (meist <Beispiel offen …/>). Rechenbeispiel und Video sind kostenlos.
 */
export function BeispielMitVideo({
  video,
  videoTitel = 'Lernvideo',
  children,
}: {
  /** YouTube-Adresse des Lernvideos aus den Übungsaufgaben des Themas */
  video?: string;
  videoTitel?: string;
  children: ReactNode;
}) {
  return (
    <Aufklappbar
      breit
      icon={video ? 'fa-circle-play' : 'fa-lightbulb'}
      label={video ? 'Beispielrechnung mit Lernvideo ansehen' : 'Beispielrechnung ansehen'}
    >
      {video && <VideoEmbed src={video} title={videoTitel} />}
      {children}
    </Aufklappbar>
  );
}

/**
 * Fehlersuche unter dem Ergebnis-Abgleich in „Problem lösen“: breiter Knopf, öffnet sich automatisch, sobald ein Ergebnis rot war
 * (onFehler der Ergebnis-CheckCard → fehler). Darin eine CheckCard mit den Zwischenergebnissen und ohnePunkte.
 */
export function Fehlersuche({ fehler, children }: { fehler: boolean; children: ReactNode }) {
  const [offen, setOffen] = useState(false);
  const [geschlossen, setGeschlossen] = useState(false);
  useEffect(() => {
    if (fehler && !geschlossen) setOffen(true);
  }, [fehler, geschlossen]);
  return (
    <Aufklappbar
      breit
      icon="fa-magnifying-glass"
      label="Ein Ergebnis ist rot? Fehler suchen"
      offen={offen}
      onToggle={(o) => {
        setOffen(o);
        if (!o) setGeschlossen(true);
      }}
    >
      {children}
    </Aufklappbar>
  );
}
