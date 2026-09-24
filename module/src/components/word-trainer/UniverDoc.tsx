import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createUniver, LocaleType } from '@univerjs/presets';
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core';
import UniverPresetDocsCoreDeDE from '@univerjs/preset-docs-core/locales/de-DE';
import '@univerjs/preset-docs-core/lib/index.css';

import type { FUniver } from '@univerjs/core/facade';
import type { FDocument } from '@univerjs/docs/facade';
import { applyTaskToDocument } from '../../lib/geschaeftsbrief/word-dokument-doc';
import { gradeWordDokument } from '../../lib/geschaeftsbrief/word-dokument-grading';
import type { WordDokumentTask } from '../../lib/geschaeftsbrief/word-dokument-tasks';
import type { ValidationResult } from '../../lib/excel-trainer/types';

export interface UniverDocHandle {
  grade: () => ValidationResult[];
}

interface UniverDocProps {
  task: WordDokumentTask;
}

export const UniverDoc = forwardRef<UniverDocHandle, UniverDocProps>(({ task }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<FUniver | null>(null);
  const documentRef = useRef<FDocument | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { univerAPI } = createUniver({
      locale: LocaleType.DE_DE,
      locales: {
        [LocaleType.DE_DE]: UniverPresetDocsCoreDeDE,
      },
      presets: [
        UniverDocsCorePreset({ container: containerRef.current }),
      ],
    });

    apiRef.current = univerAPI;

    return () => {
      univerAPI.dispose();
      apiRef.current = null;
      documentRef.current = null;
    };
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;

    if (documentRef.current) {
      api.disposeUnit(documentRef.current.getId());
    }

    const fDocument = api.createDocument({ id: task.id, title: task.title });
    documentRef.current = fDocument;
    applyTaskToDocument(fDocument, task);
  }, [task]);

  useImperativeHandle(ref, () => ({
    grade: () => {
      if (!documentRef.current) return [];
      return gradeWordDokument(documentRef.current, task);
    },
  }));

  return <div ref={containerRef} style={{ width: '100%', height: 'calc(100vh - 220px)', minHeight: '480px' }} />;
});

UniverDoc.displayName = 'UniverDoc';
