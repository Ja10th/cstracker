import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { STATES } from '../data/seed';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import { exportExcel, exportWord, exportPowerPoint, exportPdf } from '../utils/exportReports';

function PreviewTable({ rows }) {
  return (
    <div className="bg-white border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200 section-heading flex items-center justify-between">
        <span>Report data live preview</span>
        <span className="text-xs text-gray-500 font-normal">Showing {Math.min(rows.length, 12)} of {rows.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table w-full text-[14px]">
          <thead className="bg-[#FAF8F1] border-b border-gray-200">
            <tr>
              {['Production ID', 'Seed Garden', 'State', 'Variety', 'Quantity', 'Date recorded', 'Recorded by', 'Status'].map((heading) => (
                <th key={heading} className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-[#8B8576]">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 12).map((row, index) => (
              <tr key={row.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#F7F3E9]`}>
                <td className="px-4 py-3 font-mono text-[#176B3A] text-xs">{row.id}</td>
                <td className="px-4 py-3 text-gray-800 font-semibold truncate max-w-[150px]">{row.nur}</td>
                <td className="px-4 py-3 text-gray-600 font-medium">{row.state}</td>
                <td className="px-4 py-3 text-gray-800">{row.variety}</td>
                <td className="px-4 py-3 tabular-nums font-semibold">{Number(row.qty).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.date}</td>
                <td className="px-4 py-3 text-gray-700 truncate max-w-[130px]">{row.by}</td>
                <td className="px-4 py-3"><Badge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="px-5 py-10 text-center text-sm text-gray-400">No records match the current report filters.</div>}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { getVisible, reportFilters, setReportFilter } = useApp();

  const allProd = getVisible('prod');
  const allNur  = getVisible('nur');

  const { state: fState, variety: fVariety, status: fStatus } = reportFilters;

  // Filtered prod
  const fprod = useMemo(() => {
    let rows = allProd;
    if (fVariety) rows = rows.filter(r => r.variety === fVariety);
    if (fStatus)  rows = rows.filter(r => r.status === fStatus);
    if (fState) {
      const nurInState = new Set(allNur.filter(n => n.state === fState).map(n => n.name));
      rows = rows.filter(r => nurInState.has(r.nur));
    }
    const stateByNursery = Object.fromEntries(allNur.map((nursery) => [nursery.name, nursery.state]));
    return rows.map((row) => ({ ...row, state: stateByNursery[row.nur] || '—' }));
  }, [allProd, allNur, fState, fVariety, fStatus]);

  const varieties = [...new Set(allProd.map(r => r.variety))];
  const statuses  = ['Pending', 'In Review', 'Verified', 'Rejected'];

  const getPayload = () => {
    const totalSeedlings = fprod.reduce((s, r) => s + (parseInt(r.qty, 10) || 0), 0);
    const verifiedCount = fprod.filter(r => r.status === 'Verified').length;
    const filterParts = [
      fState && `State: ${fState}`,
      fVariety && `Variety: ${fVariety}`,
      fStatus && `Status: ${fStatus}`
    ].filter(Boolean);

    return {
      title: 'IITA Cocoa Seed Tracker - Detailed Production & Verification Report',
      filterLabel: filterParts.length ? filterParts.join(' | ') : 'All Batches (Unfiltered)',
      summary: {
        'Seedlings Logged': totalSeedlings,
        'Matching Records': fprod.length,
        'Verified Batches': verifiedCount,
        'Awaiting Audit': fprod.length - verifiedCount,
      },
      rows: fprod,
    };
  };

  const handleExport = (format) => {
    const payload = getPayload();
    if (format === 'excel') exportExcel(payload);
    else if (format === 'word') exportWord(payload);
    else if (format === 'powerpoint') exportPowerPoint(payload);
    else if (format === 'pdf') exportPdf(payload);
  };

  return (
    <div className="p-3 sm:p-6 space-y-5">
      <section className="bg-white border border-gray-200 p-5 sm:p-7 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E7E1D5] pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Generate management report</h1>
            <p className="text-sm text-gray-500 mt-2">
              Select the reporting scope and filters, then review the live preview before exporting into your preferred format.
            </p>
          </div>
          {/* 4 Multi-Format Export Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExport('excel')}
              className="report-excel-button compact-action flex items-center gap-2"
              title="Download Excel spreadsheet"
            >
              <Icon name="download" className="w-4 h-4" />
              Excel (.csv)
            </button>
            <button
              onClick={() => handleExport('word')}
              className="px-3 py-2 border border-blue-600 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 flex items-center gap-2 min-h-[36px]"
              title="Download Word document"
            >
              <Icon name="download" className="w-4 h-4" />
              Word (.doc)
            </button>
            <button
              onClick={() => handleExport('powerpoint')}
              className="px-3 py-2 border border-amber-600 bg-amber-50 text-amber-800 text-sm font-semibold hover:bg-amber-100 flex items-center gap-2 min-h-[36px]"
              title="Download PowerPoint presentation"
            >
              <Icon name="download" className="w-4 h-4" />
              PowerPoint (.ppt)
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="action-button compact-action flex items-center gap-2"
              title="Download or Print PDF"
            >
              <Icon name="download" className="w-4 h-4" />
              PDF Report
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="space-y-2">
            <span className="block text-xs uppercase tracking-wide font-semibold text-[#8B8576]">Reporting period</span>
            <select className="app-select w-full">
              <option>All dates / complete record</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="block text-xs uppercase tracking-wide font-semibold text-[#8B8576]">Seed garden location</span>
            <select
              value={fState}
              onChange={(e) => setReportFilter('state', e.target.value)}
              className="app-select w-full"
            >
              <option value="">All states</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="block text-xs uppercase tracking-wide font-semibold text-[#8B8576]">Cocoa variety</span>
            <select
              value={fVariety}
              onChange={(e) => setReportFilter('variety', e.target.value)}
              className="app-select w-full"
            >
              <option value="">All varieties</option>
              {varieties.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="block text-xs uppercase tracking-wide font-semibold text-[#8B8576]">Status</span>
            <select
              value={fStatus}
              onChange={(e) => setReportFilter('status', e.target.value)}
              className="app-select w-full"
            >
              <option value="">All statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 border-t border-[#E7E1D5] pt-4">
          <span>Matching: <strong>{fprod.length}</strong> of {allProd.length} production records</span>
          <span className="text-gray-300">|</span>
          <span>Verified: <strong className="text-[#176B3A]">{fprod.filter(r => r.status === 'Verified').length}</strong></span>
          <span className="text-gray-300">|</span>
          <span>Awaiting action: <strong className="text-[#FF5A1F]">{fprod.filter(r => r.status !== 'Verified').length}</strong></span>
          {(fState || fVariety || fStatus) && (
            <button
              onClick={() => { setReportFilter('state', ''); setReportFilter('variety', ''); setReportFilter('status', ''); }}
              className="ml-auto text-[#FF5A1F] hover:underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </section>

      <PreviewTable rows={fprod} />
    </div>
  );
}
