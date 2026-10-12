import React from 'react';
import { useApp } from '../context/AppContext';
import Badge from './Badge';
import Modal from './Modal';
import WorkflowProgress from './WorkflowProgress';

function KV({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium">{value ?? '—'}</dd>
    </div>
  );
}

export default function DetailDrawer({ isOpen, onClose, record, pageKey, onDecide }) {
  const { can, data, currentUser } = useApp();

  if (!record) return null;

  const canVerify = can('verify');

  const relatedIds = pageKey === 'prod'
    ? [record.id, ...(data.insp || []).filter((inspection) => inspection.prod === record.id).map((inspection) => inspection.id)]
    : [record.id];
  const relatedAudit = (data.audit || [])
    .filter((entry) => relatedIds.some((id) => entry.action?.includes(id)))
    .sort((a, b) => String(a.ts).localeCompare(String(b.ts)));

  const activity = [
    { label: 'Record created', detail: record.by || record.op || currentUser?.name || 'System', date: record.date },
    ...relatedAudit.map((entry) => ({ label: entry.action, detail: entry.by || 'System', date: entry.ts?.slice(0, 10) })),
  ];

  function renderContent() {
    switch (pageKey) {
      case 'nur':
        return (
          <dl>
            <KV label="ID" value={record.id} />
            {record.image && <div className="py-3 border-b border-gray-100"><dt className="text-xs text-gray-500 uppercase tracking-wide mb-2">Variety image</dt><dd><img src={record.image} alt={`${record.name} cacao variety`} className="w-24 h-20 object-cover border border-gray-200" /></dd></div>}
            <KV label="Name" value={record.name} />
            <KV label="Operator" value={record.op} />
            <KV label="State" value={record.state} />
            <KV label="LGA" value={record.lga} />
            <KV label="Registration Date" value={record.date} />
            <KV label="Status" value={<Badge status={record.status} />} />
          </dl>
        );
      case 'prod':
        return (
          <dl>
            <KV label="ID" value={record.id} />
            <KV label="Nursery" value={record.nur} />
            <KV label="Variety" value={record.variety} />
            <KV label="Quantity" value={parseInt(record.qty, 10).toLocaleString()} />
            <KV label="Date Recorded" value={record.date} />
            <KV label="Recorded By" value={record.by} />
            <KV label="Status" value={<Badge status={record.status} />} />
          </dl>
        );
      case 'vars':
        return (
          <dl>
            <KV label="ID" value={record.id} />
            <KV label="Name" value={record.name} />
            <KV label="Description" value={record.desc} />
            <KV label="Attributes" value={record.attr} />
            <KV label="Status" value={<Badge status={record.status} />} />
          </dl>
        );
      case 'insp':
        return (
          <>
            <dl>
              <KV label="ID" value={record.id} />
              <KV label="Nursery" value={record.nur} />
              <KV label="Production Record" value={record.prod} />
              <KV label="Inspector" value={record.by} />
              <KV label="Date" value={record.date} />
              <KV label="Summary" value={record.sum} />
              <KV label="Status" value={<Badge status={record.status} />} />
            </dl>
            {canVerify && record.status !== 'Verified' && record.status !== 'Rejected' && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Next step</div>
                    <p className="text-xs text-gray-500 mt-1">Review this inspection before making a decision.</p>
                  </div>
                  <button
                    onClick={() => { onClose(); onDecide(record); }}
                    className="action-button shrink-0 transition-colors"
                  >
                    Review decision
                  </button>
                </div>
              </div>
            )}
          </>
        );
      case 'dist':
        return (
          <dl>
            <KV label="ID" value={record.id} />
            <KV label="Nursery" value={record.nur} />
            <KV label="Production Record" value={record.prod} />
            <KV label="Variety" value={record.variety} />
            <KV label="Quantity" value={parseInt(record.qty, 10).toLocaleString()} />
            <KV label="Recipient" value={record.to} />
            <KV label="Destination State" value={record.dest} />
            <KV label="Date" value={record.date} />
            <KV label="Status" value={<Badge status={record.status} />} />
          </dl>
        );
      case 'users':
        return (
          <dl>
            <KV label="ID" value={record.id} />
            <KV label="Name" value={record.name} />
            <KV label="Email" value={record.email} />
            <KV label="Role" value={record.role} />
            <KV label="Scope" value={record.scope} />
            <KV label="Last Active" value={record.last} />
            <KV label="Status" value={<Badge status={record.status} />} />
          </dl>
        );
      default:
        return <pre className="text-xs">{JSON.stringify(record, null, 2)}</pre>;
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record: ${record.id}`}>
      {(pageKey === 'prod' || pageKey === 'insp' || pageKey === 'dist') && (
        <div className="mb-5 border border-gray-200 bg-[#FAFAF7] p-4">
          <div className="section-heading mb-4">Workflow</div>
          <WorkflowProgress status={record.status} />
        </div>
      )}
      {record.photo && (
        <div className="mb-5 border border-gray-200 bg-[#FAFAF7] p-4">
          <div className="section-heading mb-3">Photo evidence</div>
          <img src={record.photo} alt={`Evidence for ${record.id}`} className="w-full max-h-64 object-contain bg-white border border-gray-100" />
        </div>
      )}
      {renderContent()}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="section-heading mb-3">Activity</div>
        <div className="space-y-3">
          {activity.map((entry, index) => (
            <div key={`${entry.label}-${index}`} className="flex gap-3 text-xs">
              <div className="flex flex-col items-center"><span className="w-2 h-2 mt-1.5 bg-[#176B3A]" />{index < activity.length - 1 && <span className="w-px flex-1 bg-gray-200 mt-1" />}</div>
              <div className="pb-1"><div className="text-gray-800 font-medium">{entry.label}</div><div className="text-gray-500">{entry.detail} · {entry.date || '—'}</div></div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
