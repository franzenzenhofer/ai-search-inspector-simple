import { SearchEvent } from "./types";
import { parseAndDedupe } from "./parseAndDedupe";

export type UrlCount = { url: string; count: number };
export type StatsSnapshot = { events: number; queries: string[]; domains: string[]; urls: UrlCount[] };

const MULTI_PART_TLDS = new Set(["co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "net.uk", "sch.uk", "com.au", "net.au", "org.au", "edu.au", "gov.au", "co.nz", "org.nz", "net.nz", "govt.nz", "ac.nz", "co.jp", "or.jp", "ne.jp", "ac.jp", "go.jp", "com.br", "org.br", "net.br", "gov.br", "edu.br", "co.in", "org.in", "net.in", "gov.in", "ac.in", "com.mx", "org.mx", "gob.mx", "edu.mx", "co.za", "org.za", "gov.za", "ac.za", "com.cn", "org.cn", "net.cn", "gov.cn", "edu.cn", "co.kr", "or.kr", "ne.kr", "go.kr", "ac.kr", "com.tw", "org.tw", "net.tw", "gov.tw", "edu.tw", "co.il", "org.il", "net.il", "gov.il", "ac.il", "com.sg", "org.sg", "net.sg", "gov.sg", "edu.sg", "com.hk", "org.hk", "net.hk", "gov.hk", "edu.hk", "co.id", "or.id", "go.id", "ac.id", "web.id", "com.gh", "org.gh", "gov.gh", "edu.gh", "com.ng", "org.ng", "gov.ng", "edu.ng", "co.ke", "or.ke", "go.ke", "ac.ke"]);

export const rootDomain = (url: string): string | undefined => {
  try {
    const host = new URL(url).hostname.toLowerCase(), parts = host.split(".").filter(Boolean);
    if (parts.length < 2) return host;
    const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    return MULTI_PART_TLDS.has(lastTwo) && parts.length >= 3 ? `${parts[parts.length - 3]}.${lastTwo}` : lastTwo;
  } catch { return undefined; }
};

export const normalizeUrl = (url: string): string => {
  try {
    const p = new URL(url);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "trk"].forEach((k) => p.searchParams.delete(k));
    const q = p.searchParams.toString();
    return q ? `${p.origin}${p.pathname}?${q}` : `${p.origin}${p.pathname}`;
  } catch { return url; }
};

const isNoQuery = (q: string): boolean => q.toLowerCase().includes("no search query identified");

export const buildStats = (events: SearchEvent[]): StatsSnapshot => {
  const all = parseAndDedupe(events);
  const queries = new Set<string>(), domains = new Map<string, number>(), urls = new Map<string, number>();
  all.forEach((ev) => ev.queries.forEach((q) => {
    if (!isNoQuery(q.query)) queries.add(q.query);
    q.results.forEach((r) => {
      if (!r.url) return;
      const norm = normalizeUrl(r.url);
      urls.set(norm, (urls.get(norm) ?? 0) + 1);
      const d = rootDomain(r.url);
      if (d) domains.set(d, (domains.get(d) ?? 0) + 1);
    });
  }));
  return {
    events: all.length,
    queries: Array.from(queries).sort(),
    domains: Array.from(domains.entries()).sort((a, b) => b[1] - a[1]).map(([d, c]) => `${d} (${c}x)`),
    urls: Array.from(urls.entries()).sort((a, b) => b[1] - a[1]).map(([u, c]) => ({ url: u, count: c }))
  };
};
