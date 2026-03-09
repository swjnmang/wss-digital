import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface ProductSpecs {
  ram?: string;
  cpu?: string;
  storage?: string;
  gpu?: string;
  diagonal?: string;
  resolution?: string;
  refreshRate?: string;
  panelType?: string;
  screen?: string;
  processor?: string;
  battery?: string;
  driverSize?: string;
  impedance?: string;
  frequency?: string;
  wireless?: boolean;
  weight?: number;
  warranty?: string;
  color?: string;
  quality?: number;
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
  weight: number;
}

interface CustomerRequirements {
  quantity?: { exact?: number };
  maxBudget?: number;
  quality?: number;
  specs?: { key: string; values?: string[]; minValue?: number }[];
  priority?: string[];
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
  category: string;
}

interface ShippingOption {
  id: string;
  name: string;
  fixCost: number;
  costPerKg: number;
  deliveryDays: number;
}

interface WorkflowState {
  currentStep: number;
  selectedEmail?: Email;
  selectedProduct?: Product;
  quantity: number;
  offerNumber: number;
  offerDate: string;
  orderAccepted: boolean;
  orderDate?: string;
  orderConfirmationDate: string;
  invoiceNumber: number;
  invoiceDate: string;
  invoiceSignatureDate: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  shippingCost: number;
  totalNetto: number;
  vatAmount: number;
  totalBrutto: number;
  skontoAmount: number;
  amountAfterSkonto: number;
  invoiceValidated: boolean;
  selectedShipping?: ShippingOption;
  shippingCostInput: Record<string, number>;
  shippingValidated: boolean;
  shippingOrderConfirmed: boolean;
  paymentReference: string;
  paymentVerified: boolean;
  goodsShipped: boolean;
  offerFinalized: boolean;
  generatedShippingOptions?: ShippingOption[];
}

const LIEFERBEDINGNISSE = {
  versandkostenD: 20,
  versandkostenEU: 50,
  versandkostenfrei: 2500,
  expresszuschlag: 30,
  rabattstaffeln: [
    { ab: 10000, prozent: 5 },
    { ab: 50000, prozent: 10 },
  ],
  zahlungsziel: 30,
  skonto: 2.0,
  skontoTage: 7,
  vatRate: 19,
};

const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: 'express-logistics', name: 'Express Logistics GmbH', fixCost: 8.50, costPerKg: 1.20, deliveryDays: 2 },
  { id: 'swift-transport', name: 'SwiftTransport AG', fixCost: 5.00, costPerKg: 1.80, deliveryDays: 3 },
  { id: 'eco-shipping', name: 'EcoShip Versand', fixCost: 2.50, costPerKg: 2.50, deliveryDays: 5 },
  { id: 'premium-courier', name: 'PremiumCourier Plus', fixCost: 12.00, costPerKg: 0.90, deliveryDays: 1 },
];

// ============================================================================
// PRODUCT DATA
// ============================================================================

const PRODUCTS: Product[] = [
  // ========== DESKTOP-PCs ==========
  {
    id: 'p1',
    name: 'ProStation Elite X12',
    category: 'Desktop-PCs',
    price: 1895.50,
    stock: 12,
    artNumber: 'PS-ELX-001',
    weight: 8.5,
    specs: { cpu: 'Intel Core i7-13700K', ram: '32GB DDR5', storage: '1TB NVMe SSD', gpu: 'NVIDIA RTX 4080 Super', warranty: '36 Monate', quality: 5, color: 'Grau' },
    description: 'High-Performance Desktop für professionelle Anwendungen'
  },
  {
    id: 'p1b',
    name: 'ProStation Elite X8',
    category: 'Desktop-PCs',
    price: 1599.99,
    stock: 18,
    artNumber: 'PS-ELX-002',
    weight: 8.2,
    specs: { cpu: 'Intel Core i7-13700K', ram: '32GB DDR5', storage: '512GB NVMe SSD', gpu: 'NVIDIA RTX 4080', warranty: '36 Monate', quality: 5, color: 'Grau' },
    description: 'High-Performance Desktop RTX 4080'
  },
  {
    id: 'p2',
    name: 'WorkHub Standard W8',
    category: 'Desktop-PCs',
    price: 849.99,
    stock: 35,
    artNumber: 'WH-STD-008',
    weight: 6.2,
    specs: { cpu: 'AMD Ryzen 5 5600G', ram: '16GB DDR4', storage: '512GB SSD', gpu: 'Integrated Vega', warranty: '24 Monate', quality: 4, color: 'Schwarz' },
    description: 'Zuverlässiger Office-PC für Standardaufgaben'
  },
  {
    id: 'p3',
    name: 'UltraBook CoreMax M9',
    category: 'Desktop-PCs',
    price: 2450.00,
    stock: 8,
    artNumber: 'UB-CM-M9',
    weight: 10.1,
    specs: { cpu: 'Intel Core i9-13900KS', ram: '64GB DDR5', storage: '2TB NVMe SSD', gpu: 'NVIDIA RTX 4090', warranty: '48 Monate', quality: 5, color: 'Weiß' },
    description: 'Top-of-the-Line Workstation für Video & 3D-Rendering'
  },
  {
    id: 'p3b',
    name: 'ProStation Excellence X16',
    category: 'Desktop-PCs',
    price: 3200.00,
    stock: 6,
    artNumber: 'PS-EXC-X16',
    weight: 11.0,
    specs: { cpu: 'Intel Core i9-13900K', ram: '96GB DDR5', storage: '4TB NVMe SSD', gpu: 'NVIDIA RTX 4090', warranty: '48 Monate', quality: 5, color: 'Grau' },
    description: 'Extreme Performance Workstation mit RTX 4090'
  },
  {
    id: 'p3c',
    name: 'RenderPro RTX4090 Ultra',
    category: 'Desktop-PCs',
    price: 2899.99,
    stock: 5,
    artNumber: 'RP-RTX4090U',
    weight: 10.8,
    specs: { cpu: 'Intel Core i9-13900K', ram: '64GB DDR5', storage: '2TB NVMe SSD', gpu: 'NVIDIA RTX 4090', warranty: '48 Monate', quality: 5, color: 'Schwarz' },
    description: 'Professionelle Rendering-Workstation RTX 4090'
  },
  {
    id: 'p4',
    name: 'BudgetBox Simple S4',
    category: 'Desktop-PCs',
    price: 499.99,
    stock: 50,
    artNumber: 'BB-SMP-S4',
    weight: 5.0,
    specs: { cpu: 'Intel Pentium Gold G7400', ram: '8GB DDR4', storage: '256GB SSD', quality: 2, color: 'Schwarz' },
    description: 'Einstiegs-PC für Schulen und Kleine Büros'
  },
  {
    id: 'p4b',
    name: 'WorkPro Standard W6',
    category: 'Desktop-PCs',
    price: 699.99,
    stock: 28,
    artNumber: 'WP-STD-006',
    weight: 5.8,
    specs: { cpu: 'AMD Ryzen 5 5500', ram: '8GB DDR4', storage: '512GB SSD', quality: 3, color: 'Schwarz' },
    description: 'Kostengünstiger Office-PC mit Ryzen 5'
  },
  
  // ========== MONITORE ==========
  {
    id: 'm1',
    name: 'CinaryView Pro 32',
    category: 'Monitore',
    price: 1899.00,
    stock: 15,
    artNumber: 'CVP-32-004K',
    weight: 12.5,
    specs: { diagonal: '32"', resolution: '4K (3840x2160)', refreshRate: '60Hz', panelType: 'IPS', warranty: '36 Monate', quality: 5 },
    description: 'Professional 4K Monitor für Design & Video-Editing'
  },
  {
    id: 'm2',
    name: 'GameEdge 27 Pro',
    category: 'Monitore',
    price: 599.99,
    stock: 42,
    artNumber: 'GE-27-144',
    weight: 8.2,
    specs: { diagonal: '27"', resolution: 'QHD (2560x1440)', refreshRate: '144Hz', panelType: 'VA', warranty: '24 Monate', quality: 4 },
    description: 'Gaming Monitor mit hoher Bildwiederholrate'
  },
  {
    id: 'm2b',
    name: 'ProDisplay 27 QHD',
    category: 'Monitore',
    price: 449.99,
    stock: 38,
    artNumber: 'PD-27-QHD',
    weight: 8.0,
    specs: { diagonal: '27"', resolution: 'QHD (2560x1440)', refreshRate: '75Hz', panelType: 'IPS', warranty: '36 Monate', quality: 4 },
    description: 'Professioneller 27" QHD Monitor mit IPS-Panel'
  },
  {
    id: 'm3',
    name: 'OfficeCore 24 FHD',
    category: 'Monitore',
    price: 259.99,
    stock: 73,
    artNumber: 'OC-24-FHD',
    weight: 6.0,
    specs: { diagonal: '24"', resolution: 'Full HD (1920x1080)', refreshRate: '60Hz', panelType: 'TN', warranty: '24 Monate', quality: 3 },
    description: 'Standard Office-Monitor für alltägliche Aufgaben'
  },
  {
    id: 'm3b',
    name: 'EduDisplay 24 FHD',
    category: 'Monitore',
    price: 229.99,
    stock: 95,
    artNumber: 'ED-24-FHD',
    weight: 5.9,
    specs: { diagonal: '24"', resolution: 'Full HD (1920x1080)', refreshRate: '60Hz', panelType: 'TN', warranty: '24 Monate', quality: 3 },
    description: 'Schulgeeigneter 24" FHD Monitor'
  },
  {
    id: 'm3c',
    name: 'BudgetView 27 FHD',
    category: 'Monitore',
    price: 299.99,
    stock: 67,
    artNumber: 'BV-27-FHD',
    weight: 7.2,
    specs: { diagonal: '27"', resolution: 'Full HD (1920x1080)', refreshRate: '60Hz', panelType: 'VA', warranty: '24 Monate', quality: 3 },
    description: 'Budget-freundlicher 27" FHD Monitor'
  },
  {
    id: 'm4',
    name: 'UltraWide Cinema 49',
    category: 'Monitore',
    price: 2299.99,
    stock: 6,
    artNumber: 'UWC-49-144',
    weight: 18.0,
    specs: { diagonal: '49"', resolution: '5120x1440', refreshRate: '144Hz', panelType: 'VA', warranty: '36 Monate', quality: 5 },
    description: 'Ultra-Wide Curved Monitor für Profis'
  },
  {
    id: 'm5',
    name: 'ProDisplay 27 Premium',
    category: 'Monitore',
    price: 749.99,
    stock: 22,
    artNumber: 'PD-27-PREM',
    weight: 8.5,
    specs: { diagonal: '27"', resolution: 'QHD (2560x1440)', refreshRate: '100Hz', panelType: 'IPS', warranty: '36 Monate', quality: 5 },
    description: 'Premium 27" QHD Monitor mit 100Hz'
  },
  
  // ========== TABLETS ==========
  {
    id: 't1',
    name: 'TabMax Air Pro 12',
    category: 'Tablets',
    price: 1199.99,
    stock: 28,
    artNumber: 'TMA-PRO-12',
    weight: 0.6,
    specs: { screen: '12.9"', processor: 'Apple M2', storage: '512GB', warranty: '24 Monate', quality: 5 },
    description: 'Premium Tablet für kreative Profis'
  },
  {
    id: 't1b',
    name: 'TabMax Air Plus 12.9',
    category: 'Tablets',
    price: 899.99,
    stock: 22,
    artNumber: 'TMA-PLUS-129',
    weight: 0.58,
    specs: { screen: '12.9"', processor: 'Apple M1', storage: '256GB', warranty: '24 Monate', quality: 5 },
    description: 'Premium 12.9" Tablet mit M1 Chip'
  },
  {
    id: 't1c',
    name: 'ProTab Creative 12.9',
    category: 'Tablets',
    price: 799.99,
    stock: 32,
    artNumber: 'PT-CREA-129',
    weight: 0.62,
    specs: { screen: '12.9"', processor: 'Qualcomm Snapdragon 8 Gen 2', storage: '256GB', warranty: '24 Monate', quality: 4 },
    description: 'Professionelles 12.9" Android-Tablet'
  },
  {
    id: 't2',
    name: 'MediumTab Essential 10',
    category: 'Tablets',
    price: 449.99,
    stock: 91,
    artNumber: 'MTE-10-ESS',
    weight: 0.48,
    specs: { screen: '10.1"', processor: 'Qualcomm Snapdragon 870', storage: '128GB', warranty: '12 Monate', quality: 3 },
    description: 'Universal-Tablet für Schulen und Unterricht'
  },
  {
    id: 't2b',
    name: 'TabView Standard 10.1',
    category: 'Tablets',
    price: 379.99,
    stock: 58,
    artNumber: 'TV-STD-101',
    weight: 0.46,
    specs: { screen: '10.1"', processor: 'Qualcomm Snapdragon 680', storage: '128GB', warranty: '12 Monate', quality: 3 },
    description: 'Schulgeeignetes 10.1" Standard-Tablet'
  },
  {
    id: 't2c',
    name: 'TradeTab Pro 10',
    category: 'Tablets',
    price: 549.99,
    stock: 44,
    artNumber: 'TT-PRO-10',
    weight: 0.50,
    specs: { screen: '10.1"', processor: 'Qualcomm Snapdragon 888', storage: '256GB', warranty: '24 Monate', quality: 4 },
    description: 'Robustes Tablet mit großem Speicher für Unterricht'
  },
  {
    id: 't3',
    name: 'CompactView Go 8',
    category: 'Tablets',
    price: 299.99,
    stock: 64,
    artNumber: 'CVG-8-000',
    weight: 0.35,
    specs: { screen: '8"', processor: 'MediaTek Helio G99', storage: '64GB', warranty: '12 Monate', quality: 2 },
    description: 'Portables Tablet für unterwegs'
  },
  
  // ========== KOPFHÖRER ==========
  {
    id: 'h1',
    name: 'SoundPro Studio Elite',
    category: 'Kopfhörer',
    price: 449.99,
    stock: 37,
    artNumber: 'SPE-STU-001',
    weight: 0.25,
    specs: { driverSize: '50mm', frequency: '10Hz-40kHz', wireless: false, warranty: '24 Monate', quality: 5 },
    description: 'Studio-Kopfhörer für Audio-Profis'
  },
  {
    id: 'h1b',
    name: 'AudioMax Wireless Pro',
    category: 'Kopfhörer',
    price: 399.99,
    stock: 29,
    artNumber: 'AMP-WIR-PRO',
    weight: 0.27,
    specs: { driverSize: '45mm', frequency: '20Hz-20kHz', wireless: true, warranty: '24 Monate', quality: 5 },
    description: 'Kabellose Premium-Kopfhörer mit Noise Canceling'
  },
  {
    id: 'h2',
    name: 'ClearComm Pro Gaming',
    category: 'Kopfhörer',
    price: 179.99,
    stock: 56,
    artNumber: 'CCP-GMG-007',
    weight: 0.22,
    specs: { driverSize: '40mm', frequency: '20Hz-20kHz', wireless: true, warranty: '12 Monate', quality: 4 },
    description: 'Gaming Wireless Headset mit guter Qualität'
  },
  {
    id: 'h2b',
    name: 'AudioPro Wireless Premium',
    category: 'Kopfhörer',
    price: 319.99,
    stock: 41,
    artNumber: 'AP-WIR-PREM',
    weight: 0.25,
    specs: { driverSize: '42mm', frequency: '20Hz-20kHz', wireless: true, warranty: '24 Monate', quality: 4 },
    description: 'Hochwertige kabellose Kopfhörer für Profis'
  },
  {
    id: 'h3',
    name: 'OfficeChat Standard',
    category: 'Kopfhörer',
    price: 79.99,
    stock: 128,
    artNumber: 'OCS-STD-002',
    weight: 0.18,
    specs: { driverSize: '32mm', frequency: '20Hz-20kHz', wireless: false, warranty: '12 Monate', quality: 2 },
    description: 'Einfaches Multimedia-Headset'
  },
  {
    id: 'h4',
    name: 'SchoolLine Educational',
    category: 'Kopfhörer',
    price: 89.99,
    stock: 150,
    artNumber: 'SLE-EDU-003',
    weight: 0.20,
    specs: { driverSize: '36mm', frequency: '20Hz-20kHz', wireless: false, warranty: '24 Monate', quality: 3 },
    description: 'Robuste Kopfhörer für Bildungseinrichtungen'
  },
  {
    id: 'h4b',
    name: 'EduComm Robust School',
    category: 'Kopfhörer',
    price: 69.99,
    stock: 200,
    artNumber: 'ECR-SCHOOL',
    weight: 0.19,
    specs: { driverSize: '34mm', frequency: '20Hz-20kHz', wireless: false, warranty: '24 Monate', quality: 3 },
    description: 'Robuste Schulkopfhörer - Massenbestand'
  },
];

const EMAILS: Email[] = [
  {
    id: 'e1',
    from: 'Thomas Voss',
    fromAddress: 'thomas.voss@architekt-net.de',
    subject: '🔴 DRINGEND: 8 High-End Desktop-PCs für 3D-Rendering-Studio',
    content: `Guten Tag Zusammen,\n\nwir sind ein Architekturbüro und benötigen DRINGEND neue Rendering-Workstationen.\n\nANFORDERUNGEN:\n• Stückzahl: Exakt 8 Stück\n• Wichtig: Leistungsstarke GPU (RTX 4080 oder besser) für 3D-Rendering\n• Wichtig: Mindestens 32GB RAM für große Dateien\n• Budget: MAX 17.000€ netto\n• Qualität: 5 Sterne erforderlich\n\nMit freundlichen Grüßen\nThomas Voss`,
    requirements: { quantity: { exact: 8 }, maxBudget: 17000, quality: 5, specs: [{ key: 'gpu', values: ['RTX 4080', 'RTX 4090'] }, { key: 'ram', minValue: 32 }], priority: ['leistung', 'qualität'] },
    customerNumber: '2401',
    date: '06.03.2026',
    read: false,
    category: 'Desktop-PCs',
  },
  {
    id: 'e2',
    from: 'Petra Schmidt',
    fromAddress: 'bestellung@schulzentrum-berlin.de',
    subject: 'Schulausstattung: 25 Monitore für Computerräume',
    content: `Liebe Damen und Herren,\n\ndas Schulzentrum Berlin erneuert seine Computerräume. Wir benötigen 25 Monitore.\n\nANFORDERUNGEN:\n• Anzahl: 25 Stück\n• Wichtig: 24" oder 27" Bildschirmgröße (Klassenzimmer-Standard)\n• Wichtig: Gutes Preis-Leistungs-Verhältnis (Budget max. 8.750€ gesamt)\n• Qualität: Minimum 3 Sterne\n\nMit freundlichen Grüßen\nPetra Schmidt`,
    requirements: { quantity: { exact: 25 }, maxBudget: 8750, quality: 3, specs: [{ key: 'diagonal', values: ['24"', '27"'] }], priority: ['preis', 'verfügbarkeit'] },
    customerNumber: '2402',
    date: '05.03.2026',
    read: false,
    category: 'Monitore',
  },
];

// ============================================================================
// EMAIL READER MODAL
// ============================================================================

function EmailReaderModal({ email, onClose, onEdit }: { email: Email | null; onClose: () => void; onEdit: (email: Email) => void }) {
  if (!email) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 p-6 flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500 mb-2">Von: {email.from} ({email.fromAddress})</p>
            <h2 className="text-2xl font-bold text-slate-800">{email.subject}</h2>
            <p className="text-sm text-slate-500 mt-2">{email.date} • Kunde #{email.customerNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-light">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border-b border-slate-200">
          {email.content}
        </div>

        <div className="bg-slate-100 p-6 border-t border-slate-200">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 mb-3">📋 Anforderungen:</h3>
            <ul className="text-sm text-slate-700 space-y-2 ml-4">
              <li>• <strong>Stückzahl:</strong> {email.requirements.quantity?.exact} Stück</li>
              <li>• <strong>Budget (netto):</strong> max. € {email.requirements.maxBudget?.toLocaleString('de-DE')}</li>
              <li>• <strong>Qualität:</strong> {'⭐'.repeat(email.requirements.quality || 3)}</li>
              {email.requirements.priority && email.requirements.priority.length > 0 && (
                <li>• <strong>Prioritäten:</strong> {email.requirements.priority.join(', ')}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-400 transition-colors">
            Schließen
          </button>
          <button
            onClick={() => {
              onEdit(email);
              onClose();
            }}
            className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
          >
            → Anfrage bearbeiten
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Format date to DD.MM.YYYY format
const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}.${month}.${year}`;
};

// Parse German input (e.g., 1.234,56 or 1234,56 or 1.234 or 1234.56 or 599.99) to number
const parseGermanInput = (value: string): number => {
  // Entferne € Symbol und Leerzeichen
  let cleaned = value.replace(/[^\d,.\-]/g, '').trim();
  
  if (!cleaned) return 0;
  
  // Finde Position des letzten Kommas und Punkts
  const lastCommaIdx = cleaned.lastIndexOf(',');
  const lastDotIdx = cleaned.lastIndexOf('.');
  
  // Fall 1: Deutsches Format mit beiden Trennzeichen (1.234,56)
  if (lastCommaIdx > lastDotIdx && lastDotIdx >= 0) {
    // Komma kommt nach Punkt → German format
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
  }
  
  // Fall 2: Internationales Format mit beiden Trennzeichen (1,234.56)
  if (lastDotIdx > lastCommaIdx && lastCommaIdx >= 0) {
    // Punkt kommt nach Komma
    const afterDot = cleaned.substring(lastDotIdx + 1);
    if (afterDot.length <= 2) {
      // Nur 1-2 Ziffern nach Punkt → Dezimaltrennzeichen
      return parseFloat(cleaned.replace(/,/g, '')) || 0;
    } else {
      // Zu viele Ziffern → Tausendertrennzeichen, Komma ist Dezimal
      return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
    }
  }
  
  // Fall 3: Nur Komma vorhanden
  if (lastCommaIdx >= 0 && lastDotIdx < 0) {
    const afterComma = cleaned.substring(lastCommaIdx + 1);
    if (afterComma.length <= 2) {
      // Dezimaltrennzeichen (Deutsch: 599,99)
      return parseFloat(cleaned.replace(',', '.')) || 0;
    } else {
      // Tausendertrennzeichen: 1.000 → 1000 (entferne Komma)
      return parseFloat(cleaned.replace(',', '')) || 0;
    }
  }
  
  // Fall 4: Nur Punkt vorhanden
  if (lastDotIdx >= 0 && lastCommaIdx < 0) {
    const afterDot = cleaned.substring(lastDotIdx + 1);
    if (afterDot.length <= 2) {
      // Dezimaltrennzeichen (International: 599.99 oder 7199.88)
      return parseFloat(cleaned) || 0;
    } else {
      // Tausendertrennzeichen: 1.000 → 1000 (entferne Punkt)
      return parseFloat(cleaned.replace(/\./g, '')) || 0;
    }
  }
  
  // Fall 5: Keine Trennzeichen → Ganze Zahl
  return parseFloat(cleaned) || 0;
};

// Calculate cheapest shipping option based on weight using generated options
const getCheapestShippingOption = (weight: number, generatedOptions?: ShippingOption[]): ShippingOption | null => {
  if (weight <= 0) return null;
  
  const options = generatedOptions || SHIPPING_OPTIONS;
  let cheapest: ShippingOption | null = null;
  let minCost = Infinity;
  
  for (const option of options) {
    const totalCost = option.fixCost + (weight * option.costPerKg);
    if (totalCost < minCost) {
      minCost = totalCost;
      cheapest = option;
    }
  }
  
  return cheapest;
};

// Generate random shipping costs for each option
const generateShippingCosts = (): ShippingOption[] => {
  return SHIPPING_OPTIONS.map((option) => ({
    ...option,
    fixCost: parseFloat((Math.random() * 15 + 2).toFixed(2)), // 2.00 - 17.00 €
    costPerKg: parseFloat((Math.random() * 2.5 + 0.5).toFixed(2)), // 0.50 - 3.00 € pro kg
  }));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// ============================================================================
// INITIAL WORKFLOW STATE
// ============================================================================

const INITIAL_WORKFLOW_STATE: WorkflowState = {
  currentStep: 0,
  quantity: 0,
  offerNumber: 18,
  offerDate: formatDate(new Date()),
  orderAccepted: false,
  orderConfirmationDate: '',
  invoiceNumber: 18,
  invoiceDate: formatDate(new Date()),
  invoiceSignatureDate: '',
  unitPrice: 0,
  discountPercent: 0,
  discountAmount: 0,
  subtotal: 0,
  shippingCost: 0,
  totalNetto: 0,
  vatAmount: 0,
  totalBrutto: 0,
  skontoAmount: 0,
  amountAfterSkonto: 0,
  invoiceValidated: false,
  shippingCostInput: {},
  shippingValidated: false,
  shippingOrderConfirmed: false,
  paymentReference: '',
  paymentVerified: false,
  goodsShipped: false,
  offerFinalized: false,
};

export default function Verkaufsprozess() {
  const [workflow, setWorkflow] = useState<WorkflowState>(INITIAL_WORKFLOW_STATE);

  const [activeTab, setActiveTab] = useState<'email' | 'warehouse' | 'documents' | 'order' | 'shipping' | 'invoice' | 'banking'>('email');
  const [selectedEmailForReading, setSelectedEmailForReading] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>(EMAILS);
  const [expandedCustomerRequest, setExpandedCustomerRequest] = useState<boolean>(false);
  const [expandedTerms, setExpandedTerms] = useState<boolean>(false);
  const [productValidationError, setProductValidationError] = useState<{ productId: string } | null>(null);
  const [warehouseFilter, setWarehouseFilter] = useState<string>('Alle');
  
  // Separate input states for free typing in offer calculation fields
  const [discountPercentInput, setDiscountPercentInput] = useState<string>('');
  const [discountAmountInput, setDiscountAmountInput] = useState<string>('');
  const [shippingCostInput, setShippingCostInput] = useState<string>('');
  const [totalNettoInput, setTotalNettoInput] = useState<string>('');
  const [vatAmountInput, setVatAmountInput] = useState<string>('');
  const [totalBruttoInput, setTotalBruttoInput] = useState<string>('');
  const [shippingValidationError, setShippingValidationError] = useState<string>('');

  // Separate input states for invoice fields
  const [invoiceSignatureDateInput, setInvoiceSignatureDateInput] = useState<string>('');
  const [skontoAmountInput, setSkontoAmountInput] = useState<string>('');
  const [amountAfterSkontoInput, setAmountAfterSkontoInput] = useState<string>('');

  // Load state from localStorage on mount and save changes
  useEffect(() => {
    const savedWorkflow = localStorage.getItem('verkaufsprozess_workflow');
    if (savedWorkflow) {
      try {
        setWorkflow(JSON.parse(savedWorkflow));
      } catch (e) {
        console.error('Fehler beim Laden des gespeicherten Workflows:', e);
      }
    }
  }, []);

  // Save workflow to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('verkaufsprozess_workflow', JSON.stringify(workflow));
  }, [workflow]);

  // Generate random customer emails with detailed, specific requests
  const generateEmails = () => {
    const firstNames = ['Thomas', 'Petra', 'Marco', 'Lisa', 'Astrid', 'Stefan', 'Julia', 'Klaus'];
    const lastNames = ['Voss', 'Schmidt', 'Weber', 'Meyer', 'Müller', 'Fischer', 'Wagner', 'Bauer'];
    const companies = ['Architektur GmbH', 'Schulzentrum', 'Designstudio', 'IT-Agentur', 'Marketing AG', 'Grafik-Büro'];
    const newEmails: Email[] = [];

    // Konkrete Anfragen-Templates für jede Kategorie
    const emailTemplates = [
      // Desktop-PC Anfragen
      {
        category: 'Desktop-PCs',
        quantity: 8,
        budget: 17000,
        quality: 5,
        subject: '8 High-End Desktop-PCs für Rendering-Studio',
        requirements: {
          quantity: { exact: 8 },
          maxBudget: 17000,
          quality: 5,
          specs: [
            { key: 'gpu', values: ['RTX 4080', 'RTX 4090'] },
            { key: 'ram', minValue: 32 },
          ],
          priority: ['Leistung', 'Qualität'],
        },
        content: `Guten Tag,

wir sind ein Architektur-Büro und benötigen neue Rendering-Workstationen für unser Team. Wir suchen hochwertige Desktop-PCs.

ANFORDERUNGEN:
• Stückzahl: 8 Stück
• GPU: Mindestens NVIDIA RTX 4080 (für 3D-Rendering erforderlich)
• RAM: Mindestens 32 GB (für große Dateien notwendig)
• Gesamtbudget: 17.000 € netto
• Qualität: 5 Sterne (Langzeitstabilität erforderlich)

Liebe Grüße
Kontaktperson`,
      },
      {
        category: 'Desktop-PCs',
        quantity: 6,
        budget: 12000,
        quality: 5,
        subject: '6 High-End Desktop-PCs für Videoproduktion',
        requirements: {
          quantity: { exact: 6 },
          maxBudget: 12000,
          quality: 5,
          specs: [
            { key: 'gpu', values: ['RTX 4080', 'RTX 4090'] },
            { key: 'ram', minValue: 32 },
          ],
          priority: ['Performance', 'Zuverlässigkeit'],
        },
        content: `Guten Tag,

wir sind ein Videoproduktions-Studio und brauchen neue Arbeitsplätze für unser Team mit Render-Farm-Fähigkeiten.

ANFORDERUNGEN:
• Stückzahl: 6 Stück
• GPU: RTX 4080 oder RTX 4090 (Video-Encoding und Rendering)
• RAM: Mindestens 32 GB
• Gesamtbudget: 12.000 € netto
• Qualität: 5 Sterne (Premium und zuverlässig)

Mit freundlichen Grüßen
Ihr Ansprechpartner`,
      },
      // Monitor-Anfragen
      {
        category: 'Monitore',
        quantity: 25,
        budget: 8750,
        quality: 3,
        subject: '25 Monitore für Klassenzimmer',
        requirements: {
          quantity: { exact: 25 },
          maxBudget: 8750,
          quality: 3,
          specs: [
            { key: 'diagonal', values: ['24"', '27"'] },
            { key: 'resolution', values: ['1920x1080'] },
          ],
          priority: ['Preis', 'Verfügbarkeit'],
        },
        content: `Guten Tag,

das Schulzentrum erneuert seine Computerräume und benötigt 25 Monitore für den Unterricht.

ANFORDERUNGEN:
• Stückzahl: 25 Stück
• Bildschirmgröße: 24 Zoll oder 27 Zoll
• Auflösung: 1920 × 1080 Pixel (Full HD)
• Gesamtbudget: 8.750 € netto
• Qualität: 3 Sterne (Schulische Nutzung)

Mit freundlichen Grüßen
Schulzentrum`,
      },
      {
        category: 'Monitore',
        quantity: 12,
        budget: 5500,
        quality: 4,
        subject: '12 Monitore für Büro-Arbeitsplätze',
        requirements: {
          quantity: { exact: 12 },
          maxBudget: 5500,
          quality: 4,
          specs: [
            { key: 'diagonal', values: ['27"'] },
            { key: 'resolution', values: ['2560x1440'] },
          ],
          priority: ['Bildqualität', 'Ergonomie'],
        },
        content: `Guten Tag,

wir erneuern die Arbeitsplätze in unserem Office und benötigen hochwertige Monitore mit guter Bildqualität.

ANFORDERUNGEN:
• Stückzahl: 12 Stück
• Bildschirmgröße: 27 Zoll
• Auflösung: 2560 × 1440 Pixel (QHD)
• Gesamtbudget: 5.500 € netto
• Qualität: 4 Sterne

Mit freundlichen Grüßen
HR-Abteilung`,
      },
      // Tablet-Anfragen
      {
        category: 'Tablets',
        quantity: 20,
        budget: 8000,
        quality: 4,
        subject: '20 Tablets für Unterricht',
        requirements: {
          quantity: { exact: 20 },
          maxBudget: 8000,
          quality: 4,
          specs: [
            { key: 'screen', values: ['10.1"'] },
            { key: 'storage', minValue: 128 },
          ],
          priority: ['Robustheit', 'Langlebigkeit'],
        },
        content: `Guten Tag,

wir suchen 20 Tablets für den Einsatz im Unterricht. Die Geräte sollten robust und zuverlässig sein.

ANFORDERUNGEN:
• Stückzahl: 20 Stück
• Display: 10,1 Zoll (tragbar für Schüler)
• Speicher: Mindestens 128 GB
• Gesamtbudget: 8.000 € netto
• Qualität: 4 Sterne

Mit freundlichen Grüßen
Schule`,
      },
      {
        category: 'Tablets',
        quantity: 15,
        budget: 10000,
        quality: 5,
        subject: '15 Premium-Tablets für Design-Team',
        requirements: {
          quantity: { exact: 15 },
          maxBudget: 10000,
          quality: 5,
          specs: [
            { key: 'screen', values: ['12.9"'] },
            { key: 'storage', minValue: 256 },
          ],
          priority: ['Bildqualität', 'Speicher'],
        },
        content: `Guten Tag,

wir suchen hochwertige Tablets für unser Design- und Kreativ-Team.

ANFORDERUNGEN:
• Stückzahl: 15 Stück
• Display: 12,9 Zoll (für Design-Arbeiten)
• Speicher: Mindestens 256 GB
• Gesamtbudget: 10.000 € netto
• Qualität: 5 Sterne (Premium-Geräte)

Mit freundlichen Grüßen
Creative Agency`,
      },
      // Kopfhörer-Anfragen
      {
        category: 'Kopfhörer',
        quantity: 30,
        budget: 4500,
        quality: 3,
        subject: '30 Kopfhörer für Sprachlabor',
        requirements: {
          quantity: { exact: 30 },
          maxBudget: 4500,
          quality: 3,
          specs: [
            { key: 'wireless', values: ['kabelgebunden'] },
            { key: 'frequency', values: ['20Hz-20kHz'] },
          ],
          priority: ['Haltbarkeit', 'Preis'],
        },
        content: `Guten Tag,

wir brauchen robuste Kopfhörer für unser Sprachlabor an der Schule.

ANFORDERUNGEN:
• Stückzahl: 30 Stück
• Bauart: Kabelgebunden (für Schulumgebung)
• Frequenzbereich: 20 Hz – 20 kHz
• Gesamtbudget: 4.500 € netto
• Qualität: 3 Sterne (Schulisches Niveau)

Mit freundlichen Grüßen
Sprachenzentrum`,
      },
      {
        category: 'Kopfhörer',
        quantity: 10,
        budget: 4000,
        quality: 5,
        subject: '10 Premium-Wireless-Kopfhörer für Team',
        requirements: {
          quantity: { exact: 10 },
          maxBudget: 4000,
          quality: 5,
          specs: [
            { key: 'wireless', values: ['ja'] },
          ],
          priority: ['Komfort', 'Wireless', 'Qualität'],
        },
        content: `Guten Tag,

wir suchen hochwertige kabellose Kopfhörer mit Gaming-Features für unser Team.

ANFORDERUNGEN:
• Stückzahl: 10 Stück
• Wireless: Ja (Bluetooth)
• Frequenzbereich: 20 Hz – 20 kHz
• Gesamtbudget: 4.000 € netto
• Qualität: 5 Sterne (Premium-Audio)

Mit freundlichen Grüßen
Audio-Studio`,
      },
    ];

    // Wähle 5 zufällige Templates
    const selectedTemplates = [];
    for (let i = 0; i < 5; i++) {
      const randomIdx = Math.floor(Math.random() * emailTemplates.length);
      selectedTemplates.push(emailTemplates[randomIdx]);
    }

    // Erstelle Emails aus Templates
    selectedTemplates.forEach((template, idx) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];

      const today = new Date();
      const randomDays = Math.floor(Math.random() * 7);
      const date = new Date(today.setDate(today.getDate() - randomDays));
      const dateStr = formatDate(date);

      newEmails.push({
        id: `gen-${idx + 1}`,
        from: firstName + ' ' + lastName,
        fromAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.split(' ')[0].toLowerCase()}.de`,
        subject: template.subject,
        content: template.content.replace('Kontaktperson', `${firstName} ${lastName}`).replace('Ihr Ansprechpartner', `${firstName} ${lastName}`),
        requirements: template.requirements,
        customerNumber: `${2400 + idx + 1}`,
        date: dateStr,
        read: false,
        category: template.category,
      });
    });

    setEmails(newEmails);
    // Generate new shipping costs for this batch of orders
    setWorkflow((prev) => ({
      ...prev,
      generatedShippingOptions: generateShippingCosts(),
    }));
  };

  // Generate random emails on component mount
  useEffect(() => {
    generateEmails();
  }, []);

  const selectEmailForOffer = (email: Email) => {
    setProductValidationError(null); // Reset any previous validation errors
    
    // Reset complete workflow to initial state - remove old order from cache
    setWorkflow({
      ...INITIAL_WORKFLOW_STATE,
      currentStep: 1,
      selectedEmail: email,
      offerNumber: email.customerNumber ? parseInt(email.customerNumber) : 18,
      invoiceNumber: email.customerNumber ? parseInt(email.customerNumber) : 18,
    });
    
    // Reset all input buffer states
    setDiscountPercentInput('');
    setDiscountAmountInput('');
    setShippingCostInput('');
    setTotalNettoInput('');
    setVatAmountInput('');
    setTotalBruttoInput('');
    setInvoiceSignatureDateInput('');
    setSkontoAmountInput('');
    setAmountAfterSkontoInput('');
    
    setActiveTab('warehouse');
  };

  const selectProduct = (product: Product) => {
    // Validiere das Produkt gegen die ausgewählte Email
    const selectedEmail = workflow.selectedEmail;
    if (!selectedEmail) {
      setProductValidationError({ productId: product.id });
      return;
    }

    const errors = getProductMatchErrors(product, selectedEmail);
    
    if (errors.length > 0) {
      // Produkt passt nicht - speichere die productId
      setProductValidationError({ productId: product.id });
      return;
    }
    
    // Produkt passt - weiterleiten
    setProductValidationError(null);
    setWorkflow((prev) => ({
      ...prev,
      selectedProduct: product,
      unitPrice: product.price,
      quantity: 0, // Schüler muss selbst eingeben
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      shippingCost: 0,
      totalNetto: 0,
      vatAmount: 0,
      totalBrutto: 0,
      currentStep: 2,
    }));
    // Reset input buffer states
    setDiscountPercentInput('');
    setDiscountAmountInput('');
    setShippingCostInput('');
    setTotalNettoInput('');
    setVatAmountInput('');
    setTotalBruttoInput('');
    setActiveTab('documents');
  };

  const acceptOrder = (confirmationDate: string) => {
    if (!confirmationDate) {
      alert('Bitte wählen Sie ein Auftragsbestätigungsdatum aus!');
      return;
    }
    setWorkflow((prev) => ({
      ...prev,
      currentStep: 4,
      orderAccepted: true,
      orderDate: confirmationDate,
    }));
    setActiveTab('shipping');
  };


  const verifyPayment = () => {
    setWorkflow((prev) => ({
      ...prev,
      paymentVerified: true,
      currentStep: 8,
      goodsShipped: true,
    }));
  };

  // Prüfe ob gewähltes Produkt wirklich passt und liefere Fehlergründe
  const getProductMatchErrors = (product: Product, email?: Email): string[] => {
    const errors: string[] = [];
    if (!email) return errors;
    
    const reqs = email.requirements;
    
    // Qualitätsprüfung
    if (reqs.quality && product.specs.quality && product.specs.quality < reqs.quality) {
      errors.push(`Qualität zu niedrig: Anforderung ${reqs.quality} Sterne, Produkt hat nur ${product.specs.quality} Sterne`);
    }

    // Spezifikationsprüfung
    for (const spec of reqs.specs || []) {
      if (spec.key === 'gpu' && spec.values) {
        if (!spec.values.some((v) => product.specs.gpu?.includes(v))) {
          errors.push(`GPU passt nicht: Anforderung ${spec.values.join(' oder ')}, Produkt hat ${product.specs.gpu || 'keine GPU'}`);
        }
      }
      if (spec.key === 'ram' && spec.minValue) {
        const ramMatch = product.specs.ram?.match(/(\d+)/);
        if (ramMatch && parseInt(ramMatch[1]) < spec.minValue) {
          errors.push(`RAM zu niedrig: Anforderung mindestens ${spec.minValue} GB, Produkt hat nur ${ramMatch[1]} GB`);
        }
      }
      if (spec.key === 'diagonal' && spec.values) {
        if (!spec.values.some((v) => product.specs.diagonal?.includes(v))) {
          errors.push(`Bildschirmgröße passt nicht: Anforderung ${spec.values.join(' oder ')}, Produkt hat ${product.specs.diagonal || 'unbekannt'}`);
        }
      }
      if (spec.key === 'screen' && spec.values) {
        if (!spec.values.some((v) => product.specs.screen?.includes(v))) {
          errors.push(`Display passt nicht: Anforderung ${spec.values.join(' oder ')}, Produkt hat ${product.specs.screen || 'unbekannt'}`);
        }
      }
      if (spec.key === 'storage' && spec.minValue) {
        const storageMatch = product.specs.storage?.match(/(\d+)/);
        if (storageMatch && parseInt(storageMatch[1]) < spec.minValue) {
          errors.push(`Speicher zu niedrig: Anforderung mindestens ${spec.minValue} GB, Produkt hat nur ${storageMatch[1]} GB`);
        }
      }
    }

    return errors;
  };

  // Prüfe ob gewähltes Produkt wirklich passt (boolean version für bestehende Nutzung)
  const isProductMatch = (product: Product, email?: Email): boolean => {
    return getProductMatchErrors(product, email).length === 0;
  };

  // Calculate automatic discount based on subtotal
  const calculateAutomaticDiscount = (subtotal: number): number => {
    for (let i = LIEFERBEDINGNISSE.rabattstaffeln.length - 1; i >= 0; i--) {
      if (subtotal >= LIEFERBEDINGNISSE.rabattstaffeln[i].ab) {
        return LIEFERBEDINGNISSE.rabattstaffeln[i].prozent;
      }
    }
    return 0;
  };

  // Round to 2 decimal places
  const round2 = (value: number): number => {
    return Math.round(value * 100) / 100;
  };

  const StepBadge = ({ step, title, completed }: { step: number; title: string; completed: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${workflow.currentStep === step ? 'border-orange-500 bg-orange-50' : completed ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${completed ? 'bg-green-500 text-white' : workflow.currentStep === step ? 'bg-orange-500 text-white' : 'bg-slate-300 text-slate-700'}`}>
        {completed ? '✓' : step + 1}
      </div>
      <span className="font-semibold text-slate-700">{title}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-slate-50">
      <header className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-4 text-md font-medium transition-colors">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-4xl font-bold mb-2">📦 Verkaufsprozess MM5 GmbH - Vollständiges ERP-System</h1>
          <p className="text-lg text-orange-100">Kundenanfrage → Angebot → Bestellung → Rechnung → Versand → Zahlung</p>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 flex gap-8">
        <div className="flex-1">
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border border-slate-200 overflow-x-auto">
            <button onClick={() => setActiveTab('email')} className={`py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'email' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              📧 Posteingang
            </button>
            <button onClick={() => setActiveTab('warehouse')} className={`py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'warehouse' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              📦 Lager
            </button>
            <button onClick={() => setActiveTab('documents')} className={`py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'documents' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              📄 Dokumente
            </button>
            <button onClick={() => setActiveTab('order')} className={`py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'order' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              📋 Auftrag
            </button>
            <button onClick={() => setActiveTab('shipping')} className={`py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'shipping' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              🚚 Versand
            </button>
            <button onClick={() => setActiveTab('invoice')} className={`py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'invoice' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              📄 Rechnung
            </button>
            <button onClick={() => setActiveTab('banking')} className={`py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'banking' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              💰 Banking
            </button>
          </div>

          {/* EMAIL TAB */}
          {activeTab === 'email' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">📧 Posteingang ({emails.length})</h2>
                <button
                  onClick={generateEmails}
                  className="py-2 px-5 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  ↻ Erneuern
                </button>
              </div>

              {emails.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-lg mb-4">Keine Anfragen im Posteingang</p>
                  <button
                    onClick={generateEmails}
                    className="py-3 px-6 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    ↻ Neue Anfragen laden
                  </button>
                </div>
              ) : (
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-4 bg-slate-100 border-b border-slate-300 p-4 font-semibold text-sm text-slate-700">
                    <div className="col-span-4">Von</div>
                    <div className="col-span-6">Betreff</div>
                    <div className="col-span-2 text-right">Datum</div>
                  </div>

                  {/* Email Rows */}
                  <div className="divide-y divide-slate-200">
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmailForReading(email)}
                        className="grid grid-cols-12 gap-4 p-4 hover:bg-blue-50 transition-colors text-sm cursor-pointer"
                      >
                        <div className="col-span-4">
                          <p className="font-semibold text-slate-800">{email.from}</p>
                          <p className="text-slate-500 text-xs">{email.fromAddress}</p>
                        </div>
                        <div className="col-span-6">
                          <p className="text-slate-800 line-clamp-1 font-medium">{email.subject}</p>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-slate-600">{email.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WAREHOUSE TAB */}
          {activeTab === 'warehouse' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">📦 Lager durchsuchen</h2>

              {workflow.selectedEmail ? (
                <>
                  <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 rounded overflow-hidden">
                    <button
                      onClick={() => setExpandedCustomerRequest(!expandedCustomerRequest)}
                      className="w-full p-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-semibold text-slate-800">Kundenanfrage: {workflow.selectedEmail.requirements.quantity?.exact} Stück <span className="text-blue-600 font-bold">– {workflow.selectedEmail.category}</span></p>
                      </div>
                      <span className={`text-2xl transition-transform ${expandedCustomerRequest ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {expandedCustomerRequest && (
                      <div className="p-4 border-t border-blue-200 bg-blue-50">
                        <p className="text-sm text-slate-700 mb-3"><strong>Produktkategorie:</strong> <span className="text-blue-600 font-semibold">{workflow.selectedEmail.category}</span></p>
                        <p className="text-sm text-slate-700 mb-3"><strong>Kundenname:</strong> {workflow.selectedEmail.from}</p>
                        <p className="text-sm text-slate-700 mb-3"><strong>Email:</strong> {workflow.selectedEmail.fromAddress}</p>
                        <p className="text-sm text-slate-700 mb-4"><strong>Datum:</strong> {workflow.selectedEmail.date}</p>
                        <p className="text-sm text-slate-600 mb-3">
                          Budget: € {workflow.selectedEmail.requirements.maxBudget?.toLocaleString('de-DE')} | Min. Qualität: {'⭐'.repeat(workflow.selectedEmail.requirements.quality || 3)}
                        </p>
                        <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                          <p className="text-xs font-semibold text-slate-600 mb-2">ORIGINALTEXT:</p>
                          <p className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">{workflow.selectedEmail.content}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded">
                    <p className="font-semibold text-amber-900">💡 Ihre Aufgabe: Wählen Sie SELBST den passenden Artikel!</p>
                    <p className="text-sm text-amber-800 mt-2">Die Kundenanfrage weist auf 2 wichtige Anforderungen hin. Lesen Sie die Email sorgfältig und wählen Sie einen geeigneten Artikel aus dem Lager.</p>
                  </div>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {['Alle', 'Desktop-PCs', 'Monitore', 'Tablets', 'Kopfhörer'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setWarehouseFilter(category)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          warehouseFilter === category
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6">
                    {(warehouseFilter === 'Alle' ? ['Desktop-PCs', 'Monitore', 'Tablets', 'Kopfhörer'] : [warehouseFilter]).map((category) => {
                      const categoryProducts = PRODUCTS.filter((p) => p.category === category && p.stock > 0);
                      if (categoryProducts.length === 0) return null;

                      return (
                        <div key={category}>
                          <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2">{category}</h3>
                          <div className="space-y-3">
                            {categoryProducts.map((product) => {
                              const isMatch = isProductMatch(product, workflow.selectedEmail);
                              return (
                                <div key={product.id}>
                                  <div
                                    onClick={() => selectProduct(product)}
                                    className={`border-2 rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg ${workflow.selectedProduct?.id === product.id ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-400 bg-white'}`}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-bold text-slate-900">{product.name}</p>
                                        <p className="text-xs text-slate-500">Art.-Nr. {product.artNumber}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-slate-900">€ {product.price.toFixed(2)}</p>
                                        <p className="text-sm font-semibold text-green-600">Lager: {product.stock} Stk.</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-1 text-xs text-slate-600 mb-2 bg-slate-50 p-3 rounded border border-slate-100">
                                      {product.specs.cpu && <div>🖥️ <strong>CPU:</strong> {product.specs.cpu}</div>}
                                      {product.specs.processor && <div>🖥️ <strong>Prozessor:</strong> {product.specs.processor}</div>}
                                      {product.specs.gpu && <div>🎮 <strong>GPU:</strong> {product.specs.gpu}</div>}
                                      {product.specs.ram && <div>💾 <strong>RAM:</strong> {product.specs.ram}</div>}
                                      {product.specs.storage && <div>💿 <strong>Speicher:</strong> {product.specs.storage}</div>}
                                      {product.specs.battery && <div>🔋 <strong>Akku:</strong> {product.specs.battery}</div>}
                                      {product.specs.diagonal && <div>📺 <strong>Größe:</strong> {product.specs.diagonal}</div>}
                                      {product.specs.screen && <div>📱 <strong>Display:</strong> {product.specs.screen}</div>}
                                      {product.specs.resolution && <div>📊 <strong>Auflösung:</strong> {product.specs.resolution}</div>}
                                      {product.specs.refreshRate && <div>⚡ <strong>Bildwiederholrate:</strong> {product.specs.refreshRate}</div>}
                                      {product.specs.panelType && <div>🎨 <strong>Panel-Typ:</strong> {product.specs.panelType}</div>}
                                      {product.specs.driverSize && <div>🔊 <strong>Treibergreße:</strong> {product.specs.driverSize}</div>}
                                      {product.specs.frequency && <div>📈 <strong>Frequenz:</strong> {product.specs.frequency}</div>}
                                      {product.specs.impedance && <div>Ω <strong>Impedanz:</strong> {product.specs.impedance}</div>}
                                      {product.specs.wireless !== undefined && <div>📡 <strong>Wireless:</strong> {product.specs.wireless ? 'Ja' : 'Nein'}</div>}
                                      {product.specs.color && <div>🎨 <strong>Farbe:</strong> {product.specs.color}</div>}
                                      {product.specs.warranty && <div>✓ <strong>Gewährleistung:</strong> {product.specs.warranty}</div>}
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-semibold text-orange-600">{'⭐'.repeat(product.specs.quality || 3)}</span>
                                      {workflow.selectedProduct?.id === product.id && <span className="text-xs font-bold text-green-600">✓ Ausgewählt</span>}
                                      {!isMatch && workflow.selectedProduct?.id === product.id && <span className="text-xs font-bold text-red-600">⚠️ Passt nicht perfekt!</span>}
                                    </div>
                                  </div>

                                  {/* PRODUCT VALIDATION ERROR - shown directly under the article */}
                                  {productValidationError?.productId === product.id && (
                                    <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3">
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-red-800">❌ Der gewählte Artikel passt nicht zur Anfrage</p>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setProductValidationError(null);
                                        }}
                                        className="text-red-600 hover:text-red-800 font-bold text-lg leading-none"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
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

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">📄 Angebot erstellen & berechnen</h2>

              {/* EXPANDABLE TERMS AND CONDITIONS */}
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 rounded overflow-hidden">
                <button
                  onClick={() => setExpandedTerms(!expandedTerms)}
                  className="w-full p-4 flex items-center justify-between hover:bg-yellow-100 transition-colors"
                >
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">📋 Liefer- und Zahlungsbedingungen</p>
                  </div>
                  <span className={`text-2xl transition-transform ${expandedTerms ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {expandedTerms && (
                  <div className="p-6 border-t border-yellow-200 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <h4 className="font-bold text-slate-800 mb-3">💰 Rabattstaffeln:</h4>
                        <p className="text-slate-700 mb-2">• <strong>5,00%</strong> ab € 10.000,00 Summe Einzelposten</p>
                        <p className="text-slate-700">• <strong>10,00%</strong> ab € 50.000,00 Summe Einzelposten</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-3">🚚 Versandkosten:</h4>
                        <p className="text-slate-700 mb-2">• Deutschland (D): € 20,00</p>
                        <p className="text-slate-700 mb-2">• EU: € 50,00</p>
                        <p className="text-slate-700 mb-2">• Versandkostenfrei ab: € 2.500,00</p>
                        <p className="text-slate-700">• Expresszuschlag: € 30,00</p>
                      </div>
                    </div>
                    <div className="border-t border-yellow-200 pt-4">
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <h4 className="font-bold text-slate-800 mb-3">💳 Zahlungsbedingungen:</h4>
                          <p className="text-slate-700 mb-2">• Zahlungsziel: <strong>30 Tage</strong></p>
                          <p className="text-slate-700">• Skonto: <strong>2,00%</strong> bei Zahlung innerhalb von <strong>7 Tagen</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {workflow.selectedProduct && workflow.selectedEmail ? (
                <div className="space-y-6">
                  {/* OFFER FORM - TABULAR LAYOUT */}
                  <div className="border-2 border-orange-300 rounded-lg p-8 bg-orange-50">
                    <h3 className="text-lg font-bold mb-6 text-slate-800">📋 Angebots-Kalkulationstabelle</h3>

                    {/* HEADER INFO */}
                    <div className="mb-8 grid grid-cols-4 gap-4 text-sm bg-white p-4 rounded border border-slate-200">
                      <div>
                        <p className="text-slate-600 font-semibold">Angebot-Nr.:</p>
                        <p className="text-lg font-bold text-slate-900">{workflow.offerNumber}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-semibold">Datum:</p>
                        <p className="text-lg font-bold text-slate-900">{workflow.offerDate}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-semibold">Kunde:</p>
                        <p className="text-sm font-bold text-slate-900">{workflow.selectedEmail.from}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-semibold">Kundennr.:</p>
                        <p className="text-lg font-bold text-slate-900">{workflow.selectedEmail.customerNumber}</p>
                      </div>
                    </div>

                    {/* CUSTOMER REQUIREMENT CHECK */}
                    <div className={`mb-6 p-4 border-l-4 rounded ${workflow.quantity === workflow.selectedEmail.requirements.quantity?.exact ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                      <p className="font-semibold">📌 Kundenanfrage:</p>
                      <p className="text-sm">Benötigte Menge: <strong>{workflow.selectedEmail.requirements.quantity?.exact} Stück</strong></p>
                      <p className="text-sm">Ihre Eingabe: <strong className={workflow.quantity === workflow.selectedEmail.requirements.quantity?.exact ? 'text-green-700' : 'text-red-700'}>{workflow.quantity} Stück</strong></p>
                      {workflow.quantity !== workflow.selectedEmail.requirements.quantity?.exact && (
                        <p className="text-xs text-red-600 mt-2">⚠️ Menge stimmt nicht überein - Kunde kann nicht annehmen!</p>
                      )}
                    </div>

                    {/* ARTICLE TABLE */}
                    <div className="mb-6 bg-white rounded border-2 border-slate-300 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-200 border-b-2 border-slate-800">
                            <th className="text-left font-bold py-3 px-4">Artikel</th>
                            <th className="text-center font-bold py-3 px-4">Artikelart</th>
                            <th className="text-center font-bold py-3 px-4 w-24">Menge</th>
                            <th className="text-center font-bold py-3 px-4 w-32">Preis</th>
                            <th className="text-right font-bold py-3 px-4 w-32">Summe</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-300 hover:bg-slate-50">
                            <td className="py-4 px-4 font-semibold text-slate-900">{workflow.selectedProduct.name}</td>
                            <td className="py-4 px-4 text-center text-slate-700">{workflow.selectedProduct.artNumber}</td>
                            <td className="py-4 px-4">
                              <input
                                type="number"
                                value={workflow.quantity}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 0;
                                  setWorkflow((prev) => ({
                                    ...prev,
                                    quantity: newQty,
                                  }));
                                }}
                                className="w-full border-2 border-blue-400 rounded px-2 py-2 text-center font-semibold focus:outline-none focus:border-blue-600"
                              />
                            </td>
                            <td className="py-4 px-4">
                              <input
                                type="number"
                                step="0.01"
                                value={workflow.unitPrice}
                                readOnly
                                className="w-full border-2 border-slate-400 bg-slate-100 rounded px-2 py-2 text-center font-semibold text-slate-900"
                              />
                            </td>
                            <td className="py-4 px-4">
                              <input
                                type="number"
                                step="0.01"
                                value={workflow.subtotal}
                                onChange={(e) => {
                                  const newSubtotal = parseFloat(e.target.value) || 0;
                                  setWorkflow((prev) => ({
                                    ...prev,
                                    subtotal: newSubtotal,
                                  }));
                                }}
                                className="w-full border-2 border-blue-400 rounded px-2 py-2 text-right font-semibold focus:outline-none focus:border-blue-600"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* CALCULATION TABLE */}
                    <div className="mb-6 bg-white rounded border-2 border-slate-300 overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b border-slate-300 hover:bg-slate-50">
                            <td className="text-right font-bold py-3 px-4 w-3/5">Summe der Einzelposten:</td>
                            <td className="py-3 px-4 w-2/5">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={workflow.subtotal.toString()}
                                  readOnly
                                  className="w-full border-2 border-slate-400 bg-slate-100 rounded px-3 py-2 pr-8 text-right font-bold text-slate-900"
                                />
                                <span className="absolute right-3 top-3 text-slate-700 font-semibold">€</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300 hover:bg-slate-50">
                            <td className="text-right font-bold py-3 px-4 w-3/5">Rabatt in %:</td>
                            <td className="py-3 px-4 w-2/5">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={discountPercentInput || workflow.discountPercent.toString()}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setDiscountPercentInput(value);
                                    const numValue = parseGermanInput(value);
                                    setWorkflow((prev) => ({ ...prev, discountPercent: Math.min(Math.max(numValue, 0), 100) }));
                                  }}
                                  onBlur={() => setDiscountPercentInput('')}
                                  className="w-full border-2 border-blue-400 rounded px-3 py-2 pr-8 text-right font-semibold focus:outline-none focus:border-blue-600"
                                  placeholder="z.B. 5,5 oder 5.5"
                                />
                                <span className="absolute right-3 top-3 text-slate-600 font-semibold">%</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300 hover:bg-slate-50">
                            <td className="text-right font-bold py-3 px-4">Rabatt in €:</td>
                            <td className="py-3 px-4">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={discountAmountInput || workflow.discountAmount.toString()}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setDiscountAmountInput(value);
                                    const discAmount = parseGermanInput(value);
                                    setWorkflow((prev) => ({
                                      ...prev,
                                      discountAmount: Math.max(discAmount, 0),
                                    }));
                                  }}
                                  onBlur={() => setDiscountAmountInput('')}
                                  className="w-full border-2 border-blue-400 rounded px-3 py-2 pr-8 text-right font-semibold focus:outline-none focus:border-blue-600"
                                  placeholder="z.B. 758,50 oder 758.50"
                                />
                                <span className="absolute right-3 top-3 text-slate-600 font-semibold">€</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300 hover:bg-slate-50">
                            <td className="text-right font-bold py-3 px-4">Versandkosten (inkl. Verpackung):</td>
                            <td className="py-3 px-4">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={shippingCostInput || workflow.shippingCost.toString()}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setShippingCostInput(value);
                                    const newShipping = parseGermanInput(value);
                                    setWorkflow((prev) => ({
                                      ...prev,
                                      shippingCost: Math.max(newShipping, 0),
                                    }));
                                  }}
                                  onBlur={() => setShippingCostInput('')}
                                  className="w-full border-2 border-blue-400 rounded px-3 py-2 pr-8 text-right font-semibold focus:outline-none focus:border-blue-600"
                                  placeholder="z.B. 20,50 oder 20.50"
                                />
                                <span className="absolute right-3 top-3 text-slate-600 font-semibold">€</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b-2 border-slate-800 bg-blue-50 hover:bg-blue-100">
                            <td className="text-right font-bold py-3 px-4 text-blue-900">Gesamtpreis netto:</td>
                            <td className="py-3 px-4">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={totalNettoInput || workflow.totalNetto.toString()}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setTotalNettoInput(value);
                                    const newNetto = parseGermanInput(value);
                                    setWorkflow((prev) => ({
                                      ...prev,
                                      totalNetto: Math.max(newNetto, 0),
                                    }));
                                  }}
                                  onBlur={() => setTotalNettoInput('')}
                                  className="w-full border-2 border-blue-500 bg-blue-100 rounded px-3 py-2 pr-8 text-right font-bold text-blue-900 focus:outline-none focus:border-blue-700"
                                  placeholder="z.B. 15164,00 oder 15164.00"
                                />
                                <span className="absolute right-3 top-3 text-blue-900 font-semibold">€</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300 hover:bg-slate-50">
                            <td className="text-right font-bold py-3 px-4">Umsatzsteuer (19%):</td>
                            <td className="py-3 px-4">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={vatAmountInput || workflow.vatAmount.toString()}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setVatAmountInput(value);
                                    const newVat = parseGermanInput(value);
                                    setWorkflow((prev) => ({
                                      ...prev,
                                      vatAmount: Math.max(newVat, 0),
                                    }));
                                  }}
                                  onBlur={() => setVatAmountInput('')}
                                  className="w-full border-2 border-blue-400 rounded px-3 py-2 pr-8 text-right font-semibold focus:outline-none focus:border-blue-600"
                                  placeholder="z.B. 2880,76 oder 2880.76"
                                />
                                <span className="absolute right-3 top-3 text-slate-600 font-semibold">€</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="bg-orange-50 hover:bg-orange-100">
                            <td className="text-right font-bold py-3 px-4 text-orange-900 text-lg">Rechnungsbetrag brutto:</td>
                            <td className="py-3 px-4">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={totalBruttoInput || workflow.totalBrutto.toString()}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setTotalBruttoInput(value);
                                    setWorkflow((prev) => ({
                                      ...prev,
                                      totalBrutto: Math.max(parseGermanInput(value), 0),
                                    }));
                                  }}
                                  onBlur={() => setTotalBruttoInput('')}
                                  className="w-full border-2 border-orange-500 bg-orange-100 rounded px-3 py-2 pr-8 text-right font-bold text-orange-900 text-lg focus:outline-none focus:border-orange-700"
                                  placeholder="z.B. 18044,76 oder 18044.76"
                                />
                                <span className="absolute right-3 top-3 text-orange-900 font-semibold">€</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* VALIDATION MESSAGES */}
                    <div className="space-y-3 mb-6">
                      {/* Quantity Check */}
                      {workflow.quantity !== workflow.selectedEmail.requirements.quantity?.exact && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-800">
                          <p className="font-semibold">❌ Menge passt nicht!</p>
                          <p>Kundenanfrage: {workflow.selectedEmail.requirements.quantity?.exact} Stück | Ihre Eingabe: {workflow.quantity} Stück</p>
                        </div>
                      )}

                      {/* Discount Check */}
                      {(() => {
                        const automaticDiscount = calculateAutomaticDiscount(workflow.subtotal);
                        if (workflow.subtotal > 0 && workflow.discountPercent > automaticDiscount) {
                          return (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-800">
                              <p className="font-semibold">❌ Rabatt nicht erlaubt!</p>
                              <p>Basierend auf Ihrer Summe von € {workflow.subtotal.toFixed(2)} ist ein Rabatt von maximal <strong>{automaticDiscount}%</strong> erlaubt. Sie haben jedoch <strong>{workflow.discountPercent}%</strong> eingegeben!</p>
                            </div>
                          );
                        }
                        if (workflow.subtotal > 0 && workflow.discountPercent < automaticDiscount) {
                          return (
                            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-sm text-amber-800">
                              <p className="font-semibold">⚠️ Rabatt zu niedrig!</p>
                              <p>Basierend auf Ihrer Summe von € {workflow.subtotal.toFixed(2)} ist ein Rabatt von mindestens <strong>{automaticDiscount}%</strong> gültig.</p>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Calculation Check */}
                      {(() => {
                        const expectedSubtotal = round2(workflow.quantity * workflow.unitPrice);
                        const expectedNetto = round2(expectedSubtotal - workflow.discountAmount + workflow.shippingCost);
                        const expectedVat = round2((expectedNetto * LIEFERBEDINGNISSE.vatRate) / 100);
                        const expectedBrutto = round2(expectedNetto + expectedVat);
                        
                        const subOk = Math.abs(workflow.subtotal - expectedSubtotal) < 0.01;
                        const nettoOk = Math.abs(workflow.totalNetto - expectedNetto) < 0.01;
                        const vatOk = Math.abs(workflow.vatAmount - expectedVat) < 0.01;
                        const bruttoOk = Math.abs(workflow.totalBrutto - expectedBrutto) < 0.01;

                        if (!subOk || !nettoOk || !vatOk || !bruttoOk) {
                          return (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-800">
                              <p className="font-semibold">❌ Berechnungsfehler!</p>
                              {!subOk && <p>❌ Summe-Berechnung ist falsch!</p>}
                              {!nettoOk && <p>❌ Netto-Berechnung ist falsch!</p>}
                              {!vatOk && <p>❌ MwSt.-Berechnung ist falsch!</p>}
                              {!bruttoOk && <p>❌ Brutto-Berechnung ist falsch!</p>}
                            </div>
                          );
                        }
                        return (
                          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-800">
                            <p className="font-semibold">✓ Alle Berechnungen korrekt!</p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* HINT */}
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-slate-700">
                      <p className="font-semibold mb-2">💡 Deine Aufgabe:</p>
                      <p>1. Ergänze die Menge und den Preis pro Stück</p>
                      <p>2. Berechne alle Werte (Summe, Rabatt, Netto, MwSt., Brutto)</p>
                      <p>3. Trage alle berechneten Werte in die Tabelle ein</p>
                      <p>4. Nur wenn alles korrekt ist, kannst du den "Auftrag annehmen" Button nutzen</p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-4">
                      {(() => {
                        const expectedSubtotal = round2(workflow.quantity * workflow.unitPrice);
                        const expectedNetto = round2(expectedSubtotal - workflow.discountAmount + workflow.shippingCost);
                        const expectedVat = round2((expectedNetto * LIEFERBEDINGNISSE.vatRate) / 100);
                        const expectedBrutto = round2(expectedNetto + expectedVat);
                        
                        const automaticDiscount = calculateAutomaticDiscount(workflow.subtotal);
                        const discountOk = workflow.discountPercent <= automaticDiscount;
                        
                        const allCorrect =
                          workflow.quantity === workflow.selectedEmail.requirements.quantity?.exact &&
                          Math.abs(workflow.subtotal - expectedSubtotal) < 0.01 &&
                          Math.abs(workflow.totalNetto - expectedNetto) < 0.01 &&
                          Math.abs(workflow.vatAmount - expectedVat) < 0.01 &&
                          Math.abs(workflow.totalBrutto - expectedBrutto) < 0.01 &&
                          discountOk;

                        return (
                          <>
                            <button
                              onClick={() => {
                                setWorkflow((prev) => ({
                                  ...prev,
                                  offerFinalized: true,
                                  currentStep: 3,
                                }));
                                setActiveTab('order');
                              }}
                              disabled={!allCorrect}
                              className={`flex-1 py-3 px-6 font-bold rounded-lg transition-colors ${
                                allCorrect
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              ✓ Angebot fertigstellen & absenden
                            </button>
                            <button
                              onClick={() => setWorkflow((prev) => ({ ...prev, selectedProduct: undefined, currentStep: 1 }))}
                              className="flex-1 py-3 px-6 bg-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-400 transition-colors"
                            >
                              ← Zurück zum Lager
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* CUSTOMER RESPONSE */}
                  {workflow.offerFinalized && !workflow.orderAccepted && (
                    <div className="border-2 border-green-300 rounded-lg p-8 bg-green-50 mb-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">💌 Rückmeldung vom Kunden</h3>
                      <p className="text-slate-700 text-lg">Der Kunde ist glücklich über Ihre schnelle und korrekte Bearbeitung der Anfragen und möchte das Angebot annehmen.</p>
                    </div>
                  )}

                  {/* NAVIGATION TO ORDER TAB */}
                  {workflow.currentStep >= 3 && !workflow.orderAccepted && workflow.offerFinalized && (
                    <div className="border-2 border-amber-300 rounded-lg p-8 bg-amber-50">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">📋 Nächster Schritt: Auftrag</h3>
                      <p className="text-slate-700 mb-6">Der Kunde möchte diese Bestellung bestätigen. Bitte wechseln Sie zum Tab "Auftrag" und füllen Sie die Auftragsbestätigung aus.</p>
                      <button
                        onClick={() => setActiveTab('order')}
                        className="w-full py-3 px-6 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        → Zum Auftrag-Tab wechseln
                      </button>
                    </div>
                  )}

                  {/* ORDER CONFIRMATION SUCCESS */}
                  {workflow.orderAccepted && workflow.currentStep >= 4 && (
                    <div className="border-2 border-green-300 rounded-lg p-8 bg-green-50">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">✓ Auftragsbestätigung versendet</h3>
                      <div className="text-sm space-y-2 mb-4">
                        <p><strong>Auftragsnummer:</strong> {workflow.offerNumber}</p>
                        <p><strong>Auftragsbestätigung-Datum:</strong> {workflow.orderDate}</p>
                        <p><strong>Kunde:</strong> {workflow.selectedEmail.from} (#{workflow.selectedEmail.customerNumber})</p>
                        <p><strong>Artikel:</strong> {workflow.selectedProduct.name}</p>
                        <p><strong>Menge:</strong> {workflow.quantity} Stück</p>
                        <p><strong>Gesamtpreis brutto:</strong> € {workflow.totalBrutto.toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-slate-600">Die Auftragsbestätigung wurde dem Kunden per Email gesendet.</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">Wählen Sie eine Email und ein Produkt aus.</p>
              )}
            </div>
          )}

          {/* ORDER TAB */}
          {activeTab === 'order' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">📋 Auftragsbestätigung</h2>

              {workflow.selectedProduct && workflow.selectedEmail && workflow.offerFinalized && !workflow.orderAccepted ? (
                <div className="space-y-6">
                  {/* CUSTOMER RESPONSE */}
                  <div className="border-2 border-green-300 rounded-lg p-8 bg-green-50">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">💌 Rückmeldung vom Kunden</h3>
                    <p className="text-slate-700 text-lg">Der Kunde ist glücklich über Ihre schnelle und korrekte Bearbeitung und möchte das Angebot annehmen!</p>
                  </div>

                  {/* ORDER CONFIRMATION FORM */}
                  <div className="border-2 border-blue-400 rounded-lg p-8 bg-blue-50">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">✏️ Auftragsbestätigung ausfüllen</h3>
                    
                    {/* Auftrag Header */}
                    <div className="bg-white border border-slate-300 rounded-lg p-6 mb-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-sm text-slate-600 font-semibold mb-2">Auftragsbestätigung</p>
                          <p className="text-2xl font-bold text-slate-800 mb-4">Nr. {workflow.offerNumber}</p>
                          
                          <label className="block text-sm font-semibold text-slate-700 mb-2">📅 Auftragsbestätigungsdatum:</label>
                          <input
                            type="date"
                            value={workflow.orderConfirmationDate}
                            onChange={(e) => setWorkflow((prev) => ({ ...prev, orderConfirmationDate: e.target.value }))}
                            className="w-full border-2 border-blue-400 rounded px-4 py-2 text-slate-800 font-semibold focus:outline-none focus:border-blue-600 mb-4"
                          />
                          {workflow.orderConfirmationDate && (
                            <p className="text-sm text-blue-600 font-semibold">Ausgewähltes Datum: {formatDate(new Date(workflow.orderConfirmationDate + 'T00:00:00'))}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 font-semibold mb-2">Kundendaten</p>
                          <p className="text-slate-800 mb-2"><strong>{workflow.selectedEmail.from}</strong></p>
                          <p className="text-slate-600 text-sm mb-2">{workflow.selectedEmail.fromAddress}</p>
                          <p className="text-slate-600 text-sm">Kundennummer: {workflow.selectedEmail.customerNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details Table */}
                    <div className="bg-white border border-slate-300 rounded-lg overflow-hidden mb-6">
                      <div className="grid grid-cols-5 gap-4 bg-slate-100 border-b border-slate-300 p-4 font-semibold text-sm text-slate-700">
                        <div className="col-span-1">Art.-Nr.</div>
                        <div className="col-span-2">Artikel</div>
                        <div className="col-span-1 text-right">Menge</div>
                        <div className="col-span-1 text-right">Gesamtbetrag</div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-5 gap-4 items-center">
                          <div className="text-sm text-slate-700">{workflow.selectedProduct.artNumber}</div>
                          <div className="col-span-2 text-sm text-slate-700">{workflow.selectedProduct.name}</div>
                          <div className="text-sm text-slate-700 text-right">{workflow.quantity} Stück</div>
                          <div className="text-sm font-bold text-slate-800 text-right">{formatCurrency(workflow.subtotal)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-white border border-slate-300 rounded-lg p-6 mb-6">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-700">Summe der Einzelposten:</span>
                          <span className="font-bold text-slate-800">{formatCurrency(workflow.subtotal)}</span>
                        </div>
                        {workflow.discountAmount > 0 && (
                          <div className="flex justify-between text-amber-700">
                            <span>Rabatt ({workflow.discountPercent.toFixed(1)}%):</span>
                            <span className="font-bold">- {formatCurrency(workflow.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-700">Versandkosten:</span>
                          <span className="font-bold text-slate-800">{formatCurrency(workflow.shippingCost)}</span>
                        </div>
                        <div className="border-t border-slate-300 pt-3 flex justify-between">
                          <span className="text-slate-700 font-semibold">Gesamtpreis netto:</span>
                          <span className="font-bold text-blue-800">{formatCurrency(workflow.totalNetto)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-700">Umsatzsteuer (19%):</span>
                          <span className="font-bold text-slate-800">{formatCurrency(workflow.vatAmount)}</span>
                        </div>
                        <div className="border-t border-slate-300 pt-3 flex justify-between text-lg">
                          <span className="text-slate-800 font-bold">Rechnungsbetrag brutto:</span>
                          <span className="font-bold text-orange-800 text-xl">{formatCurrency(workflow.totalBrutto)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => acceptOrder(workflow.orderConfirmationDate)}
                      disabled={!workflow.orderConfirmationDate}
                      className={`w-full py-4 px-6 font-bold text-lg rounded-lg transition-colors ${
                        workflow.orderConfirmationDate
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      ✓ Auftragsbestätigung absenden
                    </button>
                    {!workflow.orderConfirmationDate && (
                      <p className="text-sm text-red-600 text-center mt-2">⚠️ Bitte wählen Sie ein Auftragsbestätigungsdatum aus!</p>
                    )}
                  </div>
                </div>
              ) : workflow.orderAccepted ? (
                <div className="border-2 border-green-300 rounded-lg p-8 bg-green-50">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">✓ Auftragsbestätigung versendet</h3>
                  <div className="text-sm space-y-2 mb-4">
                    <p><strong>Auftragsnummer:</strong> {workflow.offerNumber}</p>
                    <p><strong>Auftragsbestätigungsdatum:</strong> {workflow.orderDate}</p>
                    {workflow.selectedEmail && <p><strong>Kunde:</strong> {workflow.selectedEmail.from} (#{workflow.selectedEmail.customerNumber})</p>}
                    {workflow.selectedProduct && <p><strong>Artikel:</strong> {workflow.selectedProduct.name}</p>}
                    <p><strong>Menge:</strong> {workflow.quantity} Stück</p>
                    <p><strong>Gesamtpreis brutto:</strong> {formatCurrency(workflow.totalBrutto)}</p>
                  </div>
                  <p className="text-xs text-slate-600 mb-6">Die Auftragsbestätigung wurde dem Kunden per Email gesendet.</p>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className="w-full py-3 px-6 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    → Weiter zum Versand
                  </button>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">Wählen Sie zunächst eine Email und ein Produkt aus und erstellen Sie ein Angebot.</p>
              )}
            </div>
          )}

          {/* SHIPPING TAB */}
          {activeTab === 'shipping' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">🚚 Versandauftrag & Versandunternehmen</h2>

              {workflow.selectedProduct && workflow.selectedEmail ? (
                <div className="space-y-6">
                  {/* SHIPPING ORDER */}
                  {!workflow.shippingOrderConfirmed && (
                  <div className="border-2 border-slate-300 rounded-lg p-8 bg-slate-50">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">📦 Versandauftrag für Lager</h3>
                    <div className="bg-white p-4 rounded border border-slate-200 text-sm space-y-2 mb-6">
                      <p><strong>Versandauftrag-Nummer:</strong> VA-{workflow.offerNumber}</p>
                      <p><strong>Datum:</strong> {formatDate(new Date())}</p>
                      <p><strong>Artikel:</strong> {workflow.selectedProduct.name}</p>
                      <p><strong>Art.-Nr.:</strong> {workflow.selectedProduct.artNumber}</p>
                      <p><strong>Menge:</strong> {workflow.quantity} Stück</p>
                      <p><strong>Gesamtgewicht:</strong> <strong className="text-blue-600">{(workflow.quantity * workflow.selectedProduct.weight).toFixed(2)} kg</strong></p>
                      <p><strong>Versandadresse:</strong> {workflow.selectedEmail.from}, {workflow.selectedEmail.fromAddress}</p>
                      <p className="text-xs text-slate-600 mt-3 italic">Diesen Versandauftrag erhalten die Mitarbeiter des Lagers, damit sie die Ware zusammenpacken.</p>
                    </div>

                    <div className="flex gap-3 mb-6">
                      <button className="flex-1 py-2 px-4 bg-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-400 transition-colors text-sm">
                        🖨️ Drucken
                      </button>
                      <button
                        onClick={() => setWorkflow((prev) => ({ ...prev, shippingOrderConfirmed: true }))}
                        className="flex-1 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        ✓ Versandauftrag korrekt - Lager benachrichtigen
                      </button>
                    </div>
                  </div>
                  )}

                  {/* SHIPPING CALCULATOR */}
                  {workflow.shippingOrderConfirmed && (
                  <div className="border-2 border-orange-300 rounded-lg p-8 bg-orange-50">
                    <h3 className="text-lg font-bold mb-6 text-slate-800">🚚 Versandkosten berechnen & Unternehmen auswählen</h3>

                    <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="font-semibold text-slate-800 mb-2">💡 Deine Aufgabe:</p>
                      <p className="text-sm text-slate-700">1. Berechne die Versandkosten für jedes Unternehmen: <strong>Fixbetrag + (Gewicht × €/kg)</strong></p>
                      <p className="text-sm text-slate-700">2. Trage deine berechneten Kosten in die Eingabefelder ein</p>
                      <p className="text-sm text-slate-700">3. Wähle das günstigste Unternehmen</p>
                      <p className="text-sm text-slate-700">4. Das System prüft deine Berechnung!</p>
                    </div>

                    {shippingValidationError && (
                      <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                        <p className="font-semibold text-red-800">{shippingValidationError}</p>
                      </div>
                    )}

                    <div className="mb-8 p-4 bg-amber-50 border border-amber-300 rounded text-sm">
                      <p className="font-semibold text-amber-900 mb-2">📊 Bestellungsgewicht:</p>
                      <p className="text-amber-900">
                        <strong>{workflow.quantity}</strong> Stück × <strong>{workflow.selectedProduct.weight}</strong> kg = <strong className="text-lg text-orange-600">{(workflow.quantity * workflow.selectedProduct.weight).toFixed(2)} kg</strong>
                      </p>
                    </div>

                    {!workflow.shippingValidated ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          {(workflow.generatedShippingOptions || SHIPPING_OPTIONS).map((option) => {
                            const totalWeight = workflow.quantity * (workflow.selectedProduct?.weight || 0);
                            const correctCost = option.fixCost + (totalWeight * option.costPerKg);
                            const userInput = workflow.shippingCostInput[option.id] || 0;
                            const isCorrect = Math.abs(userInput - correctCost) < 0.01;

                            return (
                              <div key={option.id} className="border-2 border-slate-300 rounded-lg p-5 bg-white hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <p className="font-bold text-slate-900 text-lg">{option.name}</p>
                                    <p className="text-sm text-slate-600">Lieferdauer: {option.deliveryDays} Tage</p>
                                  </div>
                                </div>

                                <div className="bg-slate-50 p-3 rounded mb-4 text-sm text-slate-700 border border-slate-200">
                                  <p className="mb-2"><strong>Fixbetrag:</strong> {option.fixCost.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
                                  <p><strong>Kosten pro Kilogramm:</strong> {option.costPerKg.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
                                </div>

                                <div className="flex gap-3 items-end">
                                  <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Deine Berechnung (€):</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={userInput || ''}
                                      onChange={(e) => {
                                        const newValue = parseFloat(e.target.value) || 0;
                                        setWorkflow((prev) => ({
                                          ...prev,
                                          shippingCostInput: { ...prev.shippingCostInput, [option.id]: newValue },
                                        }));
                                      }}
                                      placeholder="z.B. 12,50"
                                      className="w-full border-2 border-blue-400 rounded px-3 py-2 text-right font-semibold focus:outline-none focus:border-blue-600"
                                    />
                                  </div>
                                  <div className={`text-center px-3 py-2 rounded font-semibold text-sm ${isCorrect ? 'bg-green-200 text-green-800' : userInput > 0 ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {isCorrect ? '✓ Korrekt!' : userInput > 0 ? '✗ Falsch' : '-'}
                                  </div>
                                </div>

                                {isCorrect && (
                                  <button
                                    onClick={() => {
                                      const totalWeight = workflow.quantity * (workflow.selectedProduct?.weight || 0);
                                      const cheapest = getCheapestShippingOption(totalWeight, workflow.generatedShippingOptions);
                                      
                                      if (!cheapest || cheapest.id !== option.id) {
                                        setShippingValidationError(`❌ Das ist nicht das günstigste Unternehmen! Wähle: ${cheapest?.name} (€ ${(cheapest?.fixCost! + (totalWeight * cheapest?.costPerKg!)).toFixed(2)})`);
                                        return;
                                      }
                                      
                                      setShippingValidationError('');
                                      setWorkflow((prev) => ({
                                        ...prev,
                                        selectedShipping: option,
                                        shippingCost: correctCost,
                                        shippingValidated: true,
                                        currentStep: 5,
                                      }));
                                    }}
                                    className="w-full mt-3 py-2 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                                  >
                                    ✓ Dieses Unternehmen wählen
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-sm text-slate-700">
                          <p className="font-semibold mb-2">⚠️ Hinweis:</p>
                          <p>Berechne alle Kosten korrekt und wähle dann das günstigste Unternehmen aus. Du kannst nur weitergehen, wenn deine Berechnung richtig ist!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
                        <p className="text-2xl font-bold text-green-700 mb-3">✓ Versandunternehmen gewählt!</p>
                        <p className="text-lg text-slate-700 mb-4">{workflow.selectedShipping?.name}</p>
                        <p className="text-slate-600 mb-6">Versandkosten: <strong className="text-xl text-green-600">€ {workflow.shippingCost.toFixed(2)}</strong></p>
                        <p className="text-sm text-slate-600 mb-6">Lieferdauer: {workflow.selectedShipping?.deliveryDays} Tage</p>
                        <button
                          onClick={() => setActiveTab('invoice')}
                          className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          → Rechnung erstellen
                        </button>
                      </div>
                    )}
                  </div>
                  )}

                  {!workflow.shippingValidated && (
                    <button onClick={() => setActiveTab('documents')} className="w-full py-3 px-6 bg-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-400 transition-colors">
                      ← Zurück zu Dokumenten
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">Wählen Sie zuerst eine Email und ein Produkt aus.</p>
              )}
            </div>
          )}

          {/* INVOICE TAB */}
          {activeTab === 'invoice' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">📄 Rechnung erstellen</h2>

              {workflow.selectedProduct && workflow.selectedEmail && workflow.shippingValidated ? (
                <div className="space-y-6">
                  {/* INVOICE PREVIEW */}
                  <div className="border-2 border-slate-300 rounded-lg p-8 bg-slate-50">
                    <h3 className="text-lg font-bold mb-6 text-slate-800">📋 Rechnung für Kunden</h3>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                      {/* LEFT SIDE - SENDER */}
                      <div className="text-sm text-slate-700">
                        <p className="font-bold text-slate-900 mb-2">DeltaBase Online GmbH</p>
                        <p className="text-xs">Meindlstr. 8a</p>
                        <p className="text-xs">81373 München</p>
                      </div>

                      {/* RIGHT SIDE - INVOICE INFO */}
                      <div className="text-sm text-slate-700 text-right">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="text-left"><strong>Auftrags-Nr.:</strong></div>
                          <div className="text-right">{workflow.offerNumber}</div>
                          <div className="text-left"><strong>Rechnungs-Nr.:</strong></div>
                          <div className="text-right">{workflow.invoiceNumber}</div>
                          <div className="text-left"><strong>Kunden-Nr.:</strong></div>
                          <div className="text-right">{workflow.selectedEmail.customerNumber}</div>
                          <div className="text-left"><strong>Ihr Zeichen:</strong></div>
                          <div className="text-right">
                            <input
                              type="date"
                              value={invoiceSignatureDateInput}
                              onChange={(e) => setInvoiceSignatureDateInput(e.target.value)}
                              className="border-2 border-red-400 rounded px-2 py-1 text-right font-semibold text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-b-2 border-slate-300 mb-6"></div>

                    {/* CUSTOMER INFO */}
                    <div className="mb-6">
                      <p className="font-bold text-slate-900 mb-2">{workflow.selectedEmail.from}</p>
                      <p className="text-sm text-slate-700">{workflow.selectedEmail.fromAddress}</p>
                    </div>

                    {/* INVOICE TITLE */}
                    <h4 className="text-xl font-bold text-slate-900 mb-6">Rechnung Nr. {workflow.invoiceNumber}</h4>

                    {/* INVOICE TABLE */}
                    <div className="mb-6">
                      <table className="w-full text-sm mb-4">
                        <thead>
                          <tr className="border-b-2 border-slate-400">
                            <th className="text-left py-2 px-2">Artikel</th>
                            <th className="text-center py-2 px-2">Art.-Nr.</th>
                            <th className="text-center py-2 px-2">Menge</th>
                            <th className="text-right py-2 px-2">Preis</th>
                            <th className="text-right py-2 px-2">Summe</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-200">
                            <td className="py-2 px-2">{workflow.selectedProduct.name}</td>
                            <td className="text-center py-2 px-2 text-xs">{workflow.selectedProduct.artNumber}</td>
                            <td className="text-center py-2 px-2">{workflow.quantity}</td>
                            <td className="text-right py-2 px-2">€ {workflow.unitPrice.toFixed(2)}</td>
                            <td className="text-right py-2 px-2 font-semibold">€ {workflow.subtotal.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* CALCULATIONS */}
                    <div className="space-y-2 text-sm mb-8">
                      <div className="flex justify-between">
                        <span>Summe der Einzelposten:</span>
                        <span className="font-semibold">€ {workflow.subtotal.toFixed(2)}</span>
                      </div>
                      {workflow.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Rabatt ({workflow.discountPercent}%):</span>
                          <span className="font-semibold">-€ {workflow.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Versandkosten (inkl. Verpackung):</span>
                        <span className="font-semibold">€ {workflow.shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-300 pt-2 flex justify-between font-bold">
                        <span>Gesamtpreis netto:</span>
                        <span>€ {workflow.totalNetto.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{LIEFERBEDINGNISSE.vatRate}% Umsatzsteuer:</span>
                        <span className="font-semibold">€ {workflow.vatAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t-2 border-slate-400 pt-2 flex justify-between font-bold text-lg bg-orange-50 p-3 rounded">
                        <span>Rechnungsbetrag brutto:</span>
                        <span className="text-orange-600">€ {workflow.totalBrutto.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* SKONTO SECTION */}
                    <div className="bg-blue-50 border-2 border-blue-300 rounded p-4 mb-8">
                      <p className="font-bold text-slate-900 mb-4">💙 Skonto-Bedingungen</p>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Skonto: {LIEFERBEDINGNISSE.skonto}% bei Zahlung innerhalb von {LIEFERBEDINGNISSE.skontoTage} Tagen</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Skontobetrag (€):</span>
                          <input
                            type="number"
                            step="0.01"
                            value={skontoAmountInput}
                            onChange={(e) => setSkontoAmountInput(e.target.value)}
                            placeholder="z.B. 119,88"
                            className="border-2 border-red-400 rounded px-3 py-2 font-semibold text-right w-32"
                          />
                        </div>
                        <div className="flex justify-between items-center font-bold">
                          <span>Überweisungsbetrag unter Abzug von Skonto (€):</span>
                          <input
                            type="number"
                            step="0.01"
                            value={amountAfterSkontoInput}
                            onChange={(e) => setAmountAfterSkontoInput(e.target.value)}
                            placeholder="z.B. 5.948,82"
                            className="border-2 border-red-400 rounded px-3 py-2 font-semibold text-right w-32"
                          />
                        </div>
                      </div>
                    </div>

                    {/* VALIDATION CHECKS */}
                    {(() => {
                      const expectedSkonto = round2(workflow.totalNetto * (LIEFERBEDINGNISSE.skonto / 100));
                      const expectedAmountAfterSkonto = round2(workflow.totalNetto - expectedSkonto);
                      const userSkonto = parseGermanInput(skontoAmountInput);
                      const userAmountAfterSkonto = parseGermanInput(amountAfterSkontoInput);
                      const userDate = invoiceSignatureDateInput;

                      const skontoOk = Math.abs(userSkonto - expectedSkonto) < 0.01;
                      const amountOk = Math.abs(userAmountAfterSkonto - expectedAmountAfterSkonto) < 0.01;
                      const dateOk = userDate.length > 0;

                      if (!skontoOk || !amountOk || !dateOk) {
                        return (
                          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-800 mb-6">
                            <p className="font-semibold">❌ Berechnungsfehler!</p>
                            {!dateOk && <p>❌ "Ihr Zeichen" (Datum) ist erforderlich!</p>}
                            {!skontoOk && <p>❌ Skontobetrag ist falsch! Erwartet: € {expectedSkonto.toFixed(2)}</p>}
                            {!amountOk && <p>❌ Überweisungsbetrag ist falsch! Erwartet: € {expectedAmountAfterSkonto.toFixed(2)}</p>}
                          </div>
                        );
                      }

                      return (
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-800 mb-6">
                          <p className="font-semibold">✓ Alle Rechnungsangaben korrekt!</p>
                        </div>
                      );
                    })()}

                    {/* ACTION BUTTONS */}
                    {(() => {
                      const expectedSkonto = round2(workflow.totalNetto * (LIEFERBEDINGNISSE.skonto / 100));
                      const expectedAmountAfterSkonto = round2(workflow.totalNetto - expectedSkonto);
                      const userSkonto = parseGermanInput(skontoAmountInput);
                      const userAmountAfterSkonto = parseGermanInput(amountAfterSkontoInput);
                      const userDate = invoiceSignatureDateInput;

                      const allCorrect = Math.abs(userSkonto - expectedSkonto) < 0.01 &&
                        Math.abs(userAmountAfterSkonto - expectedAmountAfterSkonto) < 0.01 &&
                        userDate.length > 0;

                      return (
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              const reference = `RG${workflow.invoiceNumber.toString().padStart(6, '0')}`;
                              setWorkflow((prev) => ({
                                ...prev,
                                invoiceSignatureDate: invoiceSignatureDateInput,
                                skontoAmount: userSkonto,
                                amountAfterSkonto: userAmountAfterSkonto,
                                invoiceValidated: true,
                                paymentReference: reference,
                                currentStep: 6,
                              }));
                              setActiveTab('banking');
                            }}
                            disabled={!allCorrect}
                            className={`flex-1 py-3 px-6 font-bold rounded-lg transition-colors ${
                              allCorrect
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            ✓ Rechnung korrekt - Weiter zum Banking
                          </button>
                          <button
                            onClick={() => setActiveTab('shipping')}
                            className="flex-1 py-3 px-6 bg-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-400 transition-colors"
                          >
                            ← Zurück zum Versand
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* SIGNATURE */}
                  <div className="mb-6 p-6 bg-white border-t-4 border-slate-300 text-sm text-slate-700">
                    <p className="mb-6">Freundlichen Grüßen</p>
                    <div className="flex justify-between gap-12">
                      <div>
                        <div className="border-t border-slate-400 pt-2 text-center" style={{width: '150px'}}>
                          <p className="text-xs font-semibold">DeltaBase Online GmbH</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HINT */}
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-slate-700">
                    <p className="font-semibold mb-2">💡 Deine Aufgabe:</p>
                    <p>1. Gib ein Datum bei "Ihr Zeichen" ein (z.B. heute Datum)</p>
                    <p>2. Berechne den Skontobetrag: Netto-Betrag × 2%</p>
                    <p>3. Berechne den Überweisungsbetrag: Netto-Betrag - Skontobetrag</p>
                    <p>4. Trage beide Werte in die entsprechenden Felder ein</p>
                    <p>5. Wenn alles korrekt ist, kannst du weitermachen</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">Bitte wählen Sie zuerst eine Email und ein Produkt aus und wählen Sie ein Versandunternehmen.</p>
              )}
            </div>
          )}

          {/* BANKING TAB */}
          {activeTab === 'banking' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">💰 Online-Banking & Zahlungsverifizierung</h2>

              {workflow.selectedProduct && workflow.selectedEmail ? (
                <div className="space-y-6">
                  {/* PAYMENT REFERENCE */}
                  <div className="border-2 border-blue-300 rounded-lg p-8 bg-blue-50">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">📌 Zahlungsreferenz</h3>
                    <div className="bg-white p-4 rounded border-2 border-blue-500 text-center mb-6">
                      <p className="text-sm text-slate-600 mb-1">Rechnungsnummer (als Verwendungszweck):</p>
                      <p className="text-3xl font-bold text-blue-600">{workflow.paymentReference}</p>
                    </div>
                    <p className="text-sm text-slate-700 mb-4">
                      Der Kunde muss diesen Betrag überweisen:<br />
                      <strong>€ {workflow.totalNetto.toFixed(2)}</strong> (netto) + <strong>€ {workflow.vatAmount.toFixed(2)}</strong> (MwSt.) = <strong>€ {workflow.totalBrutto.toFixed(2)}</strong> (brutto)
                    </p>
                    <p className="text-xs text-slate-600 italic">Verwendungszweck: {workflow.paymentReference}</p>
                  </div>

                  {/* INCOMING PAYMENTS */}
                  <div className="border-2 border-green-300 rounded-lg p-8 bg-green-50">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">💳 Eingegangene Zahlungen</h3>

                    {!workflow.paymentVerified ? (
                      <div className="space-y-4 mb-6">
                        <div className="bg-white border-2 border-green-300 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-slate-900">Zahlung vom {formatDate(new Date())}</p>
                              <p className="text-sm text-slate-600">Absender: {workflow.selectedEmail.from}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 text-lg">€ {workflow.totalBrutto.toFixed(2)}</p>
                              <p className="text-xs text-slate-600">Eingegangen</p>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded text-sm mb-4 border-l-2 border-blue-500">
                            <p className="text-slate-600"><strong>Referenz:</strong> {workflow.paymentReference}</p>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={verifyPayment} className="flex-1 py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm">
                              ✓ Zahlung bestätigen
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-green-500 rounded-lg p-6">
                        <p className="text-lg font-bold text-green-600 mb-4">✓ Zahlung verifiziert!</p>
                        <div className="space-y-2 text-sm text-slate-700">
                          <p><strong>Referenz:</strong> {workflow.paymentReference}</p>
                          <p><strong>Betrag:</strong> € {workflow.totalBrutto.toFixed(2)}</p>
                          <p><strong>Bestätigt am:</strong> {formatDate(new Date())}</p>
                        </div>
                        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm text-blue-800">
                            🎉 <strong>Prozess abgeschlossen!</strong>
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Die Ware wurde versendet und die Zahlung ist eingegangen. Der gesamte Verkaufsprozess ist erfolgreich abgeschlossen.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!workflow.paymentVerified && (
                    <button onClick={() => setActiveTab('shipping')} className="w-full py-3 px-6 bg-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-400 transition-colors">
                      ← Zurück zum Versand
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">Wählen Sie zuerst eine Email und ein Produkt aus.</p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR - WORKFLOW STATUS */}
        <div className="w-64">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 sticky top-8">
            <h3 className="text-lg font-bold mb-6 text-slate-800">🔄 Prozessablauf</h3>
            <div className="space-y-3">
              <StepBadge step={0} title="Email auswählen" completed={workflow.currentStep > 0} />
              <StepBadge step={1} title="Produkt suchen" completed={workflow.currentStep > 1} />
              <StepBadge step={2} title="Angebot erstellen" completed={workflow.currentStep > 2} />
              <StepBadge step={3} title="Angebot absenden" completed={workflow.currentStep > 3} />
              <StepBadge step={4} title="Auftrag annehmen" completed={workflow.currentStep > 4} />
              <StepBadge step={5} title="Versand wählen" completed={workflow.currentStep > 5} />
              <StepBadge step={6} title="Rechnung generieren" completed={workflow.currentStep > 6} />
              <StepBadge step={7} title="Zahlungsref" completed={workflow.currentStep > 7} />
              <StepBadge step={8} title="Zahlung prüfen" completed={workflow.currentStep > 8} />
              <StepBadge step={9} title="Abschließen" completed={workflow.currentStep > 9} />
            </div>

            {workflow.selectedEmail && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-bold text-blue-900 mb-2">📧 ANFRAGE</p>
                <p className="text-sm text-slate-800">{workflow.selectedEmail.from}</p>
                <p className="text-xs text-slate-600 mt-1">{workflow.quantity} Stück | Budget: € {workflow.selectedEmail.requirements.maxBudget?.toLocaleString('de-DE')}</p>
              </div>
            )}

            {workflow.selectedProduct && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-bold text-green-900 mb-2">📦 PRODUKT</p>
                <p className="text-sm text-slate-800">{workflow.selectedProduct.name}</p>
                <p className="text-xs text-slate-600 mt-1">€ {workflow.selectedProduct.price.toFixed(2)} × {workflow.quantity}</p>
              </div>
            )}

            {workflow.totalBrutto > 0 && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs font-bold text-orange-900 mb-2">💰 TOTAL</p>
                <p className="text-sm text-slate-800">€ {workflow.totalBrutto.toFixed(2)}</p>
                <p className="text-xs text-slate-600 mt-1">Netto: € {workflow.totalNetto.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <EmailReaderModal 
        email={selectedEmailForReading} 
        onClose={() => setSelectedEmailForReading(null)}
        onEdit={(email) => selectEmailForOffer(email)}
      />
    </div>
  );
}
