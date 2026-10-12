import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getNotifications } from '../data/notifications';
import Badge from '../components/Badge';

export default function NotificationsPage() {
  const { currentUser, data, navigate } = useApp();
  const notifications = getNotifications(currentUser, data);
  const [filterType, setFilterType] = useState('all');

  const filtered = notifications.filter((item) => {
    if (filterType === 'insp') return item.id.startsWith('insp');
    if (filterType === 'prod') return item.id.startsWith('prod');
    if (filterType === 'plan') return item.id.startsWith('plan');
    return true;
  });

  const inspCount = notifications.filter((i) => i.id.startsWith('insp')).length;
  const prodCount = notifications.filter((i) => i.id.startsWith('prod')).length;
  const planCount = notifications.filter((i) => i.id.startsWith('plan')).length;

  return (
    <div className="p-3 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Updates on seed applications, batch inspections, and quality approvals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 bg-[#FAF8F1] border border-gray-200 text-[#8B8576]">
            {notifications.length} {notifications.length === 1 ? 'update' : 'updates'}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-gray-200">
        {/* Filter bar */}
        <div className="px-5 py-3 border-b border-gray-200 bg-[#FAF8F1] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 transition-colors ${
                filterType === 'all'
                  ? 'bg-[#176B3A] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            {inspCount > 0 && (
              <button
                onClick={() => setFilterType('insp')}
                className={`px-3 py-1.5 transition-colors ${
                  filterType === 'insp'
                    ? 'bg-[#176B3A] text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Inspections ({inspCount})
              </button>
            )}
            {prodCount > 0 && (
              <button
                onClick={() => setFilterType('prod')}
                className={`px-3 py-1.5 transition-colors ${
                  filterType === 'prod'
                    ? 'bg-[#176B3A] text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Production ({prodCount})
              </button>
            )}
            {planCount > 0 && (
              <button
                onClick={() => setFilterType('plan')}
                className={`px-3 py-1.5 transition-colors ${
                  filterType === 'plan'
                    ? 'bg-[#176B3A] text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Plans ({planCount})
              </button>
            )}
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Assigned: {currentUser?.role}
          </span>
        </div>

        {/* List of items */}
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              No notifications matching this filter.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.page, item.params)}
                className="w-full text-left p-5 hover:bg-[#F7F3E9] transition-colors flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#176B3A]">
                      {item.id.replace(/^(prod|insp|plan)-/, '')}
                    </span>
                    <Badge status="Pending" />
                    <span className="text-xs font-semibold text-gray-900 truncate">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.detail}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-mono pt-1">
                    <span>Role: {item.owner}</span>
                    <span>·</span>
                    <span>Status: {item.status}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center pt-1">
                  <span className="text-xs font-semibold text-[#176B3A] hover:underline flex items-center gap-1">
                    Track →
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
