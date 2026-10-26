import { formatObservationValue } from './observation-value';

describe('Entered observation number formatting', () => {
  it.each(['8831.0', '8831.00', '8831.5', '8831', '0', '0.0', '0.00', '-12.00', '001.50', '1e3'])('preserves entered value %s exactly', value => {
    expect(formatObservationValue(value, 'number')).toBe(value);
  });
  it('preserves text fields', () => expect(formatObservationValue('Satisfactory', 'text')).toBe('Satisfactory'));
  it('keeps calculated formula formatting', () => expect(formatObservationValue(34.567, 'formula')).toBe('34.6'));
  it('keeps numeric zero visible', () => expect(formatObservationValue(0, 'number')).toBe('0'));
  it('supports each table missing-value marker', () => {
    expect(formatObservationValue(null)).toBe('');
    expect(formatObservationValue(undefined, 'number', 'nil')).toBe('nil');
  });
});