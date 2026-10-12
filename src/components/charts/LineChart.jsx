import React from 'react';

export default function LineChart({ items = [], axisLabel }) {
  const [hoveredIndex, setHoveredIndex] = React.useState(null);
  if (!items.length) return <div className="text-xs text-gray-400 py-8 text-center">No data</div>;

  const width = 640;
  const height = 220;
  const padding = { top: 18, right: 16, bottom: 34, left: 42 };
  const values = items.map(([, value]) => Number(value) || 0);
  const max = Math.max(...values, 1);
  const tickStep = Math.max(1, Math.ceil(max / 4));
  const axisMax = tickStep * 4;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = values.map((value, index) => {
    const x = padding.left + (items.length === 1 ? chartWidth / 2 : (index / (items.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - (value / axisMax) * chartHeight;
    return { x, y, value, label: items[index][0] };
  });

  return (
    <div className="w-full">
      {axisLabel && <div className="text-[10px] text-gray-400 mb-1">{axisLabel}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44" role="img" aria-label="Nurseries by state trend">
        {[0, 1, 2, 3, 4].map((tick) => {
          const ratio = tick / 4;
          const y = padding.top + chartHeight - ratio * chartHeight;
          return <g key={tick}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#E5E7EB" strokeWidth="1" /><text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#6B736B">{Math.round(axisMax * ratio)}</text></g>;
        })}
        <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#176B3A" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => (
          <g key={point.label} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
            <circle cx={point.x} cy={point.y} r="9" fill="transparent" />
            <circle cx={point.x} cy={point.y} r={hoveredIndex === index ? 6 : 4} fill="#fff" stroke="#176B3A" strokeWidth="2" />
            {hoveredIndex === index && <g pointerEvents="none"><rect x={Math.min(Math.max(point.x - 56, padding.left), width - padding.right - 112)} y={Math.max(point.y - 42, 2)} width="112" height="30" rx="5" fill="#176B3A" /><text x={Math.min(Math.max(point.x, padding.left + 56), width - padding.right - 56)} y={Math.max(point.y - 23, 21)} textAnchor="middle" fontSize="10" fontWeight="600" fill="#fff">{point.label}: {point.value} {point.value === 1 ? 'nursery' : 'nurseries'}</text></g>}
            <text x={point.x} y={height - 10} textAnchor="middle" fontSize="10" fill="#6B736B">{point.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
