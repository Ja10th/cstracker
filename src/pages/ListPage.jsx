import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MODULE_CONFIGS } from '../data/seed';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import FormModal from '../components/FormModal';
import ProductionPlanModal from '../components/ProductionPlanModal';
import Modal from '../components/Modal';

const PAGE_SIZE = 8;
const TABLE_HEADINGS = {
  nur: 'Nursery registry',
  prod: 'Production activity',
  vars: 'Available planting materials',
  insp: 'Inspection records',
  dist: 'Distribution activity',
  users: 'Platform user accounts',
};

export default function ListPage({ pageKey }) {
  const { filters, setFilter, getVisible, can, data, toggleUserStatus, editRecord, addRecord, navigate } = useApp();
  const cfg = MODULE_CONFIGS[pageKey];
  const f = filters[pageKey] || {};
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const canAdd = cfg.canAdd.some(p => can(p));

  const nurOptions = data.nur.map(n => n.name);
  const varOptions = data.vars.map(v => v.name);

  const allRows = getVisible(pageKey);

  const filtered = useMemo(() => {
    if (!cfg) return [];
    let rows = allRows;
    const search = (f.search || '').toLowerCase();
    if (search) {
      rows = rows.filter(r =>
        Object.values(r).some(v => String(v).toLowerCase().includes(search))
      );
    }
    cfg.filterFields?.forEach(ff => {
      const val = f[ff.key];
      if (val) rows = rows.filter(r => r[ff.key] === val);
    });
    if (cfg.hasDateRange) {
      if (f.dateFrom) rows = rows.filter(r => r.date >= f.dateFrom);
      if (f.dateTo)   rows = rows.filter(r => r.date <= f.dateTo);
    }
    return rows;
  }, [allRows, f, cfg]);

  if (!cfg) return <div className="p-6 text-red-500">Unknown page: {pageKey}</div>;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(f.page || 1, totalPages);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getSelectOptions(ff) {
    if (ff.options) return ff.options;
    if (ff.optionsKey === 'nurNames') return nurOptions;
    if (ff.optionsKey === 'varNames') return varOptions;
    return [];
  }

  function handleRowClick(row) {
    if (pageKey === 'users') {
      setSelectedUser(row);
      return;
    }
    if (pageKey === 'vars') return;
    openWorkflow(row);
  }

  function openWorkflow(row) {
    if (pageKey === 'users' || pageKey === 'vars') return;
    if (pageKey === 'prod') {
      if (row.planId) {
        navigate('workflow', { workflowPageKey: 'plan', workflowRecordId: row.planId });
        return;
      }
    }
    navigate('workflow', { workflowPageKey: pageKey, workflowRecordId: row.id });
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Table */}
      <div className="bg-white border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="section-heading">{TABLE_HEADINGS[pageKey] || 'Records'}</div>
          <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-52">
              <Icon name="search" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="search" value={f.search || ''} onChange={e => setFilter(pageKey, 'search', e.target.value)} placeholder={`Search ${cfg.title.toLowerCase()}…`} className="app-input w-full" />
            </div>
            {cfg.filterFields.map(ff => <select key={ff.key} value={f[ff.key] || ''} onChange={e => setFilter(pageKey, ff.key, e.target.value)} className="app-select"><option value="">{ff.label}</option>{getSelectOptions(ff).map(o => <option key={o} value={o}>{o}</option>)}</select>)}
            {cfg.hasDateRange && <input type="date" value={f.dateFrom || ''} onChange={e => setFilter(pageKey, 'dateFrom', e.target.value)} className="border border-gray-200 px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-[#176B3A]" title="Filter by date" />}
            {filtered.length !== allRows.length && <button onClick={() => { cfg.filterFields.forEach(ff => setFilter(pageKey, ff.key, '')); setFilter(pageKey, 'search', ''); if (cfg.hasDateRange) { setFilter(pageKey, 'dateFrom', ''); setFilter(pageKey, 'dateTo', ''); } }} className="text-xs text-red-600 hover:underline">Clear filters</button>}
            {canAdd && ['nur', 'prod', 'dist', 'users'].includes(pageKey) && (
              <button onClick={() => setShowAdd(true)} className="action-button compact-action flex items-center gap-1.5 transition-colors">
                <Icon name="plus" className="w-3.5 h-3.5" />
                {cfg.addLabel}
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="data-table w-full text-[14px] min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {cfg.cols.map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
              ))}
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={cfg.cols.length + 1} className="text-center py-10 text-gray-400">
                  No records match the current filters.
                </td>
              </tr>
            )}
            {pageRows.map(row => (
              <tr
                key={row.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={(event) => {
                  if (!event.target.closest('button')) handleRowClick(row);
                }}
              >
                {cfg.fields.map(field => (
                  <td key={field} className="px-4 py-3 whitespace-nowrap">
                    {field === 'image' ? (
                      <img src={row[field]} alt={`${row.name} cacao variety`} className="w-10 h-10 object-cover border border-gray-200" />
                    ) : field === 'status' ? (
                      <Badge status={row[field]} />
                    ) : field === 'id' ? (
                      <span className="font-mono text-gray-600">{row[field]}</span>
                    ) : field === 'qty' ? (
                      <span className="tabular-nums">{parseInt(row[field], 10).toLocaleString()}</span>
                    ) : (
                      <span className={`text-gray-800 ${['name', 'state', 'nur', 'op'].includes(field) ? 'font-semibold' : ''}`}>{row[field]}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {pageKey !== 'users' && pageKey !== 'vars' && (
                      <button
                        onClick={() => openWorkflow(row)}
                        className="text-sm font-semibold text-[#176B3A] hover:text-[#D45417] hover:underline transition-colors"
                        title="Track"
                      >
                        Track →
                      </button>
                    )}

                    {pageKey === 'users' && (
                      <>
                        <button
                          onClick={() => setSelectedUser(row)}
                          className="text-xs text-gray-600 hover:text-gray-900 underline mr-1"
                        >
                          Details
                        </button>

                        {can('users') && row.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => toggleUserStatus(row.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#176B3A] text-white hover:bg-[#0F542C] transition-colors"
                              title="Approve applicant"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => editRecord('users', row.id, { status: 'Inactive' })}
                              className="px-2 py-1 text-xs font-semibold border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                              title="Reject applicant"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {can('users') && row.status === 'Active' && (
                          <button
                            onClick={() => toggleUserStatus(row.id)}
                            className="border border-red-200 bg-red-50 text-red-700 hover:border-red-400 px-2 py-1 text-xs transition-colors"
                            title="Deactivate account"
                          >
                            Deactivate
                          </button>
                        )}

                        {can('users') && row.status === 'Inactive' && (
                          <button
                            onClick={() => toggleUserStatus(row.id)}
                            className="border border-green-200 bg-green-50 text-green-700 hover:border-green-400 px-2 py-1 text-xs transition-colors"
                            title="Activate account"
                          >
                            Activate
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setFilter(pageKey, 'page', page - 1)}
              className="px-2 py-1 border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setFilter(pageKey, 'page', p)}
                className={`px-2 py-1 border ${p === page ? 'border-[#176B3A] bg-[#176B3A] text-white' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setFilter(pageKey, 'page', page + 1)}
              className="px-2 py-1 border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {/* Drawers / Modals */}
      {pageKey === 'prod' && (
        <ProductionPlanModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          nurOptions={nurOptions}
          varOptions={varOptions}
        />
      )}
      {(pageKey === 'nur' || pageKey === 'dist' || pageKey === 'users') && (
        <FormModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          pageKey={pageKey}
          nurOptions={nurOptions}
          varOptions={varOptions}
        />
      )}

      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`User Application: ${selectedUser.name}`}
          footer={
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {can('users') && selectedUser.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        toggleUserStatus(selectedUser.id);
                        setSelectedUser(null);
                      }}
                      className="action-button"
                    >
                      Approve & Activate Account
                    </button>
                    <button
                      onClick={() => {
                        editRecord('users', selectedUser.id, { status: 'Inactive' });
                        setSelectedUser(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      Reject Application
                    </button>
                  </>
                )}
                {can('users') && selectedUser.status === 'Active' && (
                  <button
                    onClick={() => {
                      toggleUserStatus(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    className="border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-xs font-semibold hover:bg-red-100"
                  >
                    Deactivate Account
                  </button>
                )}
                {can('users') && selectedUser.status === 'Inactive' && (
                  <button
                    onClick={() => {
                      toggleUserStatus(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    className="border border-green-300 bg-green-50 text-green-700 px-3 py-1.5 text-xs font-semibold hover:bg-green-100"
                  >
                    Activate Account
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-[#FAF8F1] p-4 border border-gray-200">
              <div>
                <span className="text-xs font-semibold uppercase text-[#8B8576] block">User ID</span>
                <span className="font-mono text-gray-900 font-bold">{selectedUser.id}</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-[#8B8576] block">Account Status</span>
                <Badge status={selectedUser.status} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase text-[#8B8576] block">Assigned Role</span>
                <span className="font-semibold text-gray-900">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-[#8B8576] block">Email Address</span>
                <span className="text-gray-800 font-mono text-xs">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-[#8B8576] block">Assigned Scope / Territory</span>
                <span className="text-gray-800">{selectedUser.scope || 'All states'}</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-[#8B8576] block">Last Activity</span>
                <span className="text-gray-500 font-mono text-xs">{selectedUser.last}</span>
              </div>
              {selectedUser.lga && (
                <div>
                  <span className="text-xs font-semibold uppercase text-[#8B8576] block">LGA / Zone</span>
                  <span className="text-gray-800">{selectedUser.lga}</span>
                </div>
              )}
              {selectedUser.organization && (
                <div>
                  <span className="text-xs font-semibold uppercase text-[#8B8576] block">Organization / Entity</span>
                  <span className="text-gray-800">{selectedUser.organization}</span>
                </div>
              )}
              {selectedUser.nursery && selectedUser.nursery !== '—' && (
                <div>
                  <span className="text-xs font-semibold uppercase text-[#8B8576] block">Associated Nursery Facility</span>
                  <span className="text-gray-800 font-semibold text-[#176B3A]">{selectedUser.nursery}</span>
                </div>
              )}
              {selectedUser.farmSize && selectedUser.farmSize !== '—' && (
                <div>
                  <span className="text-xs font-semibold uppercase text-[#8B8576] block">Farm / Propagation Area</span>
                  <span className="text-gray-800">{selectedUser.farmSize}</span>
                </div>
              )}
              {selectedUser.phone && (
                <div>
                  <span className="text-xs font-semibold uppercase text-[#8B8576] block">Contact Phone Number</span>
                  <span className="text-gray-800 font-mono">{selectedUser.phone}</span>
                </div>
              )}
              {selectedUser.address && (
                <div className="sm:col-span-2">
                  <span className="text-xs font-semibold uppercase text-[#8B8576] block">Physical Site Address</span>
                  <span className="text-gray-800">{selectedUser.address}</span>
                </div>
              )}
              {selectedUser.userTypes && selectedUser.userTypes !== '—' && (
                <div className="sm:col-span-2">
                  <span className="text-xs font-semibold uppercase text-[#8B8576] block">Registered Category & Interests</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(Array.isArray(selectedUser.userTypes) ? selectedUser.userTypes : String(selectedUser.userTypes).split(',')).map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs border border-gray-200">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedUser.description && (
                <div className="sm:col-span-2">
                  <span className="text-xs font-semibold uppercase text-[#8B8576] block">Professional Summary / Operations Description</span>
                  <p className="text-gray-700 text-xs bg-gray-50 p-2.5 border border-gray-100 mt-1 leading-relaxed">
                    {selectedUser.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
