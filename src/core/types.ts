export type SearchResult = { title: string; url: string; snippet?: string; pub_date?: number | null; attribution?: string; ref_id?: Record<string, unknown>; type?: string };
export type SearchEventType = "search" | "follow-up" | "unknown";
export type SearchEvent = {
  id: string;
  query: string;
  url: string;
  method: string;
  status: number;
  resultCount: number;
  results: SearchResult[];
  rawResponse?: string;
  startedAt: number;
  completedAt: number;
  eventType?: SearchEventType;
  turnId?: string;
};

export type SearchSummary = {
  query: string;
  count: number;
  totalResults: number;
  lastSeen: number;
  sampleLink?: { title: string; url: string };
};

export type LogLevel = "info" | "warn" | "error";
export type LogTag = "capture" | "parse" | "ui" | "storage";

export type LogEntry = {
  id: string;
  level: LogLevel;
  tag: LogTag;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
};
