import React from 'react';

export interface PieSlice {
    label: string;
    value: number;
    color: string;
}

interface SimplePieChartProps {
    data: PieSlice[];
    size?: number;
}

export default function SimplePieChart({ data, size = 220 }: SimplePieChartProps) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = size / 2;
    const cx = r;
    const cy = r;
    let angle = -90;

    const toXY = (deg: number): [number, number] => {
        const rad = (deg * Math.PI) / 180;
        return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    };

    const slices = data.map(d => {
        const share = total > 0 ? d.value / total : 0;
        const sweep = share * 360;
        const start = angle;
        const end = angle + sweep;
        angle = end;
        const [x1, y1] = toXY(start);
        const [x2, y2] = toXY(end);
        const largeArc = sweep > 180 ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        return { ...d, path, share };
    });

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {slices.map((s, i) => (
                    <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth={1.5} />
                ))}
            </svg>
            <ul className="space-y-1.5 text-sm">
                {slices.map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="font-medium">{s.label}</span>
                        <span className="text-slate-500">({s.share.toLocaleString('de-DE', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 })})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
