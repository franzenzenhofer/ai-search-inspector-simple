import { Mapping, MappingNode, SummaryMetadata } from "./summaryTypes";

const readModelQueries = (metadata?: SummaryMetadata): string[] => {
  const queries = metadata?.search_model_queries?.queries;
  return Array.isArray(queries)
    ? queries.filter((query): query is string => typeof query === "string" && query.length > 0)
    : [];
};

const readSearchQueries = (metadata?: SummaryMetadata): string[] => {
  const items = metadata?.search_queries;
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item?.type === "search" && typeof item?.q === "string" && item.q.length > 0)
    .map((item) => item.q as string);
};

const readQueries = (metadata?: SummaryMetadata): string[] => {
  const model = readModelQueries(metadata);
  if (model.length) return model;
  return readSearchQueries(metadata);
};

/** Event type based on metadata analysis */
export type SearchEventType = "search" | "follow-up" | "unknown";

/** Detects the type of search event based on turn context */
export const detectEventType = (node: MappingNode, mapping: Mapping): SearchEventType => {
  const turnId = node.message?.metadata?.turn_exchange_id;
  if (!turnId) return "unknown";
  // Check if this turn has a search initiator (search_display_string)
  for (const n of Object.values(mapping)) {
    if (n.message?.metadata?.turn_exchange_id !== turnId) continue;
    if (n.message?.metadata?.search_display_string) return "search";
  }
  return "follow-up";
};

/** Finds queries from the same turn_exchange_id group */
const findTurnQueries = (node: MappingNode, mapping: Mapping): string[] => {
  const turnId = node.message?.metadata?.turn_exchange_id;
  if (!turnId) return [];
  for (const n of Object.values(mapping)) {
    if (n.message?.metadata?.turn_exchange_id !== turnId) continue;
    const queries = readQueries(n.message?.metadata);
    if (queries.length) return queries;
  }
  return [];
};

/** Legacy: ancestor-based fallback for nodes without turn_exchange_id */
const ancestorQueries = (node: MappingNode, mapping: Mapping): string[] => {
  let current: MappingNode | undefined = node.parent ? mapping[node.parent] : undefined;
  for (let depth = 0; depth < 3 && current; depth++) {
    const queries = readQueries(current.message?.metadata);
    if (queries.length) return queries;
    current = current.parent ? mapping[current.parent] : undefined;
  }
  return [];
};

/** Resolves queries for a node: turn-based first, then ancestor fallback */
export const resolveQueries = (node: MappingNode, mapping: Mapping): string[] => {
  // 1. Check node itself
  const fromNode = readQueries(node.message?.metadata);
  if (fromNode.length) return fromNode;
  // 2. Check same turn_exchange_id group (preferred)
  const fromTurn = findTurnQueries(node, mapping);
  if (fromTurn.length) return fromTurn;
  // 3. Fallback to immediate ancestors (depth 3 max)
  const fromAncestors = ancestorQueries(node, mapping);
  return fromAncestors.length ? fromAncestors : ["no search query identified"];
};
