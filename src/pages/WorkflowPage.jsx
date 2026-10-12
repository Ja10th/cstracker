import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import DecideModal from '../components/DecideModal';
import { STATES } from '../data/seed';

const INSPECTION_STAGES = ['Recorded', 'Site inspection', 'Evidence checked', 'Decision', 'Completed'];
const PRODUCTION_STAGES = ['Recorded', 'Under inspection', 'Decision', 'Approved', 'Distributed'];
const NURSERY_STAGES = ['Registered', 'Operator assigned', 'Location verified', 'Active'];
const PLAN_STAGES = ['Plan submitted', 'Extension validation', 'Plan approved', 'Production recorded', 'Inspection', 'Ready for distribution'];
const DISTRIBUTION_STAGES = ['Batch certified', 'Dispatched from seed garden', 'In transit', 'Delivered & received'];

function stageIndex(status, pageKey, record, linkedDists = []) {
  if (pageKey === 'plan') {
    if (status === 'Returned') return 1;
    if (status === 'Submitted') return 0;
    if (status === 'Validated') return 1;
    if (status === 'Approved') return 2;
    if (status === 'In Review') return 4;
    if (status === 'Verified') return 5;
    return 0;
  }
  if (pageKey === 'dist') {
    if (status === 'Received' || status === 'Delivered') return 3;
    if (status === 'In Transit') return 2;
    if (status === 'Dispatched') return 1;
    return 0;
  }
  if (pageKey === 'nur') return status === 'Active' ? 3 : status === 'Inactive' ? 2 : 1;
  if (pageKey === 'prod') {
    if (status === 'Distributed' || (linkedDists && linkedDists.length > 0)) return 4;
    if (status === 'Verified') return 3;
    if (status === 'Rejected') return 2;
    if (status === 'In Review') return 1;
    return 0;
  }
  if (status === 'Rejected') return pageKey === 'insp' ? 3 : 2;
  if (status === 'Verified') return pageKey === 'insp' ? 4 : 3;
  if (status === 'In Review') return pageKey === 'insp' ? 2 : 1;
  return 0;
}

function Pipeline({ status, pageKey, record, linkedDists }) {
  const stages = pageKey === 'plan'
    ? PLAN_STAGES
    : pageKey === 'insp'
    ? INSPECTION_STAGES
    : pageKey === 'nur'
    ? NURSERY_STAGES
    : pageKey === 'dist'
    ? DISTRIBUTION_STAGES
    : PRODUCTION_STAGES;
  const current = stageIndex(status, pageKey, record, linkedDists);
  const rejected = status === 'Rejected';

  return (
    <div className="px-4 sm:px-6 py-5 overflow-x-auto">
      <div className="min-w-[560px] flex items-center justify-between">
        {stages.map((stage, index) => {
          const complete = !rejected && index < current;
          const active = index === current;
          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center min-w-[90px] text-center">
                <div
                  className={`w-7 h-7 flex items-center justify-center text-xs font-semibold ${
                    complete
                      ? 'bg-[#176B3A] text-white'
                      : active && !rejected
                      ? 'bg-[#FF5A1F] text-white'
                      : rejected && active
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-500'
                  }`}
                >
                  {complete ? '✓' : index + 1}
                </div>
                <span className={`mt-2 text-xs leading-tight ${active ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                  {stage}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    index < current && !rejected ? 'bg-[#176B3A]' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function DetailRow({ label, value, isLink = false, onLinkClick }) {
  return (
    <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[160px_1fr] gap-3 py-3 border-b border-gray-100 last:border-0 items-baseline">
      <dt className="text-xs uppercase tracking-wide font-semibold text-[#8B8576]">{label}</dt>
      <dd className="text-sm text-gray-900 break-words">
        {isLink ? (
          <button onClick={onLinkClick} className="font-mono text-[#176B3A] hover:underline font-semibold">
            {value} →
          </button>
        ) : (
          value || '—'
        )}
      </dd>
    </div>
  );
}

const PAGE_NAMES = {
  prod: 'production records',
  plan: 'production plans',
  insp: 'inspection records',
  nur: 'seed garden registry',
  dist: 'distribution records',
};

/* ── Multi-Recipient Dispatch Seedlings Modal ───────────────────────── */
const inputCls = 'border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#176B3A] w-full bg-white';

function DispatchModal({ isOpen, record, nur, onClose, onSubmit }) {
  const today = new Date().toISOString().slice(0, 10);
  const maxQty = parseInt(record?.qty, 10) || 0;

  const [meta, setMeta] = useState({
    date: today,
    status: 'Dispatched',
    waybill: '',
  });

  const [recipients, setRecipients] = useState([
    { id: '1', to: '', qty: '', dest: nur?.state || STATES[0], remarks: '' }
  ]);

  const [errors, setErrors] = useState({});

  // Reset when opened
  React.useEffect(() => {
    if (isOpen) {
      setMeta({ date: today, status: 'Dispatched', waybill: '' });
      setRecipients([
        { id: '1', to: '', qty: '', dest: nur?.state || STATES[0], remarks: '' }
      ]);
      setErrors({});
    }
  }, [isOpen, nur, today]);

  const totalAllocated = recipients.reduce((sum, r) => sum + (parseInt(r.qty, 10) || 0), 0);
  const remainingQty = maxQty - totalAllocated;
  const isOverAllocated = totalAllocated > maxQty;

  const addRecipient = () => {
    const rem = Math.max(0, remainingQty);
    setRecipients(curr => [
      ...curr,
      {
        id: String(Date.now()),
        to: '',
        qty: rem > 0 ? String(rem) : '',
        dest: nur?.state || STATES[0],
        remarks: ''
      }
    ]);
  };

  const removeRecipient = (id) => {
    if (recipients.length <= 1) return;
    setRecipients(curr => curr.filter(r => r.id !== id));
  };

  const updateRecipient = (id, key, val) => {
    setRecipients(curr => curr.map(r => r.id === id ? { ...r, [key]: val } : r));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[`${id}_${key}`];
      return copy;
    });
  };

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};

    if (totalAllocated <= 0) {
      errs.general = 'Please allocate at least 1 seedling to a recipient.';
    } else if (totalAllocated > maxQty) {
      errs.general = `Total allocation (${totalAllocated.toLocaleString()}) exceeds batch capacity (${maxQty.toLocaleString()}).`;
    }

    recipients.forEach((r, idx) => {
      if (!r.to.trim()) {
        errs[`${r.id}_to`] = `Recipient #${idx + 1} name is required.`;
      }
      const q = parseInt(r.qty, 10);
      if (!q || q < 1) {
        errs[`${r.id}_qty`] = `Valid quantity required for Recipient #${idx + 1}.`;
      }
    });

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const dispatches = recipients.map(r => ({
      to: r.to.trim(),
      qty: String(r.qty),
      dest: r.dest,
      date: meta.date,
      status: meta.status,
      remarks: [meta.waybill, r.remarks].filter(Boolean).join(' | '),
    }));

    onSubmit(dispatches);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl border border-gray-200 shadow-2xl my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-[#FAF8F1] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Dispatch Seedlings to Farmers</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Batch <span className="font-mono font-semibold text-[#176B3A]">{record?.id}</span> &bull; {maxQty.toLocaleString()} available seedlings from {record?.nur}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none p-1">✕</button>
        </div>

        {/* Live Seedling Allocation Tracker Banner */}
        <div className="px-6 py-3 bg-[#F4EFE6] border-b border-gray-200 shrink-0">
          <div className="flex flex-wrap items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-gray-700">
              Allocated: <strong className={isOverAllocated ? 'text-red-600' : 'text-[#176B3A]'}>{totalAllocated.toLocaleString()}</strong> of {maxQty.toLocaleString()} seedlings
            </span>
            <span className={remainingQty < 0 ? 'text-red-600 font-bold' : 'text-gray-600'}>
              {remainingQty >= 0 ? `${remainingQty.toLocaleString()} seedlings unassigned` : `${Math.abs(remainingQty).toLocaleString()} seedlings OVER batch limit!`}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${isOverAllocated ? 'bg-red-600' : 'bg-[#176B3A]'}`}
              style={{ width: `${Math.min(100, Math.round((totalAllocated / maxQty) * 100))}%` }}
            />
          </div>
          {errors.general && (
            <p className="text-xs text-red-600 mt-1 font-semibold">{errors.general}</p>
          )}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Shared Shipment Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-gray-50 border border-gray-200">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1 block">Dispatch Date</label>
              <input type="date" className={inputCls} value={meta.date} max={today} onChange={e => setMeta(m => ({ ...m, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1 block">Shipment Status</label>
              <select className={`${inputCls} app-select`} value={meta.status} onChange={e => setMeta(m => ({ ...m, status: e.target.value }))}>
                <option value="Dispatched">Dispatched (en route)</option>
                <option value="In Transit">In Transit</option>
                <option value="Received">Received by farmers</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1 block">Waybill / Batch Note</label>
              <input className={inputCls} value={meta.waybill} onChange={e => setMeta(m => ({ ...m, waybill: e.target.value }))} placeholder="e.g. WB-2026-081" />
            </div>
          </div>

          {/* Recipient Allocations List */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-700">
                Recipients List ({recipients.length} {recipients.length === 1 ? 'Party' : 'Parties'})
              </span>
              <span className="text-[11px] text-gray-500">Dispatch to single farmer or distribute across multiple groups</span>
            </div>

            {recipients.map((r, idx) => (
              <div key={r.id} className="p-4 bg-white border border-gray-200 shadow-sm relative space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#176B3A] text-white text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      Farmer / Cooperative #{idx + 1}
                    </span>
                  </div>
                  {recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRecipient(r.id)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1 block">
                      Recipient Farmer or Cooperative *
                    </label>
                    <input
                      className={inputCls}
                      value={r.to}
                      onChange={e => updateRecipient(r.id, 'to', e.target.value)}
                      placeholder="e.g. Adeyemi Smallholder Group"
                    />
                    {errors[`${r.id}_to`] && (
                      <span className="text-[11px] text-red-600 mt-0.5 block">{errors[`${r.id}_to`]}</span>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1 block">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      className={inputCls}
                      value={r.qty}
                      onChange={e => updateRecipient(r.id, 'qty', e.target.value)}
                      placeholder="e.g. 2,000"
                      min="1"
                    />
                    {errors[`${r.id}_qty`] && (
                      <span className="text-[11px] text-red-600 mt-0.5 block">{errors[`${r.id}_qty`]}</span>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1 block">
                      State *
                    </label>
                    <select
                      className={`${inputCls} app-select`}
                      value={r.dest}
                      onChange={e => updateRecipient(r.id, 'dest', e.target.value)}
                    >
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="sm:col-span-12">
                    <input
                      className="border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-[#176B3A] w-full bg-gray-50/50"
                      value={r.remarks}
                      onChange={e => updateRecipient(r.id, 'remarks', e.target.value)}
                      placeholder="Specific farmer community, LGA, phone, or delivery notes (optional)…"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add recipient button */}
            <button
              type="button"
              onClick={addRecipient}
              className="w-full py-2.5 border-2 border-dashed border-[#176B3A] text-[#176B3A] text-xs font-bold hover:bg-[#EAF5EE] flex items-center justify-center gap-1.5 transition-colors"
            >
              + Add Another Farmer / Cooperative Recipient
            </button>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200 shrink-0">
            <span className="text-xs text-gray-500">
              Total to record: <strong>{totalAllocated.toLocaleString()}</strong> seedlings across <strong>{recipients.length}</strong> {recipients.length === 1 ? 'recipient' : 'recipients'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isOverAllocated}
                className={`action-button ${isOverAllocated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Record {recipients.length > 1 ? `All ${recipients.length} Dispatches` : 'Dispatch'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Advance Stage Modal ──────────────────────────────────────────────── */
function AdvanceStageModal({ isOpen, fromStage, toStage, actionLabel, reviewer, onClose, onConfirm }) {
  const [comment, setComment] = useState('');
  function handleConfirm() { onConfirm(comment); setComment(''); onClose(); }
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-md border border-gray-200 shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 bg-[#FAF8F1]">
          <h2 className="text-base font-bold text-gray-900">{actionLabel}</h2>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 border border-gray-200">{fromStage}</span>
            <span>→</span>
            <span className="px-2 py-1 bg-[#176B3A] text-white font-semibold">{toStage}</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[#FAF8F1] border-l-4 border-[#176B3A] px-4 py-3 text-xs text-gray-700">
            Reviewer: <strong>{reviewer}</strong> · {new Date().toLocaleDateString()}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1 block">
              Audit Comments / Remarks <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              className={inputCls}
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Enter any relevant notes, conditions, or justifications for this stage advancement…"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleConfirm} className="action-button">Confirm & Advance Stage</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  const { data, filters, navigate, can, currentUser, editRecord, addRecord } = useApp();
  const workflow = filters.workflow || {};
  const pageKey = workflow.workflowPageKey || 'insp';
  const record = data[pageKey]?.find((item) => item.id === workflow.workflowRecordId);
  const [showDecide, setShowDecide] = useState(false);
  const [showDispatch, setShowDispatch] = useState(false);
  const [advanceStage, setAdvanceStage] = useState(null); // { fromStage, toStage, actionLabel, onConfirm }

  const isSuperUser = currentUser?.role === 'Administrator' || currentUser?.role === 'Project Manager';
  const isExtension = currentUser?.role === 'Extension Officer';

  function handleAdvanceStage(fromStage, toStage, actionLabel, applyFn) {
    setAdvanceStage({
      fromStage, toStage, actionLabel,
      onConfirm: (comment) => {
        applyFn(comment);
        setAdvanceStage(null);
      },
    });
  }

  if (!record) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(pageKey)}
          className="text-xs font-semibold text-[#176B3A] hover:underline mb-4 flex items-center gap-1"
        >
          ← Back to {PAGE_NAMES[pageKey] || 'records'}
        </button>
        <div className="p-8 bg-white border border-gray-200 text-center">
          <p className="text-sm font-semibold text-gray-800">Record not found</p>
          <p className="text-xs text-gray-500 mt-1">The requested workflow record could not be loaded.</p>
        </div>
      </div>
    );
  }

  const isInspection = pageKey === 'insp';
  const isProduction = pageKey === 'prod';
  const isNursery = pageKey === 'nur';
  const isPlan = pageKey === 'plan';
  const isDistribution = pageKey === 'dist';

  // Relational lookups
  const linkedProd = isInspection
    ? data.prod?.find((p) => p.id === record.prod)
    : null;

  const linkedInsp = isProduction
    ? data.insp?.find((i) => i.prod === record.id)
    : null;

  const linkedDists = isProduction
    ? data.dist?.filter((d) => d.prod === record.id) || []
    : [];

  const nurseryProd = isNursery
    ? data.prod?.filter((p) => p.nur === record.name) || []
    : [];

  const distLinkedProd = isDistribution
    ? data.prod?.find((p) => p.id === record.prod) || null
    : null;

  const linkedNur = isProduction
    ? data.nur?.find((n) => n.name === record.nur) || null
    : null;

  // Can review decision
  const activeInspRecord = isInspection ? record : linkedInsp;
  const canDecide = can('verify') && activeInspRecord && !['Verified', 'Rejected'].includes(activeInspRecord.status);

  // Coherent, realistic chronological timeline
  let timeline = [];

  if (isInspection) {
    timeline = [
      {
        title: 'Production batch logged',
        date: linkedProd?.date || 'Earlier',
        actor: linkedProd?.by || 'Seed garden operator',
        detail: `Seedling batch ${record.prod} logged at ${record.nur}.`,
        done: true,
      },
      {
        title: 'Inspection assigned',
        date: linkedProd?.date || record.date,
        actor: record.by,
        detail: `Phytosanitary inspection assigned to ${record.by}.`,
        done: true,
      },
      {
        title: 'Site audit conducted',
        date: record.date,
        actor: record.by,
        detail: `Physical seed garden audit conducted at ${record.nur}.`,
        done: record.status !== 'Pending',
      },
      {
        title: record.status === 'Verified' ? 'Inspection approved' : record.status === 'Rejected' ? 'Inspection rejected' : 'Audit review in progress',
        date: record.date,
        actor: record.by,
        detail: record.sum || 'Inspection evaluation recorded.',
        done: ['Verified', 'Rejected'].includes(record.status),
        isDecision: true,
      },
    ];
  } else if (isProduction) {
    timeline = [
      {
        title: 'Seedlings planted & recorded',
        date: record.date,
        actor: record.by,
        detail: `${Number(record.qty).toLocaleString()} seedlings of ${record.variety} registered at ${record.nur}.`,
        done: true,
      },
      {
        title: 'Inspection assignment',
        date: linkedInsp?.date || record.date,
        actor: linkedInsp?.by || 'Quality assurance',
        detail: linkedInsp ? `Assigned to inspector ${linkedInsp.by}.` : 'Queued for phytosanitary inspection.',
        done: !!linkedInsp,
      },
      {
        title: record.status === 'Verified' ? 'Batch certified' : record.status === 'Rejected' ? 'Batch flagged for remediation' : 'Inspection review',
        date: linkedInsp?.date || record.date,
        actor: linkedInsp?.by || 'Inspector',
        detail: record.adminComment ? `Certified by administration: "${record.adminComment}"` : (linkedInsp?.sum || `Status: ${record.status}.`),
        done: ['Verified', 'Rejected'].includes(record.status),
        isDecision: true,
      },
      ...(linkedDists.length > 0 ? linkedDists.map((d) => ({
        title: `Seedlings distributed — ${d.to}`,
        date: d.date,
        actor: d.to,
        detail: `${Number(d.qty).toLocaleString()} seedlings delivered to ${d.to} in ${d.dest}. Status: ${d.status}. ${d.remarks ? `(${d.remarks})` : ''}`,
        done: true,
      })) : []),
    ];
  } else if (isDistribution) {
    timeline = [
      {
        title: 'Seedling batch certified',
        date: distLinkedProd?.date || record.date,
        actor: distLinkedProd?.by || 'Seed garden operator',
        detail: `Batch ${record.prod || '—'} (${distLinkedProd?.variety || record.variety || 'Cocoa seedlings'}) cleared for distribution.`,
        done: true,
      },
      {
        title: 'Dispatched from seed garden',
        date: record.date,
        actor: record.by || 'Logistics / Extension officer',
        detail: `${Number(record.qty).toLocaleString()} seedlings dispatched to ${record.to} — ${record.dest}. ${record.remarks ? `Remarks: ${record.remarks}` : ''}`,
        done: true,
      },
      {
        title: record.status === 'Received' || record.status === 'Delivered'
          ? 'Delivered & received by farmers'
          : 'Delivery in progress',
        date: record.date,
        actor: record.to,
        detail: `Delivery status: ${record.status}. Destination state: ${record.dest}.`,
        done: record.status === 'Received' || record.status === 'Delivered',
        isDecision: true,
      },
    ];
  } else if (isPlan) {
    timeline = [
      {
        title: 'Production plan submitted',
        date: record.submittedDate || record.plantingDate,
        actor: record.submittedBy || record.producer,
        detail: `Target of ${Number(record.target || 0).toLocaleString()} seedlings proposed for ${record.nur}.`,
        done: true,
      },
      {
        title: 'Extension officer review',
        date: record.plantingDate,
        actor: 'Extension service',
        detail: record.validationNote ? `Validated: "${record.validationNote}"` : `Validation for ${record.variety} planting in ${record.state}.`,
        done: ['Validated', 'Approved', 'Verified'].includes(record.status),
      },
      {
        title: `Plan status: ${record.status}`,
        date: record.plantingDate,
        actor: 'Project management',
        detail: record.approvalNote ? `Approved: "${record.approvalNote}"` : `Status confirmed: ${record.status}.`,
        done: ['Approved', 'Verified'].includes(record.status),
        isDecision: true,
      },
    ];
  } else {
    // Seed Garden
    timeline = [
      {
        title: 'Seed garden registered',
        date: record.date,
        actor: record.op || 'Operator',
        detail: `Established in ${record.state || 'N/A'}, LGA: ${record.lga || 'N/A'}.`,
        done: true,
      },
      {
        title: 'Operator credentials verified',
        date: record.date,
        actor: record.op || 'Operator',
        detail: `Assigned operator: ${record.op || 'N/A'}.`,
        done: true,
      },
      {
        title: `Facility status: ${record.status}`,
        date: record.date,
        actor: 'Administration',
        detail: record.accreditationNote ? `Accreditation: "${record.accreditationNote}"` : `Accreditation status: ${record.status}.`,
        done: record.status === 'Active',
        isDecision: true,
      },
    ];
  }

  return (
    <div className="p-3 sm:p-6 space-y-6">
      {/* Top Header - Clean and unscattered */}
      <div>
        <button
          onClick={() => navigate(pageKey)}
          className="text-xs font-semibold text-[#176B3A] hover:underline flex items-center gap-1 mb-2"
        >
          ← Back to {PAGE_NAMES[pageKey] || 'records'}
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">
                {record.id}
              </h1>
              <Badge status={record.status} />
              <span className="text-xs uppercase font-mono px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200">
                {isInspection ? 'Inspection' : isProduction ? 'Production' : isPlan ? 'Plan' : isDistribution ? 'Distribution' : 'Seed Garden'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isDistribution
                ? `${record.to} · ${record.dest} · ${record.date}`
                : `${record.nur || record.name} · ${record.variety || record.state || 'IITA Cocoa Seed Tracker'} · ${record.date || record.plantingDate || 'Active'}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Inspector / Admin Review Decision on Inspections */}
            {canDecide && (
              <button
                onClick={() => setShowDecide(true)}
                className="action-button"
              >
                Review Decision
              </button>
            )}

            {/* Distribution Workflow Actions: Admin, PM, Extension */}
            {isDistribution && (isSuperUser || isExtension) && record.status !== 'Received' && (
              <>
                {record.status === 'Recorded' && (
                  <button
                    onClick={() => handleAdvanceStage(
                      'Recorded', 'In Transit',
                      'Mark Shipment In Transit',
                      (comment) => editRecord('dist', record.id, { status: 'In Transit', ...(comment ? { remarks: comment } : {}) })
                    )}
                    className="action-button"
                  >
                    Mark In Transit (Dispatched)
                  </button>
                )}
                <button
                  onClick={() => handleAdvanceStage(
                    record.status, 'Received',
                    'Confirm Delivery to Farmers',
                    (comment) => editRecord('dist', record.id, { status: 'Received', ...(comment ? { remarks: comment } : {}) })
                  )}
                  className="action-button"
                >
                  ✓ Confirm Delivery (Mark Received)
                </button>
              </>
            )}

            {/* Production Actions: Admin / PM fast-track certification */}
            {isProduction && isSuperUser && (record.status === 'Pending' || record.status === 'In Review') && (
              <button
                onClick={() => handleAdvanceStage(
                  record.status, 'Verified',
                  'Administrative Certification',
                  (comment) => editRecord('prod', record.id, { status: 'Verified', ...(comment ? { adminComment: comment } : {}) })
                )}
                className="action-button"
                title="Administrative quality sign-off"
              >
                ✓ Administrative Certification (Verify Batch)
              </button>
            )}

            {/* Production Actions: Dispatch Seedlings to Farmers */}
            {isProduction && (isSuperUser || isExtension) && record.status === 'Verified' && (
              <button
                onClick={() => setShowDispatch(true)}
                className="action-button"
              >
                + Dispatch Seedlings to Farmers
              </button>
            )}

            {/* Production Plan Progression: Extension Officer / PM / Admin */}
            {isPlan && (isSuperUser || isExtension) && record.status === 'Submitted' && (
              <button
                onClick={() => handleAdvanceStage(
                  'Plan Submitted', 'Validated',
                  'Validate Production Plan',
                  (comment) => editRecord('plan', record.id, { status: 'Validated', ...(comment ? { validationNote: comment } : {}) })
                )}
                className="action-button"
                title="Advance production plan to Validated status"
              >
                Advance Stage: Validate Plan →
              </button>
            )}
            {isPlan && (isSuperUser || isExtension) && record.status === 'Validated' && (
              <button
                onClick={() => handleAdvanceStage(
                  'Validated', 'Approved',
                  'Approve Production Plan',
                  (comment) => editRecord('plan', record.id, { status: 'Approved', ...(comment ? { approvalNote: comment } : {}) })
                )}
                className="action-button"
                title="Advance production plan to Approved status"
              >
                Advance Stage: Approve Plan ✓
              </button>
            )}

            {/* Seed Garden Accreditation: Admin / PM */}
            {isNursery && isSuperUser && record.status !== 'Active' && (
              <button
                onClick={() => handleAdvanceStage(
                  record.status, 'Active',
                  'Accredit & Activate Seed Garden',
                  (comment) => editRecord('nur', record.id, { status: 'Active', ...(comment ? { accreditationNote: comment } : {}) })
                )}
                className="action-button"
              >
                Accredit & Activate Seed Garden
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stepper Pipeline Card */}
      <section className="bg-white border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-200 bg-[#FAF8F1] flex items-center justify-between">
          <span className="text-xs uppercase font-semibold text-[#8B8576] tracking-wide">Workflow Progression</span>
          <span className="text-xs text-gray-500 font-mono">
            Step {stageIndex(record.status, pageKey, record, linkedDists) + 1} of {isPlan ? PLAN_STAGES.length : isInspection ? INSPECTION_STAGES.length : isNursery ? NURSERY_STAGES.length : isDistribution ? DISTRIBUTION_STAGES.length : PRODUCTION_STAGES.length}
          </span>
        </div>
        <Pipeline status={record.status} pageKey={pageKey} record={record} linkedDists={linkedDists} />
      </section>

      {/* Two-Column Structured Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6">
        {/* Left Column: Primary Data Sheet */}
        <div className="space-y-6">
          {/* Main Record Card */}
          <div className="bg-white border border-gray-200">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-[#FAF8F1] flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-[#8B8576] tracking-wide">
                Record Specifications
              </span>
              <span className="text-xs font-mono text-gray-500">{record.id}</span>
            </div>
            <dl className="p-5">
              <DetailRow label="Reference ID" value={record.id} />
              <DetailRow label="Seed Garden" value={record.nur || record.name} />

              {isInspection && (
                <>
                  <DetailRow
                    label="Production Record"
                    value={record.prod}
                    isLink={true}
                    onLinkClick={() => navigate('workflow', { workflowPageKey: 'prod', workflowRecordId: record.prod })}
                  />
                  {linkedProd && (
                    <>
                      <DetailRow label="Variety" value={linkedProd.variety} />
                      <DetailRow label="Quantity" value={`${Number(linkedProd.qty).toLocaleString()} seedlings`} />
                    </>
                  )}
                  <DetailRow label="Inspector" value={record.by} />
                  <DetailRow label="Inspection Date" value={record.date} />
                  <DetailRow label="Status" value={record.status} />
                </>
              )}

              {isProduction && (
                <>
                  <DetailRow label="Variety" value={record.variety} />
                  <DetailRow label="Quantity" value={`${Number(record.qty).toLocaleString()} seedlings`} />
                  <DetailRow label="Recorded By" value={record.by} />
                  <DetailRow label="Date" value={record.date} />
                  {record.batchId && <DetailRow label="Batch / Lot ID" value={record.batchId} />}
                  {record.stage && <DetailRow label="Production Stage" value={record.stage} />}
                  {record.bedId && <DetailRow label="Garden Bed / Section" value={record.bedId} />}
                  {record.seedSource && <DetailRow label="Seed Source" value={record.seedSource} />}
                  {record.sourceOrganization && <DetailRow label="Source Organization" value={record.sourceOrganization} />}
                  {record.sourceYear && <DetailRow label="Source Harvest Year" value={record.sourceYear} />}
                  {(record.areaLength || record.areaWidth) && (
                    <DetailRow
                      label="Bed Dimensions"
                      value={`${record.areaLength || '—'}m × ${record.areaWidth || '—'}m (${record.areaUnit || 'sq m'})`}
                    />
                  )}
                  {record.location && <DetailRow label="GPS Location" value={record.location} />}
                  {record.notes && <DetailRow label="Field Observations" value={record.notes} />}
                  {record.photoName && <DetailRow label="Photo Attachment" value={record.photoName} />}
                  {record.planId && (
                    <DetailRow
                      label="Linked Production Plan"
                      value={record.planId}
                      isLink={true}
                      onLinkClick={() => navigate('workflow', { workflowPageKey: 'plan', workflowRecordId: record.planId })}
                    />
                  )}
                  {linkedInsp && (
                    <DetailRow
                      label="Linked Inspection"
                      value={linkedInsp.id}
                      isLink={true}
                      onLinkClick={() => navigate('workflow', { workflowPageKey: 'insp', workflowRecordId: linkedInsp.id })}
                    />
                  )}
                  <DetailRow label="Status" value={record.status} />
                </>
              )}

              {isNursery && (
                <>
                  <DetailRow label="Operator" value={record.op || '—'} />
                  <DetailRow label="State & LGA" value={`${record.state || 'N/A'}, ${record.lga || 'N/A'}`} />
                  <DetailRow label="Registration Date" value={record.date} />
                  <DetailRow label="Status" value={record.status} />
                </>
              )}

              {isDistribution && (
                <>
                  <DetailRow label="Recipient / Group" value={record.to} />
                  <DetailRow label="Destination State" value={record.dest} />
                  <DetailRow label="Quantity Distributed" value={`${Number(record.qty).toLocaleString()} seedlings`} />
                  <DetailRow label="Variety" value={distLinkedProd?.variety || record.variety || '—'} />
                  <DetailRow
                    label="Production Record"
                    value={record.prod || '—'}
                    isLink={!!record.prod}
                    onLinkClick={() => navigate('workflow', { workflowPageKey: 'prod', workflowRecordId: record.prod })}
                  />
                  {distLinkedProd && (
                    <DetailRow
                      label="Source Seed Garden"
                      value={distLinkedProd.nur}
                      isLink={true}
                      onLinkClick={() => navigate('workflow', { workflowPageKey: 'nur', workflowRecordId: data.nur?.find(n => n.name === distLinkedProd.nur)?.id })}
                    />
                  )}
                  <DetailRow label="Delivery Date" value={record.date} />
                  <DetailRow label="Delivery Status" value={record.status} />
                </>
              )}

              {isPlan && (
                <>
                  <DetailRow label="Seed Garden" value={record.nur || record.nursery || '—'} />
                  <DetailRow label="Producer / Applicant" value={record.producer || record.submittedBy || '—'} />
                  <DetailRow label="Contact Email" value={record.email || '—'} />
                  <DetailRow label="Cocoa Variety" value={record.variety || '—'} />
                  <DetailRow label="Target Seedlings" value={`${Number(record.target || 0).toLocaleString()} seedlings`} />
                  <DetailRow label="Proposed Planting Date" value={record.plantingDate || record.date || '—'} />
                  <DetailRow
                    label="Location & Zone"
                    value={[record.state, record.zone, record.city].filter(Boolean).join(' · ') || record.state || '—'}
                  />
                  <DetailRow label="Field / Seed Garden ID" value={record.fieldId || '—'} />
                  {record.location && <DetailRow label="GPS Coordinates" value={record.location} />}
                  <DetailRow label="Seed Source Material" value={record.seedSource || 'Seed'} />
                  {record.sourceOrganization && <DetailRow label="Source Organization" value={record.sourceOrganization} />}
                  {record.sourceYear && <DetailRow label="Source Production Year" value={record.sourceYear} />}
                  {(record.length || record.width || record.area) && (
                    <DetailRow
                      label="Planned Area Dimensions"
                      value={record.length && record.width ? `${record.length}m × ${record.width}m (${record.area || 'sq m'})` : (record.area ? `1 ${record.area}` : '—')}
                    />
                  )}
                  {record.soilType && <DetailRow label="Soil / Substrate Type" value={record.soilType} />}
                  {record.previousCrop && <DetailRow label="Previous Crop" value={record.previousCrop} />}
                  {record.surroundingCrops && <DetailRow label="Surrounding Crops" value={record.surroundingCrops} />}
                  {record.comments && <DetailRow label="Plan Comments / Notes" value={record.comments} />}
                  {record.photoName && <DetailRow label="Field Photo Attachment" value={record.photoName} />}
                  <DetailRow label="Submission Date" value={record.submittedDate || record.date || '—'} />
                  <DetailRow label="Workflow Stage" value={record.status} />
                </>
              )}
            </dl>

            {/* Photo preview if present */}
            {record.photo && (
              <div className="p-5 border-t border-gray-100 bg-gray-50">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#8B8576] mb-2">Attached Photo Evidence</div>
                <img src={record.photo} alt="Record evidence" className="w-full max-h-56 object-cover border border-gray-200" />
              </div>
            )}
          </div>

          {/* Inspection Findings Box (shown for inspections or linked inspections) */}
          {(isInspection || linkedInsp) && (
            <div className="bg-white border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-200 bg-[#FAF8F1] flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-[#8B8576] tracking-wide">
                  Inspection Findings & Decision
                </span>
                <Badge status={(isInspection ? record : linkedInsp).status} />
              </div>
              <div className="p-5">
                <div className="bg-[#FAF8F1] border-l-4 border-[#176B3A] p-4 text-sm text-gray-800 leading-relaxed">
                  <strong>Summary of Findings:</strong> {(isInspection ? record : linkedInsp).sum || 'Inspection report logged.'}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 font-mono">
                  <span>Inspector: {(isInspection ? record : linkedInsp).by}</span>
                  <span>Date: {(isInspection ? record : linkedInsp).date}</span>
                </div>
              </div>
            </div>
          )}

          {/* Linked Distribution Section on Production records */}
          {isProduction && (
            <div className="bg-white border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-200 bg-[#FAF8F1] flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-[#8B8576] tracking-wide">
                  Seedling Distribution to Farmers ({linkedDists.length})
                </span>
                {(isSuperUser || isExtension) && record.status === 'Verified' && (
                  <button
                    onClick={() => setShowDispatch(true)}
                    className="text-xs text-[#176B3A] font-semibold hover:underline"
                  >
                    + Dispatch Seedlings
                  </button>
                )}
              </div>
              {linkedDists.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="data-table w-full text-sm">
                    <thead className="bg-[#FAF8F1] border-b border-gray-200">
                      <tr>
                        {['ID', 'Recipient Farmer / Group', 'Quantity', 'Destination', 'Date', 'Status', 'Action'].map((h) => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs uppercase font-semibold text-[#8B8576]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {linkedDists.map((d, i) => (
                        <tr
                          key={d.id}
                          className={`border-b border-gray-100 hover:bg-[#F7F3E9] ${i % 2 ? 'bg-gray-50' : 'bg-white'}`}
                        >
                          <td className="px-4 py-2.5 font-mono text-[#176B3A] font-semibold">{d.id}</td>
                          <td className="px-4 py-2.5 font-semibold text-gray-800">{d.to}</td>
                          <td className="px-4 py-2.5 tabular-nums font-bold text-gray-900">{Number(d.qty).toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-gray-600">{d.dest}</td>
                          <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{d.date}</td>
                          <td className="px-4 py-2.5"><Badge status={d.status} /></td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() => navigate('workflow', { workflowPageKey: 'dist', workflowRecordId: d.id })}
                              className="text-xs text-[#176B3A] font-medium hover:underline"
                            >
                              View workflow →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-xs text-gray-500">
                    {record.status === 'Verified'
                      ? 'No seedlings dispatched from this verified batch yet. Click "+ Dispatch Seedlings to Farmers" above to log recipient details and destination.'
                      : 'Seedlings can be dispatched once batch phytosanitary verification is complete.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Linked Seed Garden Production Batches (shown on Seed Garden records) */}
          {isNursery && nurseryProd.length > 0 && (
            <div className="bg-white border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-200 bg-[#FAF8F1] flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-[#8B8576] tracking-wide">
                  Production Batches at this Seed Garden
                </span>
                <span className="text-xs text-gray-500 font-mono">{nurseryProd.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table w-full text-sm">
                  <thead className="bg-[#FAF8F1] border-b border-gray-200">
                    <tr>
                      {['Batch ID', 'Variety', 'Quantity', 'Recorded by', 'Date', 'Status'].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs uppercase font-semibold text-[#8B8576]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nurseryProd.map((p, i) => (
                      <tr
                        key={p.id}
                        onClick={() => navigate('workflow', { workflowPageKey: 'prod', workflowRecordId: p.id })}
                        className={`cursor-pointer border-b border-gray-100 hover:bg-[#F7F3E9] ${i % 2 ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <td className="px-4 py-2.5 font-mono text-[#176B3A] font-semibold">{p.id}</td>
                        <td className="px-4 py-2.5 font-semibold text-gray-800">{p.variety}</td>
                        <td className="px-4 py-2.5 tabular-nums">{Number(p.qty).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-gray-600">{p.by}</td>
                        <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{p.date}</td>
                        <td className="px-4 py-2.5"><Badge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Coherent Activity Timeline */}
        <div>
          <div className="bg-white border border-gray-200">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-[#FAF8F1] flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-[#8B8576] tracking-wide">
                Activity Timeline
              </span>
              <span className="text-xs text-gray-400 font-mono">{timeline.length} milestones</span>
            </div>
            <div className="p-5">
              <div className="space-y-5">
                {timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3.5 h-3.5 rounded-full mt-1 ${
                          step.isDecision && step.done
                            ? record.status === 'Rejected'
                              ? 'bg-red-600 ring-2 ring-red-100'
                              : 'bg-[#176B3A] ring-2 ring-emerald-100'
                            : step.done
                            ? 'bg-[#176B3A]'
                            : 'bg-gray-300'
                        }`}
                      />
                      {idx < timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 min-h-[40px] my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900 leading-tight">
                          {step.title}
                        </span>
                        <span className="text-[11px] font-mono text-[#8B8576] shrink-0">
                          {step.date}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {step.detail}
                      </p>
                      {step.actor && (
                        <span className="inline-block mt-1 text-[11px] text-gray-400 font-mono">
                          Actor: {step.actor}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      <DecideModal
        isOpen={showDecide}
        onClose={() => setShowDecide(false)}
        inspRecord={activeInspRecord}
      />

      {/* Dispatch Seedlings Modal */}
      <DispatchModal
        isOpen={showDispatch}
        record={record}
        nur={linkedNur}
        onClose={() => setShowDispatch(false)}
        onSubmit={(items) => {
          const list = Array.isArray(items) ? items : [items];
          list.forEach((item) => {
            addRecord('dist', {
              nur: record.nur,
              prod: record.id,
              variety: record.variety,
              qty: String(item.qty),
              to: item.to,
              dest: item.dest,
              date: item.date,
              status: item.status,
              remarks: item.remarks,
              by: currentUser?.name || 'Administrator',
            });
          });
        }}
      />

      {/* Advance Stage Modal with Comment */}
      <AdvanceStageModal
        isOpen={!!advanceStage}
        fromStage={advanceStage?.fromStage || ''}
        toStage={advanceStage?.toStage || ''}
        actionLabel={advanceStage?.actionLabel || 'Advance Workflow Stage'}
        reviewer={`${currentUser?.name || 'Reviewer'} (${currentUser?.role || 'Staff'})`}
        onClose={() => setAdvanceStage(null)}
        onConfirm={(comment) => advanceStage?.onConfirm(comment)}
      />
    </div>
  );
}
