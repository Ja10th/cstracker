import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { STATES } from '../data/seed';
import Modal from './Modal';

const TODAY = new Date().toISOString().slice(0, 10);

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">{label}</label>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

const inputCls = 'border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#176B3A] w-full bg-white';

export default function FormModal({ isOpen, onClose, pageKey, editRecord: editRec, nurOptions = [], varOptions = [] }) {
  const { addRecord, editRecord, currentUser } = useApp();
  const isEdit = !!editRec;

  const blank = () => {
    if (pageKey === 'nur') {
      return { name: '', op: '', state: '', lga: '', date: TODAY, status: 'Active', photo: '' };
    }
    if (pageKey === 'users') {
      return { name: '', email: '', role: 'Project Manager', scope: 'All states', status: 'Active', last: 'Never' };
    }
    if (pageKey === 'dist') {
      return {
        nur: nurOptions[0] || 'Ibadan Cacao Hub',
        prod: '',
        variety: varOptions[0] || 'Hybrid Type A',
        qty: '',
        to: '',
        dest: 'Oyo',
        date: TODAY,
        status: 'In Transit',
      };
    }
    return { nur: nurOptions.length === 1 ? nurOptions[0] : '', variety: varOptions[0] || '', qty: '', date: TODAY, by: currentUser?.name || '', status: 'Pending', photo: '' };
  };

  const [form, setForm] = useState(blank());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(editRec ? { ...editRec } : blank());
      setErrors({});
    }
    // eslint-disable-next-line
  }, [isOpen, editRec, pageKey]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('photo', reader.result);
    reader.readAsDataURL(file);
  }

  function validate() {
    const e = {};
    if (pageKey === 'nur') {
      if (!form.name?.trim()) e.name = 'Name is required.';
      if (!form.op?.trim()) e.op = 'Operator is required.';
      if (!form.state) e.state = 'State is required.';
      if (!form.lga?.trim()) e.lga = 'LGA is required.';
      if (!form.date) e.date = 'Date is required.';
      else if (form.date > TODAY) e.date = 'Date cannot be in the future.';
    } else if (pageKey === 'users') {
      if (!form.name?.trim()) e.name = 'Full name is required.';
      if (!form.email?.trim()) e.email = 'Valid email address is required.';
      if (!form.role) e.role = 'Role is required.';
    } else if (pageKey === 'dist') {
      if (!form.nur) e.nur = 'Source nursery is required.';
      if (!form.to?.trim()) e.to = 'Recipient farmer or cooperative is required.';
      if (!form.dest) e.dest = 'Destination state is required.';
      if (!form.qty) {
        e.qty = 'Quantity is required.';
      } else {
        const n = parseInt(form.qty, 10);
        if (!Number.isInteger(n) || n < 1) e.qty = 'Quantity must be a positive number.';
      }
      if (!form.date) e.date = 'Date is required.';
    } else {
      if (!form.nur) e.nur = 'Nursery is required.';
      if (!form.variety) e.variety = 'Variety is required.';
      if (!form.qty) {
        e.qty = 'Quantity is required.';
      } else {
        const n = parseInt(form.qty, 10);
        if (!Number.isInteger(n) || n < 1 || n > 500000) e.qty = 'Quantity must be a whole number between 1 and 500,000.';
      }
      if (!form.date) e.date = 'Date is required.';
      else if (form.date > TODAY) e.date = 'Date cannot be in the future.';
      if (!form.by?.trim()) e.by = 'Recorded by is required.';
    }
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = { ...form };
    if (payload.qty) payload.qty = String(parseInt(payload.qty, 10));

    if (isEdit) {
      editRecord(pageKey, editRec.id, payload);
    } else {
      addRecord(pageKey, payload);
    }
    onClose();
  }

  const title = isEdit
    ? `Edit ${pageKey === 'nur' ? 'Nursery' : pageKey === 'users' ? 'User Account' : pageKey === 'dist' ? 'Distribution Record' : 'Production Record'}`
    : `Add ${pageKey === 'nur' ? 'Nursery' : pageKey === 'users' ? 'User / Staff Account' : pageKey === 'dist' ? 'Seedling Distribution' : 'Production Record'}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="action-button"
          >
            {isEdit ? 'Save Changes' : 'Add Record'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {pageKey === 'nur' ? (
          <>
            <Field label="Nursery Name" error={errors.name}>
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ibadan Cacao Hub" />
            </Field>
            <Field label="Operator" error={errors.op}>
              <input className={inputCls} value={form.op} onChange={e => set('op', e.target.value)} placeholder="e.g. A. Ogunleye" />
            </Field>
            <Field label="State" error={errors.state}>
              <select className={`${inputCls} app-select`} value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">— Select State —</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="LGA" error={errors.lga}>
              <input className={inputCls} value={form.lga} onChange={e => set('lga', e.target.value)} placeholder="e.g. Ibadan North" />
            </Field>
            <Field label="Registration Date" error={errors.date}>
              <input type="date" className={inputCls} value={form.date} max={TODAY} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label="Status">
              <select className={`${inputCls} app-select`} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
            <Field label="Nursery photo (optional)">
              <input type="file" accept="image/*" onChange={handlePhoto} className="w-full border border-gray-200 px-3 py-2 text-xs bg-white" />
              {form.photo && <img src={form.photo} alt="Nursery evidence preview" className="mt-2 h-24 w-full object-cover border border-gray-200" />}
            </Field>
          </>
        ) : pageKey === 'users' ? (
          <>
            <Field label="Full Name" error={errors.name}>
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Segun Balogun" />
            </Field>
            <Field label="Email Address" error={errors.email}>
              <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="e.g. s.balogun@iita.org" />
            </Field>
            <Field label="Role" error={errors.role}>
              <select className={`${inputCls} app-select`} value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="Administrator">Administrator (IITA HQ)</option>
                <option value="Project Manager">Project Manager (National / Regional)</option>
                <option value="Inspector">Inspector (Phytosanitary Certification)</option>
                <option value="Extension Officer">Extension Officer (Zonal Support)</option>
                <option value="Nursery Operator">Nursery Operator / Farmer</option>
              </select>
            </Field>
            <Field label="State / Scope">
              <select className={`${inputCls} app-select`} value={form.scope} onChange={e => set('scope', e.target.value)}>
                <option value="All states">All states (National Scope)</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Account Status">
              <select className={`${inputCls} app-select`} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Active">Active (Immediate access)</option>
                <option value="Pending">Pending (Requires admin verification)</option>
                <option value="Inactive">Inactive (Suspended)</option>
              </select>
            </Field>
          </>
        ) : pageKey === 'dist' ? (
          <>
            <Field label="Source Nursery" error={errors.nur}>
              <select className={`${inputCls} app-select`} value={form.nur} onChange={e => set('nur', e.target.value)}>
                <option value="">— Select Source Nursery —</option>
                {nurOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Recipient Farmer / Cooperative Group" error={errors.to}>
              <input className={inputCls} value={form.to} onChange={e => set('to', e.target.value)} placeholder="e.g. Ido Farmers Cooperative Society" />
            </Field>
            <Field label="Destination State" error={errors.dest}>
              <select className={`${inputCls} app-select`} value={form.dest} onChange={e => set('dest', e.target.value)}>
                <option value="">— Select Destination State —</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Seedling Variety">
              <select className={`${inputCls} app-select`} value={form.variety} onChange={e => set('variety', e.target.value)}>
                {varOptions.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Quantity to Distribute" error={errors.qty}>
              <input
                type="number"
                className={inputCls}
                value={form.qty}
                onChange={e => set('qty', e.target.value)}
                placeholder="e.g. 3,500"
                min="1"
              />
            </Field>
            <Field label="Dispatch Date" error={errors.date}>
              <input type="date" className={inputCls} value={form.date} max={TODAY} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label="Delivery Status">
              <select className={`${inputCls} app-select`} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="In Transit">In Transit (Dispatched from nursery)</option>
                <option value="Received">Received (Handed over to farmers)</option>
                <option value="Recorded">Recorded (Pending dispatch)</option>
              </select>
            </Field>
          </>
        ) : (
          <>
            <Field label="Nursery" error={errors.nur}>
              <select className={`${inputCls} app-select`} value={form.nur} onChange={e => set('nur', e.target.value)}>
                <option value="">— Select Nursery —</option>
                {nurOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Variety" error={errors.variety}>
              <select className={`${inputCls} app-select`} value={form.variety} onChange={e => set('variety', e.target.value)}>
                <option value="">— Select Variety —</option>
                {varOptions.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Quantity" error={errors.qty}>
              <input
                type="number"
                className={inputCls}
                value={form.qty}
                onChange={e => set('qty', e.target.value)}
                placeholder="1 – 500,000"
                min="1"
                max="500000"
                step="1"
              />
            </Field>
            <Field label="Date Recorded" error={errors.date}>
              <input type="date" className={inputCls} value={form.date} max={TODAY} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label="Recorded By" error={errors.by}>
              <input className={`${inputCls} bg-gray-50`} value={form.by} readOnly aria-readonly="true" />
            </Field>
            <Field label="Photo evidence (optional)">
              <input type="file" accept="image/*" onChange={handlePhoto} className="w-full border border-gray-200 px-3 py-2 text-xs bg-white" />
              {form.photo && <img src={form.photo} alt="Production evidence preview" className="mt-2 h-24 w-full object-cover border border-gray-200" />}
            </Field>
          </>
        )}
      </form>
    </Modal>
  );
}
