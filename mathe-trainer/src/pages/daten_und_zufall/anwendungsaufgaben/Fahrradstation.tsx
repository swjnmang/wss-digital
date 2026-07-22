import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ProbabilityTree, { TreeEdge, TreeNode } from '../../../components/ProbabilityTree';
import SimpleBarChart from '../../../components/SimpleBarChart';

interface FieldCheck {
    field: string;
    label: string;
    suffix?: string;
    correct: number;
    placeholder?: string;
}

const treeNodes: TreeNode[] = [
    { id: 'start', x: 375, y: 30, label: '' },
    { id: 'E1', x: 125, y: 140, label: 'E' },
    { id: 'T1', x: 375, y: 140, label: 'T' },
    { id: 'R1', x: 625, y: 140, label: 'R' },
    { id: 'EE', x: 50, y: 250, label: 'E' },
    { id: 'ET', x: 125, y: 250, label: 'T' },
    { id: 'ER', x: 200, y: 250, label: 'R' },
    { id: 'TE', x: 300, y: 250, label: 'E' },
    { id: 'TT', x: 375, y: 250, label: 'T' },
    { id: 'TR', x: 450, y: 250, label: 'R' },
    { id: 'RE', x: 550, y: 250, label: 'E' },
    { id: 'RT', x: 625, y: 250, label: 'T' },
    { id: 'RR', x: 700, y: 250, label: 'R' }
];

const treeEdges: TreeEdge[] = [
    { from: 'start', to: 'E1', prob: 0.4, display: '0,4' },
    { from: 'start', to: 'T1', prob: 0.44, display: '0,44' },
    { from: 'start', to: 'R1', prob: 0.16, display: '0,16' },
    { from: 'E1', to: 'EE', prob: 0.4, display: '0,4' },
    { from: 'E1', to: 'ET', prob: 0.44, display: '0,44' },
    { from: 'E1', to: 'ER', prob: 0.16, display: '0,16' },
    { from: 'T1', to: 'TE', prob: 0.4, display: '0,4' },
    { from: 'T1', to: 'TT', prob: 0.44, display: '0,44' },
    { from: 'T1', to: 'TR', prob: 0.16, display: '0,16' },
    { from: 'R1', to: 'RE', prob: 0.4, display: '0,4' },
    { from: 'R1', to: 'RT', prob: 0.44, display: '0,44' },
    { from: 'R1', to: 'RR', prob: 0.16, display: '0,16' }
];

const parseInput = (value: string) => {
    const raw = value.trim();
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    return parseFloat(normalized);
};

export default function Fahrradstation() {
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
                    <h1 className="text-3xl font-bold text-blue-700">Die Fahrradstation</h1>
                    <p className="text-slate-600 -mt-4">
                        Der Fahrradverleih „CityBike“ vermietet an einem Ausflugsort E-Bikes (E), Trekkingräder (T)
                        und Rennräder (R). Die Tabelle zeigt die Vermietungen an einem Wochenende.
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded p-4 overflow-x-auto -mt-4">
                        <table className="w-full text-sm text-center">
                            <thead>
                                <tr className="bg-slate-200">
                                    <th className="px-2 py-2 border text-left">Tag</th>
                                    <th className="px-2 py-2 border">E-Bike</th>
                                    <th className="px-2 py-2 border">Trekkingrad</th>
                                    <th className="px-2 py-2 border">Rennrad</th>
                                    <th className="px-2 py-2 border">Summe</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-white">
                                    <td className="px-2 py-2 border text-left font-semibold">Samstag</td>
                                    <td className="px-2 py-2 border">45</td>
                                    <td className="px-2 py-2 border">60</td>
                                    <td className="px-2 py-2 border">15</td>
                                    <td className="px-2 py-2 border font-semibold">120</td>
                                </tr>
                                <tr className="bg-blue-50">
                                    <td className="px-2 py-2 border text-left font-semibold">Sonntag</td>
                                    <td className="px-2 py-2 border">55</td>
                                    <td className="px-2 py-2 border">50</td>
                                    <td className="px-2 py-2 border">25</td>
                                    <td className="px-2 py-2 border font-semibold">130</td>
                                </tr>
                                <tr className="bg-slate-200 font-semibold">
                                    <td className="px-2 py-2 border text-left">Summe</td>
                                    <td className="px-2 py-2 border">100</td>
                                    <td className="px-2 py-2 border">110</td>
                                    <td className="px-2 py-2 border">40</td>
                                    <td className="px-2 py-2 border">250</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Aufgabe 1 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 1 – Absolute Häufigkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die absolute Häufigkeit des Ereignisses E₆: „Ein Kunde least am
                            Samstag ein Trekkingrad.“</strong>
                        </p>
                        {renderInputs('1', [{ field: 'a', label: 'H(E₆):', suffix: 'Personen', correct: 60, placeholder: 'z.B. 50' }])}
                        {renderButtons('1', [{ field: 'a', label: '', correct: 60 }])}
                        {feedback['1'] && <p className="text-sm mb-3 text-center">{feedback['1']}</p>}
                        {showSolution['1'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <BlockMath math="H(E_6) = 60 \text{ Personen}" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 2 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 2 – Relative Häufigkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die relative Häufigkeit des Ereignisses E₇: „Ein Kunde (unabhängig
                            vom Tag) mietet ein Rennrad.“</strong>
                        </p>
                        {renderInputs('2', [{ field: 'a', label: 'h(E₇):', suffix: '%', correct: 16, placeholder: 'z.B. 20' }])}
                        {renderButtons('2', [{ field: 'a', label: '', correct: 16 }])}
                        {feedback['2'] && <p className="text-sm mb-3 text-center">{feedback['2']}</p>}
                        {showSolution['2'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <BlockMath math="h(E_7) = \frac{40}{250} = 0{,}16 = 16\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 3 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 3 – Balkendiagramm</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie die Gesamtzahl der vermieteten Räder je Typ (Summe über beide Tage),
                            um sie in einem Balkendiagramm darzustellen.</strong>
                        </p>
                        {renderInputs('3', [
                            { field: 'a', label: 'E-Bike gesamt:', suffix: 'Stk.', correct: 100, placeholder: 'z.B. 90' },
                            { field: 'b', label: 'Trekkingrad gesamt:', suffix: 'Stk.', correct: 110, placeholder: 'z.B. 90' },
                            { field: 'c', label: 'Rennrad gesamt:', suffix: 'Stk.', correct: 40, placeholder: 'z.B. 30' }
                        ])}
                        {renderButtons('3', [
                            { field: 'a', label: '', correct: 100 },
                            { field: 'b', label: '', correct: 110 },
                            { field: 'c', label: '', correct: 40 }
                        ])}
                        {feedback['3'] && <p className="text-sm mb-3 text-center">{feedback['3']}</p>}
                        {showSolution['3'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 space-y-3">
                                <div className="text-center"><strong>Lösung:</strong> Spaltensummen aus der Tabelle: 100, 110, 40</div>
                                <SimpleBarChart data={[
                                    { label: 'E-Bike', value: 100, color: '#2563eb' },
                                    { label: 'Trekking', value: 110, color: '#f97316' },
                                    { label: 'Rennrad', value: 40, color: '#16a34a' }
                                ]} unit=" Stk." />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 4 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 4 – Baumdiagramm</h2>
                        <p className="text-slate-700 mb-4">
                            Aus den relativen Häufigkeiten der Tabelle ergibt sich für einen zufällig ausgewählten
                            Kunden: E-Bike 40 %, Trekkingrad 44 %, Rennrad 16 %. Für eine Kundenbefragung werden
                            nacheinander zwei Kunden zufällig ausgewählt (die Wahrscheinlichkeiten bleiben für beide
                            Kunden gleich).
                            <br /><br />
                            <strong>Tragen Sie alle Übergangswahrscheinlichkeiten in das Baumdiagramm ein.</strong>
                        </p>
                        <ProbabilityTree width={750} height={290} nodes={treeNodes} edges={treeEdges}
                            stageLabels={[{ y: 145, text: '1. Kunde' }, { y: 255, text: '2. Kunde' }]} />
                    </div>

                    {/* Aufgabe 5 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 5 – Wahrscheinlichkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die Wahrscheinlichkeit des Ereignisses E₈: „Beide befragten Kunden
                            mieten ein E-Bike.“</strong>
                        </p>
                        {renderInputs('5', [{ field: 'a', label: 'P(E₈):', suffix: '%', correct: 16, placeholder: 'z.B. 20' }])}
                        {renderButtons('5', [{ field: 'a', label: '', correct: 16 }])}
                        {feedback['5'] && <p className="text-sm mb-3 text-center">{feedback['5']}</p>}
                        {showSolution['5'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfadregel):</strong>
                                <BlockMath math="P(E_8) = 0{,}4 \cdot 0{,}4 = 0{,}16 = 16\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 6 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 6 – Wahrscheinlichkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die Wahrscheinlichkeit des Ereignisses E₉: „Mindestens ein Kunde
                            mietet ein Trekkingrad.“</strong>
                        </p>
                        {renderInputs('6', [{ field: 'a', label: 'P(E₉):', suffix: '%', correct: 68.64, placeholder: 'z.B. 60' }])}
                        {renderButtons('6', [{ field: 'a', label: '', correct: 68.64 }])}
                        {feedback['6'] && <p className="text-sm mb-3 text-center">{feedback['6']}</p>}
                        {showSolution['6'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Gegenereignis):</strong>
                                <BlockMath math="P(E_9) = 1 - 0{,}56^2 = 1 - 0{,}3136 = 0{,}6864 = 68{,}64\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 7 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 7 – Wahrscheinlichkeit</h2>
                        <p className="text-slate-700 mb-4">
                            <strong>Berechnen Sie die Wahrscheinlichkeit des Ereignisses E₁₀: „Genau ein Kunde mietet
                            ein Rennrad.“</strong>
                        </p>
                        {renderInputs('7', [{ field: 'a', label: 'P(E₁₀):', suffix: '%', correct: 26.88, placeholder: 'z.B. 20' }])}
                        {renderButtons('7', [{ field: 'a', label: '', correct: 26.88 }])}
                        {feedback['7'] && <p className="text-sm mb-3 text-center">{feedback['7']}</p>}
                        {showSolution['7'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung (Pfad- und Summenregel):</strong>
                                <BlockMath math="P(E_{10}) = 2 \cdot 0{,}16 \cdot 0{,}84 = 0{,}2688 = 26{,}88\,\%" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 8 */}
                    <div className="border-l-4 border-blue-600 pl-5 pb-8 border-b">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 8 – Statistische Kennwerte</h2>
                        <p className="text-slate-700 mb-4">
                            Bei neun zufällig ausgewählten Ausleihen wurde folgende Mietdauer (in Minuten) erfasst:
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="bg-slate-200">
                                        <th className="px-2 py-2 border">Ausleihe</th>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => <th key={t} className="px-2 py-2 border">{t}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="px-2 py-2 border font-semibold">Minuten</td>
                                        {[45, 60, 30, 90, 60, 55, 40, 60, 75].map((v, i) => <td key={i} className="px-2 py-2 border">{v}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-slate-700 mb-4">
                            <strong>Bestimmen Sie Minimum, Maximum, Spannweite, Median, Modalwert und arithmetisches
                            Mittel der Mietdauer.</strong>
                        </p>
                        {renderInputs('8', [
                            { field: 'a', label: 'Minimum:', suffix: 'Min.', correct: 30, placeholder: 'z.B. 35' },
                            { field: 'b', label: 'Maximum:', suffix: 'Min.', correct: 90, placeholder: 'z.B. 80' },
                            { field: 'c', label: 'Spannweite:', suffix: 'Min.', correct: 60, placeholder: 'z.B. 50' },
                            { field: 'd', label: 'Median:', suffix: 'Min.', correct: 60, placeholder: 'z.B. 55' },
                            { field: 'e', label: 'Modalwert:', suffix: 'Min.', correct: 60, placeholder: 'z.B. 55' },
                            { field: 'f', label: 'Arithm. Mittel:', suffix: 'Min.', correct: 57.22, placeholder: 'z.B. 55' }
                        ])}
                        {renderButtons('8', [
                            { field: 'a', label: '', correct: 30 },
                            { field: 'b', label: '', correct: 90 },
                            { field: 'c', label: '', correct: 60 },
                            { field: 'd', label: '', correct: 60 },
                            { field: 'e', label: '', correct: 60 },
                            { field: 'f', label: '', correct: 57.22 }
                        ])}
                        {feedback['8'] && <p className="text-sm mb-3 text-center">{feedback['8']}</p>}
                        {showSolution['8'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <p>Geordnete Reihe: 30, 40, 45, 55, 60, 60, 60, 75, 90</p>
                                <BlockMath math="\text{Minimum} = 30, \quad \text{Maximum} = 90, \quad R = 90 - 30 = 60" />
                                <BlockMath math="x_{med} = 60, \quad x_{mod} = 60" />
                                <BlockMath math="\bar{x} = \frac{45+60+30+90+60+55+40+60+75}{9} = \frac{515}{9} \approx 57{,}22" />
                            </div>
                        )}
                    </div>

                    {/* Aufgabe 9 */}
                    <div className="border-l-4 border-blue-600 pl-5">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Aufgabe 9 – Kritische Reflexion</h2>
                        <p className="text-slate-700 mb-4">
                            „CityBike“ wirbt: <strong>„Durchschnittlich nur 14,66 km Anfahrt – unsere Station liegt
                            zentral!“</strong> Grundlage sind die Wohnorte von sieben zufällig befragten Kunden mit
                            folgenden Entfernungen zur Station:
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="bg-slate-200">
                                        <th className="px-2 py-2 border">Kunde</th>
                                        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(t => <th key={t} className="px-2 py-2 border">{t}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="px-2 py-2 border font-semibold">Entfernung</td>
                                        {['1,2 km', '0,8 km', '2,1 km', '1,5 km', '0,9 km', '95 km', '1,1 km'].map((v, i) => <td key={i} className="px-2 py-2 border">{v}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-slate-700 mb-4">
                            <strong>9.1</strong> Nehmen Sie kritisch Stellung zu der Werbeaussage.
                            <br />
                            <strong>9.2</strong> Berechnen Sie eine Kennzahl, die die tatsächliche Lage der Kundschaft
                            besser beschreibt.
                        </p>
                        {renderInputs('9', [{ field: 'a', label: 'Bessere Kennzahl (Median):', suffix: 'km', correct: 1.2, placeholder: 'z.B. 2' }])}
                        {renderButtons('9', [{ field: 'a', label: '', correct: 1.2 }])}
                        {feedback['9'] && <p className="text-sm mb-3 text-center">{feedback['9']}</p>}
                        {showSolution['9'] && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-slate-700 text-center">
                                <strong>Lösung:</strong>
                                <p>
                                    Die Aussage ist irreführend: Der Wert 95 km ist ein deutlicher Ausreißer und
                                    verzerrt das arithmetische Mittel stark nach oben. Der Median ist hier robuster.
                                </p>
                                <p>Geordnete Reihe: 0,8 – 0,9 – 1,1 – <strong>1,2</strong> – 1,5 – 2,1 – 95 (km)</p>
                                <BlockMath math="x_{med} = 1{,}2 \text{ km}" />
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
