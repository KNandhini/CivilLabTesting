interface ObservationAverageHeader {
  id: string;
}
interface ObservationAverageSchema {
  IncludeObservationEntryAverageRow?: boolean;
  ObservationEntrySchema?: {
    columns?: { id: string; averageCalculationRequired?: boolean }[];
  };
}

// The saved Observation Table column is authoritative; numeric content alone
// must never opt a column into averaging.
export function calculateObservationAverageRow(
  headers: ObservationAverageHeader[],
  rows: Record<string, unknown>[],
  schema: ObservationAverageSchema | undefined,
): string[] | undefined {
  if (schema?.IncludeObservationEntryAverageRow !== true) return undefined;
  const enabledIds = new Set(
    (schema.ObservationEntrySchema?.columns || [])
      .filter(column => column.averageCalculationRequired === true)
      .map(column => column.id),
  );
  return headers.map((header, index) => {
    if (index === 0) return 'Average';
    if (!enabledIds.has(header.id)) return '';
    let sum = 0;
    let count = 0;
    for (const row of rows) {
      const value = row[header.id];
      if (typeof value !== 'string' && typeof value !== 'number') continue;
      const text = String(value).trim();
      if (!text || /[^0-9.-]/.test(text)) continue;
      const number = Number(text);
      if (!Number.isFinite(number)) continue;
      sum += number;
      count++;
    }
    if (!count) return '';
    // Preserve the existing report rounding rule.
    const average = sum / count;
    const floor = Math.floor(average);
    const decimal = average - floor;
    const rounded = decimal < 0.01 ? floor : decimal < 0.75 ? floor + 0.5 : floor + 1;
    return rounded.toFixed(1);
  });
}
// Observation Entry pages display original result fields rather than report
// column IDs. Resolve the matching schema row to map Avg Calc back to fields.
export function calculateEntryPageAverageRow(
  fields: string[], rows: string[][], reportSchemas: any[],
  testId: string, schemaId: string, productId: string,
): string[] | undefined {
  const enabledFields = new Set<string>();
  let includeAverage = false;
  for (const report of reportSchemas) {
    const config = report.TestReportSchema;
    if (config?.IncludeObservationEntryAverageRow !== true || (config.productId && config.productId !== productId)) continue;
    const table = config.ObservationEntrySchema;
    if (!Array.isArray(table?.columns) || !Array.isArray(table?.rows)) continue;
    for (const row of table.rows) {
      const values = row.values || {};
      const rowTest = values[table.columns[0]?.id] ?? values['1'] ?? values['obs-1'];
      const rowSchema = values[table.columns[1]?.id] ?? values['2'] ?? values['obs-2'];
      if (rowTest !== testId || rowSchema !== schemaId) continue;
      includeAverage = true;
      for (const column of table.columns.slice(2)) {
        if (column.averageCalculationRequired !== true) continue;
        const mapped = values[column.id];
        const field = Array.isArray(mapped) ? (mapped.length === 1 ? mapped[0] : undefined) : mapped;
        if (typeof field === 'string' && fields.includes(field)) enabledFields.add(field);
      }
    }
  }
  if (!includeAverage) return undefined;
  const headers = [{ id: 'sampleId' }, ...fields.map(id => ({ id }))];
  const values = rows.map(row => Object.fromEntries(headers.map((header, index) => [header.id, row[index]])));
  return calculateObservationAverageRow(headers, values, {
    IncludeObservationEntryAverageRow: true,
    ObservationEntrySchema: { columns: [...enabledFields].map(id => ({ id, averageCalculationRequired: true })) },
  });
}