import React from 'react';
import { useApp } from '../../context/AppContext';
import KpiCard from '../../components/KpiCard';
import VBar from '../../components/charts/VBar';
import LineChart from '../../components/charts/LineChart';
import Badge from '../../components/Badge';
import Icon from '../../components/Icon';
import { MONTHS, DESC } from '../../data/seed';
import { DemoNote, HelpdeskAndGuidelines, PageHeader, qty } from './DashboardShared';

function InspectionWorkloadTable({ records, onOpen }) {
  return (
    <div className="bg-white border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
        <span className="section-heading">Inspection workload</span>
        <button onClick={() => onOpen()} className="text-xs text-[#176B3A] hover:underline">See more</button>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table w-full text-[14px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Reference', 'Nursery', 'Date', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-sm">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 5).map((record, index) => (
              <tr
                key={record.id}
                onClick={() => onOpen(record)}
                className={`cursor-pointer border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#F7F3E9]`}
              >
                <td className="px-4 py-3 font-mono text-gray-600 text-xs">{record.id}</td>
                <td className="px-4 py-3 text-gray-800 truncate max-w-[160px]">{record.nur}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{record.date}</td>
                <td className="px-4 py-3"><Badge status={record.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!records.length && <div className="px-5 py-8 text-center text-xs text-gray-400">No inspections yet</div>}
      </div>
    </div>
  );
}

export default function ProjectManagerDashboard() {
  const { currentUser, data, getVisible, navigate } = useApp();

  const nurseries   = getVisible('nur');
  const production  = getVisible('prod');
  const inspections = getVisible('insp');

  const pending  = inspections.filter((r) => r.status === 'Pending' || r.status === 'In Review');
  const rejected = production.filter((r) => r.status === 'Rejected');
  const recent   = [...inspections].sort((a, b) => b.date.localeCompare(a.date));
  const latest   = [...production].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  // Nurseries by state (line chart)
  const states = {};
  nurseries.forEach((r) => { states[r.state] = (states[r.state] || 0) + 1; });

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <PageHeader
        title={`Welcome, ${currentUser?.name?.split(' ')[0] || 'Project Manager'}`}
        description={DESC['Project Manager']}
        actions={
          <button
            onClick={() => navigate('infographics')}
            className="px-3 py-2 border border-emerald-700 bg-emerald-50 text-emerald-800 text-sm font-semibold hover:bg-emerald-100 flex items-center gap-1.5 min-h-[40px]"
          >
            <Icon name="chart" className="w-4 h-4" />
            View Infographics &amp; Reports
          </button>
        }
      />
      <DemoNote />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Active nurseries"   value={nurseries.filter((r) => r.status === 'Active').length}  sublabel={`${nurseries.length} total`}          onClick={() => navigate('nur')} />
        <KpiCard label="Seedlings recorded" value={production.reduce((s, r) => s + qty(r), 0).toLocaleString()} sublabel={`${production.length} records`} onClick={() => navigate('prod')} />
        <KpiCard label="Review workload"    value={pending.length}  sublabel="Pending or in review"                                                        onClick={() => navigate('insp', { status: 'Pending' })} />
        <KpiCard label="Rejected records"   value={rejected.length} sublabel="Requires follow-up"                                                          onClick={() => navigate('prod', { status: 'Rejected' })} />
      </div>

      {/* Top charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 p-5">
          <div className="section-heading mb-4">Production trend</div>
          <VBar items={MONTHS.slice(-6).map((m, i) => [m, data?.mon?.slice(-6)[i] || 0])} axisLabel="Seedlings recorded" />
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <div className="section-heading mb-4">Nurseries by state</div>
          <LineChart items={Object.entries(states).sort((a, b) => a[0].localeCompare(b[0]))} axisLabel="Registered nurseries" />
        </div>
      </div>

      {/* Workload + recent production tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InspectionWorkloadTable
          records={recent}
          onOpen={(record) =>
            record
              ? navigate('workflow', { workflowPageKey: 'insp', workflowRecordId: record.id })
              : navigate('insp')
          }
        />
        <div className="bg-white border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <span className="section-heading">Recent production activity</span>
            <button onClick={() => navigate('prod')} className="text-xs text-[#176B3A] hover:underline">See more</button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full text-[14px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Reference', 'Nursery', 'Quantity', 'Date', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latest.map((record, index) => (
                  <tr
                    key={record.id}
                    onClick={() => navigate('workflow', { workflowPageKey: record.planId ? 'plan' : 'prod', workflowRecordId: record.planId || record.id })}
                    className={`cursor-pointer border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#F7F3E9]`}
                  >
                    <td className="px-4 py-3 font-mono text-gray-600 text-xs">{record.id}</td>
                    <td className="px-4 py-3 text-gray-800 truncate max-w-[140px]">{record.nur}</td>
                    <td className="px-4 py-3 tabular-nums">{qty(record).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{record.date}</td>
                    <td className="px-4 py-3"><Badge status={record.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!latest.length && <div className="px-5 py-8 text-center text-xs text-gray-400">No production records</div>}
          </div>
        </div>
      </div>

      <HelpdeskAndGuidelines />
    </div>
  );
}
