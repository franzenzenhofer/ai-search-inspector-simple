import { parseSummaryFromJson, SummaryEvent, SummaryQuery, SummaryResult } from "../core/parseSummary";
import { SearchEvent } from "../core/types";
import { byId, escapeHtml, formatDate, setHtml } from "./dom";

const structuredContainer = byId<HTMLDivElement>("structured-container");
const tocContainer = byId<HTMLDivElement>("toc-container");

const isNoQuery = (q: string): boolean => q.toLowerCase().includes("no search query identified");
const countReal = (qs: SummaryQuery[]): number => qs.filter((q) => !isNoQuery(q.query)).length;
const sumResults = (qs: SummaryQuery[]): number => qs.reduce((s, q) => s + q.results.length, 0);

const renderResult = (r: SummaryResult, ids: { e: number; q: number; r: number }): string => {
  const copy = `${r.title}\n${r.url}${r.snippet ? `\n${r.snippet}` : ""}`, tid = `raw-${ids.e}-${ids.q}-${ids.r}`;
  const meta = [r.attribution ? `<span class="meta-item">Source: ${escapeHtml(r.attribution)}</span>` : "", r.pub_date ? `<span class="meta-item">Published: ${formatDate(r.pub_date)}</span>` : ""].join("");
  return `<div class="result-item"><div class="result-number">${ids.r + 1}</div><div class="result-content"><div class="result-title"><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.title)}</a><button class="copy-btn-sm" data-copy-text="${escapeHtml(copy)}">Copy</button></div><div class="result-url url-copy" data-copy-text="${escapeHtml(r.url)}">${escapeHtml(r.url)}</div>${r.snippet ? `<div class="result-snippet">${escapeHtml(r.snippet)}</div>` : ""}<div class="result-metadata">${meta}</div><div class="result-actions"><button class="toggle-btn" data-toggle-id="${tid}">▶ Show Raw JSON</button></div><div id="${tid}" class="result-raw-json hidden"><pre>${escapeHtml(r.rawJson)}</pre></div></div></div>`;
};

const searchLinks = (q: string): string => isNoQuery(q) ? "" : `<a href="https://www.google.com/search?q=${encodeURIComponent(q)}" target="_blank" rel="noopener noreferrer" class="search-btn">Google</a><a href="https://www.bing.com/search?q=${encodeURIComponent(q)}" target="_blank" rel="noopener noreferrer" class="search-btn">Bing</a>`;

const renderQuery = (q: SummaryQuery, ei: number, qi: number): string => {
  const results = q.results.map((r, ri) => renderResult(r, { e: ei, q: qi, r: ri })).join("");
  return `<div class="query-section" id="query-${ei}-${qi}"><div class="query-header"><strong>${ei + 1}.${qi + 1} Search Query:</strong> ${q.query}${searchLinks(q.query)}</div><div class="query-results">${results}</div></div>`;
};

const eventMeta = (real: number, total: number, ts: string): string => real === 0 ? `${total} results · ${ts}` : `${real} ${real === 1 ? "query" : "queries"} · ${total} results · ${ts}`;

const renderEvent = (ev: SummaryEvent, idx: number): string => {
  const total = sumResults(ev.queries), real = countReal(ev.queries), ts = new Date(ev.timestamp).toLocaleString();
  return `<div class="event-card" id="event-${idx}"><div class="event-header"><strong>Search Event #${idx + 1}</strong><span class="event-meta">${eventMeta(real, total, ts)}</span></div>${ev.queries.map((q, qi) => renderQuery(q, idx, qi)).join("")}</div>`;
};

const tocLink = (ei: number, real: number, total: number): string => real === 0 ? `Event #${ei + 1} (${total} results)` : `Event #${ei + 1} (${real} ${real === 1 ? "query" : "queries"}, ${total} results)`;

const renderTocEvent = (ev: SummaryEvent, ei: number): string => {
  const total = sumResults(ev.queries), real = countReal(ev.queries);
  const qs = ev.queries.map((q, qi) => `<a href="#query-${ei}-${qi}" class="toc-query-link">${ei + 1}.${qi + 1} ${q.query} (${q.results.length})</a>`).join("");
  return `<div class="toc-event"><a href="#event-${ei}" class="toc-event-link">${tocLink(ei, real, total)}</a><div class="toc-queries">${qs}</div></div>`;
};

const renderToc = (evs: SummaryEvent[]): void => {
  if (!evs.length) { setHtml(tocContainer, ""); return; }
  const totalQ = evs.reduce((s, e) => s + countReal(e.queries), 0), totalR = evs.reduce((s, e) => s + sumResults(e.queries), 0);
  const qPart = totalQ > 0 ? `${totalQ} ${totalQ === 1 ? "query" : "queries"}, ` : "";
  setHtml(tocContainer, `<div class="toc-title">Table of Contents (${qPart}${totalR} results)</div>${evs.map(renderTocEvent).join("")}<div class="toc-event"><a href="#full-json" class="toc-event-link">Full JSON</a></div>`);
};

export const renderStructured = (events: SearchEvent[]): void => {
  if (!events.length) { setHtml(structuredContainer, ""); setHtml(tocContainer, ""); return; }
  const all = events.flatMap((e) => parseSummaryFromJson(e.rawResponse));
  if (!all.length) { setHtml(structuredContainer, `<div class="no-data">No search data found. Reload the ChatGPT tab to re-arm detection.</div>`); setHtml(tocContainer, ""); return; }
  renderToc(all);
  setHtml(structuredContainer, all.map(renderEvent).join(""));
};
