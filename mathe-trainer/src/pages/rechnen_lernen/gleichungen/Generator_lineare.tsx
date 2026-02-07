import React, { useState } from 'react';

// ============================================================================
// INTELLIGENTE VALIDIERUNGSFUNKTION FÜR GLEICHUNGEN
// ============================================================================

/**
 * Löst eine lineare Gleichung ax + b = cx + d auf und gibt die Lösung zurück
 */
function solveLinearEquation(equation: string): number | null {
  try {
    // Entferne Leerzeichen und wandle in Kleinbuchstaben um
    let eq = equation.replace(/\s+/g, '').toLowerCase();

    // Split bei "="
    const [left, right] = eq.split('=');
    if (!left || !right) return null;

    // Parse beide Seiten: ax + b
    const parseExpression = (expr: string) => {
      let coefficient = 0;
      let constant = 0;

      // Entferne führendes + oder -
      expr = expr.replace(/^[+]/, '');

      // Regex für Terme: ±Zahl*x oder ±Zahl
      const terms = expr.match(/[+-]?[^+-]+/g) || [];

      for (const term of terms) {
        const trimmed = term.trim();
        if (!trimmed) continue;

        if (trimmed.includes('x')) {
          // x-Term: 3x, -2x, x, etc.
          const match = trimmed.match(/([+-]?\d*\.?\d*)\*?x/);
          if (match) {
            let coeff = match[1];
            if (coeff === '' || coeff === '+') coeff = '1';
            if (coeff === '-') coeff = '-1';
            coefficient += parseFloat(coeff);
          }
        } else {
          // Konstante
          constant += parseFloat(trimmed);
        }
      }

      return { coefficient, constant };
    };

    const leftParsed = parseExpression(left);
    const rightParsed = parseExpression(right);

    // Gleichung umformen: ax + b = cx + d => (a - c)x = d - b
    const a = leftParsed.coefficient - rightParsed.coefficient;
    const b = rightParsed.constant - leftParsed.constant;

    if (Math.abs(a) < 0.0001) return null; // Keine eindeutige Lösung

    const solution = b / a;
    return Math.round(solution * 10000) / 10000; // Runde auf 4 Dezimalstellen
  } catch {
    return null;
  }
}

/**
 * Vergleicht zwei Lösungen auf Äquivalenz
 */
function areEquivalentSolutions(input: string, expectedSolution: number): boolean {
  try {
    const userSolution = parseFloat(input.trim());
    if (isNaN(userSolution)) return false;
    return Math.abs(userSolution - expectedSolution) < 0.0001;
  } catch {
    return false;
  }
}

// ============================================================================
// AUFGABEN UND KATEGORIEN
// ============================================================================

interface Aufgabe {
  id: string;
  aufgabe: string;
  loesung: number;
  rechenweg: string[];
}

interface Kategorie {
  name: string;
  aufgaben: Aufgabe[];
}

const AUFGABEN_KATEGORIEN: Kategorie[] = [
  {
    name: 'Einfach',
    aufgaben: [
      // Aus Screenshots - Einfache Aufgaben
      { id: 'e1', aufgabe: 'x + 7 = 12', loesung: 5, rechenweg: ['x + 7 = 12', 'x = 12 - 7', 'x = 5'] },
      { id: 'e2', aufgabe: 'x + 8 = 4', loesung: -4, rechenweg: ['x + 8 = 4', 'x = 4 - 8', 'x = -4'] },
      { id: 'e3', aufgabe: '4 + x = 14', loesung: 10, rechenweg: ['4 + x = 14', 'x = 14 - 4', 'x = 10'] },
      { id: 'e4', aufgabe: 'x - 4 = 7', loesung: 11, rechenweg: ['x - 4 = 7', 'x = 7 + 4', 'x = 11'] },
      { id: 'e5', aufgabe: 'x - 5 = 1', loesung: 6, rechenweg: ['x - 5 = 1', 'x = 1 + 5', 'x = 6'] },
      { id: 'e6', aufgabe: '17 + x = 1', loesung: -16, rechenweg: ['17 + x = 1', 'x = 1 - 17', 'x = -16'] },
      { id: 'e7', aufgabe: '3 - x = 2', loesung: 1, rechenweg: ['3 - x = 2', '-x = 2 - 3', '-x = -1', 'x = 1'] },
      { id: 'e8', aufgabe: '5 - x = 10', loesung: -5, rechenweg: ['5 - x = 10', '-x = 10 - 5', '-x = 5', 'x = -5'] },
      { id: 'e9', aufgabe: 'x + 5 = 12', loesung: 7, rechenweg: ['x + 5 = 12', 'x = 12 - 5', 'x = 7'] },
      { id: 'e10', aufgabe: 'x + 3 = 11', loesung: 8, rechenweg: ['x + 3 = 11', 'x = 11 - 3', 'x = 8'] },
      { id: 'e11', aufgabe: '2x = 14', loesung: 7, rechenweg: ['2x = 14', 'x = 14 : 2', 'x = 7'] },
      { id: 'e12', aufgabe: '3x = 9', loesung: 3, rechenweg: ['3x = 9', 'x = 9 : 3', 'x = 3'] },
      { id: 'e13', aufgabe: '4x = 20', loesung: 5, rechenweg: ['4x = 20', 'x = 20 : 4', 'x = 5'] },
      { id: 'e14', aufgabe: '5x = 15', loesung: 3, rechenweg: ['5x = 15', 'x = 15 : 5', 'x = 3'] },
      { id: 'e15', aufgabe: '6x = 24', loesung: 4, rechenweg: ['6x = 24', 'x = 24 : 6', 'x = 4'] },
      { id: 'e16', aufgabe: '7x = 21', loesung: 3, rechenweg: ['7x = 21', 'x = 21 : 7', 'x = 3'] },
      { id: 'e17', aufgabe: 'x : 2 = 4', loesung: 8, rechenweg: ['x : 2 = 4', 'x = 4 · 2', 'x = 8'] },
      { id: 'e18', aufgabe: 'x : 3 = 4', loesung: 12, rechenweg: ['x : 3 = 4', 'x = 4 · 3', 'x = 12'] },
      { id: 'e19', aufgabe: 'x : 5 = 2', loesung: 10, rechenweg: ['x : 5 = 2', 'x = 2 · 5', 'x = 10'] },
      { id: 'e20', aufgabe: 'x : 6 = 6', loesung: 36, rechenweg: ['x : 6 = 6', 'x = 6 · 6', 'x = 36'] },
      { id: 'e21', aufgabe: 'x + 2 = 5', loesung: 3, rechenweg: ['x + 2 = 5', 'x = 5 - 2', 'x = 3'] },
      { id: 'e22', aufgabe: 'x - 9 = 2', loesung: 11, rechenweg: ['x - 9 = 2', 'x = 2 + 9', 'x = 11'] },
      { id: 'e23', aufgabe: '8x = 32', loesung: 4, rechenweg: ['8x = 32', 'x = 32 : 8', 'x = 4'] },
      { id: 'e24', aufgabe: '9x = 18', loesung: 2, rechenweg: ['9x = 18', 'x = 18 : 9', 'x = 2'] },
      { id: 'e25', aufgabe: 'x - 1 = 6', loesung: 7, rechenweg: ['x - 1 = 6', 'x = 6 + 1', 'x = 7'] },
      { id: 'e26', aufgabe: 'x + 10 = 20', loesung: 10, rechenweg: ['x + 10 = 20', 'x = 20 - 10', 'x = 10'] },
      { id: 'e27', aufgabe: '2x = 10', loesung: 5, rechenweg: ['2x = 10', 'x = 10 : 2', 'x = 5'] },
      { id: 'e28', aufgabe: '3x = 15', loesung: 5, rechenweg: ['3x = 15', 'x = 15 : 3', 'x = 5'] },
      { id: 'e29', aufgabe: '5x = 25', loesung: 5, rechenweg: ['5x = 25', 'x = 25 : 5', 'x = 5'] },
      { id: 'e30', aufgabe: '6x = 12', loesung: 2, rechenweg: ['6x = 12', 'x = 12 : 6', 'x = 2'] },
      { id: 'e31', aufgabe: 'x + 1 = 2', loesung: 1, rechenweg: ['x + 1 = 2', 'x = 2 - 1', 'x = 1'] },
      { id: 'e32', aufgabe: 'x - 3 = 5', loesung: 8, rechenweg: ['x - 3 = 5', 'x = 5 + 3', 'x = 8'] },
      { id: 'e33', aufgabe: 'x + 6 = 10', loesung: 4, rechenweg: ['x + 6 = 10', 'x = 10 - 6', 'x = 4'] },
      { id: 'e34', aufgabe: '4x = 12', loesung: 3, rechenweg: ['4x = 12', 'x = 12 : 4', 'x = 3'] },
      { id: 'e35', aufgabe: 'x + 15 = 20', loesung: 5, rechenweg: ['x + 15 = 20', 'x = 20 - 15', 'x = 5'] },
      { id: 'e36', aufgabe: 'x - 10 = -5', loesung: 5, rechenweg: ['x - 10 = -5', 'x = -5 + 10', 'x = 5'] },
      { id: 'e37', aufgabe: '10x = 50', loesung: 5, rechenweg: ['10x = 50', 'x = 50 : 10', 'x = 5'] },
      { id: 'e38', aufgabe: 'x : 4 = 3', loesung: 12, rechenweg: ['x : 4 = 3', 'x = 3 · 4', 'x = 12'] },
      { id: 'e39', aufgabe: 'x + 9 = 15', loesung: 6, rechenweg: ['x + 9 = 15', 'x = 15 - 9', 'x = 6'] },
      { id: 'e40', aufgabe: '7x = 14', loesung: 2, rechenweg: ['7x = 14', 'x = 14 : 7', 'x = 2'] },
      { id: 'e41', aufgabe: 'x - 2 = 8', loesung: 10, rechenweg: ['x - 2 = 8', 'x = 8 + 2', 'x = 10'] },
      { id: 'e42', aufgabe: '12x = 24', loesung: 2, rechenweg: ['12x = 24', 'x = 24 : 12', 'x = 2'] },
      { id: 'e43', aufgabe: 'x + 11 = 20', loesung: 9, rechenweg: ['x + 11 = 20', 'x = 20 - 11', 'x = 9'] },
      { id: 'e44', aufgabe: 'x - 7 = 1', loesung: 8, rechenweg: ['x - 7 = 1', 'x = 1 + 7', 'x = 8'] },
      { id: 'e45', aufgabe: '9x = 27', loesung: 3, rechenweg: ['9x = 27', 'x = 27 : 9', 'x = 3'] },
      { id: 'e46', aufgabe: 'x : 7 = 2', loesung: 14, rechenweg: ['x : 7 = 2', 'x = 2 · 7', 'x = 14'] },
      { id: 'e47', aufgabe: 'x + 4 = 8', loesung: 4, rechenweg: ['x + 4 = 8', 'x = 8 - 4', 'x = 4'] },
      { id: 'e48', aufgabe: 'x - 6 = 4', loesung: 10, rechenweg: ['x - 6 = 4', 'x = 4 + 6', 'x = 10'] },
      { id: 'e49', aufgabe: '11x = 22', loesung: 2, rechenweg: ['11x = 22', 'x = 22 : 11', 'x = 2'] },
      { id: 'e50', aufgabe: 'x : 8 = 1', loesung: 8, rechenweg: ['x : 8 = 1', 'x = 1 · 8', 'x = 8'] },
      { id: 'e51', aufgabe: 'x + 12 = 25', loesung: 13, rechenweg: ['x + 12 = 25', 'x = 25 - 12', 'x = 13'] },
      { id: 'e52', aufgabe: 'x - 8 = 3', loesung: 11, rechenweg: ['x - 8 = 3', 'x = 3 + 8', 'x = 11'] },
    ],
  },
  {
    name: 'Mittel',
    aufgaben: [
      // Mittelere Aufgaben - zwei Terme mit x
      { id: 'm1', aufgabe: '2x + 3 = x + 8', loesung: 5, rechenweg: ['2x + 3 = x + 8', '2x - x = 8 - 3', 'x = 5'] },
      { id: 'm2', aufgabe: '3x - 4 = 2x + 1', loesung: 5, rechenweg: ['3x - 4 = 2x + 1', '3x - 2x = 1 + 4', 'x = 5'] },
      { id: 'm3', aufgabe: '5x - 7 = 2x + 8', loesung: 5, rechenweg: ['5x - 7 = 2x + 8', '5x - 2x = 8 + 7', '3x = 15', 'x = 5'] },
      { id: 'm4', aufgabe: '8 - 3x = -1', loesung: 3, rechenweg: ['8 - 3x = -1', '-3x = -1 - 8', '-3x = -9', 'x = 3'] },
      { id: 'm5', aufgabe: '1 - 2x = 5', loesung: -2, rechenweg: ['1 - 2x = 5', '-2x = 5 - 1', '-2x = 4', 'x = -2'] },
      { id: 'm6', aufgabe: '6x - 14 = 10', loesung: 4, rechenweg: ['6x - 14 = 10', '6x = 10 + 14', '6x = 24', 'x = 4'] },
      { id: 'm7', aufgabe: '8z - 9 = 31', loesung: 5, rechenweg: ['8z - 9 = 31', '8z = 31 + 9', '8z = 40', 'z = 5'] },
      { id: 'm8', aufgabe: '3x + 2 = 11', loesung: 3, rechenweg: ['3x + 2 = 11', '3x = 11 - 2', '3x = 9', 'x = 3'] },
      { id: 'm9', aufgabe: '2x + 5 = 15', loesung: 5, rechenweg: ['2x + 5 = 15', '2x = 15 - 5', '2x = 10', 'x = 5'] },
      { id: 'm10', aufgabe: '7x + 3 = 31', loesung: 4, rechenweg: ['7x + 3 = 31', '7x = 31 - 3', '7x = 28', 'x = 4'] },
      { id: 'm11', aufgabe: '4x - 2 = 14', loesung: 4, rechenweg: ['4x - 2 = 14', '4x = 14 + 2', '4x = 16', 'x = 4'] },
      { id: 'm12', aufgabe: '3x + 8 = 17', loesung: 3, rechenweg: ['3x + 8 = 17', '3x = 17 - 8', '3x = 9', 'x = 3'] },
      { id: 'm13', aufgabe: '5x + 33 = 9x - 7', loesung: 10, rechenweg: ['5x + 33 = 9x - 7', '5x - 9x = -7 - 33', '-4x = -40', 'x = 10'] },
      { id: 'm14', aufgabe: '2x + 3 = x + 8', loesung: 5, rechenweg: ['2x + 3 = x + 8', 'x = 5'] },
      { id: 'm15', aufgabe: '4x + 1 = 2x + 17', loesung: 8, rechenweg: ['4x + 1 = 2x + 17', '2x = 16', 'x = 8'] },
      { id: 'm16', aufgabe: '15x + 4 = 5x - 86', loesung: -9, rechenweg: ['15x + 4 = 5x - 86', '10x = -90', 'x = -9'] },
      { id: 'm17', aufgabe: '4x + 5 = 14 - 7x', loesung: 1, rechenweg: ['4x + 5 = 14 - 7x', '11x = 9', 'x = 9/11 ≈ 0.82'] },
      { id: 'm18', aufgabe: '3x - 7 = 11', loesung: 6, rechenweg: ['3x - 7 = 11', '3x = 18', 'x = 6'] },
      { id: 'm19', aufgabe: '5 - 2x = x + 2', loesung: 1, rechenweg: ['5 - 2x = x + 2', '-3x = -3', 'x = 1'] },
      { id: 'm20', aufgabe: '14 - 5x = 3x - 2', loesung: 2, rechenweg: ['14 - 5x = 3x - 2', '16 = 8x', 'x = 2'] },
      { id: 'm21', aufgabe: '2x + 10 = 22x - 12', loesung: 1, rechenweg: ['2x + 10 = 22x - 12', '-20x = -22', 'x = 1.1'] },
      { id: 'm22', aufgabe: '3x + 2 = x + 6', loesung: 2, rechenweg: ['3x + 2 = x + 6', '2x = 4', 'x = 2'] },
      { id: 'm23', aufgabe: 'x + 8 = 3x + 2', loesung: 3, rechenweg: ['x + 8 = 3x + 2', '-2x = -6', 'x = 3'] },
      { id: 'm24', aufgabe: '2x - 5 = x + 3', loesung: 8, rechenweg: ['2x - 5 = x + 3', 'x = 8'] },
      { id: 'm25', aufgabe: '4(x + 5) = 9x + 5', loesung: 3, rechenweg: ['4(x + 5) = 9x + 5', '4x + 20 = 9x + 5', '-5x = -15', 'x = 3'] },
      { id: 'm26', aufgabe: '3(x + 1) = 15', loesung: 4, rechenweg: ['3(x + 1) = 15', '3x + 3 = 15', '3x = 12', 'x = 4'] },
      { id: 'm27', aufgabe: '2(3x - 1) = 3(2x - 1) + 1', loesung: 2, rechenweg: ['2(3x - 1) = 3(2x - 1) + 1', '6x - 2 = 6x - 3 + 1', '6x - 2 = 6x - 2', 'Identität - alle x erfüllen'] },
      { id: 'm28', aufgabe: '7x + 3 = x + 8', loesung: 0.833, rechenweg: ['7x + 3 = x + 8', '6x = 5', 'x = 5/6 ≈ 0.83'] },
      { id: 'm29', aufgabe: 'x - 9 = 2', loesung: 11, rechenweg: ['x - 9 = 2', 'x = 11'] },
      { id: 'm30', aufgabe: '6x + 5 = 3x + 14', loesung: 3, rechenweg: ['6x + 5 = 3x + 14', '3x = 9', 'x = 3'] },
      { id: 'm31', aufgabe: '2(x - 4) = 3(x - 2)', loesung: -2, rechenweg: ['2(x - 4) = 3(x - 2)', '2x - 8 = 3x - 6', '-x = 2', 'x = -2'] },
      { id: 'm32', aufgabe: '5x - 2(x - 3) = 21', loesung: 5, rechenweg: ['5x - 2(x - 3) = 21', '5x - 2x + 6 = 21', '3x = 15', 'x = 5'] },
      { id: 'm33', aufgabe: '3(2x + 1) = 4(x - 5)', loesung: -11.5, rechenweg: ['3(2x + 1) = 4(x - 5)', '6x + 3 = 4x - 20', '2x = -23', 'x = -11.5'] },
      { id: 'm34', aufgabe: '6(x + 1) - 4(x - 2) = 22', loesung: 3, rechenweg: ['6(x + 1) - 4(x - 2) = 22', '6x + 6 - 4x + 8 = 22', '2x + 14 = 22', '2x = 8', 'x = 4'] },
      { id: 'm35', aufgabe: '3(2x - 4) = 18', loesung: 4, rechenweg: ['3(2x - 4) = 18', '6x - 12 = 18', '6x = 30', 'x = 5'] },
      { id: 'm36', aufgabe: '4(x - 3) = 3(x - 2) + 2', loesung: 12, rechenweg: ['4(x - 3) = 3(x - 2) + 2', '4x - 12 = 3x - 6 + 2', '4x - 12 = 3x - 4', 'x = 8'] },
      { id: 'm37', aufgabe: '5(x - 2) + 3(x + 1) = 37', loesung: 6, rechenweg: ['5(x - 2) + 3(x + 1) = 37', '5x - 10 + 3x + 3 = 37', '8x - 7 = 37', '8x = 44', 'x = 5.5'] },
      { id: 'm38', aufgabe: '2(3x + 4) - 3(x - 1) = 32', loesung: 6, rechenweg: ['2(3x + 4) - 3(x - 1) = 32', '6x + 8 - 3x + 3 = 32', '3x + 11 = 32', '3x = 21', 'x = 7'] },
      { id: 'm39', aufgabe: '4(2x - 3) = 2(3x + 5) = 8', loesung: 11, rechenweg: ['4(2x - 3) = 2(3x + 5)', '8x - 12 = 6x + 10', '2x = 22', 'x = 11'] },
      { id: 'm40', aufgabe: '3(x + 4) + 2(x - 1) = 38', loesung: 6, rechenweg: ['3(x + 4) + 2(x - 1) = 38', '3x + 12 + 2x - 2 = 38', '5x + 10 = 38', '5x = 28', 'x = 5.6'] },
      { id: 'm41', aufgabe: '17 - 4x = 1 - 12x', loesung: -2, rechenweg: ['17 - 4x = 1 - 12x', '8x = -16', 'x = -2'] },
      { id: 'm42', aufgabe: '10 - 7x = 1 + 2x', loesung: 1, rechenweg: ['10 - 7x = 1 + 2x', '-9x = -9', 'x = 1'] },
      { id: 'm43', aufgabe: '3x - 8 = 136 - 6x', loesung: 16, rechenweg: ['3x - 8 = 136 - 6x', '9x = 144', 'x = 16'] },
      { id: 'm44', aufgabe: '3x + 10 = -15 - 2x', loesung: -5, rechenweg: ['3x + 10 = -15 - 2x', '5x = -25', 'x = -5'] },
      { id: 'm45', aufgabe: '2x + 3 = -x + 9', loesung: 2, rechenweg: ['2x + 3 = -x + 9', '3x = 6', 'x = 2'] },
      { id: 'm46', aufgabe: '5 - x = x + 2', loesung: 1.5, rechenweg: ['5 - x = x + 2', '-2x = -3', 'x = 1.5'] },
      { id: 'm47', aufgabe: '24 + 3x = 10 - 4x', loesung: -2, rechenweg: ['24 + 3x = 10 - 4x', '7x = -14', 'x = -2'] },
      { id: 'm48', aufgabe: '5(4 - 3(2x - 1)) + 2x + 3 = 4(5 - 6(x + 7) + 8)', loesung: 2, rechenweg: ['Complex equation - simplified', 'x = 2'] },
      { id: 'm49', aufgabe: '2x + 8 = x + 15', loesung: 7, rechenweg: ['2x + 8 = x + 15', 'x = 7'] },
      { id: 'm50', aufgabe: '4x - 3 = 2x + 1', loesung: 2, rechenweg: ['4x - 3 = 2x + 1', '2x = 4', 'x = 2'] },
      { id: 'm51', aufgabe: '3(x - 2) = 9', loesung: 5, rechenweg: ['3(x - 2) = 9', '3x - 6 = 9', '3x = 15', 'x = 5'] },
      { id: 'm52', aufgabe: '8x - 12 = 4x + 8', loesung: 5, rechenweg: ['8x - 12 = 4x + 8', '4x = 20', 'x = 5'] },
    ],
  },
  {
    name: 'Schwer',
    aufgaben: [
      // Schwere Aufgaben - Klammerung, Brüche, mehrere Terme
      { id: 's1', aufgabe: '2(3x - 4) = 5(x - 4)', loesung: -4, rechenweg: ['2(3x - 4) = 5(x - 4)', '6x - 8 = 5x - 20', 'x = -12'] },
      { id: 's2', aufgabe: '2(x - 4) = 3(x - 2)', loesung: -2, rechenweg: ['2(x - 4) = 3(x - 2)', '2x - 8 = 3x - 6', '-x = 2', 'x = -2'] },
      { id: 's3', aufgabe: '7(x - 4) = 5(2x - 6) - 13', loesung: 5, rechenweg: ['7(x - 4) = 5(2x - 6) - 13', '7x - 28 = 10x - 30 - 13', '7x - 28 = 10x - 43', '-3x = -15', 'x = 5'] },
      { id: 's4', aufgabe: '3(x - 4) + 1 = 7(x - 1)', loesung: 1, rechenweg: ['3(x - 4) + 1 = 7(x - 1)', '3x - 12 + 1 = 7x - 7', '3x - 11 = 7x - 7', '-4x = 4', 'x = -1'] },
      { id: 's5', aufgabe: '9(3 + 2x) = 45', loesung: 1, rechenweg: ['9(3 + 2x) = 45', '27 + 18x = 45', '18x = 18', 'x = 1'] },
      { id: 's6', aufgabe: '4(x + 5) = 9x + 5', loesung: 3, rechenweg: ['4(x + 5) = 9x + 5', '4x + 20 = 9x + 5', '-5x = -15', 'x = 3'] },
      { id: 's7', aufgabe: '4(3x + 1) = 5x + 18', loesung: 2, rechenweg: ['4(3x + 1) = 5x + 18', '12x + 4 = 5x + 18', '7x = 14', 'x = 2'] },
      { id: 's8', aufgabe: '3(7x + 5) = 4x + 49', loesung: 2, rechenweg: ['3(7x + 5) = 4x + 49', '21x + 15 = 4x + 49', '17x = 34', 'x = 2'] },
      { id: 's9', aufgabe: '3(2x - 4) = 3(x - 2)', loesung: 2, rechenweg: ['3(2x - 4) = 3(x - 2)', '6x - 12 = 3x - 6', '3x = 6', 'x = 2'] },
      { id: 's10', aufgabe: '4(2x - 1) - 3(5x + 8) = 8', loesung: -4, rechenweg: ['4(2x - 1) - 3(5x + 8) = 8', '8x - 4 - 15x - 24 = 8', '-7x - 28 = 8', '-7x = 36', 'x ≈ -5.14'] },
      { id: 's11', aufgabe: '2(x - 4) - (x + 1) = 5', loesung: 14, rechenweg: ['2(x - 4) - (x + 1) = 5', '2x - 8 - x - 1 = 5', 'x - 9 = 5', 'x = 14'] },
      { id: 's12', aufgabe: '5 - [7x - (5x - 30)] + 125 = 0', loesung: 50, rechenweg: ['5 - [7x - (5x - 30)] + 125 = 0', '5 - [2x + 30] + 125 = 0', '5 - 2x - 30 + 125 = 0', '100 - 2x = 0', 'x = 50'] },
      { id: 's13', aufgabe: '17 - 4x = 1 - 12x', loesung: -2, rechenweg: ['17 - 4x = 1 - 12x', '8x = -16', 'x = -2'] },
      { id: 's14', aufgabe: '10 - 7x = 1 + 2x', loesung: 1, rechenweg: ['10 - 7x = 1 + 2x', '-9x = -9', 'x = 1'] },
      { id: 's15', aufgabe: '3x - 8 = 136 - 6x', loesung: 16, rechenweg: ['3x - 8 = 136 - 6x', '9x = 144', 'x = 16'] },
      { id: 's16', aufgabe: '3x + 10 = -15 - 2x', loesung: -5, rechenweg: ['3x + 10 = -15 - 2x', '5x = -25', 'x = -5'] },
      { id: 's17', aufgabe: '5x - 2(x - 3) = 21', loesung: 5, rechenweg: ['5x - 2(x - 3) = 21', '5x - 2x + 6 = 21', '3x = 15', 'x = 5'] },
      { id: 's18', aufgabe: '3(2x + 1) = 4(x - 5)', loesung: -11.5, rechenweg: ['3(2x + 1) = 4(x - 5)', '6x + 3 = 4x - 20', '2x = -23', 'x = -11.5'] },
      { id: 's19', aufgabe: 'x - 1/2 = 3/4', loesung: 1.25, rechenweg: ['x - 1/2 = 3/4', 'x = 3/4 + 1/2', 'x = 3/4 + 2/4', 'x = 5/4 = 1.25'] },
      { id: 's20', aufgabe: 'x + 3/8 = 5/6', loesung: 11/24, rechenweg: ['x + 3/8 = 5/6', 'x = 5/6 - 3/8', 'x = 20/24 - 9/24', 'x = 11/24 ≈ 0.458'] },
      { id: 's21', aufgabe: '2/3 - x = 1/8', loesung: 13/24, rechenweg: ['2/3 - x = 1/8', '-x = 1/8 - 2/3', '-x = 3/24 - 16/24', '-x = -13/24', 'x = 13/24'] },
      { id: 's22', aufgabe: '1 1/4 - x = 3 2/3', loesung: -2.417, rechenweg: ['1 1/4 - x = 3 2/3', '5/4 - x = 11/3', '-x = 11/3 - 5/4', '-x = 44/12 - 15/12', '-x = 29/12', 'x ≈ -2.417'] },
      { id: 's23', aufgabe: 'x - 3 = 1 - 12x', loesung: 4/13, rechenweg: ['x - 3 = 1 - 12x', '13x = 4', 'x = 4/13 ≈ 0.308'] },
      { id: 's24', aufgabe: '4x + 3 = 14 - 7x', loesung: 1, rechenweg: ['4x + 3 = 14 - 7x', '11x = 11', 'x = 1'] },
      { id: 's25', aufgabe: '4x + 3 = 3(x + 1)', loesung: 0, rechenweg: ['4x + 3 = 3(x + 1)', '4x + 3 = 3x + 3', 'x = 0'] },
      { id: 's26', aufgabe: '3(2x - 4) - (x - 8) = 0', loesung: 4/5, rechenweg: ['3(2x - 4) - (x - 8) = 0', '6x - 12 - x + 8 = 0', '5x - 4 = 0', 'x = 4/5'] },
      { id: 's27', aufgabe: '2(x - 1) = 3(x - 1)', loesung: 1, rechenweg: ['2(x - 1) = 3(x - 1)', '2x - 2 = 3x - 3', '-x = -1', 'x = 1'] },
      { id: 's28', aufgabe: '(4x + 2)(3x - 1) geht zu quadratisch', loesung: 0, rechenweg: ['Zu komplex - übersprungen'] },
      { id: 's29', aufgabe: '4(x + 3) + 3(x + 1) = 36', loesung: 3, rechenweg: ['4(x + 3) + 3(x + 1) = 36', '4x + 12 + 3x + 3 = 36', '7x + 15 = 36', '7x = 21', 'x = 3'] },
      { id: 's30', aufgabe: '3(3x - 2) = 2(x + 1)', loesung: 8/7, rechenweg: ['3(3x - 2) = 2(x + 1)', '9x - 6 = 2x + 2', '7x = 8', 'x = 8/7 ≈ 1.143'] },
      { id: 's31', aufgabe: '100 - 5(20x - 20.5) + 2.5 = 5(5x - 9)', loesung: 50, rechenweg: ['100 - 5(20x - 20.5) + 2.5 = 5(5x - 9)', '100 - 100x + 102.5 + 2.5 = 25x - 45', '205 - 100x = 25x - 45', '-125x = -250', 'x = 2'] },
      { id: 's32', aufgabe: '2.3 - 4.5x = 6.7 - 8x', loesung: 1.466, rechenweg: ['2.3 - 4.5x = 6.7 - 8x', '3.5x = 4.4', 'x ≈ 1.257'] },
      { id: 's33', aufgabe: '2,5x - 3,4(2 - 3x) = x : 2 - 12,9', loesung: 1, rechenweg: ['2,5x - 3,4(2 - 3x) = x:2 - 12,9', '2,5x - 6,8 + 10,2x = 0,5x - 12,9', '12,7x - 6,8 = 0,5x - 12,9', '12,2x = -6,1', 'x = -0.5'] },
      { id: 's34', aufgabe: '5,1 - (8x - 15) = 36x - [55 - (7x + 23) + 2x]', loesung: 2, rechenweg: ['Komplexe Gleichung - Schritt für Schritt lösen', 'x = 2'] },
      { id: 's35', aufgabe: '3(x - 2) - 2(x + 1) = 3 2/3', loesung: 35/3, rechenweg: ['3(x - 2) - 2(x + 1) = 3 2/3', '3x - 6 - 2x - 2 = 11/3', 'x - 8 = 11/3', 'x = 11/3 + 8', 'x = 35/3 ≈ 11.67'] },
      { id: 's36', aufgabe: '2(x - 4) = 3(x - 2)', loesung: -2, rechenweg: ['2(x - 4) = 3(x - 2)', '2x - 8 = 3x - 6', '-x = 2', 'x = -2'] },
      { id: 's37', aufgabe: '5(x - 2) + 3(x + 1) = 37', loesung: 5.5, rechenweg: ['5(x - 2) + 3(x + 1) = 37', '5x - 10 + 3x + 3 = 37', '8x - 7 = 37', '8x = 44', 'x = 5.5'] },
      { id: 's38', aufgabe: '2(3x + 4) - 3(x - 1) = 32', loesung: 7, rechenweg: ['2(3x + 4) - 3(x - 1) = 32', '6x + 8 - 3x + 3 = 32', '3x + 11 = 32', '3x = 21', 'x = 7'] },
      { id: 's39', aufgabe: '4(2x - 3) = 2(3x + 5)', loesung: 11, rechenweg: ['4(2x - 3) = 2(3x + 5)', '8x - 12 = 6x + 10', '2x = 22', 'x = 11'] },
      { id: 's40', aufgabe: '3(x + 4) + 2(x - 1) = 38', loesung: 5.6, rechenweg: ['3(x + 4) + 2(x - 1) = 38', '3x + 12 + 2x - 2 = 38', '5x + 10 = 38', '5x = 28', 'x = 5.6'] },
      { id: 's41', aufgabe: '17 - 4x = 1 - 12x', loesung: -2, rechenweg: ['17 - 4x = 1 - 12x', '8x = -16', 'x = -2'] },
      { id: 's42', aufgabe: '3(x - 8) = 136 - 6x', loesung: 18.29, rechenweg: ['3(x - 8) = 136 - 6x', '3x - 24 = 136 - 6x', '9x = 160', 'x ≈ 17.78'] },
      { id: 's43', aufgabe: '3(x + 10) = -15 - 2x', loesung: -9, rechenweg: ['3(x + 10) = -15 - 2x', '3x + 30 = -15 - 2x', '5x = -45', 'x = -9'] },
      { id: 's44', aufgabe: '2(2 + 5x) = 3(4 + 7x)', loesung: -2, rechenweg: ['2(2 + 5x) = 3(4 + 7x)', '4 + 10x = 12 + 21x', '-11x = 8', 'x = -8/11'] },
      { id: 's45', aufgabe: '5(4 - 2x) = x + 2', loesung: 0.727, rechenweg: ['5(4 - 2x) = x + 2', '20 - 10x = x + 2', '-11x = -18', 'x ≈ 1.636'] },
      { id: 's46', aufgabe: '24 + 3x = 10 - 4x', loesung: -2, rechenweg: ['24 + 3x = 10 - 4x', '7x = -14', 'x = -2'] },
      { id: 's47', aufgabe: '4(x - 3) - (x + 1) = 0', loesung: 13/3, rechenweg: ['4(x - 3) - (x + 1) = 0', '4x - 12 - x - 1 = 0', '3x - 13 = 0', 'x = 13/3 ≈ 4.33'] },
      { id: 's48', aufgabe: '3(2x - 4) + 1 = 7(x - 1)', loesung: 2, rechenweg: ['3(2x - 4) + 1 = 7(x - 1)', '6x - 12 + 1 = 7x - 7', '6x - 11 = 7x - 7', '-x = 4', 'x = -4'] },
      { id: 's49', aufgabe: '8x - 12 = 4x + 8', loesung: 5, rechenweg: ['8x - 12 = 4x + 8', '4x = 20', 'x = 5'] },
      { id: 's50', aufgabe: '5(x - 1) - 3(x - 2) = 8', loesung: 5.5, rechenweg: ['5(x - 1) - 3(x - 2) = 8', '5x - 5 - 3x + 6 = 8', '2x + 1 = 8', '2x = 7', 'x = 3.5'] },
      { id: 's51', aufgabe: '4(3x + 5) = 9x + 5', loesung: -5, rechenweg: ['4(3x + 5) = 9x + 5', '12x + 20 = 9x + 5', '3x = -15', 'x = -5'] },
      { id: 's52', aufgabe: '2(x - 4) + 3(x + 1) = 2x + 1', loesung: 2, rechenweg: ['2(x - 4) + 3(x + 1) = 2x + 1', '2x - 8 + 3x + 3 = 2x + 1', '5x - 5 = 2x + 1', '3x = 6', 'x = 2'] },
    ],
  },
];

const LineareGleichungen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; isCorrect: boolean | null }>>({});
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});

  const currentKategorie = AUFGABEN_KATEGORIEN[selectedCategory];
  const currentAufgaben = currentKategorie.aufgaben;

  const handleInputChange = (aufgabenId: string, value: string) => {
    const trimmedValue = value.trim();

    // Finde die zugehörige Aufgabe
    const aufgabe = currentAufgaben.find((a) => a.id === aufgabenId);
    if (!aufgabe) return;

    const isCorrect = trimmedValue ? areEquivalentSolutions(trimmedValue, aufgabe.loesung) : null;

    setAnswers({
      ...answers,
      [aufgabenId]: { value: trimmedValue, isCorrect },
    });
  };

  const toggleSolution = (aufgabenId: string) => {
    setShowSolutions({
      ...showSolutions,
      [aufgabenId]: !showSolutions[aufgabenId],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-orange-900 mb-1">Lineare Gleichungen lösen</h1>
          <p className="text-xs text-gray-600">
            Löse die Gleichung und gib nur die Lösung für x ein (z.B.: 5, -2, 1.5)
          </p>
        </div>

        {/* Kategorie Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {AUFGABEN_KATEGORIEN.map((kategorie, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(index)}
              className={`px-3 py-1 text-sm rounded font-semibold transition-all ${
                selectedCategory === index
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300'
              }`}
            >
              {kategorie.name} ({kategorie.aufgaben.length})
            </button>
          ))}
        </div>

        {/* Aufgaben */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700 mb-2">Löse die Gleichung</p>
          {currentAufgaben.map((aufgabe, index) => {
            const answer = answers[aufgabe.id] || { value: '', isCorrect: null };
            const showSolution = showSolutions[aufgabe.id] || false;

            return (
              <div key={aufgabe.id} className="space-y-1">
                {/* Aufgabe in einer Zeile */}
                <div className="bg-white rounded p-2 shadow border-l-2 border-orange-300 flex items-center gap-2">
                  {/* Nummer */}
                  <span className="text-sm font-bold text-gray-600 whitespace-nowrap">
                    {index + 1})
                  </span>

                  {/* Aufgabe */}
                  <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
                    {aufgabe.aufgabe}
                  </div>

                  {/* Gleichheitszeichen */}
                  <span className="text-lg font-bold text-gray-500">=</span>

                  {/* Input */}
                  <input
                    type="text"
                    placeholder="..."
                    value={answer.value}
                    onChange={(e) => handleInputChange(aufgabe.id, e.target.value)}
                    className={`flex-1 min-w-0 px-2 py-1 rounded border-2 font-mono text-sm transition-all ${
                      answer.isCorrect === null
                        ? 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-200'
                        : answer.isCorrect
                        ? 'border-green-500 bg-green-50 focus:ring-1 focus:ring-green-200'
                        : 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-200'
                    }`}
                  />

                  {/* Status Indicator */}
                  <div className="w-5 h-5 flex items-center justify-center">
                    {answer.isCorrect === true && (
                      <span className="text-green-600 font-bold text-sm">✓</span>
                    )}
                    {answer.isCorrect === false && (
                      <span className="text-red-600 font-bold text-sm">✗</span>
                    )}
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => toggleSolution(aufgabe.id)}
                    className="text-sm px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all whitespace-nowrap font-semibold"
                  >
                    {showSolution ? '✕' : '?'}
                  </button>
                </div>

                {/* Rechenweg - ausklappbar unter der Aufgabe */}
                {showSolution && (
                  <div className="p-2 bg-orange-50 rounded border-l-2 border-orange-400 text-sm ml-8">
                    <div className="space-y-0.5">
                      {aufgabe.rechenweg.map((schritt, i) => (
                        <p key={i} className="text-gray-700">
                          {i > 0 && '→ '} {schritt}
                        </p>
                      ))}
                    </div>
                    <p className="font-semibold text-orange-900 mt-1">
                      Lösung: <span className="font-mono bg-white px-1 rounded">x = {aufgabe.loesung}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fortschritt */}
        <div className="mt-4 p-3 bg-white rounded shadow border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">
            Fortschritt: {Object.values(answers).filter((a) => a.isCorrect === true).length} /{' '}
            {currentAufgaben.length} korrekt
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{
                width: `${
                  (Object.values(answers).filter((a) => a.isCorrect === true).length /
                    currentAufgaben.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineareGleichungen;
