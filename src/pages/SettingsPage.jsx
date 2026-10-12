import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icon';
import Modal from '../components/Modal';

export default function SettingsPage() {
  const { resetData, data } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleReset() {
    resetData();
    setConfirmOpen(false);
  }

  const audit = [...(data.audit || [])].reverse();

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-2xl">
      <h1 className="text-lg font-bold text-gray-900">Settings</h1>

      {/* About */}
      <div className="bg-white border border-gray-200 p-5">
      <h2 className="section-heading mb-3">About this prototype</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong className="text-gray-800">IITA Cacao Seed Tracker</strong> is a prototype system for tracking certified
            cacao planting materials from nursery registration through production, inspection, and distribution.
          </p>
          <p>
            This demo runs entirely in the browser. Data is persisted to localStorage. No network requests
            are made. Use the reset button to restore the original demo data set.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-gray-50 border border-gray-100 p-3">
              <div className="text-gray-400">Build</div>
              <div className="font-medium text-gray-800">Prototype v1.0</div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-3">
              <div className="text-gray-400">Tech Stack</div>
              <div className="font-medium text-gray-800">React + Vite + Tailwind CSS v4</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="bg-white border border-gray-200 p-5">
      <h2 className="section-heading mb-3">Demo data</h2>
        <p className="text-sm text-gray-600 mb-4">
          Reset all data to the original demo dataset. This will clear any records you have added or modified.
        </p>
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Icon name="warn" className="w-4 h-4" />
          Reset Demo Data
        </button>
      </div>

      {/* Audit log */}
      <div className="bg-white border border-gray-200 p-5">
      <h2 className="section-heading mb-3">
          Audit History ({audit.length})
        </h2>
        {audit.length === 0 ? (
          <p className="text-sm text-gray-400">No audit events yet. Actions like adding records or deciding inspections are logged here.</p>
        ) : (
          <div className="space-y-0 max-h-80 overflow-y-auto border border-gray-100">
            {audit.map((entry, i) => (
              <div key={entry.id || i} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <div className="w-1.5 h-1.5 bg-[#176B3A] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-800">{entry.action}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {entry.by} · {new Date(entry.ts).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset Demo Data?"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleReset} className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 font-medium">
              Yes, Reset Data
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="border-l-4 border-red-400 bg-red-50 px-4 py-3 text-xs text-red-800">
            <strong>Warning:</strong> This will permanently discard all changes made in this session and restore the original demo data.
          </div>
          <p className="text-sm text-gray-600">Are you sure you want to reset all data to the demo defaults?</p>
        </div>
      </Modal>
    </div>
  );
}
