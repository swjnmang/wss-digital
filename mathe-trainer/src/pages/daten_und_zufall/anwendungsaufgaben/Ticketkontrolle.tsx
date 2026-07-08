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
    { id: 'S1', x: 180, y: 135, label: 'S' },
    { id: 'T1', x: 520, y: 135, label: 'T' },
    { id: 'SS', x: 100, y: 245, label: 'S' },
    { id: 'ST', x: 260, y: 245, label: 'T' },
    { id: 'TS', x: 440, y: 245, label: 'S' },
    { id: 'TT', x: 600, y: 245, label: 'T' },
    { id: 'SST', x: 100, y: 355, label: 'T' },
    { id: 'STS', x: 220, y: 355, label: 'S' },
    { id: 'STT', x: 305, y: 355, label: 'T' },
    { id: 'TSS', x: 400, y: 355, label: 'S' },
    { id: 'TST', x: 485, y: 355, label: 'T' },
    { id: 'TTS', x: 560, y: 355, label: 'S' },
    { id: 'TTT', x: 645, y: 355, label: 'T' }
];

const treeEdges: TreeEdge[] = [
    { from: 'start', to: 'S1', prob: 2 / 15, display: '2/15', given: true },
    { from: 'start', to: 'T1', prob: 13 / 15, display: '13/15', given: true },
    { from: 'S1', to: 'SS', prob: 1 / 14, display: '1/14' },
    { from: 'S1', to: 'ST', prob: 13 / 14, display: '13/14' },
    { from: 'T1', to: 'TS', prob: 2 / 14, display: '2/14' },
    { from: 'T1', to: 'TT', prob: 12 / 14, display: '12/14' },
    { from: 'SS', to: 'SST', prob: 1, display: '1' },
    { from: 'ST', to: 'STS', prob: 1 / 13, display: '1/13' },
    { from: 'ST', to: 'STT', prob: 12 / 13, display: '12/13' },
    { from: 'TS', to: 'TSS', prob: 1 / 13, display: '1/13' },
    { from: 'TS', to: 'TST', prob: 12 / 13, display: '12/13' },
    { from: 'TT', to: 'TTS', prob: 2 / 13, display: '2/13' },
    { from: 'TT', to: 'TTT', prob: 11 / 13, display: '11/13' }
];

const parseInput = (value: string) => {
    const raw = value.trim();
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    return parseFloat(normalized);
};

export default function Ticketkontrolle() {
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
                    <h1 className="text-3xl font-bold text-blue-700">Die Ticketkontrolle</h1>

                    {/* Aufgabe 1 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 1</h2>
                        <p className="text-slate-700 mb-4">
                            In einem Stadtbus befinden sich unter den 15 Fahrgästen zwei Personen ohne gültiges
                            Ticket (S = Schwarzfahrer, T = Ticketinhaber). Kontrolleurin Frau Sommer bittet
                            nacheinander drei zufällig ausgewählte Personen, ihren Fahrschein vorzuzeigen.
                            <br /><br />
                            Das unvollständige Baumdiagramm zeigt die zufällige Auswahl der kontrollierten
                            Fahrgäste. Die erste Stufe ist bereits eingetragen.
                            <br /><br />
                            <strong>Tragen Sie alle fehlenden Übergangswahrscheinlichkeiten der zweiten und dritten
                            Stufe ein.</strong>
                            <br />
                            <em className="text-slate-500 text-sm">Hinweis: Wurden bereits beide Schwarzfahrer
                            kontrolliert, ist die dritte kontrollierte Person mit Sicherheit ein Ticketinhaber.</em>
                        </p>
                        <ProbabilityTree width={700} height={400} nodes={treeNodes} edges={treeEdges}
                            stageLabels={[{ y: 140, text: '1. Person' }, { y: 250, text: '2. Person' }, { y: 360, text: '3. Person' }]} />
                    </div>

                    {/* Aufgabe 2 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 2</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die prozentuale Wahrscheinlichkeit für das Ereignis E₁: „Bei der
                            Kontrolle haben alle ein gültiges Ticket.“</strong>
                        </p>
                        {renderInputs('2', [{ field: 'a', label: 'P(E₁):', suffix: '%', correct: 62.86, placeholder: 'z.B. 55' }])}
                        {renderButtons('2', [{ field: 'a', label: '', correct: 62.86 }])}
                        {feedback['2'] && <p className="text-sm mb-3 text-center">{feedback['2']}</p>}
                        {showSolution['2'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfadregel):</strong>
                                <BlockMath math="P(E_1) = P(TTT) = \frac{13}{15} \cdot \frac{12}{14} \cdot \frac{11}{13} = \frac{22}{35} \approx 0{,}6286 = 62{,}86\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 3 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 3</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die prozentuale Wahrscheinlichkeit für das Ereignis E₂: „Bei der
                            Kontrolle werden beide Schwarzfahrer erwischt.“</strong>
                        </p>
                        {renderInputs('3', [{ field: 'a', label: 'P(E₂):', suffix: '%', correct: 2.86, placeholder: 'z.B. 4' }])}
                        {renderButtons('3', [{ field: 'a', label: '', correct: 2.86 }])}
                        {feedback['3'] && <p className="text-sm mb-3 text-center">{feedback['3']}</p>}
                        {showSolution['3'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfad- und Summenregel):</strong>
                                <BlockMath math="P(E_2) = P(SST) + P(STS) + P(TSS)" />
                                <BlockMath math="= \frac{2}{15} \cdot \frac{1}{14} \cdot 1 + \frac{2}{15} \cdot \frac{13}{14} \cdot \frac{1}{13} + \frac{13}{15} \cdot \frac{2}{14} \cdot \frac{1}{13}" />
                                <BlockMath math="= \frac{3}{105} = \frac{1}{35} \approx 0{,}0286 = 2{,}86\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 4 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 4</h2>
                        <p className="text-slate-700 mb-4">
                            Die nachfolgende Tabelle zeigt die Anzahl der erwischten Schwarzfahrer während einer Woche:
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="bg-slate-200">
                                        <th className="px-2 py-2 border">Tag</th>
                                        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(t => <th key={t} className="px-2 py-2 border">{t}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="px-2 py-2 border font-semibold">Anzahl</td>
                                        {[14, 8, 7, 11, 19, 26, 20].map((v, i) => <td key={i} className="px-2 py-2 border">{v}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie das arithmetische Mittel, den Median und die Spannweite der
                            erwischten Schwarzfahrer.</strong>
                        </p>
                        {renderInputs('4', [
                            { field: 'a', label: 'Arithmetisches Mittel:', correct: 15, placeholder: 'z.B. 12' },
                            { field: 'b', label: 'Median:', correct: 14, placeholder: 'z.B. 12' },
                            { field: 'c', label: 'Spannweite:', correct: 19, placeholder: 'z.B. 15' }
                        ])}
                        {renderButtons('4', [
                            { field: 'a', label: '', correct: 15 },
                            { field: 'b', label: '', correct: 14 },
                            { field: 'c', label: '', correct: 19 }
                        ])}
                        {feedback['4'] && <p className="text-sm mb-3 text-center">{feedback['4']}</p>}
                        {showSolution['4'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <BlockMath math="\bar{x} = \frac{14 + 8 + 7 + 11 + 19 + 26 + 20}{7} = \frac{105}{7} = 15" />
                                <p>Geordnete Reihe: 7, 8, 11, <strong>14</strong>, 19, 20, 26</p>
                                <BlockMath math="x_{med} = 14" />
                                <BlockMath math="R = 26 - 7 = 19" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 5 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 5</h2>
                        <p className="text-slate-700 mb-4">
                            Um zu entscheiden, ob auf einer Linie zusätzliche Busse eingesetzt werden müssen, führt
                            die Betreibergesellschaft eine Fahrgastzählung durch:
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="bg-slate-200">
                                        <th className="px-2 py-2 border text-left">Zeitraum</th>
                                        <th className="px-2 py-2 border">Erwachsene</th>
                                        <th className="px-2 py-2 border">Jugendliche</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white"><td className="px-2 py-2 border text-left">06:00 bis 07:00 Uhr</td><td className="px-2 py-2 border">140</td><td className="px-2 py-2 border">25</td></tr>
                                    <tr className="bg-blue-50"><td className="px-2 py-2 border text-left">07:00 bis 08:00 Uhr</td><td className="px-2 py-2 border">290</td><td className="px-2 py-2 border">585</td></tr>
                                    <tr className="bg-white"><td className="px-2 py-2 border text-left">08:00 bis 09:00 Uhr</td><td className="px-2 py-2 border">330</td><td className="px-2 py-2 border">20</td></tr>
                                    <tr className="bg-blue-50"><td className="px-2 py-2 border text-left">09:00 bis 10:00 Uhr</td><td className="px-2 py-2 border">175</td><td className="px-2 py-2 border">35</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die absolute Häufigkeit für das Ereignis E₃: „Ein Erwachsener
                            benutzt den Bus zwischen 06:00 und 09:00 Uhr.“</strong>
                        </p>
                        {renderInputs('5', [{ field: 'a', label: 'H(E₃):', suffix: 'Erwachsene', correct: 760, placeholder: 'z.B. 700' }])}
                        {renderButtons('5', [{ field: 'a', label: '', correct: 760 }])}
                        {feedback['5'] && <p className="text-sm mb-3 text-center">{feedback['5']}</p>}
                        {showSolution['5'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <BlockMath math="H(E_3) = 140 + 290 + 330 = 760 \text{ Erwachsene}" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 6 */}
                    <div className="border-l-4 border-blue-600 pl-5">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 6</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die relative Häufigkeit, bezogen auf die Gesamtheit aller gezählten
                            Fahrgäste, für das Ereignis E₄: „Ein Jugendlicher benutzt den Bus zwischen 6 und 8 Uhr.“</strong>
                        </p>
                        {renderInputs('6', [{ field: 'a', label: 'h(E₄):', suffix: '%', correct: 38.13, placeholder: 'z.B. 35' }])}
                        {renderButtons('6', [{ field: 'a', label: '', correct: 38.13 }])}
                        {feedback['6'] && <p className="text-sm mb-3 text-center">{feedback['6']}</p>}
                        {showSolution['6'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <p>Gesamtzahl aller Fahrgäste: 140 + 25 + 290 + 585 + 330 + 20 + 175 + 35 = 1.600</p>
                                <BlockMath math="h(E_4) = \frac{25 + 585}{1.600} = \frac{610}{1.600} = 0{,}38125 \approx 38{,}13\,\%" />
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
