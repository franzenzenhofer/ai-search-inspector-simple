import { buildStats, StatsSnapshot, UrlCount } from "../core/stats";
import { SearchEvent } from "../core/types";
import { byId, setHtml, escapeHtml } from "./dom";

const statsContainer = byId<HTMLDivElement>("stats-container");
let currentUrls: UrlCount[] = [];

export const getStatsUrls = (): UrlCount[] => currentUrls;

const formatStatsForCopy = (stats: StatsSnapshot): string => [
  `Search events: ${stats.events}`,
  `Unique queries: ${stats.queries.length}`,
  ...stats.queries.map((q) => `  - ${q}`),
  `Unique domains: ${stats.domains.length}`,
  ...stats.domains.map((d) => `  - ${d}`),
  `Unique URLs: ${stats.urls.length}`,
  ...stats.urls.map((u) => `  - ${u.url} (${u.count}x)`)
].join("\n");

const renderHeader = (copyPayload: string): string =>
  `<div class="stats-header"><span class="stats-title">Stats</span><button class="copy-btn" data-copy-text="${escapeHtml(copyPayload)}">Copy</button></div>`;

const statItemWithBadge = (label: string, count: number): string =>
  `<div class="stat-item"><span class="stat-label">${label} <span class="stat-count">${count}</span></span></div>`;

const renderQueries = (queries: string[]): string => {
  if (!queries.length) return statItemWithBadge("Unique queries", 0);
  const list = queries.map((q) => `<span class="stat-query">${escapeHtml(q)}</span>`).join("");
  return `<div class="stat-item stat-item-block"><span class="stat-label">Unique queries <span class="stat-count">${queries.length}</span></span><div class="stat-queries">${list}</div></div>`;
};

const extractDomainName = (domainWithCount: string): string => {
  const match = domainWithCount.match(/^(.+) \(\d+x\)$/);
  return match ? match[1] : domainWithCount;
};

const renderDomains = (domains: string[]): string => {
  if (!domains.length) return statItemWithBadge("Unique domains", 0);
  const list = domains.map((d) => `<span class="stat-domain" data-domain="${escapeHtml(extractDomainName(d))}">${escapeHtml(d)}</span>`).join("");
  return `<div class="stat-item stat-item-block"><span class="stat-label">Unique domains <span class="stat-count">${domains.length}</span></span><div class="stat-domains">${list}</div></div>`;
};

const renderUrlItem = (u: UrlCount): string =>
  `<li class="stat-url-item"><a href="${escapeHtml(u.url)}" target="_blank" rel="noopener noreferrer" class="stat-url">${escapeHtml(u.url)}</a> <span class="stat-url-count">(${u.count}x)</span></li>`;

const renderUrls = (urls: UrlCount[]): string => {
  if (!urls.length) return statItemWithBadge("Unique URLs", 0);
  const allUrls = urls.map((u) => u.url).join("\n");
  const list = urls.map(renderUrlItem).join("");
  return `<div class="stat-item stat-item-block"><span class="stat-label">Unique URLs <span class="stat-count">${urls.length}</span><button class="stat-toggle" data-toggle-target="urls-list">Hide</button><button class="stat-open-all" data-urls="${escapeHtml(allUrls)}">Open All</button></span><ul id="urls-list" class="stat-urls">${list}</ul></div>`;
};

const buildStatsHtml = (stats: StatsSnapshot): string =>
  `${renderHeader(formatStatsForCopy(stats))}${statItemWithBadge("Search events", stats.events)}${renderQueries(stats.queries)}${renderDomains(stats.domains)}${renderUrls(stats.urls)}`;

export const renderStats = (events: SearchEvent[]): void => {
  if (!events.length) { currentUrls = []; setHtml(statsContainer, ""); statsContainer.classList.add("hidden"); return; }
  statsContainer.classList.remove("hidden");
  const stats = buildStats(events);
  currentUrls = stats.urls;
  setHtml(statsContainer, buildStatsHtml(stats));
};
