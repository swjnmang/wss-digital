import React from 'react'
import { Link } from 'react-router-dom'

export default function Anwendungsaufgaben() {
  const aufgaben = [
    { title: '1. Der Fußballplatz', desc: 'Löse Aufgaben rund um einen Pass auf einem Fußballfeld mit linearen Funktionen.', href: 'fussballplatz' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Anwendungsaufgaben - Lineare Funktionen</h1>
        <p className="text-lg text-blue-800">Wähle eine Aufgabe aus der folgenden Liste aus.</p>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center">
        {aufgaben.map((a) => (
          <Link
            key={a.title}
            to={`/lineare_funktionen/anwendungsaufgaben/${a.href}`}
            className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col justify-center items-center p-6 hover:shadow-xl transition-shadow no-underline text-inherit text-center max-w-sm"
          >
            <h3 className="text-lg font-semibold mb-2 text-blue-900">{a.title}</h3>
            <p className="text-base text-gray-700">{a.desc}</p>
          </Link>
        ))}
      </main>
    </div>
  )
}
