import React from 'react';

export default function AreaChart({ items = [], axisLabel }) {
  if (!items.length) return <div className="text-xs text-gray-400 py-8 text-center">No data</div>;

  const width = 640;
  const height = 220;
  const padding = { top: 18, right: 16, bottom: 34, left: 42 };
  const values = items.map(([, value]) => Number(value) || 0);
  const max = Math.max(...values, 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = values.map((value, index) => ({
    x: padding.left + (items.length === 1 ? chartWidth / 2 : (index / (items.length - 1)) * chartWidth),
    y: padding.top + chartHeight - (value / max) * chartHeight,
    value,
    label: items[index][0],
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `${padding.left},${padding.top + chartHeight} ${line} ${width - padding.right},${padding.top + chartHeight}`;

  return (
    <div className="w-full">
      {axisLabel && <div className="text-[10px] text-gray-400 mb-1">{axisLabel}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44" role="img" aria-label="Production trend area chart">
        <defs><linearGradient id="production-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#176B3A" stopOpacity="0.3" /><stop offset="100%" stopColor="#176B3A" stopOpacity="0.02" /></linearGradient></defs>
        {[0, 0.5, 1].map((ratio) => { const y = padding.top + chartHeight - ratio * chartHeight; return <line key={ratio} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#E5E7EB" strokeWidth="1" />; })}
        <polygon points={area} fill="url(#production-area)" />
        <polyline points={line} fill="none" stroke="#176B3A" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point) => <g key={point.label}><circle cx={point.x} cy={point.y} r="4" fill="#fff" stroke="#176B3A" strokeWidth="2" /><text x={point.x} y={height - 10} textAnchor="middle" fontSize="10" fill="#6B736B">{point.label}</text></g>)}
      </svg>
    </div>
  );
}
