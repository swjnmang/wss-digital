import type { IDocumentData } from '@univerjs/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toExportDocument } from './model';
import { renderPages } from './render-html';
import type { runLayoutChecks } from './tasks';
import type { LayoutTask } from './types';

export interface StudentInfo {
  name: string;
  klasse: string;
}

type Results = ReturnType<typeof runLayoutChecks>;

const MARGIN = 18;
const PAGE_W = 210;
const PAGE_H = 297;

// Standardschrift von jsPDF kennt nur Latin-1 – Sonderzeichen ersetzen
const latin1 = (text: string) =>
  text
    .replace(/[„“”]/g, '"')
    .replace(/[‚‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/→/g, '->')
    .replace(/≈/g, 'ca.')
    .replace(/[^ -ÿ]/g, '');

function coverPage(pdf: jsPDF, task: LayoutTask, results: Results, student: StudentInfo) {
  let y = MARGIN + 4;
  const line = (text: string, size = 11, style: 'normal' | 'bold' = 'normal', gap = 6, x = MARGIN) => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(latin1(text), PAGE_W - x - MARGIN);
    if (y + lines.length * gap > PAGE_H - MARGIN) {
      pdf.addPage();
      y = MARGIN;
    }
    pdf.text(lines, x, y);
    y += lines.length * gap;
  };

  const all = results.flatMap((s) => s.results);
  const done = all.filter((r) => r.success).length;
  const now = new Date();

  line('Arbeitsnachweis - Layouten mit Word', 18, 'bold', 9);
  pdf.setDrawColor(180);
  pdf.line(MARGIN, y - 3, PAGE_W - MARGIN, y - 3);
  y += 4;
  line(`Name: ${student.name || '-'}`);
  line(`Klasse: ${student.klasse || '-'}`);
  line(`Erstellt am: ${now.toLocaleDateString('de-DE')} um ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`);
  line(`Aufgabe: ${task.title}`);
  y += 2;

  // Ergebnisbalken
  const pct = all.length > 0 ? done / all.length : 0;
  pdf.setFillColor(230, 230, 230);
  pdf.rect(MARGIN, y, PAGE_W - 2 * MARGIN, 6, 'F');
  pdf.setFillColor(pct === 1 ? 34 : 37, pct === 1 ? 160 : 99, pct === 1 ? 80 : 235);
  pdf.rect(MARGIN, y, (PAGE_W - 2 * MARGIN) * pct, 6, 'F');
  y += 12;
  line(`Ergebnis der automatischen Prüfung: ${done} von ${all.length} Vorgaben erfüllt (${Math.round(pct * 100)} %)`, 12, 'bold', 6);
  line('Auf den folgenden Seiten steht das gestaltete Dokument. Die Darstellung im PDF kann leicht vom Editor abweichen; maßgeblich ist die Word-Datei.', 9, 'normal', 4.5);
  y += 3;

  for (const { step, results: stepResults } of results) {
    line(step.title, 10.5, 'bold', 5);
    for (const { check, success } of stepResults) {
      pdf.setTextColor(success ? 22 : 185, success ? 128 : 28, success ? 61 : 28);
      line(`${success ? '[OK]' : '[offen]'}  ${check.label}`, 9.5, 'normal', 4.6, MARGIN + 4);
      pdf.setTextColor(0, 0, 0);
    }
    y += 1.5;
  }
}

/** PDF-Arbeitsnachweis: Deckblatt mit Prüfergebnis + gestaltetes Dokument. */
export async function exportPdf(data: IDocumentData, task: LayoutTask, results: Results, student: StudentInfo): Promise<Blob> {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  coverPage(pdf, task, results, student);

  const host = document.createElement('div');
  Object.assign(host.style, { position: 'fixed', left: '-20000px', top: '0', zIndex: '-1' });
  document.body.appendChild(host);
  // Tailwind setzt img auf display:block. html2canvas misst die Schrift-Grundlinie mit einem img im
  // Hauptdokument und zeichnet Text dann zu tief – für die Dauer des Exports zurücksetzen.
  const baselineFix = document.createElement('style');
  baselineFix.textContent = 'img { display: inline !important; vertical-align: baseline !important; }';
  document.head.appendChild(baselineFix);
  try {
    const pages = renderPages(toExportDocument(data), host);
    for (const page of pages) {
      const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#ffffff', logging: false });
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, PAGE_W, PAGE_H);
    }
  } finally {
    host.remove();
    baselineFix.remove();
  }
  return pdf.output('blob');
}
