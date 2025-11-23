import { LogEntry, SearchEvent } from "../core/types";
import { parseSummaryFromJson, SummaryEvent, SummaryResult, SummaryQuery } from "../core/parseSummary";

const structuredContainer = document.getElementById("structured-container") as HTMLDivElement;
const rawContainer = document.getElementById("raw-container") as HTMLDivElement;
const tocContainer = document.getElementById("toc-container") as HTMLDivElement;
const onClick = (id: string, handler: () => void): void => document.getElementById(id)?.addEventListener("click", handler);

const formatJson = (text: string): string => { try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return text; } };
const copyText = async (text: string, btn: HTMLElement): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    const orig = btn.textContent;
    btn.textContent = "✓ Copied";
    setTimeout(() => { btn.textContent = orig; }, 1500);
  } catch (err) {
    console.error("Failed to copy:", err);
    btn.textContent = "✗ Failed";
    setTimeout(() => { btn.textContent = btn.getAttribute("data-original-text") || "Copy"; }, 1500);
  }
};

/**
 * Format a date timestamp
 */
const formatDate = (timestamp?: number | null): string => {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleDateString();
};

/**
 * Render a single search result with full details
 */
const renderResult = (result: SummaryResult, resultIdx: number, eventIdx: number): string => {
  const resultId = `${eventIdx}-${resultIdx}`;
  const resultText = `${result.title}\n${result.url}${result.snippet ? "\n" + result.snippet : ""}`;
  // Escape HTML entities
  const escapeHtml = (text: string): string => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  return `
    <div class="result-item">
      <div class="result-number">${resultIdx + 1}</div>
      <div class="result-content">
        <div class="result-title">
          <a href="${escapeHtml(result.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(result.title)}</a>
          <button class="copy-btn-sm" data-copy-text="${escapeHtml(resultText)}" title="Copy result">Copy</button>
        </div>
        <div class="result-url">${escapeHtml(result.url)}</div>
        ${result.snippet ? `<div class="result-snippet">${escapeHtml(result.snippet)}</div>` : ""}
        <div class="result-metadata">
          ${result.attribution ? `<span class="meta-item">Source: ${escapeHtml(result.attribution)}</span>` : ""}
          ${result.pub_date ? `<span class="meta-item">Published: ${formatDate(result.pub_date)}</span>` : ""}
          ${result.ref_id ? `<span class="meta-item">Ref: ${escapeHtml(JSON.stringify(result.ref_id))}</span>` : ""}
        </div>
        <div class="result-actions">
          <button class="toggle-btn" data-toggle-id="${resultId}">▶ Show Raw JSON</button>
        </div>
        <div id="raw-json-${resultId}" class="result-raw-json hidden">
          <pre>${escapeHtml(result.rawJson)}</pre>
        </div>
      </div>
    </div>
  `;
};

/**
 * Render a single query subsection with its results
 */
const renderSummaryQuery = (summaryQuery: SummaryQuery, queryIdx: number, eventIdx: number): string => {
  const encodedQuery = encodeURIComponent(summaryQuery.query);
  const queryId = `query-${eventIdx}-${queryIdx}`;

  return `
    <div class="query-section" id="${queryId}">
      <div class="query-header">
        <strong>${eventIdx + 1}.${queryIdx + 1} Search Query:</strong> ${summaryQuery.query}
        <a href="https://www.google.com/search?q=${encodedQuery}" target="_blank" rel="noopener noreferrer" class="search-btn">Google</a>
        <a href="https://www.bing.com/search?q=${encodedQuery}" target="_blank" rel="noopener noreferrer" class="search-btn">Bing</a>
      </div>
      <div class="query-results">
        ${summaryQuery.results.map((result, idx) => renderResult(result, idx, `${eventIdx}-${queryIdx}`)).join("")}
      </div>
    </div>
  `;
};

/**
 * Render a summary event card with all queries and their results
 */
const renderSummaryEvent = (summaryEvent: SummaryEvent, eventIdx: number, totalEvents: number): string => {
  const timestamp = new Date(summaryEvent.timestamp).toLocaleString();
  const totalResults = summaryEvent.queries.reduce((sum, q) => sum + q.results.length, 0);
  const eventId = `event-${eventIdx}`;

  return `
    <div class="event-card" id="${eventId}">
      <div class="event-header">
        <strong>Search Event #${eventIdx + 1}</strong>
        <span class="event-meta">(${summaryEvent.queries.length} ${summaryEvent.queries.length === 1 ? 'query' : 'queries'}, ${totalResults} results, ${timestamp})</span>
      </div>
      ${summaryEvent.queries.map((query, idx) => renderSummaryQuery(query, idx, eventIdx)).join("")}
    </div>
  `;
};

/**
 * Render table of contents with jump links
 */
const renderTableOfContents = (allSummaryEvents: SummaryEvent[]): void => {
  if (!allSummaryEvents.length) {
    tocContainer.innerHTML = "";
    return;
  }

  // Calculate total queries and results
  const totalQueries = allSummaryEvents.reduce((sum, event) => sum + event.queries.length, 0);
  const totalResults = allSummaryEvents.reduce((sum, event) =>
    sum + event.queries.reduce((qSum, q) => qSum + q.results.length, 0), 0);

  const tocHtml = `
    <div class="toc-title">Table of Contents (${totalQueries} ${totalQueries === 1 ? 'query' : 'queries'}, ${totalResults} results)</div>
    ${allSummaryEvents.map((summaryEvent, eventIdx) => {
      const eventResults = summaryEvent.queries.reduce((sum, q) => sum + q.results.length, 0);
      const queriesHtml = summaryEvent.queries.map((query, queryIdx) => {
        return `<a href="#query-${eventIdx}-${queryIdx}" class="toc-query-link">${eventIdx + 1}.${queryIdx + 1} ${query.query} (${query.results.length})</a>`;
      }).join("");

      return `
        <div class="toc-event">
          <a href="#event-${eventIdx}" class="toc-event-link">Event #${eventIdx + 1} (${summaryEvent.queries.length} ${summaryEvent.queries.length === 1 ? 'query' : 'queries'}, ${eventResults} results)</a>
          <div class="toc-queries">${queriesHtml}</div>
        </div>
      `;
    }).join("")}
    <div class="toc-event">
      <a href="#full-json" class="toc-event-link">Full JSON</a>
    </div>
  `;

  tocContainer.innerHTML = tocHtml;
};

/**
 * Render the structured view from search events
 */
const renderStructuredView = (events: SearchEvent[]): void => {
  if (!events.length) {
    structuredContainer.innerHTML = "";
    tocContainer.innerHTML = "";
    return;
  }

  // Parse all events to extract structured data
  const allSummaryEvents: SummaryEvent[] = [];
  events.forEach((event) => {
    const summaryEvents = parseSummaryFromJson(event.rawResponse);
    allSummaryEvents.push(...summaryEvents);
  });

  if (!allSummaryEvents.length) {
    structuredContainer.innerHTML = `<div class="no-data">No structured data available</div>`;
    tocContainer.innerHTML = "";
    return;
  }

  // Render table of contents
  renderTableOfContents(allSummaryEvents);

  // Render structured events
  structuredContainer.innerHTML = allSummaryEvents
    .map((summaryEvent, idx) => renderSummaryEvent(summaryEvent, idx, allSummaryEvents.length))
    .join("");
};

const renderRawResponses = (events: SearchEvent[]): void => {
  if (!events.length) {
    rawContainer.innerHTML = "";
    return;
  }

  const escapeHtml = (text: string): string => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const itemsHtml = events.map((e, idx) => {
    const jsonContent = e.rawResponse || "No response data";
    const formattedJson = formatJson(jsonContent);

    return `
      <div class="raw-item">
        <div class="raw-header">
          Response #${idx + 1} - ${escapeHtml(e.query)} (${jsonContent.length} bytes)
          <button class="copy-btn" data-copy-text="${escapeHtml(jsonContent)}">Copy JSON</button>
        </div>
        <div class="raw-response">
          <pre>${escapeHtml(formattedJson)}</pre>
        </div>
      </div>
    `;
  }).join("");

  rawContainer.innerHTML = `
    <h2 id="full-json" style="margin:0 0 16px; font-size:14px; font-weight:700; color:#2563eb;">Full JSON</h2>
    ${itemsHtml}
  `;
};

const applyState = (events: SearchEvent[], _logs: LogEntry[]): void => {
  renderStructuredView(events);
  renderRawResponses(events);
};

const requestState = async (): Promise<void> =>
  applyState(...Object.values((await chrome.runtime.sendMessage({ type: "get-state" })) as { events: SearchEvent[]; logs: LogEntry[] }) as [SearchEvent[], LogEntry[]]);

/**
 * Set up event delegation for dynamically rendered buttons
 */
const setupEventDelegation = (): void => {
  // Handle copy buttons (both copy-btn-sm and copy-btn)
  document.body.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    // Handle copy buttons with data-copy-text attribute
    if (target.classList.contains("copy-btn-sm") || target.classList.contains("copy-btn")) {
      const copyText = target.getAttribute("data-copy-text");
      if (copyText) {
        void navigator.clipboard.writeText(copyText).then(() => {
          const orig = target.textContent;
          target.textContent = "✓ Copied";
          setTimeout(() => { target.textContent = orig; }, 1500);
        }).catch((err) => {
          console.error("Failed to copy:", err);
          target.textContent = "✗ Failed";
          setTimeout(() => { target.textContent = "Copy"; }, 1500);
        });
      }
    }

    // Handle toggle buttons with data-toggle-id attribute
    if (target.classList.contains("toggle-btn")) {
      const toggleId = target.getAttribute("data-toggle-id");
      if (toggleId) {
        const element = document.getElementById(`raw-json-${toggleId}`);
        if (element) {
          const isHidden = element.classList.contains("hidden");
          element.classList.toggle("hidden");
          target.textContent = isHidden ? "▼ Hide Raw JSON" : "▶ Show Raw JSON";
        }
      }
    }
  });
};

const wireControls = (): void => {
  onClick("clear-data", () => {
    if (confirm("Are you sure you want to clear all collected data? This cannot be undone.")) {
      chrome.runtime.sendMessage({ type: "clear-all-data" }).then(() => {
        window.location.reload();
      });
    }
  });

  onClick("hard-reload", () => {
    // Automatically clear data before reload to collect fresh data
    void chrome.runtime.sendMessage({ type: "clear-all-data" });
    void chrome.runtime.sendMessage({ type: "reload-detection" });
    setTimeout(() => {
      window.location.reload();
    }, 100);
  });

  onClick("copy-all", () => {
    chrome.runtime.sendMessage({ type: "get-state" }).then((response) => {
      const { events } = response as { events: SearchEvent[] };

      // Parse all events and format as text
      const allSummaryEvents: SummaryEvent[] = [];
      events.forEach((event) => {
        const summaryEvents = parseSummaryFromJson(event.rawResponse);
        allSummaryEvents.push(...summaryEvents);
      });

      const structuredText = allSummaryEvents.map((summaryEvent, eventIdx) => {
        const eventHeader = `Search Event #${eventIdx + 1}\n${new Date(summaryEvent.timestamp).toLocaleString()}\n${"=".repeat(80)}`;

        const queriesText = summaryEvent.queries.map((query, queryIdx) => {
          const queryHeader = `\n${eventIdx + 1}.${queryIdx + 1} Search Query: ${query.query}\n${query.results.length} results`;

          const resultsText = query.results.map((result, resultIdx) => {
            const parts = [
              `\n${resultIdx + 1}. ${result.title}`,
              `   URL: ${result.url}`
            ];

            if (result.snippet) {
              parts.push(`   Snippet: ${result.snippet}`);
            }

            if (result.attribution) {
              parts.push(`   Source: ${result.attribution}`);
            }

            if (result.pub_date) {
              parts.push(`   Published: ${formatDate(result.pub_date)}`);
            }

            return parts.join("\n");
          }).join("\n");

          return `${queryHeader}${resultsText}`;
        }).join("\n");

        return `${eventHeader}${queriesText}`;
      }).join("\n\n" + "=".repeat(80) + "\n\n");

      navigator.clipboard.writeText(structuredText).then(() => {
        const btn = document.getElementById("copy-all");
        if (btn) {
          const orig = btn.textContent;
          btn.textContent = "✓ Copied All";
          setTimeout(() => { btn.textContent = orig; }, 1500);
        }
      });
    });
  });
};

setupEventDelegation();
wireControls();
void requestState();
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "state-updated")
    applyState(message.events as SearchEvent[], message.logs as LogEntry[]);
});
