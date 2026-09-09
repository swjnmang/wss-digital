import { jsPDF } from 'jspdf';
import { formatDuration, summarizeResults, type SessionRecord } from './session';

const PAGE_MARGIN = 15;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

export function generateReportPdf(session: SessionRecord) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = PAGE_MARGIN;

  const ensureSpace = (needed: number) => {
    if (y + needed > 297 - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Excel-Trainer – Arbeitsnachweis', PAGE_MARGIN, y);
  y += 10;

  const totalMs = session.endedAt - session.startedAt;
  const dateStr = new Date(session.endedAt).toLocaleDateString('de-DE');
  const timeStr = new Date(session.endedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const meta = [
    `Name: ${session.studentName}`,
    `Datum: ${dateStr}, ${timeStr} Uhr`,
    `Gesamte Bearbeitungszeit: ${formatDuration(totalMs)}`,
  ];
  for (const line of meta) {
    doc.text(line, PAGE_MARGIN, y);
    y += 6;
  }
  y += 4;
  doc.setDrawColor(200);
  doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);
  y += 8;

  for (const task of session.taskLogs) {
    ensureSpace(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`Aufgabe: ${task.taskTitle}`, PAGE_MARGIN, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Bearbeitungszeit: ${formatDuration(task.timeSpentMs)}`, PAGE_MARGIN, y);
    y += 5;
    doc.text(`Prüfversuche: ${task.attempts}`, PAGE_MARGIN, y);
    y += 5;
    doc.text(`Ergebnis: ${summarizeResults(task.lastResults)}`, PAGE_MARGIN, y);
    y += 6;

    if (task.lastResults) {
      for (const result of task.lastResults) {
        ensureSpace(10);
        const icon = result.success ? '✓' : '✗';
        const lines = doc.splitTextToSize(`${icon} ${result.label}: ${result.message}`, CONTENT_WIDTH - 5);
        doc.text(lines, PAGE_MARGIN + 5, y);
        y += lines.length * 5;
      }
    }
    y += 6;
  }

  const fileName = `Arbeitsnachweis_${session.studentName.replace(/[^a-z0-9]+/gi, '_')}_${dateStr.replace(/\./g, '-')}.pdf`;
  doc.save(fileName);
}
