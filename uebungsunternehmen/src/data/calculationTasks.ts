export type CalculationSchema = 'Bezugskalkulation' | 'Handelskalkulation';
export type CalculationDirection = 'Vorwärts' | 'Rückwärts' | 'Differenz';

export interface CalculationRow {
  label: string;
  key: string;
  operator?: '-' | '+' | '=';
  percentageKey?: string;
  isPercentageBase?: boolean; // If true, this row is the base for the percentage calculation of the NEXT row (Purchase side)
  isPercentageTarget?: boolean; // If true, this row is the 100% base for the PREVIOUS row (Sales side "im Hundert")
}

export const SCHEMA_ROWS: CalculationRow[] = [
  // Bezugskalkulation
  { label: 'Listeneinkaufspreis', key: 'lep', isPercentageBase: true },
  { label: 'Liefererrabatt', key: 'l_rabatt', operator: '-', percentageKey: 'l_rabatt_p' },
  { label: 'Zieleinkaufspreis', key: 'zep', operator: '=', isPercentageBase: true },
  { label: 'Liefererskonto', key: 'l_skonto', operator: '-', percentageKey: 'l_skonto_p' },
  { label: 'Bareinkaufspreis', key: 'bep', operator: '=' },
  { label: 'Bezugskosten', key: 'bezugskosten', operator: '+' },
  { label: 'Bezugspreis', key: 'bp', operator: '=', isPercentageBase: true },
  
  // Handelskalkulation (continues from BP)
  { label: 'Handlungskostenzuschlag', key: 'hkz', operator: '+', percentageKey: 'hkz_p' },
  { label: 'Selbstkosten', key: 'sk', operator: '=', isPercentageBase: true },
  { label: 'Gewinnzuschlag', key: 'gewinn', operator: '+', percentageKey: 'gewinn_p' },
  { label: 'Barverkaufspreis', key: 'bvp', operator: '=' }, // Base for Kundenskonto (im Hundert) -> ZVP is 100%
  { label: 'Kundenskonto', key: 'k_skonto', operator: '+', percentageKey: 'k_skonto_p' },
  { label: 'Zielverkaufspreis', key: 'zvp', operator: '=' }, // Base for Kundenrabatt (im Hundert) -> NVP is 100%
  { label: 'Kundenrabatt', key: 'k_rabatt', operator: '+', percentageKey: 'k_rabatt_p' },
  { label: 'Nettoverkaufspreis', key: 'nvp', operator: '=', isPercentageBase: true }, // Base for Tax
  { label: 'Umsatzsteuer', key: 'ust', operator: '+', percentageKey: 'ust_p' },
  { label: 'Bruttoverkaufspreis', key: 'brutto', operator: '=' },
];

export interface CalcTask {
  id: string;
  schema: CalculationSchema;
  direction: CalculationDirection;
  values: Record<string, number>;
  percentages: Record<string, number>;
  description: string;
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const round2 = (num: number) => Math.round(num * 100) / 100;

export const generateTask = (schema: CalculationSchema, direction: CalculationDirection): CalcTask => {
  const percentages = {
    l_rabatt_p: randomInt(5, 20),
    l_skonto_p: randomInt(1, 3),
    hkz_p: randomInt(20, 40),
    gewinn_p: randomInt(5, 20),
    k_skonto_p: randomInt(1, 3),
    k_rabatt_p: randomInt(5, 15),
    ust_p: 19
  };

  // Start with a random Listeneinkaufspreis
  const lep = randomInt(100, 1000) + (randomInt(0, 99) / 100);
  const bezugskosten = randomInt(10, 50) + (randomInt(0, 99) / 100);

  // Calculate Forward
  const l_rabatt = round2(lep * (percentages.l_rabatt_p / 100));
  const zep = round2(lep - l_rabatt);
  const l_skonto = round2(zep * (percentages.l_skonto_p / 100));
  const bep = round2(zep - l_skonto);
  const bp = round2(bep + bezugskosten);

  const hkz = round2(bp * (percentages.hkz_p / 100));
  const sk = round2(bp + hkz);
  const gewinn = round2(sk * (percentages.gewinn_p / 100));
  const bvp = round2(sk + gewinn);

  // Sales Side "Im Hundert"
  // ZVP = BVP / (1 - k_skonto_p)
  const zvp = round2(bvp / (1 - (percentages.k_skonto_p / 100)));
  const k_skonto = round2(zvp - bvp);

  // NVP = ZVP / (1 - k_rabatt_p)
  const nvp = round2(zvp / (1 - (percentages.k_rabatt_p / 100)));
  const k_rabatt = round2(nvp - zvp);

  const ust = round2(nvp * (percentages.ust_p / 100));
  const brutto = round2(nvp + ust);

  const values: Record<string, number> = {
    lep, l_rabatt, zep, l_skonto, bep, bezugskosten, bp,
    hkz, sk, gewinn, bvp, k_skonto, zvp, k_rabatt, nvp, ust, brutto
  };

  // Recalculate for Backward direction to ensure rounding consistency
  if (direction === 'Rückwärts') {
    if (schema === 'Handelskalkulation') {
      // Start from Brutto
      const new_nvp = round2(brutto / (1 + percentages.ust_p / 100));
      const new_ust = round2(brutto - new_nvp);
      
      // NVP is 100% base for Rabatt
      const new_k_rabatt = round2(new_nvp * (percentages.k_rabatt_p / 100));
      const new_zvp = round2(new_nvp - new_k_rabatt);
      
      // ZVP is 100% base for Skonto
      const new_k_skonto = round2(new_zvp * (percentages.k_skonto_p / 100));
      const new_bvp = round2(new_zvp - new_k_skonto);
      
      // SK is 100% base for Gewinn
      const new_sk = round2(new_bvp / (1 + percentages.gewinn_p / 100));
      const new_gewinn = round2(new_bvp - new_sk);
      
      // BP is 100% base for HKZ
      const new_bp = round2(new_sk / (1 + percentages.hkz_p / 100));
      const new_hkz = round2(new_sk - new_bp);
      
      const new_bep = round2(new_bp - bezugskosten);
      
      // LEP is 100% base for Rabatt/Skonto (Purchase side)
      // ZEP = BEP / (1 - skonto)
      const new_zep = round2(new_bep / (1 - percentages.l_skonto_p / 100));
      const new_l_skonto = round2(new_zep - new_bep);
      
      // LEP = ZEP / (1 - rabatt)
      const new_lep = round2(new_zep / (1 - percentages.l_rabatt_p / 100));
      const new_l_rabatt = round2(new_lep - new_zep);
      
      values.lep = new_lep;
      values.l_rabatt = new_l_rabatt;
      values.zep = new_zep;
      values.l_skonto = new_l_skonto;
      values.bep = new_bep;
      values.bp = new_bp;
      values.hkz = new_hkz;
      values.sk = new_sk;
      values.gewinn = new_gewinn;
      values.bvp = new_bvp;
      values.k_skonto = new_k_skonto;
      values.zvp = new_zvp;
      values.k_rabatt = new_k_rabatt;
      values.nvp = new_nvp;
      values.ust = new_ust;
      
    } else if (schema === 'Bezugskalkulation') {
      // Start from BP
      const new_bep = round2(bp - bezugskosten);
      
      const new_zep = round2(new_bep / (1 - percentages.l_skonto_p / 100));
      const new_l_skonto = round2(new_zep - new_bep);
      
      const new_lep = round2(new_zep / (1 - percentages.l_rabatt_p / 100));
      const new_l_rabatt = round2(new_lep - new_zep);
      
      values.lep = new_lep;
      values.l_rabatt = new_l_rabatt;
      values.zep = new_zep;
      values.l_skonto = new_l_skonto;
      values.bep = new_bep;
    }
  } else if (direction === 'Differenz') {
    // Differenzkalkulation: LEP and Brutto are given. Calculate everything in between.
    // 1. Forward from LEP to SK
    // 2. Backward from Brutto to BVP
    // 3. Calculate Gewinn and Gewinn %

    // We keep the generated LEP and calculate forward to SK
    // But we need a Brutto that is somewhat realistic (higher than SK)
    // Let's generate a random profit margin between -5% and 30% to make it interesting (maybe loss?)
    // User requirement: "Gewinn in € und Prozent gesucht". Usually implies profit.
    // Let's ensure profit.
    
    // Recalculate forward part to be sure
    const d_l_rabatt = round2(lep * (percentages.l_rabatt_p / 100));
    const d_zep = round2(lep - d_l_rabatt);
    const d_l_skonto = round2(d_zep * (percentages.l_skonto_p / 100));
    const d_bep = round2(d_zep - d_l_skonto);
    const d_bp = round2(d_bep + bezugskosten);
    const d_hkz = round2(d_bp * (percentages.hkz_p / 100));
    const d_sk = round2(d_bp + d_hkz);

    // Now generate a target Brutto. 
    // Let's say target profit is between 5% and 25%
    const target_profit_p = randomInt(5, 25) + (randomInt(0, 99) / 100);
    const target_bvp = d_sk * (1 + target_profit_p / 100);
    
    // Calculate up to Brutto from this target BVP to get a "nice" Brutto?
    // Or just pick a random Brutto > SK * 1.2?
    // Let's do the full forward calc with the random profit to get a Brutto, then round that Brutto to 2 decimals,
    // and then recalculate backward to get the EXACT BVP and Profit.
    
    const d_zvp_temp = target_bvp / (1 - (percentages.k_skonto_p / 100));
    const d_nvp_temp = d_zvp_temp / (1 - (percentages.k_rabatt_p / 100));
    const d_brutto_temp = d_nvp_temp * (1 + percentages.ust_p / 100);
    
    // Fix Brutto
    const d_brutto = round2(d_brutto_temp);

    // Now Backward from fixed Brutto
    const d_nvp = round2(d_brutto / (1 + percentages.ust_p / 100));
    const d_ust = round2(d_brutto - d_nvp);
    
    const d_k_rabatt = round2(d_nvp * (percentages.k_rabatt_p / 100));
    const d_zvp = round2(d_nvp - d_k_rabatt);
    
    const d_k_skonto = round2(d_zvp * (percentages.k_skonto_p / 100));
    const d_bvp = round2(d_zvp - d_k_skonto);

    // Now we have SK (from forward) and BVP (from backward)
    // Calculate Profit
    const d_gewinn = round2(d_bvp - d_sk);
    const d_gewinn_p = round2((d_gewinn / d_sk) * 100);

    // Update values
    values.lep = lep;
    values.l_rabatt = d_l_rabatt;
    values.zep = d_zep;
    values.l_skonto = d_l_skonto;
    values.bep = d_bep;
    values.bp = d_bp;
    values.hkz = d_hkz;
    values.sk = d_sk;
    
    values.brutto = d_brutto;
    values.ust = d_ust;
    values.nvp = d_nvp;
    values.k_rabatt = d_k_rabatt;
    values.zvp = d_zvp;
    values.k_skonto = d_k_skonto;
    values.bvp = d_bvp;
    
    values.gewinn = d_gewinn;
    percentages.gewinn_p = d_gewinn_p; // Update the percentage in the object
  }

  const description = buildDescription(schema, direction, values, percentages);

  return {
    id: Date.now().toString(),
    schema,
    direction,
    values,
    percentages,
    description
  };
};

// ---------------------------------------------------------------------------
// Formatierung (deutsche Schreibweise)
// ---------------------------------------------------------------------------

export const formatEuro = (n: number) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00A0€';

export const formatPercent = (n: number) =>
  n.toLocaleString('de-DE', { maximumFractionDigits: 2 }) + '\u00A0%';

const formatNumber = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 2 });

// ---------------------------------------------------------------------------
// Aufgabentexte
// ---------------------------------------------------------------------------

interface Scenario {
  anlass: string;
  firma: string; // weiblich (GmbH, KG, OHG, AG) → "die ..."
  ort: string;
  produkt: string; // Akkusativ mit unbestimmtem Artikel
  produktNom: string; // Nominativ mit bestimmtem Artikel
  produktAkk: string; // Akkusativ mit bestimmtem Artikel
  lieferer: string; // weiblich (GmbH, AG) → "die ..."
  liefererOrt: string;
}

const SCENARIOS: Scenario[] = [
  {
    anlass: 'Der Frühling steht vor der Tür, und mit den ersten Sonnenstrahlen beginnt die Fahrradsaison.',
    firma: 'Radsport Weber KG', ort: 'Passau',
    produkt: 'ein Trekkingrad des Modells Alpencross', produktNom: 'das Trekkingrad', produktAkk: 'das Trekkingrad',
    lieferer: 'VeloTec GmbH', liefererOrt: 'Stuttgart',
  },
  {
    anlass: 'Immer mehr Kundinnen und Kunden möchten ihren Cappuccino zu Hause genauso genießen wie im Lieblingscafé.',
    firma: 'Bohne & Co. GmbH', ort: 'Bamberg',
    produkt: 'eine Siebträger-Espressomaschine', produktNom: 'die Espressomaschine', produktAkk: 'die Espressomaschine',
    lieferer: 'Caffè Macchina AG', liefererOrt: 'Mailand',
  },
  {
    anlass: 'Seit viele Menschen regelmäßig im Homeoffice arbeiten, sind rückenschonende Sitzmöbel gefragt wie nie.',
    firma: 'Büroprofi Schneider GmbH', ort: 'Regensburg',
    produkt: 'einen ergonomischen Bürostuhl', produktNom: 'der Bürostuhl', produktAkk: 'den Bürostuhl',
    lieferer: 'SitzWerk AG', liefererOrt: 'Nürnberg',
  },
  {
    anlass: 'Kurz vor dem großen E-Sport-Turnier in der Stadthalle rechnet man mit einem Ansturm von Gamerinnen und Gamern.',
    firma: 'PixelPlanet GmbH', ort: 'Augsburg',
    produkt: 'einen 34-Zoll-Gaming-Monitor', produktNom: 'der Monitor', produktAkk: 'den Monitor',
    lieferer: 'VisionTech AG', liefererOrt: 'Düsseldorf',
  },
  {
    anlass: 'Die ersten warmen Tage locken die Hobbygärtnerinnen und Hobbygärtner wieder ins Freie.',
    firma: 'Grünwerk Huber OHG', ort: 'Landshut',
    produkt: 'einen leisen Akku-Rasenmäher', produktNom: 'der Rasenmäher', produktAkk: 'den Rasenmäher',
    lieferer: 'GartenMaxx GmbH', liefererOrt: 'Ulm',
  },
  {
    anlass: 'Die Sommerferien rücken näher, und Campingausrüstung ist so stark nachgefragt wie lange nicht mehr.',
    firma: 'Gipfelglück Sport GmbH', ort: 'Garmisch-Partenkirchen',
    produkt: 'ein wetterfestes Vier-Personen-Zelt', produktNom: 'das Zelt', produktAkk: 'das Zelt',
    lieferer: 'Nordwand Outdoor AG', liefererOrt: 'Innsbruck',
  },
  {
    anlass: 'Eine beliebte Kochshow im Fernsehen hat einen regelrechten Hype um Küchenmaschinen ausgelöst.',
    firma: 'Küchenzauber Maier KG', ort: 'Würzburg',
    produkt: 'eine Küchenmaschine mit Kochfunktion', produktNom: 'die Küchenmaschine', produktAkk: 'die Küchenmaschine',
    lieferer: 'ChefLine GmbH', liefererOrt: 'Wuppertal',
  },
  {
    anlass: 'Nach einem ausverkauften Open-Air-Konzert in der Region wollen viele Jugendliche selbst Gitarre spielen lernen.',
    firma: 'Klangraum Musikhaus GmbH', ort: 'Ingolstadt',
    produkt: 'eine elektroakustische Westerngitarre', produktNom: 'die Gitarre', produktAkk: 'die Gitarre',
    lieferer: 'SoundCraft Instruments AG', liefererOrt: 'Hamburg',
  },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const bezugskostenSatz = (bezugskosten: number) => pick([
  `Für Fracht und Verpackung stellt die Spedition ${formatEuro(bezugskosten)} in Rechnung.`,
  `Für Transport und Transportversicherung fallen Bezugskosten in Höhe von ${formatEuro(bezugskosten)} an.`,
  `Die Anlieferung per Spedition schlägt mit ${formatEuro(bezugskosten)} Bezugskosten zu Buche.`,
]);

const buildDescription = (
  schema: CalculationSchema,
  direction: CalculationDirection,
  v: Record<string, number>,
  p: Record<string, number>,
): string => {
  const s = pick(SCENARIOS);
  const tage = pick([10, 14]);
  const bk = bezugskostenSatz(v.bezugskosten);
  const einkaufMit = (subjekt: string) =>
    `${subjekt} gewährt ${formatPercent(p.l_rabatt_p)} Liefererrabatt ` +
    `und bei Zahlung innerhalb von ${tage} Tagen zusätzlich ${formatPercent(p.l_skonto_p)} Skonto.`;
  const einkauf = einkaufMit(`Die ${s.lieferer} aus ${s.liefererOrt}`);

  if (schema === 'Bezugskalkulation') {
    if (direction === 'Vorwärts') {
      return `${s.anlass} Die ${s.firma} aus ${s.ort} bestellt deshalb bei der ${s.lieferer} aus ${s.liefererOrt} ${s.produkt}. ` +
        `Laut Preisliste kostet der Artikel ${formatEuro(v.lep)} netto. ${einkaufMit('Der Lieferer')} ${bk} ` +
        `Berechnen Sie den Bezugspreis, mit dem das Unternehmen kalkulieren muss.`;
    }
    return `${s.anlass} Die ${s.firma} aus ${s.ort} möchte deshalb ${s.produkt} ins Sortiment aufnehmen. ` +
      `Die Einkaufsleitung hat ein klares Limit gesetzt: Der Bezugspreis darf ${formatEuro(v.bp)} nicht überschreiten. ` +
      `${einkauf} ${bk} ` +
      `Ermitteln Sie, wie hoch der Listeneinkaufspreis höchstens sein darf.`;
  }

  const verkauf =
    `Den Kundinnen und Kunden werden ${formatPercent(p.k_rabatt_p)} Rabatt und ${formatPercent(p.k_skonto_p)} Skonto gewährt; ` +
    `die Umsatzsteuer beträgt ${formatPercent(p.ust_p)}.`;

  if (direction === 'Vorwärts') {
    return `${s.anlass} Die ${s.firma} aus ${s.ort} nimmt deshalb ${s.produkt} neu ins Sortiment auf. ` +
      `Die ${s.lieferer} aus ${s.liefererOrt} bietet den Artikel zum Listeneinkaufspreis von ${formatEuro(v.lep)} an, ` +
      `gewährt ${formatPercent(p.l_rabatt_p)} Rabatt und bei Zahlung innerhalb von ${tage} Tagen ${formatPercent(p.l_skonto_p)} Skonto. ` +
      `${bk} Das Rechnungswesen kalkuliert mit einem Handlungskostenzuschlag von ${formatPercent(p.hkz_p)} ` +
      `und einem Gewinnzuschlag von ${formatPercent(p.gewinn_p)}. ${verkauf} ` +
      `Berechnen Sie, zu welchem Bruttoverkaufspreis ${s.produktNom} angeboten werden muss.`;
  }

  if (direction === 'Rückwärts') {
    return `${s.anlass} Die ${s.firma} aus ${s.ort} möchte deshalb ${s.produkt} anbieten. ` +
      `Ein großer Online-Händler verkauft ${s.produktAkk} bereits für ${formatEuro(v.brutto)} brutto. ` +
      `Teurer darf das eigene Angebot auf keinen Fall sein. ` +
      `Kalkuliert wird mit ${formatPercent(p.ust_p)} Umsatzsteuer, ${formatPercent(p.k_rabatt_p)} Kundenrabatt, ` +
      `${formatPercent(p.k_skonto_p)} Kundenskonto, ${formatPercent(p.gewinn_p)} Gewinnzuschlag und ` +
      `${formatPercent(p.hkz_p)} Handlungskostenzuschlag. ${bk} ${einkauf} ` +
      `Wie hoch darf der Listeneinkaufspreis höchstens sein, damit das Angebot konkurrenzfähig bleibt?`;
  }

  return `${s.anlass} Die ${s.firma} aus ${s.ort} möchte deshalb ${s.produkt} verkaufen. ` +
    `Den Preis kann sie allerdings nicht frei festlegen: Der Hersteller empfiehlt einen Bruttoverkaufspreis von ` +
    `${formatEuro(v.brutto)}, und daran hält sich die gesamte Konkurrenz. ` +
    `Laut Preisliste der ${s.lieferer} aus ${s.liefererOrt} kostet der Artikel ${formatEuro(v.lep)}. ` +
    `Sie gewährt ${formatPercent(p.l_rabatt_p)} Rabatt sowie bei Zahlung innerhalb von ${tage} Tagen ` +
    `${formatPercent(p.l_skonto_p)} Skonto. ${bk} Der Handlungskostenzuschlag beträgt ${formatPercent(p.hkz_p)}. ${verkauf} ` +
    `Lohnt sich das Geschäft? Ermitteln Sie den Gewinn in Euro und in Prozent der Selbstkosten ` +
    `(Prozentsatz auf zwei Nachkommastellen runden).`;
};

// ---------------------------------------------------------------------------
// Eingaben auswerten
// ---------------------------------------------------------------------------

/** Liest Zahlen in deutscher Schreibweise (1.234,56) und toleriert auch 1234.56. */
export const parseGermanNumber = (input: string): number => {
  const str = input.trim().replace(/\s|€|%/g, '');
  if (str === '') return NaN;
  if (str.includes(',')) return parseFloat(str.replace(/\./g, '').replace(',', '.'));
  // Nur Punkte: als Tausendertrennzeichen werten, wenn das Muster passt (1.234 / 12.345.678)
  if (/^-?\d{1,3}(\.\d{3})+$/.test(str)) return parseFloat(str.replace(/\./g, ''));
  return parseFloat(str);
};

const TOLERANCE = 0.05;

/** Liefert den richtigen Wert für ein Eingabefeld (Betrag oder Gewinn in %). */
export const getCorrectValue = (task: CalcTask, key: string): number =>
  key === 'gewinn_p' ? task.percentages.gewinn_p : task.values[key];

export const isInputCorrect = (task: CalcTask, key: string, input: string | undefined): boolean => {
  if (!input) return false;
  const val = parseGermanNumber(input);
  return !isNaN(val) && Math.abs(val - getCorrectValue(task, key)) <= TOLERANCE;
};

/** Felder, deren Wert in der Aufgabe vorgegeben ist und nicht berechnet werden muss. */
export const isGivenField = (task: CalcTask, key: string): boolean => {
  if (key === 'bezugskosten') return true;
  switch (task.direction) {
    case 'Vorwärts': return key === 'lep';
    case 'Rückwärts': return key === (task.schema === 'Bezugskalkulation' ? 'bp' : 'brutto');
    case 'Differenz': return key === 'lep' || key === 'brutto';
  }
};

/** Zeilen des Kalkulationsschemas, die zur Aufgabe gehören. */
export const getRowsForSchema = (schema: CalculationSchema): CalculationRow[] => {
  if (schema === 'Handelskalkulation') return SCHEMA_ROWS;
  const bpIndex = SCHEMA_ROWS.findIndex(r => r.key === 'bp');
  return SCHEMA_ROWS.slice(0, bpIndex + 1);
};

/** Alle Felder, die der Schüler selbst ausfüllen muss. */
export const getEditableKeys = (task: CalcTask): string[] => {
  const keys = getRowsForSchema(task.schema).map(r => r.key).filter(k => !isGivenField(task, k));
  if (task.direction === 'Differenz') keys.push('gewinn_p');
  return keys;
};

// ---------------------------------------------------------------------------
// Lösungswege
// ---------------------------------------------------------------------------

export const getCalculationExplanation = (
  key: string,
  direction: CalculationDirection,
  task: CalcTask
): string => {
  const p = task.percentages;
  const v = task.values;
  const f = formatEuro;
  const n = formatNumber;

  // Einkaufsseite vorwärts (Vorwärts- und Differenzkalkulation)
  const einkaufVorwaerts = (): string => {
    switch (key) {
      case 'l_rabatt': return `Listeneinkaufspreis (${f(v.lep)}) × ${n(p.l_rabatt_p)} ÷ 100`;
      case 'zep': return `Listeneinkaufspreis (${f(v.lep)}) – Liefererrabatt (${f(v.l_rabatt)})`;
      case 'l_skonto': return `Zieleinkaufspreis (${f(v.zep)}) × ${n(p.l_skonto_p)} ÷ 100`;
      case 'bep': return `Zieleinkaufspreis (${f(v.zep)}) – Liefererskonto (${f(v.l_skonto)})`;
      case 'bezugskosten': return `Gegebener Wert`;
      case 'bp': return `Bareinkaufspreis (${f(v.bep)}) + Bezugskosten (${f(v.bezugskosten)})`;
      case 'hkz': return `Bezugspreis (${f(v.bp)}) × ${n(p.hkz_p)} ÷ 100`;
      case 'sk': return `Bezugspreis (${f(v.bp)}) + Handlungskostenzuschlag (${f(v.hkz)})`;
      default: return '';
    }
  };

  // Verkaufsseite rückwärts (Rückwärts- und Differenzkalkulation)
  const verkaufRueckwaerts = (): string => {
    switch (key) {
      case 'ust': return `Bruttoverkaufspreis (${f(v.brutto)}) ÷ ${n(100 + p.ust_p)} × ${n(p.ust_p)}  (Brutto = ${n(100 + p.ust_p)} %)`;
      case 'nvp': return `Bruttoverkaufspreis (${f(v.brutto)}) – Umsatzsteuer (${f(v.ust)})`;
      case 'k_rabatt': return `Nettoverkaufspreis (${f(v.nvp)}) × ${n(p.k_rabatt_p)} ÷ 100`;
      case 'zvp': return `Nettoverkaufspreis (${f(v.nvp)}) – Kundenrabatt (${f(v.k_rabatt)})`;
      case 'k_skonto': return `Zielverkaufspreis (${f(v.zvp)}) × ${n(p.k_skonto_p)} ÷ 100`;
      case 'bvp': return `Zielverkaufspreis (${f(v.zvp)}) – Kundenskonto (${f(v.k_skonto)})`;
      default: return '';
    }
  };

  if (direction === 'Vorwärts') {
    switch (key) {
      case 'gewinn': return `Selbstkosten (${f(v.sk)}) × ${n(p.gewinn_p)} ÷ 100`;
      case 'bvp': return `Selbstkosten (${f(v.sk)}) + Gewinn (${f(v.gewinn)})`;
      case 'k_skonto': return `Barverkaufspreis (${f(v.bvp)}) ÷ ${n(100 - p.k_skonto_p)} × ${n(p.k_skonto_p)}  (im Hundert: Barverkaufspreis = ${n(100 - p.k_skonto_p)} %)`;
      case 'zvp': return `Barverkaufspreis (${f(v.bvp)}) + Kundenskonto (${f(v.k_skonto)})`;
      case 'k_rabatt': return `Zielverkaufspreis (${f(v.zvp)}) ÷ ${n(100 - p.k_rabatt_p)} × ${n(p.k_rabatt_p)}  (im Hundert: Zielverkaufspreis = ${n(100 - p.k_rabatt_p)} %)`;
      case 'nvp': return `Zielverkaufspreis (${f(v.zvp)}) + Kundenrabatt (${f(v.k_rabatt)})`;
      case 'ust': return `Nettoverkaufspreis (${f(v.nvp)}) × ${n(p.ust_p)} ÷ 100`;
      case 'brutto': return `Nettoverkaufspreis (${f(v.nvp)}) + Umsatzsteuer (${f(v.ust)})`;
      default: return einkaufVorwaerts();
    }
  }

  if (direction === 'Rückwärts') {
    switch (key) {
      case 'gewinn': return `Barverkaufspreis (${f(v.bvp)}) ÷ ${n(100 + p.gewinn_p)} × ${n(p.gewinn_p)}  (auf Hundert: Barverkaufspreis = ${n(100 + p.gewinn_p)} %)`;
      case 'sk': return `Barverkaufspreis (${f(v.bvp)}) – Gewinn (${f(v.gewinn)})`;
      case 'hkz': return `Selbstkosten (${f(v.sk)}) ÷ ${n(100 + p.hkz_p)} × ${n(p.hkz_p)}  (auf Hundert: Selbstkosten = ${n(100 + p.hkz_p)} %)`;
      case 'bp': return `Selbstkosten (${f(v.sk)}) – Handlungskostenzuschlag (${f(v.hkz)})`;
      case 'bezugskosten': return `Gegebener Wert`;
      case 'bep': return `Bezugspreis (${f(v.bp)}) – Bezugskosten (${f(v.bezugskosten)})`;
      case 'l_skonto': return `Bareinkaufspreis (${f(v.bep)}) ÷ ${n(100 - p.l_skonto_p)} × ${n(p.l_skonto_p)}  (im Hundert: Bareinkaufspreis = ${n(100 - p.l_skonto_p)} %)`;
      case 'zep': return `Bareinkaufspreis (${f(v.bep)}) + Liefererskonto (${f(v.l_skonto)})`;
      case 'l_rabatt': return `Zieleinkaufspreis (${f(v.zep)}) ÷ ${n(100 - p.l_rabatt_p)} × ${n(p.l_rabatt_p)}  (im Hundert: Zieleinkaufspreis = ${n(100 - p.l_rabatt_p)} %)`;
      case 'lep': return `Zieleinkaufspreis (${f(v.zep)}) + Liefererrabatt (${f(v.l_rabatt)})`;
      default: return verkaufRueckwaerts();
    }
  }

  // Differenzkalkulation
  switch (key) {
    case 'gewinn': return `Barverkaufspreis (${f(v.bvp)}) – Selbstkosten (${f(v.sk)})`;
    case 'gewinn_p': return `Gewinn (${f(v.gewinn)}) ÷ Selbstkosten (${f(v.sk)}) × 100`;
    default: return einkaufVorwaerts() || verkaufRueckwaerts();
  }
};
