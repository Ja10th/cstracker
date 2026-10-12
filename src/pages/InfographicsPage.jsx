import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { STATES, MONTHS } from '../data/seed';
import Icon from '../components/Icon';
import VBar from '../components/charts/VBar';
import HBar from '../components/charts/HBar';
import LineChart from '../components/charts/LineChart';
import AreaChart from '../components/charts/AreaChart';
import DonutChart from '../components/charts/DonutChart';
import {
  exportExcel,
  exportWord,
  exportPowerPoint,
  exportPdf,
  downloadSvg,
  generateVBarSvg,
  generateAreaSvg,
  generateDonutSvg,
  generateHBarSvg,
  generateLineSvg,
  generateGaugesSvg,
} from '../utils/exportReports';

const qty = (record) => parseInt(record.qty, 10) || 0;

const ALL_CHARTS = [
  { id: 'prodTrend', label: 'Production Trend', desc: 'Monthly bar volume' },
  { id: 'distTrend', label: 'Delivery Volume Curve', desc: 'Seedlings dispatched' },
  { id: 'inspDonut', label: 'Phytosanitary Breakdown', desc: 'Inspection audits' },
  { id: 'varBar', label: 'Seedlings by Variety', desc: 'Varietal distribution' },
  { id: 'densityLine', label: 'Seed Garden Density', desc: 'Distribution by state' },
  { id: 'qualityGauges', label: 'Quality Indicators', desc: 'Traceability & compliance' },
];

export default function InfographicsPage() {
  const { getVisible } = useApp();

  const nurseries    = getVisible('nur');
  const production   = getVisible('prod');
  const inspections  = getVisible('insp');
  const distribution = getVisible('dist');

  // Interactive filters
  const [fState, setFState] = useState('');
  const [fVariety, setFVariety] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fPeriod, setFPeriod] = useState(6);

  // User-selectable charts for report export (all 6 selected by default)
  const [selectedCharts, setSelectedCharts] = useState([
    'prodTrend',
    'distTrend',
    'inspDonut',
    'varBar',
    'densityLine',
    'qualityGauges',
  ]);

  const toggleChart = (id) => {
    setSelectedCharts(curr =>
      curr.includes(id) ? curr.filter(c => c !== id) : [...curr, id]
    );
  };

  const selectAllCharts = () => setSelectedCharts(ALL_CHARTS.map(c => c.id));
  const deselectAllCharts = () => setSelectedCharts([]);

  const nurseryStateByName = useMemo(() => {
    return Object.fromEntries(nurseries.map((n) => [n.name, n.state]));
  }, [nurseries]);

  // Filtered production data
  const filteredProd = useMemo(() => {
    return production.filter((r) => {
      const recState = nurseryStateByName[r.nur] || '';
      if (fState && recState !== fState) return false;
      if (fVariety && r.variety !== fVariety) return false;
      if (fStatus && r.status !== fStatus) return false;
      return true;
    }).map((r) => ({
      ...r,
      state: nurseryStateByName[r.nur] || '—',
    }));
  }, [production, nurseryStateByName, fState, fVariety, fStatus]);

  // Filtered distribution data
  const filteredDist = useMemo(() => {
    return distribution.filter((r) => {
      if (fState && r.dest !== fState) return false;
      return true;
    });
  }, [distribution, fState]);

  // Varieties list
  const varieties = useMemo(() => {
    return [...new Set(production.map((r) => r.variety).filter(Boolean))];
  }, [production]);

  // 1. Seedlings by Cocoa Variety (HBar)
  const varMap = {};
  filteredProd.forEach((r) => {
    varMap[r.variety] = (varMap[r.variety] || 0) + qty(r);
  });
  const varItems = Object.entries(varMap).sort((a, b) => b[1] - a[1]);

  // 2. Inspection status breakdown (DonutChart)
  const inspStatusMap = { Verified: 0, Pending: 0, 'In Review': 0, Rejected: 0 };
  inspections.forEach((r) => {
    if (r.status in inspStatusMap) inspStatusMap[r.status]++;
  });
  const inspItems = Object.entries(inspStatusMap).filter(([, v]) => v > 0);
  const inspColors = ['#176B3A', '#E5B83D', '#FF5A1F', '#B3261E'];

  // 3. Seed gardens by state (LineChart)
  const stateNurMap = {};
  nurseries.forEach((r) => {
    stateNurMap[r.state] = (stateNurMap[r.state] || 0) + 1;
  });
  const stateNurItems = Object.entries(stateNurMap).sort((a, b) => a[0].localeCompare(b[0]));

  // 4. Monthly production trend (VBar)
  const monthNames = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };
  const prodMonthMap = {};
  filteredProd.forEach((r) => {
    const m = monthNames[r.date?.slice(5, 7)];
    if (m) prodMonthMap[m] = (prodMonthMap[m] || 0) + qty(r);
  });
  const prodTrendItems = MONTHS.slice(-fPeriod).map((m) => [m, prodMonthMap[m] || 0]);

  // 5. Monthly distribution trend (AreaChart)
  const distMonthMap = {};
  filteredDist.forEach((r) => {
    const m = monthNames[r.date?.slice(5, 7)];
    if (m) distMonthMap[m] = (distMonthMap[m] || 0) + qty(r);
  });
  const distTrendItems = MONTHS.slice(-fPeriod).map((m) => [m, distMonthMap[m] || 0]);

  // Summary Metrics & Ratios
  const totalSeedlings = filteredProd.reduce((sum, r) => sum + qty(r), 0);
  const totalDistributed = filteredDist.reduce((sum, r) => sum + qty(r), 0);
  const verifiedCount = filteredProd.filter((r) => r.status === 'Verified').length;
  const pendingCount = filteredProd.filter((r) => r.status === 'Pending' || r.status === 'In Review').length;
  const verificationRate = filteredProd.length ? Math.round((verifiedCount / filteredProd.length) * 100) : 0;
  const activeNurseryRate = nurseries.length ? Math.round((nurseries.filter(n => n.status === 'Active').length / nurseries.length) * 100) : 0;
  const distributionFulfillmentRate = totalSeedlings > 0 ? Math.min(100, Math.round((totalDistributed / totalSeedlings) * 100)) : 0;

  // Compile selected SVG charts for export
  const getSelectedChartObjects = () => {
    const chartObjects = [];
    if (selectedCharts.includes('prodTrend')) {
      chartObjects.push({
        id: 'prodTrend',
        title: 'Monthly Seedling Production Trend',
        svg: generateVBarSvg(prodTrendItems, 'Monthly Seedling Production Trend', 'Seedlings logged'),
        data: prodTrendItems,
      });
    }
    if (selectedCharts.includes('distTrend')) {
      chartObjects.push({
        id: 'distTrend',
        title: 'Farmer Seedling Delivery Volume Curve',
        svg: generateAreaSvg(distTrendItems, 'Farmer Seedling Delivery Volume Curve', 'Seedlings delivered'),
        data: distTrendItems,
      });
    }
    if (selectedCharts.includes('inspDonut')) {
      chartObjects.push({
        id: 'inspDonut',
        title: 'Phytosanitary Inspection Audit Breakdown',
        svg: generateDonutSvg(inspItems, inspColors, inspections.length.toLocaleString(), 'Audits', 'Phytosanitary Inspection Breakdown'),
        data: inspItems,
      });
    }
    if (selectedCharts.includes('varBar')) {
      chartObjects.push({
        id: 'varBar',
        title: 'Cocoa Seedling Volume by Variety',
        svg: generateHBarSvg(varItems, 'Cocoa Seedling Volume by Variety'),
        data: varItems,
      });
    }
    if (selectedCharts.includes('densityLine')) {
      chartObjects.push({
        id: 'densityLine',
        title: 'Registered Seed Garden Density by State',
        svg: generateLineSvg(stateNurItems, 'Registered Seed Garden Density by State', 'Seed gardens'),
        data: stateNurItems,
      });
    }
    if (selectedCharts.includes('qualityGauges')) {
      const gauges = [
        { label: 'Phytosanitary Certification Rate', pct: verificationRate, color: '#176B3A', detail: `${verifiedCount} batches verified compliant` },
        { label: 'Active Seed Garden Accreditation', pct: activeNurseryRate, color: '#059669', detail: `${nurseries.filter(n => n.status === 'Active').length} of ${nurseries.length} licensed facilities active` },
        { label: 'Farmer Distribution Fulfillment', pct: distributionFulfillmentRate, color: '#FF5A1F', detail: `${totalDistributed.toLocaleString()} of ${totalSeedlings.toLocaleString()} seedlings dispatched` },
      ];
      chartObjects.push({
        id: 'qualityGauges',
        title: 'Operational Quality & Traceability Indicators',
        svg: generateGaugesSvg(gauges, 'Operational Quality & Traceability Indicators'),
        data: gauges.map(g => [g.label, `${g.pct}% (${g.detail})`]),
      });
    }
    return chartObjects;
  };

  // Export handlers
  const getReportPayload = () => {
    const filterParts = [
      fState && `State: ${fState}`,
      fVariety && `Variety: ${fVariety}`,
      fStatus && `Status: ${fStatus}`,
      `Window: Last ${fPeriod} Months`,
    ].filter(Boolean);

    return {
      title: 'IITA Cocoa Seed Tracker - Visual Infographics Report',
      filterLabel: filterParts.length ? filterParts.join(' | ') : 'All Batches (Unfiltered)',
      summary: {
        'Seedlings Logged': totalSeedlings,
        'Distributed Volume': totalDistributed,
        'Verified Batches': verifiedCount,
        'Pending Audits': pendingCount,
        'Verification Rate': `${verificationRate}%`,
        'Matching Records': filteredProd.length,
      },
      charts: getSelectedChartObjects(),
      rows: filteredProd,
    };
  };

  const handleExport = (format) => {
    const payload = getReportPayload();
    if (format === 'excel') exportExcel(payload);
    else if (format === 'word') exportWord(payload);
    else if (format === 'powerpoint') exportPowerPoint(payload);
    else if (format === 'pdf') exportPdf(payload);
  };

  const hasFilters = Boolean(fState || fVariety || fStatus);

  return (
    <div className="p-3 sm:p-6 space-y-6">
      {/* Top Filter and Export Bar */}
      <section className="bg-white border border-gray-200 p-4 sm:p-7 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#E7E1D5] pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Operational Infographics</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Multi-dimensional operational analytics and cross-format visual report center.
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExport('excel')}
              className="report-excel-button compact-action flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
              title="Download Excel with chart metric breakdowns"
            >
              <Icon name="download" className="w-4 h-4" />
              Excel (.csv)
            </button>
            <button
              onClick={() => handleExport('word')}
              className="px-3 py-2 border border-blue-600 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 flex items-center justify-center gap-1.5 min-h-[36px] flex-1 sm:flex-none"
              title="Download Word document with embedded charts"
            >
              <Icon name="download" className="w-4 h-4" />
              Word (.doc)
            </button>
            <button
              onClick={() => handleExport('powerpoint')}
              className="px-3 py-2 border border-amber-600 bg-amber-50 text-amber-800 text-sm font-semibold hover:bg-amber-100 flex items-center justify-center gap-1.5 min-h-[36px] flex-1 sm:flex-none"
              title="Download PowerPoint presentation with chart slides"
            >
              <Icon name="download" className="w-4 h-4" />
              PowerPoint (.ppt)
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="action-button compact-action flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
              title="Download or Print PDF infographics briefing"
            >
              <Icon name="download" className="w-4 h-4" />
              PDF Report
            </button>
          </div>
        </div>

        {/* Graph Selection Toolbar */}
        <div className="bg-[#FAF8F1] border border-[#E7E1D5] p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide font-bold text-[#8B8576]">Select Graphs for Export:</span>
              <span className="px-2 py-0.5 bg-[#176B3A] text-white text-[11px] font-mono font-semibold">
                {selectedCharts.length} of {ALL_CHARTS.length} selected
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={selectAllCharts}
                className="text-[#176B3A] font-semibold hover:underline"
              >
                Select all
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={deselectAllCharts}
                className="text-gray-500 hover:underline"
              >
                Deselect all
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {ALL_CHARTS.map(c => {
              const isChecked = selectedCharts.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-2 p-2 text-xs border cursor-pointer select-none transition-colors ${
                    isChecked
                      ? 'bg-white border-[#176B3A] text-gray-900 font-semibold'
                      : 'bg-transparent border-gray-200 text-gray-500 hover:bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleChart(c.id)}
                    className="accent-[#176B3A] w-3.5 h-3.5"
                  />
                  <span className="truncate" title={c.label}>{c.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Filter Controls (Fully Responsive on Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <label className="space-y-1.5">
            <span className="block text-xs uppercase tracking-wide font-semibold text-[#8B8576]">Seed garden location</span>
            <select
              value={fState}
              onChange={(e) => setFState(e.target.value)}
              className="app-select w-full text-gray-900 font-medium"
            >
              <option value="">All states</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs uppercase tracking-wide font-semibold text-[#8B8576]">Cocoa variety</span>
            <select
              value={fVariety}
              onChange={(e) => setFVariety(e.target.value)}
              className="app-select w-full text-gray-900 font-medium"
            >
              <option value="">All varieties</option>
              {varieties.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs uppercase tracking-wide font-semibold text-[#8B8576]">Status</span>
            <select
              value={fStatus}
              onChange={(e) => setFStatus(e.target.value)}
              className="app-select w-full text-gray-900 font-medium"
            >
              <option value="">All statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs uppercase tracking-wide font-semibold text-[#8B8576]">Timeline window</span>
            <select
              value={fPeriod}
              onChange={(e) => setFPeriod(Number(e.target.value))}
              className="app-select w-full text-gray-900 font-medium"
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Full 12 months</option>
            </select>
          </label>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 border-t border-[#E7E1D5] pt-3">
          <span>Matching: <strong>{filteredProd.length}</strong> batches</span>
          <span className="text-gray-300">|</span>
          <span>Seedlings volume: <strong className="text-[#176B3A]">{totalSeedlings.toLocaleString()}</strong></span>
          <span className="text-gray-300">|</span>
          <span>Verified compliance: <strong className="text-[#176B3A]">{verificationRate}%</strong></span>
          {hasFilters && (
            <button
              onClick={() => { setFState(''); setFVariety(''); setFStatus(''); }}
              className="ml-auto text-[#FF5A1F] hover:underline font-medium text-xs"
            >
              Clear all filters
            </button>
          )}
        </div>
      </section>

      {/* Chart Grid Row 1: Production Trend (VBar) & Delivery Curve (AreaChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Production Trend */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCharts.includes('prodTrend')}
                onChange={() => toggleChart('prodTrend')}
                className="accent-[#176B3A] w-4 h-4 cursor-pointer"
                title="Include in report download"
              />
              <div className="section-heading text-base sm:text-lg">Production trend</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono hidden sm:inline">Monthly bar volume</span>
              <button
                type="button"
                onClick={() => downloadSvg(generateVBarSvg(prodTrendItems, 'Monthly Production Trend', 'Seedlings logged'), 'production_trend.svg')}
                className="px-2 py-1 text-[11px] border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                title="Download SVG vector chart"
              >
                <Icon name="download" className="w-3 h-3" />
                SVG
              </button>
            </div>
          </div>
          <VBar items={prodTrendItems} axisLabel="Seedlings recorded" />
        </div>

        {/* Chart 2: Delivery Volume Curve */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCharts.includes('distTrend')}
                onChange={() => toggleChart('distTrend')}
                className="accent-[#176B3A] w-4 h-4 cursor-pointer"
                title="Include in report download"
              />
              <div className="section-heading text-base sm:text-lg">Delivery volume curve</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono hidden sm:inline">{totalDistributed.toLocaleString()} delivered</span>
              <button
                type="button"
                onClick={() => downloadSvg(generateAreaSvg(distTrendItems, 'Farmer Seedling Delivery Volume Curve', 'Seedlings delivered'), 'delivery_curve.svg')}
                className="px-2 py-1 text-[11px] border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                title="Download SVG vector chart"
              >
                <Icon name="download" className="w-3 h-3" />
                SVG
              </button>
            </div>
          </div>
          <AreaChart items={distTrendItems} axisLabel="Seedlings delivered" />
        </div>
      </div>

      {/* Chart Grid Row 2: Phytosanitary Audit Donut (DonutChart) & Variety Allocation (HBar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 3: Phytosanitary Audit Donut */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCharts.includes('inspDonut')}
                onChange={() => toggleChart('inspDonut')}
                className="accent-[#176B3A] w-4 h-4 cursor-pointer"
                title="Include in report download"
              />
              <div className="section-heading text-base sm:text-lg">Phytosanitary inspection breakdown</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono hidden sm:inline">{inspections.length} audits</span>
              <button
                type="button"
                onClick={() => downloadSvg(generateDonutSvg(inspItems, inspColors, inspections.length.toLocaleString(), 'Audits', 'Phytosanitary Inspection Breakdown'), 'inspection_breakdown.svg')}
                className="px-2 py-1 text-[11px] border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                title="Download SVG vector chart"
              >
                <Icon name="download" className="w-3 h-3" />
                SVG
              </button>
            </div>
          </div>
          <DonutChart
            items={inspItems}
            colors={inspColors}
            centerText={inspections.length.toLocaleString()}
            centerSub="Audits"
          />
        </div>

        {/* Chart 4: Seedlings by Variety */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCharts.includes('varBar')}
                onChange={() => toggleChart('varBar')}
                className="accent-[#176B3A] w-4 h-4 cursor-pointer"
                title="Include in report download"
              />
              <div className="section-heading text-base sm:text-lg">Seedlings by variety</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono hidden sm:inline">{varItems.length} varieties</span>
              <button
                type="button"
                onClick={() => downloadSvg(generateHBarSvg(varItems, 'Cocoa Seedling Volume by Variety'), 'varieties_distribution.svg')}
                className="px-2 py-1 text-[11px] border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                title="Download SVG vector chart"
              >
                <Icon name="download" className="w-3 h-3" />
                SVG
              </button>
            </div>
          </div>
          <HBar items={varItems} />
        </div>
      </div>

      {/* Chart Grid Row 3: Seed Garden Density (LineChart) & Operational Quality Ratios (Progress Gauges) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 5: Seed Garden Density by State */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCharts.includes('densityLine')}
                onChange={() => toggleChart('densityLine')}
                className="accent-[#176B3A] w-4 h-4 cursor-pointer"
                title="Include in report download"
              />
              <div className="section-heading text-base sm:text-lg">Seed garden density by state</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono hidden sm:inline">{nurseries.length} seed gardens</span>
              <button
                type="button"
                onClick={() => downloadSvg(generateLineSvg(stateNurItems, 'Seed Garden Density by State', 'Seed gardens'), 'seed_garden_density.svg')}
                className="px-2 py-1 text-[11px] border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                title="Download SVG vector chart"
              >
                <Icon name="download" className="w-3 h-3" />
                SVG
              </button>
            </div>
          </div>
          <LineChart items={stateNurItems} axisLabel="Registered seed gardens" />
        </div>

        {/* Chart 6: Operational Quality Indicators */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCharts.includes('qualityGauges')}
                onChange={() => toggleChart('qualityGauges')}
                className="accent-[#176B3A] w-4 h-4 cursor-pointer"
                title="Include in report download"
              />
              <div className="section-heading text-base sm:text-lg">Operational quality indicators</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#176B3A] font-semibold tracking-wide uppercase hidden sm:inline">Traceability Index</span>
              <button
                type="button"
                onClick={() => {
                  const gauges = [
                    { label: 'Phytosanitary Certification Rate', pct: verificationRate, color: '#176B3A', detail: `${verifiedCount} batches verified compliant` },
                    { label: 'Active Seed Garden Accreditation', pct: activeNurseryRate, color: '#059669', detail: `${nurseries.filter(n => n.status === 'Active').length} of ${nurseries.length} licensed facilities active` },
                    { label: 'Farmer Distribution Fulfillment', pct: distributionFulfillmentRate, color: '#FF5A1F', detail: `${totalDistributed.toLocaleString()} of ${totalSeedlings.toLocaleString()} seedlings dispatched` },
                  ];
                  downloadSvg(generateGaugesSvg(gauges, 'Operational Quality & Traceability Indicators'), 'quality_indicators.svg');
                }}
                className="px-2 py-1 text-[11px] border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                title="Download SVG vector chart"
              >
                <Icon name="download" className="w-3 h-3" />
                SVG
              </button>
            </div>
          </div>

          <div className="space-y-4 py-1">
            {/* Indicator 1 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-800">Phytosanitary Certification Rate</span>
                <span className="font-mono font-bold text-[#176B3A]">{verificationRate}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3">
                <div
                  className="bg-[#176B3A] h-full transition-all duration-300"
                  style={{ width: `${Math.max(verificationRate, 2)}%` }}
                />
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">{verifiedCount} batches verified compliant</div>
            </div>

            {/* Indicator 2 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-800">Active Seed Garden Accreditation</span>
                <span className="font-mono font-bold text-emerald-700">{activeNurseryRate}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${Math.max(activeNurseryRate, 2)}%` }}
                />
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">{nurseries.filter(n => n.status === 'Active').length} of {nurseries.length} licensed facilities active</div>
            </div>

            {/* Indicator 3 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-800">Farmer Distribution Fulfillment</span>
                <span className="font-mono font-bold text-[#FF5A1F]">{distributionFulfillmentRate}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3">
                <div
                  className="bg-[#FF5A1F] h-full transition-all duration-300"
                  style={{ width: `${Math.max(distributionFulfillmentRate, 2)}%` }}
                />
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">{totalDistributed.toLocaleString()} of {totalSeedlings.toLocaleString()} seedlings dispatched</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
