/**
 * Summary Parser - Extracts structured Event > Query > Results from raw JSON responses
 *
 * This parser works on the FULL JSON RESPONSE (the rawResponse field) that is displayed
 * in the UI. It has NOTHING to do with the network capture parser (parseSearchEvent.ts).
 *
 * Input: Raw JSON string from ChatGPT conversation API
 * Output: Structured array of SummaryEvent objects with queries and results
 */

export type SummaryResult = {
  title: string;
  url: string;
  snippet: string; // FULL text, NO truncation
  attribution?: string;
  pub_date?: number | null;
  ref_id?: Record<string, unknown>;
  type?: string;
  rawJson: string; // Stringified JSON for expandable view
};

export type SummaryQuery = {
  query: string;
  results: SummaryResult[];
};

export type SummaryEvent = {
  id: string;
  timestamp: number;
  queries: SummaryQuery[]; // Multiple queries per event, each with their own results
};

// Mapping node structure from ChatGPT API
type MappingNode = {
  id: string;
  message?: {
    id?: string;
    create_time?: number;
    metadata?: {
      search_model_queries?: {
        queries?: string[];
      };
      search_result_groups?: Array<{
        domain?: string;
        entries?: Array<{
          type?: string;
          url?: string;
          title?: string;
          snippet?: string;
          pub_date?: number | null;
          attribution?: string;
          ref_id?: Record<string, unknown>;
        }>;
      }>;
    };
  };
  parent?: string;
};

// Safe JSON parser
const safeJson = (text?: string): any => {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

/**
 * Extract the mapping object from parsed response
 */
const toMapping = (parsed: any): Record<string, MappingNode> => {
  if (!parsed || typeof parsed !== "object") return {};
  const mapping = parsed.mapping;
  return mapping && typeof mapping === "object" ? mapping : {};
};

/**
 * Sort nodes chronologically by create_time
 */
const sortNodes = (mapping: Record<string, MappingNode>): MappingNode[] => {
  return Object.values(mapping)
    .filter((node) => typeof node.message?.create_time === "number")
    .sort((a, b) => (a.message?.create_time ?? 0) - (b.message?.create_time ?? 0));
};

/**
 * Read query strings from metadata
 */
const readQueries = (metadata?: any): string[] => {
  const queries = metadata?.search_model_queries?.queries;
  return Array.isArray(queries) ? queries.filter((q) => typeof q === "string" && q.length > 0) : [];
};

/**
 * Resolve query text from node or parent node
 * This handles the parent-child tree relationship in ChatGPT conversations
 */
const resolveQuery = (node: MappingNode, mapping: Record<string, MappingNode>): string => {
  // Try current node first
  const fromNode = readQueries(node.message?.metadata);
  if (fromNode.length) return fromNode.join(", ");

  // Fallback to parent node
  const parentMeta = node.parent ? mapping[node.parent]?.message?.metadata : undefined;
  const fromParent = readQueries(parentMeta);
  return fromParent.length ? fromParent.join(", ") : "<unknown query>";
};

/**
 * Extract search results from search_result_groups
 * CRITICAL: NO TRUNCATION - pass full snippet text
 */
const toResults = (groups?: any[]): SummaryResult[] => {
  if (!Array.isArray(groups)) return [];

  return groups.flatMap((groupRaw) => {
    const group = groupRaw as any;
    const entries = Array.isArray(group.entries) ? group.entries : [];

    return entries.flatMap((entryRaw) => {
      const entry = entryRaw as any;

      // Only process actual search results
      if (entry.type !== "search_result" || typeof entry.url !== "string") {
        return [];
      }

      const title = typeof entry.title === "string" ? entry.title : entry.url;
      const attribution = typeof group.domain === "string"
        ? group.domain
        : typeof entry.attribution === "string"
          ? entry.attribution
          : undefined;

      return [{
        title,
        url: entry.url,
        // CRITICAL: Pass FULL snippet, NO .slice() or .substring()
        snippet: typeof entry.snippet === "string" ? entry.snippet : "",
        pub_date: typeof entry.pub_date === "number" ? entry.pub_date : entry.pub_date === null ? null : undefined,
        attribution,
        ref_id: typeof entry.ref_id === "object" && entry.ref_id ? entry.ref_id : undefined,
        type: "organic",
        rawJson: JSON.stringify(entry, null, 2)
      }];
    });
  });
};

/**
 * Create a SummaryEvent from a mapping node
 */
const toEvent = (node: MappingNode, mapping: Record<string, MappingNode>): SummaryEvent | undefined => {
  const metadata = node.message?.metadata;
  const results = toResults(metadata?.search_result_groups);
  const time = node.message?.create_time;

  // Only create event if we have results and a timestamp
  if (!results.length || typeof time !== "number") {
    return undefined;
  }

  const ms = time * 1000; // Convert to milliseconds

  // Get all queries from this node or parent
  const fromNode = readQueries(node.message?.metadata);
  const fromParent = node.parent ? readQueries(mapping[node.parent]?.message?.metadata) : [];
  const allQueries = fromNode.length ? fromNode : fromParent;

  // Create query objects - each query gets all the results
  // (ChatGPT combines results from multiple queries)
  const queries: SummaryQuery[] = allQueries.length > 0
    ? allQueries.map(q => ({ query: q, results }))
    : [{ query: "no search query identified", results }];

  return {
    id: node.message?.id ?? `evt-${time}`,
    timestamp: ms,
    queries
  };
};

/**
 * Main parser function - extracts structured events from raw JSON response
 *
 * @param rawJson - The full JSON response string from ChatGPT API
 * @returns Array of SummaryEvent objects with Event > Query > Results hierarchy
 */
export const parseSummaryFromJson = (rawJson?: string): SummaryEvent[] => {
  const parsed = safeJson(rawJson);
  const mapping = toMapping(parsed);

  // Get all nodes sorted chronologically
  const sortedNodes = sortNodes(mapping);

  // Extract events from nodes that have search results
  return sortedNodes
    .map((node) => toEvent(node, mapping))
    .filter((event): event is SummaryEvent => Boolean(event));
};
