import React, { useState, useEffect } from 'react';
import RechenwegDisplay from '../../../components/RechenwegDisplay';

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
      { id: 'e1', aufgabe: '$12 = \\frac{x}{2}$', loesung: 24, rechenweg: ['$12 = \\frac{x}{2}$', '$x = 24  | \\cdot 2$'] },
      { id: 'e2', aufgabe: '$2 = \\frac{x}{4}$', loesung: 8, rechenweg: ['$2 = \\frac{x}{4}$', '$x = 8  | \\cdot 4$'] },
      { id: 'e3', aufgabe: '$5 = \\frac{x}{3}$', loesung: 15, rechenweg: ['$5 = \\frac{x}{3}$', '$x = 15  | \\cdot 3$'] },
      { id: 'e4', aufgabe: '$4 = \\frac{x}{2}$', loesung: 8, rechenweg: ['$4 = \\frac{x}{2}$', '$x = 8  | \\cdot 2$'] },
      { id: 'e5', aufgabe: '$12 = \\frac{x}{6}$', loesung: 72, rechenweg: ['$12 = \\frac{x}{6}$', '$x = 72  | \\cdot 6$'] },
      { id: 'e6', aufgabe: '$8 = \\frac{24}{x}$', loesung: 3, rechenweg: ['$8 = \\frac{24}{x}$', '$8x = 24  | \\cdot x$', '$x = 3  | : 8$'] },
      { id: 'e7', aufgabe: '$2 = \\frac{4}{x}$', loesung: 2, rechenweg: ['$2 = \\frac{4}{x}$', '$2x = 4  | \\cdot x$', '$x = 2  | : 2$'] },
      { id: 'e8', aufgabe: '$5 = \\frac{15}{x}$', loesung: 3, rechenweg: ['$5 = \\frac{15}{x}$', '$5x = 15  | \\cdot x$', '$x = 3  | : 5$'] },
      { id: 'e9', aufgabe: '$2 = \\frac{10}{x}$', loesung: 5, rechenweg: ['$2 = \\frac{10}{x}$', '$2x = 10  | \\cdot x$', '$x = 5  | : 2$'] },
      { id: 'e10', aufgabe: '$8 = \\frac{40}{x}$', loesung: 5, rechenweg: ['$8 = \\frac{40}{x}$', '$8x = 40  | \\cdot x$', '$x = 5  | : 8$'] },
      { id: 'e11', aufgabe: '$\\frac{x}{3} + 10 = 18$', loesung: 24, rechenweg: ['$\\frac{x}{3} + 10 = 18$', '$\\frac{x}{3} = 8  | - 10$', '$x = 24  | \\cdot 3$'] },
      { id: 'e12', aufgabe: '$\\frac{x}{4} + 3 = 4$', loesung: 4, rechenweg: ['$\\frac{x}{4} + 3 = 4$', '$\\frac{x}{4} = 1  | - 3$', '$x = 4  | \\cdot 4$'] },
      { id: 'e13', aufgabe: '$\\frac{x}{5} + 5 = 11$', loesung: 30, rechenweg: ['$\\frac{x}{5} + 5 = 11$', '$\\frac{x}{5} = 6  | - 5$', '$x = 30  | \\cdot 5$'] },
      { id: 'e14', aufgabe: '$\\frac{x}{3} + 6 = 10$', loesung: 12, rechenweg: ['$\\frac{x}{3} + 6 = 10$', '$\\frac{x}{3} = 4  | - 6$', '$x = 12  | \\cdot 3$'] },
      { id: 'e15', aufgabe: '$\\frac{x}{2} + 7 = 9$', loesung: 4, rechenweg: ['$\\frac{x}{2} + 7 = 9$', '$\\frac{x}{2} = 2  | - 7$', '$x = 4  | \\cdot 2$'] },
      { id: 'e16', aufgabe: '$\\frac{x}{2} - 6 = 6$', loesung: 24, rechenweg: ['$\\frac{x}{2} - 6 = 6$', '$\\frac{x}{2} = 12  | + 6$', '$x = 24  | \\cdot 2$'] },
      { id: 'e17', aufgabe: '$\\frac{x}{6} - 5 = 1$', loesung: 36, rechenweg: ['$\\frac{x}{6} - 5 = 1$', '$\\frac{x}{6} = 6  | + 5$', '$x = 36  | \\cdot 6$'] },
      { id: 'e18', aufgabe: '$\\frac{x}{5} - 2 = 7$', loesung: 45, rechenweg: ['$\\frac{x}{5} - 2 = 7$', '$\\frac{x}{5} = 9  | + 2$', '$x = 45  | \\cdot 5$'] },
      { id: 'e19', aufgabe: '$\\frac{x}{2} - 5 = 10$', loesung: 30, rechenweg: ['$\\frac{x}{2} - 5 = 10$', '$\\frac{x}{2} = 15  | + 5$', '$x = 30  | \\cdot 2$'] },
    ],
  },
  {
    name: 'Mittel',
    aufgaben: [
      { id: 'm1', aufgabe: '$\\frac{x + 4}{4} = 11$', loesung: 40, rechenweg: ['$\\frac{x + 4}{4} = 11$', '$x + 4 = 44  | \\cdot 4$', '$x = 40  | - 4$'] },
      { id: 'm2', aufgabe: '$\\frac{x + 4}{2} = 2$', loesung: 0, rechenweg: ['$\\frac{x + 4}{2} = 2$', '$x + 4 = 4  | \\cdot 2$', '$x = 0  | - 4$'] },
      { id: 'm3', aufgabe: '$\\frac{x + 4}{4} = 3$', loesung: 8, rechenweg: ['$\\frac{x + 4}{4} = 3$', '$x + 4 = 12  | \\cdot 4$', '$x = 8  | - 4$'] },
      { id: 'm4', aufgabe: '$\\frac{x + 5}{2} = 8$', loesung: 11, rechenweg: ['$\\frac{x + 5}{2} = 8$', '$x + 5 = 16  | \\cdot 2$', '$x = 11  | - 5$'] },
      { id: 'm5', aufgabe: '$\\frac{x + 6}{5} = 12$', loesung: 54, rechenweg: ['$\\frac{x + 6}{5} = 12$', '$x + 6 = 60  | \\cdot 5$', '$x = 54  | - 6$'] },
      { id: 'm6', aufgabe: '$\\frac{x - 6}{3} = 7$', loesung: 27, rechenweg: ['$\\frac{x - 6}{3} = 7$', '$x - 6 = 21  | \\cdot 3$', '$x = 27  | + 6$'] },
      { id: 'm7', aufgabe: '$\\frac{x - 5}{3} = 12$', loesung: 41, rechenweg: ['$\\frac{x - 5}{3} = 12$', '$x - 5 = 36  | \\cdot 3$', '$x = 41  | + 5$'] },
      { id: 'm8', aufgabe: '$\\frac{x - 3}{2} = 11$', loesung: 25, rechenweg: ['$\\frac{x - 3}{2} = 11$', '$x - 3 = 22  | \\cdot 2$', '$x = 25  | + 3$'] },
      { id: 'm9', aufgabe: '$\\frac{x - 8}{3} = 4$', loesung: 20, rechenweg: ['$\\frac{x - 8}{3} = 4$', '$x - 8 = 12  | \\cdot 3$', '$x = 20  | + 8$'] },
      { id: 'm10', aufgabe: '$\\frac{x - 9}{5} = 6$', loesung: 39, rechenweg: ['$\\frac{x - 9}{5} = 6$', '$x - 9 = 30  | \\cdot 5$', '$x = 39  | + 9$'] },
      { id: 'm11', aufgabe: '$\\frac{3x}{2} = 6$', loesung: 4, rechenweg: ['$\\frac{3x}{2} = 6$', '$3x = 12  | \\cdot 2$', '$x = 4  | : 3$'] },
      { id: 'm12', aufgabe: '$\\frac{2x}{5} = 6$', loesung: 15, rechenweg: ['$\\frac{2x}{5} = 6$', '$2x = 30  | \\cdot 5$', '$x = 15  | : 2$'] },
      { id: 'm13', aufgabe: '$\\frac{2x}{6} = 6$', loesung: 18, rechenweg: ['$\\frac{2x}{6} = 6$', '$2x = 36  | \\cdot 6$', '$x = 18  | : 2$'] },
      { id: 'm14', aufgabe: '$\\frac{3x}{5} = 12$', loesung: 20, rechenweg: ['$\\frac{3x}{5} = 12$', '$3x = 60  | \\cdot 5$', '$x = 20  | : 3$'] },
      { id: 'm15', aufgabe: '$\\frac{3x}{3} = 6$', loesung: 6, rechenweg: ['$\\frac{3x}{3} = 6$', '$3x = 18  | \\cdot 3$', '$x = 6  | : 3$'] },
      { id: 'm16', aufgabe: '$\\frac{35}{x} + 5 = 12$', loesung: 5, rechenweg: ['$\\frac{35}{x} + 5 = 12$', '$\\frac{35}{x} = 7  | - 5$', '$35 = 7x  | \\cdot x$', '$x = 5  | : 7$'] },
      { id: 'm17', aufgabe: '$\\frac{40}{x} + 6 = 10$', loesung: 10, rechenweg: ['$\\frac{40}{x} + 6 = 10$', '$\\frac{40}{x} = 4  | - 6$', '$40 = 4x  | \\cdot x$', '$x = 10  | : 4$'] },
      { id: 'm18', aufgabe: '$\\frac{48}{x} + 4 = 10$', loesung: 8, rechenweg: ['$\\frac{48}{x} + 4 = 10$', '$\\frac{48}{x} = 6  | - 4$', '$48 = 6x  | \\cdot x$', '$x = 8  | : 6$'] },
      { id: 'm19', aufgabe: '$\\frac{21}{x} + 2 = 5$', loesung: 7, rechenweg: ['$\\frac{21}{x} + 2 = 5$', '$\\frac{21}{x} = 3  | - 2$', '$21 = 3x  | \\cdot x$', '$x = 7  | : 3$'] },
      { id: 'm20', aufgabe: '$\\frac{50}{x} + 1 = 6$', loesung: 10, rechenweg: ['$\\frac{50}{x} + 1 = 6$', '$\\frac{50}{x} = 5  | - 1$', '$50 = 5x  | \\cdot x$', '$x = 10  | : 5$'] },
      { id: 'm21', aufgabe: '$\\frac{4}{x - 3} = 2$', loesung: 5, rechenweg: ['$\\frac{4}{x - 3} = 2$', '$4 = 2(x - 3)  | \\cdot (x - 3)$', '$x - 3 = 2  | : 2$', '$x = 5  | + 3$'] },
      { id: 'm22', aufgabe: '$\\frac{28}{x - 7} = 7$', loesung: 11, rechenweg: ['$\\frac{28}{x - 7} = 7$', '$28 = 7(x - 7)  | \\cdot (x - 7)$', '$x - 7 = 4  | : 7$', '$x = 11  | + 7$'] },
      { id: 'm23', aufgabe: '$\\frac{15}{x - 7} = 5$', loesung: 10, rechenweg: ['$\\frac{15}{x - 7} = 5$', '$15 = 5(x - 7)  | \\cdot (x - 7)$', '$x - 7 = 3  | : 5$', '$x = 10  | + 7$'] },
      { id: 'm24', aufgabe: '$\\frac{54}{x - 5} = 6$', loesung: 14, rechenweg: ['$\\frac{54}{x - 5} = 6$', '$54 = 6(x - 5)  | \\cdot (x - 5)$', '$x - 5 = 9  | : 6$', '$x = 14  | + 5$'] },
    ],
  },
  {
    name: 'Schwer',
    aufgaben: [
      { id: 's1', aufgabe: '$\\frac{x + 7}{2} = \\frac{x + 3}{4}$', loesung: -11, rechenweg: ['$\\frac{x + 7}{2} = \\frac{x + 3}{4}$', '$4(x + 7) = 2(x + 3)  | \\text{Kreuzweise multiplizieren}$', '$4x + 28 = 2x + 6$', '$2x = -22  | -2x -28$', '$x = -11  | : 2$'] },
      { id: 's2', aufgabe: '$\\frac{x + 5}{5} = \\frac{x + 9}{2}$', loesung: -11.666667, rechenweg: ['$\\frac{x + 5}{5} = \\frac{x + 9}{2}$', '$2(x + 5) = 5(x + 9)  | \\text{Kreuzweise multiplizieren}$', '$2x + 10 = 5x + 45$', '$(-3)x = 35  | -5x -10$', '$x = \\frac{-35}{3} = -11.67  | : (-3)$'] },
      { id: 's3', aufgabe: '$\\frac{x + 5}{3} = \\frac{x + 9}{2}$', loesung: -17, rechenweg: ['$\\frac{x + 5}{3} = \\frac{x + 9}{2}$', '$2(x + 5) = 3(x + 9)  | \\text{Kreuzweise multiplizieren}$', '$2x + 10 = 3x + 27$', '$(-1)x = 17  | -3x -10$', '$x = -17  | : (-1)$'] },
      { id: 's4', aufgabe: '$\\frac{x + 9}{4} = \\frac{x + 9}{3}$', loesung: -9, rechenweg: ['$\\frac{x + 9}{4} = \\frac{x + 9}{3}$', '$3(x + 9) = 4(x + 9)  | \\text{Kreuzweise multiplizieren}$', '$3x + 27 = 4x + 36$', '$(-1)x = 9  | -4x -27$', '$x = -9  | : (-1)$'] },
      { id: 's5', aufgabe: '$\\frac{x + 8}{2} = \\frac{x + 1}{4}$', loesung: -15, rechenweg: ['$\\frac{x + 8}{2} = \\frac{x + 1}{4}$', '$4(x + 8) = 2(x + 1)  | \\text{Kreuzweise multiplizieren}$', '$4x + 32 = 2x + 2$', '$2x = -30  | -2x -32$', '$x = -15  | : 2$'] },
      { id: 's6', aufgabe: '$\\frac{x + 5}{2} = \\frac{x + 4}{4}$', loesung: -6, rechenweg: ['$\\frac{x + 5}{2} = \\frac{x + 4}{4}$', '$4(x + 5) = 2(x + 4)  | \\text{Kreuzweise multiplizieren}$', '$4x + 20 = 2x + 8$', '$2x = -12  | -2x -20$', '$x = -6  | : 2$'] },
      { id: 's7', aufgabe: '$\\frac{x}{2} + \\frac{x}{3} = 3$', loesung: 3.6, rechenweg: ['$\\frac{x}{2} + \\frac{x}{3} = 3$', '$\\frac{3x}{6} + \\frac{2x}{6} = 3  | \\text{Gemeinsamer Nenner } 6$', '$\\frac{5x}{6} = 3$', '$5x = 18  | \\cdot 6$', '$x = \\frac{18}{5} = 3.6  | : 5$'] },
      { id: 's8', aufgabe: '$\\frac{x}{2} + \\frac{x}{6} = 3$', loesung: 4.5, rechenweg: ['$\\frac{x}{2} + \\frac{x}{6} = 3$', '$\\frac{6x}{12} + \\frac{2x}{12} = 3  | \\text{Gemeinsamer Nenner } 12$', '$\\frac{8x}{12} = 3$', '$8x = 36  | \\cdot 12$', '$x = \\frac{9}{2} = 4.5  | : 8$'] },
      { id: 's9', aufgabe: '$\\frac{x}{6} + \\frac{x}{3} = 6$', loesung: 12, rechenweg: ['$\\frac{x}{6} + \\frac{x}{3} = 6$', '$\\frac{3x}{18} + \\frac{6x}{18} = 6  | \\text{Gemeinsamer Nenner } 18$', '$\\frac{9x}{18} = 6$', '$9x = 108  | \\cdot 18$', '$x = 12  | : 9$'] },
      { id: 's10', aufgabe: '$\\frac{x}{6} + \\frac{x}{3} = 10$', loesung: 20, rechenweg: ['$\\frac{x}{6} + \\frac{x}{3} = 10$', '$\\frac{3x}{18} + \\frac{6x}{18} = 10  | \\text{Gemeinsamer Nenner } 18$', '$\\frac{9x}{18} = 10$', '$9x = 180  | \\cdot 18$', '$x = 20  | : 9$'] },
      { id: 's11', aufgabe: '$\\frac{x}{3} + \\frac{x}{4} = 8$', loesung: 13.714286, rechenweg: ['$\\frac{x}{3} + \\frac{x}{4} = 8$', '$\\frac{4x}{12} + \\frac{3x}{12} = 8  | \\text{Gemeinsamer Nenner } 12$', '$\\frac{7x}{12} = 8$', '$7x = 96  | \\cdot 12$', '$x = \\frac{96}{7} = 13.71  | : 7$'] },
      { id: 's12', aufgabe: '$\\frac{x}{4} + \\frac{x}{6} = 10$', loesung: 24, rechenweg: ['$\\frac{x}{4} + \\frac{x}{6} = 10$', '$\\frac{6x}{24} + \\frac{4x}{24} = 10  | \\text{Gemeinsamer Nenner } 24$', '$\\frac{10x}{24} = 10$', '$10x = 240  | \\cdot 24$', '$x = 24  | : 10$'] },
      { id: 's13', aufgabe: '$\\frac{2}{x} = \\frac{11}{x + 9}$', loesung: 2, rechenweg: ['$\\frac{2}{x} = \\frac{11}{x + 9}$', '$2(x + 9) = 11x  | \\text{Kreuzweise multiplizieren}$', '$2x + 18 = 11x$', '$18 = 9x  | -2x$', '$x = 2  | : 9$'] },
      { id: 's14', aufgabe: '$\\frac{5}{x} = \\frac{11}{x + 4}$', loesung: 3.333333, rechenweg: ['$\\frac{5}{x} = \\frac{11}{x + 4}$', '$5(x + 4) = 11x  | \\text{Kreuzweise multiplizieren}$', '$5x + 20 = 11x$', '$20 = 6x  | -5x$', '$x = \\frac{10}{3} = 3.33  | : 6$'] },
      { id: 's15', aufgabe: '$\\frac{2}{x} = \\frac{3}{x + 1}$', loesung: 2, rechenweg: ['$\\frac{2}{x} = \\frac{3}{x + 1}$', '$2(x + 1) = 3x  | \\text{Kreuzweise multiplizieren}$', '$2x + 2 = 3x$', '$2 = 1x  | -2x$', '$x = 2  | : 1$'] },
      { id: 's16', aufgabe: '$\\frac{5}{x} = \\frac{6}{x + 8}$', loesung: 40, rechenweg: ['$\\frac{5}{x} = \\frac{6}{x + 8}$', '$5(x + 8) = 6x  | \\text{Kreuzweise multiplizieren}$', '$5x + 40 = 6x$', '$40 = 1x  | -5x$', '$x = 40  | : 1$'] },
      { id: 's17', aufgabe: '$\\frac{5}{x} = \\frac{10}{x + 3}$', loesung: 3, rechenweg: ['$\\frac{5}{x} = \\frac{10}{x + 3}$', '$5(x + 3) = 10x  | \\text{Kreuzweise multiplizieren}$', '$5x + 15 = 10x$', '$15 = 5x  | -5x$', '$x = 3  | : 5$'] },
      { id: 's18', aufgabe: '$\\frac{5x - 8}{3} = 9$', loesung: 7, rechenweg: ['$\\frac{5x - 8}{3} = 9$', '$5x - 8 = 27  | \\cdot 3$', '$5x = 35  | + 8$', '$x = 7  | : 5$'] },
      { id: 's19', aufgabe: '$\\frac{3x - 15}{2} = 3$', loesung: 7, rechenweg: ['$\\frac{3x - 15}{2} = 3$', '$3x - 15 = 6  | \\cdot 2$', '$3x = 21  | + 15$', '$x = 7  | : 3$'] },
      { id: 's20', aufgabe: '$\\frac{4x + 8}{5} = 8$', loesung: 8, rechenweg: ['$\\frac{4x + 8}{5} = 8$', '$4x + 8 = 40  | \\cdot 5$', '$4x = 32  | - 8$', '$x = 8  | : 4$'] },
      { id: 's21', aufgabe: '$\\frac{2x - 10}{2} = 2$', loesung: 7, rechenweg: ['$\\frac{2x - 10}{2} = 2$', '$2x - 10 = 4  | \\cdot 2$', '$2x = 14  | + 10$', '$x = 7  | : 2$'] },
      { id: 's22', aufgabe: '$\\frac{4x - 6}{2} = 5$', loesung: 4, rechenweg: ['$\\frac{4x - 6}{2} = 5$', '$4x - 6 = 10  | \\cdot 2$', '$4x = 16  | + 6$', '$x = 4  | : 4$'] },
      { id: 's23', aufgabe: '$\\frac{3x - 1}{5} = 4$', loesung: 7, rechenweg: ['$\\frac{3x - 1}{5} = 4$', '$3x - 1 = 20  | \\cdot 5$', '$3x = 21  | + 1$', '$x = 7  | : 3$'] },
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
                    <RechenwegDisplay steps={aufgabe.rechenweg} isLatex />
                    <p className="font-semibold text-purple-900 mt-2">
                      Lösung: <span className="font-mono bg-white px-1 rounded">x = {Math.round(aufgabe.loesung * 100) / 100}</span>
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
