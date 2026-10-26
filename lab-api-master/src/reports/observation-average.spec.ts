import { calculateObservationAverageRow, calculateEntryPageAverageRow } from './observation-average';

describe('Test Report Observation Table average row', () => {
  const headers = [
    { id: 'slNo' }, { id: 'identification' }, { id: 'weight' },
    { id: 'length' }, { id: 'strength' },
  ];
  const rows = [
    { slNo: 1, identification: '101', weight: '100', length: '20', strength: '30' },
    { slNo: 2, identification: '102', weight: '200', length: '40', strength: '34' },
  ];
  const schema = {
    IncludeObservationEntryAverageRow: true,
    ObservationEntrySchema: { columns: [
      { id: 'identification', averageCalculationRequired: false },
      { id: 'weight', averageCalculationRequired: false },
      { id: 'length' },
      { id: 'strength', averageCalculationRequired: true },
    ] },
  };
  it('averages only Avg Calc columns, leaving unchecked numeric columns blank', () => {
    expect(calculateObservationAverageRow(headers, rows, schema)).toEqual(['Average', '', '', '', '32.0']);
  });
  it('uses schema column IDs, regardless of display order or stale header flags', () => {
    expect(calculateObservationAverageRow([
      { id: 'slNo' }, { id: 'strength' },
      { id: 'weight', averageCalculationRequired: true } as { id: string },
    ], rows, schema)).toEqual(['Average', '32.0', '']);
  });
  it('honors saving a newly enabled column', () => {
    const changed = { ...schema, ObservationEntrySchema: { columns: [
      { id: 'weight', averageCalculationRequired: true },
      { id: 'strength', averageCalculationRequired: false },
    ] } };
    expect(calculateObservationAverageRow(headers, rows, changed)).toEqual(['Average', '', '150.0', '', '']);
  });
  it('does not create a row when the overall average-row option is off', () => {
    expect(calculateObservationAverageRow(headers, rows, { ...schema, IncludeObservationEntryAverageRow: false })).toBeUndefined();
  });
  it('leaves all averages blank when no column is enabled', () => {
    expect(calculateObservationAverageRow(headers, rows, { IncludeObservationEntryAverageRow: true })).toEqual(['Average', '', '', '', '']);
  });
  it('ignores blank and nonnumeric entries without counting them as zero', () => {
    const values = [30, '', '  ', null, undefined, 'NA', '34', Infinity].map(strength => ({ strength }));
    expect(calculateObservationAverageRow(headers, values, schema)).toEqual(['Average', '', '', '', '32.0']);
  });
  it('keeps the existing rounding rule', () => {
    expect(calculateObservationAverageRow(headers, [{ strength: '30.1' }], schema)?.[4]).toBe('30.5');
  });
});
describe('Observation Entry page schema-based averages', () => {
  const fields = ['weight', 'length', 'strength'];
  const rows = [['1', '8831.0', '150', '35'], ['2', '8000.0', '150', '34']];
  const report = (enabled = true) => ({ TestReportSchema: {
    productId: 'p1', IncludeObservationEntryAverageRow: enabled,
    ObservationEntrySchema: {
      columns: [{ id: '1' }, { id: '2' }, { id: 'weight-col', averageCalculationRequired: false }, { id: 'strength-col', averageCalculationRequired: true }],
      rows: [{ values: { '1': 't1', '2': 's1', 'weight-col': ['weight'], 'strength-col': ['strength'] } }],
    },
  } });
  it('averages only enabled mapped fields, not all numeric columns', () => {
    expect(calculateEntryPageAverageRow(fields, rows, [report()], 't1', 's1', 'p1')).toEqual(['Average', '', '', '34.5']);
  });
  it('does not show averages when the matching report disables its average row', () => {
    expect(calculateEntryPageAverageRow(fields, rows, [report(false)], 't1', 's1', 'p1')).toBeUndefined();
  });
  it.each([['other', 's1', 'p1'], ['t1', 'other', 'p1'], ['t1', 's1', 'other']])('ignores unrelated test/schema/product settings', (test, schema, product) => {
    expect(calculateEntryPageAverageRow(fields, rows, [report()], test, schema, product)).toBeUndefined();
  });
  it('supports single-field string mappings', () => {
    const config: any = report();
    config.TestReportSchema.ObservationEntrySchema.rows[0].values['strength-col'] = 'strength';
    expect(calculateEntryPageAverageRow(fields, rows, [config], 't1', 's1', 'p1')).toEqual(['Average', '', '', '34.5']);
  });
});