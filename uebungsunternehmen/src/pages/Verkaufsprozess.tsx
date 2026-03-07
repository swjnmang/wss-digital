import { useState } from 'react';
import { Link } from 'react-router-dom';

// Typen
interface ProductSpecs {
  // PC-Specs
  ram?: string; // z.B. "16GB DDR4"
  cpu?: string; // z.B. "Intel i7-12700K"
  storage?: string; // z.B. "512GB SSD"
  gpu?: string; // z.B. "NVIDIA RTX 4070"
  
  // Monitor-Specs
  diagonal?: string; // z.B. "27\""
  resolution?: string; // z.B. "4K (3840x2160)"
  refreshRate?: string; // z.B. "144Hz"
  panelType?: string; // z.B. "IPS"
  
  // Tablet-Specs
  screen?: string; // z.B. "12.9\""
  processor?: string; // z.B. "A16 Bionic"
  battery?: string; // z.B. "10000 mAh"
  
  // Kopfhörer-Specs
  driverSize?: string; // z.B. "40mm"
  impedance?: string; // z.B. "32 Ohm"
  frequency?: string; // z.B. "20Hz-20kHz"
  wireless?: boolean;

  // Allgemein
  weight?: number; // kg
  warranty?: string; // z.B. "24 Monate"
  color?: string;
  energyRating?: string; // z.B. "A++"
  quality?: number; // 1-5 Sterne
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  artNumber: string;
  specs: ProductSpecs;
  description: string;
}

interface CustomerRequirements {
  quantity?: { min?: number; max?: number; exact?: number };
  maxBudget?: number; // netto
  quality?: number; // min. Sterne
  specs?: {
    key: string;
    values?: string[];
    minValue?: number;
    maxValue?: number;
  }[];
  priority?: string[]; // z.B. ["preis", "qualität", "lieferzeit"]
}

interface Email {
  id: string;
  from: string;
  fromAddress: string;
  subject: string;
  content: string;
  requirements: CustomerRequirements;
  customerNumber: string;
  date: string;
  read: boolean;
}

interface Offer {
  quantity: number;
  product?: Product;
  unitPrice: number;
  discount: number;
  shippingCost: number;
}

interface WorkflowState {
  currentStep: number;
  selectedEmail?: Email;
  selectedProduct?: Product;
  offer: Offer;
  invoiceData: {
    invoiceNumber: number;
    invoiceDate: string;
    discountPercent: number;
    discountAmount: number;
    transferAmount: number;
  };
  shipping: {
    carrier?: string;
    cost?: number;
  };
  paymentVerified: boolean;
}

// Produktdaten - 15+ Produkte mit eigenen Namen
const PRODUCTS: Product[] = [
  // Desktop-PCs
  {
    id: 'p1',
    name: 'ProStation Elite X12',
    category: 'Desktop-PCs',
    price: 1895.50,
    stock: 12,
    artNumber: 'PS-ELX-001',
    specs: {
      cpu: 'Intel Core i7-13700K',
      ram: '32GB DDR5',
      storage: '1TB NVMe SSD',
      gpu: 'NVIDIA RTX 4080 Super',
      warranty: '36 Monate',
      weight: 8.5,
      quality: 5,
      color: 'Grau',
    },
    description: 'High-Performance Desktop für professionelle Anwendungen'
  },
  {
    id: 'p2',
    name: 'WorkHub Standard W8',
    category: 'Desktop-PCs',
    price: 849.99,
    stock: 35,
    artNumber: 'WH-STD-008',
    specs: {
      cpu: 'AMD Ryzen 5 5600G',
      ram: '16GB DDR4',
      storage: '512GB SSD',
      gpu: 'Integrated Vega',
      warranty: '24 Monate',
      weight: 7.2,
      quality: 4,
      color: 'Schwarz',
    },
    description: 'Zuverlässiger Office-PC für Standardaufgaben'
  },
  {
    id: 'p3',
    name: 'UltraBook CoreMax M9',
    category: 'Desktop-PCs',
    price: 2450.00,
    stock: 8,
    artNumber: 'UB-CM-M9',
    specs: {
      cpu: 'Intel Core i9-13900KS',
      ram: '64GB DDR5',
      storage: '2TB NVMe SSD',
      gpu: 'NVIDIA RTX 4090',
      warranty: '48 Monate',
      weight: 10.1,
      quality: 5,
      color: 'Weiß',
    },
    description: 'Top-of-the-Line Workstation für Video & 3D-Rendering'
  },
  {
    id: 'p4',
    name: 'BudgetBox Simple S4',
    category: 'Desktop-PCs',
    price: 499.99,
    stock: 50,
    artNumber: 'BB-SMP-S4',
    specs: {
      cpu: 'Intel Pentium Gold G7400',
      ram: '8GB DDR4',
      storage: '256GB SSD',
      gpu: 'Integrated UHD 770',
      warranty: '12 Monate',
      weight: 5.8,
      quality: 2,
      color: 'Schwarz',
    },
    description: 'Einstiegs-PC für Schulen und Kleine Büros'
  },

  // Monitore
  {
    id: 'm1',
    name: 'CinaryView Pro 32',
    category: 'Monitore',
    price: 1899.00,
    stock: 15,
    artNumber: 'CVP-32-004K',
    specs: {
      diagonal: '32"',
      resolution: '4K (3840x2160)',
      refreshRate: '60Hz',
      panelType: 'IPS',
      warranty: '36 Monate',
      weight: 9.2,
      quality: 5,
      color: 'Grau',
    },
    description: 'Professional 4K Monitor für Design & Video-Editing'
  },
  {
    id: 'm2',
    name: 'GameEdge 27 Pro',
    category: 'Monitore',
    price: 599.99,
    stock: 42,
    artNumber: 'GE-27-144',
    specs: {
      diagonal: '27"',
      resolution: 'QHD (2560x1440)',
      refreshRate: '144Hz',
      panelType: 'VA',
      warranty: '24 Monate',
      weight: 5.8,
      quality: 4,
      color: 'Schwarz',
    },
    description: 'Gaming Monitor mit hoher Bildwiederholrate'
  },
  {
    id: 'm3',
    name: 'OfficeCore 24 FHD',
    category: 'Monitore',
    price: 259.99,
    stock: 73,
    artNumber: 'OC-24-FHD',
    specs: {
      diagonal: '24"',
      resolution: 'Full HD (1920x1080)',
      refreshRate: '60Hz',
      panelType: 'TN',
      warranty: '24 Monate',
      weight: 3.9,
      quality: 3,
      color: 'Silber',
    },
    description: 'Standard Office-Monitor für alltägliche Aufgaben'
  },
  {
    id: 'm4',
    name: 'UltraWide Cinema 49',
    category: 'Monitore',
    price: 2299.99,
    stock: 6,
    artNumber: 'UWC-49-144',
    specs: {
      diagonal: '49"',
      resolution: '5120x1440',
      refreshRate: '144Hz',
      panelType: 'VA',
      warranty: '36 Monate',
      weight: 12.5,
      quality: 5,
      color: 'Schwarz',
    },
    description: 'Ultra-Wide Curved Monitor für Profis'
  },

  // Tablets
  {
    id: 't1',
    name: 'TabMax Air Pro 12',
    category: 'Tablets',
    price: 1199.99,
    stock: 28,
    artNumber: 'TMA-PRO-12',
    specs: {
      screen: '12.9"',
      processor: 'Apple M2',
      ram: '8GB',
      storage: '512GB',
      battery: '10200 mAh',
      warranty: '24 Monate',
      weight: 0.6,
      quality: 5,
      color: 'Space Grau',
    },
    description: 'Premium Tablet für kreative Profis'
  },
  {
    id: 't2',
    name: 'MediumTab Essential 10',
    category: 'Tablets',
    price: 449.99,
    stock: 91,
    artNumber: 'MTE-10-ESS',
    specs: {
      screen: '10.1"',
      processor: 'Qualcomm Snapdragon 870',
      ram: '6GB',
      storage: '128GB',
      battery: '7000 mAh',
      warranty: '12 Monate',
      weight: 0.48,
      quality: 3,
      color: 'Blau',
    },
    description: 'Universal-Tablet für Schulen und Unterricht'
  },
  {
    id: 't3',
    name: 'CompactView Go 8',
    category: 'Tablets',
    price: 299.99,
    stock: 64,
    artNumber: 'CVG-8-000',
    specs: {
      screen: '8"',
      processor: 'MediaTek Helio G99',
      ram: '4GB',
      storage: '64GB',
      battery: '5100 mAh',
      warranty: '12 Monate',
      weight: 0.32,
      quality: 2,
      color: 'Schwarz',
    },
    description: 'Portables Tablet für unterwegs'
  },

  // Kopfhörer/Headsets
  {
    id: 'h1',
    name: 'SoundPro Studio Elite',
    category: 'Kopfhörer',
    price: 449.99,
    stock: 37,
    artNumber: 'SPE-STU-001',
    specs: {
      driverSize: '50mm',
      impedance: '32 Ohm',
      frequency: '10Hz-40kHz',
      wireless: false,
      warranty: '24 Monate',
      weight: 0.25,
      quality: 5,
      color: 'Grau',
    },
    description: 'Studio-Kopfhörer für Audio-Profis'
  },
  {
    id: 'h2',
    name: 'ClearComm Pro Gaming',
    category: 'Kopfhörer',
    price: 179.99,
    stock: 56,
    artNumber: 'CCP-GMG-007',
    specs: {
      driverSize: '40mm',
      impedance: '16 Ohm',
      frequency: '20Hz-20kHz',
      wireless: true,
      warranty: '12 Monate',
      weight: 0.29,
      quality: 4,
      color: 'Rot/Schwarz',
    },
    description: 'Gaming Wireless Headset mit guter Qualität'
  },
  {
    id: 'h3',
    name: 'OfficeChat Standard',
    category: 'Kopfhörer',
    price: 79.99,
    stock: 128,
    artNumber: 'OCS-STD-002',
    specs: {
      driverSize: '32mm',
      impedance: '64 Ohm',
      frequency: '20Hz-20kHz',
      wireless: false,
      warranty: '12 Monate',
      weight: 0.15,
      quality: 2,
      color: 'Schwarz',
    },
    description: 'Einfaches Multimedia-Headset'
  },
];

// Email-Daten mit spezifischen Anforderungen
const EMAILS: Email[] = [
  {
    id: 'e1',
    from: 'Thomas Voss',
    fromAddress: 'thomas.voss@architekt-net.de',
    subject: '🔴 DRINGEND: 8 High-End Desktop-PCs für 3D-Rendering-Studio',
    content: `Guten Tag Zusammen,

wir sind ein Architekturbüro und benötigen DRINGEND neue Rendering-Workstationen. Die aktuellen Maschinen sind zu alt für modernste Projekte.

ANFORDERUNGEN:
• Stückzahl: Exakt 8 Stück
• CPU: Mindestens Intel i9 oder AMD Ryzen 9 (aktuelle Generation)
• RAM: Minimum 64GB DDR5
• GPU: NVIDIA RTX 4080 oder besser
• SSD: Mind. 1TB NVMe
• Budget: MAX 17.000€ netto für alle 8 Stück (= max. 2.125€/Stück)
• Qualität: 5 Sterne zwingend erforderlich
• Lieferzeit: Max. 5 Werktage

Bitte kontaktieren Sie mich bei Rückfragen direkt.

Mit freundlichen Grüßen
Thomas Voss
Architekturbüro Voss & Partner`,
    requirements: {
      quantity: { exact: 8 },
      maxBudget: 17000,
      quality: 5,
      specs: [
        { key: 'cpu', values: ['Intel Core i9', 'AMD Ryzen 9'] },
        { key: 'ram', minValue: 64 },
        { key: 'gpu', values: ['RTX 4080', 'RTX 4090'] },
        { key: 'storage', minValue: 1024 },
      ],
      priority: ['qualität', 'leistung', 'lieferzeit'],
    },
    customerNumber: '2401',
    date: '06.03.2026',
    read: false,
  },
  {
    id: 'e2',
    from: 'Petra Schmidt',
    fromAddress: 'bestellung@schulzentrum-berlin.de',
    subject: 'Schulausstattung: 25 Monitore für Computerräume',
    content: `Liebe Damen und Herren,

das Schulzentrum Berlin erneuert derzeit seine Computerräume. Wir benötigen insgesamt 25 Monitore für den Standardunterricht.

SPEZIFIKATION:
• Anzahl: 25 Stück
• Bildschirmgröße: 24" (bevorzugt) oder 27"
• Auflösung: Mindestens Full HD (1920x1080)
• Panel: IPS oder VA (nicht TN!)
• Budget pro Monitor: MAX 350€ netto
• Gesamtbudget: MAX 8.750€ netto
• Garantie: Mindestens 24 Monate
• Qualität: Minimum 3 Sterne

Bildungsträger-Rabatt wird erwartet.

Viele Grüße
Petra Schmidt
Schulzentrum Berlin - IT-Leitung`,
    requirements: {
      quantity: { exact: 25 },
      maxBudget: 8750,
      quality: 3,
      specs: [
        { key: 'diagonal', values: ['24"', '27"'] },
        { key: 'resolution', values: ['Full HD (1920x1080)', 'QHD (2560x1440)'] },
        { key: 'panelType', values: ['IPS', 'VA'] },
      ],
      priority: ['preis', 'zuverlässigkeit', 'qualität'],
    },
    customerNumber: '2402',
    date: '05.03.2026',
    read: false,
  },
  {
    id: 'e3',
    from: 'Marco Rossi',
    fromAddress: 'einkauf@esports-lounge.it',
    subject: 'Gaming Equipment für eSports Arena - 12x Monitor + 12x PC',
    content: `Ciao,

wir eröffnen eine neue eSports Arena und suchen hochperformante Hardware für Turniere.

MONITORE (12 Stück):
• 27" oder größer
• Mindestens 144Hz Bildwiederholrate
• QHD oder 4K Auflösung
• Für schnelle, kompetitive Games optimiert
• Budget: Max 8.000€ netto für alle 12

PCS (12 Stück):
• Gaming-fokussiert
• RTX 4070 oder besser
• 32GB RAM oder mehr
• 144Hz Gaming möglich (60 FPS+ auf hohen Settings)
• Budget: Max 24.000€ netto für alle 12

Gesamtbudget: 32.000€ netto
Priorität: Performance > Preis

Angebot bitte bis Freitag.

Marco Rossi
eSports Arena Milano`,
    requirements: {
      quantity: { exact: 24 },
      maxBudget: 32000,
      quality: 5,
      specs: [
        { key: 'refreshRate', minValue: 144 },
        { key: 'gpu', values: ['RTX 4070', 'RTX 4080', 'RTX 4090'] },
        { key: 'ram', minValue: 32 },
      ],
      priority: ['performance', 'qualität', 'preis'],
    },
    customerNumber: '2403',
    date: '04.03.2026',
    read: false,
  },
  {
    id: 'e4',
    from: 'Julia Nielsen',
    fromAddress: 'julia@medienstudio-hamburg.de',
    subject: 'Video-Editing Suite: 6 workstations + 6 Professional Tablets',
    content: `Hallo,

unser Medienstudio wächst und wir brauchen neue Geräte für Video-Editoren.

WORKSTATIONS (6x):
• Intel i9 oder AMD Ryzen 9 zwingend
• 64GB RAM (DDR5)
• RTX 4090 für schnellere Rendering-Zeiten
• 2TB SSD (für Raw-Video material)
• Budget: Max 2.200€/Stück = 13.200€ gesamt
• Qualität: 5 Sterne erforderlich

TABLETS (6x):
• 12-13 Zoll
• Für Digital Painting / Color Grading
• Min. 8GB RAM, 512GB Storage
• Apple M2 oder besser / Top Android Chip
• Budget: Max 900€/Stück = 5.400€ total

GESAMTBUDGET: 18.600€ netto (FEST!)
Lieferzeit: 10 Werktage willkommen

LG
Julia Nielsen
Medienstudio Hamburg GmbH`,
    requirements: {
      quantity: { exact: 12 },
      maxBudget: 18600,
      quality: 5,
      specs: [
        { key: 'cpu', values: ['Intel Core i9', 'AMD Ryzen 9', 'Apple M2'] },
        { key: 'ram', minValue: 64 },
        { key: 'screen', values: ['12.9"'] },
      ],
      priority: ['qualität', 'performance', 'lieferung'],
    },
    customerNumber: '2404',
    date: '02.03.2026',
    read: false,
  },
  {
    id: 'e5',
    from: 'Georg Waldmann',
    fromAddress: 'einkauf@uni-münchen.de',
    subject: 'Preisgünstige Tablet-Lösung für Vorlesungssaal (100 Stück!)',
    content: `Sehr geehrte Damen und Herren,

die TU München erneuert ihre Lernmittel. Für die großen Vorlesungssäle benötigen wir hundert günstige Tablets für Studierende.

ANFORDERUNGEN:
• Menge: Exakt 100 Tablets
• Diagonale: 10 Zoll (akzeptabel: 9-11 Zoll)
• Storage: Mindestens 128GB
• RAM: Mind. 6GB
• BUDGET: MAXIMAL 50€ netto pro Stück! (= 5.000€ total)
• Qualität: 2-3 Sterne okay
• Betriebssystem: Android bevorzugt

Dies ist ein Großauftrag mit weiteren Bestellungen als Option.

Mit freundlichen Grüßen
Dr. Georg Waldmann
TU München - Beschaffung`,
    requirements: {
      quantity: { exact: 100 },
      maxBudget: 5000,
      quality: 3,
      specs: [
        { key: 'screen', values: ['8"', '10"', '10.1"'] },
        { key: 'storage', minValue: 128 },
        { key: 'ram', minValue: 4 },
      ],
      priority: ['preis', 'verfügbarkeit', 'zuverlässigkeit'],
    },
    customerNumber: '2405',
    date: '01.03.2026',
    read: false,
  },
];

const LIEFERBEDINGNISSE = {
  rabattstaffeln: [
    { ab: 10000, prozent: 5 },
    { ab: 50000, prozent: 10 },
  ],
  versandkostenD: 20,
  versandkostenEU: 50,
  versandkostenfrei: 2500,
  expresszuschlag: 30,
  zahlungsziel: 30,
  skonto: 2.0,
  skontoTage: 7,
  mahngebuehr: 0,
};

// Email Reader Modal
function EmailReaderModal({ email, onClose }: { email: Email | null; onClose: () => void }) {
  if (!email) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-6 flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500 mb-2">Von: {email.from}</p>
            <h2 className="text-2xl font-bold text-slate-800">{email.subject}</h2>
            <p className="text-sm text-slate-500 mt-2">{email.date} • Kunde #{email.customerNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-light"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {email.content}
        </div>

        {/* Requirements Summary */}
        <div className="border-t border-slate-200 bg-blue-50 p-6">
          <h3 className="font-bold text-slate-800 mb-3">📋 Zusammenfassung der Anforderungen:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Stückzahl:</p>
              <p className="font-semibold text-slate-800">
                {email.requirements.quantity?.exact || email.requirements.quantity?.min || '?'}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Max. Budget netto:</p>
              <p className="font-semibold text-slate-800">
                € {email.requirements.maxBudget?.toLocaleString('de-DE')}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Min. Qualität:</p>
              <p className="font-semibold text-slate-800">
                {'⭐'.repeat(email.requirements.quality || 3)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Prioritäten:</p>
              <p className="font-semibold text-slate-800">
                {email.requirements.priority?.slice(0, 2).join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="border-t border-slate-200 p-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Verkaufsprozess() {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    currentStep: 0,
    offer: {
      quantity: 0,
      unitPrice: 0,
      discount: 0,
      shippingCost: 0,
    },
    invoiceData: {
      invoiceNumber: 18,
      invoiceDate: new Date().toLocaleDateString('de-DE'),
      discountPercent: 0,
      discountAmount: 0,
      transferAmount: 0,
    },
    shipping: {},
    paymentVerified: false,
  });

  const [activeTab, setActiveTab] = useState<'email' | 'warehouse' | 'documents' | 'banking'>('email');
  const [selectedEmailForReading, setSelectedEmailForReading] = useState<Email | null>(null);

  // Email auswählen für Angebot
  const selectEmailForOffer = (email: Email) => {
    setWorkflow({
      ...workflow,
      selectedEmail: email,
      currentStep: 1,
    });
    setActiveTab('warehouse');
  };

  // Produkte für diese Anfrage filtern
  const getMatchingProducts = (email?: Email): Product[] => {
    if (!email) return PRODUCTS;

    const reqs = email.requirements;
    return PRODUCTS.filter((product) => {
      // Lagerbestand prüfen
      if (product.stock <= 0) return false;

      // Qualität
      if (reqs.quality && product.specs.quality && product.specs.quality < reqs.quality) {
        return false;
      }

      // Spezifikationen
      for (const spec of reqs.specs || []) {
        if (spec.key === 'cpu') {
          if (!spec.values?.some((v) => product.specs.cpu?.includes(v))) return false;
        }
        if (spec.key === 'ram') {
          const ramMatch = product.specs.ram?.match(/(\d+)/);
          if (ramMatch && spec.minValue) {
            if (parseInt(ramMatch[1]) < spec.minValue) return false;
          }
        }
        if (spec.key === 'gpu') {
          if (!spec.values?.some((v) => product.specs.gpu?.includes(v))) return false;
        }
        if (spec.key === 'storage') {
          const storageMatch = product.specs.storage?.match(/(\d+)/);
          if (storageMatch && spec.minValue) {
            if (parseInt(storageMatch[1]) < spec.minValue) return false;
          }
        }
        if (spec.key === 'diagonal') {
          if (!spec.values?.some((v) => product.specs.diagonal?.includes(v))) return false;
        }
        if (spec.key === 'refreshRate') {
          const rateMatch = product.specs.refreshRate?.match(/(\d+)/);
          if (rateMatch && spec.minValue) {
            if (parseInt(rateMatch[1]) < spec.minValue) return false;
          }
        }
        if (spec.key === 'screen') {
          if (!spec.values?.some((v) => product.specs.screen?.includes(v))) return false;
        }
      }

      return true;
    });
  };

  const matchingProducts = getMatchingProducts(workflow.selectedEmail);

  // Produkt auswählen
  const selectProduct = (product: Product) => {
    setWorkflow({
      ...workflow,
      selectedProduct: product,
      currentStep: 2,
      offer: {
        ...workflow.offer,
        product,
        unitPrice: product.price,
      },
    });
    setActiveTab('documents');
  };

  // Step Status Badge
  const StepBadge = ({ step, title, completed }: { step: number; title: string; completed: boolean }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
        workflow.currentStep === step
          ? 'border-orange-500 bg-orange-50'
          : completed
          ? 'border-green-500 bg-green-50'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          completed
            ? 'bg-green-500 text-white'
            : workflow.currentStep === step
            ? 'bg-orange-500 text-white'
            : 'bg-slate-300 text-slate-700'
        }`}
      >
        {completed ? '✓' : step + 1}
      </div>
      <span className="font-semibold text-slate-700">{title}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-4 text-md font-medium transition-colors">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-4xl font-bold mb-2">📦 Verkaufsprozess Simulation MM5 GmbH</h1>
          <p className="text-lg text-orange-100">
            Elektrofachhandel | Kundenanfragen verarbeiten | Passendes Angebot erstellen
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 flex gap-8">
        {/* Left: Tabs & Content */}
        <div className="flex-1">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'email' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📧 Posteingang
            </button>
            <button
              onClick={() => setActiveTab('warehouse')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'warehouse' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📦 Lager
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'documents' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📄 Dokumente
            </button>
            <button
              onClick={() => setActiveTab('banking')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'banking' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              💰 Banking
            </button>
          </div>

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">📧 Posteingang ({EMAILS.length})</h2>
              <div className="space-y-4">
                {EMAILS.map((email) => (
                  <div
                    key={email.id}
                    className="border-2 border-slate-200 rounded-lg p-6 bg-slate-50 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1 cursor-pointer" onClick={() => setSelectedEmailForReading(email)}>
                        <h3 className="font-bold text-slate-900 hover:text-blue-600 transition-colors">{email.from}</h3>
                        <p className="text-sm text-slate-500">{email.fromAddress}</p>
                        <p className="font-semibold text-blue-600 mt-2 line-clamp-1">{email.subject}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm text-slate-500">{email.date}</span>
                        <p className="text-xs text-slate-500 mt-1">Kunde #{email.customerNumber}</p>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-2 mb-4 text-xs">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {email.requirements.quantity?.exact || '?'} Stück
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        Budget: € {email.requirements.maxBudget?.toLocaleString('de-DE')}
                      </span>
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                        Quality: {'⭐'.repeat(email.requirements.quality || 3)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedEmailForReading(email)}
                        className="flex-1 py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm"
                      >
                        Lesen
                      </button>
                      <button
                        onClick={() => selectEmailForOffer(email)}
                        className="flex-1 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        Bearbeiten
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warehouse Tab */}
          {activeTab === 'warehouse' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">📦 Lager durchsuchen</h2>

              {workflow.selectedEmail ? (
                <>
                  <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="font-semibold text-slate-800">
                      Kundenanfrage: {workflow.selectedEmail.requirements.quantity?.exact} Stück
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Budget: € {workflow.selectedEmail.requirements.maxBudget?.toLocaleString('de-DE')} | Min. Qualität:{' '}
                      {'⭐'.repeat(workflow.selectedEmail.requirements.quality || 3)}
                    </p>
                  </div>

                  {matchingProducts.length > 0 ? (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
                      <p className="font-semibold text-green-800">
                        ✓ {matchingProducts.length} passende Produkt(e) gefunden
                      </p>
                    </div>
                  ) : (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                      <p className="font-semibold text-red-800">
                        ✗ Keine Produkte erfüllen alle Anforderungen!
                      </p>
                    </div>
                  )}

                  {/* Produkte nach Kategorie */}
                  <div className="space-y-6">
                    {['Desktop-PCs', 'Monitore', 'Tablets', 'Kopfhörer'].map((category) => {
                      const categoryProducts = matchingProducts.filter((p) => p.category === category);
                      if (categoryProducts.length === 0) return null;

                      return (
                        <div key={category}>
                          <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2">{category}</h3>
                          <div className="space-y-3">
                            {categoryProducts.map((product) => (
                              <div
                                key={product.id}
                                onClick={() => selectProduct(product)}
                                className={`border-2 rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg ${
                                  workflow.selectedProduct?.id === product.id
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-slate-200 hover:border-green-400 bg-white'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-bold text-slate-900">{product.name}</p>
                                    <p className="text-xs text-slate-500">Art.-Nr. {product.artNumber}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-slate-900">€ {product.price.toFixed(2)}</p>
                                    <p className="text-sm font-semibold text-green-600">
                                      Lager: {product.stock} Stk.
                                    </p>
                                  </div>
                                </div>

                                {/* Specs Summary */}
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                                  {product.specs.cpu && <div>🖥️ {product.specs.cpu}</div>}
                                  {product.specs.ram && <div>💾 {product.specs.ram}</div>}
                                  {product.specs.diagonal && <div>📺 {product.specs.diagonal}</div>}
                                  {product.specs.screen && <div>📱 {product.specs.screen}</div>}
                                  {product.specs.frequency && <div>🎧 {product.specs.frequency}</div>}
                                </div>

                                {/* Quality Stars */}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-orange-600">
                                    {'⭐'.repeat(product.specs.quality || 3)}
                                  </span>
                                  {workflow.selectedProduct?.id === product.id && (
                                    <span className="text-xs font-bold text-green-600">✓ Ausgewählt</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-slate-500">Wählen Sie zuerst eine Email aus dem Posteingang.</p>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">📄 Angebotserstellung</h2>

              {workflow.selectedProduct && workflow.selectedEmail ? (
                <div className="space-y-6">
                  {/* Angebots-Preview */}
                  <div className="border-2 border-slate-300 rounded-lg p-8 bg-slate-50">
                    <div className="space-y-4 mb-6">
                      <p className="font-bold text-slate-800">Angebot Nr. {workflow.invoiceData.invoiceNumber}</p>
                      <p className="text-sm text-slate-600">{workflow.invoiceData.invoiceDate}</p>
                    </div>

                    <div className="mb-6">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-800">
                            <th className="text-left font-bold py-2">Artikel</th>
                            <th className="text-center font-bold py-2">Menge</th>
                            <th className="text-right font-bold py-2">Preis</th>
                            <th className="text-right font-bold py-2">Summe</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-2">{workflow.selectedProduct.name}</td>
                            <td className="text-center">{workflow.selectedEmail.requirements.quantity?.exact}</td>
                            <td className="text-right">€ {workflow.selectedProduct.price.toFixed(2)}</td>
                            <td className="text-right">
                              €{' '}
                              {(
                                workflow.selectedProduct.price *
                                (workflow.selectedEmail.requirements.quantity?.exact || 1)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span>Summe der Einzelposten:</span>
                        <span>
                          €{' '}
                          {(
                            workflow.selectedProduct.price *
                            (workflow.selectedEmail.requirements.quantity?.exact || 1)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rabatt:</span>
                        <span>€ 0.00</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Versandkosten (inkl. Verpackung):</span>
                        <span>€ {LIEFERBEDINGNISSE.versandkostenD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Gesamtpreis netto:</span>
                        <span>
                          €{' '}
                          {(
                            workflow.selectedProduct.price *
                              (workflow.selectedEmail.requirements.quantity?.exact || 1) +
                            LIEFERBEDINGNISSE.versandkostenD
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Aktionen */}
                  <div className="flex gap-4">
                    <button className="flex-1 py-3 px-6 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
                      Angebot absenden
                    </button>
                    <button
                      onClick={() => setWorkflow({ ...workflow, selectedProduct: undefined })}
                      className="flex-1 py-3 px-6 bg-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-400 transition-colors"
                    >
                      Anderes Produkt wählen
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">Wählen Sie eine Email und ein Produkt aus.</p>
              )}
            </div>
          )}

          {/* Banking Tab */}
          {activeTab === 'banking' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">💰 Online-Banking</h2>
              <p className="text-slate-500">Banking-Modul folgt in der nächsten Phase...</p>
            </div>
          )}
        </div>

        {/* Right: Workflow Status */}
        <div className="w-64">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 sticky top-8">
            <h3 className="text-lg font-bold mb-6 text-slate-800">🔄 Prozessablauf</h3>
            <div className="space-y-3">
              <StepBadge step={0} title="Email auswählen" completed={workflow.currentStep > 0} />
              <StepBadge step={1} title="Produkt suchen" completed={workflow.currentStep > 1} />
              <StepBadge step={2} title="Angebot erstellen" completed={workflow.currentStep > 2} />
              <StepBadge step={3} title="Auftrag erhalten" completed={workflow.currentStep > 3} />
              <StepBadge step={4} title="Auftragsbestätigung" completed={workflow.currentStep > 4} />
              <StepBadge step={5} title="Zahlung prüfen" completed={workflow.currentStep > 5} />
              <StepBadge step={6} title="Versandauftrag" completed={workflow.currentStep > 6} />
              <StepBadge step={7} title="Rechnung" completed={workflow.currentStep > 7} />
              <StepBadge step={8} title="Versand wählen" completed={workflow.currentStep > 8} />
              <StepBadge step={9} title="Abschluss" completed={workflow.currentStep > 9} />
            </div>

            {/* Aktuelle Daten */}
            {workflow.selectedEmail && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-bold text-blue-900 mb-2">📧 ANFRAGE</p>
                <p className="text-sm text-slate-800">{workflow.selectedEmail.from}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {workflow.selectedEmail.requirements.quantity?.exact} Stück
                </p>
              </div>
            )}

            {workflow.selectedProduct && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-bold text-green-900 mb-2">📦 PRODUKT</p>
                <p className="text-sm text-slate-800">{workflow.selectedProduct.name}</p>
                <p className="text-xs text-slate-600 mt-1">€ {workflow.selectedProduct.price.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Email Reader Modal */}
      <EmailReaderModal email={selectedEmailForReading} onClose={() => setSelectedEmailForReading(null)} />
    </div>
  );
}
