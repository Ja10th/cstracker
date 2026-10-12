import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 bg-[#176B3A] text-white px-5 py-3 shadow-lg text-sm font-medium min-w-[220px] max-w-xs animate-fade-in"
    >
      <span className="flex-1">{toast}</span>
    </div>
  );
}
