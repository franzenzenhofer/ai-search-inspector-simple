import { SummaryEntry, SummaryResult, SummaryResultGroup } from "./summaryTypes";

const isSearchEntry = (entry?: SummaryEntry): entry is SummaryEntry & { url: string } =>
  Boolean(entry?.type === "search_result" && typeof entry.url === "string");

const pickAttribution = (group: SummaryResultGroup, entry: SummaryEntry): string | undefined => {
  if (typeof group.domain === "string" && group.domain.length > 0) return group.domain;
  return typeof entry.attribution === "string" && entry.attribution.length > 0 ? entry.attribution : undefined;
};

const normalizeDate = (value: number | null | undefined): number | null | undefined => {
  if (typeof value === "number") return value;
  return value === null ? null : undefined;
};

const buildResult = (entry: SummaryEntry, group: SummaryResultGroup): SummaryResult => ({
  title: typeof entry.title === "string" && entry.title.length ? entry.title : entry.url ?? "",
  url: entry.url ?? "",
  snippet: typeof entry.snippet === "string" ? entry.snippet : "",
  attribution: pickAttribution(group, entry),
  pub_date: normalizeDate(entry.pub_date),
  ref_id: typeof entry.ref_id === "object" && entry.ref_id ? entry.ref_id : undefined,
  type: "organic",
  rawJson: JSON.stringify(entry, null, 2)
});

export const extractResults = (groups?: SummaryResultGroup[]): SummaryResult[] => {
  if (!Array.isArray(groups)) return [];
  return groups.flatMap((group) => (group.entries ?? []).filter(isSearchEntry).map((entry) => buildResult(entry, group)));
};
