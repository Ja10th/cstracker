import React from 'react';
import { useApp } from '../../context/AppContext';
import KpiCard from '../../components/KpiCard';
import Badge from '../../components/Badge';
import { DemoNote, HelpdeskAndGuidelines, PageHeader } from './DashboardShared';

function ReviewQueueTable({ records, onOpen, onRecordClick }) {
  return (
    <div className="bg-white border border-gray-200 overflow-x-auto">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <span className="section-heading">Review queue</span>
        <button onClick={onOpen} className="text-xs text-[#176B3A] hover:underline">Open list</button>
      </div>
      {records.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-gray-400">Queue is clear — no pending inspections.</div>
      ) : (
        <table className="data-table w-full min-w-[480px] text-[14px]">
          <thead className="bg-[#FAF8F1] border-b border-gray-200">
            <tr>
              {['Reference', 'Nursery', 'Date', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs uppercase font-semibold text-[#8B8576]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 6).map((record, index) => (
              <tr
                key={record.id}
                onClick={() => onRecordClick(record)}
                className={`cursor-pointer border-b border-gray-100 hover:bg-[#F7F3E9] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-4 py-3 font-mono text-[#176B3A] font-semibold">{record.id}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{record.nur}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{record.date}</td>
                <td className="px-4 py-3"><Badge status={record.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function InspectionActivityTable({ records, onOpen }) {
  return (
    <div className="bg-white border border-gray-200 overflow-x-auto">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <span className="section-heading">Recent inspection activity</span>
        <button onClick={() => onOpen()} className="text-xs text-[#176B3A] hover:underline">Open list</button>
      </div>
      <table className="data-table w-full min-w-[560px] text-[14px]">
        <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Reference', 'Nursery', 'Date', 'Status'].map((heading) => <th key={heading} className="text-left px-4 py-3 font-medium text-gray-600">{heading}</th>)}</tr></thead>
        <tbody>{records.slice(0, 5).map((record, index) => <tr key={record.id} onClick={() => onOpen(record)} className={`cursor-pointer border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#F7F3E9]`}><td className="px-4 py-3 font-mono text-gray-600">{record.id}</td><td className="px-4 py-3 text-gray-800">{record.nur}</td><td className="px-4 py-3 text-gray-500">{record.date}</td><td className="px-4 py-3"><Badge status={record.status} /></td></tr>)}</tbody>
      </table>
    </div>
  );
}

export default function InspectorDashboard() {
  const { currentUser, getVisible, navigate } = useApp();
  const inspections = getVisible('insp');
  const production = getVisible('prod');
  const pending = inspections.filter((record) => record.status === 'Pending');
  const inReview = inspections.filter((record) => record.status === 'In Review');
  const approved = inspections.filter((record) => record.status === 'Verified');

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <PageHeader title="Inspector workspace" description={`Welcome, ${currentUser.name.split(' ')[0]}. Review assigned production records and submit decisions.`} actions={<button onClick={() => navigate('insp', { status: 'Pending' })} className="action-button">Open review queue</button>} />
      <DemoNote />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><KpiCard label="Assigned inspections" value={inspections.length} sublabel="Your inspection records" /><KpiCard label="Waiting for review" value={pending.length} sublabel="Start here" onClick={() => navigate('insp', { status: 'Pending' })} /><KpiCard label="In review" value={inReview.length} sublabel="Needs follow-up" /><KpiCard label="Approved" value={approved.length} sublabel="Completed decisions" /></div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ReviewQueueTable
          records={pending}
          onOpen={() => navigate('insp', { status: 'Pending' })}
          onRecordClick={(record) => navigate('workflow', { workflowPageKey: 'insp', workflowRecordId: record.id })}
        />
        <InspectionActivityTable
          records={[...inspections].sort((a, b) => b.date.localeCompare(a.date))}
          onOpen={(record) => record ? navigate('workflow', { workflowPageKey: 'insp', workflowRecordId: record.id }) : navigate('insp')}
        />
      </div>
      <HelpdeskAndGuidelines />
      <div className="text-xs text-gray-500">You can see {production.length} linked production records assigned to your inspections.</div>
    </div>
  );
}
