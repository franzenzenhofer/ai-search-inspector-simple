import { SummaryEvent, SummaryQuery, SummaryResult } from "../core/parseSummary";
import { parseAndDedupe } from "../core/parseAndDedupe";
import { buildStats } from "../core/stats";
import { SearchEvent } from "../core/types";
import { formatDate } from "./dom";

const formatResult = (r: SummaryResult, i: number): string => {
  const lines = [`${i + 1}. ${r.title}`, `   URL: ${r.url}`];
  if (r.snippet) lines.push(`   Snippet: ${r.snippet}`);
  if (r.attribution) lines.push(`   Source: ${r.attribution}`);
  if (r.pub_date) lines.push(`   Published: ${formatDate(r.pub_date)}`);
  return lines.join("\n");
};

const formatQuery = (ei: number, q: SummaryQuery, qi: number): string => {
  const h = `${ei + 1}.${qi + 1} Search Query: ${q.query}\n${q.results.length} results`;
  const r = q.results.map((res, ri) => formatResult(res, ri)).join("\n");
  return r ? `${h}\n${r}` : h;
};

const formatEvent = (ev: SummaryEvent, i: number): string => {
  const h = `Search Event #${i + 1}\n${new Date(ev.timestamp).toLocaleString()}\n${"=".repeat(80)}`;
  return `${h}\n${ev.queries.map((q, qi) => formatQuery(i, q, qi)).join("\n")}`;
};

const buildSummary = (events: SearchEvent[]): string => {
  const all = parseAndDedupe(events);
  return all.map((s, i) => formatEvent(s, i)).join(`\n\n${"=".repeat(80)}\n\n`);
};

const buildToc = (events: SearchEvent[]): string => {
  const all = parseAndDedupe(events);
  const totalQ = all.reduce((s, e) => s + e.queries.length, 0);
  const totalR = all.reduce((s, e) => s + e.queries.reduce((sum, q) => sum + q.results.length, 0), 0);
  const lines = all.map((s, i) => {
    const cnt = s.queries.reduce((sum, q) => sum + q.results.length, 0);
    const qs = s.queries.map((q, qi) => `${i + 1}.${qi + 1} ${q.query} (${q.results.length})`).join("\n");
    return `Event #${i + 1} (${s.queries.length} queries, ${cnt} results)\n${qs}`;
  });
  return `TABLE OF CONTENTS (${totalQ} QUERIES, ${totalR} RESULTS)\n${lines.join("\n")}`;
};

const buildStatsText = (events: SearchEvent[]): string => {
  const s = buildStats(events);
  const urls = s.urls.map((u) => `${u.url} (${u.count}x)`).join(", ") || "none";
  return `Stats\n- Search events: ${s.events}\n- Unique queries: ${s.queries.length} (${s.queries.join(", ") || "none"})\n- Unique domains: ${s.domains.length} (${s.domains.join(", ") || "none"})\n- Unique URLs: ${s.urls.length} (${urls})`;
};

const buildRawJson = (events: SearchEvent[]): string => {
  const jsons = events.map((e, i) => `=== RAW JSON Event #${i + 1} ===\n${e.rawResponse ?? "No data"}`);
  return `FULL JSON DATA\n${"=".repeat(80)}\n${jsons.join("\n\n")}`;
};

export const copyAllSummaries = async (events: SearchEvent[]): Promise<void> => {
  const memo = "# This report was created by AI Search Inspector by Franz Enzenhofer - www.franzai.com - Specialist for SEO, GEO and AI SEO in Vienna, Austria";
  await navigator.clipboard.writeText([buildToc(events), buildStatsText(events), buildSummary(events), buildRawJson(events), memo].join("\n\n"));
};
