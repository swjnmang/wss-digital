import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface SpreadsheetProps {
  task: any;
}

const FORMULAS = ['SUMME', 'MIN', 'MAX', 'MITTELWERT', 'WENN', 'ZÄHLENWENN', 'VERKETTUNG'];

interface Cell {
  value: string;
  formula?: string;
}

export const Spreadsheet: React.FC<SpreadsheetProps> = ({ task }) => {
  const [cells, setCells] = useState<{ [key: string]: Cell }>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [formulaInput, setFormulaInput] = useState('');
  const [clickMode, setClickMode] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [firstClickInRange, setFirstClickInRange] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
  const [copyHandle, setCopyHandle] = useState<string | null>(null);

  // Initialize cells
  useEffect(() => {
    const initialCells: { [key: string]: Cell } = {};

    if (task?.data?.rows) {
      task.data.rows.forEach((row: string[], rowIdx: number) => {
        row.forEach((cellValue: string, colIdx: number) => {
          const colLetter = String.fromCharCode(65 + colIdx);
          const cellKey = `${colLetter}${rowIdx + 2}`;
          initialCells[cellKey] = { value: cellValue || '' };
        });
      });
    }

    setCells(initialCells);
  }, [task]);

  // Calculate formula
  const calculateFormula = (formula: string): string | number => {
    try {
      if (!formula.startsWith('=')) return formula;

      let expr = formula.slice(1).toUpperCase();

      // Replace SUMME(A2:A5) with actual sum
      expr = expr.replace(/SUMME\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (match, col1, row1, col2, row2) => {
        const c1 = col1.charCodeAt(0) - 65;
        const r1 = parseInt(row1);
        const c2 = col2.charCodeAt(0) - 65;
        const r2 = parseInt(row2);

        let sum = 0;
        for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
          for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
            const cellLetter = String.fromCharCode(65 + c);
            const cellKey = `${cellLetter}${r}`;
            const val = parseFloat(cells[cellKey]?.value || '0');
            if (!isNaN(val)) sum += val;
          }
        }
        return sum.toString();
      });

      expr = expr.replace(/MIN\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (match, col1, row1, col2, row2) => {
        const c1 = col1.charCodeAt(0) - 65;
        const r1 = parseInt(row1);
        const c2 = col2.charCodeAt(0) - 65;
        const r2 = parseInt(row2);

        let values: number[] = [];
        for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
          for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
            const cellLetter = String.fromCharCode(65 + c);
            const cellKey = `${cellLetter}${r}`;
            const val = parseFloat(cells[cellKey]?.value || '0');
            if (!isNaN(val)) values.push(val);
          }
        }
        return values.length > 0 ? Math.min(...values).toString() : '0';
      });

      expr = expr.replace(/MAX\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (match, col1, row1, col2, row2) => {
        const c1 = col1.charCodeAt(0) - 65;
        const r1 = parseInt(row1);
        const c2 = col2.charCodeAt(0) - 65;
        const r2 = parseInt(row2);

        let values: number[] = [];
        for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
          for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
            const cellLetter = String.fromCharCode(65 + c);
            const cellKey = `${cellLetter}${r}`;
            const val = parseFloat(cells[cellKey]?.value || '0');
            if (!isNaN(val)) values.push(val);
          }
        }
        return values.length > 0 ? Math.max(...values).toString() : '0';
      });

      expr = expr.replace(/MITTELWERT\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (match, col1, row1, col2, row2) => {
        const c1 = col1.charCodeAt(0) - 65;
        const r1 = parseInt(row1);
        const c2 = col2.charCodeAt(0) - 65;
        const r2 = parseInt(row2);

        let values: number[] = [];
        for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
          for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
            const cellLetter = String.fromCharCode(65 + c);
            const cellKey = `${cellLetter}${r}`;
            const val = parseFloat(cells[cellKey]?.value || '0');
            if (!isNaN(val)) values.push(val);
          }
        }
        return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '0';
      });

      const result = eval(expr);
      return typeof result === 'number' ? result.toFixed(2) : result;
    } catch (error) {
      return 'Fehler';
    }
  };

  const handleFormulaInputChange = (value: string) => {
    setFormulaInput(value);

    // Autocomplete
    if (value.includes('=')) {
      const afterEquals = value.split('=')[1]?.toUpperCase() || '';
      const matches = FORMULAS.filter((f) => f.startsWith(afterEquals));
      setSuggestions(matches);

      // Auto-activate click mode when typing formula with opening parenthesis
      if (value.endsWith('(')) {
        setClickMode(true);
        setFirstClickInRange(null);
      }
    } else {
      setSuggestions([]);
      setClickMode(false);
    }
  };

  const applySuggestion = (formula: string) => {
    setFormulaInput(`=${formula}(`);
    setSuggestions([]);
    setClickMode(true);
  };

  const handleCellClick = (cellKey: string) => {
    if (clickMode && formulaInput.includes('=')) {
      // In click mode - add cell reference to formula
      if (!firstClickInRange) {
        setFirstClickInRange(cellKey);
        setFormulaInput((prev) => prev + cellKey);
      } else {
        // Create range if second click
        setFormulaInput((prev) => prev + ':' + cellKey);
        setFirstClickInRange(null);
        setClickMode(false);
      }
    } else {
      // Normal cell selection or multi-select
      setSelectedCell(cellKey);
      setSelectedCells(new Set([cellKey]));
      const cell = cells[cellKey];
      if (cell?.formula) {
        setFormulaInput(cell.formula);
      } else {
        setFormulaInput('');
      }
      setEditingCell(null);
    }
  };

  // Multi-Select mit Drag
  const handleMouseDown = (cellKey: string) => {
    setDraggingFrom(cellKey);
    setSelectedCell(cellKey);
    setSelectedCells(new Set([cellKey]));
  };

  const handleMouseEnter = (cellKey: string) => {
    if (draggingFrom) {
      // Berechne alle Zellen zwischen draggingFrom und cellKey
      const [fromCol, fromRow] = [
        draggingFrom.charCodeAt(0) - 65,
        parseInt(draggingFrom.slice(1)),
      ];
      const [toCol, toRow] = [cellKey.charCodeAt(0) - 65, parseInt(cellKey.slice(1))];

      const newSelected = new Set<string>();
      const minCol = Math.min(fromCol, toCol);
      const maxCol = Math.max(fromCol, toCol);
      const minRow = Math.min(fromRow, toRow);
      const maxRow = Math.max(fromRow, toRow);

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const col = String.fromCharCode(65 + c);
          newSelected.add(`${col}${r}`);
        }
      }
      setSelectedCells(newSelected);
    }
  };

  const handleMouseUp = () => {
    if (draggingFrom && clickMode && selectedCells.size > 0) {
      // In Click-Mode: Range zur Formel hinzufügen
      const sortedCells = Array.from(selectedCells).sort();
      if (sortedCells.length > 0) {
        const firstCell = sortedCells[0];
        const lastCell = sortedCells[sortedCells.length - 1];
        
        setFormulaInput((prev) => {
          // Entferne das abschließende "(" oder ";" wenn nötig
          let updated = prev.endsWith('(') || prev.endsWith(';') ? prev : prev + ':';
          if (updated.endsWith('(')) {
            return updated + firstCell + ':' + lastCell;
          }
          return updated + firstCell + ':' + lastCell;
        });
        
        setClickMode(false);
        setSuggestions([]);
      }
    }
    setDraggingFrom(null);
  };

  const applyFormula = () => {
    if (selectedCell && formulaInput) {
      const newCells = { ...cells };
      newCells[selectedCell] = {
        value: calculateFormula(formulaInput).toString(),
        formula: formulaInput,
      };
      setCells(newCells);
      setFormulaInput('');
      setClickMode(false);
      setFirstClickInRange(null);
    }
  };

  // In Zelle direkt editieren
  const startEditCell = (cellKey: string) => {
    setEditingCell(cellKey);
    setEditValue(cells[cellKey]?.value || '');
    setSelectedCell(cellKey);
  };

  const finishEditCell = (cellKey: string) => {
    const newCells = { ...cells };
    if (editValue.startsWith('=')) {
      newCells[cellKey] = {
        value: calculateFormula(editValue).toString(),
        formula: editValue,
      };
    } else {
      newCells[cellKey] = { value: editValue };
    }
    setCells(newCells);
    setEditingCell(null);
    setEditValue('');
    setSelectedCell(cellKey);
  };

  // Copy Handle - Ziehen zum Duplizieren/Serie erstellen
  const handleCopyHandleDrag = (fromCell: string, toCell: string) => {
    const sourceCell = cells[fromCell];
    if (!sourceCell) return;

    const [fromCol, fromRow] = [fromCell.charCodeAt(0) - 65, parseInt(fromCell.slice(1))];
    const [toCol, toRow] = [toCell.charCodeAt(0) - 65, parseInt(toCell.slice(1))];

    const newCells = { ...cells };
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    // Kopiere Formel oder Wert
    for (let r = Math.min(fromRow, toRow); r <= Math.max(fromRow, toRow); r++) {
      for (let c = Math.min(fromCol, toCol); c <= Math.max(fromCol, toCol); c++) {
        const cellKey = `${String.fromCharCode(65 + c)}${r}`;

        if (sourceCell.formula) {
          // Relative Referenzen anpassen
          let adjustedFormula = sourceCell.formula;
          const rowOffset = r - fromRow;
          const colOffset = c - fromCol;

          // Einfache Anpassung für relative Referenzen
          adjustedFormula = adjustedFormula.replace(
            /([A-Z])(\d+)/g,
            (match, col, row) => {
              const newRow = parseInt(row) + rowOffset;
              const newCol = String.fromCharCode(col.charCodeAt(0) + colOffset);
              return `${newCol}${newRow}`;
            }
          );

          newCells[cellKey] = {
            value: calculateFormula(adjustedFormula).toString(),
            formula: adjustedFormula,
          };
        } else {
          newCells[cellKey] = { value: sourceCell.value };
        }
      }
    }

    setCells(newCells);
    setCopyHandle(null);
  };

  const numCols = Math.max(...(Object.keys(cells).map((k) => k.charCodeAt(0) - 65) || [0]), 2);
  const numRows = Math.max(...(Object.keys(cells).map((k) => parseInt(k.slice(1))) || [2]));

  return (
    <div className="space-y-4">
      {/* Formel-Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} className="text-blue-600" />
          <label className="font-bold text-gray-800">Formel-Eingabe</label>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={formulaInput}
              onChange={(e) => handleFormulaInputChange(e.target.value)}
              placeholder="=SUMME(A2:A5) oder =MIN() ..."
              autoFocus
              className="w-full px-4 py-3 border-2 border-blue-400 rounded font-mono text-sm bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />

            {/* Autocomplete */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-blue-200 rounded mt-1 z-20 shadow-lg">
                {suggestions.map((formula) => (
                  <button
                    key={formula}
                    onClick={() => applySuggestion(formula)}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100 text-sm text-gray-700 font-mono border-b border-gray-100 last:border-b-0"
                  >
                    ={formula}(...)
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Click Mode */}
          {clickMode && (
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded p-3 text-sm text-yellow-900 font-bold">
              🖱️ Click-Modus: Klicke auf Zellen um Zellbezüge hinzuzufügen!
              {firstClickInRange && ` (Von: ${firstClickInRange})`}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={applyFormula}
              disabled={!selectedCell || !formulaInput}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-bold text-sm transition-colors"
            >
              ✓ Formel übernehmen
            </button>
            <button
              onClick={() => {
                setFormulaInput('');
                setClickMode(false);
                setFirstClickInRange(null);
                setSuggestions([]);
              }}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded font-semibold text-sm"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet */}
      <div 
        className="overflow-x-auto border-2 border-gray-400 rounded-lg bg-white"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="bg-gray-300 border border-gray-400 w-12 h-8 text-center font-bold text-gray-800"></th>
              {Array.from({ length: numCols + 3 }).map((_, i) => (
                <th
                  key={`col-${i}`}
                  className="bg-gray-300 border border-gray-400 w-24 h-8 text-center font-bold text-gray-800"
                >
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numRows + 4 }).map((_, rowIdx) => (
              <tr key={`row-${rowIdx}`}>
                <td className="bg-gray-300 border border-gray-400 w-12 h-8 text-center font-bold text-gray-800">
                  {rowIdx + 1}
                </td>
                {Array.from({ length: numCols + 3 }).map((_, colIdx) => {
                  const colLetter = String.fromCharCode(65 + colIdx);
                  const cellKey = `${colLetter}${rowIdx + 1}`;
                  const cell = cells[cellKey];
                  const isSelected = selectedCell === cellKey;
                  const isInSelection = selectedCells.has(cellKey);
                  const displayValue = cell?.formula
                    ? calculateFormula(cell.formula)
                    : cell?.value || '';
                  const isEditing = editingCell === cellKey;

                  return (
                    <td
                      key={cellKey}
                      className={`border border-gray-300 w-24 h-8 p-0 relative cursor-cell font-mono text-xs transition-colors ${
                        isInSelection ? 'bg-blue-200 border-2 border-blue-500' : 
                        isSelected ? 'bg-blue-300 border-2 border-blue-600' : 
                        'bg-white hover:bg-gray-50'
                      } ${clickMode ? 'hover:bg-yellow-200' : ''}`}
                      onMouseDown={() => handleMouseDown(cellKey)}
                      onMouseEnter={() => handleMouseEnter(cellKey)}
                      onDoubleClick={() => startEditCell(cellKey)}
                      onClick={() => !editingCell && handleCellClick(cellKey)}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => finishEditCell(cellKey)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') finishEditCell(cellKey);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="w-full h-full px-1 outline-none border-none bg-white font-mono text-xs"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center px-1 overflow-hidden text-ellipsis">
                          {displayValue}
                        </div>
                      )}

                      {/* Copy Handle (kleine Box rechts unten) */}
                      {isSelected && !isEditing && (
                        <div
                          draggable
                          onDragStart={(e) => {
                            setCopyHandle(cellKey);
                          }}
                          onDragEnd={() => setCopyHandle(null)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (copyHandle && copyHandle !== cellKey) {
                              handleCopyHandleDrag(copyHandle, cellKey);
                            }
                          }}
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-500 border border-blue-700 cursor-move rounded-tl hover:bg-blue-600 transition-colors"
                          title="Ziehen zum Kopieren/Serie erstellen"
                        ></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info */}
      {selectedCell && (
        <div className="p-3 bg-green-50 border-2 border-green-300 rounded text-sm font-mono">
          <strong>📍 Zelle:</strong> {selectedCell} | 
          <strong> 📝 Wert:</strong> {cells[selectedCell]?.value || '(leer)'} | 
          <strong> 🧮 Formel:</strong> {cells[selectedCell]?.formula || '(keine)'}
        </div>
      )}
    </div>
  );
};
