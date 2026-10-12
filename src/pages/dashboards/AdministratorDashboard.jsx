import React from 'react';
import { useApp } from '../../context/AppContext';
import { DESC, MONTHS } from '../../data/seed';
import KpiCard from '../../components/KpiCard';
import VBar from '../../components/charts/VBar';
import LineChart from '../../components/charts/LineChart';
import Badge from '../../components/Badge';
import Icon from '../../components/Icon';
import FormModal from '../../components/FormModal';
import { DemoNote, HelpdeskAndGuidelines, PageHeader, qty } from './DashboardShared';

export default function AdministratorDashboard() {
  const { currentUser, data, getVisible, navigate, overviewPeriod, setOverviewPeriod } = useApp();
  const [showAdd, setShowAdd] = React.useState(false);
  const [productionState, setProductionState] = React.useState('');

  const nurseries = getVisible('nur');
  const production = getVisible('prod');
  const inspections = getVisible('insp');
  const distribution = getVisible('dist');

  const states = {};
  nurseries.forEach((record) => { states[record.state] = (states[record.state] || 0) + 1; });
  const pending = inspections.filter((record) => record.status === 'Pending');
  const latest = [...production].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const activeNurseries = nurseries.filter((record) => record.status === 'Active').length;
  const pendingNurseries = nurseries.filter((record) => record.status === 'Pending').length;
  const approvedProduction = production.filter((record) => record.status === 'Verified').length;
  const activeUsers = data.users.filter((record) => record.status === 'Active').length;
  const nurseryStateByName = Object.fromEntries(nurseries.map((record) => [record.name, record.state]));

  const monthNames = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

  const productionTrend = productionState
    ? (() => {
        const totals = {};
        production.filter((record) => nurseryStateByName[record.nur] === productionState).forEach((record) => {
          const month = monthNames[record.date.slice(5, 7)];
          totals[month] = (totals[month] || 0) + qty(record);
        });
        return MONTHS.slice(-overviewPeriod).map((month) => [month, totals[month] || 0]);
      })()
    : MONTHS.slice(-overviewPeriod).map((month, index) => [month, data.mon.slice(-overviewPeriod)[index] || 0]);

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <PageHeader
        title={`Welcome, ${currentUser.name.split(' ')[0]}`}
        description={DESC.Administrator}
        actions={
          <>
            <select
              value={overviewPeriod}
              onChange={(event) => setOverviewPeriod(Number(event.target.value))}
              className="app-select"
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
            <button
              onClick={() => navigate('infographics')}
              className="px-3 py-2 border border-emerald-700 bg-emerald-50 text-emerald-800 text-sm font-semibold hover:bg-emerald-100 flex items-center gap-1.5 min-h-[40px]"
            >
              <Icon name="chart" className="w-4 h-4" />
              View Infographics
            </button>
            <button onClick={() => setShowAdd(true)} className="action-button flex items-center gap-1.5">
              <Icon name="plus" className="w-3.5 h-3.5" />
              Register nursery
            </button>
          </>
        }
      />
      <DemoNote />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard label="Active nurseries" value={activeNurseries} sublabel={`${pendingNurseries} awaiting activation`} onClick={() => navigate('nur', { status: 'Active' })} />
        <KpiCard label="Seedlings recorded" value={production.reduce((sum, record) => sum + qty(record), 0).toLocaleString()} sublabel={`${approvedProduction} records approved`} onClick={() => navigate('prod')} />
        <KpiCard label="Review queue" value={pending.length} sublabel="Inspections waiting" onClick={() => navigate('insp', { status: 'Pending' })} />
        <KpiCard label="Distribution total" value={distribution.reduce((sum, record) => sum + qty(record), 0).toLocaleString()} sublabel="Seedlings delivered" onClick={() => navigate('dist')} />
        <KpiCard label="Active users" value={activeUsers} sublabel={`${data.users.length} accounts`} onClick={() => navigate('users')} />
      </div>

      {/* Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="section-heading">Production trend</div>
            <select value={productionState} onChange={(event) => setProductionState(event.target.value)} className="app-select">
              <option value="">All locations</option>
              {Object.keys(states).sort().map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>
          <VBar items={productionTrend} axisLabel="Seedlings recorded" />
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <div className="section-heading mb-4">Nurseries by state</div>
          <LineChart items={Object.entries(states).sort((a, b) => a[0].localeCompare(b[0]))} axisLabel="Registered nurseries" />
        </div>
      </div>

      {/* Latest Production Activity Table */}
      <div className="bg-white border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="section-heading">Latest production activity</span>
          <button onClick={() => navigate('prod')} className="text-sm text-[#176B3A] hover:underline">See more</button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full text-[14px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['ID', 'Nursery', 'Variety', 'Quantity', 'Date', 'Recorded by', 'Status'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 font-medium text-gray-600">{heading}</th>
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
                  <td className="px-4 py-3 text-gray-800 font-semibold truncate max-w-[150px]">{record.nur}</td>
                  <td className="px-4 py-3 text-gray-600">{record.variety}</td>
                  <td className="px-4 py-3 tabular-nums">{qty(record).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{record.date}</td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[120px]">{record.by}</td>
                  <td className="px-4 py-3"><Badge status={record.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {latest.length === 0 && <div className="px-5 py-8 text-center text-xs text-gray-400">No production records</div>}
        </div>
      </div>

      <HelpdeskAndGuidelines />
      <FormModal isOpen={showAdd} onClose={() => setShowAdd(false)} pageKey="nur" nurOptions={nurseries.map((record) => record.name)} varOptions={data.vars.map((record) => record.name)} />
    </div>
  );
}
