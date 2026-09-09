export type CellAlign = 'left' | 'center';

export interface ExcelCellSeed {
  cell: string;
  value?: string | number;
  formula?: string;
  bold?: boolean;
  border?: boolean;
  background?: string;
  numberFormat?: string;
  align?: CellAlign;
}

export interface CheckFeedback {
  correct?: string;
  wrong?: string;
  hint?: string;
}

interface BaseCheck {
  label: string;
  feedback: CheckFeedback;
}

export interface FormulaCheck extends BaseCheck {
  type: 'formula';
  cell: string;
  expected: string | string[];
}

export interface FormulaRangeCheck extends BaseCheck {
  type: 'formulaRange';
  column: string;
  startRow: number;
  endRow: number;
  expected: (row: number) => string | string[];
}

export interface ValueCheck extends BaseCheck {
  type: 'value';
  cell: string;
  expected: number | string;
  tolerance?: number;
}

export interface BoldCheck extends BaseCheck {
  type: 'bold';
  range: string;
}

export interface BorderCheck extends BaseCheck {
  type: 'border';
  range: string;
}

export interface SortedByColumnCheck extends BaseCheck {
  type: 'sortedByColumn';
  range: string;
  columnOffset: number;
  direction: 'asc' | 'desc';
  numeric?: boolean;
}

export interface FilterActiveCheck extends BaseCheck {
  type: 'filterActive';
}

export interface ConditionalFormatExistsCheck extends BaseCheck {
  type: 'conditionalFormatExists';
}

export interface NumberFormatContainsCheck extends BaseCheck {
  type: 'numberFormatContains';
  cell: string;
  expectedSubstring: string;
}

export interface SheetNameCheck extends BaseCheck {
  type: 'sheetName';
  expectedName: string;
}

export type ExcelCheck =
  | FormulaCheck
  | FormulaRangeCheck
  | ValueCheck
  | BoldCheck
  | BorderCheck
  | SortedByColumnCheck
  | FilterActiveCheck
  | ConditionalFormatExistsCheck
  | NumberFormatContainsCheck
  | SheetNameCheck;

export interface ExcelTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  instruction: string[];
  hint?: string;
  sheetName: string;
  seed: ExcelCellSeed[];
  columnWidths?: Record<string, number>;
  checks: ExcelCheck[];
}

export interface ValidationResult {
  label: string;
  success: boolean;
  message: string;
}
