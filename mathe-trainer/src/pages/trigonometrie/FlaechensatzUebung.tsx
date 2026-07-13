import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Task {
    description: string;
    solutionSteps: { heading: string; text: string; math?: string }[];
    sketchSVG: string;
    correctAnswer: number;
    unit: string;
    answerLabel: string;
}

const FLAECHENSATZ_VIDEO_URL = 'https://youtu.be/JFoLf3uT4DM?si=V1t-joWFciTN8ruX';

// Damit Schüler:innen nicht nur das Dreieck a, b, c kennenlernen, wird die Beschriftung
// zufällig auch auf b, c, d verschoben. Geometrie und Rechenweg bleiben identisch,
// nur die angezeigten Buchstaben/Symbole ändern sich.
type LetterScheme = 'ABC' | 'BCD';

const LETTER_SCHEMES: Record<
    LetterScheme,
    {
        vertices: { A: string; B: string; C: string };
        sides: { a: string; b: string; c: string };
        angleSymbols: { alpha: string; beta: string; gamma: string };
        angleLatex: { alpha: string; beta: string; gamma: string };
        angleWords: { alpha: string; beta: string; gamma: string };
    }
> = {
    ABC: {
        vertices: { A: 'A', B: 'B', C: 'C' },
        sides: { a: 'a', b: 'b', c: 'c' },
        angleSymbols: { alpha: 'α', beta: 'β', gamma: 'γ' },
        angleLatex: { alpha: '\\alpha', beta: '\\beta', gamma: '\\gamma' },
        angleWords: { alpha: 'alpha', beta: 'beta', gamma: 'gamma' }
    },
    BCD: {
        vertices: { A: 'B', B: 'C', C: 'D' },
        sides: { a: 'b', b: 'c', c: 'd' },
        angleSymbols: { alpha: 'β', beta: 'γ', gamma: 'δ' },
        angleLatex: { alpha: '\\beta', beta: '\\gamma', gamma: '\\delta' },
        angleWords: { alpha: 'beta', beta: 'gamma', gamma: 'delta' }
    }
};

const FlaechensatzUebung: React.FC = () => {
    const [task, setTask] = useState<Task | null>(null);
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [taskType, setTaskType] = useState<'area' | 'unknown'>('area');
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'info' | null>(null);

    // Helpers
    const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;
    const degToRad = (degrees: number) => degrees * (Math.PI / 180);
    const radToDeg = (radians: number) => radians * (180 / Math.PI);
    const round = (value: number, decimals: number) => {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    };
    // Maximal 1% relative Toleranz bei der Ergebniseingabe, mit kleiner Mindesttoleranz für sehr kleine Werte
    const relTolerance = (value: number, min = 0.01) => Math.max(Math.abs(value) * 0.01, min);

    const generateTriangleAngles = () => {
        let alpha_deg, beta_deg, gamma_deg;
        do {
            alpha_deg = getRandom(20, 140);
            beta_deg = getRandom(20, 140);
            gamma_deg = 180 - alpha_deg - beta_deg;
        } while (gamma_deg < 20 || gamma_deg > 140);

        return {
            alpha_deg, beta_deg, gamma_deg,
            alpha_rad: degToRad(alpha_deg),
            beta_rad: degToRad(beta_deg),
            gamma_rad: degToRad(gamma_deg)
        };
    };

    const calculateSides = (angles: any, sideA: number) => {
        const b = (sideA * Math.sin(angles.beta_rad)) / Math.sin(angles.alpha_rad);
        const c = (sideA * Math.sin(angles.gamma_rad)) / Math.sin(angles.alpha_rad);
        return { a: sideA, b, c };
    };

    const createTriangleSketch = (angles: any, sides: any, formulaType: string, unknownElement: string | null, scheme: LetterScheme) => {
        const L = LETTER_SCHEMES[scheme];
        const svgBaseWidth = 350;
        const svgBaseHeight = 250;
        const padding = 30;

        const pointA = { x: padding, y: svgBaseHeight - padding };
        const pointB = { x: svgBaseWidth - padding, y: svgBaseHeight - padding };

        const angleA_rad = angles.alpha_rad;
        const angleB_rad = angles.beta_rad;

        const tanA = Math.tan(-angleA_rad);
        const tanB = Math.tan(Math.PI + angleB_rad);

        let pointC = { x: svgBaseWidth / 2, y: padding };

        if (Math.abs(tanA - tanB) > 1e-6) {
             pointC.x = (tanA * pointA.x - pointA.y - tanB * pointB.x + pointB.y) / (tanA - tanB);
             pointC.y = tanA * (pointC.x - pointA.x) + pointA.y;
        }

        const points = [pointA, pointB, pointC];

        // Labels
        let labelA = L.sides.a;
        let labelB = L.sides.b;
        let labelC = L.sides.c;

        if (unknownElement && unknownElement.startsWith('unknown-side')) {
            const unknownSideLetter = unknownElement.slice('unknown-side-'.length);
            if (unknownSideLetter === 'a') labelA = '?';
            if (unknownSideLetter === 'b') labelB = '?';
            if (unknownSideLetter === 'c') labelC = '?';
        }

        const midAB = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 + 20 };
        const midBC = { x: (points[1].x + points[2].x) / 2 + 15, y: (points[1].y + points[2].y) / 2 };
        const midAC = { x: (points[0].x + points[2].x) / 2 - 15, y: (points[0].y + points[2].y) / 2 };

        // Alle Punkte sammeln, die beim Zeichnen vorkommen, damit die viewBox am Ende
        // so berechnet werden kann, dass nichts abgeschnitten wird (z. B. bei sehr
        // spitzen oder stumpfen Winkeln, bei denen C weit außerhalb der Basisbreite liegt).
        const boundsPoints = [pointA, pointB, pointC, midAB, midBC, midAC];

        // SVG Construction
        let svgContent = '';

        // Triangle
        svgContent += `<polygon points="${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y}" style="fill:none;stroke:black;stroke-width:1.5" />`;

        // Vertices
        svgContent += `<text x="${points[0].x - 5}" y="${points[0].y + 10}" font-size="14" text-anchor="end" fill="#333">${L.vertices.A}</text>`;
        svgContent += `<text x="${points[1].x + 5}" y="${points[1].y + 10}" font-size="14" text-anchor="start" fill="#333">${L.vertices.B}</text>`;
        svgContent += `<text x="${points[2].x}" y="${points[2].y - 5}" font-size="14" text-anchor="middle" fill="#333">${L.vertices.C}</text>`;

        // Sides
        svgContent += `<text x="${midBC.x}" y="${midBC.y}" font-size="16" text-anchor="start" fill="${labelA === '?' ? 'red' : 'black'}">${labelA}</text>`;
        svgContent += `<text x="${midAC.x}" y="${midAC.y}" font-size="16" text-anchor="end" fill="${labelB === '?' ? 'red' : 'black'}">${labelB}</text>`;
        svgContent += `<text x="${midAB.x}" y="${midAB.y}" font-size="16" text-anchor="middle" fill="${labelC === '?' ? 'red' : 'black'}">${labelC}</text>`;

        // Angles helper
        const addAngleLabel = (vertex: any, p1: any, p2: any, label: string, isUnknown: boolean, formulaName: string) => {
            if (isUnknown) {
                const pos = { x: vertex.x + (p1.x > vertex.x ? 20 : -20), y: vertex.y + (p1.y > vertex.y ? 20 : -5) };
                boundsPoints.push(pos);
                svgContent += `<text x="${pos.x}" y="${pos.y}" font-size="18" text-anchor="middle" fill="red">?</text>`;
            } else {
                const radius = 20;
                const vec1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
                const vec2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
                const ang1 = Math.atan2(vec1.y, vec1.x);
                const ang2 = Math.atan2(vec2.y, vec2.x);

                let start = Math.min(ang1, ang2);
                let end = Math.max(ang1, ang2);
                if (end - start > Math.PI) [start, end] = [end, start + 2 * Math.PI];
                else if (end - start < -Math.PI) [start, end] = [end - 2 * Math.PI, start];

                const sx = vertex.x + radius * Math.cos(start);
                const sy = vertex.y + radius * Math.sin(start);
                const ex = vertex.x + radius * Math.cos(end);
                const ey = vertex.y + radius * Math.sin(end);

                svgContent += `<path d="M ${sx},${sy} A ${radius},${radius} 0 0 ${end > start ? 1 : 0} ${ex},${ey}" fill="none" stroke="black" stroke-width="1"/>`;

                const midAng = (start + end) / 2;
                const lx = vertex.x + (radius + 15) * Math.cos(midAng);
                const ly = vertex.y + (radius + 15) * Math.sin(midAng);
                boundsPoints.push({ x: lx, y: ly });

                const color = formulaType === formulaName ? 'blue' : 'black';
                svgContent += `<text x="${lx}" y="${ly}" font-size="14" text-anchor="middle" fill="${color}">${label}</text>`;
            }
        };

        addAngleLabel(points[0], points[2], points[1], L.angleSymbols.alpha, unknownElement === 'unknown-angle-alpha', 'alpha');
        addAngleLabel(points[1], points[0], points[2], L.angleSymbols.beta, unknownElement === 'unknown-angle-beta', 'beta');
        addAngleLabel(points[2], points[0], points[1], L.angleSymbols.gamma, unknownElement === 'unknown-angle-gamma', 'gamma');

        // viewBox so berechnen, dass alle Punkte und Beschriftungen sichtbar sind.
        // Das Seitenverhältnis wird dabei begrenzt, damit das Dreieck bei extremen
        // Winkeln weder riesig noch winzig dargestellt wird.
        const margin = 22;
        let minX = Math.min(...boundsPoints.map(p => p.x)) - margin;
        let maxX = Math.max(...boundsPoints.map(p => p.x)) + margin;
        let minY = Math.min(...boundsPoints.map(p => p.y)) - margin;
        let maxY = Math.max(...boundsPoints.map(p => p.y)) + margin;

        let boxWidth = maxX - minX;
        let boxHeight = maxY - minY;
        const maxAspect = 1.5;
        if (boxWidth / boxHeight > maxAspect) {
            const targetHeight = boxWidth / maxAspect;
            const extra = (targetHeight - boxHeight) / 2;
            minY -= extra;
            maxY += extra;
            boxHeight = targetHeight;
        } else if (boxHeight / boxWidth > maxAspect) {
            const targetWidth = boxHeight / maxAspect;
            const extra = (targetWidth - boxWidth) / 2;
            minX -= extra;
            maxX += extra;
            boxWidth = targetWidth;
        }

        const viewBoxAttr = `${minX} ${minY} ${boxWidth} ${boxHeight}`;

        return `<svg viewBox="${viewBoxAttr}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
    };

    const generateTask = () => {
        setShowSolution(false);
        const angles = generateTriangleAngles();
        const baseSideA = getRandom(5, 15);
        const sides = calculateSides(angles, baseSideA);
        const scheme: LetterScheme = Math.random() < 0.5 ? 'ABC' : 'BCD';
        const L = LETTER_SCHEMES[scheme];

        const roundedSides = {
            a: round(sides.a, 2),
            b: round(sides.b, 2),
            c: round(sides.c, 2)
        };
        const roundedAngles = {
            alpha: round(angles.alpha_deg, 1),
            beta: round(angles.beta_deg, 1),
            gamma: round(angles.gamma_deg, 1)
        };

        const formulaVariation = Math.floor(Math.random() * 3);
        const formulaMapping = [
            { sides: ['a', 'b'], angle: 'gamma' },
            { sides: ['b', 'c'], angle: 'alpha' },
            { sides: ['a', 'c'], angle: 'beta' }
        ];

        const chosen = formulaMapping[formulaVariation];
        const side1 = chosen.sides[0] as keyof typeof roundedSides;
        const side2 = chosen.sides[1] as keyof typeof roundedSides;
        const angle = chosen.angle as keyof typeof roundedAngles;
        const formulaText = `A = \\frac{1}{2} \\cdot ${L.sides[side1]} \\cdot ${L.sides[side2]} \\cdot \\sin(${L.angleLatex[angle]})`;

        const side1Value = roundedSides[side1];
        const side2Value = roundedSides[side2];
        const angleValue = roundedAngles[angle];
        const side1Label = L.sides[side1];
        const side2Label = L.sides[side2];
        const angleWord = L.angleWords[angle];
        const angleLatex = L.angleLatex[angle];

        // Der Flächeninhalt wird konsequent aus genau den Werten berechnet, die dem
        // Schüler auch angezeigt werden (side1Value, side2Value, angleValue). So passt
        // das gezeigte Ergebnis immer zu den gezeigten Zwischenschritten.
        const areaValue = 0.5 * side1Value * side2Value * Math.sin(degToRad(angleValue));
        const roundedArea = round(areaValue, 2);

        let description = "";
        let solutionSteps = [];
        let sketchSVG = "";
        let unknownElement = null;
        let correctAnswer = 0;
        let unit = "";
        let answerLabel = "";

        if (taskType === 'area') {
            description = `Berechnen Sie den Flächeninhalt eines Dreiecks mit den Seitenlängen ${side1Label} = ${side1Value} cm und ${side2Label} = ${side2Value} cm sowie dem eingeschlossenen Winkel ${angleWord} = ${angleValue}°.`;

            solutionSteps.push({
                heading: "Schritt 1: Formel aufschreiben",
                text: "Der Flächeninhalt eines Dreiecks kann mit der Formel berechnet werden, wenn zwei Seiten und der eingeschlossene Winkel bekannt sind:",
                math: formulaText
            });
            solutionSteps.push({
                heading: "Schritt 2: Werte einsetzen",
                text: "Setzen Sie die gegebenen Werte in die Formel ein:",
                math: `A = \\frac{1}{2} \\cdot ${side1Value} \\cdot ${side2Value} \\cdot \\sin(${angleValue}^\\circ)`
            });
            solutionSteps.push({
                heading: "Schritt 3: Berechnen",
                text: "Berechnen Sie den Flächeninhalt:",
                math: `A \\approx ${roundedArea} \\text{ cm}^2`
            });

            sketchSVG = createTriangleSketch(angles, roundedSides, angle, null, scheme);
            correctAnswer = roundedArea;
            unit = "cm²";
            answerLabel = "A";
        } else {
            const findSideOrAngle = Math.random() < 0.5 ? 'side' : 'angle';

            if (findSideOrAngle === 'side') {
                const unknownSideIndex = Math.floor(Math.random() * 2);
                const unknownSide = chosen.sides[unknownSideIndex] as keyof typeof roundedSides;
                const knownSide = chosen.sides[1 - unknownSideIndex] as keyof typeof roundedSides;

                const knownSideValue = roundedSides[knownSide];
                const unknownSideLabel = L.sides[unknownSide];
                const knownSideLabel = L.sides[knownSide];
                // Aus den angezeigten (gerundeten) Werten für A, die bekannte Seite und den Winkel
                // neu berechnen, damit das Ergebnis exakt zu den gezeigten Rechenschritten passt.
                const unknownSideValue = round((2 * roundedArea) / (knownSideValue * Math.sin(degToRad(angleValue))), 2);

                description = `Ein Dreieck hat den Flächeninhalt A = ${roundedArea} cm². Eine Seite hat die Länge ${knownSideLabel} = ${knownSideValue} cm, und der eingeschlossene Winkel beträgt ${angleWord} = ${angleValue}°. Berechnen Sie die Länge der Seite ${unknownSideLabel}.`;
                unknownElement = `unknown-side-${unknownSide}`;

                solutionSteps.push({
                    heading: "Schritt 1: Formel aufschreiben",
                    text: "Die Formel für den Flächeninhalt lautet:",
                    math: formulaText
                });
                solutionSteps.push({
                    heading: "Schritt 2: Formel umstellen",
                    text: `Um die unbekannte Seite ${unknownSideLabel} zu finden, stellen wir die Formel um:`,
                    math: `${unknownSideLabel} = \\frac{2 \\cdot A}{${knownSideLabel} \\cdot \\sin(${angleLatex})}`
                });
                solutionSteps.push({
                    heading: "Schritt 3: Werte einsetzen",
                    text: "Setzen Sie die gegebenen Werte ein:",
                    math: `${unknownSideLabel} = \\frac{2 \\cdot ${roundedArea}}{${knownSideValue} \\cdot \\sin(${angleValue}^\\circ)}`
                });
                solutionSteps.push({
                    heading: "Schritt 4: Berechnen",
                    text: "Berechnen Sie die Länge der Seite:",
                    math: `${unknownSideLabel} \\approx ${unknownSideValue} \\text{ cm}`
                });

                sketchSVG = createTriangleSketch(angles, roundedSides, angle, unknownElement, scheme);
                correctAnswer = unknownSideValue;
                unit = "cm";
                answerLabel = unknownSideLabel;
            } else {
                const sin_angle_calc = (2 * roundedArea) / (side1Value * side2Value);
                const sin_angle_clamped = Math.max(-1, Math.min(1, sin_angle_calc));
                const angle_rad_arcsin = Math.asin(sin_angle_clamped);
                const angle_deg_arcsin = round(radToDeg(angle_rad_arcsin), 1);

                description = `Ein Dreieck hat den Flächeninhalt A = ${roundedArea} cm². Zwei Seiten, die den Winkel ${angleWord} einschließen, haben die Längen ${side1Label} = ${side1Value} cm und ${side2Label} = ${side2Value} cm. Berechnen Sie die Größe des Winkels ${angleWord}.`;
                unknownElement = `unknown-angle-${angle}`;

                solutionSteps.push({
                    heading: "Schritt 1: Formel aufschreiben",
                    text: "Die Formel für den Flächeninhalt lautet:",
                    math: formulaText
                });
                solutionSteps.push({
                    heading: "Schritt 2: Formel umstellen",
                    text: `Um den Winkel ${angleWord} zu finden, stellen wir die Formel nach sin(${angleWord}) um:`,
                    math: `\\sin(${angleLatex}) = \\frac{2 \\cdot A}{${side1Label} \\cdot ${side2Label}}`
                });
                solutionSteps.push({
                    heading: "Schritt 3: Werte einsetzen und berechnen",
                    text: `Wir berechnen den Sinuswert und dann den Winkel mit Arcussinus:`,
                    math: `\\sin(${angleLatex}) = \\frac{2 \\cdot ${roundedArea}}{${side1Value} \\cdot ${side2Value}} \\approx ${round(sin_angle_clamped, 3)} \\implies ${angleLatex} \\approx ${angle_deg_arcsin}^\\circ`
                });

                sketchSVG = createTriangleSketch(angles, roundedSides, angle, unknownElement, scheme);
                correctAnswer = angle_deg_arcsin;
                unit = "°";
                answerLabel = angleWord;
            }
        }

        setTask({ description, solutionSteps, sketchSVG, correctAnswer, unit, answerLabel });
        setUserAnswer('');
        setFeedback(null);
    };

    useEffect(() => {
        generateTask();
    }, [taskType]);

    const checkAnswer = () => {
        if (!task) return;
        const cleaned = userAnswer.replace(',', '.');
        const value = parseFloat(cleaned);
        if (Number.isNaN(value)) {
            setFeedback('info');
            return;
        }
        const tolerance = relTolerance(task.correctAnswer);
        setFeedback(Math.abs(value - task.correctAnswer) <= tolerance ? 'correct' : 'incorrect');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/trigonometrie/flaechensatz" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 text-sm font-medium mb-4">
                <i className="fa-solid fa-arrow-left"></i> Zurück zur Übersicht
            </Link>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-teal-800 text-center mb-6">
                    Übungsaufgaben zum Flächensatz
                </h1>

                <div className="border border-teal-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-teal-900">Lernvideo zum Flächensatz</h2>
                    <a
                        href={FLAECHENSATZ_VIDEO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                    >
                        Video ansehen
                    </a>
                </div>

                <div className="flex justify-center gap-4 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={taskType === 'area'}
                            onChange={() => setTaskType('area')}
                            className="w-4 h-4 text-teal-600"
                        />
                        <span>Flächeninhalt berechnen</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={taskType === 'unknown'}
                            onChange={() => setTaskType('unknown')}
                            className="w-4 h-4 text-teal-600"
                        />
                        <span>Winkel oder Strecke berechnen</span>
                    </label>
                </div>

                {task && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                            <p className="text-lg">{task.description}</p>
                        </div>

                        <div className="flex justify-center">
                            <div
                                className="w-full max-w-md h-64 sm:h-72 border border-gray-200 rounded-lg bg-white p-4"
                                dangerouslySetInnerHTML={{ __html: task.sketchSVG }}
                            />
                        </div>

                        <div className="flex justify-center">
                            <div className="flex items-center gap-2">
                                <label className="font-semibold text-gray-700">
                                    {task.answerLabel} =
                                </label>
                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-center"
                                    placeholder="Lösung"
                                />
                                <span className="text-gray-500 w-10">{task.unit}</span>
                            </div>
                        </div>

                        {feedback === 'info' && (
                            <p className="text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                Bitte gib eine Zahl ein.
                            </p>
                        )}
                        {feedback === 'correct' && (
                            <p className="text-green-700 bg-green-100 border border-green-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                Stark! Deine Lösung passt.
                            </p>
                        )}
                        {feedback === 'incorrect' && (
                            <p className="text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                Prüfe deine Rechnung noch einmal oder sieh dir den Lösungsweg an.
                            </p>
                        )}

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={checkAnswer}
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

                        {showSolution && (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Lösung</h3>
                                <div className="space-y-6">
                                    {task.solutionSteps.map((step, index) => (
                                        <div key={index}>
                                            <h4 className="font-bold text-teal-700 mb-2">{step.heading}</h4>
                                            <p className="mb-2">{step.text}</p>
                                            {step.math && (
                                                <div className="my-2">
                                                    <BlockMath math={step.math} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlaechensatzUebung;
