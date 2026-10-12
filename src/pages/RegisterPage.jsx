import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import logo from '../assets/IITA-Logo-finalll.png';

const roles = [
  { value: 'Nursery Operator', label: 'Farmer / Nursery operator' },
  { value: 'Extension Officer', label: 'Extension officer' },
  { value: 'Inspector', label: 'Inspector' },
  { value: 'Project Manager', label: 'Project manager' },
];

const userTypeOptions = ['Farmer', 'Cacao seed producer', 'Extension officer', 'Inspector', 'Researcher', 'Nursery operator', 'Trader', 'Regulator', 'Other'];
const professionOptions = ['Farming', 'Agronomy', 'Research', 'Seed certification', 'Seed business', 'Extension services', 'Administration', 'Other'];
const organizationTypes = ['Government', 'NGO', 'University', 'Research center', 'Private sector', 'Community organization', 'Other'];
const affiliations = ['IITA', 'Cocoa Research Institute', 'FMARD', 'HarvestPlus', 'IFAD', 'Other', 'Not applicable'];

export default function RegisterPage({ onBack }) {
  const { addRecord, data } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState(1);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'Nursery Operator',
    state: '', lga: '', organization: '', address: '', nurseryName: '',
    farmSize: '', photoName: '', gender: '', profession: '', organizationType: '',
    description: '', latitude: '', longitude: '', affiliation: 'Not applicable',
    otherAffiliation: '', userTypes: [], otherUserType: '', displayPhone: true,
    displayEmail: true, terms: false, nurserySituation: 'none', existingNurseryId: '',
    productionReady: 'no',
  });

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const toggleUserType = (type) => setForm((current) => ({ ...current, userTypes: current.userTypes.includes(type) ? current.userTypes.filter((item) => item !== type) : [...current.userTypes, type] }));

  function nextPhase() {
    const nurseryChecks = form.nurserySituation === 'existing'
      ? [form.existingNurseryId]
      : form.nurserySituation === 'new'
        ? [form.nurseryName]
        : [];
    const checks = phase === 1
      ? [form.name, form.email, form.phone, form.password, form.gender, form.profession, form.organizationType, form.description]
      : [form.state, form.lga, form.address, form.nurserySituation, ...nurseryChecks];
    if (checks.some((value) => !String(value).trim())) {
      setError('Complete the required fields in this phase before continuing.');
      return;
    }
    setError('');
    setPhase((current) => current + 1);
  }

  function submit(event) {
    event.preventDefault();
    if (!form.userTypes.length) {
      setError('Select at least one user type before submitting.');
      return;
    }
    setError('');
    addRecord('users', {
      name: form.name,
      email: form.email,
      role: form.role,
      scope: form.state || 'Pending verification',
      status: 'Pending',
      last: 'Never',
      phone: form.phone,
      lga: form.lga,
      organization: form.organization,
      address: form.address,
      nursery: form.nurseryName,
      nurserySituation: form.nurserySituation,
      existingNurseryId: form.existingNurseryId,
      productionReady: form.productionReady,
      farmSize: form.farmSize,
      photoName: form.photoName,
      gender: form.gender,
      profession: form.profession,
      organizationType: form.organizationType,
      description: form.description,
      coordinates: { latitude: form.latitude, longitude: form.longitude },
      affiliation: form.affiliation,
      otherAffiliation: form.otherAffiliation,
      userTypes: form.userTypes,
      otherUserType: form.otherUserType,
      contactVisibility: { phone: form.displayPhone, email: form.displayEmail },
      registrationStatus: 'Pending approval',
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F8F6] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 p-6 sm:p-8 text-center">
          <img src={logo} alt="IITA logo" className="w-48 h-auto object-contain mx-auto mb-6" />
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-[#EAF5EE] text-[#176B3A] text-xl">✓</div>
          <h1 className="text-xl font-semibold text-gray-900">Registration submitted</h1>
          <p className="mt-3 text-sm text-gray-600 leading-6">Your account is pending verification. An extension officer or project administrator will review your details before access is activated.</p>
          <button type="button" onClick={onBack} className="action-button mt-6 w-full">Return to sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          <img src={logo} alt="IITA logo" className="w-52 h-auto object-contain" />
        </div>
        <div className="bg-white border border-gray-200 shadow-sm p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create an account</h1>
              <p className="text-sm text-gray-500 mt-1">Register to work with the Cacao Seed Tracker.</p>
            </div>
            <button type="button" onClick={onBack} className="text-sm text-[#176B3A] hover:text-[#D45417] hover:underline">Sign in</button>
          </div>

          <div className="flex items-center gap-2 mb-6" aria-label={`Registration phase ${phase} of 3`}>
            {['Account & identity', 'Role & location', 'Affiliation & consent'].map((label, index) => <React.Fragment key={label}><div className={`flex items-center gap-2 text-xs whitespace-nowrap ${phase === index + 1 ? 'text-[#176B3A] font-semibold' : phase > index + 1 ? 'text-[#176B3A]' : 'text-gray-400'}`}><span className={`w-2.5 h-2.5 rounded-full ${phase >= index + 1 ? 'bg-[#176B3A]' : 'bg-gray-200'}`} />{label}</div>{index < 2 && <span className={`h-px flex-1 ${phase > index + 1 ? 'bg-[#A8D5B5]' : 'bg-gray-200'}`} />}</React.Fragment>)}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {phase === 1 && <>
            <section className="py-1">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Account information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-gray-700">Full name<input required value={form.name} onChange={update('name')} className="app-input w-full mt-1 pl-3" placeholder="Enter your full name" /></label>
                <label className="text-sm text-gray-700">Email address<input required type="email" value={form.email} onChange={update('email')} className="app-input w-full mt-1 pl-3" placeholder="you@example.org" /></label>
                <label className="text-sm text-gray-700">Phone number<input required value={form.phone} onChange={update('phone')} className="app-input w-full mt-1 pl-3" placeholder="0800 000 0000" /></label>
                <label className="text-sm text-gray-700">Password<input required type="password" minLength={8} value={form.password} onChange={update('password')} className="app-input w-full mt-1 pl-3" placeholder="At least 8 characters" /></label>
                <label className="text-sm text-gray-700">Gender<select required value={form.gender} onChange={update('gender')} className="app-select w-full mt-1"><option value="">Select gender</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label>
                <label className="text-sm text-gray-700">Profile picture<input type="file" accept="image/png,image/jpeg,image/gif" onChange={(event) => setForm((current) => ({ ...current, photoName: event.target.files?.[0]?.name || '' }))} className="w-full mt-1 text-xs text-gray-600 file:mr-3 file:border-0 file:bg-[#FAF8F1] file:px-3 file:py-2 file:text-xs" /></label>
              </div>
            </section>

            <section className="py-1">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Professional information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-gray-700">Profession<select required value={form.profession} onChange={update('profession')} className="app-select w-full mt-1"><option value="">Select profession</option>{professionOptions.map((profession) => <option key={profession}>{profession}</option>)}</select></label>
                <label className="text-sm text-gray-700">Organization type<select required value={form.organizationType} onChange={update('organizationType')} className="app-select w-full mt-1"><option value="">Select organization type</option>{organizationTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              </div>
              <label className="block text-sm text-gray-700 mt-4">Briefly describe what you do <span className="text-gray-400">(500 characters max)</span><textarea required maxLength={500} value={form.description} onChange={update('description')} className="w-full mt-1 border border-[#E1E5DF] p-3 text-sm min-h-24 focus:outline-none focus:border-[#176B3A]" placeholder="Describe your work with cacao or seed systems" /></label>
            </section>
            </>}

            {phase === 2 && <>
            <section className="py-1">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Your role</h2>
              <label className="text-sm text-gray-700">I am registering as<select value={form.role} onChange={update('role')} className="app-select w-full mt-1">{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
              <p className="text-xs text-gray-500 mt-2">Privileged roles still require approval before access is granted.</p>
            </section>

            <section className="py-1">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Location and organization</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-gray-700">State<select required value={form.state} onChange={update('state')} className="app-select w-full mt-1"><option value="">Select state</option>{['Oyo', 'Ondo', 'Osun', 'Ekiti', 'Ogun'].map((state) => <option key={state}>{state}</option>)}</select></label>
                <label className="text-sm text-gray-700">LGA / community<input required value={form.lga} onChange={update('lga')} className="app-input w-full mt-1 pl-3" placeholder="Enter LGA or community" /></label>
                <label className="text-sm text-gray-700">Organization<input value={form.organization} onChange={update('organization')} className="app-input w-full mt-1 pl-3" placeholder="Organization name" /></label>
                <label className="text-sm text-gray-700">Address<input required value={form.address} onChange={update('address')} className="app-input w-full mt-1 pl-3" placeholder="Street or farm address" /></label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <label className="text-sm text-gray-700">Latitude <span className="text-gray-400">(optional)</span><input inputMode="decimal" value={form.latitude} onChange={update('latitude')} className="app-input w-full mt-1 pl-3" placeholder="e.g. 7.3775" /></label>
                <label className="text-sm text-gray-700">Longitude <span className="text-gray-400">(optional)</span><input inputMode="decimal" value={form.longitude} onChange={update('longitude')} className="app-input w-full mt-1 pl-3" placeholder="e.g. 3.9470" /></label>
              </div>
            </section>

            {(form.role === 'Nursery Operator') && (
              <section className="py-1">
                <h2 className="text-base font-semibold text-gray-900 mb-1">Nursery connection</h2>
                <p className="text-sm text-gray-500 mb-4">Tell us whether you already operate a nursery. Activation and location verification happen after registration.</p>
                <label className="text-sm text-gray-700">What best describes you?<select required value={form.nurserySituation} onChange={update('nurserySituation')} className="app-select w-full mt-1"><option value="none">I do not have a nursery yet</option><option value="existing">I already work with a registered nursery</option><option value="new">I want to register a new nursery</option></select></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {form.nurserySituation === 'existing' && <label className="text-sm text-gray-700">Registered nursery<select required value={form.existingNurseryId} onChange={(event) => { const nursery = data.nur.find((item) => item.id === event.target.value); setForm((current) => ({ ...current, existingNurseryId: event.target.value, nurseryName: nursery?.name || '' })); }} className="app-select w-full mt-1"><option value="">Select nursery</option>{(data.nur || []).map((nursery) => <option key={nursery.id} value={nursery.id}>{nursery.id} · {nursery.name}</option>)}</select></label>}
                  {form.nurserySituation === 'new' && <label className="text-sm text-gray-700">Proposed nursery name<input required value={form.nurseryName} onChange={update('nurseryName')} className="app-input w-full mt-1 pl-3" placeholder="Enter nursery name" /></label>}
                  <label className="text-sm text-gray-700">Farm or nursery size <span className="text-gray-400">(optional)</span><input value={form.farmSize} onChange={update('farmSize')} className="app-input w-full mt-1 pl-3" placeholder="e.g. 2 hectares" /></label>
                </div>
                <label className="block text-sm text-gray-700 mt-4">Do you have production ready to register now?<select value={form.productionReady} onChange={update('productionReady')} className="app-select w-full mt-1"><option value="yes">Yes — I will record it after approval</option><option value="no">No — I am preparing for future production</option></select></label>
                <p className="text-xs text-gray-500 mt-2">Production details, quantities, photos, and evidence are captured in My Production after your nursery connection is reviewed.</p>
              </section>
            )}
            </>}

            {phase === 3 && <>
            <section className="py-1">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Project affiliation and user type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-gray-700">Affiliation to seed projects<select value={form.affiliation} onChange={update('affiliation')} className="app-select w-full mt-1">{affiliations.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="text-sm text-gray-700">Other affiliation <span className="text-gray-400">(if applicable)</span><input value={form.otherAffiliation} onChange={update('otherAffiliation')} className="app-input w-full mt-1 pl-3" placeholder="Project or program name" /></label>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-700 mb-2">Please select all user types that apply</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{userTypeOptions.map((type) => <label key={type} className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.userTypes.includes(type)} onChange={() => toggleUserType(type)} className="accent-[#176B3A]" />{type}</label>)}</div>
                <input value={form.otherUserType} onChange={update('otherUserType')} className="app-input w-full mt-3 pl-3" placeholder="Specify another user type" />
              </div>
            </section>

            <section className="py-1">
              <h2 className="text-base font-semibold text-gray-900 mb-4">User agreement</h2>
              <div className="space-y-2 text-sm text-gray-600"><label className="flex items-start gap-3"><input type="checkbox" checked={form.displayPhone} onChange={(event) => setForm((current) => ({ ...current, displayPhone: event.target.checked }))} className="mt-1 accent-[#176B3A]" />Allow registered project users to view my phone number.</label><label className="flex items-start gap-3"><input type="checkbox" checked={form.displayEmail} onChange={(event) => setForm((current) => ({ ...current, displayEmail: event.target.checked }))} className="mt-1 accent-[#176B3A]" />Allow registered project users to view my email address.</label><label className="flex items-start gap-3"><input required type="checkbox" checked={form.terms} onChange={(event) => setForm((current) => ({ ...current, terms: event.target.checked }))} className="mt-1 accent-[#176B3A]" />I agree to the Cacao Seed Tracker terms and confirm that these details are accurate.</label></div>
            </section>
            </>}
            {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button type="button" onClick={() => { setError(''); setPhase((current) => Math.max(1, current - 1)); }} className={`px-4 py-4 border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 ${phase === 1 ? 'invisible' : ''}`}>Back</button>
              {phase < 3 ? <button type="button" onClick={nextPhase} className="action-button">Next →</button> : <button type="submit" className="action-button">Submit registration</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
