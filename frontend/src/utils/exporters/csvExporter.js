export function normalizeValue(value) {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCSV({ headers, rows }) {
  const head = headers.join(",") + "\n";
  const body = rows
    .map((row) => headers.map((h) => normalizeValue(row[h])).join(","))
    .join("\n");
  return head + body;
}

export function exportToCSV({ filename, headers, rows }) {
  const csv = buildCSV({ headers, rows });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "export.csv";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default { normalizeValue, buildCSV, exportToCSV };
