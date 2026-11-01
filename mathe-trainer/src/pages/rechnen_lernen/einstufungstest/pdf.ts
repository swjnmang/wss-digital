// PDF der Auswertung zum Einstufungstest (jsPDF + autotable, Standardschrift Helvetica).
// Helvetica kennt nur den WinAnsi-Zeichensatz: Sonderzeichen wie √, −, ⁴ werden vorher in Text umgeschrieben.
import type { TestStand } from './Einstufungstest'
import { AMPEL_TEXT, BEREICHE, DAUER_MINUTEN, istRichtig, texZuText, werteAus, type Ampel, type TestAufgabe } from './aufgaben'

const BASIS_URL = 'ws-mathe-trainer.vercel.app'
const HOCH: Record<string, string> = { '⁰': '0', '¹': '1', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '²': '2', '³': '3' }

/** Text für Helvetica (WinAnsi) lesbar machen */
export function pdfText(s: string): string {
  return s
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => (m === '²' || m === '³' ? m : '^' + m.split('').map((c) => HOCH[c]).join('')))
    .replace(/[−–]/g, '-')
    .replace(/∛/g, '3.Wurzel')
    .replace(/√/g, 'Wurzel')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/[“”„]/g, '"')
    .replace(/[^\x20-\x7E -ÿ€]/g, '')
}

const AMPEL_FARBE: Record<Ampel, [number, number, number]> = {
  gruen: [47, 158, 91],
  gelb: [242, 183, 5],
  rot: [214, 69, 69],
}

function aufgabeText(a: TestAufgabe): string {
  const teile = [a.frage]
  if (a.text) teile.push(a.text)
  if (a.tex) teile.push(texZuText(a.tex))
  return pdfText(teile.join('  '))
}

const mmText = (ms: number) => `${Math.floor(ms / 60000)} min ${Math.round((ms % 60000) / 1000)} s`

export async function ladePdf(stand: TestStand): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const breite = doc.internal.pageSize.getWidth()
  const hoehe = doc.internal.pageSize.getHeight()
  const rand = 15
  const auswertung = werteAus(stand.aufgaben, stand.antworten)
  const prozent = auswertung.gesamt ? Math.round((auswertung.richtig / auswertung.gesamt) * 100) : 0
  const datum = new Date(stand.start).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  let y = 20
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Einstufungstest "Rechnen lernen"', rand, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Mathe-Trainer · ${BASIS_URL}`, rand, y)
  doc.setTextColor(0)
  y += 10

  doc.setFontSize(11)
  const zeilen: [string, string][] = [
    ['Name:', pdfText(stand.name)],
    ['Datum:', datum],
    ['Bearbeitungszeit:', `${mmText(stand.ende - stand.start)} (von ${DAUER_MINUTEN} min)${stand.zeitAbgelaufen ? ' - Zeit abgelaufen' : ''}`],
    ['Ergebnis:', `${auswertung.richtig} von ${auswertung.gesamt} Aufgaben richtig (${prozent} %)`],
  ]
  for (const [k, v] of zeilen) {
    doc.setFont('helvetica', 'bold')
    doc.text(k, rand, y)
    doc.setFont('helvetica', 'normal')
    doc.text(v, rand + 38, y)
    y += 6
  }
  y += 4

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Ergebnis je Bereich', rand, y)
  y += 3

  autoTable(doc, {
    startY: y,
    margin: { left: rand, right: rand },
    head: [['', 'Bereich', 'Richtig', 'Einschätzung', 'Hier üben']],
    body: auswertung.bereiche.map((b) => [
      '',
      b.bereich.name,
      `${b.richtig} / ${b.gesamt}`,
      AMPEL_TEXT[b.ampel],
      b.bereich.links.map((l) => `${l.label}: ${BASIS_URL}${l.to}`).join('\n'),
    ]),
    styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 2, valign: 'middle' },
    headStyles: { fillColor: [29, 63, 158] },
    columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 32, fontStyle: 'bold' }, 2: { cellWidth: 16, halign: 'center' }, 3: { cellWidth: 30 } },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 0) return
      const ampel = auswertung.bereiche[data.row.index].ampel
      doc.setFillColor(...AMPEL_FARBE[ampel])
      doc.circle(data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, 2.2, 'F')
    },
  })
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(90)
  doc.text('Grün: ab 75 % richtig · Gelb: 50 bis 74 % · Rot: unter 50 %', rand, y)
  doc.setTextColor(0)
  y += 9

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Alle Aufgaben', rand, y)
  y += 3

  let nr = 0
  const zeilenAufgaben = BEREICHE.flatMap((b) =>
    stand.aufgaben
      .filter((a) => a.bereich === b.id)
      .map((a) => {
        nr += 1
        const antwort = (stand.antworten[a.id] ?? '').trim()
        const ok = istRichtig(a, antwort)
        return [String(nr), b.name, aufgabeText(a), pdfText(antwort || '-'), pdfText(a.feld.loesung), ok ? 'richtig' : 'falsch']
      }),
  )
  autoTable(doc, {
    startY: y,
    margin: { left: rand, right: rand },
    head: [['Nr.', 'Bereich', 'Aufgabe', 'Deine Antwort', 'Lösung', '']],
    body: zeilenAufgaben,
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 1.6, valign: 'top' },
    headStyles: { fillColor: [29, 63, 158] },
    columnStyles: { 0: { cellWidth: 9, halign: 'center' }, 1: { cellWidth: 24 }, 3: { cellWidth: 27 }, 4: { cellWidth: 27 }, 5: { cellWidth: 15 } },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const ok = data.cell.raw === 'richtig'
        data.cell.styles.textColor = ok ? [30, 107, 61] : [163, 45, 45]
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const seiten = doc.getNumberOfPages()
  for (let i = 1; i <= seiten; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(`Einstufungstest ${pdfText(stand.name)} · Seite ${i} von ${seiten}`, breite / 2, hoehe - 8, { align: 'center' })
  }

  const sicher = (t: string) => t.trim().replace(/[^a-zA-Z0-9äöüÄÖÜß_-]+/g, '_')
  const tag = new Date(stand.start).toISOString().slice(0, 10)
  doc.save(`Einstufungstest_${sicher(stand.name)}_${tag}.pdf`)
}
