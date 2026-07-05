const DELIMITER = ";";
const BOM = "\ufeff";

function escapeField(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(DELIMITER) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCSV(columns: string[], rows: unknown[][]): string {
  const header = columns.map(escapeField).join(DELIMITER);
  const dataLines = rows.map((row) => row.map(escapeField).join(DELIMITER));
  return `${BOM}sep=${DELIMITER}\n${header}\n${dataLines.join("\n")}`;
}
