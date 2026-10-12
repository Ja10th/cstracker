/**
 * Cacao Seed Tracker - Multi-Format Report Exporter
 * Supports Excel (.csv / .xls), Word (.doc), PowerPoint (.ppt), and PDF (.pdf / print)
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

/**
 * 1. EXCEL EXPORT (.csv with UTF-8 BOM and .xls XML format)
 */
export function exportExcel(reportData, customFilename) {
  const { title = 'Cacao Seed Tracker Report', filterLabel = 'All Data', rows = [], summary = {} } = reportData;
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `IITA_Cacao_Report_${timestamp}.csv`;

  // UTF-8 BOM so Excel opens special characters and commas properly
  let csv = '\uFEFF';
  csv += `"${title}"\n`;
  csv += `"Generated on: ${new Date().toLocaleString()} | Scope: ${filterLabel}"\n\n`;

  if (summary && Object.keys(summary).length > 0) {
    csv += `"SUMMARY METRICS"\n`;
    Object.entries(summary).forEach(([k, v]) => {
      csv += `"${k}","${typeof v === 'number' ? v.toLocaleString() : v}"\n`;
    });
    csv += `\n`;
  }

  csv += `"DETAIL RECORDS"\n`;
  const headers = ['Record ID', 'Nursery Name', 'State', 'Variety', 'Quantity', 'Date', 'Recorded By', 'Status'];
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

  downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * 2. WORD EXPORT (.doc - Microsoft Word compatible HTML document)
 */
export function exportWord(reportData, customFilename) {
  const { title = 'Cacao Seed Tracker - Management Report', filterLabel = 'All Records', rows = [], summary = {} } = reportData;
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `IITA_Cacao_Report_${timestamp}.doc`;

  const summaryHtml = Object.entries(summary).map(([k, v]) => `
    <td style="padding: 10px; border: 1px solid #d1d5db; background: #f9fafb; text-align: center;">
      <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold;">${k}</div>
      <div style="font-size: 18px; font-weight: bold; color: #176B3A; margin-top: 4px;">${typeof v === 'number' ? v.toLocaleString() : v}</div>
    </td>
  `).join('');

  const rowsHtml = rows.slice(0, 250).map((r, i) => `
    <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
      <td style="padding: 8px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 11px; color: #176B3A;">${r.id || ''}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">${r.nur || r.name || ''}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.state || '—'}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.variety || '—'}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${r.qty != null ? Number(r.qty).toLocaleString() : '—'}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.date || ''}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.by || r.op || ''}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600; color: ${r.status === 'Verified' || r.status === 'Active' ? '#176B3A' : r.status === 'Rejected' ? '#B3261E' : '#FF5A1F'};">${r.status || ''}</td>
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
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
        th { background: #176B3A; color: #ffffff; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
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

      <h3>Production &amp; Distribution Records (${rows.length} total)</h3>
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Nursery</th>
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

      <div class="footer">
        Cacao Seed Tracker Platform &bull; National Seed Traceability &bull; Cacao Seed Helpdesk: cacaoseed@iita.org &bull; 08012345678
      </div>
    </body>
    </html>
  `;

  downloadBlob(docHtml, filename, 'application/msword;charset=utf-8');
}

/**
 * 3. POWERPOINT EXPORT (.ppt - Presentation slide format)
 */
export function exportPowerPoint(reportData, customFilename) {
  const { title = 'Cacao Seed Tracker Executive Briefing', filterLabel = 'National Scope', rows = [], summary = {} } = reportData;
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `IITA_Cacao_Presentation_${timestamp}.ppt`;

  const summaryCards = Object.entries(summary).map(([k, v]) => `
    <div style="flex: 1; min-width: 140px; background: #FAF8F1; border-top: 4px solid #176B3A; padding: 16px; margin: 8px;">
      <div style="font-size: 11px; text-transform: uppercase; color: #8B8576; font-weight: bold;">${k}</div>
      <div style="font-size: 24px; font-weight: bold; color: #176B3A; margin-top: 6px;">${typeof v === 'number' ? v.toLocaleString() : v}</div>
    </div>
  `).join('');

  const tableRows = rows.slice(0, 8).map(r => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 6px 10px; font-family: monospace; font-size: 11px; color: #176B3A;">${r.id}</td>
      <td style="padding: 6px 10px; font-weight: 600;">${r.nur || r.name}</td>
      <td style="padding: 6px 10px;">${r.variety || 'CRIN TC-1'}</td>
      <td style="padding: 6px 10px; text-align: right; font-weight: bold;">${r.qty != null ? Number(r.qty).toLocaleString() : '—'}</td>
      <td style="padding: 6px 10px; text-align: center; color: #176B3A; font-weight: bold;">${r.status}</td>
    </tr>
  `).join('');

  const pptHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
        .slide { background: #ffffff; border: 1px solid #d1d5db; width: 850px; min-height: 500px; margin: 20px auto; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); page-break-after: always; display: flex; flex-direction: column; justify-content: space-between; }
        .slide-header { border-bottom: 3px solid #176B3A; padding-bottom: 12px; }
        .slide-title { font-size: 24px; font-weight: bold; color: #176B3A; margin: 0; }
        .slide-sub { font-size: 13px; color: #FF5A1F; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
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
          <h1 style="font-size: 34px; font-weight: bold; margin: 0 0 12px 0; color: #FAF8F1;">${title}</h1>
          <p style="font-size: 16px; color: #E5B83D; margin: 0 0 8px 0;">National Cocoa Seedling Traceability &amp; Certification Progress</p>
          <p style="font-size: 13px; color: #d1fae5; margin: 0;">Reporting Scope: ${filterLabel} &bull; Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; font-size: 11px; color: #a7f3d0; display: flex; justify-content: space-between;">
          <span>International Institute of Tropical Agriculture &bull; Ibadan, Nigeria</span>
          <span>Cacao Seed Tracker 2026</span>
        </div>
      </div>

      <!-- SLIDE 2: EXECUTIVE SUMMARY & KEY METRICS -->
      <div class="slide">
        <div class="slide-header">
          <div class="slide-sub">Performance Dashboard</div>
          <h2 class="slide-title">Executive Key Performance Indicators</h2>
        </div>
        <div style="display: flex; flex-wrap: wrap; margin: 24px 0;">
          ${summaryCards}
        </div>
        <div style="background: #FAF8F1; border-left: 4px solid #FF5A1F; padding: 14px; font-size: 12px; color: #374151;">
          <strong>Strategic Overview:</strong> Phytosanitary verification and certified seedling batches comply with IITA GRC quality assurance guidelines. Traceability protocols active across southwest cocoa producing states.
        </div>
        <div class="slide-footer">
          <span>IITA Cacao Seed Tracker Briefing</span>
          <span>Slide 2</span>
        </div>
      </div>

      <!-- SLIDE 3: DATA SNAPSHOT -->
      <div class="slide">
        <div class="slide-header">
          <div class="slide-sub">Production Snapshot</div>
          <h2 class="slide-title">Recent Certified Seedling Batches</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 20px 0;">
          <thead>
            <tr style="background: #176B3A; color: #ffffff;">
              <th style="padding: 8px 10px; text-align: left;">Reference</th>
              <th style="padding: 8px 10px; text-align: left;">Nursery</th>
              <th style="padding: 8px 10px; text-align: left;">Variety</th>
              <th style="padding: 8px 10px; text-align: right;">Quantity</th>
              <th style="padding: 8px 10px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="slide-footer">
          <span>IITA Cacao Seed Tracker Briefing</span>
          <span>Slide 3</span>
        </div>
      </div>
    </body>
    </html>
  `;

  downloadBlob(pptHtml, filename, 'application/vnd.ms-powerpoint;charset=utf-8');
}

/**
 * 4. PDF EXPORT (.pdf downloadable file & printable formatted sheet)
 */
export function exportPdf(reportData, customFilename) {
  const { title = 'Cacao Seed Tracker Management Report', filterLabel = 'All Records', rows = [], summary = {} } = reportData;
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `IITA_Cacao_Report_${timestamp}.pdf`;

  // We build a standalone print-optimized window that triggers the browser's PDF save dialog
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

  const tableRows = rows.slice(0, 100).map((r, i) => `
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
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 20px; font-size: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #176B3A; padding-bottom: 12px; margin-bottom: 16px; }
        .org-name { font-size: 11px; font-weight: 700; color: #FF5A1F; letter-spacing: 0.5px; text-transform: uppercase; }
        .report-title { font-size: 20px; font-weight: 700; color: #176B3A; margin: 4px 0; }
        .report-meta { font-size: 11px; color: #6b7280; }
        .kpi-grid { display: flex; gap: 12px; margin-bottom: 20px; }
        .kpi-box { flex: 1; background: #FAF8F1; border: 1px solid #E5E7EB; border-left: 3px solid #176B3A; padding: 10px; }
        .kpi-label { font-size: 10px; text-transform: uppercase; color: #8B8576; font-weight: 600; }
        .kpi-value { font-size: 18px; font-weight: 700; color: #176B3A; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th { background: #176B3A; color: #ffffff; text-align: left; padding: 8px 6px; font-weight: 600; font-size: 10px; text-transform: uppercase; }
        td { padding: 6px; border-bottom: 1px solid #e5e7eb; }
        tr.even { background: #ffffff; }
        tr.odd { background: #f9fafb; }
        .mono { font-family: monospace; color: #176B3A; font-weight: 600; }
        .right { text-align: right; }
        .status { font-weight: 600; }
        .status.verified, .status.active { color: #176B3A; }
        .status.pending { color: #D97706; }
        .status.rejected { color: #DC2626; }
        .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
        .actions-bar { position: sticky; top: 0; background: #FAF8F1; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #d1d5db; display: flex; gap: 10px; }
        .btn { padding: 8px 16px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; }
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
        <span style="font-size: 12px; color: #6b7280; align-self: center; margin-left: auto;">Tip: Select "Save as PDF" in the destination dropdown</span>
      </div>

      <div class="header">
        <div>
          <div class="org-name">International Institute of Tropical Agriculture (IITA)</div>
          <div class="report-title">${title}</div>
          <div class="report-meta">Genetic Resources Center (GRC) Seed Unit &bull; Scope: ${filterLabel}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; font-weight: bold; color: #176B3A;">OFFICIAL REPORT</div>
          <div class="report-meta">Generated: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      ${summary && Object.keys(summary).length > 0 ? `
        <div class="kpi-grid">
          ${summaryHtml}
        </div>
      ` : ''}

      <div style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">
        Production &amp; Inspection Data Records (${rows.length} items)
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nursery</th>
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

      <div class="footer">
        <span>Cacao Seed Tracker Platform &bull; Building 400, IITA Headquarters &bull; Cacao Seed Helpdesk: cacaoseed@iita.org &bull; 08012345678</span>
        <span>Page 1 of 1</span>
      </div>

      <script>
        // Auto trigger print dialog after page load
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
