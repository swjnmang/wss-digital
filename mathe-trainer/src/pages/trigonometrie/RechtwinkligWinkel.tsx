import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import RightTriangleTaskSVG, { AngleKey as TaskAngleKey, SideKey as TaskSideKey } from '../../components/RightTriangleTaskSVG';

const RIGHT_TRIANGLE_ANGLES_VIDEO_URL = 'https://youtu.be/EsW65RuykZ8?si=u77ouc4I3QxouVZJ';

interface Task {
    // Triangle properties (gamma is always 90)
    a: number;
    b: number;
    c: number;
    alpha: number;
    beta: number;
    gamma: number;
    
    // Task configuration
    given: string[]; // keys of given values e.g. ['a', 'c', 'gamma']
    toFind: string[]; // keys of values to find e.g. ['alpha', 'beta']
    taskType: '2sides_angles' | '3sides_angles' | '2sides_1angle_side';
    description: string;
    orientation: number; // 0: Bottom-Left, 1: Bottom-Right, 2: Top-Right, 3: Top-Left
}

interface SolutionStep {
    text: string;
    math?: string;
}

type AngleKey = 'alpha' | 'beta' | 'gamma';
type SideKey = 'a' | 'b' | 'c';

const angleSymbols: Record<AngleKey, string> = {
    alpha: 'α',
    beta: 'β',
    gamma: 'γ'
};

const angleToSideMap: Record<AngleKey, SideKey> = {
    alpha: 'a',
    beta: 'b',
    gamma: 'c'
};

const angleKeys: AngleKey[] = ['alpha', 'beta', 'gamma'];
const sideKeys: SideKey[] = ['a', 'b', 'c'];

const isAngleKey = (key: string): key is AngleKey => angleKeys.includes(key as AngleKey);
const isSideKey = (key: string): key is SideKey => sideKeys.includes(key as SideKey);

const getRightAngleKey = (task: Task): AngleKey => {
    if (task.alpha === 90) return 'alpha';
    if (task.beta === 90) return 'beta';
    return 'gamma';
};

const getHypotenuseSide = (task: Task): SideKey => angleToSideMap[getRightAngleKey(task)];

const getAdjacentSide = (angleKey: AngleKey, task: Task): SideKey => {
    const opposite = angleToSideMap[angleKey];
    const hyp = getHypotenuseSide(task);
    const adjacent = sideKeys.find(side => side !== opposite && side !== hyp);
    return adjacent ?? hyp;
};

const getSideRoleForAngle = (angleKey: AngleKey, sideKey: SideKey, task: Task) => {
    const hyp = getHypotenuseSide(task);
    const opposite = angleToSideMap[angleKey];
    if (sideKey === hyp) return 'Hypotenuse';
    if (sideKey === opposite) return 'Gegenkathete';
    return 'Ankathete';
};

const formatNumber = (value: number, digits = 2) => {
    const fixed = value.toFixed(digits);
    return parseFloat(fixed).toString();
};

const formatGivenValue = (task: Task, key: string) => {
    if (isAngleKey(key)) {
        return `${angleSymbols[key]} = ${formatNumber(task[key])}°`;
    }
    if (isSideKey(key)) {
        return `${key} = ${formatNumber(task[key])}`;
    }
    return key;
};

const pushStep = (steps: SolutionStep[], text: string, math?: string) => {
    steps.push({ text, math });
};

const RechtwinkligWinkel: React.FC = () => {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({}); // key -> 'correct' | 'incorrect'
    const [showSolution, setShowSolution] = useState(false);

    // Helpers
    const degToRad = (degrees: number) => degrees * (Math.PI / 180);
    const radToDeg = (radians: number) => radians * (180 / Math.PI);
    const round = (num: number) => Math.round(num * 100) / 100;

    const generateTask = () => {
        // 1. Generate a random right-angled triangle
        // Base values
        const angle1 = Math.random() * 70 + 10; // 10 to 80 degrees
        const angle2 = 90 - angle1;
        const angle90 = 90;
        
        const hyp = Math.random() * 10 + 5;
        const leg1 = hyp * Math.sin(degToRad(angle1));
        const leg2 = hyp * Math.cos(degToRad(angle1));

        // Randomly assign right angle to A, B, or C
        const rightAngleAt = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
        
        let triangle: any = {};
        
        if (rightAngleAt === 'C') {
            // Standard: gamma=90
            triangle = {
                a: round(leg1),
                b: round(leg2),
                c: round(hyp),
                alpha: round(angle1),
                beta: round(angle2),
                gamma: 90
            };
        } else if (rightAngleAt === 'A') {
            // alpha=90
            triangle = {
                a: round(hyp),
                b: round(leg1),
                c: round(leg2),
                alpha: 90,
                beta: round(angle1),
                gamma: round(angle2)
            };
        } else {
            // beta=90
            triangle = {
                a: round(leg2),
                b: round(hyp),
                c: round(leg1),
                alpha: round(angle2),
                beta: 90,
                gamma: round(angle1)
            };
        }

        // Diese Seite fragt ausschließlich Winkel ab
        const type: '2sides_angles' | '3sides_angles' = Math.random() < 0.5 ? '2sides_angles' : '3sides_angles';

        let given: string[] = [];
        let toFind: string[] = [];
        let description = "";

        // Helper to format given values
        const formatGiven = (keys: string[]) => {
            return keys.filter(k => {
                // Filter out the 90 degree angle
                if (k === 'alpha' && triangle.alpha === 90) return false;
                if (k === 'beta' && triangle.beta === 90) return false;
                if (k === 'gamma' && triangle.gamma === 90) return false;
                return true;
            }).map(k => {
                const val = triangle[k];
                if (k === 'alpha') return `α = ${val}°`;
                if (k === 'beta') return `β = ${val}°`;
                if (k === 'gamma') return `γ = ${val}°`;
                return `${k} = ${val}`;
            }).join(', ');
        };

        // Identify the 90 degree angle key
        const rightAngleKey = rightAngleAt === 'A' ? 'alpha' : rightAngleAt === 'B' ? 'beta' : 'gamma';

        if (type === '2sides_angles') {
            const sides = ['a', 'b', 'c'];
            const hiddenSideIndex = Math.floor(Math.random() * 3);
            given = sides.filter((_, i) => i !== hiddenSideIndex);
            given.push(rightAngleKey);
            
            // Find angles that are NOT 90
            toFind = ['alpha', 'beta', 'gamma'].filter(k => k !== rightAngleKey);
            description = `Gegeben sind zwei Seiten: ${formatGiven(given)}. Berechne die fehlenden Winkel.`;
        } else {
            given = ['a', 'b', 'c', rightAngleKey];
            toFind = ['alpha', 'beta', 'gamma'].filter(k => k !== rightAngleKey);
            description = `Gegeben sind alle drei Seiten: ${formatGiven(given)}. Berechne die fehlenden Winkel.`;
        }

        // Random orientation 0-3
        const orientation = Math.floor(Math.random() * 4);

        setCurrentTask({
            ...triangle,
            given,
            toFind,
            taskType: type,
            description,
            orientation
        });
        setUserAnswers({});
        setFeedback({});
        setShowSolution(false);
    };

    useEffect(() => {
        generateTask();
    }, []);

    const checkAnswers = () => {
        if (!currentTask) return;
        
        const newFeedback: { [key: string]: string } = {};
        let allCorrect = true;

        currentTask.toFind.forEach(key => {
            const val = parseFloat(userAnswers[key]?.replace(',', '.') || '0');
            // @ts-ignore
            const correctVal = currentTask[key];
            
            // Tolerance: Angles +/- 1 degree, Sides +/- 0.1 (since we rounded inputs)
            // Actually, let's be a bit generous but not too much.
            const tolerance = key.includes('alpha') || key.includes('beta') ? 1.0 : 0.2;
            
            if (Math.abs(val - correctVal) < tolerance) {
                newFeedback[key] = 'correct';
            } else {
                newFeedback[key] = 'incorrect';
                allCorrect = false;
            }
        });

        setFeedback(newFeedback);
        if (allCorrect) {
            // maybe show confetti or something
        }
    };

    interface SolutionEntry {
        key: string;
        title: string;
        steps: SolutionStep[];
    }

    const describeSide = (angleKey: AngleKey, sideKey: SideKey, task: Task) => {
        const role = getSideRoleForAngle(angleKey, sideKey, task);
        return `${sideKey} (${role})`;
    };

    const buildAngleSolutionEntry = (angleKey: AngleKey, task: Task): SolutionEntry => {
        const symbol = angleSymbols[angleKey];
        const steps: SolutionStep[] = [];
        const rightAngleKey = getRightAngleKey(task);
        const hypSide = getHypotenuseSide(task);
        const oppositeSide = angleToSideMap[angleKey];
        const adjacentSide = getAdjacentSide(angleKey, task);
        const givenSides = new Set(task.given.filter((value): value is SideKey => isSideKey(value)));
        const hasOpposite = givenSides.has(oppositeSide);
        const hasAdjacent = givenSides.has(adjacentSide);
        const hasHyp = givenSides.has(hypSide);

        if (hasOpposite && hasAdjacent) {
            const ratio = task[oppositeSide] / task[adjacentSide];
            pushStep(
                steps,
                `Die Seiten ${describeSide(angleKey, oppositeSide, task)} und ${describeSide(angleKey, adjacentSide, task)} sind bekannt.`
            );
            pushStep(steps, 'Nutze den Tangens.', `\\tan(${symbol}) = \\frac{${oppositeSide}}{${adjacentSide}}`);
            pushStep(
                steps,
                'Setze die Werte ein.',
                `\\tan(${symbol}) = \\frac{${formatNumber(task[oppositeSide])}}{${formatNumber(task[adjacentSide])}} = ${formatNumber(ratio, 3)}`
            );
            pushStep(
                steps,
                'Forme nach dem Winkel um und runde.',
                `${symbol} = \\tan^{-1}(${formatNumber(ratio, 3)}) \\approx ${formatNumber(task[angleKey])}^{\\circ}`
            );
            return { key: angleKey, title: `${symbol} berechnen`, steps };
        }

        if (hasOpposite && hasHyp) {
            const ratio = task[oppositeSide] / task[hypSide];
            pushStep(
                steps,
                `Die Seite ${describeSide(angleKey, oppositeSide, task)} und die Hypotenuse ${hypSide} sind gegeben.`
            );
            pushStep(steps, 'Nutze den Sinus.', `\\sin(${symbol}) = \\frac{${oppositeSide}}{${hypSide}}`);
            pushStep(
                steps,
                'Setze die Werte ein.',
                `\\sin(${symbol}) = \\frac{${formatNumber(task[oppositeSide])}}{${formatNumber(task[hypSide])}} = ${formatNumber(ratio, 3)}`
            );
            pushStep(
                steps,
                'Bestimme den Winkel.',
                `${symbol} = \\sin^{-1}(${formatNumber(ratio, 3)}) \\approx ${formatNumber(task[angleKey])}^{\\circ}`
            );
            return { key: angleKey, title: `${symbol} berechnen`, steps };
        }

        if (hasAdjacent && hasHyp) {
            const ratio = task[adjacentSide] / task[hypSide];
            pushStep(
                steps,
                `Die Ankathete ${describeSide(angleKey, adjacentSide, task)} und die Hypotenuse ${hypSide} sind bekannt.`
            );
            pushStep(steps, 'Verwende den Kosinus.', `\\cos(${symbol}) = \\frac{${adjacentSide}}{${hypSide}}`);
            pushStep(
                steps,
                'Setze die Werte ein.',
                `\\cos(${symbol}) = \\frac{${formatNumber(task[adjacentSide])}}{${formatNumber(task[hypSide])}} = ${formatNumber(ratio, 3)}`
            );
            pushStep(
                steps,
                'Bestimme den Winkel.',
                `${symbol} = \\cos^{-1}(${formatNumber(ratio, 3)}) \\approx ${formatNumber(task[angleKey])}^{\\circ}`
            );
            return { key: angleKey, title: `${symbol} berechnen`, steps };
        }

        const knownAngle = angleKeys.find(k => k !== angleKey && k !== rightAngleKey && task.given.includes(k));
        if (knownAngle) {
            const otherSymbol = angleSymbols[knownAngle];
            const rightSymbol = angleSymbols[rightAngleKey];
            const calculated = 180 - task[rightAngleKey] - task[knownAngle];
            pushStep(steps, 'Nutze die Winkelsumme im Dreieck.', `\\alpha + \\beta + \\gamma = 180^{\\circ}`);
            pushStep(
                steps,
                `${rightSymbol} ist rechtwinklig (${formatNumber(task[rightAngleKey])}^{\\circ}), ${otherSymbol} ist bekannt (${formatNumber(task[knownAngle])}^{\\circ}).`
            );
            pushStep(
                steps,
                'Setze ein und löse nach dem gesuchten Winkel.',
                `${symbol} = 180^{\\circ} - ${formatNumber(task[rightAngleKey])}^{\\circ} - ${formatNumber(task[knownAngle])}^{\\circ} = ${formatNumber(calculated)}^{\\circ}`
            );
            return { key: angleKey, title: `${symbol} berechnen`, steps };
        }

        pushStep(steps, 'Es stehen nicht genügend Informationen zur Verfügung, um den Winkel herzuleiten.');
        return { key: angleKey, title: `${symbol} berechnen`, steps };
    };

    const buildSideSolutionEntry = (sideKey: SideKey, task: Task): SolutionEntry => {
        const steps: SolutionStep[] = [];
        const knownAngleKey = task.given.find((value): value is AngleKey => isAngleKey(value) && task[value] !== 90);
        const symbol = knownAngleKey ? angleSymbols[knownAngleKey] : angleSymbols[getRightAngleKey(task)];
        const angleValue = knownAngleKey ? task[knownAngleKey] : 0;
        const hypSide = getHypotenuseSide(task);
        const opposite = knownAngleKey ? angleToSideMap[knownAngleKey] : sideKey;
        const adjacent = knownAngleKey ? getAdjacentSide(knownAngleKey, task) : sideKey;
        const availableSides = new Set(task.given.filter((value): value is SideKey => isSideKey(value)));

        if (knownAngleKey) {
            const targetRole = getSideRoleForAngle(knownAngleKey, sideKey, task);

            if (targetRole === 'Gegenkathete') {
                if (availableSides.has(hypSide)) {
                    const approx = Math.sin(degToRad(angleValue)) * task[hypSide];
                    pushStep(
                        steps,
                        `Zum Winkel ${symbol} gehört ${sideKey} als Gegenkathete und ${hypSide} als Hypotenuse.`
                    );
                    pushStep(steps, 'Nutze den Sinus.', `\\sin(${symbol}) = \\frac{${sideKey}}{${hypSide}}`);
                    pushStep(steps, 'Löse nach der gesuchten Seite auf.', `${sideKey} = \\sin(${symbol}) \\cdot ${hypSide}`);
                    pushStep(
                        steps,
                        'Setze ein und berechne.',
                        `${sideKey} = \\sin(${formatNumber(angleValue)}^{\\circ}) \\cdot ${formatNumber(task[hypSide])} \\approx ${formatNumber(approx)}`
                    );
                    return { key: sideKey, title: `${sideKey} berechnen`, steps };
                }
                if (availableSides.has(adjacent)) {
                    const approx = Math.tan(degToRad(angleValue)) * task[adjacent];
                    pushStep(steps, `${sideKey} ist die Gegenkathete, ${adjacent} die Ankathete.`);
                    pushStep(steps, 'Verwende den Tangens.', `\\tan(${symbol}) = \\frac{${sideKey}}{${adjacent}}`);
                    pushStep(steps, 'Löse nach der gesuchten Seite.', `${sideKey} = \\tan(${symbol}) \\cdot ${adjacent}`);
                    pushStep(
                        steps,
                        'Setze ein und runde.',
                        `${sideKey} = \\tan(${formatNumber(angleValue)}^{\\circ}) \\cdot ${formatNumber(task[adjacent])} \\approx ${formatNumber(approx)}`
                    );
                    return { key: sideKey, title: `${sideKey} berechnen`, steps };
                }
            }

            if (targetRole === 'Ankathete') {
                if (availableSides.has(hypSide)) {
                    const approx = Math.cos(degToRad(angleValue)) * task[hypSide];
                    pushStep(steps, `${sideKey} liegt dem Winkel ${symbol} an, ${hypSide} ist die Hypotenuse.`);
                    pushStep(steps, 'Verwende den Kosinus.', `\\cos(${symbol}) = \\frac{${sideKey}}{${hypSide}}`);
                    pushStep(steps, 'Löse nach der gesuchten Seite.', `${sideKey} = \\cos(${symbol}) \\cdot ${hypSide}`);
                    pushStep(
                        steps,
                        'Setze ein und runde.',
                        `${sideKey} = \\cos(${formatNumber(angleValue)}^{\\circ}) \\cdot ${formatNumber(task[hypSide])} \\approx ${formatNumber(approx)}`
                    );
                    return { key: sideKey, title: `${sideKey} berechnen`, steps };
                }
                if (availableSides.has(opposite)) {
                    const approx = task[opposite] / Math.tan(degToRad(angleValue));
                    pushStep(steps, `${sideKey} ist die Ankathete, ${opposite} die Gegenkathete.`);
                    pushStep(steps, 'Verwende erneut den Tangens.', `\\tan(${symbol}) = \\frac{${opposite}}{${sideKey}}`);
                    pushStep(steps, 'Forme nach der Ankathete um.', `${sideKey} = \\frac{${opposite}}{\\tan(${symbol})}`);
                    pushStep(
                        steps,
                        'Setze die Werte ein.',
                        `${sideKey} = \\frac{${formatNumber(task[opposite])}}{\\tan(${formatNumber(angleValue)}^{\\circ})} \\approx ${formatNumber(approx)}`
                    );
                    return { key: sideKey, title: `${sideKey} berechnen`, steps };
                }
            }

            if (targetRole === 'Hypotenuse') {
                if (availableSides.has(opposite)) {
                    const approx = task[opposite] / Math.sin(degToRad(angleValue));
                    pushStep(steps, `${sideKey} ist die Hypotenuse, ${opposite} liegt gegenüber von ${symbol}.`);
                    pushStep(steps, 'Nutze den Sinus.', `\\sin(${symbol}) = \\frac{${opposite}}{${sideKey}}`);
                    pushStep(steps, 'Forme nach der Hypotenuse um.', `${sideKey} = \\frac{${opposite}}{\\sin(${symbol})}`);
                    pushStep(
                        steps,
                        'Setze die Werte ein.',
                        `${sideKey} = \\frac{${formatNumber(task[opposite])}}{\\sin(${formatNumber(angleValue)}^{\\circ})} \\approx ${formatNumber(approx)}`
                    );
                    return { key: sideKey, title: `${sideKey} berechnen`, steps };
                }
                if (availableSides.has(adjacent)) {
                    const approx = task[adjacent] / Math.cos(degToRad(angleValue));
                    pushStep(steps, `${adjacent} ist die Ankathete zum Winkel ${symbol}.`);
                    pushStep(steps, 'Verwende den Kosinus.', `\\cos(${symbol}) = \\frac{${adjacent}}{${sideKey}}`);
                    pushStep(steps, 'Stelle nach der Hypotenuse um.', `${sideKey} = \\frac{${adjacent}}{\\cos(${symbol})}`);
                    pushStep(
                        steps,
                        'Setze die Werte ein.',
                        `${sideKey} = \\frac{${formatNumber(task[adjacent])}}{\\cos(${formatNumber(angleValue)}^{\\circ})} \\approx ${formatNumber(approx)}`
                    );
                    return { key: sideKey, title: `${sideKey} berechnen`, steps };
                }
            }
        }

        const otherSides = sideKeys.filter(s => s !== sideKey);
        pushStep(steps, 'Nutze den Satz des Pythagoras.');
        const hypSideForTriangle = getHypotenuseSide(task);
        if (sideKey === hypSideForTriangle) {
            const catheti = otherSides;
            const sumSquares = catheti.reduce((sum, side) => sum + Math.pow(task[side], 2), 0);
            pushStep(steps, 'Stelle die Gleichung für die Hypotenuse auf.', `${sideKey}^2 = ${catheti[0]}^2 + ${catheti[1]}^2`);
            pushStep(
                steps,
                'Setze die Längen ein.',
                `${sideKey}^2 = ${formatNumber(task[catheti[0]])}^2 + ${formatNumber(task[catheti[1]])}^2`
            );
            pushStep(
                steps,
                'Ziehe die Wurzel.',
                `${sideKey} = \\sqrt{${formatNumber(sumSquares)}} \\approx ${formatNumber(Math.sqrt(sumSquares))}`
            );
        } else {
            const otherCathetus = otherSides.find(side => side !== hypSideForTriangle) ?? otherSides[0];
            const squaredDifference = Math.pow(task[hypSideForTriangle], 2) - Math.pow(task[otherCathetus], 2);
            pushStep(steps, 'Stelle die Gleichung für die Kathete auf.', `${hypSideForTriangle}^2 = ${sideKey}^2 + ${otherCathetus}^2`);
            pushStep(steps, 'Forme nach der gesuchten Seite um.', `${sideKey}^2 = ${hypSideForTriangle}^2 - ${otherCathetus}^2`);
            pushStep(
                steps,
                'Setze die Werte ein.',
                `${sideKey}^2 = ${formatNumber(task[hypSideForTriangle])}^2 - ${formatNumber(task[otherCathetus])}^2`
            );
            pushStep(
                steps,
                'Ziehe die Wurzel.',
                `${sideKey} = \\sqrt{${formatNumber(Math.max(squaredDifference, 0))}} \\approx ${formatNumber(Math.sqrt(Math.max(squaredDifference, 0)))}`
            );
        }
        return { key: sideKey, title: `${sideKey} berechnen`, steps };
    };

    const buildSolutionEntries = (task: Task): SolutionEntry[] => {
        return task.toFind.map(key => {
            if (isAngleKey(key)) return buildAngleSolutionEntry(key, task);
            if (isSideKey(key)) return buildSideSolutionEntry(key, task);
            return { key, title: key, steps: [{ text: 'Für diese Größe konnte kein Lösungsweg bestimmt werden.' }] };
        });
    };

    const renderTriangle = () => {
        if (!currentTask) return null;

        const rightAnglePoint: 'A' | 'B' | 'C' =
            currentTask.alpha === 90 ? 'A' : currentTask.beta === 90 ? 'B' : 'C';

        const highlightSides = currentTask.toFind.filter(isSideKey) as TaskSideKey[];
        const highlightAngles = currentTask.toFind.filter(isAngleKey) as TaskAngleKey[];

        return (
            <div className="w-full max-w-[500px] mx-auto h-[350px] bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
                <RightTriangleTaskSVG
                    rightAngleAtPoint={rightAnglePoint}
                    highlightSides={highlightSides}
                    highlightAngles={highlightAngles}
                />
            </div>
        );
    };

    const solutionEntries = currentTask ? buildSolutionEntries(currentTask) : [];
    const givenSummary = currentTask ? currentTask.given.map(key => formatGivenValue(currentTask, key)).join(', ') : '';

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-teal-800 text-center mb-6">
                    Winkel berechnen mit Sinus, Kosinus und Tangens
                </h1>

                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col gap-2 items-center max-w-md">
                        <h2 className="text-lg font-semibold text-indigo-900">Video: Winkel bestimmen</h2>
                        <a
                            href={RIGHT_TRIANGLE_ANGLES_VIDEO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                        >
                            Video ansehen
                        </a>
                    </div>
                </div>

                <div className="flex justify-center mb-6">
                    <a
                        href="/downloads/winkel-berechnen-sinus-kosinus-tangens-uebungen.pdf"
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                        📄 Übungsblatt (PDF) herunterladen
                    </a>
                </div>

                <div className="flex justify-center mb-6">
                    {renderTriangle()}
                </div>

                {currentTask && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 text-center">
                        <p className="text-lg font-medium mb-2">{currentTask.description}</p>
                    </div>
                )}

                <div className="grid gap-4 mb-6 max-w-md mx-auto">
                    {currentTask?.toFind.map(key => (
                        <div key={key} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <label className="font-medium w-24">
                                {key === 'alpha' ? 'α' : key === 'beta' ? 'β' : key}:
                            </label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    value={userAnswers[key] || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswers({...userAnswers, [key]: e.target.value})}
                                    className={`p-2 border rounded-lg w-32 text-center ${
                                        feedback[key] === 'correct' ? 'border-green-500 bg-green-50' :
                                        feedback[key] === 'incorrect' ? 'border-red-500 bg-red-50' :
                                        'border-gray-300'
                                    }`}
                                    placeholder="Lösung"
                                />
                                <span className="text-gray-500 w-8">
                                    {key === 'alpha' || key === 'beta' ? '°' : ''}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-4 mb-6">
                    <button 
                        onClick={checkAnswers}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Prüfen
                    </button>
                    <button 
                        onClick={() => setShowSolution(!showSolution)}
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                    >
                        {showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
                    </button>
                    <button 
                        onClick={generateTask}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                    >
                        Neue Aufgabe
                    </button>
                </div>

                {showSolution && currentTask && (
                    <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 text-left">
                        <h3 className="font-bold text-lg mb-4">Lösungsweg:</h3>
                        {givenSummary && (
                            <p className="text-gray-700 mb-4">
                                <span className="font-semibold">Gegeben:</span> {givenSummary}
                            </p>
                        )}
                        <div className="space-y-4">
                            {solutionEntries.map(entry => (
                                <div key={entry.key} className="bg-white rounded-lg border border-gray-200 p-4">
                                    <h4 className="font-semibold text-gray-800 mb-2">{entry.title}</h4>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                        {entry.steps.map((step, idx) => (
                                            <li key={`${entry.key}-${idx}`} className="space-y-1">
                                                <p className="font-medium text-gray-800">{step.text}</p>
                                                {step.math && (
                                                    <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 inline-block">
                                                        <InlineMath math={step.math} />
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RechtwinkligWinkel;
