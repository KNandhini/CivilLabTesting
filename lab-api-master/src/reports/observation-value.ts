// Entered values carry their own precision (e.g. 8831.0 or 8831.00).
// Only calculated formula results use the report's existing one-decimal format.
export function formatObservationValue(value: unknown, type?: string, missing = ''): string {
  if (value === undefined || value === null) return missing;
  const text = String(value);
  if (type === 'formula' && text.trim() !== '' && !/[^0-9.-]/.test(text)) {
    const number = Number(text);
    if (Number.isFinite(number)) return number.toFixed(1);
  }
  return text;
}