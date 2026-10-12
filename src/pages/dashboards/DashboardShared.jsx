import React from 'react';
import Badge from '../../components/Badge';
import { useApp } from '../../context/AppContext';

export const qty = (record) => parseInt(record.qty, 10) || 0;

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function DemoNote() {
  return (
    <div className="border-l-4 border-[#E5B83D] bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
      <strong>Demo environment.</strong> Data is for illustrative purpose only.
    </div>
  );
}

export function WorkflowCard({ title, steps }) {
  return (
    <div className="bg-white border border-gray-200 p-5">
      <div className="section-heading mb-4">{title}</div>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex gap-3 items-start">
            <div className="w-6 h-6 shrink-0 bg-[#176B3A] text-white text-xs flex items-center justify-center font-semibold">{index + 1}</div>
            <div><div className="text-sm font-medium text-gray-900">{step.label}</div><div className="text-xs text-gray-500 mt-0.5">{step.description}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkflowLine({ steps }) {
  return (
    <div className="bg-white border border-gray-200 px-5 py-4">
      <div className="flex items-center justify-center gap-2 flex-wrap text-xs font-medium text-gray-600">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <span className={index === 0 ? 'text-[#176B3A]' : ''}>{step}</span>
            {index < steps.length - 1 && <span className="text-[#176B3A] text-base" aria-hidden="true">→</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function RecordsPanel({ title, records, empty, onOpen, onRecordClick, columns = ['id', 'name', 'status'] }) {
  return (
    <div className="bg-white border border-gray-200">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="section-heading">{title}</span>
        {onOpen && <button onClick={onOpen} className="text-xs text-[#176B3A] hover:underline">Open list</button>}
      </div>
      <div className="divide-y divide-gray-50">
        {records.length === 0 && <div className="px-5 py-8 text-center text-xs text-gray-400">{empty}</div>}
        {records.slice(0, 6).map((record) => (
          <button key={record.id} onClick={() => onRecordClick ? onRecordClick(record) : onOpen?.(record.id)} className="w-full px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50">
            <div className="min-w-0"><div className="text-xs font-mono text-gray-500">{record.id}</div><div className="text-sm text-gray-800 truncate">{record.name || record.nur || record.prod || record.to}</div>{columns.includes('date') && <div className="text-xs text-gray-400 mt-0.5">{record.date}</div>}</div>
            {columns.includes('status') && <Badge status={record.status} />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RecordsTable({ title, records, empty, onRecordClick, columns = ['id', 'name', 'status'] }) {
  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-gray-200"><span className="section-heading">{title}</span></div>
      <div className="overflow-x-auto">
        <table className="data-table w-full text-xs sm:text-sm">
          <thead className="bg-[#FAF8F1] border-b border-gray-200">
            <tr>
              <th className="text-left px-3 sm:px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-[#8B8576] w-24">Reference</th>
              <th className="text-left px-3 sm:px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-[#8B8576]">Name</th>
              {columns.includes('by') && <th className="text-left px-3 sm:px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-[#8B8576] hidden sm:table-cell">Recorded by</th>}
              {columns.includes('date') && <th className="text-left px-3 sm:px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-[#8B8576] w-24">Date</th>}
              <th className="text-left px-3 sm:px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-[#8B8576] w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 5).map((record, index) => (
              <tr key={record.id} onClick={() => onRecordClick?.(record)} className={`cursor-pointer border-b border-gray-100 hover:bg-[#F7F3E9] ${index % 2 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="px-3 sm:px-4 py-2.5 font-mono text-gray-600 font-medium text-xs">{record.id}</td>
                <td className="px-3 sm:px-4 py-2.5 font-semibold text-gray-800 truncate max-w-[140px] sm:max-w-none">{record.name || record.nur || record.prod || record.to}</td>
                {columns.includes('by') && <td className="px-3 sm:px-4 py-2.5 text-gray-700 hidden sm:table-cell truncate max-w-[120px]">{record.by || '—'}</td>}
                {columns.includes('date') && <td className="px-3 sm:px-4 py-2.5 text-gray-500 whitespace-nowrap text-xs">{record.date}</td>}
                <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap"><Badge status={record.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!records.length && <div className="px-5 py-8 text-center text-xs text-gray-400">{empty}</div>}
    </div>
  );
}

export function HelpdeskAndGuidelines({
  helpdeskTitle = "Cocoa Seed Helpdesk",
  status = "AVAILABLE",
  office = "Building 400, IITA Headquarters, Ibadan",
  email = "Cocoaseed@iita.org",
  phone = "08012345678",
  guidelinesTitle,
  guidelinesBadge,
  guidelines,
}) {
  const { currentUser } = useApp();
  const role = currentUser?.role;

  let effectiveTitle = guidelinesTitle;
  let effectiveBadge = guidelinesBadge;
  let effectiveGuidelines = guidelines;

  if (!effectiveGuidelines) {
    if (role === 'Nursery Operator') {
      effectiveTitle = effectiveTitle || "Platform Guide — Seed Garden & Farmer Operations";
      effectiveBadge = effectiveBadge || "FARMER GUIDE";
      effectiveGuidelines = [
        {
          label: "1. Seed Garden Accreditation & Geotagging",
          text: "Confirm your seed garden site GPS coordinates, operator credentials, and bed capacity with your extension officer before logging batches."
        },
        {
          label: "2. Seedling Batch Registration",
          text: "Record seedling quantities, planting dates, and improved varieties (e.g., CRIN TC-1 to TC-8) with clear garden bed references."
        },
        {
          label: "3. Inspection Scheduling",
          text: "Request phytosanitary inspection at least 10 working days prior to your target seedling distribution date."
        },
        {
          label: "4. Certified Farmer Distribution",
          text: "Only batches marked with official green Verified status are cleared to be distributed to recipient cocoa farmers."
        }
      ];
    } else if (role === 'Extension Officer') {
      effectiveTitle = effectiveTitle || "Platform Guide — Extension & Field Operations";
      effectiveBadge = effectiveBadge || "FIELD GUIDE";
      effectiveGuidelines = [
        {
          label: "1. Farmer & Seed Garden Onboarding",
          text: "Verify applicant details, seed garden capacity, and accurate GPS coordinates in your designated agricultural zone."
        },
        {
          label: "2. Production Plan Validation",
          text: "Review proposed varieties and planned planting targets to ensure alignment with regional demand before approval."
        },
        {
          label: "3. Quality & Remediation Coordination",
          text: "Liaise with inspectors during audits and guide operators through required remediation when batches need corrective action."
        },
        {
          label: "4. Farmer Group Distribution Support",
          text: "Supervise final seedling delivery to smallholder farmer cooperatives, ensuring receipt records are verified."
        }
      ];
    } else if (role === 'Inspector') {
      effectiveTitle = effectiveTitle || "Platform Guide — Phytosanitary & Audit Protocols";
      effectiveBadge = effectiveBadge || "INSPECTOR GUIDE";
      effectiveGuidelines = [
        {
          label: "1. Review Queue & Prioritization",
          text: "Access pending inspection records, review operator batch documentation, and schedule field audit visits."
        },
        {
          label: "2. Physical Phytosanitary Audit",
          text: "Evaluate seedling vigor, root health, pest/disease symptoms (CSSVD, Phytophthora), and physical count accuracy."
        },
        {
          label: "3. Official Decision Recording",
          text: "Submit formal verdicts (Verified, In Review, or Rejected with clear mandatory corrective instructions)."
        },
        {
          label: "4. National Traceability Gate",
          text: "Verified batches unlock certified batch tags and distribution authorization in the national Cocoa seed registry."
        }
      ];
    } else if (role === 'Project Manager') {
      effectiveTitle = effectiveTitle || "Platform Guide — Project Management & Oversight";
      effectiveBadge = effectiveBadge || "PM GUIDE";
      effectiveGuidelines = [
        {
          label: "1. Inspection Velocity & Workload",
          text: "Track review backlogs across states and reallocate inspector resources to prevent seedling distribution delays."
        },
        {
          label: "2. Regional Supply & Demand",
          text: "Monitor certified seedling volume against seasonal distribution targets across cocoa-producing states."
        },
        {
          label: "3. Remediation Oversight",
          text: "Oversee rejected batches and ensure extension officers complete corrective actions prior to second audits."
        },
        {
          label: "4. Delivery Milestone Verification",
          text: "Audit distribution logs to verify seedlings reach designated beneficiary farmer clusters."
        }
      ];
    } else {
      effectiveTitle = effectiveTitle || "Platform Guide — Administration & Governance";
      effectiveBadge = effectiveBadge || "ADMIN GUIDE";
      effectiveGuidelines = [
        {
          label: "1. Seed Garden Registry & User Access",
          text: "Approve newly registered seed gardens, manage role permissions, and maintain platform security credentials."
        },
        {
          label: "2. National Traceability Governance",
          text: "Oversee the complete seed pipeline from foundation material and CRIN germplasm to field seed gardens."
        },
        {
          label: "3. Quality Assurance & Audits",
          text: "Audit inspector compliance, monitor rejection reasons, and ensure systemic quality standards are met."
        },
        {
          label: "4. Management Reporting & Analytics",
          text: "Export validated production and distribution datasets in CSV/Excel for ministry and donor reporting."
        }
      ];
    }
  }

  effectiveTitle = effectiveTitle || "Platform Guide — Cocoa Seed Tracker";
  effectiveBadge = effectiveBadge || "PLATFORM GUIDE";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Helpdesk Card */}
      <div className="bg-white border border-gray-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">{helpdeskTitle}</h2>
          <span className="border border-[#176B3A]/60 bg-[#EBF6EE] text-[#176B3A] text-[11px] font-mono font-semibold tracking-wider px-2.5 py-0.5 uppercase">
            {status}
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-xs sm:text-sm text-gray-500">HQ Office</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-gray-900 text-right">{office}</span>
          </div>
          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-xs sm:text-sm text-gray-500">Liaison Desk</span>
            <a href={`mailto:${email}`} className="text-xs sm:text-sm font-bold font-mono text-gray-900 hover:text-[#176B3A] hover:underline text-right">
              {email}
            </a>
          </div>
          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-xs sm:text-sm text-gray-500">Emergency Line</span>
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-xs sm:text-sm font-bold font-mono text-gray-900 hover:text-[#176B3A] text-right">
              {phone}
            </a>
          </div>
        </div>
      </div>

      {/* Tailored Platform Guide Card */}
      <div className="bg-white border border-gray-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">{effectiveTitle}</h2>
          <span className="border border-[#176B3A]/60 bg-[#EBF6EE] text-[#176B3A] text-[11px] font-mono font-semibold tracking-wider px-2.5 py-0.5 uppercase">
            {effectiveBadge}
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {effectiveGuidelines.map((item, index) => (
            <div key={index} className="py-3 text-xs sm:text-sm text-gray-700 leading-relaxed flex items-start gap-2">
              <span className="text-[#D45417] font-semibold text-sm sm:text-base shrink-0 leading-none mt-0.5">§</span>
              <span>
                <strong className="font-semibold text-gray-900">{item.label}</strong> — {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
