export type GeometrySketch =
  | { type: 'rectangle'; a: number; b: number; unit: string }
  | { type: 'triangle'; base: number; height: number; unit: string }
  | { type: 'circle'; radius: number; unit: string }
  | { type: 'trapezoid'; a: number; c: number; h: number; unit: string }
  | { type: 'rightTriangle'; a: number; b: number; c?: number; unit: string }
  | { type: 'sphere'; radius: number; unit: string }
  | { type: 'cone'; radius: number; height: number; unit: string }
  | { type: 'pyramid'; baseA: number; baseB: number; height: number; unit: string }
  | { type: 'cylinder'; radius: number; height: number; unit: string }
  | { type: 'prismRect'; length: number; width: number; height: number; unit: string }
  | { type: 'prismTri'; base: number; heightTriangle: number; prismHeight: number; unit: string }
  | { type: 'prismTrap'; baseA: number; baseC: number; heightTrap: number; prismHeight: number; unit: string }
  | { type: 'prismPent'; side: number; apothem: number; prismHeight: number; unit: string }
  | { type: 'netPrism'; length: number; width: number; height: number; unit: string }
  | { type: 'netCylinder'; radius: number; height: number; unit: string }
  | { type: 'compositeL'; width: number; height: number; cutWidth: number; cutHeight: number; unit: string }
  | { type: 'compositeRectSemi'; width: number; height: number; radius: number; unit: string };

export interface GeometryTask {
  id: string;
  topic: string;
  title: string;
  prompt: string;
  contextTag: string;
  givens: Array<{ label: string; value: string }>;
  formula: string;
  resultLabel: string;
  unit: string;
  result: number;
  decimals: number;
  steps: string[];
  tip?: string;
  tolerance?: number;
  sketch?: GeometrySketch;
}

export type GeometryGenerator = () => GeometryTask;

const toGerman = (value: number, decimals = 2) =>
  value.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
};

const createTaskId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const defaultTolerance = (target: number) => Math.max(0.05, Math.abs(target) * 0.015);

export const generateSurfaceTask: GeometryGenerator = () => {
  const shape = randomBetween(1, 8);

  if (shape === 1) {
    const a = randomFloat(4, 14, 1);
    const b = randomFloat(3, 12, 1);
    const area = parseFloat((a * b).toFixed(2));
    return {
      id: createTaskId('rect'),
      topic: 'flaechen',
      title: 'Rechteckfläche planen',
      prompt: 'Berechne die Fläche eines rechteckigen Messestandes.',
      contextTag: 'Eventfläche',
      givens: [
        { label: 'Seite a', value: `${toGerman(a, 1)} m` },
        { label: 'Seite b', value: `${toGerman(b, 1)} m` }
      ],
      formula: 'A = a · b',
      resultLabel: 'Fläche',
      unit: 'm²',
      result: area,
      decimals: 2,
      steps: [
        `A = ${toGerman(a, 1)} · ${toGerman(b, 1)}`,
        `A = ${toGerman(area)} m²`
      ],
      tip: 'Rechne mit Metern und runde auf zwei Nachkommastellen.',
      tolerance: defaultTolerance(area),
      sketch: {
        type: 'rectangle',
        a,
        b,
        unit: 'm'
      }
    };
  }

  if (shape === 2) {
    const base = randomFloat(6, 18, 1);
    const height = randomFloat(4, 12, 1);
    const area = parseFloat(((base * height) / 2).toFixed(2));
    return {
      id: createTaskId('triangle'),
      topic: 'flaechen',
      title: 'Dreiecksfläche bestimmen',
      prompt: 'Eine Dachfläche bildet ein Dreieck. Berechne den Flächeninhalt.',
      contextTag: 'Dachplanung',
      givens: [
        { label: 'Grundseite', value: `${toGerman(base, 1)} dm` },
        { label: 'Höhe', value: `${toGerman(height, 1)} dm` }
      ],
      formula: 'A = (a · h) / 2',
      resultLabel: 'Fläche',
      unit: 'dm²',
      result: area,
      decimals: 2,
      steps: [
        `A = (${toGerman(base, 1)} · ${toGerman(height, 1)}) / 2`,
        `A = ${toGerman(area)} dm²`
      ],
      tolerance: defaultTolerance(area),
      sketch: {
        type: 'triangle',
        base,
        height,
        unit: 'dm'
      }
    };
  }

  if (shape === 3) {
    const radius = randomFloat(2, 8, 1);
    const area = parseFloat((Math.PI * radius * radius).toFixed(2));
    return {
      id: createTaskId('circle'),
      topic: 'flaechen',
      title: 'Kreisfläche kalkulieren',
      prompt: 'Ein runder Springbrunnen soll verfliest werden. Berechne die Fläche.',
      contextTag: 'Außenanlage',
      givens: [{ label: 'Radius', value: `${toGerman(radius, 1)} m` }],
      formula: 'A = π · r²',
      resultLabel: 'Fläche',
      unit: 'm²',
      result: area,
      decimals: 2,
      steps: [
        `A = π · (${toGerman(radius, 1)})²`,
        `A ≈ ${toGerman(area)} m²`
      ],
      tip: 'Verwende π ≈ 3,1416.',
      tolerance: defaultTolerance(area),
      sketch: {
        type: 'circle',
        radius,
        unit: 'm'
      }
    };
  }

  if (shape === 4) {
    const a = randomFloat(4, 10, 1);
    const c = randomFloat(2, 8, 1);
    const h = randomFloat(3, 9, 1);
    const area = parseFloat((((a + c) / 2) * h).toFixed(2));
    return {
      id: createTaskId('trapez'),
      topic: 'flaechen',
      title: 'Trapezfläche berechnen',
      prompt: 'Der Grundriss einer Rampe ist trapezförmig. Bestimme den Flächeninhalt.',
      contextTag: 'Werkstatt',
      givens: [
        { label: 'Basis a', value: `${toGerman(a, 1)} cm` },
        { label: 'Basis c', value: `${toGerman(c, 1)} cm` },
        { label: 'Höhe', value: `${toGerman(h, 1)} cm` }
      ],
      formula: 'A = (a + c) / 2 · h',
      resultLabel: 'Fläche',
      unit: 'cm²',
      result: area,
      decimals: 2,
      steps: [
        `A = (${toGerman(a, 1)} + ${toGerman(c, 1)}) / 2 · ${toGerman(h, 1)}`,
        `A = ${toGerman(area)} cm²`
      ],
      tolerance: defaultTolerance(area),
      sketch: {
        type: 'trapezoid',
        a,
        c,
        h,
        unit: 'cm'
      }
    };
  }

  if (shape === 5) {
    const length = randomFloat(2.5, 6, 1);
    const width = randomFloat(2, 5, 1);
    const height = randomFloat(2, 4.5, 1);
    const area = parseFloat((2 * (length * width + length * height + width * height)).toFixed(2));
    return {
      id: createTaskId('netz-quader'),
      topic: 'flaechen',
      title: 'Netz eines Quaders',
      prompt: 'Ein Verpackungsnetz für einen Quader liegt ausgebreitet vor. Berechne den gesamten Folienbedarf.',
      contextTag: 'Verpackung',
      givens: [
        { label: 'Kante a', value: `${toGerman(length, 1)} dm` },
        { label: 'Kante b', value: `${toGerman(width, 1)} dm` },
        { label: 'Kante h', value: `${toGerman(height, 1)} dm` }
      ],
      formula: 'O = 2 · (a · b + a · h + b · h)',
      resultLabel: 'Fläche',
      unit: 'dm²',
      result: area,
      decimals: 2,
      steps: [
        `A_1 = a · b`,
        `A_2 = a · h`,
        `A_3 = b · h`,
        `O = 2 · (A_1 + A_2 + A_3) = ${toGerman(area)} dm²`
      ],
      tolerance: defaultTolerance(area),
      sketch: {
        type: 'netPrism',
        length,
        width,
        height,
        unit: 'dm'
      }
    };
  }

  if (shape === 6) {
    const radius = randomFloat(1.5, 4, 1);
    const height = randomFloat(4, 9, 1);
    const area = parseFloat(((2 * Math.PI * radius * height) + (2 * Math.PI * radius ** 2)).toFixed(2));
    return {
      id: createTaskId('netz-zylinder'),
      topic: 'flaechen',
      title: 'Zylindernetz berechnen',
      prompt: 'Ein Blechmantel plus Deckel und Boden sollen aus dem Netz eines Zylinders ausgeschnitten werden. Bestimme die Fläche.',
      contextTag: 'Blechbearbeitung',
      givens: [
        { label: 'Radius', value: `${toGerman(radius, 1)} m` },
        { label: 'Höhe', value: `${toGerman(height, 1)} m` }
      ],
      formula: 'O = 2 · π · r² + 2 · π · r · h',
      resultLabel: 'Fläche',
      unit: 'm²',
      result: area,
      decimals: 2,
      steps: [
        `A_{Kreise} = 2 · π · r²`,
        `A_{Mantel} = 2 · π · r · h`,
        `O = A_{Kreise} + A_{Mantel} ≈ ${toGerman(area)} m²`
      ],
      tolerance: defaultTolerance(area),
      sketch: {
        type: 'netCylinder',
        radius,
        height,
        unit: 'm'
      }
    };
  }

  if (shape === 7) {
    const width = randomFloat(6, 14, 1);
    const height = randomFloat(5, 12, 1);
    const cutWidth = randomFloat(2, parseFloat((width - 1).toFixed(1)), 1);
    const cutHeight = randomFloat(2, parseFloat((height - 1).toFixed(1)), 1);
    const area = parseFloat((width * height - cutWidth * cutHeight).toFixed(2));
    return {
      id: createTaskId('mix-l'),
      topic: 'flaechen',
      title: 'Zusammengesetztes L-Profil',
      prompt: 'Die Grundfläche eines Podests hat einen L-förmigen Ausschnitt. Berechne die belegbare Fläche.',
      contextTag: 'Innenausbau',
      givens: [
        { label: 'Gesamtbreite', value: `${toGerman(width, 1)} m` },
        { label: 'Gesamthöhe', value: `${toGerman(height, 1)} m` },
        { label: 'Ausschnittbreite', value: `${toGerman(cutWidth, 1)} m` },
        { label: 'Ausschnitthöhe', value: `${toGerman(cutHeight, 1)} m` }
      ],
      formula: 'A = A_{groß} - A_{Ausschnitt}',
      resultLabel: 'Fläche',
      unit: 'm²',
      result: area,
      decimals: 2,
      steps: [
        `A_{groß} = ${toGerman(width, 1)} · ${toGerman(height, 1)}`,
        `A_{Ausschnitt} = ${toGerman(cutWidth, 1)} · ${toGerman(cutHeight, 1)}`,
        `A = A_{groß} - A_{Ausschnitt} = ${toGerman(area)} m²`
      ],
      tolerance: defaultTolerance(area),
      sketch: {
        type: 'compositeL',
        width,
        height,
        cutWidth,
        cutHeight,
        unit: 'm'
      }
    };
  }

  const widthRect = randomFloat(6, 12, 1);
  const radius = parseFloat((widthRect / 2).toFixed(1));
  const rectHeight = randomFloat(3, 7, 1);
  const area = parseFloat((widthRect * rectHeight + 0.5 * Math.PI * radius ** 2).toFixed(2));
  return {
    id: createTaskId('mix-halbrund'),
    topic: 'flaechen',
    title: 'Rechteck mit Halbkreis erweitern',
    prompt: 'Ein Blumenbeet setzt sich aus einem Rechteck und einem Halbkreis zusammen. Berechne die gesamte Fläche.',
    contextTag: 'Gartenplanung',
    givens: [
      { label: 'Rechteckbreite', value: `${toGerman(widthRect, 1)} m` },
      { label: 'Rechteckhöhe', value: `${toGerman(rectHeight, 1)} m` }
    ],
    formula: 'A = a · b + (π · r²) / 2',
    resultLabel: 'Fläche',
    unit: 'm²',
    result: area,
    decimals: 2,
    steps: [
      `A_{Rechteck} = ${toGerman(widthRect, 1)} · ${toGerman(rectHeight, 1)}`,
      `r = a / 2 = ${toGerman(radius, 1)}`,
      `A_{Halbkreis} = π · r² / 2`,
      `A = A_{Rechteck} + A_{Halbkreis} ≈ ${toGerman(area)} m²`
    ],
    tolerance: defaultTolerance(area),
    sketch: {
      type: 'compositeRectSemi',
      width: widthRect,
      height: rectHeight,
      radius,
      unit: 'm'
    }
  };
};

export const generatePythagorasTask: GeometryGenerator = () => {
  const caseType = Math.random() < 0.5 ? 'hypotenuse' : 'cathetus';

  if (caseType === 'hypotenuse') {
    const a = randomBetween(3, 12);
    const b = randomBetween(4, 13);
    const c = parseFloat(Math.sqrt(a * a + b * b).toFixed(2));
    return {
      id: createTaskId('pyth'),
      topic: 'pythagoras',
      title: 'Hypotenuse finden',
      prompt: 'Bestimme die Länge der Leiter (Hypotenuse) im rechtwinkligen Dreieck.',
      contextTag: 'Werkstattleiter',
      givens: [
        { label: 'Kathete a', value: `${a} cm` },
        { label: 'Kathete b', value: `${b} cm` }
      ],
      formula: 'c² = a² + b²',
      resultLabel: 'Hypotenuse c',
      unit: 'cm',
      result: c,
      decimals: 2,
      steps: [
        `c² = ${a}² + ${b}²`,
        `c² = ${a * a} + ${b * b}`,
        `c² = ${a * a + b * b}`,
        `c = √${a * a + b * b} ≈ ${toGerman(c)} cm`
      ],
      tolerance: defaultTolerance(c),
      sketch: {
        type: 'rightTriangle',
        a,
        b,
        c,
        unit: 'cm'
      }
    };
  }

  const c = randomBetween(10, 20);
  const a = randomBetween(4, 12);
  const b = parseFloat(Math.sqrt(c * c - a * a).toFixed(2));
  return {
    id: createTaskId('pyth'),
    topic: 'pythagoras',
    title: 'Fehlende Kathete berechnen',
    prompt: 'Eine Stütze bildet ein rechtes Dreieck mit dem Boden. Bestimme die fehlende Kathete.',
    contextTag: 'Baustelle',
    givens: [
      { label: 'Hypotenuse', value: `${c} cm` },
      { label: 'Kathete a', value: `${a} cm` }
    ],
    formula: 'b² = c² - a²',
    resultLabel: 'Kathete b',
    unit: 'cm',
    result: b,
    decimals: 2,
    steps: [
      `b² = ${c}² - ${a}²`,
      `b² = ${c * c} - ${a * a}`,
      `b² = ${c * c - a * a}`,
      `b = √${c * c - a * a} ≈ ${toGerman(b)} cm`
    ],
    tolerance: defaultTolerance(b),
    sketch: {
      type: 'rightTriangle',
      a,
      b,
      c,
      unit: 'cm'
    }
  };
};

export const generateSphereTask: GeometryGenerator = () => {
  const radius = randomFloat(3, 10, 1);
  const wantVolume = Math.random() < 0.5;

  if (wantVolume) {
    const volume = parseFloat(((4 / 3) * Math.PI * radius ** 3).toFixed(2));
    return {
      id: createTaskId('kugel'),
      topic: 'kugel',
      title: 'Kugelvolumen',
      prompt: 'Ein Metallball soll gegossen werden. Bestimme das Volumen.',
      contextTag: 'Produktion',
      givens: [{ label: 'Radius', value: `${toGerman(radius, 1)} cm` }],
      formula: 'V = 4/3 · π · r³',
      resultLabel: 'Volumen',
      unit: 'cm³',
      result: volume,
      decimals: 2,
      steps: [
        `V = 4/3 · π · (${toGerman(radius, 1)})³`,
        `V ≈ ${toGerman(volume)} cm³`
      ],
      tolerance: defaultTolerance(volume),
      sketch: {
        type: 'sphere',
        radius,
        unit: 'cm'
      }
    };
  }

  const surface = parseFloat((4 * Math.PI * radius ** 2).toFixed(2));
  return {
    id: createTaskId('kugel'),
    topic: 'kugel',
    title: 'Oberfläche der Kugel',
    prompt: 'Berechne die Oberfläche einer Designerlampe in Kugelform.',
    contextTag: 'Innenarchitektur',
    givens: [{ label: 'Radius', value: `${toGerman(radius, 1)} cm` }],
    formula: 'O = 4 · π · r²',
    resultLabel: 'Oberfläche',
    unit: 'cm²',
    result: surface,
    decimals: 2,
    steps: [
      `O = 4 · π · (${toGerman(radius, 1)})²`,
      `O ≈ ${toGerman(surface)} cm²`
    ],
    tolerance: defaultTolerance(surface),
    sketch: {
      type: 'sphere',
      radius,
      unit: 'cm'
    }
  };
};

export const generateConeTask: GeometryGenerator = () => {
  const radius = randomFloat(2, 6, 1);
  const height = randomFloat(4, 12, 1);
  const slant = parseFloat(Math.sqrt(radius ** 2 + height ** 2).toFixed(2));
  const wantSurface = Math.random() < 0.5;

  if (wantSurface) {
    const area = parseFloat((Math.PI * radius * (radius + slant)).toFixed(2));
    return {
      id: createTaskId('kegel'),
      topic: 'kegel',
      title: 'Kegeloberfläche',
      prompt: 'Ein Werbekegel soll foliert werden. Berechne die Oberfläche.',
      contextTag: 'Werbetechnik',
      givens: [
        { label: 'Radius', value: `${toGerman(radius, 1)} cm` },
        { label: 'Mantellinie', value: `${toGerman(slant)} cm` }
      ],
      formula: 'O = π · r · (r + s)',
      resultLabel: 'Oberfläche',
      unit: 'cm²',
      result: area,
      decimals: 2,
      steps: [
        `O = π · ${toGerman(radius, 1)} · (${toGerman(radius, 1)} + ${toGerman(slant)})`,
        `O ≈ ${toGerman(area)} cm²`
      ],
      tolerance: defaultTolerance(area),
      sketch: {
        type: 'cone',
        radius,
        height,
        unit: 'cm'
      }
    };
  }

  const volume = parseFloat((Math.PI * radius ** 2 * height / 3).toFixed(2));
  return {
    id: createTaskId('kegel'),
    topic: 'kegel',
    title: 'Kegelvolumen',
    prompt: 'Berechne das Volumen eines Lagerbehälters in Kegelform.',
    contextTag: 'Lagerbehälter',
    givens: [
      { label: 'Radius', value: `${toGerman(radius, 1)} dm` },
      { label: 'Höhe', value: `${toGerman(height, 1)} dm` }
    ],
    formula: 'V = 1/3 · π · r² · h',
    resultLabel: 'Volumen',
    unit: 'dm³',
    result: volume,
    decimals: 2,
    steps: [
      `V = 1/3 · π · (${toGerman(radius, 1)})² · ${toGerman(height, 1)}`,
      `V ≈ ${toGerman(volume)} dm³`
    ],
    tolerance: defaultTolerance(volume),
    sketch: {
      type: 'cone',
      radius,
      height,
      unit: 'dm'
    }
  };
};

export const generatePyramidTask: GeometryGenerator = () => {
  const baseLength = randomFloat(4, 10, 1);
  const baseWidth = randomFloat(4, 10, 1);
  const height = randomFloat(5, 15, 1);
  const baseArea = parseFloat((baseLength * baseWidth).toFixed(2));
  const volume = parseFloat(((baseArea * height) / 3).toFixed(2));

  return {
    id: createTaskId('pyramide'),
    topic: 'pyramide',
    title: 'Pyramidenvolumen',
    prompt: 'Ein Glasprisma in Pyramidenform soll produziert werden. Berechne das Volumen.',
    contextTag: 'Glaserei',
    givens: [
      { label: 'Grundkante a', value: `${toGerman(baseLength, 1)} cm` },
      { label: 'Grundkante b', value: `${toGerman(baseWidth, 1)} cm` },
      { label: 'Höhe', value: `${toGerman(height, 1)} cm` }
    ],
    formula: 'V = (a · b · h) / 3',
    resultLabel: 'Volumen',
    unit: 'cm³',
    result: volume,
    decimals: 2,
    steps: [
      `A_G = ${toGerman(baseLength, 1)} · ${toGerman(baseWidth, 1)} = ${toGerman(baseArea)} cm²`,
      `V = A_G · h / 3 = ${toGerman(baseArea)} · ${toGerman(height, 1)} / 3`,
      `V ≈ ${toGerman(volume)} cm³`
    ],
    tolerance: defaultTolerance(volume),
    sketch: {
      type: 'pyramid',
      baseA: baseLength,
      baseB: baseWidth,
      height,
      unit: 'cm'
    }
  };
};

export const generateCylinderTask: GeometryGenerator = () => {
  const radius = randomFloat(2, 8, 1);
  const height = randomFloat(4, 16, 1);
  const wantSurface = Math.random() < 0.5;

  if (wantSurface) {
    const surface = parseFloat((2 * Math.PI * radius * (height + radius)).toFixed(2));
    return {
      id: createTaskId('zylinder'),
      topic: 'zylinder',
      title: 'Zylinderoberfläche',
      prompt: 'Ein Getränke-Display in Zylinderform soll beklebt werden. Berechne die Oberfläche.',
      contextTag: 'Displaybau',
      givens: [
        { label: 'Radius', value: `${toGerman(radius, 1)} m` },
        { label: 'Höhe', value: `${toGerman(height, 1)} m` }
      ],
      formula: 'O = 2 · π · r · (h + r)',
      resultLabel: 'Oberfläche',
      unit: 'm²',
      result: surface,
      decimals: 2,
      steps: [
        `O = 2 · π · ${toGerman(radius, 1)} · (${toGerman(height, 1)} + ${toGerman(radius, 1)})`,
        `O ≈ ${toGerman(surface)} m²`
      ],
      tolerance: defaultTolerance(surface),
      sketch: {
        type: 'cylinder',
        radius,
        height,
        unit: 'm'
      }
    };
  }

  const volume = parseFloat((Math.PI * radius ** 2 * height).toFixed(2));
  return {
    id: createTaskId('zylinder'),
    topic: 'zylinder',
    title: 'Zylindervolumen',
    prompt: 'Berechne das Fassungsvermögen eines Speichers in Zylinderform.',
    contextTag: 'Behälterplanung',
    givens: [
      { label: 'Radius', value: `${toGerman(radius, 1)} dm` },
      { label: 'Höhe', value: `${toGerman(height, 1)} dm` }
    ],
    formula: 'V = π · r² · h',
    resultLabel: 'Volumen',
    unit: 'dm³',
    result: volume,
    decimals: 2,
    steps: [
      `V = π · (${toGerman(radius, 1)})² · ${toGerman(height, 1)}`,
      `V ≈ ${toGerman(volume)} dm³`
    ],
    tolerance: defaultTolerance(volume),
    sketch: {
      type: 'cylinder',
      radius,
      height,
      unit: 'dm'
    }
  };
};

export const generatePrismTask: GeometryGenerator = () => {
  const baseTypes = ['rechteck', 'dreieck', 'trapez', 'fuenfeck'] as const;
  const baseType = baseTypes[Math.floor(Math.random() * baseTypes.length)];

  if (baseType === 'rechteck') {
    const length = randomFloat(4, 12, 1);
    const width = randomFloat(3, 9, 1);
    const height = randomFloat(5, 14, 1);
    const volume = parseFloat((length * width * height).toFixed(2));
    return {
      id: createTaskId('prisma'),
      topic: 'prisma',
      title: 'Quaderförmiges Prisma',
      prompt: 'Ein Transportbehälter besitzt die Form eines geraden Prismas. Berechne das Volumen.',
      contextTag: 'Logistik',
      givens: [
        { label: 'Länge', value: `${toGerman(length, 1)} cm` },
        { label: 'Breite', value: `${toGerman(width, 1)} cm` },
        { label: 'Höhe', value: `${toGerman(height, 1)} cm` }
      ],
      formula: 'V = a · b · h',
      resultLabel: 'Volumen',
      unit: 'cm³',
      result: volume,
      decimals: 2,
      steps: [
        `V = ${toGerman(length, 1)} · ${toGerman(width, 1)} · ${toGerman(height, 1)}`,
        `V = ${toGerman(volume)} cm³`
      ],
      tolerance: defaultTolerance(volume),
      sketch: {
        type: 'prismRect',
        length,
        width,
        height,
        unit: 'cm'
      }
    };
  }

  if (baseType === 'dreieck') {
    const base = randomFloat(5, 12, 1);
    const heightTriangle = randomFloat(4, 10, 1);
    const prismHeight = randomFloat(6, 15, 1);
    const baseArea = parseFloat(((base * heightTriangle) / 2).toFixed(2));
    const volume = parseFloat((baseArea * prismHeight).toFixed(2));

    return {
      id: createTaskId('prisma'),
      topic: 'prisma',
      title: 'Dreiecksprisma',
      prompt: 'Ein Dachaufbau bildet ein Prisma mit dreieckiger Grundfläche. Berechne das Volumen.',
      contextTag: 'Dachausbau',
      givens: [
        { label: 'Grundseite', value: `${toGerman(base, 1)} m` },
        { label: 'Dreieckshöhe', value: `${toGerman(heightTriangle, 1)} m` },
        { label: 'Prismahöhe', value: `${toGerman(prismHeight, 1)} m` }
      ],
      formula: 'V = (a · h_Δ / 2) · H',
      resultLabel: 'Volumen',
      unit: 'm³',
      result: volume,
      decimals: 2,
      steps: [
        `A_G = (${toGerman(base, 1)} · ${toGerman(heightTriangle, 1)}) / 2 = ${toGerman(baseArea)} m²`,
        `V = A_G · ${toGerman(prismHeight, 1)} = ${toGerman(volume)} m³`
      ],
      tolerance: defaultTolerance(volume),
      sketch: {
        type: 'prismTri',
        base,
        heightTriangle,
        prismHeight,
        unit: 'm'
      }
    };
  }

  if (baseType === 'trapez') {
    const baseA = randomFloat(4, 12, 1);
    const baseC = randomFloat(3, 10, 1);
    const heightTrap = randomFloat(3, 9, 1);
    const prismHeight = randomFloat(6, 14, 1);
    const baseArea = parseFloat((((baseA + baseC) / 2) * heightTrap).toFixed(2));
    const volume = parseFloat((baseArea * prismHeight).toFixed(2));

    return {
      id: createTaskId('prisma'),
      topic: 'prisma',
      title: 'Trapezprisma',
      prompt: 'Ein Podest besitzt eine trapezförmige Grundfläche. Berechne das Volumen des Prismas.',
      contextTag: 'Bühnenbau',
      givens: [
        { label: 'Basis a', value: `${toGerman(baseA, 1)} cm` },
        { label: 'Basis c', value: `${toGerman(baseC, 1)} cm` },
        { label: 'Trapezhöhe', value: `${toGerman(heightTrap, 1)} cm` },
        { label: 'Prismahöhe', value: `${toGerman(prismHeight, 1)} cm` }
      ],
      formula: 'V = ((a + c)/2 · h_T) · H',
      resultLabel: 'Volumen',
      unit: 'cm³',
      result: volume,
      decimals: 2,
      steps: [
        `A_G = ((${toGerman(baseA, 1)} + ${toGerman(baseC, 1)}) / 2) · ${toGerman(heightTrap, 1)} = ${toGerman(baseArea)} cm²`,
        `V = A_G · ${toGerman(prismHeight, 1)} = ${toGerman(volume)} cm³`
      ],
      tolerance: defaultTolerance(volume),
      sketch: {
        type: 'prismTrap',
        baseA,
        baseC,
        heightTrap,
        prismHeight,
        unit: 'cm'
      }
    };
  }

  const side = randomFloat(3, 8, 1);
  const apothem = randomFloat(2, 6, 1);
  const prismHeight = randomFloat(6, 13, 1);
  const perimeter = parseFloat((5 * side).toFixed(2));
  const baseArea = parseFloat(((perimeter * apothem) / 2).toFixed(2));
  const volume = parseFloat((baseArea * prismHeight).toFixed(2));

  return {
    id: createTaskId('prisma'),
    topic: 'prisma',
    title: 'Fünfeckiges Prisma',
    prompt: 'Eine futuristische Leuchte hat eine fünfeckige Grundfläche. Bestimme das Volumen.',
    contextTag: 'Lichtdesign',
    givens: [
      { label: 'Seitenlänge', value: `${toGerman(side, 1)} cm` },
      { label: 'Apothem', value: `${toGerman(apothem, 1)} cm` },
      { label: 'Prismahöhe', value: `${toGerman(prismHeight, 1)} cm` }
    ],
    formula: 'V = (5 · a · a_p / 2) · H',
    resultLabel: 'Volumen',
    unit: 'cm³',
    result: volume,
    decimals: 2,
    steps: [
      `U = 5 · ${toGerman(side, 1)} = ${toGerman(perimeter)} cm`,
      `A_G = U · ${toGerman(apothem, 1)} / 2 = ${toGerman(baseArea)} cm²`,
      `V = A_G · ${toGerman(prismHeight, 1)} = ${toGerman(volume)} cm³`
    ],
    tolerance: defaultTolerance(volume),
    sketch: {
      type: 'prismPent',
      side,
      apothem,
      prismHeight,
      unit: 'cm'
    }
  };
};
