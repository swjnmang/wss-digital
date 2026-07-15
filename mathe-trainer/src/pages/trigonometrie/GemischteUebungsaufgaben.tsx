import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import RightTriangleSVG from '../../components/RightTriangleSVG';
import GeoGebraTriangleSketch, { GgbAngle } from '../../components/GeoGebraTriangleSketch';
import { HelpUsage, logTrackingEntry } from '../../utils/tracking';

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

// Beschriftungs-Sets für Dreiecke: Eckpunkte, gegenüberliegende Seiten und Winkel
// gehören jeweils zusammen (Punkt i <-> Seite i <-> Winkel i), damit die Zuordnung
// mathematisch korrekt bleibt, egal welches Set zufällig gezogen wird.
interface LetterScheme {
    points: [string, string, string];
    sides: [string, string, string];
    angles: [string, string, string];
}

const LETTER_SCHEMES: LetterScheme[] = [
    { points: ['A', 'B', 'C'], sides: ['a', 'b', 'c'], angles: ['α', 'β', 'γ'] },
    { points: ['P', 'Q', 'R'], sides: ['p', 'q', 'r'], angles: ['φ', 'ψ', 'χ'] },
    { points: ['D', 'E', 'F'], sides: ['d', 'e', 'f'], angles: ['δ', 'ε', 'ζ'] },
    { points: ['B', 'C', 'D'], sides: ['b', 'c', 'd'], angles: ['β', 'γ', 'δ'] }
];

const DEFAULT_POINTS: [string, string, string] = ['A', 'B', 'C'];
const DEFAULT_GENERAL_LABELS: Record<GeneralKey, string> = { a: 'a', b: 'b', c: 'c', alpha: 'α', beta: 'β', gamma: 'γ' };

const pickLetterScheme = (): LetterScheme => pick(LETTER_SCHEMES);

// Direkte a/b/c<->α/β/γ-Zuordnung für Skizzen, deren interne Rollen exakt den
// tatsächlichen Seiten/Winkeln der Aufgabe entsprechen (Sinussatz, Kosinussatz).
const schemeToGeneralLabels = (scheme: LetterScheme): Record<GeneralKey, string> => ({
    a: scheme.sides[0],
    b: scheme.sides[1],
    c: scheme.sides[2],
    alpha: scheme.angles[0],
    beta: scheme.angles[1],
    gamma: scheme.angles[2]
});

interface RightSketchSpec {
    kind: 'right';
    horizontal: number;
    vertical: number;
    horizontalName: string;
    verticalName: string;
    hypotenuseName: string;
    angleName: string;
    highlight: RightHighlight;
    askedLabel?: string;
}

interface GeneralSketchSpec {
    kind: 'general';
    b: number;
    c: number;
    alpha: number;
    highlightKey: GeneralKey | 'none';
    askedLabel?: string;
    points?: [string, string, string];
    labels?: Partial<Record<GeneralKey, string>>;
}

type SketchSpec = RightSketchSpec | GeneralSketchSpec;

const GIVEN_COLOR = '#1f2937';
const HIGHLIGHT_COLOR = '#dc2626';

const NumericRightSketch: React.FC<{ spec: RightSketchSpec }> = ({ spec }) => {
    const { horizontal, vertical, horizontalName, verticalName, hypotenuseName, angleName, highlight, askedLabel } = spec;
    // Zeigt im Aufgabentext bereits genannte Werte nicht erneut an. Nur der
    // gesuchte Teil bekommt ein "= ?" und wird rot markiert.
    const partLabel = (name: string, part: RightHighlight) => (name && highlight === part ? `${name} = ?` : name);
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

    // Winkel-Bogen zwischen zwei Strahlen ab einem Scheitelpunkt (für Winkelmarkierung und rechten Winkel).
    const computeArc = (
        vertex: { x: number; y: number },
        p1: { x: number; y: number },
        p2: { x: number; y: number },
        radius: number
    ) => {
        const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
        const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
        const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y) || 1;
        const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y) || 1;
        const u1 = { x: v1.x / len1, y: v1.y / len1 };
        const u2 = { x: v2.x / len2, y: v2.y / len2 };
        const start = { x: vertex.x + u1.x * radius, y: vertex.y + u1.y * radius };
        const end = { x: vertex.x + u2.x * radius, y: vertex.y + u2.y * radius };

        const angle1 = Math.atan2(v1.y, v1.x);
        const angle2 = Math.atan2(v2.y, v2.x);
        let delta = angle2 - angle1;
        delta = ((delta + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
        const largeArc = Math.abs(delta) > Math.PI / 2 + 0.001 ? 1 : 0;
        const sweep = delta > 0 ? 1 : 0;

        let bisector = { x: u1.x + u2.x, y: u1.y + u2.y };
        const bisectorLen = Math.sqrt(bisector.x * bisector.x + bisector.y * bisector.y);
        bisector = bisectorLen > 0.0001 ? { x: bisector.x / bisectorLen, y: bisector.y / bisectorLen } : u1;

        return { start, end, largeArc, sweep, bisector };
    };

    const A = { x: Ax, y: Ay };
    const B = { x: Bx, y: By };
    const C = { x: Cx, y: Cy };

    // Rechter-Winkel-Markierung bei B (grauer Viertelkreis-Sektor mit Punkt).
    const rightArc = computeArc(B, A, C, 18);
    const rightSectorPath = `M ${B.x} ${B.y} L ${rightArc.start.x} ${rightArc.start.y} A 18 18 0 ${rightArc.largeArc} ${rightArc.sweep} ${rightArc.end.x} ${rightArc.end.y} Z`;
    const rightDotRadius = 18 * 0.55;
    const rightDotX = B.x + rightArc.bisector.x * rightDotRadius;
    const rightDotY = B.y + rightArc.bisector.y * rightDotRadius;

    // Winkelbogen für α bei A.
    const alphaArc = computeArc(A, B, C, 24);
    const alphaArcPath = `M ${alphaArc.start.x} ${alphaArc.start.y} A 24 24 0 ${alphaArc.largeArc} ${alphaArc.sweep} ${alphaArc.end.x} ${alphaArc.end.y}`;

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="mx-auto">
            <polygon points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`} fill="#eef2ff" stroke="#0f172a" strokeWidth={2} />
            <line x1={Ax} y1={Ay} x2={Bx} y2={By} stroke={colorFor('horizontal')} strokeWidth={3} />
            <line x1={Bx} y1={By} x2={Cx} y2={Cy} stroke={colorFor('vertical')} strokeWidth={3} />
            <line x1={Ax} y1={Ay} x2={Cx} y2={Cy} stroke={colorFor('hypotenuse')} strokeWidth={3} />

            <path d={rightSectorPath} fill="#9CA3AF" fillOpacity="0.35" stroke="#6B7280" strokeWidth={1} />
            <circle cx={rightDotX} cy={rightDotY} r={2.5} fill="#374151" />
            <path d={alphaArcPath} fill="none" stroke={colorFor('angle')} strokeWidth={2} />

            <text x={(Ax + Bx) / 2} y={Ay + 18} textAnchor="middle" fontSize="12" fill={colorFor('horizontal')}>
                {partLabel(horizontalName, 'horizontal')}
            </text>
            <text x={Bx + 8} y={(By + Cy) / 2} fontSize="12" fill={colorFor('vertical')}>
                {partLabel(verticalName, 'vertical')}
            </text>
            <text x={(Ax + Cx) / 2 - 8} y={(Ay + Cy) / 2 - 5} fontSize="12" fill={colorFor('hypotenuse')} textAnchor="end">
                {partLabel(hypotenuseName, 'hypotenuse')}
            </text>
            <text x={Ax + 24} y={Ay - 8} fontSize="13" fontWeight="bold" fill={colorFor('angle')}>
                {partLabel(angleName, 'angle')}
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
    const { b, c, alpha, highlightKey, askedLabel } = spec;
    const points = spec.points ?? DEFAULT_POINTS;
    const labels = { ...DEFAULT_GENERAL_LABELS, ...(spec.labels ?? {}) };
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

    // Zeigt im Aufgabentext bereits genannte Werte nicht erneut an. Nur der
    // gesuchte Teil bekommt ein "= ?" und wird rot markiert.
    const colorFor = (key: GeneralKey) => (highlightKey === key ? HIGHLIGHT_COLOR : GIVEN_COLOR);
    const sideLabel = (key: 'a' | 'b' | 'c') => (highlightKey === key ? `${labels[key]} = ?` : labels[key]);
    const angleLabel = (key: 'alpha' | 'beta' | 'gamma') => (highlightKey === key ? `${labels[key]} = ?` : labels[key]);

    const centroid = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
    const sideLabelPos = (p1: { x: number; y: number }, p2: { x: number; y: number }, offset = 16) => {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const dx = mx - centroid.x;
        const dy = my - centroid.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        return { x: mx + (dx / len) * offset, y: my + (dy / len) * offset };
    };
    // Winkel-Labels werden vom Zentroid weg aus der jeweiligen Ecke herausgeschoben,
    // damit α/β/γ immer am richtigen Eckpunkt stehen, unabhängig von der Dreiecksform.
    const angleLabelPos = (vertex: { x: number; y: number }, offset = 18) => {
        const dx = vertex.x - centroid.x;
        const dy = vertex.y - centroid.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        return { x: vertex.x + (dx / len) * offset, y: vertex.y + (dy / len) * offset };
    };

    const labelC_ = sideLabelPos(A, B);
    const labelB_ = sideLabelPos(A, C);
    const labelA_ = sideLabelPos(B, C);
    const angleA_ = angleLabelPos(A);
    const angleB_ = angleLabelPos(B);
    const angleC_ = angleLabelPos(C);

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="mx-auto">
            <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="#eef2ff" stroke="#0f172a" strokeWidth={2} />
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={colorFor('c')} strokeWidth={3} />
            <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke={colorFor('b')} strokeWidth={3} />
            <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke={colorFor('a')} strokeWidth={3} />

            <circle cx={A.x} cy={A.y} r={3} fill="#0f172a" />
            <circle cx={B.x} cy={B.y} r={3} fill="#0f172a" />
            <circle cx={C.x} cy={C.y} r={3} fill="#0f172a" />
            <text x={A.x - 12} y={A.y + 16} fontSize="12" fontWeight="bold">{points[0]}</text>
            <text x={B.x + 8} y={B.y + 16} fontSize="12" fontWeight="bold">{points[1]}</text>
            <text x={C.x} y={C.y - 10} fontSize="12" fontWeight="bold" textAnchor="middle">{points[2]}</text>

            <text x={labelC_.x} y={labelC_.y} textAnchor="middle" fontSize="12" fill={colorFor('c')}>
                {sideLabel('c')}
            </text>
            <text x={labelB_.x} y={labelB_.y} textAnchor="middle" fontSize="12" fill={colorFor('b')}>
                {sideLabel('b')}
            </text>
            <text x={labelA_.x} y={labelA_.y} textAnchor="middle" fontSize="12" fill={colorFor('a')}>
                {sideLabel('a')}
            </text>

            <text x={angleA_.x} y={angleA_.y} textAnchor="middle" fontSize="12" fontWeight="bold" fill={colorFor('alpha')}>
                {angleLabel('alpha')}
            </text>
            <text x={angleB_.x} y={angleB_.y} textAnchor="middle" fontSize="12" fontWeight="bold" fill={colorFor('beta')}>
                {angleLabel('beta')}
            </text>
            <text x={angleC_.x} y={angleC_.y} textAnchor="middle" fontSize="12" fontWeight="bold" fill={colorFor('gamma')}>
                {angleLabel('gamma')}
            </text>

            {askedLabel && (
                <text x={width - 12} y={22} textAnchor="end" fontSize="13" fontWeight="bold" fill={HIGHLIGHT_COLOR}>
                    {askedLabel}
                </text>
            )}
        </svg>
    );
};

// Beschriftung mit "= ?" für die gesuchte Größe.
const asked = (label: string | undefined, highlighted: boolean) =>
    label && highlighted ? `${label} = ?` : label;

// Alle Skizzen laufen über das GeoGebra-Applet; die alten SVG-Skizzen bleiben
// als Fallback erhalten, falls das GeoGebra-Script nicht lädt (kein Internet).
const NumericSketch: React.FC<{ sketch: SketchSpec }> = ({ sketch }) => {
    if (sketch.kind === 'right') {
        const { horizontal, vertical, horizontalName, verticalName, hypotenuseName, angleName, highlight } = sketch;
        return (
            <GeoGebraTriangleSketch
                points={[
                    { x: 0, y: 0 },
                    { x: horizontal, y: 0 },
                    { x: horizontal, y: vertical }
                ]}
                sides={[
                    { label: asked(horizontalName, highlight === 'horizontal'), highlighted: highlight === 'horizontal' },
                    { label: asked(verticalName, highlight === 'vertical'), highlighted: highlight === 'vertical' },
                    { label: asked(hypotenuseName, highlight === 'hypotenuse'), highlighted: highlight === 'hypotenuse' }
                ]}
                angles={[
                    { label: asked(angleName, highlight === 'angle'), highlighted: highlight === 'angle' },
                    // Rechter Winkel: nur das 90°-Symbol, ohne Beschriftung.
                    {},
                    { show: false }
                ]}
                askedLabel={sketch.askedLabel}
                fallback={<NumericRightSketch spec={sketch} />}
            />
        );
    }

    const points = sketch.points ?? DEFAULT_POINTS;
    const labels = { ...DEFAULT_GENERAL_LABELS, ...(sketch.labels ?? {}) };
    const { highlightKey } = sketch;
    const rad = degToRad(sketch.alpha);
    return (
        <GeoGebraTriangleSketch
            points={[
                { x: 0, y: 0, label: points[0] },
                { x: sketch.c, y: 0, label: points[1] },
                { x: sketch.b * Math.cos(rad), y: sketch.b * Math.sin(rad), label: points[2] }
            ]}
            sides={[
                { label: asked(labels.c, highlightKey === 'c'), highlighted: highlightKey === 'c' },
                { label: asked(labels.a, highlightKey === 'a'), highlighted: highlightKey === 'a' },
                { label: asked(labels.b, highlightKey === 'b'), highlighted: highlightKey === 'b' }
            ]}
            angles={[
                { label: asked(labels.alpha, highlightKey === 'alpha'), highlighted: highlightKey === 'alpha' },
                { label: asked(labels.beta, highlightKey === 'beta'), highlighted: highlightKey === 'beta' },
                { label: asked(labels.gamma, highlightKey === 'gamma'), highlighted: highlightKey === 'gamma' }
            ]}
            askedLabel={sketch.askedLabel}
            fallback={<NumericGeneralSketch spec={sketch} />}
        />
    );
};

// ---------- Aufgaben-Typen ----------

interface SolutionStep {
    text: string;
    math?: string;
}

interface NumericTask {
    id: number;
    kind: 'numeric';
    topic: string;
    prompt: string;
    unit: string;
    correctAnswer: string;
    tolerance: number;
    sketch: SketchSpec;
    solutionSteps: SolutionStep[];
}

interface LabelTriangle {
    pointA: string;
    pointB: string;
    pointC: string;
    sideA: string;
    sideB: string;
    sideC: string;
    angleA: string;
    angleB: string;
    angleC: string;
    rightAngleAtPoint: string;
    markedAngle: 'alpha' | 'beta' | 'gamma';
    markedAngleAtPoint: string;
    markedAngleSymbol: string;
}

const ANGLE_ROLES: ('alpha' | 'beta' | 'gamma')[] = ['alpha', 'beta', 'gamma'];

// GeoGebra-Skizze für die Zuordnungsaufgaben (Beschriften/Erkennen): rechtwinkliges
// Dreieck mit variabler Lage des rechten Winkels, markierter Winkel rot. Fallback
// ist die bisherige SVG-Komponente RightTriangleSVG.
const LabelTriangleSketch: React.FC<{ triangle: LabelTriangle }> = ({ triangle: t }) => {
    const K1 = 4;
    const K2 = 2.8;
    let coords: [number, number][];
    if (t.rightAngleAtPoint === t.pointA) {
        coords = [
            [0, K2],
            [K1, K2],
            [0, 0]
        ];
    } else if (t.rightAngleAtPoint === t.pointB) {
        coords = [
            [0, 0],
            [K1, 0],
            [K1, K2]
        ];
    } else {
        coords = [
            [K1, 0],
            [0, K2],
            [0, 0]
        ];
    }
    const names = [t.pointA, t.pointB, t.pointC];
    const angleNames = [t.angleA, t.angleB, t.angleC];
    return (
        <GeoGebraTriangleSketch
            points={[
                { x: coords[0][0], y: coords[0][1], label: names[0] },
                { x: coords[1][0], y: coords[1][1], label: names[1] },
                { x: coords[2][0], y: coords[2][1], label: names[2] }
            ]}
            sides={[{ label: t.sideC }, { label: t.sideA }, { label: t.sideB }]}
            angles={
                names.map((name, i) =>
                    name === t.rightAngleAtPoint
                        ? // Rechter Winkel: nur das 90°-Symbol, ohne Beschriftung.
                          {}
                        : { label: angleNames[i], highlighted: name === t.markedAngleAtPoint }
                ) as [GgbAngle, GgbAngle, GgbAngle]
            }
            fallback={
                <RightTriangleSVG
                    pointA={t.pointA}
                    pointB={t.pointB}
                    pointC={t.pointC}
                    sideA={t.sideA}
                    sideB={t.sideB}
                    sideC={t.sideC}
                    angleLabelA={t.angleA}
                    angleLabelB={t.angleB}
                    angleLabelC={t.angleC}
                    rightAngleAtPoint={t.rightAngleAtPoint}
                    markedAngle={t.markedAngle}
                    markedAngleAtPoint={t.markedAngleAtPoint}
                />
            }
        />
    );
};

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

const trigFunctionLabel: Record<TrigFunction, string> = { sin: 'Sinus', cos: 'Kosinus', tan: 'Tangens' };
const trigFormula: Record<TrigFunction, string> = {
    sin: '\\sin(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}',
    cos: '\\cos(\\alpha) = \\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}',
    tan: '\\tan(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}}'
};

// ---------- Aufgaben-Generatoren ----------

// 1) Rechtwinklige Dreiecke beschriften
const buildBeschriftenTask = (): BeschriftenTask => {
    const scheme = pickLetterScheme();
    const points = scheme.points;
    const sides = scheme.sides;
    const angles = scheme.angles;
    const rightAngleAtPoint = pick(points);
    const otherPoints = points.filter(p => p !== rightAngleAtPoint);
    const markedAngleAtPoint = pick(otherPoints);
    const markedAngle = ANGLE_ROLES[points.indexOf(markedAngleAtPoint)];
    const markedAngleSymbol = angles[points.indexOf(markedAngleAtPoint)];

    const hypotenuse = sides[points.indexOf(rightAngleAtPoint)];
    const opposite = sides[points.indexOf(markedAngleAtPoint)];
    const adjacent = sides.find(s => s !== hypotenuse && s !== opposite)!;

    return {
        id: nextId(),
        kind: 'beschriften',
        topic: 'Dreiecke beschriften',
        triangle: {
            pointA: points[0],
            pointB: points[1],
            pointC: points[2],
            sideA: sides[0],
            sideB: sides[1],
            sideC: sides[2],
            angleA: angles[0],
            angleB: angles[1],
            angleC: angles[2],
            rightAngleAtPoint,
            markedAngle,
            markedAngleAtPoint,
            markedAngleSymbol
        },
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
    const scheme = pickLetterScheme();
    const points = scheme.points;
    const sides = scheme.sides;
    const angles = scheme.angles;
    const rightAngleAtPoint = pick(points);
    const otherPoints = points.filter(p => p !== rightAngleAtPoint);
    const markedAngleAtPoint = pick(otherPoints);
    const markedAngle = ANGLE_ROLES[points.indexOf(markedAngleAtPoint)];
    const markedAngleSymbol = angles[points.indexOf(markedAngleAtPoint)];

    const hypotenuse = sides[points.indexOf(rightAngleAtPoint)];
    const opposite = sides[points.indexOf(markedAngleAtPoint)];
    const adjacent = sides.find(s => s !== hypotenuse && s !== opposite)!;
    const sideOf: Record<SideRole, string> = { hypotenuse, opposite, adjacent };

    const triangle: LabelTriangle = {
        pointA: points[0],
        pointB: points[1],
        pointC: points[2],
        sideA: sides[0],
        sideB: sides[1],
        sideC: sides[2],
        angleA: angles[0],
        angleB: angles[1],
        angleC: angles[2],
        rightAngleAtPoint,
        markedAngle,
        markedAngleAtPoint,
        markedAngleSymbol
    };
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
    const scheme = pickLetterScheme();
    const [sA, sB, sC] = scheme.sides;
    const [angleA] = scheme.angles;
    const alpha = randomInt(20, 70);
    const hyp = round(randomInRange(5, 15), 2);
    const askOpposite = Math.random() < 0.5;
    const opposite = hyp * Math.sin(degToRad(alpha));
    const adjacent = hyp * Math.cos(degToRad(alpha));

    const solutionSteps: SolutionStep[] = askOpposite
        ? [
              { text: 'Gegeben', math: `${sC} = ${hyp}\\,\\text{cm}, \\quad ${angleA} = ${alpha}^\\circ` },
              {
                  text: 'Sinus verwenden (Gegenkathete / Hypotenuse)',
                  math: `\\sin(${angleA}) = \\dfrac{${sA}}{${sC}} \\;\\Rightarrow\\; ${sA} = ${sC} \\cdot \\sin(${angleA})`
              },
              { text: 'Werte einsetzen', math: `${sA} = ${hyp} \\cdot \\sin(${alpha}^\\circ) = ${hyp} \\cdot ${Math.sin(degToRad(alpha)).toFixed(4)}` },
              { text: 'Ergebnis', math: `${sA} \\approx ${opposite.toFixed(2)}\\,\\text{cm}` }
          ]
        : [
              { text: 'Gegeben', math: `${sC} = ${hyp}\\,\\text{cm}, \\quad ${angleA} = ${alpha}^\\circ` },
              {
                  text: 'Kosinus verwenden (Ankathete / Hypotenuse)',
                  math: `\\cos(${angleA}) = \\dfrac{${sB}}{${sC}} \\;\\Rightarrow\\; ${sB} = ${sC} \\cdot \\cos(${angleA})`
              },
              { text: 'Werte einsetzen', math: `${sB} = ${hyp} \\cdot \\cos(${alpha}^\\circ) = ${hyp} \\cdot ${Math.cos(degToRad(alpha)).toFixed(4)}` },
              { text: 'Ergebnis', math: `${sB} \\approx ${adjacent.toFixed(2)}\\,\\text{cm}` }
          ];

    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Streckenlänge berechnen',
        prompt: askOpposite
            ? `In einem rechtwinkligen Dreieck sind die Seite ${sC} = ${hyp} cm und der Winkel ${angleA} = ${alpha}° gegeben. Berechne die Seite ${sA}.`
            : `In einem rechtwinkligen Dreieck sind die Seite ${sC} = ${hyp} cm und der Winkel ${angleA} = ${alpha}° gegeben. Berechne die Seite ${sB}.`,
        unit: 'cm',
        correctAnswer: (askOpposite ? opposite : adjacent).toFixed(2),
        tolerance: relTolerance(askOpposite ? opposite : adjacent),
        solutionSteps,
        sketch: {
            kind: 'right',
            horizontal: adjacent,
            vertical: opposite,
            horizontalName: sB,
            verticalName: sA,
            hypotenuseName: sC,
            angleName: angleA,
            highlight: askOpposite ? 'vertical' : 'horizontal'
        }
    };
};

// 4) Rechtwinkliges Dreieck: fehlenden Winkel berechnen
const buildWinkelTask = (): NumericTask => {
    const scheme = pickLetterScheme();
    const [sA, sB, sC] = scheme.sides;
    const [angleA] = scheme.angles;
    const adjacent = round(randomInRange(4, 12), 2);
    const opposite = round(randomInRange(4, 12), 2);
    const angle = radToDeg(Math.atan(opposite / adjacent));

    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Winkel berechnen',
        prompt: `In einem rechtwinkligen Dreieck sind die Seite ${sB} = ${adjacent} cm und die Seite ${sA} = ${opposite} cm bekannt. Berechne den Winkel ${angleA}.`,
        unit: '°',
        correctAnswer: angle.toFixed(1),
        tolerance: relTolerance(angle),
        solutionSteps: [
            { text: 'Gegeben', math: `${sB} = ${adjacent}\\,\\text{cm} \\text{ (Ankathete)}, \\quad ${sA} = ${opposite}\\,\\text{cm} \\text{ (Gegenkathete)}` },
            { text: 'Tangens verwenden', math: `\\tan(${angleA}) = \\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}} = \\dfrac{${sA}}{${sB}}` },
            { text: 'Werte einsetzen', math: `\\tan(${angleA}) = \\dfrac{${opposite}}{${adjacent}} = ${(opposite / adjacent).toFixed(4)}` },
            { text: 'Umkehrfunktion verwenden', math: `${angleA} = \\tan^{-1}(${(opposite / adjacent).toFixed(4)}) \\approx ${angle.toFixed(1)}^\\circ` }
        ],
        sketch: {
            kind: 'right',
            horizontal: adjacent,
            vertical: opposite,
            horizontalName: sB,
            verticalName: sA,
            hypotenuseName: sC,
            angleName: angleA,
            highlight: 'angle'
        }
    };
};

// 5) Steigungswinkel: Grad <-> Prozent
const buildSteigungTask = (): NumericTask => {
    const [angleA] = pickLetterScheme().angles;
    const askPercent = Math.random() < 0.5;
    if (askPercent) {
        const angle = round(randomInRange(5, 35), 1);
        const percent = Math.tan(degToRad(angle)) * 100;
        return {
            id: nextId(),
            kind: 'numeric',
            topic: 'Steigungswinkel',
            prompt: `Eine Straße hat einen Steigungswinkel von ${angleA} = ${angle}°. Berechne die Steigung in Prozent.`,
            unit: '%',
            correctAnswer: percent.toFixed(1),
            tolerance: relTolerance(percent),
            solutionSteps: [
                { text: 'Gegeben', math: `${angleA} = ${angle}^\\circ` },
                { text: 'Formel für die Steigung', math: `\\text{Steigung} = 100 \\cdot \\tan(${angleA})` },
                { text: 'Werte einsetzen', math: `\\text{Steigung} = 100 \\cdot \\tan(${angle}^\\circ) = 100 \\cdot ${Math.tan(degToRad(angle)).toFixed(4)}` },
                { text: 'Ergebnis', math: `\\text{Steigung} \\approx ${percent.toFixed(1)}\\,\\%` }
            ],
            sketch: {
                kind: 'right',
                horizontal: 100,
                vertical: percent,
                horizontalName: 'horizontale Strecke',
                verticalName: '',
                hypotenuseName: 'Weg',
                angleName: angleA,
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
        prompt: `Eine Straße hat eine Steigung von ${percent} %. Berechne den Steigungswinkel ${angleA}.`,
        unit: '°',
        correctAnswer: angle.toFixed(1),
        tolerance: relTolerance(angle),
        solutionSteps: [
            { text: 'Gegeben', math: `\\text{Steigung} = ${percent}\\,\\%` },
            { text: 'Formel umstellen', math: `\\tan(${angleA}) = \\dfrac{\\text{Steigung}}{100} = \\dfrac{${percent}}{100} = ${(percent / 100).toFixed(4)}` },
            { text: 'Umkehrfunktion verwenden', math: `${angleA} = \\tan^{-1}(${(percent / 100).toFixed(4)}) \\approx ${angle.toFixed(1)}^\\circ` }
        ],
        sketch: {
            kind: 'right',
            horizontal: 100,
            vertical: percent,
            horizontalName: 'horizontale Strecke',
            verticalName: 'Steigung',
            hypotenuseName: 'Weg',
            angleName: angleA,
            highlight: 'angle'
        }
    };
};

// 6) Sinussatz
const buildSinussatzTask = (): NumericTask => {
    const scheme = pickLetterScheme();
    const [sA, sB] = scheme.sides;
    const [angleA, angleB] = scheme.angles;
    const generalLabels = schemeToGeneralLabels(scheme);
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
            prompt: `In einem Dreieck sind ${sA} = ${a} cm, ${angleA} = ${alpha}° und ${angleB} = ${beta}° gegeben. Berechne die Seite ${sB} mit dem Sinussatz.`,
            unit: 'cm',
            correctAnswer: round(b, 2).toFixed(2),
            tolerance: relTolerance(b),
            solutionSteps: [
                { text: 'Gegeben', math: `${sA} = ${a}\\,\\text{cm}, \\quad ${angleA} = ${alpha}^\\circ, \\quad ${angleB} = ${beta}^\\circ` },
                { text: 'Sinussatz aufschreiben', math: `\\dfrac{${sA}}{\\sin(${angleA})} = \\dfrac{${sB}}{\\sin(${angleB})}` },
                { text: `${sB} isolieren`, math: `${sB} = \\dfrac{\\sin(${angleB})}{\\sin(${angleA})} \\cdot ${sA}` },
                { text: 'Werte einsetzen', math: `${sB} = \\dfrac{\\sin(${beta}^\\circ)}{\\sin(${alpha}^\\circ)} \\cdot ${a}` },
                { text: 'Ergebnis', math: `${sB} \\approx ${round(b, 2)}\\,\\text{cm}` }
            ],
            sketch: {
                kind: 'general',
                b: round(b, 2),
                c: round(c, 2),
                alpha,
                highlightKey: 'b',
                points: scheme.points,
                labels: generalLabels
            }
        };
    }

    const sinBeta = Math.min(1, Math.max(-1, (round(b, 2) * Math.sin(degToRad(alpha))) / a));
    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Sinussatz',
        prompt: `In einem Dreieck sind ${sA} = ${a} cm, ${sB} = ${round(b, 2)} cm und ${angleA} = ${alpha}° gegeben. Berechne den Winkel ${angleB} mit dem Sinussatz.`,
        unit: '°',
        correctAnswer: beta.toFixed(1),
        tolerance: relTolerance(beta),
        solutionSteps: [
            { text: 'Gegeben', math: `${sA} = ${a}\\,\\text{cm}, \\quad ${sB} = ${round(b, 2)}\\,\\text{cm}, \\quad ${angleA} = ${alpha}^\\circ` },
            { text: 'Sinussatz mit Winkeln formulieren', math: `\\dfrac{\\sin(${angleB})}{${sB}} = \\dfrac{\\sin(${angleA})}{${sA}}` },
            { text: `${angleB} isolieren`, math: `\\sin(${angleB}) = \\dfrac{${sB}}{${sA}} \\cdot \\sin(${angleA})` },
            { text: 'Werte einsetzen', math: `\\sin(${angleB}) = \\dfrac{${round(b, 2)}}{${a}} \\cdot \\sin(${alpha}^\\circ)` },
            { text: 'Umkehrfunktion (Sinus⁻¹) verwenden', math: `${angleB} = \\sin^{-1}(${sinBeta.toFixed(3)}) \\approx ${beta.toFixed(1)}^\\circ` }
        ],
        sketch: {
            kind: 'general',
            b: round(b, 2),
            c: round(c, 2),
            alpha,
            highlightKey: 'beta',
            points: scheme.points,
            labels: generalLabels
        }
    };
};

// 7) Kosinussatz
const buildKosinussatzTask = (): NumericTask => {
    const scheme = pickLetterScheme();
    const [sA, sB, sC] = scheme.sides;
    const [angleA, angleB] = scheme.angles;
    const generalLabels = schemeToGeneralLabels(scheme);
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
            prompt: `In einem Dreieck sind ${sB} = ${b} cm, ${sC} = ${c} cm und der eingeschlossene Winkel ${angleA} = ${alpha}° gegeben. Berechne die Seite ${sA} mit dem Kosinussatz.`,
            unit: 'cm',
            correctAnswer: round(a, 2).toFixed(2),
            tolerance: relTolerance(a),
            solutionSteps: [
                { text: 'Gegeben', math: `${sB} = ${b}\\,\\text{cm}, \\quad ${sC} = ${c}\\,\\text{cm}, \\quad ${angleA} = ${alpha}^\\circ` },
                { text: 'Kosinussatz aufschreiben', math: `${sA}^2 = ${sB}^2 + ${sC}^2 - 2 \\cdot ${sB} \\cdot ${sC} \\cdot \\cos(${angleA})` },
                { text: 'Werte einsetzen', math: `${sA}^2 = ${b}^2 + ${c}^2 - 2 \\cdot ${b} \\cdot ${c} \\cdot \\cos(${alpha}^\\circ) = ${aSquared.toFixed(2)}` },
                { text: 'Wurzel ziehen', math: `${sA} = \\sqrt{${aSquared.toFixed(2)}} \\approx ${a.toFixed(2)}\\,\\text{cm}` }
            ],
            sketch: {
                kind: 'general',
                b,
                c,
                alpha,
                highlightKey: 'a',
                points: scheme.points,
                labels: generalLabels
            }
        };
    }

    const cosBeta = Math.min(1, Math.max(-1, (a * a + c * c - b * b) / (2 * a * c)));
    const beta = radToDeg(Math.acos(cosBeta));
    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Kosinussatz',
        prompt: `In einem Dreieck sind ${sA} = ${round(a, 2)} cm, ${sB} = ${b} cm und ${sC} = ${c} cm gegeben. Berechne den Winkel ${angleB} mit dem Kosinussatz.`,
        unit: '°',
        correctAnswer: beta.toFixed(1),
        tolerance: relTolerance(beta),
        solutionSteps: [
            { text: 'Gegeben', math: `${sA} = ${round(a, 2)}\\,\\text{cm}, \\quad ${sB} = ${b}\\,\\text{cm}, \\quad ${sC} = ${c}\\,\\text{cm}` },
            { text: `Kosinussatz nach cos(${angleB}) umstellen`, math: `\\cos(${angleB}) = \\dfrac{${sA}^2 + ${sC}^2 - ${sB}^2}{2 \\cdot ${sA} \\cdot ${sC}}` },
            {
                text: 'Werte einsetzen',
                math: `\\cos(${angleB}) = \\dfrac{${round(a, 2)}^2 + ${c}^2 - ${b}^2}{2 \\cdot ${round(a, 2)} \\cdot ${c}} = ${cosBeta.toFixed(4)}`
            },
            { text: 'Umkehrfunktion verwenden', math: `${angleB} = \\cos^{-1}(${cosBeta.toFixed(4)}) \\approx ${beta.toFixed(1)}^\\circ` }
        ],
        sketch: {
            kind: 'general',
            b,
            c,
            alpha,
            highlightKey: 'beta',
            points: scheme.points,
            labels: generalLabels
        }
    };
};

// 8) Flächensatz
const buildFlaechensatzTask = (): NumericTask => {
    const scheme = pickLetterScheme();
    const [sA, sB, sC] = scheme.sides;
    const [angleA, angleB, angleC] = scheme.angles;
    const a = round(randomInRange(4, 12), 2);
    const b = round(randomInRange(4, 12), 2);
    const gamma = round(randomInRange(20, 150), 1);
    const area = 0.5 * a * b * Math.sin(degToRad(gamma));

    return {
        id: nextId(),
        kind: 'numeric',
        topic: 'Flächensatz',
        prompt: `Ein Dreieck hat die Seiten ${sA} = ${a} cm und ${sB} = ${b} cm mit dem eingeschlossenen Winkel ${angleC} = ${gamma}°. Berechne den Flächeninhalt des Dreiecks.`,
        unit: 'cm²',
        correctAnswer: round(area, 2).toFixed(2),
        tolerance: relTolerance(area),
        solutionSteps: [
            { text: 'Gegeben', math: `${sA} = ${a}\\,\\text{cm}, \\quad ${sB} = ${b}\\,\\text{cm}, \\quad ${angleC} = ${gamma}^\\circ` },
            { text: 'Flächenformel aufschreiben', math: `A = \\dfrac{1}{2} \\cdot ${sA} \\cdot ${sB} \\cdot \\sin(${angleC})` },
            { text: 'Werte einsetzen', math: `A = 0{,}5 \\cdot ${a} \\cdot ${b} \\cdot \\sin(${gamma}^\\circ)` },
            { text: 'Ergebnis', math: `A \\approx ${round(area, 2)}\\,\\text{cm}^2` }
        ],
        sketch: {
            kind: 'general',
            b: a,
            c: b,
            alpha: gamma,
            highlightKey: 'none',
            askedLabel: 'Fläche = ?',
            // Punktnamen passend zur Rollen-Umlegung: Der Scheitel des gegebenen
            // Winkels (interne alpha-Position) trägt angleC und muss daher den
            // dritten Punktnamen bekommen (zu Winkel γ gehört Punkt C usw.).
            points: [scheme.points[2], scheme.points[0], scheme.points[1]],
            // Interne Rollen entsprechen hier nicht 1:1 den Aufgaben-Buchstaben
            // (die Skizze zeichnet den Winkel γ als "internes α" zwischen den
            // Seiten a/b) - daher werden die Anzeige-Buchstaben explizit umgelegt.
            labels: { a: sC, b: sA, c: sB, alpha: angleC, beta: angleA, gamma: angleB }
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
    helpUsed: HelpUsage;
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
    helpUsed: 'none'
});

// Loggt eine Karte, die Versuche hatte, aber nie gelöst wurde (z. B. vor dem Neu-Generieren).
const flushUnsolvedCard = (card: CardState) => {
    if (card.attempts > 0 && card.feedbackType !== 'correct') {
        logTrackingEntry({
            topic: card.task.topic,
            attempts: card.attempts,
            firstTryCorrect: false,
            solved: false,
            helpUsed: card.helpUsed
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
                if (!next) return { ...card, showSolution: next };
                // Vor dem ersten Versuch angeschaut -> Musterlösung direkt übernommen.
                // Erst nach einem falschen Versuch angeschaut -> als Tipp genutzt.
                const helpUsed: HelpUsage =
                    card.attempts === 0 ? 'solution' : card.helpUsed === 'none' ? 'hint' : card.helpUsed;
                return { ...card, showSolution: next, helpUsed };
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
                logTrackingEntry({ topic: task.topic, attempts, firstTryCorrect: attempts === 1, solved: true, helpUsed: card.helpUsed });
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
                logTrackingEntry({ topic: task.topic, attempts, firstTryCorrect: attempts === 1, solved: true, helpUsed: card.helpUsed });
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
            logTrackingEntry({ topic: task.topic, attempts, firstTryCorrect: attempts === 1, solved: true, helpUsed: card.helpUsed });
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
                            <div className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                                <div className="bg-white rounded-lg border border-slate-200 p-3">
                                    <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-700">
                                        {task.solutionSteps.map((step, i) => (
                                            <li key={i} className="space-y-1">
                                                <p className="font-medium text-gray-800">{step.text}</p>
                                                {step.math && (
                                                    <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 inline-block">
                                                        <InlineMath math={step.math} />
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {task.kind === 'beschriften' && (
                <div className="grid gap-5 md:grid-cols-[1.4fr,1fr]">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 h-[340px] sm:h-[380px]">
                        <LabelTriangleSketch triangle={task.triangle} />
                    </div>
                    <div className="space-y-3">
                        <p className="text-slate-800 leading-relaxed">
                            Vom Winkel {task.triangle.markedAngleSymbol} aus betrachtet: Ordne Hypotenuse, Gegenkathete und
                            Ankathete den richtigen Seiten zu.
                        </p>
                        {(['hypotenuse', 'opposite', 'adjacent'] as const).map(target => (
                            <label key={target} className="block space-y-1">
                                <span className="text-sm font-semibold text-slate-700">
                                    {target === 'hypotenuse'
                                        ? 'Hypotenuse'
                                        : target === 'opposite'
                                        ? `Gegenkathete von ${task.triangle.markedAngleSymbol}`
                                        : `Ankathete von ${task.triangle.markedAngleSymbol}`}
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
                        <LabelTriangleSketch triangle={task.triangle} />
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
                                    {task.triangle.markedAngleSymbol})?
                                </>
                            ) : (
                                <>
                                    Welche Funktion beschreibt den Bruch{' '}
                                    <InlineMath math={`\\dfrac{${task.askedRatioLabel![0]}}{${task.askedRatioLabel![1]}}`} /> in Bezug
                                    auf {task.triangle.markedAngleSymbol}?
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
