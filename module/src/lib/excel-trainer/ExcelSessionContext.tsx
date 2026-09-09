import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ValidationResult } from './types';
import type { TaskLog } from './session';
import { generateReportPdf } from './generate-report-pdf';

interface ExcelSessionContextValue {
  recording: boolean;
  hasProgress: boolean;
  startRecording: () => void;
  enterTask: (taskId: string, taskTitle: string) => void;
  leaveTask: () => void;
  logCheck: (taskId: string, taskTitle: string, results: ValidationResult[]) => void;
  finishRecording: (studentName: string) => void;
  discardRecording: () => void;
}

const ExcelSessionContext = createContext<ExcelSessionContextValue | null>(null);

export function ExcelSessionProvider({ children }: { children: ReactNode }) {
  const [recording, setRecording] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);

  const sessionStartRef = useRef<number | null>(null);
  const activeTaskIdRef = useRef<string | null>(null);
  const activeSinceRef = useRef<number | null>(null);
  const taskLogsRef = useRef<Record<string, TaskLog>>({});

  const ensureTaskLog = useCallback((taskId: string, taskTitle: string) => {
    if (!taskLogsRef.current[taskId]) {
      taskLogsRef.current[taskId] = { taskId, taskTitle, timeSpentMs: 0, attempts: 0, lastResults: null };
    }
    return taskLogsRef.current[taskId];
  }, []);

  const leaveTask = useCallback(() => {
    if (!recording || !activeTaskIdRef.current || activeSinceRef.current === null) return;
    const now = Date.now();
    const log = taskLogsRef.current[activeTaskIdRef.current];
    if (log) {
      log.timeSpentMs += now - activeSinceRef.current;
    }
    activeSinceRef.current = null;
    activeTaskIdRef.current = null;
  }, [recording]);

  const enterTask = useCallback(
    (taskId: string, taskTitle: string) => {
      if (!recording) return;
      leaveTask();
      ensureTaskLog(taskId, taskTitle);
      activeTaskIdRef.current = taskId;
      activeSinceRef.current = Date.now();
    },
    [recording, leaveTask, ensureTaskLog],
  );

  const startRecording = useCallback(() => {
    sessionStartRef.current = Date.now();
    taskLogsRef.current = {};
    activeTaskIdRef.current = null;
    activeSinceRef.current = null;
    setHasProgress(false);
    setRecording(true);
  }, []);

  const logCheck = useCallback(
    (taskId: string, taskTitle: string, results: ValidationResult[]) => {
      if (!recording) return;
      const log = ensureTaskLog(taskId, taskTitle);
      log.attempts += 1;
      log.lastResults = results;
      setHasProgress(true);
    },
    [recording, ensureTaskLog],
  );

  const reset = useCallback(() => {
    setRecording(false);
    setHasProgress(false);
    sessionStartRef.current = null;
    activeTaskIdRef.current = null;
    activeSinceRef.current = null;
    taskLogsRef.current = {};
  }, []);

  const finishRecording = useCallback(
    (studentName: string) => {
      leaveTask();
      const startedAt = sessionStartRef.current ?? Date.now();
      generateReportPdf({
        studentName,
        startedAt,
        endedAt: Date.now(),
        taskLogs: Object.values(taskLogsRef.current),
      });
      reset();
    },
    [leaveTask, reset],
  );

  const discardRecording = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (!recording) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [recording]);

  return (
    <ExcelSessionContext.Provider
      value={{ recording, hasProgress, startRecording, enterTask, leaveTask, logCheck, finishRecording, discardRecording }}
    >
      {children}
    </ExcelSessionContext.Provider>
  );
}

export function useExcelSession() {
  const ctx = useContext(ExcelSessionContext);
  if (!ctx) throw new Error('useExcelSession must be used within an ExcelSessionProvider');
  return ctx;
}
