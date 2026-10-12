import React from 'react';

/**
 * Horizontal bar chart.
 * @param {Array<[string,number]>} items - array of [label, value]
 */
export default function HBar({ items = [] }) {
  if (!items.length) return <div className="text-xs text-gray-400 py-8 text-center">No data</div>;

  const max = Math.max(...items.map(([, v]) => v), 1);
  const colors = ['#176B3A', '#F26522'];

  return (
    <div className="space-y-2 w-full">
      {items.map(([label, value], i) => {
        const pct = Math.round((value / max) * 100);
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="text-xs text-gray-600 w-28 shrink-0 truncate text-right">{label}</div>
            <div className="flex-1 bg-gray-100 h-6 relative overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: colors[i % colors.length] }}
                title={`${label}: ${value.toLocaleString()}`}
              />
            </div>
            <div className="text-xs text-gray-500 tabular-nums w-12 text-right shrink-0">
              {value.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
