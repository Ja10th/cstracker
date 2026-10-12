import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { SEED_DATA, STORAGE_KEY, PERMISSIONS, PEOPLE } from '../data/seed';

export const AppContext = createContext(null);
const SESSION_KEY = `${STORAGE_KEY}_session`;

const initialFilters = () => ({
  nur:  { search: '', state: '', status: '', page: 1 },
  prod: { search: '', nur: '', variety: '', status: '', dateFrom: '', dateTo: '', page: 1 },
  vars: { search: '', status: '', page: 1 },
  insp: { search: '', status: '', dateFrom: '', dateTo: '', page: 1 },
  dist: { search: '', dest: '', status: '', dateFrom: '', dateTo: '', page: 1 },
  plan: { search: '', status: '', page: 1 },
  users:{ search: '', role: '', status: '', page: 1 },
  workflow: { workflowPageKey: '', workflowRecordId: '' },
});

const initialReportFilters = () => ({ state: '', variety: '', status: '' });

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveSession(user) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch {}
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

function makeInitialState() {
  const saved = load();
  const seeded = SEED_DATA();
  return {
    data: saved ? { ...seeded, ...saved, plan: saved.plan || seeded.plan } : seeded,
    currentUser: loadSession(),
    currentPage: 'home',
    filters: initialFilters(),
    reportFilters: initialReportFilters(),
    overviewPeriod: 6,
    sidebarOpen: false,
    toast: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SIGN_IN':
      return {
        ...state,
        currentUser: action.user,
        currentPage: 'home',
        filters: initialFilters(),
        sidebarOpen: false,
      };
    case 'SIGN_OUT':
      return { ...state, currentUser: null, currentPage: 'home', sidebarOpen: false };
    case 'NAVIGATE':
      return {
        ...state,
        currentPage: action.page,
        sidebarOpen: false,
        filters: action.preFilters
          ? { ...state.filters, [action.page]: { ...state.filters[action.page], ...action.preFilters, page: 1 } }
          : state.filters,
      };
    case 'ADD_RECORD': {
      const newData = { ...state.data, [action.key]: [...state.data[action.key], action.record] };
      save(newData);
      return { ...state, data: newData };
    }
    case 'EDIT_RECORD': {
      const updated = state.data[action.key].map(r => r.id === action.id ? { ...r, ...action.record } : r);
      const newData = { ...state.data, [action.key]: updated };
      save(newData);
      return { ...state, data: newData };
    }
    case 'TOGGLE_USER': {
      const users = state.data.users.map(u =>
        u.id === action.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
      );
      const newData = { ...state.data, users };
      save(newData);
      return { ...state, data: newData };
    }
    case 'DECIDE': {
      const insp = state.data.insp.map(r =>
        r.id === action.inspId ? { ...r, status: action.decision, sum: action.reason || r.sum } : r
      );
      // Also update matching prod record
      const inspRecord = state.data.insp.find(r => r.id === action.inspId);
      let prod = state.data.prod;
      if (inspRecord) {
        prod = state.data.prod.map(r =>
          r.id === inspRecord.prod
            ? { ...r, status: action.decision === 'Verified' ? 'Verified' : action.decision === 'Rejected' ? 'Rejected' : 'In Review' }
            : r
        );
      }
      const audit = [
        ...state.data.audit,
        {
          id: 'AUD-' + Date.now(),
          by: state.currentUser?.name,
          action: `${action.decision} inspection ${action.inspId}`,
          ts: new Date().toISOString(),
        },
      ];
      const newData = { ...state.data, insp, prod, audit };
      save(newData);
      return { ...state, data: newData };
    }
    case 'ADD_AUDIT': {
      const audit = [...state.data.audit, action.entry];
      const newData = { ...state.data, audit };
      save(newData);
      return { ...state, data: newData };
    }
    case 'RESET_DATA': {
      const fresh = SEED_DATA();
      save(fresh);
      return { ...state, data: fresh, filters: initialFilters() };
    }
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.key]: { ...state.filters[action.key], [action.field]: action.value, page: action.field === 'page' ? action.value : 1 },
        },
      };
    case 'SET_REPORT_FILTER':
      return { ...state, reportFilters: { ...state.reportFilters, [action.key]: action.value } };
    case 'SET_OVERVIEW_PERIOD':
      return { ...state, overviewPeriod: action.n };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'CLOSE_SIDEBAR':
      return { ...state, sidebarOpen: false };
    case 'SHOW_TOAST':
      return { ...state, toast: action.message };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, makeInitialState);

  // Auto-save data changes
  useEffect(() => {
    save(state.data);
  }, [state.data]);

  // Toast auto-dismiss
  useEffect(() => {
    if (state.toast) {
      const t = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3500);
      return () => clearTimeout(t);
    }
  }, [state.toast]);

  const signIn = useCallback((personIndex) => {
    const person = PEOPLE[personIndex];
    saveSession(person);
    dispatch({ type: 'SIGN_IN', user: person });
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const navigate = useCallback((page, preFilters) => {
    dispatch({ type: 'NAVIGATE', page, preFilters });
  }, []);

  const addRecord = useCallback((key, record) => {
    // Generate ID
    const prefix = {
      nur: 'NUR-', prod: 'PR-', vars: 'CV-', insp: 'INS-', dist: 'DST-', plan: 'PP-', users: 'U-'
    }[key] || 'REC-';
    const existing = state.data[key];
    let maxNum = 0;
    existing.forEach(r => {
      const n = parseInt(r.id.replace(prefix, ''), 10);
      if (!isNaN(n) && n > maxNum) maxNum = n;
    });
    const newRecord = { ...record, id: prefix + (maxNum + 1) };
    dispatch({ type: 'ADD_RECORD', key, record: newRecord });
    const audit = {
      id: 'AUD-' + Date.now(),
      by: state.currentUser?.name,
      action: `Added ${key} record ${newRecord.id}`,
      ts: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_AUDIT', entry: audit });
    showToast(`Record ${newRecord.id} added.`);
  }, [state.data, state.currentUser]);

  const editRecord = useCallback((key, id, record) => {
    dispatch({ type: 'EDIT_RECORD', key, id, record });
    const audit = {
      id: 'AUD-' + Date.now(),
      by: state.currentUser?.name,
      action: `Edited ${key} record ${id}`,
      ts: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_AUDIT', entry: audit });
    showToast(`Record ${id} updated.`);
  }, [state.currentUser]);

  const toggleUserStatus = useCallback((id) => {
    dispatch({ type: 'TOGGLE_USER', id });
    showToast('User status updated.');
  }, []);

  const decide = useCallback((inspId, decision, reason) => {
    dispatch({ type: 'DECIDE', inspId, decision, reason });
    showToast(`Inspection marked as ${decision}.`);
  }, []);

  const resetData = useCallback(() => {
    dispatch({ type: 'RESET_DATA' });
    showToast('Demo data reset.');
  }, []);

  const showToast = useCallback((message) => {
    dispatch({ type: 'SHOW_TOAST', message });
  }, []);

  const setFilter = useCallback((key, field, value) => {
    dispatch({ type: 'SET_FILTER', key, field, value });
  }, []);

  const setPage = useCallback((key, page) => {
    dispatch({ type: 'SET_FILTER', key, field: 'page', value: page });
  }, []);

  const setReportFilter = useCallback((key, value) => {
    dispatch({ type: 'SET_REPORT_FILTER', key, value });
  }, []);

  const setOverviewPeriod = useCallback((n) => {
    dispatch({ type: 'SET_OVERVIEW_PERIOD', n });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const closeSidebar = useCallback(() => {
    dispatch({ type: 'CLOSE_SIDEBAR' });
  }, []);

  // vis(k) - role-based data visibility
  const getVisible = useCallback((key) => {
    const me = state.currentUser;
    if (!me) return [];
    const role = me.role;
    const data = state.data;

    if (role === 'Administrator' || role === 'Project Manager') {
      return data[key] || [];
    }

    if (role === 'Inspector') {
      if (key === 'insp') return data.insp.filter(r => r.by === me.name);
      if (key === 'prod') return data.prod.filter(r => {
        const ins = data.insp.find(i => i.prod === r.id);
        return ins && ins.by === me.name;
      });
      if (key === 'nur') {
        const myNurNames = new Set(
          data.insp.filter(i => i.by === me.name).map(i => i.nur)
        );
        return data.nur.filter(n => myNurNames.has(n.name));
      }
      return data[key] || [];
    }

    if (role === 'Extension Officer') {
      const stateList = me.state ? me.state.split(',').map(s => s.trim()) : [];
      if (key === 'nur') return data.nur.filter(n => stateList.includes(n.state));
      if (key === 'prod') {
        const myNurNames = new Set(
          data.nur.filter(n => stateList.includes(n.state)).map(n => n.name)
        );
        return data.prod.filter(r => myNurNames.has(r.nur));
      }
      return data[key] || [];
    }

    if (role === 'Nursery Operator') {
      const nurseryIds = Array.isArray(me.nursery) ? me.nursery : [me.nursery];
      const myNurseries = data.nur.filter(n => nurseryIds.includes(n.id));
      const myNurNames = new Set(myNurseries.map(n => n.name));
      if (key === 'nur') return myNurseries;
      if (key === 'prod') return data.prod.filter(r => myNurNames.has(r.nur));
      if (key === 'insp') return data.insp.filter(r => myNurNames.has(r.nur));
      if (key === 'dist') return data.dist.filter(r => myNurNames.has(r.nur));
      return data[key] || [];
    }

    return data[key] || [];
  }, [state.currentUser, state.data]);

  const value = {
    ...state,
    signIn,
    signOut,
    navigate,
    addRecord,
    editRecord,
    toggleUserStatus,
    decide,
    resetData,
    showToast,
    setFilter,
    setPage,
    setReportFilter,
    setOverviewPeriod,
    toggleSidebar,
    closeSidebar,
    getVisible,
    permissions: state.currentUser ? (PERMISSIONS[state.currentUser.role] || []) : [],
    can: (perm) => {
      if (!state.currentUser) return false;
      const perms = PERMISSIONS[state.currentUser.role] || [];
      return perms.includes(perm);
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
