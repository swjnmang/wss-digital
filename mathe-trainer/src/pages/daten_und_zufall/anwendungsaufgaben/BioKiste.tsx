import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ProbabilityTree, { TreeEdge, TreeNode } from '../../../components/ProbabilityTree';
import SimplePieChart from '../../../components/SimplePieChart';

interface FieldCheck {
    field: string;
    label: string;
    suffix?: string;
    correct: number;
    placeholder?: string;
}

const treeNodes: TreeNode[] = [
    { id: 'start', x: 375, y: 30, label: '' },
    { id: 'A1', x: 125, y: 140, label: 'A' },
    { id: 'B1', x: 375, y: 140, label: 'B' },
    { id: 'O1', x: 625, y: 140, label: 'O' },
    { id: 'AA', x: 50, y: 250, label: 'A' },
    { id: 'AB', x: 125, y: 250, label: 'B' },
    { id: 'AO', x: 200, y: 250, label: 'O' },
    { id: 'BA', x: 300, y: 250, label: 'A' },
    { id: 'BB', x: 375, y: 250, label: 'B' },
    { id: 'BO', x: 450, y: 250, label: 'O' },
    { id: 'OA', x: 550, y: 250, label: 'A' },
    { id: 'OB', x: 625, y: 250, label: 'B' },
    { id: 'OO', x: 700, y: 250, label: 'O' }
];

const treeEdges: TreeEdge[] = [
    { from: 'start', to: 'A1', prob: 10 / 20, display: '10/20' },
    { from: 'start', to: 'B1', prob: 6 / 20, display: '6/20' },
    { from: 'start', to: 'O1', prob: 4 / 20, display: '4/20' },
    { from: 'A1', to: 'AA', prob: 9 / 19, display: '9/19' },
    { from: 'A1', to: 'AB', prob: 6 / 19, display: '6/19' },
    { from: 'A1', to: 'AO', prob: 4 / 19, display: '4/19' },
    { from: 'B1', to: 'BA', prob: 10 / 19, display: '10/19' },
    { from: 'B1', to: 'BB', prob: 5 / 19, display: '5/19' },
    { from: 'B1', to: 'BO', prob: 4 / 19, display: '4/19' },
    { from: 'O1', to: 'OA', prob: 10 / 19, display: '10/19' },
    { from: 'O1', to: 'OB', prob: 6 / 19, display: '6/19' },
    { from: 'O1', to: 'OO', prob: 3 / 19, display: '3/19' }
];

const parseInput = (value: string) => {
    const raw = value.trim();
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    return parseFloat(normalized);
};

export default function BioKiste() {
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
            const tol = Math.max(Math.abs(c.correct) * 0.03, 0.05);
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
                    <h1 className="text-3xl font-bold text-blue-700">Die Bio-Kiste</h1>
                    <p className="text-slate-600 -mt-4">
                        Der Bioladen „Gutes Grün“ verkauft drei Kistentypen: Standard, Familie und Gourmet. Die
                        Tabelle zeigt die verkauften Kisten einer Woche.
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded p-4 overflow-x-auto -mt-4">
                        <table className="w-full text-sm text-center">
                            <thead>
                                <tr className="bg-slate-200">
                                    <th className="px-2 py-2 border text-left">Typ</th>
                                    <th className="px-2 py-2 border">Mo</th>
                                    <th className="px-2 py-2 border">Di</th>
                                    <th className="px-2 py-2 border">Mi</th>
                                    <th className="px-2 py-2 border">Do</th>
                                    <th className="px-2 py-2 border">Fr</th>
                                    <th className="px-2 py-2 border">Summe</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-white">
                                    <td className="px-2 py-2 border text-left font-semibold">Standard</td>
                                    <td className="px-2 py-2 border">10</td>
                                    <td className="px-2 py-2 border">9</td>
                                    <td className="px-2 py-2 border">11</td>
                                    <td className="px-2 py-2 border">10</td>
                                    <td className="px-2 py-2 border">13</td>
                                    <td className="px-2 py-2 border font-semibold">53</td>
                                </tr>
                                <tr className="bg-blue-50">
                                    <td className="px-2 py-2 border text-left font-semibold">Familie</td>
                                    <td className="px-2 py-2 border">6</td>
                                    <td className="px-2 py-2 border">7</td>
                                    <td className="px-2 py-2 border">5</td>
                                    <td className="px-2 py-2 border">8</td>
                                    <td className="px-2 py-2 border">8</td>
                                    <td className="px-2 py-2 border font-semibold">34</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-2 py-2 border text-left font-semibold">Gourmet</td>
                                    <td className="px-2 py-2 border">2</td>
                                    <td className="px-2 py-2 border">3</td>
                                    <td className="px-2 py-2 border">2</td>
                                    <td className="px-2 py-2 border">4</td>
                                    <td className="px-2 py-2 border">2</td>
                                    <td className="px-2 py-2 border font-semibold">13</td>
                                </tr>
                                <tr className="bg-slate-200 font-semibold">
                                    <td className="px-2 py-2 border text-left">Summe</td>
                                    <td className="px-2 py-2 border">18</td>
                                    <td className="px-2 py-2 border">19</td>
                                    <td className="px-2 py-2 border">18</td>
                                    <td className="px-2 py-2 border">22</td>
                                    <td className="px-2 py-2 border">23</td>
                                    <td className="px-2 py-2 border">100</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Aufgabe 1 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 1 – Absolute Häufigkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die absolute Häufigkeit des Ereignisses E₁₁: „Eine Gourmet-Kiste
                            wird am Donnerstag oder Freitag verkauft.“</strong>
                        </p>
                        {renderInputs('1', [{ field: 'a', label: 'H(E₁₁):', suffix: 'Kisten', correct: 6, placeholder: 'z.B. 5' }])}
                        {renderButtons('1', [{ field: 'a', label: '', correct: 6 }])}
                        {feedback['1'] && <p className="text-sm mb-3 text-center">{feedback['1']}</p>}
                        {showSolution['1'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <BlockMath math="H(E_{11}) = 4 + 2 = 6 \text{ Kisten}" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 2 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 2 – Relative Häufigkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die relative Häufigkeit des Ereignisses E₁₂: „Eine verkaufte Kiste
                            ist vom Typ Familie.“</strong>
                        </p>
                        {renderInputs('2', [{ field: 'a', label: 'h(E₁₂):', suffix: '%', correct: 34, placeholder: 'z.B. 30' }])}
                        {renderButtons('2', [{ field: 'a', label: '', correct: 34 }])}
                        {feedback['2'] && <p className="text-sm mb-3 text-center">{feedback['2']}</p>}
                        {showSolution['2'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <BlockMath math="h(E_{12}) = \frac{34}{100} = 34\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 3 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 3 – Kreisdiagramm</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie für jeden Kistentyp die zugehörige Gradzahl, um die
                            Wochenverteilung in einem Kreisdiagramm darzustellen.</strong>
                        </p>
                        {renderInputs('3', [
                            { field: 'a', label: 'Standard:', suffix: '°', correct: 190.8, placeholder: 'z.B. 180' },
                            { field: 'b', label: 'Familie:', suffix: '°', correct: 122.4, placeholder: 'z.B. 100' },
                            { field: 'c', label: 'Gourmet:', suffix: '°', correct: 46.8, placeholder: 'z.B. 40' }
                        ])}
                        {renderButtons('3', [
                            { field: 'a', label: '', correct: 190.8 },
                            { field: 'b', label: '', correct: 122.4 },
                            { field: 'c', label: '', correct: 46.8 }
                        ])}
                        {feedback['3'] && <p className="text-sm mb-3 text-center">{feedback['3']}</p>}
                        {showSolution['3'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 space-y-3">
                                <div className="text-center">
                                    <strong>Lösung:</strong>
                                    <BlockMath math="\text{Standard: } \frac{53}{100} \cdot 360^\circ = 190{,}8^\circ" />
                                    <BlockMath math="\text{Familie: } \frac{34}{100} \cdot 360^\circ = 122{,}4^\circ" />
                                    <BlockMath math="\text{Gourmet: } \frac{13}{100} \cdot 360^\circ = 46{,}8^\circ" />
                                </div>
                                <SimplePieChart data={[
                                    { label: 'Standard', value: 53, color: '#2563eb' },
                                    { label: 'Familie', value: 34, color: '#f97316' },
                                    { label: 'Gourmet', value: 13, color: '#16a34a' }
                                ]} />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 4 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 4 – Baumdiagramm</h2>
                        <p className="text-slate-700 mb-4">
                            Eine Standard-Kiste enthält an diesem Tag 10 Äpfel (A), 6 Birnen (B) und 4 Orangen (O),
                            insgesamt 20 Früchte. Ein Kunde nimmt zufällig nacheinander zwei Früchte aus der Kiste
                            (ohne Zurücklegen).
                            <br /><br />
                            <strong>Tragen Sie alle Übergangswahrscheinlichkeiten in das Baumdiagramm ein.</strong>
                        </p>
                        <ProbabilityTree width={750} height={290} nodes={treeNodes} edges={treeEdges}
                            stageLabels={[{ y: 145, text: '1. Frucht' }, { y: 255, text: '2. Frucht' }]} />
                    </div>

                    {/* Aufgabe 5 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 5 – Wahrscheinlichkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die Wahrscheinlichkeit des Ereignisses E₁₃: „Der Kunde nimmt zwei
                            Äpfel aus der Kiste.“</strong>
                        </p>
                        {renderInputs('5', [{ field: 'a', label: 'P(E₁₃):', suffix: '%', correct: 23.68, placeholder: 'z.B. 20' }])}
                        {renderButtons('5', [{ field: 'a', label: '', correct: 23.68 }])}
                        {feedback['5'] && <p className="text-sm mb-3 text-center">{feedback['5']}</p>}
                        {showSolution['5'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfadregel):</strong>
                                <BlockMath math="P(E_{13}) = \frac{10}{20} \cdot \frac{9}{19} = \frac{90}{380} \approx 0{,}2368 = 23{,}68\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 6 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 6 – Wahrscheinlichkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die Wahrscheinlichkeit des Ereignisses E₁₄: „Der Kunde legt keine
                            Orange auf den Tisch.“</strong>
                        </p>
                        {renderInputs('6', [{ field: 'a', label: 'P(E₁₄):', suffix: '%', correct: 63.16, placeholder: 'z.B. 60' }])}
                        {renderButtons('6', [{ field: 'a', label: '', correct: 63.16 }])}
                        {feedback['6'] && <p className="text-sm mb-3 text-center">{feedback['6']}</p>}
                        {showSolution['6'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfad- und Summenregel):</strong>
                                <BlockMath math="P(E_{14}) = \frac{10}{20}\cdot\frac{9}{19} + \frac{10}{20}\cdot\frac{6}{19} + \frac{6}{20}\cdot\frac{10}{19} + \frac{6}{20}\cdot\frac{5}{19}" />
                                <BlockMath math="= \frac{240}{380} \approx 0{,}6316 = 63{,}16\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 7 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 7 – Wahrscheinlichkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die Wahrscheinlichkeit des Ereignisses E₁₅: „Mindestens eine Birne
                            liegt unter den zwei Früchten.“</strong>
                        </p>
                        {renderInputs('7', [{ field: 'a', label: 'P(E₁₅):', suffix: '%', correct: 52.11, placeholder: 'z.B. 45' }])}
                        {renderButtons('7', [{ field: 'a', label: '', correct: 52.11 }])}
                        {feedback['7'] && <p className="text-sm mb-3 text-center">{feedback['7']}</p>}
                        {showSolution['7'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Gegenereignis):</strong>
                                <BlockMath math="P(\text{keine Birne}) = \frac{10}{20}\cdot\frac{9}{19} + \frac{10}{20}\cdot\frac{4}{19} + \frac{4}{20}\cdot\frac{10}{19} + \frac{4}{20}\cdot\frac{3}{19} = \frac{182}{380} \approx 0{,}4789" />
                                <BlockMath math="P(E_{15}) = 1 - 0{,}4789 = 0{,}5211 = 52{,}11\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 8 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 8 – Statistische Kennwerte</h2>
                        <p className="text-slate-700 mb-4">
                            Beim Wiegen vor der Auslieferung wurden neun Bio-Kisten (in kg) gewogen:
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="bg-slate-200">
                                        <th className="px-2 py-2 border">Kiste</th>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => <th key={t} className="px-2 py-2 border">{t}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="px-2 py-2 border font-semibold">Gewicht (kg)</td>
                                        {[5.2, 4.8, 5.5, 5.0, 4.8, 6.1, 5.3, 4.8, 5.0].map((v, i) => <td key={i} className="px-2 py-2 border">{v.toString().replace('.', ',')}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie Minimum, Maximum, Spannweite, Median, Modalwert und arithmetisches
                            Mittel des Gewichts.</strong>
                        </p>
                        {renderInputs('8', [
                            { field: 'a', label: 'Minimum:', suffix: 'kg', correct: 4.8, placeholder: 'z.B. 5' },
                            { field: 'b', label: 'Maximum:', suffix: 'kg', correct: 6.1, placeholder: 'z.B. 5,8' },
                            { field: 'c', label: 'Spannweite:', suffix: 'kg', correct: 1.3, placeholder: 'z.B. 1' },
                            { field: 'd', label: 'Median:', suffix: 'kg', correct: 5.0, placeholder: 'z.B. 5,1' },
                            { field: 'e', label: 'Modalwert:', suffix: 'kg', correct: 4.8, placeholder: 'z.B. 5' },
                            { field: 'f', label: 'Arithm. Mittel:', suffix: 'kg', correct: 5.17, placeholder: 'z.B. 5' }
                        ])}
                        {renderButtons('8', [
                            { field: 'a', label: '', correct: 4.8 },
                            { field: 'b', label: '', correct: 6.1 },
                            { field: 'c', label: '', correct: 1.3 },
                            { field: 'd', label: '', correct: 5.0 },
                            { field: 'e', label: '', correct: 4.8 },
                            { field: 'f', label: '', correct: 5.17 }
                        ])}
                        {feedback['8'] && <p className="text-sm mb-3 text-center">{feedback['8']}</p>}
                        {showSolution['8'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <p>Geordnete Reihe: 4,8 – 4,8 – 4,8 – 5,0 – 5,0 – 5,2 – 5,3 – 5,5 – 6,1</p>
                                <BlockMath math="\text{Minimum} = 4{,}8, \quad \text{Maximum} = 6{,}1, \quad R = 6{,}1 - 4{,}8 = 1{,}3" />
                                <BlockMath math="x_{med} = 5{,}0, \quad x_{mod} = 4{,}8" />
                                <BlockMath math="\bar{x} = \frac{5{,}2+4{,}8+5{,}5+5{,}0+4{,}8+6{,}1+5{,}3+4{,}8+5{,}0}{9} = \frac{46{,}5}{9} \approx 5{,}17" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 9 */}
                    <div className="border-l-4 border-blue-600 pl-5">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 9 – Kritische Reflexion</h2>
                        <p className="text-slate-700 mb-4">
                            Der Bioladen wirbt auf einem Plakat: <strong>„Renner der Woche: unsere Gourmet-Kiste!“</strong>{' '}
                            Begründet wird dies damit, dass am Freitag mit 13 Stück die höchste Tagesmenge einer
                            einzelnen Sorte (Standard) verkauft wurde.
                        </p>
                        <p className="text-slate-700 mb-4">
                            <strong>9.1</strong> Nehmen Sie kritisch Stellung zu der Werbeaussage anhand der
                            Wochensummen aus der Tabelle.
                            <br />
                            <strong>9.2</strong> Berechnen Sie, um wie viele Prozentpunkte die relative Häufigkeit der
                            Standard-Kisten höher ist als die der Gourmet-Kisten.
                        </p>
                        {renderInputs('9', [{ field: 'a', label: 'Differenz:', suffix: 'Prozentpunkte', correct: 40, placeholder: 'z.B. 30' }])}
                        {renderButtons('9', [{ field: 'a', label: '', correct: 40 }])}
                        {feedback['9'] && <p className="text-sm mb-3 text-center">{feedback['9']}</p>}
                        {showSolution['9'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <p>
                                    Die Aussage ist irreführend: Bezogen auf die gesamte Woche ist die Gourmet-Kiste
                                    mit 13 % Anteil die unbeliebteste Sorte, nicht der „Renner“. Der Vergleich einer
                                    einzelnen Tagesmenge (Standard, Freitag) mit der Bezeichnung „Renner“ für Gourmet
                                    ist sachlich falsch begründet.
                                </p>
                                <BlockMath math="53\,\% - 13\,\% = 40 \text{ Prozentpunkte}" />
                            </div>
                        )}
                    </div>

                    <div className="text-center text-sm text-slate-500">
                        <p>Angelehnt an eine Abschlussprüfung – ca. 20 Punkte</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
