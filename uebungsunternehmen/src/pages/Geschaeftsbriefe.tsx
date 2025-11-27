import { useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Link } from 'react-router-dom';
import { letterAssignments, type LetterAssignment } from '../data/letterAssignments';

interface LetterFields {
  recipientLines: string[];
  recipientAdditions: string[];
  recipientType: 'business' | 'private';
  date: string;
  subject: string;
  salutation: string;
  bodyIntro: string;
  bodyMain: string;
  bodyClosing: string;
  greeting: string;
  signature: string;
  closingCompany: string;
  attachments: string;
  infoBlock: InfoBlockFields;
}

interface InfoBlockFields {
  reference: string;
  clientMessageDate: string;
  ourReference: string;
  ourMessageDate: string;
  contactName: string;
  phone: string;
  fax: string;
  mail: string;
  infoDate: string;
}

interface ValidationItem {
  id: string;
  label: string;
  status: 'ok' | 'warn';
  message: string;
}

const firstAssignment = letterAssignments[0];
const recipientTypeGuidance: Record<'business' | 'private', string[]> = {
  business: [],
  private: [
    'Zeile 1: Anrede + Vor- und Nachname.',
    'Zeile 2: Straße oder Postfach.',
    'Zeile 3: PLZ und Ort.',
    'Zusatzzeilen nur bei c/o oder Etage verwenden.'
  ]
};


const spacingHints = [
  {
    title: 'Absender → Zusatz-/Vermerkzone',
    detail: '1 Leerzeile nach dem Firmenkopf, dann folgt die kompakte Zusatzzeile (Zeile 5).'
  },
  {
    title: 'Zusatz-/Vermerkzone → Empfänger',
    detail: 'Direkt anschließen, keine weitere Leerzeile zwischen den Blöcken.'
  },
  {
    title: 'Empfänger → Betreff',
    detail: '2 Leerzeilen freilassen, bevor der Betreff steht.'
  },
  {
    title: 'Betreff → Anrede',
    detail: 'Nach dem Betreff erneut 2 Leerzeilen einfügen.'
  },
  {
    title: 'Anrede → Text',
    detail: '1 Leerzeile genügt zwischen Anrede und Text.'
  },
  {
    title: 'Text → Grußformel',
    detail: '1 Leerzeile nach dem letzten Absatz.'
  },
  {
    title: 'Grußformel → Unterschrift',
    detail: '3 Leerzeilen für die handschriftliche Signatur.'
  }
];

const infoBlockFieldMeta: Array<{ key: keyof InfoBlockFields; label: string }> = [
  { key: 'reference', label: 'Ihr Zeichen' },
  { key: 'clientMessageDate', label: 'Ihre Nachricht vom' },
  { key: 'ourReference', label: 'Unser Zeichen' },
  { key: 'ourMessageDate', label: 'Unsere Nachricht vom' },
  { key: 'contactName', label: 'Name' },
  { key: 'phone', label: 'Telefon' },
  { key: 'fax', label: 'Fax' },
  { key: 'mail', label: 'E-Mail' },
  { key: 'infoDate', label: 'Datum' }
];

const bodyFieldMeta: Array<{ key: 'bodyIntro' | 'bodyMain' | 'bodyClosing'; label: string; helper: string }> = [
  { key: 'bodyIntro', label: 'Einstieg', helper: 'Worum geht es?' },
  { key: 'bodyMain', label: 'Hauptteil', helper: 'Details + Forderung' },
  { key: 'bodyClosing', label: 'Abschluss', helper: 'Ausblick oder Bitte' }
];

export default function Geschaeftsbriefe() {
  const [assignmentId, setAssignmentId] = useState(firstAssignment.id);
  const [fields, setFields] = useState<LetterFields>(() => createTemplate(firstAssignment));
  const letterPreviewRef = useRef<HTMLDivElement | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const currentAssignment = useMemo(() => {
    return letterAssignments.find(item => item.id === assignmentId) ?? firstAssignment;
  }, [assignmentId]);

  const validations = useMemo(() => validateFields(fields), [fields]);

  const handleAssignmentChange = (nextId: string) => {
    const nextAssignment = letterAssignments.find(item => item.id === nextId);
    if (!nextAssignment) {
      return;
    }
    setAssignmentId(nextId);
    setFields(createTemplate(nextAssignment));
  };

  const handleFieldChange = (key: keyof LetterFields, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  const handleRecipientAdditionChange = (index: number, value: string) => {
    setFields(prev => {
      const recipientAdditions = [...prev.recipientAdditions];
      recipientAdditions[index] = value;
      return { ...prev, recipientAdditions };
    });
  };

  const handleRecipientLineChange = (index: number, value: string) => {
    setFields(prev => {
      const recipientLines = [...prev.recipientLines];
      recipientLines[index] = value;
      return { ...prev, recipientLines };
    });
  };

  const handleInfoFieldChange = (key: keyof InfoBlockFields, value: string) => {
    setFields(prev => ({
      ...prev,
      infoBlock: {
        ...prev.infoBlock,
        [key]: value
      }
    }));
  };

  const handleDownloadPdf = async () => {
    if (!letterPreviewRef.current || isExportingPdf) {
      return;
    }
    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(letterPreviewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const canvasRatio = canvas.width / canvas.height;
      const maxWidth = pageWidth - 20;
      const maxHeight = pageHeight - 20;
      let renderWidth = maxWidth;
      let renderHeight = renderWidth / canvasRatio;
      if (renderHeight > maxHeight) {
        renderHeight = maxHeight;
        renderWidth = renderHeight * canvasRatio;
      }
      const offsetX = (pageWidth - renderWidth) / 2;
      const offsetY = (pageHeight - renderHeight) / 2;
      pdf.addImage(imageData, 'PNG', offsetX, offsetY, renderWidth, renderHeight);
      pdf.save(buildPdfFileName(currentAssignment.subject));
    } catch (error) {
      console.error('PDF-Export fehlgeschlagen', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const combinedBody = [fields.bodyIntro, fields.bodyMain, fields.bodyClosing].filter(Boolean).join('\n\n');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
            ← Zurück zur Übersicht
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Übungsunternehmen</p>
            <h1 className="text-xl font-bold">DIN 5008 Geschäftsbriefe</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <section className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Aufgabenpool</p>
                <h2 className="text-lg font-bold">{currentAssignment.subject}</h2>
              </div>
              <AssignmentSelector
                assignments={letterAssignments}
                currentId={assignmentId}
                onChange={handleAssignmentChange}
              />
            </div>
            <span className="inline-flex text-xs uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold w-fit">
              {currentAssignment.company}
            </span>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              {currentAssignment.context.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Arbeitsaufträge</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {currentAssignment.requirements.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <SpacingCoach />

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6">Briefbausteine ausfüllen</h2>
            <div className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-700">So bearbeitest du den Brief</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                  <li>Klicke rechts in der Live-Vorschau auf Datum, Betreff, Anrede oder Textfelder und tippe direkt hinein.</li>
                  <li>Adressblock, Infoblock und Briefschluss lassen sich ebenfalls direkt im Vorschaubereich eingeben.</li>
                  <li>Nutze Absätze für Einleitung, Hauptteil und Schluss, damit der Text gut lesbar bleibt.</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                Bearbeite alle Inhalte direkt rechts in der Live-Vorschau. Du kannst jeden Abschnitt anklicken und textlich anpassen – ganz ohne separate Eingabefelder.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <LetterPreview
              fields={fields}
              previewRef={letterPreviewRef}
              onDownloadPdf={handleDownloadPdf}
              isExportingPdf={isExportingPdf}
              onInfoFieldChange={handleInfoFieldChange}
              onRecipientAdditionChange={handleRecipientAdditionChange}
              onRecipientLineChange={handleRecipientLineChange}
              onRecipientTypeChange={type => handleFieldChange('recipientType', type)}
              onFieldChange={handleFieldChange}
            />
            <ValidationList
              items={validations}
              combinedBody={combinedBody}
              infoBlock={fields.infoBlock}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function createTemplate(currentAssignment: LetterAssignment): LetterFields {
  return {
    recipientAdditions: [''],
    recipientLines: createRecipientLineTemplate(currentAssignment.recipientPieces.length),
    recipientType: currentAssignment.recipientType,
    date: '',
    subject: '',
    salutation: '',
    bodyIntro: currentAssignment.bodyDraft,
    bodyMain: '',
    bodyClosing: '',
    greeting: '',
    closingCompany: currentAssignment.company,
    signature: '',
    attachments: '',
    infoBlock: {
      reference: '',
      clientMessageDate: '',
      ourReference: '',
      ourMessageDate: '',
      contactName: '',
      phone: '',
      fax: '',
      mail: '',
      infoDate: ''
    }
  };
}

function createRecipientLineTemplate(count: number) {
  return Array(Math.max(count, 1)).fill('');
}

function AssignmentSelector({
  assignments,
  currentId,
  onChange
}: {
  assignments: LetterAssignment[];
  currentId: string;
  onChange: (nextId: string) => void;
}) {
  return (
    <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold space-y-2">
      Aufgabe wählen
      <select
        value={currentId}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        {assignments.map(item => (
          <option key={item.id} value={item.id}>
            {item.subject}
          </option>
        ))}
      </select>
    </label>
  );
}

function validateFields(fields: LetterFields): ValidationItem[] {
  const subjectHasWord = /betreff/i.test(fields.subject);
  const dateValid = /^\d{2}\.\d{2}\.\d{4}$/.test(fields.date.trim());
  const greetingText = fields.greeting.trim().toLowerCase();
  const usesModernGreeting = /freundliche grüße/.test(greetingText);
  const usesClassicGreeting = /mit freundlichen grüßen/.test(greetingText);
  const hasAnyGreeting = greetingText.length > 0;
  const salutationValid = /^\s*Sehr\s+/.test(fields.salutation) && /,$/.test(fields.salutation.trim());
  const attachmentsOk = !fields.attachments || /^Anlage/i.test(fields.attachments.trim());
  const closingCompanyValid = fields.closingCompany.trim().length >= 3;
  const signatureHasIA = /i\.?\s*a\.?/i.test(fields.signature);
  const signatureHasName = /[A-ZÄÖÜ][A-Za-zÄÖÜäöüß]+\s+[A-ZÄÖÜ][A-Za-zÄÖÜäöüß]+/.test(fields.signature);
  const signatureMultiline = /\n/.test(fields.signature.trim());
  const closingSpacing = /\n\s*\n/.test(fields.signature);
  const additionFilled = fields.recipientAdditions.filter(Boolean).length >= 1;
  const recipientAreaFilled = fields.recipientLines.filter(Boolean).length >= 4;

  return [
    {
      id: 'additionZone',
      label: 'Zusatz- & Vermerkzone (1 Zeile)',
      status: additionFilled ? 'ok' : 'warn',
      message: additionFilled
        ? 'Absenderzeile steht korrekt über der Empfängeradresse.'
        : 'Trage deine Absenderadresse kompakt in Zeile 5 ein.'
    },
    {
      id: 'recipient',
      label: 'Empfängerzone (9 Zeilen)',
      status: recipientAreaFilled ? 'ok' : 'warn',
      message: recipientAreaFilled ? 'Adresse wirkt vollständig.' : 'Nutze bis zu 9 Zeilen für Firma/Person, Straße/Postfach und PLZ Ort.'
    },
    {
      id: 'date',
      label: 'Datum im Format TT.MM.JJJJ',
      status: dateValid ? 'ok' : 'warn',
      message: dateValid ? 'Datum korrekt.' : 'Nutze z. B. 27.11.2025.'
    },
    {
      id: 'subject',
      label: 'Betreff ohne Wort „Betreff“',
      status: !subjectHasWord && fields.subject.trim().length > 5 ? 'ok' : 'warn',
      message: !subjectHasWord ? 'Betreff ist prägnant.' : 'Lass das Wort „Betreff“ weg. Schreibe direkt das Thema.'
    },
    {
      id: 'salutation',
      label: 'Anrede korrekt mit Komma',
      status: salutationValid ? 'ok' : 'warn',
      message: salutationValid ? 'Anrede passt.' : 'Beginne mit „Sehr …“ und schließe mit Komma.'
    },
    {
      id: 'greeting',
      label: 'Grußformel modern',
      status: usesModernGreeting ? 'ok' : 'warn',
      message: usesModernGreeting
        ? '„Freundliche Grüße“ ist die aktuelle Empfehlung.'
        : usesClassicGreeting
          ? '„Mit freundlichen Grüßen“ ist korrekt, aber setze gern auf „Freundliche Grüße“.'
          : hasAnyGreeting
            ? 'Nutze eine Grußformel wie „Freundliche Grüße“.'
            : 'Trage eine Grußformel ein (z. B. „Freundliche Grüße“).'
    },
    {
      id: 'closingCompany',
      label: 'Firmenname im Briefschluss',
      status: closingCompanyValid ? 'ok' : 'warn',
      message: closingCompanyValid ? 'Firmenname steht über der Grußformel.' : 'Trage deine Firma oberhalb der Grußformel ein.'
    },
    {
      id: 'signature',
      label: 'i. A. + Vor- und Nachname',
      status: signatureHasIA && signatureHasName && signatureMultiline ? 'ok' : 'warn',
      message: signatureHasIA && signatureHasName && signatureMultiline
        ? 'Name und Funktionszeile vorhanden.'
        : 'Nutze „i. A.“ plus Vor- & Nachname in eigener Zeile.'
    },
    {
      id: 'closingSpacing',
      label: 'Leerzeile zwischen Gruß & Signatur',
      status: closingSpacing ? 'ok' : 'warn',
      message: closingSpacing ? 'Mindestens eine Leerzeile eingeplant.' : 'Füge eine Leerzeile zwischen Grußformel und i. A. ein.'
    },
    {
      id: 'attachments',
      label: 'Anlage korrekt benannt',
      status: attachmentsOk ? 'ok' : 'warn',
      message: attachmentsOk ? 'Anlage passt oder entfällt.' : 'Beginne mit „Anlage:“ oder lasse das Feld leer.'
    }
  ];
}

function LetterPreview({
  fields,
  previewRef,
  onDownloadPdf,
  isExportingPdf,
  onInfoFieldChange,
  onRecipientAdditionChange,
  onRecipientLineChange,
  onRecipientTypeChange,
  onFieldChange
}: {
  fields: LetterFields;
  previewRef: RefObject<HTMLDivElement | null>;
  onDownloadPdf: () => void;
  isExportingPdf: boolean;
  onInfoFieldChange: (key: keyof InfoBlockFields, value: string) => void;
  onRecipientAdditionChange: (index: number, value: string) => void;
  onRecipientLineChange: (index: number, value: string) => void;
  onRecipientTypeChange: (type: 'business' | 'private') => void;
  onFieldChange: (key: keyof LetterFields, value: string) => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">Live-Vorschau</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">nicht maßstabsgetreu</span>
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isExportingPdf}
            className="text-xs font-semibold rounded-full border border-blue-500 px-3 py-1 text-blue-600 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExportingPdf ? 'PDF wird erstellt …' : 'PDF herunterladen'}
          </button>
        </div>
      </div>
      <div ref={previewRef} className="border border-slate-200 rounded-3xl p-6 bg-slate-50">
        <div className="grid gap-6 md:grid-cols-[2fr_1fr] text-sm">
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Zusatz- & Vermerkzone</p>
                  <p className="text-[11px] text-slate-400">Zeile 5 – hier gehört deine Absenderadresse hin.</p>
                </div>
                <div className="flex gap-2 text-[11px]">
                  {(['business', 'private'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onRecipientTypeChange(type)}
                      className={`px-3 py-1 rounded-full border ${fields.recipientType === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                    >
                      {type === 'business' ? 'Unternehmen' : 'Privatperson'}
                    </button>
                  ))}
                </div>
              </div>
              <label className="space-y-1 text-[11px] uppercase tracking-widest text-slate-500 block">
                Absenderadresse (eine Zeile)
                {fields.recipientAdditions.map((line, index) => (
                  <input
                    key={`addition-${index}`}
                    type="text"
                    value={line}
                    onChange={event => onRecipientAdditionChange(index, event.target.value)}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-mono tracking-[0.2em] text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none"
                  />
                ))}
              </label>
              <div className="pt-3 border-t border-dashed border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Empfängeradresse</p>
                  <span className="text-[11px] text-slate-400">max. 9 Zeilen</span>
                </div>
                <div className="space-y-1">
                  {fields.recipientLines.map((line, index) => (
                    <input
                      key={`recipient-${index}`}
                      type="text"
                      value={line}
                      onChange={event => onRecipientLineChange(index, event.target.value)}
                      placeholder={`Empfänger Zeile ${index + 1}`}
                      className="w-full rounded-xl border border-transparent bg-transparent px-2 py-1 font-mono text-sm text-slate-800 focus:border-blue-400 focus:bg-white focus:outline-none"
                    />
                  ))}
                </div>
                {recipientTypeGuidance[fields.recipientType].length > 0 && (
                  <ul className="text-[11px] text-slate-500 list-disc pl-4">
                    {recipientTypeGuidance[fields.recipientType].map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="border border-slate-300 rounded-2xl p-4 bg-white text-xs text-slate-700 font-mono">
            <p className="uppercase tracking-widest text-[10px] text-slate-500 mb-2">Infoblock direkt bearbeiten</p>
            <div className="space-y-2">
              {infoBlockFieldMeta.map(field => (
                <label key={field.key} className="flex flex-col gap-1 border-b border-dashed border-slate-200 pb-2 last:border-b-0 last:pb-0">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">{field.label}</span>
                  <input
                    type="text"
                    value={fields.infoBlock[field.key]}
                    onChange={event => onInfoFieldChange(field.key, event.target.value)}
                    className="bg-slate-50 rounded-xl border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="text-right text-slate-600 text-sm mt-6">
          <input
            type="text"
            value={fields.date}
            onChange={event => onFieldChange('date', event.target.value)}
            placeholder="TT.MM.JJJJ"
            className="w-full border border-transparent bg-transparent px-3 py-1 font-mono text-right text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none rounded-xl"
          />
        </div>
        <div className="mt-4">
          <input
            type="text"
            value={fields.subject}
            onChange={event => onFieldChange('subject', event.target.value)}
            placeholder="Thema des Schreibens"
            className="w-full border border-transparent bg-transparent px-3 py-2 text-base font-semibold uppercase tracking-wide text-slate-900 focus:border-blue-400 focus:bg-white focus:outline-none rounded-2xl"
          />
        </div>
        <div className="mt-3">
          <input
            type="text"
            value={fields.salutation}
            onChange={event => onFieldChange('salutation', event.target.value)}
            placeholder="Sehr geehrte Damen und Herren,"
            className="w-full border border-transparent bg-transparent px-3 py-1 text-base text-slate-900 focus:border-blue-400 focus:bg-white focus:outline-none rounded-2xl"
          />
        </div>
        <div className="space-y-4 text-slate-700 mt-4">
          {bodyFieldMeta.map(field => (
            <label key={field.key} className="block space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-slate-400">{field.label}</span>
              <textarea
                value={fields[field.key]}
                onChange={event => onFieldChange(field.key, event.target.value)}
                rows={field.key === 'bodyMain' ? 4 : 3}
                placeholder={field.helper}
                className="w-full border border-transparent bg-transparent px-3 py-2 text-sm leading-relaxed text-slate-800 rounded-2xl resize-none focus:border-blue-400 focus:bg-white focus:outline-none"
              />
            </label>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <label className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold block">
            Firmenname / Absenderorganisation
            <input
              type="text"
              value={fields.closingCompany}
              onChange={event => onFieldChange('closingCompany', event.target.value)}
              placeholder="Unternehmen GmbH"
              className="mt-1 w-full border border-transparent bg-transparent px-3 py-2 text-sm font-semibold text-slate-800 rounded-2xl focus:border-blue-400 focus:bg-white focus:outline-none"
            />
          </label>
          <label className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold block">
            Grußformel
            <input
              type="text"
              value={fields.greeting}
              onChange={event => onFieldChange('greeting', event.target.value)}
              placeholder="Freundliche Grüße"
              className="mt-1 w-full border border-transparent bg-transparent px-3 py-2 text-sm text-slate-800 rounded-2xl focus:border-blue-400 focus:bg-white focus:outline-none"
            />
          </label>
          <label className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold block">
            i. A. + Vor- und Nachname
            <textarea
              value={fields.signature}
              onChange={event => onFieldChange('signature', event.target.value)}
              rows={3}
              placeholder={'i. A. Max Beispiel\nVertrieb'}
              className="mt-1 w-full border border-transparent bg-transparent px-3 py-2 text-sm font-mono whitespace-pre-wrap text-slate-800 rounded-2xl resize-none focus:border-blue-400 focus:bg-white focus:outline-none"
            />
          </label>
        </div>
        <div className="text-slate-600 text-sm border-t border-dashed border-slate-300 pt-3 mt-4">
          <input
            type="text"
            value={fields.attachments}
            onChange={event => onFieldChange('attachments', event.target.value)}
            placeholder="Anlage: Angebotsliste"
            className="w-full border border-transparent bg-transparent px-3 py-2 text-sm text-slate-700 rounded-2xl focus:border-blue-400 focus:bg-white focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function ValidationList({ items, combinedBody, infoBlock }: { items: ValidationItem[]; combinedBody: string; infoBlock: InfoBlockFields }) {
  const textLength = combinedBody.trim().length;
  const infoComplete = Boolean(infoBlock.reference && infoBlock.contactName && infoBlock.infoDate);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Format-Check</h2>
        <span className="text-xs text-slate-500">automatisch geprüft</span>
      </div>
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="flex items-start gap-3 text-sm">
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div>
              <p className="font-semibold">{item.label}</p>
              <p className="text-slate-500 text-xs">{item.message}</p>
            </div>
          </li>
        ))}
        <li className="flex items-start gap-3 text-sm">
          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${infoComplete ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <div>
            <p className="font-semibold">Infoblock vollständig</p>
            <p className="text-slate-500 text-xs">Pflichtfelder „Ihr Zeichen“, Ansprechpartner und Datum sollten gesetzt sein.</p>
          </div>
        </li>
      </ul>
      <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
        <p><strong>Textumfang:</strong> {textLength} Zeichen</p>
        <p><strong>Leerzeilen:</strong> 2 vor Betreff · 2 nach Betreff · 1 nach Anrede · 3 vor Unterschrift</p>
      </div>
    </div>
  );
}

function SpacingCoach() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section className="bg-white rounded-3xl border border-slate-200">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <div>
          <h2 className="text-lg font-bold">Abstände & Leerzeilen</h2>
          <p className="text-sm text-slate-500">Tipps erst einblenden, wenn du sie brauchst.</p>
        </div>
        <span className="text-xl text-slate-500">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Fenster DIN lang</p>
            <span className="text-xs text-slate-500">2 × vor Betreff · 2 × nach Betreff</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {spacingHints.map(hint => (
              <div key={hint.title} className="rounded-2xl border border-dashed border-slate-200 p-3 bg-slate-50">
                <p className="text-xs uppercase tracking-widest text-slate-500">{hint.title}</p>
                <p className="text-sm text-slate-700 mt-1">{hint.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function buildPdfFileName(subject: string) {
  const base = subject?.trim() || 'Geschaeftsbrief';
  const simplified = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${simplified || 'geschaeftsbrief'}.pdf`;
}
