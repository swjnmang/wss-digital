import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

type Feedback = { text: string; type: 'correct' | 'incorrect' } | null;
type Direction2 = 'links' | 'rechts';
type Direction3 = 'oben' | 'unten';

interface ShiftXTaskState {
  d: number;
  colorName: string;
  direction: Direction2;
  absD: number;
  correctEquation: string;
  options: string[];
}

interface ShiftYTaskState {
  c: number;
  colorName: string;
  direction: Direction3;
  absC: number;
  correctEquation: string;
  options: string[];
}

interface CombinedTaskState {
  d: number;
  c: number;
  colorName: string;
}

interface MatchItem {
  d: number;
  c: number;
  color: { name: string; rgb: number[] };
  equation: string;
}

interface MatchTaskState {
  items: MatchItem[];
  shuffledEquations: string[];
}

interface ReverseOption {
  label: string;
  d: number;
  c: number;
}

interface ReverseTaskState {
  d: number;
  c: number;
  description: string;
  options: ReverseOption[];
  correctIndex: number;
}

const SHIFT_VALUES = [-5, -4, -3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3, 4, 5];

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

function randomShift(): number {
  return SHIFT_VALUES[Math.floor(Math.random() * SHIFT_VALUES.length)];
}

function randomColor() {
  return PARABOLA_COLORS[Math.floor(Math.random() * PARABOLA_COLORS.length)];
}

function fmt(n: number): number {
  return Math.round(n * 100) / 100;
}

function signStr(n: number): '+' | '-' {
  return n >= 0 ? '+' : '-';
}

function parseSignedInput(raw: string): number {
  return Number(raw.trim().replace(',', '.').replace(/[−–—‐]/g, '-'));
}

// Baut die "reine" Gleichung für eine isolierte x-Verschiebung: y = (x + d)²
function equationXOnly(d: number): string {
  return `y = (x ${signStr(d)} ${Math.abs(fmt(d))})²`;
}

// Baut die "reine" Gleichung für eine isolierte y-Verschiebung: y = x² + c
function equationYOnly(c: number): string {
  return `y = x² ${signStr(c)} ${Math.abs(fmt(c))}`;
}

// Kombinierte Gleichung: y = (x + d)² + c
function equationCombined(d: number, c: number): string {
  return `y = (x ${signStr(d)} ${Math.abs(fmt(d))})² ${signStr(c)} ${Math.abs(fmt(c))}`;
}

function equationCombinedLatex(d: number, c: number): string {
  return `y = \\left(x ${signStr(d)} ${Math.abs(fmt(d))}\\right)^2 ${signStr(c)} ${Math.abs(fmt(c))}`;
}

function setSquareView(api: any, containerId: string, xHalf = 6) {
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
    showResetIcon: false,
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

function getResponsiveSize(desiredWidth: number, desiredHeight: number) {
  const pagePadding = 64;
  const maxAvailable = typeof window !== 'undefined' ? window.innerWidth - pagePadding : desiredWidth;
  const width = Math.max(260, Math.min(desiredWidth, maxAvailable));
  const height = Math.round(width * (desiredHeight / desiredWidth));
  return { width, height };
}

// Kleiner Umschalter für ein Vorzeichen, damit man das Vorzeichen wählen kann,
// statt es im Kopf umdrehen und mittippen zu müssen.
const SignToggle = ({ value, onChange }: { value: '+' | '-' | null; onChange: (v: '+' | '-') => void }) => (
  <div className="inline-flex shrink-0 rounded-md overflow-hidden border-2 border-slate-300">
    <button
      type="button"
      onClick={() => onChange('+')}
      aria-label="Plus"
      className={`w-6 h-9 flex items-center justify-center text-sm font-bold transition-colors ${value === '+' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
    >
      +
    </button>
    <button
      type="button"
      onClick={() => onChange('-')}
      aria-label="Minus"
      className={`w-6 h-9 flex items-center justify-center text-sm font-bold transition-colors border-l-2 border-slate-300 ${value === '-' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
    >
      −
    </button>
  </div>
);

// Kleiner Ein-/Ausklapp-Button für kurze Konzept-Erklärungen.
const ExplainToggle = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
  >
    <i className={`fa-solid ${open ? 'fa-circle-minus' : 'fa-circle-info'}`}></i>
    {open ? 'Erklärung ausblenden' : 'Kurz erklärt'}
  </button>
);

export default function VerschiebungNormalparabel() {
  const [score, setScore] = useState(0);

  // --- Sandbox: freies Erkunden von d und c ---
  const sandboxApiRef = useRef<any>(null);
  const [sandboxD, setSandboxD] = useState(0);
  const [sandboxC, setSandboxC] = useState(0);
  const [sandboxExplainOpen, setSandboxExplainOpen] = useState(false);

  // --- Aufgabe 1: Verschiebung in x-Richtung (isoliert) ---
  const shiftXApiRef = useRef<any>(null);
  const [shiftXTask, setShiftXTask] = useState<ShiftXTaskState | null>(null);
  const [shiftXDirAnswered, setShiftXDirAnswered] = useState(false);
  const [shiftXDirFeedback, setShiftXDirFeedback] = useState<Feedback>(null);
  const [shiftXAbsInput, setShiftXAbsInput] = useState('');
  const [shiftXAbsAnswered, setShiftXAbsAnswered] = useState(false);
  const [shiftXAbsFeedback, setShiftXAbsFeedback] = useState<Feedback>(null);
  const [shiftXEqAnswered, setShiftXEqAnswered] = useState(false);
  const [shiftXEqFeedback, setShiftXEqFeedback] = useState<Feedback>(null);
  const [shiftXShowSolution, setShiftXShowSolution] = useState(false);
  const [shiftXExplainOpen, setShiftXExplainOpen] = useState(false);

  // --- Aufgabe 2: Verschiebung in y-Richtung (isoliert) ---
  const shiftYApiRef = useRef<any>(null);
  const [shiftYTask, setShiftYTask] = useState<ShiftYTaskState | null>(null);
  const [shiftYDirAnswered, setShiftYDirAnswered] = useState(false);
  const [shiftYDirFeedback, setShiftYDirFeedback] = useState<Feedback>(null);
  const [shiftYAbsInput, setShiftYAbsInput] = useState('');
  const [shiftYAbsAnswered, setShiftYAbsAnswered] = useState(false);
  const [shiftYAbsFeedback, setShiftYAbsFeedback] = useState<Feedback>(null);
  const [shiftYEqAnswered, setShiftYEqAnswered] = useState(false);
  const [shiftYEqFeedback, setShiftYEqFeedback] = useState<Feedback>(null);
  const [shiftYShowSolution, setShiftYShowSolution] = useState(false);
  const [shiftYExplainOpen, setShiftYExplainOpen] = useState(false);

  // --- Aufgabe 3: Kombinierte Verschiebung ---
  const combinedApiRef = useRef<any>(null);
  const [combinedTask, setCombinedTask] = useState<CombinedTaskState | null>(null);
  const [combinedXsInput, setCombinedXsInput] = useState('');
  const [combinedYsInput, setCombinedYsInput] = useState('');
  const [combinedVertexAnswered, setCombinedVertexAnswered] = useState(false);
  const [combinedVertexFeedback, setCombinedVertexFeedback] = useState<Feedback>(null);
  const [combinedDSign, setCombinedDSign] = useState<'+' | '-' | null>(null);
  const [combinedDAbs, setCombinedDAbs] = useState('');
  const [combinedCSign, setCombinedCSign] = useState<'+' | '-' | null>(null);
  const [combinedCAbs, setCombinedCAbs] = useState('');
  const [combinedEqAnswered, setCombinedEqAnswered] = useState(false);
  const [combinedEqFeedback, setCombinedEqFeedback] = useState<Feedback>(null);
  const [combinedShowSolution, setCombinedShowSolution] = useState(false);
  const [combinedExplainOpen, setCombinedExplainOpen] = useState(false);

  // --- Aufgabe 4: Zuordnungsaufgabe ---
  const matchApiRef = useRef<any>(null);
  const [matchTask, setMatchTask] = useState<MatchTaskState | null>(null);
  const [matchSelections, setMatchSelections] = useState<{ [idx: number]: string }>({});
  const [matchChecked, setMatchChecked] = useState(false);
  const [matchScored, setMatchScored] = useState(false);
  const [matchExplainOpen, setMatchExplainOpen] = useState(false);

  // --- Aufgabe 5: Umkehraufgabe (verbal -> Gleichung) ---
  const [reverseTask, setReverseTask] = useState<ReverseTaskState | null>(null);
  const [reverseFeedback, setReverseFeedback] = useState<Feedback>(null);
  const [reverseSolved, setReverseSolved] = useState(false);
  const [reverseExplainOpen, setReverseExplainOpen] = useState(false);

  const [appletsLoaded, setAppletsLoaded] = useState({ shiftX: false, shiftY: false, combined: false, match: false });

  const sandboxSize = getResponsiveSize(560, 340);
  const shiftXSize = getResponsiveSize(500, 320);
  const shiftYSize = getResponsiveSize(500, 320);
  const combinedSize = getResponsiveSize(500, 320);
  const matchSize = getResponsiveSize(500, 320);

  useEffect(() => {
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');

    const initAll = () => {
      if (!window.GGBApplet) return;

      injectApplet('ggb-verschiebung-sandbox', sandboxSize.width, sandboxSize.height, (api: any) => {
        sandboxApiRef.current = api;
        initSandbox(api);
      });

      injectApplet('ggb-verschiebung-x', shiftXSize.width, shiftXSize.height, (api: any) => {
        shiftXApiRef.current = api;
        generateShiftXTask(api);
        setAppletsLoaded(l => ({ ...l, shiftX: true }));
      });

      injectApplet('ggb-verschiebung-y', shiftYSize.width, shiftYSize.height, (api: any) => {
        shiftYApiRef.current = api;
        generateShiftYTask(api);
        setAppletsLoaded(l => ({ ...l, shiftY: true }));
      });

      injectApplet('ggb-verschiebung-kombiniert', combinedSize.width, combinedSize.height, (api: any) => {
        combinedApiRef.current = api;
        generateCombinedTask(api);
        setAppletsLoaded(l => ({ ...l, combined: true }));
      });

      injectApplet('ggb-verschiebung-zuordnung', matchSize.width, matchSize.height, (api: any) => {
        matchApiRef.current = api;
        generateMatchTask(api);
        setAppletsLoaded(l => ({ ...l, match: true }));
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
      api.evalCommand('d=Slider(-5,5,0.5)');
      api.setValue('d', 0);
      api.evalCommand('c=Slider(-5,5,0.5)');
      api.setValue('c', 0);
      api.evalCommand('f(x)=(x+d)^2+c');
      api.setColor('f', 25, 85, 220);
      api.setLineThickness('f', 3);
      api.evalCommand('n(x)=x^2');
      api.setLineStyle('n', 1);
      api.setColor('n', 150, 150, 150);
      api.evalCommand('S=(-d,c)');
      api.setColor('S', 220, 38, 38);
      api.setPointSize('S', 6);
      api.setLabelVisible('S', true);
      setSquareView(api, 'ggb-verschiebung-sandbox', 6);
      api.registerObjectUpdateListener('d', () => setSandboxD(api.getValue('d')));
      api.registerObjectUpdateListener('c', () => setSandboxC(api.getValue('c')));
      setSandboxD(api.getValue('d'));
      setSandboxC(api.getValue('c'));
    } catch (e) {
      console.error('GeoGebra Sandbox Error:', e);
    }
  };

  const resetSandbox = () => {
    if (sandboxApiRef.current) {
      sandboxApiRef.current.setValue('d', 0);
      sandboxApiRef.current.setValue('c', 0);
      setSandboxD(0);
      setSandboxC(0);
    }
  };

  // ---------------------------------------------------------------------
  // Aufgabe 1: Verschiebung in x-Richtung
  // ---------------------------------------------------------------------
  const generateShiftXTask = (apiOverride?: any) => {
    const api = apiOverride || shiftXApiRef.current;
    const d = randomShift();
    const color = randomColor();
    const direction: Direction2 = d > 0 ? 'links' : 'rechts';
    const absD = Math.abs(fmt(d));
    const correctEquation = equationXOnly(d);

    let options = [correctEquation, equationXOnly(-d), `y = x² ${signStr(d)} ${absD}`];
    options = shuffle(options);

    setShiftXTask({ d, colorName: color.name, direction, absD, correctEquation, options });
    setShiftXDirAnswered(false);
    setShiftXDirFeedback(null);
    setShiftXAbsInput('');
    setShiftXAbsAnswered(false);
    setShiftXAbsFeedback(null);
    setShiftXEqAnswered(false);
    setShiftXEqFeedback(null);
    setShiftXShowSolution(false);

    if (api) {
      try {
        api.reset();
        api.evalCommand(`f(x) = (x + (${d}))^2`);
        api.setColor('f', color.rgb[0], color.rgb[1], color.rgb[2]);
        api.setLineThickness('f', 3);
        api.evalCommand('n(x) = x^2');
        api.setLineStyle('n', 1);
        api.setColor('n', 150, 150, 150);
        setSquareView(api, 'ggb-verschiebung-x', 6);
      } catch (e) {
        console.error('GeoGebra ShiftX Error:', e);
      }
    }
  };

  const checkShiftXDirection = (answer: Direction2) => {
    if (!shiftXTask || shiftXDirAnswered) return;
    if (answer === shiftXTask.direction) {
      setShiftXDirFeedback({ text: 'Richtig!', type: 'correct' });
      setShiftXDirAnswered(true);
      setScore(s => s + 1);
    } else {
      setShiftXDirFeedback({ text: 'Leider falsch. Versuch es erneut!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  const checkShiftXAbs = () => {
    if (!shiftXTask || shiftXAbsAnswered) return;
    const parsed = parseSignedInput(shiftXAbsInput);
    if (Number.isNaN(parsed) || shiftXAbsInput.trim() === '') {
      setShiftXAbsFeedback({ text: 'Bitte gib eine Zahl ein.', type: 'incorrect' });
      return;
    }
    if (Math.abs(parsed - shiftXTask.absD) < 0.01) {
      setShiftXAbsFeedback({ text: 'Richtig!', type: 'correct' });
      setShiftXAbsAnswered(true);
      setScore(s => s + 1);
    } else {
      setShiftXAbsFeedback({ text: 'Leider falsch. Versuch es erneut!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  const checkShiftXEquation = (opt: string) => {
    if (!shiftXTask || shiftXEqAnswered) return;
    if (opt === shiftXTask.correctEquation) {
      setShiftXEqFeedback({ text: 'Richtig!', type: 'correct' });
      setShiftXEqAnswered(true);
      setScore(s => s + 1);
    } else {
      setShiftXEqFeedback({ text: 'Leider falsch. Versuch es erneut!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  // ---------------------------------------------------------------------
  // Aufgabe 2: Verschiebung in y-Richtung
  // ---------------------------------------------------------------------
  const generateShiftYTask = (apiOverride?: any) => {
    const api = apiOverride || shiftYApiRef.current;
    const c = randomShift();
    const color = randomColor();
    const direction: Direction3 = c > 0 ? 'oben' : 'unten';
    const absC = Math.abs(fmt(c));
    const correctEquation = equationYOnly(c);

    let options = [correctEquation, equationYOnly(-c), `y = (x ${signStr(c)} ${absC})²`];
    options = shuffle(options);

    setShiftYTask({ c, colorName: color.name, direction, absC, correctEquation, options });
    setShiftYDirAnswered(false);
    setShiftYDirFeedback(null);
    setShiftYAbsInput('');
    setShiftYAbsAnswered(false);
    setShiftYAbsFeedback(null);
    setShiftYEqAnswered(false);
    setShiftYEqFeedback(null);
    setShiftYShowSolution(false);

    if (api) {
      try {
        api.reset();
        api.evalCommand(`f(x) = x^2 + (${c})`);
        api.setColor('f', color.rgb[0], color.rgb[1], color.rgb[2]);
        api.setLineThickness('f', 3);
        api.evalCommand('n(x) = x^2');
        api.setLineStyle('n', 1);
        api.setColor('n', 150, 150, 150);
        setSquareView(api, 'ggb-verschiebung-y', 6);
      } catch (e) {
        console.error('GeoGebra ShiftY Error:', e);
      }
    }
  };

  const checkShiftYDirection = (answer: Direction3) => {
    if (!shiftYTask || shiftYDirAnswered) return;
    if (answer === shiftYTask.direction) {
      setShiftYDirFeedback({ text: 'Richtig!', type: 'correct' });
      setShiftYDirAnswered(true);
      setScore(s => s + 1);
    } else {
      setShiftYDirFeedback({ text: 'Leider falsch. Versuch es erneut!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  const checkShiftYAbs = () => {
    if (!shiftYTask || shiftYAbsAnswered) return;
    const parsed = parseSignedInput(shiftYAbsInput);
    if (Number.isNaN(parsed) || shiftYAbsInput.trim() === '') {
      setShiftYAbsFeedback({ text: 'Bitte gib eine Zahl ein.', type: 'incorrect' });
      return;
    }
    if (Math.abs(parsed - shiftYTask.absC) < 0.01) {
      setShiftYAbsFeedback({ text: 'Richtig!', type: 'correct' });
      setShiftYAbsAnswered(true);
      setScore(s => s + 1);
    } else {
      setShiftYAbsFeedback({ text: 'Leider falsch. Versuch es erneut!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  const checkShiftYEquation = (opt: string) => {
    if (!shiftYTask || shiftYEqAnswered) return;
    if (opt === shiftYTask.correctEquation) {
      setShiftYEqFeedback({ text: 'Richtig!', type: 'correct' });
      setShiftYEqAnswered(true);
      setScore(s => s + 1);
    } else {
      setShiftYEqFeedback({ text: 'Leider falsch. Versuch es erneut!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  // ---------------------------------------------------------------------
  // Aufgabe 3: Kombinierte Verschiebung
  // ---------------------------------------------------------------------
  const generateCombinedTask = (apiOverride?: any) => {
    const api = apiOverride || combinedApiRef.current;
    const d = randomShift();
    const c = randomShift();
    const color = randomColor();

    setCombinedTask({ d, c, colorName: color.name });
    setCombinedXsInput('');
    setCombinedYsInput('');
    setCombinedVertexAnswered(false);
    setCombinedVertexFeedback(null);
    setCombinedDSign(null);
    setCombinedDAbs('');
    setCombinedCSign(null);
    setCombinedCAbs('');
    setCombinedEqAnswered(false);
    setCombinedEqFeedback(null);
    setCombinedShowSolution(false);

    if (api) {
      try {
        api.reset();
        api.evalCommand(`f(x) = (x + (${d}))^2 + (${c})`);
        api.setColor('f', color.rgb[0], color.rgb[1], color.rgb[2]);
        api.setLineThickness('f', 3);
        api.evalCommand('n(x) = x^2');
        api.setLineStyle('n', 1);
        api.setColor('n', 150, 150, 150);
        setSquareView(api, 'ggb-verschiebung-kombiniert', 7);
      } catch (e) {
        console.error('GeoGebra Combined Error:', e);
      }
    }
  };

  const checkCombinedVertex = () => {
    if (!combinedTask || combinedVertexAnswered) return;
    const xs = parseSignedInput(combinedXsInput);
    const ys = parseSignedInput(combinedYsInput);
    if (Number.isNaN(xs) || Number.isNaN(ys) || combinedXsInput.trim() === '' || combinedYsInput.trim() === '') {
      setCombinedVertexFeedback({ text: 'Bitte fülle beide Felder aus.', type: 'incorrect' });
      return;
    }
    const expectedXs = -fmt(combinedTask.d);
    const expectedYs = fmt(combinedTask.c);
    if (Math.abs(xs - expectedXs) < 0.01 && Math.abs(ys - expectedYs) < 0.01) {
      setCombinedVertexFeedback({ text: 'Richtig!', type: 'correct' });
      setCombinedVertexAnswered(true);
      setScore(s => s + 1);
    } else {
      setCombinedVertexFeedback({ text: 'Leider nicht ganz richtig. Versuch es erneut!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  const checkCombinedEquation = () => {
    if (!combinedTask || combinedEqAnswered) return;
    if (combinedDSign === null || combinedDAbs.trim() === '' || combinedCSign === null || combinedCAbs.trim() === '') {
      setCombinedEqFeedback({ text: 'Bitte fülle alle Felder aus und wähle die Vorzeichen.', type: 'incorrect' });
      return;
    }
    const dAbsVal = parseSignedInput(combinedDAbs);
    const cAbsVal = parseSignedInput(combinedCAbs);
    const expectedDSign = signStr(combinedTask.d);
    const expectedCSign = signStr(combinedTask.c);
    const isDCorrect = combinedDSign === expectedDSign && Math.abs(dAbsVal - Math.abs(fmt(combinedTask.d))) < 0.01;
    const isCCorrect = combinedCSign === expectedCSign && Math.abs(cAbsVal - Math.abs(fmt(combinedTask.c))) < 0.01;
    if (isDCorrect && isCCorrect) {
      setCombinedEqFeedback({ text: 'Richtig!', type: 'correct' });
      setCombinedEqAnswered(true);
      setScore(s => s + 1);
    } else {
      setCombinedEqFeedback({ text: 'Leider nicht ganz richtig. Überprüfe Vorzeichen und Zahlen!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  const combinedLivePreview = (): string => {
    const dPart = combinedDAbs.trim() !== '' ? parseSignedInput(combinedDAbs) || combinedDAbs : 'd';
    const cPart = combinedCAbs.trim() !== '' ? parseSignedInput(combinedCAbs) || combinedCAbs : 'c';
    const dSignLatex = combinedDSign ?? '\\pm';
    const cSignLatex = combinedCSign ?? '\\pm';
    return `y = \\left(x ${dSignLatex} ${dPart}\\right)^2 ${cSignLatex} ${cPart}`;
  };

  // ---------------------------------------------------------------------
  // Aufgabe 4: Zuordnungsaufgabe
  // ---------------------------------------------------------------------
  const generateMatchTask = (apiOverride?: any) => {
    const api = apiOverride || matchApiRef.current;
    const colors = pickDistinct(PARABOLA_COLORS, 3);
    const pairs: { d: number; c: number }[] = [];
    while (pairs.length < 3) {
      const d = randomShift();
      const c = randomShift();
      if (!pairs.some(p => p.d === d && p.c === c)) pairs.push({ d, c });
    }
    const items: MatchItem[] = pairs.map((p, idx) => ({
      d: p.d,
      c: p.c,
      color: colors[idx],
      equation: equationCombined(p.d, p.c),
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
          api.evalCommand(`${fname}(x) = (x + (${item.d}))^2 + (${item.c})`);
          api.setColor(fname, item.color.rgb[0], item.color.rgb[1], item.color.rgb[2]);
          api.setLineThickness(fname, 3);
        });
        api.evalCommand('n(x) = x^2');
        api.setLineStyle('n', 1);
        api.setColor('n', 150, 150, 150);
        setSquareView(api, 'ggb-verschiebung-zuordnung', 8);
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
  // Aufgabe 5: Umkehraufgabe (verbale Beschreibung -> Gleichung)
  // ---------------------------------------------------------------------
  const generateReverseTask = () => {
    const d = randomShift();
    const c = randomShift();
    const dirX = d > 0 ? 'links' : 'rechts';
    const dirY = c > 0 ? 'oben' : 'unten';
    const absD = Math.abs(fmt(d));
    const absC = Math.abs(fmt(c));

    const description = `Die Normalparabel wird um ${absD} Einheiten nach ${dirX} und um ${absC} Einheiten nach ${dirY} verschoben.`;

    const correctOption: ReverseOption = { label: equationCombined(d, c), d, c };
    const distractor1: ReverseOption = { label: equationCombined(-d, c), d: -d, c };
    const distractor2: ReverseOption = { label: equationCombined(d, -c), d, c: -c };
    const distractor3: ReverseOption = { label: equationCombined(-d, -c), d: -d, c: -c };

    const options = shuffle([correctOption, distractor1, distractor2, distractor3]);
    const correctIndex = options.findIndex(o => o.d === d && o.c === c);

    setReverseTask({ d, c, description, options, correctIndex });
    setReverseFeedback(null);
    setReverseSolved(false);
  };

  const checkReverse = (idx: number) => {
    if (!reverseTask || reverseSolved) return;
    if (idx === reverseTask.correctIndex) {
      setReverseFeedback({ text: 'Richtig!', type: 'correct' });
      setReverseSolved(true);
      setScore(s => s + 1);
    } else {
      setReverseFeedback({ text: 'Leider falsch. Versuch es erneut!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  // ---------------------------------------------------------------------
  // Neue Runde für alle Aufgaben (außer Sandbox)
  // ---------------------------------------------------------------------
  const generateNewRound = () => {
    generateShiftXTask();
    generateShiftYTask();
    generateCombinedTask();
    generateMatchTask();
    generateReverseTask();
  };

  const allReady = appletsLoaded.shiftX && appletsLoaded.shiftY && appletsLoaded.combined && appletsLoaded.match;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-5 max-w-3xl w-full">
        <h1 className="text-xl font-bold text-slate-800 mb-1 text-center">Verschiebung der Normalparabel</h1>
        <p className="text-center text-sm text-slate-600 mb-4">
          Wir betrachten Parabeln der Form <InlineMath math="y = (x + d)^2 + c" />.
        </p>

        {/* Merksatz */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-900">
          <p className="font-bold mb-1.5">Merke dir die Vorzeichen-Falle:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <InlineMath math="d" /> steht in der Klammer bei <InlineMath math="x" /> und wirkt "vertauscht": Ist{' '}
              <InlineMath math="d > 0" />, verschiebt sich die Parabel nach <strong>links</strong>; ist{' '}
              <InlineMath math="d < 0" />, nach <strong>rechts</strong>.
            </li>
            <li>
              <InlineMath math="c" /> steht am Ende und wirkt ganz normal: Ist <InlineMath math="c > 0" />, verschiebt
              sich die Parabel nach <strong>oben</strong>; ist <InlineMath math="c < 0" />, nach <strong>unten</strong>.
            </li>
            <li>
              Der Scheitelpunkt liegt immer bei <InlineMath math="S(-d \mid c)" />.
            </li>
          </ul>
        </div>

        {/* Sandbox */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-base font-bold text-slate-800">Entdecke den Einfluss von d und c</h2>
            <ExplainToggle open={sandboxExplainOpen} onToggle={() => setSandboxExplainOpen(o => !o)} />
          </div>
          <p className="text-xs text-slate-600 mb-2">
            Ziehe die Punkte auf den beiden Schiebereglern im Graphen und beobachte, wie sich die blaue Parabel im
            Vergleich zur grauen Normalparabel verändert.
          </p>
          {sandboxExplainOpen && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              Verändere zunächst nur <InlineMath math="d" /> (Regler oben) bei <InlineMath math="c = 0" />, dann nur{' '}
              <InlineMath math="c" /> bei <InlineMath math="d = 0" />. Beobachte: <InlineMath math="d" /> bewegt die
              Parabel horizontal (mit vertauschtem Vorzeichen!), <InlineMath math="c" /> bewegt sie vertikal (mit dem
              Vorzeichen, das du erwartest).
            </div>
          )}
          <div className="mb-3 border rounded-lg overflow-hidden shadow-inner bg-white flex justify-center">
            <div id="ggb-verschiebung-sandbox" style={{ width: sandboxSize.width, height: sandboxSize.height }}></div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded font-bold text-sm">
              f(x) = (x {signStr(sandboxD)} {Math.abs(Math.round(sandboxD * 100) / 100)})² {signStr(sandboxC)}{' '}
              {Math.abs(Math.round(sandboxC * 100) / 100)}
            </div>
            <button onClick={resetSandbox} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm">
              Regler zurücksetzen
            </button>
          </div>
        </div>

        {/* Aufgabe 1: Verschiebung in x-Richtung */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-base font-bold text-slate-800">Aufgabe 1: Verschiebung entlang der x-Achse</h2>
            <ExplainToggle open={shiftXExplainOpen} onToggle={() => setShiftXExplainOpen(o => !o)} />
          </div>
          {shiftXExplainOpen && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              Bei <InlineMath math="y = (x + d)^2" /> ist <InlineMath math="c = 0" />, es gibt also nur eine
              Verschiebung entlang der x-Achse. Setze für die Nullstelle der Klammer <InlineMath math="x + d = 0" />,
              also <InlineMath math="x = -d" />. Deshalb verschiebt ein <strong>positives</strong> d nach{' '}
              <strong>links</strong> und ein <strong>negatives</strong> d nach <strong>rechts</strong>.
            </div>
          )}

          <div className="mb-2 border rounded-lg overflow-hidden shadow-inner bg-white flex justify-center">
            <div id="ggb-verschiebung-x" style={{ width: shiftXSize.width, height: shiftXSize.height }}></div>
          </div>
          <div className="text-center mb-2 text-slate-600 text-xs">
            Die graue Parabel ist die Normalparabel f(x) = x².
          </div>

          {shiftXTask && (
            <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
              <div className="py-1.5">
                <p className="font-semibold text-sm mb-1">
                  1. In welche Richtung ist die {shiftXTask.colorName} Parabel im Vergleich zur Normalparabel
                  verschoben?
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <button onClick={() => checkShiftXDirection('links')} className="btn-option" disabled={shiftXDirAnswered}>Nach links</button>
                  <button onClick={() => checkShiftXDirection('rechts')} className="btn-option" disabled={shiftXDirAnswered}>Nach rechts</button>
                </div>
                {shiftXDirFeedback && <p className={`text-center font-bold text-sm mt-1 ${shiftXDirFeedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{shiftXDirFeedback.text}</p>}
              </div>

              <div className="py-1.5 text-center">
                <p className="font-semibold text-sm mb-1">2. Um wie viele Einheiten ist sie verschoben?</p>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={shiftXAbsInput}
                    onChange={(e) => setShiftXAbsInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') checkShiftXAbs(); }}
                    disabled={shiftXAbsAnswered}
                    className="border border-slate-300 rounded px-2 py-1 w-20 text-center text-sm disabled:opacity-60"
                    placeholder="z. B. 3"
                  />
                  <button onClick={checkShiftXAbs} className="btn-option" disabled={shiftXAbsAnswered}>Prüfen</button>
                </div>
                {shiftXAbsFeedback && <p className={`text-center font-bold text-sm mt-1 ${shiftXAbsFeedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{shiftXAbsFeedback.text}</p>}
              </div>

              <div className="py-1.5">
                <p className="font-semibold text-sm mb-1">3. Wie lautet die Funktionsgleichung?</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {shiftXTask.options.map((opt, idx) => (
                    <button key={idx} onClick={() => checkShiftXEquation(opt)} className="btn-option" disabled={shiftXEqAnswered}>{opt}</button>
                  ))}
                </div>
                {shiftXEqFeedback && <p className={`text-center font-bold text-sm mt-1 ${shiftXEqFeedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{shiftXEqFeedback.text}</p>}
              </div>
            </div>
          )}

          {shiftXTask && (
            <>
              <div className="text-center pt-2">
                <button
                  onClick={() => setShiftXShowSolution(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm"
                  disabled={shiftXShowSolution}
                >
                  Lösung anzeigen
                </button>
              </div>
              {shiftXShowSolution && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-900 text-sm">
                  <h3 className="font-bold mb-2">Lösung:</h3>
                  <p>
                    Es gilt d = {fmt(shiftXTask.d)}. Da d {shiftXTask.d > 0 ? '>' : '<'} 0, ist die Parabel um{' '}
                    <strong>{shiftXTask.absD} Einheiten nach {shiftXTask.direction}</strong> verschoben.
                  </p>
                  <p className="mt-1.5">Die Funktionsgleichung lautet <strong>{shiftXTask.correctEquation}</strong>.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Aufgabe 2: Verschiebung in y-Richtung */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-base font-bold text-slate-800">Aufgabe 2: Verschiebung entlang der y-Achse</h2>
            <ExplainToggle open={shiftYExplainOpen} onToggle={() => setShiftYExplainOpen(o => !o)} />
          </div>
          {shiftYExplainOpen && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              Bei <InlineMath math="y = x^2 + c" /> ist <InlineMath math="d = 0" />, es gibt also nur eine
              Verschiebung entlang der y-Achse. Hier ist das Vorzeichen nicht vertauscht: Ein{' '}
              <strong>positives</strong> c verschiebt nach <strong>oben</strong>, ein <strong>negatives</strong> c
              nach <strong>unten</strong> — so, wie man es erwarten würde.
            </div>
          )}

          <div className="mb-2 border rounded-lg overflow-hidden shadow-inner bg-white flex justify-center">
            <div id="ggb-verschiebung-y" style={{ width: shiftYSize.width, height: shiftYSize.height }}></div>
          </div>
          <div className="text-center mb-2 text-slate-600 text-xs">
            Die graue Parabel ist die Normalparabel f(x) = x².
          </div>

          {shiftYTask && (
            <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
              <div className="py-1.5">
                <p className="font-semibold text-sm mb-1">
                  1. In welche Richtung ist die {shiftYTask.colorName} Parabel im Vergleich zur Normalparabel
                  verschoben?
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <button onClick={() => checkShiftYDirection('oben')} className="btn-option" disabled={shiftYDirAnswered}>Nach oben</button>
                  <button onClick={() => checkShiftYDirection('unten')} className="btn-option" disabled={shiftYDirAnswered}>Nach unten</button>
                </div>
                {shiftYDirFeedback && <p className={`text-center font-bold text-sm mt-1 ${shiftYDirFeedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{shiftYDirFeedback.text}</p>}
              </div>

              <div className="py-1.5 text-center">
                <p className="font-semibold text-sm mb-1">2. Um wie viele Einheiten ist sie verschoben?</p>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={shiftYAbsInput}
                    onChange={(e) => setShiftYAbsInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') checkShiftYAbs(); }}
                    disabled={shiftYAbsAnswered}
                    className="border border-slate-300 rounded px-2 py-1 w-20 text-center text-sm disabled:opacity-60"
                    placeholder="z. B. 2"
                  />
                  <button onClick={checkShiftYAbs} className="btn-option" disabled={shiftYAbsAnswered}>Prüfen</button>
                </div>
                {shiftYAbsFeedback && <p className={`text-center font-bold text-sm mt-1 ${shiftYAbsFeedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{shiftYAbsFeedback.text}</p>}
              </div>

              <div className="py-1.5">
                <p className="font-semibold text-sm mb-1">3. Wie lautet die Funktionsgleichung?</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {shiftYTask.options.map((opt, idx) => (
                    <button key={idx} onClick={() => checkShiftYEquation(opt)} className="btn-option" disabled={shiftYEqAnswered}>{opt}</button>
                  ))}
                </div>
                {shiftYEqFeedback && <p className={`text-center font-bold text-sm mt-1 ${shiftYEqFeedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{shiftYEqFeedback.text}</p>}
              </div>
            </div>
          )}

          {shiftYTask && (
            <>
              <div className="text-center pt-2">
                <button
                  onClick={() => setShiftYShowSolution(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm"
                  disabled={shiftYShowSolution}
                >
                  Lösung anzeigen
                </button>
              </div>
              {shiftYShowSolution && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-900 text-sm">
                  <h3 className="font-bold mb-2">Lösung:</h3>
                  <p>
                    Es gilt c = {fmt(shiftYTask.c)}. Da c {shiftYTask.c > 0 ? '>' : '<'} 0, ist die Parabel um{' '}
                    <strong>{shiftYTask.absC} Einheiten nach {shiftYTask.direction}</strong> verschoben.
                  </p>
                  <p className="mt-1.5">Die Funktionsgleichung lautet <strong>{shiftYTask.correctEquation}</strong>.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Aufgabe 3: Kombinierte Verschiebung */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-base font-bold text-slate-800">Aufgabe 3: Kombinierte Verschiebung</h2>
            <ExplainToggle open={combinedExplainOpen} onToggle={() => setCombinedExplainOpen(o => !o)} />
          </div>
          <p className="text-xs text-slate-600 mb-2 text-center">
            Jetzt wird gleichzeitig entlang der x- und der y-Achse verschoben.
          </p>
          {combinedExplainOpen && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              Lies zuerst den Scheitelpunkt <InlineMath math="S(x_s \mid y_s)" /> ab. Da{' '}
              <InlineMath math="x_s = -d" /> und <InlineMath math="y_s = c" />, gilt umgekehrt:{' '}
              <InlineMath math="d = -x_s" /> und <InlineMath math="c = y_s" />. In der Gleichung{' '}
              <InlineMath math="y = (x + d)^2 + c" /> trägst du dann d und c mit ihrem eigenen Vorzeichen ein.
            </div>
          )}

          <div className="mb-3 border rounded-lg overflow-hidden shadow-inner bg-white flex justify-center">
            <div id="ggb-verschiebung-kombiniert" style={{ width: combinedSize.width, height: combinedSize.height }}></div>
          </div>
          <div className="text-center mb-2 text-slate-600 text-xs">
            Die graue Parabel ist die Normalparabel f(x) = x².
          </div>

          {combinedTask && (
            <div className="space-y-3">
              <div className="text-center">
                <p className="font-semibold text-sm mb-1">
                  1. Wie lautet der Scheitelpunkt S(<InlineMath math="x_s" />|<InlineMath math="y_s" />) der{' '}
                  {combinedTask.colorName} Parabel?
                </p>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <span className="text-sm">S(</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={combinedXsInput}
                    onChange={(e) => setCombinedXsInput(e.target.value)}
                    disabled={combinedVertexAnswered}
                    className="border border-slate-300 rounded px-2 py-1 w-16 text-center text-sm disabled:opacity-60"
                    placeholder="xs"
                  />
                  <span className="text-sm">|</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={combinedYsInput}
                    onChange={(e) => setCombinedYsInput(e.target.value)}
                    disabled={combinedVertexAnswered}
                    className="border border-slate-300 rounded px-2 py-1 w-16 text-center text-sm disabled:opacity-60"
                    placeholder="ys"
                  />
                  <span className="text-sm">)</span>
                  <button onClick={checkCombinedVertex} className="btn-option" disabled={combinedVertexAnswered}>Prüfen</button>
                </div>
                {combinedVertexFeedback && <p className={`text-center font-bold text-sm mt-1 ${combinedVertexFeedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{combinedVertexFeedback.text}</p>}
              </div>

              <div className="text-center border-t border-slate-200 pt-3">
                <p className="font-semibold text-sm mb-2">2. Stelle die Funktionsgleichung auf:</p>
                <div className="flex flex-nowrap items-center justify-center gap-1 mb-3 bg-slate-50 py-2 px-1.5 rounded-lg border border-slate-200 font-mono text-sm overflow-x-auto">
                  <span className="whitespace-nowrap shrink-0">y = (x</span>
                  <SignToggle value={combinedDSign} onChange={setCombinedDSign} />
                  <input
                    type="text"
                    value={combinedDAbs}
                    onChange={(e) => setCombinedDAbs(e.target.value)}
                    disabled={combinedEqAnswered}
                    placeholder="d"
                    aria-label="Zahl im Klammerterm"
                    className="w-16 h-9 shrink-0 p-1 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-center disabled:opacity-60"
                  />
                  <span className="whitespace-nowrap shrink-0">)²</span>
                  <SignToggle value={combinedCSign} onChange={setCombinedCSign} />
                  <input
                    type="text"
                    value={combinedCAbs}
                    onChange={(e) => setCombinedCAbs(e.target.value)}
                    disabled={combinedEqAnswered}
                    placeholder="c"
                    aria-label="Zahl c"
                    className="w-16 h-9 shrink-0 p-1 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-center disabled:opacity-60"
                  />
                </div>
                <div className="mb-3 bg-blue-50 py-2 px-3 rounded-lg border border-blue-200 text-center overflow-x-auto">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Deine Gleichung:</p>
                  <InlineMath math={combinedLivePreview()} />
                </div>
                <button onClick={checkCombinedEquation} className="btn-option" disabled={combinedEqAnswered}>Prüfen</button>
                {combinedEqFeedback && <p className={`text-center font-bold text-sm mt-1 ${combinedEqFeedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{combinedEqFeedback.text}</p>}
              </div>
            </div>
          )}

          {combinedTask && (
            <>
              <div className="text-center pt-3">
                <button
                  onClick={() => setCombinedShowSolution(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm"
                  disabled={combinedShowSolution}
                >
                  Lösung anzeigen
                </button>
              </div>
              {combinedShowSolution && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-900 text-sm">
                  <h3 className="font-bold mb-2">Lösung:</h3>
                  <p>Es gilt d = {fmt(combinedTask.d)} und c = {fmt(combinedTask.c)}.</p>
                  <p className="mt-1">
                    Scheitelpunkt: <InlineMath math={`S(${-fmt(combinedTask.d)} \\mid ${fmt(combinedTask.c)})`} />
                  </p>
                  <p className="mt-1">
                    Funktionsgleichung: <InlineMath math={equationCombinedLatex(combinedTask.d, combinedTask.c)} />
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Aufgabe 4: Zuordnungsaufgabe */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-base font-bold text-slate-800">Aufgabe 4: Parabeln zuordnen</h2>
            <ExplainToggle open={matchExplainOpen} onToggle={() => setMatchExplainOpen(o => !o)} />
          </div>
          <p className="text-xs text-slate-600 mb-2 text-center">Ordne jeder farbigen Parabel die passende Funktionsgleichung zu.</p>
          {matchExplainOpen && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              Lies für jede Farbe zuerst den Scheitelpunkt ab und leite daraus d = −x<sub>s</sub> und c = y<sub>s</sub>{' '}
              her. Prüfe dann, welche Gleichung dazu passt.
            </div>
          )}

          <div className="mb-3 border rounded-lg overflow-hidden shadow-inner bg-white flex justify-center">
            <div id="ggb-verschiebung-zuordnung" style={{ width: matchSize.width, height: matchSize.height }}></div>
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

        {/* Aufgabe 5: Umkehraufgabe */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-base font-bold text-slate-800">Aufgabe 5: Finde die passende Gleichung</h2>
            <ExplainToggle open={reverseExplainOpen} onToggle={() => setReverseExplainOpen(o => !o)} />
          </div>
          {reverseExplainOpen && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              Übersetze die Beschreibung Schritt für Schritt: "nach links um d" bedeutet{' '}
              <InlineMath math="+d" /> in der Klammer, "nach rechts um d" bedeutet <InlineMath math="-d" />. "Nach
              oben um c" bedeutet <InlineMath math="+c" /> am Ende, "nach unten um c" bedeutet{' '}
              <InlineMath math="-c" />.
            </div>
          )}

          {reverseTask && (
            <div className="text-center text-sm">
              <p className="mb-3">{reverseTask.description}</p>
              <div className="flex gap-2 justify-center flex-wrap mb-2">
                {reverseTask.options.map((opt, idx) => (
                  <button key={idx} onClick={() => checkReverse(idx)} className="btn-option" disabled={reverseSolved}>{opt.label}</button>
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
