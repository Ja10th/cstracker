import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const inputClass = 'w-full mt-1 border border-[#E1E5DF] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#176B3A]';
const seedSources = ['Seed', 'Budwood / scion', 'Grafting material', 'Clone', 'Other'];

function Field({ label, children, required = false }) {
  return <label className="block text-sm text-gray-700">{label}{required && <span className="text-[#D45417]"> *</span>}{children}</label>;
}

export default function ProductionPlanningPage() {
  const { currentUser, data, getVisible, addRecord, navigate } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [phase, setPhase] = useState(1);
  const nurseries = getVisible('nur');
  const allPlans = data.plan || [];
  const plans = useMemo(() => {
    if (currentUser.role === 'Administrator' || currentUser.role === 'Project Manager' || currentUser.role === 'Inspector') return allPlans;
    if (currentUser.role === 'Extension Officer') return allPlans.filter((plan) => currentUser.state?.split(',').map((item) => item.trim()).includes(plan.state));
    const ownNames = new Set(nurseries.map((nursery) => nursery.name));
    return allPlans.filter((plan) => ownNames.has(plan.nur));
  }, [allPlans, currentUser, nurseries]);
  const [form, setForm] = useState({
    nursery: nurseries[0]?.name || '', producer: currentUser.name, email: currentUser.email || '', mobile: '', organization: '',
    state: nurseries[0]?.state || '', zone: '', cacRegistered: '', city: '', country: 'Nigeria', fieldId: '', seedClass: '',
    plantingDate: '', variety: data.vars?.[0]?.name || '', target: '', length: '', width: '', photoName: '', seedSource: 'Seed',
    sourceOrganization: '', sourceYear: '', area: 'ha', soilType: '', previousCrop: '', surroundingCrops: '', comments: '',
  });

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const selectedNursery = nurseries.find((nursery) => nursery.name === form.nursery);

  function chooseNursery(event) {
    const nursery = nurseries.find((item) => item.name === event.target.value);
    setForm((current) => ({ ...current, nursery: event.target.value, state: nursery?.state || current.state }));
  }

  function getLocation() {
    setForm((current) => ({ ...current, location: selectedNursery ? `${selectedNursery.state}, Nigeria` : 'Location captured from device' }));
  }

  function submit(event) {
    event.preventDefault();
    addRecord('plan', { ...form, status: 'Submitted', submittedBy: currentUser.name, date: new Date().toISOString().slice(0, 10) });
    setShowForm(false);
    setPhase(1);
  }

  function next() {
    setPhase((current) => Math.min(3, current + 1));
  }

  return (
    <div className="p-3 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-xl font-semibold text-gray-900">Production planning</h1><p className="text-sm text-gray-500 mt-1">Submit and track planned Cocoa seed production before planting begins.</p></div>
        {(currentUser.role === 'Nursery Operator' || currentUser.role === 'Extension Officer') && <button onClick={() => setShowForm(true)} className="action-button">Start production plan</button>}
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <div className="px-5 py-4 border-b border-gray-200"><div className="section-heading">Production plan register</div><p className="text-sm text-gray-500 mt-1">Plans move from producer submission to extension validation and inspection review.</p></div>
        <table className="data-table w-full min-w-[760px] text-[14px]"><thead className="bg-[#FAF8F1] border-b border-gray-200"><tr>{['Plan ID', 'Seed Garden / producer', 'Variety', 'Target seedlings', 'Planting date', 'Status'].map((heading) => <th key={heading} className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-[#8B8576]">{heading}</th>)}</tr></thead><tbody>{plans.map((plan, index) => <tr key={plan.id} onClick={() => navigate('workflow', { workflowPageKey: 'plan', workflowRecordId: plan.id })} className={`border-b border-gray-100 cursor-pointer ${index % 2 ? 'bg-gray-50' : 'bg-white'} hover:bg-[#F7F3E9]`}><td className="px-4 py-3 font-mono text-[#176B3A]">{plan.id}</td><td className="px-4 py-3"><div className="font-semibold text-gray-800">{plan.nur}</div><div className="text-xs text-gray-500">{plan.producer}</div></td><td className="px-4 py-3 text-gray-700">{plan.variety}</td><td className="px-4 py-3 tabular-nums">{Number(plan.target).toLocaleString()}</td><td className="px-4 py-3 text-gray-600">{plan.plantingDate}</td><td className="px-4 py-3"><Badge status={plan.status} /></td></tr>)}</tbody></table>
        {!plans.length && <div className="px-5 py-10 text-center text-sm text-gray-400">No production plans found.</div>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New production plan">
        <p className="text-sm text-gray-500 mb-6">The producer submits this plan; the extension officer validates it before inspection.</p>
        <div className="flex items-center gap-2 mb-6 text-xs text-gray-500"><span className={`px-3 py-2 ${phase === 1 ? 'bg-[#176B3A] text-white' : 'bg-[#EAF5EE] text-[#176B3A]'}`}>Producer and seed garden</span><span className="h-px flex-1 bg-gray-200" /><span className={`px-3 py-2 ${phase === 2 ? 'bg-[#176B3A] text-white' : 'bg-[#EAF5EE] text-[#176B3A]'}`}>Site and source</span><span className="h-px flex-1 bg-gray-200" /><span className={`px-3 py-2 ${phase === 3 ? 'bg-[#176B3A] text-white' : 'bg-[#EAF5EE] text-[#176B3A]'}`}>Production plan</span></div>
        <form onSubmit={submit}>
          {phase === 1 && <div className="space-y-5"><div className="border-l-2 border-[#176B3A] bg-[#FAF8F1] px-4 py-3"><div className="text-xs uppercase tracking-wide text-[#8B8576]">Registered producer</div><div className="mt-1 text-sm font-semibold text-gray-900">{currentUser.name}</div><div className="text-xs text-gray-500">{currentUser.email} · {currentUser.role}</div><p className="text-xs text-gray-500 mt-2">These details come from your account registration and are not entered again.</p></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field label="Seed Garden" required><select required value={form.nursery} onChange={chooseNursery} className={inputClass}><option value="">Select seed garden</option>{nurseries.map((nursery) => <option key={nursery.id} value={nursery.name}>{nursery.name}</option>)}</select></Field><Field label="Production zone"><input value={form.zone} onChange={update('zone')} className={inputClass} placeholder="e.g. Ibadan North" /></Field></div></div>}
          {phase === 2 && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field label="Nearby city" required><input required value={form.city} onChange={update('city')} className={inputClass} /></Field><Field label="State" required><input required value={form.state} onChange={update('state')} className={inputClass} /></Field><Field label="Country" required><input required value={form.country} onChange={update('country')} className={inputClass} /></Field><Field label="Field or seed garden ID" required><input required value={form.fieldId} onChange={update('fieldId')} className={inputClass} /></Field><Field label="GPS location"><div className="flex gap-2"><input value={form.location || ''} readOnly className={`${inputClass} mt-1`} placeholder="Not captured" /><button type="button" onClick={getLocation} className="mt-1 px-3 border border-[#176B3A] text-[#176B3A] text-xs whitespace-nowrap">Get GPS</button></div></Field><Field label="Class of seed proposed"><input value={form.seedClass} onChange={update('seedClass')} className={inputClass} placeholder="e.g. certified planting material" /></Field><Field label="Variety name" required><select required value={form.variety} onChange={update('variety')} className={inputClass}>{data.vars.map((item) => <option key={item.id}>{item.name}</option>)}</select></Field><Field label="Proposed planting date" required><input required type="date" value={form.plantingDate} onChange={update('plantingDate')} className={inputClass} /></Field><Field label="Seed / planting material source" required><select required value={form.seedSource} onChange={update('seedSource')} className={inputClass}>{seedSources.map((source) => <option key={source}>{source}</option>)}</select></Field><Field label="Source organization"><input value={form.sourceOrganization} onChange={update('sourceOrganization')} className={inputClass} /></Field><Field label="Year source seed was produced"><input type="number" min="2000" max="2100" value={form.sourceYear} onChange={update('sourceYear')} className={inputClass} /></Field><Field label="Photo of field or seed garden"><input type="file" accept="image/*" onChange={(event) => setForm((current) => ({ ...current, photoName: event.target.files?.[0]?.name || '' }))} className="w-full mt-1 text-xs" /></Field></div>}
          {phase === 3 && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field label="Production target (seedlings)" required><input required type="number" min="1" value={form.target} onChange={update('target')} className={inputClass} /></Field><Field label="Unit of area" required><select required value={form.area} onChange={update('area')} className={inputClass}><option>ha</option><option>sq m</option></select></Field><Field label="Production area length (m)" required><input required type="number" min="0" value={form.length} onChange={update('length')} className={inputClass} /></Field><Field label="Production area width (m)" required><input required type="number" min="0" value={form.width} onChange={update('width')} className={inputClass} /></Field><Field label="Soil or substrate type"><input value={form.soilType} onChange={update('soilType')} className={inputClass} /></Field><Field label="Previous crop"><input value={form.previousCrop} onChange={update('previousCrop')} className={inputClass} /></Field><Field label="Crops around the field"><input value={form.surroundingCrops} onChange={update('surroundingCrops')} className={inputClass} /></Field><label className="block text-sm text-gray-700 sm:col-span-2">Other comments<textarea value={form.comments} onChange={update('comments')} className="w-full mt-1 border border-[#E1E5DF] p-3 text-sm min-h-24 focus:outline-none focus:border-[#176B3A]" /></label></div>}
          <div className="flex justify-between gap-3 mt-7 pt-5 border-t border-gray-200"><button type="button" onClick={() => phase === 1 ? setShowForm(false) : setPhase((current) => current - 1)} className="px-4 py-3 border border-gray-300 text-sm text-gray-700">{phase === 1 ? 'Cancel' : 'Back'}</button>{phase < 3 ? <button type="button" onClick={next} className="action-button">Next →</button> : <button type="submit" className="action-button">Submit production plan</button>}</div>
        </form>
      </Modal>
    </div>
  );
}
