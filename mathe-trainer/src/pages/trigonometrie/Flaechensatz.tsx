import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Task {
    description: string;
    solutionSteps: { heading: string; text: string; math?: string }[];
    sketchSVG: string;
}

const FLAECHENSATZ_VIDEO_URL = 'https://youtu.be/JFoLf3uT4DM?si=V1t-joWFciTN8ruX';

const Flaechensatz: React.FC = () => {
    const [task, setTask] = useState<Task | null>(null);
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [taskType, setTaskType] = useState<'area' | 'unknown'>('area');

    // Helpers
    const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;
    const degToRad = (degrees: number) => degrees * (Math.PI / 180);
    const radToDeg = (radians: number) => radians * (180 / Math.PI);
    const round = (value: number, decimals: number) => {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    };

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

    const createTriangleSketch = (angles: any, sides: any, formulaType: string, unknownElement: string | null) => {
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
        let labelA = 'a';
        let labelB = 'b';
        let labelC = 'c';

        if (unknownElement && unknownElement.startsWith('unknown-side')) {
            const unknownSideLetter = unknownElement.slice('unknown-side-'.length);
            if (unknownSideLetter === 'a') labelA = '?';
            if (unknownSideLetter === 'b') labelB = '?';
            if (unknownSideLetter === 'c') labelC = '?';
        }

        const midAB = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 + 20 };
        const midBC = { x: (points[1].x + points[2].x) / 2 + 15, y: (points[1].y + points[2].y) / 2 };
        const midAC = { x: (points[0].x + points[2].x) / 2 - 15, y: (points[0].y + points[2].y) / 2 };

        // SVG Construction
        let svgContent = `<svg width="100%" height="100%" viewBox="0 0 ${svgBaseWidth} ${svgBaseHeight}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Triangle
        svgContent += `<polygon points="${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y}" style="fill:none;stroke:black;stroke-width:1.5" />`;

        // Vertices
        svgContent += `<text x="${points[0].x - 5}" y="${points[0].y + 10}" font-size="14" text-anchor="end" fill="#333">A</text>`;
        svgContent += `<text x="${points[1].x + 5}" y="${points[1].y + 10}" font-size="14" text-anchor="start" fill="#333">B</text>`;
        svgContent += `<text x="${points[2].x}" y="${points[2].y - 5}" font-size="14" text-anchor="middle" fill="#333">C</text>`;

        // Sides
        svgContent += `<text x="${midBC.x}" y="${midBC.y}" font-size="16" text-anchor="start" fill="${labelA === '?' ? 'red' : 'black'}">${labelA}</text>`;
        svgContent += `<text x="${midAC.x}" y="${midAC.y}" font-size="16" text-anchor="end" fill="${labelB === '?' ? 'red' : 'black'}">${labelB}</text>`;
        svgContent += `<text x="${midAB.x}" y="${midAB.y}" font-size="16" text-anchor="middle" fill="${labelC === '?' ? 'red' : 'black'}">${labelC}</text>`;

        // Angles helper
        const addAngleLabel = (vertex: any, p1: any, p2: any, label: string, isUnknown: boolean, formulaName: string) => {
            if (isUnknown) {
                const pos = { x: vertex.x + (p1.x > vertex.x ? 20 : -20), y: vertex.y + (p1.y > vertex.y ? 20 : -5) };
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
                
                const color = formulaType === formulaName ? 'blue' : 'black';
                svgContent += `<text x="${lx}" y="${ly}" font-size="14" text-anchor="middle" fill="${color}">${label}</text>`;
            }
        };

        addAngleLabel(points[0], points[2], points[1], 'α', unknownElement === 'unknown-angle-alpha', 'alpha');
        addAngleLabel(points[1], points[0], points[2], 'β', unknownElement === 'unknown-angle-beta', 'beta');
        addAngleLabel(points[2], points[0], points[1], 'γ', unknownElement === 'unknown-angle-gamma', 'gamma');

        svgContent += `</svg>`;
        return svgContent;
    };

    const generateTask = () => {
        setShowSolution(false);
        const angles = generateTriangleAngles();
        const baseSideA = getRandom(5, 15);
        const sides = calculateSides(angles, baseSideA);

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

        const area_ab_gamma = 0.5 * roundedSides.a * roundedSides.b * Math.sin(degToRad(roundedAngles.gamma));
        const roundedArea = round(area_ab_gamma, 2);

        const formulaVariation = Math.floor(Math.random() * 3);
        const formulaMapping = [
            { sides: ['a', 'b'], angle: 'gamma', formula: 'A = \\frac{1}{2} \\cdot a \\cdot b \\cdot \\sin(\\gamma)' },
            { sides: ['b', 'c'], angle: 'alpha', formula: 'A = \\frac{1}{2} \\cdot b \\cdot c \\cdot \\sin(\\alpha)' },
            { sides: ['a', 'c'], angle: 'beta', formula: 'A = \\frac{1}{2} \\cdot a \\cdot c \\cdot \\sin(\\beta)' }
        ];
        
        const chosen = formulaMapping[formulaVariation];
        const side1 = chosen.sides[0] as keyof typeof roundedSides;
        const side2 = chosen.sides[1] as keyof typeof roundedSides;
        const angle = chosen.angle as keyof typeof roundedAngles;
        const formulaText = chosen.formula;

        const side1Value = roundedSides[side1];
        const side2Value = roundedSides[side2];
        const angleValue = roundedAngles[angle];

        let description = "";
        let solutionSteps = [];
        let sketchSVG = "";
        let unknownElement = null;

        if (taskType === 'area') {
            description = `Berechnen Sie den Flächeninhalt eines Dreiecks mit den Seitenlängen ${side1} = ${side1Value} cm und ${side2} = ${side2Value} cm sowie dem eingeschlossenen Winkel ${angle} = ${angleValue}°.`;
            
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
            
            sketchSVG = createTriangleSketch(angles, roundedSides, angle, null);
        } else {
            const findSideOrAngle = Math.random() < 0.5 ? 'side' : 'angle';

            if (findSideOrAngle === 'side') {
                const unknownSideIndex = Math.floor(Math.random() * 2);
                const unknownSide = chosen.sides[unknownSideIndex] as keyof typeof roundedSides;
                const knownSide = chosen.sides[1 - unknownSideIndex] as keyof typeof roundedSides;
                
                const unknownSideValue = roundedSides[unknownSide];
                const knownSideValue = roundedSides[knownSide];

                description = `Ein Dreieck hat den Flächeninhalt A = ${roundedArea} cm². Eine Seite hat die Länge ${knownSide} = ${knownSideValue} cm, und der eingeschlossene Winkel beträgt ${angle} = ${angleValue}°. Berechnen Sie die Länge der Seite ${unknownSide}.`;
                unknownElement = `unknown-side-${unknownSide}`;

                solutionSteps.push({
                    heading: "Schritt 1: Formel aufschreiben",
                    text: "Die Formel für den Flächeninhalt lautet:",
                    math: formulaText
                });
                solutionSteps.push({
                    heading: "Schritt 2: Formel umstellen",
                    text: `Um die unbekannte Seite ${unknownSide} zu finden, stellen wir die Formel um:`,
                    math: `${unknownSide} = \\frac{2 \\cdot A}{${knownSide} \\cdot \\sin(${angle})}`
                });
                solutionSteps.push({
                    heading: "Schritt 3: Werte einsetzen",
                    text: "Setzen Sie die gegebenen Werte ein:",
                    math: `${unknownSide} = \\frac{2 \\cdot ${roundedArea}}{${knownSideValue} \\cdot \\sin(${angleValue}^\\circ)}`
                });
                solutionSteps.push({
                    heading: "Schritt 4: Berechnen",
                    text: "Berechnen Sie die Länge der Seite:",
                    math: `${unknownSide} \\approx ${unknownSideValue} \\text{ cm}`
                });

                sketchSVG = createTriangleSketch(angles, roundedSides, angle, unknownElement);
            } else {
                const sin_angle_calc = (2 * roundedArea) / (side1Value * side2Value);
                const sin_angle_clamped = Math.max(-1, Math.min(1, sin_angle_calc));
                const angle_rad_arcsin = Math.asin(sin_angle_clamped);
                const angle_deg_arcsin = radToDeg(angle_rad_arcsin);
                const possibleAngle1 = round(angle_deg_arcsin, 1);
                const possibleAngle2 = round(180 - angle_deg_arcsin, 1);

                description = `Ein Dreieck hat den Flächeninhalt A = ${roundedArea} cm². Zwei Seiten, die den Winkel ${angle} einschließen, haben die Längen ${side1} = ${side1Value} cm und ${side2} = ${side2Value} cm. Berechnen Sie die Größe des Winkels ${angle}.`;
                unknownElement = `unknown-angle-${angle}`;

                solutionSteps.push({
                    heading: "Schritt 1: Formel aufschreiben",
                    text: "Die Formel für den Flächeninhalt lautet:",
                    math: formulaText
                });
                solutionSteps.push({
                    heading: "Schritt 2: Formel umstellen",
                    text: `Um den Winkel ${angle} zu finden, stellen wir die Formel nach sin(${angle}) um:`,
                    math: `\\sin(${angle}) = \\frac{2 \\cdot A}{${side1} \\cdot ${side2}}`
                });
                solutionSteps.push({
                    heading: "Schritt 3: Werte einsetzen und berechnen",
                    text: `Wir berechnen den Sinuswert und dann den Winkel mit Arcussinus:`,
                    math: `\\sin(${angle}) = \\frac{2 \\cdot ${roundedArea}}{${side1Value} \\cdot ${side2Value}} \\approx ${round(sin_angle_clamped, 3)} \\implies ${angle} \\approx ${angleValue}^\\circ`
                });

                sketchSVG = createTriangleSketch(angles, roundedSides, angle, unknownElement);
            }
        }

        setTask({ description, solutionSteps, sketchSVG });
    };

    useEffect(() => {
        generateTask();
    }, [taskType]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/trigonometrie" className="text-teal-600 hover:text-teal-700 font-bold mb-4 inline-block">
                ← Zurück zur Übersicht
            </Link>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-teal-800 text-center mb-6">
                    Flächensatz im Dreieck
                </h1>

                <div className="bg-white border border-teal-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
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

                <div className="flex justify-center mb-6">
                    <button 
                        onClick={generateTask}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                    >
                        Neue Aufgabe
                    </button>
                </div>

                {task && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                            <p className="text-lg">{task.description}</p>
                        </div>

                        <div className="flex justify-center">
                            <div 
                                className="w-full max-w-md border border-gray-200 rounded-lg bg-white p-4"
                                dangerouslySetInnerHTML={{ __html: task.sketchSVG }}
                            />
                        </div>

                        <div className="flex justify-center">
                            <button 
                                onClick={() => setShowSolution(!showSolution)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                {showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
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

export default Flaechensatz;
