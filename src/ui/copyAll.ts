import { parseSummaryFromJson, SummaryEvent, SummaryQuery, SummaryResult } from "../core/parseSummary";
import { buildStats } from "../core/stats";
import { SearchEvent } from "../core/types";
import { formatDate } from "./dom";

const formatResult = (result: SummaryResult, idx: number): string => {
  const lines = [`${idx + 1}. ${result.title}`, `   URL: ${result.url}`];
  if (result.snippet) lines.push(`   Snippet: ${result.snippet}`);
  if (result.attribution) lines.push(`   Source: ${result.attribution}`);
  if (result.pub_date) lines.push(`   Published: ${formatDate(result.pub_date)}`);
  return lines.join("\n");
};

const formatQuery = (eventIdx: number, query: SummaryQuery, idx: number): string => {
  const header = `${eventIdx + 1}.${idx + 1} Search Query: ${query.query}\n${query.results.length} results`;
  const results = query.results.map((result, resultIdx) => formatResult(result, resultIdx)).join("\n");
  return results ? `${header}\n${results}` : header;
};

const formatEvent = (summaryEvent: SummaryEvent, idx: number): string => {
  const header = `Search Event #${idx + 1}\n${new Date(summaryEvent.timestamp).toLocaleString()}\n${"=".repeat(80)}`;
  const queries = summaryEvent.queries.map((query, queryIdx) => formatQuery(idx, query, queryIdx)).join("\n");
  return `${header}\n${queries}`;
};

const buildSummaryText = (events: SearchEvent[]): string => {
  const summaries = events.flatMap((event) => parseSummaryFromJson(event.rawResponse));
  return summaries.map((summary, idx) => formatEvent(summary, idx)).join(`\n\n${"=".repeat(80)}\n\n`);
};

const buildTocText = (events: SearchEvent[]): string => {
  const summaries = events.flatMap((event) => parseSummaryFromJson(event.rawResponse));
  const lines = summaries.map((summary, idx) => {
    const resultsCount = summary.queries.reduce((sum, q) => sum + q.results.length, 0);
    const header = `Event #${idx + 1} (${summary.queries.length} queries, ${resultsCount} results)`;
    const queries = summary.queries.map((query, qIdx) => `${idx + 1}.${qIdx + 1} ${query.query} (${query.results.length})`).join("\n");
    return `${header}\n${queries}`;
  });
  return `Table of Contents\n${lines.join("\n")}`;
};

const buildStatsText = (events: SearchEvent[]): string => {
  const stats = buildStats(events);
  const queries = stats.queries.join(", ") || "none";
  const domains = stats.domains.join(", ") || "none";
  const urls = stats.urls.join(", ") || "none";
  return [
    "Stats",
    `- Search events: ${stats.events}`,
    `- Unique queries: ${stats.queries.length} (${queries})`,
    `- Unique domains: ${stats.domains.length} (${domains})`,
    `- Unique URLs: ${stats.urls.length} (${urls})`
  ].join("\n");
};

export const copyAllSummaries = async (events: SearchEvent[]): Promise<void> => {
  const memo = "# This report was created by AI Search Inspector by Franz Enzenhofer - www.franzai.com - Specialist for SEO, GEO and AI SEO in Vienna, Austria";
  const text = [
    buildStatsText(events),
    buildTocText(events),
    buildSummaryText(events),
    memo
  ].join("\n\n");
  await navigator.clipboard.writeText(text);
};
