import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const OVERLINE_PATTERN = /\\overline\{([^}]+)\}/g;

export function renderTextWithMath(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(OVERLINE_PATTERN);

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(<InlineMath key={`overline-${key++}`} math={`\\overline{${match[1]}}`} />);
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}
