export function getNotifications(currentUser, data) {
  if (!currentUser) return [];
  const production = data.prod || [];
  const inspections = data.insp || [];
  const plans = data.plan || [];
  const nurseryIds = Array.isArray(currentUser.nursery) ? currentUser.nursery : [currentUser.nursery];
  const myNurseryNames = new Set((data.nur || []).filter((item) => nurseryIds.includes(item.id)).map((item) => item.name));
  const stateList = currentUser.state?.split(',').map((item) => item.trim()) || [];
  const items = [];

  if (currentUser.role === 'Nursery Operator') {
    production.filter((item) => myNurseryNames.has(item.nur) && ['Pending', 'In Review'].includes(item.status)).slice(0, 5).forEach((item) => items.push({ id: `prod-${item.id}`, title: `${item.id} is awaiting inspection`, detail: `${item.nur} · ${Number(item.qty).toLocaleString()} seedlings · ${item.date}`, page: 'workflow', params: { workflowPageKey: 'prod', workflowRecordId: item.id } }));
    inspections.filter((item) => myNurseryNames.has(item.nur) && ['Pending', 'In Review'].includes(item.status)).slice(0, 5).forEach((item) => items.push({ id: `insp-${item.id}`, title: `Inspection ${item.id} needs attention`, detail: `${item.nur} · ${item.sum} · assigned to ${item.by}`, page: 'workflow', params: { workflowPageKey: 'insp', workflowRecordId: item.id } }));
  } else if (currentUser.role === 'Extension Officer') {
    plans.filter((item) => stateList.includes(item.state) && ['Submitted', 'Returned'].includes(item.status)).slice(0, 3).forEach((item) => items.push({ id: `plan-${item.id}`, title: `${item.id} needs validation`, detail: `${item.nur} · ${item.variety}`, page: 'workflow', params: { workflowPageKey: 'plan', workflowRecordId: item.id } }));
    production.filter((item) => ['Pending', 'In Review'].includes(item.status)).slice(0, 2).forEach((item) => items.push({ id: `prod-${item.id}`, title: `${item.id} is awaiting inspection`, detail: item.nur, page: 'workflow', params: { workflowPageKey: 'prod', workflowRecordId: item.id } }));
  } else if (currentUser.role === 'Inspector') {
    inspections.filter((item) => item.by === currentUser.name && ['Pending', 'In Review'].includes(item.status)).slice(0, 5).forEach((item) => items.push({ id: `insp-${item.id}`, title: `Review ${item.id}`, detail: `${item.nur} · ${item.sum}`, page: 'workflow', params: { workflowPageKey: 'insp', workflowRecordId: item.id } }));
  } else {
    plans.filter((item) => item.status === 'Submitted').slice(0, 3).forEach((item) => items.push({ id: `plan-${item.id}`, title: `${item.id} was submitted`, detail: `${item.nur} · awaiting validation`, page: 'workflow', params: { workflowPageKey: 'plan', workflowRecordId: item.id } }));
    inspections.filter((item) => ['Pending', 'In Review'].includes(item.status)).slice(0, 3).forEach((item) => items.push({ id: `insp-${item.id}`, title: `Inspection ${item.id} needs a decision`, detail: item.nur, page: 'workflow', params: { workflowPageKey: 'insp', workflowRecordId: item.id } }));
  }
  return items.map((item) => ({ ...item, status: 'Needs attention', owner: currentUser.role, action: 'Open workflow' }));
}
