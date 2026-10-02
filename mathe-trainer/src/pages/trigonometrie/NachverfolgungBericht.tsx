import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    getEntryPoints,
    getTrackingLog,
    getTrackingScore,
    getTrackingStartedAt,
    stopTrackingSession,
    TRACKING_AREAS,
    TrackingArea,
    TrackingEntry
} from '../../utils/tracking';

const formatPoints = (points: number) =>
    (Number.isInteger(points) ? String(points) : points.toFixed(1)).replace('.', ',');

const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

const getStatusText = (entry: TrackingEntry) => {
    if (entry.attempts === 0) return 'nicht bearbeitet';
    if (entry.solved) return entry.attempts === 1 ? 'sofort richtig' : `richtig nach ${entry.attempts} Versuchen`;
    return `nicht gelöst (${entry.attempts} Versuch${entry.attempts === 1 ? '' : 'e'})`;
};

const getHelpText = (entry: TrackingEntry) => {
    if (entry.helpUsed === 'hint') return 'Tipp genutzt';
    if (entry.helpUsed === 'solution') return 'Musterlösung direkt angeschaut';
    if (entry.solved) return 'Ohne Hilfe gelöst';
    return '-';
};

// Standard-Schriften von jsPDF kennen nur Latin-1; andere Zeichen werden ersetzt.
const sanitizeForPdf = (text: string) =>
    text
        .replace(/[–—]/g, '-')
        .replace(/α/g, 'alpha')
        .replace(/β/g, 'beta')
        .replace(/γ/g, 'gamma')
        .replace(/·/g, '*')
        .replace(/≈/g, 'ca.')
        .replace(/[^\x20-\xFF]/g, '');

const createReportPdf = (
    name: string,
    klasse: string,
    areaTitle: string,
    log: TrackingEntry[],
    startedAt: number | null
) => {
    const { points, maxPoints, percent } = getTrackingScore(log);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin + 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Name: ${sanitizeForPdf(name)}`, margin, y);
    doc.text(`Klasse: ${sanitizeForPdf(klasse)}`, pageWidth - margin, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(120, 120, 120);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(18);
    doc.text(sanitizeForPdf(`Nachverfolgung - ${areaTitle}`), pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Mathe-Trainer | WSS-Digital', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(11);
    if (startedAt) {
        doc.text(`Sitzung gestartet am ${formatDateTime(startedAt)}`, margin, y);
        y += 6;
    }
    doc.text(`Bericht erstellt am ${formatDateTime(Date.now())}`, margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(
        `Gesamtpunktzahl: ${formatPoints(points)} / ${maxPoints} Punkte (${percent.toFixed(0)} % erreicht)`,
        margin,
        y
    );
    y += 6;

    autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Nr.', 'Thema', 'Ergebnis', 'Hilfe', 'Punkte']],
        body: log.map((entry, index) => [
            String(index + 1),
            sanitizeForPdf(entry.topic),
            sanitizeForPdf(getStatusText(entry)),
            sanitizeForPdf(getHelpText(entry)),
            formatPoints(getEntryPoints(entry))
        ]),
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [17, 94, 89] },
        columnStyles: { 0: { halign: 'center', cellWidth: 12 }, 4: { halign: 'right', cellWidth: 18 } }
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text(`Seite ${i} von ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    const safe = (text: string) => text.trim().replace(/[^a-zA-Z0-9äöüÄÖÜß_-]+/g, '_');
    doc.save(`Nachverfolgung_${safe(areaTitle)}_${safe(name)}_${safe(klasse)}.pdf`);
};

const NachverfolgungBericht: React.FC<{ area?: TrackingArea }> = ({ area = 'trigonometrie' }) => {
    const areaInfo = TRACKING_AREAS.find((a) => a.area === area)!;
    // Alte Einträge ohne Bereich stammen aus der Trigonometrie.
    const readLog = () => getTrackingLog().filter((e) => (e.area ?? 'trigonometrie') === area);
    const [log, setLog] = useState(readLog);

    // Beim Öffnen des Berichts wird die Sitzung beendet. Die Effekt-Aufräumfunktionen der
    // verlassenen Übungsseite laufen davor und haben offene Aufgaben bereits geloggt.
    useEffect(() => {
        stopTrackingSession();
        setLog(readLog());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const startedAt = getTrackingStartedAt();
    const { points, maxPoints, percent } = getTrackingScore(log);

    // Name und Klasse landen nur im PDF und werden nirgends gespeichert.
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [klasse, setKlasse] = useState('');
    const canCreatePdf = name.trim() !== '' && klasse.trim() !== '';

    const handleCreatePdf = (event: React.FormEvent) => {
        event.preventDefault();
        if (!canCreatePdf) return;
        createReportPdf(name.trim(), klasse.trim(), areaInfo.title, log, startedAt);
        setPdfDialogOpen(false);
    };

    return (
        <div className="mx-auto px-4 py-8 max-w-6xl">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-teal-800">Deine Nachverfolgung – {areaInfo.title}</h1>
                    {startedAt && <p className="text-sm text-gray-500">Sitzung gestartet am {formatDateTime(startedAt)}</p>}
                    <p className="text-sm text-gray-600 max-w-xl mx-auto">
                        Diese Daten bleiben ausschließlich in deinem Browser gespeichert. Es werden keine Namen oder Klassen
                        erfasst und nichts an einen Server übertragen.
                    </p>
                </div>

                {log.length === 0 ? (
                    <p className="text-center text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-6">
                        Noch keine Aufgaben bearbeitet.
                    </p>
                ) : (
                    <>
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 text-center space-y-1">
                        <p className="text-sm font-semibold text-teal-800 uppercase tracking-wide">Gesamtpunktzahl</p>
                        <p className="text-3xl font-bold text-teal-900">
                            {formatPoints(points)} / {maxPoints} Punkte
                        </p>
                        <p className="text-sm text-teal-700">{percent.toFixed(0)} % erreicht</p>
                    </div>
                    <div className="space-y-3">
                        {log.map((entry, index) => {
                            const untouched = entry.attempts === 0;
                            const statusIcon = untouched ? '⏸️' : entry.solved ? (entry.attempts === 1 ? '✅' : '⚠️') : '❌';
                            const statusText = getStatusText(entry);
                            return (
                                <div
                                    key={`${entry.timestamp}-${index}`}
                                    className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{statusIcon}</span>
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                Aufgabe {index + 1} – {entry.topic}
                                            </p>
                                            <p className="text-sm text-gray-600">{statusText}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold bg-slate-100 text-slate-700 rounded-full px-3 py-1">
                                            +{formatPoints(getEntryPoints(entry))} Punkte
                                        </span>
                                        {entry.helpUsed === 'hint' && (
                                            <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full px-3 py-1">
                                                💡 Tipp genutzt
                                            </span>
                                        )}
                                        {entry.helpUsed === 'solution' && (
                                            <span className="text-xs font-semibold bg-orange-100 text-orange-800 rounded-full px-3 py-1">
                                                📖 Musterlösung direkt angeschaut
                                            </span>
                                        )}
                                        {entry.helpUsed === 'none' && entry.solved && (
                                            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full px-3 py-1">
                                                🧠 Ohne Hilfe gelöst
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => setPdfDialogOpen(true)}
                            className="bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg px-5 py-2.5 shadow"
                        >
                            <i className="fa-solid fa-file-pdf mr-2"></i>
                            Bericht als PDF herunterladen
                        </button>
                    </div>
                    </>
                )}

                {pdfDialogOpen && (
                    <div
                        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pdf-dialog-title"
                    >
                        <form onSubmit={handleCreatePdf} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
                            <h2 id="pdf-dialog-title" className="text-xl font-bold text-teal-800">
                                PDF erstellen
                            </h2>
                            <p className="text-sm text-gray-600">
                                Name und Klasse erscheinen oben im PDF. Sie werden nicht gespeichert und nicht übertragen.
                            </p>
                            <label className="block">
                                <span className="text-sm font-semibold text-gray-700">Name</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Vor- und Nachname"
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                    required
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold text-gray-700">Klasse</span>
                                <input
                                    type="text"
                                    value={klasse}
                                    onChange={(e) => setKlasse(e.target.value)}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="z. B. 10a"
                                    required
                                />
                            </label>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setPdfDialogOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    disabled={!canCreatePdf}
                                    className="px-4 py-2 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    PDF herunterladen
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="flex justify-center">
                    <Link to={areaInfo.path} className="text-[var(--accent)] hover:underline text-sm sm:text-base">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Zurück zur Übersicht
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NachverfolgungBericht;
