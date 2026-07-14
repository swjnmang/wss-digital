import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import RightTriangleSVG from '../../components/RightTriangleSVG';
import { logTrackingEntry } from '../../utils/tracking';

// ---------- Allgemeine Hilfsfunktionen ----------

const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomInRange(min, max + 1));
const round = (val: number, digits = 2) => parseFloat(val.toFixed(digits));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};
// Maximal 1% relative Toleranz beim Runden, mit kleiner Mindesttoleranz für sehr kleine Werte
const relTolerance = (value: number, min = 0.01) => Math.max(Math.abs(value) * 0.01, min);

let idCounter = 0;
const nextId = () => {
    idCounter += 1;
    return idCounter;
};

// ---------- Skizzen für numerische Aufgaben (Strecken/Winkel/Steigung/Sinussatz/Kosinussatz/Flächensatz) ----------

type RightHighlight = 'horizontal' | 'vertical' | 'hypotenuse' | 'angle' | 'none';
type GeneralKey = 'a' | 'b' | 'c' | 'alpha' | 'beta' | 'gamma';

interface RightSketchSpec {
    kind: 'right';
    horizontal: number;
    vertical: number;
    horizontalLabel: string;
    verticalLabel: string;
    hypotenuseLabel: string;
    angleLabel: string;
    highlight: RightHighlight;
    askedLabel?: string;
}

interface GeneralSketchSpec {
    kind: 'general';
    a: number;
    b: number;
    c: number;
    alpha: number;
    givenKeys: GeneralKey[];
    highlightKey: GeneralKey | 'none';
    askedLabel?: string;
}

type SketchSpec = RightSketchSpec | GeneralSketchSpec;

const GIVEN_COLOR = '#1f2937';
const HIGHLIGHT_COLOR = '#dc2626';

const NumericRightSketch: React.FC<{ spec: RightSketchSpec }> = ({ spec }) => {
    const { horizontal, vertical, horizontalLabel, verticalLabel, hypotenuseLabel, angleLabel, highlight, askedLabel } = spec;
    const width = 320;
    const height = 220;
    const margin = 40;
    const rightLabelSpace = 80;
    const maxRun = width - 2 * margin - rightLabelSpace;
    const scale = maxRun / Math.max(horizontal, 0.0001);
    const runPx = horizontal * scale;
    const riseRaw = vertical * scale;
    const riseCap = height - 2 * margin;
    const riseScaleAdjust = riseRaw > riseCap ? riseCap / riseRaw : 1;
    const runPxAdjusted = runPx * (riseRaw > riseCap ? riseScaleAdjust : 1);
    const risePx = riseRaw * (riseRaw > riseCap ? riseScaleAdjust : 1);

    const Ax = margin;
    const Ay = height - margin;
    const Bx = margin + runPxAdjusted;
    const By = height - margin;
    const Cx = Bx;
    const Cy = By - risePx;

    const colorFor = (part: RightHighlight) => (highlight === part ? HIGHLIGHT_COLOR : GIVEN_COLOR);

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="mx-auto">
            <polygon points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`} fill="#eef2ff" stroke="#0f172a" strokeWidth={2} />
            <line x1={Ax} y1={Ay} x2={Bx} y2={By} stroke={colorFor('horizontal')} strokeWidth={3} />
            <line x1={Bx} y1={By} x2={Cx} y2={Cy} stroke={colorFor('vertical')} strokeWidth={3} />
            <line x1={Ax} y1={Ay} x2={Cx} y2={Cy} stroke={colorFor('hypotenuse')} strokeWidth={3} />

            <text x={(Ax + Bx) / 2} y={Ay + 18} textAnchor="middle" fontSize="12" fill={colorFor('horizontal')}>
                {horizontalLabel}
            </text>
            <text x={Bx + 8} y={(By + Cy) / 2} fontSize="12" fill={colorFor('vertical')}>
                {verticalLabel}
            </text>
            <text x={(Ax + Cx) / 2 - 8} y={(Ay + Cy) / 2 - 5} fontSize="12" fill={colorFor('hypotenuse')} textAnchor="end">
                {hypotenuseLabel}
            </text>
            <text x={Ax + 24} y={Ay - 8} fontSize="13" fontWeight="bold" fill={colorFor('angle')}>
                {angleLabel}
            </text>
            {askedLabel && (
                <text x={width - 12} y={22} textAnchor="end" fontSize="13" fontWeight="bold" fill={HIGHLIGHT_COLOR}>
                    {askedLabel}
                </text>
            )}
        </svg>
    );
};

const NumericGeneralSketch: React.FC<{ spec: GeneralSketchSpec }> = ({ spec }) => {
    const { a, b, c, alpha, givenKeys, highlightKey, askedLabel } = spec;
    const width = 320;
    const height = 220;
    const margin = 48;

    const alphaRad = degToRad(alpha);
    const rawA = { x: 0, y: 0 };
    const rawB = { x: c, y: 0 };
    const rawC = { x: b * Math.cos(alphaRad), y: b * Math.sin(alphaRad) };

    const minX = Math.min(rawA.x, rawB.x, rawC.x);
    const maxX = Math.max(rawA.x, rawB.x, rawC.x);
    const maxY = Math.max(rawC.y, 0.0001);

    const scale = Math.min((width - 2 * margin) / (maxX - minX || 1), (height - 2 * margin) / maxY);
    const toScreen = (p: { x: number; y: number }) => ({
        x: margin + (p.x - minX) * scale,
        y: height - margin - p.y * scale
    });

    const A = toScreen(rawA);
    const B = toScreen(rawB);
    const C = toScreen(rawC);

    const givenSet = new Set(givenKeys);
    const colorFor = (key: GeneralKey) => (highlightKey === key ? HIGHLIGHT_COLOR : GIVEN_COLOR);
    const sideLabel = (key: 'a' | 'b' | 'c', value: number) => {
        if (highlightKey === key) return `${key} = ?`;
        if (givenSet.has(key)) return `${key} = ${round(value, 2)}`;
        return key;
    };
    const angleLabel = (key: 'alpha' | 'beta' | 'gamma', symbol: string, value?: number) => {
        if (highlightKey === key) return `${symbol} = ?`;
        if (givenSet.has(key) && value !== undefined) return `${symbol} = ${round(value, 1)}°`;
        return symbol;
    };

    const centroid = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
    const sideLabelPos = (p1: { x: number; y: number }, p2: { x: number; y: number }, offset = 16) => {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const dx = mx - centroid.x;
        const dy = my - centroid.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        return { x: mx + (dx / len) * offset, y: my + (dy / len) * offset };
    };

    const labelC_ = sideLabelPos(A, B);
    const labelB_ = sideLabelPos(A, C);
    const labelA_ = sideLabelPos(B, C);

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="mx-auto">
            <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="#eef2ff" stroke="#0f172a" strokeWidth={2} />
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={colorFor('c')} strokeWidth={3} />
            <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke={colorFor('b')} strokeWidth={3} />
            <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke={colorFor('a')} strokeWidth={3} />

            <circle cx={A.x} cy={A.y} r={3} fill="#0f172a" />
            <circle cx={B.x} cy={B.y} r={3} fill="#0f172a" />
            <circle cx={C.x} cy={C.y} r={3} fill="#0f172a" />
            <text x={A.x - 12} y={A.y + 16} fontSize="12" fontWeight="bold">A</text>
            <text x={B.x + 8} y={B.y + 16} fontSize="12" fontWeight="bold">B</text>
            <text x={C.x} y={C.y - 10} fontSize="12" fontWeight="bold" textAnchor="middle">C</text>

            <text x={labelC_.x} y={labelC_.y} textAnchor="middle" fontSize="12" fill={colorFor('c')}>
                {sideLabel('c', c)}
            </text>
            <text x={labelB_.x} y={labelB_.y} textAnchor="middle" fontSize="12" fill={colorFor('b')}>
                {sideLabel('b', b)}
            </text>
            <text x={labelA_.x} y={labelA_.y} textAnchor="middle" fontSize="12" fill={colorFor('a')}>
                {sideLabel('a', a)}
            </text>

            <text x={A.x + 14} y={A.y - 10} fontSize="12" fontWeight="bold" fill={colorFor('alpha')}>
                {angleLabel('alpha', 'α', alpha)}
            </text>

            {(() => {
                const cornerLabel =
                    askedLabel ?? (highlightKey === 'beta' ? 'β = ?' : highlightKey === 'gamma' ? 'γ = ?' : undefined);
                return (
                    cornerLabel && (
                        <text x={width - 12} y={22} textAnchor="end" fontSize="13" fontWeight="bold" fill={HIGHLIGHT_COLOR}>
                            {cornerLabel}
                        </text>
                    )
                );
            })()}
        </svg>
    );
};

const NumericSketch: React.FC<{ sketch: SketchSpec }> = ({ sketch }) =>
    sketch.kind === 'right' ? <NumericRightSketch spec={sketch} /> : <NumericGeneralSketch spec={sketch} />;

// ---------- Aufgaben-Typen ----------

interface NumericTask {
    id: number;
    kind: 'numeric';
    topic: string;
    prompt: string;
    unit: string;
    correctAnswer: string;
    tolerance: number;
    sketch: SketchSpec;
    solutionSteps: string[];
}

interface LabelTriangle {
    pointA: string;
    pointB: string;
    pointC: string;
    sideA: string;
    sideB: string;
    sideC: string;
    rightAngleAtPoint: string;
    markedAngle: 'alpha' | 'beta' | 'gamma';
    markedAngleAtPoint: string;
}

interface BeschriftenTask {
    id: number;
    kind: 'beschriften';
    topic: string;
    triangle: LabelTriangle;
    correct: { hypotenuse: string; opposite: string; adjacent: string };
    sideOptions: string[];
}

type SideRole = 'hypotenuse' | 'opposite' | 'adjacent';
type TrigFunction = 'sin' | 'cos' | 'tan';

interface ErkennenTask {
    id: number;
    kind: 'erkennen';
    topic: string;
    triangle: LabelTriangle;
    type: 'functionToRatio' | 'ratioToFunction';
    askedFunction?: TrigFunction;
    askedRatioLabel?: [string, string];
    options: string[];
    correctOption: string;
}

type MixedTask = NumericTask | BeschriftenTask | ErkennenTask;

const greekSymbols: Record<'alpha' | 'beta' | 'gamma', string> = { alpha: 'α', beta: 'β', gamma: 'γ' };

const trigFunctionLabel: Record<TrigFunction, string> = { sin: 'Sinus', cos: 'Kosinus', tan: 'Tangens' };
const trigFormula: Record<TrigFunction, string> = {
    sin: '\\sin(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}',
    cos: '\\cos(\\alpha) = \\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}',
    tan: '\\tan(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}}'
};

// ---------- Aufgaben-Generatoren ----------

// 1) Rechtwinklige Dreiecke beschriften
const buildBeschriftenTask = (): BeschriftenTask => {
    const points = ['A', 'B', 'C'];
    const sides = ['a', 'b', 'c'];
    const rightAngleAtPoint = pick(points);
    const otherPoints = points.filter(p => p !== rightAngleAtPoint);
    const markedAngleAtPoint = pick(otherPoints);
    const angleNames: Record<string, 'alpha' | 'beta' | 'gamma'> = { A: 'alpha', B: 'beta', C: 'gamma' };
    const markedAngle = angleNames[markedAngleAtPoint];

    const hypotenuse = sides[points.indexOf(rightAngleAtPoint)];
    const opposite = sides[points.indexOf(markedAngleAtPoint)];
    const adjacent = sides.find(s => s !== hypotenuse && s !== opposite)!;

    return {
        id: nextId(),
        kind: 'beschriften',
        topic: 'Dreiecke beschriften',
        triangle: { pointA: 'A', pointB: 'B', pointC: 'C', sideA: 'a', sideB: 'b', sideC: 'c', rightAngleAtPoint, markedAngle, markedAngleAtPoint },
        correct: { hypotenuse, opposite, adjacent },
        sideOptions: shuffleArray(sides)
    };
};

// 2) Sinus, Kosinus, Tangens erkennen
const ALL_RATIOS: [SideRole, SideRole][] = [
    ['opposite', 'hypotenuse'],
    ['adjacent', 'hypotenuse'],
    ['opposite', 'adjacent'],
    ['hypotenuse', 'opposite'],
    ['hypotenuse', 'adjacent'],
    ['adjacent', 'opposite']
];

const ratioToFunction = (num: SideRole, den: SideRole): TrigFunction | null => {
    if (num === 'opposite' && den === 'hypotenuse') return 'sin';
    if (num === 'adjacent' && den === 'hypotenuse') return 'cos';
    if (num === 'opposite' && den === 'adjacent') return 'tan';
    return null;
};

const buildErkennenTask = (): ErkennenTask => {
    const points = ['A', 'B', 'C'];
    const sides = ['a', 'b', 'c'];
    const rightAngleAtPoint = pick(points);
    const otherPoints = points.filter(p => p !== rightAngleAtPoint);
    const markedAngleAtPoint = pick(otherPoints);
    const angleNames: Record<string, 'alpha' | 'beta' | 'gamma'> = { A: 'alpha', B: 'beta', C: 'gamma' };
    const markedAngle = angleNames[markedAngleAtPoint];

    const hypotenuse = sides[points.indexOf(rightAngleAtPoint)];
    const opposite = sides[points.indexOf(markedAngleAtPoint)];
    const adjacent = sides.find(s => s !== hypotenuse && s !== opposite)!;
    const sideOf: Record<SideRole, string> = { hypotenuse, opposite, adjacent };

    const triangle: LabelTriangle = { pointA: 'A', pointB: 'B', pointC: 'C', sideA: 'a', sideB: 'b', sideC: 'c', rightAngleAtPoint, markedAngle, markedAngleAtPoint };
    const type: 'functionToRatio' | 'ratioToFunction' = Math.random() < 0.5 ? 'functionToRatio' : 'ratioToFunction';

    if (type === 'functionToRatio') {
        const fn = pick(['sin', 'cos', 'tan'] as TrigFunction[]);
        const correctPair = ALL_RATIOS.find(([num, den]) => ratioToFunction(num, den) === fn)!;
        const correctOption = `${sideOf[correctPair[0]]}/${sideOf[correctPair[1]]}`;
        const distractorPairs = shuffleArray(ALL_RATIOS.filter(([num, den]) => !(num === correctPair[0] && den === correctPair[1])));
        const distractorOptions = distractorPairs.slice(0, 3).map(([num, den]) => `${sideOf[num]}/${sideOf[den]}`);

        return {
            id: nextId(),
            kind: 'erkennen',
            topic: 'Sinus, Kosinus, Tangens erkennen',
            triangle,
            type,
            askedFunction: fn,
            options: shuffleArray([correctOption, ...distractorOptions]),
            correctOption
        };
    }

    const [num, den] = pick(ALL_RATIOS);
    const fn = ratioToFunction(num, den);
    const correctOption = fn ? trigFunctionLabel[fn] : 'Keine der drei';

    return {
        id: nextId(),
        kind: 'erkennen',
        topic: 'Sinus, Kosinus, Tangens erkennen',
        triangle,
        type,
        askedRatioLabel: [sideOf[num], sideOf[den]],
        options: ['Sinus', 'Kosinus', 'Tangens', 'Keine der drei'],
        correctOption
    };
};

// 3) Rechtwinkliges Dreieck: fehlende Seite mit Sinus/Kosinus berechnen
const buildStreckenTask = (): NumericTask => {
    const alpha = randomInt(20, 70);
    const hyp = round(randomInRange(5, 15), 2);
    const askOpposite = Math.random() < 0.5;
    const opposite = hyp * Math.sin(degToRad(alpha));
    const adjacent = hyp * Math.cos(degToRad(alpha));

    const solutionSteps = askOpposite
        ? [
              `Gegeben: Hypotenuse c = ${hyp} cm, Winkel α = ${alpha}°.`,
              'Verwende den Sinus: sin(α) = Gegenkathete / Hypotenuse, also a = c · sin(α).',
              `a = ${hyp} · sin(${alpha}°) = ${hyp} · ${Math.sin(degToRad(alpha)).toFixed(4)}`,
              `a ≈ ${opposite.toFixed(2)} cm`
          ]
        : [
              `Gegeben: Hypotenuse c = ${hyp} cm, Winkel α = ${alpha}°.`,
              'Verwende den Kosinus: cos(α) = Ankathete / Hypotenuse, also b = c · cos(α).',
              `b = ${hyp} · cos(${alpha}°) = ${hyp} · ${Math.cos(degToRad(alpha)).toFixed(4)}`,
              `b ≈ ${adjacent.toFixed(2)} cm`
          ];

    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Streckenlänge berechnen',
        prompt: askOpposite
            ? `In einem rechtwinkligen Dreieck ist die Hypotenuse c = ${hyp} cm und der Winkel α = ${alpha}°. Berechne die Gegenkathete a von α.`
            : `In einem rechtwinkligen Dreieck ist die Hypotenuse c = ${hyp} cm und der Winkel α = ${alpha}°. Berechne die Ankathete b von α.`,
        unit: 'cm',
        correctAnswer: (askOpposite ? opposite : adjacent).toFixed(2),
        tolerance: relTolerance(askOpposite ? opposite : adjacent),
        solutionSteps,
        sketch: {
            kind: 'right',
            horizontal: adjacent,
            vertical: opposite,
            horizontalLabel: askOpposite ? `b ≈ ${adjacent.toFixed(2)} cm` : 'b = ?',
            verticalLabel: askOpposite ? 'a = ?' : `a ≈ ${opposite.toFixed(2)} cm`,
            hypotenuseLabel: `c = ${hyp} cm`,
            angleLabel: `α = ${alpha}°`,
            highlight: askOpposite ? 'vertical' : 'horizontal'
        }
    };
};

// 4) Rechtwinkliges Dreieck: fehlenden Winkel berechnen
const buildWinkelTask = (): NumericTask => {
    const adjacent = round(randomInRange(4, 12), 2);
    const opposite = round(randomInRange(4, 12), 2);
    const angle = radToDeg(Math.atan(opposite / adjacent));

    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Winkel berechnen',
        prompt: `In einem rechtwinkligen Dreieck sind die Ankathete b = ${adjacent} cm und die Gegenkathete a = ${opposite} cm eines Winkels α bekannt. Berechne α.`,
        unit: '°',
        correctAnswer: angle.toFixed(1),
        tolerance: relTolerance(angle),
        solutionSteps: [
            `Gegeben: Ankathete b = ${adjacent} cm, Gegenkathete a = ${opposite} cm.`,
            'Verwende den Tangens: tan(α) = Gegenkathete / Ankathete.',
            `tan(α) = ${opposite} / ${adjacent} = ${(opposite / adjacent).toFixed(4)}`,
            `α = tan⁻¹(${(opposite / adjacent).toFixed(4)}) ≈ ${angle.toFixed(1)}°`
        ],
        sketch: {
            kind: 'right',
            horizontal: adjacent,
            vertical: opposite,
            horizontalLabel: `b = ${adjacent} cm`,
            verticalLabel: `a = ${opposite} cm`,
            hypotenuseLabel: 'c',
            angleLabel: 'α = ?',
            highlight: 'angle'
        }
    };
};

// 5) Steigungswinkel: Grad <-> Prozent
const buildSteigungTask = (): NumericTask => {
    const askPercent = Math.random() < 0.5;
    if (askPercent) {
        const angle = round(randomInRange(5, 35), 1);
        const percent = Math.tan(degToRad(angle)) * 100;
        return {
            id: nextId(),
            kind: 'numeric',
            topic: 'Steigungswinkel',
            prompt: `Eine Straße hat einen Steigungswinkel von α = ${angle}°. Berechne die Steigung in Prozent.`,
            unit: '%',
            correctAnswer: percent.toFixed(1),
            tolerance: relTolerance(percent),
            solutionSteps: [
                `Gegeben: Steigungswinkel α = ${angle}°.`,
                'Die Steigung in Prozent ist 100 · tan(α).',
                `Steigung = 100 · tan(${angle}°) = 100 · ${Math.tan(degToRad(angle)).toFixed(4)}`,
                `Steigung ≈ ${percent.toFixed(1)} %`
            ],
            sketch: {
                kind: 'right',
                horizontal: 100,
                vertical: percent,
                horizontalLabel: 'horizontale Strecke',
                verticalLabel: '',
                hypotenuseLabel: 'Weg',
                angleLabel: `α = ${angle}°`,
                highlight: 'none',
                askedLabel: 'Steigung = ?'
            }
        };
    }

    const percent = round(randomInRange(5, 30), 1);
    const angle = radToDeg(Math.atan(percent / 100));
    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Steigungswinkel',
        prompt: `Eine Straße hat eine Steigung von ${percent} %. Berechne den Steigungswinkel α.`,
        unit: '°',
        correctAnswer: angle.toFixed(1),
        tolerance: relTolerance(angle),
        solutionSteps: [
            `Gegeben: Steigung = ${percent} %.`,
            `tan(α) = Steigung / 100 = ${percent} / 100 = ${(percent / 100).toFixed(4)}`,
            `α = tan⁻¹(${(percent / 100).toFixed(4)}) ≈ ${angle.toFixed(1)}°`
        ],
        sketch: {
            kind: 'right',
            horizontal: 100,
            vertical: percent,
            horizontalLabel: 'horizontale Strecke',
            verticalLabel: `Steigung ${percent} %`,
            hypotenuseLabel: 'Weg',
            angleLabel: 'α = ?',
            highlight: 'angle'
        }
    };
};

// 6) Sinussatz
const buildSinussatzTask = (): NumericTask => {
    let alpha = randomInRange(35, 110);
    let beta = randomInRange(25, 110);
    let gamma = 180 - alpha - beta;
    while (gamma < 25 || gamma > 110) {
        alpha = randomInRange(35, 110);
        beta = randomInRange(25, 110);
        gamma = 180 - alpha - beta;
    }
    const a = round(randomInRange(5, 12), 2);
    const b = (a * Math.sin(degToRad(beta))) / Math.sin(degToRad(alpha));
    alpha = round(alpha, 1);
    beta = round(beta, 1);
    gamma = round(180 - alpha - beta, 1);
    const c = (a * Math.sin(degToRad(gamma))) / Math.sin(degToRad(alpha));

    const askSide = Math.random() < 0.5;
    if (askSide) {
        return {
            id: nextId(),
            kind: 'numeric',
            topic: 'Sinussatz',
            prompt: `In einem Dreieck sind a = ${a} cm, α = ${alpha}° und β = ${beta}° gegeben. Berechne die Seite b mit dem Sinussatz.`,
            unit: 'cm',
            correctAnswer: round(b, 2).toFixed(2),
            tolerance: relTolerance(b),
            solutionSteps: [
                `Gegeben: a = ${a} cm, α = ${alpha}°, β = ${beta}°.`,
                'Sinussatz: a / sin(α) = b / sin(β), also b = a · sin(β) / sin(α).',
                `b = ${a} · sin(${beta}°) / sin(${alpha}°)`,
                `b ≈ ${round(b, 2)} cm`
            ],
            sketch: {
                kind: 'general',
                a,
                b: round(b, 2),
                c: round(c, 2),
                alpha,
                givenKeys: ['a', 'alpha', 'beta'],
                highlightKey: 'b'
            }
        };
    }

    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Sinussatz',
        prompt: `In einem Dreieck sind a = ${a} cm, b = ${round(b, 2)} cm und α = ${alpha}° gegeben. Berechne den Winkel β mit dem Sinussatz.`,
        unit: '°',
        correctAnswer: beta.toFixed(1),
        tolerance: relTolerance(beta),
        solutionSteps: [
            `Gegeben: a = ${a} cm, b = ${round(b, 2)} cm, α = ${alpha}°.`,
            'Sinussatz: sin(β) / b = sin(α) / a, also sin(β) = b · sin(α) / a.',
            `sin(β) = ${round(b, 2)} · sin(${alpha}°) / ${a}`,
            `β = sin⁻¹(...) ≈ ${beta.toFixed(1)}°`
        ],
        sketch: {
            kind: 'general',
            a,
            b: round(b, 2),
            c: round(c, 2),
            alpha,
            givenKeys: ['a', 'b', 'alpha'],
            highlightKey: 'beta'
        }
    };
};

// 7) Kosinussatz
const buildKosinussatzTask = (): NumericTask => {
    const b = round(randomInRange(5, 12), 2);
    const c = round(randomInRange(5, 12), 2);
    const alpha = round(randomInRange(35, 110), 1);
    const aSquared = b * b + c * c - 2 * b * c * Math.cos(degToRad(alpha));
    const a = Math.sqrt(Math.max(aSquared, 0));

    const askSide = Math.random() < 0.5;
    if (askSide) {
        return {
            id: nextId(),
            kind: 'numeric',
            topic: 'Kosinussatz',
            prompt: `In einem Dreieck sind b = ${b} cm, c = ${c} cm und der eingeschlossene Winkel α = ${alpha}° gegeben. Berechne die Seite a mit dem Kosinussatz.`,
            unit: 'cm',
            correctAnswer: round(a, 2).toFixed(2),
            tolerance: relTolerance(a),
            solutionSteps: [
                `Gegeben: b = ${b} cm, c = ${c} cm, α = ${alpha}°.`,
                'Kosinussatz: a² = b² + c² − 2·b·c·cos(α).',
                `a² = ${b}² + ${c}² − 2·${b}·${c}·cos(${alpha}°) = ${aSquared.toFixed(2)}`,
                `a ≈ ${a.toFixed(2)} cm`
            ],
            sketch: {
                kind: 'general',
                a: round(a, 2),
                b,
                c,
                alpha,
                givenKeys: ['b', 'c', 'alpha'],
                highlightKey: 'a'
            }
        };
    }

    const cosBeta = (a * a + c * c - b * b) / (2 * a * c);
    const beta = radToDeg(Math.acos(Math.min(1, Math.max(-1, cosBeta))));
    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Kosinussatz',
        prompt: `In einem Dreieck sind a = ${round(a, 2)} cm, b = ${b} cm und c = ${c} cm gegeben. Berechne den Winkel β mit dem Kosinussatz.`,
        unit: '°',
        correctAnswer: beta.toFixed(1),
        tolerance: relTolerance(beta),
        solutionSteps: [
            `Gegeben: a = ${round(a, 2)} cm, b = ${b} cm, c = ${c} cm.`,
            'Kosinussatz: cos(β) = (a² + c² − b²) / (2·a·c).',
            `cos(β) = (${round(a, 2)}² + ${c}² − ${b}²) / (2·${round(a, 2)}·${c})`,
            `β = cos⁻¹(...) ≈ ${beta.toFixed(1)}°`
        ],
        sketch: {
            kind: 'general',
            a: round(a, 2),
            b,
            c,
            alpha,
            givenKeys: ['a', 'b', 'c'],
            highlightKey: 'beta'
        }
    };
};

// 8) Flächensatz
const buildFlaechensatzTask = (): NumericTask => {
    const a = round(randomInRange(4, 12), 2);
    const b = round(randomInRange(4, 12), 2);
    const gamma = round(randomInRange(20, 150), 1);
    const area = 0.5 * a * b * Math.sin(degToRad(gamma));

    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Flächensatz',
        prompt: `Ein Dreieck hat die Seiten a = ${a} cm und b = ${b} cm mit dem eingeschlossenen Winkel γ = ${gamma}°. Berechne den Flächeninhalt des Dreiecks.`,
        unit: 'cm²',
        correctAnswer: round(area, 2).toFixed(2),
        tolerance: relTolerance(area),
        solutionSteps: [
            `Gegeben: a = ${a} cm, b = ${b} cm, γ = ${gamma}°.`,
            'Flächenformel: A = ½ · a · b · sin(γ).',
            `A = 0,5 · ${a} · ${b} · sin(${gamma}°)`,
            `A ≈ ${round(area, 2)} cm²`
        ],
        sketch: {
            kind: 'general',
            a: round(Math.sqrt(Math.max(a * a + b * b - 2 * a * b * Math.cos(degToRad(gamma)), 0)), 2),
            b: a,
            c: b,
            alpha: gamma,
            givenKeys: ['b', 'c', 'alpha'],
            highlightKey: 'none',
            askedLabel: 'Fläche = ?'
        }
    };
};

const TASK_BUILDERS: (() => MixedTask)[] = [
    buildBeschriftenTask,
    buildErkennenTask,
    buildStreckenTask,
    buildWinkelTask,
    buildSteigungTask,
    buildSinussatzTask,
    buildKosinussatzTask,
    buildFlaechensatzTask
];

const TASK_COUNT = 10;

const buildTaskSet = (): MixedTask[] => {
    const tasks = shuffleArray(TASK_BUILDERS).map(builder => builder());
    while (tasks.length < TASK_COUNT) {
        tasks.push(pick(TASK_BUILDERS)());
    }
    return shuffleArray(tasks.slice(0, TASK_COUNT));
};

// ---------- Kartenzustand ----------

interface CardState {
    task: MixedTask;
    numericValue: string;
    assignments: { hypotenuse: string | null; opposite: string | null; adjacent: string | null };
    selectedOption: string | null;
    feedback: string | null;
    feedbackType: 'correct' | 'incorrect' | null;
    showSolution: boolean;
    attempts: number;
    hintUsed: boolean;
}

const buildCard = (task: MixedTask): CardState => ({
    task,
    numericValue: '',
    assignments: { hypotenuse: null, opposite: null, adjacent: null },
    selectedOption: null,
    feedback: null,
    feedbackType: null,
    showSolution: false,
    attempts: 0,
    hintUsed: false
});

// Loggt eine Karte, die Versuche hatte, aber nie gelöst wurde (z. B. vor dem Neu-Generieren).
const flushUnsolvedCard = (card: CardState) => {
    if (card.attempts > 0 && card.feedbackType !== 'correct') {
        logTrackingEntry({
            topic: card.task.topic,
            attempts: card.attempts,
            firstTryCorrect: false,
            solved: false,
            hintUsed: card.hintUsed
        });
    }
};

const createCards = (): CardState[] => buildTaskSet().map(buildCard);

const parseAnswer = (value: string) => parseFloat(value.replace(',', '.'));

const GemischteUebungsaufgaben: React.FC = () => {
    const [cards, setCards] = useState<CardState[]>(() => createCards());
    const cardsRef = useRef(cards);

    useEffect(() => {
        cardsRef.current = cards;
    }, [cards]);

    // Karten, die beim Verlassen der Seite noch Versuche hatten, aber nie gelöst wurden, noch protokollieren.
    useEffect(() => () => {
        cardsRef.current.forEach(flushUnsolvedCard);
    }, []);

    const updateCard = (taskId: number, updates: Partial<CardState>) => {
        setCards(prev => prev.map(card => (card.task.id === taskId ? { ...card, ...updates } : card)));
    };

    const regenerateAll = () => {
        cards.forEach(flushUnsolvedCard);
        setCards(createCards());
    };

    const regenerateCard = (taskId: number) => {
        const card = cards.find(c => c.task.id === taskId);
        if (card) flushUnsolvedCard(card);
        setCards(prev => prev.map(c => (c.task.id === taskId ? buildCard(pick(TASK_BUILDERS)()) : c)));
    };

    const toggleCardSolution = (taskId: number) => {
        setCards(prev =>
            prev.map(card => {
                if (card.task.id !== taskId) return card;
                const next = !card.showSolution;
                return { ...card, showSolution: next, hintUsed: card.hintUsed || next };
            })
        );
    };

    const checkCard = (taskId: number) => {
        const card = cards.find(c => c.task.id === taskId);
        if (!card) return;
        const { task } = card;

        if (task.kind === 'numeric') {
            const value = parseAnswer(card.numericValue);
            if (isNaN(value)) {
                updateCard(taskId, { feedback: 'Bitte gib eine Zahl ein.', feedbackType: 'incorrect' });
                return;
            }
            const target = parseFloat(task.correctAnswer);
            const isCorrect = Math.abs(value - target) <= task.tolerance;
            const attempts = card.attempts + 1;
            updateCard(taskId, {
                feedback: isCorrect
                    ? 'Richtig!'
                    : `Nicht ganz. Richtige Lösung: ${task.correctAnswer} ${task.unit}`,
                feedbackType: isCorrect ? 'correct' : 'incorrect',
                attempts
            });
            if (isCorrect) {
                logTrackingEntry({ topic: task.topic, attempts, firstTryCorrect: attempts === 1, solved: true, hintUsed: card.hintUsed });
            }
            return;
        }

        if (task.kind === 'beschriften') {
            const { hypotenuse, opposite, adjacent } = card.assignments;
            if (!hypotenuse || !opposite || !adjacent) {
                updateCard(taskId, { feedback: 'Bitte ordne alle drei Seiten zu.', feedbackType: 'incorrect' });
                return;
            }
            const isCorrect =
                hypotenuse === task.correct.hypotenuse && opposite === task.correct.opposite && adjacent === task.correct.adjacent;
            const attempts = card.attempts + 1;
            updateCard(taskId, {
                feedback: isCorrect
                    ? 'Richtig!'
                    : `Nicht ganz. Richtig wäre: Hypotenuse = ${task.correct.hypotenuse}, Gegenkathete = ${task.correct.opposite}, Ankathete = ${task.correct.adjacent}.`,
                feedbackType: isCorrect ? 'correct' : 'incorrect',
                attempts
            });
            if (isCorrect) {
                logTrackingEntry({ topic: task.topic, attempts, firstTryCorrect: attempts === 1, solved: true, hintUsed: card.hintUsed });
            }
            return;
        }

        // erkennen
        if (!card.selectedOption) {
            updateCard(taskId, { feedback: 'Bitte wähle eine Antwort aus.', feedbackType: 'incorrect' });
            return;
        }
        const isCorrect = card.selectedOption === task.correctOption;
        const attempts = card.attempts + 1;
        updateCard(taskId, {
            feedback: isCorrect ? 'Richtig!' : `Nicht ganz. Richtig wäre: ${task.correctOption.replace('/', ' / ')}`,
            feedbackType: isCorrect ? 'correct' : 'incorrect',
            attempts
        });
        if (isCorrect) {
            logTrackingEntry({ topic: task.topic, attempts, firstTryCorrect: attempts === 1, solved: true, hintUsed: card.hintUsed });
        }
    };

    const answeredCount = cards.filter(c => c.feedbackType !== null).length;
    const correctCount = cards.filter(c => c.feedbackType === 'correct').length;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Trigonometrie</p>
                        <h1 className="text-3xl font-bold">Gemischte Übungsaufgaben</h1>
                        <p className="text-sm text-slate-600 max-w-2xl">
                            Zehn zufällig gemischte Aufgaben aus allen Trigonometrie-Themen (ohne Sinusfunktion). Generiere
                            einzelne Aufgaben neu oder starte mit einem komplett neuen Satz.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold">
                            {correctCount} / {answeredCount} richtig ({cards.length} Aufgaben)
                        </span>
                        <button
                            onClick={regenerateAll}
                            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-semibold px-4 py-2 shadow"
                        >
                            🔄 Alle Aufgaben neu
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {cards.map((card, index) => (
                        <TaskCard
                            key={card.task.id}
                            index={index}
                            card={card}
                            onRegenerate={() => regenerateCard(card.task.id)}
                            onCheck={() => checkCard(card.task.id)}
                            onNumericChange={(value) => updateCard(card.task.id, { numericValue: value })}
                            onAssignmentChange={(target, value) =>
                                updateCard(card.task.id, { assignments: { ...card.assignments, [target]: value } })
                            }
                            onSelectOption={(option) => updateCard(card.task.id, { selectedOption: option })}
                            onToggleSolution={() => toggleCardSolution(card.task.id)}
                        />
                    ))}
                </div>

                <div className="flex justify-center">
                    <Link to="/trigonometrie" className="text-[var(--accent)] hover:underline text-sm sm:text-base">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Zurück zur Übersicht
                    </Link>
                </div>
            </div>
        </div>
    );
};

// ---------- Karten-Komponente ----------

interface TaskCardProps {
    index: number;
    card: CardState;
    onRegenerate: () => void;
    onCheck: () => void;
    onNumericChange: (value: string) => void;
    onAssignmentChange: (target: 'hypotenuse' | 'opposite' | 'adjacent', value: string) => void;
    onSelectOption: (option: string) => void;
    onToggleSolution: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
    index,
    card,
    onRegenerate,
    onCheck,
    onNumericChange,
    onAssignmentChange,
    onSelectOption,
    onToggleSolution
}) => {
    const { task } = card;

    const feedbackClass =
        card.feedbackType === 'correct'
            ? 'bg-green-50 border-green-200 text-green-800'
            : card.feedbackType === 'incorrect'
            ? 'bg-red-50 border-red-200 text-red-800'
            : '';

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-white font-semibold">
                        Aufgabe {index + 1}
                    </span>
                </div>
                <button onClick={onRegenerate} className="text-sm text-[var(--accent)] font-semibold hover:underline">
                    🔄 Aufgabe neu
                </button>
            </div>

            {task.kind === 'numeric' && (
                <div className="grid gap-5 md:grid-cols-[1.4fr,1fr]">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 h-[340px] sm:h-[380px]">
                        <NumericSketch sketch={task.sketch} />
                    </div>
                    <div className="space-y-3">
                        <p className="text-slate-800 leading-relaxed">{task.prompt}</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={card.numericValue}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNumericChange(e.target.value)}
                                placeholder="Deine Lösung"
                                className="w-full sm:w-48 border border-slate-300 rounded-lg px-3 py-2 text-center"
                            />
                            <span className="text-slate-600 w-10">{task.unit}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={onCheck}
                                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
                            >
                                Prüfen
                            </button>
                            <button onClick={onToggleSolution} className="text-sm text-slate-600 font-semibold hover:underline">
                                {card.showSolution ? 'Lösungsweg ausblenden' : 'Lösungsweg anzeigen'}
                            </button>
                        </div>
                        {card.feedback && (
                            <div className={`rounded-lg border px-3 py-2 text-sm font-semibold ${feedbackClass}`}>{card.feedback}</div>
                        )}
                        {card.showSolution && (
                            <ul className="text-sm text-slate-600 space-y-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                {task.solutionSteps.map((step, i) => (
                                    <li key={i}>• {step}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {task.kind === 'beschriften' && (
                <div className="grid gap-5 md:grid-cols-[1.4fr,1fr]">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 h-[340px] sm:h-[380px]">
                        <RightTriangleSVG
                            pointA={task.triangle.pointA}
                            pointB={task.triangle.pointB}
                            pointC={task.triangle.pointC}
                            sideA={task.triangle.sideA}
                            sideB={task.triangle.sideB}
                            sideC={task.triangle.sideC}
                            rightAngleAtPoint={task.triangle.rightAngleAtPoint}
                            markedAngle={task.triangle.markedAngle}
                            markedAngleAtPoint={task.triangle.markedAngleAtPoint}
                        />
                    </div>
                    <div className="space-y-3">
                        <p className="text-slate-800 leading-relaxed">
                            Vom Winkel {greekSymbols[task.triangle.markedAngle]} aus betrachtet: Ordne Hypotenuse, Gegenkathete und
                            Ankathete den richtigen Seiten zu.
                        </p>
                        {(['hypotenuse', 'opposite', 'adjacent'] as const).map(target => (
                            <label key={target} className="block space-y-1">
                                <span className="text-sm font-semibold text-slate-700">
                                    {target === 'hypotenuse'
                                        ? 'Hypotenuse'
                                        : target === 'opposite'
                                        ? `Gegenkathete von ${greekSymbols[task.triangle.markedAngle]}`
                                        : `Ankathete von ${greekSymbols[task.triangle.markedAngle]}`}
                                </span>
                                <select
                                    value={card.assignments[target] ?? '-'}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                        onAssignmentChange(target, e.target.value === '-' ? '' : e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                                >
                                    <option value="-">-</option>
                                    {task.sideOptions.map(opt => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ))}
                        <button
                            onClick={onCheck}
                            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
                        >
                            Prüfen
                        </button>
                        {card.feedback && (
                            <div className={`rounded-lg border px-3 py-2 text-sm font-semibold ${feedbackClass}`}>{card.feedback}</div>
                        )}
                    </div>
                </div>
            )}

            {task.kind === 'erkennen' && (
                <div className="grid gap-5 md:grid-cols-[1.4fr,1fr]">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 h-[340px] sm:h-[380px]">
                        <RightTriangleSVG
                            pointA={task.triangle.pointA}
                            pointB={task.triangle.pointB}
                            pointC={task.triangle.pointC}
                            sideA={task.triangle.sideA}
                            sideB={task.triangle.sideB}
                            sideC={task.triangle.sideC}
                            rightAngleAtPoint={task.triangle.rightAngleAtPoint}
                            markedAngle={task.triangle.markedAngle}
                            markedAngleAtPoint={task.triangle.markedAngleAtPoint}
                        />
                    </div>
                    <div className="space-y-3">
                        {task.type === 'functionToRatio' ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                                <InlineMath math={trigFormula[task.askedFunction!]} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-center text-xs">
                                {(['sin', 'cos', 'tan'] as TrigFunction[]).map(fn => (
                                    <div key={fn}>
                                        <p className="font-semibold text-blue-900 mb-1">{trigFunctionLabel[fn]}</p>
                                        <InlineMath math={trigFormula[fn]} />
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-slate-800 font-semibold">
                            {task.type === 'functionToRatio' ? (
                                <>
                                    Welcher Bruch entspricht {trigFunctionLabel[task.askedFunction!]}(
                                    {greekSymbols[task.triangle.markedAngle]})?
                                </>
                            ) : (
                                <>
                                    Welche Funktion beschreibt den Bruch{' '}
                                    <InlineMath math={`\\dfrac{${task.askedRatioLabel![0]}}{${task.askedRatioLabel![1]}}`} /> in Bezug
                                    auf {greekSymbols[task.triangle.markedAngle]}?
                                </>
                            )}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {task.options.map(option => {
                                const isSelected = card.selectedOption === option;
                                return (
                                    <button
                                        key={option}
                                        onClick={() => onSelectOption(option)}
                                        className={`border-2 rounded-lg p-2 text-sm font-semibold transition ${
                                            isSelected ? 'bg-blue-100 border-blue-500' : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        {task.type === 'functionToRatio' ? (
                                            <InlineMath math={`\\dfrac{${option.split('/')[0]}}{${option.split('/')[1]}}`} />
                                        ) : (
                                            option
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={onCheck}
                            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
                        >
                            Prüfen
                        </button>
                        {card.feedback && (
                            <div className={`rounded-lg border px-3 py-2 text-sm font-semibold ${feedbackClass}`}>{card.feedback}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GemischteUebungsaufgaben;
