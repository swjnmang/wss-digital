import React, { useState } from 'react';

// ============================================================================
// INTELLIGENTE VALIDIERUNGSFUNKTION FÜR POTENZEN
// ============================================================================

/**
 * Parst einen Term mit Potenzen in Komponenten
 * z.B. "2x^3 + 3x^2" oder "2x³ + 3x²"
 */
function normalizeExpressionWithPowers(expr: string): Map<string, number> {
  // Normalisiere: entferne Leerzeichen, wandle ³ zu ^3 um, etc.
  expr = expr.replace(/\s+/g, '').toLowerCase();
  
  // Wandle Unicode-Exponenten in ^n um
  expr = expr.replace(/⁰/g, '^0').replace(/¹/g, '^1').replace(/²/g, '^2')
    .replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/⁵/g, '^5')
    .replace(/⁶/g, '^6').replace(/⁷/g, '^7').replace(/⁸/g, '^8')
    .replace(/⁹/g, '^9');
  
  // Normalisiere Multiplikationsschreibweisen
  expr = expr.replace(/([a-z])\^(\d+)/g, (match, variable, power) => {
    return `${variable}^${power}`;
  });

  // Ersetze - mit +- für besseres Splitting
  expr = expr.replace(/^-/, '0-').replace(/-/g, '+-');

  const terms = new Map<string, number>();
  const parts = expr.split('+').filter((p) => p.trim());

  for (const part of parts) {
    let trimmed = part.trim();
    if (!trimmed) continue;

    // Pattern: Koeffizient*Variable^Potenz oder Variable^Potenz
    // z.B. "2x^3", "x^3", "-3x^2"
    let coeffNum = 1;
    let variable = '';
    let power = 0;

    // Match: [±]Zahl*Variable^Zahl
    let match = trimmed.match(/^([+-]?\d*\.?\d+)?\*?([a-z])\^(\d+)$/);
    if (match) {
      const coeff = match[1];
      variable = match[2];
      power = parseInt(match[3]);

      if (coeff === '' || coeff === '+' || coeff === undefined) {
        coeffNum = 1;
      } else if (coeff === '-') {
        coeffNum = -1;
      } else {
        coeffNum = parseFloat(coeff);
      }
    } else {
      // Match: nur Variable oder Zahl
      match = trimmed.match(/^([+-]?\d*\.?\d+)?([a-z])?$/);
      if (match) {
        const coeff = match[1];
        const possibleVar = match[2];

        if (coeff === '' || coeff === '+') {
          coeffNum = 1;
        } else if (coeff === '-') {
          coeffNum = -1;
        } else {
          coeffNum = parseFloat(coeff || '1');
        }

        variable = possibleVar || '';
        power = 0;
      }
    }

    if (isNaN(coeffNum)) continue;

    // Erstelle Schlüssel: "x^3" für x hoch 3, oder "x" für x hoch 0/1
    const key = power > 0 ? `${variable}^${power}` : variable;

    terms.set(key, (terms.get(key) || 0) + coeffNum);
  }

  return terms;
}

/**
 * Vergleicht zwei Ausdrücke auf algebraische Äquivalenz mit Potenzregeln
 */
function areEquivalentWithPowers(input: string, solution: string): boolean {
  try {
    const normalized1 = normalizeExpressionWithPowers(input);
    const normalized2 = normalizeExpressionWithPowers(solution);

    if (normalized1.size !== normalized2.size) return false;

    for (const [variable, coeff] of normalized1) {
      const otherCoeff = normalized2.get(variable);
      if (otherCoeff === undefined) return false;

      // Toleranz für Rundungsfehler
      if (Math.abs(coeff - otherCoeff) > 0.0001) return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================================
// AUFGABEN UND RECHENWEGE
// ============================================================================

interface Aufgabe {
  id: string;
  aufgabe: string;
  loesung: string;
  rechenweg: string[];
}

interface Kategorie {
  name: string;
  aufgaben: Aufgabe[];
}

const AUFGABEN_KATEGORIEN: Kategorie[] = [
  {
    name: 'Potenzen addieren/subtrahieren',
    aufgaben: [
      // Aus Screenshots
      {
        id: 'p1_1',
        aufgabe: '5x² + 3x² - 2x²',
        loesung: '6x²',
        rechenweg: [
          'Alle Terme haben die gleiche Variable und Potenz (x²)',
          'Addiere die Koeffizienten: 5 + 3 - 2 = 6',
          'Ergebnis: 6x²',
        ],
      },
      {
        id: 'p1_2',
        aufgabe: '10a⁴ - 6a⁴ + a⁴',
        loesung: '5a⁴',
        rechenweg: [
          'Alle Terme haben die gleiche Variable und Potenz (a⁴)',
          'Beachte: a⁴ = 1a⁴',
          'Addiere die Koeffizienten: 10 - 6 + 1 = 5',
          'Ergebnis: 5a⁴',
        ],
      },
      {
        id: 'p1_3',
        aufgabe: '7b³ + 2c³ - 4b³ + 5c³',
        loesung: '3b³ + 7c³',
        rechenweg: [
          'Gruppiere nach gleichen Variablen und Potenzen:',
          'b³-Terme: 7b³ - 4b³ = 3b³',
          'c³-Terme: 2c³ + 5c³ = 7c³',
          'Ergebnis: 3b³ + 7c³',
        ],
      },
      {
        id: 'p1_4',
        aufgabe: '8y⁵ - 3y⁵ + 2y⁴ + 6z⁴',
        loesung: '5y⁵ + 2y⁴ + 6z⁴',
        rechenweg: [
          'Gruppiere nach gleichen Variablen und Potenzen:',
          'y⁵-Terme: 8y⁵ - 3y⁵ = 5y⁵',
          'y⁴-Terme: 2y⁴ bleibt 2y⁴',
          'z⁴-Terme: 6z⁴ bleibt 6z⁴',
          'Ergebnis: 5y⁵ + 2y⁴ + 6z⁴',
        ],
      },
      {
        id: 'p1_5',
        aufgabe: '10v² - 12v + 13 + v - v² + 24',
        loesung: '9v² - 11v + 37',
        rechenweg: [
          'Gruppiere nach Potenzen:',
          'v²-Terme: 10v² - v² = 9v²',
          'v-Terme: -12v + v = -11v',
          'Konstanten: 13 + 24 = 37',
          'Ergebnis: 9v² - 11v + 37',
        ],
      },
      {
        id: 'p1_6',
        aufgabe: '2,5x - 10x² + 11x³ - 2,5x + 10x²',
        loesung: '11x³',
        rechenweg: [
          'Gruppiere nach Potenzen:',
          'x³-Terme: 11x³',
          'x²-Terme: -10x² + 10x² = 0',
          'x-Terme: 2,5x - 2,5x = 0',
          'Ergebnis: 11x³',
        ],
      },
      {
        id: 'p1_7',
        aufgabe: '2,1 · 10⁵ + 5,5 · 10⁵ + 8 · 10³',
        loesung: '7.6·10⁵ + 8·10³',
        rechenweg: [
          'Gruppiere nach gleichen Potenzen:',
          '10⁵-Terme: 2,1 · 10⁵ + 5,5 · 10⁵ = 7,6 · 10⁵',
          '10³-Terme: 8 · 10³ bleibt 8 · 10³',
          'Ergebnis: 7,6 · 10⁵ + 8 · 10³',
        ],
      },
      {
        id: 'p1_8',
        aufgabe: 'm · s - t + s² + t² + s',
        loesung: 'ms + s² + t² + s - t',
        rechenweg: [
          'Gruppiere nach Variablen und Potenzen:',
          'ms-Terme: ms',
          's²-Terme: s²',
          't²-Terme: t²',
          's-Terme: s',
          't-Terme: -t',
          'Ergebnis: ms + s² + t² + s - t',
        ],
      },
      {
        id: 'p1_9',
        aufgabe: '10x - 22x² + 10y - 12x² - 0,5y + 22x³',
        loesung: '22x³ - 34x² + 10x + 9.5y',
        rechenweg: [
          'Gruppiere nach Variablen und Potenzen:',
          'x³-Terme: 22x³',
          'x²-Terme: -22x² - 12x² = -34x²',
          'x-Terme: 10x',
          'y-Terme: 10y - 0,5y = 9,5y',
          'Ergebnis: 22x³ - 34x² + 10x + 9,5y',
        ],
      },
      {
        id: 'p1_10',
        aufgabe: '3x³ + 2x - t + s² + t² + s - 7',
        loesung: '3x³ + s² + t² + 2x + s - t - 7',
        rechenweg: [
          'Gruppiere nach Variablen und Potenzen:',
          'x³-Terme: 3x³',
          's²-Terme: s²',
          't²-Terme: t²',
          'x-Terme: 2x',
          's-Terme: s',
          't-Terme: -t',
          'Konstanten: -7',
        ],
      },
      {
        id: 'p1_11',
        aufgabe: '4a³ + 2a³ - 3a³',
        loesung: '3a³',
        rechenweg: ['Kombiniere a³-Terme: 4 + 2 - 3 = 3', 'Ergebnis: 3a³'],
      },
      {
        id: 'p1_12',
        aufgabe: '9b² - 5b² + 2b²',
        loesung: '6b²',
        rechenweg: ['Kombiniere b²-Terme: 9 - 5 + 2 = 6', 'Ergebnis: 6b²'],
      },
      {
        id: 'p1_13',
        aufgabe: 'x⁴ + 3x⁴ - x⁴',
        loesung: '3x⁴',
        rechenweg: ['Kombiniere x⁴-Terme: 1 + 3 - 1 = 3', 'Ergebnis: 3x⁴'],
      },
      {
        id: 'p1_14',
        aufgabe: '5y³ + 2y² - 3y³ + y²',
        loesung: '2y³ + 3y²',
        rechenweg: [
          'y³-Terme: 5y³ - 3y³ = 2y³',
          'y²-Terme: 2y² + y² = 3y²',
          'Ergebnis: 2y³ + 3y²',
        ],
      },
      {
        id: 'p1_15',
        aufgabe: '6m⁵ - 2m⁵ + 4m⁴',
        loesung: '4m⁵ + 4m⁴',
        rechenweg: [
          'm⁵-Terme: 6m⁵ - 2m⁵ = 4m⁵',
          'm⁴-Terme: 4m⁴ bleibt 4m⁴',
          'Ergebnis: 4m⁵ + 4m⁴',
        ],
      },
    ],
  },
  {
    name: 'Potenzen multiplizieren',
    aufgaben: [
      {
        id: 'p2_1',
        aufgabe: 'x² · x³',
        loesung: 'x⁵',
        rechenweg: [
          'Potenzregel: xᵃ · xᵇ = xᵃ⁺ᵇ',
          'Addiere die Exponenten: 2 + 3 = 5',
          'Ergebnis: x⁵',
        ],
      },
      {
        id: 'p2_2',
        aufgabe: 'a⁴ · a²',
        loesung: 'a⁶',
        rechenweg: [
          'Potenzregel: aᵃ · aᵇ = aᵃ⁺ᵇ',
          'Addiere die Exponenten: 4 + 2 = 6',
          'Ergebnis: a⁶',
        ],
      },
      {
        id: 'p2_3',
        aufgabe: '2x³ · 3x²',
        loesung: '6x⁵',
        rechenweg: [
          'Multipliziere die Koeffizienten: 2 · 3 = 6',
          'Potenzregel: x³ · x² = x³⁺² = x⁵',
          'Ergebnis: 6x⁵',
        ],
      },
      {
        id: 'p2_4',
        aufgabe: '5y⁴ · 2y',
        loesung: '10y⁵',
        rechenweg: [
          'Beachte: y = y¹',
          'Multipliziere die Koeffizienten: 5 · 2 = 10',
          'Potenzregel: y⁴ · y¹ = y⁴⁺¹ = y⁵',
          'Ergebnis: 10y⁵',
        ],
      },
      {
        id: 'p2_5',
        aufgabe: '(x²)³',
        loesung: 'x⁶',
        rechenweg: [
          'Potenzregel: (xᵃ)ᵇ = xᵃ·ᵇ',
          'Multipliziere die Exponenten: 2 · 3 = 6',
          'Ergebnis: x⁶',
        ],
      },
      {
        id: 'p2_6',
        aufgabe: '(a³)²',
        loesung: 'a⁶',
        rechenweg: [
          'Potenzregel: (aᵃ)ᵇ = aᵃ·ᵇ',
          'Multipliziere die Exponenten: 3 · 2 = 6',
          'Ergebnis: a⁶',
        ],
      },
      {
        id: 'p2_7',
        aufgabe: '3x² · 4x³ · 2x',
        loesung: '24x⁶',
        rechenweg: [
          'Multipliziere die Koeffizienten: 3 · 4 · 2 = 24',
          'Potenzregel: x² · x³ · x = x²⁺³⁺¹ = x⁶',
          'Ergebnis: 24x⁶',
        ],
      },
      {
        id: 'p2_8',
        aufgabe: 'x² · y³ · x³',
        loesung: 'x⁵y³',
        rechenweg: [
          'Kombiniere gleiche Variablen:',
          'x²-Terme: x² · x³ = x⁵',
          'y³-Terme: y³ bleibt y³',
          'Ergebnis: x⁵y³',
        ],
      },
      {
        id: 'p2_9',
        aufgabe: '(2x)³',
        loesung: '8x³',
        rechenweg: [
          'Potenzregel: (a·b)ⁿ = aⁿ·bⁿ',
          '(2x)³ = 2³ · x³',
          '2³ = 8',
          'Ergebnis: 8x³',
        ],
      },
      {
        id: 'p2_10',
        aufgabe: '(3a²)²',
        loesung: '9a⁴',
        rechenweg: [
          'Potenzregel: (a·b)ⁿ = aⁿ·bⁿ',
          '(3a²)² = 3² · (a²)²',
          '3² = 9 und (a²)² = a⁴',
          'Ergebnis: 9a⁴',
        ],
      },
      {
        id: 'p2_11',
        aufgabe: 'a · a²',
        loesung: 'a³',
        rechenweg: [
          'Beachte: a = a¹',
          'Potenzregel: a¹ · a² = a¹⁺² = a³',
          'Ergebnis: a³',
        ],
      },
      {
        id: 'p2_12',
        aufgabe: 'b³ · b³',
        loesung: 'b⁶',
        rechenweg: [
          'Potenzregel: bᵃ · bᵇ = bᵃ⁺ᵇ',
          'Addiere die Exponenten: 3 + 3 = 6',
          'Ergebnis: b⁶',
        ],
      },
      {
        id: 'p2_13',
        aufgabe: '2x · 3x²',
        loesung: '6x³',
        rechenweg: [
          'Beachte: x = x¹',
          'Multipliziere Koeffizienten: 2 · 3 = 6',
          'Potenzregel: x¹ · x² = x³',
          'Ergebnis: 6x³',
        ],
      },
      {
        id: 'p2_14',
        aufgabe: '(y²)⁴',
        loesung: 'y⁸',
        rechenweg: [
          'Potenzregel: (yᵃ)ᵇ = yᵃ·ᵇ',
          'Multipliziere die Exponenten: 2 · 4 = 8',
          'Ergebnis: y⁸',
        ],
      },
      {
        id: 'p2_15',
        aufgabe: '5c² · 4c³ · c',
        loesung: '20c⁶',
        rechenweg: [
          'Beachte: c = c¹',
          'Multipliziere Koeffizienten: 5 · 4 = 20',
          'Potenzregel: c² · c³ · c¹ = c²⁺³⁺¹ = c⁶',
          'Ergebnis: 20c⁶',
        ],
      },
      {
        id: 'p2_16',
        aufgabe: '(-2x)²',
        loesung: '4x²',
        rechenweg: [
          'Potenzregel: (a·b)ⁿ = aⁿ·bⁿ',
          '(-2x)² = (-2)² · x²',
          '(-2)² = 4',
          'Ergebnis: 4x²',
        ],
      },
      {
        id: 'p2_17',
        aufgabe: '(-a)³',
        loesung: '-a³',
        rechenweg: [
          'Potenzregel: (a·b)ⁿ = aⁿ·bⁿ',
          '(-a)³ = (-1)³ · a³',
          '(-1)³ = -1',
          'Ergebnis: -a³',
        ],
      },
      {
        id: 'p2_18',
        aufgabe: 'x² · x · x³',
        loesung: 'x⁶',
        rechenweg: [
          'Beachte: x = x¹',
          'Potenzregel: x² · x¹ · x³ = x²⁺¹⁺³ = x⁶',
          'Ergebnis: x⁶',
        ],
      },
      {
        id: 'p2_19',
        aufgabe: '2a² · 3a · 5a³',
        loesung: '30a⁶',
        rechenweg: [
          'Beachte: a = a¹',
          'Multipliziere Koeffizienten: 2 · 3 · 5 = 30',
          'Potenzregel: a² · a¹ · a³ = a⁶',
          'Ergebnis: 30a⁶',
        ],
      },
      {
        id: 'p2_20',
        aufgabe: '(x³y²)²',
        loesung: 'x⁶y⁴',
        rechenweg: [
          'Potenzregel: (a·b)ⁿ = aⁿ·bⁿ',
          '(x³y²)² = (x³)² · (y²)²',
          '(x³)² = x⁶ und (y²)² = y⁴',
          'Ergebnis: x⁶y⁴',
        ],
      },
      {
        id: 'p2_21',
        aufgabe: 'm⁴ · m',
        loesung: 'm⁵',
        rechenweg: [
          'Beachte: m = m¹',
          'Potenzregel: m⁴ · m¹ = m⁵',
          'Ergebnis: m⁵',
        ],
      },
      {
        id: 'p2_22',
        aufgabe: '3x³ · x²',
        loesung: '3x⁵',
        rechenweg: [
          'Koeffizient bleibt: 3',
          'Potenzregel: x³ · x² = x⁵',
          'Ergebnis: 3x⁵',
        ],
      },
      {
        id: 'p2_23',
        aufgabe: '(2a)³ · a',
        loesung: '8a⁴',
        rechenweg: [
          'Beachte: a = a¹',
          '(2a)³ = 8a³',
          'Multipliziere: 8a³ · a¹ = 8a⁴',
          'Ergebnis: 8a⁴',
        ],
      },
      {
        id: 'p2_24',
        aufgabe: 'n² · n² · n',
        loesung: 'n⁵',
        rechenweg: [
          'Beachte: n = n¹',
          'Potenzregel: n² · n² · n¹ = n²⁺²⁺¹ = n⁵',
          'Ergebnis: n⁵',
        ],
      },
      {
        id: 'p2_25',
        aufgabe: '((x²)³)²',
        loesung: 'x¹²',
        rechenweg: [
          'Potenzregel: (xᵃ)ᵇ = xᵃ·ᵇ',
          '((x²)³)² = (x⁶)² = x¹²',
          'Oder: 2 · 3 · 2 = 12',
          'Ergebnis: x¹²',
        ],
      },
      {
        id: 'p2_26',
        aufgabe: '6x² · 2x · x³',
        loesung: '12x⁶',
        rechenweg: [
          'Beachte: x = x¹',
          'Multipliziere Koeffizienten: 6 · 2 = 12',
          'Potenzregel: x² · x¹ · x³ = x⁶',
          'Ergebnis: 12x⁶',
        ],
      },
      {
        id: 'p2_27',
        aufgabe: '(-3y)² · y',
        loesung: '9y³',
        rechenweg: [
          'Beachte: y = y¹',
          '(-3y)² = 9y²',
          'Multipliziere: 9y² · y¹ = 9y³',
          'Ergebnis: 9y³',
        ],
      },
      {
        id: 'p2_28',
        aufgabe: 'p³ · p² · p',
        loesung: 'p⁶',
        rechenweg: [
          'Beachte: p = p¹',
          'Potenzregel: p³ · p² · p¹ = p³⁺²⁺¹ = p⁶',
          'Ergebnis: p⁶',
        ],
      },
      {
        id: 'p2_29',
        aufgabe: '(4x²)² · x',
        loesung: '16x⁵',
        rechenweg: [
          'Beachte: x = x¹',
          '(4x²)² = 16x⁴',
          'Multipliziere: 16x⁴ · x¹ = 16x⁵',
          'Ergebnis: 16x⁵',
        ],
      },
      {
        id: 'p2_30',
        aufgabe: 'k² · k⁴ · k',
        loesung: 'k⁷',
        rechenweg: [
          'Beachte: k = k¹',
          'Potenzregel: k² · k⁴ · k¹ = k²⁺⁴⁺¹ = k⁷',
          'Ergebnis: k⁷',
        ],
      },
    ],
  },
  {
    name: 'Potenzen dividieren',
    aufgaben: [
      {
        id: 'p3_1',
        aufgabe: 'x⁵ : x²',
        loesung: 'x³',
        rechenweg: [
          'Potenzregel: xᵃ : xᵇ = xᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 5 - 2 = 3',
          'Ergebnis: x³',
        ],
      },
      {
        id: 'p3_2',
        aufgabe: 'a⁶ : a²',
        loesung: 'a⁴',
        rechenweg: [
          'Potenzregel: aᵃ : aᵇ = aᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 6 - 2 = 4',
          'Ergebnis: a⁴',
        ],
      },
      {
        id: 'p3_3',
        aufgabe: '6x⁵ : 2x²',
        loesung: '3x³',
        rechenweg: [
          'Dividiere die Koeffizienten: 6 : 2 = 3',
          'Potenzregel: x⁵ : x² = x⁵⁻² = x³',
          'Ergebnis: 3x³',
        ],
      },
      {
        id: 'p3_4',
        aufgabe: '10y⁶ : 5y',
        loesung: '2y⁵',
        rechenweg: [
          'Beachte: y = y¹',
          'Dividiere die Koeffizienten: 10 : 5 = 2',
          'Potenzregel: y⁶ : y¹ = y⁶⁻¹ = y⁵',
          'Ergebnis: 2y⁵',
        ],
      },
      {
        id: 'p3_5',
        aufgabe: 'x⁶ / x³',
        loesung: 'x³',
        rechenweg: [
          'Potenzregel: xᵃ : xᵇ = xᵃ⁻ᵇ (oder xᵃ/xᵇ)',
          'Subtrahiere die Exponenten: 6 - 3 = 3',
          'Ergebnis: x³',
        ],
      },
      {
        id: 'p3_6',
        aufgabe: 'a⁷ / a⁴',
        loesung: 'a³',
        rechenweg: [
          'Potenzregel: aᵃ / aᵇ = aᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 7 - 4 = 3',
          'Ergebnis: a³',
        ],
      },
      {
        id: 'p3_7',
        aufgabe: '12x⁸ : 4x⁵',
        loesung: '3x³',
        rechenweg: [
          'Dividiere die Koeffizienten: 12 : 4 = 3',
          'Potenzregel: x⁸ : x⁵ = x⁸⁻⁵ = x³',
          'Ergebnis: 3x³',
        ],
      },
      {
        id: 'p3_8',
        aufgabe: 'x⁴y⁵ : x²y²',
        loesung: 'x²y³',
        rechenweg: [
          'Dividiere gleiche Variablen getrennt:',
          'x⁴ : x² = x²',
          'y⁵ : y² = y³',
          'Ergebnis: x²y³',
        ],
      },
      {
        id: 'p3_9',
        aufgabe: '(x⁶) : (x²)',
        loesung: 'x⁴',
        rechenweg: [
          'Potenzregel: xᵃ : xᵇ = xᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 6 - 2 = 4',
          'Ergebnis: x⁴',
        ],
      },
      {
        id: 'p3_10',
        aufgabe: '8a⁶ : 4a²',
        loesung: '2a⁴',
        rechenweg: [
          'Dividiere die Koeffizienten: 8 : 4 = 2',
          'Potenzregel: a⁶ : a² = a⁴',
          'Ergebnis: 2a⁴',
        ],
      },
      {
        id: 'p3_11',
        aufgabe: 'b⁵ : b',
        loesung: 'b⁴',
        rechenweg: [
          'Beachte: b = b¹',
          'Potenzregel: b⁵ : b¹ = b⁵⁻¹ = b⁴',
          'Ergebnis: b⁴',
        ],
      },
      {
        id: 'p3_12',
        aufgabe: 'x⁷ : x⁷',
        loesung: 'x⁰ = 1',
        rechenweg: [
          'Potenzregel: xᵃ : xᵃ = x⁰ = 1',
          'Subtrahiere die Exponenten: 7 - 7 = 0',
          'Ergebnis: x⁰ oder 1',
        ],
      },
      {
        id: 'p3_13',
        aufgabe: '15x⁴ : 3x',
        loesung: '5x³',
        rechenweg: [
          'Beachte: x = x¹',
          'Dividiere die Koeffizienten: 15 : 3 = 5',
          'Potenzregel: x⁴ : x¹ = x³',
          'Ergebnis: 5x³',
        ],
      },
      {
        id: 'p3_14',
        aufgabe: 'm⁸ : m³',
        loesung: 'm⁵',
        rechenweg: [
          'Potenzregel: mᵃ : mᵇ = mᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 8 - 3 = 5',
          'Ergebnis: m⁵',
        ],
      },
      {
        id: 'p3_15',
        aufgabe: '20y⁹ : 4y⁶',
        loesung: '5y³',
        rechenweg: [
          'Dividiere die Koeffizienten: 20 : 4 = 5',
          'Potenzregel: y⁹ : y⁶ = y³',
          'Ergebnis: 5y³',
        ],
      },
      {
        id: 'p3_16',
        aufgabe: '-8x⁵ : 2x²',
        loesung: '-4x³',
        rechenweg: [
          'Dividiere die Koeffizienten: -8 : 2 = -4',
          'Potenzregel: x⁵ : x² = x³',
          'Ergebnis: -4x³',
        ],
      },
      {
        id: 'p3_17',
        aufgabe: 'n⁶ : n²',
        loesung: 'n⁴',
        rechenweg: [
          'Potenzregel: nᵃ : nᵇ = nᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 6 - 2 = 4',
          'Ergebnis: n⁴',
        ],
      },
      {
        id: 'p3_18',
        aufgabe: '18a⁷ : 6a³',
        loesung: '3a⁴',
        rechenweg: [
          'Dividiere die Koeffizienten: 18 : 6 = 3',
          'Potenzregel: a⁷ : a³ = a⁴',
          'Ergebnis: 3a⁴',
        ],
      },
      {
        id: 'p3_19',
        aufgabe: 'p¹⁰ : p⁵',
        loesung: 'p⁵',
        rechenweg: [
          'Potenzregel: pᵃ : pᵇ = pᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 10 - 5 = 5',
          'Ergebnis: p⁵',
        ],
      },
      {
        id: 'p3_20',
        aufgabe: '24x⁶ : 8x²',
        loesung: '3x⁴',
        rechenweg: [
          'Dividiere die Koeffizienten: 24 : 8 = 3',
          'Potenzregel: x⁶ : x² = x⁴',
          'Ergebnis: 3x⁴',
        ],
      },
      {
        id: 'p3_21',
        aufgabe: 'z⁴ : z',
        loesung: 'z³',
        rechenweg: [
          'Beachte: z = z¹',
          'Potenzregel: z⁴ : z¹ = z³',
          'Ergebnis: z³',
        ],
      },
      {
        id: 'p3_22',
        aufgabe: '9b⁸ : 3b⁴',
        loesung: '3b⁴',
        rechenweg: [
          'Dividiere die Koeffizienten: 9 : 3 = 3',
          'Potenzregel: b⁸ : b⁴ = b⁴',
          'Ergebnis: 3b⁴',
        ],
      },
      {
        id: 'p3_23',
        aufgabe: 'x⁹ : x⁴',
        loesung: 'x⁵',
        rechenweg: [
          'Potenzregel: xᵃ : xᵇ = xᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 9 - 4 = 5',
          'Ergebnis: x⁵',
        ],
      },
      {
        id: 'p3_24',
        aufgabe: '32y⁷ : 4y³',
        loesung: '8y⁴',
        rechenweg: [
          'Dividiere die Koeffizienten: 32 : 4 = 8',
          'Potenzregel: y⁷ : y³ = y⁴',
          'Ergebnis: 8y⁴',
        ],
      },
      {
        id: 'p3_25',
        aufgabe: 'a¹² : a⁸',
        loesung: 'a⁴',
        rechenweg: [
          'Potenzregel: aᵃ : aᵇ = aᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 12 - 8 = 4',
          'Ergebnis: a⁴',
        ],
      },
      {
        id: 'p3_26',
        aufgabe: '14x⁵ : 7x²',
        loesung: '2x³',
        rechenweg: [
          'Dividiere die Koeffizienten: 14 : 7 = 2',
          'Potenzregel: x⁵ : x² = x³',
          'Ergebnis: 2x³',
        ],
      },
      {
        id: 'p3_27',
        aufgabe: '-12m⁶ : 3m²',
        loesung: '-4m⁴',
        rechenweg: [
          'Dividiere die Koeffizienten: -12 : 3 = -4',
          'Potenzregel: m⁶ : m² = m⁴',
          'Ergebnis: -4m⁴',
        ],
      },
      {
        id: 'p3_28',
        aufgabe: 'r¹¹ : r⁶',
        loesung: 'r⁵',
        rechenweg: [
          'Potenzregel: rᵃ : rᵇ = rᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 11 - 6 = 5',
          'Ergebnis: r⁵',
        ],
      },
      {
        id: 'p3_29',
        aufgabe: '28c⁸ : 7c³',
        loesung: '4c⁵',
        rechenweg: [
          'Dividiere die Koeffizienten: 28 : 7 = 4',
          'Potenzregel: c⁸ : c³ = c⁵',
          'Ergebnis: 4c⁵',
        ],
      },
      {
        id: 'p3_30',
        aufgabe: 'v⁷ : v²',
        loesung: 'v⁵',
        rechenweg: [
          'Potenzregel: vᵃ : vᵇ = vᵃ⁻ᵇ',
          'Subtrahiere die Exponenten: 7 - 2 = 5',
          'Ergebnis: v⁵',
        ],
      },
    ],
  },
];

// ============================================================================
// HAUPTKOMPONENTE
// ============================================================================

const TermeMitPotenzen: React.FC = () => {
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

    const isCorrect = trimmedValue ? areEquivalentWithPowers(trimmedValue, aufgabe.loesung) : null;

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
          <h1 className="text-2xl font-bold text-orange-900 mb-1">Terme mit Potenzen</h1>
          <p className="text-xs text-gray-600">
            Wähle eine Kategorie und vereinfache die Terme. Tippe deine Antwort ein und überprüfe automatisch!
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
              {kategorie.name}
            </button>
          ))}
        </div>

        {/* Aufgaben */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700 mb-2">Vereinfache die Terme</p>
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
                      Lösung: <span className="font-mono bg-white px-1 rounded">{aufgabe.loesung}</span>
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

export default TermeMitPotenzen;
