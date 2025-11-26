import { Mapping, MappingNode } from "./summaryTypes";

const parseJson = (raw?: string): unknown => {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const toMapping = (parsed: unknown): Mapping => {
  if (!parsed || typeof parsed !== "object") return {};
  const mapping = (parsed as { mapping?: unknown }).mapping;
  return mapping && typeof mapping === "object" ? (mapping as Mapping) : {};
};

/** Only tool nodes represent actual search events; assistant nodes are response caches */
const isToolNode = (node: MappingNode): boolean => node.message?.author?.role === "tool";

const sortNodes = (mapping: Mapping): MappingNode[] =>
  Object.values(mapping)
    .filter((node) => typeof node.message?.create_time === "number" && isToolNode(node))
    .sort((a, b) => (a.message?.create_time ?? 0) - (b.message?.create_time ?? 0));

export const parseNodes = (rawJson?: string): { mapping: Mapping; nodes: MappingNode[] } => {
  const mapping = toMapping(parseJson(rawJson));
  return { mapping, nodes: sortNodes(mapping) };
};
