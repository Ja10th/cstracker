import React, { useRef, useEffect } from 'react';
import Icon from './Icon';

export default function Drawer({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-0 ml-auto h-full w-full max-w-[520px] bg-white border-l border-gray-200 shadow-2xl flex flex-col p-0 backdrop:bg-black/40"
      onCancel={onClose}
      style={{ maxHeight: '100vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-700"
          aria-label="Close drawer"
        >
          <Icon name="close" className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {children}
      </div>
    </dialog>
  );
}
