import React, { useCallback, useEffect, useState } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import TaskShell from '../../components/layout/TaskShell';
import { fieldCheckClass } from '../../utils/fieldCheck';
import {
  STUFEN,
  generiereSet,
  pruefeAntwort,
  type Aufgabe,
  type Ergebnis,
  type StufeId,
} from './binomische/binomischeAufgaben';

const AUFGABEN_PRO_SET = 8;

const LOB = [
  'Super, richtig! 🎉',
  'Klasse, die Formel sitzt!',
  'Stark gemacht! 💪',
  'Genau so! Weiter so!',
  'Richtig – du hast den Dreh raus!',
  'Ausgezeichnet! ⭐',
];

interface Antwort {
  wert: string;
  ergebnis: Ergebnis | null;
  lob: string;
}

export default function BinomischeFormeln() {
  const [stufe, setStufe] = useState<StufeId>(1);
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>(() => generiereSet(1, AUFGABEN_PRO_SET));
  const [antworten, setAntworten] = useState<Record<string, Antwort>>({});
  const [loesungAuf, setLoesungAuf] = useState<Record<string, boolean>>({});
  const [zeigeErklaerung, setZeigeErklaerung] = useState(true);

  const neueAufgaben = useCallback((s: StufeId) => {
    setAufgaben(generiereSet(s, AUFGABEN_PRO_SET));
    setAntworten({});
    setLoesungAuf({});
  }, []);

  useEffect(() => {
    neueAufgaben(stufe);
  }, [stufe, neueAufgaben]);

  const eingabeAendern = (id: string, wert: string) => {
    setAntworten((prev) => ({ ...prev, [id]: { wert, ergebnis: null, lob: '' } }));
  };

  const pruefen = (a: Aufgabe) => {
    const wert = antworten[a.id]?.wert ?? '';
    if (!wert.trim()) return;
    const ergebnis = pruefeAntwort(a, wert);
    const lob = LOB[Math.floor(Math.random() * LOB.length)];
    setAntworten((prev) => ({ ...prev, [a.id]: { wert, ergebnis, lob } }));
  };

  const richtig = aufgaben.filter((a) => antworten[a.id]?.ergebnis?.status === 'richtig').length;
  const alleRichtig = aufgaben.length > 0 && richtig === aufgaben.length;
  const stufeInfo = STUFEN.find((s) => s.id === stufe)!;
  const naechste = STUFEN.find((s) => s.id === stufe + 1);

  return (
    <TaskShell title="Binomische Formeln" width="wide">
      <div className="max-w-5xl mx-auto">
        {/* Erklärung */}
        <div className="mb-4 bg-white rounded-lg shadow border border-gray-200">
          <button
            type="button"
            onClick={() => setZeigeErklaerung((v) => !v)}
            className="w-full text-left px-4 py-2 font-semibold text-gray-800 flex justify-between items-center"
          >
            <span>Die binomischen Formeln</span>
            <span className="text-gray-500 text-sm">{zeigeErklaerung ? '▲ ausblenden' : '▼ einblenden'}</span>
          </button>
          {zeigeErklaerung && (
            <div className="px-4 pb-4 text-sm text-gray-700 space-y-2">
              <p>Die drei binomischen Formeln (wie auf der Merkhilfe):</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="bg-gray-50 rounded p-2 border border-gray-200 text-center">
                  <div className="text-xs font-semibold text-gray-600 mb-1">1. binomische Formel</div>
                  <InlineMath math={'(a + b)^{2} = a^{2} + 2ab + b^{2}'} />
                </div>
                <div className="bg-gray-50 rounded p-2 border border-gray-200 text-center">
                  <div className="text-xs font-semibold text-gray-600 mb-1">2. binomische Formel</div>
                  <InlineMath math={'(a - b)^{2} = a^{2} - 2ab + b^{2}'} />
                </div>
                <div className="bg-gray-50 rounded p-2 border border-gray-200 text-center">
                  <div className="text-xs font-semibold text-gray-600 mb-1">3. binomische Formel</div>
                  <InlineMath math={'(a + b)(a - b) = a^{2} - b^{2}'} />
                </div>
              </div>
              <p className="font-semibold pt-1">Ausmultiplizieren (von links nach rechts):</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Welche Formel passt? Zweimal Plus, zweimal Minus oder einmal Plus und einmal Minus?</li>
                <li>
                  Bestimme <InlineMath math="a" /> und <InlineMath math="b" />, z. B. bei{' '}
                  <InlineMath math="(3x - 2)^{2}" />: <InlineMath math={'a = 3x,\\ b = 2'} />.
                </li>
                <li>
                  Rechne <InlineMath math="a^{2}" />, <InlineMath math="2ab" /> und <InlineMath math="b^{2}" /> einzeln
                  aus: <InlineMath math={'(3x - 2)^{2} = 9x^{2} - 12x + 4'} />
                </li>
              </ol>
              <p className="font-semibold pt-1">Faktorisieren (von rechts nach links):</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>
                  Zwei Quadrate mit Minus dazwischen → 3. Formel:{' '}
                  <InlineMath math={'x^{2} - 25 = (x + 5)(x - 5)'} />
                </li>
                <li>
                  Drei Summanden → Wurzeln aus den Quadraten ziehen und das Mittelglied <InlineMath math="2ab" />{' '}
                  kontrollieren: <InlineMath math={'x^{2} + 6x + 9 = (x + 3)^{2}'} />
                </li>
              </ol>
              <div className="bg-red-50 rounded p-2 border border-red-200">
                <span className="font-semibold">Typischer Fehler: </span>
                <InlineMath math={'(a + b)^{2} \\neq a^{2} + b^{2}'} /> – das Mittelglied <InlineMath math="2ab" /> nicht
                vergessen!
              </div>
            </div>
          )}
        </div>

        {/* Stufen */}
        <div className="flex flex-wrap gap-2 mb-2">
          {STUFEN.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStufe(s.id)}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                stufe === s.id ? 'bg-orange-600 text-white shadow' : 'bg-orange-100 text-orange-900 hover:bg-orange-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-sm text-gray-700">{stufeInfo.beschreibung}</p>
          <button type="button" onClick={() => neueAufgaben(stufe)} className="bk-btn">
            Neue Aufgaben
          </button>
        </div>

        <div className="mb-3 px-3 py-2 bg-orange-100/70 border border-orange-200 rounded text-xs text-orange-900">
          <span className="font-semibold">Eingabe-Tipps:</span> Potenzen als x² oder x^2 · das Mal-Zeichen kannst du
          weglassen, z. B. <span className="font-mono">12xy</span> · beim Faktorisieren z. B.{' '}
          <span className="font-mono">(x+3)^2</span> oder <span className="font-mono">(x+5)(x-5)</span>.
        </div>

        {/* Aufgaben */}
        <div className="space-y-2">
          {aufgaben.map((a, index) => {
            const antwort = antworten[a.id] ?? { wert: '', ergebnis: null, lob: '' };
            const status = antwort.ergebnis?.status;
            const feld = status === 'richtig' ? true : status ? false : null;
            return (
              <div key={a.id} className="bg-white rounded p-3 shadow border-l-2 border-orange-300">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-600 whitespace-nowrap">{index + 1})</span>
                  <div className="text-base px-2 py-1 bg-gray-50 rounded border border-gray-200 overflow-x-auto">
                    <InlineMath math={`${a.aufgabeTex} =`} />
                  </div>
                  <input
                    type="text"
                    placeholder={stufeInfo.art === 'faktorisieren' ? 'faktorisiert …' : 'ausmultipliziert …'}
                    value={antwort.wert}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => eingabeAendern(a.id, e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') pruefen(a);
                    }}
                    className={`flex-1 min-w-[10rem] px-2 py-1 rounded border-2 border-gray-300 font-mono text-sm ${fieldCheckClass(feld)}`}
                  />
                  <button type="button" onClick={() => pruefen(a)} className="bk-btn whitespace-nowrap">
                    Prüfen
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoesungAuf((p) => ({ ...p, [a.id]: !p[a.id] }))}
                    className="bk-btn whitespace-nowrap"
                  >
                    {loesungAuf[a.id] ? 'Lösungsweg ✕' : 'Lösungsweg'}
                  </button>
                </div>

                {antwort.ergebnis && (
                  <p
                    className={`mt-2 text-sm font-semibold ${
                      status === 'richtig' ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {status === 'richtig'
                      ? `✓ ${antwort.lob}`
                      : `✗ ${(antwort.ergebnis as { hinweis: string }).hinweis}`}
                  </p>
                )}

                {loesungAuf[a.id] && (
                  <div className="mt-2 p-2 bg-orange-50 rounded border-l-2 border-orange-400 text-sm overflow-x-auto">
                    <div className="space-y-1">
                      {a.rechenweg.map((zeile, i) => (
                        <div key={i}>
                          <InlineMath math={zeile} />
                        </div>
                      ))}
                    </div>
                    <p className="font-semibold text-orange-900 mt-2">
                      Lösung: <InlineMath math={`${a.aufgabeTex} = ${a.loesungTex}`} />
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fortschritt */}
        <div className="mt-4 p-3 bg-white rounded shadow border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">
            Fortschritt: {richtig} / {aufgaben.length} richtig
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${aufgaben.length ? (richtig / aufgaben.length) * 100 : 0}%` }}
            />
          </div>
          {alleRichtig && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-green-700">
                🎉 Alle Aufgaben richtig – stark!
                {!naechste && ' Du hast die höchste Stufe geschafft.'}
              </p>
              {naechste && (
                <button type="button" onClick={() => setStufe(naechste.id)} className="bk-btn">
                  Weiter zu „{naechste.name}“
                </button>
              )}
              <button type="button" onClick={() => neueAufgaben(stufe)} className="bk-btn">
                Diese Stufe nochmal üben
              </button>
            </div>
          )}
        </div>
      </div>
    </TaskShell>
  );
}
