import React from "react";

export default function KpiCard({ label, value, sublabel, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={[
        "bg-white border border-gray-200 p-5 text-left w-full",
        onClick
          ? "hover:border-[#176B3A] hover:shadow-sm cursor-pointer transition-all"
          : "",
      ].join(" ")}
    >
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-gray-900 pt-1 tabular-nums">
        {value}
      </div>
    </Tag>
  );
}
