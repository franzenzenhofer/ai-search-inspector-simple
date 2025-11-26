import { SearchEvent } from "./types";
import { parseSummaryFromJson } from "./parseSummary";

export type UrlCount = { url: string; count: number };
export type StatsSnapshot = { events: number; queries: string[]; domains: string[]; urls: UrlCount[] };

/** Multi-part TLD suffixes (co.uk, com.au, etc.) that need special domain extraction */
const MULTI_PART_TLDS = new Set(["co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "net.uk", "sch.uk", "com.au", "net.au", "org.au", "edu.au", "gov.au", "co.nz", "org.nz", "net.nz", "govt.nz", "ac.nz", "co.jp", "or.jp", "ne.jp", "ac.jp", "go.jp", "com.br", "org.br", "net.br", "gov.br", "edu.br", "co.in", "org.in", "net.in", "gov.in", "ac.in", "com.mx", "org.mx", "gob.mx", "edu.mx", "co.za", "org.za", "gov.za", "ac.za", "com.cn", "org.cn", "net.cn", "gov.cn", "edu.cn", "co.kr", "or.kr", "ne.kr", "go.kr", "ac.kr", "com.tw", "org.tw", "net.tw", "gov.tw", "edu.tw", "co.il", "org.il", "net.il", "gov.il", "ac.il", "com.sg", "org.sg", "net.sg", "gov.sg", "edu.sg", "com.hk", "org.hk", "net.hk", "gov.hk", "edu.hk", "co.id", "or.id", "go.id", "ac.id", "web.id", "com.gh", "org.gh", "gov.gh", "edu.gh", "com.ng", "org.ng", "gov.ng", "edu.ng", "co.ke", "or.ke", "go.ke", "ac.ke"]);

/**
 * Extracts the root domain from a URL, handling multi-part TLDs correctly.
 * e.g., "www.example.co.uk" → "example.co.uk" (not "co.uk")
 */
const rootDomain = (url: string): string | undefined => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const parts = host.split(".").filter(Boolean);
    if (parts.length < 2) return host;
    const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    if (MULTI_PART_TLDS.has(lastTwo) && parts.length >= 3) {
      return `${parts[parts.length - 3]}.${lastTwo}`;
    }
    return lastTwo;
  } catch { return undefined; }
};

/** Normalize URL by removing tracking query params (utm_source, etc.) for deduplication */
const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const dominated = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "trk"];
    dominated.forEach((param) => parsed.searchParams.delete(param));
    const remaining = parsed.searchParams.toString();
    return remaining ? `${parsed.origin}${parsed.pathname}?${remaining}` : `${parsed.origin}${parsed.pathname}`;
  } catch { return url; }
};

const addEvent = (event: SearchEvent, queries: Set<string>, domains: Map<string, number>, urls: Map<string, number>): void => {
  if (event.query) queries.add(event.query);
  event.results.forEach((result) => {
    if (!result.url) return;
    const normalized = normalizeUrl(result.url);
    urls.set(normalized, (urls.get(normalized) ?? 0) + 1);
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
