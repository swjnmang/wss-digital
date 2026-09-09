import type { FWorkbook } from '@univerjs/sheets/facade';
import type { ExcelCheck, ExcelTask, ValidationResult } from './types';

function normalizeFormula(formula: string | null | undefined): string {
  if (!formula) return '';
  return formula
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/\$/g, '')
    .replace(/,/g, ';');
}

function formulaMatches(actual: string | null | undefined, expected: string | string[]): boolean {
  const actualNorm = normalizeFormula(actual);
  if (!actualNorm) return false;
  const expectedList = Array.isArray(expected) ? expected : [expected];
  return expectedList.some((exp) => normalizeFormula(exp.startsWith('=') ? exp : `=${exp}`) === actualNorm);
}

function numbersClose(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance;
}

export function gradeTask(fWorkbook: FWorkbook, task: ExcelTask): ValidationResult[] {
  const sheet = fWorkbook.getSheetByName(task.sheetName) ?? fWorkbook.getActiveSheet();
  const results: ValidationResult[] = [];

  for (const check of task.checks) {
    results.push(runCheck(sheet, check));
  }

  return results;
}

function runCheck(sheet: ReturnType<FWorkbook['getActiveSheet']>, check: ExcelCheck): ValidationResult {
  switch (check.type) {
    case 'formula': {
      const actual = sheet.getRange(check.cell).getFormula();
      const success = formulaMatches(actual, check.expected);
      return {
        label: check.label,
        success,
        message: success ? check.feedback.correct ?? '✅ Korrekt!' : check.feedback.wrong ?? '❌ Nicht korrekt.',
      };
    }

    case 'formulaRange': {
      const failedRows: number[] = [];
      for (let row = check.startRow; row <= check.endRow; row++) {
        const actual = sheet.getRange(`${check.column}${row}`).getFormula();
        if (!formulaMatches(actual, check.expected(row))) {
          failedRows.push(row);
        }
      }
      const success = failedRows.length === 0;
      return {
        label: check.label,
        success,
        message: success
          ? check.feedback.correct ?? '✅ Korrekt!'
          : `${check.feedback.wrong ?? '❌ Nicht korrekt.'} (Zeile${failedRows.length > 1 ? 'n' : ''} ${failedRows.join(', ')})`,
      };
    }

    case 'value': {
      const actual = sheet.getRange(check.cell).getValue();
      let success = false;
      if (typeof check.expected === 'number') {
        const actualNum = typeof actual === 'number' ? actual : Number(actual);
        success = !Number.isNaN(actualNum) && numbersClose(actualNum, check.expected, check.tolerance);
      } else {
        success = String(actual ?? '').trim().toUpperCase() === check.expected.trim().toUpperCase();
      }
      return {
        label: check.label,
        success,
        message: success ? check.feedback.correct ?? '✅ Korrekt!' : check.feedback.wrong ?? '❌ Nicht korrekt.',
      };
    }

    case 'bold': {
      const range = sheet.getRange(check.range);
      const styles = range.getCellStyles();
      const success = styles.some((row) => row.some((style) => style?.bold));
      return {
        label: check.label,
        success,
        message: success ? check.feedback.correct ?? '✅ Korrekt!' : check.feedback.wrong ?? '❌ Nicht korrekt.',
      };
    }

    case 'border': {
      const range = sheet.getRange(check.range);
      const styleData = range.getCellStyleData();
      const success = Boolean(styleData?.bd);
      return {
        label: check.label,
        success,
        message: success ? check.feedback.correct ?? '✅ Korrekt!' : check.feedback.wrong ?? '❌ Nicht korrekt.',
      };
    }

    case 'sortedByColumn': {
      const range = sheet.getRange(check.range);
      const values = range.getValues();
      const column = check.columnOffset;
      const columnValues = values.map((row) => row[column]);
      const comparable = check.numeric
        ? columnValues.map((v) => Number(v))
        : columnValues.map((v) => String(v ?? '').toUpperCase());
      const sorted = [...comparable].sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
      });
      if (check.direction === 'desc') sorted.reverse();
      const success = comparable.every((v, i) => v === sorted[i]);
      return {
        label: check.label,
        success,
        message: success ? check.feedback.correct ?? '✅ Korrekt!' : check.feedback.wrong ?? '❌ Nicht korrekt.',
      };
    }

    case 'filterActive': {
      const filter = sheet.getFilter();
      const success = Boolean(filter);
      return {
        label: check.label,
        success,
        message: success ? check.feedback.correct ?? '✅ Korrekt!' : check.feedback.wrong ?? '❌ Nicht korrekt.',
      };
    }

    case 'conditionalFormatExists': {
      const rules = sheet.getConditionalFormattingRules();
      const success = rules.length > 0;
      return {
        label: check.label,
        success,
        message: success ? check.feedback.correct ?? '✅ Korrekt!' : check.feedback.wrong ?? '❌ Nicht korrekt.',
      };
    }

    case 'numberFormatContains': {
      const format = sheet.getRange(check.cell).getNumberFormat();
      const success = format.toLowerCase().includes(check.expectedSubstring.toLowerCase());
      return {
        label: check.label,
        success,
        message: success ? check.feedback.correct ?? '✅ Korrekt!' : check.feedback.wrong ?? '❌ Nicht korrekt.',
      };
    }

    case 'sheetName': {
      const success = sheet.getSheetName().trim().toLowerCase() === check.expectedName.trim().toLowerCase();
      return {
        label: check.label,
        success,
        message: success ? check.feedback.correct ?? '✅ Korrekt!' : check.feedback.wrong ?? '❌ Nicht korrekt.',
      };
    }

    default: {
      const _exhaustive: never = check;
      return _exhaustive;
    }
  }
}
