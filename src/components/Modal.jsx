import React, { useEffect } from 'react';
import Icon from './Icon';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white border border-[#D9D4C8] shadow-2xl w-full max-w-xl sm:max-w-2xl lg:max-w-3xl max-h-[calc(100vh-1.5rem)] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-[#E7E1D5] shrink-0">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700"
            aria-label="Close dialog"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 sm:px-8 py-4 sm:py-7 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-[#E7E1D5] flex items-center justify-end gap-3 shrink-0 flex-wrap">
            {footer}
          </div>
        )}
      </section>
    </div>
  );
}
