import React from 'react';
import { useApp } from '../../context/AppContext';
import KpiCard from '../../components/KpiCard';
import FormModal from '../../components/FormModal';
import ProductionPlanModal from '../../components/ProductionPlanModal';
import { DemoNote, HelpdeskAndGuidelines, PageHeader, RecordsTable, qty } from './DashboardShared';

export default function ExtensionOfficerDashboard() {
  const { currentUser, data, getVisible, can, navigate } = useApp();
  const [showAdd, setShowAdd] = React.useState(false);
  const [addKey, setAddKey] = React.useState('nur');
  const nurseries = getVisible('nur');
  const production = getVisible('prod');
  const inspections = getVisible('insp').filter((inspection) => nurseries.some((nursery) => nursery.name === inspection.nur));
  const pending = production.filter((record) => record.status === 'Pending' || record.status === 'In Review');
  const openForm = (key) => { setAddKey(key); setShowAdd(true); };

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <PageHeader title="Extension workspace" description={`Welcome, ${currentUser.name.split(' ')[0]}. Support farmers and manage your assigned area.`} actions={<>{can('nur') && <button onClick={() => openForm('nur')} className="px-4 py-2 border border-[#FF5A1F] text-[#FF5A1F] text-sm font-semibold hover:bg-orange-50 min-h-[40px] flex items-center justify-center">Add seed garden</button>}{can('prod') && <button onClick={() => openForm('prod')} className="action-button">Record production</button>}</>} />
      <DemoNote />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><KpiCard label="Managed seed gardens" value={nurseries.length} sublabel="Your assigned area" onClick={() => navigate('nur')} /><KpiCard label="Seedlings recorded" value={production.reduce((sum, record) => sum + qty(record), 0).toLocaleString()} sublabel={`${production.length} production records`} onClick={() => navigate('prod')} /><KpiCard label="Needs inspection" value={pending.length} sublabel="Follow up with inspectors" onClick={() => navigate('prod', { status: 'Pending' })} /><KpiCard label="Linked inspections" value={inspections.length} sublabel="Records in your area" onClick={() => navigate('insp')} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><RecordsTable title="Recent field activity" records={[...production].sort((a, b) => b.date.localeCompare(a.date))} empty="No production records yet." onRecordClick={(record) => navigate('workflow', { workflowPageKey: 'prod', workflowRecordId: record.id })} columns={['status', 'date', 'by']} /><RecordsTable title="Seed gardens in my area" records={nurseries} empty="No seed gardens assigned." onRecordClick={(record) => navigate('workflow', { workflowPageKey: 'nur', workflowRecordId: record.id })} columns={['status', 'date']} /></div>
      <HelpdeskAndGuidelines />
      {addKey === 'prod' ? <ProductionPlanModal isOpen={showAdd} onClose={() => setShowAdd(false)} nurOptions={nurseries.map((record) => record.name)} varOptions={data.vars.map((record) => record.name)} /> : <FormModal isOpen={showAdd} onClose={() => setShowAdd(false)} pageKey={addKey} nurOptions={nurseries.map((record) => record.name)} varOptions={data.vars.map((record) => record.name)} />}
    </div>
  );
}
