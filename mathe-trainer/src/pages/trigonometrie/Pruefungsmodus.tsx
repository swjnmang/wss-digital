import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';

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

interface ExamTask {
    id: number;
    topic: string;
    prompt: string;
    unit: string;
    correctAnswer: string;
    isText: boolean;
    tolerance: number;
    sketch: SketchSpec;
    solutionSteps: string[];
}

const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomInRange(min, max + 1));
const round = (val: number, digits = 2) => parseFloat(val.toFixed(digits));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
// Maximal 1% relative Toleranz beim Runden, mit kleiner Mindesttoleranz für sehr kleine Werte
const relTolerance = (value: number, min = 0.01) => Math.max(Math.abs(value) * 0.01, min);

let idCounter = 0;
const nextId = () => {
    idCounter += 1;
    return idCounter;
};

// ---------- Skizzen ----------

const GIVEN_COLOR = '#1f2937';
const HIGHLIGHT_COLOR = '#dc2626';

const RightTriangleSketch: React.FC<{ spec: RightSketchSpec }> = ({ spec }) => {
    const { horizontal, vertical, horizontalLabel, verticalLabel, hypotenuseLabel, angleLabel, highlight, askedLabel } = spec;
    const width = 360;
    const height = 230;
    const margin = 44;
    const rightLabelSpace = 90;
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

            <text x={(Ax + Bx) / 2} y={Ay + 20} textAnchor="middle" fontSize="13" fill={colorFor('horizontal')}>
                {horizontalLabel}
            </text>
            <text x={Bx + 10} y={(By + Cy) / 2} fontSize="13" fill={colorFor('vertical')}>
                {verticalLabel}
            </text>
            <text x={(Ax + Cx) / 2 - 8} y={(Ay + Cy) / 2 - 5} fontSize="13" fill={colorFor('hypotenuse')} textAnchor="end">
                {hypotenuseLabel}
            </text>
            <text x={Ax + 26} y={Ay - 8} fontSize="14" fontWeight="bold" fill={colorFor('angle')}>
                {angleLabel}
            </text>
            {askedLabel && (
                <text x={width - 14} y={26} textAnchor="end" fontSize="14" fontWeight="bold" fill={HIGHLIGHT_COLOR}>
                    {askedLabel}
                </text>
            )}
        </svg>
    );
};

const GeneralTriangleSketch: React.FC<{ spec: GeneralSketchSpec }> = ({ spec }) => {
    const { a, b, c, alpha, givenKeys, highlightKey, askedLabel } = spec;
    const width = 360;
    const height = 230;
    const margin = 52;

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
            <text x={A.x - 12} y={A.y + 16} fontSize="13" fontWeight="bold">A</text>
            <text x={B.x + 8} y={B.y + 16} fontSize="13" fontWeight="bold">B</text>
            <text x={C.x} y={C.y - 10} fontSize="13" fontWeight="bold" textAnchor="middle">C</text>

            <text x={labelC_.x} y={labelC_.y} textAnchor="middle" fontSize="13" fill={colorFor('c')}>
                {sideLabel('c', c)}
            </text>
            <text x={labelB_.x} y={labelB_.y} textAnchor="middle" fontSize="13" fill={colorFor('b')}>
                {sideLabel('b', b)}
            </text>
            <text x={labelA_.x} y={labelA_.y} textAnchor="middle" fontSize="13" fill={colorFor('a')}>
                {sideLabel('a', a)}
            </text>

            <text x={A.x + 14} y={A.y - 10} fontSize="13" fontWeight="bold" fill={colorFor('alpha')}>
                {angleLabel('alpha', 'α', alpha)}
            </text>

            {(() => {
                const cornerLabel =
                    askedLabel ?? (highlightKey === 'beta' ? 'β = ?' : highlightKey === 'gamma' ? 'γ = ?' : undefined);
                return (
                    cornerLabel && (
                        <text x={width - 14} y={24} textAnchor="end" fontSize="14" fontWeight="bold" fill={HIGHLIGHT_COLOR}>
                            {cornerLabel}
                        </text>
                    )
                );
            })()}
        </svg>
    );
};

const TaskSketch: React.FC<{ sketch: SketchSpec }> = ({ sketch }) =>
    sketch.kind === 'right' ? <RightTriangleSketch spec={sketch} /> : <GeneralTriangleSketch spec={sketch} />;

// ---------- Aufgaben-Generatoren ----------

// 1) Rechtwinkliges Dreieck: fehlende Seite mit Sinus/Kosinus berechnen
const buildRightTriangleSideTask = (): ExamTask => {
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
        topic: 'Rechtwinkliges Dreieck',
        prompt: askOpposite
            ? `In einem rechtwinkligen Dreieck ist die Hypotenuse c = ${hyp} cm und der Winkel α = ${alpha}°. Berechne die Gegenkathete a von α.`
            : `In einem rechtwinkligen Dreieck ist die Hypotenuse c = ${hyp} cm und der Winkel α = ${alpha}°. Berechne die Ankathete b von α.`,
        unit: 'cm',
        correctAnswer: (askOpposite ? opposite : adjacent).toFixed(2),
        isText: false,
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

// 2) Rechtwinkliges Dreieck: fehlenden Winkel berechnen
const buildRightTriangleAngleTask = (): ExamTask => {
    const adjacent = round(randomInRange(4, 12), 2);
    const opposite = round(randomInRange(4, 12), 2);
    const angle = radToDeg(Math.atan(opposite / adjacent));

    return {
        id: nextId(),
        topic: 'Rechtwinkliges Dreieck',
        prompt: `In einem rechtwinkligen Dreieck sind die Ankathete b = ${adjacent} cm und die Gegenkathete a = ${opposite} cm eines Winkels α bekannt. Berechne α.`,
        unit: '°',
        correctAnswer: angle.toFixed(1),
        isText: false,
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

// 3) Steigungswinkel: Grad <-> Prozent
const buildSteigungTask = (): ExamTask => {
    const askPercent = Math.random() < 0.5;
    if (askPercent) {
        const angle = round(randomInRange(5, 35), 1);
        const percent = Math.tan(degToRad(angle)) * 100;
        return {
            id: nextId(),
            topic: 'Steigungswinkel',
            prompt: `Eine Straße hat einen Steigungswinkel von α = ${angle}°. Berechne die Steigung in Prozent.`,
            unit: '%',
            correctAnswer: percent.toFixed(1),
            isText: false,
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
        topic: 'Steigungswinkel',
        prompt: `Eine Straße hat eine Steigung von ${percent} %. Berechne den Steigungswinkel α.`,
        unit: '°',
        correctAnswer: angle.toFixed(1),
        isText: false,
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

// 4) Sinussatz
const buildSinussatzTask = (): ExamTask => {
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
            topic: 'Sinussatz',
            prompt: `In einem Dreieck sind a = ${a} cm, α = ${alpha}° und β = ${beta}° gegeben. Berechne die Seite b mit dem Sinussatz.`,
            unit: 'cm',
            correctAnswer: round(b, 2).toFixed(2),
            isText: false,
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
        topic: 'Sinussatz',
        prompt: `In einem Dreieck sind a = ${a} cm, b = ${round(b, 2)} cm und α = ${alpha}° gegeben. Berechne den Winkel β mit dem Sinussatz.`,
        unit: '°',
        correctAnswer: beta.toFixed(1),
        isText: false,
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

// 5) Kosinussatz
const buildKosinussatzTask = (): ExamTask => {
    const b = round(randomInRange(5, 12), 2);
    const c = round(randomInRange(5, 12), 2);
    const alpha = round(randomInRange(35, 110), 1);
    const aSquared = b * b + c * c - 2 * b * c * Math.cos(degToRad(alpha));
    const a = Math.sqrt(Math.max(aSquared, 0));

    const askSide = Math.random() < 0.5;
    if (askSide) {
        return {
            id: nextId(),
            topic: 'Kosinussatz',
            prompt: `In einem Dreieck sind b = ${b} cm, c = ${c} cm und der eingeschlossene Winkel α = ${alpha}° gegeben. Berechne die Seite a mit dem Kosinussatz.`,
            unit: 'cm',
            correctAnswer: round(a, 2).toFixed(2),
            isText: false,
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
        topic: 'Kosinussatz',
        prompt: `In einem Dreieck sind a = ${round(a, 2)} cm, b = ${b} cm und c = ${c} cm gegeben. Berechne den Winkel β mit dem Kosinussatz.`,
        unit: '°',
        correctAnswer: beta.toFixed(1),
        isText: false,
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

// 6) Flächensatz
const buildFlaechensatzTask = (): ExamTask => {
    const a = round(randomInRange(4, 12), 2);
    const b = round(randomInRange(4, 12), 2);
    const gamma = round(randomInRange(20, 150), 1);
    const area = 0.5 * a * b * Math.sin(degToRad(gamma));

    return {
        id: nextId(),
        topic: 'Flächensatz',
        prompt: `Ein Dreieck hat die Seiten a = ${a} cm und b = ${b} cm mit dem eingeschlossenen Winkel γ = ${gamma}°. Berechne den Flächeninhalt des Dreiecks.`,
        unit: 'cm²',
        correctAnswer: round(area, 2).toFixed(2),
        isText: false,
        tolerance: relTolerance(area),
        solutionSteps: [
            `Gegeben: a = ${a} cm, b = ${b} cm, γ = ${gamma}°.`,
            'Flächenformel: A = ½ · a · b · sin(γ).',
            `A = 0,5 · ${a} · ${b} · sin(${gamma}°)`,
            `A ≈ ${round(area, 2)} cm²`
        ],
        sketch: {
            kind: 'general',
            // Für die Skizze wird der gegebene Winkel γ als Winkel "alpha" am Zeichenpunkt A
            // verwendet, eingeschlossen von den Seiten a und b (= b und c im Zeichen-Dreieck).
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

const TASK_BUILDERS: (() => ExamTask)[] = [
    buildRightTriangleSideTask,
    buildRightTriangleAngleTask,
    buildSteigungTask,
    buildSinussatzTask,
    buildKosinussatzTask,
    buildFlaechensatzTask
];

const buildExam = (): ExamTask[] => {
    const shuffledBuilders = [...TASK_BUILDERS].sort(() => Math.random() - 0.5);
    const tasks: ExamTask[] = [];

    shuffledBuilders.forEach(builder => tasks.push(builder()));
    while (tasks.length < 10) {
        tasks.push(pick(TASK_BUILDERS)());
    }

    return tasks.slice(0, 10).sort(() => Math.random() - 0.5);
};

type Stage = 'form' | 'exam' | 'result';

const Pruefungsmodus: React.FC = () => {
    const [stage, setStage] = useState<Stage>('form');
    const [vorname, setVorname] = useState('');
    const [nachname, setNachname] = useState('');
    const [klasse, setKlasse] = useState('');
    const [tasks, setTasks] = useState<ExamTask[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    const canStart = vorname.trim() !== '' && nachname.trim() !== '' && klasse.trim() !== '';

    const startExam = () => {
        if (!canStart) return;
        setTasks(buildExam());
        setAnswers({});
        setStage('exam');
    };

    const isTaskCorrect = (task: ExamTask) => {
        const given = (answers[task.id] || '').trim();
        if (!given) return false;
        if (task.isText) {
            return given.toLowerCase() === task.correctAnswer.toLowerCase();
        }
        const value = parseFloat(given.replace(',', '.'));
        if (isNaN(value)) return false;
        const target = parseFloat(task.correctAnswer);
        return Math.abs(value - target) <= task.tolerance;
    };

    const score = tasks.filter(isTaskCorrect).length;
    const percentage = tasks.length > 0 ? Math.round((score / tasks.length) * 100) : 0;
    const allAnswered = tasks.every(t => (answers[t.id] || '').trim() !== '');

    const restart = () => {
        setStage('form');
        setVorname('');
        setNachname('');
        setKlasse('');
        setTasks([]);
        setAnswers({});
    };

    const newExamSamePerson = () => {
        setTasks(buildExam());
        setAnswers({});
        setStage('exam');
    };

    const sanitizeForPdf = (text: string) =>
        text
            .replace(/α/g, 'alpha')
            .replace(/β/g, 'beta')
            .replace(/γ/g, 'gamma')
            .replace(/⁻¹/g, '^-1')
            .replace(/·/g, '*')
            .replace(/≈/g, 'ca.')
            .replace(/½/g, '1/2')
            .replace(/–/g, '-');

    const downloadPdf = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const textWidth = pageWidth - 2 * margin;
        let y = margin;

        const ensureSpace = (needed: number) => {
            if (y + needed > pageHeight - 15) {
                doc.addPage();
                y = margin;
            }
        };

        const writeLines = (text: string, x: number, fontSize: number, lineHeight: number, options?: { bold?: boolean }) => {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(sanitizeForPdf(text), textWidth - (x - margin));
            lines.forEach((line: string) => {
                ensureSpace(lineHeight);
                doc.text(line, x, y);
                y += lineHeight;
            });
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('Prüfungsergebnis Trigonometrie', pageWidth / 2, y, { align: 'center' });
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Mathe-Trainer | WSS-Digital', pageWidth / 2, y, { align: 'center' });
        y += 8;
        doc.setDrawColor(120, 120, 120);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        writeLines(`Name: ${vorname} ${nachname}`, margin, 11, 6);
        writeLines(`Klasse: ${klasse}`, margin, 11, 6);
        writeLines(`Datum: ${new Date().toLocaleDateString('de-DE')}`, margin, 11, 6);
        y += 2;

        writeLines(`Ergebnis: ${score} von ${tasks.length} Aufgaben richtig (${percentage} %)`, margin, 13, 7, { bold: true });
        y += 4;

        tasks.forEach((task, index) => {
            const correct = isTaskCorrect(task);
            const given = (answers[task.id] || '—').trim() || '—';

            ensureSpace(14);
            writeLines(
                `Aufgabe ${index + 1} (${task.topic}) – ${correct ? 'richtig' : 'falsch'}`,
                margin,
                12,
                6.5,
                { bold: true }
            );
            writeLines(task.prompt, margin, 10, 5);
            writeLines(`Deine Antwort: ${given}${!task.isText && given !== '—' ? ` ${task.unit}` : ''}`, margin, 10, 5);
            writeLines(`Richtige Antwort: ${task.correctAnswer}${!task.isText ? ` ${task.unit}` : ''}`, margin, 10, 5);

            ensureSpace(6);
            writeLines('Musterlösung:', margin, 10, 5, { bold: true });
            task.solutionSteps.forEach(step => {
                writeLines(`• ${step}`, margin + 4, 9.5, 4.6);
            });
            y += 4;
        });

        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.text(`Seite ${i} von ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        }

        const safeName = `${vorname}_${nachname}`.replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, '_');
        doc.save(`Pruefung_Trigonometrie_${safeName}.pdf`);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-teal-800 mb-2">Prüfungsmodus Trigonometrie</h1>
                    <p className="text-gray-700 max-w-2xl mx-auto">
                        Zehn vermischte Aufgaben aus der Trigonometrie. Während der Prüfung gibt es keine Lösungswege –
                        die Auswertung mit Musterlösung erhältst du am Ende als PDF.
                    </p>
                </div>

                {stage === 'form' && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 max-w-md mx-auto space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 text-center mb-2">Angaben zur Person</h2>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={vorname}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVorname(e.target.value)}
                                placeholder="Vorname"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                value={nachname}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNachname(e.target.value)}
                                placeholder="Nachname"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                value={klasse}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKlasse(e.target.value)}
                                placeholder="Klasse"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={startExam}
                                disabled={!canStart}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Prüfung starten
                            </button>
                        </div>
                    </div>
                )}

                {stage === 'exam' && (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center text-sm text-indigo-900">
                            {vorname} {nachname} · Klasse {klasse}
                        </div>

                        {tasks.map((task, index) => (
                            <div key={task.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 mb-2">
                                    Aufgabe {index + 1} von {tasks.length} · {task.topic}
                                </p>
                                <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 h-[200px]">
                                    <TaskSketch sketch={task.sketch} />
                                </div>
                                <p className="font-medium text-gray-800 mb-3">{task.prompt}</p>
                                <div className="flex items-center justify-center gap-2">
                                    <input
                                        type="text"
                                        value={answers[task.id] || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setAnswers(prev => ({ ...prev, [task.id]: e.target.value }))
                                        }
                                        placeholder={task.isText ? 'positiv / negativ' : 'Deine Lösung'}
                                        className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2 text-center"
                                    />
                                    <span className="text-gray-600 w-10">{task.unit}</span>
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col items-center gap-2 pt-2">
                            {!allAnswered && (
                                <p className="text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm text-center max-w-md">
                                    Bitte beantworte alle {tasks.length} Aufgaben, bevor du die Prüfung abgibst.
                                </p>
                            )}
                            <button
                                onClick={() => setStage('result')}
                                disabled={!allAnswered}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Prüfung abgeben
                            </button>
                        </div>
                    </div>
                )}

                {stage === 'result' && (
                    <div className="space-y-4">
                        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 text-center">
                            <p className="text-lg font-semibold text-teal-900">
                                {vorname} {nachname} · Klasse {klasse}
                            </p>
                            <p className="text-3xl font-bold text-teal-800 mt-2">
                                {score} / {tasks.length} richtig ({percentage} %)
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={downloadPdf}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                            >
                                📄 Auswertung als PDF herunterladen
                            </button>
                        </div>

                        {tasks.map((task, index) => {
                            const correct = isTaskCorrect(task);
                            const given = answers[task.id] || '—';
                            return (
                                <div
                                    key={task.id}
                                    className={`rounded-xl p-5 border ${
                                        correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                    }`}
                                >
                                    <p className="text-xs font-semibold text-gray-500 mb-1">
                                        Aufgabe {index + 1} · {task.topic} · {correct ? '✓ richtig' : '✗ falsch'}
                                    </p>
                                    <p className="font-medium text-gray-800 mb-2">{task.prompt}</p>
                                    <p className="text-sm text-gray-700">
                                        Deine Antwort: <strong>{given}{!task.isText && given !== '—' ? ` ${task.unit}` : ''}</strong>
                                    </p>
                                    {!correct && (
                                        <p className="text-sm text-gray-700">
                                            Richtige Antwort: <strong>{task.correctAnswer}{!task.isText ? ` ${task.unit}` : ''}</strong>
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex justify-center flex-wrap gap-4 pt-2">
                            <button
                                onClick={newExamSamePerson}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                            >
                                Neue Prüfung (gleiche Person)
                            </button>
                            <button
                                onClick={restart}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                            >
                                Zurück zur Eingabe
                            </button>
                        </div>
                    </div>
                )}

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

export default Pruefungsmodus;
