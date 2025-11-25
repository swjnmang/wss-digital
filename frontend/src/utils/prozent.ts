export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundToPointFive(value: number): number {
  return Math.round(value * 2) / 2;
}

export function withinTolerance(value: number, expected: number, tolerance = 0.01): boolean {
  return Math.abs(value - expected) <= tolerance;
}

export function formatCurrency(value: number | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return value.toFixed(2);
}

export function formatPercent(value: number | undefined, digits = 1): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return value.toFixed(digits);
}
