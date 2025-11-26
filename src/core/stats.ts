import { SearchEvent } from "./types";
import { parseSummaryFromJson } from "./parseSummary";

export type UrlCount = { url: string; count: number };
export type StatsSnapshot = { events: number; queries: string[]; domains: string[]; urls: UrlCount[] };

const rootDomain = (url: string): string | undefined => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const parts = host.split(".").filter(Boolean);
    if (parts.length >= 2) return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    return host;
  } catch { return undefined; }
};

const addEvent = (event: SearchEvent, queries: Set<string>, domains: Map<string, number>, urls: Map<string, number>): void => {
  if (event.query) queries.add(event.query);
  event.results.forEach((result) => {
    if (!result.url) return;
    urls.set(result.url, (urls.get(result.url) ?? 0) + 1);
    const domain = rootDomain(result.url);
    if (domain) domains.set(domain, (domains.get(domain) ?? 0) + 1);
  });
};

const countSummaryEvents = (events: SearchEvent[]): number =>
  events.reduce((sum, event) => sum + parseSummaryFromJson(event.rawResponse).length, 0);

export const buildStats = (events: SearchEvent[]): StatsSnapshot => {
  const queries = new Set<string>();
  const domains = new Map<string, number>();
  const urls = new Map<string, number>();
  events.forEach((event) => addEvent(event, queries, domains, urls));
  return {
    events: countSummaryEvents(events),
    queries: Array.from(queries).sort(),
    domains: Array.from(domains.entries()).sort((a, b) => b[1] - a[1]).map(([d, c]) => `${d} (${c}x)`),
    urls: Array.from(urls.entries()).sort((a, b) => b[1] - a[1]).map(([url, count]) => ({ url, count }))
  };
};
