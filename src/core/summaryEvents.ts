import { Mapping, MappingNode, SummaryEvent, SummaryQuery, SummaryResult } from "./summaryTypes";
import { extractResults } from "./summaryResults";
import { resolveQueries } from "./summaryQueries";

/** Get ref_index from result's ref_id field */
const getRefIndex = (result: SummaryResult): number => {
  const refId = result.ref_id as { ref_index?: number } | undefined;
  return typeof refId?.ref_index === "number" ? refId.ref_index : 999;
};

/** Distribute results to queries based on ref_index ranges */
const distributeResults = (queries: string[], results: SummaryResult[]): SummaryResult[][] => {
  if (queries.length <= 1) return [results];
  const maxIdx = Math.max(...results.map(getRefIndex).filter((i) => i < 999), 0);
  const rangePerQuery = Math.ceil((maxIdx + 1) / queries.length);
  const buckets: SummaryResult[][] = queries.map(() => []);
  results.forEach((r) => {
    const idx = Math.min(Math.floor(getRefIndex(r) / rangePerQuery), queries.length - 1);
    buckets[idx].push(r);
  });
  return buckets;
};

/** Build queries with results distributed by ref_index */
const buildQueries = (node: MappingNode, mapping: Mapping, results: SummaryResult[]): SummaryQuery[] => {
  const queries = resolveQueries(node, mapping);
  const distributed = distributeResults(queries, results);
  return queries.map((query, i) => ({ query, results: distributed[i] ?? [] }));
};

const toEvent = (node: MappingNode, mapping: Mapping): SummaryEvent | undefined => {
  const time = node.message?.create_time;
  const results = extractResults(node.message?.metadata?.search_result_groups);
  if (!results.length || typeof time !== "number") return undefined;
  return { id: node.message?.id ?? `evt-${time}`, timestamp: time * 1000, queries: buildQueries(node, mapping, results) };
};

export const mapToEvents = (nodes: MappingNode[], mapping: Mapping): SummaryEvent[] =>
  nodes.map((node) => toEvent(node, mapping)).filter((event): event is SummaryEvent => Boolean(event));
