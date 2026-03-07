import { useState } from 'react';
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
}

interface ShippingOption {
  name: string;
  basePrice: number;
  expressCharge: number;
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
  invoiceNumber: number;
  invoiceDate: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  shippingCost: number;
  totalNetto: number;
  vatAmount: number;
  totalBrutto: number;
  selectedShipping?: ShippingOption;
  isExpress: boolean;
  paymentReference: string;
  paymentVerified: boolean;
  goodsShipped: boolean;
  offerFinalized: boolean;
}

const LIEFERBEDINGNISSE = {
  versandkostenD: 20,
  versandkostenEU: 50,
  versandkostenfrei: 2500,
  rabattstaffeln: [
    { ab: 5000, prozent: 3 },
    { ab: 10000, prozent: 5 },
    { ab: 20000, prozent: 7 },
  ],
  zahlungsziel: 30,
  skonto: 2.0,
  skontoTage: 7,
  vatRate: 19,
};

const SHIPPING_OPTIONS: ShippingOption[] = [
  { name: 'DAL Standard', basePrice: 6.40, expressCharge: 0.70, deliveryDays: 5 },
  { name: 'Deltapost Express', basePrice: 10.00, expressCharge: 0.85, deliveryDays: 3 },
  { name: 'POC post Budget', basePrice: 2.40, expressCharge: 0.70, deliveryDays: 7 },
  { name: 'Postbox Premium', basePrice: 4.30, expressCharge: 0, deliveryDays: 2 },
];

// ============================================================================
// PRODUCT DATA
// ============================================================================

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'ProStation Elite X12',
    category: 'Desktop-PCs',
    price: 1895.50,
    stock: 12,
    artNumber: 'PS-ELX-001',
    specs: { cpu: 'Intel Core i7-13700K', ram: '32GB DDR5', storage: '1TB NVMe SSD', gpu: 'NVIDIA RTX 4080 Super', warranty: '36 Monate', quality: 5, color: 'Grau' },
    description: 'High-Performance Desktop für professionelle Anwendungen'
  },
  {
    id: 'p2',
    name: 'WorkHub Standard W8',
    category: 'Desktop-PCs',
    price: 849.99,
    stock: 35,
    artNumber: 'WH-STD-008',
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
    specs: { cpu: 'Intel Core i9-13900KS', ram: '64GB DDR5', storage: '2TB NVMe SSD', gpu: 'NVIDIA RTX 4090', warranty: '48 Monate', quality: 5, color: 'Weiß' },
    description: 'Top-of-the-Line Workstation für Video & 3D-Rendering'
  },
  {
    id: 'p4',
    name: 'BudgetBox Simple S4',
    category: 'Desktop-PCs',
    price: 499.99,
    stock: 50,
    artNumber: 'BB-SMP-S4',
    specs: { cpu: 'Intel Pentium Gold G7400', ram: '8GB DDR4', storage: '256GB SSD', quality: 2, color: 'Schwarz' },
    description: 'Einstiegs-PC für Schulen und Kleine Büros'
  },
  {
    id: 'm1',
    name: 'CinaryView Pro 32',
    category: 'Monitore',
    price: 1899.00,
    stock: 15,
    artNumber: 'CVP-32-004K',
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
    specs: { diagonal: '27"', resolution: 'QHD (2560x1440)', refreshRate: '144Hz', panelType: 'VA', warranty: '24 Monate', quality: 4 },
    description: 'Gaming Monitor mit hoher Bildwiederholrate'
  },
  {
    id: 'm3',
    name: 'OfficeCore 24 FHD',
    category: 'Monitore',
    price: 259.99,
    stock: 73,
    artNumber: 'OC-24-FHD',
    specs: { diagonal: '24"', resolution: 'Full HD (1920x1080)', refreshRate: '60Hz', panelType: 'TN', warranty: '24 Monate', quality: 3 },
    description: 'Standard Office-Monitor für alltägliche Aufgaben'
  },
  {
    id: 'm4',
    name: 'UltraWide Cinema 49',
    category: 'Monitore',
    price: 2299.99,
    stock: 6,
    artNumber: 'UWC-49-144',
    specs: { diagonal: '49"', resolution: '5120x1440', refreshRate: '144Hz', panelType: 'VA', warranty: '36 Monate', quality: 5 },
    description: 'Ultra-Wide Curved Monitor für Profis'
  },
  {
    id: 't1',
    name: 'TabMax Air Pro 12',
    category: 'Tablets',
    price: 1199.99,
    stock: 28,
    artNumber: 'TMA-PRO-12',
    specs: { screen: '12.9"', processor: 'Apple M2', storage: '512GB', warranty: '24 Monate', quality: 5 },
    description: 'Premium Tablet für kreative Profis'
  },
  {
    id: 't2',
    name: 'MediumTab Essential 10',
    category: 'Tablets',
    price: 449.99,
    stock: 91,
    artNumber: 'MTE-10-ESS',
    specs: { screen: '10.1"', processor: 'Qualcomm Snapdragon 870', storage: '128GB', warranty: '12 Monate', quality: 3 },
    description: 'Universal-Tablet für Schulen und Unterricht'
  },
  {
    id: 't3',
    name: 'CompactView Go 8',
    category: 'Tablets',
    price: 299.99,
    stock: 64,
    artNumber: 'CVG-8-000',
    specs: { screen: '8"', processor: 'MediaTek Helio G99', storage: '64GB', warranty: '12 Monate', quality: 2 },
    description: 'Portables Tablet für unterwegs'
  },
  {
    id: 'h1',
    name: 'SoundPro Studio Elite',
    category: 'Kopfhörer',
    price: 449.99,
    stock: 37,
    artNumber: 'SPE-STU-001',
    specs: { driverSize: '50mm', frequency: '10Hz-40kHz', wireless: false, warranty: '24 Monate', quality: 5 },
    description: 'Studio-Kopfhörer für Audio-Profis'
  },
  {
    id: 'h2',
    name: 'ClearComm Pro Gaming',
    category: 'Kopfhörer',
    price: 179.99,
    stock: 56,
    artNumber: 'CCP-GMG-007',
    specs: { driverSize: '40mm', frequency: '20Hz-20kHz', wireless: true, warranty: '12 Monate', quality: 4 },
    description: 'Gaming Wireless Headset mit guter Qualität'
  },
  {
    id: 'h3',
    name: 'OfficeChat Standard',
    category: 'Kopfhörer',
    price: 79.99,
    stock: 128,
    artNumber: 'OCS-STD-002',
    specs: { driverSize: '32mm', frequency: '20Hz-20kHz', wireless: false, warranty: '12 Monate', quality: 2 },
    description: 'Einfaches Multimedia-Headset'
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
  },
];

// ============================================================================
// EMAIL READER MODAL
// ============================================================================

function EmailReaderModal({ email, onClose }: { email: Email | null; onClose: () => void }) {
  if (!email) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 p-6 flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500 mb-2">Von: {email.from}</p>
            <h2 className="text-2xl font-bold text-slate-800">{email.subject}</h2>
            <p className="text-sm text-slate-500 mt-2">{email.date} • Kunde #{email.customerNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-light">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {email.content}
        </div>

        <div className="border-t border-slate-200 bg-blue-50 p-6">
          <h3 className="font-bold text-slate-800 mb-3">📋 Anforderungen-Zusammenfassung:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Stückzahl:</p>
              <p className="font-semibold text-slate-800">{email.requirements.quantity?.exact}</p>
            </div>
            <div>
              <p className="text-slate-600">Max. Budget netto:</p>
              <p className="font-semibold text-slate-800">€ {email.requirements.maxBudget?.toLocaleString('de-DE')}</p>
            </div>
            <div>
              <p className="text-slate-600">Min. Qualität:</p>
              <p className="font-semibold text-slate-800">{'⭐'.repeat(email.requirements.quality || 3)}</p>
            </div>
            <div>
              <p className="text-slate-600">Prioritäten:</p>
              <p className="font-semibold text-slate-800">{email.requirements.priority?.slice(0, 2).join(', ')}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Verkaufsprozess() {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    currentStep: 0,
    quantity: 0,
    offerNumber: 18,
    offerDate: new Date().toLocaleDateString('de-DE'),
    orderAccepted: false,
    invoiceNumber: 18,
    invoiceDate: new Date().toLocaleDateString('de-DE'),
    unitPrice: 0,
    discountPercent: 0,
    discountAmount: 0,
    subtotal: 0,
    shippingCost: LIEFERBEDINGNISSE.versandkostenD,
    totalNetto: 0,
    vatAmount: 0,
    totalBrutto: 0,
    isExpress: false,
    paymentReference: '',
    paymentVerified: false,
    goodsShipped: false,
    offerFinalized: false,
  });

  const [activeTab, setActiveTab] = useState<'email' | 'warehouse' | 'documents' | 'shipping' | 'banking'>('email');
  const [selectedEmailForReading, setSelectedEmailForReading] = useState<Email | null>(null);

  const selectEmailForOffer = (email: Email) => {
    setWorkflow((prev) => ({
      ...prev,
      currentStep: 1,
      selectedEmail: email,
      quantity: email.requirements.quantity?.exact || 0,
    }));
    setActiveTab('warehouse');
  };

  const selectProduct = (product: Product) => {
    setWorkflow((prev) => ({
      ...prev,
      selectedProduct: product,
      unitPrice: product.price,
      quantity: prev.selectedEmail?.requirements.quantity?.exact || 0,
      currentStep: 2,
    }));
    setActiveTab('documents');
  };

  const acceptOrder = () => {
    setWorkflow((prev) => ({
      ...prev,
      currentStep: 4,
      orderAccepted: true,
      orderDate: new Date().toLocaleDateString('de-DE'),
    }));
  };

  const selectShipping = (option: ShippingOption) => {
    const newShippingCost = workflow.isExpress ? option.basePrice * (1 + option.expressCharge / 100) : option.basePrice;
    const newTotalNetto = workflow.subtotal - workflow.discountAmount + newShippingCost;
    const newVatAmount = (newTotalNetto * LIEFERBEDINGNISSE.vatRate) / 100;
    const newTotalBrutto = newTotalNetto + newVatAmount;

    setWorkflow((prev) => ({
      ...prev,
      selectedShipping: option,
      shippingCost: newShippingCost,
      totalNetto: newTotalNetto,
      vatAmount: newVatAmount,
      totalBrutto: newTotalBrutto,
      currentStep: 7,
    }));
  };

  const generatePaymentReference = () => {
    const reference = `RG${workflow.invoiceNumber.toString().padStart(6, '0')}`;
    setWorkflow((prev) => ({
      ...prev,
      paymentReference: reference,
      currentStep: 8,
    }));
    setActiveTab('banking');
  };

  const verifyPayment = () => {
    setWorkflow((prev) => ({
      ...prev,
      paymentVerified: true,
      currentStep: 9,
      goodsShipped: true,
    }));
  };

  // Prüfe ob gewähltes Produkt wirklich passt
  const isProductMatch = (product: Product, email?: Email): boolean => {
    if (!email) return true;
    const reqs = email.requirements;
    if (reqs.quality && product.specs.quality && product.specs.quality < reqs.quality) return false;

    for (const spec of reqs.specs || []) {
      if (spec.key === 'gpu' && !spec.values?.some((v) => product.specs.gpu?.includes(v))) return false;
      if (spec.key === 'ram') {
        const ramMatch = product.specs.ram?.match(/(\d+)/);
        if (ramMatch && spec.minValue && parseInt(ramMatch[1]) < spec.minValue) return false;
      }
      if (spec.key === 'diagonal' && !spec.values?.some((v) => product.specs.diagonal?.includes(v))) return false;
    }
    return true;
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
            <button onClick={() => setActiveTab('shipping')} className={`py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'shipping' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              🚚 Versand
            </button>
            <button onClick={() => setActiveTab('banking')} className={`py-3 px-4 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'banking' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              💰 Banking
            </button>
          </div>

          {/* EMAIL TAB */}
          {activeTab === 'email' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">📧 Posteingang ({EMAILS.length})</h2>
              <div className="space-y-4">
                {EMAILS.map((email) => (
                  <div key={email.id} className="border-2 border-slate-200 rounded-lg p-6 bg-slate-50 hover:shadow-lg transition-all">
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

                    <div className="flex flex-wrap gap-2 mb-4 text-xs">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">{email.requirements.quantity?.exact} Stück</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">Budget: € {email.requirements.maxBudget?.toLocaleString('de-DE')}</span>
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">Quality: {'⭐'.repeat(email.requirements.quality || 3)}</span>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setSelectedEmailForReading(email)} className="flex-1 py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm">
                        Lesen
                      </button>
                      <button onClick={() => selectEmailForOffer(email)} className="flex-1 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm">
                        Bearbeiten
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WAREHOUSE TAB */}
          {activeTab === 'warehouse' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">📦 Lager durchsuchen</h2>

              {workflow.selectedEmail ? (
                <>
                  <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="font-semibold text-slate-800">Kundenanfrage: {workflow.selectedEmail.requirements.quantity?.exact} Stück</p>
                    <p className="text-sm text-slate-600 mt-1">Budget: € {workflow.selectedEmail.requirements.maxBudget?.toLocaleString('de-DE')} | Min. Qualität: {'⭐'.repeat(workflow.selectedEmail.requirements.quality || 3)}</p>
                  </div>

                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded">
                    <p className="font-semibold text-amber-900">💡 Ihre Aufgabe: Wählen Sie SELBST den passenden Artikel!</p>
                    <p className="text-sm text-amber-800 mt-2">Die Kundenanfrage weist auf 2 wichtige Anforderungen hin. Lesen Sie die Email sorgfältig und wählen Sie einen geeigneten Artikel aus dem Lager.</p>
                  </div>

                  <div className="space-y-6">
                    {['Desktop-PCs', 'Monitore', 'Tablets', 'Kopfhörer'].map((category) => {
                      const categoryProducts = PRODUCTS.filter((p) => p.category === category && p.stock > 0);
                      if (categoryProducts.length === 0) return null;

                      return (
                        <div key={category}>
                          <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2">{category}</h3>
                          <div className="space-y-3">
                            {categoryProducts.map((product) => {
                              const isMatch = isProductMatch(product, workflow.selectedEmail);
                              return (
                                <div
                                  key={product.id}
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

                                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                                    {product.specs.cpu && <div>🖥️ {product.specs.cpu}</div>}
                                    {product.specs.ram && <div>💾 {product.specs.ram}</div>}
                                    {product.specs.diagonal && <div>📺 {product.specs.diagonal}</div>}
                                    {product.specs.screen && <div>📱 {product.specs.screen}</div>}
                                  </div>

                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-orange-600">{'⭐'.repeat(product.specs.quality || 3)}</span>
                                    {workflow.selectedProduct?.id === product.id && <span className="text-xs font-bold text-green-600">✓ Ausgewählt</span>}
                                    {!isMatch && workflow.selectedProduct?.id === product.id && <span className="text-xs font-bold text-red-600">⚠️ Passt nicht perfekt!</span>}
                                  </div>
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

              {workflow.selectedProduct && workflow.selectedEmail ? (
                <div className="space-y-6">
                  {/* OFFER FORM */}
                  <div className="border-2 border-orange-300 rounded-lg p-8 bg-orange-50">
                    <h3 className="text-lg font-bold mb-6 text-slate-800">📋 Angebotskalkulation</h3>

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

                    {/* INPUT TABLE */}
                    <div className="mb-6 bg-white rounded border border-slate-300 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-200 border-b-2 border-slate-800">
                            <th className="text-left font-bold py-3 px-4">Artikel</th>
                            <th className="text-center font-bold py-3 px-4">Art.-Nr.</th>
                            <th className="text-center font-bold py-3 px-4 w-24">Menge</th>
                            <th className="text-center font-bold py-3 px-4 w-32">Preis pro Stück</th>
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
                                    subtotal: newQty * prev.unitPrice,
                                  }));
                                }}
                                className="w-full border-2 border-blue-400 rounded px-2 py-1 text-center font-semibold focus:outline-none focus:border-blue-600"
                              />
                            </td>
                            <td className="py-4 px-4">
                              <input
                                type="number"
                                step="0.01"
                                value={workflow.unitPrice}
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value) || 0;
                                  setWorkflow((prev) => ({
                                    ...prev,
                                    unitPrice: newPrice,
                                    subtotal: prev.quantity * newPrice,
                                  }));
                                }}
                                className="w-full border-2 border-blue-400 rounded px-2 py-1 text-center font-semibold focus:outline-none focus:border-blue-600"
                              />
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-slate-900">€ {workflow.subtotal.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* CALCULATION FIELDS */}
                    <div className="mb-6 bg-white rounded border border-slate-300 p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Summe Einzelposten:</label>
                          <div className="bg-slate-100 border-2 border-slate-400 rounded px-3 py-2 text-right font-bold text-lg text-slate-900">
                            € {workflow.subtotal.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Rabatt in %:</label>
                          <input
                            type="number"
                            step="0.1"
                            value={workflow.discountPercent}
                            onChange={(e) => {
                              const discPercent = parseFloat(e.target.value) || 0;
                              const discAmount = (workflow.subtotal * discPercent) / 100;
                              setWorkflow((prev) => ({
                                ...prev,
                                discountPercent: discPercent,
                                discountAmount: discAmount,
                              }));
                            }}
                            className="w-full border-2 border-blue-400 rounded px-3 py-2 text-right font-semibold focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Rabatt € (auto):</label>
                          <div className="bg-green-100 border-2 border-green-500 rounded px-3 py-2 text-right font-bold text-lg text-green-700">
                            -€ {workflow.discountAmount.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Versandkosten €:</label>
                          <input
                            type="number"
                            step="0.01"
                            value={workflow.shippingCost}
                            onChange={(e) => {
                              const newShipping = parseFloat(e.target.value) || 0;
                              setWorkflow((prev) => ({
                                ...prev,
                                shippingCost: newShipping,
                              }));
                            }}
                            className="w-full border-2 border-blue-400 rounded px-3 py-2 text-right font-semibold focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div className="border-t-2 border-slate-300 pt-4">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Gesamtpreis netto (auto):</label>
                            <div
                              className="bg-blue-100 border-2 border-blue-500 rounded px-3 py-2 text-right font-bold text-lg text-blue-700"
                              onClick={() => {
                                const newNetto = workflow.subtotal - workflow.discountAmount + workflow.shippingCost;
                                setWorkflow((prev) => ({
                                  ...prev,
                                  totalNetto: newNetto,
                                  vatAmount: (newNetto * LIEFERBEDINGNISSE.vatRate) / 100,
                                  totalBrutto: newNetto + (newNetto * LIEFERBEDINGNISSE.vatRate) / 100,
                                }));
                              }}
                            >
                              € {(workflow.subtotal - workflow.discountAmount + workflow.shippingCost).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">MwSt. 19% (auto):</label>
                            <div
                              className="bg-amber-100 border-2 border-amber-500 rounded px-3 py-2 text-right font-bold text-lg text-amber-700"
                              onClick={() => {
                                const newNetto = workflow.subtotal - workflow.discountAmount + workflow.shippingCost;
                                const newVat = (newNetto * LIEFERBEDINGNISSE.vatRate) / 100;
                                const newBrutto = newNetto + newVat;
                                setWorkflow((prev) => ({
                                  ...prev,
                                  totalNetto: newNetto,
                                  vatAmount: newVat,
                                  totalBrutto: newBrutto,
                                }));
                              }}
                            >
                              €&nbsp;
                              {((workflow.subtotal - workflow.discountAmount + workflow.shippingCost) * LIEFERBEDINGNISSE.vatRate / 100).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-6 bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-500 rounded">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Rechnungsbetrag brutto (auto):</label>
                          <div className="text-right font-bold text-3xl text-orange-700">
                            €&nbsp;
                            {(workflow.subtotal - workflow.discountAmount + workflow.shippingCost + (workflow.subtotal - workflow.discountAmount + workflow.shippingCost) * LIEFERBEDINGNISSE.vatRate / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* HINT */}
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-slate-700">
                      <p className="font-semibold mb-2">💡 Hinweis für Schüler:</p>
                      <p>1. Geben Sie die Menge und den Preis pro Stück ein</p>
                      <p>2. Berechnen Sie den Rabatt-Prozentsatz (basierend auf der Kundenanfrage)</p>
                      <p>3. Tragen Sie die Versandkosten ein</p>
                      <p>4. Das System berechnet automatisch netto, MwSt. und brutto</p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          const newNetto = workflow.subtotal - workflow.discountAmount + workflow.shippingCost;
                          const newVat = (newNetto * LIEFERBEDINGNISSE.vatRate) / 100;
                          setWorkflow((prev) => ({
                            ...prev,
                            totalNetto: newNetto,
                            vatAmount: newVat,
                            totalBrutto: newNetto + newVat,
                            offerFinalized: true,
                            currentStep: 3,
                          }));
                        }}
                        className="flex-1 py-3 px-6 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                      >
                        ✓ Angebot fertigstellen & absenden
                      </button>
                      <button
                        onClick={() => setWorkflow((prev) => ({ ...prev, selectedProduct: undefined, currentStep: 1 }))}
                        className="flex-1 py-3 px-6 bg-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-400 transition-colors"
                      >
                        ← Zurück zum Lager
                      </button>
                    </div>
                  </div>

                  {/* ORDER ACCEPTANCE */}
                  {workflow.currentStep >= 3 && !workflow.orderAccepted && workflow.offerFinalized && (
                    <div className="border-2 border-blue-300 rounded-lg p-8 bg-blue-50">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">🎯 Auftrag annehmen?</h3>
                      <p className="text-slate-700 mb-6">Der Kunde möchte diese Bestellung bestätigen. Klicken Sie „Auftrag annehmen", um die Auftragsbestätigung zu generieren.</p>
                      <button
                        onClick={acceptOrder}
                        className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ✓ Auftrag annehmen und Auftragsbestätigung vorbereiten
                      </button>
                    </div>
                  )}

                  {/* ORDER CONFIRMATION */}
                  {workflow.orderAccepted && workflow.currentStep >= 4 && (
                    <div className="border-2 border-green-300 rounded-lg p-8 bg-green-50">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">✓ Auftragsbestätigung</h3>
                      <div className="text-sm space-y-2 mb-4">
                        <p><strong>Auftragsnummer:</strong> {workflow.offerNumber}</p>
                        <p><strong>Auftragsbestätigung-Datum:</strong> {workflow.orderDate}</p>
                        <p><strong>Kunde:</strong> {workflow.selectedEmail.from} (#{workflow.selectedEmail.customerNumber})</p>
                        <p><strong>Artikel:</strong> {workflow.selectedProduct.name}</p>
                        <p><strong>Menge:</strong> {workflow.quantity} Stück</p>
                        <p><strong>Gesamtpreis netto:</strong> € {workflow.totalNetto.toFixed(2)}</p>
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

          {/* SHIPPING TAB */}
          {activeTab === 'shipping' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">🚚 Versandauftrag & Versandunternehmen</h2>

              {workflow.selectedProduct && workflow.selectedEmail ? (
                <div className="space-y-6">
                  {/* SHIPPING ORDER */}
                  <div className="border-2 border-slate-300 rounded-lg p-8 bg-slate-50">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">📦 Versandauftrag für Lager</h3>
                    <div className="bg-white p-4 rounded border border-slate-200 text-sm space-y-2 mb-6">
                      <p><strong>Versandauftrag-Nummer:</strong> VA-{workflow.offerNumber}</p>
                      <p><strong>Datum:</strong> {new Date().toLocaleDateString('de-DE')}</p>
                      <p><strong>Artikel:</strong> {workflow.selectedProduct.name}</p>
                      <p><strong>Art.-Nr.:</strong> {workflow.selectedProduct.artNumber}</p>
                      <p><strong>Menge:</strong> {workflow.quantity} Stück</p>
                      <p><strong>Versandadresse:</strong> {workflow.selectedEmail.from}, {workflow.selectedEmail.fromAddress}</p>
                      <p className="text-xs text-slate-600 mt-3 italic">Diesen Versandauftrag erhalten die Mitarbeiter des Lagers, damit sie die Ware zusammenpacken.</p>
                    </div>

                    <div className="flex gap-3 mb-6">
                      <button className="flex-1 py-2 px-4 bg-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-400 transition-colors text-sm">
                        🖨️ Drucken
                      </button>
                      <button className="flex-1 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm">
                        ✓ Lager benachrichtigen
                      </button>
                    </div>
                  </div>

                  {/* SHIPPING OPTIONS */}
                  <div className="border-2 border-orange-300 rounded-lg p-8 bg-orange-50">
                    <h3 className="text-lg font-bold mb-6 text-slate-800">🚚 Versandunternehmen auswählen</h3>

                    {workflow.selectedShipping ? (
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
                        <p className="font-semibold text-green-800">✓ Ausgewählt: {workflow.selectedShipping.name}</p>
                        <p className="text-sm text-green-700 mt-1">Versandkosten: € {workflow.shippingCost.toFixed(2)} | Lieferdauer: {workflow.selectedShipping.deliveryDays} Tage</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        {SHIPPING_OPTIONS.map((option) => {
                          const cost = option.basePrice;
                          const expressCost = option.basePrice * (1 + option.expressCharge / 100);
                          return (
                            <div key={option.name} className="border-2 border-slate-300 rounded-lg p-4 hover:border-orange-500 cursor-pointer transition-all">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-bold text-slate-900">{option.name}</p>
                                  <p className="text-sm text-slate-600">Lieferdauer: {option.deliveryDays} Tage</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-slate-900">€ {cost.toFixed(2)}</p>
                                  <p className="text-xs text-slate-600">Standard</p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button onClick={() => { setWorkflow((prev) => ({ ...prev, selectedShipping: option, isExpress: false })); selectShipping(option); }} className="flex-1 py-2 px-3 bg-blue-500 text-white font-semibold rounded text-sm hover:bg-blue-600 transition-colors">
                                  Standard: € {cost.toFixed(2)}
                                </button>
                                {option.expressCharge > 0 && (
                                  <button onClick={() => { setWorkflow((prev) => ({ ...prev, selectedShipping: option, isExpress: true })); selectShipping(option); }} className="flex-1 py-2 px-3 bg-red-500 text-white font-semibold rounded text-sm hover:bg-red-600 transition-colors">
                                    Express: € {expressCost.toFixed(2)}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {workflow.selectedShipping && (
                    <div className="flex gap-4">
                      <button onClick={generatePaymentReference} className="flex-1 py-3 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        → Banking-Modul
                      </button>
                      <button onClick={() => setActiveTab('documents')} className="flex-1 py-3 px-6 bg-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-400 transition-colors">
                        ← Zurück zu Dokumenten
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">Wählen Sie zuerst eine Email und ein Produkt aus.</p>
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
                              <p className="font-bold text-slate-900">Zahlung vom {new Date().toLocaleDateString('de-DE')}</p>
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
                          <p><strong>Bestätigt am:</strong> {new Date().toLocaleDateString('de-DE')}</p>
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
              <StepBadge step={5} title="Rechnung generieren" completed={workflow.currentStep > 5} />
              <StepBadge step={6} title="Versand wählen" completed={workflow.currentStep > 6} />
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

      <EmailReaderModal email={selectedEmailForReading} onClose={() => setSelectedEmailForReading(null)} />
    </div>
  );
}
