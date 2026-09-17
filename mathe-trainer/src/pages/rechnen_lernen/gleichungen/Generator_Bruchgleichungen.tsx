import React, { useState, useEffect } from 'react';

/**
 * Vergleicht zwei Lösungen auf Äquivalenz
 * Akzeptiert Rundungen auf 1-2 Dezimalstellen
 * Akzeptiert Punkt und Komma als Dezimaltrennzeichen
 */
function areEquivalentSolutions(input: string, expectedSolution: number): boolean {
  try {
    // Akzeptiere Komma oder Punkt als Dezimaltrennzeichen
    const normalizedInput = input.trim().replace(',', '.').replace(/[−–—‐]/g, '-');
    const userSolution = parseFloat(normalizedInput);
    if (isNaN(userSolution)) return false;

    // Runde beide Werte auf maximal 2 Dezimalstellen für Vergleich
    const rounded1 = Math.round(userSolution * 100) / 100;
    const rounded2 = Math.round(expectedSolution * 100) / 100;

    return Math.abs(rounded1 - rounded2) < 0.01;
  } catch {
    return false;
  }
}

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
      { id: 'e1', aufgabe: '$12 = \\frac{x}{2}$', loesung: 24, rechenweg: ['$12 = \\frac{x}{2}$', 'Multipliziere beide Seiten mit 2', '$12 \\cdot 2 = \\frac{x}{2} \\cdot 2$', '$24 = x$', '$x = 24$'] },
      { id: 'e2', aufgabe: '$2 = \\frac{x}{4}$', loesung: 8, rechenweg: ['$2 = \\frac{x}{4}$', 'Multipliziere beide Seiten mit 4', '$2 \\cdot 4 = \\frac{x}{4} \\cdot 4$', '$8 = x$', '$x = 8$'] },
      { id: 'e3', aufgabe: '$5 = \\frac{x}{3}$', loesung: 15, rechenweg: ['$5 = \\frac{x}{3}$', 'Multipliziere beide Seiten mit 3', '$5 \\cdot 3 = \\frac{x}{3} \\cdot 3$', '$15 = x$', '$x = 15$'] },
      { id: 'e4', aufgabe: '$4 = \\frac{x}{2}$', loesung: 8, rechenweg: ['$4 = \\frac{x}{2}$', 'Multipliziere beide Seiten mit 2', '$4 \\cdot 2 = \\frac{x}{2} \\cdot 2$', '$8 = x$', '$x = 8$'] },
      { id: 'e5', aufgabe: '$12 = \\frac{x}{6}$', loesung: 72, rechenweg: ['$12 = \\frac{x}{6}$', 'Multipliziere beide Seiten mit 6', '$12 \\cdot 6 = \\frac{x}{6} \\cdot 6$', '$72 = x$', '$x = 72$'] },
      { id: 'e6', aufgabe: '$8 = \\frac{24}{x}$', loesung: 3, rechenweg: ['$8 = \\frac{24}{x}$', 'Multipliziere beide Seiten mit x', '$8x = 24$', 'Teile beide Seiten durch 8', '$x = 3$'] },
      { id: 'e7', aufgabe: '$2 = \\frac{4}{x}$', loesung: 2, rechenweg: ['$2 = \\frac{4}{x}$', 'Multipliziere beide Seiten mit x', '$2x = 4$', 'Teile beide Seiten durch 2', '$x = 2$'] },
      { id: 'e8', aufgabe: '$5 = \\frac{15}{x}$', loesung: 3, rechenweg: ['$5 = \\frac{15}{x}$', 'Multipliziere beide Seiten mit x', '$5x = 15$', 'Teile beide Seiten durch 5', '$x = 3$'] },
      { id: 'e9', aufgabe: '$2 = \\frac{10}{x}$', loesung: 5, rechenweg: ['$2 = \\frac{10}{x}$', 'Multipliziere beide Seiten mit x', '$2x = 10$', 'Teile beide Seiten durch 2', '$x = 5$'] },
      { id: 'e10', aufgabe: '$8 = \\frac{40}{x}$', loesung: 5, rechenweg: ['$8 = \\frac{40}{x}$', 'Multipliziere beide Seiten mit x', '$8x = 40$', 'Teile beide Seiten durch 8', '$x = 5$'] },
      { id: 'e11', aufgabe: '$\\frac{x}{3} + 10 = 18$', loesung: 24, rechenweg: ['$\\frac{x}{3} + 10 = 18$', 'Subtrahiere 10 auf beiden Seiten', '$\\frac{x}{3} = 8$', 'Multipliziere beide Seiten mit 3', '$x = 24$'] },
      { id: 'e12', aufgabe: '$\\frac{x}{4} + 3 = 4$', loesung: 4, rechenweg: ['$\\frac{x}{4} + 3 = 4$', 'Subtrahiere 3 auf beiden Seiten', '$\\frac{x}{4} = 1$', 'Multipliziere beide Seiten mit 4', '$x = 4$'] },
      { id: 'e13', aufgabe: '$\\frac{x}{5} + 5 = 11$', loesung: 30, rechenweg: ['$\\frac{x}{5} + 5 = 11$', 'Subtrahiere 5 auf beiden Seiten', '$\\frac{x}{5} = 6$', 'Multipliziere beide Seiten mit 5', '$x = 30$'] },
      { id: 'e14', aufgabe: '$\\frac{x}{3} + 6 = 10$', loesung: 12, rechenweg: ['$\\frac{x}{3} + 6 = 10$', 'Subtrahiere 6 auf beiden Seiten', '$\\frac{x}{3} = 4$', 'Multipliziere beide Seiten mit 3', '$x = 12$'] },
      { id: 'e15', aufgabe: '$\\frac{x}{2} + 7 = 9$', loesung: 4, rechenweg: ['$\\frac{x}{2} + 7 = 9$', 'Subtrahiere 7 auf beiden Seiten', '$\\frac{x}{2} = 2$', 'Multipliziere beide Seiten mit 2', '$x = 4$'] },
      { id: 'e16', aufgabe: '$\\frac{x}{2} - 6 = 6$', loesung: 24, rechenweg: ['$\\frac{x}{2} - 6 = 6$', 'Addiere 6 auf beiden Seiten', '$\\frac{x}{2} = 12$', 'Multipliziere beide Seiten mit 2', '$x = 24$'] },
      { id: 'e17', aufgabe: '$\\frac{x}{6} - 5 = 1$', loesung: 36, rechenweg: ['$\\frac{x}{6} - 5 = 1$', 'Addiere 5 auf beiden Seiten', '$\\frac{x}{6} = 6$', 'Multipliziere beide Seiten mit 6', '$x = 36$'] },
      { id: 'e18', aufgabe: '$\\frac{x}{5} - 2 = 7$', loesung: 45, rechenweg: ['$\\frac{x}{5} - 2 = 7$', 'Addiere 2 auf beiden Seiten', '$\\frac{x}{5} = 9$', 'Multipliziere beide Seiten mit 5', '$x = 45$'] },
      { id: 'e19', aufgabe: '$\\frac{x}{2} - 5 = 10$', loesung: 30, rechenweg: ['$\\frac{x}{2} - 5 = 10$', 'Addiere 5 auf beiden Seiten', '$\\frac{x}{2} = 15$', 'Multipliziere beide Seiten mit 2', '$x = 30$'] },
    ],
  },
  {
    name: 'Mittel',
    aufgaben: [
      { id: 'm1', aufgabe: '$\\frac{x + 4}{4} = 11$', loesung: 40, rechenweg: ['$\\frac{x + 4}{4} = 11$', 'Multipliziere beide Seiten mit 4', '$x + 4 = 44$', 'Subtrahiere 4 auf beiden Seiten', '$x = 40$'] },
      { id: 'm2', aufgabe: '$\\frac{x + 4}{2} = 2$', loesung: 0, rechenweg: ['$\\frac{x + 4}{2} = 2$', 'Multipliziere beide Seiten mit 2', '$x + 4 = 4$', 'Subtrahiere 4 auf beiden Seiten', '$x = 0$'] },
      { id: 'm3', aufgabe: '$\\frac{x + 4}{4} = 3$', loesung: 8, rechenweg: ['$\\frac{x + 4}{4} = 3$', 'Multipliziere beide Seiten mit 4', '$x + 4 = 12$', 'Subtrahiere 4 auf beiden Seiten', '$x = 8$'] },
      { id: 'm4', aufgabe: '$\\frac{x + 5}{2} = 8$', loesung: 11, rechenweg: ['$\\frac{x + 5}{2} = 8$', 'Multipliziere beide Seiten mit 2', '$x + 5 = 16$', 'Subtrahiere 5 auf beiden Seiten', '$x = 11$'] },
      { id: 'm5', aufgabe: '$\\frac{x + 6}{5} = 12$', loesung: 54, rechenweg: ['$\\frac{x + 6}{5} = 12$', 'Multipliziere beide Seiten mit 5', '$x + 6 = 60$', 'Subtrahiere 6 auf beiden Seiten', '$x = 54$'] },
      { id: 'm6', aufgabe: '$\\frac{x - 6}{3} = 7$', loesung: 27, rechenweg: ['$\\frac{x - 6}{3} = 7$', 'Multipliziere beide Seiten mit 3', '$x - 6 = 21$', 'Addiere 6 auf beiden Seiten', '$x = 27$'] },
      { id: 'm7', aufgabe: '$\\frac{x - 5}{3} = 12$', loesung: 41, rechenweg: ['$\\frac{x - 5}{3} = 12$', 'Multipliziere beide Seiten mit 3', '$x - 5 = 36$', 'Addiere 5 auf beiden Seiten', '$x = 41$'] },
      { id: 'm8', aufgabe: '$\\frac{x - 3}{2} = 11$', loesung: 25, rechenweg: ['$\\frac{x - 3}{2} = 11$', 'Multipliziere beide Seiten mit 2', '$x - 3 = 22$', 'Addiere 3 auf beiden Seiten', '$x = 25$'] },
      { id: 'm9', aufgabe: '$\\frac{x - 8}{3} = 4$', loesung: 20, rechenweg: ['$\\frac{x - 8}{3} = 4$', 'Multipliziere beide Seiten mit 3', '$x - 8 = 12$', 'Addiere 8 auf beiden Seiten', '$x = 20$'] },
      { id: 'm10', aufgabe: '$\\frac{x - 9}{5} = 6$', loesung: 39, rechenweg: ['$\\frac{x - 9}{5} = 6$', 'Multipliziere beide Seiten mit 5', '$x - 9 = 30$', 'Addiere 9 auf beiden Seiten', '$x = 39$'] },
      { id: 'm11', aufgabe: '$\\frac{3x}{2} = 6$', loesung: 4, rechenweg: ['$\\frac{3x}{2} = 6$', 'Multipliziere beide Seiten mit 2', '$3x = 12$', 'Teile beide Seiten durch 3', '$x = 4$'] },
      { id: 'm12', aufgabe: '$\\frac{2x}{5} = 6$', loesung: 15, rechenweg: ['$\\frac{2x}{5} = 6$', 'Multipliziere beide Seiten mit 5', '$2x = 30$', 'Teile beide Seiten durch 2', '$x = 15$'] },
      { id: 'm13', aufgabe: '$\\frac{2x}{6} = 6$', loesung: 18, rechenweg: ['$\\frac{2x}{6} = 6$', 'Multipliziere beide Seiten mit 6', '$2x = 36$', 'Teile beide Seiten durch 2', '$x = 18$'] },
      { id: 'm14', aufgabe: '$\\frac{3x}{5} = 12$', loesung: 20, rechenweg: ['$\\frac{3x}{5} = 12$', 'Multipliziere beide Seiten mit 5', '$3x = 60$', 'Teile beide Seiten durch 3', '$x = 20$'] },
      { id: 'm15', aufgabe: '$\\frac{3x}{3} = 6$', loesung: 6, rechenweg: ['$\\frac{3x}{3} = 6$', 'Multipliziere beide Seiten mit 3', '$3x = 18$', 'Teile beide Seiten durch 3', '$x = 6$'] },
      { id: 'm16', aufgabe: '$\\frac{35}{x} + 5 = 12$', loesung: 5, rechenweg: ['$\\frac{35}{x} + 5 = 12$', 'Subtrahiere 5 auf beiden Seiten', '$\\frac{35}{x} = 7$', 'Multipliziere beide Seiten mit x und teile durch 7', '$x = 5$'] },
      { id: 'm17', aufgabe: '$\\frac{40}{x} + 6 = 10$', loesung: 10, rechenweg: ['$\\frac{40}{x} + 6 = 10$', 'Subtrahiere 6 auf beiden Seiten', '$\\frac{40}{x} = 4$', 'Multipliziere beide Seiten mit x und teile durch 4', '$x = 10$'] },
      { id: 'm18', aufgabe: '$\\frac{48}{x} + 4 = 10$', loesung: 8, rechenweg: ['$\\frac{48}{x} + 4 = 10$', 'Subtrahiere 4 auf beiden Seiten', '$\\frac{48}{x} = 6$', 'Multipliziere beide Seiten mit x und teile durch 6', '$x = 8$'] },
      { id: 'm19', aufgabe: '$\\frac{21}{x} + 2 = 5$', loesung: 7, rechenweg: ['$\\frac{21}{x} + 2 = 5$', 'Subtrahiere 2 auf beiden Seiten', '$\\frac{21}{x} = 3$', 'Multipliziere beide Seiten mit x und teile durch 3', '$x = 7$'] },
      { id: 'm20', aufgabe: '$\\frac{50}{x} + 1 = 6$', loesung: 10, rechenweg: ['$\\frac{50}{x} + 1 = 6$', 'Subtrahiere 1 auf beiden Seiten', '$\\frac{50}{x} = 5$', 'Multipliziere beide Seiten mit x und teile durch 5', '$x = 10$'] },
      { id: 'm21', aufgabe: '$\\frac{4}{x - 3} = 2$', loesung: 5, rechenweg: ['$\\frac{4}{x - 3} = 2$', 'Multipliziere beide Seiten mit (x - 3)', '$4 = 2(x - 3)$', 'Teile beide Seiten durch 2', '$x - 3 = 2$', '$x = 5$'] },
      { id: 'm22', aufgabe: '$\\frac{28}{x - 7} = 7$', loesung: 11, rechenweg: ['$\\frac{28}{x - 7} = 7$', 'Multipliziere beide Seiten mit (x - 7)', '$28 = 7(x - 7)$', 'Teile beide Seiten durch 7', '$x - 7 = 4$', '$x = 11$'] },
      { id: 'm23', aufgabe: '$\\frac{15}{x - 7} = 5$', loesung: 10, rechenweg: ['$\\frac{15}{x - 7} = 5$', 'Multipliziere beide Seiten mit (x - 7)', '$15 = 5(x - 7)$', 'Teile beide Seiten durch 5', '$x - 7 = 3$', '$x = 10$'] },
      { id: 'm24', aufgabe: '$\\frac{54}{x - 5} = 6$', loesung: 14, rechenweg: ['$\\frac{54}{x - 5} = 6$', 'Multipliziere beide Seiten mit (x - 5)', '$54 = 6(x - 5)$', 'Teile beide Seiten durch 6', '$x - 5 = 9$', '$x = 14$'] },
    ],
  },
  {
    name: 'Schwer',
    aufgaben: [
      { id: 's1', aufgabe: '$\\frac{x + 7}{2} = \\frac{x + 3}{4}$', loesung: -11, rechenweg: ['$\\frac{x + 7}{2} = \\frac{x + 3}{4}$', 'Kreuzweise multiplizieren', '$4(x + 7) = 2(x + 3)$', '$4x + 28 = 2x + 6$', '$2x = -22$', '$x = -11$'] },
      { id: 's2', aufgabe: '$\\frac{x + 5}{5} = \\frac{x + 9}{2}$', loesung: -11.666667, rechenweg: ['$\\frac{x + 5}{5} = \\frac{x + 9}{2}$', 'Kreuzweise multiplizieren', '$2(x + 5) = 5(x + 9)$', '$2x + 10 = 5x + 45$', '$-3x = 35$', '$x = \\frac{-35}{3} = -11.67$'] },
      { id: 's3', aufgabe: '$\\frac{x + 5}{3} = \\frac{x + 9}{2}$', loesung: -17, rechenweg: ['$\\frac{x + 5}{3} = \\frac{x + 9}{2}$', 'Kreuzweise multiplizieren', '$2(x + 5) = 3(x + 9)$', '$2x + 10 = 3x + 27$', '$-1x = 17$', '$x = -17$'] },
      { id: 's4', aufgabe: '$\\frac{x + 9}{4} = \\frac{x + 9}{3}$', loesung: -9, rechenweg: ['$\\frac{x + 9}{4} = \\frac{x + 9}{3}$', 'Kreuzweise multiplizieren', '$3(x + 9) = 4(x + 9)$', '$3x + 27 = 4x + 36$', '$-1x = 9$', '$x = -9$'] },
      { id: 's5', aufgabe: '$\\frac{x + 8}{2} = \\frac{x + 1}{4}$', loesung: -15, rechenweg: ['$\\frac{x + 8}{2} = \\frac{x + 1}{4}$', 'Kreuzweise multiplizieren', '$4(x + 8) = 2(x + 1)$', '$4x + 32 = 2x + 2$', '$2x = -30$', '$x = -15$'] },
      { id: 's6', aufgabe: '$\\frac{x + 5}{2} = \\frac{x + 4}{4}$', loesung: -6, rechenweg: ['$\\frac{x + 5}{2} = \\frac{x + 4}{4}$', 'Kreuzweise multiplizieren', '$4(x + 5) = 2(x + 4)$', '$4x + 20 = 2x + 8$', '$2x = -12$', '$x = -6$'] },
      { id: 's7', aufgabe: '$\\frac{x}{2} + \\frac{x}{3} = 3$', loesung: 3.6, rechenweg: ['$\\frac{x}{2} + \\frac{x}{3} = 3$', 'Gemeinsamer Nenner 6: $\\frac{3x}{6} + \\frac{2x}{6} = 3$', '$\\frac{5x}{6} = 3$', '$5x = 18$', '$x = \\frac{18}{5} = 3.6$'] },
      { id: 's8', aufgabe: '$\\frac{x}{2} + \\frac{x}{6} = 3$', loesung: 4.5, rechenweg: ['$\\frac{x}{2} + \\frac{x}{6} = 3$', 'Gemeinsamer Nenner 12: $\\frac{6x}{12} + \\frac{2x}{12} = 3$', '$\\frac{8x}{12} = 3$', '$8x = 36$', '$x = \\frac{9}{2} = 4.5$'] },
      { id: 's9', aufgabe: '$\\frac{x}{6} + \\frac{x}{3} = 6$', loesung: 12, rechenweg: ['$\\frac{x}{6} + \\frac{x}{3} = 6$', 'Gemeinsamer Nenner 18: $\\frac{3x}{18} + \\frac{6x}{18} = 6$', '$\\frac{9x}{18} = 6$', '$9x = 108$', '$x = 12$'] },
      { id: 's10', aufgabe: '$\\frac{x}{6} + \\frac{x}{3} = 10$', loesung: 20, rechenweg: ['$\\frac{x}{6} + \\frac{x}{3} = 10$', 'Gemeinsamer Nenner 18: $\\frac{3x}{18} + \\frac{6x}{18} = 10$', '$\\frac{9x}{18} = 10$', '$9x = 180$', '$x = 20$'] },
      { id: 's11', aufgabe: '$\\frac{x}{3} + \\frac{x}{4} = 8$', loesung: 13.714286, rechenweg: ['$\\frac{x}{3} + \\frac{x}{4} = 8$', 'Gemeinsamer Nenner 12: $\\frac{4x}{12} + \\frac{3x}{12} = 8$', '$\\frac{7x}{12} = 8$', '$7x = 96$', '$x = \\frac{96}{7} = 13.71$'] },
      { id: 's12', aufgabe: '$\\frac{x}{4} + \\frac{x}{6} = 10$', loesung: 24, rechenweg: ['$\\frac{x}{4} + \\frac{x}{6} = 10$', 'Gemeinsamer Nenner 24: $\\frac{6x}{24} + \\frac{4x}{24} = 10$', '$\\frac{10x}{24} = 10$', '$10x = 240$', '$x = 24$'] },
      { id: 's13', aufgabe: '$\\frac{2}{x} = \\frac{11}{x + 9}$', loesung: 2, rechenweg: ['$\\frac{2}{x} = \\frac{11}{x + 9}$', 'Kreuzweise multiplizieren', '$2(x + 9) = 11x$', '$2x + 18 = 11x$', '$9x = 18$', '$x = 2$'] },
      { id: 's14', aufgabe: '$\\frac{5}{x} = \\frac{11}{x + 4}$', loesung: 3.333333, rechenweg: ['$\\frac{5}{x} = \\frac{11}{x + 4}$', 'Kreuzweise multiplizieren', '$5(x + 4) = 11x$', '$5x + 20 = 11x$', '$6x = 20$', '$x = \\frac{10}{3} = 3.33$'] },
      { id: 's15', aufgabe: '$\\frac{2}{x} = \\frac{3}{x + 1}$', loesung: 2, rechenweg: ['$\\frac{2}{x} = \\frac{3}{x + 1}$', 'Kreuzweise multiplizieren', '$2(x + 1) = 3x$', '$2x + 2 = 3x$', '$1x = 2$', '$x = 2$'] },
      { id: 's16', aufgabe: '$\\frac{5}{x} = \\frac{6}{x + 8}$', loesung: 40, rechenweg: ['$\\frac{5}{x} = \\frac{6}{x + 8}$', 'Kreuzweise multiplizieren', '$5(x + 8) = 6x$', '$5x + 40 = 6x$', '$1x = 40$', '$x = 40$'] },
      { id: 's17', aufgabe: '$\\frac{5}{x} = \\frac{10}{x + 3}$', loesung: 3, rechenweg: ['$\\frac{5}{x} = \\frac{10}{x + 3}$', 'Kreuzweise multiplizieren', '$5(x + 3) = 10x$', '$5x + 15 = 10x$', '$5x = 15$', '$x = 3$'] },
      { id: 's18', aufgabe: '$\\frac{5x - 8}{3} = 9$', loesung: 7, rechenweg: ['$\\frac{5x - 8}{3} = 9$', 'Multipliziere beide Seiten mit 3', '$5x - 8 = 27$', '$5x = 35$', 'Teile beide Seiten durch 5', '$x = 7$'] },
      { id: 's19', aufgabe: '$\\frac{3x - 15}{2} = 3$', loesung: 7, rechenweg: ['$\\frac{3x - 15}{2} = 3$', 'Multipliziere beide Seiten mit 2', '$3x - 15 = 6$', '$3x = 21$', 'Teile beide Seiten durch 3', '$x = 7$'] },
      { id: 's20', aufgabe: '$\\frac{4x + 8}{5} = 8$', loesung: 8, rechenweg: ['$\\frac{4x + 8}{5} = 8$', 'Multipliziere beide Seiten mit 5', '$4x + 8 = 40$', '$4x = 32$', 'Teile beide Seiten durch 4', '$x = 8$'] },
      { id: 's21', aufgabe: '$\\frac{2x - 10}{2} = 2$', loesung: 7, rechenweg: ['$\\frac{2x - 10}{2} = 2$', 'Multipliziere beide Seiten mit 2', '$2x - 10 = 4$', '$2x = 14$', 'Teile beide Seiten durch 2', '$x = 7$'] },
      { id: 's22', aufgabe: '$\\frac{4x - 6}{2} = 5$', loesung: 4, rechenweg: ['$\\frac{4x - 6}{2} = 5$', 'Multipliziere beide Seiten mit 2', '$4x - 6 = 10$', '$4x = 16$', 'Teile beide Seiten durch 4', '$x = 4$'] },
      { id: 's23', aufgabe: '$\\frac{3x - 1}{5} = 4$', loesung: 7, rechenweg: ['$\\frac{3x - 1}{5} = 4$', 'Multipliziere beide Seiten mit 5', '$3x - 1 = 20$', '$3x = 21$', 'Teile beide Seiten durch 3', '$x = 7$'] },
    ],
  },
];
export default function Generator_Bruchgleichungen() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; isCorrect: boolean | null }>>({});
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});

  const currentKategorie = AUFGABEN_KATEGORIEN[selectedCategory];
  const currentAufgaben = currentKategorie.aufgaben;

  // MathJax neu rendern, wenn sich die Aufgaben ändern
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).MathJax) {
      (window as any).MathJax.typesetPromise?.().catch(() => {
        // Fehler werden ignoriert
      });
    }
  }, [selectedCategory, showSolutions]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-purple-900 mb-1">Bruchgleichungen lösen</h1>
          <p className="text-xs text-gray-600">
            Löse die Bruchgleichung und gib nur die Lösung für x ein (z.B.: 5, -2, 1.5)
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
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
              }`}
            >
              {kategorie.name}
            </button>
          ))}
        </div>

        {/* Aufgaben */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <p className="text-base font-semibold text-gray-700 mb-2 col-span-full">Löse die Bruchgleichung</p>
          {currentAufgaben.map((aufgabe, index) => {
            const answer = answers[aufgabe.id] || { value: '', isCorrect: null };
            const showSolution = showSolutions[aufgabe.id] || false;

            return (
              <div key={aufgabe.id} className="space-y-0 col-span-1">
                {/* Aufgabe in einer Zeile */}
                <div className="bg-white rounded p-3 shadow border-l-2 border-purple-300 flex items-center gap-3">
                  {/* Nummer */}
                  <span className="text-base font-bold text-gray-600 whitespace-nowrap">
                    {index + 1})
                  </span>

                  {/* Aufgabe */}
                  <div className="text-lg md:text-xl bg-gray-50 px-3 py-2 rounded border border-gray-200 whitespace-nowrap flex items-center justify-center">
                    {aufgabe.aufgabe}
                  </div>

                  {/* Gleichheitszeichen */}
                  <span className="text-2xl font-bold text-gray-500">=</span>

                  {/* Input */}
                  <input
                    type="text"
                    placeholder="..."
                    value={answer.value}
                    onChange={(e) => handleInputChange(aufgabe.id, e.target.value)}
                    className={`flex-1 min-w-0 px-3 py-2 rounded border-2 font-mono text-base transition-all ${
                      answer.isCorrect === null
                        ? 'border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200'
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
                    className="text-base px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-all whitespace-nowrap font-semibold"
                  >
                    {showSolution ? '✕' : '?'}
                  </button>
                </div>

                {/* Rechenweg - ausklappbar unter der Aufgabe */}
                {showSolution && (
                  <div className="p-3 bg-purple-50 rounded border-l-2 border-purple-400 text-base ml-8">
                    <div className="space-y-1">
                      {aufgabe.rechenweg.map((schritt, i) => (
                        <p key={i} className="text-gray-700">
                          {i > 0 && '→ '} {schritt}
                        </p>
                      ))}
                    </div>
                    <p className="font-semibold text-purple-900 mt-2">
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
          <p className="text-base font-semibold text-gray-800">
            Fortschritt: {Object.values(answers).filter((a) => a.isCorrect === true).length} /{' '}
            {currentAufgaben.length} korrekt
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
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
}
