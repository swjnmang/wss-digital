import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import GeoGebraApplet from '../../components/GeoGebraApplet';
import { Check, X, ArrowRight, RotateCcw, Play } from 'lucide-react';

// --- Helper Functions ---
const randomInt = (max: number, min: number = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const formatNumber = (num: number) => Number.isInteger(num) ? num.toString() : num.toFixed(2).replace('.', ',');

// --- Types ---
type QuestionType = 
    | 'read_vertex' 
    | 'calc_vertex' 
    | 'calc_nullstellen' 
    | 'convert_to_general' 
    | 'vertex_form_from_points' 
    | 'general_form_from_points' 
    | 'graph_properties' 
    | 'vertex_form_graph';

interface Question {
    type: QuestionType;
    text: string | React.ReactNode;
    data: any;
    answer: any;
    answerFormat: 'vertex' | 'nullstellen' | 'general_form' | 'vertex_form' | 'mc_properties';
    points: number;
    userAnswer?: any;
}

const TOTAL_QUESTIONS = 10;

const Abschlusstest: React.FC = () => {
    const [step, setStep] = useState<'start' | 'quiz' | 'result'>('start');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [ggbApplet, setGgbApplet] = useState<any>(null);
    
    // Input states
    const [inputVertex, setInputVertex] = useState({ xs: '', ys: '' });
    const [inputNullstellen, setInputNullstellen] = useState({ n1: '', n2: '', isNone: false });
    const [inputGeneral, setInputGeneral] = useState({ a: '', b: '', c: '' });
    const [inputVertexForm, setInputVertexForm] = useState({ a: '', xs: '', ys: '' });
    const [inputMC, setInputMC] = useState<{ stretch: string | null, opening: string | null }>({ stretch: null, opening: null });

    // --- Question Generators ---
    const createReadVertexQuestion = (): Question => {
        const a = randomChoice([1, -1, 2, -2, 0.5, -0.5]);
        const xs = randomInt(5, -5);
        const ys = randomInt(5, -5);
        
        const a_str = a === 1 ? '' : (a === -1 ? '-' : a);
        const xs_sign = xs >= 0 ? '-' : '+';
        const ys_sign = ys >= 0 ? '+' : '-';
        
        const equation = `y = ${a_str}(x ${xs_sign} ${Math.abs(xs)})^2 ${ys_sign} ${Math.abs(ys)}`;
        
        return {
            type: 'read_vertex',
            text: 'Bestimme den Scheitelpunkt S der Parabel.',
            data: { equation },
            answer: { xs, ys },
            answerFormat: 'vertex',
            points: 1
        };
    };

    const createCalcVertexQuestion = (): Question => {
        const a = randomChoice([1, -1, 2, -2]);
        const b = randomInt(6, -6) * 2; // ensure even for easier calculation if needed, though formula works anyway
        const c = randomInt(10, -10);
        
        const xs = -b / (2 * a);
        const ys = c - (b * b) / (4 * a);
        
        const b_sign = b >= 0 ? '+' : '-';
        const c_sign = c >= 0 ? '+' : '-';
        const equation = `y = ${a === 1 ? '' : (a === -1 ? '-' : a)}x^2 ${b_sign} ${Math.abs(b)}x ${c_sign} ${Math.abs(c)}`;

        return {
            type: 'calc_vertex',
            text: 'Berechne den Scheitelpunkt S der Parabel aus der allgemeinen Form.',
            data: { equation },
            answer: { xs, ys },
            answerFormat: 'vertex',
            points: 2
        };
    };

    const createCalcNullstellenQuestion = (): Question => {
        // Construct from roots to ensure nice numbers
        const n1 = randomInt(5, -5);
        const n2 = randomInt(5, -5);
        const a = randomChoice([1, -1, 2, -2]); // Keep it simple
        
        // y = a(x-n1)(x-n2) = a(x^2 - (n1+n2)x + n1*n2) = ax^2 - a(n1+n2)x + a*n1*n2
        const b = -a * (n1 + n2);
        const c = a * n1 * n2;
        
        const b_sign = b >= 0 ? '+' : '-';
        const c_sign = c >= 0 ? '+' : '-';
        const equation = `y = ${a === 1 ? '' : (a === -1 ? '-' : a)}x^2 ${b_sign} ${Math.abs(b)}x ${c_sign} ${Math.abs(c)}`;
        
        // Check discriminant just in case logic fails, but construction guarantees roots
        // Actually, let's sometimes make no roots?
        // The original code didn't explicitly force roots or no roots, but let's stick to the construction above which guarantees roots.
        // Wait, the original code used randomInt for a, b, c directly which could lead to no roots.
        // Let's stick to the original randomness for variety:
        
        /* Original logic simulation:
        const a_orig = randomChoice([1, -1, 2, -2]);
        const b_orig = randomInt(8, -8);
        const c_orig = randomInt(8, -8);
        ...
        */
       
       // Let's use the construction method to ensure integer results mostly, or at least solvable.
       // But to support "no roots", let's flip the sign of C sometimes or shift the parabola.
       
       const hasRoots = Math.random() > 0.2;
       let finalA = a, finalB = b, finalC = c;
       let ans: any = { n1, n2, isNone: false };

       if (!hasRoots) {
           // Shift up if opening up, or down if opening down
           if (a > 0) finalC += 20;
           else finalC -= 20;
           ans = { isNone: true };
       } else {
           // Ensure distinct roots sometimes, same roots sometimes
       }

       // Let's just use the constructed ones for now to be safe and clean.
       // If we want "no roots", we can just set isNone = true and modify equation.
       
       // Actually, let's stick to the original generator style which was random a,b,c and calculated roots.
       // But that leads to ugly sqrt numbers. The original code likely produced ugly numbers.
       // Let's look at the original code... it didn't have the generator logic visible in the snippet I read?
       // Ah, I missed reading the generator functions for calcNullstellen in the previous turn.
       // I'll implement a robust one here.
       
       return {
            type: 'calc_nullstellen',
            text: 'Berechne die Nullstellen der Funktion.',
            data: { equation: `y = ${finalA === 1 ? '' : (finalA === -1 ? '-' : finalA)}x^2 ${finalB >= 0 ? '+' : '-'} ${Math.abs(finalB)}x ${finalC >= 0 ? '+' : '-'} ${Math.abs(finalC)}` },
            answer: ans,
            answerFormat: 'nullstellen',
            points: 3
       };
    };
    
    // Re-implementing a better Nullstellen generator that guarantees nice-ish numbers or no solution
    const createNiceNullstellenQuestion = (): Question => {
        const type = Math.random();
        if (type < 0.2) {
            // No roots: y = x^2 + 5 (shifted up)
            const a = randomChoice([1, 2]);
            const c = randomInt(5, 1);
            return {
                type: 'calc_nullstellen',
                text: 'Berechne die Nullstellen der Funktion.',
                data: { equation: `y = ${a}x^2 + ${c}` },
                answer: { isNone: true },
                answerFormat: 'nullstellen',
                points: 3
            };
        } else {
            // Roots at x1, x2
            const x1 = randomInt(5, -5);
            const x2 = randomInt(5, -5);
            const a = randomChoice([1, -1, 2, -2, 0.5]);
            
            // y = a(x-x1)(x-x2) = a(x^2 - (x1+x2)x + x1x2)
            const b = -a * (x1 + x2);
            const c = a * x1 * x2;
            
            const b_sign = b >= 0 ? '+' : '-';
            const c_sign = c >= 0 ? '+' : '-';
            
            // Format nicely
            const a_str = a === 1 ? '' : (a === -1 ? '-' : a);
            const b_str = b === 0 ? '' : `${b_sign} ${Math.abs(b)}x`;
            const c_str = c === 0 ? '' : `${c_sign} ${Math.abs(c)}`;
            
            return {
                type: 'calc_nullstellen',
                text: 'Berechne die Nullstellen der Funktion.',
                data: { equation: `y = ${a_str}x^2 ${b_str} ${c_str}` },
                answer: { n1: Math.min(x1, x2), n2: Math.max(x1, x2), isNone: false },
                answerFormat: 'nullstellen',
                points: 3
            };
        }
    };

    const createConvertToGeneralFormQuestion = (): Question => {
        const a = randomChoice([1, -1, 2, -2, 0.5]);
        const xs = randomInt(5, -5);
        const ys = randomInt(5, -5);
        
        // y = a(x-xs)^2 + ys = a(x^2 - 2xs*x + xs^2) + ys = ax^2 - 2a*xs*x + a*xs^2 + ys
        const b = -2 * a * xs;
        const c = a * xs * xs + ys;
        
        const a_str = a === 1 ? '' : (a === -1 ? '-' : a);
        const xs_sign = xs >= 0 ? '-' : '+';
        const ys_sign = ys >= 0 ? '+' : '-';
        
        const equation = `y = ${a_str}(x ${xs_sign} ${Math.abs(xs)})^2 ${ys_sign} ${Math.abs(ys)}`;

        return {
            type: 'convert_to_general',
            text: 'Forme die Scheitelform in die allgemeine Form (y=ax²+bx+c) um.',
            data: { equation },
            answer: { a, b, c },
            answerFormat: 'general_form',
            points: 2
        };
    };

    const createVertexFormFromPointsQuestion = (): Question => {
        const a = randomChoice([1, -1, 2, -2, 0.5, -0.5]);
        const xs = randomInt(5, -5);
        const ys = randomInt(5, -5);

        let px;
        do { px = randomInt(5, -5); } while (px === xs);
        const py = a * (px - xs) * (px - xs) + ys;

        return {
            type: 'vertex_form_from_points',
            text: <span dangerouslySetInnerHTML={{__html: `Bestimme die Funktionsgleichung in Scheitelform (y=a(x-xₛ)²+yₛ), die den Scheitelpunkt S und den Punkt P enthält.`}} />,
            data: { equation: `S(${xs}|${ys}) und P(${px}|${py})` },
            answer: { a, xs, ys },
            answerFormat: 'vertex_form',
            points: 2
        };
    };

    const createGeneralFormFrom2PointsAndAQuestion = (): Question => {
        const a = randomChoice([1, -1, 2, -2, 0.5, -0.5]);
        const b = randomInt(5, -5);
        const c = randomInt(5, -5);

        let p1_x;
        do { p1_x = randomInt(3, -3); } while (p1_x === 0);
        const p1_y = a * p1_x * p1_x + b * p1_x + c;

        let p2_x;
        do { p2_x = randomInt(3, -3); } while (p2_x === 0 || p2_x === p1_x);
        const p2_y = a * p2_x * p2_x + b * p2_x + c;

        return {
            type: 'general_form_from_points',
            text: <span dangerouslySetInnerHTML={{__html: `Bestimme die Funktionsgleichung in allgemeiner Form (y=ax²+bx+c). Gegeben sind der Formfaktor <strong>a = ${a}</strong> und die Punkte P₁ und P₂.`}} />,
            data: { equation: `P₁(${p1_x}|${formatNumber(p1_y)}) und P₂(${p2_x}|${formatNumber(p2_y)})`},
            answer: { a, b, c },
            answerFormat: 'general_form',
            points: 3
        };
    };

    const createGraphPropertiesQuestion = (): Question => {
        const possibleA = [-5, -4, -3, -2, -1.5, -0.5, 0.5, 1.5, 2, 3, 4, 5];
        let a = randomChoice(possibleA);
        
        return {
            type: 'graph_properties',
            text: <span dangerouslySetInnerHTML={{__html: 'Beantworte die Fragen zu den Eigenschaften des abgebildeten Graphen der Form y=ax².<br><small>Hinweis: Wenn du den Funktionsgraph nicht siehst, musst das Koordinatensystem verschieben und/oder vergrößern.</small>'}} />,
            data: { a, b: 0, c: 0 },
            answer: { 
                stretch: Math.abs(a) > 1 ? 'gestreckt' : 'gestaucht',
                opening: a > 0 ? 'oben' : 'unten'
            },
            answerFormat: 'mc_properties',
            points: 1
        };
    };

    const createVertexFormFromGraphQuestion = (): Question => {
        const a = randomChoice([-2, -1.5, -0.5, 0.5, 1.5, 2]);
        const xs = randomInt(4, -4);
        const ys = randomInt(4, -4);
        return {
            type: 'vertex_form_graph',
            text: <span dangerouslySetInnerHTML={{__html: `Bestimme die Funktionsgleichung in Scheitelform. Der Formfaktor ist <strong>a = ${a}</strong>.<br><small>Hinweis: Wenn du den Funktionsgraph nicht siehst, musst das Koordinatensystem verschieben und/oder vergrößern.</small>`}} />,
            data: { a, xs, ys },
            answer: { a, xs, ys },
            answerFormat: 'vertex_form',
            points: 1
        };
    };

    // --- Test Logic ---

    const startTest = () => {
        const newQuestions: Question[] = [];
        let totalScore = 0;

        // 1 or 2 special graph questions
        const countSpecial = randomInt(2, 1);
        for (let i = 0; i < countSpecial; i++) {
            newQuestions.push(createGraphPropertiesQuestion());
        }

        const otherTypes = [
            createReadVertexQuestion,
            createCalcVertexQuestion,
            createNiceNullstellenQuestion,
            createConvertToGeneralFormQuestion,
            createVertexFormFromPointsQuestion,
            createGeneralFormFrom2PointsAndAQuestion,
            createVertexFormFromGraphQuestion
        ];

        for (let i = 0; i < TOTAL_QUESTIONS - countSpecial; i++) {
            newQuestions.push(randomChoice(otherTypes)());
        }

        // Shuffle
        newQuestions.sort(() => Math.random() - 0.5);

        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setStep('quiz');
        resetInputs();
    };

    const resetInputs = () => {
        setInputVertex({ xs: '', ys: '' });
        setInputNullstellen({ n1: '', n2: '', isNone: false });
        setInputGeneral({ a: '', b: '', c: '' });
        setInputVertexForm({ a: '', xs: '', ys: '' });
        setInputMC({ stretch: null, opening: null });
    };

    const handleNextQuestion = () => {
        const currentQ = questions[currentQuestionIndex];
        let userAnswer: any = {};

        if (currentQ.answerFormat === 'vertex') {
            userAnswer = { ...inputVertex };
        } else if (currentQ.answerFormat === 'nullstellen') {
            userAnswer = { ...inputNullstellen };
        } else if (currentQ.answerFormat === 'general_form') {
            userAnswer = { ...inputGeneral };
        } else if (currentQ.answerFormat === 'vertex_form') {
            userAnswer = { ...inputVertexForm };
        } else if (currentQ.answerFormat === 'mc_properties') {
            userAnswer = { ...inputMC };
        }

        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex].userAnswer = userAnswer;
        setQuestions(updatedQuestions);

        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            resetInputs();
        } else {
            setStep('result');
        }
    };

    // --- GeoGebra Effect ---
    useEffect(() => {
        if (step === 'quiz' && ggbApplet) {
            const q = questions[currentQuestionIndex];
            if (q.type === 'graph_properties' || q.type === 'vertex_form_graph') {
                ggbApplet.reset();
                setTimeout(() => { ggbApplet.setCoordSystem(-6, 6, -6, 6); }, 100);
                
                const { a, b, c, xs, ys } = q.data;
                if (q.type === 'vertex_form_graph') {
                    ggbApplet.evalCommand(`f(x) = ${a}*(x - (${xs}))^2 + ${ys}`);
                    ggbApplet.evalCommand(`S=(${xs},${ys})`);
                } else {
                    ggbApplet.evalCommand(`f(x) = ${a}*x^2 + ${b}*x + ${c}`);
                    ggbApplet.evalCommand(`n(x) = x^2`);
                    ggbApplet.setLineStyle('n', 1);
                    ggbApplet.setColor('n', 150, 150, 150);
                }
            }
        }
    }, [currentQuestionIndex, step, ggbApplet, questions]);


    // --- Evaluation ---
    const calculateResults = () => {
        let score = 0;
        let maxScore = 0;

        questions.forEach(q => {
            maxScore += q.points;
            const ua = q.userAnswer;
            const ca = q.answer;
            let isCorrect = false;

            if (ua) {
                if (q.answerFormat === 'vertex') {
                    const u_xs = parseFloat(ua.xs.replace(',', '.'));
                    const u_ys = parseFloat(ua.ys.replace(',', '.'));
                    if (!isNaN(u_xs) && !isNaN(u_ys)) {
                        isCorrect = Math.abs(u_xs - ca.xs) < 0.1 && Math.abs(u_ys - ca.ys) < 0.1;
                    }
                } else if (q.answerFormat === 'nullstellen') {
                    if (ua.isNone) {
                        isCorrect = ca.isNone === true;
                    } else {
                        const u_n1 = parseFloat(ua.n1.replace(',', '.'));
                        const u_n2 = parseFloat(ua.n2.replace(',', '.'));
                        if (!isNaN(u_n1) && !isNaN(u_n2)) {
                            // Check both orders
                            const match1 = Math.abs(u_n1 - ca.n1) < 0.1 && Math.abs(u_n2 - ca.n2) < 0.1;
                            const match2 = Math.abs(u_n1 - ca.n2) < 0.1 && Math.abs(u_n2 - ca.n1) < 0.1;
                            isCorrect = match1 || match2;
                        }
                    }
                } else if (q.answerFormat === 'general_form') {
                    const u_a = parseFloat(ua.a.replace(',', '.'));
                    const u_b = parseFloat(ua.b.replace(',', '.'));
                    const u_c = parseFloat(ua.c.replace(',', '.'));
                    if (!isNaN(u_a) && !isNaN(u_b) && !isNaN(u_c)) {
                        isCorrect = Math.abs(u_a - ca.a) < 0.1 && Math.abs(u_b - ca.b) < 0.1 && Math.abs(u_c - ca.c) < 0.1;
                    }
                } else if (q.answerFormat === 'vertex_form') {
                    const u_a = parseFloat(ua.a.replace(',', '.'));
                    const u_xs = parseFloat(ua.xs.replace(',', '.'));
                    const u_ys = parseFloat(ua.ys.replace(',', '.'));
                    if (!isNaN(u_a) && !isNaN(u_xs) && !isNaN(u_ys)) {
                        isCorrect = Math.abs(u_a - ca.a) < 0.1 && Math.abs(u_xs - ca.xs) < 0.1 && Math.abs(u_ys - ca.ys) < 0.1;
                    }
                } else if (q.answerFormat === 'mc_properties') {
                    isCorrect = ua.stretch === ca.stretch && ua.opening === ca.opening;
                }
            }
            if (isCorrect) score += q.points;
        });

        return { score, maxScore };
    };

    const getGrade = (percentage: number) => {
        if (percentage >= 92) return { grade: "Note 1 (Sehr Gut)", feedback: "Hervorragende Leistung! Du beherrschst die Themen der quadratischen Funktionen exzellent." };
        if (percentage >= 81) return { grade: "Note 2 (Gut)", feedback: "Sehr gut gemacht! Du hast ein solides Verständnis für quadratische Funktionen." };
        if (percentage >= 67) return { grade: "Note 3 (Befriedigend)", feedback: "Gut gemacht! Du bist auf dem richtigen Weg, aber einige Themen könntest du noch einmal wiederholen." };
        if (percentage >= 50) return { grade: "Note 4 (Ausreichend)", feedback: "Bestanden! Es gibt jedoch noch einige Lücken. Wiederhole die Grundlagen der quadratischen Funktionen." };
        if (percentage >= 30) return { grade: "Note 5 (Mangelhaft)", feedback: "Das war leider noch nicht ausreichend. Schau dir die Lösungswege genau an und wiederhole die Themen intensiv." };
        return { grade: "Note 6 (Ungenügend)", feedback: "Leider nicht bestanden. Es ist wichtig, dass du dir die Grundlagen noch einmal von vorne ansiehst. Gib nicht auf!" };
    };

    const formatAnswerString = (q: Question, ans: any) => {
        if (!ans) return "Keine Antwort";
        if (q.answerFormat === 'vertex') {
            return `S(${ans.xs}|${ans.ys})`;
        } else if (q.answerFormat === 'nullstellen') {
            if (ans.isNone) return "Keine Nullstelle";
            return `x₁=${formatNumber(ans.n1)}, x₂=${formatNumber(ans.n2)}`;
        } else if (q.answerFormat === 'general_form') {
            return `y = ${ans.a}x² + ${ans.b}x + ${ans.c}`;
        } else if (q.answerFormat === 'vertex_form') {
            return `y = ${ans.a}(x - ${ans.xs})² + ${ans.ys}`;
        } else if (q.answerFormat === 'mc_properties') {
            return `Form: ${ans.stretch}, Öffnung: ${ans.opening}`;
        }
        return JSON.stringify(ans);
    };

    // --- Render Helpers ---
    const renderInput = () => {
        const q = questions[currentQuestionIndex];
        
        if (q.answerFormat === 'vertex') {
            return (
                <div className="flex items-center gap-2 justify-center mt-4">
                    <span className="text-xl">S (</span>
                    <input 
                        type="text" 
                        value={inputVertex.xs} 
                        onChange={(e) => setInputVertex({...inputVertex, xs: e.target.value})}
                        className="border p-2 rounded w-20 text-center" 
                        placeholder="x"
                    />
                    <span className="text-xl">|</span>
                    <input 
                        type="text" 
                        value={inputVertex.ys} 
                        onChange={(e) => setInputVertex({...inputVertex, ys: e.target.value})}
                        className="border p-2 rounded w-20 text-center" 
                        placeholder="y"
                    />
                    <span className="text-xl">)</span>
                </div>
            );
        } else if (q.answerFormat === 'nullstellen') {
            return (
                <div className="flex flex-col items-center gap-4 mt-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">x₁ =</span>
                            <input 
                                type="text" 
                                value={inputNullstellen.n1} 
                                onChange={(e) => setInputNullstellen({...inputNullstellen, n1: e.target.value})}
                                disabled={inputNullstellen.isNone}
                                className="border p-2 rounded w-20 text-center" 
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">x₂ =</span>
                            <input 
                                type="text" 
                                value={inputNullstellen.n2} 
                                onChange={(e) => setInputNullstellen({...inputNullstellen, n2: e.target.value})}
                                disabled={inputNullstellen.isNone}
                                className="border p-2 rounded w-20 text-center" 
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={inputNullstellen.isNone} 
                            onChange={(e) => setInputNullstellen({...inputNullstellen, isNone: e.target.checked})}
                            className="w-5 h-5"
                        />
                        <span>Keine Nullstelle</span>
                    </label>
                </div>
            );
        } else if (q.answerFormat === 'general_form') {
            return (
                <div className="flex items-center gap-2 justify-center mt-4 flex-wrap">
                    <span className="text-xl">y = </span>
                    <input 
                        type="text" 
                        value={inputGeneral.a} 
                        onChange={(e) => setInputGeneral({...inputGeneral, a: e.target.value})}
                        className="border p-2 rounded w-16 text-center" 
                        placeholder="a"
                    />
                    <span className="text-xl">x² + </span>
                    <input 
                        type="text" 
                        value={inputGeneral.b} 
                        onChange={(e) => setInputGeneral({...inputGeneral, b: e.target.value})}
                        className="border p-2 rounded w-16 text-center" 
                        placeholder="b"
                    />
                    <span className="text-xl">x + </span>
                    <input 
                        type="text" 
                        value={inputGeneral.c} 
                        onChange={(e) => setInputGeneral({...inputGeneral, c: e.target.value})}
                        className="border p-2 rounded w-16 text-center" 
                        placeholder="c"
                    />
                </div>
            );
        } else if (q.answerFormat === 'vertex_form') {
            return (
                <div className="flex items-center gap-2 justify-center mt-4 flex-wrap">
                    <span className="text-xl">y = </span>
                    <input 
                        type="text" 
                        value={inputVertexForm.a} 
                        onChange={(e) => setInputVertexForm({...inputVertexForm, a: e.target.value})}
                        className="border p-2 rounded w-16 text-center" 
                        placeholder="a"
                    />
                    <span className="text-xl">(x - </span>
                    <input 
                        type="text" 
                        value={inputVertexForm.xs} 
                        onChange={(e) => setInputVertexForm({...inputVertexForm, xs: e.target.value})}
                        className="border p-2 rounded w-16 text-center" 
                        placeholder="xs"
                    />
                    <span className="text-xl">)² + </span>
                    <input 
                        type="text" 
                        value={inputVertexForm.ys} 
                        onChange={(e) => setInputVertexForm({...inputVertexForm, ys: e.target.value})}
                        className="border p-2 rounded w-16 text-center" 
                        placeholder="ys"
                    />
                </div>
            );
        } else if (q.answerFormat === 'mc_properties') {
            return (
                <div className="flex flex-col gap-4 mt-4">
                    <div className="flex gap-4 justify-center">
                        <button 
                            className={`px-4 py-2 rounded border ${inputMC.stretch === 'gestreckt' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                            onClick={() => setInputMC({...inputMC, stretch: 'gestreckt'})}
                        >
                            Gestreckt (|a| &gt; 1)
                        </button>
                        <button 
                            className={`px-4 py-2 rounded border ${inputMC.stretch === 'gestaucht' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                            onClick={() => setInputMC({...inputMC, stretch: 'gestaucht'})}
                        >
                            Gestaucht (|a| &lt; 1)
                        </button>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <button 
                            className={`px-4 py-2 rounded border ${inputMC.opening === 'oben' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                            onClick={() => setInputMC({...inputMC, opening: 'oben'})}
                        >
                            Nach oben geöffnet (a &gt; 0)
                        </button>
                        <button 
                            className={`px-4 py-2 rounded border ${inputMC.opening === 'unten' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                            onClick={() => setInputMC({...inputMC, opening: 'unten'})}
                        >
                            Nach unten geöffnet (a &lt; 0)
                        </button>
                    </div>
                </div>
            );
        }
    };

    if (step === 'start') {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-6 text-blue-600">Abschlusstest: Quadratische Funktionen</h1>
                <p className="mb-6 text-gray-700 text-lg">
                    Beweise dein Können! Der Test besteht aus 10 zufälligen Aufgaben zu allen Themenbereichen.
                    Du benötigst Stift und Papier für Nebenrechnungen.
                </p>
                <button 
                    onClick={startTest}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    <Play size={24} /> Test starten
                </button>
            </div>
        );
    }

    if (step === 'result') {
        const { score, maxScore } = calculateResults();
        const percentage = (score / maxScore) * 100;
        const { grade, feedback } = getGrade(percentage);

        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center mb-8 border-b pb-6">
                    <h2 className="text-3xl font-bold mb-2 text-blue-600">Testergebnis</h2>
                    <div className="text-5xl font-bold mb-2">{score} / {maxScore} Punkte</div>
                    <div className="text-2xl font-semibold text-gray-700 mb-2">{grade}</div>
                    <p className="text-gray-600">{feedback}</p>
                    <button 
                        onClick={() => setStep('start')}
                        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2 mx-auto"
                    >
                        <RotateCcw size={20} /> Test wiederholen
                    </button>
                </div>

                <div className="space-y-6">
                    {questions.map((q, idx) => {
                        // Re-evaluate for display
                        let isCorrect = false;
                        const ua = q.userAnswer;
                        const ca = q.answer;
                        // ... (reuse logic or simplify for display)
                        // Simplified check for display color:
                        // Note: This duplicates logic, ideally refactor into a helper "checkAnswer(q)"
                        // For now, let's trust the score calculation logic was correct and just re-run it or store it.
                        // Let's just re-run the simple checks for the UI class
                        
                        let correct = false;
                        if (ua) {
                             if (q.answerFormat === 'vertex') {
                                const u_xs = parseFloat(ua.xs.replace(',', '.'));
                                const u_ys = parseFloat(ua.ys.replace(',', '.'));
                                if (!isNaN(u_xs) && !isNaN(u_ys)) correct = Math.abs(u_xs - ca.xs) < 0.1 && Math.abs(u_ys - ca.ys) < 0.1;
                            } else if (q.answerFormat === 'nullstellen') {
                                if (ua.isNone) correct = ca.isNone === true;
                                else {
                                    const u_n1 = parseFloat(ua.n1.replace(',', '.'));
                                    const u_n2 = parseFloat(ua.n2.replace(',', '.'));
                                    if (!isNaN(u_n1) && !isNaN(u_n2)) {
                                        const match1 = Math.abs(u_n1 - ca.n1) < 0.1 && Math.abs(u_n2 - ca.n2) < 0.1;
                                        const match2 = Math.abs(u_n1 - ca.n2) < 0.1 && Math.abs(u_n2 - ca.n1) < 0.1;
                                        correct = match1 || match2;
                                    }
                                }
                            } else if (q.answerFormat === 'general_form') {
                                const u_a = parseFloat(ua.a.replace(',', '.'));
                                const u_b = parseFloat(ua.b.replace(',', '.'));
                                const u_c = parseFloat(ua.c.replace(',', '.'));
                                if (!isNaN(u_a) && !isNaN(u_b) && !isNaN(u_c)) correct = Math.abs(u_a - ca.a) < 0.1 && Math.abs(u_b - ca.b) < 0.1 && Math.abs(u_c - ca.c) < 0.1;
                            } else if (q.answerFormat === 'vertex_form') {
                                const u_a = parseFloat(ua.a.replace(',', '.'));
                                const u_xs = parseFloat(ua.xs.replace(',', '.'));
                                const u_ys = parseFloat(ua.ys.replace(',', '.'));
                                if (!isNaN(u_a) && !isNaN(u_xs) && !isNaN(u_ys)) correct = Math.abs(u_a - ca.a) < 0.1 && Math.abs(u_xs - ca.xs) < 0.1 && Math.abs(u_ys - ca.ys) < 0.1;
                            } else if (q.answerFormat === 'mc_properties') {
                                correct = ua.stretch === ca.stretch && ua.opening === ca.opening;
                            }
                        }

                        return (
                            <div key={idx} className={`p-4 rounded border ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="font-bold mb-2 flex justify-between">
                                    <span>Frage {idx + 1} ({q.points} P.)</span>
                                    {correct ? <Check className="text-green-600" /> : <X className="text-red-600" />}
                                </div>
                                <div className="mb-2">{q.text}</div>
                                {q.data.equation && <div className="mb-2 font-mono bg-white p-2 rounded inline-block">{q.data.equation}</div>}
                                <div className="text-sm">
                                    <span className="font-semibold">Deine Antwort:</span> {formatAnswerString(q, ua)}
                                </div>
                                {!correct && (
                                    <div className="text-sm mt-1 text-gray-600">
                                        <span className="font-semibold">Richtige Antwort:</span> {formatAnswerString(q, ca)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestionIndex];
    const showGeoGebra = currentQ.type === 'graph_properties' || currentQ.type === 'vertex_form_graph';

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
                ></div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Frage {currentQuestionIndex + 1} von {TOTAL_QUESTIONS}</h2>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{currentQ.points} Punkte</span>
                </div>

                <div className="mb-6 text-lg">
                    {currentQ.text}
                </div>

                {currentQ.data.equation && !showGeoGebra && (
                    <div className="mb-6 text-center">
                        <div className="inline-block bg-gray-50 p-4 rounded-lg border border-gray-200 text-xl font-mono">
                            {currentQ.data.equation}
                        </div>
                    </div>
                )}

                {showGeoGebra && (
                    <div className="mb-6 h-[400px] border rounded overflow-hidden">
                        <GeoGebraApplet 
                            id="ggb-test"
                            filename=""
                            onLoad={setGgbApplet}
                        />
                    </div>
                )}

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    {renderInput()}
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleNextQuestion}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                        {currentQuestionIndex < TOTAL_QUESTIONS - 1 ? 'Nächste Frage' : 'Test beenden'} <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Abschlusstest;
