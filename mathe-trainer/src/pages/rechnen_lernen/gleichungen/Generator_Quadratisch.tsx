import React, { useState } from 'react';

interface Aufgabe {
  id: string;
  aufgabe: string;
  loesungen: [number, number];
  rechenweg: string[];
}

const AUFGABEN_KATEGORIEN = [
  {
    name: 'Einfach',
    aufgaben: [
      { id: 'e1', aufgabe: 'x² = 4', loesungen: [-2, 2] as [number, number], rechenweg: ['x² = 4', 'x = ±2'] },
      { id: 'e2', aufgabe: 'x² = 9', loesungen: [-3, 3] as [number, number], rechenweg: ['x² = 9', 'x = ±3'] },
      { id: 'e3', aufgabe: 'x² = 25', loesungen: [-5, 5] as [number, number], rechenweg: ['x² = 25', 'x = ±5'] },
      { id: 'e4', aufgabe: 'x² = 16', loesungen: [-4, 4] as [number, number], rechenweg: ['x² = 16', 'x = ±4'] },
      { id: 'e5', aufgabe: 'x² = 1', loesungen: [-1, 1] as [number, number], rechenweg: ['x² = 1', 'x = ±1'] },
      { id: 'e6', aufgabe: 'x² = 36', loesungen: [-6, 6] as [number, number], rechenweg: ['x² = 36', 'x = ±6'] },
      { id: 'e7', aufgabe: 'x² = 49', loesungen: [-7, 7] as [number, number], rechenweg: ['x² = 49', 'x = ±7'] },
      { id: 'e8', aufgabe: 'x² = 64', loesungen: [-8, 8] as [number, number], rechenweg: ['x² = 64', 'x = ±8'] },
      { id: 'e9', aufgabe: 'x² = 81', loesungen: [-9, 9] as [number, number], rechenweg: ['x² = 81', 'x = ±9'] },
      { id: 'e10', aufgabe: 'x² = 100', loesungen: [-10, 10] as [number, number], rechenweg: ['x² = 100', 'x = ±10'] },
      { id: 'e11', aufgabe: 'x² = 121', loesungen: [-11, 11] as [number, number], rechenweg: ['x² = 121', 'x = ±11'] },
      { id: 'e12', aufgabe: 'x² = 144', loesungen: [-12, 12] as [number, number], rechenweg: ['x² = 144', 'x = ±12'] },
      { id: 'e13', aufgabe: 'x² = 169', loesungen: [-13, 13] as [number, number], rechenweg: ['x² = 169', 'x = ±13'] },
      { id: 'e14', aufgabe: 'x² = 196', loesungen: [-14, 14] as [number, number], rechenweg: ['x² = 196', 'x = ±14'] },
      { id: 'e15', aufgabe: 'x² = 0.25', loesungen: [-0.5, 0.5] as [number, number], rechenweg: ['x² = 0.25', 'x = ±0.5'] },
      { id: 'e16', aufgabe: 'x² = 2.25', loesungen: [-1.5, 1.5] as [number, number], rechenweg: ['x² = 2.25', 'x = ±1.5'] },
      { id: 'e17', aufgabe: 'x² = 6.25', loesungen: [-2.5, 2.5] as [number, number], rechenweg: ['x² = 6.25', 'x = ±2.5'] },
      { id: 'e18', aufgabe: 'x² = 12.25', loesungen: [-3.5, 3.5] as [number, number], rechenweg: ['x² = 12.25', 'x = ±3.5'] },
      { id: 'e19', aufgabe: 'x² = 0.01', loesungen: [-0.1, 0.1] as [number, number], rechenweg: ['x² = 0.01', 'x = ±0.1'] },
      { id: 'e20', aufgabe: 'x² = 0.04', loesungen: [-0.2, 0.2] as [number, number], rechenweg: ['x² = 0.04', 'x = ±0.2'] },
      { id: 'e21', aufgabe: 'x² = 0.09', loesungen: [-0.3, 0.3] as [number, number], rechenweg: ['x² = 0.09', 'x = ±0.3'] },
      { id: 'e22', aufgabe: 'x² = 0.16', loesungen: [-0.4, 0.4] as [number, number], rechenweg: ['x² = 0.16', 'x = ±0.4'] },
      { id: 'e23', aufgabe: 'x² = 1/4', loesungen: [-0.5, 0.5] as [number, number], rechenweg: ['x² = 1/4', 'x = ±0.5'] },
      { id: 'e24', aufgabe: 'x² = 9/4', loesungen: [-1.5, 1.5] as [number, number], rechenweg: ['x² = 9/4', 'x = ±1.5'] },
      { id: 'e25', aufgabe: 'x² = 1/9', loesungen: [-(1/3), (1/3)] as [number, number], rechenweg: ['x² = 1/9', 'x = ±1/3'] },
      { id: 'e26', aufgabe: 'x² = 4/9', loesungen: [-(2/3), (2/3)] as [number, number], rechenweg: ['x² = 4/9', 'x = ±2/3'] },
      { id: 'e27', aufgabe: '2x² = 8', loesungen: [-2, 2] as [number, number], rechenweg: ['2x² = 8  | :2', 'x² = 4', 'x = ±2'] },
      { id: 'e28', aufgabe: '3x² = 27', loesungen: [-3, 3] as [number, number], rechenweg: ['3x² = 27  | :3', 'x² = 9', 'x = ±3'] },
      { id: 'e29', aufgabe: '4x² = 16', loesungen: [-2, 2] as [number, number], rechenweg: ['4x² = 16  | :4', 'x² = 4', 'x = ±2'] },
      { id: 'e30', aufgabe: '5x² = 5', loesungen: [-1, 1] as [number, number], rechenweg: ['5x² = 5  | :5', 'x² = 1', 'x = ±1'] },
      { id: 'e31', aufgabe: 'x² - 4 = 0', loesungen: [-2, 2] as [number, number], rechenweg: ['x² - 4 = 0  | +4', 'x² = 4', 'x = ±2'] },
      { id: 'e32', aufgabe: 'x² - 9 = 0', loesungen: [-3, 3] as [number, number], rechenweg: ['x² - 9 = 0  | +9', 'x² = 9', 'x = ±3'] },
      { id: 'e33', aufgabe: 'x² - 25 = 0', loesungen: [-5, 5] as [number, number], rechenweg: ['x² - 25 = 0  | +25', 'x² = 25', 'x = ±5'] },
      { id: 'e34', aufgabe: 'x² - 1 = 0', loesungen: [-1, 1] as [number, number], rechenweg: ['x² - 1 = 0  | +1', 'x² = 1', 'x = ±1'] },
      { id: 'e35', aufgabe: 'x² - 16 = 0', loesungen: [-4, 4] as [number, number], rechenweg: ['x² - 16 = 0  | +16', 'x² = 16', 'x = ±4'] },
      { id: 'e36', aufgabe: 'x² - 36 = 0', loesungen: [-6, 6] as [number, number], rechenweg: ['x² - 36 = 0  | +36', 'x² = 36', 'x = ±6'] },
      { id: 'e37', aufgabe: 'x² - 49 = 0', loesungen: [-7, 7] as [number, number], rechenweg: ['x² - 49 = 0  | +49', 'x² = 49', 'x = ±7'] },
      { id: 'e38', aufgabe: 'x² - 64 = 0', loesungen: [-8, 8] as [number, number], rechenweg: ['x² - 64 = 0  | +64', 'x² = 64', 'x = ±8'] },
      { id: 'e39', aufgabe: 'x² - 81 = 0', loesungen: [-9, 9] as [number, number], rechenweg: ['x² - 81 = 0  | +81', 'x² = 81', 'x = ±9'] },
      { id: 'e40', aufgabe: 'x² - 100 = 0', loesungen: [-10, 10] as [number, number], rechenweg: ['x² - 100 = 0  | +100', 'x² = 100', 'x = ±10'] },
      { id: 'e41', aufgabe: 'x² + 1 = 5', loesungen: [-2, 2] as [number, number], rechenweg: ['x² + 1 = 5  | -1', 'x² = 4', 'x = ±2'] },
      { id: 'e42', aufgabe: 'x² + 2 = 6', loesungen: [-2, 2] as [number, number], rechenweg: ['x² + 2 = 6  | -2', 'x² = 4', 'x = ±2'] },
      { id: 'e43', aufgabe: 'x² + 3 = 12', loesungen: [-3, 3] as [number, number], rechenweg: ['x² + 3 = 12  | -3', 'x² = 9', 'x = ±3'] },
      { id: 'e44', aufgabe: 'x² + 5 = 21', loesungen: [-4, 4] as [number, number], rechenweg: ['x² + 5 = 21  | -5', 'x² = 16', 'x = ±4'] },
      { id: 'e45', aufgabe: 'x² + 7 = 32', loesungen: [-5, 5] as [number, number], rechenweg: ['x² + 7 = 32  | -7', 'x² = 25', 'x = ±5'] },
      { id: 'e46', aufgabe: '2x² - 2 = 0', loesungen: [-1, 1] as [number, number], rechenweg: ['2x² - 2 = 0  | +2', '2x² = 2  | :2', 'x² = 1', 'x = ±1'] },
      { id: 'e47', aufgabe: '3x² - 3 = 0', loesungen: [-1, 1] as [number, number], rechenweg: ['3x² - 3 = 0  | +3', '3x² = 3  | :3', 'x² = 1', 'x = ±1'] },
      { id: 'e48', aufgabe: '4x² - 4 = 0', loesungen: [-1, 1] as [number, number], rechenweg: ['4x² - 4 = 0  | +4', '4x² = 4  | :4', 'x² = 1', 'x = ±1'] },
      { id: 'e49', aufgabe: '5x² - 5 = 0', loesungen: [-1, 1] as [number, number], rechenweg: ['5x² - 5 = 0  | +5', '5x² = 5  | :5', 'x² = 1', 'x = ±1'] },
      { id: 'e50', aufgabe: 'x² = 225', loesungen: [-15, 15] as [number, number], rechenweg: ['x² = 225', 'x = ±15'] },
    ],
  },
  {
    name: 'Mittel',
    aufgaben: [
      { id: 'm1', aufgabe: 'x² = 0.0001', loesungen: [-0.01, 0.01] as [number, number], rechenweg: ['x² = 0.0001', 'x = ±0.01'] },
      { id: 'm2', aufgabe: 'x² = 3', loesungen: [-(Math.sqrt(3)), Math.sqrt(3)] as [number, number], rechenweg: ['x² = 3', 'x = ±√3 ≈ ±1.73'] },
      { id: 'm3', aufgabe: 'x² = 5', loesungen: [-(Math.sqrt(5)), Math.sqrt(5)] as [number, number], rechenweg: ['x² = 5', 'x = ±√5 ≈ ±2.24'] },
      { id: 'm4', aufgabe: 'x² = 7', loesungen: [-(Math.sqrt(7)), Math.sqrt(7)] as [number, number], rechenweg: ['x² = 7', 'x = ±√7 ≈ ±2.65'] },
      { id: 'm5', aufgabe: 'x² = 10', loesungen: [-(Math.sqrt(10)), Math.sqrt(10)] as [number, number], rechenweg: ['x² = 10', 'x = ±√10 ≈ ±3.16'] },
      { id: 'm6', aufgabe: '2x² = 50', loesungen: [-5, 5] as [number, number], rechenweg: ['2x² = 50  | :2', 'x² = 25', 'x = ±5'] },
      { id: 'm7', aufgabe: '3x² = 75', loesungen: [-5, 5] as [number, number], rechenweg: ['3x² = 75  | :3', 'x² = 25', 'x = ±5'] },
      { id: 'm8', aufgabe: '5x² = 20', loesungen: [-2, 2] as [number, number], rechenweg: ['5x² = 20  | :5', 'x² = 4', 'x = ±2'] },
      { id: 'm9', aufgabe: '7x² = 63', loesungen: [-3, 3] as [number, number], rechenweg: ['7x² = 63  | :7', 'x² = 9', 'x = ±3'] },
      { id: 'm10', aufgabe: '6x² = 24', loesungen: [-2, 2] as [number, number], rechenweg: ['6x² = 24  | :6', 'x² = 4', 'x = ±2'] },
      { id: 'm11', aufgabe: '2x² - 8 = 0', loesungen: [-2, 2] as [number, number], rechenweg: ['2x² - 8 = 0  | +8', '2x² = 8  | :2', 'x² = 4', 'x = ±2'] },
      { id: 'm12', aufgabe: '3x² - 12 = 0', loesungen: [-2, 2] as [number, number], rechenweg: ['3x² - 12 = 0  | +12', '3x² = 12  | :3', 'x² = 4', 'x = ±2'] },
      { id: 'm13', aufgabe: '5x² - 45 = 0', loesungen: [-3, 3] as [number, number], rechenweg: ['5x² - 45 = 0  | +45', '5x² = 45  | :5', 'x² = 9', 'x = ±3'] },
      { id: 'm14', aufgabe: '4x² - 64 = 0', loesungen: [-4, 4] as [number, number], rechenweg: ['4x² - 64 = 0  | +64', '4x² = 64  | :4', 'x² = 16', 'x = ±4'] },
      { id: 'm15', aufgabe: '2x² - 32 = 0', loesungen: [-4, 4] as [number, number], rechenweg: ['2x² - 32 = 0  | +32', '2x² = 32  | :2', 'x² = 16', 'x = ±4'] },
      { id: 'm16', aufgabe: 'x² + 8 = 17', loesungen: [-3, 3] as [number, number], rechenweg: ['x² + 8 = 17  | -8', 'x² = 9', 'x = ±3'] },
      { id: 'm17', aufgabe: 'x² + 4 = 20', loesungen: [-4, 4] as [number, number], rechenweg: ['x² + 4 = 20  | -4', 'x² = 16', 'x = ±4'] },
      { id: 'm18', aufgabe: 'x² + 10 = 26', loesungen: [-4, 4] as [number, number], rechenweg: ['x² + 10 = 26  | -10', 'x² = 16', 'x = ±4'] },
      { id: 'm19', aufgabe: 'x² + 15 = 31', loesungen: [-4, 4] as [number, number], rechenweg: ['x² + 15 = 31  | -15', 'x² = 16', 'x = ±4'] },
      { id: 'm20', aufgabe: 'x² + 20 = 29', loesungen: [-3, 3] as [number, number], rechenweg: ['x² + 20 = 29  | -20', 'x² = 9', 'x = ±3'] },
      { id: 'm21', aufgabe: '2x² + 8 = 40', loesungen: [-4, 4] as [number, number], rechenweg: ['2x² + 8 = 40  | -8', '2x² = 32  | :2', 'x² = 16', 'x = ±4'] },
      { id: 'm22', aufgabe: '3x² + 3 = 30', loesungen: [-3, 3] as [number, number], rechenweg: ['3x² + 3 = 30  | -3', '3x² = 27  | :3', 'x² = 9', 'x = ±3'] },
      { id: 'm23', aufgabe: '5x² + 5 = 50', loesungen: [-3, 3] as [number, number], rechenweg: ['5x² + 5 = 50  | -5', '5x² = 45  | :5', 'x² = 9', 'x = ±3'] },
      { id: 'm24', aufgabe: '4x² + 12 = 28', loesungen: [-2, 2] as [number, number], rechenweg: ['4x² + 12 = 28  | -12', '4x² = 16  | :4', 'x² = 4', 'x = ±2'] },
      { id: 'm25', aufgabe: '6x² + 6 = 42', loesungen: [-(Math.sqrt(6)), Math.sqrt(6)] as [number, number], rechenweg: ['6x² + 6 = 42  | -6', '6x² = 36  | :6', 'x² = 6', 'x = ±√6 ≈ ±2.45'] },
      { id: 'm26', aufgabe: 'x² - 7 = 9', loesungen: [-4, 4] as [number, number], rechenweg: ['x² - 7 = 9  | +7', 'x² = 16', 'x = ±4'] },
      { id: 'm27', aufgabe: 'x² - 5 = 11', loesungen: [-4, 4] as [number, number], rechenweg: ['x² - 5 = 11  | +5', 'x² = 16', 'x = ±4'] },
      { id: 'm28', aufgabe: 'x² - 6 = 10', loesungen: [-4, 4] as [number, number], rechenweg: ['x² - 6 = 10  | +6', 'x² = 16', 'x = ±4'] },
      { id: 'm29', aufgabe: 'x² - 8 = 17', loesungen: [-5, 5] as [number, number], rechenweg: ['x² - 8 = 17  | +8', 'x² = 25', 'x = ±5'] },
      { id: 'm30', aufgabe: 'x² - 12 = 25', loesungen: [-(Math.sqrt(37)), Math.sqrt(37)] as [number, number], rechenweg: ['x² - 12 = 25  | +12', 'x² = 37', 'x = ±√37 ≈ ±6.08'] },
      { id: 'm31', aufgabe: '2x² - 18 = 0', loesungen: [-3, 3] as [number, number], rechenweg: ['2x² - 18 = 0  | +18', '2x² = 18  | :2', 'x² = 9', 'x = ±3'] },
      { id: 'm32', aufgabe: '3x² - 27 = 0', loesungen: [-3, 3] as [number, number], rechenweg: ['3x² - 27 = 0  | +27', '3x² = 27  | :3', 'x² = 9', 'x = ±3'] },
      { id: 'm33', aufgabe: '4x² - 36 = 0', loesungen: [-3, 3] as [number, number], rechenweg: ['4x² - 36 = 0  | +36', '4x² = 36  | :4', 'x² = 9', 'x = ±3'] },
      { id: 'm34', aufgabe: '5x² - 80 = 0', loesungen: [-4, 4] as [number, number], rechenweg: ['5x² - 80 = 0  | +80', '5x² = 80  | :5', 'x² = 16', 'x = ±4'] },
      { id: 'm35', aufgabe: '6x² - 54 = 0', loesungen: [-3, 3] as [number, number], rechenweg: ['6x² - 54 = 0  | +54', '6x² = 54  | :6', 'x² = 9', 'x = ±3'] },
      { id: 'm36', aufgabe: '2x² + 6 = 38', loesungen: [-4, 4] as [number, number], rechenweg: ['2x² + 6 = 38  | -6', '2x² = 32  | :2', 'x² = 16', 'x = ±4'] },
      { id: 'm37', aufgabe: '3x² + 12 = 39', loesungen: [-3, 3] as [number, number], rechenweg: ['3x² + 12 = 39  | -12', '3x² = 27  | :3', 'x² = 9', 'x = ±3'] },
      { id: 'm38', aufgabe: '4x² + 9 = 25', loesungen: [-2, 2] as [number, number], rechenweg: ['4x² + 9 = 25  | -9', '4x² = 16  | :4', 'x² = 4', 'x = ±2'] },
      { id: 'm39', aufgabe: '5x² + 4 = 104', loesungen: [-(2*Math.sqrt(5)), 2*Math.sqrt(5)] as [number, number], rechenweg: ['5x² + 4 = 104  | -4', '5x² = 100  | :5', 'x² = 20', 'x = ±2√5 ≈ ±4.47'] },
      { id: 'm40', aufgabe: '6x² + 15 = 51', loesungen: [-(Math.sqrt(6)), Math.sqrt(6)] as [number, number], rechenweg: ['6x² + 15 = 51  | -15', '6x² = 36  | :6', 'x² = 6', 'x = ±√6 ≈ ±2.45'] },
      { id: 'm41', aufgabe: 'x² = 121', loesungen: [-11, 11] as [number, number], rechenweg: ['x² = 121', 'x = ±11'] },
      { id: 'm42', aufgabe: 'x² = 169', loesungen: [-13, 13] as [number, number], rechenweg: ['x² = 169', 'x = ±13'] },
      { id: 'm43', aufgabe: 'x² = 0.0625', loesungen: [-0.25, 0.25] as [number, number], rechenweg: ['x² = 0.0625', 'x = ±0.25'] },
      { id: 'm44', aufgabe: 'x² = 1.69', loesungen: [-1.3, 1.3] as [number, number], rechenweg: ['x² = 1.69', 'x = ±1.3'] },
      { id: 'm45', aufgabe: 'x² = 2.89', loesungen: [-1.7, 1.7] as [number, number], rechenweg: ['x² = 2.89', 'x = ±1.7'] },
      { id: 'm46', aufgabe: 'x² = 16/9', loesungen: [-(4/3), (4/3)] as [number, number], rechenweg: ['x² = 16/9', 'x = ±4/3 ≈ ±1.33'] },
      { id: 'm47', aufgabe: 'x² = 25/16', loesungen: [-(5/4), (5/4)] as [number, number], rechenweg: ['x² = 25/16', 'x = ±5/4 = ±1.25'] },
      { id: 'm48', aufgabe: 'x² = 49/25', loesungen: [-(7/5), (7/5)] as [number, number], rechenweg: ['x² = 49/25', 'x = ±7/5 = ±1.4'] },
      { id: 'm49', aufgabe: 'x² = 64/49', loesungen: [-(8/7), (8/7)] as [number, number], rechenweg: ['x² = 64/49', 'x = ±8/7 ≈ ±1.14'] },
      { id: 'm50', aufgabe: 'x² = 1.44', loesungen: [-1.2, 1.2] as [number, number], rechenweg: ['x² = 1.44', 'x = ±1.2'] },
    ],
  },
  {
    name: 'Schwer',
    aufgaben: [
      { id: 's1', aufgabe: '2x² = 18', loesungen: [-3, 3] as [number, number], rechenweg: ['2x² = 18  | :2', 'x² = 9', 'x = ±3'] },
      { id: 's2', aufgabe: '3x² = 48', loesungen: [-4, 4] as [number, number], rechenweg: ['3x² = 48  | :3', 'x² = 16', 'x = ±4'] },
      { id: 's3', aufgabe: '4x² = 100', loesungen: [-5, 5] as [number, number], rechenweg: ['4x² = 100  | :4', 'x² = 25', 'x = ±5'] },
      { id: 's4', aufgabe: '5x² = 125', loesungen: [-5, 5] as [number, number], rechenweg: ['5x² = 125  | :5', 'x² = 25', 'x = ±5'] },
      { id: 's5', aufgabe: '6x² = 54', loesungen: [-3, 3] as [number, number], rechenweg: ['6x² = 54  | :6', 'x² = 9', 'x = ±3'] },
      { id: 's6', aufgabe: 'x² - 2 = 14', loesungen: [-4, 4] as [number, number], rechenweg: ['x² - 2 = 14  | +2', 'x² = 16', 'x = ±4'] },
      { id: 's7', aufgabe: 'x² - 3 = 22', loesungen: [-5, 5] as [number, number], rechenweg: ['x² - 3 = 22  | +3', 'x² = 25', 'x = ±5'] },
      { id: 's8', aufgabe: '2x² - 50 = 0', loesungen: [-5, 5] as [number, number], rechenweg: ['2x² - 50 = 0  | +50', '2x² = 50  | :2', 'x² = 25', 'x = ±5'] },
      { id: 's9', aufgabe: '3x² - 75 = 0', loesungen: [-5, 5] as [number, number], rechenweg: ['3x² - 75 = 0  | +75', '3x² = 75  | :3', 'x² = 25', 'x = ±5'] },
      { id: 's10', aufgabe: '4x² - 100 = 0', loesungen: [-5, 5] as [number, number], rechenweg: ['4x² - 100 = 0  | +100', '4x² = 100  | :4', 'x² = 25', 'x = ±5'] },
      { id: 's11', aufgabe: 'x² = 11', loesungen: [-(Math.sqrt(11)), Math.sqrt(11)] as [number, number], rechenweg: ['x² = 11', 'x = ±√11 ≈ ±3.32'] },
      { id: 's12', aufgabe: 'x² = 13', loesungen: [-(Math.sqrt(13)), Math.sqrt(13)] as [number, number], rechenweg: ['x² = 13', 'x = ±√13 ≈ ±3.61'] },
      { id: 's13', aufgabe: 'x² = 15', loesungen: [-(Math.sqrt(15)), Math.sqrt(15)] as [number, number], rechenweg: ['x² = 15', 'x = ±√15 ≈ ±3.87'] },
      { id: 's14', aufgabe: 'x² = 21', loesungen: [-(Math.sqrt(21)), Math.sqrt(21)] as [number, number], rechenweg: ['x² = 21', 'x = ±√21 ≈ ±4.58'] },
      { id: 's15', aufgabe: 'x² = 35', loesungen: [-(Math.sqrt(35)), Math.sqrt(35)] as [number, number], rechenweg: ['x² = 35', 'x = ±√35 ≈ ±5.92'] },
      { id: 's16', aufgabe: '2x² = 3', loesungen: [-(Math.sqrt(1.5)), Math.sqrt(1.5)] as [number, number], rechenweg: ['2x² = 3  | :2', 'x² = 1.5', 'x = ±√1.5 ≈ ±1.22'] },
      { id: 's17', aufgabe: '3x² = 7', loesungen: [-(Math.sqrt(7/3)), Math.sqrt(7/3)] as [number, number], rechenweg: ['3x² = 7  | :3', 'x² = 7/3', 'x = ±√(7/3) ≈ ±1.53'] },
      { id: 's18', aufgabe: '4x² = 11', loesungen: [-(Math.sqrt(11/4)), Math.sqrt(11/4)] as [number, number], rechenweg: ['4x² = 11  | :4', 'x² = 11/4', 'x = ±√(11/4) ≈ ±1.66'] },
      { id: 's19', aufgabe: '5x² = 23', loesungen: [-(Math.sqrt(23/5)), Math.sqrt(23/5)] as [number, number], rechenweg: ['5x² = 23  | :5', 'x² = 23/5', 'x = ±√(23/5) ≈ ±2.14'] },
      { id: 's20', aufgabe: '7x² = 49', loesungen: [-(Math.sqrt(7)), Math.sqrt(7)] as [number, number], rechenweg: ['7x² = 49  | :7', 'x² = 7', 'x = ±√7 ≈ ±2.65'] },
      { id: 's21', aufgabe: '2x² + 2 = 18', loesungen: [-2.83, 2.83] as [number, number], rechenweg: ['2x² + 2 = 18  | -2', '2x² = 16  | :2', 'x² = 8', 'x = ±2√2 ≈ ±2.83'] },
      { id: 's22', aufgabe: '3x² + 5 = 32', loesungen: [-3, 3] as [number, number], rechenweg: ['3x² + 5 = 32  | -5', '3x² = 27  | :3', 'x² = 9', 'x = ±3'] },
      { id: 's23', aufgabe: '4x² - 7 = 9', loesungen: [-2, 2] as [number, number], rechenweg: ['4x² - 7 = 9  | +7', '4x² = 16  | :4', 'x² = 4', 'x = ±2'] },
      { id: 's24', aufgabe: '5x² + 10 = 60', loesungen: [-(Math.sqrt(10)), Math.sqrt(10)] as [number, number], rechenweg: ['5x² + 10 = 60  | -10', '5x² = 50  | :5', 'x² = 10', 'x = ±√10 ≈ ±3.16'] },
      { id: 's25', aufgabe: '6x² - 18 = 30', loesungen: [-(Math.sqrt(8)), Math.sqrt(8)] as [number, number], rechenweg: ['6x² - 18 = 30  | +18', '6x² = 48  | :6', 'x² = 8', 'x = ±2√2 ≈ ±2.83'] },
      { id: 's26', aufgabe: 'x² + 0.5 = 4.5', loesungen: [-2, 2] as [number, number], rechenweg: ['x² + 0.5 = 4.5  | -0.5', 'x² = 4', 'x = ±2'] },
      { id: 's27', aufgabe: 'x² - 1.5 = 2.5', loesungen: [-2, 2] as [number, number], rechenweg: ['x² - 1.5 = 2.5  | +1.5', 'x² = 4', 'x = ±2'] },
      { id: 's28', aufgabe: '0.5x² = 2', loesungen: [-2, 2] as [number, number], rechenweg: ['0.5x² = 2  | ×2', 'x² = 4', 'x = ±2'] },
      { id: 's29', aufgabe: '1.5x² = 6', loesungen: [-2, 2] as [number, number], rechenweg: ['1.5x² = 6  | :1.5', 'x² = 4', 'x = ±2'] },
      { id: 's30', aufgabe: '2.5x² = 10', loesungen: [-2, 2] as [number, number], rechenweg: ['2.5x² = 10  | :2.5', 'x² = 4', 'x = ±2'] },
      { id: 's31', aufgabe: 'x² = 1/16', loesungen: [-(1/4), (1/4)] as [number, number], rechenweg: ['x² = 1/16', 'x = ±1/4'] },
      { id: 's32', aufgabe: 'x² = 4/25', loesungen: [-(2/5), (2/5)] as [number, number], rechenweg: ['x² = 4/25', 'x = ±2/5'] },
      { id: 's33', aufgabe: 'x² = 9/16', loesungen: [-(3/4), (3/4)] as [number, number], rechenweg: ['x² = 9/16', 'x = ±3/4'] },
      { id: 's34', aufgabe: 'x² = 16/25', loesungen: [-(4/5), (4/5)] as [number, number], rechenweg: ['x² = 16/25', 'x = ±4/5'] },
      { id: 's35', aufgabe: 'x² = 25/36', loesungen: [-(5/6), (5/6)] as [number, number], rechenweg: ['x² = 25/36', 'x = ±5/6'] },
      { id: 's36', aufgabe: '2x² = 1/2', loesungen: [-(1/2), (1/2)] as [number, number], rechenweg: ['2x² = 1/2  | :2', 'x² = 1/4', 'x = ±1/2'] },
      { id: 's37', aufgabe: '3x² = 3/4', loesungen: [-(1/2), (1/2)] as [number, number], rechenweg: ['3x² = 3/4  | :3', 'x² = 1/4', 'x = ±1/2'] },
      { id: 's38', aufgabe: '4x² = 1', loesungen: [-(1/2), (1/2)] as [number, number], rechenweg: ['4x² = 1  | :4', 'x² = 1/4', 'x = ±1/2'] },
      { id: 's39', aufgabe: 'x² = 0.000001', loesungen: [-0.001, 0.001] as [number, number], rechenweg: ['x² = 0.000001', 'x = ±0.001'] },
      { id: 's40', aufgabe: 'x² = 10000', loesungen: [-100, 100] as [number, number], rechenweg: ['x² = 10000', 'x = ±100'] },
      { id: 's41', aufgabe: '2x² = 200', loesungen: [-10, 10] as [number, number], rechenweg: ['2x² = 200  | :2', 'x² = 100', 'x = ±10'] },
      { id: 's42', aufgabe: '3x² = 300', loesungen: [-10, 10] as [number, number], rechenweg: ['3x² = 300  | :3', 'x² = 100', 'x = ±10'] },
      { id: 's43', aufgabe: 'x² - 99 = 1', loesungen: [-10, 10] as [number, number], rechenweg: ['x² - 99 = 1  | +99', 'x² = 100', 'x = ±10'] },
      { id: 's44', aufgabe: 'x² + 75 = 100', loesungen: [-5, 5] as [number, number], rechenweg: ['x² + 75 = 100  | -75', 'x² = 25', 'x = ±5'] },
      { id: 's45', aufgabe: '2x² - 200 = 0', loesungen: [-10, 10] as [number, number], rechenweg: ['2x² - 200 = 0  | +200', '2x² = 200  | :2', 'x² = 100', 'x = ±10'] },
      { id: 's46', aufgabe: '3x² - 300 = 0', loesungen: [-10, 10] as [number, number], rechenweg: ['3x² - 300 = 0  | +300', '3x² = 300  | :3', 'x² = 100', 'x = ±10'] },
      { id: 's47', aufgabe: '5x² = 500', loesungen: [-10, 10] as [number, number], rechenweg: ['5x² = 500  | :5', 'x² = 100', 'x = ±10'] },
      { id: 's48', aufgabe: 'x² = 0.0001', loesungen: [-0.01, 0.01] as [number, number], rechenweg: ['x² = 0.0001', 'x = ±0.01'] },
      { id: 's49', aufgabe: 'x² = 40', loesungen: [-(2*Math.sqrt(10)), 2*Math.sqrt(10)] as [number, number], rechenweg: ['x² = 40', 'x = ±2√10 ≈ ±6.32'] },
      { id: 's50', aufgabe: 'x² = 48', loesungen: [-(4*Math.sqrt(3)), 4*Math.sqrt(3)] as [number, number], rechenweg: ['x² = 48', 'x = ±4√3 ≈ ±6.93'] },
    ],
  },
];

const areEquivalentSolutions = (userInput: string, solutions: [number, number]): boolean => {
  const userInputLower = userInput.toLowerCase().trim();
  const [sol1, sol2] = solutions;
  
  const checkMatch = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal < 0.0001) return userInputLower === '0';
    const rounded = Math.round(val * 100) / 100;
    return (
      userInputLower === val.toString() ||
      userInputLower === rounded.toString() ||
      userInputLower === val.toFixed(1) ||
      userInputLower === val.toFixed(2) ||
      userInputLower === val.toFixed(3)
    );
  };

  return checkMatch(sol1) || checkMatch(sol2);
};

const validateDualSolution = (value1: string, value2: string, solutions: [number, number]): boolean => {
  const [sol1, sol2] = solutions;
  
  const checkMatch = (userInput: string, targetValue: number) => {
    const userInputLower = userInput.toLowerCase().trim();
    const absVal = Math.abs(targetValue);
    if (absVal < 0.0001) return userInputLower === '0';
    const rounded = Math.round(targetValue * 100) / 100;
    return (
      userInputLower === targetValue.toString() ||
      userInputLower === rounded.toString() ||
      userInputLower === targetValue.toFixed(1) ||
      userInputLower === targetValue.toFixed(2) ||
      userInputLower === targetValue.toFixed(3)
    );
  };

  // Prüfe: (value1 = sol1 && value2 = sol2) ODER (value1 = sol2 && value2 = sol1)
  return (
    (checkMatch(value1, sol1) && checkMatch(value2, sol2)) ||
    (checkMatch(value1, sol2) && checkMatch(value2, sol1))
  );
};

const Generator_Quadratisch: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value1: string; value2: string; isCorrect: boolean | null }>>({});
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});

  const currentKategorie = AUFGABEN_KATEGORIEN[selectedCategory];
  const currentAufgaben = currentKategorie.aufgaben;

  const handleInputChange = (aufgabenId: string, value1: string, value2: string) => {
    const trimmedValue1 = value1.trim();
    const trimmedValue2 = value2.trim();
    const aufgabe = currentAufgaben.find((a) => a.id === aufgabenId);
    if (!aufgabe) return;

    // Beide Werte müssen zusammen mit den Lösungen übereinstimmen
    let isCorrect: boolean | null = null;
    if (trimmedValue1 && trimmedValue2) {
      // Beide Werte vorhanden - vollständig validieren
      isCorrect = validateDualSolution(trimmedValue1, trimmedValue2, aufgabe.loesungen);
    } else if (trimmedValue1 || trimmedValue2) {
      // Nur ein Wert vorhanden - noch unvollständig, null lassen
      isCorrect = null;
    }

    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [aufgabenId]: { value1: trimmedValue1, value2: trimmedValue2, isCorrect },
    }));
  };

  const toggleSolution = (aufgabenId: string) => {
    setShowSolutions({
      ...showSolutions,
      [aufgabenId]: !showSolutions[aufgabenId],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Quadratische Gleichungen (rein)</h1>
          <p className="text-xs text-gray-600">
            Löse die rein quadratischen Gleichungen. Gib eine Lösung ein (z.B.: 5, -2, 1.5)
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
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
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
            const answer = answers[aufgabe.id] || { value1: '', value2: '', isCorrect: null };
            const showSolution = showSolutions[aufgabe.id] || false;

            return (
              <div key={aufgabe.id} className="space-y-1">
                {/* Aufgabe in einer Zeile */}
                <div className="bg-white rounded p-2 shadow border-l-2 border-blue-300 flex items-center gap-2">
                  {/* Nummer */}
                  <span className="text-sm font-bold text-gray-600 whitespace-nowrap flex-shrink-0">
                    {index + 1})
                  </span>

                  {/* Aufgabe */}
                  <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 whitespace-nowrap flex-shrink-0 min-w-0">
                    {aufgabe.aufgabe}
                  </div>

                  {/* Gleichheitszeichen */}
                  <span className="text-lg font-bold text-gray-500 flex-shrink-0">=</span>

                  {/* Input Container */}
                  <div className="flex gap-1 flex-shrink-0">
                    {/* Input 1 */}
                    <input
                      key={`input1-${aufgabe.id}`}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      placeholder="..."
                      value={answer.value1}
                      onChange={(e) => {
                        const newValue1 = e.target.value;
                        handleInputChange(aufgabe.id, newValue1, answer.value2);
                      }}
                      style={{ pointerEvents: 'auto' }}
                      className={`w-16 px-2 py-1 rounded border-2 font-mono text-sm transition-all outline-none cursor-text ${
                        answer.isCorrect === null
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
                          : answer.isCorrect
                          ? 'border-green-500 bg-green-50 focus:ring-1 focus:ring-green-200'
                          : 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-200'
                      }`}
                    />

                    {/* Input 2 */}
                    <input
                      key={`input2-${aufgabe.id}`}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      placeholder="..."
                      value={answer.value2}
                      onChange={(e) => {
                        const newValue2 = e.target.value;
                        handleInputChange(aufgabe.id, answer.value1, newValue2);
                      }}
                      style={{ pointerEvents: 'auto' }}
                      className={`w-16 px-2 py-1 rounded border-2 font-mono text-sm transition-all outline-none cursor-text ${
                        answer.isCorrect === null
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
                          : answer.isCorrect
                          ? 'border-green-500 bg-green-50 focus:ring-1 focus:ring-green-200'
                          : 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-200'
                      }`}
                    />
                  </div>

                  {/* Status Indicator */}
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
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
                    className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all whitespace-nowrap font-semibold flex-shrink-0"
                  >
                    {showSolution ? '✕' : '?'}
                  </button>
                </div>

                {/* Rechenweg - ausklappbar unter der Aufgabe */}
                {showSolution && (
                  <div className="p-2 bg-blue-50 rounded border-l-2 border-blue-400 text-sm ml-8">
                    <div className="space-y-0.5">
                      {aufgabe.rechenweg.map((schritt, i) => (
                        <p key={i} className="text-gray-700">
                          {i > 0 && '→ '} {schritt}
                        </p>
                      ))}
                    </div>
                    <p className="font-semibold text-blue-900 mt-1">
                      Lösungen: <span className="font-mono bg-white px-1 rounded">{aufgabe.loesungen[0]} und {aufgabe.loesungen[1]}</span>
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
              className="bg-blue-500 h-2 rounded-full transition-all"
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

export default Generator_Quadratisch;
