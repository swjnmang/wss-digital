import { Fragment } from 'react'
import { BlockMath, InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

// Text mit KaTeX: $…$ wird als Formel gesetzt, **…** fett. Beginnt die Zeile mit $$, wird sie abgesetzt (zentriert) gesetzt.

// Zeichen ohne KaTeX-Schriftmetrik (€, deutsche Anführungszeichen) im Textmodus setzen
const tex = (s: string) => s.replace(/[€„“]/g, (z) => `\\text{${z}}`)

export function MathText({ text }: { text: string }) {
  if (text.startsWith('$$')) return <BlockMath math={tex(text.replace(/^\$\$/, '').replace(/\$\$$/, ''))} />
  const teile = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g)
  return (
    <>
      {teile.map((t, i) => {
        if (t.length > 1 && t.startsWith('$') && t.endsWith('$')) return <InlineMath key={i} math={tex(t.slice(1, -1))} />
        if (t.startsWith('**') && t.endsWith('**')) return <strong key={i}>{t.slice(2, -2)}</strong>
        return <Fragment key={i}>{t}</Fragment>
      })}
    </>
  )
}

/** Mehrere Zeilen untereinander (Aufgabentext, Lösungsweg) */
export function MathLines({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <div className={className}>
      {lines.map((l, i) =>
        l.startsWith('$$') ? (
          <MathText key={i} text={l} />
        ) : (
          <p key={i} style={{ margin: '0 0 6px', lineHeight: 1.55 }}>
            <MathText text={l} />
          </p>
        ),
      )}
    </div>
  )
}
