import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreDeDE from '@univerjs/preset-sheets-core/locales/de-DE';
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter';
import UniverPresetSheetsFilterDeDE from '@univerjs/preset-sheets-filter/locales/de-DE';
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort';
import UniverPresetSheetsSortDeDE from '@univerjs/preset-sheets-sort/locales/de-DE';
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting';
import UniverPresetSheetsConditionalFormattingDeDE from '@univerjs/preset-sheets-conditional-formatting/locales/de-DE';
import '@univerjs/preset-sheets-core/lib/index.css';
import '@univerjs/preset-sheets-filter/lib/index.css';
import '@univerjs/preset-sheets-sort/lib/index.css';
import '@univerjs/preset-sheets-conditional-formatting/lib/index.css';

import type { FUniver } from '@univerjs/core/facade';
import { registerGermanFormulaAliases } from '../../lib/excel-trainer/german-formulas';
import { applyTaskToWorkbook } from '../../lib/excel-trainer/apply-task';
import { gradeTask } from '../../lib/excel-trainer/grading';
import type { ExcelTask, ValidationResult } from '../../lib/excel-trainer/types';

export interface UniverSheetHandle {
  grade: () => ValidationResult[];
}

interface UniverSheetProps {
  task: ExcelTask;
}

export const UniverSheet = forwardRef<UniverSheetHandle, UniverSheetProps>(({ task }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<FUniver | null>(null);
  const workbookRef = useRef<ReturnType<FUniver['createWorkbook']> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { univerAPI } = createUniver({
      locale: LocaleType.DE_DE,
      locales: {
        [LocaleType.DE_DE]: mergeLocales(
          UniverPresetSheetsCoreDeDE,
          UniverPresetSheetsFilterDeDE,
          UniverPresetSheetsSortDeDE,
          UniverPresetSheetsConditionalFormattingDeDE,
        ),
      },
      presets: [
        UniverSheetsCorePreset({ container: containerRef.current }),
        UniverSheetsFilterPreset(),
        UniverSheetsSortPreset(),
        UniverSheetsConditionalFormattingPreset(),
      ],
    });

    apiRef.current = univerAPI;

    return () => {
      univerAPI.dispose();
      apiRef.current = null;
      workbookRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;

    if (workbookRef.current) {
      api.disposeUnit(workbookRef.current.getId());
    }

    const workbook = api.createWorkbook({ id: task.id, name: task.title });
    workbookRef.current = workbook;
    registerGermanFormulaAliases(api);
    applyTaskToWorkbook(workbook, task);
  }, [task]);

  useImperativeHandle(ref, () => ({
    grade: () => {
      if (!workbookRef.current) return [];
      return gradeTask(workbookRef.current, task);
    },
  }));

  return <div ref={containerRef} style={{ width: '100%', height: 'calc(100vh - 260px)', minHeight: '480px' }} />;
});

UniverSheet.displayName = 'UniverSheet';
