import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface PracticeTask {
    description: string;
    correctArea: number;
    solutionSteps: { heading: string; text: string; math?: string }[];
    sketchSVG: string;
}

const FLAECHENSATZ_VIDEO_URL = 'https://youtu.be/JFoLf3uT4DM?si=V1t-joWFciTN8ruX';

// --- Helpers (geometry + sketch) ---
const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;
const degToRad = (degrees: number) => degrees * (Math.PI / 180);
const round = (value: number, decimals: number) => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
};

const generateTriangleAngles = () => {
    let alpha_deg: number, beta_deg: number, gamma_deg: number;
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

const createTriangleSketch = (angles: any, formulaType: string) => {
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

    const midAB = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 + 20 };
    const midBC = { x: (points[1].x + points[2].x) / 2 + 15, y: (points[1].y + points[2].y) / 2 };
    const midAC = { x: (points[0].x + points[2].x) / 2 - 15, y: (points[0].y + points[2].y) / 2 };

    // Alle Punkte sammeln, damit die viewBox am Ende so berechnet werden kann,
    // dass die Skizze bei jeder Winkelkombination vollständig sichtbar bleibt.
    const boundsPoints = [pointA, pointB, pointC, midAB, midBC, midAC];

    let svgContent = '';
    svgContent += `<polygon points="${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y}" style="fill:#ecfeff;stroke:#0f766e;stroke-width:1.5" />`;

    svgContent += `<text x="${points[0].x - 5}" y="${points[0].y + 10}" font-size="14" text-anchor="end" fill="#333">A</text>`;
    svgContent += `<text x="${points[1].x + 5}" y="${points[1].y + 10}" font-size="14" text-anchor="start" fill="#333">B</text>`;
    svgContent += `<text x="${points[2].x}" y="${points[2].y - 5}" font-size="14" text-anchor="middle" fill="#333">C</text>`;

    svgContent += `<text x="${midBC.x}" y="${midBC.y}" font-size="16" text-anchor="start" fill="black">a</text>`;
    svgContent += `<text x="${midAC.x}" y="${midAC.y}" font-size="16" text-anchor="end" fill="black">b</text>`;
    svgContent += `<text x="${midAB.x}" y="${midAB.y}" font-size="16" text-anchor="middle" fill="black">c</text>`;

    const addAngleLabel = (vertex: any, p1: any, p2: any, label: string, formulaName: string) => {
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

        const color = formulaType === formulaName ? '#0f766e' : 'black';
        svgContent += `<text x="${lx}" y="${ly}" font-size="14" text-anchor="middle" fill="${color}" font-weight="${formulaType === formulaName ? 'bold' : 'normal'}">${label}</text>`;
    };

    addAngleLabel(points[0], points[2], points[1], 'α', 'alpha');
    addAngleLabel(points[1], points[0], points[2], 'β', 'beta');
    addAngleLabel(points[2], points[0], points[1], 'γ', 'gamma');

    // viewBox so berechnen, dass alle Punkte und Beschriftungen sichtbar sind
    const margin = 22;
    const minX = Math.min(...boundsPoints.map(p => p.x)) - margin;
    const maxX = Math.max(...boundsPoints.map(p => p.x)) + margin;
    const minY = Math.min(...boundsPoints.map(p => p.y)) - margin;
    const maxY = Math.max(...boundsPoints.map(p => p.y)) + margin;
    const viewBoxAttr = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

    return `<svg viewBox="${viewBoxAttr}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
};

// Feste Beispiel-Skizze: a, b und der eingeschlossene Winkel γ sind bekannt
const EXAMPLE_ANGLES = { alpha_deg: 65, beta_deg: 60, gamma_deg: 55 } as const;
const EXAMPLE_SKETCH = createTriangleSketch(
    {
        alpha_rad: degToRad(EXAMPLE_ANGLES.alpha_deg),
        beta_rad: degToRad(EXAMPLE_ANGLES.beta_deg),
        gamma_rad: degToRad(EXAMPLE_ANGLES.gamma_deg)
    },
    'gamma'
);
const EXAMPLE_AREA = round(0.5 * 7 * 8 * Math.sin(degToRad(EXAMPLE_ANGLES.gamma_deg)), 2);

const formulaMapping = [
    { sides: ['a', 'b'], angle: 'gamma', formula: 'A = \\frac{1}{2} \\cdot a \\cdot b \\cdot \\sin(\\gamma)' },
    { sides: ['b', 'c'], angle: 'alpha', formula: 'A = \\frac{1}{2} \\cdot b \\cdot c \\cdot \\sin(\\alpha)' },
    { sides: ['a', 'c'], angle: 'beta', formula: 'A = \\frac{1}{2} \\cdot a \\cdot c \\cdot \\sin(\\beta)' }
] as const;

const FlaechensatzEinstieg: React.FC = () => {
    const [practiceTask, setPracticeTask] = useState<PracticeTask | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [showSolution, setShowSolution] = useState(false);

    const generatePracticeTask = () => {
        setUserAnswer('');
        setFeedback(null);
        setShowSolution(false);

        const angles = generateTriangleAngles();
        const baseSideA = getRandom(5, 15);
        const sides = calculateSides(angles, baseSideA);

        const roundedSides = { a: round(sides.a, 2), b: round(sides.b, 2), c: round(sides.c, 2) };
        const roundedAngles = {
            alpha: round(angles.alpha_deg, 1),
            beta: round(angles.beta_deg, 1),
            gamma: round(angles.gamma_deg, 1)
        };

        const chosen = formulaMapping[Math.floor(Math.random() * formulaMapping.length)];
        const side1 = chosen.sides[0] as keyof typeof roundedSides;
        const side2 = chosen.sides[1] as keyof typeof roundedSides;
        const angle = chosen.angle as keyof typeof roundedAngles;
        const side1Value = roundedSides[side1];
        const side2Value = roundedSides[side2];
        const angleValue = roundedAngles[angle];

        const exactArea = 0.5 * side1Value * side2Value * Math.sin(degToRad(angleValue));
        const correctArea = round(exactArea, 2);

        const description = `Berechne den Flächeninhalt eines Dreiecks mit den Seitenlängen ${side1} = ${side1Value} cm und ${side2} = ${side2Value} cm sowie dem eingeschlossenen Winkel ${angle} = ${angleValue}°.`;

        const solutionSteps = [
            {
                heading: 'Schritt 1: Formel aufschreiben',
                text: 'Zwei Seiten und der eingeschlossene Winkel sind bekannt:',
                math: chosen.formula
            },
            {
                heading: 'Schritt 2: Werte einsetzen',
                text: 'Setze die gegebenen Werte ein:',
                math: `A = \\frac{1}{2} \\cdot ${side1Value} \\cdot ${side2Value} \\cdot \\sin(${angleValue}^\\circ)`
            },
            {
                heading: 'Schritt 3: Berechnen',
                text: 'Das Ergebnis lautet:',
                math: `A \\approx ${correctArea} \\text{ cm}^2`
            }
        ];

        const sketchSVG = createTriangleSketch(angles, angle);

        setPracticeTask({ description, correctArea, solutionSteps, sketchSVG });
    };

    useEffect(() => {
        generatePracticeTask();
    }, []);

    const checkAnswer = () => {
        if (!practiceTask) return;
        const normalized = userAnswer.trim().replace(',', '.');
        const parsed = parseFloat(normalized);
        if (isNaN(parsed)) {
            setFeedback('incorrect');
            return;
        }
        const tolerance = practiceTask.correctArea * 0.1;
        setFeedback(Math.abs(parsed - practiceTask.correctArea) <= tolerance ? 'correct' : 'incorrect');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/trigonometrie/flaechensatz" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 text-sm font-medium mb-4">
                    <i className="fa-solid fa-arrow-left"></i> Zurück zur Übersicht
                </Link>

                <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-teal-800 text-center mb-2">
                            Einstiegsaufgaben zum Flächensatz
                        </h1>
                        <p className="text-center text-slate-600">
                            So berechnest du den Flächeninhalt eines beliebigen Dreiecks aus zwei Seiten und dem
                            eingeschlossenen Winkel.
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-teal-700">Ein Dreieck mit zwei bekannten Seiten</h2>
                        <p>
                            In vielen Aufgaben kennst du nicht die Höhe eines Dreiecks, sondern{' '}
                            <strong>zwei Seiten und den von ihnen eingeschlossenen Winkel</strong>. Im Beispiel unten
                            sind das die Seiten <InlineMath math="a = 7\text{ cm}" />, <InlineMath math="b = 8\text{ cm}" />{' '}
                            und der eingeschlossene Winkel <InlineMath math="\gamma = 55^\circ" /> &ndash; also genau der
                            Winkel, der zwischen den Seiten <InlineMath math="a" /> und <InlineMath math="b" /> liegt.
                        </p>

                        <div className="flex justify-center">
                            <div
                                className="w-full max-w-xs h-56 border border-slate-200 rounded-lg bg-white p-4"
                                dangerouslySetInnerHTML={{ __html: EXAMPLE_SKETCH }}
                            />
                        </div>

                        <p>
                            Für genau diesen Fall &ndash; zwei Seiten und der eingeschlossene Winkel &ndash; gibt es den{' '}
                            <strong>Flächensatz</strong>. Er erspart dir, erst die Höhe berechnen zu müssen:
                        </p>
                    </section>

                    <section className="bg-teal-50 border border-teal-200 rounded-xl p-5 text-center space-y-2">
                        <p className="font-semibold text-teal-900">Merksatz: Der Flächensatz</p>
                        <p className="text-sm text-slate-600">
                            Je nachdem, welche zwei Seiten und welcher eingeschlossene Winkel gegeben sind, gibt es
                            drei gleichwertige Varianten:
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
                            <BlockMath math="A = \frac{1}{2} \cdot a \cdot b \cdot \sin(\gamma)" />
                            <BlockMath math="A = \frac{1}{2} \cdot b \cdot c \cdot \sin(\alpha)" />
                            <BlockMath math="A = \frac{1}{2} \cdot a \cdot c \cdot \sin(\beta)" />
                        </div>
                        <p className="text-sm text-slate-600">
                            Wichtig: Der eingesetzte Winkel muss immer der <strong>von den beiden Seiten
                            eingeschlossene Winkel</strong> sein.
                        </p>
                        <div className="flex justify-center pt-2">
                            <a
                                href={FLAECHENSATZ_VIDEO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                            >
                                Lernvideo zum Flächensatz ansehen
                            </a>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-teal-700">So wird die Formel angewendet</h2>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p>
                                Berechne den Flächeninhalt des Dreiecks mit <InlineMath math="a = 7\text{ cm}" />,{' '}
                                <InlineMath math="b = 8\text{ cm}" /> und <InlineMath math="\gamma = 55^\circ" />.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-teal-700 mb-1">Schritt 1: Passende Formel wählen</h3>
                                <p className="mb-1">
                                    Bekannt sind <InlineMath math="a" />, <InlineMath math="b" /> und der eingeschlossene
                                    Winkel <InlineMath math="\gamma" />, also nutzen wir:
                                </p>
                                <BlockMath math="A = \frac{1}{2} \cdot a \cdot b \cdot \sin(\gamma)" />
                            </div>
                            <div>
                                <h3 className="font-bold text-teal-700 mb-1">Schritt 2: Werte einsetzen</h3>
                                <BlockMath math="A = \frac{1}{2} \cdot 7\text{ cm} \cdot 8\text{ cm} \cdot \sin(55^\circ)" />
                            </div>
                            <div>
                                <h3 className="font-bold text-teal-700 mb-1">Schritt 3: Berechnen</h3>
                                <BlockMath math={`A \\approx ${EXAMPLE_AREA} \\text{ cm}^2`} />
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200" />

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-teal-700">Jetzt selbst üben</h2>
                        <p className="text-slate-600">
                            Berechne den Flächeninhalt, trage dein Ergebnis ein und lass es überprüfen.
                        </p>

                        <div className="flex justify-center">
                            <button
                                onClick={generatePracticeTask}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                            >
                                Neue Aufgabe
                            </button>
                        </div>

                        {practiceTask && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                                    <p className="text-lg">{practiceTask.description}</p>
                                </div>

                                <div className="flex justify-center">
                                    <div
                                        className="w-full max-w-md h-64 sm:h-72 border border-gray-200 rounded-lg bg-white p-4"
                                        dangerouslySetInnerHTML={{ __html: practiceTask.sketchSVG }}
                                    />
                                </div>

                                <div
                                    className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-colors duration-300 ${
                                        feedback === 'correct'
                                            ? 'bg-green-50 border-green-300'
                                            : feedback === 'incorrect'
                                            ? 'bg-red-50 border-red-300'
                                            : 'bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={userAnswer}
                                            onChange={(e) => { setUserAnswer(e.target.value); setFeedback(null); }}
                                            placeholder="Ergebnis in cm²"
                                            className="w-40 px-3 py-2 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        <button
                                            onClick={checkAnswer}
                                            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Prüfen
                                        </button>
                                    </div>

                                    {feedback === 'correct' && (
                                        <p className="text-green-700 font-semibold flex items-center gap-2">
                                            <i className="fa-solid fa-circle-check"></i> Richtig! Sehr gut gemacht.
                                        </p>
                                    )}
                                    {feedback === 'incorrect' && (
                                        <p className="text-red-600 font-semibold flex items-center gap-2">
                                            <i className="fa-solid fa-circle-xmark"></i> Noch nicht richtig. Versuch es
                                            erneut oder schau dir die Lösung an.
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setShowSolution(!showSolution)}
                                        className="px-6 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                                    >
                                        {showSolution ? 'Musterlösung verbergen' : 'Musterlösung anzeigen'}
                                    </button>
                                </div>

                                {showSolution && (
                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                        <h3 className="text-xl font-bold mb-4 text-gray-800">Musterlösung</h3>
                                        <div className="space-y-6">
                                            {practiceTask.solutionSteps.map((step, index) => (
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
                    </section>
                </div>
            </div>
        </div>
    );
};

export default FlaechensatzEinstieg;
