import React, { useState } from 'react';
import { ChevronDown, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';

interface ValidationResult {
  success: boolean;
  message: string;
  type: 'correct' | 'error' | 'hint';
  results?: any[];
}

interface TaskPanelProps {
  title: string;
  description: string;
  instruction: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  onCheck: () => ValidationResult;
  validationResult?: ValidationResult | null;
  hint?: string;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({
  title,
  description,
  instruction,
  difficulty,
  onCheck,
  validationResult,
  hint,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [checkResult, setCheckResult] = useState<ValidationResult | null>(validationResult || null);

  const handleCheck = () => {
    const result = onCheck();
    setCheckResult(result);
  };

  const difficultyColor = {
    einfach: 'bg-green-100 text-green-800',
    mittel: 'bg-yellow-100 text-yellow-800',
    schwer: 'bg-red-100 text-red-800',
  };

  return (
    <div className="w-full max-w-sm bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-300 p-6 space-y-4 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor[difficulty]}`}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
      </div>

      <div className="border-t border-gray-300"></div>

      {/* Description */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Aufgabe</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Instruction */}
      <div className="space-y-2 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
        <h3 className="font-semibold text-gray-700">Dein Auftrag</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{instruction}</p>
      </div>

      {/* Hint Button */}
      {hint && (
        <button
          onClick={() => setShowHint(!showHint)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors text-sm font-medium text-amber-900"
        >
          <Lightbulb size={16} />
          Hinweis anzeigen
          <ChevronDown size={16} className={`ml-auto transition-transform ${showHint ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Hint Content */}
      {showHint && hint && (
        <div className="bg-amber-50 p-3 rounded border border-amber-200 text-sm text-amber-900">
          {hint}
        </div>
      )}

      {/* Validation Results */}
      {checkResult && (
        <div className="space-y-2">
          {checkResult.results && checkResult.results.length > 0 ? (
            <div className="space-y-2">
              {checkResult.results.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border-l-4 text-sm ${
                    result.success
                      ? 'bg-green-50 border-l-green-500 text-green-800'
                      : 'bg-red-50 border-l-red-500 text-red-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold">{result.label}</div>
                      <div className="text-xs">{result.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`p-3 rounded border-l-4 ${
                checkResult.type === 'correct'
                  ? 'bg-green-50 border-l-green-500 text-green-800'
                  : checkResult.type === 'error'
                  ? 'bg-red-50 border-l-red-500 text-red-800'
                  : 'bg-blue-50 border-l-blue-500 text-blue-800'
              }`}
            >
              <div className="flex items-start gap-2">
                {checkResult.type === 'correct' && <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />}
                <p className="text-sm font-medium">{checkResult.message}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check Button */}
      <button
        onClick={handleCheck}
        className={`w-full py-2 px-4 rounded font-semibold transition-all ${
          checkResult?.success
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {checkResult?.success ? '✅ Überprüft!' : 'Lösung überprüfen'}
      </button>
    </div>
  );
};
