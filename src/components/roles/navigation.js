import { administratorNavigation } from './administrator/navigation';
import { projectManagerNavigation } from './project-manager/navigation';
import { inspectorNavigation } from './inspector/navigation';
import { extensionOfficerNavigation } from './extension-officer/navigation';
import { nurseryOperatorNavigation } from './nursery-operator/navigation';

const navigationByRole = {
  Administrator: administratorNavigation,
  'Project Manager': projectManagerNavigation,
  Inspector: inspectorNavigation,
  'Extension Officer': extensionOfficerNavigation,
  'Nursery Operator': nurseryOperatorNavigation,
};

export function getRoleNavigation(role) {
  return navigationByRole[role] || [];
}
