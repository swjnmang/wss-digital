import { useState, useCallback } from 'react';
import { FORMULA } from 'formulajs';

export interface ValidationResult {
  success: boolean;
  message: string;
  type: 'correct' | 'error' | 'hint';
}

export interface ValidationConfig {
  type: 'formula' | 'value';
  cell: string;
  expectedFormula?: string;
  expectedValue?: number;
  feedback?: {
    correct?: string;
    wrongFormula?: string;
    wrongValue?: string;
    hint?: string;
  };
}

export const useSpreadsheet = () => {
  const [cellData, setCellData] = useState<{ [key: string]: string }>({});

  const setCellValue = useCallback((cell: string, value: string) => {
    setCellData((prev) => ({ ...prev, [cell]: value }));
  }, []);

  const getCellValue = useCallback((cell: string): string => {
    return cellData[cell] || '';
  }, [cellData]);

  const parseCellReference = (reference: string): { row: number; col: number } | null => {
    const match = reference.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    
    const col = match[1].charCodeAt(0) - 65;
    const row = parseInt(match[2]) - 1;
    return { row, col };
  };

  const parseRange = (range: string): string[] => {
    const parts = range.split(':');
    if (parts.length !== 2) return [range];

    const start = parseCellReference(parts[0].trim());
    const end = parseCellReference(parts[1].trim());

    if (!start || !end) return [range];

    const cells: string[] = [];
    for (let r = start.row; r <= end.row; r++) {
      for (let c = start.col; c <= end.col; c++) {
        const colLetter = String.fromCharCode(65 + c);
        cells.push(`${colLetter}${r + 1}`);
      }
    }
    return cells;
  };

  const extractCellReferences = (formula: string): string[] => {
    const references: string[] = [];
    const regex = /([A-Z]+\d+|\$[A-Z]+\$\d+|\$[A-Z]+\d+|[A-Z]+\$\d+)/g;
    let match;

    while ((match = regex.exec(formula)) !== null) {
      const ref = match[1];
      if (ref.includes(':')) {
        references.push(...parseRange(ref));
      } else {
        references.push(ref);
      }
    }

    return references;
  };

  const evaluateFormula = (
    formula: string,
    tableData: string[][]
  ): number | null => {
    try {
      // Remove = if present
      let expr = formula.startsWith('=') ? formula.slice(1) : formula;

      // Create a mock range object for formulajs
      const getCellReference = (reference: string): any => {
        const match = reference.match(/^(\$)?([A-Z]+)(\$)?(\d+)$/);
        if (!match) return 0;
        
        const colStr = match[2];
        const rowStr = match[4];
        
        const col = colStr.charCodeAt(0) - 65;
        const row = parseInt(rowStr) - 1;
        
        if (row < tableData.length && col < tableData[row]?.length) {
          const value = tableData[row][col];
          return isNaN(Number(value)) ? value : Number(value);
        }
        return 0;
      };

      // Replace cell references with actual values
      let evaluableExpr = expr.replace(/(\$)?([A-Z]+)(\$)?(\d+)/g, (match) => {
        const value = getCellReference(match);
        return typeof value === 'number' ? value.toString() : `"${value}"`;
      });

      // For range functions like SUMME, MIN, MAX, we need special handling
      // Replace SUMME(range) with actual sum
      evaluableExpr = evaluableExpr.replace(/SUMME\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (match, start, end) => {
        const startRef = parseCellReference(start);
        const endRef = parseCellReference(end);
        if (!startRef || !endRef) return '0';

        let sum = 0;
        for (let r = startRef.row; r <= endRef.row; r++) {
          for (let c = startRef.col; c <= endRef.col; c++) {
            if (r < tableData.length && c < tableData[r]?.length) {
              const val = Number(tableData[r][c]);
              sum += isNaN(val) ? 0 : val;
            }
          }
        }
        return sum.toString();
      });

      // Similar for MIN
      evaluableExpr = evaluableExpr.replace(/MIN\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (match, start, end) => {
        const startRef = parseCellReference(start);
        const endRef = parseCellReference(end);
        if (!startRef || !endRef) return '0';

        let values: number[] = [];
        for (let r = startRef.row; r <= endRef.row; r++) {
          for (let c = startRef.col; c <= endRef.col; c++) {
            if (r < tableData.length && c < tableData[r]?.length) {
              const val = Number(tableData[r][c]);
              if (!isNaN(val)) values.push(val);
            }
          }
        }
        return values.length > 0 ? Math.min(...values).toString() : '0';
      });

      // Similar for MAX
      evaluableExpr = evaluableExpr.replace(/MAX\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (match, start, end) => {
        const startRef = parseCellReference(start);
        const endRef = parseCellReference(end);
        if (!startRef || !endRef) return '0';

        let values: number[] = [];
        for (let r = startRef.row; r <= endRef.row; r++) {
          for (let c = startRef.col; c <= endRef.col; c++) {
            if (r < tableData.length && c < tableData[r]?.length) {
              const val = Number(tableData[r][c]);
              if (!isNaN(val)) values.push(val);
            }
          }
        }
        return values.length > 0 ? Math.max(...values).toString() : '0';
      });

      // Similar for MITTELWERT (AVERAGE)
      evaluableExpr = evaluableExpr.replace(/MITTELWERT\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (match, start, end) => {
        const startRef = parseCellReference(start);
        const endRef = parseCellReference(end);
        if (!startRef || !endRef) return '0';

        let values: number[] = [];
        for (let r = startRef.row; r <= endRef.row; r++) {
          for (let c = startRef.col; c <= endRef.col; c++) {
            if (r < tableData.length && c < tableData[r]?.length) {
              const val = Number(tableData[r][c]);
              if (!isNaN(val)) values.push(val);
            }
          }
        }
        return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toString() : '0';
      });

      console.log('Evaluated expression:', evaluableExpr);
      
      // Use Function to safely evaluate (still risky, but for educational app)
      const result = new Function(`return ${evaluableExpr}`)();
      return typeof result === 'number' ? result : null;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return null;
    }
  };

  const validateFormula = (
    config: ValidationConfig,
    tableData: string[][],
    userFormula: string
  ): ValidationResult => {
    if (config.type !== 'formula') {
      return { success: false, message: 'Unknown validation type', type: 'error' };
    }

    const userFormulaClean = userFormula.trim().toUpperCase();
    const expectedClean = config.expectedFormula?.trim().toUpperCase() || '';

    // Check if formula matches exactly
    if (userFormulaClean === expectedClean) {
      return {
        success: true,
        message: config.feedback?.correct || '✅ Formel korrekt!',
        type: 'correct',
      };
    }

    // Check if it's a formula at all
    if (!userFormulaClean.startsWith('=')) {
      return {
        success: false,
        message: config.feedback?.wrongFormula || '❌ Das sieht nicht wie eine Formel aus. Formeln beginnen mit =',
        type: 'error',
      };
    }

    // More detailed feedback
    const feedback = config.feedback?.wrongFormula || '❌ Die Formel ist nicht ganz richtig.';
    return {
      success: false,
      message: feedback,
      type: 'error',
    };
  };

  return {
    cellData,
    setCellValue,
    getCellValue,
    validateFormula,
    evaluateFormula,
    extractCellReferences,
    parseRange,
  };
};
