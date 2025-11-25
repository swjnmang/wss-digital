import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Baumdiagramme: React.FC = () => {
  const [kugeln, setKugeln] = useState({ rot: 0, blau: 0 });
  const [aufgabe, setAufgabe] = useState("");
  const [ereignis, setEreignis] = useState("");
  const [richtigeAntwort, setRichtigeAntwort] = useState("");
  const [userAntwort, setUserAntwort] = useState("");
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });

  const generiereAufgabe = () => {
    const rot = Math.floor(Math.random() * 3) + 1;
    const blau = Math.floor(Math.random() * 3) + 1;
    setKugeln({ rot, blau });

    const gesamt = rot + blau;
    const pRot = rot / gesamt;
    const pBlau = blau / gesamt;

    setAufgabe(`In einer Urne befinden sich ${rot} rote und ${blau} blaue Kugeln. Es wird zweimal mit Zurücklegen gezogen.`);
    setEreignis("mindestens einmal rot");

    // P(mindestens einmal rot) = 1 - P(beide blau)
    const pBeideBlau = pBlau * pBlau;
    const pMind1Rot = 1 - pBeideBlau;

    // Convert to fraction string
    const nenner = gesamt * gesamt;
    const zaehler = nenner - (blau * blau);
    
    setRichtigeAntwort(kuerzeBruch(zaehler, nenner));
    setFeedback({ type: null, message: "" });
    setUserAntwort("");
  };

  const kuerzeBruch = (zaehler: number, nenner: number): string => {
    const ggt = (a: number, b: number): number => b === 0 ? a : ggt(b, a % b);
    const teiler = ggt(zaehler, nenner);
    return `${zaehler / teiler}/${nenner / teiler}`;
  };

  const pruefen = () => {
    if (userAntwort.trim() === richtigeAntwort) {
      setFeedback({ type: 'success', message: "Richtig! Sehr gut gemacht." });
    } else {
      setFeedback({ type: 'error', message: `Leider falsch. Die richtige Antwort ist ${richtigeAntwort}.` });
    }
  };

  useEffect(() => {
    generiereAufgabe();
  }, []);

  const gesamt = kugeln.rot + kugeln.blau;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Link to="/daten-und-zufall" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zur Übersicht
      </Link>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Wahrscheinlichkeiten mit Baumdiagrammen</h2>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-lg">{aufgabe}</p>
          
          <div className="flex justify-center my-6 overflow-x-auto">
            {gesamt > 0 && (
              <svg width="400" height="180" viewBox="0 0 400 180" className="bg-slate-50 rounded border border-slate-200">
                <text x="10" y="20" fontFamily="Inter, sans-serif" fontSize="14">Start</text>
                
                {/* First level branches */}
                <line x1="20" y1="25" x2="100" y2="50" stroke="black" />
                <line x1="20" y1="25" x2="100" y2="100" stroke="black" />
                
                {/* First level labels */}
                <text x="100" y="45" fontFamily="Inter, sans-serif" fontSize="12">rot ({kugeln.rot}/{gesamt})</text>
                <text x="100" y="95" fontFamily="Inter, sans-serif" fontSize="12">blau ({kugeln.blau}/{gesamt})</text>
                
                {/* Second level branches (top) */}
                <line x1="100" y1="50" x2="200" y2="30" stroke="black" />
                <line x1="100" y1="50" x2="200" y2="70" stroke="black" />
                
                {/* Second level branches (bottom) */}
                <line x1="100" y1="100" x2="200" y2="110" stroke="black" />
                <line x1="100" y1="100" x2="200" y2="150" stroke="black" />
                
                {/* Second level labels */}
                <text x="200" y="25" fontFamily="Inter, sans-serif" fontSize="12">rot</text>
                <text x="200" y="65" fontFamily="Inter, sans-serif" fontSize="12">blau</text>
                <text x="200" y="105" fontFamily="Inter, sans-serif" fontSize="12">rot</text>
                <text x="200" y="145" fontFamily="Inter, sans-serif" fontSize="12">blau</text>
              </svg>
            )}
          </div>

          <p>Wie groß ist die Wahrscheinlichkeit für das Ereignis: <b>{ereignis}</b>?</p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="antwort" className="font-medium text-gray-700">Antwort (z.B. 3/16):</label>
              <input 
                id="antwort" 
                value={userAntwort} 
                onChange={(e) => setUserAntwort(e.target.value)} 
                className="w-32 text-center p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="z.B. 3/16"
              />
            </div>
            <button 
              onClick={pruefen}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Antwort prüfen
            </button>
          </div>

          {feedback.message && (
            <div className={`p-4 rounded-md flex items-start ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {feedback.type === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5 mr-2" /> : <XCircle className="h-5 w-5 mt-0.5 mr-2" />}
              <div className="font-medium">
                {feedback.message}
              </div>
            </div>
          )}

          <button 
            onClick={generiereAufgabe} 
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Neue Aufgabe generieren
          </button>
        </div>
      </div>
    </div>
  );
};

export default Baumdiagramme;
