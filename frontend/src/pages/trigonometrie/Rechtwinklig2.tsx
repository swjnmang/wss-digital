import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import GeoGebraApplet from '../../components/GeoGebraApplet';

const RIGHT_TRIANGLE_SIDES_VIDEO_URL = 'https://youtu.be/HfiouXm2n3E?si=h55pTSdKcdpaimjd';
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

const Rechtwinklig2: React.FC = () => {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({}); // key -> 'correct' | 'incorrect'
    const [showSolution, setShowSolution] = useState(false);
    const [mode, setMode] = useState<'angles' | 'sides' | 'random'>('random');

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

        // 2. Select Task Type based on mode
        let type: '2sides_angles' | '3sides_angles' | '2sides_1angle_side';
        
        if (mode === 'angles') {
            type = Math.random() < 0.5 ? '2sides_angles' : '3sides_angles';
        } else if (mode === 'sides') {
            type = '2sides_1angle_side';
        } else {
            const r = Math.random();
            if (r < 0.33) type = '2sides_angles';
            else if (r < 0.66) type = '3sides_angles';
            else type = '2sides_1angle_side';
        }

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
        } else if (type === '3sides_angles') {
            given = ['a', 'b', 'c', rightAngleKey];
            toFind = ['alpha', 'beta', 'gamma'].filter(k => k !== rightAngleKey);
            description = `Gegeben sind alle drei Seiten: ${formatGiven(given)}. Berechne die fehlenden Winkel.`;
        } else {
            const sides = ['a', 'b', 'c'];
            const targetSideIndex = Math.floor(Math.random() * 3);
            const targetSide = sides[targetSideIndex];
            
            const otherSides = sides.filter(s => s !== targetSide);
            // Give one of the non-90 angles
            const nonRightAngles = ['alpha', 'beta', 'gamma'].filter(k => k !== rightAngleKey);
            const angleToGive = nonRightAngles[Math.floor(Math.random() * nonRightAngles.length)];
            
            given = [...otherSides, angleToGive, rightAngleKey];
            toFind = [targetSide];
            description = `Gegeben sind: ${formatGiven(given)}. Berechne die fehlende Seite ${targetSide}.`;
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
    }, [mode]);

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
                `${symbol} = \\arctan(${formatNumber(ratio, 3)}) \\approx ${formatNumber(task[angleKey])}^{\\circ}`
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
                `${symbol} = \\arcsin(${formatNumber(ratio, 3)}) \\approx ${formatNumber(task[angleKey])}^{\\circ}`
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
                `${symbol} = \\arccos(${formatNumber(ratio, 3)}) \\approx ${formatNumber(task[angleKey])}^{\\circ}`
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

        const { a, b, c, given, toFind, orientation } = currentTask;
        
        // GeoGebra Commands
        const commands: string[] = [];
        
        // Setup View
        commands.push('ShowAxes(false)');
        commands.push('ShowGrid(false)');

        // Determine which vertex is the right angle
        let rightAngleVertex = 'C';
        if (currentTask.alpha === 90) rightAngleVertex = 'A';
        else if (currentTask.beta === 90) rightAngleVertex = 'B';

        // Determine lengths for drawing
        // We need width and height for the L-shape
        // If C=90: legs are a and b.
        // If A=90: legs are b and c.
        // If B=90: legs are a and c.
        
        let width = 0;
        let height = 0;
        
        // Mapping from visual points (Corner, Top, Right) to labels (A, B, C)
        let labelCorner = '';
        let labelTop = '';
        let labelRight = '';

        if (rightAngleVertex === 'C') {
            // Legs are a and b.
            // Let's randomly assign which is width/height to add more variety?
            // Or stick to standard: b is usually vertical if A is top?
            // Let's say: Corner=C. Top=A. Right=B.
            // Then vertical leg is CA (length b). Horizontal leg is CB (length a).
            labelCorner = 'C';
            labelTop = 'A';
            labelRight = 'B';
            height = b;
            width = a;
        } else if (rightAngleVertex === 'A') {
            // Legs are b and c.
            // Corner=A. Top=B. Right=C.
            // Vertical leg AB (length c). Horizontal leg AC (length b).
            labelCorner = 'A';
            labelTop = 'B';
            labelRight = 'C';
            height = c;
            width = b;
        } else { // B=90
            // Legs are a and c.
            // Corner=B. Top=C. Right=A.
            // Vertical leg BC (length a). Horizontal leg BA (length c).
            labelCorner = 'B';
            labelTop = 'C';
            labelRight = 'A';
            height = a;
            width = c;
        }

        // 1. Define Points based on orientation
        // Standard (0): Corner=(0,0), Top=(0,h), Right=(w,0)
        
        let Cx = 0, Cy = 0; // Coordinates for Corner
        let Tx = 0, Ty = 0; // Coordinates for Top
        let Rx = 0, Ry = 0; // Coordinates for Right

        switch (orientation) {
            case 0: // Bottom-Left
                Cx = 0; Cy = 0;
                Tx = 0; Ty = height;
                Rx = width; Ry = 0;
                break;
            case 1: // Bottom-Right
                Cx = width; Cy = 0;
                Tx = width; Ty = height;
                Rx = 0; Ry = 0;
                break;
            case 2: // Top-Right
                Cx = width; Cy = height;
                Tx = width; Ty = 0;
                Rx = 0; Ry = height;
                break;
            case 3: // Top-Left
                Cx = 0; Cy = height;
                Tx = 0; Ty = 0;
                Rx = width; Ry = height;
                break;
        }

        // Create points with correct labels
        commands.push(`${labelCorner} = (${Cx}, ${Cy})`);
        commands.push(`SetPointSize(${labelCorner}, 3)`);
        commands.push(`SetColor(${labelCorner}, 0, 0, 0)`);
        commands.push(`ShowLabel(${labelCorner}, true)`);
        commands.push(`SetLabelMode(${labelCorner}, 0)`);

        commands.push(`${labelTop} = (${Tx}, ${Ty})`);
        commands.push(`SetPointSize(${labelTop}, 3)`);
        commands.push(`SetColor(${labelTop}, 0, 0, 0)`);
        commands.push(`ShowLabel(${labelTop}, true)`);
        commands.push(`SetLabelMode(${labelTop}, 0)`);

        commands.push(`${labelRight} = (${Rx}, ${Ry})`);
        commands.push(`SetPointSize(${labelRight}, 3)`);
        commands.push(`SetColor(${labelRight}, 0, 0, 0)`);
        commands.push(`ShowLabel(${labelRight}, true)`);
        commands.push(`SetLabelMode(${labelRight}, 0)`);
        
        // 2. Draw Segments explicitly
        // We need to know which segment corresponds to a, b, c
        // a is opposite A. b is opposite B. c is opposite C.
        
        // Helper to set color and label
        const setStyle = (objName: string, key: string, val: number | string) => {
            commands.push(`SetLineThickness(${objName}, 5)`);
            
            // Color
            if (toFind.includes(key)) {
                commands.push(`SetColor(${objName}, 255, 0, 0)`); // Red
                commands.push(`SetCaption(${objName}, "?")`);
                commands.push(`SetLabelMode(${objName}, 3)`); // Caption
            } else {
                commands.push(`SetColor(${objName}, 0, 0, 0)`); // Black
                // Default label (name)
                const displayName = key === 'alpha' ? 'α' : key === 'beta' ? 'β' : key === 'gamma' ? 'γ' : key;
                commands.push(`SetCaption(${objName}, "${displayName}")`);
                commands.push(`SetLabelMode(${objName}, 3)`);
            }
        };

        // Draw segments between points
        // Segment BC is 'a'
        commands.push('seg_a = Segment(B, C)');
        setStyle('seg_a', 'a', a);

        // Segment AC is 'b'
        commands.push('seg_b = Segment(A, C)');
        setStyle('seg_b', 'b', b);

        // Segment AB is 'c'
        commands.push('seg_c = Segment(A, B)');
        setStyle('seg_c', 'c', c);

        // 3. Draw Polygon for fill (background)
        commands.push('poly1 = Polygon(A, B, C)');
        commands.push('SetColor(poly1, 240, 240, 240)');
        commands.push('SetLineThickness(poly1, 0)'); // Hide polygon edges
        commands.push('SetLayer(poly1, 0)'); // Move to back

        // 4. Draw Angles
        // Determine winding order: 
        // Orientation 0 (BL) and 2 (TR) are Clockwise (CW) IF we define points in specific order?
        // Actually, let's just use the standard Angle(Point, Vertex, Point) logic.
        // But we need to know if it's reflex or not.
        // The "Corner" angle is always 90.
        // The other two depend on orientation.
        
        // Let's use the "isCCW" logic again, but we need to map it to our points.
        // Orientation 0: Corner(BL) -> Right(BR) -> Top(TL) is CCW.
        // Wait, Corner(0,0), Right(w,0), Top(0,h).
        // Vector Corner->Right is (w,0). Corner->Top is (0,h). Cross product is positive (k). So CCW.
        // Orientation 1: Corner(BR) -> Right(BL) -> Top(TR).
        // Corner(w,0), Right(0,0), Top(w,h).
        // Vector Corner->Right (-w,0). Corner->Top (0,h). Cross product (-w*h) negative. CW.
        
        // Let's simplify: Just draw Angle(P1, Vertex, P2) and if it's > 180, swap P1/P2?
        // Or just use the orientation flag.
        
        // Orientation 0 (BL): CCW
        // Orientation 1 (BR): CW
        // Orientation 2 (TR): CCW
        // Orientation 3 (TL): CW
        
        const isCCW = (orientation === 0 || orientation === 2);

        // Helper to draw angle
        const drawAngle = (name: string, vertex: string, p1: string, p2: string, val: number) => {
            if (isCCW) {
                commands.push(`${name} = Angle(${p2}, ${vertex}, ${p1})`);
            } else {
                commands.push(`${name} = Angle(${p1}, ${vertex}, ${p2})`);
            }
            
            commands.push(`SetLineThickness(${name}, 3)`);
            
            // Style
            if (toFind.includes(name.replace('_ang', ''))) {
                commands.push(`SetColor(${name}, 255, 0, 0)`);
                commands.push(`SetCaption(${name}, "?")`);
                commands.push(`SetLabelMode(${name}, 3)`);
            } else if (val === 90) {
                // 90 degree angle - black, no label
                commands.push(`SetColor(${name}, 0, 0, 0)`);
                commands.push(`ShowLabel(${name}, false)`);
            } else {
                commands.push(`SetColor(${name}, 0, 0, 0)`);
                const displayName = name === 'alpha_ang' ? 'α' : name === 'beta_ang' ? 'β' : 'γ';
                commands.push(`SetCaption(${name}, "${displayName}")`);
                commands.push(`SetLabelMode(${name}, 3)`);
            }
        };

        // Alpha at A
        // Neighbors of A are B and C
        drawAngle('alpha_ang', 'A', 'B', 'C', currentTask.alpha);

        // Beta at B
        // Neighbors of B are A and C
        drawAngle('beta_ang', 'B', 'C', 'A', currentTask.beta);

        // Gamma at C
        // Neighbors of C are A and B
        drawAngle('gamma_ang', 'C', 'A', 'B', currentTask.gamma);

        
        // 5. View Settings
        // Calculate center
        // Bounding box is roughly (0,0) to (width, height) but shifted based on orientation.
        // We can just use the max dimension.
        const maxDim = Math.max(width, height);
        const margin = maxDim * 0.2;

        return (
            <div className="w-full max-w-[600px] mx-auto">
                <GeoGebraApplet 
                    id="ggb-rechtwinklig2"
                    width={600}
                    height={450}
                    commands={commands}
                    coordSystem={{
                        xmin: -margin,
                        xmax: width + margin,
                        ymin: -margin,
                        ymax: height + margin
                    }}
                    showToolBar={false}
                    showAlgebraInput={false}
                    showMenuBar={false}
                />
            </div>
        );
    };

    const solutionEntries = currentTask ? buildSolutionEntries(currentTask) : [];
    const givenSummary = currentTask ? currentTask.given.map(key => formatGivenValue(currentTask, key)).join(', ') : '';

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/trigonometrie" className="text-teal-600 hover:text-teal-700 font-bold mb-4 inline-block">
                ← Zurück zur Übersicht
            </Link>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-teal-800 text-center mb-6">
                    Rechtwinklige Dreiecke 2
                </h1>

                <div className="flex justify-center gap-4 mb-6">
                    <button 
                        onClick={() => setMode('angles')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'angles' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Winkel berechnen
                    </button>
                    <button 
                        onClick={() => setMode('sides')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'sides' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Streckenlänge berechnen
                    </button>
                    <button 
                        onClick={() => setMode('random')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'random' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Zufällige Aufgabe
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-teal-900">Video: Seitenlängen bestimmen</h2>
                        <a
                            href={RIGHT_TRIANGLE_SIDES_VIDEO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                        >
                            Video ansehen
                        </a>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col gap-2">
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

export default Rechtwinklig2;
