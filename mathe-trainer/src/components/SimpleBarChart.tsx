import React from 'react';

export interface BarDatum {
    label: string;
    value: number;
    color?: string;
}

interface SimpleBarChartProps {
    data: BarDatum[];
    maxValue?: number;
    height?: number;
    unit?: string;
}

export default function SimpleBarChart({ data, maxValue, height = 220, unit = '' }: SimpleBarChartProps) {
    const max = maxValue ?? Math.max(...data.map(d => d.value)) * 1.15;
    const barWidth = 56;
    const gap = 28;
    const width = data.length * (barWidth + gap) + gap;
    const chartHeight = height - 40;

    return (
        <div className="overflow-x-auto">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto block">
                <line x1={gap - 10} y1={chartHeight} x2={width - gap + 10} y2={chartHeight} stroke="#94a3b8" strokeWidth={1.5} />
                {data.map((d, i) => {
                    const barH = max > 0 ? (d.value / max) * (chartHeight - 10) : 0;
                    const x = gap + i * (barWidth + gap);
                    const y = chartHeight - barH;
                    return (
                        <g key={i}>
                            <rect x={x} y={y} width={barWidth} height={barH} fill={d.color ?? '#2563eb'} rx={3} />
                            <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">
                                {d.value}{unit}
                            </text>
                            <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" fontSize={12} fill="#334155">
                                {d.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
