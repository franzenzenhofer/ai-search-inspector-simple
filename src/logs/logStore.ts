import { LogEntry, LogLevel, LogTag } from "../core/types";

const MAX_LOGS = 300;
let entries: LogEntry[] = [];

const createId = (): string => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export const getLogs = (): LogEntry[] => entries;

export const clearLogs = (): void => {
  entries = [];
};

export const addLog = (level: LogLevel, tag: LogTag, message: string, details?: Record<string, unknown>): LogEntry => {
  const log: LogEntry = { id: createId(), level, tag, message, details, timestamp: Date.now() };
  entries = [...entries.slice(-(MAX_LOGS - 1)), log];
  return log;
};

export const hydrateLogs = (logs: LogEntry[]): void => {
  entries = logs.slice(-MAX_LOGS);
};
