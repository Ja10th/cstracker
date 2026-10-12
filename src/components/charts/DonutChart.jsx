import React from 'react';

const DEFAULT_COLORS = ['#176B3A', '#E5B83D', '#FF5A1F', '#B3261E', '#1F5FA8', '#6B736B'];

/**
 * Donut / Pie Chart Component
 * @param {Array<[string, number]>} items - Array of [label, value]
 * @param {string[]} colors - Optional array of hex colors
 * @param {string} centerText - Center primary text
 * @param {string} centerSub - Center secondary text
 */
export default function DonutChart({ items = [], colors = DEFAULT_COLORS, centerText, centerSub }) {
  if (!items.length) {
    return <div className="text-xs text-gray-400 py-8 text-center">No data available</div>;
  }

  const total = items.reduce((sum, [, val]) => sum + (Number(val) || 0), 0);
  if (total === 0) {
    return <div className="text-xs text-gray-400 py-8 text-center">No data available</div>;
  }

  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulated = 0;
  const slices = items.map(([label, value], idx) => {
    const val = Number(value) || 0;
    const pct = val / total;
    const dashLength = pct * circumference;
    const offset = accumulated * circumference;
    accumulated += pct;

    return {
      label,
      value: val,
      percentage: Math.round(pct * 100),
      color: colors[idx % colors.length],
      dashArray: `${dashLength} ${circumference - dashLength}`,
      dashOffset: -offset,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
          />
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.dashArray}
              strokeDashoffset={slice.dashOffset}
              className="transition-all duration-300"
            />
          ))}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-bold text-gray-900 leading-tight">
            {centerText !== undefined ? centerText : total.toLocaleString()}
          </span>
          <span className="text-[10px] uppercase font-semibold text-[#8B8576] tracking-wider mt-0.5">
            {centerSub || 'Total'}
          </span>
        </div>
      </div>

      {/* Legend & Percentages */}
      <div className="flex-1 w-full space-y-2">
        {slices.map((slice, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-gray-700 truncate font-medium">{slice.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 font-mono">
              <span className="text-gray-900 font-semibold">{slice.value.toLocaleString()}</span>
              <span className="text-gray-400 text-[11px] w-9 text-right">({slice.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
