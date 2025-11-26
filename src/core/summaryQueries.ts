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

const ancestorQueries = (node: MappingNode, mapping: Mapping, maxDepth = 3): string[] => {
  let current: MappingNode | undefined = node.parent ? mapping[node.parent] : undefined;
  for (let depth = 0; depth < maxDepth && current; depth++) {
    const queries = readQueries(current.message?.metadata);
    if (queries.length) return queries;
    current = current.parent ? mapping[current.parent] : undefined;
  }
  return [];
};

export const resolveQueries = (node: MappingNode, mapping: Mapping): string[] => {
  const fromNode = readQueries(node.message?.metadata);
  if (fromNode.length) return fromNode;
  const fromAncestors = ancestorQueries(node, mapping);
  return fromAncestors.length ? fromAncestors : ["no search query identified"];
};
