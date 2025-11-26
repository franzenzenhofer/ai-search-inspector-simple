/**
 * Parses ChatGPT conversation JSON to extract ALL search events.
 *
 * ChatGPT stores search results in multiple locations within the conversation mapping:
 * 1. Tool response nodes (web.run) - contains search_result_groups with results
 * 2. Assistant response nodes - may contain additional/processed search_result_groups
 *
 * This parser extracts events from ALL nodes that have search_result_groups,
 * ensuring we capture every search result ChatGPT retrieved.
 */
import { SearchEvent, SearchResult } from "./types";
import { Mapping, MappingNode } from "./summaryTypes";
import { resolveQueries } from "./summaryQueries";

export type RawCapture = { url: string; method: string; requestBody?: string; responseBody?: string; status: number; startedAt: number; completedAt: number };
type ResultEntry = { type?: unknown; title?: unknown; url?: unknown; snippet?: unknown; pub_date?: unknown; attribution?: unknown; ref_id?: unknown };

const safeJson = (text?: string): unknown => { if (!text) return undefined; try { return JSON.parse(text); } catch { return undefined; } };
const toMapping = (parsed: unknown): Mapping => {
  if (!parsed || typeof parsed !== "object") return {};
  const mapping = (parsed as { mapping?: unknown }).mapping;
  return mapping && typeof mapping === "object" ? mapping as Mapping : {};
};
const sortNodes = (mapping: Mapping): MappingNode[] => Object.values(mapping).filter((node) => typeof node.message?.create_time === "number").sort((a, b) => (a.message?.create_time ?? 0) - (b.message?.create_time ?? 0));
const resolveQuery = (node: MappingNode, mapping: Mapping): string => resolveQueries(node, mapping).join(", ");
const toResults = (groups: unknown): SearchResult[] => {
  if (!Array.isArray(groups)) return [];
  return groups.flatMap((groupRaw) => {
    const group = groupRaw as { entries?: unknown; domain?: string };
    const entries = Array.isArray(group.entries) ? group.entries : [];
    return entries.flatMap((entryRaw) => {
      const entry = entryRaw as ResultEntry;
      if (entry.type !== "search_result" || typeof entry.url !== "string") return [];
      const title = typeof entry.title === "string" ? entry.title : entry.url;
      const attribution = typeof group.domain === "string" ? group.domain : typeof entry.attribution === "string" ? entry.attribution : undefined;
      return [{ title, url: entry.url, snippet: typeof entry.snippet === "string" ? entry.snippet : undefined, pub_date: typeof entry.pub_date === "number" ? entry.pub_date : entry.pub_date === null ? null : undefined, attribution, ref_id: typeof entry.ref_id === "object" && entry.ref_id ? entry.ref_id as Record<string, unknown> : undefined, type: "organic" }];
    });
  });
};
const toEvent = (node: MappingNode, capture: RawCapture, mapping: Mapping): SearchEvent | undefined => {
  const metadata = node.message?.metadata;
  const results = toResults(metadata?.search_result_groups);
  const time = node.message?.create_time;
  if (!results.length || typeof time !== "number") return undefined;
  const ms = time * 1000;
  const query = resolveQuery(node, mapping);
  return { id: node.message?.id ?? `evt-${time}`, query, url: capture.url, method: capture.method, status: capture.status, resultCount: results.length, results, rawResponse: capture.responseBody, startedAt: ms, completedAt: ms };
};
/**
 * Parses ALL search events from a captured ChatGPT response.
 * Iterates through every node in the conversation mapping that has search_result_groups.
 * Returns events sorted by timestamp, each containing all results from that node.
 */
export const parseSearchEvents = (capture: RawCapture): SearchEvent[] => {
  const mapping = toMapping(safeJson(capture.responseBody));
  return sortNodes(mapping).map((node) => toEvent(node, capture, mapping)).filter((event): event is SearchEvent => Boolean(event));
};

/** @deprecated Use parseSearchEvents to capture ALL events, not just the first */
export const parseSearchEvent = (capture: RawCapture): SearchEvent | undefined => parseSearchEvents(capture)[0];
