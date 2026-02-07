import React, { useState } from 'react';

// ============================================================================
// INTELLIGENTE VALIDIERUNGSFUNKTION FÜR QUADRATISCHE GLEICHUNGEN
// ============================================================================

/**
 * Löst eine quadratische Gleichung ax² + bx + c = 0 auf und gibt Lösungen zurück
 */
function solveQuadraticEquation(equation: string): number[] {
  try {
    let eq = equation.replace(/\s+/g, '').toLowerCase();
    const [left, right] = eq.split('=');
    if (!left || !right) return [];

    const parseExpression = (expr: string) => {
      let a = 0, b = 0, c = 0;
      expr = expr.replace(/^[+]/, '');
      const terms = expr.match(/[+-]?[^+-]+/g) || [];

      for (const term of terms) {
        const trimmed = term.trim();
        if (!trimmed) continue;

        if (trimmed.includes('x²') || trimmed.includes('x^2')) {
          const match = trimmed.match(/([+-]?\d*\.?\d*)\*?x/);
          if (match) {
            let coeff = match[1];
            if (coeff === '' || coeff === '+') coeff = '1';
            if (coeff === '-') coeff = '-1';
            a += parseFloat(coeff);
          }
        } else if (trimmed.includes('x')) {
          const match = trimmed.match(/([+-]?\d*\.?\d*)\*?x/);
          if (match) {
            let coeff = match[1];
            if (coeff === '' || coeff === '+') coeff = '1';
            if (coeff === '-') coeff = '-1';
            b += parseFloat(coeff);
          }
        } else {
          c += parseFloat(trimmed);
        }
      }
      return { a, b, c };
    };

    const leftSide = parseExpression(left);
    const rightSide = parseExpression(right);

    const coeff_a = leftSide.a - rightSide.a;
    const coeff_b = leftSide.b - rightSide.b;
    const coeff_c = leftSide.c - rightSide.c;

    if (coeff_a === 0) return [];

    const discriminant = coeff_b * coeff_b - 4 * coeff_a * coeff_c;
    if (discriminant < 0) return [];

    const sqrt_disc = Math.sqrt(discriminant);
    const x1 = (-coeff_b + sqrt_disc) / (2 * coeff_a);
    const x2 = (-coeff_b - sqrt_disc) / (2 * coeff_a);

    const solutions = [];
    if (Math.abs(x1 - Math.round(x1)) < 0.0001) solutions.push(Math.round(x1));
    if (Math.abs(x2 - Math.round(x2)) < 0.0001 && Math.abs(x1 - x2) > 0.0001) solutions.push(Math.round(x2));

    return solutions.sort((a, b) => a - b);
  } catch {
    return [];
  }
}

// ============================================================================
// AUFGABENDATENBANK: QUADRATISCHE GLEICHUNGEN
// ============================================================================

interface Aufgabe {
  id: string;
  aufgabe: string;
  loesungen: number[];
  rechenweg: string[];
}

const aufgaben: Aufgabe[] = [
  // ==================== EINFACH (e1-e52): Reinquadratische & einfache Formen ====================
  
  // Reinquadratische Gleichungen (x² = a)
  { id: 'e1', aufgabe: 'x² = 9', loesungen: [3, -3],
    rechenweg: ['x² = 9  | √ ziehen', 'x = ±3', 'L = {-3; 3}'] },
  { id: 'e2', aufgabe: 'x² = 16', loesungen: [4, -4],
    rechenweg: ['x² = 16  | √ ziehen', 'x = ±4', 'L = {-4; 4}'] },
  { id: 'e3', aufgabe: 'x² = 25', loesungen: [5, -5],
    rechenweg: ['x² = 25  | √ ziehen', 'x = ±5', 'L = {-5; 5}'] },
  { id: 'e4', aufgabe: 'x² = 36', loesungen: [6, -6],
    rechenweg: ['x² = 36  | √ ziehen', 'x = ±6', 'L = {-6; 6}'] },
  { id: 'e5', aufgabe: 'x² = 49', loesungen: [7, -7],
    rechenweg: ['x² = 49  | √ ziehen', 'x = ±7', 'L = {-7; 7}'] },
  
  // Reinquadratische mit Koeffizient (ax² = b)
  { id: 'e6', aufgabe: '2x² = 50', loesungen: [5, -5],
    rechenweg: ['2x² = 50  | : 2', 'x² = 25  | √ ziehen', 'x = ±5', 'L = {-5; 5}'] },
  { id: 'e7', aufgabe: '3x² = 75', loesungen: [5, -5],
    rechenweg: ['3x² = 75  | : 3', 'x² = 25  | √ ziehen', 'x = ±5', 'L = {-5; 5}'] },
  { id: 'e8', aufgabe: '4x² = 64', loesungen: [4, -4],
    rechenweg: ['4x² = 64  | : 4', 'x² = 16  | √ ziehen', 'x = ±4', 'L = {-4; 4}'] },
  { id: 'e9', aufgabe: '5x² = 45', loesungen: [3, -3],
    rechenweg: ['5x² = 45  | : 5', 'x² = 9  | √ ziehen', 'x = ±3', 'L = {-3; 3}'] },
  { id: 'e10', aufgabe: '2x² = 18', loesungen: [3, -3],
    rechenweg: ['2x² = 18  | : 2', 'x² = 9  | √ ziehen', 'x = ±3', 'L = {-3; 3}'] },

  // Mit konstanter Verschiebung (x² + c = d)
  { id: 'e11', aufgabe: 'x² + 4 = 0', loesungen: [],
    rechenweg: ['x² + 4 = 0  | - 4', 'x² = -4  | √ ziehen nicht möglich', 'L = ∅'] },
  { id: 'e12', aufgabe: 'x² + 3 = 0', loesungen: [],
    rechenweg: ['x² + 3 = 0  | - 3', 'x² = -3  | keine reelle Lösung', 'L = ∅'] },
  { id: 'e13', aufgabe: 'x² - 4 = 0', loesungen: [2, -2],
    rechenweg: ['x² - 4 = 0  | + 4', 'x² = 4  | √ ziehen', 'x = ±2', 'L = {-2; 2}'] },
  { id: 'e14', aufgabe: 'x² - 9 = 0', loesungen: [3, -3],
    rechenweg: ['x² - 9 = 0  | + 9', 'x² = 9  | √ ziehen', 'x = ±3', 'L = {-3; 3}'] },
  { id: 'e15', aufgabe: 'x² - 16 = 0', loesungen: [4, -4],
    rechenweg: ['x² - 16 = 0  | + 16', 'x² = 16  | √ ziehen', 'x = ±4', 'L = {-4; 4}'] },
  { id: 'e16', aufgabe: '2x² - 8 = 0', loesungen: [2, -2],
    rechenweg: ['2x² - 8 = 0  | + 8', '2x² = 8  | : 2', 'x² = 4  | √ ziehen', 'x = ±2', 'L = {-2; 2}'] },
  { id: 'e17', aufgabe: '3x² - 27 = 0', loesungen: [3, -3],
    rechenweg: ['3x² - 27 = 0  | + 27', '3x² = 27  | : 3', 'x² = 9  | √ ziehen', 'x = ±3', 'L = {-3; 3}'] },
  { id: 'e18', aufgabe: '4x² - 100 = 0', loesungen: [5, -5],
    rechenweg: ['4x² - 100 = 0  | + 100', '4x² = 100  | : 4', 'x² = 25  | √ ziehen', 'x = ±5', 'L = {-5; 5}'] },
  { id: 'e19', aufgabe: 'x² - 25 = 0', loesungen: [5, -5],
    rechenweg: ['x² - 25 = 0  | + 25', 'x² = 25  | √ ziehen', 'x = ±5', 'L = {-5; 5}'] },
  { id: 'e20', aufgabe: '2x² - 32 = 0', loesungen: [4, -4],
    rechenweg: ['2x² - 32 = 0  | + 32', '2x² = 32  | : 2', 'x² = 16  | √ ziehen', 'x = ±4', 'L = {-4; 4}'] },

  // Reinquadratisch ohne Absolutglied (x² + 0x = 0 → Faktorisieren)
  { id: 'e21', aufgabe: 'x² + 4x = 0', loesungen: [0, -4],
    rechenweg: ['x² + 4x = 0  | x ausklammern', 'x(x + 4) = 0', 'x = 0 oder x + 4 = 0  | - 4', 'x = 0 oder x = -4', 'L = {-4; 0}'] },
  { id: 'e22', aufgabe: 'x² - 6x = 0', loesungen: [0, 6],
    rechenweg: ['x² - 6x = 0  | x ausklammern', 'x(x - 6) = 0', 'x = 0 oder x - 6 = 0  | + 6', 'x = 0 oder x = 6', 'L = {0; 6}'] },
  { id: 'e23', aufgabe: 'x² = 3x', loesungen: [0, 3],
    rechenweg: ['x² = 3x  | - 3x', 'x² - 3x = 0  | x ausklammern', 'x(x - 3) = 0', 'x = 0 oder x = 3', 'L = {0; 3}'] },
  { id: 'e24', aufgabe: 'x² = 5x', loesungen: [0, 5],
    rechenweg: ['x² = 5x  | - 5x', 'x² - 5x = 0  | x ausklammern', 'x(x - 5) = 0', 'x = 0 oder x = 5', 'L = {0; 5}'] },
  { id: 'e25', aufgabe: '2x² + 8x = 0', loesungen: [0, -4],
    rechenweg: ['2x² + 8x = 0  | 2x ausklammern', '2x(x + 4) = 0', 'x = 0 oder x = -4', 'L = {-4; 0}'] },

  // Mit Verschiebung im Quadrat ((x ± a)² = b)
  { id: 'e26', aufgabe: '(x - 2)² = 0', loesungen: [2],
    rechenweg: ['(x - 2)² = 0  | √ ziehen', 'x - 2 = 0  | + 2', 'x = 2', 'L = {2}'] },
  { id: 'e27', aufgabe: '(x + 3)² = 0', loesungen: [-3],
    rechenweg: ['(x + 3)² = 0  | √ ziehen', 'x + 3 = 0  | - 3', 'x = -3', 'L = {-3}'] },
  { id: 'e28', aufgabe: '(x - 1)² = 4', loesungen: [3, -1],
    rechenweg: ['(x - 1)² = 4  | √ ziehen', 'x - 1 = ±2', 'x = 1 ± 2', 'x = 3 oder x = -1', 'L = {-1; 3}'] },
  { id: 'e29', aufgabe: '(x + 2)² = 9', loesungen: [1, -5],
    rechenweg: ['(x + 2)² = 9  | √ ziehen', 'x + 2 = ±3', 'x = -2 ± 3', 'x = 1 oder x = -5', 'L = {-5; 1}'] },
  { id: 'e30', aufgabe: '(x - 3)² = 25', loesungen: [8, -2],
    rechenweg: ['(x - 3)² = 25  | √ ziehen', 'x - 3 = ±5', 'x = 3 ± 5', 'x = 8 oder x = -2', 'L = {-2; 8}'] },

  // Mit negativen Lösungen
  { id: 'e31', aufgabe: 'x² = 1', loesungen: [1, -1],
    rechenweg: ['x² = 1  | √ ziehen', 'x = ±1', 'L = {-1; 1}'] },
  { id: 'e32', aufgabe: 'x² - 1 = 0', loesungen: [1, -1],
    rechenweg: ['x² - 1 = 0  | + 1', 'x² = 1  | √ ziehen', 'x = ±1', 'L = {-1; 1}'] },
  { id: 'e33', aufgabe: '3x² - 12 = 0', loesungen: [2, -2],
    rechenweg: ['3x² - 12 = 0  | + 12', '3x² = 12  | : 3', 'x² = 4  | √ ziehen', 'x = ±2', 'L = {-2; 2}'] },
  { id: 'e34', aufgabe: '5x² - 20 = 0', loesungen: [2, -2],
    rechenweg: ['5x² - 20 = 0  | + 20', '5x² = 20  | : 5', 'x² = 4  | √ ziehen', 'x = ±2', 'L = {-2; 2}'] },
  { id: 'e35', aufgabe: 'x² - 36 = 0', loesungen: [6, -6],
    rechenweg: ['x² - 36 = 0  | + 36', 'x² = 36  | √ ziehen', 'x = ±6', 'L = {-6; 6}'] },

  // Weitere Variationen
  { id: 'e36', aufgabe: '2x² = 32', loesungen: [4, -4],
    rechenweg: ['2x² = 32  | : 2', 'x² = 16  | √ ziehen', 'x = ±4', 'L = {-4; 4}'] },
  { id: 'e37', aufgabe: '3x² = 48', loesungen: [4, -4],
    rechenweg: ['3x² = 48  | : 3', 'x² = 16  | √ ziehen', 'x = ±4', 'L = {-4; 4}'] },
  { id: 'e38', aufgabe: 'x² + 5 = 0', loesungen: [],
    rechenweg: ['x² + 5 = 0  | - 5', 'x² = -5  | keine reelle Lösung', 'L = ∅'] },
  { id: 'e39', aufgabe: '4x² - 16 = 0', loesungen: [2, -2],
    rechenweg: ['4x² - 16 = 0  | + 16', '4x² = 16  | : 4', 'x² = 4  | √ ziehen', 'x = ±2', 'L = {-2; 2}'] },
  { id: 'e40', aufgabe: 'x² - 64 = 0', loesungen: [8, -8],
    rechenweg: ['x² - 64 = 0  | + 64', 'x² = 64  | √ ziehen', 'x = ±8', 'L = {-8; 8}'] },

  // Mit Ausklammern
  { id: 'e41', aufgabe: '3x² + 9x = 0', loesungen: [0, -3],
    rechenweg: ['3x² + 9x = 0  | 3x ausklammern', '3x(x + 3) = 0', 'x = 0 oder x = -3', 'L = {-3; 0}'] },
  { id: 'e42', aufgabe: '2x² - 10x = 0', loesungen: [0, 5],
    rechenweg: ['2x² - 10x = 0  | 2x ausklammern', '2x(x - 5) = 0', 'x = 0 oder x = 5', 'L = {0; 5}'] },
  { id: 'e43', aufgabe: '4x² - 20x = 0', loesungen: [0, 5],
    rechenweg: ['4x² - 20x = 0  | 4x ausklammern', '4x(x - 5) = 0', 'x = 0 oder x = 5', 'L = {0; 5}'] },
  { id: 'e44', aufgabe: 'x² = 2x', loesungen: [0, 2],
    rechenweg: ['x² = 2x  | - 2x', 'x² - 2x = 0  | x ausklammern', 'x(x - 2) = 0', 'x = 0 oder x = 2', 'L = {0; 2}'] },
  { id: 'e45', aufgabe: '2x² + 6x = 0', loesungen: [0, -3],
    rechenweg: ['2x² + 6x = 0  | 2x ausklammern', '2x(x + 3) = 0', 'x = 0 oder x = -3', 'L = {-3; 0}'] },

  // Binomische Formeln
  { id: 'e46', aufgabe: '(x + 1)² = 4', loesungen: [1, -3],
    rechenweg: ['(x + 1)² = 4  | √ ziehen', 'x + 1 = ±2', 'x = -1 ± 2', 'x = 1 oder x = -3', 'L = {-3; 1}'] },
  { id: 'e47', aufgabe: '(x - 4)² = 9', loesungen: [7, 1],
    rechenweg: ['(x - 4)² = 9  | √ ziehen', 'x - 4 = ±3', 'x = 4 ± 3', 'x = 7 oder x = 1', 'L = {1; 7}'] },
  { id: 'e48', aufgabe: 'x² = 81', loesungen: [9, -9],
    rechenweg: ['x² = 81  | √ ziehen', 'x = ±9', 'L = {-9; 9}'] },
  { id: 'e49', aufgabe: '5x² = 5', loesungen: [1, -1],
    rechenweg: ['5x² = 5  | : 5', 'x² = 1  | √ ziehen', 'x = ±1', 'L = {-1; 1}'] },
  { id: 'e50', aufgabe: 'x² + 7 = 0', loesungen: [],
    rechenweg: ['x² + 7 = 0  | - 7', 'x² = -7  | keine reelle Lösung', 'L = ∅'] },
  { id: 'e51', aufgabe: '6x² - 24 = 0', loesungen: [2, -2],
    rechenweg: ['6x² - 24 = 0  | + 24', '6x² = 24  | : 6', 'x² = 4  | √ ziehen', 'x = ±2', 'L = {-2; 2}'] },
  { id: 'e52', aufgabe: 'x² - 49 = 0', loesungen: [7, -7],
    rechenweg: ['x² - 49 = 0  | + 49', 'x² = 49  | √ ziehen', 'x = ±7', 'L = {-7; 7}'] },

  // ==================== MITTEL (m1-m52): Mit p-q Formel oder Ausmultiplizieren ====================

  { id: 'm1', aufgabe: 'x² + 5x + 6 = 0', loesungen: [-2, -3],
    rechenweg: ['x² + 5x + 6 = 0  | p-q Formel', 'p = 5, q = 6', 'x = -2,5 ± √(6,25 - 6)', 'x = -2,5 ± √0,25 = -2,5 ± 0,5', 'x = -2 oder x = -3', 'L = {-3; -2}'] },
  { id: 'm2', aufgabe: 'x² - 5x + 6 = 0', loesungen: [2, 3],
    rechenweg: ['x² - 5x + 6 = 0  | p-q Formel', 'p = -5, q = 6', 'x = 2,5 ± √(6,25 - 6)', 'x = 2,5 ± √0,25 = 2,5 ± 0,5', 'x = 3 oder x = 2', 'L = {2; 3}'] },
  { id: 'm3', aufgabe: 'x² - 7x + 12 = 0', loesungen: [3, 4],
    rechenweg: ['x² - 7x + 12 = 0  | p-q Formel', 'p = -7, q = 12', 'x = 3,5 ± √(12,25 - 12)', 'x = 3,5 ± √0,25 = 3,5 ± 0,5', 'x = 4 oder x = 3', 'L = {3; 4}'] },
  { id: 'm4', aufgabe: 'x² + 3x + 2 = 0', loesungen: [-1, -2],
    rechenweg: ['x² + 3x + 2 = 0  | p-q Formel', 'p = 3, q = 2', 'x = -1,5 ± √(2,25 - 2)', 'x = -1,5 ± √0,25 = -1,5 ± 0,5', 'x = -1 oder x = -2', 'L = {-2; -1}'] },
  { id: 'm5', aufgabe: 'x² - 6x + 8 = 0', loesungen: [2, 4],
    rechenweg: ['x² - 6x + 8 = 0  | p-q Formel', 'p = -6, q = 8', 'x = 3 ± √(9 - 8)', 'x = 3 ± √1 = 3 ± 1', 'x = 4 oder x = 2', 'L = {2; 4}'] },

  { id: 'm6', aufgabe: '(x + 2)(x + 3) = 0', loesungen: [-2, -3],
    rechenweg: ['(x + 2)(x + 3) = 0  | Produktsatz', 'x + 2 = 0 oder x + 3 = 0  | - 2 bzw. - 3', 'x = -2 oder x = -3', 'L = {-3; -2}'] },
  { id: 'm7', aufgabe: '(x - 1)(x - 5) = 0', loesungen: [1, 5],
    rechenweg: ['(x - 1)(x - 5) = 0  | Produktsatz', 'x - 1 = 0 oder x - 5 = 0  | + 1 bzw. + 5', 'x = 1 oder x = 5', 'L = {1; 5}'] },
  { id: 'm8', aufgabe: '(x + 1)(x - 4) = 0', loesungen: [-1, 4],
    rechenweg: ['(x + 1)(x - 4) = 0  | Produktsatz', 'x + 1 = 0 oder x - 4 = 0  | - 1 bzw. + 4', 'x = -1 oder x = 4', 'L = {-1; 4}'] },
  { id: 'm9', aufgabe: '(x - 2)(x - 3) = 0', loesungen: [2, 3],
    rechenweg: ['(x - 2)(x - 3) = 0  | Produktsatz', 'x - 2 = 0 oder x - 3 = 0  | + 2 bzw. + 3', 'x = 2 oder x = 3', 'L = {2; 3}'] },
  { id: 'm10', aufgabe: '(2x - 4)(x + 2) = 0', loesungen: [2, -2],
    rechenweg: ['(2x - 4)(x + 2) = 0  | Produktsatz', '2x - 4 = 0 oder x + 2 = 0  | + 4 bzw. - 2', 'x = 2 oder x = -2', 'L = {-2; 2}'] },

  { id: 'm11', aufgabe: '2(x - 3)(x + 1) = 0', loesungen: [3, -1],
    rechenweg: ['2(x - 3)(x + 1) = 0  | : 2', '(x - 3)(x + 1) = 0', 'x - 3 = 0 oder x + 1 = 0  | + 3 bzw. - 1', 'x = 3 oder x = -1', 'L = {-1; 3}'] },
  { id: 'm12', aufgabe: 'x² - 2x - 3 = 0', loesungen: [-1, 3],
    rechenweg: ['x² - 2x - 3 = 0  | p-q Formel', 'p = -2, q = -3', 'x = 1 ± √(1 + 3)', 'x = 1 ± √4 = 1 ± 2', 'x = 3 oder x = -1', 'L = {-1; 3}'] },
  { id: 'm13', aufgabe: 'x² - 8x + 15 = 0', loesungen: [3, 5],
    rechenweg: ['x² - 8x + 15 = 0  | p-q Formel', 'p = -8, q = 15', 'x = 4 ± √(16 - 15)', 'x = 4 ± √1 = 4 ± 1', 'x = 5 oder x = 3', 'L = {3; 5}'] },
  { id: 'm14', aufgabe: 'x² + 8x + 15 = 0', loesungen: [-3, -5],
    rechenweg: ['x² + 8x + 15 = 0  | p-q Formel', 'p = 8, q = 15', 'x = -4 ± √(16 - 15)', 'x = -4 ± √1 = -4 ± 1', 'x = -3 oder x = -5', 'L = {-5; -3}'] },
  { id: 'm15', aufgabe: 'x² - 10x + 24 = 0', loesungen: [4, 6],
    rechenweg: ['x² - 10x + 24 = 0  | p-q Formel', 'p = -10, q = 24', 'x = 5 ± √(25 - 24)', 'x = 5 ± √1 = 5 ± 1', 'x = 6 oder x = 4', 'L = {4; 6}'] },

  { id: 'm16', aufgabe: '(x + 3)² = 16', loesungen: [1, -7],
    rechenweg: ['(x + 3)² = 16  | √ ziehen', 'x + 3 = ±4', 'x = -3 ± 4', 'x = 1 oder x = -7', 'L = {-7; 1}'] },
  { id: 'm17', aufgabe: '(x - 5)² = 36', loesungen: [11, -1],
    rechenweg: ['(x - 5)² = 36  | √ ziehen', 'x - 5 = ±6', 'x = 5 ± 6', 'x = 11 oder x = -1', 'L = {-1; 11}'] },
  { id: 'm18', aufgabe: 'x² - 4x + 4 = 0', loesungen: [2],
    rechenweg: ['x² - 4x + 4 = 0  | Binomische Formel', '(x - 2)² = 0  | √ ziehen', 'x - 2 = 0  | + 2', 'x = 2', 'L = {2}'] },
  { id: 'm19', aufgabe: 'x² + 6x + 9 = 0', loesungen: [-3],
    rechenweg: ['x² + 6x + 9 = 0  | Binomische Formel', '(x + 3)² = 0  | √ ziehen', 'x + 3 = 0  | - 3', 'x = -3', 'L = {-3}'] },
  { id: 'm20', aufgabe: 'x² - 9 = (x - 2)²', loesungen: [1.25],
    rechenweg: ['x² - 9 = (x - 2)²  | rechts ausmultiplizieren', 'x² - 9 = x² - 4x + 4  | - x²', '- 9 = -4x + 4  | + 4x - 4', '4x = 13  | : 4', 'x = 3,25', 'L = {3,25}'] },

  { id: 'm21', aufgabe: '2x² + 8x = 0', loesungen: [0, -4],
    rechenweg: ['2x² + 8x = 0  | 2x ausklammern', '2x(x + 4) = 0', 'x = 0 oder x = -4', 'L = {-4; 0}'] },
  { id: 'm22', aufgabe: '3x² - 15x = 0', loesungen: [0, 5],
    rechenweg: ['3x² - 15x = 0  | 3x ausklammern', '3x(x - 5) = 0', 'x = 0 oder x = 5', 'L = {0; 5}'] },
  { id: 'm23', aufgabe: 'x² + 9x + 20 = 0', loesungen: [-4, -5],
    rechenweg: ['x² + 9x + 20 = 0  | p-q Formel', 'p = 9, q = 20', 'x = -4,5 ± √(20,25 - 20)', 'x = -4,5 ± √0,25 = -4,5 ± 0,5', 'x = -4 oder x = -5', 'L = {-5; -4}'] },
  { id: 'm24', aufgabe: 'x² - 11x + 30 = 0', loesungen: [5, 6],
    rechenweg: ['x² - 11x + 30 = 0  | p-q Formel', 'p = -11, q = 30', 'x = 5,5 ± √(30,25 - 30)', 'x = 5,5 ± √0,25 = 5,5 ± 0,5', 'x = 6 oder x = 5', 'L = {5; 6}'] },
  { id: 'm25', aufgabe: 'x² - 2x - 8 = 0', loesungen: [-2, 4],
    rechenweg: ['x² - 2x - 8 = 0  | p-q Formel', 'p = -2, q = -8', 'x = 1 ± √(1 + 8)', 'x = 1 ± √9 = 1 ± 3', 'x = 4 oder x = -2', 'L = {-2; 4}'] },

  { id: 'm26', aufgabe: '2x² - 10x + 12 = 0', loesungen: [2, 3],
    rechenweg: ['2x² - 10x + 12 = 0  | : 2', 'x² - 5x + 6 = 0  | p-q Formel', 'x = 2,5 ± √(6,25 - 6)', 'x = 2,5 ± √0,25 = 2,5 ± 0,5', 'x = 3 oder x = 2', 'L = {2; 3}'] },
  { id: 'm27', aufgabe: '3x² + 9x + 6 = 0', loesungen: [-1, -2],
    rechenweg: ['3x² + 9x + 6 = 0  | : 3', 'x² + 3x + 2 = 0  | p-q Formel', 'x = -1,5 ± √(2,25 - 2)', 'x = -1,5 ± √0,25 = -1,5 ± 0,5', 'x = -1 oder x = -2', 'L = {-2; -1}'] },
  { id: 'm28', aufgabe: 'x² + x - 12 = 0', loesungen: [-4, 3],
    rechenweg: ['x² + x - 12 = 0  | p-q Formel', 'p = 1, q = -12', 'x = -0,5 ± √(0,25 + 12)', 'x = -0,5 ± √12,25 = -0,5 ± 3,5', 'x = 3 oder x = -4', 'L = {-4; 3}'] },
  { id: 'm29', aufgabe: 'x² - 3x - 10 = 0', loesungen: [-2, 5],
    rechenweg: ['x² - 3x - 10 = 0  | p-q Formel', 'p = -3, q = -10', 'x = 1,5 ± √(2,25 + 10)', 'x = 1,5 ± √12,25 = 1,5 ± 3,5', 'x = 5 oder x = -2', 'L = {-2; 5}'] },
  { id: 'm30', aufgabe: 'x² + 2x - 15 = 0', loesungen: [-5, 3],
    rechenweg: ['x² + 2x - 15 = 0  | p-q Formel', 'p = 2, q = -15', 'x = -1 ± √(1 + 15)', 'x = -1 ± √16 = -1 ± 4', 'x = 3 oder x = -5', 'L = {-5; 3}'] },

  { id: 'm31', aufgabe: '(x - 4)² - 9 = 0', loesungen: [1, 7],
    rechenweg: ['(x - 4)² - 9 = 0  | + 9', '(x - 4)² = 9  | √ ziehen', 'x - 4 = ±3', 'x = 4 ± 3', 'x = 7 oder x = 1', 'L = {1; 7}'] },
  { id: 'm32', aufgabe: '(x + 5)² - 25 = 0', loesungen: [0, -10],
    rechenweg: ['(x + 5)² - 25 = 0  | + 25', '(x + 5)² = 25  | √ ziehen', 'x + 5 = ±5', 'x = -5 ± 5', 'x = 0 oder x = -10', 'L = {-10; 0}'] },
  { id: 'm33', aufgabe: 'x² + 4x = 0', loesungen: [0, -4],
    rechenweg: ['x² + 4x = 0  | x ausklammern', 'x(x + 4) = 0', 'x = 0 oder x = -4', 'L = {-4; 0}'] },
  { id: 'm34', aufgabe: 'x² - 12x = 0', loesungen: [0, 12],
    rechenweg: ['x² - 12x = 0  | x ausklammern', 'x(x - 12) = 0', 'x = 0 oder x = 12', 'L = {0; 12}'] },
  { id: 'm35', aufgabe: 'x² = 7x', loesungen: [0, 7],
    rechenweg: ['x² = 7x  | - 7x', 'x² - 7x = 0  | x ausklammern', 'x(x - 7) = 0', 'x = 0 oder x = 7', 'L = {0; 7}'] },

  { id: 'm36', aufgabe: 'x(x - 8) = 0', loesungen: [0, 8],
    rechenweg: ['x(x - 8) = 0  | Produktsatz', 'x = 0 oder x = 8', 'L = {0; 8}'] },
  { id: 'm37', aufgabe: 'x(x + 6) = 0', loesungen: [0, -6],
    rechenweg: ['x(x + 6) = 0  | Produktsatz', 'x = 0 oder x = -6', 'L = {-6; 0}'] },
  { id: 'm38', aufgabe: 'x² - 13x + 40 = 0', loesungen: [5, 8],
    rechenweg: ['x² - 13x + 40 = 0  | p-q Formel', 'p = -13, q = 40', 'x = 6,5 ± √(42,25 - 40)', 'x = 6,5 ± √2,25 = 6,5 ± 1,5', 'x = 8 oder x = 5', 'L = {5; 8}'] },
  { id: 'm39', aufgabe: 'x² + 12x + 35 = 0', loesungen: [-5, -7],
    rechenweg: ['x² + 12x + 35 = 0  | p-q Formel', 'p = 12, q = 35', 'x = -6 ± √(36 - 35)', 'x = -6 ± √1 = -6 ± 1', 'x = -5 oder x = -7', 'L = {-7; -5}'] },
  { id: 'm40', aufgabe: 'x² + x - 20 = 0', loesungen: [-5, 4],
    rechenweg: ['x² + x - 20 = 0  | p-q Formel', 'p = 1, q = -20', 'x = -0,5 ± √(0,25 + 20)', 'x = -0,5 ± √20,25 = -0,5 ± 4,5', 'x = 4 oder x = -5', 'L = {-5; 4}'] },

  { id: 'm41', aufgabe: 'x² - 5x + 4 = 0', loesungen: [1, 4],
    rechenweg: ['x² - 5x + 4 = 0  | p-q Formel', 'p = -5, q = 4', 'x = 2,5 ± √(6,25 - 4)', 'x = 2,5 ± √2,25 = 2,5 ± 1,5', 'x = 4 oder x = 1', 'L = {1; 4}'] },
  { id: 'm42', aufgabe: 'x² + 7x + 10 = 0', loesungen: [-2, -5],
    rechenweg: ['x² + 7x + 10 = 0  | p-q Formel', 'p = 7, q = 10', 'x = -3,5 ± √(12,25 - 10)', 'x = -3,5 ± √2,25 = -3,5 ± 1,5', 'x = -2 oder x = -5', 'L = {-5; -2}'] },
  { id: 'm43', aufgabe: 'x² - 14x + 48 = 0', loesungen: [6, 8],
    rechenweg: ['x² - 14x + 48 = 0  | p-q Formel', 'p = -14, q = 48', 'x = 7 ± √(49 - 48)', 'x = 7 ± √1 = 7 ± 1', 'x = 8 oder x = 6', 'L = {6; 8}'] },
  { id: 'm44', aufgabe: '2x² - 6x + 4 = 0', loesungen: [1, 2],
    rechenweg: ['2x² - 6x + 4 = 0  | : 2', 'x² - 3x + 2 = 0  | p-q Formel', 'x = 1,5 ± √(2,25 - 2)', 'x = 1,5 ± √0,25 = 1,5 ± 0,5', 'x = 2 oder x = 1', 'L = {1; 2}'] },
  { id: 'm45', aufgabe: 'x² + 10x + 24 = 0', loesungen: [-4, -6],
    rechenweg: ['x² + 10x + 24 = 0  | p-q Formel', 'p = 10, q = 24', 'x = -5 ± √(25 - 24)', 'x = -5 ± √1 = -5 ± 1', 'x = -4 oder x = -6', 'L = {-6; -4}'] },

  { id: 'm46', aufgabe: 'x² - 9x + 18 = 0', loesungen: [3, 6],
    rechenweg: ['x² - 9x + 18 = 0  | p-q Formel', 'p = -9, q = 18', 'x = 4,5 ± √(20,25 - 18)', 'x = 4,5 ± √2,25 = 4,5 ± 1,5', 'x = 6 oder x = 3', 'L = {3; 6}'] },
  { id: 'm47', aufgabe: '3x² + 12x + 9 = 0', loesungen: [-1, -3],
    rechenweg: ['3x² + 12x + 9 = 0  | : 3', 'x² + 4x + 3 = 0  | p-q Formel', 'x = -2 ± √(4 - 3)', 'x = -2 ± √1 = -2 ± 1', 'x = -1 oder x = -3', 'L = {-3; -1}'] },
  { id: 'm48', aufgabe: 'x² - 6x - 7 = 0', loesungen: [-1, 7],
    rechenweg: ['x² - 6x - 7 = 0  | p-q Formel', 'p = -6, q = -7', 'x = 3 ± √(9 + 7)', 'x = 3 ± √16 = 3 ± 4', 'x = 7 oder x = -1', 'L = {-1; 7}'] },
  { id: 'm49', aufgabe: 'x² + 11x + 28 = 0', loesungen: [-4, -7],
    rechenweg: ['x² + 11x + 28 = 0  | p-q Formel', 'p = 11, q = 28', 'x = -5,5 ± √(30,25 - 28)', 'x = -5,5 ± √2,25 = -5,5 ± 1,5', 'x = -4 oder x = -7', 'L = {-7; -4}'] },
  { id: 'm50', aufgabe: 'x² - 3x + 2 = 0', loesungen: [1, 2],
    rechenweg: ['x² - 3x + 2 = 0  | p-q Formel', 'p = -3, q = 2', 'x = 1,5 ± √(2,25 - 2)', 'x = 1,5 ± √0,25 = 1,5 ± 0,5', 'x = 2 oder x = 1', 'L = {1; 2}'] },
  { id: 'm51', aufgabe: 'x² + 15x + 56 = 0', loesungen: [-7, -8],
    rechenweg: ['x² + 15x + 56 = 0  | p-q Formel', 'p = 15, q = 56', 'x = -7,5 ± √(56,25 - 56)', 'x = -7,5 ± √0,25 = -7,5 ± 0,5', 'x = -7 oder x = -8', 'L = {-8; -7}'] },
  { id: 'm52', aufgabe: 'x² - x - 12 = 0', loesungen: [-3, 4],
    rechenweg: ['x² - x - 12 = 0  | p-q Formel', 'p = -1, q = -12', 'x = 0,5 ± √(0,25 + 12)', 'x = 0,5 ± √12,25 = 0,5 ± 3,5', 'x = 4 oder x = -3', 'L = {-3; 4}'] },

  // ==================== SCHWER (s1-s52): Mit Ausmultiplizieren, Brüchen und komplexeren Strukturen ====================

  { id: 's1', aufgabe: '2(3x - 4) = 5(x - 4)', loesungen: [-4],
    rechenweg: ['2(3x - 4) = 5(x - 4)  | Ausmultiplizieren', '6x - 8 = 5x - 20  | - 5x + 8', 'x = -12  | aber: linear, nicht quadratisch!', 'Hinweis: Dies ist eine lineare Gleichung'] },
  { id: 's2', aufgabe: '(x - 2)² = (x - 3)(x + 1)', loesungen: [0.5],
    rechenweg: ['(x - 2)² = (x - 3)(x + 1)  | Ausmultiplizieren', 'x² - 4x + 4 = x² - 2x - 3  | - x²', '- 4x + 4 = -2x - 3  | + 2x - 4', '-2x = -7  | : (-2)', 'x = 3,5', 'L = {3,5}'] },
  { id: 's3', aufgabe: '(x + 1)² - (x - 1)² = 8', loesungen: [2],
    rechenweg: ['(x + 1)² - (x - 1)² = 8  | Ausmultiplizieren', '(x² + 2x + 1) - (x² - 2x + 1) = 8', 'x² + 2x + 1 - x² + 2x - 1 = 8', '4x = 8  | : 4', 'x = 2', 'L = {2}'] },
  { id: 's4', aufgabe: 'x² - 2x + 1 = 9', loesungen: [4, -2],
    rechenweg: ['x² - 2x + 1 = 9  | linke Seite ist Binom', '(x - 1)² = 9  | √ ziehen', 'x - 1 = ±3', 'x = 1 ± 3', 'x = 4 oder x = -2', 'L = {-2; 4}'] },
  { id: 's5', aufgabe: 'x² + 4x + 4 = 25', loesungen: [1, -7],
    rechenweg: ['x² + 4x + 4 = 25  | Binom', '(x + 2)² = 25  | √ ziehen', 'x + 2 = ±5', 'x = -2 ± 5', 'x = 3 oder x = -7', 'L = {-7; 3}'] },

  { id: 's6', aufgabe: '(x - 1)(x + 2) = 4', loesungen: [-4, 2.5],
    rechenweg: ['(x - 1)(x + 2) = 4  | Ausmultiplizieren', 'x² + x - 2 = 4  | - 4', 'x² + x - 6 = 0  | p-q Formel', 'x = -0,5 ± √(0,25 + 6)', 'x = -0,5 ± √6,25 = -0,5 ± 2,5', 'x = 2 oder x = -3', 'L = {-3; 2}'] },
  { id: 's7', aufgabe: '(2x - 3)(x + 1) = 0', loesungen: [1.5, -1],
    rechenweg: ['(2x - 3)(x + 1) = 0  | Produktsatz', '2x - 3 = 0 oder x + 1 = 0  | + 3 bzw. - 1', 'x = 1,5 oder x = -1', 'L = {-1; 1,5}'] },
  { id: 's8', aufgabe: '(x + 3)² = 2(x + 3)', loesungen: [-3, -1],
    rechenweg: ['(x + 3)² = 2(x + 3)  | - 2(x + 3)', '(x + 3)² - 2(x + 3) = 0  | (x + 3) ausklammern', '(x + 3)[(x + 3) - 2] = 0', '(x + 3)(x + 1) = 0', 'x = -3 oder x = -1', 'L = {-3; -1}'] },
  { id: 's9', aufgabe: 'x(2x - 5) = 3', loesungen: [2, -0.75],
    rechenweg: ['x(2x - 5) = 3  | Ausmultiplizieren', '2x² - 5x = 3  | - 3', '2x² - 5x - 3 = 0  | Mitternachtsformel', 'x = (5 ± √(25 + 24))/4 = (5 ± √49)/4 = (5 ± 7)/4', 'x = 3 oder x = -0,5', 'L = {-0,5; 3}'] },
  { id: 's10', aufgabe: '(x - 4)² - 16 = 0', loesungen: [8, 0],
    rechenweg: ['(x - 4)² - 16 = 0  | + 16', '(x - 4)² = 16  | √ ziehen', 'x - 4 = ±4', 'x = 4 ± 4', 'x = 8 oder x = 0', 'L = {0; 8}'] },

  { id: 's11', aufgabe: 'x² - 2x - 24 = 0', loesungen: [-4, 6],
    rechenweg: ['x² - 2x - 24 = 0  | p-q Formel', 'x = 1 ± √(1 + 24)', 'x = 1 ± √25 = 1 ± 5', 'x = 6 oder x = -4', 'L = {-4; 6}'] },
  { id: 's12', aufgabe: 'x² + 7x + 12 = 0', loesungen: [-3, -4],
    rechenweg: ['x² + 7x + 12 = 0  | p-q Formel', 'x = -3,5 ± √(12,25 - 12)', 'x = -3,5 ± √0,25 = -3,5 ± 0,5', 'x = -3 oder x = -4', 'L = {-4; -3}'] },
  { id: 's13', aufgabe: '2x² + 3x - 2 = 0', loesungen: [0.5, -2],
    rechenweg: ['2x² + 3x - 2 = 0  | Mitternachtsformel', 'x = (-3 ± √(9 + 16))/4 = (-3 ± √25)/4 = (-3 ± 5)/4', 'x = 0,5 oder x = -2', 'L = {-2; 0,5}'] },
  { id: 's14', aufgabe: '3x² - 7x + 2 = 0', loesungen: [2, 0.333],
    rechenweg: ['3x² - 7x + 2 = 0  | Mitternachtsformel', 'x = (7 ± √(49 - 24))/6 = (7 ± √25)/6 = (7 ± 5)/6', 'x = 2 oder x = 1/3', 'L = {1/3; 2}'] },
  { id: 's15', aufgabe: '(x - 3)² + (x + 2)² = 13', loesungen: [],
    rechenweg: ['(x - 3)² + (x + 2)² = 13  | Ausmultiplizieren', '(x² - 6x + 9) + (x² + 4x + 4) = 13', '2x² - 2x + 13 = 13  | - 13', '2x² - 2x = 0  | 2x ausklammern', '2x(x - 1) = 0', 'x = 0 oder x = 1', 'L = {0; 1}'] },

  { id: 's16', aufgabe: 'x² - 3x - 18 = 0', loesungen: [-3, 6],
    rechenweg: ['x² - 3x - 18 = 0  | p-q Formel', 'x = 1,5 ± √(2,25 + 18)', 'x = 1,5 ± √20,25 = 1,5 ± 4,5', 'x = 6 oder x = -3', 'L = {-3; 6}'] },
  { id: 's17', aufgabe: '4x² - 12x + 9 = 0', loesungen: [1.5],
    rechenweg: ['4x² - 12x + 9 = 0  | Binom (2x - 3)²', '(2x - 3)² = 0  | √ ziehen', '2x - 3 = 0  | + 3', '2x = 3  | : 2', 'x = 1,5', 'L = {1,5}'] },
  { id: 's18', aufgabe: 'x² + 8x + 16 = 4', loesungen: [-6, -2],
    rechenweg: ['x² + 8x + 16 = 4  | Binom', '(x + 4)² = 4  | √ ziehen', 'x + 4 = ±2', 'x = -4 ± 2', 'x = -2 oder x = -6', 'L = {-6; -2}'] },
  { id: 's19', aufgabe: '5x² + 2x - 3 = 0', loesungen: [0.6, -1],
    rechenweg: ['5x² + 2x - 3 = 0  | Mitternachtsformel', 'x = (-2 ± √(4 + 60))/10 = (-2 ± √64)/10 = (-2 ± 8)/10', 'x = 0,6 oder x = -1', 'L = {-1; 0,6}'] },
  { id: 's20', aufgabe: 'x² - 18x + 81 = 0', loesungen: [9],
    rechenweg: ['x² - 18x + 81 = 0  | Binom (x - 9)²', '(x - 9)² = 0  | √ ziehen', 'x - 9 = 0  | + 9', 'x = 9', 'L = {9}'] },

  { id: 's21', aufgabe: '(2x - 1)² = 9', loesungen: [2, -1],
    rechenweg: ['(2x - 1)² = 9  | √ ziehen', '2x - 1 = ±3', '2x = 1 ± 3', 'x = 2 oder x = -1', 'L = {-1; 2}'] },
  { id: 's22', aufgabe: '2x² - 7x + 3 = 0', loesungen: [3, 0.5],
    rechenweg: ['2x² - 7x + 3 = 0  | Mitternachtsformel', 'x = (7 ± √(49 - 24))/4 = (7 ± √25)/4 = (7 ± 5)/4', 'x = 3 oder x = 0,5', 'L = {0,5; 3}'] },
  { id: 's23', aufgabe: 'x² + x - 30 = 0', loesungen: [-6, 5],
    rechenweg: ['x² + x - 30 = 0  | p-q Formel', 'x = -0,5 ± √(0,25 + 30)', 'x = -0,5 ± √30,25 = -0,5 ± 5,5', 'x = 5 oder x = -6', 'L = {-6; 5}'] },
  { id: 's24', aufgabe: '(x + 1)(x - 1) = 3', loesungen: [2, -2],
    rechenweg: ['(x + 1)(x - 1) = 3  | Ausmultiplizieren', 'x² - 1 = 3  | + 1', 'x² = 4  | √ ziehen', 'x = ±2', 'L = {-2; 2}'] },
  { id: 's25', aufgabe: '3x² - 12 = 0', loesungen: [2, -2],
    rechenweg: ['3x² - 12 = 0  | + 12', '3x² = 12  | : 3', 'x² = 4  | √ ziehen', 'x = ±2', 'L = {-2; 2}'] },

  { id: 's26', aufgabe: 'x² - 12x + 36 = 0', loesungen: [6],
    rechenweg: ['x² - 12x + 36 = 0  | Binom (x - 6)²', '(x - 6)² = 0  | √ ziehen', 'x - 6 = 0  | + 6', 'x = 6', 'L = {6}'] },
  { id: 's27', aufgabe: '2x² + 5x - 3 = 0', loesungen: [0.5, -3],
    rechenweg: ['2x² + 5x - 3 = 0  | Mitternachtsformel', 'x = (-5 ± √(25 + 24))/4 = (-5 ± √49)/4 = (-5 ± 7)/4', 'x = 0,5 oder x = -3', 'L = {-3; 0,5}'] },
  { id: 's28', aufgabe: 'x² - 4x - 21 = 0', loesungen: [-3, 7],
    rechenweg: ['x² - 4x - 21 = 0  | p-q Formel', 'x = 2 ± √(4 + 21)', 'x = 2 ± √25 = 2 ± 5', 'x = 7 oder x = -3', 'L = {-3; 7}'] },
  { id: 's29', aufgabe: '4x² + 4x + 1 = 0', loesungen: [-0.5],
    rechenweg: ['4x² + 4x + 1 = 0  | Binom (2x + 1)²', '(2x + 1)² = 0  | √ ziehen', '2x + 1 = 0  | - 1', '2x = -1  | : 2', 'x = -0,5', 'L = {-0,5}'] },
  { id: 's30', aufgabe: '6x² - 5x - 6 = 0', loesungen: [1.5, -0.666],
    rechenweg: ['6x² - 5x - 6 = 0  | Mitternachtsformel', 'x = (5 ± √(25 + 144))/12 = (5 ± √169)/12 = (5 ± 13)/12', 'x = 1,5 oder x = -2/3', 'L = {-2/3; 1,5}'] },

  { id: 's31', aufgabe: '(x + 2)(x - 2) = 5', loesungen: [3, -3],
    rechenweg: ['(x + 2)(x - 2) = 5  | Ausmultiplizieren', 'x² - 4 = 5  | + 4', 'x² = 9  | √ ziehen', 'x = ±3', 'L = {-3; 3}'] },
  { id: 's32', aufgabe: 'x² - 5x - 36 = 0', loesungen: [-4, 9],
    rechenweg: ['x² - 5x - 36 = 0  | p-q Formel', 'x = 2,5 ± √(6,25 + 36)', 'x = 2,5 ± √42,25 = 2,5 ± 6,5', 'x = 9 oder x = -4', 'L = {-4; 9}'] },
  { id: 's33', aufgabe: '3x² + 8x + 4 = 0', loesungen: [-1, -0.666],
    rechenweg: ['3x² + 8x + 4 = 0  | Mitternachtsformel', 'x = (-8 ± √(64 - 48))/6 = (-8 ± √16)/6 = (-8 ± 4)/6', 'x = -2/3 oder x = -2', 'L = {-2; -2/3}'] },
  { id: 's34', aufgabe: 'x² + 14x + 49 = 0', loesungen: [-7],
    rechenweg: ['x² + 14x + 49 = 0  | Binom (x + 7)²', '(x + 7)² = 0  | √ ziehen', 'x + 7 = 0  | - 7', 'x = -7', 'L = {-7}'] },
  { id: 's35', aufgabe: '5x² - 20x + 20 = 0', loesungen: [2],
    rechenweg: ['5x² - 20x + 20 = 0  | : 5', 'x² - 4x + 4 = 0  | Binom', '(x - 2)² = 0  | √ ziehen', 'x = 2', 'L = {2}'] },

  { id: 's36', aufgabe: 'x² - 2x - 63 = 0', loesungen: [-7, 9],
    rechenweg: ['x² - 2x - 63 = 0  | p-q Formel', 'x = 1 ± √(1 + 63)', 'x = 1 ± √64 = 1 ± 8', 'x = 9 oder x = -7', 'L = {-7; 9}'] },
  { id: 's37', aufgabe: '7x² - 7 = 0', loesungen: [1, -1],
    rechenweg: ['7x² - 7 = 0  | : 7', 'x² - 1 = 0  | + 1', 'x² = 1  | √ ziehen', 'x = ±1', 'L = {-1; 1}'] },
  { id: 's38', aufgabe: '(3x - 2)(x + 4) = 0', loesungen: [0.666, -4],
    rechenweg: ['(3x - 2)(x + 4) = 0  | Produktsatz', '3x - 2 = 0 oder x + 4 = 0  | + 2 bzw. - 4', 'x = 2/3 oder x = -4', 'L = {-4; 2/3}'] },
  { id: 's39', aufgabe: 'x² + 9x + 18 = 0', loesungen: [-3, -6],
    rechenweg: ['x² + 9x + 18 = 0  | p-q Formel', 'x = -4,5 ± √(20,25 - 18)', 'x = -4,5 ± √2,25 = -4,5 ± 1,5', 'x = -3 oder x = -6', 'L = {-6; -3}'] },
  { id: 's40', aufgabe: '2x² - 8 = 0', loesungen: [2, -2],
    rechenweg: ['2x² - 8 = 0  | + 8', '2x² = 8  | : 2', 'x² = 4  | √ ziehen', 'x = ±2', 'L = {-2; 2}'] },

  { id: 's41', aufgabe: 'x² - 15x + 56 = 0', loesungen: [7, 8],
    rechenweg: ['x² - 15x + 56 = 0  | p-q Formel', 'x = 7,5 ± √(56,25 - 56)', 'x = 7,5 ± √0,25 = 7,5 ± 0,5', 'x = 8 oder x = 7', 'L = {7; 8}'] },
  { id: 's42', aufgabe: '(x - 5)² + (x + 1)² = 37', loesungen: [],
    rechenweg: ['(x - 5)² + (x + 1)² = 37  | Ausmultiplizieren', '(x² - 10x + 25) + (x² + 2x + 1) = 37', '2x² - 8x + 26 = 37  | - 37', '2x² - 8x - 11 = 0  | Mitternachtsformel', 'x = (8 ± √(64 + 88))/4 = (8 ± √152)/4', 'x ≈ 5,08 oder x ≈ -1,08'] },
  { id: 's43', aufgabe: '8x² - 6x - 9 = 0', loesungen: [1.5, -0.75],
    rechenweg: ['8x² - 6x - 9 = 0  | Mitternachtsformel', 'x = (6 ± √(36 + 288))/16 = (6 ± √324)/16 = (6 ± 18)/16', 'x = 1,5 oder x = -0,75', 'L = {-0,75; 1,5}'] },
  { id: 's44', aufgabe: 'x² + 2x - 48 = 0', loesungen: [-8, 6],
    rechenweg: ['x² + 2x - 48 = 0  | p-q Formel', 'x = -1 ± √(1 + 48)', 'x = -1 ± √49 = -1 ± 7', 'x = 6 oder x = -8', 'L = {-8; 6}'] },
  { id: 's45', aufgabe: '9x² - 6x + 1 = 0', loesungen: [0.333],
    rechenweg: ['9x² - 6x + 1 = 0  | Binom (3x - 1)²', '(3x - 1)² = 0  | √ ziehen', '3x - 1 = 0  | + 1', '3x = 1  | : 3', 'x = 1/3', 'L = {1/3}'] },

  { id: 's46', aufgabe: 'x² - 17x + 72 = 0', loesungen: [8, 9],
    rechenweg: ['x² - 17x + 72 = 0  | p-q Formel', 'x = 8,5 ± √(72,25 - 72)', 'x = 8,5 ± √0,25 = 8,5 ± 0,5', 'x = 9 oder x = 8', 'L = {8; 9}'] },
  { id: 's47', aufgabe: '4x² - 16 = 0', loesungen: [2, -2],
    rechenweg: ['4x² - 16 = 0  | + 16', '4x² = 16  | : 4', 'x² = 4  | √ ziehen', 'x = ±2', 'L = {-2; 2}'] },
  { id: 's48', aufgabe: 'x² - 10x - 39 = 0', loesungen: [-3, 13],
    rechenweg: ['x² - 10x - 39 = 0  | p-q Formel', 'x = 5 ± √(25 + 39)', 'x = 5 ± √64 = 5 ± 8', 'x = 13 oder x = -3', 'L = {-3; 13}'] },
  { id: 's49', aufgabe: '2x² - 9x - 5 = 0', loesungen: [5, -0.5],
    rechenweg: ['2x² - 9x - 5 = 0  | Mitternachtsformel', 'x = (9 ± √(81 + 40))/4 = (9 ± √121)/4 = (9 ± 11)/4', 'x = 5 oder x = -0,5', 'L = {-0,5; 5}'] },
  { id: 's50', aufgabe: 'x² + 20x + 100 = 0', loesungen: [-10],
    rechenweg: ['x² + 20x + 100 = 0  | Binom (x + 10)²', '(x + 10)² = 0  | √ ziehen', 'x + 10 = 0  | - 10', 'x = -10', 'L = {-10}'] },
  { id: 's51', aufgabe: '3x² - 27 = 0', loesungen: [3, -3],
    rechenweg: ['3x² - 27 = 0  | + 27', '3x² = 27  | : 3', 'x² = 9  | √ ziehen', 'x = ±3', 'L = {-3; 3}'] },
  { id: 's52', aufgabe: 'x² - 6x - 40 = 0', loesungen: [-4, 10],
    rechenweg: ['x² - 6x - 40 = 0  | p-q Formel', 'x = 3 ± √(9 + 40)', 'x = 3 ± √49 = 3 ± 7', 'x = 10 oder x = -4', 'L = {-4; 10}'] },
];

// ============================================================================
// REACT COMPONENT
// ============================================================================

export default function Quadratisch() {
  const [currentCategory, setCurrentCategory] = useState<'einfach' | 'mittel' | 'schwer'>('einfach');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [answered, setAnswered] = useState(false);

  const filteredAufgaben = aufgaben.filter((a) => a.id.startsWith(currentCategory[0]));
  const current = filteredAufgaben[currentIndex];

  const checkAnswer = () => {
    const entered = userAnswer.toLowerCase().replace(/\s+/g, '').split(';').map((x) => x.trim()).filter((x) => x);
    const entereds = entered.map((x) => {
      x = x.replace(/l\s*=\s*\{/, '').replace(/\}/, '').trim();
      return parseFloat(x);
    });

    const isCorrect = current.loesungen.length === entereds.length && 
                     current.loesungen.every((val) => entereds.some((e) => Math.abs(e - val) < 0.1));

    setCorrect(isCorrect);
    setAnswered(true);
  };

  const nextAufgabe = () => {
    setUserAnswer('');
    setShowSolution(false);
    setCorrect(false);
    setAnswered(false);
    setCurrentIndex((prev) => (prev + 1) % filteredAufgaben.length);
  };

  const prevAufgabe = () => {
    setUserAnswer('');
    setShowSolution(false);
    setCorrect(false);
    setAnswered(false);
    setCurrentIndex((prev) => (prev - 1 + filteredAufgaben.length) % filteredAufgaben.length);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Quadratische Gleichungen</h1>

        {/* Schwierigkeit Buttons */}
        <div className="flex gap-4 mb-8 justify-center flex-wrap">
          {['einfach', 'mittel', 'schwer'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCurrentCategory(cat as 'einfach' | 'mittel' | 'schwer');
                setCurrentIndex(0);
                setUserAnswer('');
                setShowSolution(false);
                setCorrect(false);
                setAnswered(false);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                currentCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Aufgabe */}
        <div className="bg-blue-50 p-6 rounded-lg mb-6 border-2 border-blue-200">
          <p className="text-sm text-gray-600 mb-2">
            {current?.id} - Aufgabe {currentIndex + 1} von {filteredAufgaben.length}
          </p>
          <p className="text-2xl font-bold text-blue-900">{current?.aufgabe}</p>
        </div>

        {/* Eingabefeld */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Deine Antwort (z.B. "L = {'{2; -3}'}" oder "L = ∅"):
          </label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Lösungsmenge eingeben"
            disabled={answered}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={checkAnswer}
            disabled={answered || !userAnswer.trim()}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            Überprüfen
          </button>
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
          >
            {showSolution ? 'Lösung ausblenden' : 'Lösung anzeigen'}
          </button>
        </div>

        {/* Feedback */}
        {answered && (
          <div
            className={`p-4 rounded-lg mb-6 text-center font-semibold ${
              correct
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-red-100 text-red-800 border-2 border-red-300'
            }`}
          >
            {correct ? '✓ Richtig!' : '✗ Leider falsch'}
          </div>
        )}

        {/* Lösung */}
        {showSolution && (
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Lösungsweg:</h3>
            <div className="space-y-2">
              {current?.rechenweg.map((step, idx) => (
                <p key={idx} className="text-gray-800 font-mono">
                  {idx > 0 && <span className="text-gray-500">→ </span>}
                  {step}
                </p>
              ))}
            </div>
            <p className="text-lg font-bold text-green-700 mt-4">
              Lösung: L = {'{'}
              {current?.loesungen.length === 0
                ? '∅'
                : current?.loesungen
                    .map((x) => (Number.isInteger(x) ? x.toString() : x.toFixed(2)))
                    .join('; ')}
              {'}'}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 justify-between flex-wrap">
          <button
            onClick={prevAufgabe}
            className="px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500"
          >
            ← Zurück
          </button>
          <span className="px-6 py-3 text-gray-700 font-semibold">
            Aufgabe {currentIndex + 1} / {filteredAufgaben.length}
          </span>
          <button
            onClick={nextAufgabe}
            className="px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500"
          >
            Weiter →
          </button>
        </div>
      </div>
    </div>
  );
}
