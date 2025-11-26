import { Mapping, MappingNode, SummaryEvent, SummaryQuery, SummaryResult, SummaryEventType } from "./summaryTypes";
import { extractResults } from "./summaryResults";
import { resolveQueries, detectEventType } from "./summaryQueries";

/** Get ref_index from result's ref_id field */
const getRefIndex = (result: SummaryResult): number => {
  const refId = result.ref_id as { ref_index?: number } | undefined;
  return typeof refId?.ref_index === "number" ? refId.ref_index : 999;
};

/** Find natural boundaries using gaps in ref_index sequence */
const findBoundaries = (indices: number[], numQueries: number): number[] => {
  if (numQueries <= 1 || indices.length === 0) return [];
  const sorted = [...indices].sort((a, b) => a - b);
  const gaps: { boundary: number; gap: number }[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push({ boundary: Math.floor((sorted[i - 1] + sorted[i]) / 2), gap: sorted[i] - sorted[i - 1] });
  }
  gaps.sort((a, b) => b.gap - a.gap);
  return gaps.slice(0, numQueries - 1).map((g) => g.boundary).sort((a, b) => a - b);
};

/** Distribute results to queries using gap-based boundaries */
const distributeResults = (queries: string[], results: SummaryResult[]): SummaryResult[][] => {
  if (queries.length <= 1) return [results];
  const indices = results.map(getRefIndex).filter((i) => i < 999);
  const boundaries = findBoundaries(indices, queries.length);
  const buckets: SummaryResult[][] = queries.map(() => []);
  results.forEach((r) => {
    const idx = getRefIndex(r);
    let bucket = 0;
    for (let i = 0; i < boundaries.length; i++) {
      if (idx > boundaries[i]) bucket = i + 1;
    }
    buckets[Math.min(bucket, queries.length - 1)].push(r);
  });
  return buckets;
};

/** Build queries with results distributed by ref_index gaps */
const buildQueries = (node: MappingNode, mapping: Mapping, results: SummaryResult[]): SummaryQuery[] => {
  const queries = resolveQueries(node, mapping);
  const distributed = distributeResults(queries, results);
  return queries.map((query, i) => ({ query, results: distributed[i] ?? [] }));
};

const toEvent = (node: MappingNode, mapping: Mapping): SummaryEvent | undefined => {
  const time = node.message?.create_time;
  const results = extractResults(node.message?.metadata?.search_result_groups);
  if (!results.length || typeof time !== "number") return undefined;
  const eventType = detectEventType(node, mapping) as SummaryEventType;
  const turnId = node.message?.metadata?.turn_exchange_id;
  return { id: node.message?.id ?? `evt-${time}`, timestamp: time * 1000, queries: buildQueries(node, mapping, results), eventType, turnId };
};

export const mapToEvents = (nodes: MappingNode[], mapping: Mapping): SummaryEvent[] =>
  nodes.map((node) => toEvent(node, mapping)).filter((event): event is SummaryEvent => Boolean(event));
