import React from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import SyncStatus from './components/SyncStatus';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import WorkflowPage from './pages/WorkflowPage';
import NotificationsPage from './pages/NotificationsPage';
import ProductionMapPage from './pages/ProductionMapPage';
import InfographicsPage from './pages/InfographicsPage';

export default function App() {
  const { currentUser, currentPage } = useApp();

  if (!currentUser) {
    return <LoginPage />;
  }

  function renderPage() {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'nur':
      case 'prod':
      case 'vars':
      case 'insp':
      case 'dist':
      case 'users':
        return <ListPage pageKey={currentPage} />;
      case 'infographics':
        return <InfographicsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'map':
        return <ProductionMapPage />;
      case 'settings':
        return <SettingsPage />;
      case 'workflow':
        return <WorkflowPage />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <HomePage />;
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#202620]">
      <Sidebar />
      <div className="lg:ml-[244px] flex flex-col min-h-screen">
        <Header />
        <main className={`flex-1 ${currentPage === 'map' ? 'p-0 w-full' : 'p-0 sm:p-2 lg:p-4 max-w-[1400px] w-full'}`}>
          {renderPage()}
        </main>
      </div>
      <Toast />
      <SyncStatus />
    </div>
  );
}
