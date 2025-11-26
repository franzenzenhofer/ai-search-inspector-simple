import { SummaryEvent, SummaryQuery, SummaryResult } from "./summaryTypes";

const fingerprint = (results: SummaryResult[]): string => results.map((r) => r.url).sort().join("|");

const shouldKeep = (q: SummaryQuery, seen: Map<string, string>): boolean => {
  const key = q.query.toLowerCase().trim(), fp = fingerprint(q.results), prev = seen.get(key);
  if (q.results.length === 0) return !seen.has(key);
  if (prev === undefined) { seen.set(key, fp); return true; }
  if (prev === fp) return false;
  seen.set(key, fp);
  return true;
};

/** Removes duplicate queries: empty or exact same results as previously seen */
export const dedupeQueriesAcrossEvents = (events: SummaryEvent[]): SummaryEvent[] => {
  const seen = new Map<string, string>();
  return events.map((e) => ({ ...e, queries: e.queries.filter((q) => shouldKeep(q, seen)) })).filter((e) => e.queries.length > 0);
};
