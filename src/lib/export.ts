export interface ReportTable {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function exportCsv(table: ReportTable): void {
  const lines = [table.columns, ...table.rows].map((row) => row.map(csvCell).join(','));
  // BOM כדי ש-Excel יזהה UTF-8 בעברית
  const blob = new Blob(['\uFEFF', lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${table.title}.csv`);
}

export async function exportExcel(table: ReportTable): Promise<void> {
  const XLSX = await import('xlsx');
  const sheet = XLSX.utils.aoa_to_sheet([table.columns, ...table.rows]);
  const workbook = XLSX.utils.book_new();
  workbook.Workbook = { Views: [{ RTL: true }] };
  XLSX.utils.book_append_sheet(workbook, sheet, 'דוח');
  XLSX.writeFile(workbook, `${table.title}.xlsx`);
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * ייצוא PDF דרך חלון הדפסה של הדפדפן: jsPDF עם פונטים מובנים לא מרנדר עברית,
 * ולכן נותנים לדפדפן לרנדר HTML RTL ולשמור כ-PDF.
 */
export function exportPdf(table: ReportTable, subtitle: string): void {
  const win = window.open('', '_blank');
  if (!win) return;
  const rowsHtml = table.rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('');
  win.document.write(`<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(table.title)}</title>
<style>
  body { font-family: "Assistant", "Heebo", Arial, sans-serif; margin: 32px; color: #111; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  p.sub { color: #666; margin: 0 0 20px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f0efec; text-align: right; }
  th, td { border: 1px solid #d5d4cd; padding: 7px 10px; }
  tr:nth-child(even) td { background: #fafaf8; }
  @media print { body { margin: 12px; } }
</style>
</head>
<body>
<h1>${escapeHtml(table.title)}</h1>
<p class="sub">${escapeHtml(subtitle)}</p>
<table>
  <thead><tr>${table.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>
<script>window.onload = function () { window.print(); };</script>
</body>
</html>`);
  win.document.close();
}

export function downloadJson(filename: string, json: string): void {
  downloadBlob(new Blob([json], { type: 'application/json' }), filename);
}
