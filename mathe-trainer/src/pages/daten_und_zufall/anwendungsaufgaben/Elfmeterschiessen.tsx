import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ProbabilityTree, { TreeEdge, TreeNode } from '../../../components/ProbabilityTree';

interface FieldCheck {
    field: string;
    label: string;
    suffix?: string;
    correct: number;
    placeholder?: string;
}

const treeNodes: TreeNode[] = [
    { id: 'start', x: 350, y: 30, label: '' },
    { id: 't1', x: 180, y: 135, label: 'T' },
    { id: 'v1', x: 520, y: 135, label: 'V' },
    { id: 'tt', x: 100, y: 245, label: 'T' },
    { id: 'tv', x: 260, y: 245, label: 'V' },
    { id: 'vt', x: 440, y: 245, label: 'T' },
    { id: 'vv', x: 600, y: 245, label: 'V' },
    { id: 'ttt', x: 55, y: 355, label: 'T' },
    { id: 'ttv', x: 145, y: 355, label: 'V' },
    { id: 'tvt', x: 215, y: 355, label: 'T' },
    { id: 'tvv', x: 305, y: 355, label: 'V' },
    { id: 'vtt', x: 395, y: 355, label: 'T' },
    { id: 'vtv', x: 485, y: 355, label: 'V' },
    { id: 'vvt', x: 555, y: 355, label: 'T' },
    { id: 'vvv', x: 645, y: 355, label: 'V' }
];

const treeEdges: TreeEdge[] = [
    { from: 'start', to: 't1', prob: 0.8, display: '0,8' },
    { from: 'start', to: 'v1', prob: 0.2, display: '0,2' },
    { from: 't1', to: 'tt', prob: 0.8, display: '0,8' },
    { from: 't1', to: 'tv', prob: 0.2, display: '0,2' },
    { from: 'v1', to: 'vt', prob: 0.8, display: '0,8' },
    { from: 'v1', to: 'vv', prob: 0.2, display: '0,2' },
    { from: 'tt', to: 'ttt', prob: 0.8, display: '0,8' },
    { from: 'tt', to: 'ttv', prob: 0.2, display: '0,2' },
    { from: 'tv', to: 'tvt', prob: 0.8, display: '0,8' },
    { from: 'tv', to: 'tvv', prob: 0.2, display: '0,2' },
    { from: 'vt', to: 'vtt', prob: 0.8, display: '0,8' },
    { from: 'vt', to: 'vtv', prob: 0.2, display: '0,2' },
    { from: 'vv', to: 'vvt', prob: 0.8, display: '0,8' },
    { from: 'vv', to: 'vvv', prob: 0.2, display: '0,2' }
];

const parseInput = (value: string) => {
    const raw = value.trim();
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    return parseFloat(normalized);
};

export default function Elfmeterschiessen() {
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<Record<string, string>>({});
    const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});

    const setInput = (key: string, value: string) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    const checkPart = (part: string, checks: FieldCheck[]) => {
        for (const c of checks) {
            const v = parseInput(inputs[`${part}.${c.field}`] ?? '');
            if (isNaN(v)) {
                setFeedback(prev => ({ ...prev, [part]: '❌ Bitte in alle Felder eine gültige Zahl eingeben.' }));
                return;
            }
            const tol = Math.abs(c.correct) * 0.03;
            if (Math.abs(v - c.correct) > tol) {
                setFeedback(prev => ({ ...prev, [part]: '❌ Noch nicht richtig – versuche es nochmal oder sieh dir die Lösung an.' }));
                return;
            }
        }
        setFeedback(prev => ({ ...prev, [part]: '✅ Richtig!' }));
    };

    const renderInputs = (part: string, checks: FieldCheck[]) => (
        <div className="flex flex-col items-center gap-3 mb-4">
            {checks.map(c => (
                <label key={c.field} className="flex items-center gap-2 justify-center flex-wrap">
                    <span className="font-semibold">{c.label}</span>
                    <input
                        type="text"
                        value={inputs[`${part}.${c.field}`] ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(`${part}.${c.field}`, e.target.value)}
                        placeholder={c.placeholder ?? ''}
                        className="border border-slate-300 rounded px-3 py-2 w-32 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {c.suffix && <span className="text-slate-600">{c.suffix}</span>}
                </label>
            ))}
        </div>
    );

    const renderButtons = (part: string, checks?: FieldCheck[]) => (
        <div className="flex gap-3 flex-wrap mb-3 justify-center">
            {checks && (
                <button
                    onClick={() => checkPart(part, checks)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                    Prüfen
                </button>
            )}
            <button
                onClick={() => setShowSolution(prev => ({ ...prev, [part]: !prev[part] }))}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
            >
                {showSolution[part] ? 'Lösung verbergen' : 'Lösung anzeigen'}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-color)] py-8">
            <div className="mx-auto px-4 max-w-4xl">
                <Link to="/daten-und-zufall/anwendungsaufgaben" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm font-medium mb-4">
                    <i className="fa-solid fa-arrow-left"></i> Zurück zur Übersicht
                </Link>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-8">
                    <h1 className="text-3xl font-bold text-blue-700">Das Elfmeterschießen</h1>

                    {/* Aufgabe 1 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 1</h2>
                        <p className="text-slate-700 mb-4">
                            Beim großen Fußballturnier der Wirtschaftsschule treten 24 Mannschaften aus vier
                            Landkreisen an:
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="bg-slate-200">
                                        <th className="px-2 py-2 border text-left">Landkreis</th>
                                        <th className="px-2 py-2 border">Nord</th>
                                        <th className="px-2 py-2 border">Ost</th>
                                        <th className="px-2 py-2 border">Süd</th>
                                        <th className="px-2 py-2 border">West</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="px-2 py-2 border text-left font-semibold">Mannschaften</td>
                                        <td className="px-2 py-2 border">4</td>
                                        <td className="px-2 py-2 border">6</td>
                                        <td className="px-2 py-2 border">9</td>
                                        <td className="px-2 py-2 border">5</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die relative Häufigkeit in Prozent für das Ereignis E₁: „Die
                            teilnehmende Mannschaft kommt aus dem Landkreis Süd oder West.“</strong>
                        </p>
                        {renderInputs('1', [{ field: 'a', label: 'h(E₁):', suffix: '%', correct: 58.33, placeholder: 'z.B. 50' }])}
                        {renderButtons('1', [{ field: 'a', label: '', correct: 58.33 }])}
                        {feedback['1'] && <p className="text-sm mb-3 text-center">{feedback['1']}</p>}
                        {showSolution['1'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <BlockMath math="h(E_1) = \frac{9 + 5}{24} = \frac{14}{24} \approx 0{,}5833 = 58{,}33\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 2 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 2</h2>
                        <p className="text-slate-700 mb-4">
                            Bei den acht Turnierspielen des Finaltags wurden folgende Zuschauerzahlen gezählt:
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="bg-slate-200">
                                        <th className="px-2 py-2 border">Spiel</th>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(t => <th key={t} className="px-2 py-2 border">{t}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="px-2 py-2 border font-semibold">Zuschauer</td>
                                        {[145, 210, 180, 210, 165, 320, 190, 210].map((v, i) => <td key={i} className="px-2 py-2 border">{v}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie den Median, den Modalwert und die Spannweite der Zuschauerzahlen.</strong>
                        </p>
                        {renderInputs('2', [
                            { field: 'a', label: 'Median:', suffix: 'Zuschauer', correct: 200, placeholder: 'z.B. 190' },
                            { field: 'b', label: 'Modalwert:', suffix: 'Zuschauer', correct: 210, placeholder: 'z.B. 190' },
                            { field: 'c', label: 'Spannweite:', suffix: 'Zuschauer', correct: 175, placeholder: 'z.B. 160' }
                        ])}
                        {renderButtons('2', [
                            { field: 'a', label: '', correct: 200 },
                            { field: 'b', label: '', correct: 210 },
                            { field: 'c', label: '', correct: 175 }
                        ])}
                        {feedback['2'] && <p className="text-sm mb-3 text-center">{feedback['2']}</p>}
                        {showSolution['2'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <p>Geordnete Reihe: 145, 165, 180, <strong>190, 210</strong>, 210, 210, 320</p>
                                <BlockMath math="x_{med} = \frac{190 + 210}{2} = 200 \text{ Zuschauer}" />
                                <BlockMath math="x_{mod} = 210 \text{ Zuschauer}" />
                                <BlockMath math="R = 320 - 145 = 175 \text{ Zuschauer}" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 3 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 3</h2>
                        <p className="text-slate-700 mb-4">
                            Das Finale wird erst im Elfmeterschießen entschieden. Statistisch gesehen verwandelt
                            eine Schützin der Schulmannschaft einen Elfmeter mit einer Wahrscheinlichkeit von 80 %
                            (T = trifft, V = verfehlt).
                            <br /><br />
                            <strong>Vervollständigen Sie das Baumdiagramm für drei nacheinander antretende
                            Schützinnen und tragen Sie alle Übergangswahrscheinlichkeiten ein.</strong>
                        </p>
                        <ProbabilityTree width={700} height={400} nodes={treeNodes} edges={treeEdges}
                            stageLabels={[{ y: 140, text: '1. Schützin' }, { y: 250, text: '2. Schützin' }, { y: 360, text: '3. Schützin' }]} />
                    </div>

                    {/* Aufgabe 4 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 4</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die Wahrscheinlichkeit des Ereignisses E₂: „Es treffen alle drei
                            Schützinnen.“</strong>
                        </p>
                        {renderInputs('4', [{ field: 'a', label: 'P(E₂):', suffix: '%', correct: 51.2, placeholder: 'z.B. 45' }])}
                        {renderButtons('4', [{ field: 'a', label: '', correct: 51.2 }])}
                        {feedback['4'] && <p className="text-sm mb-3 text-center">{feedback['4']}</p>}
                        {showSolution['4'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfadregel):</strong>
                                <BlockMath math="P(E_2) = 0{,}8 \cdot 0{,}8 \cdot 0{,}8 = 0{,}512 = 51{,}2\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 5 */}
                    <div className="border-l-4 border-blue-600 pl-5">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 5</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die Wahrscheinlichkeit des Ereignisses E₃: „Höchstens eine Schützin
                            trifft nicht.“</strong>
                        </p>
                        {renderInputs('5', [{ field: 'a', label: 'P(E₃):', suffix: '%', correct: 89.6, placeholder: 'z.B. 85' }])}
                        {renderButtons('5', [{ field: 'a', label: '', correct: 89.6 }])}
                        {feedback['5'] && <p className="text-sm mb-3 text-center">{feedback['5']}</p>}
                        {showSolution['5'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfad- und Summenregel):</strong>
                                <p>„Höchstens eine trifft nicht“ bedeutet: alle drei treffen oder genau eine verfehlt.</p>
                                <BlockMath math="P(E_3) = P(TTT) + 3 \cdot P(\text{genau eine verfehlt})" />
                                <BlockMath math="= 0{,}8^3 + 3 \cdot (0{,}2 \cdot 0{,}8 \cdot 0{,}8) = 0{,}512 + 0{,}384 = 0{,}896 = 89{,}6\,\%" />
                            </div>
                        )}
                    </div>

                    <div className="text-center text-sm text-slate-500">
                        <p>Angelehnt an eine Abschlussprüfung – ca. 15 Punkte</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
