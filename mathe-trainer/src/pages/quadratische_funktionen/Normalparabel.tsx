import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

type Feedback = { text: string; type: 'correct' | 'incorrect' } | null;

interface MainTaskState {
  a: number;
  colorName: string;
  correctAnswers: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
  options3: string[];
}

interface MatchItem {
  a: number;
  color: { name: string; rgb: number[] };
  equation: string;
}

interface MatchTaskState {
  items: MatchItem[];
  shuffledEquations: string[];
}

interface GuessTaskState {
  a: number;
  colorName: string;
}

interface ReverseTaskState {
  form: 'gestreckt' | 'gestaucht';
  direction: 'oben' | 'unten';
  correctA: number;
  options: number[];
}

const POSSIBLE_A = [
  -5, -4, -3.5, -3, -2.5, -2, -1.5, -1.25, -0.75, -0.5, -0.25,
  0.25, 0.5, 0.75, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 5
];

const PARABOLA_COLORS = [
  { name: 'blaue', rgb: [25, 85, 220] },
  { name: 'rote', rgb: [220, 38, 38] },
  { name: 'grüne', rgb: [22, 163, 74] },
  { name: 'orangene', rgb: [234, 88, 12] },
  { name: 'violette', rgb: [147, 51, 234] },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistinct<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function randomA(): number {
  return POSSIBLE_A[Math.floor(Math.random() * POSSIBLE_A.length)];
}

function randomColor() {
  return PARABOLA_COLORS[Math.floor(Math.random() * PARABOLA_COLORS.length)];
}

function setSquareView(api: any, containerId: string, xHalf = 5) {
  const container = document.getElementById(containerId);
  let yHalf = xHalf;
  if (container && container.clientWidth > 0 && container.clientHeight > 0) {
    yHalf = xHalf * (container.clientHeight / container.clientWidth);
  }
  api.setCoordSystem(-xHalf, xHalf, -yHalf, yHalf);
}

function injectApplet(containerId: string, width: number, height: number, onLoad: (api: any) => void) {
  const params: any = {
    appName: 'classic',
    width,
    height,
    showToolBar: false,
    showAlgebraInput: false,
    showMenuBar: false,
    perspective: 'G',
    useBrowserForJS: true,
    enableShiftDragZoom: true,
    showResetIcon: true,
    showZoomButtons: true,
    appletOnLoad: onLoad,
  };
  try {
    const applet = new window.GGBApplet(params, true);
    applet.inject(containerId);
  } catch (e) {
    console.error(`GeoGebra Error (${containerId}):`, e);
  }
}

// Berechnet eine an die Bildschirmbreite angepasste, aber begrenzte Applet-Größe,
// damit der Graph zentriert und deutlich kleiner als zuvor dargestellt wird.
function getResponsiveSize(desiredWidth: number, desiredHeight: number) {
  const pagePadding = 64; // seitliche Innenabstände von Seite + Karte
  const maxAvailable = typeof window !== 'undefined' ? window.innerWidth - pagePadding : desiredWidth;
  const width = Math.max(260, Math.min(desiredWidth, maxAvailable));
  const height = Math.round(width * (desiredHeight / desiredWidth));
  return { width, height };
}

export default function Normalparabel() {
  const [score, setScore] = useState(0);

  // --- Schieberegler-Sandbox ---
  const sandboxApiRef = useRef<any>(null);
  const [sandboxA, setSandboxA] = useState(1);

  // --- Aufgabe 1: Eigenschaften ablesen (die bisherigen 4 Fragen) ---
  const ggbApiRef = useRef<any>(null);
  const [mainTask, setMainTask] = useState<MainTaskState | null>(null);
  const [mainAnswered, setMainAnswered] = useState<{ 1: boolean; 2: boolean; 3: boolean; 4: boolean }>({ 1: false, 2: false, 3: false, 4: false });
  const [mainFeedback, setMainFeedback] = useState<{ 1: Feedback; 2: Feedback; 3: Feedback; 4: Feedback }>({ 1: null, 2: null, 3: null, 4: null });
  const [mainShowSolution, setMainShowSolution] = useState(false);

  // --- Aufgabe 2: Zuordnungsaufgabe ---
  const matchApiRef = useRef<any>(null);
  const [matchTask, setMatchTask] = useState<MatchTaskState | null>(null);
  const [matchSelections, setMatchSelections] = useState<{ [idx: number]: string }>({});
  const [matchChecked, setMatchChecked] = useState(false);
  const [matchScored, setMatchScored] = useState(false);

  // --- Aufgabe 3: Schätz-Modus ---
  const guessApiRef = useRef<any>(null);
  const [guessTask, setGuessTask] = useState<GuessTaskState | null>(null);
  const [guessInput, setGuessInput] = useState('');
  const [guessFeedback, setGuessFeedback] = useState<Feedback>(null);
  const [guessSolved, setGuessSolved] = useState(false);
  const [guessShowSolution, setGuessShowSolution] = useState(false);

  // --- Aufgabe 4: Umkehraufgabe ---
  const [reverseTask, setReverseTask] = useState<ReverseTaskState | null>(null);
  const [reverseFeedback, setReverseFeedback] = useState<Feedback>(null);
  const [reverseSolved, setReverseSolved] = useState(false);

  const [appletsLoaded, setAppletsLoaded] = useState({ main: false, match: false, guess: false, sandbox: false });

  // Größen der Graphen: groß und gut lesbar, nur an die Bildschirmbreite gedeckelt
  const sandboxSize = getResponsiveSize(500, 320);
  const mainSize = getResponsiveSize(560, 370);
  const matchSize = getResponsiveSize(500, 320);
  const guessSize = getResponsiveSize(500, 320);

  useEffect(() => {
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');

    const initAll = () => {
      if (!window.GGBApplet) return;

      injectApplet('ggb-sandbox', sandboxSize.width, sandboxSize.height, (api: any) => {
        sandboxApiRef.current = api;
        initSandbox(api);
        setAppletsLoaded(l => ({ ...l, sandbox: true }));
      });

      injectApplet('ggb-normalparabel', mainSize.width, mainSize.height, (api: any) => {
        ggbApiRef.current = api;
        generateMainTask(api);
        setAppletsLoaded(l => ({ ...l, main: true }));
      });

      injectApplet('ggb-zuordnung', matchSize.width, matchSize.height, (api: any) => {
        matchApiRef.current = api;
        generateMatchTask(api);
        setAppletsLoaded(l => ({ ...l, match: true }));
      });

      injectApplet('ggb-schaetz', guessSize.width, guessSize.height, (api: any) => {
        guessApiRef.current = api;
        generateGuessTask(api);
        setAppletsLoaded(l => ({ ...l, guess: true }));
      });

      generateReverseTask();
    };

    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://www.geogebra.org/apps/deployggb.js';
      script.async = true;
      script.onload = () => setTimeout(initAll, 100);
      document.body.appendChild(script);
    } else if (window.GGBApplet) {
      setTimeout(initAll, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------
  // Sandbox
  // ---------------------------------------------------------------------
  const initSandbox = (api: any) => {
    try {
      api.evalCommand('a=Slider(-5,5,0.25)');
      api.setValue('a', 1);
      api.evalCommand('f(x)=a*x^2');
      api.setColor('f', 25, 85, 220);
      api.evalCommand('n(x)=x^2');
      api.setLineStyle('n', 1);
      api.setColor('n', 150, 150, 150);
      setSquareView(api, 'ggb-sandbox');
      api.registerObjectUpdateListener('a', () => {
        setSandboxA(api.getValue('a'));
      });
      setSandboxA(api.getValue('a'));
    } catch (e) {
      console.error('GeoGebra Sandbox Error:', e);
    }
  };

  const resetSandbox = () => {
    if (sandboxApiRef.current) {
      sandboxApiRef.current.setValue('a', 1);
      setSandboxA(1);
    }
  };

  // ---------------------------------------------------------------------
  // Aufgabe 1: Eigenschaften ablesen
  // ---------------------------------------------------------------------
  const generateMainTask = (apiOverride?: any) => {
    const api = apiOverride || ggbApiRef.current;
    const a = randomA();
    const color = randomColor();

    const correctAnswers = {
      1: Math.abs(a) > 1 ? 'gestreckt' : 'gestaucht',
      2: a > 0 ? 'oben' : 'unten',
      3: `y = ${a}x²`,
      4: a > 0 ? 'niedrigster' : 'hoechster'
    };

    let options3 = [correctAnswers[3]];
    options3.push(`y = ${-a}x²`);
    options3.push(`y = x²`);
    options3 = shuffle(options3);

    setMainTask({ a, colorName: color.name, correctAnswers, options3 });
    setMainAnswered({ 1: false, 2: false, 3: false, 4: false });
    setMainFeedback({ 1: null, 2: null, 3: null, 4: null });
    setMainShowSolution(false);

    if (api) {
      try {
        api.reset();
        api.evalCommand(`f(x) = ${a}*x^2`);
        api.setColor('f', color.rgb[0], color.rgb[1], color.rgb[2]);
        api.evalCommand('n(x) = x^2');
        api.setLineStyle('n', 1);
        api.setColor('n', 150, 150, 150);
        api.evalCommand('S=(0,0)');
        api.setLabelVisible('S', true);
        setSquareView(api, 'ggb-normalparabel');
      } catch (e) {
        console.error('GeoGebra update error:', e);
      }
    }
  };

  const checkMainAnswer = (qNumber: 1 | 2 | 3 | 4, answer: string) => {
    if (!mainTask) return;
    if (answer === mainTask.correctAnswers[qNumber]) {
      setMainFeedback(f => ({ ...f, [qNumber]: { text: 'Richtig!', type: 'correct' } }));
      setMainAnswered(a => ({ ...a, [qNumber]: true }));
      setScore(s => s + 1);
    } else {
      setMainFeedback(f => ({ ...f, [qNumber]: { text: 'Leider falsch. Versuch es erneut!', type: 'incorrect' } }));
      setScore(s => s - 0.5);
    }
  };

  // ---------------------------------------------------------------------
  // Aufgabe 2: Zuordnungsaufgabe
  // ---------------------------------------------------------------------
  const generateMatchTask = (apiOverride?: any) => {
    const api = apiOverride || matchApiRef.current;
    const aValues = pickDistinct(POSSIBLE_A, 3);
    const colors = pickDistinct(PARABOLA_COLORS, 3);
    const items: MatchItem[] = aValues.map((a, idx) => ({
      a,
      color: colors[idx],
      equation: `y = ${a}x²`,
    }));
    const shuffledEquations = shuffle(items.map(i => i.equation));

    setMatchTask({ items, shuffledEquations });
    setMatchSelections({});
    setMatchChecked(false);
    setMatchScored(false);

    if (api) {
      try {
        api.reset();
        items.forEach((item, idx) => {
          const fname = `m${idx}`;
          api.evalCommand(`${fname}(x) = ${item.a}*x^2`);
          api.setColor(fname, item.color.rgb[0], item.color.rgb[1], item.color.rgb[2]);
        });
        api.evalCommand('n(x) = x^2');
        api.setLineStyle('n', 1);
        api.setColor('n', 150, 150, 150);
        setSquareView(api, 'ggb-zuordnung');
      } catch (e) {
        console.error('GeoGebra Zuordnung Error:', e);
      }
    }
  };

  const checkMatchTask = () => {
    if (!matchTask) return;
    if (!matchScored) {
      const correctCount = matchTask.items.filter((item, idx) => matchSelections[idx] === item.equation).length;
      setScore(s => s + correctCount - (matchTask.items.length - correctCount) * 0.5);
      setMatchScored(true);
    }
    setMatchChecked(true);
  };

  // ---------------------------------------------------------------------
  // Aufgabe 3: Schätz-Modus
  // ---------------------------------------------------------------------
  const generateGuessTask = (apiOverride?: any) => {
    const api = apiOverride || guessApiRef.current;
    const a = randomA();
    const color = randomColor();

    setGuessTask({ a, colorName: color.name });
    setGuessInput('');
    setGuessFeedback(null);
    setGuessSolved(false);
    setGuessShowSolution(false);

    if (api) {
      try {
        api.reset();
        api.evalCommand(`g(x) = ${a}*x^2`);
        api.setColor('g', color.rgb[0], color.rgb[1], color.rgb[2]);
        api.evalCommand('n(x) = x^2');
        api.setLineStyle('n', 1);
        api.setColor('n', 150, 150, 150);
        setSquareView(api, 'ggb-schaetz');
      } catch (e) {
        console.error('GeoGebra Schätzen Error:', e);
      }
    }
  };

  const checkGuess = () => {
    if (!guessTask) return;
    const parsed = Number(guessInput.replace(',', '.'));
    if (Number.isNaN(parsed) || guessInput.trim() === '') {
      setGuessFeedback({ text: 'Bitte gib eine Zahl ein.', type: 'incorrect' });
      return;
    }
    const diff = Math.abs(parsed - guessTask.a);
    if (diff <= 0.26) {
      setGuessFeedback({ text: 'Richtig!', type: 'correct' });
      if (!guessSolved) {
        setScore(s => s + 1);
        setGuessSolved(true);
      }
    } else {
      const hint = parsed > guessTask.a ? 'Dein Tipp ist zu hoch.' : 'Dein Tipp ist zu niedrig.';
      setGuessFeedback({ text: `Leider falsch. ${hint}`, type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  // ---------------------------------------------------------------------
  // Aufgabe 4: Umkehraufgabe
  // ---------------------------------------------------------------------
  const generateReverseTask = () => {
    const form: 'gestreckt' | 'gestaucht' = Math.random() < 0.5 ? 'gestreckt' : 'gestaucht';
    const direction: 'oben' | 'unten' = Math.random() < 0.5 ? 'oben' : 'unten';
    const matchesProps = (v: number) => {
      const formOk = form === 'gestreckt' ? Math.abs(v) > 1 : Math.abs(v) < 1;
      const dirOk = direction === 'oben' ? v > 0 : v < 0;
      return formOk && dirOk;
    };
    const correctPool = POSSIBLE_A.filter(matchesProps);
    const correctA = correctPool[Math.floor(Math.random() * correctPool.length)];
    const distractorPool = POSSIBLE_A.filter(v => v !== correctA && !matchesProps(v));
    const distractors = pickDistinct(distractorPool, 3);
    const options = shuffle([correctA, ...distractors]);

    setReverseTask({ form, direction, correctA, options });
    setReverseFeedback(null);
    setReverseSolved(false);
  };

  const checkReverse = (value: number) => {
    if (!reverseTask) return;
    if (value === reverseTask.correctA) {
      setReverseFeedback({ text: 'Richtig!', type: 'correct' });
      if (!reverseSolved) {
        setScore(s => s + 1);
        setReverseSolved(true);
      }
    } else {
      setReverseFeedback({ text: 'Leider falsch. Versuch es erneut!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  // ---------------------------------------------------------------------
  // Neue Runde für alle Aufgaben (außer Sandbox, die bleibt zum Üben stehen)
  // ---------------------------------------------------------------------
  const generateNewRound = () => {
    generateMainTask();
    generateMatchTask();
    generateGuessTask();
    generateReverseTask();
  };

  const allReady = appletsLoaded.main && appletsLoaded.match && appletsLoaded.guess;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-5 max-w-3xl w-full">
        <h1 className="text-xl font-bold text-slate-800 mb-4 text-center">Eigenschaften von Parabeln</h1>

        {/* Schieberegler-Sandbox */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <h2 className="text-base font-bold text-slate-800 mb-1">Entdecke den Einfluss von a</h2>
          <p className="text-xs text-slate-600 mb-3">
            Ziehe den Punkt auf dem Schieberegler im Graphen und beobachte, wie sich die blaue Parabel im Vergleich zur grauen Normalparabel verändert.
          </p>
          <div className="mb-3 border rounded-lg overflow-hidden shadow-inner bg-white flex justify-center">
            <div id="ggb-sandbox" style={{ width: sandboxSize.width, height: sandboxSize.height }}></div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded font-bold text-sm">
              f(x) = {Math.round(sandboxA * 100) / 100}x²
            </div>
            <button onClick={resetSandbox} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm">
              Regler zurücksetzen
            </button>
          </div>
        </div>

        {/* Aufgabe 1: Eigenschaften ablesen */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <h2 className="text-base font-bold text-slate-800 mb-2">Aufgabe 1: Eigenschaften ablesen</h2>

          <div className="mb-2 border rounded-lg overflow-hidden shadow-inner bg-white flex justify-center">
            <div id="ggb-normalparabel" style={{ width: mainSize.width, height: mainSize.height }}></div>
          </div>

          <div className="text-center mb-2 text-slate-600 text-xs">
            Die graue Parabel ist die Normalparabel f(x) = x².
          </div>

          {mainTask && (
            <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
              <div className="py-1.5">
                <p className="font-semibold text-sm mb-1">1. Ist die {mainTask.colorName} Parabel im Vergleich zur grauen Normalparabel gestreckt oder gestaucht?</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <button onClick={() => checkMainAnswer(1, 'gestreckt')} className="btn-option" disabled={mainAnswered[1]}>Gestreckt (|a| &gt; 1)</button>
                  <button onClick={() => checkMainAnswer(1, 'gestaucht')} className="btn-option" disabled={mainAnswered[1]}>Gestaucht (|a| &lt; 1)</button>
                </div>
                {mainFeedback[1] && <p className={`text-center font-bold text-sm mt-1 ${mainFeedback[1]!.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{mainFeedback[1]!.text}</p>}
              </div>

              <div className="py-1.5">
                <p className="font-semibold text-sm mb-1">2. Ist die Parabel nach oben oder unten geöffnet?</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <button onClick={() => checkMainAnswer(2, 'oben')} className="btn-option" disabled={mainAnswered[2]}>Nach oben (a &gt; 0)</button>
                  <button onClick={() => checkMainAnswer(2, 'unten')} className="btn-option" disabled={mainAnswered[2]}>Nach unten (a &lt; 0)</button>
                </div>
                {mainFeedback[2] && <p className={`text-center font-bold text-sm mt-1 ${mainFeedback[2]!.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{mainFeedback[2]!.text}</p>}
              </div>

              <div className="py-1.5">
                <p className="font-semibold text-sm mb-1">3. Wie lautet die Funktionsgleichung?</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {mainTask.options3.map((opt, idx) => (
                    <button key={idx} onClick={() => checkMainAnswer(3, opt)} className="btn-option" disabled={mainAnswered[3]}>{opt}</button>
                  ))}
                </div>
                {mainFeedback[3] && <p className={`text-center font-bold text-sm mt-1 ${mainFeedback[3]!.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{mainFeedback[3]!.text}</p>}
              </div>

              <div className="py-1.5">
                <p className="font-semibold text-sm mb-1">4. Ist der Scheitelpunkt der höchste oder niedrigste Punkt?</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <button onClick={() => checkMainAnswer(4, 'niedrigster')} className="btn-option" disabled={mainAnswered[4]}>Niedrigster (Tiefpunkt)</button>
                  <button onClick={() => checkMainAnswer(4, 'hoechster')} className="btn-option" disabled={mainAnswered[4]}>Höchster (Hochpunkt)</button>
                </div>
                {mainFeedback[4] && <p className={`text-center font-bold text-sm mt-1 ${mainFeedback[4]!.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{mainFeedback[4]!.text}</p>}
              </div>
            </div>
          )}

          {mainTask && (
            <>
              <div className="text-center pt-2">
                <button
                  onClick={() => setMainShowSolution(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm"
                  disabled={mainShowSolution}
                >
                  Lösung anzeigen
                </button>
              </div>

              {mainShowSolution && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-900 text-sm">
                  <h3 className="font-bold mb-2">Lösung:</h3>
                  <p>Der Formfaktor ist <strong>a = {mainTask.a}</strong>.</p>
                  <ul className="list-disc list-inside space-y-1 mt-1.5">
                    <li>
                      <strong>Frage 1 (Form):</strong> Der Betrag von a ist |{mainTask.a}| = {Math.abs(mainTask.a)}.
                      Da |a| {Math.abs(mainTask.a) > 1 ? '>' : '<'} 1, ist die Parabel <strong>{mainTask.correctAnswers[1]}</strong>.
                    </li>
                    <li>
                      <strong>Frage 2 (Öffnung):</strong> Da a {mainTask.a > 0 ? '>' : '<'} 0, ist die Parabel <strong>nach {mainTask.correctAnswers[2]} geöffnet</strong>.
                    </li>
                    <li>
                      <strong>Frage 3 (Gleichung):</strong> Aus den Eigenschaften folgt die Gleichung <strong>{mainTask.correctAnswers[3]}</strong>.
                    </li>
                    <li>
                      <strong>Frage 4 (Scheitelpunkt):</strong> Weil die Parabel nach {mainTask.correctAnswers[2]} geöffnet ist, ist der Scheitelpunkt S ihr <strong>{mainTask.correctAnswers[4]}ster Punkt</strong>.
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Aufgabe 2: Zuordnungsaufgabe */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <h2 className="text-base font-bold text-slate-800 mb-2">Aufgabe 2: Parabeln zuordnen</h2>
          <p className="text-xs text-slate-600 mb-3 text-center">Ordne jeder farbigen Parabel die passende Funktionsgleichung zu.</p>

          <div className="mb-3 border rounded-lg overflow-hidden shadow-inner bg-white flex justify-center">
            <div id="ggb-zuordnung" style={{ width: matchSize.width, height: matchSize.height }}></div>
          </div>

          {matchTask && (
            <div className="space-y-2 text-sm">
              {matchTask.items.map((item, idx) => {
                const isCorrect = matchChecked && matchSelections[idx] === item.equation;
                const isWrong = matchChecked && matchSelections[idx] && matchSelections[idx] !== item.equation;
                return (
                  <div key={idx} className="flex items-center gap-2 justify-center flex-wrap">
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: `rgb(${item.color.rgb.join(',')})` }}
                    ></span>
                    <span className="font-medium">{item.color.name.charAt(0).toUpperCase() + item.color.name.slice(1)} Parabel:</span>
                    <select
                      value={matchSelections[idx] || ''}
                      onChange={(e) => setMatchSelections(s => ({ ...s, [idx]: e.target.value }))}
                      className="border border-slate-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="" disabled>Bitte wählen…</option>
                      {matchTask.shuffledEquations.map((eq, i2) => (
                        <option key={i2} value={eq}>{eq}</option>
                      ))}
                    </select>
                    {isCorrect && <span className="text-green-600 font-bold">✓</span>}
                    {isWrong && <span className="text-red-600 font-bold">✗ (richtig: {item.equation})</span>}
                  </div>
                );
              })}
              <div className="text-center pt-1">
                <button onClick={checkMatchTask} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm">
                  Auswerten
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Aufgabe 3: Schätz-Modus */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <h2 className="text-base font-bold text-slate-800 mb-2">Aufgabe 3: Schätze den Wert von a</h2>
          <p className="text-xs text-slate-600 mb-3 text-center">Schätze anhand des Graphen, welchen Wert der Formfaktor a hat (Toleranz: ±0,25).</p>

          <div className="mb-3 border rounded-lg overflow-hidden shadow-inner bg-white flex justify-center">
            <div id="ggb-schaetz" style={{ width: guessSize.width, height: guessSize.height }}></div>
          </div>

          {guessTask && (
            <div className="text-center text-sm">
              <div className="flex justify-center items-center gap-2 flex-wrap mb-2">
                <span className="font-medium">a =</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') checkGuess(); }}
                  className="border border-slate-300 rounded px-2 py-1 w-24 text-center text-sm"
                  placeholder="z. B. 2"
                />
                <button onClick={checkGuess} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm">
                  Prüfen
                </button>
              </div>
              {guessFeedback && (
                <p className={`font-bold mb-2 ${guessFeedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{guessFeedback.text}</p>
              )}
              <button
                onClick={() => setGuessShowSolution(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm"
                disabled={guessShowSolution}
              >
                Lösung anzeigen
              </button>
              {guessShowSolution && (
                <p className="mt-2 text-green-900 bg-green-50 border border-green-200 rounded-lg p-2 inline-block">
                  Der tatsächliche Wert ist <strong>a = {guessTask.a}</strong>.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Aufgabe 4: Umkehraufgabe */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <h2 className="text-base font-bold text-slate-800 mb-2">Aufgabe 4: Finde die passende Gleichung</h2>

          {reverseTask && (
            <div className="text-center text-sm">
              <p className="mb-3">
                Gesucht ist die Gleichung einer Parabel, die im Vergleich zur Normalparabel{' '}
                <strong>{reverseTask.form}</strong> ist und nach <strong>{reverseTask.direction}</strong> geöffnet ist.
              </p>
              <div className="flex gap-2 justify-center flex-wrap mb-2">
                {reverseTask.options.map((v, idx) => (
                  <button key={idx} onClick={() => checkReverse(v)} className="btn-option">{`y = ${v}x²`}</button>
                ))}
              </div>
              {reverseFeedback && (
                <p className={`font-bold ${reverseFeedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{reverseFeedback.text}</p>
              )}
            </div>
          )}
        </div>

        {/* Steuerung */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <div className="flex flex-wrap justify-center gap-3 items-center">
            <button
              onClick={generateNewRound}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded shadow transition-colors disabled:opacity-50 text-sm"
              disabled={!allReady}
            >
              Neue Aufgaben
            </button>
            <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded font-bold text-sm">
              Punkte: {score}
            </div>
          </div>
          {!allReady && (
            <p className="text-center text-xs text-slate-500 mt-2">Übungen werden geladen…</p>
          )}
        </div>
      </div>
      <style>{`
        .btn-option {
          background-color: white;
          border: 1px solid #cbd5e1;
          padding: 0.3rem 0.7rem;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.8125rem;
          color: #334155;
          transition: all 0.2s;
        }
        .btn-option:hover:not(:disabled) {
          background-color: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }
        .btn-option:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
