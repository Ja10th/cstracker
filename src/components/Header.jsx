import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PAGES } from '../data/seed';
import Icon from './Icon';
import { getNotifications } from '../data/notifications';

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Header() {
  const { currentUser, currentPage, toggleSidebar, navigate, signOut, data } = useApp();
  const [search, setSearch] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropRef = useRef(null);

  const pageLabel = currentPage === 'workflow' ? 'Workflow' : PAGES.find(p => p.key === currentPage)?.label || 'Dashboard';
  const showNurserySearch = currentPage === 'nur';
  const notifications = getNotifications(currentUser, data);

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate('nur', { search: search.trim() });
      setSearch('');
    }
  }

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-20 h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden p-1.5 text-gray-600 hover:text-gray-900"
        onClick={toggleSidebar}
        aria-label="Open menu"
      >
        <Icon name="menu" className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex-1 text-sm font-semibold text-gray-800">{pageLabel}</div>

      {/* Search */}
      {showNurserySearch && <form onSubmit={handleSearch} className="hidden sm:flex items-center">
        <div className="relative">
          <Icon name="search" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nurseries…"
            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#176B3A] w-44 focus:w-56 transition-all"
          />
        </div>
      </form>}

      {/* Bell */}
      <div className="relative">
        <button
          onClick={() => setNotificationsOpen((value) => !value)}
          className="relative p-1.5 text-gray-500 hover:text-[#176B3A] transition-colors"
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
        >
          <Icon name="bell" className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A1F] rounded-full" aria-hidden="true" />
          )}
        </button>
        {notificationsOpen && (
          <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white border border-gray-200 shadow-xl z-50">
            <div className="px-4 py-3 bg-[#FAF8F1] border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide font-semibold text-[#8B8576]">Notifications</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#EAF5EE] border border-[#176B3A]/30 text-[#176B3A] font-semibold">
                  {notifications.length}
                </span>
              </div>
              <button onClick={() => setNotificationsOpen(false)} className="text-xs text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-gray-400">No open notifications</div>
              ) : (
                notifications.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate(item.page, item.params);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[#F7F3E9] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-900 leading-snug">{item.title}</span>
                      <span className="text-[11px] font-semibold text-[#176B3A] shrink-0">Track →</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">{item.detail}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 font-mono">
                      <span>{item.id.replace(/^(prod|insp|plan)-/, '')}</span>
                      <span>·</span>
                      <span>{item.status}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="p-2.5 bg-gray-50 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setNotificationsOpen(false);
                  navigate('notifications');
                }}
                className="text-xs font-semibold text-[#176B3A] hover:underline"
              >
                View all notifications ({notifications.length}) →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar dropdown */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setDropOpen(v => !v)}
          className="flex items-center gap-2 text-left hover:bg-gray-50 px-1.5 py-1 transition-colors"
          aria-label="User menu"
          aria-expanded={dropOpen}
          aria-haspopup="true"
        >
          <span className="w-8 h-8 bg-[#176B3A] text-white flex items-center justify-center text-xs font-bold">{initials(currentUser.name)}</span>
          <span className="hidden sm:block leading-tight">
            <span className="block text-xs font-semibold text-gray-900">{currentUser.name}</span>
            <span className="block text-[10px] text-gray-500">{currentUser.role}</span>
          </span>
          <span aria-hidden="true" className="text-gray-400 text-sm">⌄</span>
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 shadow-lg z-50 py-1">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</div>
              <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
              <div className="text-xs text-[#176B3A] font-medium mt-0.5">{currentUser.role}</div>
            </div>
            <button
              onClick={() => { setDropOpen(false); signOut(); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
            >
              <Icon name="logout" className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
