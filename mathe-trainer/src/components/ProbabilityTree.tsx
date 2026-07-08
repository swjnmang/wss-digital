import React, { useState } from 'react';

export interface TreeNode {
    id: string;
    x: number;
    y: number;
    label: string;
}

export interface TreeEdge {
    from: string;
    to: string;
    prob: number;
    display: string;
    given?: boolean;
}

interface ProbabilityTreeProps {
    width: number;
    height: number;
    nodes: TreeNode[];
    edges: TreeEdge[];
    stageLabels?: { y: number; text: string }[];
}

// Akzeptiert Brüche ("2/15"), Dezimalzahlen ("0,13") und Prozentangaben ("13,3" oder "13,3%")
const parseProb = (s: string): number => {
    const t = s.trim().replace(',', '.');
    if (!t) return NaN;
    if (t.includes('/')) {
        const parts = t.split('/');
        const a = parseFloat(parts[0]);
        const b = parseFloat(parts[1]);
        if (!b || isNaN(a)) return NaN;
        return a / b;
    }
    const v = parseFloat(t.replace('%', ''));
    if (isNaN(v)) return NaN;
    if (s.includes('%') || v > 1) return v / 100;
    return v;
};

export default function ProbabilityTree({ width, height, nodes, edges, stageLabels }: ProbabilityTreeProps) {
    const [values, setValues] = useState<Record<number, string>>({});
    const [results, setResults] = useState<Record<number, boolean> | null>(null);
    const [showSolution, setShowSolution] = useState(false);

    const nodeById = (id: string) => nodes.find(n => n.id === id)!;
    const inputEdges = edges.filter(e => !e.given);

    const check = () => {
        const res: Record<number, boolean> = {};
        edges.forEach((e, i) => {
            if (e.given) return;
            const v = parseProb(values[i] ?? '');
            res[i] = !isNaN(v) && Math.abs(v - e.prob) <= 0.006;
        });
        setResults(res);
    };

    const correctCount = results ? Object.values(results).filter(Boolean).length : 0;

    return (
        <div>
            <div className="overflow-x-auto">
                <div className="relative mx-auto" style={{ width, height }}>
                    <svg className="absolute inset-0" width={width} height={height}>
                        {edges.map((e, i) => {
                            const a = nodeById(e.from);
                            const b = nodeById(e.to);
                            return (
                                <line
                                    key={i}
                                    x1={a.x} y1={a.y + 16}
                                    x2={b.x} y2={b.y - 16}
                                    stroke="#64748b"
                                    strokeWidth={1.8}
                                />
                            );
                        })}
                        {nodes.map(n => (
                            <g key={n.id}>
                                <circle cx={n.x} cy={n.y} r={16} fill="#ffffff" stroke="#334155" strokeWidth={1.8} />
                                <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#0f172a">
                                    {n.label}
                                </text>
                            </g>
                        ))}
                        {stageLabels?.map((s, i) => (
                            <text key={i} x={6} y={s.y} fontSize={12} fill="#94a3b8" fontStyle="italic">
                                {s.text}
                            </text>
                        ))}
                    </svg>
                    {edges.map((e, i) => {
                        const a = nodeById(e.from);
                        const b = nodeById(e.to);
                        const mx = (a.x + b.x) / 2;
                        const my = (a.y + b.y) / 2;
                        if (e.given || showSolution) {
                            return (
                                <span
                                    key={i}
                                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-sm font-semibold border ${
                                        e.given
                                            ? 'bg-slate-100 border-slate-300 text-slate-700'
                                            : 'bg-blue-100 border-blue-300 text-blue-800'
                                    }`}
                                    style={{ left: mx, top: my }}
                                >
                                    {e.display}
                                </span>
                            );
                        }
                        const state = results ? results[i] : null;
                        return (
                            <input
                                key={i}
                                type="text"
                                value={values[i] ?? ''}
                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                                    setValues({ ...values, [i]: ev.target.value });
                                    setResults(null);
                                }}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 px-1 py-0.5 text-center text-sm border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    state === true
                                        ? 'border-green-500 bg-green-50'
                                        : state === false
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-slate-400'
                                }`}
                                style={{ left: mx, top: my }}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-3">
                <button
                    onClick={check}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                    Baumdiagramm prüfen
                </button>
                <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                >
                    {showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
                </button>
            </div>
            {results && !showSolution && (
                <p className="text-sm text-center mt-2">
                    {correctCount === inputEdges.length
                        ? '✅ Alle Übergangswahrscheinlichkeiten sind richtig!'
                        : `${correctCount} von ${inputEdges.length} Übergangswahrscheinlichkeiten richtig – rot markierte Felder prüfen.`}
                </p>
            )}
            <p className="text-xs text-slate-500 text-center mt-2">
                Eingabe als Bruch (z. B. 2/15), Dezimalzahl (z. B. 0,25) oder Prozent (z. B. 25 %) möglich.
            </p>
        </div>
    );
}
