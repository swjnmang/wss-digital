export const UNIT_OPTIONS = ['m', 'm²', '°', '%'];

export const DEFAULT_TOLERANCE_PERCENT = 3;

export function isWithinTolerance(value: number, correctAnswer: number, tolerancePercent = DEFAULT_TOLERANCE_PERCENT): boolean {
    const tolerance = correctAnswer * (tolerancePercent / 100);
    return Math.abs(value - correctAnswer) <= tolerance;
}
