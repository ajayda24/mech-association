/**
 * Minimal RFC 4180 CSV reader.
 *
 * Written by hand rather than pulled from a package because the input is a
 * Google Form response sheet, where free-text answers routinely contain the
 * exact characters a naive `split(",")` breaks on: commas inside a company
 * name, quotes inside a job title, and newlines inside any paragraph answer.
 * Those rows would otherwise shift every later column by one and corrupt the
 * whole record silently.
 *
 * Handles: quoted fields, escaped quotes (`""`), commas and newlines inside
 * quotes, CRLF, and a UTF-8 BOM (Google prefixes one on CSV exports).
 */
export function parseCsv(input: string): string[][] {
  // Google prefixes exported CSV with a BOM; left in place it becomes part of
  // the first header cell and that column never matches its alias.
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        // A doubled quote inside a quoted field is a literal quote.
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  // Flush whatever the last line left behind. The guard keeps a trailing
  // newline from producing a phantom empty row.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}
