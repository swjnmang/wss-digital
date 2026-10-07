import { Fragment } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

function renderBold(text: string, keyBase: string) {
  const parts = text.split('**');
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyBase}-b${i}`} className="font-semibold text-slate-900">
        {p}
      </strong>
    ) : (
      <Fragment key={`${keyBase}-t${i}`}>{p}</Fragment>
    ),
  );
}

/** Text mit $Formeln$, **fett** und Zeilenumbrüchen (\n). */
export default function Rich({ text, className }: { text: string; className?: string }) {
  const lines = text.split('\n');
  return (
    <span className={className}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split('$').map((seg, i) =>
            i % 2 === 1 ? (
              <InlineMath key={`${li}-m${i}`} math={seg} />
            ) : (
              <Fragment key={`${li}-s${i}`}>{renderBold(seg, `${li}-${i}`)}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </span>
  );
}
