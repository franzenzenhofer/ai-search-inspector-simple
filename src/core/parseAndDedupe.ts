import { parseSummaryFromJson, SummaryEvent } from "./parseSummary";
import { dedupeQueriesAcrossEvents } from "./dedupeQueries";
import { SearchEvent } from "./types";

/** Parses events from JSON, dedupes by ID, then dedupes queries across events */
export const parseAndDedupe = (events: SearchEvent[]): SummaryEvent[] => {
  const seen = new Set<string>();
  const parsed = events.flatMap((e) => parseSummaryFromJson(e.rawResponse)).filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
  return dedupeQueriesAcrossEvents(parsed);
};
