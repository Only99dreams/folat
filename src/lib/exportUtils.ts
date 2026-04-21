/**
 * Shared CSV export, PDF export, and print utilities used across the app.
 */

/** Convert an array of objects to a CSV string and trigger download. */
export function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Open a styled print window with table data — user can save as PDF from the print dialog. */
export function downloadPDF(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const title = filename.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const headerRow = headers.map((h) => `<th style="border:1px solid #ddd;padding:8px 12px;background:#1a2234;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:0.05em">${h}</th>`).join("");
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${headers
          .map((h) => `<td style="border:1px solid #eee;padding:8px 12px;font-size:12px">${row[h] ?? ""}</td>`)
          .join("")}</tr>`
    )
    .join("");
  const html = `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;margin:40px}h1{font-size:18px;margin-bottom:4px}p{color:#666;font-size:12px;margin-bottom:16px}table{border-collapse:collapse;width:100%}tr:nth-child(even){background:#f9fafb}@media print{body{margin:20px}}</style></head><body><h1>${title}</h1><p>Generated on ${new Date().toLocaleDateString("en-NG",{day:"numeric",month:"long",year:"numeric"})} at ${new Date().toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})}</p><table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }
}

/** Print the current page. */
export function printPage() {
  window.print();
}
