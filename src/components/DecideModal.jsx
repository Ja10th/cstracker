import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';

export default function DecideModal({ isOpen, onClose, inspRecord }) {
  const { decide } = useApp();
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDecision('');
      setReason('');
      setError('');
    }
  }, [isOpen]);

  function handleSubmit() {
    if (!decision) { setError('Please select a decision.'); return; }
    if (decision === 'Rejected' && !reason.trim()) { setError('A reason is required when rejecting.'); return; }
    decide(inspRecord.id, decision, reason.trim() || undefined);
    onClose();
  }

  if (!inspRecord) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Decision: ${inspRecord.id}`}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="action-button"
          >
            Confirm Decision
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="border border-[#E7E1D5] bg-[#FAF8F1] px-5 py-4">
          <div className="text-xs uppercase tracking-[0.12em] text-[#8B8576]">Current inspection</div>
          <div className="text-lg font-semibold text-gray-900 mt-1">{inspRecord.nur} · {inspRecord.prod}</div>
          <div className="text-sm text-gray-500 mt-1">Review the evidence and choose the next workflow status.</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Nursery</div>
          <div className="text-sm text-gray-900">{inspRecord.nur}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Production Record</div>
          <div className="text-sm text-gray-900">{inspRecord.prod}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Inspector Summary</div>
          <div className="text-sm text-gray-900">{inspRecord.sum}</div>
        </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-gray-700 uppercase tracking-wide">Decision</legend>
          {[
            { value: 'Verified', label: 'Approve', detail: 'Counts and records match', cls: 'text-green-800' },
            { value: 'In Review', label: 'Keep in review', detail: 'Needs further checking', cls: 'text-[#B54708]' },
            { value: 'Rejected', label: 'Reject', detail: 'Cannot be verified', cls: 'text-gray-700' },
          ].map(opt => (
            <label key={opt.value} className={`flex items-start gap-3 p-4 border cursor-pointer ${decision === opt.value ? 'border-[#D45417] bg-[#FFF4E5]' : 'border-[#D9D4C8] hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="decision"
                value={opt.value}
                checked={decision === opt.value}
                onChange={() => { setDecision(opt.value); setError(''); }}
                className="mt-0.5"
              />
              <span className={`text-sm font-semibold ${opt.cls}`}><span className="block">{opt.label}</span><span className="block text-xs font-normal text-gray-500 mt-1">{opt.detail}</span></span>
            </label>
          ))}
        </fieldset>

        {decision === 'Rejected' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#176B3A] w-full bg-white h-20 resize-none"
              value={reason}
              onChange={e => { setReason(e.target.value); setError(''); }}
              placeholder="Briefly describe why this record is being rejected…"
            />
          </div>
        )}

        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
    </Modal>
  );
}
