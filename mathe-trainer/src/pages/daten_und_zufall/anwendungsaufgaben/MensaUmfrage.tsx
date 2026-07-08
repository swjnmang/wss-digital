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
    { id: 'start', x: 310, y: 35, label: '' },
    { id: 'N', x: 170, y: 140, label: 'N' },
    { id: 'G', x: 450, y: 140, label: 'G' },
    { id: 'NA', x: 90, y: 250, label: 'A' },
    { id: 'NW', x: 250, y: 250, label: 'W' },
    { id: 'GA', x: 370, y: 250, label: 'A' },
    { id: 'GW', x: 530, y: 250, label: 'W' }
];

const treeEdges: TreeEdge[] = [
    { from: 'start', to: 'N', prob: 0.7, display: '0,7' },
    { from: 'start', to: 'G', prob: 0.3, display: '0,3' },
    { from: 'N', to: 'NA', prob: 0.6, display: '0,6' },
    { from: 'N', to: 'NW', prob: 0.4, display: '0,4' },
    { from: 'G', to: 'GA', prob: 0.2, display: '0,2' },
    { from: 'G', to: 'GW', prob: 0.8, display: '0,8' }
];

const parseInput = (value: string) => {
    const raw = value.trim();
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    return parseFloat(normalized);
};

export default function MensaUmfrage() {
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
                    <h1 className="text-3xl font-bold text-blue-700">Die Mensa-Umfrage</h1>

                    {/* Aufgabe 1 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 1</h2>
                        <p className="text-slate-700 mb-4">
                            Eine Ganztagsklasse kann beim Mittagessen in der Mensa zwischen einem Nudelgericht (N)
                            und einem Gemüsegericht (G) wählen. Als Getränke stehen Apfelschorle (A) und Wasser (W)
                            zur Wahl. Es wird angenommen, dass sich jede Schülerin und jeder Schüler für ein Gericht
                            und ein Getränk entscheidet (Zufallsexperiment).
                            <br /><br />
                            Das Nudelgericht wählen 70 % der Klasse. 60 % der „Nudel-Esser“ trinken Apfelschorle,
                            während 80 % der „Gemüse-Esser“ Wasser trinken.
                            <br /><br />
                            <strong>Tragen Sie alle Übergangswahrscheinlichkeiten in das Baumdiagramm ein.</strong>
                        </p>
                        <ProbabilityTree width={620} height={290} nodes={treeNodes} edges={treeEdges}
                            stageLabels={[{ y: 145, text: 'Gericht' }, { y: 255, text: 'Getränk' }]} />
                    </div>

                    {/* Aufgabe 2 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 2</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die Wahrscheinlichkeit, dass eine Schülerin oder ein Schüler Wasser trinkt.</strong>
                        </p>
                        {renderInputs('2', [{ field: 'a', label: 'P(Wasser):', suffix: '%', correct: 52, placeholder: 'z.B. 45' }])}
                        {renderButtons('2', [{ field: 'a', label: '', correct: 52 }])}
                        {feedback['2'] && <p className="text-sm mb-3 text-center">{feedback['2']}</p>}
                        {showSolution['2'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfad- und Summenregel):</strong>
                                <BlockMath math="P(W) = 0{,}7 \cdot 0{,}4 + 0{,}3 \cdot 0{,}8 = 0{,}28 + 0{,}24 = 0{,}52 = 52\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 3 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 3</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie, wie viele Schülerinnen und Schüler einer Klasse, bestehend aus
                            25 Personen, ein Gemüsegericht mit Wasser wählen.</strong>
                        </p>
                        {renderInputs('3', [{ field: 'a', label: 'Anzahl:', suffix: 'Personen', correct: 6, placeholder: 'z.B. 5' }])}
                        {renderButtons('3', [{ field: 'a', label: '', correct: 6 }])}
                        {feedback['3'] && <p className="text-sm mb-3 text-center">{feedback['3']}</p>}
                        {showSolution['3'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <BlockMath math="P(GW) = 0{,}3 \cdot 0{,}8 = 0{,}24" />
                                <BlockMath math="25 \cdot 0{,}24 = 6 \text{ Personen}" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 4 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 4</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die Wahrscheinlichkeit, dass eine Schülerin oder ein Schüler
                            kein Gemüsegericht mit Apfelschorle wählt.</strong>
                        </p>
                        {renderInputs('4', [{ field: 'a', label: 'Wahrscheinlichkeit:', suffix: '%', correct: 94, placeholder: 'z.B. 90' }])}
                        {renderButtons('4', [{ field: 'a', label: '', correct: 94 }])}
                        {feedback['4'] && <p className="text-sm mb-3 text-center">{feedback['4']}</p>}
                        {showSolution['4'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Gegenereignis):</strong>
                                <BlockMath math="1 - P(GA) = 1 - 0{,}3 \cdot 0{,}2 = 1 - 0{,}06 = 0{,}94 = 94\,\%" />
                                <p>
                                    oder: P(NA) + P(NW) + P(GW) = 0,42 + 0,28 + 0,24 = 0,94
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 5 */}
                    <div className="border-l-4 border-blue-600 pl-5">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 5</h2>
                        <p className="text-slate-700 mb-4">
                            Am Getränkeautomaten der Mensa wurden an zehn Schultagen folgende Flaschen verkauft:
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="bg-slate-200">
                                        <th className="px-2 py-2 border">Tag</th>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => <th key={t} className="px-2 py-2 border">{t}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="px-2 py-2 border font-semibold">Anzahl</td>
                                        {[34, 25, 18, 71, 22, 45, 38, 18, 62, 27].map((v, i) => <td key={i} className="px-2 py-2 border">{v}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie das arithmetische Mittel, den Median und die Spannweite des
                            Getränkeverkaufs.</strong>
                        </p>
                        {renderInputs('5', [
                            { field: 'a', label: 'Arithmetisches Mittel:', suffix: 'Flaschen', correct: 36, placeholder: 'z.B. 30' },
                            { field: 'b', label: 'Median:', suffix: 'Flaschen', correct: 30.5, placeholder: 'z.B. 28,5' },
                            { field: 'c', label: 'Spannweite:', suffix: 'Flaschen', correct: 53, placeholder: 'z.B. 50' }
                        ])}
                        {renderButtons('5', [
                            { field: 'a', label: '', correct: 36 },
                            { field: 'b', label: '', correct: 30.5 },
                            { field: 'c', label: '', correct: 53 }
                        ])}
                        {feedback['5'] && <p className="text-sm mb-3 text-center">{feedback['5']}</p>}
                        {showSolution['5'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <BlockMath math="\bar{x} = \frac{34 + 25 + 18 + 71 + 22 + 45 + 38 + 18 + 62 + 27}{10} = \frac{360}{10} = 36" />
                                <p>Geordnete Liste: 18, 18, 22, 25, 27, 34, 38, 45, 62, 71</p>
                                <BlockMath math="x_{med} = \frac{27 + 34}{2} = 30{,}5" />
                                <BlockMath math="R = x_{max} - x_{min} = 71 - 18 = 53" />
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
