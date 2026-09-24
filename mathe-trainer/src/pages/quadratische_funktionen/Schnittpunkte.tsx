import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

declare global {
    interface Window {
        GGBApplet: any;
    }
}

const NUM_TASKS = 4;
const PLOT_WIDTH = 460;
const PLOT_HEIGHT = 320;

// Erzwingt ein kartesisches Koordinatensystem: 1 Einheit auf der x-Achse
// entspricht optisch genauso vielen Pixeln wie 1 Einheit auf der y-Achse.
function computeCartesianView(xMin: number, xMax: number, yMin: number, yMax: number, width: number, height: number) {
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    let rangeX = Math.max(xMax - xMin, 0.0001);
    let rangeY = Math.max(yMax - yMin, 0.0001);

    const neededRangeXForY = rangeY * (width / height);
    if (rangeX < neededRangeXForY) {
        rangeX = neededRangeXForY;
    } else {
        rangeY = rangeX * (height / width);
    }

    return {
        viewXMin: xCenter - rangeX / 2,
        viewXMax: xCenter + rangeX / 2,
        viewYMin: yCenter - rangeY / 2,
        viewYMax: yCenter + rangeY / 2,
    };
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

type TaskType = 'line-parabola' | 'parabola-parabola';
type Difficulty = 'leicht' | 'mittel' | 'schwer';
type Feedback = { type: 'success' | 'error' | 'info', message: string };

interface Point {
    x: number;
    y: number;
}

interface TaskParams {
    type: TaskType;
    // Line-Parabola
    a?: number;
    b?: number;
    c?: number;
    m?: number;
    t?: number;
    // Parabola-Parabola
    a1?: number;
    b1?: number;
    c1?: number;
    a2?: number;
    b2?: number;
    c2?: number;

    points: Point[];
    intersectionCount: number;
}

interface SchnittpunkteProps {
    initialTaskType?: TaskType;
}

const Schnittpunkte: React.FC<SchnittpunkteProps> = ({ initialTaskType = 'line-parabola' }) => {
    const [taskType, setTaskType] = useState<TaskType>(initialTaskType);
    const [difficulty, setDifficulty] = useState<Difficulty>('leicht');
    const [tasksList, setTasksList] = useState<TaskParams[]>([]);

    // Zustand pro Aufgabe (Array-Index = Aufgaben-Index)
    const [selectedCounts, setSelectedCounts] = useState<(number | null)[]>(Array(NUM_TASKS).fill(null));
    const [userPointsList, setUserPointsList] = useState<{x: string, y: string}[][]>(Array(NUM_TASKS).fill([]));
    const [feedbacks, setFeedbacks] = useState<(Feedback | null)[]>(Array(NUM_TASKS).fill(null));
    const [showSolutions, setShowSolutions] = useState<boolean[]>(Array(NUM_TASKS).fill(false));
    const [showGraphs, setShowGraphs] = useState<boolean[]>(Array(NUM_TASKS).fill(false));

    const ggbApiRefs = useRef<{ [index: number]: any }>({});

    // Helpers
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const randomFloat = (min: number, max: number, decimals = 1) => {
        const factor = Math.pow(10, decimals);
        return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    };

    const roundTo = (value: number, decimals: number) => {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    };

    // Prüft für jedes eingegebene Wertepaar live (ohne "Prüfen"-Klick), ob es zu
    // einem der noch nicht zugeordneten erwarteten Schnittpunkte passt.
    // null = noch nicht vollständig ausgefüllt, true = korrekt, false = falsch.
    const computePointStatuses = (points: {x: string, y: string}[], expected: Point[]): (boolean | null)[] => {
        const tolerance = 0.1;
        const remaining = [...expected];
        return points.map(p => {
            if (!p.x.trim() || !p.y.trim()) return null;
            const x = parseFloat(p.x.replace(',', '.').replace(/[−–—‐]/g, '-'));
            const y = parseFloat(p.y.replace(',', '.').replace(/[−–—‐]/g, '-'));
            if (isNaN(x) || isNaN(y)) return false;
            const matchIndex = remaining.findIndex(e => Math.abs(x - e.x) <= tolerance && Math.abs(y - e.y) <= tolerance);
            if (matchIndex === -1) return false;
            remaining.splice(matchIndex, 1);
            return true;
        });
    };

    // Formatiert einen bx-Term komplett inkl. "x" (oder "", wenn b=0 ist -
    // der gesamte Term entfällt dann, statt ein verwaistes "x" ohne
    // Koeffizient stehen zu lassen).
    const formatLinearTerm = (value: number) => {
        if (value === 0) return "";
        if (value === 1) return "+ x";
        if (value === -1) return "- x";
        if (value > 0) return `+ ${value}x`;
        return `- ${Math.abs(value)}x`;
    };

    const formatConstant = (value: number) => {
        if (value === 0) return "";
        if (value > 0) return `+ ${value}`;
        return `- ${Math.abs(value)}`;
    };

    // Wie formatLinearTerm, aber für die Einsetzungs-Schreibweise "+ b · (x)"
    // in der Lösung (xExpr ist bereits geklammert).
    const formatLinearSubstitution = (value: number, xExpr: string) => {
        if (value === 0) return "";
        if (value === 1) return `+ ${xExpr}`;
        if (value === -1) return `- ${xExpr}`;
        if (value > 0) return `+ ${value} \\cdot ${xExpr}`;
        return `- ${Math.abs(value)} \\cdot ${xExpr}`;
    };

    const generateLineParabolaTask = (diff: Difficulty): TaskParams => {
        let a, b, c, m, t;
        let intersectionCount;

        while (true) {
            if (diff === 'leicht') {
                // Einfache Ganzzahlen, garantiert lösbar
                a = randomInt(1, 2) * (Math.random() < 0.5 ? 1 : -1);
                b = randomInt(-5, 5);
                c = randomInt(-5, 5);
                m = randomInt(-3, 3);
                t = randomInt(-5, 5);
            } else if (diff === 'mittel') {
                a = randomFloat(-3, 3, 1);
                b = randomFloat(-5, 5, 1);
                c = randomFloat(-5, 5, 1);
                m = randomFloat(-3, 3, 1);
                t = randomFloat(-5, 5, 1);
            } else {
                a = randomFloat(-4, 4, 1);
                b = randomFloat(-8, 8, 1);
                c = randomFloat(-10, 10, 1);
                m = randomFloat(-5, 5, 1);
                t = randomFloat(-10, 10, 1);
            }

            if (a === 0) a = 1;
            if (m === 0) m = 1;

            const discriminant = Math.pow(b - m, 2) - 4 * a * (c - t);

            if (discriminant >= 0) {
                const x1 = (-1 * (b - m) + Math.sqrt(discriminant)) / (2 * a);
                const y1 = m * x1 + t;

                let points: Point[] = [];
                points.push({ x: roundTo(x1, 4), y: roundTo(y1, 4) });

                if (discriminant > 0.0001) {
                    const x2 = (-1 * (b - m) - Math.sqrt(discriminant)) / (2 * a);
                    const y2 = m * x2 + t;
                    points.push({ x: roundTo(x2, 4), y: roundTo(y2, 4) });
                    intersectionCount = 2;
                } else {
                    intersectionCount = 1;
                }

                // For 'leicht', ensure integer-ish results
                if (diff === 'leicht') {
                    const isNice = points.every(p => Math.abs(p.x - Math.round(p.x)) < 0.1 && Math.abs(p.y - Math.round(p.y)) < 0.1);
                    if (!isNice) continue;
                    // Round them to integers for display/check
                    points = points.map(p => ({x: Math.round(p.x), y: Math.round(p.y)}));
                }

                return {
                    type: 'line-parabola',
                    a, b, c, m, t,
                    points,
                    intersectionCount
                };
            }
        }
    };

    const generateParabolaParabolaTask = (diff: Difficulty): TaskParams => {
        let a1, b1, c1, a2, b2, c2;

        while (true) {
            if (diff === 'leicht') {
                a1 = randomInt(1, 2);
                a2 = randomInt(-2, -1); // Different signs to ensure intersection often
                b1 = randomInt(-5, 5);
                c1 = randomInt(-5, 5);
                b2 = randomInt(-5, 5);
                c2 = randomInt(-5, 5);
            } else if (diff === 'mittel') {
                a1 = randomFloat(1, 3, 1);
                b1 = randomFloat(-4, 4, 1);
                c1 = randomFloat(-5, 5, 1);
                a2 = randomFloat(-3, -1, 1);
                b2 = randomFloat(-4, 4, 1);
                c2 = randomFloat(-5, 5, 1);
            } else {
                a1 = randomFloat(-4, 4, 1);
                b1 = randomFloat(-5, 5, 1);
                c1 = randomFloat(-8, 8, 1);
                a2 = randomFloat(-4, 4, 1);
                b2 = randomFloat(-5, 5, 1);
                c2 = randomFloat(-8, 8, 1);
            }

            if (Math.abs(a1 - a2) < 0.1) {
                if (diff === 'leicht') continue;
                a2 += (a1 > 0) ? -1 : 1;
            }

            const A = a1 - a2;
            const B = b1 - b2;
            const C = c1 - c2;

            const discriminant = B * B - 4 * A * C;

            if (discriminant >= 0) {
                const x1 = (-B + Math.sqrt(discriminant)) / (2 * A);
                const y1 = a1 * x1 * x1 + b1 * x1 + c1;

                let points: Point[] = [];
                points.push({ x: roundTo(x1, 4), y: roundTo(y1, 4) });

                let intersectionCount = 1;
                if (discriminant > 0.0001) {
                    const x2 = (-B - Math.sqrt(discriminant)) / (2 * A);
                    const y2 = a1 * x2 * x2 + b1 * x2 + c1;
                    points.push({ x: roundTo(x2, 4), y: roundTo(y2, 4) });
                    intersectionCount = 2;
                }

                if (diff === 'leicht') {
                    const isNice = points.every(p => Math.abs(p.x - Math.round(p.x)) < 0.1 && Math.abs(p.y - Math.round(p.y)) < 0.1);
                    if (!isNice) continue;
                    points = points.map(p => ({x: Math.round(p.x), y: Math.round(p.y)}));
                }

                return {
                    type: 'parabola-parabola',
                    a1, b1, c1, a2, b2, c2,
                    points,
                    intersectionCount
                };
            }
        }
    };

    const generateAllTasks = () => {
        const newTasks: TaskParams[] = [];
        for (let i = 0; i < NUM_TASKS; i++) {
            newTasks.push(
                taskType === 'line-parabola'
                    ? generateLineParabolaTask(difficulty)
                    : generateParabolaParabolaTask(difficulty)
            );
        }
        setTasksList(newTasks);
        setSelectedCounts(Array(NUM_TASKS).fill(null));
        setUserPointsList(Array(NUM_TASKS).fill([]));
        setFeedbacks(Array(NUM_TASKS).fill(null));
        setShowSolutions(Array(NUM_TASKS).fill(false));
        setShowGraphs(Array(NUM_TASKS).fill(false));
        ggbApiRefs.current = {};
    };

    useEffect(() => {
        generateAllTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskType, difficulty]);

    const handleCountSelect = (taskIndex: number, count: number) => {
        setSelectedCounts(prev => {
            const next = [...prev];
            next[taskIndex] = count;
            return next;
        });
        setUserPointsList(prev => {
            const next = [...prev];
            next[taskIndex] = Array(count).fill({ x: '', y: '' });
            return next;
        });
        setFeedbacks(prev => {
            const next = [...prev];
            next[taskIndex] = null;
            return next;
        });
    };

    const handlePointChange = (taskIndex: number, pointIndex: number, field: 'x' | 'y', value: string) => {
        setUserPointsList(prev => {
            const next = [...prev];
            const pts = [...next[taskIndex]];
            pts[pointIndex] = { ...pts[pointIndex], [field]: value };
            next[taskIndex] = pts;
            return next;
        });
    };

    const checkAnswer = (taskIndex: number) => {
        const params = tasksList[taskIndex];
        if (!params) return;
        const selectedCount = selectedCounts[taskIndex];
        const userPoints = userPointsList[taskIndex];

        const setFeedback = (fb: Feedback) => {
            setFeedbacks(prev => {
                const next = [...prev];
                next[taskIndex] = fb;
                return next;
            });
        };

        if (selectedCount === null) {
            setFeedback({ type: 'info', message: 'Bitte wähle zuerst die Anzahl der Schnittpunkte aus.' });
            return;
        }

        if (selectedCount !== params.intersectionCount) {
            setFeedback({
                type: 'error',
                message: `Falsch! Es gibt ${params.intersectionCount} Schnittpunkt(e), nicht ${selectedCount}.`
            });
            return;
        }

        if (selectedCount === 0) {
            setFeedback({ type: 'success', message: 'Richtig! Es gibt keine Schnittpunkte.' });
            return;
        }

        // Check if all fields are filled
        if (userPoints.some(p => !p.x.trim() || !p.y.trim())) {
            setFeedback({ type: 'info', message: 'Bitte fülle alle Koordinatenfelder aus.' });
            return;
        }

        const parsedUserPoints = userPoints.map(p => ({
            x: parseFloat(p.x.replace(',', '.').replace(/[−–—‐]/g, '-')),
            y: parseFloat(p.y.replace(',', '.').replace(/[−–—‐]/g, '-'))
        }));

        // Check for valid numbers
        if (parsedUserPoints.some(p => isNaN(p.x) || isNaN(p.y))) {
            setFeedback({ type: 'error', message: 'Bitte gib gültige Zahlen ein.' });
            return;
        }

        let allCorrect = true;
        const tolerance = 0.1;

        // Create a copy of expected points to match against
        const remainingExpected = [...params.points];

        for (const userPoint of parsedUserPoints) {
            const matchIndex = remainingExpected.findIndex(expected =>
                Math.abs(userPoint.x - expected.x) <= tolerance &&
                Math.abs(userPoint.y - expected.y) <= tolerance
            );

            if (matchIndex !== -1) {
                remainingExpected.splice(matchIndex, 1);
            } else {
                allCorrect = false;
                break;
            }
        }

        if (allCorrect) {
            setFeedback({ type: 'success', message: 'Richtig! Deine Lösung ist korrekt.' });
        } else {
            setFeedback({ type: 'error', message: 'Leider falsch. Überprüfe deine Berechnung oder zeige die Lösung an.' });
        }
    };

    const renderSolution = (params: TaskParams) => {
        if (params.type === 'line-parabola') {
            const { a, b, c, m, t } = params;
            if (a === undefined || b === undefined || c === undefined || m === undefined || t === undefined) return null;

            const A = a;
            const B = b - m;
            const C = c - t;
            const D = B*B - 4*A*C;

            return (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Lösung</h3>

                    <div className="mb-4">
                        <p className="font-bold">1. Gleichsetzen:</p>
                        <BlockMath math={`${m}x ${formatConstant(t)} = ${a}x^2 ${formatLinearTerm(b)} ${formatConstant(c)}`} />
                    </div>

                    <div className="mb-4">
                        <p className="font-bold">2. Umformen zur Normalform (<InlineMath math="ax^2 + bx + c = 0" />):</p>
                        <BlockMath math={`${a}x^2 ${formatLinearTerm(B)} ${formatConstant(C)} = 0`} />
                    </div>

                    <div className="mb-4">
                        <p className="font-bold">3. Diskriminante berechnen:</p>
                        <BlockMath math={`D = (${roundTo(B, 2)})^2 - 4 \\cdot ${a} \\cdot (${roundTo(C, 2)}) = ${roundTo(D, 2)}`} />
                    </div>

                    {D >= 0 && (
                        <div className="mb-4">
                            <p className="font-bold">4. x-Werte berechnen (Mitternachtsformel):</p>
                            <BlockMath math={`x_{1,2} = \\frac{-(${roundTo(B, 2)}) \\pm \\sqrt{${roundTo(D, 2)}}}{2 \\cdot ${a}}`} />
                            <p>
                                Ergebnisse: <InlineMath math={`x_1 = ${roundTo(params.points[0].x, 3)}`} />
                                {params.points.length > 1 && <>, <InlineMath math={`x_2 = ${roundTo(params.points[1].x, 3)}`} /></>}
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <p className="font-bold">5. y-Werte berechnen (in Gerade einsetzen):</p>
                        {params.points.map((p, i) => (
                            <div key={i}>
                                <BlockMath math={`y_${i+1} = ${m} \\cdot (${roundTo(p.x, 3)}) ${formatConstant(t)} = ${roundTo(p.y, 3)}`} />
                            </div>
                        ))}
                    </div>

                    <div className="mb-4">
                        <p className="font-bold">6. Schnittpunkte:</p>
                        <p>
                            {params.points.map((p, i) => (
                                <span key={i} className="mr-4">
                                    <InlineMath math={`S_{${i+1}}(${roundTo(p.x, 3)} | ${roundTo(p.y, 3)})`} />
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            );
        } else {
            const { a1, b1, c1, a2, b2, c2 } = params;
            if (a1 === undefined || b1 === undefined || c1 === undefined || a2 === undefined || b2 === undefined || c2 === undefined) return null;

            const A = a1 - a2;
            const B = b1 - b2;
            const C = c1 - c2;
            const D = B*B - 4*A*C;

            return (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Lösung</h3>

                    <div className="mb-4">
                        <p className="font-bold">1. Gleichsetzen:</p>
                        <BlockMath math={`${a1}x^2 ${formatLinearTerm(b1)} ${formatConstant(c1)} = ${a2}x^2 ${formatLinearTerm(b2)} ${formatConstant(c2)}`} />
                    </div>

                    <div className="mb-4">
                        <p className="font-bold">2. Umformen zur Normalform:</p>
                        <BlockMath math={`${roundTo(A, 2)}x^2 ${formatLinearTerm(B)} ${formatConstant(C)} = 0`} />
                    </div>

                    <div className="mb-4">
                        <p className="font-bold">3. Diskriminante berechnen:</p>
                        <BlockMath math={`D = (${roundTo(B, 2)})^2 - 4 \\cdot ${roundTo(A, 2)} \\cdot (${roundTo(C, 2)}) = ${roundTo(D, 2)}`} />
                    </div>

                    {D >= 0 && (
                        <div className="mb-4">
                            <p className="font-bold">4. x-Werte berechnen:</p>
                            <BlockMath math={`x_{1,2} = \\frac{-(${roundTo(B, 2)}) \\pm \\sqrt{${roundTo(D, 2)}}}{2 \\cdot ${roundTo(A, 2)}}`} />
                            <p>
                                Ergebnisse: <InlineMath math={`x_1 = ${roundTo(params.points[0].x, 3)}`} />
                                {params.points.length > 1 && <>, <InlineMath math={`x_2 = ${roundTo(params.points[1].x, 3)}`} /></>}
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <p className="font-bold">5. y-Werte berechnen (in erste Parabel einsetzen):</p>
                        {params.points.map((p, i) => (
                            <div key={i}>
                                <BlockMath math={`y_${i+1} = ${a1} \\cdot (${roundTo(p.x, 3)})^2 ${formatLinearSubstitution(b1, `(${roundTo(p.x, 3)})`)} ${formatConstant(c1)} = ${roundTo(p.y, 3)}`} />
                            </div>
                        ))}
                    </div>

                    <div className="mb-4">
                        <p className="font-bold">6. Schnittpunkte:</p>
                        <p>
                            {params.points.map((p, i) => (
                                <span key={i} className="mr-4">
                                    <InlineMath math={`S_{${i+1}}(${roundTo(p.x, 3)} | ${roundTo(p.y, 3)})`} />
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            );
        }
    };

    // Berechnet einen kartesischen Anzeigebereich, der beide Funktionen und
    // alle Schnittpunkte gut sichtbar zeigt (inkl. der Scheitelpunkte der
    // beteiligten Parabel(n), damit deren Form erkennbar bleibt).
    const computeGraphView = (p: TaskParams) => {
        const xs: number[] = [0];
        const ys: number[] = [0];
        p.points.forEach(pt => { xs.push(pt.x); ys.push(pt.y); });

        if (p.type === 'line-parabola') {
            const a = p.a!, b = p.b!, c = p.c!;
            const vx = -b / (2 * a);
            xs.push(vx);
            ys.push(a * vx * vx + b * vx + c);
        } else {
            const a1 = p.a1!, b1 = p.b1!, c1 = p.c1!;
            const a2 = p.a2!, b2 = p.b2!, c2 = p.c2!;
            const vx1 = -b1 / (2 * a1);
            xs.push(vx1);
            ys.push(a1 * vx1 * vx1 + b1 * vx1 + c1);
            const vx2 = -b2 / (2 * a2);
            xs.push(vx2);
            ys.push(a2 * vx2 * vx2 + b2 * vx2 + c2);
        }

        const xMin = Math.min(...xs), xMax = Math.max(...xs);
        const yMin = Math.min(...ys), yMax = Math.max(...ys);
        const xPad = Math.max((xMax - xMin) * 0.3, 2);
        const yPad = Math.max((yMax - yMin) * 0.3, 2);

        return computeCartesianView(xMin - xPad, xMax + xPad, yMin - yPad, yMax + yPad, PLOT_WIDTH, PLOT_HEIGHT);
    };

    // Zeichnet beide Funktionen sowie die (bereits in JS berechneten) Schnittpunkte
    const setupSchnittpunkteGraph = (api: any, p: TaskParams) => {
        try {
            api.reset();

            if (p.type === 'line-parabola') {
                api.evalCommand(`f(x) = ${p.a}*x^2 + ${p.b}*x + ${p.c}`);
                api.evalCommand(`g(x) = ${p.m}*x + ${p.t}`);
            } else {
                api.evalCommand(`f(x) = ${p.a1}*x^2 + ${p.b1}*x + ${p.c1}`);
                api.evalCommand(`g(x) = ${p.a2}*x^2 + ${p.b2}*x + ${p.c2}`);
            }
            api.setColor('f', 220, 38, 38);
            api.setLineThickness('f', 3);
            api.setColor('g', 37, 99, 235);
            api.setLineThickness('g', 3);

            p.points.forEach((pt, i) => {
                const name = `S${i + 1}`;
                api.evalCommand(`${name}=(${pt.x},${pt.y})`);
                api.setColor(name, 234, 88, 12);
                api.setPointSize(name, 6);
                api.setLabelVisible(name, true);
            });

            const view = computeGraphView(p);
            api.setCoordSystem(view.viewXMin, view.viewXMax, view.viewYMin, view.viewYMax);
        } catch (e) {
            console.error('GeoGebra Schnittpunkte-Error:', e);
        }
    };

    // GeoGebra-Skript einmalig laden, damit es beim ersten Klick auf
    // "Graph anzeigen" bereits bereitsteht.
    useEffect(() => {
        const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
        if (!existing) {
            const script = document.createElement('script');
            script.src = 'https://www.geogebra.org/apps/deployggb.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Applet je Aufgabe injizieren, sobald deren Graph eingeblendet wird; bei
    // bereits geladenem Applet (z.B. nach Änderung der Aufgabe) stattdessen
    // nur aktualisieren.
    useEffect(() => {
        tasksList.forEach((params, index) => {
            if (!showGraphs[index] || !params) return;

            if (ggbApiRefs.current[index]) {
                setupSchnittpunkteGraph(ggbApiRefs.current[index], params);
                return;
            }

            const containerId = `ggb-schnittpunkte-${index}`;
            let attempts = 0;
            let cancelled = false;
            const tryInject = () => {
                if (cancelled) return;
                attempts++;
                if (!window.GGBApplet || !document.getElementById(containerId)) {
                    if (attempts < 50) setTimeout(tryInject, 100);
                    return;
                }
                injectApplet(containerId, PLOT_WIDTH, PLOT_HEIGHT, (api: any) => {
                    ggbApiRefs.current[index] = api;
                    setupSchnittpunkteGraph(api, params);
                });
            };
            tryInject();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showGraphs, tasksList]);

    const toggleGraph = (taskIndex: number) => {
        setShowGraphs(prev => {
            const next = [...prev];
            if (next[taskIndex]) {
                ggbApiRefs.current[taskIndex] = null;
            }
            next[taskIndex] = !next[taskIndex];
            return next;
        });
    };

    const toggleSolution = (taskIndex: number) => {
        setShowSolutions(prev => {
            const next = [...prev];
            next[taskIndex] = !next[taskIndex];
            return next;
        });
    };

    return (
        <div className="mx-auto px-4 py-8 max-w-6xl">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-teal-800 text-center mb-6">
                    Schnittpunkte berechnen
                </h1>

                <div className="flex flex-wrap gap-4 mb-6 justify-center">
                    <div className="flex rounded-lg bg-gray-100 p-1">
                        <button
                            onClick={() => setTaskType('line-parabola')}
                            className={`px-4 py-2 rounded-md transition-colors ${taskType === 'line-parabola' ? 'bg-white shadow text-teal-700 font-bold' : 'text-gray-600'}`}
                        >
                            Gerade & Parabel
                        </button>
                        <button
                            onClick={() => setTaskType('parabola-parabola')}
                            className={`px-4 py-2 rounded-md transition-colors ${taskType === 'parabola-parabola' ? 'bg-white shadow text-teal-700 font-bold' : 'text-gray-600'}`}
                        >
                            Zwei Parabeln
                        </button>
                    </div>

                    <div className="flex rounded-lg bg-gray-100 p-1">
                        {(['leicht', 'mittel', 'schwer'] as Difficulty[]).map(d => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`px-4 py-2 rounded-md capitalize transition-colors ${difficulty === d ? 'bg-white shadow text-teal-700 font-bold' : 'text-gray-600'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={generateAllTasks}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                    >
                        Neue Aufgaben
                    </button>
                </div>
            </div>

            {tasksList.map((params, index) => {
                const selectedCount = selectedCounts[index];
                const userPoints = userPointsList[index] || [];
                const feedback = feedbacks[index];
                const showSolution = showSolutions[index];
                const showGraph = showGraphs[index];

                return (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-lg font-bold text-teal-800 mb-4 text-center">Aufgabe {index + 1}</h2>

                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-6 text-center">
                            <p className="text-lg mb-4">Berechne die Schnittpunkte der folgenden Funktionen:</p>
                            <div className="text-xl font-bold space-y-2">
                                {params.type === 'line-parabola' ? (
                                    <>
                                        <div className="text-red-600"><InlineMath math={`f(x) = ${params.a}x^2 ${formatLinearTerm(params.b!)} ${formatConstant(params.c!)}`} /></div>
                                        <div className="text-blue-600"><InlineMath math={`g(x) = ${params.m}x ${formatConstant(params.t!)}`} /></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-red-600"><InlineMath math={`f(x) = ${params.a1}x^2 ${formatLinearTerm(params.b1!)} ${formatConstant(params.c1!)}`} /></div>
                                        <div className="text-blue-600"><InlineMath math={`g(x) = ${params.a2}x^2 ${formatLinearTerm(params.b2!)} ${formatConstant(params.c2!)}`} /></div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-6 text-center">
                            <p className="block text-gray-700 font-medium mb-3">Wie viele Schnittpunkte gibt es?</p>
                            <div className="flex gap-3 mb-4 justify-center">
                                {[0, 1, 2].map(count => (
                                    <button
                                        key={count}
                                        onClick={() => handleCountSelect(index, count)}
                                        className={`px-4 py-2 rounded-lg border transition-colors ${
                                            selectedCount === count
                                            ? 'bg-teal-600 text-white border-teal-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {count === 0 ? 'Keine Schnittpunkte' : count === 1 ? 'Einen Schnittpunkt' : 'Zwei Schnittpunkte'}
                                    </button>
                                ))}
                            </div>

                            {selectedCount !== null && selectedCount > 0 && (
                                <div className="space-y-4">
                                    <p className="text-gray-700 font-medium text-center">Gib die Koordinaten ein:</p>
                                    {userPoints.map((point, pointIndex) => {
                                        const status = computePointStatuses(userPoints, params.points)[pointIndex];
                                        const fieldClass = (base: string) => {
                                            if (status === true) return `${base} border-green-500 bg-green-50 text-green-800`;
                                            if (status === false) return `${base} border-red-500 bg-red-50 text-red-800`;
                                            return `${base} border-gray-300`;
                                        };
                                        return (
                                            <div key={pointIndex} className="flex items-center justify-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <span className="font-bold text-gray-600">S{pointIndex + 1}:</span>
                                                <span className="text-gray-600">(</span>
                                                <input
                                                    type="text"
                                                    value={point.x}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePointChange(index, pointIndex, 'x', e.target.value)}
                                                    placeholder="x"
                                                    className={fieldClass("w-20 p-2 border rounded text-center focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors")}
                                                />
                                                <span className="text-gray-600">|</span>
                                                <input
                                                    type="text"
                                                    value={point.y}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePointChange(index, pointIndex, 'y', e.target.value)}
                                                    placeholder="y"
                                                    className={fieldClass("w-20 p-2 border rounded text-center focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors")}
                                                />
                                                <span className="text-gray-600">)</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center mb-6">
                            <button
                                onClick={() => checkAnswer(index)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Prüfen
                            </button>
                            <button
                                onClick={() => toggleSolution(index)}
                                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                            >
                                {showSolution ? "Lösung verbergen" : "Lösung anzeigen"}
                            </button>
                            <button
                                onClick={() => toggleGraph(index)}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                            >
                                {showGraph ? "Graph verbergen" : "Graph anzeigen"}
                            </button>
                        </div>

                        {feedback && (
                            <div className={`p-4 rounded-lg mb-6 text-center font-medium ${
                                feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                                feedback.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                                'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                                {feedback.message}
                            </div>
                        )}

                        {showSolution && renderSolution(params)}

                        {showGraph && (
                            <div className="mt-6 p-4 bg-slate-50 rounded-lg border-2 border-slate-300 flex justify-center">
                                <div id={`ggb-schnittpunkte-${index}`} style={{ width: `${PLOT_WIDTH}px`, height: `${PLOT_HEIGHT}px` }}></div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Schnittpunkte;
