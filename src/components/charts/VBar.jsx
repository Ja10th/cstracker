import React from 'react';

/**
 * Vertical bar chart.
 * @param {Array<[string,number]>} items - array of [label, value]
 * @param {string} axisLabel - optional y-axis label
 */
export default function VBar({ items = [], axisLabel }) {
  if (!items.length) return <div className="text-xs text-gray-400 py-8 text-center">No data</div>;

  const max = Math.max(...items.map(([, v]) => v), 1);

  return (
    <div className="w-full">
      {axisLabel && <div className="text-[10px] text-gray-400 mb-1">{axisLabel}</div>}
      <div className="flex items-end gap-2 h-40 overflow-x-auto pb-1 border-b border-gray-200">
        {items.map(([label, value], i) => {
          const barHeight = Math.max(Math.round((Number(value) / max) * 126), 4);
          return (
            <div key={i} className="flex h-full flex-1 min-w-[28px] flex-col items-center justify-end gap-1">
              <div className="text-[9px] text-gray-500 tabular-nums leading-none h-3">
                {value > 999 ? (value / 1000).toFixed(1) + 'k' : value}
              </div>
              <div
                className={`w-full max-w-10 transition-all ${i % 2 === 0 ? 'bg-[#176B3A] hover:bg-[#0F542C]' : 'bg-[#D45417] hover:bg-[#B94612]'}`}
                style={{ height: `${barHeight}px` }}
                title={`${label}: ${value.toLocaleString()}`}
              />
              <div className="text-[9px] text-gray-500 text-center leading-tight w-full truncate">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
