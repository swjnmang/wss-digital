import React from 'react';
import { Link } from 'react-router-dom';
import { getTrackingLog, getTrackingStartedAt } from '../../utils/tracking';

const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

const NachverfolgungBericht: React.FC = () => {
    const log = getTrackingLog();
    const startedAt = getTrackingStartedAt();

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-teal-800">Deine Nachverfolgung – Trigonometrie</h1>
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
                    <div className="space-y-3">
                        {log.map((entry, index) => {
                            const statusIcon = entry.solved ? (entry.attempts === 1 ? '✅' : '⚠️') : '❌';
                            const statusText = entry.solved
                                ? entry.attempts === 1
                                    ? 'sofort richtig'
                                    : `richtig nach ${entry.attempts} Versuchen`
                                : `nicht gelöst (${entry.attempts} Versuch${entry.attempts === 1 ? '' : 'e'})`;
                            return (
                                <div
                                    key={`${entry.timestamp}-${index}`}
                                    className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
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
                                    {entry.hintUsed && (
                                        <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full px-3 py-1">
                                            💡 Tipp genutzt
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-center">
                    <Link to="/trigonometrie" className="text-[var(--accent)] hover:underline text-sm sm:text-base">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Zurück zur Übersicht
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NachverfolgungBericht;
