import React from 'react';

export default function Zusammenfassen() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 text-center">Terme zusammenfassen</h1>
          <p className="text-gray-700 mb-4 text-center text-lg md:text-xl">Hier kannst du Aufgaben zum Zusammenfassen von Termen lösen. (Platzhalter)</p>
        </div>
      </div>
    </div>
  );
}
