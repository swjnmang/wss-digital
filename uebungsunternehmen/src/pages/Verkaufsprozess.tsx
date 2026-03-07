import { useState } from 'react';
import { Link } from 'react-router-dom';

// Typen
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  weight: number; // kg
  artNumber?: string;
}

interface Email {
  id: string;
  from: string;
  fromAddress: string;
  subject: string;
  content: string;
  attachmentProduct: string; // Product ID
  attachmentQuantity: number;
  customerNumber?: string;
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

// Produktdaten
const PRODUCTS: Product[] = [
  { id: 'p1', name: 'TAno Cloud 1', category: 'Tablet-PCs', price: 447.28, stock: 75, weight: 0.6, artNumber: '3060759' },
  { id: 'p2', name: 'Cheetah Pad 4p12', category: 'Tablet-PCs', price: 907.20, stock: 175, weight: 0.7 },
  { id: 'p3', name: 'aTab X800', category: 'Tablet-PCs', price: 760.07, stock: 0, weight: 0.6 },
  { id: 'p4', name: 'Tycoon Tablet Pro 10', category: 'Tablet-PCs', price: 942.04, stock: 527, weight: 0.8 },
  { id: 'p5', name: 'Bluetab 98', category: 'Tablet-PCs', price: 600.00, stock: 181, weight: 0.5 },
  { id: 'p6', name: 'Commander 10', category: 'Desktop-PCs', price: 979.37, stock: 50, weight: 12 },
  { id: 'p7', name: 'Pro Monitor 27', category: 'Monitore', price: 1200.00, stock: 120, weight: 8 },
  { id: 'p8', name: 'Gaming Headset Pro', category: 'Kopfhörer', price: 150.00, stock: 200, weight: 0.3 },
];

// Email-Daten
const EMAILS: Email[] = [
  {
    id: 'e1',
    from: 'Jürgen Eggers',
    fromAddress: 'juergen@elektrofachmarkt-eggers.de',
    subject: 'Anfrage für 14 Tablet-PCs mit hohem Leistungsindex',
    content: 'Sehr geehrte Damen und Herren,\n\nwir benötigen hochwertige Artikel in der angegebenen Qualität und Ausführung und bitten daher um ein entsprechendes Angebot.\n\n14 Stück Tablet-PCs mit einem Leistungsindex von mind. 3 Sternen.\nBitte teilen Sie mit, welche Modelle Sie empfehlen können.',
    attachmentProduct: 'p1',
    attachmentQuantity: 14,
    customerNumber: '1005',
    date: '04.11.2022',
    read: false,
  },
  {
    id: 'e2',
    from: 'Anna Schmidt',
    fromAddress: 'anna@büro-schmidt.de',
    subject: 'Dringend: 5 Desktop-PCs für neues Büro',
    content: 'Guten Tag,\n\nwir eröffnen ein neues Büro und benötigen kurzfristig 5 leistungsstarke Desktop-PCs. Gerne auch Express-Versand.\n\nBitte senden Sie ein Angebot mit schnellstmöglicher Lieferung.',
    attachmentProduct: 'p6',
    attachmentQuantity: 5,
    customerNumber: '1006',
    date: '03.11.2022',
    read: false,
  },
  {
    id: 'e3',
    from: 'MediaCenter GmbH',
    fromAddress: 'bestellung@mediacenter.de',
    subject: 'Großbestellung: 50 Monitore',
    content: 'Hallo,\n\nwir suchen einen zuverlässigen Lieferanten für hochwertige 27" Monitore. Wir möchten mit einer Bestellung von 50 Stück starten.\n\nBenötigen für Ihre Angebotsunterbreitung Details zu Rabattstaffeln und Versandoptionen.',
    attachmentProduct: 'p7',
    attachmentQuantity: 50,
    customerNumber: '1007',
    date: '01.11.2022',
    read: false,
  },
];

// Versandunternehmen (wird später in Versandmodul verwendet)

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

export default function Verkaufsprozess() {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    currentStep: 0, // 0: Email auswählen, 1: Produkt suchen, 2: Angebot erstellen, 3: Angebot absenden, etc.
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

  const [activeTab, setActiveTab] = useState<'email' | 'warehouse' | 'banking' | 'documents'>('email');

  // Email auswählen
  const selectEmail = (email: Email) => {
    setWorkflow({
      ...workflow,
      selectedEmail: email,
      currentStep: 1,
    });
    setActiveTab('warehouse');
  };

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

  // Rabattstaffeln werden später in der Angebotskalkulation verwendet

  // Step Status Badge
  const StepBadge = ({ step, title, completed }: { step: number; title: string; completed: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${ workflow.currentStep === step ? 'border-orange-500 bg-orange-50' : completed ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${ completed ? 'bg-green-500 text-white' : workflow.currentStep === step ? 'bg-orange-500 text-white' : 'bg-slate-300 text-slate-700'}`}>
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
          <h1 className="text-4xl font-bold mb-2">📦 Verkaufsprozess Simulation</h1>
          <p className="text-lg text-orange-100">
            Willkommen bei MM5 GmbH - Simulieren Sie einen kompletten B2B-Verkaufsprozess
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
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${ activeTab === 'email' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              📧 Posteingang
            </button>
            <button
              onClick={() => setActiveTab('warehouse')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${ activeTab === 'warehouse' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              📦 Lager
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${ activeTab === 'documents' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              📄 Dokumente
            </button>
            <button
              onClick={() => setActiveTab('banking')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${ activeTab === 'banking' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              💰 Banking
            </button>
          </div>

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">📧 Posteingang</h2>
              <div className="space-y-4">
                {EMAILS.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => selectEmail(email)}
                    className="border-2 border-slate-200 rounded-lg p-6 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all bg-slate-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{email.from}</h3>
                        <p className="text-sm text-slate-500">{email.fromAddress}</p>
                      </div>
                      <span className="text-sm text-slate-500">{email.date}</span>
                    </div>
                    <p className="font-semibold text-blue-600 mb-2">{email.subject}</p>
                    <p className="text-slate-600 mb-3 line-clamp-2">{email.content}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
                        {email.attachmentQuantity}x {PRODUCTS.find((p) => p.id === email.attachmentProduct)?.name}
                      </span>
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
                <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="font-semibold text-slate-800">
                    Kundenanfrage: {workflow.selectedEmail.attachmentQuantity}x{' '}
                    {PRODUCTS.find((p) => p.id === workflow.selectedEmail!.attachmentProduct)?.name}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 mb-6">Wählen Sie zuerst eine Email aus dem Posteingang.</p>
              )}

              {/* Produkte nach Kategorie */}
              <div className="space-y-6">
                {['Tablet-PCs', 'Desktop-PCs', 'Monitore', 'Kopfhörer'].map((category) => {
                  const categoryProducts = PRODUCTS.filter((p) => p.category === category);
                  return (
                    <div key={category}>
                      <h3 className="font-bold text-lg text-slate-800 mb-3">{category}</h3>
                      {categoryProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => selectProduct(product)}
                          className={`border-2 rounded-lg p-5 cursor-pointer mb-3 transition-all ${ product.stock === 0 ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-60' : workflow.selectedProduct?.id === product.id ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-500 bg-white'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-900">{product.name}</p>
                              {product.artNumber && <p className="text-sm text-slate-500">Art.-Nr. {product.artNumber}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">€ {product.price.toFixed(2)}</p>
                              <p className={`text-sm font-semibold ${ product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                                Lagerbestand: {product.stock}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
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
                            <td className="text-center">{workflow.selectedEmail.attachmentQuantity}</td>
                            <td className="text-right">€ {workflow.selectedProduct.price.toFixed(2)}</td>
                            <td className="text-right">
                              €{' '}
                              {(
                                workflow.selectedProduct.price * workflow.selectedEmail.attachmentQuantity
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
                            workflow.selectedProduct.price * workflow.selectedEmail.attachmentQuantity
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
                      <div className="flex justify-between font-bold">
                        <span>Gesamtpreis netto:</span>
                        <span>
                          €{' '}
                          {(
                            workflow.selectedProduct.price * workflow.selectedEmail.attachmentQuantity +
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
                <p className="text-xs font-bold text-blue-900 mb-2">AKTUELLE ANFRAGE</p>
                <p className="text-sm text-slate-800">{workflow.selectedEmail.from}</p>
              </div>
            )}

            {workflow.selectedProduct && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-bold text-green-900 mb-2">AUSGEWÄHLTES PRODUKT</p>
                <p className="text-sm text-slate-800">{workflow.selectedProduct.name}</p>
                <p className="text-xs text-slate-600 mt-1">€ {workflow.selectedProduct.price.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
