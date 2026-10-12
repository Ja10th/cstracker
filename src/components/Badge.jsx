import React from 'react';
const CONFIG = {
  ok: { keys: ['Verified', 'Active', 'Received', 'Within SLA', 'Validated', 'Approved'], cls: 'text-[#007A45] border-[#007A45] bg-[#EAF7F0]' },
  wa: { keys: ['Pending', 'Approaching', 'Submitted'], cls: 'text-[#F15A24] border-[#F15A24] bg-[#FFF1EB]' },
  in: { keys: ['In Review'], cls: 'text-[#B54708] border-[#B54708] bg-[#FFF4E5]' },
  er: { keys: ['Rejected', 'Inactive', 'Breached', 'Returned'], cls: 'text-gray-700 border-gray-400 bg-gray-100' },
};

export default function Badge({ status }) {
  let cls = 'text-gray-700 border-gray-300 bg-gray-50';

  for (const [, cfg] of Object.entries(CONFIG)) {
    if (cfg.keys.includes(status)) {
      cls = cfg.cls;
      break;
    }
  }

  return <span className={`status-badge inline-flex items-center gap-1 text-[10px] font-normal font-mono border ${cls}`}><span className="status-dot" aria-hidden="true" />{status}</span>;
}
