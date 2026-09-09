import { jsPDF } from 'jspdf';
import { formatDuration, summarizeResults, type SessionRecord } from './session';

const PAGE_MARGIN = 15;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

// jsPDF's base-14 fonts (helvetica) only support WinAnsi/Latin-1. Emoji and
// symbol glyphs (✅ ❌ 🎉 etc.) aren't in that encoding and corrupt the glyph
// metrics jsPDF uses for line wrapping, so text after them renders with wrong
// spacing and runs off the page. Strip them and use plain ASCII markers instead.
function sanitizeForPdf(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}✅❌✓✗]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function generateReportPdf(session: SessionRecord) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = PAGE_MARGIN;

  const ensureSpace = (needed: number) => {
    if (y + needed > 297 - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
  };

  const writeWrapped = (text: string, x: number, maxWidth: number, lineHeight = 5) => {
    const lines = doc.splitTextToSize(sanitizeForPdf(text), maxWidth);
    ensureSpace(lines.length * lineHeight);
    doc.text(lines, x, y);
    y += lines.length * lineHeight;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Excel-Trainer - Arbeitsnachweis', PAGE_MARGIN, y);
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
    doc.text(sanitizeForPdf(line), PAGE_MARGIN, y);
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
    doc.text(sanitizeForPdf(`Aufgabe: ${task.taskTitle}`), PAGE_MARGIN, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Bearbeitungszeit: ${formatDuration(task.timeSpentMs)}`, PAGE_MARGIN, y);
    y += 5;
    doc.text(`Pruefversuche: ${task.attempts}`, PAGE_MARGIN, y);
    y += 5;
    doc.text(sanitizeForPdf(`Ergebnis: ${summarizeResults(task.lastResults)}`), PAGE_MARGIN, y);
    y += 6;

    if (task.lastResults) {
      for (const result of task.lastResults) {
        const marker = result.success ? '[OK]' : '[FEHLER]';
        writeWrapped(`${marker} ${result.label}: ${result.message}`, PAGE_MARGIN + 5, CONTENT_WIDTH - 5);
      }
    }
    y += 6;
  }

  const fileName = `Arbeitsnachweis_${session.studentName.replace(/[^a-z0-9]+/gi, '_')}_${dateStr.replace(/\./g, '-')}.pdf`;
  doc.save(fileName);
}
