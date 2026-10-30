import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// A4 bei 96 dpi
const PAGE_W = 794;
const PAGE_H = 1123;

/**
 * Wandelt das Druckblatt (siehe AuftragDruckblatt) in ein PDF um.
 * Seitenumbrüche werden nur zwischen Blöcken ([data-block]) gesetzt, damit kein Arbeitsschritt zerschnitten wird.
 * Liefert die Anzahl der erzeugten Seiten zurück.
 */
export async function druckblattAlsPdf(sheet: HTMLElement, pad: number, dateiname: string): Promise<number> {
  // Bilder müssen geladen sein, sonst fehlen sie im Canvas
  await Promise.all(
    Array.from(sheet.querySelectorAll('img')).map((img) =>
      img.complete ? Promise.resolve() : new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r(); }),
    ),
  );

  const scale = 2;
  const canvas = await html2canvas(sheet, { scale, backgroundColor: '#ffffff', useCORS: true });
  const sheetTop = sheet.getBoundingClientRect().top;
  const blocks = Array.from(sheet.querySelectorAll<HTMLElement>('[data-block]')).map((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top - sheetTop, bottom: r.bottom - sheetTop, row: el.parentElement?.parentElement === sheet ? false : true };
  });
  const contentEnd = sheet.scrollHeight - pad;
  const usable = PAGE_H - 2 * pad;

  // Seitengrenzen bestimmen
  const pages: { from: number; to: number; tableCont: boolean }[] = [];
  let start = pad;
  while (start < contentEnd - 1) {
    let end = start;
    for (const b of blocks) if (b.top >= start - 1 && b.bottom <= start + usable) end = Math.max(end, b.bottom);
    if (end <= start) end = Math.min(start + usable, contentEnd); // Notfall: Block größer als eine Seite
    const next = blocks.find((b) => b.top >= end - 1);
    pages.push({ from: start, to: end + 1, tableCont: pages.length > 0 && !!next });
    start = next ? next.top : contentEnd;
    if (!next) break;
  }

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  pages.forEach((p, i) => {
    const page = document.createElement('canvas');
    page.width = PAGE_W * scale;
    page.height = PAGE_H * scale;
    const ctx = page.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, page.width, page.height);
    const h = p.to - p.from;
    ctx.drawImage(canvas, 0, p.from * scale, canvas.width, h * scale, 0, pad * scale, page.width, h * scale);
    if (i > 0) {
      // obere Tabellenlinie auf Folgeseiten ergänzen
      ctx.fillStyle = '#000';
      ctx.fillRect(pad * scale, pad * scale - scale, (PAGE_W - 2 * pad) * scale, scale);
    }
    if (i > 0) pdf.addPage();
    pdf.addImage(page.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
  });
  pdf.save(dateiname);
  return pages.length;
}
