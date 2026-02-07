import React, { useState } from 'react';

// ============================================================================
// VALIDIERUNGSFUNKTION FÜR ALGEBRAISCHE ÄQUIVALENZ
// ============================================================================

interface Term {
  coefficient: number;
  variable: string;
}

/**
 * Parst einen vereinfachten Term in seine Komponenten
 * z.B. "2x" -> { coefficient: 2, variable: "x" }
 * z.B. "3xy" -> { coefficient: 3, variable: "xy" }
 */
function parseSimpleTerm(term: string): Term[] {
  const result: Term[] = [];
  const regex = /([+-]?\d*\.?\d*)([a-z]*)/gi;
  let match;

  while ((match = regex.exec(term)) !== null) {
    if (match[0].trim() === '') continue;

    let coeff = match[1];
    const variable = match[2] || '';

    if (coeff === '' || coeff === '+') coeff = '1';
    if (coeff === '-') coeff = '-1';

    const coeffNum = parseFloat(coeff);
    if (!isNaN(coeffNum)) {
      result.push({ coefficient: coeffNum, variable });
    }
  }

  return result;
}

/**
 * Normalisiert einen Ausdruck durch:
 * 1. Splitting bei + und -
 * 2. Kombinieren von gleichartigen Termen
 * 3. Sortieren der Variablen alphabetisch
 * 4. Normalisierung verschiedener Schreibweisen (4y, y4, 4*y, y*4)
 */
function normalizeExpression(expr: string): Map<string, number> {
  // Entferne Leerzeichen und normalisiere
  expr = expr.replace(/\s+/g, '').toLowerCase();
  
  // Normalisiere verschiedene Multiplikationsschreibweisen
  // z.B. "y4" -> "4*y", "y*4" -> "4*y"
  expr = expr.replace(/(\d+)\*([a-z]+)/g, '$1*$2'); // 4*y bleibt 4*y
  expr = expr.replace(/([a-z]+)\*(\d+)/g, '$2*$1'); // y*4 -> 4*y
  expr = expr.replace(/([a-z])(\d+)(?![*])/g, '$2*$1'); // y4 -> 4*y (wenn kein * danach)
  expr = expr.replace(/(\d+)([a-z])(?![*])/g, '$1*$2'); // 4y -> 4*y (wenn kein * danach)
  
  // Ersetze - mit +- für besseres Splitting
  expr = expr.replace(/^-/, '0-').replace(/-/g, '+-');

  // Initialisiere Map für Terme
  const terms = new Map<string, number>();

  // Teile den Ausdruck in Teile auf (mit +)
  const parts = expr.split('+').filter((p) => p.trim());

  for (const part of parts) {
    let trimmed = part.trim();
    if (!trimmed) continue;

    // Extrahiere Koeffizient und Variable(n)
    // Behandle sowohl "4*y" als auch "4" oder "y"
    let coeffNum = 1;
    let variable = '';

    // Versuche das Pattern "koeff*variable" oder "variable*koeff" zu matchen
    let match = trimmed.match(/^([+-]?\d*\.?\d+)\*([a-z]+)$/);
    if (match) {
      coeffNum = parseFloat(match[1]);
      variable = match[2];
    } else {
      // Versuche nur Koeffizient oder Variable
      match = trimmed.match(/^([+-]?\d*\.?\d+)(.*)$/);
      if (match) {
        const coeff = match[1];
        const possibleVar = match[2] || '';

        if (coeff === '' || coeff === '+') {
          coeffNum = 1;
        } else if (coeff === '-') {
          coeffNum = -1;
        } else {
          coeffNum = parseFloat(coeff);
        }

        variable = possibleVar;
      } else {
        // Nur Variable, z.B. "x" oder "-x"
        if (trimmed.startsWith('-')) {
          coeffNum = -1;
          variable = trimmed.substring(1);
        } else {
          coeffNum = 1;
          variable = trimmed;
        }
      }
    }

    if (isNaN(coeffNum)) continue;

    // Sortiere Variablen alphabetisch und normalisiere
    const sortedVariable = variable
      .replace(/\d/g, '') // Entferne Zahlen
      .split('')
      .sort()
      .join('');

    // Addiere zum bestehenden Term
    terms.set(sortedVariable, (terms.get(sortedVariable) || 0) + coeffNum);
  }

  return terms;
}

/**
 * Vergleicht zwei Ausdrücke auf algebraische Äquivalenz
 * 2x+3y === 3y+2x (beide sind korrekt)
 * 2x+3y !== 2x+3z (unterschiedlich)
 */
function areEquivalent(input: string, solution: string): boolean {
  try {
    const normalized1 = normalizeExpression(input);
    const normalized2 = normalizeExpression(solution);

    if (normalized1.size !== normalized2.size) return false;

    for (const [variable, coeff] of normalized1) {
      const otherCoeff = normalized2.get(variable);
      if (otherCoeff === undefined) return false;

      // Toleranz für Rundungsfehler (0.0001)
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
    name: 'Terme vereinfachen',
    aufgaben: [
      // Aus Screenshots
      {
        id: 't1_1',
        aufgabe: 'y + y + y + y',
        loesung: '4y',
        rechenweg: [
          'Zähle die gleichen Variablen:',
          '1y + 1y + 1y + 1y',
          'Addiere die Koeffizienten: 1 + 1 + 1 + 1 = 4',
          'Ergebnis: 4y',
        ],
      },
      {
        id: 't1_2',
        aufgabe: 'a + a + a',
        loesung: '3a',
        rechenweg: [
          'Zähle die gleichen Variablen:',
          '1a + 1a + 1a',
          'Addiere die Koeffizienten: 1 + 1 + 1 = 3',
          'Ergebnis: 3a',
        ],
      },
      {
        id: 't1_3',
        aufgabe: 'b + b + 2·b',
        loesung: '4b',
        rechenweg: [
          'Schreibe alle Terme mit Koeffizienten:',
          '1b + 1b + 2b',
          'Addiere die Koeffizienten: 1 + 1 + 2 = 4',
          'Ergebnis: 4b',
        ],
      },
      {
        id: 't1_4',
        aufgabe: '2·x + 3·x + 4·x',
        loesung: '9x',
        rechenweg: [
          'Addiere die Koeffizienten der gleichen Variablen:',
          '2 + 3 + 4 = 9',
          'Ergebnis: 9x',
        ],
      },
      {
        id: 't1_5',
        aufgabe: 'r + 2·r - 13·r',
        loesung: '-10r',
        rechenweg: [
          'Schreibe alle Terme aus:',
          '1r + 2r - 13r',
          'Addiere die Koeffizienten: 1 + 2 - 13 = -10',
          'Ergebnis: -10r',
        ],
      },
      {
        id: 't1_6',
        aufgabe: '180·y - 33·y',
        loesung: '147y',
        rechenweg: [
          'Subtrahiere die Koeffizienten:',
          '180 - 33 = 147',
          'Ergebnis: 147y',
        ],
      },
      {
        id: 't1_7',
        aufgabe: 'b + c + b + c',
        loesung: '2b + 2c',
        rechenweg: [
          'Gruppiere die gleichen Variablen:',
          '(b + b) + (c + c)',
          'Vereinfache: 2b + 2c',
          'Ergebnis: 2b + 2c',
        ],
      },
      {
        id: 't1_8',
        aufgabe: '10·x - 4,5·x',
        loesung: '5.5x',
        rechenweg: [
          'Subtrahiere die Koeffizienten:',
          '10 - 4,5 = 5,5',
          'Ergebnis: 5,5x',
        ],
      },
      {
        id: 't1_9',
        aufgabe: '-12,5·t + 7,3·t',
        loesung: '-5.2t',
        rechenweg: [
          'Addiere die Koeffizienten (beachte die Vorzeichen):',
          '-12,5 + 7,3 = -5,2',
          'Ergebnis: -5,2t',
        ],
      },
      {
        id: 't1_10',
        aufgabe: '-1,6·q - 4,5·q',
        loesung: '-6.1q',
        rechenweg: [
          'Addiere die negativen Koeffizienten:',
          '-1,6 - 4,5 = -6,1',
          'Ergebnis: -6,1q',
        ],
      },
      {
        id: 't1_11',
        aufgabe: '3,2·x - 3,2·x',
        loesung: '0',
        rechenweg: [
          'Subtrahiere die Koeffizienten:',
          '3,2 - 3,2 = 0',
          'Ergebnis: 0',
        ],
      },
      {
        id: 't1_12',
        aufgabe: '5·x - x',
        loesung: '4x',
        rechenweg: [
          'Beachte: x = 1x',
          '5x - 1x',
          'Subtrahiere: 5 - 1 = 4',
          'Ergebnis: 4x',
        ],
      },
      {
        id: 't1_13',
        aufgabe: '7·y + 2·y - 3·y',
        loesung: '6y',
        rechenweg: [
          'Addiere/subtrahiere die Koeffizienten der Reihe nach:',
          '7 + 2 - 3 = 6',
          'Ergebnis: 6y',
        ],
      },
      {
        id: 't1_14',
        aufgabe: 'a + 2·a - a',
        loesung: '2a',
        rechenweg: [
          'Kombiniere die Koeffizienten:',
          '1 + 2 - 1 = 2',
          'Ergebnis: 2a',
        ],
      },
      {
        id: 't1_15',
        aufgabe: '6·m + 3·m + m',
        loesung: '10m',
        rechenweg: [
          'Beachte: m = 1m',
          '6m + 3m + 1m',
          'Addiere: 6 + 3 + 1 = 10',
          'Ergebnis: 10m',
        ],
      },
      {
        id: 't1_16',
        aufgabe: '15·n - 7·n - 3·n',
        loesung: '5n',
        rechenweg: [
          'Kombiniere die Koeffizienten:',
          '15 - 7 - 3 = 5',
          'Ergebnis: 5n',
        ],
      },
      {
        id: 't1_17',
        aufgabe: 'p - p + 4·p',
        loesung: '4p',
        rechenweg: [
          'Beachte: p = 1p',
          '1p - 1p + 4p',
          'Kombiniere: 1 - 1 + 4 = 4',
          'Ergebnis: 4p',
        ],
      },
      {
        id: 't1_18',
        aufgabe: '2·a + a + 3·a',
        loesung: '6a',
        rechenweg: [
          'Beachte: a = 1a',
          '2a + 1a + 3a',
          'Addiere: 2 + 1 + 3 = 6',
          'Ergebnis: 6a',
        ],
      },
      {
        id: 't1_19',
        aufgabe: '9·x - 2·x - x',
        loesung: '6x',
        rechenweg: [
          'Beachte: x = 1x',
          '9x - 2x - 1x',
          'Kombiniere: 9 - 2 - 1 = 6',
          'Ergebnis: 6x',
        ],
      },
      {
        id: 't1_20',
        aufgabe: '0,5·k + 1,5·k',
        loesung: '2k',
        rechenweg: [
          'Addiere die Dezimalkoeffizienten:',
          '0,5 + 1,5 = 2',
          'Ergebnis: 2k',
        ],
      },
      {
        id: 't1_21',
        aufgabe: '10·t - 3·t - 2·t',
        loesung: '5t',
        rechenweg: [
          'Kombiniere die Koeffizienten:',
          '10 - 3 - 2 = 5',
          'Ergebnis: 5t',
        ],
      },
      {
        id: 't1_22',
        aufgabe: 'b + 3·b + 2·b',
        loesung: '6b',
        rechenweg: [
          'Beachte: b = 1b',
          '1b + 3b + 2b',
          'Addiere: 1 + 3 + 2 = 6',
          'Ergebnis: 6b',
        ],
      },
      {
        id: 't1_23',
        aufgabe: '7·c - 4·c + c',
        loesung: '4c',
        rechenweg: [
          'Beachte: c = 1c',
          '7c - 4c + 1c',
          'Kombiniere: 7 - 4 + 1 = 4',
          'Ergebnis: 4c',
        ],
      },
      {
        id: 't1_24',
        aufgabe: '12·u + 8·u - 15·u',
        loesung: '5u',
        rechenweg: [
          'Kombiniere die Koeffizienten:',
          '12 + 8 - 15 = 5',
          'Ergebnis: 5u',
        ],
      },
      {
        id: 't1_25',
        aufgabe: '3·v - v - v',
        loesung: 'v',
        rechenweg: [
          'Beachte: v = 1v',
          '3v - 1v - 1v',
          'Kombiniere: 3 - 1 - 1 = 1',
          'Ergebnis: v oder 1v',
        ],
      },
      {
        id: 't1_26',
        aufgabe: '6·w + 2·w + w',
        loesung: '9w',
        rechenweg: [
          'Beachte: w = 1w',
          '6w + 2w + 1w',
          'Addiere: 6 + 2 + 1 = 9',
          'Ergebnis: 9w',
        ],
      },
      {
        id: 't1_27',
        aufgabe: '4·s - 2·s - s',
        loesung: 's',
        rechenweg: [
          'Beachte: s = 1s',
          '4s - 2s - 1s',
          'Kombiniere: 4 - 2 - 1 = 1',
          'Ergebnis: s oder 1s',
        ],
      },
      {
        id: 't1_28',
        aufgabe: '8·d + d - 3·d',
        loesung: '6d',
        rechenweg: [
          'Beachte: d = 1d',
          '8d + 1d - 3d',
          'Kombiniere: 8 + 1 - 3 = 6',
          'Ergebnis: 6d',
        ],
      },
      {
        id: 't1_29',
        aufgabe: '2·f + 5·f - 3·f',
        loesung: '4f',
        rechenweg: [
          'Kombiniere die Koeffizienten:',
          '2 + 5 - 3 = 4',
          'Ergebnis: 4f',
        ],
      },
      {
        id: 't1_30',
        aufgabe: '9·g - 6·g + 2·g',
        loesung: '5g',
        rechenweg: [
          'Kombiniere die Koeffizienten:',
          '9 - 6 + 2 = 5',
          'Ergebnis: 5g',
        ],
      },
      {
        id: 't1_31',
        aufgabe: '11·h - 5·h - h',
        loesung: '5h',
        rechenweg: [
          'Beachte: h = 1h',
          '11h - 5h - 1h',
          'Kombiniere: 11 - 5 - 1 = 5',
          'Ergebnis: 5h',
        ],
      },
      {
        id: 't1_32',
        aufgabe: 'j + 2·j + 4·j - 2·j',
        loesung: '5j',
        rechenweg: [
          'Beachte: j = 1j',
          '1j + 2j + 4j - 2j',
          'Kombiniere: 1 + 2 + 4 - 2 = 5',
          'Ergebnis: 5j',
        ],
      },
    ],
  },
  {
    name: 'Terme multiplizieren/dividieren',
    aufgaben: [
      // Aus Screenshots
      {
        id: 't2_1',
        aufgabe: '6y · 8',
        loesung: '48y',
        rechenweg: [
          'Multipliziere den Koeffizienten mit der Zahl:',
          '6 · 8 = 48',
          'Behalte die Variable bei: y',
          'Ergebnis: 48y',
        ],
      },
      {
        id: 't2_2',
        aufgabe: '12a : 3',
        loesung: '4a',
        rechenweg: [
          'Dividiere den Koeffizienten durch die Zahl:',
          '12 : 3 = 4',
          'Behalte die Variable bei: a',
          'Ergebnis: 4a',
        ],
      },
      {
        id: 't2_3',
        aufgabe: '7 · 12x',
        loesung: '84x',
        rechenweg: [
          'Multipliziere die Zahlen:',
          '7 · 12 = 84',
          'Behalte die Variable bei: x',
          'Ergebnis: 84x',
        ],
      },
      {
        id: 't2_4',
        aufgabe: '15b · a',
        loesung: '15ab',
        rechenweg: [
          'Multipliziere alle Variablen zusammen:',
          'b · a = ab',
          'Behalte den Koeffizienten bei: 15',
          'Ergebnis: 15ab',
        ],
      },
      {
        id: 't2_5',
        aufgabe: '12x · 12y',
        loesung: '144xy',
        rechenweg: [
          'Multipliziere die Koeffizienten:',
          '12 · 12 = 144',
          'Multipliziere die Variablen:',
          'x · y = xy',
          'Ergebnis: 144xy',
        ],
      },
      {
        id: 't2_6',
        aufgabe: '2 · 3b · a',
        loesung: '6ab',
        rechenweg: [
          'Multipliziere alle Zahlen:',
          '2 · 3 = 6',
          'Multipliziere die Variablen:',
          'b · a = ab',
          'Ergebnis: 6ab',
        ],
      },
      {
        id: 't2_7',
        aufgabe: '4r · 3s : 2',
        loesung: '6rs',
        rechenweg: [
          'Multipliziere zuerst die Koeffizienten:',
          '4 · 3 = 12',
          'Dividiere dann durch 2:',
          '12 : 2 = 6',
          'Multipliziere die Variablen:',
          'r · s = rs',
          'Ergebnis: 6rs',
        ],
      },
      {
        id: 't2_8',
        aufgabe: '8p · 7 · 3q',
        loesung: '168pq',
        rechenweg: [
          'Multipliziere alle Koeffizienten:',
          '8 · 7 · 3 = 168',
          'Multipliziere die Variablen:',
          'p · q = pq',
          'Ergebnis: 168pq',
        ],
      },
      {
        id: 't2_9',
        aufgabe: '10z · 2',
        loesung: '20z',
        rechenweg: [
          'Multipliziere den Koeffizienten mit der Zahl:',
          '10 · 2 = 20',
          'Behalte die Variable bei: z',
          'Ergebnis: 20z',
        ],
      },
      {
        id: 't2_10',
        aufgabe: '4a · 3f',
        loesung: '12af',
        rechenweg: [
          'Multipliziere die Koeffizienten:',
          '4 · 3 = 12',
          'Multipliziere die Variablen:',
          'a · f = af',
          'Ergebnis: 12af',
        ],
      },
      {
        id: 't2_11',
        aufgabe: '17q · 2s',
        loesung: '34qs',
        rechenweg: [
          'Multipliziere die Koeffizienten:',
          '17 · 2 = 34',
          'Multipliziere die Variablen:',
          'q · s = qs',
          'Ergebnis: 34qs',
        ],
      },
      {
        id: 't2_12',
        aufgabe: '5c · 5d',
        loesung: '25cd',
        rechenweg: [
          'Multipliziere die Koeffizienten:',
          '5 · 5 = 25',
          'Multipliziere die Variablen:',
          'c · d = cd',
          'Ergebnis: 25cd',
        ],
      },
      {
        id: 't2_13',
        aufgabe: '8k · ½',
        loesung: '4k',
        rechenweg: [
          'Multipliziere den Koeffizienten mit dem Bruch:',
          '8 · ½ = 4',
          'Behalte die Variable bei: k',
          'Ergebnis: 4k',
        ],
      },
      {
        id: 't2_14',
        aufgabe: '9l · 3m',
        loesung: '27lm',
        rechenweg: [
          'Multipliziere die Koeffizienten:',
          '9 · 3 = 27',
          'Multipliziere die Variablen:',
          'l · m = lm',
          'Ergebnis: 27lm',
        ],
      },
      {
        id: 't2_15',
        aufgabe: '8u · 4v',
        loesung: '32uv',
        rechenweg: [
          'Multipliziere die Koeffizienten:',
          '8 · 4 = 32',
          'Multipliziere die Variablen:',
          'u · v = uv',
          'Ergebnis: 32uv',
        ],
      },
      {
        id: 't2_16',
        aufgabe: '11s · 2r',
        loesung: '22rs',
        rechenweg: [
          'Multipliziere die Koeffizienten:',
          '11 · 2 = 22',
          'Multipliziere die Variablen:',
          's · r = sr (oder rs)',
          'Ergebnis: 22sr oder 22rs',
        ],
      },
      {
        id: 't2_17',
        aufgabe: '2l · ⅜l · ½k',
        loesung: '3/16 lk',
        rechenweg: [
          'Multipliziere die Koeffizienten (inkl. Brüche):',
          '2 · ⅜ · ½ = 2 · 3/8 · 1/2 = 6/16 = 3/8',
          'Multipliziere die Variablen:',
          'l · l · k = l²k',
          'Ergebnis: ⅜l²k oder 3/8 l²k',
        ],
      },
      {
        id: 't2_18',
        aufgabe: '10ab · 5c · 3',
        loesung: '150abc',
        rechenweg: [
          'Multipliziere alle Koeffizienten:',
          '10 · 5 · 3 = 150',
          'Multipliziere die Variablen:',
          'ab · c = abc',
          'Ergebnis: 150abc',
        ],
      },
      {
        id: 't2_19',
        aufgabe: '20e · ¼f · 5',
        loesung: '25ef',
        rechenweg: [
          'Multipliziere die Koeffizienten:',
          '20 · ¼ · 5 = 5 · 5 = 25',
          'Multipliziere die Variablen:',
          'e · f = ef',
          'Ergebnis: 25ef',
        ],
      },
      {
        id: 't2_20',
        aufgabe: '48y : 6',
        loesung: '8y',
        rechenweg: [
          'Dividiere den Koeffizienten durch die Zahl:',
          '48 : 6 = 8',
          'Behalte die Variable bei: y',
          'Ergebnis: 8y',
        ],
      },
      {
        id: 't2_21',
        aufgabe: '17d · 5',
        loesung: '85d',
        rechenweg: [
          'Multipliziere die Koeffizienten:',
          '17 · 5 = 85',
          'Behalte die Variable bei: d',
          'Ergebnis: 85d',
        ],
      },
      {
        id: 't2_22',
        aufgabe: '6 · 18x · 5s',
        loesung: '540xs',
        rechenweg: [
          'Multipliziere alle Koeffizienten:',
          '6 · 18 · 5 = 540',
          'Multipliziere die Variablen:',
          'x · s = xs',
          'Ergebnis: 540xs',
        ],
      },
      {
        id: 't2_23',
        aufgabe: '512f : 16',
        loesung: '32f',
        rechenweg: [
          'Dividiere den Koeffizienten:',
          '512 : 16 = 32',
          'Behalte die Variable bei: f',
          'Ergebnis: 32f',
        ],
      },
      {
        id: 't2_24',
        aufgabe: '81q : (-27)',
        loesung: '-3q',
        rechenweg: [
          'Dividiere den Koeffizienten (beachte das Vorzeichen):',
          '81 : (-27) = -3',
          'Behalte die Variable bei: q',
          'Ergebnis: -3q',
        ],
      },
      {
        id: 't2_25',
        aufgabe: '⅔c · 3s · 4b',
        loesung: '8bcs',
        rechenweg: [
          'Multipliziere die Koeffizienten:',
          '⅔ · 3 · 4 = 2 · 4 = 8',
          'Multipliziere die Variablen:',
          'c · s · b = bcs',
          'Ergebnis: 8bcs',
        ],
      },
      {
        id: 't2_26',
        aufgabe: '45a : 45',
        loesung: 'a',
        rechenweg: [
          'Dividiere den Koeffizienten:',
          '45 : 45 = 1',
          'Ergebnis: a oder 1a',
        ],
      },
      {
        id: 't2_27',
        aufgabe: '6f · 7k · (-c) : 8',
        loesung: '-5.25fkc',
        rechenweg: [
          'Multipliziere zuerst die Koeffizienten:',
          '6 · 7 · (-1) = -42',
          'Dividiere dann durch 8:',
          '-42 : 8 = -5,25',
          'Multipliziere die Variablen:',
          'f · k · c = fkc',
          'Ergebnis: -5,25fkc',
        ],
      },
      {
        id: 't2_28',
        aufgabe: 'q · 7 · 3w',
        loesung: '21qw',
        rechenweg: [
          'Multipliziere alle Koeffizienten:',
          '1 · 7 · 3 = 21',
          'Multipliziere die Variablen:',
          'q · w = qw',
          'Ergebnis: 21qw',
        ],
      },
      {
        id: 't2_29',
        aufgabe: '2a · 5b · c',
        loesung: '10abc',
        rechenweg: [
          'Multipliziere alle Koeffizienten:',
          '2 · 5 · 1 = 10',
          'Multipliziere die Variablen:',
          'a · b · c = abc',
          'Ergebnis: 10abc',
        ],
      },
      {
        id: 't2_30',
        aufgabe: '3x · 5 · 12z',
        loesung: '180xz',
        rechenweg: [
          'Multipliziere alle Koeffizienten:',
          '3 · 5 · 12 = 180',
          'Multipliziere die Variablen:',
          'x · z = xz',
          'Ergebnis: 180xz',
        ],
      },
      {
        id: 't2_31',
        aufgabe: '15r : 9 : 3',
        loesung: '5/9 r',
        rechenweg: [
          'Dividiere von links nach rechts:',
          '15 : 9 : 3 = (15 : 9) : 3 = 5/3 : 3 = 5/9',
          'Behalte die Variable bei: r',
          'Ergebnis: 5/9 r',
        ],
      },
      {
        id: 't2_32',
        aufgabe: '2b · 4a · 4',
        loesung: '32ab',
        rechenweg: [
          'Multipliziere alle Koeffizienten:',
          '2 · 4 · 4 = 32',
          'Multipliziere die Variablen:',
          'b · a = ab',
          'Ergebnis: 32ab',
        ],
      },
    ],
  },
  {
    name: 'Klammern auflösen (einfach)',
    aufgaben: [
      {
        id: 't3_1',
        aufgabe: '3x + (3x + 5y - 2z)',
        loesung: '6x + 5y - 2z',
        rechenweg: [
          'Klammern mit + davor → Vorzeichen bleiben:',
          '3x + 3x + 5y - 2z',
          'Fasse zusammen:',
          '6x + 5y - 2z',
        ],
      },
      {
        id: 't3_2',
        aufgabe: '4 + (2x - 3) - (2x + 4)',
        loesung: '-3',
        rechenweg: [
          'Klammern mit + → Vorzeichen bleiben:',
          '4 + 2x - 3',
          'Klammern mit - → Vorzeichen wechseln:',
          '4 + 2x - 3 - 2x - 4',
          'Fasse zusammen:',
          '(2x - 2x) + (4 - 3 - 4) = 0 - 3 = -3',
        ],
      },
      {
        id: 't3_3',
        aufgabe: '1 + (2x - 5) - (-10x - 5)',
        loesung: '12x + 1',
        rechenweg: [
          'Klammern mit + → Vorzeichen bleiben:',
          '1 + 2x - 5',
          'Klammern mit - → Vorzeichen wechseln:',
          '1 + 2x - 5 + 10x + 5',
          'Fasse zusammen:',
          '(2x + 10x) + (1 - 5 + 5) = 12x + 1',
        ],
      },
      {
        id: 't3_4',
        aufgabe: '(2 + x) - (3 + 5x) + 10y',
        loesung: '-1 - 4x + 10y',
        rechenweg: [
          'Klammern mit + → Vorzeichen bleiben:',
          '2 + x',
          'Klammern mit - → Vorzeichen wechseln:',
          '2 + x - 3 - 5x + 10y',
          'Fasse zusammen:',
          '(x - 5x) + (2 - 3) + 10y = -4x - 1 + 10y',
        ],
      },
      {
        id: 't3_5',
        aufgabe: '5y - (3y - 4) - (-5x + 10) - 2x',
        loesung: '3x + 2y + 4',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          '5y - 3y + 4 + 5x - 10 - 2x',
          'Fasse zusammen:',
          '(5x - 2x) + (5y - 3y) + (4 - 10) = 3x + 2y - 6',
        ],
      },
      {
        id: 't3_6',
        aufgabe: '0,5r - (7r - 4s + 5t)',
        loesung: '-6.5r + 4s - 5t',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          '0,5r - 7r + 4s - 5t',
          'Fasse zusammen:',
          '(0,5 - 7)r + 4s - 5t = -6,5r + 4s - 5t',
        ],
      },
      {
        id: 't3_7',
        aufgabe: '3a - (3a + 1,5a - 5,5) + 2a',
        loesung: '-1.5a + 5.5',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          '3a - 3a - 1,5a + 5,5 + 2a',
          'Fasse zusammen:',
          '(3 - 3 - 1,5 + 2)a + 5,5 = 0,5a + 5,5',
        ],
      },
      {
        id: 't3_8',
        aufgabe: '-x - (3x + 4y + 0,5z) + (2,5x + (-9y) - 0,5z) - (5,2y - 1,2z)',
        loesung: '-6.7x + 0.2y + 0.2z',
        rechenweg: [
          'Klammer 1 mit - → Vorzeichen wechseln:',
          '-x - 3x - 4y - 0,5z',
          'Klammer 2 mit + → Vorzeichen bleiben:',
          '+ 2,5x - 9y - 0,5z',
          'Klammer 3 mit - → Vorzeichen wechseln:',
          '- 5,2y + 1,2z',
          'Insgesamt: -x - 3x + 2,5x - 4y - 9y - 5,2y - 0,5z - 0,5z + 1,2z',
          'Fasse zusammen:',
          '(-1 - 3 + 2,5)x + (-4 - 9 - 5,2)y + (-0,5 - 0,5 + 1,2)z = -1,5x - 18,2y + 0,2z',
        ],
      },
      {
        id: 't3_9',
        aufgabe: '(3,7e - 5,9f) - (-4,3e - 7,1f) + (-7e + 2f)',
        loesung: 'f',
        rechenweg: [
          'Klammer 1 mit + → Vorzeichen bleiben:',
          '3,7e - 5,9f',
          'Klammer 2 mit - → Vorzeichen wechseln:',
          '+ 4,3e + 7,1f',
          'Klammer 3 mit + → Vorzeichen bleiben:',
          '- 7e + 2f',
          'Insgesamt: 3,7e - 5,9f + 4,3e + 7,1f - 7e + 2f',
          'Fasse zusammen:',
          '(3,7 + 4,3 - 7)e + (-5,9 + 7,1 + 2)f = e + 3,2f',
        ],
      },
      {
        id: 't3_10',
        aufgabe: '2a + (3b + [7c - (2b + a) + (4a + 2c)] - 5b) - c',
        loesung: '5a + 0b + 8c',
        rechenweg: [
          'Innerste Klammer zuerst: -(2b + a) = -2b - a',
          '7c - 2b - a + 4a + 2c = 9c - 2b + 3a',
          'Äußere Klammer: 3b + 9c - 2b + 3a - 5b = 3a - 4b + 9c',
          'Ganze Aufgabe: 2a + 3a - 4b + 9c - c = 5a - 4b + 8c',
        ],
      },
      {
        id: 't3_11',
        aufgabe: 'a + (b + c)',
        loesung: 'a + b + c',
        rechenweg: ['Klammern mit + → Vorzeichen bleiben:', 'a + b + c'],
      },
      {
        id: 't3_12',
        aufgabe: 'a - (b + c)',
        loesung: 'a - b - c',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          'a - b - c',
        ],
      },
      {
        id: 't3_13',
        aufgabe: 'a + (b - c)',
        loesung: 'a + b - c',
        rechenweg: ['Klammern mit + → Vorzeichen bleiben:', 'a + b - c'],
      },
      {
        id: 't3_14',
        aufgabe: 'a - (b - c)',
        loesung: 'a - b + c',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          'a - b + c',
        ],
      },
      {
        id: 't3_15',
        aufgabe: 'x + (2x + 3)',
        loesung: '3x + 3',
        rechenweg: ['Klammern mit + → Vorzeichen bleiben:', 'x + 2x + 3 = 3x + 3'],
      },
      {
        id: 't3_16',
        aufgabe: 'x - (2x + 3)',
        loesung: '-x - 3',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          'x - 2x - 3 = -x - 3',
        ],
      },
      {
        id: 't3_17',
        aufgabe: 'x + (2x - 3)',
        loesung: '3x - 3',
        rechenweg: ['Klammern mit + → Vorzeichen bleiben:', 'x + 2x - 3 = 3x - 3'],
      },
      {
        id: 't3_18',
        aufgabe: 'x - (2x - 3)',
        loesung: '-x + 3',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          'x - 2x + 3 = -x + 3',
        ],
      },
      {
        id: 't3_19',
        aufgabe: '2x + (x + 5) - (3x - 2)',
        loesung: '7',
        rechenweg: [
          'Klammern mit + → Vorzeichen bleiben:',
          '2x + x + 5',
          'Klammern mit - → Vorzeichen wechseln:',
          '2x + x + 5 - 3x + 2',
          'Fasse zusammen:',
          '(2 + 1 - 3)x + (5 + 2) = 0x + 7 = 7',
        ],
      },
      {
        id: 't3_20',
        aufgabe: '5y - (2y + 3) + (y - 1)',
        loesung: '4y - 4',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          '5y - 2y - 3',
          'Klammern mit + → Vorzeichen bleiben:',
          '5y - 2y - 3 + y - 1',
          'Fasse zusammen:',
          '(5 - 2 + 1)y + (-3 - 1) = 4y - 4',
        ],
      },
      {
        id: 't3_21',
        aufgabe: '3a + (2b - 1)',
        loesung: '3a + 2b - 1',
        rechenweg: ['Klammern mit + → Vorzeichen bleiben:', '3a + 2b - 1'],
      },
      {
        id: 't3_22',
        aufgabe: '4x - (x + 2)',
        loesung: '3x - 2',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          '4x - x - 2 = 3x - 2',
        ],
      },
      {
        id: 't3_23',
        aufgabe: '6m - (3m - 2n)',
        loesung: '3m + 2n',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          '6m - 3m + 2n = 3m + 2n',
        ],
      },
      {
        id: 't3_24',
        aufgabe: 'p + (3p + q) - (2p + 2q)',
        loesung: '2p - q',
        rechenweg: [
          'Klammern mit + → Vorzeichen bleiben:',
          'p + 3p + q',
          'Klammern mit - → Vorzeichen wechseln:',
          'p + 3p + q - 2p - 2q',
          'Fasse zusammen:',
          '(1 + 3 - 2)p + (1 - 2)q = 2p - q',
        ],
      },
      {
        id: 't3_25',
        aufgabe: '8r - (4r - 3s)',
        loesung: '4r + 3s',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          '8r - 4r + 3s = 4r + 3s',
        ],
      },
      {
        id: 't3_26',
        aufgabe: '10t + (2t - 1) - (3t + 2)',
        loesung: '9t - 3',
        rechenweg: [
          'Klammern mit + → Vorzeichen bleiben:',
          '10t + 2t - 1',
          'Klammern mit - → Vorzeichen wechseln:',
          '10t + 2t - 1 - 3t - 2',
          'Fasse zusammen:',
          '(10 + 2 - 3)t + (-1 - 2) = 9t - 3',
        ],
      },
      {
        id: 't3_27',
        aufgabe: 'v - (v + 2w) + (w - 1)',
        loesung: '-w - 1',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          'v - v - 2w',
          'Klammern mit + → Vorzeichen bleiben:',
          'v - v - 2w + w - 1',
          'Fasse zusammen:',
          '(1 - 1)v + (-2 + 1)w - 1 = -w - 1',
        ],
      },
      {
        id: 't3_28',
        aufgabe: '12x + (5x - 3) - (2x + 1)',
        loesung: '15x - 4',
        rechenweg: [
          'Klammern mit + → Vorzeichen bleiben:',
          '12x + 5x - 3',
          'Klammern mit - → Vorzeichen wechseln:',
          '12x + 5x - 3 - 2x - 1',
          'Fasse zusammen:',
          '(12 + 5 - 2)x + (-3 - 1) = 15x - 4',
        ],
      },
      {
        id: 't3_29',
        aufgabe: 'y + (3y - 2) + (y + 4)',
        loesung: '5y + 2',
        rechenweg: [
          'Klammern mit + → Vorzeichen bleiben:',
          'y + 3y - 2 + y + 4',
          'Fasse zusammen:',
          '(1 + 3 + 1)y + (-2 + 4) = 5y + 2',
        ],
      },
      {
        id: 't3_30',
        aufgabe: '7a - (2a + 1) - (a - 2)',
        loesung: '4a + 1',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          '7a - 2a - 1 - a + 2',
          'Fasse zusammen:',
          '(7 - 2 - 1)a + (-1 + 2) = 4a + 1',
        ],
      },
      {
        id: 't3_31',
        aufgabe: '9b + (2b - 3) + (b + 5)',
        loesung: '12b + 2',
        rechenweg: [
          'Klammern mit + → Vorzeichen bleiben:',
          '9b + 2b - 3 + b + 5',
          'Fasse zusammen:',
          '(9 + 2 + 1)b + (-3 + 5) = 12b + 2',
        ],
      },
      {
        id: 't3_32',
        aufgabe: 'c - (4c + 2) + (3c - 1)',
        loesung: '0c - 3',
        rechenweg: [
          'Klammern mit - → Vorzeichen wechseln:',
          'c - 4c - 2',
          'Klammern mit + → Vorzeichen bleiben:',
          'c - 4c - 2 + 3c - 1',
          'Fasse zusammen:',
          '(1 - 4 + 3)c + (-2 - 1) = 0c - 3 = -3',
        ],
      },
    ],
  },
  {
    name: 'Klammern auflösen mit Multiplikation/Division',
    aufgaben: [
      {
        id: 't4_1',
        aufgabe: '2 * (4x + 5) - (2x + 3)',
        loesung: '6x + 7',
        rechenweg: [
          'Multipliziere die erste Klammer:',
          '2 * 4x + 2 * 5 = 8x + 10',
          'Subtrahiere die zweite Klammer (Vorzeichen wechseln):',
          '8x + 10 - 2x - 3',
          'Fasse zusammen:',
          '(8 - 2)x + (10 - 3) = 6x + 7',
        ],
      },
      {
        id: 't4_2',
        aufgabe: '-3 * (2x - 5) + 2 * (-3x + 9)',
        loesung: '-12x + 33',
        rechenweg: [
          'Multipliziere die erste Klammer (mit -3):',
          '-3 * 2x - 3 * (-5) = -6x + 15',
          'Multipliziere die zweite Klammer (mit 2):',
          '2 * (-3x) + 2 * 9 = -6x + 18',
          'Addiere:',
          '-6x + 15 - 6x + 18',
          'Fasse zusammen:',
          '(-6 - 6)x + (15 + 18) = -12x + 33',
        ],
      },
      {
        id: 't4_3',
        aufgabe: '(2 - x) * 4 + 8x - 3 + 5y - (3x + 2)',
        loesung: '5 + 9x + 5y',
        rechenweg: [
          'Multipliziere die erste Klammer (mit 4):',
          '(2 - x) * 4 = 2 * 4 - x * 4 = 8 - 4x',
          'Schreibe den Rest auf:',
          '8 - 4x + 8x - 3 + 5y - 3x - 2',
          'Fasse zusammen:',
          '(-4 + 8 - 3)x + 5y + (8 - 3 - 2) = 1x + 5y + 3',
        ],
      },
      {
        id: 't4_4',
        aufgabe: '-(-(−2x - 3 - 6x + 2)) + 2x(5 - 3)',
        loesung: '-8x + 1 + 4x',
        rechenweg: [
          'Innere Klammern: -2x - 3 - 6x + 2 = -8x - 1',
          'Äußeres Minus (doppelt): -(-8x - 1) = 8x + 1',
          'Multiplikation: 2x(5 - 3) = 2x * 2 = 4x',
          'Gesamt: 8x + 1 + 4x = 12x + 1',
        ],
      },
      {
        id: 't4_5',
        aufgabe: '12 · (12x + 5y)',
        loesung: '144x + 60y',
        rechenweg: [
          'Distributivgesetz anwenden:',
          '12 * 12x + 12 * 5y',
          '= 144x + 60y',
        ],
      },
      {
        id: 't4_6',
        aufgabe: '(-5c - 2d) · 10',
        loesung: '-50c - 20d',
        rechenweg: [
          'Distributivgesetz anwenden:',
          '-5c * 10 - 2d * 10',
          '= -50c - 20d',
        ],
      },
      {
        id: 't4_7',
        aufgabe: '(51c - 9) : 3',
        loesung: '17c - 3',
        rechenweg: [
          'Division: Teile jeden Term durch 3:',
          '51c : 3 - 9 : 3',
          '= 17c - 3',
        ],
      },
      {
        id: 't4_8',
        aufgabe: '(3x + 8) · 16',
        loesung: '48x + 128',
        rechenweg: [
          'Distributivgesetz anwenden:',
          '3x * 16 + 8 * 16',
          '= 48x + 128',
        ],
      },
      {
        id: 't4_9',
        aufgabe: '¼ · (12 - 4w)',
        loesung: '3 - w',
        rechenweg: [
          'Distributivgesetz anwenden:',
          '¼ * 12 - ¼ * 4w',
          '= 3 - w',
        ],
      },
      {
        id: 't4_10',
        aufgabe: 'b · (-1,4r - 2,2y)',
        loesung: '-1.4br - 2.2by',
        rechenweg: [
          'Distributivgesetz anwenden:',
          'b * (-1,4r) + b * (-2,2y)',
          '= -1,4br - 2,2by',
        ],
      },
      {
        id: 't4_11',
        aufgabe: '(2g - h) · (-1)',
        loesung: '-2g + h',
        rechenweg: [
          'Multipliziere jede Klammer mit -1:',
          '2g * (-1) - h * (-1)',
          '= -2g + h',
        ],
      },
      {
        id: 't4_12',
        aufgabe: '(-3,6 + 2x) : (-4)',
        loesung: '0.9 - 0.5x',
        rechenweg: [
          'Division: Teile jeden Term durch -4:',
          '(-3,6) : (-4) + 2x : (-4)',
          '= 0,9 - 0,5x',
        ],
      },
      {
        id: 't4_13',
        aufgabe: '7 · (4x + 2)',
        loesung: '28x + 14',
        rechenweg: [
          'Distributivgesetz anwenden:',
          '7 * 4x + 7 * 2',
          '= 28x + 14',
        ],
      },
      {
        id: 't4_14',
        aufgabe: '⅓ · (-16 - ⅔t)',
        loesung: '-16/3 - 2/9 t',
        rechenweg: [
          'Distributivgesetz anwenden:',
          '⅓ * (-16) + ⅓ * (-⅔t)',
          '= -16/3 - 2/9 t',
        ],
      },
      {
        id: 't4_15',
        aufgabe: 'y · (15 - x)',
        loesung: '15y - xy',
        rechenweg: [
          'Distributivgesetz anwenden:',
          'y * 15 - y * x',
          '= 15y - xy',
        ],
      },
      {
        id: 't4_16',
        aufgabe: '3 · (4x + 5) - 2 · (3x - 1)',
        loesung: '6x + 17',
        rechenweg: [
          'Erste Klammer multiplizieren:',
          '3 * 4x + 3 * 5 = 12x + 15',
          'Zweite Klammer multiplizieren:',
          '2 * 3x - 2 * (-1) = 6x - 2',
          'Wegen Minus vor der zweiten: 12x + 15 - 6x + 2',
          'Fasse zusammen:',
          '(12 - 6)x + (15 + 2) = 6x + 17',
        ],
      },
      {
        id: 't4_17',
        aufgabe: '5 · (2y - 3) + 4 · (y + 2)',
        loesung: '14y - 7',
        rechenweg: [
          'Erste Klammer: 5 * 2y - 5 * 3 = 10y - 15',
          'Zweite Klammer: 4 * y + 4 * 2 = 4y + 8',
          'Addiere: 10y - 15 + 4y + 8',
          'Fasse zusammen:',
          '(10 + 4)y + (-15 + 8) = 14y - 7',
        ],
      },
      {
        id: 't4_18',
        aufgabe: '2 · (3a - 2b) - (a + 4b)',
        loesung: '5a - 8b',
        rechenweg: [
          'Erste Klammer: 2 * 3a - 2 * 2b = 6a - 4b',
          'Zweite Klammer mit - (Vorzeichen wechseln):',
          '6a - 4b - a - 4b',
          'Fasse zusammen:',
          '(6 - 1)a + (-4 - 4)b = 5a - 8b',
        ],
      },
      {
        id: 't4_19',
        aufgabe: '-(4q + 9r) · 7 - 5q',
        loesung: '-33q - 63r',
        rechenweg: [
          'Minus vor der Klammer: -(4q + 9r) = -4q - 9r',
          'Multipliziere mit 7: (-4q - 9r) * 7 = -28q - 63r',
          'Addiere -5q: -28q - 63r - 5q',
          'Fasse zusammen:',
          '(-28 - 5)q - 63r = -33q - 63r',
        ],
      },
      {
        id: 't4_20',
        aufgabe: '6 · (2x + 3) - 4 · (3x - 2)',
        loesung: '0x + 26',
        rechenweg: [
          'Erste Klammer: 6 * 2x + 6 * 3 = 12x + 18',
          'Zweite Klammer: 4 * 3x - 4 * (-2) = 12x - 8',
          'Wegen Minus vor der zweiten: 12x + 18 - 12x + 8',
          'Fasse zusammen:',
          '(12 - 12)x + (18 + 8) = 0x + 26 = 26',
        ],
      },
      {
        id: 't4_21',
        aufgabe: '8 · (x + 2)',
        loesung: '8x + 16',
        rechenweg: ['Distributivgesetz anwenden:', '8x + 16'],
      },
      {
        id: 't4_22',
        aufgabe: '-2 · (5a - 3b)',
        loesung: '-10a + 6b',
        rechenweg: [
          'Distributivgesetz anwenden:',
          '-2 * 5a - 2 * (-3b) = -10a + 6b',
        ],
      },
      {
        id: 't4_23',
        aufgabe: '(18 + 6z) : 6',
        loesung: '3 + z',
        rechenweg: [
          'Teile jeden Term durch 6:',
          '18 : 6 + 6z : 6 = 3 + z',
        ],
      },
      {
        id: 't4_24',
        aufgabe: '4 · (2x - 1) + 3 · (x + 2)',
        loesung: '11x + 2',
        rechenweg: [
          'Erste Klammer: 4 * 2x - 4 * 1 = 8x - 4',
          'Zweite Klammer: 3 * x + 3 * 2 = 3x + 6',
          'Addiere: 8x - 4 + 3x + 6',
          'Fasse zusammen:',
          '(8 + 3)x + (-4 + 6) = 11x + 2',
        ],
      },
      {
        id: 't4_25',
        aufgabe: '9 · (a + 1) - 5 · (a - 2)',
        loesung: '4a + 19',
        rechenweg: [
          'Erste Klammer: 9a + 9',
          'Zweite Klammer: 5a - 10',
          'Wegen Minus vor der zweiten: 9a + 9 - 5a + 10',
          'Fasse zusammen:',
          '(9 - 5)a + (9 + 10) = 4a + 19',
        ],
      },
      {
        id: 't4_26',
        aufgabe: '2 · (3x + 4y) - (x - 2y)',
        loesung: '5x + 10y',
        rechenweg: [
          'Erste Klammer: 6x + 8y',
          'Zweite Klammer mit - (Vorzeichen wechseln): -x + 2y',
          '6x + 8y - x + 2y',
          'Fasse zusammen:',
          '(6 - 1)x + (8 + 2)y = 5x + 10y',
        ],
      },
      {
        id: 't4_27',
        aufgabe: '(20e - 25f) : 5',
        loesung: '4e - 5f',
        rechenweg: [
          'Teile jeden Term durch 5:',
          '20e : 5 - 25f : 5 = 4e - 5f',
        ],
      },
      {
        id: 't4_28',
        aufgabe: '-3 · (2a + 1) + 5a',
        loesung: '-a - 3',
        rechenweg: [
          'Klammer: -3 * 2a - 3 * 1 = -6a - 3',
          'Addiere 5a: -6a - 3 + 5a',
          'Fasse zusammen:',
          '(-6 + 5)a - 3 = -a - 3',
        ],
      },
      {
        id: 't4_29',
        aufgabe: '7 · (b - 2) + 3b',
        loesung: '10b - 14',
        rechenweg: [
          'Klammer: 7b - 14',
          'Addiere 3b: 7b - 14 + 3b',
          'Fasse zusammen:',
          '(7 + 3)b - 14 = 10b - 14',
        ],
      },
      {
        id: 't4_30',
        aufgabe: '4 · (c + 5) - 2 · (c - 3)',
        loesung: '2c + 26',
        rechenweg: [
          'Erste Klammer: 4c + 20',
          'Zweite Klammer: 2c - 6',
          'Wegen Minus vor der zweiten: 4c + 20 - 2c + 6',
          'Fasse zusammen:',
          '(4 - 2)c + (20 + 6) = 2c + 26',
        ],
      },
      {
        id: 't4_31',
        aufgabe: '(15d + 10) : 5',
        loesung: '3d + 2',
        rechenweg: ['Teile jeden Term durch 5:', '3d + 2'],
      },
      {
        id: 't4_32',
        aufgabe: '6 · (x - 1) - 3 · (x + 2)',
        loesung: '3x - 12',
        rechenweg: [
          'Erste Klammer: 6x - 6',
          'Zweite Klammer: 3x + 6',
          'Wegen Minus vor der zweiten: 6x - 6 - 3x - 6',
          'Fasse zusammen:',
          '(6 - 3)x + (-6 - 6) = 3x - 12',
        ],
      },
    ],
  },
  {
    name: 'Vermischte Aufgaben',
    aufgaben: [
      {
        id: 't5_1',
        aufgabe: '17x + 8 + 13x',
        loesung: '30x + 8',
        rechenweg: [
          'Vereinfache gleichartige Terme:',
          '(17 + 13)x + 8',
          '= 30x + 8',
        ],
      },
      {
        id: 't5_2',
        aufgabe: '3x + 18 - x - 4',
        loesung: '2x + 14',
        rechenweg: [
          'Kombiniere x-Terme: 3x - x = 2x',
          'Kombiniere Konstanten: 18 - 4 = 14',
          '= 2x + 14',
        ],
      },
      {
        id: 't5_3',
        aufgabe: '4,5x + 2,5x + 2',
        loesung: '7x + 2',
        rechenweg: [
          'Addiere x-Terme:',
          '4,5x + 2,5x = 7x',
          '= 7x + 2',
        ],
      },
      {
        id: 't5_4',
        aufgabe: '2,6x + 1,3 - 2,6x',
        loesung: '1.3',
        rechenweg: [
          'x-Terme heben sich auf:',
          '2,6x - 2,6x = 0x',
          'Bleibt: 1,3',
        ],
      },
      {
        id: 't5_5',
        aufgabe: '36x + 12y - 18x',
        loesung: '18x + 12y',
        rechenweg: [
          'Kombiniere x-Terme:',
          '36x - 18x = 18x',
          'y bleibt gleich: 12y',
          '= 18x + 12y',
        ],
      },
      {
        id: 't5_6',
        aufgabe: '-3x + 6y - 5',
        loesung: '-3x + 6y - 5',
        rechenweg: [
          'Diese Terme sind nicht gleichartig:',
          'x-Terme, y-Terme und Konstanten können nicht kombiniert werden',
          '= -3x + 6y - 5',
        ],
      },
      {
        id: 't5_7',
        aufgabe: '3x + (3x + 5y - 2z)',
        loesung: '6x + 5y - 2z',
        rechenweg: [
          'Klammern mit +: Vorzeichen bleiben',
          '3x + 3x + 5y - 2z',
          'Kombiniere x-Terme: (3 + 3)x = 6x',
          '= 6x + 5y - 2z',
        ],
      },
      {
        id: 't5_8',
        aufgabe: '3·(-8x)+4·(2x)',
        loesung: '-16x',
        rechenweg: [
          'Multipliziere die erste Klammer:',
          '3 * (-8x) = -24x',
          'Multipliziere die zweite Klammer:',
          '4 * 2x = 8x',
          'Addiere:',
          '-24x + 8x = -16x',
        ],
      },
      {
        id: 't5_9',
        aufgabe: '(13x + 5y) - (3x + 2y)',
        loesung: '10x + 3y',
        rechenweg: [
          'Erste Klammer mit +: Vorzeichen bleiben',
          '13x + 5y',
          'Zweite Klammer mit -: Vorzeichen wechseln',
          '13x + 5y - 3x - 2y',
          'Kombiniere x-Terme: (13 - 3)x = 10x',
          'Kombiniere y-Terme: (5 - 2)y = 3y',
          '= 10x + 3y',
        ],
      },
      {
        id: 't5_10',
        aufgabe: '3a·2b + 1,5a·2b',
        loesung: '9ab',
        rechenweg: [
          'Multipliziere die erste Gruppe:',
          '3a * 2b = 6ab',
          'Multipliziere die zweite Gruppe:',
          '1,5a * 2b = 3ab',
          'Addiere:',
          '6ab + 3ab = 9ab',
        ],
      },
      {
        id: 't5_11',
        aufgabe: '7·x + 3·x - 4·x',
        loesung: '6x',
        rechenweg: [
          'Kombiniere alle x-Terme:',
          '(7 + 3 - 4)x = 6x',
        ],
      },
      {
        id: 't5_12',
        aufgabe: '5ab - 2ab + ab',
        loesung: '4ab',
        rechenweg: [
          'Kombiniere alle ab-Terme:',
          '(5 - 2 + 1)ab = 4ab',
        ],
      },
      {
        id: 't5_13',
        aufgabe: '10x - 4,5x',
        loesung: '5.5x',
        rechenweg: [
          'Subtrahiere die Koeffizienten:',
          '(10 - 4,5)x = 5,5x',
        ],
      },
      {
        id: 't5_14',
        aufgabe: '2·(x + 3) - (x - 1)',
        loesung: 'x + 7',
        rechenweg: [
          'Erste Klammer: 2x + 6',
          'Zweite Klammer mit - (Vorzeichen wechseln): -x + 1',
          'Insgesamt: 2x + 6 - x + 1',
          'Kombiniere:',
          '(2 - 1)x + (6 + 1) = x + 7',
        ],
      },
      {
        id: 't5_15',
        aufgabe: '6·y·2 - 4·y',
        loesung: '8y',
        rechenweg: [
          'Multipliziere 6·y·2: 6 * 2 * y = 12y',
          'Subtrahiere: 12y - 4y',
          'Kombiniere:',
          '(12 - 4)y = 8y',
        ],
      },
      {
        id: 't5_16',
        aufgabe: '(2x + 3y) + (x - y)',
        loesung: '3x + 2y',
        rechenweg: [
          'Beide Klammern mit +: Vorzeichen bleiben',
          '2x + 3y + x - y',
          'Kombiniere x-Terme: (2 + 1)x = 3x',
          'Kombiniere y-Terme: (3 - 1)y = 2y',
          '= 3x + 2y',
        ],
      },
      {
        id: 't5_17',
        aufgabe: '3·4·x - 2·6·x',
        loesung: '0x',
        rechenweg: [
          'Multipliziere erste Gruppe: 3 * 4 * x = 12x',
          'Multipliziere zweite Gruppe: 2 * 6 * x = 12x',
          'Subtrahiere: 12x - 12x = 0x',
        ],
      },
      {
        id: 't5_18',
        aufgabe: '-12,5t + 7,3t',
        loesung: '-5.2t',
        rechenweg: [
          'Kombiniere die t-Terme:',
          '(-12,5 + 7,3)t = -5,2t',
        ],
      },
      {
        id: 't5_19',
        aufgabe: '(4a + 2b) - (a + b)',
        loesung: '3a + b',
        rechenweg: [
          'Erste Klammer mit +: Vorzeichen bleiben: 4a + 2b',
          'Zweite Klammer mit -: Vorzeichen wechseln: -a - b',
          'Insgesamt: 4a + 2b - a - b',
          'Kombiniere a-Terme: (4 - 1)a = 3a',
          'Kombiniere b-Terme: (2 - 1)b = b',
          '= 3a + b',
        ],
      },
      {
        id: 't5_20',
        aufgabe: '5·(2x - 3) + 4x',
        loesung: '14x - 15',
        rechenweg: [
          'Multipliziere die Klammer:',
          '5 * 2x - 5 * 3 = 10x - 15',
          'Addiere 4x:',
          '10x - 15 + 4x',
          'Kombiniere:',
          '(10 + 4)x - 15 = 14x - 15',
        ],
      },
      {
        id: 't5_21',
        aufgabe: '8p + 3p - 2p + p',
        loesung: '10p',
        rechenweg: [
          'Kombiniere alle p-Terme:',
          '(8 + 3 - 2 + 1)p = 10p',
        ],
      },
      {
        id: 't5_22',
        aufgabe: 'x + 2x - 3x + 4x',
        loesung: '4x',
        rechenweg: [
          'Kombiniere alle x-Terme:',
          '(1 + 2 - 3 + 4)x = 4x',
        ],
      },
      {
        id: 't5_23',
        aufgabe: '(10x - 5y) + (3x + 2y)',
        loesung: '13x - 3y',
        rechenweg: [
          'Beide Klammern mit +:',
          '10x - 5y + 3x + 2y',
          'Kombiniere x-Terme: (10 + 3)x = 13x',
          'Kombiniere y-Terme: (-5 + 2)y = -3y',
          '= 13x - 3y',
        ],
      },
      {
        id: 't5_24',
        aufgabe: '2(3x + 1) - 3(2x - 1)',
        loesung: '5',
        rechenweg: [
          'Erste Klammer: 2 * 3x + 2 * 1 = 6x + 2',
          'Zweite Klammer: 3 * 2x - 3 * (-1) = 6x - 3',
          'Mit Minus vor der zweiten: 6x + 2 - 6x + 3',
          'Kombiniere:',
          '(6 - 6)x + (2 + 3) = 0x + 5 = 5',
        ],
      },
      {
        id: 't5_25',
        aufgabe: '½·8·z + 2z',
        loesung: '6z',
        rechenweg: [
          'Multipliziere: ½ * 8 * z = 4z',
          'Addiere: 4z + 2z',
          'Kombiniere:',
          '(4 + 2)z = 6z',
        ],
      },
      {
        id: 't5_26',
        aufgabe: '(5m - 3n) + (2m + n)',
        loesung: '7m - 2n',
        rechenweg: [
          'Beide Klammern mit +:',
          '5m - 3n + 2m + n',
          'Kombiniere m-Terme: (5 + 2)m = 7m',
          'Kombiniere n-Terme: (-3 + 1)n = -2n',
          '= 7m - 2n',
        ],
      },
      {
        id: 't5_27',
        aufgabe: '12x - 3x + 6x - x',
        loesung: '14x',
        rechenweg: [
          'Kombiniere alle x-Terme:',
          '(12 - 3 + 6 - 1)x = 14x',
        ],
      },
      {
        id: 't5_28',
        aufgabe: '3(a + 2b) - 2(a - b)',
        loesung: 'a + 8b',
        rechenweg: [
          'Erste Klammer: 3a + 6b',
          'Zweite Klammer: 2a - 2b',
          'Mit Minus vor der zweiten: 3a + 6b - 2a + 2b',
          'Kombiniere:',
          '(3 - 2)a + (6 + 2)b = a + 8b',
        ],
      },
      {
        id: 't5_29',
        aufgabe: '9y - 2y - 3y',
        loesung: '4y',
        rechenweg: [
          'Kombiniere alle y-Terme:',
          '(9 - 2 - 3)y = 4y',
        ],
      },
      {
        id: 't5_30',
        aufgabe: '(6x - 2) + (4x + 5) - (2x - 1)',
        loesung: '8x + 4',
        rechenweg: [
          'Erste Klammer mit +: 6x - 2',
          'Zweite Klammer mit +: 4x + 5',
          'Dritte Klammer mit -: -2x + 1',
          'Insgesamt: 6x - 2 + 4x + 5 - 2x + 1',
          'Kombiniere x-Terme: (6 + 4 - 2)x = 8x',
          'Kombiniere Konstanten: (-2 + 5 + 1) = 4',
          '= 8x + 4',
        ],
      },
      {
        id: 't5_31',
        aufgabe: '4(2x + 3) - 2(4x - 1)',
        loesung: '14',
        rechenweg: [
          'Erste Klammer: 8x + 12',
          'Zweite Klammer: 8x - 2',
          'Mit Minus vor der zweiten: 8x + 12 - 8x + 2',
          'Kombiniere:',
          '(8 - 8)x + (12 + 2) = 0x + 14 = 14',
        ],
      },
      {
        id: 't5_32',
        aufgabe: 'a + 3b + 2a - b',
        loesung: '3a + 2b',
        rechenweg: [
          'Kombiniere a-Terme: (1 + 2)a = 3a',
          'Kombiniere b-Terme: (3 - 1)b = 2b',
          '= 3a + 2b',
        ],
      },
    ],
  },
];

// ============================================================================
// HAUPTKOMPONENTE
// ============================================================================

const TermeZusammenfassen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; isCorrect: boolean | null }>>({});
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});

  const currentKategorie = AUFGABEN_KATEGORIEN[selectedCategory];
  const currentAufgaben = currentKategorie.aufgaben;

  const handleInputChange = (aufgabenId: string, value: string) => {
    const trimmedValue = value.trim();
    
    // Finde die zugehörige Aufgabe
    const aufgabe = findAufgabe(aufgabenId);
    if (!aufgabe) return;
    
    const isCorrect = trimmedValue ? areEquivalent(trimmedValue, aufgabe.loesung) : null;

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

  // Finde die Lösung für eine Aufgabe
  const findAufgabe = (id: string): Aufgabe | undefined => {
    return currentAufgaben.find((a) => a.id === id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-3">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-purple-900 mb-1">Terme zusammenfassen</h1>
          <p className="text-xs text-gray-600">
            Wähle eine Kategorie und löse die Aufgaben. Tippe deine Antwort ein und überprüfe automatisch!
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
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {kategorie.name}
            </button>
          ))}
        </div>

        {/* Aufgaben */}
        <div className="space-y-2">
          {currentAufgaben.map((aufgabe, index) => {
            const answer = answers[aufgabe.id] || { value: '', isCorrect: null };
            const showSolution = showSolutions[aufgabe.id] || false;

            return (
              <div
                key={aufgabe.id}
                className="bg-white rounded p-3 shadow border-l-2 border-purple-300"
              >
                {/* Aufgabe Nummer und Text */}
                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-purple-600">
                      Aufgabe {index + 1}
                    </p>
                    {answer.isCorrect === true && (
                      <p className="text-xs text-green-600 font-semibold">✓ Korrekt!</p>
                    )}
                    {answer.isCorrect === false && (
                      <p className="text-xs text-red-600 font-semibold">✗ Falsch</p>
                    )}
                  </div>
                  <p className="text-sm font-mono bg-gray-50 p-1.5 rounded border border-gray-200">
                    {aufgabe.aufgabe}
                  </p>
                </div>

                {/* Input Feld */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Antwort..."
                    value={answer.value}
                    onChange={(e) => handleInputChange(aufgabe.id, e.target.value)}
                    className={`w-full px-2 py-1.5 rounded border-2 font-mono text-sm transition-all ${
                      answer.isCorrect === null
                        ? 'border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200'
                        : answer.isCorrect
                        ? 'border-green-500 bg-green-50 focus:ring-1 focus:ring-green-200'
                        : 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-200'
                    }`}
                  />
                </div>

                {/* Button */}
                <button
                  onClick={() => toggleSolution(aufgabe.id)}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                >
                  {showSolution ? 'Weg ✕' : 'Weg ?'}
                </button>

                {/* Rechenweg */}
                {showSolution && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-400 text-xs">
                    <p className="font-semibold text-blue-900 mb-1">Lösungsweg:</p>
                    <div className="space-y-0.5 mb-1">
                      {aufgabe.rechenweg.map((schritt, i) => (
                        <p key={i} className="text-blue-800 text-xs">
                          {i > 0 && '→ '} {schritt}
                        </p>
                      ))}
                    </div>
                    <p className="font-semibold text-blue-900">
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
              className="bg-purple-600 h-2 rounded-full transition-all"
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

export default TermeZusammenfassen;
