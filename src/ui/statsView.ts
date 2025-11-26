import { buildStats, StatsSnapshot } from "../core/stats";
import { SearchEvent } from "../core/types";
import { byId, setHtml, escapeHtml } from "./dom";

const statsContainer = byId<HTMLDivElement>("stats-container");

const formatStatsForCopy = (stats: StatsSnapshot): string => [
  `Search events: ${stats.events}`,
  `Unique queries: ${stats.queries.length}`,
  ...stats.queries.map((q) => `  - ${q}`),
  `Unique domains: ${stats.domains.length}`,
  ...stats.domains.map((d) => `  - ${d}`),
  `Unique URLs: ${stats.urls.length}`,
  ...stats.urls.map((u) => `  - ${u}`)
].join("\n");

const renderHeader = (copyPayload: string): string =>
  `<div class="stats-header"><span class="stats-title">Stats</span><button class="copy-btn" data-copy-text="${escapeHtml(copyPayload)}">Copy</button></div>`;

const statItem = (label: string, value: string): string =>
  `<div class="stat-item"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`;

const renderQueries = (queries: string[]): string => {
  if (!queries.length) return statItem("Unique queries", "0");
  const list = queries.map((q) => `<span class="stat-query">${escapeHtml(q)}</span>`).join("");
  return `<div class="stat-item stat-item-block"><span class="stat-label">Unique queries <span class="stat-count">${queries.length}</span></span><div class="stat-queries">${list}</div></div>`;
};

const renderDomains = (domains: string[]): string => {
  if (!domains.length) return statItem("Unique domains", "0");
  const list = domains.map((d) => `<span class="stat-domain">${escapeHtml(d)}</span>`).join("");
  return `<div class="stat-item stat-item-block"><span class="stat-label">Unique domains <span class="stat-count">${domains.length}</span></span><div class="stat-domains">${list}</div></div>`;
};

const renderUrls = (urls: string[]): string => {
  if (!urls.length) return statItem("Unique URLs", "0");
  const list = urls.map((u) => `<a href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer" class="stat-url">${escapeHtml(u)}</a>`).join("");
  return `<div class="stat-item stat-item-block"><span class="stat-label">Unique URLs <span class="stat-count">${urls.length}</span><button class="stat-toggle" data-toggle-target="urls-list">Show</button></span><div id="urls-list" class="stat-urls hidden">${list}</div></div>`;
};

const buildStatsHtml = (stats: StatsSnapshot): string =>
  `${renderHeader(formatStatsForCopy(stats))}${statItem("Search events", `${stats.events}`)}${renderQueries(stats.queries)}${renderDomains(stats.domains)}${renderUrls(stats.urls)}`;

export const renderStats = (events: SearchEvent[]): void => {
  if (!events.length) { setHtml(statsContainer, ""); statsContainer.classList.add("hidden"); return; }
  statsContainer.classList.remove("hidden");
  setHtml(statsContainer, buildStatsHtml(buildStats(events)));
};
