import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import DecideModal from '../components/DecideModal';

const INSPECTION_STAGES = ['Recorded', 'Site inspection', 'Evidence checked', 'Decision', 'Completed'];
const PRODUCTION_STAGES = ['Recorded', 'Under inspection', 'Decision', 'Approved', 'Distributed'];
const NURSERY_STAGES = ['Registered', 'Operator assigned', 'Location verified', 'Active'];
const PLAN_STAGES = ['Plan submitted', 'Extension validation', 'Plan approved', 'Production recorded', 'Inspection', 'Ready for distribution'];
const DISTRIBUTION_STAGES = ['Batch certified', 'Dispatched from nursery', 'In transit', 'Delivered & received'];

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
  nur: 'nursery registry',
  dist: 'distribution records',
};

export default function WorkflowPage() {
  const { data, filters, navigate, can, currentUser, editRecord, addRecord } = useApp();
  const workflow = filters.workflow || {};
  const pageKey = workflow.workflowPageKey || 'insp';
  const record = data[pageKey]?.find((item) => item.id === workflow.workflowRecordId);
  const [showDecide, setShowDecide] = useState(false);

  const isSuperUser = currentUser?.role === 'Administrator' || currentUser?.role === 'Project Manager';
  const isExtension = currentUser?.role === 'Extension Officer';

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
        actor: linkedProd?.by || 'Nursery operator',
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
        detail: `Physical nursery audit conducted at ${record.nur}.`,
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
        detail: linkedInsp?.sum || `Status: ${record.status}.`,
        done: ['Verified', 'Rejected'].includes(record.status),
        isDecision: true,
      },
      ...(linkedDists.length > 0 ? linkedDists.map((d) => ({
        title: `Seedlings distributed — ${d.to}`,
        date: d.date,
        actor: d.to,
        detail: `${Number(d.qty).toLocaleString()} seedlings delivered to ${d.to} in ${d.dest}. Status: ${d.status}.`,
        done: true,
      })) : []),
    ];
  } else if (isDistribution) {
    timeline = [
      {
        title: 'Seedling batch certified',
        date: distLinkedProd?.date || record.date,
        actor: distLinkedProd?.by || 'Nursery operator',
        detail: `Batch ${record.prod || '—'} (${distLinkedProd?.variety || record.variety || 'Cacao seedlings'}) cleared for distribution.`,
        done: true,
      },
      {
        title: 'Dispatched from nursery',
        date: record.date,
        actor: 'Logistics / Extension officer',
        detail: `${Number(record.qty).toLocaleString()} seedlings dispatched to ${record.to} — ${record.dest}.`,
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
        detail: `Validation for ${record.variety} planting in ${record.state}.`,
        done: ['Validated', 'Approved', 'Verified'].includes(record.status),
      },
      {
        title: `Plan status: ${record.status}`,
        date: record.plantingDate,
        actor: 'Project management',
        detail: `Status confirmed: ${record.status}.`,
        done: ['Approved', 'Verified'].includes(record.status),
        isDecision: true,
      },
    ];
  } else {
    // Nursery
    timeline = [
      {
        title: 'Nursery registered',
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
        detail: `Accreditation status: ${record.status}.`,
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
                {isInspection ? 'Inspection' : isProduction ? 'Production' : isPlan ? 'Plan' : isDistribution ? 'Distribution' : 'Nursery'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isDistribution
                ? `${record.to} · ${record.dest} · ${record.date}`
                : `${record.nur || record.name} · ${record.variety || record.state || 'IITA Cacao Seed Tracker'} · ${record.date || record.plantingDate || 'Active'}`}
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
                    onClick={() => editRecord('dist', record.id, { status: 'In Transit' })}
                    className="action-button"
                  >
                    Mark In Transit (Dispatched)
                  </button>
                )}
                <button
                  onClick={() => editRecord('dist', record.id, { status: 'Received' })}
                  className="action-button"
                >
                  ✓ Confirm Delivery (Mark Received)
                </button>
              </>
            )}

            {/* Production Actions: Admin / PM fast-track certification */}
            {isProduction && isSuperUser && (record.status === 'Pending' || record.status === 'In Review') && (
              <button
                onClick={() => editRecord('prod', record.id, { status: 'Verified' })}
                className="action-button"
                title="Administrative quality sign-off"
              >
                ✓ Administrative Certification (Verify Batch)
              </button>
            )}

            {/* Production Actions: Dispatch Seedlings to Farmers */}
            {isProduction && (isSuperUser || isExtension) && record.status === 'Verified' && (
              <button
                onClick={() => {
                  const newDist = {
                    nur: record.nur,
                    prod: record.id,
                    variety: record.variety,
                    qty: String(Math.min(parseInt(record.qty, 10) || 2000, 3000)),
                    to: 'Local Farmers Cooperative',
                    dest: data.nur?.find(n => n.name === record.nur)?.state || 'Oyo',
                    date: new Date().toISOString().slice(0, 10),
                    status: 'Received',
                  };
                  addRecord('dist', newDist);
                }}
                className="action-button"
              >
                + Dispatch Seedlings to Farmers
              </button>
            )}

            {/* Production Plan Progression: Extension Officer / PM / Admin */}
            {isPlan && (isSuperUser || isExtension) && record.status === 'Submitted' && (
              <button
                onClick={() => editRecord('plan', record.id, { status: 'Validated' })}
                className="action-button"
                title="Advance production plan to Validated status"
              >
                Advance Stage: Validate Plan →
              </button>
            )}
            {isPlan && (isSuperUser || isExtension) && record.status === 'Validated' && (
              <button
                onClick={() => editRecord('plan', record.id, { status: 'Approved' })}
                className="action-button"
                title="Advance production plan to Approved status"
              >
                Advance Stage: Approve Plan ✓
              </button>
            )}

            {/* Nursery Accreditation: Admin / PM */}
            {isNursery && isSuperUser && record.status !== 'Active' && (
              <button
                onClick={() => editRecord('nur', record.id, { status: 'Active' })}
                className="action-button"
              >
                Accredit & Activate Nursery
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
              <DetailRow label="Nursery" value={record.nur || record.name} />

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
                  {record.bedId && <DetailRow label="Nursery Bed / Section" value={record.bedId} />}
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
                      label="Source Nursery"
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
                  <DetailRow label="Nursery" value={record.nur || record.nursery || '—'} />
                  <DetailRow label="Producer / Applicant" value={record.producer || record.submittedBy || '—'} />
                  <DetailRow label="Contact Email" value={record.email || '—'} />
                  <DetailRow label="Cocoa Variety" value={record.variety || '—'} />
                  <DetailRow label="Target Seedlings" value={`${Number(record.target || 0).toLocaleString()} seedlings`} />
                  <DetailRow label="Proposed Planting Date" value={record.plantingDate || record.date || '—'} />
                  <DetailRow
                    label="Location & Zone"
                    value={[record.state, record.zone, record.city].filter(Boolean).join(' · ') || record.state || '—'}
                  />
                  <DetailRow label="Field / Nursery ID" value={record.fieldId || '—'} />
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

          {/* Linked Distribution Table - ONLY shown on production records with actual distribution */}
          {isProduction && linkedDists.length > 0 && (
            <div className="bg-white border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-200 bg-[#FAF8F1] flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-[#8B8576] tracking-wide">
                  Seedling Distribution to Farmers
                </span>
                <span className="text-xs text-gray-500 font-mono">{linkedDists.length} delivery records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table w-full text-sm">
                  <thead className="bg-[#FAF8F1] border-b border-gray-200">
                    <tr>
                      {['ID', 'Recipient Farmer / Group', 'Quantity', 'Destination', 'Date', 'Status'].map((h) => (
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
                        onClick={() => navigate('workflow', { workflowPageKey: 'dist', workflowRecordId: d.id })}
                        className={`cursor-pointer border-b border-gray-100 hover:bg-[#F7F3E9] ${i % 2 ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <td className="px-4 py-2.5 font-mono text-[#176B3A] font-semibold">{d.id}</td>
                        <td className="px-4 py-2.5 font-semibold text-gray-800">{d.to}</td>
                        <td className="px-4 py-2.5 tabular-nums font-bold text-gray-900">{Number(d.qty).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-gray-600">{d.dest}</td>
                        <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{d.date}</td>
                        <td className="px-4 py-2.5"><Badge status={d.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Linked Nursery Production Batches (shown on Nursery records) */}
          {isNursery && nurseryProd.length > 0 && (
            <div className="bg-white border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-200 bg-[#FAF8F1] flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-[#8B8576] tracking-wide">
                  Production Batches at this Nursery
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
    </div>
  );
}
