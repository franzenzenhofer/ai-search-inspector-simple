import { SearchEvent, SearchSummary } from "./types";

const createRow = (event: SearchEvent): SearchSummary => ({
  query: event.query,
  count: 0,
  totalResults: 0,
  lastSeen: 0,
  sampleLink: event.results[0] ? { title: event.results[0].title, url: event.results[0].url } : undefined
});

const mergeEvent = (row: SearchSummary, event: SearchEvent): void => {
  row.count += 1;
  row.totalResults += event.resultCount;
  row.lastSeen = Math.max(row.lastSeen, event.completedAt);
  if (!row.sampleLink && event.results[0]) row.sampleLink = { title: event.results[0].title, url: event.results[0].url };
};

export const summarizeEvents = (events: SearchEvent[]): SearchSummary[] => {
  const rows = new Map<string, SearchSummary>();
  events.forEach((event) => {
    const row = rows.get(event.query) ?? createRow(event);
    mergeEvent(row, event);
    rows.set(event.query, row);
  });
  return Array.from(rows.values());
};
