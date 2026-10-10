import React from 'react';
import TaskShell from '../../../components/layout/TaskShell'

export default function Zusammenfassen() {
  return (
    <TaskShell title="Terme zusammenfassen" width="narrow">
    <div className="flex flex-col">
      <div className="flex flex-col items-center w-full">
        <div className="bk-panel w-full max-w-5xl flex flex-col items-center">
          <p className="text-gray-700 mb-4 text-center text-lg md:text-xl">Hier kannst du Aufgaben zum Zusammenfassen von Termen lösen. (Platzhalter)</p>
          {/* Aufgaben Grid - bereit für 3-Spalten Layout */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full mt-6">
            {/* Aufgaben werden hier eingefügt */}
          </div>
        </div>
      </div>
    </div>
    </TaskShell>
  );
}
