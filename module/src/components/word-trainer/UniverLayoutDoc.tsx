import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createUniver, LocaleType } from '@univerjs/presets';
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core';
import UniverPresetDocsCoreDeDE from '@univerjs/preset-docs-core/locales/de-DE';
import '@univerjs/preset-docs-core/lib/index.css';

import type { FUniver } from '@univerjs/core/facade';
import type { FDocument } from '@univerjs/docs/facade';
import { buildLayoutDocumentData } from '../../lib/word-layout/doc';
import { readFromFDocument, type LayoutDocument } from '../../lib/word-layout/grading';
import type { LayoutTask } from '../../lib/word-layout/types';

export interface UniverLayoutDocHandle {
  read: () => LayoutDocument | null;
}

interface Props {
  task: LayoutTask;
}

/** Univer-Word-Editor für Layout-Aufgaben: vorgegebener Text, der Schüler formatiert direkt im Editor. */
export const UniverLayoutDoc = forwardRef<UniverLayoutDocHandle, Props>(({ task }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<FUniver | null>(null);
  const documentRef = useRef<FDocument | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { univerAPI } = createUniver({
      locale: LocaleType.DE_DE,
      locales: { [LocaleType.DE_DE]: UniverPresetDocsCoreDeDE },
      presets: [UniverDocsCorePreset({ container: containerRef.current })],
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
    if (documentRef.current) api.disposeUnit(documentRef.current.getId());
    documentRef.current = api.createDocument(buildLayoutDocumentData(task.id, task.title, task.paragraphs));
  }, [task]);

  useImperativeHandle(ref, () => ({
    read: () => (documentRef.current ? readFromFDocument(documentRef.current) : null),
  }));

  return <div ref={containerRef} style={{ width: '100%', height: 'calc(100vh - 220px)', minHeight: '520px' }} />;
});

UniverLayoutDoc.displayName = 'UniverLayoutDoc';
