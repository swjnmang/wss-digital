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
    { id: 'start', x: 350, y: 30, label: '' },
    { id: 'H1', x: 180, y: 135, label: 'H' },
    { id: 'N1', x: 520, y: 135, label: 'N' },
    { id: 'HH', x: 100, y: 245, label: 'H' },
    { id: 'HN', x: 260, y: 245, label: 'N' },
    { id: 'NH', x: 440, y: 245, label: 'H' },
    { id: 'NN', x: 600, y: 245, label: 'N' },
    { id: 'HHH', x: 65, y: 355, label: 'H' },
    { id: 'HHN', x: 135, y: 355, label: 'N' },
    { id: 'HNH', x: 225, y: 355, label: 'H' },
    { id: 'HNN', x: 295, y: 355, label: 'N' },
    { id: 'NHH', x: 405, y: 355, label: 'H' },
    { id: 'NHN', x: 475, y: 355, label: 'N' },
    { id: 'NNH', x: 565, y: 355, label: 'H' },
    { id: 'NNN', x: 635, y: 355, label: 'N' }
];

const treeEdges: TreeEdge[] = [
    { from: 'start', to: 'H1', prob: 3 / 15, display: '3/15', given: true },
    { from: 'start', to: 'N1', prob: 12 / 15, display: '12/15', given: true },
    { from: 'H1', to: 'HH', prob: 2 / 14, display: '2/14' },
    { from: 'H1', to: 'HN', prob: 12 / 14, display: '12/14' },
    { from: 'N1', to: 'NH', prob: 3 / 14, display: '3/14' },
    { from: 'N1', to: 'NN', prob: 11 / 14, display: '11/14' },
    { from: 'HH', to: 'HHH', prob: 1 / 13, display: '1/13' },
    { from: 'HH', to: 'HHN', prob: 12 / 13, display: '12/13' },
    { from: 'HN', to: 'HNH', prob: 2 / 13, display: '2/13' },
    { from: 'HN', to: 'HNN', prob: 11 / 13, display: '11/13' },
    { from: 'NH', to: 'NHH', prob: 2 / 13, display: '2/13' },
    { from: 'NH', to: 'NHN', prob: 11 / 13, display: '11/13' },
    { from: 'NN', to: 'NNH', prob: 3 / 13, display: '3/13' },
    { from: 'NN', to: 'NNN', prob: 10 / 13, display: '10/13' }
];

const parseInput = (value: string) => {
    const raw = value.trim();
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    return parseFloat(normalized);
};

export default function Sommerfest() {
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
                    <h1 className="text-3xl font-bold text-blue-700">Das Sommerfest</h1>
                    <p className="text-slate-600 -mt-4">
                        Beim Sommerfest der Wirtschaftsschule besuchen 180 Schülerinnen und Schüler drei Stationen:
                        Torwandschießen, Dosenwerfen und den Kuchenverkauf. Die Tabelle zeigt die Verteilung, getrennt
                        nach Unter- (Klasse 5–7) und Oberstufe (Klasse 8–10).
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded p-4 overflow-x-auto -mt-4">
                        <table className="w-full text-sm text-center">
                            <thead>
                                <tr className="bg-slate-200">
                                    <th className="px-2 py-2 border text-left">Stufe</th>
                                    <th className="px-2 py-2 border">Torwand</th>
                                    <th className="px-2 py-2 border">Dosenwerfen</th>
                                    <th className="px-2 py-2 border">Kuchenverkauf</th>
                                    <th className="px-2 py-2 border">Summe</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-white">
                                    <td className="px-2 py-2 border text-left font-semibold">Unterstufe</td>
                                    <td className="px-2 py-2 border">22</td>
                                    <td className="px-2 py-2 border">30</td>
                                    <td className="px-2 py-2 border">28</td>
                                    <td className="px-2 py-2 border font-semibold">80</td>
                                </tr>
                                <tr className="bg-blue-50">
                                    <td className="px-2 py-2 border text-left font-semibold">Oberstufe</td>
                                    <td className="px-2 py-2 border">38</td>
                                    <td className="px-2 py-2 border">20</td>
                                    <td className="px-2 py-2 border">42</td>
                                    <td className="px-2 py-2 border font-semibold">100</td>
                                </tr>
                                <tr className="bg-slate-200 font-semibold">
                                    <td className="px-2 py-2 border text-left">Summe</td>
                                    <td className="px-2 py-2 border">60</td>
                                    <td className="px-2 py-2 border">50</td>
                                    <td className="px-2 py-2 border">70</td>
                                    <td className="px-2 py-2 border">180</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Aufgabe 1 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 1 – Absolute Häufigkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die absolute Häufigkeit des Ereignisses E₁: „Ein Oberstufenschüler
                            geht zum Kuchenverkauf.“</strong>
                        </p>
                        {renderInputs('1', [{ field: 'a', label: 'H(E₁):', suffix: 'Personen', correct: 42, placeholder: 'z.B. 38' }])}
                        {renderButtons('1', [{ field: 'a', label: '', correct: 42 }])}
                        {feedback['1'] && <p className="text-sm mb-3 text-center">{feedback['1']}</p>}
                        {showSolution['1'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <p>Ablesen aus der Tabelle (Oberstufe, Kuchenverkauf):</p>
                                <BlockMath math="H(E_1) = 42 \text{ Personen}" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 2 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 2 – Relative Häufigkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die relative Häufigkeit des Ereignisses E₂: „Ein Besucher des
                            Sommerfests (unabhängig von der Stufe) geht zum Dosenwerfen.“</strong>
                        </p>
                        {renderInputs('2', [{ field: 'a', label: 'h(E₂):', suffix: '%', correct: 27.78, placeholder: 'z.B. 25' }])}
                        {renderButtons('2', [{ field: 'a', label: '', correct: 27.78 }])}
                        {feedback['2'] && <p className="text-sm mb-3 text-center">{feedback['2']}</p>}
                        {showSolution['2'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <BlockMath math="h(E_2) = \frac{50}{180} \approx 0{,}2778 = 27{,}78\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 3 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 3 – Kreisdiagramm</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie für jede der drei Stationen die zugehörige Gradzahl, um die
                            Gesamtverteilung der Besucher in einem Kreisdiagramm darzustellen.</strong>
                        </p>
                        {renderInputs('3', [
                            { field: 'a', label: 'Torwand:', suffix: '°', correct: 120, placeholder: 'z.B. 90' },
                            { field: 'b', label: 'Dosenwerfen:', suffix: '°', correct: 100, placeholder: 'z.B. 90' },
                            { field: 'c', label: 'Kuchenverkauf:', suffix: '°', correct: 140, placeholder: 'z.B. 90' }
                        ])}
                        {renderButtons('3', [
                            { field: 'a', label: '', correct: 120 },
                            { field: 'b', label: '', correct: 100 },
                            { field: 'c', label: '', correct: 140 }
                        ])}
                        {feedback['3'] && <p className="text-sm mb-3 text-center">{feedback['3']}</p>}
                        {showSolution['3'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 space-y-3">
                                <div className="text-center">
                                    <strong>Lösung:</strong>
                                    <BlockMath math="\text{Torwand: } \frac{60}{180} \cdot 360^\circ = 120^\circ" />
                                    <BlockMath math="\text{Dosenwerfen: } \frac{50}{180} \cdot 360^\circ = 100^\circ" />
                                    <BlockMath math="\text{Kuchenverkauf: } \frac{70}{180} \cdot 360^\circ = 140^\circ" />
                                </div>
                                <SimplePieChart data={[
                                    { label: 'Torwand', value: 60, color: '#2563eb' },
                                    { label: 'Dosenwerfen', value: 50, color: '#f97316' },
                                    { label: 'Kuchenverkauf', value: 70, color: '#16a34a' }
                                ]} />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 4 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 4 – Baumdiagramm</h2>
                        <p className="text-slate-700 mb-4">
                            Zum Abschluss des Sommerfests gibt es eine Tombola mit 15 Losen: 3 Hauptgewinne (H) und
                            12 Nieten (N). Es werden nacheinander drei Lose gezogen (ohne Zurücklegen). Die erste
                            Stufe ist bereits eingetragen.
                            <br /><br />
                            <strong>Vervollständigen Sie das Baumdiagramm um die fehlenden Übergangswahrscheinlichkeiten
                            der zweiten und dritten Stufe.</strong>
                        </p>
                        <ProbabilityTree width={700} height={400} nodes={treeNodes} edges={treeEdges}
                            stageLabels={[{ y: 140, text: '1. Los' }, { y: 250, text: '2. Los' }, { y: 360, text: '3. Los' }]} />
                    </div>

                    {/* Aufgabe 5 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 5 – Wahrscheinlichkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die prozentuale Wahrscheinlichkeit des Ereignisses E₃: „Alle drei
                            gezogenen Lose sind Hauptgewinne.“</strong>
                        </p>
                        {renderInputs('5', [{ field: 'a', label: 'P(E₃):', suffix: '%', correct: 0.22, placeholder: 'z.B. 1' }])}
                        {renderButtons('5', [{ field: 'a', label: '', correct: 0.22 }])}
                        {feedback['5'] && <p className="text-sm mb-3 text-center">{feedback['5']}</p>}
                        {showSolution['5'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfadregel):</strong>
                                <BlockMath math="P(E_3) = \frac{3}{15} \cdot \frac{2}{14} \cdot \frac{1}{13} = \frac{6}{2730} \approx 0{,}0022 = 0{,}22\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 6 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 6 – Wahrscheinlichkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die prozentuale Wahrscheinlichkeit des Ereignisses E₄: „Mindestens
                            ein Hauptgewinn wird gezogen.“</strong>
                        </p>
                        {renderInputs('6', [{ field: 'a', label: 'P(E₄):', suffix: '%', correct: 51.65, placeholder: 'z.B. 45' }])}
                        {renderButtons('6', [{ field: 'a', label: '', correct: 51.65 }])}
                        {feedback['6'] && <p className="text-sm mb-3 text-center">{feedback['6']}</p>}
                        {showSolution['6'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Gegenereignis):</strong>
                                <BlockMath math="P(E_4) = 1 - P(NNN) = 1 - \frac{12}{15} \cdot \frac{11}{14} \cdot \frac{10}{13} \approx 1 - 0{,}4835 = 0{,}5165 = 51{,}65\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 7 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 7 – Wahrscheinlichkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die prozentuale Wahrscheinlichkeit des Ereignisses E₅: „Höchstens
                            ein Hauptgewinn wird gezogen.“</strong>
                        </p>
                        {renderInputs('7', [{ field: 'a', label: 'P(E₅):', suffix: '%', correct: 91.87, placeholder: 'z.B. 85' }])}
                        {renderButtons('7', [{ field: 'a', label: '', correct: 91.87 }])}
                        {feedback['7'] && <p className="text-sm mb-3 text-center">{feedback['7']}</p>}
                        {showSolution['7'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfad- und Summenregel):</strong>
                                <p>„Höchstens ein Hauptgewinn“ = kein Hauptgewinn oder genau ein Hauptgewinn.</p>
                                <BlockMath math="P(NNN) = \frac{12}{15} \cdot \frac{11}{14} \cdot \frac{10}{13} \approx 0{,}4835" />
                                <BlockMath math="P(\text{genau 1 H}) = 3 \cdot \frac{3}{15} \cdot \frac{12}{14} \cdot \frac{11}{13} \approx 0{,}4352" />
                                <BlockMath math="P(E_5) \approx 0{,}4835 + 0{,}4352 = 0{,}9187 = 91{,}87\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 8 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 8 – Statistische Kennwerte</h2>
                        <p className="text-slate-700 mb-4">
                            Am Kuchenstand wurden während der acht Stunden des Sommerfests folgende Besucherzahlen
                            gezählt:
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="bg-slate-200">
                                        <th className="px-2 py-2 border">Stunde</th>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(t => <th key={t} className="px-2 py-2 border">{t}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="px-2 py-2 border font-semibold">Besucher</td>
                                        {[24, 31, 18, 45, 31, 27, 40, 31].map((v, i) => <td key={i} className="px-2 py-2 border">{v}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie Minimum, Maximum, Spannweite, Median, Modalwert und arithmetisches
                            Mittel der Besucherzahlen.</strong>
                        </p>
                        {renderInputs('8', [
                            { field: 'a', label: 'Minimum:', suffix: 'Bes.', correct: 18, placeholder: 'z.B. 20' },
                            { field: 'b', label: 'Maximum:', suffix: 'Bes.', correct: 45, placeholder: 'z.B. 40' },
                            { field: 'c', label: 'Spannweite:', suffix: 'Bes.', correct: 27, placeholder: 'z.B. 20' },
                            { field: 'd', label: 'Median:', suffix: 'Bes.', correct: 31, placeholder: 'z.B. 28' },
                            { field: 'e', label: 'Modalwert:', suffix: 'Bes.', correct: 31, placeholder: 'z.B. 28' },
                            { field: 'f', label: 'Arithm. Mittel:', suffix: 'Bes.', correct: 30.875, placeholder: 'z.B. 28' }
                        ])}
                        {renderButtons('8', [
                            { field: 'a', label: '', correct: 18 },
                            { field: 'b', label: '', correct: 45 },
                            { field: 'c', label: '', correct: 27 },
                            { field: 'd', label: '', correct: 31 },
                            { field: 'e', label: '', correct: 31 },
                            { field: 'f', label: '', correct: 30.875 }
                        ])}
                        {feedback['8'] && <p className="text-sm mb-3 text-center">{feedback['8']}</p>}
                        {showSolution['8'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <p>Geordnete Reihe: 18, 24, 27, 31, 31, 31, 40, 45</p>
                                <BlockMath math="\text{Minimum} = 18, \quad \text{Maximum} = 45, \quad R = 45 - 18 = 27" />
                                <BlockMath math="x_{med} = \frac{31 + 31}{2} = 31, \quad x_{mod} = 31" />
                                <BlockMath math="\bar{x} = \frac{24+31+18+45+31+27+40+31}{8} = \frac{247}{8} = 30{,}875" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 9 */}
                    <div className="border-l-4 border-blue-600 pl-5">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 9 – Kritische Reflexion</h2>
                        <p className="text-slate-700 mb-4">
                            Die Schülerzeitung veröffentlicht folgendes Balkendiagramm mit der Überschrift:
                            <br />
                            <strong>„Das Sommerfest boomt – Besucherzahlen fast verdoppelt!“</strong>
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 flex justify-center">
                            <svg width={220} height={220} viewBox="0 0 220 220">
                                <line x1={20} y1={190} x2={200} y2={190} stroke="#64748b" strokeWidth={1.5} />
                                <text x={10} y={195} fontSize={10} fill="#334155">140</text>
                                <text x={10} y={45} fontSize={10} fill="#334155">190</text>
                                <line x1={20} y1={40} x2={200} y2={40} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3,3" />
                                <rect x={60} y={190 - (150 - 140) * 3} width={40} height={(150 - 140) * 3} fill="#2563eb" />
                                <text x={80} y={190 - (150 - 140) * 3 - 6} textAnchor="middle" fontSize={11} fontWeight={700}>150</text>
                                <text x={80} y={208} textAnchor="middle" fontSize={11}>2023</text>
                                <rect x={130} y={190 - (180 - 140) * 3} width={40} height={(180 - 140) * 3} fill="#2563eb" />
                                <text x={150} y={190 - (180 - 140) * 3 - 6} textAnchor="middle" fontSize={11} fontWeight={700}>180</text>
                                <text x={150} y={208} textAnchor="middle" fontSize={11}>2024</text>
                            </svg>
                        </div>
                        <p className="text-slate-700 mb-4">
                            <strong>9.1</strong> Nehmen Sie kritisch Stellung zu der Überschrift und benennen Sie das
                            manipulative Mittel des Diagramms.
                            <br />
                            <strong>9.2</strong> Berechnen Sie die tatsächliche prozentuale Steigerung der
                            Besucherzahlen von 2023 auf 2024.
                        </p>
                        {renderInputs('9', [{ field: 'a', label: 'Tatsächliche Steigerung:', suffix: '%', correct: 20, placeholder: 'z.B. 50' }])}
                        {renderButtons('9', [{ field: 'a', label: '', correct: 20 }])}
                        {feedback['9'] && <p className="text-sm mb-3 text-center">{feedback['9']}</p>}
                        {showSolution['9'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <p>
                                    Die Überschrift ist irreführend: Die y-Achse beginnt nicht bei 0, sondern bei 140.
                                    Dadurch wirkt der Balken für 2024 optisch mehr als doppelt so hoch wie der für
                                    2023, obwohl die Besucherzahl nur leicht gestiegen ist.
                                </p>
                                <BlockMath math="\frac{180 - 150}{150} = 0{,}2 = 20\,\%" />
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
