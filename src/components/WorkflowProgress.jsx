import React from 'react';

const PRODUCTION_STAGES = ['Recorded', 'Under Inspection', 'Approved', 'Distributed', 'Closed'];

function stageIndex(status) {
  if (status === 'Rejected') return 2;
  if (status === 'Verified') return 2;
  if (status === 'In Review') return 1;
  if (status === 'Received' || status === 'Recorded') return 3;
  return 0;
}

export function getWorkflowStage(status) {
  if (status === 'Rejected') return 'Rejected';
  if (status === 'Verified') return 'Approved';
  if (status === 'In Review') return 'Under Inspection';
  if (status === 'Received' || status === 'Recorded') return 'Distributed';
  return 'Recorded';
}

export default function WorkflowProgress({ status, compact = false }) {
  const current = getWorkflowStage(status);
  const currentIndex = stageIndex(status);
  const rejected = current === 'Rejected';

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex items-center justify-between gap-1">
        {PRODUCTION_STAGES.map((stage, index) => {
          const complete = !rejected && index < currentIndex;
          const active = !rejected && index === currentIndex;
          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center gap-1 min-w-0">
                <div className={`w-5 h-5 flex items-center justify-center text-[10px] font-semibold border ${complete || active ? 'bg-[#176B3A] border-[#176B3A] text-white' : 'bg-white border-gray-300 text-gray-400'} ${rejected && index === 2 ? 'bg-red-700 border-red-700 text-white' : ''}`}>
                  {complete ? '✓' : index + 1}
                </div>
                {!compact && <span className={`text-[10px] text-center leading-tight ${active ? 'text-[#176B3A] font-semibold' : 'text-gray-400'}`}>{stage}</span>}
              </div>
              {index < PRODUCTION_STAGES.length - 1 && <div className={`h-px flex-1 ${complete ? 'bg-[#176B3A]' : 'bg-gray-200'}`} />}
            </React.Fragment>
          );
        })}
      </div>
      <div className={`text-xs ${rejected ? 'text-red-700' : 'text-gray-500'}`}>
        Current stage: <span className="font-medium">{current}</span>
      </div>
    </div>
  );
}
