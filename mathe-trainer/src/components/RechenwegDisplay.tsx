import React from 'react';

interface ParsedStep {
  left: string;
  right: string | null;
  operation: string | null;
  plain: boolean;
}

// Trennt eine Rechenweg-Zeile in linke Seite, rechte Seite und Äquivalenzumformung
// (nach dem Kommandostrich "|"). Zeilen ohne "=" (z.B. "Identität - alle x erfüllen")
// werden als durchgehender Text behandelt.
function parseStep(raw: string, stripDollar: boolean): ParsedStep {
  let s = raw.trim();
  if (stripDollar) {
    s = s.replace(/^\$/, '').replace(/\$$/, '').trim();
  }

  let operation: string | null = null;
  const pipeIdx = s.indexOf('|');
  if (pipeIdx !== -1) {
    operation = s.slice(pipeIdx + 1).trim();
    s = s.slice(0, pipeIdx).trim();
  }

  const eqIdx = s.indexOf('=');
  if (eqIdx === -1) {
    return { left: s, right: null, operation, plain: true };
  }
  return {
    left: s.slice(0, eqIdx).trim(),
    right: s.slice(eqIdx + 1).trim(),
    operation,
    plain: false,
  };
}

interface RechenwegDisplayProps {
  steps: string[];
  isLatex?: boolean;
  className?: string;
}

// Zeigt einen Rechenweg als CSS-Grid an: alle "="-Zeichen und alle Kommandostriche ("|")
// stehen dadurch untereinander in einer Spalte, egal wie lang die einzelnen Zeilen sind.
export default function RechenwegDisplay({ steps, isLatex = false, className }: RechenwegDisplayProps) {
  const wrap = (content: string) => (isLatex ? `$${content}$` : content);
  const parsed = steps.map((s) => parseStep(s, isLatex));

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto auto auto',
        columnGap: '0.5rem',
        rowGap: '0.35rem',
        alignItems: 'baseline',
      }}
    >
      {parsed.map((p, i) =>
        // display:contents macht den Wrapper unsichtbar für das Grid-Layout,
        // sodass die Kind-Elemente direkt als Grid-Items in Spalten fallen.
        p.plain ? (
          <div key={i} style={{ display: 'contents' }}>
            <div style={{ gridColumn: '1 / span 3' }} className="text-gray-700">
              {wrap(p.left)}
            </div>
            <div className="text-gray-500 text-sm whitespace-nowrap">
              {p.operation ? (
                <>
                  <span className="mr-1">|</span>
                  {wrap(p.operation)}
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div key={i} style={{ display: 'contents' }}>
            <div className="text-gray-700 text-right">{wrap(p.left)}</div>
            <div className="text-gray-700">=</div>
            <div className="text-gray-700 text-left">{wrap(p.right as string)}</div>
            <div className="text-gray-500 text-sm whitespace-nowrap">
              {p.operation ? (
                <>
                  <span className="mr-1">|</span>
                  {wrap(p.operation)}
                </>
              ) : null}
            </div>
          </div>
        )
      )}
    </div>
  );
}
