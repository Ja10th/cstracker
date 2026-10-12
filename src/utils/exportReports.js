/**
 * Cocoa Seed Tracker - Multi-Format Report & Infographics Exporter
 * Supports Excel (.csv / .xls), Word (.doc), PowerPoint (.ppt), and PDF (.pdf / print)
 * Includes native SVG chart embedding for Infographics exports.
 */

export function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSvg(svgContent, filename = 'chart.svg') {
  downloadBlob(svgContent, filename, 'image/svg+xml;charset=utf-8');
}

/* ─────────────────────────────────────────────────────────────────────────────
   CHART SVG STRING BUILDERS (for standalone vector export & document embedding)
   ───────────────────────────────────────────────────────────────────────────── */

export function generateVBarSvg(items = [], title = 'Production Trend', axisLabel = 'Seedlings') {
  const width = 620;
  const height = 240;
  const padBottom = 38;
  const padTop = 35;
  const max = Math.max(...items.map(([, v]) => Number(v) || 0), 1);
  const chartHeight = height - padTop - padBottom;
  const colWidth = items.length ? (width - 40) / items.length : 40;

  const bars = items.map(([label, val], i) => {
    const v = Number(val) || 0;
    const barH = Math.max(Math.round((v / max) * chartHeight), 4);
    const x = 20 + i * colWidth + colWidth * 0.15;
    const barW = Math.max(colWidth * 0.7, 8);
    const y = padTop + chartHeight - barH;
    const color = i % 2 === 0 ? '#176B3A' : '#FF5A1F';
    const textVal = v > 999 ? (v / 1000).toFixed(1) + 'k' : v;
    return `
      <g>
        <text x="${x + barW / 2}" y="${y - 6}" font-size="10" font-family="sans-serif" font-weight="600" fill="#4B5563" text-anchor="middle">${textVal}</text>
        <rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="${color}" rx="2" />
        <text x="${x + barW / 2}" y="${height - 12}" font-size="10" font-family="sans-serif" fill="#6B7280" text-anchor="middle">${label}</text>
      </g>
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#FAF8F1;border:1px solid #E5E7EB;border-radius:4px;">
      <text x="20" y="22" font-size="13" font-family="sans-serif" font-weight="bold" fill="#1F2937">${title}</text>
      <text x="${width - 20}" y="22" font-size="10" font-family="sans-serif" fill="#6B7280" text-anchor="end">${axisLabel}</text>
      <line x1="20" y1="${padTop + chartHeight}" x2="${width - 20}" y2="${padTop + chartHeight}" stroke="#D1D5DB" stroke-width="1" />
      ${bars}
    </svg>
  `;
}

export function generateAreaSvg(items = [], title = 'Delivery Volume Curve', axisLabel = 'Dispatched Seedlings') {
  const width = 620;
  const height = 240;
  const padding = { top: 38, right: 24, bottom: 38, left: 45 };
  const values = items.map(([, value]) => Number(value) || 0);
  const max = Math.max(...values, 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = values.map((val, idx) => {
    const x = padding.left + (items.length <= 1 ? chartWidth / 2 : (idx / (items.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - (val / max) * chartHeight;
    return { x, y, val, label: items[idx]?.[0] || '' };
  });

  const lineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaStr = `${padding.left},${padding.top + chartHeight} ${lineStr} ${width - padding.right},${padding.top + chartHeight}`;

  const dots = points.map(p => `
    <g>
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#FFFFFF" stroke="#176B3A" stroke-width="2" />
      <text x="${p.x.toFixed(1)}" y="${height - 12}" font-size="10" font-family="sans-serif" fill="#6B7280" text-anchor="middle">${p.label}</text>
    </g>
  `).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#FAF8F1;border:1px solid #E5E7EB;border-radius:4px;">
      <defs>
        <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#176B3A" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#176B3A" stop-opacity="0.03"/>
        </linearGradient>
      </defs>
      <text x="20" y="22" font-size="13" font-family="sans-serif" font-weight="bold" fill="#1F2937">${title}</text>
      <text x="${width - 20}" y="22" font-size="10" font-family="sans-serif" fill="#6B7280" text-anchor="end">${axisLabel}</text>
      <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" stroke="#D1D5DB" stroke-width="1" />
      <polygon points="${areaStr}" fill="url(#curveGradient)" />
      <polyline points="${lineStr}" fill="none" stroke="#176B3A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${dots}
    </svg>
  `;
}

export function generateDonutSvg(items = [], colors = ['#176B3A', '#E5B83D', '#FF5A1F', '#B3261E'], centerText = '', centerSub = 'Audits', title = 'Phytosanitary Breakdown') {
  const width = 620;
  const height = 240;
  const total = items.reduce((sum, [, val]) => sum + (Number(val) || 0), 0) || 1;
  const size = 150;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = 110;
  const cy = 120;

  let accumulated = 0;
  const slices = items.map(([label, value], idx) => {
    const val = Number(value) || 0;
    const pct = val / total;
    const dashLength = pct * circumference;
    const offset = accumulated * circumference;
    accumulated += pct;
    return {
      label,
      val,
      pct: Math.round(pct * 100),
      color: colors[idx % colors.length],
      dashArray: `${dashLength.toFixed(1)} ${(circumference - dashLength).toFixed(1)}`,
      dashOffset: (-offset).toFixed(1),
    };
  });

  const circles = slices.map(s => `
    <circle cx="${cx}" cy="${cy}" r="${radius}" fill="transparent" stroke="${s.color}" stroke-width="${strokeWidth}" stroke-dasharray="${s.dashArray}" stroke-dashoffset="${s.dashOffset}" transform="rotate(-90 ${cx} ${cy})" />
  `).join('');

  const legend = slices.map((s, i) => {
    const ly = 70 + i * 32;
    return `
      <g>
        <rect x="230" y="${ly}" width="14" height="14" fill="${s.color}" rx="2" />
        <text x="252" y="${ly + 11}" font-size="12" font-family="sans-serif" font-weight="600" fill="#1F2937">${s.label}</text>
        <text x="470" y="${ly + 11}" font-size="12" font-family="monospace" font-weight="bold" fill="#111827" text-anchor="end">${s.val.toLocaleString()}</text>
        <text x="530" y="${ly + 11}" font-size="11" font-family="sans-serif" fill="#6B7280" text-anchor="end">(${s.pct}%)</text>
      </g>
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#FAF8F1;border:1px solid #E5E7EB;border-radius:4px;">
      <text x="20" y="22" font-size="13" font-family="sans-serif" font-weight="bold" fill="#1F2937">${title}</text>
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="transparent" stroke="#E5E7EB" stroke-width="${strokeWidth}" />
      ${circles}
      <text x="${cx}" y="${cy + 5}" font-size="16" font-family="sans-serif" font-weight="bold" fill="#111827" text-anchor="middle">${centerText || total.toLocaleString()}</text>
      <text x="${cx}" y="${cy + 20}" font-size="9" font-family="sans-serif" fill="#6B7280" text-anchor="middle" text-transform="uppercase">${centerSub}</text>
      ${legend}
    </svg>
  `;
}

export function generateHBarSvg(items = [], title = 'Seedlings by Cocoa Variety') {
  const width = 620;
  const height = Math.max(240, 45 + items.length * 36);
  const max = Math.max(...items.map(([, val]) => Number(val) || 0), 1);
  const colors = ['#176B3A', '#FF5A1F'];

  const rows = items.map(([label, val], idx) => {
    const v = Number(val) || 0;
    const barW = Math.max(Math.round((v / max) * 320), 4);
    const y = 45 + idx * 36;
    const color = colors[idx % colors.length];
    return `
      <g>
        <text x="140" y="${y + 14}" font-size="11" font-family="sans-serif" fill="#374151" text-anchor="end">${label}</text>
        <rect x="150" y="${y}" width="330" height="20" fill="#E5E7EB" rx="2" />
        <rect x="150" y="${y}" width="${barW}" height="20" fill="${color}" rx="2" />
        <text x="${160 + barW}" y="${y + 14}" font-size="11" font-family="monospace" font-weight="600" fill="#111827">${v.toLocaleString()}</text>
      </g>
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#FAF8F1;border:1px solid #E5E7EB;border-radius:4px;">
      <text x="20" y="22" font-size="13" font-family="sans-serif" font-weight="bold" fill="#1F2937">${title}</text>
      ${rows}
    </svg>
  `;
}

export function generateLineSvg(items = [], title = 'Seed Garden Density by State', axisLabel = 'Registered Seed Gardens') {
  const width = 620;
  const height = 240;
  const padding = { top: 38, right: 24, bottom: 38, left: 45 };
  const values = items.map(([, val]) => Number(val) || 0);
  const max = Math.max(...values, 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = values.map((val, idx) => {
    const x = padding.left + (items.length <= 1 ? chartWidth / 2 : (idx / (items.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - (val / max) * chartHeight;
    return { x, y, val, label: items[idx]?.[0] || '' };
  });

  const lineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const markers = points.map(p => `
    <g>
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#FFFFFF" stroke="#176B3A" stroke-width="2.5" />
      <text x="${p.x.toFixed(1)}" y="${p.y - 8}" font-size="10" font-family="sans-serif" font-weight="bold" fill="#176B3A" text-anchor="middle">${p.val}</text>
      <text x="${p.x.toFixed(1)}" y="${height - 12}" font-size="10" font-family="sans-serif" fill="#6B7280" text-anchor="middle">${p.label}</text>
    </g>
  `).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#FAF8F1;border:1px solid #E5E7EB;border-radius:4px;">
      <text x="20" y="22" font-size="13" font-family="sans-serif" font-weight="bold" fill="#1F2937">${title}</text>
      <text x="${width - 20}" y="22" font-size="10" font-family="sans-serif" fill="#6B7280" text-anchor="end">${axisLabel}</text>
      <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" stroke="#D1D5DB" stroke-width="1" />
      <polyline points="${lineStr}" fill="none" stroke="#176B3A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${markers}
    </svg>
  `;
}

export function generateGaugesSvg(gauges = [], title = 'Operational Quality Indicators') {
  const width = 620;
  const height = 240;

  const rows = gauges.map((g, idx) => {
    const y = 45 + idx * 56;
    const pct = Math.min(100, Math.max(0, g.pct || 0));
    const barW = Math.round((pct / 100) * 540);
    const color = g.color || '#176B3A';
    return `
      <g>
        <text x="20" y="${y + 14}" font-size="12" font-family="sans-serif" font-weight="600" fill="#1F2937">${g.label}</text>
        <text x="${width - 20}" y="${y + 14}" font-size="12" font-family="monospace" font-weight="bold" fill="${color}" text-anchor="end">${pct}%</text>
        <rect x="20" y="${y + 22}" width="580" height="12" fill="#E5E7EB" rx="3" />
        <rect x="20" y="${y + 22}" width="${barW}" height="12" fill="${color}" rx="3" />
        <text x="20" y="${y + 45}" font-size="10" font-family="sans-serif" fill="#6B7280">${g.detail || ''}</text>
      </g>
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#FAF8F1;border:1px solid #E5E7EB;border-radius:4px;">
      <text x="20" y="22" font-size="13" font-family="sans-serif" font-weight="bold" fill="#1F2937">${title}</text>
      ${rows}
    </svg>
  `;
}

/* ─────────────────────────────────────────────────────────────────────────────
   EXCEL (.csv / formatted multi-table) EXPORT
   ───────────────────────────────────────────────────────────────────────────── */

export function exportExcel(reportData, customFilename) {
  const { title = 'Cocoa Seed Tracker Report', filterLabel = 'All Data', rows = [], summary = {}, charts = [] } = reportData;
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `IITA_Cocoa_Report_${timestamp}.csv`;

  let csv = '\uFEFF';
  csv += `"${title}"\n`;
  csv += `"Generated on: ${new Date().toLocaleString()} | Scope: ${filterLabel}"\n\n`;

  if (summary && Object.keys(summary).length > 0) {
    csv += `"EXECUTIVE KEY PERFORMANCE INDICATORS"\n`;
    Object.entries(summary).forEach(([k, v]) => {
      csv += `"${k}","${typeof v === 'number' ? v.toLocaleString() : v}"\n`;
    });
    csv += `\n`;
  }

  // If charts are provided, include aggregated breakdown sections
  if (charts && charts.length > 0) {
    csv += `"SELECTED GRAPHICAL ANALYTICS BREAKDOWN"\n`;
    charts.forEach(c => {
      csv += `\n"--- ${c.title.toUpperCase()} ---"\n`;
      if (Array.isArray(c.data)) {
        csv += `"Category / Label","Metric Value"\n`;
        c.data.forEach(([label, val]) => {
          csv += `"${label}","${typeof val === 'number' ? val.toLocaleString() : val}"\n`;
        });
      }
    });
    csv += `\n`;
  }

  if (rows && rows.length > 0) {
    csv += `"SEEDLING PRODUCTION & DISTRIBUTION RECORDS"\n`;
    const headers = ['Record ID', 'Seed Garden', 'State', 'Variety', 'Quantity', 'Date', 'Recorded By', 'Status'];
    csv += headers.map(h => `"${h}"`).join(',') + '\n';

    rows.forEach(r => {
      const rowData = [
        r.id || '',
        r.nur || r.name || '',
        r.state || '',
        r.variety || '',
        r.qty != null ? Number(r.qty).toLocaleString() : '',
        r.date || '',
        r.by || r.op || '',
        r.status || ''
      ];
      csv += rowData.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\n';
    });
  }

  downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
}

/* ─────────────────────────────────────────────────────────────────────────────
   WORD (.doc) EXPORT WITH EMBEDDED VISUAL CHARTS
   ───────────────────────────────────────────────────────────────────────────── */

export function exportWord(reportData, customFilename) {
  const { title = 'Cocoa Seed Tracker - Management Report', filterLabel = 'All Records', rows = [], summary = {}, charts = [] } = reportData;
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `IITA_Cocoa_Report_${timestamp}.doc`;

  const summaryHtml = Object.entries(summary).map(([k, v]) => `
    <td style="padding: 10px; border: 1px solid #d1d5db; background: #f9fafb; text-align: center;">
      <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold;">${k}</div>
      <div style="font-size: 18px; font-weight: bold; color: #176B3A; margin-top: 4px;">${typeof v === 'number' ? v.toLocaleString() : v}</div>
    </td>
  `).join('');

  // Charts HTML
  const chartsHtml = (charts && charts.length > 0) ? `
    <h2 style="color: #176B3A; border-bottom: 2px solid #176B3A; padding-bottom: 6px; margin-top: 24px;">Selected Operational Infographics (${charts.length} Visual Charts)</h2>
    ${charts.map(c => `
      <div style="margin-bottom: 28px; page-break-inside: avoid; background: #FAF8F1; border: 1px solid #E5E7EB; padding: 16px;">
        <h3 style="margin: 0 0 10px 0; color: #176B3A; font-size: 16px;">${c.title}</h3>
        <div style="margin-bottom: 12px; text-align: center;">
          ${c.svg || ''}
        </div>
        ${Array.isArray(c.data) && c.data.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
            <thead>
              <tr style="background: #176B3A; color: white;">
                <th style="padding: 6px 8px; text-align: left;">Metric Dimension</th>
                <th style="padding: 6px 8px; text-align: right;">Value / Count</th>
              </tr>
            </thead>
            <tbody>
              ${c.data.map(([k, v], idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB'};">
                  <td style="padding: 6px 8px; border-bottom: 1px solid #E5E7EB;">${k}</td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #E5E7EB; text-align: right; font-weight: bold;">${typeof v === 'number' ? v.toLocaleString() : v}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
    `).join('')}
  ` : '';

  const rowsHtml = rows.slice(0, 100).map((r, i) => `
    <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
      <td style="padding: 6px 8px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 11px; color: #176B3A;">${r.id || ''}</td>
      <td style="padding: 6px 8px; border: 1px solid #e5e7eb; font-weight: 600;">${r.nur || r.name || ''}</td>
      <td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${r.state || '—'}</td>
      <td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${r.variety || '—'}</td>
      <td style="padding: 6px 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${r.qty != null ? Number(r.qty).toLocaleString() : '—'}</td>
      <td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${r.date || ''}</td>
      <td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${r.by || r.op || ''}</td>
      <td style="padding: 6px 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600; color: ${r.status === 'Verified' || r.status === 'Active' ? '#176B3A' : r.status === 'Rejected' ? '#B3261E' : '#FF5A1F'};">${r.status || ''}</td>
    </tr>
  `).join('');

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; color: #1f2937; margin: 30px; line-height: 1.4; }
        h1 { color: #176B3A; font-size: 22px; margin-bottom: 4px; }
        .meta { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th { background: #176B3A; color: #ffffff; padding: 8px 6px; text-align: left; font-size: 11px; text-transform: uppercase; }
        .footer { margin-top: 30px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div style="border-bottom: 2px solid #176B3A; padding-bottom: 8px; margin-bottom: 16px;">
        <span style="font-size: 12px; font-weight: bold; color: #FF5A1F; letter-spacing: 1px;">INTERNATIONAL INSTITUTE OF TROPICAL AGRICULTURE (IITA)</span>
        <h1>${title}</h1>
        <div class="meta">Genetic Resources Center (GRC) Seed Unit | Generated: ${new Date().toLocaleString()} | Scope: ${filterLabel}</div>
      </div>

      ${summary && Object.keys(summary).length > 0 ? `
        <table style="margin-bottom: 24px;">
          <tr>${summaryHtml}</tr>
        </table>
      ` : ''}

      ${chartsHtml}

      ${rows.length > 0 ? `
        <h3 style="color: #374151; margin-top: 24px;">Audit Batches Sample (${rows.length} total)</h3>
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Seed Garden</th>
              <th>State</th>
              <th>Variety</th>
              <th style="text-align: right;">Quantity</th>
              <th>Date</th>
              <th>Recorded By</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      ` : ''}

      <div class="footer">
        Cocoa Seed Tracker Platform &bull; National Seed Traceability &bull; Cocoa Seed Helpdesk: cacaoseed@iita.org &bull; 08012345678
      </div>
    </body>
    </html>
  `;

  downloadBlob(docHtml, filename, 'application/msword;charset=utf-8');
}

/* ─────────────────────────────────────────────────────────────────────────────
   POWERPOINT (.ppt) EXPORT WITH DEDICATED VISUAL CHART SLIDES
   ───────────────────────────────────────────────────────────────────────────── */

export function exportPowerPoint(reportData, customFilename) {
  const { title = 'Cocoa Seed Tracker Executive Briefing', filterLabel = 'National Scope', rows = [], summary = {}, charts = [] } = reportData;
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `IITA_Cocoa_Presentation_${timestamp}.ppt`;

  const summaryCards = Object.entries(summary).map(([k, v]) => `
    <div style="flex: 1; min-width: 140px; background: #FAF8F1; border-top: 4px solid #176B3A; padding: 14px; margin: 6px;">
      <div style="font-size: 11px; text-transform: uppercase; color: #8B8576; font-weight: bold;">${k}</div>
      <div style="font-size: 22px; font-weight: bold; color: #176B3A; margin-top: 4px;">${typeof v === 'number' ? v.toLocaleString() : v}</div>
    </div>
  `).join('');

  // Individual chart slides
  const chartSlides = (charts && charts.length > 0) ? charts.map((c, idx) => `
    <div class="slide">
      <div class="slide-header">
        <div class="slide-sub">Operational Visual Analytics &bull; Slide ${idx + 3}</div>
        <h2 class="slide-title">${c.title}</h2>
      </div>
      <div style="display: flex; gap: 20px; align-items: center; margin: auto 0;">
        <div style="flex: 1.4; text-align: center;">
          ${c.svg || ''}
        </div>
        ${Array.isArray(c.data) && c.data.length > 0 ? `
          <div style="flex: 0.8; background: #FAF8F1; border: 1px solid #E5E7EB; padding: 12px;">
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #8B8576; margin-bottom: 8px;">Key Metric Values</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              ${c.data.slice(0, 6).map(([k, v]) => `
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 4px 0; color: #4B5563;">${k}</td>
                  <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #176B3A;">${typeof v === 'number' ? v.toLocaleString() : v}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        ` : ''}
      </div>
      <div class="slide-footer">
        <span>IITA Cocoa Seed Tracker Executive Briefing &bull; Scope: ${filterLabel}</span>
        <span>Slide ${idx + 3} of ${charts.length + 2}</span>
      </div>
    </div>
  `).join('') : `
    <div class="slide">
      <div class="slide-header">
        <div class="slide-sub">Production Snapshot</div>
        <h2 class="slide-title">Recent Certified Seedling Batches</h2>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 20px 0;">
        <thead>
          <tr style="background: #176B3A; color: #ffffff;">
            <th style="padding: 8px 10px; text-align: left;">Reference</th>
            <th style="padding: 8px 10px; text-align: left;">Seed Garden</th>
            <th style="padding: 8px 10px; text-align: left;">Variety</th>
            <th style="padding: 8px 10px; text-align: right;">Quantity</th>
            <th style="padding: 8px 10px; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows.slice(0, 8).map(r => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 6px 10px; font-family: monospace; font-size: 11px; color: #176B3A;">${r.id}</td>
              <td style="padding: 6px 10px; font-weight: 600;">${r.nur || r.name}</td>
              <td style="padding: 6px 10px;">${r.variety || 'CRIN TC-1'}</td>
              <td style="padding: 6px 10px; text-align: right; font-weight: bold;">${r.qty != null ? Number(r.qty).toLocaleString() : '—'}</td>
              <td style="padding: 6px 10px; text-align: center; color: #176B3A; font-weight: bold;">${r.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="slide-footer">
        <span>IITA Cocoa Seed Tracker Briefing</span>
        <span>Slide 3</span>
      </div>
    </div>
  `;

  const pptHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
        .slide { background: #ffffff; border: 1px solid #d1d5db; width: 880px; min-height: 520px; margin: 20px auto; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); page-break-after: always; display: flex; flex-direction: column; justify-content: space-between; }
        .slide-header { border-bottom: 3px solid #176B3A; padding-bottom: 10px; }
        .slide-title { font-size: 22px; font-weight: bold; color: #176B3A; margin: 0; }
        .slide-sub { font-size: 12px; color: #FF5A1F; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
        .slide-footer { font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <!-- SLIDE 1: TITLE SLIDE -->
      <div class="slide" style="background: linear-gradient(135deg, #176B3A 0%, #0D3E21 100%); color: #ffffff;">
        <div style="text-align: right;">
          <span style="background: #FF5A1F; color: #ffffff; padding: 4px 12px; font-size: 11px; font-weight: bold; letter-spacing: 1px;">IITA GRC SEED UNIT</span>
        </div>
        <div style="margin: auto 0;">
          <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0; color: #FAF8F1;">${title}</h1>
          <p style="font-size: 15px; color: #E5B83D; margin: 0 0 6px 0;">National Cocoa Seedling Traceability &amp; Certification Progress</p>
          <p style="font-size: 12px; color: #d1fae5; margin: 0;">Reporting Scope: ${filterLabel} &bull; Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; font-size: 11px; color: #a7f3d0; display: flex; justify-content: space-between;">
          <span>International Institute of Tropical Agriculture &bull; Ibadan, Nigeria</span>
          <span>Cocoa Seed Tracker 2026</span>
        </div>
      </div>

      <!-- SLIDE 2: EXECUTIVE SUMMARY & KEY METRICS -->
      <div class="slide">
        <div class="slide-header">
          <div class="slide-sub">Performance Dashboard</div>
          <h2 class="slide-title">Executive Key Performance Indicators</h2>
        </div>
        <div style="display: flex; flex-wrap: wrap; margin: 20px 0;">
          ${summaryCards}
        </div>
        <div style="background: #FAF8F1; border-left: 4px solid #FF5A1F; padding: 12px; font-size: 12px; color: #374151;">
          <strong>Strategic Overview:</strong> Phytosanitary verification and certified seedling batches comply with IITA GRC quality assurance guidelines. Traceability protocols active across southwest cocoa producing states.
        </div>
        <div class="slide-footer">
          <span>IITA Cocoa Seed Tracker Briefing</span>
          <span>Slide 2 of ${charts.length ? charts.length + 2 : 3}</span>
        </div>
      </div>

      <!-- SLIDE 3+: DEDICATED CHARTS SLIDES -->
      ${chartSlides}
    </body>
    </html>
  `;

  downloadBlob(pptHtml, filename, 'application/vnd.ms-powerpoint;charset=utf-8');
}

/* ─────────────────────────────────────────────────────────────────────────────
   PDF (.pdf print/save dialog) EXPORT WITH NATIVE VISUAL CHARTS
   ───────────────────────────────────────────────────────────────────────────── */

export function exportPdf(reportData, customFilename) {
  const { title = 'Cocoa Seed Tracker Management Report', filterLabel = 'All Records', rows = [], summary = {}, charts = [] } = reportData;
  const timestamp = new Date().toISOString().slice(0, 10);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and save your PDF report.');
    return;
  }

  const summaryHtml = Object.entries(summary).map(([k, v]) => `
    <div class="kpi-box">
      <div class="kpi-label">${k}</div>
      <div class="kpi-value">${typeof v === 'number' ? v.toLocaleString() : v}</div>
    </div>
  `).join('');

  // Render selected visual charts
  const chartsHtml = (charts && charts.length > 0) ? `
    <div style="margin-top: 16px;">
      <div style="font-size: 13px; font-weight: bold; color: #176B3A; border-bottom: 2px solid #176B3A; padding-bottom: 4px; margin-bottom: 12px;">
        Visual Operational Analytics (${charts.length} Selected Graphs)
      </div>
      <div class="charts-grid">
        ${charts.map(c => `
          <div class="chart-card">
            ${c.svg || ''}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const tableRows = rows.slice(0, 60).map((r, i) => `
    <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
      <td class="mono">${r.id || ''}</td>
      <td><strong>${r.nur || r.name || ''}</strong></td>
      <td>${r.state || '—'}</td>
      <td>${r.variety || '—'}</td>
      <td class="right"><strong>${r.qty != null ? Number(r.qty).toLocaleString() : '—'}</strong></td>
      <td>${r.date || ''}</td>
      <td>${r.by || r.op || ''}</td>
      <td class="status ${String(r.status).toLowerCase().replace(/\s+/g, '-')}">${r.status || ''}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title} - IITA</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 16px; font-size: 11px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #176B3A; padding-bottom: 10px; margin-bottom: 12px; }
        .org-name { font-size: 10px; font-weight: 700; color: #FF5A1F; letter-spacing: 0.5px; text-transform: uppercase; }
        .report-title { font-size: 18px; font-weight: 700; color: #176B3A; margin: 3px 0; }
        .report-meta { font-size: 10px; color: #6b7280; }
        .kpi-grid { display: flex; gap: 8px; margin-bottom: 14px; }
        .kpi-box { flex: 1; background: #FAF8F1; border: 1px solid #E5E7EB; border-left: 3px solid #176B3A; padding: 8px; }
        .kpi-label { font-size: 9px; text-transform: uppercase; color: #8B8576; font-weight: 600; }
        .kpi-value { font-size: 16px; font-weight: 700; color: #176B3A; margin-top: 2px; }
        .charts-grid { display: grid; grid-template-cols: 1fr; gap: 12px; margin-bottom: 16px; }
        .chart-card { page-break-inside: avoid; text-align: center; }
        .chart-card svg { width: 100%; height: auto; max-height: 220px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
        th { background: #176B3A; color: #ffffff; text-align: left; padding: 6px 5px; font-weight: 600; font-size: 9px; text-transform: uppercase; }
        td { padding: 5px; border-bottom: 1px solid #e5e7eb; }
        tr.even { background: #ffffff; }
        tr.odd { background: #f9fafb; }
        .mono { font-family: monospace; color: #176B3A; font-weight: 600; }
        .right { text-align: right; }
        .status { font-weight: 600; }
        .status.verified, .status.active { color: #176B3A; }
        .status.pending { color: #D97706; }
        .status.rejected { color: #DC2626; }
        .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #9ca3af; display: flex; justify-content: space-between; }
        .actions-bar { position: sticky; top: 0; background: #FAF8F1; padding: 10px; margin-bottom: 14px; border-bottom: 1px solid #d1d5db; display: flex; gap: 10px; }
        .btn { padding: 6px 14px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; }
        .btn-print { background: #176B3A; color: white; }
        .btn-close { background: #e5e7eb; color: #374151; }
        @media print {
          .actions-bar { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="actions-bar">
        <button class="btn btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <button class="btn btn-close" onclick="window.close()">Close</button>
        <span style="font-size: 11px; color: #6b7280; align-self: center; margin-left: auto;">Tip: Select "Save as PDF" in destination printer</span>
      </div>

      <div class="header">
        <div>
          <div class="org-name">International Institute of Tropical Agriculture (IITA)</div>
          <div class="report-title">${title}</div>
          <div class="report-meta">Genetic Resources Center (GRC) Seed Unit &bull; Scope: ${filterLabel}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; font-weight: bold; color: #176B3A;">OFFICIAL REPORT</div>
          <div class="report-meta">Generated: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      ${summary && Object.keys(summary).length > 0 ? `
        <div class="kpi-grid">
          ${summaryHtml}
        </div>
      ` : ''}

      ${chartsHtml}

      ${rows.length > 0 ? `
        <div style="font-size: 11px; font-weight: 600; color: #374151; margin-top: 16px; margin-bottom: 4px;">
          Production Batches Sample (${rows.length} items)
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Seed Garden</th>
              <th>State</th>
              <th>Variety</th>
              <th class="right">Quantity</th>
              <th>Date</th>
              <th>Officer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      ` : ''}

      <div class="footer">
        <span>Cocoa Seed Tracker Platform &bull; Building 400, IITA Headquarters &bull; Cocoa Seed Helpdesk: cacaoseed@iita.org &bull; 08012345678</span>
        <span>Page 1</span>
      </div>

      <script>
        window.addEventListener('load', () => {
          setTimeout(() => { window.print(); }, 400);
        });
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
