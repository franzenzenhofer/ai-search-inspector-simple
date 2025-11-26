import { Mapping, MappingNode, SummaryEvent, SummaryQuery, SummaryResult } from "./summaryTypes";
import { extractResults } from "./summaryResults";
import { resolveQueries } from "./summaryQueries";

/** Attach all results to each query - ChatGPT runs multiple queries and pools results */
const buildQueries = (node: MappingNode, mapping: Mapping, results: SummaryResult[]): SummaryQuery[] =>
  resolveQueries(node, mapping).map((query) => ({ query, results }));

const toEvent = (node: MappingNode, mapping: Mapping): SummaryEvent | undefined => {
  const time = node.message?.create_time;
  const results = extractResults(node.message?.metadata?.search_result_groups);
  if (!results.length || typeof time !== "number") return undefined;
  return { id: node.message?.id ?? `evt-${time}`, timestamp: time * 1000, queries: buildQueries(node, mapping, results) };
};

export const mapToEvents = (nodes: MappingNode[], mapping: Mapping): SummaryEvent[] =>
  nodes.map((node) => toEvent(node, mapping)).filter((event): event is SummaryEvent => Boolean(event));
