import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createUniver, LocaleType } from '@univerjs/presets';
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core';
import UniverPresetDocsCoreDeDE from '@univerjs/preset-docs-core/locales/de-DE';
import '@univerjs/preset-docs-core/lib/index.css';

import type { IDocumentData } from '@univerjs/core';
import { CommandType, ICommandService, SectionType } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import type { FDocument } from '@univerjs/docs/facade';
import { buildLayoutDocumentData } from '../../lib/word-layout/doc';
import { readFromFDocument, type LayoutDocument } from '../../lib/word-layout/grading';
import type { LayoutTask } from '../../lib/word-layout/types';

// Univer 1.0.1 führt die Menüpunkte „Abschnittsumbruch …“ unter ihrer Menü-ID statt über die
// hinterlegte Operation aus. Wir registrieren die Menü-IDs daher als kleine Weiterleitungen.
const SECTION_BREAK_MENU_COMMANDS: [string, SectionType][] = [
  ['doc.menu.section-break.next-page', SectionType.NEXT_PAGE],
  ['doc.menu.section-break.continuous', SectionType.CONTINUOUS],
  ['doc.menu.section-break.next-column', SectionType.NEXT_COLUMN],
  ['doc.menu.section-break.even-page', SectionType.EVEN_PAGE],
  ['doc.menu.section-break.odd-page', SectionType.ODD_PAGE],
];

function registerSectionBreakMenuCommands(univerAPI: FUniver) {
  const commandService = (univerAPI as unknown as { _commandService: ICommandService })._commandService;
  for (const [id, sectionType] of SECTION_BREAK_MENU_COMMANDS) {
    if (commandService.hasCommand(id)) continue;
    commandService.registerCommand({
      id,
      type: CommandType.OPERATION,
      handler: (accessor) => accessor.get(ICommandService).executeCommand('docs.operation.insert-section-break', { sectionType }),
    });
  }
}

const storageKey = (taskId: string) => `wss-word-layout:v1:${taskId}`;

function loadSaved(taskId: string): IDocumentData | null {
  try {
    const raw = localStorage.getItem(storageKey(taskId));
    return raw ? (JSON.parse(raw) as IDocumentData) : null;
  } catch {
    return null;
  }
}

function storeSaved(taskId: string, data: IDocumentData | null) {
  try {
    if (data) localStorage.setItem(storageKey(taskId), JSON.stringify(data));
    else localStorage.removeItem(storageKey(taskId));
  } catch {
    // Speicher voll oder gesperrt – dann eben ohne Zwischenspeicher
  }
}

export interface UniverLayoutDocHandle {
  read: () => LayoutDocument | null;
  /** Aktueller Stand als Univer-Dokumentdaten (für Export). */
  save: () => IDocumentData | null;
  /** Verwirft alle Änderungen und lädt das Ausgangsdokument neu. */
  reset: () => void;
}

interface Props {
  task: LayoutTask;
  /** Wird aufgerufen, wenn beim Laden ein zwischengespeicherter Stand übernommen wurde. */
  onRestored?: (restored: boolean) => void;
}

/** Univer-Word-Editor für Layout-Aufgaben: vorgegebener Text, der Schüler formatiert direkt im Editor. */
export const UniverLayoutDoc = forwardRef<UniverLayoutDocHandle, Props>(({ task, onRestored }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<FUniver | null>(null);
  const documentRef = useRef<FDocument | null>(null);
  const onRestoredRef = useRef(onRestored);
  useEffect(() => {
    onRestoredRef.current = onRestored;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const { univerAPI } = createUniver({
      locale: LocaleType.DE_DE,
      locales: { [LocaleType.DE_DE]: UniverPresetDocsCoreDeDE },
      presets: [UniverDocsCorePreset({ container: containerRef.current })],
    });
    apiRef.current = univerAPI;
    registerSectionBreakMenuCommands(univerAPI);

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
    const saved = loadSaved(task.id);
    documentRef.current = api.createDocument(saved ?? buildLayoutDocumentData(task));
    onRestoredRef.current?.(!!saved);

    // Zwischenstand regelmäßig im Browser sichern, damit ein Neuladen nichts kostet
    let last = '';
    const persist = () => {
      const doc = documentRef.current;
      if (!doc || doc.getId() !== task.id) return;
      const data = doc.save();
      const json = JSON.stringify(data);
      if (json !== last) {
        last = json;
        storeSaved(task.id, data);
      }
    };
    const timer = window.setInterval(persist, 3000);
    return () => {
      window.clearInterval(timer);
      persist();
    };
  }, [task]);

  useImperativeHandle(ref, () => ({
    read: () => (documentRef.current ? readFromFDocument(documentRef.current) : null),
    save: () => documentRef.current?.save() ?? null,
    reset: () => {
      const api = apiRef.current;
      if (!api) return;
      storeSaved(task.id, null);
      if (documentRef.current) api.disposeUnit(documentRef.current.getId());
      documentRef.current = api.createDocument(buildLayoutDocumentData(task));
    },
  }));

  return <div ref={containerRef} style={{ width: '100%', height: 'calc(100vh - 220px)', minHeight: '520px' }} />;
});

UniverLayoutDoc.displayName = 'UniverLayoutDoc';
