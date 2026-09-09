import type { FWorkbook } from '@univerjs/sheets/facade';
import { BorderStyleTypes, BorderType } from '@univerjs/core';
import type { ExcelTask } from './types';

export function applyTaskToWorkbook(fWorkbook: FWorkbook, task: ExcelTask) {
  const sheet = fWorkbook.getActiveSheet();
  sheet.setName(task.sheetName);

  for (const seed of task.seed) {
    const range = sheet.getRange(seed.cell);

    if (seed.formula) {
      range.setFormula(seed.formula.startsWith('=') ? seed.formula : `=${seed.formula}`);
    } else if (seed.value !== undefined) {
      range.setValue(seed.value);
    }

    if (seed.bold) {
      range.setFontWeight('bold');
    }
    if (seed.border) {
      range.setBorder(BorderType.ALL, BorderStyleTypes.THIN, '#000000');
    }
    if (seed.background) {
      range.setBackground(seed.background);
    }
    if (seed.numberFormat) {
      range.setNumberFormat(seed.numberFormat);
    }
    if (seed.align) {
      range.setHorizontalAlignment(seed.align);
    }
  }

  if (task.columnWidths) {
    for (const [col, width] of Object.entries(task.columnWidths)) {
      sheet.setColumnWidth(columnLetterToIndex(col), width);
    }
  }
}

export function columnLetterToIndex(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result - 1;
}
