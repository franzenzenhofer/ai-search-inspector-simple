import { mapToEvents } from "./summaryEvents";
import { parseNodes } from "./summaryMapping";
import { SummaryEvent } from "./summaryTypes";

export type { SummaryEvent, SummaryQuery, SummaryResult } from "./summaryTypes";

export const parseSummaryFromJson = (rawJson?: string): SummaryEvent[] => {
  const { mapping, nodes } = parseNodes(rawJson);
  return mapToEvents(nodes, mapping);
};
