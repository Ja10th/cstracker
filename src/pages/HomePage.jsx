import React from 'react';
import { useApp } from '../context/AppContext';
import AdministratorDashboard from './dashboards/AdministratorDashboard';
import ProjectManagerDashboard from './dashboards/ProjectManagerDashboard';
import InspectorDashboard from './dashboards/InspectorDashboard';
import NurseryOperatorDashboard from './dashboards/NurseryOperatorDashboard';
import ExtensionOfficerDashboard from './dashboards/ExtensionOfficerDashboard';

// Keep this file intentionally small: each role has its own dashboard file.
export default function HomePage() {
  const { currentUser } = useApp();

  if (!currentUser) return null;
  if (currentUser.role === 'Inspector') return <InspectorDashboard />;
  if (currentUser.role === 'Nursery Operator') return <NurseryOperatorDashboard />;
  if (currentUser.role === 'Extension Officer') return <ExtensionOfficerDashboard />;
  if (currentUser.role === 'Project Manager') return <ProjectManagerDashboard />;
  return <AdministratorDashboard />;
}
